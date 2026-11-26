# Code-generated music bed + sound effects for the Luxusrestaurant film. The speech MP3 is NEVER processed:
# it is decoded once (48 kHz), the bed is built UNDER it (ducked by the speech envelope) and the two are summed.
import numpy as np, subprocess, json, sys
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)

def decode(path, t0=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(t0), '-i', path] + (['-t', str(dur)] if dur else []) + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)

def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env_ad(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(d, 1e-4))
def norm(x): m = np.max(np.abs(x)); return x / m if m > 0 else x
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def piano(m, dur, vel=1.0):
    f = mtof(m); t = tt(dur + 1.8); y = np.zeros_like(t)
    for n in range(1, 9):
        fn = n * f * np.sqrt(1 + .0004 * n * n)
        if fn > SR / 2.2: break
        y += (1 / n ** 1.4) * np.sin(2 * np.pi * fn * t + n) * np.exp(-t * (1.1 + .55 * n) * (1 + (m - 60) / 60))
    y *= np.minimum(1, t / .004)
    rel = np.ones_like(t); k = int(dur * SR); rel[k:] = np.exp(-(t[k:] - dur) / .35); y *= rel
    y += hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / .006) * .05
    return y * vel

def pad(ms, dur, vel=1.0, bright=.5):
    t = tt(dur); y = np.zeros_like(t)
    for m in ms:
        f = mtof(m)
        for det in (-.12, 0, .12):
            ff = f * 2 ** (det / 12 / 4)
            for n, a in ((1, 1), (2, .35 * bright), (3, .18 * bright), (4, .08 * bright)):
                y += a * np.sin(2 * np.pi * ff * n * t + rng.uniform(0, 6.28))
    a = np.minimum(1, t / min(1.5, dur / 3)) * np.minimum(1, (dur - t) / min(1.5, dur / 3))
    y *= a * (1 + .15 * np.sin(2 * np.pi * .23 * t))
    return y / (len(ms) * 3) * vel

def add(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x), 0] += x * g * np.sqrt((1 - pan) / 2) * 1.414
    buf[i:i + len(x), 1] += x * g * np.sqrt((1 + pan) / 2) * 1.414

# ---------------- sound effects (each normalised to peak 1) ----------------
def sfx_creak(d=1.2):
    t = tt(d); y = np.zeros_like(t); tm = 0.0; i = 0
    while tm < d - .05:
        rate = 55 + 45 * np.sin(tm * 3.1) + 25 * np.sin(tm * 7.3)
        tm += 1 / rate * (0.8 + .4 * rng.random()); k = int(tm * SR)
        if k < len(y): y[k] += .6 + .4 * rng.random()
    res = sum(np.exp(-tt(.03) / .004) * np.sin(2 * np.pi * f * tt(.03)) * a for f, a in ((780, 1), (1450, .6), (2380, .35)))
    y = np.convolve(y, res)[: len(t)] * np.sin(np.pi * np.minimum(1, t / d)) ** .5
    slide = bp(rng.standard_normal(len(t)), 150, 900) * .35 * np.sin(np.pi * t / d)
    return norm(y + slide)

def sfx_scribble(d=1.2, speed=6):
    t = tt(d); n = hp(bp(rng.standard_normal(len(t)), 1800, 6500), 1500)
    am = (0.55 + .45 * np.abs(np.sin(np.pi * speed * t + 2 * np.sin(t * 13)))) * np.minimum(1, t / .05) * np.minimum(1, (d - t) / .08)
    return norm(n * am)

def sfx_thunk():
    t = tt(.6); y = np.sin(2 * np.pi * (95 * np.exp(-t * 3)) * t) * np.exp(-t / .12) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t / .03) * .4
    return norm(y)

def sfx_whoosh(d=.6, lo=300, hi=3500, rev=False):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(t); seg = 1200
    for s in range(0, len(t), seg):
        q = s / len(t); q = 1 - q if rev else q; fc = lo * (hi / lo) ** np.sin(np.pi * q * .5 + (0 if rev else 0))
        out[s:s + seg] = bp(n[max(0, s - 2000):s + seg], fc * .6, min(fc * 1.6, SR / 2.3))[-len(out[s:s + seg]):]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return norm(out * e)

