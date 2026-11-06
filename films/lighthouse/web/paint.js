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
export function banner() {
  const [c, g] = cv(256, 512);
  g.fillStyle = '#b8282b'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#8a1c22'; for (let i = 0; i < 5; i++) g.fillRect(20 + i * 50, 0, 12, 512);
  g.strokeStyle = '#e6b84a'; g.lineWidth = 12; g.strokeRect(14, 14, 228, 484);
  g.fillStyle = '#e6b84a'; g.font = 'bold 66px DejaVu Serif, serif'; g.textAlign = 'center'; g.fillText('SPQR', 128, 300);
  g.lineWidth = 9; g.beginPath(); g.arc(128, 180, 60, 0.4, Math.PI - 0.4, true); g.stroke();
  for (let i = 0; i < 9; i++) { const a = Math.PI + 0.35 + i * 0.3; g.beginPath(); g.ellipse(128 + Math.cos(a) * 60, 180 - Math.sin(a) * 60 * -1, 10, 5, a, 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(i * 32, 512); g.lineTo(i * 32 + 16, 470); g.lineTo(i * 32 + 32, 512); g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out'; g.fill(); g.globalCompositeOperation = 'source-over'; }
  return c;
}
/** interior of the helmet, planar-mapped: rusty iron + the carved message */
export function helmetInside(reveal = 1) {
  const [c, g] = cv(1024, 1024), r = rng(77);
  const gr = g.createRadialGradient(512, 512, 40, 512, 512, 520); gr.addColorStop(0, '#6d675e'); gr.addColorStop(0.7, '#575148'); gr.addColorStop(1, '#3a352f');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 220; i++) { g.fillStyle = hsl(22 + r() * 12, 55, 28 + r() * 16, .35 + r() * .4); g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 4 + r() * 26, 3 + r() * 14, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(30,26,22,${.2 + r() * .3})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * 1024, y = r() * 1024; g.moveTo(x, y); g.lineTo(x + r() * 60 - 30, y + r() * 60 - 30); g.stroke(); }
  const lines = ['THE BRIDGE', 'IS NOT', 'SAFE'], ys = [400, 530, 670], sz = [104, 112, 150];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, li) => {
    g.font = `bold ${sz[li]}px DejaVu Serif, serif`;
    const w = g.measureText(t).width; let x = 512 - w / 2;
    for (const ch of t) {
      const cw = g.measureText(ch).width, a = (r() - 0.5) * 0.12, dy = (r() - 0.5) * 10;
      g.save(); g.translate(x + cw / 2, ys[li] + dy); g.rotate(a);
      g.fillStyle = '#d6cdbd'; g.fillText(ch, 3, 4);       // lit lower lip of the groove
      g.fillStyle = '#16120f'; g.fillText(ch, 0, 0);       // groove
      g.fillStyle = 'rgba(70,60,50,.9)'; g.fillText(ch, -2, -3);
      g.restore(); x += cw;
    }
  });
  // scratch-out flourish under the words
  g.strokeStyle = '#16120f'; g.lineWidth = 7; g.beginPath(); g.moveTo(330, 765); g.lineTo(700, 760); g.stroke();
  g.strokeStyle = '#cbbfa9'; g.lineWidth = 3; g.beginPath(); g.moveTo(332, 772); g.lineTo(702, 767); g.stroke();
  return c;
}
export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}

