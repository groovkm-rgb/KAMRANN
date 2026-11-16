"""Bartsteuer: synthesized folk-dance music bed + SFX, mixed UNDER the user's voice.mp3 -> mix_raw.wav.
Music sits ~21 dB under the speech and is ducked further while the narrator talks. No speech is generated."""
import numpy as np, subprocess, wave

SR = 48000
DUR = 1408 / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
T = np.arange(N) / SR
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def fft_filter(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-6; H = np.ones_like(f)
    if hi: H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: H *= 1 / np.sqrt(1 + (lo / f) ** (2 * order))
    return np.fft.irfft(X * H, len(x)).astype(np.float32)

def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR; return (np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)).astype(np.float32)

def place(buf, sig, t0, gain=1.0):
    i = int(round(t0 * SR));
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain

def tone(f, dur, harm=(1,), decay=None, att=0.004, vib=0.0, vibf=5.5):
    n = int(dur * SR); t = np.arange(n) / SR; ph = 2 * np.pi * f * t + vib * np.sin(2 * np.pi * vibf * t)
    s = sum(a * np.sin((k + 1) * ph) for k, a in enumerate(harm))
    e = np.minimum(1, t / att) * (np.exp(-t / decay) if decay else np.minimum(1, (dur - t) / 0.03).clip(0))
    return (s * e).astype(np.float32)

# ------------------------------------------------ instruments
def balalaika(f, dur=0.25, trem=False):  # bright plucked triangle-body string
    if trem:
        n = int(dur * SR); out = np.zeros(n, np.float32); step = int(SR / 14)
        for i in range(0, n, step): s = balalaika(f, 0.12); out[i:i + len(s)] += s[: n - i] * 0.6
        return out * np.minimum(1, (dur - np.arange(n) / SR) / 0.05).clip(0)
    return tone(f, dur, (1, 0.7, 0.55, 0.4, 0.3, 0.2, 0.12), decay=dur * 0.45, att=0.002) * 0.5
def accordion(fs, dur, soft=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        for det in (0.998, 1.003):
            ph = 2 * np.pi * f * det * t + 0.02 * np.sin(2 * np.pi * 5.2 * t)
            s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.1 for k in range(7))
    a = np.minimum(1, t / 0.04) * np.minimum(1, (dur - t) / 0.06).clip(0)
    return fft_filter((s * a / (len(fs) * 2)).astype(np.float32), hi=2600 * soft) * 0.6
def pizz(f, dur=0.22):
    return tone(f, dur, (1, 0.45, 0.25, 0.1), decay=0.08, att=0.003) * 0.8
def harpsi(f, dur=0.4):
    return tone(f, dur, (1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2), decay=0.18, att=0.001) * 0.35
def bass(f, dur=0.3):
    return tone(f, dur, (1, 0.3, 0.1), decay=0.18, att=0.004)
