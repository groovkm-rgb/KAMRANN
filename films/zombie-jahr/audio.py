"""Music bed + SFX for "Ein Jahr drinnen", mixed UNDER voice.mp3 (voice always on top). All synthesized."""
import numpy as np, subprocess, wave
SR = 44100
DUR = 9178 / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def ffilt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * gain
def M(*a):
    n = max(len(x) for x in a); o = np.zeros(n, np.float32)
    for x in a: o[:len(x)] += x
    return o
tt = lambda d: np.arange(int(d * SR)) / SR
noise = lambda d: rng.standard_normal(int(d * SR)).astype(np.float32)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def pluck(f, d=0.3, bright=0.5):
    t = tt(d); s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * np.minimum(1, t / 0.003) * np.exp(-t / (d * 0.3))).astype(np.float32)
def pad(fs, d, cut=1400):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        for det in (-0.6, 0.6): s += np.sin(2 * np.pi * (f + det) * t + 0.4 * np.sin(2 * np.pi * f * 2 * t))
    a = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.8).clip(0)
    return ffilt((s * a / len(fs)).astype(np.float32), hi=cut)
def bell(f, d=0.8):
    t = tt(d); return (sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) * g for r, k, g in [(1, 4, 1), (2.76, 7, .4), (5.4, 11, .2)]) * 0.5).astype(np.float32)
def kick():
    t = tt(0.3); f = 50 + 80 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)).astype(np.float32)
def hat(): t = tt(0.06); return ffilt(noise(0.06) * np.exp(-t * 60), lo=6000)
def snare(): t = tt(0.16); return ffilt(noise(0.16) * np.exp(-t * 25) * 0.6 + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 20) * 0.4, lo=250)
def brass(fs, d):
    t = tt(d); s = np.zeros(len(t))
    for f in fs: ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5 * t); s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    return ffilt((s * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.12).clip(0) / len(fs)).astype(np.float32), hi=2200)

music = np.zeros(N, np.float32)
def groove(t0, t1, key=60, bpm=112, minor=False, drums=True, lead=True, g=1.0, sneaky=False):
    beat = 60 / bpm; prog = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]] if not minor else [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]]
    mel = [12, 14, 16, 19, 16, 14, 12, 7] if not minor else [12, 10, 7, 10, 3, 5, 7, 0]
    t, bar = t0, 0
    while t < t1 - beat:
        ch = prog[bar % 4]
        for b in range(4):
            tb = t + b * beat
            if tb >= t1: break
            place(music, pluck(midi(key - 24 + ch[0] + (7 if b % 2 else 0)), 0.32, 0.35), tb, 0.30 * g)
            if not sneaky: place(music, pluck(midi(key + ch[(b + 1) % 3]), 0.18, 0.7), tb + beat / 2, 0.10 * g)
            if drums:
                place(music, kick() if b % 2 == 0 else snare(), tb, (0.32 if b % 2 == 0 else 0.16) * g)
                place(music, hat(), tb + beat / 2, 0.08 * g)
            if lead and bar % 2 == 0: place(music, bell(midi(key + mel[(b + bar * 2) % 8]), 0.5), tb, 0.06 * g)
            if sneaky and b % 2 == 0: place(music, pluck(midi(key - 12 + mel[(b + bar) % 8] - 12), 0.12, 0.8), tb + beat * 0.75, 0.12 * g)
        t += beat * 4; bar += 1
def padbed(t0, t1, notes, g=0.05, cut=1200):
    place(music, pad([midi(n) for n in notes], t1 - t0, cut), t0, g)
