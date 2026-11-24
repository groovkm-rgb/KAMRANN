// OST-BERLIN STREET, Prenzlauer Berg 1989 (side-on, street level). Needs light.js, tex.js, vehicles.js, folk.js.
//   ostStreet(c, cam, t, o)   o: { tod: 'day' | 'dusk', doorOpen: 0..1, queue: true, tram: x | null, tramMoving, cars: true, people: [] }
//   Layout (world / layer-1 units): facade base line HZ = -280, sidewalk HZ..+90 (Noah walks at y 0), curb +90..+125,
//   cobbled road with two tram tracks +125..+800, near curb +800. Main gate of house B1 at x ≈ 108 (OST_GATE_X).
//   ostLight(c, cam, t, o) — overcast light, mist, grade (put in `screen`). ostFront(c, cam, t, o) — foreground layer (in `screen`).
const OST_HZ = -280, OST_GATE_X = 108;
const OST_P = {
  day: { sky: ['#b7bcbb', '#dedcd3'], fog: '205,207,200', far: '#9da3a4', rear: '#7c7670', glass: ['#b8c0c2', '#56626a'], lit: 0, lamp: 0, grade: { sx: .15, sy: 0, warm: '255,240,215', warmA: .14, cool: '40,50,60', coolA: .22 } },
  night: { sky: ['#0b1124', '#25304e'], fog: '30,36,60', far: '#1e2438', rear: '#262632', glass: ['#3a4458', '#121824'], lit: .6, lamp: 1, night: 1, grade: { sx: .5, sy: .85, warm: '255,185,105', warmA: .3, cool: '8,12,40', coolA: .45 } },
  westnight: { sky: ['#0c1430', '#2c3260'], fog: '40,40,80', far: '#262c48', rear: '#2e2c3a', glass: ['#46506a', '#161c2c'], lit: .85, lamp: 1, night: 1, neon: 1, grade: { sx: .5, sy: .9, warm: '255,170,120', warmA: .34, cool: '20,10,60', coolA: .35 } },
  westday: { sky: ['#9cc0dc', '#e6e8e0'], fog: '215,222,228', far: '#a8b4bc', rear: '#8a8480', glass: ['#c8d8e0', '#5a6e7a'], lit: 0, lamp: 0, west: 1, grade: { sx: .1, sy: 0, warm: '255,230,190', warmA: .2, cool: '40,50,70', coolA: .14 } },
  dusk: { sky: ['#5d6a80', '#c7a98e'], fog: '120,120,135', far: '#5f6474', rear: '#4f4c50', glass: ['#7a8494', '#2e3440'], lit: .55, lamp: 1, grade: { sx: .5, sy: .9, warm: '255,190,120', warmA: .22, cool: '20,25,55', coolA: .32 } },
};
// ---------- houses ----------
const OST_HOUSES = [
  { x: -10600, w: 4100, col: '#8c8578', eg: ['win', 'win', 'gate', 'shop', 'shop', 'sdoor'], shop: { name: 'Schreibwaren', col: '#2f4a5a' }, dmg: .4, seed: 11 },
  { x: -6500, w: 4100, col: '#93897a', eg: ['win', 'shop', 'shop', 'sdoor', 'gate', 'shop2'], shop: { name: 'Fleischerei', col: '#7a2e2a' }, shop2: { name: 'Friseur', col: '#2e5a52' }, dmg: .7, seed: 23, bullets: 1 },
  { x: -2400, w: 4300, col: '#9a8e7a', eg: ['shop', 'shop', 'sdoor', 'gate', 'win', 'shop2'], shop: { name: 'Obst und Gemüse', col: '#3f5a2c' }, shop2: { name: 'Backwaren', col: '#6a4a26' }, dmg: .5, seed: 37, gateMain: 1, balcony: 2, ghost: 0, granny: [4, 2] },
  { x: 1900, w: 3900, col: '#857e74', eg: ['shop', 'shop', 'sdoor', 'gate', 'win', 'win'], shop: { name: 'Lebensmittel', col: '#5a3a2a' }, dmg: .9, seed: 41, bullets: 1, ghost: 'Kohlen · Briketts' },
  { x: 5800, w: 4200, col: '#9c907c', eg: ['win', 'gate', 'win', 'shop', 'shop', 'sdoor'], shop: { name: 'Haushaltswaren', col: '#2a3a5a' }, dmg: .5, seed: 53 },
];
const WEST_HOUSES = [
  { x: -10600, w: 4100, col: '#cdbb9a', eg: ['shop', 'shop', 'sdoor', 'gate', 'shop2', 'sdoor'], shop: { name: 'Imbiss', col: '#8a2a2a' }, shop2: { name: 'Lotto', col: '#2a4a8a' }, dmg: .08, seed: 61 },
  { x: -6500, w: 4100, col: '#d8c8a6', eg: ['shop', 'shop', 'sdoor', 'gate', 'shop2', 'shop2'], shop: { name: 'Kiosk', col: '#2a6a3a' }, shop2: { name: 'Schuhe', col: '#5a2a6a' }, dmg: .05, seed: 67 },
  { x: -2400, w: 4300, col: '#c9b090', eg: ['shop', 'shop', 'sdoor', 'gate', 'win', 'shop2'], shop: { name: 'Bier', col: '#3a1a1a' }, shop2: { name: 'Blumen', col: '#2a5a3a' }, dmg: .05, seed: 71, gateMain: 1, balcony: 2 },
  { x: 1900, w: 3900, col: '#e0d0b0', eg: ['shop', 'shop', 'sdoor', 'gate', 'shop2', 'shop2'], shop: { name: 'Kaufhaus', col: '#1a3a6a' }, shop2: { name: 'Mode', col: '#6a1a3a' }, dmg: .05, seed: 73 },
  { x: 5800, w: 4200, col: '#cfc0a0', eg: ['shop', 'shop', 'sdoor', 'gate', 'shop2', 'sdoor'], shop: { name: 'Elektro', col: '#2a2a2a' }, shop2: { name: 'Café', col: '#6a3a1a' }, dmg: .05, seed: 79 },
];
const EG_H = 924, OG_H = 792, WIN_W = 264, WIN_H = 462;
function kWin(c, x, y, w, h, o) {
  // Kastenfenster: deep reveal, weathered outer sashes, transom, inner sash visible through the glass, net curtain, plant, zinc sill
  const wall = o.wall, fr = o.frame || '#d8d0bf', s = o.seed || 0, P = o.P;
  c.fillStyle = dk(wall, .42); c.fillRect(x, y, w, h); c.fillStyle = dk(wall, .22); c.fillRect(x + w - 18, y, 18, h); c.fillStyle = dk(wall, .55); c.fillRect(x, y, w, 14);
  const fx = x + 16, fy = y + 14, fw = w - 34, fh = h - 22, th = fh * .27;
  c.fillStyle = fr; c.fillRect(fx, fy, fw, fh);
  const panes = [[fx + 12, fy + 12, fw - 24, th - 20], [fx + 12, fy + th + 8, fw / 2 - 20, (fh - th) * .48 - 12], [fx + fw / 2 + 8, fy + th + 8, fw / 2 - 20, (fh - th) * .48 - 12], [fx + 12, fy + th + (fh - th) * .48 + 6, fw / 2 - 20, (fh - th) * .52 - 18], [fx + fw / 2 + 8, fy + th + (fh - th) * .48 + 6, fw / 2 - 20, (fh - th) * .52 - 18]];
  const lit = P.lit && rnd(s + 2) > (1 - P.lit * .9);
  panes.forEach((p, i) => {
    glassPane(c, p[0], p[1], p[2], p[3], { sky: P.glass, hi: lit ? .06 : .2, lit: lit ? 'rgba(255,196,110,.78)' : null, crack: o.crack && i === 3 });
    c.save(); c.beginPath(); c.rect(p[0], p[1], p[2], p[3]); c.clip();
    // inner sash (box window) seen through the outer glass
    c.strokeStyle = lit ? 'rgba(120,70,30,.5)' : 'rgba(40,35,30,.35)'; c.lineWidth = 6; c.strokeRect(p[0] + 10, p[1] + 8, p[2] - 4, p[3] - 4);
    if (o.tull && i > 0) { // lace net curtain
      c.fillStyle = lit ? 'rgba(255,238,205,.55)' : 'rgba(238,234,224,.55)'; c.fillRect(p[0], p[1], p[2], p[3]);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 18; k++) { circle(c, p[0] + rnd(s + i * 7 + k) * p[2], p[1] + rnd(s + i * 11 + k) * p[3], 3 + rnd(k + i) * 3); c.fill(); }
      if (i > 2) { c.fillStyle = 'rgba(255,255,255,.3)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(p[0] + (k + .5) * p[2] / 5, p[1] + p[3] - 6, p[2] / 10, 0, Math.PI); c.fill(); } }
    }
    if (o.drape) { c.fillStyle = rgba(o.drape, .9); c.fillRect(i === 1 || i === 3 ? p[0] : p[0] + p[2] - 22, p[1], 22, p[3]); }
    c.restore();
  });
  // plant between the panes, on the inner sill
  if (o.plant) { const px = fx + fw * (.25 + rnd(s) * .5), py = fy + fh - 22; c.beginPath(); c.moveTo(px - 22, py); c.lineTo(px + 22, py); c.lineTo(px + 16, py - 30); c.lineTo(px - 16, py - 30); c.closePath(); fs(c, '#a0583a', 2); for (let k = 0; k < 5; k++) { ell(c, px - 20 + k * 10, py - 46 - rnd(s + k) * 20, 12, 18, k - 2); c.fillStyle = k % 2 ? '#4f6a3a' : '#3d5a2e'; c.fill(); } if (rnd(s + 9) > .5) { circle(c, px + 6, py - 66, 8); c.fillStyle = '#c0403a'; c.fill(); } }
  // frame members on top of the glass
  c.fillStyle = fr; c.fillRect(fx, fy + th - 8, fw, 16); c.fillRect(fx + fw / 2 - 8, fy + th, 16, fh - th); c.fillRect(fx, fy + th + (fh - th) * .48 - 6, fw, 12);
  c.strokeStyle = OUT; c.lineWidth = 2; c.strokeRect(fx, fy, fw, fh);
  // weathered paint: peeling specks, grey wood showing
  for (let k = 0; k < 16; k++) { c.fillStyle = rnd(s + k * 3) > .5 ? 'rgba(110,100,85,.55)' : 'rgba(255,255,255,.35)'; c.fillRect(fx + rnd(s + k * 5) * fw, fy + rnd(s + k * 7) * fh, 4 + rnd(k) * 6, 2 + rnd(k + 1) * 3); }
  // zinc sill + drip + streaks
  c.beginPath(); c.rect(x - 16, y + h, w + 32, 16); fs(c, '#8f9396', 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 14, y + h + 1, w + 28, 3);
  streaks(c, x - 10, y + h + 16, w + 20, o.streak ?? 170, s, { a: .18 });
}
function pediment(c, cx, y, w, kind, col, s, broken) {
  // y = bottom line of the window head; cornice + tympanum ornament; broken = part of the stucco fell off
  const hw = w / 2 + 40, light = lt(col, .14), shadow = 'rgba(25,20,15,.28)';
  c.fillStyle = shadow; c.fillRect(cx - hw, y + 4, hw * 2, 18);
  c.beginPath(); c.rect(cx - hw, y - 28, hw * 2, 28); fs(c, light, 2, rgba(dk(col, .6), .8));
  if (kind === 'tri') { c.beginPath(); c.moveTo(cx - hw - 10, y - 28); c.lineTo(cx, y - 150); c.lineTo(cx + hw + 10, y - 28); c.closePath(); fs(c, col, 0); c.beginPath(); c.moveTo(cx - hw - 16, y - 26); c.lineTo(cx, y - 160); c.lineTo(cx + hw + 16, y - 26); c.lineWidth = 14; c.strokeStyle = light; c.stroke(); c.lineWidth = 2; c.strokeStyle = rgba(dk(col, .6), .8); c.stroke(); ell(c, cx, y - 70, 30, 22); fs(c, light, 2, rgba(dk(col, .6), .7)); for (let k = -2; k <= 2; k++) line(c, [cx, y - 52, cx + k * 14, y - 88], 2, rgba(dk(col, .5), .6)); }
  else if (kind === 'seg') { c.beginPath(); c.moveTo(cx - hw, y - 28); c.quadraticCurveTo(cx, y - 130, cx + hw, y - 28); c.closePath(); fs(c, col, 0); c.beginPath(); c.moveTo(cx - hw - 6, y - 24); c.quadraticCurveTo(cx, y - 140, cx + hw + 6, y - 24); c.lineWidth = 14; c.strokeStyle = light; c.stroke(); c.lineWidth = 2; c.strokeStyle = rgba(dk(col, .6), .8); c.stroke(); }
  else { c.beginPath(); c.rect(cx - hw - 10, y - 58, hw * 2 + 20, 30); fs(c, light, 2, rgba(dk(col, .6), .8)); }
  // consoles
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(cx + sx * (w / 2 + 6), y); c.lineTo(cx + sx * (w / 2 + 34), y); c.lineTo(cx + sx * (w / 2 + 30), y + 70); c.quadraticCurveTo(cx + sx * (w / 2 + 18), y + 80, cx + sx * (w / 2 + 8), y + 60); c.closePath(); fs(c, light, 2, rgba(dk(col, .6), .7)); }
  if (broken) spall(c, cx + (rnd(s) - .5) * w * .6, y - 50, 46 + rnd(s + 1) * 26, s);
}
function brPanel(c, cx, y, w, col, s) {
  // ornamental panel below a window (garland)
  c.beginPath(); c.rect(cx - w / 2, y, w, 110); fs(c, lt(col, .06), 2, rgba(dk(col, .55), .6));
  c.beginPath(); c.moveTo(cx - w / 2 + 30, y + 30); c.quadraticCurveTo(cx, y + 110, cx + w / 2 - 30, y + 30); c.lineWidth = 9; c.strokeStyle = lt(col, .16); c.stroke(); c.lineWidth = 2; c.strokeStyle = rgba(dk(col, .6), .6); c.stroke();
  for (const sx of [-1, 1]) { circle(c, cx + sx * (w / 2 - 30), y + 30, 12); fs(c, lt(col, .16), 2, rgba(dk(col, .6), .6)); }
  if (rnd(s + 4) > .7) spall(c, cx + 20, y + 60, 34, s + 3);
}
function ostGate(c, cx, b, o) {
  // heavy double wooden house door with arched fanlight; open > 0 shows the passage to the back courtyard
  const w = 384, h = 506, top = b - h, arch = 190, wood = o.wood || '#5a3a26', P = o.P, open = o.open || 0;
  // stone surround
  c.beginPath(); c.moveTo(cx - w / 2 - 50, b); c.lineTo(cx - w / 2 - 50, top); c.arc(cx, top, w / 2 + 50, Math.PI, 0); c.lineTo(cx + w / 2 + 50, b); c.closePath(); fs(c, lt(o.wall, .1), 2.5, rgba(dk(o.wall, .6), .8));
  c.beginPath(); c.moveTo(cx - w / 2, b); c.lineTo(cx - w / 2, top); c.arc(cx, top, w / 2, Math.PI, 0); c.lineTo(cx + w / 2, b); c.closePath(); c.fillStyle = '#1e1a17'; c.fill();
  // keystone
  c.beginPath(); c.moveTo(cx - 30, top - w / 2 - 50); c.lineTo(cx + 30, top - w / 2 - 50); c.lineTo(cx + 22, top - w / 2 + 6); c.lineTo(cx - 22, top - w / 2 + 6); c.closePath(); fs(c, lt(o.wall, .18), 2, rgba(dk(o.wall, .6), .8));
  // fanlight
  c.save(); c.beginPath(); c.moveTo(cx - w / 2 + 14, top); c.arc(cx, top, w / 2 - 14, Math.PI, 0); c.closePath(); c.clip(); glassPane(c, cx - w / 2, top - w / 2, w, w / 2, { sky: P.glass, lit: P.lit ? 'rgba(255,200,120,.6)' : null }); c.strokeStyle = wood; c.lineWidth = 10; for (let k = 1; k < 6; k++) { const a = Math.PI + k * Math.PI / 6; line(c, [cx, top, cx + Math.cos(a) * w, top + Math.sin(a) * w], 10, wood); } c.restore();
  nLine(c, [cx - w / 2, top, cx + w / 2, top], 18, wood);
  if (open > 0) {
    // passage: dark tunnel converging to the bright courtyard
    c.save(); c.beginPath(); c.rect(cx - w / 2 + 6, top + 6, w - 12, h - 6); c.clip();
    const ix = cx - 70, iw = 150, iy = b - 250, ih = 240;
    c.fillStyle = '#2a2622'; c.fillRect(cx - w / 2, top, w, h);
    c.fillStyle = '#3a342e'; c.beginPath(); c.moveTo(cx - w / 2, top); c.lineTo(ix, iy); c.lineTo(ix, iy + ih); c.lineTo(cx - w / 2, b); c.closePath(); c.fill();
    c.fillStyle = '#4a433b'; c.beginPath(); c.moveTo(cx + w / 2, top); c.lineTo(ix + iw, iy); c.lineTo(ix + iw, iy + ih); c.lineTo(cx + w / 2, b); c.closePath(); c.fill();
    c.fillStyle = '#55504a'; c.beginPath(); c.moveTo(cx - w / 2, b); c.lineTo(ix, iy + ih); c.lineTo(ix + iw, iy + ih); c.lineTo(cx + w / 2, b); c.closePath(); c.fill();
    for (let k = 1; k < 6; k++) { const yy = iy + ih + (b - iy - ih) * k / 6; line(c, [lerp(ix, cx - w / 2, k / 6), yy, lerp(ix + iw, cx + w / 2, k / 6), yy], 1.5, 'rgba(0,0,0,.35)'); }
    // mailboxes on the passage wall + ceiling lamp
    for (let k = 0; k < 4; k++) { c.beginPath(); c.rect(cx - w / 2 + 30 + k * 14, top + 220 + k * 6, 12, 24 - k * 2); fs(c, '#6a6a40', 1); }
    // courtyard: back house facade, bins, bike, coal shed, washing line
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    c.fillStyle = '#b8b4a8'; c.fillRect(ix, iy, iw, ih); c.fillStyle = '#8a8276'; c.fillRect(ix, iy, iw, ih * .7);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { c.fillStyle = '#4a4e52'; c.fillRect(ix + 12 + k * 48, iy + 10 + r * 52, 26, 36); }
    nLine(c, [ix, iy + 150, ix + iw, iy + 140], 1.5, '#333'); c.fillStyle = '#efece2'; c.fillRect(ix + 30, iy + 150, 28, 26); c.fillStyle = '#c9a0a0'; c.fillRect(ix + 70, iy + 146, 20, 30); c.fillStyle = '#a9b8c8'; c.fillRect(ix + 98, iy + 144, 24, 22);
    c.fillStyle = '#6e6a62'; c.fillRect(ix, iy + ih * .75, iw, ih * .25);
    for (const bx of [ix + 20, ix + 46]) { c.beginPath(); c.rect(bx, iy + ih - 64, 22, 44); fs(c, '#5a5e60', 1.5); }
    c.beginPath(); c.rect(ix + 90, iy + ih - 90, 56, 70); fs(c, '#5a4a3a', 1.5); c.fillStyle = '#222'; c.fillRect(ix + 96, iy + ih - 40, 44, 20);
    c.restore();
    c.fillStyle = 'rgba(15,12,10,.25)'; c.fillRect(cx - w / 2, top, w, h);
    c.restore();
  }
  // door leaves (right leaf swings inward when open)
  const leaf = (lx, lw) => {
    c.beginPath(); c.rect(lx, top, lw, h); fs(c, wood, 3);
    c.save(); c.beginPath(); c.rect(lx, top, lw, h); c.clip();
    const g = c.createLinearGradient(lx, 0, lx + lw, 0); g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(.5, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(0,0,0,.2)'); c.fillStyle = g; c.fillRect(lx, top, lw, h);
    for (let k = 0; k < 40; k++) line(c, [lx + rnd(k + lx) * lw, top, lx + rnd(k + lx) * lw + 3, b], 1.2, 'rgba(25,15,8,.35)');
    c.restore();
    const m = Math.min(26, lw * .12);
    c.beginPath(); c.rect(lx + m, top + 26, lw - 2 * m, h * .42); fs(c, dk(wood, .12), 2); c.beginPath(); c.rect(lx + m + 12, top + 38, lw - 2 * m - 24, h * .42 - 24); fs(c, lt(wood, .06), 1.5);
    if (lw > 120) glassPane(c, lx + m + 22, top + 48, lw - 2 * m - 44, h * .42 - 44, { sky: ['#6a6660', '#2a2622'], hi: .12 });
    c.beginPath(); c.rect(lx + m, top + 60 + h * .42, lw - 2 * m, h * .42); fs(c, dk(wood, .12), 2); ell(c, lx + lw / 2, top + 60 + h * .63, (lw - 2 * m) * .3, 40); fs(c, lt(wood, .05), 1.5);
  };
  leaf(cx - w / 2 + 4, w / 2 - 4);
  if (open > 0) { const lw = (w / 2 - 4) * (1 - open * .82); leaf(cx + w / 2 - lw, lw); } else leaf(cx, w / 2 - 4);
  // brass knob + plate
  c.beginPath(); c.rect(cx - 34, b - 280, 16, 70); fs(c, '#b8963a', 2); circle(c, cx - 26, b - 250, 10); fs(c, '#d8b860', 2);
  // granite step
  c.beginPath(); c.rect(cx - w / 2 - 30, b - 10, w + 60, 26); fs(c, '#8d8a84', 2); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(cx - w / 2 - 30, b + 6, w + 60, 10);
  // wall lamp above + bell panel
  c.beginPath(); c.rect(cx + w / 2 + 60, b - 360, 44, 120); fs(c, '#6a6458', 2); for (let k = 0; k < 6; k++) { circle(c, cx + w / 2 + 82, b - 340 + k * 18, 5); fs(c, '#d8d0b8', 1); }
}
function ostShop(c, x0, x1, b, o) {
  // shopfront spanning x0..x1 at ground floor: framed display window, plain one-colour sign with German lettering, sparse goods
  const P = o.P, col = o.col, top = b - 650, wy = b - 620, wb = b - 140;
  c.beginPath(); c.rect(x0 + 20, top - 120, x1 - x0 - 40, 96); fs(c, col, 2.5); // sign band
  c.save(); c.beginPath(); c.rect(x0 + 20, top - 120, x1 - x0 - 40, 96); c.clip(); mottle(c, x0, top - 120, x1 - x0, 96, o.seed, { r: 20, a: .12 }); streaks(c, x0 + 20, top - 120, x1 - x0 - 40, 90, o.seed, { a: .12 }); c.restore();
  const sz = Math.min(62, (x1 - x0 - 80) / (o.name.length * .52));
  if (P.neon) { const nc = ['255,80,120', '80,220,255', '255,210,80', '120,255,140'][o.seed % 4]; c.save(); c.shadowColor = `rgb(${nc})`; c.shadowBlur = 30; signText(c, o.name, (x0 + x1) / 2, top - 72, sz, `rgb(${nc})`); signText(c, o.name, (x0 + x1) / 2, top - 72, sz, '#fff8f0'); c.restore(); bloom(c, (x0 + x1) / 2, top - 72, (x1 - x0) * .6, nc, .45); }
  else signText(c, o.name, (x0 + x1) / 2, top - 72, sz, '#f0e8d4', { shadow: 'rgba(0,0,0,.35)' });
  if (P.lamp) bloom(c, (x0 + x1) / 2, top - 72, (x1 - x0) * .5, '255,220,160', .22);
  // frame
  c.beginPath(); c.rect(x0 + 30, wy - 20, x1 - x0 - 60, wb - wy + 40); fs(c, '#3e3a34', 3);
  glassPane(c, x0 + 46, wy, x1 - x0 - 92, wb - wy, { sky: P.glass, lit: P.lit ? 'rgba(255,215,150,.75)' : 'rgba(40,36,30,.35)', hi: .16 });
  c.save(); c.beginPath(); c.rect(x0 + 46, wy, x1 - x0 - 92, wb - wy); c.clip();
  // shelves with few goods
  const sw = x1 - x0 - 92;
  for (const sy of [wy + (wb - wy) * .45, wy + (wb - wy) * .9]) { c.fillStyle = '#6a5a48'; c.fillRect(x0 + 46, sy, sw, 12); }
  const goods = o.goods || 'cans';
  for (let i = 0; i < 9; i++) { if (rnd(o.seed + i) > .55) continue; const gx = x0 + 80 + i * sw / 9, gy = wy + (wb - wy) * (i % 2 ? .45 : .9);
    if (goods === 'veg') { for (let k = 0; k < 3; k++) { circle(c, gx + k * 18, gy - 14, 14); fs(c, ['#b8a040', '#8a9a3a', '#c07a3a'][k], 1.5); } }
    else if (goods === 'bread') { ell(c, gx + 20, gy - 18, 34, 18); fs(c, '#b98a4a', 1.5); }
    else if (goods === 'meat') { ell(c, gx + 20, gy - 14, 30, 14); fs(c, '#b86a6a', 1.5); }
    else { c.beginPath(); c.rect(gx, gy - 46, 30, 46); fs(c, ['#c8b89a', '#7a8a6a', '#a05a3a'][i % 3], 1.5); c.beginPath(); c.rect(gx + 34, gy - 46, 30, 46); fs(c, '#d8d0b8', 1.5); }
  }
  c.restore();
  // window sign (cardboard)
  if (o.card) { c.save(); c.translate(x0 + 110, wy + 70); c.rotate(-.04); c.beginPath(); c.rect(0, 0, 200, 90); fs(c, '#efe6cf', 2); signText(c, o.card, 100, 45, 26, '#7a2a20', { font: "'DejaVu Sans', sans-serif", weight: 700 }); c.restore(); }
  c.beginPath(); c.rect(x0 + 46, wy, x1 - x0 - 92, wb - wy); fs(c, null, 2.5);
  c.beginPath(); c.rect(x0 + 30, wb + 20, x1 - x0 - 60, b - wb - 20); fs(c, '#57524a', 2.5); mottle(c, x0 + 30, wb + 20, x1 - x0 - 60, b - wb - 20, o.seed + 3, { r: 18, a: .15 });
}
function ostShopDoor(c, cx, b, o) {
  const w = 230, h = 520, top = b - h;
  c.beginPath(); c.rect(cx - w / 2 - 20, top - 20, w + 40, h + 20); fs(c, '#3e3a34', 3);
  c.beginPath(); c.rect(cx - w / 2, top, w, h); fs(c, '#4e4a42', 2);
  glassPane(c, cx - w / 2 + 24, top + 24, w - 48, h * .62, { sky: o.P.glass, lit: o.P.lit ? 'rgba(255,215,150,.7)' : 'rgba(40,36,30,.4)' });
  c.beginPath(); c.rect(cx - w / 2 + 24, top + 24, w - 48, h * .62); fs(c, null, 2);
  // hanging sign "Geöffnet"
  line(c, [cx - 30, top + 40, cx, top + 70, cx + 30, top + 40], 1.5, '#333'); c.beginPath(); c.rect(cx - 70, top + 70, 140, 50); fs(c, '#efe6cf', 2); signText(c, o.P.lit ? 'Geöffnet' : 'Geöffnet', cx, top + 95, 24, '#2a4a2a', { font: "'DejaVu Sans', sans-serif" });
  c.beginPath(); c.rect(cx + w / 2 - 50, top + h * .5, 14, 70); fs(c, '#b8963a', 1.5);
  c.beginPath(); c.rect(cx - w / 2 - 30, b - 14, w + 60, 30); fs(c, '#8d8a84', 2);
}
function ostHouse(c, H, b, o) {
  const { x, w, col, seed } = H, n = H.eg.length, ax = w / n, P = o.P, egCol = dk(col, .1), top = b - EG_H - 4 * OG_H;
  // wall
  plasterWall(c, x, top - 160, w, b - top + 160, col, seed, { sootTop: .38 });
  clipRect(c, x, b - EG_H, w, EG_H, () => { c.fillStyle = rgba(egCol, .8); c.fillRect(x, b - EG_H, w, EG_H); mottle(c, x, b - EG_H, w, EG_H, seed + 5, { r: 120, a: .1 }); grain(c, x, b - EG_H, w, EG_H, .5, 1.6); rustication(c, x, b - EG_H, w, EG_H - 110, egCol, seed); });
  // ghost sign (faded painted lettering) on the wall between EG and 1st floor
  if (H.ghost) { c.save(); c.globalAlpha = .28; signText(c, H.ghost, x + w * .5, b - EG_H - OG_H * .5 - 60, 120, '#efe6d0', { spacing: 8 }); c.restore(); }
  // plinth
  c.fillStyle = '#5d5a54'; c.fillRect(x, b - 110, w, 110); mottle(c, x, b - 110, w, 110, seed + 8, { r: 50, a: .2, n: 30 }); grain(c, x, b - 110, w, 110, .8, 1.2); cracks(c, x, b - 110, w, 110, seed, 4);
  // cellar hatches in the plinth
  for (let i = 0; i < n; i++) if (H.eg[i] === 'win') { const cx = x + (i + .5) * ax; c.beginPath(); c.rect(cx - 70, b - 90, 140, 70); fs(c, '#2a2826', 2); for (let k = 0; k < 6; k++) line(c, [cx - 60 + k * 24, b - 88, cx - 60 + k * 24, b - 22], 3, '#55524c'); }
  // cornice between EG and 1st floor
  c.fillStyle = 'rgba(20,16,12,.3)'; c.fillRect(x, b - EG_H + 30, w, 22);
  c.beginPath(); c.rect(x - 6, b - EG_H - 10, w + 12, 44); fs(c, lt(col, .12), 2, rgba(dk(col, .6), .7));
  // upper floors
  for (let f = 1; f <= 4; f++) {
    const yb = b - EG_H - (f - 1) * OG_H, wy = yb - 150 - WIN_H;
    c.fillStyle = 'rgba(20,16,12,.22)'; c.fillRect(x, yb + 8, w, 14);
    c.beginPath(); c.rect(x - 4, yb - 6, w + 8, 18); fs(c, lt(col, .08), 1.5, rgba(dk(col, .6), .5));
    for (let i = 0; i < n; i++) {
      const cx = x + (i + .5) * ax, s = seed * 100 + f * 10 + i;
      // surround (Faschen)
      c.beginPath(); c.rect(cx - WIN_W / 2 - 30, wy - 30, WIN_W + 60, WIN_H + 40); fs(c, lt(col, .1), 1.5, rgba(dk(col, .6), .5));
      if (f <= 2) brPanel(c, cx, yb - 140, WIN_W + 20, col, s);
      kWin(c, cx - WIN_W / 2, wy, WIN_W, WIN_H, { wall: col, seed: s, P, tull: rnd(s + 1) > .3, drape: rnd(s + 5) > .55 ? ['#7a4a3a', '#4a5a3a', '#8a7a4a'][Math.floor(rnd(s + 6) * 3)] : null, plant: rnd(s + 7) > .45, crack: rnd(s + 8) > .9, streak: 120 + rnd(s) * 120, frame: rnd(s + 3) > .8 ? '#6e4e36' : '#d8d0bf' });
      const broken = rnd(s + 9) < H.dmg * .45;
      if (f === 1) pediment(c, cx, wy - 30, WIN_W, 'tri', col, s, broken);
      else if (f === 2) pediment(c, cx, wy - 30, WIN_W, 'seg', col, s, broken);
      else if (f === 3) pediment(c, cx, wy - 30, WIN_W, 'flat', col, s, broken);
      // aired bedding / cushion with an old lady leaning out
      if (H.granny && H.granny[0] === i && H.granny[1] === f) { c.save(); c.beginPath(); c.rect(cx - WIN_W / 2 + 14, wy + 14, WIN_W - 28, WIN_H); c.clip(); c.fillStyle = '#2a2420'; c.fillRect(cx - WIN_W / 2, wy, WIN_W, WIN_H); drawFolk(c, { x: cx, y: wy + WIN_H + 150, k: .23, hair: 'perm', hairCol: '#b9b2a6', coat: '#7a6a8a', type: 'cardigan', arms: { l: { a: .5, b: -1.2 }, r: { a: .5, b: -1.2 } }, expr: { mouth: 'soft', look: .6 } }); c.restore(); rrect(c, cx - 140, wy + WIN_H - 40, 280, 56, 20); fs(c, '#b8443e', 2.5); for (let k = 0; k < 6; k++) line(c, [cx - 120 + k * 48, wy + WIN_H - 34, cx - 110 + k * 48, wy + WIN_H + 8], 2, 'rgba(255,255,255,.3)'); drawNoahHand(c, cx - 50, wy + WIN_H - 40, .23, -1.4); drawNoahHand(c, cx + 50, wy + WIN_H - 40, .23, 1.4); }
      if (f === 4 && rnd(s + 12) > .7) { c.beginPath(); c.rect(cx - 120, yb - 170, 240, 36); fs(c, '#e8e4dc', 2); for (let k = 0; k < 5; k++) line(c, [cx - 110 + k * 50, yb - 168, cx - 100 + k * 50, yb - 136], 1.5, '#9aa0b0'); }
    }
    // balcony
    if (H.balcony && f <= 2) { const cx = x + (H.balcony + .5) * ax; c.beginPath(); c.rect(cx - 260, yb - 40, 520, 40); fs(c, lt(col, .05), 2.5); for (const sx of [-200, 200]) { c.beginPath(); c.moveTo(cx + sx - 30, yb); c.lineTo(cx + sx + 30, yb); c.lineTo(cx + sx, yb + 90); c.closePath(); fs(c, lt(col, .08), 2); } line(c, [cx - 255, yb - 260, cx + 255, yb - 260], 8, '#2e2c2a'); for (let k = 0; k <= 20; k++) line(c, [cx - 250 + k * 25, yb - 258, cx - 250 + k * 25, yb - 40], 4, '#2e2c2a'); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(cx - 190 + k * 125, yb - 150, 40, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = '#2e2c2a'; c.stroke(); }
      if (f === 1) { c.beginPath(); c.rect(cx + 40, yb - 120, 120, 80); fs(c, '#8a5a3a', 2); for (let k = 0; k < 4; k++) { ell(c, cx + 60 + k * 28, yb - 140, 18, 24); c.fillStyle = '#6a5a38'; c.fill(); } } }
  }
  // main cornice with consoles + roof
  c.fillStyle = 'rgba(15,12,10,.35)'; c.fillRect(x, top + 10, w, 30);
  c.beginPath(); c.rect(x - 20, top - 90, w + 40, 90); fs(c, lt(col, .1), 2, rgba(dk(col, .6), .8)); for (let k = 0; k < w / 70; k++) { c.beginPath(); c.rect(x + k * 70, top - 20, 34, 30); fs(c, lt(col, .16), 1.5, rgba(dk(col, .6), .6)); }
  c.beginPath(); c.rect(x - 30, top - 140, w + 60, 50); fs(c, lt(col, .05), 2, rgba(dk(col, .6), .8)); soot(c, x - 30, top - 140, w + 60, 140, { top: .4, bottom: 0 });
  const rt = top - 140;
  c.beginPath(); c.moveTo(x - 30, rt); c.lineTo(x + 40, rt - 420); c.lineTo(x + w - 40, rt - 420); c.lineTo(x + w + 30, rt); c.closePath(); c.fillStyle = '#5a5856'; c.fill();
  clipRect(c, x - 30, rt - 420, w + 60, 420, () => { for (let r = 0; r < 18; r++) for (let k = 0; k < w / 40 + 2; k++) { c.fillStyle = rnd(seed + r * 61 + k) > .7 ? '#4a4846' : rnd(seed + r * 13 + k) > .8 ? '#6e6a66' : '#5a5856'; c.fillRect(x - 30 + k * 40 - (r % 2) * 20, rt - 420 + r * 24, 38, 22); } streaks(c, x - 30, rt - 400, w + 60, 380, seed, { a: .12, col: '#2a2622' }); });
  c.beginPath(); c.moveTo(x - 30, rt); c.lineTo(x + 40, rt - 420); c.lineTo(x + w - 40, rt - 420); c.lineTo(x + w + 30, rt); c.lineWidth = 2.5; c.strokeStyle = OUT; c.stroke();
  // dormers
  for (let i = 0; i < n; i += 2) { const cx = x + (i + .5) * ax; c.beginPath(); c.rect(cx - 90, rt - 330, 180, 220); fs(c, '#6a6662', 2); c.beginPath(); c.moveTo(cx - 110, rt - 330); c.lineTo(cx, rt - 400); c.lineTo(cx + 110, rt - 330); c.closePath(); fs(c, '#4a4846', 2); glassPane(c, cx - 60, rt - 300, 120, 150, { sky: P.glass, lit: P.lit && rnd(seed + i) > .5 ? 'rgba(255,200,120,.7)' : null }); c.beginPath(); c.rect(cx - 60, rt - 300, 120, 150); fs(c, null, 2); line(c, [cx, rt - 300, cx, rt - 150], 6, '#d8d0bf'); }
  // chimneys + antennas
  for (let k = 0; k < 3; k++) {
    const chx = x + w * (.18 + k * .32) + rnd(seed + k) * 80, ch = 300 + rnd(seed + k * 3) * 200;
    c.save(); c.beginPath(); c.rect(chx - 60, rt - 420 - ch, 120, ch); c.clip(); brickFill(c, chx - 60, rt - 420 - ch, 120, ch, seed + k, { base: '#7a4636', soot: .35 }); soot(c, chx - 60, rt - 420 - ch, 120, ch, { top: .6, bottom: 0 }); c.restore();
    c.beginPath(); c.rect(chx - 60, rt - 420 - ch, 120, ch); fs(c, null, 2); c.beginPath(); c.rect(chx - 72, rt - 440 - ch, 144, 24); fs(c, '#4a4440', 2);
    if (o.smoke) for (let i = 0; i < 6; i++) { const ph = ((o.t || 0) * .08 + i / 6) % 1; c.fillStyle = `rgba(200,200,196,${.35 * (1 - ph)})`; circle(c, chx + ph * 260 + Math.sin(i + ph * 5) * 20, rt - 460 - ch - ph * 300, 30 + ph * 90); c.fill(); }
    if (k !== 1) { const ax2 = chx + 20, ay = rt - 420 - ch; line(c, [ax2, ay - 20, ax2, ay - 420], 5, '#2a2a2c'); for (let e = 0; e < 4; e++) line(c, [ax2 - 90 + e * 6, ay - 400 + e * 40, ax2 + 90 - e * 6, ay - 400 + e * 40], 3, '#2a2a2c'); line(c, [ax2, ay - 260, ax2 + 110, ay - 260], 3, '#2a2a2c'); for (let e = 0; e < 5; e++) line(c, [ax2 + 20 + e * 20, ay - 290, ax2 + 20 + e * 20, ay - 230], 2.5, '#2a2a2c'); }
  }
  // pigeons on the cornice
  for (let k = 0; k < 4; k++) if (rnd(seed + k * 9) > .4) taube(c, x + rnd(seed + k * 7) * w, top - 140, o.t || 0, k % 2 ? 1 : -1, 1);
  // ground floor bays
  for (let i = 0; i < n; i++) {
    const cx = x + (i + .5) * ax, kind = H.eg[i];
    if (kind === 'win') { const wy = b - EG_H + 200; c.beginPath(); c.rect(cx - WIN_W / 2 - 26, wy - 26, WIN_W + 52, WIN_H + 36); fs(c, lt(egCol, .1), 1.5, rgba(dk(col, .6), .5)); kWin(c, cx - WIN_W / 2, wy, WIN_W, WIN_H, { wall: egCol, seed: seed * 7 + i, P, tull: true, plant: rnd(seed + i) > .5, frame: '#d8d0bf' }); if (rnd(seed + i * 4) > .5) for (let k = 0; k < 5; k++) line(c, [cx - WIN_W / 2 + 20 + k * 56, wy + WIN_H * .45, cx - WIN_W / 2 + 20 + k * 56, wy + WIN_H], 5, '#2e2c2a'); }
    else if (kind === 'gate') ostGate(c, cx, b, { P, wall: egCol, open: H.gateMain ? (o.doorOpen || 0) : 0, wood: H.gateMain ? '#5e3c26' : '#4e3a2e' });
    else if (kind === 'sdoor') ostShopDoor(c, cx, b, { P });
  }
  // small wall details: yellow mailbox, glued posters (torn), cellar grates
  if (H.gateMain) {
    const mx = x + 3.5 * ax + 360; c.beginPath(); c.rect(mx - 55, b - 470, 110, 150); fs(c, '#d8b234', 2.5); c.beginPath(); c.rect(mx - 60, b - 482, 120, 22); fs(c, '#b8962a', 2); c.beginPath(); c.rect(mx - 35, b - 440, 70, 10); fs(c, '#2a2a2a', 1.5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(mx - 55, b - 360, 110, 40); signText(c, 'Briefe', mx, b - 400, 22, '#2a2a2a');
    const px = x + 2.5 * ax + 250; c.save(); c.translate(px, b - 560); c.rotate(.03); c.beginPath(); c.rect(0, 0, 190, 250); fs(c, '#d9cfa8', 2); c.fillStyle = '#9a3a2a'; c.fillRect(14, 14, 162, 60); signText(c, 'Tanzabend', 95, 44, 30, '#f2ead6'); for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(60,50,40,.55)'; c.fillRect(20, 100 + k * 24, 150 - k * 18, 9); } c.fillStyle = dk(col, .1); c.beginPath(); c.moveTo(130, 250); c.lineTo(190, 180); c.lineTo(190, 250); c.closePath(); c.fill(); c.restore();
  }
  // shops: contiguous 'shop' bays, then 'shop2'
  for (const key of ['shop', 'shop2']) { const idx = H.eg.map((k, i) => k === key ? i : -1).filter(i => i >= 0); if (!idx.length) continue; const sh = H[key]; ostShop(c, x + idx[0] * ax, x + (idx[idx.length - 1] + 1) * ax, b, { P, col: sh.col, name: sh.name, seed: seed + idx[0], goods: { 'Obst und Gemüse': 'veg', 'Backwaren': 'bread', 'Fleischerei': 'meat' }[sh.name] || 'cans', card: sh.name === 'Obst und Gemüse' ? 'Bananen? Leider nein.' : null }); }
  // damage: spalls, bullet holes, cracks
  for (let k = 0; k < 10 * H.dmg; k++) spall(c, x + rnd(seed + k * 3) * w, b - EG_H - rnd(seed + k * 5) * 3000, 30 + rnd(seed + k) * 50, seed + k * 11);
  if (H.bullets) { bulletHoles(c, x + w * .1, b - EG_H - 700, w * .8, 900, seed, 70); bulletHoles(c, x + w * .3, b - EG_H + 40, w * .5, 600, seed + 9, 26); }
  cracks(c, x, top, w, b - top, seed + 2, 8);
  // drain pipe with brackets + shoe
  const dx = x + w - 30; line(c, [dx, top - 120, dx, b - 40], 22, OUT); line(c, [dx, top - 120, dx, b - 40], 16, '#7d8286'); line(c, [dx - 4, top - 120, dx - 4, b - 40], 3, 'rgba(255,255,255,.35)');
  for (let y = top; y < b; y += 400) { c.beginPath(); c.rect(dx - 14, y, 28, 10); fs(c, '#5a5e62', 1.5); }
  c.beginPath(); c.moveTo(dx - 11, b - 40); c.lineTo(dx + 40, b - 10); c.lineTo(dx + 40, b); c.lineTo(dx - 11, b); c.closePath(); fs(c, '#6d7276', 2);
  streaks(c, dx - 30, top - 100, 60, 1200, seed + 77, { a: .2 });
  // seam between houses
  line(c, [x, top - 140, x, b], 3, 'rgba(20,16,12,.5)');
}
// ---------- street furniture ----------
function ostLamp(c, x, y, on) {
  // tall slim mast with a curved arm and flat luminaire (~8 m)
  c.beginPath(); c.rect(x - 22, y - 120, 44, 120); fs(c, '#4a4e50', 2.5);
  line(c, [x, y - 120, x, y - 1700], 20, OUT); line(c, [x, y - 120, x, y - 1700], 13, '#5c6064'); line(c, [x - 3, y - 120, x - 3, y - 1700], 3, 'rgba(255,255,255,.25)');
  c.beginPath(); c.moveTo(x, y - 1700); c.quadraticCurveTo(x, y - 1800, x + 160, y - 1800); c.lineWidth = 16; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 10; c.strokeStyle = '#5c6064'; c.stroke();
  c.beginPath(); c.moveTo(x + 130, y - 1812); c.lineTo(x + 330, y - 1806); c.lineTo(x + 320, y - 1776); c.lineTo(x + 140, y - 1780); c.closePath(); fs(c, '#4e5256', 2.5);
  ell(c, x + 230, y - 1774, 84, 10); fs(c, on ? '#fff1c8' : '#d8d6cc', 2);
  if (on) { bloom(c, x + 230, y - 1760, 520, '255,214,150', .6); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, y - 1770, 0, y); g.addColorStop(0, 'rgba(255,210,150,.22)'); g.addColorStop(1, 'rgba(255,210,150,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 150, y - 1770); c.lineTo(x + 310, y - 1770); c.lineTo(x + 700, y + 60); c.lineTo(x - 240, y + 60); c.closePath(); c.fill(); c.restore(); }
  // posters / stickers on the mast
  c.beginPath(); c.rect(x - 14, y - 520, 28, 90); fs(c, '#d8d0b8', 1.5);
}
function ostTree(c, x, y, s, t) {
  // November street tree: half bare, a few clinging yellow-brown leaves, grate at the foot
  c.beginPath(); c.rect(x - 110, y - 10, 220, 22); fs(c, '#3e3a36', 2); for (let k = 0; k < 9; k++) line(c, [x - 100 + k * 25, y - 8, x - 100 + k * 25, y + 10], 2, '#22201e');
  const br = (x0, y0, a, len, w, d) => {
    const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len + Math.sin(t * .8 + x0 * .01) * d * .6;
    line(c, [x0, y0, x1, y1], w + 4, OUT); line(c, [x0, y0, x1, y1], w, '#4a423a');
    if (d > 0) { br(x1, y1, a - .35 - rnd(s + d * 3 + x0) * .3, len * .72, w * .68, d - 1); br(x1, y1, a + .3 + rnd(s + d * 5 + y0) * .3, len * .7, w * .65, d - 1); }
    else for (let k = 0; k < 3; k++) if (rnd(s + x1 + k) > .45) { ell(c, x1 + (rnd(k + x1) - .5) * 40, y1 + (rnd(k + y1) - .5) * 30, 14, 9, rnd(k) * 3); c.fillStyle = ['#b8862e', '#9a6a26', '#c8a048'][k]; c.fill(); }
  };
  line(c, [x, y, x - 6, y - 900], 64, OUT); line(c, [x, y, x - 6, y - 900], 56, '#5a5048');
  c.save(); c.beginPath(); c.rect(x - 30, y - 900, 60, 900); c.clip(); for (let k = 0; k < 30; k++) { c.fillStyle = rnd(s + k) > .5 ? 'rgba(200,190,170,.35)' : 'rgba(30,26,22,.35)'; ell(c, x - 20 + rnd(s + k * 3) * 40, y - rnd(s + k * 5) * 900, 8 + rnd(k) * 12, 5, 0); c.fill(); } c.restore();
  br(x - 6, y - 900, -Math.PI / 2 - .5, 420, 34, 4); br(x - 6, y - 900, -Math.PI / 2 + .45, 440, 34, 4); br(x - 6, y - 1050, -Math.PI / 2, 380, 28, 3);
}
function litfass(c, x, y) {
  // advertising column with faded, torn posters
  c.beginPath(); c.rect(x - 150, y - 60, 300, 60); fs(c, '#4e4e48', 2.5);
  c.beginPath(); c.rect(x - 140, y - 920, 280, 860); fs(c, '#5a5a52', 2.5);
  const posters = [['#c9b89a', 'Konzert'], ['#a8b8a0', 'Theater'], ['#d0a080', 'Kino'], ['#b8b0c8', 'Tanzabend'], ['#d8d0b0', 'Ausstellung']];
  c.save(); c.beginPath(); c.rect(x - 140, y - 900, 280, 820); c.clip();
  posters.forEach((p, i) => { const py = y - 890 + i * 165, px = x - 140 + (i % 2) * 40 - 30; c.fillStyle = p[0]; c.fillRect(px, py, 240, 150); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(px, py, 240, 6); signText(c, p[1], px + 120, py + 50, 34, dk(p[0], .6)); for (let k = 0; k < 3; k++) { c.fillStyle = rgba(dk(p[0], .4), .6); c.fillRect(px + 30, py + 90 + k * 16, 180 - k * 40, 7); } if (rnd(i + 3) > .5) { c.fillStyle = '#5a5a52'; c.beginPath(); c.moveTo(px + 200, py); c.lineTo(px + 240, py); c.lineTo(px + 240, py + 80); c.closePath(); c.fill(); } });
  const g = c.createLinearGradient(x - 140, 0, x + 140, 0); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.35, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = g; c.fillRect(x - 140, y - 920, 280, 860);
  streaks(c, x - 140, y - 900, 280, 400, 7, { a: .15 }); c.restore();
  c.beginPath(); c.rect(x - 160, y - 960, 320, 46); fs(c, '#4a4a44', 2.5); c.beginPath(); c.moveTo(x - 160, y - 960); c.quadraticCurveTo(x, y - 1130, x + 160, y - 960); c.closePath(); fs(c, '#55554e', 2.5); circle(c, x, y - 1080, 16); fs(c, '#4a4a44', 2);
}
function phoneBoothOst(c, x, y) {
  // yellow eastern phone booth: framed glass, grey roof, "Telefon" panel
  const w = 230, h = 520;
  softShadow(c, x, y + 4, 200, .3);
  c.beginPath(); c.rect(x - w / 2, y - h, w, h); fs(c, '#d9b43a', 3);
  c.save(); c.beginPath(); c.rect(x - w / 2, y - h, w, h); c.clip(); mottle(c, x - w / 2, y - h, w, h, 5, { r: 16, a: .15 }); c.restore();
  for (let r = 0; r < 3; r++) { glassPane(c, x - w / 2 + 22, y - h + 90 + r * 125, w - 44, 108, { sky: ['#b0babb', '#5a666c'], hi: .2 }); c.beginPath(); c.rect(x - w / 2 + 22, y - h + 90 + r * 125, w - 44, 108); fs(c, null, 2); }
  c.fillStyle = 'rgba(40,40,40,.5)'; c.fillRect(x - 30, y - h + 220, 60, 90); // phone inside
  c.beginPath(); c.rect(x - w / 2 - 10, y - h - 30, w + 20, 36); fs(c, '#6c6c66', 2.5);
  c.beginPath(); c.rect(x - w / 2 + 14, y - h + 20, w - 28, 54); fs(c, '#efe8d0', 2); signText(c, 'Telefon', x, y - h + 48, 36, '#2a2a2a');
  c.beginPath(); c.rect(x - w / 2, y - 60, w, 60); fs(c, '#b8962e', 2.5);
}
function coalHeap(c, x, y) {
  // delivered briquettes dumped on the pavement + shovel + wheelbarrow
  c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, x, y + 6, 260, 40); c.fill();
  for (let i = 0; i < 70; i++) { const a = rnd(i) * Math.PI, r = rnd(i + 3) * 1; const bx = x + Math.cos(a) * 240 * r, by = y - Math.sin(a) * 150 * r * (1 - Math.abs(Math.cos(a)) * .4); c.save(); c.translate(bx, by); c.rotate(rnd(i + 5) * .6 - .3); rrect(c, -20, -9, 40, 18, 5); c.fillStyle = rnd(i + 7) > .5 ? '#2a2826' : '#363230'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(-15, -7, 30, 3); c.restore(); }
  line(c, [x + 120, y - 60, x + 260, y - 330], 10, '#7a5a3a'); c.beginPath(); c.moveTo(x + 90, y - 80); c.lineTo(x + 150, y - 20); c.lineTo(x + 170, y - 60); c.lineTo(x + 120, y - 110); c.closePath(); fs(c, '#4a4a4a', 2);
}
function wheelbarrow(c, x, y) { vWheel(c, x + 160, y - 50, 50, { nuts: 0 }); c.beginPath(); c.moveTo(x - 120, y - 230); c.lineTo(x + 170, y - 230); c.lineTo(x + 130, y - 100); c.lineTo(x - 70, y - 110); c.closePath(); fs(c, '#4a5a4a', 2.5); c.fillStyle = '#2a2826'; c.fillRect(x - 100, y - 236, 260, 20); line(c, [x - 70, y - 110, x - 120, y - 10], 8, '#3a3a3a'); line(c, [x - 90, y - 120, x - 300, y - 170], 12, '#6a4a2a'); }
function ostBike(c, x, y, col = '#2f5a4a') { for (const s of [-1, 1]) { circle(c, x + s * 130, y - 90, 88); c.lineWidth = 9; c.strokeStyle = '#1e1e1e'; c.stroke(); circle(c, x + s * 130, y - 90, 80); c.lineWidth = 2; c.strokeStyle = '#8a8a8a'; c.stroke(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI; line(c, [x + s * 130 - Math.cos(a) * 78, y - 90 - Math.sin(a) * 78, x + s * 130 + Math.cos(a) * 78, y - 90 + Math.sin(a) * 78], 1, '#9a9a9a'); } } for (const p of [[-130, -90, -10, -90], [-10, -90, 90, -230], [-130, -90, -50, -230], [-50, -230, 90, -230], [90, -230, 130, -90], [-50, -230, -10, -90]]) line(c, [x + p[0], y + p[1], x + p[2], y + p[3]], 9, col); line(c, [x - 50, y - 230, x - 60, y - 270], 6, '#222'); ell(c, x - 64, y - 274, 40, 11); fs(c, '#3a2a22', 2); line(c, [x + 90, y - 230, x + 76, y - 300], 6, '#222'); line(c, [x + 46, y - 300, x + 110, y - 306], 7, '#222'); c.beginPath(); c.rect(x + 110, y - 210, 60, 40); fs(c, '#6a6a5a', 1.5); }
function pigeonO(c, x, y, t, s = 1) { taube(c, x, y, t, s, .78); }
function ostStreetSign(c, x, y, name) { line(c, [x, y, x, y - 600], 12, '#4a4e50'); c.beginPath(); c.rect(x - 200, y - 680, 400, 80); fs(c, '#f0ede2', 3); c.beginPath(); c.rect(x - 192, y - 672, 384, 64); fs(c, null, 2.5, '#2a2a2a'); signText(c, name, x, y - 640, 40, '#1e1e1e'); }
// ---------- the set ----------
function ostStreet(c, cam, t, o = {}) {
  const P = OST_P[o.tod || 'day'], HZ = OST_HZ, B = p => baseZ(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0);
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.sky[0]); g.addColorStop(1, P.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // L1 sky: low cloud banks, pale sun disc behind haze
  layerZ(c, cam, .02, c => { const b = B(.02); if (P.night) { for (let i = 0; i < 90; i++) { circle(c, -3000 + rnd(i) * 6000, b - 2600 + rnd(i + 40) * 1400, 1.5 + rnd(i + 80) * 2); c.fillStyle = 'rgba(250,248,225,.7)'; c.fill(); } circle(c, 900, b - 2000, 60); c.fillStyle = '#f4efd2'; c.fill(); bloom(c, 900, b - 2000, 300, '200,215,255', .35); return; } bloom(c, -600, b - 1400, 700, o.tod === 'dusk' ? '255,170,110' : '255,250,235', .5); for (let i = 0; i < 9; i++) { const x = -3000 + i * 800, y = b - 1700 + rnd(i + 5) * 500; c.fillStyle = o.tod === 'dusk' ? 'rgba(120,110,130,.4)' : 'rgba(170,174,172,.45)'; for (const [dx, dy, r] of [[0, 0, 160], [150, -40, 190], [320, 0, 150], [-140, 20, 120]]) { ell(c, x + dx, y + dy, r * 1.6, r * .6); c.fill(); } } });
  // L2 far skyline: TV tower, church spire, roofs, chimney smoke
  layerZ(c, cam, .07, c => {
    const b = B(.07), col = P.far;
    c.fillStyle = col; for (let i = 0; i < 60; i++) { const x = -4500 + i * 160, h = 260 + rnd(i + 3) * 260; c.fillRect(x, b - h, 150, h); if (rnd(i + 8) > .7) c.fillRect(x + 50, b - h - 120, 26, 120); }
    const tx = 900; c.fillRect(tx - 34, b - 2300, 68, 2300); circle(c, tx, b - 2050, 120); c.fill(); c.fillRect(tx - 70, b - 2160, 140, 30); c.fillRect(tx - 10, b - 2650, 20, 380); line(c, [tx, b - 2650, tx, b - 2780], 6, col);
    c.beginPath(); c.moveTo(-1700, b - 380); c.lineTo(-1640, b - 1100); c.lineTo(-1580, b - 380); c.closePath(); c.fill(); c.fillRect(-1700, b - 600, 120, 600);
    for (let i = 0; i < 8; i++) { const sx = -3500 + i * 950; for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(190,190,186,${.25 - k * .05})`; circle(c, sx + k * 90 + t * 8 % 60, b - 600 - k * 140, 70 + k * 40); c.fill(); } }
  });
  haze(c, P.fog, .4);
  // L3 rear buildings: side wings, fire walls with ghost ads, chimneys, antennas
  layerZ(c, cam, .3, c => {
    const b = B(.3), [x0, x1] = visXZ(cam, .3, 600);
    for (let i = Math.floor(x0 / 1500); i * 1500 < x1; i++) {
      const x = i * 1500, h = 3300 + rnd(i + 40) * 700, w = 800 + rnd(i + 41) * 450, col = mixHex(P.rear, '#8a8278', rnd(i + 42) * .4);
      plasterWall(c, x, b - h, w, h, col, i + 300, { mottle: .1 });
      if (rnd(i + 43) > .5) { for (let r = 0; r < 5; r++) for (let k = 0; k < w / 260 - 1; k++) { c.fillStyle = P.lit && rnd(i * 9 + r * 3 + k) > .6 ? '#e0b070' : '#4a4e52'; c.fillRect(x + 90 + k * 260, b - h + 300 + r * 700, 90, 160); } }
      else { c.save(); c.globalAlpha = .2; signText(c, ['Seife', 'Kaffee', 'Zigarren', 'Möbel'][i & 3], x + w / 2, b - h + 600, 200, '#efe6d0'); c.restore(); }
      c.fillStyle = '#4e4c4a'; c.beginPath(); c.moveTo(x - 20, b - h); c.lineTo(x + w / 2, b - h - 260); c.lineTo(x + w + 20, b - h); c.fill();
      for (let k = 0; k < 2; k++) { const cx = x + 100 + rnd(i + k * 7) * (w - 200); c.fillStyle = '#5a3e34'; c.fillRect(cx, b - h - 400, 80, 420); line(c, [cx + 40, b - h - 400, cx + 40, b - h - 760], 4, '#3a3838'); line(c, [cx - 40, b - h - 700, cx + 120, b - h - 700], 3, '#3a3838'); line(c, [cx - 20, b - h - 640, cx + 100, b - h - 640], 3, '#3a3838'); }
    }
  });
  haze(c, P.fog, .22);
  // L4 main facades
  layerZ(c, cam, 1, c => {
    const b = HZ, [x0, x1] = visXZ(cam, 1, 300);
    for (const Hs of (o.houses || OST_HOUSES)) if (Hs.x < x1 && Hs.x + Hs.w > x0) ostHouse(c, Hs, b, { P, t, doorOpen: o.doorOpen, smoke: !P.west && !P.neon });
  });
  // L5 pavement, kerb, cobbled road, tracks
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 300);
    const aoG = c.createLinearGradient(0, HZ, 0, HZ + 90);
    cobbles(c, x0, x1, HZ, HZ + 70, 3, { base: '#7c7770', h0: 11, h1: 13, wide: 1, sheen: .1 });
    slabs(c, x0, x1, HZ + 70, HZ + 250, 5, { base: '#9a948a', w: 250 });
    aoG.addColorStop(0, 'rgba(20,16,12,.45)'); aoG.addColorStop(1, 'rgba(20,16,12,0)'); c.fillStyle = aoG; c.fillRect(x0, HZ, x1 - x0, 90);
    cobbles(c, x0, x1, HZ + 250, 90, 7, { base: '#7a756e', h0: 14, h1: 16, wide: 1, sheen: .1 });
    // kerb
    c.fillStyle = '#a7a39b'; c.fillRect(x0, 90, x1 - x0, 22); c.fillStyle = '#6a6761'; c.fillRect(x0, 112, x1 - x0, 20); for (let x = Math.floor(x0 / 300) * 300; x < x1; x += 300) line(c, [x, 90, x, 132], 2, '#55524c');
    // road
    cobbles(c, x0, x1, 132, 820, 11, { base: '#4e4a46', h0: 16, h1: 30, sheen: P.night ? .3 : o.tod === 'dusk' ? .22 : .16 });
    // asphalt patches
    for (let i = Math.floor(x0 / 1700); i * 1700 < x1; i++) { const px = i * 1700 + rnd(i + 70) * 800, py = 200 + rnd(i + 71) * 450, pw = 300 + rnd(i + 72) * 500; c.fillStyle = '#3a3a3c'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + pw, py + 10); c.lineTo(px + pw - 40, py + 90); c.lineTo(px + 30, py + 80); c.closePath(); c.fill(); c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; c.stroke(); }
    // tram tracks (grooved rails with granite edging)
    for (const ry of [330, 400, 600, 690]) { c.fillStyle = '#5c5a56'; c.fillRect(x0, ry - 14, x1 - x0, 30); c.fillStyle = '#9a9ca0'; c.fillRect(x0, ry - 4, x1 - x0, 7); c.fillStyle = '#d0d4d6'; c.fillRect(x0, ry - 4, x1 - x0, 2); c.fillStyle = '#1c1b1a'; c.fillRect(x0, ry + 3, x1 - x0, 5); }
    // puddles, leaves, litter, manhole
    for (let i = Math.floor(x0 / 900); i * 900 < x1; i++) { if (rnd(i + 80) > .55) puddle(c, i * 900 + rnd(i + 81) * 500, 170 + rnd(i + 82) * 560, 90 + rnd(i + 83) * 120, 16 + rnd(i) * 12, i, { top: P.night ? 'rgba(255,190,110,.55)' : o.tod === 'dusk' ? 'rgba(150,140,150,.8)' : 'rgba(205,210,210,.75)', bot: P.night ? 'rgba(20,24,40,.8)' : undefined }); }
    leaves(c, x0, x1, HZ + 10, 120, 21, Math.round((x1 - x0) / 60));
    leaves(c, x0, x1, 130, 800, 23, Math.round((x1 - x0) / 90), { s: 1.4 });
    for (let i = 0; i < (x1 - x0) / 400; i++) cigButt(c, x0 + rnd(i + 90) * (x1 - x0), HZ + 20 + rnd(i + 91) * 380, rnd(i));
    c.fillStyle = '#6a6761'; c.fillRect(x0, 820, x1 - x0, 22); c.fillStyle = '#a7a39b'; c.fillRect(x0, 842, x1 - x0, 26); slabs(c, x0, x1, 868, 1080, 9, { base: '#9a948a', w: 260 }); cobbles(c, x0, x1, 1080, 1500, 13, { base: '#7a756e', h0: 18, h1: 26, wide: 1, sheen: .1 }); leaves(c, x0, x1, 860, 1300, 29, Math.round((x1 - x0) / 120), { s: 1.6 });
    for (let i = Math.floor(x0 / 2600); i * 2600 < x1; i++) { const mx = i * 2600 + 900; ell(c, mx, 500, 110, 22); fs(c, '#3a3836', 2); for (let k = -3; k <= 3; k++) line(c, [mx + k * 26, 486, mx + k * 26, 514], 2, '#55524e'); }
  });
}
// props standing on the pavement / road, drawn in world space (call from `behind`, sorted by y yourself)
function ostProps(c, t, o = {}) {
  const P = OST_P[o.tod || 'day'], lampOn = !!P.lamp;
  if (P.west || P.neon) { westProps(c, t, o, P); return; }
  phoneBoothOst(c, -3000, -60);
  litfass(c, 2700, 10);
  coalHeap(c, 830, -160); wheelbarrow(c, 1280, -120);
  ostBike(c, -3900, -190, '#3a5a7a'); ostBike(c, -4150, -170, '#7a3a2a');
  ostStreetSign(c, -4380, 40, 'Kastanienallee');
  for (const x of [-4900, -2700, 1750, 4600]) { c.beginPath(); c.rect(x - 110, 50, 220, 22); fs(c, '#3e3a36', 2); for (let k = 0; k < 9; k++) line(c, [x - 100 + k * 25, 52, x - 100 + k * 25, 70], 2, '#22201e'); bareTree(c, x, 60, { seed: x * .37, t, h: 1000, trunk: 60 }); }
  for (const x of [-3600, 640, 3900]) ostLamp(c, x, 80, lampOn);
  // children's chalk hopscotch on the slabs (oblique)
  c.save(); c.strokeStyle = 'rgba(245,242,230,.8)'; c.lineWidth = 5; const hx = 320; for (let k = 0; k < 4; k++) { c.strokeRect(hx + k * 95, -150, 95, 90); } c.strokeRect(hx + 380, -195, 95, 90); c.strokeRect(hx + 380, -105, 95, 90); c.beginPath(); c.arc(hx + 520, -105, 45, -1.6, 1.6); c.stroke(); c.font = "700 30px 'DejaVu Sans'"; c.fillStyle = 'rgba(245,242,230,.85)'; c.fillText('Himmel', hx + 580, -95); c.restore();
  pigeonO(c, 380, -40, t); pigeonO(c, 470, -10, t + .4, -1); pigeonO(c, 300, 30, t + .9);
}
function ostLight(c, cam, t, o = {}) {
  const P = OST_P[o.tod || 'day'];
  layerZ(c, cam, 1, c => { if (!P.night && o.tod !== 'dusk') { motes(c, cam.x - 1600, cam.x + 1600, cam.y - 700, cam.y + 600, t, { n: 30, color: '235,235,230', alpha: .35, speed: .015 }); mist(c, 0, '225,226,220', .12, 500); } });
  grade(c, P.grade);
  if (P.west || P.neon) return;
  // gentle desaturation (eastern grey)
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.22)'; c.fillRect(0, 0, W, H); c.restore();
}
// foreground layer (zoom-lens, p > 1): near kerb, a big tree trunk and an optional parked car close to the camera. In `screen`.
//   o.front: { trees: [x...], car: { x, col } } in foreground layer coordinates (they move faster than the world)
function ostFront(c, cam, t, o = {}) {
  const F = o.front; if (!F) return; const p = F.p || 1.35;
  layerZ(c, cam, p, c => {
    const base = baseZ(cam, F.base ?? 520, p);
    if (F.car) trabi(c, F.car.x, { y: base, col: F.car.col || '#d9cba6', s: F.car.s || 1, t, idle: F.car.idle, dirt: true, rust: true });
    for (const tx of F.trees || []) bareTree(c, tx, base + 40, { seed: tx * .21, t, h: 1600, trunk: 120, low: false });
  });
}
// overhead tram contact wires above both tracks (world space; call after people, before vehicles)
function ostWires(c, cam) {
  const [x0, x1] = visXZ(cam, 1, 400);
  for (const ty of [365, 645]) tramWire(c, x0, x1, ty - 1290, { rosetteY: OST_HZ - 2000 });
}
