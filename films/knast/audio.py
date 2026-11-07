"""Synthesized music bed + SFX for "Aus dem Knast ausbrechen?", mixed UNDER the user's voice.mp3 (voice is untouched).
Music sits ~19 dB under the voice while it speaks (side-chain ducking), SFX are ducked ~6 dB during speech.
Writes mix_raw.wav (48 kHz stereo). finish.sh normalises to -14 LUFS."""
import numpy as np, subprocess, wave, json

SR = 48000
FPS = 30
TOTAL = 1590
DUR = TOTAL / FPS
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / FPS

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy()
    out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def fft_filter(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def nm(s):  # 'A4' -> midi
    n, o = (s[:-1], int(s[-1])); return 12 * (o + 1) + NOTE[n]

# ---------------- instruments ----------------
def pizz(f, dur=0.32, bright=0.55, body=1.0):
    t = tt(dur); s = np.zeros_like(t)
    for k in range(1, 9):
        if f * k > 9000: break
        s += (bright ** (k - 1)) / k * np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (7 + 4.5 * k) / body)
    att = np.minimum(1, t / 0.002)
    click = fft_filter(noise(dur), 800, 5000) * np.exp(-t * 300) * 0.25
    return ((s * att + click) * 0.6).astype(np.float32)
def bass(f, dur=0.36):
    t = tt(dur); s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.18 * np.sin(6 * np.pi * f * t)
    return (s * np.minimum(1, t / 0.004) * np.exp(-t * 7.5)).astype(np.float32)
def hat(open_=False):
    d = 0.18 if open_ else 0.05; t = tt(d)
    return (fft_filter(noise(d), 7000, None) * np.exp(-t * (18 if open_ else 70)) * 0.35).astype(np.float32)
def snap():
    d = 0.08; t = tt(d); return (fft_filter(noise(d), 1500, 4500) * np.exp(-t * 80) * 0.7).astype(np.float32)
def kick(soft=1.0):
    t = tt(0.3); f = 48 + 70 * np.exp(-t * 35)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) * soft).astype(np.float32)
def glock(f, dur=0.9):
    t = tt(dur); s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dcy) for r, a, dcy in [(1, 1, 3.5), (2.76, 0.35, 7), (5.4, 0.15, 12)])
    return (s * np.minimum(1, t / 0.002) * 0.45).astype(np.float32)
def clap():
    d = 0.16; t = tt(d); env = sum(np.exp(-np.maximum(0, t - o) * 90) * (t >= o) for o in (0, 0.012, 0.024))
    return (fft_filter(noise(d), 900, 5000) * env * 0.5).astype(np.float32)
def saw(f, t):
    ph = (f * t) % 1.0; return 2 * ph - 1
def brass(fs, dur, cut=1600):
    t = tt(dur); s = sum(saw(f * (1 + 0.002 * np.sin(2 * np.pi * 5.5 * t)), t) for f in fs) / len(fs)
    env = np.minimum(1, t / 0.03) * np.exp(-t * 2.2)
    return fft_filter((s * env).astype(np.float32), None, cut)

# ---------------- timeline ----------------
NOE_SCRATCH = 16.06          # record scratch in the pause after "oder?"
CHEER_START = F(510)         # cheerful variation from the "Für die Flucht" cut
HAKEN = F(798)               # tension from "Aber jetzt kommt der Haken"
SAD = F(1250)                # sad note on "Und deine alte Strafe?"
TIPTOE = F(1357)             # tiptoe pizzicato for the last three lines
STING = 51.98                # final sting after "allein"
STAMP_HITS = [F(f + 5) for f in (905, 1010, 1101, 1204)]
music = np.zeros(N, np.float32)
hits = np.zeros(N, np.float32)

# 1) heist theme, A minor, 110 BPM
BPM = 110; beat = 60 / BPM
mel = [('A4', 0), ('C5', 1), ('E5', 2), ('D#5', 2.5), ('E5', 3), ('F5', 4), ('E5', 5), ('C5', 6), ('B4', 7),
       ('A4', 8), ('C5', 9), ('E5', 10), ('F5', 10.5), ('G5', 11), ('F5', 12), ('E5', 12.5), ('D5', 13), ('C5', 13.5), ('B4', 14), ('E4', 15)]
