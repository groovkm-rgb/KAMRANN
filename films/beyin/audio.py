#!/usr/bin/env python3
"""Music bed + SFX for the 5:00 Brain-series video (no voice).
Writes work/music_raw.wav and work/sfx_raw.wav (stereo 48 kHz float). tools/mixdown.py levels them to ~-24 LUFS."""
import numpy as np, wave, os

SR = 48000
DUR = 300.0
N = int(DUR * SR)
rng = np.random.default_rng(11)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
os.makedirs("work", exist_ok=True)

# ---------------------------------------------------------------- dsp helpers
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / fc) ** (2 * order)); return np.fft.irfft(X, len(x))
def hp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / np.sqrt(1 + (f / max(fc, 1)) ** (2 * order)); return np.fft.irfft(X, len(x))
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def noise(d): return rng.standard_normal(int(d * SR))
def adsr(n, a=0.005, r=0.05):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na)[:n]; e[-nr:] *= np.linspace(1, 0, nr); return e

class Bus:
    def __init__(self): self.L = np.zeros(N); self.R = np.zeros(N)
    def add(self, sig, t0, g=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= N or len(sig) == 0: return
        if i < 0: sig = sig[-i:]; i = 0
        j = min(N, i + len(sig)); s = sig[: j - i] * g
        self.L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.414; self.R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.414

music, sfx = Bus(), Bus()

# ---------------------------------------------------------------- instruments
def pizz(f, d=0.35):
    t = tt(d); s = sum((0.55 ** k) * np.sin(2 * np.pi * f * (k + 1) * t + k) for k in range(6))
    return s * np.exp(-t * 9) * adsr(len(t), 0.002, 0.03)
def vibe(f, d=1.2):
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 6) + 0.08 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t * 14)
    return s * np.exp(-t * 2.2) * (1 + 0.25 * np.sin(2 * np.pi * 5.2 * t)) * adsr(len(t), 0.002, 0.08)
def piano(f, d=1.0):
    t = tt(d); s = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * (1 + 0.0004 * k * k) * t) * np.exp(-t * (2 + k * 0.9)) for k in range(7))
    return s * adsr(len(t), 0.003, 0.08)
def pad(fs, d, cut=1400):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        for det in (-0.004, 0.0, 0.005):
            ph = 2 * np.pi * f * (1 + det) * t; s += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.33
    s = lp(s / len(fs), cut); a = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6).clip(0); return s * a
def accordion(f, d):
    t = tt(d); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.8 * t); s = 0
    for det in (-0.006, 0.006):
        ph = np.cumsum(np.full(len(t), f * (1 + det)) * vib) / SR; s = s + (2 * (ph % 1) - 1) + 0.5 * np.sign(np.sin(2 * np.pi * ph * 2))
    s = lp(s, 2200); return s * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06).clip(0) * 0.4
def guitar(f, d=0.6):
    t = tt(d); s = sum((0.7 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) * np.exp(-t * (4 + 2 * k)) for k in range(8))
    return s * adsr(len(t), 0.001, 0.05)
def sq(f, d, cut=1800):
    t = tt(d); s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + 0.3 * np.sin(2 * np.pi * f * 0.5 * t)
    return lp(s, cut) * np.exp(-t * 6) * adsr(len(t), 0.002, 0.03)
def bass(f, d=0.5):
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 5)
    return s * np.exp(-t * 3) * adsr(len(t), 0.004, 0.05)
def brush(d=0.25):
    t = tt(d); return bp(noise(d), 2500, 9000) * np.minimum(1, t / 0.04) * np.exp(-t * 14) * 0.6
def kick(d=0.3):
    t = tt(d); f = 48 + 60 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)
def rim(d=0.08):
    t = tt(d); return (bp(noise(d), 1500, 5000) * 0.6 + np.sin(2 * np.pi * 1700 * t) * 0.4) * np.exp(-t * 60)
def shaker(d=0.1):
    t = tt(d); return hp(noise(d), 5000) * np.sin(np.pi * t / d) * 0.35

# ---------------------------------------------------------------- the theme
BPM = 100; B = 60 / BPM
THEME = [  # (beat, midi, beats) — 4 bars
    (0, 67, .5), (.5, 72, .5), (1, 76, .5), (1.5, 74, .5), (2, 72, 1), (3, 79, .5), (3.5, 77, .5),
    (4, 76, .5), (4.5, 74, .5), (5, 72, .5), (5.5, 71, .5), (6, 72, 1.5),
    (8, 69, .5), (8.5, 72, .5), (9, 77, .5), (9.5, 76, .5), (10, 74, 1), (11, 72, .5), (11.5, 71, .5),
    (12, 72, .5), (12.5, 74, .5), (13, 79, 1), (14, 84, 1.5)]