def tamb(dur=0.12, k=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = fft_filter(rng.standard_normal(n).astype(np.float32), lo=5000) * np.exp(-t * 35) * 0.5
    s += sum(np.sin(2 * np.pi * f * t) for f in (5200, 6900, 8300)) * np.exp(-t * 25) * 0.05
    return (s * k).astype(np.float32)
def kick(k=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR; f = 48 + 80 * np.exp(-t * 30)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * k).astype(np.float32)
def timpani(f=55, dur=1.2, k=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 4) + fft_filter(rng.standard_normal(n).astype(np.float32), hi=300) * np.exp(-t * 20) * 0.6
    return (s * k).astype(np.float32)
def roll(dur, f=55, k=1.0, cresc=True):
    n = int(dur * SR); out = np.zeros(n, np.float32)
    for i, t0 in enumerate(np.arange(0, dur, 0.055)):
        g = (0.3 + 0.7 * t0 / dur) if cresc else 1
        s = timpani(f, 0.3, g * (0.8 + 0.4 * rng.random())); j = int(t0 * SR); out[j:j + len(s)] += s[: n - j]
    return out * k
def pad(fs, dur, k=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        for det in (0.995, 1.0, 1.005): s += np.sin(2 * np.pi * f * det * t) + 0.3 * np.sin(4 * np.pi * f * det * t)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8).clip(0)
    return (s * a / (len(fs) * 3) * k).astype(np.float32)
def bell(f, dur=1.5, k=1.0):
    return tone(f, dur, (1, 0, 0.5, 0, 0.25), decay=0.5, att=0.001) * k + tone(f * 2.76, dur, (1,), decay=0.2, att=0.001) * 0.3 * k

music = np.zeros(N, np.float32)
def seq(start, end, bpm, fn):
    b = 60 / bpm; i = 0; t = start
    while t < end - 1e-3: fn(t, i, b); i += 1; t += b / 2  # eighth-note grid

# --- 0.0-7.2: dramatic intro, timpani roll + tension pad, accents
place(music, roll(3.2, 49, 0.55), 0.0); place(music, timpani(41, 2.0, 1.0), 0.0)
place(music, pad([midi(45), midi(52), midi(57)], 7.2, 0.5), 0.0)
place(music, roll(3.6, 55, 0.5), 3.4); place(music, timpani(55, 1.5, 0.9), 3.33)
for t0, m in [(1.5, 64), (2.2, 63), (3.4, 64), (4.1, 65), (4.8, 64), (5.6, 68), (6.4, 69)]: place(music, pizz(midi(m - 12), 0.3), t0, 0.8); place(music, pizz(midi(m - 24), 0.3), t0, 0.6)
place(music, accordion([midi(57), midi(60), midi(63)], 1.3, 0.8), 5.8, 0.6)  # dim chord sting before the shave
# --- 7.2-11.2: fast comic dance in A minor, 126 bpm
CH = {'Am': [57, 60, 64], 'E': [52, 56, 59], 'Dm': [50, 53, 57], 'C': [48, 52, 55], 'G': [55, 59, 62], 'F': [53, 57, 60]}
dance = ['Am', 'Am', 'E', 'E', 'Am', 'Am', 'E', 'Am', 'Dm', 'Am', 'E', 'Am']
mel = [69, 71, 72, 71, 69, 68, 69, 71, 72, 74, 76, 74, 72, 71, 69, 68, 64, 68, 71, 69]
def dance_fn(t, i, b):
    c = CH[dance[(i // 4) % len(dance)]]
    if i % 2 == 0: place(music, bass(midi(c[0] - 12), 0.25), t, 0.9); place(music, kick(0.35), t)
    else: place(music, accordion([midi(x) for x in c], b * 0.4), t, 0.5)
    place(music, tamb(0.1, 0.7 if i % 2 else 0.4), t)
    place(music, balalaika(midi(mel[i % len(mel)]), 0.22), t, 0.55)
seq(7.2, 11.2, 126, dance_fn)
# --- 11.2-16.0: polite European minuet (3/4, harpsichord, D major) 100 bpm
mn = [(62, 66, 69), (67, 71, 74), (69, 73, 76), (62, 66, 69), (67, 71, 74), (69, 73, 64)]
mm = [74, 76, 78, 79, 78, 76, 74, 73, 71, 73, 74, 76, 74, 73, 71, 69, 71, 73, 74]
b3 = 60 / 100
for k in range(int((16.0 - 11.2) / b3)):
    t0 = 11.2 + k * b3; c = mn[(k // 3) % len(mn)]
    if k % 3 == 0: place(music, harpsi(midi(c[0] - 12), 0.6), t0, 0.9)
    else: place(music, harpsi(midi(c[1]), 0.3), t0, 0.45); place(music, harpsi(midi(c[2]), 0.3), t0, 0.45)
    place(music, harpsi(midi(mm[k % len(mm)]), 0.35), t0, 0.7)
# --- 16.0-18.0: soft heartfelt moment (warm pad + bells)
place(music, pad([midi(53), midi(57), midi(60), midi(64)], 2.3, 0.7), 15.95)
for t0, m in [(16.1, 76), (16.6, 79), (17.1, 81)]: place(music, bell(midi(m), 1.4, 0.35), t0)
# --- 18.0-34.1: sneaky "business" motif: pizzicato walking bass + staccato accordion, D minor, 112 bpm
walk = [50, 53, 57, 56, 55, 53, 52, 49, 50, 53, 57, 60, 58, 57, 55, 52]
sneak = [None, 69, None, 68, None, 69, 72, None, None, 74, None, 72, 69, None, 68, None]
def sneak_fn(t, i, b):
    if i % 2 == 0: place(music, pizz(midi(walk[(i // 2) % len(walk)] - 12), 0.3), t, 1.0)
    if i % 4 == 2: place(music, accordion([midi(62), midi(65), midi(69)], b * 0.22), t, 0.45)
    m = sneak[i % len(sneak)]
    if m and (i // 16) % 2 == 1: place(music, pizz(midi(m), 0.2), t, 0.55)
    if i % 4 == 0: place(music, tamb(0.06, 0.25), t)
seq(18.0, 34.1, 112, sneak_fn)
# --- 34.1-38.3: frantic chase, accelerating 132 -> 160 bpm
t0, i = 34.1, 0
while t0 < 38.3:
    bpm = 132 + 28 * (t0 - 34.1) / 4.2; b = 60 / bpm; c = CH[['Am', 'E', 'Am', 'E', 'Dm', 'E'][(i // 4) % 6]]
    if i % 2 == 0: place(music, bass(midi(c[0] - 12), 0.18), t0); place(music, kick(0.4), t0)
    else: place(music, accordion([midi(x) for x in c], b * 0.35), t0, 0.5)
    place(music, tamb(0.08, 0.7), t0); place(music, tamb(0.06, 0.4), t0 + b / 4)
    place(music, balalaika(midi([76, 75, 76, 72, 74, 72, 71, 68][i % 8]), 0.15), t0, 0.5)
    t0 += b / 2; i += 1
# --- 38.3-46.9: slow, warm, sweet waltz (F major, 76 bpm) with balalaika tremolo melody, final chord
wz = [('F', 65), ('F', 69), ('C', 67), ('C', 64), ('Dm', 65), ('Am', 64), ('F', 60), ('C', 67), ('F', 69), ('F', 72), ('C', 70), ('F', 69)]
bw = 60 / 76
for k in range(int((45.7 - 38.3) / (bw * 3)) + 1):
    t0 = 38.3 + k * bw * 3; ch, m = wz[k % len(wz)]; c = CH[ch]
    if t0 > 45.7: break
    place(music, bass(midi(c[0] - 12), 0.8), t0, 0.7)
    for j in (1, 2): place(music, accordion([midi(x) for x in c], bw * 0.7, 0.6), t0 + j * bw, 0.35)
    place(music, balalaika(midi(m + 12), bw * 2.6, trem=True), t0, 0.45)
place(music, pad([midi(53), midi(57), midi(60), midi(65)], 4.0, 0.8), 43.4)
place(music, accordion([midi(53), midi(57), midi(60), midi(65)], 2.4, 0.7), 45.9, 0.7)
place(music, balalaika(midi(77), 2.0, trem=True), 45.9, 0.45); place(music, bell(midi(84), 2.0, 0.4), 46.0)
music = fft_filter(music, lo=40, hi=9000)

# ------------------------------------------------ SFX
sfx = np.zeros(N, np.float32)
def noise(n): return rng.standard_normal(n).astype(np.float32)
def whoosh(dur=0.35, k=1.0, up=True):
    n = int(dur * SR); t = np.arange(n) / SR; x = noise(n); out = np.zeros(n, np.float32); seg = n // 8
    for s in range(8):
        f = 300 + (2600 if up else 1800) * (s / 8 if up else 1 - s / 8)
        y = fft_filter(x[s * seg:(s + 1) * seg + 400], lo=f * 0.6, hi=f * 1.6)[: seg + 400]; out[s * seg: s * seg + len(y)] += y[: n - s * seg] * np.hanning(len(y))[: n - s * seg]
    return out * np.sin(np.pi * t / dur) ** 1.5 * 0.6 * k
def ting(f=2400, k=1.0): return (tone(f, 1.2, (1, 0, 0.3), decay=0.35, att=0.001) + tone(f * 2.71, 1.2, (1,), decay=0.1, att=0.001) * 0.4) * 0.35 * k
def shhk(k=1.0): n = int(0.18 * SR); t = np.arange(n) / SR; return fft_filter(noise(n), lo=3500) * np.exp(-t * 18) * np.minimum(1, t / 0.01) * 0.5 * k
def firt(k=1.0):  # comic beard rip: fast rising filtered zip
    n = int(0.22 * SR); t = np.arange(n) / SR; f = 300 + 3000 * (t / 0.22) ** 1.5
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25 + fft_filter(noise(n), lo=1500) * 0.4
    return (s * np.exp(-t * 6) * np.minimum(1, t / 0.005) * k).astype(np.float32)
def puf(k=1.0): n = int(0.3 * SR); t = np.arange(n) / SR; return fft_filter(noise(n), hi=700) * np.exp(-t * 14) * np.minimum(1, t / 0.01) * 0.9 * k
def thud(f=70, k=1.0): n = int(0.4 * SR); t = np.arange(n) / SR; ff = f + 60 * np.exp(-t * 40); return (np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 10) + fft_filter(noise(n), hi=400) * np.exp(-t * 30) * 0.5) * k
def gasp(k=1.0, f0=700):
    n = int(0.35 * SR); t = np.arange(n) / SR; x = noise(n)
    s = fft_filter(x, lo=f0, hi=f0 * 2.2) + 0.6 * fft_filter(x, lo=f0 * 2.6, hi=f0 * 4)
    return s * np.sin(np.pi * t / 0.35) ** 2 * 0.5 * k
def gulp(k=1.0): n = int(0.25 * SR); t = np.arange(n) / SR; f = 500 - 350 * t / 0.25; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-((t - 0.1) / 0.06) ** 2) * 0.5 + tone(180, 0.25, (1,), decay=0.03) * 0.4) * k
def clink(k=1.0): return sum(tone(f, 0.8, (1,), decay=0.25, att=0.001) for f in (2850, 3720, 5130)) * 0.15 * k
def crackle(dur, rate=8, k=1.0):
    n = int(dur * SR); out = np.zeros(n, np.float32)
    for t0 in np.sort(rng.random(int(dur * rate)) * dur):
        m = int(0.01 * SR); j = int(t0 * SR); s = fft_filter(noise(m + 200), lo=1500)[:m] * np.exp(-np.arange(m) / SR * 500) * (0.3 + rng.random()); out[j:j + m] += s[: n - j]
    return out * k
def murmur(dur, k=1.0):  # unintelligible crowd: band-limited noise with syllable-rate modulation
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for v in range(6):
        f0 = 300 + v * 90; mod = (0.5 + 0.5 * np.sin(2 * np.pi * (3 + v * 0.7) * t + v)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * t + v * 2))
        s += fft_filter(noise(n), lo=f0, hi=f0 * 2.5) * mod.astype(np.float32)
    return s * np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.5).clip(0) * 0.25 * k
def laugh(dur=1.2, k=1.0, f0=170):  # cartoon "ha-ha" pulses from formant-filtered buzz (no words)
    n = int(dur * SR); t = np.arange(n) / SR; ph = np.cumsum(f0 * (1 + 0.1 * np.sin(2 * np.pi * 3 * t))) / SR
    buzz = (2 * (ph % 1) - 1).astype(np.float32); s = fft_filter(buzz, lo=500, hi=1300) + 0.5 * fft_filter(buzz, lo=1500, hi=2600)
    puls = (np.sin(np.pi * ((t * 6.5) % 1)) ** 2) * np.minimum(1, t / 0.05) * np.exp(-t / dur * 1.2)
    return (s * puls * 0.6 + fft_filter(noise(n), lo=800, hi=3000) * puls * 0.15) * k
def hooves(dur, k=1.0):
    out = np.zeros(int(dur * SR), np.float32)
    for i, t0 in enumerate(np.arange(0, dur, 0.18)):
        m = int(0.06 * SR); s = (tone(900 + 200 * (i % 2), 0.06, (1, 0.5), decay=0.012) + fft_filter(noise(m), lo=1500)[:m] * np.exp(-np.arange(m) / SR * 80) * 0.5)
        j = int((t0 + (0.05 if i % 2 else 0)) * SR); out[j:j + m] += s[: len(out) - j]
    return out * 0.35 * k
def waves(dur, k=1.0): n = int(dur * SR); t = np.arange(n) / SR; return fft_filter(noise(n), lo=150, hi=1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t)) * np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.3).clip(0) * 0.35 * k
def scratch(dur, k=1.0): n = int(dur * SR); t = np.arange(n) / SR; return fft_filter(noise(n), lo=2500, hi=7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t))) * 0.35 * k
def coins(dur=0.6, k=1.0, n_=14):
    out = np.zeros(int(dur * SR), np.float32)
    for t0 in np.sort(rng.random(n_) * dur * 0.8): s = tone(2500 + rng.random() * 3500, 0.25, (1, 0.3), decay=0.05, att=0.001) * (0.3 + 0.5 * rng.random()); j = int(t0 * SR); out[j:j + len(s)] += s[: len(out) - j]
    return out * 0.4 * k
def clang(k=1.0):
    a = sum(tone(f, 1.0, (1,), decay=0.22, att=0.001) * g for f, g in [(310, 1), (790, 0.7), (1270, 0.5), (2230, 0.35)]) * 0.3; b = thud(55, 0.8) * 0.6; a[:len(b)] += b; return a * k
def creak(dur=0.5, k=1.0): n = int(dur * SR); t = np.arange(n) / SR; f = 90 + 40 * np.sin(2 * np.pi * 2 * t); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); return fft_filter(s.astype(np.float32), lo=300, hi=2000) * 0.12 * k * np.sin(np.pi * t / dur)
def spin(dur=0.9, k=1.0, f0=1400):  # wobbling coin whirr: "vinnnn"
    n = int(dur * SR); t = np.arange(n) / SR; rate = 25 + 50 * (t / dur) ** 2
    s = np.sin(2 * np.pi * f0 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(rate) / SR)) + 0.3 * np.sin(2 * np.pi * f0 * 1.5 * t)
    return (s * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.2).clip(0) * 0.2 * k).astype(np.float32)
def boing(k=1.0): n = int(0.5 * SR); t = np.arange(n) / SR; f = 220 + 160 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.4 * k).astype(np.float32)
def rustle(dur, k=1.0): n = int(dur * SR); t = np.arange(n) / SR; return fft_filter(noise(n), lo=1200, hi=6000) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 4 * t + np.sin(2 * np.pi * 1.3 * t)))) * 0.25 * k
def wind(dur, k=1.0): n = int(dur * SR); t = np.arange(n) / SR; return fft_filter(noise(n), lo=200, hi=1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t)) * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4).clip(0) * 0.3 * k
def steps(dur, k=1.0, every=0.42):
    out = np.zeros(int(dur * SR), np.float32)
    for t0 in np.arange(0.1, dur, every): m = int(0.12 * SR); s = fft_filter(noise(m), lo=400, hi=3000) * np.exp(-np.arange(m) / SR * 30); j = int(t0 * SR); out[j:j + m] += s[: len(out) - j]
    return out * 0.3 * k
