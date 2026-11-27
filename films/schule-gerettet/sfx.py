# Code-generated SFX for the draft (no hum/drone anywhere). Writes sfx_draft.wav (48 kHz mono) aligned to film time.
import numpy as np, wave, sys
SR = 48000; DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 20.8
out = np.zeros(int(SR * (DUR + 1)))
rng = np.random.default_rng(7)
def add(t, x, g=1.0):
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

# ---- timeline ----
add(.15, tick(), .5); add(.45, tick(.92), .5)                          # black: tick, tock
for i in range(3): add(.55 + i * .33, tick(1 if i % 2 == 0 else .92), .55)
add(1.54, clack(), .7)                                                  # 10:17 clack
add(1.25, whoosh(.35, True), .35); add(1.6, impact(), .75)               # cold-open hit
alarm_triplets(1.66, 1, .16)                                            # alarm teaser under the voice
add(2.9, whoosh(.3, False), .25)
for i in range(3): add(4.05 + i * .25, chalk(.18), .5)                   # chalk on the board
for k in range(7): add(4.9 + k * .16 + rng.uniform(0, .05), chirp(), .2)  # birds outside
for i in range(3): add(6.06 + i * 1.0, tick(.95 if i % 2 else 1.05, .03), .5)  # slow ticks
for i in range(2): add(8.3 + i * 1.0, tick(1, .03), .3)
for i in range(3): add(9.87 + i * .3, tick(.8, .03), .55)                 # backwards ticks (lower)
step = (12.38 - 10.78) / 4
for i in range(4): add(10.78 + i * step, tick(1 if i % 2 == 0 else .92, .025), .6)
add(12.38, clack(), .9)
add(12.6, whoosh(.3, True), .4); add(12.9, impact(1.1), .8)               # alarm hit
end = alarm_triplets(13.05, 1, .3)                                      # 3 short + 3 short (loud before the voice line)
alarm_triplets(end, 6, .1)                                              # keeps going quietly under the voice
for i in range(22): add(14.3 + i * .1 + rng.uniform(0, .05), click_dry(), .25 if rng.random() > .4 else 0)  # flicker clicks
for i in range(10): add(15.5 + i * .1, click_dry(), .3 if i % 3 else 0)
add(16.6, key_scrape(.4), .6); add(17.29, lock_click(), .9)            # key in, turn, Klick
for i in range(3): add(18.3 + i * .55, thump(), .55); add(18.42 + i * .55, thump(.6), .4)  # heartbeat
add(19.5, impact(.7), .5)
out = out[:int(SR * DUR)]
out = out / max(1e-9, np.max(np.abs(out))) * .7
w = wave.open('sfx_draft.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('ok', len(out) / SR)
