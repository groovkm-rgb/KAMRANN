import numpy as np, wave, sys
sys.path.insert(0, '.')
from sfx import *
def rd(p):
    w = wave.open(p); return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
DUR = 5.0; n = int(DUR * SR)
v = rd('voice.wav')[:n]; V = np.stack([v, v], 1)
act = voice_activity(V)
vr = np.sqrt(np.mean(v[act > .5] ** 2)); vdb = 20 * np.log10(vr)
print('voice rms dBFS', round(vdb, 1))
duck = lambda d: 10 ** (-d * act / 20)[:, None]
W = norm_rms(wind(DUR, 11, howl=1.2), vdb - 17) * duck(4)
C = norm_rms(crackle(DUR, 12, rate=10, pan=.45), vdb - 15) * duck(3)
D = norm_rms(drone(DUR, 13, 49, 'mystery'), vdb - 22) * duck(3)
S = norm_rms(swell(DUR, 1.75, 1.5, 14, 36), vdb - 21)
fadein = np.clip(np.arange(n) / (SR * .6), 0, 1)[:, None]
bed = (W + D + S) * fadein + C
mix = V + bed
fo = np.clip((DUR - np.arange(n) / SR) / .2, 0, 1)[:, None]; mix *= fo
pk = np.abs(mix).max(); print('peak', round(20*np.log10(pk),1))
if pk > .97: mix *= .97 / pk
w = wave.open('draft_mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
