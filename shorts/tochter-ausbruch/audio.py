"""Synthesized music bed + SFX for "Tochter-Ausbruch", mixed under voice.mp3 (voice untouched). Writes mix_raw.wav.
Cues are in frames (30 fps) and follow web/story.js."""
import numpy as np, subprocess, wave
SR = 48000; TOTAL = 1622; DUR = TOTAL / 30; N = int(DUR * SR)
rng = np.random.default_rng(11)
F = lambda f: f / 30.0
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** order)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** order)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)

# ---------------- instruments ----------------
def pizz(m, d=0.3, g=1.0):
    t = tt(d); f = midi(m); s = sum(np.sin(2 * np.pi * f * (k + 1) * t) * (0.55 ** k) for k in range(6))
    return (s * np.minimum(1, t / 0.004) * np.exp(-t / (d * 0.28)) * g).astype(np.float32)
def bass(m, d=0.42):
    t = tt(d); f = midi(m); s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)
    return (s * np.minimum(1, t / 0.008) * np.exp(-t / (d * 0.45))).astype(np.float32)
def shaker(d=0.07, g=1.0): t = tt(d); return filt(noise(d), lo=5000) * np.exp(-t / (d * 0.3)) * g
def block(f=1250, d=0.07): t = tt(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.014)).astype(np.float32)
def rim(): t = tt(0.06); return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.006) + filt(noise(0.06), lo=2000) * np.exp(-t / 0.01) * 0.5).astype(np.float32)
def kick(): t = tt(0.25); f = 48 + 80 * np.exp(-t * 34); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)).astype(np.float32)
def pad(ms, d, cut=1400):
    t = tt(d); s = np.zeros(len(t))
    for m in ms:
        f = midi(m); ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5.2 * t) * f
        s += sum(np.sin((k + 1) * ph) / (k + 1) for k in range(7))
    a = np.minimum(1, t / (d * 0.3)) * np.minimum(1, (d - t) / 0.12).clip(0)
    return filt((s * a / len(ms)).astype(np.float32), hi=cut)
def marimba(m, d=0.35): t = tt(d); f = midi(m); return ((np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03)) * np.exp(-t / (d * 0.3))).astype(np.float32)
def bell(m, d=0.6): t = tt(d); f = midi(m); return ((np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) + 0.25 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t / (d * 0.22))).astype(np.float32)
def trombone(m0, m1, d, wah=True):
    t = tt(d); f = midi(m0) * (midi(m1) / midi(m0)) ** (t / d) ** 1.5; ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin((k + 1) * ph) / (k + 1) ** 1.1 for k in range(10)); a = np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.08).clip(0)
    s = filt((s * a).astype(np.float32), hi=900)
    if wah: s = s * (0.55 + 0.45 * np.sin(2 * np.pi * 5.5 * t - 1.2))
    return s.astype(np.float32)

