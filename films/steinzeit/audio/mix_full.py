"""Full soundtrack for 'Ein Tag in der Steinzeit': voice + procedural music, ambience and synced SFX, with ducking.
Run from films/steinzeit/audio:  python3 mix_full.py  ->  full_mix.wav (48 kHz stereo, 16 bit)"""
import json, re, wave
import numpy as np
from scipy import signal
from sfx import SR, rng, bp, lp, hp, smooth_env, stereo, voice_activity

T = json.load(open('timing.json'))
VO_END, FILM_END = 791.28, 791.28 + 1.25
N = int(round(FILM_END * SR))
S = lambda i: T[i]['t0']
WORDS = [(re.sub(r'[^\wäöüÄÖÜß-]', '', w).lower(), t) for o in T for w, t in o['w']]
def tw(w, n=1, after=0.0):
    k = 0
    for x, t in WORDS:
        if x == w and t >= after:
            k += 1
            if k == n: return t
    raise KeyError(w)

def rd(p):
    w = wave.open(p); return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768

voice = np.zeros(N, np.float32); v = rd('voice.wav'); voice[:len(v)] = v[:N]
V = np.stack([voice, voice], 1)
act = voice_activity(V)[:N]
vr = np.sqrt(np.mean(voice[act > .5] ** 2)); VDB = 20 * np.log10(vr)
print('voice rms', round(VDB, 1))
db = lambda x: 10 ** (x / 20)

music = np.zeros((N, 2), np.float32); amb = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32)
def add(bus, t0, sig, gain_db=0.0):
    i = int(t0 * SR);
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i); bus[i:i + n] += sig[:n] * db(gain_db)
def env_ad(n, a, r):
    e = np.ones(n, np.float32); ai = int(a * SR); ri = int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def norm(x, target_db):
    r = np.sqrt(np.mean(x ** 2) + 1e-12); return x * (db(target_db) / r)
tt_ = lambda d: np.arange(int(d * SR)) / SR

# ======================= SYNTHS =======================
def pad(d, freqs, seed=0, bright=1.0, a=2.0, r=2.5):
    t = tt_(d); g = rng(seed); out = np.zeros((len(t), 2))
    for j, f in enumerate(freqs):
        for ch, det in enumerate([-.18, .21]):
            ph = g.uniform(0, 6.28); lfo = 1 + .002 * np.sin(2 * np.pi * (.1 + .03 * j) * t + ph)
            s = np.sin(2 * np.pi * f * lfo * t + ph) + .3 * bright * np.sin(4 * np.pi * f * t + ph * 2) + .12 * bright * np.sin(6 * np.pi * f * t)
            out[:, ch] += s * (.5 + .5 * smooth_env(len(t), seed + j * 7 + ch, .15, .4, 1.0)) / (1 + j * .25)
    out += bp(g.standard_normal((len(t), 2)), 400, 2400) * .05 * bright
    return (out * env_ad(len(t), a, r)[:, None]).astype(np.float32)
def drone(d, f0, seed=0):
    t = tt_(d); g = rng(seed); out = np.zeros((len(t), 2))
    for j, q in enumerate([1, 1.5, 2, 3]):
        for ch in range(2):
            out[:, ch] += np.sin(2 * np.pi * f0 * q * (1 + (ch - .5) * .0015) * t + g.uniform(0, 6)) * (.6 / (1 + j)) * smooth_env(len(t), seed + j + ch * 9, .1, .5, 1)
    return (out * env_ad(len(t), 3, 3)[:, None]).astype(np.float32)
def frame_drum(f0=95, dec=.35, slap=.4, seed=0):
    d = dec * 2.2; t = tt_(d); f = f0 * (1 + .9 * np.exp(-t * 30))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)
    sk = bp(rng(seed).standard_normal(len(t)), 300, 2500) * np.exp(-t * 60) * slap
    return stereo(body + sk, 0, .0004).astype(np.float32)
def flute(notes, seed=0, breath=.12):
    # notes: [(t_rel, dur, freq)] -> bone-flute-ish tone (sine + soft 2nd/3rd harmonics, breath noise, vibrato)
    end = max(a + d for a, d, f in notes) + .6; out = np.zeros(int(end * SR)); g = rng(seed)
    for a, d, f in notes:
        t = tt_(d + .3); vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / .4, 0, 1)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        s = np.sin(ph) + .18 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
        s += bp(g.standard_normal(len(t)), f * .8, min(f * 3, 9000)) * breath
        e = np.clip(t / .08, 0, 1) * np.clip((d + .3 - t) / .3, 0, 1)
        i = int(a * SR); out[i:i + len(t)] += s * e
    return stereo(lp(out, 6000), .1, .006).astype(np.float32)
