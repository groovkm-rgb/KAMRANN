"""Pony Express short: original western music bed + SFX, synthesized and mixed under voice.mp3 (voice untouched).
Music sits ~21 dB under the speech with extra ducking while the narrator talks."""
import numpy as np, subprocess, wave

SR = 44100
TOTAL_F = 1549
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d): return rng.standard_normal(max(1, int(d * SR))).astype(np.float32)
def tt(d): return np.arange(int(d * SR)) / SR
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * gain
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def adsr(n, a=0.01, r=0.1, d=None):
    t = np.arange(n) / SR; d = d or n / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)

# ---------------- instruments ----------------
def pluck(f, d=0.6, bright=0.6):  # Karplus-Strong guitar
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p).astype(np.float32); out = np.zeros(n, np.float32)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.994 if bright > 0.5 else 0.985)
    return filt(out, 80, 5000)
_pc = {}
def gpl(m, d=0.5):
    k = (m, round(d, 2))
    if k not in _pc: _pc[k] = pluck(midi(m), d)
    return _pc[k]
def strum(chord, t0, buf, g=0.25, down=True, d=0.7):
    for k, m in enumerate(chord if down else chord[::-1]): place(buf, gpl(m, d), t0 + k * 0.012, g)
def harmonica(m, d, vib=5.5, bend=True):
    t = tt(d); f = midi(m) * (1 + (0.03 * np.exp(-t * 18) if bend else 0) * -1) * (1 + 0.006 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / 0.25))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) * (1 / k if k % 2 else 0.55 / k) for k in range(1, 9)) + filt(noise(d), 800, 3000) * 0.06
    return (filt(s.astype(np.float32), 150, 3500) * adsr(len(t), 0.04, 0.12) * 0.5).astype(np.float32)
def whistle(m, d):
    t = tt(d); f = midi(m) * (1 + 0.008 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.2))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + filt(noise(d), 2000, 6000) * 0.05
    return (s * adsr(len(t), 0.05, 0.15) * 0.5).astype(np.float32)
def strings(chord, d, a=0.4, bright=2200):
    t = tt(d); s = np.zeros(len(t))
    for m in chord:
        for det in (-0.004, 0.0, 0.005):
            ph = 2 * np.pi * np.cumsum(np.full(len(t), midi(m) * (1 + det))) / SR + rng.uniform(0, 6)
            s += 2 * (ph / (2 * np.pi) % 1) - 1
    return (filt(s.astype(np.float32), 90, bright) * adsr(len(t), a, 0.4) / (3 * len(chord)) * 0.9).astype(np.float32)
def brass(chord, d):
    t = tt(d); s = np.zeros(len(t))
    for m in chord:
        ph = 2 * np.pi * midi(m) * t + 0.004 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin(k * ph) / k ** 1.2 for k in range(1, 9))
    return (filt(s.astype(np.float32), 80, 1600) * adsr(len(t), 0.07, 0.2) / len(chord) * 0.6).astype(np.float32)
def tom(f0=110, d=0.28):
    t = tt(d); f = f0 * (1 + 0.5 * np.exp(-t * 30))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) + filt(noise(d), None, 1500) * np.exp(-t * 40) * 0.3).astype(np.float32)
def kick(): t = tt(0.35); f = 48 + 90 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
def snare(): t = tt(0.18); return filt((noise(0.18) * np.exp(-t * 26) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.4).astype(np.float32), 300)
def shaker(): t = tt(0.08); return filt(noise(0.08) * np.exp(-t * 50), 4000)
def cymbal(d=2.0, swell=False):
    t = tt(d); e = (np.minimum(1, t / d) ** 2) if swell else np.exp(-t * 2.2)
    return (filt(noise(d), 5000, 14000) * e * 0.5).astype(np.float32)
def beep(f=820, d=0.07): t = tt(d); return (np.sin(2 * np.pi * f * t) * adsr(len(t), 0.004, 0.01) * 0.5).astype(np.float32)
def bell(f=520, d=2.5):
    t = tt(d); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) * a for r, k, a in [(1, 1.2, 1), (2.76, 2, 0.5), (5.4, 3.5, 0.3), (0.5, 0.8, 0.4)]) * 0.3).astype(np.float32)
