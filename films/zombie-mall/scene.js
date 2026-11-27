// "30 Tage im Einkaufszentrum" — intro (Tag 30 → Tag 1). 16:9, 1920x1080, 30 fps. All on-screen text German.
// Shot times come from timings.js (measured from the voice-over MP3).
const T = TIMING, SH = T.shots; let REWINDING = false;
const ez = t => t * t * (3 - 2 * t), ez2 = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, eIn = t => t * t * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
// world y that lands on screen y Y for parallax layer p, given cam (inverse of layer())
const wy = (Y, p, cam) => (Y - H / 2) / (1 + (cam.z - 1) * p) + cam.y * p;
const wx = (X, p, cam) => (X - W / 2) / (1 + (cam.z - 1) * p) + cam.x * p;

// ---------- extra zombies so no shot repeats one (seeded variety) ----------
const HAIRS = ['buzz', 'grey', 'fade', 'afro', 'bun', 'long', 'braids', 'locs', 'cap', 'beanie', 'bald', 'puffs', 'headwrap'];
const TOPS = ['shirt', 'jacket', 'hoodie', 'sweater', 'tshirt', 'coat', 'dress', 'tank'];
const DULL = ['#5a6070', '#6a5a4a', '#4a5a4e', '#6a4a52', '#4a4a62', '#7a7060', '#3e4656', '#5e4e6a', '#6e6a5a', '#4e5e6e'];
const HORDE = ZOMBIES.concat(Array.from({ length: 24 }, (_, i) => {
  const r = j => rnd(i * 13 + j + 400), fem = r(1) > .5, child = r(2) > .88, old = r(3) > .7;
  const top = TOPS[Math.floor(r(4) * TOPS.length)];
  return makeZombie({ seed: 30 + i, T: child ? 1000 + r(5) * 150 : 1420 + r(5) * 260, head: child ? .88 : .94 + r(6) * .1, bw: child ? .8 : .85 + r(7) * .5, hips: fem ? 1.12 + r(8) * .12 : 1, legs: child ? .33 : .35,
    hair: old ? 'grey' : HAIRS[Math.floor(r(9) * HAIRS.length)], hairCol: old ? '#aaa49c' : '#1a1412', hatCol: DULL[Math.floor(r(10) * 10)], beard: !fem && r(11) > .6 ? (r(12) > .5 ? 'full' : 'short') : 0,
    top: fem ? top : (top === 'dress' ? 'coat' : top), topCol: DULL[Math.floor(r(13) * 10)], bottom: fem && r(14) > .5 ? 'skirt' : (r(15) > .5 ? 'jeans' : 'pants'), botCol: DULL[Math.floor(r(16) * 10)],
    shoe: '#2a2420', shoeless: r(17) > .5 ? (r(18) > .5 ? 'far' : 'near') : null, hunch: .22 + r(19) * .32, droop: (r(20) > .5 ? 1 : -1) * (.25 + r(21) * .2), reach: r(22) > .5 ? 'near' : 'far',
    limp: r(23) * .9, sleeve: r(24) > .7 ? 'near' : null, jacketOff: r(25) > .75, jacketCol: DULL[Math.floor(r(26) * 10)], glasses: old && r(27) > .5, eyeL: .8 + r(28) * .3, eyeR: .7 + r(29) * .35, mouthO: .3 + r(30) * .7 });
}));

