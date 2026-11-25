"""Sound for "Die Mauer fiel aus Versehen": procedural SFX + low music under the user's voice-over.
   python3 mix_audio.py <vo.mp3> <out_dir>     -> out_dir/mix_raw.wav (+ stems)
   Music sits >= 26 dB under the speech; SFX duck by ~10 dB while the voice speaks. Final -14 LUFS is done with ffmpeg loudnorm."""
import sys, subprocess, json, numpy as np
from scipy import signal

SR = 48000
DUR = 1376 / 30
N = int(round(DUR * SR))
rng = np.random.default_rng(7)
vo_path, out = sys.argv[1], sys.argv[2]

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).copy(); b = np.zeros(N, np.float32); b[:min(N, len(a))] = a[:N]; return b
def save(path, x):
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x, x], 1)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', path], input=x.tobytes())
def lufs(path):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(r.split('I:')[-1].split('LUFS')[0])

T = lambda n: np.arange(n) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(n): return rng.standard_normal(n).astype(np.float64)
def expdec(n, tau): return np.exp(-T(n) / tau)
def add(buf, t, x, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(x) <= 0: return
    x = x[max(0, -i):]; i = max(0, i); x = x[:N - i]
    buf[i:i + len(x), 0] += x * g * (1 - max(0, pan)); buf[i:i + len(x), 1] += x * g * (1 + min(0, pan))
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)

# ---------------- SFX generators ----------------
def flash():
    n = int(.12 * SR); tt = T(n); whine = np.sin(2 * np.pi * (2200 * tt + 18000 * tt ** 2)) * np.linspace(0, 1, n) * .15
    m = int(.09 * SR); pop = lp(noise(m), 3500) * expdec(m, .015) * 1.0 + np.sin(2 * np.pi * 110 * T(m)) * expdec(m, .03) * .8
    return np.concatenate([whine, pop])
def shutter():
    def click(): m = int(.012 * SR); return hp(noise(m), 1800) * expdec(m, .002)
    out = np.zeros(int(.12 * SR)); c = click(); out[:len(c)] += c; i = int(.065 * SR); out[i:i + len(c)] += c * .8; return out
def paper(d):
    n = int(d * SR); x = bp(noise(n), 1200, 7500)
    env = np.abs(lp(noise(n), 18)); env = env / env.max(); spikes = (rng.random(n) < 30 / SR) * rng.random(n) * 3
    env = env + lp(spikes, 60) * 20; env *= np.minimum(1, T(n) / .03) * np.minimum(1, (d - T(n)) / .06)
    return x * env * .5
def tick(hi=True):
    n = int(.06 * SR); f = 2600 if hi else 2050
    return (np.sin(2 * np.pi * f * T(n)) * expdec(n, .008) + hp(noise(n), 3000) * expdec(n, .002) * .6) * .7
def marker(d=.4):
    n = int(d * SR); tt = T(n); strokes = np.abs(np.sin(2 * np.pi * 5.5 * tt)) ** .6
    x = bp(noise(n), 2200, 6500) * strokes * .5 + np.sin(2 * np.pi * (1700 + 120 * np.sin(2 * np.pi * 7 * tt)) * tt) * .05 * strokes
    return x * np.minimum(1, tt / .02) * np.minimum(1, (d - tt) / .05)
def step(heavy=1.0):
    n = int(.11 * SR); return (lp(noise(n), 260) * expdec(n, .025) * 1.6 + hp(noise(n), 2500) * expdec(n, .004) * .35) * heavy
