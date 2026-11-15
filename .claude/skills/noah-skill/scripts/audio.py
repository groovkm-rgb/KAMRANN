#!/usr/bin/env python3
"""NOAH audio: synthesizes a music bed (mood-based, deterministic) + sound effects from the cue list a
film exports (window.__film.audio, written to JSON by render_mp4.mjs). No speech, ever.
Usage: python3 audio.py cues.json out.wav
JSON: { "duration": 12.0, "fadeOut": 0.6, "music": {"mood": "quirky", "gain": 1, "seed": 3, "bpm": null, "key": null},
        "sections": [{"t": 0, "mood": "sleepy"}, ...], "cues": [{"t": 1.2, "name": "sip", "gain": 1, "dur": 0.5}, ...] }"""
import json, sys, wave
import numpy as np

SR = 44100
spec = json.load(open(sys.argv[1]))
DUR = float(spec["duration"]); N = int(DUR * SR) + 1
MUS = spec.get("music") or {}
SEED = int(MUS.get("seed", 3))
rng = np.random.default_rng(SEED)

# ============================================================== DSP helpers
def T(d): return np.arange(int(d * SR)) / SR
def noise(d, seed=None):
    r = rng if seed is None else np.random.default_rng(seed)
    return r.standard_normal(int(d * SR)).astype(np.float32)
def fft_filter(x, lo=None, hi=None, order=4):
    if len(x) < 4: return x
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
lp = lambda x, c: fft_filter(x, hi=c)
hp = lambda x, c: fft_filter(x, lo=c)
bp = lambda x, a, b: fft_filter(x, lo=a, hi=b)
def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR; dur = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    rel = np.clip((dur - t) / max(r, 1e-4), 0, 1); return (e * rel).astype(np.float32)
def perc(n, a=0.002, k=8.0):
    t = np.arange(n) / SR; return (np.minimum(1, t / a) * np.exp(-t * k)).astype(np.float32)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR));
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain

# ============================================================== instruments
def ks(f, d, damp=0.996, bright=0.5, seed=1):
    """Karplus-Strong plucked string (vectorized one period at a time)."""
    n = int(d * SR); p = max(2, int(SR / f)); out = np.zeros(n + p, np.float32)
    buf = np.random.default_rng(seed).uniform(-1, 1, p).astype(np.float32)
    buf = buf * bright + np.convolve(buf, np.ones(3) / 3, 'same') * (1 - bright)
    out[:p] = buf; k = p
    while k < n:
        prev = out[k - p:k]; nxt = damp * 0.5 * (prev + np.roll(prev, 1)); m = min(p, n - k); out[k:k + m] = nxt[:m]; k += p
    return out[:n] * perc(n, 0.001, 1.2)
def pluck(f, d=0.5, bright=0.6, seed=1): return ks(f, d, 0.995, bright, seed)
def pizz(f, d=0.25): s = ks(f, d, 0.985, 0.3, int(f)); return lp(s * perc(len(s), 0.001, 9), 3000)
def bell(f, d=1.2, bright=1.0):
    t = T(d); s = np.zeros_like(t)
    for ratio, amp, k in [(1, 1, 3), (2.76, 0.4 * bright, 6), (5.4, 0.2 * bright, 9), (8.93, 0.1 * bright, 12)]: s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * k)
    return (s * np.minimum(1, t / 0.002)).astype(np.float32) * 0.5
def piano(f, d=1.0):
    t = T(d); s = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t * (1 + 0.0004 * k)) for k in range(6))
    return (s * np.minimum(1, t / 0.003) * np.exp(-t * (1.6 + f / 900))).astype(np.float32) * 0.45
def reed(f, d=0.4, vib=0.004, bright=7, stac=False):
    t = T(d); ph = 2 * np.pi * f * t + vib * f / 5 * np.sin(2 * np.pi * 5.2 * t)
    s = sum(np.sin((2 * k + 1) * ph) / (2 * k + 1) ** 1.1 for k in range(bright))
    e = adsr(len(t), 0.02, 0.05, 0.75, 0.06 if stac else 0.12)
    return lp((s * e).astype(np.float32), 2600) * 0.5