// ---------- common finishing ----------
function vignette(c, a = .55) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,4,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
function grain(c, t, a = .05) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const f = Math.floor(t * 30); for (let i = 0; i < 500; i++) { const v = rnd(f * 7.13 + i) > .5 ? 255 : 0; c.fillStyle = `rgba(${v},${v},${v},${a})`; c.fillRect(rnd(f + i * 3.1) * W, rnd(f * 1.7 + i * 5.3) * H, 2, 2); } c.restore(); }
function coldGrade(c, a = 1) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(40,70,150,${.35 * a})`; c.fillRect(0, 0, W, H); c.restore(); }
function typewriterOLD(c, t) {
  const s = T.type_text, n = Math.floor((t - T.type_start) / T.type_step) + 1, shown = s.slice(0, clamp(n, 0, s.length)); if (t < T.type_start) return;
  const fade = 1 - seg(t, SH.s2 - .35, SH.s2 - .05);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.font = mono(58); c.textBaseline = 'alphabetic';
  const x = 110, y = 960; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(shown, x + 4, y + 4);
  c.shadowColor = 'rgba(255,200,140,.6)'; c.shadowBlur = 14; c.fillStyle = '#f4ece0'; c.fillText(shown, x, y);
  if (Math.floor(t * 2.4) % 2 === 0 || n <= s.length) { const w = c.measureText(shown).width; c.fillRect(x + w + 8, y - 48, 30, 54); }
  c.restore();
}

// ================= SHOT 1: crane down from the moon onto the mall (0 – 3.1), 3D set =================
const SKYPTS = Array.from({ length: 220 }, (_, i) => [(rnd(i + 3) - .5) * 3400, 60 + rnd(i + 70) * 1500, -1400]);
const CLOUDS = [[-520, 300, -900, 700], [-80, 420, -900, 820], [380, 280, -900, 640], [-900, 520, -900, 760], [700, 600, -900, 700], [100, 760, -900, 900]];
function sky3D(c, t, o = {}) {
  nightSky(c, t, o.cols || {});
  const P = MALL3D.proj;
  for (let i = 0; i < SKYPTS.length; i++) { const q = P(...SKYPTS[i]); if (!q.front) continue; const a = .35 + .55 * Math.abs(Math.sin(t * (.5 + rnd(i) * 2) + i)), r = 1 + rnd(i + 600) * 2.4; c.fillStyle = `rgba(220,230,255,${a})`; c.fillRect(q.x - r / 2, q.y - r / 2, r, r); }
  const m = P(-170, 330, -760); if (m.front) moon(c, m.x, m.y, 62);
  CLOUDS.forEach(([x, y, z, w], i) => { const q = P(x + t * 6, y, z); if (q.front) cloud(c, q.x, q.y, w, '#121b38', 'rgba(140,165,225,.32)', i * 7 + 3); });
  const hz = P(0, 0, -2600); if (hz.front) { skyline(c, -400 + (hz.x - W / 2), W + 400 + (hz.x - W / 2), hz.y + 2, t, { col: '#0b1122', lit: .06, tall: .5, fires: [[-120 + (hz.x - W / 2), 160, .8], [W + 60 + (hz.x - W / 2), 120, .7]] }); fogBand(c, -200, W + 200, hz.y - 10, 120, .25, t, NIGHT.fog, 10); }
}
function shot1(c, t) {
  const k = ez2(seg(t, 0, 3.0));
  const cam = { pos: [lerp(-6, 4, k), lerp(34, 2.4, k), lerp(56, 42, k)], look: [lerp(-16, -1, k), lerp(64, 10.5, k), lerp(-12, 0, k)], fov: 46 };
  const r = MALL3D.night(t, cam), P = MALL3D.proj;
  sky3D(c, t);
  c.drawImage(r.bg, 0, 0);
  // zombies (2D, all different) placed in the 3D lot: under the canopy and crossing between the cars
  const Zs = [];
  for (let i = 0; i < 30; i++) { const dir = rnd(i + 5) > .5 ? -1 : 1; Zs.push({ Z: HORDE[i], x: -12.5 + (i % 15) * 1.75 + (rnd(i) - .5) * .8 + dir * t * .25, z: 1.8 + Math.floor(i / 15) * 1.4 + rnd(i + 2) * 1.0, dir, ph: i * 1.7 }); }
  for (let i = 0; i < 7; i++) { const dir = i % 2 ? -1 : 1; Zs.push({ Z: HORDE[30 + i], x: [-20, -12, -3, 6, 15, 22, -8][i] + dir * t * .4, z: [17, 21, 19, 22, 18, 21, 26][i], dir, ph: i * 2.3 }); }
  const drawZ = o => { const q = P(o.x, 0, o.z); if (!q.front) return; c.save(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(q.x, q.y, .5 * q.ppm, .12 * q.ppm, 0, 0, Math.PI * 2); c.fill(); c.restore(); drawZombieSide(c, o.Z, { x: q.x, y: q.y, k: kAt(q.ppm), s: o.dir, walk: t * 3 + o.ph, t, dim: .62, glow: 1 }); };
  Zs.sort((a, b) => a.z - b.z); Zs.filter(o => o.z < 10).forEach(drawZ); c.drawImage(r.mid, 0, 0); Zs.filter(o => o.z >= 10).forEach(drawZ);
  c.drawImage(r.fg, 0, 0);
  // light: neon spill, hazard flash, lamp cones (2D blooms at projected points)
  const sg = P(0, 23.4, 0); if (sg.front) { bloom(c, sg.x, sg.y, sg.ppm * 22, '255,50,120', .28 * r.lvl); }
  if (hazOn(t)) for (const [hx, hz] of [[13, 29.2], [9, 30.8]]) { const q = P(hx, .8, hz); if (q.front) { bloom(c, q.x, q.y, q.ppm * 5, NIGHT.haz, .7); bloom(c, q.x, q.y, q.ppm * 1.2, '255,230,170', .9); } }
  for (const [lx, lz] of [[-16.6, 12], [17.4, 26]]) { const q = P(lx, 7.8, lz); if (q.front) bloom(c, q.x, q.y, q.ppm * 6, '200,215,255', .45); }
  { const e = P(7, 5.2, -.8); if (e.front) bloom(c, e.x, e.y, e.ppm * 5, '40,255,140', .25); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); fogBand(c, -200, W + 200, P(0, 0, 8).y, 90, .14, t, NIGHT.fog, 30); if (t > 1.9) plasticBag(c, 1250 + (t - 1.9) * 620, 930 - (t - 1.9) * 180 - Math.sin(t * 3) * 40, t, 1.4); dust(c, 0, W, 0, H, t, 40); c.restore();
  coldGrade(c, .7); vignette(c, .6);
  if (!REWINDING) titleOpen(c, t);
}

// ================= SHOT 2: inside, low angle at the glass doors (3.1 – 7.55) =================
function carFront(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-330, 0); c.lineTo(-340, -150); c.quadraticCurveTo(-300, -200, -240, -210); c.lineTo(-200, -330); c.lineTo(200, -330); c.lineTo(240, -210); c.quadraticCurveTo(300, -200, 340, -150); c.lineTo(330, 0); c.closePath(); c.fillStyle = '#0a0d14'; c.fill();
  for (const sx of [-1, 1]) { bloom(c, sx * 230, -150, 700, '255,240,200', .55); bloom(c, sx * 230, -150, 160, '255,255,245', 1); c.beginPath(); c.ellipse(sx * 230, -150, 60, 34, 0, 0, Math.PI * 2); c.fillStyle = '#fffdf2'; c.fill(); }
  if (o.haz) for (const sx of [-1, 1]) { bloom(c, sx * 320, -110, 240, NIGHT.haz, .9); c.beginPath(); c.ellipse(sx * 320, -110, 24, 16, 0, 0, Math.PI * 2); c.fillStyle = '#ffc060'; c.fill(); }
  c.restore();
}
function shot2(c, t) {
  const u = t - SH.s2, k = ez(seg(u, 0, SH.crack - SH.s2)), cam = { x: lerp(-260, 260, k), y: -300, z: lerp(1.0, 1.04, k) };
  // exterior: dark lot, two cars facing the doors
  nightSky(c, t, { top: '#03050c', mid: '#070c1c', bot: '#0d1424' });
  layer(c, cam, .45, c => { skyline(c, -1500, 1500, -40, t, { col: '#070b16', lit: .04, tall: .6 }); asphalt(c, -2000, 2000, -40, 900, t, { far: '#080b12', near: '#0c1018' }); });
  layer(c, cam, .55, c => { carFront(c, -520, wy(760, .55, cam), .9, t, { haz: hazOn(t) }); carFront(c, 640, wy(740, .55, cam), .8, t); fogBand(c, -1500, 1500, -60, 200, .25, t, '140,150,170', 25); });
  // horde: back, middle, front row pressing on the glass (all different)
  const row = (p, list, kk, Y, dim, press, dx) => layer(c, cam, p, c => list.forEach((zi, j) => { const y = wy(Y, p, cam);
    const Z = HORDE[zi], x = (j - (list.length - 1) / 2) * dx + Math.sin(j * 2.3) * 40, sway = Math.sin(t * 1.4 + j * 1.9) * 12;
    if (press) drawZombieFront(c, Z, { x: x + sway * .3, y, k: kk, t, dim, press: 1 });
    else drawZombieFront(c, Z, { x: x + sway, y: y + (j % 2) * 14, k: kk, t: t + j, dim, press: j % 3 === 0 ? 1 : 0 });
  }));
  row(.68, [12, 13, 14, 15, 16, 17, 18, 19, 20, 21], .19, 790, .9, 0, 250);
  layer(c, cam, .68, c => fogBand(c, -1500, 1500, wy(700, .68, cam), 160, .18, t, '150,160,180', 20));
  row(.82, [22, 23, 24, 25, 26, 27, 28], .25, 815, .8, 0, 330);
  layer(c, cam, .82, c => { for (const sx of [-1, 1]) sunRays(c, -470 + sx * 190, wy(640, .82, cam), { n: 6, len: 1600, spread: .7, dir: Math.PI / 2 - .1 + sx * .25, color: '255,236,200', alpha: .12, t }); });
  row(.95, [0, 1, 2, 3, 4, 5], .36, 850, .55, 1, 400);
  // glass + frame (action plane)
  layer(c, cam, 1, c => {
    const top = wy(110, 1, cam), base = wy(830, 1, cam);
    // palm prints where hands press
    glassFront(c, -1500, 1500, top, base, t, { n: 7, doors: [3] });
    // interior floor: polished tiles reflecting the headlights
    const g = c.createLinearGradient(0, base, 0, base + 700); g.addColorStop(0, '#0d1220'); g.addColorStop(1, '#05070c'); c.fillStyle = g; c.fillRect(-2000, base + 10, 4000, 900);
    c.strokeStyle = 'rgba(120,140,190,.12)'; c.lineWidth = 3; for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(i * 160, base + 10); c.lineTo(i * 260, base + 700); c.stroke(); } for (let j = 1; j < 6; j++) { const yy = base + 10 + j * j * 22; c.beginPath(); c.moveTo(-2000, yy); c.lineTo(2000, yy); c.stroke(); }
    c.save(); c.globalCompositeOperation = 'screen'; for (const [hx, a] of [[-560, .35], [-180, .35], [520, .28], [760, .28]]) { const gg = c.createLinearGradient(0, base, 0, base + 500); gg.addColorStop(0, `rgba(255,235,200,${a})`); gg.addColorStop(1, 'rgba(255,235,200,0)'); c.fillStyle = gg; c.fillRect(hx - 50, base + 10, 100, 500); } c.restore();
    if (hazOn(t)) bloom(c, -560, base + 160, 300, NIGHT.haz, .25);
    puddle(c, 250, base + 230, 330, 46, c => { bloom(c, 250, base + 230, 260, '255,236,200', .5); });
    litter(c, -1200, 1200, base + 120, t, 21, 16, { s: 1.2, depth: 200 });
    shelfUnit(c, 1180, base + 20, 380, 620, { seed: 3, rot: .04 });
  });
  // foreground: toppled sale board, emergency-exit sign
  layer(c, cam, 1.4, c => {
    adBoardFallen(c, wx(380, 1.4, cam), wy(1110, 1.4, cam), 1.15, -.12);
    paper(c, wx(1300, 1.4, cam), wy(1040, 1.4, cam), .4, 2.2);
  });
  layer(c, cam, 1.25, c => { const x = wx(1500, 1.25, cam) + 0, y = wy(70, 1.25, cam); line(c, [x - 120, y - 200, x - 120, y - 60], 10, '#0a0c12'); line(c, [x + 120, y - 200, x + 120, y - 60], 10, '#0a0c12'); notausgang(c, x, y, 1.05, 1); });
  layer(c, cam, 1, c => dust(c, -1200, 1200, -600, 500, t, 50, '230,225,210', .55));
  coldGrade(c, .8); vignette(c, .65);
}
// ---------- the crack: close on the glass ----------
function crackLines(c, ox, oy, p, seed, R) {
  const n = 13, rad = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rnd(seed + i) * .4, pts = [[ox, oy]]; let r = 0, x = ox, y = oy; while (r < R) { const st = 40 + rnd(seed + i * 7 + r) * 80; r += st; const aa = a + (rnd(seed + i + r) - .5) * .35; x = ox + Math.cos(aa) * r; y = oy + Math.sin(aa) * r; pts.push([x, y]); } rad.push(pts); }
  const L = p * R;
  const draw = (pts, w, col) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let j = 1; j < pts.length; j++) { const d = Math.hypot(pts[j][0] - ox, pts[j][1] - oy); if (d > L) { const q = pts[j - 1], f = (L - Math.hypot(q[0] - ox, q[1] - oy)) / Math.max(1, d - Math.hypot(q[0] - ox, q[1] - oy)); c.lineTo(q[0] + (pts[j][0] - q[0]) * f, q[1] + (pts[j][1] - q[1]) * f); break; } c.lineTo(pts[j][0], pts[j][1]); } c.lineWidth = w; c.strokeStyle = col; c.lineJoin = 'round'; c.stroke(); };
  for (const pts of rad) { draw(pts, 7, 'rgba(0,0,0,.55)'); draw(pts, 3, 'rgba(235,245,255,.95)'); }
  // concentric rings between the spokes
  for (const rr of [70, 150, 250, 380]) if (L > rr) for (let i = 0; i < n; i++) { if (rnd(seed + rr + i) < .25) continue; const A = rad[i], B = rad[(i + 1) % n], pa = A[Math.min(A.length - 1, Math.round(rr / 90))], pb = B[Math.min(B.length - 1, Math.round(rr / 90))]; c.beginPath(); c.moveTo(pa[0], pa[1]); c.quadraticCurveTo((pa[0] + pb[0]) / 2 + (ox - (pa[0] + pb[0]) / 2) * .12, (pa[1] + pb[1]) / 2 + (oy - (pa[1] + pb[1]) / 2) * .12, pb[0], pb[1]); c.lineWidth = 2.5; c.strokeStyle = 'rgba(225,238,255,.85)'; c.stroke(); }
  bloom(c, ox, oy, 120 * p, '230,240,255', .5);
}
function shotCrack(c, t) {
  const v = t - SH.crack, hit = t - T.knack, sh = hit > 0 ? Math.exp(-hit * 7) : 0;
  const cam = { x: Math.sin(t * 71) * 26 * sh + v * 30, y: -560 + Math.cos(t * 63) * 22 * sh, z: lerp(1.0, 1.1, ez(seg(v, 0, 1))) };
  nightSky(c, t, { top: '#04060c', mid: '#0a0f1c', bot: '#121a2a' });
  layer(c, cam, .5, c => { carFront(c, 380, 220, 1.5, t, { haz: hazOn(t) }); fogBand(c, -1500, 1500, 0, 250, .25, t, '140,150,170'); });
  layer(c, cam, .75, c => { drawZombieFront(c, HORDE[29], { x: -620, y: 330, k: .5, t, dim: .85, press: 0 }); drawZombieFront(c, HORDE[30], { x: 760, y: 360, k: .46, t: t + 2, dim: .85 }); });
  layer(c, cam, .95, c => drawZombieFront(c, HORDE[6], { x: 40, y: 560, k: .85, t, dim: .5, press: 1 }));
  layer(c, cam, 1, c => {
    glassFront(c, -1400, 1400, -1300, 400, t, { n: 3 });
    const p = hit > 0 ? 1 - Math.pow(1 - clamp(hit / .4), 3) : 0;
    if (p > 0) crackLines(c, 210, -760, p, 77, 620);
  });
  coldGrade(c, .8); vignette(c, .6);
  if (hit > 0 && hit < .12) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(220,235,255,${.35 * (1 - hit / .12)})`; c.fillRect(0, 0, W, H); c.restore(); }
}