def voice_babble(d, n_voices=14, f0=(95, 230), brightness=2800, syll=4.0, seed=1):
    r = np.random.default_rng(seed); n = int(d * SR); out = np.zeros(n)
    forms = [(700, 1200), (400, 2000), (300, 800), (500, 1500), (650, 1700), (350, 2300)]
    for v in range(n_voices):
        f = r.uniform(*f0); tt = T(n); ph = np.cumsum(f * (1 + .04 * np.sin(2 * np.pi * r.uniform(.3, 1) * tt)) / SR)
        src = 2 * (ph % 1) - 1
        seg_len = int(r.uniform(.12, .3) * SR); y = np.zeros(n)
        for s0 in range(0, n, seg_len):
            f1, f2 = forms[r.integers(len(forms))]; s1 = min(n, s0 + seg_len)
            y[s0:s1] = bp(src[s0:s1], f1 * .8, f1 * 1.25, 1) + .6 * bp(src[s0:s1], f2 * .85, f2 * 1.2, 1)
        am = np.clip(np.sin(2 * np.pi * (syll * r.uniform(.7, 1.3)) * tt + r.uniform(0, 6)), 0, 1) ** .7
        gate = (lp(r.standard_normal(n), 1.2) > -.2).astype(float); gate = lp(gate, 8)
        out += y * am * gate * r.uniform(.5, 1)
    out = lp(out, brightness) + bp(noise(n), 300, 2500) * .05
    return out / (np.sqrt(np.mean(out ** 2)) + 1e-9) * .1
def chant_word(word, nv=30, seed=3):
    r = np.random.default_rng(seed); d = .34 if word == 'tor' else .42; n = int(d * SR); tt = T(n); out = np.zeros(n)
    for v in range(nv):
        f = r.uniform(110, 260) * (1.0 if word == 'tor' else 1.08); jit = r.uniform(-.02, .02)
        src = 2 * ((np.cumsum(np.full(n, f) * (1 + .02 * np.sin(2 * np.pi * 5 * tt))) / SR) % 1) - 1
        if word == 'tor': y = bp(src, 380, 560, 1) + .7 * bp(src, 700, 950, 1)
        else:
            k = np.clip(tt / d, 0, 1); a = bp(src, 650, 950, 1) + .7 * bp(src, 1100, 1400, 1); u = bp(src, 260, 400, 1) + .5 * bp(src, 650, 900, 1)
            y = a * (1 - k) + u * k
        sh = int(abs(jit) * SR); y = np.roll(y, sh); out += y * r.uniform(.6, 1)
    env = np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .08)
    cons = hp(noise(int(.03 * SR)), 2500) * .4 if word == 'tor' else lp(noise(int(.05 * SR)), 1500) * .1
    out = out * env; out[:len(cons)] += cons * np.sqrt(np.mean(out ** 2)) * 8
    return out / (np.max(np.abs(out)) + 1e-9)
def dial():
    n = int(.75 * SR); out = np.zeros(n); c = hp(noise(int(.006 * SR)), 1500) * expdec(int(.006 * SR), .0015)
    for i in range(9): j = int((.02 + i * .028) * SR); out[j:j + len(c)] += c * .6   # winding ratchet
    for i in range(6): j = int((.34 + i * .066) * SR); out[j:j + len(c)] += c * 1.0  # return pulses
    hum = np.sin(2 * np.pi * 50 * T(n)) * .02; return out + hum
def creak(d):
    n = int(d * SR); tt = T(n); rate = 55 + 30 * np.sin(2 * np.pi * .7 * tt) + 15 * lp(noise(n), 3) * 20
    ph = np.cumsum(np.clip(rate, 20, 120) / SR); pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float)
    pulses *= .5 + .5 * np.abs(lp(noise(n), 4)) * 10
    y = bp(pulses, 650, 800, 2) * 3 + bp(pulses, 1350, 1600, 2) * 2 + bp(pulses, 2800, 3300, 2)
    motor = (np.sin(2 * np.pi * 50 * tt) + .4 * np.sin(2 * np.pi * 100 * tt)) * .05
    return (y / (np.max(np.abs(y)) + 1e-9) * .8 + motor) * np.minimum(1, tt / .1) * np.minimum(1, (d - tt) / .15)
def clunk():
    n = int(.9 * SR); tt = T(n)
    ring = sum(np.sin(2 * np.pi * f * tt) * a * expdec(n, dec) for f, a, dec in [(320, .5, .4), (870, .3, .25), (1560, .2, .15), (2410, .1, .1)])
    return ring * .6 + lp(noise(n), 180) * expdec(n, .05) * 1.5
