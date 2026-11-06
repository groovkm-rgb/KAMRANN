"""Music bed + SFX for "The Lighthouse Keeper" (no voice: the VO is added later by hand).
21.5 s / 645 frames @ 30 fps. Writes a stereo mix_raw.wav; finish.sh normalises it to -20 LUFS.
VO slots (s): 0.0-4.2 | 4.6-6.4 | 7.0-10.2 | 10.6-12.2 | 12.6-14.4 | 15.0-19.4 | 19.4-21.5 silent close.
Cuts: 4.40 (f132), 6.70 (f201), 10.40 (f312), 15.00 (f450, music hit)."""
import numpy as np, wave

SR = 48000
DUR = 645 / 30
N = int(round(DUR * SR))
rng = np.random.default_rng(11)
F = lambda f: f / 30            # frame -> seconds
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, cutoff, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cutoff) ** order); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp(x, cutoff, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / cutoff) ** order); return np.fft.irfft(X, len(x)).astype(np.float32)
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def env_ar(n, a, r):
    t = np.arange(n) / SR; return (np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)).astype(np.float32)
def fade(x, a, r):
    n = len(x); e = np.ones(n, np.float32); ia, ir = int(a * SR), int(r * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia) ** 2
    if ir: e[-ir:] *= np.linspace(1, 0, ir) ** 2
    return x * e

L = np.zeros(N, np.float32); Rch = np.zeros(N, np.float32)
def place(sig, t0, gain=1.0, pan=0.0):
    """pan -1 (left) .. +1 (right), equal-power"""
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i >= N or j <= i: return
    a = (pan + 1) * np.pi / 4
    L[i:j] += sig[: j - i] * gain * np.cos(a); Rch[i:j] += sig[: j - i] * gain * np.sin(a)

# ======================================================================= MUSIC
mus_L = np.zeros(N, np.float32); mus_R = np.zeros(N, np.float32)
def mplace(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i >= N or j <= i: return
    a = (pan + 1) * np.pi / 4
    mus_L[i:j] += sig[: j - i] * gain * np.cos(a); mus_R[i:j] += sig[: j - i] * gain * np.sin(a)

def string(f0, d, cutoff=1400, att=0.9, rel=1.2, vib=0.004, seed=0):
    """soft bowed-string / pad voice: 3 detuned band-limited saws, slow attack, vibrato"""
    t = tt(d); r = np.random.default_rng(seed); s = np.zeros(len(t))
    for det in (-0.0035, 0.0, 0.0042):
        ph = 2 * np.pi * f0 * (1 + det) * t + vib * 2 * np.pi * np.sin(2 * np.pi * (4.6 + r.random()) * t) * 3 + r.random() * 6
        kmax = int(min(14, 9000 / f0))
        s += sum(np.sin(k * ph) / k for k in range(1, kmax + 1))
    s = lp(s.astype(np.float32), cutoff) / 3
    return fade(s, att, rel)

def chord(notes, t0, d, gain, cutoff=1300, att=1.0, rel=1.4):
    for k, m in enumerate(notes):
        mplace(string(midi(m), d, cutoff, att, rel, seed=int(m * 7 + t0 * 10)), t0, gain / len(notes) ** 0.5, pan=(k / max(1, len(notes) - 1) - 0.5) * 0.7)

def bell(f0, d=3.0, gain=1.0):
    t = tt(d)
    s = (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 1.4) + 0.35 * np.sin(2 * np.pi * f0 * 2.01 * t) * np.exp(-t * 2.6)
         + 0.15 * np.sin(2 * np.pi * f0 * 3.0 * t) * np.exp(-t * 4) ) * np.minimum(1, t / 0.004)
    return (s * gain).astype(np.float32)

def piano(f0, d=2.6):
    t = tt(d); s = sum((0.6 ** k) * np.sin(2 * np.pi * f0 * (k + 1) * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.2 + 0.9 * k)) for k in range(6))
    return lp((s * np.minimum(1, t / 0.006)).astype(np.float32), 3200)

def timpani(f0=46, d=3.2):
    t = tt(d); f = f0 * (1 + 0.25 * np.exp(-t * 18))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.1)
    hit = lp(noise(d), 600) * np.exp(-t * 14) * 0.6
    sub = np.sin(2 * np.pi * 30 * t) * np.exp(-t * 0.9) * 0.6
    return (body + hit + sub).astype(np.float32)

