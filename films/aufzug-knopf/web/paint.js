// Canvas2D painted textures (our own). All deterministic.
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const speckle = (g, w, h, r, n, cols, rad = [1, 3]) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, rad[0] + r() * rad[1], rad[0] + r() * rad[1] * 0.7, r() * 3, 0, 7); g.fill(); } };

export function planks(seed = 1, rot = 0) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = 52 + r() * 10, H = 30 + r() * 6;
    g.fillStyle = hsl(H, 42, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) { g.strokeStyle = hsl(H - 4, 40, L - 10 - r() * 8, 0.5); g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * w + 4 + r() * (w - 8); g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, 170, x + r() * 6 - 3, 340, x + r() * 4 - 2, 512); g.stroke(); }
    const cut = r() * 512; g.fillStyle = 'rgba(40,24,14,.9)'; g.fillRect(i * w, cut, w, 4);
    for (const y of [cut - 18, cut + 18]) { g.fillStyle = '#2b2620'; g.beginPath(); g.arc(i * w + w * 0.3, y, 2.6, 0, 7); g.arc(i * w + w * 0.7, y, 2.6, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(30,18,10,.95)'; g.fillRect(i * w, 0, 3, 512);
    if (r() < 0.5) { g.fillStyle = hsl(H, 40, L - 16, .8); g.beginPath(); g.ellipse(i * w + w / 2, r() * 512, 5, 9, 0, 0, 7); g.fill(); }
  }
  return c;
}
export function beam(seed = 2, base = [30, 40, 40]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) { g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, .45); g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke(); }
  return c;
}
/** rotting pile: wet dark lower part, moss, rot holes, pale fungus streaks */
export function rotten(seed = 3) {
  const [c, g] = cv(256, 1024), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#6b4a2e'); gr.addColorStop(0.45, '#4f3722'); gr.addColorStop(0.8, '#33281c'); gr.addColorStop(1, '#22231a');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 1024);
  for (let k = 0; k < 50; k++) { g.strokeStyle = `rgba(20,12,6,${.3 + r() * .4})`; g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 10, 300, x - 10, 700, x + r() * 10 - 5, 1024); g.stroke(); }
  // moss bands near the water line and patches
  for (let i = 0; i < 260; i++) { const y = 650 + Math.pow(r(), 0.6) * 374; g.fillStyle = hsl(85 + r() * 25, 45, 26 + r() * 14, .85); g.beginPath(); g.ellipse(r() * 256, y, 4 + r() * 12, 3 + r() * 6, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = hsl(95, 40, 30 + r() * 10, .8); g.beginPath(); g.ellipse(r() * 256, r() * 650, 3 + r() * 8, 2 + r() * 5, 0, 0, 7); g.fill(); }
  // rot holes with cracks
  for (let i = 0; i < 9; i++) {
    const x = r() * 256, y = 200 + r() * 760, w = 10 + r() * 26, h = 18 + r() * 50;
    g.fillStyle = '#120c08'; g.beginPath(); g.ellipse(x, y, w, h, 0, 0, 7); g.fill();
    g.strokeStyle = '#8a6a48'; g.lineWidth = 3; g.beginPath(); g.ellipse(x - 2, y - 2, w, h, 0, 3.6, 5.6); g.stroke();
    g.strokeStyle = '#120c08'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 6, y - h - 40 - r() * 60); g.moveTo(x, y + h); g.lineTo(x - 5, y + h + 30 + r() * 50); g.stroke();
  }
  // pale fungus spots
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(226,214,180,${.5 + r() * .4})`; g.beginPath(); g.ellipse(r() * 256, 150 + r() * 700, 2 + r() * 4, 2 + r() * 3, 0, 0, 7); g.fill(); }
  return c;
}
export function stone(seed = 4, hue = 36, sat = 14, lig = 66, bw = 128, bh = 64) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#4a4238'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh; row++) for (let col = -1; col < 512 / bw + 1; col++) {
    const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = lig - 6 + r() * 12;
    g.fillStyle = hsl(hue + r() * 8 - 4, sat, L); g.beginPath(); g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 6); g.fill();
    g.fillStyle = hsl(hue, sat, L + 7, .6); g.fillRect(x + 6, y + 5, bw - 14, 5);
    g.fillStyle = hsl(hue, sat, L - 12, .5); g.fillRect(x + 6, y + bh - 10, bw - 12, 5);
    speckle(g, 0, 0, r, 0, ['#000']);
    for (let k = 0; k < 6; k++) { g.fillStyle = hsl(hue, sat, L - 8 - r() * 8, .6); g.beginPath(); g.ellipse(x + r() * bw, y + r() * bh, 2 + r() * 5, 1 + r() * 3, 0, 0, 7); g.fill(); }
  }
  return c;
}
export function mossy(c0, seed = 5, amt = 1) {
  const [c, g] = cv(c0.width, c0.height), r = rng(seed); g.drawImage(c0, 0, 0);
  for (let i = 0; i < 500 * amt; i++) { const y = c.height * (0.4 + 0.6 * Math.pow(r(), 0.5)); g.fillStyle = hsl(90 + r() * 30, 40, 28 + r() * 16, .85); g.beginPath(); g.ellipse(r() * c.width, y, 4 + r() * 10, 3 + r() * 6, 0, 0, 7); g.fill(); }
  // ivy strands with leaves
  for (let s = 0; s < 8 * amt; s++) {
    let x = r() * c.width, y = c.height;
    for (let k = 0; k < 40; k++) { x += (r() - 0.5) * 18; y -= 8 + r() * 6; g.fillStyle = hsl(100 + r() * 20, 45, 30 + r() * 15); g.beginPath(); g.ellipse(x, y, 7, 5, r() * 3, 0, 7); g.fill(); g.strokeStyle = '#1d2b14'; g.lineWidth = 1.5; g.stroke(); }
  }
  return c;
}
export function grass(seed = 6) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#6fa04a'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { g.fillStyle = hsl(85 + r() * 20, 42, 38 + r() * 14, .5); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 50, 12 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 1400; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = hsl(80 + r() * 30, 45, 30 + r() * 25, .9); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke(); }
  for (let i = 0; i < 30; i++) { g.fillStyle = ['#f3e27a', '#ffffff', '#e8a0c0'][i % 3]; g.beginPath(); g.arc(r() * 512, r() * 512, 2.5, 0, 7); g.fill(); }
  return c;
}
export function dirt(seed = 7) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#a88a62'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) { g.fillStyle = hsl(30 + r() * 10, 25, 40 + r() * 25, .6); g.beginPath(); g.ellipse(r() * 512, r() * 512, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, 7); g.fill(); }
  return c;
}
export function plaster(seed = 8, hue = 40) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = hsl(hue, 40, 86); g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = hsl(hue, 30, 76 + r() * 8, .5); g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 30, 6 + r() * 16, 0, 0, 7); g.fill(); }
  g.fillStyle = hsl(hue, 20, 60, .5); g.fillRect(0, 236, 256, 20);
  return c;
}
export function roof(seed = 9) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#7b2e1c'; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const x = col * 32 + (row % 2) * 16, y = row * 32; g.fillStyle = hsl(12 + r() * 8, 58, 42 + r() * 10);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,220,180,.25)'; g.fillRect(x + 6, y + 2, 5, 22);
  }
  return c;
}
export function marble(seed = 10) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = '#efe7d6'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(160,140,110,.25)'; g.fillRect(i * 32 + 2, 0, 6, 512); }
  for (let k = 0; k < 10; k++) { g.strokeStyle = 'rgba(150,140,130,.35)'; g.lineWidth = 1.5; g.beginPath(); let x = r() * 256, y = 0; g.moveTo(x, y); while (y < 512) { x += r() * 30 - 15; y += 20 + r() * 30; g.lineTo(x, y); } g.stroke(); }
  return c;
}
export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}

// ---------------- elevator short: text-free textures ----------------
/** polished marble floor tiles: white / pale grey, soft veins, thin grout */
export function marbleTiles(seed = 21, n = 2) {
  const [c, g] = cv(512, 512), r = rng(seed), t = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const L = 90 + r() * 5, gr = g.createLinearGradient(i * t, j * t, i * t + t, j * t + t);
    gr.addColorStop(0, hsl(30, 12, L)); gr.addColorStop(1, hsl(210, 8, L - 5)); g.fillStyle = gr; g.fillRect(i * t, j * t, t, t);
    g.save(); g.beginPath(); g.rect(i * t, j * t, t, t); g.clip();
    for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(150,150,160,${0.12 + r() * 0.22})`; g.lineWidth = 0.8 + r() * 2.2; g.beginPath(); let x = i * t + r() * t, y = j * t; g.moveTo(x, y); while (y < j * t + t) { x += r() * 40 - 20; y += 12 + r() * 30; g.lineTo(x, y); } g.stroke(); }
    g.restore();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(i * t + 4, j * t + 4, t - 8, 3);
  }
  g.strokeStyle = 'rgba(120,115,110,.55)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * t, 0); g.lineTo(i * t, 512); g.moveTo(0, i * t); g.lineTo(512, i * t); g.stroke(); }
  return c;
}
/** brushed steel: fine streaks (vertical) */
export function brushed(seed = 22, L0 = 74, hue = 210, sat = 6) {
  const [c, g] = cv(256, 512), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, hsl(hue, sat, L0 - 4)); gr.addColorStop(0.5, hsl(hue, sat, L0 + 6)); gr.addColorStop(1, hsl(hue, sat, L0 - 2));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 420; k++) { const x = r() * 256; g.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.05 + r() * 0.12})` : `rgba(60,70,80,${0.04 + r() * 0.08})`; g.lineWidth = 0.6 + r() * 1.2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + r() * 2 - 1, 512); g.stroke(); }
  return c;
}
/** polished brass: warm gold with vertical sheen bands */
export function brassTex(seed = 23) {
  const [c, g] = cv(256, 512), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 256, 0);
  [[0, '#b8862f'], [0.18, '#f6d27a'], [0.32, '#d7a447'], [0.55, '#fbe3a0'], [0.7, '#c99437'], [0.88, '#f1c766'], [1, '#b8862f']].forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 160; k++) { const x = r() * 256; g.strokeStyle = `rgba(255,248,220,${0.05 + r() * 0.1})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  return c;
}
/** blueprint paper: navy with minor + major grid lines (no labels) */
export function blueprint(seed = 24, base = '#1b4f93') {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.035})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 10 + r() * 40, 8 + r() * 30, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(190,220,255,.22)'; g.lineWidth = 1.2;
  for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
  g.strokeStyle = 'rgba(210,232,255,.45)'; g.lineWidth = 2.4;
  for (let i = 0; i <= 512; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
  return c;
}
/** elevator mirror: pale cool gradient + soft diagonal sheen */
export function mirrorTex() {
  const [c, g] = cv(256, 512);
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#dfe9f0'); gr.addColorStop(0.55, '#b9c9d6'); gr.addColorStop(1, '#a3b4c2');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(40, 0); g.lineTo(110, 0); g.lineTo(-10, 300); g.lineTo(-60, 300); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(150, 0); g.lineTo(175, 0); g.lineTo(40, 340); g.lineTo(15, 340); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(256, 220); g.lineTo(256, 300); g.lineTo(140, 512); g.lineTo(90, 512); g.fill();
  return c;
}
export function asphalt(seed = 25) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5a5e66'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { g.fillStyle = hsl(220, 6, 30 + r() * 30, .5); g.fillRect(r() * 512, r() * 512, 1 + r() * 2.5, 1 + r() * 2.5); }
  for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(40,42,48,${0.15 + r() * 0.2})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 60, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  return c;
}
export function concrete(seed = 26) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#c9c4ba'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { g.fillStyle = hsl(35, 8, 62 + r() * 22, .45); g.fillRect(r() * 256, r() * 256, 2, 2); }
  g.strokeStyle = 'rgba(110,104,96,.7)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 253, 253);
  return c;
}
/** brownstone / brick facade with window grid, stone lintels; floors x cols */
export function facade(seed = 27, o = {}) {
  const { wall = '#9a5a3e', mortar = 'rgba(60,30,20,.35)', win = '#5d7fa8', frame = '#f3ede0', cols = 3, rows = 4, brick = true, lintel = '#e3d6bd', glassy = false } = o;
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = wall; g.fillRect(0, 0, 512, 512);
  if (brick) { for (let y = 0; y < 512; y += 12) for (let x = (y / 12 % 2) * 12; x < 512; x += 24) { g.fillStyle = `rgba(${r() < 0.5 ? '255,220,200' : '60,25,15'},${r() * 0.12})`; g.fillRect(x, y, 23, 11); }
    g.strokeStyle = mortar; g.lineWidth = 1; for (let y = 0; y < 512; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } }
  const cw = 512 / cols, rh = 512 / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = i * cw + cw * 0.22, y = j * rh + rh * 0.2, w = cw * 0.56, h = rh * 0.6;
    if (!glassy) { g.fillStyle = lintel; g.fillRect(x - 6, y - 12, w + 12, 10); g.fillRect(x - 4, y + h, w + 8, 7); }
    g.fillStyle = frame; g.fillRect(x - 3, y - 3, w + 6, h + 6);
    const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, win); gr.addColorStop(1, hsl(215, 30, 22)); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w * 0.45, y); g.lineTo(x + w * 0.05, y + h * 0.7); g.lineTo(x, y + h * 0.7); g.lineTo(x, y + h * 0.3); g.fill();
    g.fillStyle = frame; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.45, w, 4);
    if (r() < 0.3) { g.fillStyle = 'rgba(255,214,140,.55)'; g.fillRect(x + 2, y + h * 0.5, w / 2 - 4, h * 0.48); }
  }
  return c;
}
/** glass tower: curtain wall grid */
export function towerTex(seed = 28, o = {}) {
  const { base = '#9fc3e0', mull = '#e9eef2', cols = 6, rows = 8 } = o;
  const [c, g] = cv(512, 512), r = rng(seed);
  const cw = 512 / cols, rh = 512 / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const L = 52 + r() * 18; g.fillStyle = hsl(205 + r() * 10, 35, L); g.fillRect(i * cw, j * rh, cw, rh);
    g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.25})`; g.beginPath(); g.moveTo(i * cw, j * rh + rh); g.lineTo(i * cw + cw * 0.6, j * rh); g.lineTo(i * cw + cw * 0.85, j * rh); g.lineTo(i * cw + cw * 0.25, j * rh + rh); g.fill();
  }
  g.fillStyle = mull; for (let i = 0; i <= cols; i++) g.fillRect(i * cw - 3, 0, 6, 512); for (let j = 0; j <= rows; j++) g.fillRect(0, j * rh - 5, 512, 10);
  return c;
}
/** soft lab floor tiles */
export function labTiles(seed = 29) {
  const [c, g] = cv(256, 256), r = rng(seed);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = hsl(200, 18, 90 + r() * 4); g.fillRect(i * 128, j * 128, 128, 128); }
  g.strokeStyle = 'rgba(150,170,185,.6)'; g.lineWidth = 2; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 256); g.moveTo(0, i * 128); g.lineTo(256, i * 128); g.stroke(); }
  return c;
}
/** lobby wall: large warm stone panels */
export function wallPanels(seed = 30, hue = 36, L = 84) {
  const [c, g] = cv(512, 512), r = rng(seed);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const l = L + r() * 4 - 2; g.fillStyle = hsl(hue, 22, l); g.fillRect(i * 256, j * 256, 256, 256);
    for (let k = 0; k < 30; k++) { g.fillStyle = hsl(hue, 18, l - 4 - r() * 5, .35); g.beginPath(); g.ellipse(i * 256 + r() * 256, j * 256 + r() * 256, 6 + r() * 30, 4 + r() * 14, 0, 0, 7); g.fill(); }
  }
  g.strokeStyle = 'rgba(120,100,80,.45)'; g.lineWidth = 3; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, 512); g.moveTo(0, i * 256); g.lineTo(512, i * 256); g.stroke(); }
  return c;
}
/** pedestrian signal icons (hand / walking figure) — symbols only */
export function pedSignal(state = 'hand') {
  const [c, g] = cv(256, 128);
  g.fillStyle = '#16171b'; g.fillRect(0, 0, 256, 128);
  const lit = (on) => on ? 1 : 0.18;
  // raised hand (left cell)
  g.save(); g.translate(64, 66); g.globalAlpha = lit(state === 'hand'); g.fillStyle = '#ff8a2a';
  g.beginPath(); g.roundRect(-22, -6, 44, 40, 12); g.fill();
  for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(-21 + i * 11, -40, 9, 40, 5); g.fill(); }
  g.beginPath(); g.roundRect(18, -8, 10, 28, 5); g.fill(); g.restore();
  // walking figure (right cell)
  g.save(); g.translate(192, 64); g.globalAlpha = lit(state === 'walk'); g.fillStyle = '#f4f7ff'; g.strokeStyle = '#f4f7ff'; g.lineCap = 'round';
  g.beginPath(); g.arc(4, -40, 9, 0, 7); g.fill(); g.lineWidth = 12;
  g.beginPath(); g.moveTo(2, -28); g.lineTo(-4, 6); g.stroke();
  g.lineWidth = 9; g.beginPath(); g.moveTo(-4, 6); g.lineTo(-18, 40); g.moveTo(-4, 6); g.lineTo(12, 22); g.lineTo(14, 42); g.moveTo(0, -20); g.lineTo(-18, -2); g.moveTo(0, -20); g.lineTo(18, -6); g.stroke();
  g.restore();
  g.strokeStyle = '#2b2d33'; g.lineWidth = 6; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 128); g.stroke();
  return c;
}
/** elevator door-button face: open = ◀|▶ , close = ▶|◀ (icons, not letters) */
export function doorIcon(kind = 'close', lit = false) {
  const [c, g] = cv(128, 128);
  g.fillStyle = lit ? '#fff2c4' : '#d8dde2'; g.beginPath(); g.arc(64, 64, 64, 0, 7); g.fill();
  g.fillStyle = lit ? '#ff9d1c' : '#3a3f47';
  g.fillRect(61, 30, 6, 68);
  const tri = (x, dir) => { g.beginPath(); g.moveTo(x, 64); g.lineTo(x - dir * 26, 44); g.lineTo(x - dir * 26, 84); g.closePath(); g.fill(); };
  if (kind === 'close') { tri(55, 1); tri(73, -1); } else { tri(30, -1); tri(98, 1); }
  return c;
}
/** stress meter face: dark capsule, gradient fill up to `level` (0..1), tick lines only */
export function stressGauge(level = 1) {
  const [c, g] = cv(128, 512);
  g.fillStyle = '#2a2f3a'; g.beginPath(); g.roundRect(4, 4, 120, 504, 58); g.fill();
  const top = 40, bot = 470, H = bot - top, y = bot - H * level;
  const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, '#ff3b30'); gr.addColorStop(0.35, '#ff9f1c'); gr.addColorStop(0.6, '#ffe14d'); gr.addColorStop(1, '#3ccf62');
  g.save(); g.beginPath(); g.roundRect(30, top, 68, H, 30); g.clip();
  g.globalAlpha = 0.22; g.fillStyle = gr; g.fillRect(30, top, 68, H); g.globalAlpha = 1;
  g.fillStyle = gr; g.fillRect(30, y, 68, bot - y);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(38, top, 10, H);
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3;
  for (let i = 1; i < 8; i++) { const yy = top + H * i / 8; g.beginPath(); g.moveTo(102, yy); g.lineTo(116, yy); g.moveTo(12, yy); g.lineTo(26, yy); g.stroke(); }
  // marker triangles at the level
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(8, y - 12); g.lineTo(28, y); g.lineTo(8, y + 12); g.fill(); g.beginPath(); g.moveTo(120, y - 12); g.lineTo(100, y); g.lineTo(120, y + 12); g.fill();
  return c;
}
