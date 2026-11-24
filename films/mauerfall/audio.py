"""Mauerfall – music + SFX under voice.mp3 (method of cartoon-short-kit/example/soldier/audio.py: short clean synthesized
sounds, no noise beds). Cues are tied to the aligned phrases (work/phrases.json). Writes mix_raw.wav, then -16 LUFS mix.wav.
"""
import json, subprocess, wave
import numpy as np

SR = 48000
PH = json.load(open('work/phrases.json'))
P = [(p['s'], p['e']) for p in PH['phrases']]
DUR = PH['duration']; N = int(DUR * SR)
rng = np.random.default_rng(1989)
def S(i, f=0.0):  # time inside phrase i (f = fraction of its length)
    return P[i][0] + (P[i][1] - P[i][0]) * f
def CUT(i):        # shot cut before phrase i (middle of the pause)
    return 0.0 if i == 0 else (P[i - 1][1] + P[i][0]) / 2

# ---------------- building blocks (from the proven kit) ----------------
def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def lp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
music = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N and j > i: buf[i:j] += sig[: j - i] * gain
def pluck(f, dur=0.35, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6)); return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def piano(f, dur=2.4):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.2 + h * .9)) / h ** 1.4 for h in (1, 2, 3, 4, 5)); return (s * np.minimum(1, t / .004)).astype(np.float32)
def pad(fs, dur):  # soft strings (filtered detuned saws through the 'brass' recipe, slow attack)
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        for d in (-.003, .003):
            ph = 2 * np.pi * f * (1 + d) * t + .004 * np.sin(2 * np.pi * 5 * t)
            s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.6 for k in range(6))
    a = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2).clip(0)
    return lp_fast((s * a).astype(np.float32), 1400) / (2 * len(fs))
def drum(kind):
    if kind == "kick":
        n = int(0.35 * SR); t = np.arange(n) / SR; f = 50 + 90 * np.exp(-t * 30)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
    n = int(0.18 * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 28) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20) * 0.5; return hp_fast(s.astype(np.float32), 300)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def ting(f=2093, d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * ff * t) * np.exp(-t * k) for ff, k in [(f, 4), (f * 1.5, 6), (f * 2, 8)]) * 0.3).astype(np.float32)
def creak(d=0.6, f0=140):
    n = int(d * SR); t = np.arange(n) / SR; rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))
    ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d); return hp_fast(s, 200) * 2.5
def snap():
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 800) * np.exp(-t * 18) * 1.4 + np.pad(thunk(120, 0.4), (0, n - int(0.4 * SR))) * 0.6).astype(np.float32)
# ---------------- new clean sounds in the same style ----------------
def click(f=3000, d=.03):  # camera shutter = two dry clicks
    n = int(.14 * SR); s = np.zeros(n, np.float32)
    for off, g in [(0, 1), (.06, .7)]:
        m = int(d * SR); i = int(off * SR); tt = np.arange(m) / SR
        s[i:i + m] += (hp_fast(noise(d), 2000) * np.exp(-tt * 260) * .8 + np.sin(2 * np.pi * f * tt) * np.exp(-tt * 300) * .4) * g
    return s
def tick(hi=True):
    n = int(.05 * SR); t = np.arange(n) / SR; f = 2600 if hi else 1900
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 180) + hp_fast(noise(.05), 3000) * np.exp(-t * 400) * .4).astype(np.float32)
def paper(d=.35):
    n = int(d * SR); t = np.arange(n) / SR; s = hp_fast(lp_fast(noise(d), 7000), 2000)
    am = np.zeros(n); [am.__setitem__(slice(i, i + 400), 1.0) for i in rng.integers(0, max(1, n - 400), 9)]
    return (s * (lp_fast(am.astype(np.float32), 60) * .8 + .1) * np.sin(np.pi * t / d)).astype(np.float32) * .6
def typewriter(n_keys=14, gap=.11):
    s = np.zeros(int((n_keys * gap + .4) * SR), np.float32)
    for k in range(n_keys):
        tk = max(0, k * gap + rng.uniform(-.02, .02)); m = int(.03 * SR); i = int(tk * SR); tt = np.arange(m) / SR
        s[i:i + m] += (hp_fast(noise(.03), 1500) * np.exp(-tt * 200) * .7 + np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 250) * .4)
    b = ting(3200, .5); i = int(n_keys * gap * SR); s[i:i + len(b)] += b[: len(s) - i] * .5
    return s