// ---------------- lighthouse short ----------------
/** layered sea-cliff rock: horizontal strata, cracks, lichen */
export function rock(seed = 21, base = [28, 10, 46]) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 512, 512);
  let y = 0;
  while (y < 512) { const h = 18 + r() * 46, L = base[2] - 8 + r() * 16; g.fillStyle = hsl(base[0] + r() * 8 - 4, base[1], L); g.fillRect(0, y, 512, h);
    g.fillStyle = hsl(base[0], base[1], L - 14, .7); g.fillRect(0, y + h - 4, 512, 4); g.fillStyle = hsl(base[0], base[1], L + 10, .5); g.fillRect(0, y, 512, 3); y += h; }
  for (let i = 0; i < 40; i++) { g.strokeStyle = hsl(base[0], base[1], base[2] - 24, .7); g.lineWidth = 1.5 + r() * 2; g.beginPath(); let x = r() * 512, yy = r() * 512; g.moveTo(x, yy); for (let k = 0; k < 4; k++) { x += r() * 20 - 10; yy += 10 + r() * 20; g.lineTo(x, yy); } g.stroke(); }
  for (let i = 0; i < 160; i++) { g.fillStyle = hsl(70 + r() * 30, 22, 50 + r() * 15, .5); g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 7, 1 + r() * 4, 0, 0, 7); g.fill(); }
  return c;
}
/** white tower with two red bands and small dark windows (u around, v up) */
export function tower() {
  const [c, g] = cv(512, 1024), r = rng(33);
  g.fillStyle = '#f2ede2'; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(150,140,120,${.08 + r() * .1})`; g.beginPath(); g.ellipse(r() * 512, r() * 1024, 8 + r() * 30, 4 + r() * 14, 0, 0, 7); g.fill(); }
  for (const [y0, y1] of [[180, 330], [520, 670]]) { g.fillStyle = '#b8352c'; g.fillRect(0, y0, 512, y1 - y0); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, y1 - 10, 512, 10); }
  // streaks of weather below the windows
  for (const [x, y] of [[128, 380], [384, 760], [128, 860]]) {
    g.fillStyle = 'rgba(120,110,95,.25)'; g.fillRect(x - 10, y + 40, 20, 90);
    g.fillStyle = '#2a2a33'; g.beginPath(); g.roundRect(x - 16, y - 30, 32, 60, [16, 16, 0, 0]); g.fill();
    g.strokeStyle = '#9a9286'; g.lineWidth = 5; g.stroke();
  }
  g.fillStyle = '#d8d0c0'; g.fillRect(0, 990, 512, 34);
  return c;
}
export function sand(seed = 41) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#c9b88e'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) { g.strokeStyle = 'rgba(150,130,90,.45)'; g.lineWidth = 6; g.beginPath(); const y = i * 20 + r() * 6; g.moveTo(0, y); for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 5); g.stroke(); }
  for (let i = 0; i < 300; i++) { g.fillStyle = hsl(38 + r() * 10, 25, 50 + r() * 25, .6); g.beginPath(); g.ellipse(r() * 512, r() * 512, 1 + r() * 4, 1 + r() * 3, 0, 0, 7); g.fill(); }
  return c;
}
/** waterlogged wreck timber: dark, green slime, barnacles */
export function wreckWood(seed = 51) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = '#6a5238'; g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(20,16,10,${.3 + r() * .4})`; g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke(); }
  for (let i = 0; i < 26; i++) { g.fillStyle = hsl(95 + r() * 30, 25, 34 + r() * 10, .3); g.beginPath(); g.ellipse(r() * 256, r() * 512, 20 + r() * 40, 14 + r() * 30, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(216,210,192,.8)'; g.beginPath(); g.arc(r() * 256, r() * 512, 2 + r() * 3, 0, 7); g.fill(); }
  return c;
}
export function leather(seed = 61) {
  const [c, g] = cv(512, 512), r = rng(seed);
  const gr = g.createRadialGradient(256, 256, 30, 256, 256, 360); gr.addColorStop(0, '#7a4428'); gr.addColorStop(1, '#4a2616');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(30,14,6,${.1 + r() * .2})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 1 + r() * 4, 1 + r() * 2, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(200,150,110,${.1 + r() * .15})`; g.lineWidth = 2; g.beginPath(); const x = r() * 512, y = r() * 512; g.moveTo(x, y); g.lineTo(x + r() * 60 - 30, y + r() * 20 - 10); g.stroke(); }
  g.setLineDash([10, 8]); g.strokeStyle = '#c9a66a'; g.lineWidth = 4; g.strokeRect(34, 34, 444, 444); g.setLineDash([]);
  return c;
}
export function pageEdge() {
  const [c, g] = cv(256, 64), r = rng(71);
  g.fillStyle = '#e8dcbc'; g.fillRect(0, 0, 256, 64);
  for (let y = 0; y < 64; y += 2) { g.fillStyle = `rgba(120,100,70,${.1 + r() * .25})`; g.fillRect(0, y, 256, 1); }
  return c;
}
/** handwriting-like squiggle (deliberately unreadable): loops of varying height, word gaps */
export function scribble(g, x0, y0, w, seed, size = 22, words = 4, col = '#2a2238', lw = 3) {
  const r = rng(seed); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = g.lineJoin = 'round';
  const gaps = []; let tot = 0; for (let i = 0; i < words; i++) { const ww = 0.6 + r() * 0.8; gaps.push(ww); tot += ww; }
  const sp = size * 0.9, scale = (w - sp * (words - 1)) / tot; let x = x0;
  for (let k = 0; k < words; k++) {
    const ww = gaps[k] * scale, n = Math.max(2, Math.round(ww / (size * 0.62)));
    g.beginPath(); g.moveTo(x, y0);
    for (let i = 0; i < n; i++) {
      const tall = r() < 0.22 ? 1.9 : r() < 0.15 ? -1.5 : 1, hh = size * (0.45 + r() * 0.2) * tall, step = ww / n, cx = x + step * (i + 0.5);
      g.bezierCurveTo(cx - step * 0.1, y0 - hh * 1.2, cx + step * 0.55, y0 - hh * 1.1, cx - step * 0.05, y0 - hh * 0.2);
      g.bezierCurveTo(cx - step * 0.3, y0 + size * 0.15, cx + step * 0.3, y0 + size * 0.1, x + step * (i + 1), y0);
    }
    g.stroke();
    if (r() < 0.5) { g.beginPath(); g.moveTo(x + ww * 0.3, y0 - size * 0.9); g.lineTo(x + ww * 0.55, y0 - size * 0.95); g.stroke(); }
    x += ww + sp;
  }
}
export const LINE_SEED = 7771; // the one line he wrote every night
/** a logbook page: aged paper, faint ruling, a short date-squiggle and THE line. blank=true for an empty page */
export function page(seed = 1, blank = false) {
  const [c, g] = cv(560, 760), r = rng(seed);
  const gr = g.createRadialGradient(280, 380, 80, 280, 380, 520); gr.addColorStop(0, '#f1e6c8'); gr.addColorStop(1, '#d6c49a');
  g.fillStyle = gr; g.fillRect(0, 0, 560, 760);
  for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(150,120,70,${.04 + r() * .06})`; g.beginPath(); g.ellipse(r() * 560, r() * 760, 20 + r() * 60, 10 + r() * 40, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(110,130,160,.28)'; g.lineWidth = 2; for (let y = 110; y < 720; y += 46) { g.beginPath(); g.moveTo(40, y); g.lineTo(520, y); g.stroke(); }
  g.strokeStyle = 'rgba(180,70,60,.3)'; g.beginPath(); g.moveTo(84, 30); g.lineTo(84, 740); g.stroke();
  if (!blank) {
    scribble(g, 100, 102, 120 + r() * 50, seed * 13 + 5, 16, 2, '#3a3048', 2.4);         // the date
    scribble(g, 110, 380, 360, LINE_SEED, 30, 4, '#221a30', 4.2);                         // THE line (same every page)
    g.strokeStyle = '#221a30'; g.lineWidth = 4; g.beginPath(); g.arc(486, 382, 3.5, 0, 7); g.stroke(); // full stop
  }
  return c;
}
