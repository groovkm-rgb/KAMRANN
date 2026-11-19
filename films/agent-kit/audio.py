#!/usr/bin/env python3
"""Sound for the agent films: voice (MP3 pieces) + synthesized noir music, ambiences and SFX, ducked under
the voice, mastered to -16 LUFS (ffmpeg loudnorm, 2 passes), muxed onto the silent MP4 as H.264 + AAC.

  python3 audio.py spec.json            spec: see films/agent-taslak/audio.json
Everything is generated with numpy/scipy (no samples), deterministic (fixed seeds).
"""
import json, subprocess, sys, os, re
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
RNG = np.random.default_rng(7)

# ---------------- basics ----------------
def secs(n): return int(round(n * SR))
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)
def white(n): return RNG.standard_normal(n)
def pink(n):
    X = np.fft.rfft(white(n)); f = np.arange(len(X)); f[0] = 1; X /= np.sqrt(f); y = np.fft.irfft(X, n); return y / (np.std(y) + 1e-9)
def brown(n): y = np.cumsum(white(n)); y = hp(y, 20); return y / (np.std(y) + 1e-9)
def env_ad(n, a, d):  # attack/decay seconds, exponential decay
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4)); return e
def fade(x, fi=.01, fo=.01):
    n = len(x); a = min(n, secs(fi)); b = min(n, secs(fo))
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x
def add(buf, x, at, gain=1.0, pan=0.0):
    i = secs(at)
    if i >= buf.shape[1] or i + len(x) <= 0: return
    j0 = max(0, -i); x = x[j0:]; i = max(0, i); x = x[:buf.shape[1] - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(x)] += x * gain * l * 1.414; buf[1, i:i + len(x)] += x * gain * r * 1.414
def db(v): return 10 ** (v / 20)

# ---------------- SFX ----------------
def sfx_vibrate(dur):
    n = secs(dur); t = np.arange(n) / SR
    buzz = np.sign(np.sin(2 * np.pi * 168 * t)) * .6 + np.sin(2 * np.pi * 336 * t) * .3
    buzz = lp(buzz, 900) * (1 + .5 * np.sin(2 * np.pi * 31 * t))
    gate = ((t // .38) % 2 == 0).astype(float); gate = lp(gate, 60)
    rattle = bp(white(n), 1500, 4500) * .25 * (np.sin(2 * np.pi * 42 * t) > .6)
    return fade((buzz + rattle) * gate * .5, .01, .03)
def sfx_rustle(soft=False):
    n = secs(1.1); e = lp(np.abs(white(n)), 6) * 4; e *= env_ad(n, .15, .5)
    return bp(white(n), 900, 5000) * e * (.18 if soft else .35)
def sfx_heart():
    def thump(f0, a):
        n = secs(.22); t = np.arange(n) / SR; f = f0 * (1 + .6 * np.exp(-t * 30)); ph = 2 * np.pi * np.cumsum(f) / SR
        return np.sin(ph) * env_ad(n, .004, .07) * a + lp(white(n), 300) * env_ad(n, .002, .02) * a * .3
    x = np.zeros(secs(.6)); x[:secs(.22)] += thump(58, 1); x[secs(.27):secs(.27) + secs(.22)] += thump(52, .65); return x
def sfx_whoosh(dur=.55, rev=False, soft=False):
    n = secs(dur); t = np.arange(n) / SR; out = np.zeros(n); src = white(n)
    for k, (lo, hi) in enumerate([(200, 600), (500, 1400), (1200, 3500), (2500, 7000)]):
        band = bp(src, lo, hi); w = np.exp(-((t / dur - (.25 + k * .15)) ** 2) / .02); out += band * w
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2; out *= e * (.35 if soft else .6)
    return out[::-1].copy() if rev else out
def sfx_tak():
    n = secs(.05); t = np.arange(n) / SR
    click = hp(white(n), 2500) * np.exp(-t * 400); body = np.sin(2 * np.pi * (1100 + RNG.uniform(-80, 80)) * t) * np.exp(-t * 90) * .5
    thud = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60) * .4
    return (click + body + thud) * RNG.uniform(.7, 1)
def sfx_typerun(dur):
    x = np.zeros(secs(dur + .1)); tt = 0
    while tt < dur: y = sfx_tak(); i = secs(tt); x[i:i + len(y)] += y[:len(x) - i]; tt += RNG.uniform(.055, .09)
    return x
def sfx_stamp():
    n = secs(.35); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 75 * t) * np.exp(-t * 18) * .9 + lp(white(n), 2200) * np.exp(-t * 60) * .6
def sfx_drop():
    n = secs(.6); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (60 + 30 * np.exp(-t * 20)) * t) * np.exp(-t * 12) * .9 + bp(white(n), 300, 3000) * np.exp(-t * 25) * .7
def sfx_paper():
    n = secs(.4); t = np.arange(n) / SR; e = np.sin(np.pi * t / .4) ** 2 * (1 + .6 * lp(white(n), 30))
    return bp(white(n), 1800, 7000) * e * .35
