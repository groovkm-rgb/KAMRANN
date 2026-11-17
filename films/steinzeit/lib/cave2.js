// CINEMATIC ROCK SHELTER / CAVE (world space: floor y = 0, 1 m ≈ 220 units, Noah at k .25).
// caveSet2(c, cam, t, o) — set function. o: { mouthX (world x of the mouth's left edge), outside: 'dawn'|'day'|'dusk'|'night' }
// Lighting is NOT baked in: call caveLights(c, cam, t, o) in `screen` (fire + mouth light + ambient through lightMap).
const CV = { rock: '#8b7a6c', rockD: '#5e5047', rockL: '#b09c88', floor: '#6f5a48', floorD: '#4d3d31', HZ: -40 };

function rockMass(c, x0, x1, yTop, yBot, seed, o = {}) {
  // stratified rock: base gradient, horizontal strata, boulder facets, cracks, wet glints
  const g = c.createLinearGradient(0, yTop, 0, yBot); g.addColorStop(0, o.top || '#6d5f55'); g.addColorStop(.5, o.mid || CV.rock); g.addColorStop(1, o.bot || '#6a5a4e');
  c.fillStyle = g; c.fillRect(x0, yTop, x1 - x0, yBot - yTop);
  // strata bands
  for (let i = 0; i < 26; i++) {
    const y = yTop + (i + rnd(seed + i) * .6) * (yBot - yTop) / 26, a = .05 + rnd(seed + i + 40) * .09;
    c.beginPath(); c.moveTo(x0, y); for (let x = x0; x <= x1; x += 120) c.lineTo(x, y + Math.sin(x * .004 + i) * 14 + (rnd(seed + x + i) - .5) * 8);
    c.lineTo(x1, y + 22); c.lineTo(x0, y + 22); c.closePath(); c.fillStyle = i % 2 ? `rgba(40,28,22,${a})` : `rgba(220,200,170,${a * .6})`; c.fill();
  }
  // rounded boulder lumps (soft, lit from above), no hard polygons
  for (let i = 0; i < (o.n || 160); i++) {
    const x = x0 + rnd(seed + i * 2.3) * (x1 - x0), y = yTop + rnd(seed + i * 3.1) * (yBot - yTop), w = 40 + rnd(seed + i + 7) * 160, h = 20 + rnd(seed + i + 9) * 60;
    c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, rr = 1 + (rnd(seed + i * 11 + k) - .5) * .35; c.lineTo(x + Math.cos(a) * w * .5 * rr, y + Math.sin(a) * h * .5 * rr); } c.closePath();
    const fg = c.createLinearGradient(0, y - h * .5, 0, y + h * .5); fg.addColorStop(0, 'rgba(230,212,188,.13)'); fg.addColorStop(.55, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(25,16,12,.2)'); c.fillStyle = fg; c.fill();
  }
  // fine grain speckle
  for (let i = 0; i < 1400; i++) { const x = x0 + rnd(seed + i + 3000) * (x1 - x0), y = yTop + rnd(seed + i + 5000) * (yBot - yTop); c.fillStyle = i % 2 ? 'rgba(20,12,8,.18)' : 'rgba(240,225,200,.1)'; c.fillRect(x, y, 2 + rnd(i) * 3, 2 + rnd(i + 1) * 3); }
  // cracks
  c.lineCap = 'round';
  for (let i = 0; i < (o.cracks || 30); i++) {
    let x = x0 + rnd(seed + i + 500) * (x1 - x0), y = yTop + rnd(seed + i + 600) * (yBot - yTop); c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (rnd(seed + i * 9 + k) - .5) * 70; y += 20 + rnd(seed + i * 7 + k) * 40; c.lineTo(x, y); }
    c.lineWidth = 1.6; c.strokeStyle = 'rgba(25,16,12,.35)'; c.stroke();
  }
  // moist glints (they catch the fire light later)
  for (let i = 0; i < (o.wet || 50); i++) {
    const x = x0 + rnd(seed + i + 700) * (x1 - x0), y = yTop + rnd(seed + i + 800) * (yBot - yTop), L = 10 + rnd(seed + i + 900) * 40;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 2, y + L * .5, x - 1, y + L); c.lineWidth = 2 + rnd(seed + i) * 2; c.strokeStyle = 'rgba(255,245,225,.32)'; c.stroke();
  }
}
function stalactite(c, x, top, L, w, seed) {
  c.beginPath(); c.moveTo(x - w, top); c.bezierCurveTo(x - w * .7, top + L * .4, x - w * .2, top + L * .8, x + (rnd(seed) - .5) * 6, top + L); c.bezierCurveTo(x + w * .25, top + L * .8, x + w * .7, top + L * .4, x + w, top); c.closePath();
  const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, '#5a4c43'); g.addColorStop(.45, '#a8957f'); g.addColorStop(1, '#4e423a'); c.fillStyle = g; c.fill();
  c.lineWidth = 1.5; c.strokeStyle = 'rgba(30,20,15,.5)'; c.stroke();
  c.beginPath(); c.moveTo(x - w * .25, top + 6); c.quadraticCurveTo(x - w * .1, top + L * .5, x, top + L * .9); c.lineWidth = 2; c.strokeStyle = 'rgba(255,245,225,.35)'; c.stroke();
  // drip
  circle(c, x + (rnd(seed) - .5) * 6, top + L + 5, 2.5); c.fillStyle = 'rgba(230,240,255,.6)'; c.fill();
}
// outside view through the mouth (icy dawn steppe, distant glacier)
function outsideView(c, x0, x1, base, t, tod = 'dawn') {
  const P = {
    dawn: ['#7e98b8', '#c9d6e4', '#f4d9c0', '#e8eef6', '#aab8c8', '#d6e0ea'],
    day: ['#8fb7dc', '#cfe2f0', '#eef4f8', '#eef2f4', '#b8c4cc', '#dde4e2'],
    dusk: ['#3d4a72', '#c7788a', '#f2b27a', '#e9d6d0', '#7c7088', '#b8a8b0'],
    night: ['#0b1328', '#18264a', '#22335a', '#9fb0cc', '#2a3550', '#3c4a66'],
  }[tod];
  const g = c.createLinearGradient(0, base - 1300, 0, base); g.addColorStop(0, P[0]); g.addColorStop(.65, P[1]); g.addColorStop(1, P[2]); c.fillStyle = g; c.fillRect(x0, base - 1600, x1 - x0, 1700);
  // glacier + mountains
  c.beginPath(); c.moveTo(x0, base - 120); for (let i = 0; i <= 14; i++) { const x = x0 + (x1 - x0) * i / 14; c.lineTo(x, base - 160 - Math.abs(Math.sin(i * 1.3)) * 140 - rnd(i + 3) * 60); } c.lineTo(x1, base); c.lineTo(x0, base); c.closePath(); c.fillStyle = P[4]; c.fill();
  c.beginPath(); c.moveTo(x0, base - 90); for (let i = 0; i <= 10; i++) { const x = x0 + (x1 - x0) * i / 10; c.lineTo(x, base - 110 - Math.sin(i * .8) * 30); } c.lineTo(x1, base); c.lineTo(x0, base); c.closePath(); c.fillStyle = P[3]; c.fill();
  // steppe with snow patches
  c.fillStyle = P[5]; c.fillRect(x0, base - 60, x1 - x0, 200);
  for (let i = 0; i < 30; i++) { const x = x0 + rnd(i + 30) * (x1 - x0); ell(c, x, base - 30 + rnd(i + 31) * 60, 40 + rnd(i) * 70, 6); c.fillStyle = tod === 'night' ? 'rgba(160,180,210,.4)' : 'rgba(255,255,255,.55)'; c.fill(); }
  for (let i = 0; i < 60; i++) { const x = x0 + rnd(i + 90) * (x1 - x0), y = base - 40 + rnd(i + 91) * 100; line(c, [x, y, x + Math.sin(t * 2 + i) * 4, y - 14 - rnd(i) * 12], 2, tod === 'night' ? '#3a4458' : '#b9a77a'); }
  // falling / drifting snow
  for (let i = 0; i < 40; i++) { const ph = (t * .08 + rnd(i + 200)) % 1, x = x0 + ((rnd(i + 210) * (x1 - x0) + t * 40 + ph * 120) % (x1 - x0)), y = base - 900 + ph * 1000; circle(c, x, y, 2 + rnd(i) * 2.5); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill(); }
}
function mouthPath(c, mx, base) {
  c.moveTo(mx, base + 20); c.bezierCurveTo(mx - 40, base - 380, mx + 120, base - 640, mx + 420, base - 650);
  c.bezierCurveTo(mx + 800, base - 660, mx + 1100, base - 520, mx + 1500, base - 560); c.lineTo(mx + 1500, base + 20); c.closePath();
}
function caveSet2(c, cam, t, o = {}) {
  const mx = o.mouthX ?? 700, tod = o.outside || 'dawn', B = p => layerBase(cam, CV.HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2b221d'; c.fillRect(0, 0, W, H);
  // outside (far)
  layer(c, cam, .55, c => { const b = B(.55); outsideView(c, mx * .55 - 400, mx * .55 + 3000, b, t, tod); });
  // back wall with the mouth cut out, paintings, stalactites
  layer(c, cam, .82, c => {
    const b = B(.82), ox = mx * .82;
    c.save(); c.beginPath(); c.rect(-6000, b - 3200, 12000, 3300); mouthPath(c, ox, b); c.clip('evenodd');
    rockMass(c, -4000, ox + 3000, b - 2400, b + 30, 17, { n: 420, cracks: 70, wet: 120 });
    // painted wall section (ochre hands, charcoal animals)
    caveArt(c, ox - 1350, b - 420, .95, t);
    // dark recess toward the left
    const dg = c.createLinearGradient(ox - 2600, 0, ox - 300, 0); dg.addColorStop(0, 'rgba(10,6,8,.55)'); dg.addColorStop(1, 'rgba(10,6,8,0)'); c.fillStyle = dg; c.fillRect(-6000, b - 3200, 12000, 3300);
    c.restore();
    // mouth rim (lit lip)
    c.beginPath(); mouthPath(c, ox, b); c.lineWidth = 10; c.strokeStyle = 'rgba(30,20,15,.6)'; c.stroke(); c.lineWidth = 3; c.strokeStyle = 'rgba(200,220,240,.45)'; c.stroke();
    // icicles hanging in the mouth
    for (let i = 0; i < 10; i++) { const x = ox + 180 + i * 95, top = b - 640 + Math.abs(i - 3) * 6; c.beginPath(); c.moveTo(x - 7, top); c.lineTo(x, top + 30 + rnd(i + 3) * 60); c.lineTo(x + 7, top); c.closePath(); c.fillStyle = 'rgba(220,235,250,.85)'; c.fill(); }
    // stalactites from the ceiling
    for (let i = 0; i < 22; i++) { const x = ox - 2500 + i * 115 + rnd(i + 40) * 60; if (x > ox - 60) continue; stalactite(c, x, b - 1250, 120 + rnd(i + 50) * 260, 14 + rnd(i + 55) * 22, i); }
    // drying hide on a frame + hanging meat strips (camp detail)
    const hx = ox - 2100; line(c, [hx - 130, b + 10, hx - 110, b - 520], 12, '#4a3220'); line(c, [hx + 130, b + 10, hx + 110, b - 520], 12, '#4a3220'); line(c, [hx - 150, b - 500, hx + 150, b - 500], 12, '#4a3220');
    c.beginPath(); c.moveTo(hx - 100, b - 490); c.lineTo(hx + 100, b - 490); c.quadraticCurveTo(hx + 120, b - 330, hx + 90, b - 170); c.lineTo(hx - 90, b - 170); c.quadraticCurveTo(hx - 120, b - 330, hx - 100, b - 490); c.closePath();
    const hg = c.createLinearGradient(hx - 100, 0, hx + 100, 0); hg.addColorStop(0, '#9a7650'); hg.addColorStop(.5, '#c9a678'); hg.addColorStop(1, '#8a6642'); c.fillStyle = hg; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#3a2618'; c.stroke();
    for (let k = 0; k < 6; k++) { line(c, [hx - 100 + k * 40, b - 492, hx - 112 + k * 44, b - 505], 2, '#2a1a10'); }
    for (let k = 0; k < 5; k++) { const x = hx + 200 + k * 34; line(c, [x, b - 470, x + 2, b - 380 - rnd(k) * 40], 9, '#6a2a1e'); }
    line(c, [hx + 180, b - 472, hx + 370, b - 472], 6, '#4a3220');
  });
  // floor
  layer(c, cam, 1, c => {
    const HZ = CV.HZ, g = c.createLinearGradient(0, HZ - 10, 0, HZ + 700); g.addColorStop(0, '#5a493c'); g.addColorStop(1, '#3e3128'); c.fillStyle = g; c.fillRect(-6000, HZ - 10, 12000, 3000);
    for (let i = 0; i < 260; i++) { const k = rnd(i + 300), x = -3000 + rnd(i + 310) * 6000, y = HZ + 6 + k * k * 600; ell(c, x, y, 3 + k * 12, 1.5 + k * 5); c.fillStyle = rnd(i + 320) > .5 ? 'rgba(160,135,110,.35)' : 'rgba(25,18,14,.35)'; c.fill(); }
    for (let i = 0; i < 40; i++) { const x = -2500 + rnd(i + 390) * 5000, y = HZ + 20 + rnd(i + 395) * 400; line(c, [x, y, x + (rnd(i + 397) - .5) * 60, y - 4], 2.2, i % 2 ? '#a88a46' : '#7c6838'); }
    // snow blown in at the mouth
    const sx = mx; c.save(); const sg = c.createLinearGradient(sx - 200, 0, sx + 600, 0); sg.addColorStop(0, 'rgba(235,242,250,0)'); sg.addColorStop(1, 'rgba(235,242,250,.8)'); c.fillStyle = sg; c.beginPath(); c.moveTo(sx - 200, HZ + 4); c.quadraticCurveTo(sx + 200, HZ - 6, sx + 900, HZ + 2); c.lineTo(sx + 900, HZ + 500); c.lineTo(sx + 100, HZ + 500); c.closePath(); c.fill(); c.restore();
  });
  return { base: '#2b221d' };
}
// cave art: ochre hands (blown), charcoal horse / bison / mammoth (own design, not a copy)
function caveArt(c, x, y, s = 1, t = 0, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = o.a ?? .82; c.lineCap = 'round'; c.lineJoin = 'round';
  // blown-ochre hand stencils
  for (const [hx, hy, r] of [[-260, -40, .2], [-200, 30, -.15], [-310, 70, .35]]) {
    c.save(); c.translate(hx, hy); c.rotate(r);
    const g = c.createRadialGradient(0, 0, 10, 0, 0, 75); g.addColorStop(0, 'rgba(178,66,34,.75)'); g.addColorStop(1, 'rgba(178,66,34,0)'); c.fillStyle = g; c.fillRect(-80, -80, 160, 160);
    c.globalCompositeOperation = 'destination-out'; c.globalAlpha = .9; iconHand(c, 0, 4, 1.25, '#000'); c.restore();
  }
  const ch = (w, col = 'rgba(28,22,20,.85)') => { c.lineWidth = w; c.strokeStyle = col; c.stroke(); };
  // horse
  c.save(); c.translate(-40, -60);
  c.beginPath(); c.moveTo(-70, 0); c.bezierCurveTo(-60, -40, 30, -45, 60, -30); c.quadraticCurveTo(85, -60, 108, -78); c.quadraticCurveTo(128, -70, 120, -50); c.quadraticCurveTo(100, -32, 92, -8); c.quadraticCurveTo(70, 30, 30, 26); c.lineTo(-40, 28); c.quadraticCurveTo(-75, 20, -70, 0); ch(5);
  c.beginPath(); c.moveTo(60, -36); c.lineTo(70, -58); c.lineTo(80, -50); c.lineTo(88, -68); ch(4);
  for (const lx of [-50, -30, 40, 58]) { c.beginPath(); c.moveTo(lx, 24); c.lineTo(lx + (lx > 0 ? 6 : -4), 70); ch(4); }
  c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-95, 15, -88, 45); ch(4);
  c.globalAlpha = .35; c.beginPath(); c.ellipse(0, 0, 55, 20, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(178,66,34,.8)'; c.fill(); c.restore();
  // bison
  c.save(); c.translate(170, 10);
  c.beginPath(); c.moveTo(-80, 10); c.bezierCurveTo(-80, -40, -30, -70, 20, -62); c.quadraticCurveTo(60, -70, 78, -30); c.quadraticCurveTo(96, -10, 84, 14); c.quadraticCurveTo(60, 34, 0, 30); c.lineTo(-60, 30); c.closePath();
  c.fillStyle = 'rgba(150,52,30,.55)'; c.fill(); ch(5);
  c.beginPath(); c.moveTo(82, -24); c.quadraticCurveTo(100, -46, 92, -58); ch(4);
  for (const lx of [-60, -40, 40, 62]) { c.beginPath(); c.moveTo(lx, 28); c.lineTo(lx, 64); ch(4); }
  c.restore();
  // mammoth outline
  c.save(); c.translate(40, 120);
  c.beginPath(); c.moveTo(-90, 40); c.bezierCurveTo(-100, -20, -60, -60, 0, -64); c.bezierCurveTo(40, -90, 80, -70, 86, -40); c.quadraticCurveTo(96, 0, 88, 40); c.moveTo(86, -10); c.quadraticCurveTo(110, 40, 96, 70); ch(5);
  c.beginPath(); c.moveTo(78, 10); c.quadraticCurveTo(120, 30, 130, 0); ch(3.5, 'rgba(240,228,205,.8)');
  c.restore();
  c.restore();
}
// realistic-ish cartoon hearth fire (world space at x, floor 0). s = size, k = 0..1 (embers .. full fire)
function hearth(c, x, t, k = 1, s = 1) {
  c.save(); c.translate(x, 0); c.scale(s, s);
  // stone ring + ash
  ell(c, 0, 2, 120, 26); c.fillStyle = '#2a2420'; c.fill(); ell(c, 0, 0, 96, 18); c.fillStyle = '#4a423c'; c.fill();
  for (let i = 0; i < 12; i++) { const a = Math.PI + i / 11 * Math.PI * -1, px = Math.cos(a) * 110, py = Math.sin(a) * 22 + 6; ell(c, px, py - 8, 22, 15); const g = c.createLinearGradient(0, py - 22, 0, py + 6); g.addColorStop(0, '#6e665e'); g.addColorStop(1, '#3a3430'); c.fillStyle = g; c.fill(); c.lineWidth = 2; c.strokeStyle = '#231c18'; c.stroke(); }
  // logs
  for (const [r, l] of [[-.35, 120], [.4, 115], [.05, 100]]) { c.save(); c.translate(0, -10); c.rotate(r); rrect(c, -l / 2, -9, l, 18, 9); c.fillStyle = '#3a2a20'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#1a120c'; c.stroke(); c.fillStyle = `rgba(255,${110 + 60 * Math.sin(t * 3 + r * 7) | 0},40,${.35 + .45 * (1 - k * .5)})`; c.fillRect(-l * .3, -3, l * .6, 6); c.restore(); }
  // glowing embers
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) { const px = (rnd(i + 3) - .5) * 120, py = -6 - rnd(i + 5) * 12, a = .5 + .5 * Math.sin(t * (3 + rnd(i) * 5) + i); circle(c, px, py, 3 + rnd(i + 8) * 4); c.fillStyle = `rgba(255,${120 + rnd(i) * 80 | 0},40,${a})`; c.fill(); }
  c.restore();
  if (k > .05) {
    // flame tongues: several narrow licks of different height and phase, additive
    c.save(); c.globalCompositeOperation = 'lighter';
    const tongues = 9;
    for (const [sc, col, a] of [[1, '225,70,25', .5], [.78, '255,140,40', .6], [.52, '255,210,110', .75], [.3, '255,248,215', .8]]) for (let j = 0; j < tongues; j++) {
      const u = (j / (tongues - 1) - .5), ph = j * 1.7 + sc * 3, life = .55 + .45 * Math.sin(t * (6 + j % 3) + ph) * Math.sin(t * 2.3 + j);
      const hh = k * sc * 230 * (1 - Math.abs(u) * 1.1) * (.7 + .5 * life), bx = u * 120 * sc, ww = 26 * sc + 10, sw = Math.sin(t * 7 + ph) * 16 * sc;
      if (hh < 8) continue;
      c.beginPath(); c.moveTo(bx - ww, -4); c.quadraticCurveTo(bx - ww * .9 + sw * .3, -hh * .45, bx + sw, -hh); c.quadraticCurveTo(bx + ww * .9 + sw * .3, -hh * .45, bx + ww, -4); c.closePath();
      const g = c.createLinearGradient(0, -4, 0, -hh); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.7, `rgba(${col},${a * .5})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fill();
    }
    c.restore();
  }
  c.restore();
  bloom(c, x, -60 * s, 260 * s * (.5 + k), '255,150,60', .35 + .3 * k, 'lighter');
}
// world-space lights for a cave shot -> screen lightMap. fires: [{ x, y, k }] (world), mouth: world x of the mouth
function caveLights(c, cam, t, o = {}) {
  const L = [];
  for (const f of o.fires || []) {
    const fl = 1 + .09 * Math.sin(t * 9.1 + f.x) + .06 * Math.sin(t * 23 + f.x) + .04 * Math.sin(t * 3.3);
    const [sx, sy] = w2s(cam, f.x, f.y ?? -80), r = (f.r || 1600) * cam.z * (.5 + .5 * (f.k ?? 1));
    L.push({ x: sx, y: sy, r, col: '255,140,60', a: (.85 * (f.k ?? 1) + .15) * fl }, { x: sx, y: sy, r: r * .35, col: '255,200,130', a: .5 * (f.k ?? 1) * fl });
  }
  if (o.mouth != null) { const [sx, sy] = w2s(cam, o.mouth + 380, -320); L.push({ x: sx, y: sy, r: 1500 * cam.z, col: o.mouthCol || '140,175,225', a: o.mouthA ?? .8 }, { x: sx + 80 * cam.z, y: sy - 60 * cam.z, r: 520 * cam.z, col: '255,250,245', a: (o.mouthA ?? .8) * 1.1 }); }
  lightMap(c, o.ambient || '34,30,40', L, o.mouth != null ? lc => layer(lc, cam, .82, lc => { const b = layerBase(cam, CV.HZ, .82); lc.globalCompositeOperation = 'source-over'; lc.filter = 'blur(18px)'; lc.beginPath(); mouthPath(lc, o.mouth * .82 + 30, b - 10); lc.fillStyle = o.outsideLight || '#f4f2f0'; lc.fill(); lc.filter = 'none'; }) : null);
}
