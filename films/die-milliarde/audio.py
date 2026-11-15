"""Die Milliarde: synthesized music bed + SFX under voice.mp3 -> mix_raw.wav (stereo 48 kHz)."""
import numpy as np, subprocess, wave, functools

SR = 48000
DUR = 597.81
N = int(DUR * SR)
rng = np.random.default_rng(7)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * g
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
tt = lambda d: np.arange(int(d * SR)) / SR
noise = lambda d: rng.standard_normal(int(d * SR)).astype(np.float32)

# ---------------- instruments (cached) ----------------
@functools.lru_cache(None)
def pluck(m, d=0.35, br=0.5):
    t = tt(d); f = midi(m); s = sum((br ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * np.minimum(1, t / 0.003) * np.exp(-t / (d * 0.3))).astype(np.float32)
@functools.lru_cache(None)
def piano(m, d=1.2):
    t = tt(d); f = midi(m); s = sum(np.sin(2 * np.pi * f * (k + 1) * t * (1 + 0.0004 * k)) * (0.6 ** k) * np.exp(-t * (1.5 + k * 0.8)) for k in range(5))
    return (s * np.minimum(1, t / 0.004)).astype(np.float32)
@functools.lru_cache(None)
def pad(chord, d):
    t = tt(d); s = np.zeros_like(t)
    for m in chord:
        for det in (-0.12, 0.0, 0.11):
            f = midi(m) * 2 ** (det / 12); s += np.sin(2 * np.pi * f * t + det * 7) + 0.3 * np.sin(4 * np.pi * f * t)
    a = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6).clip(0)
    return filt((s * a / (3 * len(chord))).astype(np.float32), hi=2200)
@functools.lru_cache(None)
def bass(m, d=0.4):
    t = tt(d); f = midi(m); s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.15 * np.sign(np.sin(2 * np.pi * f * t))
    return (s * np.minimum(1, t / 0.01) * np.exp(-t / (d * 0.6))).astype(np.float32)
@functools.lru_cache(None)
def brass(chord, d):
    t = tt(d); s = np.zeros_like(t)
    for m in chord:
        ph = 2 * np.pi * midi(m) * t + 0.004 * np.sin(2 * np.pi * 5 * t); s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.2 for k in range(8))
    a = np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08).clip(0)
    return filt((s * a / len(chord)).astype(np.float32), hi=2600)
@functools.lru_cache(None)
def drum(kind):
    if kind == 'kick':
        t = tt(0.35); f = 48 + 100 * np.exp(-t * 32); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
    if kind == 'snare':
        t = tt(0.2); s = rng.standard_normal(len(t)) * np.exp(-t * 26) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.5; return filt(s.astype(np.float32), lo=300)
    if kind == 'hat':
        t = tt(0.06); return filt((rng.standard_normal(len(t)) * np.exp(-t * 80)).astype(np.float32), lo=6000)
    if kind == 'clap':
        t = tt(0.18); s = rng.standard_normal(len(t)) * np.exp(-t * 30); return filt(s.astype(np.float32), lo=900, hi=5000)
    if kind == 'tick':
        t = tt(0.03); return (np.sin(2 * np.pi * 2500 * t) * np.exp(-t * 200)).astype(np.float32)
@functools.lru_cache(None)
def bell(m, d=1.5):
    t = tt(d); f = midi(m); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) * a for r, k, a in [(1, 3, 1), (2.76, 5, 0.5), (5.4, 8, 0.25)]) * 0.5).astype(np.float32)

music = np.zeros(N, np.float32)
M = lambda sig, t0, g=1.0: place(music, sig, t0, g)