CH_THEME = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62])]  # C Am F G

def theme_block(t0, bars=4, lead=vibe, gain=1.0, bpm=BPM, drums=True, chords=CH_THEME, mel=THEME, oct=0):
    b = 60 / bpm
    for bi in range(bars):
        root, ch = chords[bi % len(chords)]; tb = t0 + bi * 4 * b
        for k in range(4):
            music.add(pizz(midi(root), 0.4), tb + k * b, 0.30 * gain, -0.2)
            if k % 2 == 1:
                for m in ch: music.add(pizz(midi(m + 12), 0.25), tb + k * b + b / 2, 0.08 * gain, 0.3)
            if drums:
                music.add(brush(), tb + k * b + b / 2, 0.10 * gain, 0.2)
                if k % 2 == 1: music.add(brush(0.35), tb + k * b, 0.16 * gain, -0.1)
                if k % 2 == 0: music.add(kick(), tb + k * b, 0.22 * gain)
    for (bt, m, d) in mel:
        if bt < bars * 4: music.add(lead(midi(m + oct), max(0.4, d * b * 1.6)), t0 + bt * b, 0.20 * gain, 0.1)

def jingle(t0):  # chapter-card jingle: whoosh in sfx + short theme tag
    for i, m in enumerate([72, 76, 79, 84]): music.add(vibe(midi(m), 1.4), t0 + 0.05 + i * 0.13, 0.17, -0.3 + i * 0.2)
    for m in (48, 60): music.add(pizz(midi(m), 0.5), t0 + 0.05, 0.25)

