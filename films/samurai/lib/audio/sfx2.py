"""More synthesized sounds for the full film (same method as sfx.py)."""
from sfx import *

def P(*sigs):  # add signals of different lengths (zero-padded)
    n = max(len(x) for x in sigs); out = np.zeros(n, np.float32)
    for x in sigs: out[:len(x)] += x
    return out
def creak(d=.6, f0=140):
    t = T(d); rate = f0 * (1 + .35 * np.sin(2 * np.pi * 1.3 * t / d)); ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < .08).astype(np.float32)
    return norm(hp(lp(pulses * (.6 + .4 * rng.random(len(t)).astype(np.float32)), 2200) * np.sin(np.pi * t / d), 200), .6)
def splash(d=1.0):
    t = T(d); return norm(lp(noise(d), 4000) * np.exp(-t * 4) * np.minimum(1, t / .01) + lp(noise(d), 400) * np.exp(-t * 7) * 1.5, .9)

def clicks(d, rate, f_lo=1500, f_hi=7000, jitter=.3, decay=200, seed=0):
    r = np.random.default_rng(seed); n = int(d * SR); out = np.zeros(n, np.float32); t = 0.0
    click = bp(noise(.04), f_lo, f_hi) * np.exp(-T(.04) * decay)
    while t < d:
        i = int(t * SR); out[i:i + len(click)] += click[: max(0, n - i)] * (.5 + r.random() * .5); t += (1 / rate) * (1 + (r.random() - .5) * 2 * jitter)
    return out
def impact(f0=120, d=.5, bright=1500, ring=0.0):
    t = T(d); s = np.sin(2 * np.pi * f0 * t * (1 + .5 * np.exp(-t * 30))) * np.exp(-t * 12) + lp(noise(d), bright) * np.exp(-t * 35) * .7
    if ring: s += np.sin(2 * np.pi * ring * t) * np.exp(-t * 8) * .3
    return norm(s.astype(np.float32), .9)
def repeat(sig, d, period, jitter=.05, seed=1):
    r = np.random.default_rng(seed); n = int(d * SR); out = np.zeros(n, np.float32); t = 0.0
    while t < d: i = int(t * SR); out[i:i + len(sig)] += sig[: max(0, n - i)] * (.7 + .3 * r.random()); t += period * (1 + (r.random() - .5) * 2 * jitter)
    return out
def fire(d=3.0): return norm(lp(noise(d), 700) * .5 + clicks(d, 18, 800, 6000, .8, 300, 3) * .6, .7)
def crash(d=1.4): return reverb(norm(repeat(impact(90, .4, 1200), d * .6, .08, .6, 4)[: int(d * SR)], .9), 1.2, .3)
def gallop(d=2.5):
    one = impact(70, .2, 600) * .9; beat = np.zeros(int(.36 * SR), np.float32)
    for k, off in enumerate([0, .07, .14]): i = int(off * SR); beat[i:i + len(one)] += one[: len(beat) - i] * (1 - k * .15)
    return norm(repeat(beat, d, .36, .03, 5), .8)
def whinny(d=1.2):
    t = T(d); f = 700 * (1 + .25 * np.sin(2 * np.pi * 9 * t)) * (1 - .4 * t / d); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return reverb(norm(bp(saw.astype(np.float32), 600, 3000) * np.sin(np.pi * t / d) ** .5, .5), 1.4, .3)
def shouts(d=2.5):  # far, unintelligible crowd shouts
    t = T(d); s = np.zeros(len(t), np.float32)
    for k in range(6):
        f = 200 + k * 60; mod = (.5 + .5 * np.sin(2 * np.pi * (2 + k * .7) * t + k)) ** 2
        s += bp(noise(d), f * 2, f * 6) * mod
    return reverb(lp(norm(s, .6), 2000), 2.0, .5, 1500)
def armor_rattle(d=.8): return norm(P(clicks(d, 22, 2000, 6000, .6, 150, 7), impact(300, .3, 3000) * .3), .7)
def arrow_whiz(d=.6):
    t = T(d); s = bp(noise(d), 1500, 6000) * np.sin(np.pi * t / d) ** 2; f = 1800 * (1 - .3 * t / d)
    return norm(s + np.sin(2 * np.pi * np.cumsum(f) / SR) * .15 * np.sin(np.pi * t / d), .7)
