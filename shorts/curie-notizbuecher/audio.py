"""Ton für 'curie-notizbuecher': leise Musik + Soundeffekte, komplett synthetisch (numpy), deterministisch.
Kein Sprechtext (macht der Nutzer). Ausgabe: out/audio/{musik,sfx,musik_sfx_mix}.wav  (48 kHz, Stereo, 16 bit, exakt 30,000 s)
Ereigniszeiten = Drehbuch / scene.js. Loopbar: Musik-Ausklang wird an den Anfang gefaltet."""
import json, pathlib, wave
import numpy as np

SR, D = 48000, 30.0
N = int(SR * D)
HERE = pathlib.Path(__file__).parent
F = json.loads((HERE / "facts.json").read_text())
rng = np.random.default_rng(1867)
t_all = np.arange(N) / SR

def db(x): return 10 ** (x / 20)
def stereo(mono, pan=0.0):            # pan -1..1, gleichleistungs-Panning
    a = (pan + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], 1)
def place(bus, sig, t0, pan=0.0, gain=1.0):
    i = int(round(t0 * SR)); s = stereo(sig * gain, pan) if sig.ndim == 1 else sig * gain
    n = min(len(s), N - i)
    if n > 0: bus[i:i + n] += s[:n]
    if len(s) > n and n >= 0: bus[:len(s) - n] += s[n:]          # über das Ende → an den Anfang (Loop)
def fft_band(x, lo, hi, soft=0.3):     # weicher Bandpass im Frequenzbereich
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / (1 + (lo / np.maximum(f, 1)) ** (2 / soft)) * 1 / (1 + (np.maximum(f, 1) / hi) ** (2 / soft))
    return np.fft.irfft(X * g, len(x))
def env_adsr(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def norm(x): return x / (np.max(np.abs(x)) + 1e-12)

# ─────────────────────────── Musik (A-Moll, sehr leise Pads + Glocken) ───────────────────────────
def midi(m): return 440 * 2 ** ((m - 69) / 12)
CHORDS = [  # Startzeit, Dauer, Töne (MIDI)
    (0.0, 7.5, [45, 57, 60, 64]),     # Am
    (7.5, 7.5, [41, 57, 60, 65]),     # F
    (15.0, 7.5, [48, 55, 60, 64]),    # C
    (22.5, 7.5, [40, 56, 59, 64]),    # E  → löst im Loop nach Am auf
]
TAIL = 4.0
music = np.zeros((N + int(TAIL * SR), 2))
for t0, dur, notes in CHORDS:
    n = int((dur + 2.5) * SR); tt = np.arange(n) / SR
    env = env_adsr(n, 1.6, 2.6)
    for m in notes:
        f0 = midi(m)
        for side, det in ((0, -0.12), (1, 0.12)):          # leicht verstimmt L/R → breites Pad
            sig = sum(np.sin(2 * np.pi * f0 * k * (1 + det / 100 * k) * tt + k) / k ** 1.6 for k in range(1, 6))
            trem = 1 + 0.08 * np.sin(2 * np.pi * 0.2 * tt + m)
            i = int(t0 * SR); music[i:i + n, side] += sig * env * trem * (0.6 if m < 50 else 0.35)
# Glocken-Arpeggio (Achtel bei 96 BPM), Lautstärke folgt der Spannung
step = 60 / 96 / 2
for j in range(int(D / step)):
    t0 = j * step
    chord = next(c for c in reversed(CHORDS) if c[0] <= t0 + 1e-9)
    m = chord[2][1:][j % 3] + 12 * (1 if j % 6 >= 3 else 0)
    n = int(1.4 * SR); tt = np.arange(n) / SR
    bell = (np.sin(2 * np.pi * midi(m) * tt) + 0.3 * np.sin(2 * np.pi * midi(m) * 2.76 * tt)) * np.exp(-tt * 3.2)
    lvl = 0.10 + 0.08 * (14 <= t0 < 22) - 0.04 * (8.5 <= t0 < 14)
    i = int(t0 * SR); music[i:i + n] += stereo(bell * lvl, 0.35 * np.sin(j * 1.3))
music[:int(TAIL * SR)] += music[N:]                         # Ausklang an den Anfang falten → nahtloser Loop
music = music[:N]
music = norm(music) * db(-20)                               # sehr leise: Platz für die Stimme

# ─────────────────────────── Soundeffekte ───────────────────────────
sfx = np.zeros((N, 2))
rest = lambda years: 0.5 ** (years / F["t_half"])
def smooth(x, a, b): u = np.clip((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)

def geiger_rate(t):                                        # Klicks pro Sekunde, folgt dem Bild
    if t < 2.35: return 14
    if t < 2.9: return 14 * (1 - smooth(t, 2.35, 2.7))
    if t < 5.0: return 10
    if t < 5.3: return 3
    if t < 7.35: return 6 + 10 * smooth(t, 5.3, 7.2)
    if t < 14.1: return 1.4                                    # Bleikiste zu / Rechnung
    if t < 21.7:                                               # folgt dem Rest-Radium der Kurve
        z = smooth(t, 14.4, 20.6); span = np.exp(np.log(140) + (np.log(16000) - np.log(140)) * z)
        return 0.3 + 11 * rest(min(span, 16000))
    if t < 26.6: return 3
    return 3 + 11 * smooth(t, 26.6, 27.4)
def muffled(t): return 7.35 <= t < 8.6

def click(muff):
    n = int(0.012 * SR); tt = np.arange(n) / SR
    if muff:
        return (np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 600)) * 0.25
    noise = rng.standard_normal(n) * np.exp(-tt * 2500)
    ring = np.sin(2 * np.pi * 3600 * tt) * np.exp(-tt * 900)
    return (0.7 * noise + 0.5 * ring) * 0.55
t = 0.0
while t < D:                                               # inhomogener Poisson-Prozess (Thinning)
    t += rng.exponential(1 / 16)
    if t < D and rng.random() < geiger_rate(t) / 16:
        place(sfx, click(muffled(t)), t, pan=rng.uniform(-0.3, 0.3), gain=rng.uniform(0.6, 1.0))

def whoosh(dur=0.7, lo=300, hi=4000):
    n = int(dur * SR); tt = np.arange(n) / SR
    a = fft_band(rng.standard_normal(n), lo, lo * 3); b = fft_band(rng.standard_normal(n), hi / 3, hi)
    k = tt / dur
    return norm((a * (1 - k) + b * k) * np.sin(np.pi * k) ** 2) * 0.32
def pop(f0=900, f1=320, dur=0.12):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28) * 0.45
def thud():
    n = int(0.5 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-tt * 18)) / SR) * np.exp(-tt * 9)
    knock = fft_band(rng.standard_normal(n), 80, 900) * np.exp(-tt * 40)
    return norm(body + 0.6 * knock) * 0.75
