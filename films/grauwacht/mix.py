"""Mix the narration over the synthesized music + effects.
music ~19 dB under the voice (integrated), effects sparse in the background, gentle ducking while the voice speaks.
usage: mix.py voice.wav stem.music.wav stem.sfx.wav out_mix.wav out_me.wav"""
import sys, wave, numpy as np, pyloudnorm as pyln
SR = 44100
def load(p):
    with wave.open(p) as w: assert w.getframerate() == SR; x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; return x if w.getnchannels() == 1 else x.reshape(-1, w.getnchannels()).mean(1)
def save(p, x):
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
voice, music, sfx = (load(p) for p in sys.argv[1:4]); N = len(voice); music = np.pad(music, (0, max(0, N - len(music))))[:N]; sfx = np.pad(sfx, (0, max(0, N - len(sfx))))[:N]
meter = pyln.Meter(SR); L = lambda x: meter.integrated_loudness(x.astype(np.float64))
V0 = -17.0
voice *= 10 ** ((V0 - L(voice)) / 20); music *= 10 ** ((V0 - 19.0 - L(music)) / 20); sfx *= 10 ** ((V0 - 21.0 - L(sfx)) / 20)
# keep any single effect from poking above the voice: soft limit the sfx bus at -16 dBFS peak
sfx = np.tanh(sfx / 0.16) * 0.16
# ducking: -4 dB on music (-2 dB on effects) while the voice is active; smooth attack/release
hop = 441; fr = len(voice) // hop; rms = np.sqrt(np.mean(voice[:fr * hop].reshape(fr, hop) ** 2, 1) + 1e-12); db = 20 * np.log10(rms)
act = (db > np.percentile(db, 30) + 6).astype(np.float32)
g = np.zeros(fr, np.float32); a_up, a_dn = 1 - np.exp(-1 / (0.12 * 100)), 1 - np.exp(-1 / (0.6 * 100))
for i in range(fr): g[i] = g[i - 1] + (act[i] - g[i - 1]) * (a_up if act[i] > g[i - 1] else a_dn) if i else act[0]
env = np.interp(np.arange(N), np.arange(fr) * hop + hop / 2, g)
duck_m = 10 ** (-4 * env / 20); duck_s = 10 ** (-2 * env / 20)
mix = voice + music * duck_m + sfx * duck_s; me = music + sfx
print(f'voice {L(voice):.1f} LUFS, music {L(music):.1f}, sfx {L(sfx):.1f}, voice-music gap {L(voice) - L(music):.1f} dB, voiced share {act.mean():.2f}')
save(sys.argv[4], mix * 0.7); save(sys.argv[5], me * 0.7)
save(sys.argv[5].replace('.wav', '.music_stem.wav'), music * 0.7); save(sys.argv[5].replace('.wav', '.sfx_stem.wav'), sfx * 0.7)
