# Synthesize light background music + SFX (numpy only) and mix under the user's voice-over.
# usage: python3 audio.py voice.mp3 out_mix.wav
import sys, subprocess, numpy as np, wave
SR = 44100
voice_path, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice_path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
voice = np.frombuffer(raw, np.int16).astype(np.float64) / 32768
TOTAL = len(voice) / SR + 0.5
N = int(TOTAL * SR)
voice = np.pad(voice, (0, N - len(voice)))
rng = np.random.default_rng(7)
T = lambda s: int(s * SR)

def env(n, a=.005, d=.2, curve=4):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t * curve / max(d, 1e-3) * 1.0); return e
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def noise(dur): return rng.standard_normal(T(dur))
def tone(freq, dur, kind='sine', vib=0):
    t = np.arange(T(dur)) / SR
    ph = 2 * np.pi * freq * t if np.isscalar(freq) else 2 * np.pi * np.cumsum(freq[:len(t)]) / SR
    if vib: ph = ph + vib * np.sin(2 * np.pi * 5 * t)
    if kind == 'sine': return np.sin(ph)
    if kind == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if kind == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == 'sq': return np.sign(np.sin(ph))
def sweep(f0, f1, dur, kind='sine'):
    f = np.geomspace(f0, f1, T(dur)); return tone(f, dur, kind)
def add(buf, x, t, g=1.0):
    i = T(t); if_ = min(len(buf), i + len(x));
    if i >= len(buf) or if_ <= i: return
    buf[i:if_] += x[:if_ - i] * g
def midi(n): return 440 * 2 ** ((n - 69) / 12)

# ---------------- instruments ----------------
def piano(n, dur=1.2, vel=1.0):
    f = midi(n); t = np.arange(T(dur)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0004 * h)) / h ** 1.6 for h in range(1, 7))
    return x * np.exp(-t * (2.2 + n / 40)) * np.minimum(1, t / .004) * vel * .5
def pizz(n, vel=1.0):
    f = midi(n); t = np.arange(T(.35)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) / h ** 1.2 for h in range(1, 5)) * np.exp(-t * 14) * np.minimum(1, t / .002)
    return x * vel * .45
def bass(n, dur=.4, vel=1.0):
    f = midi(n); t = np.arange(T(dur)) / SR
    x = np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)
    return x * np.exp(-t * 5) * np.minimum(1, t / .01) * vel * .6
def pad(notes, dur, vel=1.0):
    t = np.arange(T(dur)) / SR; x = np.zeros(len(t))
    for n in notes:
        for d in (-.12, .12): x += tone(midi(n) * (1 + d / 100), dur, 'saw')
    x = band(x, 80, 1800) / (len(notes) * 2)
    e = np.minimum(1, t / .6) * np.minimum(1, (dur - t) / .8); return x * e * vel * .35
def kick(vel=1):
    t = np.arange(T(.25)) / SR; f = 50 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * vel
def brush(vel=1, dur=.18): return band(noise(dur), 2500, 9000) * env(T(dur), .01, dur, 3) * vel * .25
def hat(vel=1): return band(noise(.06), 6000, 14000) * env(T(.06), .001, .04, 3) * vel * .3
def snare(vel=1): return (band(noise(.2), 1200, 7000) * .6 + tone(190, .2) * .4) * env(T(.2), .001, .12, 3) * vel * .5

music = np.zeros(N)
BPM = 108; B = 60 / BPM
def chord_stab(notes, t, vel=.8, fn=piano, dur=1.2):
    for n in notes: add(music, fn(n, dur, vel) if fn is piano else fn(n, vel), t)

# 0 – 4.6 bright, hopeful (C major), confetti accent at 1.38
for i in range(int(4.6 / B * 2)):
    t = i * B / 2
    if t > 4.6: break
    prog = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]][int(t / (2 * B)) % 4]
    add(music, pizz(prog[i % 3] + 12, .7), t)
    if i % 2 == 0: add(music, bass(prog[0] - 24, .4, .8), t)
    add(music, hat(.4), t)