music = np.zeros(N, np.float32)
BPM = 110; B = 60 / BPM; E = B / 2
def groove(t0, t1, roots, mel=None, dens=1.0, vol=1.0, shk=True):
    """sneaky bossa: bass on 1 / 2& / 3, shaker 8ths, rim on the clave, pizzicato melody on 8ths"""
    k = 0; t = t0
    while t < t1 - 0.01:
        bar = int(k // 8); e = k % 8; r = roots[bar % len(roots)]
        if e in (0, 3, 4): place(music, bass(r - 12 if e != 3 else r - 5), t, 0.5 * vol)
        if e == 7: place(music, bass(r - 5), t, 0.3 * vol)
        if shk: place(music, shaker(0.06, 0.5 if e % 2 else 0.85), t, 0.10 * vol * dens)
        if e in (0, 3, 6) or (bar % 2 and e in (2, 5)): place(music, rim(), t, 0.16 * vol)
        if mel:
            m = mel[k % len(mel)]
            if m: place(music, pizz(m, 0.28), t, 0.3 * vol); place(music, pizz(m + 12, 0.2), t, 0.08 * vol)
        k += 1; t += E
SNEAK = [69, 0, 72, 0, 76, 75, 76, 0, 72, 0, 69, 0, 68, 0, 69, 0, 74, 0, 77, 0, 81, 80, 81, 0, 77, 0, 74, 0, 76, 0, 71, 68]
# 1-4: sneaky walking theme (0 - 10.1 s), comic accent on the split screen
groove(0.0, F(304), [57, 57, 62, 64], SNEAK)
place(music, pizz(81, 0.3), F(258), 0.5); place(music, pizz(85, 0.3), F(258) + 0.09, 0.5); place(music, pizz(88, 0.5), F(258) + 0.18, 0.6)
# 5-6: dark moment, then the sly "plan" motif
place(music, pad([45, 52, 57], F(372) - F(306) + 0.2, 500), F(306), 0.55); place(music, bass(33, 1.4), F(306), 0.5); place(music, bass(32, 1.2), F(340), 0.45)
for i, m in enumerate([64, 67, 69, 72, 71, 72, 76]): place(music, pizz(m, 0.26), F(374) + i * 0.13, 0.42)
place(music, bass(45, 0.5), F(374), 0.5); place(music, rim(), F(374) + 0.9, 0.3); place(music, block(), F(374) + 1.03, 0.25)
# 7-10: quickening smuggling groove, accents on the three objects
SMUG = [69, 72, 69, 76, 0, 72, 75, 76, 69, 72, 69, 77, 0, 74, 76, 74]
groove(F(412), F(652), [57, 57, 53, 52], SMUG, dens=1.4, vol=1.05)
for f, m in [(507, 84), (526, 88), (545, 79)]: place(music, bell(m, 0.5), F(f), 0.22); place(music, kick(), F(f), 0.5)
place(music, pad([40, 46], 1.2, 420), F(547), 0.7)
# 11-12: tense but hopeful rise to the door
rise = [(57, [60, 64, 67]), (53, [60, 65, 69]), (55, [62, 67, 71]), (57, [64, 69, 72]), (58, [65, 70, 74]), (60, [67, 72, 76]), (62, [69, 74, 78]), (64, [71, 76, 80]), (64, [72, 76, 83])]
t0 = F(655); step = (F(798) - F(655)) / len(rise)
for i, (r, ch) in enumerate(rise):
    v = 0.5 + 0.7 * i / len(rise); t = t0 + i * step
    place(music, pad(ch, step * 1.05, 1200 + 150 * i), t, 0.34 * v); place(music, bass(r - 12, step), t, 0.45)
    for j in range(4): place(music, pizz(ch[j % 3] + 12, 0.2), t + j * step / 4, 0.2 * v); place(music, shaker(0.05), t + j * step / 4 + step / 8, 0.08)
place(music, bell(88, 1.0), F(790), 0.2)
# 13-14: ticking tension that speeds up, small hits with the sweat drops
t = F(806); gap = 0.42
while t < F(986):
    place(music, block(1250 if int(t * 7) % 2 else 980), t, 0.28); place(music, bass(40, 0.2), t, 0.25); t += gap; gap = max(0.105, gap * 0.94)
place(music, pad([40, 41], F(986) - F(852), 700) * np.linspace(0.3, 1, int((F(986) - F(852)) * SR)), F(852), 0.5)
for f in [860, 872, 882, 890, 896, 944, 953, 962, 971]: place(music, pizz(88 + (f % 5), 0.12), F(f), 0.22)
# 15: hard stop on the tap (silence follows)
place(music, kick(), F(990), 0.9); place(music, pizz(45, 0.25), F(990), 0.6)
music[int(F(992) * SR):int(F(1040) * SR)] *= 0.0
# 16-19: one comic accent per reveal; wah-wah trombone on the face
for i, m in enumerate([76, 80, 83]): place(music, pizz(m, 0.22), F(1049) + i * 0.07, 0.55)
place(music, bell(91, 0.9), F(1084), 0.3); place(music, bell(95, 0.9), F(1084) + 0.12, 0.22)
place(music, trombone(52, 64, 0.5, False), F(1170), 0.5)
place(music, kick(), F(1189), 0.8); place(music, pizz(57, 0.3), F(1189), 0.6)
place(music, trombone(58, 57, 0.42), F(1228), 0.75); place(music, trombone(57, 56, 0.42), F(1228) + 0.45, 0.75); place(music, trombone(56, 50, 0.85), F(1228) + 0.9, 0.8)
# 20: quick "viral" arpeggio
t = F(1277); k = 0; arp = [72, 76, 79, 84, 79, 76, 74, 77, 81, 86, 81, 77]
while t < F(1336):
    place(music, bell(arp[k % 12], 0.25), t, 0.2); place(music, shaker(0.04), t, 0.1)
    if k % 4 == 0: place(music, kick(), t, 0.5); place(music, bass(48 if (k // 12) % 2 == 0 else 50, 0.3), t, 0.4)
    k += 1; t += B / 4
# 21-22: absurd cheerful samba finale, sting on the last shrug
FIN = [69, 73, 76, 73, 78, 76, 73, 0, 71, 74, 78, 74, 80, 78, 76, 0]
def finale(t0, t1, vol=1.0):
    k = 0; t = t0
    while t < t1 - 0.01:
        e = k % 8; bar = k // 8; r = [57, 57, 52, 52][bar % 4]
        if e in (0, 3, 4, 6): place(music, bass(r - 12 if e in (0, 4) else r - 5, 0.3), t, 0.5 * vol)
        place(music, shaker(0.05, 0.9 if e % 2 == 0 else 0.5), t, 0.11 * vol)
        if e in (1, 3, 6): place(music, block(1500), t, 0.14 * vol)
        m = FIN[k % 16]
        if m: place(music, marimba(m, 0.3), t, 0.32 * vol); place(music, pizz(m - 12, 0.22), t, 0.15 * vol)
        k += 1; t += E
finale(F(1340), F(1436), 0.8); finale(F(1442), F(1584), 1.0)
for i, ch in enumerate([[69, 73, 76], [71, 74, 80], [73, 76, 81]]):
    for m in ch: place(music, marimba(m, 0.5), F(1588) + i * 0.16, 0.3); place(music, pizz(m, 0.4), F(1588) + i * 0.16, 0.2)
place(music, kick(), F(1588) + 0.32, 0.8); place(music, bass(45, 0.9), F(1588) + 0.32, 0.7); place(music, bell(93, 1.2), F(1588) + 0.32, 0.25)
music = filt(music, lo=35, hi=9000)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def whoosh(d=0.3, f0=500, f1=2800):
    n = noise(d); t = tt(d); out = np.zeros(len(n), np.float32); seg = 8; L = len(n) // seg
    for i in range(seg): c = f0 * (f1 / f0) ** (i / (seg - 1)); out[i * L:(i + 1) * L] = filt(n, lo=c * 0.6, hi=c * 1.6)[i * L:(i + 1) * L]
    return out * np.sin(np.pi * t / d) ** 2
def slap(): t = tt(0.09); return (filt(noise(0.09), lo=500, hi=3500) * np.exp(-t / 0.014) + 0.5 * np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.02)).astype(np.float32)
def plip(f=1500): t = tt(0.12); fr = f * (1 + 0.9 * np.exp(-t * 40)); return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.03)).astype(np.float32)
def ting(f=2637): t = tt(0.9); return (sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * d_) for k, d_ in [(1, 5), (1.5, 7), (2.01, 9)]) * 0.33).astype(np.float32)
def creak(d=0.35, f0=260, f1=420): t = tt(d); f = f0 + (f1 - f0) * t / d; s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * t)); return filt((s * np.sin(np.pi * t / d)).astype(np.float32), lo=300, hi=2600)
def boing(): t = tt(0.55); f = 180 + 160 * np.exp(-t * 5) * (1 + 0.5 * np.sin(2 * np.pi * 9 * t)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)).astype(np.float32)
def keys(d=0.5):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(9): i = int(rng.uniform(0, d * 0.8) * SR); t = tt(0.12); g = np.sin(2 * np.pi * rng.uniform(3500, 7000) * t) * np.exp(-t / 0.02); out[i:i + len(g)] += g[: len(out) - i] * rng.uniform(0.3, 1)
    return out
