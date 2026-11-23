# Synthesised SFX + light salon music, mixed under the user's voice.mp3 (voice untouched), exported as mix.wav
import numpy as np, subprocess, json, sys
from scipy.signal import butter, sosfilt
SR = 44100; TOTAL = 42.4667; N = int(TOTAL * SR) + 1
rng = np.random.default_rng(7)
def tt(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(d, a=.005, r=None, curve=8):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-t * curve) if r is None else e * np.clip((d - t) / r, 0, 1)
def noise(d): return rng.standard_normal(int(d * SR))
sfx = np.zeros(N); mus = np.zeros(N)
def put(buf, t0, x, g=1.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[:N - i] if i >= 0 else x[-i:]; i = max(i, 0); buf[i:i + len(x)] += x * g
def db(v): return 10 ** (v / 20)
# ---------------- SFX bank ----------------
def tick(hi=True): d = .05; return bp(noise(d), 2500 if hi else 1500, 6000 if hi else 3500) * env(d, .001, None, 90)
def pat(): d = .18; t = tt(d); return (np.sin(2 * np.pi * (180 * np.exp(-t * 18) + 60) * t) * env(d, .002, None, 22) + .4 * lp(noise(d), 2000) * env(d, .001, None, 50))
def whoosh(d=.45, f0=300, f1=2500, up=True):
    x = noise(d); t = tt(d); k = t / d if up else 1 - t / d
    a = bp(x, max(40, f0 * .6), min(18000, f0 * 1.6), 1); b = bp(x, max(40, f1 * .6), min(18000, f1 * 1.6), 1)
    return lp(a * (1 - k) + b * k, 7000) * np.sin(np.pi * t / d) ** 1.5
def rustle(d=.4): x = bp(noise(d), 1500, 7000); t = tt(d); return x * (.5 + .5 * np.abs(np.sin(t * 37))) * np.sin(np.pi * t / d)
def clack():
    d = .35; t = tt(d); x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dk) * a for f, dk, a in [(1240, 22, .6), (2870, 30, .4), (4410, 40, .3), (760, 18, .5)])
    return x * env(d, .0005, None, 0) + .8 * bp(noise(d), 1500, 6000) * np.exp(-t * 120)
def screech(d=1.0, f=900):
    t = tt(d); fm = f + 120 * np.sin(2 * np.pi * 7 * t) + 80 * np.sin(2 * np.pi * 13.3 * t)
    ph = 2 * np.pi * np.cumsum(fm) / SR; x = (np.sin(ph) + .5 * np.sin(2.01 * ph) + .3 * np.sin(3.03 * ph)) * (.6 + .4 * np.abs(np.sin(t * 9)))
    return bp(x, 400, 5000) * np.minimum(1, t / .05) * np.clip((d - t) / .1, 0, 1)
def ting(f=3200): d = 1.0; t = tt(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 4) * env(d, .001, None, 0)
def chime(fs=(1568, 2093, 2637, 3136), gap=.06): out = np.zeros(int(1.4 * SR)); [put_local(out, i * gap, ting(f) * .5) for i, f in enumerate(fs)]; return out
def put_local(buf, t0, x): i = int(t0 * SR); x = x[:len(buf) - i]; buf[i:i + len(x)] += x
def ratchet(d=.6): out = np.zeros(int(d * SR)); [put_local(out, k * .07, tick(False) * .9) for k in range(int(d / .07))]; return out
def gulp(): d = .25; t = tt(d); f = 300 * np.exp(-t * 6) + 120; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
def plip(): d = .15; t = tt(d); f = 900 + 1800 * t / d; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, .002, None, 30)
def sneeze():
    d1 = .4; t = tt(d1); inh = bp(noise(d1), 800, 3000) * (t / d1) ** 2 * .5  # "ha..."
    d2 = .5; t2 = tt(d2); burst = (bp(noise(d2), 1800, 8000) * .9 + bp(noise(d2), 300, 900) * .5) * np.exp(-t2 * 7) * np.minimum(1, t2 / .01)
    return np.concatenate([inh, burst])