def jingle(dur, k=1.0):
    out = np.zeros(int(dur * SR), np.float32)
    for t0 in np.arange(0, dur, 0.21): s = sum(tone(f, 0.2, (1,), decay=0.05, att=0.001) for f in (4200, 5300, 6100)) * 0.1; j = int(t0 * SR); out[j:j + len(s)] += s[: len(out) - j]
    return out * k
def shimmer(dur=0.8, k=1.0):
    out = np.zeros(int(dur * SR), np.float32)
    for i, t0 in enumerate(np.linspace(0, dur * 0.7, 9)): s = bell(midi(84 + [0, 4, 7, 12, 16, 12, 19, 24, 28][i]), 0.6, 0.25); j = int(t0 * SR); out[j:j + len(s)] += s[: len(out) - j]
    return out * k
def blow(k=1.0): n = int(0.5 * SR); t = np.arange(n) / SR; return fft_filter(noise(n), lo=400, hi=2500) * np.sin(np.pi * t / 0.5) ** 2 * 0.35 * k
def tick(k=1.0): return (tone(1800, 0.08, (1, 0.4), decay=0.01, att=0.001) + thud(160, 0.3)[: int(0.08 * SR)] * 0.5) * k
def kiss(k=1.0): n = int(0.12 * SR); t = np.arange(n) / SR; return (fft_filter(noise(n), lo=1500, hi=5000) * np.exp(-t * 60) + np.sin(2 * np.pi * 900 * t) * np.exp(-t * 50) * 0.5) * 0.4 * k

