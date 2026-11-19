#!/usr/bin/env python3
"""Sound for the agent films: voice (MP3 pieces) + synthesized noir music, ambiences and SFX, ducked under
the voice, mastered to -16 LUFS (ffmpeg loudnorm, 2 passes), muxed onto the silent MP4 as H.264 + AAC.

  python3 audio.py spec.json            spec: see films/agent-taslak/audio.json
Everything is generated with numpy/scipy (no samples), deterministic (fixed seeds).
"""
import json, subprocess, sys, os, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

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

def reverb(x, sec=1.2, wet=.3):
    n = secs(sec); ir = white(n) * np.exp(-np.arange(n) / SR * 5 / sec); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet
def babble(n, voices=8, lo=250, hi=2800):
    """unintelligible crowd / PA murmur: noise through moving formants with syllable envelopes"""
    out = np.zeros(n); t = np.arange(n) / SR
    for v in range(voices):
        rate = RNG.uniform(3.5, 6); env = (np.sin(2 * np.pi * rate * t + RNG.uniform(0, 6)) > RNG.uniform(-.2, .4)).astype(float)
        env = lp(env * (lp(np.abs(white(n)), .3) * 3 > .5), 25)
        f0 = RNG.uniform(110, 230); src = np.sign(np.sin(2 * np.pi * f0 * t * (1 + .05 * np.sin(2 * np.pi * .7 * t + v)))) * .5 + white(n) * .3
        out += (bp(src, lo, hi) + bp(src, RNG.uniform(600, 900), RNG.uniform(1100, 1500)) * .8) * env
    return out / (np.std(out) + 1e-9)
def sfx_step(surf='wet', gain=1):
    n = secs(.18); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (90 if surf != 'marble' else 140) * t) * np.exp(-t * 40)
    click = hp(white(n), 1500 if surf != 'carpet' else 400) * np.exp(-t * (90 if surf != 'carpet' else 160)) * (.2 if surf == 'carpet' else .6)
    x = thud * .7 + click
    if surf == 'wet': x += bp(white(n), 1500, 6000) * np.exp(-t * 25) * .5
    if surf == 'marble': x = reverb(np.pad(x, (0, secs(.6))), .8, .35)
    return x * gain * RNG.uniform(.8, 1)