def section(t0, t1, bpm, prog, style, gain=1.0, root_oct=0):
    beat = 60 / bpm; bar = 0; t = t0
    while t < t1 - 0.05:
        root, ch = prog[bar % len(prog)]; ch = tuple(m + root_oct for m in ch); root += root_oct
        bl = round(min(beat * 4, t1 - t), 3)
        if style == 'comic':
            M(pad(ch, bl), t, 0.10 * gain)
            for b in range(4):
                tb = t + b * beat
                if tb >= t1: break
                M(bass(root - 12, round(beat * 0.9, 3)), tb, 0.30 * gain)
                M(pluck(ch[(b + bar) % 3] + 12, 0.25, 0.6), tb + beat * 0.5, 0.16 * gain)
                M(drum('kick') if b % 2 == 0 else drum('snare'), tb, 0.30 * gain if b % 2 == 0 else 0.16 * gain)
                M(drum('hat'), tb + beat * 0.5, 0.06 * gain)
            if bar % 4 == 3:
                for k, m in enumerate([ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[1] + 24]): M(pluck(m, 0.2, 0.7), t + 2 * beat + k * beat * 0.5, 0.12 * gain)
        elif style == 'tense':
            M(pad(ch, bl), t, 0.18 * gain)
            for b in range(8):
                tb = t + b * beat / 2
                if tb >= t1: break
                M(bass(root - 12, round(beat * 0.45, 3)), tb, 0.30 * gain); M(drum('tick'), tb, 0.12 * gain)
        elif style == 'party':
            for b in range(4):
                tb = t + b * beat
                if tb >= t1: break
                M(drum('kick'), tb, 0.45 * gain); M(drum('hat'), tb + beat * 0.5, 0.12 * gain)
                if b % 2: M(drum('clap'), tb, 0.22 * gain)
                M(bass(root - 12, round(beat * 0.4, 3)), tb + beat * 0.5, 0.32 * gain)
            M(brass(ch, round(beat * 0.4, 3)), t, 0.10 * gain); M(brass(ch, round(beat * 0.4, 3)), t + beat * 1.5, 0.08 * gain); M(pad(ch, bl), t, 0.07 * gain)
            for k in range(8): M(pluck(ch[k % 3] + 24, 0.15, 0.8), t + k * beat / 2, 0.06 * gain)
        elif style == 'funky':
            for b in range(4):
                tb = t + b * beat
                if tb >= t1: break
                M(drum('kick'), tb, 0.32 * gain); M(drum('hat'), tb + beat * 0.5, 0.08 * gain)
                if b % 2: M(drum('snare'), tb, 0.18 * gain)
                M(bass(root - 12, round(beat * 0.35, 3)), tb, 0.3 * gain); M(bass(root, round(beat * 0.25, 3)), tb + beat * 0.75, 0.15 * gain)
            M(brass(ch, round(beat * 0.5, 3)), t + beat, 0.09 * gain); M(brass(ch, round(beat * 0.5, 3)), t + beat * 3, 0.09 * gain)
        elif style == 'sad':
            M(pad(ch, bl), t, 0.12 * gain)
            for k, m in enumerate([ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12]):
                if t + k * beat < t1: M(piano(m, 2.0), t + k * beat, 0.16 * gain)
            M(piano(root - 12, 3.0), t, 0.14 * gain)
        elif style == 'warm':
            M(pad(ch, bl), t, 0.15 * gain)
            for k in range(8):
                if t + k * beat / 2 < t1: M(piano(ch[[0, 1, 2, 1][k % 4]] + 12 + (12 if k == 6 else 0), 1.6), t + k * beat / 2, 0.11 * gain)
            M(bass(root - 12, round(beat * 3.5, 3)), t, 0.18 * gain)
        elif style == 'hope':
            M(pad(ch, bl), t, 0.13 * gain)
            for k in range(8):
                tb = t + k * beat / 2
                if tb < t1: M(pluck(ch[k % 3] + 12, 0.3, 0.5), tb, 0.12 * gain); M(drum('hat'), tb, 0.04 * gain)
            for b in range(4):
                if t + b * beat < t1: M(drum('kick'), t + b * beat, 0.2 * gain); M(bass(root - 12, round(beat * 0.8, 3)), t + b * beat, 0.22 * gain)
        elif style == 'sneaky':
            for b in range(4):
                tb = t + b * beat
                if tb >= t1: break
                M(pluck(root - 12 + [0, 3, 7, 6][b], 0.2, 0.3), tb, 0.30 * gain); M(pluck(ch[b % 3] + 12, 0.12, 0.7), tb + beat * 0.5, 0.10 * gain)
                M(drum('tick'), tb + beat * 0.5, 0.08 * gain)
            M(pad(ch, bl), t, 0.06 * gain)
        bar += 1; t += beat * 4