def pluck(f, d=1.6, seed=0, bright=.5):
    n = int(d * SR); p = int(SR / f); g = rng(seed); buf = g.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = (buf[i % p] + buf[(i + 1) % p]) * .5 * (.996 if bright > .3 else .99)
    return out.astype(np.float32)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
D_PENTA = [62, 65, 67, 69, 72, 74, 77, 79, 81]

def flute_phrase(seed, n=5, base=0):
    g = rng(seed); t = 0; notes = []
    idx = g.integers(2, 6)
    for k in range(n):
        idx = int(np.clip(idx + g.integers(-2, 3), 0, len(D_PENTA) - 1)); d = g.choice([.45, .6, .9, 1.2])
        notes.append((t, d, NOTE(D_PENTA[idx] + base))); t += d + g.choice([0, .05, .15])
    return flute(notes, seed)

# ======================= MUSIC TIMELINE =======================
def sect_pad(t0, t1, chords, seed, level, bright=1.0):
    d = t1 - t0; seg = d / len(chords)
    for k, ch in enumerate(chords):
        add(music, t0 + k * seg, pad(seg + 2.5, [NOTE(m) for m in ch], seed + k, bright, a=1.6, r=2.4), level)
Dm, F, C, Am, Bb, Gm, Dm9 = [50, 57, 62, 65], [53, 57, 60, 65], [48, 55, 60, 64], [45, 52, 57, 60], [46, 53, 58, 62], [43, 50, 55, 58], [50, 57, 64, 65]
# hook: mysterious
add(music, 0.0, drone(36.5, NOTE(38), 1), -6)
add(music, .6, pad(6, [NOTE(74), NOTE(81)], 3, .4, a=.05, r=4), -14)          # time-rip shimmer
for k in range(9): add(music, 26.6 + k * .78, frame_drum(70, .5, .2, k), -4 + k * .6)   # heartbeat under the counter
LAND = tw('fünfzehntausend') + 1.75
add(music, LAND, frame_drum(55, .9, .6, 40), 2)
add(music, S(11) - .2, pad(7, [NOTE(m) for m in [50, 57, 62, 69, 74]], 5, 1.2, a=.4, r=4), -2)   # epic reveal
sect_pad(35.9, 58.2, [Dm, Gm, Dm], 10, -8, .6)
for k, i in enumerate([16, 17, 18]): add(music, S(i) - .05, frame_drum(48, .9, .5, 50 + k), 0)
sect_pad(58.2, 107.7, [Dm9, Am, Dm, F, C], 20, -9, .8)
sect_pad(107.7, 188.5, [F, C, Dm, Bb, F, C, Dm], 30, -9, 1.0)
for k, t0 in enumerate([60.5, 77.5, 92.0, 123.5, 146.0, 167.5, 182.0]): add(music, t0, flute_phrase(100 + k, 5), -10)
# walking / gathering: soft frame drum pattern
sect_pad(188.5, 305.2, [Dm, F, C, Dm, Gm, Am, Dm, F], 40, -10, .8)
for b in np.arange(195.3, 221.8, .66): add(music, b, frame_drum(90, .25, .25, int(b * 10)), -12 + (3 if int((b - 195.3) / .66) % 4 == 0 else 0))
for k, t0 in enumerate([200.0, 238.0, 252.5, 286.0]): add(music, t0, flute_phrase(200 + k, 6), -11)
# hunt: drums build
sect_pad(305.2, 444.5, [Dm, Dm, F, C, Dm, Bb, F, C, Dm, Gm, Dm], 60, -8, 1.1)
def drums(t0, t1, bpm0, bpm1, lvl):
    b = t0
    while b < t1:
        k = (b - t0) / max(t1 - t0, 1e-3); bpm = bpm0 + (bpm1 - bpm0) * k; step = 60 / bpm
        add(music, b, frame_drum(85, .3, .35, int(b * 7)), lvl + (3 if int((b - t0) / step) % 4 == 0 else 0))
        if int((b - t0) / step) % 2 == 1: add(music, b + step / 2, frame_drum(130, .15, .5, int(b * 11)), lvl - 6)
        b += step