for t, ch in [(0, [60, 64, 67, 72]), (1.38, [60, 64, 67, 72, 76]), (2.95, [65, 69, 72, 77]), (3.86, [67, 71, 74, 79])]: chord_stab(ch, t, .55)
add(music, sweep(400, 2400, .5, 'tri') * env(T(.5), .3, .5, 1) * .08, .9)  # riser into the cut
add(music, pad([60, 64, 67], 4.6, .5), 0)
# 4.6 – 20.9 sneaky comic motif in A minor, tension grows; hits with the bills
motif = [57, 0, 60, 0, 59, 0, 57, 56, 57, 0, 64, 0, 62, 60, 59, 0]
t = 4.6; i = 0
while t < 20.9:
    n = motif[i % 16]
    lvl = .55 + .35 * (t - 4.6) / 16
    if n: add(music, pizz(n, lvl), t)
    if i % 4 == 0: add(music, bass([45, 45, 41, 40][(i // 16) % 4], .35, .8), t)
    if i % 2 == 1: add(music, brush(.5), t)
    if i % 8 == 4: add(music, snare(.35), t)
    t += B / 2; i += 1
add(music, pad([45, 52, 60], 16.3, .45), 4.6)
for tb in (15.30, 15.76, 16.50): add(music, kick(.9), tb); chord_stab([45, 48, 51], tb, .5)
# counter run 10.9 – 12.3: rising pizz scale
for j in range(20): add(music, pizz(57 + j, .5), 10.9 + j * .07)
# 20.9 – 30.75 lounge jazz piano (Dm7 G7 Cmaj7 A7), brushes
prog = [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 61, 64, 67]]
t = 20.9; i = 0
while t < 30.2:
    ch = prog[(i // 4) % 4]
    if i % 4 == 0: chord_stab([n + 12 for n in ch], t, .4, dur=2.4); add(music, bass(ch[0] - 12, .6, .7), t)
    if i % 4 == 2: add(music, bass(ch[2] - 12, .5, .5), t)
    add(music, brush(.45, .25), t + (B * .15 if i % 2 else 0))
    if i % 2 == 1: add(music, piano(ch[3] + 24, .5, .25), t + B * .5)
    t += B; i += 1
# comic falling notes at "Oft nur ein paar Euro" (26.1)
for j, n in enumerate([76, 74, 71, 67, 64, 60]): add(music, pizz(n, .6), 25.95 + j * .09)
add(music, sweep(900, 180, .6, 'tri') * env(T(.6), .02, .6, 1) * .12, 26.45)
# short silence 30.25 – 30.75 (nothing added)
# 30.75 – 36.25 dramatic tension, stamp hit, relief
add(music, pad([38, 45, 50, 53], 4.9, .7), 30.75)
for j in range(int(4.9 / (B / 2))): add(music, bass(38, .22, .55 + .3 * j / 18), 30.75 + j * B / 2)
for j in range(8): add(music, sweep(200, 200 + j * 40, .3, 'saw') * env(T(.3), .01, .3, 3) * .02, 31 + j * B)
add(music, kick(1.4), 35.64); add(music, snare(1.0), 35.64); chord_stab([38, 45, 50, 53, 57], 35.64, .9, dur=.8)
add(music, pad([48, 55, 60, 64], 2.5, .6), 35.8); chord_stab([60, 64, 67, 72], 35.85, .45, dur=2)
for j, n in enumerate([60, 64, 67, 72, 76]): add(music, pizz(n, .5), 36.3 + j * .18)
# 38.2 – 44.95 heavy, thoughtful (A minor, slow low piano)
for j, ch in enumerate([[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]]):
    tt = 38.2 + j * 1.7; chord_stab(ch, tt, .5, dur=2.2); add(music, bass(ch[0] - 12, 1.2, .8), tt)
add(music, pad([45, 52, 57], 6.75, .55), 38.2)
for j in range(12): add(music, piano(69 if j % 3 else 72, .5, .18), 38.2 + j * .55)
# 44.95 – end: single piano note + cinematic closing chord
add(music, piano(69, 3, .6), 45.0)
chord_stab([45, 52, 57, 60, 64, 69], 46.95, .5, dur=3.0); add(music, pad([45, 52, 57, 64], 1.1, .6), 46.85)

# ---------------- SFX ----------------
sfx = np.zeros(N)
def S(x, t, g=1.0): add(sfx, x, t, g)
def whoosh(t, dur=.35, g=.25, lo=300, hi=3000):
    x = band(noise(dur), lo, hi); n = len(x); e = np.sin(np.linspace(0, np.pi, n)) ** 2; S(x * e, t, g)
def thud(t, g=.6, f=70): S(tone(f, .25) * env(T(.25), .002, .15, 3), t, g); S(band(noise(.08), 100, 1500) * env(T(.08), .001, .05, 3) * .6, t, g)
def click(t, g=.3, lo=2000, hi=8000): S(band(noise(.02), lo, hi) * env(T(.02), .0005, .01, 3), t, g)
def bell(t, f=2200, g=.25, d=.6): x = sum(np.sin(2 * np.pi * f * h * np.arange(T(d)) / SR) / h for h in (1, 2.76, 5.4)); S(x * env(T(d), .001, d, 4), t, g)
def paper_flutter(t, dur=1.2, g=.12):
    x = band(noise(dur), 800, 5000) * (.5 + .5 * np.sin(2 * np.pi * 9 * np.arange(T(dur)) / SR)); e = np.sin(np.linspace(0, np.pi, len(x))); S(x * e, t, g)
def slap(t, g=.55): S(band(noise(.09), 300, 4000) * env(T(.09), .0005, .05, 3), t, g); thud(t, .25, 110)
def pat(t, g=.45): S(band(noise(.07), 200, 3000) * env(T(.07), .0005, .04, 3), t, g); thud(t, .35, 90)
def buzz(t, dur, f=100, g=.06, flick=False):
    tt = np.arange(T(dur)) / SR; x = np.sign(np.sin(2 * np.pi * f * tt)) * .5 + np.sin(2 * np.pi * f * 3 * tt) * .3
    x = band(x, 80, 3000)
    if flick: x *= (np.sin(tt * 2 * np.pi * 7) > -.3) * .8 + .2
    S(x * np.minimum(1, tt / .05) * np.minimum(1, (dur - tt) / .1), t, g)
def rain(t, dur, g=.07, lo=1500, hi=9000):
    x = band(noise(dur), lo, hi); drops = np.zeros(len(x)); idx = rng.integers(0, len(x) - 400, int(dur * 60))
    for i in idx: drops[i:i + 300] += band(noise(300 / SR), 2000, 8000)[:300] * np.exp(-np.arange(300) / 60) * rng.uniform(.3, 1)
    tt = np.arange(len(x)) / SR; e = np.minimum(1, tt / .3) * np.minimum(1, (dur - tt) / .3); S((x * .6 + drops * .5) * e, t, g)
def murmur(t, dur, g=.05):
    x = np.zeros(T(dur)); tt = np.arange(len(x)) / SR
    for k in range(6): x += band(noise(dur), 250 + k * 90, 700 + k * 150) * (.6 + .4 * np.sin(2 * np.pi * (1.5 + k * .7) * tt + k))
    e = np.minimum(1, tt / .3) * np.minimum(1, (dur - tt) / .3); S(x * e, t, g)
def applause(t, dur=1.6, g=.25):
    x = np.zeros(T(dur))
    for _ in range(int(dur * 120)):
        i = rng.integers(0, len(x) - 2000); x[i:i + 1500] += band(noise(1500 / SR), 800, 6000)[:1500] * np.exp(-np.arange(1500) / 200) * rng.uniform(.3, 1)
    tt = np.arange(len(x)) / SR; S(x * np.minimum(1, tt / .1) * np.minimum(1, (dur - tt) / .5), t, g)
def chirp(t, g=.08):
    for j in range(3): S(sweep(3000, 4800, .07) * env(T(.07), .005, .07, 2), t + j * .1, g)
def puff(t, g=.35): S(band(noise(.35), 100, 1500) * env(T(.35), .01, .3, 3), t, g)
def chomp(t, g=.35):
    tt = np.arange(T(.12)) / SR; f = 180 + 300 * np.exp(-tt * 30); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(tt), .002, .1, 3); S(band(x, 100, 2500), t, g)

# opening
S(band(noise(.06), 3000, 10000) * env(T(.06), .001, .04, 3), 1.20, .35); S(band(noise(.05), 2500, 9000) * env(T(.05), .001, .03, 3), 1.30, .3)
bell(1.36, 3400, .18, .25)                                     # "schnipp"
S(band(noise(.5), 200, 8000) * env(T(.5), .002, .25, 3), 1.40, .5); thud(1.40, .5, 60)  # confetti pop
for j in range(30): click(1.45 + rng.uniform(0, .8), .08, 3000, 10000)
# applause removed (user request)
buzz(1.38, .5, 120, .08, True); S(sweep(80, 240, .35, 'saw') * env(T(.35), .02, .35, 1) * .05, 1.42)  # neon "vizz"
for tb in (.3, 2.4, 3.2): chirp(tb, .06)
paper_flutter(2.6, 1.8, .14); slap(4.40, .6)
for j in range(5): paper_flutter(4.3 + j * .12, .9, .05)
whoosh(4.55, .3, .3)
# wallet + moth
S(np.concatenate([band(noise(.012), 2000, 8000) * .6 for _ in range(1)]), 5.6, 0)
for j in range(14): click(5.62 + j * .022, .18, 1500, 6000)   # zipper
mt = np.arange(T(1.0)) / SR; S(band(noise(1.0), 150, 900) * (np.sin(2 * np.pi * 28 * mt) > 0) * np.sin(np.linspace(0, np.pi, len(mt))), 6.85, .12)  # moth flutter
# montage
whoosh(7.85, .3, .3)
S(band(np.sign(np.sin(2 * np.pi * 190 * np.arange(T(.35)) / SR)), 200, 4000) * (1 + .5 * np.sin(2 * np.pi * 30 * np.arange(T(.35)) / SR)) * env(T(.35), .02, .35, 1), 8.05, .06)  # drill
S(band(noise(.25), 200, 3000) * env(T(.25), .01, .2, 2), 8.12, .2)  # burner whoomp
for tb in (8.47, 8.62, 8.77): thud(tb, .3, 140)                      # hammer
S(band(noise(.4), 1500, 6000) * np.sin(np.linspace(0, np.pi, T(.4))), 8.5, .08)  # brush
for j in range(3): S(band(noise(.15), 400, 4000) * env(T(.15), .002, .1, 3), 8.95 + j * .1, .2)  # boxes pop
for tb in (9.45, 9.62, 9.8, 9.98): thud(tb, .4, 80)                   # stamps
for tb in (8.04, 8.45, 8.90, 9.40): bell(tb, 1800, .07, .25)
# counter
for j in range(int((12.2 - 10.9) / .03)): click(10.9 + j * .03 * (1 - j / 120), .12, 1500, 5000)
bell(12.33, 1568, .25, 1.2); bell(12.35, 2093, .2, 1.0); S(band(noise(.15), 1000, 6000) * env(T(.15), .001, .1, 3), 12.32, .2)  # "katsching"
# calendar tear
S(band(noise(.35), 1500, 8000) * env(T(.35), .002, .3, 2), 14.62, .3); paper_flutter(14.7, .5, .1)
whoosh(15.2, .25, .25)
# office: rain outside, lamp hum, bills
rain(13.6, 7.3, .035, 1000, 6000)
buzz(15.2, 1.85, 100, .025, True)
for tb in (15.30, 15.76, 16.50): paper_flutter(tb - .25, .3, .08); pat(tb + .02, .55)
# pie: hap hap hap
for j in range(8): chomp(17.65 + j * .24, .25)
# restaurant
murmur(20.9, 9.35, .035)
for tb in (21.3, 22.9, 24.1, 27.2, 28.4): bell(tb + rng.uniform(0, .2), 3200 + rng.uniform(-300, 300), .05, .4)  # cutlery / glass
bell(23.1, 2600, .07, .9)  # glasses clink
for j in range(40): click(20.9 + rng.uniform(0, 9.3), .03, 1500, 6000)  # candle crackle
S(band(noise(.3), 2000, 8000) * (np.sin(np.linspace(0, 30, T(.3))) > 0) * env(T(.3), .01, .3, 1), 21.6, .12)  # note rustle
S(band(noise(.4), 2000, 8000) * env(T(.4), .01, .4, 1), 22.7, .08)
for tb in (25.2, 25.35, 25.5, 25.65, 25.8): whoosh(tb, .3, .18, 800, 5000)
for j, tb in enumerate((26.2, 26.27, 26.33)): bell(tb, 2400 + j * 300, .12, .5)  # coins "tin"
puff(30.28, .45)
for tb in (29.1, 29.4): S(band(noise(.4), 200, 1200) * env(T(.4), .01, .3, 2), tb, .05)
# street
whoosh(30.75, .3, .3)
rain(30.75, 14.2, .09)
for tb in (31.3, 34.0, 40.6, 43.3): S(band(noise(1.6), 150, 2500) * np.sin(np.linspace(0, np.pi, T(1.6))) ** 2, tb, .1)  # wet cars
for j in range(9): click(32.85 + j * .2, .15, 300, 1500)   # icons switching off
S(tone(55, .6) * env(T(.6), .002, .5, 3), 35.64, .9); S(band(noise(.3), 60, 1200) * env(T(.3), .001, .2, 3), 35.64, .9)  # GUM stamp
for j in range(10): buzz(36.4 + j * .18, .18, 120, .02)   # signs on
buzz(43.6, .85, 120, .05, True); S(band(noise(.25), 2000, 9000) * env(T(.25), .001, .2, 3), 44.45, .25); S(sweep(240, 50, .4, 'saw') * env(T(.4), .01, .4, 1), 44.45, .05)  # fizzt
click(44.6, .2, 800, 3000)
# calendar pages
for j in range(14): paper_flutter(38.2 + j * .08, .4, .05)
whoosh(38.2, .3, .25)
# final
rain(44.95, 3.0, .08); S(band(noise(3.0), 60, 300) * .5, 44.95, .05)   # city hum
whoosh(44.95, .3, .25)
buzz(47.15, .4, 120, .05, True)

# ---------------- mix ----------------
# voice envelope for ducking
win = T(.05); ve = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, 'same'))
ve = np.convolve(ve, np.ones(T(.25)) / T(.25), 'same'); vn = np.clip(ve / (np.percentile(ve, 95) + 1e-9), 0, 1)
def rms(x): return np.sqrt(np.mean(x[np.abs(x) > 1e-5] ** 2)) if np.any(np.abs(x) > 1e-5) else 1
vrms = np.sqrt(np.mean(voice[vn > .3] ** 2))
music = music / rms(music) * vrms * 10 ** (-21 / 20)       # ~21 dB under the voice
music *= (1 - .5 * vn)                                      # extra ducking while speaking
sfx = sfx / rms(sfx) * vrms * 10 ** (-12 / 20)
sfx *= (1 - .35 * vn)
mix = voice + music + sfx
mix = mix / max(1, np.max(np.abs(mix)) / .95)
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('mix', TOTAL, 'peak', np.max(np.abs(mix)))
