"""Synthesized music bed + SFX for "Der goldene Ohrring", mixed under the user's voice.mp3 (no new voice is added).
Music: sea-shanty feel (accordion, fiddle, foot stomp, light drum), ~100 BPM, kept ~20-22 dB under the speech and ducked.
Writes mix_raw.wav (48 kHz mono). finish.sh normalises to -14 LUFS."""
import numpy as np, subprocess, wave, json

SR = 48000
TOTAL_F = 1706
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30.0
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def fft_filter(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H *= 1 / (1 + (f / hi) ** order)
    if lo: H *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * H, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def adsr(n, a=0.01, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR; L = n / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return (e * np.clip((L - t) / max(r, 1e-4), 0, 1)).astype(np.float32)
def fade(sig, a=0.02, r=0.05):
    n = len(sig); e = np.ones(n, np.float32); ka, kr = int(a * SR), int(r * SR)
    if ka: e[:ka] = np.linspace(0, 1, ka)
    if kr: e[-kr:] *= np.linspace(1, 0, kr)
    return sig * e

# ---------------- instruments ----------------
def saw(f, t, ph=0.0):
    x = (f * t + ph) % 1.0; return 2 * x - 1
def accordion(notes, d, bright=2600):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for m in notes:
        f = midi(m)
        for det in (-0.0025, 0.0025):  # two reeds beating = accordion "musette"
            s += saw(f * (1 + det), t, rng.random()) * 0.5 + np.sign(np.sin(2 * np.pi * f * (1 + det) * t)) * 0.18
    s *= 1 + 0.12 * np.sin(2 * np.pi * 5.2 * t)  # bellows tremolo
    s = fft_filter(s, lo=180, hi=bright) / max(1, len(notes))
    return s * adsr(len(t), 0.04, 0.15, 0.8, 0.08)
def fiddle(m, d, vib=5.5):
    t = tt(d); f = midi(m) * (1 + 0.006 * np.sin(2 * np.pi * vib * t) * np.clip(t / 0.15, 0, 1))
    ph = np.cumsum(f) / SR; s = (2 * (ph % 1) - 1) * 0.7 + 0.3 * np.sin(2 * np.pi * ph * 2)
    s = fft_filter(s.astype(np.float32), lo=300, hi=3800)
    return s * adsr(len(t), 0.05, 0.1, 0.85, 0.06)
def pluck(m, d=0.6, bright=0.55, decay=None):
    t = tt(d); f = midi(m); s = np.zeros(len(t))
    for k in range(1, 9): s += (bright ** (k - 1)) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + k * 1.6) * (decay or 1))
    return (s * np.clip(t / 0.003, 0, 1)).astype(np.float32) * 0.5
def harp(m, d=1.6): return pluck(m, d, 0.45, 0.45)
def pizz(m, d=0.35): return pluck(m, d, 0.5, 2.6)
def strings(notes, d, hi=1400, trem=0.0):
    t = tt(d); s = np.zeros(len(t), np.float32)
    for m in notes:
        for det in (-0.004, 0, 0.004): s += saw(midi(m) * (1 + det), t, rng.random()).astype(np.float32)
    if trem: s *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * trem * t))
    s = fft_filter(s, lo=60, hi=hi) / (3 * len(notes))
    return s * adsr(len(t), 0.4, 0.2, 0.9, 0.5)
def glock(m, d=1.2):
    t = tt(d); f = midi(m)
    return (sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for a, r, k in [(1, 1, 3), (0.4, 2.76, 6), (0.25, 5.4, 9)]) * 0.4).astype(np.float32)
def kick(d=0.3, f0=55):
    t = tt(d); f = f0 + 80 * np.exp(-t * 28)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)).astype(np.float32)
def stomp():  # wooden floor stomp
    t = tt(0.25); return (kick(0.25, 70) * 0.8 + fft_filter(noise(0.25), lo=100, hi=900) * np.exp(-t * 30) * 0.5).astype(np.float32)
def tamb():
    t = tt(0.18); return (fft_filter(noise(0.18), lo=5000) * np.exp(-t * 24) * 0.35).astype(np.float32)
def clap():
    t = tt(0.16); s = fft_filter(noise(0.16), lo=900, hi=5000)
    env = np.exp(-t * 40) + 0.6 * np.exp(-np.clip(t - 0.012, 0, None) * 40) * (t > 0.012)
    return (s * env * 0.5).astype(np.float32)
