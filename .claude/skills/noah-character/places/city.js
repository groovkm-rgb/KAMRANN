// DETAILED CITY STREET (needs light.js + forest.js for tree canopies). Street level, side-on.
//   city(c, cam, t, { tod: 'day' | 'golden' | 'night', seed })   Noah walks on the sidewalk at y = 0 (k ≈ .25)
//   props: streetLamp(c,x,on) streetTree(c,x,P) bench(c,x) hydrant(c,x) bin(c,x) bike(c,x) car(c,x,{color,s}) trafficLight(c,x,state) pigeon(c,x,t)
//   cityLight(c, cam, t, o) — sun shafts, motes, lamp glows and grade (put in `screen`)
const CITY = {
  day:    { sky: ['#6fb6ea', '#d8eef6'], fog: '215,230,240', far: '#a9c3d6', mid: ['#c98b6a', '#9fb1c4', '#d9c49a', '#b07a8a'], sun: [-900, -1300], ray: '255,244,210', rayA: .2, warm: '255,210,150' },
  golden: { sky: ['#5d6fb0', '#ffc48a'], fog: '255,200,160', far: '#c79a9a', mid: ['#c07a5e', '#8f8fb0', '#d0a878', '#a06878'], sun: [-1100, -620], ray: '255,200,130', rayA: .32, warm: '255,170,90' },
  night:  { sky: ['#0d1430', '#2b3466'], fog: '40,50,90', far: '#2a3358', mid: ['#4a3a4a', '#38405a', '#4f4a3a', '#46364a'], sun: [800, -1500], ray: '200,210,255', rayA: .1, warm: '255,190,110' },
};
const FACADES = ['#c2674f', '#e0c08a', '#7f9cbf', '#d98e6a', '#a7b48a', '#c9a0b4', '#e8dcc6', '#8d6f5a'];
function cWin(c, x, y, w, h, o) {
  // window with frame, glass, reflection, sill, curtains / plants / AC
  const lit = o.night && rnd(o.seed) > .45, glass = lit ? '#ffd98a' : (o.night ? '#2a3150' : '#9cc9e4');
  c.beginPath(); c.rect(x - 6, y - 6, w + 12, h + 12); fs(c, '#f2eee4', 2.5);
  c.beginPath(); c.rect(x, y, w, h); fs(c, glass, 2);
  if (!lit) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x + w * .2, y); c.lineTo(x + w * .45, y); c.lineTo(x + w * .05, y + h); c.lineTo(x - w * .2, y + h); c.fill(); c.restore(); }
  else bloom(c, x + w / 2, y + h / 2, w * 1.2, '255,210,130', .35);
  line(c, [x + w / 2, y, x + w / 2, y + h], 2.5, '#f2eee4'); line(c, [x, y + h * .45, x + w, y + h * .45], 2.5, '#f2eee4');
  const r = rnd(o.seed + 3);
  if (r < .35) { for (const s of [0, 1]) { c.beginPath(); c.moveTo(x + s * w, y); c.quadraticCurveTo(x + (s ? w * .78 : w * .22), y + h * .5, x + s * w + (s ? -w * .12 : w * .12), y + h); c.lineTo(x + s * w, y + h); c.closePath(); c.fillStyle = ['#e9e2d0', '#d9a0a0', '#a8c4a0'][Math.floor(rnd(o.seed + 4) * 3)]; c.fill(); } }
  c.beginPath(); c.rect(x - 10, y + h + 4, w + 20, 9); fs(c, '#e8e2d4', 2);
  if (r > .7) { c.beginPath(); c.rect(x + 2, y + h - 2, w - 4, 20); fs(c, '#8a5a3a', 2); for (let i = 0; i < 5; i++) { circle(c, x + 8 + i * (w - 16) / 4, y + h - 6, 9); fs(c, i % 2 ? '#e05a6a' : '#5a9a4a', 1.5); } }
  else if (r > .55 && o.ac) { c.beginPath(); c.rect(x + w * .15, y + h + 16, w * .7, 34); fs(c, '#d8dde2', 2); for (let i = 0; i < 4; i++) line(c, [x + w * .2, y + h + 22 + i * 7, x + w * .8, y + h + 22 + i * 7], 1.5, '#9aa2aa'); }
}
const SHOP_ICONS = {
  cafe: (c, x, y) => { c.beginPath(); c.moveTo(x - 22, y - 16); c.lineTo(x + 18, y - 16); c.lineTo(x + 12, y + 18); c.lineTo(x - 16, y + 18); c.closePath(); fs(c, '#fff', 3); c.beginPath(); c.arc(x + 20, y, 9, -1.4, 1.4); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); for (const d of [-8, 4]) line(c, [x + d, y - 24, x + d + 4, y - 36], 3, '#fff'); },
  bakery: (c, x, y) => { ell(c, x, y, 30, 15); fs(c, '#f2d29a', 3); for (const d of [-14, 0, 14]) line(c, [x + d - 5, y - 8, x + d + 5, y + 8], 3, '#b07a3a'); },
  books: (c, x, y) => { for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(x - 26 + i * 13, y - 20 + (i % 2) * 4, 11, 38 - (i % 2) * 4); fs(c, ['#e05a4a', '#4a8ad0', '#f2c531', '#5aa05a'][i], 2); } },
  flowers: (c, x, y) => { for (let i = 0; i < 3; i++) { line(c, [x - 12 + i * 12, y + 20, x - 12 + i * 12, y - 6], 3, '#4a8a3a'); circle(c, x - 12 + i * 12, y - 12, 9); fs(c, ['#e05a7a', '#f2c531', '#9b7fd6'][i], 2); } },
  barber: (c, x, y) => { c.beginPath(); c.rect(x - 9, y - 26, 18, 52); fs(c, '#fff', 3); c.save(); c.beginPath(); c.rect(x - 9, y - 26, 18, 52); c.clip(); for (let i = -3; i < 4; i++) line(c, [x - 12, y + i * 14 - 6, x + 12, y + i * 14 + 6], 5, i % 2 ? '#d23a3a' : '#3a5ad2'); c.restore(); },
};
function cShop(c, x, y0, w, h, kind, awn, o) {
  // y0 = ground; h = ground-floor height
  c.beginPath(); c.rect(x, y0 - h, w, h); fs(c, shade(o.col, -.12), 3);
  const sx = x + 26, sw = w - 52;
  // sign board with icon (no text)
  c.beginPath(); c.rect(sx, y0 - h + 26, sw, 70); fs(c, awn[0], 3); c.beginPath(); c.rect(sx + 8, y0 - h + 34, sw - 16, 54); fs(c, null, 2, 'rgba(255,255,255,.6)');
  SHOP_ICONS[kind](c, x + w / 2, y0 - h + 61);
  // awning (scalloped stripes)
  const ay = y0 - h + 110, ah = 70;
  c.beginPath(); c.moveTo(sx - 18, ay); c.lineTo(sx + sw + 18, ay); c.lineTo(sx + sw + 36, ay + ah); c.lineTo(sx - 36, ay + ah); c.closePath(); c.fillStyle = awn[1]; c.fill();
  c.save(); c.clip(); const n = 10; for (let i = 0; i < n; i += 2) { const a = sx - 36 + i * (sw + 72) / n; c.beginPath(); c.moveTo(sx - 18 + i * (sw + 36) / n, ay); c.lineTo(sx - 18 + (i + 1) * (sw + 36) / n, ay); c.lineTo(a + (sw + 72) / n, ay + ah); c.lineTo(a, ay + ah); c.fillStyle = awn[0]; c.fill(); } c.restore();
  c.beginPath(); c.moveTo(sx - 18, ay); c.lineTo(sx + sw + 18, ay); c.lineTo(sx + sw + 36, ay + ah); c.lineTo(sx - 36, ay + ah); c.closePath(); fs(c, null, 3);
  for (let i = 0; i < 10; i++) { const a = sx - 36 + i * (sw + 72) / 10; c.beginPath(); c.arc(a + (sw + 72) / 20, ay + ah, (sw + 72) / 20, 0, Math.PI); fs(c, i % 2 ? awn[1] : awn[0], 3); }
  c.fillStyle = 'rgba(20,20,40,.18)'; c.fillRect(sx, ay + ah, sw, 40);
  // shop window + door
  const wy = ay + ah + 26, wh = y0 - 40 - wy, dw = Math.min(150, sw * .3), ww = sw - dw - 20;
  c.beginPath(); c.rect(sx, wy, ww, wh); fs(c, o.night ? '#ffd98a' : '#a9d0e6', 3);
  c.save(); c.beginPath(); c.rect(sx, wy, ww, wh); c.clip();
  // goods on shelves
  for (let r = 0; r < 2; r++) { line(c, [sx, wy + wh * (.45 + r * .4), sx + ww, wy + wh * (.45 + r * .4)], 4, '#8a6a4a'); for (let i = 0; i < 6; i++) { const gx = sx + 20 + i * (ww - 40) / 5, gy = wy + wh * (.45 + r * .4); c.beginPath(); if (kind === 'books') c.rect(gx - 10, gy - 44, 18, 44); else if (kind === 'bakery') c.ellipse(gx, gy - 14, 22, 14, 0, 0, Math.PI * 2); else c.arc(gx, gy - 18, 16, 0, Math.PI * 2); fs(c, ['#e05a4a', '#f2c531', '#5aa05a', '#4a8ad0', '#f2a0b0', '#d9a066'][(i + r) % 6], 2); } }
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(sx + ww * .15, wy); c.lineTo(sx + ww * .4, wy); c.lineTo(sx + ww * .1, wy + wh); c.lineTo(sx - ww * .15, wy + wh); c.fill();
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(sx + ww * .55, wy); c.lineTo(sx + ww * .62, wy); c.lineTo(sx + ww * .42, wy + wh); c.lineTo(sx + ww * .35, wy + wh); c.fill();
  c.restore();
  if (o.night) bloom(c, sx + ww / 2, wy + wh / 2, ww * .8, '255,200,120', .4);
  const dx = sx + ww + 20; c.beginPath(); c.rect(dx, wy - 10, dw, y0 - wy + 10); fs(c, shade(awn[0], -.25), 3); c.beginPath(); c.rect(dx + 16, wy + 8, dw - 32, (y0 - wy) * .55); fs(c, o.night ? '#ffd98a' : '#bcdcee', 2); circle(c, dx + dw - 22, y0 - (y0 - wy) * .4, 6); fs(c, '#e8c24a', 2);
  c.beginPath(); c.rect(sx - 6, y0 - 40, sw + 12, 40); fs(c, shade(o.col, -.3), 3);
  // wall lamp
  line(c, [x + 10, ay - 30, x + 34, ay - 30], 4); c.beginPath(); c.moveTo(x + 24, ay - 30); c.lineTo(x + 44, ay - 30); c.lineTo(x + 40, ay - 6); c.lineTo(x + 28, ay - 6); c.closePath(); fs(c, '#3a3a44', 2);
  if (o.night) bloom(c, x + 34, ay - 6, 90, '255,210,140', .6);
}
function cBuilding(c, x, y0, w, floors, o) {
  const fh = 300, gh = 420, top = y0 - gh - floors * fh, col = o.col;
  c.beginPath(); c.rect(x, top, w, y0 - top); fs(c, col, 3);
  c.save(); c.beginPath(); c.rect(x, top, w, y0 - top); c.clip();
  if (o.brick) for (let r = 0; r < (y0 - top) / 22; r++) for (let k = 0; k < w / 52 + 1; k++) { if (rnd(r * 31 + k + o.seed) > .35) continue; c.fillStyle = shade(col, rnd(r * 7 + k) > .5 ? -.08 : .06); c.fillRect(x + k * 52 - (r % 2) * 26, top + r * 22, 48, 18); }
  c.fillStyle = 'rgba(30,30,60,.12)'; c.fillRect(x + w * .82, top, w * .18, y0 - top); // side shade
  c.restore();
  // cornices between floors + roof
  for (let f = 0; f <= floors; f++) { const yy = y0 - gh - f * fh; c.beginPath(); c.rect(x - 8, yy - 14, w + 16, 16); fs(c, shade(col, .18), 2); }
  c.beginPath(); c.rect(x - 16, top - 30, w + 32, 30); fs(c, shade(col, -.2), 3); for (let i = 0; i < w / 40; i++) { c.beginPath(); c.rect(x - 10 + i * 40, top - 2, 22, 14); fs(c, shade(col, .1), 1.5); }
  // windows / balconies
  const nw = Math.max(2, Math.floor(w / 180)), ww = 92, gap = (w - nw * ww) / (nw + 1);
  for (let f = 0; f < floors; f++) for (let i = 0; i < nw; i++) {
    const wx = x + gap + i * (ww + gap), wy = y0 - gh - (f + 1) * fh + 70;
    cWin(c, wx, wy, ww, 170, { seed: o.seed * 17 + f * 5 + i, night: o.night, ac: true });
    if (rnd(o.seed + f * 3 + i + 90) > .72) { c.beginPath(); c.rect(wx - 22, wy + 170, ww + 44, 12); fs(c, '#444650', 2); for (let k = 0; k <= 7; k++) line(c, [wx - 18 + k * (ww + 36) / 7, wy + 172, wx - 18 + k * (ww + 36) / 7, wy + 120], 3, '#444650'); line(c, [wx - 22, wy + 118, wx + ww + 22, wy + 118], 4, '#444650'); }
  }
  // drain pipe
  line(c, [x + w - 14, top, x + w - 14, y0], 7, shade(col, -.35)); for (let k = 0; k < floors + 1; k++) { c.beginPath(); c.rect(x + w - 20, y0 - gh - k * fh + 40, 12, 8); fs(c, shade(col, -.35)); }
  // rooftop details
  if (rnd(o.seed + 7) > .5) { c.beginPath(); c.rect(x + w * .2, top - 110, 90, 80); fs(c, '#8a6a52', 3); c.beginPath(); c.moveTo(x + w * .2 - 6, top - 110); c.lineTo(x + w * .2 + 45, top - 150); c.lineTo(x + w * .2 + 96, top - 110); c.closePath(); fs(c, '#6a4a3a', 3); }
  else { line(c, [x + w * .7, top - 30, x + w * .7, top - 170], 4); line(c, [x + w * .7 - 30, top - 140, x + w * .7 + 30, top - 140], 3); line(c, [x + w * .7 - 20, top - 115, x + w * .7 + 20, top - 115], 3); }
  cShop(c, x, y0, w, gh, o.kind, o.awn, o);
}
function streetLamp(c, x, on = false, y = 0) {
  c.beginPath(); c.rect(x - 16, y - 40, 32, 40); fs(c, '#2f3540', 3);
  line(c, [x, y - 40, x, y - 560], 12); line(c, [x, y - 40, x, y - 560], 6, '#3a4250');
  c.beginPath(); c.arc(x + 30, y - 560, 30, Math.PI, Math.PI * 1.5); c.lineWidth = 10; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#3a4250'; c.stroke();
  c.beginPath(); c.moveTo(x + 22, y - 590); c.lineTo(x + 70, y - 590); c.lineTo(x + 80, y - 560); c.lineTo(x + 12, y - 560); c.closePath(); fs(c, '#3a4250', 3);
  ell(c, x + 46, y - 556, 26, 8); fs(c, on ? '#fff2c0' : '#e8e4d6', 2);
  if (on) { bloom(c, x + 46, y - 540, 260, '255,220,150', .7); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, y - 556, 0, y); g.addColorStop(0, 'rgba(255,220,150,.35)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 24, y - 556); c.lineTo(x + 68, y - 556); c.lineTo(x + 200, y); c.lineTo(x - 110, y); c.closePath(); c.fill(); c.restore(); }
}
function streetTree(c, x, P) {
  c.beginPath(); c.rect(x - 70, -6, 140, 12); fs(c, '#4a4a52', 2); for (let i = 0; i < 6; i++) line(c, [x - 60 + i * 24, -4, x - 60 + i * 24, 4], 2, '#2a2a30');
  line(c, [x, 0, x - 8, -300], 30); line(c, [x, 0, x - 8, -300], 22, P.trunk); line(c, [x - 6, -200, x + 70, -300], 16); line(c, [x - 6, -200, x + 70, -300], 10, P.trunk);
  fCanopy(c, x - 10, -440, 210, P, x | 0, -1, 3); fCanopy(c, x + 110, -360, 110, P, (x | 0) + 7, -1, 3);
}
function bench(c, x) {
  for (const s of [-1, 1]) { line(c, [x + s * 110, 0, x + s * 100, -70], 10); line(c, [x + s * 110, 0, x + s * 100, -70], 5, '#3a3a40'); }
  for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(x - 140, -80 - i * 16, 280, 12); fs(c, '#a8703c', 2); }
  for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(x - 140, -150 - i * 18, 280, 13); fs(c, '#a8703c', 2); }
  for (const s of [-1, 1]) line(c, [x + s * 120, -78, x + s * 125, -200], 7, '#3a3a40');
}
function hydrant(c, x) { c.beginPath(); c.rect(x - 22, -110, 44, 110); fs(c, '#d23a3a', 3); c.beginPath(); c.arc(x, -110, 24, Math.PI, 0); fs(c, '#d23a3a', 3); c.beginPath(); c.rect(x - 36, -80, 72, 22); fs(c, '#b02a2a', 3); circle(c, x, -140, 8); fs(c, '#b02a2a', 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 14, -125, 6, 110); }
function bin(c, x) { c.beginPath(); c.moveTo(x - 40, -150); c.lineTo(x + 40, -150); c.lineTo(x + 34, 0); c.lineTo(x - 34, 0); c.closePath(); fs(c, '#3f6a4a', 3); for (let i = 0; i < 4; i++) line(c, [x - 26 + i * 17, -140, x - 22 + i * 15, -10], 2.5, '#2f5a3a'); c.beginPath(); c.rect(x - 46, -166, 92, 18); fs(c, '#2f5a3a', 3); }
function bike(c, x) {
  for (const s of [-1, 1]) { circle(c, x + s * 90, -60, 58); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); circle(c, x + s * 90, -60, 58); c.lineWidth = 4; c.strokeStyle = '#555'; c.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI; line(c, [x + s * 90 - Math.cos(a) * 56, -60 - Math.sin(a) * 56, x + s * 90 + Math.cos(a) * 56, -60 + Math.sin(a) * 56], 1.5, '#888'); } }
  const fr = '#2f7fc8'; for (const p of [[-90, -60, -10, -60], [-10, -60, 60, -150], [-90, -60, -30, -150], [-30, -150, 60, -150], [60, -150, 90, -60], [-30, -150, -10, -60]]) { line(c, [x + p[0], p[1], x + p[2], p[3]], 10); line(c, [x + p[0], p[1], x + p[2], p[3]], 6, fr); }
  line(c, [x - 30, -150, x - 38, -180], 6); ell(c, x - 40, -184, 26, 8); fs(c, '#2a2a2a', 2); line(c, [x + 60, -150, x + 50, -200], 6); line(c, [x + 30, -200, x + 72, -205], 7);
}
function car(c, x, o = {}) {
  const col = o.color || '#d2453a'; c.save(); c.translate(x, 0); c.scale(o.s || 1, 1);
  c.beginPath(); c.moveTo(-340, -70); c.lineTo(-345, -170); c.quadraticCurveTo(-330, -200, -250, -210); c.lineTo(-160, -215); c.quadraticCurveTo(-110, -300, -40, -310); c.lineTo(140, -310); c.quadraticCurveTo(200, -300, 250, -220); c.lineTo(320, -205); c.quadraticCurveTo(355, -195, 355, -150); c.lineTo(350, -70); c.closePath(); fs(c, col, 4);
  c.save(); c.clip(); c.fillStyle = shade(col, -.2); c.fillRect(-360, -120, 720, 60); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-340, -205, 690, 12); c.restore();
  c.beginPath(); c.moveTo(-140, -215); c.quadraticCurveTo(-100, -290, -40, -295); c.lineTo(40, -295); c.lineTo(40, -215); c.closePath(); fs(c, '#9fcbe2', 3);
  c.beginPath(); c.moveTo(60, -215); c.lineTo(60, -295); c.lineTo(135, -295); c.quadraticCurveTo(190, -285, 228, -215); c.closePath(); fs(c, '#9fcbe2', 3);
  c.save(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(-60, -292); c.lineTo(-30, -292); c.lineTo(-80, -218); c.lineTo(-110, -218); c.fill(); c.restore();
  line(c, [50, -300, 50, -80], 3); line(c, [-160, -210, -160, -80], 3); line(c, [240, -205, 240, -90], 3); for (const hx of [-120, 90]) { c.beginPath(); c.rect(hx, -190, 34, 9); fs(c, '#e8e8e8', 2); }
  ell(c, 340, -165, 16, 22); fs(c, '#fff3c0', 3); c.beginPath(); c.rect(-352, -180, 16, 36); fs(c, '#e03030', 3);
  c.beginPath(); c.rect(-355, -86, 80, 18); fs(c, '#cfcfd4', 2); c.beginPath(); c.rect(280, -86, 80, 18); fs(c, '#cfcfd4', 2);
  for (const wx of [-215, 215]) { c.beginPath(); c.arc(wx, -70, 95, Math.PI, 0); c.fillStyle = '#1a1a1e'; c.fill(); circle(c, wx, -60, 64); fs(c, '#2a2a2e', 4); circle(c, wx, -60, 34); fs(c, '#c9ccd4', 3); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; circle(c, wx + Math.cos(a) * 18, -60 + Math.sin(a) * 18, 5); fs(c, '#8a8e96'); } }
  c.restore();
}
function trafficLight(c, x, state = 'green') {
  line(c, [x, 0, x, -620], 14); line(c, [x, 0, x, -620], 7, '#3a4048');
  c.beginPath(); c.rect(x - 34, -800, 68, 190); fs(c, '#2a2e36', 3);
  ['red', 'yellow', 'green'].forEach((k, i) => { const on = k === state, col = { red: '#e33', yellow: '#fc3', green: '#3d6' }[k]; circle(c, x, -770 + i * 60, 22); fs(c, on ? col : shade(col, -.65), 3); if (on) bloom(c, x, -770 + i * 60, 90, k === 'red' ? '255,80,60' : k === 'yellow' ? '255,210,60' : '80,255,120', .6); });
}
function pigeon(c, x, t = 0, y = 0) { const b = Math.abs(Math.sin(t * 6 + x)) * 6; ell(c, x, y - 26 - b, 30, 20); fs(c, '#8a8e9e', 3); circle(c, x + 26, y - 46 - b, 13); fs(c, '#6a6e80', 3); c.beginPath(); c.moveTo(x + 37, y - 46 - b); c.lineTo(x + 48, y - 42 - b); c.lineTo(x + 37, y - 40 - b); fs(c, '#e8a040', 2); circle(c, x + 29, y - 49 - b, 3); fs(c, OUT); ell(c, x - 6, y - 30 - b, 20, 10); fs(c, '#a0a6b8', 2); line(c, [x - 4, y - 8 - b, x - 6, y], 3, '#d07040'); line(c, [x + 8, y - 8 - b, x + 8, y], 3, '#d07040'); }
function city(c, cam, t, o = {}) {
  const tod = o.tod || 'golden', P = CITY[tod], S = o.seed || 0, HZ = -260, night = tod === 'night';
  const B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.sky[0]); g.addColorStop(.8, P.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .03, c => {
    const b = B(.03), [sx, sy] = [P.sun[0], b + P.sun[1] * .9];
    if (night) { for (let i = 0; i < 120; i++) { circle(c, -2400 + rnd(i) * 4800, b - 1500 + rnd(i + 40) * 1000, 1.5 + rnd(i + 80) * 2); c.fillStyle = 'rgba(250,248,225,.8)'; c.fill(); } circle(c, sx, sy, 60); fs(c, '#f4efd2'); bloom(c, sx, sy, 300, '200,215,255', .4); }
    else { bloom(c, sx, sy, 900, P.warm, .9); circle(c, sx, sy, 90); c.fillStyle = '#fff3cf'; c.fill(); for (let i = 0; i < 6; i++) { const x = -2400 + i * 900 + rnd(i + 300) * 300, y = b - 1300 + rnd(i + 310) * 400; c.fillStyle = tod === 'golden' ? 'rgba(255,200,170,.85)' : 'rgba(255,255,255,.9)'; for (const [dx, dy, r] of [[0, 0, 60], [70, -25, 80], [150, 0, 55]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, Math.PI * 2); c.fill(); } } }
    LIGHT.sun = [sx, sy];
  });
  layer(c, cam, .12, c => { const b = B(.12); for (let i = 0; i < 50; i++) { const x = -4000 + i * 165 + rnd(i + S) * 60, w = 110 + rnd(i + 20) * 90, h = 350 + rnd(i + 40) * 650; c.fillStyle = P.far; c.fillRect(x, b - h, w, h); if (rnd(i + 70) > .7) { c.fillRect(x + w / 2 - 3, b - h - 90, 6, 90); } c.fillStyle = night ? 'rgba(255,220,140,.5)' : 'rgba(255,255,255,.18)'; for (let r = 0; r < h / 50 - 1; r++) for (let k = 0; k < w / 30 - 1; k++) if (rnd(i * 97 + r * 13 + k) > (night ? .7 : .5)) c.fillRect(x + 10 + k * 30, b - h + 20 + r * 50, 14, 22); } });
  haze(c, P.fog, .3);
  layer(c, cam, .35, c => { const b = B(.35); for (let i = 0; i < 26; i++) { const x = -3800 + i * 300 + rnd(i + 100 + S) * 80, w = 240 + rnd(i + 120) * 140, h = 500 + rnd(i + 140) * 600, col = P.mid[i % 4]; c.beginPath(); c.rect(x, b - h, w, h); fs(c, col, 2); c.fillStyle = shade(col, -.15); c.fillRect(x + w * .75, b - h, w * .25, h); for (let r = 0; r < h / 70 - 1; r++) for (let k = 0; k < w / 50 - 1; k++) { c.fillStyle = night ? (rnd(i * 31 + r * 7 + k) > .6 ? '#ffd98a' : '#283050') : 'rgba(170,210,235,.8)'; c.fillRect(x + 16 + k * 50, b - h + 26 + r * 70, 26, 36); } if (i % 3 === 0) { c.beginPath(); c.rect(x + 30, b - h - 70, 60, 60); fs(c, '#7a6050', 2); } } });
  haze(c, P.fog, .14);
  layer(c, cam, .85, c => {
    const b = B(.85) + 6, kinds = ['cafe', 'bakery', 'books', 'flowers', 'barber'], awns = [['#c8323a', '#f4efe2'], ['#2f7f5a', '#f4efe2'], ['#2f5f9f', '#f4efe2'], ['#d9842f', '#f4efe2'], ['#6a3f8f', '#f4efe2']];
    let x = -2600; let i = 0; while (x < 2800) { const w = 560 + rnd(i + 30 + S) * 260; cBuilding(c, x, b, w, 3 + Math.floor(rnd(i + 40 + S) * 3), { col: FACADES[(i + S) % FACADES.length], brick: i % 2 === 0, seed: i + S * 9, kind: kinds[i % 5], awn: awns[(i + 2) % 5], night }); x += w; i++; }
  });
  layer(c, cam, 1, c => {
    // sidewalk tiles, curb, road
    c.fillStyle = night ? '#55586a' : '#c9c2b6'; c.fillRect(-6000, HZ, 12000, 340);
    for (let r = 0; r < 4; r++) for (let k = -60; k < 60; k++) { c.beginPath(); c.rect(k * 110 + (r % 2) * 55, HZ + r * 80, 110, 80); c.lineWidth = 2; c.strokeStyle = night ? '#44475a' : '#a9a294'; c.stroke(); }
    c.beginPath(); c.rect(-6000, HZ + 330, 12000, 26); fs(c, night ? '#6a6d80' : '#e2ddd2', 2);
    c.fillStyle = night ? '#24252e' : '#4a4b52'; c.fillRect(-6000, HZ + 356, 12000, 2000);
    for (let k = -30; k < 30; k++) { c.fillStyle = '#efe6c8'; c.fillRect(k * 300, HZ + 640, 160, 16); }
    for (let k = 0; k < 8; k++) { c.fillStyle = '#ece8e0'; c.fillRect(900 + k * 60, HZ + 380, 36, 240); }
    ell(c, -700, HZ + 140, 70, 18); fs(c, '#6a6a70', 2); for (let k = -2; k <= 2; k++) line(c, [-700 + k * 22, HZ + 128, -700 + k * 22, HZ + 152], 2, '#4a4a50');
  });
  return { base: '#4a4b52', tint: null };
}
function cityLight(c, cam, t, o = {}) {
  const tod = o.tod || 'golden', P = CITY[tod];
  layer(c, cam, 1, c => {
    if (tod !== 'night') { sunRays(c, cam.x - 1400, cam.y - 700, { n: 9, len: 3200, spread: .5, dir: .42, color: P.ray, alpha: P.rayA, t }); motes(c, cam.x - 1000, cam.x + 1000, cam.y - 500, cam.y + 450, t, { n: 35, color: '255,235,200' }); }
  });
  grade(c, tod === 'night' ? { sx: .5, sy: 1, warm: '255,190,120', warmA: .18, cool: '15,15,50', coolA: .35 } : tod === 'golden' ? { sx: 0, sy: .2, warm: '255,160,80', warmA: .45, cool: '40,30,90', coolA: .28 } : { sx: .1, sy: 0, warmA: .25, coolA: .15 });
}
