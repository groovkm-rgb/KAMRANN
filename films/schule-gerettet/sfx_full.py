# Code-generated SFX + light music for the whole film (no hum/drone anywhere). Writes sfx_full.wav (48 kHz mono), film time.
import numpy as np, wave, sys
SR = 48000; DUR = 694.75
out = np.zeros(int(SR * (DUR + 2)))
rng = np.random.default_rng(7)
def add(t, x, g=1.0):
    if x is None or len(x) == 0 or g == 0: return
    i = int(t * SR); n = min(len(x), len(out) - i)
    if n > 0: out[i:i + n] += x[:n] * g
def env(n, a=.002, d=.05):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, k=.2):  # one-pole low pass
    y = np.zeros_like(x); s = 0
    for i in range(len(x)): s += k * (x[i] - s); y[i] = s
    return y
def hp(x, k=.2): return x - lp(x, k)
def tick(pitch=1.0, dec=.018):
    n = int(SR * .08); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 3200 * pitch * t) * .6 + np.sin(2 * np.pi * 5100 * pitch * t) * .3 + hp(rng.standard_normal(n), .5) * .5) * env(n, .0005, dec)
    return x
def clack():  # minute hand jump: heavier mechanical click + small body thump
    n = int(SR * .25); t = np.arange(n) / SR
    return tick(.7, .03) [:n] if False else (np.sin(2*np.pi*1800*t)*.5 + hp(rng.standard_normal(n), .4)*.6) * env(n, .0005, .03) + np.sin(2*np.pi*140*t) * env(n, .002, .05) * .5
def impact(g=1):  # cinematic hit: noise burst + fast pitch-drop sine, short (no tail drone)
    n = int(SR * .9); t = np.arange(n) / SR
    f = 90 * np.exp(-t * 5) + 38; ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env(n, .003, .22) * 1.0 + lp(rng.standard_normal(n), .08) * env(n, .001, .09) * .8
    return x * g
def whoosh(dur=.5, up=True):
    n = int(SR * dur); t = np.arange(n) / SR; w = np.sin(np.pi * t / dur) ** 2
    nz = rng.standard_normal(n); y = np.zeros(n); s = 0
    for i in range(n): k = .02 + .25 * (i / n if up else 1 - i / n); s += k * (nz[i] - s); y[i] = s
    return y * w * 1.6
def beep(dur=.16, f=1450):
    n = int(SR * dur); t = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sign(np.sin(2 * np.pi * f * 1.5 * t)) * .25
    e = np.minimum(1, t / .004) * np.minimum(1, (dur - t) / .006)
    return lp(sq, .35) * e
def alarm_triplets(t0, reps, g):
    t = t0
    for r in range(reps):
        for k in range(3): add(t + k * .26, beep(), g)
        t += .26 * 3 + .45
    return t
def chirp():
    n = int(SR * .12); t = np.arange(n) / SR; f = 3800 + 1600 * np.sin(np.pi * t / .12) + rng.uniform(-300, 300)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .12) ** 2 * .5
def chalk(dur):
    n = int(SR * dur); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), .6) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 7 * t))) * np.minimum(1, t / .02) * np.minimum(1, (dur - t) / .03)
    return x * .35
def click_dry(): n = int(SR * .03); return hp(rng.standard_normal(n), .7) * env(n, .0003, .004)
def lock_click():
    n = int(SR * .2); t = np.arange(n) / SR
    a = (hp(rng.standard_normal(n), .5) * env(n, .0003, .006) + np.sin(2 * np.pi * 2600 * t) * env(n, .0003, .01) * .6)
    b = np.zeros(n); i = int(.06 * SR); b[i:] = a[:n - i] * .8
    return a + b
def key_scrape(dur=.35):
    n = int(SR * dur); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), .45) * (.3 + .7 * (np.sin(2 * np.pi * 23 * t) > .2)) * np.sin(np.pi * t / dur) * .3
def thump(g=1):
    n = int(SR * .25); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (60 + 30 * np.exp(-t * 30)) * t) * env(n, .004, .07) * g