D2, F2, A2, Bb1, G1, A1 = 38, 41, 45, 34, 31, 33
# 0.0-4.4  Dm, very soft; a little bell when the lamp catches (1.0 s)
chord([D2, 50, 53, 57], 0.0, 4.9, 0.20, cutoff=900, att=1.6)
mplace(bell(midi(69), 3.5, 0.10), 1.02, pan=0.25); mplace(bell(midi(74), 3.0, 0.06), 1.30, pan=-0.2)
# 4.4-6.7  Bb: a bitter turn for the laughing village
chord([Bb1, 50, 53, 58], 4.25, 2.9, 0.20, cutoff=1000, att=0.6)
mplace(piano(midi(65)), 4.45, 0.10, 0.1); mplace(piano(midi(62)), 5.45, 0.09, -0.1)
# 6.7-10.4 Gm -> A (climbing, quiet tension)
chord([G1, 50, 55, 58], 6.55, 2.2, 0.19, cutoff=1000, att=0.7)
chord([A1, 49, 52, 57], 8.55, 2.1, 0.19, cutoff=1100, att=0.8)
for k, m in enumerate([62, 62, 64, 64, 65, 65, 64]):           # slow low pulse under the footsteps
    mplace(piano(midi(m - 12), 1.2), 6.75 + k * 0.52, 0.07, 0.0)
# 10.4-15.0 logbook: thin Dm, a three-note figure, then Bb -> A swell into the hit
chord([D2, 53, 57, 62], 10.3, 2.5, 0.15, cutoff=900, att=0.9)
for t0, m in [(10.62, 69), (11.32, 65), (12.02, 64), (12.62, 62)]:
    mplace(piano(midi(m), 3.0), t0, 0.11, 0.15)
chord([Bb1, 50, 53, 58], 12.55, 1.6, 0.17, cutoff=1000, att=0.5)
swell = string(midi(A1), 1.9, 1600, att=1.6, rel=0.05); mplace(swell, 13.1, 0.2)
chord([A1, 52, 57, 61], 13.4, 1.62, 0.20, cutoff=1500, att=1.4, rel=0.05)
# 15.0 the hit: timpani + full Dm with octave strings, opening up, then sinking calmly
mplace(timpani(), 15.0, 0.42)
mplace(lp(noise(2.0), 220) * np.exp(-tt(2.0) * 2.2) * 0.8, 15.0, 0.4)
chord([26, D2, 50, 53, 57, 62, 65], 15.0, 2.4, 0.24, cutoff=2400, att=0.06, rel=0.6)
chord([Bb1, 46, 50, 53, 58, 62], 17.15, 1.6, 0.18, cutoff=1900, att=0.5, rel=0.6)
chord([29, F2, 48, 53, 57, 60], 18.35, 1.4, 0.16, cutoff=1600, att=0.5, rel=0.6)
chord([D2, 50, 53, 57, 64], 19.35, 2.15, 0.15, cutoff=1100, att=0.6, rel=1.9)   # Dm(add9), dies away
mplace(bell(midi(74), 2.0, 0.07), 19.4, pan=0.2)
music_env = np.ones(N, np.float32)
i0 = int(19.6 * SR); music_env[i0:] = np.linspace(1, 0, N - i0) ** 1.6
mus_L *= music_env; mus_R *= music_env

# ======================================================================= SFX
def wind(d, seed=1):
    r = np.random.default_rng(seed); t = tt(d)
    gust = 0.55 + 0.25 * np.sin(2 * np.pi * 0.17 * t + r.random() * 6) + 0.2 * np.sin(2 * np.pi * 0.41 * t + r.random() * 6)
    return (bp(noise(d), 180, 1100) * gust * 0.6 + hp(lp(noise(d), 3500), 1500) * gust ** 3 * 0.12).astype(np.float32)
def waves(d, period=5.2, seed=2):
    r = np.random.default_rng(seed); t = tt(d); ph = (t / period + r.random()) % 1
    surge = np.exp(-((ph - 0.35) / 0.18) ** 2) + 0.25
    return (lp(noise(d), 500) * surge * 0.9 + bp(noise(d), 800, 5000) * surge ** 2 * 0.2).astype(np.float32)
def lap(d):  # harbour lapping
    t = tt(d); return (bp(noise(d), 200, 900) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 0.9 * t)) ** 3) * 0.5).astype(np.float32)
