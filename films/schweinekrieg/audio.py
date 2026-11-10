"""Der Schweinekrieg: synthesized comic-military music bed + SFX, mixed UNDER the user's voice.mp3 (voice untouched).
Music sits ~21 dB below the speech and ducks wherever the voice is active.  python3 audio.py -> mix_raw.wav"""
import numpy as np, subprocess, wave
from scipy.signal import butter, lfilter, sosfilt

SR = 48000
TOTAL_F = 1447
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30.0                      # frame -> seconds
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def lp(x, fc, o=2): return sosfilt(butter(o, min(fc, SR * 0.45), 'low', fs=SR, output='sos'), x).astype(np.float32)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x).astype(np.float32)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'), x).astype(np.float32)
def adsr(n, a=0.01, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR; T = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return (e * np.clip((T - t) / max(r, 1e-4), 0, 1)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if 0 <= i < len(buf) and j > i: buf[i:j] += sig[: j - i] * gain
def osc_saw(freq, d, vib=0.0, vr=5.0, harm=12, roll=1.0):
    t = tt(d); ph = 2 * np.pi * freq * t + vib * np.sin(2 * np.pi * vr * t) * (freq / 200)
    return sum(np.sin((k + 1) * ph) / (k + 1) ** roll for k in range(harm)).astype(np.float32)
def norm(x): m = np.max(np.abs(x)) + 1e-9; return (x / m).astype(np.float32)

# ---------------- instruments ----------------
def brass(m, d, bright=2200, vib=0.4):
    f = midi(m); s = osc_saw(f, d, vib=vib, harm=10, roll=1.2); s = lp(s, bright) * adsr(len(s), 0.05, 0.1, 0.8, 0.12); return norm(s) * 0.6
def tuba(m, d): s = osc_saw(midi(m), d, harm=6, roll=1.4); return norm(lp(s, 500) * adsr(len(s), 0.02, 0.08, 0.6, 0.06)) * 0.8
def fife(m, d):
    f = midi(m); t = tt(d); s = np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 6 * t)) + 0.18 * np.sin(4 * np.pi * f * t) + 0.04 * noise(d)
    return (s * adsr(len(t), 0.02, 0.05, 0.85, 0.05)).astype(np.float32) * 0.5
def pluck(m, d=0.35, bright=0.6):  # pizzicato-like Karplus-Strong
    f = midi(m); n = int(d * SR); L = max(2, int(SR / f)); buf = rng.uniform(-1, 1, L).astype(np.float32); out = np.zeros(n, np.float32)
    for i in range(n): out[i] = buf[i % L]; buf[i % L] = 0.5 * (buf[i % L] + buf[(i + 1) % L]) * (0.985 + 0.01 * bright)
    return lp(out, 3000) * adsr(n, 0.002, 0.05, 0.6, 0.08)
def harp(m, d=1.4):
    f = midi(m); t = tt(d); s = sum(np.sin(2 * np.pi * f * (k + 1) * t) * np.exp(-t * (2.5 + k * 1.5)) / (k + 1) ** 1.5 for k in range(5))
    return (s * np.minimum(1, t / 0.004)).astype(np.float32) * 0.6
def strings(ms, d):
    s = sum(osc_saw(midi(m) * (1 + dt), d, vib=0.6, vr=5.2, harm=9, roll=1.1) for m in ms for dt in (-0.003, 0.003))
    return norm(lp(s, 2400)) * adsr(int(d * SR), 0.35, 0.2, 0.85, 0.5) * 0.5
def reed(m, d):  # clarinet/bassoon-ish (odd harmonics)
    f = midi(m); t = tt(d); ph = 2 * np.pi * f * t + 0.25 * np.sin(2 * np.pi * 4.5 * t)
    s = sum(np.sin((2 * k + 1) * ph) / (2 * k + 1) for k in range(6)); return norm(lp(s, 1600)) * adsr(len(t), 0.04, 0.1, 0.8, 0.12) * 0.55
def snare(d=0.16):
    t = tt(d); s = noise(d) * np.exp(-t * 26) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4; return hp(s, 250)
def roll(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 22)): place_local(out, snare(0.08) * (0.5 + 0.5 * k / max(1, d * 22)), k / 22)
    return out