def buzz(d=1.0): t = tt(d); f = 220 + 25 * np.sin(2 * np.pi * 3 * t) + 10 * np.sin(2 * np.pi * 11 * t); ph = 2 * np.pi * np.cumsum(f) / SR; x = np.sign(np.sin(ph)) * .5 + np.sin(2 * ph) * .3; return bp(x, 200, 3000) * np.minimum(1, t / .05) * np.clip((d - t) / .05, 0, 1)
def fsss(): d = .5; t = tt(d); return whoosh(d, 3000, 500, True) * np.exp(-t * 2)
def sadtrombone():
    out = np.zeros(int(1.3 * SR))
    for i, (f, d) in enumerate([(233, .22), (220, .22), (208, .22), (196, .6)]):
        t = tt(d); vib = 1 + (.012 * np.sin(2 * np.pi * 6 * t) if i == 3 else 0); ph = 2 * np.pi * np.cumsum(f * vib * (1 - (.04 * t / d if i == 3 else 0))) / SR
        x = sum(np.sin(k * ph) / k ** 1.1 for k in range(1, 9)); x = lp(x, 1800) * np.minimum(1, t / .03) * np.clip((d - t) / .06, 0, 1); put_local(out, [0, .22, .44, .66][i], x * .35)
    return out
def slap(): d = .12; t = tt(d); return (bp(noise(d), 600, 4000) * np.exp(-t * 60) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 40) * .5)
def hooves(d=1.4): out = np.zeros(int(d * SR)); [put_local(out, k * .19 + (k % 2) * .04, lp(bp(noise(.06), 300, 2500), 2500) * env(.06, .001, None, 70) * (.7 + .3 * (k % 2))) for k in range(int(d / .19))]; return out
def bird(): d = .25; t = tt(d); f = 3200 + 900 * np.sin(2 * np.pi * 18 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2 * .5
def step(heel=False): d = .08; t = tt(d); return lp(bp(noise(d), 200 if not heel else 900, 2500 if not heel else 5000), 4000) * env(d, .001, None, 55)
def creak(d=.45, f=180): t = tt(d); fm = f + 60 * np.sin(2 * np.pi * 2.3 * t); ph = 2 * np.pi * np.cumsum(fm) / SR; x = np.sign(np.sin(ph)) * (rng.random(len(t)) > .3); return bp(x.astype(float), 300, 3000) * np.sin(np.pi * t / d)
def giggle(n=4, f0=520):
    out = np.zeros(int((n * .13 + .3) * SR))
    for k in range(n):
        d = .1; t = tt(d); f = f0 * (1 + .15 * np.sin(np.pi * t / d)) * (1 + .05 * k); ph = 2 * np.pi * np.cumsum(f) / SR
        x = sum(np.sin(h * ph) * a for h, a in [(1, 1), (2, .6), (3, .35), (4, .15)]); x = bp(x, 400, 3500) * np.sin(np.pi * t / d) ** 2
        put_local(out, k * .13, x * (1 - k * .12))
    return out * .5
def rattle(d=.8): out = np.zeros(int(d * SR)); [put_local(out, k * .09, bp(noise(.05), 3000, 9000) * env(.05, .002, None, 50)) for k in range(int(d / .09))]; return out
def poof(): d = .6; t = tt(d); return lp(noise(d), 900) * np.exp(-t * 6) * np.minimum(1, t / .01) + .3 * bp(noise(d), 2000, 6000) * np.exp(-t * 10)
def wind_uu(d=.9): t = tt(d); f = 330 + 60 * np.sin(np.pi * t / d); ph = 2 * np.pi * np.cumsum(f) / SR; return (bp(noise(d), 250, 900) * .6 + np.sin(ph) * .25) * np.sin(np.pi * t / d) ** 2
def puf(): d = 1.2; t = tt(d); return (lp(noise(d), 1500) * np.exp(-t * 4) + .7 * bp(noise(d), 2000, 9000) * np.exp(-t * 9)) * np.minimum(1, t / .004) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 8) * .8
def hiss(d=1.0): t = tt(d); return bp(noise(d), 3000, 9000) * np.exp(-t * 2) * .4
def page(): d = .35; t = tt(d); return bp(noise(d), 1200, 7000) * np.sin(np.pi * t / d) * (.6 + .4 * np.sin(t * 60))
def flicker(): d = .12; t = tt(d); return (np.sign(np.sin(2 * np.pi * 100 * t)) * .3 + bp(noise(d), 2000, 7000) * .5) * env(d, .002, None, 25)
def mbox(f, d=2.0): t = tt(d); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 4.02 * t) * np.exp(-t * 6) + .2 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 2.2) * np.minimum(1, t / .002)
def hum(d): t = tt(d); return lp(noise(d), 300) * .15 + .05 * np.sin(2 * np.pi * 60 * t)
def drip(): d = .12; t = tt(d); f = 700 + 2200 * t / d; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, .001, None, 40) * .6
# ---------------- SFX timeline ----------------
S = lambda t0, x, g: put(sfx, t0, x, db(g))
studio = [(0, 14.2667), (14.2667, 15.2333), (17.0333, 32.3333)]
for a, b in studio:
    k = np.ceil(a - .5) + .5
    while k < b: S(k, tick(int(k) % 2 == 0), -24); k += 1.0
    for k2 in np.arange(a + .7, b, 2.9): S(k2, rustle(.8), -36)
    for k3 in np.arange(a + 1.3, b, 5.3): S(k3, bird(), -34)
