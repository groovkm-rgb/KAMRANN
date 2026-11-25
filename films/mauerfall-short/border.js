// BORNHOLMER border crossing, night (generic): red-white barrier, sodium floodlights, watchtower,
// steel truss bridge, guard hut, a crowd whose breath steams. 1 m ≈ 220 units, ground y = 0.
//   borderNight(c, cam, t, o)   o.crowd (0..1 density), o.bridge (true = bridge deck view)
//   barrier(c, x, ang)          pivot post at x, arm length BAR.L to the right, ang 0 = closed, -PI/2 = open
//   crowdRow(c, t, y, s, x0, x1, seed, o)   rows of people at depth s (o.cheer, o.steam, o.faceAway)
//   borderLight(c, cam, t, o)   screen grade + floodlight glows + steam + snow-ish haze
const BN = { sky: ['#070c26', '#1f2a5c'], sodium: '255,176,70', sodiumHex: '#ffb046', ground: '#3a3a44', wet: '#4a4a58', concrete: '#8e8a84', HZ: -330 };
const BAR = { L: 1300, H: -205, Y: 70 };
const bDepth = (s) => BN.HZ + (0 - BN.HZ) * s;

function barrier(c, x, ang, o = {}) {
  // post + counterweight + striped arm (rotates about the pivot)
  const py = BAR.H + BAR.Y; c.save(); c.translate(0, 0);
  c.beginPath(); c.rect(x - 34, py - 30, 68, BAR.Y - py + 30); fs(c, '#d8d4cc', 5);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(x - 34, py + 10 + i * 64, 68, 30); fs(c, '#c8302a', 0); }
  c.beginPath(); c.rect(x - 34, py - 30, 68, BAR.Y - py + 30); fs(c, null, 5);
  c.beginPath(); c.rect(x - 70, BAR.Y - 20, 140, 40); fs(c, '#6a6a6e', 5);
  c.save(); c.translate(x, py); c.rotate(ang);
  // counterweight
  c.beginPath(); c.rect(-200, -40, 150, 80); fs(c, '#5a5a5e', 5); line(c, [-190, -30, -60, -30], 4, '#7a7a80');
  // arm with red/white blocks and a hanging lattice skirt
  const L = BAR.L;
  c.beginPath(); c.roundRect(-60, -24, L + 60, 48, 20); fs(c, '#f4f1ea', 6);
  c.save(); c.beginPath(); c.roundRect(-60, -24, L + 60, 48, 20); c.clip(); for (let i = 0; i < 12; i += 2) { c.fillStyle = '#d0322a'; c.fillRect(i * L / 11, -30, L / 11, 60); } c.restore();
  c.beginPath(); c.roundRect(-60, -24, L + 60, 48, 20); fs(c, null, 6);
  // red lamp at the tip
  circle(c, L - 10, -34, 14); fs(c, '#ff4a3a', 4);
  if (o.skirt === true) { c.globalAlpha = .9; for (let i = 1; i < 14; i++) line(c, [i * L / 14, 24, i * L / 14 + 20, 120], 5, '#6a6a70'); line(c, [40, 120, L - 40, 120], 6, '#6a6a70'); c.globalAlpha = 1; }
  c.restore();
  circle(c, x, py, 26); fs(c, '#3a3a40', 5); circle(c, x, py, 8); fs(c, '#9a9aa0', 3);
  bloom(c, x + Math.cos(ang) * (BAR.L - 10) - Math.sin(ang) * -34, py + Math.sin(ang) * (BAR.L - 10) + Math.cos(ang) * -34, 90, '255,70,50', .6);
  c.restore();
}
function floodMast(c, x, y, s, h = 1700) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, [0, 0, 0, -h], 22, OUT); line(c, [0, 0, 0, -h], 14, '#55555e');
  line(c, [-110, -h, 110, -h], 14, OUT); line(c, [-110, -h, 110, -h], 8, '#5a5a62');
  for (const lx of [-90, -30, 30, 90]) { c.beginPath(); c.rect(lx - 26, -h + 10, 52, 46); fs(c, '#3a3a40', 5); ell(c, lx, -h + 50, 22, 9); fs(c, '#fff2c0', 3); }
  c.restore();
  for (const lx of [-90, -30, 30, 90]) bloom(c, x + lx * s, y + (-h + 50) * s, 260 * s, BN.sodium, .7);
  // light cone
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, y - h * s, 0, y);
  g.addColorStop(0, `rgba(${BN.sodium},.28)`); g.addColorStop(1, `rgba(${BN.sodium},0)`);
  c.fillStyle = g; c.beginPath(); c.moveTo(x - 110 * s, y - h * s + 56 * s); c.lineTo(x + 110 * s, y - h * s + 56 * s); c.lineTo(x + 700 * s, y); c.lineTo(x - 700 * s, y); c.closePath(); c.fill(); c.restore();
}
function watchtower(c, x, y, s, lit = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-70, 0); c.lineTo(-56, -1500); c.lineTo(56, -1500); c.lineTo(70, 0); c.closePath(); fs(c, '#a29e96', 5);
  for (let i = 1; i < 8; i++) line(c, [-66 + i * .9, -i * 190, 66 - i * .9, -i * 190], 3, '#86827a');
  c.beginPath(); c.moveTo(-180, -1500); c.lineTo(180, -1500); c.lineTo(160, -1760); c.lineTo(-160, -1760); c.closePath(); fs(c, '#b0aca4', 5);
  for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(-150 + i * 76, -1740, 60, 170); fs(c, lit ? '#ffcf7a' : '#2a3048', 4); }
  c.beginPath(); c.rect(-200, -1800, 400, 50); fs(c, '#7a766e', 5);
  // searchlight on the roof
  c.beginPath(); c.rect(60, -1870, 70, 60); fs(c, '#4a4a50', 4); circle(c, 130, -1840, 24); fs(c, '#fff8d8', 3);
  c.restore();
  bloom(c, x, y - 1650 * s, 320 * s, '255,200,120', .35 * lit);
}
function trussBridge(c, x0, x1, y, s) {
  // steel truss arch bridge seen from the side, deck at y
  c.save(); c.lineCap = 'round';
  const top = y - 900 * s, n = 18, w = (x1 - x0) / n;
  const archY = i => top + Math.pow((i / n) * 2 - 1, 2) * 520 * s;
  c.beginPath(); for (let i = 0; i <= n; i++) c.lineTo(x0 + i * w, archY(i)); c.lineWidth = 34 * s; c.strokeStyle = '#2b3048'; c.stroke(); c.lineWidth = 20 * s; c.strokeStyle = '#4a5478'; c.stroke();
  for (let i = 0; i <= n; i++) { line(c, [x0 + i * w, archY(i), x0 + i * w, y], 8 * s, '#323a58'); if (i < n) line(c, [x0 + i * w, archY(i), x0 + (i + 1) * w, y], 5 * s, '#2e3550'); }
  c.beginPath(); c.rect(x0 - 40 * s, y - 30 * s, x1 - x0 + 80 * s, 70 * s); fs(c, '#30364e', 4 * s);
  for (let i = 0; i <= n; i += 3) { const lx = x0 + i * w; line(c, [lx, y - 30 * s, lx, y - 260 * s], 8 * s, '#4a4a55'); circle(c, lx, y - 268 * s, 16 * s); fs(c, BN.sodiumHex); bloom(c, lx, y - 268 * s, 120 * s, BN.sodium, .55); }
  c.restore();
}
function guardHut(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.rect(-260, -560, 520, 560); fs(c, '#c8c2b4', 6);
  c.beginPath(); c.moveTo(-300, -560); c.lineTo(300, -560); c.lineTo(280, -620); c.lineTo(-280, -620); c.closePath(); fs(c, '#5a5a5e', 5);
  c.beginPath(); c.rect(-200, -470, 260, 200); fs(c, '#ffd88a', 5); line(c, [-70, -470, -70, -270], 5, '#8a8270');
  c.beginPath(); c.rect(110, -420, 110, 420); fs(c, '#6a6458', 5);
  c.restore();
  bloom(c, x - 70 * s, y - 370 * s, 280 * s, '255,210,130', .55);
}
// one crowd person seen at depth scale s (uses the toon rig); breath steam above the mouth
function crowdRow(c, t, y, s, x0, x1, seed, o = {}) {
  const n = Math.max(2, Math.round((x1 - x0) / (190 * s)));
  for (let i = 0; i < n; i++) {
    const r = rnd(seed + i * 3.1), x = x0 + (i + .5) * (x1 - x0) / n + (r - .5) * 80 * s, who = CROWD[Math.floor(rnd(seed + i) * 8)];
    const cheer = o.cheer ? (rnd(seed + i * 5) < o.cheer) : false, ph = t * 7 + i * 1.9;
    const rr = rnd(seed + i * 7), up = cheer ? { from: 'chest', to: 'up', k: .65 + .35 * Math.abs(Math.sin(ph)) } : (rr > .82 ? 'chest' : rr > .7 ? 'hip' : 'down');
    const p = P(who, x, { y: y + Math.sin(t * 2 + i) * 2, sc: PSC * s, s: o.faceAway ? 1 : (rnd(seed + i * 11) > .5 ? 1 : -1), look: [0, -.1],
      mouth: cheer ? (Math.sin(ph) > 0 ? 'laugh' : 'o') : (o.mouth || 'flat'), up: cheer ? .6 : .1, main: up, off: cheer ? { from: 'chest', to: 'up', k: .8 } : (rr > .5 ? 'down' : 'hip'),
      bob: cheer ? -Math.abs(Math.sin(ph)) * 10 : 0 });
    person(c, t, p);
    if (o.steam !== false) { const hx = x + 30 * s, hy = y - 560 * PSC * s; steamPuff(c, hx, hy, t + rnd(seed + i) * 3, s); }
  }
}
function steamPuff(c, x, y, t, s) {
  const ph = (t * .9) % 1; if (ph > .7) return;
  c.save(); c.globalAlpha = .22 * Math.sin(ph / .7 * Math.PI);
  for (let k = 0; k < 3; k++) { circle(c, x + (ph * 60 + k * 14) * s, y - (ph * 70 + k * 10) * s, (12 + ph * 30 + k * 6) * s); c.fillStyle = '#e8eef8'; c.fill(); }
  c.restore();
}
function borderNight(c, cam, t, o = {}) {
  // sky
  layer(c, cam, .1, c => {
    const g = c.createLinearGradient(0, -3200, 0, -200); g.addColorStop(0, BN.sky[0]); g.addColorStop(1, BN.sky[1]);
    c.fillStyle = g; c.fillRect(-6000, -6000, 12000, 6000); c.fillStyle = '#2a2a3a'; c.fillRect(-6000, -200, 12000, 4000);
    for (let i = 0; i < 70; i++) { circle(c, -3000 + rnd(i) * 6000, -3600 + rnd(i + 50) * 2600, 2 + rnd(i + 90) * 3); c.fillStyle = `rgba(255,255,240,${.3 + .5 * rnd(i + 7)})`; c.fill(); }
    // sodium sky glow (city light pollution)
    const h = c.createLinearGradient(0, -1600, 0, -200); h.addColorStop(0, 'rgba(255,150,70,0)'); h.addColorStop(1, 'rgba(255,150,70,.22)'); c.fillStyle = h; c.fillRect(-6000, -1600, 12000, 1400);
  });
  // far city silhouette (West: neon specks; East: dim blocks)
  layer(c, cam, .25, c => {
    const B = -260;
    for (let i = 0; i < 40; i++) { const x = -4000 + i * 200, h = 300 + rnd(i + 11) * 700; c.fillStyle = '#161c3a'; c.fillRect(x, B - h, 190, h);
      for (let k = 0; k < 8; k++) if (rnd(i * 13 + k) > .55) { c.fillStyle = rnd(i + k) > .5 ? '#ffcf7a' : '#7ad0ff'; c.fillRect(x + 20 + (k % 3) * 55, B - h + 40 + Math.floor(k / 3) * 90, 26, 34); } }
    c.fillStyle = '#20223a'; c.fillRect(-6000, B, 12000, 3000);
  });
  haze(c, '120,110,160', .10);
  // bridge + tower + masts
  layer(c, cam, .45, c => {
    const B = -240;
    trussBridge(c, 600, 4400, B, .9);
    watchtower(c, o.towerX ?? -700, B + 320, .5);
    for (const mx of (o.masts || [-1400, 150, 1000])) floodMast(c, mx, B, .8, 640);
    // hinterland wall (concrete segments with round top)
    for (let i = 0; i < 50; i++) { const x = -4200 + i * 170; if (x > -360 && x < 520) continue; c.beginPath(); c.rect(x, B - 380, 162, 380); fs(c, '#9a968e', 3); c.beginPath(); c.roundRect(x - 6, B - 420, 174, 50, 25); fs(c, '#b0aca4', 3);
      if (rnd(i + 3) > .6) { c.fillStyle = 'rgba(60,55,50,.25)'; c.fillRect(x + 20, B - 300 + rnd(i) * 200, 60, 40); } }
    // the gate gap: lit road onto the bridge with lamps receding
    for (let k = 0; k < 6; k++) { const yy = B - 30 - k * 40, xx = 80 + k * 26; line(c, [xx - 160 + k * 10, yy, xx - 150 + k * 10, yy - 160 + k * 18], 5, '#4a4a55'); circle(c, xx - 150 + k * 10, yy - 166 + k * 18, 10 - k); fs(c, BN.sodiumHex); bloom(c, xx - 150 + k * 10, yy - 166 + k * 18, 70 - k * 8, BN.sodium, .6); }
    // fence
    for (let i = 0; i < 40; i++) line(c, [-4200 + i * 110, B, -4200 + i * 110, B - 240], 4, '#5a5a66'); line(c, [-4200, B - 240, 300, B - 240], 4, '#5a5a66'); line(c, [-4200, B - 120, 300, B - 120], 3, '#5a5a66');
    c.fillStyle = BN.ground; c.fillRect(-6000, B, 12000, 3000);
  });
  haze(c, '255,180,110', .08);
  // ground: asphalt + cobbles + rails, wet reflections of the lamps
  layer(c, cam, 1, c => {
    const g = c.createLinearGradient(0, BN.HZ, 0, 700); g.addColorStop(0, '#3c3a44'); g.addColorStop(1, '#2c2a32');
    c.fillStyle = g; c.fillRect(-6000, bDepth(.25), 12000, 5000);
    for (let r = 0; r < 26; r++) { const s = .3 + r * .04, y = bDepth(s); for (let i = 0; i < 26; i++) { const x = -2600 + i * 200 + (r % 2) * 100; c.beginPath(); c.roundRect(x * s * 1.2, y, 170 * s, 28 * s, 8 * s); c.fillStyle = rnd(r * 31 + i) > .5 ? '#46444e' : '#3e3c46'; c.fill(); } }
    for (const lx of (o.masts || [-1400, 150, 1000])) { c.save(); c.globalCompositeOperation = 'screen'; const rg = c.createLinearGradient(0, bDepth(.5), 0, 600); rg.addColorStop(0, `rgba(${BN.sodium},.3)`); rg.addColorStop(1, `rgba(${BN.sodium},0)`); c.fillStyle = rg; c.fillRect(lx * .7 - 60, bDepth(.5), 120, 900); c.restore(); }
    // tram rails / painted stop line
    line(c, [-3000, bDepth(.62), 3000, bDepth(.62)], 10, '#e8e2c8');
    if (o.hut !== false) guardHut(c, o.hutX ?? -900, bDepth(.55), .55, t);
    // crowd mass behind the barrier
    const d = o.crowd ?? 1;
    if (d > 0) {
      crowdRow(c, t, bDepth(.38), .38, -1600, 1800, 11, { cheer: .5 * d, steam: true });
      crowdRow(c, t, bDepth(.46), .46, -1400, 1600, 23, { cheer: .5 * d });
      crowdRow(c, t, bDepth(.56), .56, -1100, 1400, 37, { cheer: (o.cheer ?? .4) * d });
    }
  });
  return { base: '#20223a' };
}
function borderLight(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  grade(c, { sx: .3, sy: .2, warm: '255,170,80', warmA: .2, cool: '10,20,80', coolA: .35 });
  c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  motes(c, cam.x - 700, cam.x + 700, -1400, 200, t, { n: 60, alpha: .55, speed: .05, color: '255,220,170' });
  c.restore();
}
