"""Synthesized muzak bed + SFX for "Der Tür-zu-Knopf", mixed UNDER the user's voice.mp3 (no voice is generated).
Music sits ~20-22 dB below the speech and is ducked wherever the voice is active.  ->  mix_raw.wav (stereo, 48 kHz)"""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1339
DUR = TOTAL_F / 30
N = int(round(DUR * SR))
rng = np.random.default_rng(11)
F = lambda f: f / 30.0
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------- dsp helpers ----------------
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def spec_filter(x, fn):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= fn(f); return np.fft.irfft(X, len(x)).astype(np.float32)
def lp(x, c): return spec_filter(x, lambda f: 1 / (1 + (f / c) ** 4))
def hp(x, c): return spec_filter(x, lambda f: 1 - 1 / (1 + (f / max(c, 1)) ** 4))
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def env(d, a=0.005, r=0.3):
    t = tt(d); return (np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)).astype(np.float32)
def fade(x, a=0.01, r=0.05):
    n = len(x); e = np.ones(n, np.float32); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return x * e

class Bus:
    def __init__(self): self.L = np.zeros(N, np.float32); self.R = np.zeros(N, np.float32)
    def add(self, sig, t0, g=1.0, pan=0.0):
        i = int(round(t0 * SR));
        if i >= N: return
        s = sig[: max(0, N - i)] if i >= 0 else sig[-i:][:N]
        i = max(i, 0); j = i + len(s)
        gl, gr = g * np.sqrt(0.5 * (1 - pan)), g * np.sqrt(0.5 * (1 + pan))
        self.L[i:j] += s * gl; self.R[i:j] += s * gr

music, sfx, amb = Bus(), Bus(), Bus()

# ---------------- instruments ----------------
def vib(f, d=1.4, bright=1.0, trem=5.2):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.1) + 0.32 * bright * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.18) + 0.08 * bright * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t / 0.05)
    s *= (1 - 0.22 * (0.5 + 0.5 * np.sin(2 * np.pi * trem * t))) * np.minimum(1, t / 0.003)
    return fade(s.astype(np.float32), 0.002, 0.08)
def ep(fs, d=1.2, vel=1.0):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        idx = 1.6 * vel * np.exp(-t / 0.25) + 0.25
        s += np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.0)
        s += 0.06 * np.sin(2 * np.pi * 14 * f * t) * np.exp(-t / 0.03)
    s *= np.minimum(1, t / 0.004) / max(1, len(fs))
    return fade(lp(s.astype(np.float32), 3500), 0.002, 0.12)
def bass(f, d=0.6):
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    s *= np.minimum(1, t / 0.01) * np.exp(-t / 0.45)
    return fade(lp(s.astype(np.float32), 900), 0.004, 0.06)
def brush(d=0.55, kind='swish'):
    n = noise(d); t = tt(d)
    if kind == 'swish': e = np.sin(np.pi * t / d) ** 2; return (bp(n, 1800, 7000) * e * 0.35).astype(np.float32)
    return (bp(n, 2500, 9000) * np.exp(-t / 0.03) * 0.6).astype(np.float32)
def rim(d=0.12):
    t = tt(d); return ((np.sin(2 * np.pi * 1750 * t) * 0.6 + bp(noise(d), 1500, 5000) * 0.4) * np.exp(-t / 0.018)).astype(np.float32)
def kick(d=0.3):
    t = tt(d); f = 55 + 60 * np.exp(-t * 25); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)).astype(np.float32)
def shaker(d=0.12):
    t = tt(d); return (bp(noise(d), 4000, 11000) * np.sin(np.pi * t / d) ** 2 * 0.4).astype(np.float32)
def pad(fs, d, a=0.6, r=0.9, cut=1400):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        for det in (-0.004, 0.0, 0.0045):
            ph = 2 * np.pi * f * (1 + det) * t
            s += sum(np.sin(k * ph) / k for k in range(1, 8))
    e = np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (d - t) / r))
    return lp((s * e / (3 * len(fs))).astype(np.float32), cut)
def brass(fs, d):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5.5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.2 for k in range(9))
    a = np.minimum(1, t / 0.03) * np.minimum(1, np.maximum(0, (d - t) / 0.18))
    return lp((s * a / len(fs)).astype(np.float32), 2600)