S(0.0, rustle(.25), -16); S(.22, pat(), -8); S(.22, whoosh(.6, 400, 2600), -14); S(.3, rustle(.6), -18); S(.62, pat() * .5, -16)
S(1.02, chime((2093, 2637, 3136, 4186)), -16); S(1.38, clack(), -10); S(1.62, clack(), -11)
S(1.78, whoosh(.5, 500, 2000), -20); S(1.95, hooves(1.4), -24)
for k in range(6): S(3.45 + k * .29, step(), -20)
S(4.2, creak(.4, 160), -20); S(4.3, pat() * .6, -18); S(4.55, ting(2600) * .4, -24)
S(5.1, screech(1.2, 820), -24); S(6.6, ting(3600), -16); S(7.0, screech(.6, 900), -25); S(7.45, clack() * .4, -18)
S(7.85, ratchet(1.05), -18); S(8.98, clack(), -6); S(8.98, ting(1900) * .5, -16); S(9.25, gulp(), -16)
S(9.95, gulp() * .6, -22); S(10.8, tick(True), -10); S(10.8, ting(4200) * .2, -24)
for k in range(46): S(11.65 + k * (.05 + .0012 * (46 - k)), tick(True), -22)
S(13.56, ting(2400), -15); S(12.0, gulp(), -20); S(13.05, plip(), -16); S(14.05, plip(), -18)
S(14.27, sneeze(), -10); S(14.82, ting(1400) * .4, -20)
S(15.2, whoosh(.35, 600, 4000), -16); S(15.23, hum(1.8), -16)
for k in range(5): S(15.4 + k * .37, drip(), -22)
S(15.35, bp(noise(.4), 400, 2000) * env(.4, .01, None, 6), -22)  # liquid lift
S(15.9, fsss(), -14); S(16.35, sadtrombone(), -12); S(16.55, slap(), -14)
S(17.03, whoosh(.3, 800, 3000), -24)
S(17.15, hp(bp(noise(.7), 2500, 8000), 2000) * np.sin(np.pi * tt(.7) / .7) * .6, -22)  # soft "shh" air
S(17.9, buzz(.74), -20); S(18.64, tick(True) * .5, -20)
for k in range(5): S(18.7 + k * .09, tick(True) * .4, -26)
S(19.6, (lambda t: np.sin(2 * np.pi * np.cumsum(500 + 40 * np.sin(2 * np.pi * 9 * t)) / SR) * np.sin(np.pi * t / .6) * .3)(tt(.6)), -22)
S(20.2, (lambda t: np.sin(2 * np.pi * np.cumsum(600 * np.exp(-t * 2.5)) / SR) * np.sin(np.pi * t / .5) * .4)(tt(.5)), -20)
S(20.5, whoosh(.7, 300, 1500), -24)
S(21.3, creak(.5, 140), -18)
for k in range(5): S(21.55 + k * .3, step(True), -24)
S(22.3, giggle(3, 560), -16); S(22.4, rattle(.5), -24)
S(23.1, giggle(5, 600), -13); S(23.2, rattle(1.2), -20); S(23.5, ting(3000) * .4, -20); S(23.95, giggle(4, 650), -15); S(24.1, rustle(.4), -22)
S(24.62, rustle(.5), -16); S(25.07, whoosh(.8, 300, 3500), -10); S(25.83, poof(), -14); S(25.9, chime((2637, 3136, 3951)), -20)
S(26.62, chime((1568, 2093, 2637, 3136, 4186), .05), -16)
S(27.7, giggle(3, 580), -18); S(28.5, giggle(4, 540), -18)
S(30.2, (lambda t: np.sin(2 * np.pi * np.cumsum(220 + 180 * np.exp(-t * 8) * np.sin(2 * np.pi * 14 * t)) / SR) * np.exp(-t * 4))(tt(.6)), -14)
S(30.25, ting(1760), -18); S(30.5, pat() * .4, -22)
S(31.45, wind_uu(.9), -12); S(31.7, giggle(5, 620), -16)
S(32.2, whoosh(.2, 2000, 6000), -18); S(32.27, puf(), -6); S(32.4, hiss(1.2), -18)
S(32.6, whoosh(.9, 300, 1200, False), -24)
S(35.3, whoosh(.35, 1500, 400, False), -26)
S(35.3, hum(7.17) * .5, -20)
S(36.5, page(), -14); S(36.8, page() * .6, -18)
S(37.95, mbox(1047), -24)
S(39.4, chime((2637, 3136, 3951), .12), -24)
S(41.3, flicker(), -18); S(41.75, flicker(), -18); S(41.93, flicker() * .6, -22)
# ---------------- music ----------------
BPM = 104; B = 60 / BPM
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=.5, g=1): t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (6 + k * 3)) / k for k in range(1, 7)); return x * np.minimum(1, t / .003) * g
def piano(f, d=1.2, g=1): t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t * (1 + .0004 * k * k)) * np.exp(-t * (2.2 + k * .9)) / k ** 1.3 for k in range(1, 8)); return x * np.minimum(1, t / .004) * g
def clar(f, d=.8, g=1): t = tt(d); v = 1 + .004 * np.sin(2 * np.pi * 5 * t); ph = 2 * np.pi * np.cumsum(f * v) / SR; x = sum(np.sin(k * ph) * a for k, a in [(1, 1), (3, .45), (5, .25), (7, .12)]); return lp(x, 2500) * np.minimum(1, t / .05) * np.clip((d - t) / .12, 0, 1) * g
def pad(fs, d, g=1): t = tt(d); x = sum(sum(np.sin(2 * np.pi * f * k * t * (1 + .002 * j)) / k ** 1.4 for k in range(1, 5) for j in (-1, 1)) for f in fs); return lp(x, 1800) * np.minimum(1, t / .4) * np.clip((d - t) / .4, 0, 1) * g / len(fs)
M = lambda t0, x, g=0: put(mus, t0, x, db(g))
CH = {'F': [53, 57, 60], 'C7': [48, 52, 55, 58], 'Bb': [46, 50, 53], 'Dm': [50, 53, 57], 'A7': [45, 49, 52, 55], 'Gm': [43, 46, 50], 'C': [48, 52, 55], 'Am': [45, 48, 52], 'E': [40, 44, 47], 'Ddim': [50, 53, 56]}
# A: cheerful (0 – 9.5)
prog = ['F', 'C7', 'F', 'Bb', 'F', 'C7', 'F', 'C7', 'F']
for bi, ch in enumerate(prog):
    t0 = bi * 4 * B
    if t0 > 9.5: break
    nts = CH[ch]
    M(t0, pluck(NOTE(nts[0] - 12), .5), -6); M(t0 + 2 * B, pluck(NOTE(nts[2] - 12), .5), -7)
    for bt in (1, 3): [M(t0 + bt * B, pluck(NOTE(n), .3), -12) for n in nts]
    pat8 = [2, 0, 1, 2, 3, 2, 1, 0]
    for k, ix in enumerate(pat8):
        tn = t0 + k * B / 2
        if tn < 9.5 and (k % 4 != 3 or bi % 2 == 0): M(tn, piano(NOTE(nts[ix % len(nts)] + 24 + (12 if ix == 3 else 0)), .5), -11)
