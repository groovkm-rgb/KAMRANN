"""Der Giftkönig — synthesized music bed (ud, frame drum, ney-like flute, low strings; D Hijaz, ~100 BPM)
+ scene-synced SFX, mixed UNDER the user's voice.mp3. Music sits ~21 dB under speech and ducks wherever the voice talks."""
import numpy as np, subprocess, wave

SR = 48000
TOTAL_F = 1379
DUR = TOTAL_F / 30
N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def reverb(x, d=1.6, wet=0.35, hi=4000):
    ir = noise(d) * np.exp(-tt(d) * 6.9 / d); ir = filt(ir, 150, hi); ir /= np.sqrt((ir ** 2).sum()) + 1e-9
    n = len(x) + len(ir); y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)
    out = np.zeros(n, np.float32); out[: len(x)] += x * (1 - wet); out += y.astype(np.float32) * wet * 3; return out

# ---------------- instruments ----------------
def ud(f, d=0.6):  # plucked lute: decaying harmonics + pick noise
    t = tt(d); s = np.zeros(len(t))
    for k in range(1, 9): s += np.sin(2 * np.pi * f * k * t + k) * (0.8 ** k) * np.exp(-t * (2.5 + 1.8 * k))
    s += filt(noise(d), 1500, 6000) * np.exp(-t * 90) * 0.15
    return (s * np.minimum(1, t / 0.002)).astype(np.float32) * 0.5
def drum(kind):
    if kind == 'dum':
        t = tt(0.6); f = 62 + 40 * np.exp(-t * 25)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + filt(noise(0.6), 60, 400) * np.exp(-t * 20) * 0.4).astype(np.float32)
    if kind == 'tek':
        t = tt(0.2); return filt((noise(0.2) * np.exp(-t * 45) + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 35) * 0.5).astype(np.float32), 600, 7000)
    t = tt(1.8); f = 45 + 70 * np.exp(-t * 14)  # boom
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * 1.3 + filt(noise(1.8), 40, 900) * np.exp(-t * 5) * 0.8).astype(np.float32)
def ney(f, d, vib=5.0, breath=0.25):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / 0.4))) / SR
    s = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph) + filt(noise(d), f * 0.8, f * 3) * breath * 4
    return (s * np.minimum(1, t / 0.12) * np.clip((d - t) / 0.25, 0, 1)).astype(np.float32) * 0.35
def strings(ms, d, cut=900):
    t = tt(d); s = np.zeros(len(t))
    for m in ms:
        for det in (-0.004, 0.0, 0.005): ph = 2 * np.pi * midi(m) * (1 + det) * t; s += ((ph / np.pi) % 2 - 1)
    a = np.minimum(1, t / 0.6) * np.clip((d - t) / 0.8, 0, 1)
    return filt((s * a).astype(np.float32), 50, cut) / (3 * len(ms)) * 0.5
def cymbal(d=0.6):
    t = tt(d); return filt(noise(d), 4000, 12000) * np.exp(-t * 7) * 0.3

HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74]  # D Eb F# G A Bb C D
music = np.zeros(N, np.float32)
B = 60 / 100

# 1) hook: big frame-drum hit as the doors burst, fast sly ud theme, tension note while he drinks
place(music, drum('boom'), 0.0, 1.0)
for i, k in enumerate([0, 1, 2, 1, 4, 3, 2, 1, 0, 1, 2, 4, 5, 4, 2, 1]):
    t0 = 0.12 + i * B / 4 * 0.9
    if t0 > 1.05: break
    place(music, ud(midi(HIJAZ[k]), 0.35), t0, 0.5)