def match():
    a = hp(noise(0.14), 1800) * (0.6 + 0.4 * (rng.random(int(0.14 * SR)) > 0.6)) * np.sin(np.pi * tt(0.14) / 0.14)
    flare = lp(noise(0.9), 3500) * env_ar(int(0.9 * SR), 0.01, 0.25) * 1.4
    out = np.zeros(int(1.0 * SR), np.float32); out[: len(a)] += a.astype(np.float32); out[int(0.09 * SR): int(0.09 * SR) + len(flare)] += flare[: len(out) - int(0.09 * SR)]
    return out
def hiss(d):
    t = tt(d); return (bp(noise(d), 1500, 7000) * 0.12 * (0.8 + 0.2 * np.sin(2 * np.pi * 7 * t))).astype(np.float32)
def whoomp():
    d = 1.6; t = tt(d)
    s = lp(noise(d), 380) * np.minimum(1, t / 0.12) * np.exp(-t * 2.2) * 2.2 + np.sin(2 * np.pi * (60 + 40 * np.exp(-t * 6)) * t) * np.exp(-t * 3) * 0.5
    return s.astype(np.float32)
def burner(d):
    t = tt(d); return (lp(noise(d), 420) * 0.5 * (0.9 + 0.1 * np.sin(2 * np.pi * 3.1 * t)) + bp(noise(d), 2000, 6000) * 0.04).astype(np.float32)
def whoosh(d=0.8, lo=300, hi=2200):
    t = tt(d); return (bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2 * 0.8).astype(np.float32)
def gull(n=3, base=2300):
    out = []
    for k in range(n):
        d = 0.22 + 0.08 * (k == n - 1); t = tt(d); f = base * (1 - 0.35 * (t / d) ** 0.7) * (1 + 0.02 * np.sin(2 * np.pi * 28 * t))
        ph = 2 * np.pi * np.cumsum(f) / SR; s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
        s *= np.sin(np.pi * t / d) ** 0.6; out.append(s); out.append(np.zeros(int(0.09 * SR)))
    return bp(np.concatenate(out).astype(np.float32), 900, 7000) * 0.5
def laugh_voice(d, f0, rate, seed):
    r = np.random.default_rng(seed); t = tt(d)
    f = f0 * (1 + 0.08 * np.sin(2 * np.pi * 0.7 * t + r.random() * 6)) * (1 - 0.12 * t / d)
    pulses = (np.mod(np.cumsum(f) / SR, 1) < 0.18).astype(np.float32)
    syl = np.maximum(0, np.sin(2 * np.pi * rate * t + r.random() * 6)) ** 1.5
    gaps = (np.sin(2 * np.pi * 0.6 * t + r.random() * 6) > -0.4).astype(np.float32)
    v = bp(pulses, 350, 2600) * 0.8 + bp(noise(d), 900, 3500) * 0.25
    return (v * syl * gaps * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def crowd(d):
    t = tt(d); return (bp(noise(d), 250, 1400) * 0.35 * (0.7 + 0.3 * np.sin(2 * np.pi * 1.3 * t)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def step(heavy=1.0):
    d = 0.14; t = tt(d)
    thud = np.sin(2 * np.pi * 85 * t) * np.exp(-t * 38) + lp(noise(d), 700) * np.exp(-t * 45) * 0.8
    knock = bp(noise(d), 450, 1600) * np.exp(-t * 70) * 0.5
    return ((thud + knock) * heavy).astype(np.float32)
def creak(d=0.6, f0=140, cutoff=2200):
    n = int(d * SR); t = np.arange(n) / SR
    rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d)); ph = np.cumsum(rate) / SR
    pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), cutoff) * np.sin(np.pi * t / d)
    return hp(s, 70) * 2.5
def page(d=0.16, bright=1.0):
    t = tt(d); return (bp(noise(d), 1200, 6500 * bright) * (np.minimum(1, t / 0.015) * np.exp(-t * 28)) * 0.9 + lp(noise(d), 600) * np.exp(-t * 40) * 0.2).astype(np.float32)
def thump(f0=110, d=0.3):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.5 * np.exp(-t * 40))) * np.exp(-t * 18) + lp(noise(d), 900) * np.exp(-t * 35) * 0.5).astype(np.float32)
def crackle(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 5)):
        i = int(rng.random() * (len(s) - 400)); s[i:i + 400] += hp(noise(400 / SR), 2500) * np.exp(-np.arange(400) / 60) * rng.uniform(0.2, 0.6)
    return s
def splash():
    d = 1.4; t = tt(d)
    return (lp(noise(d), 5000) * np.minimum(1, t / 0.008) * np.exp(-t * 3.5) * 1.1 + lp(noise(d), 380) * np.exp(-t * 5) * 1.6).astype(np.float32)