# ---- intro 0-15: theme at full colour
theme_block(0.0, bars=6, chords=CH_THEME, gain=0.95)
jingle(11.0)
# ---- chapter 1 (15-67): soft hypnotic, slowing; tension at 53; light again at 60
def ch1():
    t = 15.0; i = 0; bpm = 92
    prog = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (43, [55, 59, 62, 65])]
    while t < 53.0:
        root, ch = prog[(i // 8) % 4]; b = 60 / bpm
        music.add(vibe(midi(ch[(i * 3) % 4] + 12), 1.6), t, 0.12, 0.3 * np.sin(i))
        if i % 8 == 0: music.add(pad([midi(m) for m in ch], 8 * b * 0.5 + 0.5, 900), t, 0.10); music.add(bass(midi(root - 12), 1.2), t, 0.25)
        if i % 4 == 2: music.add(pizz(midi(root), 0.4), t, 0.15)
        t += b / 2; i += 1; bpm = max(70, bpm - 0.06)
    # tension: low pulsing bass note + dissonant pad 53-60
    d = 7.0; tq = tt(d); pulse = (0.6 + 0.4 * np.sin(2 * np.pi * 1.6 * tq * (1 + tq / 6)))
    music.add(np.sin(2 * np.pi * midi(31) * tq) * pulse * np.minimum(1, tq / 0.2) * np.minimum(1, (d - tq) / 0.4), 53.0, 0.55)
    music.add(pad([midi(55), midi(56), midi(62)], 7.0, 700), 53.0, 0.12)
    music.add(kick(0.6), 53.0, 0.5)
    for k in range(10): music.add(pizz(midi(43 + (k % 2)), 0.3), 53.2 + k * 0.62 * (1 - k * 0.04), 0.2)
    theme_block(60.0, bars=4, lead=pizz, gain=0.7, drums=True, bpm=100)
ch1()
jingle(67.0)
# ---- chapter 2 (70-122): warm piano + strings; minor in the wall room (95-102), major in the tree room
def ch2():
    b = 60 / 96
    def section(t0, t1, prog, gain=1.0, mel=True):
        t = t0; i = 0
        while t < t1 - 0.05:
            root, ch = prog[(i // 4) % len(prog)]
            if i % 4 == 0: music.add(pad([midi(m) for m in ch], 4 * b + 0.6, 1300), t, 0.13 * gain); music.add(piano(midi(root - 12), 2.2), t, 0.22 * gain)
            music.add(piano(midi(ch[i % len(ch)] + 12), 1.4), t + b / 2 * (i % 2), 0.10 * gain, 0.2)
            t += b; i += 1
    MAJ = [(48, [60, 64, 67]), (41, [57, 60, 65]), (43, [55, 59, 62]), (48, [60, 64, 67])]
    MIN = [(45, [57, 60, 64]), (41, [57, 60, 65]), (40, [56, 59, 64]), (45, [57, 60, 64])]
    section(70.0, 82.0, MAJ, 0.9)
    section(82.0, 95.0, [(45, [57, 60, 64]), (50, [57, 62, 65]), (43, [55, 59, 62]), (48, [55, 60, 64])], 0.85)
    section(95.0, 102.0, MIN, 0.8)
    section(102.0, 122.0, MAJ, 1.0)
    for (bt, m, d) in THEME: music.add(piano(midi(m), 1.4), 102.0 + bt * b, 0.12, 0.1)
    for (bt, m, d) in THEME[:14]: music.add(vibe(midi(m), 1.4), 113.0 + bt * b, 0.11, -0.1)
ch2()
jingle(122.0)
# ---- chapter 3 (125-177): French bistro — accordion + guitar waltz; comic wah-wah at the cheap bottle
def ch3():
    b = 60 / 150  # waltz, 3 beats
    prog = [(48, [60, 64, 67]), (43, [55, 59, 62, 65]), (43, [55, 59, 62, 65]), (48, [60, 64, 67]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 65]), (48, [60, 64, 67])]
    mel = [76, 77, 76, 74, 72, 74, 76, 79, 77, 76, 74, 72, 71, 72, 74, 72]
    t = 125.0; bar = 0
    while t < 177.0 - 0.1:
        root, ch = prog[bar % len(prog)]
        cheap = 163.0 <= t < 170.0
        music.add(bass(midi(root - 12), 0.4), t, 0.25)
        for k in (1, 2): [music.add(guitar(midi(m), 0.35), t + k * b, 0.05, 0.3) for m in ch]
        if not cheap: music.add(accordion(midi(mel[bar % len(mel)] + (12 if bar % 16 > 7 else 0) - 12 + 12), b * 2.6), t, 0.10, -0.25)
        t += 3 * b; bar += 1
    # wah-wah (muted trombone-ish descending)
    for i, m in enumerate([58, 57, 56, 55]):
        d = 0.5 if i < 3 else 1.4; t0 = 164.4 + i * 0.5; tq = tt(d)
        ph = np.cumsum(midi(m) * (1 - 0.03 * (tq / d) * (i == 3)) * np.ones(len(tq))) / SR
        s = 2 * (ph % 1) - 1; cut = 300 + 1500 * (0.5 - 0.5 * np.cos(2 * np.pi * np.minimum(tq / 0.35, 1) * (3 if i == 3 else 1)))
        out = np.zeros(len(s)); seg = 2400
        for k in range(0, len(s), seg): out[k:k + seg] = lp(s[k:k + seg], float(cut[k]))
        music.add(out * np.minimum(1, tq / 0.02) * np.minimum(1, (d - tq) / 0.08).clip(0), t0, 0.32)
ch3()
jingle(177.0)
# ---- chapter 4 (180-232): light electronic lab — synth arps, soft pad; "ta-da" at the pill twist
def ch4():
    b = 60 / 104; prog = [(45, [57, 60, 64, 69]), (41, [53, 57, 60, 65]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
    t = 180.0; i = 0
    while t < 232.0 - 0.05:
        root, ch = prog[(i // 16) % 4]
        music.add(sq(midi(ch[i % 4] + 12 * (1 + (i // 4) % 2)), 0.22, 1600 + 800 * np.sin(i * 0.2)), t, 0.055, 0.4 * np.sin(i * 0.7))
        if i % 16 == 0: music.add(pad([midi(m) for m in ch], 16 * b / 4 + 0.6, 1000), t, 0.12); music.add(bass(midi(root - 12), 1.0), t, 0.22)
        if i % 4 == 0: music.add(kick(0.25), t, 0.10)
        if i % 4 == 2: music.add(rim(), t, 0.06)
        t += b / 4; i += 1
    for (bt, m, d) in THEME[:12]: music.add(vibe(midi(m), 1.2), 212.0 + bt * b, 0.10)
    # ta-da: brass-ish stab + cymbal swell
    for k, m in enumerate([60, 64, 67, 72]): music.add(pad([midi(m + 12)], 1.4, 2600) * 2.5, 220.0 + (0.18 if k else 0), 0.07)
    music.add(pizz(midi(72), 0.3), 219.82, 0.3); music.add(hp(noise(1.5), 6000) * np.exp(-tt(1.5) * 2.5), 220.18, 0.06)
ch4()
jingle(232.0)
# ---- chapter 5 (235-287): elevator bossa nova (vibes + nylon guitar); record-scratch cut at 4:13
def ch5():
    b = 60 / 108; prog = [(50, [62, 65, 69, 72]), (43, [59, 62, 65, 69]), (48, [60, 64, 67, 71]), (45, [57, 61, 64, 67])]
    pat = [0, 1.5, 3, 4, 5.5, 7]  # bossa clave-ish guitar comping (in 8ths)
    t = 235.0; bar = 0
    while t < 287.0 - 0.05:
        if 253.0 <= t < 254.2: t += 2 * 4 * b; bar += 2; continue
        root, ch = prog[(bar // 2) % 4]; thin = 253.0 <= t < 260.0
        music.add(bass(midi(root - 12), 0.6), t, 0.22); music.add(bass(midi(root - 5), 0.6), t + 3 * b, 0.16)
        for p_ in pat:
            for m in ch: music.add(guitar(midi(m), 0.3), t + p_ * b / 2, 0.035 * (0.5 if thin else 1), 0.25)
        for k in range(8): music.add(shaker(), t + k * b / 2, 0.08 if k % 2 else 0.05, -0.3)
        music.add(rim(), t + 1.5 * b, 0.05); music.add(rim(), t + 3 * b, 0.05)
        if not thin:
            mel_bar = bar % 4; seg = [n for n in THEME if mel_bar * 4 <= n[0] < mel_bar * 4 + 4]
            for (bt, m, d) in seg: music.add(vibe(midi(m - 2), 1.3), t + (bt - mel_bar * 4) * b * 1.0, 0.11, 0.15)
        t += 4 * b; bar += 1
ch5()
# ---- outro (287-300): the theme returns, final ding
theme_block(287.0, bars=3, gain=0.85, bpm=100)
for m in (60, 64, 67, 72): music.add(vibe(midi(m), 3.0), 294.3, 0.10)
for m in (48,): music.add(pizz(midi(m), 0.8), 294.3, 0.3)

# ---------------------------------------------------------------- SFX library
def swish(d=0.35, lo=600, hi=5000):
    t = tt(d); return bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2 * 0.7
def whoosh(d=0.6):
    t = tt(d); x = noise(d); a = lp(x, 900) * 1.5 + bp(x, 1500, 5000) * 0.6 * (t / d); return a * np.sin(np.pi * t / d) ** 1.5 * 0.7
def ding(f=1568, d=1.6):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 8)) * np.exp(-t * 2.4) * 0.5
def knock(f=180):
    t = tt(0.18); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 35) + bp(noise(0.18), 600, 3000) * np.exp(-t * 60) * 0.6)
def boing(f0=180, d=0.45):
    t = tt(d); f = f0 * (1 + 0.5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.6
def vinn(d=1.6, f=70):
    t = tt(d); s = np.sin(2 * np.pi * f * t + 2 * np.sin(2 * np.pi * 0.7 * t)) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t); return lp(s, 400) * np.sin(np.pi * t / d) * 0.6
def splat(d=0.35):
    t = tt(d); return (lp(noise(d), 1200) * np.exp(-t * 18) * 1.2 + bp(noise(d), 300, 2500) * np.exp(-t * 7) * 0.5)
def squish(d=1.8):
    t = tt(d); return bp(noise(d), 300, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2) * 0.35
def liquid(d=1.5, rate=14):
    t = tt(d); s = np.zeros(len(t))
    for k in range(int(d * rate)):
        i0 = int(rng.uniform(0, d - 0.06) * SR); f = rng.uniform(500, 1400); tb = tt(0.05)
        s[i0:i0 + len(tb)] += np.sin(2 * np.pi * np.cumsum(f * (1 + 2 * tb / 0.05)) / SR) * np.exp(-tb * 60)[: len(s) - i0]
    return (s * 0.5 + lp(noise(d), 700) * 0.25) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2)
def creak(d=0.9, f0=110):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 0.9 * t / d)); ph = np.cumsum(rate) / SR
    s = (np.mod(ph, 1) < 0.07).astype(float) * (0.6 + 0.4 * rng.random(len(t))); return hp(lp(s, 2600), 150) * np.sin(np.pi * t / d) * 1.4
def whistle(d=0.8):
    t = tt(d); f = 1900 + 300 * np.sin(2 * np.pi * 3 * t); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + bp(noise(d), 2500, 6000) * 0.4
    return s * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.15).clip(0) * 0.45
def hiss(d=1.0):
    t = tt(d); return bp(noise(d), 2500, 9000) * np.minimum(1, t / 0.05) * np.exp(-t * 2.5) * 0.5
def tick(f=2600):
    t = tt(0.04); return np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + hp(noise(0.04), 3000) * np.exp(-t * 150) * 0.4
def thud(f=90):
    t = tt(0.35); return np.sin(2 * np.pi * f * t * (1 + 0.5 * np.exp(-t * 40))) * np.exp(-t * 14) + lp(noise(0.35), 1500) * np.exp(-t * 30) * 0.5
def step(heavy=False):
    t = tt(0.12); return lp(noise(0.12), 700 if heavy else 1400) * np.exp(-t * (35 if heavy else 50)) * (1.3 if heavy else 0.8)
def rustle(d=0.5):
    t = tt(d); return bp(noise(d), 1500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 6 * t))) * np.sin(np.pi * t / d) * 0.4
def crack():
    t = tt(0.09); return lp(hp(noise(0.09), 1800), 7000) * np.exp(-t * 70) * 0.5
def twinkle(d=0.9, base=2000):
    s = np.zeros(int(d * SR))
    for k in range(6):
        tb = tt(0.35); f = base * 2 ** (rng.integers(0, 12) / 12); x = np.sin(2 * np.pi * f * tb) * np.exp(-tb * 12); i0 = int(k / 6 * (d - 0.35) * SR); s[i0:i0 + len(x)] += x
    return s * 0.35
def ting(): return ding(2637, 1.2) * 0.8
def chirp():
    s = np.zeros(int(0.5 * SR))
    for k in range(rng.integers(2, 5)):
        tb = tt(0.07); f = rng.uniform(2800, 4200) * (1 + 0.4 * np.sin(2 * np.pi * 14 * tb)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tb / 0.07); i0 = int(k * 0.09 * SR); s[i0:i0 + len(x)] += x
    return s * 0.3
def birds(t0, t1, density=1.6, g=0.25, pan=-0.4):
    t = t0
    while t < t1: sfx.add(chirp(), t, g * rng.uniform(0.6, 1.0), pan + rng.uniform(-0.3, 0.3)); t += rng.exponential(1 / density)
def ambience(t0, d, lo=60, hi=400, g=0.12):
    tq = tt(d); sfx.add(bp(noise(d), lo, hi) * np.minimum(1, tq / 0.5) * np.minimum(1, (d - tq) / 0.5), t0, g)
def rings(d=0.9):
    s = np.zeros(int(d * SR))
    for k in range(9): tb = tt(0.12); x = np.sin(2 * np.pi * rng.uniform(2500, 3500) * tb) * np.exp(-tb * 40) + hp(noise(0.12), 4000) * np.exp(-tb * 60) * 0.5; i0 = int(k * d / 10 * SR); s[i0:i0 + len(x)] += x
    return s * 0.5
def drawer(d=0.6):
    t = tt(d); return (bp(noise(d), 200, 1500) * np.sin(np.pi * t / d) * 0.6 + np.pad(thud(140), (0, max(0, len(t) - int(0.35 * SR))))[: len(t)] * (t > d - 0.36) * 0.4)
def puf(d=0.35):
    t = tt(d); return lp(noise(d), 800) * np.exp(-t * 12) * 0.8
def pop():
    t = tt(0.08); return np.sin(2 * np.pi * (500 + 700 * np.exp(-t * 60)) * t) * np.exp(-t * 45)
def zipper(d=0.7):
    t = tt(d); s = (np.mod(np.cumsum(np.full(len(t), 70 + 60 * t / d)) / SR, 1) < 0.15).astype(float); return bp(s * rng.random(len(t)), 1500, 7000) * 0.6
def chime():
    return ding(1318, 1.4) * 0.6 + np.pad(ding(1046, 1.4) * 0.6, (int(0.25 * SR), 0))[: int(1.4 * SR)]
def water(d):
    t = tt(d); return (bp(noise(d), 800, 6000) * (0.5 + 0.3 * np.sin(2 * np.pi * 0.7 * t)) * 0.25 + lp(noise(d), 500) * 0.1) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
def clink(f=3200):
    t = tt(0.8); return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.3 * t)) * np.exp(-t * 7) * 0.4
def plip():
    t = tt(0.12); return np.sin(2 * np.pi * np.cumsum(700 * (1 + 3 * t / 0.12)) / SR) * np.exp(-t * 40)
def sniff():
    t = tt(0.25); return bp(noise(0.25), 1500, 5000) * np.sin(np.pi * t / 0.25) * 0.4
def glug(d=1.5): return liquid(d, 9)
def spit():
    t = tt(0.3); return bp(noise(0.3), 600, 4000) * np.exp(-t * 12) * 0.7
def bzzt(d=0.35):
    t = tt(d); s = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.4 + bp(noise(d), 2000, 8000) * 0.6; return s * (0.5 + 0.5 * (rng.random(len(t)) > 0.5)) * np.sin(np.pi * t / d) * 0.6
def gulp():
    t = tt(0.22); return np.sin(2 * np.pi * np.cumsum(300 - 150 * t / 0.22) / SR) * np.sin(np.pi * t / 0.22) * 0.6
def sand(d):
    t = tt(d); return hp(noise(d), 4000) * 0.12 * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * t)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)
