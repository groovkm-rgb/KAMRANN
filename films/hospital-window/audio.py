"""Light music bed (soft piano + strings, ~84 BPM) + SFX for "Das Fenster", mixed UNDER the user's voice.mp3.
Music sits ~21 dB below the speech (measured on speech-active samples) and is ducked further while the voice talks.
No voice is generated here: the only speech is voice.mp3."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1377
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda fr: fr / 30
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** order)
    if lo: g *= 1 - 1 / (1 + (f / max(lo, 1)) ** order)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def tt(d): return np.arange(int(d * SR)) / SR
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain
def fades(x, a=0.01, r=0.05):
    n = len(x); e = np.ones(n, np.float32); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return x * e

# ---------------- instruments ----------------
def piano(m, dur=2.5, vel=1.0):
    f0 = midi(m); t = tt(dur); s = np.zeros_like(t)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > 12000: break
        s += (0.9 ** k / k ** 0.7) * np.sin(2 * np.pi * fk * t + k) * np.exp(-t * (1.1 + 0.55 * k) * (f0 / 300) ** 0.35)
    s += 0.6 * np.sin(2 * np.pi * f0 * t) * np.exp(-t * 0.6)
    ham = filt(noise(0.02), 800, 4000) * np.exp(-tt(0.02) * 200) * 0.08
    s[: len(ham)] += ham
    return fades((s * vel).astype(np.float32), 0.003, 0.25)
def strings(ms, dur, att=0.8, rel=1.2, bright=2200):
    t = tt(dur); s = np.zeros_like(t)
    for m in ms:
        for det in (-0.06, 0.0, 0.07):
            f = midi(m) * 2 ** (det / 12); ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5.2 * t + det * 30) * f / 5
            saw = sum(np.sin(k * ph) / k for k in range(1, 9))
            s += saw
    e = np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    return filt((s * e / (3 * len(ms))).astype(np.float32), 120, bright, 2)
def pizz(m, vel=1.0):
    f0 = midi(m); t = tt(0.45)
    s = sum(np.sin(2 * np.pi * f0 * k * t) * (0.7 ** k) for k in range(1, 6)) * np.exp(-t * 14)
    return fades((s * vel).astype(np.float32), 0.002, 0.05)
def bell(m, dur=2.0, vel=1.0):
    f0 = midi(m); t = tt(dur)
    s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 2.2), (2.76, 0.4, 4), (5.4, 0.2, 7), (2.0, 0.3, 3)])
    return fades((s * vel).astype(np.float32), 0.002, 0.2)

music = np.zeros(N, np.float32)
BPM = 84; B = 60 / BPM
P = lambda m, t0, d=2.5, v=1.0: place(music, piano(m, d, v), t0)
S = lambda ms, t0, d, g=1.0, att=0.8, rel=1.2, br=2200: place(music, strings(ms, d, att, rel, br), t0, g)

# 1-4 (0 - 7.35): curious, sparse piano motif; tension note at "das Fenster"
mot = [76, 72, 74, 71, 76, 72, 79, 74]  # E5 C5 D5 B4 ...
for i, m in enumerate(mot * 2):
    t0 = 0.05 + i * B * 0.5
    if t0 > 6.4: break
    P(m, t0, 1.6, 0.55 if i % 2 else 0.7)
for i, (r, t0) in enumerate([(45, 0.05), (41, 1.75), (43, 3.45), (40, 5.1)]): P(r, t0, 3.0, 0.5); P(r + 7, t0 + B, 2.5, 0.3)
S([57, 64], 0.0, 6.5, 0.35, 1.5, 1.0, 1600)
S([62, 63, 68], 6.45, 1.1, 0.7, 0.25, 0.3, 2600)     # short tension cluster (4)
place(music, bell(87, 1.0, 0.25), 6.55)
# 5 trees (7.35 - 9.21): warms up, major
S([60, 64, 67, 72], 7.3, 2.1, 0.9, 0.35, 0.45, 2600)
for i, m in enumerate([60, 64, 67, 72, 76, 72, 67, 79]): P(m, 7.35 + i * B * 0.33, 1.8, 0.6)
P(48, 7.35, 3, 0.7)
# 6 wall (9.21 - 11.05): music cuts, one cold note
place(music, bell(83, 2.2, 0.35), 9.3); P(35, 9.3, 2.6, 0.35)
# 7-9 archive (11.05 - 18.82): pizzicato "detective" curiosity, "aha" at 17.94
walk = [50, 53, 57, 53, 50, 52, 53, 55, 57, 55, 53, 52, 50, 57, 50, 45]
t0 = 11.1; i = 0
while t0 < 17.85:
    place(music, pizz(walk[i % len(walk)] - 12, 0.9), t0)
    if i % 4 == 2: place(music, pizz(walk[(i + 3) % len(walk)] + 12, 0.45), t0 + B * 0.25)
    t0 += B * 0.5; i += 1
for k, tk in enumerate([12.0, 13.8, 15.5]): P([74, 77, 81][k], tk, 1.5, 0.45)
S([62, 69], 14.8, 2.9, 0.45, 1.6, 0.3, 3000)          # leaves burst: rising swell
P(62, 17.94, 3.0, 0.9); P(66, 17.94, 3.0, 0.7); P(69, 17.94, 3.0, 0.7); P(74, 17.96, 3.0, 0.6)
place(music, bell(86, 1.6, 0.45), 17.96)
# 10-11 wall room (18.82 - 27.47): minor, heavy, sparse
S([50, 57, 62], 18.9, 4.5, 0.55, 1.5, 1.5, 1300); S([46, 53, 58], 23.2, 4.4, 0.55, 1.5, 1.5, 1300)
for k, (m, tk) in enumerate([(38, 18.9), (45, 20.6), (34, 22.3), (41, 24.0), (38, 25.7)]): P(m, tk, 3.2, 0.55); P(m + 24 + (3 if k % 2 else 5), tk + B, 2.5, 0.3)
# 12-13 tree room (27.47 - 32.26): hopeful, bright
S([65, 69, 72], 27.5, 2.6, 0.75, 0.6, 0.6, 2800); S([67, 71, 74], 30.0, 2.4, 0.75, 0.6, 0.8, 2800)
arp = [65, 69, 72, 77, 72, 69, 67, 71, 74, 79, 74, 71]
for i, m in enumerate(arp): P(m, 27.5 + i * B * 0.4, 1.6, 0.55)
P(41, 27.5, 3, 0.6); P(43, 30.0, 3, 0.6)
# 14-15 (32.26 - 36.61): thins out, then an opening string swell at 15
P(60, 32.35, 2.5, 0.45); P(67, 33.6, 2.5, 0.35)
S([60, 67, 72, 76], 34.6, 2.3, 0.85, 1.9, 0.4, 3200)
# 16 (36.61 - 41.70): warmest and fullest
prog = [([48, 60, 64, 67], 36.62), ([43, 59, 62, 67], 37.9), ([45, 57, 60, 64], 39.17), ([41, 57, 60, 65], 40.45)]
for ch, tc in prog:
    S(ch[1:], tc, 1.5, 0.85, 0.25, 0.3, 3000); P(ch[0], tc, 2.2, 0.75)
    for i in range(6): P(ch[1 + i % 3] + 12, tc + i * B * 0.3, 1.4, 0.5)
# 17 (41.70 - end): one piano note, then an unresolved (sus) chord hanging like a question
P(72, 41.85, 2.5, 0.6)
P(62, 43.2, 3.5, 0.45); P(67, 43.25, 3.5, 0.4); P(69, 43.3, 3.5, 0.4); P(74, 43.35, 3.5, 0.35)
S([62, 67, 69], 43.2, DUR - 43.2, 0.4, 1.0, 0.8, 2400)

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def creak(d=0.35, f0=220):
    t = tt(d); rate = f0 * (1 + 0.4 * np.sin(2 * np.pi * 2 * t / d)); ph = np.cumsum(rate) / SR
    s = (np.mod(ph, 1) < 0.1).astype(np.float32) * np.sin(np.pi * t / d); return filt(s, 300, 3000) * 2
def spring(d=0.5):
    t = tt(d); s = np.sin(2 * np.pi * (380 + 60 * np.sin(2 * np.pi * 9 * t)) * t) * np.exp(-t * 7) * 0.5
    return (s + creak(d, 160) * 0.6).astype(np.float32)
def beep(f=1046, d=0.12): t = tt(d); return fades((np.sin(2 * np.pi * f * t) * 0.5).astype(np.float32), 0.004, 0.03)
def hum(d, lo=60, hi=400, g=1): t = tt(d); return fades((filt(noise(d), lo, hi) * 0.6 + 0.08 * np.sin(2 * np.pi * 100 * t)).astype(np.float32) * g, 0.3, 0.3)
def whoosh(d=0.5, lo=300, hi=2500, rise=False):
    t = tt(d); e = np.sin(np.pi * t / d) ** 2 if not rise else (t / d) ** 2
    return fades(filt(noise(d), lo, hi) * e * 0.7, 0.01, 0.06)
def rolling(d):
    t = tt(d); s = filt(noise(d), 80, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)) + 0.3 * filt(noise(d), 2000, 5000) * (np.mod(t * 17, 1) < 0.08)
    return fades(s.astype(np.float32), 0.05, 0.1)
def hiss(d=0.6): t = tt(d); return fades(filt(noise(d), 2500, 9000) * np.exp(-t * 3) * 0.6, 0.02, 0.1)
def rings(d=0.45):
    t = tt(d); s = np.zeros_like(t)
    for k in range(9): i0 = int(k * d / 9 * SR); tk = t[: len(t) - i0]; s[i0:] += np.sin(2 * np.pi * (2400 + 300 * (k % 3)) * tk) * np.exp(-tk * 60) * 0.3
    return (s + filt(noise(d), 1500, 6000) * 0.2 * np.sin(np.pi * t / d)).astype(np.float32)
def chirp(f0=3000):
    out = []
    for k in range(rng.integers(2, 5)):
        d = 0.06 + 0.04 * rng.random(); t = tt(d); fr = f0 * (1 + 0.5 * np.sin(np.pi * t / d)) * (1 + 0.1 * k)
        out.append(np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / d) * 0.4); out.append(np.zeros(int(0.03 * SR)))
    return np.concatenate(out).astype(np.float32)
def birds(t0, t1, dens=3.0, g=1.0):
    t = t0
    while t < t1: place(sfx, chirp(2400 + 1600 * rng.random()), t, g * (0.5 + 0.5 * rng.random())); t += rng.exponential(1 / dens)
def rustle(d, g=1): t = tt(d); return fades(filt(noise(d), 1800, 8000) * (0.35 + 0.25 * np.sin(2 * np.pi * 0.8 * t) ** 2) * g, 0.4, 0.4)
def drip():
    t = tt(0.25); f = 900 + 1400 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18) * 0.6).astype(np.float32)
def drawer(d=0.6): t = tt(d); s = filt(noise(d), 200, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t)) * np.sin(np.pi * t / d); s[-int(0.05 * SR):] += filt(noise(0.05), 100, 800) * 2; return s.astype(np.float32)
def paper(d=0.3): t = tt(d); return fades(filt(noise(d), 1200, 7000) * (rng.random(len(t)) < 0.3) * np.sin(np.pi * t / d) * 1.2, 0.005, 0.05)
def puff(d=0.5): t = tt(d); return fades(filt(noise(d), 80, 900) * np.exp(-t * 7) * 1.2, 0.005, 0.1)
def flutter(d=0.9): t = tt(d); return fades(filt(noise(d), 600, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 16 * t)) * np.exp(-t * 1.5), 0.01, 0.2)
def tick(f=2600, d=0.05): t = tt(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + filt(noise(d), 2000, 8000) * np.exp(-t * 200) * 0.5).astype(np.float32)
def potclick(): t = tt(0.12); return (np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 60) * 0.6 + filt(noise(0.12), 300, 3000) * np.exp(-t * 80) + np.sin(2 * np.pi * 220 * t) * np.exp(-t * 40) * 0.5).astype(np.float32)
def scribble(d):
    t = tt(d); env = (np.mod(t * 7.5, 1) < 0.55).astype(np.float32) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t) ** 2)
    return fades(filt(noise(d), 2500, 9000) * env * 0.5, 0.02, 0.05)
def sniff(): d = 0.35; t = tt(d); return fades(filt(noise(d), 1500, 6000) * np.sin(np.pi * t / d) ** 3 * 0.5, 0.01, 0.05)
def zipper(d=0.8): t = tt(d); rate = 60 + 40 * t / d; s = (np.mod(np.cumsum(np.full(len(t), rate)) / SR, 1) < 0.15).astype(np.float32); return fades(filt(s * (0.5 + noise(d) * 0.3), 1500, 8000) * 0.8, 0.01, 0.05)
def chime(): return (bell(84, 1.6, 0.35) + np.pad(bell(79, 1.35, 0.35), (int(0.25 * SR), int(0.1 * SR)))[: int(1.6 * SR)]).astype(np.float32)
def water(d): t = tt(d); return fades((filt(noise(d), 300, 2500) * 0.35 + filt(noise(d), 2500, 7000) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * t))).astype(np.float32), 0.3, 0.4)
def murmur(d):
    t = tt(d); s = np.zeros_like(t)
    for v in range(3):
        syl = (0.5 + 0.5 * np.sin(2 * np.pi * (3.2 + v * 0.7) * t + v)) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t + v * 2))
        s += filt(noise(d), 250 + v * 80, 900 + v * 150) * syl
    return fades(s * 0.4, 0.4, 0.4)
def squeak(d=0.25): t = tt(d); f = 1800 + 400 * np.sin(np.pi * t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.15).astype(np.float32)
def buzz(d=0.45):
    t = tt(d); g = (np.mod(t, 0.22) < 0.15).astype(np.float32)
    return fades(filt((np.sign(np.sin(2 * np.pi * 150 * t)) * 0.3 * g).astype(np.float32), 60, 900), 0.005, 0.02)
def ding(): return bell(91, 2.0, 0.5)

# M1 / split rooms
place(sfx, hum(7.35, g=0.5), 0.0); place(sfx, hum(4.6, g=0.5), 32.26)
place(sfx, spring(), 0.12, 0.9); place(sfx, spring(), 0.16, 0.6)
for tb in (0.6, 2.9, 4.1, 5.4, 33.0, 34.2): place(sfx, beep(), tb, 0.35)
for tb in (2.6, 3.2, 3.85): place(sfx, puff(0.3), tb, 0.35)
place(sfx, rings(0.3), 6.65, 0.3)
# M2 operating room
place(sfx, hiss(0.7), 1.0, 0.8); place(sfx, rolling(1.3), 1.0, 0.9)
# M3 trees / M4 wall
place(sfx, rings(), 7.35, 0.8); birds(7.6, 9.2, 4, 0.8); place(sfx, rustle(1.9), 7.35, 0.7)
place(sfx, rings(), 9.21, 0.7); place(sfx, hum(1.85, 40, 300, 1.2), 9.21); place(sfx, drip(), 10.3, 0.8)
# M5 archive
place(sfx, drawer(), 11.08, 0.8); place(sfx, puff(0.6), 11.55, 0.8)
for tp in (11.7, 12.1, 12.5, 13.1, 13.35, 13.6, 13.85, 14.1): place(sfx, paper(0.25), tp, 0.7)
place(sfx, whoosh(1.3, 400, 4000, rise=True), 14.8, 0.9); place(sfx, rustle(1.3, 1.2), 15.0, 0.5)
place(sfx, flutter(0.9), 17.94, 0.9)
# M6 wall room worse
for k, fr in enumerate([570, 590, 610, 630, 680, 760, 800]): place(sfx, potclick(), F(fr), 0.35 * 10 ** (k * 1.5 / 20))
for k in range(9): place(sfx, tick(2600 if k % 2 else 2100), 18.95 + k * 1.0, 0.25)
place(sfx, scribble(2.9), 21.45, 0.7)
place(sfx, sniff(), 24.55, 0.6); place(sfx, sniff(), 26.25, 0.5)
# M7 tree room recovery + exit
birds(27.5, 32.2, 3.5, 0.75); place(sfx, rustle(4.6, 0.7), 27.5)
place(sfx, zipper(0.8), 28.67, 0.8); place(sfx, chime(), 30.75, 0.55); place(sfx, hiss(0.6), 30.75, 0.5)
# M8
place(sfx, whoosh(1.6, 300, 3500), 34.75, 0.9); place(sfx, rustle(1.4, 1.2), 35.4, 0.6); birds(35.5, 36.6, 4, 0.6)
# M9 garden
place(sfx, water(5.1), 36.6, 0.55); birds(36.7, 41.6, 3, 0.6); place(sfx, murmur(5.1), 36.6, 0.18)
for tq in (39.5, 40.3, 41.1): place(sfx, squeak(), tq, 0.4)
# M10 POV
place(sfx, buzz(), 41.95, 0.6); place(sfx, buzz(), 42.45, 0.4)
place(sfx, whoosh(1.7, 200, 1500), 42.6, 0.7)
place(sfx, ding(), 44.95, 0.6)
# soft transition whooshes on the bigger cuts
for tc in (1.0, 7.35, 11.05, 18.82, 27.47, 32.26, 36.61, 41.70): place(sfx, whoosh(0.35, 500, 3000), tc - 0.2, 0.35)

# ---------------- mix ----------------
voice = load_voice()
ve = np.convolve(np.abs(voice), np.ones(int(0.06 * SR)) / int(0.06 * SR), "same")
act = ve > ve.max() * 0.06
# smooth ducking: -6 dB while the voice is active (attack 40 ms, release 300 ms)
target = np.where(act, 0.5, 1.0).astype(np.float32); duck = np.empty_like(target); g = 1.0
a_k, r_k = 1 - np.exp(-1 / (0.04 * SR)), 1 - np.exp(-1 / (0.3 * SR))
for i in range(0, N, 64):
    tg = target[i]; g += (tg - g) * (1 - (1 - (a_k if tg < g else r_k)) ** 64); duck[i:i + 64] = g
rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
vr = rms(voice[act])
md = music * duck
music_gain = vr * 10 ** (-21 / 20) / rms(md[act])
md *= music_gain
sd = sfx * (0.6 + 0.4 * duck)
sfx_gain = vr * 10 ** (-18 / 20) / max(rms(sd[np.abs(sd) > 1e-4]), 1e-9)
sd *= sfx_gain
cap = vr * 10 ** (-6 / 20) * np.where(act, 0.7, 1.0)          # SFX peaks stay >= 6 dB under the voice RMS (more while speaking)
sd = (cap * np.tanh(sd / cap)).astype(np.float32)
print(f"music under speech: {20*np.log10(rms(md[act])/vr):.1f} dB, sfx avg: {20*np.log10(rms(sd[np.abs(sd)>1e-4])/vr):.1f} dB")
mix = voice + md + sd
pk = np.max(np.abs(mix)); mix = mix / max(1.0, pk / 0.95)
fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR)
