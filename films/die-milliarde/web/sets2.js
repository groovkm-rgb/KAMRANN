// sets2.js: Blitzpaket depot, city street (dealer, towers, grey men), penthouse (living room, roof pool, bathroom, party), Oma's kitchen.
import { K, bx, cyl, sph, grp, pl, floor, sign, txt, rr, beam, glow, rngf, instBoxes, skyline, dynSign, makePhone } from './common.js';
import { TX, tmat, rtex } from './sets1.js';

// ---------------------------------------------------------------- DEPOT
export function buildDepot(root) {
  const G = grp(root), S = {};
  floor(30, 22, tmat(256, 256, (g) => { g.fillStyle = '#9a9890'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#e8c040'; g.fillRect(0, 120, 256, 12); const r = rngf(4); for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(r() * 256, r() * 256, 4, 4); } }, 6, 4), 0, 0, 0, G);
  const wall = tmat(128, 128, (g) => { g.fillStyle = '#c8ccd0'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#a8acb4'; g.lineWidth = 4; for (let i = 0; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); } }, 8, 2);
  bx(30, 8, 0.3, wall, 0, 0, -11, G); bx(0.3, 8, 22, wall, -15, 0, 0, G);
  // right wall with big roll door (open, bright daylight)
  bx(0.3, 8, 7, wall, 15, 0, -7.5, G); bx(0.3, 8, 7, wall, 15, 0, 7.5, G); bx(0.3, 3, 8, wall, 15, 5, 0, G);
  pl(8, 5, K.B('#fff6dc'), 15.3, 2.5, 0, G, { ry: -Math.PI / 2, nd: false });
  S.doorBeam = beam(6, 14, '255,240,200', 0.35, 10, 3, 0, G, { ry: Math.PI / 2, rz: 1.25 });
  // shelving with parcels (instanced)
  const r = rngf(9), parcels = [];
  for (let row = 0; row < 3; row++) { const z = -9 + row * 4.5;
    for (let lv = 0; lv < 4; lv++) { bx(18, 0.08, 1.2, '#e86a2a', -4, lv * 1.6 + 0.4, z, G, { cast: false }); for (let i = 0; i < 26; i++) if (r() < 0.8) { const w = 0.4 + r() * 0.35, h = 0.3 + r() * 0.5; parcels.push([-12.6 + i * 0.68, lv * 1.6 + 0.48, z + (r() - 0.5) * 0.3, w, h, 0.5 + r() * 0.3, r() * 0.3]); } }
    for (let i = 0; i < 7; i++) bx(0.1, 6.4, 0.1, '#2a4a8a', -13 + i * 3, 0, z - 0.55, G, { cast: false }), bx(0.1, 6.4, 0.1, '#2a4a8a', -13 + i * 3, 0, z + 0.55, G, { cast: false });
  }
  instBoxes(parcels, TX.cardboard, G, true);
  // conveyor
  const cv = grp(G, -2, 0, 3.5); bx(16, 0.9, 1.2, '#3a3a44', 0, 0, 0, cv); S.belt = bx(16, 0.05, 1.1, tmat(64, 64, (g) => { g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#4a4a4a'; g.fillRect(0, 0, 8, 64); }, 30, 1), 0, 0.9, 0, cv, { cast: false });
  S.cvBoxes = []; for (let i = 0; i < 8; i++) S.cvBoxes.push(bx(0.6, 0.4, 0.5, TX.cardboard, 0, 0.95, 0, cv));
  S.cv = cv;
  // boss desk area (front left)
  const dk = grp(G, -6, 0, 7.5); S.desk = dk; bx(2.6, 0.08, 1.2, '#8a6a4a', 0, 0.85, 0, dk); bx(2.5, 0.85, 0.08, '#6a4a2a', 0, 0, -0.55, dk); for (const x of [-1.2, 1.2]) bx(0.08, 0.85, 1.1, '#6a4a2a', x, 0, 0, dk);
  bx(0.6, 0.4, 0.05, '#2a2a30', 0.6, 0.93, -0.4, dk); bx(0.56, 0.34, 0.01, K.E('#7ab0e0', 0.6), 0.6, 0.96, -0.37, dk, { cast: false }); cyl(0.05, 0.05, 0.1, '#e8d6a0', -0.9, 0.93, 0.2, dk); bx(0.4, 0.1, 0.3, '#f4f0e6', -0.4, 0.93, 0.1, dk);
  S.scanner = grp(dk, 0, 0.93, 0.25); bx(0.12, 0.05, 0.25, '#34323c', 0, 0, 0, S.scanner); bx(0.09, 0.01, 0.1, K.E('#7ad0ff', 0.8), 0, 0.05, -0.03, S.scanner, { cast: false }); bx(0.08, 0.06, 0.08, '#f2c230', 0, 0, 0.12, S.scanner);
  // depot banner (fictional company)
  sign(10, 1.4, 1400, 196, (g, W, H) => { rr(g, 4, 4, W - 8, H - 8, 24, '#7a5424', '#1a1416', 8); txt(g, 'Blitzpaket', W / 2 + 40, H / 2 + 6, 130, '#f2c230', { stroke: '#1a1416', sw: 12 }); g.fillStyle = '#f2c230'; g.beginPath(); g.moveTo(250, 30); g.lineTo(300, 30); g.lineTo(275, 95); g.lineTo(310, 95); g.lineTo(230, 175); g.lineTo(255, 110); g.lineTo(220, 110); g.closePath(); g.fill(); }, -2, 6.2, -10.8, G);
  // brown vans silhouettes in the yard (seen through door)
  for (const z of [-2, 2]) { const v = grp(G, 22, 0, z); bx(5, 2.6, 2.2, '#7a5424', 0, 0.3, 0, v); bx(1.5, 1.4, 2.0, '#f2c230', 2.0, 1.4, 0, v); }
  for (let i = 0; i < 6; i++) S['lamp' + i] = glow(1.2, '255,240,210', -10 + i * 4, 7.6, 0, G, 0.4);
  return { G, S };
}
export function updateDepot(A, W, t) { const S = A.S; S.cvBoxes.forEach((b, i) => { b.position.x = ((t * 1.2 + i * 2) % 16) - 8; }); S.scanner.visible = !(W.depot && W.depot.scannerHidden); }

// ---------------------------------------------------------------- sports car (hero prop)
export function sportsCar(parent, col = '#ffd200') {
  const C = grp(parent), body = K.C(col), wheels = [];
  const shape = new K.THREE.Shape(); shape.moveTo(-2.2, 0.25); shape.lineTo(2.25, 0.25); shape.lineTo(2.3, 0.55); shape.lineTo(1.2, 0.75); shape.lineTo(0.3, 1.15); shape.lineTo(-0.9, 1.15); shape.lineTo(-1.9, 0.85); shape.lineTo(-2.25, 0.8); shape.closePath();
  const geo = new K.THREE.ExtrudeGeometry(shape, { depth: 1.8, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }); geo.translate(0, 0, -0.9);
  K.add(geo, body, 0, 0, 0, C);
  const glass = new K.THREE.Shape(); glass.moveTo(1.1, 0.78); glass.lineTo(0.3, 1.1); glass.lineTo(-0.85, 1.1); glass.lineTo(-1.5, 0.86); glass.closePath();
  const gg = new K.THREE.ExtrudeGeometry(glass, { depth: 1.6, bevelEnabled: false }); gg.translate(0, 0.02, -0.8); K.add(gg, K.C('#1a2a3a'), 0, 0, 0, C);
  for (const [x, z] of [[-1.4, 0.92], [1.45, 0.92], [-1.4, -0.92], [1.45, -0.92]]) { const w = grp(C, x, 0.36, z); cyl(0.36, 0.36, 0.28, '#16161a', 0, -0.14, 0, w, { rx: Math.PI / 2 }); cyl(0.22, 0.22, 0.3, '#c8ccd4', 0, -0.15, 0, w, { rx: Math.PI / 2 }); wheels.push(w); }
  sph(0.12, K.E('#fffbe0', 1.5), 2.22, 0.5, 0.6, C, { sc: [0.6, 0.6, 1.4] }); sph(0.12, K.E('#fffbe0', 1.5), 2.22, 0.5, -0.6, C, { sc: [0.6, 0.6, 1.4] });
  bx(0.08, 0.12, 1.6, K.E('#ff3a2a', 1.0), -2.28, 0.6, 0, C, { cast: false });
  bx(0.5, 0.06, 1.8, body, -2.0, 1.05, 0, C); // spoiler
  C.userData.wheels = wheels; return C;
}
// ---------------------------------------------------------------- CITY street (dealer + towers)
export function buildCity(root) {
  const G = grp(root), S = {};
  floor(200, 14, TX.asphalt, 0, 0, 0, G);
  floor(200, 6, TX.sidewalk, 0, 0.15, -10, G); floor(200, 6, TX.sidewalk, 0, 0.15, 10, G);
  for (let x = -96; x < 100; x += 6) bx(3, 0.01, 0.15, K.B('#f4f0e0'), x, 0.005, 0, G, { cast: false });
  // penthouse tower (x = 0, far side)
  const tw = grp(G, 0, 0, -26); S.tower = tw;
  const glassT = K.toon({ map: rtex(256, 512, (g, W, H) => { g.fillStyle = '#5a7a9a'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 32) for (let x = 0; x < W; x += 32) { g.fillStyle = (x * y) % 7 ? '#8ab0d0' : '#b8d8f0'; g.fillRect(x + 2, y + 2, 28, 28); } }, 4, 12) });
  bx(18, 60, 18, glassT, 0, 0, 0, tw); bx(14, 3.5, 14, K.C('#e8f4ff', { transparent: true, opacity: 0.6 }), 0, 60, 0, tw); bx(18.4, 0.6, 18.4, '#f4f4f0', 0, 60, 0, tw);
  for (let y = 0; y < 60; y += 4) bx(18.3, 0.25, 18.3, '#e8ecf0', 0, y, 0, tw, { cast: false });
  // von Hahn's glass tower (x = 60)
  const gt = grp(G, 70, 0, -40); S.glassTower = gt;
  const blueT = K.toon({ map: rtex(256, 512, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#3a6ab0'); gr.addColorStop(1, '#8ac8f0'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 3; for (let y = 0; y < H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } }, 3, 14) });
  bx(22, 120, 22, blueT, 0, 0, 0, gt); bx(16, 10, 16, blueT, 0, 120, 0, gt); cyl(0.3, 0.3, 14, '#e8ecf0', 0, 130, 0, gt);
  // dealership (x = -22): glass showroom, spotlight
  const dl = grp(G, -24, 0.15, -16); S.dealer = dl;
  bx(16, 0.1, 9, '#f4f4f4', 0, 0, 0, dl); bx(16, 5, 0.2, '#e8e8ec', 0, 0, -4.5, dl); bx(16, 0.4, 9.2, '#2a2a30', 0, 5, 0, dl);
  for (let i = 0; i < 5; i++) bx(0.12, 5, 0.12, '#c8ccd4', -8 + i * 4, 0, 4.5, dl, { cast: false });
  sign(7, 1, 1050, 150, (g, W, H) => { rr(g, 0, 0, W, H, 20, '#1a1a22'); txt(g, 'AUTOHAUS', W / 2, H / 2 + 4, 110, '#ffd200'); }, 0, 5.7, 4.65, dl);
  S.car1 = sportsCar(G); S.car1.position.set(-26, 0.25, -14); S.car1.rotation.y = 0.5;
  S.car2 = sportsCar(G); S.car2.position.set(-20, 0.25, -13.5); S.car2.rotation.y = 0.3;
  S.spot = beam(5, 7, '255,250,220', 0.25, -24, 3.5, -14, G);
  // transporter truck (for "verkauft")
  const tr = grp(G, 0, 0, 3); S.truck = tr; bx(2.6, 2.8, 2.5, '#3a6ac8', 6.5, 0.4, 0, tr); bx(11, 0.4, 2.5, '#5a5a64', 0, 0.8, 0, tr); for (const x of [-4, -2, 3, 6]) for (const z of [1.2, -1.2]) cyl(0.5, 0.5, 0.35, '#16161a', x, 0.1, z, tr, { rx: Math.PI / 2 }); tr.visible = false;
  // opposite sidewalk: newsstand + lamp + bench where the grey men stand
  const ns = grp(G, 6, 0.15, 11); bx(2.4, 2.2, 1.6, '#2a6a4a', 0, 0, 0, ns); bx(2.8, 0.15, 2.0, '#1a4a32', 0, 2.2, 0, ns); for (let i = 0; i < 5; i++) bx(0.35, 0.45, 0.04, K.C(['#f4f0e0', '#e8d0d0', '#d0e0f0'][i % 3]), -0.9 + i * 0.45, 1.0, -0.82, ns, { cast: false });
  for (let x = -60; x < 80; x += 14) { const lg = grp(G, x, 0.15, 7.5); cyl(0.06, 0.08, 5, '#2a2a30', 0, 0, 0, lg); bx(0.6, 0.15, 0.4, '#2a2a30', 0, 5, -0.2, lg); }
  // more city: far towers and side buildings
  const r = rngf(12), side = [];
  for (let i = 0; i < 16; i++) { const x = -100 + i * 13 + r() * 3; if (Math.abs(x) < 12 || Math.abs(x + 24) < 10) continue; side.push([x, 0, -24 - r() * 4, 11, 14 + r() * 30, 12]); }
  for (let i = 0; i < 16; i++) side.push([-100 + i * 13, 0, 24 + r() * 4, 11, 10 + r() * 24, 12]);
  const fm = K.toon({ map: rtex(256, 512, (g, W, H) => { g.fillStyle = '#c8b8a8'; g.fillRect(0, 0, W, H); for (let y = 10; y < H; y += 40) for (let x = 12; x < W; x += 42) { g.fillStyle = '#4a5a7a'; g.fillRect(x, y, 26, 26); } }, 2, 3) });
  instBoxes(side, fm, G, true);
  S.sky = skyline(G, 8, { r0: 140, r1: 400, n: 80, minH: 30, maxH: 140 });
  // window glow layer for night (towers)
  S.trees = []; for (let x = -80; x < 80; x += 10) { const tg = grp(G, x + 5, 0.15, -8); cyl(0.1, 0.15, 2.6, '#6a4a32', 0, 0, 0, tg); sph(1.1, '#5aa040', 0, 3.2, 0, tg, { sc: [1, 0.9, 1] }); }
  return { G, S };
}
export function updateCity(A, W, t) {
  const S = A.S, c = W.city || {};
  const p1 = c.car1, p2 = c.car2;
  if (p1) { S.car1.position.set(p1[0], p1[3] ?? 0.25, p1[1]); S.car1.rotation.y = p1[2] ?? 0.5; S.car1.userData.wheels.forEach((w) => (w.rotation.z = -p1[0] * 2.5)); }
  if (p2) { S.car2.position.set(p2[0], 0.25, p2[1]); S.car2.rotation.y = p2[2] ?? 0.3; S.car2.userData.wheels.forEach((w) => (w.rotation.z = -p2[0] * 2.5)); }
  S.car1.visible = c.car1 !== null; S.car2.visible = c.car2 !== null;
  S.truck.visible = !!c.truck; if (c.truck) { S.truck.position.x = c.truck; }
  S.spot.visible = !!c.spot;
}

// ---------------------------------------------------------------- PENTHOUSE (living room + terrace pool + bathroom)
export function goldToilet(parent) {
  const T = grp(parent), gold = K.C('#f2c540', { emissive: '#7a5a10', emissiveIntensity: 0.35 });
  cyl(0.18, 0.13, 0.38, gold, 0, 0, 0.05, T, { seg: 24 }); const bowl = sph(0.26, gold, 0, 0.42, 0.1, T, { sc: [1, 0.55, 1.25], seg: 24 });
  cyl(0.27, 0.27, 0.04, gold, 0, 0.46, 0.1, T, { seg: 24 }); bx(0.5, 0.42, 0.2, gold, 0, 0.42, -0.26, T); bx(0.54, 0.05, 0.24, gold, 0, 0.84, -0.26, T);
  const lid = grp(T, 0, 0.5, -0.12); const lm = cyl(0.27, 0.27, 0.03, gold, 0, 0, 0.22, lid, { seg: 24 }); lm.scale.z = 1.2; lid.rotation.x = -1.35;
  sph(0.03, gold, 0.18, 0.78, -0.15, T);
  return T;
}
export function buildPent(root) {
  const G = grp(root), S = {};
  // living room (glass box): floor marble, x -8..8, z -6..4; terrace at z 4..14 with pool
  floor(16, 10, TX.marble, 0, 0, -1, G); floor(16, 10, tmat(128, 128, (g) => { g.fillStyle = '#c8a878'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#b8966a'; for (let i = 0; i < 128; i += 16) g.fillRect(0, i, 128, 3); }, 6, 6), 0, 0, 9, G);
  bx(16, 0.2, 10, '#f4f4f0', 0, 3.6, -1, G, { cast: false });
  bx(16, 3.6, 0.2, '#f6f4ee', 0, 0, -6, G); bx(0.2, 3.6, 10, '#f6f4ee', -8, 0, -1, G);
  for (let i = 0; i < 9; i++) bx(0.08, 3.6, 0.08, '#2a2a30', -8 + i * 2, 0, 4, G, { cast: false });
  bx(16, 3.4, 0.02, K.C('#d8f0ff', { transparent: true, opacity: 0.15 }), 0, 0.1, 4, G, { cast: false });
  // right wall with front door (for visitors) at x = 8
  bx(0.2, 3.6, 4, '#f6f4ee', 8, 0, -4, G); bx(0.2, 3.6, 4.6, '#f6f4ee', 8, 0, 1.7, G); bx(0.2, 1.2, 1.4, '#f6f4ee', 8, 2.4, -1.3, G);
  S.door = grp(G, 7.95, 0, -0.6); bx(0.08, 2.4, 1.4, '#2a2a30', 0, 0, -0.7, S.door); bx(0.04, 0.6, 0.06, '#f2c540', -0.06, 1.0, -1.2, S.door);
  floor(3, 4, TX.marble, 9.6, 0, -1.3, G); bx(0.1, 3.6, 4, '#e8e4dc', 11.1, 0, -1.3, G); bx(3, 3.6, 0.1, '#e8e4dc', 9.6, 0, -3.3, G); bx(3, 3.6, 0.1, '#e8e4dc', 9.6, 0, 0.7, G); glow(0.6, '255,236,200', 9.8, 3.2, -1.3, G, 0.4);
  // hero envelopes (DRINGEND) for inserts
  S.heroEnv = grp(G, -13.6, 0.02, -4.2);
  for (let i = 0; i < 4; i++) { const e = grp(S.heroEnv, (i % 2) * 0.32 - 0.1, i * 0.03, Math.floor(i / 2) * 0.26 - 0.1); e.rotation.y = (i - 1.5) * 0.25; bx(0.42, 0.025, 0.3, '#f4ead2', 0, 0, 0, e); sign(0.36, 0.24, 360, 240, (g, W, H) => { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, W, H); g.fillStyle = '#5a5a6a'; g.fillRect(30, 40, 140, 10); g.fillRect(30, 60, 100, 10); g.save(); g.translate(W / 2 + 40, H / 2 + 30); g.rotate(-0.18); g.strokeStyle = '#d0202a'; g.lineWidth = 8; g.strokeRect(-120, -36, 240, 72); txt(g, 'DRINGEND', 0, 2, 50, '#d0202a'); g.restore(); }, 0, 0.027, 0, e, { rx: -Math.PI / 2 }); }
  S.heroEnv.visible = false;
  // furniture: huge white sofa, TV, rug, plants, sneaker display, art
  const sofa = grp(G, -2, 0, -3.2); S.sofa = sofa; bx(5, 0.45, 1.3, '#f8f6f0', 0, 0, 0, sofa); bx(5, 0.6, 0.35, '#f8f6f0', 0, 0.45, -0.5, sofa); bx(0.35, 0.35, 1.3, '#f8f6f0', -2.4, 0.45, 0, sofa); bx(0.35, 0.35, 1.3, '#f8f6f0', 2.4, 0.45, 0, sofa);
  for (let i = 0; i < 4; i++) bx(0.5, 0.45, 0.15, ['#7a3ab0', '#f2c540', '#7a3ab0', '#f2c540'][i], -1.8 + i * 1.2, 0.5, -0.25, sofa);
  floor(6, 3.5, tmat(64, 64, (g) => { g.fillStyle = '#5a2a8a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#f2c540'; g.fillRect(0, 28, 64, 8); }), -2, 0.01, -1.5, G);
  bx(4.4, 2.4, 0.1, '#16161a', -2, 0.8, -5.85, G); S.tvScreen = bx(4.2, 2.2, 0.02, K.E('#3a5ab0', 0.5), -2, 0.9, -5.79, G, { cast: false });
  const disp = grp(G, 5, 0, -5.2); S.display = disp; bx(1.4, 0.9, 0.8, '#f4f4f0', 0, 0, 0, disp); bx(1.3, 0.9, 0.7, K.C('#e8f8ff', { transparent: true, opacity: 0.3 }), 0, 0.9, 0, disp, { cast: false });
  const shoe = grp(disp, 0, 0.98, 0.05); S.shoe = shoe; for (const s of [-0.22, 0.22]) { const sh = grp(shoe, s, 0, 0); bx(0.34, 0.1, 0.14, '#ffffff', 0, 0, 0, sh); bx(0.22, 0.12, 0.13, '#f2f2f2', -0.04, 0.1, 0, sh); bx(0.36, 0.035, 0.15, '#f2c540', 0, -0.01, 0, sh); bx(0.12, 0.06, 0.135, '#7a3ab0', 0.05, 0.06, 0, sh); }
  S.dispGlow = glow(0.9, '255,240,200', 5, 1.5, -5.2, G, 0.5);
  for (const [x, z] of [[-7.2, -5.2], [7.2, -5.2], [-7.2, 3.2]]) { cyl(0.3, 0.25, 0.6, '#f4f4f0', x, 0, z, G); sph(0.6, '#4a9a4a', x, 1.1, z, G, { sc: [1, 1.4, 1] }); }
  sign(2.4, 1.6, 480, 320, (g, W, H) => { g.fillStyle = '#ffd200'; g.fillRect(0, 0, W, H); g.fillStyle = '#7a3ab0'; g.beginPath(); g.arc(W * 0.4, H * 0.5, 100, 0, 7); g.fill(); g.fillStyle = '#e03a5a'; g.fillRect(W * 0.55, 60, 120, 200); }, 4.5, 2.3, -5.88, G, { tone: true });
  // laptop on the floor (night of donations)
  S.laptop = grp(G, -0.4, 0.01, -0.6); bx(0.36, 0.02, 0.25, '#c8ccd4', 0, 0, 0, S.laptop); const lid = grp(S.laptop, 0, 0.02, -0.12); bx(0.36, 0.24, 0.015, '#c8ccd4', 0, 0, 0, lid); lid.rotation.x = -0.25;
  S.laptopScreen = dynSign(0.33, 0.21, 660, 420, 0, 0.12, 0.01, lid, { fog: false }); S.laptopGlow = glow(0.9, '150,200,255', -0.4, 0.35, -0.5, G, 0.55);
  // terrace: pool, loungers, palms, string lights, rail
  const pool = grp(G, 0, 0, 9.5); S.pool = pool;
  for (const [w, d, x, z] of [[7.6, 0.3, 0, 2.15], [7.6, 0.3, 0, -2.15], [0.3, 4.6, 3.65, 0], [0.3, 4.6, -3.65, 0]]) bx(w, 0.22, d, '#f4f4f0', x, 0, z, pool); const water = pl(7, 4, K.waterMat, 0, 0.14, 0, pool, { rx: -Math.PI / 2 }); water.userData.nd = K.waterNd; S.water = water;
  for (const x of [-5.5, 5.5]) { const l = grp(G, x, 0, 8.5); bx(0.8, 0.3, 2, '#f8f6f0', 0, 0, 0, l); const b = bx(0.8, 0.08, 0.8, '#f8f6f0', 0, 0.4, -0.7, l); b.rotation.x = -0.7; }
  for (const x of [-7.5, 7.5]) { cyl(0.12, 0.18, 4, '#8a6a4a', x, 0, 13.2, G, { rz: 0.1 }); for (let k = 0; k < 6; k++) { const lf = bx(2, 0.05, 0.5, '#4aa040', x + Math.cos(k) * 0.9, 4, 13.2 + Math.sin(k) * 0.9, G); lf.rotation.y = k; lf.rotation.z = -0.4; } }
  bx(16, 1.0, 0.08, K.C('#d8f0ff', { transparent: true, opacity: 0.25 }), 0, 0, 14, G, { cast: false }); bx(16, 0.06, 0.1, '#c8ccd4', 0, 1.0, 14, G);
  S.lights = grp(G); for (let i = 0; i < 18; i++) { const x = -8 + i * 0.94, y = 3.3 - Math.sin((i / 17) * Math.PI) * 0.6; sph(0.07, K.E(['#ffd23a', '#ff5aa0', '#5ad0ff'][i % 3], 1.5), x, y, 13.8, S.lights); }
  // party: DJ booth + ice sculpture plinth + fireworks handled as fx
  const dj = grp(G, 5, 0, 12.4); S.dj = dj; bx(2.2, 1.0, 0.8, '#1a1a22', 0, 0, 0, dj); bx(2.3, 0.06, 0.9, K.E('#ff3a8a', 0.8), 0, 1.0, 0, dj); cyl(0.2, 0.2, 0.03, '#2a2a2a', -0.5, 1.05, 0, dj); cyl(0.2, 0.2, 0.03, '#2a2a2a', 0.5, 1.05, 0, dj);
  for (const x of [-1.5, 1.5]) bx(0.6, 1.6, 0.6, '#1a1a22', x, 0, 0.1, dj);
  S.djGlow = glow(2, '255,60,160', 5, 1.6, 12.6, G, 0.5);
  S.icePlinth = bx(1.0, 0.9, 1.0, '#f4f4f0', -4.5, 0, 12.3, G);
  S.iceGlow = glow(1.4, '160,220,255', -4.5, 2.0, 12.3, G, 0.4);
  // party crowd placeholder group (filled from scene.js)
  S.crowdRoot = grp(G);
  // ---- bathroom (separate room behind the left wall: x -16..-8)
  const bath = grp(G, -13, 0, -1); S.bath = bath;
  floor(10, 10, TX.marble, 0, 0, 0, bath); bx(10, 4.2, 0.2, TX.marble, 0, 0, -5, bath); bx(0.2, 4.2, 10, TX.marble, -5, 0, 0, bath); bx(10, 0.2, 10, '#f4f2ee', 0, 4.2, 0, bath, { cast: false });
  S.toilet = goldToilet(bath); S.toilet.position.set(-1.0, 0, -4.2);
  S.toiletGlow = glow(1.2, '255,220,120', -1.0, 0.7, -4.0, bath, 0.45);
  const tub = grp(bath, 2.6, 0, -2.5); sph(1.1, '#f8f6f2', 0, 0.35, 0, tub, { sc: [1.6, 0.45, 1] }); cyl(0.04, 0.04, 0.8, '#f2c540', 1.4, 0.5, -0.3, tub);
  bx(2.4, 1.6, 0.05, K.C('#d8eef8'), 1.5, 1.4, -4.88, bath, { cast: false }); bx(2.6, 1.8, 0.04, '#f2c540', 1.5, 1.3, -4.9, bath);
  bx(1.6, 0.9, 0.6, '#f4f0ea', 1.5, 0, -4.6, bath); cyl(0.3, 0.25, 0.12, '#ffffff', 1.5, 0.9, -4.6, bath);
  // envelope stack (DRINGEND) beside the toilet: instanced
  const r = rngf(31), envs = []; for (let i = 0; i < 80; i++) envs.push([-1.85 + (i % 2) * 0.12 + r() * 0.05, i * 0.035, -4.0 + r() * 0.06, 0.34, 0.03, 0.24, r() * 0.4 - 0.2]);
  S.envs = instBoxes(envs, tmat(128, 64, (g) => { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#d8303a'; g.fillRect(20, 20, 70, 20); }), bath, true); S.envN = envs.length; S.envs.count = 0;
  S.bathLight = glow(2, '255,248,230', 0, 4.0, -2, bath, 0.4);
  // skyline outside
  S.sky = skyline(G, 21, { r0: 70, r1: 300, n: 110, minH: 15, maxH: 90 });
  S.skyN = skyline(G, 22, { r0: 70, r1: 300, n: 110, minH: 15, maxH: 90, night: true }); S.skyN.visible = false;
  // floor drop (the building is high: put the set at y=0 and the skyline sunk)
  S.sky.position.y = -60; S.skyN.position.y = -60;
  return { G, S };
}
export function updatePent(A, W, t) {
  const S = A.S, p = W.pent || {};
  S.sky.visible = !p.night; S.skyN.visible = !!p.night;
  S.lights.visible = !!p.party || !!p.night; S.dj.visible = !!p.party; S.djGlow.visible = !!p.party; S.djGlow.material.opacity = 0.6 + 0.4 * Math.sin(t * 12);
  S.icePlinth.visible = p.ice !== undefined; S.iceGlow.visible = p.ice !== undefined;
  S.envs.count = Math.round((p.env || 0) * S.envN); S.heroEnv.visible = !!p.heroEnv;
  S.door.rotation.y = -(p.door || 0) * 1.3;
  S.laptop.visible = !!p.laptop; S.laptopGlow.visible = !!p.laptop;
  if (p.laptop) S.laptopScreen.draw('l' + p.laptopStep, (g, W_, H) => drawLaptop(g, W_, H, p.laptopStep || 0));
  S.lid = S.toilet.children; // noop
  S.tvScreen.visible = !p.empty; S.display.visible = !p.empty; S.sofa.visible = true;
  if (S.crowd) { S.crowd.groups.forEach((g) => (g.visible = !!p.party)); if (p.party) S.crowd.update(t, K.camera.position, 0.12); }
}
function drawLaptop(g, W, H, step) {
  g.fillStyle = '#f4f6fa'; g.fillRect(0, 0, W, H); g.fillStyle = '#2a5ad0'; g.fillRect(0, 0, W, 50); txt(g, 'Überweisungen', 20, 26, 26, '#fff', { al: 'left' });
  const rows = [['Jugendzentrum', '#ffb84a'], ['Haus · Imbiss am Eck', '#c8202a'], ['Kinderkrankenhaus', '#3ab0ff'], ['Mieten · Kiez', '#6ad04a']];
  rows.forEach(([a, c], i) => { const y = 80 + i * 82; rr(g, 16, y, W - 32, 70, 12, '#ffffff', '#d8dce6', 2); g.fillStyle = c; g.beginPath(); g.arc(50, y + 35, 20, 0, 7); g.fill(); txt(g, a, 84, y + 35, 26, '#1a1a2a', { al: 'left' });
    const done = step > i; if (done) { g.fillStyle = '#2ab070'; g.beginPath(); g.arc(W - 50, y + 35, 22, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(W - 61, y + 35); g.lineTo(W - 53, y + 43); g.lineTo(W - 38, y + 26); g.stroke(); }
    else { rr(g, W - 190, y + 25, 120, 20, 10, '#e2e6ee'); if (step > i - 1 && step < i + 1) rr(g, W - 190, y + 25, 120 * Math.max(0, step - i + 1), 20, 10, '#2a8af0'); } });
}

// ---------------------------------------------------------------- OMA's kitchen
export function buildOma(root) {
  const G = grp(root), S = {};
  floor(6, 5, tmat(128, 128, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#c8503a' : '#e8d8c0'; g.fillRect(i * 32, j * 32, 32, 32); } }, 6, 5), 0, 0, 0, G);
  bx(6, 2.7, 0.12, TX.wallOma, 0, 0, -2.5, G); bx(0.12, 2.7, 5, TX.wallOma, -3, 0, 0, G); bx(0.12, 2.7, 5, TX.wallOma, 3, 0, 0, G); bx(6, 0.1, 5, '#f8f0e0', 0, 2.7, 0, G, { cast: false });
  // window with plants + light
  bx(1.6, 1.3, 0.14, '#f4f0e6', 1.2, 1.0, -2.46, G, { cast: false }); pl(1.4, 1.1, K.B('#e8f4ff'), 1.2, 1.65, -2.42, G, { nd: false });
  bx(0.06, 1.1, 0.06, '#f4f0e6', 1.2, 1.1, -2.38, G, { cast: false }); bx(1.4, 0.06, 0.06, '#f4f0e6', 1.2, 1.62, -2.38, G, { cast: false });
  for (let i = 0; i < 3; i++) { cyl(0.1, 0.08, 0.15, '#c85a3a', 0.7 + i * 0.5, 1.02, -2.32, G); sph(0.14, i % 2 ? '#e03a5a' : '#5aa040', 0.7 + i * 0.5, 1.28, -2.32, G); }
  S.shaft = beam(1.4, 3.5, '255,236,190', 0.35, 1.0, 1.3, -1.2, G, { rx: -0.75 });
  // curtains
  for (const x of [0.25, 2.15]) bx(0.3, 1.4, 0.05, K.C('#f2b0b8'), x, 0.9, -2.36, G);
  // cabinets, stove, kettle, clock, photos
  bx(2.2, 0.9, 0.6, '#9ac0a0', -1.8, 0, -2.15, G); bx(2.2, 0.05, 0.62, '#e8e0cc', -1.8, 0.9, -2.15, G); bx(2.2, 0.8, 0.35, '#9ac0a0', -1.8, 1.6, -2.3, G);
  for (let i = 0; i < 3; i++) sph(0.025, '#e2b84c', -2.5 + i * 0.7, 0.75, -1.84, G);
  cyl(0.12, 0.14, 0.22, '#e03a3a', -1.2, 0.95, -2.1, G);
  const ck = grp(G, -0.2, 2.1, -2.42); cyl(0.22, 0.22, 0.05, '#f4f0e0', 0, 0, 0, ck, { rx: Math.PI / 2 }); S.hand = bx(0.015, 0.16, 0.01, '#1a1a1a', 0, 0, 0.04, ck, { cast: false }); S.hand2 = bx(0.02, 0.11, 0.01, '#1a1a1a', 0, 0, 0.045, ck, { cast: false });
  for (let i = 0; i < 3; i++) sign(0.3, 0.38, 120, 150, (g, W, H) => { g.fillStyle = '#a07a4a'; g.fillRect(0, 0, W, H); g.fillStyle = ['#bfe4f4', '#f4e0b0', '#d0f0c0'][i]; g.fillRect(10, 10, W - 20, H - 20); g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, 60, 22, 0, 7); g.fill(); g.strokeStyle = '#1a1416'; g.lineWidth = 3; g.stroke(); g.fillStyle = i === 1 ? '#8a5530' : '#d8d8dc'; g.beginPath(); g.arc(W / 2, 52, 22, Math.PI, 0); g.fill(); }, -2.94, 1.6, -1.2 + i * 0.45, G, { ry: Math.PI / 2, tone: true });
  // table with floral tablecloth
  const tb = grp(G, 0, 0, 0.2); S.table = tb;
  const cloth = tmat(128, 128, (g) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, 128, 128); for (let y = 8; y < 128; y += 24) for (let x = 8; x < 128; x += 24) { g.fillStyle = '#e8a0b0'; for (let k = 0; k < 5; k++) { const a = k * 1.256; g.beginPath(); g.arc(x + 4 * Math.cos(a), y + 4 * Math.sin(a), 3, 0, 7); g.fill(); } } g.strokeStyle = '#e8a0b0'; g.lineWidth = 6; g.strokeRect(0, 0, 128, 128); }, 2, 2);
  bx(1.8, 0.06, 1.1, cloth, 0, 0.74, 0, tb); bx(1.84, 0.25, 1.14, cloth, 0, 0.52, 0, tb); for (const [x, z] of [[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.45], [0.8, 0.45]]) bx(0.06, 0.52, 0.06, '#8a6a4a', x, 0, z, tb);
  // floral cups (the old cups)
  const cupT = tmat(128, 64, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 64); for (let x = 8; x < 128; x += 32) { g.fillStyle = '#4a7ac8'; for (let k = 0; k < 5; k++) { const a = k * 1.256; g.beginPath(); g.arc(x + 7 * Math.cos(a), 32 + 7 * Math.sin(a), 5, 0, 7); g.fill(); } g.fillStyle = '#f2c84a'; g.beginPath(); g.arc(x, 32, 3, 0, 7); g.fill(); } g.fillStyle = '#e2b84c'; g.fillRect(0, 0, 128, 5); }, 1, 1);
  S.cups = []; for (const [x, z] of [[-0.45, 0.15], [0.45, 0.15], [0, -0.3]]) { const c = grp(tb, x, 0.8, z); cyl(0.055, 0.045, 0.09, cupT, 0, 0, 0, c, { seg: 18 }); cyl(0.09, 0.09, 0.01, cupT, 0, 0, 0, c); const hd = new K.THREE.Mesh(new K.THREE.TorusGeometry(0.03, 0.008, 6, 12), K.C('#ffffff')); hd.position.set(0.065, 0.05, 0); c.add(hd); cyl(0.05, 0.05, 0.01, K.C('#5a3218'), 0, 0.075, 0, c); S.cups.push(c); }
  const pot = grp(tb, 0.1, 0.8, 0.05); cyl(0.1, 0.12, 0.22, cupT, 0, 0, 0, pot); sph(0.04, '#e2b84c', 0, 0.26, 0, pot); S.pot = pot;
  // chairs
  for (const [x, z, ry] of [[-1.15, 0.2, Math.PI / 2], [1.15, 0.2, -Math.PI / 2], [0, 1.0, Math.PI]]) { const c = grp(G, x, 0, z, ry); bx(0.45, 0.05, 0.45, '#8a6a4a', 0, 0.45, 0, c); bx(0.45, 0.55, 0.05, '#8a6a4a', 0, 0.45, -0.2, c); }
  // big 5-tier gold cake
  const cake = grp(tb, -0.2, 0.8, -0.1); S.cake = cake; const goldLeaf = K.C('#f2c540', { emissive: '#6a4a10', emissiveIntensity: 0.3 });
  for (let i = 0; i < 5; i++) { const r = 0.32 - i * 0.055; cyl(r, r, 0.16, '#fff4f8', 0, i * 0.16, 0, cake, { seg: 24 }); cyl(r + 0.005, r + 0.005, 0.03, goldLeaf, 0, i * 0.16 + 0.13, 0, cake, { seg: 24 }); }
  sph(0.05, '#e03a5a', 0, 0.85, 0, cake);
  // small birthday cake with a candle (flashback)
  const sc = grp(tb, 0, 0.8, -0.05); S.smallCake = sc; cyl(0.14, 0.14, 0.1, '#f8e0c8', 0, 0, 0, sc); cyl(0.145, 0.145, 0.02, '#e03a5a', 0, 0.1, 0, sc); cyl(0.008, 0.008, 0.08, '#4a7ac8', 0, 0.12, 0, sc); S.flame = sph(0.015, K.E('#ffb020', 2), 0, 0.22, 0, sc, { sc: [1, 1.8, 1] }); S.candleGlow = glow(0.25, '255,180,60', 0, 1.0, 0.15, G, 0.7);
  // bouquet (huge) in a vase
  const bq = grp(G, 2.2, 0, -1.6); S.bouquet = bq; cyl(0.18, 0.14, 0.5, '#4a7ac8', 0, 0, 0, bq); const r = rngf(3);
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = r() * 0.55, y = 0.9 + r() * 0.7; sph(0.09 + r() * 0.05, ['#e0385a', '#f6a0c0', '#ffd23a', '#ffffff', '#c05ad8'][i % 5], Math.cos(a) * d, y, Math.sin(a) * d, bq); }
  for (let i = 0; i < 10; i++) { const a = i * 0.6; const lf = bx(0.05, 0.5, 0.18, '#4a9a4a', Math.cos(a) * 0.2, 0.5, Math.sin(a) * 0.2, bq); lf.rotation.z = Math.cos(a) * 0.5; lf.rotation.x = Math.sin(a) * 0.5; }
  // döner plates (ending)
  S.plates = grp(tb); for (const [x, z] of [[-0.55, 0.25], [0.55, 0.25], [0, 0.35]]) { cyl(0.16, 0.14, 0.02, '#ffffff', x, 0.8, z, S.plates); const d = grp(S.plates, x, 0.82, z); sph(0.1, '#e2a85a', 0, 0.04, 0, d, { sc: [1.3, 0.5, 0.9] }); sph(0.04, '#5ab04a', 0.03, 0.08, 0, d); sph(0.04, '#b8682a', -0.03, 0.08, 0.02, d); }
  // phone on the table (ending)
  S.phone = makePhone(tb, 0.16); S.phone.group.position.set(0.5, 0.815, -0.25); S.phone.group.rotation.x = -Math.PI / 2;
  S.lamp = glow(1.3, '255,220,160', 0, 2.3, 0.2, G, 0.45); const lp = grp(G, 0, 2.3, 0.2); cyl(0.01, 0.01, 0.4, '#3a3a3a', 0, 0, 0, lp); cyl(0.05, 0.3, 0.22, '#e8a050', 0, -0.2, 0, lp, { open: true });
  return { G, S };
}
export function updateOma(A, W, t) {
  const S = A.S, o = W.oma || {};
  S.cake.visible = !!o.cake; S.bouquet.visible = !!o.bouquet; S.smallCake.visible = !!o.smallCake; S.candleGlow.visible = !!o.smallCake; S.flame.scale.set(1, 1.8 + Math.sin(t * 20) * 0.3, 1);
  S.plates.visible = !!o.plates; S.cups.forEach((c) => (c.visible = o.cups !== false)); S.pot.visible = o.cups !== false;
  S.phone.group.visible = !!o.phone; if (o.phone) { S.phone.setState(o.phone); const v = o.buzz || 0; S.phone.group.position.x = 0.5 + Math.sin(t * 120) * 0.006 * v; S.phone.group.rotation.z = Math.sin(t * 95) * 0.05 * v; }
  S.hand.rotation.z = -t * 0.5; S.hand2.rotation.z = -t * 0.04;
}
