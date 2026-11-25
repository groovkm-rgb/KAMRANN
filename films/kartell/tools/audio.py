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
        x = FX[cu['fx']](cu['d']); p = int(cu['t'] * SR); x = x[:max(0, N - p)]
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