// ================= SHOT 3: the roof (8.55 – 14.5) =================
function noahSideTorch(c, p) {
  // drawNoahSide (unchanged proportions) with the near arm raised to hold a flashlight; returns the torch tip + direction
  const W0 = NOAH.W; NOAH.W = W0 * 1.8; const k = p.k, s = p.s || 1, th = p.th, bd = p.bend, t2 = th + bd;
  c.save(); c.translate(p.x, p.y); c.scale(k * s, k); c.translate(0, p.bob || 0);
  noahSideArm(c, .05, -.05, true, false); noahSideLeg(c, -.05, 0, true, false); noahSideLeg(c, .05, 0, false, false); noahSideTorso(c, false, s);
  c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-28, -1000, -28, -958], 9, NOAH.out); nLine(c, [44, -1000, 44, -958], 9, NOAH.out);
  c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980); noahSideHead(c, p.expr || {}); c.restore();
  noahSideArm(c, th, bd, false, false);
  const [sx, sy] = NOAH_SIDE.SHOULDER, ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER, hx = ex + Math.sin(t2) * (NOAH.FORE + 40), hy = ey + Math.cos(t2) * (NOAH.FORE + 40);
  c.restore(); NOAH.W = W0;
  const dx = s * Math.sin(t2), dy = Math.cos(t2);
  return { x: p.x + hx * k * s, y: p.y + (hy + (p.bob || 0)) * k, ang: Math.atan2(dy, dx) };
}
function shot3(c, t) {
  const u = t - SH.s3, k = ez2(seg(u, 0, 3.6)), cam = { x: lerp(-460, 250, k), y: -270, z: lerp(1.26, 1.33, ez(seg(u, 0, 5.9))) };
  nightSky(c, t, { top: '#03050d', mid: '#0a1330', bot: '#1d2b55' });
  layer(c, cam, .03, c => stars(c, -1300, 1500, -800, 100, t, 180, 5));
  layer(c, cam, .1, c => moon(c, -620, -520, 60));
  layer(c, cam, .18, c => { for (let i = 0; i < 4; i++) cloud(c, -1200 + i * 700 + t * 15, -560 + (i % 2) * 90, 600, '#111a34', 'rgba(140,165,225,.25)', 40 + i); });
  layer(c, cam, .3, c => { const b = wy(640, .3, cam); skyline(c, -1600, 1800, b, t, { col: '#0a1022', lit: .05, fires: [[-700, 380, .9], [420, 250, .7], [1250, 330, 1.1]] }); fogBand(c, -1600, 1800, b - 30, 160, .25, t, NIGHT.fog, 12); });
  // roof floor + far parapet (action plane)
  layer(c, cam, 1, c => {
    const edgeX = 960, far = -300;
    c.fillStyle = '#0f1320'; c.fillRect(-3000, far - 60, edgeX + 3000, 60); c.fillStyle = 'rgba(140,160,210,.2)'; c.fillRect(-3000, far - 60, edgeX + 3000, 6); // back parapet
    const g = c.createLinearGradient(0, far, 0, 400); g.addColorStop(0, '#1a2030'); g.addColorStop(1, '#0c1018'); c.fillStyle = g; c.beginPath(); c.moveTo(-3000, far); c.lineTo(edgeX, far); c.lineTo(edgeX + 60, 600); c.lineTo(-3000, 600); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 4; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(-3000, far + i * i * 4.5); c.lineTo(edgeX + i * 4, far + i * i * 4.5); c.stroke(); }
    roofHILFE(c, -120, -70, 1900, .27);
    // side parapet (the edge Noah stands at) + drop
    c.fillStyle = '#141a28'; c.beginPath(); c.moveTo(edgeX, far - 60); c.lineTo(edgeX + 40, far - 60); c.lineTo(edgeX + 110, 600); c.lineTo(edgeX + 60, 600); c.closePath(); c.fill(); c.fillStyle = 'rgba(160,180,230,.25)'; c.beginPath(); c.moveTo(edgeX + 40, far - 60); c.lineTo(edgeX + 48, far - 60); c.lineTo(edgeX + 118, 600); c.lineTo(edgeX + 110, 600); c.fill();
    // props behind the group
    tarpTent(c, -650, -250, .9, '#2f5a7a'); tarpTent(c, -1250, -240, .8, '#5a6a3a');
    antennaMast(c, 140, -290, 520);
    rainBarrel(c, -980, -190, .8); rainBarrel(c, 470, -240, .75, '#2a5a8a');
    planter(c, -320, -210, 300, t); planter(c, -10, -230, 260, t + 1);
    shelfUnit(c, 760, -250, 220, 200, { seed: 8 }); // last shelf pushed against the roof door
    c.fillStyle = '#1a1f2c'; c.fillRect(640, -520, 260, 270); c.fillStyle = '#0a0d14'; c.fillRect(680, -470, 180, 220); // stair housing + door
    litter(c, -900, 700, -40, t, 51, 10, { depth: 120 });
    // the group (all different) — sorted back to front
    const look = .7;
    castShadow(c, -90, 220, { alpha: .25, len: .6 }); drawPerson(c, CAST.imani, { x: -90, y: -150, k: .25, expr: { mouth: 'flat', browUp: .5, look }, arms: { l: { a: .22, b: -1.0 }, r: { a: .22, b: -1.0 } } });
    castShadow(c, 200, 220, { alpha: .25, len: .6 }); drawPerson(c, CAST.grace, { x: 200, y: -110, k: .25, expr: { mouth: 'flat', browUp: .7, look }, arms: { l: { a: .18, b: -1.95 }, r: { a: .14, b: -.08 } } });
    c.save(); c.translate(0, -40); castShadow(c, -330, 300, { alpha: .25, len: .6 }); drawPerson(c, CAST.jamal, { x: -330, y: 0, k: .25, expr: { mouth: 'flat', browUp: .3, look }, arms: { l: { a: .2, b: .4 }, r: { a: .2, b: .4 } } }); c.restore();
    c.save(); c.translate(0, -30); castShadow(c, 600, 150, { alpha: .3, len: .6 }); drawPersonSide(c, CAST.nia, { x: 600, y: 0, k: .25, s: 1, expr: { mouth: 'flat' } }); c.restore();
    castShadow(c, 800, 160, { alpha: .3, len: .6 });
    const tor = noahSideTorch(c, { x: 800, y: 0, k: .25, s: 1, th: 1.05, bend: .1, expr: { mouth: 'flat', browUp: .4 }, bob: Math.sin(t * 1.1) * 4 });
    flashlightProp(c, tor.x, tor.y, tor.ang, .26, 1);
    shot3.torch = tor;
  });
  layer(c, cam, 1, c => { bloom(c, 150, -330, 900, '150,175,240', .16); const tr = shot3.torch; torchBeam(c, tr.x + Math.cos(tr.ang) * 22, tr.y + Math.sin(tr.ang) * 22, tr.ang + Math.sin(t * .9) * .03, 1700, .16, 1); fogBand(c, 600, 2600, 120, 200, .2, t, '150,160,190', 25); dust(c, -700, 1500, -700, 200, t, 45); });
  // foreground HVAC the camera slides out from behind
  layer(c, cam, 1.5, c => { hvacUnit(c, -760, wy(1150, 1.5, cam), 1.35, t); });
  coldGrade(c, .9); vignette(c, .6);
}

