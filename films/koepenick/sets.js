// Places (M1–M10) for the vertical Köpenick short. World: 1 m ≈ 437 units (Noah at k .5 ≈ 764 units tall).
// shims for animals.js
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
function ell(c, x, y, rx, ry, r = 0) { el(c, x, y, rx, ry, r); }
const line = (c, pts, w, col) => ln(c, pts, w, col);
const shade = shadeHex;
const cam0 = o => Object.assign({ x: 0, y: -420, z: 0, f: 1300, hy: 1085 }, o);

// ---- helpers: wrist position of Noah's front rig (body-local units) ----
function noahWrist(side, spec) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, a2 = a + (spec.b ?? 0);
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  return [ex + side * Math.sin(a2) * NOAH.FORE, ey + Math.cos(a2) * NOAH.FORE, a2];
}
// draw Noah (front) at world X,Z; extra(c) runs in body-local units after the body (props in hands)
function noahAt(c, cam, X, Z, p, cos, extra, Y = 0) {
  at(c, cam, X, Y, Z, (c) => { drawOld(c, Object.assign({ x: 0, y: 0, k: .5 }, p), cos); if (extra) { c.save(); c.scale(.5 * (p.s || 1), .5); c.translate(0, (p.bob || 0) + (cos.hunch || 0) * 34); extra(c); c.restore(); } });
}
function noahSideAt(c, cam, X, Z, p, cos, Y = 0) { at(c, cam, X, Y, Z, (c) => drawOldSide(c, Object.assign({ x: 0, y: 0, k: .5 }, p), cos)); }
function shadowAt(c, cam, X, Z, w = 330, a = .35, dx = 0) { const p = gp(cam, X, Z); c.save(); c.fillStyle = `rgba(10,8,16,${a})`; el(c, p.x, p.y, w * p.s * .5, w * p.s * .09); c.fill(); if (dx) { c.globalAlpha = .5; c.beginPath(); c.moveTo(p.x - w * p.s * .2, p.y); c.lineTo(p.x + dx * p.s, p.y + w * p.s * .05); c.lineTo(p.x + dx * p.s, p.y + w * p.s * .12); c.lineTo(p.x + w * p.s * .2, p.y + 4); c.fill(); } c.restore(); }

// ---- props ----
function hammerLocal(c, ang) { c.save(); c.rotate(ang); rr(c, -14, -30, 28, 230, 8); fs(c, '#8a5a32', 9); rr(c, -70, 170, 140, 60, 10); fs(c, lg(c, -70, 0, 70, 0, [[0, '#55565c'], [.5, '#a9abb2'], [1, '#3a3b40']]), 9); c.restore(); }
function bootLocal(c, done = .6) { // half-finished boot on a last, side view, origin = sole centre
  c.beginPath(); c.moveTo(-170, 0); c.lineTo(190, 0); c.quadraticCurveTo(230, -20, 200, -70); c.quadraticCurveTo(120, -110, 40, -120); c.lineTo(30, -380); c.lineTo(-120, -380); c.lineTo(-150, -110); c.quadraticCurveTo(-190, -60, -170, 0); c.closePath();
  fs(c, lg(c, 0, -380, 0, 0, [[0, '#3a2418'], [1, '#5c3a22']]), 9);
  ln(c, [-120, -340, 30, -340], 5, '#7a5236'); for (let i = 0; i < 6; i++) { el(c, -20 + i * 6, -300 + i * 30, 6, 6); fs(c, '#c9b48a'); }
  rr(c, -175, 0, 380, 26, 8); fs(c, '#c9a478', 7); // fresh sole
  for (let i = 0; i < 7; i++) { el(c, -140 + i * 50, 12, 6, 6); fs(c, i / 7 < done ? '#d8d8dc' : 'rgba(0,0,0,0)'); }
}
function capFloat(c, x, y, k, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); capLocal(c, 0); c.restore(); }
function jacketHanger(c, sw = 0) { // the uniform jacket on a hanger, local origin = hook
  c.save(); c.rotate(sw);
  ln(c, [0, 0, 0, 40], 8, '#9a9aa0'); c.beginPath(); c.moveTo(-190, 110); c.quadraticCurveTo(0, 20, 190, 110); c.lineWidth = 16; c.strokeStyle = '#7a5232'; c.stroke();
  c.translate(0, 1030); c.scale(1.05, 1);
  for (const s of [-1, 1]) { nLine(c, [s * 160, -920, s * 210, -700, s * 200, -470], 100 + 26, OUT); nLine(c, [s * 160, -920, s * 210, -700, s * 200, -470], 100, UNI.coat); nLine(c, [s * 205, -520, s * 200, -470], 100, UNI.red); }
  jacketLocal(c);
  for (const s of [-1, 1]) { el(c, s * 160, -940, 60, 28); fs(c, UNI.silver, 10); }
  c.restore();
}
function shoeLast(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-70, -60, -30, -70); c.lineTo(10, -120); c.lineTo(40, -110); c.lineTo(40, -50); c.quadraticCurveTo(110, -40, 110, -10); c.lineTo(100, 0); c.closePath(); fs(c, lg(c, -60, -100, 100, 0, [[0, '#c48a52'], [1, '#8a5a32']]), 6); c.restore(); }
function wallClock(c, x, y, t, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  P(c, [-90, -60, 0, -150, 90, -60, 90, 220, -90, 220]); fs(c, '#5a3a24', 7);
  el(c, 0, -10, 66, 66); fs(c, '#eadfc4', 6); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ln(c, [Math.sin(a) * 54, -10 - Math.cos(a) * 54, Math.sin(a) * 46, -10 - Math.cos(a) * 46], 4, '#3a2a1a'); }
  ln(c, [0, -10, 22, -40], 6, '#1a1210'); ln(c, [0, -10, -4, 40], 4, '#1a1210');
  const pa = Math.sin(t * 3.2) * .28; c.save(); c.translate(0, 70); c.rotate(pa); ln(c, [0, 0, 0, 110], 5, '#c9a64a'); el(c, 0, 120, 22, 22); fs(c, '#d8b45a', 5); c.restore();
  c.restore();
}
function chair(c, x, y, s = 1, col = '#6a4426') { c.save(); c.translate(x, y); c.scale(s * .55, s * .55); rr(c, -150, -470, 300, 40, 8); fs(c, col, 8); for (const xx of [-130, 110]) { rr(c, xx, -470, 22, 470, 6); fs(c, col, 7); } rr(c, -150, -900, 26, 470, 6); fs(c, col, 7); rr(c, 124, -900, 26, 470, 6); fs(c, col, 7); for (let i = 0; i < 3; i++) { rr(c, -140, -870 + i * 120, 280, 24, 6); fs(c, shadeHex(col, .1), 6); } c.restore(); }
function parcel(c, x, y, w, h, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); rr(c, -w / 2, -h, w, h, 10); fs(c, lg(c, 0, -h, 0, 0, [[0, '#d9c29a'], [1, '#b39a70']]), 7); ln(c, [0, -h, 0, 0], 6, '#7a5a3a'); ln(c, [-w / 2, -h / 2, w / 2, -h / 2], 6, '#7a5a3a'); el(c, 0, -h, 20, 10); fs(c, null, 5, '#7a5a3a'); c.restore(); }

