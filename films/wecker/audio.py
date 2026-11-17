"""Der menschliche Wecker — synthesized music bed + SFX, mixed under the user's voice.mp3.
Music sits ~21 dB under the voice (ducked further while speaking). Frame numbers refer to story.js (30 fps)."""
import numpy as np, subprocess, wave

SR = 44100
TOTAL_F = 1522
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR));
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain

def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H *= 1 / (1 + (f / hi) ** order)
    if lo: H *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * H, len(x)).astype(np.float32)

def bandpass(x, fc, q=6):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / (1 + (q * (f / fc - fc / np.maximum(f, 1))) ** 2)
    return np.fft.irfft(X * H, len(x)).astype(np.float32)

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def adsr(n, a=0.01, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR; T = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return (e * np.clip((T - t) / max(r, 1e-4), 0, 1)).astype(np.float32)

# ---------------- instruments ----------------
def pizz(m, dur=0.45, g=1.0):
    f = midi(m); p = max(2, int(SR / f)); n = int(dur * SR)
    y = np.zeros(n + p, np.float32); y[:p] = rng.uniform(-1, 1, p) * np.hanning(p)
    i = p
    while i < n + p:
        k = min(p, n + p - i); y[i:i + k] = 0.5 * (y[i - p:i - p + k] + y[i - p - 1:i - p - 1 + k] if i - p - 1 >= 0 else y[i - p:i - p + k]) * 0.994; i += k
    y = y[p:] * np.exp(-np.arange(n) / SR * 5)
    return filt(y, 60, 3500) * g
def clarinet(m, dur, vib=0.004):
    t = tt(dur); f = midi(m); ph = 2 * np.pi * f * t + vib * 2 * np.pi * np.sin(2 * np.pi * 5.2 * t) * (t > 0.15)
    s = sum(np.sin(k * ph) / k ** 1.1 for k in (1, 3, 5, 7, 9)) + 0.02 * noise(dur)
    return filt(s * adsr(len(t), 0.04, 0.1, 0.85, 0.08), 80, 2600) * 0.5
def whistle(m, dur):
    t = tt(dur); f = midi(m); ph = 2 * np.pi * f * t + 0.012 * 2 * np.pi * np.sin(2 * np.pi * 6 * t)
    s = np.sin(ph) + 0.15 * filt(noise(dur), 1500, 6000) * 0.4
    return (s * adsr(len(t), 0.03, 0.05, 0.9, 0.06)).astype(np.float32) * 0.5
def musicbox(m, dur=1.2):
    t = tt(dur); f = midi(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.5) + 0.35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 7) + 0.18 * np.sin(2 * np.pi * f * 5.43 * t) * np.exp(-t * 11)
    return (s * np.minimum(1, t / 0.002)).astype(np.float32) * 0.6
def accordion(ms, dur):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for det in (-0.25, 0.25):
            f = midi(m) * 2 ** (det / 100 * 6); ph = (f * t) % 1.0; s += (2 * ph - 1) * 0.5
    s = filt(s.astype(np.float32), 120, 2200) * (0.8 + 0.2 * np.sin(2 * np.pi * 4 * t))
    return (s * adsr(len(t), 0.05, 0.1, 0.8, 0.1) / len(ms)).astype(np.float32) * 0.5
def woodblock(p=1.0):
    t = tt(0.12); s = np.sin(2 * np.pi * 900 * p * t) * np.exp(-t * 60) + 0.5 * np.sin(2 * np.pi * 1450 * p * t) * np.exp(-t * 80)
    return s.astype(np.float32) * 0.6
def brush():
    d = 0.14; t = tt(d); return filt(noise(d), 3000, 9000) * np.exp(-t * 30) * 0.3
def kick():
    t = tt(0.35); f = 45 + 80 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
def timp(m, d=1.2):
    t = tt(d); f = midi(m); return ((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 3) + filt(noise(d), 40, 400) * np.exp(-t * 12) * 0.6).astype(np.float32)

# ---------------- sfx ----------------
def whoosh(d=0.45, lo=300, hi=2500):
    t = tt(d); s = filt(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2; return s * 0.7
def pling():
    t = tt(1.4); s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(2637, 1.0, 5), (3951, 0.55, 7), (5274, 0.35, 10), (6640, 0.2, 14)])
    s += filt(noise(1.4), 4000, 12000) * np.exp(-t * 60) * 0.8
    return s.astype(np.float32) * 0.6