bassline = ['A2', 'A2', 'C3', 'E3', 'F2', 'F2', 'A2', 'C3', 'D2', 'D2', 'F2', 'A2', 'E2', 'E2', 'G#2', 'B2']
def heist(t0, t1, major=False, gain=1.0):
    out = np.zeros(N, np.float32); b = 0
    tr = (lambda m: m + (1 if (m % 12) in (0, 5) else 0)) if major else (lambda m: m)  # C->C#, F->F# : A major colour
    while t0 + b * beat < t1:
        tb = t0 + b * beat; bar = (b // 4) % 4; ib = b % 16
        mb = bassline[ib]; m = tr(nm(mb))
        place(out, bass(midi(m), 0.3 if not major else 0.22), tb, 0.55)
        if major: place(out, bass(midi(m + 7), 0.2), tb + beat / 2, 0.3)
        place(out, hat(), tb + beat / 2, 0.35 if not major else 0.45)
        if b % 2 == 1: place(out, snap() if not major else clap(), tb, 0.45 if not major else 0.4)
        if b % 4 == 0: place(out, kick(0.6), tb, 0.4)
        b += 1
    # melody (pizz), loops every 16 beats; enters after 2 bars in the heist
    L = 16 * beat; k = 0
    while t0 + k * L < t1:
        for n, pos in mel:
            tn = t0 + k * L + pos * beat
            if tn >= t1: break
            m = tr(nm(n))
            if major: place(out, glock(midi(m + 12), 0.6), tn, 0.28)
            place(out, pizz(midi(m), 0.3 if not major else 0.22), tn, 0.55 if not major else 0.45)
        k += 1
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR)); out[:i0] = 0; out[i1:] = 0
    return out * gain
music += heist(0.0, NOE_SCRATCH + 0.02)
# record scratch: re-read the last 0.35 s of the bed at a wild speed curve
def scratch(src, t0, d=0.34):
    t = tt(d); speed = 1.0 - 2.6 * np.sin(np.pi * t / d * 2.0) * np.exp(-t * 2)
    idx = int(t0 * SR) + np.cumsum(speed).astype(np.int64) - 4000
    idx = np.clip(idx, 0, N - 1); s = src[idx] * 2.2
    s += fft_filter(noise(d), 600, 3500) * (0.25 + 0.75 * np.abs(np.sin(np.pi * t / d * 3))) * 0.5
    return (s * np.minimum(1, (d - t) / 0.02)).astype(np.float32)
scr = scratch(music.copy(), NOE_SCRATCH)
music[int(NOE_SCRATCH * SR):] = 0
place(hits, scr, NOE_SCRATCH, 0.9)
# 0.4 s+ of silence (the "Nö" lands in it), then the cheerful variation
music += heist(CHEER_START, HAKEN - 0.05, major=True, gain=1.0)
# 2) tension: low drone + clock ticks, hits on Haken and on every stamp
d = SAD - HAKEN; t = tt(d)
drone = (saw(55, t) + saw(55.4, t) + 0.6 * saw(82.4, t)) * 0.3 + 0.5 * np.sin(2 * np.pi * 41.2 * t)
drone = fft_filter(drone.astype(np.float32), None, 320) * np.minimum(1, t / 0.4) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * t))
drone *= np.minimum(1, (d - t) / 0.5)
place(music, drone.astype(np.float32), HAKEN, 0.9)
def tick(hi=True):
    d = 0.06; t = tt(d); s = fft_filter(noise(d), 2500 if hi else 1500, 6000 if hi else 3500) * np.exp(-t * 120)
    s += np.sin(2 * np.pi * (3200 if hi else 2400) * t) * np.exp(-t * 90) * 0.4
    return (s * 0.6).astype(np.float32)
