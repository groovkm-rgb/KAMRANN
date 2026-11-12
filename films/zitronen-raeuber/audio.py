"""Der Zitronensaft-Räuber — synthesized light comic-heist music bed + SFX, mixed UNDER the user's voice.mp3.
Nothing here speaks words: the few 'vocal' effects (sour 'iiih', 'yeah', anchor mumble, protest) are formant gibberish.
Music sits ~21 dB under the voice and is ducked further wherever the voice is active."""
import numpy as np, subprocess, wave

SR = 48000
FPS = 30
TOTAL = 1323
DUR = TOTAL / FPS
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / FPS
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR)); j = min(N, i + len(sig))
    if i < 0: sig = sig[-i:]; i = 0; j = min(N, len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain
def adsr(n, a=0.005, d=0.1, s=0.6, r=0.1):
    t = np.arange(n) / SR; T = n / SR
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    return (e * np.clip((T - t) / r, 0, 1)).astype(np.float32)

# ---------------- instruments ----------------
def pizz(f, d=0.28, b=0.55):
    t = tt(d); s = sum((b ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(7))
    return (s * np.exp(-t * 14) * np.minimum(1, t / 0.002)).astype(np.float32) * 0.6
def bass(f, d=0.22):
    t = tt(d); ph = 2 * np.pi * f * t; s = np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)
    return (s * np.exp(-t * 7) * np.minimum(1, t / 0.004) * np.clip((d - t) / 0.02, 0, 1)).astype(np.float32)
def clar(f, d, vib=0.006):
    t = tt(d); ph = 2 * np.pi * f * t + vib * f / 5.5 * np.sin(2 * np.pi * 5.5 * t)
    s = sum(np.sin((2 * k + 1) * ph) / (2 * k + 1) ** 1.1 for k in range(6)) + 0.05 * np.sin(2 * ph)
    return filt((s * adsr(len(t), 0.03, 0.1, 0.8, 0.06)).astype(np.float32), hi=2600) * 0.5
def xylo(f, d=0.45):
    t = tt(d); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    return (s * np.minimum(1, t / 0.001)).astype(np.float32) * 0.7
def brass(fs, d, bright=2400):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.2 for k in range(10))
    return filt((s * adsr(len(t), 0.04, 0.12, 0.75, 0.12)).astype(np.float32), hi=bright) / len(fs) * 0.6
def kick(): t = tt(0.3); f = 48 + 70 * np.exp(-t * 32); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)).astype(np.float32)
def hat(open_=False): d = 0.18 if open_ else 0.05; t = tt(d); return filt(noise(d), lo=6000) * np.exp(-t * (14 if open_ else 70)).astype(np.float32) * 0.5
def brush(): t = tt(0.22); return filt(noise(0.22), lo=1500, hi=7000) * (np.exp(-t * 16) * 0.6).astype(np.float32)
def snare(): t = tt(0.16); return (filt(noise(0.16), lo=900) * np.exp(-t * 26) * 0.6 + np.sin(2 * np.pi * 185 * t) * np.exp(-t * 22) * 0.4).astype(np.float32)
def cymbal(d=1.6): t = tt(d); return filt(noise(d), lo=4000) * (np.exp(-t * 2.2) * 0.45).astype(np.float32)
def timp(f=73, d=0.9): t = tt(d); return (np.sin(2 * np.pi * f * t * (1 + 0.04 * np.exp(-t * 9))) * np.exp(-t * 3.5) + filt(noise(d), hi=300) * np.exp(-t * 18) * 0.4).astype(np.float32)
def trombone(f0, f1, d, wah=True):
    t = tt(d); f = np.linspace(f0, f1, len(t)) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t) * (t / d)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin((k + 1) * ph) / (k + 1) for k in range(14)).astype(np.float32)
    # time-varying low-pass (wah): crossfade between dark and bright versions
    dark, bright = filt(s, hi=500), filt(s, hi=2600)
    w = (0.5 - 0.5 * np.cos(np.pi * np.clip(t / (d * 0.5), 0, 1))) if wah else np.ones(len(t))
    return ((dark * (1 - w) + bright * w) * adsr(len(t), 0.05, 0.1, 0.85, 0.15)).astype(np.float32) * 0.5

