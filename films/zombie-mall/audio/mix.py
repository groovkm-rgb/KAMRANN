#!/usr/bin/env python3
"""Mix VO + synthesized SFX + quiet dark drone for '30 Tage im Einkaufszentrum'.
   python3 audio/mix.py <mp3> <out.wav> [duration]      (times are VIDEO seconds; see timings.js)
SFX are generated with numpy (no samples). Cues: CUES list below + extra section cue files audio/cues_*.py (CUES += [...])."""
import sys, json, re, glob, subprocess, numpy as np
SR = 44100
HERE = __file__.rsplit('/', 1)[0]
TM = json.loads(re.search(r'/\*JSON\*/(.*?)/\*END\*/', open(HERE + '/../timings.js').read(), re.S).group(1))
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=.01, r=.1):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def lp(x, k):  # one-pole low-pass, k in (0,1): smaller = darker
    y = np.empty_like(x); s = 0.
    for i in range(len(x)): s += k * (x[i] - s); y[i] = s
    return y
def lpf(x, hz):  # FFT low-pass (fast)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > hz] *= 0; return np.fft.irfft(X, len(x))
def bpf(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, g=1.): m = np.max(np.abs(x)) or 1; return x / m * g

# ---------------- generators ----------------
def wind(d):
    n = noise(d); x = bpf(n, 80, 900); mod = 0.6 + 0.4 * np.sin(2 * np.pi * t_(d) * .13) * np.sin(2 * np.pi * t_(d) * .07 + 1)
    return norm(x * mod, .9) * env(len(x), 1, 1)
def moan(d=2.2, f0=95):
    tt = t_(d); f = f0 * (1 + .12 * np.sin(2 * np.pi * .7 * tt) - .18 * tt / d) + 3 * np.sin(2 * np.pi * 5 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR; saw = sum(np.sin(k * ph) / k for k in range(1, 18))
    v = bpf(saw, 200, 1400) + .4 * bpf(saw, 500, 900) + .08 * bpf(noise(d), 300, 2000)
    return norm(v * np.hanning(len(v)) ** .6, .8)
def slap():
    d = .18; x = lpf(noise(d), 1800) * np.exp(-t_(d) * 38) + .6 * np.sin(2 * np.pi * 85 * t_(d)) * np.exp(-t_(d) * 25); return norm(x, .9)
def neon_buzz(d):
    tt = t_(d); x = .5 * np.sin(2 * np.pi * 100 * tt) + .3 * np.sign(np.sin(2 * np.pi * 100 * tt)) * .3 + .2 * np.sin(2 * np.pi * 200 * tt); return x * .5
def crackle(d=.15):
    x = noise(d) * (rng.random(int(d * SR)) > .97); return norm(bpf(x, 1500, 9000), .9)
def tick():
    d = .05; return norm(bpf(noise(d), 1500, 6000) * np.exp(-t_(d) * 160), .7)
def typeclick():
    d = .07; return norm(bpf(noise(d), 800, 5000) * np.exp(-t_(d) * 120) + .3 * np.sin(2 * np.pi * 180 * t_(d)) * np.exp(-t_(d) * 60), .8)
def glass_crack():
    d = 1.4; tt = t_(d); hit = bpf(noise(d), 2000, 12000) * np.exp(-tt * 9)
    ting = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * (6 + i)) for i, f in enumerate([2900, 4100, 5300, 6700])) * .25
    crk = np.zeros(len(tt))
    for k in range(40): p = int(rng.random() ** 2 * .9 * SR); seg = crackle(.03); crk[p:p + len(seg)] += seg * (1 - p / len(tt))
    thump = np.sin(2 * np.pi * 60 * tt) * np.exp(-tt * 12)
    return norm(hit + ting + crk * .6 + thump, 1)
def heartbeat():
    d = .9; tt = t_(d); b = lambda o, a: a * np.sin(2 * np.pi * 52 * (tt - o)) * np.exp(-np.clip(tt - o, 0, None) * 22) * (tt > o)
    return norm(b(0, 1) + b(.28, .7), .9)
