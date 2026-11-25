// KARTELL film places (needs toon.js engine + noah-character light.js). Scale 1 m ≈ 220 world units, floor at y = 0.
//   villaSet(c, cam, t, o)  sunny noon: white cubic villa, infinity pool, teak terrace, olive trees, high wall, cameras
//   lagerSet(c, cam, t, o)  warehouse: tall pallet racks, shrink-wrapped boxes, forklift, fluorescent strips, time clock
//   parkSet(c, cam, t, o)   concrete parking deck with open side (used for the car line-up)
//   *Light(c, cam, t, o)    matching light pass for `screen`; *Front(c, cam, t, o) foreground layer for `screen`
const KM = 220;
// ---------- small shared helpers ----------
function kSpecks(c, x, y, w, h, seed, n, col, r = 3) { c.fillStyle = col; for (let i = 0; i < n; i++) { c.beginPath(); c.ellipse(x + rnd(seed + i) * w, y + rnd(seed + i + 500) * h, r * (.4 + rnd(seed + i + 900)), r * (.3 + rnd(seed + i + 1300) * .5), 0, 0, Math.PI * 2); c.fill(); } }
function kStain(c, x, y, rx, ry, col, seed) { c.save(); c.fillStyle = col; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x + (rnd(seed + i) - .5) * rx, y + (rnd(seed + i + 9) - .5) * ry * .6, rx * (.4 + rnd(seed + i + 3) * .5), ry * (.4 + rnd(seed + i + 6) * .5), 0, 0, Math.PI * 2); c.fill(); } c.restore(); }
function kRect(c, x, y, w, h, fill, lw = 2, col = OUT) { c.beginPath(); c.rect(x, y, w, h); fs(c, fill, lw, col); }
// security camera on a wall bracket (facing dir 1 = right, -1 = left); led blinks with t
function secCam(c, x, y, dir = 1, t = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  kRect(c, -12, -30, 24, 60, '#e8e6e0', 2.5); line(c, [0, 0, 40, 18], 9); line(c, [0, 0, 40, 18], 5, '#d8d6d0');
  c.save(); c.translate(48, 24); c.rotate(.3);
  c.beginPath(); c.roundRect(-30, -22, 96, 44, 10); fs(c, '#f4f3ef', 3); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-28, 6, 92, 14);
  c.beginPath(); c.roundRect(-36, -30, 110, 16, 6); fs(c, '#dcdad4', 2.5); // sun hood
  circle(c, 68, 0, 14); fs(c, '#1c1d22', 3); circle(c, 68, 0, 7); fs(c, '#3a4a6a', 0); circle(c, 65, -3, 2.5); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
  const on = Math.sin(t * 3) > .2; circle(c, -18, -2, 4.5); c.fillStyle = on ? '#ff3030' : '#601010'; c.fill(); if (on) bloom(c, -18, -2, 22, '255,60,60', .7);
  c.restore(); c.restore();
}
function domeCam(c, x, y, t = 0) {
  c.beginPath(); c.rect(x - 34, y, 68, 12); fs(c, '#e6e4de', 2.5); c.beginPath(); c.arc(x, y + 12, 30, 0, Math.PI); fs(c, '#2a2c34', 3);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - 10, y + 22, 8, 5, -.5, 0, Math.PI * 2); c.fill();
  if (Math.sin(t * 2.4 + 1) > .3) { circle(c, x + 14, y + 16, 3); c.fillStyle = '#ff4040'; c.fill(); }
}
// olive tree (silvery leaves, twisted trunk), h in world units
function oliveTree(c, x, y, h, seed = 0, ink = 2) {
  const tr = '#6d5a48';
  c.beginPath(); c.moveTo(x - h * .05, y); c.bezierCurveTo(x - h * .08, y - h * .25, x + h * .06, y - h * .35, x - h * .02, y - h * .55); c.lineTo(x + h * .04, y - h * .55); c.bezierCurveTo(x + h * .1, y - h * .35, x + h * .02, y - h * .2, x + h * .07, y); c.closePath(); fs(c, tr, ink);
  line(c, [x, y - h * .5, x - h * .22, y - h * .7], h * .03, tr); line(c, [x, y - h * .5, x + h * .25, y - h * .72], h * .03, tr);
  const cols = ['#7f9472', '#93a688', '#6b7f62', '#a9b8a0'];
  for (let i = 0; i < 26; i++) { const a = rnd(seed + i) * Math.PI * 2, r = rnd(seed + i + 40) * h * .32, bx = x + Math.cos(a) * r * 1.3, by = y - h * .72 + Math.sin(a) * r * .6, rr = h * (.07 + rnd(seed + i + 80) * .07);
    c.beginPath(); c.ellipse(bx, by, rr * 1.3, rr, 0, 0, Math.PI * 2); fs(c, cols[i % 4], ink * .6, 'rgba(40,50,40,.5)'); }
  for (let i = 0; i < 40; i++) { const bx = x + (rnd(seed + i + 200) - .5) * h * .8, by = y - h * .72 + (rnd(seed + i + 240) - .5) * h * .4; line(c, [bx, by, bx + 10, by - 4], 3, 'rgba(230,240,220,.6)'); }
}
function cypress(c, x, y, h, col = '#3d5a3a') { c.beginPath(); c.moveTo(x, y - h); c.quadraticCurveTo(x + h * .13, y - h * .5, x + h * .07, y); c.lineTo(x - h * .07, y); c.quadraticCurveTo(x - h * .13, y - h * .5, x, y - h); fs(c, col, 1.5, 'rgba(20,30,20,.4)'); c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.moveTo(x, y - h); c.quadraticCurveTo(x + h * .13, y - h * .5, x + h * .07, y); c.lineTo(x, y); c.fill(); }
function bougainvillea(c, x, y, w, h, seed) { // dense mound of leaves on the coping with magenta bracts trailing down the wall
  for (let i = 0; i < 26; i++) { const bx = x + rnd(seed + i + 7) * w, by = y + rnd(seed + i + 70) * 60; c.beginPath(); c.ellipse(bx, by, 60, 38, 0, 0, Math.PI * 2); fs(c, i % 2 ? '#4f7a3e' : '#5f8a48', 1.5, 'rgba(30,50,20,.5)'); }
  for (let i = 0; i < 260; i++) { const bx = x + rnd(seed + i) * w, by = y - 20 + Math.pow(rnd(seed + i + 50), 2.2) * h * (1 - Math.abs(bx - x - w / 2) / w); c.beginPath(); c.ellipse(bx, by, 7 + rnd(i + seed) * 6, 6, rnd(i) * 3, 0, Math.PI * 2); c.fillStyle = ['#c8287a', '#e04a94', '#a81f66', '#d63a88'][i % 4]; c.fill(); } }

