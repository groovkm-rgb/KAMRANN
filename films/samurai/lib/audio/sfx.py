"""Synthesised sounds for the samurai film (numpy only, 48 kHz, stereo mixing helpers).
Same method as noah-skill / cartoon-short-kit audio.py: everything generated from noise, sines and envelopes,
plus new instruments: taiko, shakuhachi, koto."""
import numpy as np, subprocess

SR = 48000
rng = np.random.default_rng(1600)

def T(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def _filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
def lp(x, hz, o=4): return _filt(x, hi=hz, order=o)
def hp(x, hz, o=4): return _filt(x, lo=hz, order=o)
def bp(x, lo, hi, o=4): return _filt(x, lo=lo, hi=hi, order=o)
def env(d, a=.005, r=.3, hold=0.0):
    t = T(d); e = np.minimum(1, t / max(a, 1e-4)); e *= np.where(t < a + hold, 1, np.exp(-(t - a - hold) / r)); return e.astype(np.float32)
def fade(x, a=.01, r=.05):
    n = len(x); ia, ir = int(a * SR), int(r * SR); y = x.copy()
    if ia: y[:ia] *= np.linspace(0, 1, ia)
    if ir: y[-ir:] *= np.linspace(1, 0, ir)
    return y
def norm(x, p=1.0): m = np.max(np.abs(x)) + 1e-9; return (x / m * p).astype(np.float32)
def reverb(x, size=1.6, mix=.3, damp=3500):
    ir = noise(size) * np.exp(-T(size) / (size / 6.5)); ir = lp(ir, damp); ir[0] = 0
    n = len(x) + len(ir); X = np.fft.rfft(x, n); I = np.fft.rfft(ir, n); w = np.fft.irfft(X * I, n)[: len(x) + len(ir) - 1]
    w = w / (np.max(np.abs(w)) + 1e-9) * np.max(np.abs(x))
    out = np.zeros(len(w), np.float32); out[: len(x)] += x * (1 - mix); out += w * mix; return out.astype(np.float32)

# ---------------------------------------------------------------- instruments
def taiko(big=1.0, d=2.2):
    t = T(d); f = 58 * big ** -.3 * (1 + .55 * np.exp(-t * 22))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    over = np.sin(2 * np.pi * np.cumsum(f * 2.31) / SR) * np.exp(-t * 9) * .3
    skin = lp(noise(d), 900) * np.exp(-t * 28) * .9
    stick = bp(noise(d), 1500, 5000) * np.exp(-t * 90) * .25
    return reverb(norm(body + over + skin + stick), 2.4, .28, 1800)
def taiko_small(d=.6):
    t = T(d); f = 180 * (1 + .4 * np.exp(-t * 40))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) + bp(noise(d), 400, 3000) * np.exp(-t * 40) * .5, .6)
def shakuhachi(notes, base=0.0):
    """notes: list of (start, dur, midi). Breathy bamboo flute: sine + 2nd/3rd partial, breath noise, slow vibrato, meri bends."""
    end = max(s + d for s, d, m in notes) + 1.5; out = np.zeros(int(end * SR), np.float32)
    for s, d, m in notes:
        t = T(d); f0 = 440 * 2 ** ((m - 69) / 12); bend = 1 - .03 * np.exp(-t * 6)  # attack bends up into the note
        vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .6)
        ph = 2 * np.pi * np.cumsum(f0 * bend * vib) / SR
        tone = np.sin(ph) + .18 * np.sin(2 * ph) + .07 * np.sin(3 * ph)
        a = np.minimum(1, t / .18) * np.minimum(1, (d - t) / .35).clip(0) * (1 + .15 * np.sin(2 * np.pi * .7 * t))
        breath = bp(noise(d), f0 * .8, f0 * 4) * .35 * (.5 + .5 * np.exp(-t * 3))
        chiff = hp(noise(d), 2000) * np.exp(-t * 18) * .25
        sig = (tone * .8 + breath) * a + chiff
        i = int(s * SR); out[i:i + len(sig)] += sig[: len(out) - i]
    return reverb(norm(out, .9), 2.8, .38, 4000)
def koto(notes):
    end = max(s for s, m in notes) + 3; out = np.zeros(int(end * SR), np.float32)
    for s, m in notes:
        f0 = 440 * 2 ** ((m - 69) / 12); d = 2.6; t = T(d)
        sig = sum((.7 ** k) * np.sin(2 * np.pi * f0 * (k + 1) * (1 + .0015 * k) * t) * np.exp(-t * (1.6 + k * 1.2)) for k in range(7))
        sig += bp(noise(d), f0 * 2, f0 * 8) * np.exp(-t * 60) * .4
        i = int(s * SR); out[i:i + len(sig)] += sig[: len(out) - i]
    return reverb(norm(out, .8), 1.8, .25, 5000)