def place_local(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * g
def kick(d=0.3): t = tt(d); return (np.sin(2 * np.pi * np.cumsum(50 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)).astype(np.float32)
def timp(m, d=1.2): t = tt(d); f = midi(m); return (np.sin(2 * np.pi * f * t * (1 + 0.04 * np.exp(-t * 8))) * np.exp(-t * 2.2) + lp(noise(d), 300) * np.exp(-t * 20) * 0.6).astype(np.float32)
def cymbal(d=1.2): t = tt(d); return (hp(noise(d), 5000) * np.exp(-t * 3)).astype(np.float32) * 0.5
def glock(m, d=0.6): t = tt(d); f = midi(m); return ((np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 6)).astype(np.float32) * 0.5

music = np.zeros(N, np.float32)
BPM = 110; beat = 60 / BPM
# 1) big dramatic march chord (0 - 1.87 s): brass tutti + timpani + snare roll, cut dead at the cut
for m in (46, 53, 58, 62, 65): place(music, brass(m, 1.75, 2600), 0.02, 0.32)
place(music, timp(34, 1.8), 0.02, 0.9); place(music, roll(1.6), 0.15, 0.35); place(music, cymbal(1.5), 0.02, 0.5)
music[int(1.86 * SR):int(1.9 * SR)] *= np.linspace(1, 0, int(1.9 * SR) - int(1.86 * SR))
# 2) the march stops; one cute harp glissando for the angel pig
for k, m in enumerate([72, 74, 76, 79, 81, 84, 86, 88, 91, 93]): place(music, harp(m, 1.2), 1.92 + k * 0.045, 0.5)
# 3-7) playful rural tune (fife + pizzicato + tuba oom-pah), 110 BPM, 3.75 - 13.2 s
mel = [72, 74, 76, 72, 79, 77, 76, 74, 72, 76, 79, 81, 79, 77, 76, 74]
prog = [(48, [60, 64, 67]), (53, [65, 69, 72]), (55, [62, 67, 71]), (48, [60, 64, 67])]
t0, i = 3.75, 0
while t0 < 13.15:
    bar = int((t0 - 3.75) / (4 * beat)); root, ch = prog[bar % 4]
    for b in range(4):
        tb = t0 + b * beat
        if tb >= 13.15: break
        place(music, tuba(root - 12 if b % 2 == 0 else root - 5, beat * 0.45), tb, 0.55)
        if b % 2: [place(music, pluck(m, 0.25), tb, 0.18) for m in ch]
        place(music, fife(mel[(i) % len(mel)], beat * 0.9), tb, 0.30); i += 1
        if b % 2 == 1: place(music, fife(mel[(i) % len(mel)], beat * 0.4), tb + beat * 0.5, 0.22)
    t0 += 4 * beat
for tday in (F(358), F(371), F(384)): place(music, glock(84, 0.5), tday, 0.5); place(music, timp(43, 0.5), tday, 0.4)   # a little hit for each "day"
# 8) music stops at the rifle; after the "pat" a short angel harp
for k, m in enumerate([79, 83, 86, 91, 95]): place(music, harp(m, 1.6), F(452) + k * 0.07, 0.42)
# 9-12) comic tension: minor pizzicato sneak 15.9 - 23.25 s
sneak = [57, 60, 64, 60, 57, 60, 63, 60, 55, 59, 62, 59, 57, 60, 64, 67]
t0, k = 15.9, 0
while t0 < 23.2:
    place(music, pluck(sneak[k % 16], 0.3, 0.3), t0, 0.5); place(music, pluck(sneak[k % 16] - 12, 0.3, 0.2), t0, 0.35)
    if k % 4 == 0: place(music, tuba(45, beat * 0.3), t0, 0.3)
    t0 += beat / 2 * (1 if k % 4 != 3 else 1.0); k += 1
place(music, brass(70, 0.25), F(549), 0.2)  # tiny sting on the flying hat
# 13-17) the march returns and grows with every sentence (23.27 - 30.23 s)
marchMel = [67, 72, 72, 74, 76, 74, 72, 71, 72, 74, 76, 79, 77, 76, 74, 72]
secs = [(23.27, 24.77, 1), (24.77, 25.97, 2), (25.97, 28.67, 3), (28.67, 30.2, 4)]
k = 0
for a, b, lvl in secs:
    t0 = a
    while t0 < b - 0.02:
        place(music, snare(), t0, 0.35 + 0.08 * lvl); place(music, snare(0.08), t0 + beat * 0.75, 0.18 + 0.04 * lvl)
        place(music, fife(marchMel[k % 16] + 12, beat * 0.85), t0, 0.2 + 0.03 * lvl)
        if lvl >= 2: place(music, tuba(48 if k % 2 == 0 else 43, beat * 0.45), t0, 0.5 + 0.05 * lvl); place(music, kick(), t0, 0.25 * lvl)
        if lvl >= 3: place(music, brass(marchMel[k % 16], beat * 0.9, 1800 + 300 * lvl), t0, 0.12 + 0.04 * lvl)
        if lvl >= 4 and k % 2 == 0: place(music, cymbal(0.4), t0, 0.25)
        t0 += beat; k += 1
music[int(30.2 * SR):int(30.25 * SR)] *= np.linspace(1, 0, int(30.25 * SR) - int(30.2 * SR)); music[int(30.25 * SR):int(30.6 * SR)] = 0
# 18-19) collapse into one wah-wah trombone
def wah(m, d, start=0.0):
    s = osc_saw(midi(m), d, vib=0.8, vr=5.5, harm=14, roll=1.0); t = tt(d)
    fc = 500 + 1600 * (0.5 + 0.5 * np.cos(2 * np.pi * 1.6 * t + start))
    out = np.zeros_like(s); seg = 1024
    for j in range(0, len(s), seg): out[j:j + seg] = lp(s[max(0, j - 2048):j + seg], fc[j])[-len(s[j:j + seg]):]
    return norm(out) * adsr(len(s), 0.05, 0.1, 0.85, 0.3) * 0.6
for j, (m, d) in enumerate([(58, 0.5), (57, 0.5), (56, 0.5), (55, 1.6)]): place(music, wah(m, d), 30.3 + j * 0.52, 0.45)
place(music, wah(50, 1.4), F(1047) + 0.02, 0.3)  # second, lower wah on the facepalm
# 20-22) lazy, long-breathed comic tune (36.2 - 41.05 s)
lazy = [(67, 1.0), (64, 0.5), (65, 0.5), (67, 1.5), (72, 0.5), (71, 1.0), (69, 0.5), (67, 1.5), (64, 1.0), (62, 1.0)]
t0 = 36.2
for m, d in lazy:
    if t0 > 41.0: break
    place(music, reed(m, d * beat * 1.6), t0, 0.35); t0 += d * beat * 1.6
t0 = 36.2
while t0 < 41.0: place(music, pluck(43, 0.4, 0.2), t0, 0.35); place(music, pluck(50, 0.4, 0.2), t0 + beat * 1.6, 0.25); t0 += beat * 3.2
# 23-24) pompous palace fanfare (41.07 - 44.95 s)
fan = [(60, 0.5), (64, 0.5), (67, 0.5), (72, 1.5), (67, 0.5), (72, 0.5), (76, 2.0), (74, 0.5), (72, 0.5), (79, 2.5)]
t0 = 41.1
for m, d in fan:
    place(music, brass(m, d * beat * 0.95, 3000), t0, 0.38); place(music, brass(m - 12, d * beat * 0.95, 1800), t0, 0.25); t0 += d * beat
for tb in np.arange(41.1, 44.95, beat * 2): place(music, timp(36, 0.8), tb, 0.6)
place(music, cymbal(1.5), F(1325), 0.6); place(music, timp(31, 1.5), F(1325), 0.9)
for m in (48, 55, 60, 64, 67): place(music, brass(m, 0.7, 3200), F(1325), 0.22)
# 25) sweet finale: harp + soft strings, ends on the pig's happy oink
place(music, strings([60, 64, 67, 72], 3.4), 44.98, 0.5)
for k, m in enumerate([72, 76, 79, 84, 79, 76, 81, 84, 88, 84, 91]): place(music, harp(m, 1.3), 45.0 + k * 0.27, 0.42)
place(music, harp(84, 2.2), 47.55, 0.5); place(music, harp(72, 2.2), 47.55, 0.4)
fade = int(0.25 * SR); music[-fade:] *= np.linspace(1, 0, fade)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def oink(d=0.32, f0=210, up=1.3):
    t = tt(d); f = f0 * (1 + (up - 1) * np.sin(np.pi * t / d)); ph = np.cumsum(f) / SR
    src = (2 * (ph % 1) - 1) + 0.25 * noise(d)                       # buzzy glottal source + breath
    s = bp(src, 450, 900) * 1.2 + bp(src, 1100, 1700) * 0.7 + bp(src, 2400, 3200) * 0.25
    return norm(s * np.sin(np.pi * t / d) ** 0.6) * 0.9
def grunt(d=0.4): return oink(d, 120, 1.1) * 0.6
def hmpf(d=0.28, f0=115):
    t = tt(d); ph = np.cumsum(f0 * (1.1 - 0.25 * t / d)) / SR; src = 2 * (ph % 1) - 1
    return norm(lp(src, 420) + bp(noise(d), 300, 1200) * 0.4) * np.exp(-t * 5) * np.minimum(1, t / 0.01) * 0.8
def tok(f0=150, d=0.22): t = tt(d); return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 28) + bp(noise(d), 800, 2600) * np.exp(-t * 60) * 0.7).astype(np.float32)
def thud(d=0.4): t = tt(d); return (np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t * 25)) / SR) * np.exp(-t * 10) + lp(noise(d), 500) * np.exp(-t * 15) * 0.6).astype(np.float32)
def pat():  # muffled cartoon "pat" (not a gunshot): soft low puff + dull thump
    d = 0.7; t = tt(d); return norm(lp(noise(d), 700) * np.exp(-t * 9) * np.minimum(1, t / 0.006) + thud(d) * 0.7) * 0.9
