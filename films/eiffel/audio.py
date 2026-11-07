"""Music bed (1920s Paris caper) + SFX for "Der Mann, der den Eiffelturm verkaufte", mixed UNDER the user's voice.mp3.
No voice is generated: the voice track is the user's mp3, untouched apart from the final loudness normalisation in finish.sh."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_FRAMES = 1550
DUR = TOTAL_FRAMES / 30            # mp3 (51.17 s) + 0.5 s tail
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30                # frame -> seconds
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)

def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if 0 <= i < len(buf) and j > i: buf[i:j] += sig[: j - i] * gain

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def adsr(n, a=0.01, r=0.08):
    t = np.arange(n) / SR; d = n / SR
    return (np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)).astype(np.float32)

# ---------------- instruments ----------------
def accordion(notes, d, bright=1.0):
    t = tt(d); s = np.zeros_like(t)
    for m in notes:
        f0 = midi(m)
        for det in (-0.0025, 0.0, 0.0028):           # musette: three reeds slightly detuned
            ph = 2 * np.pi * f0 * (1 + det) * t
            s += sum(np.sin(k * ph) * (1 / k) ** (1.15 if k % 2 else 1.5) for k in range(1, 9))
    s *= (1 + 0.12 * np.sin(2 * np.pi * 5.6 * t))
    s = filt(s.astype(np.float32), 120, 2600 * bright) / (3 * max(1, len(notes)))
    return s * adsr(len(s), 0.035, 0.07)
def pizz(m, d=0.45):
    t = tt(d); f0 = midi(m)
    s = sum(np.sin(2 * np.pi * f0 * k * t) * np.exp(-t * (7 + 5 * k)) / k for k in range(1, 6))
    return (s * np.minimum(1, t / 0.004)).astype(np.float32)
def clarinet(m, d, vib=1.0):
    t = tt(d); f0 = midi(m); ph = 2 * np.pi * f0 * t + vib * 0.02 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.3) * 6
    s = np.sin(ph) + 0.45 * np.sin(3 * ph) + 0.22 * np.sin(5 * ph) + 0.1 * np.sin(7 * ph)
    return filt(s.astype(np.float32), 150, 3200) * adsr(len(t), 0.05, 0.08) * 0.5
def brush(kind):
    if kind == "swish":
        d = 0.22; t = tt(d); s = filt(noise(d), 2500, 9000) * np.sin(np.pi * t / d) ** 2 * 0.5
    else:
        d = 0.12; t = tt(d); s = filt(noise(d), 1800, 7000) * np.exp(-t * 40) * 0.7 + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 30) * 0.25
    return s.astype(np.float32)
def kick(d=0.25):
    t = tt(d); f = 55 + 60 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) * 0.6).astype(np.float32)
def trombone_wah(m, d=1.5):
    t = tt(d); f0 = midi(m) * (1 - 0.03 * np.clip((t - 0.9) / 0.6, 0, 1))
    ph = 2 * np.pi * np.cumsum(f0) / SR; s = sum(np.sin(k * ph) / k for k in range(1, 14)).astype(np.float32)
    out = np.zeros_like(s); seg = 1024                            # wah: sweeping low-pass, two "wah" cycles
    for i in range(0, len(s), seg):
        tc = i / SR; cut = 400 + 1500 * (0.5 - 0.5 * np.cos(2 * np.pi * tc / (d / 2)))
        x = s[max(0, i - seg): i + seg]; y = filt(x, 60, cut); out[i:i + seg] = y[(i - max(0, i - seg)):(i - max(0, i - seg)) + len(out[i:i + seg])]
    return out * adsr(len(out), 0.06, 0.3) * 0.5

# ---------------- score ----------------
music = np.zeros(N, np.float32)
CH = {"Dm": [50, 53, 57], "A7": [49, 52, 55, 57], "Gm": [55, 58, 62], "D": [50, 54, 57], "A": [49, 52, 57], "G": [55, 59, 62], "Bb": [53, 58, 62], "E7": [52, 56, 59, 62]}
ROOT = {"Dm": 38, "A7": 33, "Gm": 43, "D": 38, "A": 33, "G": 43, "Bb": 34, "E7": 40}
SNEAK = [62, None, 65, 64, 65, None, 69, 68, 69, None, 67, 65, 64, None, 61, None]          # chromatic, tip-toe line (8ths)
SNEAK2 = [69, 68, 69, 72, 70, 69, 67, 65, 64, 65, 67, 64, 61, 62, None, None]
HAPPY = [66, 69, 74, 69, 71, 69, 66, 62, 64, 66, 69, 71, 74, None, 73, 74]

def section(t0, t1, bpm, prog, mel=None, gain=1.0, drums=True, acc=True, bass=True, walk=False, mel_inst=clarinet, staccato=False):
    beat = 60 / bpm; b = 0
    while True:
        tb = t0 + b * beat
        if tb >= t1 - 0.02: break
        ch = prog[(b // 4) % len(prog)]
        if bass and (b % 2 == 0 or walk):
            m = ROOT[ch] + (0 if b % 4 == 0 else 7 if b % 4 == 2 else [0, 3, 7, 10][b % 4]) if walk else ROOT[ch] + (0 if b % 4 == 0 else 7)
            place(music, pizz(m, min(0.45, t1 - tb)), tb, 0.55 * gain)
        if acc and b % 2 == 1:
            d = min(beat * (0.35 if staccato else 0.55), t1 - tb); place(music, accordion(CH[ch], d), tb, 0.33 * gain)
        if drums:
            place(music, brush("swish" if b % 2 else "tap"), tb, 0.28 * gain)
            if staccato and b % 4 == 0: place(music, kick(), tb, 0.35 * gain)
        if mel:
            for k in range(2):
                n = mel[(b * 2 + k) % len(mel)]; te = tb + k * beat / 2
                if n is not None and te < t1 - 0.05: place(music, mel_inst(n, min(beat * 0.45, t1 - te)), te, 0.3 * gain)
        b += 1
    return t0 + b * beat

PROG = ["Dm", "A7", "Dm", "A7", "Gm", "Dm", "A7", "Dm"]
# A  0 – 19.40  sneaky caper (first bar starts on frame 0: no slow intro)
section(0.0, 19.40, 104, PROG, SNEAK)
# 19.40 – 21.10 music stops dead; "aha!" chord on the gap after "Geniestreich" (20.85)
aha = accordion([50, 54, 57, 62, 66], 1.1, 1.3) * 1.6; place(music, aha, 20.80, 0.55); place(music, clarinet(74, 0.9) * 1.3, 20.80, 0.4); place(music, pizz(38, 0.6), 20.80, 0.8)
# B  21.10 – 30.90 caper continues
section(21.10, 30.90, 104, PROG, SNEAK2)
# C  30.90 – 33.50 train: brighter, faster, major
section(30.90, 33.50, 132, ["D", "A", "D", "G"], HAPPY, gain=1.05, walk=True)
# D  33.50 – 37.40 shame: almost nothing, one sad "wah-wah" trombone note
place(music, accordion([50, 53, 57], 3.6, 0.6) * 0.5, 33.55, 0.25)
place(music, trombone_wah(46, 1.6), 34.42, 0.55)
# E  37.40 – 41.20 déjà vu: the same caper again
section(37.40, 41.20, 104, PROG, SNEAK)
# F  41.20 – 44.45 police + chase: faster, driving
section(41.20, 44.45, 144, ["Dm", "Bb", "A7", "Dm"], SNEAK2, gain=1.1, walk=True, staccato=True)
# G  44.45 – 49.70 prison: thins out to a lonely accordion
for k, (ch, d) in enumerate([("Dm", 1.3), ("Gm", 1.3), ("A7", 1.3), ("Dm", 1.35)]):
    place(music, accordion(CH[ch], d, 0.7), 44.50 + k * 1.31, 0.32)
for k, m in enumerate([69, 67, 65, 64, 62, 61, 62]): place(music, accordion([m + 12], 0.62, 0.8), 44.55 + k * 0.74, 0.16)
# H  49.70 – end: tiny press figure, then the witty sting on the wink, then silence
section(49.70, 50.95, 120, ["Dm", "A7"], None, gain=0.8)
sting = np.zeros(int(0.8 * SR), np.float32)
gl = tt(0.25); sting[: len(gl)] += (np.sin(2 * np.pi * np.cumsum(np.linspace(midi(62), midi(74), len(gl))) / SR) * adsr(len(gl), 0.01, 0.05) * 0.4).astype(np.float32)
place(sting, pizz(50, 0.3), 0.28, 0.9); place(sting, accordion([50, 54, 57, 62], 0.45, 1.2), 0.42, 0.8); place(sting, pizz(38, 0.45), 0.42, 1.0); place(sting, brush("tap"), 0.42, 0.6)
place(music, sting, 50.95, 0.75)
i_end = int(51.50 * SR); music[i_end:] = 0

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def whoosh(d=0.35, lo=300, hi=2200): t = tt(d); return (filt(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def wind(d): t = tt(d); return (filt(noise(d), 80, 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)).astype(np.float32)
def flutter(d=0.6):
    t = tt(d); s = filt(noise(d), 600, 4000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))) * np.exp(-t * 2.5); return s.astype(np.float32) * 0.6
def water(d): t = tt(d); return (filt(noise(d), 100, 900) * 0.5 + filt(noise(d), 1200, 3500) * 0.12 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * t))).astype(np.float32) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)
def creak(d=0.6, f0=140):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.2 * t / d)); pulses = (np.mod(np.cumsum(rate) / SR, 1) < 0.08).astype(np.float32)
    return filt(pulses * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32)), 200, 2600) * np.sin(np.pi * t / d) * 2.0
def ting(f=2400, d=1.0): t = tt(d); return (sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + 2 * k)) / k for k in (1, 1.5, 2.76)) * 0.35).astype(np.float32)
def mixs(*a):
    n = max(len(x) for x in a); o = np.zeros(n, np.float32)
    for x in a: o[:len(x)] += x
    return o
def ding(): return mixs(ting(1568, 1.2), ting(2093, 1.0) * 0.6)
def clink(): return mixs(ting(3300, 0.35) * 0.8, ting(4400, 0.25) * 0.5)
def rustle(d=0.45): t = tt(d); return (filt(noise(d), 1500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / d)).astype(np.float32) * 0.5
def murmur(d, lo=250, hi=1600):
    t = tt(d); s = filt(noise(d), lo, hi) * (0.6 + 0.25 * np.sin(2 * np.pi * 0.7 * t) + 0.15 * np.sin(2 * np.pi * 2.3 * t))
    return (s * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.25)).astype(np.float32) * 0.5
def tok(f0=160, d=0.18): t = tt(d); return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 35) + filt(noise(d), 300, 2500) * np.exp(-t * 60) * 0.6).astype(np.float32)
def scratch(d): t = tt(d); return (filt(noise(d), 2500, 8000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 6 * t))) * 0.35).astype(np.float32) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.05)
def sizzle(d): t = tt(d); return (filt(noise(d), 3000, 9000) * (0.2 + 0.15 * rng.random(len(t))) * 0.25).astype(np.float32)
def step(soft=False): d = 0.12; t = tt(d); return (filt(noise(d), 100, 1200 if soft else 3000) * np.exp(-t * 45) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 40) * 0.4).astype(np.float32) * (0.5 if soft else 0.8)
def steps(t0, t1, every, soft=False, g=1.0):
    x = t0
    while x < t1: place(sfx, step(soft), x, g * (0.8 + 0.4 * rng.random())); x += every
def scrape(d=0.35): t = tt(d); return (filt(noise(d), 150, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t)) * np.sin(np.pi * t / d)).astype(np.float32) * 0.7
def pling(): return ting(2637, 0.9) * 1.2
def tap(): return tok(220, 0.12) * 0.7
def fsht(d=0.25): t = tt(d); return (filt(noise(d), 1200, 6000) * np.sin(np.pi * t / d) * np.exp(-t * 3)).astype(np.float32) * 0.6
def steam(d=1.0): t = tt(d); return (filt(noise(d), 1500, 9000) * np.minimum(1, t / 0.03) * np.exp(-t * 1.6)).astype(np.float32) * 0.7
def whistle_train(d=1.0):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * t) for f in (587, 740, 880)) / 3 + filt(noise(d), 500, 2000) * 0.15
    return (s * adsr(len(t), 0.05, 0.25)).astype(np.float32) * 0.6
def clacks(t0, t1, rate0, rate1, g=1.0):
    x = t0
    while x < t1:
        k = (x - t0) / (t1 - t0); place(sfx, tok(120, 0.08), x, g * (1 - 0.6 * k)); place(sfx, tok(140, 0.08), x + 0.09 / (1 + 3 * k), g * 0.8 * (1 - 0.6 * k))
        x += 1 / (rate0 + (rate1 - rate0) * k)
def metal(f0=300, d=0.6): t = tt(d); return (sum(np.sin(2 * np.pi * f0 * k * t + k) * np.exp(-t * (6 + k)) for k in (1, 2.4, 3.9, 5.3)) * 0.25 + filt(noise(d), 800, 5000) * np.exp(-t * 30) * 0.4).astype(np.float32)
def slam(d=0.4): t = tt(d); return (filt(noise(d), 200, 4000) * np.exp(-t * 25) * 1.2 + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 18)).astype(np.float32)
def shutter(d=0.35):
    t = tt(d); s = np.zeros_like(t)
    for k in range(9): i = int(k * 0.025 * SR); g_ = tok(400 + k * 40, 0.05); s[i:i + len(g_)] += g_[: len(s) - i]
    sl = np.zeros_like(s); place(sl, slam(0.35), 0.22); return (s + sl).astype(np.float32) * 0.8
def police_whistle(d=0.7): t = tt(d); f = 2800 + 180 * np.sign(np.sin(2 * np.pi * 28 * t)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.02, 0.1) * 0.35).astype(np.float32)
def bang(): d = 0.45; t = tt(d); return (np.sin(2 * np.pi * 85 * t) * np.exp(-t * 14) * 1.2 + filt(noise(d), 200, 3000) * np.exp(-t * 40)).astype(np.float32)
def tiles(d): t = tt(d); s = np.zeros_like(t)
def tile_run(t0, t1):
    x = t0
    while x < t1: place(sfx, tok(900 + 300 * rng.random(), 0.06) * 0.6, x, 0.6); x += 0.09 + 0.05 * rng.random()
def foghorn(d=1.6): t = tt(d); s = sum(np.sin(2 * np.pi * 98 * k * t) / k for k in range(1, 7)); return (filt(s.astype(np.float32), 40, 700) * adsr(len(t), 0.25, 0.5) * 0.5).astype(np.float32)
def waves(d): t = tt(d); return (filt(noise(d), 80, 1400) * (0.35 + 0.65 * np.sin(np.pi * t / 1.7) ** 2) * 0.6).astype(np.float32)
def keys(d=0.6):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(9): place(out, ting(3500 + rng.random() * 2500, 0.15) * 0.6, rng.random() * (d - 0.15))
    return out
def echo(x, delay=0.11, fb=0.45, n=5):
    x = np.pad(x, (0, int(delay * n * SR))); y = x.copy()
    for k in range(1, n): i = int(delay * k * SR); y[i:] += x[: len(x) - i] * fb ** k
    return y
def press_chak(): return mixs(tok(110, 0.15) * 1.2, metal(500, 0.25) * 0.7)
def rub(d): t = tt(d); return (filt(noise(d), 1500, 6000) * np.abs(np.sin(2 * np.pi * 4 * t)) * 0.3).astype(np.float32)

# M1 Eiffel tower / M2 close-up
place(sfx, wind(2.3), 0.0, 0.55); place(sfx, water(2.3), 0.0, 0.25)
place(sfx, flutter(0.7), 0.25, 0.5); place(sfx, flutter(0.6), 0.9, 0.35)
place(sfx, whoosh(0.3), 1.42, 0.45)
place(sfx, creak(0.55, 120), 1.55, 0.7); place(sfx, flutter(0.7), 1.72, 0.6)
place(sfx, ting(2700, 1.0), F(60), 0.75)                   # the falling bolt "ting"
# M2 café
place(sfx, murmur(4.7, 300, 1800), 2.2, 0.35); place(sfx, rustle(0.5), 2.24, 0.9); place(sfx, clink(), 2.75, 0.6)
place(sfx, rustle(0.4), 3.16, 0.6); place(sfx, clink(), 4.6, 0.35)
place(sfx, rustle(0.45), F(173), 0.9); place(sfx, ding(), F(178), 0.75)
# M3 forgery desk
place(sfx, whoosh(0.3), F(204), 0.4); place(sfx, sizzle(1.75), F(206), 0.6)
place(sfx, tok(150, 0.2), F(213), 1.1); place(sfx, rustle(0.3), F(222), 0.5); place(sfx, scratch(0.8), F(230), 0.8)
# M4 lobby + salon
place(sfx, murmur(1.5, 250, 1400), F(258), 0.45); place(sfx, creak(1.2, 200) * 0.4, F(258), 0.5); place(sfx, whoosh(0.6, 200, 1200), F(258), 0.4)
steps(F(262), F(298), 0.29, g=0.6); place(sfx, clink(), F(300), 0.6)
for i in range(5): place(sfx, scrape(0.3), F(300 + i * 9), 0.55)
place(sfx, murmur(2.1, 250, 1400), F(300), 0.3)
# M5 whisper
place(sfx, mixs(scrape(0.9) * 0.5, rustle(0.9) * 0.6), F(364), 0.7)        # curtains drawn
place(sfx, whoosh(0.8, 80, 500), F(396), 0.9)                          # low whisper whoosh
place(sfx, whoosh(0.25, 400, 3000), F(457), 0.5)                       # punch-in
place(sfx, ting(3000, 0.6), F(493), 0.4)
# M6 corridor / door
place(sfx, whoosh(0.3), F(522), 0.4); steps(F(524), F(540), 0.3, soft=True, g=0.6)
place(sfx, creak(0.9, 90), F(528), 0.75)
t_ = tt(1.6); place(sfx, (np.sin(2 * np.pi * 1320 * t_) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t_)) * adsr(len(t_), 0.3, 0.3) * 0.12).astype(np.float32), F(534), 1.0)  # tension string
# study: genius / thinking / bulb
place(sfx, rub(1.0), F(588), 0.5)
place(sfx, pling(), F(780), 0.8)
# M7 money
for i in range(6): place(sfx, tap(), F(814 + i * 4), 0.9)
place(sfx, rustle(0.35), F(846), 0.7); place(sfx, fsht(0.25), F(858), 0.9); place(sfx, ting(3600, 0.7), F(880), 0.55)
# M8 train
place(sfx, whoosh(0.35), F(925), 0.4); place(sfx, steam(1.2), F(930), 0.7); place(sfx, whistle_train(1.0), F(945), 0.55)
clacks(F(938), F(1004), 1.5, 9, 0.7); place(sfx, steam(0.8), F(965), 0.45)
# M9 scrapyard office
place(sfx, whoosh(0.3), F(1003), 0.4); place(sfx, metal(260, 0.7), F(1008), 0.45); place(sfx, metal(410, 0.5), F(1026), 0.35)
steps(F(1084), F(1102), 0.27, g=0.45)
place(sfx, shutter(), F(1099), 1.0)
# M10 return
place(sfx, whoosh(0.3), F(1120), 0.4)
t_ = tt(0.9); place(sfx, (np.sin(2 * np.pi * np.cumsum(3200 - 900 * t_ / 0.9) / SR) * adsr(len(t_), 0.05, 0.3) * 0.25 + filt(noise(0.9), 2000, 6000) * 0.15).astype(np.float32), F(1124), 0.8)  # brakes
place(sfx, steam(1.4), F(1136), 0.8); steps(F(1146), F(1175), 0.32, g=0.55)
place(sfx, whoosh(0.8, 80, 500), F(1180), 0.85)                       # same whisper whoosh again
# M11 police + escape
place(sfx, bang(), F(1243), 1.15)
place(sfx, police_whistle(0.7), F(1256), 0.75); place(sfx, police_whistle(0.6), F(1260), 0.6)
steps(F(1268), F(1293), 0.15, g=0.7)
place(sfx, slam(0.4), F(1296), 1.0); place(sfx, creak(0.4, 260), F(1300), 0.5); place(sfx, wind(1.3), F(1294), 0.6)
tile_run(F(1305), F(1333))
# M13 island + cells
place(sfx, waves(1.75), F(1334), 0.8); place(sfx, foghorn(1.4), F(1338), 0.55)
place(sfx, echo(slam(0.4)), F(1387), 0.9); place(sfx, echo(keys(0.6)), F(1398), 0.6)
x_ = F(1390)
while x_ < F(1440): place(sfx, echo(step()), x_, 0.45); x_ += 0.42
place(sfx, wind(1.5) * 0.5, F(1443), 0.35)
# M12 press flashback
place(sfx, whoosh(0.4, 300, 3000), F(1489), 0.6)
for tc in (49.87, 50.39): place(sfx, press_chak(), tc, 0.9); place(sfx, rustle(0.3), tc + 0.1, 0.5)
# final wink
place(sfx, ting(3200, 0.7), F(1531), 0.6)

# ---------------- mix: music ~20-22 dB under the voice, ducked under speech ----------------
voice = load_voice()
ve = np.abs(voice); k = int(0.04 * SR); ve = np.convolve(ve, np.ones(k) / k, "same")
speech = ve > ve.max() * 0.04
# smooth gate (attack 60 ms, release 300 ms)
g = speech.astype(np.float32); out = np.zeros_like(g); a = 1 - np.exp(-1 / (0.06 * SR)); r = 1 - np.exp(-1 / (0.3 * SR)); acc = 0.0
for i in range(0, len(g), 64):
    target = g[i]; acc += (a if target > acc else r) * 64 * (target - acc); acc = min(1, max(0, acc)); out[i:i + 64] = acc
duck = 1 - 0.37 * out                                                    # -4 dB extra under speech
rms = lambda x, m=None: np.sqrt(np.mean((x if m is None else x[m]) ** 2) + 1e-12)
v_rms = rms(voice, speech)
m_act = np.abs(music) > 1e-5
music *= (v_rms * 10 ** (-17.5 / 20)) / rms(music, m_act)                  # -17.5 dB, plus -4 dB ducking => ~ -21.5 dB under speech
s_act = np.abs(sfx) > 1e-5
sfx *= (v_rms * 10 ** (-12 / 20)) / rms(sfx, s_act)
sfx_duck = 1 - 0.3 * out
mix = voice + music * duck + sfx * sfx_duck
peak = np.max(np.abs(mix)); mix = mix / max(1.0, peak / 0.95)
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
print(f"music under voice: {20*np.log10(rms(music*duck, speech)/v_rms):.1f} dB, sfx under voice: {20*np.log10(rms(sfx*sfx_duck, s_act & speech)/v_rms):.1f} dB")
import os
if os.environ.get("STEMS"): np.save("/tmp/claude-0/music.npy", music * duck); np.save("/tmp/claude-0/sfx.npy", sfx * sfx_duck); np.save("/tmp/claude-0/voice.npy", voice)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR)