def sfx_strike():
    n = secs(.2); t = np.arange(n) / SR; e = np.sin(np.pi * t / .2) * (1 + .8 * np.sign(np.sin(2 * np.pi * 70 * t)))
    return bp(white(n), 1400, 4200) * e * .3
SFX = {
    'vibrate': lambda c: (sfx_vibrate(c.get('dur', 1)), .55, 0),
    'rustle': lambda c: (sfx_rustle(c.get('soft')), .7, -.2),
    'heart': lambda c: (sfx_heart(), 1.0, 0),
    'whoosh': lambda c: (sfx_whoosh(soft=c.get('soft')), .32, .2),
    'whooshOut': lambda c: (sfx_whoosh(.45, True), .22, .2),
    'typeRun': lambda c: (sfx_typerun(c.get('dur', .5)), .16, .15),
    'typeRow': lambda c: (sfx_typerun(c.get('dur', .4)), .16, .15),
    'stamp': lambda c: (sfx_stamp(), .32, .1),
    'drop': lambda c: (sfx_drop(), .55, 0),
    'paper': lambda c: (sfx_paper(), .4, -.1),
    'strike': lambda c: (sfx_strike(), .22, -.2),
}

# ---------------- ambiences ----------------
def amb(name, dur):
    n = secs(dur); t = np.arange(n) / SR
    if name == 'bedroomRain':   # rain on the window, room tone, far city
        rain = bp(pink(n), 700, 6500) * .05 * (1 + .25 * lp(white(n), 1.5) * 8)
        drops = np.zeros(n); idx = RNG.integers(0, n, int(dur * 14)); drops[idx] = RNG.uniform(.2, 1, len(idx)); drops = bp(lp(drops, 6000), 2000, 6000) * .5
        room = lp(brown(n), 160) * .05; city = bp(brown(n), 60, 400) * .03
        return np.stack([rain + drops + room + city, rain * .9 + np.roll(drops, 300) + room + city])
    if name == 'deskRoom':      # small room, lamp hum, muffled rain
        hum = (np.sin(2 * np.pi * 100 * t) * .006 + np.sin(2 * np.pi * 200 * t) * .003); rain = lp(pink(n), 1200) * .035; room = lp(brown(n), 200) * .04
        m = hum + rain + room; return np.stack([m, m])
    if name == 'streetRain':    # heavy rain, splashes, city rumble
        rain = bp(pink(n), 300, 9000) * .11 * (1 + .2 * lp(white(n), 1) * 8); spl = hp(white(n), 3000) * (lp(np.abs(white(n)), 40) > .9) * .05
        rumble = bp(brown(n), 40, 300) * .06
        return np.stack([rain + spl + rumble, bp(pink(n), 300, 9000) * .11 + rumble])
    return np.zeros((2, n))

# ---------------- music (noir: low piano, string drone, heavy bass) ----------------
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def hz(name):
    m = re.match(r'([A-G][b#]?)(-?\d)', name); return 440 * 2 ** ((NOTE[m[1]] + 12 * (int(m[2]) + 1) - 69) / 12)
def piano(f, dur=3.5, vel=.6):
    n = secs(dur); t = np.arange(n) / SR; x = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + .0004 * k * k);
        if fk > 12000: break
        x += np.sin(2 * np.pi * fk * t + RNG.uniform(0, 6)) * (1 / k ** 1.3) * np.exp(-t * (.7 + k * .45))
    x += lp(white(n), 2000) * np.exp(-t * 80) * .05
    return fade(x * vel * np.minimum(1, t / .004), .001, .2)
def drone(freqs, n, bright=900):
    t = np.arange(n) / SR; x = np.zeros(n)
    for f in freqs:
        for d in (-.12, .0, .13):
            ff = f * 2 ** (d / 12)
            for k in range(1, 9): x += np.sin(2 * np.pi * ff * k * t + RNG.uniform(0, 6)) / k
    x = lp(x, bright) * (1 + .08 * np.sin(2 * np.pi * .23 * t)); return x / (np.max(np.abs(x)) + 1e-9)
def boom(dur=3.0):
    n = secs(dur); t = np.arange(n) / SR; return np.sin(2 * np.pi * (38 + 20 * np.exp(-t * 6)) * t) * np.exp(-t * 1.3) + lp(white(n), 120) * np.exp(-t * 4) * .3