def bell_tram():
    a = ting(1568, 1.0); b = np.pad(ting(1568, .8), (int(.18 * SR), 0)); b = np.pad(b, (0, max(0, len(a) - len(b))))[: len(a)]; return (a + b) * .8
def ring_phone(d=1.6):
    n = int(d * SR); t = np.arange(n) / SR; on = ((t % .4) < .3) & (t < 1.2)
    s = (np.sin(2 * np.pi * 1150 * t) + np.sin(2 * np.pi * 1450 * t)) * (np.sign(np.sin(2 * np.pi * 22 * t)) * .5 + .5) * on * .3
    return lp_fast(s.astype(np.float32), 4000)
def ringback(d=2.4):
    n = int(d * SR); t = np.arange(n) / SR; on = (t % 1.2) < .9; return (np.sin(2 * np.pi * 425 * t) * on * .25).astype(np.float32)
def knock(k=3): s = np.zeros(int(1.0 * SR), np.float32); [place_into(s, thunk(160, .2) * 1.2, i * .17) for i in range(k)]; return s
def place_into(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig));
    if j > i: buf[i:j] += sig[: j - i] * g
def steps(n=6, gap=.32, f0=70, g=.6):
    s = np.zeros(int((n * gap + .4) * SR), np.float32)
    for k in range(n): place_into(s, thunk(f0 + rng.uniform(-8, 8), .18) * (g * rng.uniform(.8, 1.1)), k * gap)
    return s
def clap_burst(d=2.0, rate=25):
    s = np.zeros(int(d * SR), np.float32); m = int(.02 * SR); tt = np.arange(m) / SR
    for _ in range(int(d * rate)):
        i = int(rng.uniform(0, d - .03) * SR); s[i:i + m] += hp_fast(noise(.02), 900) * np.exp(-tt * 220) * rng.uniform(.3, 1)
    t = np.arange(len(s)) / SR; return s * np.sin(np.pi * t / d) ** .5 * .5
def chant_beats(times):  # "Tor - auf!" as two stomps + clap cluster each (rhythmic, no fake voices)
    s = np.zeros(N, np.float32)
    for t0 in times:
        for k, dt in enumerate((0, .42)):
            place(s, drum('kick') * .9, t0 + dt); place(s, clap_burst(.18, 120) * 1.4, t0 + dt + .01)
    return s
def heartbeat(t0, t1, bpm0=70, bpm1=110, g=.5):
    t = t0
    while t < t1:
        k = (t - t0) / max(1e-3, t1 - t0); bpm = bpm0 + (bpm1 - bpm0) * k
        place(sfx, lp_fast(drum('kick'), 200) * g, t); place(sfx, lp_fast(drum('kick'), 200) * g * .6, t + .22); t += 60 / bpm
def ticks(t0, t1, gap0=1.0, gap1=.4, g=.35):
    t = t0; hi = True
    while t < t1:
        k = (t - t0) / max(1e-3, t1 - t0); place(sfx, tick(hi), t, g); hi = not hi; t += gap0 + (gap1 - gap0) * k
def horn(d=.5, f=(392, 494)):
    n = int(d * SR); t = np.arange(n) / SR; s = sum(np.sign(np.sin(2 * np.pi * ff * t)) for ff in f) * .3
    return lp_fast(s.astype(np.float32), 2500) * np.minimum(1, t / .02) * np.minimum(1, (d - t) / .05).clip(0)
def engine2t(d=2.0, rate=38):  # two-stroke putter
    n = int(d * SR); t = np.arange(n) / SR; pulses = (np.mod(t * rate, 1) < .25).astype(np.float32)
    return lp_fast(pulses * (.7 + .3 * rng.random(n).astype(np.float32)), 500) * np.minimum(1, t / .2) * np.minimum(1, (d - t) / .3).clip(0) * .7