// ================= M1: NOAH'S ROOM (candle night) =================
function roomBack(c, cam, t, o = {}) {
  // back wall at Z 2400
  at(c, cam, 0, 0, 2400, (c) => {
    c.fillStyle = lg(c, 0, -2400, 0, 0, [[0, '#2a1c16'], [.5, '#4a3022'], [1, '#3a261c']]); c.fillRect(-2600, -3000, 5200, 3200);
    c.save(); c.globalAlpha = .18; for (let i = -26; i < 26; i++) { c.fillStyle = i % 2 ? '#6a4a30' : '#3a2418'; c.fillRect(i * 100, -3000, 50, 2700); } c.restore(); // faded wallpaper
    for (let i = 0; i < 6; i++) { const x = -2000 + rnd(i + 3) * 4000, y = -2200 + rnd(i + 5) * 1600; ln(c, [x, y, x + 60, y + 90, x + 30, y + 170, x + 80, y + 260], 4, 'rgba(20,10,6,.5)'); }
    rr(c, -2600, -300, 5200, 300, 0); fs(c, '#2c1c14'); ln(c, [-2600, -300, 2600, -300], 10, '#1a100c');
    // window (night, foggy roofs, moon)
    const wx = o.winX ?? 700, wy = -2050;
    c.save(); rr(c, wx, wy, 820, 1180, 10); c.clip();
    c.fillStyle = lg(c, 0, wy, 0, wy + 1180, [[0, '#0e1630'], [.6, '#233a62'], [1, '#3b5a80']]); c.fillRect(wx, wy, 820, 1180);
    glow(c, wx + 600, wy + 260, 300, '200,220,255', .55); el(c, wx + 600, wy + 260, 60, 60); fs(c, '#eef2ff');
    for (let i = 0; i < 9; i++) { const rx = wx - 40 + i * 110, rh = 260 + rnd(i + 40) * 300; P(c, [rx, wy + 1180, rx, wy + 1180 - rh, rx + 60, wy + 1180 - rh - 70, rx + 120, wy + 1180 - rh, rx + 120, wy + 1180]); fs(c, '#141c30'); rr(c, rx + 70, wy + 1180 - rh - 110, 26, 80, 2); fs(c, '#141c30'); if (rnd(i + 70) > .5) { rr(c, rx + 30, wy + 1180 - rh + 60, 20, 26, 2); fs(c, '#e8b860'); } }
    fog(c, wy + 900, 200, '160,180,220', .25, t, { r: 360, n: 4, speed: 20 });
    c.restore();
    rr(c, wx, wy, 820, 1180, 10); fs(c, null, 40, '#3a2416'); ln(c, [wx + 410, wy, wx + 410, wy + 1180], 26, '#3a2416'); ln(c, [wx, wy + 560, wx + 820, wy + 560], 26, '#3a2416');
    rr(c, wx - 60, wy + 1170, 940, 50, 8); fs(c, '#5a3a24', 8);
    P(c, [wx - 80, wy - 60, wx + 120, wy - 60, wx + 60, wy + 700, wx - 40, wy + 1100]); fs(c, '#6a2e24', 6); // curtain
    // shelf with lasts, jars
    rr(c, -2300, -1900, 1500, 40, 6); fs(c, '#5a3a24', 7);
    for (let i = 0; i < 6; i++) shoeLast(c, -2200 + i * 230, -1900, 1.3);
    for (let i = 0; i < 4; i++) { rr(c, -2250 + i * 340, -2250, 120, 170, 18); fs(c, ['#6a7a5a', '#8a6a4a', '#4a5a6a', '#9a7a5a'][i], 7); }
    // tools on nails
    const tools = [[-2150, -1600], [-1900, -1600], [-1650, -1600], [-1400, -1600], [-1150, -1600]];
    tools.forEach(([x, y], i) => { el(c, x, y, 10, 10); fs(c, '#888'); c.save(); c.translate(x, y + 10); c.rotate(Math.sin(t * 1.2 + i) * .03);
      if (i === 0) hammerLocal(c, Math.PI); else if (i === 1) { ln(c, [-20, 0, -40, 300], 16, '#6a6a70'); ln(c, [20, 0, 40, 300], 16, '#6a6a70'); } else if (i === 2) { rr(c, -18, 0, 36, 160, 10); fs(c, '#8a5a32', 7); ln(c, [0, 160, 0, 320], 8, '#c8c8d0'); } else if (i === 3) { rr(c, -20, 0, 40, 330, 8); fs(c, '#77777c', 7); } else { c.beginPath(); c.arc(0, 140, 110, -Math.PI * .1, Math.PI * 1.1); c.lineWidth = 18; c.strokeStyle = '#6a4a2a'; c.stroke(); }
      c.restore(); });
    wallClock(c, -400, -2100, t, 1.6);
    // old calendar
    rr(c, 200, -1900, 260, 340, 6); fs(c, '#d8c8a0', 6); rr(c, 200, -1900, 260, 80, 6); fs(c, '#9a3a2a', 6); for (let i = 0; i < 5; i++) ln(c, [230, -1780 + i * 50, 430, -1780 + i * 50], 4, 'rgba(60,40,20,.5)');
  });
  // floor boards
  const fl = (z0, z1, i) => groundQuad(c, cam, -3000, 3000, z0, z1, i % 2 ? '#4a2e1e' : '#52341f');
  for (let i = 0; i < 18; i++) fl(300 + i * 120, 300 + (i + 1) * 120, i);
  for (let i = -12; i <= 12; i++) { const a = gp(cam, i * 240, Math.max(300, cam.z + 80)), b = gp(cam, i * 240, 2400); ln(c, [a.x, a.y, b.x, b.y], 2, 'rgba(20,10,6,.5)'); }
}
function workbench(c, cam, X, Z, t, o = {}) {
  at(c, cam, X, 0, Z, (c) => { c.scale(.5, .5);
    rr(c, -800, -820, 1600, 80, 10); fs(c, lg(c, 0, -820, 0, -740, [[0, '#8a5a34'], [1, '#5a3a20']]), 10);
    P(c, [-800, -740, 800, -740, 760, -620, -760, -620]); fs(c, '#4a2e1a', 9);
    for (const x of [-740, 700]) { rr(c, x, -740, 60, 740, 8); fs(c, '#4a2e1a', 8); }
    ln(c, [-600, -800, 500, -800], 3, 'rgba(255,220,170,.25)');
    if (o.boot !== false) { c.save(); c.translate(o.bootX ?? 120, -820); c.scale(.95, .95); bootLocal(c, o.done ?? .5); c.restore(); }
    // nails, tin, leather offcuts
    for (let i = 0; i < 9; i++) { const x = -560 + i * 22, y = -830 - (i % 3) * 6; ln(c, [x, y, x + 8, y - 26], 4, '#c8c8d0'); }
    rr(c, -720, -900, 120, 80, 10); fs(c, '#7a8088', 6); P(c, [440, -830, 640, -850, 660, -820, 470, -815]); fs(c, '#9a6a3a', 5);
    if (o.candle) candle(c, o.candleX ?? -380, -820, 1.1, t, 2, 160);
  });
}
function mirrorFrame(c, cam, t, o) {
  // big old mirror close to the camera: draws the real wall around the glass, cracked frame, sheen
  const Z = o.Z, tl = proj(cam, o.x0, o.y0, Z), br = proj(cam, o.x1, o.y1, Z), fw = 120 * tl.s;
  c.save();
  c.beginPath(); c.rect(-50, -50, W + 100, H + 100); c.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y); c.fillStyle = lg(c, 0, 0, W, 0, [[0, '#1a110c'], [1, '#2a1a12']]); c.fill('evenodd');
  // glass sheen + slight darkening of the reflection
  c.save(); c.beginPath(); c.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y); c.clip();
  c.fillStyle = 'rgba(20,14,30,.12)'; c.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  c.globalCompositeOperation = 'screen'; c.fillStyle = lg(c, tl.x, tl.y, br.x, br.y, [[0, 'rgba(255,240,220,0)'], [.28, 'rgba(255,240,220,.12)'], [.34, 'rgba(255,240,220,0)'], [.62, 'rgba(255,240,220,0)'], [.66, 'rgba(255,240,220,.07)'], [.7, 'rgba(255,240,220,0)']]); c.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  c.globalCompositeOperation = 'source-over';
  // silvering spots and cracks at the edge
  for (let i = 0; i < 16; i++) { const e = rnd(i + 90), x = e < .5 ? tl.x + rnd(i + 91) * 90 * tl.s : br.x - rnd(i + 92) * 90 * tl.s, y = tl.y + rnd(i + 93) * (br.y - tl.y); el(c, x, y, (8 + rnd(i) * 26) * tl.s, (6 + rnd(i + 1) * 18) * tl.s); c.fillStyle = 'rgba(60,50,40,.35)'; c.fill(); }
  const cr = (x, y, n, s) => { let px = x, py = y; c.beginPath(); c.moveTo(px, py); for (let i = 0; i < n; i++) { px += (rnd(s + i) - .3) * 120 * tl.s; py += (rnd(s + i + 50) - .5) * 160 * tl.s; c.lineTo(px, py); } c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke(); };
  cr(tl.x, tl.y + (br.y - tl.y) * .18, 5, 3); cr(br.x, br.y - (br.y - tl.y) * .12, 4, 9); cr(tl.x, br.y - (br.y - tl.y) * .3, 3, 17);
  c.restore();
  // carved wooden frame
  c.beginPath(); c.rect(tl.x - fw, tl.y - fw, br.x - tl.x + fw * 2, br.y - tl.y + fw * 2); c.rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  c.fillStyle = lg(c, tl.x - fw, 0, br.x + fw, 0, [[0, '#4a2a16'], [.06, '#8a5a30'], [.5, '#5a3820'], [.94, '#8a5a30'], [1, '#3a2010']]); c.fill('evenodd');
  c.lineWidth = 6; c.strokeStyle = OUT; c.strokeRect(tl.x - fw, tl.y - fw, br.x - tl.x + fw * 2, br.y - tl.y + fw * 2); c.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  c.strokeStyle = 'rgba(255,200,140,.35)'; c.lineWidth = 3; c.strokeRect(tl.x - fw * .55, tl.y - fw * .55, br.x - tl.x + fw * 1.1, br.y - tl.y + fw * 1.1);
  for (let i = 0; i < 8; i++) { const y = tl.y + (i + .5) / 8 * (br.y - tl.y); el(c, tl.x - fw / 2, y, fw * .22, fw * .3); c.fillStyle = 'rgba(30,16,8,.45)'; c.fill(); el(c, br.x + fw / 2, y, fw * .22, fw * .3); c.fill(); }
  // chipped corner
  P(c, [br.x + fw, tl.y - fw, br.x + fw * .2, tl.y - fw, br.x + fw, tl.y - fw * .1]); c.fillStyle = '#1a110c'; c.fill();
  c.restore();
}

