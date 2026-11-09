#!/usr/bin/env python3
"""Level music + sfx stems: music ~-27.5 LUFS, sfx ~-26 LUFS, sum -> -24 LUFS integrated, true peak <= -1 dBTP.
Writes out/muzik.wav, out/efekt.wav (24-bit, same gains as the mix) and work/mix.wav (their exact sum)."""
import numpy as np, subprocess, re, struct
SR = 48000
def read(p):
    b = open(p, 'rb').read(); i = b.index(b'data') + 8; return np.frombuffer(b[i:], np.float32).reshape(-1, 2).astype(np.float64)
def write24(p, x):
    x = np.clip(x, -1, 1); q = (x * 8388607).astype(np.int32).reshape(-1); by = np.zeros((q.size, 3), np.uint8)
    by[:, 0] = q & 255; by[:, 1] = (q >> 8) & 255; by[:, 2] = (q >> 16) & 255; d = by.tobytes()
    with open(p, 'wb') as f: f.write(b'RIFF' + struct.pack('<I', 36 + len(d)) + b'WAVEfmt ' + struct.pack('<IHHIIHH', 16, 1, 2, SR, SR * 6, 6, 24) + b'data' + struct.pack('<I', len(d)) + d)
def meas(x):
    tmp = '/tmp/claude-0/_m.wav'; write24(tmp, x / max(1, np.abs(x).max()) if False else x)
    o = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1]); TP = float(re.findall(r'Peak:\s+(-?[\d.inf]+) dBFS', o)[-1]); return I, TP
m, s = read('work/music_raw.wav'), read('work/sfx_raw.wav')
pk = max(np.abs(m).max(), np.abs(s).max(), 1); m /= pk * 1.2; s /= pk * 1.2   # keep the meter in range
Im, _ = meas(m); Is, _ = meas(s)
gm, gs = 10 ** ((-27.5 - Im) / 20), 10 ** ((-26.0 - Is) / 20)
for it in range(3):
    I, TP = meas(m * gm + s * gs); k = 10 ** ((-24.0 - I) / 20); gm *= k; gs *= k
I, TP = meas(m * gm + s * gs); print('pre-limit  I=%.2f LUFS  TP=%.2f dBTP' % (I, TP))
from numpy.lib.stride_tricks import sliding_window_view as sw
for rnd in range(6):
    I, TP = meas(m * gm + s * gs)
    if TP <= -1.1: break
    mix = m * gm + s * gs; lim = 10 ** ((-1.8 - 0.4 * rnd) / 20); a = np.abs(mix).max(axis=1)
    graw = np.minimum(1, lim / np.maximum(a, 1e-9)); w = int(0.006 * SR)
    gmin = sw(np.pad(graw, (w, w), 'edge'), 2 * w + 1).min(axis=1)
    k = np.hanning(w) / np.hanning(w).sum(); g = np.convolve(np.pad(gmin, (w, w), 'edge'), k, 'same')[w:-w]
    m = m * gm * g[:, None]; s = s * gs * g[:, None]; gm = gs = 1
    I2, _ = meas(m + s); c = 10 ** ((-24.0 - I2) / 20); m *= c; s *= c
mm, ss = m * gm, s * gs; mix = mm + ss
I, TP = meas(mix); print('final      I=%.2f LUFS  TP=%.2f dBTP' % (I, TP))
print('music I=%.2f  sfx I=%.2f' % (meas(mm)[0], meas(ss)[0]))
write24('out/muzik.wav', mm); write24('out/efekt.wav', ss); write24('work/mix.wav', mix)
