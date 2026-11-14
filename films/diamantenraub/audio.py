"""Der Diamantenraub: synthesized heist-jazz bed + SFX, mixed under the user's voice.mp3 (voice untouched).
Music sits ~21 dB under the speech (measured on voiced parts) and ducks further while the narrator talks."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1771
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy()
    out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def env(n, a=0.005, r=0.3):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def fade(sig, a=0.01, r=0.05):
    n = len(sig); e = np.ones(n, np.float32); ia, ir = int(a * SR), int(r * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia)
    if ir: e[-ir:] *= np.linspace(1, 0, ir)
    return sig * e

# ---------------- instruments ----------------
def bass(m, d=0.45, k=1.0):  # upright pizz
    t = tt(d); f = midi(m) * (1 + 0.012 * np.exp(-t * 30))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.45 * np.sin(2 * ph) * np.exp(-t * 6) + 0.2 * np.sin(3 * ph) * np.exp(-t * 10)
    return (s * env(len(t), 0.004, d * 0.5) * k).astype(np.float32)
def piano(m, d=0.6, bright=0.5, dec=None):
    t = tt(d); f = midi(m); s = np.zeros(len(t))
    for h in range(1, 8): s += (bright ** (h - 1)) / h * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (2.5 + h * 0.9))
    return fade((s * env(len(t), 0.002, dec or d * 0.6)).astype(np.float32), 0.0, 0.03)
def brass(ms, d, att=0.04, bright=1800):
    t = tt(d); s = np.zeros(len(t))
    for m in ms:
        ph = 2 * np.pi * midi(m) * t + 0.004 * np.sin(2 * np.pi * 5.5 * t)
        s += sum(np.sin(k * ph) / k ** 1.15 for k in range(1, 10))
    a = np.minimum(1, t / att) * np.clip((d - t) / 0.12, 0, 1)
    return filt((s * a / len(ms)).astype(np.float32), hi=bright)
def pad(ms, d, hi=1200):
    t = tt(d); s = np.zeros(len(t))
    for m in ms:
        for det in (-0.08, 0.0, 0.07): s += np.sin(2 * np.pi * midi(m + det) * t) + 0.3 * np.sin(4 * np.pi * midi(m + det) * t)
    a = np.minimum(1, t / 0.8) * np.clip((d - t) / 1.2, 0, 1)
    return filt((s * a / (3 * len(ms))).astype(np.float32), hi=hi)
def kick(k=1.0):
    t = tt(0.3); f = 48 + 70 * np.exp(-t * 35)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * k).astype(np.float32)
def brush(d=0.22):
    t = tt(d); return (filt(noise(d), 1500, 7000) * np.sin(np.pi * np.minimum(1, t / d)) ** 1.5 * 0.5).astype(np.float32)
def snare(k=1.0):
    t = tt(0.2); return ((filt(noise(0.2), 900, 8000) * np.exp(-t * 22) * 0.7 + np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25) * 0.5) * k).astype(np.float32)
def ride(k=1.0):
    t = tt(0.35); s = filt(noise(0.35), 5000) * np.exp(-t * 9) * 0.35 + sum(np.sin(2 * np.pi * f * t) for f in (3150, 4870, 6230)) * 0.03 * np.exp(-t * 6)
    return (s * k).astype(np.float32)
def tick(f0=3200, k=1.0):
    t = tt(0.05); return ((np.sin(2 * np.pi * f0 * t) * np.exp(-t * 160) + filt(noise(0.05), 2500) * np.exp(-t * 200) * 0.5) * k).astype(np.float32)
def cymbal(d=2.0):
    t = tt(d); return (filt(noise(d), 4000) * np.exp(-t * 2.2) * 0.5).astype(np.float32)

music = np.zeros(N, np.float32)
BPM = 116; B = 60 / BPM; SW = 0.62  # swing ratio
def sw(i8): return (i8 // 2) * B + (i8 % 2) * B * SW
# ---- A: opening theme 0 .. 3.3 (and B: until the hit at 5.62)
HIT = F(168)
prog = [(52, [64, 67, 71, 74]), (48, [64, 67, 70, 72]), (45, [60, 64, 67, 69]), (47, [63, 66, 69, 71])]  # Em7 C7 Am7 B7
walk = {52: [52, 55, 57, 59], 48: [48, 52, 55, 58], 45: [45, 48, 52, 50], 47: [47, 51, 54, 46]}
def band(t0, t1, bars_from=0, k=1.0, brassK=1.0, riff=True):
    t = t0; bar = bars_from
    while t < t1 - 0.01:
        root, ch = prog[bar % 4]
        for b_ in range(4):
            tb = t + b_ * B
            if tb >= t1: break
            place(music, bass(walk[root][b_], B * 0.95), tb, 0.55 * k)
            place(music, ride(0.8), tb, 0.35 * k); place(music, ride(0.5), tb + B * SW, 0.22 * k)
            if b_ % 2 == 1: place(music, brush(), tb - 0.05, 0.45 * k)
            if b_ == 0: place(music, kick(), tb, 0.35 * k)
        if brassK > 0: place(music, brass([m - 12 for m in ch[:3]], B * 0.45), t, 0.16 * brassK * k); place(music, brass([m - 12 for m in ch[:3]], B * 0.4), t + B * (2 + SW), 0.13 * brassK * k)
        if riff:
            for i, m in enumerate([76, 79, 78, 76, 74, 71]):
                tb = t + sw(i + 2)
                if tb < t1: place(music, piano(m - 12 if bar % 2 else m, 0.3, 0.6), tb, 0.12 * k)
        t += 4 * B; bar += 1
band(0.0, HIT, 0, 1.0, 1.2)
# the hard hit + cut, then a comic "dit"
place(music, brass([40, 47, 52, 55, 59], 0.9, 0.006, 3000), HIT, 0.55); place(music, kick(2.0), HIT, 0.9); place(music, cymbal(1.6), HIT, 0.5)
i0 = int((HIT + 0.02) * SR); music[i0 - int(0.0 * SR):] *= 0  # (hit placed after this line keeps its tail)
place(music, brass([40, 47, 52, 55, 59], 0.9, 0.006, 3000), HIT, 0.55); place(music, kick(2.0), HIT, 0.9); place(music, cymbal(1.6), HIT, 0.4)
place(music, piano(84, 0.18, 0.8, 0.05), HIT + 0.55, 0.35); place(music, piano(91, 0.15, 0.8, 0.04), HIT + 0.66, 0.25)
# ---- C: tension with mechanical ticks 6.5 .. 18.9 ; confident chord at 17.2
C0, C1 = F(195), F(566)
t = C0; k = 0
while t < C1:
    tb = t
    place(music, tick(3400 if k % 2 == 0 else 2600, 1.0), tb, 0.22)
    if k % 2 == 0: place(music, bass(40, B * 0.8), tb, 0.5)
    if k % 8 == 4: place(music, piano(64, 0.5, 0.3), tb, 0.12); place(music, piano(65, 0.5, 0.3), tb + 0.02, 0.1)
    if tb > F(398) and k % 2 == 1: place(music, bass(47, B * 0.5), tb, 0.3)
    if F(440) < tb < F(509): place(music, tick(4200, 0.8), tb + B / 2, 0.18)
    t += B / 2 * 2 if tb < F(510) else B; k += 1
place(music, pad([52, 59, 64, 67], C1 - C0 - 1.7, 900), C0, 0.10)
place(music, brass([52, 56, 59, 63, 66], 1.6, 0.08, 2200), F(512), 0.25)  # confident Emaj9 on "Unknackbar"
# ---- D: sly spy theme 18.9 .. 30.5
D0, D1 = F(566), F(915)
spy = [64, 67, 68, 67, 64, 63, 64, None, 64, 67, 70, 69, 68, 67, 64, None]
t = D0; i = 0
while t < D1 - 0.05:
    m = spy[i % 16]
    if m: place(music, piano(m, 0.4, 0.45), t + (B * 0.08 if i % 2 else 0), 0.15)
    if i % 2 == 0: place(music, bass([40, 43, 44, 43][(i // 2) % 4], B * 1.6), t, 0.5); place(music, ride(0.5), t, 0.18)
    if i % 4 == 2: place(music, brush(0.3), t, 0.3)
    t += B / 1.6 * 1.0; i += 1
place(music, pad([52, 58, 62], D1 - D0, 800), D0, 0.06)
# ---- E: heist peak 30.5 .. 37.7 ; bright climax on "Dollar"
E0, E1, PEAK = F(915), F(1131), F(1115)
t = E0; i = 0
while t < E1 - 0.02:
    place(music, kick(1.0), t, 0.45) if i % 2 == 0 else place(music, snare(1.0), t, 0.3)
    place(music, ride(0.8), t, 0.25); place(music, ride(0.5), t + B / 2, 0.2)
    root = [40, 40, 43, 45][(i // 4) % 4]
    place(music, bass(root, B * 0.45), t, 0.5); place(music, bass(root + 12 if i % 2 else root + 7, B * 0.4), t + B / 2, 0.38)
    if i % 4 == 0: place(music, brass([root + 24, root + 27, root + 31], B * 0.6, 0.02), t, 0.15)
    t += B; i += 1
place(music, brass([64, 68, 71, 75, 78], 1.8, 0.03, 3500), PEAK - 0.05, 0.3); place(music, cymbal(2.4), PEAK - 0.05, 0.35)
place(music, pad([64, 71, 76, 80], 1.6, 3000), PEAK - 0.1, 0.08)
# ---- F: misty / mysterious 37.7 .. 48.0 ; comic accent at the sandwich
F0, F1 = F(1131), F(1441)
place(music, pad([40, 47, 50, 55], F1 - F0, 700), F0, 0.11)
for k, tb in enumerate(np.arange(F0 + 0.4, F1 - 0.4, 1.9)): place(music, piano([76, 79, 74, 83, 78][k % 5], 1.6, 0.25, 0.9), tb, 0.06)
t = F0
while t < F(1232): place(music, bass(40, 0.5), t, 0.35); t += B * 2
# comic "wah-wah" after "Salamibrot" (in the pause)
def wah(m, d):
    t_ = tt(d); s = brass([m], d, 0.02, 900); lfo = (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t_)); return filt(s * (0.4 + 0.6 * lfo), hi=1400)
place(music, wah(55, 0.18), F(1434), 0.35); place(music, wah(50, 0.42), F(1434) + 0.2, 0.35)
# ---- G: detective theme 48.0 .. 51.6
G0, G1 = F(1441), F(1549)
t = G0; i = 0
while t < G1 - 0.02:
    place(music, bass([45, 45, 52, 48][(i // 2) % 4], B * 0.4), t, 0.5)
    if i % 2 == 0: place(music, kick(0.9), t, 0.4)
    else: place(music, snare(0.8), t, 0.25)
    place(music, tick(6000, 0.6), t + B / 4, 0.12)
    if i % 2 == 1: place(music, piano([69, 72, 76, 74][(i // 2) % 4], 0.2, 0.6), t, 0.13)
    t += B / 2; i += 1
place(music, brass([57, 60, 64], 0.5, 0.02), G0, 0.18); place(music, brass([57, 60, 64, 69], 0.7, 0.02), F(1518), 0.18)
# ---- H: single sad piano note ; I: suspended final chord
place(music, piano(45, 2.6, 0.35, 1.6), F(1551), 0.32); place(music, piano(57, 2.6, 0.3, 1.4), F(1551), 0.18)
place(music, pad([40, 47, 54, 57, 66], DUR - F(1626) + 0.2, 1500), F(1626), 0.14)
place(music, piano(78, 3.0, 0.3, 2.0), F(1640), 0.07); place(music, piano(81, 3.0, 0.3, 2.0), F(1700), 0.06)

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def reverb(x, rt=1.2, mix=0.35):
    ir = noise(rt) * np.exp(-tt(rt) * 6.9 / rt); ir = filt(ir, 200, 5000); ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + len(ir); n = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:L].astype(np.float32)
    out = np.zeros(L, np.float32); out[:len(x)] += x * (1 - mix); out += wet * mix * 3; return out
def click(k=1.0): return tick(5200, k)
def ting(f0=2600, d=1.4):
    t = tt(d); return (sum(np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * dk) for r, dk in [(1, 3), (1.5, 5), (2.01, 7), (2.76, 9)]) * 0.25).astype(np.float32)
def slide_metal(d=0.4):
    t = tt(d); s = filt(noise(d), 800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 40 * t)) * np.sin(np.pi * t / d)
    return (s + np.sin(2 * np.pi * 1200 * t) * 0.15 * np.sin(np.pi * t / d)).astype(np.float32)
def clunk(f0=70, d=0.5):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.5 * np.exp(-t * 30))) * np.exp(-t * 9) + filt(noise(d), 100, 1500) * np.exp(-t * 25) * 0.6).astype(np.float32)
def creak(d=0.8, f0=110):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 0.9 * t / d)); ph = np.cumsum(rate) / SR
    p = (np.mod(ph, 1) < 0.1).astype(np.float32); return (filt(p * (0.6 + 0.4 * rng.random(len(t))), 150, 2500) * np.sin(np.pi * t / d) * 2).astype(np.float32)
def whoosh(d=0.4, lo=300, hi=3000):
    t = tt(d); return (filt(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def crunch(d=0.25):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for k in range(18): i = int(rng.uniform(0, d * 0.7) * SR); g = filt(noise(0.02), 1500, 9000) * np.exp(-tt(0.02) * 200); s[i:i + len(g)] += g[: len(s) - i] * rng.uniform(0.4, 1)
    return s * 1.6
def chew(d=0.8):
    t = tt(d); s = filt(noise(d), 200, 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 4.5 * t)) ** 3
    return (s * 0.8 + crunch(d) * 0.2).astype(np.float32)
def hum(d, f0=60, k=1.0, wob=0.0):
    t = tt(d); s = sum(np.sin(2 * np.pi * f0 * h * t * (1 + wob * np.sin(2 * np.pi * 3 * t))) / h for h in range(1, 6))
    return (s * np.minimum(1, t / 0.08) * np.clip((d - t) / 0.1, 0, 1) * 0.3 * k).astype(np.float32)
def beep(f0=1800, d=0.09): t = tt(d); return (np.sin(2 * np.pi * f0 * t) * np.minimum(1, t / 0.005) * np.clip((d - t) / 0.01, 0, 1) * 0.4).astype(np.float32)
def steps(n, gap=0.3):
    out = np.zeros(int((n * gap + 0.3) * SR), np.float32)
    for k in range(n): g = filt(noise(0.08), 100, 2000) * np.exp(-tt(0.08) * 50) + np.sin(2 * np.pi * 90 * tt(0.08)) * np.exp(-tt(0.08) * 40) * 0.5; i = int(k * gap * SR); out[i:i + len(g)] += g * (0.8 if k % 2 else 1)
    return out
def rustle(d, k=1.0):
    t = tt(d); return (filt(noise(d), 2000, 9000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t + rng.random()))) * np.sin(np.pi * t / d) * 0.6 * k).astype(np.float32)
def engine(d, f0=38):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.08 * np.sin(2 * np.pi * 0.7 * t))) / SR
    s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + filt(noise(d), 60, 400) * 0.6
    return (s * 0.3 * np.minimum(1, t / 0.3) * np.clip((d - t) / 0.4, 0, 1)).astype(np.float32)
def pof(): return (filt(noise(0.5), 300, 5000) * np.exp(-tt(0.5) * 9) + clunk(60, 0.5) * 0.7).astype(np.float32)
def bird(f0=3200):
    out = []
    for k in range(rng.integers(2, 5)): d = 0.07; t = tt(d); f = f0 * (1 + 0.25 * np.sin(np.pi * t / d)); out.append(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.3); out.append(np.zeros(int(0.04 * SR)))
    return np.concatenate(out).astype(np.float32)
def bark():
    t = tt(0.18); f = 420 * (1 - 0.35 * t / 0.18); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + filt(noise(0.18), 300, 2500) * 0.4
    return filt((s * np.exp(-t * 12)).astype(np.float32), 200, 2400)
def sniff(): return (filt(noise(0.12), 1500, 6000) * np.sin(np.pi * tt(0.12) / 0.12) * 0.4).astype(np.float32)
def yawn(d=0.8):
    t = tt(d); f = 180 * (1 + 0.25 * np.sin(np.pi * t / d)); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + filt(noise(d), 300, 1500) * 0.6
    return filt((s * np.sin(np.pi * t / d) ** 2).astype(np.float32), 300, 1200) * 0.6
def sigh(d=1.0): t = tt(d); return (filt(noise(d), 400, 2500) * np.sin(np.pi * t / d) ** 2 * (1 - 0.6 * t / d) * 0.5).astype(np.float32)
def twang(f0=180, d=0.5): t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.02 * np.exp(-t * 20))) * np.exp(-t * 8) * 0.5 + np.sin(2 * np.pi * f0 * 2.01 * t) * np.exp(-t * 12) * 0.2).astype(np.float32)
def jingle(d=0.5):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(6): g = ting(rng.uniform(3500, 5200), 0.25) * 0.4; i = int(rng.uniform(0, d * 0.5) * SR); out[i:i + len(g)] += g[: len(out) - i]
    return out
def cascade(d=1.6, n=60):
    out = np.zeros(int((d + 0.4) * SR), np.float32)
    for k in range(n): g = ting(rng.uniform(2800, 6500), 0.3) * rng.uniform(0.15, 0.5); i = int(rng.uniform(0, d) * SR * (k / n) ** 0.6); out[i:i + len(g)] += g
    out += rustle(d + 0.4, 0.5); return out

S = lambda sig, t, g: place(sfx, sig, t, g)
# hook
S(click(), 0.02, 0.6); S(slide_metal(0.35), 0.0, 0.45); S(cascade(1.7, 70), 0.05, 0.45); S(ting(3100, 1.6), F(44), 0.25)
# montage
S(creak(0.25, 300), F(64), 0.35); S(click(1.0), F(69), 0.5); S(whoosh(0.25), F(60) - 0.1, 0.3)
S(reverb(clunk(55, 0.6), 1.0, 0.4), F(80), 0.8); S(creak(0.7, 85), F(81), 0.6)
# car + sandwich
S(engine(F(195) - F(100), 34) * 0.6, F(100), 0.35); S(rustle(0.3), F(110), 0.3)
S(crunch(0.25), F(147), 1.0); S(chew(0.55), F(152), 0.5); S(chew(0.5), F(176), 0.35)
S(whoosh(0.3, 500, 5000), F(165), 0.4)
# building + elevator
S(whoosh(0.4), F(195) - 0.15, 0.35); S(hum(2.0, 70, 1.0, 0.03) * np.linspace(1, 0.6, int(2.0 * SR)).astype(np.float32), F(208), 0.5); S(reverb(clunk(45, 0.6), 1.6, 0.5), F(258), 0.7)
# security
for k in range(10): S(beep(1500 + k * 60, 0.07), F(271) + k * 33 / 30 / 10 * 1.0 + 0.02, 0.35)
S(hum(1.0, 120, 1.0, 0.01), F(316), 0.35); S(whoosh(0.2), F(315) - 0.08, 0.3)
S(beep(2400, 0.08), F(350), 0.45); S(beep(2400, 0.08), F(358), 0.4); S(whoosh(0.2), F(348) - 0.08, 0.3)
S(hum(1.0, 55, 1.4, 0.06), F(367), 0.45); S(whoosh(0.2), F(366) - 0.08, 0.3)
for k in range(10): S(click(0.8), F(400) + k * 0.12, 0.3)
t = F(441); dt = 0.09
while t < F(509): S(click(0.7), t, 0.28); t += dt; dt = max(0.03, dt * 0.96)
S(yawn(0.9), F(511), 0.3)
# office
S(whoosh(0.3), F(566) - 0.1, 0.3); S(click(1.2), F(636), 0.5); S(ting(4200, 0.8), F(640), 0.18)
S(creak(0.6, 160), F(727), 0.35); S(steps(4, 0.32), F(736), 0.25)
S(jingle(0.5), F(772), 0.5); S(ting(3600, 1.0), F(806), 0.2)
S(steps(5, 0.3), F(824), 0.25); [S(click(0.6), F(c), 0.22) for c in (871, 884, 897)]
# heist night
S(steps(6, 0.27), F(930), 0.35); S(click(0.9), F(975), 0.4)
for k in range(26): S(reverb(clunk(rng.uniform(180, 320), 0.15), 0.6, 0.3), F(996) + k * 0.07 + rng.uniform(0, 0.02), 0.35)
S(rustle(1.6, 1.2), F(1062), 0.35); S(cascade(1.4, 40), F(1065), 0.3); S(cascade(1.0, 30), F(1110), 0.35); S(ting(2800, 2.0), F(1114), 0.3)
# escape
S(engine(F(1232) - F(1131), 46), F(1131), 0.6); S(whoosh(1.0, 100, 1200), F(1150), 0.4)
S(slide_metal(0.5) * 0.4, F(1186), 0.3); S(whoosh(0.5, 300, 4000), F(1200), 0.45); S(pof(), F(1220), 0.7)
# morning forest
for k in range(14): S(bird(rng.uniform(2600, 4200)), F(1235) + k * 0.48 + rng.uniform(0, 0.2), 0.16)
S(bark(), F(1250), 0.35); S(bark(), F(1258), 0.3); [S(sniff(), F(1262) + k * 0.16, 0.3) for k in range(5)]
S(rustle(0.6, 1.2), F(1284), 0.45); S(rustle(0.4), F(1303), 0.35); S(clunk(300, 0.15), F(1356), 0.3)
S(sniff(), F(1400), 0.3); S(sniff(), F(1406), 0.3)
# lab, board, cell
S(whoosh(0.3), F(1441) - 0.1, 0.3); S(click(1.1), F(1446), 0.4); S(ting(2900, 1.8), F(1477), 0.4)
S(clunk(400, 0.12), F(1515), 0.6); [S(twang(160 + k * 30, 0.5), F(1520) + k * 0.3, 0.35) for k in range(3)]
S(reverb(clunk(60, 0.8), 1.4, 0.45), F(1557), 0.9); S(creak(0.3, 200), F(1555), 0.3); S(sigh(1.1), F(1586), 0.45)
# final empty vault
S(reverb(hum(DUR - F(1626), 48, 0.6), 2.0, 0.5), F(1626), 0.18); S(reverb(steps(2, 0.5), 1.8, 0.6), F(1630), 0.12)
t = F(1705); dt = 0.18
while t < F(1760): S(reverb(tick(2400, 0.5), 1.2, 0.4), t, 0.2); t += dt; dt = max(0.06, dt * 0.93)
S(reverb(ting(3800, 2.5), 2.0, 0.5), F(1750), 0.35)
# transition whooshes on most cuts
CUTS = [100, 137, 269, 398, 440, 510, 633, 672, 724, 759, 823, 862, 915, 993, 1056, 1131, 1179, 1232, 1302, 1353, 1385, 1505, 1549, 1626, 1673]
for c in CUTS: S(whoosh(0.28, 400, 4000), F(c) - 0.12, 0.18)

# ---------------- mix ----------------
voice = load_voice()
k = int(0.06 * SR); ve = np.sqrt(np.convolve(voice ** 2, np.ones(k) / k, "same"))
act = ve > ve.max() * 0.06
vrms = np.sqrt((voice[act] ** 2).mean())
speech = np.clip(np.convolve(act.astype(np.float32), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same") * 1.6, 0, 1)
duck = 1 - 0.45 * speech  # ~ -5 dB extra while talking
mrms = np.sqrt((music[act] ** 2).mean()) + 1e-9
music *= vrms * 10 ** (-17.5 / 20) / mrms  # music body ~18 dB under, ~22 dB under once ducked
srms = np.sqrt((sfx[sfx != 0] ** 2).mean()) + 1e-9
sfx_duck = 1 - 0.35 * speech
mix = voice + music * duck * 1.15 + sfx * (vrms * 10 ** (-12 / 20) / srms) * sfx_duck
peak = np.abs(mix).max(); mix = mix / max(1.0, peak / 0.95)
fd = int(0.05 * SR); mix[-fd:] *= np.linspace(1, 0, fd)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
m_db = 20 * np.log10(np.sqrt(((music * duck * 1.15)[act] ** 2).mean()) / vrms)
print(f"ok {len(pcm) / SR:.2f}s  music under speech: {m_db:.1f} dB")