def tick():
    n = int(0.02 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 300) * 0.07
def riser(dur=1.4):
    n = int(dur * SR); tt = np.arange(n) / SR; k = tt / dur
    out = np.zeros(n); seg = 2048
    for s in range(0, n, seg):                                 # Bandpass wandert nach oben
        c = 400 * 2 ** (3.5 * (s / n)); e = min(n, s + seg)
        out[s:e] = fft_band(rng.standard_normal(seg), c * 0.7, c * 1.4)[: e - s]
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * k)) / SR)
    return norm(out * k ** 2 + 0.25 * tone * k ** 2) * 0.35
def impact():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 2.6)
    crack = fft_band(rng.standard_normal(n), 200, 6000) * np.exp(-tt * 14)
    shimmer = sum(np.sin(2 * np.pi * midi(m) * tt) for m in (76, 81, 84)) * np.exp(-tt * 1.8) * 0.12
    return norm(sub + 0.5 * crack + shimmer) * 0.8

for tw in (2.35, 5.15, 8.55, 14.05, 26.6):
    place(sfx, whoosh(), tw - 0.35, pan=0.0)
place(sfx, pop(1100, 420), 2.6, gain=0.9)              # „1898“
place(sfx, pop(700, 260, 0.16), 3.0)                   # Ra-Kachel
place(sfx, thud(), 7.3)                                # Bleideckel zu
place(sfx, pop(1300, 600), 7.4, gain=0.5)              # „Pb“
for i in range(3): place(sfx, pop(900 + 120 * i, 380), 9.55 + i * 1.0, gain=0.6)   # Formelzeilen
place(sfx, whoosh(0.5, 600, 6000), 11.9, gain=0.6)     # Balken füllt sich
for k in np.arange(14.45, 20.6, 0.125):                # Zähler-Ticks
    place(sfx, tick(), k, pan=0.2 * np.sin(k * 3))
place(sfx, riser(1.4), 20.6)
place(sfx, impact(), 22.0)
place(sfx, pop(1000, 380, 0.14), 22.25, gain=0.7)      # „3498“
sfx = norm(sfx) * db(-9)

mix = music + sfx
mix *= db(-3) / np.max(np.abs(mix))                    # Headroom für die Stimme

def write(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
o = HERE / "out" / "audio"
write(o / "musik.wav", music); write(o / "sfx.wav", sfx); write(o / "musik_sfx_mix.wav", mix)
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print(f"Länge {len(mix) / SR:.3f} s · Musik RMS {rms(music):.1f} dBFS · SFX RMS {rms(sfx):.1f} dBFS · Mix Peak {20*np.log10(np.max(np.abs(mix))):.1f} dBFS")
print(f"Loop-Naht (Mix): |x[0]-x[-1]| = {np.max(np.abs(mix[0] - mix[-1])):.4f}")