# ---------------- formant 'voices' (no words) ----------------
def formant(f0s, vowels, d, breath=0.05):
    """f0s: (start,end); vowels: list of (F1,F2,F3) keyframes spread over d."""
    n = int(d * SR); t = np.arange(n) / SR
    f0 = np.linspace(f0s[0], f0s[1], n) * (1 + 0.02 * np.sin(2 * np.pi * 5.2 * t))
    src = (np.mod(np.cumsum(f0) / SR, 1) * 2 - 1).astype(np.float64) + breath * rng.standard_normal(n)
    V = np.array(vowels, float); k = np.linspace(0, len(V) - 1, n); i0 = np.floor(k).astype(int); i1 = np.minimum(i0 + 1, len(V) - 1); fr = (k - i0)[:, None]
    FF = V[i0] * (1 - fr) + V[i1] * fr; out = np.zeros(n)
    for j, bw in enumerate([90, 120, 160]):
        w = 2 * np.pi * FF[:, j] / SR; r = np.exp(-np.pi * bw / SR); a1 = 2 * r * np.cos(w); a2 = -r * r; y1 = y2 = 0.0; y = np.empty(n)
        for m in range(n):
            v = src[m] + a1[m] * y1 + a2 * y2; y[m] = v; y2 = y1; y1 = v
        out += y / (1 + j)
    out = out / (np.abs(out).max() + 1e-9)
    return (out * adsr(n, 0.02, 0.05, 0.9, 0.08)).astype(np.float32)
VOW = {'i': (300, 2300, 3000), 'e': (480, 1900, 2600), 'a': (750, 1250, 2500), 'o': (480, 850, 2500), 'u': (330, 900, 2300), 'ae': (650, 1700, 2500)}
def babble(d, f0=150, seed=1):
    r = np.random.default_rng(seed); out = []; tot = 0
    while tot < d:
        sd = r.uniform(0.09, 0.2); v = [VOW[r.choice(list(VOW))] for _ in range(2)]
        out.append(formant((f0 * r.uniform(0.9, 1.15), f0 * r.uniform(0.85, 1.1)), v, sd, 0.08)); gap = r.uniform(0.01, 0.06); out.append(np.zeros(int(gap * SR), np.float32)); tot += sd + gap
    return np.concatenate(out)[: int(d * SR)]

# ---------------- sfx ----------------
def whoosh(d=0.35, up=True):
    t = tt(d); n = noise(d); lo = filt(n, lo=300, hi=1200); hi = filt(n, lo=1200, hi=5000); w = t / d if up else 1 - t / d
    return ((lo * (1 - w) + hi * w) * np.sin(np.pi * t / d) ** 2 * 0.8).astype(np.float32)
def squelch(d=0.6):
    t = tt(d); s = filt(noise(d), hi=900) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) ** 2) * np.sin(np.pi * t / d)
    gl = np.sin(2 * np.pi * np.cumsum(220 + 160 * np.sin(2 * np.pi * 3 * t)) / SR) * np.exp(-t * 4) * 0.25
    return (s * 1.3 + gl).astype(np.float32)
