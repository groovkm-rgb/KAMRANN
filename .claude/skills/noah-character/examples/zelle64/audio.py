# Music + SFX synthesis (numpy only) and the final mix under the user's voice.mp3.
#   python3 audio.py  -> music.wav, sfx.wav, mix.wav (48 kHz stereo, -14 LUFS after loudnorm in ffmpeg)
import numpy as np, subprocess, json, os, sys
SR = 48000; DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 44.93; N = int(DUR * SR)  # usage: audio.py <film dir with voice.mp3> <duration>
rng = np.random.default_rng(7)
HERE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))

def t_(d): return np.arange(int(d * SR)) / SR
def spec_filter(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * g, len(x))
def env(n, a=.005, r=.2, curve=1.0):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4)); return e ** curve
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
class Bus:
    def __init__(s): s.L = np.zeros(N + SR * 4); s.R = np.zeros(N + SR * 4)
    def add(s, x, t, g=1.0, pan=0.0):
        i = int(t * SR); x = x * g; j = min(len(s.L), i + len(x)); x = x[:j - i]
        if i < 0: x = x[-i:]; i = 0
        s.L[i:i + len(x)] += x * np.sqrt((1 - pan) / 2) * 1.414; s.R[i:i + len(x)] += x * np.sqrt((1 + pan) / 2) * 1.414
    def out(s): return np.stack([s.L[:N], s.R[:N]])
def reverb(x, secs=2.2, wet=.3, seed=1):
    r = np.random.default_rng(seed); n = int(secs * SR); ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / secs)
    ir = spec_filter(ir, lo=200, hi=6000); ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n; F = 1 << (L - 1).bit_length(); y = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]
    return x * (1 - wet) + y * wet * .5

# ---------------- instruments ----------------
def pizz(m, d=.5, bright=1.0):
    t = t_(d); f = mtof(m); y = np.zeros_like(t)
    for h in range(1, 9): y += np.sin(2 * np.pi * f * h * t + h) / h ** 1.2 * np.exp(-t * (6 + h * 5 / bright))
    return y * env(len(t), .003, 10) * .5
def celesta(m, d=1.6):
    t = t_(d); f = mtof(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + .35 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 6) + .18 * np.sin(2 * np.pi * f * 6.8 * t) * np.exp(-t * 9)
    return y * env(len(t), .002, 10) * .45
def bass(m, d=.6):
    t = t_(d); f = mtof(m)
    y = np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4) + .15 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 7)
    return y * env(len(t), .01, d * .7) * .7
def pad(ms, d, a=1.2, r=1.5, bright=900):
    t = t_(d + r); y = np.zeros_like(t)
    for m in ms:
        f = mtof(m)
        for dt in (-.12, 0, .12):  # detuned saws
            ph = 2 * np.pi * f * (1 + dt / 100) * t; y += (2 * ((ph / (2 * np.pi)) % 1) - 1) * .3
    y = spec_filter(y, hi=bright, order=2)
    e = np.minimum(1, t / a) * np.where(t > d, np.exp(-(t - d) / (r / 3)), 1); return y * e * .25
def tick(f=3500, d=.03, g=1.0):
    n = int(d * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 180); x = spec_filter(x, lo=f * .6, hi=f * 1.6)
    return x * g / (np.abs(x).max() + 1e-9) * .5

# ---------------- MUSIC ----------------
mus = Bus(); BEAT = 60 / 100
D = 62  # D4
def sect(t0, t1): return [t0 + i * BEAT / 2 for i in range(int((t1 - t0) / (BEAT / 2)))]
# 1-4: mysterious wide opening (drone + sparse celesta), steps rhythm from 3.65
mus.add(pad([38, 45, 50], 6.0, a=1.0, r=1.2, bright=500), 0.0, .9)
for i, (tt, m) in enumerate([(0.15, 74), (1.2, 77), (2.3, 81), (3.4, 76), (4.6, 74), (5.4, 73)]): mus.add(celesta(m, 2.4), tt, .55, pan=(-.4 if i % 2 else .4))
for k, tt in enumerate(sect(3.65, 6.05)):
    if k % 2 == 0: mus.add(bass(38 if k % 4 == 0 else 45, .5), tt, .7)
