"""Slow automatic leveling of the voice-over: equal average speech loudness everywhere (gain only, no time change)."""
import numpy as np, wave
from scipy.ndimage import uniform_filter1d
sr = 48000; HOP = 4800  # 100 ms
w = wave.open('voice.wav'); V = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
n = len(V) // HOP; e = np.sqrt((V[:n * HOP].reshape(n, HOP) ** 2).mean(1)); d = 20 * np.log10(e + 1e-9)
sp = d > -42
TARGET = -21.0
# speech level smoothed over ~6 s of speech (pauses do not pull it down)
num = uniform_filter1d(np.where(sp, 10 ** (d / 10), 0), 60, mode='nearest'); den = uniform_filter1d(sp.astype(float), 60, mode='nearest')
lvl = 10 * np.log10(num / np.maximum(den, 1e-6) + 1e-12)
lvl = np.where(den > .05, lvl, np.nan)
idx = np.arange(n); ok = ~np.isnan(lvl); lvl = np.interp(idx, idx[ok], lvl[ok])
g = np.clip(TARGET - lvl, -6, 18)
g = uniform_filter1d(g, 30, mode='nearest')          # ~3 s gain smoothing
gs = np.interp(np.arange(len(V)) / HOP, idx + .5, g)   # per sample
out = V * 10 ** (gs / 20)
pk = np.abs(out).max(); print('gain range dB', round(g.min(), 1), round(g.max(), 1), 'peak', round(20 * np.log10(pk), 1))
if pk > .97: out *= .97 / pk
w2 = wave.open('voice_leveled.wav', 'wb'); w2.setnchannels(1); w2.setsampwidth(2); w2.setframerate(sr); w2.writeframes((out * 32767).astype(np.int16).tobytes()); w2.close()
e2 = np.sqrt((out[:n * HOP].reshape(n, HOP) ** 2).mean(1)); d2 = 20 * np.log10(e2 + 1e-9)
for t0 in range(0, 792, 40):
    s = d2[t0 * 10:(t0 + 40) * 10]; m = s[s > -40]; print(f"{t0:4d}s {np.mean(m):6.1f}", end=' | ' if (t0 // 40) % 5 != 4 else '\n')