// ================= M2: TRÖDLER =================
function troedlerSign(c, t) { c.save(); c.rotate(Math.sin(t * 1.1) * .015); ln(c, [-300, -400, -300, -130], 10, '#2a2220'); ln(c, [300, -400, 300, -130], 10, '#2a2220'); rr(c, -470, -130, 940, 270, 18); fs(c, lg(c, 0, -130, 0, 140, [[0, '#2f4a3a'], [1, '#1e3428']]), 12); rr(c, -440, -100, 880, 210, 12); fs(c, null, 6, '#d8b45a'); txt(c, 'Trödler', 0, 8, 150, '#f0d890', { stroke: 10, strokeCol: '#1a2a20' }); c.restore(); }
function troedlerBack(c, cam, t, o = {}) {
  at(c, cam, 0, 0, 2600, (c) => {
    c.fillStyle = lg(c, 0, -3200, 0, 0, [[0, '#2a2018'], [1, '#4a3826']]); c.fillRect(-3000, -3600, 6000, 3800);
    // shelves floor to ceiling
    for (let r = 0; r < 6; r++) { const y = -300 - r * 480; rr(c, -2800, y, 3600, 36, 4); fs(c, '#5a3e26', 7);
      for (let i = 0; i < 9; i++) { const x = -2700 + i * 390 + (r % 2) * 80, k = (r * 9 + i) % 7;
        if (k === 0) { el(c, x + 100, y - 90, 130, 30); fs(c, '#3a3036', 6); c.beginPath(); c.arc(x + 100, y - 90, 80, Math.PI, 0); fs(c, '#3a3036', 6); }
        else if (k === 1) { for (const dx of [0, 120]) { rr(c, x + dx, y - 260, 90, 260, 16); fs(c, '#4a2a1c', 6); } }
        else if (k === 2) { el(c, x + 100, y - 130, 100, 100); fs(c, '#8a6a3a', 7); el(c, x + 100, y - 130, 80, 80); fs(c, '#e8dcc0', 5); ln(c, [x + 100, y - 130, x + 100 + Math.sin(t + i) * 50, y - 170], 5, '#222'); }
        else if (k === 3) { for (let j = 0; j < 4; j++) { rr(c, x + j * 60, y - 180 - (j % 2) * 30, 46, 180 + (j % 2) * 30, 10); fs(c, ['#3a6a5a', '#8a4a2a', '#6a5a2a', '#4a4a6a'][j], 5); } }
        else if (k === 4) { rr(c, x, y - 220, 260, 220, 10); fs(c, '#6a4a2e', 6); ln(c, [x, y - 150, x + 260, y - 150], 5, '#3a2a1a'); }
        else if (k === 5) { el(c, x + 130, y - 120, 120, 120); fs(c, '#a88a5a', 6); el(c, x + 130, y - 120, 60, 60); fs(c, '#5a4a3a', 5); }
        else { P(c, [x, y, x + 80, y - 280, x + 160, y]); fs(c, '#c9a45a', 6); el(c, x + 80, y - 290, 30, 30); fs(c, '#f4e8c8', 5); } } }
    // hanging coats on a rail
    ln(c, [-2900, -3050, 2900, -3050], 14, '#2a2220');
    for (let i = 0; i < 14; i++) { const x = -2700 + i * 400, sw = Math.sin(t * 1.3 + i) * .03; c.save(); c.translate(x, -3050); c.rotate(sw); P(c, [-140, 60, 140, 60, 170, 800, -170, 800]); fs(c, ['#4a4a3a', '#5a3a2a', '#2a3a4a', '#6a5a4a', '#3a3a3a'][i % 5], 7); ln(c, [0, 60, 0, 780], 4, 'rgba(0,0,0,.4)'); c.restore(); }
    // door with window + sign
    const dx = o.doorX ?? 600; c.save(); c.translate(dx + 450, 0); c.scale(.5, .5); c.translate(-(dx + 450), 0); rr(c, dx, -2200, 900, 2200, 10); fs(c, '#5a3a20', 10);
    c.save(); rr(c, dx + 120, -2050, 660, 900, 8); c.clip(); c.fillStyle = lg(c, 0, -2050, 0, -1150, [[0, '#fff2cc'], [1, '#f0c880']]); c.fillRect(dx, -2200, 900, 1200); for (let i = 0; i < 3; i++) { rr(c, dx + 160 + i * 200, -1600, 140, 450, 4); fs(c, 'rgba(180,140,90,.5)'); } c.restore();
    ln(c, [dx + 450, -2050, dx + 450, -1150], 18, '#4a2e18'); ln(c, [dx + 120, -1600, dx + 780, -1600], 18, '#4a2e18');
    el(c, dx + 780, -1000, 30, 30); fs(c, '#c9a64a', 6);
    // bell over the door
    c.save(); c.translate(dx + 450, -2280); c.rotate(Math.sin(t * 5) * .15 * Math.exp(-t)); c.beginPath(); c.moveTo(-50, 70); c.quadraticCurveTo(-40, -10, 0, -14); c.quadraticCurveTo(40, -10, 50, 70); c.closePath(); fs(c, '#d8b45a', 6); c.restore();
    c.restore();
  });
  for (let i = 0; i < 16; i++) groundQuad(c, cam, -3000, 3000, 300 + i * 150, 450 + i * 150, i % 2 ? '#3a2a1c' : '#42301f');
}

// ================= M3: PRISON FLASHBACK =================
function stoneWall(c, x0, y0, w, h, col, s) {
  c.fillStyle = col; c.fillRect(x0, y0, w, h);
  for (let r = 0; r * 170 < h; r++) for (let i = -1; i * 300 < w + 300; i++) { const x = x0 + i * 300 + (r % 2) * 150 + (rnd(r * 31 + i + s) - .5) * 30, y = y0 + r * 170; rr(c, x + 6, y + 6, 288, 158, 30); c.fillStyle = shadeHex(col, (rnd(r * 17 + i + s) - .5) * .25); c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke(); }
}
function cellBack(c, cam, t, o = {}) {
  at(c, cam, 0, 0, 2200, (c) => {
    stoneWall(c, -2600, -3400, 5200, 3500, o.col || '#6a6560', 7);
    // barred window high
    const wx = o.winX ?? 500, wy = -2700; rr(c, wx, wy, 520, 420, 10); c.fillStyle = o.sky || '#cfd8e0'; c.fill(); c.lineWidth = 14; c.strokeStyle = '#2a2624'; c.stroke();
    for (let i = 1; i < 5; i++) ln(c, [wx + i * 104, wy, wx + i * 104, wy + 420], 20, '#2a2624'); ln(c, [wx, wy + 210, wx + 520, wy + 210], 16, '#2a2624');
    if (o.chain) { for (let i = 0; i < 8; i++) { el(c, -1700, -1900 + i * 50, 22, 30); fs(c, null, 8, '#3a3634'); } el(c, -1700, -1950, 30, 30); fs(c, '#3a3634'); }
  });
  for (let i = 0; i < 14; i++) groundQuad(c, cam, -3000, 3000, 300 + i * 140, 440 + i * 140, i % 2 ? '#4a4642' : '#524d48');
  for (let i = -10; i <= 10; i++) { const a = gp(cam, i * 300 + 150, 300), b = gp(cam, i * 300 + 150, 2200); ln(c, [a.x, a.y, b.x, b.y], 3, 'rgba(0,0,0,.25)'); }
}
function tally(c, n, x, y, s, col = 'rgba(30,24,20,.85)', per = 6) { // scratched tally marks (groups of five)
  for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, gx = x + (g % per) * 150 * s, gy = y + Math.floor(g / per) * 170 * s;
    if (j < 4) ln(c, [gx + j * 26 * s, gy, gx + j * 26 * s + 6 * s, gy + 110 * s], 7 * s, col); else ln(c, [gx - 14 * s, gy + 80 * s, gx + 104 * s, gy + 26 * s], 7 * s, col); }
}
function bunk(c, cam, X, Z, s = 1) {
  at(c, cam, X, 0, Z, (c) => { c.scale(s, s); rr(c, -520, -360, 1040, 70, 8); fs(c, '#5a4a3a', 8); rr(c, -500, -420, 1000, 70, 20); fs(c, '#8a8a7a', 7); el(c, -380, -430, 140, 50); fs(c, '#d8d0c0', 7); for (const x of [-500, 470]) { rr(c, x, -360, 30, 360, 6); fs(c, '#3a3430', 6); } ln(c, [-300, -400, 300, -400], 4, 'rgba(0,0,0,.25)'); });
}