S = lambda f: f / 30
# palace ambience
place(sfx, murmur(11.3, 0.9), 0.0); place(sfx, murmur(2.2, 0.5), 15.95)
place(sfx, crackle(11.2, 6, 0.4), 0.0); place(sfx, crackle(2.1, 4, 0.3), 15.95)
for t0 in (0.9, 4.6, 6.2, 16.6): place(sfx, clink(0.6), t0)
# razor
place(sfx, ting(2600, 1.2), S(14)); place(sfx, shhk(0.8), S(4)); place(sfx, ting(3100, 1.4), S(75)); place(sfx, shhk(0.6), S(70))
# whooshes on whip pans / jumps
for f0, k in [(100, 1.0), (418, 0.9), (478, 0.9), (538, 0.9), (735, 0.9), (1024, 0.9), (276, 0.5), (289, 0.5), (868, 0.5), (1314, 0.4)]: place(sfx, whoosh(0.35, k), S(f0) - 0.08)
# gulp (all nobles)
place(sfx, gulp(1.0), S(196)); place(sfx, gulp(0.7), S(198))
# shaving: firt + puf + gasps
for f0, gk in [(239, 900), (272, 1050), (285, 800), (298, 950)]:
    place(sfx, shhk(0.6), S(f0) - 0.08); place(sfx, firt(0.9), S(f0)); place(sfx, puf(0.8), S(f0) + 0.05); place(sfx, gasp(0.7, gk), S(f0) + 0.18)