def sfx_clink():
    t = tt(1.4); y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dcy) for f, a, dcy in ((2460, 1, .5), (3930, .6, .35), (5420, .4, .25), (6610, .25, .18)))
    y *= np.minimum(1, t / .001); y += hp(rng.standard_normal(len(t)), 4000) * np.exp(-t / .004) * .3
    return norm(y)

def sfx_register():
    clack = np.zeros(int(.25 * SR))
    for k, at in enumerate((0, .03, .07)):
        i = int(at * SR); n = int(.03 * SR); clack[i:i + n] += hp(rng.standard_normal(n), 1200) * np.exp(-tt(.03) / .006) * (1 - k * .2)
    t = tt(1.6); bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in ((2093, 1, .9), (4186 * 1.003, .45, .6), (5274, .3, .45), (6280, .15, .3)))
    y = np.zeros(int(1.9 * SR)); y[:len(clack)] += clack * .9; i = int(.12 * SR); y[i:i + len(bell)] += bell * .8
    drawer = bp(rng.standard_normal(int(.3 * SR)), 300, 1500) * np.sin(np.pi * tt(.3) / .3) * .25; y[int(.05 * SR):int(.05 * SR) + len(drawer)] += drawer
    return norm(y)

def sfx_tick(f=3100):
    t = tt(.08); return norm(np.sin(2 * np.pi * f * t) * np.exp(-t / .006) + hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / .002) * .5)

def sfx_pop():
    t = tt(.15); return norm(np.sin(2 * np.pi * (600 * np.exp(-t * 18) + 180) * t) * np.exp(-t / .04))

def sfx_stamp():
    t = tt(1.0); y = np.sin(2 * np.pi * (70 * np.exp(-t * 2.2)) * t) * np.exp(-t / .18)
    y += lp(rng.standard_normal(len(t)), 1800) * np.exp(-t / .04) * .7 + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / .01) * .25
    return norm(y)

def sfx_counter(d=.9, rate=26):
    y = np.zeros(int(d * SR)); tk = sfx_tick(4200) * .5; n = int(d * rate)
    for i in range(n):
        k = int(i / rate * SR)
        if k + len(tk) < len(y): y[k:k + len(tk)] += tk * (1 - .5 * i / n)
    return norm(y)

def sfx_room(d):  # soft warm room tone (distant murmur-free air + very faint hum)
    t = tt(d); return norm(lp(rng.standard_normal(len(t)), 400) * .6 + np.sin(2 * np.pi * 50 * t) * .03)

SFX = {'creak': sfx_creak, 'scribble': sfx_scribble, 'thunk': sfx_thunk, 'whoosh': sfx_whoosh, 'clink': sfx_clink, 'register': sfx_register,
       'tick': sfx_tick, 'pop': sfx_pop, 'stamp': sfx_stamp, 'counter': sfx_counter, 'room': sfx_room}

# ---------------- music ----------------
def build_music(total, sections):
    """sections: list of dict(t0, t1, chords=[[midi..], ...], bar, motif=[(beat, midi, len, vel)], bass=True, pulse=0, gain_db)"""
    buf = np.zeros((int(total * SR) + SR * 3, 2))
    for s in sections:
        t0, t1, bar = s['t0'], s['t1'], s.get('bar', 3.4); ch = s['chords']; g = db(s.get('gain_db', 0))
        i = 0; tm = t0
        while tm < t1 - .2:
            c = ch[i % len(ch)]; d = min(bar, t1 - tm)
            add(buf, pad(c, d + 1.2, .9 * g, s.get('bright', .5)), tm, 1)
            if s.get('bass', True): add(buf, piano(c[0] - 12, d * .9, .55 * g), tm, 1, -.2)
            for (beat, m, ln, v) in s.get('motif', []):
                if beat * bar / 4 < d: add(buf, piano(m + (c[0] - ch[0][0] if s.get('follow') else 0), ln * bar / 4, v * g), tm + beat * bar / 4, 1, .25)
            pulse = s.get('pulse', 0)
            if pulse:
                for k in range(int(d / (bar / pulse))):
                    add(buf, piano(c[0] - 12, .12, .45 * g), tm + k * bar / pulse, 1, -.1)
            tm += bar; i += 1
    return buf

