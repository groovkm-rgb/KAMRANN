"""Full mix: voice-over + SFX (from shots.json cues + the approved draft's events) + ambience per shot + sparse music.
Writes work/mix_raw.wav, work/sfx_list.json; then tools/loudnorm.sh → work/mix.wav (−16 LUFS)."""
import sys, json, numpy as np, wave, os
sys.path.insert(0, '../lib/audio'); from sfx2 import *
os.makedirs('work', exist_ok=True)
DUR = 611.84
V = load_voice('../../samurai-taslak/voice.mp3', DUR); V = fade(V, 0, .1)
sfx, amb, mus = Bus(DUR), Bus(DUR), Bus(DUR)
LOG = []
def S(name, sig, t, db=0, pan=0, bus=None): (bus or sfx).add(sig, t, db, pan); LOG.append((round(t, 2), name, db))
shots = json.load(open('shots.json'))
# ---- 0–30,9: the approved draft's event list (unchanged)
S('Taiko-Schlag (einzeln)', taiko(1.1), 0.02, -2)
S('Sonnenglanz auf dem Stichblatt „Ting“', sword_ring(), 1.12, -10, .2)
S('Wind in den Kirschblüten', wind(2.5, .4), 0.0, -20)
S('Vögel am Morgen', bird(), 0.6, -22, .5); S('Vögel am Morgen', bird(.15, 4400), 1.9, -24, -.4)
S('Tusche-Wischer „Schlap“', ink_splat(), 2.46, -4)
S('Grillen (Nacht, Ambience)', crickets(15.7), 2.46, -20, -.3, amb); S('Nachtluft', night_air(15.7), 2.46, -22, 0, amb)
S('Tempelglocke (fern)', temple_bell(), 2.9, -14, .5); S('Koi-Wassertropfen im Teich', water_drop(), 3.9, -14, .4); S('Bambus im Wind', wind(2, .3), 2.5, -24, -.6)
S('Einzelner Tropfen im stillen Teich', water_drop(), 5.98, -12, -.2); S('Einatmen (Augen öffnen)', breath_in(), 6.95, -14)
S('Lack-Tick am Schwertständer', lacquer_tick(), 8.3, -16, .3); S('Lichtschimmer auf der Scheide', sword_ring(), 9.34, -18, .3)
for t in (10.32, 10.42, 11.05, 11.15): S('Pinselstrich', brush_stroke(), t, -14, .4)
S('Seide reibt (Makro Griff)', silk_rub(1.6), 12.2, -16); S('leiser Stahlklang', sword_ring(), 12.9, -24, -.2)
S('Ärmel/Stoff (Hand greift)', fabric(1.0), 14.3, -12, .4); S('Spannungs-Drone', drone(4.0, 49), 14.3, -24, 0, mus)
for t in (15.35, 16.25, 17.15): S('Herzschlag', heartbeat(), t, -12)
S('Schwertschnitt-Übergang „Sching“', slash(), 18.06, -4); S('Muschelhorn (Horagai)', horagai(2.6), 18.45, -12, -.4)
S('Wind über der Ebene', wind(4.8, .12), 18.12, -16, 0, amb); S('Fahnen flattern', flag_flap(4.7), 18.12, -20, .3)
S('Krähe', crow(), 19.3, -18, .6); S('Krähe', crow(), 20.25, -20, -.5)
for t in (18.55, 19.55, 20.35, 20.95, 21.4): S('Taiko (Muster, Musik)', taiko(1.0), t, -20, 0, mus)
S('Nebel-Wischer', mist_whoosh(.9), 20.75, -12); S('Rüstungsplatten (Schritt)', sheath_clack() * .6, 21.15, -18, .1); S('Rüstungsplatten (Schritt)', sheath_clack() * .6, 21.55, -18, -.1)
S('Taiko-Schlag auf „stirbst“', taiko(1.3), 21.80, -4); S('Tusche-Wischer „Schlap“', ink_splat(), 22.84, -6)
S('Shakuhachi (Morgen, zwei Töne)', shakuhachi([(0, 1.2, 74), (1.15, 1.6, 72)]), 22.95, -19, 0, mus)
S('Vögel am Morgen', bird(), 23.3, -22, .6); S('Pergament-Rolle öffnet sich', scroll_open(), 24.12, -8)
S('Pinselstrich (Titel)', brush_stroke(.6), 24.52, -14); S('Pinselstrich (Achse)', brush_stroke(.7), 24.42, -16)
for k in range(5): S('Pinselstrich (Jahresmarke)', brush_stroke(.3), 25.02 + k * .15, -18)
S('Pinsel-Kreis „um 1600“', brush_stroke(.45), 24.74, -14, .2); S('Rotes Siegel „Pat“', hanko_pat(), 25.10, -8)
S('Pinselstrich rot (Kriegsjahre)', brush_stroke(.7), 26.10, -12); S('Pinselnotiz', brush_stroke(.5), 26.42, -16); S('Rotes Siegel „Pat“ auf „Krieg“', hanko_pat(), 27.84, -6)
S('Shoji-Tür gleitet', shoji_slide(), 28.42, -10); S('Fahnen flattern', flag_flap(2.4), 28.5, -18, -.5); S('Pinselstrich (Trennlinie)', brush_stroke(.5), 28.82, -16)
S('Taiko-Schlag, Schnitt auf Schwarz', taiko(1.25), 30.60, -3)
# ---- 30,9 → end: cues from the shot list
lerp = lambda a, b, k: a + (b - a) * k
cache = {}
def snd(name):
    if name not in cache: cache[name] = NAMES[name]().astype(np.float32)
    return cache[name]