# chords: Cmaj9 | Am9 | Dm9 | G13   (rootless voicings), bass roots, vibes melody (beat, dur, midi)
PROG = [((52, 55, 59, 62), 36, 43), ((55, 59, 60, 64), 45, 40), ((53, 57, 60, 64), 38, 45), ((53, 59, 64, 69), 43, 38)]
MEL = [[(0, 1.5, 76), (1.5, 0.5, 74), (2, 1, 76), (3, 1, 79)], [(0, 1.5, 83), (1.5, 0.5, 81), (2, 1, 79), (3, 1, 76)],
       [(0, 1.5, 77), (1.5, 0.5, 76), (2, 1, 74), (3, 1, 72)], [(0, 2, 71), (2, 1, 74), (3, 1, 77)]]

def muzak(t0, t1, bpm=96, bar0=0, drums=1.0, mel=1.0, relaxed=False, transpose=0, fade_in=0.0, fade_out=0.25, shake=0.0):
    beat = 60 / bpm; t = t0; bar = bar0
    seg = Bus()
    while t < t1 - 0.05:
        ch, root, fifth = PROG[bar % 4]
        for pos in ((0, 1.5, 3) if not relaxed else (0, 2)):
            tb = t + pos * beat
            if tb < t1: seg.add(ep([midi(m + transpose) for m in ch], 1.4 if relaxed else 0.9, 0.8 if relaxed else 1.0), tb, 0.55, -0.25)
        for pos, m in ((0, root), (2, fifth), (3.5, root + 12 if bar % 2 else fifth)):
            tb = t + pos * beat
            if tb < t1: seg.add(bass(midi(m - 12 + transpose), beat * 1.6), tb, 0.9, 0.0)
        if mel:
            for b0, d, m in MEL[bar % 4]:
                tb = t + b0 * beat
                if tb < t1: seg.add(vib(midi(m + transpose), max(0.6, d * beat * 1.6)), tb, 0.42 * mel, 0.3)
        for b in range(4):
            tb = t + b * beat
            if tb >= t1: break
            seg.add(brush(beat * 0.9), tb, 0.5 * drums, 0.15 * (1 if b % 2 else -1))
            if drums > 0.3: seg.add(brush(0.08, 'tap'), tb + beat * 0.5, 0.25 * drums, 0.2)
            if b in (0, 2): seg.add(kick(), tb, 0.35 * drums)
            if shake: seg.add(shaker(), tb + beat * 0.5, 0.5 * shake, 0.4); seg.add(shaker(), tb, 0.3 * shake, 0.4)
        if drums > 0.3 and not relaxed:
            for pos in ((0, 1.5, 3) if bar % 2 == 0 else (1, 2.5)):
                tb = t + pos * beat
                if tb < t1: seg.add(rim(), tb, 0.18 * drums, -0.35)
        t += 4 * beat; bar += 1
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
    for b in (seg.L, seg.R):
        e = np.ones(i1 - i0, np.float32)
        if fade_in: k = int(fade_in * SR); e[:k] = np.linspace(0, 1, k)
        if fade_out: k = int(fade_out * SR); e[-k:] = np.linspace(1, 0, k) ** 2
        b[i0:i1] *= e; b[:i0] = 0; b[i1:] = 0
    music.L += seg.L; music.R += seg.R

# ---------------- music cues ----------------
T_SCRATCH = F(253)                       # 8.43 s  shot 7 (x-ray) begins
muzak(0.0, T_SCRATCH, bpm=96)            # 1-6: muzak
for f, m in ((109, 76), (123, 79), (140, 84)):   # 4: a vibraphone note on every press
    music.add(vib(midi(m), 1.0, 1.2), F(f), 0.55, 0.3)
