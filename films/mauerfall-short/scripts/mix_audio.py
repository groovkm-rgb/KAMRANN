"""Sound for "Die Mauer fiel aus Versehen": procedural SFX + low music under the user's voice-over.
   python3 mix_audio.py <vo_processed.wav> <out_dir>   (vo: see render notes; compressed + limited voice)     -> out_dir/mix_raw.wav (+ stems)
   v2: crowds are breathy voices shaped by smoothly moving vowel formants (STFT) + reverb; hits duck ~3 dB, beds ~8 dB
   under the voice; light music ~15 LU under the voice. Final -14 LUFS / -1.5 dBTP with ffmpeg."""
import sys, subprocess, json, numpy as np
from scipy import signal

SR = 48000
DUR = 1376 / 30
N = int(round(DUR * SR))
rng = np.random.default_rng(7)
vo_path, out = sys.argv[1], sys.argv[2]

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).copy(); b = np.zeros(N, np.float32); b[:min(N, len(a))] = a[:N]; return b
def save(path, x):
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x, x], 1)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', path], input=x.tobytes())
def lufs(path):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(r.split('I:')[-1].split('LUFS')[0])

T = lambda n: np.arange(n) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(n): return rng.standard_normal(n).astype(np.float64)
def expdec(n, tau): return np.exp(-T(n) / tau)
def add(buf, t, x, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(x) <= 0: return
    x = x[max(0, -i):]; i = max(0, i); x = x[:N - i]
    if x.ndim == 2: buf[i:i + len(x)] += x * g; return
    buf[i:i + len(x), 0] += x * g * (1 - max(0, pan)); buf[i:i + len(x), 1] += x * g * (1 + min(0, pan))
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)

# ---------------- SFX generators ----------------
def flash():
    n = int(.12 * SR); tt = T(n); whine = np.sin(2 * np.pi * (2200 * tt + 18000 * tt ** 2)) * np.linspace(0, 1, n) * .15
    m = int(.09 * SR); pop = lp(noise(m), 3500) * expdec(m, .015) * 1.0 + np.sin(2 * np.pi * 110 * T(m)) * expdec(m, .03) * .8
    return np.concatenate([whine, pop])
def shutter():
    def click(): m = int(.012 * SR); return hp(noise(m), 1800) * expdec(m, .002)
    out = np.zeros(int(.12 * SR)); c = click(); out[:len(c)] += c; i = int(.065 * SR); out[i:i + len(c)] += c * .8; return out
def paper(d):
    n = int(d * SR); x = bp(noise(n), 1200, 7500)
    env = np.abs(lp(noise(n), 18)); env = env / env.max(); spikes = (rng.random(n) < 30 / SR) * rng.random(n) * 3
    env = env + lp(spikes, 60) * 20; env *= np.minimum(1, T(n) / .03) * np.minimum(1, (d - T(n)) / .06)
    return x * env * .5
def tick(hi=True):
    n = int(.06 * SR); f = 2600 if hi else 2050
    return (np.sin(2 * np.pi * f * T(n)) * expdec(n, .008) + hp(noise(n), 3000) * expdec(n, .002) * .6) * .7
def marker(d=.4):
    n = int(d * SR); tt = T(n); strokes = np.abs(np.sin(2 * np.pi * 5.5 * tt)) ** .6
    x = bp(noise(n), 2200, 6500) * strokes * .5 + np.sin(2 * np.pi * (1700 + 120 * np.sin(2 * np.pi * 7 * tt)) * tt) * .05 * strokes
    return x * np.minimum(1, tt / .02) * np.minimum(1, (d - tt) / .05)
def step(heavy=1.0):
    n = int(.11 * SR); return (lp(noise(n), 260) * expdec(n, .025) * 1.6 + hp(noise(n), 2500) * expdec(n, .004) * .35) * heavy
