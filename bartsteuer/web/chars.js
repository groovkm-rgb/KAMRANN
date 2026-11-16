// chars.js: the Bartsteuer cast (all invented cartoon characters). Used by story.js and castcheck.html.
export const TSAR = { tall: true, boots: true, body: '#2f6a3a', bw: 172, detail: ['coat'], hair: '#2a1e1a', hairStyle: 'short', mous: '#2a1e1a', mousStyle: 'handle', legs: '#e8e2d0', bootCol: '#1c1618' };
// nobles: each a different beard personality
export const NOBLES = [
  { body: '#9a1a2a', fit: 0.8, robe: true, bw: 250, detail: ['brocade', { t: 'kaftan', c: '#e8c050' }, { t: 'fur', c: '#6a4a2e' }], hat: { type: 'fur', color: '#5a3a24', crown: '#8a1a24', h: 160, gem: '#3ab070' }, hairStyle: 'bald', bigBeard: 'fork', beardCol: '#3a2618' },      // 0 fat, forked black-brown
  { body: '#2a3a7a', fit: 0.8, robe: true, bw: 175, detail: ['brocade', { t: 'kaftan', c: '#d8b040' }, { t: 'fur', c: '#c8b8a0' }], hat: { type: 'fur', color: '#d8c8b0', crown: '#2a3a7a', h: 190 }, hairStyle: 'bald', bigBeard: 'curly', beardCol: '#c8562a' },   // 1 thin, curly red
  { body: '#6a2a6a', fit: 0.8, robe: true, bw: 205, detail: ['brocade', { t: 'kaftan', c: '#e8c050' }, { t: 'fur', c: '#8a6a4a' }], hat: { type: 'fur', color: '#7a5a3a', crown: '#4a1a4a', h: 140 }, hairStyle: 'bald', bigBeard: 'long', beardCol: '#e8e4dc' },     // 2 old, waist-long white
  { body: '#1e6a5a', fit: 0.8, robe: true, bw: 220, detail: ['brocade', { t: 'kaftan', c: '#f2d060' }, { t: 'fur', c: '#3a2a1e' }], hat: { type: 'fur', color: '#2e2018', crown: '#1e5a4a', h: 175, gem: '#e0383a' }, hairStyle: 'bald', bigBeard: 'spade', beardCol: '#a8a29a' }, // 3 grey spade
  { body: '#b0502a', fit: 0.8, robe: true, bw: 190, detail: ['brocade', { t: 'kaftan', c: '#f2e0a0' }, { t: 'fur', c: '#e8dcc8' }], hat: { type: 'fur', color: '#efe4d0', crown: '#8a3a1a', h: 150 }, hairStyle: 'bald', bigBeard: 'bushy', beardCol: '#6a4024' },   // 4 young, bushy brown
];
export const OFFICIAL = { body: '#4a4a6a', bw: 175, detail: ['collar', 'buttons', 'pocket'], hair: '#8a8478', hairStyle: 'sides', hat: { type: 'tricorn', color: '#2a2630', band: '#c8a040' } };
export const GUARD = (v = 0) => ({ fit: 0.88, body: v ? '#2a4a8a' : '#a8202a', bw: 185, detail: ['uniform'], hairStyle: 'bald', mous: '#2a1e1a', mousStyle: v ? 'brush' : 'handle', hat: { type: 'shako', color: v ? '#1e2a4a' : '#2a1e1e', band: v ? '#e8c050' : '#c8202a' } });
export const PEASANT = { body: '#8a6a4a', bw: 190, detail: [{ t: 'rope', c: '#c8a060' }, 'patch'], hat: { type: 'beanie', color: '#6a5a8a', band: '#c8b490' }, hairStyle: 'bald', bigBeard: 'bushy', beardCol: '#8a5a30' };
export const OLDMAN = { body: '#6a5a8a', robe: true, bw: 200, detail: [{ t: 'scarf', c: '#d8b070' }, { t: 'rope', c: '#a87a3a' }], hair: '#e8e6e2', hairStyle: 'sides' };
export const RICH = { body: '#c8902a', fit: 0.82, robe: true, bw: 290, detail: ['brocade', { t: 'kaftan', c: '#9a1a2a' }, { t: 'fur', c: '#2e2018' }], hat: { type: 'fur', color: '#2e2018', crown: '#c8902a', h: 130, gem: '#3a7be0' }, hairStyle: 'bald', bigBeard: 'curly', beardCol: '#2a1c14' };
export const GENT = (v = 0) => ({ body: ['#6a8ac8', '#c86a8a', '#8ac86a', '#c8a86a'][v % 4], bw: 175, detail: ['collar', 'buttons', { t: 'vest', c: ['#e8d8a8', '#f4f0e8', '#d8c8e8', '#c8e0e8'][v % 4] }], hair: '#f4f2ee', hairStyle: 'wig', hat: v % 2 ? { type: 'tricorn', color: '#2a2630' } : null });
export const COURTIER = (v = 0) => ({ ...NOBLES[v % 5], bw: NOBLES[v % 5].bw * 0.9 });
export const VENDOR = (v = 0) => ({ body: ['#c8502a', '#3a7a4a', '#7a4a8a'][v % 3], bw: 200, detail: [{ t: 'apron', c: '#efe4d0' }, { t: 'scarf', c: '#e8c050' }], hat: v % 2 ? { type: 'beanie', color: '#c8202a', band: '#f4f0e8' } : { type: 'beanie', color: '#3a6a8a', band: '#e8dcc8' }, hairStyle: 'bald', bigBeard: v === 1 ? null : 'spade', beardCol: '#5a3a24', mous: '#3a2418' });

