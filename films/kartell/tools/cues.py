# Build cues.json for the full film from the shot list (shot type -> ambience/effects) + music plan.
import json, sys
shots = json.load(open(sys.argv[1])); END = 617.41; SPEECH = 599.41
AMB = {  # type: [(fx, gain dB, offset or None=whole shot, dur)]
 'villaGlide': [('pool', -10), ('cicadas', -20)], 'villaView': [('pool', -12), ('cicadas', -20)], 'villaWide': [('pool', -12), ('cicadas', -22), ('bird', -18, .5, 1.5)], 'closeVilla': [('pool', -14)],
 'garage': [('hum', -22)], 'money': [('counter', -6)], 'bedroom': [('hum', -24), ('tick', -18)], 'closeBed': [('tick', -18)], 'dawnWindow': [('tick', -18), ('bird', -20, .4, 1.5)],
 'face': [('heart', -14)], 'cctv': [('tape', -18), ('engine_slow', -9)], 'cup': [('ceramic', -10)], 'mirror': [('road', -12), ('indicator', -14)], 'lock': [('lock', -4, .25, .5)],
 'phone': [('vibrate', -8)], 'sim': [('snap', -2, .6, .3)], 'board': [('scribble', -14, .3, .9)], 'tableT': [('type', -12, 0, 1.6)], 'carton': [('thump', -6, .1, .3), ('tape_rip', -16, .5, .6)],
 'title': [('type', -10, 0, 1.4), ('scribble', -12, 2.0, .9)], 'rewind': [('whoosh', -10), ('tape', -16)], 'depo': [('forklift', -18), ('hum', -24, None, None, 120)], 'depoCrew': [('forklift', -16), ('boots', -20)],
 'closeLager': [('hum', -24, None, None, 120)], 'stamp': [('lock', -4, .7, .5)], 'flat': [('hum', -24), ('road', -22)], 'mahalle': [('road', -18)], 'mahalleWide': [('road', -16)], 'closeMahalle': [('road', -20)],
 'school': [('drip', -12), ('scribble', -14, .3, .9)], 'hospital': [('beep', -16), ('hum', -24)], 'childRoom': [('tick', -24)], 'port': [('crane', -12), ('beep', -18)], 'evidence': [('hum', -22, None, None, 120)],
 'club': [('clubbass', -12)], 'closeClub': [('clubbass', -16)], 'market': [('crowd', -10)], 'marketNoah': [('crowd', -12)], 'fake': [('whoosh', -12)], 'hazard': [('scribble', -12, .3, .9)],
 'sweat': [('sewing', -10)], 'team': [('whoosh', -12), ('boots', -18)], 'front': [('wind', -18), ('road', -22)], 'rivalClose': [('heart', -10)], 'options': [('scribble', -10)],
 'glass': [('glass', -2)], 'slam': [('slam', -2)], 'chair': [('hum', -26)], 'fall': [('thud', -4, .3, .3)], 'away': [('engine_slow', -8)], 'alley': [('wind', -14), ('siren', -26)],
 'supplier': [('heart', -12), ('thump', -6, 1.1, .3)], 'boxClose': [('heart', -10)], 'treppe': [('scribble', -14, .4, .6), ('thump', -16, 1.0, .2)], 'mirrorSelf': [('hum', -24), ('scribble', -12, 1.0, .9)],
 'safehouse': [('siren', -28), ('tick', -20)], 'schoolRun': [('road', -16), ('slam', -16, .4, .4)], 'kitchen': [('hum', -26)], 'kidClose': [], 'motherWin': [('tick', -18)],
 'colombia': [('cicadas', -18), ('bird', -18, .3, 1.5)], 'tunnel': [('wind', -16)], 'court': [('crowd', -24)], 'colorado': [('wind', -12)], 'slit': [('wind', -14)],
 'raid': [('road', -12), ('siren', -20)], 'boots': [('boots', -4)], 'hallway': [('radio', -14)], 'closeHall': [('heart', -10)], 'kidsStairs': [], 'cuffs': [('cuff', -2, .2, .4)],
 'celldoor': [('slam', -2, .5, .9)], 'cell': [('tick', -12)], 'cellPlace': [('tick', -12)], 'closeCell': [('tick', -14)], 'endScreen': [('bird', -28, 1, 1.5), ('wind', -30)], 'hinweis': [('note', -12, .2, 4.0)],
}
cues = []
first_hall = True
for sh in shots:
    a, b, ty = sh['s'], sh['e'], sh['type']; d = b - a
    for item in AMB.get(ty, []):
        fx, g = item[0], item[1]; off = item[2] if len(item) > 2 else None; du = item[3] if len(item) > 3 else None
        if off is None: cues.append({'fx': fx, 't': round(a, 3), 'd': round(d, 3), 'g': g})
        else: cues.append({'fx': fx, 't': round(a + min(off, d * .8), 3), 'd': du, 'g': g})
    if ty == 'hallway' and first_hall: cues.append({'fx': 'break', 't': round(a + .1, 3), 'd': 1.0, 'g': -2}); first_hall = False
# motif: counting machine speeds up over the rise (rate set inside audio via 'counter' + t), in the cell it becomes the clock tick
for c_ in cues:
    if c_['fx'] == 'counter': c_['r'] = round(6 + 14 * min(1, c_['t'] / 420), 2)
# music: drone under the speech; piano for victims, children, cell, finale
cues.append({'fx': 'music', 't': 0, 'd': SPEECH + 1.5})
for s0, s1 in ((279.4, 312.8), (359.0, 375.3), (541.9, 565.8), (565.8, 599.4)):
    cues.append({'fx': 'piano', 't': s0, 'd': s1 - s0, 'g': -14})
cues.append({'fx': 'heart', 't': 220.1, 'd': 13, 'g': -16})
json.dump(cues, open(sys.argv[2], 'w'))
print(len(cues), 'cues')