def heartbeat():
    n = int(.5 * SR); out = np.zeros(n)
    for t0, a in [(0, 1), (.2, .7)]:
        m = int(.16 * SR); th = np.sin(2 * np.pi * 52 * T(m)) * expdec(m, .045) * a; j = int(t0 * SR); out[j:j + m] += th
    return lp(out, 150) * 2.2
def applause(d, dens=70):
    n = int(d * SR); out = np.zeros(n); c_len = int(.012 * SR)
    for _ in range(int(d * dens)):
        j = rng.integers(0, n - c_len); c = bp(noise(c_len), rng.uniform(900, 1500), rng.uniform(2500, 4500), 1) * expdec(c_len, .003)
        out[j:j + c_len] += c * rng.uniform(.3, 1)
    return out * np.minimum(1, T(n) / .3) * np.minimum(1, (d - T(n)) / .4) * 1.4
def cork():
    n = int(.08 * SR); tt = T(n); pop = np.sin(2 * np.pi * (500 * tt - 1800 * tt ** 2)) * expdec(n, .02) + lp(noise(n), 2500) * expdec(n, .006)
    m = int(1.6 * SR); fizz = hp(noise(m), 4000) * expdec(m, .5) * (.3 + .7 * (rng.random(m) > .97)) * .25
    return np.concatenate([pop * .9, fizz])
def hammer():
    n = int(.15 * SR); tt = T(n); return (sum(np.sin(2 * np.pi * f * tt) * expdec(n, .03) for f in (1800, 2900, 4300)) * .25 + hp(noise(n), 2000) * expdec(n, .004)) * .7
def whoosh(d=.45, up=True):
    n = int(d * SR); tt = T(n); x = noise(n); y = np.zeros(n); seg_ = 1200
    for s0 in range(0, n, seg_):
        k = s0 / n; f = 400 + 3000 * (k if up else 1 - k); y[s0:s0 + seg_] = bp(x[s0:s0 + seg_], f * .6, f * 1.4, 1)
    return y * np.sin(np.pi * tt / d) ** 2 * .6
def rumble(d):
    n = int(d * SR); return lp(noise(n), 120) * 2.5 * np.minimum(1, T(n) / .5) * np.minimum(1, (d - T(n)) / .5)

# ---------------- build SFX stem ----------------
sfx = np.zeros((N, 2))
FL = [(.04, -.4), (.95, .3), (1.65, -.1), (2.9, .4), (3.75, -.3), (4.6, .2), (7.0, -.4), (8.35, .4), (9.2, -.2), (10.4, .2), (16.2, -.3), (17.0, .3), (17.9, -.1), (21.62, 0)]
for t, pan in FL: add(sfx, t - .1, flash(), .55, pan); add(sfx, t + .03, shutter(), .5, -pan)
add(sfx, 0.0, whoosh(.5), .5)                                   # camera rush
for t0, t1, g in [(0, 2.3, .5), (3.7, 5.4, .45), (11.7, 18.4, .4), (25.4, 27.2, .45), (43.7, DUR, .45)]:   # press hall murmur + camera motors
    add(sfx, t0, voice_babble(t1 - t0, 10, (90, 200), 2000, 3.5, seed=int(t0 * 10)) * np.minimum(1, T(int((t1 - t0) * SR)) / .2), g)