// ================= SHOT 4: Noah close-up, torch from below, tilt up to the empty sky (14.5 – 23.1) =================
function torchLevel(t) { if (T.torch_flicker.some(([a, b]) => t >= a && t < b)) return .05; if (t < T.torch_dim) return 1; return lerp(1, .32, ez(seg(t, T.torch_dim, T.torch_dim + .5))) + Math.sin(t * 23) * .02; }
function noahClose(c, t, cam, o) {
  const lv = torchLevel(t);
  nightSky(c, t, { top: '#02040a', mid: '#070d22', bot: '#141e3e' });
  layer(c, cam, .06, c => stars(c, -1100, 1100, -800, 200, t, 260, 9));
  layer(c, cam, .12, c => { moon(c, 330, -520, 44); });
  layer(c, cam, .22, c => { for (let i = 0; i < 6; i++) cloud(c, -1500 + i * 600 + t * 10, -760 + (i % 3) * 150, 640, '#0e1630', 'rgba(130,155,215,.22)', 60 + i); });
  layer(c, cam, .3, c => { const b = wy(760, .3, { ...cam, y: -270 }); skyline(c, -1800, 1800, b, t, { col: '#080d1c', lit: .04, fires: [[-900, 300, .9], [1100, 260, .8]] }); fogBand(c, -1800, 1800, b - 20, 160, .25, t, NIGHT.fog, 10); });
  layer(c, cam, 1, c => {
    const e = o.expr;
    drawNoah(c, { x: 0, y: 0, k: .25, ink: 1.6, expr: e, tilt: o.tilt || 0, arms: { l: { a: .3, b: -1.75 }, r: { a: .16, b: -.1 } } });
    const hx = -10.5 * .25, hy = -685 * .25;
    flashlightProp(c, hx + 6, hy - 4, -Math.PI / 2 + .62, .22, lv);
    const W0 = NOAH.W; NOAH.W = W0 * 1.6; drawNoahHand(c, hx, hy, .25, -1.45); NOAH.W = W0;
    // light from below on the face (warm), limited to the head area
    c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(hx, hy - 70, 10, hx, hy - 90, 170); g.addColorStop(0, `rgba(255,190,110,${.42 * lv})`); g.addColorStop(.6, `rgba(255,150,70,${.14 * lv})`); g.addColorStop(1, 'rgba(255,150,70,0)'); c.fillStyle = g; c.fillRect(hx - 200, hy - 300, 400, 330); c.restore();
    torchBeam(c, hx + 22, hy - 22, -Math.PI / 2 + .62, 900, .1, lv * .8);
  });
  layer(c, cam, 1, c => dust(c, -400, 400, -900, 0, t, 30, '255,220,170', .4 * lv + .1));
  coldGrade(c, .9); vignette(c, .7);
}
function shot4(c, t) {
  const tl = ez2(seg(t, T.tilt[0], T.tilt[1])), push = ez(seg(t, SH.s4, T.tilt[0]));
  const cam = { x: lerp(0, 40, tl), y: lerp(-262, -2500, tl), z: lerp(3.05, 3.25, push) };
  const up = seg(t, T.look_up, T.look_up + .4);
  noahClose(c, t, cam, { expr: { mouth: up > .5 ? 'o' : 'flat', browUp: lerp(.45, 1, up), look: lerp(.3, 0, up), lid: lerp(.12, 0, up) }, tilt: lerp(.02, -.04, up) });
}
function shot5(c, t) {
  // "Aber wie bist du überhaupt hier gelandet?" — back on Noah, who now looks at us
  const u = seg(t, SH.s5, SH.rewind), cam = { x: 0, y: lerp(-300, -270, ez(u)), z: lerp(3.3, 3.75, ez(u)) };
  noahClose(c, t, cam, { expr: { mouth: 'flat', browUp: .25, look: 0 } });
}