C = lambda r, q='M': (r, (r, r + (4 if q == 'M' else 3), r + 7))
P_comic = [C(60), C(57, 'm'), C(65), C(67)]
P_funk = [C(62, 'm'), C(67), C(62, 'm'), C(69, 'm')]
P_party = [C(57, 'm'), C(65), C(60), C(67)]
P_sad = [C(57, 'm'), C(53), C(60), C(52, 'm')]
P_warm = [C(65), C(60), C(62, 'm'), C(58)]
P_tense = [C(57, 'm'), C(58), C(57, 'm'), C(56)]
P_sneak = [C(57, 'm'), C(53), C(52), C(57, 'm')]

SECS = [(0.0, 9.16, 120, P_tense, 'tense', 1.0, 0), (9.35, 57.0, 112, P_comic, 'comic', 0.9, 0), (57.3, 133.1, 116, P_comic, 'comic', 1.0, 2),
        (133.14, 147.85, 100, P_funk, 'funky', 0.9, 0), (147.9, 181.35, 118, P_funk, 'funky', 1.15, 0), (181.4, 204.65, 124, P_party, 'party', 1.1, 0),
        (204.69, 210.5, 70, P_sad, 'sad', 0.8, 0), (210.57, 216.55, 124, P_party, 'party', 1.0, 0), (216.59, 267.65, 76, P_sad, 'sad', 0.9, 0),
        (267.72, 304.0, 66, P_sad, 'sad', 1.0, -2), (304.03, 371.15, 80, P_warm, 'warm', 1.0, 0), (371.23, 407.85, 104, P_warm, 'hope', 1.0, 0),
        (407.93, 462.95, 96, P_sneak, 'sneaky', 1.0, 0), (462.98, 485.9, 112, P_comic, 'comic', 0.8, 0), (485.97, 507.65, 70, P_warm, 'warm', 0.9, 0),
        (507.69, 547.6, 72, P_warm, 'warm', 0.9, -2), (547.63, 587.5, 108, P_comic, 'comic', 0.9, 0), (587.57, 597.35, 120, P_tense, 'tense', 0.6, 0)]
for (a, b, bpm, pr, st, g, ro) in SECS:
    tmp = music.copy(); music[:] = 0
    section(a, b, bpm, pr, st, g, ro)
    seg = music.copy(); i0, i1 = int(a * SR), min(N, int((b + 3) * SR))
    # soft fade in, release tail of 0.4 s after the section end
    w = np.zeros(N, np.float32); k = int(0.25 * SR); w[i0:i1] = 1; w[i0:i0 + k] = np.linspace(0, 1, k)
    e = int(b * SR); r = int(0.4 * SR); w[e:e + r] = np.linspace(1, 0, r)[: max(0, min(r, N - e))]; w[e + r:] = 0
    music[:] = tmp + seg * w