k = 0; tk = HAKEN + 0.1
while tk < SAD - 0.3: place(music, tick(k % 2 == 0), tk, 0.55); k += 1; tk += 0.5
def hit(big=1.0):
    d = 1.2; t = tt(d); f = 42 + 60 * np.exp(-t * 25)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
    crack = fft_filter(noise(d), 900, 5000) * np.exp(-t * 28) * 0.7
    stab = np.zeros_like(t); b = brass([midi(45), midi(48), midi(51), midi(57)], 0.7, 1400); stab[: len(b)] = b * 1.4
    return ((boom + crack + stab) * big).astype(np.float32)
place(hits, hit(0.9), HAKEN + 0.02, 0.8)
place(hits, hit(1.0), F(838), 0.9)
for th in STAMP_HITS: place(hits, hit(1.0), th - 0.01, 1.0)
# 3) sad note (cello-ish slide E3 -> D#3)
d = 1.5; t = tt(d); fsl = midi(52) * 2 ** (-(np.clip((t - 0.5) / 0.6, 0, 1)) / 12) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t))
sad = sum(np.sin(2 * np.pi * np.cumsum(fsl * h) / SR) / h ** 1.2 for h in range(1, 7))
sad = fft_filter((sad * np.minimum(1, t / 0.12) * np.minimum(1, (d - t) / 0.4)).astype(np.float32), None, 1800)
place(music, sad, SAD + 0.05, 0.75)
# 4) tiptoe pizzicato, then the final sting
tb = TIPTOE; seq = ['E5', 'F5', 'E5', 'F5', 'G5', 'F5', 'E5', 'D#5']; k = 0; step = 0.3
while tb < STING - 0.15:
    place(music, pizz(midi(nm(seq[k % 8])), 0.18, 0.45), tb, 0.42)
    if k % 2 == 0: place(music, pizz(midi(nm('A2') if (k // 8) % 2 == 0 else nm('E2')), 0.22, 0.4, 1.3), tb, 0.5)
    k += 1; tb += step
sting = np.zeros(int(1.0 * SR), np.float32)
for m in ('A2', 'E3', 'A3', 'C4', 'E4'): sting[: int(0.5 * SR)] += pizz(midi(nm(m)), 0.5, 0.6)[: int(0.5 * SR)] * 0.5
b = brass([midi(57), midi(60), midi(64)], 0.9, 2200); sting[: len(b)] += b * 0.9
sting += np.pad(kick(1.0), (0, len(sting) - len(kick(1.0)))) * 0.6
place(hits, sting, STING, 0.9)

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def whoosh(d=0.4, lo=300, hi=2500):
    t = tt(d); return (fft_filter(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def thud(f0=70, d=0.35):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.8 * np.exp(-t * 40))) * np.exp(-t * 12) + fft_filter(noise(d), None, 900) * np.exp(-t * 30) * 0.6).astype(np.float32)
def ding():
    t = tt(1.0); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (4186, 7), (6272, 10)]) * 0.3).astype(np.float32)
def hum(d):
    t = tt(d); s = sum(np.sin(2 * np.pi * 50 * h * t) / h for h in (1, 2, 3, 4)) * 0.3 + fft_filter(noise(d), 80, 400) * 0.1
    return (s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)).astype(np.float32)
def jingle(d=0.35):
    out = np.zeros(int(d * SR), np.float32)
    for _ in range(6):
        o = int(rng.uniform(0, d * 0.6) * SR); f = rng.uniform(2500, 5200); t = tt(0.15)
        place_local(out, ((np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t * 35) * 0.3).astype(np.float32), o / SR)
    return out
def yawn(d=0.8):
    t = tt(d); f0 = 170 - 60 * t / d
    ph = np.cumsum(f0) / SR; s = 2 * (ph % 1) - 1
    v = fft_filter(s.astype(np.float32), 500, 1300, 2) * np.sin(np.pi * t / d) ** 1.5
    return (v + fft_filter(noise(d), 600, 2000) * 0.15 * np.sin(np.pi * t / d)).astype(np.float32)
def creak(d=0.7, f0=110):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.1 * t / d)); ph = np.cumsum(rate) / SR
    pulses = (np.mod(ph, 1) < 0.07).astype(np.float32) * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32))
    return (fft_filter(pulses, 250, 2600) * np.sin(np.pi * t / d) * 2.2).astype(np.float32)