drums(305.2, 316.0, 84, 92, -10)
drums(316.4, 342.0, 92, 96, -11)
T_MAM = tw('mammuts', 2)
add(music, T_MAM - 2.6, pad(9, [NOTE(m) for m in [38, 45, 50, 57, 62, 69]], 70, 1.3, a=2.2, r=4), 0)   # mammoths swell
drums(398.0, 407.2, 70, 70, -14); drums(407.5, 416.5, 100, 132, -8)
drums(426.0, 433.2, 110, 124, -8)
add(music, 433.4, pad(7, [NOTE(m) for m in [50, 57, 62, 66]], 75, 1.0, a=.3, r=4), -4)
drums(444.6, 447.8, 80, 80, -14)
# lion: silence, then tension drone, release, "together" swell
add(music, 450.0, drone(15.5, NOTE(37), 77), -6)
add(music, 452.2, frame_drum(40, 1.2, .3, 78), 0)
add(music, 465.6, pad(8, [NOTE(m) for m in [50, 57, 62, 65]], 79, .7, a=.4, r=3), -8)
add(music, 473.0, pad(9, [NOTE(m) for m in [53, 60, 65, 69, 72]], 80, 1.1, a=2, r=3), -4)
# evening: warm
sect_pad(480.3, 574.0, [F, C, Dm, Bb, F, C, Gm, F], 90, -10, .9)
for k, t0 in enumerate([481.0, 512.5, 548.0, 556.5]): add(music, t0, flute_phrase(300 + k, 5), -12)
sect_pad(579.0, 700.5, [Dm, F, C, Dm, Am, Dm, F, C], 120, -11, .7)
for k, t0 in enumerate([594.0, 621.0, 664.0, 676.0]): add(music, t0, flute_phrase(400 + k, 5, -12), -13)
# reflection / montage: emotional
add(music, 700.5, pad(19, [NOTE(m) for m in [50, 57, 62, 65, 69]], 140, 1.0, a=3, r=3), -6)
add(music, 710.7, flute([(0, 1.2, NOTE(74)), (1.3, .8, NOTE(72)), (2.2, 1.6, NOTE(69)), (4.0, .9, NOTE(67)), (5.0, .9, NOTE(69)), (6.0, 2.2, NOTE(65))], 145), -8)
sect_pad(718.7, 756.0, [Dm, Bb, Gm, Dm], 150, -9, .6)
# alarm & morning: light plucks
for k in range(40):
    t0 = 762.2 + k * .5
    if t0 > FILM_END - .6: break
    m = [74, 78, 81, 78, 76, 78, 81, 86][k % 8] - 12
    if k % 2 == 0 or k > 6: add(music, t0, stereo(pluck(NOTE(m), 1.4, k), (k % 3 - 1) * .3), -16 + (2 if k % 4 == 0 else 0))
add(music, 762.2, pad(30, [NOTE(m) for m in [50, 57, 62, 66]], 160, .5, a=2, r=3), -16)
add(music, S(269) - .2, pad(4, [NOTE(m) for m in [49, 56, 61, 64]], 170, .4, a=.6, r=2), -6)  # mysterious note at the cut

# ======================= AMBIENCE =======================
def wind_bed(d, seed, strength=1.0):
    n = int(d * SR); g = rng(seed); out = np.zeros((n, 2))
    for ch in range(2):
        out[:, ch] = lp(bp(g.standard_normal(n), 120, 900), 1100) * smooth_env(n, seed + ch, .25, .3, 1.0)
        for j, fc in enumerate([380, 560, 820]): out[:, ch] += bp(g.standard_normal(n), fc * .93, fc * 1.07) * 1.6 * strength * smooth_env(n, seed * 3 + j + ch, .18, 0, 1) ** 2
    return out.astype(np.float32)