def voice_babble(d, n_voices=14, f0=(95, 230), brightness=2800, syll=4.0, seed=1):
    r = np.random.default_rng(seed); n = int(d * SR); out = np.zeros(n)
    forms = [(700, 1200), (400, 2000), (300, 800), (500, 1500), (650, 1700), (350, 2300)]
    for v in range(n_voices):
        f = r.uniform(*f0); tt = T(n); ph = np.cumsum(f * (1 + .04 * np.sin(2 * np.pi * r.uniform(.3, 1) * tt)) / SR)
        src = 2 * (ph % 1) - 1
        seg_len = int(r.uniform(.12, .3) * SR); y = np.zeros(n)
        for s0 in range(0, n, seg_len):
            f1, f2 = forms[r.integers(len(forms))]; s1 = min(n, s0 + seg_len)
            y[s0:s1] = bp(src[s0:s1], f1 * .8, f1 * 1.25, 1) + .6 * bp(src[s0:s1], f2 * .85, f2 * 1.2, 1)
        am = np.clip(np.sin(2 * np.pi * (syll * r.uniform(.7, 1.3)) * tt + r.uniform(0, 6)), 0, 1) ** .7
        gate = (lp(r.standard_normal(n), 1.2) > -.2).astype(float); gate = lp(gate, 8)
        out += y * am * gate * r.uniform(.5, 1)
    out = lp(out, brightness) + bp(noise(n), 300, 2500) * .05
    return out / (np.sqrt(np.mean(out ** 2)) + 1e-9) * .1
def chant_word(word, nv=30, seed=3):
    r = np.random.default_rng(seed); d = .34 if word == 'tor' else .42; n = int(d * SR); tt = T(n); out = np.zeros(n)
    for v in range(nv):
        f = r.uniform(110, 260) * (1.0 if word == 'tor' else 1.08); jit = r.uniform(-.02, .02)
        src = 2 * ((np.cumsum(np.full(n, f) * (1 + .02 * np.sin(2 * np.pi * 5 * tt))) / SR) % 1) - 1
        if word == 'tor': y = bp(src, 380, 560, 1) + .7 * bp(src, 700, 950, 1)
        else:
            k = np.clip(tt / d, 0, 1); a = bp(src, 650, 950, 1) + .7 * bp(src, 1100, 1400, 1); u = bp(src, 260, 400, 1) + .5 * bp(src, 650, 900, 1)
            y = a * (1 - k) + u * k
        sh = int(abs(jit) * SR); y = np.roll(y, sh); out += y * r.uniform(.6, 1)
    env = np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .08)
    cons = hp(noise(int(.03 * SR)), 2500) * .4 if word == 'tor' else lp(noise(int(.05 * SR)), 1500) * .1
    out = out * env; out[:len(cons)] += cons * np.sqrt(np.mean(out ** 2)) * 8
    return out / (np.max(np.abs(out)) + 1e-9)
def dial():
    n = int(.75 * SR); out = np.zeros(n); c = hp(noise(int(.006 * SR)), 1500) * expdec(int(.006 * SR), .0015)
    for i in range(9): j = int((.02 + i * .028) * SR); out[j:j + len(c)] += c * .6   # winding ratchet
    for i in range(6): j = int((.34 + i * .066) * SR); out[j:j + len(c)] += c * 1.0  # return pulses
    hum = np.sin(2 * np.pi * 50 * T(n)) * .02; return out + hum
def creak(d):
    n = int(d * SR); tt = T(n); rate = 55 + 30 * np.sin(2 * np.pi * .7 * tt) + 15 * lp(noise(n), 3) * 20
    ph = np.cumsum(np.clip(rate, 20, 120) / SR); pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float)
    pulses *= .5 + .5 * np.abs(lp(noise(n), 4)) * 10
    y = bp(pulses, 650, 800, 2) * 3 + bp(pulses, 1350, 1600, 2) * 2 + bp(pulses, 2800, 3300, 2)
    motor = (np.sin(2 * np.pi * 50 * tt) + .4 * np.sin(2 * np.pi * 100 * tt)) * .05
    return (y / (np.max(np.abs(y)) + 1e-9) * .8 + motor) * np.minimum(1, tt / .1) * np.minimum(1, (d - tt) / .15)
def clunk():
    n = int(.9 * SR); tt = T(n)
    ring = sum(np.sin(2 * np.pi * f * tt) * a * expdec(n, dec) for f, a, dec in [(320, .5, .4), (870, .3, .25), (1560, .2, .15), (2410, .1, .1)])
    return ring * .6 + lp(noise(n), 180) * expdec(n, .05) * 1.5