def whistle(f, d=0.4):
    t = T(d); ph = 2 * np.pi * f * t + 0.012 * f / 6 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.15)
    s = np.sin(ph) + 0.06 * bp(noise(d), f * 0.8, f * 1.3)
    return (s * adsr(len(t), 0.03, 0.05, 0.8, 0.08)).astype(np.float32) * 0.5
def pad(fs, d, bright=1400, att=0.4):
    t = T(d); s = np.zeros_like(t)
    for f in fs:
        for det in (-0.004, 0, 0.005):
            ph = (f * (1 + det) * t + rng.random()) % 1; s += 2 * ph - 1
    s = lp(s.astype(np.float32), bright) / (3 * len(fs)); return s * adsr(len(t), att, 0.2, 0.85, min(0.6, d * 0.4))
def accordion(fs, d):
    t = T(d); s = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * 1.003 * t) for f in fs)
    s = lp(s.astype(np.float32), 1800) * (0.85 + 0.15 * np.sin(2 * np.pi * 5.5 * t)) / len(fs)
    return s * adsr(len(t), 0.05, 0.1, 0.8, 0.1) * 0.35
def bass(f, d=0.4, k=4):
    t = T(d); s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return (s * np.minimum(1, t / 0.004) * np.exp(-t * k)).astype(np.float32) * 0.7
def kick():
    t = T(0.35); f = 48 + 100 * np.exp(-t * 32); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)).astype(np.float32)
def snare(brush=False):
    t = T(0.22); n = noise(0.22, 11)
    s = (hp(n, 1500) * np.exp(-t * (14 if brush else 24)) * (0.5 if brush else 0.8)) + (0 if brush else np.sin(2 * np.pi * 185 * t) * np.exp(-t * 22) * 0.5)
    return s.astype(np.float32)
def hat(open_=False): t = T(0.3 if open_ else 0.06); return (hp(noise(len(t) / SR, 12), 7000) * np.exp(-t * (12 if open_ else 70)) * 0.4).astype(np.float32)
def shaker(): t = T(0.09); return (bp(noise(0.09, 13), 4000, 11000) * np.sin(np.pi * t / 0.09) ** 2 * 0.35).astype(np.float32)
def clap():
    t = T(0.25); s = np.zeros_like(t)
    for k, dt in enumerate((0, 0.011, 0.022)): i = int(dt * SR); s[i:] += np.exp(-t[: len(t) - i] * (60 if k < 2 else 16))
    return (bp(noise(0.25, 14), 900, 5000) * s * 0.5).astype(np.float32)
def tom(f=110): t = T(0.4); ff = f * (1 + 0.5 * np.exp(-t * 20)); return (np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 7)).astype(np.float32)
def darbuka(kind):
    if kind == 'dum': return tom(90) * 1.2
    t = T(0.12); return (np.sin(2 * np.pi * 420 * t) * np.exp(-t * 40) * 0.5 + hp(noise(0.12, 15), 2000) * np.exp(-t * 50) * 0.4).astype(np.float32)