def fire_bed(d, seed, intensity=1.0):
    """softer, more natural fire: low roar + breathy flame noise + muffled pops + rare soft crackles"""
    n = int(d * SR); g = rng(seed)
    roar = lp(g.standard_normal(n), 180) * 1.0 * smooth_env(n, seed + 1, 1.2, .5, 1)
    breath = bp(g.standard_normal(n), 300, 1600) * .25 * smooth_env(n, seed + 2, 2, .3, 1)
    pops = np.zeros(n); t = 0.0
    while True:
        t += g.exponential(1 / (3.5 * intensity))
        if t >= d: break
        i = int(t * SR); L = int(SR * g.uniform(.006, .03)); b = g.standard_normal(L) * np.exp(-np.linspace(0, 5, L)) * g.uniform(.2, 1.0)
        pops[i:i + L] += b[:n - i]
    pops = lp(bp(pops, 250, 3500), 3000) * .9
    m = (roar + breath) * .6 + pops * (.6 + .4 * intensity)
    return stereo(m, .25, .0005).astype(np.float32)
def birds(d, seed):
    n = int(d * SR); out = np.zeros(n); g = rng(seed); t = .3
    while t < d - 1:
        f0 = g.uniform(2600, 4200); k = g.integers(2, 5)
        for j in range(k):
            L = int(SR * g.uniform(.05, .12)); tt = np.arange(L) / SR; f = f0 * (1 + .25 * np.sin(np.pi * tt / tt[-1])) * g.uniform(.9, 1.1)
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / tt[-1]) ** 2
            i = int((t + j * .14) * SR); out[i:i + L] += s[:max(0, n - i)] * .5
        t += g.uniform(1.0, 3.5)
    return stereo(out, g.uniform(-.6, .6), .002).astype(np.float32)
def room_tone(d, seed): n = int(d * SR); return stereo(lp(rng(seed).standard_normal(n), 300) * .3, 0, .001).astype(np.float32)

AMB = [  # (t0, t1, kind, level dB rel. voice, extra)
    (0, .72, 'room', -30), (.72, 33.3, 'fire', -20, .5), (.72, 33.3, 'wind', -26), (7.5, 10.6, 'fire', -15, 1.2),
    (33.1, 36.2, 'wind', -14, 1.6), (35.9, 58.2, 'wind', -22), (58.2, 72.9, 'fire', -21, .6), (58.2, 72.9, 'wind', -24), (72.9, 77.1, 'wind', -13, 1.8),
    (77.0, 89.4, 'fire', -21, .6), (89.4, 95.0, 'wind', -20), (95.0, 104.8, 'fire', -21, .8), (104.7, 107.8, 'wind', -12, 2.0),
    (107.7, 116.0, 'fire', -24, .3), (116.0, 150.2, 'fire', -18, 1.2), (155.6, 165.5, 'fire', -19, 1.0), (165.5, 170.6, 'wind', -24), (165.5, 170.6, 'birds', -28),
    (170.5, 188.5, 'fire', -20, 1.0), (188.5, 251.5, 'wind', -26), (188.5, 251.5, 'birds', -24), (251.4, 305.2, 'wind', -24), (251.4, 305.2, 'birds', -30),
    (305.2, 444.6, 'wind', -22), (444.5, 480.3, 'wind', -25), (480.3, 494.7, 'wind', -26), (494.7, 515.7, 'fire', -18, 1.2), (515.6, 550.2, 'fire', -21, 1.0), (515.6, 550.2, 'wind', -28),
    (550.1, 662.5, 'fire', -20, 1.0), (651.8, 662.5, 'birds', -28), (662.5, 718.7, 'fire', -21, .8), (662.5, 718.7, 'wind', -25), (718.7, 754.0, 'wind', -22),
    (754.0, 758.7, 'fire', -22, .3), (758.7, FILM_END, 'room', -30), (762.0, FILM_END, 'birds', -30),
]
for a in AMB:
    t0, t1, kind, lvl = a[:4]; d = t1 - t0 + 1.2; seed = int(t0 * 13) + 7
    if kind == 'fire': sig = norm(fire_bed(d, seed, a[4] if len(a) > 4 else 1), VDB + lvl)
    elif kind == 'wind': sig = norm(wind_bed(d, seed, a[4] if len(a) > 4 else 1), VDB + lvl)
    elif kind == 'birds': sig = norm(birds(d, seed), VDB + lvl)
    else: sig = norm(room_tone(d, seed), VDB + lvl)
    sig *= env_ad(len(sig), .6, 1.2)[:, None]; add(amb, t0 - .3, sig)