def sleigh():
    t = tt(0.25); return (sum(np.sin(2 * np.pi * f * t) for f in (2600, 3150, 3900)) * np.exp(-t * 18) * 0.15).astype(np.float32)

music = np.zeros(N, np.float32)
BPM = 126; B = 60 / BPM
Dm, Bb, C, A_, F_, G_, Gm, D_ = [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61], [41, 48, 53, 57], [43, 50, 55, 59], [43, 50, 55, 58], [50, 57, 62, 66]
def gallop_drums(t0, t1, g=0.5, toms=True):
    t = t0; i = 0
    while t < t1 - 0.05:
        place(music, kick() if i % 2 == 0 else snare(), t, g * (0.9 if i % 2 == 0 else 0.5))
        if toms: place(music, tom(140), t + B * 0.5, g * 0.35); place(music, tom(120), t + B * 0.75, g * 0.35)
        t += B; i += 1
def guitar_bed(t0, t1, prog, g=0.22):
    t = t0; k = 0
    while t < t1 - 0.05:
        ch = prog[(k // 4) % len(prog)]
        strum(ch, t, music, g, True, 0.5); strum(ch[1:], t + B * 0.5, music, g * 0.6, False, 0.35); place(music, gpl(ch[0] - 12, 0.5), t, g * 0.9)
        t += B; k += 1
def melody(inst, notes, t0, g=0.35, beat=B):
    t = t0
    for m, d in notes:
        if m: place(music, inst(m, d * beat * 0.95), t, g)
        t += d * beat
    return t

# 1-2 (0-3.9 s): driving gallop theme; hit on the ditch jump
gallop_drums(0.0, 3.9, 0.55); guitar_bed(0.0, 3.9, [Dm, Dm, C, A_])
melody(whistle, [(74, 1), (74, .5), (77, .5), (81, 1), (79, .5), (77, .5), (76, 1.5), (74, 1.5)], 0.1, 0.22)
place(music, strings(Dm, 3.9, 0.3), 0.0, 0.5)
place(music, cymbal(1.8), 0.72, 0.5); place(music, kick(), 0.72, 0.9); place(music, brass([62, 65, 69], 0.9), 0.72, 0.5)
# 3 (3.9-5.8): dark tense chord
place(music, strings([38, 45, 50, 53, 56], 2.0, 0.25, 900), 3.9, 0.8)
for k in range(8): place(music, tom(70, 0.4), 3.9 + k * B * 0.5, 0.15)
# 4 (5.8-7.5): serious, important motif
place(music, brass([50, 57, 62], 0.85), 5.8, 0.5); place(music, brass([46, 53, 58], 0.85), 6.65, 0.5)
place(music, strings([50, 57, 62, 65], 1.7, 0.2, 1500), 5.8, 0.5)
# 5 (7.5-10.85): rising strings while flying west
for k, ch in enumerate([Dm, Bb, F_, C, A_]): place(music, strings([m + 12 for m in ch], 0.75, 0.05, 2500 + k * 400), 7.55 + k * 0.66, 0.35 + k * 0.08)
melody(harmonica, [(62, 1), (65, 1), (69, 2), (67, 1), (65, 1), (64, 2)], 7.6, 0.18)
# 6-10 (10.85-25.9): relay theme at full speed
gallop_drums(10.85, 25.9, 0.5); guitar_bed(10.85, 25.9, [Dm, Dm, Bb, C, Dm, Dm, A_, A_])
place(music, strings(Dm, 15, 0.8, 1800), 10.9, 0.3)
th = [(74, .5), (74, .5), (77, .5), (81, .5), (79, 1), (77, .5), (76, .5), (74, 1), (72, .5), (74, .5), (76, 1), (69, 1)]
melody(whistle, th, 14.35, 0.2); melody(whistle, th, 22.0 + 1.6, 0.18)
for k, t0 in enumerate([18.1, 19.2, 20.4]): place(music, kick(), t0, 1.0); place(music, brass([62 + k * 2, 65 + k * 2, 69 + k * 2], 0.4), t0, 0.45); place(music, cymbal(0.8), t0, 0.25)
for k in range(7): place(music, shaker(), 21.43 + k * B * 0.25, 0.4)           # desert: dry shaker
for k in range(5): place(music, sleigh(), 22.03 + k * B * 0.25, 0.6)           # snow: icy bells
place(music, strings([86, 89, 93], 0.6, 0.05, 6000), 22.03, 0.25)
for k, m in enumerate([74, 77, 81, 86]): place(music, gpl(m, 0.4), 22.57 + k * 0.1, 0.35)   # river: rippling plucks
# 11-12 (26.1-30.3): victory, big climax on "Rekord"
gallop_drums(26.1, 29.4, 0.55); guitar_bed(26.1, 30.3, [D_, G_, D_, A_], 0.26)
place(music, strings([62, 66, 69, 74], 3.3, 0.6, 3000), 26.1, 0.45)
melody(brass, [], 0, 0)
for k, ch in enumerate([[62, 66, 69], [67, 71, 74], [69, 73, 76]]): place(music, brass(ch, 0.95), 26.2 + k * 1.0, 0.45)
place(music, cymbal(1.3, swell=True), 28.1, 0.6); place(music, brass([62, 66, 69, 74], 1.4), 29.45, 0.75); place(music, cymbal(2.5), 29.45, 0.7); place(music, kick(), 29.45, 1.0)
place(music, bell(660, 2.5), 29.5, 0.3)
# 13-14 (30.3-36.6): slow down; lone harmonica, curiosity
for k, ch in enumerate([Dm, Bb, Gm, A_, Dm, Bb]): strum(ch, 30.4 + k * 1.05, music, 0.14, True, 1.0)
melody(harmonica, [(69, 1.5), (67, .5), (65, 1), (62, 1), (64, 1.5), (65, .5), (67, 2), (69, 1), (70, 1), (69, 2), (65, 2)], 30.6, 0.26)
# 15-16 (36.6-42.4): morse beeps take over the tempo; stop dead at the overtake
t = 36.65; i = 0
while t < 42.35:
    rate = 0.24 - 0.13 * (t - 36.65) / 5.7; dur = 0.05 if i % 3 else 0.14
    place(music, beep(820, dur), t, 0.35 + 0.25 * (t - 36.65) / 5.7); t += rate + dur; i += 1
place(music, strings([50, 57, 62, 64], 3.0, 1.5, 1600), 36.7, 0.3); place(music, strings([52, 59, 64, 67], 2.6, 0.3, 2400), 39.8, 0.35)
for k in range(int(2.4 / (B * 0.5))): place(music, tom(160), 39.95 + k * B * 0.5, 0.25)
# 17-18 (43.5-46.5): lonely, sad harmonica
melody(harmonica, [(62, 2), (65, 1), (64, 1), (62, 3), (57, 1), (60, 2)], 43.55, 0.3, 0.42)
place(music, strings([38, 45, 50, 53], 3.0, 1.0, 900), 43.5, 0.3)
# 19 (46.5-end): slow emotional finale, harmonica + whistle, last held note
for k, ch in enumerate([Dm, Bb, F_, A_, Dm]): strum(ch, 46.6 + k * 1.0, music, 0.12, True, 1.4)
place(music, strings([50, 57, 62, 65, 69], 5.0, 1.2, 1800), 46.6, 0.32)
melody(harmonica, [(69, 1), (67, 1), (65, 2), (62, 2)], 46.7, 0.28, 0.5)
place(music, whistle(74, 2.2), 49.4, 0.24); place(music, harmonica(62, 2.2, bend=False), 49.45, 0.18)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def hoof(g=1.0):
    t = tt(0.12); return ((np.sin(2 * np.pi * 95 * t) * np.exp(-t * 35) * 0.8 + filt(noise(0.12), 200, 2500) * np.exp(-t * 60) * 0.7) * g).astype(np.float32)
def gallop(t0, t1, g=1.0, rate=2.3, fade_in=0.0, fade_out=0.0):
    s = 1 / rate; t = t0; k = 0
    while t < t1:
        a = g * (min(1, (t - t0) / fade_in) if fade_in else 1) * (min(1, (t1 - t) / fade_out) if fade_out else 1)
        for o, v in [(0, 0.8), (0.09, 0.7), (0.21, 1.0), (0.29, 0.9)]: place(sfx, hoof(v * (0.85 + 0.3 * rng.random())), t + o * s * 2.3 / 2.3 * s / s * (s / 0.43) * 0.43, a)
        t += s; k += 1
def whoosh(d=0.5, hi=1500): t = tt(d); return (filt(noise(d), 200, hi) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def thud(f0=60, d=0.5): t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 30))) * np.exp(-t * 9) + filt(noise(d), None, 900) * np.exp(-t * 20) * 0.6).astype(np.float32)
def snort(d=0.35): t = tt(d); return (filt(noise(d), 300, 1800) * np.sin(np.pi * t / d) ** 1.5 * 0.7).astype(np.float32)
def whinny(d=1.0):
    t = tt(d); f = 900 + 500 * np.sin(np.pi * t / d) - 400 * t / d; f *= 1 + 0.04 * np.sin(2 * np.pi * 22 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR; s = sum(np.sin(k * ph) / k for k in range(1, 6))
    return (filt(s.astype(np.float32), 400, 3500) * adsr(len(t), 0.05, 0.3) * 0.35).astype(np.float32)
def rustle(d): t = tt(d); return (filt(noise(d), 2000, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3 * t))) * np.sin(np.pi * t / d) * 0.5).astype(np.float32)
def wind(d, lo=150, hi=900, g=1.0): t = tt(d); return (filt(noise(d), lo, hi) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t + 1)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3) * g).astype(np.float32)
def thunder(d=2.5): t = tt(d); return (filt(noise(d), 20, 220) * 3 * np.minimum(1, t / 0.08) * np.exp(-t / (d * 0.35)) + filt(noise(d), 200, 1200) * np.exp(-t * 6) * 0.4).astype(np.float32)
def crowd(d, cheer=0.0):
    t = tt(d); s = filt(noise(d), 300, 1400) * (0.5 + 0.3 * np.sin(2 * np.pi * 1.7 * t) * np.sin(2 * np.pi * 0.6 * t))
    if cheer: s = s + filt(noise(d), 800, 3500) * cheer * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 2.3 * t)))
    return (s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4) * 0.5).astype(np.float32)