// ================= M4: BERLIN STREET (autumn morning) =================
function facade(c, w, floors, o = {}) {
  const fh = 1500, h = floors * fh + 600, col = o.col || '#d8c0a0';
  c.fillStyle = lg(c, 0, -h, 0, 0, [[0, shadeHex(col, .08)], [1, shadeHex(col, -.12)]]); c.fillRect(-w / 2, -h, w, h); c.lineWidth = 6; c.strokeStyle = OUT; c.strokeRect(-w / 2, -h, w, h);
  // cornice + roof
  rr(c, -w / 2 - 60, -h - 80, w + 120, 100, 6); fs(c, shadeHex(col, -.2), 6);
  P(c, [-w / 2 - 30, -h - 80, -w / 2 + 200, -h - 620, w / 2 - 200, -h - 620, w / 2 + 30, -h - 80]); fs(c, o.roof || '#5a4a4e', 6);
  for (let i = 0; i < Math.max(1, Math.floor(w / 700)); i++) { const x = -w / 2 + 350 + i * 700; P(c, [x - 110, -h - 200, x, -h - 400, x + 110, -h - 200, x + 110, -h - 80, x - 110, -h - 80]); fs(c, shadeHex(col, -.05), 5); rr(c, x - 60, -h - 300, 120, 160, 50); fs(c, '#2a3040', 5); }
  rr(c, -w / 2 + 120, -h - 760, 90, 260, 4); fs(c, '#6a4a3e', 5);
  const nw = Math.max(2, Math.round(w / 520));
  for (let f = 0; f < floors; f++) { const y = -600 - (f + 1) * fh + 320;
    ln(c, [-w / 2, y + fh - 300, w / 2, y + fh - 300], 18, shadeHex(col, -.15));
    for (let i = 0; i < nw; i++) { const x = -w / 2 + (i + .5) * (w / nw), ww = 220, wh = 560;
      P(c, [x - ww / 2 - 40, y - 30, x, y - 140, x + ww / 2 + 40, y - 30]); fs(c, shadeHex(col, -.1), 5);
      rr(c, x - ww / 2, y, ww, wh, 6); const lit = o.lit && rnd(f * 13 + i + (o.seed || 0)) > .55;
      fs(c, lit ? lg(c, 0, y, 0, y + wh, [[0, '#ffd890'], [1, '#e8a850']]) : lg(c, 0, y, 0, y + wh, [[0, o.glass || '#7f93a8'], [1, shadeHex(o.glass || '#7f93a8', -.35)]]), 6);
      ln(c, [x, y, x, y + wh], 6, OUT); ln(c, [x - ww / 2, y + wh * .4, x + ww / 2, y + wh * .4], 6, OUT);
      ln(c, [x - ww / 2 + 20, y + 30, x - 20, y + wh * .35], 6, 'rgba(255,255,255,.3)');
      if (f === 1 && i % 2 === 0) { rr(c, x - ww / 2 - 60, y + wh, ww + 120, 40, 4); fs(c, shadeHex(col, -.25), 5); for (let j = 0; j < 6; j++) ln(c, [x - ww / 2 - 40 + j * 54, y + wh + 40, x - ww / 2 - 40 + j * 54, y + wh + 160], 8, '#2a2a2a'); ln(c, [x - ww / 2 - 60, y + wh + 160, x + ww / 2 + 60, y + wh + 160], 10, '#2a2a2a'); }
      if (o.lit && lit) glow(c, x, y + wh / 2, 380, '255,190,100', .25); } }
  // ground floor shop
  rr(c, -w / 2 + 60, -560, w - 120, 560, 0); fs(c, shadeHex(col, -.3), 6);
  for (let i = 0; i < 3; i++) { const x = -w / 2 + 160 + i * (w - 320) / 3; rr(c, x, -480, (w - 320) / 3 - 60, 400, 6); fs(c, o.lit ? '#f0b860' : '#5a6878', 5); }
  if (o.awning) { P(c, [-w / 2 + 40, -600, w / 2 - 40, -600, w / 2, -420, -w / 2, -420]); fs(c, o.awning, 6); for (let i = 0; i < 10; i++) { const x = -w / 2 + i * w / 10; P(c, [x, -420, x + w / 20, -380, x + w / 10, -420]); fs(c, o.awning, 4); } }
}
function gasLamp(c, on = 1, t = 0, i = 0) { // local, base at 0
  rr(c, -40, -60, 80, 60, 10); fs(c, '#1e2224', 7); rr(c, -16, -1700, 32, 1650, 8); fs(c, lg(c, -16, 0, 16, 0, [[0, '#2a3034'], [.5, '#4a5458'], [1, '#1a1e20']]), 7);
  ln(c, [-16, -1640, -140, -1640], 12, '#2a3034'); ln(c, [16, -1640, 140, -1640], 12, '#2a3034');
  P(c, [-90, -1960, 90, -1960, 120, -1760, -120, -1760]); fs(c, on ? 'rgba(255,214,140,.95)' : '#8a8e8a', 8); P(c, [-130, -1960, 0, -2050, 130, -1960]); fs(c, '#1e2224', 7); rr(c, -100, -1765, 200, 26, 6); fs(c, '#1e2224', 6);
  if (on) { const f = 1 + Math.sin(t * 9 + i) * .04; glow(c, 0, -1860, 520 * f, '255,190,110', .6 * on); glow(c, 0, -1860, 140, '255,240,200', .8 * on); }
}
function autumnTree(c, t, seed = 0, s = 1) {
  c.save(); c.scale(s, s);
  P(c, [-60, 0, -40, -1300, 40, -1300, 70, 0]); fs(c, '#4a3020', 7); ln(c, [-20, -1100, -340, -1700], 40, '#4a3020'); ln(c, [20, -1200, 300, -1800], 34, '#4a3020');
  const bl = []; for (let i = 0; i < 30; i++) { const a = rnd(i + seed) * TAU, r = Math.sqrt(rnd(i + seed + 5)) * 480; bl.push([Math.cos(a) * r * 1.1 + Math.sin(t * .8 + i) * 8, -1850 + Math.sin(a) * r * .75, 120 + rnd(i + seed + 9) * 110, ['#b8561c', '#cf7a26', '#9c3e18', '#d9962e', '#8a5a1c'][i % 5]]); }
  bl.sort((a, b) => a[1] - b[1]); blobs(c, bl, 9);
  for (let i = 0; i < 40; i++) { const a = rnd(i + seed + 70) * TAU, r = Math.sqrt(rnd(i + seed + 71)) * 520; el(c, Math.cos(a) * r, -1850 + Math.sin(a) * r * .75, 16, 9, a); c.fillStyle = i % 2 ? '#6a2e10' : '#e8b048'; c.fill(); }
  c.restore();
}
function blobs(c, list, lw = 7) { for (const b of list) { c.beginPath(); c.arc(b[0], b[1], b[2] + lw / 2, 0, TAU); c.fillStyle = OUT; c.fill(); } for (const b of list) { c.beginPath(); c.arc(b[0], b[1], b[2] - lw / 2, 0, TAU); c.fillStyle = b[3]; c.fill(); } for (const b of list) { c.beginPath(); c.arc(b[0] - b[2] * .25, b[1] - b[2] * .3, b[2] * .45, 0, TAU); c.fillStyle = 'rgba(255,220,140,.12)'; c.fill(); } }
function carriage(c, t, walk = true) { // horse cab, side view facing right, local units (horse from animals.js)
  c.save();
  const wr = t * 2.2;
  rr(c, -1500, -1000, 760, 560, 40); fs(c, '#2a2030', 8); rr(c, -1440, -940, 260, 260, 20); fs(c, '#e8c070', 6); P(c, [-1560, -1000, -700, -1000, -760, -1080, -1500, -1080]); fs(c, '#1a1620', 7);
  for (const [x, r] of [[-1400, 230], [-850, 180]]) { c.beginPath(); c.arc(x, -r, r, 0, TAU); fs(c, null, 14, '#3a2a1a'); for (let i = 0; i < 8; i++) { const a = wr + i / 8 * TAU; ln(c, [x, -r, x + Math.cos(a) * r, -r + Math.sin(a) * r], 6, '#3a2a1a'); } el(c, x, -r, 30, 30); fs(c, '#c9a45a', 5); }
  ln(c, [-760, -700, -300, -640], 14, '#3a2a1a');
  c.save(); c.translate(-50, 0); c.scale(2, 2); horse(c, 0, { t, walk }); c.restore();
  c.restore();
}
function cobbles(c, cam, x0, x1, z0, z1, o = {}) {
  let z = z0, row = 0; while (z < cam.z + 80) { z += (o.size || 160); row++; }
  while (z < z1) { const dz = (o.size || 160) * (1 + (z - z0) / 3000 * .3), sz = (o.size || 160) * 1.4;
    for (let x = x0 + (row % 2) * sz * .5; x < x1; x += sz) { const a = gp(cam, x + 8, z + 8), b = gp(cam, x + sz - 8, z + 8), d = gp(cam, x + sz - 8, z + dz - 8), e = gp(cam, x + 8, z + dz - 8);
      if (b.x < -50 || a.x > W + 50 || a.y < 0) continue; const k = rnd(row * 97 + Math.floor(x / sz));
      P(c, [a.x, a.y, b.x, b.y, d.x, d.y, e.x, e.y]); c.fillStyle = shadeHex(o.col || '#8a8072', (k - .5) * .22); c.fill(); }
    z += dz; row++; }
}