# ============================================================== composition
SCALES = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'hicaz': [0, 1, 4, 5, 7, 8, 10], 'dorian': [0, 2, 3, 5, 7, 9, 10]}
MOODS = {
    #           scale     bpm  root  progression (scale degrees, 0-based)     instruments
    'quirky':  ('major',  112, 60, [0, 5, 3, 4]),
    'cozy':    ('major',   88, 57, [0, 3, 5, 4]),
    'folk':    ('hicaz',   98, 62, [0, 0, 6, 0]),
    'sleepy':  ('major',   64, 65, [0, 2, 3, 3]),
    'dreamy':  ('major',   72, 63, [0, 3, 0, 4]),
    'mystery': ('minor',   96, 57, [0, 5, 3, 4]),
    'tense':   ('minor',  124, 52, [0, 0, 5, 4]),
    'sad':     ('minor',   68, 57, [0, 5, 2, 6]),
    'happy':   ('major',  122, 62, [0, 4, 5, 3]),
    'epic':    ('minor',   92, 50, [0, 5, 2, 6]),
}
def chord(scale, root, deg, octave=0):
    sc = SCALES[scale]; return [root + 12 * octave + sc[(deg + k) % 7] + 12 * ((deg + k) // 7) for k in (0, 2, 4)]
def note_of(scale, root, deg):
    sc = SCALES[scale]; return root + sc[deg % 7] + 12 * (deg // 7)
def compose(mood, dur, seed):
    """returns a numpy buffer of `dur` seconds for one mood"""
    scale, bpm, root, prog = MOODS.get(mood, MOODS['quirky'])
    if MUS.get('bpm') and len(spec.get('sections', [])) <= 1: bpm = MUS['bpm']
    if MUS.get('key') is not None and len(spec.get('sections', [])) <= 1: root = int(MUS['key'])
    r = np.random.default_rng(seed); beat = 60 / bpm; bar = beat * 4; n = int((dur + 2) * SR); buf = np.zeros(n, np.float32)
    # a 2-bar motif in scale degrees (relative to the chord root), reused A A B A
    def motif():
        RH = [[0, 1, 1.5, 2, 3], [0, 0.5, 1, 2, 2.5, 3], [0, 1, 2, 2.5, 3.5], [0, 1.5, 2, 3]]; rhythm = RH[int(r.integers(len(RH)))]
        degs = [0]; [degs.append(degs[-1] + int(r.choice([-2, -1, 1, 1, 2, 0]))) for _ in rhythm[1:]]
        return list(zip(rhythm, degs))
    A, B = motif(), motif()
    nb = int(dur / bar) + 2
    for b in range(nb):
        t0 = b * bar; deg = prog[b % len(prog)]; ch = chord(scale, root, deg); phrase = [A, A, B, A][(b // 1) % 4]
        if mood == 'quirky':
            for k in range(4):
                tb = t0 + k * beat
                if k % 2 == 0: place(buf, pizz(midi(ch[0] - 12 if k == 0 else ch[2] - 24), 0.3), tb, 0.9)
                else: [place(buf, pizz(midi(m), 0.18), tb, 0.35) for m in ch]
                place(buf, shaker(), tb + beat / 2, 0.5)
            for (pos, dd) in phrase:
                m = note_of(scale, root + 12, deg + dd); place(buf, reed(midi(m - 12), beat * 0.42, stac=True), t0 + pos * beat, 0.42)
                if b % 2: place(buf, bell(midi(m + 12), 0.6, 0.6), t0 + pos * beat, 0.1)
        elif mood == 'cozy':
            place(buf, accordion([midi(m) for m in ch], bar * 0.98), t0, 0.35)
            for k in range(8): place(buf, pluck(midi([ch[0] - 12, ch[1], ch[2], ch[1] + 12][k % 4]), 0.6, 0.5, k + b), t0 + k * beat / 2, 0.42)
            place(buf, bass(midi(ch[0] - 24), beat * 1.8), t0, 0.6); place(buf, bass(midi(ch[2] - 24), beat * 1.8), t0 + 2 * beat, 0.45)
            for k in (1, 3): place(buf, snare(True), t0 + k * beat, 0.35)
            if b % 4 in (1, 2):
                for (pos, dd) in phrase: place(buf, whistle(midi(note_of(scale, root + 12, deg + dd)), beat * 0.8), t0 + pos * beat, 0.22)
        elif mood == 'folk':
            dr = root - 12; place(buf, pad([midi(dr), midi(dr + 7)], bar, 900, 0.1), t0, 0.35)
            for k, kind in enumerate(['dum', 'tek', 'tek', 'dum', 'tek', 'tek', 'tek', None]):
                if kind: place(buf, darbuka(kind), t0 + k * beat / 2, 0.5)
            for (pos, dd) in phrase:
                m = note_of(scale, root, deg + dd + 4); tt = t0 + pos * beat
                place(buf, pluck(midi(m), 0.5, 0.75, int(m)), tt, 0.5)
                if r.random() < 0.4: place(buf, pluck(midi(note_of(scale, root, deg + dd + 5)), 0.2, 0.75, 3), tt - 0.06, 0.25)  # ornament
        elif mood in ('sleepy', 'dreamy'):
            place(buf, pad([midi(m) for m in ch], bar * 1.02, 1000, 0.8), t0, 0.45)
            for k in range(8): place(buf, bell(midi([ch[0], ch[1], ch[2], ch[1]][k % 4] + 12), 1.4, 0.5), t0 + k * beat / 2, 0.22)
            place(buf, bass(midi(ch[0] - 24), bar, 1.2), t0, 0.35)
        elif mood == 'mystery':
            place(buf, pad([midi(m - 12) for m in ch], bar, 700, 0.5), t0, 0.3)
            for k in range(8): place(buf, pizz(midi([ch[0], ch[2], ch[1] + 12, ch[2]][k % 4] - 12), 0.2), t0 + k * beat / 2, 0.45)
            place(buf, bass(midi(ch[0] - 24), beat * 2, 2), t0, 0.6)
            for k in range(4): place(buf, hat(), t0 + k * beat + beat / 2, 0.4)
            if b % 2: place(buf, bell(midi(note_of(scale, root + 12, deg + phrase[0][1])), 1.2, 0.8), t0 + 2 * beat, 0.16)
        elif mood == 'tense':
            place(buf, pad([midi(m) for m in ch], bar, 1200, 0.2), t0, 0.28)
            for k in range(8): place(buf, bass(midi(ch[0] - 24), beat * 0.45, 8), t0 + k * beat / 2, 0.55)
            for k in range(16): place(buf, hat(), t0 + k * beat / 4, 0.25 + 0.15 * (k % 2 == 0))
            for k in (0, 2): place(buf, kick(), t0 + k * beat, 0.7)
            place(buf, snare(), t0 + 3 * beat, 0.3)
        elif mood == 'sad':
            place(buf, pad([midi(m) for m in ch], bar, 900, 0.6), t0, 0.35)
            for k in range(4): place(buf, piano(midi([ch[0], ch[1], ch[2], ch[1]][k] ), 1.6), t0 + k * beat, 0.4)
            place(buf, piano(midi(ch[0] - 12), bar), t0, 0.4)
            for (pos, dd) in phrase[:3]: place(buf, piano(midi(note_of(scale, root + 12, deg + dd)), 1.5), t0 + pos * beat, 0.3)
        elif mood == 'happy':
            for k in range(8): [place(buf, pluck(midi(m), 0.3, 0.8, k + i), t0 + k * beat / 2 + i * 0.008, 0.22 * (1 if k % 2 == 0 else 0.6)) for i, m in enumerate(ch)]
            for k in range(4): place(buf, kick() if k % 2 == 0 else clap(), t0 + k * beat, 0.6 if k % 2 == 0 else 0.45)
            place(buf, bass(midi(ch[0] - 24), beat * 0.9), t0, 0.6); place(buf, bass(midi(ch[0] - 24), beat * 0.9), t0 + 2.5 * beat, 0.5)
            for (pos, dd) in phrase: place(buf, whistle(midi(note_of(scale, root + 12, deg + dd)), beat * 0.6), t0 + pos * beat, 0.28)
        elif mood == 'epic':
            place(buf, pad([midi(m - 12) for m in ch] + [midi(ch[0])], bar, 1600, 0.3), t0, 0.5)
            for k, a in [(0, 1), (1.5, 0.7), (2, 0.9), (3, 0.7), (3.5, 0.6)]: place(buf, tom(70 if k in (0, 2) else 100), t0 + k * beat, a * 0.7)
            place(buf, bass(midi(ch[0] - 24), bar, 1.5), t0, 0.6)
    # gentle bus processing
    buf = lp(buf, 9000)
    pk = np.max(np.abs(buf)) or 1; buf = np.tanh(buf / pk * 1.3) / np.tanh(1.3)
    return buf[: int(dur * SR)]

# ============================================================== sound effects
def sfx_step(surface='wood', seed=0):
    t = T(0.16)
    if surface == 'snow': return (bp(noise(0.16, seed), 800, 5000) * np.sin(np.pi * t / 0.16) ** 0.6 * (0.6 + 0.4 * np.random.default_rng(seed).random(len(t))) * 0.9).astype(np.float32)
    if surface == 'grass': return (bp(noise(0.16, seed), 1500, 8000) * np.sin(np.pi * t / 0.16) * 0.4).astype(np.float32)
    if surface == 'street': return (bp(noise(0.08, seed), 1500, 6000) * np.exp(-T(0.08) * 50) * 0.8).astype(np.float32)
    return (lp(noise(0.16, seed), 700) * np.exp(-t * 40) * 1.6 + np.sin(2 * np.pi * 95 * t) * np.exp(-t * 35) * 0.5).astype(np.float32)
def sfx_whoosh(d=0.5): t = T(d); return (bp(noise(d), 300, 2500) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def sfx_swish(): return sfx_whoosh(0.25) * 1.2
def slide(f0, f1, d, shape=np.sin):
    t = T(d); f = f0 * (f1 / f0) ** (t / d); return (shape(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.01, 0.05, 0.8, 0.05)).astype(np.float32)
def sfx_pop(): t = T(0.12); f = 400 + 900 * np.exp(-t * 60); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35) * 0.8).astype(np.float32)
def sfx_boing(): t = T(0.6); f = 180 * (1 + 0.5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.7).astype(np.float32)
def sfx_ding(): return bell(midi(88), 1.5) * 1.2
def sfx_sparkle():
    out = np.zeros(int(1.0 * SR), np.float32)
    for k, m in enumerate([84, 88, 91, 96, 100]): place(out, bell(midi(m), 0.6), k * 0.06, 0.5)
    return out
def sfx_tick(hi=True): t = T(0.03); return (bp(noise(0.03, 3), 2000, 8000) * np.exp(-t * 200) + np.sin(2 * np.pi * (3200 if hi else 2400) * t) * np.exp(-t * 300) * 0.5).astype(np.float32)
def sfx_ticks(d=2.0, rate=2.0):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * rate)): place(out, sfx_tick(k % 2 == 0), k / rate, 0.7)
    return out
def sfx_alarm(d=1.5):
    t = T(d); s = np.sin(2 * np.pi * 2600 * t) * (np.sin(2 * np.pi * 28 * t) > 0) * ((t % 0.5) < 0.35)
    return (s * 0.35).astype(np.float32)
def sfx_sip(): t = T(0.35); return (bp(noise(0.35, 4), 1500, 6000) * np.sin(np.pi * t / 0.35) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)) * 0.45).astype(np.float32)
def sfx_gulp(): t = T(0.18); f = 300 - 150 * t / 0.18; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.18) * 0.6).astype(np.float32)
def sfx_clink(): out = np.zeros(int(0.5 * SR), np.float32); place(out, bell(midi(96), 0.5), 0); place(out, bell(midi(101), 0.4), 0.004, 0.5); return out * 0.8
def sfx_cup(): t = T(0.25); return (np.sin(2 * np.pi * 1300 * t) * np.exp(-t * 30) * 0.4 + lp(noise(0.25, 5), 2000) * np.exp(-t * 60) * 0.6).astype(np.float32)
def sfx_pour(d=1.2): t = T(d); return (bp(noise(d, 6), 600, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t) ** 2) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2) * 0.5).astype(np.float32)
def sfx_kettle(d=1.5): t = T(d); f = 1800 + 400 * np.minimum(1, t / d); return ((np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + bp(noise(d), 1500, 3000) * 0.4) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.2) * 0.4).astype(np.float32)
def sfx_fire(d=3.0):
    out = lp(noise(d, 7), 500) * 0.25; r = np.random.default_rng(8)
    for _ in range(int(d * 14)): place(out, hp(noise(0.02, int(r.integers(1e6))), 2000) * np.exp(-T(0.02) * 200), r.uniform(0, d), r.uniform(0.2, 0.9))
    return out.astype(np.float32)