def paper(d=0.6): t = tt(d); return (filt(noise(d), 1500, 6000) * (np.abs(np.sin(2 * np.pi * 9 * t)) ** 3) * 0.6).astype(np.float32)
def creak(d=0.6, f0=130):
    t = tt(d); rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d)); ph = np.cumsum(rate) / SR
    s = filt(((np.mod(ph, 1) < 0.08).astype(np.float32)) * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32)), 200, 2200) * np.sin(np.pi * t / d); return (s * 2.0).astype(np.float32)
def whistle_call():
    out = np.concatenate([whistle(84, 0.25), whistle(91, 0.35)]); return out
def splash(d=0.7): t = tt(d); return (filt(noise(d), 300, 5000) * np.exp(-t * 5) * np.minimum(1, t / 0.01) + filt(noise(d), None, 400) * np.exp(-t * 8)).astype(np.float32)
def buzz(d, f=120): t = tt(d); return (filt(np.sign(np.sin(2 * np.pi * f * t)).astype(np.float32) * 0.3 + noise(d) * 0.1, 80, 2500) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2)).astype(np.float32)
def cicada(d): t = tt(d); return (filt(noise(d), 4000, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 40 * t)) * np.minimum(1, t / 0.1) * 0.6).astype(np.float32)
def tick(): t = tt(0.05); return (filt(noise(0.05), 1500, 6000) * np.exp(-t * 120) + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 90) * 0.5).astype(np.float32)
def zap(d=0.6): t = tt(d); f = 3000 * np.exp(-t * 4) + 200; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + filt(noise(d), 1000, 8000) * 0.3 * (rng.random(len(t)) > 0.7); return (s * np.exp(-t * 3) * np.minimum(1, t / 0.01)).astype(np.float32)
def hammer(): t = tt(0.25); return (np.sin(2 * np.pi * 900 * t) * np.exp(-t * 40) * 0.6 + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25) + filt(noise(0.25), 500, 4000) * np.exp(-t * 50) * 0.5).astype(np.float32)
def twang(d=1.2, f=180): t = tt(d); s = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.01 * np.exp(-t * 3))) / k for k in range(1, 7)); return (s * np.exp(-t * 2.5) * 0.3).astype(np.float32)
def chirp(): t = tt(0.18); f = 3200 + 1200 * np.sin(np.pi * t / 0.18); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.18) * 0.3).astype(np.float32)
def puff(): t = tt(0.5); return (filt(noise(0.5), 150, 2500) * np.exp(-t * 8) * 0.9 + thud(70, 0.5) * 0.6).astype(np.float32)
def sigh(d=1.0): t = tt(d); return (filt(noise(d), 300, 1600) * np.sin(np.pi * t / d) ** 2 * np.exp(-t) * 0.5).astype(np.float32)
def crackle(d): s = np.zeros(int(d * SR), np.float32); [place_local(s, filt(noise(0.01), 1000, 8000) * 0.4, rng.uniform(0, d)) for _ in range(int(d * 12))]; return s
def place_local(buf, sig, t0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i]

