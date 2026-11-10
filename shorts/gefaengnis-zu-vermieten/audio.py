"""Synthesized light music bed + SFX for "Gefängnis zu vermieten", mixed UNDER the user's voice.mp3.
Nothing here generates or adds any voice-over: voice.mp3 is used as delivered.
Music sits ~21 dB under the speech while it talks (ducked), SFX are kept under the voice too.
Shot starts (frames @30 fps): see web/story.js SHOTS; cue times below are in seconds."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_FRAMES = 1450
DUR = TOTAL_FRAMES / 30
N = int(round(DUR * SR))
rng = np.random.default_rng(11)
F = lambda f: f / 30
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------- helpers ----------------
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def fft_filter(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
lp = lambda x, c: fft_filter(x, hi=c)
hp = lambda x, c: fft_filter(x, lo=c)
bp = lambda x, a, b: fft_filter(x, lo=a, hi=b)
def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1, dur=None):
    t = np.arange(n) / SR; dur = dur or n / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((dur - t) / max(r, 1e-4), 0, 1); return (e * rel).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR)); j = min(len(buf), i + len(sig))
    if i < 0: sig = sig[-i:]; i = 0
    if i < len(buf) and j > i: buf[i:j] += sig[: j - i] * gain
def mixs(*xs):
    n = max(len(x) for x in xs); out = np.zeros(n, np.float32)
    for x in xs: out[:len(x)] += x
    return out
def norm(x, peak=1.0): m = np.max(np.abs(x)) + 1e-9; return (x / m * peak).astype(np.float32)
def glide(f0, f1, d, curve=1.0): t = tt(d); k = (t / d) ** curve; f = f0 * (f1 / f0) ** k; return np.cumsum(f) / SR * 2 * np.pi

# ---------------- instruments ----------------
def pizz(f, dur=0.32, bright=0.55, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t + k) * np.exp(-t * (9 + 5 * k)) for k in range(7))
    s *= np.minimum(1, t / 0.002)
    return (s * amp).astype(np.float32)
def tuba(f, dur, amp=1.0, wah=0.0, bend=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + bend * (t / dur)) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t))
    ph = np.cumsum(fr) / SR * 2 * np.pi
    s = sum(np.sin((k + 1) * ph) / (k + 1) ** 1.15 for k in range(10))
    e = np.minimum(1, t / 0.045) * np.clip((dur - t) / 0.09, 0, 1) * (0.85 + 0.15 * np.exp(-t * 6))
    if wah: e *= 1 - wah * 0.5 * (1 - np.cos(2 * np.pi * t / dur))
    return (lp((s * e).astype(np.float32), 700) * amp).astype(np.float32)
def glock(f, dur=1.0, amp=1.0):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 7) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12)
    return (s * np.minimum(1, t / 0.001) * amp).astype(np.float32)
def wood(f=900, amp=1.0):
    t = tt(0.08); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 60) + bp(noise(0.08), 600, 3000) * np.exp(-t * 90) * 0.4
    return (s * amp).astype(np.float32)
def jingle(amp=1.0):
    t = tt(0.35); s = np.zeros(len(t), np.float32)
    for k in range(5):
        d = int(rng.uniform(0, 0.05) * SR); f0 = rng.uniform(4200, 7800); seg = np.sin(2 * np.pi * f0 * t) * np.exp(-t * 22)
        s[d:] += seg[: len(s) - d].astype(np.float32) * 0.3
    s += hp(noise(0.35), 6000) * np.exp(-t * 25) * 0.35
    return (s * amp).astype(np.float32)
def organ_pipe(f, dur, amp=1.0):
    t = tt(dur); trem = 1 + 0.18 * np.sin(2 * np.pi * 6.3 * t)
    s = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 2, 3, 4, 6)) + 0.35 * np.sign(np.sin(2 * np.pi * f * t)) * 0.4
    e = np.minimum(1, t / 0.02) * np.clip((dur - t) / 0.04, 0, 1)
    return (lp((s * e * trem).astype(np.float32), 5000) * amp).astype(np.float32)

# ---------------- music ----------------
music = np.zeros(N, np.float32)
BPM = 104; B = 60 / BPM

# A (0 - 3.9): empty, lonely: single tuba notes + distant whistling wind
place(music, tuba(midi(41), 1.3, wah=0.3), 0.05, 0.9)            # F2 "bwom"
place(music, tuba(midi(40), 0.9, bend=-0.06), 2.32, 0.75)       # E2 droop on the cut to the guard
wt = tt(3.6); whistle = np.sin(glide(820, 640, 3.6, 1.0)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * wt)) * np.minimum(1, wt / 0.6) * np.clip((3.6 - wt) / 0.6, 0, 1)
place(music, (whistle * 0.12).astype(np.float32), 0.2)

# B (3.9 - 13.87): melancholic but comic D minor pizzicato
mel_B = [62, 65, 69, 67, 65, 64, 62, None, 60, 62, 64, 65, 64, 62, 61, None]
bass_B = [50, 45, 50, 45, 46, 41, 45, 45]
t0 = 3.95; k = 0
while t0 + k * B / 2 < 13.8:
    tb = t0 + k * B / 2
    m = mel_B[k % len(mel_B)]
    if m: place(music, pizz(midi(m), 0.3, 0.5), tb, 0.33)
    if k % 2 == 0: place(music, pizz(midi(bass_B[(k // 2) % len(bass_B)] - 12), 0.45, 0.35), tb, 0.55)
    if k % 8 == 0: place(music, tuba(midi(bass_B[(k // 2) % len(bass_B)] - 12), B * 1.6, 0.6), tb, 0.35)
    if k % 16 == 6: place(music, glock(midi(81), 0.8), tb, 0.08)
    k += 1
# shot 7 (13.87 - 15.87): lazy, slowing motif (ritardando, drooping tuba)
tl = 13.9
for i, (m, g) in enumerate([(67, 0.45), (65, 0.52), (64, 0.62), (62, 0.78)]):
    place(music, pizz(midi(m), 0.4, 0.4), tl, 0.32); place(music, tuba(midi(m - 24), g * 0.95, 0.5, bend=-0.03 * i), tl, 0.4); tl += g
place(music, tuba(midi(38), 0.6, wah=0.5, bend=-0.08), tl, 0.5)

# C (15.95): "aha!" bright glockenspiel hit
for i, m in enumerate([84, 88, 91, 96]): place(music, glock(midi(m), 1.4), 15.98 + i * 0.035, 0.35)

# D (16.3 - 35.55): cheerful "business idea" theme in F major, oom-pah + pizz melody + woodblock
prog = [(41, [65, 69, 72]), (36, [64, 67, 72]), (46, [65, 70, 74]), (36, [64, 67, 70])]
mel_D = [72, 74, 76, 77, 76, 74, 72, 69, 70, 72, 74, 72, 70, 69, 67, None, 69, 72, 77, 76, 74, 72, 74, 76, 77, None, 76, 74, 72, 70, 69, 67]
D0, D1 = 16.32, 35.52
nb = int((D1 - D0) / B)
for b in range(nb):
    tb = D0 + b * B; bar = b // 4; root, ch = prog[bar % 4]; beat = b % 4
    north = 21.45 <= tb < 27.45
    if beat in (0, 2): place(music, tuba(midi(root - (0 if beat == 0 else -7) - 12 + 12), B * 0.7, 0.75), tb, 0.6)
    else: [place(music, pizz(midi(m - 12), 0.22, 0.45), tb, 0.18) for m in ch]
    for h in range(2):
        m = mel_D[(b * 2 + h) % len(mel_D)]
        if m: place(music, pizz(midi(m), 0.26, 0.6), tb + h * B / 2, 0.3)
    place(music, wood(1100 if beat % 2 else 820), tb + B / 2, 0.16)
    if beat == 0 and bar % 2 == 0: place(music, glock(midi(ch[-1] + 12), 0.9), tb, 0.12)
    if north:  # northern colour: sleigh-bell jingles + high chime
        place(music, jingle(), tb, 0.22); place(music, jingle(), tb + B / 2, 0.12)
        if beat == 0: place(music, glock(midi(ch[0] + 24), 1.6), tb + 0.01, 0.1)
wt = tt(6.0); place(music, (lp(noise(6.0), 500) * 0.25 * np.sin(np.pi * wt / 6.0) ** 2).astype(np.float32), 21.47, 0.5)  # wind tone (north)
MUSIC_CUT = F(1067)  # shot 13: the music stops dead
music[int(MUSIC_CUT * SR):int(F(1117) * SR)] = 0

# E (37.23 - 44.6): sneaky comic pizzicato (A minor, staccato tiptoe)
sneak = [45, None, 48, None, 52, None, 51, 52, None, 48, None, 45, 44, None, 45, None]
E0, E1 = F(1117) + 0.02, F(1338)
k = 0
while E0 + k * B / 2 < E1 - 0.05:
    tb = E0 + k * B / 2; m = sneak[k % len(sneak)]
    if m: place(music, pizz(midi(m), 0.16, 0.35), tb, 0.42); place(music, pizz(midi(m + 12), 0.12, 0.5), tb, 0.12)
    if k % 8 == 0: place(music, tuba(midi(33), 0.22, 0.5), tb, 0.45)
    k += 1
CAUGHT = F(1297)
stab = mixs(tuba(midi(33), 0.45, 1.0), pizz(midi(57), 0.4, 0.7) * 0.8, pizz(midi(60), 0.4, 0.7) * 0.6)
place(music, stab, CAUGHT, 0.85); place(music, glock(midi(88), 0.6), CAUGHT + 0.25, 0.15); place(music, glock(midi(91), 0.6), CAUGHT + 0.42, 0.13)

# F (44.6 - 46.3): rising tension (accelerating pizz + tremolo riser)
tr = F(1338)
for i in range(16):
    tb = tr + 1.6 * (1 - (1 - i / 16) ** 1.6); place(music, pizz(midi(57 + i), 0.18, 0.6), tb, 0.22 + i * 0.012)
rt = tt(1.65); riser = np.sin(glide(220, 880, 1.65, 1.4)) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * rt)) * (rt / 1.65) ** 1.5
place(music, (riser * 0.18).astype(np.float32), tr)

# G (46.3 - 48.33): street-organ waltz (oom-pah-pah) + final sting
G0 = F(1389); WB = 0.36
org_mel = [(79, 1), (76, 1), (72, 1), (76, 1), (79, 1), (84, 2), (83, 1), (79, 1)]
tg = G0
for m, d in org_mel: place(music, organ_pipe(midi(m), WB * d * 0.95, 1.0), tg, 0.22); tg += WB * d
for b in range(6):
    tb = G0 + b * WB
    if b % 3 == 0: place(music, organ_pipe(midi(48), WB * 0.8), tb, 0.3)
    else: [place(music, organ_pipe(midi(m), WB * 0.45), tb, 0.08) for m in (64, 67, 72)]
STING = 47.86
sting = mixs(tuba(midi(36), 0.5, 1.0), organ_pipe(midi(60), 0.45) * 0.5, organ_pipe(midi(64), 0.45) * 0.4, organ_pipe(midi(67), 0.45) * 0.4)
place(music, sting, STING, 0.7)
for i, m in enumerate([84, 88, 91, 96]): place(music, glock(midi(m), 0.6), STING + 0.02 * i, 0.22)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def wind(d, cut=700, wob=0.25):
    t = tt(d); s = lp(noise(d), cut) * (0.6 + 0.4 * np.sin(2 * np.pi * wob * t + 1)) + bp(noise(d), 300, 1200) * 0.3 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * t))
    return (s * np.minimum(1, t / 0.4) * np.clip((d - t) / 0.4, 0, 1)).astype(np.float32)
def rustle(d):
    t = tt(d); s = bp(noise(d), 1500, 6000) * (0.35 + 0.65 * (np.abs(np.sin(2 * np.pi * 3.1 * t)) ** 3))
    return (s * np.minimum(1, t / 0.1) * np.clip((d - t) / 0.2, 0, 1)).astype(np.float32)
def chirp(f0=3800, f1=5200, d=0.09):
    t = tt(d); return (np.sin(glide(f0, f1, d)) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def birds(n, spread=1.0):
    out = np.zeros(int((spread + 0.4) * SR), np.float32)
    for k in range(n): place(out, chirp(rng.uniform(3200, 4200), rng.uniform(4500, 6000), rng.uniform(0.05, 0.1)), rng.uniform(0, spread), rng.uniform(0.5, 1))
    return out
def crickets(d):
    out = np.zeros(int(d * SR), np.float32); t = 0.0
    while t < d - 0.2:
        for p in range(3): place(out, (np.sin(2 * np.pi * 4600 * tt(0.018)) * np.sin(np.pi * tt(0.018) / 0.018)).astype(np.float32), t + p * 0.035, 1)
        t += rng.uniform(0.32, 0.45)
    return out
def ahem():
    t = tt(0.5); s1 = bp(noise(0.18), 300, 2500) * np.exp(-tt(0.18) * 12); v = np.zeros(len(t), np.float32)
    ph = glide(150, 115, 0.28); hm = sum(np.sin(k * ph) / k for k in range(1, 8)) * np.sin(np.pi * tt(0.28) / 0.28) ** 0.6
    v[:len(s1)] += s1; v[int(0.17 * SR):int(0.17 * SR) + len(hm)] += lp(hm.astype(np.float32), 900) * 0.8
    return v
def sand(d): t = tt(d); return (hp(noise(d), 4000) * 0.3 * np.minimum(1, t / 0.2) * np.clip((d - t) / 0.2, 0, 1)).astype(np.float32)
def bloop(f0=700, f1=260, d=0.16): t = tt(d); return (np.sin(glide(f0, f1, d)) * np.exp(-t * 14)).astype(np.float32)
def chalk(d):
    t = tt(d); squeak = np.sin(glide(2300, 2900, d)) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t)) * 0.3
    return ((bp(noise(d), 2500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) + squeak) * np.minimum(1, t / 0.03) * np.clip((d - t) / 0.05, 0, 1)).astype(np.float32)
def pop():
    t = tt(0.09); return (np.sin(glide(950, 260, 0.09)) * np.exp(-t * 30) + hp(noise(0.09), 2000) * np.exp(-t * 120) * 0.5).astype(np.float32)
def click():
    t = tt(0.03); return (hp(noise(0.03), 2500) * np.exp(-t * 300) + np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 200) * 0.6).astype(np.float32)
def clack():
    t = tt(0.25); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(1250, 30), (2630, 40), (3900, 55)]) * 0.5 + bp(noise(0.25), 800, 5000) * np.exp(-t * 70)).astype(np.float32)
def step(f=110):
    t = tt(0.12); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 40) + bp(noise(0.12), 400, 3000) * np.exp(-t * 60) * 0.6).astype(np.float32)
def echo(x, delays=(0.11, 0.23, 0.37, 0.52), g=0.45):
    out = np.zeros(len(x) + int(0.6 * SR), np.float32); out[:len(x)] += x
    for i, d in enumerate(delays): j = int(d * SR); out[j:j + len(x)] += lp(x, 2500 - i * 400) * g ** (i + 1)
    return out
def creak(d=0.5, f0=150):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.1 * t / d)); ph = np.cumsum(rate) / SR
    pul = (np.mod(ph, 1) < 0.07).astype(np.float32) * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32))
    return (hp(lp(pul, 2400), 250) * np.sin(np.pi * t / d) * 2.0).astype(np.float32)
def riffle(d=0.45):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(48): place(out, (hp(noise(0.006), 1500) * np.exp(-tt(0.006) * 600)).astype(np.float32), k / 48 * d * (0.8 + 0.2 * rng.random()), rng.uniform(0.4, 1))
    return bp(out, 1500, 8000)
def yawn(d=1.0):
    t = tt(d); ph = glide(240, 130, d, 0.8); src = sum(np.sin(k * ph) / k for k in range(1, 14)).astype(np.float32) + 0.3 * noise(d)
    v = bp(src, 450, 1300) * np.sin(np.pi * t / d) ** 0.8 * (0.6 + 0.4 * np.exp(-t * 1.5))
    return v.astype(np.float32)
def slurp(d=0.45):
    t = tt(d); return (bp(noise(d), 1200, 3500) * (t / d) ** 1.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t)) * np.clip((d - t) / 0.05, 0, 1)).astype(np.float32)
def bell_ding(f=1760, d=1.4):
    t = tt(d); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) * a for r, k, a in [(1, 2.5, 1), (2.4, 4, 0.5), (3.9, 7, 0.3), (5.6, 10, 0.2)])).astype(np.float32)
def keys():
    out = np.zeros(int(0.6 * SR), np.float32)
    for k in range(7): place(out, (np.sin(2 * np.pi * rng.uniform(3000, 6500) * tt(0.25)) * np.exp(-tt(0.25) * 25)).astype(np.float32), rng.uniform(0, 0.25), rng.uniform(0.3, 0.7))
    return out
def whirr(d=0.55):
    t = tt(d); ph = glide(80, 150, d); s = sum(np.sin(k * ph) / k for k in range(1, 9))
    return (lp(s.astype(np.float32), 900) * np.sin(np.pi * t / d) ** 0.5 * 0.6).astype(np.float32)
def thunk(f=90, d=0.3):
    t = tt(d); return (np.sin(2 * np.pi * f * t * (1 + 0.5 * np.exp(-t * 40))) * np.exp(-t * 16) + lp(noise(d), 1500) * np.exp(-t * 40) * 0.5).astype(np.float32)
def engine(d, f0=42, rise=0.0):
    t = tt(d); ph = np.cumsum(f0 * (1 + rise * t / d) * (1 + 0.02 * np.sin(2 * np.pi * 7 * t))) / SR * 2 * np.pi
    s = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 12)) + lp(noise(d), 300) * 0.8
    return (lp(s.astype(np.float32), 700) * np.minimum(1, t / 0.3) * np.clip((d - t) / 0.3, 0, 1)).astype(np.float32)
def honk(f=420, d=0.16):
    t = tt(d); s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sign(np.sin(2 * np.pi * f * 1.26 * t)) * 0.5
    return (lp(s.astype(np.float32), 2500) * np.minimum(1, t / 0.01) * np.clip((d - t) / 0.02, 0, 1)).astype(np.float32)
def voiced(f0, f1, d, form=(800, 1300), breath=0.2):
    t = tt(d); ph = glide(f0, f1, d); src = sum(np.sin(k * ph) / k for k in range(1, 16)).astype(np.float32) + breath * noise(d)
    v = sum(bp(src, fc * 0.8, fc * 1.25) for fc in form) * np.sin(np.pi * t / d) ** 0.7
    return v.astype(np.float32)
def crowd(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(9):
        dd = rng.uniform(0.35, 0.7); f0 = rng.uniform(230, 420)
        place(out, voiced(f0, f0 * rng.uniform(1.15, 1.5), dd, (rng.uniform(650, 900), rng.uniform(1100, 1500))), rng.uniform(0, d - dd), rng.uniform(0.5, 1))
    return hp(out, 250)
def horn(d=1.0):
    t = tt(d); ph = 2 * np.pi * 110 * t; s = sum(np.sin(k * ph) / k for k in range(1, 12)) + 0.7 * sum(np.sin(k * 1.5 * ph) / k for k in range(1, 9))
    return (lp(s.astype(np.float32), 1200) * np.minimum(1, t / 0.08) * np.clip((d - t) / 0.2, 0, 1) * 0.5).astype(np.float32)
def drag(d):
    t = tt(d); s = bp(noise(d), 250, 2200) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 1.6 * t)) ** 2) + lp(noise(d), 200) * 0.5
    return (s * np.minimum(1, t / 0.2) * np.clip((d - t) / 0.2, 0, 1)).astype(np.float32)
def cluck(n=3):
    out = np.zeros(int((0.16 * n + 0.5) * SR), np.float32)
    for k in range(n): place(out, voiced(520, 380, 0.09, (1100, 2100), 0.5), k * 0.14, 1)
    place(out, voiced(600, 330, 0.35, (1000, 2000), 0.5), n * 0.14 + 0.05, 1.1)
    return out
def pour(d):
    t = tt(d); s = bp(noise(d), 900, 4500) * (0.7 + 0.3 * np.sin(2 * np.pi * 11 * t + np.sin(2 * np.pi * 3 * t)))
    return (s * np.minimum(1, t / 0.08) * np.clip((d - t) / 0.1, 0, 1)).astype(np.float32)
def yippee():
    out = np.zeros(int(0.7 * SR), np.float32)
    place(out, voiced(380, 560, 0.14, (350, 2300), 0.15), 0, 0.9); place(out, voiced(450, 820, 0.32, (330, 2400), 0.15), 0.16, 1)
    return out
def giggle():
    out = np.zeros(int(0.5 * SR), np.float32)
    for k in range(2): place(out, voiced(330, 300, 0.1, (400, 2200), 0.6), k * 0.15, 1)
    return out
def rip():
    t = tt(0.22); s = bp(noise(0.22), 1800, 7000) * np.exp(-t * 14) * (0.5 + 0.5 * (rng.random(len(t)) > 0.6))
    return s.astype(np.float32)
def flutter(d=0.6):
    t = tt(d); return (bp(noise(d), 500, 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 16 * t)) * np.exp(-t * 3)).astype(np.float32)
def zipper(d=0.6):
    out = np.zeros(int(d * SR), np.float32); n = 50
    for k in range(n): place(out, (hp(noise(0.004), 2500) * np.exp(-tt(0.004) * 900)).astype(np.float32), d * (k / n) ** 0.8, 0.8)
    return bp(out, 2000, 9000)
def tap(f=180): t = tt(0.1); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 55) + bp(noise(0.1), 800, 4000) * np.exp(-t * 90) * 0.5).astype(np.float32)
def tiptoe():
    t = tt(0.06); return (np.sin(2 * np.pi * 1300 * t) * np.exp(-t * 90) * 0.5 + bp(noise(0.06), 1500, 5000) * np.exp(-t * 120) * 0.4).astype(np.float32)
def whoosh(d=0.4, lo=300, hi=2600):
    t = tt(d); return (bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def swoosh_up(d=1.6):
    t = tt(d); x = noise(d); out = np.zeros_like(x); seg = int(0.05 * SR)
    for i in range(0, len(x), seg):
        k = i / len(x); c = 300 * (13 ** k); out[i:i + seg] = bp(x[i:i + seg + 0], c * 0.6, c * 1.6)[: len(out[i:i + seg])]
    return (out * (t / d) ** 1.3 * np.clip((d - t) / 0.08, 0, 1)).astype(np.float32)
def bike_bell():
    out = np.zeros(int(0.9 * SR), np.float32)
    for k in range(2): place(out, (sum(np.sin(2 * np.pi * f * tt(0.5)) * np.exp(-tt(0.5) * kk) for f, kk in [(2350, 6), (3480, 9), (5150, 13)]) * (1 + 0.3 * np.sin(2 * np.pi * 28 * tt(0.5)))).astype(np.float32), k * 0.16, 0.5)
    return out
def sails(d):
    t = tt(d); return (lp(noise(d), 700) * (np.abs(np.sin(2 * np.pi * 0.75 * t)) ** 4) * np.minimum(1, t / 0.2) * np.clip((d - t) / 0.3, 0, 1)).astype(np.float32)

# --- cue table ---
# M1 (0 - 2.3): wind, rolling tumbleweed, one distant bird
place(sfx, wind(2.5, 600), 0.0, 0.8); place(sfx, rustle(2.3), 0.0, 0.55); place(sfx, chirp(3600, 4900, 0.08), 1.25, 0.12); place(sfx, chirp(3900, 5200, 0.06), 1.37, 0.08)
# 2 (2.3 - 3.9): crickets (nobody here), throat clearing
place(sfx, crickets(1.65), F(69), 0.16); place(sfx, ahem(), 3.74, 0.55)
# 3-4: sand hiss + shrink bloops, chalk, pop pop pop
place(sfx, sand(1.3), F(117), 0.35)
for fr in (125, 137, 149): place(sfx, bloop(), F(fr), 0.35)
place(sfx, chalk(1.0), F(163), 0.35)
for fr in (222, 233, 244, 255, 266): place(sfx, pop(), F(fr), 0.6)
# 5: lights clicking off one after another + padlocks snapping shut
for k in range(28): place(sfx, click(), F(304 + k * 1.7), 0.22 * (1 - k / 40))
for k in (0, 3, 6, 9): place(sfx, clack(), F(304 + k * 1.7) + 0.06, 0.42)
# M2 corridor: echoing footsteps, rocking chair creaks
for i in range(4): place(sfx, echo(step(105)), F(358) + i * 0.48, 0.38)
place(sfx, creak(0.45, 170), F(398), 0.4); place(sfx, creak(0.45, 150), F(406) + 0.3, 0.32)
# M3 guard room: card riffle, yawn, coffee sip
place(sfx, riffle(), F(418), 0.4); place(sfx, yawn(0.95), F(432), 0.2); place(sfx, riffle(0.35), F(450), 0.3); place(sfx, slurp(), F(464), 0.25)
# 8: bulb "pling" + key jingle
place(sfx, bell_ding(2093, 1.0), F(481), 0.3); place(sfx, keys(), F(502), 0.38)
# M4 border: barrier motor + clunk, bus engines, honk, cheering
place(sfx, whirr(0.5), F(537), 0.45); place(sfx, thunk(70, 0.3), F(553), 0.4)
place(sfx, engine(3.4, 40, 0.2), F(548), 0.55); place(sfx, engine(2.4, 46, 0.1), F(590), 0.4)
place(sfx, honk(), F(590), 0.22); place(sfx, honk(), F(590) + 0.2, 0.22)
place(sfx, crowd(1.9), F(575), 0.13)
# M5 north: snowstorm wind, heavy bag dragged, ferry horn (in the dash pause), handshake tap
place(sfx, wind(4.2, 900, 0.4), F(644), 0.6); place(sfx, drag(2.5), F(690), 0.35); place(sfx, horn(0.75), 25.37, 0.33)
place(sfx, tap(160), F(781), 0.5)
# M6 garden: clucks, water from the can, birds
place(sfx, cluck(3), F(826), 0.18); place(sfx, cluck(2), F(850), 0.16); place(sfx, cluck(4), F(868), 0.14)
place(sfx, pour(1.05), F(886), 0.18); place(sfx, birds(6, 2.6), F(830), 0.08); place(sfx, birds(3, 0.8), F(890), 0.06)
# M7 market: door bell ding, basket clicks, "yippee"
place(sfx, bell_ding(1568, 1.2), F(918), 0.32); place(sfx, bell_ding(1568, 1.0), F(918) + 0.14, 0.2)
for tclick in (31.5, 32.25, 33.4): place(sfx, wood(1500, 1.0), tclick, 0.2)
place(sfx, yippee(), F(1016), 0.2)
# 13: sudden silence (everything muted below)
# M8: calendar pages tear + flutter, suitcase zipper, bus pulls away
for k in range(8): place(sfx, rip(), F(1119 + k * 5), 0.3)
place(sfx, flutter(1.2), F(1121), 0.18); place(sfx, zipper(0.65), F(1166), 0.28)
place(sfx, engine(2.0, 44, 0.6), F(1203), 0.45)
# 15: tiptoe steps, shoulder tap, innocent giggle
for i in range(9): place(sfx, tiptoe(), F(1232) + i * 0.24, 0.3)
place(sfx, tap(220), F(1297), 0.55); place(sfx, giggle(), 44.45, 0.22)
# 16: rising swoosh
place(sfx, swoosh_up(1.65), F(1338), 0.55)
# M9: windmill sails, bicycle bells, birds
place(sfx, sails(2.0), F(1389), 0.3); place(sfx, bike_bell(), 46.38, 0.2); place(sfx, bike_bell(), 47.55, 0.16); place(sfx, birds(5, 1.6), F(1392), 0.06)
# short whooshes on the cuts
for fr in (117, 198, 288, 356, 476, 533, 644, 683, 765, 824, 917, 1117, 1187, 1230, 1389): place(sfx, whoosh(0.32), F(fr) - 0.14, 0.18)

# shot 13: sudden silence for everything except the voice
for buf in (music, sfx): buf[int(MUSIC_CUT * SR):int((F(1117) - 0.02) * SR)] = 0

# ---------------- mix ----------------
def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
voice = load_voice()
win = int(0.05 * SR)
def env_rms(x): return np.sqrt(np.convolve(x * x, np.ones(win) / win, "same") + 1e-12)
venv = env_rms(voice)
speech = venv > venv.max() * 0.06
sp = np.convolve(speech.astype(np.float32), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")  # smoothed speech presence (attack/release ~0.25 s)
sp = np.clip(sp * 1.6, 0, 1)
v_rms = np.sqrt(np.mean(voice[speech] ** 2))
# music: ~21 dB under the speech while talking, +5 dB in the gaps
mus_rms = np.sqrt(np.mean(music[np.abs(music) > 1e-4] ** 2)) + 1e-9
music *= (v_rms * 10 ** (-21 / 20)) / mus_rms
music *= 10 ** ((5 * (1 - sp)) / 20)
# sfx: under the voice; another 6 dB down while speech is running
sfx_rms = np.sqrt(np.mean(sfx[np.abs(sfx) > 1e-4] ** 2)) + 1e-9
sfx *= (v_rms * 10 ** (-14 / 20)) / sfx_rms
sfx *= 10 ** ((-6 * sp) / 20)
mix = voice + music + sfx
mix = np.tanh(mix * 0.98) / np.tanh(0.98)
fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"ok {len(pcm) / SR:.3f}s  voice(speech) {db(voice[speech]):.1f} dBFS  music under speech {db(music[speech]):.1f}  music in gaps {db(music[~speech & (np.abs(music) > 1e-5)]):.1f}  sfx under speech {db(sfx[speech]):.1f}")