place(sfx, thud(65, 0.9), S(283)); place(sfx, laugh(0.9, 0.35, 190), S(248))  # fainting thud, tsar giggle
place(sfx, blow(0.9), S(308)); place(sfx, ting(4200, 0.6), S(318))
# flashback
place(sfx, shimmer(0.8, 0.8), S(333)); place(sfx, hooves(1.7, 1.0), 11.3); place(sfx, waves(2.0, 1.0), 12.7)
place(sfx, steps(2.0, 0.6, 0.35), 14.0); place(sfx, laugh(0.9, 0.3, 240), 14.9); place(sfx, laugh(0.8, 0.25, 210), 15.2)
# study
place(sfx, crackle(5.7, 5, 0.35), 17.95); place(sfx, bell(midi(88), 1.0, 0.5), S(546))
place(sfx, rustle(0.6, 0.5), S(596)); place(sfx, tick(0.5), S(674))
place(sfx, scratch(0.6, 1.0), S(704)); place(sfx, thud(48, 1.4), S(724)); place(sfx, clink(0.4), S(725))
# tax office / mint
place(sfx, coins(0.6, 0.6), S(742)); place(sfx, murmur(9.2, 0.35), 24.5)
place(sfx, thud(60, 1.2), S(776)); place(sfx, coins(0.5, 1.0, 18), S(776) + 0.02)
place(sfx, ting(3500, 0.7), S(794)); place(sfx, coins(0.4, 0.4, 4), S(796))
place(sfx, creak(0.6, 1.0), S(822)); place(sfx, clang(1.2), S(838)); place(sfx, ting(2900, 0.5), S(852))
place(sfx, spin(1.0, 1.0, 1400), S(868)); place(sfx, ting(4000, 0.4), S(898)); place(sfx, coins(0.3, 0.4, 3), S(900))
place(sfx, spin(1.4, 0.8, 1250), S(915)); place(sfx, shimmer(0.7, 0.5), S(962)); place(sfx, ting(3800, 0.3), S(990))
# street
place(sfx, wind(4.3, 1.0), 34.1); place(sfx, steps(4.0, 0.5, 0.5), 34.2); place(sfx, jingle(1.8, 0.5), 34.2)
place(sfx, rustle(0.7, 1.0), S(1040)); place(sfx, boing(0.8), S(1060))
place(sfx, puf(1.4), S(1088)); place(sfx, whoosh(0.3, 0.4, False), S(1088)); place(sfx, shhk(1.0), S(1100)); place(sfx, shhk(0.8), S(1104)); place(sfx, ting(3600, 0.5), S(1112))
place(sfx, laugh(1.2, 0.45, 160), 36.85); place(sfx, laugh(1.0, 0.4, 210), 37.05); place(sfx, laugh(0.9, 0.35, 130), 37.3)
place(sfx, puf(0.8), S(1141))
# old man's house
place(sfx, crackle(6.4, 9, 0.55), 38.3); place(sfx, fft_filter(noise(int(6.4 * SR)), hi=300) * 0.08, 38.3)
place(sfx, rustle(1.3, 0.6), 39.2); place(sfx, rustle(1.0, 0.5), 40.6)
place(sfx, tick(0.6), S(1292)); place(sfx, kiss(0.6), S(1294))
place(sfx, shimmer(1.0, 0.6), S(1330))
# heaven
place(sfx, wind(2.2, 0.4), 44.7); place(sfx, shimmer(1.2, 0.8), S(1342))