def slide(d=1.2, f=180):
    t = tt(d); return (bp(noise(d), 150, 900) * 0.6 + np.sin(2 * np.pi * f * t) * 0.15) * np.sin(np.pi * t / d) ** 0.6 * 0.6
def click():
    t = tt(0.05); return (np.sin(2 * np.pi * 1900 * t) * 0.5 + lp(hp(noise(0.05), 2500), 8000) * 0.3) * np.exp(-t * 110)
def slosh(d):
    t = tt(d); return bp(noise(d), 300, 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 4.5 * t)) ** 2 * 0.3
def scratch():
    t = tt(0.55); f = 300 + 900 * np.abs(np.sin(2 * np.pi * 3.2 * t)); return (bp(noise(0.55), 400, 4000) * 0.6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3) * np.minimum(1, (0.55 - t) / 0.05)
def zack():
    t = tt(0.4); return (lp(noise(0.4), 2500) * np.exp(-t * 20) * 1.0 + np.sin(2 * np.pi * 60 * t) * np.exp(-t * 12) * 0.9)
def horn(f=380, d=0.22):
    t = tt(d); s = np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sign(np.sin(2 * np.pi * f * 1.26 * t)) * 0.3; return lp(s, 2500) * adsr(len(t), 0.01, 0.04) * 0.5