for k, f in enumerate((146, 149, 152, 155)): music.add(vib(midi(84 + (2 if k % 2 else 0)), 0.4, 1.2), F(f), 0.3, 0.3)
# 7: mystery — after a short silence: low bass + one single note
music.add(bass(midi(26), 3.8) * 1.4, 8.8, 0.9); music.add(lp(pad([midi(38)], 4.6, 0.8, 1.6, 300), 300) * 0.8, 8.8, 0.9)
music.add(vib(midi(75), 3.2, 0.6, 4.0), 9.0, 0.5, 0.2)
music.add(lp(pad([midi(38), midi(45)], 3.5, 1.0, 1.2, 400), 400), 11.2, 0.55)
music.add(vib(midi(70), 2.6, 0.5, 4.0), 12.2, 0.32, -0.2)
# 9-10: warm soft chord
music.add(pad([midi(m) for m in (53, 57, 60, 64, 67)], 3.3, 0.9, 1.0, 1600), 13.95, 0.62)
music.add(pad([midi(m) for m in (48, 55, 59, 62, 64)], 3.4, 0.8, 1.1, 1600), 16.85, 0.62)
music.add(vib(midi(79), 1.6, 0.7), 14.3, 0.28, 0.3); music.add(vib(midi(76), 1.6, 0.7), 17.2, 0.28, 0.3)
# 11: the button cannot shorten it — patient chord continues
music.add(pad([midi(m) for m in (50, 57, 60, 64)], 2.0, 0.6, 0.8, 1300), 19.85, 0.5)
# 12: firefighter — quiet suspense, then a short heroic fanfare hit on the slam
music.add(pad([midi(m) for m in (43, 50, 55, 60)], 2.2, 0.5, 0.7, 900), 21.7, 0.45)
for k, m in enumerate((67, 72, 76)): music.add(brass([midi(m)], 0.12), F(712) + k * 0.075, 0.42, 0.1)
music.add(brass([midi(m) for m in (60, 64, 67, 72)], 0.95), F(715), 0.4, 0.0)
music.add(kick(0.4), F(715), 0.6)
# 13: "why is it still there?" — two questioning vibes notes
music.add(pad([midi(m) for m in (45, 52, 55, 59, 60)], 2.9, 0.7, 1.0, 1200), 25.5, 0.42)
music.add(vib(midi(76), 1.2, 0.8), F(790), 0.4, 0.3); music.add(vib(midi(81), 1.6, 0.8), F(806), 0.4, 0.3)
# 14-16: muzak back, even more relaxed
muzak(F(850) - 0.05, F(1049) - 0.05, bpm=90, bar0=0, drums=0.45, mel=0.9, relaxed=True, fade_in=0.4, fade_out=0.3)
music.add(vib(midi(84), 1.5, 1.0), F(1036), 0.35, 0.3); music.add(vib(midi(88), 1.5, 1.0), F(1040), 0.35, 0.3)
# 17-18: city tempo — same tune, faster, a step up, shaker
muzak(F(1049) + 0.15, F(1225) - 0.05, bpm=116, bar0=0, drums=1.2, mel=1.0, transpose=2, fade_in=0.15, fade_out=0.2, shake=1.0)
# 19: muzak again, stops for the hesitation, single ding at the end
muzak(F(1225) + 0.05, F(1302), bpm=96, bar0=0, drums=0.7, mel=1.0, fade_in=0.2, fade_out=0.35)
music.add(ep([midi(m) for m in (52, 55, 59, 62)], 2.0, 0.7), F(1316), 0.5, -0.2)
music.add(vib(midi(84), 1.6, 0.9), F(1316), 0.35, 0.3)

# ---------------- sfx ----------------
def click(d=0.08, f0=2400):
    t = tt(d); return ((np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.012) * 0.7 + hp(noise(d), 3000) * np.exp(-t / 0.004)) * 0.9).astype(np.float32)
def dead_click(d=0.14):
    t = tt(d); return (lp(np.sin(2 * np.pi * 620 * t) * np.exp(-t / 0.02) + 0.6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03) + 0.4 * noise(d) * np.exp(-t / 0.006), 2500)).astype(np.float32)
def ding(f0=1318.5, d=2.2):
    t = tt(d); s = sum(a * np.sin(2 * np.pi * f0 * k * t) * np.exp(-t / dk) for k, a, dk in ((1, 1, 1.4), (2.0, 0.35, 0.6), (2.76, 0.25, 0.35), (5.4, 0.12, 0.12)))
    return (s * np.minimum(1, t / 0.002) * 0.6).astype(np.float32)