# section beds (seconds; voice sections: 0 / 35.2 / 81.06 / 133.55 / 181.41 / 234.98)
groove(0.0, 12.9, 60, 112, g=0.9)
groove(12.9, 34.9, 57, 112, minor=True, lead=False, g=0.7)
groove(35.2, 63.4, 60, 118, g=0.85)
padbed(63.6, 68.5, [45, 52, 57], 0.05)
padbed(71.9, 80.9, [48, 55, 60], 0.05)
groove(81.06, 98.0, 57, 100, minor=True, drums=False, g=0.7)
groove(98.1, 127.0, 50, 92, minor=True, drums=False, lead=False, sneaky=True, g=0.85)
groove(127.2, 133.4, 60, 130, g=1.0)
groove(133.55, 181.2, 62, 104, g=0.75)
padbed(181.41, 209.4, [48, 55, 60, 64], 0.055, 1000)
padbed(209.5, 219.0, [45, 52, 57], 0.035, 700)         # the sad moment: almost nothing under the voice
padbed(219.06, 234.9, [48, 55, 60, 67], 0.05, 1600)
groove(222.84, 234.9, 60, 100, drums=False, g=0.55)
padbed(235.0, 248.6, [50, 57, 62], 0.05)
padbed(248.9, 256.7, [60, 64, 67, 72], 0.06, 2500)
padbed(256.8, 284.5, [53, 57, 60], 0.035)
padbed(285.0, 291.0, [38, 44, 50], 0.06, 600)
groove(300.47, DUR - 0.2, 60, 116, g=0.9)
# ice-cream van tune (music box) and talk-show jingle (original melodies)
for k, m in enumerate([72, 76, 79, 76, 77, 74, 71, 74, 72, 76, 79, 84, 83, 79, 76, 72] * 2): place(music, bell(midi(m), 0.4), 252.0 + k * 0.2, 0.09)
for k, m in enumerate([67, 72, 76, 79, 76, 79, 84]): place(music, brass([midi(m)], 0.14), 197.3 + k * 0.14, 0.06)
# stings
def sting(low=36, d=2.0):
    t = tt(d); s = np.sin(2 * np.pi * midi(low) * t) * np.exp(-t * 1.5) * 1.1 + ffilt(noise(d) * np.exp(-t * 6), hi=900) * 0.7
    b = brass([midi(low + 12), midi(low + 15), midi(low + 18)], 1.4); s[: len(b)] += b * 2 * np.exp(-np.arange(len(b)) / SR * 2); return s.astype(np.float32)
place(music, sting(36), 68.57, 0.5); place(music, sting(41, 1.6), 89.66, 0.35); place(music, sting(38, 1.8), 287.72, 0.45)
place(music, brass([midi(60), midi(64), midi(67), midi(72)], 1.3), 59.87, 0.10)   # Rambo
place(music, brass([midi(60), midi(64), midi(67)], 0.9), 304.4, 0.12)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def thunk(f0=90, d=0.3): t = tt(d); return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + ffilt(noise(d), hi=1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def whoosh(d=0.5): t = tt(d); return (ffilt(noise(d), hi=1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def scrape(d=1.0, f=60): t = tt(d); s = ffilt(noise(d), hi=700) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d); return (s * 1.6).astype(np.float32)
def creak(d=0.6, f0=140):
    t = tt(d); ph = np.cumsum(f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))) / SR
    return ffilt((np.mod(ph, 1) < 0.08).astype(np.float32) * np.sin(np.pi * t / d), lo=200, hi=2200) * 2.5
def moan(d=1.6, f0=110):
    t = tt(d); f = f0 * (1 + 0.25 * np.sin(np.pi * t / d) - 0.15 * t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) / k for k in range(1, 9)) * np.sin(np.pi * t / d) ** 1.5
    return ffilt(s.astype(np.float32), lo=80, hi=900) * 0.8
def chomp(): t = tt(0.25); return (ffilt(noise(0.25), lo=300, hi=3000) * np.exp(-t * 20) + thunk(70, 0.25) * 0.8).astype(np.float32)
def pop(f=600): t = tt(0.12); return (np.sin(2 * np.pi * f * t * (1 + 2 * np.exp(-t * 60))) * np.exp(-t * 30)).astype(np.float32)
def ding(f=1320): return bell(f, 0.9)
def buzz(d=0.8): t = tt(d); return (np.sign(np.sin(2 * np.pi * 150 * t)) * 0.3 * (np.sin(2 * np.pi * 4 * t) > 0)).astype(np.float32)
def beep(f=425, d=0.48): t = tt(d); return (np.sin(2 * np.pi * f * t) * 0.5).astype(np.float32)
def alarm(): s = np.concatenate([np.concatenate([beep(960, 0.18), beep(780, 0.18)]) for _ in range(3)]); return s * 0.6
def click(): t = tt(0.03); return ffilt(noise(0.03) * np.exp(-t * 200), lo=2000)
def paper(d=0.6): t = tt(d); return ffilt(noise(d), lo=1500, hi=7000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 7 * t) > 0)) * np.sin(np.pi * t / d) * 0.6
def ting(): return bell(1568, 1.2) * 1.3
def wah():
    out = []
    for i, m in enumerate([55, 54, 53, 50]):
        d = 0.45 if i < 3 else 1.0; t = tt(d); s = brass([midi(m)], d) * (0.7 + 0.3 * np.sin(2 * np.pi * 5 * t) if i == 3 else 1); out.append(s)
    return np.concatenate(out)
