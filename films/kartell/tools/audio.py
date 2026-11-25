# Sound for the Kartell film: synthesized SFX + very quiet dark music under the given voice-over.
#   python3 audio.py <voice.mp3> <cues.json> <out.wav> <start> <dur>
# cues.json: [{"fx": name, "t": seconds, "d": seconds, "g": dB}]  (times relative to the film start)
# SFX duck ~10 dB under speech; music stays >= 26 dB under the voice. Pure numpy, deterministic.
import json, sys, subprocess, numpy as np
SR = 48000
rng = np.random.default_rng(7)
def noise(n): return rng.standard_normal(n)
def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def lpf(x, hz):  # fast FFT low-pass
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > hz] *= np.exp(-(f[f > hz] - hz) / (hz * .25)); return np.fft.irfft(X, len(x))
def bpf(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = (f >= lo) & (f <= hi); X[~m] *= .02; return np.fft.irfft(X, len(x))
def env(n, a=.01, r=.05):
    e = np.ones(n); A = max(1, int(a * SR)); R = max(1, int(r * SR)); e[:A] = np.linspace(0, 1, A); e[-R:] *= np.linspace(1, 0, R); return e
def T(d): return np.arange(int(d * SR)) / SR
def norm(x): m = np.max(np.abs(x)) or 1; return x / m
# ---------- effect generators (each returns a mono array, peak ~1) ----------
def fx_pool(d):  # lapping water: low noise with slow swells + small bubbles
    t = T(d); x = lpf(noise(len(t)), 500) * (.6 + .4 * np.sin(2 * np.pi * .35 * t) ** 2)
    for k in range(int(d * 3)):
        p = int(rng.uniform(0, len(t) - 3000)); f = rng.uniform(600, 1400); tt = np.arange(2400) / SR; x[p:p + 2400] += .25 * np.sin(2 * np.pi * f * tt * (1 + tt * 8)) * np.exp(-tt * 60)
    return norm(x) * env(len(t), .4, .4)
def fx_cicadas(d):
    t = T(d); car = bpf(noise(len(t)), 4200, 6500); am = (np.sin(2 * np.pi * 38 * t) > .2) * (.5 + .5 * np.sin(2 * np.pi * .4 * t)); return norm(car * am) * env(len(t), .5, .5)
def fx_bird(d):
    t = T(d); x = np.zeros(len(t))
    for k in range(3):
        p = int((.3 + k * .45) * SR); n = int(.16 * SR); tt = np.arange(n) / SR; x[p:p + n] += np.sin(2 * np.pi * (2800 + 900 * np.sin(2 * np.pi * 14 * tt)) * tt) * np.sin(np.pi * tt / tt[-1])
    return norm(x)
def fx_hum(d, f0=100):
    t = T(d); x = .6 * np.sin(2 * np.pi * f0 * t) + .25 * np.sin(2 * np.pi * 2 * f0 * t) + .15 * lpf(noise(len(t)), 300); return norm(x) * env(len(t), .05, .1)
def fx_garage_door(d):
    t = T(d); x = lpf(noise(len(t)), 900) * (1 + .5 * np.sin(2 * np.pi * 11 * t)) + .5 * np.sin(2 * np.pi * 70 * t); return norm(x) * env(len(t), .1, .3)
def fx_counter(d, r0=9, r1=14):  # banknote counting machine: riffle of paper clicks + motor
    t = T(d); x = .25 * np.sin(2 * np.pi * 120 * t) * (1 + .2 * np.sin(2 * np.pi * 3 * t)); ph = 0; last = -1
    rate = r0 + (r1 - r0) * t / d; cyc = np.cumsum(rate) / SR
    for i in np.nonzero(np.diff(np.floor(cyc)) > 0)[0]:
        n = 900; seg = bpf(noise(n), 1500, 7000) * np.exp(-np.arange(n) / SR * 120); x[i:i + n] += seg[:len(x[i:i + n])] * 1.4
    return norm(x) * env(len(t), .05, .1)
def fx_tick(d, rate=1.0):
    t = T(d); x = np.zeros(len(t))
    for k in range(int(d * rate) + 1):
        p = int(k / rate * SR); n = 600
        if p + n < len(x): x[p:p + n] += bpf(noise(n), 2000, 6000) * np.exp(-np.arange(n) / SR * 300)
    return norm(x)
def fx_scribble(d):  # felt-tip pen strokes
    t = T(d); x = bpf(noise(len(t)), 1800, 6000) * (np.abs(np.sin(2 * np.pi * 3.2 * t)) ** .6); return norm(x) * env(len(t), .03, .05)
def fx_heart(d, bpm=62):
    t = T(d); x = np.zeros(len(t)); per = 60 / bpm
    for k in range(int(d / per) + 1):
        for off, a in ((0, 1), (.28, .7)):
            p = int((k * per + off) * SR); n = int(.15 * SR); tt = np.arange(n) / SR
            if p + n < len(x): x[p:p + n] += a * np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 30)
    return norm(x)