def step(kind='run'):
    d = 0.12; t = tt(d)
    if kind == 'tip': return (fft_filter(noise(d), 1500, 5000) * np.exp(-t * 90) * 0.35).astype(np.float32)
    return (np.sin(2 * np.pi * 85 * t) * np.exp(-t * 30) * 0.8 + fft_filter(noise(d), 700, 3500) * np.exp(-t * 45) * 0.45).astype(np.float32)
def bark():
    d = 0.22; t = tt(d); f = 330 - 120 * t / d; ph = np.cumsum(f) / SR
    s = fft_filter((2 * (ph % 1) - 1).astype(np.float32), 400, 1400, 2) * np.minimum(1, t / 0.01) * np.exp(-t * 9)
    s = fft_filter(s + fft_filter(noise(d), 500, 1500) * 0.3 * np.exp(-t * 14), None, 1600)
    tail = np.zeros(int(0.6 * SR), np.float32); tail[: len(s)] = s
    for dl, g in ((0.09, 0.35), (0.19, 0.2), (0.31, 0.1)): i = int(dl * SR); tail[i:i + len(s)] += s[: len(tail) - i] * g
    return tail
def siren(d=1.3):
    t = tt(d); f = np.where((t // 0.42) % 2 == 0, 440.0, 587.0); ph = np.cumsum(f) / SR
    s = np.sign(np.sin(2 * np.pi * ph)) * 0.5 + np.sin(2 * np.pi * ph)
    return (fft_filter(s.astype(np.float32), 300, 2500) * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.2) * 0.4).astype(np.float32)
def screech(d=0.55):
    t = tt(d); f = 1700 + 300 * np.sin(2 * np.pi * 23 * t) + rng.normal(0, 40, len(t)); ph = np.cumsum(f) / SR
    s = np.sin(2 * np.pi * ph) * 0.5 + fft_filter(noise(d), 1200, 4000) * 0.5
    return (s * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.15) * 0.6).astype(np.float32)
def click(n=2):
    out = np.zeros(int(0.25 * SR), np.float32)
    for k in range(n):
        t = tt(0.06); s = fft_filter(noise(0.06), 3000, 9000) * np.exp(-t * 150) + np.sin(2 * np.pi * 3600 * t) * np.exp(-t * 80) * 0.5
        place_local(out, s, k * 0.07)
    return out
def fly(d):
    t = tt(d); f = 210 + 25 * np.sin(2 * np.pi * 3.1 * t) + 10 * np.sin(2 * np.pi * 7.3 * t); ph = np.cumsum(f) / SR
    s = fft_filter((2 * (ph % 1) - 1).astype(np.float32), 200, 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * t) ** 2)
    return (s * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2) * 0.3).astype(np.float32)
def pop():
    t = tt(0.12); f = 300 + 1500 * (t / 0.12) ** 0.6; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)
    out = np.zeros(int(0.6 * SR), np.float32); out[: len(s)] += s
    out += fft_filter(noise(0.6), 3000, 9000) * np.exp(-tt(0.6) * 6) * 0.25
    return out
def boing():
    t = tt(0.35); f = 180 + 220 * np.exp(-t * 6) * (1 + 0.3 * np.sin(2 * np.pi * 18 * t)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 0.6).astype(np.float32)
def flutter(d):
    t = tt(d); return (fft_filter(noise(d), 400, 2200) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 13 * t))) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2) * 0.5).astype(np.float32)
def chirp():
    t = tt(0.09); f = 2800 + 1400 * np.sin(np.pi * t / 0.09); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.09) * 0.35).astype(np.float32)
def chime():
    out = np.zeros(int(1.4 * SR), np.float32)
    for k, m in enumerate(('A5', 'C#6', 'E6', 'A6')): place_local(out, glock(midi(nm(m)), 1.0), k * 0.07)
    return out