def plip(f=1400): t = tt(0.12); f_ = f * (1 + 0.8 * np.exp(-t * 60)); return (np.sin(2 * np.pi * np.cumsum(f_) / SR) * np.exp(-t * 40)).astype(np.float32) * 0.5
def splat(): t = tt(0.25); return (filt(noise(0.25), lo=300, hi=3000) * np.exp(-t * 20) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 25) * 0.4).astype(np.float32)
def ding(f=1568, d=1.0): t = tt(d); return (sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + 3 * k)) / k for k in (1, 2.76, 5.4)) * 0.5).astype(np.float32)
def chime(): return np.concatenate([ding(1319, 0.5)[: int(0.32 * SR)], ding(1047, 1.0)])
def sparkle(d=0.8, seed=3):
    r = np.random.default_rng(seed); out = np.zeros(int(d * SR), np.float32)
    for k in range(12): s = ding(r.uniform(2400, 4800), 0.35) * r.uniform(0.2, 0.5); i = int(r.uniform(0, d - 0.3) * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out
def servo(d=0.6): t = tt(d); f = 340 + 60 * np.sin(np.pi * t / d); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3; return filt(s.astype(np.float32), hi=2500) * np.sin(np.pi * t / d) * 0.6
def step(hard=True): t = tt(0.12); s = filt(noise(0.12), lo=200, hi=3500 if hard else 1500) * np.exp(-t * 45); return (s + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 40) * 0.5).astype(np.float32)
def static(d=0.15): t = tt(d); return (filt(noise(d), lo=800) * 0.5).astype(np.float32)
def hit(): t = tt(0.5); return (np.sin(2 * np.pi * 60 * t * (1 + np.exp(-t * 20))) * np.exp(-t * 8) + filt(noise(0.5), hi=2500) * np.exp(-t * 14) * 0.6).astype(np.float32)
def pop(): t = tt(0.12); return (np.sin(2 * np.pi * np.cumsum(900 * np.exp(-t * 20) + 300) / SR) * np.exp(-t * 30)).astype(np.float32)
def gasp(seed): return formant((260, 320), [VOW['a'], VOW['ae']], 0.35, 0.9) * 0.6
def rustle(d=0.4): t = tt(d); return filt(noise(d), lo=2000, hi=8000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t))).astype(np.float32) * np.sin(np.pi * t / d) * 0.6
def sizzle(d): t = tt(d); s = filt(noise(d), lo=3000) * 0.12; c = np.zeros(len(t), np.float32)
def crackle(d, seed=4):
    r = np.random.default_rng(seed); out = filt(noise(d), lo=3500) * 0.06
    for k in range(int(d * 14)): i = int(r.uniform(0, d - 0.02) * SR); out[i:i + 300] += (r.standard_normal(300) * np.exp(-np.arange(300) / 50)).astype(np.float32) * 0.5
    return out
def click(f=2400): t = tt(0.04); return (filt(noise(0.04), lo=f) * np.exp(-t * 160) * 1.2).astype(np.float32)
def shutter(): return np.concatenate([click(2000), np.zeros(int(0.05 * SR), np.float32), click(3000) * 0.8])
def flashpop(): t = tt(0.5); return (np.sin(2 * np.pi * np.cumsum(3000 - 2400 * t / 0.5) / SR) * np.exp(-t * 7) * 0.15 + filt(noise(0.5), lo=2000) * np.exp(-t * 25) * 0.4).astype(np.float32)
def motor(d=0.6, f=170): t = tt(d); s = np.sign(np.sin(2 * np.pi * f * t)) * 0.25 + filt(noise(d), hi=2000) * 0.2; return (filt(s.astype(np.float32), hi=1800) * adsr(len(t), 0.03, 0.05, 1, 0.05)).astype(np.float32)
def ratchet(n=6, sp=0.05): return np.concatenate([np.concatenate([click(3500), np.zeros(int(sp * SR), np.float32)]) for _ in range(n)])
def scratch(): t = tt(0.4); f = 500 + 1200 * np.abs(np.sin(2 * np.pi * 2.5 * t)); s = filt(noise(0.4), lo=400, hi=3000) * 0.5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3; return (s * np.sin(np.pi * t / 0.4)).astype(np.float32)
def rewind(d): t = tt(d); f = 600 + 2600 * (t / d) ** 0.7 + 200 * np.sin(2 * np.pi * 23 * t); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.2 + filt(noise(d), lo=2000) * 0.15; return filt(s.astype(np.float32), hi=6000) * adsr(len(t), 0.05, 0.1, 1, 0.08)
def crunch(): t = tt(0.1); return (filt(noise(0.1), lo=1500, hi=7000) * np.exp(-t * 35) * (0.5 + 0.5 * (rng.random(len(t)) > 0.6))).astype(np.float32)
def spray(): t = tt(0.6); return (filt(noise(0.6), lo=600, hi=5000) * np.exp(-t * 4) * np.minimum(1, t / 0.02)).astype(np.float32)
def knock(): t = tt(0.16); return (np.sin(2 * np.pi * 180 * t) * np.exp(-t * 35) + filt(noise(0.16), hi=1800) * np.exp(-t * 50) * 0.8).astype(np.float32)
def creak(d=0.7, f0=110):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.1 * t / d)); ph = np.cumsum(rate) / SR
    s = filt((np.mod(ph, 1) < 0.07).astype(np.float32) * (0.6 + 0.4 * rng.random(len(t)).astype(np.float32)), lo=200, hi=2500) * np.sin(np.pi * t / d); return s * 2.2