def heartbeat():
    n = int(.5 * SR); out = np.zeros(n)
    for t0, a in [(0, 1), (.2, .7)]:
        m = int(.16 * SR); th = np.sin(2 * np.pi * 52 * T(m)) * expdec(m, .045) * a; j = int(t0 * SR); out[j:j + m] += th
    return lp(out, 150) * 2.2
def applause(d, dens=70):
    n = int(d * SR); out = np.zeros(n); c_len = int(.012 * SR)
    for _ in range(int(d * dens)):
        j = rng.integers(0, n - c_len); c = bp(noise(c_len), rng.uniform(900, 1500), rng.uniform(2500, 4500), 1) * expdec(c_len, .003)
        out[j:j + c_len] += c * rng.uniform(.3, 1)
    return out * np.minimum(1, T(n) / .3) * np.minimum(1, (d - T(n)) / .4) * 1.4
def cork():
    n = int(.08 * SR); tt = T(n); pop = np.sin(2 * np.pi * (500 * tt - 1800 * tt ** 2)) * expdec(n, .02) + lp(noise(n), 2500) * expdec(n, .006)
    m = int(1.6 * SR); fizz = hp(noise(m), 4000) * expdec(m, .5) * (.3 + .7 * (rng.random(m) > .97)) * .25
    return np.concatenate([pop * .9, fizz])
def hammer():
    n = int(.15 * SR); tt = T(n); return (sum(np.sin(2 * np.pi * f * tt) * expdec(n, .03) for f in (1800, 2900, 4300)) * .25 + hp(noise(n), 2000) * expdec(n, .004)) * .7
def whoosh(d=.45, up=True):
    n = int(d * SR); tt = T(n); x = noise(n); y = np.zeros(n); seg_ = 1200
    for s0 in range(0, n, seg_):
        k = s0 / n; f = 400 + 3000 * (k if up else 1 - k); y[s0:s0 + seg_] = bp(x[s0:s0 + seg_], f * .6, f * 1.4, 1)
    return y * np.sin(np.pi * tt / d) ** 2 * .6
def rumble(d):
    n = int(d * SR); return lp(noise(n), 120) * 2.5 * np.minimum(1, T(n) / .5) * np.minimum(1, (d - T(n)) / .5)


# ---------------- v2: crowds ----------------
VOW = {'a': (750, 1250), 'e': (450, 1900), 'i': (320, 2200), 'o': (470, 820), 'u': (330, 760), 'ae': (650, 1700), 'schwa': (520, 1450)}
NPS, HOP = 1024, 256
FREQ = np.fft.rfftfreq(NPS, 1 / SR)
def shape_voice(exc, f1, f2, amp):
    """exc: excitation; f1,f2,amp: per-STFT-frame arrays. Smooth time-varying formant filter (no clicks)."""
    _, _, X = signal.stft(exc, SR, nperseg=NPS, noverlap=NPS - HOP)
    m = X.shape[1]; f1 = np.interp(np.arange(m), np.linspace(0, m - 1, len(f1)), f1); f2 = np.interp(np.arange(m), np.linspace(0, m - 1, len(f2)), f2)
    amp = np.interp(np.arange(m), np.linspace(0, m - 1, len(amp)), amp)
    F = FREQ[:, None]
    env = np.exp(-((F - f1) / 110) ** 2) + .7 * np.exp(-((F - f2) / 160) ** 2) + .25 * np.exp(-((F - 2700) / 300) ** 2) + .04
    env *= 1 / (1 + (F / 3500) ** 2)
    _, y = signal.istft(X * env * amp, SR, nperseg=NPS, noverlap=NPS - HOP)
    return y[:len(exc)] if len(y) >= len(exc) else np.pad(y, (0, len(exc) - len(y)))
def glottal(n, f0, r, jitter=.03):
    tt = T(n); f = f0 * (1 + jitter * lp(r.standard_normal(n), 6) * 8 + .015 * np.sin(2 * np.pi * r.uniform(4, 6) * tt))
    ph = np.cumsum(f / SR) % 1; return lp(2 * ph - 1, 1400, 1)