def speech_env(sp, att=.03, rel=.45):
    win = int(.02 * SR); e = np.sqrt(np.convolve(sp ** 2, np.ones(win) / win, mode='same'))
    out = np.zeros_like(e); a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR)); y = 0.0
    # decimate for speed, then upsample
    step = 240; ed = e[::step]; od = np.zeros_like(ed); a = np.exp(-step / (att * SR)); r = np.exp(-step / (rel * SR))
    for i, v in enumerate(ed): y = a * y + (1 - a) * v if v > y else r * y + (1 - r) * v; od[i] = y
    return np.interp(np.arange(len(sp)), np.arange(len(od)) * step, od)

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)

def render(spec_path):
    S = json.load(open(spec_path)); total = S['duration']
    sp = decode(S['speech'], 0, S.get('speech_dur'))
    sp = np.concatenate([sp, np.zeros(max(0, int(total * SR) - len(sp)))])[: int(total * SR)]
    act = speech_env(sp); thr = 10 ** (-45 / 20); speaking = act > thr
    sp_rms = rms_db(sp[speaking]) if speaking.any() else -25
    # ---- music
    mus = build_music(total, S['music'])[: len(sp)]
    m_rms = rms_db(mus[:, 0])
    target = sp_rms - S.get('music_below_db', 26)            # level while speech is present (after ducking)
    duck_db = S.get('duck_db', 6)
    base = db(target - m_rms + duck_db)
    sm = np.convolve(speaking.astype(float), np.ones(int(.25 * SR)) / int(.25 * SR), mode='same')
    gain = base * db(-duck_db * np.clip(sm * 1.4, 0, 1))
    for a in S.get('automation', []):   # extra music gain ramps (swell / cut)
        t = np.arange(len(sp)) / SR; k = np.interp(t, a['t'], a['db']); gain = gain * db(k)
    mus = mus * gain[:, None]
    # ---- sfx
    fx = np.zeros_like(mus)
    for c in S['cues']:
        f = SFX[c['fx']]; x = f(**c.get('args', {})); g = db(sp_rms + 3 + c.get('db', -12))  # relative to speech RMS (+3 ≈ peak→rms of fx)
        rep = c.get('every'); n = c.get('n', 1)
        for i in range(n): add(fx, x * (c.get('decay', 1) ** i), c['t'] + (rep or 0) * i, g, c.get('pan', 0))
    bed = mus + fx
    sp2 = np.stack([sp, sp], 1)
    mix = sp2 + bed
    peak = np.max(np.abs(mix))
    if peak > .98: raise SystemExit(f'clip risk {peak}')
    out = S['out']
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=mix.astype(np.float64).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out.replace('.wav', '_bed.wav')], input=bed.astype(np.float64).tobytes(), check=True)
    ms = mus[:, 0] + mus[:, 1]
    print(json.dumps({'speech_rms_db': round(sp_rms, 1), 'music_rms_during_speech_db': round(rms_db(mus[speaking, 0]), 1),
                      'music_rms_in_gaps_db': round(rms_db(mus[~speaking, 0]) if (~speaking).any() else -99, 1), 'peak': round(float(peak), 3)}))


# ======================= more effects for the full film =======================
def _burst(d, lo, hi, tau): t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * np.exp(-t / tau)
def sfx_rain(d=3): t = tt(d); y = lp(rng.standard_normal(len(t)), 3000) * .5; k = rng.integers(0, len(t), int(d * 40)); y[k] += rng.uniform(-1, 1, len(k)) * 2; y = hp(y, 300); return norm(y * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5))
def sfx_page(): t = tt(.45); y = bp(rng.standard_normal(len(t)), 1200, 7000) * np.sin(np.pi * t / .45) ** 2 * (1 + .6 * np.sin(2 * np.pi * 22 * t)); return norm(y)
def sfx_keys():
    y = np.zeros(int(.6 * SR))
    for i in range(7):
        at = rng.uniform(0, .4); x = sum(np.sin(2 * np.pi * f * tt(.25)) * np.exp(-tt(.25) / .05) for f in rng.uniform(3000, 7000, 3)); k = int(at * SR); y[k:k + len(x)] += x[:len(y) - k] * rng.uniform(.4, 1)
    return norm(y)