# ======================= SFX (synced) =======================
def whoosh(d=.6, f0=300, f1=2400, seed=0):
    n = int(d * SR); g = rng(seed); x = g.standard_normal(n); out = np.zeros(n); k = 2048
    for s in range(0, n, k):
        u = s / n; fc = f0 + (f1 - f0) * np.sin(u * np.pi / 2); seg_ = x[s:s + k]
        out[s:s + k] = bp(seg_, max(60, fc * .6), min(fc * 1.6, 20000))
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return stereo(out * e, 0, .003).astype(np.float32)
def stone_scrape(d=.5, seed=0):
    n = int(d * SR); g = rng(seed); x = bp(g.standard_normal(n), 200, 1800) * (1 + .6 * np.sign(np.sin(np.arange(n) / SR * 2 * np.pi * 38)))
    return stereo(x * env_ad(n, .05, .3), 0, .002).astype(np.float32)
def thump(f=60, d=.5, seed=0): return frame_drum(f, d * .45, .15, seed)
def klack(seed=0):
    n = int(.25 * SR); g = rng(seed); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 2300 * t) * .6 + np.sin(2 * np.pi * 3700 * t) * .4) * np.exp(-t * 55) + bp(g.standard_normal(n), 1500, 7000) * np.exp(-t * 90) * .8
    return stereo(x, .1, .0003).astype(np.float32)
def crack(seed=0):
    n = int(.4 * SR); g = rng(seed); t = np.arange(n) / SR
    x = bp(g.standard_normal(n), 800, 6000) * np.exp(-t * 25) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 40) * .5
    return stereo(x, 0, .0004).astype(np.float32)
def blow(d=.9, seed=0): n = int(d * SR); return stereo(bp(rng(seed).standard_normal(n), 200, 1400) * np.sin(np.linspace(0, np.pi, n)) ** 2, -.1, .001).astype(np.float32)
def flame_up(seed=0):
    n = int(2.2 * SR); g = rng(seed); t = np.arange(n) / SR
    x = lp(g.standard_normal(n), 900) * np.clip(t / .25, 0, 1) * np.exp(-t * 1.2) * 2 + bp(g.standard_normal(n), 400, 3000) * np.exp(-t * 3)
    return stereo(x, .1, .002).astype(np.float32)
def spark_click(seed=0):
    n = int(.3 * SR); g = rng(seed); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 70) * .7 + hp(g.standard_normal(n), 4000) * np.exp(-t * 30) * .6
    return stereo(x, 0, .0003).astype(np.float32)
def steps(d, rate, kind, seed):
    n = int(d * SR); out = np.zeros(n); g = rng(seed); t = .1
    while t < d - .2:
        L = int(SR * .12); b = g.standard_normal(L) * np.exp(-np.linspace(0, 6, L))
        b = bp(b, 500, 5000) if kind == 'snow' else bp(b, 200, 2500)
        if kind == 'snow': b += hp(g.standard_normal(L), 3000) * np.exp(-np.linspace(0, 9, L)) * .5
        i = int(t * SR); out[i:i + L] += b[:max(0, n - i)] * g.uniform(.6, 1); t += 1 / rate * g.uniform(.9, 1.1)
    return stereo(out, 0, .001).astype(np.float32)
def hooves(d, rate, seed, gallop=1.0):
    n = int(d * SR); out = np.zeros(n); g = rng(seed); t = 0
    while t < d - .1:
        L = int(SR * .06); tt = np.arange(L) / SR; b = (np.sin(2 * np.pi * g.uniform(90, 160) * tt) + bp(g.standard_normal(L), 200, 1800) * .6) * np.exp(-tt * 50)
        i = int(t * SR); out[i:i + L] += b[:max(0, n - i)] * g.uniform(.3, 1); t += g.exponential(1 / rate)
    rumble = lp(g.standard_normal(n), 120) * 1.5 * gallop
    return stereo(out + rumble, 0, .004).astype(np.float32)
def trumpet(seed=0, d=2.4):
    # mammoth call: rising, rough brassy tone + growl
    t = tt_(d); f = 220 + 260 * np.clip(t / .5, 0, 1) - 60 * np.clip((t - 1.4) / 1, 0, 1); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * .4 + np.sin(ph) * .6 + np.sin(2 * ph) * .3
    s = bp(s, 180, 3200) * (1 + .3 * np.sin(2 * np.pi * 31 * t)) + lp(rng(seed).standard_normal(len(t)), 300) * .5
    return stereo(s * env_ad(len(t), .15, .8), .2, .02).astype(np.float32)