M(8.98, pluck(NOTE(41), .6), -2); M(8.98, piano(NOTE(77), .8), -6)  # klak accent
# B: tick-tock tension (9.5 – 21.27)
t0 = 9.5; i = 0
while t0 < 21.2:
    ch = ['Dm', 'A7'][(i // 4) % 2]; n = CH[ch]
    M(t0, pluck(NOTE(n[0] - 12 if i % 2 == 0 else n[2] - 12), .25), -8)
    if i % 4 == 0: M(t0, clar(NOTE(n[0] + 12), 4 * B * .95), -14)
    if 14.4 < t0 < 15.3 and i % 2 == 0: pass
    t0 += B; i += 1
M(14.69, piano(NOTE(61), 1.0) + piano(NOTE(62.6), 1.0) + piano(NOTE(64), 1.0), -6)  # sneeze: wrong cluster
for k, m in enumerate([74, 73, 72, 71, 70, 69, 68, 67]): M(20.2 + k * .07, clar(NOTE(m), .12), -12)
# C: lullaby (21.27 – 32.33), music box arpeggios + soft pad
prog = ['Bb', 'F', 'Gm', 'C', 'Bb', 'F', 'Gm', 'C']
for bi, ch in enumerate(prog):
    t0 = 21.27 + bi * 4 * B * 1.1
    if t0 > 32.3: break
    nts = CH[ch]; M(t0, pad([NOTE(n) for n in nts], min(4 * B * 1.1, 32.33 - t0)), -16)
    for k in range(8):
        tn = t0 + k * B * 1.1 / 2
        if tn < 31.5: M(tn, mbox(NOTE(nts[[0, 1, 2, 1, 2, 1, 0, 1][k] % len(nts)] + 24)) * .7, -14)
M(31.56, pad([NOTE(n) for n in CH['Ddim']], .9), -10); M(31.56, mbox(NOTE(80), 1.5), -14)
# D: flash accent + bright run (32.33 – 35.3)
for n in [77, 81, 84, 89]: M(32.33, mbox(NOTE(n), 2.0), -10)
for k in range(12): M(32.9 + k * B / 2, pluck(NOTE([65, 69, 72, 77][k % 4]), .4), -15)
M(33.0, pad([NOTE(n) for n in CH['F']], 2.3), -18)
# E: slow mysterious music box (35.3 – end)
seq = [(35.4, 'Am'), (37.2, 'F'), (38.9, 'Dm'), (40.4, 'E')]
for t0, ch in seq:
    nts = CH[ch]; M(t0, pad([NOTE(n) for n in nts], 1.9), -17)
    for k in range(3): M(t0 + k * .55, mbox(NOTE(nts[k % len(nts)] + 24), 2.0), -15)
M(41.95, mbox(NOTE(77), 2.5), -12); M(41.95, pad([NOTE(n) for n in CH['F']], .5), -18)
# ---------------- mix ----------------
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, dtype=np.float32).astype(float)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
win = int(.05 * SR); r = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, 'same'))
act = (r > np.max(r) * .05).astype(float); act = np.convolve(act, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); act = np.clip(act * 1.5, 0, 1)
vr = np.sqrt(np.mean(voice[act > .5] ** 2))
mus = lp(mus, 9000); mr = np.sqrt(np.mean(mus ** 2)) + 1e-9
mus *= vr * db(-21) / mr  # ~21 dB under the speech
mus *= (1 - act * (1 - db(-3))) * db(1.5)  # duck; a little up in the gaps
sr_ = np.sqrt(np.mean(sfx ** 2)) + 1e-9
sfx *= vr * db(-17) / sr_ * 1.0
sfx_d = sfx * (1 - act * (1 - db(-4)))
mix = voice + mus + sfx_d
fade = np.ones(N); fl = int(.35 * SR); fade[-fl:] = np.linspace(1, .2, fl); mix *= fade
mix /= max(1, np.max(np.abs(mix)) / .95)
import wave
with wave.open('mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    st = np.repeat((mix * 32767).astype(np.int16)[:, None], 2, 1); w.writeframes(st.tobytes())
print('voice rms', 20 * np.log10(vr), 'music rms', 20 * np.log10(np.sqrt(np.mean(mus ** 2))), 'sfx rms', 20 * np.log10(np.sqrt(np.mean(sfx_d ** 2))))
