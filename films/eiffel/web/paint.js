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

// ======================= 1920s Paris textures (no letters, no digits anywhere) =======================
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
export function cobble(seed = 21) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#4a4440'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 16; row++) for (let col = -1; col < 17; col++) {
    const x = col * 32 + (row % 2) * 16 + r() * 4, y = row * 32 + r() * 3, L = 50 + r() * 16;
    g.fillStyle = hsl(30 + r() * 12, 10 + r() * 8, L); rr(g, x + 2, y + 2, 28, 28, 9); g.fill();
    g.fillStyle = hsl(35, 14, L + 10, .6); rr(g, x + 6, y + 5, 16, 6, 3); g.fill();
  }
  return c;
}
/** riveted wrought iron, "tower brown" paint with rust blooms and peeling patches */
export function rustIron(seed = 22, base = [22, 34, 30], rust = 1) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = hsl(base[0] + r() * 6, base[1], base[2] - 6 + r() * 12, .5); g.fillRect(r() * 512, r() * 512, 20 + r() * 80, 4 + r() * 10); }
  for (let i = 0; i < 26 * rust; i++) { const x = r() * 512, y = r() * 512, R = 8 + r() * 34;
    const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, 'rgba(176,88,40,.85)'); gr.addColorStop(.55, 'rgba(140,66,30,.55)'); gr.addColorStop(1, 'rgba(120,50,20,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, R, R * (0.5 + r()), r() * 3, 0, 7); g.fill();
    for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(140,58,22,.6)'; g.lineWidth = 2 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 6 - 3, y + 20 + r() * 50); g.stroke(); } }
  for (let i = 0; i < 5 * rust; i++) { g.fillStyle = hsl(28, 16, 48 + r() * 8, .7); g.beginPath(); const x = r() * 512, y = r() * 512, R = 18 + r() * 26; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, rr_ = R * (0.6 + 0.4 * r()); g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_ * 0.6); } g.fill(); }
  for (let y = 16; y < 512; y += 64) for (let x = 12; x < 512; x += 24) { g.fillStyle = 'rgba(20,12,8,.7)'; g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,180,.25)'; g.beginPath(); g.arc(x - 1, y - 1, 1.4, 0, 7); g.fill(); }
  return c;
}
/** Haussmann facade: two bays x two floors, cream stone, tall windows, iron balcony rail on the lower floor */
export function facade(seed = 23, hue = 40, lit = 0) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(hue, 32, 80); g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) { g.fillStyle = hsl(hue, 22, 70, .55); g.fillRect(0, y, 512, 2); }
  for (let i = 0; i < 40; i++) { g.fillStyle = hsl(hue, 20, 66 + r() * 8, .35); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 40, 10 + r() * 30, 0, 0, 7); g.fill(); }
  for (let fl = 0; fl < 2; fl++) {
    g.fillStyle = hsl(hue, 26, 72); g.fillRect(0, fl * 256 + 236, 512, 14); // cornice band
    for (let b = 0; b < 2; b++) {
      const x = b * 256 + 78, y = fl * 256 + 40, w = 100, h = 170;
      g.fillStyle = hsl(hue, 24, 68); g.fillRect(x - 12, y - 14, w + 24, h + 20);
      const on = lit && r() < lit;
      g.fillStyle = on ? '#ffc469' : '#3a4050'; g.fillRect(x, y, w, h);
      if (!on) { g.fillStyle = 'rgba(160,190,220,.35)'; g.fillRect(x + 8, y + 8, 30, h - 16); }
      g.fillStyle = hsl(hue, 20, 85); g.fillRect(x + w / 2 - 3, y, 6, h); g.fillRect(x, y + h * 0.45, w, 5);
      g.fillStyle = 'rgba(200,180,150,.9)'; g.fillRect(x + 3, y + 3, 12, h - 6); g.fillRect(x + w - 15, y + 3, 12, h - 6); // shutters edge
      if (fl === 1) { g.fillStyle = '#1e1a1c'; g.fillRect(x - 16, y + h - 46, w + 32, 5); g.fillRect(x - 16, y + h - 4, w + 32, 5); for (let k = 0; k < 13; k++) g.fillRect(x - 14 + k * 10, y + h - 44, 2.5, 42); }
    }
  }
  return c;
}
export function zinc(seed = 24, base = [215, 12, 52]) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) { g.fillStyle = hsl(base[0], base[1], base[2] + 12); g.fillRect(x, 0, 4, 256); g.fillStyle = hsl(base[0], base[1], base[2] - 12); g.fillRect(x + 4, 0, 3, 256); }
  for (let i = 0; i < 30; i++) { g.fillStyle = hsl(base[0], base[1], base[2] - 8 + r() * 16, .35); g.fillRect(r() * 256, r() * 256, 10 + r() * 30, 30 + r() * 60); }
  return c;
}
export function checker(seed = 25, a = '#efe7d4', b = '#cfae6a', n = 4) {
  const [c, g] = cv(512, 512), r = rng(seed), s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? b : a; g.fillRect(i * s, j * s, s, s); }
  for (let k = 0; k < 14; k++) { g.strokeStyle = 'rgba(140,120,100,.28)'; g.lineWidth = 1.5; g.beginPath(); let x = r() * 512, y = 0; g.moveTo(x, y); while (y < 512) { x += r() * 40 - 20; y += 20 + r() * 40; g.lineTo(x, y); } g.stroke(); }
  g.strokeStyle = 'rgba(90,70,40,.35)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
  return c;
}
export function carpet(seed = 26, base = '#8e1d26', trim = '#d8b04a') {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 512);
  g.fillStyle = trim; g.fillRect(10, 0, 8, 512); g.fillRect(238, 0, 8, 512);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(24, 0, 4, 512); g.fillRect(228, 0, 4, 512);
  for (let y = 0; y < 512; y += 64) { g.strokeStyle = 'rgba(230,190,90,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, y + 8); g.lineTo(168, y + 32); g.lineTo(128, y + 56); g.lineTo(88, y + 32); g.closePath(); g.stroke(); g.fillStyle = 'rgba(230,190,90,.4)'; g.beginPath(); g.arc(128, y + 32, 6, 0, 7); g.fill(); }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${r() * .08})`; g.fillRect(r() * 256, r() * 512, 2, 2); }
  return c;
}
export function damask(seed = 27, base = '#6b1f2a', pat = 'rgba(255,215,160,.16)') {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (const [x, y] of [[64, 64], [192, 192], [192, -64], [-64, 192], [64, 320], [320, 64]]) {
    g.fillStyle = pat; g.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.ellipse(x + Math.cos(a) * 24, y + Math.sin(a) * 24, 22, 10, a, 0, 7); } g.fill();
    g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill();
  }
  for (let x = 0; x < 256; x += 64) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, 0, 2, 256); }
  return c;
}
export function wood(seed = 28, h = 14, s = 50, l = 30) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(h, s, l); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 50; k++) { g.strokeStyle = hsl(h - 3, s, l - 6 - r() * 8, .5); g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 14, 170, x - 14, 340, x + r() * 10 - 5, 512); g.stroke(); }
  for (let k = 0; k < 8; k++) { g.strokeStyle = hsl(h, s, l + 14, .25); g.lineWidth = 6; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.lineTo(x + 8, 512); g.stroke(); }
  return c;
}
export function velvet(seed = 29, hue = 350, l = 26) {
  const [c, g] = cv(256, 256);
  for (let x = 0; x < 256; x++) { const k = 0.5 + 0.5 * Math.sin(x / 256 * Math.PI * 8); g.fillStyle = hsl(hue, 62, l * (0.62 + 0.6 * k)); g.fillRect(x, 0, 1, 256); }
  return c;
}
export function brick(seed = 30, hue = 12) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#5a4a40'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 16; row++) for (let col = -1; col < 9; col++) {
    const x = col * 64 + (row % 2) * 32, y = row * 32; g.fillStyle = hsl(hue + r() * 10, 40 + r() * 12, 30 + r() * 12);
    g.fillRect(x + 3, y + 3, 58, 26); g.fillStyle = 'rgba(255,200,160,.12)'; g.fillRect(x + 5, y + 4, 52, 4);
  }
  for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(20,16,12,.25)'; g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 40, 10 + r() * 30, 0, 0, 7); g.fill(); }
  return c;
}
export function concrete(seed = 31, l = 58) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(210, 6, l); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) { g.fillStyle = hsl(210, 6, l - 10 + r() * 20, .35); g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 20, 2 + r() * 12, 0, 0, 7); g.fill(); }
  for (let y = 0; y < 512; y += 128) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, 512, 3); }
  for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(60,50,40,.35)'; g.lineWidth = 3; g.beginPath(); const x = r() * 512; g.moveTo(x, r() * 512); g.lineTo(x + r() * 10 - 5, 512); g.stroke(); }
  return c;
}
export function rock(seed = 32) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#3e3d44'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 160; i++) { g.fillStyle = hsl(230 + r() * 30, 8, 22 + r() * 22, .6); g.beginPath(); g.ellipse(r() * 256, r() * 256, 4 + r() * 18, 3 + r() * 10, r() * 3, 0, 7); g.fill(); }
  return c;
}
export function stripesTex(a = '#efe0c0', b = '#7d1f2e', n = 8) {
  const [c, g] = cv(256, 64);
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 256 / n, 0, 256 / n, 64); }
  return c;
}
export function wainscot(seed = 33, top = '#e8dcc0', panel = '#6a3a22') {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = top; g.fillRect(0, 0, 256, 300);
  g.fillStyle = panel; g.fillRect(0, 300, 256, 212); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(24, 330, 208, 150); g.fillStyle = panel; g.fillRect(30, 336, 196, 138);
  g.fillStyle = '#3a2214'; g.fillRect(0, 292, 256, 12);
  for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(120,90,60,.12)'; g.fillRect(r() * 256, r() * 290, 30, 60); }
  return c;
}
/** big newspaper page: headline bars, grey text lines, a large rusted-tower drawing and a coin-pile drawing — no glyphs */
export function newspaper(seed = 34) {
  const [c, g] = cv(1024, 1400), r = rng(seed);
  g.fillStyle = '#ece2c8'; g.fillRect(0, 0, 1024, 1400);
  for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(160,140,100,.08)'; g.beginPath(); g.ellipse(r() * 1024, r() * 1400, 40 + r() * 90, 30 + r() * 60, 0, 0, 7); g.fill(); }
  g.fillStyle = '#3a342c'; g.fillRect(60, 60, 904, 10); g.fillRect(60, 196, 904, 6);
  g.fillStyle = '#2e2924'; rr(g, 140, 92, 744, 82, 6); g.fill(); // masthead bar (solid block, no letters)
  g.fillStyle = '#ece2c8'; for (let i = 0; i < 9; i++) { rr(g, 170 + i * 78, 112, 58, 42, 4); g.fill(); } g.fillStyle = '#2e2924'; for (let i = 0; i < 9; i++) { rr(g, 180 + i * 78, 122, 38, 22, 3); g.fill(); }
  g.fillStyle = '#3a342c'; rr(g, 60, 232, 904, 46, 6); g.fill(); rr(g, 60, 292, 620, 30, 5); g.fill();
  // tower picture
  const px = 60, py = 350, pw = 560, ph = 700; g.fillStyle = '#d6c8a6'; g.fillRect(px, py, pw, ph); g.strokeStyle = '#3a342c'; g.lineWidth = 5; g.strokeRect(px, py, pw, ph);
  const sky = g.createLinearGradient(0, py, 0, py + ph); sky.addColorStop(0, '#cdbd98'); sky.addColorStop(1, '#e3d6b6'); g.fillStyle = sky; g.fillRect(px + 4, py + 4, pw - 8, ph - 8);
  const x0 = px + pw / 2, yb = py + ph - 40, H = ph - 90;
  g.fillStyle = '#5a4634';
  g.beginPath(); for (let i = 0; i <= 30; i++) { const t = i / 30, w = H * 0.32 * Math.pow(1 - t, 2.2) + 4; g.lineTo(x0 - w, yb - t * H * 0.92); } g.lineTo(x0, yb - H);
  for (let i = 30; i >= 0; i--) { const t = i / 30, w = H * 0.32 * Math.pow(1 - t, 2.2) + 4; g.lineTo(x0 + w, yb - t * H * 0.92); } g.fill();
  g.fillStyle = '#d9cba9'; g.beginPath(); g.ellipse(x0, yb, H * 0.2, H * 0.15, 0, Math.PI, 0); g.fill();
  for (let i = 1; i < 22; i++) { const t = i / 23, yy = yb - t * H * 0.9, w = H * 0.32 * Math.pow(1 - t, 2.2); g.strokeStyle = '#d9cba9'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0 - w * 0.8, yy); g.lineTo(x0 + w * 0.8, yy); g.stroke(); g.fillStyle = 'rgba(217,203,169,.55)'; if (w > 14) { g.fillRect(x0 - w * 0.55, yy - 9, w * 0.3, 6); g.fillRect(x0 + w * 0.25, yy - 9, w * 0.3, 6); } }
  for (const t of [0.22, 0.5]) { const yy = yb - t * H * 0.9, w = (H * 0.32 * Math.pow(1 - t, 2.2) + 4) * 1.3; g.fillStyle = '#4a3828'; g.fillRect(x0 - w, yy - 7, 2 * w, 14); }
  for (let i = 0; i < 26; i++) { const t = r() * 0.7, yy = yb - t * H * 0.9, w = H * 0.32 * Math.pow(1 - t, 2.2); const x = x0 + (r() * 2 - 1) * w * 0.9; const R = 8 + r() * 16; const gr = g.createRadialGradient(x, yy, 0, x, yy, R); gr.addColorStop(0, 'rgba(190,80,30,.95)'); gr.addColorStop(1, 'rgba(190,80,30,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, yy, R, 0, 7); g.fill(); }
  g.strokeStyle = '#2a1e14'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 - 40, yb - H * 0.35); g.lineTo(x0 - 20, yb - H * 0.3); g.lineTo(x0 - 34, yb - H * 0.24); g.lineTo(x0 - 12, yb - H * 0.18); g.stroke(); // crack
  g.fillStyle = '#5a4a3a'; g.fillRect(px + 4, yb, pw - 8, 36);
  // coin pile picture
  const qx = 660, qy = 350, qw = 304, qh = 300; g.fillStyle = '#d6c8a6'; g.fillRect(qx, qy, qw, qh); g.strokeStyle = '#3a342c'; g.lineWidth = 4; g.strokeRect(qx, qy, qw, qh);
  for (const [cx, n] of [[qx + 70, 7], [qx + 140, 10], [qx + 215, 6]]) { for (let k = 0; k < n; k++) { const y = qy + qh - 40 - k * 16; g.fillStyle = '#6e5c3c'; g.fillRect(cx - 30, y - 8, 60, 16); g.fillStyle = '#8a7650'; g.beginPath(); g.ellipse(cx, y - 8, 30, 9, 0, 0, 7); g.fill(); g.fillStyle = '#6e5c3c'; g.beginPath(); g.ellipse(cx, y + 8, 30, 9, 0, 0, Math.PI); g.fill(); }
    g.fillStyle = '#a8946a'; g.beginPath(); g.ellipse(cx, qy + qh - 40 - n * 16 + 8, 30, 9, 0, 0, 7); g.fill(); }
  // text columns as grey lines
  const col = (x, y0, y1, w) => { for (let y = y0; y < y1; y += 22) { const l = w * (0.7 + 0.3 * r()); g.fillStyle = 'rgba(70,64,56,.55)'; rr(g, x, y, (y + 22 >= y1 || r() < 0.08) ? l * 0.5 : w, 7, 3); g.fill(); } };
  col(660, 680, 1330, 304); col(60, 1080, 1330, 270); col(350, 1080, 1330, 270);
  g.fillStyle = '#3a342c'; g.fillRect(640, 350, 3, 980); g.fillRect(330, 1080, 3, 250);
  return c;
}
/** official document: grey lines, ornamental border, red wax seal, loop-signature */
export function documentTex(seed = 35, sign = 1, seal = 1) {
  const [c, g] = cv(512, 700), r = rng(seed);
  g.fillStyle = '#f2e9d2'; g.fillRect(0, 0, 512, 700);
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 6; g.strokeRect(20, 20, 472, 660); g.lineWidth = 2; g.strokeRect(32, 32, 448, 636);
  for (let i = 0; i < 16; i++) { g.fillStyle = '#7a6a4a'; g.beginPath(); g.arc(20 + i * 31.5, 20, 4, 0, 7); g.fill(); g.beginPath(); g.arc(20 + i * 31.5, 680, 4, 0, 7); g.fill(); }
  g.fillStyle = '#5a4a32'; rr(g, 120, 70, 272, 22, 6); g.fill(); rr(g, 170, 104, 172, 12, 5); g.fill();
  for (let y = 150; y < 520; y += 24) { g.fillStyle = 'rgba(80,70,55,.5)'; rr(g, 60, y, 392 * (0.75 + 0.25 * r()), 7, 3); g.fill(); }
  if (sign > 0) { g.strokeStyle = '#1f2a5a'; g.lineWidth = 4; g.beginPath(); const n = Math.floor(80 * sign); for (let i = 0; i <= n; i++) { const t = i / 80; const x = 70 + t * 210 + Math.cos(t * 26) * 14, y = 600 - t * 20 + Math.sin(t * 26) * 18; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  if (seal > 0) { const x = 400, y = 590, R = 52 * seal; g.fillStyle = '#a81e28'; g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr_ = R * (i % 2 ? 0.9 : 1.05); g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); } g.fill(); g.fillStyle = '#7e141c'; g.beginPath(); g.arc(x, y, R * 0.6, 0, 7); g.fill(); g.strokeStyle = '#c8404a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, R * 0.45, 0, 7); g.stroke();
    g.fillStyle = '#c8404a'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * R * 0.25, y + Math.sin(a) * R * 0.25, 5, 9, a, 0, 7); g.fill(); } }
  return c;
}
/** banknote: guilloché + rosettes, no figures */
export function banknote(seed = 36, base = '#9fc08a') {
  const [c, g] = cv(512, 256), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#4e7a44'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 236); g.lineWidth = 2; g.strokeRect(24, 24, 464, 208);
  for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(60,100,60,${.25 + r() * .2})`; g.lineWidth = 1.4; g.beginPath(); for (let x = 30; x <= 482; x += 6) { const y = 128 + Math.sin(x * 0.05 + k * 0.4) * (40 + k) * 0.8; x === 30 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  for (const x of [100, 412]) { g.fillStyle = '#6e9a5c'; g.beginPath(); g.arc(x, 128, 52, 0, 7); g.fill(); g.strokeStyle = '#d8ecc8'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(x, 128, 44, 14, i * Math.PI / 12, 0, 7); g.stroke(); } }
  g.fillStyle = 'rgba(230,240,220,.6)'; g.beginPath(); g.ellipse(256, 128, 70, 80, 0, 0, 7); g.fill();
  return c;
}
/** painted backdrop: dusk or night Paris with the tower silhouette (for windows) */
export function parisView(night = 0, w = 1024, h = 768) {
  const [c, g] = cv(w, h), r = rng(37);
  const sky = g.createLinearGradient(0, 0, 0, h); if (night) { sky.addColorStop(0, '#0d1430'); sky.addColorStop(1, '#2a3560'); } else { sky.addColorStop(0, '#6a5a8a'); sky.addColorStop(0.6, '#e89a6a'); sky.addColorStop(1, '#f6c48a'); }
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  if (night) { g.fillStyle = '#f4ecc8'; g.beginPath(); g.arc(w * 0.78, h * 0.2, 34, 0, 7); g.fill(); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,230,.7)'; g.fillRect(r() * w, r() * h * 0.5, 2, 2); } }
  const x0 = w * 0.42, yb = h * 0.86, H = h * 0.7; g.fillStyle = night ? '#141a30' : '#5a3a3a';
  g.beginPath(); for (let i = 0; i <= 30; i++) { const t = i / 30, ww = H * 0.3 * Math.pow(1 - t, 2.2) + 2; g.lineTo(x0 - ww, yb - t * H * 0.92); } g.lineTo(x0, yb - H); for (let i = 30; i >= 0; i--) { const t = i / 30, ww = H * 0.3 * Math.pow(1 - t, 2.2) + 2; g.lineTo(x0 + ww, yb - t * H * 0.92); } g.fill();
  for (let i = 0; i < 40; i++) { const x = (i / 40) * w, bw = w / 40 + 6, bh = h * (0.1 + r() * 0.12); g.fillStyle = night ? '#10142a' : '#6a4a4a'; g.fillRect(x, h - bh, bw, bh); if (r() < 0.6) { g.fillRect(x + bw * 0.3, h - bh - 14, 8, 14); }
    for (let k = 0; k < 3; k++) if (r() < (night ? 0.5 : 0.2)) { g.fillStyle = night ? '#ffbf5a' : '#f6c48a'; g.fillRect(x + 4 + r() * (bw - 10), h - bh + 10 + r() * (bh - 20), 5, 7); } }
  return c;
}
/** countryside / far landscape strip */
export function fields(seed = 38) {
  const [c, g] = cv(512, 512), r = rng(seed);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { g.fillStyle = [hsl(80, 40, 46), hsl(52, 55, 62), hsl(95, 35, 40), hsl(70, 45, 52)][(i * 3 + j * 5 + ((r() * 4) | 0)) % 4]; g.fillRect(i * 57, j * 57, 57, 57); }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(40,60,20,${r() * .15})`; g.fillRect(r() * 512, r() * 512, 3, 6); }
  return c;
}
export function bookSpines(seed = 39) {
  const [c, g] = cv(512, 256), r = rng(seed); g.fillStyle = '#2a1a12'; g.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 2; row++) { let x = 4; while (x < 508) { const w = 12 + r() * 18, h = 90 + r() * 30; g.fillStyle = hsl([350, 30, 210, 120, 40][(r() * 5) | 0], 40, 24 + r() * 18); g.fillRect(x, row * 128 + 124 - h, w, h); g.fillStyle = 'rgba(230,190,90,.6)'; g.fillRect(x + 2, row * 128 + 124 - h + 12, w - 4, 3); g.fillRect(x + 2, row * 128 + 124 - 18, w - 4, 3); x += w + 1; } g.fillStyle = '#4a2c1a'; g.fillRect(0, row * 128 + 122, 512, 8); }
  return c;
}
export function painting(seed = 40) {
  const [c, g] = cv(256, 200), r = rng(seed); const sky = g.createLinearGradient(0, 0, 0, 200); sky.addColorStop(0, '#9ab0c0'); sky.addColorStop(1, '#e8d6a8'); g.fillStyle = sky; g.fillRect(0, 0, 256, 200);
  g.fillStyle = '#6a7a4a'; g.beginPath(); g.moveTo(0, 150); for (let x = 0; x <= 256; x += 16) g.lineTo(x, 130 + Math.sin(x * 0.05) * 18); g.lineTo(256, 200); g.lineTo(0, 200); g.fill();
  g.fillStyle = '#3a4a2a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(30 + i * 50, 120, 10, 28, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#b08a3a'; g.lineWidth = 16; g.strokeRect(0, 0, 256, 200); return c;
}