def sfx_wind(d=3.0): t = T(d); return (bp(noise(d, 9), 200, 1200) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t + 1)) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6) * 0.6).astype(np.float32)
def sfx_rain(d=3.0): t = T(d); return (bp(noise(d, 10), 1500, 9000) * 0.35 * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def sfx_birds(d=3.0):
    out = np.zeros(int(d * SR), np.float32); r = np.random.default_rng(11)
    for _ in range(int(d * 2.5)):
        f0 = r.uniform(2500, 4200); place(out, slide(f0, f0 * r.uniform(1.2, 1.6), 0.08) * 0.3, r.uniform(0, d - 0.1));
    return out
def sfx_owl(): out = np.zeros(int(1.2 * SR), np.float32); [place(out, slide(420, 380, 0.35) * 0.5, k * 0.45) for k in range(2)]; return lp(out, 1200)
def sfx_snore(d=1.4):
    t = T(d); half = d / 2; buzz = (np.mod(np.cumsum(55 + 20 * np.sin(np.pi * t / half)) / SR, 1) < 0.25).astype(np.float32)
    inh = lp(buzz * 0.6 + noise(d, 12) * 0.2, 600) * np.sin(np.pi * np.clip(t / half, 0, 1)) ** 2
    exh = bp(noise(d, 13), 300, 1500) * np.sin(np.pi * np.clip((t - half) / half, 0, 1)) ** 2 * 0.25
    return (inh + exh).astype(np.float32)
def sfx_heartbeat(n=3):
    out = np.zeros(int(n * 0.8 * SR + SR * 0.3), np.float32)
    for k in range(n): place(out, kick() * 0.9, k * 0.8); place(out, kick() * 0.6, k * 0.8 + 0.22)
    return lp(out, 200) * 1.5
def sfx_typing(d=2.0):
    out = np.zeros(int(d * SR), np.float32); r = np.random.default_rng(14); tt = 0.0
    while tt < d - 0.05: place(out, bp(noise(0.03, int(r.integers(1e6))), 1500, 7000) * np.exp(-T(0.03) * 150) * 0.6, tt); tt += r.uniform(0.06, 0.16)
    return out
def sfx_click(): return bp(noise(0.03, 15), 2000, 9000) * np.exp(-T(0.03) * 180)
def sfx_buzz(d=0.8): t = T(d); return ((np.sign(np.sin(2 * np.pi * 150 * t)) * 0.2) * ((t % 0.4) < 0.25)).astype(np.float32) * 0.6
def sfx_notify(): out = np.zeros(int(0.6 * SR), np.float32); place(out, bell(midi(83), 0.4), 0); place(out, bell(midi(88), 0.5), 0.12); return out * 0.8
def sfx_page(): t = T(0.3); return (bp(noise(0.3, 16), 1000, 7000) * np.sin(np.pi * t / 0.3) ** 3 * 0.6).astype(np.float32)
def sfx_rustle(d=0.8): t = T(d); return (bp(noise(d, 17), 800, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t) ** 2) * np.sin(np.pi * t / d) * 0.4).astype(np.float32)
def sfx_thud(): t = T(0.4); return (np.sin(2 * np.pi * 70 * t) * np.exp(-t * 14) + lp(noise(0.4, 18), 600) * np.exp(-t * 25) * 0.6).astype(np.float32)
def sfx_knock(n=3):
    out = np.zeros(int((n * 0.22 + 0.45) * SR), np.float32)
    for k in range(n): place(out, sfx_thud(), k * 0.22, 0.7); place(out, hp(noise(0.04, 19 + k), 1200) * np.exp(-T(0.04) * 90), k * 0.22, 0.6)
    return out