def tom(f0=90, d=0.5):
    t = tt(d); f = f0 * (1 + 0.4 * np.exp(-t * 20))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + fft_filter(noise(d), hi=600) * np.exp(-t * 18) * 0.3).astype(np.float32)
def timp(m, d=1.2):
    t = tt(d); f = midi(m); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 4) + fft_filter(noise(d), hi=400) * np.exp(-t * 14) * 0.4).astype(np.float32)

# ---------------- music ----------------
music = np.zeros(N, np.float32)
BPM = 100; B = 60 / BPM
MEL = [(0, 69, 1), (1, 65, .5), (1.5, 67, .5), (2, 69, 1), (3, 74, 1), (4, 72, 1), (5, 67, .5), (5.5, 69, .5), (6, 67, 1), (7, 64, 1),
       (8, 65, 1), (9, 69, .5), (9.5, 65, .5), (10, 62, 1), (11, 65, 1), (12, 64, 1), (13, 73, 1), (14, 69, 2),
       (16, 69, .5), (16.5, 69, .5), (17, 74, 1), (18, 77, 1), (19, 76, 1), (20, 76, .5), (20.5, 74, .5), (21, 72, 1), (22, 67, 1), (23, 72, 1),
       (24, 69, 1), (25, 65, .5), (25.5, 67, .5), (26, 69, 1), (27, 65, 1), (28, 64, 1), (29, 73, .5), (29.5, 76, .5), (30, 74, 2)]
CH_MIN = [[50, 53, 57], [48, 52, 55], [50, 53, 57], [45, 49, 52]]  # Dm C Dm A
CH_MAJ = [[50, 54, 57], [45, 49, 52], [50, 54, 57], [45, 49, 52]]  # D A D A
def to_major(m): return m + 1 if m % 12 in (5, 0) else m  # F->F#, C->C#