def fiyu(d=0.5):
    t = tt(d); f = 2400 - 1500 * t / d; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.25 + filt(noise(d), 1500, 5000) * np.sin(np.pi * t / d) * 0.2
    return s.astype(np.float32)
def tik(p=1.0, g=1.0):
    t = tt(0.06); s = np.sin(2 * np.pi * 3200 * p * t) * np.exp(-t * 120) + filt(noise(0.06), 2000, 8000) * np.exp(-t * 200) * 0.6
    return s.astype(np.float32) * g
def knock(p=1.0):
    t = tt(0.1); s = np.sin(2 * np.pi * 1900 * p * t) * np.exp(-t * 70) + np.sin(2 * np.pi * 700 * p * t) * np.exp(-t * 50) * 0.6 + filt(noise(0.1), 1000, 6000) * np.exp(-t * 150) * 0.5
    return s.astype(np.float32) * 0.8
def puff():
    d = 0.35; t = tt(d); return filt(noise(d), 200, 1800) * np.exp(-t * 10) * np.minimum(1, t / 0.01) * 1.2
def inhale(d=0.5):
    t = tt(d); return filt(noise(d), 600, 4000) * np.sin(np.pi * t / d) ** 1.5 * (0.4 + 0.6 * t / d) * 0.45
def step(p=1.0, g=1.0):
    d = 0.09; t = tt(d); s = filt(noise(d), 100, 1500 * p) * np.exp(-t * 55) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 40) * 0.4
    return s.astype(np.float32) * g
def voice_formant(f0s, vowels, d, breath=0.1):
    """crude vocal synth: glottal pulses -> formant band-passes. f0s/vowels: callables of t in [0,1]"""
    t = tt(d); u = t / d; f0 = f0s(u); ph = np.cumsum(f0) / SR
    src = (2 * (ph % 1) - 1) ** 3 + breath * noise(d)
    out = np.zeros(len(t), np.float32); seg = 2048
    for i in range(0, len(t), seg):
        k = slice(i, min(len(t), i + seg + 512)); F1, F2, F3 = vowels(u[i])
        piece = sum(bandpass(src[k].astype(np.float32), fc, 5) * a for fc, a in ((F1, 1.0), (F2, 0.6), (F3, 0.3)))
        w = np.ones(len(piece)); w[-min(512, len(w)):] = np.linspace(1, 0, min(512, len(w))); w[:min(512, len(w))] *= np.linspace(0, 1, min(512, len(w))) if i else 1
        out[k] += piece * w
    return out * adsr(len(t), 0.02, 0.05, 0.9, 0.08)
def bark():
    return voice_formant(lambda u: 380 - 120 * u, lambda u: (700, 1300, 2600), 0.16, 0.4) * 1.4
def meow():
    return voice_formant(lambda u: 520 + 280 * np.sin(np.pi * np.minimum(1, u * 1.2)), lambda u: (400 + 500 * np.sin(np.pi * u), 1800 - 600 * u, 3000), 0.7, 0.15) * 0.9
def scream():
    return voice_formant(lambda u: 520 + 220 * np.minimum(1, u * 3) + 25 * np.sin(2 * np.pi * 7 * u * 0.9), lambda u: (850, 1250, 2700), 0.85, 0.25) * 1.3
def shout(seed):
    r = np.random.default_rng(seed); v = [(700, 1200, 2600), (400, 900, 2400), (300, 2200, 3000), (500, 1000, 2500)]
    a, b = v[r.integers(4)], v[r.integers(4)]
    return voice_formant(lambda u: 210 + 60 * np.sin(np.pi * u), lambda u: a if u < 0.5 else b, 0.55, 0.2)
def snore(d=1.2, f0=55, g=1.0):
    t = tt(d); env = np.sin(np.pi * t / d) ** 2
    buzz = ((np.cumsum(f0 + 15 * np.sin(np.pi * t / d)) / SR) % 1 < 0.25).astype(np.float32)
    return (filt(buzz * 0.6 + noise(d) * 0.25, 60, 600) * env).astype(np.float32) * g
def sweet_snore(d=1.0):
    t = tt(d); s = snore(d * 0.55, 90, 0.8); w = filt(noise(d * 0.45), 1500, 5000) * np.sin(np.pi * tt(d * 0.45) / (d * 0.45)) * 0.25
    return np.concatenate([s, w.astype(np.float32)])
