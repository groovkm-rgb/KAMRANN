#!/usr/bin/env python3
"""Music bed + SFX for "Tauben" (numpy only, seeded) -> work/mix_raw.wav (48 kHz stereo).

Cue times follow web/story.js (30 fps):
  S1 0.000  S2a 1.167  S2b 1.933  S2c 2.333  S3 2.867  (lamp f164 5.467, night 5.50-5.73)
  S4 6.033  S5 7.200   end 9.533
Run from the project root after tools/timing.py.
"""
import json, wave
import numpy as np

SR = 48000
PH = json.load(open("work/phrases.json"))
FPS = PH["fps"]; T = PH["total_frames"] / FPS
N = int(round(T * SR))
rng = np.random.default_rng(2024)
fr = lambda f: f / FPS

S1, S2a, S2b, S2c, S3, S4, S5 = 0, fr(35), fr(58), fr(70), fr(86), fr(181), fr(216)
LAMP = fr(164)


def buf(): return np.zeros(N)
def put(dst, x, t, g=1.0):
    i = int(round(t * SR));
    if i >= N: return
    x = x[:N - i] if i >= 0 else x[-i:]; i = max(i, 0)
    dst[i:i + len(x)] += g * x
def tvec(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a, r, sus=1.0):
    e = np.ones(n) * sus; na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, sus, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    # soft edges
    m = np.convolve(m, np.hanning(41) / np.hanning(41).sum(), "same")
    return np.fft.irfft(X * m, len(x))
def noise(d): return rng.standard_normal(int(d * SR))
def midi(n): return 440 * 2 ** ((n - 69) / 12)

# ---------------- instruments ----------------
def piano(n, d, vel=1.0):
    t = tvec(d + 0.6); f0 = midi(n); y = np.zeros_like(t)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > 9000: break
        y += np.sin(2 * np.pi * fk * t) * np.exp(-t * (1.2 + 0.9 * k)) / k ** 1.1
    y *= env_adsr(len(t), 0.004, 0.08) * vel
    return y
def accordion(n, d, vel=1.0, att=0.04, rel=0.09, bright=7):
    t = tvec(d); f0 = midi(n); y = np.zeros_like(t)
    for det in (-0.0018, 0.0018):                      # two reeds beating ~ musette
        for k in range(1, bright + 1):
            y += np.sin(2 * np.pi * f0 * (1 + det) * k * t + k) / k ** 1.3
    y *= (1 + 0.06 * np.sin(2 * np.pi * 5.2 * t)) * env_adsr(len(t), att, rel) * vel
    return y * 0.5

C_, Am, F_, G_ = [60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]
Dm, Fm = [57, 62, 65], [56, 60, 65]

def waltz(dst, t0, t1, chords, melody, beat=60 / 96):
    """oom-pah-pah: piano bass on 1, accordion chord on 2 and 3; melody on accordion"""
    bar = 3 * beat; b = 0
    while t0 + b * bar < t1 - 0.05:
        ch = chords[b % len(chords)]; tb = t0 + b * bar
        put(dst, piano(ch[0] - 12, beat * 0.9, 0.9), tb)
        for k in (1, 2):
            if tb + k * beat < t1:
                for nn in ch: put(dst, accordion(nn, beat * 0.55, 0.22), tb + k * beat)
        b += 1
    for (tm, nn, dd) in melody:
        if t0 + tm < t1: put(dst, accordion(nn + 12, min(dd, t1 - t0 - tm), 0.5, bright=6), t0 + tm)

music = buf()
beat = 60 / 96
# A: C–Am–F–G waltz until the S3 cut
waltz(music, 0.0, S3, [C_, Am, F_, G_],
      [(0, 64, beat), (beat, 67, beat), (2 * beat, 64, beat), (3 * beat, 60, 2 * beat), (5 * beat, 57, beat)])
fadeA = np.ones(N); i0 = int((S3 - 0.12) * SR); fadeA[i0:int(S3 * SR)] = np.linspace(1, 0, int(S3 * SR) - i0); fadeA[int(S3 * SR):] = 0
music *= fadeA
# B: S3 thin minor pad (Am -> Dm -> Fm), dies with the lamp
pad = buf()
for (t, d, ch) in [(S3, 1.6, Am), (S3 + 1.55, 1.2, Dm), (S3 + 2.7, 0.9, Fm)]:
    for nn in ch: put(pad, accordion(nn, d, 0.3, att=0.35, rel=0.5, bright=3), t)
for nn in [45]: put(pad, accordion(nn, 3.2, 0.22, att=0.5, rel=0.8, bright=3), S3)
night = np.ones(N); a, b = int(LAMP * SR), int((LAMP + 0.4) * SR); night[a:b] = np.linspace(1, 0.25, b - a); night[b:] = 0.25
pad *= night
# C: S4 tension, G with rising tremolo
ten = buf(); d4 = S5 - S4
for nn in G_ + [43]:
    x = accordion(nn, d4, 0.1, att=0.3, rel=0.02, bright=4)
    tt = tvec(d4); x *= (0.3 + 0.7 * (tt / d4) ** 2) * (1 + 0.5 * np.sin(2 * np.pi * (6 + 6 * tt / d4) * tt))
    put(ten, x, S4)
# D: S5 hit — C major chord + rising arpeggio, then bright waltz to the hard end
hit = buf()
for nn in [48, 60, 64, 67, 72]: put(hit, piano(nn, 1.2, 0.8), S5); put(hit, accordion(nn, 0.9, 0.22), S5)
for i, nn in enumerate([60, 64, 67, 72, 76, 79, 84]): put(hit, piano(nn, 0.25, 0.55), S5 + 0.08 + i * 0.075)
waltz(hit, S5 + 0.66, T, [C_, F_, G_, C_],
      [(0, 72, beat), (beat, 76, beat), (2 * beat, 79, beat), (3 * beat, 76, beat), (4 * beat, 74, beat)], beat)