def shanty(t0, t1, bpm=100, level=1.0, major=False, fid=True, drums=True, acc_level=1.0, start_beat=0, tamb_on=False, stomp_on=True):
    b = 60 / bpm; beat = start_beat; t = t0
    while t < t1 - 0.05:
        bar = int(beat // 4) % 4; ch = (CH_MAJ if major else CH_MIN)[bar]
        if beat % 2 == 0: place(music, fade(accordion([m + 12 for m in ch], min(2 * b, t1 - t) * 0.97), 0.01, 0.05), t, 0.22 * level * acc_level)
        place(music, pluck(ch[0] - 12 if beat % 2 == 0 else ch[2] - 12, 0.4, 0.4), t, 0.3 * level)
        if drums and stomp_on and beat % 1 == 0: place(music, stomp(), t, (0.5 if beat % 2 == 0 else 0.32) * level)
        if drums and tamb_on: place(music, tamb(), t + b / 2, 0.5 * level)
        if fid:
            mb = beat % 32
            for (o, m, d) in MEL:
                if abs(o - mb) < 1e-6:
                    mm = to_major(m) if major else m
                    place(music, fiddle(mm, d * b * 0.95), t, 0.17 * level)
            for (o, m, d) in MEL:  # half-beat notes
                if abs(o - (mb + 0.5)) < 1e-6:
                    mm = to_major(m) if major else m
                    place(music, fiddle(mm, d * b * 0.95), t + b / 2, 0.17 * level)
        beat += 1; t += b
    return beat

def env_cut(t0, t1, ramp=0.08):  # hard-ish gate the music bed (used for the stops)
    i0, i1, k = int(t0 * SR), int(t1 * SR), int(ramp * SR)
    music[i0:i0 + k] *= np.linspace(1, 0, k)[: len(music[i0:i0 + k])]; music[i0 + k:i1] = 0

# 1-2: tavern shanty, low; on "Und zwar" the music stops, one mysterious note
shanty(0.0, 3.35, level=0.9)
env_cut(3.30, 6.10, 0.12)
place(music, harp(38, 3.0) + harp(50, 3.0) * 0.6, 3.82, 0.5)                 # the one mysterious note (low D)
place(music, fade(strings([74], 2.2, hi=2500), 0.6, 0.8), 3.84, 0.22)          # high bowed tone
# 3: storm (legend) - drum rumble, low strings, harp
place(music, fade(strings([38, 45, 50], 2.7, hi=900, trem=7), 0.3, 0.4), F(183), 0.4)
for k in range(10): place(music, tom(70 + (k % 3) * 8, 0.6), F(183) + k * 0.27, 0.16 + 0.03 * (k % 2))
for k, m in enumerate([62, 65, 69, 74, 77]): place(music, harp(m, 1.2), F(183) + 0.05 + k * 0.08, 0.28)
# 4-7: beach, calm and sad; mysterious harp arpeggios and low strings
ARP = [(50, [62, 65, 69, 74]), (46, [58, 62, 65, 70]), (43, [55, 58, 62, 67]), (45, [57, 61, 64, 69])]  # Dm Bb Gm A
t = F(264); i = 0
while t < F(643) - 0.4:
    root, ar = ARP[i % 4]
    place(music, fade(strings([root, root + 7, root + 12], 2.45, hi=1100), 0.5, 0.6), t, 0.55)
    for k in range(8): place(music, harp(ar[k % 4] + (12 if k >= 4 else 0), 1.4), t + k * 0.3, 0.2)
    t += 2.4; i += 1
place(music, glock(86, 2.0), F(586), 0.15); place(music, glock(81, 2.0), F(588), 0.12)  # "Hamburg" shimmer
# 8: the shanty comes back lively
shanty(F(649), F(701) + 0.3, bpm=104, level=1.0, tamb_on=True)
# 9: festive ceremony (major, faster, tambourine)
shanty(F(701) + 0.25, F(857), bpm=118, level=0.8, major=True, tamb_on=True)
# 10: stormy, dramatic drums (Cape Horn)
place(music, fade(strings([38, 45, 50, 53], F(1010) - F(857), hi=1000, trem=8), 0.2, 0.5), F(857), 0.2)
b = 60 / 104
for k in range(int((F(1010) - F(857)) / (b / 2))):
    tk = F(857) + k * b / 2
    place(music, tom(62 if k % 4 == 0 else 80, 0.45), tk, 0.12 if k % 4 == 0 else 0.065)
    if k % 8 == 0: place(music, timp(38, 1.2), tk, 0.22)
# 11-12: comic, magical dings and harp
place(music, fade(strings([62, 69], F(1181) - F(1010), hi=1800), 0.3, 0.3), F(1010), 0.1)
for k, m in enumerate([74, 77, 81]): place(music, pizz(m - 12), F(1010) + k * 0.3, 0.4)
for f0 in (1062, 1070): place(music, glock(88, 1.4), F(f0), 0.28)
for k in range(12): place(music, harp(62 + [0, 3, 7, 10, 12, 15, 19, 22, 24, 27, 31, 34][k], 0.8), F(1076) + k * 0.025, 0.13)  # gliss up (boing)
place(music, glock(93, 1.6), F(1101), 0.25)
for f0 in (1135, 1141): place(music, glock(86 + (f0 == 1141) * 3, 1.4), F(f0), 0.28)
for k in range(10): place(music, harp(74 + k * 2, 0.6), F(1147) + k * 0.05, 0.16)
# 13: tense ostinato (pizzicato), builds up to the BUMM, then a comic silence
BOOM_T = F(1384)
b = 60 / 100; k = 0; t = F(1181)
while t < BOOM_T - 0.05:
    m = [38, 38, 38, 39][k % 4] + (0 if t < F(1337) else 2)
    place(music, pizz(m + 12, 0.3), t, 0.55 + 0.25 * (t - F(1181)) / (BOOM_T - F(1181))); k += 1; t += b / 2
place(music, fade(strings([50, 51], BOOM_T - F(1181), hi=900), 1.0, 0.05), F(1181), 0.28)
env_cut(BOOM_T, F(1403), 0.02)
# 14: soft, with pizzicato on each bubble pop
for f0, m in zip([1414, 1421, 1428, 1434, 1439], [74, 77, 81, 79, 86]): place(music, pizz(m, 0.4), F(f0), 0.5)
place(music, fade(strings([50, 57], F(1500) - F(1405), hi=1200), 0.6, 0.6), F(1405), 0.22)
# 15-17: warm, calm shanty (no drums), ends with a witty chord on the wink
shanty(F(1500), F(1683) + 0.05, bpm=92, level=0.75, drums=False, acc_level=1.2)
WINK_T = F(1684)
env_cut(WINK_T - 0.04, DUR, 0.04)
place(music, accordion([62, 66, 69, 74], 1.4) * np.exp(-tt(1.4) * 2.2), WINK_T, 0.5)  # bright D major button
place(music, pizz(38, 0.5), WINK_T, 0.6); place(music, glock(90, 1.4), WINK_T + 0.02, 0.3)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def murmur(d):  # unintelligible tavern crowd
    t = tt(d); s = np.zeros(len(t), np.float32)
    for k in range(6):
        f0 = 110 + 40 * k + 20 * np.sin(2 * np.pi * (0.3 + 0.1 * k) * t)
        src = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)).astype(np.float32)
        form = fft_filter(src, lo=300 + 80 * k, hi=1500 + 200 * k)
        gate = (0.5 + 0.5 * np.sin(2 * np.pi * (1.3 + 0.37 * k) * t + k)) ** 2
        s += form * gate.astype(np.float32)
    return fade(s / 6 + fft_filter(noise(d), lo=200, hi=2000) * 0.25, 0.4, 0.4)