# ================= Bölüm 1 (0 – 36.95) =================
def s01():
    add(.05, tick(), .45); add(.55, tick(.92), .4); add(1.05, tick(), .4)          # calm ticks during the flight
    add(1.2, whoosh(.42, True), .35); add(1.62, impact(), .8)                       # alarm burst at the vertigo
    alarm_triplets(1.68, 1, .16)
    add(2.9, whoosh(.3, False), .25)
    for i in range(3): add(4.05 + i * .25, chalk(.18), .5)
    for k in range(7): add(4.9 + k * .16 + rng.uniform(0, .05), chirp(), .2)
    for i in range(3): add(6.06 + i * 1.0, tick(.95 if i % 2 else 1.05, .03), .5)
    for i in range(2): add(8.3 + i * 1.0, tick(1, .03), .3)
    for i in range(3): add(9.87 + i * .3, tick(.8, .03), .55)
    step = (12.38 - 10.78) / 4
    for i in range(4): add(10.78 + i * step, tick(1 if i % 2 == 0 else .92, .025), .6)
    add(12.38, clack(), .9)
    add(12.6, whoosh(.3, True), .4); add(12.9, impact(1.1), .8)
    end = alarm_triplets(13.05, 1, .3); alarm_triplets(end, 6, .1)
    for i in range(22): add(14.3 + i * .1 + rng.uniform(0, .05), click_dry(), .25 if rng.random() > .4 else 0)
    for i in range(10): add(15.5 + i * .1, click_dry(), .3 if i % 3 else 0)
    add(16.6, key_scrape(.4), .6); add(17.29, lock_click(), .9)
    for i in range(3): add(18.3 + i * .55, thump(), .55); add(18.42 + i * .55, thump(.6), .4)
    add(19.5, impact(.7), .5)
    for i in range(4): add(20.2 + i * 1.0, tick(.8, .03), .3)                        # timer seconds
    add(23.9, whoosh(.5, True), .25); add(24.4, impact(.5), .35)
    for i in range(10): add(24.6 + i * .13, tick(1.3, .01), .18)                     # counter ticking up
    for k in range(5): add(27.2 + k * .5 + rng.uniform(0, .2), chirp(), .12)
    add(30.3, whoosh(.4, True), .3); add(30.6, impact(1.2), .8)                      # title hit
    add(32.1, whoosh(.6, False), .15)
    rw = whoosh(1.4, True); add(35.4, rw, .4)                                       # rewind
    for i in range(14): add(35.45 + i * .095, tick(1.4, .008), .25)
    add(36.85, impact(.4), .25)


# ---------- more instruments (all short, percussive; no sustained tones) ----------
def step(g=1, metal=False, soft=False):
    n = int(SR * .18); t = np.arange(n) / SR
    if metal: x = (np.sin(2*np.pi*420*t) + .6*np.sin(2*np.pi*1130*t) + .4*np.sin(2*np.pi*1870*t)) * env(n, .001, .09) + hp(rng.standard_normal(n), .3) * env(n, .001, .01)
    else: x = lp(rng.standard_normal(n), .12 if not soft else .05) * env(n, .002, .04) * 2 + np.sin(2*np.pi*80*t) * env(n, .003, .05)
    return x * g
def squeak(dur=.5):
    n = int(SR * dur); t = np.arange(n) / SR; f = 900 + 400 * np.sin(2*np.pi*3*t) + rng.uniform(-50, 50)
    return np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * .25 * np.sin(np.pi*t/dur) * (.6 + .4*np.sin(2*np.pi*23*t))
def knack():
    n = int(SR * .25); return hp(rng.standard_normal(n), .5) * env(n, .0005, .02) + hp(rng.standard_normal(n), .7) * env(n, .0005, .12) * .15
def thud(g=1):
    n = int(SR * .6); t = np.arange(n) / SR
    return (np.sin(2*np.pi*(55 + 40*np.exp(-t*20))*t) * env(n, .002, .14) + lp(rng.standard_normal(n), .05) * env(n, .001, .05)) * g
def bang(g=1):
    n = int(SR * 1.0); t = np.arange(n) / SR
    return (np.sin(2*np.pi*(70 + 60*np.exp(-t*25))*t) * env(n, .001, .2) + (np.sin(2*np.pi*310*t) + .5*np.sin(2*np.pi*740*t)) * env(n, .001, .12) * .5 + hp(rng.standard_normal(n), .3) * env(n, .0005, .03)) * g
def flap(dur=.9):
    out_ = np.zeros(int(SR * dur))
    for i in range(int(dur * 14)): 
        n = int(SR * .05); x = lp(rng.standard_normal(n), .25) * env(n, .002, .015); j = int(i / 14 * SR); out_[j:j+n] += x[:len(out_)-j] * (.7 + .3*rng.random())
    return out_
