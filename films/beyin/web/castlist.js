export default (T) => {
  const C = (O, o) => (p) => T.person(p, O, o);
  const PR = (n, ...a) => (p) => { p.g.translate(300, 500); p.g.scale(0.7, 0.7); T.PROP[n](p, ...a); };
  const O = {
    prisoner: { top: '#f39a3c', pants: '#f39a3c', build: 'big', sleeves: 'short', tattoo: true, skin: '#e8b48a', hair: '#3b2a20' },
    guard: { top: '#3b5b8a', pants: '#2c3a5e', hat: 'guard', uniform: true, moustache: '#4a3020', skin: '#f5c9a0', shoes: '#1b1b1b' },
    thin: { top: '#3b5b8a', pants: '#2c3a5e', hat: 'guard', uniform: true, build: 'thin', skin: '#ecd0b6', shoes: '#1b1b1b' },
    sci: { top: '#9ad0e0', pants: '#4a5466', coat: '#f7f9fb', glasses: true, hair: '#2b211c', skin: '#c99067' },
    res: { top: '#f1ead8', pants: '#5a4a3a', cardigan: '#d9a441', glasses: true, hair: '#8a5a34', bun: true, skin: '#f5c9a0', skirt: '#5a6a8a' },
    pat: { top: '#a9d4ef', gown: '#a9d4ef', hair: '#5a3b2a', skin: '#f5c9a0' },
    nurse: { top: '#7fd0c0', pants: '#7fd0c0', hat: 'nurse', hair: '#2b211c', bun: true, skin: '#c99067' },
    taster: { top: '#ffffff', pants: '#2b2b33', apron: '#7a1830', bowtie: '#1b1b1b', hair: '#3b2a20', skin: '#f5c9a0' },
    vol: { top: '#6fbf73', pants: '#3b3f52', sneakers: true, hair: '#c2733a', electrode: true, skin: '#ffe2c2' },
    rush: { top: '#ffffff', pants: '#3a4a6a', tie: '#d23c3c', hair: '#2b211c', skin: '#f5c9a0', shoes: '#2a1a12' },
    wheel: { top: '#c25a7a', pants: '#3b3f52', wheelchair: true, hair: '#1e1714', long: true, skin: '#a86a48' },
    old: { top: '#8a7ab8', skirt: '#6b5a9a', hair: '#e8e8ee', bun: true, glasses: true, skin: '#f3d6bb' },
    fire: { top: '#2b2b33', pants: '#2b2b33', hat: 'fire', fireCoat: true, skin: '#ecd0b6', moustache: '#4a3020' },
    jock: { top: '#3f6fb5', pants: '#2b2b33', jersey: '#ffffff', build: 'big', sleeves: 'short', hair: '#2b211c', skin: '#a86a48' },
  };
  return [
    (p) => T.brain(p, { expr: 'neutral' }), (p) => T.brain(p, { expr: 'happy', R: 'wave', wv: 1 }), (p) => T.brain(p, { expr: 'smug', R: 'knock' }), (p) => T.brain(p, { expr: 'wow', L: 'shrug', R: 'shrug', legs: 'jump' }),
    (p) => T.brain(p, { expr: 'worried', R: 'facepalm' }), (p) => T.brain(p, { shadow: true }), (p) => T.brain(p, { expr: 'excited', wheel: 1, L: 'wheel', R: 'wheel', wa: 0.4 }), (p) => T.brain(p, { expr: 'happy', wineGlasses: true, L: 'glasses', R: 'glasses' }),
    (p) => { T.brain(p, { expr: 'happy', L: 'sign', R: 'sign' }); }, (p) => { p.g.translate(0, -100); T.dotSign(p, 3); },
    C(O.prisoner, { expr: 'angry', L: 'fist', R: 'hang' }), C(O.guard, { expr: 'stern', R: 'hold', heldR: { k: 'stopwatch', t: 0.3 } }), C(O.thin, { expr: 'smile', L: 'wrestle', wr: 0.5 }), C(O.sci, { expr: 'shrug', L: 'shrug', R: 'shrug' }), C(O.res, { expr: 'shock', R: 'hold', heldR: { k: 'folder', ic: 'tree' } }),
    C(O.pat, { expr: 'sad', mode: 'sit' }), C(O.nurse, { expr: 'calm', R: 'out' }), C(O.taster, { expr: 'bliss', R: 'mouth' }), C(O.taster, { expr: 'yuck', R: 'thumbdown', heldL: { k: 'glass', col: '#b0122a', level: 0.4 }, L: 'hold' }), C(O.vol, { expr: 'ouch', mode: 'sit' }),
    C(O.rush, { expr: 'nervous', R: 'press', L: 'hold', heldL: { k: 'cup', slosh: 1 } }), C(O.wheel, { expr: 'grin', mode: 'sit' }), C(O.old, { expr: 'smile', R: 'hold', heldR: { k: 'cane' } }), C(O.fire, { expr: 'stern', R: 'press', heldR: { k: 'key' } }), C(O.jock, { expr: 'sleepy', L: 'belly', R: 'belly' }),
    PR('roller'), PR('can', 0.8), PR('wineGlass', '#f3e6a2', 0.55, 0.6), PR('bottle', 'fancy'), PR('bottle', 'cheap'),
    PR('pillHalf', 0.6), PR('hourglass', 0.4), PR('clock', 3.3), PR('folder', 'brick', true), PR('brochure', 'rich'),
    PR('brochure', 'cheap'), PR('priceTag', 1), PR('gauge', 0.7), PR('thought', 'raspberry'), PR('thought', 'cherry'),
    PR('cloud', '#e53935', 1), PR('panel', 1), PR('meta', 0.2), PR('tree', 0.7), PR('buttonBox', 1, 0),
  ];
};