def scratch(d): t = tt(d); return (bp(noise(d), 1500, 5000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 7 * t) > 0.2)) * 0.35).astype(np.float32)
def puf(): d = 0.18; t = tt(d); return (lp(noise(d), 1400) * np.exp(-t * 22) + np.sin(2 * np.pi * 330 * t) * np.exp(-t * 30) * 0.3).astype(np.float32)
def vip(d=0.32, up=True):
    t = tt(d); f = (300 + 2200 * (t / d) ** 1.5) if up else (2500 - 2200 * (t / d)); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d)
    return (s * 0.5 + bp(noise(d), 1500, 6000) * np.sin(np.pi * t / d) * 0.25).astype(np.float32)
def growl(d=0.7): t = tt(d); ph = np.cumsum(85 + 10 * np.sin(2 * np.pi * 9 * t)) / SR; return norm(lp(2 * (ph % 1) - 1, 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)) * np.sin(np.pi * t / d)) * 0.6
def ting(): t = tt(1.4); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 3.5), (3136, 5), (4186, 7)]) * 0.32).astype(np.float32)
def flutter(d=1.0): t = tt(d); return (bp(noise(d), 400, 2500) * (np.sin(2 * np.pi * 16 * t) > 0) * np.exp(-t * 1.5) * 0.5).astype(np.float32)
def fiyuu(d=0.75): t = tt(d); f = 500 + 1500 * (t / d) ** 0.7; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.5 * 0.5).astype(np.float32)
def jingle(n=6, lo=3000, hi=6500):
    out = np.zeros(int(0.7 * SR), np.float32)
    for k in range(n):
        d = 0.35; t = tt(d); f = rng.uniform(lo, hi); s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.48 * t)) * np.exp(-t * 14)
        place_local(out, s.astype(np.float32) * rng.uniform(0.3, 0.7), rng.uniform(0, 0.3))
    return out