def horagai(d=2.6, f0=196):
    t = T(d); vib = 1 + .01 * np.sin(2 * np.pi * 4.5 * t); f = f0 * (1 - .06 * np.exp(-t * 4)) * vib
    ph = 2 * np.pi * np.cumsum(f) / SR; tone = sum(np.sin(k * ph) / k ** 1.1 for k in range(1, 9))
    a = np.minimum(1, t / .35) * np.minimum(1, (d - t) / .5).clip(0)
    sig = lp(tone * a + bp(noise(d), 200, 1500) * .3 * a, 2500)
    return reverb(norm(sig), 3.0, .45, 2500)

# ---------------------------------------------------------------- sword / armour / props
def sword_draw(d=1.1):  # "shiiing": scrape rising + ringing steel
    t = T(d); s = bp(noise(d), 2500, 9000) * np.sin(np.pi * np.minimum(1, t / .45)) ** 2 * (t < .45)
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2210, 3.2), (3470, 4.5), (5120, 6), (6890, 8)]) * np.minimum(1, t / .3)
    return reverb(norm(s * .7 + ring * .35), 1.2, .25, 8000)
def sword_ring(d=1.4):
    t = T(d); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2793, 3), (4186, 5), (5588, 7)]) * np.minimum(1, t / .01), .6)
def sheath_clack():
    d = .35; t = T(d); return norm(bp(noise(d), 600, 4000) * np.exp(-t * 60) + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 45) * .6)
def whoosh(d=.5, lo=300, hi=3000):
    t = T(d); return norm(bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 3, .8)
def slash(d=.7):  # sword-cut transition: whoosh + metallic shing
    w = whoosh(.35, 800, 7000); s = sword_ring(1.0) * .8; out = np.zeros(int(d * SR) + len(s), np.float32); out[: len(w)] += w; i = int(.18 * SR); out[i:i + len(s)] += s; return reverb(out, 1.0, .2, 9000)
def silk_rub(d=1.0):
    t = T(d); return norm(bp(noise(d), 1500, 7000) * (.5 + .5 * np.sin(2 * np.pi * 3 * t)) ** 2 * np.sin(np.pi * t / d), .35)
def fabric(d=.8):
    t = T(d); return norm(bp(noise(d), 600, 5000) * np.abs(np.sin(2 * np.pi * 2.3 * t + rng.random())) * np.sin(np.pi * t / d), .5)
def heartbeat():
    d = .9; t = T(d); one = lambda tt: np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 18) * (tt >= 0)
    return norm(lp((one(t) + .7 * one(t - .22)).astype(np.float32), 200), .9)
def breath_in(d=.7):
    t = T(d); return norm(bp(noise(d), 500, 3000) * np.sin(np.pi * t / d) ** 2, .25)
def lacquer_tick(): d = .12; t = T(d); return norm(bp(noise(d), 2500, 8000) * np.exp(-t * 80), .4)

# ---------------------------------------------------------------- nature / ambience
def crickets(d, rate=1.0):
    t = T(d); out = np.zeros(len(t), np.float32)
    for k, (f, per) in enumerate([(4300, .62), (4700, .81), (5100, .53)]):
        ph = (t * rate + k * .21) % per; chirp = (ph < .11).astype(np.float32) * (np.sin(2 * np.pi * 34 * t) > 0)
        out += np.sin(2 * np.pi * f * t) * lp(chirp, 600) * (.6 + .4 * np.sin(2 * np.pi * .13 * t + k))
    return norm(out, .5)
def night_air(d):
    t = T(d); return norm(lp(noise(d), 400) * (.6 + .4 * np.sin(2 * np.pi * .08 * t)), .5)
def wind(d, gust=.15):
    t = T(d); return norm(bp(noise(d), 150, 1200) * (.55 + .45 * np.sin(2 * np.pi * gust * t) ** 2), .6)
def temple_bell(d=6.0):
    t = T(d); parts = [(110, 1, .5), (178, .6, .7), (262, .55, .9), (331, .3, 1.2), (440, .2, 1.6), (587, .12, 2.2)]
    s = sum(a * np.sin(2 * np.pi * f * t + i) * np.exp(-t * k / 2.2) * (1 + .3 * np.sin(2 * np.pi * 1.2 * t)) for i, (f, a, k) in enumerate(parts))
    s += bp(noise(d), 500, 2500) * np.exp(-t * 30) * .3
    return reverb(lp(norm(s), 1600), 3.5, .5, 1500)
