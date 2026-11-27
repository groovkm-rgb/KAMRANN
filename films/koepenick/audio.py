# Synthesised music + SFX for the Köpenick short, mixed under the user's voice.mp3. Output: mix.wav (48 kHz stereo).
import numpy as np, soundfile as sf, subprocess, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; DUR = 40.62; N = int(DUR * SR)
rng = np.random.default_rng(7)
def T(n): return np.arange(n) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def nm(s):  # 'C4', 'Eb4', 'F#3'
    p = NOTE[s[0]]; i = 1
    while s[i] in 'b#': p += -1 if s[i] == 'b' else 1; i += 1
    return 12 * (int(s[i:]) + 1) + p
M = np.zeros((N, 2)); S = np.zeros((N, 2))
def add(buf, t0, x, g=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    if i0 < 0: x = x[-i0:]; i0 = 0
    x = x[:N - i0]; l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i0:i0 + len(x), 0] += x * g * l * 1.414; buf[i0:i0 + len(x), 1] += x * g * r * 1.414
def env(n, a=.005, d=.3, s=0.0, r=.05, hold=None):
    t = T(n); e = np.minimum(1, t / max(a, 1e-4))
    e *= np.where(t < a, 1, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    if r: e *= np.clip((t[-1] - t) / r, 0, 1)
    return e
# ---------------- instruments ----------------
def pizz(m, dur=.35, v=1):
    n = int(dur * SR); t = T(n); f = mtof(m)
    x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 * np.exp(-t * (6 + k * 3)) for k in range(1, 7))
    return x * env(n, .002, .15, 0, .02) * v
def mbox(m, dur=1.2, v=1):
    n = int(dur * SR); t = T(n); f = mtof(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + .35 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t * 9) + .2 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)
    return x * env(n, .002, 10, 1, .05) * v
def piano(m, dur=1.5, v=1):
    n = int(dur * SR); t = T(n); f = mtof(m)
    x = sum(np.sin(2 * np.pi * f * k * (1 + .0004 * k * k) * t) / k ** 1.2 * np.exp(-t * (1.2 + k * .9)) for k in range(1, 8))
    return lp(x, 4000) * env(n, .003, 10, 1, .15) * v
def tuba(m, dur=.4, v=1, slide=0):
    n = int(dur * SR); t = T(n); f = mtof(m) * (1 + slide * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k for k in range(1, 9))
    return lp(x, 700) * env(n, .03, .25, .6, .08) * v
def clar(m, dur=.4, v=1, vib=1):
    n = int(dur * SR); t = T(n); f = mtof(m) * (1 + .004 * vib * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / .2, 0, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k for k in (1, 3, 5, 7, 9)) + .15 * np.sin(2 * ph)
    return lp(x, 2600) * env(n, .04, .5, .75, .08) * v
def snare(v=1, dur=.18):
    n = int(dur * SR); t = T(n)
    x = bp(rng.standard_normal(n), 1500, 7000) * np.exp(-t * 28) + .5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 40)
    return x * v
def cym(v=1, dur=1.2):
    n = int(dur * SR); t = T(n); return hp(rng.standard_normal(n), 6000) * np.exp(-t * 4) * v
def noise(n): return rng.standard_normal(n)
BEAT = 60 / 104
def chord(fn, notes, t0, dur, v, pan=0):
    for k, s in enumerate(notes): add(M, t0 + k * .012, fn(nm(s), dur, v), 1, pan)