def gulp(): d = 0.3; t = tt(d); f = 320 * np.exp(-t * 4); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.7 + tok(900, 0.05)[:int(0.05 * SR)].sum() * 0).astype(np.float32)
def bugle_call():
    out = np.zeros(int(1.6 * SR), np.float32)
    for k, (m, d) in enumerate([(67, 0.18), (72, 0.18), (76, 0.18), (79, 0.5), (76, 0.18), (79, 0.6)]):
        place_local(out, brass(m, d, 3200, vib=0.2) * 0.8, sum(x[1] for x in [(67, 0.18), (72, 0.18), (76, 0.18), (79, 0.5), (76, 0.18), (79, 0.6)][:k]))
    return out
def step(): d = 0.12; t = tt(d); return (lp(noise(d), 900) * np.exp(-t * 40) + np.sin(2 * np.pi * 80 * t) * np.exp(-t * 35) * 0.6).astype(np.float32)
def rumble(d): t = tt(d); return (lp(noise(d), 160) * 2.2 * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3)).astype(np.float32)
def creak(d=0.6, f0=140):
    t = tt(d); rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d)); ph = np.cumsum(rate) / SR
    pulses = (np.mod(ph, 1) < 0.08).astype(np.float32); s = lp(pulses * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32)), 2200) * np.sin(np.pi * t / d)
    return hp(s, 150) * 2.2