def crow(d=.45):
    t = T(d); f = 520 * (1 - .25 * t / d); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    s = bp(saw.astype(np.float32), 700, 2600) * np.sin(np.pi * np.minimum(1, t / d)) ** .6 * (1 + .5 * np.sin(2 * np.pi * 28 * t))
    return reverb(norm(s, .7), 1.5, .35, 4000)
def flag_flap(d):
    t = T(d); flutter = (.5 + .5 * np.sin(2 * np.pi * (7 + 3 * np.sin(2 * np.pi * .4 * t)) * t)) ** 3
    return norm(bp(noise(d), 300, 3000) * flutter * (.6 + .4 * np.sin(2 * np.pi * .3 * t)), .6)
def water_drop():
    d = .4; t = T(d); f = 900 * (1 + 1.5 * np.exp(-t * 40)); return reverb(norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25), .5), .8, .3)

# ---------------------------------------------------------------- graphics sounds
def ink_splat():  # wet brush "shlap"
    d = .6; t = T(d); return norm(bp(noise(d), 300, 3500) * np.exp(-t * 9) * np.minimum(1, t / .01) + lp(noise(d), 200) * np.exp(-t * 14) * 1.5, .9)
def brush_stroke(d=.45):
    t = T(d); s = bp(noise(d), 1500, 9000) * np.sin(np.pi * t / d) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 37 * t))) * (.7 + .3 * rng.random(len(t)))
    return norm(s.astype(np.float32), .45)
def scroll_open(d=.9):
    t = T(d); rustle = bp(noise(d), 1200, 7000) * np.sin(np.pi * t / d) * .5
    clicks = np.zeros(len(t), np.float32)
    for k in range(10): i = int((k * .07 + rng.random() * .02) * SR); c = sheath_clack()[: int(.05 * SR)] * .25; clicks[i:i + len(c)] += c[: len(clicks) - i]
    thump = lp(noise(d), 180) * np.exp(-t * 12) * .8
    return norm(rustle + clicks + thump, .8)
def hanko_pat():
    d = .3; t = T(d); return norm(lp(noise(d), 500) * np.exp(-t * 35) + np.sin(2 * np.pi * 95 * t) * np.exp(-t * 30), .9)
def tick(): d = .05; t = T(d); return norm(np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120), .3)
def shoji_slide(d=.5):
    t = T(d); s = bp(noise(d), 200, 1800) * np.sin(np.pi * t / d) * .7; c = sheath_clack() * .5; out = np.zeros(len(t) + len(c), np.float32); out[: len(t)] += s; out[len(t) - 200: len(t) - 200 + len(c)] += c; return out
def mist_whoosh(d=.9): return whoosh(d, 100, 1500)
def drone(d, f=55):
    t = T(d); s = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t + .3) + .3 * np.sin(2 * np.pi * f * 2.01 * t)
    return norm(lp((s * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0).clip(0)).astype(np.float32), 400), .6)

# ---------------------------------------------------------------- mixing
class Bus:
    def __init__(self, dur): self.n = int(dur * SR); self.L = np.zeros(self.n, np.float32); self.R = np.zeros(self.n, np.float32)
    def add(self, sig, t0, gain_db=0.0, pan=0.0):
        g = 10 ** (gain_db / 20); i = int(t0 * SR); j = min(self.n, i + len(sig))
        if i >= self.n or j <= 0: return
        s = sig[: j - i] * g; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.L[i:j] += s * l * 1.414; self.R[i:j] += s * r * 1.414
def load_voice(path, dur, start=0.0):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(int(dur * SR), np.float32); out[: min(len(out), len(v))] = v[: len(out)]; return out
def duck_env(voice, depth_db=-10, att=.04, rel=.35):
    e = np.abs(voice); k = int(.03 * SR); e = np.convolve(e, np.ones(k) / k, 'same'); thr = np.percentile(e, 60) * .5
    on = (e > thr).astype(np.float32)
    # smooth attack/release
    out = np.zeros_like(on); a, r = 1 - np.exp(-1 / (att * SR)), 1 - np.exp(-1 / (rel * SR)); y = 0.0
    step = 64
    for i in range(0, len(on), step):
        x = on[i:i + step].max(); y += (x - y) * (a if x > y else r) * step; y = min(1, max(0, y)); out[i:i + step] = y
    return (10 ** (depth_db * out / 20)).astype(np.float32)
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def bird(d=.18, f0=3800):
    t = T(d); f = f0 * (1 + .25 * np.sin(2 * np.pi * 18 * t)) * (1 - .2 * t / d)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2, .35)
