// DETAILED FOREST set (needs light.js). No blur: depth comes from parallax, haze and value, not from blurring.
//   forest(c, cam, t, { tod: 'day' | 'dusk' | 'night', cave: false, caveX: 900, path: true, seed, backdrop: snowyMountains, mid: (c, base, t) => {} })
//   stoneAgeForest = forest with a cave and night by default; forestSet = sunny forest
//   forestFrame(c, cam, t, o)  foreground leaves/ferns framing the shot (put it in `screen`)
//   forestLight(c, cam, t, o)  sun/moon shafts + motes/fireflies + grade over everything (put it in `screen`, after forestFrame)
const FOREST = {
  day:   { sky: ['#7cc4ec', '#cfeaf2'], sun: [-1500, -3300], far: '#9cc4b4', far2: '#7fb09a', mid: '#4f8f55', midDark: '#3d7444', leaf: '#5ea84e', leafDark: '#3f7f3c', leafLight: '#9ad06a', trunk: '#7a5236', trunkDark: '#553824', ground: '#78b04a', groundDark: '#5a8f38', path: '#c9a674', rock: '#a29ea6', moss: '#6f9f3e', ray: '255,240,190', rayA: .26, fog: '205,228,240' },
  dusk:  { sky: ['#e9875a', '#f8cf8a'], sun: [-1300, -1500], far: '#b58a86', far2: '#9a7480', mid: '#5a6a48', midDark: '#46553a', leaf: '#6d8a45', leafDark: '#4b6634', leafLight: '#c2b65a', trunk: '#6a4630', trunkDark: '#4a2f20', ground: '#6f8a3e', groundDark: '#55702e', path: '#c09468', rock: '#9a8a8a', moss: '#6f8a3e', ray: '255,200,140', rayA: .3, fog: '250,190,150' },
  night: { sky: ['#0f1a33', '#2a3d66'], sun: [900, -3200], far: '#22384a', far2: '#1d3040', mid: '#21402f', midDark: '#183226', leaf: '#28503a', leafDark: '#1b3a29', leafLight: '#3f6e52', trunk: '#3e2c22', trunkDark: '#2a1e17', ground: '#2c4a2c', groundDark: '#213a22', path: '#5e5444', rock: '#5f5c68', moss: '#365a32', ray: '190,210,255', rayA: .16, fog: '40,60,100' },
};
function fCanopy(c, cx, cy, R, P, seed, sun = -1, lw = 7) {
  const bl = [];
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + rnd(seed + i) * .5, d = R * (.45 + rnd(seed + i + 20) * .25); bl.push([cx + Math.cos(a) * d * 1.15, cy + Math.sin(a) * d * .8, R * (.42 + rnd(seed + i + 40) * .18)]); }
  bl.push([cx, cy, R * .62]);
  const path = () => { c.beginPath(); for (const b of bl) { c.moveTo(b[0] + b[2], b[1]); c.arc(b[0], b[1], b[2], 0, Math.PI * 2); } };
  c.save(); c.lineJoin = 'round'; path(); if (lw > 0) { c.lineWidth = lw * 2; c.strokeStyle = OUT; c.stroke(); } c.fillStyle = P.leaf; c.fill();
  c.clip();
  // shadow side (away from the sun) and underside
  c.fillStyle = P.leafDark; c.beginPath(); c.ellipse(cx - sun * R * .45, cy + R * .45, R * 1.1, R * .75, 0, 0, Math.PI * 2); c.fill();
  // sunlit clumps
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + sun * .7 + (rnd(seed + i + 60) - .5) * 1.6, d = R * (.35 + rnd(seed + i + 70) * .35); c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, R * (.18 + rnd(seed + i + 80) * .12), 0, Math.PI * 2); c.fillStyle = P.leafLight; c.fill(); }
  // leaf texture
  c.lineWidth = 4; c.lineCap = 'round';
  c.lineWidth = Math.max(1.5, R * .012); const lk = Math.max(3, R * .03); for (let i = 0; i < 18; i++) { const x = cx + (rnd(seed + i + 100) - .5) * R * 2, y = cy + (rnd(seed + i + 130) - .5) * R * 1.5; c.strokeStyle = rnd(seed + i + 160) > .5 ? shade(P.leafDark, -.1) : P.leafLight; c.beginPath(); c.arc(x, y, lk, .2, Math.PI - .2); c.stroke(); }
  c.restore();
}
function fTree(c, x, base, h, P, seed, o = {}) {
  const w = o.w || h * .07, sun = o.sun ?? -1, lw = o.lw ?? 4;
  // trunk with root flare
  c.beginPath(); c.moveTo(x - w * 1.9, base); c.quadraticCurveTo(x - w * .7, base - w * .6, x - w * .55, base - h * .3); c.lineTo(x - w * .38, base - h * .92);
  c.lineTo(x + w * .38, base - h * .92); c.lineTo(x + w * .55, base - h * .3); c.quadraticCurveTo(x + w * .7, base - w * .6, x + w * 1.9, base); c.closePath(); fs(c, P.trunk, lw);
  c.save(); c.clip();
  c.fillStyle = P.trunkDark; c.fillRect(x - sun * w * .1, base - h, w * 2, h); // shadow half
  for (let i = 0; i < 7; i++) { const bx = x - w * .6 + rnd(seed + i) * w * 1.2; c.beginPath(); c.moveTo(bx, base - 10); c.bezierCurveTo(bx + 10, base - h * .3, bx - 12, base - h * .55, bx + 4, base - h * (.6 + rnd(seed + i + 9) * .3)); c.lineWidth = 4; c.strokeStyle = shade(P.trunkDark, -.25); c.stroke(); }
  c.fillStyle = shade(P.trunk, .18); c.fillRect(x + sun * w * .55 - 6, base - h, 10, h);
  c.restore();
  if (rnd(seed + 3) > .4) { ell(c, x + w * .1, base - h * .45, w * .18, w * .26); fs(c, '#2a1c14', 5); }
  // branches
  for (const s of [-1, 1]) { const by = base - h * (.62 + rnd(seed + s + 5) * .15); line(c, [x, by, x + s * h * .2, by - h * .16], w * .32 + 14); line(c, [x, by, x + s * h * .2, by - h * .16], w * .32, P.trunk); }
  fCanopy(c, x, base - h * .98, h * .42, P, seed, sun, lw);
  for (const s of [-1, 1]) fCanopy(c, x + s * h * .24, base - h * .78, h * .22, P, seed + 50 + s, sun, lw);
}
function fPine(c, x, base, h, P, seed, o = {}) {
  const lw = o.lw ?? 4, w = h * .3;
  line(c, [x, base, x, base - h * .2], 30 + lw * 2); line(c, [x, base, x, base - h * .2], 30, P.trunk);
  for (let i = 0; i < 4; i++) {
    const y0 = base - h * (.15 + i * .2), ww = w * (1 - i * .2);
    c.beginPath(); c.moveTo(x, y0 - h * .38); c.lineTo(x + ww, y0); for (let k = 4; k >= -4; k--) c.lineTo(x + ww * k / 4, y0 + (k % 2 ? 14 : 0)); c.lineTo(x - ww, y0); c.closePath(); fs(c, P.mid, lw);
    c.save(); c.clip(); c.fillStyle = P.midDark; c.fillRect(x, y0 - h * .4, ww, h * .45); c.restore();
  }
}
function fBush(c, x, y, r, P, seed, berries, lw = 3) {
  const bl = []; for (let i = 0; i < 6; i++) bl.push([x + (i - 2.5) * r * .42, y - r * (.45 + rnd(seed + i) * .4), r * (.42 + rnd(seed + i + 9) * .2), i % 2 ? P.leaf : shade(P.leaf, -.08)]);
  blobs(c, bl, lw);
  for (let i = 0; i < 5; i++) { circle(c, x + (rnd(seed + i + 30) - .5) * r * 2, y - r * (.3 + rnd(seed + i + 40) * .5), r * .13); c.fillStyle = P.leafLight; c.fill(); }
  if (berries) for (let i = 0; i < 9; i++) { circle(c, x + (rnd(seed + i + 50) - .5) * r * 2, y - r * (.2 + rnd(seed + i + 60) * .6), r * .09); fs(c, '#c8323a', 2); }
}
function fFlower(c, x, y, col, s = 1) {
  line(c, [x, y, x + 4 * s, y - 50 * s], 5, '#3f7a3c');
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; circle(c, x + 4 * s + Math.cos(a) * 11 * s, y - 50 * s + Math.sin(a) * 11 * s, 9 * s); fs(c, col, 3); }
  circle(c, x + 4 * s, y - 50 * s, 7 * s); fs(c, '#f6c84a', 3);
}
function fMushroom(c, x, y, s = 1) {
  c.beginPath(); c.rect(x - 9 * s, y - 34 * s, 18 * s, 34 * s); fs(c, '#efe6d2', 4);
  c.beginPath(); c.ellipse(x, y - 34 * s, 30 * s, 22 * s, 0, Math.PI, 0); c.closePath(); fs(c, '#d8452f', 5);
  for (const [dx, dy] of [[-12, -44], [6, -50], [16, -40]]) { circle(c, x + dx * s, y + dy * s, 4 * s); c.fillStyle = '#fff'; c.fill(); }
}
function fGrass(c, x, y, s, col, col2) {
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 6 * s, y); c.quadraticCurveTo(x + k * 9 * s, y - 25 * s, x + k * 16 * s + 4, y - (40 + Math.abs(k) * -4 + 12) * s); c.lineWidth = 5 * s; c.strokeStyle = k % 2 ? col : col2; c.lineCap = 'round'; c.stroke(); }
}
function fLog(c, x, y, len, P) {
  rrect(c, x - len / 2, y - 90, len, 90, 45); fs(c, P.trunk, 7);
  c.save(); rrect(c, x - len / 2, y - 90, len, 90, 45); c.clip(); c.fillStyle = P.trunkDark; c.fillRect(x - len / 2, y - 40, len, 50);
  c.fillStyle = P.moss; for (let i = 0; i < 8; i++) { c.beginPath(); c.ellipse(x - len / 2 + 40 + i * (len - 80) / 7, y - 88, 40, 16, 0, 0, Math.PI * 2); c.fill(); } c.restore();
  ell(c, x + len / 2 - 30, y - 45, 28, 42); fs(c, '#d9b07a', 6); ell(c, x + len / 2 - 30, y - 45, 14, 22); fs(c, null, 3, '#a87a48');
  fMushroom(c, x - len * .2, y - 80, .8); fMushroom(c, x - len * .2 + 40, y - 80, .6);
}
function fMossRock(c, x, y, r, P, seed) {
  c.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI, rr = r * (.82 + rnd(seed + i) * .25); const px = x + Math.cos(a) * rr * 1.25, py = y + Math.sin(a) * rr * .9; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); fs(c, P.rock, 7);
  c.save(); c.clip(); c.fillStyle = shade(P.rock, -.2); c.fillRect(x, y - r, r * 1.4, r); c.fillStyle = P.moss; c.beginPath(); c.ellipse(x - r * .3, y - r * .85, r * .9, r * .3, -.1, 0, Math.PI * 2); c.fill(); c.restore();
  line(c, [x - r * .5, y - r * .45, x - r * .1, y - r * .62], 5, shade(P.rock, .25));
}
function forest(c, cam, t, o = {}) {
  // Designed for cam.z ≈ 0.9-1.3 and Noah at k ≈ .25 (≈ 380 units ≈ 1.75 m). Horizon (ground start) at world y HZ.
  const tod = o.tod || 'day', P = FOREST[tod], S = o.seed || 0, HZ = o.horizon ?? -200;
  const B = p => layerBase(cam, HZ, p);                       // base line of a parallax layer that meets the horizon
  c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.sky[0]); g.addColorStop(.75, P.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .03, c => {
    const b = B(.03), sx = o.sunX ?? (tod === 'night' ? 500 : -600), sy = b - (tod === 'dusk' ? 260 : 700);
    if (tod === 'night') { for (let i = 0; i < 160; i++) { circle(c, -2400 + rnd(i) * 4800, b - 1400 + rnd(i + 40) * 1150, 1.5 + rnd(i + 80) * 2.5); c.fillStyle = `rgba(250,248,225,${.5 + .5 * Math.sin(t * 2 + i)})`; c.fill(); } bloom(c, sx, sy, 380, '200,215,255', .4); circle(c, sx, sy, 60); fs(c, '#f4efd2', 3); circle(c, sx - 18, sy - 14, 14); fs(c, '#ddd6b6'); circle(c, sx + 20, sy + 16, 9); fs(c, '#ddd6b6'); }
    else { bloom(c, sx, sy, 900, tod === 'dusk' ? '255,170,100' : '255,245,200', .85); circle(c, sx, sy, 80); c.fillStyle = tod === 'dusk' ? '#ffd28a' : '#fff6cf'; c.fill();
      for (let i = 0; i < 7; i++) { const x = -2400 + i * 750 + rnd(i + 300) * 250, y = b - 1100 + rnd(i + 310) * 450; c.fillStyle = tod === 'dusk' ? 'rgba(255,205,180,.9)' : 'rgba(255,255,255,.9)'; for (const [dx, dy, r] of [[0, 0, 55], [60, -22, 72], [130, 0, 52], [66, 20, 60]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, Math.PI * 2); c.fill(); } } }
    LIGHT.sun = [sx, sy];
  });
  if (o.backdrop) o.backdrop(c, cam, t, B, tod);   // e.g. snowy mountains (mountains.js) between sky and far hills
  layer(c, cam, .12, c => { const b = B(.12); c.fillStyle = P.far; c.beginPath(); c.moveTo(-4000, b + 10); for (let x = -4000; x <= 4000; x += 120) c.lineTo(x, b - 170 - Math.sin(x * .0023 + S) * 120 - rnd(x / 120 + 1000) * 40); c.lineTo(4000, b + 10); c.closePath(); c.fill(); });
  haze(c, P.fog, .28);
  layer(c, cam, .25, c => {
    const b = B(.25); c.fillStyle = P.far2;
    for (let i = 0; i < 70; i++) { const x = -4000 + i * 115 + rnd(i + S) * 50, h = 220 + rnd(i + 60 + S) * 220; if (i % 2) { c.beginPath(); c.moveTo(x, b - h); c.lineTo(x + 55, b); c.lineTo(x - 55, b); c.closePath(); c.fill(); } else { c.beginPath(); c.arc(x, b - h * .6, h * .32, 0, Math.PI * 2); c.fill(); c.fillRect(x - 6, b - h * .4, 12, h * .4); } }
    c.fillRect(-4000, b - 50, 8000, 60);
  });
  haze(c, P.fog, .24);
  layer(c, cam, .45, c => {
    const b = B(.45) + 10, mp = { ...P, leaf: P.mid, leafDark: P.midDark, leafLight: shade(P.mid, .18), trunk: shade(P.trunk, -.1) };
    mist(c, b - 30, P.fog, .45, 120);
    for (let i = 0; i < 26; i++) { const x = -3600 + i * 290 + rnd(i + 200 + S) * 120, h = (520 + rnd(i + 230 + S) * 420) * (o.midScale ?? (o.backdrop ? .5 : 1)); (i % 3 === 1 ? fPine : fTree)(c, x, b, h, mp, i * 13 + S, { lw: 0, w: h * .05 }); }
    for (let i = 0; i < 40; i++) fBush(c, -3600 + i * 185, b + 8, 60 + rnd(i + 260) * 30, mp, i * 7, false, 0);
  });
  haze(c, P.fog, .12);
  if (o.cave) layer(c, cam, .62, c => {
    const cx = o.caveX ?? 500, base = B(.62) + 20;
    c.beginPath(); c.moveTo(cx - 80, base); c.bezierCurveTo(cx - 70, base - 420, cx + 100, base - 700, cx + 330, base - 760); c.lineTo(cx + 2600, base - 820); c.lineTo(cx + 2600, base); c.closePath(); fs(c, P.rock, 3);
    c.save(); c.clip();
    for (let i = 0; i < 24; i++) { const rx = cx - 60 + (i % 8) * 180 + rnd(i + 400) * 60, ry = base - 90 - Math.floor(i / 8) * 230 - rnd(i + 410) * 50; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + 130, ry - 30); c.lineTo(rx + 165, ry + 60); c.lineTo(rx + 30, ry + 85); c.closePath(); c.fillStyle = shade(P.rock, (i % 3 - 1) * .09); c.fill(); c.lineWidth = 2; c.strokeStyle = shade(P.rock, -.35); c.stroke(); }
    const sg = c.createLinearGradient(cx, 0, cx + 900, 0); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(20,20,50,.35)'); c.fillStyle = sg; c.fillRect(cx - 100, base - 900, 2800, 900);
    c.restore();
    c.beginPath(); c.moveTo(cx + 90, base); c.bezierCurveTo(cx + 85, base - 300, cx + 190, base - 380, cx + 270, base - 380); c.bezierCurveTo(cx + 370, base - 380, cx + 440, base - 280, cx + 440, base); c.closePath(); fs(c, '#140f14', 4);
    c.save(); c.clip(); const gg = c.createRadialGradient(cx + 260, base, 20, cx + 260, base, 330); gg.addColorStop(0, tod === 'night' ? 'rgba(255,140,60,.45)' : 'rgba(90,70,70,.6)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(cx, base - 420, 520, 420); c.restore();
    for (let i = 0; i < 8; i++) { const vx = cx + 130 + i * 40; c.beginPath(); c.moveTo(vx, base - 365 + Math.abs(i - 3.5) * 14); c.quadraticCurveTo(vx + 10, base - 290, vx - 5, base - 220 - rnd(i + 420) * 70); c.lineWidth = 6; c.strokeStyle = shade(P.leafDark, -.2); c.stroke(); c.lineWidth = 3; c.strokeStyle = P.leaf; c.stroke(); }
    for (let i = 0; i < 6; i++) fBush(c, cx - 120 + i * 120, base + 6, 45 + rnd(i + 430) * 20, P, i * 3 + 40, false, 2);
  });
  if (o.mid) layer(c, cam, .62, c => o.mid(c, B(.62) + 20, t));   // e.g. a distant animal walking between the tree rows
  layer(c, cam, .75, c => {
    const b = B(.75) + 30, xs = o.treesX || [-1300, -820, 760, 1350];
    xs.forEach((x, i) => fTree(c, x, b, 1700 + rnd(i + 500 + S) * 400, P, i * 31 + 7 + S, { w: 62, lw: 3 }));
    if (tod !== 'night') sunRays(c, (LIGHT.sun ? LIGHT.sun[0] : -600) * .5 + 100, b - 1500, { n: 10, len: 2600, spread: .7, dir: Math.PI / 2 + .35, color: P.ray, alpha: P.rayA, t });
    for (let i = 0; i < 18; i++) fBush(c, -2400 + i * 280 + rnd(i + 540) * 100, b + 10, 55 + rnd(i + 560) * 35, P, i * 9 + 3, i % 4 === 0, 3);
  });
  layer(c, cam, 1, c => {
    const gg = c.createLinearGradient(0, HZ, 0, HZ + 1200); gg.addColorStop(0, P.groundDark); gg.addColorStop(.2, P.ground); gg.addColorStop(1, shade(P.groundDark, -.1));
    c.fillStyle = gg; c.fillRect(-6000, HZ, 12000, 3000);
    for (let i = 0; i < 60; i++) { const k = rnd(i + 640); ell(c, -3000 + rnd(i + 645) * 6000, HZ + 20 + k * 700, 60 + k * 120, 8 + k * 16); c.fillStyle = shade(P.ground, rnd(i + 646) > .5 ? .07 : -.07); c.fill(); }
    if (o.path !== false) { c.beginPath(); c.moveTo(-30, HZ + 2); c.quadraticCurveTo(-120, HZ + 300, -420, HZ + 1100); c.lineTo(420, HZ + 1100); c.quadraticCurveTo(110, HZ + 300, 60, HZ + 2); c.closePath(); c.fillStyle = P.path; c.fill(); c.lineWidth = 3; c.strokeStyle = shade(P.path, -.3); c.stroke();
      for (let i = 0; i < 40; i++) { const k = rnd(i + 600), y = HZ + 20 + k * k * 900, x = (rnd(i + 610) - .5) * (60 + k * 700); ell(c, x, y, 4 + k * 9, 2.5 + k * 4); c.fillStyle = shade(P.path, -.2); c.fill(); } }
    const onPath = (x, k) => o.path !== false && Math.abs(x) < 70 + k * 420;
    for (let i = 0; i < 40; i++) { const k = rnd(i + 620); ell(c, -3000 + rnd(i + 625) * 6000, HZ + 40 + k * 800, 80 + k * 200, 14 + k * 30); c.fillStyle = shade(P.leaf, -.12); c.fill(); }
    for (let i = 0; i < 520; i++) { const k = rnd(i + 650), x = -3000 + rnd(i + 660) * 6000, y = HZ + 10 + k * k * 950; if (onPath(x, k)) continue; fGrass(c, x, y, .3 + k * k * 1.1, rnd(i + 661) > .5 ? P.leaf : shade(P.leaf, -.15), P.leafLight); }
    for (let j = 0; j < 9; j++) { const cx2 = -2600 + j * 640 + rnd(j + 690) * 200, k0 = rnd(j + 695); if (onPath(cx2, k0)) continue; for (let i = 0; i < 9; i++) { const k = k0 + (rnd(j * 20 + i + 696) - .5) * .12; fFlower(c, cx2 + (rnd(j * 20 + i + 697) - .5) * 160, HZ + 40 + k * k * 900, ['#f2f0e8', '#f2c531', '#e98aa6', '#9b7fd6'][j % 4], .3 + k * .6); } }
    const fl = ['#f2f0e8', '#f2c531', '#e98aa6', '#9b7fd6', '#f08a4a'];
    for (let i = 0; i < 70; i++) { const k = rnd(i + 700), x = -2800 + rnd(i + 710) * 5600, y = HZ + 30 + k * 850; if (onPath(x, k)) continue; fFlower(c, x, y, fl[i % 5], .35 + k * .45); }
    for (let i = 0; i < 9; i++) { const x = -2200 + i * 540 + rnd(i + 730) * 160, k = rnd(i + 740); if (onPath(x, k)) continue; fMossRock(c, x, HZ + 60 + k * 600, 22 + k * 30, P, i); }
    for (let i = 0; i < 8; i++) { const x = -2400 + i * 640 + rnd(i + 760) * 200, k = rnd(i + 770); if (onPath(x, k)) continue; fern(c, x, HZ + 50 + k * 500, .5 + k * .5, i * 5, P.leaf); }
    if (o.log !== false) { c.save(); c.translate(o.logX ?? -800, HZ + 260); c.scale(.55, .55); fLog(c, 0, 0, 600, P); c.restore(); }
    for (let i = 0; i < 6; i++) fMushroom(c, 640 + i * 38 + rnd(i) * 20, HZ + 220 + rnd(i + 5) * 40, .35 + rnd(i + 9) * .2);
    if (tod !== 'night') dappled(c, -1800, 1800, HZ + 300, t, { n: 34, depth: 520, alpha: P.rayA * .85 });
  });
  return { base: P.groundDark, tint: null };
}
function stoneAgeForest(c, cam, t, o = {}) { return forest(c, cam, t, Object.assign({ tod: 'night', cave: true }, o)); }
function forestSet(c, cam, t, o = {}) { return forest(c, cam, t, Object.assign({ tod: 'day' }, o)); }
function forestFrame(c, cam, t, o = {}) {
  const P = FOREST[o.tod || 'day'];
  layer(c, cam, 1.25, c => {
    const cx = cam.x * 1.25, cy = cam.y * 1.25, z = 1 + (cam.z - 1) * 1.25, hw = W / 2 / z, hh = H / 2 / z;
    const dark = { ...P, leaf: shade(P.leafDark, -.25), leafDark: shade(P.leafDark, -.45), leafLight: shade(P.leaf, -.15) };
    fCanopy(c, cx - hw - 40, cy - hh - 40, 300, dark, 901, -1, 3);
    fCanopy(c, cx + hw + 90, cy - hh - 80, 260, dark, 933, -1, 3);
    for (let i = 0; i < 5; i++) { const x = cx - hw + 60 + i * 45, y = cy - hh + 170 + i * 18; c.beginPath(); c.moveTo(x, cy - hh - 20); c.quadraticCurveTo(x + 20, y - 60, x + Math.sin(t + i) * 6, y); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 4; c.strokeStyle = dark.leaf; c.stroke(); circle(c, x, y, 10); fs(c, dark.leaf, 3); }
    fern(c, cx + hw - 80, cy + hh + 30, 1.9, 77, dark.leaf); fern(c, cx - hw + 40, cy + hh + 40, 1.6, 88, dark.leaf);
  });
}
function forestLight(c, cam, t, o = {}) {
  const tod = o.tod || 'day', P = FOREST[tod];
  layer(c, cam, 1, c => {
    if (tod === 'night') { sunRays(c, cam.x + 700, cam.y - 900, { n: 6, len: 2400, spread: .4, dir: Math.PI / 2 - .3, color: P.ray, alpha: .13, t }); fireflies(c, cam.x - 1000, cam.x + 1000, cam.y - 400, cam.y + 400, t, 26); }
    else motes(c, cam.x - 1000, cam.x + 1000, cam.y - 550, cam.y + 500, t, { n: 50 });
  });
  grade(c, tod === 'night' ? { sx: .85, sy: 0, warm: '150,170,255', warmA: .2, cool: '10,10,40', coolA: .35 } : tod === 'dusk' ? { sx: .05, sy: .1, warm: '255,150,80', warmA: .4, coolA: .3 } : { sx: .1, sy: 0, warmA: .3, coolA: .18 });
}