for s in shots:
    if s['t0'] < 30.8: continue
    for dt, name, db, *pan in s['sfx']:
        if name in ('silence', 'clockless'): continue
        if s['t0'] + dt < s['t0'] + s['dur'] + .05: S(name, snd(name), s['t0'] + dt, db, (pan or [0])[0])
# ambience per shot (crossfaded), level well below the voice
amb_cache = {}
for s in shots:
    if s['t0'] < 30.8 or not s['amb'] or s['amb'] not in AMB: continue
    d = s['dur'] + .6; key = s['amb']
    if key not in amb_cache: amb_cache[key] = AMB[key](20.0).astype(np.float32)
    src = amb_cache[key]; off = int((s['t0'] * 7.3 % 10) * SR); seg_ = np.resize(np.roll(src, -off), int(d * SR)); seg_ = fade(seg_, .3, .3)
    amb.add(seg_, max(0, s['t0'] - .3), -22, 0)
# ---- music: sparse; taiko (battle), shakuhachi (mist, ronin, finale), koto (art, evening)
def taiko_pattern(t0, t1, b0, b1, db):
    t = t0
    while t < t1: k = (t - t0) / (t1 - t0); S('Taiko-Muster (Musik)', taiko(1.0), t, db, 0, mus); t += lerp(b0, b1, k)
taiko_pattern(297.9, 301.6, .9, .7, -22)
taiko_pattern(354.8, 369.0, 1.5, .55, -21)
taiko_pattern(384.7, 392.0, .45, .3, -20)
S('Shakuhachi (dunkler Morgen)', shakuhachi([(0, 1.8, 69), (1.9, 1.4, 72), (3.4, 2.4, 67)]), 143.4, -20, 0, mus)
S('Shakuhachi (Morgengrauen)', shakuhachi([(0, 2.0, 74), (2.1, 2.6, 71)]), 426.6, -20, 0, mus)
S('Shakuhachi (Rōnin)', shakuhachi([(0, 2.2, 67), (2.3, 1.6, 70), (4.0, 3.0, 65), (7.6, 2.0, 67), (9.8, 3.4, 62)]), 437.8, -20, 0, mus)
S('Shakuhachi (Rōnin, Pass)', shakuhachi([(0, 2.4, 69), (2.6, 3.0, 67)]), 455.8, -21, 0, mus)
S('Shakuhachi (Mond)', shakuhachi([(0, 2.0, 76), (2.1, 3.0, 74)]), 577.1, -20, 0, mus)
S('Shakuhachi (Finale)', shakuhachi([(0, 2.4, 69), (2.5, 2.0, 72), (4.6, 3.6, 67), (8.4, 4.0, 64)]), 597.8, -20, 0, mus)
S('Koto (Familie)', koto([(0, 62), (.6, 65), (1.2, 69), (2.4, 67), (3.6, 62)]), 55.2, -21, 0, mus)
S('Koto (Schrift und Tee)', koto([(0, 64), (.8, 67), (1.6, 71), (3.2, 69), (4.4, 64), (6.0, 62), (7.2, 64)]), 113.1, -21, 0, mus)
S('Koto (Bushido)', koto([(0, 57), (.5, 62), (1.0, 64)]), 315.0, -20, 0, mus)
S('Koto (Frieden)', koto([(0, 67), (.7, 71), (1.4, 74), (2.8, 72), (4.2, 67), (6.0, 69), (7.4, 71)]), 463.7, -21, 0, mus)
S('Koto (Abend)', koto([(0, 62), (.8, 65), (1.6, 67), (3.2, 65), (4.8, 62), (6.4, 60), (8.0, 62)]), 560.6, -21, 0, mus)
# ---- mix
duck = duck_env(V, -10)
mus.L *= .8; mus.R *= .8
L = V + (sfx.L + amb.L) * duck + mus.L * duck; R = V + (sfx.R + amb.R) * duck + mus.R * duck
mx = np.stack([L, R], 1); mx /= np.max(np.abs(mx)) * 1.05
with wave.open('work/mix_raw.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mx, -1, 1) * 32767).astype(np.int16).tobytes())
sp = np.abs(np.convolve(V, np.ones(4800) / 4800, 'same')) > np.percentile(np.abs(V), 70) * .3
mv = (mus.L * duck)[sp]; mv = mv[np.abs(mv) > 1e-4]
print('music under speech: %.1f dB relative to voice' % (rms_db(mv) - rms_db(V[sp])))
json.dump([{'t': t, 'sfx': n, 'gain_db': d} for t, n, d in sorted(LOG)], open('work/sfx_list.json', 'w'), ensure_ascii=False, indent=0)
print(len(LOG), 'events')
