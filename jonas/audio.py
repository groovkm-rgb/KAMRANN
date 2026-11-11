"""Music bed + SFX for "Der Letzte" (10:47), mixed under voice.mp3 (voice always on top, side-chain ducked)."""
import numpy as np, subprocess, wave
SR = 44100; DUR = 19419 / 30; N = int(DUR * SR); rng = np.random.default_rng(7)
def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy(); out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out
def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X, len(x)).astype(np.float32)
def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * g
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=0.3): t = tt(d); return np.minimum(1, t / a) * np.exp(-t / r)
def pluck(f, d=0.4, br=0.5): t = tt(d); return (sum(br ** k * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(5)) * env(d, 0.003, d * 0.35)).astype(np.float32)
def piano(f, d=1.6): t = tt(d); s = sum((0.55 ** k) * np.sin(2 * np.pi * f * (k + 1) * t * (1 + 0.0004 * k)) for k in range(6)); return (s * env(d, 0.004, 0.55)).astype(np.float32)
def pad(fs, d, bright=1500):
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        for dt in (-0.6, 0.6): ph = 2 * np.pi * (f + dt) * t; s += np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)
    a = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8).clip(0)
    return filt((s * a / len(fs)).astype(np.float32), hi=bright)
def kick(): t = tt(0.35); f = 48 + 90 * np.exp(-t * 30); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
def snare(): t = tt(0.2); return filt((rng.standard_normal(len(t)) * np.exp(-t * 26) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.4).astype(np.float32), lo=300)
def hat(): t = tt(0.06); return filt((rng.standard_normal(len(t)) * np.exp(-t * 80)).astype(np.float32), lo=6000)
def tom(f=90): t = tt(0.5); return (np.sin(2 * np.pi * f * t * (1 - 0.3 * t)) * np.exp(-t * 6)).astype(np.float32)
def brass(fs, d):
    t = tt(d); s = np.zeros(len(t))
    for f in fs: ph = 2 * np.pi * f * t + 0.004 * np.sin(2 * np.pi * 5 * t); s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.2 for k in range(8))
    a = np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2).clip(0); return filt((s * a / len(fs)).astype(np.float32), hi=2200)
music = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
# ------------------------------------------------ music sections: (start, end, style, chords(midi roots), bpm, gain)
PROG_FUN = [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]]          # C Am F G
PROG_MIN = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]]          # Am F G E
PROG_SAD = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]          # Am F C G
PROG_EPIC = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]]          # Dm Bb C A
def section(a, b, style, prog, bpm, g):
    beat = 60 / bpm; T = a; bar = 0
    while T < b - 0.05:
        ch = prog[bar % len(prog)]; L = min(beat * 4, b - T)
        if style == 'fun':
            place(music, pad([midi(m) for m in ch], L, 1200), T, 0.05 * g)
            for k in range(4):
                tb = T + k * beat
                if tb >= b: break
                place(music, kick() if k % 2 == 0 else snare(), tb, (0.35 if k % 2 == 0 else 0.18) * g); place(music, hat(), tb + beat / 2, 0.06 * g)
                place(music, pluck(midi(ch[0] - 12), 0.35, 0.4), tb, 0.22 * g); place(music, pluck(midi(ch[(k + bar) % 3] + 12), 0.22, 0.6), tb + beat / 2, 0.09 * g)
        elif style == 'myst':
            place(music, pad([midi(m - 12) for m in ch], L, 700), T, 0.09 * g)
            for k in range(8): place(music, pluck(midi(ch[k % 3] + 12), 0.5, 0.3), T + k * beat / 2, 0.05 * g * (1 if k % 3 else 1.5))
        elif style == 'sad':
            place(music, pad([midi(m - 12) for m in ch], L, 900), T, 0.06 * g)
            for k, m in enumerate([ch[0], ch[1], ch[2], ch[1] + 12]): place(music, piano(midi(m)), T + k * beat, 0.09 * g)
        elif style == 'tension':
            place(music, pad([midi(ch[0] - 24), midi(ch[0] - 12)], L, 400), T, 0.12 * g)
            for k in range(4): place(music, tom(70), T + k * beat, 0.25 * g)
        elif style == 'epic':
            place(music, brass([midi(m - 12) for m in ch], L * 0.98), T, 0.09 * g); place(music, pad([midi(m) for m in ch], L, 1600), T, 0.05 * g)
            for k in range(8): place(music, tom(80 if k % 2 else 60), T + k * beat / 2, (0.3 if k % 2 == 0 else 0.18) * g)
            place(music, kick(), T, 0.4 * g)
        elif style == 'void':
            place(music, pad([midi(ch[0] + 12), midi(ch[2] + 12)], L, 3000), T, 0.05 * g)
        T += beat * 4; bar += 1
