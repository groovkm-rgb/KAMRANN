"""Emu War: synthesized comic military-march parody + cartoon SFX, mixed UNDER the user's voice.mp3.
Music sits ~21 dB below the voice while it speaks (ducked), SFX ~12 dB below. No generated voice.
Output: mix_raw.wav (48 kHz mono). finish.sh then normalises to -14 LUFS."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1262
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(1932)
F = lambda f: f / 30.0
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / fc) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / fc) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def place(buf, sig, t0, g=1.0):
    i = int(round(t0 * SR));
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i].astype(np.float32) * g
def adsr(n, a=0.01, d=0.08, s=0.7, r=0.08):
    t = np.arange(n) / SR; T = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    e *= np.clip((T - t) / max(r, 1e-4), 0, 1); return e.astype(np.float32)

# ------------------------------------------------------------------ instruments
def additive(freq, d, bright, n=10, vib=0.0, vibf=5.5, detune=0.0):
    """freq: scalar or array (glides). bright: scalar or array -> harmonic rolloff (higher = brighter)."""
    t = tt(d); m = len(t)
    fr = np.full(m, freq, np.float64) if np.isscalar(freq) else np.asarray(freq, np.float64)[:m]
    fr = fr * (1 + vib * np.sin(2 * np.pi * vibf * t)) * 2 ** (detune / 1200)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    b = np.full(m, bright) if np.isscalar(bright) else np.asarray(bright)[:m]
    s = np.zeros(m)
    for k in range(1, n + 1):
        if np.max(fr) * k > SR / 2.2: break
        s += np.exp(-(k - 1) / np.maximum(b, 0.05)) * np.sin(k * ph) / k ** 0.3
    return s.astype(np.float32)
def tuba(m, d, vel=1.0):
    s = additive(midi(m), d, 1.6, 8) * adsr(int(d * SR), 0.025, 0.1, 0.6, 0.06); return lp(s, 900) * vel
def brass(ms, d, vel=1.0, bright=2.6):
    n = int(d * SR); s = np.zeros(n, np.float32)
    for m in ms: s += additive(midi(m), d, np.linspace(bright * 1.4, bright, n), 12, vib=0.003, detune=rng.uniform(-6, 6))
    return lp(s * adsr(n, 0.03, 0.1, 0.75, 0.07), 3200) / len(ms) * vel
def piccolo(m, d, vel=1.0):
    n = int(d * SR); s = additive(midi(m), d, 0.35, 3, vib=0.006, vibf=6.0) + 0.04 * bp(noise(d), 3000, 9000)
    return s * adsr(n, 0.015, 0.05, 0.8, 0.04) * vel
def pizz(m, d=0.22, vel=1.0):
    t = tt(d); s = additive(midi(m), d, 1.2, 6) * np.exp(-t * 18) * np.minimum(1, t / 0.002); return s * vel
def kazoo(m, d, vel=1.0):
    n = int(d * SR); t = tt(d); s = additive(midi(m), d, 6.0, 24, vib=0.012, vibf=6.5)
    s = bp(s + 0.15 * noise(d) * s, 400, 4200); return s * adsr(n, 0.03, 0.05, 0.85, 0.05) * vel
def toytrumpet(m, d, vel=1.0):
    n = int(d * SR); s = additive(midi(m), d, np.linspace(5, 3, n), 16, vib=0.008, vibf=7); return bp(s, 500, 5000) * adsr(n, 0.01, 0.06, 0.7, 0.05) * vel
def snare(vel=1.0, d=0.16):
    t = tt(d); s = hp(noise(d), 1500) * np.exp(-t * 26) * 0.8 + np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30) * 0.5; return s * vel
def kick(vel=1.0):
    t = tt(0.32); f = 48 + 70 * np.exp(-t * 28); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32) * vel
def cymbal(vel=1.0, d=1.4):
    t = tt(d); return hp(noise(d), 4500) * np.exp(-t * 3.2) * vel
def roll(d, v0=0.3, v1=1.0, rate=22):
    out = np.zeros(int((d + 0.2) * SR), np.float32)
    for k in range(int(d * rate)): place_local(out, snare(v0 + (v1 - v0) * k / (d * rate), 0.1), k / rate)
    return out
def place_local(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * g
def wahwah(t0, buf, g=1.0):
    """sad muted trombone: Bb3 A3 Ab3 G3(long, wobbling)"""
    notes = [(58, 0.18), (57, 0.18), (56, 0.18), (55, 0.55)]; tcur = t0
    for i, (m, d) in enumerate(notes):
        n = int(d * SR); t = tt(d)
        wob = 2.5 + 2.2 * np.sin(2 * np.pi * (2.2 if i < 3 else 6) * t + np.pi) if True else 3
        fr = midi(m) * (1 - (0.03 * t / d if i == 3 else 0))
        s = additive(fr * np.ones(n), d, wob, 14, vib=0.01 if i == 3 else 0.0, vibf=5.5) * adsr(n, 0.02, 0.05, 0.85, 0.05)
        place(buf, lp(s, 2200) * 0.9, tcur, g); tcur += d

music = np.zeros(N, np.float32)
# progression (Bb major): I I V I | IV I V I    roots / chords
PROG = [(46, [58, 62, 65]), (46, [58, 62, 65]), (41, [57, 60, 65]), (46, [58, 62, 65]), (51, [58, 63, 67]), (46, [58, 62, 65]), (41, [57, 60, 63, 65]), (46, [58, 62, 65])]
TUNE = [7, 7, 9, 7, 4, None, 0, None, 2, 2, 4, 2, -1, None, -5, None, 5, 5, 7, 5, 2, None, -1, None, 0, 4, 7, 12, 0, None, None, None]  # eighths, degrees in semitones from Bb4
def march(t0, t1, bpm=116, inten=1.0, inten1=None, transpose=0, detune=0.0, piccolo_on=True, brass_on=True, snare_on=True, start_bar=0):
    beat = 60 / bpm; t = t0; bar = start_bar
    inten1 = inten if inten1 is None else inten1
    while t < t1 - 0.05:
        k = (t - t0) / max(1e-3, t1 - t0); I = inten + (inten1 - inten) * k
        root, ch = PROG[bar % 8]
        for b in range(2):  # 2/4 march: beats 1,2 with oom-pah eighths
            tb = t + b * beat
            if tb >= t1: break
            place(music, tuba(root + transpose - (7 if b else 0) + (0 if b == 0 else 7), beat * 0.45, 1.0), tb, 0.55 * I)
            if brass_on: place(music, brass([m + transpose for m in ch], beat * 0.3, 1.0), tb + beat / 2, 0.22 * I)
            if snare_on:
                place(music, kick(0.8), tb, 0.35 * I * (1 if b == 0 else 0.6))
                place(music, snare(0.7), tb + beat / 2, 0.2 * I)
                if bar % 4 == 3 and b == 1: place(music, snare(0.5), tb + beat * 0.75, 0.16 * I)
        if piccolo_on and I > 0.55:
            for e in range(4):
                deg = TUNE[(bar % 8) * 4 + e]
                te = t + e * beat / 2
                if deg is not None and te < t1: place(music, piccolo(70 + deg + transpose, beat * 0.42), te, 0.13 * I)
        t += 2 * beat; bar += 1
    return bar

# 0.00-1.98  heroic, proud march intro (snare roll pickup + fanfare)
place(music, roll(0.32, 0.25, 0.9), 0.0, 0.3)
place(music, brass([58, 62, 65, 70], 0.55, 1.0, 3.2), 0.0, 0.32); place(music, cymbal(0.8), 0.33, 0.12)
march(0.35, 1.96, bpm=116, inten=1.0)
# "fıt": the march stops on one baffled squeaky note
fit_t = tt(0.22); fit = additive(midi(82) * (1 + 0.5 * np.minimum(1, fit_t / 0.12)), 0.22, 0.8, 4) * adsr(len(fit_t), 0.005, 0.05, 0.6, 0.06)
place(music, fit, 1.99, 0.32)
# 2.2-4.1 sneaky, playful pizzicato (G minor tiptoe)
pz = [43, 50, 46, 50, 43, 50, 45, 49, 43, 50, 46, 50, 51, 50, 49, 48]
for i, m in enumerate(pz):
    tt0 = 2.25 + i * 0.118
    if tt0 > 4.05: break
    place(music, pizz(m + 12, 0.2), tt0, 0.5 if i % 2 == 0 else 0.35)
place(music, pizz(67, 0.3), 3.32, 0.35); place(music, pizz(74, 0.3), 3.45, 0.3)  # cheeky grin
# 4.1-12.3 march again, more and more determined
b = march(4.1, 9.67, bpm=116, inten=0.6, inten1=0.9)
place(music, cymbal(0.7), 9.67, 0.1)
march(9.67, 12.3, bpm=120, inten=0.95, inten1=1.05, start_bar=b)
# 12.3-13.3 tension roll for the first attempt, 13.3-16.1 comic scatter (march, frantic piccolo)
place(music, roll(1.0, 0.15, 0.7), 12.3, 0.28)
march(13.3, 16.05, bpm=132, inten=0.75, transpose=2)
wahwah(16.1, music, 0.55)
# 16.7-19.95 sneaky ambush: low tuba pulses + pizz, creeping crescendo
for i in range(int((19.95 - 16.75) / 0.25)):
    tq = 16.75 + i * 0.25; k = i / 13
    place(music, tuba(38 if i % 4 < 2 else 37, 0.18), tq, 0.4 + 0.3 * k)
    if i % 2: place(music, pizz(62 + (i % 8) // 2, 0.15), tq + 0.12, 0.25 + 0.2 * k)
place(music, roll(0.5, 0.1, 0.6), 19.45, 0.25)
# 19.97 FEUER: crash, then music drops out
place(music, cymbal(1.0, 1.6), 19.97, 0.22); place(music, brass([46, 53, 58], 0.35, 1.0, 3.5), 19.97, 0.35); place(music, kick(1), 19.97, 0.5)
wahwah(21.92, music, 0.5)   # jam: failed attempt 2
# 22.45-28.55 truck chase: fast gallop, bouncing bass
beat = 60 / 152; tq = 22.45; i = 0
while tq < 28.5:
    root = [46, 46, 41, 46, 51, 46, 41, 46][(i // 4) % 8]
    place(music, tuba(root + (12 if i % 2 else 0), beat * 0.4), tq, 0.5)
    place(music, snare(0.6), tq + beat / 2, 0.16); place(music, kick(0.7), tq, 0.22 if i % 2 == 0 else 0.1)
    if i % 2 == 1: place(music, brass([root + 12, root + 16, root + 19], beat * 0.3), tq + beat / 2, 0.16)
    if (i // 2) % 4 == 3: place(music, piccolo(82 + (i % 4) * 2, beat * 0.45), tq, 0.1); place(music, piccolo(84 + (i % 4) * 2, beat * 0.45), tq + beat / 2, 0.1)
    tq += beat; i += 1
wahwah(28.6, music, 0.6)    # failed attempt 3
# 29.3-30.15 slow, sad-comic march (Bb minor, dragging)
for k, (m, d) in enumerate([(46, 0.42), (44, 0.42)]):
    place(music, tuba(m, d * 0.9), 29.3 + k * 0.42, 0.5); place(music, brass([m + 12, m + 15, m + 19], d * 0.85, 0.8, 1.6), 29.3 + k * 0.42, 0.18)
# 30.2-34.6 march again, but tired (slower, a bit flat)
march(30.2, 34.55, bpm=100, inten=0.62, inten1=0.5, detune=-20, piccolo_on=True)
# 34.6-36.6 commander: low sustained tuba + soft ticking snare
place(music, tuba(34, 1.9, 1.0), 34.62, 0.45)
for i in range(8): place(music, snare(0.3, 0.06), 34.7 + i * 0.25, 0.08)
# 36.6-41.3 the emus' victory fanfare: kazoo + toy trumpet, cheeky and happy
KZ = [(70, .25), (74, .25), (77, .5), (74, .25), (77, .25), (82, .75), (None, .25), (79, .25), (77, .25), (79, .25), (81, .25), (82, .5), (77, .5)]
tq = 36.65
for m, d in KZ:
    if m: place(music, kazoo(m - 12, d * 0.95), tq, 0.42)
    tq += d
for i in range(int((39.05 - 36.65) / 0.25)): place(music, tuba(46 if i % 2 == 0 else 41, 0.2), 36.65 + i * 0.25, 0.35); place(music, snare(0.4), 36.65 + i * 0.25 + 0.125, 0.08)
FAN = [(70, .2), (70, .2), (70, .2), (74, .6), (70, .2), (74, .2), (77, .8)]
tq = 39.12
for m, d in FAN: place(music, toytrumpet(m, d * 0.9), tq, 0.4); place(music, kazoo(m - 12, d * 0.9), tq, 0.2); tq += d
for i in range(int((41.3 - 39.1) / 0.258)): place(music, tuba([46, 41][i % 2], 0.2), 39.1 + i * 0.258, 0.38); place(music, kick(0.6), 39.1 + i * 0.258, 0.12)
# final sting
place(music, brass([58, 62, 65, 70, 74], 0.7, 1.0, 3.6), 41.36, 0.45); place(music, toytrumpet(82, 0.6), 41.36, 0.35); place(music, cymbal(1.0, 0.9), 41.36, 0.25); place(music, kick(1.0), 41.36, 0.6)
music[int(41.95 * SR):] *= np.linspace(1, 0, N - int(41.95 * SR)) ** 2

# ------------------------------------------------------------------ SFX
sfx = np.zeros(N, np.float32)
def thump(f0=90, d=0.25, click=0.4):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.8 * np.exp(-t * 40))) * np.exp(-t * 16) + lp(noise(d), 1500) * np.exp(-t * 40) * click).astype(np.float32)
def step(): t = tt(0.12); return (lp(noise(0.12), 900) * np.exp(-t * 45) + np.sin(2 * np.pi * 80 * t) * np.exp(-t * 35) * 0.6).astype(np.float32)
def whistle(d=0.25, f0=2600):
    t = tt(d); fr = f0 * (1 + 0.02 * np.sin(2 * np.pi * 38 * t)); s = np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.25 * bp(noise(d), 2000, 5000)
    return (s * adsr(len(t), 0.01, 0.02, 0.9, 0.04)).astype(np.float32)
def emuboom(n=2, gap=0.14):
    out = np.zeros(int((n * gap + 0.4) * SR), np.float32)
    for k in range(n):
        t = tt(0.32); f = 62 + 14 * np.exp(-t * 10); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.02) * np.exp(-t * 7) + lp(noise(0.32), 300) * np.exp(-t * 9) * 0.6
        place_local(out, s.astype(np.float32), k * gap)
    return out
def boing(f0=180, d=0.5):
    t = tt(d); fr = f0 * (1 + 0.6 * np.exp(-t * 6) * np.sin(2 * np.pi * 14 * t)); s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5) * np.minimum(1, t / 0.005)
    return (s + 0.3 * np.sin(2 * np.pi * np.cumsum(fr * 2.01) / SR) * np.exp(-t * 8)).astype(np.float32)
def ding(f=1760, d=0.6): t = tt(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 12)).astype(np.float32)
def pop(): t = tt(0.12); fr = 400 + 1400 * np.exp(-t * 60); return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 40)).astype(np.float32)
def whoosh(d=0.45, fc=1400, up=True):
    t = tt(d); s = noise(d); e = np.sin(np.pi * t / d) ** 2; out = np.zeros_like(s)
    for k, c in enumerate(np.linspace(600, fc * 2, 4) if up else np.linspace(fc * 2, 600, 4)):
        seg = slice(int(k * len(s) / 4), int((k + 1) * len(s) / 4)); out[seg] = bp(s, c * 0.5, c * 1.4)[seg]
    return (lp(out, 6000) * e).astype(np.float32)
def vinn(d=0.55, f0=900, f1=300):  # passing "vınnn" doppler
    t = tt(d); fr = f0 + (f1 - f0) * (t / d) ** 1.4; s = additive(fr, d, 2.5, 8) * np.sin(np.pi * t / d) ** 1.5; return (s * 0.7 + whoosh(d, 1200) * 0.6).astype(np.float32)
def munch(d=0.5):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 14)):
        g = bp(noise(0.05), 1500, 6000) * np.exp(-tt(0.05) * 70); place_local(out, g, k / 14 + rng.uniform(0, 0.02), rng.uniform(0.4, 1))
    return out
def hiss(d=2.0):  # "hışşş" erasing sweep
    t = tt(d); s = bp(noise(d), 2500, 9000) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4); return s.astype(np.float32)
def crack():
    d = 0.4; t = tt(d); s = hp(noise(d), 1200) * np.exp(-t * 22) * 1.2 + thump(110, d, 0.3) * 0.5
    for k in range(4): s[int(rng.uniform(0.02, 0.15) * SR):][: int(0.01 * SR)] += 1.5 * rng.standard_normal(int(0.01 * SR))
    return s.astype(np.float32)
def grumble(d=1.2, f0=110):
    t = tt(d); syl = 0.5 + 0.5 * np.sin(2 * np.pi * 4.3 * t + 3 * np.sin(2 * np.pi * 1.1 * t))
    fr = f0 * (1 + 0.15 * np.sin(2 * np.pi * 2.3 * t)); s = additive(fr, d, 4, 20) * syl
    s = bp(s, 250, 1800); return (s * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.1)).astype(np.float32)
def engine(d=1.0, rpm0=8, rpm1=8, cough=0.0):
    t = tt(d); rate = rpm0 + (rpm1 - rpm0) * t / d; ph = np.cumsum(rate) / SR
    pulses = np.exp(-((ph % 1) * 9)) * (1 - cough * (rng.random(len(t)) < 0.0) )
    s = lp(pulses * (0.7 + 0.3 * rng.random(len(t))), 500) * 2.2 + lp(noise(d), 220) * 0.4
    if cough: s *= (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 2.3 * t + 1)))
    return hp(s.astype(np.float32), 35)
def backfire(): d = 0.45; t = tt(d); return (lp(noise(d), 1800) * np.exp(-t * 18) * 1.4 + np.sin(2 * np.pi * 60 * t) * np.exp(-t * 12)).astype(np.float32)
def squeal(d=0.5):
    t = tt(d); fr = 2100 + 260 * np.sin(2 * np.pi * 9 * t); s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.6 + 0.25 * np.sin(2 * np.pi * np.cumsum(fr * 1.5) / SR)
    return (s * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.08) + bp(noise(d), 1500, 5000) * 0.2).astype(np.float32)
def clonk(): d = 0.5; t = tt(d); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(523, 9), (1310, 14), (2170, 20), (3410, 26)]) * 0.5 + thump(140, d, 0.5) * 0.6).astype(np.float32)
def pif(): d = 0.4; t = tt(d); return (bp(noise(d), 500, 3000) * np.minimum(1, t / 0.01) * np.exp(-t * 9)).astype(np.float32)
def tak(): d = 0.12; t = tt(d); return (hp(noise(d), 1500) * np.exp(-t * 60) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 50) * 0.6).astype(np.float32)
def popcorn_burst(d=0.5, rate=14):  # cartoon "ratatata": light, popping, not realistic
    out = np.zeros(int((d + 0.2) * SR), np.float32)
    for k in range(int(d * rate)):
        t = tt(0.07); fr = 900 + 1600 * np.exp(-t * 80) + rng.uniform(-150, 150); s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 55) + hp(noise(0.07), 2000) * np.exp(-t * 90) * 0.5
        place_local(out, s.astype(np.float32), k / rate + rng.uniform(0, 0.01), rng.uniform(0.7, 1))
    return out
def puff(): d = 0.25; t = tt(d); return (bp(noise(d), 700, 2500) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def rustle(d=1.0):
    t = tt(d); s = bp(noise(d), 2000, 8000) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 3.2 * t)) ** 3); return (s * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2)).astype(np.float32)
def water(d): t = tt(d); return (lp(noise(d), 700) * 0.35 + bp(noise(d), 1500, 4000) * 0.08 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * t))).astype(np.float32)
def chatter(d=1.0):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 18)): place_local(out, tak() * 0.6, k / 18 + rng.uniform(0, 0.01), rng.uniform(0.5, 1))
    return out
def fiyuu(d=0.7): t = tt(d); fr = 1800 * (1 - 0.6 * t / d); return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.4 * np.sin(np.pi * t / d) + whoosh(d, 2000) * 0.5).astype(np.float32)
def shuffle(d=1.0):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 3.2)): place_local(out, lp(noise(0.3), 1200) * np.sin(np.pi * tt(0.3) / 0.3) * 0.5, k / 3.2)
    return out
def jingle(d=2.0, dens=40):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * dens)):
        f = rng.uniform(2500, 6200); t = tt(0.18); s = np.sin(2 * np.pi * f * t) * np.exp(-t * rng.uniform(25, 45)) + 0.5 * np.sin(2 * np.pi * f * 1.41 * t) * np.exp(-t * 50)
        place_local(out, s.astype(np.float32), rng.uniform(0, d - 0.18), rng.uniform(0.2, 1))
    return out
def tink(): t = tt(0.35); return (np.sin(2 * np.pi * 3900 * t) * np.exp(-t * 18) + 0.6 * np.sin(2 * np.pi * 6100 * t) * np.exp(-t * 26)).astype(np.float32)
def wind(d): t = tt(d); return (bp(noise(d), 300, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t) ** 2) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)).astype(np.float32)
def whirl(d=1.6): t = tt(d); fr = 500 + 300 * np.sin(2 * np.pi * 3 * t); return (additive(fr, d, 1.2, 5) * 0.4 * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2)).astype(np.float32)

# --- shot by shot cues (times = frame/30) ---
# 1 march: whistle + rhythmic boots (each step 0.3 s)
place(sfx, whistle(0.16), 0.02, 0.35); place(sfx, whistle(0.3), 0.24, 0.35)
for k in range(7): place(sfx, step(), 0.12 + k * 0.3, 0.9)
# 2-3 emu peeks in: bum-bum drumming, boing on the head tilt, ding on the wink, pop + boing when the cap flies
place(sfx, whoosh(0.3, 1800), F(60), 0.25)
place(sfx, emuboom(2), F(66), 0.9); place(sfx, boing(170, 0.45), F(79), 0.55); place(sfx, ding(2093, 0.5), F(84), 0.3)
place(sfx, pop(), F(97), 0.6); place(sfx, boing(320, 0.4), F(98), 0.35); place(sfx, whoosh(0.4, 2400), F(99), 0.2); place(sfx, thump(150, 0.2), F(112), 0.35)
# 4 horde: stampede of booms, munching, erasing hiss, fence cracks
place(sfx, whoosh(0.35, 1500), F(121), 0.25)
for k in range(9): place(sfx, emuboom(2, 0.11), F(124) + k * 0.31, 0.45 + 0.05 * k)
place(sfx, lp(noise(3.0), 160) * 1.4 * np.minimum(1, tt(3.0) / 1.0), F(123), 0.6)
place(sfx, munch(2.8), F(126), 0.45); place(sfx, hiss(2.9), F(124), 0.18)
def front_at(f):
    k = 0.5 * 0; x = min(1, max(0, (f - 123) / 87)); sm = x * x * x * (x * (x * 6 - 15) + 10); kk = sm * 0.55 + x * 0.45; return -88 + 80 * kk
for zf in (-58.5, -20):
    f = next(f for f in range(123, 211) if front_at(f) >= zf); place(sfx, crack(), F(f), 0.7); place(sfx, crack(), F(f) + 0.12, 0.4)
# 5 farmers: grumbling + fist on table
place(sfx, grumble(1.5, 105), F(212), 0.32); place(sfx, grumble(1.3, 140), F(220), 0.25); place(sfx, grumble(1.0, 90), F(233), 0.25)
for fr_ in (226, 241, 253): place(sfx, thump(85, 0.3, 0.9), F(fr_), 1.0); place(sfx, jingle(0.2, 30), F(fr_) + 0.01, 0.25)
# 6 truck arrives: putter, brake squeal, settle
place(sfx, whoosh(0.3, 1200), F(258), 0.2)
place(sfx, engine(1.0, 11, 7, cough=1), F(259), 0.55); place(sfx, squeal(0.45), F(270), 0.32); place(sfx, thump(60, 0.3, 0.2), F(281), 0.5)
# 7 unload: crates "tok", hop-down thumps, gun set-up clicks
for fr_ in (298, 310, 322, 334, 344, 354): place(sfx, thump(120, 0.22, 0.8), F(fr_), 0.85); place(sfx, tak(), F(fr_), 0.3)
for fr_ in (302, 310, 322, 340): place(sfx, step(), F(fr_), 0.7)
for fr_ in (336, 356): place(sfx, clonk() * 0.5, F(fr_), 0.25); place(sfx, tak(), F(fr_) + 0.08, 0.4)
# 8 first attempt: cocking click, then scatter: rapid footsteps + passing "vınnn"s
place(sfx, tak(), F(380), 0.6); place(sfx, tak(), F(384), 0.6)
place(sfx, whoosh(0.5, 900), F(398), 0.25)
for k in range(30): place(sfx, step(), F(405) + k * 0.05 + rng.uniform(0, 0.02), 0.35)
for k, (d, f0, f1) in enumerate([(0.5, 1000, 350), (0.45, 1200, 400), (0.55, 900, 300), (0.5, 1300, 420), (0.45, 1100, 360)]): place(sfx, vinn(d, f0, f1), F(406) + k * 0.28, 0.35)
place(sfx, whirl(1.6), F(452), 0.35)
for k in range(4): place(sfx, vinn(0.45, 1200, 380), F(455) + k * 0.33, 0.3)
place(sfx, ding(2637, 0.4), F(460), 0.12); place(sfx, ding(3136, 0.4), F(475), 0.12)
# 9-11 ambush: bush rustle + pond water, booms of the approaching crowd, FEUER popcorn + feather puffs
place(sfx, water(5.2), F(501), 0.35); place(sfx, rustle(1.0), F(504), 0.35); place(sfx, rustle(0.8), F(530), 0.3)
for k in range(6): place(sfx, emuboom(3, 0.12), F(558) + k * 0.24, 0.35 + 0.08 * k)
place(sfx, popcorn_burst(0.55, 15), F(599), 0.7)
for k in range(6): place(sfx, puff(), F(601) + k * 0.08, 0.35)
place(sfx, popcorn_burst(0.5, 14), F(616), 0.6)
for k in range(4): place(sfx, puff(), F(618) + k * 0.1, 0.3)
place(sfx, clonk(), F(652), 0.85); place(sfx, pif(), F(654), 0.6)
for fr_ in (657, 663, 669): place(sfx, tak(), F(fr_), 0.9); place(sfx, thump(200, 0.12, 0.6), F(fr_), 0.4)
for k in range(16): place(sfx, step(), F(632) + k * 0.07, 0.3)
# 12-14 truck chase: cough start + backfire, revving, overtaking emus, ding on wink, boings, teeth, hat "fiyuu"
place(sfx, engine(0.4, 6, 9, cough=1), F(673), 0.6); place(sfx, backfire(), F(680), 0.8); place(sfx, backfire(), F(700), 0.55)
place(sfx, engine(2.0, 9, 19), F(686), 0.6); place(sfx, engine(1.3, 19, 19), F(750), 0.5); place(sfx, engine(2.8, 17, 18, cough=1), F(788), 0.5)
for k in range(5): place(sfx, step(), F(752) + k * 0.06, 0.3)
place(sfx, vinn(0.6, 900, 400), F(752), 0.25); place(sfx, ding(2349, 0.45), F(761), 0.35); place(sfx, boing(260, 0.3), F(762), 0.2)
for fr_ in range(788, 869, 13): place(sfx, boing(150, 0.45), F(fr_), 0.6); place(sfx, thump(70, 0.2, 0.4), F(fr_), 0.5)
place(sfx, chatter(2.5), F(792), 0.3); place(sfx, fiyuu(0.8), F(806), 0.45)
# 15 retreat: tired shuffle, whip-around whoosh, brisk boots again
place(sfx, shuffle(1.15), F(871), 0.7); place(sfx, whoosh(0.35, 2200), F(902), 0.4)
for k in range(4): place(sfx, step(), F(909) + k * 0.16, 0.8)
# 16-17 shell mountain: brass casings jingling, sliding
place(sfx, whoosh(0.3, 1200), F(924), 0.2)
place(sfx, jingle(3.4, 34), F(926), 0.42); place(sfx, jingle(1.6, 18), F(991), 0.22)
for k in range(6): place(sfx, emuboom(2, 0.15), F(993) + k * 0.28, 0.18)
place(sfx, wind(1.6), F(995), 0.25)
# 18-19 commander + thought bubble: pop, tink-tink ricochets
place(sfx, wind(2.1), F(1038), 0.18)
place(sfx, pop(), F(1100), 0.7); place(sfx, boing(400, 0.3), F(1101), 0.25)
for i in range(4):
    for nn in range(0, 4):
        t_hit = (0.6 - i * 0.27 + nn) / 1.6
        if 0.05 < t_hit < 2.35: place(sfx, tink(), F(1099) + t_hit, 0.32)
# 20-21 sunset victory: wind, crowd "bum-bum" cheering
place(sfx, wind(3.0), F(1172), 0.22); place(sfx, whoosh(0.3, 1000), F(1170), 0.2)
for k in range(14): place(sfx, emuboom(2, 0.12), F(1176) + k * 0.2 + rng.uniform(0, 0.05), 0.2 + 0.03 * k)
place(sfx, ding(1760, 0.6), F(1241), 0.2)
# quiet whooshes on the remaining cuts
for fr_ in (209, 289, 368, 449, 500, 554, 615, 672, 749, 787, 869, 990, 1037, 1098, 1208):
    place(sfx, whoosh(0.28, 1500), F(fr_) - 0.06, 0.12)

# ------------------------------------------------------------------ mix
voice = load_voice()
k = int(0.03 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(k) / k, "same"))
speech = env > (np.max(env) * 10 ** (-32 / 20))
# smooth the speech gate (attack 40 ms, release 250 ms)
g = speech.astype(np.float32); sm = np.zeros_like(g); a_att, a_rel = 1 - np.exp(-1 / (0.04 * SR)), 1 - np.exp(-1 / (0.25 * SR)); acc = 0.0
step_ = 64
for i in range(0, N, step_):
    tgt = g[i:i + step_].max(); acc += (a_att if tgt > acc else a_rel) * step_ * (tgt - acc); acc = min(1, max(0, acc)); sm[i:i + step_] = acc
rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
v_rms = rms(voice[speech])
duck_m = 1 - sm * (1 - 10 ** (-6 / 20)); duck_s = 1 - sm * (1 - 10 ** (-4 / 20))
mus = music * duck_m; fx = sfx * duck_s
m_on = speech & (np.abs(music) > 0) ; s_on = np.convolve(np.abs(sfx), np.ones(k) / k, "same") > 1e-4
mus *= (v_rms * 10 ** (-21 / 20)) / rms(mus[speech])
fx *= (v_rms * 10 ** (-12 / 20)) / rms(fx[s_on])
# dynamic guard: while the voice speaks, SFX never come within 9 dB (music within 16 dB) of the voice's short-term level
def senv(x, w=0.05): kk = int(w * SR); return np.sqrt(np.convolve(x ** 2, np.ones(kk) / kk, "same") + 1e-12)
venv = senv(voice, 0.12)
for buf, margin in ((fx, 9), (mus, 16)):
    lim = np.where(sm > 0.05, np.minimum(1, venv * 10 ** (-margin / 20) / senv(buf)), 1.0)
    kk = int(0.04 * SR); lim = np.convolve(np.minimum.accumulate(lim[::-1])[::-1] * 0 + lim, np.ones(kk) / kk, "same")
    buf *= np.clip(lim, 0, 1).astype(np.float32)
print(f"music under speech: {20*np.log10(rms(mus[speech])/v_rms):.1f} dB re voice; sfx (active): {20*np.log10(rms(fx[s_on])/v_rms):.1f} dB")
mix = voice + mus + fx
peak = np.max(np.abs(mix)); mix = mix / max(1.0, peak / 0.97)
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
for name, buf in (("stem_music.wav", mus), ("stem_sfx.wav", fx)):
    with wave.open("work/" + name, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", len(pcm) / SR, "s")