def sfx_clap1(): return norm(_burst(.12, 700, 3500, .02))
def sfx_rattle(d=6):
    t = tt(d); y = (np.sin(2 * np.pi * 52 * t) + .5 * np.sign(np.sin(2 * np.pi * 104 * t)) * .3) * (1 + .5 * np.sin(2 * np.pi * 9 * t))
    y += bp(rng.standard_normal(len(t)), 200, 1600) * (np.sin(2 * np.pi * 13 * t) > .3) * .6
    return norm(lp(y, 2500) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .4))
def sfx_hiss(d=3): t = tt(d); return norm(hp(rng.standard_normal(len(t)), 3000) * np.sin(np.pi * t / d) * (1 + .3 * np.sin(2 * np.pi * 3 * t)))
def sfx_hammer(): t = tt(.4); return norm(np.sin(2 * np.pi * 180 * t) * np.exp(-t / .05) + _burst(.4, 1500, 6000, .01) * .8)
def sfx_flash(): t = tt(.5); y = _burst(.5, 2000, 8000, .008); y += np.sin(2 * np.pi * (3000 + 4000 * t) * t) * np.exp(-t / .15) * .15; return norm(y)
def sfx_ding(f=1568): t = tt(1.6); return norm(sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / d) for m, a, d in ((1, 1, .9), (2.01, .4, .5), (3.02, .2, .3))) * np.minimum(1, t / .002))
def sfx_jingle():
    y = np.zeros(int(1.4 * SR))
    for i, m in enumerate((72, 76, 79, 84)): x = piano(m, .25, 1); k = int(i * .18 * SR); y[k:k + len(x)] += x[:len(y) - k]
    return norm(y)
def sfx_coin(): y = np.zeros(int(.9 * SR)); x = sfx_ding(2637) * .8; y[:len(x[:len(y)])] += x[:len(y)]; x2 = sfx_ding(3520) * .6; k = int(.09 * SR); y[k:] += x2[:len(y) - k]; return norm(y)
def sfx_pour(d=2): t = tt(d); m = 1 + .8 * np.sin(2 * np.pi * (9 + 4 * np.sin(2 * np.pi * .7 * t)) * t); return norm(bp(rng.standard_normal(len(t)), 300, 1400) * m * np.sin(np.pi * t / d) ** .5)
def sfx_crowd(d=6):
    t = tt(d); y = np.zeros_like(t)
    for f in (300, 450, 700, 1000): y += bp(rng.standard_normal(len(t)), f * .8, f * 1.25) * (1 + .7 * np.sin(2 * np.pi * rng.uniform(1.5, 4) * t + rng.uniform(0, 6)))
    for i in range(int(d * 2)):
        k = int(rng.uniform(0, d - .3) * SR); x = np.sin(2 * np.pi * rng.uniform(250, 420) * tt(.25) * (1 + .3 * tt(.25))) * np.sin(np.pi * tt(.25) / .25) * .8; y[k:k + len(x)] += x
    return norm(y * np.minimum(1, t / .8) * np.minimum(1, (d - t) / .8))