def sfx_door(): out = np.zeros(int(1.2 * SR), np.float32); t = T(0.7); cr = bp((np.mod(np.cumsum(90 + 60 * np.sin(np.pi * t / 0.7)) / SR, 1) < 0.1).astype(np.float32), 300, 3000) * np.sin(np.pi * t / 0.7); place(out, cr, 0, 1.2); place(out, sfx_thud(), 0.75, 0.8); return out
def sfx_dizzy(): t = T(1.2); f = 900 * (1 + 0.3 * np.sin(2 * np.pi * 4 * t)) * (1 - 0.3 * t / 1.2); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(len(t), 0.05, 0.1, 0.8, 0.3) * 0.3).astype(np.float32)
def sfx_fail():
    out = np.zeros(int(2.0 * SR), np.float32)
    for k, m in enumerate([62, 61, 60]): place(out, reed(midi(m - 12), 0.35, 0.01), k * 0.38, 0.8)
    t = T(0.9); place(out, reed(midi(59 - 12), 0.9, 0.03) * (1 + 0.3 * np.sin(2 * np.pi * 6 * t)), 3 * 0.38, 0.8); return out
def sfx_tada():
    out = np.zeros(int(1.6 * SR), np.float32)
    for k, ms in enumerate([[72], [72], [72, 76, 79]]): [place(out, reed(midi(m), 0.18 if k < 2 else 0.9, 0.006), k * 0.16, 0.5) for m in ms]
    return out