def fx_whoosh(d):
    t = T(d); x = bpf(noise(len(t)), 300, 3000) * np.sin(np.pi * t / d) ** 2; return norm(x)
def fx_tape(d):
    t = T(d); x = bpf(noise(len(t)), 3000, 12000) * .5 + .3 * np.sin(2 * np.pi * 50 * t); return norm(x) * env(len(t), .02, .05)
def fx_engine_slow(d):  # car slowing down: falling rumble + tyres
    t = T(d); f = 70 - 30 * np.clip(t / d, 0, 1); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .5 * np.sin(2 * ph) + .4 * lpf(noise(len(t)), 600) * (1 - t / d * .6); return norm(x) * env(len(t), .2, .3)
def fx_ceramic(d):
    t = T(d); x = bpf(noise(len(t)), 900, 2500) * (np.sin(2 * np.pi * 9 * t) > .6) * np.sin(np.pi * t / d); return norm(x)
def fx_road(d):
    t = T(d); x = lpf(noise(len(t)), 250) + .3 * np.sin(2 * np.pi * 45 * t); return norm(x) * env(len(t), .1, .2)
def fx_indicator(d):
    t = T(d); x = np.zeros(len(t))
    for k in range(int(d * 2.6)):
        p = int(k / 2.6 * SR); n = 700
        if p + n < len(x): x[p:p + n] += bpf(noise(n), 1200, 4000) * np.exp(-np.arange(n) / SR * 200) * (1 if k % 2 == 0 else .6)
    return norm(x)
def fx_lock(d):  # thumb-turn rotate + bolt clack
    t = T(d); x = np.zeros(len(t)); n = int(.18 * SR); x[:n] = bpf(noise(n), 800, 3000) * np.linspace(.2, .6, n)
    p = int(.2 * SR); m = int(.08 * SR); tt = np.arange(m) / SR; x[p:p + m] += (bpf(noise(m), 300, 4000) + np.sin(2 * np.pi * 900 * tt)) * np.exp(-tt * 70) * 2
    return norm(x)
def fx_vibrate(d):
    t = T(d); gate = (np.sin(t * 6) > -.2).astype(float); x = (np.sin(2 * np.pi * 165 * t) + .5 * np.sign(np.sin(2 * np.pi * 165 * t))) * gate; x = lpf(x, 2000); return norm(x) * env(len(t), .01, .05)
def fx_snap(d):
    t = T(d); x = np.zeros(len(t)); n = int(.06 * SR); tt = np.arange(n) / SR; x[:n] = (bpf(noise(n), 1500, 9000) * 1.5 + np.sin(2 * np.pi * 2400 * tt)) * np.exp(-tt * 90); return norm(x)

def _hit(n, lo, hi, dec): return bpf(noise(n), lo, hi) * np.exp(-np.arange(n) / SR * dec)
def fx_type(d):  # typewriter keys + occasional carriage bell
    t = T(d); x = np.zeros(len(t)); k = 0.0
    while k < d - .05:
        p = int(k * SR); n = 900; x[p:p + n] += _hit(n, 1500, 6000, 260)[:len(x[p:p + n])] * rng.uniform(.6, 1); k += rng.uniform(.07, .16)
    return norm(x)
def fx_thump(d):
    t = T(d); x = np.zeros(len(t)); n = min(len(t), int(.25 * SR)); tt = np.arange(n) / SR; x[:n] = (np.sin(2 * np.pi * 70 * tt) + .5 * bpf(noise(n), 100, 900)) * np.exp(-tt * 20); return norm(x)
def fx_beep(d, f=1800, per=1.1):
    t = T(d); x = np.zeros(len(t))
    for k in range(int(d / per) + 1):
        p = int(k * per * SR); n = int(.18 * SR)
        if p + n < len(x): x[p:p + n] += np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, .005, .02)
    return norm(x)