def boing():
    t = tt(0.5); f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)).astype(np.float32) * 0.6
def creak(d=0.5, f0=160):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * t / d)); pulses = ((np.cumsum(rate) / SR) % 1 < 0.1).astype(np.float32)
    return filt(pulses * np.sin(np.pi * t / d), 300, 2500) * 1.2
def clang():
    d = 2.2; t = tt(d); s = np.zeros(len(t))
    for f, k, a in [(220, 1.6, 1), (331, 2.0, 0.8), (467, 2.4, 0.7), (612, 3.0, 0.6), (897, 4, 0.5), (1210, 5, 0.4), (1630, 7, 0.3)]: s += a * np.sin(2 * np.pi * f * t) * np.exp(-t * k)
    s += filt(noise(d), 200, 3000) * np.exp(-t * 25) * 1.5
    s = s.astype(np.float32); k = kick(); s[:len(k)] += k * 1.2
    rattle = filt(noise(d), 1500, 6000) * np.exp(-t * 4) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * t))) * 0.15
    return (s * 0.35 + rattle).astype(np.float32)
def coins():
    out = np.zeros(int(0.9 * SR), np.float32)
    for k in range(6):
        t = tt(0.5); f = rng.uniform(3500, 6000); s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.48 * t)) * np.exp(-t * 18)
        place_local(out, s.astype(np.float32) * 0.35, rng.uniform(0, 0.35))
    return out
def place_local(buf, sig, t0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i]
def rustle(d=0.4):
    t = tt(d); return filt(noise(d), 1500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / d) * 0.35
def flutter(d=0.8):
    t = tt(d); return filt(noise(d), 200, 1500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * t))) * np.sin(np.pi * t / d) * 0.4
def tick_tock(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d / 0.25)): place_local(out, tik(1.0 if k % 2 else 0.75, 0.5), k * 0.25 + rng.uniform(0, 0.01))
    for k in range(int(d / 0.33)): place_local(out, tik(1.3, 0.3), k * 0.33 + 0.1)
    return out
def steam(d=1.0):
    t = tt(d); return filt(noise(d), 2500, 10000) * np.minimum(1, t / 0.05) * np.exp(-t * 2.5) * 0.4
def machine(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d / 0.42)): t = tt(0.25); place_local(out, (np.sin(2 * np.pi * 60 * t) * np.exp(-t * 18) + filt(noise(0.25), 100, 900) * np.exp(-t * 25) * 0.5).astype(np.float32), k * 0.42)
    return out + filt(noise(d), 40, 300) * 0.25
def factory_whistle(d=2.0):
    t = tt(d); f = 330 * np.minimum(1, 0.8 + t / 0.25 * 0.2); s = sum(np.sin(2 * np.pi * np.cumsum(f * r) / SR) / (i + 1) for i, r in enumerate([1, 1.26, 1.5, 2.0]))
    s += filt(noise(d), 1500, 6000) * 0.25
    return (s * adsr(len(t), 0.12, 0.2, 0.85, 0.35)).astype(np.float32) * 0.5
def slam():
    d = 0.4; t = tt(d); return (filt(noise(d), 60, 1500) * np.exp(-t * 18) * 1.2 + np.sin(2 * np.pi * 80 * t) * np.exp(-t * 14)).astype(np.float32)
def birds(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 4)):
        dd = rng.uniform(0.06, 0.14); t = tt(dd); f0 = rng.uniform(2600, 4200); f = f0 + 1400 * np.sin(np.pi * t / dd) * rng.choice([-1, 1])
        place_local(out, (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dd)).astype(np.float32) * 0.25, rng.uniform(0, d - 0.2))
    return out
def clop(d, rate=0.27):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d / rate)): place_local(out, knock(0.55) * 0.7, k * rate); place_local(out, knock(0.62) * 0.5, k * rate + 0.09)
    return out + filt(noise(d), 60, 400) * 0.35
def wind(d):
    t = tt(d); return filt(noise(d), 150, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * t + 1)) * 0.5
def hum(d):
    t = tt(d); return (filt(noise(d), 50, 200) * 0.6 + 0.08 * np.sin(2 * np.pi * 58 * t)).astype(np.float32)
