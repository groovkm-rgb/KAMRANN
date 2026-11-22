// Section 02 (55,0–81,8): born a samurai, three generations, estates, bowing villagers.
SH(55.00, '02 Wiege mit Familienwappen', { ang: 'medium', tr: { type: 'shoji', dur: .55 }, sfx: [[0.05, 'shoji', -10], [0.8, 'creak', -18]], amb: 'interior', mus: 'koto' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.15), lt, { tod: 'day', andon: false });
  cradle(c, 960, 960, 1.4, lt); babyHead(c, 960, 690, .9, lt); grade2(c, .25, .1, .1, .1); vignette(c, .35);
});
SH(57.30, '02 Baby schläft (Makro)', { ang: 'macro', sfx: [[0.4, 'breathSoft', -20]], amb: 'interior' }, (c, lt) => {
  fill(c, '#e8dcc6'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#f1e6d2'], [1, '#cdbb9c']]); c.fillRect(0, 0, W, H);
  c.save(); c.translate(960, 600); c.scale(1 + lt * .02, 1 + lt * .02); babyHead(c, 0, 0, 3.2, lt); c.restore();
  c.save(); c.beginPath(); c.ellipse(960, 1150, 900, 330, 0, 0, Math.PI * 2); fo(c, '#2f3a5c', 8); drawKamon(c, 1300, 1000, 70, '#f1ece0'); c.restore(); vignette(c, .35);
});
SH(59.76, '02 Geboren, nicht gewählt', { ang: 'overhead', sfx: [[0.5, 'brush', -12]], amb: 'interior' }, (c, lt) => {
  tatamiTop(c, -200, -200, 5, 4, 560, 440, {}); c.save(); c.translate(960, 560); c.rotate(-.1); c.beginPath(); c.ellipse(0, 60, 260, 360, 0, 0, Math.PI * 2); fo(c, '#e9e0cc', 6); c.beginPath(); c.ellipse(0, 160, 240, 260, 0, 0, Math.PI * 2); fo(c, '#2f3a5c', 5); drawKamon(c, 0, 160, 80, '#f1ece0'); babyHead(c, 0, -150, 1.2, lt); c.restore();
  NOTE(c, lt, 'Geboren, nicht gewählt.', 1420, 900, .3, { size: 64 }); vignette(c, .3);
});
SH(61.62, '02 Der Vater', { ang: 'medium', sfx: [[0.2, 'steps', -16]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 540, 1), lt, { season: 'spring' });
  PF(c, 'father', 960, 1500, .72, { expr: ex('focus', lt, 7) }); vignette(c, .3);
});
SH(63.12, '02 Der Großvater', { ang: 'closeup', sfx: [[0.3, 'cough', -20]], amb: 'garden' }, (c, lt) => {
  roomSet(c, cam(1100, 500, 1.5), lt, { tod: 'day' });
  PF(c, 'grandfather', 960, 1700, .95, { expr: ex('calm', lt, 8) }); vignette(c, .35);
});
SH(64.78, '02 Drei Generationen', { ang: 'wide', sfx: [[0.3, 'fabric', -16]], amb: 'garden' }, (c, lt) => {
  const z = push(lt, 2.36, 1.0, 1.1); courtyardSet(c, cam(960, 600, z), lt, { season: 'spring' });
  c.save(); c.translate(960, 980); c.scale(z, z); c.translate(-960, -980);
  PF(c, 'grandfather', 560, 1000, .42, { expr: ex('calm', lt, 9) }); PF(c, 'father', 960, 1000, .44, { expr: ex('focus', lt, 10) }); drawChild(c, { x: 1340, y: 1000, k: .5, col: SAM.indigo, expr: { mouth: 'flat' } });
  const g = bump(lt, .6, 2.2); for (const [x, y] of [[560 - 132 * .42 + 264 * .42, 1000 - 868 * .42], [960 + 132 * .44, 1000 - 868 * .44]]) bloom(c, x, y, 60, '255,240,200', .7 * g);
  c.restore(); vignette(c, .3);
});
SH(67.14, '02 T2 Stände-Pyramide', { ang: 'table', tr: { type: 'scroll', dur: .6 }, sfx: [[0, 'scroll', -8], [0.3, 'brush', -14], [0.8, 'brush', -16], [1.3, 'brush', -16], [1.8, 'brush', -16], [3.9, 'hanko', -8]] }, (c, lt) => tStaende(c, lt, { sealAt: 3.6 }));
SH(71.40, '02 T2: 6–7 von 100', { ang: 'macro', sfx: [[1.4, 'brush', -12]] }, (c, lt) => { c.save(); c.translate(960, 540); c.scale(1.45, 1.45); c.translate(-1060, -470); tStaende(c, 5 + lt, { sealAt: 0 }); c.restore(); MARK(c, lt, 'circle', [1150, 560, 520, 150], 1.2, { w: 12 }); });
SH(73.60, '02 Bauer im Reisfeld', { ang: 'wide', tr: { type: 'mist', dur: .4, col: '230,235,240' }, sfx: [[0.1, 'splash', -14]], amb: 'field' }, (c, lt) => {
  villageSet(c, cam(960 + lt * 30, 540, 1.1), lt, { road: false });
  for (let i = 0; i < 3; i++) PS(c, 'peasant', 600 + i * 380, 1000, .36, { pose: 'standbow', bow: .9 + Math.sin(lt * 2 + i) * .08, expr: EX.focus, arms: { near: { hand: [300, -80] }, far: { hand: [260, -60] } } });
  vignette(c, .3);
});
SH(74.90, '02 Handwerker', { ang: 'medium', sfx: [[0.1, 'plane', -10]], amb: 'workshop' }, (c, lt) => {
  storehouseSet(c, cam(960, 540, 1.1), lt, { sacks: 0 });
  const pl = Math.sin(lt * 6); c.beginPath(); c.rect(500, 840, 900, 50); fo(c, '#c9a070', 4);
  PS(c, 'peasant', 760 + pl * 40, 1000, .42, { pose: 'standbow', bow: .45, expr: EX.focus, arms: { near: { hand: [380 + pl * 60, -300], fist: true }, far: { hand: [340 + pl * 60, -320], fist: true } } });
  for (let i = 0; i < 6; i++) { c.save(); c.translate(1100 + i * 30, 860 - ((lt * 2 + i * .2) % 1) * 80); c.rotate(i); stroke(c, [0, 0, 30, 10], 5, '#e0c090'); c.restore(); } vignette(c, .35);
});
SH(75.75, '02 Händler mit Abakus', { ang: 'closeup', sfx: [[0, 'soroban', -10]], amb: 'city' }, (c, lt) => {
  edoStreetSet(c, cam(900, 500, 1.4), lt); c.save(); c.globalAlpha = .9; PF(c, 'merchant', 960, 1700, .8, { expr: ex('smile', lt, 11), arms: { l: { a: .5, b: -1.3 }, r: { a: .5, b: -1.3 } } }); c.restore(); soroban(c, 960, 1040, 1, lt); vignette(c, .35);
});
SH(77.34, '02 Sie verneigen sich', { ang: 'low', sfx: [[0.3, 'steps', -14], [0.8, 'fabric', -16]], amb: 'field' }, (c, lt) => {
  const x = 300 + lt * 170, cm = cam(960, 620, 1.2);
  villageSet(c, cm, lt);
  layer(c, cm, 1, c => { for (let i = 0; i < 4; i++) { const bx = 700 + i * 260, b = clamp((x - bx + 500) / 300); PS(c, i % 2 ? 'wife' : 'peasant', bx, 1000, .27, { s: -1, pose: 'standbow', bow: b, expr: b > .5 ? EX.closed : EX.focus }); }
    NS(c, x, 1050, .3, { walk: lt * 8, expr: ex('focus', lt, 12) }); });
  vignette(c, .35);
});
SH(79.90, '02 Klingt gut? Warte ab', { ang: 'closeup', sfx: [[0.2, 'tick', -14]], amb: 'field' }, (c, lt) => {
  villageSet(c, cam(960, 400, 1.8), lt, { road: false });
  HEADCU(c, 960, 520, 1.25, ex('focus', lt, 13, { look: lt > .6 ? .9 : 0, browUp: lt > .6 ? .5 : 0 })); vignette(c, .4);
});
