"""Das 7-Minuten-Theater: synthesized music bed + SFX, mixed under voice.mp3 (the user's voice-over, unchanged).
Music sits ~21 dB under the voice while it speaks (ducked), a little higher in the gaps. SFX follow the shot plan."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1307
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def flt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def norm(x):
    x = np.asarray(x, np.float32); a = np.abs(x) > 1e-3 * (np.abs(x).max() + 1e-9)
    r = np.sqrt(np.mean(x[a] ** 2)) if a.any() else 1.0
    return x / (r + 1e-9)
def env(n, a=0.005, r=0.2): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * g
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def taiko(f0=62, d=0.7, ka=False):
    t = tt(d)
    if ka: return (flt(noise(d), lo=1800, hi=6000) * np.exp(-t * 60) * 0.8 + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 50) * 0.3).astype(np.float32)
    f = f0 * (1 + 0.9 * np.exp(-t * 28))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5) + flt(noise(d), hi=900) * np.exp(-t * 30) * 0.5).astype(np.float32)
def tick(hi=True):
    t = tt(0.04); return (flt(noise(0.04), lo=2500 if hi else 1200, hi=7000) * np.exp(-t * 260) + np.sin(2 * np.pi * (2600 if hi else 1700) * t) * np.exp(-t * 180) * 0.5).astype(np.float32)
def hat(d=0.05): t = tt(d); return (flt(noise(d), lo=7000) * np.exp(-t * 90)).astype(np.float32)
def pluck(fr, d=0.35, bright=0.55):
    t = tt(d); s = sum((bright ** k) * np.sin(2 * np.pi * fr * (k + 1) * t) / (k + 1) for k in range(7))
    return (s * env(len(t), 0.002, d * 0.3)).astype(np.float32)
def marimba(fr, d=0.5):
    t = tt(d); s = np.sin(2 * np.pi * fr * t) + 0.35 * np.sin(2 * np.pi * fr * 4 * t) * np.exp(-t * 30)
    return (s * env(len(t), 0.002, 0.18)).astype(np.float32)
def stab(frs, d=0.22):
    t = tt(d); s = sum(sum(np.sin(2 * np.pi * fr * k * t * (1 + 0.003 * j)) / k for k in range(1, 9)) for fr in frs for j in (-1, 1))
    return flt((s * env(len(t), 0.004, 0.08)).astype(np.float32), hi=3500)
def pad(frs, d, a=0.4, r=0.6):
    t = tt(d); s = sum(np.sin(2 * np.pi * fr * t * (1 + dt)) + 0.3 * np.sin(4 * np.pi * fr * t) for fr in frs for dt in (-0.002, 0.002))
    e = np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (d - t) / r))
    return flt((s * e).astype(np.float32), hi=2200)
def bass(fr, d=0.25):
    t = tt(d); return ((np.sin(2 * np.pi * fr * t) + 0.4 * np.sin(4 * np.pi * fr * t)) * env(len(t), 0.004, d * 0.5)).astype(np.float32)
def piano(fr, d=1.6):
    t = tt(d); s = sum(np.sin(2 * np.pi * fr * k * t) * np.exp(-t * (1.5 + k * 1.2)) / k ** 1.4 for k in range(1, 7))
    return (s * np.minimum(1, t / 0.004)).astype(np.float32)
def bell(fr=1318, d=2.2):
    t = tt(d); return (sum(np.sin(2 * np.pi * fr * k * t) * np.exp(-t * (1.3 + k)) / (1 + k) for k in (1, 2.76, 5.4, 8.9)) * np.minimum(1, t / 0.002)).astype(np.float32)

# ---------------- music ----------------
mus = np.zeros(N, np.float32)
Dm, Bb, C, Am, Gm = [62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 60, 64], [55, 58, 62]
FUN = [[53, 57, 60], [60, 64, 67], [62, 65, 69], [58, 62, 65]]  # F C Dm Bb
CUT = F(892)                                                 # "Fertig": music + ticks stop together
M = lambda sig, t0, g: place(mus, norm(sig), t0, g)
M(taiko(48, 1.6), 0.02, 1.8)                                 # 1: big taiko on frame 0; silence through the brake
def groove(t0, t1, bpm0, bpm1, level, prog, dens):
    t = t0; k = 0
    while t < t1 - 1e-3:
        bpm = bpm0 + (bpm1 - bpm0) * (t - t0) / max(1e-3, t1 - t0); b = 60 / bpm / 2   # 8th note
        bar, step = divmod(k, 8); ch = prog[bar % len(prog)]; d = dens(t)
        if step in (0, 4): M(taiko(58 if step == 0 else 66, 0.6), t, 0.9 * level)
        if d > 0.45 and step in (2, 6): M(taiko(90, 0.4), t, 0.45 * level)
        if d > 0.2 and step in (3, 7): M(taiko(0, 0.2, ka=True), t, 0.45 * level)
        if d > 0.55: M(hat(), t, 0.22 * level)
        if d > 0.75: M(hat(), t + b / 2, 0.14 * level)
        if d > 0.3 and step % 2 == 0: M(bass(midi(ch[0] - 24), b * 1.8), t, 0.7 * level)
        if d > 0.4 and step in (0, 3, 6): M(stab([midi(m) for m in ch], 0.2), t, 0.4 * level)
        t += b; k += 1
groove(1.25, 6.05, 124, 124, 1.0, [Dm, Bb, C, Am], lambda t: 0.7)
# 5-7: disciplined, restrained
M(pad([midi(m) for m in Dm], 3.0), 6.1, 0.5); M(pad([midi(m) for m in Bb], 3.2), 9.0, 0.5)
groove(7.0, 12.0, 124, 124, 0.6, [Dm, Bb], lambda t: 0.15)
# 8-13: build, tempo 126 -> 144, rising density
groove(12.0, CUT, 126, 144, 1.0, [Dm, Bb, C, Am], lambda t: 0.45 + 0.55 * (t - 12) / (CUT - 12))
# 11: rising arpeggio while the seats turn
for i in range(24): M(pluck(midi([62, 65, 69, 72, 74, 77, 81, 84][i % 8] + 12 * (i // 8)), 0.3, 0.7), 19.75 + i * 0.12, 0.5 + 0.02 * i)
# the clock: ticks from "sieben" (f184) to "Fertig", accelerating at the end
t = F(184); k = 0
while t < CUT:
    rem = CUT - t; step = 0.24 if t < 23 else 0.2 if rem > 3.0 else max(0.07, 0.2 * rem / 3.0)
    M(tick(k % 2 == 0), t, 0.8); t += step; k += 1
mus[int(CUT * SR):int(30.35 * SR)] = 0
# 15-16: cheerful, proud theme
groove(30.4, 35.3, 120, 120, 0.75, FUN, lambda t: 0.5)
for i, m in enumerate([72, 74, 77, 79, 81, 79, 77, 74, 77, 79, 81, 84, 81, 79, 77, 77]): M(marimba(midi(m), 0.45), 30.45 + i * 0.3, 0.6)
# 17: question hit, then a slow, pale, sad motif
M(taiko(55, 1.0), F(1058), 0.6)
M(pad([midi(m) for m in Dm], 2.2), 36.4, 0.7); M(pad([midi(m) for m in Gm], 2.0), 38.1, 0.7)
for i, m in enumerate([69, 65, 62, 64, 65, 62]): M(piano(midi(m), 1.4), 36.55 + i * 0.55, 0.6)
# 18: warm, hopeful finale, ends on a short taiko
M(pad([midi(m) for m in [53, 57, 60, 65]], 2.0, 0.6, 0.4), 39.75, 0.8); M(pad([midi(m) for m in [58, 62, 65, 70]], 2.1, 0.3, 0.8), 41.3, 0.8)
for i, m in enumerate([72, 77, 81, 79, 77, 81, 84]): M(marimba(midi(m), 0.6), 39.9 + i * 0.42, 0.5)
groove(41.4, 43.0, 112, 112, 0.5, [[58, 62, 65], [53, 57, 60]], lambda t: 0.35)
M(taiko(0, 0.2, ka=True), F(1294) - 0.12, 0.6); M(taiko(52, 1.2), F(1294), 1.4)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def whoosh(d=0.5, hi=1800): t = tt(d); return (flt(noise(d), lo=150, hi=hi) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def rumble(d, k=1.0): t = tt(d); return (flt(noise(d), hi=180) * np.minimum(1, t / 0.1) * (0.4 + 0.6 * t / d) ** k).astype(np.float32)
def screech(d=0.7):
    t = tt(d); vib = 1 + 0.01 * np.sin(2 * np.pi * 9 * t)
    s = sum(np.sin(2 * np.pi * f0 * vib * t * (1 - 0.06 * t / d)) * a for f0, a in [(2900, 1), (3450, 0.6), (5800, 0.25)]) + flt(noise(d), lo=2500, hi=7000) * 0.5
    return (s * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.08)).astype(np.float32)
def crackle(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 90)): i = rng.integers(0, len(s) - 400); s[i:i + 400] += flt(noise(400 / SR), lo=3000) * np.exp(-np.arange(400) / 60) * rng.uniform(0.3, 1)
    return s
def psst(d=0.7): t = tt(d); return (flt(noise(d), lo=1800, hi=9000) * np.minimum(1, t / 0.02) * np.exp(-t * 3.5)).astype(np.float32)
def beep(f0=1250, d=0.12): t = tt(d); return (np.sin(2 * np.pi * f0 * t) * np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.01)).astype(np.float32)
def slide(d=0.45): t = tt(d); return (flt(noise(d), lo=300, hi=2500) * np.sin(np.pi * t / d) + np.sin(2 * np.pi * 120 * t) * 0.2 * np.sin(np.pi * t / d)).astype(np.float32)
def steps(d, rate=7.0):
    s = np.zeros(int(d * SR), np.float32); t = 0.0
    while t < d - 0.1:
        i = int(t * SR); g = flt(noise(0.08), lo=80, hi=1400) * np.exp(-np.arange(int(0.08 * SR)) / SR * 45); s[i:i + len(g)] += g[: len(s) - i] * rng.uniform(0.5, 1); t += rng.uniform(0.6, 1.4) / rate
    return s
def murmur(d, voices=8):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for v in range(voices):
        sy = (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(3.5, 6) * t + rng.uniform(0, 6))) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.3, 0.8) * t + rng.uniform(0, 6)))
        s += flt(noise(d), lo=250, hi=1600) * sy
    return (s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def rustle(d=0.3): t = tt(d); return (flt(noise(d), lo=1500, hi=8000) * np.sin(np.pi * t / d) ** 1.5 * (0.6 + 0.4 * rng.random(len(t)))).astype(np.float32)
def crinkle(d=0.5):
    s = rustle(d) * 0.4
    for _ in range(int(d * 50)): i = rng.integers(0, len(s) - 300); s[i:i + 300] += flt(noise(300 / SR), lo=2500) * np.exp(-np.arange(300) / 50) * rng.uniform(0.3, 1)
    return s
def clack(f0=700): t = tt(0.09); return (flt(noise(0.09), lo=400, hi=4000) * np.exp(-t * 80) + np.sin(2 * np.pi * f0 * t) * np.exp(-t * 60) * 0.6).astype(np.float32)
def squeak(d=0.16): t = tt(d); f = 1800 + 700 * t / d; return (np.sin(2 * np.pi * np.cumsum(f * (1 + 0.04 * np.sin(2 * np.pi * 40 * t))) / SR) * np.sin(np.pi * t / d)).astype(np.float32)
def shak(): t = tt(0.12); return (flt(noise(0.12), lo=600, hi=6000) * np.minimum(1, t / 0.003) * np.exp(-t * 45)).astype(np.float32)
def click(): t = tt(0.05); s = flt(noise(0.05), lo=2000) * np.exp(-t * 300); return (s + np.roll(s, int(0.025 * SR)) * 0.7).astype(np.float32)
def scratch(d=0.18): t = tt(d); return (flt(noise(d), lo=3000, hi=9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 35 * t)) * np.sin(np.pi * t / d)).astype(np.float32)
def ding(): t = tt(2.2); return (sum(np.sin(2 * np.pi * f0 * t) * np.exp(-t * k) for f0, k in [(1760, 1.6), (3520, 2.6), (5274, 3.8), (2217, 2.0)]) * np.minimum(1, t / 0.002)).astype(np.float32)
def curtain(d=1.0): t = tt(d); return (flt(noise(d), lo=100, hi=1200) * np.sin(np.pi * t / d) ** 1.2).astype(np.float32)
def applause(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 160)):
        i = rng.integers(0, len(s) - 900); s[i:i + 900] += flt(noise(900 / SR), lo=rng.uniform(700, 1500), hi=6000) * np.exp(-np.arange(900) / rng.uniform(80, 160)) * rng.uniform(0.3, 1)
    t = tt(d); return s * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.6)
def shutter(): return np.concatenate([click(), flt(noise(0.06), lo=1500, hi=5000) * 0.25]).astype(np.float32)
def chalk(d=0.35): t = tt(d); return (flt(noise(d), lo=2500, hi=8000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 11 * t))) * np.sin(np.pi * t / d) + np.sin(2 * np.pi * 3100 * t) * 0.15 * np.sin(np.pi * t / d)).astype(np.float32)
def rain(d): t = tt(d); s = flt(noise(d), lo=1200, hi=9000) * 0.7 + flt(noise(d), lo=200, hi=900) * 0.3; return (s * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 1.2)).astype(np.float32)
def birds(d):
    s = np.zeros(int(d * SR), np.float32); t = 0.2
    while t < d - 0.5:
        for c in range(rng.integers(2, 5)):
            dd = 0.07; u = tt(dd); f0 = rng.uniform(3000, 4800); g = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.35 * np.sin(np.pi * u / dd))) / SR) * np.sin(np.pi * u / dd)
            i = int((t + c * 0.1) * SR); s[i:i + len(g)] += g[: len(s) - i]
        t += rng.uniform(0.5, 1.0)
    return s
def kid_yay():
    d = 0.55; t = tt(d); f0 = 330 + 160 * np.sin(np.pi * t / d); src = (np.mod(np.cumsum(f0) / SR, 1) < 0.3).astype(np.float32)
    return ((flt(src, lo=600, hi=1400) + flt(src, lo=2000, hi=3200) * 0.4) * np.sin(np.pi * t / d) ** 0.7).astype(np.float32)
def depart(d): t = tt(d); s = np.sin(2 * np.pi * np.cumsum(70 + 60 * t / d) / SR) * 0.4 + flt(noise(d), hi=400); return (s * np.minimum(1, t / 0.6) * np.exp(-t * 0.6)).astype(np.float32)
def riser(d=0.6): t = tt(d); return (np.sin(2 * np.pi * np.cumsum(200 + 1200 * (t / d) ** 2) / SR) * (t / d) ** 2 * 0.5 + whoosh(d, 3000)).astype(np.float32)

S = lambda sig, t0, db: place(sfx, norm(sig), t0, 10 ** (db / 20))
# 1 hook: tunnel exit, approach, wind wave, brake screech + sparks, air brakes
S(whoosh(0.9, 2500), 0.0, -2); S(rumble(1.0, 0.5), 0.0, -4); S(whoosh(0.5, 6000), 0.15, -10)
S(screech(0.62), F(13), -13); S(crackle(0.6), F(13), -12); S(psst(0.7), F(30), -10)
S(whoosh(0.35, 3000), F(39), -10); S(tick(), F(46), -6)
# 2 doors: beeps, slide, sped-up crowd (steps + unintelligible murmur)
S(beep(1250), F(52), -12); S(beep(1000), F(52) + 0.16, -12); S(slide(0.45), F(56), -10)
S(steps(1.6, 11), F(60), -12); S(murmur(3.4, 9), F(58), -20); S(steps(1.5, 3), F(110), -18)
# 4 counter punch-in + the first tick
S(whoosh(0.3, 3000), F(158), -10); S(tick(), F(184), -2)
# 5-7 lineup, synchronized bow: fabric rustle + one elegant bell
S(whoosh(0.4), F(209), -16); S(rustle(0.35), F(302), -10); S(bell(1318), F(304), -10)
S(whoosh(0.35), F(328), -14); S(rustle(0.35), F(325), -12); S(beep(1600, 0.06), F(341), -18); S(beep(1600, 0.06), F(347), -18)
# 8 dash + 9 cutaway / interior
S(whoosh(0.4, 3000), F(359), -9); S(steps(0.7, 14), F(362), -12); S(whoosh(0.35), F(385), -12); S(whoosh(0.35), F(437), -12)
# 10 montage: bag, trash, rack tick, umbrella ting
S(whoosh(0.3), F(493), -12); S(crinkle(0.9), F(500), -14); S(crinkle(0.7), F(533), -12)
for i in range(3): S(clack(1200), F(538 + i * 6), -16)
S(whoosh(0.25), F(553), -14); S(tick(False), F(560), -10); S(click(), F(563), -14); S(bell(2637, 1.4), F(569), -8)
# 11 seats: clack-clack-clack as each row locks
S(whoosh(0.3), F(580), -14)
for k in range(20): S(clack(650 + 15 * k), F(590 + (19 - k) * 3.6 + 12), -12)
S(whoosh(0.3), F(645), -16)
# 12 trays squeak, mop swish, covers snap
S(whoosh(0.3), F(690), -14)
for a in (702, 714, 726, 737): S(squeak(0.15), F(a), -15)
for a in (706, 722, 736): S(bell(3520, 0.6), F(a), -22)
S(whoosh(0.3), F(741), -14); S(whoosh(0.35, 1200), F(749), -14); S(whoosh(0.35, 1200), F(759), -14)
for k in range(6, 13): S(shak(), F(775 + (12 - k) * 3 + 3), -10)
# 13 control: flashlight click, pen ticks
S(whoosh(0.3), F(792), -14); S(click(), F(797), -10)
for n in range(1, 5): S(scratch(0.15), F(800 + 32 * n / 5), -14)
# 14 out, line up, bow, DING on "Fertig"
S(whoosh(0.35, 3000), F(834), -10); S(steps(0.9, 14), F(840), -12); S(rustle(0.35), F(871), -10)
S(ding(), F(892), -6)
# 15 theatre: curtain, applause, phone camera clicks
S(curtain(1.1), F(912), -12); S(applause(4.2), F(925), -22)
for a in (925, 941, 962, 979, 995): S(shutter(), F(a), -14)
# 16 lecture hall: chalk + paper
S(whoosh(0.3), F(1003), -14); S(chalk(0.4), F(1012), -18); S(chalk(0.3), F(1030), -18); S(rustle(0.4), F(1040), -20)
# 17 the question + grey flashback: rain, muffled steps
S(riser(0.6), F(1040), -18); S(whoosh(0.5, 1200), F(1094), -12)
S(rain(5.0), F(1094), -18); S(flt(steps(3.0, 4), hi=600), F(1100), -16)
# 18 colours return: birds, a happy kid (wordless), the train leaves
S(whoosh(0.8, 1500), F(1194), -14); S(birds(4.0), F(1205), -24); S(kid_yay(), F(1262), -20); S(depart(2.0), F(1250), -14)

# ---------------- mix ----------------
voice = load_voice()
a = np.abs(voice); k = int(0.02 * SR); e = np.convolve(a, np.ones(k) / k, "same")
act = e > 0.08 * e.max()
vr = np.sqrt(np.mean(voice[act] ** 2))
act_s = np.zeros(N, np.float32); c = 0.0; B = 48; ka, kr = B / (0.02 * SR), B / (0.3 * SR)   # attack 20 ms, release 300 ms
for i in range(0, N, B):
    tg = 1.0 if act[i:i + B].any() else 0.0; c += (tg - c) * min(1, ka if tg > c else kr); act_s[i:i + B] = c
mr = np.sqrt(np.mean(mus[np.abs(mus) > 1e-3 * np.abs(mus).max()] ** 2)) + 1e-9
music = mus / mr * vr * 10 ** (-21 / 20) * (10 ** (5 / 20) * (1 - act_s) + act_s)    # -21 dB under speech, +5 dB in gaps
sx = sfx * vr * 10 ** (-3 / 20) * (1 - 0.37 * act_s)                                 # SFX ducked ~4 dB on speech
mix = voice + music + sx
mix = np.tanh(mix / np.abs(mix).max() * 1.1) / np.tanh(1.1) * 0.95
fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
gap = ~act & (np.arange(N) < int(43 * SR))
print("ok", N / SR, "| music vs voice while speaking:", round(db(music[act]) - db(voice[act]), 1), "dB | music in gaps:", round(db(music[gap]) - db(voice[act]), 1), "dB")
if __name__ == "__main__" and __import__("os").environ.get("REPORT"):
    for s0 in range(0, 44):
        sl = slice(int(s0 * SR), int((s0 + 1) * SR)); v = voice[sl]; m = act[sl]
        print(f"{s0:2d}s voice {db(v[m]) if m.any() else -99:6.1f}  music {db(music[sl]):6.1f}  sfx {db(sx[sl]):6.1f}  sfxpk {20*np.log10(np.abs(sx[sl]).max()+1e-9):6.1f}  vpk {20*np.log10(np.abs(v).max()+1e-9):6.1f}")