def slide(d=1.0, cut=700):
    t = tt(d); e = np.sin(np.pi * np.minimum(1, t / d)) ** 0.6
    return (lp(noise(d), cut) * e * 1.6 + 0.25 * np.sin(2 * np.pi * 95 * t) * e).astype(np.float32)
def thunk(f0=110, d=0.3):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.5 * np.exp(-t * 40))) * np.exp(-t * 14) + lp(noise(d), 1500) * np.exp(-t * 35) * 0.5).astype(np.float32)
def metal_bang(d=0.7):
    t = tt(d); s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in ((223, 1, 0.25), (567, 0.6, 0.15), (893, 0.45, 0.1), (1418, 0.3, 0.06)))
    return (s * 0.6 + thunk(80, d) * 1.2 + hp(noise(d), 2000) * np.exp(-t / 0.01) * 0.6).astype(np.float32)
def whoosh(d=0.5, cut=1600):
    t = tt(d); return (lp(noise(d), cut) * np.sin(np.pi * t / d) ** 2 * 0.8).astype(np.float32)
def step(d=0.09):
    t = tt(d); return (lp(noise(d), 600) * np.exp(-t / 0.02) * 1.4 + hp(noise(d), 2500) * np.exp(-t / 0.006) * 0.3).astype(np.float32)
def slosh(d=0.35):
    t = tt(d); return (bp(noise(d), 250, 1400) * np.sin(np.pi * t / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)) * 0.9).astype(np.float32)
def tick(f0=3000, d=0.03):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.004)).astype(np.float32)
def tap(d=0.1):
    t = tt(d); return (lp(noise(d), 900) * np.exp(-t / 0.015) + 0.5 * np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.02)).astype(np.float32)
def scratch(d=0.26):
    # vinyl scratch: a chord snippet read back and forth at varying speed
    src = ep([midi(m) for m in (52, 55, 59, 62)], 0.8, 1.0) + 0.3 * noise(0.8)
    t = tt(d); rate = 2.6 * np.sin(2 * np.pi * t / d * 2.2) * np.exp(-t / 0.4)
    pos = np.clip(0.3 * SR + np.cumsum(rate), 0, len(src) - 2)
    s = np.interp(pos, np.arange(len(src)), src)
    return (bp(s, 200, 5000) * np.minimum(1, t / 0.005) * 1.4).astype(np.float32)
def vinn(d=0.5, f0=220, f1=1500):
    t = tt(d); f = f0 + (f1 - f0) * np.sin(np.pi * t / d * 0.5)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * (0.75 + 0.25 * np.sin(2 * np.pi * 30 * t))
    return (s * 0.5 + bp(noise(d), 1500, 6000) * np.sin(np.pi * t / d) * 0.15).astype(np.float32)
def ratchet(d, rate=9.0, f0=2600):
    out = np.zeros(int(d * SR), np.float32); k = 0
    while k / rate < d - 0.04:
        c = tick(f0 * (0.9 + 0.2 * rng.random()), 0.025) * (0.6 + 0.4 * rng.random()); i = int(k / rate * SR); out[i:i + len(c)] += c; k += 1
    return out
def hiss(d, lo=3000, hi=9000):
    t = tt(d); return (bp(noise(d), lo, hi) * (0.8 + 0.2 * np.sin(2 * np.pi * 1.3 * t)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)).astype(np.float32)
def boing(d=0.75, f0=170):
    t = tt(d); f = f0 * (1 + 0.6 * np.exp(-t * 5) * np.sin(2 * np.pi * 11 * t)) * (1 - 0.25 * t / d)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35) * np.minimum(1, t / 0.004)).astype(np.float32)
def roll(d):
    t = tt(d); s = lp(noise(d), 260) * 1.6 * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)
    for k in np.arange(0.2, d - 0.1, 0.62): i = int(k * SR); c = tick(1300, 0.02) * 0.25; s[i:i + len(c)] += c
    return s.astype(np.float32)