def clink():
    t = tt(0.6); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(1850, 9), (2730, 12), (4100, 16)]) * 0.3 + fft_filter(noise(0.6), lo=2000) * np.exp(-t * 60) * 0.4).astype(np.float32)
def ting(f=2093):
    t = tt(1.3); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, k in [(1, 3.5), (1.5, 5), (2.01, 7), (3.02, 10)]) * 0.28).astype(np.float32)
def crackle(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 9)): i = rng.integers(0, len(s) - 300); s[i:i + 300] += fft_filter(noise(300 / SR), lo=1500) * np.exp(-np.arange(300) / 40) * rng.uniform(0.2, 0.7)
    return s
def creak(d=0.7, f0=120):
    t = tt(d); rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.2 * t / d)); ph = np.cumsum(rate) / SR
    p = (np.mod(ph, 1) < 0.08).astype(np.float32) * (0.6 + 0.4 * rng.random(len(t))).astype(np.float32)
    return fft_filter(fft_filter(p, hi=2400), lo=180) * np.sin(np.pi * t / d).astype(np.float32) * 2.2
def chain(d=0.8):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(9): place_local = int(rng.uniform(0, d * 0.9) * SR); c = clink()[:6000] * 0.25; s[place_local:place_local + len(c)] += c[: len(s) - place_local]
    return s + creak(d, 90) * 0.4
def whoosh(d=0.6, lo=300, hi=2500):
    t = tt(d); return (fft_filter(noise(d), lo=lo, hi=hi) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def whistle_down(d=1.4):  # hat "fiyuu"
    t = tt(d); f = 1400 * np.exp(-t * 1.1) + 300
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.35 + whoosh(d, 600, 3000) * 0.5).astype(np.float32)
def thunder(d=3.0):
    t = tt(d); s = fft_filter(noise(d), hi=220) * 3 * np.exp(-t / 1.1) * np.clip(t / 0.03, 0, 1)
    s += fft_filter(noise(d), lo=200, hi=2500) * np.exp(-t * 6) * 0.8
    return s.astype(np.float32)
def waves(d, rough=0.0):
    t = tt(d); sw = 0.55 + 0.45 * np.sin(2 * np.pi * (0.13 + rough * 0.1) * t) ** 2
    return fade((fft_filter(noise(d), hi=700 + rough * 900) * 0.8 + fft_filter(noise(d), lo=1500, hi=5000) * 0.18) * sw.astype(np.float32), 0.3, 0.3)
def wind(d, howl=0.0):
    t = tt(d); s = fft_filter(noise(d), lo=200, hi=1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t)).astype(np.float32)
    if howl:
        f = 420 + 160 * np.sin(2 * np.pi * 0.17 * t) + 60 * np.sin(2 * np.pi * 0.61 * t)
        s += (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * howl * (0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * t))).astype(np.float32)
    return fade(s, 0.4, 0.4)
def splash(d=1.0, big=1.0):
    t = tt(d); return ((fft_filter(noise(d), hi=4500) * np.exp(-t * 5) * np.clip(t / 0.01, 0, 1) + fft_filter(noise(d), hi=350) * np.exp(-t * 7) * 1.4) * big).astype(np.float32)