def slurp(): d = 0.45; t = tt(d); return filt(noise(d), lo=700, hi=2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * t)) * np.sin(np.pi * t / d) ** 2
def scratch(d=0.25): t = tt(d); return filt(noise(d), lo=2500, hi=7000) * (0.4 + 0.6 * np.sin(2 * np.pi * 45 * t) ** 2) * np.sin(np.pi * t / d)
def rustle(d=0.5):
    t = tt(d); e = np.zeros(len(t))
    for k in range(10): c = rng.uniform(0, d); e += np.exp(-((t - c) / 0.018) ** 2) * rng.uniform(0.3, 1)
    return filt(noise(d), lo=1800, hi=9000) * e.astype(np.float32)
def pop(f=420): t = tt(0.1); fr = f * (1 + 1.5 * np.exp(-t * 60)); return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.02)).astype(np.float32)
def rubber(d=0.5, f0=140, f1=520): t = tt(d); f = f0 * (f1 / f0) ** (t / d); return filt((np.sin(2 * np.pi * np.cumsum(f) / SR + 2.5 * np.sin(2 * np.pi * 31 * t)) * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.03).clip(0)).astype(np.float32), hi=2400)
def splop(): t = tt(0.22); f = 700 * np.exp(-t * 16) + 90; return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05) + filt(noise(0.22), lo=800, hi=4000) * np.exp(-t / 0.012) * 0.7).astype(np.float32)
def squeak(d=0.16, f0=1500, f1=2300): t = tt(d); f = f0 + (f1 - f0) * np.sin(np.pi * t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.7).astype(np.float32)
def thud(): t = tt(0.3); return (np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 13) + filt(noise(0.3), hi=900) * np.exp(-t / 0.02) * 0.6).astype(np.float32)
def heart(): t = tt(0.32); a = np.sin(2 * np.pi * 58 * t) * np.exp(-t / 0.035); b = np.zeros_like(a); i = int(0.13 * SR); b[i:] = a[: len(a) - i] * 0.7; return (a + b).astype(np.float32)
def ding(m=88): return bell(m, 0.5)
def buzz(d=0.12): t = tt(d); return (np.sign(np.sin(2 * np.pi * 150 * t)) * np.sin(np.pi * t / d) ** 0.3 * 0.4).astype(np.float32)
def click(): t = tt(0.05); return (filt(noise(0.05), lo=2500) * np.exp(-t / 0.004)).astype(np.float32)
def drip(): t = tt(0.25); f = 900 + 1300 * np.exp(-t * 25); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.04)).astype(np.float32)
def echo(x, delay=0.16, fb=0.45, n=5):
    out = np.zeros(len(x) + int(delay * n * SR), np.float32); out[:len(x)] = x
    for k in range(1, n + 1): i = int(delay * k * SR); out[i:i + len(x)] += filt(x, hi=3000) * fb ** k
    return out