# ---------------- music ----------------
# 0–5.30 mysterious: music box + pizzicato, snare tap with the salute
mb = ['C6', 'Eb6', 'G6', 'Bb5', 'Ab5', 'G5', 'Eb6', 'D6']
for i in range(int(5.3 / (BEAT / 2))):
    t0 = .05 + i * BEAT / 2
    if i % 2 == 0 or i % 8 == 5: add(M, t0, mbox(nm(mb[(i // 2) % 8]) - (12 if i > 14 else 0), 1.0, .22), 1, .35)
    if i % 4 == 0: add(M, t0, pizz(nm(['C3', 'Ab2', 'F2', 'G2'][(i // 8) % 4]), .5, .55), 1, -.3)
    if i % 4 == 2: add(M, t0, pizz(nm('G3'), .3, .3), 1, -.1)
for t0 in (2.80, 2.86, 2.92): add(M, t0, snare(.5 if t0 < 2.9 else .9), 1, .1)
add(M, 2.92, cym(.12, 1.5), 1, .3)
# 5.30–10.50 simple piano; sad motif in the flashback
for i, (ch, t0) in enumerate(zip([['C3', 'G3', 'Eb4'], ['Ab2', 'Eb3', 'C4'], ['F2', 'C3', 'Ab3'], ['G2', 'D3', 'B3']], [5.35, 6.5, 7.6, 8.75])): chord(piano, ch, t0, 2.2, .35)
for t0, s in [(7.95, 'G4'), (8.6, 'F4'), (9.2, 'Eb4'), (9.75, 'D4'), (10.2, 'C4')]: add(M, t0, piano(nm(s), 1.4, .32), 1, .2)
# 10.50–24.40 sneaky march -> train -> grand climax
mel = [('G4', 1), ('Ab4', .5), ('G4', .5), ('F#4', .5), ('G4', 1), ('D4', .5), ('Eb4', 1), ('F4', .5), ('Eb4', .5), ('D4', 1), ('C4', 1)]
def march(t0, t1, major=False, big=False, train=False, gap=None):
    nb = int((t1 - t0) / BEAT)
    for b in range(nb):
        tb = t0 + b * BEAT
        if gap and gap[0] - .05 < tb < gap[1]: continue
        bass = (['C2', 'G1'] if not major else ['C2', 'G1'])[b % 2]
        if b % 2 == 0: add(M, tb, tuba(nm(bass), BEAT * .7, .55 if not big else .75), 1, -.15)
        else: chord(pizz, ['G3', 'C4', 'Eb4' if not major else 'E4'], tb, .3, .25, .2)
        add(M, tb + BEAT / 2, snare(.12 if not big else .22, .12), 1, .1)
        if b % 4 == 3: add(M, tb + BEAT * .75, snare(.2), 1, .1)
        if big and b % 4 == 0: add(M, tb, cym(.1), 1, .4)
        if train: add(M, tb + BEAT / 4, snare(.1, .08), 1, -.2); add(M, tb + BEAT * .75, snare(.1, .08), 1, -.2)
    tm = t0; i = 0
    while tm < t1 - .3:
        s, d = mel[i % len(mel)]; m = nm(s) + (4 if major and s[0] in 'E' and 'b' in s else 0)
        if major: m = nm({'Ab4': 'A4', 'Eb4': 'E4', 'F#4': 'F#4'}.get(s, s))
        if not (gap and gap[0] - .1 < tm < gap[1]):
            add(M, tm, clar(m, d * BEAT * .9, .28 if not big else .34), 1, .25)
            if big: add(M, tm, clar(m - 12, d * BEAT * .9, .22), 1, -.25)
        tm += d * BEAT; i += 1
march(10.55, 17.3, gap=(13.74, 14.32))
march(17.3, 19.45, train=True)
march(19.45, 24.4, major=True, big=True)
# 24.40–26.35: fades with the fog: a lone clarinet tail
for t0, s in [(24.45, 'G4'), (25.0, 'E4'), (25.55, 'C4')]: add(M, t0, clar(nm(s), .9, .22 * (1 - (t0 - 24.4) / 2.2)), 1, .2)
# 26.35–31.28: cheerful laughing motif, tuba "hö-hö"
for b in range(int((31.2 - 26.4) / (BEAT / 2))):
    tb = 26.4 + b * BEAT / 2
    if b % 4 == 0: add(M, tb, tuba(nm(['F2', 'C2'][(b // 4) % 2]), BEAT * .45, .45), 1, -.15)
    if b % 2 == 1: chord(pizz, ['A3', 'C4', 'F4'], tb, .25, .2, .2)
    if b % 8 in (0, 3, 5): add(M, tb, clar(nm(['F5', 'A5', 'C6', 'A5', 'G5', 'E5'][b % 6]), BEAT * .35, .18), 1, .3)
add(M, 29.62, tuba(nm('Bb1'), .28, 1.0, slide=-.04), 1, -.1); add(M, 29.98, tuba(nm('F1'), .42, 1.0, slide=-.08), 1, -.1)
# 31.28–35.74: slow sad piano, hopeful rise when the door opens
for ch, t0 in [(['A2', 'E3', 'C4'], 31.35), (['F2', 'C3', 'A3'], 32.3)]: chord(piano, ch, t0, 2, .32)
for k, s in enumerate(['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6']): add(M, 33.0 + k * .28, piano(nm(s), 1.6, .24 + k * .02), 1, .15)
for ch, t0 in [(['F2', 'C3', 'A3', 'F4'], 33.05), (['G2', 'D3', 'B3', 'G4'], 34.0), (['C3', 'G3', 'E4', 'C5'], 34.95)]: chord(piano, ch, t0, 1.8, .3)
# 35.74–40.62: warm nostalgic close, march motif legato, one soft final chord
for ch, t0 in [(['C3', 'G3', 'E4'], 35.8), (['A2', 'E3', 'C4'], 36.75), (['F2', 'C3', 'A3'], 37.7), (['G2', 'D3', 'B3'], 38.6)]: chord(piano, ch, t0, 1.6, .3)
tm = 35.85
for s, d in [('G4', 1), ('A4', .5), ('G4', .5), ('F#4', .5), ('G4', 1.5), ('E4', 1), ('F4', .5), ('E4', .5), ('D4', 1)]:
    add(M, tm, clar(nm(s), d * BEAT * 1.4, .2), 1, .25); tm += d * BEAT * 1.25
for s in ['C2', 'G2', 'C3', 'E3', 'G3', 'C4', 'E4']: add(M, 39.55, piano(nm(s), 1.1, .3), 1, 0); add(M, 39.55, clar(nm(s) + 12, 1.05, .07), 1, .2)
add(M, 39.55, tuba(nm('C2'), 1.05, .5), 1, -.1)
# ---------------- SFX ----------------
def reverb(x, rt=1.2, mix=.35):
    n = int(rt * SR); ir = rng.standard_normal(n) * np.exp(-T(n) * 6.9 / rt); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - mix) + fftconvolve(x, ir)[:len(x)] * mix * 1.5
def thunk(f=180, d=.15, v=1, nz=.3):
    n = int(d * SR); t = T(n); return (np.sin(2 * np.pi * f * t * (1 - .3 * t / d)) * np.exp(-t * 30) + nz * lp(noise(n), 1800) * np.exp(-t * 45)) * v
def click(v=1, f=3500): n = int(.03 * SR); t = T(n); return bp(noise(n), f * .6, min(f * 1.6, 20000)) * np.exp(-t * 300) * v
def rustle(d, v=1, lo=1500, hi=7000, rate=18):
    n = int(d * SR); t = T(n); am = np.clip(lp(np.abs(noise(n)), rate), 0, None); am /= am.max() + 1e-9
    return bp(noise(n), lo, hi) * am * env(n, .05, 10, 1, .1) * v
def bell(f, d=2.5, v=1):
    n = int(d * SR); t = T(n); return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * dk) for k, a, dk in [(1, 1, 1.2), (2.76, .5, 2.5), (5.4, .25, 4), (8.9, .12, 6)]) * v
def whoosh(d=.5, v=1): n = int(d * SR); t = T(n); e = np.sin(np.pi * t / d) ** 2; return lp(noise(n), 900) * e * v
def bed(t0, t1, x_fn, v, pan=0):
    n = int((t1 - t0) * SR); x = x_fn(n); e = np.clip(np.minimum(T(n) / .4, (T(n)[-1] - T(n)) / .4), 0, 1); add(S, t0, x * e, v, pan)
def crackle(n): x = np.zeros(n); idx = rng.integers(0, n, int(n / SR * 18)); x[idx] = rng.uniform(-1, 1, len(idx)); return bp(x, 1500, 6000) * 3 + lp(noise(n), 300) * .05
def wind(n): return lp(noise(n), 500) * (1 + .5 * np.sin(2 * np.pi * .3 * T(n)))
def laugh(d, f0=200, v=1, rate=5.5, seed=0):
    n = int(d * SR); t = T(n); r = np.random.default_rng(seed); f = f0 * (1 + .08 * np.sin(2 * np.pi * .7 * t) - .15 * t / d) * (1 + .01 * r.standard_normal(n).cumsum() / np.sqrt(n))
    ph = 2 * np.pi * np.cumsum(f) / SR; src = sum(np.sin(k * ph) / k for k in range(1, 25))
    am = np.clip(np.sin(2 * np.pi * rate * t), 0, None) ** 1.5
    x = bp(src, 650, 950) + .6 * bp(src, 1100, 1400) + .2 * hp(noise(n), 3000) * am
    return x * am * env(n, .02, 10, 1, .2) * v
# room (0–5.30, 5.30–7.90): candle crackle, distant clock tower, fabric, buttons, cap
bed(0, 3.75, crackle, .03); bed(5.2, 7.95, crackle, .03)
add(S, .15, reverb(bell(392, 3, .12), 2, .6), 1, .5)
for t0 in (.25, 1.9, 3.0): add(S, t0, rustle(.45, .05, 800, 5000), 1, -.2)
for t0 in (.6, .75, .9): add(S, t0, click(.07), 1, .1)
add(S, 2.27, thunk(260, .12, .14, .5), 1, 0)
for k in range(9): add(S, k * .58, click(.025, 2500), 1, -.6)
# Trödler
add(S, 3.72, reverb(sum(bell(f, 1.2, .07) for f in (1975, 2637)), .8, .3), 1, .4)
add(S, 3.95, bp(noise(int(.35 * SR)), 300, 1200) * np.sin(np.pi * T(int(.35 * SR)) / .35) * .05, 1, -.3)
add(S, 4.6, thunk(120, .25, .12, .6), 1, -.4)
# hammer
for h in (5.85, 6.35, 6.85, 7.35): add(S, h, thunk(320, .12, .14, .7), 1, .25); add(S, h + .01, click(.05, 4500), 1, .25)
# flashback: keys, scratching, drip, all with reverb
fb = np.zeros(int(2.7 * SR))
k = rustle(.6, .4, 3000, 9000, 40); fb[int(.3 * SR):int(.3 * SR) + len(k)] += k
for i in range(7): s = rustle(.18, .25, 2000, 6000, 60); o = int((.7 + i * .25) * SR); fb[o:o + len(s)] += s
for i in range(3): d = np.sin(2 * np.pi * 1400 * T(1500) * (1 - T(1500) * 8)) * np.exp(-T(1500) * 60) * .2; o = int((.4 + i * .85) * SR); fb[o:o + len(d)] += d
add(S, 7.95, reverb(lp(fb, 5000), 1.8, .55), .35, 0)
# street: wind, leaves, hooves, murmur, marching
bed(10.45, 17.4, wind, .06); bed(10.45, 17.4, lambda n: rustle(n / SR, 1, 2500, 8000, 6), .025, .3)
bed(10.45, 17.4, lambda n: bp(noise(n), 250, 900) * (1 + .4 * np.sin(2 * np.pi * 1.3 * T(n))), .02, -.3)
for i in range(16): add(S, 10.7 + i * .42 + (i % 2) * .08, thunk(700, .06, .04, .9), 1, -.5)
step = np.pi / 8.5
tt = 10.5
while tt < 13.77: add(S, tt, thunk(140, .1, .1, .9), 1, -.1); tt += step
add(S, 13.78, thunk(240, .09, .3, 1.0), 1, 0); add(S, 13.785, click(.25, 2500), 1, 0)
tt = 15.75
while tt < 17.3: add(S, tt, thunk(140, .1, .12, .9), 1, .1); tt += step
for t0 in (15.47, 15.5): add(S, t0, rustle(.2, .05, 1000, 5000), 1, 0)
# station
add(S, 17.3, hp(noise(int(1.2 * SR)), 2500) * env(int(1.2 * SR), .1, .6, .2, .3) * .035, 1, .4)
n = int(1.4 * SR); add(S, 17.55, reverb(lp(sum(np.sin(2 * np.pi * f * T(n)) for f in (880, 1110)) * env(n, .15, 10, 1, .4), 3000), 1.5, .6), .03, .5)
tt = 17.5; gap = .32
while tt < 19.5: add(S, tt, thunk(90, .08, .08, .8), 1, -.2); add(S, tt + .09, thunk(90, .08, .07, .8), 1, -.2); tt += gap; gap = max(.2, gap * .93)
# Rathaus
n = int(.8 * SR); add(S, 19.6, bp(noise(n), 200, 700) * (np.sin(2 * np.pi * 9 * T(n)) > .3) * env(n, .05, 10, 1, .2) * .06, 1, 0)
for i in range(5): add(S, 21.0 + i * .2, thunk(180, .1, .1, .8), 1, .1)
add(S, 21.08, laugh(.35, 260, .05, 3, 1), 1, -.3); add(S, 21.15, hp(noise(int(.3 * SR)), 1500) * env(int(.3 * SR), .05, .2, 0, .05) * .05, 1, .3)
add(S, 21.55, click(.2, 5000), 1, .2); add(S, 21.6, click(.12, 5000), 1, .2)
add(S, 22.95, click(.25, 2000), 1, .3); add(S, 23.0, thunk(500, .05, .12, .6), 1, .3)
add(S, 23.2, rustle(.5, .07, 2000, 8000, 30), 1, -.2)
add(S, 23.65, rustle(.55, .05, 4000, 10000, 50), 1, .2)
# vanish: wind + leaves
bed(24.35, 26.4, lambda n: wind(n) * 1.5, .07); bed(24.35, 26.4, lambda n: rustle(n / SR, 1, 2500, 8000, 8), .035, .3)
# night street + café
bed(26.3, 29.6, lambda n: bp(noise(n), 200, 800), .02)
add(S, 26.4, rustle(.5, .09, 1500, 7000, 25), 1, .2)
add(S, 26.6, laugh(.5, 330, .05, 2.5, 4), 1, -.4)
for i, (t0, f0, p) in enumerate([(28.0, 210, -.4), (28.15, 260, .3), (28.4, 180, .1), (28.7, 300, -.2), (29.0, 230, .4)]): add(S, t0, laugh(1.1, f0, .05, 5 + i * .4, 10 + i), 1, p)
add(S, 28.3, sum(np.sin(2 * np.pi * f * T(int(.8 * SR))) * np.exp(-T(int(.8 * SR)) * 7) for f in (2800, 4100)) * .03, 1, .3)
add(S, 29.65, lp(laugh(1.3, 120, .07, 4, 20), 700), 1, 0)
# cell
cell = np.zeros(int(4.5 * SR))
for t0 in (.2, 1.1, 2.0, 2.9, 3.8): d = np.sin(2 * np.pi * 1300 * T(1500) * (1 - T(1500) * 8)) * np.exp(-T(1500) * 60) * .18; o = int(t0 * SR); cell[o:o + len(d)] += d
n = int(.9 * SR); cr = bp(noise(n), 300, 1500) * (np.sin(2 * np.pi * 7 * T(n) * (1 + T(n))) > .2) * env(n, .1, 10, 1, .2) * .25; o = int(1.65 * SR); cell[o:o + n] += cr
r2 = rustle(.5, .3, 1500, 7000, 25); o = int(2.85 * SR); cell[o:o + len(r2)] += r2
st = thunk(150, .12, .6, .8); o = int(3.05 * SR); cell[o:o + len(st)] += st
add(S, 31.3, reverb(cell, 1.6, .5), .4, 0)
# final: camera clicks, birds, city hum, shimmer
bed(35.7, 40.62, lambda n: lp(noise(n), 250), .03)
for t0 in (36.1, 36.9, 37.8, 38.6): add(S, t0, click(.12, 3000), 1, .5 if t0 < 37 else -.5); add(S, t0 + .04, click(.06, 1800), 1, 0)
for i in range(8): n = int(.12 * SR); t = T(n); add(S, 35.9 + i * .55, np.sin(2 * np.pi * (3200 + 900 * np.sin(2 * np.pi * 18 * t)) * t) * np.sin(np.pi * t / .12) * .02, 1, (-1) ** i * .6)
for k, f in enumerate((2093, 2637, 3136, 4186)): add(S, 39.97 + k * .05, bell(f, 1.2, .025), 1, .2)
# soft whooshes on the cuts
for c0 in [1.77, 3.65, 5.30, 7.90, 10.50, 13.40, 17.27, 19.45, 21.00, 22.90, 24.40, 26.35, 27.97, 29.55, 31.28, 32.90, 35.74, 38.22]: add(S, c0 - .25, whoosh(.5, .05), 1, 0)

# ---------------- mix ----------------
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'voice.mp3', '-ac', '1', '-ar', str(SR), 'voice48.wav'], check=True)
v, _ = sf.read('voice48.wav'); V = np.zeros(N); V[:min(N, len(v))] = v[:N]
# speech envelope -> ducking
w = int(.05 * SR); e = np.sqrt(np.convolve(V ** 2, np.ones(w) / w, 'same')); act = (e > .02).astype(float)
act = np.convolve(act, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); act = np.clip(act * 1.5, 0, 1)
duck = 1 - .45 * act
rmsV = np.sqrt(np.mean(V[e > .02] ** 2)); Md = M * duck[:, None]
rmsM = np.sqrt(np.mean(Md[e > .02] ** 2)) + 1e-9
M2 = Md * (rmsV / rmsM) * 10 ** (-21 / 20)
# music section fades (avoid hard stops): fade out at end
fo = np.clip((DUR - T(N)) / .6, 0, 1); M2 *= fo[:, None]
S2 = S * (rmsV / (np.sqrt(np.mean(S ** 2)) + 1e-9)) * 10 ** (-16 / 20) * (1 - .3 * act)[:, None]
mix = V[:, None] * np.array([1, 1]) + M2 + S2
mix /= max(1, np.abs(mix).max() / .95)
sf.write('mix_pre.wav', mix, SR)
print('voice rms', 20 * np.log10(rmsV), 'music rel dB under speech: -21; peak', np.abs(mix).max())
sf.write('stem_music.wav', M2, SR); sf.write('stem_sfx.wav', S2, SR)
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
for a, b in [(0, 3.6), (3.7, 5.2), (5.3, 10.4), (10.5, 17.2), (17.3, 19.4), (19.5, 24.3), (24.4, 26.3), (26.4, 31.2), (31.3, 35.7), (35.8, 40.5)]:
    i, j = int(a * SR), int(b * SR); print(f'{a:5.1f}-{b:5.1f}  voice {db(V[i:j]):6.1f}  music {db(M2[i:j]):6.1f}  sfx {db(S2[i:j]):6.1f}  sfxpeak {20*np.log10(np.abs(S2[i:j]).max()+1e-9):6.1f}')
