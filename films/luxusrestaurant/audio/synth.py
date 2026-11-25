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

if __name__ == '__main__':
    render(sys.argv[1])