def ship_whistle(d=1.3):
    t = tt(d); s = (np.sin(2 * np.pi * 330 * t) + 0.8 * np.sin(2 * np.pi * 415 * t) + 0.3 * np.sin(2 * np.pi * 660 * t)) * adsr(len(t), 0.12, 0.1, 0.9, 0.3)
    return (s * 0.3 + bp(noise(d), 300, 3000) * 0.15 * adsr(len(t), 0.05, 0.1, 0.9, 0.3)).astype(np.float32)
def crowd(d):
    out = np.zeros(int(d * SR), np.float32); t = tt(d)
    for k in range(14): v = bp(noise(d), rng.uniform(250, 500), rng.uniform(900, 1600)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(1.5, 4) * t + rng.uniform(0, 6))) ** 2; out += v
    return (norm(out) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4) * 0.5).astype(np.float32)
def click(): d = 0.12; t = tt(d); return (hp(noise(d), 2000) * np.exp(-t * 80) + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 60) * 0.4).astype(np.float32)
def sigh(d=1.2): t = tt(d); f = 1400 - 700 * t / d; return (bp(noise(d), 500, 1800) * np.sin(np.pi * t / d) ** 0.8 * (1 - 0.5 * t / d) * 0.6).astype(np.float32)
def pop(): d = 0.15; t = tt(d); return (np.sin(2 * np.pi * np.cumsum(300 + 900 * t / d) / SR) * np.exp(-t * 25)).astype(np.float32)
def slap(): d = 0.25; t = tt(d); return (bp(noise(d), 800, 4000) * np.exp(-t * 45) + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 30) * 0.5).astype(np.float32)
def yawn(d=1.3):
    t = tt(d); f0 = 140 - 30 * t / d; ph = np.cumsum(f0) / SR; src = 2 * (ph % 1) - 1 + 0.6 * noise(d)
    fc = 500 + 500 * np.sin(np.pi * t / d); s = np.zeros_like(src); seg = 1024
    for j in range(0, len(s), seg): s[j:j + seg] = bp(src[max(0, j - 2048):j + seg], fc[j] * 0.7, fc[j] * 1.5)[-len(src[j:j + seg]):]
    return norm(s) * np.sin(np.pi * t / d) * 0.5
def chirp_birds(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 6)):
        dd = 0.08; t = tt(dd); f = rng.uniform(3000, 4500) + 1500 * np.sin(np.pi * t / dd); place_local(out, (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dd) * 0.4).astype(np.float32), rng.uniform(0, d - 0.1))
    return out
def gull():
    d = 0.32; t = tt(d); f = 1900 - 900 * (t / d) ** 0.6; ph = np.cumsum(f) / SR
    s = (np.sin(2 * np.pi * ph) + 0.4 * np.sin(4 * np.pi * ph) + 0.2 * np.sin(6 * np.pi * ph)) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / d)
    return (s * 0.4).astype(np.float32)
def gulls(d, n):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(n): place_local(out, gull() * rng.uniform(0.4, 1), rng.uniform(0, max(0.01, d - 0.4)))
    return out
