#!/usr/bin/env python3
"""Mauerfall sound: synthesised SFX + ambience + very quiet music, ducked under the German voice-over, mixed to -16 LUFS.

usage: python3 audio.py events.json voice.mp3 out.wav [--dur 20] [--stems dir]
events.json: {"dur": 20.0, "events": [{"t": 0.35, "type": "shutter", "gain": -6, ...}, ...]}
Every sound is generated from numpy noise/sines (deterministic seed), no samples from elsewhere.
"""
import json, sys, subprocess, wave, os, math
import numpy as np

SR = 44100
rng = np.random.default_rng(1989)

def db(x): return 10 ** (x / 20)
def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr); sus = max(0, n - a - d - r)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sus, s), np.linspace(s, 0, max(r, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))
def expdec(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def bandnoise(n, lo, hi, seed=None):
    g = np.random.default_rng(seed) if seed is not None else rng
    x = g.standard_normal(n); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def tone(n, f, phase=0): return np.sin(2 * np.pi * f * np.arange(n) / SR + phase)
def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))

# ---------------- sound makers (return mono float arrays) ----------------
def s_shutter(p):
    n = int(.22 * SR); y = np.zeros(n)
    for off, g in [(0, 1), (.055, .7)]:
        i = int(off * SR); m = int(.012 * SR); y[i:i + m] += bandnoise(m, 2000, 9000) * expdec(m, .003) * g
        y[i:i + int(.03 * SR)] += tone(int(.03 * SR), 3100) * expdec(int(.03 * SR), .004) * .3 * g
    if p.get('flash', True):  # flash discharge "pop" + faint recharge whine
        m = int(.05 * SR); y[:m] += bandnoise(m, 300, 6000) * expdec(m, .01) * .6
        w = int(.6 * SR); wh = tone(w, 1) * 0; ff = np.linspace(3000, 7000, w); wh = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.linspace(.0, .05, w) * expdec(w, .5)
        y = np.pad(y, (0, w)); y[int(.1 * SR):int(.1 * SR) + w] += wh
    return y
def s_murmur(p):
    n = int(p['dur'] * SR); y = np.zeros(n)
    for v in range(14):  # many talkers: band noise with syllabic amplitude modulation
        f0 = 200 + v * 70; b = bandnoise(n, f0, f0 * 6, seed=v + 10)
        syl = np.abs(np.sin(2 * np.pi * (3.2 + v * .23) * np.arange(n) / SR + v)) ** 3
        phr = (np.sin(2 * np.pi * (.17 + v * .03) * np.arange(n) / SR + v * 2) > -.2).astype(float)
        y += b * syl * lowpass(phr, 4) * (.5 + .5 * rng.random())
    y = lowpass(y, 2500); return y / (np.abs(y).max() + 1e-9)
def s_hum(p):
    n = int(p['dur'] * SR); return (tone(n, 100) * .5 + tone(n, 200) * .25 + bandnoise(n, 3000, 9000) * .05) * .6
def s_paper(p):
    n = int(p.get('dur', .4) * SR); y = bandnoise(n, 1500, 9000)
    cr = np.zeros(n); idx = rng.integers(0, n, int(n / SR * 60)); cr[idx] = rng.random(len(idx)); cr = np.convolve(cr, np.hanning(int(.012 * SR)), 'same')
    return y * (cr * .8 + .15) * env_adsr(n, .03, .05, .9, .08)
def s_pen(p):
    n = int(p.get('dur', 1) * SR); t = np.arange(n) / SR
    strokes = (np.sin(2 * np.pi * 5.5 * t) > 0).astype(float) * (np.sin(2 * np.pi * .9 * t) > -.6)
    return bandnoise(n, 900, 5000) * lowpass(strokes, 30) * .7 * env_adsr(n, .02, .05, 1, .05)
def s_tick(p):
    n = int(.08 * SR); f = 2600 if p.get('tock') is None else 1800
    return (tone(n, f) * .6 + bandnoise(n, 1500, 8000) * .5) * expdec(n, .008)
def s_blip(p):
    n = int(.12 * SR); return (tone(n, 880) + .3 * tone(n, 1760)) * env_adsr(n, .005, .02, .7, .06) * .5