def whoosh(d=.8, up=True):
    tt = t_(d); x = noise(d); lo = 300 if up else 2500
    out = np.zeros(len(x))
    for i in range(8):
        a, b2 = int(i * len(x) / 8), int((i + 1) * len(x) / 8); fc = lo * (1 + (i / 8 * 6 if up else -i / 8 * .8)); out[a:b2] = bpf(x, fc * .5, fc * 2)[a:b2]
    return norm(out * np.sin(np.pi * tt / d) ** 2, .9)
def tape_rewind(d):
    tt = t_(d); f = 600 + 2400 * (tt / d) ** 1.5 + 80 * np.sin(2 * np.pi * 13 * tt); ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(.4 * np.sin(ph) * (.6 + .4 * np.sin(2 * np.pi * 31 * tt)) + .5 * bpf(noise(d), 2000, 9000), .8) * env(int(d * SR), .05, .2)
def hiss(d): return norm(bpf(noise(d), 3000, 12000), .5)
def drone(d):
    tt = t_(d); x = np.zeros(len(tt))
    for f, a in [(55, 1), (82.4, .6), (110, .4), (65.4, .5), (164.8, .15)]: x += a * np.sin(2 * np.pi * f * tt + 2 * np.sin(2 * np.pi * .05 * tt * f / 55))
    x += .3 * lpf(noise(d), 300) * 3
    return norm(x * (0.75 + .25 * np.sin(2 * np.pi * .08 * tt)), .9)
def mall_ambience(d):
    tt = t_(d); crowd = bpf(noise(d), 300, 3000) * (0.7 + .3 * np.sin(2 * np.pi * .4 * tt))
    chord = sum(np.sin(2 * np.pi * f * tt) for f in [261.6, 329.6, 392, 523.3]) * .08 * (0.5 + .5 * np.sin(2 * np.pi * .5 * tt))
    return norm(crowd * .6 + chord, .7)
def chime():
    d = 1.6; tt = t_(d); return norm(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) for f in [784, 988, 1175]), .7)

GEN = dict(wind=wind, moan=moan, slap=slap, neon=neon_buzz, crackle=crackle, tick=tick, type=typeclick, glass=glass_crack,
           heart=heartbeat, whoosh=whoosh, rewind=tape_rewind, hiss=hiss, mall=mall_ambience, chime=chime)

# ---------------- intro cues (video time) ----------------
S = TM['shots']; CUES = []   # (time, name, gain dB, kwargs, pan -1..1)
CUES += [(0, 'wind', -20, dict(d=S['s4']), 0), (0, 'neon', -30, dict(d=S['s2']), .2)]
for a, b in TM['neon_glitch']: CUES += [(a, 'crackle', -16, {}, .2), (b - .05, 'crackle', -20, {}, .2)]
k = 0
while k * TM['hazard_period'] < S['s3']:
    for o in (0, TM['hazard_period'] / 2): CUES.append((k * TM['hazard_period'] + o, 'tick', -24 if k * TM['hazard_period'] < S['s2'] else -32, {}, -.4))
    k += 1
t0 = TM['type_start']
for line in TM['type_lines']:
    for i, ch in enumerate(line):
        if ch != ' ': CUES.append((t0 + i * TM['type_step'], 'type', -14, {}, -.3))
    t0 += len(line) * TM['type_step'] + TM['type_gap']