music[int(597.4 * SR):] = 0

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
X = lambda sig, t0, g=1.0: place(sfx, np.asarray(sig, np.float32), t0, g)
def whoosh(d=0.5):
    t = tt(d); return (filt(noise(d), lo=200, hi=3000) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def pop(f=900):
    t = tt(0.12); return (np.sin(2 * np.pi * f * t * (1 + 2 * np.exp(-t * 60))) * np.exp(-t * 35) + filt(noise(0.12), lo=1500) * np.exp(-t * 60) * 0.4).astype(np.float32)
def shimmer(d=1.0):
    t = tt(d); s = np.zeros_like(t)
    for k, m in enumerate([84, 88, 91, 96, 100]): s += np.sin(2 * np.pi * midi(m) * t) * np.exp(-((t - k * 0.06).clip(0)) * 5) * (t > k * 0.06)
    return (s * 0.25).astype(np.float32)
def kaching():
    t = tt(1.0); out = np.zeros_like(t); s = filt(noise(0.05), lo=2000) * 1.5; out[:len(s)] += s * np.exp(-np.arange(len(s)) / SR * 80)
    out += np.sin(2 * np.pi * 2093 * t) * np.exp(-t * 4) * 0.4 + np.sin(2 * np.pi * 3136 * t) * np.exp(-t * 5) * 0.3; return out.astype(np.float32)
def piep():
    t = tt(0.16); return (np.sign(np.sin(2 * np.pi * 1850 * t)) * 0.25 * np.minimum(1, t / 0.005) * (t < 0.14)).astype(np.float32)
def thump(f0=70, d=0.35):
    t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.8 * np.exp(-t * 30))) * np.exp(-t * 12) + filt(noise(d), hi=900) * np.exp(-t * 25) * 0.6).astype(np.float32)
def clank():
    t = tt(0.9); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(420, 6), (1130, 9), (1870, 12), (2650, 16)]) * 0.3).astype(np.float32)
def ring(d=2.0):
    t = tt(d); return (np.sin(2 * np.pi * 2300 * t) * (np.sin(2 * np.pi * 22 * t) > 0) * ((t % 0.5) < 0.35) * 0.22).astype(np.float32)
def buzz(d=1.0):
    t = tt(d); return (filt(np.sign(np.sin(2 * np.pi * 150 * t)).astype(np.float32), hi=500) * ((t % 0.6) < 0.4) * 0.5).astype(np.float32)
def splash(d=1.4):
    t = tt(d); return ((filt(noise(d), hi=4000) * np.exp(-t * 3) * np.minimum(1, t / 0.01) + filt(noise(d), hi=400) * np.exp(-t * 6) * 1.5) * 0.8).astype(np.float32)
def firework():
    t = tt(1.5); s = filt(noise(1.5), hi=800) * np.exp(-t * 4) * 1.5; crack = filt(noise(1.5), lo=3000) * (rng.random(len(t)) < 0.002) * np.exp(-t * 2) * 6; return (s + crack).astype(np.float32)
def engine(d=2.0, f0=55, f1=110):
    t = tt(d); f = f0 + (f1 - f0) * (t / d) ** 0.7; ph = np.cumsum(f) / SR; s = np.sign(np.sin(2 * np.pi * ph)) + 0.5 * np.sin(4 * np.pi * ph)
    return (filt((s * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.3)).astype(np.float32), hi=900) * 0.4).astype(np.float32)
def rip():
    d = 0.6; t = tt(d); return (filt(noise(d), lo=800, hi=6000) * (0.5 + 0.5 * (rng.random(len(t)) > 0.6)) * np.sin(np.pi * t / d) * 0.8).astype(np.float32)
def ding():
    return ((bell(88, 1.2) + bell(95, 1.2) * 0.6) * 0.7).astype(np.float32)
def doorbell():
    out = np.zeros(int(1.4 * SR), np.float32); place(out, bell(76, 1.0), 0); place(out, bell(72, 1.0), 0.45); return out
def hiss(d=0.8):
    t = tt(d); return (filt(noise(d), lo=2500) * np.exp(-t * 3) * 0.5).astype(np.float32)
def crowd(d):
    t = tt(d); return (filt(noise(d), lo=200, hi=1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t)) * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1) * 0.35).astype(np.float32)
def sting():
    return np.concatenate([brass((57, 61, 64), 0.22), np.zeros(int(0.08 * SR), np.float32), brass((56, 60, 63), 0.9)])
def slam():
    return (thump(60, 0.5) * 1.5 + filt(noise(0.5), lo=500, hi=3000) * np.exp(-tt(0.5) * 20) * 0.5).astype(np.float32)