def s_whoosh(p):
    n = int(p.get('dur', .5) * SR); b = bandnoise(n, 200, 8000); fc = np.linspace(400, 6000, n)
    y = np.zeros(n); seg = 1024
    for i in range(0, n, seg): y[i:i + seg] = lowpass(b[i:i + seg], fc[i])[:len(y[i:i + seg])]
    return y * np.sin(np.linspace(0, np.pi, n)) ** 2
def s_cheer(p):
    n = int(p['dur'] * SR); t = np.arange(n) / SR; y = bandnoise(n, 300, 4000, seed=77) * .6
    for v in range(10):  # "woo" voices gliding
        st = rng.random() * max(.1, p['dur'] - 1.5); L = int((.6 + rng.random() * .9) * SR); i = int(st * SR)
        f = (300 + rng.random() * 500) * np.linspace(1, 1.3 + rng.random() * .3, L) * (1 + .02 * np.sin(2 * np.pi * 6 * np.arange(L) / SR))
        w = (np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.sin(np.linspace(0, np.pi, L)) * .25
        y[i:i + L] += w[:len(y[i:i + L])]
    clap = np.zeros(n); idx = rng.integers(0, n, int(p['dur'] * 40)); clap[idx] = 1; y += np.convolve(clap, bandnoise(400, 800, 6000) * expdec(400, .002), 'same') * .5
    sw = p.get('swell', [0, 1]); y *= np.interp(t, np.linspace(0, p['dur'], len(sw)), sw)
    return y / (np.abs(y).max() + 1e-9)
def s_birds(p):
    n = int(p['dur'] * SR); y = np.zeros(n)
    for k in range(int(p['dur'] * 2.5)):
        i = int(rng.random() * (n - SR * .4)); L = int((.05 + rng.random() * .1) * SR); f0 = 3000 + rng.random() * 2500
        f = np.linspace(f0, f0 * (1.2 + rng.random() * .4), L); ch = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, L))
        for r in range(1 + int(rng.random() * 3)): j = i + r * int(.09 * SR); y[j:j + L] += ch[:len(y[j:j + L])] * .3
    return y
def s_clink(p):
    n = int(.35 * SR); y = sum(tone(n, f) * a for f, a in [(2150, 1), (3420, .7), (5230, .5), (7100, .3)]) * expdec(n, .05)
    y += bandnoise(n, 200, 2000) * expdec(n, .015) * .8; return y
def s_pop(p):  # champagne cork + fizz
    n = int(1.2 * SR); y = np.zeros(n); m = int(.03 * SR); y[:m] = (bandnoise(m, 200, 3000) + tone(m, 500)) * expdec(m, .006)
    y[m:] += bandnoise(n - m, 4000, 12000) * expdec(n - m, .4) * .25; return y
def s_marker(p):
    n = int(p.get('dur', 1) * SR); t = np.arange(n) / SR; strokes = lowpass((np.sin(2 * np.pi * 3 * t) > -.3).astype(float), 25)
    squeak = np.sin(2 * np.pi * np.cumsum(1100 + 200 * np.sin(2 * np.pi * 7 * t)) / SR) * .25
    return (bandnoise(n, 1200, 6000) * .6 + squeak) * strokes * env_adsr(n, .02, .05, 1, .05)
def s_tvoff(p):
    n = int(.6 * SR); y = np.zeros(n); m = int(.02 * SR); y[:m] = bandnoise(m, 100, 4000) * expdec(m, .004) * 1.2
    f = np.linspace(9000, 300, n); y += np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(n, .18) * .25 + tone(n, 50) * expdec(n, .08) * .5
    return y