def waves(d):
    t = tt(d); sw = 0.55 + 0.45 * np.sin(2 * np.pi * t / 3.2 + 1) ** 2
    return (lp(noise(d), 700) * 0.6 * sw + hp(lp(noise(d), 4000), 1500) * 0.12 * sw).astype(np.float32) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)
def wind(d):
    t = tt(d); s = bp(noise(d), 300, 1100) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t + 1)) ; return (s * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4) * 0.5).astype(np.float32)
def whoosh(d=0.4): t = tt(d); return (bp(noise(d), 400, 2500) * np.sin(np.pi * t / d) ** 2 * 0.5).astype(np.float32)
def crunch(d=0.5):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 18)): dd = 0.03; place_local(out, bp(noise(dd), 1500, 7000) * np.exp(-tt(dd) * 120) * rng.uniform(0.3, 1), rng.uniform(0, d - 0.05))
    return out
def rustle(d): t = tt(d); return (hp(lp(noise(d), 7000), 2500) * (0.3 + 0.4 * np.sin(2 * np.pi * 0.8 * t) ** 2) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2) * 0.5).astype(np.float32)
def wheels(d):
    out = rumble(d) * 0.6
    for k in range(int(d * 3)): place_local(out, creak(0.35, 110 + rng.uniform(0, 60)) * 0.5, k / 3)
    return out

# cue table (seconds): shot cuts in comments
place(sfx, waves(1.9), 0.0, 0.35); place(sfx, gulls(1.8, 3), 0.05, 0.5); place(sfx, tok(120, 0.3), F(8), 0.5)       # hook: arms presented
place(sfx, ting(), F(72), 0.45); place(sfx, wind(1.9), F(56), 0.35); place(sfx, gulls(1.5, 2), F(70), 0.3)            # angel pig winks
place(sfx, whoosh(0.5), F(84), 0.35)                                                                                    # tilt down to the island
place(sfx, tok(140), F(136), 1.0); place(sfx, tok(125), F(137), 0.9); place(sfx, hmpf(), 5.27, 0.8); place(sfx, hmpf(0.26, 100), 5.39, 0.7)  # flags + humph
place(sfx, wind(2.2), F(199), 0.25); place(sfx, oink(0.3), 8.88, 0.45)                                                 # two farms
place(sfx, scratch(2.9), F(270), 0.45); place(sfx, oink(0.28, 230), 9.02, 0.6); place(sfx, grunt(0.4), 10.4, 0.35); place(sfx, oink(0.3, 200), 11.83, 0.5)
for k in range(9): place(sfx, puf(), F(270) + (k * 26 / 3 + 3) / 30 * 1.0, 0.45)                                       # potatoes popping out
for tday in (F(358), F(371), F(384)): place(sfx, vip(0.3), tday - 0.05, 0.45)                                           # day/night whips
place(sfx, growl(0.6), 12.45, 0.45); place(sfx, growl(0.5), 13.05, 0.5)                                                 # farmer grumbles
place(sfx, growl(0.7), F(400), 0.35); place(sfx, tok(600, 0.15), F(418), 0.5); place(sfx, click(), F(419), 0.4)         # rifle off the hooks
place(sfx, pat(), F(446), 1.0); place(sfx, flutter(1.1), F(448), 0.55); place(sfx, ting(), F(452), 0.55)                # muffled cartoon "pat", birds, angel ting
place(sfx, wind(2.0), F(476), 0.18); place(sfx, fiyuu(0.75), F(549), 0.75)                                             # hat flies
place(sfx, jingle(6), 19.2, 0.55); place(sfx, hmpf(0.3, 105), 20.32, 0.85)                                            # coins, refusal
place(sfx, jingle(4, 1500, 3200), 21.62, 0.6); place(sfx, jingle(3, 1400, 2800), 22.4, 0.25); place(sfx, gulp(), 23.13, 0.8)  # handcuffs, gulp
place(sfx, waves(1.5), 23.27, 0.35); place(sfx, bugle_call(), 23.3, 0.35); place(sfx, gulls(1.3, 2), 23.5, 0.3)        # settlers call
for k in range(9): place(sfx, step(), 24.8 + k * beat * 0.5, 0.45)                                                       # marching boots
place(sfx, waves(1.2), 24.77, 0.25)
place(sfx, wheels(1.4), 25.98, 0.5); place(sfx, whoosh(0.8), 26.85, 0.3)                                               # guns up the hill, crane out
place(sfx, ship_whistle(1.1), 27.55, 0.28); place(sfx, ship_whistle(0.9), 28.56, 0.42); place(sfx, creak(0.9, 90), 27.0, 0.35)
place(sfx, crowd(1.6), 28.65, 0.45); place(sfx, creak(0.7, 80), 29.3, 0.3); place(sfx, waves(1.6), 28.67, 0.25)
place(sfx, click(), F(928), 0.6); place(sfx, sigh(1.0), 32.38, 0.55)                                                     # telescope shut, sigh
place(sfx, pop(), F(984), 0.5); place(sfx, slap(), F(1047), 0.7); place(sfx, sigh(1.1), 35.96, 0.6)                    # thought bubble, facepalm
place(sfx, wind(2.0), 36.18, 0.4); place(sfx, gulls(1.6, 2), 36.4, 0.3)                                                 # the shared island
place(sfx, wind(0.5), 38.18, 0.35); place(sfx, chirp_birds(0.4), 38.47, 0.35); place(sfx, rustle(0.5), 38.75, 0.4)     # seasons
place(sfx, yawn(1.0), F(1197), 0.45); place(sfx, chirp_birds(1.4), 39.4, 0.25)                                           # yawn, birds on the idle gun
place(sfx, creak(1.2, 70), F(1236), 0.55); for_steps = [place(sfx, tok(900, 0.08) * 0.5, 41.9 + k * 0.33, 0.25) for k in range(5)]  # door, footsteps
place(sfx, tok(110, 0.3), F(1325), 1.0); place(sfx, thud(0.4), F(1325), 0.6)                                           # wax seal stamp
place(sfx, wind(3.2), 44.97, 0.25); place(sfx, gulls(1.0, 1), 45.4, 0.2)                                                 # sunset
place(sfx, crunch(0.45), F(1393), 0.4); place(sfx, crunch(0.35), F(1404), 0.3)                                          # potato crunch
place(sfx, oink(0.38, 240, 1.35), 47.55, 0.8)                                                                           # last happy oink
for tc in (F(56), F(113), F(199), F(270), F(476), F(652), F(698), F(743), F(907), F(1085), F(1232), F(1349)): place(sfx, whoosh(0.3), tc - 0.12, 0.15)