// ======================= A) VILLA =======================
function villaSet(c, cam, t, o = {}) {
  const HZ = -170, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3f8fd6'); g.addColorStop(.75, '#bfe0f2'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // far: sun glare + thin clouds
  layer(c, cam, .03, c => { const b = B(.03); bloom(c, 1500, b - 2300, 1100, '255,250,225', .55); for (let i = 0; i < 5; i++) { const x = -2600 + i * 1250 + rnd(i + 5) * 300, y = b - 1700 + rnd(i + 9) * 300; c.fillStyle = 'rgba(255,255,255,.55)'; for (const [dx, dy, r] of [[0, 0, 70], [90, -20, 95], [200, 5, 60], [-80, 10, 50]]) { c.beginPath(); c.ellipse(x + dx, y + dy, r * 1.8, r * .6, 0, 0, Math.PI * 2); c.fill(); } } });
  // far hills with cypress dots and a village
  layer(c, cam, .1, c => { const b = B(.1); c.fillStyle = '#9db7c4'; c.beginPath(); c.moveTo(-5000, b); for (let x = -5000; x <= 5000; x += 200) c.lineTo(x, b - 260 - Math.sin(x * .0011) * 160 - Math.sin(x * .0037 + 1) * 60); c.lineTo(5000, b); c.fill();
    for (let i = 0; i < 40; i++) { const x = -4000 + i * 200 + rnd(i) * 90; c.fillStyle = '#86a2ae'; c.beginPath(); c.ellipse(x, b - 120 - rnd(i + 3) * 80, 9, 34, 0, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 14; i++) { const x = 600 + i * 60 + rnd(i + 30) * 30, y = b - 200 + rnd(i + 40) * 40; c.fillStyle = '#d6dadf'; c.fillRect(x, y, 44, 30); c.fillStyle = '#c49a86'; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 22, y - 16); c.lineTo(x + 48, y); c.fill(); } });
  haze(c, '215,232,242', .28);
  layer(c, cam, .28, c => { const b = B(.28); c.fillStyle = '#8aa486'; c.beginPath(); c.moveTo(-5000, b); for (let x = -5000; x <= 5000; x += 160) c.lineTo(x, b - 120 - Math.sin(x * .0016 + 2) * 70); c.lineTo(5000, b); c.fill();
    for (let i = 0; i < 70; i++) { const x = -4200 + i * 120 + rnd(i + 70) * 60, y = b - 40 - rnd(i + 90) * 110; c.fillStyle = i % 7 === 0 ? '#4a6a48' : '#9fb093'; c.beginPath(); c.ellipse(x, y, 34, 22, 0, 0, Math.PI * 2); c.fill(); if (i % 7 === 0) { c.beginPath(); c.ellipse(x, y - 50, 10, 60, 0, 0, Math.PI * 2); c.fill(); } } });
  haze(c, '225,238,245', .16);
  // boundary wall with gate, pillar camera, bougainvillea; olive trees + cypress behind it
  layer(c, cam, .6, c => { const b = B(.6); const top = b - 2.6 * KM;
    for (let i = 0; i < 6; i++) cypress(c, -2600 + i * 1150 + rnd(i + 3) * 200, top + 60, 1100 + rnd(i) * 300, '#456447');
    for (let i = 0; i < 5; i++) oliveTree(c, -2200 + i * 1300 + rnd(i + 8) * 300, top + 260, 820, i * 17, 1.5);
    kRect(c, -4200, top, 8400, b - top + 40, '#efe8dc', 2.5); // rendered wall
    c.save(); c.beginPath(); c.rect(-4200, top, 8400, b - top + 40); c.clip(); kSpecks(c, -4200, top, 8400, b - top, 11, 260, 'rgba(150,130,110,.12)', 9); c.fillStyle = 'rgba(160,140,110,.16)'; c.fillRect(-4200, b - 90, 8400, 130); c.restore();
    kRect(c, -4220, top - 26, 8440, 30, '#f6f2ea', 2.5);
    // steel sliding gate (dark, slatted) on the left
    const gx = -1900, gw = 1100; kRect(c, gx, top - 10, gw, b - top + 50, '#3a3c40', 3); for (let i = 1; i < 22; i++) { const yy = top - 10 + i * (b - top + 50) / 22; line(c, [gx, yy, gx + gw, yy], 3, '#26282c'); line(c, [gx, yy + 4, gx + gw, yy + 4], 2, 'rgba(255,255,255,.10)'); }
    c.save(); c.beginPath(); c.rect(-4200, top - 30, 8400, b - top + 70); c.clip(); for (let i = 0; i < 60; i++) { const lx = gx - 600 + rnd(i + 400) * 2600, ly = top + rnd(i + 430) * (b - top) * .7; c.fillStyle = 'rgba(20,25,45,.16)'; c.beginPath(); c.ellipse(lx, ly, 40 + rnd(i) * 50, 16 + rnd(i + 1) * 14, -.4, 0, Math.PI * 2); c.fill(); } c.restore();
    c.fillStyle = 'rgba(120,70,30,.25)'; c.fillRect(gx + 200, top + 60, 8, 200); c.fillRect(gx + 760, top + 120, 6, 140);
    c.fillStyle = 'rgba(255,250,220,.7)'; c.fillRect(gx, b + 10, gw, 30);
    kRect(c, gx + gw - 330, top + 40, 300, b - top - 10, '#43464b', 3); for (let i = 1; i < 18; i++) line(c, [gx + gw - 330, top + 40 + i * (b - top - 10) / 18, gx + gw - 30, top + 40 + i * (b - top - 10) / 18], 3, '#2e3034');
    kRect(c, gx + gw - 300, top + 330, 16, 90, '#b8bcc2', 2); kRect(c, gx + gw - 290, top + 250, 40, 40, '#22252a', 2);
    for (const px of [gx - 80, gx + gw]) { kRect(c, px, top - 70, 80, b - top + 110, '#e9e1d4', 2.5); kRect(c, px - 8, top - 86, 96, 20, '#f6f2ea', 2); }
    secCam(c, gx + gw + 40, top - 40, 1, t, 1.1);
    kRect(c, gx - 70, top + 260, 56, 80, '#2a2c30', 2); circle(c, gx - 42, top + 290, 10); c.fillStyle = '#8fa0b0'; c.fill(); // intercom
    bougainvillea(c, -800, top - 40, 700, 420, 3); bougainvillea(c, -2250, top - 50, 520, 480, 7); bougainvillea(c, -3600, top - 50, 900, 320, 9);
    kRect(c, gx - 60, top + 80, 40, 60, '#2a2c30', 2); bloom(c, gx - 40, top + 110, 60, '255,240,200', .25); // wall lamp
  });
  // the villa (white cubic, cantilevered upper floor)
  layer(c, cam, .85, c => { const b = B(.85) + 4; villaHouse(c, b, t, o); });
  // terrace deck (teak), props
  layer(c, cam, 1, c => {
    c.fillStyle = '#a8764a'; c.fillRect(-6000, HZ, 12000, 240);
    for (let r = 0; r < 6; r++) { const y = HZ + r * 40; line(c, [-6000, y, 6000, y], 2.5, 'rgba(70,40,20,.45)'); for (let k = -40; k < 40; k++) { const x = k * 300 + (r % 3) * 100; line(c, [x, y, x, y + 40], 2, 'rgba(70,40,20,.3)'); } }
    c.save(); c.globalAlpha = .18; for (let i = 0; i < 60; i++) { const x = -3000 + rnd(i + 3) * 6000, y = HZ + rnd(i + 7) * 220; line(c, [x, y + 10, x + 120 + rnd(i) * 200, y + 10], 2, '#5a3a1e'); } c.restore();
    c.fillStyle = 'rgba(255,220,170,.12)'; c.fillRect(-6000, HZ, 12000, 60);
    // soffit shadow line from the cantilever on the back of the deck
    c.fillStyle = 'rgba(40,40,80,.22)'; c.fillRect(-1300, HZ, 3200, 40);
    villaProps(c, t, o);
    // pool coping (travertine) + water
    kRect(c, -6000, 60, 12000, 40, '#e9e1cf', 2.5); for (let k = -30; k < 30; k++) line(c, [k * 240, 60, k * 240, 100], 2, 'rgba(120,100,70,.4)');
    poolWater(c, cam, t, o);
  });
  return { base: '#2aa0b8' };
}
function villaHouse(c, b, t, o) {
  const g0 = b - 3.3 * KM, g1 = g0 - 3.2 * KM; // ground floor top, upper floor top
  // ground floor volume (recessed glass)
  kRect(c, -1700, g0, 3000, b - g0, '#f4f1ea', 3);
  // tall glass sliding doors with closed heavy curtains behind
  const gx0 = -1550, gw = 2650, n = 5, pw = gw / n;
  kRect(c, gx0, g0 + 60, gw, b - g0 - 60, '#6f7d86', 3);
  c.save(); c.beginPath(); c.rect(gx0, g0 + 60, gw, b - g0 - 60); c.clip();
  for (let i = 0; i < 60; i++) { const x = gx0 + i * gw / 60; c.fillStyle = i % 2 ? '#d9d4ca' : '#c8c2b6'; c.fillRect(x, g0 + 60, gw / 60 + 1, b - g0); } // curtain folds
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(gx0, g0 + 60, gw, 50);
  // sky reflections on glass
  c.fillStyle = 'rgba(190,225,245,.35)'; c.fillRect(gx0, g0 + 60, gw, b - g0);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 5; i++) { const x = gx0 + i * pw + pw * .2; c.beginPath(); c.moveTo(x, g0 + 60); c.lineTo(x + 90, g0 + 60); c.lineTo(x - 60, b); c.lineTo(x - 150, b); c.fill(); }
  c.restore();
  for (let i = 0; i <= n; i++) kRect(c, gx0 + i * pw - 9, g0 + 60, 18, b - g0 - 60, '#4a4440', 2);
  kRect(c, gx0 - 10, g0 + 50, gw + 20, 20, '#4a4440', 2);
  // side wall right of glass with door intercom + downpipe
  line(c, [1250, g0 + 20, 1250, b], 10, '#d8d4cc');
  // upper cantilevered volume
  kRect(c, -1100, g1, 3200, g0 - g1 + 40, '#fbfaf6', 3.5);
  c.save(); c.beginPath(); c.rect(-1100, g1, 3200, g0 - g1 + 40); c.clip(); kSpecks(c, -1100, g1, 3200, g0 - g1, 41, 120, 'rgba(160,150,130,.10)', 7);
  c.fillStyle = 'rgba(120,120,160,.14)'; c.fillRect(1900, g1, 200, g0 - g1 + 40); c.restore();
  // window band with teak louvres (closed)
  const wy = g1 + 200, wh = 360; kRect(c, -900, wy, 2600, wh, '#2d3a44', 3);
  for (let i = 0; i < 52; i++) { const x = -890 + i * 50; c.beginPath(); c.rect(x, wy + 6, 34, wh - 12); fs(c, '#a8703f', 1.5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + 24, wy + 6, 10, wh - 12); }
  // soffit (shadow under cantilever)
  c.fillStyle = 'rgba(40,45,80,.35)'; c.fillRect(-1100, g0 + 40, 3200, 180);
  domeCam(c, 300, g0 + 40, t); domeCam(c, 1500, g0 + 40, t + 3);
  // linear wall lights
  for (const x of [-1250, -450, 350, 1150]) { kRect(c, x, g0 + 46, 140, 10, '#cfcac0', 1.5); }
  // roof parapet + glass balustrade terrace on the roof
  kRect(c, -1120, g1 - 30, 3240, 34, '#ece8de', 3);
  c.fillStyle = 'rgba(200,230,245,.4)'; c.fillRect(-1100, g1 - 260, 3200, 230); line(c, [-1100, g1 - 260, 2100, g1 - 260], 6, '#9aa4aa');
  for (let i = 0; i <= 16; i++) line(c, [-1100 + i * 200, g1 - 260, -1100 + i * 200, g1 - 30], 3, 'rgba(150,170,180,.6)');
  // corner security camera
  secCam(c, 2100, g0 + 10, 1, t + 1, 1.15); secCam(c, -1700, g0 + 120, -1, t + 2, 1.1);
  // garage wing: three closed sectional doors
  kRect(c, 2100, b - 3.0 * KM, 2500, 3.0 * KM, '#f2efe8', 3); kRect(c, 2080, b - 3.0 * KM - 30, 2540, 34, '#e6e2d8', 2.5);
  for (let i = 0; i < 3; i++) { const dx = 2220 + i * 790; kRect(c, dx, b - 2.3 * KM, 680, 2.3 * KM, '#5c6066', 3); for (let k = 1; k < 5; k++) line(c, [dx, b - 2.3 * KM + k * 2.3 * KM / 5, dx + 680, b - 2.3 * KM + k * 2.3 * KM / 5], 3, '#40444a'); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(dx, b - 2.3 * KM, 680, 30); }
  secCam(c, 4600, b - 2.9 * KM, 1, t + .5, 1.1); kRect(c, 3600, b - 2.75 * KM, 160, 14, '#cfcac0', 1.5);
  // AC condenser on the side + potted plants at the wall
  kRect(c, 4700, b - 300, 300, 300, '#d4d2cc', 3); circle(c, 4850, b - 150, 105); fs(c, '#8e8c86', 3); for (let k = 0; k < 6; k++) line(c, [4760, b - 220 + k * 28, 4940, b - 220 + k * 28], 3, '#6e6c66');
}
function villaProps(c, t, o) {
  // big pot with olive tree
  const px = o.potX ?? -1050; c.beginPath(); c.moveTo(px - 130, -250); c.lineTo(px + 130, -250); c.lineTo(px + 100, -6); c.lineTo(px - 100, -6); c.closePath(); fs(c, '#d8cfc0', 3); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(px + 40, -250, 60, 244); kRect(c, px - 140, -262, 280, 22, '#e6ddce', 2.5);
  oliveTree(c, px, -255, 760, 91, 2.5);
  // sun lounger (teak frame, slats, thick white cushion, folded towel nobody uses)
  const lx = o.loungerX ?? 900;
  for (const d of [-300, 200]) { kRect(c, lx + d, -120, 26, 120, '#7a5030', 2.5); }
  kRect(c, lx - 340, -150, 640, 40, '#a06a3c', 3); for (let i = 0; i < 12; i++) line(c, [lx - 330 + i * 54, -148, lx - 330 + i * 54, -112], 2, 'rgba(60,30,10,.4)');
  c.beginPath(); c.roundRect(lx - 330, -200, 470, 56, 20); fs(c, '#f4f1ea', 3); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(lx - 320, -160, 450, 14);
  c.save(); c.translate(lx + 150, -150); c.rotate(-.75); kRect(c, 0, -40, 340, 40, '#a06a3c', 3); c.beginPath(); c.roundRect(10, -96, 320, 58, 20); fs(c, '#f4f1ea', 3); c.restore();
  c.beginPath(); c.roundRect(lx - 120, -238, 150, 40, 12); fs(c, '#e7e2d6', 2.5); line(c, [lx - 110, -220, lx + 20, -220], 3, '#8fb0c8');
  // outdoor table: half-eaten lunch + tablet with the camera feed
  const tx = o.tableX ?? 1750; kRect(c, tx - 260, -360, 520, 30, '#9c6a40', 3); for (const d of [-220, 200]) kRect(c, tx + d, -330, 22, 330, '#7a5030', 2);
  ell(c, tx - 120, -368, 90, 16); fs(c, '#fbfaf6', 2.5); ell(c, tx - 130, -374, 50, 10); fs(c, '#c8954a', 0); circle(c, tx - 100, -376, 14); fs(c, '#d8483a', 1.5); line(c, [tx - 40, -372, tx + 20, -390], 4, '#b8bcc4'); // plate, fork
  c.beginPath(); c.moveTo(tx + 60, -366); c.lineTo(tx + 230, -366); c.lineTo(tx + 220, -460); c.lineTo(tx + 70, -460); c.closePath(); fs(c, '#1e1f24', 3);
  for (let i = 0; i < 4; i++) { const qx = tx + 80 + (i % 2) * 70, qy = -452 + Math.floor(i / 2) * 42; c.fillStyle = ['#7d8a90', '#8f9a8c', '#6f7a84', '#9aa0a2'][i]; c.fillRect(qx, qy, 64, 38); }
  c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(tx + 150, -420, 12, 12); // tiny moving car on the feed
  for (const d of [-380, 380]) { c.beginPath(); c.rect(tx + d - 60, -260, 120, 20); fs(c, '#9c6a40', 2.5); line(c, [tx + d - 50, -240, tx + d - 55, 0], 8, '#7a5030'); line(c, [tx + d + 50, -240, tx + d + 55, 0], 8, '#7a5030'); line(c, [tx + d + (d < 0 ? -60 : 60), -260, tx + d + (d < 0 ? -70 : 70), -480], 9, '#7a5030'); }
}
function poolWater(c, cam, t, o) {
  const y0 = 100, y1 = 1800, g = c.createLinearGradient(0, y0, 0, 900); g.addColorStop(0, '#3fb4c8'); g.addColorStop(1, '#1d8eb0');
  c.fillStyle = g; c.fillRect(-6000, y0, 12000, y1 - y0);
  // wobbly reflection of the white villa + sky
  c.save(); c.beginPath(); c.rect(-6000, y0, 12000, y1 - y0); c.clip();
  for (let r = 0; r < 26; r++) { const y = y0 + 10 + r * 26, wob = Math.sin(t * 1.6 + r * .9) * 18; c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(-1100 * .85 + wob, y, 3200 * .85, 14); c.fillStyle = 'rgba(30,60,90,.12)'; c.fillRect(-1300 + wob, y + 14, 2700, 8); }
  // caustic net
  c.globalCompositeOperation = 'screen';
  for (let j = 0; j < 22; j++) { c.beginPath(); for (let x = -3000; x <= 3000; x += 60) { const y = y0 + 40 + j * 40 + Math.sin(x * .006 + t * 1.3 + j) * 14 + Math.sin(x * .013 - t + j * 2) * 8; x === -3000 ? c.moveTo(x, y) : c.lineTo(x, y); } c.lineWidth = 3 + (j % 3); c.strokeStyle = 'rgba(200,250,255,.22)'; c.stroke(); }
  for (let i = 0; i < 70; i++) { const x = cam.x - 1600 + rnd(i + 11) * 3200, y = y0 + 20 + rnd(i + 17) * 700, a = Math.max(0, Math.sin(t * 4 + i * 1.7)); if (a > .5) { c.fillStyle = `rgba(255,255,240,${a * .9})`; star(c, x, y, 9 + rnd(i) * 9, 4, .25); c.fill(); } }
  c.restore();
  line(c, [-6000, y0, 6000, y0], 3, 'rgba(20,60,80,.6)');
}
function villaLight(c, cam, t, o = {}) {
  layer(c, cam, 1, c => { motes(c, cam.x - 1200, cam.x + 1200, cam.y - 600, cam.y + 300, t, { n: 18, color: '255,250,230', alpha: .4 }); });
  grade(c, { sx: .85, sy: 0, warm: '255,236,190', warmA: .22, cool: '20,60,110', coolA: .12 });
}
// foreground olive branch hanging into a top corner (p 1.35): twig + narrow silver-green leaves
function villaFront(c, cam, t, o = {}) {
  const sd = o.side ?? -1;
  layer(c, cam, 1.35, c => { const z = 1 + (cam.z - 1) * 1.35, x0 = cam.x * 1.35 + sd * 1000 / z, y0 = cam.y * 1.35 - 560 / z, sw = Math.sin(t * .8) * 6;
    const pts = []; for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([x0 + sd * 120 - sd * k * 700, y0 - 40 + k * k * 260 + sw * k]); }
    line(c, pts.flat(), 16, '#3c3026'); line(c, pts.flat(), 9, '#5a4a3a');
    pts.forEach(([px, py], i) => { if (!i) return; for (const s2 of [-1, 1]) { c.save(); c.translate(px, py); c.rotate(s2 * .7 + (sd > 0 ? Math.PI : 0) + .3 + Math.sin(t + i) * .05); c.scale(.72, .72); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(60, -16, 130, 0); c.quadraticCurveTo(60, 16, 0, 0); fs(c, (i + (s2 > 0)) % 2 ? '#56704e' : '#8fa486', 2.5, '#2a3424'); line(c, [8, 0, 120, 0], 2, 'rgba(230,240,220,.5)'); c.restore(); } });
  });
}
// ======================= B) WAREHOUSE =======================
function rackBay(c, x, b, w, levels, seed, t) {
  const lh = 1.55 * KM, up = '#2d5fa8', beam = '#e8762a';
  for (let l = 0; l < levels; l++) {
    const y = b - l * lh;
    if (l > 0) { kRect(c, x, y - 34, w, 34, beam, 2.5); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 4, y - 30, w - 8, 6); }
    const fill = rnd(seed + l * 7);
    if (fill < .12 && l > 0) continue;
    // pallet + shrink-wrapped stack
    const py = y - (l > 0 ? 34 : 0); kRect(c, x + 30, py - 30, w - 60, 30, '#c8a46e', 2); for (let k = 0; k < 3; k++) kRect(c, x + 40 + k * (w - 100) / 2, py - 30, 26, 30, '#a8845a', 1.5);
    const sh = lh - 120 - rnd(seed + l) * 160, sw = w - 70, sx = x + 35, st = py - 30 - sh;
    const rows = Math.max(2, Math.round(sh / 130)), cols = Math.max(2, Math.round(sw / 170));
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const bx = sx + k * sw / cols, by = st + r * sh / rows; c.beginPath(); c.rect(bx, by, sw / cols, sh / rows); fs(c, rnd(seed + r * 5 + k + l * 31) > .8 ? '#b88a52' : '#c9a06a', 1.8, 'rgba(60,40,20,.7)'); line(c, [bx, by + sh / rows * .5, bx + sw / cols, by + sh / rows * .5], 3, 'rgba(160,120,70,.6)');
      if (rnd(seed + r + k * 3 + l) > .55) { kRect(c, bx + 14, by + 14, 46, 30, '#f4f2ec', 1); for (let q = 0; q < 6; q++) line(c, [bx + 18 + q * 6, by + 30, bx + 18 + q * 6, by + 40], 2, '#333'); } }
    // stretch film: glossy diagonal highlights + edge
    c.save(); c.beginPath(); c.rect(sx - 4, st - 4, sw + 8, sh + 8); c.clip(); c.fillStyle = 'rgba(235,245,255,.28)'; c.fillRect(sx - 4, st - 4, sw + 8, sh + 8);
    c.fillStyle = 'rgba(255,255,255,.45)'; for (let q = 0; q < 4; q++) { const qx = sx + q * sw / 3 + rnd(seed + q) * 40; c.beginPath(); c.moveTo(qx, st); c.lineTo(qx + 30, st); c.lineTo(qx - 40, st + sh); c.lineTo(qx - 70, st + sh); c.fill(); } c.restore();
    c.beginPath(); c.rect(sx - 4, st - 4, sw + 8, sh + 8); c.lineWidth = 2; c.strokeStyle = 'rgba(200,215,230,.8)'; c.stroke();
  }
  // uprights with punched holes
  for (const ux of [x - 22, x + w - 22]) { kRect(c, ux, b - levels * lh - 40, 44, levels * lh + 40, up, 2.5); for (let q = 0; q < levels * 18; q++) { c.fillStyle = '#1d3f74'; c.fillRect(ux + 16, b - 30 - q * 30, 12, 8); } kRect(c, ux - 14, b - 90, 72, 90, '#f2c531', 2); for (let q = 0; q < 3; q++) line(c, [ux - 12, b - 80 + q * 30, ux + 56, b - 64 + q * 30], 8, '#2a2a2a'); }
}
function forklift(c, x, t = 0, s = 1, forkH = 300) {
  c.save(); c.translate(x, 0); c.scale(s * .5, .5); // drawn at 2x, real size ~2,3 m tall
  // mast + forks + pallet with wrapped boxes (front at +x)
  kRect(c, 330, -1150, 34, 1130, '#3a3c42', 2.5); kRect(c, 380, -1150, 34, 1130, '#3a3c42', 2.5);
  kRect(c, 400, -forkH - 140, 30, 160, '#2a2c30', 2); kRect(c, 400, -forkH, 330, 18, '#2a2c30', 2);
  kRect(c, 430, -forkH - 30, 300, 30, '#c8a46e', 2); for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) kRect(c, 440 + k * 140, -forkH - 30 - (r + 1) * 120, 140, 120, '#c9a06a', 1.8, 'rgba(60,40,20,.7)');
  c.fillStyle = 'rgba(235,245,255,.3)'; c.fillRect(436, -forkH - 274, 288, 244);
  // body + counterweight
  c.beginPath(); c.moveTo(-330, -80); c.lineTo(-340, -420); c.quadraticCurveTo(-330, -470, -260, -470); c.lineTo(120, -470); c.lineTo(160, -380); c.lineTo(330, -360); c.lineTo(330, -80); c.closePath(); fs(c, '#f2b81e', 3.5);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-330, -200, 660, 40); kRect(c, -360, -520, 140, 430, '#e0a816', 3); // counterweight
  for (let q = 0; q < 5; q++) line(c, [-350, -500 + q * 18 * 4, -230, -500 + q * 72], 2, 'rgba(0,0,0,.15)');
  // overhead guard + seat + steering wheel
  line(c, [-200, -470, -220, -1000, 260, -1000, 300, -380], 14); line(c, [-200, -470, -220, -1000, 260, -1000, 300, -380], 8, '#2a2c30');
  for (let q = 0; q < 5; q++) line(c, [-210 + q * 100, -1000, -210 + q * 100, -985], 6, '#2a2c30');
  c.beginPath(); c.moveTo(-160, -470); c.lineTo(-170, -700); c.lineTo(-80, -700); c.lineTo(-60, -520); c.lineTo(40, -520); c.lineTo(40, -470); c.closePath(); fs(c, '#2a2a2e', 3);
  line(c, [120, -520, 180, -650], 8); ell(c, 185, -660, 50, 14, -.3); fs(c, null, 6, '#1a1a1a');
  // beacon on the guard
  kRect(c, -40, -1050, 60, 50, '#ff8a1e', 2.5); const on = (Math.sin(t * 8) > 0); if (on) bloom(c, -10, -1030, 160, '255,150,40', .8);
  // wheels
  for (const [wx, r] of [[-200, 130], [230, 150]]) { circle(c, wx, -r, r); fs(c, '#1d1d20', 3.5); circle(c, wx, -r, r * .5); fs(c, '#c9c9c4', 2.5); circle(c, wx, -r, r * .15); fs(c, '#555', 2); }
  // warning stickers (pictograms only)
  c.beginPath(); c.moveTo(0, -330); c.lineTo(40, -260); c.lineTo(-40, -260); c.closePath(); fs(c, '#ffe14a', 2.5); line(c, [0, -312, 0, -284], 5); circle(c, 0, -272, 3); c.fill();
  c.restore();
}
function timeClock(c, x0, t) {
  c.save(); c.translate(x0, 0); c.scale(.42, .42); const x = 0;
  kRect(c, x - 20, -1100, 40, 1100, '#7a7f86', 2.5); // post
  c.beginPath(); c.roundRect(x - 120, -1100, 240, 300, 16); fs(c, '#d9d4c6', 3);
  circle(c, x, -1010, 70); fs(c, '#f8f6ee', 3); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [x + Math.cos(a) * 56, -1010 + Math.sin(a) * 56, x + Math.cos(a) * 64, -1010 + Math.sin(a) * 64], 3); }
  const hh = -Math.PI / 2 + (5.9 / 12) * Math.PI * 2, mm = -Math.PI / 2 + t * .02; line(c, [x, -1010, x + Math.cos(hh) * 36, -1010 + Math.sin(hh) * 36], 6); line(c, [x, -1010, x + Math.cos(mm) * 54, -1010 + Math.sin(mm) * 54], 4);
  kRect(c, x - 60, -910, 120, 20, '#2a2a2e', 2); kRect(c, x - 90, -870, 180, 50, '#3a3a40', 2);
  // card rack with punch cards
  kRect(c, x + 150, -1120, 220, 420, '#8a8f96', 2.5); for (let r = 0; r < 6; r++) { kRect(c, x + 160, -1100 + r * 66, 200, 14, '#5a5f66', 1.5); for (let k = 0; k < 4; k++) kRect(c, x + 172 + k * 46, -1150 + r * 66 + 30 + (rnd(r * 4 + k) > .6 ? -10 : 0), 34, 40, '#efe8d4', 1.2); }
  c.restore();
}
function lagerSet(c, cam, t, o = {}) {
  const HZ = -340, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#5c646e'; c.fillRect(0, 0, W, H);
  // back wall: corrugated steel, clerestory windows, roller door with daylight, signs
  layer(c, cam, .3, c => { const b = B(.3), top = b - 11 * KM;
    c.fillStyle = '#9aa6b0'; c.fillRect(-6000, top, 12000, b - top); for (let i = -300; i < 300; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.06)'; c.fillRect(i * 22, top, 11, b - top); }
    for (let i = -10; i < 10; i++) { const wx = i * 600 + 60; c.fillStyle = '#e8f2f8'; c.fillRect(wx, top + 140, 480, 170); line(c, [wx, top + 225, wx + 480, top + 225], 4, '#7a8590'); for (let k = 1; k < 4; k++) line(c, [wx + k * 120, top + 140, wx + k * 120, top + 310], 4, '#7a8590'); c.fillStyle = 'rgba(160,190,210,.35)'; c.fillRect(wx, top + 230, 480, 80); }
    // roller door (half open) with outside daylight + truck rear
    const dx = 600, dw = 900, dh = 1100; c.fillStyle = '#eef6fb'; c.fillRect(dx, b - dh, dw, dh); c.fillStyle = '#b8c4cc'; c.fillRect(dx, b - 200, dw, 200);
    kRect(c, dx + 120, b - 840, 660, 640, '#e6e8ea', 2); for (let k = 0; k < 6; k++) line(c, [dx + 120 + k * 132, b - 840, dx + 120 + k * 132, b - 200], 2, '#b8bcc0'); kRect(c, dx + 100, b - 210, 700, 40, '#3a3a40', 2);
    kRect(c, dx - 20, b - dh - 60, dw + 40, 60, '#5a6068', 2); c.fillStyle = '#8f9aa4'; c.fillRect(dx, b - dh, dw, 420); for (let k = 0; k < 14; k++) line(c, [dx, b - dh + k * 30, dx + dw, b - dh + k * 30], 2, '#6f7a84');
    for (const s of [-1, 1]) { c.save(); c.fillStyle = '#f2c531'; c.fillRect(s < 0 ? dx - 60 : dx + dw, b - dh, 60, dh); c.beginPath(); c.rect(s < 0 ? dx - 60 : dx + dw, b - dh, 60, dh); c.clip(); for (let k = 0; k < 30; k++) { c.fillStyle = '#2a2a2a'; c.beginPath(); const yy = b - dh + k * 80; c.moveTo(s < 0 ? dx - 60 : dx + dw, yy); c.lineTo((s < 0 ? dx - 60 : dx + dw) + 60, yy - 40); c.lineTo((s < 0 ? dx - 60 : dx + dw) + 60, yy); c.lineTo((s < 0 ? dx - 60 : dx + dw), yy + 40); c.fill(); } c.restore(); }
    // painted hall letter + signs (German, no numbers)
    c.save(); c.font = `800 300px Inter`; c.fillStyle = 'rgba(40,50,60,.55)'; c.textAlign = 'center'; c.fillText('HALLE B', -1600, b - 1500); c.restore();
    kRect(c, -500, b - 1450, 300, 130, '#1f8a4c', 3); c.save(); c.font = '700 44px Inter'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('NOTAUSGANG', -350, b - 1370); c.restore();
    c.beginPath(); c.moveTo(-2600, b - 1380); c.lineTo(-2480, b - 1180); c.lineTo(-2720, b - 1180); c.closePath(); fs(c, '#ffd42a', 4); c.save(); c.font = '800 90px Inter'; c.fillStyle = '#222'; c.textAlign = 'center'; c.fillText('!', -2600, b - 1200); c.font = '700 44px Inter'; c.fillText('VORSICHT STAPLER', -2600, b - 1100); c.restore();
  });
  // ceiling trusses + far fluorescent row
  layer(c, cam, .35, c => { const b = B(.35), top = b - 11.8 * KM; c.fillStyle = '#4c545e'; c.fillRect(-6000, top - 2000, 12000, 2100);
    for (let i = -20; i < 20; i++) { const x = i * 400; line(c, [x, top, x + 200, top + 100, x + 400, top], 8, '#3a4048'); }
    line(c, [-6000, top + 100, 6000, top + 100], 12, '#3a4048');
    for (let i = -8; i < 8; i++) { const x = i * 800 + 200; line(c, [x + 60, top + 100, x + 60, top + 260], 2, '#222'); line(c, [x + 440, top + 100, x + 440, top + 260], 2, '#222'); kRect(c, x, top + 260, 500, 26, '#f4fbff', 2); bloom(c, x + 250, top + 290, 340, '200,230,255', .45); } });
  haze(c, '170,190,205', .14);
  // tall pallet racks
  layer(c, cam, .55, c => { const b = B(.55); for (let i = -7; i < 7; i++) { if (i === 1) continue; rackBay(c, i * 640 - 3200 + (i > 1 ? 400 : 0) + 3200 - 400, b, 600, 4, i * 13 + 5, t); } });
  haze(c, '180,200,215', .1);
  // near fluorescent strips (p .75)
  layer(c, cam, .75, c => { const b = B(.75), top = b - 4.3 * KM; for (let i = -5; i < 5; i++) { const x = i * 1100 + 300; line(c, [x + 80, top - 600, x + 80, top], 3, '#222'); line(c, [x + 520, top - 600, x + 520, top], 3, '#222'); c.beginPath(); c.moveTo(x - 30, top); c.lineTo(x + 630, top); c.lineTo(x + 600, top + 40); c.lineTo(x, top + 40); c.closePath(); fs(c, '#d8dde2', 3); kRect(c, x + 10, top + 40, 580, 18, '#ffffff', 2); bloom(c, x + 300, top + 60, 520, '210,235,255', .5);
    const fl = 1 + (i === 1 ? (Math.sin(t * 37) > .7 ? -.6 : 0) : 0); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, top + 60, 0, b); g.addColorStop(0, `rgba(210,235,255,${.16 * fl})`); g.addColorStop(1, 'rgba(210,235,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, top + 58); c.lineTo(x + 600, top + 58); c.lineTo(x + 1000, b); c.lineTo(x - 400, b); c.closePath(); c.fill(); c.restore(); } });
  // floor + props
  layer(c, cam, 1, c => {
    c.fillStyle = '#9c9a94'; c.fillRect(-6000, HZ, 12000, 2600);
    for (let k = -30; k < 30; k++) line(c, [k * 900, HZ, k * 900 - 200, HZ + 1400], 2, 'rgba(60,60,60,.25)'); // saw cuts
    kSpecks(c, -3000, HZ, 6000, 900, 3, 220, 'rgba(70,65,60,.18)', 7);
    kStain(c, 500, 40, 200, 40, 'rgba(60,55,50,.12)', 4); kStain(c, 1600, 260, 200, 50, 'rgba(60,55,50,.18)', 8);
    // reflections of the fluorescent strips on polished concrete
    c.save(); c.globalCompositeOperation = 'screen'; for (let i = -5; i < 5; i++) { const x = i * 1100 + 600; c.fillStyle = 'rgba(220,235,250,.13)'; c.fillRect(x - 200, HZ + 40, 400, 18); c.fillRect(x - 120, HZ + 120, 240, 12); } c.restore();
    c.fillStyle = '#f2c531'; c.fillRect(-6000, HZ + 60, 12000, 22); c.fillRect(-6000, 140, 12000, 22); for (let k = -20; k < 20; k++) { c.fillStyle = 'rgba(40,40,40,.15)'; c.fillRect(k * 600 + rnd(k) * 200, HZ + 62, 50, 18); }
    if (o.props !== false) {
      timeClock(c, o.clockX ?? -1500, t);
      for (let i = 0; i < 6; i++) { kRect(c, (o.palletsX ?? -2400) - 260, -i * 70 - 70, 520, 70, i % 2 ? '#c8a46e' : '#b8945e', 2); for (let k = 0; k < 3; k++) kRect(c, (o.palletsX ?? -2400) - 250 + k * 220, -i * 70 - 50, 60, 50, '#a8845a', 1.5); }
      forklift(c, o.forkX ?? 1350, t, -1, 520);
      // broom + bin with flattened cartons
      line(c, [-850, -30, -800, -330], 9, '#a07040'); kRect(c, -910, -40, 130, 30, '#c43a2a', 2); for (let q = 0; q < 10; q++) line(c, [-895 + q * 14, 0, -895 + q * 14, -10], 2, '#552');
      kRect(c, 2300, -520, 360, 520, '#3c6a8a', 3); for (let q = 0; q < 4; q++) { c.save(); c.translate(2330 + q * 70, -520); c.rotate(-.1 + q * .08); kRect(c, 0, -160, 140, 170, '#c9a06a', 2); c.restore(); }
    }
  });
  return { base: '#9c9a94' };
}
function lagerLight(c, cam, t, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; for (const fx of [.18, .62]) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(215,235,255,.28)'); g.addColorStop(1, 'rgba(215,235,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(W * fx - 140, 0); c.lineTo(W * fx + 140, 0); c.lineTo(W * fx + 420, H); c.lineTo(W * fx - 420, H); c.closePath(); c.fill(); c.fillStyle = 'rgba(225,240,255,.9)'; c.fillRect(W * fx - 180, 0, 360, 10); } c.restore();
  layer(c, cam, 1, c => { sunRays(c, cam.x + 900, cam.y - 1300, { n: 6, len: 2600, spread: .25, dir: 2.05, color: '220,235,255', alpha: .09, t }); motes(c, cam.x - 1300, cam.x + 1300, cam.y - 700, cam.y + 400, t, { n: 50, color: '230,240,255', alpha: .45, speed: .015 }); });
  grade(c, { sx: .5, sy: 0, warm: '220,240,255', warmA: .18, cool: '30,40,60', coolA: .3 });
}
function lagerFront(c, cam, t, o = {}) {
  layer(c, cam, 1.3, c => { const x = cam.x + 980 / cam.z * (o.side ?? 1); kRect(c, x - 40, cam.y - 1400, 80, 3000, '#244e8c', 3); for (let q = 0; q < 60; q++) { c.fillStyle = '#163562'; c.fillRect(x - 10, cam.y - 1400 + q * 46, 18, 12); }
    kRect(c, x - 60, -120, 120, 120, '#f2c531', 2.5); });
}

// ======================= PARKING DECK (car line-up) =======================
function parkSet(c, cam, t, o = {}) {
  const HZ = -300, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fc4dc'); g.addColorStop(1, '#e2ecef'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // city outside the open side
  layer(c, cam, .12, c => { const b = B(.12); for (let i = 0; i < 60; i++) { const x = -6000 + i * 210 + rnd(i) * 80, w = 140 + rnd(i + 3) * 120, h = 300 + rnd(i + 7) * 700; c.fillStyle = i % 3 ? '#a9b7c2' : '#b9c3c9'; c.fillRect(x, b - h, w, h); c.fillStyle = 'rgba(255,255,255,.25)'; for (let r = 0; r < h / 60 - 1; r++) for (let k = 0; k < w / 34 - 1; k++) if (rnd(i * 31 + r * 7 + k) > .45) c.fillRect(x + 10 + k * 34, b - h + 16 + r * 60, 16, 26); } });
  haze(c, '225,235,240', .3);
  // structure: deck slab above, parapet below the opening, columns, beams
  layer(c, cam, .7, c => { const b = B(.7), top = b - 2.6 * KM;
    c.fillStyle = '#8e8c86'; c.fillRect(-9000, top - 3000, 18000, 3000); c.fillStyle = '#7a7872'; c.fillRect(-9000, top - 140, 18000, 140);
    for (let i = -10; i < 10; i++) { const x = i * 1200; kRect(c, x, top - 140, 120, 140, '#86847e', 1.5); }
    kRect(c, -9000, b - 1.1 * KM, 18000, 1.1 * KM, '#b6b3ab', 2); c.save(); c.beginPath(); c.rect(-9000, b - 1.1 * KM, 18000, 1.1 * KM); c.clip(); kSpecks(c, -6000, b - 1.1 * KM, 12000, 1.1 * KM, 7, 300, 'rgba(90,85,80,.16)', 8); for (let i = 0; i < 40; i++) { const x = -6000 + i * 300 + rnd(i) * 100; c.fillStyle = 'rgba(80,70,60,.12)'; c.fillRect(x, b - 1.1 * KM, 30 + rnd(i) * 30, 1.1 * KM); } c.restore();
    line(c, [-9000, b - 1.1 * KM - 60, 9000, b - 1.1 * KM - 60], 10, '#5a5e64'); line(c, [-9000, b - 1.1 * KM - 60, 9000, b - 1.1 * KM - 60], 5, '#8a9098');
    for (let i = -6; i < 6; i++) { const x = i * 1600 + 400; kRect(c, x, top, 220, b - top, '#a9a69e', 2.5); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + 150, top, 70, b - top); c.fillStyle = '#e8c23a'; c.fillRect(x, b - 260, 220, 50); c.fillStyle = '#2a2a2a'; for (let q = 0; q < 4; q++) c.fillRect(x + q * 60, b - 260, 30, 50);
      c.save(); c.font = '800 120px Inter'; c.fillStyle = '#2f6fb0'; c.textAlign = 'center'; c.fillText('P', x + 110, top + 200); c.restore(); }
    for (let i = -6; i < 6; i++) { const x = i * 1600 + 1100; kRect(c, x, top + 20, 420, 22, '#f4fbff', 2); bloom(c, x + 210, top + 40, 300, '230,240,255', .4); }
  });
  layer(c, cam, 1, c => {
    c.fillStyle = '#8d8b86'; c.fillRect(-9000, HZ, 18000, 2600);
    kSpecks(c, -5000, HZ, 10000, 700, 13, 260, 'rgba(60,55,50,.16)', 8);
    for (const sx of o.stalls || []) { c.fillStyle = '#efeae0'; c.beginPath(); c.moveTo(sx - 12, HZ); c.lineTo(sx + 12, HZ); c.lineTo(sx + 40, 240); c.lineTo(sx + 16, 240); c.fill(); }
    for (const [x, w] of o.oil || []) kStain(c, x, 120, w, 40, 'rgba(30,28,26,.25)', x | 0);
  });
  return { base: '#8d8b86' };
}
function parkLight(c, cam, t) { layer(c, cam, 1, c => { sunRays(c, cam.x - 1300 / cam.z, cam.y - 150 / cam.z, { n: 7, len: 4000 / cam.z, spread: .3, dir: .22, color: '255,245,220', alpha: .06, t }); motes(c, cam.x - 1000 / cam.z, cam.x + 1000 / cam.z, cam.y - 500 / cam.z, cam.y + 300 / cam.z, t, { n: 30, alpha: .35 }); }); grade(c, { sx: 0, sy: .2, warm: '255,236,200', warmA: .2, cool: '30,40,70', coolA: .2 }); }