def s_music(p):
    # very soft piano arpeggio (F – Am – Dm – C) over a string pad
    n = int(p['dur'] * SR); y = np.zeros(n); t = np.arange(n) / SR
    chords = [[53, 57, 60, 65], [57, 60, 64, 69], [50, 57, 62, 65], [48, 55, 60, 64]]
    beat = .42
    for k in range(int(p['dur'] / beat)):
        ch = chords[(k // 4) % 4]; mn = ch[k % 4] + 12; f = 440 * 2 ** ((mn - 69) / 12); i = int(k * beat * SR); L = min(int(2.5 * SR), n - i)
        if L <= 0: break
        nt = sum(tone(L, f * h) / h ** 1.6 for h in (1, 2, 3, 4)) * expdec(L, .7) * env_adsr(L, .004, .1, .8, .3)
        y[i:i + L] += nt * .35
    for k, ch in enumerate(chords * 4):
        i = int(k * beat * 4 * SR); L = min(int(beat * 4 * SR), n - i)
        if L <= 0: break
        pad = sum(np.sin(2 * np.pi * np.cumsum(np.full(L, 440 * 2 ** ((m - 69) / 12) * (1 + d))) / SR) for m in ch for d in (-.003, .003))
        y[i:i + L] += lowpass(pad, 1500) * env_adsr(L, .5, .2, .8, .5) * .06
    return y * env_adsr(n, 1.0, .1, 1, 1.2)
MAKERS = dict(shutter=s_shutter, murmur=s_murmur, hum=s_hum, paper=s_paper, pen=s_pen, tick=s_tick, blip=s_blip, whoosh=s_whoosh, cheer=s_cheer,
              birds=s_birds, clink=s_clink, pop=s_pop, marker=s_marker, tvoff=s_tvoff, music=s_music)

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def read_voice(path, dur):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-t', str(dur), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32).astype(np.float64); return np.pad(v, (0, max(0, int(dur * SR) - len(v))))[:int(dur * SR)]
def speech_env(v):
    w = int(.05 * SR); e = np.convolve(np.abs(v), np.ones(w) / w, 'same'); th = np.percentile(e, 60) * .5
    act = (e > th).astype(float)[::32]; out = np.zeros_like(act); a, r = 1 - np.exp(-32 / (.04 * SR)), 1 - np.exp(-32 / (.3 * SR)); cur = 0.0
    for i, x in enumerate(act): cur += (a if x > cur else r) * (x - cur); out[i] = cur
    return np.pad(np.repeat(out, 32), (0, len(v)))[:len(v)]
def main():
    ev_path, voice_path, out = sys.argv[1:4]; args = sys.argv[4:]
    spec = json.load(open(ev_path)); dur = spec['dur']; n = int(dur * SR)
    stems = args[args.index('--stems') + 1] if '--stems' in args else None
    fx, mus = np.zeros(n + SR * 2), np.zeros(n + SR * 2)
    for e in spec['events']:
        y = MAKERS[e['type']](e) * db(e.get('gain', 0)); i = int(e['t'] * SR)
        if e.get('fadein'): y[:int(e['fadein'] * SR)] *= np.linspace(0, 1, int(e['fadein'] * SR))
        if e.get('fadeout'): m = int(e['fadeout'] * SR); y[-m:] *= np.linspace(1, 0, m)
        bus = mus if e['type'] == 'music' else fx; L = min(len(y), len(bus) - i); bus[i:i + L] += y[:L]
    fx, mus = fx[:n], mus[:n]
    v = read_voice(voice_path, dur)
    if spec.get('voiceFadeOut'): m = int(spec['voiceFadeOut'] * SR); v[-m:] *= np.linspace(1, 0, m)
    env = speech_env(v)
    # levels: voice reference; effects -10 dB under the voice while it speaks; music >= 26 dB below the voice
    vr = rms_db(v[env > .5]) if (env > .5).any() else rms_db(v)
    fx *= db(vr - rms_db(fx[fx != 0]) - 6) if np.any(fx) else 1
    fx *= db(-10) ** env  # ducking
    mus *= db(vr - 26 - (rms_db(mus[np.abs(mus) > 1e-6]) if np.any(mus) else 0)) if np.any(mus) else 1
    mus *= db(-6) ** env
    mix = v + fx + mus
    if stems:
        os.makedirs(stems, exist_ok=True)
        for name, x in [('voice', v), ('fx', fx), ('music', mus)]: write_wav(os.path.join(stems, name + '.wav'), x)
    tmp = out + '.pre.wav'; write_wav(tmp, mix / (np.abs(mix).max() + 1e-9) * .5)
    # two-pass loudnorm to -16 LUFS
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', str(SR), out], check=True); os.remove(tmp)
    print('music vs voice (dB):', round(rms_db(mus[np.abs(mus) > 1e-6]) - vr, 1) if np.any(mus) else None)
def write_wav(path, x):
    x = np.clip(x, -1, 1); w = wave.open(path, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes()); w.close()
if __name__ == '__main__': main()