# ---------------- mix ----------------
voice = load_voice()
k = int(0.03 * SR); ve = np.sqrt(np.convolve(voice ** 2, np.ones(k) / k, "same"))
speech = (ve > 0.02).astype(np.float32)
sm = int(0.12 * SR); speech = np.convolve(speech, np.ones(sm) / sm, "same"); speech = np.clip(speech * 3, 0, 1)
v_rms = np.sqrt(np.mean(voice[ve > 0.02] ** 2)); m_rms = np.sqrt(np.mean(music[np.abs(music) > 1e-4] ** 2)) + 1e-9
music_gain = v_rms / m_rms * 10 ** (-21 / 20)                 # music ~21 dB under the speech
duck = 1.0 * speech + 1.7 * (1 - speech)                      # +4.6 dB in the pauses only
s_rms = np.sqrt(np.mean(sfx[np.abs(sfx) > 1e-4] ** 2)) + 1e-9
sfx_gain = v_rms / s_rms * 10 ** (-14 / 20)
sfx_duck = 0.7 * speech + 1.0 * (1 - speech)
mix = voice + music * music_gain * duck + sfx * sfx_gain * sfx_duck
peak = np.max(np.abs(mix)); mix = mix / max(1.0, peak / 0.95)
fd = int(0.05 * SR); mix[-fd:] *= np.linspace(1, 0, fd)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
mu = music * music_gain * duck
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
sp = ve > 0.02
print(f"ok {len(pcm) / SR:.2f}s  voice {db(voice[sp]):.1f} dBFS  music-under-speech {db(mu[sp]):.1f} dBFS  (diff {db(voice[sp]) - db(mu[sp]):.1f} dB)  sfx-under-speech {db((sfx * sfx_gain * sfx_duck)[sp]):.1f}")
