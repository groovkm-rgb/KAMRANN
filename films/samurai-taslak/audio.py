"""Draft mix: first 30,9 s of the voice-over + SFX + very little music. Writes work/mix.wav and prints the SFX list."""
import sys, json, numpy as np, wave
sys.path.insert(0, '../samurai/lib/audio'); from sfx import *
DUR = 30.9
V = load_voice('voice.mp3', DUR); V = fade(V, 0, .08)
sfx, mus = Bus(DUR), Bus(DUR)
LOG = []
def S(name, sig, t, db=0, pan=0, bus=None): (bus or sfx).add(sig, t, db, pan); LOG.append((t, name, db))
# ---- 01 darkness / blade
S('Taiko-Schlag (einzeln)', taiko(1.1), 0.02, -2)
S('Schwert ziehen „Schiiing“ (Lichtlinie auf der Klinge)', sword_draw(), 1.10, -6, .2)
# ---- 02 house before dawn
S('Tusche-Wischer „Schlap“', ink_splat(), 2.46, -4)
S('Grillen (Nacht, Ambience)', crickets(15.7), 2.46, -20, -.3); S('Nachtluft', night_air(15.7), 2.46, -22)
S('Tempelglocke (fern)', temple_bell(), 2.9, -14, .5)
S('Koi-Wassertropfen im Teich', water_drop(), 3.9, -14, .4)
S('Bambus im Wind', wind(2, .3), 2.5, -24, -.6)
# ---- 03/04 inside, sleeping
S('Futon-Stoff raschelt', fabric(.9), 5.8, -16)
S('Einatmen (Augen öffnen)', breath_in(), 6.95, -14)
# ---- 06 two swords
S('Lack-Tick am Schwertständer', lacquer_tick(), 8.3, -16, .3)
S('Lichtschimmer auf der Scheide (Klingen)', sword_ring(), 9.34, -18, .3)
# ---- 07 brush labels
for t in (10.32, 10.42, 11.05, 11.15): S('Pinselstrich (Pfeil/Notiz)', brush_stroke(), t, -14, .4)
# ---- 08 macro hilt
S('Seide reibt (Makro Griff)', silk_rub(1.6), 12.2, -16); S('leiser Stahlklang', sword_ring(), 12.9, -24, -.2)
# ---- 09/10 hand reaches, alert
S('Ärmel/Stoff (Hand greift)', fabric(1.0), 14.3, -12, .4)
S('Spannungs-Drone', drone(4.0, 49), 14.3, -24, 0, mus)
for t in (15.35, 16.25, 17.15): S('Herzschlag', heartbeat(), t, -12)
# ---- 11 battlefield
S('Schwertschnitt-Übergang „Sching“', slash(), 18.06, -4)
S('Muschelhorn (Horagai)', horagai(2.6), 18.45, -12, -.4)
S('Wind über der Ebene', wind(4.8, .12), 18.12, -16)
S('Fahnen flattern', flag_flap(4.7), 18.12, -20, .3)
S('Krähe', crow(), 19.3, -18, .6); S('Krähe', crow(), 20.25, -20, -.5)
# taiko pattern (music): heavy and slowly accelerating
for t in (18.55, 19.55, 20.35, 20.95, 21.4): S('Taiko (Muster, Musik)', taiko(1.0), t, -20, 0, mus)
S('Nebel-Wischer', mist_whoosh(.9), 20.75, -12)
S('Rüstungsplatten klappern (Schritte)', np.concatenate([np.zeros(int(.05 * SR), np.float32), sheath_clack() * .6]), 21.1, -18, .1)
S('Rüstungsplatten klappern (Schritte)', sheath_clack() * .6, 21.55, -18, -.1)
S('Taiko-Schlag auf „stirbst“', taiko(1.3), 21.80, -4)
# ---- 13 Japan
S('Tusche-Wischer „Schlap“', ink_splat(), 22.84, -6)
S('Shakuhachi (Morgen, zwei Töne)', shakuhachi([(0, 1.2, 74), (1.15, 1.6, 72)]), 22.95, -19, 0, mus)
S('Vögel am Morgen', bird(), 23.3, -22, .6); S('Vögel am Morgen', bird(.15, 4200), 23.55, -24, .5)
# ---- 14 timeline scroll
S('Pergament-Rolle öffnet sich', scroll_open(), 24.12, -8)
S('Pinselstrich (Titel)', brush_stroke(.6), 24.52, -14)
S('Pinselstrich (Achse)', brush_stroke(.7), 24.42, -16)
for k in range(5): S('Pinselstrich (Jahresmarke)', brush_stroke(.3), 25.02 + k * .15, -18)
S('Pinsel-Kreis „um 1600“', brush_stroke(.45), 24.74, -14, .2)
S('Rotes Siegel „Pat“', hanko_pat(), 25.10, -8)
S('Pinselstrich rot (Kriegsjahre)', brush_stroke(.7), 26.10, -12)
S('Pinselnotiz', brush_stroke(.5), 26.42, -16)
S('Rotes Siegel „Pat“ auf „Krieg“', hanko_pat(), 27.84, -6)
# ---- 15 lords
S('Shoji-Tür gleitet', shoji_slide(), 28.42, -10)
S('Fahnen flattern', flag_flap(2.4), 28.5, -18, -.5); S('Fahnen flattern', flag_flap(2.4), 28.5, -18, .5)
S('Pinselstrich (Trennlinie)', brush_stroke(.5), 28.82, -16)
S('Kriegsfächer hebt sich (Stoff)', fabric(.4), 30.5, -18)
S('Taiko-Schlag, Schnitt auf Schwarz', taiko(1.25), 30.60, -3)

# ---- mix: voice in front; SFX and music ducked ~10 dB under speech
duck = duck_env(V, -10)
Lm = V + sfx.L * duck + mus.L * duck; Rm = V + sfx.R * duck + mus.R * duck
mx = np.stack([Lm, Rm], 1); mx /= np.max(np.abs(mx)) * 1.05
with wave.open('work/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mx, -1, 1) * 32767).astype(np.int16).tobytes())
# music level under speech
sp = np.abs(np.convolve(V, np.ones(4800) / 4800, 'same')) > np.percentile(np.abs(V), 70) * .3
mvl = (mus.L * duck)[sp]; vv = V[sp]
print('music under speech: %.1f dB relative to voice' % (rms_db(mvl[np.abs(mvl) > 0]) - rms_db(vv)) if np.any(mvl) else 'no music under speech')
json.dump([{'t': round(t, 2), 'sfx': n, 'gain_db': d} for t, n, d in sorted(LOG)], open('work/sfx_list.json', 'w'), ensure_ascii=False, indent=1)
print(len(LOG), 'events')
