// Sections 3 (TAG 6: power out, rules) and 4 (TAG 11: base, roof farm, TAG 15 radishes). SOURCE times.
// ---------- reusable 2D roof (day / rain / dusk / night) ----------
function roofScene(c, t, lt, o) {
  const cam = { x: lerp(o.x0 ?? 0, o.x1 ?? 0, ez(clamp(lt / (o.dur || 4)))), y: o.cy ?? -300, z: lerp(o.z0 || 1.2, o.z1 || o.z0 || 1.2, ez(clamp(lt / (o.dur || 4)))) };
  const tod = o.tod || 'day', day = tod !== 'night';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H);
  const sk = { day: ['#6fa8dc', '#d4e4ee'], rain: ['#5a6676', '#9aa6b2'], dusk: ['#3a4a8a', '#f0a070'], night: ['#03050d', '#1d2b55'] }[tod]; g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  if (!day) layer(c, cam, .03, c => stars(c, -1400, 1400, -800, 100, t, 160, 5));
  layer(c, cam, .2, c => { for (let i = 0; i < 4; i++) cloud(c, -1200 + i * 700 + t * 12, -560 + (i % 2) * 90, 600, day ? (tod === 'rain' ? '#7a8492' : '#f4f6fa') : '#111a34', day ? 'rgba(255,255,255,.5)' : 'rgba(140,165,225,.25)', 40 + i); });
  layer(c, cam, .3, c => { const b = wy(640, .3, cam); skyline(c, -1600, 1800, b, t, { col: day ? '#8a98aa' : '#0a1022', lit: day ? 0 : .05, fires: o.fires || [[-700, 380, .7], [1250, 330, .9]] }); fogBand(c, -1600, 1800, b - 30, 160, day ? .18 : .25, t, day ? '230,236,244' : NIGHT.fog, 12); });
  layer(c, cam, 1, c => {
    const far = -300, edgeX = 1500;
    c.fillStyle = day ? '#8a8e98' : '#0f1320'; c.fillRect(-3000, far - 60, 6000, 60);
    const gg = c.createLinearGradient(0, far, 0, 400); gg.addColorStop(0, day ? '#a0a4ac' : '#1a2030'); gg.addColorStop(1, day ? '#7a7e88' : '#0c1018'); c.fillStyle = gg; c.fillRect(-3000, far, 6000, 900);
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 4; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(-3000, far + i * i * 4.5); c.lineTo(3000, far + i * i * 4.5); c.stroke(); }
    if (o.hilfe) roofHILFE(c, o.hilfeX ?? 0, -70, 1900, .27, o.hilfe);
    if (o.barrels) { rainBarrel(c, -980, -190, .8); rainBarrel(c, 470, -240, .75, '#2a5a8a'); rainBarrel(c, -620, -240, .7, '#3a7ab0'); tarpTent(c, -1300, -240, .8, '#5a6a3a'); }
    if (o.planters) { const n = o.planters; for (let i = 0; i < 3; i++) planter(c, -300 + i * 340, -210, 300, t + i); }
    if (o.antenna) antennaMast(c, 140, -290, 520);
    if (o.door) { c.fillStyle = day ? '#6a6e78' : '#1a1f2c'; c.fillRect(640, -520, 260, 270); c.fillStyle = '#0a0d14'; c.fillRect(680, -470, 180, 220); }
    if (o.act) o.act.slice().sort((a, b) => a.y - b.y).forEach(a => { c.save(); c.translate(0, a.y); castShadow(c, a.x, 200, { alpha: .22, len: .5 }); const e = a.expr || {};
      if (a.w === 'noah') { if (a.pose === 'front') drawNoah(c, { x: a.x, y: 0, k: .25, ink: 1.8, expr: e, arms: a.arms, bob: a.bob ? Math.sin(t * 9 + a.x) * 10 : 0 }); else drawNoahSide(c, { x: a.x + (a.v || 0) * lt, y: 0, k: .25, ink: 1.8, s: a.s || 1, walk: a.v ? t * 8 : null, expr: e }); }
      else if (a.pose === 'front') drawPerson(c, PEOPLE[a.w], { x: a.x, y: 0, k: .25, expr: e, arms: a.arms, bob: a.bob ? Math.sin(t * 9 + a.x) * 10 : 0 });
      else drawPersonSide(c, PEOPLE[a.w], { x: a.x + (a.v || 0) * lt, y: 0, k: .25, s: a.s || 1, walk: a.v ? t * 8 : null, expr: e });
      c.restore(); });
    if (o.extra) o.extra(c, t, lt);
  });
  if (tod === 'rain') { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.strokeStyle = 'rgba(220,230,245,.45)'; c.lineWidth = 2; for (let i = 0; i < 260; i++) { const x = (rnd(i) * W + t * 120) % W, y = (rnd(i + 9) * H + t * 1500) % H; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 8, y + 36); c.stroke(); } c.restore(); }
  if (day) grade(c, { sx: .2, sy: 0, warm: '255,220,170', warmA: tod === 'dusk' ? .45 : .2, cool: '60,80,120', coolA: .1 }); else { coldGrade(c, .9); vignette(c, .6); }
}
// ---------- section 3 pieces ----------
function freezerScene(c, t, lt) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1e26'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) { const x = 120 + i * 580; c.fillStyle = '#d8dce2'; c.fillRect(x, 520, 520, 420); c.fillStyle = '#2a3442'; c.fillRect(x + 20, 540, 480, 120); c.lineWidth = 8; c.strokeStyle = '#0a0c12'; c.strokeRect(x, 520, 520, 420);
    for (let k = 0; k < 8; k++) { c.fillStyle = ['#d84a4a', '#f2f2f2', '#4a8ad8', '#e8c040', '#f0a0c0'][(k + i) % 5]; c.fillRect(x + 40 + k * 56, 590 - (k % 2) * 20, 46, 60); }
    c.font = '600 40px FOswald'; c.fillStyle = '#0a0c12'; c.fillText(['FLEISCH', 'MILCH', 'EIS'][i], x + 20, 990); c.fillStyle = '#c82020'; c.font = '600 30px FOswald'; c.fillText('AUS', x + 430, 990); }
  c.strokeStyle = 'rgba(120,200,80,.6)'; c.lineWidth = 8; for (let i = 0; i < 9; i++) { const x = 220 + i * 190, ph = (lt * .6 + i * .3) % 1; c.globalAlpha = Math.sin(ph * Math.PI); c.beginPath(); for (let y = 0; y < 160; y += 8) c.lineTo(x + Math.sin(y * .08 + t * 3 + i) * 18, 520 - ph * 200 - y); c.stroke(); } c.globalAlpha = 1;
  for (let i = 0; i < 7; i++) { const fx = 300 + i * 220 + Math.sin(t * 7 + i) * 60, fy = 380 + Math.cos(t * 9 + i * 2) * 50; c.fillStyle = '#111'; circle(c, fx, fy, 7); c.fill(); c.fillStyle = 'rgba(220,230,255,.6)'; c.beginPath(); c.ellipse(fx - 6, fy - 8, 8, 4, -.5, 0, Math.PI * 2); c.fill(); }
  c.restore(); coldGrade(c, .5); vignette(c, .6);
}
function tapScene(c, t, lt) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#c8ccd2'; c.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 90) for (let x = (y / 90 % 2) * 45; x < W; x += 90) { c.strokeStyle = 'rgba(0,0,0,.08)'; c.strokeRect(x, y, 90, 90); }
  c.fillStyle = '#e8eaee'; c.beginPath(); c.ellipse(W / 2, 880, 520, 140, 0, 0, Math.PI * 2); c.fill(); c.lineWidth = 10; c.strokeStyle = '#2a2e36'; c.stroke(); c.fillStyle = '#5a4020'; c.beginPath(); c.ellipse(W / 2, 900, 380, 90, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#b8bec8'; c.beginPath(); c.roundRect(W / 2 - 40, 200, 80, 260, 20); c.fill(); c.stroke(); c.beginPath(); c.roundRect(W / 2 - 40, 200, 260, 70, 30); c.fill(); c.stroke(); c.beginPath(); c.roundRect(W / 2 + 180, 240, 60, 120, 20); c.fill(); c.stroke();
  const flow = 1 + Math.sin(t * 20) * .2; c.fillStyle = '#6a4a20'; c.beginPath(); c.moveTo(W / 2 + 196, 360); c.quadraticCurveTo(W / 2 + 200 + flow * 6, 600, W / 2 + 190, 880); c.lineTo(W / 2 + 226, 880); c.quadraticCurveTo(W / 2 + 230, 600, W / 2 + 226, 360); c.fill();
  for (let i = 0; i < 6; i++) { const ph = (lt * 2 + i / 6) % 1; c.fillStyle = '#7a5a2a'; circle(c, W / 2 + 210 + Math.cos(i * 2) * ph * 120, 880 - Math.sin(ph * Math.PI) * 60, 10); c.fill(); }
  c.restore(); vignette(c, .45);
}
function calcCard(c, t, lt) {
  card(c, t, lt, { title: 'IMANI RECHNET', draw: (c, t, lt) => {
    const items = [['can', 'KONSERVEN'], ['plate', 'NUDELN'], ['plate', 'REIS'], ['can', 'MÜSLIRIEGEL']];
    items.forEach(([ic, n], i) => { const a = pop(lt, .2 + i * .45); c.save(); c.globalAlpha = a; icon(c, ic, 260 + i * 240, 340, 1.6, ['#e8c040', '#f2e6c8', '#f2f2f2', '#c88a4a'][i]); c.font = '600 30px FOswald'; c.textAlign = 'center'; c.fillStyle = '#f6f0e6'; c.fillText(n, 260 + i * 240, 460); c.restore(); });
    const a1 = pop(lt, 2.2); c.save(); c.globalAlpha = a1; c.font = '600 44px FOswald'; c.fillStyle = '#9aa4b8'; c.textAlign = 'left'; c.fillText('5 PERSONEN  →', 1180, 380); c.font = '150px FAnton'; c.fillStyle = '#ffb36b'; c.fillText(`${Math.round(lerp(60, 18, pop(lt, 2.4, 1.4)))} TAGE`, 1180, 520); c.restore();
    const a2 = pop(lt, 7.4); c.save(); c.globalAlpha = a2; c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(200, 620); c.lineTo(1720, 620); c.stroke(); for (let i = 0; i < 4; i++) icon(c, 'bottle', 320 + i * 120, 800, .9, '#6ab8e8'); c.font = '600 30px FOswald'; c.fillStyle = '#f6f0e6'; c.textAlign = 'center'; c.fillText('WASSER IN FLASCHEN', 500, 920); c.font = '150px FAnton'; c.fillStyle = '#ff5a4a'; c.textAlign = 'left'; c.fillText(`${Math.round(lerp(30, 9, pop(lt, 7.6, 1)))} TAGE`, 1180, 860); c.restore();
  } });
}
function generatorScene(c, t, lt, on) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const lit = on ? .5 + .5 * (lt > .3 ? 1 : Math.floor(lt * 30) % 2) : 0;
  c.fillStyle = on ? '#3a3a40' : '#0c0e12'; c.fillRect(0, 0, W, H); c.fillStyle = on ? '#2a2c30' : '#08090c'; c.fillRect(0, 760, W, 320);
  for (let i = 0; i < 6; i++) line(c, [0, 120 + i * 30, W, 140 + i * 30], 10, on ? '#4a4e56' : '#14161a');
  const sh = on ? Math.sin(t * 50) * 3 : 0; c.save(); c.translate(1100 + sh, 780);
  c.fillStyle = '#c8a020'; c.beginPath(); c.roundRect(-380, -380, 760, 380, 20); c.fill(); c.lineWidth = 12; c.strokeStyle = '#1a1a1a'; c.stroke(); c.fillStyle = '#2a2a2a'; c.fillRect(-340, -330, 300, 220); for (let i = 0; i < 8; i++) c.fillRect(40, -330 + i * 28, 280, 12);
  c.font = '700 40px FOswald'; c.fillStyle = '#1a1a1a'; c.fillText('NOTSTROM', -330, -40); c.fillStyle = on ? '#3aff6a' : '#3a2a2a'; circle(c, 280, -40, 18); c.fill(); line(c, [300, -380, 300, -520, 420, -560], 26, '#3a3a3a'); c.restore();
  if (on) for (let i = 0; i < 5; i++) { const ph = (lt * .8 + i / 5) % 1; c.fillStyle = `rgba(120,120,130,${.5 * (1 - ph)})`; circle(c, 1520 + ph * 80, 210 - ph * 200, 30 + ph * 80); c.fill(); }
  drawPerson(c, PEOPLE.imani, { x: 520, y: 1160, k: .5, expr: { mouth: on ? 'grin' : 'flat', browUp: on ? .2 : .7 }, arms: { l: { a: .9, b: 1.2 }, r: { a: on ? 2.5 : 1.3, b: on ? .3 : .9 } } });
  c.fillStyle = '#0a0a0a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(430 + i * 40, 900 + (i % 2) * 30, 14, 9, i, 0, Math.PI * 2); c.fill(); }
  if (!on) { torchBeam(c, 300, 300, .6, 1400, .14, 1); const v = c.createRadialGradient(1100, 600, 100, 1100, 600, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.85)'); c.fillStyle = v; c.fillRect(0, 0, W, H); }
  else { bloom(c, W / 2, 100, 900, '255,230,180', .35 * lit); }
  c.restore(); vignette(c, .5);
}
function dieselCard(c, t, lt) {
  card(c, t, lt, { title: 'DIESEL', draw: (c, t, lt) => { const v = lerp(1, .55, ez(clamp(lt / 1.4))); c.save(); c.translate(W / 2, 640); c.lineWidth = 30; c.strokeStyle = '#2a3040'; c.beginPath(); c.arc(0, 0, 320, Math.PI, 0); c.stroke(); c.strokeStyle = v > .5 ? '#ffb36b' : '#ff5a4a'; c.beginPath(); c.arc(0, 0, 320, Math.PI, Math.PI + Math.PI * v); c.stroke(); c.rotate(-Math.PI / 2 + Math.PI * (v - .5)); line(c, [0, 0, 0, -280], 14, '#f6f0e6'); c.restore(); c.font = '64px FBebas'; c.fillStyle = '#9aa4b8'; c.textAlign = 'center'; c.fillText('LEER                                                VOLL', W / 2, 700); } });
}
function rulesCard(c, t, lt) {
  card(c, t, lt, { title: 'DIE REGELN', bg: ['#1e1a16', '#0a0806'], draw: (c, t, lt) => {
    const R = [[V(203.12), 'bolt', 'STROM NUR 2 STUNDEN AM ABEND'], [V(205.26), 'plate', '3 KLEINE PORTIONEN · FÜR JEDEN GLEICH'], [V(208.38), 'walk', 'KEINER GEHT ALLEIN INS LAGER'], [V(210.12), 'moon', 'NACHTS: KEIN LÄRM']], t0 = V(201.16);
    R.forEach(([tt, ic, s], i) => { const a = pop(t, tt - .1, .35); if (a <= 0) return; const y = 300 + i * 175; c.save(); c.globalAlpha = a; c.translate(-(1 - a) * 80, 0);
      c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(300, y - 70, 1320, 140, 20); c.fill(); c.font = '110px FBebas'; c.fillStyle = '#ff9a4a'; c.fillText(String(i + 1), 340, y + 40); icon(c, ic, 520, y, .9, '#f6f0e6'); c.font = '600 54px FOswald'; c.fillStyle = '#f6f0e6'; c.fillText(s, 640, y + 20); c.restore(); });
  } });
}
const S6 = (c, t, lt) => dayStamp(c, 'TAG 6', '14:12 UHR', lt);
const SECTION3 = [
  [151.86, 'atr', { mood: 'day', mood2: 'dark', moodAt: 2.7, c0: [0, 1.7, 16], c1: [0, 1.7, 14.5], l0: [0, 3.5, -20], fov: 52, act: FIVE(8.5).map(a => ({ ...a, expr: { mouth: 'o', browUp: .9 } })), fx: S6 }],
  [157.2, 'atr', { mood: 'dark', c0: [2, 1.6, -6], c1: [2.4, 1.8, -7], l0: [4.8, 2.5, -16], fov: 50 }],
  [161.34, 'atr', { mood: 'dark', c0: [0, 12, 16], c1: [0, 12.5, 14], l0: [0, 2, -30], fov: 56, act: FIVE(3).map(a => ({ ...a, sc: 1 })) }],
  [163.98, 'fn', { f: freezerScene }],
  [175.46, 'fn', { f: tapScene }],
  [178.38, 'fn', { f: calcCard }],
  [188.3, 'card', { draw: (c, t, lt) => { bigText(c, 'PARADIES', W / 2, 420, 200, '#f6f0e6', pop(lt, .1)); if (lt > 1.4) { c.save(); c.strokeStyle = '#ff3a3a'; c.lineWidth = 22; c.beginPath(); c.moveTo(560, 470); c.lineTo(560 + 800 * pop(lt, 1.4, .3), 370); c.stroke(); c.restore(); } if (lt > 2.4) bigText(c, 'ÜBERLEBENSKAMPF', W / 2, 700, 170, '#ff9a4a', pop(lt, 2.5)); } }],
  [192.52, 'fn', { f: (c, t, lt) => generatorScene(c, t, lt, false) }],
  [198.3, 'fn', { f: (c, t, lt) => generatorScene(c, t, lt, true) }],
  [199.52, 'fn', { f: dieselCard }],
  [201.16, 'fn', { f: rulesCard }],
  [213.32, 'fn', { f: (c, t, lt) => { closeUp(c, t, lt + 2, 'jamal', 'JAMAL', 'findet die Regeln bescheuert', { mouth: 'o', browUp: 0 }, { l: { a: 2.2 + Math.sin(t * 8) * .2, b: .4 }, r: { a: 1.6, b: 1.0 } }); if (lt > 2.6) bigText(c, 'BESCHEUERT!', 520, 300, 150, '#ff5a4a', pop(lt, 2.7)); } }],
];
// ---------- section 4 ----------
function floorPlan(c, t, lt) {
  card(c, t, lt, { title: 'NACH 5 TAGEN', bg: ['#16202a', '#070a10'], draw: (c, t, lt) => {
    const L = [[V(251.54), 'DACH', 'FARM', '#5aa04a'], [V(249.94), '2. OG', 'WOHNEN', '#e8b030'], [V(248.22), '1. OG', 'LAGER', '#3a7ad0'], [V(246.24), 'EG', 'SPERRZONE', '#d83a3a']];
    c.save(); c.translate(560, 230); c.strokeStyle = '#9aa4b8'; c.lineWidth = 6; c.strokeRect(0, 80, 800, 640); for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(0, 80 + i * 160); c.lineTo(800, 80 + i * 160); c.stroke(); }
    c.beginPath(); c.moveTo(-40, 80); c.lineTo(400, -40); c.lineTo(840, 80); c.stroke();
    L.forEach(([tt, fl, lab, col], i) => { const a = pop(t, tt - .1, .35); if (a <= 0) return; const y = 80 + i * 160; c.globalAlpha = a; c.fillStyle = col; c.globalAlpha = a * .55; c.fillRect(6, y + 6, 788, 148); c.globalAlpha = a; c.font = '70px FBebas'; c.fillStyle = '#f6f0e6'; c.fillText(fl, -230, y + 100); c.font = '700 64px FOswald'; c.fillText(lab, 60, y + 104);
      if (i === 3) for (let k = 0; k < 5; k++) icon(c, 'zombie', 520 + k * 60, y + 100, .5, '#2a0a0a'); if (i === 0) for (let k = 0; k < 4; k++) { c.fillStyle = '#3a8a30'; c.beginPath(); c.ellipse(520 + k * 70, y + 110, 26, 12, -.5, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1; });
    c.restore(); } });
}
function radishes(c, t, lt) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8ec0e8'); g.addColorStop(1, '#e8f0f4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#5a3a20'; c.fillRect(0, 640, W, 440); c.fillStyle = '#6a4a30'; c.fillRect(0, 600, W, 60); c.lineWidth = 10; c.strokeStyle = '#2a1a10'; c.strokeRect(-10, 600, W + 20, 500);
  const names = ['RUDI', 'RITA', 'ROLF', 'RONJA', 'RALF'];
  for (let i = 0; i < 5; i++) { const x = 260 + i * 350, up = pop(lt, .3 + i * .35, .5), y = 680 - up * 60; c.fillStyle = '#d84a6a'; c.beginPath(); c.ellipse(x, y, 70, 64, 0, 0, Math.PI * 2); c.fill(); c.lineWidth = 8; c.strokeStyle = '#3a1020'; c.stroke(); for (const s of [-1, 1]) { c.fillStyle = '#5aa04a'; c.beginPath(); c.ellipse(x + s * 40, y - 120, 30, 60, s * .5, 0, Math.PI * 2); c.fill(); c.stroke(); }
    c.fillStyle = '#1a0a0a'; circle(c, x - 20, y - 6, 8); c.fill(); circle(c, x + 20, y - 6, 8); c.fill(); c.lineWidth = 5; c.beginPath(); c.arc(x, y + 12, 16, .2, Math.PI - .2); c.stroke();
    const a = pop(t, V(256.4) + i * .35); if (a > 0) { c.save(); c.globalAlpha = a; c.fillStyle = '#fff8ec'; c.beginPath(); c.roundRect(x - 90, 820, 180, 70, 12); c.fill(); c.font = '700 44px FOswald'; c.fillStyle = '#2a1a10'; c.textAlign = 'center'; c.fillText(names[i], x, 870); c.restore(); } }
  c.restore(); vignette(c, .35);
}
const GROUP_ROOF = (laugh) => [{ w: 'jamal', x: -520, y: -40, pose: 'front', expr: { mouth: laugh ? 'grin' : 'flat', eyes: laugh ? 'closed' : 'open' }, bob: laugh }, { w: 'grace', x: -250, y: -60, pose: 'front', expr: { mouth: laugh ? 'grin' : 'smile', eyes: laugh ? 'closed' : 'open' }, bob: laugh }, { w: 'noah', x: 20, y: 0, pose: 'front', expr: { mouth: laugh ? 'smile' : 'flat', eyes: laugh ? 'closed' : 'open' }, bob: laugh }, { w: 'nia', x: 230, y: 10, pose: 'front', expr: { mouth: 'grin' }, bob: laugh, arms: laugh ? { r: { a: 2.6, b: .3 }, l: { a: 2.6, b: .3 } } : undefined }, { w: 'imani', x: 470, y: -50, pose: 'front', expr: { mouth: laugh ? 'grin' : 'smile', eyes: laugh ? 'closed' : 'open' }, bob: laugh }];
const SECTION4 = [
  [217.74, 'atr', { mood: 'dark', c0: [0, 1.7, 15], c1: [0, 1.7, 13], l0: [0, 2.5, -20], fov: 50, act: [{ w: 'noah', x: 0, z: 9, pose: 'front', expr: { mouth: 'flat', browUp: .3, look: .5 }, arms: { r: { a: .5, b: 1.9 } } }], fx: (c, t, lt) => dayStamp(c, 'TAG 11', 'WIR BRAUCHEN EINE BASIS', lt) }],
  [223.36, 'card', { title: 'GARTENCENTER', bg: ['#1e2a1c', '#0a0e08'], draw: (c, t, lt) => { const it = [['PLANEN', (c) => tarpTent(c, 0, 60, .55, '#3a6a8a')], ['EIMER', (c) => { c.fillStyle = '#d84a3a'; c.beginPath(); c.moveTo(-70, -80); c.lineTo(70, -80); c.lineTo(55, 60); c.lineTo(-55, 60); c.fill(); c.lineWidth = 8; c.strokeStyle = '#1a1a1a'; c.stroke(); c.beginPath(); c.arc(0, -80, 70, Math.PI, 0); c.stroke(); }], ['REGENTONNEN', (c) => rainBarrel(c, 0, 120, .55)]]; it.forEach(([n, f], i) => { const a = pop(lt, .3 + i * .5); if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(480 + i * 480, 520 + (1 - a) * 60); f(c); c.font = '600 48px FOswald'; c.fillStyle = '#f6f0e6'; c.textAlign = 'center'; c.fillText(n, 0, 260); c.restore(); }); } }],
  [227.1, 'fn', { f: (c, t, lt) => roofScene(c, t, lt, { tod: 'rain', barrels: 1, door: 1, x0: -200, x1: 100, z0: 1.15, z1: 1.25, act: [{ w: 'jamal', x: -760, y: -60, s: 1 }, { w: 'noah', x: -300, y: -10, pose: 'front', expr: { mouth: 'smile', browUp: .3 } }] }) }],
  [231.0, 'fn', { f: (c, t, lt) => roofScene(c, t, lt, { tod: 'day', barrels: 1, planters: 3, door: 1, x0: 200, x1: 0, z0: 1.4, z1: 1.3, act: [{ w: 'grace', x: -160, y: -40, pose: 'front', expr: { mouth: 'smile' }, arms: { r: { a: .6, b: 1.2 } } }, { w: 'nia', x: 120, y: -20, pose: 'front', expr: { mouth: 'grin' }, arms: { l: { a: .7, b: 1.1 } } }], extra: (c, t, lt) => { if (lt > 3.4) ['RADIESCHEN', 'KRESSE', 'SALAT'].forEach((n, i) => { const a = pop(lt, 3.5 + i * .4); c.save(); c.globalAlpha = a; c.fillStyle = '#fff8ec'; c.beginPath(); c.roundRect(-300 + i * 340 - 110, -420, 220, 60, 10); c.fill(); c.font = '700 34px FOswald'; c.fillStyle = '#2a4a1a'; c.textAlign = 'center'; c.fillText(n, -300 + i * 340, -378); c.restore(); }); } }) }],
  [236.58, 'fn', { f: (c, t, lt) => { shot2(c, SH.s2 + .2 + lt * .2); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const p = ez(clamp(lt / 2.6)); for (let i = 0; i < 4; i++) { c.save(); c.translate(lerp(-700 + i * 200, 180 + i * 440, p), 0); shelfUnit(c, 0, 900, 400, 640, { seed: i }); c.restore(); } c.restore(); } }],
  [239.66, 'atr', { mood: 'dark', c0: [-1, 1.7, -4], c1: [-.4, 1.7, -5.5], l0: [4.8, 2.2, -16], fov: 50, fx: (c, t, lt, P) => { for (let i = 0; i < 3; i++) { const q = P(4.8, .9 + i * 1.1, -20.5 + i * 1.6); if (!q.front) continue; const s = q.ppm / 90; c.save(); c.translate(q.x, q.y); c.scale(s, s); c.fillStyle = ['#8a3a3a', '#3a5a8a', '#6a6a3a'][i]; c.beginPath(); c.roundRect(-130, -60, 260, 110, 20); c.fill(); c.fillRect(-140, -110, 50, 160); c.fillRect(90, -110, 50, 160); c.lineWidth = 8; c.strokeStyle = '#1a1a1a'; c.strokeRect(-130, -60, 260, 110); c.restore(); } } }],
  [242.54, 'fn', { f: floorPlan }],
  [252.88, 'fn', { f: radishes }],
  [258.7, 'fn', { f: (c, t, lt) => roofScene(c, t, lt, { tod: 'dusk', barrels: 1, planters: 3, door: 1, z0: 1.3, z1: 1.38, act: GROUP_ROOF(true) }) }],
];
MAIN = MAIN.concat(SECTION3, SECTION4);
// mood switch inside an atrium shot (power cut)
{ const atr0 = K.atr; K.atr = (c, t, lt, u, p) => atr0(c, t, lt, u, p.moodAt && lt > p.moodAt ? Object.assign({}, p, { mood: p.mood2 }) : p); }