def arrows_volley(d=1.3):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(14): w = arrow_whiz(.5); i = int(rng.random() * (d - .5) * SR); out[i:i + len(w)] += w * (.4 + rng.random() * .4)
    return norm(out, .8)
def thunk(): return norm(P(impact(160, .4, 2500), clicks(.05, 1, 3000, 8000) * .5), .9)
def gun_shot(d=1.6):
    t = T(d); s = hp(noise(d), 600) * np.exp(-t * 30) * 1.2 + lp(noise(d), 200) * np.exp(-t * 5) * 1.0 + np.sin(2 * np.pi * 60 * t) * np.exp(-t * 6) * .8
    return reverb(norm(s.astype(np.float32)), 2.2, .45, 2500)
def gun_volley(d=2.0):
    out = np.zeros(int(d * SR) + int(4.5 * SR), np.float32)
    for k in range(7): g = gun_shot(); i = int((k * .06 + rng.random() * .05) * SR); out[i:i + len(g)] += g * (.5 + rng.random() * .4)
    return norm(out, 1)
def hiss(d=1.2): t = T(d); return norm(hp(noise(d), 3000) * np.sin(np.pi * t / d) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 13 * t))), .4)
def fuse(d=1.5): return norm(hiss(d) + clicks(d, 25, 4000, 9000, .8, 400, 11) * .3, .45)
def steel_clash():
    t = T(1.0); ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(1830, 5), (2730, 7), (4120, 9), (5600, 12)])
    return reverb(norm(ring * .5 + hp(noise(1.0), 2000) * np.exp(-t * 40), .9), 1.0, .25)
def bokken_clash(): t = T(.4); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 25) for f in (520, 780, 1130)) + bp(noise(.4), 800, 4000) * np.exp(-t * 60), .9)
def swish(d=.35): return whoosh(d, 600, 5000)
def steps(d=2.0, period=.5, f0=110, bright=900, seed=2): return norm(repeat(impact(f0, .15, bright) * .6, d, period, .08, seed), .6)
def snow_step(): t = T(.35); return norm(bp(noise(.35), 800, 6000) * np.exp(-t * 14) * (.6 + .4 * rng.random(len(t))), .7)
def rain(d=4.0): return norm(hp(lp(noise(d), 8000), 800) * .5 + clicks(d, 60, 2000, 8000, .9, 300, 13) * .4, .6)
def thunder_far(d=3.0): t = T(d); return norm(lp(noise(d), 120) * np.minimum(1, t / .3) * np.exp(-t / 1.0) * 2, .9)
def cicadas(d=4.0):
    t = T(d); s = np.zeros(len(t), np.float32)
    for k, f in enumerate([5200, 6100, 4700]): s += np.sin(2 * np.pi * f * t) * (.5 + .5 * np.sign(np.sin(2 * np.pi * (60 + k * 13) * t))) * (.6 + .4 * np.sin(2 * np.pi * (.2 + k * .07) * t + k)) ** 2
    return norm(s, .4)
def birds(d=4.0, n=6, seed=21):
    r = np.random.default_rng(seed); out = np.zeros(int(d * SR), np.float32)
    for k in range(n): b = bird(.12 + r.random() * .1, 3000 + r.random() * 2500); i = int(r.random() * (d - .3) * SR); out[i:i + len(b)] += b * (.5 + r.random() * .5)
    return out
def stream(d=4.0): t = T(d); return norm(bp(noise(d), 300, 2500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 3.1 * t) * np.sin(2 * np.pi * 1.7 * t))), .5)
def sea(d=4.0): t = T(d); return norm(lp(noise(d), 600) * (.4 + .6 * np.sin(2 * np.pi * .12 * t) ** 2), .6)
def texture(d, lo, hi, rate=8, depth=.7):  # scrape-like textures: comb, razor, paper, straw, glue …
    t = T(d); return norm(bp(noise(d), lo, hi) * (1 - depth + depth * np.abs(np.sin(2 * np.pi * rate * t))) * np.sin(np.pi * t / d), .5)