def gull():
    t = tt(0.55); f = 1300 + 700 * np.sin(np.pi * t / 0.55) - 500 * t
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.15 * np.sin(np.pi * t / 0.55) ** 2).astype(np.float32)
def steps(n, every=0.32):
    s = np.zeros(int((n * every + 0.3) * SR), np.float32)
    for k in range(n): c = fft_filter(noise(0.12), lo=300, hi=3000) * np.exp(-tt(0.12) * 35) * 0.5; i = int(k * every * SR); s[i:i + len(c)] += c
    return s
def bell(f=392, d=4.0):
    t = tt(d); return (sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for a, r, k in [(1, 1, 0.8), (0.6, 2.0, 1.2), (0.5, 2.4, 1.6), (0.35, 3.0, 2.0), (0.25, 4.2, 2.6)]) * 0.25).astype(np.float32)
def cheer(d):  # unintelligible "hurra" crowd
    t = tt(d); s = np.zeros(len(t), np.float32)
    for k in range(7):
        f0 = 180 + 35 * k + 30 * np.sin(2 * np.pi * (0.7 + 0.2 * k) * t)
        src = fft_filter(np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)).astype(np.float32), lo=400, hi=2600)
        s += src * (0.6 + 0.4 * np.sin(2 * np.pi * (1.7 + 0.3 * k) * t + k)).astype(np.float32)
    return fade(s / 7 + fft_filter(noise(d), lo=500, hi=4000) * 0.3, 0.2, 0.5)
def claps(d, rate=6):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * rate * 4)):
        i = int(rng.uniform(0, d - 0.2) * SR); c = clap() * rng.uniform(0.4, 1); s[i:i + len(c)] += c
    return s
def tok():
    t = tt(0.35); return (np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25) + fft_filter(noise(0.35), lo=500, hi=3000) * np.exp(-t * 45) * 0.6).astype(np.float32)
def crash_wave(d=2.0):
    t = tt(d); return (fft_filter(noise(d), hi=1200) * 1.6 * np.exp(-t * 1.8) * np.clip(t / 0.08, 0, 1) + fft_filter(noise(d), lo=1500, hi=6000) * np.exp(-t * 2.5) * 0.4).astype(np.float32)
def boing(d=0.7):
    t = tt(d); f = 180 + 260 * (1 - np.exp(-t * 6)) + 40 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 4)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5) * 0.6).astype(np.float32)
def thud():
    t = tt(0.4); return (kick(0.4, 60) * 0.9 + fft_filter(noise(0.4), hi=700) * np.exp(-t * 20) * 0.4).astype(np.float32)
def vik(d=0.55):  # telescope stretch "vııık"
    t = tt(d); f = 500 + 1600 * (t / d) ** 1.4
    return (fft_filter(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)).astype(np.float32), hi=3500) * 0.18 * np.sin(np.pi * t / d) ** 0.5).astype(np.float32)
def plop():
    t = tt(0.25); f = 300 + 900 * np.exp(-t * 30)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * 0.8).astype(np.float32)
def sizzle(d):
    t = tt(d); return fade((fft_filter(noise(d), lo=3500, hi=9000) * (0.6 + 0.4 * rng.random(len(t))).astype(np.float32) * 0.35), 0.05, 0.02)
def bumm():
    d = 1.3; t = tt(d)
    s = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 12)) / SR) * np.exp(-t * 4.5) * 1.8
    s += fft_filter(noise(d), hi=260) * np.exp(-t * 5) * 2.0 + fft_filter(noise(d), lo=900, hi=5000) * np.exp(-t * 30) * 0.35
    return np.tanh(s * 1.2).astype(np.float32)
def ringing(d=1.6):
    t = tt(d); return (np.sin(2 * np.pi * 3950 * t) * 0.12 * np.exp(-t * 1.6) * np.clip(t / 0.05, 0, 1)).astype(np.float32)
def hmm(d=0.8):  # calm, closed-mouth "hmm" (no words)
    t = tt(d); f = 105 + 8 * np.sin(np.pi * t / d)
    src = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)).astype(np.float32)
    return (fft_filter(src, lo=80, hi=420) * np.sin(np.pi * t / d) ** 1.5 * 0.5).astype(np.float32)