def shimmer():
    out = np.zeros(int(0.9 * SR), np.float32)
    for k, m in enumerate([84, 88, 91, 96]): place_local(out, musicbox(m, 0.8) * 0.5, k * 0.05)
    return out
def splat():
    t = tt(0.2); return (filt(noise(0.2), 200, 2500) * np.exp(-t * 30)).astype(np.float32)

# ======================= MUSIC =======================
mus = np.zeros(N, np.float32)
def seq(notes, t0, bpm, inst, g=1.0):
    b = 60 / bpm
    for beat, m, dur in notes:
        if m is None: continue
        place(mus, inst(m, dur * b), t0 + beat * b, g)

# A) 0.0 - 7.5  sneaky "burglar" theme, D minor, 104 bpm: pizz walking bass, low clarinet creep, brushes
bpm = 104; b = 60 / bpm
bass = [38, 45, 38, 45, 46, 41, 45, 40, 38, 45, 38, 45, 43, 46, 45, 37]
for k, m in enumerate(bass): place(mus, pizz(m, 0.35), k * b * 0.5 + 0.05, 1.0)
for k in range(28): place(mus, brush(), k * b * 0.5 + b * 0.25, 0.6)
clar = [(0, 50, 0.75), (1, 53, 0.4), (1.5, 52, 0.4), (2, 50, 1.5), (4, 50, 0.4), (4.5, 51, 0.4), (5, 52, 0.4), (5.5, 53, 0.4), (6, 55, 0.4), (6.5, 56, 0.4), (7, 57, 1.5), (9, 58, 0.5), (9.5, 57, 0.5), (10, 56, 2.5)]
seq(clar, 0.05, bpm, clarinet, 0.9)
# fade with the "…" pauses: dips at 4.7 and 6.2, gone at 7.45
tA = np.arange(N) / SR
fadeA = np.interp(tA, [0, 4.6, 4.9, 5.2, 6.1, 6.4, 7.0, 7.45], [1, 1, 0.55, 0.6, 0.35, 0.3, 0.12, 0.0])
mus *= fadeA.astype(np.float32)
# B) 7.76 Pling sting: music box "ding-dong" right after the pling
place(mus, musicbox(96, 1.2), 7.98, 1.4); place(mus, musicbox(91, 1.2), 8.16, 1.2)
# B) 8.6 - 16.9 warm comic street tune, F major, 112 bpm: oom-pah accordion, pizz bass, music box + whistle melody
bpm = 112; b = 60 / bpm; t0 = 8.6
chords = [[53, 57, 60], [53, 57, 60], [55, 58, 62], [48, 52, 55], [53, 57, 60], [50, 53, 57], [55, 58, 62], [48, 52, 55]]
roots = [41, 41, 43, 36, 41, 38, 43, 36]
for bar in range(4):
    for beat in range(4):
        tb = t0 + (bar * 4 + beat) * b; ch = chords[bar * 2 + beat // 2]
        if tb > 16.9: break
        if beat % 2 == 0: place(mus, pizz(roots[bar * 2 + beat // 2], 0.4), tb, 1.0)
        else: place(mus, accordion(ch, b * 0.45), tb, 0.55)
mel = [(0, 72, 0.5), (0.5, 74, 0.5), (1, 76, 1), (2, 72, 0.5), (2.5, 69, 0.5), (3, 72, 1), (4, 74, 0.5), (4.5, 76, 0.5), (5, 77, 1), (6, 76, 0.5), (6.5, 74, 0.5), (7, 72, 1),
       (8, 72, 0.5), (8.5, 74, 0.5), (9, 76, 1), (10, 79, 1), (11, 77, 0.5), (11.5, 76, 0.5), (12, 74, 1), (13, 72, 0.5), (13.5, 74, 0.5), (14, 72, 2)]
seq(mel, t0, bpm, lambda m, d: musicbox(m, max(0.6, d)), 0.7)
seq([(n[0], n[1] - 12, n[2]) for n in mel[8:]], t0, bpm, whistle, 0.35)
# C) 17.0 - 19.3 a sad note: D minor accordion swell + falling music box
place(mus, accordion([50, 53, 57], 2.2), 17.0, 0.7); place(mus, pizz(38, 0.8), 17.0, 0.9)
for k, m in enumerate([81, 79, 77, 74]): place(mus, musicbox(m, 0.9), 17.15 + k * 0.5, 0.6)
# D) 19.4 - 22.1 factory: tense low pizz ostinato in C minor + woodblock clock; 22.17 drum hit with the KLANG
bpm = 120; b = 60 / bpm
for k in range(int((22.1 - 19.4) / (b / 2))):
    place(mus, pizz([36, 43, 39, 43][k % 4], 0.25), 19.4 + k * b / 2, 0.9); place(mus, woodblock(1.0 if k % 2 else 0.8), 19.4 + k * b / 2, 0.35)
place(mus, accordion([48, 51, 55], 2.6), 19.45, 0.35)
place(mus, timp(36, 1.4), F(665), 1.8); place(mus, kick(), F(665), 1.2)
# E) 23.2 - 34.3 cheerful "on the job" theme, F major, 118 bpm (accents land on pea plings)
bpm = 118; b = 60 / bpm; t0 = 23.25; E_END = 34.3
progE = [([53, 57, 60], 41), ([58, 62, 65], 46), ([48, 52, 55], 36), ([53, 57, 60], 41)]
k = 0
while t0 + k * b < E_END:
    tb = t0 + k * b; ch, r = progE[(k // 4) % 4]
    place(mus, pizz(r if k % 2 == 0 else r + 7, 0.3), tb, 0.95)
    if k % 2: place(mus, accordion(ch, b * 0.4), tb, 0.45)
    place(mus, woodblock(1.2 if k % 2 else 1.0), tb, 0.25)
    k += 1
melE = [(0, 77, 0.5), (0.5, 76, 0.5), (1, 77, 0.5), (1.5, 81, 0.5), (2, 79, 1), (3, 77, 1), (4, 74, 0.5), (4.5, 76, 0.5), (5, 77, 1), (6, 76, 2),
        (8, 72, 0.5), (8.5, 76, 0.5), (9, 79, 1), (10, 77, 0.5), (10.5, 76, 0.5), (11, 74, 1), (12, 72, 1), (13, 76, 1), (14, 77, 2)]
for rep in range(2): seq(melE, t0 + rep * 16 * b, bpm, whistle, 0.55)
seq([(n[0], n[1], n[2]) for n in melE[:10]], t0 + 32 * b, bpm, whistle, 0.5)
for tp in [F(926), F(941), F(1000)]: place(mus, musicbox(96, 0.8), tp + 0.03, 1.0)
for tp in [F(868), F(878), F(888)]: place(mus, musicbox(91, 0.5), tp, 0.6)
mus *= np.interp(tA, [0, E_END - 0.1, E_END + 0.05], [1, 1, 1]).astype(np.float32)
# F) 34.5 - 35.4 the question: a rising clarinet "hm?" then nothing until 36.7
place(mus, clarinet(62, 0.45), 34.55, 0.9); place(mus, clarinet(67, 0.7, 0.01), 35.0, 0.9); place(mus, pizz(43, 0.5), 35.0, 0.7)
# G) 36.7 - 39.6 lazy lullaby: slow music box waltz, F major
bpm = 84; b = 60 / bpm; t0 = 36.75
lull = [(0, 77, 1), (1, 81, 1), (2, 84, 1), (3, 81, 2), (5, 77, 1), (6, 79, 1.5), (7.5, 77, 1.5)]
seq(lull, t0, bpm, lambda m, d: musicbox(m, 1.4), 0.7)
for k in range(3): place(mus, accordion([53, 57, 60] if k != 1 else [48, 52, 55], b * 2.6), t0 + k * 3 * b, 0.22)
# H) 39.7 - 50.7 tongue-twister: accelerating staccato pizz + woodblock + clarinet hops; big accent at the whistle
t = 39.75; k = 0; H_END = 49.9
while t < H_END:
    bpmH = 112 + (t - 39.75) / (H_END - 39.75) * 46; bb = 60 / bpmH
    place(mus, pizz([41, 48, 45, 48][k % 4], 0.22), t, 0.95); place(mus, woodblock([1.0, 1.3, 1.1, 1.5][k % 4]), t, 0.32)
    if k % 2 == 0: place(mus, clarinet([65, 69, 72, 69, 67, 70, 74, 70][(k // 2) % 8], bb * 0.4, 0), t, 0.55)
    t += bb / 2; k += 1
# accents on the "Wecker" beats (camera moves)
for tw in [42.45, 43.45, 44.68, 45.18, 46.20, 48.76]: place(mus, musicbox(89, 0.4), tw - 0.02, 0.8)
# finale: hurried run up + stab after the whistle
for k, m in enumerate([60, 62, 64, 65, 67, 69, 71, 72]): place(mus, pizz(m, 0.15), 49.92 + k * 0.045, 0.8)
place(mus, accordion([53, 57, 60, 65], 0.35), 50.32, 1.0); place(mus, pizz(41, 0.5), 50.32, 1.0); place(mus, kick(), 50.32, 0.8)
mus = filt(mus, 50, 9000)

# ======================= SFX =======================
sfx = np.zeros(N, np.float32)
amb = np.zeros(N, np.float32)
# night ambience 0 - 17.0 and 23.2 - 36.6 (wind, chimney hum)
for a_, b_ in [(0, 17.0), (23.2, 36.6)]:
    w = wind(b_ - a_) + hum(b_ - a_) * 0.5; e = np.minimum(1, tt(b_ - a_) / 0.3) * np.minimum(1, (b_ - a_ - tt(b_ - a_)) / 0.3); place(amb, (w * e).astype(np.float32), a_, 0.5)
place(sfx, whoosh(0.5, 200, 2000), 0.0, 0.6)
place(sfx, filt(bark(), 200, 2500), 0.45, 0.35); place(sfx, filt(bark(), 200, 2500), 0.72, 0.28)   # distant dog
for k in range(10): place(sfx, step(0.6, 0.5), 0.15 + k * 0.32)                                    # sneaky tiptoe steps (S1-S2)
place(sfx, meow(), F(70), 0.32)                                                                    # cat on the roof
for k in range(4): place(sfx, step(0.6, 0.45), F(62) + k * 0.32)
place(sfx, rustle(0.4), F(110), 0.6)                                                               # pipe raised
place(sfx, inhale(0.55), F(193), 0.8)                                                              # deep breath, cheeks puff
place(sfx, puff(), F(209), 1.0)                                                                    # "püff"
place(sfx, fiyu(0.48), F(219), 0.9)                                                                # pea flies
place(sfx, pling(), F(233), 1.0)                                                                   # PLING (frame 233 = 7.77 s)
for fr, g in [(268, 0.55), (284, 0.4), (294, 0.28)]: place(sfx, tik(1.2, g), F(fr))               # pea bounces
for k in range(5): place(sfx, tik(1.6, 0.12), F(296) + k * 0.05)                                   # rolls into the pile
place(sfx, rustle(0.35), F(315), 0.7)                                                              # pouch
place(sfx, whoosh(0.3, 400, 3000), F(397), 0.5); place(sfx, shimmer(), F(401), 0.7)               # she spins, lantern up
# bedroom
place(sfx, snore(1.1, 55, 0.8), F(425) - 0.3, 0.6); place(sfx, filt(pling(), 200, 2500), F(427), 0.6)
place(sfx, boing(), F(430), 0.7); place(sfx, creak(0.4, 140), F(431), 0.5); place(sfx, snore(1.2, 70, 0.6), F(440), 0.5)
place(sfx, creak(0.5, 110), F(468), 0.6)                                                           # window sash
# clock shop
place(sfx, tick_tock(2.4), 17.0, 0.55); place(sfx, flutter(1.0), F(548), 0.6)
# factory
place(sfx, machine(3.9), 19.4, 0.55); place(sfx, steam(1.2), 19.6, 0.5); place(sfx, steam(1.0), 21.0, 0.4)
for k in range(14): place(sfx, step(1.0, 0.25), 19.45 + k * 0.19)
place(sfx, tik(0.7, 0.6), F(600))                                                                  # watch lid click
for k in range(7): place(sfx, step(1.2, 0.5), F(651) + k * 0.12)                                   # late worker sprinting
place(sfx, whoosh(0.25, 300, 2000), F(660), 0.4); place(sfx, clang(), F(665), 1.1)                # KLANG
# coins
place(sfx, coins(), F(714), 0.9); place(sfx, rustle(0.3), F(744), 0.6); place(sfx, coins(), F(746), 0.4)
for k in range(8): place(sfx, step(0.8, 0.4), F(778) + k * 0.3)
for fr in [788, 806, 826, 842]: place(sfx, tik(0.5, 0.15), F(fr))
# pole taps and peas
for fr in [868, 878, 888]: place(sfx, knock(1.2), F(fr), 0.9)
place(sfx, whoosh(0.25), F(912), 0.6); place(sfx, whoosh(0.25), F(946), 0.6)
for fr in [920, 935]: place(sfx, puff(), F(fr), 0.6); place(sfx, fiyu(0.2), F(fr) + 0.02, 0.5)
for fr in [926, 941]: place(sfx, pling(), F(fr), 0.75)
for k in range(8): place(sfx, step(0.7, 0.4), F(965) + k * 0.33)                                   # tap tap tap
place(sfx, snore(0.6, 60), F(972), 0.4)
place(sfx, puff(), F(992), 0.7); place(sfx, pling(), F(1000), 0.8); place(sfx, boing(), F(1001), 0.35)
# day street
place(amb, filt(noise(1.0), 300, 3000) * 0.25, F(1099), 0.8)
place(sfx, clop(0.95), F(1099), 0.5)
for k, fr in enumerate([1100, 1112]): place(sfx, shout(k + 3), F(fr), 0.35)
# her room: muffled street + sweet snore
place(sfx, filt(clop(2.1) + noise(2.1) * 0.1, 100, 700), F(1126), 0.35)
for k in range(2): place(sfx, sweet_snore(1.0), F(1130) + k * 1.05, 0.55)
place(sfx, flutter(0.6) * 0.5, F(1160), 0.4)
# dawn
place(sfx, birds(2.2), F(1190), 0.5); place(sfx, meow(), F(1215), 0.2)
for k in range(3): place(sfx, snore(1.0, 50, 0.9), F(1262) + k * 1.05, 0.55)                      # old man
place(sfx, creak(0.4, 90), F(1341), 0.45); place(sfx, whoosh(0.35, 200, 2500), F(1355), 0.7)
for k in range(2): place(sfx, sweet_snore(1.0), F(1368) + k * 1.05, 0.5)
place(sfx, filt(puff(), 300, 1500), F(1405), 0.5); place(sfx, tik(1.1, 0.5), F(1418)); place(sfx, tik(1.3, 0.3), F(1426))
# family + whistle + panic
for k in range(2): place(sfx, snore(0.9, 55 + k * 12, 0.9), F(1440) + k * 0.95, 0.5); place(sfx, sweet_snore(0.9), F(1445) + k * 0.95, 0.35)
place(sfx, factory_whistle(1.7), F(1486), 0.65)
place(sfx, scream(), F(1497), 0.75)
for k, fr in enumerate([1499, 1503, 1507, 1512]): place(sfx, slam(), F(fr), 0.5)
for k in range(14): place(sfx, step(1.1, 0.45), F(1498) + k * 0.06)
place(sfx, whoosh(0.5, 200, 2000), F(1498), 0.5)
sfx = sfx + amb

# ======================= MIX =======================
voice = load_voice()
win = int(0.05 * SR)
def rms_env(x):
    return np.sqrt(np.convolve(x ** 2, np.ones(win) / win, "same") + 1e-12)
ve = rms_env(voice)
speech = ve > 0.02
v_rms = np.sqrt(np.mean(voice[speech] ** 2))
# music: ~21 dB under the voice while speaking, ~15 dB under in the gaps (smooth ducking)
m_rms = np.sqrt(np.mean(mus[np.abs(mus) > 1e-4] ** 2)) + 1e-9
mus *= (v_rms * 10 ** (-17 / 20)) / m_rms
duck = np.where(speech, 10 ** (-4 / 20), 1.0).astype(np.float32)
k = int(0.12 * SR); duck = np.convolve(duck, np.ones(k) / k, "same").astype(np.float32)
s_rms = np.sqrt(np.mean(sfx[np.abs(sfx) > 1e-4] ** 2)) + 1e-9
sfx *= (v_rms * 10 ** (-13 / 20)) / s_rms
sduck = np.convolve(np.where(speech, 0.6, 1.0), np.ones(k) / k, "same").astype(np.float32)
mix = voice + mus * duck + sfx * sduck
peak = np.max(np.abs(mix)); mix = mix / max(1.0, peak / 0.98)
fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# report levels
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("voice rms (speech) %.1f dB | music under speech %.1f dB | music in gaps %.1f dB" % (db(voice[speech]), db((mus * duck)[speech]), db((mus * duck)[~speech & (np.arange(N) / SR < 50)])))
print("ok", len(pcm) / SR)