def carhorn(d=0.5): return horn(420, d) * 0.9
def rolling(d):
    t = tt(d); return (lp(noise(d), 300) * 0.5 + np.sin(2 * np.pi * 900 * t + 3 * np.sin(2 * np.pi * 2 * t)) * 0.03 * (np.sin(2 * np.pi * 1.5 * t) > 0.7)) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2)
def tap(): t = tt(0.06); return bp(noise(0.06), 800, 3500) * np.exp(-t * 80)

S = sfx.add
# ---- intro
for k, t0 in enumerate([0.0, 1.0, 2.0, 3.0, 4.0]): S(swish(0.3), t0 - 0.08 if t0 else 0.0, 0.5, -0.5 + k * 0.25)
S(splat(), 0.1, 0.45); S(squish(0.8), 0.15, 0.6)
ambience(1.0, 1.0, 80, 300, 0.15)
S(plip(), 2.28, 0.5); S(crack(), 3.25, 0.6); S(ting(), 3.3, 0.35)
for x in [4.1, 4.35, 4.55, 4.75]: S(click(), x, 0.6, 0.3)
S(whoosh(0.7), 5.0, 0.45, 0.6); S(boing(160), 5.85, 0.4); S(puf(), 5.85, 0.4)
S(knock(190), 7.45, 0.8); S(knock(175), 7.85, 0.8)
S(vinn(1.8, 62), 7.9, 0.55, -0.3)
S(knock(150), 8.2, 0.2, -0.3); S(knock(140), 8.6, 0.2, -0.3)
def card(t0, D):
    tIn = 0.9 if D > 3.5 else 0.45; tThrow = D - 1.15
    S(swish(0.35, 800, 6000), t0, 0.35, 0.6); S(boing(200, 0.35), t0 + tIn, 0.3); S(ding(), t0 + tIn + 0.1, 0.33)
    S(whoosh(0.9), t0 + tThrow, 0.55); S(whoosh(0.45), t0 + D - 0.3, 0.4)