def crickets(d):
    t = tt(d); out = np.zeros(len(t), np.float32)
    for k, f in enumerate([4300, 4700]): gate = (np.mod(t * (2.1 + k * 0.4), 1) < 0.25) * (np.mod(t * 38, 1) < 0.5); out += (np.sin(2 * np.pi * f * t) * gate).astype(np.float32) * 0.1
    return filt(out, hi=7000)
def slide(): t = tt(0.3); return filt(noise(0.3), lo=1500, hi=6000) * (np.sin(np.pi * t / 0.3) * 0.5).astype(np.float32)
def slam(): t = tt(0.5); return (np.sin(2 * np.pi * 110 * t) * np.exp(-t * 14) + filt(noise(0.5), hi=3000) * np.exp(-t * 20) + np.sin(2 * np.pi * 860 * t) * np.exp(-t * 9) * 0.15).astype(np.float32)
def bulb(): return ding(2093, 0.8) * 0.8 + ding(3136, 0.8) * 0.3
def boing(): t = tt(0.6); f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)).astype(np.float32) * 0.7
def clang(): t = tt(1.2); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(523, 3), (1371, 5), (2290, 7), (3105, 9)]) * 0.25 + filt(noise(1.2), lo=2000) * np.exp(-t * 30) * 0.4).astype(np.float32)
def doorbell(): return np.concatenate([ding(1175, 0.4)[: int(0.28 * SR)], ding(932, 0.9)])
def eee(): return formant((520, 760), [VOW['i'], VOW['i'], VOW['e']], 0.55, 0.15)
def yeah(): return formant((240, 330), [VOW['i'], VOW['e'], VOW['ae'], VOW['a']], 0.5, 0.2)

# ================= MUSIC =================
music = np.zeros(N, np.float32)
def run_sneaky(t0, t1, bpm=110, root=50, gain=1.0, clarinet=True):
    beat = 60 / bpm; line = [0, 0, 3, 5, 6, 5, 3, 0]; mel = [(0, 12, 0.5), (1, 15, 0.5), (1.5, 17, 0.5), (2, 18, 1.0), (3, 17, 0.5), (3.5, 15, 0.5)]
    t = t0; bar = 0
    while t < t1 - 0.05:
        for k in range(8):
            tk = t + k * beat / 2
            if tk >= t1: break
            place(music, bass(midi(root - 12 + line[k])), tk, 0.55 * gain)
            if k % 2 == 1: place(music, pizz(midi(root + 7 + (3 if bar % 2 else 0))), tk, 0.18 * gain)
            place(music, hat(k % 4 == 3), tk + (0.04 if k % 2 else 0), 0.16 * gain)
        for b in range(4):
            if t + b * beat < t1: place(music, kick() if b % 2 == 0 else brush(), t + b * beat, (0.45 if b % 2 == 0 else 0.3) * gain)
        if clarinet and bar % 2 == 0:
            for (bt, m, dd) in mel:
                if t + bt * beat < t1 - 0.1: place(music, clar(midi(root + m), dd * beat * 0.95), t + bt * beat, 0.22 * gain)
        t += 4 * beat; bar += 1