// ================= DAY 1: bright, crowded mall atrium (3D set + 2D people) =================
const DAY_CROWD = (() => {
  const L = [['amara', -3.2, 9, 1, 1.0], ['kofi', 2.4, 8.2, -1, 1.2], ['zara', -.8, 4.5, 1, .9], ['baba', 4.6, 6, -1, .35], ['tunde', -4.8, 2, 1, 1.1], ['sade', 1.4, 1, -1, 1.0], ['malik', -2.4, 11.5, 1, 1.6], ['ayo', 3.6, 11, -1, 1.3], ['grace', -5.2, -3, 1, .7], ['nia', -4.4, -3.3, 1, .7], ['imani', 2.8, -2, -1, .9], ['jamal', .2, -6, 1, .8]];
  const ex = Array.from({ length: 10 }, (_, i) => { const r = j => rnd(i * 17 + j + 900); const fem = r(1) > .5; return [makePerson({ T: 1450 + r(2) * 200, head: .92 + r(3) * .1, bw: .85 + r(4) * .4, hips: fem ? 1.15 : 1, hair: ['afro', 'bun', 'buzz', 'fade', 'long', 'braids', 'locs', 'cap', 'ponytail', 'grey'][i], hairCol: i === 9 ? '#b8b0a6' : '#1a1210', hatCol: ['#d84a3a', '#3a6ad0', '#e8b030'][i % 3], top: ['tshirt', 'shirt', 'jacket', 'hoodie', 'sweater', 'coat', 'dress', 'tank', 'tshirt', 'shirt'][i], topCol: ['#e86a4a', '#5ab0e0', '#7ac07a', '#e8c84a', '#c07ad0', '#4a7ad0', '#e85a8a', '#40b0a0', '#f0a040', '#a0a0d0'][i], bottom: fem && r(5) > .5 ? 'skirt' : (r(6) > .5 ? 'jeans' : 'pants'), botCol: ['#3a4a6a', '#5a4a3a', '#2a2a36', '#6a5a7a'][i % 4], bag: r(7) > .6 ? '#b5643a' : null, glasses: r(8) > .75 }), (r(9) - .5) * 9, -9 - r(10) * 14, r(11) > .5 ? 1 : -1, .6 + r(12) * .7]; });
  return L.map(([n, x, z, d, v]) => [CAST[n], x, z, d, v]).concat(ex);
})();
function dayMall(c, t) {
  const u = seg(t, SH.day - 1, T.duration);
  const cam = { pos: [lerp(-1.4, -.8, u), 1.9, lerp(18.5, 17.2, u)], look: [.4, 4.2, -20], fov: 52 };
  const r = MALL3D.day(t, cam), P = MALL3D.proj;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#f6ead6'; c.fillRect(0, 0, W, H); c.restore();
  c.drawImage(r.bg, 0, 0);
  const ppl = DAY_CROWD.map(([Pp, x, z, d, v], i) => ({ Pp, x: x + d * v * (t - SH.day + 1), z, d, v, i })).sort((a, b) => a.z - b.z);
  for (const o of ppl) { const q = P(o.x, 0, o.z); if (!q.front) continue; c.save(); c.fillStyle = 'rgba(60,40,20,.22)'; c.beginPath(); c.ellipse(q.x + q.ppm * .3, q.y, .45 * q.ppm, .1 * q.ppm, 0, 0, Math.PI * 2); c.fill(); c.restore();
    drawPersonSide(c, o.Pp, { x: q.x, y: q.y, k: kAt(q.ppm), s: o.d, walk: t * 8 * Math.max(.5, o.v) + o.i * 1.3, expr: { mouth: 'smile' }, ink: 1.8 }); }
  const sk = P(-3, 16, -6); sunRays(c, sk.x, sk.y, { n: 9, len: 2200, spread: .55, dir: Math.PI / 2 + .25, color: '255,240,200', alpha: .16, t });
  motes(c, 0, W, 0, H, t, { n: 40, color: '255,240,210', alpha: .5 });
  grade(c, { sx: .35, sy: 0, warm: '255,200,130', warmA: .3, cool: '120,80,40', coolA: .08 });
}