def reverb(x, rt=.8, wet=.35, pre=.012, seed=0, bright=4000):
    r = np.random.default_rng(seed); n = int(rt * SR); out = np.zeros((len(x), 2))
    mono = x if x.ndim == 1 else x.mean(1)
    for ch in range(2):
        ir = lp(r.standard_normal(n), bright) * np.exp(-6.9 * T(n) / rt); ir = np.concatenate([np.zeros(int(pre * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
        out[:, ch] = signal.fftconvolve(mono, ir)[:len(x)]
    dry = np.stack([x, x], 1) if x.ndim == 1 else x
    return dry * (1 - wet) + out * wet
def crowd(d, nv=24, f0=(100, 260), excite=.5, seed=1, breath=.55, syll=(.12, .3), rt=.9, wet=.35, roar=.5):
    breath *= .6; roar *= .3
    """Walla: many breathy voices talking/shouting over each other + a soft noise roar; stereo, reverberant."""
    r = np.random.default_rng(seed); n = int(d * SR); out = np.zeros((n, 2)); m = n // HOP + 4
    for v in range(nv):
        fv = r.uniform(*f0) * (1 + .25 * excite); exc = (1 - breath) * glottal(n, fv, r) + breath * r.standard_normal(n) * .35
        f1 = np.zeros(m); f2 = np.zeros(m); amp = np.zeros(m); k = int(r.uniform(0, .5) * SR / HOP)
        vk = r.choice(list(VOW)); 
        while k < m:
            L = int(r.uniform(*syll) * SR / HOP); nk = r.choice(list(VOW)); a0, b0 = VOW[vk]; a1, b1 = VOW[nk]
            seg_ = np.linspace(0, 1, max(L, 2)); e = min(m, k + L)
            f1[k:e] = (a0 + (a1 - a0) * seg_)[:e - k] * (1 + .15 * excite); f2[k:e] = (b0 + (b1 - b0) * seg_)[:e - k]
            amp[k:e] = (np.sin(np.pi * seg_) ** .8)[:e - k] * r.uniform(.5, 1); vk = nk; k = e
            if r.random() < .25: k += int(r.uniform(.1, .5) * SR / HOP)   # pauses between phrases
        f1[f1 == 0] = 500; f2[f2 == 0] = 1500
        y = shape_voice(exc, f1, f2, amp); pan = r.uniform(-.8, .8)
        out[:, 0] += y * (1 - max(0, pan)) * r.uniform(.5, 1); out[:, 1] += y * (1 + min(0, pan)) * r.uniform(.5, 1)
    out /= (np.sqrt(np.mean(out ** 2)) + 1e-9)
    rr = lp(bp(noise(n), 250, 2200), 2500); rr *= (1 + .4 * lp(noise(n), 1.5) * 30); out += np.stack([rr, np.roll(rr, 900)], 1) / (np.sqrt(np.mean(rr ** 2)) + 1e-9) * roar
    out = reverb(lp(out, 3000, 4), rt, wet, seed=seed, bright=2500)
    fade = np.minimum(1, T(n) / .25) * np.minimum(1, (d - T(n)) / .3)
    return out * fade[:, None] / (np.sqrt(np.mean(out ** 2)) + 1e-9) * .1
def chant(times, nv=40, seed=5):
    """'Tor auf!' shouted by a crowd: synchronised syllables (o, then a->u) with onset jitter; times = start of each 'Tor'."""
    r = np.random.default_rng(seed); t0, t1 = min(times) - .1, max(times) + .9; n = int((t1 - t0) * SR); m = n // HOP + 4; out = np.zeros((n, 2))
    for v in range(nv):
        fv = r.uniform(170, 330); exc = .55 * glottal(n, fv, r, .02) + .45 * r.standard_normal(n) * .35
        f1 = np.full(m, 500.); f2 = np.full(m, 1400.); amp = np.zeros(m)
        for ts in times:
            j = r.uniform(-.04, .06); a = int((ts - t0 + j) * SR / HOP); L1 = int(.26 * SR / HOP); g2 = int(.06 * SR / HOP); L2 = int(.38 * SR / HOP)
            f1[a:a + L1] = 480; f2[a:a + L1] = 830; amp[a:a + L1] = np.sin(np.linspace(.15, np.pi, L1)) ** .5
            b = a + L1 + g2; s2 = np.linspace(0, 1, L2); f1[b:b + L2] = 780 - 430 * s2; f2[b:b + L2] = 1250 - 480 * s2; amp[b:b + L2] = (np.sin(np.linspace(.2, np.pi, L2)) ** .5) * 1.1
        y = shape_voice(exc, f1, f2, amp); pan = r.uniform(-.9, .9)
        out[:, 0] += y * (1 - max(0, pan)); out[:, 1] += y * (1 + min(0, pan))
        for ts in times:  # the 't' of "Tor"
            c = hp(noise(int(.025 * SR)), 2500) * expdec(int(.025 * SR), .006) * .25; i = int((ts - t0 + r.uniform(-.03, .03)) * SR); out[i:i + len(c)] += c[:, None]
    out = reverb(out, 1.4, .4, seed=seed)
    return t0, out / (np.max(np.abs(out)) + 1e-9)
def ambience(d, kind, seed=0):
    n = int(d * SR)
    if kind == 'hall':  # room tone + ventilation + distant camera motors
        x = lp(noise(n), 400, 4) * .4
    else:               # outdoor night: wind + far traffic rumble
        x = lp(noise(n), 300, 4) * .6 * (1 + .5 * lp(noise(n), .5) * 40)
    x = reverb(x, .6, .2, seed=seed); return x * (np.minimum(1, T(n) / .1) * np.minimum(1, (d - T(n)) / .1))[:, None]

# ---------------- v2: SFX, split into hits (short, clear) and beds (crowds, ambience) ----------------
hits = np.zeros((N, 2)); beds = np.zeros((N, 2))
CUTS = [2.3, 3.7, 5.4, 6.9, 9.6, 11.7, 13.8, 15.9, 18.4, 21.6, 23.0, 25.4, 27.2, 28.8, 30.4, 31.2, 32.3, 34.2, 35.1, 38.3, 39.5, 40.4, 41.7, 43.7]
for i, c in enumerate(CUTS):
    if c in (19.7, 37.45, 38.3): continue
    add(hits, c - .18, whoosh(.32, i % 2 == 0), .35, (-1) ** i * .4)
FL = [(.04, -.4), (.95, .3), (1.65, -.1), (2.9, .4), (3.75, -.3), (4.6, .2), (7.0, -.4), (8.35, .4), (9.2, -.2), (10.4, .2), (16.2, -.3), (17.0, .3), (17.9, -.1), (21.62, 0), (43.7, 0), (44.6, .3), (45.3, -.3)]
for t, pan in FL: add(hits, t - .1, flash(), .8, pan); add(hits, t + .03, shutter(), .9, -pan)
for t in [.5, 1.3, 2.0, 12.2, 13.2, 26.0, 44.2]: add(hits, t, shutter(), .5, rng.uniform(-.7, .7))      # extra shutters in the hall
add(hits, 0.0, whoosh(.55), .8)                                                                    # camera rush into Noah
for t0, t1 in [(0, 2.3), (3.7, 5.4), (11.7, 15.9), (25.4, 27.2), (43.7, DUR)]:
    add(beds, t0, ambience(t1 - t0, 'hall', int(t0)), .6); add(beds, t0, crowd(t1 - t0, 16, (95, 220), .1, seed=int(t0 * 10), breath=.7, rt=1.1, wet=.45, roar=.2), .55)
for t0, t1 in [(6.9, 11.7), (15.9, 18.4), (21.6, 23.0)]:
    add(beds, t0, ambience(t1 - t0, 'hall', int(t0)), .6); add(beds, t0, crowd(t1 - t0, 12, (95, 220), .05, seed=int(t0 * 10), breath=.8, rt=1.1, wet=.5, roar=.1), .35)
add(beds, 2.3, crowd(1.45, 30, (130, 300), 1, seed=5, breath=.45, syll=(.1, .22), rt=.7, wet=.25, roar=.6), 1.3)   # wall: cheering
for i in range(6): add(hits, 2.4 + i * .222, hammer(), .8, .3)
add(hits, 5.38, bp(noise(int(.12 * SR)), 800, 6000) * expdec(int(.12 * SR), .05) * .6, 1)              # TV switch-on static
add(beds, 5.4, np.sin(2 * np.pi * 15600 * T(int(1.5 * SR))) * .01 + lp(noise(int(1.5 * SR)), 200) * .06, 1)
for i in range(3): add(hits, 5.5 + i * .5, tick(i % 2 == 0), .7)
add(hits, 7.3, lp(noise(int(.4 * SR)), 900) * np.sin(np.pi * T(int(.4 * SR)) / .4) * .25, 1)            # hand into jacket
add(hits, 8.05, paper(.6), 1.2); add(hits, 9.7, paper(.5), .9); add(hits, 10.9, paper(.35), .8)
add(hits, 13.95, lp(noise(int(.3 * SR)), 1200) * np.sin(np.pi * T(int(.3 * SR)) / .3) * .3, 1, .3)       # arm raised (coat rustle)
for i in range(6): add(hits, 16.2 + i * .19, paper(.2), 1.1, (-1) ** i * .25)                            # leafing
for i in range(3): add(hits, 17.55 + i * .26, paper(.16), .7)
k = 0; tt_ = 18.45
while tt_ < 19.66: add(hits, tt_, tick(k % 2 == 0), 1.2); tt_ += .4; k += 1                              # clock, stops at "sofort"
add(hits, 19.68, lp(noise(int(.6 * SR)), 120) * expdec(int(.6 * SR), .15) * 1.5, 1)                     # low impact
for i in range(2): add(hits, 20.05 + i * .8, heartbeat(), 1.3)
add(hits, 21.6, lp(noise(int(.25 * SR)), 1500) * expdec(int(.25 * SR), .05), .9)                       # freeze
add(hits, 23.0, paper(.3), .8)
for t in [3.85, 5.5, 15.12, 19.72, 23.15, 23.75, 33.3, 34.3, 38.3, 40.52]: add(hits, t, marker(.42), 1.3)
add(hits, 27.2, lp(noise(int(.15 * SR)), 900) * expdec(int(.15 * SR), .03), 1)                        # door
for i in range(6): add(hits, 27.28 + i * .15, step(1.2), 1.1, .2)                                      # stairs
for i in range(9): add(hits, 28.1 + i * .13, step(.8), .8, -.2)
for i in range(4): add(hits, 27.4 + i * .3, lp(noise(int(.08 * SR)), 2500) * expdec(int(.08 * SR), .02) * .5, .7, rng.uniform(-.8, .8))   # windows opening
add(beds, 27.2, ambience(3.2, 'out', 3), .8); add(beds, 27.2, crowd(3.2, 26, (110, 260), .5, seed=11, rt=1.2, wet=.4, roar=.4), 1.0)
for i in range(14): add(hits, 28.85 + i * .11 + rng.uniform(0, .04), step(.45), .6, rng.uniform(-.7, .7))  # many feet from above
add(beds, 30.4, ambience(1.9, 'out', 4), .8); add(beds, 30.4, crowd(1.9, 34, (130, 300), .9, seed=13, breath=.45, rt=1.3, wet=.4, roar=.6), 1.0)
ct0, ch = chant([30.42, 31.84]); add(beds, ct0, ch, .55)                                               # "Tor auf!" (VO says it at 31.28)
add(hits, 32.3, dial(), 1.4, .1)
add(beds, 32.3, lp(crowd(1.9, 24, (130, 300), .8, seed=14, rt=.6, wet=.2), 900), .9)                  # crowd muffled by the window
add(beds, 34.2, ambience(3.3, 'out', 5), .8); add(beds, 34.2, crowd(3.3, 30, (120, 280), .6, seed=15, rt=1.3, wet=.45, roar=.5) * np.concatenate([np.ones(int(1.3 * SR)), np.linspace(1, .25, int(2.0 * SR))])[:, None][:int(3.3 * SR)], .9)
add(hits, 34.33, tick(True), 1.5); add(hits, 34.35, lp(noise(int(.05 * SR)), 900) * expdec(int(.05 * SR), .01), 1.0)
add(hits, 35.1, heartbeat(), 1.4); add(hits, 36.2, heartbeat(), 1.0)
add(hits, 35.5, creak(1.95), .9, -.3); add(hits, 37.45, clunk(), 1.2, -.3)
# 37.5 – 38.25: one second of silence
add(beds, 38.25, crowd(1.3, 40, (150, 330), 1, seed=17, breath=.4, syll=(.1, .2), rt=1.3, wet=.35, roar=.8), 1.5)   # release: roar
for i in range(10): add(hits, 38.3 + i * .115, step(1.0), 1.0, (-1) ** i * .3)
for i in range(14): add(hits, 38.35 + i * .085 + rng.uniform(0, .04), step(.5), .6, rng.uniform(-.7, .7))
add(beds, 39.5, crowd(4.2, 36, (150, 320), 1, seed=18, breath=.45, syll=(.1, .22), rt=1.0, wet=.3, roar=.6), 1.0)
add(hits, 39.5, applause(2.6, 110), 1.3); add(hits, 39.62, cork(), 1.6, -.3)
for i in range(4): add(hits, 40.4 + i * .5, applause(.4, 60), .5)

# ---------------- v2: light music ----------------
BEAT = 60 / 96
def note_hz(nm):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440 * 2 ** ((names[nm[:-1]] + 12 * (int(nm[-1]) + 1) - 69) / 12)
def pluck(f, d=.9, bright=.5, g=.996):
    n = int(d * SR); L = max(2, int(SR / f)); x = np.zeros(n); burst = lp(noise(L), 1500 + 5000 * bright); x[:L] = burst
    a = np.zeros(L + 2); a[0] = 1; a[L] = -g * .5; a[L + 1] = -g * .5
    y = signal.lfilter([1], a, x); return y / (np.max(np.abs(y)) + 1e-9) * expdec(n, d * .5)
def pad(freqs, d, cutoff=1100):
    n = int(d * SR); tt = T(n); y = np.zeros(n)
    for f in freqs:
        for det in (-.004, 0, .005): y += 2 * ((np.cumsum(np.full(n, f * (1 + det))) / SR) % 1) - 1
    y = lp(y, cutoff, 2); return y * np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .6)
def kick():
    n = int(.35 * SR); tt = T(n); return np.sin(2 * np.pi * (50 * tt + 90 * (1 - np.exp(-tt * 30)) / 30)) * expdec(n, .12)
music = np.zeros((N, 2))
tense = [('A2', 'C4', 'E4', 'A4'), ('F2', 'A3', 'C4', 'F4'), ('C3', 'E4', 'G4', 'C5'), ('E2', 'G#3', 'B3', 'E4')]
bar = 4 * BEAT; t = 0.0; ci = 0
while t < 37.45:
    ch_ = tense[ci % 4]; d = min(bar + .6, 37.45 - t + .05)
    if d > .3: add(music, t, pad([note_hz(x) for x in ch_[:3]], d) * .18, 1, 0)
    for s in range(8):  # eighth-note pluck arpeggio
        ts = t + s * BEAT / 2
        if ts >= 37.45: break
        quiet = 18.4 <= ts < 21.6 or 5.4 <= ts < 6.9
        if quiet: continue
        f = note_hz(ch_[[1, 2, 3, 2, 1, 2, 3, 2][s]]) * (2 if ts > 27 else 1)
        add(music, ts, pluck(f, .7, .35 + .4 * (ts > 27)), .22 if ts < 27 else .3, (-1) ** s * .35)
    if t >= 27.0:
        for b in range(4):
            ts = t + b * BEAT
            if ts < 37.4: add(music, ts, kick(), .55 + .3 * (ts > 34), 0)
    t += bar; ci += 1
# slow moment: music drops away under "sofort" (19.7) and comes back at 21.6
tt = T(N); env = np.ones(N); env -= .75 * np.clip((tt - 18.4) / .5, 0, 1) * np.clip((21.6 - tt) / .3, 0, 1); env[(tt >= 19.68) & (tt < 21.0)] = 0
env *= np.clip((21.0 - tt) / 1, 0, 1) * 0 + 1; env[(tt >= 21.0) & (tt < 21.6)] = np.linspace(0, 1, int(.6 * SR) + 1)[:np.sum((tt >= 21.0) & (tt < 21.6))]
# riser before the barrier, hard stop at 37.45
n_r = int((37.45 - 34.2) * SR); tr = T(n_r); riser = bp(noise(n_r), 300, 5000) * (tr / tr[-1]) ** 2 * .12 + np.sin(2 * np.pi * (110 * tr + 60 * tr ** 2)) * (tr / tr[-1]) ** 2 * .06
add(music, 34.2, riser, 1)
music *= env[:, None]; music[int(37.45 * SR):int(38.28 * SR)] = 0
def piano_note(f, d, a=1.0):
    n = int(d * SR); t_ = T(n); y = np.zeros(n)
    for h in range(1, 8): fh = f * h * (1 + .0004 * h * h); y += np.sin(2 * np.pi * fh * t_) * (1 / h ** 1.3) * expdec(n, 1.6 / h ** .6)
    y += lp(noise(n), 3000) * expdec(n, .004) * .2
    return y * np.minimum(1, t_ / .004) * a
warm = [(38.3, ['C3', 'E4', 'G4', 'C5'], 'E5'), (40.2, ['G2', 'D4', 'G4', 'B4'], 'D5'), (42.1, ['A2', 'C4', 'E4', 'A4'], 'C5'), (44.0, ['F2', 'A3', 'C4', 'F4'], 'A4')]
for t0, ch_, top in warm:
    for i, nm in enumerate(ch_): add(music, t0 + i * .04, piano_note(note_hz(nm), 3.2, .5 if i else .7), .5, (i - 1.5) * .2)
    add(music, t0 + .6, piano_note(note_hz(top), 2.6, .5), .5, .2)
    add(music, t0, pad([note_hz(x) for x in ch_[1:]], 2.2, 1600) * .14, 1)
    for s in range(6): add(music, t0 + .95 + s * BEAT / 2, pluck(note_hz(ch_[1 + s % 3]) * 2, .6, .5), .12, (-1) ** s * .4)
music *= np.clip((DUR - T(N)) / .35, 0, 1)[:, None]

# ---------------- v3: levels + ducking (voice first) ----------------
vo = load(vo_path)   # already compressed/limited by the caller (ffmpeg), mono
win = int(.03 * SR); e = np.sqrt(np.convolve(vo ** 2, np.ones(win) / win, 'same')); act = (e > .02 * (np.max(np.abs(vo)) / .35)).astype(float)
k_a, k_r = 1 - np.exp(-1 / (.02 * SR)), 1 - np.exp(-1 / (.3 * SR)); g = np.zeros(N); s_ = 0.0
for i in range(0, N, 48):
    tgt = act[i]; s_ += (tgt - s_) * (1 - (1 - (k_a if tgt > s_ else k_r)) ** 48); g[i:i + 48] = s_
duck = lambda db: (1 - (1 - 10 ** (-db / 20)) * g)[:, None]
def tame(x, top):
    # keep everything that is not the voice out of the voice's presence band and free of hiss
    y = np.stack([lp(x[:, c], top, 4) for c in range(2)], 1)
    return y - .5 * np.stack([bp(y[:, c], 1200, 4200, 2) for c in range(2)], 1)
hits, beds, music = tame(hits, 7000), tame(beds, 3200), tame(music, 6000)
for nm, x in [('vo', vo), ('hits_raw', hits), ('beds_raw', beds), ('mus_raw', music)]: save(f'{out}/stem_{nm}.wav', x)
L = {nm: lufs(f'{out}/stem_{nm}.wav') for nm in ['vo', 'hits_raw', 'beds_raw', 'mus_raw']}
hits_f = hits * 10 ** ((L['vo'] - 8 - L['hits_raw']) / 20) * duck(6)
beds_f = beds * 10 ** ((L['vo'] - 14 - L['beds_raw']) / 20) * duck(8)
mus_f = music * 10 ** ((L['vo'] - 17 - L['mus_raw']) / 20) * duck(5)
for nm, x in [('hits', hits_f), ('beds', beds_f), ('mus', mus_f)]: save(f'{out}/stem_{nm}.wav', x)
mix = np.stack([vo, vo], 1) + hits_f + beds_f + mus_f
save(f'{out}/mix_raw.wav', mix)
print(json.dumps({**L, **{k: lufs(f'{out}/stem_{k}.wav') for k in ['hits', 'beds', 'mus']}, 'mix': lufs(f'{out}/mix_raw.wav'), 'peak_db': float(20 * np.log10(np.max(np.abs(mix))))}))
