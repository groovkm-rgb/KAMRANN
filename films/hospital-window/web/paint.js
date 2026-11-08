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

// ---------------- hospital-window textures (shapes only, never text) ----------------
export function brick(seed = 21) {
  const [c, g] = cv(512, 512), r = rng(seed), bw = 64, bh = 28;
  g.fillStyle = '#8f7f6c'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh + 1; row++) for (let col = -1; col < 512 / bw + 1; col++) {
    const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = 30 + r() * 12;
    g.fillStyle = hsl(14 + r() * 10, 42 + r() * 10, L); g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
    g.fillStyle = hsl(14, 40, L + 8, .5); g.fillRect(x + 4, y + 4, bw - 10, 3);
    g.fillStyle = hsl(14, 40, L - 8, .5); g.fillRect(x + 4, y + bh - 7, bw - 8, 3);
  }
  for (let i = 0; i < 14; i++) { const x = r() * 512, y = 300 + r() * 212; const gr = g.createRadialGradient(x, y, 0, x, y, 30 + r() * 50); gr.addColorStop(0, 'rgba(70,96,52,.55)'); gr.addColorStop(1, 'rgba(70,96,52,0)'); g.fillStyle = gr; g.fillRect(x - 90, y - 90, 180, 180); }
  for (let i = 0; i < 8; i++) { const x = r() * 512; const gr = g.createLinearGradient(x, 0, x + 20, 0); gr.addColorStop(0, 'rgba(40,36,34,0)'); gr.addColorStop(.5, 'rgba(40,36,34,.25)'); gr.addColorStop(1, 'rgba(40,36,34,0)'); g.fillStyle = gr; g.fillRect(x, r() * 200, 20, 300); }
  return c;
}
export function tiles(seed = 22, base = [150, 30, 78], n = 8) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 512 / n;
  g.fillStyle = hsl(base[0], base[1] * 0.6, base[2] - 18); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = hsl(base[0] + r() * 6 - 3, base[1], base[2] + r() * 5 - 2); g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(i * s + 4, j * s + 4, s - 10, 4); }
  return c;
}
export function lino(seed = 23, base = [100, 10, 72]) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(...base); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = hsl(base[0], base[1], base[2] + (r() - 0.5) * 16, .5); g.beginPath(); g.arc(r() * 512, r() * 512, 1 + r() * 2.5, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); }
  return c;
}
export function curtain(seed = 24, col = [90, 25, 78]) {
  const [c, g] = cv(256, 256);
  for (let x = 0; x < 256; x++) { const k = 0.5 + 0.5 * Math.sin(x / 256 * Math.PI * 2 * 7); g.fillStyle = hsl(col[0], col[1], col[2] - 14 * (1 - k)); g.fillRect(x, 0, 1, 256); }
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 240, 256, 16);
  return c;
}
export function cabinet(seed = 25) { // 4 drawers, handles, blank label plates
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = '#7d8a90'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 4; i++) { const y = 8 + i * 126; g.fillStyle = hsl(198, 8, 58 + r() * 6); g.fillRect(10, y, 236, 116); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(12, y + 2, 232, 6);
    g.fillStyle = '#ece6d6'; g.fillRect(98, y + 22, 60, 26); g.strokeStyle = '#4a5358'; g.lineWidth = 3; g.strokeRect(98, y + 22, 60, 26);
    g.fillStyle = '#3f474c'; g.fillRect(88, y + 66, 80, 14); g.fillStyle = '#aab4ba'; g.fillRect(92, y + 66, 72, 5); }
  return c;
}
export function folders(seed = 26) { // shelf of brown folder spines, blank labels
  const [c, g] = cv(512, 256), r = rng(seed);
  g.fillStyle = '#3b2c20'; g.fillRect(0, 0, 512, 256);
  let x = 4; while (x < 508) { const w = 14 + r() * 22, h = 170 + r() * 70, L = 34 + r() * 22; g.fillStyle = hsl(28 + r() * 10, 40 + r() * 15, L); g.fillRect(x, 256 - h, w - 2, h);
    g.fillStyle = 'rgba(255,245,225,.55)'; g.fillRect(x + 3, 256 - h + 22, w - 8, 18); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + w - 5, 256 - h, 3, h); x += w; }
  g.fillStyle = '#6a5038'; g.fillRect(0, 246, 512, 10);
  return c;
}
export function leafMask(seed = 27, dens = 1) { // white leaves on transparent (alpha used for shadows / canopy cards)
  const [c, g] = cv(512, 512), r = rng(seed);
  for (let i = 0; i < 220 * dens; i++) { const x = r() * 512, y = r() * 512, s = 8 + r() * 18; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y, s, s * 0.55, r() * 3.14, 0, 7); g.fill(); }
  for (let i = 0; i < 6; i++) { g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.beginPath(); let x = r() * 512, y = 0; g.moveTo(x, y); while (y < 512) { x += r() * 50 - 25; y += 40; g.lineTo(x, y); } g.stroke(); }
  return c;
}
export function glassGrid(seed = 28, cols = 6, rows = 3, tint = [205, 45, 70]) { // curtain-wall: sky-reflecting panes + mullions
  const [c, g] = cv(512, 512), r = rng(seed), w = 512 / cols, h = 512 / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const gr = g.createLinearGradient(i * w, j * h, i * w + w, j * h + h); gr.addColorStop(0, hsl(tint[0], tint[1], tint[2] + 10 + r() * 6)); gr.addColorStop(1, hsl(tint[0] + 10, tint[1] - 10, tint[2] - 12));
    g.fillStyle = gr; g.fillRect(i * w, j * h, w, h);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(i * w + w * 0.15, j * h + h); g.lineTo(i * w + w * 0.45, j * h); g.lineTo(i * w + w * 0.6, j * h); g.lineTo(i * w + w * 0.3, j * h + h); g.fill();
    if (r() < 0.45) { g.fillStyle = 'rgba(96,150,70,.45)'; g.beginPath(); g.ellipse(i * w + w / 2, j * h + h * 0.85, w * 0.4, h * 0.25, 0, 0, 7); g.fill(); }
  }
  g.strokeStyle = '#e8ecef'; g.lineWidth = 8; for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, 512); g.stroke(); } for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, j * h); g.lineTo(512, j * h); g.stroke(); }
  return c;
}
export function monitorScreen() { // simple heart-line icon, no digits
  const [c, g] = cv(256, 160); g.fillStyle = '#16302a'; g.fillRect(0, 0, 256, 160);
  g.strokeStyle = '#7dfc9e'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(10, 90); g.lineTo(80, 90); g.lineTo(98, 50); g.lineTo(116, 130); g.lineTo(134, 30); g.lineTo(152, 90); g.lineTo(246, 90); g.stroke();
  return c;
}
export function grille() { const [c, g] = cv(128, 128); g.fillStyle = '#6d6f70'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 8; i++) { g.fillStyle = '#2e3133'; g.fillRect(10, 10 + i * 14, 108, 7); g.fillStyle = '#9a9c9c'; g.fillRect(10, 10 + i * 14, 108, 2); } return c; }
export function paving(seed = 29) { const [c, g] = cv(512, 512), r = rng(seed); g.fillStyle = '#b9b2a4'; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = hsl(40, 10, 66 + r() * 10); g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } return c; }
export function woodFloor(seed = 30) { return planks(seed); }