def sfx_drip(): return slide(900, 1600, 0.08) * np.exp(-T(0.08) * 30) * 0.6
def sfx_bell(): return (bell(midi(76), 2.5) + bell(midi(64), 2.5) * 0.6)
def sfx_cuckoo():
    out = np.zeros(int(0.8 * SR), np.float32); place(out, whistle(740, 0.16), 0); place(out, whistle(587, 0.25), 0.22); return out
def sfx_yawnless(): return slide(500, 250, 0.8, lambda p: np.sin(p)) * 0.3
def sfx_chime(): out = np.zeros(int(1.6 * SR), np.float32); [place(out, bell(midi(m), 1.2), k * 0.12, 0.4) for k, m in enumerate([79, 84, 88, 91])]; return out
def sfx_slideup(): return slide(400, 1400, 0.4) * 0.4
def sfx_slidedown(): return slide(1400, 400, 0.4) * 0.4
def sfx_crowd(d=2.0): t = T(d); return (bp(noise(d, 20), 300, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t) ** 2) * 0.35 * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)).astype(np.float32)
def sfx_car(d=2.0): t = T(d); f = 60 + 30 * np.sin(np.pi * t / d); return (lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)).astype(np.float32), 400) * np.sin(np.pi * t / d) ** 2 * 0.4).astype(np.float32)
def sfx_writing(d=1.0): t = T(d); return (bp(noise(d, 21), 2500, 8000) * (np.sin(2 * np.pi * 6 * t) > 0.2) * 0.25).astype(np.float32)