def page():
    t = tt(0.5); return (fft_filter(noise(0.5), lo=1200, hi=7000) * (np.sin(np.pi * t / 0.5) ** 3) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)) * 0.5).astype(np.float32)
def puff():
    t = tt(0.5); return (fft_filter(noise(0.5), lo=150, hi=1200) * np.exp(-t * 9) * np.clip(t / 0.02, 0, 1) * 0.7).astype(np.float32)
def pop():
    t = tt(0.12); return (np.sin(2 * np.pi * (900 - 2500 * t) * t) * np.exp(-t * 50) * 0.7 + fft_filter(noise(0.12), lo=2000) * np.exp(-t * 90) * 0.5).astype(np.float32)
def vinn(d=0.6):
    t = tt(d); return (np.sin(2 * np.pi * np.cumsum(700 + 500 * t / d) / SR) * np.sin(np.pi * t / d) * 0.12).astype(np.float32)
def squeak(d=0.25):
    t = tt(d); f = 1600 + 600 * np.sin(2 * np.pi * 9 * t)
    return (fft_filter(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)).astype(np.float32), lo=900, hi=5000) * np.sin(np.pi * t / d) * 0.12).astype(np.float32)
def pipe_draw(d=0.9):
    t = tt(d); return (fft_filter(noise(d), lo=300, hi=2200) * np.sin(np.pi * t / d) ** 2 * 0.35 + crackle(d) * 0.3).astype(np.float32)

# --- tavern beds
for a, b_ in [(0, 183), (643, 701), (1547, TOTAL_F)]:
    place(sfx, murmur(F(b_) - F(a)), F(a), 0.1); place(sfx, crackle(F(b_) - F(a)), F(a), 0.18)
place(sfx, creak(0.8, 110), F(30), 0.25); place(sfx, creak(0.7, 95), F(1560), 0.22)
place(sfx, ting(2349), F(3), 0.5)                       # 1a: the earring glints
place(sfx, clink(), F(62), 0.45)                        # mug raised / clink
place(sfx, clink(), F(66), 0.25)
place(sfx, crackle(1.0), F(130), 0.6)                   # 2: candle trembles
place(sfx, creak(0.6, 80), F(128), 0.3)                 #    chair creaks as he leans in
# --- legend: storm
place(sfx, page(), F(183), 0.45)                         # page turn into the legend
place(sfx, waves(F(264) - F(183) + 0.3, rough=1.0), F(183), 0.18); place(sfx, wind(F(264) - F(183) + 0.3, 0.6), F(183), 0.13)
place(sfx, thunder(3.0), F(203), 0.2)
place(sfx, creak(0.9, 70), F(220), 0.18)                 # rigging creaks in the wind
place(sfx, whistle_down(1.6), F(190), 0.2)             # hat flies "fiyuu"
place(sfx, splash(0.9, 0.6), F(242), 0.4)
# --- beach
place(sfx, whoosh(0.7, 200, 1500), F(262), 0.35)        # smoke dissolve
place(sfx, waves(F(643) - F(264), rough=0.0), F(264), 0.35)
for f0 in (282, 318, 360, 470, 520): place(sfx, gull(), F(f0), 0.22)
place(sfx, ting(2637), F(300), 0.35); place(sfx, ting(2349), F(372), 0.4); place(sfx, ting(2793), F(426), 0.45)
place(sfx, steps(8, 0.3), F(346), 0.5)                  # steps in the sand
place(sfx, bell(392, 4.5), F(466), 0.22)                # one distant chapel bell
place(sfx, ting(3136), F(552), 0.35); place(sfx, ting(2637), F(606), 0.35)
# --- back to the tavern
place(sfx, pop(), F(651), 0.8)                          # bubble pop
place(sfx, chain(0.9), F(645), 0.35)                    # the swinging sign's chains
place(sfx, whoosh(0.5, 300, 2000), F(661), 0.35)        # fly in through the door
place(sfx, clink(), F(676), 0.45)
place(sfx, pipe_draw(0.9), F(690), 0.4)                 # a pull on the pipe -> smoke
# --- equator ceremony
place(sfx, whoosh(0.8, 200, 1500), F(700), 0.35)
place(sfx, waves(F(1181) - F(701), 0.0), F(701), 0.2)   # calm sea under the ship scenes
place(sfx, cheer(F(857) - F(722)), F(722), 0.12)
place(sfx, tok(), F(727), 0.8)                          # trident hits the deck
place(sfx, ting(2793), F(806), 0.45)                    # first earring
place(sfx, claps(F(857) - F(806), 5), F(806), 0.35)
# --- Cape Horn
place(sfx, whoosh(0.4, 500, 4000), F(857), 0.4)
place(sfx, wind(F(1010) - F(857), howl=1.0), F(857), 0.16); place(sfx, waves(F(1010) - F(857), rough=1.0), F(857), 0.14)
place(sfx, crash_wave(2.2), F(880), 0.28); place(sfx, crash_wave(2.0), F(955), 0.25)
place(sfx, ting(2637), F(968), 0.45)                    # second earring
# --- charms
place(sfx, splash(1.0, 1.0), F(1044), 0.3)              # "schlap"
place(sfx, splash(0.8, 0.8), F(1075), 0.16); place(sfx, boing(0.8), F(1076), 0.26)
place(sfx, thud(), F(1101), 0.5)
place(sfx, ting(2793), F(1135), 0.4); place(sfx, vik(0.6), F(1147), 0.6)
# --- gun deck
place(sfx, creak(1.0, 70), F(1190), 0.25)
place(sfx, plop(), F(1302), 0.7)
place(sfx, sizzle(BOOM_T - F(1340)), F(1340), 0.5)
place(sfx, bumm(), BOOM_T + 0.07, 0.28)
place(sfx, ringing(1.6), BOOM_T + 0.08, 0.6)
place(sfx, hmm(0.8), F(1394), 0.6)
# --- archive + gallery
place(sfx, pop(), F(1411), 0.8)
for f0 in (1414, 1421, 1428, 1434, 1439): place(sfx, pop(), F(f0), 0.6)
place(sfx, page(), F(1444), 0.6); place(sfx, puff(), F(1454), 0.5); place(sfx, vinn(0.6), F(1462), 0.6)
place(sfx, whoosh(0.4, 400, 3500), F(1500), 0.45)
place(sfx, whoosh(0.4, 400, 3500), F(1547), 0.45)
# --- finale
for k in range(4): place(sfx, squeak(0.22), F(1592) + k * 0.33, 0.6)
place(sfx, ting(2349), F(1608), 0.3)
place(sfx, ting(3136), WINK_T, 0.55)