def tickroll(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in np.arange(0, d, 0.035): place(out, drum('tick'), k, 0.6)
    return out
def ping():
    t = tt(0.08); return (np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 50)).astype(np.float32)
def scribble(d):
    t = tt(d); return (filt(noise(d), lo=1500, hi=5000) * (np.sin(2 * np.pi * 9 * t) > 0) * 0.2).astype(np.float32)
def crickets(d):
    t = tt(d); return (np.sin(2 * np.pi * 4200 * t) * ((t % 0.5) < 0.12) * (np.sin(2 * np.pi * 40 * t) > 0) * 0.08).astype(np.float32)
def lowpass_noise(d, hi, g):
    return (filt(noise(d), hi=hi) * g).astype(np.float32)

# --- HOOK
X(whoosh(0.7), 0.0, 0.8); X(thump(45, 0.8), 0.68, 0.7)
X(tickroll(1.55), 3.32, 0.5)
for i, x in enumerate([3.45, 3.6, 3.75, 3.9, 4.05, 4.2, 4.35, 4.5, 4.65]): X(pop(700 + i * 45), x, 0.7)
X(kaching(), 4.86, 0.8); X(shimmer(1.2), 4.88, 0.7); X(thump(40, 1.0), 4.86, 0.8)
X(whoosh(0.4), 5.0, 0.5); X(engine(0.7, 80, 160), 6.15, 0.8)
for x in [6.2, 6.8, 7.4, 8.0, 8.6]: X(whoosh(0.25), x - 0.12, 0.5)
X(shimmer(0.6), 6.85, 0.5); X(thump(90, 0.4), 8.02, 1.0); X(slam(), 8.62, 0.6)
X(whoosh(0.5), 9.0, 0.6); X(ding(), 9.2, 0.5)
# --- intro life
X(thump(120, 0.2), 13.2, 0.3); X(thump(110, 0.2), 14.5, 0.3)
for k in range(5): X(thump(160, 0.12), 15.8 + k * 0.42, 0.25)
X(clank(), 22.85, 0.8); X(hiss(0.8), 23.0, 0.5); X(whoosh(0.3), 24.0, 0.3)
X(lowpass_noise(0.6, 600, 0.4), 26.0, 0.5); X(shimmer(0.8), 26.5, 0.35)
X(ring(2.2), 28.6, 0.7); X(pop(1200), 31.5, 0.3); X(pop(1100), 34.3, 0.25)
X(kaching(), 37.95, 0.4); X(shimmer(1.0), 37.95, 0.5)
X(pop(500), 43.4, 0.4); X(pop(900), 43.9, 0.4); X(ding(), 45.75, 0.35)
for k in range(7): X(pop(1000 + k * 60), 46.8 + k * 0.22, 0.35)
X(ding(), 48.85, 0.35); X(ding(), 51.45, 0.4); X(thump(50, 1.0), 56.15, 0.7); X(whoosh(0.3), 56.0, 0.4)
# --- Tag 1
X(ding(), 57.0, 0.4); X(whoosh(0.5), 64.6, 0.4); X(crickets(1.8), 72.35, 1.0)
X(ping(), 79.95, 0.6); X(whoosh(0.35), 79.9, 0.4); X(whoosh(0.3), 82.1, 0.6); X(slam(), 82.35, 0.6); X(whoosh(0.4), 98.4, 0.3)
for x in [102.7, 104.3, 105.55]: X(pop(800), x, 0.4); X(shimmer(0.5), x, 0.25)
X(piep(), 108.25, 0.9); X(kaching(), 108.45, 0.4)
for x in [118.47, 120.29, 122.19]: X(piep(), x, 0.9)
X(thump(80, 0.4), 118.95, 0.7); X(thump(70, 0.45), 120.6, 0.8); X(thump(60, 0.5), 122.5, 0.9); X(shimmer(0.8), 131.6, 0.35)
# --- Woche 1
X(whoosh(0.6), 133.0, 0.5); X(slam(), 140.4, 0.8); X(whoosh(0.6), 147.8, 0.7); X(kaching(), 148.0, 0.6)
X(engine(1.5, 60, 140), 149.4, 0.6); X(shimmer(0.8), 150.85, 0.5); X(shimmer(0.8), 157.15, 0.5); X(whoosh(1.2), 158.4, 0.5)
X(lowpass_noise(1.5, 1500, 0.15), 161.34, 0.5); X(shimmer(1.0), 166.6, 0.6); X(ding(), 169.5, 0.3); X(shimmer(0.7), 174.3, 0.4); X(shimmer(0.7), 179.2, 0.5)
X(crowd(35.0), 181.4, 0.5)
for x in [181.6, 182.2, 182.9, 183.6, 184.2, 185.9, 186.3, 186.6]: X(firework(), x, 0.6)
X(ping(), 198.4, 0.5)
for k in range(8): X(pop(1500 + k * 50), 199 + k * 0.6, 0.15)
X(whoosh(0.5), 213.3, 0.5); X(splash(), 214.15, 1.0)
# --- Woche 2-4
X(thump(40, 1.2), 216.6, 0.6)
for k in range(6): X(whoosh(0.2), 220.35 + k * 0.25, 0.2)
X(thump(90, 0.4), 224.08, 1.3)
for k in range(8): X(thump(200, 0.08), 225.3 + k * 0.45, 0.2)
X(doorbell(), 229.35, 0.6); X(thump(90, 0.3), 239.7, 0.4); X(ping(), 253.0, 0.3); X(engine(1.8, 70, 160), 253.8, 0.7)
X(whoosh(0.25), 263.95, 0.5); X(doorbell(), 267.75, 0.4); X(lowpass_noise(2.4, 3000, 0.05), 274.1, 1.0); X(slam(), 292.9, 0.5)
for k in range(5): X(ping(), 294 + k * 0.8, 0.15)
# --- Wendepunkt
X(whoosh(0.8), 303.9, 0.4); X(engine(3.0, 80, 50), 307.4, 0.4)
for x in [312.9, 313.4, 313.9, 314.4, 314.8]: X(shimmer(0.4), x, 0.25)
X(lowpass_noise(1.5, 2000, 0.2), 315.3, 0.5); X(ding(), 322.6, 0.3); X(lowpass_noise(2.0, 1500, 0.06), 365.3, 1.0); X(shimmer(1.2), 370.2, 0.5)
for k in range(10): X(drum('tick'), 375.1 + k * 0.11, 0.6)
X(shimmer(1.0), 377.9, 0.6); X(whoosh(0.6), 382.6, 0.5); X(kaching(), 383.6, 0.5); X(shimmer(1.5), 385.2, 0.4)
for k in range(12): X(thump(300, 0.06), 388.3 + k * 0.2, 0.15)
X(whoosh(0.3), 394.5, 0.4); X(engine(2.0, 60, 90), 395.6, 0.5); X(slam(), 398.4, 0.4); X(shimmer(0.8), 398.8, 0.4); X(ding(), 403.2, 0.4); X(shimmer(0.7), 405.8, 0.4)
# --- Der Anruf
X(buzz(3.0), 407.95, 0.7); X(shimmer(0.6), 416.3, 0.3)
for x in [418.6, 418.85, 419.1]: X(thump(140, 0.15), x, 1.1)
X(lowpass_noise(0.6, 800, 0.3), 420.6, 0.5); X(whoosh(2.0), 427.8, 0.4); X(thump(50, 1.0), 438.8, 0.7); X(whoosh(0.4), 441.7, 0.5); X(whoosh(2.0), 443.2, 0.4)
for x in [452.57, 453.03, 454.29, 455.3]: X(thump(55, 0.5), x, 0.7)
X(pop(300), 456.0, 0.4); X(engine(3.5, 45, 60), 463.0, 0.5); X(hiss(1.0), 466.2, 0.6); X(lowpass_noise(6.6, 300, 0.25), 468.72, 0.8)
for k in range(28): X(ping(), 475.5 + k * 0.19, 0.25 if k % 2 else 0.18)
X(lowpass_noise(2.0, 700, 0.1), 480.8, 0.6); X(ding(), 483.6, 0.25); X(scribble(0.6), 492.4, 0.3)
# --- Das Ende
X(whoosh(0.6), 507.6, 0.4); X(rip(), 520.1, 1.0); X(whoosh(0.4), 534.6, 0.3); X(ding(), 547.6, 0.4)
X(clank(), 564.75, 0.7); X(hiss(0.6), 564.9, 0.4); X(buzz(2.0), 579.25, 0.7); X(ping(), 580.6, 0.5); X(ding(), 580.65, 0.5)
X(shimmer(1.0), 586.0, 0.5); X(sting(), 590.1, 0.6); X(shimmer(0.6), 596.2, 0.3)