SECTIONS = [
    (0.0, 7.4, 'myst', PROG_MIN, 80, 1.0), (7.4, 40.1, 'fun', PROG_FUN, 104, 1.0), (40.1, 58.4, 'myst', PROG_MIN, 72, 1.0),
    (58.4, 118.1, 'myst', PROG_MIN, 92, 1.1), (118.1, 127.6, 'tension', PROG_MIN, 70, 0.8), (127.6, 140.7, 'fun', PROG_MIN, 116, 0.9),
    (140.7, 227.0, 'fun', PROG_FUN, 112, 1.0), (227.0, 270.8, 'fun', PROG_SAD, 96, 0.8), (270.8, 326.7, 'sad', PROG_SAD, 66, 1.2),
    (326.7, 344.8, 'tension', PROG_MIN, 84, 1.0), (344.8, 391.5, 'myst', PROG_MIN, 84, 1.0), (391.5, 424.9, 'tension', PROG_EPIC, 90, 1.0),
    (424.9, 456.8, 'tension', PROG_EPIC, 76, 1.2), (458.0, 480.0, 'void', PROG_MIN, 60, 1.0), (480.0, 521.2, 'myst', PROG_EPIC, 72, 1.0),
    (521.2, 551.6, 'epic', PROG_EPIC, 96, 1.2), (551.6, 596.9, 'epic', [[50, 54, 57], [55, 59, 62], [57, 61, 64], [50, 54, 57]], 108, 1.1),
    (596.9, 631.4, 'fun', PROG_FUN, 104, 1.0), (631.4, 647.3, 'myst', PROG_MIN, 92, 0.9),
]
for a, b, st, pr, bpm, g in SECTIONS:
    sec = np.zeros(N, np.float32); m0 = music; music = sec; section(a, b, st, pr, bpm, g); i, j = int(a * SR), min(N, int(b * SR))
    fade = np.ones(j - i, np.float32); fl = min(int(0.6 * SR), (j - i) // 3); fade[:fl] = np.linspace(0, 1, fl); fade[-fl:] = np.linspace(1, 0, fl)
    sec[i:j] *= fade; sec[j:] = 0; music = m0 + sec
# ------------------------------------------------ SFX
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def whoosh(d=0.5): t = tt(d); return (filt(noise(d), lo=400, hi=3000) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def zap(d=2.0): t = tt(d); f = 300 + 1200 * t / d; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2; return (s * np.sin(np.pi * t / d) + filt(noise(d), lo=3000) * 0.15 * np.sin(np.pi * t / d)).astype(np.float32)
def clank(): t = tt(0.9); s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(180, 6), (420, 9), (1130, 14), (2210, 20)]); return (s * 0.4 + filt(noise(0.9), lo=1500) * np.exp(-t * 30) * 0.5).astype(np.float32)
def thud(): t = tt(0.4); return (np.sin(2 * np.pi * 60 * t) * np.exp(-t * 10) + filt(noise(0.4), hi=500) * np.exp(-t * 15) * 0.6).astype(np.float32)
def beep(f=1800, d=0.12): t = tt(d); return (np.sin(2 * np.pi * f * t) * np.minimum(1, (d - t) / 0.01)).astype(np.float32)
def ring(): o = np.zeros(int(1.6 * SR), np.float32); [place_local(o, beep(f, 0.08), k * 0.1 + r * 0.8) for r in range(2) for k, f in enumerate([1300, 1600] * 3)]; return o
def place_local(buf, sig, t0): i = int(t0 * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i]
def click(): t = tt(0.05); return (filt(noise(0.05), lo=2000) * np.exp(-t * 120)).astype(np.float32)
def heart(): o = np.zeros(int(0.8 * SR), np.float32); place_local(o, thud(), 0); place_local(o, thud() * 0.7, 0.22); return o
def crowd(d, k=1.0):
    x = filt(noise(d), lo=200, hi=2500); t = tt(d); m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t) * np.sin(2 * np.pi * 0.23 * t + 1)
    a = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8).clip(0); return (x * m * a * k).astype(np.float32)
def applause(d):
    o = np.zeros(int(d * SR), np.float32); n = int(d * 60)
    for i in range(n): place_local(o, click() * (0.5 + rng.random()), rng.random() * (d - 0.06))
    t = tt(d); a = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 1.0).clip(0); return o * a[: len(o)]
def heli(d):
    t = tt(d); thump = (np.sin(2 * np.pi * 14 * t) > 0.6).astype(np.float32); x = filt(noise(d), hi=900) * (0.3 + thump) + np.sin(2 * np.pi * 55 * t) * thump * 0.5
    a = np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0).clip(0); return (x * a).astype(np.float32)