function streetScene(c, Ls, cam, t, o = {}) {
  const b = Ls.bg.c;
  // sky
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#7da0c8'], [.45, '#f2c890'], [.7, '#f8dcb0'], [1, '#e8c8a0']]); b.fillRect(0, 0, W, H);
  // distant towers (very far: draw at Z 30000)
  at(b, cam, 2600, 0, 30000, (c) => { c.fillStyle = 'rgba(120,130,160,.8)'; rr(c, -700, -9000, 1400, 9000, 0); c.fill(); P(c, [-700, -9000, 0, -14500, 700, -9000]); c.fill(); rr(c, 3400, -7000, 1800, 7000, 0); c.fill(); el(c, 4300, -7000, 1000, 900); c.fill(); rr(c, -5200, -6000, 1400, 6000, 0); c.fill(); P(c, [-5200, -6000, -4500, -9500, -3800, -6000]); c.fill(); });
  fog(b, cam.hy - 100, 200, '255,236,210', .5, t, { r: 600, n: 6 });
  // avenue into depth: facades both sides
  const rows = [];
  for (let i = 0; i < 9; i++) { const Z = 16000 - i * 1700; rows.push([Z, -2300 - (i % 2) * 40, 1, i]); rows.push([Z + 600, 2300, -1, i + 20]); }
  rows.sort((a, b) => b[0] - a[0]);
  const cols = ['#e3c8a0', '#c98e6a', '#d8b88a', '#b8a088', '#e8d6b8', '#c4a07c', '#a8b4b8'];
  for (const [Z, X, side, i] of rows) {
    const p = proj(cam, X, 0, Z); if (Z - cam.z < 300) continue;
    at(b, cam, X + side * -900, 0, Z, (c) => { facade(c, 1800, 4, { col: cols[i % 7], seed: i, awning: i % 3 === 0 ? ['#7a2a2a', '#2a5a3a', '#3a3a6a'][i % 3] : null, roof: i % 2 ? '#5a4a4e' : '#6a3a30' }); });
    const fogA = clamp((Z - 2500) / 14000) * .75; if (fogA > .05) { b.save(); b.globalAlpha = fogA * .35; b.fillStyle = '#f4dcc0'; b.fillRect(0, 0, W, H); b.restore(); }
  }
  // street surface
  cobbles(b, cam, -1800, 1800, 600, 17000, { col: '#8a7e70', size: 170 });
  for (let z = 1400; z < 16000; z += 1800) { at(b, cam, -1500, 0, z, (c) => gasLamp(c, 0, t, z)); at(b, cam, 1500, 0, z + 900, (c) => gasLamp(c, 0, t, z)); }
  for (let z = 2600; z < 16000; z += 3600) { at(b, cam, -1700, 0, z, (c) => autumnTree(c, t, z)); at(b, cam, 1700, 0, z + 1800, (c) => autumnTree(c, t, z + 5)); }
  if (o.carriage !== false) at(b, cam, -2000 + ((t * 260) % 5000), 0, 7600, (c) => carriage(c, t));
  // passers-by in the distance
  for (let i = 0; i < 6; i++) { const z = 3600 + i * 1300, x = ((rnd(i + 3) * 3000 + t * (i % 2 ? 140 : -140)) % 3000) - 1500; at(b, cam, x, 0, z, (c) => drawPersonSide(c, { k: .5, s: i % 2 ? 1 : -1, walk: t * 7 + i, skin: SKIN.peach, hat: ['bowler', 'top', null, 'flat'][i % 4], hair: 'short', coat: ['#3a3a42', '#5a4030', '#2a3a3a'][i % 3], coatLong: i % 2, dress: 0 })); }
  fog(b, cam.hy + 40, 300, '255,240,220', .4, t, { r: 700, n: 7, speed: 14 });
  // golden sun shafts from the upper right
  for (let i = 0; i < 5; i++) beam(b, W * (.7 + i * .09), -100, W * (.0 + i * .14), H * .95, 60, 300 + i * 40, '255,210,140', .1 + .03 * Math.sin(t * .7 + i));
  // near sidewalk (foreground plane under the characters)
  cobbles(Ls.mid.c, cam, -6000, 6000, 300, 1600, { col: '#9a8c7a', size: 150 });
  groundQuad(Ls.mid.c, cam, -6000, 6000, 1550, 1620, '#6a6058');
}