# ---------------- mix (voice always on top) ----------------
voice = load_voice()
win = int(0.4 * SR); vr = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, "same"))
act = vr > np.percentile(vr, 60) * 0.5
# slow leveler: speech RMS per 0.5 s block (only active speech), smoothed over ~5 s, gain toward 0.13
blk = int(0.5 * SR); nb = N // blk + 1; lv = np.full(nb, np.nan)
for bi in range(nb):
    seg = voice[bi * blk:(bi + 1) * blk]; e = vr[bi * blk:(bi + 1) * blk]; sel = e > 0.008
    if sel.sum() > blk * 0.15: lv[bi] = np.sqrt(np.mean(seg[sel] ** 2))
idx = np.arange(nb); good = ~np.isnan(lv); lv = np.interp(idx, idx[good], np.log(lv[good]))
ker = np.ones(11) / 11; lv = np.convolve(np.pad(lv, 5, mode='edge'), ker, 'valid')
gdb = np.clip((np.log(0.13) - lv) * 0.85, np.log(1.0), np.log(10.0))
gcurve = np.exp(np.interp(np.arange(N) / blk, idx, gdb)).astype(np.float32)
voice = voice * gcurve; gv = float(np.median(gcurve))
voice = np.tanh(voice * 1.0)  # soft limit peaks
# music: even level per section, then ~15 dB under the voice, ducked further while someone speaks
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
for (a, b, *_r) in SECS:
    i, j = int(a * SR), min(N, int(b * SR)); m = rms(music[i:j]); music[i:min(N, j + int(0.4 * SR))] *= (0.026 / m) if m > 1e-5 else 1