def chime(): return sum(piano(midi(m), 2.0) * 0.4 for m in [84, 88, 91, 96]).astype(np.float32)
def sparkle(): o = np.zeros(int(1.2 * SR), np.float32); [place_local(o, pluck(midi(84 + k * 3), 0.3, 0.2), k * 0.08) for k in range(8)]; return o
def drone(d, f=55): t = tt(d); a = np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5).clip(0); return (filt(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t), hi=400) * a).astype(np.float32)
def sneeze(): t = tt(0.5); return (filt(noise(0.5), lo=1500, hi=8000) * np.exp(-((t - 0.12) ** 2) / 0.004)).astype(np.float32)
def swing(): t = tt(0.6); return (filt(noise(0.6), lo=800, hi=4000) * np.sin(np.pi * t / 0.6) * 0.6 + np.sin(2 * np.pi * 200 * t) * np.exp(-((t - 0.5) ** 2) / 0.001) * 0.3).astype(np.float32)
CUES = [
    (4.0, sparkle(), 0.25), (5.7, whoosh(0.6), 0.3), (7.4, whoosh(0.7), 0.4), (30.0, clank(), 0.35), (32.4, clank(), 0.3),
    (41.35, beep(), 0.25), (42.3, zap(2.6), 0.4), (44.9, zap(1.6), 0.25), (45.4, sparkle(), 0.25), (60.5, clank(), 0.35),
    (74.4, beep(2400, 0.08), 0.15), (86.5, crowd(7.0, 0.9), 0.35), (95.9, beep(1400, 0.1), 0.2), (96.7, beep(1400, 0.1), 0.2), (97.5, beep(1400, 0.1), 0.2),
    (99.1, chime(), 0.15), (121.6, thud(), 0.5), (127.7, crowd(4, 0.5), 0.3), *[(127.8 + k * 0.37, click(), 0.4) for k in range(8)],
    (131.0, chime(), 0.15), (135.6, heli(5.4), 0.55), (140.7, heli(4.6), 0.4), (145.3, whoosh(0.8), 0.3), (149.0, beep(900, 0.2), 0.15),
    (174.4, beep(1200, 0.1), 0.15), (175.4, click(), 0.6), (175.6, click(), 0.6), (177.8, drone(1.8, 110), 0.15), (179.7, beep(1200, 0.1), 0.15), (181.3, beep(1200, 0.1), 0.15),
    (187.8, crowd(5.0, 1.0), 0.3), (189.2, applause(3.5), 0.3), (205.6, thud(), 0.3), (209.3, sneeze(), 0.5), (209.8, crowd(1.4, 1.2), 0.3),
    (211.8, ring(), 0.18), (213.5, ring(), 0.18), (215.3, ring(), 0.18), (240.2, crowd(7.5, 1.0), 0.32), (244.6, click(), 0.6), (245.7, crowd(3.4, 1.4), 0.3),
    (282.4, beep(2000, 0.06), 0.12), (283.1, beep(2000, 0.06), 0.12), (283.8, beep(2000, 0.06), 0.12), (284.5, beep(2000, 0.06), 0.12),
    (294.0, thud(), 0.3), (330.25, clank(), 0.4), (330.3, thud(), 0.5), (351.6, drone(1.2, 220), 0.1), (363.1, whoosh(0.9), 0.3), (368.45, whoosh(0.6), 0.2),
    (381.4, zap(1.3), 0.2), (403.45, whoosh(0.8), 0.3), (410.36, whoosh(0.6), 0.2), (424.97, crowd(9.0, 0.5), 0.25), (433.5, crowd(5.0, 0.6), 0.25),
    (430.24, beep(), 0.2), (445.4, swing(), 0.3), (446.1, swing(), 0.3), (446.8, swing(), 0.3), (450.2, beep(), 0.25),
    *[(451.83 + k * 0.625, heart(), 0.6) for k in range(6)], (455.9, beep(), 0.3), (456.8, zap(1.4), 0.5), (458.0, drone(10.0, 55), 0.12),
    (474.7, drone(1.6, 330), 0.05), (478.2, drone(0.8, 330), 0.04), *[(479.3 + k * 0.25, thud(), 0.12) for k in range(4)], (480.0, crowd(18.0, 0.4), 0.25),
    (521.2, crowd(9.0, 0.5), 0.15), (543.8, thud(), 0.4), (545.1, thud(), 0.4), (546.1, drone(2.4, 82), 0.15), (550.5, clank(), 0.45), (550.9, whoosh(0.8), 0.4),
    (551.62, clank(), 0.45), (553.6, thud(), 0.35), (560.5, zap(2.4), 0.3), (563.4, sparkle(), 0.3), (564.0, sparkle(), 0.3), (567.5, sparkle(), 0.25), (570.1, sparkle(), 0.25), (572.8, sparkle(), 0.25),
    (577.4, crowd(11.5, 1.4), 0.45), (577.4, applause(11.5), 0.25), (593.28, applause(5.0), 0.5), (593.28, crowd(3.6, 1.0), 0.25), (597.0, applause(3.5), 0.3), (598.8, click(), 0.6),
    (614.2, beep(2600, 0.15), 0.12), (631.4, chime(), 0.15), (641.6, whoosh(0.5), 0.15), (643.4, clank(), 0.2),
]
for t0, sig, g in CUES: place(sfx, sig, t0, g)
voice = load_voice()
# side-chain: duck music + sfx while the voice speaks
e = np.abs(voice); k = int(0.05 * SR); e = np.convolve(e, np.ones(k) / k, mode='same'); duck = 1 - 0.62 * np.clip(e / 0.05, 0, 1)
bed = (music * 0.9 + sfx) * duck
bed = bed / max(1e-6, np.abs(bed).max()) * 0.55
mix = voice * 1.0 + bed
mix = mix / max(1.0, np.abs(mix).max() / 0.97)
with wave.open('mix_raw.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('mix_raw.wav', len(mix) / SR)