def soroban_clicks(d=1.5): return norm(clicks(d, 14, 1500, 5000, .5, 300, 17) + clicks(d, 9, 800, 3000, .5, 250, 19) * .6, .6)
def coins():
    out = np.zeros(int(.9 * SR), np.float32)
    for k in range(3):
        sg = norm(sum(np.sin(2 * np.pi * f * T(.5)) * np.exp(-T(.5) * 10) for f in (3200 + k * 300, 5100 + k * 200)), .3); i = int(k * .12 * SR); out[i:i + len(sg)] += sg
    return out
def counter_ticks(d=2.0): return norm(clicks(d, 12, 2000, 6000, .05, 300, 23), .4)
def water_pour(d=1.4): t = T(d); return norm(bp(noise(d), 500, 4000) * np.sin(np.pi * t / d) ** .5 * (.7 + .3 * np.sin(2 * np.pi * 9 * t)), .5)
def kettle_boil(d=3.0): return norm(lp(noise(d), 1500) * .3 + clicks(d, 30, 300, 1500, .9, 120, 29) * .5, .4)
def horn_low(d=2.0, f0=110): t = T(d); ph = 2 * np.pi * f0 * t; s = sum(np.sin(k * ph) / k for k in range(1, 7)) * np.minimum(1, t / .2) * np.minimum(1, (d - t) / .4).clip(0); return reverb(lp(norm(s.astype(np.float32), .6), 1500), 2.5, .4)
def snare_roll(d=1.2): t = T(d); return norm(hp(noise(d), 1500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 14 * t))) * np.minimum(1, t / .2), .5)
def fly(d=1.0): t = T(d); return norm(np.sin(2 * np.pi * np.cumsum(220 + 30 * np.sin(2 * np.pi * 3 * t)) / SR) * np.sin(np.pi * t / d) * (1 + .5 * np.sin(2 * np.pi * 40 * t)), .15)
def breath(d=.7, lo=400, hi=2500, g=.3): t = T(d); return norm(bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2, g)
def fake_sting():  # cheesy "film" chord (deliberately glossy)
    t = T(1.6); s = sum(np.sin(2 * np.pi * f * t) + .5 * np.sin(4 * np.pi * f * t) for f in (220, 277, 330, 440)) * np.exp(-t * 1.2)
    return reverb(norm(s.astype(np.float32), .6), 2.0, .5)
def freeze_hit(): t = T(1.2); return reverb(norm(np.sin(2 * np.pi * 50 * t) * np.exp(-t * 3) + hp(noise(1.2), 3000) * np.exp(-t * 20) * .3, .9), 1.5, .4)
def cloth_tear(d=.6): t = T(d); return norm(bp(noise(d), 1500, 8000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 40 * t))) * np.minimum(1, t / .05) * np.exp(-t * 3), .6)
def room_tone(d=4.0): return norm(lp(noise(d), 250), .25)
def city_murmur(d=4.0): return norm(bp(noise(d), 200, 1200) * (.7 + .3 * np.sin(2 * np.pi * .3 * T(d))), .3)
def marching(d=3.0): return norm(repeat(impact(80, .2, 500), d, .5, .02, 31) * .7 + repeat(armor_rattle(.2), d, .5, .05, 33) * .3, .8)
def drill_steps(d=3.0): return norm(repeat(impact(70, .25, 700), d, .6, .0, 35), .8)