music = music + pad + ten + hit

# ducking: ~45 % down while the voice speaks
def readwav(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
        if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    return x
voice = readwav("work/voice_timed.wav"); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
hop = 480; rms = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, "same"))
act = (rms > 10 ** (-38 / 20)).astype(float)
k = int(0.25 * SR); act = np.convolve(act, np.ones(k) / k, "same"); act = np.clip(act * 1.6, 0, 1)
music *= 1 - 0.45 * act

# ---------------- SFX ----------------
sfx = buf()
def creak(t, d):
    n = int(d * SR); x = np.zeros(n); tt = 0.0
    while tt < d:                                  # stick-slip impulses, wandering rate
        x[int(tt * SR)] = 1 - 0.4 * rng.random(); tt += 1 / (38 + 30 * np.sin(tt * 7) + 10 * rng.random())
    ker = np.zeros(int(0.03 * SR)); kt = np.arange(len(ker)) / SR
    for f0, g in ((520, 1), (1180, 0.6), (2350, 0.3)): ker += g * np.sin(2 * np.pi * f0 * kt) * np.exp(-kt * 120)
    y = np.convolve(x, ker)[:n] * env_adsr(n, 0.05, 0.12)
    put(sfx, y / np.abs(y).max(), t, 0.22)
def sprinkle(t, d=0.35, g=0.12):
    for _ in range(26):
        b = band(noise(0.006), 2500, 9000) * np.hanning(int(0.006 * SR)); put(sfx, b, t + rng.random() * d, g * (0.5 + rng.random()))
def flap(t, g=0.35, d=0.09):
    x = band(noise(d), 250, 2600) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2
    put(sfx, x / (np.abs(x).max() + 1e-9), t, g)
def coo(t, g=0.18, p=1.0):
    d = 0.42; tt = tvec(d)
    f = p * (290 + 50 * np.sin(np.pi * np.clip(tt / 0.16, 0, 1)) - 40 * (tt > 0.2) + 70 * np.exp(-((tt - 0.28) / 0.05) ** 2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    am = np.exp(-((tt - 0.08) / 0.07) ** 2) + 0.9 * np.exp(-((tt - 0.28) / 0.08) ** 2)   # "gu - ruk"
    put(sfx, y * am * (1 + 0.3 * np.sin(2 * np.pi * 28 * tt)), t, g)
def click(t, f0=2800, g=0.25, d=0.025):
    tt = tvec(d); y = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 260) + 0.4 * band(noise(d), 3000, 9000) * np.exp(-tt * 400)
    put(sfx, y, t, g)

creak(0.10, 0.62)                                   # S1 shutters
for (a, b) in [(S2a, S2b), (S2b, S2c), (S2c, S3)]:  # S2 mini-shots: same action each time
    L = b - a
    sprinkle(a + 0.02, 0.4 * L)
    flap(a + 0.12 * L); flap(a + 0.31 * L)
    coo(a + 0.55 * L, 0.16, 1 + 0.03 * (a > S2a))
r = band(noise(S2c - S2b), 400, 9000) * 0.05      # S2b rain
r *= env_adsr(len(r), 0.02, 0.03); put(sfx, r, S2b)
for _ in range(40): click(S2b + rng.random() * (S2c - S2b), 4000 + 2000 * rng.random(), 0.05, 0.01)
k = 0                                               # S3 tick-tock on the second hand (every 15 frames)
for f in range(90, 180, 15):
    if fr(f) < LAMP + 0.2: click(fr(f), 3100 if k % 2 == 0 else 2300, 0.32); k += 1
click(LAMP, 1500, 0.45, 0.03); click(LAMP + 0.035, 2600, 0.3, 0.02)   # lamp switch
d4 = S5 - S4                                        # S4 growing rustle
x = band(noise(d4), 300, 4000); tt = tvec(d4)
am = np.zeros_like(tt)
for _ in range(60):
    c = rng.random() * d4; w = 0.03 + 0.03 * rng.random(); am += np.exp(-((tt - c) / w) ** 2) * (0.5 + rng.random())
x *= (0.04 + 0.5 * (tt / d4) ** 2.2) * (0.4 + am / am.max()); put(sfx, x * 0.35, S4)
for i in range(8): flap(S4 + 0.5 + i * 0.08 + rng.random() * 0.05, 0.05 + 0.03 * i)
# S5 opening: big wing burst + many coos
burst = band(noise(1.2), 200, 5000); tt = tvec(1.2)
am = np.zeros_like(tt)
for _ in range(140):
    c = rng.random() ** 1.8 * 1.1; am += np.exp(-((tt - c) / 0.025) ** 2)
burst *= am / am.max() * np.exp(-tt * 2.2); put(sfx, burst, S5, 0.55)
for i in range(18): coo(S5 + 0.25 + rng.random() * (T - S5 - 0.6), 0.07 + 0.06 * rng.random(), 0.85 + 0.35 * rng.random())

# ---------------- mix ----------------
mix = voice * 1.0 + music * 0.11 + sfx * 0.9
# hard end: 15 ms anti-click fade only
e = int(0.015 * SR); mix[-e:] *= np.linspace(1, 0, e)
pan = np.stack([mix, mix], 1)
pk = np.abs(pan).max(); pan /= max(pk, 1e-9) / 0.89
with wave.open("work/mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(pan, -1, 1) * 32767).astype(np.int16).tobytes())
print("work/mix_raw.wav", round(N / SR, 3), "s")