# ------------------------------------------------ mix: music ~21 dB under the speech, extra ducking while talking
voice = load_voice()
def movavg(x, w):
    c = np.cumsum(np.concatenate([[0.0], x.astype(np.float64)])); y = (c[w:] - c[:-w]) / w; pad = len(x) - len(y); return np.concatenate([np.full(pad // 2, y[0]), y, np.full(pad - pad // 2, y[-1])]).astype(np.float32)
def rms_env(x, win=0.05): return np.sqrt(movavg(x ** 2, int(win * SR)) + 1e-12)
venv = rms_env(voice, 0.08); speech_rms = np.sqrt(np.mean(voice[np.abs(voice) > 0.02] ** 2))
talk = (venv > speech_rms * 0.12).astype(np.float32)
talk = movavg(talk, int(0.25 * SR)).clip(0, 1)  # smooth attack/release
mrms = np.sqrt(np.mean(music ** 2)); music *= (speech_rms * 10 ** (-21 / 20)) / mrms
music *= (1 - 0.35 * talk)  # ~-3.7 dB more while the narrator speaks
srms = np.sqrt(np.mean(sfx[np.abs(sfx) > 1e-3] ** 2)) if np.any(np.abs(sfx) > 1e-3) else 1
sfx *= (speech_rms * 10 ** (-13 / 20)) / srms
sfx *= (1 - 0.3 * talk)
mix = voice + music + sfx
# tail fade
fade = int(0.4 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pk = np.max(np.abs(mix)); mix = mix / max(1.0, pk / 0.95)
print('speech rms %.4f  music rms %.4f (%.1f dB)  sfx rms %.4f  peak %.3f' % (speech_rms, np.sqrt(np.mean(music ** 2)), 20 * np.log10(np.sqrt(np.mean(music ** 2)) / speech_rms), np.sqrt(np.mean(sfx ** 2)), pk))
st = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype(np.int16)
with wave.open('mix_raw.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
mb = (np.clip(np.stack([music + sfx] * 2, 1) * 3, -1, 1) * 32767).astype(np.int16)
with wave.open('work/bed_only.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(mb.tobytes())
print('mix_raw.wav', len(mix) / SR, 's')