def powerdown(): t = tt(1.0); f = 400 * np.exp(-t * 2.5); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 0.5).astype(np.float32)
def drip(): t = tt(0.15); f = 900 + 1200 * t / 0.15; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.6).astype(np.float32)
def marker(d=0.35): t = tt(d); return ffilt(noise(d), lo=2500, hi=6000) * np.sin(np.pi * t / d) * 0.5
def growl(d=1.4): t = tt(d); f = 70 + 30 * np.sin(2 * np.pi * 3 * t); return ffilt((np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t)) * np.sin(np.pi * t / d)).astype(np.float32), hi=400) * 1.4
def heartbeat(): return np.concatenate([thunk(55, 0.18), np.zeros(int(0.08 * SR), np.float32), thunk(50, 0.25) * 0.7])
def rip(): t = tt(0.4); return ffilt(noise(0.4), lo=1500) * (np.random.default_rng(3).random(len(t)) > 0.6) * np.exp(-t * 4) * 0.9
def rustle(d): t = tt(d); return ffilt(noise(d), lo=2000, hi=8000) * (0.3 + 0.3 * np.sin(2 * np.pi * 3 * t) ** 2) * np.sin(np.pi * t / d) * 0.6
def crickets(d):
    t = tt(d); s = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0.3) * (np.sin(2 * np.pi * 0.9 * t) > 0) * 0.08
    return (s * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1)).astype(np.float32)
def birds(d, seed=1):
    r = np.random.default_rng(seed); s = np.zeros(int(d * SR), np.float32)
    for _ in range(int(d * 2)):
        t0 = r.uniform(0, d - 0.3); n = int(r.uniform(0.08, 0.2) * SR); t = np.arange(n) / SR; f0 = r.uniform(2500, 4200)
        ch = np.sin(2 * np.pi * np.cumsum(f0 + 900 * np.sin(2 * np.pi * 18 * t)) / SR) * np.sin(np.pi * t / t[-1]) * 0.25; i = int(t0 * SR); s[i:i + n] += ch[: len(s) - i]
    return s
def steps(d, rate=2.0, f=120):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d * rate)): place_local(s, thunk(f, 0.12) * 0.5 + ffilt(noise(0.12), lo=500) * 0.15, k / rate)
    return s
def place_local(buf, sig, t0): i = int(t0 * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i]
def tick(d):
    s = np.zeros(int(d * SR), np.float32)
    for k in range(int(d)): place_local(s, ffilt(noise(0.02), lo=3000) * 0.5, k + 0.0); place_local(s, ffilt(noise(0.02), lo=2000) * 0.35, k + 0.5)
    return s
def rain(d): t = tt(d); return (ffilt(noise(d), lo=800, hi=9000) * 0.3 * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5)).astype(np.float32)
def sizzle(d): t = tt(d); return (ffilt(noise(d), lo=3000) * 0.25 * (0.7 + 0.3 * np.random.default_rng(5).random(len(t)))).astype(np.float32)
def fire(d):
    s = ffilt(noise(d), hi=600) * 0.3
    r = np.random.default_rng(9)
    for _ in range(int(d * 6)): place_local(s, ffilt(noise(0.03), lo=1500) * r.uniform(0.3, 1), r.uniform(0, d - 0.05))
    return s
def wind(d): t = tt(d); return (ffilt(noise(d), lo=200, hi=900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t) ** 2) * 0.5 * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5)).astype(np.float32)
def snap(): return (ffilt(noise(0.3), lo=800) * np.exp(-tt(0.3) * 18) * 1.4).astype(np.float32)
def tinny(d):  # music leaking from headphones
    s = np.zeros(int(d * SR), np.float32); beat = 60 / 128
    for k in range(int(d / beat)): place_local(s, M(kick() * 0.6, pluck(midi(72 + (k % 4) * 2), 0.15, 0.8)), k * beat)
    return ffilt(s, lo=900, hi=4000) * 1.6
def zip_(): t = tt(0.5); return ffilt(noise(0.5), lo=2500) * (np.sin(2 * np.pi * 60 * t) > 0) * 0.5
def slam(): return M(thunk(65, 0.5) * 1.3, ffilt(noise(0.2), hi=2000) * 0.3)
def scooter(d): t = tt(d); return (np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(np.pi * t / d)) / SR) * np.sin(np.pi * t / d) * 0.2 + ffilt(noise(d), hi=1200) * 0.2 * np.sin(np.pi * t / d)).astype(np.float32)
def crack(): return M(snap() * 0.6, thunk(140, 0.15) * 0.5)