# ---------------- mix ----------------
voice = load_voice()
def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
fr = int(0.05 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(fr) / fr, 'same'))
speech = env > env.max() * 0.08
v_rms = rms(voice[speech])
# music ~ -16 dB vs speech before ducking; ducking brings it to ~ -22 dB under every spoken word
music *= 0.1327 * 1.3 * v_rms / 0.1097  # fixed bed gain (measured once), so per-cue gains stay meaningful
k = int(0.12 * SR); sm = np.convolve(speech.astype(np.float32), np.ones(k) / k, 'same')
duck = 1 - 0.5 * np.clip(sm * 1.6, 0, 1)                     # -6 dB under speech, smooth attack/release
sfx_duck = 1 - 0.35 * np.clip(sm * 1.6, 0, 1)
sfx *= 0.45 * v_rms / 0.1097
mix = voice + music * duck + sfx * sfx_duck
peak = np.abs(mix).max(); mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2) * 0.95
fd = int(0.05 * SR); mix[-fd:] *= np.linspace(1, 0, fd)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
m_under = 20 * np.log10(rms((music * duck)[speech]) / v_rms + 1e-12)
print("ok", round(len(pcm) / SR, 3), "s; music under speech: %.1f dB" % m_under)
import os
if os.environ.get("DBG"):
    db = lambda a: 20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-9)
    for a, b_, n in [(1.5, 3.0, 'tavern'), (6.8, 8.5, 'storm'), (15.4, 17.8, 'beach'), (23.4, 25.7, 'equator'), (29.3, 31.0, 'cape'), (35, 37, 'charms'), (40, 42.8, 'gun'), (46.1, 46.5, 'boom'), (53, 54.8, 'final')]:
        i, j = int(a * SR), int(b_ * SR); vv = db(voice[i:j])
        print(f"{n:9s} music {db((music * duck)[i:j]) - vv:6.1f}  sfx {db((sfx * sfx_duck)[i:j]) - vv:6.1f}")