def fx_forklift(d): return norm(fx_beep(d, 2200, .7) + .4 * fx_hum(d, 90))
def fx_drip(d): return norm(sum(np.roll(np.pad(_hit(1500, 900, 3000, 80), (0, max(0, len(T(d)) - 1500)))[:len(T(d))], int(k * .9 * SR)) for k in range(int(d / .9) + 1)))
def fx_crane(d):
    t = T(d); x = .5 * lpf(noise(len(t)), 200) + .3 * np.sin(2 * np.pi * 55 * t)
    for k in range(3):
        p = int(rng.uniform(0, max(1, len(t) - 20000))); n = 20000; tt = np.arange(n) / SR; x[p:p + n] += (np.sin(2 * np.pi * 310 * tt) + np.sin(2 * np.pi * 457 * tt)) * np.exp(-tt * 6) * .6
    return norm(x) * env(len(t), .2, .3)
def fx_clubbass(d):
    t = T(d); x = np.zeros(len(t))
    for k in range(int(d * 2.03)):
        p = int(k / 2.03 * SR); n = int(.25 * SR); tt = np.arange(n) / SR
        if p + n < len(x): x[p:p + n] += np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
    return norm(lpf(x, 160) + .1 * lpf(noise(len(t)), 400)) * env(len(t), .1, .2)
def fx_crowd(d):
    t = T(d); x = bpf(noise(len(t)), 250, 1800) * (.7 + .3 * np.sin(2 * np.pi * .7 * t) * np.sin(2 * np.pi * 2.3 * t)); return norm(x) * env(len(t), .2, .3)
def fx_sewing(d):
    t = T(d); x = np.zeros(len(t)); rate = 18
    for k in range(int(d * rate)):
        p = int(k / rate * SR); n = 500
        if p + n < len(x): x[p:p + n] += _hit(n, 800, 5000, 300)
    return norm(x + .3 * np.sin(2 * np.pi * 100 * t) * (np.sin(2 * np.pi * .5 * t) > 0)) * env(len(t), .05, .1)
def fx_glass(d):
    t = T(d); x = np.zeros(len(t)); x[:int(.05 * SR)] += _hit(int(.05 * SR), 2000, 12000, 40) * 2
    for k in range(40):
        p = int(rng.uniform(0, min(len(t), int(.9 * SR)) - 2000)); n = 1500; tt = np.arange(n) / SR; x[p:p + n] += np.sin(2 * np.pi * rng.uniform(3000, 7000) * tt) * np.exp(-tt * 90) * rng.uniform(.2, .6)
    return norm(x)
def fx_slam(d):
    t = T(d); x = np.zeros(len(t)); n = min(len(t), int(.6 * SR)); tt = np.arange(n) / SR; x[:n] = (np.sin(2 * np.pi * 60 * tt) * 1.2 + bpf(noise(n), 80, 2000)) * np.exp(-tt * 9); return norm(x)
def fx_thud(d): return fx_thump(d)
def fx_siren(d):
    t = T(d); f = 650 + 250 * np.sin(2 * np.pi * .4 * t); x = np.sin(2 * np.pi * np.cumsum(f) / SR); return norm(lpf(x, 1500)) * env(len(t), .5, .5)
def fx_boots(d):
    t = T(d); x = np.zeros(len(t))
    for k in range(int(d * 5)):
        p = int((k / 5 + rng.uniform(0, .05)) * SR); n = 3000
        if p + n < len(x): x[p:p + n] += _hit(n, 80, 1500, 40) + .4 * _hit(n, 2000, 6000, 120)
    return norm(x)
def fx_break(d):
    t = T(d); x = np.zeros(len(t))
    for k, a in ((0, 1), (.45, 1.3)):
        p = int(k * SR); n = int(.5 * SR); tt = np.arange(n) / SR
        if p + n < len(x): x[p:p + n] += (np.sin(2 * np.pi * 50 * tt) + bpf(noise(n), 60, 5000)) * np.exp(-tt * 10) * a
    return norm(x)
def fx_cuff(d):
    t = T(d); x = np.zeros(len(t))
    for k in range(6):
        p = int((.05 + k * .035) * SR); n = 900; tt = np.arange(n) / SR
        if p + n < len(x): x[p:p + n] += (np.sin(2 * np.pi * 4200 * tt) + _hit(n, 3000, 9000, 200)) * np.exp(-tt * 160)
    return norm(x)
def fx_wind(d):
    t = T(d); x = lpf(noise(len(t)), 500) * (.6 + .4 * np.sin(2 * np.pi * .13 * t)); return norm(x) * env(len(t), .5, .5)
