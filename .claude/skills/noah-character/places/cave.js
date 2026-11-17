// CAVE INTERIOR (needs light.js, forest.js, stone-age.js). Looking into the cave, the mouth opens to a bright forest.
//   caveInterior(c, cam, t, { mouthX: 700, tod: 'day' | 'dawn' | 'night' })   floor at y = 0, Noah k ≈ .25
//   props: furBed(c, x, w) embers(c, x, t, lit) stoneTools(c, x) caveLight(c, cam, t, o) (put in `screen`)
const CAVE = { rock: '#8a7a70', rock2: '#74655d', rock3: '#a08e80', floor: '#7a6450', floor2: '#6a5444', ochre: '#b5552e', ochre2: '#7a3a22', HZ: -230 };
function caveRockWall(c, x0, x1, top, base, seed, cols) {
  c.fillStyle = cols[0]; c.fillRect(x0, top, x1 - x0, base - top);
  for (let i = 0; i < 900; i++) { const x = x0 + rnd(seed + i) * (x1 - x0), y = top + rnd(seed + i + 900) * (base - top), w = 70 + rnd(seed + i + 1800) * 170, h = 40 + rnd(seed + i + 2700) * 90;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * .6, y - h * .3); c.lineTo(x + w, y + h * .2); c.lineTo(x + w * .7, y + h * .8); c.lineTo(x + w * .1, y + h * .7); c.closePath(); c.fillStyle = cols[1 + (i % 2)]; c.fill(); c.lineWidth = 3; c.strokeStyle = shade(cols[0], -.45); c.stroke(); c.beginPath(); c.moveTo(x + w * .1, y + h * .1); c.lineTo(x + w * .55, y - h * .2); c.lineWidth = 3; c.strokeStyle = shade(cols[2], .2); c.stroke(); }
}
function cavePaintings(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = .85; c.fillStyle = CAVE.ochre; c.strokeStyle = CAVE.ochre2; c.lineWidth = 6; c.lineCap = 'round';
  // mammoth
  c.beginPath(); c.ellipse(0, 0, 90, 55, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(80, -20, 34, 0, Math.PI * 2); c.fill(); for (const lx of [-55, -20, 25, 55]) c.fillRect(lx - 9, 30, 18, 50); c.beginPath(); c.moveTo(108, -10); c.quadraticCurveTo(130, 40, 115, 75); c.lineWidth = 12; c.strokeStyle = CAVE.ochre; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#efe3c8'; c.beginPath(); c.moveTo(100, 5); c.quadraticCurveTo(140, 20, 150, -10); c.stroke();
  // hunters with spears
  c.strokeStyle = CAVE.ochre2; c.lineWidth = 7;
  for (const hx of [-210, -160]) { c.beginPath(); c.arc(hx, -40, 12, 0, Math.PI * 2); c.fillStyle = CAVE.ochre2; c.fill(); c.beginPath(); c.moveTo(hx, -28); c.lineTo(hx, 20); c.moveTo(hx, 20); c.lineTo(hx - 16, 60); c.moveTo(hx, 20); c.lineTo(hx + 16, 60); c.moveTo(hx, -12); c.lineTo(hx + 30, -24); c.moveTo(hx - 10, 0); c.lineTo(hx + 90, -50); c.stroke(); }
  // deer
  c.fillStyle = CAVE.ochre; c.beginPath(); c.ellipse(260, -10, 55, 26, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(300, -20); c.lineTo(330, -70); c.lineWidth = 10; c.strokeStyle = CAVE.ochre; c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(330, -70); c.lineTo(320, -110); c.moveTo(330, -70); c.lineTo(355, -105); c.moveTo(322, -95); c.lineTo(305, -110); c.stroke(); for (const lx of [225, 245, 280, 300]) { c.beginPath(); c.moveTo(lx, 10); c.lineTo(lx, 50); c.stroke(); }
  // hand prints
  for (const [hx, hy, col] of [[-320, -60, CAVE.ochre], [-290, 40, '#e8d8b8'], [400, -80, CAVE.ochre2]]) { c.fillStyle = col; c.beginPath(); c.ellipse(hx, hy, 20, 24, 0, 0, Math.PI * 2); c.fill(); for (let f = 0; f < 5; f++) { const a = -2.6 + f * .45; c.beginPath(); c.ellipse(hx + Math.cos(a) * 32, hy + Math.sin(a) * 34, 6, 15, a + 1.57, 0, Math.PI * 2); c.fill(); } }
  c.restore();
}
function furBed(c, x, w = 520) {
  // straw under a spotted fur, rolled fur as a pillow on the left
  for (let i = 0; i < 40; i++) { const sx = x - w / 2 - 20 + rnd(i + 3) * (w + 40); line(c, [sx, 0, sx + (rnd(i + 9) - .5) * 60, -20 - rnd(i + 11) * 25], 4, i % 2 ? '#d9b45a' : '#b8913e'); }
  c.beginPath(); c.moveTo(x - w / 2, -10); c.quadraticCurveTo(x - w / 2 - 10, -70, x - w / 2 + 40, -80); c.lineTo(x + w / 2 - 30, -78); c.quadraticCurveTo(x + w / 2 + 10, -60, x + w / 2, -8); c.closePath(); fs(c, NOAH_FUR.fur, 4);
  c.save(); c.clip(); for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(x - w / 2 + 30 + rnd(i + 30) * w, -60 + rnd(i + 40) * 50, 16, 10, i, 0, Math.PI * 2); c.fillStyle = NOAH_FUR.furDark; c.fill(); } c.restore();
  rrect(c, x - w / 2 - 30, -120, 150, 70, 35); fs(c, NOAH_FUR.furLight, 4); for (let k = 0; k < 4; k++) line(c, [x - w / 2 - 10 + k * 30, -112, x - w / 2 + k * 30, -58], 3, NOAH_FUR.furDark);
}
function embers(c, x, t, lit = .3) {
  for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; rock(c, x + Math.cos(a) * 80, 6, 18, i * 3, '#6d6a72'); }
  for (const r of [-.5, .5, .1]) { c.save(); c.translate(x, -14); c.rotate(r); rrect(c, -70, -10, 140, 20, 10); fs(c, '#3a2a22', 3); c.fillStyle = `rgba(255,120,40,${.6 * lit + .3 * Math.sin(t * 5 + r * 9) * lit})`; c.fillRect(-30, -4, 60, 8); c.restore(); }
  bloom(c, x, -20, 120, '255,120,50', .5 * lit);
  for (let i = 0; i < 3; i++) { const ph = (t * .25 + i / 3) % 1; c.beginPath(); c.moveTo(x + Math.sin(ph * 7 + i) * 20, -30 - ph * 300); c.quadraticCurveTo(x + 30 * Math.sin(ph * 5 + i), -60 - ph * 300, x + Math.sin(ph * 9 + i) * 25, -90 - ph * 300); c.lineWidth = 14 * (1 - ph) + 4; c.strokeStyle = `rgba(200,200,210,${.35 * Math.sin(ph * Math.PI)})`; c.lineCap = 'round'; c.stroke(); }
}
function stoneTools(c, x) {
  c.beginPath(); c.moveTo(x - 40, 0); c.lineTo(x - 10, -50); c.lineTo(x + 20, -8); c.closePath(); fs(c, '#8d8a94', 3); line(c, [x - 20, -30, x, -20], 2, '#bbb');
  c.save(); c.translate(x + 90, -14); c.rotate(-.2); line(c, [-60, 0, 60, 0], 12); line(c, [-60, 0, 60, 0], 7, '#9a6a3c'); c.beginPath(); c.moveTo(50, -24); c.lineTo(100, 0); c.lineTo(50, 24); c.closePath(); fs(c, '#8d8a94', 3); c.restore();
  ell(c, x + 210, -16, 34, 16); fs(c, '#7a5a3a', 3); ell(c, x + 210, -24, 26, 7); c.fillStyle = '#4a3020'; c.fill();
}
function caveInterior(c, cam, t, o = {}) {
  const HZ = CAVE.HZ, B = p => layerBase(cam, HZ, p), mx = o.mouthX ?? 700, dawn = o.tod === 'dawn', night = o.tod === 'night';
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = CAVE.rock2; c.fillRect(0, 0, W, H);
  // the outside world seen through the mouth (bright)
  layer(c, cam, .4, c => {
    const b = B(.4), ox = mx * .55;
    const g = c.createLinearGradient(0, b - 900, 0, b); g.addColorStop(0, night ? '#0c1630' : dawn ? '#f3b88a' : '#9fd3ee'); g.addColorStop(1, night ? '#24375e' : dawn ? '#ffe2b0' : '#e2f2ea'); c.fillStyle = g; c.fillRect(ox - 400, b - 1400, 1400, 1400);
    if (night) { for (let i = 0; i < 60; i++) { circle(c, ox - 380 + rnd(i + 990) * 1360, b - 1380 + rnd(i + 995) * 1100, 1.5 + rnd(i + 999) * 2.5); c.fillStyle = `rgba(250,248,225,${.5 + .5 * Math.sin(t * 2 + i)})`; c.fill(); } bloom(c, ox + 350, b - 700, 260, '200,215,255', .35); }
    else bloom(c, ox + 200, b - 500, 700, dawn ? '255,210,150' : '255,250,220', .9);
    for (let i = 0; i < 9; i++) { const x = ox - 300 + i * 150, h = 300 + rnd(i + 70) * 260; c.fillStyle = night ? '#132235' : dawn ? '#c9a08a' : '#a8cfa0'; c.fillRect(x - 10, b - h, 20, h); c.beginPath(); c.arc(x, b - h, 80, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = night ? '#1a2a30' : dawn ? '#d9b07a' : '#9cc870'; c.fillRect(ox - 400, b - 40, 1400, 200);
  });
  // cave walls framing the mouth (light ink, rock facets), back wall with paintings
  layer(c, cam, .8, c => {
    const b = B(.8), ox = mx * .85;
    c.save(); c.beginPath(); c.rect(-5000, b - 3000, 10000, 3000);
    c.moveTo(ox - 240, b + 10); c.bezierCurveTo(ox - 260, b - 520, ox - 40, b - 760, ox + 220, b - 740); c.bezierCurveTo(ox + 520, b - 700, ox + 640, b - 420, ox + 600, b + 10); c.closePath();
    c.clip('evenodd'); caveRockWall(c, -3000, 3000, b - 3000, b + 20, 7, [CAVE.rock, CAVE.rock2, CAVE.rock3]);
    // darker toward the far left (away from the light)
    const dg = c.createLinearGradient(ox - 2400, 0, ox, 0); dg.addColorStop(0, 'rgba(15,10,20,.38)'); dg.addColorStop(1, 'rgba(15,10,20,0)'); c.fillStyle = dg; c.fillRect(-5000, b - 3000, 10000, 3100);
    c.restore();
    c.beginPath(); c.moveTo(ox - 240, b + 10); c.bezierCurveTo(ox - 260, b - 520, ox - 40, b - 760, ox + 220, b - 740); c.bezierCurveTo(ox + 520, b - 700, ox + 640, b - 420, ox + 600, b + 10); c.lineWidth = 5; c.strokeStyle = shade(CAVE.rock, -.4); c.stroke();
    cavePaintings(c, ox - 820, b - 430, .9);
    // wall torch with flame + glow
    const tx = ox - 330, ty = b - 250; line(c, [tx, ty + 120, tx + 10, ty], 16); line(c, [tx, ty + 120, tx + 10, ty], 9, '#6a4a2a'); ell(c, tx + 10, ty, 22, 14); fs(c, '#4a3020', 3);
    const fl = 1 + Math.sin(t * 13) * .1; c.beginPath(); c.moveTo(tx - 12, ty - 4); c.quadraticCurveTo(tx - 20, ty - 50 * fl, tx + 10, ty - 90 * fl); c.quadraticCurveTo(tx + 34, ty - 46 * fl, tx + 32, ty - 4); c.closePath(); fs(c, '#f59a2e', 3); c.beginPath(); c.moveTo(tx, ty - 6); c.quadraticCurveTo(tx, ty - 34 * fl, tx + 12, ty - 56 * fl); c.quadraticCurveTo(tx + 24, ty - 30 * fl, tx + 22, ty - 6); c.closePath(); c.fillStyle = '#ffe17a'; c.fill();
    bloom(c, tx + 10, ty - 40, 420, '255,160,70', .55);
    // drying hide on a stick frame
    const hx = ox - 1500; line(c, [hx - 120, b, hx - 100, b - 420], 10, '#6a4a2a'); line(c, [hx + 120, b, hx + 100, b - 420], 10, '#6a4a2a'); line(c, [hx - 130, b - 400, hx + 130, b - 400], 10, '#6a4a2a');
    c.beginPath(); c.moveTo(hx - 95, b - 395); c.lineTo(hx + 95, b - 395); c.quadraticCurveTo(hx + 110, b - 250, hx + 80, b - 120); c.lineTo(hx - 80, b - 120); c.quadraticCurveTo(hx - 110, b - 250, hx - 95, b - 395); c.closePath(); fs(c, NOAH_FUR.furLight, 3);
    // boulders along the wall base (hides the wall/floor seam)
    for (let i = 0; i < 26; i++) { const x = -2600 + i * 200 + rnd(i + 80) * 80; if (x > ox - 230 && x < ox + 600) continue; rock(c, x, b + 24, 40 + rnd(i + 85) * 50, i * 7, i % 2 ? CAVE.rock3 : CAVE.rock); }
    // stalactites
    for (let i = 0; i < 16; i++) { const x = -2000 + i * 230 + rnd(i + 40) * 80, L = 90 + rnd(i + 50) * 200, top = b - 1100; if (x > ox - 260 && x < ox + 620) continue; c.beginPath(); c.moveTo(x - 30, top); c.lineTo(x, top + L + 300); c.lineTo(x + 30, top); c.closePath(); fs(c, CAVE.rock3, 2); }
    for (let i = 0; i < 6; i++) { const vx = ox - 60 + i * 70; c.beginPath(); c.moveTo(vx, b - 730 + Math.abs(i - 2.5) * 10); c.quadraticCurveTo(vx + 14, b - 640, vx - 6, b - 560 - rnd(i + 60) * 90); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#4f8f45'; c.stroke(); }
  });
  layer(c, cam, 1, c => {
    const g = c.createLinearGradient(0, HZ, 0, HZ + 900); g.addColorStop(0, CAVE.floor2); g.addColorStop(1, shade(CAVE.floor2, -.3)); c.fillStyle = g; c.fillRect(-6000, HZ, 12000, 3000);
    for (let i = 0; i < 40; i++) { const k = rnd(i + 360); ell(c, -2600 + rnd(i + 365) * 5200, HZ + 30 + k * 700, 60 + k * 160, 10 + k * 22); c.fillStyle = shade(CAVE.floor2, rnd(i + 370) > .5 ? .08 : -.1); c.fill(); }
    for (let i = 0; i < 220; i++) { const k = rnd(i + 300); ell(c, -2600 + rnd(i + 310) * 5200, HZ + 20 + k * 800, 5 + k * 13, 3 + k * 7); c.fillStyle = shade(CAVE.floor, rnd(i + 320) > .5 ? .14 : -.2); c.fill(); }
    for (let i = 0; i < 14; i++) { const x = -2400 + rnd(i + 380) * 4800, y = HZ + 40 + rnd(i + 385) * 500; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y + 12); c.lineTo(x + 70, y + 4); c.lineTo(x + 110, y + 18); c.lineWidth = 3; c.strokeStyle = shade(CAVE.floor2, -.35); c.stroke(); }
    for (let i = 0; i < 30; i++) { const x = -1200 + rnd(i + 390) * 2000, y = HZ + 60 + rnd(i + 395) * 500; line(c, [x, y, x + (rnd(i + 397) - .5) * 70, y - 6], 3, i % 2 ? '#c9a24a' : '#a8843a'); }
    for (let i = 0; i < 6; i++) rock(c, -2000 + i * 700 + rnd(i + 330) * 200, HZ + 120 + rnd(i + 340) * 300, 26 + rnd(i + 350) * 20, i * 5, '#7d7470');
    // light patch on the floor from the mouth
    c.save(); c.globalCompositeOperation = 'screen'; const lg = c.createRadialGradient(mx * .95, HZ + 160, 20, mx * .95, HZ + 160, 900); lg.addColorStop(0, night ? 'rgba(120,150,220,.12)' : dawn ? 'rgba(255,200,140,.5)' : 'rgba(255,245,210,.5)'); lg.addColorStop(1, 'rgba(255,245,210,0)'); c.globalAlpha = .7; c.fillStyle = lg; c.beginPath(); c.ellipse(mx * .95, HZ + 160, 900, 260, 0, 0, Math.PI * 2); c.fill(); c.restore();
  });
  return { base: CAVE.floor2, tint: null };
}
function caveLight(c, cam, t, o = {}) {
  const mx = o.mouthX ?? 700, dawn = o.tod === 'dawn', col = dawn ? '255,205,150' : '255,245,215';
  layer(c, cam, 1, c => {
    sunRays(c, mx + 500, CAVE.HZ - 650, { n: 9, len: 2600, spread: .35, dir: Math.PI - .55, color: col, alpha: (o.rays ?? .08), t });
    motes(c, mx - 1300, mx + 300, CAVE.HZ - 700, 150, t, { n: 45, color: col });
  });
  grade(c, { sx: .95, sy: .3, warm: dawn ? '255,170,100' : '255,225,170', warmA: .3, cool: '25,15,45', coolA: .26 });
}