def sfx_simple(kind):
    if kind == 'tick': n = secs(.08); t = np.arange(n) / SR; return np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 60) * .4
    if kind == 'punch': n = secs(.25); t = np.arange(n) / SR; return np.sin(2 * np.pi * 70 * t) * np.exp(-t * 25) + lp(white(n), 1500) * np.exp(-t * 50) * .6
    if kind == 'ding': n = secs(1.5); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 1320 * t) + .4 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t * 3) * .3
    if kind == 'freeze': n = secs(1.0); t = np.arange(n) / SR; return np.pad(sfx_whoosh(.7, True), (0, n - secs(.7))) * .6 + np.pad(np.sin(2 * np.pi * 45 * t[:secs(.7)]) * np.exp(-t[:secs(.7)] * 4), (0, n - secs(.7))) * .6
    if kind == 'crack': n = secs(1.2); t = np.arange(n) / SR; return np.sin(2 * np.pi * 50 * t) * np.exp(-t * 3) * .9 + hp(white(n), 300) * np.exp(-t * 12) * .4
    if kind == 'door': n = secs(.9); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 85 * t) * np.exp(-t * 14) + bp(white(n), 200, 1200) * np.exp(-t * 18) * .6 + np.pad(hp(white(secs(.05)), 2000), (0, n - secs(.05))) * .4)
    if kind == 'lock': n = secs(.3); t = np.arange(n) / SR; x = np.zeros(n); x[:secs(.03)] += hp(white(secs(.03)), 2500); x[secs(.12):secs(.15)] += hp(white(secs(.03)), 2000) * .8; return x * .7
    if kind == 'locker': n = secs(.8); t = np.arange(n) / SR; return bp(white(n), 800, 4000) * np.exp(-t * 10) * .5 + np.sin(2 * np.pi * 320 * t) * np.exp(-t * 6) * .3 + np.sin(2 * np.pi * 610 * t) * np.exp(-t * 7) * .2
    if kind == 'envelope': return sfx_paper() * 1.2
    if kind == 'brake': n = secs(3.0); t = np.arange(n) / SR; f = 2600 - 900 * t / 3; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 3) * .15 + bp(white(n), 100, 600) * np.sin(np.pi * t / 3) * .4
    if kind == 'tramBell': n = secs(1.6); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(880, 1), (2210, .5), (3310, .3)]) * np.exp(-t * 3); return (x + np.roll(x, secs(.25))) * .25
    if kind == 'escalator': n = secs(3); t = np.arange(n) / SR; return (lp(brown(n), 200) * .5 + bp(white(n), 1000, 3000) * (np.sin(2 * np.pi * 8 * t) > .8) * .15) * np.sin(np.pi * t / 3)
    if kind == 'burn': n = secs(2.5); t = np.arange(n) / SR; cr = hp(white(n), 2000) * (lp(np.abs(white(n)), 30) > .8); return (cr * .4 + bp(white(n), 300, 1500) * .15) * np.sin(np.pi * t / 2.5) + np.pad(hp(white(secs(.06)), 3000) * .5, (0, n - secs(.06)))
    if kind == 'keys': x = np.zeros(secs(2)); tt = 0
    if kind == 'keys':
        while tt < 1.8: y = sfx_tak() * .5; i = secs(tt); x[i:i + len(y)] += y[:len(x) - i]; tt += RNG.uniform(.07, .16)
        return lp(x, 4000)
    if kind == 'breathIn': n = secs(1.0); t = np.arange(n) / SR; return bp(white(n), 500, 3000) * np.sin(np.pi * t) ** 2 * .25
    if kind == 'breathOut': n = secs(1.8); t = np.arange(n) / SR; return bp(white(n), 300, 2000) * np.sin(np.pi * t / 1.8) ** 2 * np.exp(-t) * .3
    if kind == 'kidLaugh':
        n = secs(1.6); t = np.arange(n) / SR; f0 = 380 + 40 * np.sin(2 * np.pi * 1.3 * t); src = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * .5 + white(n) * .3
        env = (np.sin(2 * np.pi * 6 * t) > 0).astype(float) * np.exp(-t * 1.2); env = lp(env, 40)
        return (bp(src, 700, 1300) + bp(src, 2200, 3200) * .6) * env * .35
    if kind == 'wings': n = secs(1.2); t = np.arange(n) / SR; return bp(white(n), 300, 2500) * (np.sin(2 * np.pi * 9 * t) * .5 + .5) * np.exp(-t * 2.5) * .5
    if kind == 'umbrella': n = secs(.6); t = np.arange(n) / SR; return bp(white(n), 400, 4000) * np.exp(-t * 6) * .5 + np.pad(hp(white(secs(.04)), 2000), (0, n - secs(.04))) * .5
    if kind == 'zip': n = secs(.4); t = np.arange(n) / SR; return bp(white(n), 2000, 6000) * (np.sin(2 * np.pi * 60 * t) > 0) * np.sin(np.pi * t / .4) * .3
    if kind == 'siren': n = secs(6); t = np.arange(n) / SR; f = 700 + 250 * np.sin(2 * np.pi * .4 * t); return lp(np.sin(2 * np.pi * np.cumsum(f) / SR), 1500) * np.sin(np.pi * t / 6) * .08
    if kind == 'drip': n = secs(.3); t = np.arange(n) / SR; f = 900 + 1200 * np.exp(-t * 40); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * .25
    if kind == 'kiss': n = secs(.15); t = np.arange(n) / SR; return bp(white(n), 1000, 5000) * np.exp(-t * 40) * .3
    if kind == 'cup': n = secs(.5); t = np.arange(n) / SR; return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(2100, 14), (3400, 20), (5200, 30)]) * .12
    if kind == 'whoosh2': return sfx_whoosh(.4)
    return np.zeros(10)