add(sfx, 2.3, voice_babble(1.4, 18, (150, 320), 3500, 5, seed=5), 1.4)       # wall: cheering
for i in range(5): add(sfx, 2.45 + i * .22, hammer(), .6, .3)
add(sfx, 5.4, np.sin(2 * np.pi * 15600 * T(int(1.5 * SR))) * .015 + lp(noise(int(1.5 * SR)), 200) * .05, 1)   # CRT whine/hum
for i in range(3): add(sfx, 5.5 + i * .5, tick(i % 2 == 0), .5)
add(sfx, 7.35, paper(.5), .8, -.1); add(sfx, 8.1, paper(.6), .9); add(sfx, 9.7, paper(.5), .6)
add(sfx, 14.0, paper(.25) * .5 + lp(noise(int(.25 * SR)), 800) * .1, .5, .3)   # hand/coat rustle
for i in range(5): add(sfx, 16.25 + i * .2, paper(.22), .9, (-1) ** i * .2)       # leafing through papers
for i in range(3): add(sfx, 17.6 + i * .25, paper(.15), .5)
k = 0; tt_ = 18.45
while tt_ < 19.66: add(sfx, tt_, tick(k % 2 == 0), 1.0); tt_ += .4; k += 1   # clock ticks, stop at "sofort"
for i in range(2): add(sfx, 20.0 + i * .85, heartbeat(), 1.0)
add(sfx, 21.62, lp(noise(int(.25 * SR)), 1500) * expdec(int(.25 * SR), .05), .6)   # freeze "photo" thump
add(sfx, 23.0, paper(.3), .6)
for t in [3.85, 5.5, 15.12, 19.72, 23.15, 23.75, 33.3, 34.3, 38.3, 40.52]: add(sfx, t, marker(.42), .9)
for i in range(6): add(sfx, 27.25 + i * .15, step(1.2), .9, .2)                   # stairs
for i in range(8): add(sfx, 28.15 + i * .13, step(.8), .6, -.2)                   # running on the street
add(sfx, 27.2, voice_babble(3.3, 16, (110, 260), 2600, 4.5, seed=11), 1.2)      # street + crowd murmur
add(sfx, 28.8, rumble(1.6) * .4 + voice_babble(1.6, 20, (100, 240), 2000, 4, seed=12) * .9, 1)
add(sfx, 30.4, voice_babble(1.9, 24, (140, 300), 3200, 5, seed=13), 1.5)        # agitated crowd
for t, w in [(30.45, 'tor'), (30.78, 'auf'), (31.85, 'tor'), (32.15, 'auf')]: add(sfx, t, chant_word(w, seed=int(t * 10)), .55)
add(sfx, 32.3, dial(), .9, .1)
add(sfx, 32.3, voice_babble(1.9, 14, (120, 280), 1200, 5, seed=14), .7)          # muffled crowd through the window
add(sfx, 34.2, voice_babble(.9, 14, (120, 260), 2000, 4, seed=15), .6)
add(sfx, 34.33, tick(True), 1.2); add(sfx, 34.35, lp(noise(int(.05 * SR)), 900) * expdec(int(.05 * SR), .01), .8)  # minute hand jump
add(sfx, 35.1, voice_babble(.4, 14, (120, 260), 2000, 4, seed=16) * np.linspace(1, .4, int(.4 * SR)), .6)
add(sfx, 35.1, heartbeat(), 1.0)
add(sfx, 35.5, creak(1.95), .8, -.3); add(sfx, 37.45, clunk(), .9, -.3)
# 37.5 – 38.25: one second of near silence
add(sfx, 38.25, voice_babble(1.3, 26, (150, 330), 3600, 6, seed=17), 1.6)          # release: crowd roar
for i in range(10): add(sfx, 38.3 + i * .12, step(.9), .7, (-1) ** i * .3)        # running feet
for i in range(12): add(sfx, 38.35 + i * .1 + rng.uniform(0, .05), step(.5), .5, rng.uniform(-.6, .6))
add(sfx, 39.5, applause(2.3), .9); add(sfx, 39.5, voice_babble(4.2, 22, (150, 320), 3500, 6, seed=18), 1.1)
add(sfx, 39.62, cork(), 1.0, -.3)
add(sfx, 41.7, whoosh(.3, False), .4); add(sfx, 43.65, whoosh(.4, True), .5)
add(sfx, 43.7, flash(), .5); add(sfx, 43.75, shutter(), .5)

