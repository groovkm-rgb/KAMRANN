"""Synthesized western music bed + SFX for the Pony-Express short, mixed LOW under voice.mp3 (no voice is generated).
Music sits ~20-22 dB under the narration and is ducked wherever there is speech."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1549
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def lp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def bp(x, c, w=0.5): return hp(lp(x, c * (1 + w)), c * (1 - w))
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def fade(x, a=0.01, r=0.05):
    n = len(x); e = np.ones(n, np.float32); ia, ir = min(n, int(a * SR)), min(n, int(r * SR))
    if ia: e[:ia] = np.linspace(0, 1, ia)
    if ir: e[-ir:] *= np.linspace(1, 0, ir)
    return x * e
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def pluck(m, d=0.5, bright=0.55):
    t = tt(d); f = midi(m); s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t + 0.3 * k) / (k + 1) for k in range(8))
    return (s * np.minimum(1, t / 0.004) * np.exp(-t / (d * 0.32))).astype(np.float32)
def strum(ms, d=0.5, up=False):
    out = np.zeros(int((d + 0.08) * SR), np.float32); order = ms[::-1] if up else ms
    for i, m in enumerate(order): g = pluck(m, d, 0.6); j = int(i * 0.012 * SR); out[j:j + len(g)] += g[: len(out) - j]
    return out / max(1, len(ms)) * 1.8
def strings(ms, d, vib=5.5, cut=2200, att=0.12):
    t = tt(d); s = np.zeros(len(t))
    for m in ms:
        for det in (-0.06, 0.05):
            ph = 2 * np.pi * midi(m + det) * t + 0.004 * midi(m) * np.sin(2 * np.pi * vib * t) / vib * 6
            s += sum(np.sin(k * ph) / k for k in range(1, 9))
    e = np.minimum(1, t / att) * np.minimum(1, (d - t) / 0.18).clip(0)
    return lp((s * e).astype(np.float32), cut) / (len(ms) * 2)
def harmonica(m, d, vib=5.2, g=1.0):
    t = tt(d); f = midi(m); ph = 2 * np.pi * f * t + 2.4 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / 0.25)
    s = sum(np.sin(k * ph) / k ** 0.8 for k in (1, 2, 3, 5, 7)) + 0.5 * np.sin(2 * ph * 1.003)
    s = s * (1 + 0.12 * np.sin(2 * np.pi * vib * t)) + lp(noise(d), 3000)[: len(t)] * 0.25
    e = np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.09).clip(0)
    return bp((s * e).astype(np.float32), 1500, 0.8) * g * 0.6
def whistle(m, d, g=1.0):
    t = tt(d); f = midi(m) * (1 + 0.012 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / 0.3)) * (1 - 0.03 * np.exp(-t * 18))
    ph = 2 * np.pi * np.cumsum(f) / SR; s = np.sin(ph) + 0.08 * np.sin(2 * ph) + bp(noise(d), midi(m), 0.15)[: len(t)] * 0.6
    e = np.minimum(1, t / 0.06) * np.minimum(1, (d - t) / 0.12).clip(0)
    return (s * e).astype(np.float32) * g * 0.5
def bell(m, d=1.0):
    t = tt(d); f = midi(m); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) * a for r, k, a in [(1, 3, 1), (2.76, 5, 0.5), (5.4, 8, 0.3), (8.9, 12, 0.15)]) * 0.4).astype(np.float32)
def tom(f0=80, d=0.28, snap=0.3):
    t = tt(d); return (np.sin(2 * np.pi * f0 * (t + 0.012 * (1 - np.exp(-t * 45)))) * np.exp(-t * 13) + lp(noise(d), 1800) * np.exp(-t * 40) * snap).astype(np.float32)
def shaker(d=0.07): t = tt(d); return (hp(noise(d), 5000) * np.exp(-t * 60) * 0.5).astype(np.float32)
def cymbal(d=1.4): t = tt(d); return (hp(noise(d), 3500) * np.exp(-t * 3.2) * 0.5).astype(np.float32)
def beep(d=0.07, f=988): t = tt(d); return fade((np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)).astype(np.float32) * 0.5, 0.004, 0.01)

# ---------------- music ----------------
music = np.zeros(N, np.float32)
BPM = 126; B = 60 / BPM
def gallop(t0, t1, g=1.0, low=78):
    t = t0
    while t < t1 - 0.05:
        place(music, tom(low, 0.3), t, 0.75 * g); place(music, tom(low * 1.5, 0.16, 0.5), t + B * 0.5, 0.35 * g); place(music, tom(low * 1.5, 0.16, 0.5), t + B * 0.75, 0.42 * g)
        place(music, shaker(), t + B * 0.25, 0.25 * g); place(music, shaker(), t + B * 0.5, 0.3 * g)
        t += B
def chords(t0, prog, beats=2, g=1.0, style="strum", reps=1):
    t = t0
    for _ in range(reps):
        for root, ch in prog:
            if style in ("strum", "both"):
                for b in range(beats):
                    place(music, pluck(root - 12, 0.45, 0.4), t + b * B, 0.5 * g)
                    place(music, strum(ch, 0.3), t + b * B + B * 0.5, 0.42 * g); place(music, strum(ch, 0.2, True), t + b * B + B * 0.75, 0.3 * g)
            if style in ("pad", "both"): place(music, strings(ch, beats * B * 1.02), t, 0.5 * g)
            t += beats * B
    return t
def melody(t0, notes, inst, g=1.0):
    for b, m, d in notes: place(music, inst(m, d * B * 0.96), t0 + b * B, g)

Dm = (50, [62, 65, 69]); C = (48, [60, 64, 67]); Bb = (46, [58, 62, 65]); Am = (45, [57, 60, 64]); A = (45, [57, 61, 64]); Fm = (53, [60, 65, 69]); Gm = (43, [55, 58, 62])
D = (50, [62, 66, 69]); G = (43, [59, 62, 67]); A7 = (45, [61, 64, 67]); Bm = (47, [59, 62, 66])
THEME = [(0, 69, 0.5), (0.5, 72, 0.5), (1, 74, 1), (2, 72, 0.5), (2.5, 69, 0.5), (3, 67, 1), (4, 65, 0.5), (4.5, 67, 0.5), (5, 69, 1), (6, 67, 0.5), (6.5, 64, 0.5), (7, 62, 1)]
THEME2 = [(0, 74, 0.5), (0.5, 77, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 77, 0.5), (3, 76, 1), (4, 74, 0.5), (4.5, 72, 0.5), (5, 74, 1), (6, 76, 0.5), (6.5, 73, 0.5), (7, 74, 1)]
# 1-2 (0 - 4.0 s): strong galloping theme, accent on the ditch leap
gallop(0.0, 3.95, 1.0); chords(0.0, [Dm, C, Bb, A], 2, 1.0, "both")
melody(0.0, THEME, whistle, 0.7); melody(0.0, THEME, harmonica, 0.45)
place(music, tom(52, 0.6, 0.6), F(47), 1.5); place(music, cymbal(1.2), F(47), 0.6)
# 3 (4.0 - 5.9): dark, tense chord
place(music, strings([38, 45, 50, 53, 56], 2.0, 6.5, 900, 0.3), 3.98, 1.1)
tr = strings([62, 65, 68], 1.9, 7, 1800, 0.4) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 11 * tt(1.9))))[: int(1.9 * SR)]; place(music, tr, 4.0, 0.5)
place(music, tom(46, 0.8, 0.2), 4.0, 1.2)
# 4-5 (5.9 - 10.95): solemn motif, strings rise on the flight west
for i, (root, ch) in enumerate([Fm, C, Dm, Bb]): place(music, strings([root - 12, *ch], 0.95, 5, 1700, 0.15), 5.9 + i * 0.44, 0.8)
melody(5.9, [(0, 65, 0.9), (0.92, 67, 0.9), (1.84, 69, 0.9), (2.76, 70, 0.9)], lambda m, d: strings([m + 12], d, 5, 2600, 0.08), 0.5)
for i in range(8): place(music, strings([62 + [0, 2, 3, 5, 7, 8, 10, 12][i], 69 + [0, 2, 3, 5, 7, 8, 10, 12][i]], 0.5, 6, 2400 + i * 200, 0.06), 7.63 + i * 0.40, 0.35 + i * 0.07)
place(music, strings([50, 57, 62], 3.3, 5, 1400, 0.5), 7.63, 0.7)
for i in range(7): place(music, tom(70, 0.25), 7.63 + i * B, 0.4 + i * 0.05)
place(music, cymbal(1.0), 9.41, 0.35); place(music, strings([50, 57, 62, 65], 1.5, 5, 1500, 0.2), 9.41, 0.7)
# 6 (10.95 - 14.45): three stabs, then the relay theme kicks in
for t0, ch in [(10.95, [50, 57, 62]), (12.15, [48, 55, 60])]: place(music, strum(ch, 0.9), t0, 0.9); place(music, tom(60, 0.5), t0, 0.9)
gallop(13.22, 26.15, 1.0)
t = chords(13.22, [Dm, C, Bb, A], 2, 1.0, "strum", 3)
chords(t, [Dm, C, Bb, A], 2, 1.0, "both", 1)
melody(14.45, THEME, harmonica, 0.6); melody(14.45 + 8 * B, THEME2, whistle, 0.55)
for t0 in (F(540), F(582), F(611)): place(music, tom(55, 0.5, 0.6), t0, 1.5); place(music, strum([50, 57, 62, 65], 0.5), t0, 1.0)
# 9: the theme changes colour with each terrain
melody(21.52, [(0, 74, 0.5), (0.5, 72, 0.5)], harmonica, 0.8)
for i, m in enumerate([86, 89, 93]): place(music, bell(m, 0.6), 22.08 + i * 0.2, 0.5)
for i, m in enumerate([62, 65, 69, 74, 77, 81]): place(music, pluck(m, 0.35, 0.7), 22.74 + i * 0.13, 0.6)
melody(23.57, [(0, 69, 0.5), (0.5, 72, 0.5), (1, 74, 1), (2, 72, 0.5), (2.5, 69, 0.5), (3, 74, 2)], whistle, 0.6)
# 11-12 (26.2 - 30.46): victory in D major, big peak on "Rekord"
gallop(26.2, 29.5, 1.0, 84); chords(26.2, [D, G, D, A7], 2, 1.1, "both", 1)
melody(26.2, [(0, 74, 0.5), (0.5, 78, 0.5), (1, 81, 1), (2, 79, 0.5), (2.5, 78, 0.5), (3, 76, 1), (4, 78, 0.5), (4.5, 81, 0.5), (5, 86, 1), (6, 85, 0.5), (6.5, 83, 0.5)], whistle, 0.7)
place(music, strings([50, 62, 66, 69, 74, 78], 1.0, 5.5, 3000, 0.04), 29.54, 1.5); place(music, cymbal(1.6), 29.54, 0.9); place(music, tom(50, 0.7, 0.6), 29.54, 1.6)
# 13-14 (30.46 - 36.76): everything slows; one harmonica, curious
slow = 60 / 84
for i, (root, ch) in enumerate([Dm, Dm, Bb, Bb, Gm, Gm, A, A]):
    t0 = 30.5 + i * slow * 1.05
    if t0 < 36.6: place(music, pluck(root - 12, 0.7, 0.4), t0, 0.5); place(music, pluck(ch[1], 0.5, 0.6), t0 + slow * 0.5, 0.3)
melody(30.5, [(0, 69, 1.4), (1.5, 72, 0.7), (2.25, 74, 1.6), (4.0, 72, 0.7), (4.75, 70, 0.7), (5.5, 69, 1.8), (7.5, 67, 0.7), (8.25, 70, 0.7), (9.0, 69, 1.6)], lambda m, d: harmonica(m, d * slow / B), 0.75)
place(music, strings([45, 57, 64, 68], 1.4, 5, 1600, 0.4), 35.3, 0.6)
# 15-16 (36.76 - 43.0): morse beeps creep in and take over the tempo; a full stop when the rider is overtaken
MB = 60 / 150
pat = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0]
t0 = 36.76; i = 0
while t0 < 42.36:
    k = min(1.0, (t0 - 36.76) / 3.0)
    if pat[i % 16]: place(music, beep(0.06 if i % 3 else 0.12, 988 if i % 8 < 6 else 1319), t0, 0.25 + 0.5 * k)
    if i % 4 == 0 and t0 > 38.9: place(music, tom(64, 0.22), t0, 0.5 * k); place(music, pluck([38, 38, 41, 36][(i // 4) % 4], 0.4, 0.5), t0, 0.7 * k)
    if i % 2 == 1 and t0 > 39.9: place(music, shaker(), t0, 0.4)
    t0 += MB / 2; i += 1
place(music, strings([50, 57, 62], 2.1, 5, 1300, 0.6), 36.76, 0.5)
for i, m in enumerate([62, 65, 69, 72, 74, 77, 81, 84]): place(music, strings([m, m + 7], 0.34, 6, 3000, 0.04), 39.92 + i * 0.29, 0.3 + i * 0.05)
music[int(42.4 * SR):int(43.45 * SR)] *= 0.0   # the music holds its breath
place(music, bell(98, 0.9), 42.42, 0.35)
# 17-18 (43.52 - 46.65): lonely, sad harmonica
melody(43.52, [(0, 69, 1.3), (1.4, 67, 0.6), (2.0, 65, 1.5), (3.6, 64, 0.6), (4.2, 62, 1.9)], lambda m, d: harmonica(m, d * slow / B, 4.6), 0.8)
for t0, (root, ch) in [(43.52, Dm), (45.0, Gm), (46.0, A)]: place(music, pluck(root - 12, 1.0, 0.35), t0, 0.5); place(music, strings(ch, 1.2, 4.5, 1200, 0.5), t0, 0.3)
# 19 (46.65 - end): slow emotional finale; harmonica and whistle end on one last note
for t0, (root, ch) in [(46.65, Dm), (47.9, Bb), (48.58, Gm), (49.5, A), (50.3, Dm)]:
    place(music, strings([root - 12, *ch], 1.5, 4.5, 1500, 0.5), t0, 0.55)
    for j, m in enumerate(ch): place(music, pluck(m, 0.9, 0.5), t0 + j * 0.16, 0.35)
melody(46.65, [(0, 74, 1.2), (1.3, 72, 0.6), (1.9, 70, 0.8), (2.75, 69, 1.2), (4.1, 65, 0.6), (4.7, 64, 0.8)], lambda m, d: harmonica(m, d * slow / B, 4.6), 0.75)
place(music, harmonica(62, 1.5, 4.4), 50.3, 0.7); place(music, whistle(74, 1.4), 50.25, 0.6)
music[-int(0.35 * SR):] *= np.linspace(1, 0, int(0.35 * SR)) ** 1.5

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def clop(kind="dirt"):
    d = 0.09; t = tt(d)
    if kind == "snow": return (lp(noise(d), 900) * np.exp(-t * 40) * 1.6).astype(np.float32)
    if kind == "water": return (bp(noise(0.22), 2600, 0.7) * np.exp(-tt(0.22) * 16) * 0.9).astype(np.float32)
    f0 = 140 if kind == "dirt" else 520
    return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 60) + bp(noise(d), 1400 if kind == "dirt" else 2600, 0.6) * np.exp(-t * 55) * 0.9).astype(np.float32)
def hooves(t0, t1, g=1.0, kind="dirt", stride=11 / 30, fin=0.0, fout=0.0):
    t = t0
    while t < t1:
        k = 1.0
        if fin: k *= min(1, (t - t0) / fin + 0.05)
        if fout: k *= min(1, (t1 - t) / fout + 0.02)
        for off, a in ((0, 1.0), (0.09, 0.7), (0.17, 0.9), (0.23, 0.55)): place(sfx, clop(kind), t + off * stride / 0.367 + rng.uniform(-0.006, 0.006), g * a * k * rng.uniform(0.8, 1.0))
        t += stride
def thud(f0=70, d=0.4): t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.8 * np.exp(-t * 35))) * np.exp(-t * 11) + lp(noise(d), 900) * np.exp(-t * 22) * 0.7).astype(np.float32)
def whoosh(d=0.5, c=1500): t = tt(d); return (bp(noise(d), c, 0.7) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def wind(d, c=500, wob=0.3):
    t = tt(d); return (lp(noise(d), c) * (0.55 + 0.45 * np.sin(2 * np.pi * wob * t + 1) * np.sin(2 * np.pi * wob * 0.37 * t)) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4).clip(0)).astype(np.float32)
def howl(d):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for c in (620, 940): s += bp(noise(d), c, 0.12)[: len(t)] * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t + c))
    return (s * 4 + hp(noise(d), 4000)[: len(t)] * 0.25) * np.sin(np.pi * t / d) ** 0.7
def rustle(d=0.5): t = tt(d); return (hp(lp(noise(d), 7000), 2500) * np.sin(np.pi * t / d) ** 2 * (0.6 + 0.4 * rng.random(len(t)))).astype(np.float32)
def thunder(d=2.4):
    t = tt(d); s = lp(noise(d), 140) * 4 * np.minimum(1, t / 0.08) * np.exp(-t / (d * 0.4)) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t) ** 2) + lp(noise(d), 900) * np.exp(-t * 9) * 0.5
    return s.astype(np.float32)
def crowd(d, cheer=0.0):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for c in (350, 520, 780, 1150, 1700) + ((2400, 3100) if cheer else ()):
        s += bp(noise(d), c, 0.25)[: len(t)] * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(1.5, 4.5) * t + rng.uniform(0, 6)) ** 2)
    return (s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4).clip(0)).astype(np.float32)
def flutter(d=0.5): t = tt(d); return (hp(noise(d), 1800) * (np.sin(2 * np.pi * 17 * t) ** 6) * np.sin(np.pi * t / d) * 0.8).astype(np.float32)
def creak(d=0.6, f0=140):
    t = tt(d); rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d)); ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    return hp(lp(pulses * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32)), 2200) * np.sin(np.pi * t / d), 200) * 2.5
def neigh(d=0.9, f0=900):
    t = tt(d); f = f0 * (1.25 - 0.6 * (t / d) ** 0.8) * (1 + 0.06 * np.sin(2 * np.pi * 13 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 7)) * (0.7 + 0.3 * np.sin(2 * np.pi * 13 * t)); s = bp(s.astype(np.float32), 1500, 0.8) + hp(noise(d), 2500)[: len(t)] * 0.12
    return (s * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.2).clip(0) * 0.5).astype(np.float32)
def snort(d=0.35): t = tt(d); return (bp(noise(d), 700, 0.7) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * t) ** 2) * np.sin(np.pi * t / d) * 1.2).astype(np.float32)
def twowhistle(): return np.concatenate([whistle(88, 0.16, 1.0), np.zeros(int(0.03 * SR), np.float32), whistle(93, 0.3, 1.0)])
def sigh(d=0.8): t = tt(d); return (bp(noise(d), 900 - 400 * 0, 0.6) * np.minimum(1, t / 0.15) * np.exp(-t * 2.6) * 0.9).astype(np.float32)
def puff(d=0.5): t = tt(d); return (lp(noise(d), 700) * np.exp(-t * 9) * 2.0 + hp(noise(d), 3000) * np.exp(-t * 14) * 0.3).astype(np.float32)
def buzz(d, f=4200): t = tt(d); return (bp(noise(d), f, 0.1) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 43 * t))) * np.sin(np.pi * t / d) * 3).astype(np.float32)
def splash(d=0.5): t = tt(d); return (lp(noise(d), 5000) * np.exp(-t * 7) * np.minimum(1, t / 0.01) * 0.8 + lp(noise(d), 500) * np.exp(-t * 10)).astype(np.float32)
def sizzle(d): t = tt(d); cr = (rng.random(len(t)) > 0.9993).astype(np.float32); return (hp(np.convolve(cr, np.exp(-np.arange(200) / 30), "same").astype(np.float32), 2500) * 1.5 + hp(noise(d), 6000) * 0.04)
def clack(): d = 0.06; t = tt(d); return (bp(noise(d), 2200, 0.5) * np.exp(-t * 70) + np.sin(2 * np.pi * 330 * t) * np.exp(-t * 50) * 0.6).astype(np.float32)
def townbell(d=1.6): t = tt(d); return (sum(np.sin(2 * np.pi * 587 * r * t) * np.exp(-t * k) * a for r, k, a in [(1, 2.2, 1), (2.0, 3, 0.6), (2.76, 4, 0.5), (5.4, 6, 0.25)]) * 0.35).astype(np.float32)
def hammer(metal=0.6): d = 0.25; t = tt(d); return (thud(170, d) * 0.7 + np.sin(2 * np.pi * 2350 * t) * np.exp(-t * 28) * metal * 0.5 + bp(noise(d), 3200, 0.4) * np.exp(-t * 60) * 0.5).astype(np.float32)
def twang(d=1.1, f0=196):
    t = tt(d); f = f0 * (1 + 0.05 * np.exp(-t * 6)); ph = 2 * np.pi * np.cumsum(f) / SR
    return (sum(np.sin(k * ph) * np.exp(-t * (2 + k * 0.9)) / k for k in range(1, 9)) * (1 + 0.2 * np.sin(2 * np.pi * 9 * t)) * 0.5).astype(np.float32)
def click(): d = 0.03; t = tt(d); return (hp(noise(d), 2500) * np.exp(-t * 220) * 0.9 + np.sin(2 * np.pi * 2700 * t) * np.exp(-t * 160) * 0.6).astype(np.float32)
def hum(d): t = tt(d); return (sum(np.sin(2 * np.pi * 60 * k * t) / k for k in (2, 3, 4, 6, 8)) * (0.8 + 0.2 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.2).clip(0) * 0.25).astype(np.float32)
def zap(d=0.5, up=True):
    t = tt(d); f = (700 + 5200 * (t / d) ** 1.5) if up else (5200 - 4200 * (t / d)); ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) * 0.5 + bp(noise(d), 3500, 0.6)[: len(t)] * 0.7) * np.sin(np.pi * t / d) ** 1.5 * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 60 * t)))).astype(np.float32)
def chirp(n=3):
    out = []
    for i in range(n):
        d = 0.09; t = tt(d); f = 3300 + 1400 * np.sin(np.pi * t / d) + i * 200; out.append((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d)).astype(np.float32) * 0.5); out.append(np.zeros(int(0.05 * SR), np.float32))
    return np.concatenate(out)

# ambience: wind over every exterior
place(sfx, wind(F(364), 520), 0, 0.5); place(sfx, wind(F(838) - F(397), 520), F(397), 0.45); place(sfx, wind(F(1103) - F(886), 480), F(886), 0.45); place(sfx, wind(F(1399) - F(1168), 480), F(1168), 0.4); place(sfx, wind(DUR - F(1399), 380, 0.2), F(1399), 0.6)
# 1 hook: hooves toward the lens, leap, landing thud, dirt on the lens
hooves(0.0, F(30), 1.0, fin=0.3); place(sfx, snort(), 0.25, 0.5); place(sfx, whoosh(0.5, 900), F(30), 0.9); place(sfx, thud(60, 0.5), F(47), 1.6); place(sfx, rustle(0.4), F(36), 0.7); place(sfx, whoosh(0.35), F(48), 0.6)
# 2 chase: full gallop, tumbleweed, the branch
hooves(F(52), F(120), 1.0); place(sfx, rustle(0.9), F(60), 0.3); place(sfx, rustle(0.45), F(96), 1.0); place(sfx, whoosh(0.3, 2500), F(97), 0.6)
# 3 storm: distant thunder
place(sfx, whoosh(0.4), F(117), 0.5); place(sfx, thunder(2.2), F(137), 0.9); place(sfx, thunder(1.8), F(161), 0.7); place(sfx, wind(1.9, 900, 0.9), F(120), 0.6)
# 4 speech: far crowd murmur, papers in the wind
place(sfx, whoosh(0.35), F(174), 0.5); place(sfx, crowd(1.75), F(177), 0.5)
for f in (186, 198, 212): place(sfx, flutter(0.4), F(f), 0.35)
# 5 flight west
place(sfx, whoosh(1.9, 700), F(229), 0.9); place(sfx, whoosh(0.5, 2000), F(272), 0.7); place(sfx, crowd(1.5), F(284), 0.3); place(sfx, rustle(0.8), F(290), 0.25)
# 6 three cuts
for f in (326, 362, 395): place(sfx, whoosh(0.3, 1800), F(f), 0.6)
place(sfx, rustle(0.9), F(332), 0.3); place(sfx, sizzle(1.05), F(365), 0.5); hooves(F(397), F(433), 1.1, fin=0.2)
# 7 station: door creak, leather, keeper's whistle, hooves approaching
place(sfx, creak(0.6, 150), F(437), 0.5); place(sfx, creak(0.35, 320), F(462), 0.35); place(sfx, snort(), F(470), 0.45); place(sfx, twowhistle(), F(505), 0.5); hooves(F(487), F(540), 0.9, fin=1.6)
# 8 the swap: skid, landing, grab, throw, thunk on the saddle, vault, gallop off
hooves(F(540), F(548), 1.0, fout=0.2); place(sfx, rustle(0.4), F(541), 0.8); place(sfx, neigh(0.7, 950), F(543), 0.45); place(sfx, thud(110, 0.2), F(551), 0.9)
place(sfx, creak(0.3, 300), F(556), 0.5); place(sfx, whoosh(0.4, 1200), F(569), 0.8); place(sfx, thud(95, 0.3), F(582), 1.3); place(sfx, clack(), F(582), 0.6)
for f in (586, 592, 598, 604): place(sfx, clop(), F(f), 0.5)
place(sfx, creak(0.3, 260), F(614), 0.6); place(sfx, thud(120, 0.2), F(622), 0.7); place(sfx, twowhistle(), F(626), 0.45); hooves(F(623), F(645), 1.0, fout=0.5)
# 9 terrains: heat buzz / blizzard howl / river splashes
for f in (645, 662, 682): place(sfx, whoosh(0.25, 1800), F(f - 2), 0.6)
place(sfx, buzz(F(662) - F(645)), F(645), 0.35); hooves(F(645), F(662), 0.9)
place(sfx, howl(F(682) - F(662) + 0.1), F(662), 0.8); hooves(F(662), F(682), 0.9, "snow")
hooves(F(682), F(707), 1.0, "water")
for f in (683, 690, 697, 703): place(sfx, splash(0.45), F(f), 0.7)
# 10 home station: handover, departure, lantern sizzle, hay puff, relieved sigh
hooves(F(707), F(716), 0.9, fout=0.2); place(sfx, snort(), F(718), 0.5); place(sfx, thud(95, 0.3), F(729), 1.0); hooves(F(731), F(754), 0.9, fout=0.6); place(sfx, sizzle(F(786) - F(707)), F(707), 0.4)
place(sfx, whoosh(0.3), F(750), 0.5); place(sfx, puff(0.6), F(761), 1.2); place(sfx, rustle(0.5), F(762), 0.5); place(sfx, sigh(0.9), F(768), 0.8)
# 11-12 victory: cheering crowd, press clatter, hats, town bell
hooves(F(786), F(838), 1.0, fin=0.5); place(sfx, crowd(F(914) - F(786) + 0.3, 1), F(786), 0.75)
for i in range(13): place(sfx, clack(), F(838) + i * 0.121, 0.7 if i % 2 == 0 else 0.45)
for f in (842, 856, 870): place(sfx, flutter(0.35), F(f), 0.4)
place(sfx, whoosh(0.3), F(884), 0.6); place(sfx, crowd(1.3, 1), F(886), 0.9); place(sfx, townbell(), F(887), 0.9); place(sfx, townbell(), F(901), 0.7); place(sfx, neigh(0.8, 1000), F(888), 0.5)
for f in (888, 893, 899): place(sfx, whoosh(0.25, 2400), F(f), 0.35)
# 13 prairie + workers: hooves, hammering, sweating men, stretched wire
hooves(F(914), F(1058), 0.9, fout=0.8); place(sfx, whoosh(0.3), F(980), 0.5)
f = np.ceil(983 / 7.48) * 7.48
while f < 1060: place(sfx, hammer(0.7), F(f), 0.7); f += 7.48
place(sfx, creak(0.9, 110), F(1000), 0.5)
# 14 the wire
place(sfx, twang(1.2, 196), F(1062), 0.9); place(sfx, twang(0.9, 294), F(1082), 0.5); place(sfx, chirp(2), F(1090), 0.25)
# 15 telegraph office: key clicks, electric hum, the pulse
for f in [1108, 1112, 1120, 1124, 1128, 1136, 1142, 1146, 1150, 1156, 1160, 1163]: place(sfx, click(), F(f), 0.9); place(sfx, click(), F(f + 2), 0.5)
place(sfx, hum(F(1306) - F(1103)), F(1103), 0.35); place(sfx, zap(0.6), F(1150), 0.7); place(sfx, zap(0.5), F(1176), 0.9); place(sfx, whoosh(0.35, 2600), F(1192), 0.7)
# 16 the pulse crosses the continent, overtakes the rider
sw = whoosh(F(1258) - F(1198), 2600) * (0.7 + 0.3 * np.sin(2 * np.pi * 10.5 * tt(F(1258) - F(1198))) ** 2)[: int((F(1258) - F(1198)) * SR)]; place(sfx, sw, F(1198), 0.9)
hooves(F(1258), F(1306), 0.9, fout=1.0); place(sfx, zap(0.42, False), F(1266), 1.3); place(sfx, whoosh(0.5, 3000), F(1266), 0.9)
# 17 closing: board, three nails
place(sfx, thud(130, 0.25), F(1309), 0.8)
for f in (1314, 1326, 1338): place(sfx, hammer(0.9), F(f), 1.0)
# 18 empty stable: echoing creak, hooves fading away
cr = creak(0.8, 95); ech = np.zeros(int(1.6 * SR), np.float32)
for i, g in enumerate((1, 0.45, 0.2, 0.1)): j = int(i * 0.19 * SR); ech[j:j + len(cr)] += cr[: len(ech) - j] * g
place(sfx, ech, F(1356), 0.6); place(sfx, whoosh(0.35), F(1368), 0.4); hooves(F(1372), F(1404), 0.7, fout=1.0); place(sfx, neigh(0.7, 880), F(1378), 0.25)
# 19 final: soft wind, the bird, the wire humming in the wind
for f in (1444, 1486, 1522): place(sfx, chirp(3), F(f), 0.4)
wh = tt(DUR - F(1399)); place(sfx, (np.sin(2 * np.pi * 147 * wh) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * wh)) * np.minimum(1, wh / 1.0) * 0.12 + np.sin(2 * np.pi * 220.7 * wh) * 0.05).astype(np.float32), F(1399), 0.8)
place(sfx, snort(), F(1470), 0.3)

# ---------------- mix ----------------
voice = load_voice()
ve = np.abs(voice); k = int(0.06 * SR); ve = np.convolve(ve, np.ones(k) / k, "same")
speech = np.clip(ve / (np.percentile(ve, 90) * 0.25), 0, 1); speech = np.convolve(speech, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
rms = lambda x, m=None: float(np.sqrt(np.mean((x if m is None else x[m]) ** 2)))
act = ve > np.percentile(ve, 90) * 0.2
v_rms = rms(voice, act)
music = np.tanh(music * 1.2) ; sfx = np.tanh(sfx * 0.9)
music *= v_rms * 10 ** (-18.5 / 20) / rms(music, np.abs(music) > 1e-4)   # unducked level; -3 dB more under speech => ~21 dB below the voice
sfx *= v_rms * 10 ** (-15.0 / 20) / rms(sfx, np.abs(sfx) > 1e-4)
m_d = music * (1 - 0.30 * speech); s_d = sfx * (1 - 0.25 * speech)
mix = voice + m_d + s_d
print("voice rms %.4f | music under speech %.1f dB | sfx under speech %.1f dB" % (v_rms, 20 * np.log10(rms(m_d, act) / v_rms), 20 * np.log10(rms(s_d, act) / v_rms)))
pk = np.abs(mix).max(); mix = mix / max(1.0, pk / 0.97)
st = np.stack([mix, mix], 1)
with wave.open("mix_raw.wav", "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
for name, x in (("music_only.wav", music), ("sfx_only.wav", sfx)):
    with wave.open("work/" + name, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x / max(1e-6, np.abs(x).max()) * 0.8, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix_raw.wav", DUR, "s, peak", pk)