for i in range(6): place(music, drum('dum' if i % 2 == 0 else 'tek'), 0.12 + i * B / 2, 0.5)
place(music, ney(midi(HIJAZ[5] + 12), 1.2, vib=7, breath=0.35), 1.15, 0.6)
place(music, strings([50, 51], 1.4, 700), 1.1, 0.8)
# 2) the wink: one funny ud pluck
place(music, ud(midi(74), 0.7), F(89), 0.9); place(music, ud(midi(81), 0.4), F(89) + 0.09, 0.5)
# 3-4) dark and tense: low strings + heartbeat
place(music, strings([38, 50, 51], 3.9, 600), F(103), 1.1)
for i in range(4): place(music, drum('dum'), F(110) + i * B * 1.5, 0.45); place(music, drum('dum'), F(110) + i * B * 1.5 + 0.22, 0.25)
place(music, ney(midi(63), 1.6, breath=0.5), F(160), 0.35)
# 5-10) sly advancing "plan" theme
t0 = F(214); plan = [0, 0, 4, 0, 5, 4, 2, 1]; bar = 0
while t0 < F(532) - 0.05:
    for i, k in enumerate(plan):
        tb = t0 + i * B / 2
        if tb >= F(532) - 0.05: break
        place(music, ud(midi(HIJAZ[k] - 12 + (5 if bar % 4 == 2 else 0)), 0.45), tb, 0.42)
        place(music, drum('dum' if i in (0, 3, 6) else 'tek'), tb, 0.38 if i in (0, 3, 6) else 0.2)
    if bar % 2 == 1: place(music, ney(midi(HIJAZ[(bar * 3) % 7] + 12), B * 1.8, breath=0.3), t0 + 2 * B, 0.28)
    bar += 1; t0 += 4 * B
place(music, strings([38, 45], F(532) - F(214), 500), F(214), 0.5)
for k, f in enumerate([323, 357, 369]):  # three rising hits on the three quick cuts
    place(music, drum('boom'), F(f), 0.55 + 0.1 * k); place(music, ud(midi(69 + 5 * k), 0.6), F(f), 0.7)
# 11-12) boastful, playful variation
t0 = F(532)
while t0 < F(694) - 0.05:
    for i, k in enumerate([0, 2, 4, 7, 4, 2, 4, 9]):
        tb = t0 + i * B / 2
        if tb >= F(694) - 0.05: break
        place(music, ud(midi(62 + k), 0.3), tb, 0.38); place(music, drum('tek'), tb + B / 4, 0.18)
        if i % 4 == 0: place(music, drum('dum'), tb, 0.35)
    place(music, cymbal(), t0 + 2 * B, 0.5); t0 += 4 * B
# 13-17) slow, heavy, respectful; near silence at 17 with one long note
place(music, strings([38, 50, 53, 57], F(752) - F(694) + 0.6, 650), F(694), 1.0)
place(music, strings([34, 46, 50, 53], F(847) - F(752) + 0.6, 600), F(752), 0.95)
place(music, strings([36, 48, 51, 55], F(988) - F(847) + 0.4, 560), F(847), 0.9)
for m, t_, d in [(69, F(700), 2.2), (67, F(770), 2.0), (65, F(850), 2.4), (62, F(930), 2.4)]: place(music, ney(midi(m), d, vib=4.5, breath=0.4), t_, 0.32)
place(music, strings([38, 50], F(1078) - F(988) + 0.5, 420), F(988), 0.75)
# 18-20) mysterious, curious close; final echoing ud note in the tail
t0 = F(1078)
while t0 < F(1317):
    for i, k in enumerate([0, 4, 7, 4, 5, 4, 2, 1]):
        tb = t0 + i * B / 2
        if tb >= F(1317): break
        place(music, ud(midi(HIJAZ[k % 8]), 0.5), tb, 0.3)
    t0 += 4 * B
place(music, strings([38, 45, 50], F(1379) - F(1078), 700), F(1078), 0.45)
place(music, ney(midi(69), 2.0, breath=0.35), F(1190), 0.25)
music_tail = np.zeros(N, np.float32); place(music_tail, reverb(ud(midi(50), 1.8) + ud(midi(62), 1.8) * 0.5, 2.4, 0.55), 44.98, 1.0)

# ---------------- SFX ----------------
sfx = np.zeros(N, np.float32)
def pl(buf, sig, t0, g): i = int(t0 * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * g
def clink(f=2600):
    t = tt(0.7); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * (6 + 3 * i)) for i, r in enumerate([1, 1.52, 2.31, 2.9])) * 0.25).astype(np.float32)
def boom_door():
    t = tt(1.6); s = filt(noise(1.6), 30, 300) * np.exp(-t * 3) * 2 + np.sin(2 * np.pi * 48 * t) * np.exp(-t * 3.5) * 1.2
    cr = filt((np.mod(np.cumsum(90 + 40 * t) / SR, 1) < 0.1).astype(np.float32), 200, 1800) * np.exp(-t * 4) * 0.6
    return reverb((s + cr).astype(np.float32), 1.8, 0.4)
