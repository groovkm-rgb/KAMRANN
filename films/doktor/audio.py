"""Music bed (comic-spooky Victorian: pizzicato, bassoon, harpsichord, organ) + SFX for the doctor short, mixed under voice.mp3.
The voice is used as-is. Music sits ~21 dB under the speech and ducks further while the voice is talking."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1285
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def T(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def fft_filt(x, fn):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= fn(f); return np.fft.irfft(X, len(x)).astype(np.float32)
lp = lambda x, c: fft_filt(x, lambda f: 1 / (1 + (f / c) ** 4))
hp = lambda x, c: fft_filt(x, lambda f: 1 - 1 / (1 + (f / c) ** 4))
bp = lambda x, c, w: fft_filt(x, lambda f: np.exp(-((f - c) / w) ** 2))
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * gain
def env(n, a=0.005, r=0.2): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)

# ---------------- instruments ----------------
def pizz(f, d=0.35):
    t = T(d); s = sum(np.sin(2 * np.pi * f * k * t) * (0.7 ** k) / k for k in range(1, 7)); return (s * env(len(t), 0.002, 0.09)).astype(np.float32)
def harpsi(f, d=0.5):
    t = T(d); s = sum(np.sin(2 * np.pi * f * k * t + k) * (0.85 ** k) for k in range(1, 12)); return (s * env(len(t), 0.001, 0.18) * 0.35).astype(np.float32)
def bassoon(f, d, vib=4.5, bend=0.0):
    t = T(d); fr = f * (1 + bend * t / d) * (1 + 0.004 * np.sin(2 * np.pi * vib * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = sum(np.sin(k * ph) / k ** 0.8 * (1.3 if k in (2, 3) else 1) for k in range(1, 10))
    a = np.minimum(1, t / 0.04) * np.clip((d - t) / 0.08, 0, 1); return lp((s * a).astype(np.float32), 1600) * 0.4
def organ(fs, d, att=0.05):
    t = T(d); s = np.zeros(len(t))
    for f in fs:
        for k, g in [(0.5, 0.6), (1, 1), (2, 0.6), (3, 0.3), (4, 0.25)]: s += g * np.sin(2 * np.pi * f * k * t)
    a = np.minimum(1, t / att) * np.clip((d - t) / 0.3, 0, 1); return (s * a / len(fs) * 0.25).astype(np.float32)
def strings(fs, d, trem=0):
    t = T(d); s = np.zeros(len(t))
    for f in fs:
        for det in (-0.003, 0, 0.004):
            ph = 2 * np.pi * f * (1 + det) * t; s += sum(np.sin(k * ph) / k for k in range(1, 8))
    if trem: s *= 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * trem * t))
    a = np.minimum(1, t / 0.15) * np.clip((d - t) / 0.3, 0, 1); return lp((s * a / len(fs) * 0.12).astype(np.float32), 3000)
def glock(f, d=1.2):
    t = T(d); return ((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * env(len(t), 0.001, 0.4) * 0.4).astype(np.float32)
def tick(d=0.06):
    t = T(d); return (hp(noise(d), 2500) * np.exp(-t * 80) * 0.6).astype(np.float32)
def woodblock(f=900):
    t = T(0.12); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 45)).astype(np.float32)

music = np.zeros(N, np.float32)
BPM = 116; B = 60 / BPM
Dm, Gm, A7, F_, C_, Bb = [50, 53, 57], [55, 58, 62], [57, 61, 64], [53, 57, 60], [48, 52, 55], [46, 50, 53]
# 1-2: thunder + dramatic organ chord, then spooky pizzicato
place(music, organ([midi(m) for m in [38, 50, 53, 57, 62]], 2.0, 0.02), 0.02, 1.0)
for i, m in enumerate([62, 65, 69, 68, 67, 66, 65, 64]): place(music, pizz(midi(m)), 1.1 + i * B / 2, 0.55)
# 3-6 (3.2-11.5): confident "treatment" theme
tt = 3.15; prog = [Dm, Gm, A7, Dm, Dm, Bb, A7, Dm]; mel = [74, 72, 74, 76, 77, 76, 74, 73]
for bar in range(8):
    ch = prog[bar % len(prog)]; t0 = tt + bar * 4 * B
    if t0 > 11.4: break
    for b in range(4):
        tb = t0 + b * B
        place(music, pizz(midi(ch[0] - 12)), tb, 0.8 if b % 2 == 0 else 0.4)
        place(music, pizz(midi(ch[(b + 1) % 3])), tb + B / 2, 0.35)
        place(music, tick(), tb, 0.25)
    place(music, harpsi(midi(mel[bar])), t0, 0.5); place(music, harpsi(midi(mel[bar] - 3)), t0 + 2 * B, 0.4); place(music, harpsi(midi(mel[bar] + 2)), t0 + 3 * B, 0.35)
place(music, bassoon(midi(50), 1.1, bend=-0.3), 7.05, 0.9)          # pale patient: sliding bassoon
place(music, bassoon(midi(45), 0.6), 4.6, 0.5)
# 7-9 (11.5-18.07): hurried careless walk
tt = 11.45; walk = [50, 53, 57, 53, 55, 58, 57, 53]
k = 0; t = tt
while t < 18.0:
    place(music, bassoon(midi(walk[k % 8] - 12), B * 0.45), t, 0.7); place(music, pizz(midi(walk[(k + 2) % 8] + 12), 0.2), t + B / 4, 0.3)
    place(music, woodblock(1100 if k % 2 else 800), t, 0.2); k += 1; t += B / 2
place(music, strings([midi(50), midi(51)], 0.3, trem=12), 18.07, 0.3)  # tense rub in the pause
place(music, pizz(midi(50)), 18.36, 0.6); place(music, pizz(midi(45)), 18.6, 0.6)  # "aber egal" shrug
# 10-12 (19.38-25.95): clean, bright, hopeful (D major)
D, G_, A_, Bm = [62, 66, 69], [55, 59, 62], [57, 61, 64], [59, 62, 66]
prog = [D, G_, D, A_, Bm, G_, A_, D]; hope = [78, 79, 81, 76, 78, 74, 76, 78]
for bar in range(4):
    t0 = 19.3 + bar * 4 * B * 0.85
    for i in range(2):
        ch = prog[bar * 2 + i]; tc = t0 + i * 2 * B * 0.85
        place(music, strings([midi(m) for m in ch], 2 * B * 0.85 + 0.2), tc, 0.9)
        for j in range(4): place(music, harpsi(midi(ch[j % 3] + 12), 0.4), tc + j * B * 0.42, 0.3)
        place(music, glock(midi(hope[bar * 2 + i])), tc, 0.35)
place(music, strings([midi(m) for m in [62, 66, 69, 74]], 1.4), 25.6, 1.2)  # victory accent on "runter"
for i, m in enumerate([74, 78, 81, 86]): place(music, glock(midi(m)), 25.55 + i * 0.07, 0.5)
# 13 (26.37-29.6): mocking motif, sinks
for i, (m, d) in enumerate([(57, 0.25), (56, 0.25), (55, 0.25), (54, 0.8)]): place(music, bassoon(midi(m - 12), d, vib=7), 26.4 + i * 0.3, 0.9)
for i, m in enumerate([69, 68, 67, 66, 65, 64]): place(music, pizz(midi(m)), 28.2 + i * 0.18, 0.4)
place(music, bassoon(midi(38), 1.2, bend=-0.25), 29.0, 0.7)
# 14-16 (29.6-37.96): tense, silly emergency
t = 29.6; k = 0; em = [50, 51, 50, 49, 50, 53, 52, 51]
while t < 37.94:
    place(music, pizz(midi(em[k % 8] - 12), 0.18), t, 0.8); place(music, pizz(midi(em[(k + 3) % 8] + 12), 0.15), t + B / 4, 0.25)
    if k % 4 == 0: place(music, strings([midi(62), midi(63)], min(B * 2, 37.94 - t), trem=14), t, 0.35)
    place(music, tick(), t, 0.2); k += 1; t += B / 2
# 16-17: music stops in the pause, comic hits and big finale
place(music, organ([midi(m) for m in [50, 57, 62, 66]], 0.5, 0.01), 38.45, 0.8)
for i, m in enumerate([62, 66, 69, 74]): place(music, pizz(midi(m)), 39.1 + i * 0.12, 0.6)
place(music, bassoon(midi(43), 0.9, vib=6), 39.5, 0.6)
fin = [midi(m) for m in [38, 50, 54, 57, 62, 66, 69]]
place(music, organ(fin, 2.4, 0.02), 41.25, 1.1); place(music, strings(fin[1:], 2.2), 41.25, 1.3)
for i, m in enumerate([74, 78, 81, 86, 90]): place(music, glock(midi(m)), 41.25 + i * 0.06, 0.45)
place(music, pizz(midi(38)), 41.25, 1.0)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def thunder(d=2.5):
    t = T(d); return (lp(noise(d), 300) * 2.5 * np.minimum(1, t / 0.02) * np.exp(-t / (d * 0.3)) + hp(noise(d), 2000) * np.exp(-t * 18) * 0.6).astype(np.float32)
def rain(d): return (bp(noise(d), 4000, 2500) * 0.25 + lp(noise(d), 600) * 0.1).astype(np.float32)
def crackle(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 6)): i = rng.integers(0, len(s) - 400); s[i:i + 400] += hp(noise(400 / SR), 1500) * np.exp(-np.arange(400) / 60) * rng.uniform(0.2, 0.7)
    return s
def rattle(d=0.8):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(14): i = rng.integers(0, len(s) - 2000); s[i:i + 2000] += woodblock(rng.uniform(1400, 2600))[:2000] * rng.uniform(0.2, 0.6)
    return s
def plop():
    t = T(0.18); f = 300 + 900 * t / 0.18; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)).astype(np.float32)
def bubbles(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 9)):
        i = rng.integers(0, len(s) - 4000); t = np.arange(4000) / SR; f0 = rng.uniform(400, 900); s[i:i + 4000] += np.sin(2 * np.pi * np.cumsum(f0 * (1 + 3 * t)) / SR) * np.exp(-t * 60) * 0.5
    return s
def whoosh(d=0.45, c=1200):
    t = T(d); return (bp(noise(d), c, c * 0.8) * np.sin(np.pi * t / d) ** 2 * 1.2).astype(np.float32)
def ting(f=1800):
    t = T(1.4); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, k in [(1, 3), (2.4, 5), (4.1, 7)]) * 0.35).astype(np.float32)
def vox(f0, d, form=(500, 900), bend=0.0, breathy=0.15):
    """tiny formant voice: 'uhhh', 'ho', 'ahh'"""
    t = T(d); f = f0 * (1 + bend * t / d) * (1 + 0.02 * np.sin(2 * np.pi * 5 * t)); ph = np.cumsum(f) / SR
    src = (np.mod(ph, 1) - 0.5).astype(np.float32) + noise(d) * breathy
    s = sum(bp(src, c, 80 + c * 0.08) * g for c, g in zip(form, (1, 0.6, 0.3)))
    return (s * np.minimum(1, t / 0.03) * np.clip((d - t) / 0.08, 0, 1) * 3).astype(np.float32)
def slurp():
    t = T(0.3); f = 1200 - 900 * t / 0.3; return (bp(noise(0.3), 1, 1) * 0 + np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 30 * t)) * np.exp(-t * 8) * 0.5).astype(np.float32)
def kiss():
    t = T(0.08); return (hp(noise(0.08), 1500) * np.exp(-t * 90) + np.sin(2 * np.pi * 1500 * t) * np.exp(-t * 70) * 0.5).astype(np.float32)
def step(): t = T(0.14); return (lp(noise(0.14), 900) * np.exp(-t * 40) * 1.2 + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 35) * 0.5).astype(np.float32)
def echo(x, delay=0.11, fb=0.4, n=4):
    y = np.concatenate([x, np.zeros(int(delay * SR * n))]).astype(np.float32); d = int(delay * SR)
    for k in range(1, n): y[k * d:k * d + len(x)] += x * fb ** k
    return y
def creak(d=0.6, f0=120):
    t = T(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.1 * t / d)); ph = np.cumsum(rate) / SR
    s = (np.mod(ph, 1) < 0.08).astype(np.float32) * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32))
    return hp(lp(s * np.sin(np.pi * t / d), 2500), 200) * 2.2
def rustle(d): t = T(d); return (bp(noise(d), 3000, 2000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.5 * t))) * 0.35).astype(np.float32)
def water(d): t = T(d); return (lp(noise(d), 900) * 0.4 + bp(noise(d), 2500, 1500) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t))).astype(np.float32)
def tap_water(d): return (bp(noise(d), 1800, 1400) * 0.35).astype(np.float32)
def splash(d=0.9): t = T(d); return (lp(noise(d), 4000) * np.exp(-t * 4) * np.minimum(1, t / 0.01) + lp(noise(d), 400) * np.exp(-t * 7) * 1.5).astype(np.float32)
def chalk_hit(): t = T(0.35); return (lp(noise(0.35), 700) * np.exp(-t * 25) * 2 + hp(noise(0.35), 3000) * np.exp(-t * 12) * 0.4).astype(np.float32)
def fiuuu(d=0.8):
    t = T(d); f = 1800 * (1 - 0.8 * (t / d) ** 1.3); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.6).astype(np.float32)
def sparkle(): s = np.zeros(int(0.8 * SR), np.float32); [place_into(s, glock(f, 0.6), k * 0.05, 0.3) for k, f in enumerate([2093, 2637, 3136, 3951])]; return s
def place_into(b, x, t0, g): i = int(t0 * SR); j = min(len(b), i + len(x)); b[i:j] += x[:j - i] * g
def laugh(f0, n=5, gap=0.17):
    s = np.zeros(int((n * gap + 0.3) * SR), np.float32)
    for k in range(n): place_into(s, vox(f0 * (1 - 0.04 * k), 0.12, (550, 950, 2400), breathy=0.4), k * gap, 1.0 - 0.1 * k)
    return s
def thud(): t = T(0.4); return (np.sin(2 * np.pi * 70 * t * (1 + np.exp(-t * 30))) * np.exp(-t * 12) * 1.4 + lp(noise(0.4), 500) * np.exp(-t * 20)).astype(np.float32)
def gull():
    t = T(0.45); f = 1300 + 500 * np.sin(np.pi * t / 0.45); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / 0.45) * 0.25).astype(np.float32)
def oar(): t = T(0.5); return (lp(noise(0.5), 1200) * np.sin(np.pi * t / 0.5) ** 2 * 0.6).astype(np.float32)
def bellows(): t = T(0.4); return (bp(noise(0.4), 700, 500) * np.sin(np.pi * t / 0.4) ** 1.5 * 1.3).astype(np.float32)
def puff(): t = T(0.25); return (bp(noise(0.25), 500, 300) * np.exp(-t * 14) * 2.2 + np.sin(2 * np.pi * 160 * t) * np.exp(-t * 25) * 0.6).astype(np.float32)
def cough(): s = np.zeros(int(0.5 * SR), np.float32); place_into(s, vox(170, 0.13, (650, 1100, 2500), breathy=1.2), 0, 1); place_into(s, vox(150, 0.12, (600, 1000, 2400), breathy=1.2), 0.2, 0.8); return s
def coo(): return vox(520, 0.35, (700, 1400, 3000), bend=0.25, breathy=0.05) * 0.5
def chatter(d): s = np.zeros(int(d * SR), np.float32); [place_into(s, woodblock(2600), k * 0.07, 0.25) for k in range(int(d / 0.07))]; return s
def steam(d=0.7): t = T(d); return (hp(noise(d), 4000) * np.sin(np.pi * t / d) * 0.25).astype(np.float32)
def box_open(): return creak(0.35, 260) * 0.5

# clinic
place(sfx, rain(11.5) * np.minimum(1, np.arange(int(11.5 * SR)) / SR / 0.1)[: int(11.5 * SR)] * np.clip((11.5 - np.arange(int(11.5 * SR)) / SR) / 0.3, 0, 1), 0, 0.45)
place(sfx, thunder(2.6), F(5), 0.9); place(sfx, thunder(2.0), F(62), 0.45); place(sfx, thunder(1.6), F(118), 0.25)
place(sfx, crackle(11.3), 0.1, 0.25)
place(sfx, whoosh(0.25, 900), F(4), 0.5); place(sfx, rattle(1.0), F(8), 0.5); place(sfx, whoosh(0.35, 1500), F(18), 0.7)
place(sfx, plop(), F(26), 0.5); place(sfx, bubbles(1.4), F(26), 0.5); place(sfx, rattle(0.7), F(64), 0.3)
place(sfx, rustle(0.4), F(74), 0.5)
place(sfx, chatter(1.4), 3.25, 0.6); place(sfx, steam(0.8), 3.5, 0.6); place(sfx, steam(0.8), 4.3, 0.5)
place(sfx, whoosh(0.3, 1000), F(186), 0.4); place(sfx, ting(1650), F(191), 0.9)
place(sfx, vox(190, 0.9, (550, 900, 2400), bend=-0.35), 7.15, 0.55)  # patient "uhhh"
place(sfx, whoosh(0.3, 1300), F(229), 0.4)
for hb in (246, 259, 272): place(sfx, slurp(), F(hb) - 0.05, 0.8); place(sfx, kiss(), F(hb) + 0.18, 0.9)
place(sfx, sparkle(), F(286), 0.5); place(sfx, bubbles(0.8), 9.5, 0.3)
place(sfx, whoosh(0.5, 1100), F(336), 0.9)
# corridor
place(sfx, echo(creak(0.7, 110)), F(354), 0.8)
place(sfx, rustle(1.2), F(362), 0.7)
for k in range(int((F(440) - F(362)) / 0.32)): place(sfx, echo(step(), 0.13, 0.35), F(362) + k * 0.32, 0.45)
for k in range(5): place(sfx, echo(step(), 0.13, 0.35), F(472) + k * 0.3, 0.45)
for k in range(9): place(sfx, step(), F(400) + k * 0.2, 0.18)  # running nurse (far)
place(sfx, kiss() * 0.4, F(447), 0.4); place(sfx, kiss() * 0.4, F(452), 0.4)  # blink "plink"
place(sfx, vox(140, 0.3, (500, 1500, 2500), bend=0.3, breathy=0.6), F(459), 0.35)  # "hmpf"
place(sfx, echo(creak(0.6, 180)), F(500), 0.6)
place(sfx, whoosh(0.25, 1600), F(541), 0.8); place(sfx, whoosh(0.25, 1400), F(553), 0.7)
place(sfx, vox(330, 0.35, (750, 1200, 2700), bend=0.2), F(553), 0.35)  # midwife gasp
for k in range(3): place(sfx, echo(step(), 0.13, 0.35), F(563) + k * 0.3, 0.4)
place(sfx, whoosh(0.5, 1100), F(572), 0.9)
# wash room
place(sfx, tap_water(F(655) - F(579)), F(579), 0.3); place(sfx, bubbles(2.4), F(580), 0.2)
place(sfx, chalk_hit(), F(627), 1.0)
place(sfx, glock(2637, 0.8), F(655), 0.3); place(sfx, glock(3136, 0.8), F(657), 0.3)
# ward
for k, t0 in enumerate([F(660), F(675), F(688)]): place(sfx, coo(), t0, 0.35)
for i, m in enumerate([79, 76, 74, 76, 79, 81]): place(sfx, glock(midi(m), 0.6), F(658) + i * 0.24, 0.12)  # music-box lullaby
place(sfx, whoosh(0.4, 1100), F(692), 0.7)
place(sfx, tap_water(F(788) - F(701)), F(701), 0.25)
place(sfx, fiuuu(0.85), F(748), 0.8); place(sfx, sparkle(), F(771), 0.6)
place(sfx, whoosh(0.35, 1000), F(785), 0.6)
for k in range(6): place(sfx, step(), F(790) + k * 0.25, 0.3)
place(sfx, laugh(150, 6), F(846), 0.8); place(sfx, laugh(118, 6, 0.19), F(849), 0.8); place(sfx, laugh(175, 5, 0.15), F(852), 0.6); place(sfx, laugh(132, 5), F(864), 0.6)
place(sfx, thud() * 0.5, F(878), 0.5)
# river
place(sfx, water(DUR - F(885)), F(885), 0.45); place(sfx, splash(), F(885), 0.6)
for t0 in (30.4, 33.6, 37.0, 40.6): place(sfx, gull(), t0, 0.45)
place(sfx, oar(), F(890), 0.6); place(sfx, oar(), F(905), 0.5)
place(sfx, splash(0.6), F(912), 0.4)
for k in range(5): place(sfx, bp(noise(0.25), 1500, 900) * np.sin(np.pi * np.arange(int(0.25 * SR)) / (0.25 * SR)) * 0.8, F(912) + k * 0.3, 0.5)  # water spurts
place(sfx, whoosh(0.4, 900), F(968), 0.4)
place(sfx, box_open(), F(990), 0.7); place(sfx, ting(2093), F(995), 0.9); place(sfx, sparkle(), F(1000), 0.5)
place(sfx, whoosh(0.3, 1500), F(1038), 0.5); place(sfx, sparkle(), F(1042), 0.5)
for fr in (1083.6, 1098.1, 1112.6, 1127.1): place(sfx, bellows(), F(fr) - 0.2, 0.8)
place(sfx, whoosh(0.25, 1300), F(1139), 0.6)
for fr in (1153, 1157, 1161): place(sfx, puff(), F(fr), 1.0)
place(sfx, vox(300, 0.6, (800, 1200, 2700), bend=0.1, breathy=0.5), F(1151), 0.5); place(sfx, vox(240, 0.6, (750, 1150, 2600), breathy=0.5), F(1153), 0.45)  # crowd "ahh!"
place(sfx, whoosh(0.35, 800), F(1170), 0.8)
for fr in (1174, 1184, 1194, 1208): place(sfx, cough(), F(fr), 0.8)
place(sfx, sparkle(), F(1214), 0.5)
place(sfx, vox(260, 0.5, (700, 1100, 2600), bend=-0.4, breathy=0.3), F(1221), 0.35); place(sfx, thud(), F(1230), 1.0)
place(sfx, whoosh(0.3, 1200), F(1236), 0.4)

# ---------------- mix ----------------
voice = load_voice()
win = int(0.05 * SR)
def mavg(x, w):
    c = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), x.astype(np.float64), np.zeros(w)])); return ((c[w:w + len(x)] - c[:len(x)]) / w).astype(np.float32)
def rms_env(x): return np.sqrt(np.maximum(mavg(x.astype(np.float64) ** 2, win), 0))
venv = rms_env(voice); speech = venv > venv.max() * 0.08
v_rms = np.sqrt(np.mean(voice[speech] ** 2)); m_rms = np.sqrt(np.mean(music ** 2)) + 1e-9
music *= v_rms * 10 ** (-21 / 20) / m_rms                         # bed ~21 dB under the speech
duck = mavg(speech.astype(np.float32), int(0.25 * SR))
music *= 1 - 0.3 * np.clip(duck, 0, 1)                           # extra ducking while talking
s_peak = np.abs(sfx).max() + 1e-9; sfx *= (v_rms * 10 ** (-9 / 20)) / np.sqrt(np.mean(sfx[np.abs(sfx) > s_peak * 0.05] ** 2))
sfx *= 1 - 0.35 * np.clip(duck, 0, 1)
mix = voice + music + sfx
mix = np.tanh(mix * 1.1) / np.tanh(1.1) if np.abs(mix).max() > 1 else mix
fade = int(0.3 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR, "music rms dB rel voice:", 20 * np.log10(np.sqrt(np.mean(music[speech] ** 2)) / v_rms))
