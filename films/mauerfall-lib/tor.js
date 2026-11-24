// BRANDENBURG GATE, morning of 10 November, seen from the west: graffiti wall in front (round pipe on top), crowd on the wall,
// the gate behind in low morning sun. Needs light.js, tex.js, folk.js.
//   torSet(c, cam, t, o)   wall face on TOR_WALL (y of the wall foot); people stand on the wall top at TOR_TOP
//   torLight(c, cam, t, o) golden morning sun from the left, mist, warm grade (in `screen`)
//   graffitiWall(c, x0, x1, yFoot, seed) the west face: dense colourful paint, German words, tags, posters
//   torCrowd(c, t, o)      people on the wall (arms up, flags, hammer & chisel), world space
const TOR_WALL = 200, TOR_TOP = TOR_WALL - 790 - 80;
function gateFar(c, cx, b, sc, sun) {
  // Brandenburg Gate silhouette with columns, attic and the quadriga (far layer; sc scales the 26 m gate)
  c.save(); c.translate(cx, b); c.scale(sc, sc);
  const stone = '#d7c39a', sh = '#b39c74', W2 = 2900;
  c.beginPath(); c.rect(-W2, -900, 2 * W2, 900); fs(c, sh, 6);
  for (let i = 0; i < 12; i++) { const x = -W2 + 180 + i * (2 * W2 - 360) / 11; c.beginPath(); c.rect(x - 90, -3900, 180, 3900); fs(c, stone, 5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + 30, -3900, 60, 3900); for (let k = 0; k < 6; k++) line(c, [x - 60 + k * 24, -3800, x - 60 + k * 24, -100], 3, 'rgba(120,100,70,.4)'); }
  for (let i = 0; i < 5; i++) { const x = -W2 + 180 + (i + .5) * (2 * W2 - 360) / 5.5; c.fillStyle = 'rgba(40,30,20,.45)'; }
  c.beginPath(); c.rect(-W2 - 60, -4300, 2 * W2 + 120, 420); fs(c, stone, 6); for (let k = 0; k < 40; k++) { c.beginPath(); c.rect(-W2 + k * (2 * W2 / 40), -4140, 70, 110); fs(c, sh, 3); }
  c.beginPath(); c.rect(-W2 + 400, -4900, 2 * W2 - 800, 600); fs(c, stone, 6); c.beginPath(); c.rect(-1400, -4800, 2800, 400); fs(c, sh, 4);
  // quadriga (four horses + chariot + figure), dark patina silhouette
  c.fillStyle = '#3e5a4e';
  for (let i = 0; i < 4; i++) { const hx = -640 + i * 330; c.beginPath(); c.ellipse(hx, -5260, 180, 110, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(hx + 120, -5320); c.lineTo(hx + 220, -5560); c.lineTo(hx + 300, -5520); c.lineTo(hx + 190, -5260); c.fill(); for (const lx of [-120, -40, 60, 140]) c.fillRect(hx + lx, -5180, 26, 300); }
  c.beginPath(); c.rect(-200, -5400, 400, 300); c.fill(); c.fillRect(-30, -6000, 60, 620); circle(c, 0, -6060, 70); c.fill(); c.beginPath(); c.moveTo(60, -5800); c.lineTo(420, -6300); c.lineTo(450, -6260); c.lineTo(100, -5760); c.fill();
  if (sun) { c.globalCompositeOperation = 'soft-light'; const g = c.createLinearGradient(-W2, 0, W2, 0); g.addColorStop(0, 'rgba(255,200,120,.6)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(-W2 - 100, -6400, 2 * W2 + 200, 6400); }
  c.restore();
}
function graffitiWall(c, x0, x1, yF, seed = 1) {
  const h = 790, top = yF - h;
  c.fillStyle = '#d9d6cc'; c.fillRect(x0, top, x1 - x0, h);
  c.save(); c.beginPath(); c.rect(x0, top, x1 - x0, h); c.clip();
  // dense layered paint: blobs, stripes, bubble shapes, faces, words
  const cols = ['#e8463a', '#f2c531', '#3a8ad8', '#4ab86a', '#e87ab8', '#ff8a2a', '#8a5ad8', '#2a2a2a', '#f4f0e8', '#3ac8c8'];
  for (let i = 0; i < (x1 - x0) / 18; i++) { const x = x0 + rnd(seed + i * 3.1) * (x1 - x0), y = top + rnd(seed + i * 5.7) * h, r = 30 + rnd(seed + i) * 110; c.fillStyle = cols[i % cols.length]; c.globalAlpha = .75; ell(c, x, y, r * 1.4, r * .7, rnd(i) * 3); c.fill(); }
  c.globalAlpha = 1;
  for (let i = 0; i < (x1 - x0) / 80; i++) { const x = x0 + rnd(seed + i * 7.3) * (x1 - x0), y = top + 80 + rnd(seed + i * 2.9) * (h - 160); c.strokeStyle = cols[(i + 3) % cols.length]; c.lineWidth = 10 + rnd(i) * 10; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) c.quadraticCurveTo(x + k * 40 + 20, y + (k % 2 ? -50 : 50), x + k * 40 + 40, y + (rnd(i + k) - .5) * 60); c.stroke(); }
  const words = ['Freiheit', 'Berlin', 'Tor auf!', 'Wahnsinn', 'Liebe', 'Frieden', 'Hallo Ost'];
  for (let i = 0; i < (x1 - x0) / 700; i++) { const x = x0 + 200 + i * 700 + rnd(seed + i) * 200, y = top + 200 + rnd(seed + i * 9) * 380, w = words[(i + seed) % words.length]; c.save(); c.translate(x, y); c.rotate((rnd(i + 4) - .5) * .25); c.font = `900 ${110 + rnd(i) * 50}px 'DejaVu Sans', sans-serif`; c.lineJoin = 'round'; c.lineWidth = 22; c.strokeStyle = '#1e1e1e'; c.strokeText(w, 0, 0); c.fillStyle = cols[(i * 3 + 1) % 6]; c.fillText(w, 0, 0); c.lineWidth = 4; c.strokeStyle = '#fff'; c.strokeText(w, 0, 0); c.restore(); }
  // faces / hearts / arrows
  for (let i = 0; i < (x1 - x0) / 900; i++) { const x = x0 + 500 + i * 900, y = top + 500; heart(c, x, y, 60); c.fillStyle = '#e8463a'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#1e1e1e'; c.stroke(); }
  for (let x = Math.floor(x0 / 264) * 264; x < x1; x += 264) { line(c, [x, top, x, yF], 4, 'rgba(40,40,40,.5)'); }
  grain(c, x0, top, x1 - x0, h, .5, 1.2); streaks(c, x0, top + 20, x1 - x0, 500, seed, { a: .12, n: 60 });
  c.restore();
  c.beginPath(); c.rect(x0, top, x1 - x0, h); fs(c, null, 3);
  // round pipe on top
  c.beginPath(); c.rect(x0 - 10, top - 80, x1 - x0 + 20, 84); c.fillStyle = '#cfcbc0'; c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x0, top - 70, x1 - x0, 16); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x0, top - 22, x1 - x0, 18);
  // chipped holes from hammers
  for (let i = 0; i < (x1 - x0) / 500; i++) { const x = x0 + rnd(seed + i * 11) * (x1 - x0), y = top + 120 + rnd(seed + i * 13) * 500; c.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28, r = 30 + rnd(i * 9 + k) * 30; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * .8); } c.closePath(); c.fillStyle = '#8a8a84'; c.fill(); c.strokeStyle = '#4a4a46'; c.lineWidth = 3; c.stroke(); for (let k = 0; k < 6; k++) line(c, [x - 20 + k * 8, y - 10, x - 16 + k * 8, y + 16], 3, '#6a6a64'); }
}
function torSet(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); const night = !!o.night;
  let g = c.createLinearGradient(0, 0, 0, H); if (night) { g.addColorStop(0, '#060a1c'); g.addColorStop(1, '#2a2440'); } else { g.addColorStop(0, '#8ab4d8'); g.addColorStop(.6, '#d8e2e0'); g.addColorStop(1, '#f2dcb8'); } c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (night) { layerZ(c, cam, .03, c => { const b = baseZ(cam, TOR_WALL, .03); for (let i = 0; i < 80; i++) { circle(c, -3000 + rnd(i) * 6000, b - 2800 + rnd(i + 40) * 1600, 2); c.fillStyle = 'rgba(250,248,225,.7)'; c.fill(); } });
    layerZ(c, cam, .25, c => { const b = baseZ(cam, TOR_WALL - 160, .25); gateFar(c, 0, b, .32, false); c.save(); c.globalCompositeOperation = 'screen'; bloom(c, 0, b - 900, 1600, '255,200,120', .55); c.restore(); for (const lx of [-1300, 1300]) { line(c, [lx, b, lx, b - 700], 10, '#2a2a2a'); circle(c, lx, b - 720, 26); fs(c, '#fff2c8', 3); bloom(c, lx, b - 720, 200, '255,220,150', .7); } });
    layerZ(c, cam, 1, c => { const [x0, x1] = visXZ(cam, 1, 400); c.fillStyle = '#2a2830'; c.fillRect(x0, TOR_WALL, x1 - x0, 2000); grain(c, x0, TOR_WALL, x1 - x0, 2000, .5, 2); graffitiWall(c, x0, x1, TOR_WALL, 3); c.fillStyle = 'rgba(10,10,30,.45)'; c.fillRect(x0, TOR_TOP - 100, x1 - x0, 2400); for (let x = Math.floor(x0 / 1600) * 1600; x < x1; x += 1600) bloom(c, x + 800, TOR_WALL - 300, 900, '255,220,160', .35); });
    return; }
  // sky: low sun left, soft clouds
  layerZ(c, cam, .03, c => { const b = baseZ(cam, TOR_WALL, .03); bloom(c, -2400, b - 1200, 1400, '255,220,160', .8); circle(c, -2400, b - 1200, 110); c.fillStyle = '#fff4d8'; c.fill(); for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(255,240,225,.55)'; const x = -3500 + i * 1000, y = b - 2400 + rnd(i) * 700; for (const [dx, dy, r] of [[0, 0, 140], [140, -50, 180], [300, 0, 130]]) { ell(c, x + dx, y + dy, r * 1.8, r * .5); c.fill(); } } });
  // far: trees of the Tiergarten (bare), lamps, the gate
  layerZ(c, cam, .25, c => {
    const b = baseZ(cam, TOR_WALL - 160, .25);
    for (let i = -20; i < 20; i++) { const x = i * 330 + rnd(i) * 100; if (Math.abs(x) < 1500) continue; c.save(); c.globalAlpha = .55; bareTree(c, x, b, { seed: i * 3.3, h: 500, trunk: 26, t, leaves: .2, bark: '#6a6258' }); c.restore(); }
    gateFar(c, 0, b, .32, true);
    for (const lx of [-1300, 1300]) { line(c, [lx, b, lx, b - 700], 10, '#3a3a3a'); circle(c, lx, b - 720, 26); fs(c, '#efe8d0', 3); }
  });
  haze(c, '255,236,210', .2);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400);
    // ground west of the wall: wet asphalt / sand strip, puddles reflecting the sun, litter, leaves
    c.fillStyle = '#7a7268'; c.fillRect(x0, TOR_WALL, x1 - x0, 2000); grain(c, x0, TOR_WALL, x1 - x0, 2000, .6, 2); mottle(c, x0, TOR_WALL, x1 - x0, 2000, 8, { r: 160, a: .1 });
    for (let i = 0; i < 6; i++) puddle(c, x0 + rnd(i + 50) * (x1 - x0), TOR_WALL + 150 + rnd(i + 51) * 700, 160, 26, i, { top: 'rgba(255,230,190,.8)', bot: 'rgba(150,170,190,.7)' });
    leaves(c, x0, x1, TOR_WALL + 20, TOR_WALL + 1200, 61, 90, { s: 1.6 });
    for (let i = 0; i < (x1 - x0) / 300; i++) cigButt(c, x0 + rnd(i + 70) * (x1 - x0), TOR_WALL + 40 + rnd(i + 71) * 900, rnd(i));
    graffitiWall(c, x0, x1, TOR_WALL, 3);
    const ao = c.createLinearGradient(0, TOR_WALL, 0, TOR_WALL + 100); ao.addColorStop(0, 'rgba(20,16,12,.5)'); ao.addColorStop(1, 'rgba(20,16,12,0)'); c.fillStyle = ao; c.fillRect(x0, TOR_WALL, x1 - x0, 100);
  });
}
const TOR_PEOPLE = [
  { hair: 'mullet', hairCol: '#5b4636', coat: '#3a6ab8', type: 'parka', pants: '#4a6890', hat: 'bobble', hatCol: '#e8463a' },
  { hair: 'perm', hairCol: '#7a5a3a', coat: '#e87ab8', type: 'jacket', pants: '#2a2a30' },
  { hair: 'short', hairCol: '#2a2422', coat: '#2a2a2a', type: 'jacket', pants: '#4a6890' },
  { hair: 'long', hairCol: '#a0703c', coat: '#f2c531', type: 'parka', pants: '#2a2a30' },
  { hair: 'side', hairCol: '#5a4a3a', coat: '#4ab86a', type: 'coat', pants: '#3a3a40', moustache: true },
  { hair: 'short', hairCol: '#3a2c24', coat: '#8a5ad8', type: 'jacket', pants: '#4a6890', hat: 'cap', hatCol: '#2a2a2a' },
  { hair: 'bun', hairCol: '#b9b2a6', coat: '#7a6a50', type: 'coat', pants: '#3a3a40' },
  { hair: 'mullet', hairCol: '#7a5a3a', coat: '#e8463a', type: 'jacket', pants: '#2a2a30' },
];
function flag(c, x, y, t, s = 1) {
  // black-red-gold flag on a pole (no emblem), waving
  line(c, [x, y, x, y - 520], 8, '#5a4a3a');
  const w = 260, h = 170;
  for (let b = 0; b < 3; b++) { c.beginPath(); for (let i = 0; i <= 12; i++) { const k = i / 12, wv = Math.sin(t * 6 + k * 5) * 16 * k; c.lineTo(x + s * k * w, y - 520 + b * h / 3 + wv); } for (let i = 12; i >= 0; i--) { const k = i / 12, wv = Math.sin(t * 6 + k * 5) * 16 * k; c.lineTo(x + s * k * w, y - 520 + (b + 1) * h / 3 + wv); } c.closePath(); c.fillStyle = ['#1e1e1e', '#d8262a', '#f2c531'][b]; c.fill(); }
  c.beginPath(); for (let i = 0; i <= 12; i++) { const k = i / 12; c.lineTo(x + s * k * w, y - 520 + Math.sin(t * 6 + k * 5) * 16 * k); } for (let i = 12; i >= 0; i--) { const k = i / 12; c.lineTo(x + s * k * w, y - 350 + Math.sin(t * 6 + k * 5) * 16 * k); } c.closePath(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
}
function torCrowd(c, t, o = {}) {
  // people on the wall top: jumping, waving, a flag, someone with hammer and chisel; a few below cheering (back view not needed)
  const xs = o.xs || [-1500, -1150, -820, -480, 420, 760, 1100, 1450, 1800];
  xs.forEach((x, i) => {
    const P = TOR_PEOPLE[i % TOR_PEOPLE.length], jump = Math.max(0, Math.sin(t * 7 + i * 1.3)) * (i % 3 === 0 ? 40 : 14), wave = Math.sin(t * 9 + i) * .25;
    drawFolk(c, Object.assign({ x, y: TOR_TOP - jump, k: .25, h: .95 + (i % 3) * .04, arms: { l: { a: 2.5 + wave, b: -.2 }, r: { a: i % 2 ? .4 : 2.4 - wave, b: i % 2 ? -1.6 : -.2 } }, expr: { mouth: i % 2 ? 'shout' : 'smile', open: .7, eyes: i % 4 === 1 ? 'closed' : 'open' } }, P));
  });
  flag(c, xs[2] + 60, TOR_TOP - 280, t, 1);
  // hammer & chisel man kneeling at the wall foot (side view)
  if (o.hammer !== false) { const hx = o.hammerX ?? 1250, hit = Math.max(0, Math.sin(t * 8)); drawFolkSide(c, { x: hx, y: TOR_WALL + 30, s: -1, hair: 'short', hairCol: '#4a3a30', coat: '#6a5a3a', type: 'parka', pants: '#4a6890', nearA: 1.6 + hit * .6, nearBend: -1.2, hold: cc => { line(cc, [0, 0, 0, -200], 14, '#6a4a2a'); cc.beginPath(); cc.rect(-50, -250, 100, 60); fs(cc, '#4a4a4a', 5); }, expr: { mouth: 'flat', browUp: .3 } }); if (hit > .95) { for (let k = 0; k < 6; k++) { c.fillStyle = '#c8c4b8'; c.fillRect(hx - 240 + rnd(k + Math.floor(t * 8)) * 60, TOR_WALL - 380 - rnd(k + 3) * 60, 10, 10); } bloom(c, hx - 220, TOR_WALL - 360, 60, '255,240,200', .6); } }
}
function torLight(c, cam, t, o = {}) {
  if (o.night) { grade(c, { sx: .5, sy: .2, warm: '255,200,130', warmA: .3, cool: '10,10,50', coolA: .4 }); return; }
  layerZ(c, cam, 1, c => { sunRays(c, cam.x - 2200, cam.y - 1400, { n: 9, len: 5200, spread: .5, dir: .5, color: '255,226,170', alpha: .22, t }); motes(c, cam.x - 1500, cam.x + 1500, cam.y - 800, cam.y + 600, t, { n: 40, color: '255,240,210', alpha: .6 }); });
  grade(c, { sx: 0, sy: .1, warm: '255,190,110', warmA: .38, cool: '40,40,90', coolA: .14 });
}