def make(name, c):
    d = float(c.get('dur', 0) or 0); s = int(c.get('seed', 0) or 0)
    lib = {
        'step': lambda: sfx_step('wood', s), 'step-wood': lambda: sfx_step('wood', s), 'step-snow': lambda: sfx_step('snow', s), 'step-grass': lambda: sfx_step('grass', s), 'step-street': lambda: sfx_step('street', s),
        'whoosh': lambda: sfx_whoosh(d or 0.5), 'swish': sfx_swish, 'pop': sfx_pop, 'boing': sfx_boing, 'ding': sfx_ding, 'sparkle': sfx_sparkle, 'chime': sfx_chime,
        'tick': sfx_tick, 'ticks': lambda: sfx_ticks(d or 2, c.get('rate', 2)), 'clock-fast': lambda: sfx_ticks(d or 2, c.get('rate', 9)), 'alarm': lambda: sfx_alarm(d or 1.5),
        'sip': sfx_sip, 'gulp': sfx_gulp, 'clink': sfx_clink, 'cup': sfx_cup, 'pour': lambda: sfx_pour(d or 1.2), 'kettle': lambda: sfx_kettle(d or 1.5),
        'fire': lambda: sfx_fire(d or 3), 'wind': lambda: sfx_wind(d or 3), 'rain': lambda: sfx_rain(d or 3), 'birds': lambda: sfx_birds(d or 3), 'owl': sfx_owl,
        'snore': lambda: sfx_snore(d or 1.4), 'heartbeat': lambda: sfx_heartbeat(int(c.get('n', 3))), 'typing': lambda: sfx_typing(d or 2), 'click': sfx_click,
        'phone-buzz': lambda: sfx_buzz(d or 0.8), 'notify': sfx_notify, 'page': sfx_page, 'rustle': lambda: sfx_rustle(d or 0.8), 'thud': sfx_thud, 'knock': lambda: sfx_knock(int(c.get('n', 3))),
        'door': sfx_door, 'dizzy': sfx_dizzy, 'fail': sfx_fail, 'tada': sfx_tada, 'drip': sfx_drip, 'bell': sfx_bell, 'cuckoo': sfx_cuckoo, 'sigh-slide': sfx_yawnless,
        'slide-up': sfx_slideup, 'slide-down': sfx_slidedown, 'crowd': lambda: sfx_crowd(d or 2), 'car': lambda: sfx_car(d or 2), 'writing': lambda: sfx_writing(d or 1),
    }
    if name not in lib: print('unknown sfx:', name, file=sys.stderr); return None
    x = np.asarray(lib[name](), np.float32); pk = np.max(np.abs(x)) or 1
    return x / pk * 0.8