// ================= M5: STATION =================
function stationScene(c, Ls, cam, t, o) {
  const b = Ls.bg.c;
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#9ab0c0'], [.5, '#e8c89a'], [1, '#b8a080']]); b.fillRect(0, 0, W, H);
  // iron + glass roof: arches receding
  for (let i = 8; i >= 0; i--) { const Z = 1800 + i * 1400; at(b, cam, 0, 0, Z, (c) => { c.beginPath(); c.moveTo(-4200, -2600); c.quadraticCurveTo(0, -6200, 4200, -2600); c.lineWidth = 90; c.strokeStyle = '#2e3438'; c.stroke(); for (let j = -4; j <= 4; j++) ln(c, [j * 900, -2600 - (1 - (j / 4) ** 2) * 1800, j * 900, -2600 - (1 - (j / 4) ** 2) * 1800 - 120], 30, '#2e3438'); for (const x of [-4200, 4200]) { rr(c, x - 60, -2600, 120, 2600, 10); fs(c, '#2e3438', 8); } }); }
  // light through the glass roof
  for (let i = 0; i < 6; i++) beam(b, W * (.15 + i * .16), -50, W * (.05 + i * .18) + 120, H * .9, 90, 360, '255,225,170', .12);
  // platform
  cobbles(b, cam, -4000, 0, 900, 14000, { col: '#a89c8a', size: 260 });
  // Bahnhof sign hanging from the roof (left)
  at(b, cam, -1500, 0, o.signZ ?? 3600, (c) => { ln(c, [-500, -3000, -500, -2560], 14, '#2a2a2a'); ln(c, [500, -3000, 500, -2560], 14, '#2a2a2a'); rr(c, -900, -2560, 1800, 430, 20); fs(c, '#1e3a5a', 14); rr(c, -860, -2520, 1720, 350, 14); fs(c, null, 8, '#f0e8d0'); txt(c, 'Bahnhof', 0, -2345, 280, '#f4ecd4', { font: '"DejaVu Serif"' }); });
  // station clock on a pillar
  at(b, cam, -2400, 0, 5200, (c) => { rr(c, -60, -2600, 120, 2600, 10); fs(c, '#2e3438', 8); el(c, 0, -2400, 260, 260); fs(c, '#f4ecd8', 14); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ln(c, [Math.sin(a) * 220, -2400 - Math.cos(a) * 220, Math.sin(a) * 190, -2400 - Math.cos(a) * 190], 12, '#222'); } ln(c, [0, -2400, 120, -2480], 16, '#111'); ln(c, [0, -2400, -30, -2240], 12, '#111'); });
  // people + luggage on the platform
  for (let i = 0; i < 5; i++) at(b, cam, -3200 + i * 500, 0, 4200 + i * 900, (c) => drawPerson(c, { k: .5, skin: [SKIN.peach, SKIN.tan, SKIN.rose][i % 3], hat: ['top', 'bowler', 'sun', 'flat', 'bowler'][i], hair: i === 2 ? 'bun' : 'short', coat: ['#3a3040', '#5a4a3a', '#7a4a5a', '#3a4a3a', '#2a2a3a'][i], dress: i === 2, coatLong: 1 }));
  at(b, cam, -1900, 0, 2800, (c) => { rr(c, -300, -400, 600, 400, 30); fs(c, '#7a4a2a', 10); rr(c, -200, -700, 400, 300, 30); fs(c, '#5a6a4a', 10); rr(c, -60, -760, 120, 60, 20); fs(c, null, 10, '#2a1a10'); });
}
function trainSide(c, t, o = {}) { // carriage + loco, local units, ground 0, x along track; windows array returned
  const len = 12000;
  rr(c, -len, -2300, len + 4600, 1700, 40); fs(c, lg(c, 0, -2300, 0, -600, [[0, '#2e4a3a'], [1, '#1e3428']]), 12);
  ln(c, [-len, -1900, 4600, -1900], 14, '#c9a45a');
  for (let i = 0; i < 12; i++) { const x = -len + 300 + i * 1000; rr(c, x, -2100, 700, 760, 30); fs(c, o.winFill || '#e8c890', 10); ln(c, [x + 120, -2050, x + 300, -1450], 10, 'rgba(255,255,255,.3)'); }
  rr(c, -len - 100, -2500, len + 4800, 220, 40); fs(c, '#2a2a30', 10);
  // underframe + wheels
  rr(c, -len, -600, len + 4600, 160, 10); fs(c, '#1a1a1c', 8);
  const rot = o.wheelRot || 0;
  for (let i = 0; i < 14; i++) { const x = -len + 500 + i * 1150; wheel(c, x, -330, 300, rot); }
  // loco front (right)
  rr(c, 3000, -2700, 1800, 2100, 30); fs(c, '#1a1c20', 12); rr(c, 4400, -3300, 300, 700, 30); fs(c, '#1a1c20', 10); el(c, 4550, -3300, 220, 60); fs(c, '#2a2a30', 8);
  el(c, 4700, -1700, 160, 160); fs(c, '#ffe6a8', 12); glow(c, 4700, -1700, 900, '255,220,150', .8);
}
function wheel(c, x, y, r, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); c.arc(0, 0, r, 0, TAU); fs(c, '#7a2a24', 14); c.beginPath(); c.arc(0, 0, r * .8, 0, TAU); fs(c, '#3a1a18', 8); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ln(c, [0, 0, Math.cos(a) * r * .8, Math.sin(a) * r * .8], 16, '#8a3a30'); } el(c, 0, 0, r * .22, r * .22); fs(c, '#c9a45a', 8); el(c, r * .5, 0, r * .12, r * .12); fs(c, '#d8d8dc', 6); c.restore(); }