def music(sections, dur):
    """sections: [{at, mood, notes?}] moods: tension | pulse | warm | melancholy | silence"""
    N = secs(dur); out = np.zeros((2, N)); bounds = [s['at'] for s in sections] + [dur]
    for i, s in enumerate(sections):
        a, b = bounds[i], bounds[i + 1]; n = secs(b - a) + secs(1.5); mood = s['mood']
        if mood == 'silence': continue
        chord = {'tension': ['D2', 'A2', 'Eb3'], 'pulse': ['D2', 'A2', 'F3'], 'warm': ['Bb2', 'F3', 'D4'], 'melancholy': ['D2', 'A2', 'F3', 'C4']}[mood]
        d = drone([hz(c) for c in chord], n, 700 if mood != 'warm' else 1300) * (.11 if mood != 'warm' else .09)
        env = np.ones(n); fi = secs(1.2); env[:fi] = np.linspace(0, 1, fi); env[-secs(1.5):] = np.linspace(1, 0, secs(1.5)); d *= env
        add(out, d, a, 1.0, -.3); add(out, np.roll(d, 900), a, 1.0, .3)
        # sparse low piano motif
        motif = s.get('notes') or {'tension': ['D3', 'F3', 'E3', 'A2'], 'pulse': ['D3', 'D3', 'F3', 'E3'], 'warm': ['F3', 'A3', 'Bb3', 'D4', 'C4'], 'melancholy': ['A3', 'F3', 'E3', 'D3']}[mood]
        step = s.get('step', 2.6 if mood != 'warm' else 1.6); tt = a + .4; k = 0
        while tt < b - .5: add(out, piano(hz(motif[k % len(motif)]), 4, .22 if mood != 'warm' else .18), tt, 1, -.15 + .3 * (k % 2)); tt += step; k += 1
        if mood == 'pulse':  # muted bass pulse
            tt = a; per = 60 / s.get('bpm', 92)
            while tt < b: add(out, piano(hz('D1'), .35, .5) * np.exp(-np.arange(secs(.35)) / SR * 8), tt, 1); tt += per
        if s.get('boom'): add(out, boom() * .5, a, 1)
    return out

# ---------------- voice + ducking + master ----------------
def decode(path, a=None, b=None):
    cmd = ['ffmpeg', '-v', 'error']
    if a is not None: cmd += ['-ss', str(a)]
    if b is not None: cmd += ['-to', str(b)] if a is None else ['-t', str(b - a)]
    cmd += ['-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def duck_gain(voice, depth_db=-10, att=.06, rel=.5):
    hop = SR // 100; nfr = len(voice) // hop + 1; pad = np.pad(voice, (0, nfr * hop - len(voice)))
    rms = np.sqrt(np.mean(pad.reshape(nfr, hop) ** 2, axis=1) + 1e-12); lvl = 20 * np.log10(rms)
    act = np.clip((lvl - (np.percentile(lvl, 95) - 30)) / 8, 0, 1)
    g = np.zeros(nfr); ca, cr = np.exp(-.01 / att), np.exp(-.01 / rel); s = 0
    for i in range(nfr): s = (ca if act[i] > s else cr) * s + (1 - (ca if act[i] > s else cr)) * act[i]; g[i] = s
    gain = 1 - (1 - db(depth_db)) * g
    return np.interp(np.arange(len(voice)) / hop, np.arange(nfr), gain)
def main(spec_path):
    S = json.load(open(spec_path)); base = os.path.dirname(os.path.abspath(spec_path)); P = lambda p: os.path.join(base, p)
    dur = S['duration']; N = secs(dur)
    voice = np.zeros(N)
    for v in S['voice']:
        x = fade(decode(P(v['file']), v.get('from'), v.get('to')), .012, .03); i = secs(v['at']); x = x[:N - i]; voice[i:i + len(x)] += x
    cues = json.load(open(P(S['cues'])))
    fx = np.zeros((2, N)); ambb = np.zeros((2, N))
    for c in cues:
        if c['kind'] == 'amb':
            a = amb(c['name'], c['until'] - c['at'] + .6); a[:, :secs(.4)] *= np.linspace(0, 1, secs(.4)); a[:, -secs(.6):] *= np.linspace(1, 0, secs(.6))
            i = secs(c['at']); a = a[:, :N - i]; ambb[:, i:i + a.shape[1]] += a; continue
        if c['kind'] not in SFX: print('unknown cue', c); continue
        x, g, pan = SFX[c['kind']](c); add(fx, x, c['at'], g * c.get('gain', 1), c.get('pan', pan))
    mus = music(S['music'], dur)
    gd = duck_gain(voice, S.get('duck_db', -10))
    vpk = np.max(np.abs(voice)) + 1e-9; voice = voice / vpk * .5
    mix = np.stack([voice, voice]) + (mus * S.get('music_gain', .55) + ambb * S.get('amb_gain', .6)) * gd + fx * S.get('fx_gain', .45) * (.55 + .45 * gd)
    tail = S.get('fade_out', .6); mix[:, -secs(tail):] *= np.linspace(1, 0, secs(tail))
    raw = P(S['out_wav'] + '.raw.wav'); write_wav(raw, mix)
    # loudness: two-pass loudnorm to -16 LUFS
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', af, '-ar', str(SR), P(S['out_wav'])], check=True); os.remove(raw)
    if S.get('video'):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', P(S['video']), '-i', P(S['out_wav']), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', P(S['out_mp4'])], check=True)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', P(S.get('out_mp4') or S['out_wav']), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summ = r[r.rindex('Summary:'):]; print(summ)
def write_wav(path, x):
    x = np.clip(x, -1, 1); pcm = (x.T * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', path], input=pcm, check=True)
if __name__ == '__main__': main(sys.argv[1])