SIMPLE = ['tick', 'punch', 'ding', 'freeze', 'crack', 'door', 'lock', 'locker', 'envelope', 'brake', 'tramBell', 'escalator', 'burn', 'keys', 'breathIn', 'breathOut', 'kidLaugh', 'wings', 'umbrella', 'zip', 'siren', 'drip', 'kiss', 'cup', 'whoosh2']

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
    'step': lambda c: (sfx_step(c.get('surf', 'wet')), .35, RNG.uniform(-.2, .2)),
}
for _k in SIMPLE: SFX[_k] = (lambda k: (lambda c: (sfx_simple(k), {'tick': .2, 'ding': .25, 'kidLaugh': .6, 'siren': .7, 'drip': .5, 'keys': .4}.get(k, .5), 0)))(_k)

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
    if name == 'cityDay':
        tr = bp(brown(n), 50, 500) * .06 + bp(pink(n), 500, 4000) * .015; birds = np.zeros(n)
        for i in range(int(dur * .7)): j = RNG.integers(0, max(1, n - secs(.3))); tt = np.arange(secs(.2)) / SR; birds[j:j + len(tt)] += np.sin(2 * np.pi * (3000 + 800 * np.sin(2 * np.pi * 25 * tt)) * tt) * np.exp(-tt * 15) * .02
        return np.stack([tr + birds, tr + np.roll(birds, 4000)])
    if name == 'roomTone': m = lp(brown(n), 150) * .035 + lp(pink(n), 3000) * .006; return np.stack([m, m])
    if name == 'office':
        hum = np.sin(2 * np.pi * 120 * t) * .007 + bp(white(n), 3500, 7000) * .004; room = lp(brown(n), 200) * .03; m = hum + room; return np.stack([m, m])
    if name == 'gym': m = reverb(lp(brown(n), 300) * .04, 1.5, .4); return np.stack([m, m])
    if name == 'homeDay': m = lp(brown(n), 150) * .03 + bp(brown(n), 60, 400) * .015; return np.stack([m, m])
    if name == 'party': b = babble(n, 6) * .03; b = reverb(b, .7, .2); m = lp(brown(n), 150) * .02; return np.stack([b + m, np.roll(b, 2000) + m])
    if name == 'station':
        b = reverb(babble(n, 10) * .03, 2.0, .45); pa = np.zeros(n)
        for st in [2.0, dur * .55]:
            i0 = secs(st); L = min(secs(3.5), n - i0)
            if L > 0: pa[i0:i0 + L] = reverb(bp(babble(L, 1, 400, 2500), 400, 2500) * .04, 2.5, .6)
        rum = lp(brown(n), 120) * .05; return np.stack([b + pa + rum, np.roll(b, 3000) + pa + rum])
    if name == 'cafe': b = babble(n, 7) * .025; m = lp(brown(n), 150) * .02; rain = lp(pink(n), 2000) * .025; return np.stack([b + m + rain, np.roll(b, 2500) + m + rain])
    if name == 'store': b = reverb(babble(n, 12) * .025, 1.2, .35); m = lp(brown(n), 200) * .03; return np.stack([b + m, np.roll(b, 3000) + m])
    if name == 'tram': rum = lp(brown(n), 140) * .09 * (1 + .3 * np.sin(2 * np.pi * 1.7 * t)); rain = bp(pink(n), 500, 5000) * .04; clk = np.zeros(n); clk[::secs(.9)] = 1; clk = lp(clk, 300) * 2; m = rum + rain + clk * .05; return np.stack([m, m])
    if name == 'park':
        wind = bp(pink(n), 150, 1200) * .05 * (1 + .6 * lp(white(n), .5) * 10); coo = np.zeros(n)
        for i in range(int(dur * .4)):
            j = RNG.integers(0, max(1, n - secs(.8))); tt = np.arange(secs(.7)) / SR; coo[j:j + len(tt)] += np.sin(2 * np.pi * (330 + 40 * np.sin(2 * np.pi * 3 * tt)) * tt) * np.sin(np.pi * tt / .7) * .03
        return np.stack([wind + coo, wind * .9 + np.roll(coo, 3000)])
    if name == 'hotel':
        rain = bp(pink(n), 500, 6000) * .05 + lp(pink(n), 800) * .03; d = np.zeros(n); per = secs(1.7)
        for j in range(secs(.5), n - secs(.3), per): tt = np.arange(secs(.3)) / SR; d[j:j + len(tt)] += np.sin(2 * np.pi * np.cumsum(900 + 1200 * np.exp(-tt * 40)) / SR) * np.exp(-tt * 30) * .04
        m = rain + d; return np.stack([m, m])
    if name == 'kitchen': m = lp(brown(n), 150) * .03 + bp(white(n), 2000, 6000) * .003; birds = amb('cityDay', dur)[0] * .3; return np.stack([m + birds, m + birds])
    if name == 'restaurant': b = babble(n, 9) * .03; cl = np.zeros(n)
    if name == 'restaurant':
        for i in range(int(dur * 1.2)): j = RNG.integers(0, max(1, n - secs(.5))); y = sfx_simple('cup'); cl[j:j + len(y)] += y * .15
        return np.stack([b + cl, np.roll(b, 2000) + cl])
    if name == 'beach': w = lp(pink(n), 1500) * .08 * (1 + .7 * np.sin(2 * np.pi * .12 * t)); return np.stack([w, np.roll(w, 5000)])
    if name == 'hall': m = reverb(lp(brown(n), 200) * .03, 2.5, .5); return np.stack([m, m])
    if name == 'interrog': m = np.sin(2 * np.pi * 120 * t) * .008 + lp(brown(n), 150) * .025; return np.stack([m, m])
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