# ============================================================== mix
music = np.zeros(N, np.float32)
secs = spec.get('sections') or [{'t': 0, 'mood': MUS.get('mood', 'quirky')}]
secs = sorted(secs, key=lambda s: s['t'])
if MUS.get('mood') != 'none':
    XF = 0.5
    for i, s in enumerate(secs):
        t0 = max(0, s['t'] - (XF if i else 0)); t1 = secs[i + 1]['t'] + XF if i + 1 < len(secs) else DUR
        part = compose(s['mood'], t1 - t0, SEED + i * 17); n = len(part)
        fade = np.ones(n, np.float32); xn = int(XF * SR)
        if i: fade[:xn] = np.linspace(0, 1, xn)
        if i + 1 < len(secs): fade[-xn:] = np.linspace(1, 0, xn)
        place(music, part * fade, t0)
    fi = int(0.4 * SR); music[:fi] *= np.linspace(0, 1, fi)
    fo = int(max(0.8, float(spec.get('fadeOut') or 0) + 0.4) * SR); music[-fo:] *= np.linspace(1, 0, fo) ** 1.5
sfx = np.zeros(N, np.float32)
for c in spec.get('cues', []):
    x = make(c['name'], c)
    if x is not None: place(sfx, x, float(c['t']), float(c.get('gain', 1)))
mg = float(MUS.get('gain', 1))
mix = music * 0.42 * mg + sfx * 0.75
pk = np.max(np.abs(mix)) or 1; mix = np.tanh(mix / pk * 1.6) / np.tanh(1.6) * 0.9
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[2], 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'audio ok: {DUR:.2f}s, {len(spec.get("cues", []))} cues, moods: {[s["mood"] for s in secs]}')