// ================= M6: RATHAUS =================
function rathausFacade(c, t, o = {}) { // local units, ground 0, centre = door; red brick neo-gothic with tower
  const brick = o.brick || '#a8442e', w = 6400;
  c.fillStyle = lg(c, 0, -6000, 0, 0, [[0, shadeHex(brick, .08)], [1, shadeHex(brick, -.15)]]); c.fillRect(-w / 2, -6000, w, 6000);
  c.save(); c.globalAlpha = .18; for (let y = -6000; y < 0; y += 90) ln(c, [-w / 2, y, w / 2, y], 4, '#3a1208'); c.restore();
  // gables and tower
  for (const x of [-2600, 2600]) { P(c, [x - 700, -6000, x, -7600, x + 700, -6000]); fs(c, brick, 10); for (let s = 0; s < 6; s++) { rr(c, x - 700 + s * 230, -6000 - s * 260 - 120, 140, 160, 0); } }
  rr(c, -900, -11000, 1800, 5200, 0); fs(c, lg(c, -900, 0, 900, 0, [[0, shadeHex(brick, -.15)], [.5, brick], [1, shadeHex(brick, -.2)]]), 12);
  P(c, [-1000, -11000, 0, -14200, 1000, -11000]); fs(c, '#3e5a54', 12); ln(c, [0, -14200, 0, -14800], 30, '#c9a45a'); el(c, 0, -14850, 60, 60); fs(c, '#d8b45a', 8);
  el(c, 0, -9800, 560, 560); fs(c, '#f2e8cc', 16); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ln(c, [Math.sin(a) * 480, -9800 - Math.cos(a) * 480, Math.sin(a) * 420, -9800 - Math.cos(a) * 420], 22, '#2a2a2a'); } ln(c, [0, -9800, 0, -10150], 30, '#1a1a1a'); ln(c, [0, -9800, 230, -9700], 26, '#1a1a1a');
  for (let i = 0; i < 3; i++) { rr(c, -560 + i * 400, -8700, 260, 900, 130); fs(c, o.lit ? '#ffd890' : '#3a4a5a', 10); }
  // windows rows (pointed arches)
  for (let f = 0; f < 3; f++) for (let i = 0; i < 9; i++) { const x = -2900 + i * 720, y = -5300 + f * 1500; if (Math.abs(x) < 700 && f === 0) continue; c.beginPath(); c.moveTo(x - 180, y + 900); c.lineTo(x - 180, y + 200); c.quadraticCurveTo(x, y - 60, x + 180, y + 200); c.lineTo(x + 180, y + 900); c.closePath(); fs(c, o.lit && rnd(f * 9 + i) > .4 ? lg(c, 0, y, 0, y + 900, [[0, '#ffe2a0'], [1, '#e8a850']]) : lg(c, 0, y, 0, y + 900, [[0, '#7a90a8'], [1, '#2a3a4a']]), 10); ln(c, [x, y + 80, x, y + 900], 8, '#e8dcc0'); rr(c, x - 220, y + 900, 440, 60, 6); fs(c, '#e8dcc0', 6); }
  // white stone bands
  for (const y of [-1500, -3800, -6000]) { rr(c, -w / 2, y - 40, w, 80, 0); fs(c, '#e6dccb', 6); }
  // portal
  c.beginPath(); c.moveTo(-620, 0); c.lineTo(-620, -1500); c.quadraticCurveTo(0, -2300, 620, -1500); c.lineTo(620, 0); c.closePath(); fs(c, '#e6dccb', 12);
  c.beginPath(); c.moveTo(-460, 0); c.lineTo(-460, -1420); c.quadraticCurveTo(0, -2040, 460, -1420); c.lineTo(460, 0); c.closePath(); fs(c, lg(c, 0, -2000, 0, 0, [[0, '#4a2a18'], [1, '#2a160c']]), 10);
  ln(c, [0, -1800, 0, 0], 10, '#1a0c06'); for (const x of [-120, 120]) { el(c, x, -800, 40, 40); fs(c, '#c9a45a', 6); }
  // "Rathaus" plaque
  if (!o.noSign) { rr(c, -900, -2900, 1800, 420, 20); fs(c, '#1e2a24', 12); rr(c, -860, -2860, 1720, 340, 14); fs(c, null, 8, '#d8b45a');
  txt(c, 'Rathaus', 0, -2690, 300, '#f0d890', { font: '"DejaVu Serif"', stroke: 14, strokeCol: '#101a14' }); }
  // steps
  for (let i = 0; i < 3; i++) { rr(c, -1200 - i * 150, -i * 0 + i * 70 - 210, 2400 + i * 300, 80, 6); fs(c, '#cfc6b6', 6); }
  // flags
  for (const x of [-1600, 1600]) { ln(c, [x, -3600, x, -5200], 18, '#3a3a3a'); const wv = Math.sin(t * 3 + x) * 60; c.beginPath(); c.moveTo(x, -5200); c.quadraticCurveTo(x + 300, -5250 + wv, x + 600, -5150); c.lineTo(x + 600, -4800); c.quadraticCurveTo(x + 300, -4850 + wv, x, -4800); c.closePath(); fs(c, '#1a1a1a', 8); c.beginPath(); c.moveTo(x, -4933); c.quadraticCurveTo(x + 300, -4983 + wv, x + 600, -4883); c.lineTo(x + 600, -4800); c.quadraticCurveTo(x + 300, -4850 + wv, x, -4800); c.closePath(); c.fillStyle = '#c03030'; c.fill(); }
}
function townhallInterior(c, cam, t, o = {}) {
  at(c, cam, 0, 0, 3200, (c) => {
    c.fillStyle = lg(c, 0, -4200, 0, 0, [[0, '#5a3e24'], [1, '#7a5634']]); c.fillRect(-3600, -5200, 7200, 5400);
    // wood panelling
    for (let i = 0; i < 12; i++) { rr(c, -3400 + i * 580, -1500, 500, 1300, 10); fs(c, '#6a4628', 8); rr(c, -3360 + i * 580, -1460, 420, 1220, 8); fs(c, null, 5, 'rgba(255,220,160,.2)'); }
    // tall windows
    for (let i = 0; i < 3; i++) { const x = -2700 + i * 2100; c.beginPath(); c.moveTo(x, -1700); c.lineTo(x, -4100); c.quadraticCurveTo(x + 400, -4600, x + 800, -4100); c.lineTo(x + 800, -1700); c.closePath(); fs(c, lg(c, 0, -4500, 0, -1700, [[0, '#fff4d8'], [1, '#f0d090']]), 14); ln(c, [x + 400, -4400, x + 400, -1700], 14, '#4a3020'); ln(c, [x, -2900, x + 800, -2900], 14, '#4a3020'); }
    // portraits in gilded frames + doors
    for (const x of [-1600, 1500]) { rr(c, x, -3400, 520, 700, 10); fs(c, '#c9a040', 14); rr(c, x + 60, -3340, 400, 580, 6); fs(c, '#3a3a2a', 6); el(c, x + 260, -3120, 110, 130); fs(c, '#8a6a50', 6); }
    rr(c, -500, -2400, 1000, 2400, 10); fs(c, '#4a2a16', 12); ln(c, [0, -2400, 0, 0], 10, '#2a160c'); rr(c, -560, -2520, 1120, 140, 10); fs(c, '#c9a040', 10);
  });
  // grand staircase on the right
  for (let i = 0; i < 9; i++) at(c, cam, 2300 + i * 120, -i * 150, 2700 - i * 50, (c) => { rr(c, -700, -40, 1400, 150, 6); fs(c, i % 2 ? '#b8a890' : '#c8b8a0', 6); });
  for (let i = 0; i < 9; i++) at(c, cam, 1650 + i * 120, -i * 150, 2650 - i * 50, (c) => { rr(c, -18, -420, 36, 420, 6); fs(c, '#4a2a16', 5); });
  // floor: polished checker with reflections
  for (let r = 0; r < 18; r++) for (let i = -10; i < 10; i++) { const z = 400 + r * 160; groundQuad(c, cam, i * 320, i * 320 + 320, z, z + 160, (r + i) % 2 ? '#6a4a30' : '#c8b494'); }
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .2; for (let i = 0; i < 3; i++) { const a = gp(cam, -2300 + i * 2100, 2800); beam(c, a.x, a.y - 40, a.x + 200, H, 80, 300, '255,230,180', .5); } c.restore();
}
function chandelier(c, t, lit = 1) {
  ln(c, [0, -2000, 0, -600], 12, '#8a6a30');
  const sw = Math.sin(t * .9) * .02; c.save(); c.rotate(sw);
  el(c, 0, -400, 600, 120); fs(c, '#c9a040', 10); el(c, 0, -600, 200, 200); fs(c, '#d8b450', 10);
  for (let i = 0; i < 7; i++) { const x = -540 + i * 180, y = -440 + Math.abs(i - 3) * -20; ln(c, [x, y, x, y - 120], 12, '#c9a040'); el(c, x, y - 140, 24, 50); fs(c, '#fff0c8', 6); if (lit) glow(c, x, y - 170, 220, '255,210,140', .5); }
  for (let i = 0; i < 9; i++) { const x = -480 + i * 120; ln(c, [x, -380, x, -220], 4, 'rgba(255,255,255,.6)'); el(c, x, -210, 14, 20); c.fillStyle = 'rgba(240,250,255,.85)'; c.fill(); }
  c.restore();
}
function safeLocal(c, open, t) { // "Stadtkasse" gilded safe, local origin bottom centre
  c.save(); c.scale(.55, .55);
  rr(c, -700, -1900, 1400, 1900, 40); fs(c, lg(c, -700, 0, 700, 0, [[0, '#2a3a32'], [.5, '#3e5248'], [1, '#22302a']]), 14);
  rr(c, -640, -1840, 1280, 1780, 30); fs(c, null, 10, '#d8b45a');
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.save(); c.translate(-560 + (i % 2) * 1120, -1760 + Math.floor(i / 2) * 520); el(c, 0, 0, 30, 30); fs(c, '#d8b45a', 6); c.restore(); }
  rr(c, -520, -1700, 1040, 220, 16); fs(c, '#e8cc70', 10); txt(c, 'Stadtkasse', 0, -1590, 150, '#2a2010', { font: '"DejaVu Serif"' });
  // interior
  rr(c, -520, -1360, 1040, 1180, 20); fs(c, '#1a1410', 10);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = -440 + i * 240, y = -1280 + r * 360; for (let k = 0; k < 4; k++) { rr(c, x, y + 200 - k * 34, 200, 60, 8); fs(c, k % 2 ? '#8ab08a' : '#a0c49a', 5); } if (r === 2 && i % 2) { for (let k = 0; k < 5; k++) { el(c, x + 100, y + 230 - k * 26, 70, 22); fs(c, '#e8c860', 5); } } }
  glow(c, 0, -800, 700, '255,220,140', .25);
  // door swung open (to the right, foreshortened)
  const o = ease(open); c.save(); c.translate(520, -1360);
  P(c, [0, 0, 700 * o + 40 * (1 - o), -140 * o, 700 * o + 40 * (1 - o), 1320 + 140 * o, 0, 1180]); fs(c, lg(c, 0, 0, 700, 0, [[0, '#3e5248'], [1, '#2a3a32']]), 12);
  el(c, 350 * o + 20, 590, 120 * o + 30, 130); fs(c, '#d8b45a', 8); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + open * 3; ln(c, [350 * o + 20, 590, 350 * o + 20 + Math.cos(a) * 100 * o, 590 + Math.sin(a) * 110], 10, '#b8943a'); }
  c.restore(); c.restore();
}

