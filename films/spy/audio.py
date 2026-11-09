"""Light 1940s spy-film music bed + synced SFX for "Der Mann, der nie existierte", mixed UNDER the user's voice.mp3.
Music sits ~21 dB below the speech while the voice is talking (ducked), a few dB higher in the gaps.
Everything is synthesized here (numpy only); no voice is generated or added."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_FRAMES = 1368
DUR = TOTAL_FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda fr: fr / 30
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
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if i < len(buf) and j > i: buf[i:j] += sig[: j - i] * gain
def adsr(n, a=0.01, r=0.2, d=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)); dur = n / SR
    e *= np.clip((dur - t) / max(r, 1e-4), 0, 1)
    return e
def fade(sig, a=0.01, r=0.05): return sig * adsr(len(sig), a, r)

# ---------------- instruments ----------------
def pizz(f, d=0.45, bright=0.55):
    t = tt(d); s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(7))
    return (s * np.minimum(1, t / 0.003) * np.exp(-t * (7 + f / 300))).astype(np.float32)
def bass(f, d=0.5):
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return (s * np.minimum(1, t / 0.006) * np.exp(-t * 4.5)).astype(np.float32)
def piano(f, d=3.0):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (0.9 + 0.7 * k)) / k ** 1.2 for k in range(1, 8))
    return (s * np.minimum(1, t / 0.004)).astype(np.float32)
def clarinet(f, d, vib=5.2):
    t = tt(d); ph = 2 * np.pi * f * t + 0.012 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / 0.3) * 2 * np.pi
    s = sum(np.sin(k * ph) / k for k in (1, 3, 5, 7, 9)) + 0.15 * np.sin(2 * ph)
    s = filt(s.astype(np.float32), hi=2400) * adsr(len(t), 0.05, min(0.12, d * 0.4))
    return s.astype(np.float32)
def strings(fs, d, a=0.6, r=0.8, bright=1600):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        for det in (-0.004, 0.0, 0.005):
            ph = 2 * np.pi * f * (1 + det) * t + 0.01 * np.sin(2 * np.pi * 5 * t + det * 900)
            s += sum(np.sin(k * ph) / k for k in range(1, 9))
    s = filt((s / (3 * len(fs))).astype(np.float32), hi=bright) * adsr(len(t), a, r)
    return s.astype(np.float32)
def brush(d=0.35):
    t = tt(d); return (filt(noise(d), lo=1500, hi=7000) * np.minimum(1, t / 0.05) * np.exp(-t * 9) * 0.6).astype(np.float32)
def tick(d=0.08):
    t = tt(d); return (filt(noise(d), lo=6000) * np.exp(-t * 60) * 0.5).astype(np.float32)
def snare(d=0.18, k=1.0):
    t = tt(d); s = filt(noise(d), lo=800, hi=8000) * np.exp(-t * 26) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return (s * k).astype(np.float32)
def timp(f=65, d=1.2):
    t = tt(d); return (np.sin(2 * np.pi * f * t * (1 + 0.04 * np.exp(-t * 8))) * np.exp(-t * 2.5) + filt(noise(d), hi=300) * np.exp(-t * 18) * 0.3).astype(np.float32)

music = np.zeros(N, np.float32)
A2, C3, D3, E3, F2, G2, E2, Bb2 = (midi(m) for m in (45, 48, 50, 52, 41, 43, 40, 46))

# 1-2 (0-4.7): mysterious, low, single piano notes over the sea
place(music, piano(midi(45), 3.5), 0.05, 0.55); place(music, piano(midi(57), 3.0), 0.05, 0.25)
place(music, piano(midi(52), 3.0), 2.3, 0.4)
place(music, strings([midi(33)], 4.9, a=1.2, r=1.2, bright=500), 0.0, 0.5)

# 3-7 (4.7-16.25): spy theme — walking pizz bass, brushes, sneaky clarinet; comic stop at "…" 10.54-10.92
beat = 60 / 100
walk = [A2, C3, D3, E3, A2, G2, F2, E2]
t = 4.7; i = 0
while t < 16.25:
    if 10.5 <= t < 10.92: t += beat / 2; continue
    soft = 0.65 if t >= 11.8 else 1.0
    place(music, bass(walk[i % 8], 0.55), t, 0.85 * soft)
    place(music, brush(0.35), t + beat / 2, 0.35 * soft)
    if i % 2 == 1: place(music, snare(0.16, 0.25), t, 0.6 * soft)
    place(music, tick(), t + beat * 0.66, 0.25 * soft)
    if t < 11.8 and i % 4 in (1, 3): place(music, pizz(midi(69 if i % 8 < 4 else 72), 0.3), t + beat / 2, 0.22)
    t += beat; i += 1
for t0, notes in [(5.9, [(64, 0.25), (65, 0.25), (64, 0.25), (63, 0.25), (64, 0.6)]), (8.3, [(69, 0.2), (68, 0.2), (67, 0.2), (66, 0.2), (64, 0.7)]),
                  (13.0, [(60, 0.3), (59, 0.3), (57, 0.9)])]:
    tc = t0
    for m, d in notes: place(music, clarinet(midi(m), d * 1.05), tc, 0.30); tc += d
place(music, bass(midi(40), 0.9) * 1.2, 10.93, 0.9); place(music, pizz(midi(76), 0.3), 10.93, 0.35)   # comic "plonk" after the pause
place(music, strings([midi(45), midi(48), midi(52)], 4.4, a=0.8, r=0.8, bright=900), 11.85, 0.25)  # cold room pad

# 8-12 (16.25-24.85): playful, tempo creeping up; a pizz hit on every listed object
t = 16.25; i = 0
while t < 24.85:
    bpm = 104 + 10 * (t - 16.25) / 8.6; b = 60 / bpm
    place(music, bass([A2, E2, A2, E2, D3, A2, E3, E2][i % 8], 0.4), t, 0.7)
    place(music, pizz(midi([69, 72, 76, 72][i % 4]), 0.25, 0.6), t + b / 2, 0.16)
    place(music, brush(0.25), t + b / 2, 0.25)
    t += b; i += 1
for th in (18.44, 20.26, 21.12, 23.03):
    for k, m in enumerate((81, 84, 88)): place(music, pizz(midi(m), 0.35, 0.7), th + k * 0.045, 0.45)
place(music, clarinet(midi(76), 0.18), 16.55, 0.25); place(music, clarinet(midi(77), 0.18), 16.75, 0.25); place(music, clarinet(midi(76), 0.5), 16.95, 0.25)

# 13-14 (24.85-29.78): tension — low tremolo strings, pulse; sly chord on "Alle falsch."
d = 29.78 - 24.85; tr = strings([midi(33), midi(40)], d, a=0.4, r=0.4, bright=700) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * tt(d)))
place(music, tr.astype(np.float32), 24.85, 0.7)
for k in range(int(d / 0.6)): place(music, bass(midi(33), 0.35), 24.85 + k * 0.6, 0.55)
for m in (57, 60, 63, 66): place(music, pizz(midi(m), 0.6, 0.65), 28.95, 0.35)
place(music, clarinet(midi(63), 0.5), 28.95, 0.28)

# 15 (29.78-32.55): thin — only a low string under the sea
place(music, strings([midi(40)], 2.9, a=0.6, r=0.6, bright=600), 29.75, 0.45)
# 16 (32.55-34.15): morning, light and hopeful
for k, m in enumerate([60, 64, 67, 72, 67, 64, 65, 69]): place(music, pizz(midi(m), 0.5, 0.5), 32.6 + k * 0.19, 0.22)
place(music, clarinet(midi(72), 1.2), 32.65, 0.2); place(music, strings([midi(48), midi(55), midi(64)], 1.7, a=0.3, r=0.5, bright=1400), 32.55, 0.22)

# 17-19 (34.15-38.73): tension climbs — snare drum pattern, ostinato, rising pad
t = 34.15; i = 0; b = 60 / 108
while t < 38.73:
    k = (t - 34.15) / 4.58
    place(music, bass([A2, A2, A2, Bb2][i % 4], 0.3), t, 0.7 + 0.3 * k)
    place(music, snare(0.14, 0.5 + 0.6 * k), t + b / 2, 0.55)
    if i % 4 == 3: [place(music, snare(0.1, 0.4 + 0.5 * k), t + b * (0.5 + q / 6), 0.45) for q in range(1, 3)]
    t += b; i += 1
place(music, strings([midi(45), midi(52)], 4.6, a=2.5, r=0.3, bright=1100), 34.15, 0.35)
# 20 (38.73-41.75): victory, understated
place(music, timp(55, 1.2), 38.75, 0.6)
place(music, strings([midi(57), midi(61), midi(64)], 3.1, a=0.35, r=0.6, bright=1700), 38.73, 0.35)
for k, (m, dd) in enumerate([(69, 0.45), (73, 0.45), (76, 1.4)]): place(music, clarinet(midi(m), dd), 39.0 + [0, 0.45, 0.9][k], 0.22)
# 21 (41.75-end): warm, respectful, slow; ends on one long string note
place(music, strings([midi(53), midi(57), midi(60)], 1.8, a=0.5, r=0.6, bright=1300), 41.75, 0.6)
place(music, strings([midi(48), midi(55), midi(64)], 1.6, a=0.5, r=0.7, bright=1300), 43.2, 0.6)
place(music, strings([midi(57), midi(45)], DUR - 44.4, a=0.4, r=1.0, bright=1200), 44.4, 1.1)
place(music, piano(midi(69), 2.5), 43.2, 0.12)

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def waves(d, k=1.0):
    t = tt(d); sw = 0.55 + 0.45 * np.sin(2 * np.pi * 0.16 * t + 1) ** 2
    return (filt(noise(d), hi=900) * 0.6 * sw * k + filt(noise(d), lo=2000, hi=6000) * 0.08 * sw).astype(np.float32) * adsr(len(t), 0.3, 0.4)
def whoosh(d=0.45):
    t = tt(d); x = noise(d); s = filt(x, lo=300, hi=2500) * np.sin(np.pi * t / d) ** 2
    return (s * 0.7).astype(np.float32)
def horn(d=1.6):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * k * t) / k for f in (98, 123) for k in range(1, 6))
    return (filt(s.astype(np.float32), hi=700) * adsr(len(t), 0.15, 0.5) * 0.3).astype(np.float32)
def creak(d=0.7, f0=120):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 1.1 * t / d)); ph = np.cumsum(rate) / SR
    s = filt(((np.mod(ph, 1) < 0.08) * (0.6 + 0.4 * rng.random(len(t)))).astype(np.float32), lo=250, hi=2600) * np.sin(np.pi * t / d)
    return (s * 2.2).astype(np.float32)
def splash(d=0.7, big=1.0):
    t = tt(d); return ((filt(noise(d), hi=4500) * np.exp(-t * 6) + filt(noise(d), hi=500) * np.exp(-t * 8) * big) * np.minimum(1, t / 0.01)).astype(np.float32)
def plop():
    t = tt(0.35); f = 900 * np.exp(-t * 9) + 250
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * 0.6 + filt(noise(0.35), hi=3000) * np.exp(-t * 25) * 0.3).astype(np.float32)
def scrape(d=1.0, hi=3000):
    t = tt(d); return (filt(noise(d), lo=300, hi=hi) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t) ** 2) * np.sin(np.pi * t / d) * 0.5).astype(np.float32)
def puff(d=0.5):
    t = tt(d); return (filt(noise(d), lo=200, hi=1800) * np.sin(np.pi * t / d) ** 1.5 * 0.5).astype(np.float32)
def crackle(d):
    t = tt(d); x = np.zeros(len(t), np.float32); idx = rng.integers(0, len(t), int(d * 60)); x[idx] = rng.standard_normal(len(idx)) * 0.8
    hiss = filt(noise(d), lo=2500, hi=7000) * 0.06 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t))
    return (filt(x, hi=5000) + hiss).astype(np.float32)
def clack(f=900):
    t = tt(0.12); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 60) + filt(noise(0.12), lo=1500) * np.exp(-t * 80) * 0.5).astype(np.float32)
def hum(d, f0=60, k=1.0):
    t = tt(d); s = np.sin(2 * np.pi * f0 * t) * 0.5 + np.sin(4 * np.pi * f0 * t) * 0.25 + np.sin(6 * np.pi * f0 * t) * 0.12 + filt(noise(d), lo=4000, hi=9000) * 0.03
    return (s * adsr(len(t), 0.4, 0.4) * k).astype(np.float32)
def step(k=1.0):
    t = tt(0.12); return (filt(noise(0.12), lo=100, hi=1200) * np.exp(-t * 40) * k).astype(np.float32)
def pof(f0=300):
    t = tt(0.32); s = filt(noise(0.32), lo=150, hi=2200) * np.exp(-t * 14) + np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 6) + 80) / SR) * np.exp(-t * 18) * 0.5
    return (s * np.minimum(1, t / 0.004)).astype(np.float32)
def click(f=2200, d=0.05):
    t = tt(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + filt(noise(d), lo=3000) * np.exp(-t * 200) * 0.6).astype(np.float32)
def ting():
    t = tt(1.2); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2637, 3.5), (3951, 5), (5274, 7)]) * 0.35).astype(np.float32)
def rustle(d=0.6):
    t = tt(d); x = noise(d) * (0.3 + 0.7 * (rng.random(len(t)) < 0.02).astype(np.float32)); return (filt(x, lo=1500, hi=8000) * np.sin(np.pi * t / d) * 0.9).astype(np.float32)
def hop():
    t = tt(0.22); f = 300 + 900 * t / 0.22
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.22) * 0.5).astype(np.float32)
def hmm():  # comic low "hmm" brass accent
    out = []
    for m, d in [(43, 0.22), (40, 0.42)]:
        t = tt(d); ph = 2 * np.pi * midi(m) * t; s = sum(np.sin(k * ph) / k ** 1.1 for k in range(1, 9))
        out.append(filt(s.astype(np.float32), hi=900) * adsr(len(t), 0.03, 0.12))
    return np.concatenate(out).astype(np.float32) * 0.6
def chain(d=0.8):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 22)):
        tk = rng.uniform(0, d - 0.06); f = rng.uniform(2500, 5200); place_local = int(tk * SR); c = click(f, 0.05) * rng.uniform(0.3, 0.8)
        s[place_local:place_local + len(c)] += c[: len(s) - place_local]
    return s
def dit():
    t = tt(0.16); return (np.sign(np.sin(2 * np.pi * 880 * t)) * 0.25 * np.exp(-t * 18)).astype(np.float32)
def shimmer(d=0.8):
    t = tt(d); return (sum(np.sin(2 * np.pi * f * t + p) for f, p in [(1760, 0), (2217, 1), (2637, 2), (3520, 3)]) * 0.12 * np.sin(np.pi * t / d)).astype(np.float32)
def gull(d=0.45):
    t = tt(d); f = 1300 + 700 * np.sin(np.pi * t / d) - 500 * t / d
    return (filt((np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3).astype(np.float32), hi=3500) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def huh():  # short surprised "hh-uh" (formant blip, not speech)
    t = tt(0.32); f0 = 180 + 80 * np.sin(np.pi * t / 0.32)
    src = (np.mod(np.cumsum(f0) / SR, 1) * 2 - 1).astype(np.float32)
    s = filt(src, lo=500, hi=1300) + filt(noise(0.32), lo=800, hi=2500) * 0.25 * np.exp(-t * 20)
    return (s * np.sin(np.pi * t / 0.32) * 0.6).astype(np.float32)
def typewriter(d):
    s = np.zeros(int(d * SR), np.float32); tk = 0.0
    while tk < d - 0.1:
        c = click(rng.uniform(1200, 2000), 0.04) * rng.uniform(0.4, 0.9); i = int(tk * SR); s[i:i + len(c)] += c[: len(s) - i]; tk += rng.uniform(0.07, 0.16)
    return s
def zoom():
    t = tt(0.5); f = 500 + 1600 * (t / 0.5) ** 2
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.5) * 0.25).astype(np.float32)
def thud():
    t = tt(0.5); return (np.sin(2 * np.pi * 70 * t * (1 + 0.5 * np.exp(-t * 30))) * np.exp(-t * 10) + filt(noise(0.5), hi=1500) * np.exp(-t * 25) * 0.6).astype(np.float32)
def boots(d, rate=2.2):
    s = np.zeros(int(d * SR), np.float32); k = 0
    while k / rate < d - 0.1:
        for j in range(4): c = step(0.6 + 0.3 * rng.random()); i = int((k / rate + j * 0.03) * SR); s[i:i + len(c)] += c[: len(s) - i]
        k += 1
    return s
def engine(d, f0=42, k=1.0):
    t = tt(d); s = sum(np.sin(2 * np.pi * f0 * h * t + h) / h for h in range(1, 7)) * (0.8 + 0.2 * np.sin(2 * np.pi * 3.1 * t)) + filt(noise(d), hi=400) * 0.4
    return (filt(s.astype(np.float32), hi=600) * adsr(len(t), 0.3, 0.5) * k).astype(np.float32)
def whistle(d=0.7):
    t = tt(d); trill = (np.sin(2 * np.pi * 28 * t) > 0) * 0.5 + 0.5
    s = np.sin(2 * np.pi * 2900 * t + 3 * np.sin(2 * np.pi * 28 * t)) * trill + filt(noise(d), lo=2500, hi=5000) * 0.2
    return (s * adsr(len(t), 0.02, 0.08) * 0.35).astype(np.float32)
def wind(d):
    t = tt(d); return (filt(noise(d), lo=150, hi=900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t) ** 2) * adsr(len(t), 0.8, 1.0) * 0.6).astype(np.float32)

# M1 night sea + breach (0-4.7)
place(sfx, waves(4.9, 1.0), 0.0, 0.55)
place(sfx, splash(1.4, 1.6), 0.0, 0.6); place(sfx, whoosh(0.6), 0.0, 0.4)
place(sfx, creak(0.9, 90), 0.35, 0.5); place(sfx, horn(1.8), 0.9, 0.35); place(sfx, creak(0.7, 70), 3.1, 0.3)
# M2 planning room (4.7-11.8)
place(sfx, whoosh(0.45), 4.55, 0.35)
place(sfx, crackle(7.1), 4.7, 0.18)
place(sfx, scrape(1.4, 2500), F(152), 0.5); place(sfx, puff(0.5), 5.9, 0.35)
for k in range(3): place(sfx, creak(0.5, 160), 7.45 + k * 0.78, 0.25)
place(sfx, puff(0.5), 9.7, 0.3)
place(sfx, clack(700), F(330), 0.55); place(sfx, clack(950), F(338), 0.4); place(sfx, clack(1200), F(343), 0.25)
# M3 cold room (11.8-16.25)
place(sfx, whoosh(0.45), 11.65, 0.35)
place(sfx, hum(4.5, 50, 1.0), 11.8, 0.12)
for k in range(9): place(sfx, step(0.8), F(356) + k * 0.46, 0.35)
place(sfx, rustle(0.6), 14.25, 0.35)
for fr, f0 in [(437, 280), (452, 340), (467, 400)]: place(sfx, pof(f0), F(fr) - 0.03, 0.6)
# M4 desk (16.25-24.85)
place(sfx, whoosh(0.45), 16.1, 0.3)
place(sfx, click(1500, 0.06), F(494), 0.7); place(sfx, hum(8.3, 100, 0.4), F(494), 0.06)
place(sfx, rustle(0.5), 18.3, 0.35); place(sfx, hop(), F(596), 0.35)
place(sfx, rustle(0.35), 20.15, 0.3); place(sfx, hop(), F(624), 0.35)
place(sfx, click(1800, 0.06), F(640), 0.6); place(sfx, ting(), F(655), 0.35); place(sfx, rustle(0.3), 22.1, 0.25); place(sfx, hop(), F(676), 0.3)
place(sfx, hmm(), 23.25, 0.45); place(sfx, hop(), F(726), 0.4)
# M5 briefcase (24.85-29.78)
place(sfx, whoosh(0.45), 24.7, 0.3)
place(sfx, chain(0.8), F(748), 0.45); place(sfx, click(2600, 0.05), F(776), 0.9); place(sfx, click(1900, 0.05), F(776) + 0.03, 0.6)
place(sfx, creak(0.6, 110), F(825), 0.35); place(sfx, shimmer(0.8), F(846), 0.35)
place(sfx, dit(), F(868), 0.5); place(sfx, dit(), F(873), 0.45)
# M1 release (29.78-32.55)
place(sfx, whoosh(0.45), 29.62, 0.3); place(sfx, waves(2.95, 0.9), 29.7, 0.5)
place(sfx, creak(0.8, 80), 30.1, 0.3); place(sfx, scrape(1.2, 1500), 30.0, 0.25); place(sfx, plop(), F(948), 0.7); place(sfx, splash(0.6, 0.5), F(948), 0.3)
# M6 dawn shore (32.55-34.15)
place(sfx, waves(1.8, 0.5), 32.45, 0.4)
for k, tg in enumerate([32.6, 33.3, 33.8]): place(sfx, gull(0.4 + 0.1 * k), tg, 0.22)
place(sfx, rustle(0.7), 32.6, 0.25); place(sfx, huh(), F(996), 0.4)
# M7 enemy HQ (34.15-37.0)
place(sfx, whoosh(0.45), 34.0, 0.3)
place(sfx, typewriter(2.8), 34.15, 0.16)
place(sfx, whoosh(0.3), F(1036), 0.3); place(sfx, whoosh(0.3), F(1054), 0.3)
place(sfx, zoom(), 35.72, 0.3); place(sfx, thud(), F(1100), 0.75); place(sfx, chain(0.25) * 0.4, F(1101), 0.4)
# M8 map + march (37.0-38.73)
for k in range(4): place(sfx, scrape(0.4, 3000), 37.05 + k * 0.22, 0.25)
place(sfx, boots(1.1), 37.65, 0.35); place(sfx, engine(1.4, 38, 0.8), 37.5, 0.25)
# M9 landing (38.73-41.75)
place(sfx, whoosh(0.45), 38.6, 0.3)
place(sfx, engine(3.1, 32, 1.0), 38.7, 0.12); place(sfx, waves(3.1, 0.8), 38.7, 0.22)
place(sfx, whistle(0.6), F(1218), 0.2); place(sfx, whistle(0.4), F(1218) + 0.75, 0.16)
# M10 hill (41.75-end)
place(sfx, whoosh(0.5), 41.6, 0.25)
place(sfx, wind(DUR - 41.7), 41.7, 0.35)
for tg in (42.2, 43.6, 44.9): place(sfx, gull(0.45), tg, 0.14)
place(sfx, rustle(1.0) * 0.6, 42.6, 0.25); place(sfx, rustle(1.0) * 0.6, 44.2, 0.2)

# ---------------- mix ----------------
voice = load_voice()
def movavg(x, n):   # centred moving average in O(N) (np.convolve with long windows is O(N*n))
    c = np.concatenate([[0.0], np.cumsum(x, dtype=np.float64)]); h = n // 2
    i0 = np.clip(np.arange(len(x)) - h, 0, len(x)); i1 = np.clip(np.arange(len(x)) - h + n, 0, len(x))
    return ((c[i1] - c[i0]) / n).astype(np.float32)
ve = np.sqrt(movavg(voice ** 2, int(0.03 * SR)))
speech = (ve > 0.02).astype(np.float32)
speech = movavg(speech, int(0.25 * SR)) > 0.01
env = movavg(speech.astype(np.float32), int(0.12 * SR))   # 0..1 talking envelope
def rms(x, m=None): x = x if m is None else x[m]; return float(np.sqrt(np.mean(x ** 2)) + 1e-9)
v_rms = rms(voice, speech)
duck = 1 - 0.45 * env                                    # about -5 dB under speech
m_rms = rms(music * duck, speech)
music *= (v_rms * 10 ** (-21 / 20)) / m_rms               # ducked music ~21 dB below the speech
s_rms = rms(sfx, speech)
sfx *= (v_rms * 10 ** (-17 / 20)) / s_rms * (1 - 0.35 * env)   # effects present but always under the voice
mix = voice + music * duck + sfx
print("music under speech: %.1f dB, sfx under speech: %.1f dB" % (20 * np.log10(rms(music * duck, speech) / v_rms), 20 * np.log10(rms(sfx, speech) / v_rms)))
peak = np.max(np.abs(mix)); mix = mix / max(1.0, peak / 0.95)
f_ = int(0.03 * SR); mix[-f_:] *= np.linspace(1, 0, f_)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
for name, sig in (("music_only.wav", music * duck), ("sfx_only.wav", sfx)):
    with wave.open(name, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(sig, -1, 1) * 32767).astype(np.int16).tobytes())
print("ok", len(pcm) / SR)