def sfx_buzz(): t = tt(.9); env = ((t % .45) < .3).astype(float); return norm(np.sign(np.sin(2 * np.pi * 150 * t)) * .5 * env * lp(np.ones_like(t), 50) + bp(rng.standard_normal(len(t)), 100, 400) * env * .3)
def sfx_carstart(): t = tt(1.6); f = 40 + 30 * np.minimum(1, t / .8); y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + lp(rng.standard_normal(len(t)), 400) * .5; return norm(lp(y, 900) * np.minimum(1, t / .2) * np.minimum(1, (1.6 - t) / .5))
def sfx_door(): y = np.zeros(int(.8 * SR)); x = sfx_thunk() * .9; y[:len(x[:len(y)])] += x[:len(y)]; c = _burst(.05, 2000, 6000, .006); k = int(.2 * SR); y[k:k + len(c)] += c * .6; return norm(y)
def sfx_typing(d=1.5):
    y = np.zeros(int(d * SR)); tm = 0
    while tm < d - .05: x = _burst(.03, 1500, 6000, .004) * rng.uniform(.5, 1); k = int(tm * SR); y[k:k + len(x)] += x; tm += rng.uniform(.06, .16)
    return norm(y)
def sfx_wind(d=3): t = tt(d); return norm(lp(rng.standard_normal(len(t)), 500) * (1 + .6 * np.sin(2 * np.pi * .4 * t)) * np.sin(np.pi * t / d))
def sfx_shout():  # order bell at the pass: two dings
    y = np.zeros(int(1.6 * SR)); x = sfx_ding(2093); y[:len(x[:len(y)])] += x[:len(y)]; k = int(.22 * SR); y[k:] += x[:len(y) - k] * .9; return norm(y)
def sfx_chair(): t = tt(.6); y = bp(rng.standard_normal(len(t)), 250, 1200) * (1 + np.sign(np.sin(2 * np.pi * 34 * t))) * np.sin(np.pi * t / .6); return norm(y)
def sfx_sizzle(d=3):
    t = tt(d); y = hp(rng.standard_normal(len(t)), 2500) * .5; k = rng.integers(0, len(t) - 400, int(d * 60))
    for i in k: y[i:i + 300] += rng.uniform(-1, 1) * np.exp(-np.arange(300) / 40)
    return norm(y * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .4))