def run_plan(t0, t1, bpm=112, gain=1.0):
    beat = 60 / bpm; t = t0; bar = 0; roots = [53, 55, 57, 58, 60, 62]
    while t < t1 - 0.05:
        r = roots[min(bar, len(roots) - 1)]; ch = [r, r + 4, r + 7, r + 12]
        for k in range(8):
            tk = t + k * beat / 2
            if tk >= t1: break
            place(music, pizz(midi(ch[k % 4] + (12 if k >= 4 else 0)), 0.22), tk, 0.2 * gain)
            if k % 2 == 0: place(music, bass(midi(r - 12 + (7 if k % 4 == 2 else 0))), tk, 0.5 * gain)
            place(music, hat(), tk, 0.13 * gain * (1 + bar * 0.08))
        for b in range(4):
            if t + b * beat < t1: place(music, kick() if b % 2 == 0 else snare(), t + b * beat, (0.42 if b % 2 == 0 else 0.22) * gain)
        if bar % 2 == 1:
            for j, m in enumerate([r + 12, r + 16, r + 19]):
                if t + (2 + j * 0.5) * beat < t1: place(music, clar(midi(m), beat * 0.45), t + (2 + j * 0.5) * beat, 0.2 * gain)
        t += 4 * beat; bar += 1
def run_tense(t0, t1, bpm=118, root=57, gain=1.0):
    beat = 60 / bpm; t = t0; pat = [0, 0, 1, 0, 3, 0, 1, 0]
    while t < t1 - 0.05:
        for k in range(8):
            tk = t + k * beat / 2
            if tk >= t1: break
            place(music, pizz(midi(root - 12 + pat[k]), 0.2, 0.4), tk, 0.32 * gain); place(music, pizz(midi(root + 3 + (k % 2) * 4), 0.16), tk + beat / 4, 0.09 * gain)
            place(music, click(5000), tk, 0.05 * gain)
        place(music, timp(55, 0.5), t, 0.25 * gain)
        t += 4 * beat
def run_science(t0, t1, bpm=116, gain=1.0):
    beat = 60 / bpm; t = t0; mel = [72, 76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 84, 81, 79, 76, 74]; i = 0
    while t < t1 - 0.05:
        for k in range(8):
            tk = t + k * beat / 2
            if tk >= t1: break
            place(music, xylo(midi(mel[i % len(mel)])), tk, 0.2 * gain); i += 1
            if k % 2 == 0: place(music, pizz(midi(48 + (7 if k % 4 == 2 else 0)), 0.25), tk, 0.3 * gain)
        place(music, brush(), t + beat, 0.15 * gain); place(music, brush(), t + 3 * beat, 0.15 * gain)
        t += 4 * beat

run_sneaky(0.0, 7.12)
place(music, np.concatenate([xylo(midi(m), 0.12)[: int(0.035 * SR)] for m in range(72, 92, 2)]), 3.74, 0.25)  # wave accent gliss
place(music, brass([midi(74), midi(78), midi(81)], 0.35), F(118), 0.22)                                    # comic stab on the wave
run_plan(7.2, 18.42)
place(music, brass([midi(65), midi(69), midi(72), midi(77)], 1.3), 18.44, 0.55); place(music, cymbal(1.6), 18.44, 0.35); place(music, timp(87, 1.0), 18.44, 0.5)  # victory chord
# 10: record scratch + wah-wah trombone
for i, (a, b, d) in enumerate([(midi(46), midi(46), 0.32), (midi(45), midi(45), 0.32), (midi(44), midi(44), 0.32), (midi(43), midi(41.6), 0.95)]):
    place(music, trombone(a, b, d), 21.25 + i * 0.36, 0.5)