// ================= REWIND (VHS) =================
let OFF = null;
function offscreen() { if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H; } return OFF; }
function renderShot(c, t) {
  if (t < SH.s2) shot1(c, t); else if (t < SH.crack) shot2(c, t); else if (t < SH.s3) shotCrack(c, t); else if (t < SH.s4) shot3(c, t); else if (t < SH.s5) shot4(c, t); else shot5(c, t);
}
function rewind(c, t) {
  const p = seg(t, SH.rewind, SH.day), frz = .1, q = seg(p, frz, .9);
  // keyframes so every earlier shot flashes by backwards (close-up -> roof -> glass -> crane)
  const KF = [[0, SH.rewind - .01], [.18, SH.s4 + .3], [.45, SH.s3 + .2], [.72, SH.s2 + .2], [1, .6]];
  let src = KF[0][1]; for (let i = 1; i < KF.length; i++) if (q <= KF[i][0]) { src = lerp(KF[i - 1][1], KF[i][1], (q - KF[i - 1][0]) / (KF[i][0] - KF[i - 1][0])); break; }
  if (p < frz) src = SH.rewind - .01;
  const o = offscreen(), oc = o.getContext('2d'); oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.globalCompositeOperation = 'source-over'; oc.clearRect(0, 0, W, H);
  REWINDING = true; if (p < .9) renderShot(oc, src); else dayMall(oc, SH.day); REWINDING = false;
  // VHS: horizontal slice jitter, chroma fringes, tracking bars, warm wash at the end
  const f = Math.floor(t * 30), amp = p < frz ? 6 : 30 + 30 * q;
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 24) { const dx = (rnd(f * 3.1 + y) - .5) * amp * (rnd(f + y * .1) > .8 ? 3 : 1); c.drawImage(o, 0, y, W, 24, dx, y, W, 24); }
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .22; c.filter = 'none'; c.drawImage(o, 9, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(255,120,120,1)'; c.globalAlpha = .08; c.fillRect(0, 0, W, H); c.restore();
  for (let i = 0; i < 3; i++) { const by = ((f * 37 + i * 400) % (H + 200)) - 100, bh = 30 + rnd(f + i) * 60; c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, by, W, bh); for (let j = 0; j < 60; j++) { c.fillStyle = `rgba(255,255,255,${rnd(f + j + i * 70) * .5})`; c.fillRect(rnd(f * 1.3 + j) * W, by + rnd(j + f) * bh, 30 + rnd(j) * 120, 3); } }
  for (let y = 0; y < H; y += 4) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, y, W, 2); }
  // cold night → warm day
  const warm = ez(seg(p, .55, .95)); c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,190,110,${.6 * warm})`; c.fillRect(0, 0, W, H); c.restore();
  if (p > .82) { c.fillStyle = `rgba(255,248,230,${Math.sin(seg(p, .82, 1) * Math.PI) * .85})`; c.fillRect(0, 0, W, H); }
  // OSD + counter
  const day = Math.max(1, Math.round(30 - 29 * Math.pow(q, .9)));
  vhsOSD(c, t, { pause: p < frz, day, clock: 3 * 3600 * (1 - q) });
}
function dayTitle(c, t) {
  dayMall(c, t); titleDay(c, t, SH.day);
  const w = 1 - seg(t, SH.day, SH.day + .3); if (w > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); for (let y = 0; y < H; y += 4) { c.fillStyle = `rgba(0,0,0,${.1 * w})`; c.fillRect(0, y, W, 2); } c.fillStyle = `rgba(255,248,230,${.5 * w})`; c.fillRect(0, 0, W, H); c.restore(); }
}

function renderFrame(c, t) {
  if (t < SH.rewind) renderShot(c, t);
  else if (t < SH.day) rewind(c, t);
  else if (t < SH.day + .9 || typeof mainShot === 'undefined') dayTitle(c, t);
  else mainShot(c, t);
  // music-free silent beat: nothing special visually, just the empty sky
  grain(c, t, t >= SH.day ? .02 : .045);
  const fin = seg(t, 0, .35); if (fin < 1) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${1 - fin})`; c.fillRect(0, 0, W, H); c.restore(); }
}