def slosh(d=0.5): t = tt(d); return filt(noise(d), lo=250, hi=2200) * np.sin(np.pi * t / d) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
def scrape(d=0.35): t = tt(d); return (filt(noise(d), lo=180, hi=1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t)) * np.sin(np.pi * t / d) + 0.25 * np.sin(2 * np.pi * 620 * t) * np.exp(-t * 6)).astype(np.float32)

# room tones: fluorescent hum (prison), crowd murmur (visiting hall), door hum, sewer water
def tone(a, b, sig_fn, g):
    d = F(b) - F(a); s = sig_fn(d); fade = np.minimum(1, np.minimum(tt(d) / 0.15, (d - tt(d)) / 0.15)).clip(0)[: len(s)]; place(sfx, s[: len(fade)] * fade, F(a), g)
hum = lambda d: (lambda t: (np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t) + 0.25 * np.sin(2 * np.pi * 400 * t)) * (0.85 + 0.15 * np.sign(np.sin(2 * np.pi * 0.9 * t + 1) + 0.92)) + 0)(tt(d)).astype(np.float32) + filt(noise(d), lo=5000) * 0.05
murm = lambda d: filt(noise(d), lo=180, hi=900) * (0.55 + 0.45 * np.sin(2 * np.pi * 2.3 * tt(d)) * np.sin(2 * np.pi * 0.7 * tt(d) + 1))
water = lambda d: filt(noise(d), lo=300, hi=3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt(d)))
for a, b in [(0, 223), (306, 412), (655, 1277), (1338, 1439)]: tone(a, b, hum, 0.022)
tone(412, 586, murm, 0.09); tone(1439, 1495, water, 0.07); tone(1495, 1622, lambda d: filt(noise(d), hi=400), 0.03)
tone(740, 804, lambda d: (np.sin(2 * np.pi * 220 * tt(d)) + 0.6 * np.sin(2 * np.pi * 330 * tt(d))) * np.linspace(0.1, 1, int(d * SR)), 0.03)
# cuts
for f in [180, 306, 412, 481, 586, 616, 657, 758, 804, 1228, 1277, 1306, 1338, 1495]: place(sfx, whoosh(0.28), F(f) - 0.14, 0.2)
place(sfx, whoosh(0.7, 300, 5000), F(1439) - 0.5, 0.28)
# corridor: flip-flops, keys, the sweat plip
for f in range(2, 178, 11): place(sfx, slap(), F(f), 0.2)
for f in range(672, 728, 13): place(sfx, slap(), F(f), 0.16)
for f in range(730, 756, 12): place(sfx, slap(), F(f), 0.18)
for f in range(766, 800, 12): place(sfx, slap(), F(f), 0.12)
place(sfx, keys(0.5), F(20), 0.05); place(sfx, plip(), F(46), 0.3)
# detail cuts
place(sfx, whoosh(0.5, 900, 4200), F(72), 0.3); place(sfx, ting(), F(113), 0.26); place(sfx, creak(0.35), F(150), 0.3); place(sfx, creak(0.3, 300, 500), F(164), 0.28)
# guards
place(sfx, creak(0.3, 180, 240), F(192), 0.16); place(sfx, keys(0.4), F(196), 0.07); place(sfx, slurp(), F(209), 0.3)
place(sfx, boing(), F(258), 0.42)
# cell
place(sfx, scratch(0.22), F(319), 0.3); place(sfx, whoosh(0.6, 500, 900), F(342), 0.16); place(sfx, rustle(0.4), F(373), 0.4); place(sfx, buzz(0.07), F(385), 0.1); place(sfx, buzz(0.05), F(397), 0.1)
# visit
for f in range(416, 452, 8): place(sfx, slap(), F(f), 0.1)
place(sfx, thud(), F(452), 0.2); place(sfx, pop(700), F(456), 0.2)
place(sfx, rustle(0.7), F(484), 0.45); place(sfx, pop(380), F(507), 0.4); place(sfx, whoosh(0.25, 1200, 3000), F(507), 0.2)
place(sfx, pop(520), F(526), 0.35); place(sfx, ting(3136), F(530), 0.24)
place(sfx, pop(300), F(545), 0.4); place(sfx, rubber(0.5, 130, 420), F(552), 0.4); place(sfx, squeak(0.12, 900, 1300), F(566), 0.2)
# change
for i, f in enumerate([590, 595, 600, 604, 608]): place(sfx, whoosh(0.22, 700 + 150 * i, 2600), F(f), 0.22)
t = tt(0.3); place(sfx, (filt(noise(0.3), lo=3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (60 + 200 * t) * t))) * np.sin(np.pi * t / 0.3)).astype(np.float32), F(609), 0.22)
place(sfx, creak(0.25, 200, 260), F(626), 0.14)
# checkpoint
for f in range(660, 728, 7): place(sfx, slap() * 0.6 + thud()[: len(slap())] * 0.2, F(f), 0.07)
place(sfx, ding(96), F(700), 0.1); place(sfx, creak(0.5, 120, 180), F(742), 0.16); place(sfx, bell(84, 1.5), F(770), 0.1)
# suspicion
place(sfx, keys(0.4), F(812), 0.1); place(sfx, whoosh(0.3, 400, 3000), F(812), 0.25)
t = F(854); gap = 0.62
while t < F(988): place(sfx, heart(), t, 0.5); t += gap; gap = max(0.3, gap * 0.9)
for f in [860, 872, 882, 890, 896]: place(sfx, plip(1700 + f % 300), F(f), 0.2)
place(sfx, creak(0.9, 240, 330), F(906), 0.12)
for d0 in [0, 0.5, 1.0]: tq = tt(0.35); place(sfx, filt(noise(0.35), lo=900, hi=4500) * np.sin(np.pi * tq / 0.35) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * tq)), F(940) + d0, 0.13)
tq = tt(0.6); place(sfx, filt(noise(0.6), lo=4500) * np.minimum(1, tq / 0.2) * np.exp(-tq / 0.3), F(944), 0.12)
for i in range(4): place(sfx, plip(1300), F(944 + i * 9), 0.2)
# the stop and the reveals
place(sfx, thud(), F(990), 0.75)
place(sfx, whoosh(0.2, 1500, 5000), F(1048), 0.4); place(sfx, pop(600), F(1049), 0.5)
place(sfx, ting(3520), F(1086), 0.22); place(sfx, squeak(0.14, 1400, 2100), F(1122), 0.3); place(sfx, squeak(0.1, 1700, 2300), F(1127), 0.2)
place(sfx, rubber(0.62, 150, 700), F(1168), 0.45); place(sfx, splop(), F(1188), 0.6); place(sfx, whoosh(0.3, 800, 3000), F(1189), 0.2)
for f in [1232, 1240, 1247, 1256, 1263, 1270]: place(sfx, click(), F(f), 0.3)
for f in range(1228, 1274, 16): place(sfx, buzz(0.2), F(f), 0.1)
# viral
tq = tt(0.4); place(sfx, (np.sign(np.sin(2 * np.pi * 180 * tq)) * (np.sin(2 * np.pi * 9 * tq) > 0) * 0.3).astype(np.float32), F(1279), 0.12)
for i, f in enumerate([1283, 1287, 1291, 1295, 1299]): place(sfx, ding(88 + [0, 4, 7, 12, 16][i]), F(f), 0.22)
for i in range(9): place(sfx, ding(91 + (i * 5) % 12), F(1308 + i * 3), 0.16); place(sfx, pop(800 + 60 * i), F(1308 + i * 3), 0.12)
# shrug in the cell
place(sfx, whoosh(0.25, 500, 1500), F(1398), 0.16)
# sewer
for f in range(1442, 1494, 6): place(sfx, echo(slosh(0.4)), F(f), 0.2)
for f in [1446, 1462, 1479, 1489]: place(sfx, echo(drip(), 0.19, 0.5), F(f), 0.25)
for f in [1452, 1470, 1486]: place(sfx, echo(squeak(0.08, 2600, 3600), 0.12, 0.4, 3), F(f), 0.18); place(sfx, squeak(0.07, 2900, 3800), F(f) + 0.12, 0.15)
place(sfx, scrape(0.38), F(1495), 0.5); place(sfx, thud(), F(1505), 0.25)
for i in range(7): place(sfx, pop(360 + 50 * i), F(1503 + i * 7), 0.35); place(sfx, slap(), F(1503 + i * 7 + 12), 0.1); place(sfx, slap(), F(1503 + i * 7 + 17), 0.1)
place(sfx, pop(300), F(1553), 0.5); place(sfx, slosh(0.3), F(1554), 0.15)
place(sfx, squeak(0.08, 2600, 3600), F(1568), 0.2); place(sfx, squeak(0.07, 3000, 3800), F(1572), 0.18)
place(sfx, whoosh(0.25, 500, 1500), F(1576), 0.16)
sfx = filt(sfx, lo=40, hi=12000)

