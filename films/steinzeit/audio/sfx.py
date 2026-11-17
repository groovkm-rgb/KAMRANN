"""Procedural SFX + music for 'Ein Tag in der Steinzeit' (numpy/scipy, 48 kHz stereo).
Every generator returns a (n, 2) float32 array. Deterministic (fixed seeds)."""
import numpy as np
from scipy import signal

SR = 48000


def rng(seed):
    return np.random.default_rng(seed)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='low', fs=SR, output='sos'), x, axis=0)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='high', fs=SR, output='sos'), x, axis=0)


def smooth_env(n, seed, rate=0.3, lo=0.3, hi=1.0):
    """slow random envelope (values lo..hi), ~rate changes per second"""
    r = rng(seed)
    k = max(4, int(n / SR * rate) + 4)
    pts = r.uniform(lo, hi, k)
    x = np.linspace(0, k - 1, n)
    i = np.floor(x).astype(int).clip(0, k - 2)
    f = x - i
    f = f * f * (3 - 2 * f)
    return pts[i] * (1 - f) + pts[i + 1] * f


def stereo(m, pan=0.0, width=0.0, seed=0):
    """mono -> stereo with constant-power pan; width adds a tiny decorrelating delay"""
    L = np.cos((pan + 1) * np.pi / 4)
    R = np.sin((pan + 1) * np.pi / 4)
    if width:
        d = int(width * SR)
        r = np.concatenate([np.zeros(d), m[:-d]]) if d else m
        return np.stack([m * L, r * R], 1)
    return np.stack([m * L, m * R], 1)


def norm_rms(x, db):
    rms = np.sqrt(np.mean(x ** 2) + 1e-12)
    return x * (10 ** (db / 20) / rms)


def wind(dur, seed=1, howl=1.0):
    n = int(dur * SR)
    r = rng(seed)
    out = np.zeros((n, 2))
    for ch in range(2):
        w = r.standard_normal(n)
        body = lp(bp(w, 120, 900), 1200) * smooth_env(n, seed + ch, 0.25, 0.35, 1.0)
        out[:, ch] += body
        # howl: narrow resonant bands whose centre drifts
        for j, fc in enumerate([420, 640, 910]):
            h = bp(r.standard_normal(n), fc * 0.92, fc * 1.08, 2)
            out[:, ch] += h * 2.2 * howl * smooth_env(n, seed * 7 + ch * 3 + j, 0.18, 0.0, 1.0) ** 2
    return out


def crackle(dur, seed=2, rate=14.0, pops=0.6, pan=0.4):
    n = int(dur * SR)
    r = rng(seed)
    m = np.zeros(n)
    t = 0.0
    while True:
        t += r.exponential(1 / rate)
        if t >= dur:
            break
        i = int(t * SR)
        big = r.random() < 0.08 * pops
        L = int(SR * (r.uniform(0.002, 0.012) if not big else r.uniform(0.02, 0.05)))
        burst = r.standard_normal(L) * np.exp(-np.linspace(0, 6 if not big else 4, L))
        amp = r.uniform(0.15, 0.6) * (2.5 if big else 1)
        m[i:i + L] += burst[:n - i] * amp
    m = hp(m, 900 if pops < 0.3 else 500)
    # soft roar of the flames underneath
    roar = lp(r.standard_normal(n), 260) * 0.35 * smooth_env(n, seed + 5, 1.5, 0.4, 1.0)
    return stereo(m + roar, pan, 0.0004)


def drone(dur, seed=3, root=55.0, mood='mystery'):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    r = rng(seed)
    out = np.zeros((n, 2))
    ratios = {'mystery': [1, 1.5, 2.0, 2.0 * 1.0595], 'warm': [1, 1.5, 2, 2.5198], 'tense': [1, 1.0595, 1.5, 2]}[mood]
    for j, q in enumerate(ratios):
        f = root * q
        for ch, det in enumerate([-0.25, 0.25]):
            ph = r.uniform(0, 6.28)
            a = (0.5 if j < 2 else 0.18) * smooth_env(n, seed + j * 5 + ch, 0.12, 0.5, 1.0)
            out[:, ch] += a * np.sin(2 * np.pi * (f + det) * tt + ph + 0.3 * np.sin(2 * np.pi * 0.07 * tt))
    air = bp(r.standard_normal((n, 2)), 300, 1400) * 0.05
    return out + air


def swell(dur, at, length=1.6, seed=4, f0=40.0):
    """low soft swell that peaks at `at` (riser into a moment)"""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    env = np.clip((tt - (at - length)) / length, 0, 1) ** 2 * np.exp(-np.clip(tt - at, 0, None) * 2.5)
    tone = np.sin(2 * np.pi * f0 * tt) + 0.5 * np.sin(2 * np.pi * f0 * 2.01 * tt)
    noise = lp(rng(seed).standard_normal(n), 900) * 0.6
    m = (tone + noise) * env
    return stereo(m, 0, 0.0006)


def voice_activity(v, win=0.05, thr_db=-38, attack=0.04, release=0.35):
    """0..1 envelope where the voice is speaking (for ducking)"""
    mono = v.mean(1) if v.ndim == 2 else v
    hop = int(win * SR)
    k = len(mono) // hop + 1
    pad = np.pad(mono, (0, k * hop - len(mono)))
    rms = np.sqrt((pad.reshape(k, hop) ** 2).mean(1))
    act = (20 * np.log10(rms + 1e-9) > thr_db).astype(float)
    # smooth with attack / release
    out = np.zeros(k)
    a = np.exp(-win / attack)
    r_ = np.exp(-win / release)
    for i in range(k):
        c = a if act[i] > out[i - 1 if i else 0] else r_
        out[i] = act[i] + (out[i - 1 if i else 0] - act[i]) * c
    return np.repeat(out, hop)[:len(mono)]
