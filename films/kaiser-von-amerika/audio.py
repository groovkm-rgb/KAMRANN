"""Der Kaiser von Amerika: synthesized light music bed + SFX, mixed UNDER the user's voice.mp3.
Music sits ~21 dB under the voice (ducked under speech), SFX are short and kept below the voice."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1518
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain
def place_arr(buf, s, t0): i = int(t0 * SR); j = min(len(buf), i + len(s)); buf[i:j] += s[: j - i]
def tt(d): return np.arange(int(d * SR)) / SR
def adsr(d, a=0.01, r=0.1):
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
noise = lambda d: rng.standard_normal(int(d * SR)).astype(np.float32)

# ---------------- instruments ----------------
def saw(f, t, n=10, vib=0.0, vr=5.5):
    ph = 2 * np.pi * f * t + (vib * np.sin(2 * np.pi * vr * t) if vib else 0)
    return sum(np.sin((k + 1) * ph) / (k + 1) for k in range(n))
def tuba(m, d, g=1.0):
    t = tt(d); s = saw(midi(m), t, 8) * adsr(d, 0.03, 0.08) * np.exp(-t * 1.5)
    return filt(s.astype(np.float32), hi=520) * 0.9 * g
def trumpet(m, d, bright=2600, vib=0.004, a=0.035):
    t = tt(d); s = saw(midi(m), t, 12, vib=vib * midi(m) / 10, vr=5.5) * adsr(d, a, 0.07)
    return filt(s.astype(np.float32), lo=180, hi=bright) * 0.55
def piano(m, d=0.6, g=1.0, detune=7.0):
    t = tt(d); s = np.zeros_like(t)
    for c in (-detune, detune):
        f = midi(m) * 2 ** (c / 1200)
        s += sum(np.sin(2 * np.pi * f * (k + 1) * t) * (0.6 ** k) * np.exp(-t * (3 + k * 1.5)) for k in range(5))
    return (s * np.minimum(1, t / 0.003) * 0.35 * g).astype(np.float32)
def chord_piano(ms, d=0.35, g=1.0): return sum(piano(m, d, g / len(ms) * 2) for m in ms)
def snare(d=0.16, g=1.0):
    t = tt(d); return (filt(noise(d), lo=1200) * np.exp(-t * 30) * 0.5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 26) * 0.35).astype(np.float32) * g
def roll(d, g=0.5):
    out = np.zeros(int(d * SR), np.float32); n = int(d / 0.045)
    for k in range(n): place_arr(out, snare(0.06, g * (0.4 + 0.6 * k / max(1, n))), k * 0.045)
    return out
def bassdrum(g=1.0):
    t = tt(0.3); f = 55 + 60 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) * g).astype(np.float32)
def cymbal(d=1.2, g=0.3): t = tt(d); return (filt(noise(d), lo=5000) * np.exp(-t * 3) * g).astype(np.float32)
def wood(f=900, g=1.0): t = tt(0.09); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 70) * g).astype(np.float32)
def pad(ms, d, g=1.0, hi=1600):
    t = tt(d); s = np.zeros_like(t)
    for m in ms:
        for c in (-8, 0, 9): s += saw(midi(m) * 2 ** (c / 1200), t, 8)
    return filt((s * adsr(d, d * 0.35, d * 0.4) / (3 * len(ms))).astype(np.float32), hi=hi) * g

music = np.zeros(N, np.float32)
F = lambda fr: fr / 30
C, G7, F_ = [60, 64, 67], [55, 59, 62, 65], [53, 57, 60]

def march(t0, t1, bpm, prog, mel=None, g=1.0):
    b = 60 / bpm; t = t0; i = 0
    while t < t1 - 0.05:
        ch = prog[(i // 4) % len(prog)]; beat = i % 4
        if beat in (0, 2): place(music, tuba(ch[0] - 24 + (7 if beat == 2 else 0), b * 0.9), t, 0.55 * g); place(music, bassdrum(0.5), t, 0.5 * g)
        else: place(music, chord_piano([m + 12 for m in ch[:3]], b * 0.8), t, 0.5 * g); place(music, snare(0.14, 0.5), t, 0.6 * g)
        if mel:
            m = mel[i % len(mel)]
            if m: place(music, piano(m + 12, b * 0.9, 0.9), t, 0.5 * g)
        i += 1; t += b

# 1-4: proud imperial march, snare roll + trumpet fanfare on "der Kaiser"
MEL1 = [67, 0, 72, 0, 71, 69, 67, 0, 65, 0, 69, 0, 67, 65, 64, 0]
march(0.0, 9.6, 116, [C, F_, G7, C], MEL1, 1.0)
place(music, roll(0.5, 0.6), 9.2, 0.6)
for k, (m, d) in enumerate([(67, 0.18), (67, 0.18), (67, 0.18), (72, 0.9)]): place(music, trumpet(m, d), 9.72 + k * 0.2, 0.9)
place(music, trumpet(76, 0.9), 10.32, 0.6); place(music, trumpet(79, 0.9), 10.32, 0.5); place(music, cymbal(1.6, 0.35), 10.32)
march(10.4, 12.25, 116, [C, G7], [72, 0, 76, 0, 79, 0, 76, 0], 0.9)
# 5: the music deflates ("fiss") + a comic tuba
t = tt(0.55); gl = midi(72) * np.exp(-t * 2.2); s = np.sin(2 * np.pi * np.cumsum(gl) / SR) * np.exp(-t * 3) * 0.3 + filt(noise(0.55), lo=3000) * np.exp(-t * 6) * 0.15
place(music, s.astype(np.float32), 12.25)
place(music, tuba(31, 0.45, 1.4), 12.55, 0.9); place(music, tuba(30, 0.7, 1.4), 13.3, 0.9)
# 6-7: an elegant waltz (sepia), then a sad, out-of-tune piano note
b = 60 / 150; tw = 14.33; i = 0
WALTZ = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; WMEL = [76, 77, 79, 76, 74, 72, 74, 71, 72, 69, 67, 69]
while tw < 16.95:
    ch = WALTZ[(i // 3) % 4]
    if i % 3 == 0: place(music, piano(ch[0] - 12, b * 1.2, 1.1), tw, 0.6)
    else: place(music, chord_piano(ch, b * 0.6, 0.8), tw, 0.45)
    place(music, piano(WMEL[i % len(WMEL)], b * 0.95, 0.9), tw, 0.45)
    i += 1; tw += b
place(music, piano(64, 2.0, 1.2, detune=38), 17.05, 0.7); place(music, piano(63, 2.0, 0.9, detune=45), 17.05, 0.5)
# 8-13: determined, cheerful march, press-rhythm accents during 9
MEL2 = [60, 0, 65, 0, 69, 0, 72, 0, 70, 69, 67, 0, 65, 0, 0, 0]
march(18.3, 32.55, 124, [F_, [58, 62, 65], [48, 52, 55, 58], F_], MEL2, 0.95)
for k in range(int((24.7 - 22.5) / (60 / 124 / 2))): place(music, wood(1300, 0.6), 22.5 + k * 60 / 124 / 2, 0.5)
# 14-15: tense comic tick-tock
for k in range(int((35.85 - 32.6) / 0.25)):
    tk = 32.6 + k * 0.25; place(music, wood(900 if k % 2 else 700, 0.8), tk, 0.6)
    if k % 4 == 0: place(music, tuba(36 if (k // 4) % 2 else 35, 0.22, 0.9), tk, 0.5)
    if k % 2 == 1: place(music, piano(83 if (k // 2) % 2 else 82, 0.12, 0.6), tk, 0.25)
# 16-17: joyous return + a short salute fanfare
march(35.85, 40.2, 128, [C, F_, G7, C], MEL1, 1.0)
for k, (m, d) in enumerate([(72, 0.16), (76, 0.16), (79, 0.5)]): place(music, trumpet(m, d), 38.45 + k * 0.17, 0.8)
# 18-19: confident motif, then a comic "wah-wah"
for k, m in enumerate([60, 64, 67, 72, 71, 67, 69, 72]): place(music, trumpet(m, 0.3, 2200), 40.2 + k * 0.33, 0.55)
place(music, pad([48, 55, 60], 2.7, 0.5), 40.2)
for k, m in enumerate([67, 66, 65, 64]):
    d = 0.32 if k < 3 else 0.9; s = trumpet(m, d, 1500); tw_ = tt(d); s = s * (0.55 + 0.45 * np.sin(2 * np.pi * (2.2 if k < 3 else 5.5) * tw_ - 1.5)).astype(np.float32)
    place(music, filt(s, hi=1400), 42.9 + k * 0.3, 0.8)
# 20: big, warm, emotional opening chord on "Heute"
place(music, pad([48, 55, 60, 64, 67, 72], 3.4, 1.4, hi=2600), 43.62); place(music, tuba(36, 2.4, 1.2), 43.64, 0.6); place(music, cymbal(3.0, 0.4), 43.64)
for k, m in enumerate([72, 76, 79, 84]): place(music, trumpet(m, 2.4 - k * 0.3, 3000), 43.66 + k * 0.08, 0.35)
# 21-22: slow, warm, slightly sad trumpet solo, short soft close
SOLO = [(67, 0.9), (72, 0.6), (71, 0.6), (69, 1.2), (65, 0.6), (64, 0.6), (62, 0.9), (60, 2.4)]
tsolo = 45.75
place(music, pad([53, 57, 60], 2.4, 0.6), 45.75); place(music, pad([50, 53, 57], 2.4, 0.6), 48.1); place(music, pad([48, 52, 55, 60], 2.6, 0.7), 49.4)
for m, d in SOLO:
    place(music, trumpet(m, d * 1.05, 2000, vib=0.006, a=0.08), tsolo, 0.55); tsolo += d * 0.72
i0 = int((DUR - 0.6) * SR); music[i0:] *= np.linspace(1, 0, N - i0) ** 2

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32); amb = np.zeros(N, np.float32)
def thunk(f0=90, d=0.25, g=1.0):
    t = tt(d); return ((np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 18) + filt(noise(d), hi=1500) * np.exp(-t * 40) * 0.4) * g).astype(np.float32)
def tok(f=600, g=1.0): t = tt(0.07); return ((np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + filt(noise(0.07), lo=1500) * np.exp(-t * 120) * 0.3) * g).astype(np.float32)
def ting(f=2093, g=1.0): t = tt(1.0); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, k in [(1, 4), (1.5, 6), (2.0, 8), (2.76, 10)]) * 0.25 * g).astype(np.float32)
def jingle(d=0.6):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(9): place_arr(out, ting(rng.uniform(2800, 5200), 0.35)[: int(0.25 * SR)], rng.uniform(0, d - 0.25))
    return out
def rustle(d=0.4, g=1.0): t = tt(d); return (filt(noise(d), lo=2000, hi=8000) * np.sin(np.pi * t / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)) * 0.5 * g).astype(np.float32)
def whoosh(d=0.45, g=1.0): t = tt(d); return (filt(noise(d), lo=200, hi=1800) * np.sin(np.pi * t / d) ** 2 * 0.8 * g).astype(np.float32)
def poof(g=1.0): t = tt(0.5); return (filt(noise(0.5), hi=900) * np.minimum(1, t / 0.01) * np.exp(-t * 7) * 1.4 * g).astype(np.float32)
def pop(g=1.0): t = tt(0.12); return (filt(noise(0.12), lo=400, hi=4000) * np.exp(-t * 50) * 1.2 * g).astype(np.float32)
def coins(d=1.2, g=1.0):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 14)): place_arr(out, ting(rng.uniform(3000, 6000), 0.25)[: int(0.15 * SR)], rng.uniform(0, d - 0.15))
    return out * g
def wind(d, g=1.0): t = tt(d); return (filt(noise(d), lo=150, hi=900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t + 1) ** 2) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5) * g).astype(np.float32)
def scratch(d, g=1.0): t = tt(d); return (filt(noise(d), lo=2500, hi=9000) * (np.sin(2 * np.pi * 7 * t) > 0.1) * 0.35 * g).astype(np.float32)
def kaching(g=1.0): s = thunk(300, 0.08, 0.6); b_ = ting(2637, 1.0); out = np.zeros(len(b_) + int(0.12 * SR), np.float32); out[:len(s)] += s; out[int(0.12 * SR):] += b_; return out * g
def whistle(d=0.35, g=1.0): t = tt(d); return (np.sin(2 * np.pi * 2650 * t + 3 * np.sin(2 * np.pi * 32 * t)) * adsr(d, 0.01, 0.05) * 0.4 * g).astype(np.float32)
def creak(d=0.7, f0=120, g=1.0):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.1 * t / d)); pulses = (np.mod(np.cumsum(rate) / SR, 1) < 0.08).astype(np.float32)
    return filt(pulses * np.sin(np.pi * t / d), lo=200, hi=2400) * 2.0 * g
def voice_burst(f0, d, form=(700, 1150), g=1.0):
    t = tt(d); f = f0 * (1 + 0.06 * np.sin(2 * np.pi * 3 * t)); ph = np.mod(np.cumsum(f) / SR, 1); pulse = (ph < 0.12).astype(np.float32) - 0.12
    s = sum(filt(pulse, lo=fm * 0.75, hi=fm * 1.3) for fm in form); return (s * adsr(d, 0.02, 0.05) * g).astype(np.float32)
def laugh(d=0.7, f0=220, g=1.0):
    out = np.zeros(int(d * SR), np.float32); k = 0
    while (k + 1) * 0.13 < d: place_arr(out, voice_burst(f0 * (1 - 0.03 * k), 0.09, (750, 1250)), k * 0.13); k += 1
    return out * g
def crowd_laugh(d, g=1.0):
    out = np.zeros(int(d * SR) + int(0.1 * SR), np.float32)
    for v in range(7): place_arr(out, laugh(d - 0.05, rng.uniform(170, 330)), rng.uniform(0, 0.08))
    return out * g * 0.6
def murmur(d, g=1.0, n=10):
    out = np.zeros(int(d * SR) + SR, np.float32)
    for v in range(n):
        f0 = rng.uniform(110, 260); t = 0.0
        while t < d - 0.3: sd = rng.uniform(0.12, 0.3); place_arr(out, voice_burst(f0 * rng.uniform(0.9, 1.1), sd, (rng.uniform(400, 900), rng.uniform(1100, 2200)), 0.3), t); t += sd + rng.uniform(0.02, 0.25)
    return filt(out[: int(d * SR)], hi=2500) * g
def cheer(d, g=1.0):
    t = tt(d); out = (filt(noise(d), lo=400, hi=3500) * np.minimum(1, t / 0.15) * np.exp(-t / (d * 0.8)) * 0.5).astype(np.float32)
    out = np.concatenate([out, np.zeros(SR, np.float32)])
    for v in range(8): place_arr(out, voice_burst(rng.uniform(200, 380), rng.uniform(0.4, 0.8), (rng.uniform(600, 900), rng.uniform(1300, 2000)), 0.6), rng.uniform(0, 0.3))
    return out * g
def applause(d, g=1.0):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 40)): place_arr(out, filt(noise(0.03), lo=900, hi=6000) * np.exp(-tt(0.03) * 120) * rng.uniform(0.3, 1), rng.uniform(0, d - 0.03))
    t = tt(d)[: len(out)]; return out * np.minimum(1, t / 0.1) * np.clip((d - t) / 0.3, 0, 1) * g
def grumble(d, g=1.0):
    out = np.zeros(int(d * SR) + SR, np.float32)
    for v in range(8): place_arr(out, voice_burst(rng.uniform(90, 150), d * rng.uniform(0.6, 0.95), (rng.uniform(350, 550), rng.uniform(900, 1300)), 0.5), rng.uniform(0, d * 0.2))
    return filt(out, hi=1800) * g
def bark(g=1.0):
    d = 0.16; t = tt(d); f = 520 * np.exp(-t * 4); ph = np.mod(np.cumsum(f) / SR, 1); p = (ph < 0.15).astype(np.float32) - 0.15
    return (filt(p, lo=400, hi=1800) * adsr(d, 0.005, 0.05) * 1.6 * g).astype(np.float32)
def gull(g=1.0):
    out = np.zeros(int(0.7 * SR), np.float32)
    for k in range(2):
        d = 0.22; t = tt(d); f = 1700 - 700 * t / d; s = np.sin(2 * np.pi * np.cumsum(f) / SR + 2 * np.sin(2 * np.pi * 90 * t)) * adsr(d, 0.01, 0.06) * 0.35
        place_arr(out, s.astype(np.float32), k * 0.27)
    return out * g
def hooves(d, rate=2.2, g=1.0):
    out = np.zeros(int(d * SR), np.float32); t = 0.0
    while t < d - 0.2: place_arr(out, tok(rng.uniform(380, 520), 0.8), t); place_arr(out, tok(rng.uniform(380, 520), 0.6), t + 0.09); t += 1 / rate
    return out * g
def waves(d, g=1.0): t = tt(d); return (filt(noise(d), hi=700) * (0.45 + 0.55 * np.sin(2 * np.pi * 0.16 * t) ** 2) * np.minimum(1, t / 0.8) * g).astype(np.float32)
def foghorn(d=1.6, g=1.0): t = tt(d); return (filt((saw(98, t, 10) + 0.5 * saw(147, t, 8)).astype(np.float32), hi=600) * adsr(d, 0.2, 0.4) * 0.4 * g).astype(np.float32)
def traffic(d, g=1.0): t = tt(d); return (filt(noise(d), lo=40, hi=260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t)) * np.minimum(1, t / 1.0) * g).astype(np.float32)
def plane_fly(d=0.9, g=1.0): t = tt(d); s = filt(noise(d), lo=1500, hi=5000) * np.sin(np.pi * t / d) ** 2; tone = np.sin(2 * np.pi * np.cumsum(1200 - 500 * t / d) / SR) * np.sin(np.pi * t / d) * 0.15; return ((s * 0.6 + tone) * g).astype(np.float32)

# street ambience (murmur, hooves) during street shots + gulls
for a, b_ in [(0, 14.3), (24.73, 27.3), (32.6, 40.2)]:
    d = b_ - a; place(amb, murmur(d, 0.6), a); place(amb, hooves(d, 2.1, 0.25), a)
for tg in [1.1, 5.9, 11.6, 26.0, 33.9, 39.3, 40.6, 41.9, 44.2, 47.0]: place(amb, gull(0.5), tg)
# hook: cane taps and boots in rhythm
for k in range(5): place(sfx, tok(700, 1.0), k * 0.6 + 0.02, 0.9); place(sfx, thunk(110, 0.12, 0.5), k * 0.6 + 0.3)
place(sfx, whoosh(0.5), 1.6, 0.5)
# detail cuts: button ticks, epaulette ting, sabre chain
for tx in [F(86), F(96), F(106)]: place(sfx, tok(2400, 0.7), tx)
place(sfx, ting(2637, 1.0), F(122), 0.9); place(sfx, jingle(0.7), F(169), 0.8)
for tx in [F(82), F(116), F(157), F(201)]: place(sfx, whoosh(0.3, 0.6), tx - 0.12)
# bows: cloth rustle + hats
for k in range(9): place(sfx, rustle(0.3, 0.6), 6.85 + k * 0.17)
for k in range(5): place(sfx, tok(400, 0.5), 7.0 + k * 0.33)
# the Kaiser: confetti pops + cheer on the fanfare
place(sfx, pop(1.0), 9.75); place(sfx, pop(0.8), 9.85); place(sfx, cheer(1.6, 0.6), 9.8)
# Na ja: the gull lands and pecks the plume
place(sfx, gull(0.9), 12.5)
for k in range(4): place(sfx, tok(1100, 0.6), 13.25 + k * 0.21)
# flashback: whoosh + gold shimmer, puff, empty-room wind, paper, hat drop
place(sfx, whoosh(0.6, 0.8), 14.15); place(sfx, coins(1.6, 0.5), 14.6)
place(sfx, poof(1.2), F(510)); place(sfx, poof(0.8), F(513)); place(sfx, whoosh(0.4, 0.7), F(516))
place(sfx, wind(2.0, 0.9), F(518))
for k in range(5): place(sfx, rustle(0.35, 0.7), F(518) + k * 0.25)
place(sfx, thunk(160, 0.18, 0.8), F(536))
# writing: quill scratch, seal "tok"
place(sfx, scratch(2.3, 0.9), 18.35); place(sfx, thunk(120, 0.25, 1.3), F(649))
# press: clack-clack-clack + paper
for k in range(int((24.72 - 22.5) / (60 / 124 / 2))): place(sfx, thunk(150, 0.1, 0.7), 22.5 + k * 60 / 124 / 2)
place(sfx, rustle(0.6, 0.9), 23.7)
# decree: whoosh in, crowd cheers + applause, confetti
place(sfx, whoosh(0.5, 0.8), 24.6); place(sfx, pop(1.0), 25.2); place(sfx, cheer(1.6, 0.8), 25.1); place(sfx, applause(2.0, 0.8), 25.3)
# congress: paper fold + paper plane
place(sfx, whoosh(0.4, 0.7), 27.2); place(sfx, rustle(0.4, 0.8), 28.0); place(sfx, plane_fly(1.0, 0.9), F(848)); place(amb, murmur(1.9, 0.3, 6), 27.3)
# money: press clacks, whip, banknote rustle, glint
for k in range(4): place(sfx, thunk(150, 0.1, 0.6), 29.17 + k * 0.12)
place(sfx, whoosh(0.35, 1.0), F(889)); place(sfx, rustle(0.3, 0.8), F(895)); place(sfx, ting(3136, 0.7), F(899))
# shop: through the window, bill on the counter, ka-ching, candy jar
place(sfx, whoosh(0.5, 0.7), F(936)); place(sfx, rustle(0.25, 0.8), F(944)); place(sfx, kaching(1.0), F(950)); place(sfx, tok(1500, 0.6), F(956)); place(sfx, ting(4186, 0.3), F(957))
# arrest: short comic whistle, footsteps
place(sfx, whistle(0.3, 1.0), F(980)); place(sfx, whistle(0.18, 0.8), F(980) + 0.36)
for k in range(5): place(sfx, thunk(120, 0.1, 0.4), F(982) + k * 0.36)
# angry crowd: grumble, newspapers, barking dog
place(sfx, grumble(1.4, 0.9), F(1031))
for k in range(7): place(sfx, rustle(0.25, 0.6), F(1031) + k * 0.2)
for k in range(5): place(sfx, bark(0.8), F(1033) + k * 0.2)
# free: door creak, cheer, confetti
place(sfx, creak(0.7, 120, 0.9), F(1074)); place(sfx, cheer(1.4, 0.9), F(1086)); place(sfx, pop(0.9), F(1086))
# salute: boots "tak"
place(sfx, thunk(200, 0.1, 1.2), F(1137)); place(sfx, thunk(220, 0.1, 1.0), F(1153)); place(sfx, thunk(200, 0.1, 0.9), F(1155)); place(sfx, ting(2637, 0.4), F(1155))
# bay: waves, fog horn; whip to the laughing crowd, gulls "laugh" too
place(amb, waves(43.7 - 40.1, 0.8), 40.1); place(sfx, foghorn(1.6, 0.9), 40.35)
place(sfx, whoosh(0.35, 1.0), F(1282)); place(sfx, crowd_laugh(0.8, 1.0), F(1288)); place(sfx, gull(0.8), F(1292)); place(sfx, thunk(170, 0.15, 0.5), F(1301))
# reveal: wind + distant modern traffic
place(sfx, whoosh(0.9, 0.7), 43.45); place(amb, wind(2.2, 0.6), 43.7); place(amb, traffic(2.0, 1.0), 43.9); place(amb, waves(2.0, 0.5), 43.7)
# funeral: slow hooves, wind
place(amb, hooves(2.1, 1.2, 0.35), 45.7); place(amb, wind(4.8, 0.5), 45.6)
# final: soft wind, the feather lifts
place(sfx, whoosh(1.4, 0.4), 48.0)

# ---------------- mix ----------------
voice = load_voice()
def movavg(x, w):
    c = np.cumsum(np.concatenate([np.zeros(w // 2 + 1), x, np.zeros(w)])); return ((c[w:w + len(x)] - c[:len(x)]) / w).astype(np.float32)
win = int(0.03 * SR); vrms = np.sqrt(np.maximum(movavg(voice ** 2, win), 0))
speech = vrms > 0.02
sm_ = int(0.25 * SR); speechS = np.clip(movavg(speech.astype(np.float32), sm_) * 1.5, 0, 1)
v_level = np.sqrt(np.mean(voice[speech] ** 2))
def rms(x): m = np.abs(x) > 1e-5; return np.sqrt(np.mean(x[m] ** 2)) if m.any() else 1
music *= v_level * 10 ** (-16.5 / 20) / rms(music)     # gaps: ~16 dB under the voice ...
duck_m = 1 - 0.5 * speechS                             # ... under speech another ~6 dB -> ~22 dB under
amb *= v_level * 10 ** (-24 / 20) / rms(amb)
sfx *= v_level * 10 ** (-13 / 20) / rms(sfx)
duck_s = 1 - 0.35 * speechS
mix = voice + music * duck_m + amb * duck_m + sfx * duck_s
pk = np.max(np.abs(mix)); mix = mix / max(pk, 1e-6) * 0.95
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
def db(x): return 20 * np.log10(max(x, 1e-9))
mu = music * duck_m
print("ok %.2f s | music vs voice: under speech -%.1f dB, in gaps -%.1f dB" % (len(pcm) / SR, db(v_level) - db(rms(mu * speech)), db(v_level) - db(rms(mu * ~speech))))
