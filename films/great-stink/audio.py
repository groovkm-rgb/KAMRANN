"""Der große Gestank: synthesized light music-hall bed + SFX, mixed under the user's voice.mp3.
Music sits ~22 dB under speech (ducked under every phrase, a little higher in the gaps); SFX are synced to shots."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1443
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(1858)
F = lambda f: f / 30
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def adsr(n, a=0.01, r=0.1):
    t = np.arange(n) / SR; d = n / SR
    return (np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)).astype(np.float32)
def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * g
def norm(x): m = np.max(np.abs(x)) + 1e-9; return (x / m).astype(np.float32)

# ---------------- instruments ----------------
def harm(f, d, weights, vib=0.0, vr=5.5, a=0.02, r=0.08, glide=0.0):
    t = tt(d); fr = f * (1 + glide * t / max(d, 1e-3)) * (1 + vib * np.sin(2 * np.pi * vr * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = sum(w * np.sin((k + 1) * ph) for k, w in enumerate(weights) if (k + 1) * f < 15000)
    return (s * adsr(len(t), a, r)).astype(np.float32)
def tuba(m, d): return lp(harm(midi(m), d, [1, .8, .55, .4, .28, .2, .14, .1], a=0.03, r=0.1), 700)
def bassoon(m, d, vib=0.004): return lp(harm(midi(m), d, [.5, 1, .8, .6, .5, .35, .25, .2, .12], vib, a=0.025, r=0.06), 2200) * 0.8
def pizz(m, d=0.3):
    t = tt(d); f = midi(m); s = sum((0.55 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(6))
    return (s * np.exp(-t * 14) * np.minimum(1, t / 0.002)).astype(np.float32)
def organ(ms, d):
    s = sum(harm(midi(m), d, [1, .6, 0, .35, 0, 0, 0, .2], vib=0.0015, a=0.12, r=0.25) for m in ms); return lp(s / len(ms), 3000)
def laterna(m, d): return lp(harm(midi(m), d, [1, .7, .6, .45, .4, .3, .25, .2], vib=0.006, vr=6.5, a=0.01, r=0.05), 3500) * 0.7
def brass(ms, d, a=0.05):
    s = sum(harm(midi(m), d, [1, .9, .75, .6, .48, .36, .27, .2, .14], vib=0.003, a=a, r=0.12) for m in ms); return lp(s / len(ms), 2400)
def timp(m, d=0.6): t = tt(d); return (np.sin(2 * np.pi * midi(m) * t * (1 + 0.02 * np.exp(-t * 20))) * np.exp(-t * 5) + lp(noise(d), 400) * np.exp(-t * 30) * 0.4).astype(np.float32)
def cym(d=1.2): t = tt(d); return (hp(noise(d), 5000) * np.exp(-t * 3.5) * 0.5).astype(np.float32)
def glock(m, d=0.6): t = tt(d); f = midi(m); return ((np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 6)).astype(np.float32)

def mixs(*xs):
    L = max(len(x) for x in xs); o = np.zeros(L, np.float32)
    for x in xs: o[:len(x)] += x
    return o
music = np.zeros(N, np.float32)
def seq(t0, bpm, notes, inst, g=1.0, stop=None):
    """notes: list of (beat_offset, midi or list, beats)"""
    b = 60 / bpm
    for off, m, ln in notes:
        ts = t0 + off * b
        if stop is not None and ts >= stop: continue
        d = ln * b * 0.95
        if stop is not None: d = min(d, stop - ts)
        if d <= 0.02: continue
        place(music, inst(m, d), ts, g)

# 1) 0 - 2.93 heroic fanfare (caped cloud)
seq(0.0, 100, [(0, [60, 64, 67], 0.5), (0.5, [60, 64, 67], 0.5), (1, [65, 69, 72], 0.75), (1.75, [67, 71, 74], 0.75), (2.5, [72, 76, 79], 2.2)], brass, 0.9, stop=2.95)
place(music, timp(36, 0.5), 0.0, 0.8); place(music, timp(43, 0.5), 0.9, 0.6); place(music, timp(36, 1.0), 1.5, 0.9); place(music, cym(1.4), 1.5, 0.6)
seq(0.0, 100, [(0, 36, 1), (1, 43, 1), (2, 36, 2)], tuba, 0.8, stop=2.95)
# 2) 2.93 - 12.5 stinky tuba-bassoon theme (D minor, oom-pah, plodding)
T0, T1 = 2.93, 12.5; bpm = 100; b = 60 / bpm; bars = int((T1 - T0) / (4 * b)) + 1
roots = [38, 38, 43, 45, 38, 41, 43, 45]
for k in range(bars):
    r = roots[k % 8]; t = T0 + k * 4 * b
    seq(t, bpm, [(0, r, 0.9), (2, r + 7, 0.9)], tuba, 1.0, stop=T1)
    seq(t, bpm, [(1, [r + 24, r + 27 + (0 if r != 45 else 1), r + 31], 0.4), (3, [r + 24, r + 27 + (0 if r != 45 else 1), r + 31], 0.4)], lambda m, d: sum(pizz(x, 0.25) for x in m) / 3, 0.6, stop=T1)
mel = [(0, 62, 1.5), (1.5, 61, 0.5), (2, 62, 1), (3, 65, 1), (4, 64, 0.5), (4.5, 63, 0.5), (5, 62, 2), (8, 57, 1), (9, 58, 0.5), (9.5, 59, 0.5), (10, 60, 1), (11, 61, 1), (12, 62, 3), (16, 69, 1), (17, 68, 0.5), (17.5, 67, 0.5), (18, 66, 1), (19, 65, 1), (20, 64, 2), (22, 62, 2)]
seq(T0 + 4 * b, bpm, mel, bassoon, 0.55, stop=T1)
# 3) 12.5 - 14.27 escape gallop (fast, rising)
seq(12.5, 168, [(i * 0.5, [50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72][i % 14], 0.45) for i in range(10)], lambda m, d: mixs(pizz(m, 0.2), 0.5 * bassoon(m, d)), 0.8, stop=14.25)
seq(12.5, 168, [(i, [38, 45][i % 2], 0.9) for i in range(5)], tuba, 0.9, stop=14.25)
# 4) 14.27 - 22.2 pompous gothic organ / brass (Parliament)
G0 = 14.27; gb = 60 / 84
ch = [[50, 57, 62, 65], [55, 58, 62, 67], [52, 57, 61, 64], [50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61], [45, 49, 52, 57]]
for k, c in enumerate(ch):
    t = G0 + k * 2 * gb
    if t < 21.2: place(music, organ(c, min(2 * gb, 21.25 - t)), t, 0.8); place(music, tuba(c[0] - 12, min(gb * 0.9, 21.25 - t)), t, 0.7)
seq(G0 + 4 * gb, 84, [(0, [62, 65, 69], 0.75), (0.75, [62, 65, 69], 0.25), (1, [67, 70, 74], 1.5), (4, [64, 69, 73], 0.75), (4.75, [64, 69, 73], 0.25), (5, [65, 69, 74], 1.5)], brass, 0.35, stop=21.2)
# sad wah-wah on "Es hilft nichts"
def wah(m, d, deep=False):
    t = tt(d); f = midi(m) * (1 + (0.012 * np.sin(2 * np.pi * 5.5 * t) if deep else 0)); ph = 2 * np.pi * np.cumsum(np.full(len(t), f)) / SR
    open_ = 0.5 - 0.5 * np.cos(2 * np.pi * t / (d if not deep else 0.33)); s = np.zeros(len(t))
    for k in range(10): s += np.sin((k + 1) * ph) * (1 / (k + 1)) * (open_ if k > 1 else 1)
    return (lp(s.astype(np.float32), 2000) * adsr(len(t), 0.02, 0.1)).astype(np.float32)
for i, (m, d) in enumerate([(58, 0.32), (57, 0.32), (56, 0.32), (55, 1.0)]):
    place(music, wah(m, d, i == 3), 21.22 + i * 0.33, 0.9)
# 5) 22.2 - 25.23 sleepy, slowed-down laterna version (pitch sags)
S0 = 22.25; sb = 60 / 62
for i, (off, m, ln) in enumerate([(0, 62, 1), (1, 61, 0.5), (1.5, 62, 1), (2.5, 65, 1.5)]):
    ts = S0 + off * sb; place(music, laterna(m - 0.0, ln * sb * 0.9) * 0.8, ts, 0.7)
for i in range(3):
    ts = S0 + i * 2 * sb
    if ts < 25.2: place(music, tuba(38 - i, min(1.6 * sb, 25.2 - ts)), ts, 0.7)
place(music, harm(midi(57), 1.2, [1, .5, .3], glide=-0.25, a=0.05, r=0.4) * 0.5, 23.9, 0.6)
# 6) 25.23 - 29.0 accelerating crescendo -> victory chord on the seal (29.03)
A0, A1 = 25.25, 29.0; t = A0; i = 0; scale = [50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76]
while t < A1 - 0.05:
    frac = (t - A0) / (A1 - A0); step = 0.36 * (1 - frac * 0.68)
    m = scale[i % len(scale)] + 12 * (i // len(scale)); place(music, pizz(m, 0.22) * (0.5 + 0.7 * frac), t, 0.8)
    if i % 2 == 0: place(music, tuba(38 + (i // 4) % 5 * 2, step * 0.9) * (0.6 + 0.5 * frac), t, 0.8)
    if frac > 0.4 and i % 2 == 1: place(music, brass([m, m + 4], step * 0.8) * frac, t, 0.4)
    t += step; i += 1
place(music, timp(38, 1.0), 28.6, 0.6)
place(music, brass([48, 60, 64, 67, 72], 1.6, a=0.02), 29.03, 1.0); place(music, cym(1.6), 29.03, 0.9); place(music, timp(36, 1.2), 29.03, 1.0)
# 7) 29.6 - 32.8 mysterious pizzicato (E minor), cut by the record scratch
seq(29.62, 96, [(0, 52, .5), (1, 55, .5), (1.5, 59, .5), (2, 58, .5), (3, 55, .5), (4, 52, .5), (4.5, 51, .5), (5, 52, .5), (6, 64, .5), (6.5, 63, .5), (7, 60, .5)], lambda m, d: pizz(m, 0.3), 0.9, stop=32.8)
seq(29.62, 96, [(0, 40, 2), (2, 39, 2), (4, 40, 2)], lambda m, d: lp(harm(midi(m), d, [1, .3, .1], a=.1, r=.2), 400), 0.6, stop=32.8)
# 8) 34.07 - 36.7 sneaky germ motif (staccato bassoon + glock)
seq(34.07, 112, [(0, 52, .4), (.5, 53, .4), (1, 54, .4), (1.5, 55, .4), (2.5, 52, .3), (3, 60, .4), (4, 59, .4), (4.5, 58, .4), (5, 57, .8)], lambda m, d: bassoon(m, d * 0.6), 0.8, stop=36.7)
seq(34.07, 112, [(0.75, 76, .3), (2.75, 79, .3), (3.75, 84, .3)], lambda m, d: glock(m), 0.4, stop=36.7)
# 9) 36.7 - 42.6 heroic & hopeful brass (construction + rescue)
H0 = 36.72; hb = 60 / 104
prog = [[48, 55, 60, 64], [53, 57, 60, 65], [55, 59, 62, 67], [48, 55, 60, 64], [53, 57, 60, 65], [57, 60, 64, 69], [55, 59, 62, 67], [48, 55, 64, 72]]
for k, c in enumerate(prog):
    ts = H0 + k * 2 * hb
    if ts < 42.6: place(music, brass(c[1:], min(2 * hb * 0.95, 42.6 - ts)), ts, 0.5); place(music, tuba(c[0] - 12, hb * 0.8), ts, 0.8); place(music, tuba(c[0] - 5, hb * 0.8), ts + hb, 0.6)
seq(H0, 104, [(0, 67, 1.5), (1.5, 72, .5), (2, 72, 1), (3, 74, 1), (4, 76, 2), (6, 74, 1), (7, 72, 1), (8, 77, 1.5), (9.5, 76, .5), (10, 74, 2), (12, 79, 3)], lambda m, d: brass([m], d), 0.45, stop=42.6)
for k in range(int((42.6 - H0) / hb)): place(music, timp(36 if k % 2 == 0 else 43, 0.3), H0 + k * hb, 0.25)
# 10) 42.6 - end warm happy finale (laterna waltz) + last chord
W0 = 42.62; wb = 60 / 132
wal = [(0, 72, 2), (2, 71, 1), (3, 72, 2), (5, 76, 1), (6, 79, 3), (9, 77, 2), (11, 76, 1), (12, 74, 3), (15, 72, 2), (17, 74, 1), (18, 76, 3), (21, 72, 3)]
seq(W0, 132, wal, laterna, 0.6, stop=47.3)
for k in range(int((47.3 - W0) / (3 * wb))):
    r = [48, 53, 55, 48][k % 4]; ts = W0 + k * 3 * wb
    place(music, tuba(r - 12, wb * 0.9), ts, 0.8)
    for j in (1, 2): place(music, sum(pizz(x, 0.2) for x in [r + 12, r + 16, r + 19]) / 3, ts + j * wb, 0.5)
place(music, brass([48, 55, 60, 64, 67, 72], 1.6, a=0.03), 47.3, 0.9); place(music, timp(36, 1.4), 47.3, 0.8); place(music, glock(84, 1.2), 47.3, 0.4)
fade_i = int((DUR - 0.25) * SR); music[fade_i:] *= np.linspace(1, 0, N - fade_i)

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def whoosh(d=0.45, lo=300, hi=2500):
    t = tt(d); s = bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2; return norm(s)
def flaps(d=2.4, rate=7):
    t = tt(d); s = bp(noise(d), 400, 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rate * t))) ** 3 * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3); return norm(s)
def crickets(d):
    t = tt(d); car = np.sin(2 * np.pi * 4700 * t); am = (np.sin(2 * np.pi * 30 * t) > 0.3) * (np.sin(2 * np.pi * 2.2 * t) > 0); return norm(car * am * np.minimum(1, t / 0.3))
def fan(d): t = tt(d); return norm(bp(noise(d), 800, 5000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.5 * t))))
def pant(d): t = tt(d); return norm(bp(noise(d), 600, 2500) * np.abs(np.sin(2 * np.pi * 4.5 * t)) ** 2)
def click(f0=3000, d=0.08): t = tt(d); return norm((np.sin(2 * np.pi * f0 * t) * np.exp(-t * 60) + hp(noise(d), 4000) * np.exp(-t * 90)))
def blup(f0=180, d=0.12): t = tt(d); return norm(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 3 * t / d)) / SR) * np.sin(np.pi * t / d))
def water(d, c=1200): t = tt(d); return norm(lp(noise(d), c) + 0.3 * bp(noise(d), 1500, 4000) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)))
def buzz(d, f0=210):
    t = tt(d); ph = np.cumsum(f0 * (1 + 0.05 * np.sin(2 * np.pi * 3 * t) + 0.03 * np.sin(2 * np.pi * 11 * t))) / SR
    return norm(lp(((ph % 1) * 2 - 1).astype(np.float32), 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.8 * t)) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2))
def drone(d): t = tt(d); s = np.sin(2 * np.pi * np.cumsum(70 + 40 * t / d) / SR) * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * t)); return norm(lp(s.astype(np.float32), 400) * np.sin(np.pi * t / d))
def meow():
    t = tt(0.55); f = 650 - 250 * (t / 0.55) + 120 * np.sin(np.pi * t / 0.55); ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(bp(sum(np.sin(k * ph) / k for k in range(1, 8)).astype(np.float32), 400, 3000) * np.sin(np.pi * t / 0.55))
def thud(f0=90, d=0.3): t = tt(d); return norm(np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp(noise(d), 1000) * np.exp(-t * 35) * 0.5)
def hooves(d, rate=6.5):
    out = np.zeros(int(d * SR), np.float32); k = 0; tcur = 0.0
    while tcur < d - 0.1:
        for off in (0, 0.06, 0.13): place_local(out, mixs(thud(500 + 80 * rng.random(), 0.08) * 0.8, click(1500, 0.05) * 0.3), tcur + off)
        tcur += 1 / rate * 2.2
    return norm(out)
def place_local(buf, sig, t0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i]
def whip(): d = 0.25; t = tt(d); return norm(hp(noise(d), 2000) * np.exp(-((t - 0.04) / 0.012) ** 2) + np.sin(2 * np.pi * np.cumsum(800 + 3000 * t) / SR) * np.exp(-t * 40) * 0.3)
def bell(d=3.0):
    t = tt(d); f = 196; s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, a, k in [(0.5, .6, .6), (1, 1, .9), (1.19, .5, 1.3), (1.5, .4, 1.6), (2.0, .4, 2), (2.74, .25, 2.6), (3.0, .2, 3)])
    return norm(s * np.minimum(1, t / 0.003))
def splat(): d = 0.3; t = tt(d); return norm(lp(noise(d), 1800) * np.exp(-t * 18) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 25) * 0.6)
def drip(): d = 0.12; t = tt(d); return norm(np.sin(2 * np.pi * np.cumsum(900 + 1800 * t / d) / SR) * np.exp(-t * 35))
def sniff(): d = 0.35; t = tt(d); return norm(bp(noise(d), 1500, 6000) * np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.25) * 40))
def woozy(d=0.8): t = tt(d); return norm(np.sin(2 * np.pi * np.cumsum(500 - 300 * t / d + 60 * np.sin(2 * np.pi * 7 * t)) / SR) * np.sin(np.pi * t / d))
def yawn(d=1.0):
    t = tt(d); f = 160 + 90 * np.sin(np.pi * t / d) - 60 * t / d; ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 12)); return norm(bp(s.astype(np.float32), 250, 1600) * np.sin(np.pi * t / d) ** 1.5)
def puff(): d = 0.35; t = tt(d); return norm(lp(noise(d), 900) * np.exp(-t * 12) * np.minimum(1, t / 0.01))
def flips(d, rate=9): t = tt(d); return norm(bp(noise(d), 1500, 7000) * (np.abs(np.sin(2 * np.pi * rate * t)) ** 6))
def ratchet(d):
    out = np.zeros(int(d * SR), np.float32); tcur = 0.0
    while tcur < d - 0.02: place_local(out, click(2200, 0.03), tcur); tcur += 0.07 * (1 - 0.8 * tcur / d)
    return norm(out + 0.3 * norm(bp(noise(d), 300, 1200)) * np.linspace(0, 1, len(out)))
def stampTok(): return norm(mixs(thud(110, 0.45), click(900, 0.1) * 0.6))
def hurra(d=1.2):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for k in range(10): f = 180 + 120 * rng.random(); ph = 2 * np.pi * np.cumsum(f * (1 + 0.15 * np.sin(np.pi * t / d))) / SR; s += bp(sum(np.sin(j * ph) / j for j in range(1, 8)).astype(np.float32), 300, 2500) * np.roll(np.sin(np.pi * t / d), int(rng.random() * 0.1 * SR))
    return norm(s * np.sin(np.pi * t / d))
def scratch():
    d = 0.6; t = tt(d); rate = np.where(t < 0.25, 1 - 2.5 * t, 0.4 + 0.6 * np.sin(2 * np.pi * 4 * t)); s = bp(noise(d), 800, 6000) * np.abs(rate)
    tone = np.sin(2 * np.pi * np.cumsum(900 * rate) / SR) * 0.4; return norm((s + tone) * np.minimum(1, (d - t) / 0.05))
def slide(): d = 0.5; t = tt(d); return norm(np.sin(2 * np.pi * np.cumsum(1800 - 1300 * t / d) / SR) * np.sin(np.pi * t / d))
def giggle(f0=1300, n=5):
    out = [];
    for k in range(n): d = 0.08; t = tt(d); out.append(np.sin(2 * np.pi * (f0 + 150 * (k % 2)) * t * (1 + 0.2 * t / d)) * np.sin(np.pi * t / d)); out.append(np.zeros(int(0.03 * SR)))
    return norm(np.concatenate(out).astype(np.float32))
def squeak(d=0.5):
    t = tt(d); rate = 160 * (1 + 0.4 * np.sin(2 * np.pi * 1.6 * t / d)); ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.1).astype(np.float32)
    return norm(hp(lp(pulses, 3000), 300) * np.sin(np.pi * t / d))
def clink(): d = 0.25; t = tt(d); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 18) for f in (1800, 2700, 4100)) + hp(noise(d), 3000) * np.exp(-t * 60))
def scrape(d=0.5): t = tt(d); return norm(bp(noise(d), 1500, 6000) * np.sin(np.pi * t / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t)))
def byebye(): return giggle(1700, 4)
def laugh_kids(d=1.0):
    out = np.zeros(int(d * SR), np.float32); tcur = 0.0
    while tcur < d - 0.15: place_local(out, giggle(700 + 300 * rng.random(), 3) * 0.7, tcur); tcur += 0.35 + 0.2 * rng.random()
    return norm(out)
def birds(d):
    out = np.zeros(int(d * SR), np.float32); tcur = 0.0
    while tcur < d - 0.2:
        dd = 0.12; t = tt(dd); place_local(out, np.sin(2 * np.pi * np.cumsum(3000 + 1500 * np.sin(np.pi * t / dd)) / SR) * np.sin(np.pi * t / dd), tcur); tcur += 0.18 + 0.4 * rng.random()
    return norm(out)
def sparkle(): return norm(sum(glock(m, 0.8) for m in (91, 96)) )
def echo(x, delay=0.11, fb=0.45, n=6):
    y = x.copy(); dl = int(delay * SR)
    for k in range(1, n): y = np.concatenate([y, np.zeros(dl, np.float32)]); y[k * dl: k * dl + len(x)] += x * fb ** k
    return y
def step(): return norm(lp(noise(0.08), 2500) * np.exp(-tt(0.08) * 50) + np.sin(2 * np.pi * 120 * tt(0.08)) * np.exp(-tt(0.08) * 40))
def clang(): d = 1.4; t = tt(d); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(310, 3), (742, 4), (1190, 5), (1730, 7)]) + lp(noise(d), 1500) * np.exp(-t * 25))
def bus(d=2.0): t = tt(d); s = lp(noise(d), 300) * 1.5 + np.sin(2 * np.pi * np.cumsum(60 * (1.08 - 0.16 * t / d)) / SR) * 0.6; return norm(s * np.sin(np.pi * t / d) ** 2)
def hum(d): return norm(lp(noise(d), 500))

# cue table (seconds = frame / 30). dB gains are relative to the loudest voice peak.
CUES = [
    (whoosh(0.8, 200, 1800), 0.0, -16), (flaps(2.6), 0.15, -22), (whoosh(0.5, 400, 3000), 1.9, -20),
    (whoosh(0.35), F(86), -22), (crickets(2.4), F(88), -30), (fan(2.3), F(95), -28), (pant(1.6), F(120), -28), (click(2600), F(140), -16), (click(4200, 0.05), F(141), -20),
    (whoosh(0.35), F(158), -22), (water(4.3, 900), F(160), -28), (buzz(4.0), F(170), -30),
    *[(blup(150 + 60 * k, 0.12), F(165) + 0.37 * k + 0.1 * (k % 3), -22) for k in range(22)],
    (water(1.5, 1600), F(243), -22), (whoosh(0.3), F(243), -24),
    (drone(2.6), F(292), -22), (buzz(2.8, 240), F(292), -30), (meow(), F(342), -18), (puff(), F(354), -16), (thud(70, 0.3), F(355), -18),
    (whoosh(0.3), F(373), -22), (hooves(1.7), F(377), -18), (whip(), F(377), -18), (lp(noise(1.6), 200), F(378), -28),
    (bell(3.0), F(430), -15), (whoosh(1.2, 150, 900), F(440), -26),
    (whoosh(0.3), F(497), -24), *[(splat(), x, -18) for x in (16.9, 17.65, 18.35, 18.95)], *[(drip(), 17.0 + 0.27 * k, -28) for k in range(8)],
    *[(sniff(), x, -22) for x in (19.4, 20.0, 20.55)],
    (woozy(0.6), F(638), -20), (thud(100, 0.3), F(652), -14), (giggle(2400, 3), F(654), -30),
    (whoosh(0.35), F(665), -24), (yawn(1.1), 22.45, -20), (puff(), F(680), -20), (yawn(0.9), 23.9, -22), (flips(2.3), 23.0, -28),
    (whoosh(0.5, 300, 4000), F(756), -20), (flips(1.4, 14), F(760), -22),
    (ratchet(0.95), F(823), -18), (whoosh(0.3), F(849), -22), (stampTok(), F(869), -10), (hurra(1.0), F(874), -26), (whoosh(0.4, 600, 4000), F(874), -26),
    (whoosh(0.3), F(884), -24), (scratch(), F(984), -12), (slide(), F(990), -18),
    (giggle(1300, 5), 34.3, -24), (giggle(1500, 4), 35.0, -24), (whoosh(0.3), F(1050), -22), (water(1.3, 1500), F(1052), -24), (squeak(0.6), F(1084), -20), (water(0.8, 2500), F(1090), -22), (giggle(1700, 3), F(1092), -22),
    (whoosh(0.3), F(1099), -22), *[(clink(), F(1102) + k * 0.21, -22) for k in range(5)], (scrape(0.5), F(1104), -24), (squeak(1.0), F(1110), -28),
    (water(2.2, 1200), F(1137), -20), (byebye(), 38.5, -24), (byebye(), 39.3, -24),
    (whoosh(0.3), F(1201), -22), (laugh_kids(2.2), F(1205), -26), (birds(2.4), F(1206), -28), (sparkle(), F(1210), -24), (water(1.8, 3000), F(1208), -32),
    (whoosh(0.3), F(1277), -24), (puff(), F(1292), -26),
    (whoosh(0.3), F(1342), -22), *[(echo(step(), 0.12, 0.5), F(1346) + 0.42 * k, -24) for k in range(3)],
    (clang(), F(1386), -14), (hum(1.9), F(1386), -30), (bus(2.0), F(1395), -22), (whoosh(1.0, 250, 2500), F(1404), -22),
]
for sig, t0, db in CUES: place(sfx, sig, t0, 10 ** (db / 20))

voice = load_voice()
vpk = np.max(np.abs(voice)) + 1e-9
sfx *= vpk
# --- music level: ~22 dB under the speech RMS, ducked under every phrase, +5 dB in the gaps ---
k = int(0.05 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(k) / k, "same"))
active = env > (np.max(env) * 0.06)
act = np.convolve(active.astype(np.float32), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same") > 0.02   # hold through tiny gaps
v_rms = np.sqrt(np.mean(voice[active] ** 2)); m_rms = np.sqrt(np.mean(music[act] ** 2)) + 1e-9
music *= v_rms * 10 ** (-22 / 20) / m_rms
duck = np.where(act, 1.0, 10 ** (5 / 20)).astype(np.float32)
sm = int(0.12 * SR); duck = np.convolve(duck, np.ones(sm) / sm, "same").astype(np.float32)
sfx_duck = np.where(act, 10 ** (-3 / 20), 1.0).astype(np.float32); sfx_duck = np.convolve(sfx_duck, np.ones(sm) / sm, "same")
mix = voice + music * duck + sfx * sfx_duck
mix = mix / max(1.0, np.max(np.abs(mix)) / 0.98)
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
mus_db = 20 * np.log10(np.sqrt(np.mean((music * duck)[act] ** 2)) / v_rms)
print("ok", len(pcm) / SR, "s; music under speech: %.1f dB" % mus_db)