def vib_tick():  # phone vibration as a dry tick-tick rhythm (no hum)
    n = int(SR * .02); return hp(rng.standard_normal(n), .6) * env(n, .0003, .004)
def siren(t0, dur, g, far=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    f = np.where((t % 1.4) < .7, 680, 900)  # German "Martinshorn" two-tone (short notes, keeps moving)
    x = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * .3; x = lp(x, .25)
    e = np.minimum(1, t / .3) * np.minimum(1, (dur - t) / .3) * np.linspace(.15 * far, 1, n)
    add(t0, x * e, g)
def clap_burst(t0, dur, density, g):
    for i in range(int(dur * density)):
        n = int(SR * .03); x = hp(rng.standard_normal(n), .5) * env(n, .0005, .006); add(t0 + rng.uniform(0, dur), x, g * rng.uniform(.4, 1))
def crowd_cheer(t0, dur, g):
    n = int(SR * dur); x = lp(rng.standard_normal(n), .08) * np.minimum(1, np.arange(n) / SR / .4) * np.minimum(1, (dur - np.arange(n) / SR) / .5); add(t0, x * .5, g)
def chant(t0, g):  # "No-ah!" crowd: two short vowel-ish formant bursts
    for k, f in enumerate([520, 380]):
        n = int(SR * .28); t = np.arange(n) / SR
        x = sum(np.sin(2*np.pi*(f*m + rng.uniform(-8, 8))*t) for m in (1, 2, 3)) * env(n, .03, .12)
        for v in range(6): add(t0 + k * .32 + v * .008, x * rng.uniform(.6, 1), g / 6)
def pluck(f, dur=.6):
    n = int(SR * dur); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f*t) + .3*np.sin(2*np.pi*2*f*t) + .1*np.sin(2*np.pi*3*f*t)) * env(n, .004, dur * .3)
def tension(t0, t1, g=.08, bpm=72):
    """very light tension music: a soft low pulse + rare high pluck (no drone)."""
    b = 60 / bpm; t = t0; i = 0
    while t < t1:
        add(t, pluck(55 if i % 4 else 49, .45), g); add(t + b / 2, pluck(55, .3), g * .5)
        if i % 8 == 6: add(t, pluck(440 + 30 * (i % 3), .9), g * .35)
        t += b; i += 1