# 11-12: news jingle + tension + dramatic hit
for j, ch in enumerate([[60, 67], [62, 69], [64, 72, 76]]): place(music, brass([midi(m) for m in ch], 0.22 if j < 2 else 0.7, 3200), 22.42 + j * 0.2, 0.45)
place(music, timp(65, 0.7), 22.42, 0.4); place(music, cymbal(1.2), 22.82, 0.2)
tb = 23.4
while tb < 26.8: place(music, click(4500), tb, 0.06); place(music, pizz(midi(45), 0.15, 0.3), tb, 0.12); tb += 60 / 120 / 2
pad = filt(noise(26.8 - 23.4), hi=400) * 0.25; place(music, pad * np.minimum(1, tt(26.8 - 23.4) / 1.0).astype(np.float32), 23.4, 0.4)
place(music, brass([midi(38), midi(41), midi(44)], 1.4, 1600), F(806) - 0.02, 0.8); place(music, timp(49, 1.4), F(806) - 0.02, 0.8); place(music, cymbal(1.4), F(806), 0.25)
# 13-14 tense comic pizzicato
run_tense(27.93, 34.4)
# 15-16 science xylophone + hero fanfare
run_science(34.45, 38.5)
for j, m in enumerate([60, 64, 67, 72]): place(music, brass([midi(m), midi(m + 12)], 0.22 if j < 3 else 0.9, 3400), 38.5 + j * 0.15, 0.5)
place(music, cymbal(1.2), 38.95, 0.25)
run_science(39.6, 41.05, gain=0.8)
# 17 light reprise + final 'ta-daa'
run_sneaky(41.1, 43.3, bpm=110, root=50, gain=0.7, clarinet=False)
place(music, brass([midi(55), midi(59), midi(62), midi(65)], 0.16, 3000), 43.36, 0.5)
place(music, brass([midi(48), midi(55), midi(60), midi(64)], 0.75, 3200), 43.56, 0.6); place(music, cymbal(0.9), 43.56, 0.25); place(music, timp(65, 0.6), 43.56, 0.4)