# 5-8: mechanical "door" theme, pizzicato ostinato in D minor; speeds up in the time lapse (12.28+)
arp = [62, 65, 69, 74, 69, 65, 62, 57]
t = 6.05; k = 0
while t < 15.55:
    step = BEAT / 2 if t < 13.4 else max(BEAT / 6, BEAT / 2 * (1 - (t - 13.4) / 2.6))
    m = arp[k % 8] + (3 if 8.45 <= t < 12.28 and k % 8 in (3, 4) else 0)
    mus.add(pizz(m, .45), t, .55 if t < 13.4 else .45, pan=.3 if k % 2 else -.3)
    if k % 4 == 0: mus.add(bass(38 if (k // 8) % 2 == 0 else 41, .55), t, .8)
    t += step; k += 1
mus.add(pad([50, 53, 57], 9.5, a=.8, r=.8, bright=700), 6.05, .45)
# 9-10: tense question motif (diminished), tremolo pad
mus.add(pad([50, 53, 56, 59], 5.2, a=.6, r=.5, bright=1100), 15.62, .7)
for tt, m in [(15.8, 74), (16.4, 77), (17.0, 80), (17.9, 79), (18.8, 74), (19.1, 86), (20.2, 77), (20.6, 79)]: mus.add(celesta(m, 1.8), tt, .5)
for tt in sect(15.62, 21.0)[::2]: mus.add(bass(38, .4), tt, .45)
# 11: near silence: slow clock tick only (in SFX); a faint low tone
mus.add(pad([38], 1.9, a=.3, r=.6, bright=300), 21.05, .25)
# 12-15: riddle unfolding: stepwise rising melody, pizz pulse; one bright celesta note at "acht mal acht"
mel = [(23.1, 62), (23.7, 64), (24.3, 65), (24.9, 67), (25.6, 69), (26.4, 69), (27.0, 70), (27.6, 72), (28.95, 74), (29.85, 76), (30.4, 77)]
for tt, m in mel: mus.add(celesta(m, 1.6), tt, .45)
for k, tt in enumerate(sect(23.0, 33.4)): mus.add(pizz([50, 57, 62, 57][k % 4] + (0 if tt < 28.7 else 2), .35), tt, .35)
mus.add(pad([50, 57, 62], 10.4, a=1.5, r=.8, bright=800), 23.0, .5)
mus.add(celesta(93, 3.0), 31.5, 1.1); mus.add(celesta(81, 3.0), 31.5, .6)
# warming into major at the resolution
mus.add(pad([50, 54, 57, 62], 3.4, a=.8, r=.6, bright=1300), 33.4, .55)
for k, tt in enumerate(sect(33.4, 36.47)): mus.add(pizz([62, 66, 69, 74][k % 4], .4), tt, .4)
# 16-18: warm, jubilant climax and a soft final chord
for k, tt in enumerate(sect(36.47, 43.6)):
    m = [62, 66, 69, 74, 69, 66][k % 6] + (5 if 40.05 <= tt < 41.8 else 0)
    mus.add(pizz(m, .4, bright=1.6), tt, .5, pan=.3 if k % 2 else -.3)
    if k % 4 == 0: mus.add(bass(38 if tt < 40.05 else 43, .6), tt, .85)
mus.add(pad([50, 54, 57, 62, 66], 3.6, a=.6, r=.4, bright=1600), 36.47, .7)
mus.add(pad([55, 59, 62, 67], 2.6, a=.4, r=.4, bright=1600), 40.05, .7)
for tt, m in [(36.6, 74), (37.2, 78), (37.8, 81), (38.36, 86), (38.66, 88), (38.96, 90), (39.52, 93), (40.1, 86), (41.84, 90)]: mus.add(celesta(m, 1.4), tt, .45)
mus.add(pad([50, 57, 62, 66, 69], 1.4, a=.3, r=1.2, bright=1800), 43.6, .9)
mus.add(celesta(86, 2.5), 43.62, .6); mus.add(celesta(90, 2.5), 43.8, .5); mus.add(bass(38, 1.5), 43.62, .9)
music = mus.out(); music = np.stack([reverb(music[0], 2.4, .35, 1), reverb(music[1], 2.4, .35, 2)])
# soft fade at the very end
fe = np.ones(N); fe[-int(.6 * SR):] = np.linspace(1, .2, int(.6 * SR)); music *= fe

# ---------------- SFX ----------------
fx = Bus()
def noise(d, lo=None, hi=None, order=2): return spec_filter(rng.standard_normal(int(d * SR)), lo, hi, order)
def sm(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def norm(x, g=1.0): return x / (np.abs(x).max() + 1e-9) * g
# ambience: wind/room tone in the night part, dawn birds in the morning
amb = norm(noise(DUR, 60, 400), .25) * (0.6 + .4 * np.sin(2 * np.pi * t_(DUR)[:N] * .07)) if True else 0
ae = np.ones(N); ae[int(21.05 * SR):int(23.0 * SR)] = .35; fx.add(amb * ae, 0, .55)
for tt in [1.3, 4.7, 9.6, 14.2, 16.9, 19.8, 25.3, 30.2]:  # distant drips
    d = t_(.25); fx.add(np.sin(2 * np.pi * (1400 - 2200 * d) * d) * np.exp(-d * 30), tt, .12, pan=rng.uniform(-.8, .8))
for tt in [0.6, 5.2, 13.0, 18.5]:  # lamp chain creak
    d = t_(.6); f = 900 + 200 * np.sin(2 * np.pi * 3 * d); fx.add(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(d), .1, .3) * .2, tt, .06, pan=.5)
for tt in [0.2, 3.3, 16.2]:  # distant snore
    d = t_(1.4); fx.add(spec_filter(rng.standard_normal(len(d)), 80, 400) * np.sin(np.pi * d / 1.4) ** 2 * (1 + .5 * np.sin(2 * np.pi * 28 * d)), tt, .05, pan=-.6)
for i, tt in enumerate([1.8, 2.4, 2.9, 4.2, 4.8]):  # distant harmonica
    d = t_(.5); f = mtof([69, 72, 74, 72, 69][i]); x = sum(np.sin(2 * np.pi * f * h * d) / h for h in (1, 2, 3, 4)) * np.minimum(1, d / .05) * np.exp(-d * 2)
    fx.add(spec_filter(x, 300, 2500), tt, .04, pan=.7)
# whooshes: hook crane + soft ones at dissolves
def whoosh(d=.9, g=1.0): x = noise(d, 150, 1500); e = np.sin(np.pi * np.linspace(0, 1, len(x))) ** 2; return norm(x * e, g)
fx.add(whoosh(1.6), 0.0, .3); fx.add(whoosh(.9), 1.2, .2, pan=.4)
for tt in [2.25, 3.65, 6.05, 8.05, 9.98, 11.85, 15.62, 17.75, 25.95, 33.4, 36.47, 40.05, 42.62]: fx.add(whoosh(.5), tt - .25, .07)
# guard: footsteps on stone + key jingle + lantern hiss
def step(g=1.0):
    d = t_(.25); x = noise(.25, 60, 900) * np.exp(-d * 40) + np.sin(2 * np.pi * 90 * d) * np.exp(-d * 30) * .6; return reverb(norm(x, g), 1.4, .35, 5)
def jingle(g=1.0):
    d = t_(.35); x = np.zeros_like(d)
    for k in range(5): f = rng.uniform(2800, 5600); off = int(rng.uniform(0, .06) * SR); y = np.sin(2 * np.pi * f * d) * np.exp(-d * 25); x[off:] += y[:len(x) - off]
    return norm(x, g)
for t0, t1, per in [(3.7, 6.05, .6), (6.1, 8.05, .48), (8.1, 9.98, .52)]:
    tt = t0
    while tt < t1: fx.add(step(), tt, .35 if t0 > 3.6 and t0 < 4 else .28); fx.add(jingle(), tt + .03, .1, pan=.2); tt += per
fx.add(norm(noise(16.0, 2500, 9000), 1) * .02, 3.65, 1.0)  # lantern hiss under the guard shots
# doors: iron slide + latch; each door a slightly different pitch
def door(open_=True, g=1.0, pitch=1.0):
    d = t_(.45); slide = noise(.45, 300 * pitch, 2400 * pitch) * np.sin(np.pi * np.minimum(1, d / .3)) * np.exp(-d * 3) * .35
    hit = np.zeros_like(d); i = int(.28 * SR); dd = d[:len(d) - i]
    hit[i:] = (np.sin(2 * np.pi * (520 if open_ else 360) * pitch * dd) + .6 * np.sin(2 * np.pi * (1310 if open_ else 830) * pitch * dd)) * np.exp(-dd * (18 if open_ else 12)) + noise(.45, 800, 5000)[:len(dd)] * np.exp(-dd * 60) * .8
    return reverb(norm(slide + hit, g), 1.6, .3, 9)
for n in range(64, 75): fx.add(door(True, 1, rng.uniform(.85, 1.15)), 6.35 + (n - 63.4) / 5.909 - .28, .3, pan=np.clip((n - 69) / 8, -.8, .8))
for n in (64, 66, 68): fx.add(door(False, 1, rng.uniform(.85, 1.1)), 8.45 + (n - 63.4) / 3.409 - .28, .32)
fx.add(door(False, 1, .95), 10.62 - .28, .55); fx.add(door(True, 1, 1.05), 11.44 - .28, .55)
for n in range(3, 101, 3): fx.add(door(n % 2 == 0, 1, rng.uniform(.8, 1.2)), 12.28 + (n - 1) / 100 * 1.12, .07, pan=rng.uniform(-.7, .7))
for k in range(70):  # piano-like flurry in the time lapse
    tt = 13.4 + 1.6 * (k / 70) ** .7; fx.add(tick(rng.uniform(1500, 3500), .05, 1), tt, .12, pan=rng.uniform(-.8, .8))
d = t_(1.7); f = 6 + 40 * d; fx.add(norm(np.sin(2 * np.pi * np.cumsum(f) / SR * 1) * noise(1.7, 1000, 4000), 1) * np.minimum(1, d / .3), 13.35, .12)  # spinning clock
tt = 13.4
while tt < 15.0: fx.add(step(.8), tt, .15); tt += max(.09, .45 * (1 - (tt - 13.4) / 1.8))
# round counter ticks
for tt in [6.3, 8.45, 12.25] + list(np.linspace(13.5, 15.0, 14)): fx.add(tick(4200, .03), tt, .22)
# plate shimmer at "vierundsechzig"
fx.add(celesta(98, 1.5) + celesta(93, 1.5) * .6, 19.0, .25)
# thinking: slow clock tick-tock + finger taps
for k, tt in enumerate(np.arange(21.1, 23.0, .5)): fx.add(tick(2200 if k % 2 else 1700, .04), tt, .35)
for tt in [21.55, 21.9, 22.25, 22.6]: fx.add(tick(5200, .02), tt, .12, pan=.3)
# marks + notebook page
for tt in [23.35, 23.7, 24.05, 24.4, 24.75, 25.1, 25.45]: fx.add(celesta(88, .6), tt, .18); fx.add(tick(3000, .03), tt, .1)
d = t_(.4); fx.add(norm(noise(.4, 1500, 7000) * np.sin(np.pi * d / .4)), 23.3, .08)
# chalk scratches, pair locks, the 8x8 ping, chalk drop
for a, b in [(26.5, 27.3), (29.05, 29.85), (29.95, 30.75), (31.5, 32.3)]:
    d = t_(b - a); x = noise(b - a, 2000, 8000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 7 * d))); fx.add(norm(x, 1) * np.minimum(1, d / .05), a, .07)
for tt in [26.4, 28.95, 29.85]: fx.add(tick(3800, .03), tt + .22, .25); fx.add(tick(4600, .03), tt + .34, .25)
fx.add(celesta(96, 2.5) + celesta(103, 2.5) * .5, 31.5, .3)
fx.add(tick(6000, .03), 32.15, .2); fx.add(tick(6500, .02), 32.25, .1)
# counting the marks: ticks + door flips, final warm open
for i, tt in enumerate([33.65, 33.98, 34.31, 34.64, 34.97, 35.3, 35.63]): fx.add(tick(3300, .03), tt, .2); fx.add(door(i % 2 == 0, 1, 1.0 + i * .03), tt - .2, .15)
# golden openings + cheers + birds + applause
def cheer(d=1.2, g=1.0):
    t = t_(d); x = np.zeros_like(t)
    for k in range(6):
        f0 = rng.uniform(180, 320); f = f0 * (1 + .25 * np.sin(2 * np.pi * rng.uniform(2, 5) * t)); y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3
        x += spec_filter(y, 300, 2200) * np.sin(np.pi * np.minimum(1, t / d)) ** 1.5
    return reverb(norm(x, g), 1.5, .4, 11)
def birds(d):
    t = t_(d); x = np.zeros_like(t)
    for k in range(int(d * 3)):
        s = rng.uniform(0, d - .3); n = int(.12 * SR); tt = np.arange(n) / SR; f = rng.uniform(3000, 5000) + 1500 * np.sin(2 * np.pi * rng.uniform(15, 30) * tt)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / .12); i = int(s * SR); x[i:i + n] += y
    return x