def chirp():
    d = .09; n = int(d * SR); t = np.arange(n) / SR; f = np.linspace(3500, 5200, n)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * .25).astype(np.float32)
def birds(t0, t1, density=.8):
    t = t0
    while t < t1:
        for r in range(rng.integers(1, 4)): place(sfx, chirp(), t + r * .12, .35)
        t += rng.uniform(.8, 2.4) / density
def cork(): return np.concatenate([thunk(420, .12) * 1.2, (hp_fast(noise(.6), 4500) * np.exp(-np.arange(int(.6 * SR)) / SR * 6) * .15).astype(np.float32)])
def doorbell(): return np.concatenate([ting(1319, .6) * .9, ting(1047, 1.0) * .9])
def register(): return np.concatenate([ting(2637, .15) * .6, np.zeros(int(.05 * SR), np.float32), thunk(200, .2) * .5])
def scan_beep(): n = int(.15 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 2800 * t) * .25 * np.minimum(1, (0.15 - t) / .02)).astype(np.float32)
def tv_klak(): return np.concatenate([thunk(300, .08) * 1.2, (hp_fast(noise(.25), 2000) * .12).astype(np.float32)])
def tv_off():
    n = int(.6 * SR); t = np.arange(n) / SR; f = np.linspace(9000, 400, n)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * .2).astype(np.float32)
def music_box(notes, t0, step=.55, g=.6):
    for k, m in enumerate(notes): place(music, pluck(midi(m), .9, .3), t0 + k * step, g)