# ---------------- mix: voice on top, bed ~21 dB under it, ducked where the voice speaks ----------------
voice = load_voice()
win = int(0.05 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
act = env > 0.02 * env.max(); vr = np.sqrt(np.mean(voice[act] ** 2))
sm = int(0.12 * SR); duck = np.convolve((env > 0.06 * env.max()).astype(np.float32), np.ones(sm) / sm, mode="same")
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2))
music *= vr * 10 ** (-20.5 / 20) / rms(music)
sfx *= vr * 10 ** (-15.5 / 20) / rms(sfx)
music *= (1 - 0.3 * duck); sfx *= (1 - 0.22 * duck)
fade = np.ones(N, np.float32); k = int(0.35 * SR); fade[-k:] = np.linspace(1, 0, k)
mix = voice + (music + sfx) * fade
pk = np.abs(mix).max(); mix = mix / max(1.0, pk / 0.97)
w = wave.open("mix_raw.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.repeat((mix * 32767).astype(np.int16)[:, None], 2, 1)).tobytes()); w.close()
db = lambda x: 20 * np.log10(x + 1e-9)
print(f"dur {DUR:.2f}s  voice {db(vr):.1f} dB  music {db(rms(music)) - db(vr):+.1f} dB rel  sfx {db(rms(sfx)) - db(vr):+.1f} dB rel  peak {pk:.2f}")