for n, tt in [(1, 38.36), (4, 38.66), (9, 38.96), (16, 39.52)]: fx.add(sm(door(True, 1, 1.25), celesta(84 + n % 5, .8) * .5), tt - .28, .3); fx.add(cheer(1.0), tt + .45, .07, pan=rng.uniform(-.6, .6))
fx.add(birds(8.5), 36.47, .05, pan=.4)
d = t_(2.5); app = np.zeros_like(d)
for k in range(400): i = int(rng.uniform(0, 2.45) * SR); app[i:i + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 40)
fx.add(norm(spec_filter(app, 800, 6000), 1) * np.sin(np.pi * d / 2.5), 40.1, .08); fx.add(cheer(2.2), 40.2, .08)
fx.add(np.sin(2 * np.pi * 70 * t_(.5)) * np.exp(-t_(.5) * 6) * .3, 40.5, .3)  # 37's sad slump (soft low thud)
fx.add(sm(door(True, 1, .8), celesta(86, 1.5) * .6), 43.62 - .28, .45)
d = t_(1.0); f = 60 + 25 * np.sin(2 * np.pi * 1.3 * d) + 15 * rng.standard_normal(len(d)).cumsum() / 2000
fx.add(norm(spec_filter(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 80, 1200) * np.sin(np.pi * d) ** .5, 1), 44.0, .12)  # big exit gate creak
fx.add(birds(1.2), 43.7, .07, pan=-.3); fx.add(cheer(1.2), 43.8, .06)
sfx = fx.out()