// ================= M7/M8: NIGHT STREET, CAFE, PALACE =================
function nightStreet(c, Ls, cam, t, o = {}) {
  const b = Ls.bg.c;
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#0c1428'], [.5, '#1e2a48'], [1, '#2a2a3a']]); b.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { b.fillStyle = `rgba(255,255,255,${.3 + rnd(i) * .5})`; b.fillRect(rnd(i + 3) * W, rnd(i + 7) * H * .3, 2, 2); }
  const rows = [];
  for (let i = 0; i < 7; i++) { rows.push([12000 - i * 1700, -2300, 1, i]); rows.push([12600 - i * 1700, 2300, -1, i + 9]); }
  rows.sort((a, b) => b[0] - a[0]);
  const cols = ['#8a7a6a', '#7a5a4a', '#6a6a72', '#8a6a5a', '#706058'];
  for (const [Z, X, side, i] of rows) { if (Z - cam.z < 300) continue; at(b, cam, X + side * -900, 0, Z, (c) => facade(c, 1800, 4, { col: cols[i % 5], lit: 1, seed: i, glass: '#2a3450', awning: i % 3 === 1 ? '#6a2a2a' : null, roof: '#2a2a34' })); }
  cobbles(b, cam, -1800, 1800, 500, 13000, { col: '#3a3a46', size: 170 });
  // wet reflections of lamps
  for (let z = 1200; z < 12000; z += 1800) for (const X of [-1500, 1500]) { const p = gp(cam, X, z + (X > 0 ? 900 : 0)), s = p.s; b.save(); b.globalCompositeOperation = 'lighter'; b.fillStyle = lg(b, 0, p.y, 0, p.y + 900 * s, [[0, 'rgba(255,190,110,.35)'], [1, 'rgba(255,190,110,0)']]); b.fillRect(p.x - 60 * s, p.y, 120 * s, 900 * s); b.restore(); }
  for (let z = 1200; z < 12000; z += 1800) { at(b, cam, -1500, 0, z, (c) => gasLamp(c, 1, t, z)); at(b, cam, 1500, 0, z + 900, (c) => gasLamp(c, 1, t, z + 1)); }
  fog(b, cam.hy, 260, '120,130,170', .2, t, { r: 600, n: 6, speed: 10 });
}
function newspaper(c, w, h, t) { // local, centred; "Extrablatt" + headline + drawing of uniformed Noah
  c.save(); c.rotate(Math.sin(t * 1.4) * .015);
  P(c, [-w / 2, -h / 2, w / 2, -h / 2 + 10, w / 2 - 6, h / 2, -w / 2 + 8, h / 2 - 8]); fs(c, lg(c, -w / 2, 0, w / 2, 0, [[0, '#e9e0c8'], [1, '#d8cdb0']]), 10);
  txt(c, 'Extrablatt', 0, -h / 2 + h * .1, w * .15, '#1a1612', { font: '"DejaVu Serif"' });
  ln(c, [-w * .44, -h / 2 + h * .18, w * .44, -h / 2 + h * .18], 6, '#1a1612'); ln(c, [-w * .44, -h / 2 + h * .2, w * .44, -h / 2 + h * .2], 2, '#1a1612');
  txt(c, 'Der falsche Hauptmann!', 0, -h / 2 + h * .285, w * .068, '#8a1a14', { font: '"DejaVu Serif"' });
  // drawing (engraving-like) of Noah in uniform
  c.save(); rr(c, -w * .42, -h * .14, w * .48, h * .58, 6); c.clip(); c.fillStyle = '#e4dabd'; c.fillRect(-w, -h, w * 2, h * 2);
  drawOld(c, { x: -w * .18, y: h * .62, k: w * .00044, ink: 1.2, expr: { mouth: 'smirk', look: .3 } }, { outfit: 'uniform', cap: 1, cape: 1, sword: 1 });
  c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(70,60,50,.85)'; c.fillRect(-w, -h, w * 2, h * 2); c.restore();
  rr(c, -w * .42, -h * .14, w * .48, h * .58, 6); fs(c, null, 4, '#1a1612');
  for (let i = 0; i < 16; i++) ln(c, [w * .1, -h * .12 + i * h * .036, w * .43 - (i % 4 === 3 ? w * .12 : 0), -h * .12 + i * h * .036], 5, 'rgba(40,34,28,.55)');
  c.restore();
}
function cafeFront(c, t, o = {}) { // local, ground 0, width ±2000; big lit window with laughing guests
  rr(c, -2200, -2600, 4400, 2600, 0); fs(c, '#3a2a2a', 10);
  rr(c, -2000, -2900, 4000, 320, 16); fs(c, '#1e3a2a', 10);
  P(c, [-2200, -2600, 2200, -2600, 2400, -2300, -2400, -2300]); fs(c, '#7a2a24', 8); for (let i = 0; i < 14; i++) { const x = -2400 + i * 343; P(c, [x, -2300, x + 171, -2240, x + 343, -2300]); fs(c, i % 2 ? '#7a2a24' : '#e8dcc8', 5); }
  rr(c, -1900, -2150, 3800, 1700, 14); fs(c, lg(c, 0, -2150, 0, -450, [[0, '#ffd890'], [1, '#e89a50']]), 14);
  // interior behind the glass: shelves with bottles, mirror, wall lamps, pendant lamps
  c.save(); rr(c, -1900, -2150, 3800, 1700, 14); c.clip();
  c.fillStyle = 'rgba(120,60,30,.35)'; c.fillRect(-1900, -2150, 3800, 900);
  for (const y of [-1900, -1640]) { rr(c, -1800, y, 1300, 26, 4); fs(c, '#5a2e18', 5); for (let i = 0; i < 11; i++) { const x = -1760 + i * 115; rr(c, x, y - 150 - (i % 3) * 20, 50, 150 + (i % 3) * 20, 14); fs(c, ['#2e6a4a', '#7a2a2a', '#c9a04a', '#3a4a7a'][i % 4], 4); } }
  rr(c, 500, -2050, 900, 600, 30); fs(c, 'rgba(255,240,210,.5)', 10, '#c9a040'); el(c, 950, -1750, 300, 200); c.fillStyle = 'rgba(255,255,255,.25)'; c.fill();
  for (const x of [-300, 1700]) { ln(c, [x, -2000, x, -1880], 8, '#3a2a1a'); el(c, x, -1860, 60, 40); fs(c, '#ffe6b0', 5); glow(c, x, -1860, 300, '255,210,140', .6); }
  for (const x of [-1100, 200, 1300]) { const sw = Math.sin(t * 1.3 + x) * 20; ln(c, [x, -2150, x + sw, -1500], 5, '#2a1a10'); P(c, [x + sw - 110, -1440, x + sw - 50, -1520, x + sw + 50, -1520, x + sw + 110, -1440]); fs(c, '#2e5a3a', 6); glow(c, x + sw, -1420, 380, '255,200,120', .55); }
  c.restore();
  glow(c, 0, -1300, 2200, '255,190,110', .35);
}
function palace2(c, t) { // night palace facade; big lit window with the laughing silhouette (back turned) at local (0, -2400)
  c.fillStyle = lg(c, 0, -6000, 0, 0, [[0, '#2e3656'], [1, '#1e2440']]); c.fillRect(-4200, -6000, 8400, 6000); c.lineWidth = 16; c.strokeStyle = OUT; c.strokeRect(-4200, -6000, 8400, 6000);
  c.save(); c.beginPath(); c.rect(-3000, -9200, 6000, 3200); c.clip(); el(c, 0, -6000, 2200, 2600); fs(c, '#3a4670', 16); c.restore();
  ln(c, [0, -8600, 0, -9400], 50, '#c9a45a'); el(c, 0, -9450, 70, 70); fs(c, '#d8b45a', 8);
  const wv = Math.sin(t * 2.5) * 50; c.beginPath(); c.moveTo(0, -9400); c.quadraticCurveTo(300, -9450 + wv, 600, -9350); c.lineTo(600, -9050); c.quadraticCurveTo(300, -9150 + wv, 0, -9100); c.closePath(); fs(c, '#d8d8d8', 8);
  for (let i = -4; i <= 4; i++) { rr(c, i * 900 - 90, -6000, 180, 6000, 0); fs(c, '#2a3250', 8); }
  ln(c, [-4200, -3700, 4200, -3700], 40, '#3a4466'); ln(c, [-4200, -6000, 4200, -6000], 60, '#3a4466');
  for (let i = 0; i < 12; i++) { rr(c, -4100 + i * 700, -6400, 260, 400, 0); fs(c, '#2e3656', 10); }
  for (const r of [0, 1]) for (let i = -4; i < 4; i++) { if (r === 0 && (i === -1 || i === 0)) continue; const x = i * 900 + 450, y = r ? -5600 : -3300; rr(c, x - 220, y, 440, 1100, 220); fs(c, rnd(r * 9 + i + 40) > .5 ? lg(c, 0, y, 0, y + 1100, [[0, '#f0c070'], [1, '#c88840']]) : '#161c32', 10); }
  const x = 0, y = -3400, w = 1100, h = 2400, sh = Math.sin(t * 15) * 26 + Math.sin(t * 8.5) * 12;
  glow(c, x, y + h / 2, 2600, '255,210,140', .55);
  c.save(); rr(c, x - w / 2, y, w, h, w / 2); c.clip(); c.fillStyle = lg(c, 0, y, 0, y + h, [[0, '#fff0c0'], [1, '#ffc870']]); c.fillRect(x - w / 2, y, w, h);
  el(c, x + 250, y + 500, 160, 160); fs(c, '#ffe8b0'); glow(c, x + 250, y + 520, 500, '255,240,200', .6); // chandelier inside
  c.fillStyle = '#1a120c'; const by = y + 1500 + sh;
  c.beginPath(); c.moveTo(x - 470, y + h); c.quadraticCurveTo(x - 470, by + 150, x - 260, by + 60); c.lineTo(x + 260, by + 60); c.quadraticCurveTo(x + 470, by + 150, x + 470, y + h); c.fill();
  el(c, x, by - 140, 200, 230); c.fill(); P(c, [x - 34, by - 340, x, by - 560, x + 34, by - 340]); c.fill(); el(c, x, by - 330, 130, 40); c.fill();
  for (const s of [-1, 1]) { el(c, x + s * 330, by + 70 + sh * .4, 120, 44); c.fill(); for (let k = -2; k <= 2; k++) ln(c, [x + s * 330 + k * 30, by + 100, x + s * 330 + k * 32, by + 170], 10, '#1a120c'); }
  c.restore();
  rr(c, x - w / 2, y, w, h, w / 2); fs(c, null, 26, '#141a2c'); ln(c, [x, y + 200, x, y + h], 20, '#141a2c'); ln(c, [x - w / 2, y + 1100, x + w / 2, y + 1100], 20, '#141a2c');
  rr(c, x - w / 2 - 120, y + h, w + 240, 120, 10); fs(c, '#3a4466', 10);
}

// ================= M10: TODAY, SUNSET =================
function bronzeStatue(c, t, glint = 0) { // drawn into its own sprite then toned bronze
  drawOld(c, { x: 0, y: 0, k: .5, expr: { mouth: 'smirk', look: .2 }, arms: { l: { a: .25, b: .55 }, r: { a: .13, b: -.08 } } }, { outfit: 'uniform', cap: 1, cape: 1, sword: 1, capeWind: 0 });
}