def cane(d=0.12):
    t = tt(d); return ((np.sin(2 * np.pi * 980 * t) + 0.5 * np.sin(2 * np.pi * 1530 * t)) * np.exp(-t / 0.018) * 0.8 + lp(noise(d), 3000) * np.exp(-t / 0.005) * 0.4).astype(np.float32)
def key_scrape(d=0.3):
    t = tt(d); return (bp(noise(d), 2500, 8000) * np.sin(np.pi * t / d) * 0.6 + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.15) * 0.15).astype(np.float32)
def cit(d=0.12):
    t = tt(d); return (hp(noise(d), 3000) * np.exp(-t / 0.004) * 1.2 + np.sin(2 * np.pi * 2900 * t) * np.exp(-t / 0.03) * 0.4 + np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.015) * 0.4).astype(np.float32)
def ting():
    t = tt(1.2); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in ((2637, 4), (3951, 6), (5274, 9))) * 0.3).astype(np.float32)
def pop(d=0.08):
    t = tt(d); f = 250 + 900 * t / d; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)).astype(np.float32)
def puff(d=0.45):
    t = tt(d); return (lp(noise(d), 1100) * np.minimum(1, t / 0.01) * np.exp(-t / 0.12) * 1.3).astype(np.float32)
def sigh(d=1.0):
    t = tt(d); s = bp(noise(d), 400, 2200) * np.sin(np.pi * t / d) ** 1.5
    return lp(s, 1600).astype(np.float32) * 0.9
def toyhorn(d=0.2, f0=430):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.03 * np.sin(2 * np.pi * 7 * t))) / SR
    s = np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.3
    return (bp(s.astype(np.float32), 500, 2600) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03) * 1.2).astype(np.float32)
def glide_down(d=2.0, f0=900, f1=240):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.3) * 0.5).astype(np.float32)
def horn(d=0.35, f0=410):
    t = tt(d); s = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (f0, f0 * 1.26)) * 0.5
    return (bp(s.astype(np.float32), 300, 2400) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.04) * 0.7).astype(np.float32)
def clack(d=0.1):
    t = tt(d); return ((np.sin(2 * np.pi * 1250 * t) * 0.7 + np.sin(2 * np.pi * 420 * t) * 0.5) * np.exp(-t / 0.02) + hp(noise(d), 2500) * np.exp(-t / 0.005) * 0.6).astype(np.float32)
def beep(d=0.07, f0=2100):
    t = tt(d); return fade((np.sin(2 * np.pi * f0 * t) * 0.6).astype(np.float32), 0.004, 0.02)
def hum(d):
    t = tt(d); return (0.35 * np.sin(2 * np.pi * 100 * t) + 0.15 * np.sin(2 * np.pi * 200 * t) + lp(noise(d), 500) * 0.25).astype(np.float32)
def traffic(d):
    t = tt(d); return (lp(noise(d), 220) * 1.4 + bp(noise(d), 300, 1400) * 0.35 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.21 * t))).astype(np.float32)
def room(d): return (lp(noise(d), 900) * 0.25).astype(np.float32)

def seg(fn, a, b, g, pan=0.0, bus=amb): bus.add(fade(fn(F(b) - F(a)), 0.05, 0.08), F(a), g, pan)

# ambiences per set
seg(room, 0, 32, 0.25)
for a, b in ((32, 253), (539, 895), (1225, 1339)): seg(hum, a, b, 0.32)
seg(room, 420, 539, 0.28)
seg(lambda d: hiss(d, 4000, 9000) * 0.25 + room(d) * 0.4, 253, 420, 0.35)       # blueprint "machine room"
seg(room, 895, 1049, 0.22)
seg(traffic, 1049, 1339 - 114, 0.34)

