// sets1.js: Leon's flat, stairwell, the Kiez street (Imbiss am Eck, Jugendzentrum, Spielplatz, Bäckerei, Briefkästen, Bus 47), Imbiss interior.
import { sportsCar } from './sets2.js';
import { K, bx, cyl, sph, grp, pl, floor, sign, txt, rr, beam, glow, rngf, instBoxes, skyline, dynSign, facadeTex } from './common.js';

export const rtex = (pw, ph, draw, rx = 1, ry = 1) => { const t = K.canvasTex(pw, ph, draw); t.wrapS = t.wrapT = K.THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
export const tmat = (pw, ph, draw, rx = 1, ry = 1, extra = {}) => K.toon({ map: rtex(pw, ph, draw, rx, ry), ...extra });
export const TX = {};
export function textures() {
  const r = rngf(5);
  TX.planks = K.texM(K.P.planks(3), 3, 3); TX.planksD = K.texM(K.P.planks(7), 4, 4, '#b89a80');
  TX.wallpaper = tmat(256, 256, (g, W, H) => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, W, H); for (let x = 0; x < W; x += 32) { g.fillStyle = 'rgba(150,120,80,0.25)'; g.fillRect(x, 0, 10, H); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,100,70,0.12)'; g.fillRect(r() * W, r() * H, 20, 30); } }, 3, 2);
  TX.wallOma = tmat(256, 256, (g, W, H) => { g.fillStyle = '#f2dcc0'; g.fillRect(0, 0, W, H); for (let y = 16; y < H; y += 64) for (let x = 16; x < W; x += 64) { const o = (y / 64) % 2 ? 32 : 0; g.fillStyle = '#e8a0a8'; for (let k = 0; k < 5; k++) { const a = k * 1.256; g.beginPath(); g.arc(x + o + 9 * Math.cos(a), y + 9 * Math.sin(a), 6, 0, 7); g.fill(); } g.fillStyle = '#f2c84a'; g.beginPath(); g.arc(x + o, y, 4, 0, 7); g.fill(); g.fillStyle = '#8ab070'; g.fillRect(x + o - 1, y + 12, 2, 14); } }, 4, 2);
  TX.tiles = tmat(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e8e4dc' : '#c8c0b4'; g.fillRect(i * 32, j * 32, 32, 32); } }, 6, 6);
  TX.whiteTiles = tmat(256, 256, (g, W, H) => { g.fillStyle = '#f4f2ee'; g.fillRect(0, 0, W, H); g.strokeStyle = '#d4d0ca'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, H); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } }, 4, 3);
  TX.asphalt = tmat(512, 512, (g, W, H) => { g.fillStyle = '#4a4a52'; g.fillRect(0, 0, W, H); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${0.05 + r() * 0.08})`; g.fillRect(r() * W, r() * H, 2, 2); } }, 20, 4);
  TX.sidewalk = tmat(256, 256, (g, W, H) => { g.fillStyle = '#b8b0a4'; g.fillRect(0, 0, W, H); g.strokeStyle = '#8e867a'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, H); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(r() * W, r() * H, 3, 3); } }, 30, 2);
  TX.brick = tmat(256, 256, (g, W, H) => { g.fillStyle = '#7a4a3a'; g.fillRect(0, 0, W, H); for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { const o = j % 2 ? 16 : 0; g.fillStyle = `hsl(${10 + r() * 10},${40 + r() * 15}%,${36 + r() * 12}%)`; g.fillRect(i * 32 + o + 1, j * 16 + 1, 30, 14); } }, 4, 4);
  TX.cardboard = tmat(128, 128, (g, W, H) => { g.fillStyle = '#c8965a'; g.fillRect(0, 0, W, H); g.fillStyle = '#b07e44'; g.fillRect(0, H / 2 - 8, W, 16); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, H / 2 - 3, W, 6); }, 1, 1);
  TX.metal = K.toon({ color: '#c8ccd4' });
  TX.marble = K.texM(K.P.marble(10), 2, 2);
}
const cardboardBox = (w, h, d, x, y, z, parent, ry = 0) => { const m = bx(w, h, d, TX.cardboard, x, y, z, parent); m.rotation.y = ry; return m; };

// ---------------------------------------------------------------- APT
export function buildApt(root) {
  const G = grp(root), S = {};
  floor(4.6, 4.2, TX.planks, 0, 0, 0, G);
  const wallM = TX.wallpaper;
  bx(4.6, 2.8, 0.12, wallM, 0, 0, -2.1, G); // back
  bx(0.12, 2.8, 4.2, wallM, -2.3, 0, 0, G); // left
  // right wall with door gap (door at z = -0.9)
  bx(0.12, 2.8, 2.4, wallM, 2.3, 0, 0.9, G); bx(0.12, 2.8, 0.7, wallM, 2.3, 0, -1.75, G); bx(0.12, 0.5, 1.1, wallM, 2.3, 2.3, -0.85, G);
  bx(4.6, 0.1, 4.2, '#efe6d6', 0, 2.8, 0, G, { cast: false }); // ceiling
  // skirting
  bx(4.6, 0.1, 0.03, '#f4efe6', 0, 0, -2.03, G);
  // door (pivot) + frame
  const door = grp(G, 2.27, 0, -0.3); bx(0.06, 2.2, 1.1, '#8a6a4a', 0, 0, -0.55, door); sph(0.05, '#e2b84c', -0.06, 1.05, -0.95, door);
  bx(0.14, 2.3, 0.08, '#f4efe6', 2.3, 0, -0.26, G); bx(0.14, 2.3, 0.08, '#f4efe6', 2.3, 0, -1.44, G);
  S.door = door;
  floor(3, 3, TX.tiles, 3.8, 0, -0.85, G); bx(0.1, 2.8, 3, '#b8c49a', 5.0, 0, -0.85, G); bx(3, 2.8, 0.1, '#b8c49a', 3.7, 0, -2.3, G); bx(3, 2.8, 0.1, '#b8c49a', 3.7, 0, 0.6, G); glow(0.5, '255,230,170', 4.2, 2.5, -0.85, G, 0.4);
  // window on back wall + city backdrop
  bx(1.5, 1.4, 0.16, '#f4efe6', 0.9, 1.0, -2.04, G, { cast: false });
  const city = sign(1.34, 1.24, 512, 480, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7ab0e8'); gr.addColorStop(1, '#d8e8f4'); g.fillStyle = gr; g.fillRect(0, 0, W, H); const r = rngf(3); for (let i = 0; i < 14; i++) { const x = r() * W, w = 40 + r() * 70, h = 120 + r() * 260; g.fillStyle = ['#8a98b0', '#a8a0a0', '#9aa8b8'][i % 3]; g.fillRect(x, H - h, w, h); g.fillStyle = '#d8e4f0'; for (let yy = H - h + 10; yy < H; yy += 22) for (let xx = x + 6; xx < x + w - 8; xx += 14) g.fillRect(xx, yy, 7, 10); } }, 0.9, 1.72, -2.11, G, { nd: false });
  S.cityWin = city;
  bx(0.06, 1.24, 0.06, '#f4efe6', 0.9, 1.08, -2.0, G, { cast: false }); bx(1.34, 0.06, 0.06, '#f4efe6', 0.9, 1.7, -2.0, G, { cast: false });
  bx(1.7, 0.06, 0.22, '#f4efe6', 0.9, 0.98, -1.95, G); // sill
  // radiator under window (old, ribbed)
  const rad = grp(G, 0.9, 0.18, -1.9); for (let i = 0; i < 9; i++) bx(0.09, 0.62, 0.12, '#e8e2d4', -0.48 + i * 0.12, 0, 0, rad); bx(1.12, 0.06, 0.08, '#d8d0c0', 0, 0.04, 0, rad); cyl(0.03, 0.03, 0.2, '#b8b0a0', 0.62, -0.18, 0, rad); sph(0.05, '#c03030', 0.62, 0.48, 0.02, rad);
  S.rad = rad;
  // bed (left)
  const bed = grp(G, -1.55, 0, -0.95); bx(1.4, 0.32, 2.1, '#6a4a3a', 0, 0, 0, bed); bx(1.34, 0.18, 2.0, '#f4f0e6', 0, 0.32, 0, bed); bx(1.42, 0.9, 0.08, '#6a4a3a', 0, 0, -1.05, bed);
  const pillow = bx(0.9, 0.14, 0.4, '#ffffff', 0, 0.5, -0.78, bed); pillow.scale.set(1, 1, 1);
  const blanket = bx(1.38, 0.14, 1.2, tmat(128, 128, (g) => { g.fillStyle = '#4a7ac8'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#3a62a8'; for (let i = 0; i < 128; i += 32) { g.fillRect(i, 0, 14, 128); g.fillRect(0, i, 128, 14); } }, 2, 2), 0, 0.46, 0.35, bed);
  S.bed = bed; S.blanket = blanket;
  // nightstand + alarm clock
  const ns = grp(G, -0.55, 0, -1.75); bx(0.5, 0.55, 0.4, '#8a6a4a', 0, 0, 0, ns); const clock = grp(ns, 0, 0.55, 0.05); sph(0.11, '#e03a3a', 0, 0.12, 0, clock, { sc: [1, 1, 0.6] }); sign(0.15, 0.15, 128, 128, (g) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#1a1416'; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 22); g.moveTo(64, 64); g.lineTo(92, 64); g.stroke(); }, 0, 0.12, 0.068, clock, { transparent: true }); sph(0.04, '#e2b84c', -0.07, 0.24, 0, clock); sph(0.04, '#e2b84c', 0.07, 0.24, 0, clock);
  S.clock = clock;
  const lamp = grp(ns, -0.12, 0.55, -0.05); cyl(0.02, 0.02, 0.3, '#3a3a3a', 0, 0, 0, lamp); cyl(0.08, 0.14, 0.16, K.E('#ffd890', 0.6), 0, 0.28, 0, lamp); S.lampGlow = glow(0.5, '255,200,120', -0.67, 0.95, -1.8, G, 0.5);
  // fridge (right front) with door pivot
  const fr = grp(G, 1.85, 0, 1.2); bx(0.7, 0.05, 0.65, '#f2f2ee', 0, 0, 0, fr); bx(0.7, 0.05, 0.65, '#f2f2ee', 0, 1.55, 0, fr); bx(0.05, 1.6, 0.65, '#f2f2ee', -0.325, 0, 0, fr); bx(0.05, 1.6, 0.65, '#f2f2ee', 0.325, 0, 0, fr); bx(0.7, 1.6, 0.05, '#f2f2ee', 0, 0, -0.3, fr); bx(0.66, 0.02, 0.6, '#d8d8d4', 0, 1.1, 0, fr, { cast: false });
  const inner = grp(fr, 0, 0, 0.33); bx(0.6, 1.5, 0.02, K.E('#dff4ff', 0.4), 0, 0.05, -0.6, inner, { cast: false });
  for (const y of [0.45, 0.85, 1.2]) bx(0.6, 0.02, 0.55, '#e8f4fa', 0, y, -0.32, inner, { cast: false });
  const jar = grp(inner, 0.02, 0.87, -0.3); cyl(0.07, 0.07, 0.17, K.C('#9ad06a', { transparent: true, opacity: 0.85 }), 0, 0, 0, jar); cyl(0.075, 0.075, 0.04, '#e03a3a', 0, 0.17, 0, jar);
  for (let i = 0; i < 4; i++) cyl(0.018, 0.018, 0.12, '#4a7a2a', -0.03 + (i % 2) * 0.05, 0.02, -0.02 + Math.floor(i / 2) * 0.04, jar);
  S.jar = jar; S.fridgeLight = glow(0.5, '200,235,255', 1.85, 0.95, 1.1, G, 0.0);
  const fdoor = grp(fr, -0.35, 0, 0.33); bx(0.7, 1.58, 0.05, '#f6f6f2', 0.35, 0.01, 0.02, fdoor); bx(0.04, 0.5, 0.04, '#b8b8c0', 0.62, 0.9, 0.07, fdoor);
  S.fdoor = fdoor; S.fridge = fr;
  // table + chair + laptop-free clutter: pizza box, mug, posters
  const tb = grp(G, 1.1, 0, -0.5); bx(0.9, 0.05, 0.6, '#a07a52', 0, 0.72, 0, tb); for (const [x, z] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) bx(0.05, 0.72, 0.05, '#7a5a3a', x, 0, z, tb);
  cardboardBox(0.4, 0.04, 0.4, 0.15, 0.77, 0, tb, 0.3); cyl(0.04, 0.04, 0.1, '#e8d6a0', -0.25, 0.77, 0.1, tb);
  const ch = grp(G, 1.1, 0, 0.1); bx(0.42, 0.05, 0.42, '#7a5a3a', 0, 0.45, 0, ch); bx(0.42, 0.5, 0.05, '#7a5a3a', 0, 0.45, 0.2, ch); for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) bx(0.04, 0.45, 0.04, '#6a4a2a', x, 0, z, ch);
  sign(0.6, 0.85, 300, 420, (g, W, H) => { g.fillStyle = '#2a3a6a'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(W / 2, H * 0.4, 80, 0, 7); g.fill(); g.fillStyle = '#ff5a5a'; g.fillRect(40, H - 120, W - 80, 30); g.fillStyle = '#fff'; g.fillRect(60, H - 70, W - 120, 16); }, -0.9, 1.75, -2.03, G, { tone: true });
  sign(0.5, 0.5, 256, 256, (g, W, H) => { g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, W, H); g.fillStyle = '#e03a3a'; g.fillRect(20, 20, W - 40, 60); g.fillStyle = '#3a3a44'; for (let i = 0; i < 6; i++) g.fillRect(30, 100 + i * 22, W - 60 - (i % 3) * 30, 10); }, -2.23, 1.6, -0.2, G, { ry: Math.PI / 2, tone: true });
  // courier jacket hook + cap
  sph(0.03, '#3a3a3a', -2.22, 1.7, 0.9, G); bx(0.04, 0.6, 0.45, '#b8862e', -2.2, 1.05, 0.9, G);
  // laundry pile, shoes
  sph(0.25, '#5a8ac8', -0.6, 0.08, 1.4, G, { sc: [1.4, 0.4, 1] }); sph(0.2, '#c84a4a', -0.35, 0.1, 1.55, G, { sc: [1.2, 0.5, 1] });
  // cardboard stack (shown progressively: Tag 1 evening)
  const r = rngf(17), boxes = [];
  for (let layer = 0; layer < 6; layer++) for (let i = 0; i < 6; i++) boxes.push([-2.0 + (i % 2) * 0.55 + r() * 0.05, layer * 0.46, 0.35 + Math.floor(i / 2) * 0.55, 0.5, 0.44, 0.5, r() * 0.3 - 0.15]);
  for (let layer = 0; layer < 6; layer++) for (let i = 0; i < 4; i++) boxes.push([1.75 + (i % 2) * 0.5 * 0, layer * 0.46, -1.85 + i * 0.52, 0.5, 0.44, 0.5, r() * 0.3 - 0.15]);
  for (let layer = 0; layer < 5; layer++) for (let i = 0; i < 2; i++) boxes.push([-0.5 + i * 0.55, layer * 0.46, -1.85, 0.5, 0.44, 0.45, r() * 0.2]);
  boxes.sort((a, b) => a[1] - b[1]);
  const stack = instBoxes(boxes, TX.cardboard, G, true); stack.count = 0; S.stack = stack; S.stackN = boxes.length;
  // drop-in purchase boxes (coffee machine / TV / e-bike)
  S.drops = [[0.6, 0.5, 0.5, -0.2, 0.3], [1.3, 0.85, 0.2, 0.35, 0.9], [1.6, 1.0, 0.3, -0.7, 1.5]].map(([w, h, d, x, z], i) => { const g = grp(G, x, 0, z); cardboardBox(w, h, d, 0, 0, 0, g, 0); sign(w * 0.5, h * 0.5, 200, 200, (c, W, H) => { c.fillStyle = '#f4ead2'; c.fillRect(0, 0, W, H); c.strokeStyle = '#3a2a1a'; c.lineWidth = 10; if (i === 0) { c.strokeRect(60, 50, 80, 90); c.beginPath(); c.arc(100, 150, 22, 0, 7); c.stroke(); } if (i === 1) { c.strokeRect(30, 50, 140, 90); c.beginPath(); c.moveTo(80, 160); c.lineTo(120, 160); c.stroke(); } if (i === 2) { c.beginPath(); c.arc(55, 130, 35, 0, 7); c.arc(145, 130, 35, 0, 7); c.stroke(); c.beginPath(); c.moveTo(55, 130); c.lineTo(100, 70); c.lineTo(145, 130); c.stroke(); } }, 0, h / 2, d / 2 + 0.005, g, { tone: true }); g.visible = false; return g; });
  // phone holder spot + laptop (later) — laptop lives in penthouse
  // ceiling bulb
  cyl(0.01, 0.01, 0.4, '#3a3a3a', 0, 2.4, 0, G); sph(0.08, K.E('#fff2c8', 1.2), 0, 2.36, 0, G); S.bulb = glow(0.7, '255,230,170', 0, 2.36, 0, G, 0.6);
  // landlord envelope on the floor at the door
  S.letter = grp(G, 1.9, 0.01, -0.9); bx(0.32, 0.01, 0.22, '#f4ead2', 0, 0, 0, S.letter); bx(0.12, 0.012, 0.06, '#d8303a', -0.06, 0, 0.05, S.letter); S.letter.rotation.y = 0.4;
  // window light shaft
  S.shaft = beam(1.2, 3.2, '255,236,190', 0.32, 0.8, 1.2, -1.2, G, { rx: -0.9 });
  return { G, S };
}
export function updateApt(A, W, t) {
  const S = A.S, a = W.apt || {};
  S.door.rotation.y = -(a.door || 0) * 1.4;
  S.fdoor.rotation.y = -(a.fridge || 0) * 1.6; S.fridgeLight.material.opacity = (a.fridge || 0); S.fridgeLight.visible = (a.fridge || 0) > 0.05;
  const sh = a.radShake || 0; S.rad.position.x = 0.9 + Math.sin(t * 90) * 0.015 * sh; S.rad.rotation.z = Math.sin(t * 70) * 0.03 * sh;
  const cs = a.clockShake || 0; S.clock.rotation.z = Math.sin(t * 80) * 0.25 * cs; S.clock.position.y = 0.55 + Math.abs(Math.sin(t * 60)) * 0.03 * cs;
  S.stack.count = Math.round((a.stack || 0) * S.stackN);
  S.drops.forEach((g, i) => { const d = (a.drops || [])[i]; g.visible = d !== undefined && d > 0; if (g.visible) { const k = Math.min(1, d); const fall = Math.max(0, 1 - k * 2.2); g.position.y = fall * fall * 2.4; g.rotation.z = fall * 0.4 * (i % 2 ? 1 : -1); } });
  S.letter.visible = !!a.letter;
  const night = !!a.night; S.bulb.visible = !night || !!a.bulb; S.lampGlow.visible = !!a.lamp || !night;
  S.shaft.visible = !!a.shaft;
  S.cityWin.material.color.set(night ? '#3a4a7a' : (a.dawn ? '#c8a8c8' : '#ffffff'));
}

// ---------------------------------------------------------------- STAIRS (Treppenhaus)
export function buildStairs(root) {
  const G = grp(root), S = {};
  const wall = tmat(128, 128, (g) => { g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#8aa070'; g.fillRect(0, 64, 128, 64); g.fillStyle = '#5a6a4a'; g.fillRect(0, 62, 128, 4); }, 2, 1);
  const H = 2.9;
  for (let fl = 0; fl < 6; fl++) {
    const y = fl * H, dir = fl % 2 ? -1 : 1;
    bx(2.4, 0.18, 1.6, TX.tiles, (dir > 0 ? -2.4 : 2.4), y - 0.18, -0.4, G, { cast: false }); // landing
    bx(0.2, H, 3.0, wall, -3.7, y, 0, G, { cast: false }); bx(0.2, H, 3.0, wall, 3.7, y, 0, G, { cast: false }); glow(0.6, '255,230,170', dir > 0 ? -2.6 : 2.6, y + 2.6, -1.0, G, 0.5);
    for (let s = 0; s < 14; s++) bx(0.18, H / 14, 1.2, '#b89a7a', (dir > 0 ? -1.2 : 1.2) + dir * s * 0.17, y + s * H / 14, 0.4, G, { t: 0.6, cast: false });
    // railing
    for (let s = 0; s < 14; s += 2) cyl(0.015, 0.015, 0.9, '#3a3a3a', (dir > 0 ? -1.2 : 1.2) + dir * s * 0.17, y + s * H / 14, 0.98, G, { cast: false });
    const hr = bx(2.6, 0.05, 0.06, '#6a3a2a', dir * 0.0, y + H / 2 + 0.9, 0.98, G, { cast: false }); hr.rotation.z = dir * Math.atan2(H, 2.4);
    bx(7.6, H, 0.1, wall, 0, y, -1.25, G, { cast: false });
    // apartment doors on landings
    bx(0.9, 2.05, 0.06, '#7a5a3a', dir > 0 ? -2.6 : 2.6, y, -1.18, G); sph(0.04, '#e2b84c', dir > 0 ? -2.25 : 2.95, y + 1.0, -1.14, G);
    sign(0.3, 0.12, 150, 60, (g, W, Hh) => { g.fillStyle = '#e8e0c8'; g.fillRect(0, 0, W, Hh); txt(g, ['Müller', 'Schmidt', 'Yilmaz', 'Wagner', 'Becker', 'Klein'][fl], W / 2, Hh / 2, 30, '#2a2a2a'); }, dir > 0 ? -2.6 : 2.6, y + 1.5, -1.14, G);
    // window light
    bx(0.8, 1.0, 0.04, K.E('#cfe6ff', 0.8), 0, y + 1.4, -1.19, G, { cast: false });
  }
  S.beam = beam(1.0, 4, '255,240,200', 0.25, 0, 2.2, -0.2, G, { rx: -0.5 });
  bx(7.6, 0.2, 3, '#c8c0b0', 0, -0.2, 0, G, { cast: false }); bx(7.6, 0.2, 3, '#e8e0d0', 0, 6 * H, 0, G, { cast: false });
  return { G, S };
}

// ---------------------------------------------------------------- KIEZ street
const ALT = ['#e8c8a0', '#c8d8b8', '#e8b0a0', '#b8c8e0', '#f0e0a8', '#d8b8d8'];
function altbau(parent, x, w, h, col, seed, opts = {}) {
  const G = grp(parent, x, 0, -8), r = rngf(seed);
  const fac = K.toon({ map: facadeTex(seed, col, 0.15, Math.round(w / 1.6), Math.round(h / 3), false) }); fac.map.wrapS = fac.map.wrapT = K.THREE.RepeatWrapping;
  bx(w, h, 8, K.C(col), 0, 0, -4, G, { cast: true });
  // upper floor windows with frames, balconies
  for (let fy = 1; fy < Math.floor(h / 3); fy++) for (let i = 0; i < Math.floor(w / 1.8); i++) {
    const wx = -w / 2 + 0.9 + i * 1.8 + (w - Math.floor(w / 1.8) * 1.8) / 2, wy = fy * 3 + 0.5;
    bx(1.0, 1.5, 0.08, '#f4efe6', wx, wy, 0.02, G, { cast: false }); bx(0.82, 1.32, 0.1, K.C(r() < 0.25 ? '#ffe2a0' : '#4a5a7a'), wx, wy + 0.09, 0.04, G, { cast: false });
    bx(1.15, 0.12, 0.2, '#f4efe6', wx, wy + 1.55, 0.06, G, { cast: false });
    if (r() < 0.25) { bx(1.4, 0.08, 0.6, '#d8d0c4', wx, wy - 0.15, 0.3, G); for (let k = 0; k < 6; k++) cyl(0.012, 0.012, 0.6, '#3a3a3a', wx - 0.65 + k * 0.26, wy - 0.07, 0.58, G, { cast: false }); bx(1.4, 0.04, 0.04, '#3a3a3a', wx, wy + 0.53, 0.58, G, { cast: false }); if (r() < 0.6) sph(0.18, '#5aa040', wx + 0.4, wy + 0.1, 0.4, G); }
  }
  bx(w + 0.3, 0.35, 0.4, '#f4efe6', 0, h - 0.35, 0.1, G); // cornice
  const rf = bx(w, 1.6, 4, K.C('#9a4a3a'), 0, h, -2, G); rf.rotation.x = -0.4;
  return G;
}
export function buildKiez(root) {
  const G = grp(root), S = {};
  // road + sidewalks + curbs
  floor(140, 10, TX.asphalt, 0, 0, 2, G);
  for (const z of [-5.5, 9.5]) floor(140, 5, TX.sidewalk, 0, 0.15, z, G);
  bx(140, 0.15, 0.25, '#a8a49c', 0, 0, -3.0, G, { cast: false }); bx(140, 0.15, 0.25, '#a8a49c', 0, 0, 7.0, G, { cast: false });
  for (let x = -66; x < 70; x += 6) bx(3, 0.01, 0.15, K.B('#f4f0e0'), x, 0.005, 2, G, { cast: false });
  // facades on the far side (x from -60..60)
  const blocks = [[-48, 12, 15], [-35, 11, 13], [-22, 12, 16], [-9, 12, 15], [4, 11, 14], [16, 12, 16], [29, 12, 15], [42, 12, 13], [55, 12, 16]];
  blocks.forEach(([x, w, h], i) => altbau(G, x, w, h, ALT[i % ALT.length], 30 + i));
  // ---- Imbiss am Eck (x = 4) ground floor shop
  const im = grp(G, 4, 0, -8); S.imbiss = im;
  bx(9, 2.9, 0.3, '#c83a2a', 0, 0, 0.1, im); // red shopfront band
  bx(5.6, 2.2, 0.05, K.C('#bfe4f4', { transparent: true, opacity: 0.55 }), -1.2, 0.25, 0.3, im, { cast: false });
  bx(1.1, 2.3, 0.08, '#6a4a2a', 2.6, 0, 0.3, im);
  const inside = K.E('#ffd890', 0.35); bx(5.4, 2.1, 0.05, inside, -1.2, 0.3, 0.1, im, { cast: false });
  S.imbissSign = sign(6.5, 1.1, 1300, 220, (g, W, H) => { rr(g, 4, 4, W - 8, H - 8, 30, '#ffd23a', '#1a1416', 10); txt(g, 'Imbiss am Eck', W / 2, H / 2 + 6, 150, '#c8202a', { stroke: '#1a1416', sw: 14, fam: 'Georgia, "DejaVu Serif", serif' }); }, 0, 3.55, 0.46, im);
  // menu board outside + awning
  const aw = sign(8.6, 1.2, 860, 120, (g, W, H) => { for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#f6f0e0' : '#c8202a'; g.fillRect(i * W / 14, 0, W / 14, H * 0.75); g.beginPath(); g.arc((i + 0.5) * W / 14, H * 0.75, W / 28, 0, Math.PI); g.fill(); } }, 0, 2.75, 1.0, im, { rx: -0.5, tone: true });
  // note on the window (Miete erhöht ...)
  S.note = sign(0.6, 0.8, 300, 400, (g, W, H) => { g.fillStyle = '#fffdf0'; g.fillRect(0, 0, W, H); g.fillStyle = '#c8c0a0'; g.fillRect(0, 0, W, 8); txt(g, 'Miete erhöht.', W / 2, 110, 36, '#1a1a2a', { fam: '"DejaVu Sans", sans-serif' }); txt(g, 'Wir schließen', W / 2, 190, 34, '#1a1a2a', { w: 'normal' }); txt(g, 'Ende des', W / 2, 245, 34, '#1a1a2a', { w: 'normal' }); txt(g, 'Monats.', W / 2, 300, 34, '#1a1a2a', { w: 'normal' }); g.fillStyle = '#e8c048'; g.fillRect(W / 2 - 40, 0, 80, 26); }, 0.4, 1.6, 0.34, im);
  // tables outside + tea
  for (const x of [-3.2, -1.2]) { cyl(0.35, 0.35, 0.04, '#e8e4dc', x, 0.9, 2.2, im); cyl(0.03, 0.03, 0.9, '#5a5a5a', x, 0.15, 2.2, im); }
  // ---- Jugendzentrum (x = -22): closed / renovated variants
  const jz = grp(G, -22, 0, -8); S.jz = jz;
  S.jzClosed = grp(jz); S.jzOpen = grp(jz);
  bx(4, 2.6, 0.2, '#8a8a84', 0, 0, 0.12, S.jzClosed); for (let i = 0; i < 4; i++) { const b = bx(4.2, 0.22, 0.06, '#8a6a4a', 0, 0.4 + i * 0.6, 0.26, S.jzClosed); b.rotation.z = (i % 2 ? 0.08 : -0.06); }
  S.jzSign = sign(1.1, 0.75, 440, 300, (g, W, H) => { g.fillStyle = '#fffdf0'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c8202a'; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, H - 12); txt(g, 'Wegen', W / 2, 80, 52, '#c8202a'); txt(g, 'Geldmangel', W / 2, 150, 52, '#c8202a'); txt(g, 'geschlossen', W / 2, 220, 52, '#c8202a'); }, 0.2, 1.4, 0.32, S.jzClosed);
  S.jzGraffitiBoard = sign(4, 1.0, 800, 200, (g, W, H) => { g.fillStyle = '#7a7a74'; g.fillRect(0, 0, W, H); txt(g, 'Jugendzentrum', W / 2, H / 2, 110, '#b8b0a0', { fam: 'Georgia, "DejaVu Serif", serif' }); }, 0, 3.4, 0.25, S.jzClosed, { tone: true });
  bx(4.2, 2.8, 0.1, K.C('#ffb84a'), 0, 0, 0.12, S.jzOpen); bx(1.4, 2.2, 0.06, K.E('#ffe8a0', 0.5), 0, 0, 0.2, S.jzOpen, { cast: false });
  sign(4, 1.0, 800, 200, (g, W, H) => { rr(g, 4, 4, W - 8, H - 8, 26, '#2ab0e0', '#1a1416', 8); txt(g, 'Jugendzentrum', W / 2, H / 2 + 4, 110, '#ffffff', { stroke: '#1a1416', sw: 10, fam: 'Georgia, "DejaVu Serif", serif' }); }, 0, 3.4, 0.25, S.jzOpen);
  for (let i = 0; i < 8; i++) sph(0.18, ['#e0384a', '#ffd23a', '#3ab0ff', '#6ad04a'][i % 4], -1.8 + i * 0.5, 3.0 + Math.sin(i) * 0.1, 0.4, S.jzOpen, { sc: [1, 1.2, 1] });
  S.scaffold = grp(jz); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { cyl(0.04, 0.04, 2, '#c8c8d0', -2.4 + i * 1.6, j * 2, 0.8, S.scaffold); bx(1.6, 0.06, 0.6, '#c89a5a', -1.6 + Math.min(i, 2) * 1.6, j * 2 + 2, 0.8, S.scaffold); }
  // ---- Bäckerei (x = 16) empty
  const bk = grp(G, 16, 0, -8); bx(5, 2.4, 0.08, '#3a3a40', 0, 0.2, 0.25, bk, { cast: false }); bx(5.4, 0.5, 0.15, '#e8d8b8', 0, 2.65, 0.25, bk);
  sign(4.8, 0.5, 960, 100, (g, W, H) => { g.fillStyle = '#e8d8b8'; g.fillRect(0, 0, W, H); txt(g, 'BÄCKEREI', W / 2, H / 2, 70, 'rgba(120,90,60,0.45)', { fam: 'Georgia, "DejaVu Serif", serif' }); }, 0, 2.9, 0.34, bk, { tone: true });
  for (let i = 0; i < 3; i++) bx(0.6, 0.02, 0.4, '#d8d0c0', -1.5 + i * 1.4, 0.95, 0.1, bk, { cast: false });
  // ---- Briefkästen row (x = 29) in a doorway
  const mb = grp(G, 29.5, 0, -7.6); S.mail = mb; bx(2.6, 3, 0.3, '#f0e6d0', 0, 0, -0.3, mb);
  S.slots = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { const x = -0.9 + j * 0.6, y = 1.0 + i * 0.45; bx(0.52, 0.38, 0.25, '#e8c040', x, y, 0, mb); bx(0.36, 0.04, 0.02, '#1a1a1a', x, y + 0.27, 0.13, mb, { cast: false }); const env = bx(0.3, 0.2, 0.01, '#fffaf0', x, y + 0.25, 0.14, mb, { cast: false }); env.visible = false; S.slots.push(env); }
  // ---- Spielplatz across the street (near side, x = -36)
  const sp = grp(G, -38, 0, 13); S.play = sp; floor(10, 6, tmat(64, 64, (g) => { g.fillStyle = '#e8d098'; g.fillRect(0, 0, 64, 64); }, 2, 2), 0, 0.16, 0, sp);
  for (const x of [-2.2, 0.2]) { cyl(0.06, 0.06, 2.4, '#e03a3a', x, 0, -1, sp, { rz: 0.12 }); cyl(0.06, 0.06, 2.4, '#e03a3a', x, 0, 0.6, sp, { rz: 0.12 }); }
  bx(2.6, 0.08, 0.08, '#e03a3a', -1.0, 2.35, -0.2, sp);
  S.swingOk = grp(sp); S.swingBroken = grp(sp);
  for (const s of [S.swingOk]) { cyl(0.01, 0.01, 1.6, '#5a5a5a', -1.4, 0.75, -0.25, s); cyl(0.01, 0.01, 1.6, '#5a5a5a', -0.9, 0.75, -0.25, s); bx(0.6, 0.05, 0.25, '#3a6ac8', -1.15, 0.72, -0.25, s); }
  { const s = S.swingBroken; cyl(0.01, 0.01, 1.6, '#5a5a5a', -1.4, 0.75, -0.25, s); const seat = bx(0.6, 0.05, 0.25, '#3a6ac8', -1.4, 0.35, -0.25, s); seat.rotation.z = 1.2; }
  const slide = grp(sp, 2.5, 0, 0); bx(0.6, 1.5, 0.6, '#ffd23a', 0, 0, 0, slide); const sl = bx(0.5, 0.06, 2.2, '#3ab0ff', 0, 0.8, 1.1, slide); sl.rotation.x = 0.6; S.slideBroken = bx(0.5, 0.06, 0.8, '#3ab0ff', 0.2, 0.1, 2.0, slide); S.slideBroken.rotation.z = 0.4;
  // ---- Bus stop (near side, x = 20) + bus
  const bs = grp(G, 22, 0, 8.2); cyl(0.05, 0.05, 2.8, '#3a3a3a', 0, 0.15, 0, bs); sign(0.6, 0.6, 200, 200, (g, W, H) => { g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(100, 100, 96, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#1a6a3a'; g.stroke(); txt(g, 'H', 100, 104, 120, '#1a6a3a'); }, 0, 2.7, 0.05, bs);
  bx(3, 0.06, 1.2, K.C('#bfe4f4', { transparent: true, opacity: 0.5 }), 1.8, 2.4, 0, bs); bx(0.05, 2.3, 1.2, K.C('#bfe4f4', { transparent: true, opacity: 0.5 }), 3.3, 0.15, 0, bs);
  S.car = sportsCar(G); S.car.visible = false;
  S.pp = grp(G, -22, 0.15, -4.9); for (const x of [-1.6, 1.6]) { bx(1.5, 0.06, 0.85, '#2a8a5a', x, 0.72, 0, S.pp); bx(0.02, 0.14, 0.85, '#f4f4f0', x, 0.78, 0, S.pp); for (const [dx, dz] of [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]) bx(0.05, 0.72, 0.05, '#3a3a40', x + dx, 0, dz, S.pp); } S.pp.visible = false;
  S.photoLeon = grp(G, -19.4, 1.4, -7.65); S.photoLeon.visible = false;
  S.bus = buildBusExterior(G); S.bus.position.set(60, 0, 4.6);
  // ---- Oma's house door (x = -48) + trees, lamps, bikes, cars, bins
  const od = grp(G, -48, 0, -7.6); bx(1.3, 2.4, 0.1, '#3a6a4a', 0, 0, 0.1, od); bx(1.6, 0.2, 0.5, '#d8d0c0', 0, 2.5, 0.2, od); for (let i = 0; i < 3; i++) bx(1.6, 0.15, 0.4, '#b8b0a4', 0, i * 0.15, 0.55 + (2 - i) * 0.0 + i * -0.1, od);
  const r = rngf(77);
  for (const x of [-59, -45, -37, -30, -17, -10, 9, 21, 25, 37, 47, 58]) { const tg = grp(G, x, 0.15, -4.4); cyl(0.12, 0.18, 3.2, '#6a4a32', 0, 0, 0, tg); for (let k = 0; k < 3; k++) sph(1.3 - k * 0.2, k % 2 ? '#78b84a' : '#5aa040', (k - 1) * 0.6, 3.6 + k * 0.4, (k % 2) * 0.3, tg, { sc: [1, 0.85, 1] }); }
  for (let x = -57; x <= 60; x += 15) { const lg = grp(G, x, 0.15, 7.6); cyl(0.05, 0.07, 4.2, '#2a2a30', 0, 0, 0, lg); bx(0.4, 0.3, 0.4, '#2a2a30', 0, 4.2, -0.3, lg); bx(0.3, 0.12, 0.3, K.E('#ffe6a0', 1.2), 0, 4.1, -0.3, lg, { cast: false }); }
  const car = (x, z, col, ry = 0) => { const c = grp(G, x, 0, z, ry); bx(3.8, 0.7, 1.7, col, 0, 0.3, 0, c); bx(2.0, 0.6, 1.5, K.C('#9ac0d8'), -0.2, 1.0, 0, c); bx(2.1, 0.08, 1.55, col, -0.2, 1.6, 0, c); for (const [wx, wz] of [[-1.2, 0.85], [1.2, 0.85], [-1.2, -0.85], [1.2, -0.85]]) cyl(0.34, 0.34, 0.25, '#1a1a1a', wx, 0, wz, c, { rx: Math.PI / 2 }); return c; };
  car(-28, -2.0, '#3a7ac8'); car(10, -2.0, '#e8e4dc'); car(36, -2.0, '#c84a3a'); car(-55, -2.0, '#6ab07a');
  for (const x of [-12, 34]) { const b = grp(G, x, 0.15, -4.6); cyl(0.32, 0.32, 0.06, '#2a2a2a', -0.5, 0.32, 0, b, { rx: Math.PI / 2 }); cyl(0.32, 0.32, 0.06, '#2a2a2a', 0.5, 0.32, 0, b, { rx: Math.PI / 2 }); bx(1.0, 0.05, 0.05, '#e03a3a', 0, 0.5, 0, b); }
  for (const x of [-4, 24, -40]) { bx(0.6, 1.0, 0.6, '#3a6a3a', x, 0.15, -5.0, G); }
  // old football by the curb
  S.ball = sph(0.11, tmat(64, 64, (g) => { g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3a3a3a'; for (let i = 0; i < 6; i++) g.fillRect((i * 23) % 64, (i * 37) % 64, 12, 12); }), -30, 0.25, -3.4, G, { sc: [1, 0.75, 1] });
  // queue at the Imbiss (ending): crowd instanced
  S.skyline = skyline(G, 5, { r0: 120, r1: 260, n: 50, minH: 30, maxH: 70, arc: [Math.PI * 1.1, Math.PI * 1.9] });
  return { G, S };
}
export function updateKiez(A, W, t) {
  const S = A.S, k = W.kiez || {};
  S.jzClosed.visible = !k.jzOpen; S.jzOpen.visible = !!k.jzOpen; S.scaffold.visible = !!k.scaffold;
  S.note.visible = !!k.note; if (k.noteFly) { const f = k.noteFly; S.note.position.set(0.4 + f * 3, 1.6 + f * 2 + Math.sin(f * 9) * 0.2, 0.34 + f * 2); S.note.rotation.z = f * 6; } else { S.note.position.set(0.4, 1.6, 0.34); S.note.rotation.z = 0; }
  S.swingOk.visible = !!k.playFixed; S.swingBroken.visible = !k.playFixed; S.slideBroken.visible = !k.playFixed;
  const env = k.env || 0; S.slots.forEach((e, i) => { const p = Math.max(0, Math.min(1, env * S.slots.length - i)); e.visible = p > 0; e.position.y = (1.0 + Math.floor(i / 4) * 0.45) + 0.25 + (1 - p) * 0.25; });
  const b = k.bus; S.bus.visible = !!b; if (b) { S.bus.position.x = b.x; S.bus.userData.wheels.forEach((w) => (w.rotation.y = -b.x * 2)); }
  S.ball.visible = !k.noBall; S.pp.visible = !!k.pingpong; S.photoLeon.visible = !!k.photo; S.car.visible = !!k.car; if (k.car) { S.car.position.set(k.car[0], 0.25, k.car[1]); S.car.rotation.y = k.car[2] ?? 0; S.car.userData.wheels.forEach((w) => (w.rotation.z = -k.car[0] * 2.5)); }
}
export function buildBusExterior(parent) {
  const B = grp(parent), wheels = [];
  bx(12, 2.6, 2.55, '#f2c230', 0, 0.35, 0, B); bx(12.05, 0.35, 2.6, '#e8e4dc', 0, 0.3, 0, B);
  bx(11.4, 1.1, 2.6, K.C('#2a3a5a'), 0, 1.45, 0, B, { cast: false });
  for (let i = 0; i < 6; i++) bx(0.12, 1.1, 2.62, '#f2c230', -5.4 + i * 2.1, 1.45, 0, B, { cast: false });
  bx(0.1, 1.9, 2.3, K.C('#3a5a7a'), 6.0, 0.9, 0, B, { cast: false });
  sign(1.8, 0.4, 360, 80, (g, W, H) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, W, H); txt(g, '47', W / 2, H / 2 + 2, 66, '#ffb020'); }, 6.07, 2.65, 0, B, { ry: Math.PI / 2 });
  sign(3.0, 0.5, 600, 100, (g, W, H) => { rr(g, 0, 0, W, H, 16, '#ffffff', '#1a1a1a', 6); txt(g, 'Linie 47', W / 2, H / 2 + 2, 70, '#1a1a1a'); }, 2.0, 0.95, 1.29, B);
  for (const [x, z] of [[-3.8, 1.2], [3.6, 1.2], [-3.8, -1.2], [3.6, -1.2]]) { const w = cyl(0.5, 0.5, 0.35, '#1a1a1a', x, -0.15, z, B, { rx: Math.PI / 2 }); wheels.push(w); }
  sph(0.15, K.E('#fff6d0', 1.4), 6.05, 0.7, 0.9, B); sph(0.15, K.E('#fff6d0', 1.4), 6.05, 0.7, -0.9, B);
  B.userData.wheels = wheels; return B;
}

// ---------------------------------------------------------------- IMBISS interior
export function buildImbiss(root) {
  const G = grp(root), S = {};
  floor(8, 6, TX.tiles, 0, 0, 0, G);
  const wall = tmat(128, 128, (g) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#e8c08a'; g.fillRect(0, 80, 128, 48); g.strokeStyle = '#c89a5a'; g.lineWidth = 3; for (let i = 0; i < 128; i += 32) { g.strokeRect(i, 80, 32, 24); g.strokeRect(i + 16, 104, 32, 24); } }, 3, 1);
  bx(8, 3, 0.15, wall, 0, 0, -3, G); bx(0.15, 3, 6, wall, -4, 0, 0, G); bx(0.15, 3, 6, wall, 4, 0, 0, G); bx(8, 0.1, 6, '#f4ece0', 0, 3, 0, G, { cast: false });
  // counter with glass display
  const ct = grp(G, 0, 0, -0.6); bx(5, 1.0, 0.8, '#c8202a', 0, 0, 0, ct); bx(5.1, 0.06, 0.95, '#e8e4dc', 0, 1.0, 0, ct);
  bx(3, 0.4, 0.5, K.C('#d8f0ff', { transparent: true, opacity: 0.45 }), -0.6, 1.06, 0.1, ct, { cast: false });
  for (let i = 0; i < 6; i++) bx(0.4, 0.12, 0.3, ['#5ab04a', '#e03a3a', '#f2e6c8', '#e8a040', '#8a3a2a', '#f4f0e6'][i], -1.8 + i * 0.48, 1.06, 0.1, ct);
  // döner spit
  const ds = grp(G, 1.8, 1.06, -1.6); S.spit = grp(ds); cyl(0.02, 0.02, 1.3, '#9a9aa4', 0, 0, 0, S.spit);
  const meat = cyl(0.24, 0.16, 0.8, tmat(128, 128, (g) => { g.fillStyle = '#b8682a'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 128; i += 10) { g.fillStyle = i % 20 ? '#a0521e' : '#d08840'; g.fillRect(0, i, 128, 5); } }, 3, 1), 0, 0.25, 0, S.spit, { seg: 18 });
  bx(0.7, 1.2, 0.15, K.E('#ff6a2a', 0.8), 0, 0, -0.45, ds); S.grillGlow = glow(0.9, '255,120,40', 1.8, 1.7, -1.9, G, 0.6);
  // menu board (German prices)
  sign(3.2, 1.2, 960, 360, (g, W, H) => { g.fillStyle = '#1e2a22'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c89a5a'; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
    const items = [['Döner', '5,50 €'], ['Dürüm', '6,00 €'], ['Lahmacun', '4,50 €'], ['Pide', '3,00 €'], ['Tee', '1,50 €'], ['Ayran', '2,00 €']];
    items.forEach(([a, b], i) => { const x = i < 3 ? 60 : W / 2 + 40, y = 90 + (i % 3) * 95; txt(g, a, x, y, 56, '#f6f0e0', { al: 'left' }); txt(g, b, x + 380, y, 50, '#ffd23a', { al: 'right' }); }); }, -0.8, 2.3, -2.9, G);
  // framed photo: two kids (kindergarten)
  S.photo = sign(0.7, 0.55, 280, 220, (g, W, H) => { g.fillStyle = '#c89a5a'; g.fillRect(0, 0, W, H); g.fillStyle = '#bfe4f4'; g.fillRect(16, 16, W - 32, H - 32); g.fillStyle = '#8ad06a'; g.fillRect(16, H - 70, W - 32, 54);
    const kid = (x, hair, body) => { g.fillStyle = body; g.fillRect(x - 22, 120, 44, 60); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, 95, 32, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = '#1a1416'; g.stroke(); g.fillStyle = hair; g.beginPath(); g.arc(x, 85, 33, Math.PI, 0); g.fill(); g.fillStyle = '#1a1416'; g.beginPath(); g.arc(x - 10, 95, 4, 0, 7); g.arc(x + 10, 95, 4, 0, 7); g.fill(); g.beginPath(); g.arc(x, 105, 10, 0.2, Math.PI - 0.2); g.stroke(); };
    kid(105, '#8a5530', '#3ab0ff'); kid(175, '#16141a', '#e03a3a'); }, 3.0, 1.9, -2.9, G, { tone: true });
  // oven for pide (back left) with glow
  const ov = grp(G, -2.6, 0, -2.4); bx(1.8, 1.6, 1.0, TX.brick, 0, 0, 0, ov); bx(0.9, 0.6, 0.1, K.E('#ff8a3a', 1.0), 0, 0.6, 0.48, ov, { cast: false }); S.ovenGlow = glow(1.0, '255,140,60', -2.6, 0.9, -1.8, G, 0.6);
  // card terminal on the counter + screen
  S.term = grp(G, 2.05, 1.06, -0.3); bx(0.18, 0.06, 0.3, '#2a2a32', 0, 0, 0, S.term); const ts = bx(0.16, 0.1, 0.02, '#2a2a32', 0, 0.06, -0.12, S.term); ts.rotation.x = -0.5;
  S.termScreen = dynSign(0.13, 0.09, 260, 180, 0, 0.118, -0.104, S.term, { rx: -0.5 });
  // tea glasses, napkins, tables, chairs by the window (front)
  for (let i = 0; i < 4; i++) { const x = -1.5 + i * 0.25; cyl(0.03, 0.025, 0.08, K.C('#c85a28', { transparent: true, opacity: 0.85 }), x, 1.03, -0.4, G); }
  for (const x of [-2.6, 2.6]) { cyl(0.45, 0.45, 0.04, '#e8e4dc', x, 0.75, 1.8, G); cyl(0.04, 0.04, 0.75, '#5a5a5a', x, 0, 1.8, G); }
  // front window frame (camera side z=+3, mostly open)
  bx(8, 0.6, 0.12, '#c83a2a', 0, 2.4, 3, G, { cast: false });
  S.doner = grp(G, 1.35, 1.06, -0.35); // build-up döner on the counter
  S.donerParts = [];
  const bread = sph(0.22, '#e2a85a', 0, 0.05, 0, S.doner, { sc: [1.4, 0.4, 1] }); S.donerParts.push(bread);
  const add = (col, n, r, y0) => { const g = grp(S.doner); const rr_ = rngf(n * 7); for (let i = 0; i < n; i++) sph(r * (0.7 + rr_() * 0.5), col, (rr_() - 0.5) * 0.35, y0 + rr_() * 0.12, (rr_() - 0.5) * 0.2, g); S.donerParts.push(g); return g; };
  add('#b8682a', 18, 0.06, 0.1); add('#ffe080', 16, 0.05, 0.22); add('#5ab04a', 14, 0.05, 0.3); add('#e03a3a', 10, 0.05, 0.36); add('#f4f0e0', 8, 0.06, 0.42);
  S.lights = [glow(0.7, '255,230,170', -1.5, 2.9, 0, G, 0.5), glow(0.7, '255,230,170', 1.5, 2.9, 0, G, 0.5)];
  return { G, S };
}
export function updateImbiss(A, W, t) {
  const S = A.S, k = W.imb || {};
  S.spit.rotation.y = t * 0.8;
  const d = k.doner ?? 0; S.doner.visible = d > 0; S.donerParts.forEach((p, i) => { const s = Math.max(0, Math.min(1, d * 1.2 - i * 0.2) ); p.visible = s > 0; p.scale.setScalar(Math.max(0.001, s) * (1 + (k.donerBig || 0) * 0.6)); });
  const pay = k.pay || 0;
  S.termScreen.draw('t' + (pay > 0.5 ? 1 : 0), (g, W_, H) => { g.fillStyle = pay > 0.5 ? '#e8fff0' : '#d8e4f0'; g.fillRect(0, 0, W_, H); if (pay > 0.5) { g.fillStyle = '#2ab070'; g.beginPath(); g.arc(W_ / 2, 66, 40, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(W_ / 2 - 18, 66); g.lineTo(W_ / 2 - 4, 82); g.lineTo(W_ / 2 + 22, 48); g.stroke(); txt(g, 'Zahlung erfolgreich', W_ / 2, 142, 25, '#1a5a3a'); } else { txt(g, 'Karte', W_ / 2, 70, 40, '#2a3a5a'); txt(g, 'auflegen', W_ / 2, 120, 34, '#2a3a5a', { w: 'normal' }); } });
}