def wind(d, k=1.0):
    t = tt(d); m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t + 1) * np.sin(2 * np.pi * 0.23 * t)
    return (filt(noise(d), 200, 1800) * m * np.minimum(1, t / 0.15) * np.clip((d - t) / 0.4, 0, 1) * k).astype(np.float32)
def flap(d=0.5):
    t = tt(d); return (filt(noise(d), 300, 3000) * (np.sin(2 * np.pi * 9 * t) ** 2) * np.sin(np.pi * t / d)).astype(np.float32) * 0.7
def step():
    t = tt(0.18); return (filt(noise(0.18), 80, 1600) * np.exp(-t * 40) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30) * 0.5).astype(np.float32)
def gulp():
    t = tt(0.3); f = 220 + 400 * np.exp(-t * 12) * np.sin(np.pi * t / 0.3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.3) ** 2 * 0.6 + filt(noise(0.3), 100, 700) * np.exp(-t * 15) * 0.4).astype(np.float32)
def shriek(f0=900, d=0.55):
    t = tt(d); f = f0 * (1 + 0.25 * np.sin(np.pi * t / d)) * (1 + 0.03 * np.sin(2 * np.pi * 9 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 6)); return filt((s * np.sin(np.pi * t / d) ** 0.5 * 0.25).astype(np.float32), 500, 4500)
def tray_crash():
    t = tt(1.1); s = np.zeros(len(t), np.float32)
    for k in range(9): pl(s, clink(rng.uniform(1800, 4200)), rng.uniform(0, 0.25), rng.uniform(0.4, 1.0))
    return s + filt(noise(1.1), 800, 9000) * np.exp(-t * 9) * 0.5
def puff():
    t = tt(0.4); return (filt(noise(0.4), 200, 2500) * np.exp(-t * 10) * np.minimum(1, t / 0.01)).astype(np.float32) * 0.9
def ting():
    t = tt(1.0); return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2349, 4), (3520, 6), (4699, 9)]) * 0.3).astype(np.float32)
def roll(d):
    t = tt(d); r = (np.mod(np.cumsum(14 - 10 * t / d) / SR, 1) < 0.15).astype(np.float32)
    return (filt(r * filt(noise(d), 1500, 6000), 800, 7000) * 0.8 * np.clip((d - t) / 0.3, 0, 1)).astype(np.float32)
def crackle(d, k=1.0):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 30)): i = int(rng.integers(0, len(s) - 400)); s[i:i + 400] += filt(noise(400 / SR), 1000, 8000)[:400] * np.exp(-np.arange(400) / 60) * rng.uniform(0.2, 1)
    return s * k + filt(noise(d), 60, 400) * 0.15 * k
def whispers(d):
    t = tt(d); syl = (0.5 + 0.5 * np.sin(2 * np.pi * 5.5 * t + 3 * np.sin(2 * np.pi * 0.9 * t))) ** 3
    return (filt(noise(d), 2000, 7000) * syl * np.minimum(1, t / 0.3) * np.clip((d - t) / 0.3, 0, 1)).astype(np.float32) * 0.8
def thud():
    t = tt(0.6); return (np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 9) * 1.4 + filt(noise(0.6), 100, 1500) * np.exp(-t * 25)).astype(np.float32)
def chains(d):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * 14)): pl(s, clink(rng.uniform(3000, 5200)) * np.exp(-k / (d * 9)), k / 14 + rng.uniform(0, 0.03), 0.35)
    return s
def gull():
    t = tt(0.5); f = 1500 + 700 * np.sin(np.pi * t / 0.5) - 500 * t; ph = 2 * np.pi * np.cumsum(f) / SR
    return filt(((np.sin(ph) + 0.4 * np.sin(2 * ph)) * np.sin(np.pi * t / 0.5) ** 2 * 0.2).astype(np.float32), 800, 5000)
def waves(d):
    t = tt(d); return (filt(noise(d), 100, 1400) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.18 * t) ** 2) * np.minimum(1, t / 0.5) * np.clip((d - t) / 0.5, 0, 1)).astype(np.float32) * 0.6
def plip(f=900):
    t = tt(0.25); return (np.sin(2 * np.pi * (f + 900 * t) * t) * np.exp(-t * 22) * 0.6).astype(np.float32)