for i, tm in enumerate([1.2, 2.4, 3.6, 4.9, 6.1, 9.5, 12.5]): CUES.append((tm, 'moan', -22 - (i % 3) * 2, dict(d=1.8 + (i % 3) * .5, f0=80 + i * 9), (i % 3 - 1) * .5))
for i in range(16): CUES.append((S['s2'] + .2 + i * .27 + (i % 3) * .05, 'slap', -18 - (i % 4) * 2, {}, (i % 5 - 2) * .25))
CUES += [(TM['knack'] - .02, 'glass', -4, {}, 0), (TM['knack'] + .05, 'whoosh', -18, dict(d=.4), 0)]
for i in range(int((TM['silence'][0] - S['s3'] - .3) / .95)): CUES.append((S['s3'] + .3 + i * .95, 'heart', -10 if S['s4'] <= S['s3'] + .3 + i * .95 else -14, {}, 0))
for a, b in TM['torch_flicker']: CUES += [(a, 'crackle', -12, {}, .1), (b, 'crackle', -14, {}, .1)]
CUES += [(S['rewind'], 'hiss', -20, dict(d=S['day'] - S['rewind']), 0), (S['rewind'] + .15, 'rewind', -10, dict(d=S['day'] - S['rewind'] - .2), 0),
         (S['rewind'], 'whoosh', -12, dict(d=.6), 0), (S['day'] - .35, 'whoosh', -10, dict(d=.7, up=False), 0), (S['day'], 'mall', -22, dict(d=TM['duration'] - S['day']), 0), (S['day'] + .05, 'chime', -16, {}, 0)]
for f in sorted(glob.glob(HERE + '/cues_*.py')): exec(open(f).read())

SFX_GAIN = -6.0                      # user: effects a bit too loud
EXTRA = dict(slap=-3, heart=-3, moan=-2)
def main():
    mp3, out = sys.argv[1], sys.argv[2]; D = float(sys.argv[3]) if len(sys.argv) > 3 else TM['duration']; N = int(D * SR)
    mix = np.zeros((N, 2))
    def add(x, t, g, pan=0.):
        a = int(t * SR);
        if a >= N or a + len(x) <= 0: return
        x = x[:N - a] * 10 ** (g / 20); l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2); mix[a:a + len(x), 0] += x * l; mix[a:a + len(x), 1] += x * r
    for t, name, g, kw, pan in CUES:
        if t >= D: continue
        if 'd' in kw: kw = dict(kw, d=max(.05, min(kw['d'], D - t)))
        add(GEN[name](**kw), t, g + SFX_GAIN + EXTRA.get(name, 0), pan)
    # music: dark drone ~ -24 dB under everything, cut for the silent beat (and wherever MUSIC_CUT says), duck at day
    mus = drone(D) * 10 ** (-24 / 20); tt = t_(D); gate = np.ones(N)
    for a, b in [tuple(TM['silence'])] + globals().get('MUSIC_CUT', []): gate[int(a * SR):int(b * SR)] = 0
    gate = np.convolve(gate, np.ones(2205) / 2205, 'same'); mix += (mus * gate)[:, None]
    # silent beat: everything but VO down
    sil = 1 - .9 * ((tt >= TM['silence'][0]) & (tt < TM['silence'][1])); sil = np.convolve(sil, np.ones(4410) / 4410, 'same'); mix *= sil[:, None]
    # VO: offset + inserted gap, cut before the next section if the film is shorter
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', mp3, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    vo = np.frombuffer(raw, np.float32).astype(float); g0 = int(TM['gap_at'] * SR)
    cut = TM.get('vo_cut') if D <= TM['duration'] + .01 else None
    a = vo[:g0]; b = vo[g0:int(cut * SR)] if cut else vo[g0:]
    if cut: b = b * np.concatenate([np.ones(max(0, len(b) - 1323)), np.linspace(1, 0, min(1323, len(b)))])
    voT = np.concatenate([np.zeros(int(TM['vo_offset'] * SR)), a, np.zeros(int(TM['gap'] * SR)), b])[:N]
    # duck SFX/music under the VO
    envv = np.convolve(np.abs(np.pad(voT, (0, N - len(voT)))), np.ones(4410) / 4410, 'same'); duck = 1 - .45 * np.clip(envv / (envv.max() * .25 + 1e-9), 0, 1)
    mix *= duck[:, None]; mix[:len(voT)] += voT[:, None] * 1.0
    mix /= max(1, np.max(np.abs(mix)) / .97)
    import wave
    w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
    print('wrote', out, D, 's')
if __name__ == '__main__': main()
