// Section 03 (81,8–110,0): childhood training.
const KID = (o = {}) => Object.assign({ k: .4, col: '#5d7fa6', expr: { mouth: 'flat' } }, o);
SH(81.80, '03 Kalte Halle, Kind kniet', { ang: 'wide', tr: { type: 'black', dur: .5, hold: .4 }, sfx: [[0, 'taiko', -8], [0.6, 'wind', -18]], amb: 'coldwind' }, (c, lt) => {
  dojoSet(c, cam(960, 560, 1.05), lt, { door: false }); ambient(c, 'dark');
  drawChild(c, KID({ x: 960, y: 1000, k: .45, expr: { mouth: 'press' } })); breath(c, 1000, 640, lt, 1); vignette(c, .55);
});
SH(83.90, '03 Strenger Lehrer', { ang: 'low', sfx: [[0.3, 'bokkenTap', -10]], amb: 'coldwind' }, (c, lt) => {
  dojoSet(c, cam(960, 300, 1.5), lt, { door: false }); ambient(c, 'dawn');
  PF(c, 'teacher', 960, 1750, .95, { expr: ex('focus', lt, 14, { browDown: 1 }) }); vignette(c, .45);
});
SH(85.70, '03 Das erste Holzschwert (Hände)', { ang: 'macro', sfx: [[0.3, 'wood', -10]], amb: 'interior' }, (c, lt) => {
  fill(c, '#3a2a1c'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#5a3e28'], [1, '#2a1c12']]); c.fillRect(0, 0, W, H);
  const k = ease(seg(lt, .1, 1.3)); c.save(); c.translate(lerp(1400, 980, k), 520); c.rotate(-.05); drawBokken(c, -400, 0, 1.2); c.restore();
  c.save(); c.translate(lerp(1500, 1080, k), 540); c.scale(2.4, 2.4); samFist(c, 0, 0, Math.PI / 2); c.restore();
  stroke(c, [lerp(1500, 1080, k) + 60, 560, 2100, 700], 220, SAM.haori);
  c.save(); c.translate(720, 560 + (1 - k) * 60); c.scale(1.5, 1.5); noahHandLocal(c, -1.3 + k * .3); c.restore(); stroke(c, [600, 620, -100, 900], 150, '#5d7fa6');
  vignette(c, .4);
});
SH(87.70, '03 Kind mit Holzschwert', { ang: 'medium', sfx: [[0.4, 'swish', -14]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 600, 1.15), lt, { season: 'spring' });
  drawChild(c, KID({ x: 960, y: 1030, k: .62, bokken: true, bokkenAng: -1.4 - bump(lt, .4, 1.1) * .8, arms: { r: { a: .6, b: -.5, fist: true } }, expr: { mouth: 'smile' } })); vignette(c, .3);
});
SH(89.38, '03 Vor Sonnenaufgang üben', { ang: 'wide', tr: { type: 'ink', dur: .5, seed: 21 }, sfx: [[0, 'ink', -8], [0.6, 'swish', -12], [1.2, 'swish', -12]], amb: 'coldwind' }, (c, lt) => {
  courtyardSet(c, cam(960, 560, 1), lt, { season: 'snow', dark: true });
  const sw = Math.sin(lt * 5); drawChild(c, KID({ x: 960, y: 980, k: .42, bokken: true, bokkenAng: -1.8 + sw * 1.3, arms: { r: { a: 1.4 + sw * .6, b: -.4, fist: true } }, expr: { mouth: 'press' } }));
  breath(c, 990, 640, lt, 1); vignette(c, .5);
});
SH(91.40, '03 Zeitraffer: Jahreszeiten', { ang: 'wide', sfx: [[0, 'whooshSoft', -14], [0.5, 'whooshSoft', -16], [1.0, 'whooshSoft', -16], [1.5, 'whooshSoft', -16]], amb: 'garden' }, (c, lt) => {
  const ss = ['snow', 'spring', 'summer', 'autumn'], i = Math.min(3, Math.floor(lt / .48));
  courtyardSet(c, cam(960, 560, 1), lt, { season: ss[i] });
  const sw = Math.sin(lt * 9); drawChild(c, KID({ x: 960, y: 980, k: .42 + i * .03, bokken: true, bokkenAng: -1.8 + sw * 1.3, arms: { r: { a: 1.4 + sw * .6, b: -.4, fist: true } } }));
  c.save(); c.globalAlpha = .25 * (1 - (lt / .48 % 1)); fill(c, '#fff'); c.restore(); vignette(c, .3);
});
SH(93.28, '03 Barfuß im Schnee', { ang: 'low', sfx: [[0.1, 'snowStep', -10], [0.7, 'snowStep', -10], [1.3, 'snowStep', -10]], amb: 'coldwind' }, (c, lt) => {
  courtyardSet(c, cam(960, 200, 2.1), lt, { season: 'snow' });
  for (const [x, ph] of [[760, 0], [1160, 1.5]]) { const lift = Math.max(0, Math.sin(lt * 3 + ph)) * 40; c.save(); c.translate(x, 1000 - lift); c.beginPath(); c.ellipse(0, 0, 150, 60, 0, 0, Math.PI * 2); fo(c, '#ffffff', 8); for (let t = 0; t < 4; t++) { circ(c, 90 + t * 14, -26 + t * 8, 18); fo(c, '#fff', 5); } c.restore(); }
  snowFx(c, lt, 160); breath(c, 980, 300, lt, 2); vignette(c, .4);
});
SH(95.40, '03 Sommerhitze', { ang: 'wide', tr: { type: 'fade', dur: .3 }, sfx: [[0, 'cicadas', -14], [0.3, 'swish', -12]], amb: 'summer' }, (c, lt) => {
  courtyardSet(c, cam(960, 560, 1.05), lt, { season: 'summer' });
  const sw = Math.sin(lt * 7); drawChild(c, KID({ x: 960, y: 1000, k: .46, bokken: true, bokkenAng: -1.8 + sw * 1.3, arms: { r: { a: 1.4 + sw * .6, b: -.4, fist: true } }, expr: { mouth: 'press' } }));
  c.save(); c.globalAlpha = .18; for (let i = 0; i < 8; i++) stroke(c, [0, 900 + i * 20 + Math.sin(lt * 4 + i) * 6, W, 900 + i * 20 + Math.sin(lt * 4 + i + 1) * 6], 4, '#fff'); c.restore(); grade2(c, .35, .05, .1, 0); vignette(c, .3);
});
SH(96.50, '03 Verbundene Hand (Makro)', { ang: 'macro', sfx: [[0.2, 'fabric', -12]], amb: 'summer' }, (c, lt) => {
  fill(c, '#c9a878'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#e2c08a'], [1, '#a47a48']]); c.fillRect(0, 0, W, H);
  c.save(); c.translate(960, 560); c.scale(3.2, 3.2); c.rotate(Math.PI); noahHandLocal(c, 0); for (let i = 0; i < 4; i++) stroke(c, [-40, 10 + i * 14, 40, 16 + i * 14], 8, '#efe9dc'); stroke(c, [-36, 30, 30, 40], 4, 'rgba(190,90,80,.55)'); c.restore();
  vignette(c, .35);
});
SH(97.50, '03 Bogenschießen', { ang: 'pov', tr: { type: 'cut', dur: .25, ang: .3 }, sfx: [[0.05, 'arrow', -8], [0.42, 'thunk', -6]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 540, 1.2), lt, { season: 'autumn' });
  target(c, 1300, 600, 210); const k = seg(lt, 0, .4); if (k < 1) arrow(c, lerp(-200, 1300, k), 600, 0, 1.2); else { arrow(c, 1300, 600, 0, 1.2); const sh = Math.sin(lt * 60) * 6 * Math.exp(-(lt - .4) * 6); c.save(); c.translate(0, sh); c.restore(); }
  vignette(c, .3);
});
SH(98.70, '03 Reiten und Speer', { ang: 'split', sfx: [[0, 'gallop', -10], [0.9, 'swish', -10]], amb: 'field' }, (c, lt) => {
  splitV(c, 1000, 920, c => { villageSet(c, cam(600, 600, 1.2), lt, { road: false }); drawHorse(c, 300 + lt * 200, 980, 1.0, { t: lt, gallop: true, rider: c => { c.save(); c.beginPath(); c.rect(-400, -1200, 800, 880); c.clip(); c.translate(-20, -150); drawChild(c, KID({ x: 0, y: 0, k: .34 })); c.restore(); } }); },
    c => { courtyardSet(c, cam(1400, 560, 1.1), lt, { season: 'autumn' }); const th = bump(lt, .6, 1.2); c.save(); c.translate(1300, 1000); drawChild(c, KID({ x: 0, y: 0, k: .45, arms: { r: { a: 1.4 + th * .4, b: -.2, fist: true }, l: { a: 1.0, b: -.6, fist: true } } })); stroke(c, [-150 + th * 120, -180, 400 + th * 160, -200], 10, '#7a5a30'); poly(c, [400 + th * 160, -212, 460 + th * 160, -200, 400 + th * 160, -188]); c.fillStyle = '#ccc'; c.fill(); c.restore(); });
  vignette(c, .3);
});
SH(100.12, '03 Keine Angst, kein Schmerz', { ang: 'closeup', sfx: [[0.2, 'heartbeat', -16]], amb: 'coldwind' }, (c, lt) => {
  dojoSet(c, cam(960, 300, 1.6), lt, { door: false });
  c.save(); c.translate(960, 760); c.scale(1.1, 1.1); drawChild(c, KID({ x: 0, y: 600, k: 1.1, expr: { mouth: 'press' } })); c.restore(); vignette(c, .45);
});
SH(102.30, '03 Keine Tränen (Makro Auge)', { ang: 'macro', sfx: [[0.5, 'breathIn', -14]], amb: 'coldwind' }, (c, lt) => {
  fill(c, '#e8e4de'); c.save(); c.translate(960, 560); c.scale(5.5, 5.5); c.translate(78, -20); circ(c, -78, 20, 30); c.fillStyle = NOAH.eye; c.fill(); circ(c, -86, 6, 9); c.fillStyle = '#fff'; c.fill();
  const tk = seg(lt, .3, 1.2); ell(c, -60, 58, 6 + tk * 3, 6 + tk * 3); c.fillStyle = `rgba(180,220,255,${.8 * (1 - seg(lt, 1.4, 1.9))})`; c.fill(); stroke(c, [-120, -40, -40, -60], 10, NOAH.brow); c.restore(); vignette(c, .4);
});
SH(104.28, '03 Hinfallen', { ang: 'wide', sfx: [[0.3, 'fall', -8]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 600, 1.1), lt, { season: 'autumn' });
  const f = ease(seg(lt, .1, .4)); c.save(); c.translate(960, 1000); c.rotate(f * 1.35); drawChild(c, KID({ x: 0, y: 0, k: .5, bokken: true, expr: { mouth: 'o' } })); c.restore();
  if (lt > .35) { c.save(); c.globalAlpha = 1 - seg(lt, .35, 1); smokeCloud(c, 900, 1200, 1040, lt, { col: '200,180,150', a: .5, r: 120, n: 6 }); c.restore(); } vignette(c, .3);
});
SH(105.60, '03 Aufstehen, ohne ein Wort', { ang: 'low', sfx: [[0.3, 'fabric', -14]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 400, 1.35), lt, { season: 'autumn' });
  const up = ease(seg(lt, 0, 1.1)); c.save(); c.translate(960, 1150); c.rotate((1 - up) * 1.0); drawChild(c, KID({ x: 0, y: 0, k: .7, bokken: true, arms: { r: { a: .4, b: -.3, fist: true } }, expr: { mouth: 'press' } })); c.restore(); vignette(c, .35);
});
SH(107.68, '03 Kein Jammern', { ang: 'medium', sfx: [[0.4, 'brush', -10]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 600, 1.15), lt, { season: 'autumn' });
  drawChild(c, KID({ x: 800, y: 1030, k: .6, bokken: true, bokkenAng: -1.45, arms: { r: { a: .5, b: -.6, fist: true } }, expr: { mouth: 'press' } }));
  NOTE(c, lt, 'Kein Jammern.', 1400, 500, .3, { size: 70 }); vignette(c, .3);
});
