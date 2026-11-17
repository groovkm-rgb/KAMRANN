// STONE AGE places for Noah films (toon-shorts engine: needs layer, fs, line, ell, circle, rnd, shade, W, H).
//   set:   stoneAgeForest  (night forest clearing, cave cliff, layered trees, ferns)   opts { tod: 'night' | 'dusk' }
//   props: campfire(c, x, t, s), fireGlow(c, x, t, k), logSeat(c, x, w), rock(c, x, y, r, seed), fern(c, x, y, s, seed), bonePile(c, x)
// stoneAgeForest(..., { tod: 'night' | 'day' | 'dusk', cave: true | false, caveX }) — with cave:false and tod:'day' it is a plain sunny forest.
const STONE = {
  night: { sky: '#17233d', sky2: '#22335a', far: '#1f3b44', farLeaf: '#1b3439', mid: '#2a4a3c', midLeaf: '#26503d', trunk: '#4e3626', ground: '#2f4a2b', grass: '#3d6034', rock: '#6d6a72', cliff: '#4d4a55' },
  day:   { sky: '#8fd0ee', sky2: '#bfe6f5', far: '#7fae8a', farLeaf: '#8cc08a', mid: '#5f9a5a', midLeaf: '#6fb05e', trunk: '#7a5236', ground: '#79b04e', grass: '#8cc45a', rock: '#9a96a0', cliff: '#9a8f94' },
  dusk:  { sky: '#e08a5a', sky2: '#f2b27a', far: '#7a6a7e', farLeaf: '#6a5c72', mid: '#4f6a4a', midLeaf: '#5a7a4a', trunk: '#5e3f2a', ground: '#4f6a34', grass: '#6a8a3e', rock: '#8a8288', cliff: '#7a6e72' },
};
function stoneTree(c, x, base, h, w, trunk, leaf, seed, lw = 7) {
  c.beginPath(); c.moveTo(x - w * .6, base); c.quadraticCurveTo(x - w * .45, base - h * .5, x - w * .35, base - h); c.lineTo(x + w * .35, base - h); c.quadraticCurveTo(x + w * .45, base - h * .5, x + w * .6, base); c.closePath(); fs(c, trunk, lw);
  for (let i = 0; i < 3; i++) line(c, [x - w * .2 + i * w * .2, base - 20 - rnd(seed + i) * 60, x - w * .15 + i * w * .2, base - h * (.4 + rnd(seed + i + 9) * .3)], 4, shade(trunk, -.25));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, r = w * (1.3 + rnd(seed + i * 3) * .5); circle(c, x + Math.cos(a) * w * 1.3, base - h - w * .6 + Math.sin(a) * w * .8, r); fs(c, leaf, lw); }
  circle(c, x, base - h - w * .6, w * 1.7); fs(c, leaf);
}
function fern(c, x, y, s = 1, seed = 0, col = '#3f7a3c') {
  for (let i = -3; i <= 3; i++) {
    const a = -Math.PI / 2 + i * .32 + (rnd(seed + i) - .5) * .15, L = (90 + rnd(seed + i + 7) * 50) * s;
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * L * .5 + i * 6, y + Math.sin(a) * L * .7, ex, ey); c.lineWidth = 16 * s; c.strokeStyle = OUT; c.lineCap = 'round'; c.stroke(); c.lineWidth = 9 * s; c.strokeStyle = col; c.stroke();
  }
}
function rock(c, x, y, r, seed = 0, col = '#6d6a72') {
  c.beginPath(); for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI, rr = r * (.8 + rnd(seed + i) * .3); const px = x + Math.cos(a) * rr * 1.3, py = y + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); fs(c, col, 6);
  c.beginPath(); c.moveTo(x - r * .6, y - r * .5); c.quadraticCurveTo(x, y - r * .85, x + r * .5, y - r * .55); c.lineWidth = 5; c.strokeStyle = shade(col, .25); c.stroke();
}
function stoneAgeForest(c, cam, t, o = {}) {
  const P = STONE[o.tod || 'night'];
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = P.sky; c.fillRect(0, 0, W, H);
  layer(c, cam, .1, c => {
    c.fillStyle = P.sky2; c.fillRect(-3000, -1400, 6000, 900);
    if ((o.tod || 'night') === 'night') { for (let i = 0; i < 70; i++) { circle(c, -1500 + rnd(i) * 3000, -2600 + rnd(i + 40) * 1900, 2 + rnd(i + 80) * 3); fs(c, '#f4f1d8'); } circle(c, 260, -2050, 95); fs(c, '#f4efd2', 6); circle(c, 225, -2075, 22); fs(c, '#e2dcbc'); circle(c, 290, -2010, 14); fs(c, '#e2dcbc'); }
    else { circle(c, -200, -1700, 120); fs(c, (o.tod === 'day') ? '#fff3b0' : '#ffe0a0'); if (o.tod === 'day') for (let i = 0; i < 5; i++) { const x = -1200 + i * 600, y = -2100 + rnd(i + 300) * 400; for (const [dx, r] of [[0, 70], [70, 90], [150, 65]]) { circle(c, x + dx, y, r); fs(c, '#ffffff'); } } }
  });
  layer(c, cam, .3, c => {
    // cave cliff with a dark opening on the left
    for (let i = 0; i < 12; i++) stoneTree(c, -1400 + i * 240 + rnd(i) * 80, -150, 480 + rnd(i + 5) * 300, 50, P.far, P.farLeaf, i * 7, 6);
    const cx = o.caveX ?? 250;
    if (o.cave !== false) {
    c.beginPath(); c.moveTo(cx - 60, -150); c.quadraticCurveTo(cx - 40, -700, cx + 250, -880); c.quadraticCurveTo(cx + 700, -1050, cx + 1200, -900); c.lineTo(cx + 2200, -900); c.lineTo(cx + 2200, -150); c.closePath(); fs(c, P.cliff, 7);
    for (let i = 0; i < 6; i++) line(c, [cx + 120 + i * 150, -760 + rnd(i) * 80, cx + 180 + i * 150, -560 + rnd(i + 3) * 80], 5, shade(P.cliff, -.2));
    c.beginPath(); c.moveTo(cx + 200, -150); c.quadraticCurveTo(cx + 190, -560, cx + 420, -580); c.quadraticCurveTo(cx + 640, -560, cx + 640, -150); c.closePath(); fs(c, '#120e14', 6);
    }
    for (let i = 0; i < 30; i++) { circle(c, -2000 + i * 140, -150, 70 + rnd(i + 50) * 40); fs(c, P.farLeaf, 5); }
  });
  layer(c, cam, .55, c => {
    for (let i = 0; i < 9; i++) { if (i === 5) continue; stoneTree(c, -1500 + i * 360 + rnd(i + 20) * 120, -150, 650 + rnd(i + 25) * 300, 75, shade(P.trunk, -.25), P.midLeaf, i * 11 + 3, 7); }
    for (let i = 0; i < 24; i++) { circle(c, -1800 + i * 160, -140, 60 + rnd(i + 90) * 50); fs(c, shade(P.midLeaf, .05), 6); }
  });
  layer(c, cam, .75, c => {
    c.fillStyle = P.ground; c.fillRect(-4000, -150, 8000, 6000);
    c.beginPath(); c.moveTo(-4000, -150); for (let x = -4000; x <= 4000; x += 90) c.lineTo(x, -150 - (x / 90 % 2 ? 22 : 0)); c.lineTo(4000, -100); c.lineTo(-4000, -100); c.closePath(); fs(c, P.grass);
    stoneTree(c, -760, -60, 1500, 130, P.trunk, P.mid, 101, 8);
    stoneTree(c, 900, -60, 1700, 150, P.trunk, P.mid, 131, 8);
    for (let i = 0; i < 10; i++) fern(c, -1400 + i * 300 + rnd(i + 60) * 100, -120, .9 + rnd(i + 70) * .4, i * 5, '#3a6e38');
    rock(c, 560, -110, 70, 3, P.rock); rock(c, -520, -100, 55, 9, P.rock);
  });
  layer(c, cam, 1, c => {
    for (let i = 0; i < 40; i++) { const x = -1500 + rnd(i + 100) * 3000, y = 40 + rnd(i + 140) * 500; for (let k = -1; k <= 1; k++) line(c, [x, y, x + k * 10, y - 30], 4, P.grass); }
    for (let i = 0; i < 18; i++) { ell(c, -1300 + rnd(i + 200) * 2600, 60 + rnd(i + 230) * 450, 14, 8); fs(c, P.rock, 3); }
  });
  return { base: P.ground, tint: null };
}
function logSeat(c, x, w = 380, h = 150) {
  rrect(c, x - w / 2, -h, w, h, h / 2); fs(c, '#6e4a2c', 8);
  for (let i = 0; i < 4; i++) line(c, [x - w / 2 + 50 + i * 80, -h + 25 + (i % 2) * 20, x - w / 2 + 110 + i * 80, -h + 30 + (i % 2) * 20], 5, '#4f321c');
  ell(c, x + w / 2 - h / 2 + 4, -h / 2, h * .38, h / 2 - 4); fs(c, '#d9b07a', 6); ell(c, x + w / 2 - h / 2 + 4, -h / 2, h * .2, h * .27); fs(c, null, 4, '#a87a48');
}
function campfire(c, x, t, s = 1) {
  c.save(); c.translate(x, 0); c.scale(s, s);
  for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; rock(c, Math.cos(a) * 150, 10 + Math.sin(a) * -30 * 0 + (i % 2) * 6, 34, i * 3, '#7a767e'); }
  for (const r of [-.45, .45, 0]) { c.save(); c.translate(0, -30); c.rotate(r); rrect(c, -140, -20, 280, 40, 20); fs(c, '#6e4a2c', 7); c.restore(); }
  const fl = (sc, col, ph) => {
    const f = 1 + Math.sin(t * 11 + ph) * .08 + Math.sin(t * 17 + ph * 2) * .05, sway = Math.sin(t * 7 + ph) * 14;
    c.beginPath(); c.moveTo(-95 * sc, -30); c.quadraticCurveTo(-120 * sc, -150 * sc * f, sway - 20 * sc, -250 * sc * f);
    c.quadraticCurveTo(-10 * sc, -170 * sc * f, 0, -330 * sc * f + sway * .3); c.quadraticCurveTo(20 * sc, -180 * sc * f, sway + 40 * sc, -240 * sc * f);
    c.quadraticCurveTo(120 * sc, -140 * sc * f, 95 * sc, -30); c.closePath(); return col;
  };
  fs(c, fl(1, 0, 0) || '#e2492b', 7); c.fillStyle = '#e2492b'; c.fill(); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke();
  fl(.72, 0, 1.3); c.fillStyle = '#f59a2e'; c.fill();
  fl(.42, 0, 2.1); c.fillStyle = '#ffe17a'; c.fill();
  for (let i = 0; i < 8; i++) { const ph = (t * .9 + rnd(i)) % 1; circle(c, (rnd(i + 9) - .5) * 160 + Math.sin(t * 3 + i) * 20, -120 - ph * 420, 6 * (1 - ph) + 2); fs(c, `rgba(255,200,90,${1 - ph})`); }
  c.restore();
}
function fireGlow(c, x, t, k = 1) {
  const r = 1100 + Math.sin(t * 9) * 30, y = -220;
  const g = c.createRadialGradient(x, y, 40, x, y, r); g.addColorStop(0, `rgba(255,170,70,${.32 * k})`); g.addColorStop(.35, `rgba(255,140,60,${.12 * k})`); g.addColorStop(1, 'rgba(255,140,60,0)');
  c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
function bonePile(c, x) {
  for (const [dx, a] of [[-30, .3], [20, -.4], [0, 0]]) { c.save(); c.translate(x + dx, -14); c.rotate(a); line(c, [-50, 0, 50, 0], 22); line(c, [-50, 0, 50, 0], 12, '#efe6cf'); for (const e of [-1, 1]) { circle(c, e * 52, -8, 13); fs(c, '#efe6cf', 6); circle(c, e * 52, 8, 13); fs(c, '#efe6cf', 6); } c.restore(); }
}
function spear(c, x, lean = .12, len = 900) {
  c.save(); c.translate(x, 0); c.rotate(lean);
  line(c, [0, 0, 0, -len], 22); line(c, [0, 0, 0, -len], 12, '#9a6a3c');
  c.beginPath(); c.moveTo(-26, -len + 10); c.lineTo(0, -len - 110); c.lineTo(26, -len + 10); c.closePath(); fs(c, '#8d8a94', 6);
  line(c, [-20, -len + 20, 20, -len - 10], 8, '#c9a46a'); line(c, [-20, -len - 10, 20, -len + 20], 8, '#c9a46a');
  c.restore();
}
const forestSet = (c, cam, t, o = {}) => stoneAgeForest(c, cam, t, Object.assign({ tod: 'day', cave: false }, o));
