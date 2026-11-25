// 3D DINING ROOM (same projection as street3d: metres, Y up, back wall on Z = 0, camera at Z < 0).
// room3d(c, cam2, t, { cam3, tod: 'golden'|'evening'|'night', tables: 'full'|'few'|'empty'|fn, extra: [{x,z,draw(c,o)}], guestsAt(i) })
const R3 = { X0: -11, X1: 11, D: -16, H: 4.8, PXM: 60 };
function r3Tex(key, wM, hM, paint) {
  if (S3.cache.has(key)) return S3.cache.get(key);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(wM * R3.PXM); cv.height = Math.ceil(hM * R3.PXM); const c = cv.getContext('2d');
  c.translate(0, cv.height); c.scale(R3.PXM / 220, R3.PXM / 220); paint(c, wM * 220, hM * 220); S3.cache.set(key, cv); return cv;
}
// back wall in world units (220/m), x from 0..w, floor at y = 0
function r3BackWall(c, w, h, tod) {
  const night = tod === 'night', dk = v => night ? shade(v, -.5) : v;
  c.fillStyle = dk(SAL.wall); c.fillRect(0, -h, w, h); for (let x = 0; x < w; x += 90) { c.fillStyle = 'rgba(120,90,50,.06)'; c.fillRect(x, -h, 45, h); }
  for (let x = 0; x < w; x += 90) for (let y = -h + 140; y < -260; y += 110) { c.beginPath(); c.ellipse(x + 22, y, 8, 16, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(150,110,60,.08)'; c.fill(); }
  stuccoBand(c, 0, w, -h, 80); stuccoBand(c, 0, w, -h + 100, 30);
  c.beginPath(); c.rect(0, -260, w, 260); fs(c, dk(SAL.wain), 3); for (let x = 0; x < w; x += 220) { c.beginPath(); c.rect(x + 18, -236, 184, 190); fs(c, dk(SAL.wainHi), 2); }
  c.beginPath(); c.rect(0, -272, w, 18); fs(c, '#3a2418', 2); c.beginPath(); c.rect(0, -34, w, 34); fs(c, '#3a2418', 2);
  const S = SALSKY[night ? 'night' : tod === 'evening' ? 'evening' : 'golden'], wins = [w * .2, w * .5, w * .8];
  for (const wx of wins) {
    const ww = 380, wh = 640, wy = -260 - wh - 30;
    c.save(); c.beginPath(); c.rect(wx - ww / 2, wy, ww, wh); c.arc(wx, wy, ww / 2, Math.PI, 0); c.clip();
    let g = c.createLinearGradient(0, wy - ww / 2, 0, wy + wh); g.addColorStop(0, S.sky[0]); g.addColorStop(1, S.sky[1]); c.fillStyle = g; c.fillRect(wx - ww, wy - ww, ww * 2, wh + ww * 2);
    for (let i = 0; i < 5; i++) { const hx = wx - ww / 2 - 20 + i * 90, hh = 260 + rnd(i + wx * .01) * 160; c.fillStyle = i % 2 ? S.far : S.far2; c.fillRect(hx, wy + wh - hh, 86, hh); for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { c.fillStyle = night || tod === 'evening' ? (rnd(i * 9 + r * 2 + k) > .5 ? '#ffd98a' : '#1a2040') : 'rgba(255,240,210,.4)'; c.fillRect(hx + 14 + k * 38, wy + wh - hh + 30 + r * 58, 20, 32); } }
    if (night && wx === wins[1]) { c.beginPath(); c.arc(wx + 70, wy + 30, 34, 0, 7); c.fillStyle = '#eef2ff'; c.fill(); }
    c.restore();
    c.beginPath(); c.rect(wx - ww / 2, wy, ww, wh); c.arc(wx, wy, ww / 2, Math.PI, 0); c.lineWidth = 18; c.strokeStyle = '#f4efe4'; c.stroke(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
    line(c, [wx, wy - ww / 2, wx, wy + wh], 9, '#f4efe4'); for (let k = 1; k < 4; k++) line(c, [wx - ww / 2, wy + k * wh / 4, wx + ww / 2, wy + k * wh / 4], 7, '#f4efe4');
    c.beginPath(); c.rect(wx - ww / 2 - 30, wy + wh, ww + 60, 22); fs(c, '#e8e0d0', 2.5);
    line(c, [wx - ww / 2 - 130, wy - ww / 2 - 60, wx + ww / 2 + 130, wy - ww / 2 - 60], 9, SAL.goldDark);
    curtain(c, wx - ww / 2 - 10, wy - ww / 2 - 54, wh + ww / 2 + 80, -1, dk(SAL.velvet), 0); curtain(c, wx + ww / 2 + 10, wy - ww / 2 - 54, wh + ww / 2 + 80, 1, dk(SAL.velvet), 0);
  }
  for (const [x, kind] of [[w * .35, 'stillLife'], [w * .65, 'landscape']]) { goldFrame(c, x - 170, -880, 340, 250, PAINT[kind]); sconce(c, x - 250, -560, true, 0); sconce(c, x + 250, -560, true, 0); }
  for (const x of [w * .05, w * .95]) { c.beginPath(); c.rect(x - 110, -980, 220, 640); fs(c, SAL.gold, 3); c.beginPath(); c.rect(x - 92, -962, 184, 604); const g2 = c.createLinearGradient(x - 92, 0, x + 92, 0); g2.addColorStop(0, night ? '#20283a' : '#a9b4b8'); g2.addColorStop(1, night ? '#30384c' : '#d8dcd6'); c.fillStyle = g2; c.fill(); }
}
function r3SideWall(c, w, h, tod, side) {
  const night = tod === 'night', dk = v => night ? shade(v, -.5) : v;
  c.fillStyle = dk(shade(SAL.wall, -.06)); c.fillRect(0, -h, w, h); stuccoBand(c, 0, w, -h, 80);
  c.beginPath(); c.rect(0, -260, w, 260); fs(c, dk(SAL.wain), 3); for (let x = 0; x < w; x += 220) { c.beginPath(); c.rect(x + 18, -236, 184, 190); fs(c, dk(SAL.wainHi), 2); }
  if (side < 0) { wineRack(c, w * .25, -1000, 700, 640, !night); barCounter(c, w * .2, 900, 0); c.beginPath(); c.rect(w * .18, -1060, 1000, 50); fs(c, '#3a2418', 3); for (let i = 0; i < 7; i++) { const lx = w * .2 + i * 130; line(c, [lx, -1010, lx, -880], 2, '#2a1a12'); c.beginPath(); c.moveTo(lx - 22, -880); c.lineTo(lx + 22, -880); c.lineTo(lx + 14, -910); c.lineTo(lx - 14, -910); c.closePath(); fs(c, '#c9a24a', 2); } goldFrame(c, w * .72, -900, 360, 260, PAINT.portrait); bigPlant(c, w * .9, 0, .9, 0); }
  else { for (const x of [w * .25, w * .65]) { goldFrame(c, x - 160, -860, 320, 240, PAINT[x < w / 2 ? 'landscape' : 'stillLife']); sconce(c, x - 240, -560, true, 0); sconce(c, x + 240, -560, true, 0); } bigPlant(c, w * .45, 0, .9, 0); c.beginPath(); c.rect(w * .85 - 160, -760, 320, 760); fs(c, '#3a2418', 3); c.beginPath(); c.rect(w * .85 - 130, -720, 260, 690); fs(c, night ? '#2a1a12' : '#5a3a24', 2); c.font = hudFont(30); c.fillStyle = '#e8c878'; c.textAlign = 'center'; c.fillText('KÜCHE', w * .85, -790); }
}
function room3d(c, cam2, t, o = {}) {
  const tod = o.tod || 'evening', night = tod === 'night', cam = s3cam(o.cam3), { X0, X1, D } = R3, RH = R3.H;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1210'; c.fillRect(0, 0, W, H);
  // ceiling + floor (grids)
  const ceil = night ? '#2a2630' : '#efe6d2', fl1 = night ? '#2a2030' : '#7a4c2c', fl2 = night ? '#30243a' : '#8a5a36';
  for (let x = X0; x < X1; x += 2) for (let z = 0; z > D; z -= 2) { poly3(c, cam, [[x, RH, z], [x + 2, RH, z], [x + 2, RH, z - 2], [x, RH, z - 2]], ceil, 'rgba(120,100,70,.25)', 1); }
  for (let x = X0 + 2; x < X1; x += 4) for (let z = -2; z > D; z -= 4) { const p = p3(cam, x, RH, z); if (p[2] > .5) { const s = cam.f / p[2]; c.save(); c.translate(p[0], p[1]); c.scale(1, .3); c.beginPath(); c.arc(0, 0, s * .6, 0, 7); c.fillStyle = night ? 'rgba(200,190,170,.15)' : 'rgba(255,250,235,.8)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(120,100,70,.4)'; c.stroke(); c.restore(); } }
  for (let x = X0, ci = 0; x < X1; x += .45, ci++) for (let z = (ci % 2) * .7; z > D; z -= 1.4) { const z0 = Math.min(0, z), z1 = Math.max(D, z - 1.4); if (z0 <= z1) continue; const k = (ci * 3 + Math.round(z / 1.4)) % 3; poly3(c, cam, [[x, 0, z0], [x + .45, 0, z0], [x + .45, 0, z1], [x, 0, z1]], k === 0 ? fl1 : k === 1 ? fl2 : shade(fl2, .06), 'rgba(40,20,10,.22)', 1); }
  // rug down the middle aisle
  poly3(c, cam, [[-1.4, .005, -.5], [1.4, .005, -.5], [1.4, .005, D + 1], [-1.4, .005, D + 1]], night ? '#3a1a2a' : '#8a2a32', night ? '#6a5a3a' : '#d8b25a', 3);
  // walls (textured planes)
  plane3(c, cam, r3Tex('rback|' + tod, X1 - X0, RH, (cc, w, h) => r3BackWall(cc, w, h, tod)), X0, 0, X1, 0, 0, RH);
  plane3(c, cam, r3Tex('rleft|' + tod, -D, RH, (cc, w, h) => r3SideWall(cc, w, h, tod, -1)), X0, D, X0, 0, 0, RH);
  plane3(c, cam, r3Tex('rright|' + tod, -D, RH, (cc, w, h) => r3SideWall(cc, w, h, tod, 1)), X1, 0, X1, D, 0, RH);
  // items: chandeliers, tables + guests, extras — sorted far → near
  const items = [];
  for (let x = -6; x <= 6; x += 6) for (let z = -3; z > D + 2; z -= 5) items.push({ x, y: RH, z, draw: () => { const p = p3(cam, x, RH - .1, z); if (p[2] < .5) return; const s = cam.f / p[2] / 220; c.save(); c.translate(p[0], p[1]); c.scale(s, s); chandelier(c, 0, 330, 1.05, t + x + z, !night || o.lit); c.restore(); } });
  const tables = []; for (const z of [-2.4, -5.6, -8.8]) for (const x of [-8, -4.4, 4.4, 8]) tables.push([x + (Math.abs(z) % 2 ? .4 : -.4), z]);
  const mode = o.tables || 'full';
  tables.forEach(([x, z], i) => items.push({ x, z, draw: () => bb3(c, cam, x, z, c2 => {
    const sitters = typeof mode === 'function' ? mode(i) : mode === 'full' ? 2 : mode === 'few' ? (rnd(i * 3 + 1) < .25 ? 1 : 0) : 0;
    chairBack(c2, -95); chairBack(c2, 95);
    for (let k = 0; k < sitters; k++) { const dx = k ? 95 : -95; drawPerson(c2, P(PEOPLE.guest((i * 5 + k * 3 + 2) % 41), t, { x: dx, sit: true, seatH: 250, seed: i * 2 + k, expr: Object.assign({ look: -dx / 95 * .7 }, (o.talk !== false && (i + k) % 2 === 0) ? (talkMouth(t + i, 0, 999) || { mouth: 'smile' }) : { mouth: 'smile' }), arms: { l: arm(.4, -1.1), r: (i + k) % 3 === 0 ? arm(1.1, -1.7) : arm(.4, -1.1) } })); }
    dineTable(c2, 0, { w: 330, seed: i, items: (c3, ty) => tableDressing(c3, 330, ty, t, { seed: i, lit: !night || o.candles, glint: night ? 0 : .4 }) });
  }) }));
  for (const it of (o.extra || [])) items.push(it);
  items.forEach(it => { it.d = p3(cam, it.x, 0, it.z)[2]; });
  items.sort((a, b) => b.d - a.d).forEach(it => { if (it.d > .4) it.draw(c, cam); });
  return { base: '#1a1210' };
}
function room3dLight(c, cam3, t, o = {}) {
  const tod = o.tod || 'evening', cam = s3cam(cam3), night = tod === 'night';
  c.save(); c.globalCompositeOperation = 'screen';
  // window light on the floor (from the three back windows)
  const wx = [R3.X0 + (R3.X1 - R3.X0) * .2, 0, R3.X0 + (R3.X1 - R3.X0) * .8], col = night ? '150,175,255' : tod === 'golden' ? '255,210,140' : '255,180,120', a = night ? .14 : .2;
  for (const x of wx) { const top = [p3(cam, x - .85, 4.2, -.05), p3(cam, x + .85, 4.2, -.05)], fl = [p3(cam, x - 1 + 1.2, 0, -4.5), p3(cam, x + 1 + 1.2, 0, -4.5), p3(cam, x + .9, 0, -.2), p3(cam, x - .9, 0, -.2)];
    if ([...top, ...fl].some(p => p[2] < .4)) continue; const g = c.createLinearGradient(top[0][0], top[0][1], fl[0][0], fl[0][1]); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},${a * .3})`);
    c.beginPath(); c.moveTo(top[0][0], top[0][1]); c.lineTo(top[1][0], top[1][1]); c.lineTo(fl[1][0], fl[1][1]); c.lineTo(fl[0][0], fl[0][1]); c.closePath(); c.fillStyle = g; c.fill();
    c.beginPath(); c.moveTo(fl[0][0], fl[0][1]); c.lineTo(fl[1][0], fl[1][1]); c.lineTo(fl[2][0], fl[2][1]); c.lineTo(fl[3][0], fl[3][1]); c.closePath(); c.fillStyle = `rgba(${col},${a * 1.4})`; c.fill(); }
  if (!night || o.lit) for (let x = -6; x <= 6; x += 6) for (let z = -3; z > R3.D + 2; z -= 5) { const p = p3(cam, x, R3.H - .9, z); if (p[2] > .5) bloom(c, p[0], p[1], cam.f / p[2] * 2.2, '255,205,130', .35); }
  c.restore();
  if (o.motes) motes(c, 0, W, 0, H, t, { n: 50, speed: .015, alpha: .5 });
  grade(c, night ? { sx: .5, sy: .2, warm: '140,160,255', warmA: .18, cool: '10,10,40', coolA: .5 } : tod === 'golden' ? { sx: .5, sy: .2, warm: '255,180,90', warmA: .3, cool: '60,30,80', coolA: .2 } : { sx: .5, sy: .3, warm: '255,170,90', warmA: .3, cool: '40,20,60', coolA: .28 });
}
// camera dolly inside the room: from a corner (oblique) into the room towards (tx, ty, 0)
function r3move(k, o = {}) { const e = ease(clamp(k)); return { x: lerp(o.x0 ?? -7, o.x1 ?? -1, e), y: lerp(o.y0 ?? 2.6, o.y1 ?? 1.8, e), z: lerp(o.z0 ?? -15, o.z1 ?? -11, e), f: lerp(o.f0 ?? 900, o.f1 ?? 1050, e), look: [lerp(o.lx0 ?? 2, o.lx1 ?? 0, e), lerp(o.ly0 ?? 1.6, o.ly1 ?? 1.4, e), 0] }; }
// a person/Noah billboard item for room3d / street3d extras
function r3person(x, z, draw) { return { x, z, draw: (c, cam) => bb3(c, cam, x, z, c2 => draw(c2)) }; }