# 1  dash through the closing doors
sfx.add(ding(), F(0) - 0.02, 0.3, 0.1)
sfx.add(slide(0.5, 650), F(0), 0.5, -0.2)
for f in range(0, 15, 4): sfx.add(step(), F(f), 0.4, 0.1 if f % 8 else -0.1)
sfx.add(whoosh(0.35, 2200), F(8), 0.6)
sfx.add(slosh(0.4), F(11), 0.45, 0.2)
sfx.add(beep(0.09, 1900), F(13), 0.3, -0.3)
sfx.add(slide(0.45, 700), F(16), 0.45, 0.2)
# 2  impatience: watch ticks, foot taps, slosh, whip to the panel, first click
for k, f in enumerate(range(34, 62, 8)): sfx.add(tick(3200 if k % 2 == 0 else 2400, 0.03), F(f), 0.45, -0.3)
for f in range(37, 62, 7): sfx.add(tap(), F(f), 0.45, 0.25)
sfx.add(slosh(0.35), F(45), 0.35, 0.3)
sfx.add(whoosh(0.5, 1400), F(68), 0.4)
sfx.add(click(), F(100), 0.55, -0.15)
# 4  clicks speeding up
for f in (109, 123, 140, 144, 146, 148, 150, 151, 153, 154, 156, 157): sfx.add(click(0.06, 2400 + 60 * (f % 5)), F(f), 0.55 if f < 141 else 0.45, -0.15)
for f in (108, 122, 139): sfx.add(whoosh(0.12, 3000), F(f) - 0.03, 0.25)
# 5  doors glide shut
sfx.add(slide(1.15, 600), F(172), 0.36, 0.0); sfx.add(thunk(120, 0.25), F(207), 0.4)
# 6  finger-gun blow
sfx.add(lp(noise(0.35), 1800) * np.sin(np.pi * tt(0.35) / 0.35) * 0.8, F(236), 0.35, 0.2)
# 7-8  x-ray
sfx.add(scratch(), T_SCRATCH - 0.06, 0.5, 0.0)
sfx.add(vinn(0.55), F(254), 0.55)
sfx.add(ratchet(F(420) - F(262), 7.5), F(262), 0.22, 0.25)
sfx.add(hiss(F(336) - F(305) + 0.1, 3500, 9000), F(305), 0.45, -0.2)
sfx.add(ratchet(0.45, 22), F(337), 0.35, 0.25); sfx.add(slide(0.4, 900), F(338), 0.3); sfx.add(thunk(140, 0.3), F(350), 0.34)
for f in (370, 393): sfx.add(dead_click(), F(f), 0.5, -0.1); sfx.add(boing(0.7, 165), F(f) + 0.04, 0.3, 0.15)
# 9-11  wheelchair + cane
sfx.add(whoosh(0.4, 1800), F(418), 0.3)
seg(roll, 420, 538, 0.45, 0.0, sfx); seg(roll, 539, 588, 0.5, -0.1, sfx)
for f in range(426, 481, 16): sfx.add(cane(), F(f), 0.18, 0.3)
for f in range(486, 538, 14): sfx.add(cane(), F(f), 0.3, -0.25)
for f in range(548, 598, 13): sfx.add(cane(), F(f), 0.32, 0.15)
sfx.add(slide(0.5, 500) * 0.4, F(497), 0.3)
for f in range(556, 598, 7): sfx.add(tap(), F(f), 0.25, 0.35)
# 12  useless clicks while the sand keeps running
for f in (606, 614, 620, 626, 632, 638, 644): sfx.add(dead_click(), F(f), 0.36, -0.15)
sfx.add(hiss(F(652) - F(600), 3500, 9000), F(600), 0.3, 0.3)
# 13-14  firefighter
sfx.add(ting(), F(666), 0.4, -0.2)
sfx.add(key_scrape(0.3), F(684), 0.4, -0.1)
sfx.add(cit(), F(696), 0.45, -0.1)
sfx.add(click(0.08, 2200), F(707), 0.7, -0.1)
sfx.add(whoosh(0.18, 2600), F(713), 0.5)
sfx.add(slide(0.12, 1400), F(714), 0.36); sfx.add(metal_bang(0.8), F(716), 0.22)
sfx.add(slosh(0.4), F(719), 0.3, 0.2)
# 15-16  thought bubble, press, puff + relief
sfx.add(pop(), F(786), 0.4, -0.3)
sfx.add(click(), F(866), 0.55, -0.2)
sfx.add(puff(0.5), F(867), 0.6, 0.2)
sfx.add(sigh(1.1), F(870), 0.45, 0.0)
# 17-18  lab
sfx.add(whoosh(0.45, 1800), F(893), 0.4)
for f in (918, 940): sfx.add(toyhorn(0.16, 440), F(f), 0.32, 0.1); sfx.add(toyhorn(0.2, 440), F(f) + 0.22, 0.32, 0.1)
sfx.add(glide_down(2.1, 880, 230), F(972), 0.24, -0.2)
# 19-20  New York
sfx.add(whoosh(0.9, 1500), F(1047), 0.55)
for f, fq, pan in ((1058, 410, 0.4), (1090, 360, -0.5), (1150, 450, 0.5), (1196, 380, -0.4), (1214, 430, 0.3)): sfx.add(horn(0.32, fq), F(f), 0.2, pan)
sfx.add(horn(0.18, 410), F(1058) + 0.4, 0.22, 0.4)
seg(lambda d: hiss(d, 1800, 7000), 1049, 1224, 0.16, -0.3, sfx)
for f in range(1062, 1108, 9): sfx.add(step(0.08), F(f), 0.35, 0.1)
for f in range(1060, 1225, 30): sfx.add(beep(0.06, 2000), F(f), 0.22, 0.35)
for f in (1118, 1126, 1137, 1143, 1149, 1155, 1161, 1167): sfx.add(clack(), F(f), 0.45, -0.1)
sfx.add(vinn(0.4, 300, 1600), F(1148), 0.35)
sfx.add(whoosh(1.4, 1300), F(1172), 0.6)
r2 = np.random.default_rng(5)
for k in range(140):
    f = 1180 + 44 * (k / 140) ** 0.7 + r2.random() * 2
    sfx.add(clack(0.08), F(f), 0.08 + 0.12 * r2.random(), float(r2.uniform(-0.9, 0.9)))