def plunge(d=1.4):
    t = tt(d); s = lp(noise(d), 260) * np.minimum(1, t / 0.05) * np.exp(-t * 1.6) * 2.2
    for _ in range(26):  # bubbles
        bt = rng.uniform(0, d * 0.8); bd = rng.uniform(0.03, 0.08); i = int(bt * SR); u = tt(bd); f = rng.uniform(380, 1300) * (1 + 2.0 * u / bd)
        b = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * u / bd) * rng.uniform(0.15, 0.4) * np.exp(-bt * 1.2)
        s[i:i + len(b)] += b[: len(s) - i]
    return s.astype(np.float32)
def underwater(d):
    t = tt(d); return (lp(noise(d), 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.23 * t)) * 1.3 + lp(noise(d), 900) * 0.08).astype(np.float32)
def bubbles(d, density=3.0):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * density)):
        bt = rng.uniform(0, d - 0.1); bd = rng.uniform(0.03, 0.07); i = int(bt * SR); u = tt(bd); f = rng.uniform(300, 900) * (1 + 1.6 * u / bd)
        b = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * u / bd) * rng.uniform(0.1, 0.3); s[i:i + len(b)] += b[: len(s) - i]
    return lp(s, 1800)
def groan(d=1.4, f0=48):
    return lp(creak(d, f0, 900), 700) * 1.6

# --- continuous beds (scene-dependent level) ---
amb_w = wind(DUR, 3); amb_v = waves(DUR, 5.4, 4)
wl = np.zeros(N, np.float32); vl = np.zeros(N, np.float32)
def seg(arr, a, b, val, x=0.25):
    ia, ib = int(a * SR), int(b * SR); arr[ia:ib] = val
seg(wl, 0, 4.4, 0.55); seg(vl, 0, 4.4, 0.55)            # night sea at the lamp
seg(wl, 4.4, 6.7, 0.30); seg(vl, 4.4, 6.7, 0.18)         # harbour (lapping added below)
seg(wl, 6.7, 15.0, 0.16); seg(vl, 6.7, 15.0, 0.07)       # muffled through tower walls
seg(wl, 15.0, 17.4, 0.5); seg(vl, 15.0, 17.4, 0.45)     # down the cliff: wind + surf up
seg(wl, 17.4, DUR, 0.0); seg(vl, 17.4, DUR, 0.0)         # under water
k = int(0.12 * SR); ker = np.ones(k) / k
wl = np.convolve(wl, ker, 'same').astype(np.float32); vl = np.convolve(vl, ker, 'same').astype(np.float32)
# the cut into the water is hard (no smoothing across 17.4 s)
iw = int(17.42 * SR); wl[iw:] = 0; vl[iw:] = 0
surge = np.ones(N, np.float32); a_, b_ = int(15.8 * SR), int(17.42 * SR); surge[a_:b_] = np.linspace(1, 1.9, b_ - a_)
place(amb_w * wl, 0, 0.55, -0.15); place(amb_w[::-1].copy() * wl, 0, 0.35, 0.3)
place(amb_v * vl * surge, 0, 0.75, 0.1)

# --- hook (0-4.4): match, flame, lamp catches, pull-back ---
place(match(), F(8) - 0.05, 0.55, 0.15)
place(fade(hiss(F(34 - 9)), 0.05, 0.2), F(9), 0.6, 0.15)
place(whoomp(), F(30) - 0.02, 0.85, 0.0)
place(fade(burner(2.4), 0.25, 1.2), F(31), 0.5, 0.0)
place(whoosh(2.2, 200, 1400), F(46), 0.35, -0.2)
place(gull(2, 2100), 3.15, 0.06, 0.6)                    # far off, over the empty sea

# --- fool (4.4-6.7): harbour, gulls, the village laughing ---
place(fade(lap(2.6), 0.2, 0.3), 4.32, 0.5, -0.2)
place(gull(3, 2400), 4.55, 0.16, -0.55); place(gull(2, 2000), 5.95, 0.12, 0.6)
place(crowd(2.35), 4.38, 0.55, 0.0)
for v, (f0, rate, pan) in enumerate([(190, 5.2, -0.4), (240, 5.8, 0.3), (150, 4.6, 0.1), (280, 6.4, -0.1), (210, 5.0, 0.5)]):
    place(laugh_voice(2.25, f0, rate, 70 + v), 4.42 + v * 0.05, 0.22, pan)