NAMES = {
    'taiko': lambda: taiko(1.1), 'taikoSoft': lambda: taiko(.8) * .6, 'drum': lambda: taiko(.9) * .7, 'horagai': lambda: horagai(2.4),
    'swordDraw': sword_draw, 'swordRing': sword_ring, 'clack': sheath_clack, 'swordSlide': lambda: texture(1.2, 2000, 7000, 3, .3), 'slash': slash,
    'swish': swish, 'swishFast': lambda: repeat(swish(.25), 2.3, .33, .05, 3), 'kiai': lambda: breath(.4, 300, 2000, .5),
    'bokkenClash': bokken_clash, 'bokkenTap': lambda: bokken_clash() * .5, 'steelClash': steel_clash, 'freezeHit': freeze_hit,
    'armor': armor_rattle, 'lace': lambda: texture(.8, 1500, 6000, 4, .5), 'oilCloth': silk_rub,
    'brush': brush_stroke, 'brushBig': lambda: brush_stroke(1.0), 'brushX': lambda: brush_stroke(.3), 'ink': ink_splat, 'scroll': scroll_open, 'hanko': hanko_pat,
    'shoji': shoji_slide, 'doorSlide': lambda: shoji_slide(.8), 'paper': lambda: texture(.6, 2000, 8000, 6, .6), 'paperTear': cloth_tear, 'clothTear': cloth_tear,
    'fabric': fabric, 'steps': lambda: steps(2.0), 'tatamiStep': lambda: steps(1.2, .6, 90, 500), 'snowStep': snow_step, 'runSteps': lambda: steps(2.0, .22),
    'footstepsOut': lambda: steps(1.0, .35, 100, 700), 'sweep': lambda: texture(2.0, 800, 5000, 1.5, .8),
    'fire': lambda: fire(3.0), 'crash': crash, 'gallop': lambda: gallop(2.4), 'whinny': whinny, 'shouts': lambda: shouts(2.5), 'armyMurmur': lambda: shouts(3.0) * .6,
    'arrow': arrow_whiz, 'arrowsVolley': arrows_volley, 'thunk': thunk, 'gunShot': gun_shot, 'gunVolley': gun_volley, 'smokeHiss': lambda: hiss(1.5), 'fuse': fuse, 'ramrod': lambda: texture(1.0, 1000, 5000, 3, .8),
    'battleFar': lambda: P(shouts(3.0) * .5, gallop(3.0) * .2), 'marching': marching, 'flag': lambda: flag_flap(2.0),
    'heartbeat': heartbeat, 'breathIn': breath_in, 'breathSoft': lambda: breath(1.0, 300, 1500, .2), 'breathHeavy': lambda: repeat(breath(.6, 300, 2000, .4), 2.0, .7), 'gasp': lambda: breath(.4, 600, 3500, .5),
    'sigh': lambda: breath(1.2, 300, 1500, .35), 'cough': lambda: repeat(breath(.15, 400, 3000, .5), .6, .2), 'grunt': lambda: breath(.3, 200, 1200, .5),
    'splash': splash, 'bucket': lambda: P(impact(140, .4, 900) * .6, water_pour(.8) * .5), 'drop': water_drop, 'waterPour': water_pour, 'kettleBoil': kettle_boil, 'whisk': lambda: texture(1.2, 2000, 8000, 12, .8), 'slurp': lambda: breath(.4, 500, 2500, .3),
    'razor': lambda: texture(.8, 3000, 9000, 20, .7), 'oil': lambda: texture(.8, 300, 2000, 2, .3), 'comb': lambda: texture(.7, 2500, 8000, 30, .8), 'glue': lambda: texture(1.0, 600, 3000, 5, .6), 'straw': lambda: texture(1.2, 1500, 6000, 10, .7), 'plane': lambda: texture(1.0, 1500, 7000, 6, .7),
    'inkGrind': lambda: texture(2.0, 800, 4000, 2.5, .8), 'inkDip': lambda: water_drop() * .6, 'riceGrain': lambda: clicks(.6, 20, 3000, 8000, .8, 400, 37) * .3,
    'chopsticks': lambda: clicks(.3, 8, 2000, 6000, .2, 300, 39), 'bowlSet': lambda: impact(300, .3, 3000, 900) * .6, 'plate': lambda: impact(400, .3, 4000, 1300) * .5,
    'soroban': soroban_clicks, 'coins': coins, 'counter': counter_ticks, 'tick': tick,
    'chestLid': lambda: impact(70, .7, 600), 'lidClose': lambda: impact(110, .4, 1200), 'thud': lambda: impact(80, .5, 700), 'thudSoft': lambda: impact(90, .4, 400) * .6, 'fall': lambda: P(impact(70, .6, 900), fabric(.5) * .5),
    'hammer': lambda: impact(180, .3, 3000, 600), 'wood': lambda: impact(240, .3, 2500), 'woodCreak': lambda: creak(.8, 110), 'creak': lambda: creak(.6, 140), 'hollow': lambda: impact(160, .6, 800, 330),
    'fan': lambda: whoosh(.4, 300, 2500), 'fanSnap': lambda: P(whoosh(.3, 400, 3000), sheath_clack() * .3), 'dust': lambda: texture(1.5, 1000, 6000, .5, .2) * .5,
    'rain': lambda: rain(4.0), 'thunderFar': thunder_far, 'cicadas': lambda: cicadas(3.0), 'crickets': lambda: crickets(3.0), 'birds': lambda: birds(3.0, 5), 'birdsDawn': lambda: birds(3.0, 7, 41),
    'stream': lambda: stream(3.0), 'sea': lambda: sea(3.0), 'crow': crow, 'crowFar': lambda: lp(crow(), 1500) * .5, 'bellFar': lambda: lp(temple_bell(), 900) * .7, 'fly': fly,
    'wind': lambda: wind(2.5), 'windSoft': lambda: wind(3.0, .1) * .5, 'windHigh': lambda: hp(wind(3.0, .2), 400), 'windGust': lambda: wind(2.0, .5), 'grassWind': lambda: texture(2.0, 1500, 6000, 1, .5),
    'bambooWind': lambda: P(texture(3.0, 1500, 7000, .8, .5), creak(.5, 200) * .2), 'coldwind': lambda: wind(3.0, .2), 'battlewind': lambda: wind(4.0, .15),
    'drill': drill_steps, 'drumSnare': snare_roll, 'drumSnareFar': lambda: lp(snare_roll(), 1500) * .4, 'shipHorn': lambda: horn_low(2.0, 98),
    'whooshSoft': lambda: whoosh(.6, 200, 2000) * .6, 'fakeSting': fake_sting, 'silence': lambda: np.zeros(10, np.float32), 'clockless': lambda: np.zeros(10, np.float32),
    'arguing': lambda: shouts(1.6) * .5,
}
AMB = {
    'night': lambda d: crickets(d) * .5 + night_air(d) * .4, 'crickets': lambda d: crickets(d), 'nightfall': lambda d: crickets(d) * .3 + wind(d, .1) * .2,
    'garden': lambda d: birds(d, int(d * 1.2)) + wind(d, .1) * .2, 'morning': lambda d: birds(d, int(d * 1.5), 43) + room_tone(d) * .3, 'spring': lambda d: birds(d, int(d * 1.3), 45) + wind(d, .15) * .25,
    'summer': lambda d: cicadas(d), 'summerEvening': lambda d: cicadas(d) * .5 + crickets(d) * .3, 'autumn': lambda d: wind(d, .2) * .4 + birds(d, int(d * .6), 47),
    'interior': lambda d: room_tone(d), 'throne': lambda d: room_tone(d) * .8, 'office': lambda d: P(room_tone(d), soroban_clicks(min(d, 1.0)) * .1), 'storehouse': lambda d: room_tone(d), 'workshop': lambda d: room_tone(d), 'attic': lambda d: room_tone(d) * .7,
    'dojo': lambda d: room_tone(d) + birds(d, int(d * .5), 49) * .3, 'castle': lambda d: wind(d, .12) * .4, 'field': lambda d: wind(d, .15) * .3 + stream(d) * .3, 'city': lambda d: city_murmur(d) + steps(d, .45, 120, 800) * .2,
    'coldwind': lambda d: wind(d, .2) * .7, 'battlewind': lambda d: wind(d, .15), 'battle': lambda d: P(shouts(d) * .5, wind(d, .2) * .4), 'fire': lambda d: fire(d) * .7,
    'rain': lambda d: rain(d), 'bamboo': lambda d: texture(d, 1500, 7000, .5, .5) * .6, 'mountain': lambda d: hp(wind(d, .2), 300) * .6, 'quiet': lambda d: room_tone(d) * .5,
    'dusk': lambda d: wind(d, .1) * .3, 'drill': lambda d: wind(d, .1) * .3, 'sea': lambda d: sea(d),
}