# 21-22  final
sfx.add(whoosh(0.35, 1800), F(1223), 0.3)
sfx.add(click(), F(1316), 0.65, -0.15)
sfx.add(ding(), F(1317), 0.75, 0.05)

# ---------------- mix ----------------
def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
voice = load_voice()
# voice activity envelope (fast attack, slow release) -> ducking
a = np.abs(voice); k = int(0.03 * SR); a = np.convolve(a, np.ones(k) / k, "same")
thr = 10 ** (-42 / 20)
act = (a > thr).astype(np.float32)
rel = int(0.25 * SR); kk = np.ones(rel, np.float32)
act = np.minimum(1, np.convolve(act, kk, "full")[:N])
act = np.convolve(act, np.ones(int(0.04 * SR)) / int(0.04 * SR), "same").astype(np.float32)

def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
v_rms = rms(voice[act > 0.5])
m_mono = 0.5 * (music.L + music.R); m_rms = rms(m_mono[m_mono != 0]) if np.any(m_mono) else 1
target = v_rms * 10 ** (-17.5 / 20)            # music level in the gaps; ducked by 4 dB under speech -> ~21.5 dB below
mg = (target / m_rms) * (1 - (1 - 10 ** (-4 / 20)) * act)
sg = 1 - (1 - 10 ** (-6 / 20)) * act          # SFX dip 6 dB under speech
ag = 1 - (1 - 10 ** (-6 / 20)) * act
L = voice + music.L * mg + sfx.L * sg * 0.55 + amb.L * ag * 0.18
R = voice + music.R * mg + sfx.R * sg * 0.55 + amb.R * ag * 0.18
peak = max(np.abs(L).max(), np.abs(R).max())
if peak > 0.98: L, R = np.tanh(L / peak * 1.2) * 0.97, np.tanh(R / peak * 1.2) * 0.97
fd = int(0.03 * SR); L[-fd:] *= np.linspace(1, 0, fd); R[-fd:] *= np.linspace(1, 0, fd)
st = np.stack([L, R], 1)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# report: music level under speech
mm = 0.5 * (music.L + music.R) * mg
print(f"ok {len(pcm) / SR:.3f}s  voice rms {20 * np.log10(v_rms):.1f} dBFS  music under speech {20 * np.log10(rms(mm[act > 0.5]) / v_rms):.1f} dB  music in gaps {20 * np.log10(rms(mm[(act < 0.1) & (np.abs(mm) > 0)]) / v_rms):.1f} dB")