# ---------------- MIX ----------------
def write(path, x):
    x = np.clip(x, -1, 1); y = (x.T * 32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', path], input=y, check=True)
def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(json.loads(r[r.rindex('{'):r.rindex('}') + 1])['input_i'])
voice = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(HERE, 'voice.mp3'), '-f', 's16le', '-ar', str(SR), '-ac', '1', '-'], capture_output=True).stdout, np.int16) / 32768
v = np.zeros(N); v[:min(N, len(voice))] = voice[:N]
# speech envelope for ducking
fr = int(.02 * SR); e = np.sqrt(np.convolve(v ** 2, np.ones(fr) / fr, 'same')); act = (e > .02).astype(float)
k = int(.25 * SR); act = np.convolve(act, np.ones(k) / k, 'same'); act = np.clip(act * 1.5, 0, 1)
duck_m = 1 - .55 * act; duck_s = 1 - .3 * act
write(os.path.join(HERE, 'music.wav'), music / (np.abs(music).max() + 1e-9) * .8)
write(os.path.join(HERE, 'sfx.wav'), sfx / (np.abs(sfx).max() + 1e-9) * .8)
write(os.path.join(HERE, 'voice48.wav'), np.stack([v, v]))
Lv, Lm, Ls = lufs(os.path.join(HERE, 'voice48.wav')), lufs(os.path.join(HERE, 'music.wav')), lufs(os.path.join(HERE, 'sfx.wav'))
print('LUFS voice/music/sfx', Lv, Lm, Ls)
gm = 10 ** ((Lv - 17 - Lm) / 20)   # music ~17 dB under speech before ducking (~ -22 dB under speech while talking)
gs = 10 ** ((Lv - 13 - Ls) / 20)   # effects a bit louder, still well under the voice
mm = music / (np.abs(music).max() + 1e-9) * .8 * gm * duck_m
ss = sfx / (np.abs(sfx).max() + 1e-9) * .8 * gs * duck_s
mix = np.stack([v, v]) + mm + ss
write(os.path.join(HERE, 'premix.wav'), mix * .9)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', os.path.join(HERE, 'premix.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(HERE, 'premix.wav'), '-af', af, '-ar', '48000', os.path.join(HERE, 'mix.wav')], check=True)
print('mix LUFS', lufs(os.path.join(HERE, 'mix.wav')))
