// Sections 5 (TAG 17 theft), 6 (Nia's fever, pharmacy map), 7 (TAG 21 pharmacy run). SOURCE times.
function bubble(c, s, x, y, a = 1, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.font = `600 ${o.size || 46}px FOswald`; const w = c.measureText(s).width + 70, h = (o.size || 46) + 50;
  c.fillStyle = o.bg || '#fff8ec'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 26); c.fill(); c.beginPath(); c.moveTo(x - 20 + (o.tail || 0), y + h / 2 - 2); c.lineTo(x + (o.tail || 0) * 2, y + h / 2 + 40); c.lineTo(x + 24 + (o.tail || 0), y + h / 2 - 2); c.fill();
  c.lineWidth = 6; c.strokeStyle = '#1a1210'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 26); c.stroke();
  c.fillStyle = o.col || '#1a1210'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y + 2); c.restore();
}
const JAMAL_PACK = Object.assign({}, CAST.jamal, { backpack: '#3a5a3a' });
// ---------- storage room (night, torch light) ----------
function storageScene(c, t, lt, o) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#07080c'; c.fillRect(0, 0, W, H);
  const cx = lerp(o.x0 || 0, o.x1 || 0, ez(clamp(lt / 4))); c.translate(-cx, 0);
  for (let i = 0; i < 6; i++) { const x = -200 + i * 420; c.fillStyle = '#1a1d24'; c.fillRect(x, 120, 380, 700); for (let k = 0; k < 5; k++) { c.fillStyle = '#2a2e38'; c.fillRect(x, 200 + k * 130, 380, 14); for (let j = 0; j < 7; j++) if (rnd(i * 50 + k * 9 + j) > (o.empty ? .6 : .2)) { c.fillStyle = ['#8a3a2a', '#c8a040', '#3a6a8a', '#d8d0c0'][(j + k) % 4]; c.fillRect(x + 14 + j * 52, 140 + k * 130, 40, 60); } } }
  c.fillStyle = '#0d0f14'; c.fillRect(-400, 820, W + 1200, 300);
  const lit = (o.lights ?? 0); if (lit) { c.fillStyle = `rgba(255,220,160,${.15 * lit})`; c.fillRect(-400, 0, W + 1200, H); }
  const A = o.act || []; A.forEach(a => { const x = a.x, y = a.y ?? 1040, k = a.k || .42;
    if (a.w === 'noah') { if (a.torch) { const tor = noahSideTorch(c, { x, y, k, s: a.s || 1, th: 1.35, bend: .05, expr: a.expr || { mouth: 'flat' } }); flashlightProp(c, tor.x, tor.y, tor.ang, k * 1.05, 1); torchBeam(c, tor.x + Math.cos(tor.ang) * 30, tor.y + Math.sin(tor.ang) * 30, tor.ang + Math.sin(t) * .02, 1500, .18, 1); } else if (a.pose === 'front') drawNoah(c, { x, y, k, ink: 1.8, expr: a.expr, arms: a.arms }); else drawNoahSide(c, { x: x + (a.v || 0) * lt, y, k, ink: 1.8, s: a.s || 1, walk: a.v ? t * 6 : null, expr: a.expr }); }
    else if (a.pose === 'side') drawPersonSide(c, a.P || PEOPLE[a.w], { x, y, k, s: a.s || 1, expr: a.expr });
    else drawPerson(c, a.P || PEOPLE[a.w], { x, y, k, expr: a.expr, arms: a.arms, tilt: a.tilt }); });
  if (o.cans) for (let i = 0; i < 4; i++) icon(c, 'can', o.cans + i * 40, 760 - (i % 2) * 30, .5, '#c8a040');
  c.restore();
  if (!lit) { const v = c.createRadialGradient(W * .6, H * .55, 150, W * .6, H * .55, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.8)'); c.fillStyle = v; c.fillRect(0, 0, W, H); }
  coldGrade(c, .6); vignette(c, .55);
}
const ALL5 = (e = {}) => [{ w: 'imani', x: 300, expr: { mouth: 'flat', look: .6, ...e.imani }, arms: e.imaniArms }, { w: 'grace', x: 700, expr: { mouth: 'flat', look: .4, ...e.grace }, arms: e.graceArms }, { w: 'jamal', P: JAMAL_PACK, x: 1150, expr: { mouth: 'flat', ...e.jamal }, arms: e.jamalArms }, { w: 'nia', x: 1520, expr: { mouth: 'flat', browUp: .9 } }];
// ---------- Nia lying on a cot (person drawn rotated) ----------
function sickScene(c, t, lt, o) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2a2420'; c.fillRect(0, 0, W, H); c.fillStyle = '#3a322a'; c.fillRect(0, 760, W, 320);
  bloom(c, 300, 260, 600, '255,190,110', .3);
  c.fillStyle = '#4a5a3a'; c.fillRect(380, 640, 1150, 70); line(c, [420, 710, 400, 860], 12, '#2a2a2a'); line(c, [1490, 710, 1510, 860], 12, '#2a2a2a');
  c.save(); c.translate(1380, 600); c.rotate(-Math.PI / 2); drawPerson(c, PEOPLE.nia, { x: 0, y: 0, k: .62, expr: { eyes: 'closed', mouth: 'flat' } }); c.restore();
  c.fillStyle = '#7a5aa8'; c.beginPath(); c.roundRect(420, 560, 820, 130, 40); c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a1a1a'; c.stroke();
  for (let i = 0; i < 3; i++) { const ph = (lt * .8 + i / 3) % 1; c.fillStyle = `rgba(160,210,255,${.8 * (1 - ph)})`; c.beginPath(); c.ellipse(1300 + i * 40, 420 + ph * 60, 9, 14, 0, 0, Math.PI * 2); c.fill(); }
  bloom(c, 1380, 470, 220, '255,80,40', .25 + .1 * Math.sin(t * 3));
  if (o.grace) drawPerson(c, PEOPLE.grace, { x: 560, y: 1120, k: .46, expr: { mouth: 'flat', browUp: .6, look: .7 }, arms: { r: { a: 1.2, b: .6 } } });
  c.restore(); vignette(c, .55);
}
function thermoCard(c, t, lt) {
  card(c, t, lt, { bg: ['#2a1414', '#0a0404'], draw: (c, t, lt) => { const v = ez(clamp(lt / 1.6)), temp = lerp(36.5, 39.8, v); c.save(); c.translate(560, 540); c.fillStyle = '#e8e8ec'; c.beginPath(); c.roundRect(-50, -380, 100, 640, 50); c.fill(); circle(c, 0, 300, 90); c.fill(); c.fillStyle = '#e02020'; circle(c, 0, 300, 64); c.fill(); c.fillRect(-22, 300 - 640 * (v * .85 + .1), 44, 640 * (v * .85 + .1)); for (let i = 0; i < 9; i++) line(c, [50, -320 + i * 70, 90, -320 + i * 70], 6, '#9aa0aa'); c.restore();
    c.font = '260px FAnton'; c.fillStyle = v > .8 ? '#ff4a3a' : '#f6f0e6'; c.fillText(temp.toFixed(1).replace('.', ',') + ' °C', 760, 640); if (v > .95) bigText(c, 'FIEBER', 1260, 820, 110, '#ff9a4a', pop(lt, 1.7)); } });
}
function mapCard(c, t, lt) {
  card(c, t, lt, { title: 'DER WEG ZUR APOTHEKE', bg: ['#14202a', '#060a10'], draw: (c, t, lt) => {
    c.save(); c.fillStyle = '#3a4250'; c.fillRect(180, 300, 640, 600); c.font = '700 54px FOswald'; c.fillStyle = '#f6f0e6'; c.textAlign = 'center'; c.fillText('EINKAUFS-', 500, 580); c.fillText('ZENTRUM', 500, 640);
    c.fillStyle = '#1a2028'; c.fillRect(820, 260, 760, 680); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 4; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(880 + i * 76, 300); c.lineTo(880 + i * 76, 420); c.stroke(); c.beginPath(); c.moveTo(880 + i * 76, 780); c.lineTo(880 + i * 76, 900); c.stroke(); }
    c.fillStyle = '#2a8a4a'; c.fillRect(1580, 440, 220, 260); c.fillStyle = '#fff'; c.fillRect(1670, 500, 40, 120); c.fillRect(1630, 540, 120, 40); c.font = '700 34px FOswald'; c.fillText('APOTHEKE', 1690, 680);
    for (let i = 0; i < 46; i++) { const a = pop(lt, .3 + i * .02, .2); if (a <= 0) continue; c.globalAlpha = a; c.fillStyle = '#ff4a3a'; circle(c, 860 + rnd(i) * 700, 300 + rnd(i + 50) * 620, 10); c.fill(); }
    c.globalAlpha = 1; const r = pop(lt, 1.5, 2.0); c.setLineDash([24, 18]); c.strokeStyle = '#ffd84a'; c.lineWidth = 10; c.beginPath(); c.moveTo(820, 570); c.lineTo(820 + 760 * r, 570); c.stroke(); c.setLineDash([]);
    if (lt > 3.2) bigText(c, '80 METER', 1200, 520, 110, '#ffd84a', pop(lt, 3.3)); c.restore(); } });
}
function dockScene(c, t, lt, o) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const sh = o.slam ? Math.exp(-o.slam * 6) * Math.sin(t * 70) * 24 : 0; c.translate(sh, sh * .5);
  c.fillStyle = '#12151c'; c.fillRect(-50, -50, W + 100, H + 100); c.fillStyle = '#0c0e14'; c.fillRect(-50, 820, W + 100, 400);
  for (let i = 0; i < 4; i++) { c.fillStyle = '#5a4630'; c.fillRect(80 + i * 160, 620 - (i % 2) * 120, 150, 200 + (i % 2) * 120); c.strokeStyle = '#2a2016'; c.lineWidth = 6; c.strokeRect(80 + i * 160, 620 - (i % 2) * 120, 150, 200 + (i % 2) * 120); }
  const dx = 1200; c.fillStyle = '#05060a'; c.fillRect(dx, 220, 420, 600); const open = o.open ?? 0; if (open > 0) { c.fillStyle = '#1a2a44'; c.fillRect(dx, 220, 420 * open, 600); stars(c, dx, dx + 420 * open, 230, 500, t, 20, 4); }
  c.fillStyle = '#3a4250'; c.fillRect(dx + 420 * open, 220, 420 * (1 - open), 600); c.lineWidth = 10; c.strokeStyle = '#0a0c12'; c.strokeRect(dx, 220, 420, 600); c.fillStyle = '#c8c8c8'; c.fillRect(dx + 40 + 420 * open, 520, 80, 20);
  notausgang(c, dx + 210, 150, .6, 1);
  (o.act || []).forEach(a => { if (a.w === 'noah') { if (a.pose === 'front') drawNoah(c, { x: a.x, y: a.y || 1080, k: a.k || .5, ink: 1.8, expr: a.expr, arms: a.arms, sit: a.sit, seatH: a.seatH, bob: a.bob ? Math.sin(t * 10) * 10 : 0 }); else drawNoahSide(c, { x: a.x, y: a.y || 1080, k: a.k || .5, ink: 1.8, s: a.s || 1, walk: a.walk ? t * 12 : null, expr: a.expr, tilt: a.tilt }); }
    else if (a.pose === 'side') drawPersonSide(c, a.P || PEOPLE[a.w], { x: a.x, y: a.y || 1080, k: a.k || .5, s: a.s || 1, walk: a.walk ? t * 12 : null, expr: a.expr });
    else drawPerson(c, a.P || PEOPLE[a.w], { x: a.x, y: a.y || 1080, k: a.k || .5, expr: a.expr, arms: a.arms, sit: a.sit, seatH: a.seatH, bob: a.bob ? Math.sin(t * 10 + 1) * 10 : 0 }); });
  if (o.hand) { const r = o.hand; c.save(); c.translate(dx + 60, 560); line(c, [0, 0, -260 * r, 30], 70, '#0e0b0a'); line(c, [0, 0, -260 * r, 30], 46, '#1b1716'); c.restore(); }
  c.restore(); bloom(c, 1410, 150, 400, '40,230,120', .2); coldGrade(c, .6); vignette(c, .6);
}
function pharmacy(c, t, lt) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#10141a'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) { const x = 80 + i * 470; c.fillStyle = '#d8dee4'; c.fillRect(x, 160, 430, 620); for (let k = 0; k < 4; k++) { c.fillStyle = '#9aa4ae'; c.fillRect(x, 260 + k * 140, 430, 10); for (let j = 0; j < 6; j++) if (rnd(i * 31 + k * 7 + j) > .3) { c.fillStyle = ['#ffffff', '#e8f0f8', '#f8e8e8', '#e8f8ea'][j % 4]; c.fillRect(x + 16 + j * 68, 200 + k * 140, 56, 58); c.fillStyle = ['#d83a3a', '#3a7ad0', '#2a9a5a'][j % 3]; c.fillRect(x + 16 + j * 68, 220 + k * 140, 56, 10); } } }
  c.fillStyle = '#2a9a5a'; c.fillRect(820, 40, 280, 90); c.font = '700 54px FOswald'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('APOTHEKE', 960, 106);
  c.fillStyle = 'rgba(10,14,22,.55)'; c.fillRect(0, 0, W, H);
  const tor = noahSideTorch(c, { x: 760, y: 1100, k: .5, s: 1, th: 1.4, bend: .1, expr: { mouth: 'flat' } }); flashlightProp(c, tor.x, tor.y, tor.ang, .4, .5); torchBeam(c, tor.x, tor.y, tor.ang - .1, 900, .2, .45, '200,220,255');
  const items = [['ANTIBIOTIKA', '#ffffff'], ['FIEBERSAFT', '#f8c8c8'], ['VERBÄNDE', '#e8f0ff']]; items.forEach(([n, col], i) => { const a = pop(t, V(359.82) + i * .7); if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(1250 + i * 210, 640 + (1 - a) * 40); c.fillStyle = col; c.beginPath(); c.roundRect(-80, -60, 160, 120, 10); c.fill(); c.lineWidth = 6; c.strokeStyle = '#1a1a1a'; c.stroke(); c.font = '700 22px FOswald'; c.fillStyle = '#1a1a1a'; c.textAlign = 'center'; c.fillText(n, 0, 8); c.restore(); });
  if (t > V(364.22)) bigText(c, 'GESCHAFFT.', 1300, 300, 150, '#7affa0', pop(t, V(364.22)));
  if (t > V(364.9)) bigText(c, '…DENKST DU.', 1320, 450, 90, '#ff9a8a', pop(t, V(364.9)));
  c.restore(); coldGrade(c, .5); vignette(c, .55);
}
const ZZ = (n, x0, z0, dz = 3) => Array.from({ length: n }, (_, i) => ({ w: 'z' + ((14 + i) % 40), x: x0 + (i % 6) * 4.6 + rnd(i) * 2, z: z0 + Math.floor(i / 6) * dz + rnd(i + 3) * 2, s: rnd(i + 7) > .5 ? 1 : -1, v: .25, dim: .55 }));
const LOTN = (o) => Object.assign({ c0: [-2, 1.2, 36], c1: [2, 1.2, 35.5], l0: [0, 1, 20], fov: 48 }, o);
const SECTION5 = [
  [262.2, 'card', { bg: ['#1a1010', '#060404'], draw: (c, t, lt) => { bigText(c, 'DIE GRÖSSTE GEFAHR', W / 2, 440, 150, '#f6f0e6', pop(lt, .2)); bigText(c, 'KOMMT NICHT IMMER VON DRAUSSEN.', W / 2, 640, 96, '#ff9a4a', pop(lt, 1.2)); } }],
  [265.24, 'fn', { f: (c, t, lt) => { storageScene(c, t, lt, { x0: 0, x1: 120, act: [{ w: 'noah', x: 520, torch: 1 }] }); dayStamp(c, 'TAG 17', 'MITTEN IN DER NACHT', lt); } }],
  [271.5, 'fn', { f: (c, t, lt) => storageScene(c, t, lt, { x0: 200, x1: 300, act: [{ w: 'noah', x: 420, torch: 1, expr: { mouth: 'o', browUp: .8 } }, { w: 'jamal', P: JAMAL_PACK, x: 1450, pose: 'side', s: -1, expr: { mouth: 'o' } }], cans: 1360 }) }],
  [275.08, 'fn', { f: (c, t, lt) => { storageScene(c, t, lt, { x0: 300, x1: 320, act: [{ w: 'noah', x: 420, torch: 1, expr: { mouth: 'flat' } }, { w: 'jamal', P: JAMAL_PACK, x: 1450, pose: 'side', s: -1, expr: { mouth: 'flat' } }], cans: 1360 }); bigText(c, '= ESSEN FÜR 4 TAGE', W / 2, 200, 100, '#ffb36b', pop(lt, .2)); } }],
  [276.74, 'fn', { f: (c, t, lt) => { storageScene(c, t, lt, { lights: 1, act: [{ w: 'noah', x: 1780, pose: 'front', k: .4, expr: { mouth: 'flat', look: -.6 } }].concat(ALL5({ jamal: { mouth: 'o', browUp: 0 }, imani: { mouth: 'o' }, jamalArms: { l: { a: 2.2 + Math.sin(t * 9) * .2, b: .4 }, r: { a: 1.4, b: .6 } }, imaniArms: { r: { a: 1.6, b: 0 } }, graceArms: { l: { a: 1.5, b: 0 }, r: { a: 1.5, b: 0 } } })) }); if (t > V(279)) bubble(c, 'ICH BIN DOPPELT SO GROSS!', 1150, 220, pop(t, V(279)), { tail: -10 }); if (t > V(284.22)) bubble(c, 'RAUS MIT IHM!', 330, 300, pop(t, V(284.22))); } }],
  [287.48, 'fn', { f: (c, t, lt) => { storageScene(c, t, lt, { lights: 1, x0: 0, x1: 100, act: ALL5({ jamal: { look: .8 }, imani: { look: 1 }, grace: { look: 1 } }) }); } }],
  [289.78, 'fn', { f: (c, t, lt) => { storageScene(c, t, lt, { lights: 1, act: [{ w: 'noah', x: 960, pose: 'front', k: .75, y: 1400, expr: { mouth: t > V(292.04) ? 'o' : 'flat', browUp: .1 } }] }); if (t > V(292.04)) bigText(c, 'NEIN.', W / 2, 260, 220, '#f6f0e6', pop(t, V(292.04))); if (t > V(293.74)) bigText(c, 'NIEMAND WIRD DEN ZOMBIES ÜBERLASSEN.', W / 2, 460, 64, '#ffb36b', pop(t, V(293.74))); } }],
  [295.8, 'card', { title: 'AB JETZT', bg: ['#1e1a16', '#0a0806'], draw: (c, t, lt) => { const a = pop(lt, .2); c.save(); c.globalAlpha = a; c.translate(640, 560); icon(c, 'lock', 0, 0, 3.2, '#d8b040'); c.restore(); if (t > V(298.08)) { const b = pop(t, V(298.08)); c.save(); c.globalAlpha = b; c.translate(1240, 600); c.rotate(-.3); c.fillStyle = '#d8b040'; circle(c, 0, 0, 60); c.fill(); c.fillStyle = '#0a0806'; circle(c, 0, 0, 26); c.fill(); c.fillStyle = '#d8b040'; c.fillRect(50, -16, 240, 32); c.fillRect(230, 0, 26, 60); c.fillRect(180, 0, 26, 44); c.restore(); bigText(c, 'GRACE', 1300, 860, 110, '#f6f0e6', b); } } }],
];
const SECTION6 = [
  [300.26, 'fn', { f: (c, t, lt) => sickScene(c, t, lt, {}) }],
  [303.88, 'fn', { f: thermoCard }],
  [306.86, 'fn', { f: (c, t, lt) => { sickScene(c, t, lt, { grace: 1 }); if (t > V(312.1)) bigText(c, 'ENTZÜNDUNG', W / 2, 220, 130, '#ff6a4a', pop(t, V(312.1))); if (t > V(313.36)) bigText(c, 'OHNE ANTIBIOTIKA: GEFÄHRLICH', W / 2, 380, 64, '#f6f0e6', pop(t, V(313.36))); } }],
  [315.44, 'fn', { f: mapCard }],
];
const SECTION7 = [
  [328.02, 'lot', LOTN({ c0: [0, 6, 36.2], c1: [0, 4, 36.2], l0: [0, 2, 10], fov: 50, act: ZZ(18, -14, 12), fx: (c, t, lt) => dayStamp(c, 'TAG 21', '04:00 UHR', lt) })],
  [330.8, 'card', { title: 'WAS ZOMBIES ANLOCKT', draw: (c, t, lt) => { const a = pop(lt, .2), b = pop(lt, .8); c.save(); c.globalAlpha = a; c.fillStyle = '#ffd84a'; circle(c, 640, 480, 110); c.fill(); c.fillRect(600, 590, 80, 70); bloom(c, 640, 480, 300, '255,220,80', .4); c.font = '600 60px FOswald'; c.fillStyle = '#f6f0e6'; c.textAlign = 'center'; c.fillText('LICHT', 640, 780); c.globalAlpha = b; c.fillStyle = '#9ad0ff'; c.beginPath(); c.moveTo(1180, 420); c.lineTo(1240, 420); c.lineTo(1320, 340); c.lineTo(1320, 620); c.lineTo(1240, 540); c.lineTo(1180, 540); c.fill(); for (let i = 1; i < 4; i++) { c.strokeStyle = '#9ad0ff'; c.lineWidth = 10; c.beginPath(); c.arc(1330, 480, 40 + i * 40, -.6, .6); c.stroke(); } c.fillText('GERÄUSCHE', 1290, 780); c.restore();
    if (t > V(334.7)) { c.save(); c.strokeStyle = '#ff3a3a'; c.lineWidth = 26; const p1 = pop(t, V(334.7), .25); c.beginPath(); c.moveTo(500, 340); c.lineTo(500 + 280 * p1, 340 + 280 * p1); c.stroke(); c.restore(); bigText(c, 'KEINE TASCHENLAMPE', 640, 920, 60, '#ff6a5a', pop(t, V(334.7))); }
    if (t > V(336.72)) { c.save(); c.strokeStyle = '#ff3a3a'; c.lineWidth = 26; const p2 = pop(t, V(336.72), .25); c.beginPath(); c.moveTo(1140, 340); c.lineTo(1140 + 300 * p2, 340 + 300 * p2); c.stroke(); c.restore(); bigText(c, 'KEIN WORT', 1290, 920, 60, '#ff6a5a', pop(t, V(336.72))); } } }],
  [337.3, 'fn', { f: (c, t, lt) => { dockScene(c, t, lt, { act: [{ w: 'noah', x: 520, pose: 'front', k: .48, expr: { mouth: 'flat', look: .6 } }, { w: 'jamal', x: 900, k: .52, expr: { mouth: 'smile', browUp: .3 }, arms: { r: { a: 2.7, b: .2 } } }] }); if (t > V(339.84)) bubble(c, 'ICH HAB NOCH WAS GUTZUMACHEN.', 960, 220, pop(t, V(339.84)), { size: 40 }); } }],
  [342.36, 'lot', LOTN({ c0: [-6, 1.0, 36.2], c1: [2, 1.0, 36.2], l0: [0, .9, 28], l1: [6, .9, 28], fov: 46, act: [{ w: 'noah', x: -3, z: 32.5, s: 1, v: 1.2, pose: 'walk', sc: .85 }, { w: 'jamal', x: -4.6, z: 32, s: 1, v: 1.2, pose: 'walk', sc: .85 }].concat(ZZ(12, -14, 14)) })],
  [346.82, 'lot', LOTN({ c0: [3, 1.0, 36.2], c1: [5, 1.0, 36.2], l0: [-2, 1, 25], fov: 44, act: [{ w: 'noah', x: -1, z: 32, s: 1, pose: 'side', sc: .85, expr: { mouth: 'flat' } }, { w: 'jamal', x: -3, z: 31.6, s: 1, pose: 'side', sc: .85 }].concat(ZZ(14, -16, 18, 4)), fx: (c, t, lt) => { for (let i = 0; i < 5; i++) { const ph = (lt * .4 + i / 5) % 1; c.save(); c.globalAlpha = .25 * Math.sin(ph * Math.PI); c.strokeStyle = '#8aa060'; c.lineWidth = 6; c.beginPath(); for (let y = 0; y < 120; y += 8) c.lineTo(200 + i * 360 + Math.sin(y * .06 + t * 2 + i) * 20, 700 - ph * 300 - y); c.stroke(); c.restore(); } } })],
  [350.6, 'lot', LOTN({ c0: [-1.5, 1.1, 36.2], c1: [-1.3, 1.1, 36.2], l0: [-.5, 1.1, 30], fov: 34, act: [{ w: 'noah', x: -1.6, z: 31.4, s: 1, pose: 'side', expr: { mouth: 'flat', eyes: 'closed' } }, { w: 'z5', x: .3, z: 31, s: -1, pose: 'stand', dim: .45 }] })],
  [354.94, 'lot', LOTN({ c0: [-1.5, 1.1, 36.2], l0: [-.5, 1.1, 30], fov: 34, act: [{ w: 'noah', x: -1.6, z: 31.4, s: 1, pose: 'side', expr: { mouth: 'o', eyes: 'open' } }, { w: 'z5', x: .3, z: 31, s: 1, v: .4, dim: .45 }] })],
  [356.16, 'fn', { f: pharmacy }],
  [365.7, 'lot', LOTN({ c0: [-2, 1.1, 36.2], c1: [-1, 1.1, 36.2], l0: [-6, 1, 30], fov: 40, alarm: 0, act: [{ w: 'jamal', x: -9.5, z: 31.6, s: 1, pose: 'side', expr: { mouth: 'o' } }, { w: 'noah', x: -11, z: 32, s: 1, pose: 'side' }].concat(ZZ(10, -16, 18, 4)) })],
  [371.0, 'lot', LOTN({ c0: [-2, 1.2, 36.2], l0: [-8, 1.6, 30], fov: 44, act: ZZ(16, -18, 16, 4).map(a => ({ ...a, pose: 'stand', v: 0 })), fx: (c, t, lt, P) => { const on = Math.floor(t * 4) % 2; const q = P(-12, 1, 31); bloom(c, q.x, q.y, 500, on ? '255,140,30' : '255,40,40', .6); if (lt > 0) bigText(c, 'MIIEP! MIIEP!', W - 420, 200, 90, '#ffb36b', pop(lt, .1)); } })],
  [373.0, 'lot', LOTN({ c0: [-4, 1.3, 36.2], l0: [-6, 1.5, 22], fov: 50, act: ZZ(18, -18, 14, 4).map(a => ({ ...a, pose: 'front', dim: .5 })), fx: (c, t) => { const q = MALL3D.proj(-12, 1, 31); bloom(c, q.x, q.y, 500, Math.floor(t * 4) % 2 ? '255,140,30' : '255,40,40', .5); } })],
  [375.52, 'lot', LOTN({ c0: [6, 1.2, 36.2], c1: [-2, 1.2, 36.2], l0: [2, 1.1, 28], l1: [-6, 1.1, 28], fov: 46, act: [{ w: 'noah', x: 4, z: 33, s: -1, v: 4.2, run: 1 }, { w: 'jamal', x: 5.4, z: 32.4, s: -1, v: 4.2, run: 1 }].concat(Array.from({ length: 9 }, (_, i) => ({ w: 'z' + (20 + i), x: 9 + i * 1.6, z: 30 + (i % 3) * 1.5, s: -1, v: 2.4, dim: .5 }))) })],
  [378.96, 'fn', { f: (c, t, lt) => dockScene(c, t, lt, { open: 1, hand: ez(clamp(lt / .4)), act: [{ w: 'noah', x: lerp(1050, 1260, ez(clamp(lt / .6))), s: -1, expr: { mouth: 'o', browUp: 1 }, tilt: .2 }, { w: 'jamal', x: 700, pose: 'side', s: 1, walk: 1, expr: { mouth: 'o' } }] }) }],
  [382.56, 'fn', { f: (c, t, lt) => { const sl = t > V(384.9) ? t - V(384.9) : 0; dockScene(c, t, lt, { open: sl ? 0 : 1 - ez(clamp((t - V(384.42)) / .4)), slam: sl, act: [{ w: 'noah', x: lerp(1150, 600, ez(clamp(lt / .9))), s: -1, expr: { mouth: 'o' }, tilt: -.2 }, { w: 'jamal', x: lerp(800, 1200, ez(clamp(lt / 1.2))), pose: 'side', s: 1, expr: { mouth: 'flat' } }] }); if (sl > 0 && sl < .15) { c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(0, 0, W, H); } if (sl > 0) bigText(c, 'RUMMS!', 1400, 260, 140, '#f6f0e6', pop(sl, 0, .15)); } }],
  [386.5, 'fn', { f: (c, t, lt) => { const laugh = t > V(388.6); dockScene(c, t, lt, { act: [{ w: 'noah', x: 760, pose: 'front', k: .5, sit: true, seatH: 120, expr: { mouth: laugh ? 'smile' : 'o', eyes: laugh ? 'closed' : 'open' }, bob: laugh }, { w: 'jamal', x: 1080, k: .52, sit: true, seatH: 120, expr: { mouth: laugh ? 'grin' : 'o', eyes: laugh ? 'closed' : 'open' }, bob: laugh }] }); if (laugh) bigText(c, 'HAHAHA', 960, 260, 120, '#ffd84a', pop(t, V(389))); } }],
];
MAIN = MAIN.concat(SECTION5, SECTION6, SECTION7);
// lot shots with an all-cars alarm flag fall back to hazard timing
