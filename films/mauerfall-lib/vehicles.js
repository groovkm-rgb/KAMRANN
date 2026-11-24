// VEHICLES 1989 at real proportions (1 m = 220 units), no logos or brand lettering.
// Drawn as light 3/4 volumes: near side profile + top / front surfaces extruded towards the far side (vector S),
// matching the oblique street ground. y = 0 is the road contact line of the NEAR wheels.
//   trabi(c, x, o)    small two-stroke car ~3,56 m x 1,44 m, round headlamps, flat bonnet, thin bumpers, small wheels
//   wartburg(c, x, o) longer square-cut sedan ~4,22 m x 1,50 m     lada(c, x, o) boxy sedan ~4,07 m x 1,44 m
//   westCar(c, x, o)  1980s angular western sedan ~4,5 m (black trim, wide plastic bumpers)
//   tram(c, x, o)     two-section articulated tram, 2 x ~9 m, 3,1 m high, cream / orange-red; o: dest, people, spark, wireY, lights
// common o: { col, roof, s: 1 faces right / -1, t, moving, idle, smoke, driver, dirt, rust, lights, wheelRot, y }
const TRABI_COLS = ['#d9cba6', '#a8bfcc', '#b3cdb6', '#e2ded0', '#c9b98e', '#8fa3b0'];
const CAR_S = [70, -98];
function vWheel(c, x, y, r, o = {}) {
  circle(c, x, y, r); fs(c, o.dark ? '#121111' : '#1d1c1c', 3);
  if (o.dark) return;
  c.strokeStyle = '#2e2c2b'; c.lineWidth = r * .16; circle(c, x, y, r * .78); c.stroke();
  circle(c, x, y, r * .58); fs(c, o.rim || '#5c5a56', 2);
  circle(c, x, y, r * .38); fs(c, o.cap || '#b9bcbf', 2);
  const a0 = o.rot || 0, n = o.nuts ?? 4; for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2; circle(c, x + Math.cos(a) * r * .22, y + Math.sin(a) * r * .22, r * .05); c.fillStyle = '#555'; c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.35)'; ell(c, x - r * .12, y - r * .15, r * .16, r * .09, -.6); c.fill();
  c.fillStyle = 'rgba(90,75,55,.3)'; c.beginPath(); c.arc(x, y, r, .35, Math.PI - .35); c.lineTo(x, y); c.fill();
}
function vShadow(c, x0, x1, S, a = .5) {
  for (let k = 3; k >= 0; k--) { const e = k * 24; c.fillStyle = `rgba(18,16,18,${a / 4})`; c.beginPath(); c.moveTo(x0 - e, 8 + e * .3); c.lineTo(x1 + e, 8 + e * .3); c.lineTo(x1 + S[0] + e, S[1] - e * .3); c.lineTo(x0 + S[0] - e, S[1] - e * .3); c.closePath(); c.fill(); }
  c.fillStyle = `rgba(10,8,10,${a * .8})`; c.beginPath(); c.moveTo(x0 + 20, 4); c.lineTo(x1 - 20, 4); c.lineTo(x1 - 20 + S[0] * .9, S[1] * .9); c.lineTo(x0 + 20 + S[0] * .9, S[1] * .9); c.closePath(); c.fill();
}
// extrude the top outline pts ([x, y, kind]) by S; kinds: 'g' glass, 'f' front face, 'r' rear face, default body
function ext3(c, pts, S, o) {
  const col = o.col, roofCol = o.roof || col;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, k] = pts[i], [x1, y1] = pts[i + 1], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L;
    if (nx * S[0] + ny * S[1] <= 0) continue;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x1 + S[0], y1 + S[1]); c.lineTo(x0 + S[0], y0 + S[1]); c.closePath();
    if (k === 'g') { const g = c.createLinearGradient(x0, y0 + S[1], x1, y1); g.addColorStop(0, '#c9d2d4'); g.addColorStop(1, '#58646a'); c.fillStyle = g; }
    else { const up = Math.max(0, -ny), side = Math.max(0, nx); const base = (k === 'roof' ? roofCol : col); c.fillStyle = up > .5 ? lt(base, .18 * up) : dk(base, .12 + .18 * side); }
    c.fill(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(30,25,25,.55)'; c.stroke();
    if (o.onFace) o.onFace(c, k, x0, y0, x1, y1);
  }
  // far silhouette
  c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x + S[0], y + S[1]) : c.moveTo(x + S[0], y + S[1])); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
}
function vGlass(c, path, o = {}) {
  path(); const g = c.createLinearGradient(0, -340, 0, -170); g.addColorStop(0, o.top || '#b4bec1'); g.addColorStop(1, o.bot || '#4a555b'); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip(); if (o.inside) o.inside(c);
  c.fillStyle = `rgba(255,255,255,${o.hi ?? .24})`; c.beginPath(); c.moveTo((o.hx ?? 0), -380); c.lineTo((o.hx ?? 0) + 50, -380); c.lineTo((o.hx ?? 0) - 70, -150); c.lineTo((o.hx ?? 0) - 120, -150); c.fill(); c.restore();
  path(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
}
function vDirt(c, path, x0, x1) { c.save(); path(); c.clip(); const g = c.createLinearGradient(0, -150, 0, -40); g.addColorStop(0, 'rgba(80,70,55,0)'); g.addColorStop(1, 'rgba(80,70,55,.45)'); c.fillStyle = g; c.fillRect(x0, -150, x1 - x0, 110); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(90,75,55,.35)'; circle(c, x0 + rnd(i * 3 + x0) * (x1 - x0), -55 - rnd(i * 7 + 1) * 60, 2 + rnd(i) * 5); c.fill(); } c.restore(); }
function vSeats(c, xs, top, col = '#6a5a4a') { for (const x of xs) { rrect(c, x - 22, top, 44, 110, 12); c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; for (let k = 0; k < 4; k++) c.fillRect(x - 18, top + 10 + k * 24, 36, 6); } }
function vDriver(c, x, y, hair) { circle(c, x, y, 50); c.fillStyle = '#f2efe9'; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.arc(x - 6, y - 12, 46, Math.PI * .95, Math.PI * 1.9); c.lineTo(x - 30, y - 10); c.closePath(); c.fillStyle = hair || '#4a3a30'; c.fill(); circle(c, x + 24, y + 2, 6); c.fillStyle = OUT; c.fill(); }
// ---------------- Trabant-type ----------------
function trabi(c, x, o = {}) {
  const col = o.col || TRABI_COLS[0], t = o.t || 0, S = o.S || CAR_S, bounce = o.moving ? Math.sin(t * 22) * 2.5 : (o.idle ? Math.sin(t * 40) * 1.2 : 0);
  c.save(); c.translate(x, o.y || 0); c.scale(o.s || 1, 1);
  vShadow(c, -380, 390, S);
  vWheel(c, 215 + S[0], -60 + S[1], 60, { dark: true }); vWheel(c, -229 + S[0], -60 + S[1], 60, { dark: true });
  if (o.smoke !== false && (o.moving || o.idle)) exhaust(c, -392, -52, t, { dir: -1, len: o.moving ? 360 : 170, size: o.moving ? 95 : 60, a: o.smokeA ?? .32 });
  c.save(); c.translate(0, bounce);
  const top = [[-391, -82, 'r'], [-395, -188, 'r'], [-386, -204], [-322, -212, 'g'], [-238, -302, 'g'], [-222, -314, 'roof'], [40, -316, 'roof'], [60, -306, 'g'], [148, -214], [350, -198], [386, -186, 'f'], [393, -98, 'f'], [380, -74]];
  ext3(c, top, S, { col, roof: o.roof, onFace: (c, k, x0, y0, x1, y1) => {
    if (k !== 'f' || y1 < -100) return;
    // front: bumper band + two round headlamps + small grille slots
    for (const tt of [.2, .78]) { const hx = 390 + S[0] * tt, hy = -150 + S[1] * tt; ell(c, hx, hy, 11, 22); fs(c, '#f4f0dc', 2.5); ell(c, hx - 2, hy - 4, 4, 8); c.fillStyle = '#fff'; c.fill(); if (o.lights) bloom(c, hx + 10, hy, 160, '255,240,200', .55); }
    line(c, [392, -96, 392 + S[0], -96 + S[1]], 9, '#c8cacb'); line(c, [392, -96, 392 + S[0], -96 + S[1]], 3, '#8a8c8e');
    for (let k2 = 0; k2 < 4; k2++) { const tt = .34 + k2 * .09; line(c, [391 + S[0] * tt, -128 + S[1] * tt, 391 + S[0] * (tt + .05), -128 + S[1] * (tt + .05)], 3, '#4a4a4a'); }
  } });
  // windscreen wipers on the glass band
  line(c, [150 + S[0] * .2, -216 + S[1] * .2, 108 + S[0] * .45, -262 + S[1] * .45], 3, '#1e1e1e'); line(c, [150 + S[0] * .65, -216 + S[1] * .65, 108 + S[0] * .9, -262 + S[1] * .9], 3, '#1e1e1e');
  const body = () => { c.beginPath(); c.moveTo(-391, -78); c.lineTo(-395, -188); c.quadraticCurveTo(-394, -202, -372, -205); c.lineTo(-322, -212); c.lineTo(-238, -302); c.quadraticCurveTo(-228, -314, -205, -315); c.lineTo(40, -316); c.quadraticCurveTo(56, -314, 64, -303); c.lineTo(148, -214); c.lineTo(350, -198); c.quadraticCurveTo(386, -194, 389, -172); c.lineTo(394, -98); c.quadraticCurveTo(392, -74, 368, -72); c.lineTo(290, -72); c.arc(215, -60, 80, -.15, Math.PI + .15, true); c.lineTo(-150, -72); c.arc(-229, -60, 80, -.15, Math.PI + .15, true); c.closePath(); };
  body(); c.fillStyle = col; c.fill();
  c.save(); body(); c.clip();
  let g = c.createLinearGradient(0, -320, 0, -60); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(.42, 'rgba(255,255,255,.06)'); g.addColorStop(.46, 'rgba(0,0,0,.08)'); g.addColorStop(1, 'rgba(0,0,0,.26)'); c.fillStyle = g; c.fillRect(-400, -320, 800, 260);
  if (o.roof) { c.fillStyle = o.roof; c.beginPath(); c.moveTo(-238, -302); c.quadraticCurveTo(-228, -314, -205, -315); c.lineTo(40, -316); c.quadraticCurveTo(56, -314, 64, -303); c.lineTo(80, -286); c.lineTo(-222, -286); c.closePath(); c.fill(); }
  // waist crease ("Sicke") along the flank, wheel-arch lips
  nLine(c, [-394, -152, 393, -146], 3, rgba(dk(col, .45), .75)); nLine(c, [-394, -147, 393, -141], 2, 'rgba(255,255,255,.45)');
  c.lineWidth = 5; c.strokeStyle = rgba(dk(col, .3), .7); c.beginPath(); c.arc(215, -60, 84, Math.PI + .2, -.2); c.stroke(); c.beginPath(); c.arc(-229, -60, 84, Math.PI + .2, -.2); c.stroke();
  // door, handle, mirror base, filler, sill
  line(c, [132, -210, 126, -76], 2.5, rgba(dk(col, .6), .9)); line(c, [-112, -210, -108, -76], 2.5, rgba(dk(col, .6), .9));
  rrect(c, -98, -178, 38, 9, 3); fs(c, '#c9cbcc', 1.5); circle(c, -64, -168, 4); c.fillStyle = '#333'; c.fill();
  nLine(c, [-150, -78, 140, -78], 6, rgba(dk(col, .5), .55));
  line(c, [148, -214, 350, -198], 2, rgba(dk(col, .35), .7));
  rrect(c, 304, -136, 30, 13, 3); fs(c, '#e8a040', 1.5);
  if (o.dirt !== false) vDirt(c, body, -400, 400);
  if (o.rust) for (let i = 0; i < 7; i++) { c.fillStyle = 'rgba(140,70,30,.6)'; ell(c, -360 + rnd(i * 5 + 2) * 720, -86 - rnd(i * 9) * 24, 5 + rnd(i) * 9, 3 + rnd(i + 1) * 3, 0); c.fill(); }
  c.restore(); body(); c.lineWidth = 3.5; c.strokeStyle = OUT; c.stroke();
  // side windows with interior (seats, wheel, optional driver)
  const inside = c => { vSeats(c, [-40, -175], -300, '#7a6a58'); c.strokeStyle = '#1e1a18'; c.lineWidth = 7; c.beginPath(); c.ellipse(70, -238, 9, 32, -.4, 0, Math.PI * 2); c.stroke(); c.fillStyle = '#2a2622'; c.fillRect(60, -230, 70, 20); if (o.driver) vDriver(c, -10, -268, o.driverHair); };
  vGlass(c, () => { c.beginPath(); c.moveTo(-106, -300); c.lineTo(36, -300); c.quadraticCurveTo(48, -299, 54, -291); c.lineTo(126, -212); c.lineTo(-106, -212); c.closePath(); }, { inside, hx: 30 });
  vGlass(c, () => { c.beginPath(); c.moveTo(-120, -300); c.lineTo(-202, -300); c.quadraticCurveTo(-216, -299, -224, -289); c.lineTo(-292, -212); c.lineTo(-120, -212); c.closePath(); }, { inside, hx: -150 });
  nLine(c, [-113, -302, -113, -210], 10, dk(col, .08)); nLine(c, [-300, -209, 130, -209], 3, '#d8dadb');
  // side mirror, rear lamp cluster, bumpers (thin chrome), exhaust
  line(c, [128, -214, 150, -236], 5, '#333'); ell(c, 158, -240, 14, 10); fs(c, '#c9cbcc', 2);
  rrect(c, -401, -180, 12, 40, 3); fs(c, '#c83a2e', 1.5); rrect(c, -401, -138, 12, 14, 3); fs(c, '#e8a040', 1.5);
  rrect(c, 356, -102, 46, 12, 4); fs(c, '#c8cacb', 2); rrect(c, -408, -104, 44, 12, 4); fs(c, '#c8cacb', 2);
  nLine(c, [-378, -58, -404, -58], 9, '#3a3a3a');
  c.restore();
  vWheel(c, 215, -60, 60, { rot: o.wheelRot || 0, cap: '#c9cbcd' }); vWheel(c, -229, -60, 60, { rot: o.wheelRot || 0, cap: '#c9cbcd' });
  c.restore();
}
// ---------------- generic boxy sedans ----------------
function boxSedan(c, x, o, D) {
  const col = o.col || D.col, t = o.t || 0, S = o.S || CAR_S, L = D.L / 2, wf = D.wf, wr = D.wr, r = D.r, roofY = -D.H;
  c.save(); c.translate(x, o.y || 0); c.scale(o.s || 1, 1);
  vShadow(c, -L + 10, L - 10, S);
  vWheel(c, wf + S[0], -r + S[1], r, { dark: true }); vWheel(c, wr + S[0], -r + S[1], r, { dark: true });
  if ((o.moving || o.idle) && D.smoke) exhaust(c, -L + 10, -50, t, { dir: -1, len: 260, size: 70, a: D.smoke });
  const top = [[-L, -82, 'r'], [-L - 4, -D.deck + 12, 'r'], [-L + 12, -D.deck], [D.rw0, -D.deck - 6, 'g'], [D.rw1, roofY + 6, 'roof'], [D.ws1, roofY, 'g'], [D.ws0, -D.hood - 6], [L - 12, -D.hood, 'f'], [L + 4, -D.hood + 14, 'f'], [L + 2, -84]];
  ext3(c, top, S, { col, roof: o.roof, onFace: (c, k, x0, y0, x1, y1) => {
    if (k !== 'f' || y1 > -D.hood + 20) return;
    const fy = -D.hood + 44, fx = L + 4;
    // grille across the front face, lamps at both ends
    c.beginPath(); c.moveTo(fx, fy - 20); c.lineTo(fx + S[0], fy - 20 + S[1]); c.lineTo(fx + S[0], fy + 20 + S[1]); c.lineTo(fx, fy + 20); c.closePath(); fs(c, D.grille, 2);
    for (let k2 = 1; k2 < 6; k2++) line(c, [fx + S[0] * k2 / 6, fy - 20 + S[1] * k2 / 6, fx + S[0] * k2 / 6, fy + 20 + S[1] * k2 / 6], 2, 'rgba(0,0,0,.35)');
    for (const tt of [.12, .88]) { const hx = fx + S[0] * tt, hy = fy + S[1] * tt; if (D.square) { c.beginPath(); c.rect(hx - 9, hy - 20, 18, 40); fs(c, '#f4f0dc', 2.5); } else { ell(c, hx, hy, 10, 21); fs(c, '#f4f0dc', 2.5); } if (o.lights) bloom(c, hx + 10, hy, 170, '255,240,200', .55); }
    line(c, [fx - 2, -100, fx - 2 + S[0], -100 + S[1]], 13, D.bumper);
  } });
  const body = () => { c.beginPath(); c.moveTo(-L, -82); c.lineTo(-L - 4, -D.deck + 12); c.lineTo(-L + 12, -D.deck); c.lineTo(D.rw0, -D.deck - 6); c.lineTo(D.rw1, roofY + 6); c.lineTo(D.ws1, roofY); c.lineTo(D.ws0, -D.hood - 6); c.lineTo(L - 12, -D.hood); c.lineTo(L + 4, -D.hood + 14); c.lineTo(L + 2, -84); c.quadraticCurveTo(L, -72, L - 20, -72); c.lineTo(wf + r + 22, -72); c.arc(wf, -r, r + 22, -.12, Math.PI + .12, true); c.lineTo(wr + r + 22, -72); c.arc(wr, -r, r + 22, -.12, Math.PI + .12, true); c.closePath(); };
  body(); c.fillStyle = col; c.fill(); c.save(); body(); c.clip();
  let g = c.createLinearGradient(0, roofY, 0, -60); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(.5, 'rgba(255,255,255,.05)'); g.addColorStop(.53, 'rgba(0,0,0,.08)'); g.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = g; c.fillRect(-L - 10, roofY - 10, 2 * L + 20, D.H);
  nLine(c, [-L, -D.crease, L, -D.crease], 3, rgba(dk(col, .45), .8)); nLine(c, [-L, -D.crease + 4, L, -D.crease + 4], 2, 'rgba(255,255,255,.35)');
  if (D.trim) nLine(c, [-L, -118, L, -118], 6, D.trim);
  for (const dx of D.doors) line(c, [dx, -D.deck - 4, dx + 4, -76], 2.5, rgba(dk(col, .6), .9));
  for (const hx of D.handles) { rrect(c, hx, -D.deck + 18, 34, 8, 3); fs(c, D.square ? '#2a2a2a' : '#c9cbcc', 1.5); }
  if (o.dirt !== false) vDirt(c, body, -L - 10, L + 10);
  if (o.rust) for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(140,70,30,.55)'; ell(c, -L + rnd(i * 5 + 3) * 2 * L, -88 - rnd(i * 9) * 20, 6 + rnd(i) * 8, 3, 0); c.fill(); }
  c.restore(); body(); c.lineWidth = 3.5; c.strokeStyle = OUT; c.stroke();
  const inside = c => { vSeats(c, [D.seat1, D.seat2], roofY + 26, '#5a4a3c'); if (o.driver) vDriver(c, D.seat1 + 50, roofY + 70, o.driverHair); };
  vGlass(c, () => { c.beginPath(); c.moveTo(D.rw1 + 14, roofY + 16); c.lineTo(D.ws1 - 6, roofY + 16); c.lineTo(D.ws0 - 18, -D.deck - 8); c.lineTo(D.rw0 + 26, -D.deck - 8); c.closePath(); }, { inside, hx: 0 });
  for (const px of D.pillars) nLine(c, [px, roofY + 10, px, -D.deck - 6], 12, D.square ? '#2a2a2a' : dk(col, .1));
  nLine(c, [D.rw0 + 10, -D.deck - 6, D.ws0 - 4, -D.deck - 6], 3, D.square ? '#2a2a2a' : '#d8dadb');
  line(c, [D.ws0 - 22, -D.deck - 10, D.ws0, -D.deck - 34], 5, '#333'); ell(c, D.ws0 + 8, -D.deck - 38, 16, 11); fs(c, D.square ? '#2a2a2a' : '#c9cbcc', 2);
  rrect(c, -L - 8, -D.deck + 14, 14, 40, 3); fs(c, '#c83a2e', 1.5);
  rrect(c, L - 40, -108, 62, 18, 4); fs(c, D.bumper, 2); rrect(c, -L - 22, -108, 62, 18, 4); fs(c, D.bumper, 2);
  vWheel(c, wf, -r, r, { rot: o.wheelRot || 0, cap: D.cap, nuts: D.nuts }); vWheel(c, wr, -r, r, { rot: o.wheelRot || 0, cap: D.cap, nuts: D.nuts });
  c.restore();
}
const WARTBURG_D = { L: 928, H: 330, r: 66, wf: 300, wr: -239, deck: 210, hood: 206, crease: 152, rw0: -312, rw1: -220, ws1: 120, ws0: 236, doors: [-40, 200], handles: [-22, 214], pillars: [-48], seat1: 50, seat2: -160, col: '#c4ad78', bumper: '#c8cacb', cap: '#b9bcbf', grille: '#9a9c9e', smoke: .26, trim: '#d8dadb' };
const LADA_D = { L: 895, H: 316, r: 64, wf: 285, wr: -247, deck: 198, hood: 194, crease: 138, rw0: -290, rw1: -205, ws1: 100, ws0: 222, doors: [-40, 190], handles: [-20, 206], pillars: [-50], seat1: 40, seat2: -160, col: '#a8402e', bumper: '#cfd1d2', cap: '#c9cbcd', grille: '#b8babc', smoke: .1, square: false };
const WEST_D = { L: 990, H: 300, r: 68, wf: 320, wr: -260, deck: 192, hood: 186, crease: 128, rw0: -330, rw1: -225, ws1: 105, ws0: 255, doors: [-40, 215], handles: [-20, 230], pillars: [-50], seat1: 50, seat2: -160, col: '#2f4f7a', bumper: '#222222', cap: '#9a9da0', grille: '#1e1e1e', smoke: 0, square: true, trim: '#1e1e1e', nuts: 5 };
function wartburg(c, x, o = {}) { boxSedan(c, x, o, WARTBURG_D); }
function lada(c, x, o = {}) { boxSedan(c, x, o, LADA_D); }
function westCar(c, x, o = {}) { boxSedan(c, x, o, WEST_D); }
// ---------------- tram ----------------
const TRAM_S = [118, -160];
function tramSection(c, x0, len, o, front, rear) {
  const H0 = -150, H1 = -700, col = '#ebe2c8', band = '#cf5a32', S = TRAM_S;
  // top outline: rear end (rounded) -> roof -> front end (rounded)
  const pts = [];
  if (rear) { pts.push([x0 + 30, H0, 'r'], [x0 - 18, H0 - 70, 'r'], [x0 - 34, -420, 'r'], [x0 - 26, H1 + 70, 'r'], [x0 + 10, H1 + 8], [x0 + 50, H1, 'roof']); } else pts.push([x0, H0, 'r'], [x0, H1, 'roof']);
  if (front) { pts.push([x0 + len - 50, H1, 'f'], [x0 + len - 10, H1 + 8, 'f'], [x0 + len + 26, H1 + 70, 'f'], [x0 + len + 34, -420, 'f'], [x0 + len + 18, H0 - 70, 'f'], [x0 + len - 30, H0]); } else pts.push([x0 + len, H1, 'f'], [x0 + len, H0]);
  ext3(c, pts, S, { col: '#e2d8bc', roof: '#bdb6a2', onFace: (c, k, a0, b0, a1, b1) => {
    if (k === 'f' && front && b0 < -400 && b1 >= -420 && a1 > x0 + len) { // front windscreen band + destination box on the front face
      const fx = x0 + len + 30;
      c.beginPath(); c.moveTo(fx - 4, -640); c.lineTo(fx - 4 + S[0], -640 + S[1]); c.lineTo(fx + 4 + S[0], -430 + S[1]); c.lineTo(fx + 4, -430); c.closePath(); const g = c.createLinearGradient(fx, -640 + S[1], fx + S[0], -430); g.addColorStop(0, '#c6d0d2'); g.addColorStop(1, '#4e5a60'); c.fillStyle = g; c.fill(); c.lineWidth = 2.5; c.strokeStyle = OUT; c.stroke();
    }
  } });
  if (front) { // destination box + headlamps on the front face (drawn upright, never mirrored)
    const fx = x0 + len + 22, dx = fx + S[0] * .5, dy = -672 + S[1] * .5;
    c.save(); c.translate(dx, dy); c.transform(1, S[1] / S[0] * .0, 0, 1, 0, 0); c.beginPath(); c.rect(-62, -18, 124, 36); fs(c, '#1f1f1f', 2); if (o.dest) { c.scale(o.s || 1, 1); signText(c, o.dest, 0, 1, 24, '#f2d27a'); } c.restore();
    for (const tt of [.15, .85]) { const hx = fx + 12 + S[0] * tt, hy = -260 + S[1] * tt; ell(c, hx, hy, 10, 18); fs(c, '#f4f0dc', 2); if (o.lights) bloom(c, hx, hy, 170, '255,240,200', .55); }
    line(c, [fx + 8, -190, fx + 8 + S[0], -190 + S[1]], 10, '#3a3a3a');
  }
  const body = () => { c.beginPath(); if (rear) { c.moveTo(x0 + 30, H0); c.quadraticCurveTo(x0 - 36, H0 - 30, x0 - 34, -420); c.quadraticCurveTo(x0 - 34, H1 + 30, x0 + 40, H1); } else { c.moveTo(x0, H0); c.lineTo(x0, H1); } if (front) { c.lineTo(x0 + len - 40, H1); c.quadraticCurveTo(x0 + len + 34, H1 + 30, x0 + len + 34, -420); c.quadraticCurveTo(x0 + len + 36, H0 - 30, x0 + len - 30, H0); } else { c.lineTo(x0 + len, H1); c.lineTo(x0 + len, H0); } c.closePath(); };
  body(); c.fillStyle = col; c.fill(); c.save(); body(); c.clip();
  c.fillStyle = band; c.fillRect(x0 - 50, -330, len + 100, 180); c.fillStyle = dk(band, .2); c.fillRect(x0 - 50, -170, len + 100, 20);
  c.fillStyle = band; c.fillRect(x0 - 50, H1, len + 100, 34);
  let g = c.createLinearGradient(0, H1, 0, H0); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = g; c.fillRect(x0 - 50, H1, len + 100, H0 - H1);
  grain(c, x0 - 50, H1, len + 100, H0 - H1, .3, 1.5); streaks(c, x0 - 40, H1 + 40, len + 80, 300, x0, { a: .1, n: 30 });
  const doorW = 230, doors = o.doors || [.12, .74];
  for (const dk_ of doors) { const dx = x0 + len * dk_; c.beginPath(); c.rect(dx, -662, doorW, 510); fs(c, '#d9cfb3', 2.5); for (const hx of [dx + 12, dx + doorW / 2 + 4]) { glassPane(c, hx, -646, doorW / 2 - 16, 230, { sky: ['#a9b4b8', '#4a555a'], hi: .2 }); c.beginPath(); c.rect(hx, -646, doorW / 2 - 16, 230); fs(c, null, 2.5); c.beginPath(); c.rect(hx, -400, doorW / 2 - 16, 230); fs(c, '#d0c6aa', 2); } c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(dx, -662, doorW, 10); }
  let wx = x0 + (rear ? 70 : 34); const wy = -646, wh = 280;
  while (wx < x0 + len - (front ? 170 : 60)) {
    const inDoor = doors.some(d => wx + 220 > x0 + len * d - 16 && wx < x0 + len * d + doorW + 16);
    if (!inDoor) { glassPane(c, wx, wy, 206, wh, { sky: ['#aab4b6', '#475257'], hi: .18 }); if (o.people) { const pk = rnd(wx * .01); if (pk > .35) { const px = wx + 100 + (pk - .5) * 80; c.save(); c.beginPath(); c.rect(wx, wy, 206, wh); c.clip(); c.fillStyle = ['#6a5a7a', '#5a5a4e', '#3a5a7a', '#7a6a50'][Math.floor(pk * 4)]; c.fillRect(px - 50, wy + 190, 100, 120); circle(c, px, wy + 150, 52); c.fillStyle = '#efece6'; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.arc(px - 4, wy + 138, 48, Math.PI * .95, Math.PI * 1.95); c.closePath(); c.fillStyle = FOLK_HAIR[Math.floor(pk * 8)]; c.fill(); circle(c, px + (pk > .6 ? 18 : -18), wy + 156, 5); c.fillStyle = OUT; c.fill(); c.restore(); } } c.beginPath(); c.rect(wx, wy, 206, wh); fs(c, null, 3); nLine(c, [wx, wy + 64, wx + 206, wy + 64], 5, '#cfc6ad'); }
    wx += 236;
  }
  if (front) { c.beginPath(); c.moveTo(x0 + len - 150, -650); c.lineTo(x0 + len - 20, -650); c.quadraticCurveTo(x0 + len + 28, -600, x0 + len + 30, -430); c.lineTo(x0 + len - 150, -430); c.closePath(); c.fillStyle = '#56636a'; c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); if (o.driver !== false) vDriver(c, x0 + len - 80, -520, '#3a2c24'); }
  c.restore(); body(); c.lineWidth = 3.5; c.strokeStyle = OUT; c.stroke();
  // skirts over the bogies, small wheels peeking below
  for (const bx of [x0 + len * .2, x0 + len * .8]) { for (const wx2 of [bx - 80, bx + 80]) vWheel(c, wx2, -52, 52, { rim: '#3a3836', cap: '#6a6764', nuts: 0, rot: o.wheelRot || 0 }); c.beginPath(); c.rect(bx - 170, -150, 340, 74); fs(c, '#3a3633', 2.5); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(bx - 170, -150, 340, 8); }
  // roof equipment boxes on the top band
  for (const rx of [x0 + len * .3, x0 + len * .55]) { const by = H1 + S[1] * .5, bx2 = rx + S[0] * .5; c.beginPath(); c.moveTo(bx2 - 120, by); c.lineTo(bx2 + 120, by); c.lineTo(bx2 + 120 + S[0] * .25, by + S[1] * .25 - 40); c.lineTo(bx2 - 120 + S[0] * .25, by + S[1] * .25 - 40); c.closePath(); fs(c, '#8f8a7c', 2); c.beginPath(); c.rect(bx2 - 120, by - 40, 240, 40); fs(c, '#a39e8e', 2); }
}
function tram(c, x, o = {}) {
  const t = o.t || 0, L1 = 1960, gap = 110, S = TRAM_S;
  c.save(); c.translate(x, o.y || 0); c.scale(o.s || 1, 1);
  vShadow(c, -L1 - gap / 2, L1 + gap / 2, S, .4);
  for (const bx of [-L1 * .8, -L1 * .2, L1 * .2, L1 * .8]) for (const d of [-80, 80]) vWheel(c, bx + d + S[0], -52 + S[1], 52, { dark: true });
  tramSection(c, -L1 - gap / 2, L1, o, false, true);
  // articulation bellows (with its own top)
  c.beginPath(); c.moveTo(-gap / 2, -690); c.lineTo(gap / 2, -690); c.lineTo(gap / 2 + S[0], -690 + S[1]); c.lineTo(-gap / 2 + S[0], -690 + S[1]); c.closePath(); fs(c, '#2e2a28', 2);
  c.beginPath(); c.rect(-gap / 2 - 6, -690, gap + 12, 540); fs(c, '#3a3633', 2.5); for (let y = -680; y < -160; y += 24) nLine(c, [-gap / 2 - 2, y, gap / 2 + 2, y], 4, '#5a5450');
  tramSection(c, gap / 2, L1, o, true, false);
  // pantograph (diamond) on the front section, up to the contact wire
  const px = gap / 2 + L1 * .42 + S[0] * .5, base = -700 + S[1] * .5, wy = o.wireY ?? -1290;
  c.beginPath(); c.rect(px - 70, base - 26, 140, 26); fs(c, '#3a3a3a', 2);
  const mid = (base + wy) / 2; line(c, [px - 60, base - 26, px - 20, mid, px - 60, wy + 14], 5, '#262626'); line(c, [px + 60, base - 26, px + 20, mid, px + 60, wy + 14], 5, '#262626'); line(c, [px - 20, mid, px + 20, mid], 4, '#262626');
  line(c, [px - 100, wy + 14, px + 100, wy + 14], 8, '#262626');
  if (o.spark) { const fl = rnd(Math.floor(t * 24)); if (fl > .55) { bloom(c, px, wy + 10, 140, '170,200,255', .9); for (let i = 0; i < 6; i++) line(c, [px, wy + 10, px + (rnd(i + t) - .5) * 100, wy + 10 + rnd(i + 2 + t) * 80], 3, '#e8f2ff'); } }
  c.restore();
}
// overhead contact wire with span wires running back to wall rosettes (layer-1 world space)
function tramWire(c, x0, x1, wy, o = {}) {
  line(c, [x0, wy, x1, wy], 4, '#26262a'); line(c, [x0, wy - 46, x1, wy - 46], 2, 'rgba(30,30,36,.7)');
  for (let x = Math.ceil(x0 / 800) * 800; x < x1; x += 800) line(c, [x, wy - 46, x, wy], 2, '#26262a');
  for (let x = Math.ceil(x0 / 3200) * 3200 + 400; x < x1; x += 3200) { line(c, [x, wy - 46, x - 60, (o.rosetteY ?? -1900)], 3, '#2a2a2e'); circle(c, x - 60, o.rosetteY ?? -1900, 16); fs(c, '#5a5a5a', 2); }
}