card(11.0, 4); [card(a, 3) for a in (67.0, 122.0, 177.0, 232.0)]
# ---- chapter 1
S(splat(0.4), 16.6, 0.55); S(squish(2.0), 16.6, 0.65); S(twinkle(1.0), 18.7, 0.45)
S(liquid(2.2, 18), 21.3, 0.35); S(liquid(3.0, 10), 24.0, 0.3); S(swish(0.25), 26.35, 0.25)
S(creak(1.2, 90), 27.3, 0.55)
for k in range(9): S(step(True), 27.4 + k * 0.45, 0.4, 0.4)
for x in (28.5, 31.0, 32.4): S(whistle(0.9), x, 0.35)
S(swish(0.25), 32.35, 0.35)
for k in range(14): S(tick(3200), 34.0 + k * 0.5, 0.18, -0.5)
S(hiss(1.2), 36.4, 0.45)
S(creak(1.6, 140), 41.1, 0.25); S(thud(80), 43.0, 0.9); S(swish(0.2), 43.05, 0.3)
for x in (47.2, 47.8, 48.4, 49.0, 49.6): S(splat(0.3), x, 0.35, -0.5 + (x - 47) * 0.4)
for x in (51.4, 52.5): S(pop(), x, 0.35)
for k in range(30): S(tick(2800 if k % 2 else 2200), 53.0 + k * 0.13, 0.28, -0.3)
for k in range(10): S(step(True), 54.6 + k * 0.5, 0.35)
S(whistle(1.0), 58.4, 0.4); S(thud(55), 59.0, 0.6)
S(rustle(0.6), 60.3, 0.35); S(rustle(0.5), 62.5, 0.3)
for x in (61.8, 62.6, 63.3, 64.2): S(crack(), x, 0.5, 0.1); S(crack(), x + 0.05, 0.3, -0.1)
S(boing(260, 0.3), 64.45, 0.3, 0.6)
# ---- chapter 2
S(creak(0.5, 160), 71.1, 0.3, -0.5); S(creak(0.5, 160), 71.1, 0.3, 0.5)
S(rings(0.9), 76.5, 0.45, -0.4); S(rings(0.9), 76.5, 0.45, 0.4)
birds(77.4, 82.0, 1.8, 0.28, -0.5); ambience(77.4, 4.6, 50, 250, 0.22); S(rustle(4.0) * 0.6, 77.6, 0.3, -0.5)
for k in range(6): S(step(), 82.1 + k * 0.38, 0.3)
S(drawer(0.6), 84.4, 0.45); S(drawer(0.5), 85.6, 0.35)
for x in (84.6, 85.5, 86.4, 87.3): S(puf(0.3), x, 0.3)
S(rustle(0.5), 89.2, 0.35); S(whoosh(0.3), 91.95, 0.35); S(ding(2093, 0.8), 92.05, 0.25)
ambience(95.0, 7.0, 50, 220, 0.25)
for k in range(8): S(tick(1800), 95.6 + k * 0.6, 0.45, 0.2)
birds(102.0, 109.0, 1.6, 0.25, -0.2); S(zipper(0.7), 103.9, 0.35); S(puf(0.3), 103.7, 0.3)
S(chime(), 106.5, 0.4, -0.6)
for k in range(5): S(step(), 106.6 + k * 0.4, 0.3, -0.5)
S(whoosh(1.8), 109.6, 0.4); birds(110.5, 116.0, 2.2, 0.3, 0.0); S(rustle(3.0), 111.5, 0.3)
S(water(6.0), 116.0, 0.45); birds(116.0, 122.0, 1.2, 0.2, 0.3)
# ---- chapter 3
S(clink(3300), 125.8, 0.35, -0.3); S(clink(2900), 127.4, 0.3, 0.3)
for x in (132.0, 132.8, 133.6): S(plip(), x + 0.3, 0.5, 0.4)
S(liquid(1.8, 10), 137.2, 0.25)
for x in (139.3, 139.6, 139.9): S(sniff(), x, 0.4, (x - 139.6) * 2)
S(liquid(0.5, 12), 140.6, 0.25)
for x in (140.6, 141.3, 142.0): S(pop(), x, 0.45); S(twinkle(0.5, 2600), x, 0.2)
S(whoosh(1.2), 144.9, 0.35); S(boing(150, 0.35), 147.0, 0.3, 0.5); S(knock(300) * 0.6, 147.35, 0.5, 0.5)
S(glug(1.7), 150.5, 0.35, -0.3); S(glug(1.7), 152.8, 0.35, 0.3); S(pop(), 154.9, 0.7, -0.3); S(twinkle(0.8), 155.0, 0.35, -0.3)
for k in range(5): S(twinkle(1.0, 1800 + k * 200), 157.5 + k * 1.1, 0.35, -0.4 + k * 0.2)
S(clink(3100), 156.6, 0.3)
S(swish(0.22), 165.55, 0.35); S(spit(), 167.6, 0.4, 0.6); S(puf(0.2), 167.7, 0.2, 0.6)
S(rustle(0.25), 170.3, 0.3); [S(twinkle(0.8, 2400), 171.0 + k * 1.8, 0.3) for k in range(3)]
# ---- chapter 4
ambience(180.0, 6.0, 90, 160, 0.12); S(bzzt(0.4), 182.15, 0.55, 0.2); S(boing(220, 0.35), 182.3, 0.35)
S(rustle(0.5), 186.3, 0.35, -0.4); S(rustle(0.5), 187.0, 0.35, 0.4)
for k in range(6): S(click() * 0.5, 186.4 + k * 0.7 + 0.45, 0.4)
S(rustle(0.6), 192.5, 0.3, -0.5); S(rustle(0.6), 196.4, 0.3, 0.5)
S(sand(6.0), 199.0, 0.55)
for k in range(4): S(gulp(), 201.2 + k * 0.6 + 0.3, 0.45, -0.3 + k * 0.2)
S(bzzt(0.35), 206.55, 0.45, -0.3); S(bzzt(0.45), 206.55, 0.55, 0.3); S(boing(240, 0.35), 206.65, 0.3, 0.3)
prevA = prevB = 0
for fr in range(int(212 * 30), int(219 * 30)):
    tl = fr / 30 - 212; k = min(1, max(0, (tl - 0.5) / 4.5)); a, b_ = round(9 * k), round(4 * k)
    if a > prevA: S(pop(), fr / 30, 0.35, -0.2)
    if b_ > prevB: S(pop(), fr / 30 + 0.02, 0.3, 0.2)
    prevA, prevB = a, b_