sw = np.sqrt(np.convolve(sfx ** 2, np.ones(int(0.05 * SR)) / int(0.05 * SR), "same")); sfx *= 0.16 / max(1e-6, np.percentile(sw[sw > 1e-4], 99))
k = int(0.06 * SR); ve = np.convolve(np.abs(voice), np.ones(k) / k, "same"); ve = np.convolve(ve, np.ones(k) / k, "same")
duck = 1 - 0.5 * np.clip(ve / (np.percentile(ve, 95) * 0.5), 0, 1)
bed = filt(music * duck + sfx * (0.6 + 0.4 * duck), lo=35)
L = voice + bed; R = voice + np.roll(bed, int(0.004 * SR)) * 0.98
mix = np.stack([L, R], 1); mix = np.tanh(mix * 0.9) / np.tanh(0.9)
mix[int(597.4 * SR):] = 0
fade = int(0.02 * SR); mix[:fade] *= np.linspace(0, 1, fade)[:, None]
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
np.save("/tmp/claude-0/voice_n.npy", voice); np.save("/tmp/claude-0/music.npy", music * duck); np.save("/tmp/claude-0/sfx.npy", sfx * (0.6 + 0.4 * duck))
print("ok", len(pcm) / SR, "voice gain", round(float(gv), 2))