def place_local(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * g
def rasp(d, per=7 / 30):
    t = tt(d); m = np.abs(np.sin(np.pi * t / per)) ** 0.7
    s = fft_filter(noise(d), 1800, 7000) * m + np.sin(2 * np.pi * 3100 * t) * 0.08 * m
    return (s * 0.7).astype(np.float32)
def clank(big=1.0):
    t = tt(0.9); s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dc) for f, a, dc in [(520, 1, 6), (1370, 0.6, 9), (2310, 0.4, 12), (3480, 0.25, 16)])
    return ((s * 0.5 + fft_filter(noise(0.9), 1500, 6000) * np.exp(-t * 40) * 0.4) * big).astype(np.float32)
def rattle(d):
    out = np.zeros(int(d * SR), np.float32); tk = 0.0
    while tk < d - 0.3: place_local(out, clank(0.5) * 0.6, tk); place_local(out, thud(60, 0.25) * 0.5, tk); tk += rng.uniform(0.18, 0.32)
    return out
def slam():
    return (np.concatenate([thud(55, 0.5) * 1.2, np.zeros(int(0.4 * SR), np.float32)]) + np.pad(clank(1.0), (0, int(0.9 * SR) - int(0.9 * SR)))[: int(0.9 * SR)] * 0.8).astype(np.float32)
def engine(d):
    t = tt(d); f = 38 + 6 * np.sin(2 * np.pi * 0.7 * t); ph = np.cumsum(f) / SR
    s = fft_filter((2 * (ph % 1) - 1).astype(np.float32), 30, 500) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t))
    return (s * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3) * 0.6).astype(np.float32)
def crash():
    return (rattle(0.6) + np.pad(thud(50, 0.6), (0, 0))[: int(0.6 * SR)] * 1.0 + fft_filter(noise(0.6), 2000, 8000) * np.exp(-tt(0.6) * 6) * 0.3).astype(np.float32)
def sparkle():
    out = np.zeros(int(0.8 * SR), np.float32)
    for k in range(6): place_local(out, glock(midi(nm('E6') + [0, 3, 7, 12, 7, 15][k]), 0.5), k * 0.05, 0.5)
    return out

# shot cuts -> short whooshes (skip the "Nö" cut, it lives in silence)
CUTS = [42, 97, 121, 194, 256, 342, 366, 431, 604, 698, 864, 944, 1036, 1137, 1200, 1250, 1302, 1357, 1437, 1518]
for c in CUTS: place(sfx, whoosh(0.32), F(c) - 0.16, 0.45)
place(sfx, hum(4.0), 0.0, 0.12); place(sfx, hum(3.7), F(256), 0.12); place(sfx, hum(2.5), F(1518), 0.12)
place(sfx, whoosh(0.9, 200, 1800), 0.0, 1.0)           # leap off the wall
place(sfx, thud(65, 0.45), F(44), 1.3)                 # landing
place(sfx, ding(), F(106), 0.5)                        # wink
for k in range(5): place(sfx, jingle(0.3), F(196) + k * 0.36, 0.5)   # guard's keys
place(sfx, yawn(0.75), F(197), 0.35)                   # yawn
place(sfx, creak(0.7, 120), F(214), 0.7)               # door stays ajar
for k in range(10): place(sfx, step('run'), F(256) + k * 0.2, 0.55)   # running across the yard
place(sfx, bark(), 10.18, 0.5); place(sfx, bark(), 10.95, 0.3)       # distant dog
for k in range(4): place(sfx, whoosh(0.18, 600, 3000), F(312) + k * 0.24, 0.35)  # climbing scrabble
place(sfx, sparkle(), F(344), 0.35)                    # "Frei."
place(sfx, siren(1.25), F(366), 0.35)                  # short siren
place(sfx, screech(0.5), F(384), 0.5)                  # tyres
place(sfx, click(2), F(412), 0.8)                      # handcuffs
place(sfx, fly(1.8), F(432), 0.22)                     # quiet courtroom: a fly
place(sfx, pop(), F(572), 0.8)                         # joy pop on "0 TAGE"
for k in range(3): place(sfx, boing(), F(574) + k * 0.6, 0.35)
place(sfx, creak(0.45, 180), F(618), 0.45); place(sfx, whoosh(0.5, 800, 5000), F(626), 0.4)  # book opens
place(sfx, chime(), F(632), 0.4)
place(sfx, flutter(1.4), F(652), 0.45); place(sfx, flutter(2.2), F(706), 0.45)
for tc in (F(700), F(745), F(760)): place(sfx, chirp(), tc, 0.4); place(sfx, chirp(), tc + 0.11, 0.35)
place(sfx, rasp(F(900) - F(866)), F(866), 0.45)        # hacksaw
place(sfx, clank(1.0), F(912), 0.6)                    # sawn bar drops
place(sfx, whoosh(0.3), F(985), 0.3)                   # cap push
place(sfx, engine(F(1080) - F(1036)), F(1036), 0.6)    # getaway car
place(sfx, screech(0.55), F(1072), 0.5)
place(sfx, siren(0.9), F(1080), 0.3)
place(sfx, whoosh(0.35, 400, 4000), F(1092), 0.6)      # whip pan
place(sfx, click(2), F(1098), 0.7)
place(sfx, rattle(F(1200) - F(1145)), F(1145), 0.5)    # forcing the gate
place(sfx, crash(), F(1205), 0.8)
place(sfx, slam(), F(1348), 1.1)                       # cell door slams
for k in range(int((F(1517) - F(1362)) / 0.43)): place(sfx, step('tip'), F(1362) + k * 0.43, 0.5)  # tiptoe