place(whoosh(0.5, 400, 2500), 6.5, 0.25, 0.0)            # out of the harbour

# --- climb (6.7-10.4): footsteps on the wooden spiral, creaks ---
for k in range(30):
    t0 = 6.72 + k * 0.29 + rng.uniform(-0.03, 0.03)
    if t0 > 9.75: break
    who = k % 3; place(step(1.0 - 0.25 * who), t0, 0.55, [-0.3, 0.25, 0.0][who])
for t0, f0 in [(7.25, 150), (8.35, 120), (9.45, 170)]: place(creak(0.55, f0), t0, 0.32, 0.2)
place(creak(0.7, 95), 9.95, 0.28, -0.1)                  # floorboard at the top, by the table
place(whoosh(1.2, 200, 1200), 8.9, 0.18, 0.0)            # camera rises through the floor

# --- logbook (10.4-15.0): cover opens, pages fly, stop on 12.6 ---
place(creak(0.32, 260, 3000), F(313) - 0.02, 0.22, 0.0)  # leather spine
place(whoosh(0.4, 300, 1800), F(316), 0.3, -0.1)
place(thump(95, 0.35), F(326), 0.55, -0.15)              # cover lands
place(fade(crackle(4.6), 0.3, 0.6), 10.4, 0.25, 0.3)     # candle
for k in range(12):
    place(page(0.15, 0.9 + 0.1 * (k % 2)), F(328 + 4 * k) + 0.01, 0.42 + 0.06 * (k % 3), (k % 2) * 0.3 - 0.15)
place(page(0.25, 0.7), F(377), 0.3, -0.1)                # last page settles
place(lp(noise(1.0), 900) * env_ar(int(SR), 0.02, 0.25) * 0.15, F(378), 1.0, 0.0)

# --- reveal (15.0-21.5): down the cliff, into the sea, the wrecks ---
place(whoosh(2.0, 150, 1600), 15.05, 0.4, 0.2)
place(whoosh(1.4, 200, 2000), 16.1, 0.4, -0.2)
place(lp(noise(1.2), 700) * env_ar(int(1.2 * SR), 0.15, 0.4) * 1.0, 16.6, 0.6, 0.3)   # a wave breaks on the rocks
place(splash(), F(521) - 0.03, 0.55, 0.0)
place(plunge(), F(522), 0.6, 0.0)
uw = fade(underwater(DUR - F(522)), 0.12, 1.4); place(uw, F(522), 0.38, 0.0)
place(fade(bubbles(DUR - F(524), 2.5), 0.1, 1.0), F(524), 0.5, 0.2)
for t0, f0, pan in [(18.15, 52, -0.4), (19.25, 42, 0.35), (20.3, 58, -0.1)]: place(groan(1.5, f0), t0, 0.36, pan)

# ======================================================================= MIX
sfx_L, sfx_R = L.copy(), Rch.copy()
# silent close: everything settles from 19.6 s and is nearly gone by the last frame
close = np.ones(N, np.float32); ic = int(19.6 * SR); close[ic:] = np.linspace(1, 0.08, N - ic) ** 1.3
sfx_L *= close; sfx_R *= close
# leave the VO slots a little room: music sits ~3 dB lower while a line is spoken, back up in the gaps
slots = [(0.0, 4.2), (4.6, 6.4), (7.0, 10.2), (10.6, 12.2), (12.6, 14.4), (15.0, 19.4)]
duck = np.ones(N, np.float32)
for a, b in slots: duck[int(a * SR): int(b * SR)] = 0.72
k = int(0.15 * SR); duck = np.convolve(duck, np.ones(k) / k, 'same').astype(np.float32)
duck[: int(0.2 * SR)] = 0.72
outL = mus_L * duck * 1.0 + sfx_L * 0.55
outR = mus_R * duck * 1.0 + sfx_R * 0.55
# gentle glue + fades in/out
pk = max(np.abs(outL).max(), np.abs(outR).max()); outL /= pk / 0.8; outR /= pk / 0.8
outL = np.tanh(outL * 1.1) / np.tanh(1.1); outR = np.tanh(outR * 1.1) / np.tanh(1.1)
fi, fo = int(0.03 * SR), int(0.35 * SR)
for x in (outL, outR): x[:fi] *= np.linspace(0, 1, fi); x[-fo:] *= np.linspace(1, 0, fo) ** 2
pcm = (np.clip(np.stack([outL, outR], 1), -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR, "s")