# hook + side track
place(sfx, wind(3.9, 200, 1200, 0.35), 0.0); place(sfx, snort(), 0.15, 0.6)
gallop(0.0, 0.72, 1.0, 2.5); place(sfx, whoosh(0.9, 2500), 0.6, 0.9); place(sfx, rustle(0.6), 0.25, 0.25)
place(sfx, thud(55, 0.7), F(50), 1.2); place(sfx, whoosh(0.4), F(42), 0.6)
gallop(F(50), F(117), 1.0, 2.6); place(sfx, rustle(0.5), F(98), 0.8)
# storm, speech, flyover, town
place(sfx, wind(1.9, 100, 600, 0.6), F(117)); place(sfx, thunder(2.6), F(141), 1.1)
place(sfx, crowd(1.7), F(174), 0.35); place(sfx, paper(0.8), F(180), 0.35); place(sfx, paper(0.6), F(200), 0.3)
place(sfx, whoosh(1.8, 900), F(226), 0.9); place(sfx, wind(1.8, 300, 2500, 0.6), F(228))
place(sfx, wind(1.5, 150, 700, 0.25), F(280)); place(sfx, crowd(1.5), F(282), 0.15)
# "keine Bahn / kein Telefon / nur Reiter"
place(sfx, wind(1.2, 200, 1500, 0.5), F(326)); place(sfx, rustle(1.0), F(330), 0.3)
place(sfx, crackle(1.0), F(362), 0.5); place(sfx, whoosh(0.3), F(362), 0.3)
place(sfx, whoosh(0.6, 2000), F(394), 0.7); gallop(F(394), F(430), 1.0, 2.6)
# station
for k in range(3): place(sfx, chirp(), F(440) + k * 0.5, 0.4)
place(sfx, creak(0.7, 110), F(450), 0.4); gallop(F(494), F(538), 0.35, 2.5, fade_in=1.0); place(sfx, whistle_call(), F(512), 0.5)
gallop(F(538), F(552), 0.9, 2.5, fade_out=0.3); place(sfx, snort(0.5), F(550), 0.7)
place(sfx, thud(80, 0.4), F(558), 0.8); place(sfx, creak(0.4, 160), F(560), 0.4)
place(sfx, whoosh(0.6, 1800), F(566), 0.7); place(sfx, thud(70, 0.4), F(586), 0.9); place(sfx, creak(0.5, 140), F(588), 0.4)
place(sfx, whoosh(0.3), F(609), 0.6); place(sfx, thud(65, 0.4), F(616), 0.8); place(sfx, whinny(0.9), F(612), 0.5)
gallop(F(617), F(643), 1.0, 2.6); place(sfx, whistle_call(), F(622), 0.45)
# desert / snow / river
place(sfx, whoosh(0.3), F(641), 0.5); place(sfx, cicada(0.6), F(643), 0.45); gallop(F(643), F(704), 0.9, 2.7)
place(sfx, whoosh(0.3), F(659), 0.5); place(sfx, wind(0.6, 300, 3000, 1.0), F(661))
place(sfx, whoosh(0.3), F(675), 0.5)
for k in range(5): place(sfx, splash(0.5), F(677) + k * 0.17, 0.7)
# home station at dusk
place(sfx, crackle(2.6), F(704), 0.35); place(sfx, creak(0.5, 150), F(706), 0.3)
gallop(F(722), F(760), 0.9, 2.6, fade_out=0.6); place(sfx, puff(), F(760), 1.0); place(sfx, sigh(1.2), F(764), 0.8)
# victory
place(sfx, crowd(4.2, 0.8), F(783), 0.9); gallop(F(783), F(840), 0.8, 2.6)
place(sfx, bell(520, 2.0), F(795), 0.35); place(sfx, bell(520, 2.0), F(825), 0.3)
for k in range(10): place(sfx, hammer() * 0.6, F(840) + k * 0.14, 0.45); place(sfx, paper(0.3), F(840) + k * 0.14 + 0.05, 0.4)
place(sfx, crowd(1.4, 1.4), F(882), 1.0); [place(sfx, whoosh(0.3, 3000), F(882) + k * 0.12, 0.3) for k in range(5)]; place(sfx, whinny(0.8), F(888), 0.4)
# prairie + poles
gallop(F(910), F(981), 0.85, 2.6); place(sfx, wind(2.3, 200, 1200, 0.3), F(910))
for k in range(5): place(sfx, hammer(), F(981 + 8 + 16 * k), 0.75)
place(sfx, creak(1.0, 90), F(990), 0.5); gallop(F(995), F(1050), 0.4, 2.6, fade_in=0.5, fade_out=0.5)
place(sfx, twang(1.6, 160), F(1040), 0.6); place(sfx, twang(1.5, 210), F(1056), 0.5); place(sfx, wind(1.4, 400, 3000, 0.3), F(1056))
# telegraph
place(sfx, wind(2.1, 200, 1000, 0.25), F(1099)); place(sfx, whoosh(0.8, 1500), F(1105), 0.4)
place(sfx, buzz(1.1, 120), F(1164), 0.25)
for k in (4, 10, 16): place(sfx, tick(), F(1164 + k), 1.0); place(sfx, tick(), F(1164 + k) + 0.06, 0.7)
place(sfx, zap(0.6), F(1182), 0.8); place(sfx, whoosh(0.5, 4000), F(1184), 0.7)
place(sfx, whoosh(1.9, 3500), F(1197), 0.8); [place(sfx, zap(0.25), F(1197) + k * 0.3, 0.3) for k in range(6)]
gallop(F(1255), F(1304), 0.8, 2.6); place(sfx, whoosh(0.5, 5000), F(1268), 1.0); place(sfx, zap(0.5), F(1272), 0.9)
# closing
for k in (8, 22, 36): place(sfx, hammer(), F(1304 + k), 1.0)
place(sfx, wind(1.5, 150, 600, 0.3), F(1304)); place(sfx, creak(0.9, 80), F(1352), 0.6); place(sfx, whoosh(0.5), F(1364), 0.4)
gallop(F(1365), F(1395), 0.35, 2.0, fade_out=0.8); place(sfx, whinny(1.0), F(1370), 0.25)
# finale
place(sfx, wind(5.2, 100, 700, 0.35), F(1395)); place(sfx, twang(2.5, 140) * 0.3, F(1400), 0.4)
place(sfx, chirp(), F(1430), 0.45); place(sfx, chirp(), F(1436), 0.35); place(sfx, chirp(), F(1500), 0.4)

# ---------------- mix ----------------
voice = load_voice()
k = int(0.08 * SR); ve = np.convolve(np.abs(voice), np.ones(k) / k, "same"); speaking = np.clip(ve / (np.percentile(ve[ve > 1e-4], 70) * 0.5), 0, 1)
speaking = np.convolve(speaking, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same")
def rms(x, m=None): x = x if m is None else x[m]; return np.sqrt(np.mean(x ** 2) + 1e-12)
mask = ve > np.percentile(ve, 40)
v_rms = rms(voice, mask)
music *= (v_rms * 10 ** (-21 / 20)) / rms(music, mask)               # bed ~21 dB under the speech
sfx *= (v_rms * 10 ** (-17 / 20)) / rms(sfx[sfx != 0])               # effects audible but clearly under
duck = 1 - 0.45 * speaking                                            # ~5 dB extra ducking while talking
mix = voice + (music + sfx * (1 - 0.5 * speaking)) * duck
peak = np.max(np.abs(mix)); mix = mix / max(1.0, peak / 0.97)
fade = int(0.3 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR, "music dB rel voice:", 20 * np.log10(rms(music, mask) / v_rms))