S = lambda sig, t, g=1.0: place(sfx, sig, t, g)
# 1 · Tag 1
S(tinny(5.5), 1.6, 0.35); S(chomp(), 7.75, 1.0); S(paper(0.8), 7.9, 0.5); S(whoosh(0.6), 7.3, 0.4)
S(buzz(0.8), 12.97, 0.5); S(ding(), 14.55, 0.4); S(alarm(), 16.8, 0.35)
for k, t0 in enumerate([21.0, 22.0, 23.3]): S(moan(1.5, 100 + k * 18), t0, 0.45)
for k in range(3): S(beep(425, 0.24), 27.1 + k * 0.48, 0.25)
for k in range(8): S(click(), 28.2 + k * 0.11, 0.3)
S(whoosh(0.3), 29.1, 0.3); S(ding(1760), 32.03, 0.35)
# 2 · Tag 2–7
for t0, f in [(37.62, 500), (39.33, 560), (43.02, 620), (44.3, 680), (47.12, 760)]: S(pop(f), t0, 0.6)
for k in range(6): S(chomp() * 0.4, 48.8 + k * 0.28, 0.5)
S(scrape(1.4), 52.7, 0.7); S(scrape(1.3), 54.1, 0.7); S(paper(0.8), 55.7, 0.6)
S(ting(), 57.9, 0.5); S(whoosh(0.4), 58.6, 0.4); S(wah(), 61.38, 0.25)
S(click(), 63.85, 0.8); S(powerdown(), 63.9, 0.5); S(beep(320, 0.25), 65.6, 0.25); S(beep(260, 0.4), 65.9, 0.25)
for k in range(5): S(drip(), 72.0 + k * 0.55, 0.5)
for k in range(7): S(marker(0.28), 75.9 + k * 0.42, 0.6)
# 3 · Woche 2–4
S(growl(1.6), 82.2, 0.6); for_ = [S(chomp() * 0.4, 86.5 + k * 0.3, 0.5) for k in range(4)]; S(growl(0.9), 88.6, 0.5)
S(crickets(29.0), 98.1, 0.6)
for k in range(8): S(heartbeat(), 101.47 + k * 0.62, 0.7)
S(creak(0.8, 110), 102.9, 0.6); S(rip(), 104.43, 0.9)
S(moan(1.4, 95), 107.9, 0.5); S(moan(1.2, 105), 108.8, 0.5); S(rustle(1.2), 109.7, 0.6); S(moan(1.4, 90), 113.3, 0.4)
S(creak(1.0, 90), 114.6, 0.7); S(bell(2093, 1.5), 117.5, 0.25); S(bell(2637, 1.5), 117.6, 0.2)
S(steps(3.0, 6.0, 160), 124.0, 0.6); [S(whoosh(0.3), 124.2 + k, 0.35) for k in range(3)]
# 4 · Monat 2–5
S(tick(10.5), 133.55, 0.5)
S(birds(9.5, 2), 144.5, 0.25); S(moan(1.8, 85), 146.5, 0.4); S(moan(1.6, 80), 149.3, 0.4); S(moan(1.6, 82), 156.6, 0.35)
S(birds(23, 3), 158.9, 0.3); S(rain(3.0), 171.9, 0.6); S(sizzle(2.5), 173.85, 0.6)
# 5 · Monat 6–11
S(wind(28), 181.41, 0.45); S(fire(12.0), 184.47, 0.6); S(snap(), 187.6, 0.6); S(crack(), 190.8, 0.6)
S(birds(1.6, 7), 195.2, 0.5)
S(wind(10), 209.5, 0.3)
S(birds(12, 11), 222.84, 0.3); S(tick(8), 226.5, 0.45); S(moan(1.6, 85), 233.2, 0.35)
# 6 · Tag 365
S(marker(0.4), 235.2, 0.6); S(zip_(), 241.0, 0.6); S(ting(), 242.3, 0.4); S(rustle(0.6), 243.8, 0.5)
S(scrape(1.3), 245.0, 0.7); S(creak(1.2, 80), 246.7, 0.7); S(whoosh(1.0), 247.6, 0.5); S(birds(6, 13), 248.9, 0.5)
S(scooter(2.6), 250.9, 0.6); S(steps(3.0, 2.2, 140), 254.0, 0.35)
S(moan(1.3, 88), 285.0, 0.45); S(moan(1.2, 84), 286.4, 0.45); S(whoosh(0.4), 287.6, 0.5); S(ting(), 287.9, 0.35)
S(crack(), 290.3, 0.5); S(steps(1.5, 2.5, 140), 300.5, 0.4); S(slam(), 301.6, 0.8); S(scrape(1.3), 302.8, 0.7)

voice = load_voice()
ve = np.convolve(np.abs(voice), np.ones(int(0.08 * SR)) / int(0.08 * SR), "same")
duck = 1 - 0.55 * np.clip(ve / (np.percentile(ve, 99) * 0.3), 0, 1)
bed = (music * 1.0 + sfx * 0.55) * duck
mix = voice * 1.0 + bed * 0.48
mix = np.tanh(mix * 0.9) / np.tanh(0.9)
fade = int(0.05 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
vr = np.sqrt(np.mean(voice[np.abs(voice) > 0.01] ** 2)); br = np.sqrt(np.mean(bed ** 2)) + 1e-9
print("ok", len(pcm) / SR, "voice/bed dB", round(20 * np.log10(vr / br), 1))