S(crack(), 220.0, 0.8); S(ting(), 220.08, 0.45); S(twinkle(1.2), 220.2, 0.35)
for x in (226.2, 228.0, 229.8): S(swish(0.4), x, 0.35)
tq = tt(4.5); S(np.sin(2 * np.pi * np.cumsum(1400 - 700 * tq / 4.5) / SR) * 0.12 * np.sin(np.pi * tq / 4.5), 226.5, 0.5, 0.4)
# ---- chapter 5
S(ding(1760, 1.4), 235.2, 0.35)
for k in range(8): S(step(), 235.1 + k * 0.33, 0.35, -0.6 + k * 0.08)
S(slosh(2.6), 235.4, 0.35); S(slide(1.8), 235.45, 0.35); S(whoosh(0.5), 237.45, 0.45); S(slide(0.8), 237.7, 0.3)
for k in range(3): S(click(), 241.17 + k * 0.7, 0.5, 0.4)
x, d = 1.9, 0.5
while x < 5.8: S(click(), 241.0 + x, 0.6, 0.4); x += d; d = max(0.12, d * 0.8)
S(slosh(3.0), 244.0, 0.3)
S(slide(3.6, 150), 247.4, 0.45); S(puf(0.4), 251.2, 0.3)
S(scratch(), 252.95, 0.6)
tq = tt(6.5); S(lp(np.sin(2 * np.pi * 110 * tq) + 0.5 * np.sign(np.sin(2 * np.pi * 55 * tq)), 500) * 0.25 * np.minimum(1, tq / 0.5) * np.minimum(1, (6.5 - tq) / 0.5), 253.4, 0.35)
S(boing(140, 0.6), 254.0, 0.45, -0.3); S(boing(130, 0.6), 256.5, 0.35, -0.3)
for k in range(12): S(tick(1400), 257.0 + k * 0.25, 0.2, 0.5)
S(rolling(3.0), 260.4, 0.5)
for k in range(7): S(tap(), 262.2 + k * 0.6, 0.45, 0.3)
S(click() * 0.6, 268.1, 0.5, 0.4); S(crack(), 268.5, 0.6, 0.4); S(zack(), 268.75, 0.9); S(swish(0.25), 269.25, 0.35)
for x in (275.0, 275.35, 277.5, 277.85): S(horn(), x, 0.45, 0.4)
S(rustle(2.0), 274.2, 0.15)
ambience(280.0, 7.0, 60, 500, 0.35); S(hiss(2.5), 280.4, 0.3, -0.5)
for x in (280.8, 283.6, 285.9): S(carhorn(0.45), x, 0.25, rng.uniform(-0.7, 0.7))
for k in range(7): S(click() * 0.8, 280.157 + k * 0.628, 0.5, 0.3)
S(boing(150, 0.5), 282.8, 0.35); S(whoosh(1.6), 284.3, 0.4)
# ---- outro
S(puf(0.45), 287.15, 0.5); S(twinkle(0.8), 287.4, 0.25); S(boing(330, 0.25), 289.7, 0.3)
for k in range(3): S(swish(0.3, 500, 3000), 293.3 + k * 0.9, 0.18, 0.3)
S(ding(1568, 2.2), 298.6, 0.4)

def write_f32(L, R, path):
    data = np.stack([L, R], 1).astype(np.float32)
    with open(path, "wb") as fh:
        import struct
        n = data.size * 4
        fh.write(b"RIFF" + struct.pack("<I", 36 + n) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 3, 2, SR, SR * 8, 8, 32) + b"data" + struct.pack("<I", n)); fh.write(data.tobytes())
fade = int(1.2 * SR)
for bus in (music, sfx):
    bus.L[-fade:] *= np.linspace(1, 0, fade); bus.R[-fade:] *= np.linspace(1, 0, fade)
write_f32(music.L, music.R, "work/music_raw.wav"); write_f32(sfx.L, sfx.R, "work/sfx_raw.wav")
print("ok", N / SR, "s  music peak", np.abs(music.L).max(), "sfx peak", np.abs(sfx.L).max())