def warm(t0, t1, g=.07):
    """soft warm piano-like arpeggios: C - G - Am - F."""
    chords = [[261.6, 329.6, 392.0, 523.3], [196.0, 246.9, 293.7, 392.0], [220.0, 261.6, 329.6, 440.0], [174.6, 220.0, 261.6, 349.2]]
    t = t0; i = 0
    while t < t1:
        ch = chords[(i // 8) % 4]; add(t, pluck(ch[i % 4], 1.4), g * (1 if i % 4 == 0 else .7)); t += .32; i += 1
def ding(f=1200): n = int(SR * .5); t = np.arange(n) / SR; return np.sin(2*np.pi*f*t) * env(n, .002, .15)

def s02():
    for k in range(6): alarm_bell = None
    def rring(t0, dur):
        n = int(SR * dur); t = np.arange(n) / SR; x = np.sign(np.sin(2*np.pi*1900*t)) * (np.sin(2*np.pi*22*t) > 0) * .3; add(t0, lp(x, .4) * np.minimum(1, (dur - t) / .05), .35)
    rring(37.0, 1.8); add(39.36, thud(.5), .5); rring(39.7, .4); add(40.3, thud(.5), .5); rring(40.7, .4); add(41.25, thud(.5), .5)
    add(42.2, key_scrape(.5), .3); add(42.4, step(.6), .4)
    add(44.94, whoosh(.25, True), .4); add(45.05, impact(.6), .5)
    for i in range(14): add(46.4 + i * .19, step(.8), .5)
    add(47.6, whoosh(.6), .2)
    n = int(SR * 2.5); add(48.4, lp(rng.standard_normal(n), .03) * np.linspace(0, 1, n) * .6, .35)  # bus arriving
    for i in range(9): add(49.3 + i * .5, click_dry(), .05)
    for k in range(5): add(57.5 + k * .4 + rng.uniform(0, .2), chirp(), .12)
    add(62.3, ding(900), .15); add(64.45, ding(1500), .2)
    add(65.2, whoosh(.5, True), .25); warm(65.3, 70.2, .045)
    for i in range(6): add(68.6 + i * .3, step(1.0), .5)
    add(70.35, impact(.3), .3)
    for i in range(4): add(77.0 + i * .5, chalk(.3), .45)
    add(79.4, whoosh(.3), .2)
    for i in range(12): add(81.6 + i * .25, chalk(.08), .25)
    for i in range(3): add(90.6 + i * 1.0, tick(.95, .03), .35)
    add(93.9, whoosh(.4, True), .2)
def s03():
    for i in range(2): add(94.35 + i * .3, tick(1, .025), .5)
    add(94.85, clack(), .8)
    t = alarm_triplets(96.6, 1, .32); alarm_triplets(98.97, 1, .32)
    for i in range(10): add(100.1 + i * .12, click_dry(), .08)
    add(104.84, knack(), .7)
    for i in range(3): add(106.2 + i * 1.1, click_dry(), .05)
    add(120.4, thump(.9), .5); [add(120.4 + i * .8, thump(), .45) or add(120.52 + i * .8, thump(.6), .35) for i in range(4)]
    for i in range(6): add(123.9 + i * .22, step(.9), .5)
    add(125.6, key_scrape(.4), .6); add(126.31, lock_click(), .9)
    for i in range(4): add(140.6 + i * .8, squeak(.6), .35)
    add(142.1, squeak(1.0), .45); add(143.3, squeak(.8), .4)
    for i in range(10): add(145.3 + i * .2, step(.5, soft=True), .3)
    for i in range(20): add(148.85 + i * .04, click_dry(), .03)
def s04():
    tension(154.35, 205.2, .07)
    for i in range(3): add(154.5 + i * 1.2, tick(.8, .04), .35)
    for i in range(6): add(159.1 + i * .55, step(1.3), .7)
    add(162.25, step(1.8), .9); add(162.25, thud(.7), .6)
    for i in range(3): add(163.4 + i * .55, step(1.0), .5)
    add(165.0, step(1.2), .6)
    for i in range(3): add(166.7 + i * .8, thump(.8), .35)
    add(170.2, whoosh(.5, False), .2)
    n = int(SR * 2.2); t = np.arange(n) / SR; add(179.7, hp(rng.standard_normal(n), .4) * .15 * (np.sin(2*np.pi*11*t) > .6), .5)  # handle creak (clicky)
    add(182.55, lock_click(), .8); add(182.6, thud(.6), .5)
    for i in range(7): add(185.3 + i * .5, step(1.0 - i * .12), .5)
    for i in range(4): add(192.3 + i * .45, step(.9), .5)
    for i in range(4): add(200.8 + i * .5, tick(1.2, .01), .3)
def s05():
    add(212.9, ding(880), .06); add(215.3, ding(1320), .09); add(216.8, ding(1760), .14); add(217.2, impact(.3), .25)
    add(218.2, whoosh(.3, True), .3); warm(218.3, 237.6, .035)
    add(233.2, ding(1600), .12)
    add(237.7, whoosh(.4), .2); add(240.5, lock_click(), .4); add(246.4, lock_click(), .8)
    add(247.7, whoosh(.6, True), .3)
    for i in range(6): add(255.3 + i * .12, chalk(.06), .3)
    add(258.0, chalk(.6), .4); add(259.3, impact(.5), .4)
    for i in range(3): add(266.2 + i * .4, knack(), .15)
    add(269.2, ding(990), .15)
def s06():
    add(280.95, thud(.5), .5); add(283.5, bang(.4), .35)
    for i in range(12): add(283.6 + i * .2, step(.8), .35)  # door rattle
    add(293.0, whoosh(.6, True), .2)
    add(308.4, thump(.8), .3)
def s07():
    tension(309.3, 352.9, .07, 84)
    for i in range(3): add(311.1 + i * .45, step(1.0, metal=True), .55)
    for i in range(8): add(315.6 + i * .22, step(.4, soft=True), .25)
    for k in range(4): add(317.5 + k * .9, chirp(), .08)
    for i in range(16): add(326.0 + i * .2, step(.7), .4)
    add(334.73, thud(.4), .3); add(335.65, whoosh(.5, False), .3)
    add(339.15, ding(2200), .18); add(340.3, key_scrape(.3), .25)
    for i in range(8): add(342.7 + i * .5, step(.3, soft=True), .2)
def s08():
    for i in range(8): add(353.0 + i * .26, step(.6, metal=True), .35)
    add(358.16, click_dry(), .7); add(358.2, knack(), .4); add(358.9, ding(600), .08)
    n = int(SR * 1.4); t = np.arange(n) / SR; add(364.5, lp(rng.standard_normal(n), .04) * np.sin(np.pi * t / 1.4) * .5, .3)  # breath
    add(374.0, knack(), .5)
    for i in range(3): add(383.7 + i * .6, whoosh(.5, False), .1)
def s09():
    tension(398.6, 479.3, .075, 90)
    for i in range(4): add(405.4 + i * .5, step(.9), .4)
    for i in range(8): add(409.4 + i * .28, step(.35, soft=True), .2)
    for i in range(4): add(415.15 + i * .55, step(1.3), .7)
    for i in range(5): add(417.0 + i * .55, step(1.2), .6)
    for i in range(4): add(421.3 + i * .4, step(.9), .4)
    for k in range(int(5.0 / .12)): add(430.4 + k * .12 + (k // 3) * .1, vib_tick(), .45)  # tick-tick rhythm
    add(438.5, impact(.4), .35)
    add(445.5, flap(1.2), .7); add(446.4, thud(.4), .5); add(446.6, flap(.8), .5)
    for i in range(10): add(451.7 + i * .15, step(.9), .5)
    add(455.08, bang(1.2), 1.0)
    add(456.0, key_scrape(.4), .5); add(457.23, lock_click(), 1.0)
    for i in range(7): add(458.6 + i * .45, bang(.6), .55)
    add(461.7, ding(400), .08); add(467.2, impact(.6), .45)
    n = int(SR * 1.2); add(468.8, lp(rng.standard_normal(n), .06) * np.linspace(1, 0, n) * .4, .3)
    siren(476.5, 3.0, .08, .2)
def s10():
    siren(479.4, 5.0, .25, .25); siren(484.4, 4.0, .3, 1)
    for i in range(14): add(485.0 + i * .2, step(1.0), .3)
    for i in range(6): add(488.0 + i * .3, step(1.0), .5)
    add(490.9, ding(2000), .12)
    for i in range(10): add(496.2 + i * .45, step(.8), .3)
    add(498.6, lock_click(), .4)
    for i in range(20): add(507.7 + i * .2, step(.5, soft=True), .15)
    clap_burst(529.1, 2.5, 6, .2); crowd_cheer(529.0, 2.8, .12)
    warm(512.3, 531.9, .04)
def s11():
    for i in range(3): add(533.9 + i * 1.0, tick(.8, .03), .3)
    add(534.5, flap(.6), .3); add(535.8, bang(.5), .35); add(536.84, lock_click(), .5)
    for k in range(6): add(538.0 + k * .5, chirp(), .1)
    for i in range(6): add(543.8 + i * .35, step(.7), .35)
    clap_burst(553.8, 1.7, 5, .25); clap_burst(555.5, 2.5, 25, .3); clap_burst(558.0, 4.8, 60, .3); crowd_cheer(556.3, 6.5, .18)
    for ts in (560.05, 560.98, 561.79): chant(ts, .5)
    add(571.9, ding(1800), .15)
    add(584.6, None if False else np.zeros(1), 0); crowd_cheer(584.58, 1.6, .2); clap_burst(590.8, 1.0, 20, .2)
    add(593.2, whoosh(.4), .15); clap_burst(594.9, 1.2, 25, .25)
    add(599.4, whoosh(.8, True), .15); crowd_cheer(599.4, 1.8, .12)
    for i in range(6): add(613.0 + i * 1.0 + rng.uniform(0, .3), click_dry(), .5); add(613.0 + i * 1.0, ding(3000), .05)
    add(619.0, ding(700), .1); add(620.5, thud(.3), .3)
    clap_burst(629.6, 2.8, 40, .3); crowd_cheer(629.6, 2.8, .2)
    warm(537.7, 638.9, .045)
def s12():
    warm(638.9, 694.7, .05)
    for k in range(5): add(639.5 + k * 1.7, chirp(), .05)
    for ts in (651.3, 654.66, 658.89, 661.68): add(ts, whoosh(.3), .12); add(ts + .3, click_dry(), .3)
    add(666.7, lock_click(), .5); add(666.75, ding(1320), .12)
    add(682.53, impact(.5), .3); add(690.5, flap(.6), .25)
    add(692.3, ding(1046), .1)

SECTIONS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12]

if __name__ == '__main__':
    for f in SECTIONS: f()
    o = out[:int(SR * DUR)]; o = o / max(1e-9, np.max(np.abs(o))) * .7
    w = wave.open('sfx_full.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((o * 32767).astype(np.int16).tobytes()); w.close()
    print('ok sfx', len(o) / SR)