def growl(d=1.8, f0=70, seed=0):
    t = tt_(d); g = rng(seed); am = .6 + .4 * np.sin(2 * np.pi * 23 * t + 3 * smooth_env(len(t), seed, 4, -1, 1))
    s = (lp(g.standard_normal(len(t)), 500) * 2 + np.sin(2 * np.pi * f0 * t) * .6) * am
    return stereo(s * env_ad(len(t), .3, .5), -.2, .003).astype(np.float32)
def snort(seed=0): n = int(.7 * SR); t = np.arange(n) / SR; return stereo(bp(rng(seed).standard_normal(n), 150, 1200) * np.exp(-t * 4) * (1 + np.sin(2 * np.pi * 40 * t)), .2, .002).astype(np.float32)
def whinny(seed=0):
    t = tt_(1.4); f = 900 + 500 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 1.2) - 300 * t; ph = 2 * np.pi * np.cumsum(f) / SR
    s = bp(np.sin(ph) + .5 * np.sign(np.sin(ph)), 500, 4000) * env_ad(len(t), .05, .5)
    return stereo(s, .4, .01).astype(np.float32)
def shout(seed=0, n_voices=4):
    out = np.zeros(int(1.4 * SR)); g = rng(seed)
    for k in range(n_voices):
        t = tt_(1.2); f = g.uniform(130, 210) * (1 + .1 * np.sin(2 * np.pi * 3 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
        src = signal.sawtooth(ph) * env_ad(len(t), .05, .4)
        v = bp(src, 500, 900) * 1.2 + bp(src, 1000, 1500) * .8 + bp(src, 2300, 2900) * .4
        i = int(g.uniform(0, .15) * SR); out[i:i + len(v)] += v
    return stereo(out, 0, .006).astype(np.float32)
def sizzle(d, seed): n = int(d * SR); g = rng(seed); x = hp(g.standard_normal(n), 3000) * (.5 + .5 * smooth_env(n, seed, 8, 0, 1)); return stereo(x * env_ad(n, .4, .8), .2, .001).astype(np.float32)
def whimper(seed=0): t = tt_(.9); f = 900 - 300 * t; ph = 2 * np.pi * np.cumsum(f) / SR; return stereo(np.sin(ph) * env_ad(len(t), .1, .4) * (1 + .2 * np.sin(2 * np.pi * 8 * t)), .4, .004).astype(np.float32)
def howl(seed=0, d=3.2, f0=480):
    t = tt_(d); g = rng(seed); f = f0 * (1 + .25 * np.sin(np.pi * np.clip(t / d, 0, 1))) * (1 + .01 * np.sin(2 * np.pi * 5 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .2 * np.sin(2 * ph) + bp(g.standard_normal(len(t)), f0 * .8, f0 * 2) * .05
    return stereo(s * env_ad(len(t), .5, 1.0), g.uniform(-.7, .7), .02).astype(np.float32)
def owl(seed=0): t = tt_(1.4); s = np.zeros(len(t));
def owl(seed=0):
    out = np.zeros(int(1.6 * SR))
    for a, d in [(0, .35), (.55, .25), (.85, .5)]:
        t = tt_(d); s = np.sin(2 * np.pi * 400 * t) * np.sin(np.pi * t / d); i = int(a * SR); out[i:i + len(s)] += s
    return stereo(out, -.5, .01).astype(np.float32)
def beep(): t = tt_(.32); return stereo(signal.square(2 * np.pi * 2600 * t) * .5 * env_ad(len(t), .005, .02), 0, 0).astype(np.float32)
def car(seed=0):
    t = tt_(3.0); g = rng(seed); k = np.exp(-((t - 1.5) / .7) ** 2); s = lp(g.standard_normal(len(t)), 600) * k + np.sin(2 * np.pi * (90 - 20 * (t - 1.5)) * t) * k * .3
    pan = np.clip((t - 1.5) / 1.2, -1, 1); return np.stack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)], 1).astype(np.float32)
def vibrate(d=.8): t = tt_(d); return stereo(np.sin(2 * np.pi * 160 * t) * (np.sin(2 * np.pi * 9 * t) > 0) * .6, 0, 0).astype(np.float32)
def spray(d=1.5, seed=0): n = int(d * SR); return stereo(bp(rng(seed).standard_normal(n), 800, 6000) * np.sin(np.linspace(0, np.pi, n)), 0, .002).astype(np.float32)
def chew(d, seed):
    n = int(d * SR); out = np.zeros(n); g = rng(seed); t = .2
    while t < d - .2:
        L = int(SR * .1); b = bp(g.standard_normal(L), 300, 1500) * np.exp(-np.linspace(0, 4, L)); i = int(t * SR); out[i:i + L] += b; t += .52
    return stereo(out, 0, .001).astype(np.float32)

def put(t0, sig, rel_db): add(fx, t0, norm(sig, VDB + rel_db))
# hook
put(0.0, vibrate(.6), -26); put(.55, whoosh(.9, 200, 5000, 1), -12); put(.7, thump(45, 1.2, 2), -12)
put(T[2]['t0'] + .3, crack(3), -24)
# cards and counters: soft stone scrape + whoosh on entry, low "tok" when a counter lands
CARDS = [tw('fünfzehntausend') - .2, S(13) + .2, S(22) + .3, S(28) - .1, tw('familie') - .3, tw('sapiens') - .4, tw('nadeln') - .2, tw('zehn') - .3, S(73) - .1,
         tw('speerschleuder') - .3, S(105) + 1.2, S(110) + .2, S(112) + .3, S(114) - .1, S(115) + 1.2, tw('hundert', 1, S(117)) - .3, S(119) - .1, S(124) + .4,
         tw('salz') - .3, S(182) + .2, S(197) - .1, S(207) - .1, S(211) + 1.2, S(250) - .1, S(271) - .1, tw('meter', 1, S(120)) - .2, S(127) - .2]
for k, t0 in enumerate(CARDS): put(t0, stone_scrape(.45, k), -20); put(t0 - .1, whoosh(.55, 400, 2600, 10 + k), -19)
for t0 in [LAND, S(28) - .1 + .35 + 1.3, tw('zehn') - .3 + .35 + 1.4, tw('hundert', 1, S(117)) - .3 + 1.55, S(182) + .2 + 1.9, S(197) - .1 + 1.9, S(207) - .1 + 1.65]: put(t0, thump(70, .5, int(t0)), -16)
for t0 in [tw('familie'), tw('team'), tw('versicherung'), tw('krankenhaus'), tw('salz'), tw('soße'), tw('ketchup')]: put(t0, thump(110, .25, int(t0 * 3)), -22)
put(S(213), thump(50, .7, 5), -12)  # MYTHOS stamp
put(tw('dinosaurier') + .2, whoosh(.5, 600, 3000, 77), -16)
for i in [16, 17, 18]: put(S(i) - .05, whoosh(.7, 150, 1200, 80 + i), -14)
# fire scene
for k in range(4): put(S(38) + 1.2 + k * 1.6, blow(.9, 90 + k), -18)
T_ZACK = tw('zack'); put(T_ZACK - .05, flame_up(91), -10)
for k in range(int((S(44) - S(42)) / 1.1)): put(S(42) + k * 1.1, spark_click(92 + k), -16)
put(140.2 - .8, whoosh(.8, 300, 1500, 93), -18)   # cape thrown
put(S(49), whoosh(.4, 2000, 300, 94), -16); put(S(49), norm(stereo(lp(rng(95).standard_normal(int(5.5 * SR)), 200) * 2 + np.sin(2 * np.pi * 55 * tt_(5.5)) * .4), -24), 0)  # U-Bahn rumble
# walking
put(195.3, steps(26, 2.3, 'snow', 96), -22); put(198.9, birds(10, 97), -24)
put(tw('klack', 1), klack(1), -8); put(tw('klack', 2), klack(2), -8); put(S(87) + .5, crack(98), -12)
put(tw('finger') - .15, klack(3), -16); put(tw('finger') - .1, whoosh(.3, 1500, 4000, 99), -20)
put(S(96) + 1.6, whoosh(.9, 300, 2200, 100), -12)   # spear thrower demo
put(S(103), steps(6, 2.2, 'grass', 101), -24)
# animals
put(S(105), hooves(16, 22, 102, 1.2), -14); put(S(110) + .5, whinny(103), -16); put(S(112) + .5, growl(1.2, 50, 104), -18); put(S(112) + 2.4, growl(1.0, 45, 105), -20)
put(T_MAM - .3, trumpet(106), -8); put(T_MAM + 4, trumpet(107, 1.8), -14)
for k in range(10): put(T_MAM - 1 + k * 1.3, thump(32, 1.0, 110 + k), -14)
put(S(119) + .3, snort(111), -14); put(S(121) + .5, snort(112), -16); put(S(121) + 1, whoosh(1.5, 200, 800, 113), -22)
# hunt
T_THROW = tw('wirft'); put(T_THROW - .1, whoosh(1.3, 200, 1800, 114), -10)
put(S(136), hooves(5, 40, 115, 1.6), -11)
put(S(143), steps(5, 3, 'grass', 116), -22)
T_HIT = tw('wurf'); put(T_HIT - .25, whoosh(.9, 300, 2600, 117), -10); put(T_HIT + .55, thump(80, .3, 118), -18)
# lion
put(S(151), stereo(bp(rng(119).standard_normal(int(1.8 * SR)), 1500, 6000) * np.sin(np.linspace(0, np.pi, int(1.8 * SR))), .5, .002), -22)  # bush rustle
put(S(152) - .1, growl(2.4, 60, 120), -10); put(S(154), growl(1.6, 65, 121), -12)
put(S(156) + 1.2, shout(122), -12); put(S(156) + 2.4, shout(123), -13)
# camp
put(S(165) + 1.5, crack(124), -18); put(S(165) + 3.2, crack(125), -18); put(S(167), sizzle(4, 126), -16)
put(S(172) + .8, chew(4, 127), -24)
put(S(178) + .3, whimper(128), -20); put(S(185) + .8, whimper(129), -24)
# flute in the scene (bone flute)
put(S(195), flute([(0, .5, NOTE(74)), (.55, .5, NOTE(77)), (1.1, .9, NOTE(79)), (2.1, .45, NOTE(77)), (2.6, .45, NOTE(74)), (3.1, 1.2, NOTE(72)), (4.4, .5, NOTE(74)), (5.0, 1.4, NOTE(69))], 130, .18), -10)
put(S(202) + 1.4, spray(1.6, 131), -18)
put(S(204) + .5, stereo(bp(rng(132).standard_normal(int(2.4 * SR)), 1200, 5000) * (np.sin(np.arange(int(2.4 * SR)) / SR * 2 * np.pi * 3) > 0) * .5, .2, .001), -24)  # charcoal strokes
put(S(209) + .2, thump(90, .3, 133), -24)
# night
put(670.0, owl(134), -22); put(697.0, owl(135), -24)
HOWL = tw('heulen');
for k in range(3): put(HOWL - .3 + k * .45, howl(136 + k, 3.4, 430 + k * 70), -12 - k * 2)
put(688.8, crack(140), -22); put(689.2, thump(60, .3, 141), -24)
# wake-up
for i in [257, 258, 259]: put(S(i), beep(), -6)
put(S(260), whoosh(.4, 400, 2500, 142), -18)
put(S(264) + .1, car(143), -16)
put(S(265) + .3, vibrate(.7), -24)

# ======================= MIX =======================
duck = lambda d_: (10 ** (-d_ * act / 20))[:, None].astype(np.float32)
# lion silence: music & ambience dip
quiet = np.ones(N, np.float32); a0, a1 = int(447.8 * SR), int(465.4 * SR); quiet[a0:a1] = .35
music_d = music * duck(9) * quiet[:, None]
sp0 = act > .5
gm = db(VDB - 22) / (np.sqrt(np.mean(music_d[sp0] ** 2)) + 1e-9)
music_l = music_d * gm   # music sits ~ -22 dB under the voice while speaking
amb_l = amb * duck(4) * quiet[:, None]
fx_l = fx * duck(3)
mix = V + music_l + amb_l + fx_l
# gentle fade in/out
fi = np.clip(np.arange(N) / (SR * .05), 0, 1); fo = np.clip((N - np.arange(N)) / (SR * 1.0), 0, 1); mix *= (fi * fo)[:, None]
pk = np.abs(mix).max(); print('peak dBFS', round(20 * np.log10(pk), 2))
# soft limiter
mix = np.tanh(mix * 1.05) / np.tanh(1.05) if pk > .95 else mix
def rms_db(x, sel): return round(20 * np.log10(np.sqrt(np.mean(x[sel] ** 2)) + 1e-12), 1)
sp = act > .5
print('voice', rms_db(V, sp), 'music(speech)', rms_db(music_l, sp), 'amb(speech)', rms_db(amb_l, sp), 'fx(speech)', rms_db(fx_l, sp))
w = wave.open('full_mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
print('samples', N, 'dur', N / SR)