# ---------------- music ----------------
mus = np.zeros(N); tt = T(N)
drone_end = 37.45
d_env = np.clip(tt / 1.5, 0, 1) * np.clip((drone_end - tt) / .08, 0, 1) * (1 + .6 * np.clip((tt - 30) / 7.4, 0, 1))
drone = (np.sin(2 * np.pi * 55 * tt) + .7 * np.sin(2 * np.pi * 55.4 * tt) + .5 * np.sin(2 * np.pi * 82.4 * tt + .5 * np.sin(2 * np.pi * .2 * tt)) + .25 * np.sin(2 * np.pi * 110.3 * tt))
drone *= (.7 + .3 * np.sin(2 * np.pi * .13 * tt)); drone += lp(noise(N), 300) * .4
mus += drone * d_env
# slow moment: drop the drone a little under "sofort", swell before the barrier
mus *= 1 - .4 * np.clip(1 - np.abs(tt - 20) / 1.5, 0, 1)
def piano_note(f, d, a=1.0):
    n = int(d * SR); t_ = T(n); y = np.zeros(n)
    for h in range(1, 8): fh = f * h * (1 + .0004 * h * h); y += np.sin(2 * np.pi * fh * t_) * (1 / h ** 1.3) * expdec(n, 1.6 / h ** .6)
    y += lp(noise(n), 3000) * expdec(n, .004) * .2
    return y * np.minimum(1, t_ / .004) * a
chords = [(38.3, [261.6, 329.6, 392.0], 523.3), (40.2, [246.9, 293.7, 392.0], 587.3), (42.1, [220.0, 261.6, 329.6], 659.3), (44.0, [174.6, 220.0, 261.6], 523.3)]
for t0, notes, top in chords:
    for i, f in enumerate([notes[0] / 2] + notes): pn = piano_note(f, 3.0, .5 if i else .7); j = int((t0 + i * .05) * SR); mus[j:j + len(pn)] += pn[:max(0, N - j)]
    pn = piano_note(top, 2.5, .45); j = int((t0 + .55) * SR); mus[j:j + len(pn)] += pn[:max(0, N - j)]
mus *= np.clip((DUR - tt) / .4, 0, 1)

# ---------------- levels + ducking ----------------
vo = load(vo_path)
win = int(.03 * SR); e = np.sqrt(np.convolve(vo ** 2, np.ones(win) / win, 'same'))
act = (e > .02).astype(float)
# attack 20 ms, release 250 ms
k_a, k_r = 1 - np.exp(-1 / (.02 * SR)), 1 - np.exp(-1 / (.25 * SR)); g = np.zeros(N); s_ = 0.0
for i in range(0, N, 48):
    tgt = act[i]; s_ += (tgt - s_) * (1 - (1 - (k_a if tgt > s_ else k_r)) ** 48); g[i:i + 48] = s_
duck = 1 - (1 - 10 ** (-10 / 20)) * g          # -10 dB while speaking
save(f'{out}/stem_vo.wav', vo); save(f'{out}/stem_sfx_raw.wav', sfx); save(f'{out}/stem_mus_raw.wav', mus)
L_vo, L_sfx, L_mus = lufs(f'{out}/stem_vo.wav'), lufs(f'{out}/stem_sfx_raw.wav'), lufs(f'{out}/stem_mus_raw.wav')
g_sfx = 10 ** ((L_vo - 4 - L_sfx) / 20)          # SFX bed sits ~4 LU under the voice before ducking
g_mus = 10 ** ((L_vo - 28.5 - L_mus) / 20)       # music ~27 LU under the voice (measured)
sfx_f = sfx * g_sfx * duck[:, None]; mus_f = mus * g_mus
save(f'{out}/stem_sfx.wav', sfx_f); save(f'{out}/stem_mus.wav', mus_f)
mix = np.stack([vo, vo], 1) + sfx_f + mus_f[:, None]
save(f'{out}/mix_raw.wav', mix)
print(json.dumps({'L_vo': L_vo, 'L_sfx_raw': L_sfx, 'L_mus_raw': L_mus, 'L_sfx': lufs(f'{out}/stem_sfx.wav'), 'L_mus': lufs(f'{out}/stem_mus.wav'), 'L_mix': lufs(f'{out}/mix_raw.wav')}))