# ---------------- MUSIC (very low; most of the film has none) ----------------
def piano_bed(t0, t1, prog=((53, 57, 60), (57, 60, 64), (50, 57, 62), (48, 55, 60)), beat=.62, strings=True, g=1.0):
    t = t0; k = 0
    while t < t1 - .3:
        ch = prog[(k // 4) % len(prog)]; place(music, piano(midi(ch[k % 3] + 12), 2.2), t, .22 * g)
        if k % 4 == 0:
            place(music, piano(midi(ch[0] - 12), 2.8), t, .18 * g)
            if strings: place(music, pad([midi(m) for m in ch], min(beat * 4 + 1.0, t1 - t + .5)), t, .5 * g)
        t += beat; k += 1
def synthpop(t0, t1):
    beat = 60 / 120; t = t0; k = 0
    while t < t1:
        place(music, drum('kick'), t, .5); place(music, drum('snare'), t + beat, .3)
        for j in range(4): place(music, pluck(midi([57, 60, 64, 67][(j + k) % 4] + 12), .2, .8), t + j * beat / 2, .18)
        place(music, pluck(midi(45 + (k % 2) * 5), .45, .4), t, .4); t += beat * 2; k += 1
def drone(t0, t1, g=.5):
    d = t1 - t0; n = int(d * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .3 * np.sin(2 * np.pi * 110.3 * t)) * np.minimum(1, t / 3) * np.minimum(1, (d - t) / .2).clip(0)
    place(music, lp_fast(s.astype(np.float32), 500), t0, .12 * g)

piano_bed(CUT(18), CUT(22) - .3, g=.8)                     # hopeful morning at the Gate
piano_bed(CUT(50), CUT(58) - .2)                           # the history of the wall
music_box([72, 76, 79, 76, 74, 72, 71, 72], CUT(63) + .3)  # childhood flashback
piano_bed(CUT(65), CUT(74) - .3, g=.8)
piano_bed(CUT(82), CUT(86) - .2, prog=((50, 53, 57), (46, 50, 53), (48, 52, 55), (45, 48, 52)))  # Leipzig candles
piano_bed(CUT(98), CUT(100) - .2, prog=((53, 57, 60), (48, 52, 55)))                               # relief
drone(CUT(188), S(227, .1))                                # waiting at the border, cut on the barrier
piano_bed(CUT(232) + 1.2, CUT(242) - .2, prog=((55, 59, 62), (52, 55, 59), (48, 52, 55), (50, 54, 57)), g=.9)  # first steps on the bridge
piano_bed(CUT(251), CUT(255) - .2, g=.7)
synthpop(CUT(270), CUT(278) - .3)                          # short and low under Kudamm
piano_bed(CUT(285), CUT(287) - .2, g=.7)
piano_bed(CUT(325), CUT(330) - .2, prog=((53, 57, 60), (50, 53, 57), (46, 50, 53), (48, 52, 55)))  # the aunt
piano_bed(CUT(330), DUR - 1.0, g=.9)                       # finale
i0 = int((DUR - 1.4) * SR); music[i0:] *= np.linspace(1, 0, N - i0)

# ---------------- SFX (frame-matched to the shots) ----------------
for ft in [0.33, 1.2, 1.75, 2.35, 2.95, 3.6, 3.9, 4.3, 4.8, 5.25, 6.3, 7.3, 7.55, 7.75, 9.5, 12.2, 14.0, 18.6, 20.0]: place(sfx, click(), ft, .55)
place(sfx, thunk(55, .7) * 1.6, 0.33, 1.0); place(sfx, ting(2637, .6), 0.36, .3)          # intro hit on the flash
place(sfx, whoosh(.5), 0.75, .8); place(sfx, ting(3136, .8), 1.9, .2)                     # push onto the sheet, glint
place(sfx, paper(.6) * .7, 2.15, .6)                                                     # felt tip circles the sheet
place(sfx, whoosh(.35) * 1.4, 3.42, 1.0)                                                 # whip pan
place(sfx, thunk(240, .15), CUT(4) + .05, .9)                       # TV light switched on
for t0 in (S(7, .1), S(7, .6), S(8, .2), S(14, .2)): place(sfx, paper(), t0, .7)
ticks(15.0, CUT(18) - .1, 1.0, 1.0, .3)                             # 18:53 motif starts with the stamp
place(sfx, whoosh(.6), CUT(18) - .35, .7); birds(CUT(18), CUT(19), .8)
place(sfx, clap_burst(2.2), CUT(18) + .2, .5)
for h in (S(18, .7), S(19, .2)): place(sfx, ting(2150, .3), h, .35)
place(sfx, paper(.5) * .6, S(18, .58), .5)  # felt tip squeak (soft)
place(sfx, tv_off(), CUT(22) - .45, .6); place(sfx, thunk(260, .08), CUT(22) - .45, .7)
place(sfx, bell_tram(), CUT(22) + 1.0, .45); place(sfx, bell_tram(), S(25, .2), .4)
place(sfx, paper(.4), S(24, .2), .7)                                # calendar page torn
for k in range(4): place(sfx, thunk(150, .12), S(30, .1) + k * .55, .35)  # bucket on the stairs
for k in range(3): place(sfx, ting(1760, .25), S(31, .2) + k * .4, .25)   # factory
place(sfx, pluck(midi(76), .3, .7), S(47, .3), .35); place(sfx, pluck(midi(81), .3, .7), S(47, .5), .3)  # sniff the soap (comic)
for k, (a, b, fn, s_) in enumerate([(89.0, 101.6, 0, 0), (131.0, 137.9, 0, 0), (272.0, 290.3, 0, 0), (335.8, 343.6, 0, 0), (553.6, 563.2, 0, 0), (638.6, 644.2, 0, 0)]):
    place(sfx, whoosh(.4), a, .35); place(sfx, typewriter(16), a + .5, .45)
place(sfx, ting(988, 2.0), S(84, .2), .25)                            # church bell, Leipzig
heartbeat(S(86, 0), S(88, 1), 75, 95, .45)
heartbeat(CUT(95), CUT(98), 90, 60, .35)                              # silence of the march, then relief
place(sfx, snap(), S(75, .5), .6)                                     # wire cut in Hungary
place(sfx, engine2t(3.0), S(77, .1), .35)
heartbeat(S(105, 0), S(106, .5), 100, 110, .5)                        # Dein Herz klopft
place(sfx, clap_burst(1.5, 18), S(104, 0), .45)
place(sfx, paper(.4), S(107, .3), .7)                                 # calendar 9 November
place(sfx, engine2t(2.5), CUT(110) + .3, .3); place(sfx, bell_tram(), S(112, .1), .45)
place(sfx, tick(True), S(119, .2), .5); place(sfx, tick(False), S(119, .7), .5)
ticks(S(125, .1), S(227, .05), 1.0, .32, .3)                          # 18:53 -> the border: the clock speeds up, stops at the barrier
place(sfx, tv_klak(), CUT(152) + .05, .9)                             # switching to West TV
place(sfx, ring_phone(), S(158, .05), .5)
place(sfx, knock(3), S(162, .3), 1.0); place(sfx, creak(.7, 120), S(163, .05), .8)
place(sfx, steps(3, .28, 90, .5), S(169, .2), .6)
place(sfx, steps(9, .16, 80, .6), S(171, .0), .8)                     # running down the stairs
for k in range(3): place(sfx, creak(.4, 160 + k * 30), S(174, .1) + k * .4, .5)   # windows torn open
place(sfx, bell_tram(), S(184, .2), .5)
place(sfx, thunk(110, .3), S(187, .6), .7)                            # Trabi door
place(sfx, ringback(2.6), S(192, .05), .35)
heartbeat(CUT(188), S(227, .05), 62, 118, .32)
sfx += chant_beats([S(205, 0), S(206, 0), S(207, 0)])
place(sfx, creak(1.6, 90), S(227, .15), 1.0)                          # barrier goes up (tick stops just before)
place(sfx, clap_burst(3.0, 40), CUT(232) + .1, .9); place(sfx, steps(14, .14, 75, .6), CUT(232) + .2, .9)
place(sfx, steps(10, .2, 85, .6), S(233, 0), .7); place(sfx, steps(8, .14, 85, .6), S(237, 0), .7)
place(sfx, clap_burst(3.0, 30), S(245, 0), .6)
place(sfx, cork(), S(248, .5), .7)
place(sfx, ting(2637, .4), S(267, .2), .6); place(sfx, ting(2793, .4), S(267, .25), .5)   # beer glasses
for k in range(5): place(sfx, horn(.35, ((392, 494), (330, 415), (440, 554))[k % 3]), S(272, 0) + k * .3, .35)
for k in range(6): place(sfx, thunk(130, .12), S(274, .1) + k * .25, .5)                    # palms on the Trabi roof
place(sfx, engine2t(3.0), S(273, 0), .3)
for k in range(4): place(sfx, ting(2150, .3), S(284, .1) + k * .5, .4)                     # hammer and chisel
birds(CUT(287), CUT(291), 1.0)
place(sfx, engine2t(3.5), CUT(301) + .1, .3)
place(sfx, register(), S(305, .6), .6); [place(sfx, paper(.12), S(306, .3) + k * .15, .5) for k in range(4)]
place(sfx, scan_beep(), S(311, .4), .5); place(sfx, scan_beep(), S(313, .5), .5)
place(sfx, doorbell(), S(322, .55), .55); place(sfx, creak(.8, 110), S(324, .05), .7)
place(sfx, bell_tram() * .7, S(349, .3), .4)

# ---------------- mix ----------------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
v = np.frombuffer(raw, np.float32).copy(); voice = np.zeros(N, np.float32); voice[:min(N, len(v))] = v[:N]
ve = np.abs(voice); k = int(0.05 * SR); ve = np.convolve(ve, np.ones(k) / k, "same"); act = np.clip(ve / (np.percentile(ve, 95) * .35), 0, 1)
duck_fx = 1 - (1 - 10 ** (-10 / 20)) * act          # effects -10 dB while the voice speaks
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2)) if np.any(np.abs(x) > 1e-6) else 1
vr = np.sqrt(np.mean(voice[act > .5] ** 2))
music *= (vr * 10 ** (-27 / 20)) / rms(music)          # music bed ~27 dB under the voice, then ducked further
music *= 1 - .5 * act
sfx *= (vr * 10 ** (-9 / 20)) / np.max(np.abs(sfx)) * 2.2
mix = voice + music + sfx * duck_fx
pk = np.max(np.abs(mix)); mix = mix / pk * .7
fade = int(1.2 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open("mix_raw.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('music vs voice dB', round(20 * np.log10(rms(music) / vr), 1), 'sfx peak vs voice rms dB', round(20 * np.log10(np.max(np.abs(sfx)) / vr), 1))