export const CHARS = {
  tsar: { spec: TSAR, opts: { expr: 'manic', glint: true, R: 'up', holdR: 'razor', rim: '#ffd890' } },
  tsarSmug: { spec: TSAR, opts: { expr: 'smug', wink: true, L: 'hip', R: 'chin' } },
  n0: { spec: NOBLES[0], opts: { expr: 'gulp', sweat: true } }, n1: { spec: NOBLES[1], opts: { expr: 'gulp' } }, n2: { spec: NOBLES[2], opts: { expr: 'tender', L: 'belly', R: 'belly' } },
  n3: { spec: NOBLES[3], opts: { expr: 'worried' } }, n4: { spec: NOBLES[4], opts: { expr: 'scared' } },
  n0shaved: { spec: { ...NOBLES[0], bigBeard: null }, opts: { expr: 'shock', shaved: true, L: { x: 260, y: 360 }, R: { x: 340, y: 360 } } },
  n1cry: { spec: { ...NOBLES[1], bigBeard: null }, opts: { expr: 'cry', shaved: true, tears: 0.3 } },
  n3scream: { spec: { ...NOBLES[3], bigBeard: null }, opts: { expr: 'scream', shaved: true, R: { x: 470, y: 300 }, holdR: 'mirror' } },
  official: { spec: OFFICIAL, opts: { expr: 'smug', glasses: true, L: 'forward', holdL: 'ledger', R: 'reach', holdR: 'quill' } },
  guard0: { spec: GUARD(0), opts: { expr: 'determined', L: 'forward', holdL: 'brush', R: 'up', holdR: 'scissors' } },
  guard1: { spec: GUARD(1), opts: { expr: 'smug', R: 'reach' } },
  peasant: { spec: PEASANT, opts: { expr: 'worried', R: 'reach', holdR: 'drumstick' } },
  oldman: { spec: OLDMAN, opts: { expr: 'tender', shaved: true, tilt: 6, headTilt: 8, L: 'forward', R: 'forward', holdR: 'bundle' } },
  oldHeaven: { spec: { ...OLDMAN, bigBeard: 'long', beardCol: '#f4f2ee', hat: { type: 'halo' } }, opts: { expr: 'blissful', R: 'wave' } },
  rich: { spec: RICH, opts: { expr: 'worried', R: 'reach', holdR: 'goldsack' } },
  gent0: { spec: GENT(0), opts: { expr: 'disgust' } }, gent1: { spec: GENT(1), opts: { expr: 'smug' } },
  vendor0: { spec: VENDOR(0), opts: { expr: 'laugh', L: 'belly', R: 'belly' } }, vendor1: { spec: VENDOR(1), opts: { expr: 'laugh' } },
};