def fx_radio(d):
    t = T(d); x = bpf(noise(len(t)), 800, 3500) * (np.sin(2 * np.pi * 1.3 * t) > .3); return norm(x) * env(len(t), .05, .1)
def fx_piano(d, notes=(57, 60, 64, 62, 57, 55, 57), step=1.6):
    t = T(d); x = np.zeros(len(t))
    for k in range(int(d / step) + 1):
        f = 440 * 2 ** ((notes[k % len(notes)] - 69) / 12); p = int(k * step * SR); n = min(len(t) - p, int(3.5 * SR))
        if n <= 0: break
        tt = np.arange(n) / SR; x[p:p + n] += (np.sin(2 * np.pi * f * tt) + .4 * np.sin(4 * np.pi * f * tt) + .15 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 1.4) * (1 - np.exp(-tt * 200))
    return norm(x)
def fx_note(d): return fx_piano(d, notes=(57,), step=99)
def fx_lighter(d):
    t = T(d); x = np.zeros(len(t)); n = int(.04 * SR); x[:n] = _hit(n, 2000, 8000, 60); m = min(len(t) - n, int(.8 * SR)); x[n:n + m] += .3 * bpf(noise(m), 300, 2500) * np.exp(-np.arange(m) / SR * 3); return norm(x)
def fx_tape_rip(d):
    t = T(d); x = bpf(noise(len(t)), 1500, 7000) * (np.abs(np.sin(2 * np.pi * 30 * t)) > .3) * np.sin(np.pi * t / d); return norm(x)

FX = {k[3:]: v for k, v in globals().items() if k.startswith('fx_')}
# ---------- music: dark drone + slow bass pulses (no beat) ----------
def music(d):
    t = T(d); s = np.zeros(len(t))
    for f, a in ((55, .5), (82.4, .25), (110, .18), (164.8, .08)): s += a * np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .07 * t) * 2)
    s = lpf(s + .05 * noise(len(t)), 400) * (.7 + .3 * np.sin(2 * np.pi * .05 * t))
    for k in range(int(d / 3.2)):
        p = int((1.6 + k * 3.2) * SR); n = int(1.2 * SR); tt = np.arange(n) / SR
        if p + n < len(s): s[p:p + n] += .6 * np.sin(2 * np.pi * 41 * tt) * np.exp(-tt * 3)
    return norm(s) * env(len(t), 1.5, 1.5)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
if __name__ == '__main__':
    voice_mp3, cues_json, out, start, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(dur), '-i', voice_mp3, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    N = int(dur * SR); v = np.zeros(N); a = np.frombuffer(raw, np.float32).astype(float); v[:min(N, len(a))] = a[:N]
    # speech envelope (for ducking) and speech RMS (for relative levels)
    fr = int(.02 * SR); e = np.array([rms(v[i:i + fr]) for i in range(0, N, fr)]); on = (e > np.percentile(e, 60) * .35).astype(float)
    on = np.convolve(on, np.ones(15) / 15, 'same'); duck = np.repeat(on, fr)[:N]; duck = np.pad(duck, (0, N - len(duck)))
    vr = rms(v[np.repeat(on, fr)[:N] > .5]) if on.any() else rms(v)
    fxbus = np.zeros(N)
    for cu in json.load(open(cues_json)):
        if cu['fx'] == 'music': continue
        x = FX['counter'](cu['d'], cu['r'], cu['r'] * 1.3) if cu['fx'] == 'counter' and 'r' in cu else FX[cu['fx']](cu['d']); p = int(cu['t'] * SR); x = x[:max(0, N - p)]
        fxbus[p:p + len(x)] += x * vr * 10 ** (cu.get('g', -6) / 20) / max(rms(x), 1e-6) * .35
    fxbus *= 1 - .684 * np.clip(duck, 0, 1)  # -10 dB under speech
    mus = np.zeros(N)
    for cu in json.load(open(cues_json)):
        if cu['fx'] == 'music': m = music(cu['d']); p = int(cu['t'] * SR); m = m[:N - p]; mus[p:p + len(m)] += m
    mus *= vr * 10 ** (-30 / 20) / max(rms(mus[mus != 0]) if (mus != 0).any() else 1, 1e-6)
    mix = v + fxbus + mus
    mix /= max(1, np.max(np.abs(mix)) / .95)
    import wave
    w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    print('music vs voice (dB):', round(20 * np.log10(rms(mus[mus != 0]) / vr), 1) if (mus != 0).any() else None)