# ---------------- mix ----------------
voice = load_voice()
win = int(0.03 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, 'same'))
active = env > env.max() * 0.06
vrms = np.sqrt(np.mean(voice[active] ** 2))
# smooth gate: attack 40 ms, release 300 ms
g = active.astype(np.float32); out = np.empty_like(g); a = 0.0; ka, kr = 1 / (0.04 * SR), 1 / (0.3 * SR)
for i in range(len(g)):
    k = ka if g[i] > a else kr; a += (g[i] - a) * k; out[i] = a
duck = out
# section leveler: the bed follows a target ~19 dB under the voice (1.5 s RMS window), +6 dB in pauses
wl = int(1.5 * SR); kern = np.ones(wl // 48) / (wl // 48)
menv = np.sqrt(np.convolve((music[::48] ** 2), kern, 'same')); menv = np.repeat(menv, 48)[:N] + 1e-6
target = vrms * 10 ** (-19 / 20)
lev = np.clip(target / menv, 0.0, 6.0); lev[menv < 1e-4] = 0
lev = np.convolve(lev[::48], np.ones(20) / 20, 'same'); lev = np.repeat(lev, 48)[:N]
music_bed = music * lev * (1.0 + 1.0 * (1 - duck))
hrms = np.sqrt(np.mean(hits[hits != 0] ** 2)) + 1e-9
music_bed += hits * (vrms * 10 ** (-14 / 20)) / hrms * (1.0 - 0.4 * duck)
srms = np.sqrt(np.mean(sfx[sfx != 0] ** 2)) + 1e-9
sfx_g = (vrms * 10 ** (-12 / 20)) / srms
sfx_bed = sfx * sfx_g * (1.0 - 0.5 * duck)                 # SFX -6 dB under speech
mix = voice + music_bed + sfx_bed
peak = np.abs(mix).max(); mix = mix / max(1.0, peak / 0.95)
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
# light stereo: music a touch wider than the centred voice
L = mix + 0.08 * (music_bed - np.roll(music_bed, int(0.012 * SR)))
R = mix - 0.08 * (music_bed - np.roll(music_bed, int(0.012 * SR)))
st = np.stack([L, R], 1); st /= max(1.0, np.abs(st).max() / 0.97)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"ok {len(pcm) / SR:.2f}s  voice {db(voice[active]):.1f} dBFS | music under speech {db(music_bed[active]):.1f} | sfx under speech {db(sfx_bed[active]):.1f}")
np.savez_compressed("work/stems.npz", voice=voice[::48], music=music_bed[::48], sfx=sfx_bed[::48])