def sfx_mop(d=2.5): t = tt(d); return norm(bp(rng.standard_normal(len(t)), 300, 2500) * (np.sin(2 * np.pi * .9 * t) ** 2))
def sfx_chew(d=2.5): t = tt(d); return norm(lp(rng.standard_normal(len(t)), 300) * (np.sin(2 * np.pi * 2.2 * t) > .6))
def sfx_knife(): t = tt(.5); return norm(bp(rng.standard_normal(len(t)), 2500, 8000) * np.sin(np.pi * t / .5) + np.sin(2 * np.pi * 4200 * t) * np.exp(-t / .2) * .2)
def sfx_ring(): t = tt(1.0); return norm((np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (np.sin(2 * np.pi * 20 * t) > 0) * np.minimum(1, (1 - t) / .05))
def sfx_cheer(d=1.6): y = sfx_crowd(d) * .6; t = tt(d); y += bp(rng.standard_normal(len(t)), 900, 3000) * np.sin(np.pi * t / d) * .7; return norm(y)
def sfx_heart(): y = np.zeros(int(.5 * SR)); x = np.sin(2 * np.pi * 55 * tt(.15)) * np.exp(-tt(.15) / .05); y[:len(x)] += x; k = int(.16 * SR); y[k:k + len(x)] += x * .7; return norm(y)
def sfx_applause(d=8):
    y = np.zeros(int(d * SR)); n = int(d * 90)
    for i in range(n): x = sfx_clap1() * rng.uniform(.3, 1); k = int(rng.uniform(0, d - .15) * SR); y[k:k + len(x)] += x
    t = tt(d); return norm(y * np.minimum(1, t / .4) * np.minimum(1, (d - t) / 1.5))
def sfx_scratch(): t = tt(.5); f = 600 * (1 + np.sin(2 * np.pi * 4 * t)); return norm(bp(rng.standard_normal(len(t)), 300, 2500) * np.sin(np.pi * t / .5) + np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 * np.exp(-t / .3))
def sfx_street(d=10):
    t = tt(d); y = lp(rng.standard_normal(len(t)), 600) * .4
    for i in range(int(d / 4)): w = sfx_whoosh(2.2, 120, 900) * .7; k = int(rng.uniform(0, d - 2.3) * SR); y[k:k + len(w)] += w
    return norm(y * np.minimum(1, t / .8) * np.minimum(1, (d - t) / .8))
SFX.update({'rain': sfx_rain, 'page': sfx_page, 'keys': sfx_keys, 'clap1': sfx_clap1, 'rattle': sfx_rattle, 'hiss': sfx_hiss, 'hammer': sfx_hammer, 'flash': sfx_flash, 'ding': sfx_ding, 'jingle': sfx_jingle,
            'coin': sfx_coin, 'pour': sfx_pour, 'crowd': sfx_crowd, 'buzz': sfx_buzz, 'carstart': sfx_carstart, 'door': sfx_door, 'typing': sfx_typing, 'wind': sfx_wind, 'shout': sfx_shout, 'chair': sfx_chair,
            'sizzle': sfx_sizzle, 'mop': sfx_mop, 'chew': sfx_chew, 'knife': sfx_knife, 'ring': sfx_ring, 'cheer': sfx_cheer, 'heart': sfx_heart, 'applause': sfx_applause, 'scratch': sfx_scratch, 'street': sfx_street})

# mood -> music section parameters (D minor home key; the emotional curve of the story)
MOOD = {
  'curious': dict(bar=3.4, chords=[[50,57,64,65],[46,53,62,65],[48,55,64,67],[45,52,61,64]], motif=[[0,74,.5,.35],[1,77,.5,.3],[2,76,1,.3],[3,72,1,.25]], bright=.4),
  'light':   dict(bar=3.0, chords=[[53,60,64,69],[46,53,62,65],[48,55,64,67],[50,57,62,65]], motif=[[0,72,.5,.3],[.5,76,.5,.28],[1,79,1,.3],[2.5,77,1,.25]], bright=.55),
  'warm':    dict(bar=3.2, chords=[[48,55,64,67],[45,52,60,64],[41,53,57,64],[43,55,59,62]], motif=[[0,76,.5,.3],[1,79,.5,.28],[2,77,.5,.26],[3,74,1,.24]], bright=.5),
  'memory':  dict(bar=3.6, chords=[[53,60,65,69],[50,57,62,65],[46,53,58,62],[48,55,60,64]], motif=[[0,84,.5,.22],[.5,81,.5,.2],[1,77,.5,.2],[2,79,1,.2],[3,76,1,.18]], bright=.35),
  'hope':    dict(bar=3.0, chords=[[43,55,59,62],[50,57,62,66],[52,59,64,67],[48,55,60,64]], motif=[[0,74,.5,.3],[1,78,.5,.3],[2,79,1,.3],[3,81,1,.28]], bright=.6),
  'triumph': dict(bar=2.8, chords=[[50,57,62,66],[45,57,61,64],[47,54,59,62],[43,55,59,62]], motif=[[0,78,.5,.34],[.5,81,.5,.32],[1,86,1,.34],[2.5,83,1,.3]], bright=.75, gain_db=1),
  'dark':    dict(bar=2.9, chords=[[38,50,53,57],[34,46,50,53]], bright=.25, gain_db=-2),
  'dark2':   dict(bar=3.4, chords=[[45,52,57,60],[41,48,53,57],[40,47,52,55]], motif=[[0,57,1,.25],[2,53,1,.2]], bright=.2, gain_db=-2),
  'tension': dict(bar=1.8, chords=[[38,50,57,62],[43,50,55,58],[45,52,57,61]], pulse=8, bright=.45),
  'tension2':dict(bar=1.6, chords=[[40,52,55,59],[36,48,55,60],[47,51,54,59]], pulse=8, bright=.45),
  'swell':   dict(bar=1.3, chords=[[38,50,57,62,65,69]], motif=[[0,74,1,.45],[0,81,1,.35]], bright=.8, gain_db=3),
  'bureau':  dict(bar=2.4, chords=[[48,55,60,64],[43,50,55,59],[45,52,57,60],[41,48,53,57]], pulse=6, motif=[[0,72,.25,.25],[1,71,.25,.22],[2,72,.25,.25],[3,76,.25,.22]], bright=.5),
  'mystery': dict(bar=3.0, chords=[[40,47,52,58],[41,48,53,59],[40,47,52,55]], pulse=4, motif=[[0,64,.5,.22],[1.5,70,.5,.2],[3,67,1,.2]], bright=.3),
  'outro':   dict(bar=3.2, chords=[[41,53,57,60],[48,55,60,64],[50,57,62,65],[46,53,58,62]], motif=[[0,72,.5,.28],[1,76,.5,.26],[2,77,1,.26]], bright=.5),
}
def build_music_moods(total, moods, fade=.8):
    buf = np.zeros((int(total * SR) + SR * 4, 2))
    for m in moods:
        if m['kind'] == 'silence' or m['kind'] not in MOOD: continue
        s = dict(MOOD[m['kind']]); s['t0'] = 0; s['t1'] = m['t1'] - m['t0']
        sec = build_music(s['t1'] + 2, [s])[: int((s['t1'] + 1.6) * SR)]
        n = len(sec); env = np.ones(n); fi = int(fade * SR); fo = int(1.4 * SR)
        env[:fi] = np.linspace(0, 1, fi); cut = int(s['t1'] * SR); env[cut:] = np.exp(-np.arange(n - cut) / (.35 * SR))
        sec *= env[:, None]; i = int(m['t0'] * SR); buf[i:i + n] += sec[: len(buf) - i]
    return buf

def render_full(spec_path):
    S = json.load(open(spec_path)); C = json.load(open(S['cues'])); total = C['duration']
    sp = decode(S['speech']); sp = np.concatenate([sp, np.zeros(max(0, int(total * SR) - len(sp)))])[: int(total * SR)]
    act = speech_env(sp); speaking = act > 10 ** (-45 / 20); sp_rms = rms_db(sp[speaking])
    mus = build_music_moods(total, C['moods'])[: len(sp)]
    m_rms = rms_db(mus[np.abs(mus[:, 0]) > 1e-5, 0]); duck = S.get('duck_db', 6)
    base = db(sp_rms - S.get('music_below_db', 24) - m_rms + duck)
    sm = np.convolve(speaking.astype(float), np.ones(int(.25 * SR)) / int(.25 * SR), mode='same')
    gain = base * db(-duck * np.clip(sm * 1.4, 0, 1))
    t = np.arange(len(sp)) / SR
    for a in S.get('automation', []): gain = gain * db(np.interp(t, a['t'], a['db']))
    mus = mus * gain[:, None]
    fx = np.zeros_like(mus)
    for c in C['cues']:
        try: x = SFX[c['fx']](**c.get('args', {}))
        except Exception as e: print('cue fail', c, e); continue
        g = db(sp_rms + 3 + c.get('db', -14) + S.get('fx_offset_db', 0)); n = c.get('n', 1)
        for i in range(n): add(fx, x * (c.get('decay', 1) ** i), c['t'] + (c.get('every') or 0) * i, g, c.get('pan', 0))
    bed = mus + fx; mix = np.stack([sp, sp], 1) + bed; peak = float(np.max(np.abs(mix)))
    if peak > .98: bed *= .98 / peak; mix = np.stack([sp, sp], 1) + bed; print('bed scaled for headroom')
    out = S['out']
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=mix.astype(np.float64).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out.replace('.wav', '_bed.wav')], input=bed.astype(np.float64).tobytes(), check=True)
    print(json.dumps({'speech_rms_db': round(sp_rms, 1), 'music_rms_during_speech_db': round(rms_db(mus[speaking & (np.abs(mus[:, 0]) > 1e-5), 0]), 1), 'fx_peak_db': round(20 * np.log10(np.max(np.abs(fx)) + 1e-9), 1), 'speech_peak_db': round(20 * np.log10(np.max(np.abs(sp))), 1), 'peak': round(peak, 3), 'samples': len(sp)}))

if __name__ == '__main__':
    (render_full if 'full' in sys.argv[1] else render)(sys.argv[1])
