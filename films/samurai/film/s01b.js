// Section 01 (30,9–55,0): burning castles, the samurai, the lord, "forget the films", come with me.
SH(30.90, '01 Burg brennt', { ang: 'wide', sfx: [[0, 'fire', -10], [0.1, 'crash', -12]], amb: 'fire' }, (c, lt) => {
  skyGrad(c, [[0, '#1a0c10'], [.6, '#5a1e14'], [1, '#c2551e']]);
  castle(c, 960, 980, 1.0, { sil: '#120a0c', ink: '#120a0c', lw: 0 });
  flames(c, 900, 520, 220, 260, lt, 1); flames(c, 1060, 620, 200, 200, lt, 5); flames(c, 760, 740, 160, 160, lt, 9);
  smokeCloud(c, 400, 1600, 600, lt, { col: '40,30,30', a: .5, rise: 120 }); embers(c, lt, 60); vignette(c, .5);
});
SH(31.65, '01 Pferde im Rauch', { ang: 'low', sfx: [[0, 'gallop', -8]] }, (c, lt) => {
  skyGrad(c, [[0, '#2a1410'], [1, '#a2481e']]); smokeCloud(c, -200, 2200, 900, lt, { col: '60,40,30', a: .55, speed: 200 });
  silhouette(c, c => { for (let i = 0; i < 3; i++) drawHorse(c, 300 + i * 520 + lt * 700, 1060, 1.7, { t: lt + i * .3, gallop: true }); }, '18,10,10', .95);
  embers(c, lt, 30); vignette(c, .5);
});
SH(32.30, '01 Fahne fällt', { ang: 'macro', sfx: [[0.1, 'flag', -10], [0.45, 'thud', -12]] }, (c, lt) => {
  skyGrad(c, [[0, '#3a1a14'], [1, '#c8662a']]); smokeCloud(c, 0, 2000, 900, lt, { col: '70,40,30', a: .4 });
  c.save(); c.translate(900, 1100); c.rotate(easeIn(seg(lt, 0, .55)) * 1.1); nobori(c, 0, 0, 900, { w: 170, t: lt * 3, mon: (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo), lw: 4 }); c.restore();
  embers(c, lt, 30); vignette(c, .5);
});
SH(32.85, '01 Familien fliehen', { ang: 'wide', sfx: [[0, 'shouts', -16]] }, (c, lt) => {
  skyGrad(c, [[0, '#2a1814'], [1, '#b8562a']]); ridge(c, -200, 2200, 760, 120, '#3a1c16', 3);
  flames(c, 1500, 760, 300, 200, lt, 3); smokeCloud(c, 800, 2000, 700, lt, { col: '50,35,30', a: .45 });
  silhouette(c, c => { for (let i = 0; i < 6; i++) PS(c, i % 3 === 1 ? 'wife' : 'peasant', 1500 - i * 230 - lt * 260, 1000, .3, { s: -1, walk: lt * 11 + i, expr: EX.sad }); }, '20,12,12', .93);
  vignette(c, .5);
});
SH(33.40, '01 Mittendrin: du', { ang: 'low', sfx: [[0.05, 'armor', -14], [0.9, 'wind', -18]], amb: 'battlewind' }, (c, lt) => {
  skyGrad(c, [[0, '#3a2a28'], [1, '#9a6a4a']]); smokeCloud(c, -200, 2200, 1000, lt, { col: '90,70,60', a: .45, speed: 60 });
  const z = push(lt, 1.54, 1, 1.08); c.save(); c.translate(960, 1080); c.scale(z, z); c.translate(-960, -1080);
  NF(c, 960, 1500, .78, { outfit: 'armor', expr: ex('tense', lt, 2), t: lt, sway: Math.sin(lt * 2) * .4, breathe: lt * 3 });
  c.restore(); smokeCloud(c, -200, 2200, 1200, lt + 4, { col: '110,90,80', a: .35, speed: 90 }); vignette(c, .5);
});
SH(34.94, '01 Ein Samurai', { ang: 'closeup', tr: { type: 'mist', dur: .4 }, sfx: [[0.1, 'swordRing', -14]] }, (c, lt) => {
  skyGrad(c, [[0, '#86aed6'], [1, '#e8ecee']]); castle(c, 1500, 980, .7, { lw: 2.5 });
  c.save(); c.translate(760, 1640); NF(c, 0, 0, .95, { expr: ex('focus', lt, 3), arms: { r: { a: .5, b: -1.38, fist: true } }, breathe: lt * 2 }); c.restore();
  const g = bump(lt, .2, .8); if (g > 0) bloom(c, 760 + 92 * .95, 1640 - 600 * .95, 180, '255,250,220', .9 * g);
  grade2(c, .2, .1, .8, .1); vignette(c, .3);
});
SH(36.08, '01 Verneigung vor dem Herrn', { ang: 'wide', tr: { type: 'shoji', dur: .55 }, sfx: [[0.1, 'shoji', -10], [0.9, 'fabric', -14]], amb: 'interior' }, (c, lt) => {
  const cm = cam(960, 560, push(lt, 2.8, 1, 1.06)); throneSet(c, cm, lt);
  layer(c, cm, 1, c => {
    PF(c, 'daimyo', 960, 700, .3, { seiza: true, expr: { lid: .3, mouth: 'flat' }, arms: { r: { a: .6, b: -1.2 } } }); lordShade(c, 960, 700 + 330 * .3 - 1240 * .3, 262 * .3);
    NS(c, 600, 980, .34, { pose: 'bow', bow: .75 * ease(seg(lt, .5, 1.6)), expr: ex('bow', lt), arms: { near: { hand: [380, -10] }, far: { hand: [360, -10] } } });
  }); vignette(c, .45);
});
SH(38.90, '01 Der Herr (im Schatten)', { ang: 'low', sfx: [[0.2, 'fan', -14]] }, (c, lt) => {
  throneSet(c, cam(960, 420, 1.5), lt);
  const k = .95, arm = { a: .9 + Math.sin(lt) * .05, b: -1.4 }, P = samArmPts(1, arm);
  c.save(); c.translate(960, 1500); PF(c, 'daimyo', 0, 0, k, { expr: { lid: .35, mouth: 'flat' }, arms: { r: Object.assign({ fist: true }, arm) } });
  gunbai(c, P.wx * k, (P.wy + 20) * k, -.5, .8); c.restore(); lordShade(c, 960, 1500 - 1240 * k, 262 * k);
  vignette(c, .6);
});
SH(40.62, '01 Filmklischee: Held im Regen', { ang: 'medium', tr: { type: 'cut', dur: .4 }, sfx: [[0, 'rain', -12], [0.3, 'fakeSting', -12]], amb: 'rain' }, (c, lt) => {
  // deliberately fake: saturated purple/teal, glossy rim light, rain — generic cloaked silhouette (no specific film character)
  skyGrad(c, [[0, '#2a0f45'], [.6, '#1a4a6a'], [1, '#0a1a2a']]); bloom(c, 1500, 300, 700, '0,255,220', .35); bloom(c, 300, 200, 600, '255,0,200', .3);
  const x = 960 - lt * 60;
  c.save(); c.translate(x, 1080); c.fillStyle = '#05040a';
  c.beginPath(); c.moveTo(-60, -820); c.quadraticCurveTo(-260 - Math.sin(lt * 6) * 60, -400, -380 - Math.sin(lt * 5) * 80, -40); c.lineTo(260 + Math.sin(lt * 6) * 40, 0); c.quadraticCurveTo(140, -500, 60, -820); c.closePath(); c.fill();
  circ(c, 0, -900, 110); c.fill(); c.beginPath(); c.ellipse(0, -960, 260, 40, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(-120, -980); c.lineTo(0, -1120); c.lineTo(120, -980); c.fill();
  c.strokeStyle = 'rgba(0,255,230,.8)'; c.lineWidth = 6; c.beginPath(); c.moveTo(70, -820); c.quadraticCurveTo(150, -500, 260, 0); c.stroke(); c.restore();
  rainFx(c, lt, 380, .6, -14);
  c.save(); c.globalAlpha = .9; c.font = `34px ${UI.fontBody}`; c.fillStyle = '#ffde6a'; c.textAlign = 'left'; c.restore();
  vignette(c, .5);
});
SH(42.70, '01 Klischee wird durchgestrichen', { ang: 'closeup', sfx: [[0.9, 'brush', -8], [1.5, 'brush', -8], [2.6, 'paperTear', -8]], amb: 'rain' }, (c, lt) => {
  skyGrad(c, [[0, '#2a0f45'], [1, '#0a2a3a']]); bloom(c, 1300, 500, 800, '0,255,220', .3);
  c.save(); c.translate(960, 1300); c.scale(1.6, 1.6); c.fillStyle = '#05040a'; circ(c, 0, -620, 130); c.fill(); c.beginPath(); c.ellipse(0, -700, 320, 50, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(-200, -480); c.lineTo(200, -480); c.lineTo(320 + Math.sin(lt * 7) * 30, 200); c.lineTo(-320, 200); c.fill(); c.restore();
  rainFx(c, lt, 300, .5, -14);
  MARK(c, lt, 'strike', [300, 200, 1650, 900], .8, { w: 70, col: '#120e0c', dur: 9 }); MARK(c, lt, 'strike', [1650, 200, 300, 900], 1.4, { w: 70, col: '#120e0c', dur: 9 });
  NOTE(c, lt, 'Klischee', 1500, 980, 1.9, { col: UI.red, dur: 9 });
});
SH(45.94, '01 Die Wahrheit: ein stiller Morgen', { ang: 'medium', tr: { type: 'tear', dur: .8 }, sfx: [[0.2, 'birds', -18], [0.4, 'sweep', -14]], amb: 'morning' }, (c, lt) => {
  const cm = cam(960 + lt * 10, 560, 1.05);
  skyGrad(c, [[0, '#8fa6c0'], [1, '#dfe2e0']]);
  layer(c, cm, .3, c => { ridge(c, -200, 2200, 560, 140, '#9aaabb', 3); haze(c, '225,230,235', .4); });
  layer(c, cm, .85, c => { c.fillStyle = '#4a3a2c'; c.fillRect(-200, 620, 2400, 60); shojiWall(c, -100, 200, 2200, 420, { panels: 5, rows: 4, glow: .2, glowCol: '230,235,255', frame: '#2a1c12' }); tileRoof(c, 960, 200, 2600, 200, { tiles: true }); c.fillStyle = '#6a5038'; c.fillRect(-200, 680, 2400, 40); });
  layer(c, cm, 1, c => { c.fillStyle = '#7d7a6a'; c.fillRect(-200, 720, 2400, 400); stoneLantern(c, 1600, 980, 1, {}); mapleTree(c, 1800, 1000, 1.2, lt);
    const sw = Math.sin(lt * 3); NS(c, 700, 980, .3, { expr: ex('focus', lt, 4), arms: { near: { hand: [200 + sw * 80, -120] }, far: { hand: [120 + sw * 80, -460] } }, item: { arm: 'near', ang: .2, fn: c => { stroke(c, [0, -400, 0, 300], 10, '#a7814a'); c.beginPath(); c.moveTo(-60, 300); c.lineTo(60, 300); c.lineTo(90, 420); c.lineTo(-90, 420); c.closePath(); fo(c, '#c9ad6e', 4); } } });
    for (let i = 0; i < 6; i++) { c.save(); c.translate(820 + i * 30 + Math.sin(lt * 3 + i) * 10, 975); c.rotate(i); ell(c, 0, 0, 12, 6); c.fillStyle = '#a0442e'; c.fill(); c.restore(); } });
  grade2(c, .1, .2, .9, 0); vignette(c, .35);
});
SH(48.40, '01 Leise: Tropfen am Bambus', { ang: 'macro', sfx: [[1.1, 'drop', -10]], amb: 'morning' }, (c, lt) => {
  fill(c, '#a9bcae'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#c9d6c6'], [1, '#7d9a7a']]); c.fillRect(0, 0, W, H);
  stroke(c, [600, -20, 640, 1100], 80, '#5f8048'); for (let i = 0; i < 5; i++) stroke(c, [560, 120 + i * 220, 720, 120 + i * 220], 6, '#3f5a30');
  c.save(); c.translate(700, 420); c.rotate(.5); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(300, -60, 640, 60); c.quadraticCurveTo(300, 40, 0, 0); c.fillStyle = '#6a9a48'; c.fill(); c.restore();
  const fallK = seg(lt, 1.0, 1.5), dy = easeIn(fallK) * 700; const dx = 1230, dy0 = 690;
  c.save(); c.beginPath(); c.moveTo(dx, dy0 - 20 + dy); c.quadraticCurveTo(dx + 22, dy0 + 10 + dy, dx, dy0 + 26 + dy); c.quadraticCurveTo(dx - 22, dy0 + 10 + dy, dx, dy0 - 20 + dy); c.fillStyle = 'rgba(220,240,255,.85)'; c.fill(); c.strokeStyle = 'rgba(80,110,130,.6)'; c.stroke(); c.restore();
  const rk = seg(lt, 1.5, 2.3); if (rk > 0) for (let r = 0; r < 3; r++) { ell(c, dx, 1040, 40 + (rk + r * .2) * 300, 10 + (rk + r * .2) * 40); c.lineWidth = 3; c.strokeStyle = `rgba(255,255,255,${.6 * (1 - rk)})`; c.stroke(); }
  vignette(c, .3);
});
SH(50.68, '01 Komm mit', { ang: 'medium', tr: { type: 'sakura', dur: .7 }, sfx: [[0.3, 'fabric', -14]], amb: 'morning' }, (c, lt) => {
  courtyardSet(c, cam(960, 540, 1), lt, { season: 'spring' });
  const wave = bump(lt, .2, 1.4);
  NF(c, 960, 1480, .72, { expr: ex('focus', lt, 5, { look: .2 }), arms: { l: { a: .2 + wave * 1.4, b: -wave * 1.3 } } });
  vignette(c, .3);
});
SH(52.55, '01 Ein ganz normaler Tag', { ang: 'wide', sfx: [[0, 'steps', -14]], amb: 'morning' }, (c, lt) => {
  const x = 1500 - lt * 170, cm = cam(x - 120, 560, 1.15);
  courtyardSet(c, cm, lt, { season: 'spring' });
  layer(c, cm, 1, c => { NS(c, x, 990, .27, { s: -1, walk: lt * 8, expr: ex('focus', lt, 6) }); castShadow(c, x, 120, { alpha: .2 }); });
  vignette(c, .3);
});
