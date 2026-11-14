"""Hackfleisch short: synthesized escape-thriller music bed + SFX, mixed UNDER the user's voice.mp3.
Music sits ~20 dB under the speech and ducks further while she speaks. Writes mix_raw.wav (stereo 48 kHz).
Cue sheet follows web/story.js (frames @30 fps) and work/phrases.json."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1497
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30.0

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
def env(d, a=0.005, r=0.2, hold=0.0):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)); e = e * np.where(t < a + hold, 1, np.exp(-(t - a - hold) / r)); return e.astype(np.float32)
def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR); sig = np.asarray(sig, np.float32)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * g
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def osc(f, d, kind='saw', n=10):
    t = tt(d); ph = 2 * np.pi * f * t
    if kind == 'sine': return np.sin(ph).astype(np.float32)
    if kind == 'square': return sum(np.sin((2 * k + 1) * ph) / (2 * k + 1) for k in range(n)).astype(np.float32)
    return sum(np.sin((k + 1) * ph) / (k + 1) for k in range(n)).astype(np.float32)
def reverb(x, rt=1.2, mix=0.25, pre=0.02):
    n = int(rt * SR); t = np.arange(n) / SR; ir = (rng.standard_normal(n) * np.exp(-t * 6.9 / rt)).astype(np.float32); ir = filt(ir, hi=5000); ir[: int(pre * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n; L = 1 << (m - 1).bit_length(); y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    return (x * (1 - mix) + y.astype(np.float32) * mix * 2.2).astype(np.float32)

# ======================= MUSIC (D minor, 114 BPM) =======================
BPM = 114; B = 60 / BPM; S16 = B / 4
mus = np.zeros(N, np.float32)
def bass(m, d, cut=600): return filt(osc(midi(m), d, 'saw', 12) * env(d, 0.004, d * 0.6), hi=cut) * 0.9
def pad(ms, d, cut=1400):
    x = sum(osc(midi(m) * (1 + 0.003 * k), d, 'saw', 8) for k, m in enumerate(ms)) / len(ms); t = tt(d)
    return filt(x * (np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.5).clip(0)).astype(np.float32), hi=cut) * 0.5
def strings(m, d, cut=2400, trem=0):
    t = tt(d); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t); ph = 2 * np.pi * midi(m) * np.cumsum(vib) / SR
    x = sum(np.sin((k + 1) * ph) / (k + 1) ** 1.1 for k in range(8)); a = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.08).clip(0)
    if trem: a = a * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * trem * t)))
    return filt((x * a).astype(np.float32), hi=cut) * 0.35
def pluck(m, d=0.3, bright=0.55):
    t = tt(d); s = sum((bright ** k) * np.sin(2 * np.pi * midi(m) * (k + 1) * t) / (k + 1) for k in range(6)); return (s * np.exp(-t / (d * 0.3))).astype(np.float32)
def celesta(m, d=0.8):
    t = tt(d); s = np.sin(2 * np.pi * midi(m) * t) + 0.3 * np.sin(2 * np.pi * midi(m) * 4.01 * t) * np.exp(-t * 8); return (s * np.exp(-t * 3) * np.minimum(1, t / 0.003)).astype(np.float32)
def kick(a=1.0): t = tt(0.35); f = 45 + 110 * np.exp(-t * 32); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * a).astype(np.float32)
def hat(d=0.05): return filt(noise(d), lo=7000) * env(d, 0.001, d * 0.3) * 0.5
def clank(f0=380, d=0.5):
    t = tt(d); s = sum(np.sin(2 * np.pi * f0 * r * t + k) * np.exp(-t * (6 + 3 * k)) / (k + 1) for k, r in enumerate([1, 2.76, 5.4, 8.93, 13.3])); return (s * 0.5).astype(np.float32)
def tom(f0=90, d=0.5): t = tt(d); f = f0 * (1 + 0.5 * np.exp(-t * 20)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + filt(noise(d), hi=800) * np.exp(-t * 20) * 0.3).astype(np.float32)
def brass(ms, d, cut=1600):
    t = tt(d); x = np.zeros(len(t))
    for m in ms: ph = 2 * np.pi * midi(m) * t + 0.002 * np.sin(2 * np.pi * 5 * t); x += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.2 for k in range(9))
    return filt((x * np.minimum(1, t / 0.04) * np.exp(-t / (d * 0.7)) / len(ms)).astype(np.float32), hi=cut)
def boom(d=1.6): t = tt(d); return (np.sin(2 * np.pi * (38 + 40 * np.exp(-t * 6)) * t) * np.exp(-t * 2.2) * 1.2 + filt(noise(d), hi=500) * np.exp(-t * 5) * 0.6).astype(np.float32)
def riser(d, f0=200, f1=2400): t = tt(d); f = f0 * (f1 / f0) ** (t / d); return (filt(noise(d), lo=300) * (t / d) ** 2 * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * 0.2).astype(np.float32)
# A: hook — tense tick, silence when she is caught, hard hit on the whip pan
for k in range(int(0.8 / (B / 2)) + 1): place(mus, clank(2400, 0.06) * 0.6, k * B / 2, 0.5)
place(mus, pad([38, 45], 0.85, 500), 0.0, 0.5)
place(mus, riser(0.35, 300, 3000), F(40), 0.6); place(mus, boom(1.8), F(50), 1.0)
# B: dark pulse (2-5)
t0 = F(55); tb = t0
while tb < 10.1:
    for s in range(8):
        tq = tb + s * B / 2
        if tq >= 10.1: break
        place(mus, bass(38 if (int((tb - t0) / (4 * B)) % 2 == 0) else 41, B / 2 * 0.95), tq, 0.55)
    tb += 4 * B
place(mus, pad([50, 53, 57], 5.0, 900), 2.1, 0.35); place(mus, pad([46, 50, 53], 5.0, 900), 7.0, 0.35)
for k in range(int((10.1 - 4.9) / S16)): place(mus, pluck([62, 65, 69, 65][k % 4], 0.18, 0.5), 4.9 + k * S16, 0.18)
for k in range(int((10.1 - 2.1) / B)): place(mus, kick(0.6), 2.1 + k * B, 0.35); place(mus, clank(520, 0.3), 2.1 + k * B + B / 2, 0.07 if k % 2 else 0)
for tq, m in [(7.85, 77), (8.25, 76), (8.65, 74), (9.1, 81), (9.55, 77)]: place(mus, celesta(m, 0.9), tq, 0.22)   # sly "romantic" line
place(mus, strings(69, 2.0, 2000), 8.0, 0.2)
# C: smuggling motif (6-8), accelerating, stabs on Sägeblätter / Meißel / Bohrer
tb = 10.3; k = 0
while tb < 17.7:
    sub = S16 if tb > 12.0 else B / 2
    place(mus, pluck([50, 53, 55, 57, 60, 57, 55, 53][k % 8] + 12, 0.16, 0.6), tb, 0.22); place(mus, bass(38, sub * 0.9, 500), tb, 0.35 if k % 2 == 0 else 0.15)
    if k % 4 == 0: place(mus, kick(0.7), tb, 0.4)
    if k % 2 == 1: place(mus, hat(), tb, 0.25)
    tb += sub; k += 1
for tq in [11.75, 12.48, 13.0]: place(mus, brass([50, 57, 62], 0.35), tq, 0.35); place(mus, clank(300, 0.4), tq, 0.25)
place(mus, strings(62, 3.6, 2200, trem=8), 14.0, 0.2)
# D: metallic rising tension (9-10), three hits on the three cuts
tb = 18.0; k = 0
while tb < 24.5:
    rr = (tb - 18) / 6.5
    place(mus, clank(300 + (k % 4) * 90, 0.25), tb, 0.12 + 0.12 * rr); place(mus, bass(38, S16 * 0.9, 400 + 900 * rr), tb, 0.28)
    if k % 4 == 0: place(mus, kick(0.8), tb, 0.45)
    if k % 2: place(mus, hat(0.04), tb, 0.2 + 0.2 * rr)
    tb += S16; k += 1
place(mus, riser(2.6, 150, 2000), 18.2, 0.35); place(mus, strings(57, 6.0, 2600, trem=10), 18.0, 0.18)
for tq in [F(627), F(663), F(704)]: place(mus, boom(0.9), tq, 0.75); place(mus, clank(220, 0.6), tq, 0.4)
# E: almost silent (11-12), low drone
t = tt(5.4); dr = (np.sin(2 * np.pi * 36.7 * t) + 0.4 * np.sin(2 * np.pi * 55 * t)) * np.minimum(1, t / 0.6) * np.minimum(1, (5.4 - t) / 0.6)
place(mus, dr.astype(np.float32) + filt(noise(5.4), hi=300) * 0.15, 24.6, 0.35)
# F: alarm-like rising strings (13-14) + ironic motif on the note
for k, m in enumerate([62, 63, 64, 65]): place(mus, strings(m, 1.2, 2800, trem=12), 30.0 + k * 0.9, 0.28)
place(mus, riser(3.2, 300, 1800), 30.2, 0.25)
for tq, m in [(33.35, 72), (33.6, 71), (33.85, 70), (34.15, 62)]: place(mus, pluck(m, 0.25, 0.7), tq, 0.4)
# G: anticipation, then panic heartbeat rhythm, dead stop on the ellipsis
for k in range(4): place(mus, pluck(38, 0.6, 0.3), 34.75 + k * B * 2, 0.3)
tb = 36.75; ivl = 0.5
while tb < 39.27:
    place(mus, kick(0.9), tb, 0.5); place(mus, kick(0.6), tb + 0.13, 0.35); place(mus, clank(700, 0.15), tb + ivl / 2, 0.08); tb += ivl; ivl = max(0.2, ivl * 0.88)
place(mus, strings(62, 2.5, 3000, trem=14), 36.8, 0.22)
STOP = 39.27
# H: manhunt theme (18)
for k in range(int(1.3 / S16)):
    tq = 40.88 + k * S16; place(mus, tom(90 if k % 4 else 70, 0.4), tq, 0.4 if k % 2 == 0 else 0.25); place(mus, bass([38, 38, 41, 43][(k // 4) % 4], S16 * 0.9, 900), tq, 0.4)
place(mus, brass([50, 57, 62, 65], 1.2), 40.9, 0.4); place(mus, boom(1.2), 40.9, 0.6)
# I: music thins to one calm long note (19)
t = tt(3.4); calm = strings(57, 3.4, 1400) * (np.minimum(1, t / 0.6) * np.minimum(1, (3.4 - t) / 1.4).clip(0)).astype(np.float32); place(mus, calm, 42.2, 0.55)
place(mus, pad([45, 50], 3.4, 600), 42.2, 0.2)
# J: ironic tiptoe question + short witty final chord (20)
for tq, m in [(45.45, 62), (45.75, 65), (46.05, 62), (46.35, 69), (46.65, 67), (46.95, 65)]: place(mus, pluck(m, 0.22, 0.7), tq, 0.3)
place(mus, brass([50, 53, 57], 0.32, 1200), 49.3, 0.45); place(mus, brass([49, 52, 56], 0.6, 1000), 49.48, 0.4); place(mus, celesta(86, 0.5), 49.45, 0.15)
def mute(a, b):
    i, j = int(a * SR), int(b * SR); r = int(0.02 * SR); mus[i:j] = 0; mus[i - r:i] *= np.linspace(1, 0, r)
mute(F(24), F(45)); mute(STOP, 40.86)
mus = reverb(mus, 1.4, 0.22)

# ======================= SFX =======================
sfx = np.zeros(N, np.float32)
def whoosh(d=0.5, hi=1800): t = tt(d); return (filt(noise(d), lo=200, hi=hi) * np.sin(np.pi * t / d) ** 2 * 0.7).astype(np.float32)
def hum(d, f0=60, k=0.3): t = tt(d); return ((np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 2 * t) + 0.25 * np.sin(2 * np.pi * f0 * 3 * t)) * k * (1 + 0.1 * np.sin(2 * np.pi * 0.7 * t)) + filt(noise(d), hi=400) * 0.15).astype(np.float32)
def crunch(d=0.25):
    x = filt(noise(d), lo=1500, hi=9000) * env(d, 0.002, 0.06); n = len(x); cl = ((rng.random(n) < 0.004) * rng.standard_normal(n) * 3).astype(np.float32); return (x + filt(cl, lo=2000) * env(d, 0.001, 0.1)).astype(np.float32)
def rustle(d=0.6): t = tt(d); am = np.abs(filt(noise(d), hi=25)) * 3; return (filt(noise(d), lo=1500, hi=7000) * am * np.sin(np.pi * t / d) * 0.6).astype(np.float32)
def breath(d, rate=2.6, k=1.0): t = tt(d); am = np.maximum(0, np.sin(2 * np.pi * rate * t)) ** 2; return (filt(noise(d), lo=400, hi=3000) * am * 0.5 * k).astype(np.float32)
def tick(): return clank(3200, 0.04) * 0.6
def sawmetal(d, rate=3.0): t = tt(d); st = np.abs(np.sin(np.pi * rate * t)); return (filt(noise(d), lo=1800, hi=7000) * st + sum(np.sin(2 * np.pi * f * t) for f in [2350, 3120, 4410]) * 0.05 * st).astype(np.float32)
def crackle(d, dens=0.002): n = int(d * SR); x = ((rng.random(n) < dens) * rng.standard_normal(n)).astype(np.float32); return filt(x, lo=2500) * 2.5
def bark():
    d = 0.22; t = tt(d); f = 420 * (1 - 0.4 * t / d); s = filt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)).astype(np.float32), lo=300, hi=2500) * env(d, 0.01, 0.08)
    return (s + filt(noise(d), lo=500, hi=3000) * env(d, 0.005, 0.05) * 0.5).astype(np.float32)
def wind(d): t = tt(d); return (filt(noise(d), lo=80, hi=700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t) ** 2) * 0.5).astype(np.float32)
def step(): return (tom(110, 0.15) * 0.5 + filt(noise(0.15), lo=600, hi=4000) * env(0.15, 0.002, 0.03) * 0.4).astype(np.float32)
def sewing(d): t = tt(d); cl = filt(((np.sin(2 * np.pi * 19 * t) > 0.95) * 1.0).astype(np.float32), lo=1200, hi=6000) * 1.5; return (cl + hum(d, 95, 0.12)).astype(np.float32)
def buzz(d): t = tt(d); return (np.sign(np.sin(2 * np.pi * 120 * t)) * 0.05 + np.sin(2 * np.pi * 240 * t) * 0.03).astype(np.float32)
def tape(): t = tt(0.45); return (filt(noise(0.45), lo=1500, hi=8000) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 30 * t))) * env(0.45, 0.01, 0.3)).astype(np.float32)
def beep(): return (osc(1850, 0.12, 'sine') * env(0.12, 0.003, 0.1, 0.06)).astype(np.float32)
def zipper(): t = tt(0.4); r = 40 + 120 * t; x = (np.sin(2 * np.pi * np.cumsum(r) / SR) > 0.97).astype(np.float32); return filt(x, lo=2000) * 1.5
def drip(): t = tt(0.12); f = 900 + 1800 * t / 0.12; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.12, 0.002, 0.03)).astype(np.float32)
def hiss(d): t = tt(d); return (filt(noise(d), lo=3000) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.3).clip(0) * 0.35).astype(np.float32)
def crawl(d): t = tt(d); am = np.abs(np.sin(np.pi * 1.6 * t)); return (filt(noise(d), lo=150, hi=1800) * am * 0.6 + clank(160, d) * 0.05).astype(np.float32)
def scrape(d): t = tt(d); am = 0.5 + 0.5 * np.abs(filt(noise(d), hi=18)) * 4; return (filt(noise(d), lo=200, hi=2200) * am * np.sin(np.pi * t / d) * 0.7 + np.sin(2 * np.pi * 70 * t) * 0.15).astype(np.float32)
def crickets(d):
    t = tt(d); a = (np.sin(2 * np.pi * 4.3 * t) > 0.3) * (np.sin(2 * np.pi * 38 * t) > 0); b = (np.sin(2 * np.pi * 3.1 * t + 1) > 0.5) * (np.sin(2 * np.pi * 33 * t) > 0)
    return (np.sin(2 * np.pi * 4600 * t) * a * 0.12 + np.sin(2 * np.pi * 5200 * t) * b * 0.08).astype(np.float32)
def gasp(): t = tt(0.4); return (filt(noise(0.4), lo=600, hi=3500) * np.minimum(1, t / 0.05) * np.exp(-t * 5) * 0.8).astype(np.float32)
def siren(d):
    t = tt(d); f = 650 + 260 * np.sin(2 * np.pi * 0.9 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return filt(((np.sign(np.sin(ph)) * 0.3 + np.sin(ph) * 0.4) * np.minimum(1, t / 0.4)).astype(np.float32), hi=3500)
def heartbeat(t0, d, b0=1.6, b1=3.2):
    t = t0
    while t < t0 + d:
        r = b0 + (b1 - b0) * (t - t0) / d; place(sfx, kick(0.9) * 0.8, t, 0.5); place(sfx, kick(0.6) * 0.6, t + 0.16, 0.35); t += 1 / r
def engine(d, rpm=1.0):
    t = tt(d); f = 42 * rpm * (1 + 0.05 * np.sin(2 * np.pi * 0.8 * t)); return filt((np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + np.sign(np.sin(2 * np.pi * np.cumsum(f * 2) / SR)) * 0.15).astype(np.float32), hi=500)
def screech(): t = tt(0.7); f = 1500 + 300 * np.sin(2 * np.pi * 7 * t); return (filt(noise(0.7), lo=900, hi=3500) * env(0.7, 0.03, 0.3) * 0.7 + np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.7, 0.03, 0.3) * 0.15).astype(np.float32)
def slide_door(): t = tt(1.0); return (hum(1.0, 110, 0.15) * np.sin(np.pi * t) + filt(noise(1.0), lo=300, hi=2000) * np.sin(np.pi * t) * 0.3).astype(np.float32)
def heli(d): t = tt(d); am = 0.4 + 0.6 * np.maximum(0, np.sin(2 * np.pi * 11 * t)) ** 4; return (filt(noise(d), hi=600) * am + np.sin(2 * np.pi * 1900 * t) * 0.02).astype(np.float32)
def radio(d): return (filt(noise(d), lo=800, hi=3500) * 0.25 * (0.4 + 0.6 * (np.abs(filt(noise(d), hi=8)) > 0.05))).astype(np.float32)
def bird(): t = tt(0.25); f = 3200 + 1600 * np.sin(2 * np.pi * 9 * t); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.25, 0.01, 0.08) * 0.4).astype(np.float32)
def slam(): return (clank(140, 1.2) * 1.4 + np.pad(tom(60, 0.6), (0, int(0.6 * SR))) * 0.8).astype(np.float32)
def clack(): c = clank(900, 0.25) * 0.6; c[:int(0.06 * SR)] += filt(noise(0.06), lo=1000) * env(0.06, 0.001, 0.02); return c
def sigh(): t = tt(1.0); return (filt(noise(1.0), lo=300, hi=2200) * np.sin(np.pi * t) ** 1.5 * 0.9 + np.sin(2 * np.pi * np.cumsum(140 - 30 * t) / SR) * np.sin(np.pi * t) ** 2 * 0.08).astype(np.float32)
# 1 kitchen hook: fridge hum, frozen crunch, paper rustle, fast breathing; clock ticks in the frozen silence; whip whoosh
place(sfx, hum(1.75, 55, 0.25), 0.0, 0.35)
for tq in [F(3), F(12), F(17)]: place(sfx, crunch(0.3), tq, 0.55)
place(sfx, rustle(0.6), 0.05, 0.25); place(sfx, breath(F(24), 3.2), 0.0, 0.4)
for k in range(3): place(sfx, tick(), F(26) + k * 0.5, 0.25)
place(sfx, whoosh(0.32, 2500), F(45), 0.9)
# 1b sparks: saw on steel + crackle
place(sfx, sawmetal(0.65, 4), F(53), 0.45); place(sfx, crackle(0.6, 0.003), F(53), 0.35)
# 2 prison: wind, searchlight hum, distant dog
place(sfx, wind(1.3), F(68), 0.4); place(sfx, hum(1.2, 100, 0.15), F(71), 0.25); place(sfx, bark(), F(92), 0.18); place(sfx, bark(), F(98), 0.14); place(sfx, whoosh(0.5, 1200), F(78), 0.35)
# 3 cells: iron door, echoing steps
place(sfx, reverb(slam() * 0.6, 1.6, 0.4), F(107), 0.3)
for k in range(4): place(sfx, reverb(step(), 1.2, 0.5), F(112) + k * 0.36, 0.12)
# 4-5 workshop: sewing machine, fluorescent buzz
place(sfx, sewing(5.3), F(146), 0.22); place(sfx, buzz(5.3), F(146), 0.25); place(sfx, rustle(0.5), F(236), 0.3)
# 6 kitchen + the three tool hits
place(sfx, rustle(0.9), F(309), 0.35); place(sfx, tape(), F(322), 0.45); place(sfx, hum(1.4, 55, 0.2), F(307), 0.3)
place(sfx, crunch(0.35), F(355), 0.8); place(sfx, crunch(0.3), F(377), 0.8); place(sfx, crunch(0.3), F(394), 0.7)
place(sfx, filt(osc(320, 0.6, 'saw', 6), hi=2500) * env(0.6, 0.01, 0.3) * 0.35, F(392), 0.5)
for tq in [F(350), F(373), F(389)]: place(sfx, whoosh(0.18, 3000), tq, 0.5)
# 7 checkpoint: zipper, detector beeps, steps
place(sfx, zipper(), F(412), 0.4); place(sfx, buzz(1.7), F(411), 0.2)
for k in range(5): place(sfx, beep(), F(427) + k * 0.24, 0.3)
for k in range(4): place(sfx, step(), F(414) + k * 0.42, 0.18)
# 8 guard in the corridor
for k in range(7): place(sfx, reverb(step(), 1.0, 0.45), F(466) + k * 0.33, 0.25)
place(sfx, rustle(0.4), F(519), 0.35)
# 9 night sawing, falling metal bits, approaching steps, sudden silence at the freeze
place(sfx, sawmetal(F(572 - 538), 2.6), F(538), 0.4); place(sfx, crackle(F(572 - 538), 0.002), F(538), 0.25)
for tq in [F(552), F(560)]: place(sfx, clank(1400, 0.4), tq, 0.15)
for k in range(5): place(sfx, reverb(step(), 1.0, 0.5), F(556) + k * 0.36, 0.1 + 0.03 * k)
place(sfx, sawmetal(F(626 - 616), 2.6), F(616), 0.35)
# 10 labyrinth: drips, steam hiss, crawling in metal
place(sfx, crawl(1.2), F(627), 0.35); place(sfx, hiss(1.0), F(630), 0.18)
for k in range(5): place(sfx, drip(), F(629) + k * 0.28, 0.25)
place(sfx, reverb(crawl(1.3), 1.0, 0.5), F(663), 0.4); place(sfx, reverb(clank(180, 0.8), 1.0, 0.5), F(670), 0.18)
place(sfx, crawl(1.2), F(704), 0.3); place(sfx, filt(noise(1.2), hi=200) * 0.4, F(704), 0.3)
# 11-12 manhole: heavy lid scrape, crickets, wind
place(sfx, crickets(5.3), F(741), 0.3)
place(sfx, scrape(0.7), F(749), 0.6); place(sfx, clank(260, 0.5), F(767), 0.25); place(sfx, scrape(0.6), F(798), 0.55); place(sfx, clank(200, 0.6), F(817), 0.35)
place(sfx, wind(2.6), F(821), 0.3)
# 13-14 morning: blanket, gasp, alarm siren
place(sfx, whoosh(0.45, 1500) + rustle(0.45), F(903), 0.6); place(sfx, gasp(), F(914), 0.45)
place(sfx, reverb(siren(2.6), 1.2, 0.4), F(964), 0.22)
# 15-17 waiting, panic (breath, heartbeat, engine, tyres), hospital door, rain
place(sfx, crickets(2.0), F(1040), 0.3); place(sfx, wind(2.0), F(1040), 0.25)
place(sfx, engine(4.2, 1.0), F(1100), 0.25); place(sfx, breath(1.4, 4.0, 1.2), F(1100), 0.45); heartbeat(F(1100), 1.35, 2.2, 3.4)
place(sfx, screech(), F(1150), 0.25); place(sfx, filt(noise(2.8), lo=1500, hi=6000) * 0.05, F(1142), 1.0)
place(sfx, slide_door(), F(1202), 0.4)
# 18 manhunt: rotor, dogs, radio, steps
place(sfx, heli(1.4), F(1224), 0.55); place(sfx, bark(), F(1236), 0.35); place(sfx, bark(), F(1242), 0.3); place(sfx, radio(0.5), F(1246), 0.4)
for k in range(3): place(sfx, step(), F(1230) + k * 0.3, 0.15)
# 19 respectful dawn: birds, light wind, muffled distant siren
place(sfx, wind(3.2), F(1264), 0.25)
for tq in [42.4, 43.1, 43.9, 44.6]: place(sfx, bird(), tq, 0.2)
place(sfx, filt(siren(3.0), hi=500) * 0.6, F(1270), 0.12)
# 20 final: door slam, tray, deep sigh
place(sfx, reverb(slam(), 1.6, 0.4), F(1360 + 19), 0.55)
place(sfx, clack(), F(1414 + 8), 0.5)
place(sfx, sigh(), 49.2, 0.38)
# soft whooshes on the cuts (gentler into 19)
for f_ in [107, 146, 231, 411, 463, 538, 741, 821, 900, 964, 1040, 1100, 1142, 1226, 1360, 1414]: place(sfx, whoosh(0.35, 1400), F(f_) - 0.17, 0.28)
place(sfx, whoosh(0.8, 800), F(1264) - 0.4, 0.12)

# ======================= MIX =======================
voice = load_voice()
k = int(0.06 * SR); ve = np.convolve(np.abs(voice), np.ones(k) / k, 'same')
act = np.clip(ve / (np.percentile(ve[ve > 1e-4], 70) + 1e-9), 0, 1)
k2 = int(0.15 * SR); act = np.convolve(act, np.ones(k2) / k2, 'same')
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x.astype(np.float64) ** 2)) + 1e-12)
sp = act > 0.5; v_db = rms_db(voice[sp])
m_db = rms_db(mus[sp]); mg = 10 ** ((v_db - 17.3 - m_db) / 20)       # before ducking: -16 dB; ducking adds ~ -5 dB -> ~ -21 dB under speech
duck = 1 - 0.45 * act
music = mus * mg * duck
s_db = rms_db(sfx[np.abs(sfx) > 1e-5]); sg = 10 ** ((v_db - 13 - s_db) / 20)
sfx_d = sfx * sg * (1 - 0.35 * act)
mix = voice + music + sfx_d
pk = np.max(np.abs(mix)); mix = mix / max(1.0, pk / 0.97)
fd = int(0.05 * SR); mix[-fd:] *= np.linspace(1, 0, fd)
st = np.stack([mix, mix], 1)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", round(len(pcm) / SR, 2), "s | music under speech:", round(rms_db(music[sp]) - rms_db(voice[sp]), 1), "dB | sfx under speech:", round(rms_db(sfx_d[sp]) - rms_db(voice[sp]), 1), "dB")