def plop():
    t = tt(0.35); return (np.sin(2 * np.pi * np.cumsum(180 + 500 * np.exp(-t * 18)) / SR) * np.exp(-t * 12) * 0.7 + filt(noise(0.35), 300, 2500) * np.exp(-t * 20) * 0.3).astype(np.float32)
def bubbling(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 9)): pl(s, plip(rng.uniform(250, 600)) * 0.5, rng.uniform(0, d - 0.3), rng.uniform(0.3, 0.8))
    return s + filt(noise(d), 80, 500) * 0.2
def grind(d):
    t = tt(d); return (filt(noise(d), 600, 4000) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.5 * t)) ** 2 * 0.35).astype(np.float32)
def whoosh(d=0.45, k=1.0):
    t = tt(d); return (filt(noise(d), 300, 3000) * np.sin(np.pi * t / d) ** 2 * 0.7 * k).astype(np.float32)
def laugh():  # unintelligible hearty laugh
    s = np.zeros(int(1.3 * SR), np.float32)
    for k in range(6):
        n = int(0.14 * SR); tk = np.arange(n) / SR; f0 = 180 - k * 6
        g = filt((np.sin(2 * np.pi * f0 * tk) * (np.mod(tk * f0, 1) < 0.5) * np.sin(np.pi * tk / 0.14)).astype(np.float32), 300, 2400) + filt(noise(0.14), 600, 1600)[:n] * np.sin(np.pi * tk / 0.14) * 0.6
        pl(s, g, k * 0.19, 0.9)
    return s
def cutlery(d):
    s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 4)): pl(s, clink(rng.uniform(3000, 6000)) * 0.4, rng.uniform(0, d - 0.7), rng.uniform(0.3, 0.8))
    return s
def candle_out():
    t = tt(0.7); return (filt(noise(0.7), 500, 6000) * np.exp(-t * 4) * np.sin(np.pi * np.minimum(1, t / 0.6)) * 0.7).astype(np.float32)
def page():
    t = tt(0.5); return (filt(noise(0.5), 1500, 9000) * np.sin(np.pi * t / 0.5) ** 3 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))).astype(np.float32) * 0.6
def murmur(d):
    t = tt(d); syl = (0.5 + 0.5 * np.sin(2 * np.pi * 3.2 * t + 2 * np.sin(2 * np.pi * 0.6 * t))) ** 2
    return (filt(noise(d), 200, 900) * syl * 0.5).astype(np.float32)
def far_drums(d):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d / 0.75)): pl(s, drum('dum') * (0.8 if k % 2 == 0 else 0.5), k * 0.75, 1)
    return filt(s, 40, 300)

