// Section 10 (354,7–403,0): the battle — no blood, silhouettes and dramatic light.
function battleField(c, lt, o = {}) {
  const cm = o.cam || cam(960 + lt * 20, 540, 1.02);
  skyGrad(c, [[0, '#5a4048'], [.5, '#c07a5a'], [.75, '#d8b098'], [1, '#9a9290']]);
  layer(c, cm, .05, c => { bloom(c, 980, 420, 500, '255,170,120', .45); circ(c, 980, 420, 110); c.fillStyle = '#ffc890'; c.fill(); });
  layer(c, cm, .15, c => { ridge(c, -400, 2400, 640, 160, '#6b545a', 2, { freq: 4 }); haze(c, '230,190,170', .25); });
  layer(c, cm, .4, c => { c.fillStyle = '#7a6a62'; c.fillRect(-500, 690, 3000, 500); mistBand2(c, 700, 70, '240,215,200', .65); bannerArmy(c, -300, 780, 700, 90, 60, lt, { col: '#2a1a22', seed: 1, men: true }); bannerArmy(c, 1160, 2300, 702, 90, 60, lt + 1, { col: '#22301e', seed: 9, men: true, face: -1 }); });
  if (o.smoke) smokeCloud(c, -200, 2200, 900, lt, { col: '230,225,220', a: .5 * o.smoke, speed: 40, r: 300 });
}
SH(354.70, '10 Nebliger Morgen, zwei Heere', { ang: 'wide', tr: { type: 'mist', dur: .6, col: '220,210,205' }, sfx: [[0, 'battlewind', -12]], amb: 'battlewind', mus: 'taiko' }, (c, lt) => { battleField(c, lt); vignette(c, .4); });
SH(356.40, '10 Nebel über dem Gras (Makro)', { ang: 'macro', sfx: [[0.2, 'grassWind', -12]], amb: 'battlewind' }, (c, lt) => {
  skyGrad(c, [[0, '#c9a896'], [1, '#8a8682']]); mistBlobs(c, -200, 2200, 600, lt, { n: 16, col: '240,230,225', a: .55, speed: 50, r: 400 });
  for (let i = 0; i < 90; i++) { const x = i * 22 + rnd(i) * 20, h = 300 + rnd(i + 1) * 500; stroke(c, [x, 1100, x + Math.sin(lt * 1.5 + i * .4) * 30, 1100 - h], 8 + rnd(i) * 6, i % 3 ? '#4a5a3c' : '#5d6e48'); } for (let i = 0; i < 20; i++) { circ(c, rnd(i) * W, 600 + rnd(i + 2) * 400, 5); c.fillStyle = 'rgba(230,240,255,.7)'; c.fill(); }
  mistBlobs(c, -200, 2200, 900, lt + 3, { n: 10, col: '240,230,225', a: .5, speed: 80, r: 300 }); vignette(c, .35);
});
SH(358.10, '10 Tausende Krieger (sehr weit)', { ang: 'wide', sfx: [[0.3, 'armyMurmur', -14]], amb: 'battlewind' }, (c, lt) => { battleField(c, lt, { cam: cam(960, 500, .92) }); layer(c, cam(960, 500, .92), .7, c => { bannerArmy(c, -600, 700, 880, 240, 20, lt, { col: '#1c1218', seed: 3, men: true }); bannerArmy(c, 1300, 2600, 884, 240, 20, lt + 2, { col: '#18241a', seed: 5, men: true, face: -1 }); }); vignette(c, .4); });
SH(360.30, '10 Fahnen flattern (Makro)', { ang: 'macro', sfx: [[0, 'flag', -6]], amb: 'battlewind' }, (c, lt) => {
  skyGrad(c, [[0, '#b07a60'], [1, '#e0c0a8']]); for (let i = 0; i < 4; i++) nobori(c, 200 + i * 450, 1300, 1400, { w: 300, t: lt * 2 + i, seed: i, col: i % 2 ? '#e9e4d6' : SAM.indigo, mon: i % 2 ? (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo) : (c, x, y, r) => drawKamon(c, x, y, r, '#e9e4d6'), lw: 5 }); vignette(c, .35);
});
SH(361.50, '10 Trommeln schlagen', { ang: 'low', sfx: [[0.1, 'taiko', -4], [0.7, 'taiko', -4], [1.25, 'taiko', -4]], amb: 'battlewind' }, (c, lt) => {
  skyGrad(c, [[0, '#6a4a48'], [1, '#c89a80']]); const h = Math.abs(Math.sin(lt * Math.PI / .58)); taikoDrum(c, 960, 1160, 1.5, 1 - h);
  for (const s of [-1, 1]) { c.save(); c.translate(960 + s * 380, 500 - h * 200); c.rotate(s * (.6 - h * .6)); c.beginPath(); c.roundRect(-18, -20, 36, 380, 14); fo(c, '#c9a070', 5); c.restore(); }
  const s2 = shake(lt, 6 * (1 - h)); c.translate(s2[0], s2[1]); vignette(c, .4);
});
SH(363.10, '10 Dein Herz schlägt mit', { ang: 'closeup', sfx: [[0.2, 'heartbeat', -6], [1.0, 'heartbeat', -6]], amb: 'battlewind' }, (c, lt) => {
  battleField(c, lt, { cam: cam(960, 300, 2.0) }); HEADCU(c, 960, 600, 1.05, ex('tense', lt, 61), 0, 'helmet', { outfit: 'armor', flag: false, breathe: lt * 6 }); breath(c, 1060, 760, lt, 1.5);
  const b = Math.pow(Math.abs(Math.sin(lt * 4)), 8); c.save(); c.globalAlpha = .15 * b; fill(c, '#a02020'); c.restore(); vignette(c, .5);
});
SH(365.00, '10 T7 Schlachtkarte', { ang: 'table', tr: { type: 'scroll', dur: .55 }, sfx: [[0, 'scroll', -8], [0.3, 'brush', -14], [0.7, 'hanko', -10], [1.2, 'brush', -12], [1.4, 'brush', -12], [2.3, 'brush', -10], [2.6, 'brush', -12]] }, (c, lt) => tSchlachtkarte(c, lt));
SH(369.30, '10 Ein lauter Knall: Gewehrreihe', { ang: 'wide', tr: { type: 'cut', dur: .25, ang: .2 }, sfx: [[0.05, 'gunVolley', 0], [0.1, 'smokeHiss', -10]], amb: 'battle' }, (c, lt) => {
  battleField(c, lt, { cam: cam(1300, 600, 1.4), smoke: seg(lt, 0, .6) });
  for (let i = 0; i < 9; i++) { const x = 300 + i * 190; PS(c, 'ashigaru', x, 1060, .26, { s: -1, expr: EX.focus, arms: { near: { hand: [200, -980], fist: true }, far: { hand: [160, -960], fist: true } } }); tanegashima(c, x - 60, 1060 - 250, Math.PI + .02, .5, { flash: bump(lt, .02, .3) }); }
  const f = bump(lt, 0, .25); if (f > 0) { c.save(); c.globalAlpha = .5 * f; fill(c, '#fff'); c.restore(); } const s = shake(lt, 14 * Math.exp(-lt * 5)); c.translate(s[0], s[1]); vignette(c, .4);
});
SH(370.80, '10 Noch einer – Schock', { ang: 'closeup', sfx: [[0.1, 'gunShot', -2]], amb: 'battle' }, (c, lt) => {
  battleField(c, lt, { cam: cam(960, 300, 2.0), smoke: 1 }); const s = shake(lt, 10 * Math.exp(-lt * 6)); c.save(); c.translate(s[0], s[1]); HEADCU(c, 960, 600, 1.05, ex('shock', lt, 62), 0, 'helmet', { outfit: 'armor', flag: false }); c.restore();
  smokeCloud(c, -200, 2200, 900, lt, { col: '240,235,230', a: .5, speed: 120, r: 360 }); vignette(c, .5);
});
SH(372.00, '10 Gewehre: Bauer lädt nach', { ang: 'closeup', sfx: [[0.2, 'ramrod', -8], [1.4, 'fuse', -10]], amb: 'battle' }, (c, lt) => {
  battleField(c, lt, { cam: cam(960, 400, 1.7), smoke: .7 }); PF(c, 'ashigaru', 820, 1700, .85, { expr: ex('focus', lt, 63), arms: { l: { a: .9, b: -1.4, fist: true }, r: { a: .5, b: -1.6, fist: true } } });
  tanegashima(c, 1050, 980, -1.35, .9, { fuse: true, t: lt }); stroke(c, [1080, 300 + Math.sin(lt * 8) * 60, 1090, 700], 8, '#8a6a40'); vignette(c, .45);
});
SH(374.80, '10 Lunte und Rauch (Makro)', { ang: 'macro', sfx: [[0.2, 'fuse', -6]], amb: 'battle' }, (c, lt) => { fill(c, '#3a2a22'); c.save(); c.translate(960, 540); c.scale(2.6, 2.6); tanegashima(c, -200, 0, -.05, 1, { fuse: true, t: lt * 2 }); c.restore(); vignette(c, .5); });
SH(377.20, '10 T8 Bogen gegen Gewehr', { ang: 'table', tr: { type: 'ink', dur: .5, seed: 81 }, sfx: [[0, 'ink', -8], [0.2, 'brush', -12], [0.4, 'brush', -12], [1.2, 'brush', -14], [1.9, 'brush', -14], [2.4, 'brush', -10], [2.7, 'hanko', -6]] }, (c, lt) => tBogenGewehr(c, lt));
SH(381.50, '10 Ein Bauer gegen ein Leben voll Training', { ang: 'split', sfx: [[0.2, 'fuse', -10], [2.3, 'gunShot', -6]], amb: 'battle' }, (c, lt) => {
  splitV(c, 990, 930, c => { battleField(c, lt, { cam: cam(600, 300, 1.8), smoke: .5 }); PF(c, 'ashigaru', 480, 1700, .8, { expr: ex('focus', lt, 64), arms: { l: { a: 1.2, b: -1.2, fist: true }, r: { a: .9, b: -1.5, fist: true } } }); tanegashima(c, 380, 840, -.02, .9, { fuse: true, t: lt }); },
    c => { battleField(c, lt, { cam: cam(1400, 300, 1.8), smoke: .5 }); HEADCU(c, 1440, 600, 1.0, ex('tense', lt, 65), 0, 'helmet', { outfit: 'armor', flag: false }); });
  vignette(c, .35);
});
const CHARGE = [[384.70, 'Pferde stürmen', 'gallop'], [386.00, 'Pfeilregen', 'arrows'], [387.30, 'Zusammenprall', 'clash'], [388.30, 'Fahne fällt', 'flagFall'], [389.30, 'Licht im Rauch', 'shafts']];
CHARGE.forEach(([t0, name, kind], i) => SH(t0, '10 Ansturm: ' + name, { ang: ['low', 'wide', 'medium', 'macro', 'wide'][i], tr: i === 0 ? { type: 'shoji', dur: .35 } : null, sfx: { gallop: [[0, 'gallop', -4], [0.3, 'shouts', -14]], arrows: [[0, 'arrowsVolley', -4]], clash: [[0.2, 'steelClash', -4], [0.6, 'steelClash', -6]], flagFall: [[0.2, 'flag', -8], [0.7, 'thud', -8]], shafts: [[0, 'battleFar', -10]] }[kind], amb: 'battle' }, (c, lt) => {
  skyGrad(c, [[0, '#4a3a3a'], [1, '#a08878']]); smokeCloud(c, -200, 2200, 1000, lt, { col: '200,190,180', a: .5, speed: 200, r: 360 });
  if (kind === 'gallop') silhouette(c, c => { for (let j = 0; j < 4; j++) drawHorse(c, -200 + j * 500 + lt * 900, 1060 + (j % 2) * 30, 1.5, { t: lt + j * .2, gallop: true, rider: c => { c.save(); c.beginPath(); c.rect(-400, -1600, 800, 1280); c.clip(); c.translate(-20, -150); NS(c, 0, 0, .45, { outfit: 'armor', expr: EX.alert, t: lt }); c.restore(); } }); }, '20,14,14', .94);
  if (kind === 'arrows') { for (let j = 0; j < 120; j++) { const ph = (lt * .9 + rnd(j)) % 1, x = rnd(j + 1) * 2400 - 200 + ph * 500, y = -100 + ph * 1100; stroke(c, [x, y, x - 60, y - 70], 4, '#1a1414'); } c.save(); c.globalAlpha = .4; for (let j = 0; j < 40; j++) stroke(c, [rnd(j) * W, 900 + rnd(j + 2) * 180, rnd(j) * W - 40, 860 + rnd(j + 2) * 180], 6, '#000'); c.restore(); }
  if (kind === 'clash') silhouette(c, c => { const s = Math.sin(lt * 9); NS(c, 760, 1100, .55, { outfit: 'armor', expr: EX.alert, t: lt, arms: { near: { hand: [420 + s * 80, -1000], fist: true } } }); drawArmorEnemy(c, { x: 1240, y: 1100, k: .55, ink: 1.6, expr: EX.alert, flag: false, arms: { r: { a: 2.2 + s * .3, b: -.3, fist: true } } }); }, '22,16,16', .9, { col: '255,200,150', a: .35 });
  if (kind === 'clash' && Math.abs(Math.sin(lt * 9)) > .9) bloom(c, 960, 520, 160, '255,240,200', .7);
  if (kind === 'flagFall') { c.save(); c.translate(900, 1200); c.rotate(easeIn(seg(lt, .1, .8)) * 1.3); nobori(c, 0, 0, 1000, { w: 200, t: lt * 3, mon: (c, x, y, r) => drawEnemyMon(c, x, y, r), col: '#2f4a2c', lw: 4 }); c.restore(); }
  if (kind === 'shafts') { sunRays(c, 1100, -200, { n: 9, dir: Math.PI * .55, spread: .6, alpha: .35, t: lt }); silhouette(c, c => { for (let j = 0; j < 7; j++) tinySoldier(c, 200 + j * 260 + Math.sin(lt + j) * 20, 1000, 200, j % 2 ? 1 : -1, '#000', { helmet: true, spear: true }); }, '30,22,22', .85); }
  vignette(c, .45);
}));
SH(390.30, '10 Kein Heldentum: erschöpft im Rauch', { ang: 'medium', sfx: [[0.3, 'breathHeavy', -10]], amb: 'battle' }, (c, lt) => {
  skyGrad(c, [[0, '#5a4a48'], [1, '#a89888']]); smokeCloud(c, -200, 2200, 1000, lt, { col: '200,190,180', a: .55, speed: 60, r: 380 });
  NF(c, 960, 1480, .7, { outfit: 'armor', expr: ex('sad', lt, 66, { lid: .4 }), bob: Math.sin(lt * 5) * 8, breathe: lt * 5, tilt: .05 }); smokeCloud(c, -200, 2200, 1200, lt + 2, { col: '210,200,190', a: .4, speed: 100, r: 300 }); vignette(c, .45);
});
SH(392.20, '10 Ums Überleben (Standbild)', { ang: 'low', tr: { type: 'cut', dur: .3, ang: -.7 }, sfx: [[0.15, 'swish', -6], [0.35, 'freezeHit', -6]], amb: 'battle' }, (c, lt) => {
  const f = freeze(lt, .35); skyGrad(c, [[0, '#3a3034'], [1, '#c09070']]); sunRays(c, 960, -100, { n: 7, dir: Math.PI / 2, spread: .5, alpha: .3 });
  const a = { r: { a: 2.6 - ease(seg(f, 0, .35)) * .6, b: -.2, fist: true }, l: { a: 2.4 - ease(seg(f, 0, .35)) * .6, b: -.3, fist: true } }; NF(c, 960, 1520, .78, { outfit: 'armor', expr: { lid: .05, mouth: 'flat' }, arms: a, t: f });
  const P = samArmPts(1, a.r); c.save(); c.translate(960 + P.wx * .78, 1520 + P.wy * .78); c.rotate(-Math.PI / 2 - .3); c.scale(.7, .7); drawSword(c, { kind: 'katana', naked: true, sheath: false, gleam: .8 }); c.restore();
  if (lt > .35) { c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.7)'; c.fillRect(0, 0, W, H); c.restore(); } vignette(c, .45);
});
SH(393.90, '10 Und um die Ehre', { ang: 'closeup', sfx: [[0.3, 'swordRing', -14]], amb: 'battle' }, (c, lt) => { battleField(c, lt, { cam: cam(960, 300, 2.0), smoke: .6 }); HEADCU(c, 960, 600, 1.05, ex('focus', lt, 67, { lid: .15 }), 0, 'helmet', { outfit: 'armor', flag: false }); vignette(c, .5); });
SH(396.00, '10 Flucht = Schande', { ang: 'wide', sfx: [[0.2, 'runSteps', -10], [1.2, 'brush', -10]], amb: 'battle' }, (c, lt) => {
  battleField(c, lt, { cam: cam(960, 600, 1.15), smoke: .4 }); layer(c, cam(960, 600, 1.15), 1, c => { NS(c, 1000 - lt * 260, 1040, .28, { s: -1, outfit: 'armor', walk: lt * 14, expr: EX.shock, t: lt }); for (let i = 0; i < 3; i++) NS(c, 1450 + i * 140, 1040, .28, { s: -1, outfit: 'armor', expr: EX.focus, t: lt + i, flag: i !== 1 }); });
  NOTE(c, lt, 'Flucht = Schande', 600, 320, .9, { size: 70, col: UI.red }); vignette(c, .4);
});
SH(398.60, '10 Name, Platz, Respekt verloren', { ang: 'macro', sfx: [[0.3, 'clothTear', -8]], amb: 'battlewind' }, (c, lt) => {
  skyGrad(c, [[0, '#6a5a58'], [1, '#a09088']]); const k = ease(seg(lt, .3, 1.6)); for (const s of [-1, 1]) { c.save(); c.translate(960 + s * k * 120, 540 + k * k * 300 * (s > 0 ? 1 : .6)); c.rotate(s * k * .3); c.beginPath(); c.rect(s < 0 ? -260 : 0, -420, 260, 840); c.clip(); c.beginPath(); c.rect(-260, -420, 520, 840); fo(c, '#e9e4d6', 6); drawKamon(c, 0, -60, 170, SAM.indigo); c.restore(); } vignette(c, .45);
});
SH(401.00, '10 Danach: stilles Feld, Krähen', { ang: 'wide', tr: { type: 'mist', dur: .5, col: '200,195,190' }, sfx: [[0.2, 'crow', -10], [1.0, 'crow', -12], [0, 'battlewind', -14]], amb: 'battlewind' }, (c, lt) => {
  skyGrad(c, [[0, '#7a7478'], [1, '#c8c0b8']]); ridge(c, -200, 2200, 700, 140, '#6a6266', 4); haze(c, '210,205,200', .3); c.fillStyle = '#6e6658'; c.fillRect(0, 700, W, 400); mistBand2(c, 760, 90, '230,225,220', .6);
  nobori(c, 1200, 1000, 380, { w: 60, t: lt * .3, mon: (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo), lw: 2 }); c.save(); c.translate(1200, 1000); c.restore();
  for (let i = 0; i < 5; i++) crow(c, 300 + i * 300 + Math.sin(lt + i) * 40, 300 + i * 30, 1.2, lt + i); vignette(c, .45);
});