# ================= SFX =================
sfx = np.zeros(N, np.float32)
X = lambda sig, f, g=1.0: place(sfx, sig, F(f), g)
# 1 hook
X(squelch(0.65), 0, 0.9); [X(plip(1200 + 200 * k), f, 0.55) for k, f in enumerate([6, 9, 10, 11, 13])]
X(whoosh(0.35), 17, 0.6); [X(splat(), f, 0.35) for f in range(23, 44, 5)]; X(eee(), 25, 0.22); X(sparkle(0.5, 1), 45, 0.4)
# 2 bank exterior
for f in range(60, 86, 8): X(step(), f, 0.35)
X(doorbell(), 79, 0.35); X(whoosh(0.3), 84, 0.55)
for f in range(90, 113, 8): X(step(), f, 0.35)
# 3 wave
X(whoosh(0.3, False), 111, 0.4); [X(step(), f, 0.3) for f in (113, 119)]; X(servo(0.7), 114, 0.35); X(ding(1760, 1.0), 118, 0.45)
X(static(0.12), 129, 0.4); X(static(0.08), 137, 0.35); X(hit(), 137, 0.45)
# 4 ghost / reality
X(sparkle(1.0, 5), 164, 0.45); X(pop(), 192, 0.6); [X(gasp(k), 193 + k * 2, 0.16) for k in range(3)]; X(rustle(0.4), 197, 0.35)
# 5-6 kitchen secret ink
X(whoosh(0.3), 214, 0.45)
for f in range(222, 252, 7): X(rustle(0.18), f, 0.3)
X(crackle(1.2, 2), 262, 0.5); X(chime(), 274, 0.3); X(sparkle(0.6, 9), 278, 0.3)
X(whoosh(0.3), 296, 0.4); X(bulb(), 340, 0.45)
# 7-9 tripod test
X(whoosh(0.3), 375, 0.4); X(ratchet(6, 0.04), 382, 0.4); X(ratchet(5, 0.05), 395, 0.35); X(click(2500), 408, 0.4)
X(whoosh(0.3), 419, 0.4); X(splat(), 422, 0.5); X(splat(), 430, 0.35); X(eee(), 428, 0.16)
X(whoosh(0.3), 446, 0.35); X(shutter(), 483, 0.7); X(flashpop(), 484, 0.6); X(motor(0.55), 500, 0.35)
X(whoosh(0.3), 552, 0.35); X(yeah(), 556, 0.2); X(sparkle(0.6, 12), 556, 0.3)
# 10 rewind
X(scratch(), 590, 0.55); X(rewind(0.95), 591, 0.35); X(shutter(), 627, 0.45); X(flashpop(), 628, 0.45)
# 11-12 living room / news
X(whoosh(0.3), 672, 0.35)
for f in range(680, 720, 9): X(crunch(), f, 0.35)
X(filt(babble(3.6, 135, 3), lo=250, hi=2400), 678, 0.06); X(whoosh(0.35), 721, 0.4)
X(whoosh(0.25), 779, 0.4); X(hit(), 781, 0.3); X(whoosh(0.3), 801, 0.45); X(spray(), 806, 0.7)
# 13 porch
X(crickets(1.75), 838, 0.5); [X(knock(), f, 0.8) for f in (856, 860, 864)]; X(creak(0.7, 100), 868, 0.5)
# 14 interrogation
X(whoosh(0.3), 889, 0.35); [X(slide(), f, 0.5) for f in (896, 904, 912)]
X(whoosh(0.3), 936, 0.35); X(slam(), 972, 0.45); X(filt(babble(0.6, 180, 7), lo=300, hi=2000), 940, 0.06)
# 15-16 office + mirror
X(whoosh(0.3), 1032, 0.35); X(rustle(0.6), 1034, 0.5); X(rustle(0.5), 1072, 0.4)
X(bulb(), 1103, 0.4); X(bulb(), 1106, 0.3); X(whoosh(0.3), 1127, 0.35); [X(click(3000), f, 0.3) for f in (1138, 1144)]
X(whoosh(0.3), 1155, 0.4); X(sparkle(1.2, 21), 1158, 0.35)
# 17 cell
X(whoosh(0.3), 1233, 0.4); X(squelch(0.5), 1236, 0.5); X(squelch(0.4), 1252, 0.35)
X(whoosh(0.35), 1267, 0.4); X(boing(), 1288, 0.6); X(clang(), 1289, 0.45); X(clang(), 1293, 0.2)

# ================= MIX =================
voice = load_voice()
def rms(x): return float(np.sqrt(np.mean(x.astype(np.float64) ** 2) + 1e-12))
k = int(0.03 * SR); ve = np.sqrt(np.convolve(voice.astype(np.float64) ** 2, np.ones(k) / k, "same"))
active = ve > ve.max() * 0.06
act = np.convolve(active.astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")   # smooth with ~250 ms attack/release
duck = (1 - 0.45 * np.clip(act * 1.5, 0, 1)).astype(np.float32)                                # ~ -5 dB more under speech
v_rms = rms(voice[active]); m_rms = rms((music * duck)[active]) + 1e-9
music_g = (v_rms * 10 ** (-21 / 20)) / m_rms                                                  # bed ~21 dB under the voice
sfx_rms = rms(sfx[np.abs(sfx) > 1e-4]) + 1e-9; sfx_g = (v_rms * 10 ** (-12 / 20)) / sfx_rms     # sfx ~12 dB under (short transients)
sfx_d = sfx * (1 - 0.35 * np.clip(act * 1.5, 0, 1)).astype(np.float32)
mix = voice + music * duck * music_g + sfx_d * sfx_g
pk = np.abs(mix).max(); mix = mix / max(1.0, pk / 0.97)
fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
print(f"music gain {20*np.log10(music_g):.1f} dB, music under voice: {20*np.log10(rms((music*duck*music_g)[active])/v_rms):.1f} dB, sfx gain {20*np.log10(sfx_g):.1f} dB")
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR)
