"""Synthesized western music bed + SFX for "Das Duell auf der Insel", mixed ~20 dB under voice.mp3 (ducked).
Writes mix_raw.wav. All timings in seconds (frames/30)."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1414
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def lp(x, fc, o=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / fc) ** o); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp(x, fc, o=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / fc) ** o); return np.fft.irfft(X, len(x)).astype(np.float32)
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def M(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n, np.float32)
    for x in xs: o[:len(x)] += x
    return o
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def adsr(n, a=0.01, r=0.1):
    t = np.arange(n) / SR; d = n / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)

# ------------------------------------------------------------------ instruments
def whistle(f, d):
    t = tt(d); vib = 1 + 0.007 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / 0.25)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    s = np.sin(ph) + 0.08 * np.sin(2 * ph) + 0.03 * bp(noise(d), f * 0.8, f * 1.4)
    return (s * adsr(len(t), 0.05, 0.12)).astype(np.float32)
def banjo(f, d=0.35, bright=0.7):
    t = tt(d); s = np.zeros_like(t)
    for k in range(1, 9): s += (bright ** (k - 1)) * np.sin(2 * np.pi * f * k * t * (1 + 0.0015 * k)) * np.exp(-t * (7 + 5 * k))
    s += 0.25 * np.sin(2 * np.pi * f * t) * np.exp(-t * 3)
    return (s * adsr(len(t), 0.002, 0.03)).astype(np.float32)
def fiddle(f, d, trem=0.0, vibd=0.006):
    t = tt(d); vib = 1 + vibd * np.sin(2 * np.pi * 5.8 * t) * np.minimum(1, t / 0.3)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR; s = np.zeros_like(t)
    for k in range(1, 14): s += np.sin(k * ph) / k * (1 if k < 6 else 0.6)
    if trem: s *= 0.55 + 0.45 * np.sin(2 * np.pi * trem * t) ** 2
    return lp((s * adsr(len(t), 0.06, 0.12)).astype(np.float32), 3200) * 0.6
def tuba(f0, f1, d):
    t = tt(d); fr = f0 * (f1 / f0) ** np.clip((t - d * 0.35) / (d * 0.4), 0, 1)
    ph = 2 * np.pi * np.cumsum(fr) / SR; s = sum(np.sin(k * ph) / k ** 1.2 for k in range(1, 9))
    return lp((s * adsr(len(t), 0.04, 0.15)).astype(np.float32), 700)
def brass(fs, d, bright=2400):
    t = tt(d); s = np.zeros_like(t)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin(k * ph) / k ** 1.25 for k in range(1, 10))
    return lp((s * adsr(len(t), 0.05, 0.18)).astype(np.float32), bright) / len(fs)
def kick(d=0.45, f0=48):
    t = tt(d); f = f0 + 70 * np.exp(-t * 28)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)).astype(np.float32)
def tom(f0=90, d=0.5):
    t = tt(d); return (np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.5 * np.exp(-t * 20))) / SR) * np.exp(-t * 6) + lp(noise(d), 600) * np.exp(-t * 25) * 0.3).astype(np.float32)
def snare(d=0.2, a=1.0):
    t = tt(d); s = hp(noise(d), 1200) * np.exp(-t * 26) * 0.7 + np.sin(2 * np.pi * 185 * t) * np.exp(-t * 22) * 0.4
    return (s * a).astype(np.float32)
def brush(d=0.18):
    t = tt(d); return (bp(noise(d), 2000, 9000) * np.exp(-t * 18) * 0.5).astype(np.float32)
def cymbal(d=2.0):
    t = tt(d); return (hp(noise(d), 4000) * np.exp(-t * 2.2) * 0.4).astype(np.float32)

# ------------------------------------------------------------------ music
music = np.zeros(N, np.float32)
# A: duel tension 0 - 11.8  (A minor, 108 bpm), whistle melody, deep drum, low fiddle drone
bpm = 108; B = 60 / bpm
mel = [(69, 1.5), (76, 1.5), (74, .5), (72, .5), (71, 2), (69, 1), (67, 1), (69, 3), (None, 1), (72, 1.5), (74, .5), (76, 2), (79, 1), (77, .5), (76, .5), (74, 2), (76, 3)]
t0 = 0.25
for m, b in mel:
    if m and t0 < 11.6: place(music, whistle(midi(m), min(b * B * 0.95, 11.7 - t0)), t0, 0.22)
    t0 += b * B
place(music, fiddle(midi(45), 11.6) + fiddle(midi(52), 11.6) * 0.6, 0.0, 0.09)
for k in range(int(11.6 / B)):
    tb = 0.02 + k * B
    if k % 2 == 0: place(music, tom(70 if k % 4 == 0 else 82, 0.6), tb, 0.55)
    if k % 4 == 3: place(music, banjo(midi(45), 0.5, 0.5), tb, 0.25)
# B: sneaky banjo 13.1 - 22.5 (Am G F E walking eighths) + pizz bass + brushes
prog = [[57, 60, 64, 60], [55, 59, 62, 59], [53, 57, 60, 57], [52, 56, 59, 56]]
tb = 13.15; k = 0
while tb < 22.45:
    bar = prog[(k // 8) % 4]; n = bar[k % 4] - 12 + (12 if (k // 4) % 2 else 0)
    place(music, banjo(midi(n), 0.26, 0.75), tb, 0.3)
    if k % 2 == 0: place(music, banjo(midi(bar[0] - 24), 0.4, 0.3), tb, 0.35)
    if k % 4 == 2: place(music, brush(), tb, 0.6)
    k += 1; tb += B / 2
place(music, brass([midi(45), midi(48), midi(52)], 0.5, 1500) + kick(0.5) * 0.8, F(546), 0.5)   # angry accent (face goes red / steam)
place(music, tuba(midi(50), midi(45), 1.2), 20.22, 0.55)                                         # "uh-oh" on "Das Problem"
# C: crafty accelerating motif 22.6 - 28.2 (arps speed up), bright accent at sabres
tb = 22.62; k = 0; arps = [[57, 60, 64, 69], [60, 64, 67, 72], [62, 65, 69, 74], [64, 68, 71, 76]]
while tb < 28.2:
    sp = 1 - 0.3 * (tb - 22.6) / 5.6; a = arps[(k // 8) % 4]
    place(music, banjo(midi(a[k % 4] - 12), 0.24, 0.8), tb, 0.28)
    if k % 4 == 0: place(music, kick(0.35, 55), tb, 0.35)
    if k % 4 == 2: place(music, snare(0.15, 0.5), tb, 0.35)
    k += 1; tb += B / 2 * sp
place(music, brass([midi(64), midi(68), midi(71)], 0.9, 3500), F(818), 0.35)
# D: tension 28.3 - 31.95, tremolo fiddles + crescendo roll, then music stops dead
d = 31.95 - 28.3
place(music, (fiddle(midi(64), d, trem=11) + fiddle(midi(65), d, trem=11) * 0.7) * np.linspace(0.4, 1.3, int(d * SR)).astype(np.float32), 28.3, 0.13)
for k in range(int(d / B)): place(music, tom(62, 0.5), 28.32 + k * B, 0.45)
roll = np.zeros(int(1.0 * SR), np.float32)
for k in range(20): s = snare(0.08, 0.3 + 0.7 * k / 20); i = int(k * 0.05 * SR); roll[i:i + len(s)] += s[: len(roll) - i]
place(music, roll, 30.95, 0.35)
i0 = int(31.95 * SR); music[i0:i0 + int(1.48 * SR)] = 0  # silence until the "Ast" hit
# E: hit on "Ast"
place(music, M(brass([midi(33), midi(45), midi(48), midi(52)], 1.6, 1800), kick(1.0, 40) * 1.2, cymbal(2.2) * 0.8), F(1003), 0.55)
# F: comic deflation 37.2 - 39.1 (wah-wah) then cheerful fiddle 39.3 - 41.3
for i, (m0, m1, d) in enumerate([(62, 62, 0.45), (61, 61, 0.45), (60, 60, 0.45), (59, 57, 1.0)]):
    place(music, tuba(midi(m0), midi(m1), d) * (0.6 + 0.4 * np.sin(2 * np.pi * 4 * tt(d)) ** 2).astype(np.float32), 37.3 + i * 0.47, 0.3)
hoe = [74, 76, 78, 81, 78, 76, 74, 76, 78, 74, 71, 74, 76, 74]
for i, m in enumerate(hoe): place(music, fiddle(midi(m), B / 2 * 0.9, vibd=0.003), 39.3 + i * B / 2, 0.22)
for i in range(8): place(music, banjo(midi([50, 57][i % 2]), 0.3, 0.5), 39.3 + i * B, 0.3); place(music, brush(), 39.3 + i * B + B / 2, 0.5)
# G: proud march 41.3 - end (D major), final bright chord
mB = 60 / 112; chords = [[50, 54, 57, 62], [55, 59, 62, 67], [57, 61, 64, 69], [50, 54, 57, 62]]
tb = 41.32; k = 0
while tb < 46.1:
    ch = chords[(k // 4) % 4]
    if k % 4 == 0: place(music, brass([midi(m) for m in ch], mB * 3.8), tb, 0.28)
    place(music, kick(0.4, 50) if k % 2 == 0 else snare(0.18, 0.7), tb, 0.4)
    place(music, snare(0.1, 0.35), tb + mB * 0.75, 0.25)
    k += 1; tb += mB
melo = [(62, 1), (66, 1), (69, 2), (71, 1), (69, 1), (66, 2), (67, 1), (69, 1), (71, 1), (73, 1)]
tb = 41.32
for m, b in melo: place(music, brass([midi(m)], b * mB * 0.92, 3000), tb, 0.2); tb += b * mB
place(music, brass([midi(m) for m in [50, 57, 62, 66, 69, 74]], DUR - 46.15, 3800) + cymbal(DUR - 46.15), 46.15, 0.4)

# ------------------------------------------------------------------ SFX
sfx = np.zeros(N, np.float32); amb = np.zeros(N, np.float32)
def whoosh(d=0.5, fc=1600): t = tt(d); return (lp(noise(d), fc) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def slide_up(d=0.6, f0=300, f1=1600):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.02, 0.1) * 0.6).astype(np.float32)
def metal_draw(d=0.7):
    t = tt(d); s = bp(noise(d), 3000, 9000) * np.sin(np.pi * t / d) * 0.8
    s += sum(np.sin(2 * np.pi * f * t) * 0.15 for f in (2400, 3700)) * (t / d)
    return s.astype(np.float32)
def ting(): t = tt(1.4); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2637, 3), (3951, 5), (5274, 7)]) * 0.35).astype(np.float32)
def growl(d=0.8):
    t = tt(d); f = 95 + 15 * np.sin(2 * np.pi * 7 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 12)) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)); return lp((s * adsr(len(t), 0.05, 0.2)).astype(np.float32), 900)
def hiss(d=0.8): t = tt(d); return (hp(noise(d), 3000) * np.minimum(1, t / 0.05) * np.exp(-t * 1.5) * 0.6).astype(np.float32)
def rewind(d=1.2):
    t = tt(d); f = 900 + 2600 * (t / d) ** 1.5; ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.25 + bp(noise(d), 1500, 6000) * 0.4
    return (lp(s.astype(np.float32), 7000) * adsr(len(t), 0.03, 0.1) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t))).astype(np.float32)
def scratch(d):
    t = tt(d); s = bp(noise(d), 2500, 8000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 7 * t) > 0)) * 0.5; return (s * adsr(len(t), 0.02, 0.05)).astype(np.float32)
def crackle(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 14)): i = rng.integers(0, len(s) - 400); s[i:i + 300] += hp(noise(300 / SR), 2000) * np.exp(-np.arange(300) / 40) * rng.uniform(0.2, 1)
    return s
def clank(): t = tt(0.35); return (np.sin(2 * np.pi * 220 * t) * np.exp(-t * 18) + bp(noise(0.35), 800, 4000) * np.exp(-t * 30) + np.sin(2 * np.pi * 1310 * t) * np.exp(-t * 12) * 0.2).astype(np.float32)
def crumple(d=0.5): t = tt(d); s = hp(noise(d), 1500) * (rng.random(len(t)) > 0.7) * 0.9; return (s * np.sin(np.pi * t / d)).astype(np.float32)
def tok(f0=180, d=0.25): t = tt(d); return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 30) + bp(noise(d), 500, 3000) * np.exp(-t * 60) * 0.6).astype(np.float32)
def thud(d=0.6): return (kick(d, 42) + lp(noise(d), 300) * np.exp(-tt(d) * 10)[: int(d * SR)] * 0.8).astype(np.float32)
def gulp(): t = tt(0.25); f = 300 - 200 * t / 0.25; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.25) * 0.6).astype(np.float32)
def ding(): t = tt(1.2); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(1568, 2.5), (2352, 4), (3136, 6)]) * 0.35).astype(np.float32)
def creak_h(d=0.45, f0=110):
    t = tt(d); r = f0 * (1 + 0.5 * np.sin(np.pi * t / d)); ph = np.cumsum(r) / SR; p = (np.mod(ph, 1) < 0.07).astype(np.float32)
    return hp(lp(p * np.sin(np.pi * t / d), 2500), 200) * 2.0
def crack():
    d = 0.6; t = tt(d); s = hp(noise(d), 600) * np.exp(-t * 14) * 1.6
    for k in range(6): i = int(rng.uniform(0, 0.12) * SR); c = hp(noise(0.02), 1500) * 1.5; s[i:i + len(c)] += c
    return (s + tom(130, d) * 0.6).astype(np.float32)
def rustle(d): t = tt(d); return (bp(noise(d), 2500, 9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t + 3 * np.sin(2 * np.pi * 0.9 * t))) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.4) * 0.5).astype(np.float32)
def vowel_oo(f0, d):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.02 * np.sin(2 * np.pi * 5 * t) - 0.06 * t / d)) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 25)).astype(np.float32)
    s = bp(src, 250, 380) * 1.0 + bp(src, 750, 950) * 0.4
    return (s * adsr(len(t), 0.12, 0.35)).astype(np.float32)
def crowd_ooo(d=1.1): return sum(vowel_oo(f, d) * g for f, g in [(115, 1), (140, .8), (180, .7), (220, .6), (250, .5), (165, .7)]).astype(np.float32) * 0.6
def applause(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 120)): i = rng.integers(0, len(s) - 800); c = bp(noise(700 / SR), 800, 5000) * np.exp(-np.arange(700) / 90); s[i:i + 700] += c * rng.uniform(0.2, 1)
    t = tt(d); return s * np.minimum(1, t / 0.3)[: len(s)] * np.minimum(1, (d - t) / 0.4)[: len(s)]
def steam_whistle(d=1.3):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * t) for f in (196, 247, 294)) + bp(noise(d), 400, 1200) * 0.4
    return (s * adsr(len(t), 0.08, 0.3) * 0.35).astype(np.float32)
def pat(): t = tt(0.12); return (bp(noise(0.12), 600, 4000) * np.exp(-t * 50)).astype(np.float32)
def sparkle(d=0.8):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(9): f = rng.uniform(2500, 6000); c = np.sin(2 * np.pi * f * tt(0.25)) * np.exp(-tt(0.25) * 18); i = int(k / 9 * d * 0.7 * SR); s[i:i + len(c)] += c * 0.3
    return s
def pop(): t = tt(0.18); f = 900 * np.exp(-t * 14) + 200; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 20) * 0.9).astype(np.float32)
def puff(d=0.5): t = tt(d); return (lp(noise(d), 900) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def chirp(): t = tt(0.12); f = 3000 + 1500 * np.sin(np.pi * t / 0.12); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.12) * 0.3).astype(np.float32)
def flap(d=0.6):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 9)): c = bp(noise(0.05), 300, 2000) * np.sin(np.pi * tt(0.05) / 0.05); i = int(k / 9 * SR); s[i:i + len(c)] += c[: len(s) - i] * 0.6
    return s
def rattle(d):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 16)): c = np.sin(2 * np.pi * 3200 * tt(0.03)) * np.exp(-tt(0.03) * 120) + hp(noise(0.03), 4000) * 0.3; i = int(k / 16 * SR); s[i:i + len(c)] += c[: len(s) - i] * 0.3
    return s

# ambience: river, wind, reeds, birds on the island; room tone indoors
def river(d): t = tt(d); return (lp(noise(d), 700) * 0.5 + bp(noise(d), 1500, 4000) * 0.12 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.37 * t))).astype(np.float32)
def wind(d): t = tt(d); return (bp(noise(d), 200, 1200) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t + 1) ** 2) * 0.6).astype(np.float32)
def birds(d, dens=1.5):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * dens)):
        i = rng.integers(0, max(1, len(s) - 30000)); c = np.concatenate([chirp() * rng.uniform(0.3, 1) for _ in range(rng.integers(1, 4))]); s[i:i + len(c)] += c[: len(s) - i]
    return s
def env_fade(x, a=0.2, r=0.2): t = np.arange(len(x)) / SR; d = len(x) / SR; return x * np.minimum(1, t / a) * np.clip((d - t) / r, 0, 1)
for a_, b_ in [(0.0, 11.85), (28.27, 41.3)]:
    d = b_ - a_; place(amb, env_fade(river(d) * 0.5 + wind(d) * 0.5 + rustle(d) * 0.35 + birds(d) * 0.6, 0.05, 0.3), a_, 1.0)
for a_, b_ in [(13.2, 15.07), (16.57, 17.57), (22.53, 26.8)]:   # desk: candle crackle + room tone
    d = b_ - a_; place(amb, env_fade(crackle(d) * 0.5 + lp(noise(d), 250) * 0.15, 0.05, 0.1), a_, 1.0)
for a_, b_ in [(17.57, 22.53), (26.8, 28.27)]:                   # parlour room tone + clock-ish
    d = b_ - a_; place(amb, env_fade(lp(noise(d), 300) * 0.15, 0.05, 0.1), a_, 1.0)
place(amb, env_fade(lp(noise(5.8), 200) * 0.2 + sparkle(5.8) * 0.15, 0.1, 0.5), 41.3, 1.0)

S = lambda sig, t, g=1.0: place(sfx, sig, t, g)
S(whoosh(0.5, 2200), 0.0, 0.8); S(wind(1.0) * 0.8, 0.0, 0.8)                     # hook burst in
S(slide_up(0.62, 260, 1500), F(82), 0.55)                                         # the leg tilt "vuuuup"
S(flap(0.9), F(134), 0.7); S(chirp(), F(150), 0.8); S(chirp(), F(160), 0.6)        # bird struggles up to his shoulder
S(metal_draw(0.65), F(194), 0.7); S(ting(), F(236), 0.85)                        # sabre drawn + glint
S(whoosh(0.35, 3000), F(266), 0.8)                                                # whip pan to the rival
S(growl(0.9), F(300), 0.45)                                                       # rival grumbles, chest out
S(rewind(1.25), F(354), 0.55); S(whoosh(0.4), F(390), 0.6)                         # rewind "vırrrt" + flash
S(scratch(1.7), F(400), 0.35)                                                     # quill scratching
for k in range(2): S(clank(), F(452) + 0.22 + k * 0.98, 0.6)                      # press "çak-çak"
S(whoosh(0.3, 3000), F(452), 0.5)
S(scratch(0.75), F(499), 0.45)                                                    # signs "Anonym"
S(growl(0.7), F(531), 0.5); S(hiss(0.9), F(543), 0.55); S(crumple(0.45), F(556), 0.8)
S(tok(160, 0.3), F(578), 1.0); S(thud(0.5), F(590), 0.8)                          # seal "tok" + slam
for k in range(9): S(tok(420 + 40 * (k % 3), 0.12), F(610 + 4 * k), 0.55)          # holes appear "tak tak tak"
S(whoosh(0.3), F(643), 0.5)
S(gulp(), F(686), 0.7); S(ding(), F(706), 0.6); S(puff(0.4), F(706), 0.4)           # gulp, idea!
S(tok(140, 0.3), F(767), 0.9); S(scratch(0.7) * 0.4, F(772), 0.6)                  # lid slammed, case pushed aside
S(creak_h(0.45, 90), F(806), 0.7); S(ting(), F(818), 0.65)                        # sword case hinge + gleam
S(tok(110, 0.3), F(850), 0.8)                                                     # the board
S(tok(300, 0.1), F(899), 0.5)                                                     # toe at the board
S(metal_draw(1.2) * 0.4, F(936), 0.5)                                             # slow raise shimmer
S(whoosh(0.22, 4000), F(998), 1.0); S(crack(), F(1003), 1.0)                      # "vuuş" + "ÇAT" on "Ast"
S(rustle(2.2), F(1004), 0.8); S(thud(0.7), F(1030), 0.9)                          # leaves + branch lands "güm"
S(crowd_ooo(1.2), F(1086), 0.55)                                                  # "ooo"
S(rattle(1.8), F(1120), 0.35)                                                     # trembling sabre
S(whoosh(0.4), F(1178), 0.5); S(steam_whistle(1.3), F(1196), 0.5); S(pat(), F(1206), 0.9)
S(applause(1.8), F(1212), 0.45)
S(whoosh(0.5, 2500), F(1239), 0.7)
for f0 in (1262, 1285): S(puff(0.45), F(f0), 0.5); S(sparkle(0.7), F(f0), 0.8)
S(pop(), F(1324), 0.9); S(sparkle(0.8), F(1325), 0.7)                             # top hat "pop"
S(whoosh(0.4, 3000), F(1356), 0.7); S(rustle(0.6), F(1361), 0.6); S(ting(), F(1364), 0.8)  # banknote: rustle + "çınn"

# ------------------------------------------------------------------ mix
voice = load_voice()
def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
k = int(0.04 * SR); ve = np.convolve(np.abs(voice), np.ones(k) / k, "same"); act = ve > ve.max() * 0.06
v_rms = rms(voice[act])
bed = music + amb * 0.6
b_rms = rms(bed[bed != 0]) if np.any(bed) else 1
bed *= (v_rms * 10 ** (-18.5 / 20)) / b_rms                     # bed ~20 dB under the voice
duck = np.convolve(act.astype(np.float32), np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
bed *= (1 - 0.45 * duck)                                         # extra ~5 dB dip under speech
s_rms = rms(sfx[np.abs(sfx) > 1e-4])
sfx *= (v_rms * 10 ** (-12 / 20)) / s_rms
sfx *= (1 - 0.3 * duck)
# sidechain limiter: while the narrator speaks, bed+sfx stay >= 8 dB below the voice (50 ms windows, smoothed)
other = bed + sfx
w = int(0.05 * SR); ker = np.ones(w) / w
venv = np.sqrt(np.convolve(voice ** 2, ker, "same")) + 1e-6
oenv = np.sqrt(np.convolve(other ** 2, ker, "same")) + 1e-6
vact = np.convolve(act.astype(np.float32), np.ones(int(0.08 * SR)) / int(0.08 * SR), "same") > 0.05
g = np.where(vact, np.minimum(1.0, venv * 10 ** (-8 / 20) / oenv), 1.0).astype(np.float32)
# fast attack / 120 ms release smoothing (min-filter then average)
from numpy.lib.stride_tricks import sliding_window_view
k2 = int(0.03 * SR); gp = np.pad(g, (k2 // 2, k2 - k2 // 2 - 1), constant_values=1.0); g = sliding_window_view(gp, k2).min(axis=1)
g = np.convolve(g, np.ones(int(0.06 * SR)) / int(0.06 * SR), "same").astype(np.float32)
bed *= g; sfx *= g
mix = voice + bed + sfx
pk = np.max(np.abs(mix)); mix = mix / pk * 0.95
fade = int(0.35 * SR); mix[-fade:] *= np.linspace(1, 0, fade) ** 1.5
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR, "voice rms dB", 20 * np.log10(v_rms))
import os
if os.environ.get("STEMS"):
    for name, x in [("stem_voice.wav", voice / pk * 0.95), ("stem_bed.wav", (bed + sfx) / pk * 0.95), ("stem_music.wav", bed / pk * 0.95)]:
        with wave.open(name, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