# hook
place(sfx, boom_door(), 0.0, 1.0); place(sfx, wind(2.3, 1.0), 0.0, 0.7); place(sfx, flap(0.6), F(6), 0.6); place(sfx, flap(0.5), F(40), 0.4)
for f in range(10, 78, 9): place(sfx, step(), F(f), 0.55)
place(sfx, clink(2800), F(27), 0.5); place(sfx, clink(3300), F(29), 0.35)
place(sfx, gulp(), F(40), 0.7); place(sfx, gulp(), F(50), 0.6)
place(sfx, shriek(950, 0.5), F(31), 0.45); place(sfx, shriek(1150, 0.55), F(47), 0.45)
place(sfx, tray_crash(), F(44), 0.6); place(sfx, tray_crash(), F(60), 0.55)
# 2
place(sfx, whoosh(0.3), F(80), 0.5); place(sfx, puff(), F(85), 0.8); place(sfx, ting(), F(89), 0.7); place(sfx, reverb(np.concatenate([clink(1500) * 0.8, np.zeros(int(0.4 * SR), np.float32)]) + tray_crash() * 0.3, 1.8, 0.6), F(95), 0.6)
# flashback: falling goblet + rolling crown, echoing metal
place(sfx, whoosh(0.4), F(101), 0.4); place(sfx, reverb(clink(1700) + np.pad(thud(), (0, int(0.1 * SR))) * 0.3, 2.0, 0.55), F(120), 0.9)
place(sfx, roll(1.0), F(117), 0.6); place(sfx, reverb(clink(1300), 2.0, 0.6), F(139), 0.6)
# corridor
place(sfx, whoosh(0.35), F(144), 0.45); place(sfx, crackle(2.3, 0.6), F(146), 0.8); place(sfx, whispers(1.4), F(150), 0.6)
# fist
place(sfx, whoosh(0.35), F(212), 0.45); place(sfx, whoosh(0.25, 0.6), F(230), 0.5); place(sfx, thud(), F(236), 1.2); place(sfx, chains(1.0), F(237), 0.6)
# morning
place(sfx, waves(2.3), F(257), 0.8)
for f in (262, 285): place(sfx, gull(), F(f), 0.5)
place(sfx, plip(1100), F(312), 0.9)
for f, k in ((340, 1), (365, 1.2), (369, 1.4)): place(sfx, plip(900 / k), F(f), 0.9 * k)
place(sfx, reverb(ting() * 0.4, 1.5, 0.5), F(420), 0.5)
# workshop
place(sfx, bubbling(F(532) - F(444)), F(444), 0.55); place(sfx, grind(1.4), F(450), 0.5); place(sfx, clink(3900), F(447), 0.4); place(sfx, clink(4400), F(452), 0.3)
for i in range(12): place(sfx, plop(), F(494 + 2 + i * 1.6 + 12), 0.55)
place(sfx, whoosh(0.4), F(514), 0.5)
# throne boast
place(sfx, whoosh(0.4), F(530), 0.5); place(sfx, laugh(), F(562), 0.35)
# banquet
place(sfx, whoosh(0.35), F(596), 0.4); place(sfx, cutlery(3.2), F(598), 0.6); place(sfx, gulp(), F(608), 0.6); place(sfx, gulp(), F(650), 0.55); place(sfx, laugh(), F(660), 0.35)
# tent (respectful: no whooshes)
place(sfx, wind(F(988) - F(694), 0.7), F(694), 0.5); place(sfx, far_drums(F(920) - F(700)), F(700), 0.55); place(sfx, crackle(F(988) - F(694), 0.25), F(694), 0.5)
# ending: candle goes out, then silence
place(sfx, candle_out(), F(1058), 0.9)
# museum + library
place(sfx, whoosh(0.5, 0.6), F(1076), 0.35)
for f in range(1080, 1250, 16): place(sfx, reverb(step() * 0.6, 1.2, 0.5), F(f), 0.3)
place(sfx, murmur(F(1250) - F(1078)), F(1078), 0.4)
place(sfx, whoosh(0.35), F(1122), 0.35); place(sfx, whoosh(0.35), F(1185), 0.35); place(sfx, whoosh(0.35), F(1249), 0.35)
place(sfx, page(), F(1256), 0.9)

# ---------------- mix ----------------
voice = load_voice()
k = int(0.06 * SR); ve = np.convolve(np.abs(voice), np.ones(k) / k, "same")
speak = (ve > ve.max() * 0.05).astype(np.float32)
sm = int(0.18 * SR); speak_s = np.clip(np.convolve(speak, np.ones(sm) / sm, "same") * 1.5, 0, 1)
duck_m = 1 - 0.5 * speak_s   # music ducks a further ~6 dB wherever the voice talks
duck_x = 1 - 0.45 * speak_s
rms = lambda x, m: np.sqrt(np.sum((x * m) ** 2) / max(1, m.sum()))
v_rms = rms(voice, speak)
music *= (v_rms * 10 ** (-21 / 20)) / (rms(music * duck_m, speak) + 1e-9)
nz = music_tail[music_tail != 0]; music_tail *= (v_rms * 10 ** (-14 / 20)) / (np.sqrt(np.mean(nz ** 2)) + 1e-9)
sfx *= (v_rms * 10 ** (-15 / 20)) / (rms(sfx * duck_x, speak) + 1e-9)
mix = voice + music * duck_m + music_tail + sfx * duck_x
pk = np.max(np.abs(mix)); mix = mix / max(1, pk / 0.95)
fade = int(0.3 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
print("speech rms %.1f dBFS | music under speech %.1f dB | sfx under speech %.1f dB" % (20 * np.log10(v_rms), 20 * np.log10(rms(music * duck_m, speak) / v_rms), 20 * np.log10(rms(sfx * duck_x, speak) / v_rms)))
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", len(pcm) / SR)
