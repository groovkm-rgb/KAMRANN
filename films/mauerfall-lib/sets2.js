// MAUERFALL – more places. Needs light.js, tex.js, folk.js, noah89.js, vehicles.js, ost.js, flat.js (wallpaper/parquet), presse.js, bridge.js.
// Every set: fn(c, cam, t, o) draws background layers (zoom-lens), returns nothing; people/props are drawn by the shot in world space.
// ---------------- small shared bits ----------------
function skyFill(c, top, bot) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function candle(c) { // held candle (hand frame): wax stick, paper drip guard, flame with glow
  c.save(); c.rotate(-1.5); c.beginPath(); c.rect(-14, -150, 28, 150); fs(c, '#f4eee0', 5); ell(c, 0, -10, 50, 14); fs(c, '#f2f0ea', 4);
  const f = 1 + Math.sin(performance.now ? 0 : 0); ell(c, 0, -185, 14, 30); c.fillStyle = '#ffd860'; c.fill(); ell(c, 0, -178, 7, 14); c.fillStyle = '#fff6d0'; c.fill();
  bloom(c, 0, -180, 260, '255,190,90', .75); c.restore();
}
function placard(text, col = '#f2ece0') { return c => { c.save(); c.rotate(-1.5); line(c, [0, 60, 0, -420], 14, '#7a5a3a'); c.translate(0, -560); c.rotate(.05); c.beginPath(); c.rect(-230, -110, 460, 220); fs(c, col, 7); c.font = "700 italic 70px 'DejaVu Sans', sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1e1e1e'; c.fillText(text, 0, 0, 420); c.restore(); }; }
function worldPlacard(c, x, y, text, k = .25) { // hand-painted sign on a stick above a person (world space)
  const s = k / .25; line(c, [x, y - 280 * s, x, y - 560 * s], 12 * s, OUT); line(c, [x, y - 280 * s, x, y - 560 * s], 7 * s, '#8a6a3a');
  c.save(); c.translate(x, y - 640 * s); c.rotate((rnd(x) - .5) * .12); c.beginPath(); c.rect(-150 * s, -70 * s, 300 * s, 140 * s); fs(c, '#f2ece0', 4); c.font = `700 italic ${46 * s}px 'DejaVu Sans', sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1e1e1e'; c.fillText(text, 0, 0, 270 * s); c.restore(); }
function flashlight(c) { c.save(); c.rotate(-1.3); c.beginPath(); c.rect(-18, -10, 36, 120); fs(c, '#2a2a2a', 5); c.restore(); bloom(c, 80, -20, 160, '255,250,220', .7); }
// ---------------- West street props ----------------
function westProps(c, t, o, P) {
  const night = !!P.night;
  // kiosk with magazines + bright window, western yellow phone booth, colourful advertising pillar, bright lamps
  const kx = -3100; c.beginPath(); c.rect(kx - 300, -520, 600, 520); fs(c, '#2e5a8a', 3); c.beginPath(); c.rect(kx - 260, -440, 520, 280); fs(c, night ? '#ffe0a8' : '#d8e8f0', 2.5);
  for (let i = 0; i < 12; i++) { c.beginPath(); c.rect(kx - 250 + (i % 6) * 84, -430 + Math.floor(i / 6) * 130, 70, 110); fs(c, ['#e8463a', '#f2c531', '#3a8ad8', '#4ab86a', '#e87ab8', '#ff8a2a'][i % 6], 2); }
  c.beginPath(); c.rect(kx - 330, -600, 660, 80); fs(c, '#1e2a4a', 3); signText(c, 'Zeitungen · Tabak', kx, -560, 44, night ? '#fff2b0' : '#f0f0f0'); if (night) bloom(c, kx, -300, 500, '255,220,160', .5);
  // western phone booth: yellow, more glass
  const px = -1700; c.beginPath(); c.rect(px - 115, -540, 230, 540); fs(c, '#f2c531', 3); glassPane(c, px - 95, -470, 190, 380, { sky: night ? ['#ffeec8', '#d8c090'] : ['#d0e0e8', '#7a8a94'] }); c.beginPath(); c.rect(px - 95, -470, 190, 380); fs(c, null, 2); signText(c, 'Telefon', px, -505, 36, '#1e1e1e'); if (night) bloom(c, px, -280, 300, '255,240,200', .5);
  // advertising billboard (generic, colourful)
  const bx = 2700; line(c, [bx - 300, 0, bx - 300, -600], 14); line(c, [bx + 300, 0, bx + 300, -600], 14);
  c.beginPath(); c.rect(bx - 420, -1060, 840, 480); fs(c, '#ffffff', 4); let g = c.createLinearGradient(bx - 420, 0, bx + 420, 0); g.addColorStop(0, '#ff6a3a'); g.addColorStop(1, '#f2c531'); c.fillStyle = g; c.fillRect(bx - 400, -1040, 800, 440);
  signText(c, 'Urlaub am Meer', bx, -900, 72, '#fff', { shadow: 'rgba(0,0,0,.3)' }); circle(c, bx + 260, -760, 90); c.fillStyle = '#fff6c8'; c.fill(); for (let k = 0; k < 4; k++) line(c, [bx - 380, -680 + k * 20, bx + 100, -680 + k * 20], 8, 'rgba(40,120,200,.8)'); if (night) bloom(c, bx, -820, 700, '255,200,140', .5);
  for (const x of [-4300, -600, 1600, 4200]) { ostLamp(c, x, 80, night); if (night) bloom(c, x + 230, -1760, 700, '255,245,225', .35); }
  for (const x of [-4900, 600, 4700]) { c.beginPath(); c.rect(x - 110, 50, 220, 22); fs(c, '#3e3a36', 2); bareTree(c, x, 60, { seed: x * .41, t, h: 950, trunk: 56, leaves: .25 }); }
  ostBike(c, -2300, -180, '#c83a2e');
}
// ---------------- stairwell (Treppenhaus) ----------------
//  stairs run down from upper-left to lower-right; stairY(x) gives the step line. Landing at x > 900.
const ST_TOP = -900, ST_X0 = -1400, ST_X1 = 900, ST_BOT = 300;
function stairY(x) { if (x <= ST_X0) return ST_TOP; if (x >= ST_X1) return ST_BOT; const k = (x - ST_X0) / (ST_X1 - ST_X0); return ST_TOP + (ST_BOT - ST_TOP) * k; }
function treppenhaus(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2a2420'; c.fillRect(0, 0, W, H);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400);
    // wall: tiles to the dado line (follows the stairs), worn plaster above, light switch, window with frosted glass, mailboxes on the landing
    plasterWall(c, x0, -2600, x1 - x0, 3400, '#bdb39a', 5, { sootTop: .25, sootBottom: 0 });
    c.beginPath(); c.moveTo(x0, stairY(x0) - 420); for (let x = x0; x <= x1; x += 100) c.lineTo(x, stairY(x) - 420); c.lineTo(x1, 900); c.lineTo(x0, 900); c.closePath(); c.save(); c.clip();
    for (let y = -1600; y < 900; y += 40) for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { c.fillStyle = (Math.floor(x / 40) + Math.floor(y / 40)) % 2 ? '#7a9a7a' : '#8aaa88'; c.fillRect(x + 1, y + 1, 38, 38); }
    grain(c, x0, -1600, x1 - x0, 2500, .3, 1); c.restore();
    c.beginPath(); c.moveTo(x0, stairY(x0) - 420); for (let x = x0; x <= x1; x += 100) c.lineTo(x, stairY(x) - 420); c.lineWidth = 14; c.strokeStyle = '#4a5a4a'; c.stroke();
    // window
    c.beginPath(); c.rect(-300, -1900, 360, 620); fs(c, '#efe8d8', 4); glassPane(c, -280, -1880, 320, 580, { sky: o.night ? ['#2a3450', '#121828'] : ['#d8dcd8', '#a8aca8'], hi: .1 }); c.fillStyle = 'rgba(240,240,235,.4)'; c.fillRect(-280, -1880, 320, 580); line(c, [-120, -1880, -120, -1300], 8, '#efe8d8');
    // timer light switch (glowing orange)
    c.beginPath(); c.rect(-760, -800, 50, 70); fs(c, '#d8d0c0', 2); circle(c, -735, -765, 14); c.fillStyle = '#ff9a3a'; c.fill(); bloom(c, -735, -765, 60, '255,150,60', .8);
    // landing at the bottom right: mailboxes
    for (let k = 0; k < 8; k++) { const mx = 1150 + (k % 4) * 130, my = -320 + Math.floor(k / 4) * 120; c.beginPath(); c.rect(mx, my, 120, 110); fs(c, '#6a6a40', 2.5); c.beginPath(); c.rect(mx + 20, my + 20, 80, 12); fs(c, '#2a2a2a', 1); c.beginPath(); c.rect(mx + 30, my + 60, 60, 26); fs(c, '#efe8d8', 1.5); }
    // steps: treads + risers (worn wood) and tiled landing
    for (let x = ST_X0; x < ST_X1; x += 80) { const y = stairY(x); c.beginPath(); c.rect(x, y, 80, stairY(x + 80) - y + 40); c.fillStyle = '#6a4a2e'; c.fill(); c.fillStyle = '#8a6440'; c.fillRect(x, y, 80, 14); c.fillStyle = 'rgba(255,230,190,.18)'; c.fillRect(x + 20, y + 2, 40, 6); }
    c.fillStyle = '#3a2a1a'; c.beginPath(); c.moveTo(ST_X0, ST_TOP + 40); for (let x = ST_X0; x <= ST_X1; x += 80) c.lineTo(x, stairY(x) + 40); c.lineTo(ST_X1, 1200); c.lineTo(ST_X0, 1200); c.closePath(); c.fill();
    for (let x = ST_X1; x < x1; x += 60) for (let y = ST_BOT; y < ST_BOT + 600; y += 60) { c.fillStyle = (x / 60 + y / 60) % 2 ? '#b8a890' : '#8a5a3a'; c.fillRect(x, y, 60, 60); }
    for (let x = x0; x < ST_X0; x += 60) for (let y = ST_TOP; y < ST_TOP + 600; y += 60) { c.fillStyle = (x / 60 + y / 60) % 2 ? '#b8a890' : '#8a5a3a'; c.fillRect(x, y, 60, 60); }
    if (o.night) bloom(c, -100, -2300, 900, '255,220,150', .35);
  });
}
function stairRail(c) {
  // banister in front of the stairs: turned balusters + handrail
  for (let x = ST_X0; x < ST_X1; x += 80) { const y = stairY(x); line(c, [x + 40, y + 10, x + 40, y - 330], 12, OUT); line(c, [x + 40, y + 10, x + 40, y - 330], 7, '#5a3a22'); ell(c, x + 40, y - 150, 12, 26); fs(c, '#6a4628', 2); }
  c.beginPath(); c.moveTo(ST_X0 - 100, ST_TOP - 340); c.lineTo(ST_X1 + 40, ST_BOT - 340); c.lineTo(ST_X1 + 300, ST_BOT - 340); c.lineWidth = 34; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 24; c.strokeStyle = '#6a4628'; c.stroke(); c.lineWidth = 6; c.strokeStyle = 'rgba(255,220,170,.4)'; c.stroke();
  c.beginPath(); c.rect(ST_X1 + 20, ST_BOT - 420, 60, 420); fs(c, '#5a3a22', 3); circle(c, ST_X1 + 50, ST_BOT - 440, 34); fs(c, '#6a4628', 3);
}
// ---------------- factory (Betrieb) ----------------
function fabrik(c, cam, t, o = {}) {
  skyFill(c, '#3a3a3a', '#5a5852');
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400), HZ = -360;
    brickFill(c, x0, -2600, x1 - x0, 2240, 9, { base: '#7a4a3a', soot: .25 }); soot(c, x0, -2600, x1 - x0, 2240, { top: .4, bottom: .2 });
    // tall steel windows with many small panes
    for (let x = Math.floor(x0 / 1200) * 1200; x < x1; x += 1200) { c.beginPath(); c.rect(x + 200, -2400, 700, 1300); fs(c, '#3a3e40', 4); for (let r = 0; r < 8; r++) for (let k = 0; k < 5; k++) glassPane(c, x + 214 + k * 136, -2386 + r * 160, 124, 148, { sky: ['#c8ccc8', '#8a908c'], hi: .15 }); }
    // crane rail, hanging lamps, a slogan banner (generic)
    line(c, [x0, -2550, x1, -2550], 30, '#4a4a46'); for (let x = Math.floor(x0 / 700) * 700; x < x1; x += 700) { line(c, [x, -2550, x, -1500], 4, '#2a2a2a'); c.beginPath(); c.moveTo(x - 90, -1500); c.lineTo(x + 90, -1500); c.lineTo(x + 50, -1560); c.lineTo(x - 50, -1560); c.closePath(); fs(c, '#4a6a5a', 3); bloom(c, x, -1460, 500, '255,240,200', .45); }
    c.beginPath(); c.rect(-900, -1100, 1800, 160); fs(c, '#a8322a', 3); signText(c, 'Planerfüllung', 0, -1020, 80, '#f2e8c0');
    // concrete floor with oil stains, yellow walkway lines
    c.fillStyle = '#7a7770'; c.fillRect(x0, HZ, x1 - x0, 2000); grain(c, x0, HZ, x1 - x0, 2000, .7, 1.5); mottle(c, x0, HZ, x1 - x0, 2000, 3, { r: 120, a: .14 });
    c.fillStyle = '#d8b030'; c.fillRect(x0, HZ + 600, x1 - x0, 18);
  });
}
function werkbank(c, x, y, o = {}) {
  // workbench with vice, tools on a pegboard, lamp; o.empty leaves it abandoned with a thermos
  c.beginPath(); c.rect(x - 420, y - 700, 840, 420); fs(c, '#8a7a5a', 3); for (let i = 0; i < 20; i++) { circle(c, x - 380 + (i % 10) * 84, y - 660 + Math.floor(i / 10) * 200, 6); c.fillStyle = '#4a4030'; c.fill(); }
  for (let k = 0; k < 6; k++) { const tx = x - 360 + k * 140; line(c, [tx, y - 640, tx, y - 470], 10, ['#7a2a2a', '#2a4a6a', '#5a5a5a', '#3a5a3a', '#6a4a2a', '#4a4a4a'][k]); }
  c.beginPath(); c.rect(x - 460, y - 300, 920, 50); fs(c, '#6a5038', 3); c.beginPath(); c.rect(x - 440, y - 250, 880, 250); fs(c, '#4a5a5a', 3); for (const dx of [-300, 0, 300]) { c.beginPath(); c.rect(x + dx - 110, y - 230, 220, 90); fs(c, '#5a6a6a', 2); c.beginPath(); c.rect(x + dx - 30, y - 190, 60, 10); fs(c, '#c9c9c0', 1); }
  c.beginPath(); c.rect(x + 200, y - 380, 160, 80); fs(c, '#3a3e40', 3); c.beginPath(); c.rect(x + 340, y - 360, 60, 30); fs(c, '#3a3e40', 2);
  if (o.empty) { c.beginPath(); c.rect(x - 240, y - 420, 70, 130); fs(c, '#4a6a8a', 3); c.beginPath(); c.rect(x - 246, y - 440, 82, 28); fs(c, '#c8c8c0', 3); c.beginPath(); c.rect(x - 120, y - 320, 160, 20); fs(c, '#efe8d8', 2); }
  else { c.beginPath(); c.rect(x - 200, y - 330, 140, 30); fs(c, '#b8b8b0', 2); }
}
// ---------------- death strip (day) ----------------
function todesstreifen(c, cam, t, o = {}) {
  skyFill(c, '#9aa6ae', '#d8d8d0');
  layerZ(c, cam, .15, c => { const b = baseZ(cam, -1640, .15), cols = ['#c9b89a', '#d8c4a0', '#b8c0c8', '#e0d0b0', '#c8a890'];
    for (let i = -40; i < 40; i++) { const x = i * 170, h = 260 + rnd(i + 9) * 380; c.fillStyle = cols[Math.abs(i) % 5]; c.fillRect(x, b - h, 160, h); c.beginPath(); c.moveTo(x - 4, b - h); c.lineTo(x + 80, b - h - 60); c.lineTo(x + 164, b - h); c.fill(); c.fillStyle = 'rgba(60,70,90,.45)'; for (let r = 0; r < h / 40 - 1; r++) for (let k = 0; k < 4; k++) c.fillRect(x + 14 + k * 36, b - h + 20 + r * 40, 18, 22);
      if (rnd(i + 4) > .8) { const bc = ['#e8463a', '#3a8ad8', '#f2c531', '#4ab86a'][Math.abs(i) % 4]; c.fillStyle = bc; c.fillRect(x - 10, b - h - 150, 180, 90); c.fillStyle = '#fff'; c.fillRect(x + 10, b - h - 125, 140, 14); c.fillRect(x + 10, b - h - 100, 90, 10); line(c, [x + 20, b - h - 60, x + 20, b - h], 4, '#555'); line(c, [x + 150, b - h - 60, x + 150, b - h], 4, '#555'); } } });
  haze(c, '210,214,214', .3);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 600);
    // far front wall (west) with pipe, then strip: sand raked, patrol road, lamp row, tank traps, signal fence, near hinterland wall
    hinterlandWall(c, x0, x1, -900);
    c.fillStyle = '#d8ccb0'; c.fillRect(x0, -900, x1 - x0, 1400); for (let y = -890; y < 500; y += 18) line(c, [x0, y, x1, y], 2, 'rgba(150,130,100,.35)'); grain(c, x0, -900, x1 - x0, 1400, .6, 2);
    c.fillStyle = '#8a8880'; c.fillRect(x0, -560, x1 - x0, 140); for (let x = Math.floor(x0 / 300) * 300; x < x1; x += 300) line(c, [x, -560, x, -420], 2, 'rgba(40,40,40,.4)');
    for (let x = Math.floor(x0 / 1400) * 1400; x < x1; x += 1400) { line(c, [x, -400, x, -2200], 16); line(c, [x, -400, x, -2200], 10, '#6a6e6c'); c.beginPath(); c.rect(x - 60, -2240, 160, 40); fs(c, '#4a4e4c', 2); }
    for (let x = Math.floor(x0 / 700) * 700 + 300; x < x1; x += 700) { const y = -200; for (const a of [-.7, 0, .7]) line(c, [x - Math.cos(a) * 120, y - 120 + Math.sin(a) * 60, x + Math.cos(a) * 120, y + 20 - Math.sin(a) * 60], 18, '#5a4a3a'); }
    if (o.tower !== false) borderTower(c, o.towerX ?? 900, -700);
    signalFence(c, x0, x1, 300, 400);
  });
}
// ---------------- Hungarian border (summer) ----------------
function ungarn(c, cam, t, o = {}) {
  skyFill(c, '#6ab0e0', '#e8f0e0');
  layerZ(c, cam, .05, c => { const b = baseZ(cam, -300, .05); bloom(c, 1500, b - 1600, 600, '255,250,220', .8); for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,255,255,.85)'; const x = -3000 + i * 1200, y = b - 1700 + rnd(i) * 400; for (const [dx, dy, r] of [[0, 0, 120], [130, -50, 160], [280, 0, 110]]) { ell(c, x + dx, y + dy, r * 1.4, r * .7); c.fill(); } } });
  layerZ(c, cam, .3, c => { const b = baseZ(cam, -300, .3); c.fillStyle = '#7aa05a'; c.beginPath(); c.moveTo(-6000, b); for (let x = -6000; x <= 6000; x += 300) c.lineTo(x, b - 260 - Math.sin(x * .001) * 160); c.lineTo(6000, b); c.fill(); for (let i = -20; i < 20; i++) { const x = i * 300 + rnd(i) * 100, y = b - 200 - Math.sin(x * .001) * 160; ell(c, x, y - 220, 50, 220); c.fillStyle = '#4a7a3a'; c.fill(); line(c, [x, y, x, y - 60], 10, '#5a4a30'); } });
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 600);
    c.fillStyle = '#9ab868'; c.fillRect(x0, -300, x1 - x0, 1800); perChunk(x0, x1, 200, (a, b, ci) => { for (let k = 0; k < 10; k++) { const i = ci * 10 + k, gx = a + rnd(i) * 200, gy = -280 + rnd(i + 3) * 1500; line(c, [gx, gy, gx + 4, gy - 20], 3, rnd(i + 7) > .5 ? '#6a8a48' : '#b8d088'); } });
    c.fillStyle = '#b8a888'; c.fillRect(x0, 240, x1 - x0, 260); grain(c, x0, 240, x1 - x0, 260, .6, 2);
    // fence with a cut opening (o.gap x)
    const gx = o.gapX ?? 0;
    for (let x = Math.floor(x0 / 360) * 360; x < x1; x += 360) { if (Math.abs(x - gx) < 300) continue; line(c, [x, 0, x, -700], 14); line(c, [x, 0, x, -700], 8, '#8a7a60'); }
    c.save(); c.strokeStyle = 'rgba(70,70,70,.7)'; c.lineWidth = 2; for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { if (Math.abs(x - gx) < 260) continue; c.beginPath(); c.moveTo(x, -650); c.lineTo(x + 40, 0); c.moveTo(x + 40, -650); c.lineTo(x, 0); c.stroke(); } for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x0, -680 - k * 22); c.lineTo(gx - 260, -680 - k * 22); c.moveTo(gx + 260, -680 - k * 22); c.lineTo(x1, -680 - k * 22); c.stroke(); } c.restore();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(gx + s * 260, -650); c.quadraticCurveTo(gx + s * 330, -320, gx + s * 420, -40); c.lineWidth = 3; c.strokeStyle = '#555'; c.stroke(); }
  });
}
// ---------------- Leipzig at dusk: church front + crowd with candles ----------------
function leipzig(c, cam, t, o = {}) {
  skyFill(c, '#1e2a50', '#7a5a70');
  layerZ(c, cam, .3, c => {
    const b = baseZ(cam, -500, .3), cx = o.churchX ?? 0;
    c.fillStyle = '#4a4050'; c.fillRect(-5000, b - 900, 10000, 900); for (let i = -30; i < 30; i++) for (let r = 0; r < 3; r++) if (rnd(i * 3 + r) > .5) { c.fillStyle = '#e8b870'; c.fillRect(i * 170 + 40, b - 820 + r * 240, 50, 80); }
    c.beginPath(); c.rect(cx - 900, b - 2400, 1800, 2400); fs(c, '#a89a88', 4); c.save(); c.beginPath(); c.rect(cx - 900, b - 2400, 1800, 2400); c.clip(); grain(c, cx - 900, b - 2400, 1800, 2400, .6, 1.5); soot(c, cx - 900, b - 2400, 1800, 2400, { top: .3, bottom: .3 }); c.restore();
    c.beginPath(); c.moveTo(cx - 950, b - 2400); c.lineTo(cx, b - 3200); c.lineTo(cx + 950, b - 2400); c.closePath(); fs(c, '#6a5e52', 4);
    c.beginPath(); c.rect(cx - 260, b - 3900, 520, 1600); fs(c, '#a89a88', 4); c.beginPath(); c.moveTo(cx - 300, b - 3900); c.lineTo(cx, b - 4700); c.lineTo(cx + 300, b - 3900); c.closePath(); fs(c, '#4a6a5a', 4); line(c, [cx, b - 4700, cx, b - 4900], 10);
    for (const dx of [-560, 0, 560]) { c.beginPath(); c.moveTo(dx + cx - 140, b - 400); c.lineTo(dx + cx - 140, b - 1700); c.arc(dx + cx, b - 1700, 140, Math.PI, 0); c.lineTo(dx + cx + 140, b - 400); c.closePath(); fs(c, '#e8b870', 3); bloom(c, dx + cx, b - 1100, 500, '255,190,110', .45); for (let k = 1; k < 4; k++) line(c, [dx + cx - 140, b - 1700 + k * 330, dx + cx + 140, b - 1700 + k * 330], 6, '#4a3a2a'); }
    c.beginPath(); c.moveTo(cx - 220, b); c.lineTo(cx - 220, b - 600); c.arc(cx, b - 600, 220, Math.PI, 0); c.lineTo(cx + 220, b); c.closePath(); fs(c, '#ffd890', 3); bloom(c, cx, b - 400, 700, '255,200,120', .6);
  });
  layerZ(c, cam, 1, c => { const [x0, x1] = visXZ(cam, 1, 600); c.fillStyle = '#3a3640'; c.fillRect(x0, -500, x1 - x0, 2200); cobbles(c, x0, x1, -500, 1700, 17, { base: '#4a4652', h0: 16, h1: 30, sheen: .25 }); });
}
// ---------------- Alexanderplatz (day): TV tower, slab blocks, sea of people ----------------
function alex(c, cam, t, o = {}) {
  skyFill(c, '#9ab0c8', '#e0e2dc');
  layerZ(c, cam, .12, c => { const b = baseZ(cam, -600, .12), tx = 600; c.fillStyle = '#b8bcc0'; c.fillRect(tx - 60, b - 3200, 120, 3200); circle(c, tx, b - 2700, 230); c.fillStyle = '#c8ccd0'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#6a6e72'; c.stroke(); c.fillStyle = '#8a8e92'; c.fillRect(tx - 230, b - 2720, 460, 40); c.fillRect(tx - 14, b - 3800, 28, 620); line(c, [tx, b - 3800, tx, b - 4000], 8, '#c83a2e'); });
  haze(c, '225,228,230', .2);
  layerZ(c, cam, .45, c => { const b = baseZ(cam, -600, .45); for (let i = -12; i < 12; i++) { const x = i * 900, h = 1600 + rnd(i) * 700; c.beginPath(); c.rect(x, b - h, 820, h); fs(c, '#c8c4ba', 3); for (let r = 0; r < h / 110 - 1; r++) for (let k = 0; k < 7; k++) { c.fillStyle = rnd(i * 50 + r * 7 + k) > .3 ? '#6a7684' : '#e0d8c0'; c.fillRect(x + 40 + k * 110, b - h + 40 + r * 110, 70, 60); } for (let r = 0; r < h / 110; r++) line(c, [x, b - h + r * 110, x + 820, b - h + r * 110], 2, 'rgba(60,60,60,.3)'); } });
  layerZ(c, cam, 1, c => { const [x0, x1] = visXZ(cam, 1, 600); c.fillStyle = '#a8a49a'; c.fillRect(x0, -600, x1 - x0, 2400); for (let r = 0, y = -600; y < 1800; r++) { const h = 50 + r * 6; line(c, [x0, y, x1, y], 2, 'rgba(60,58,54,.35)'); y += h; } grain(c, x0, -600, x1 - x0, 2400, .6, 2); });
}
// a dense crowd in rows (world space). o: { y0, y1, rows, x0, x1, t, kind: 'candle' | 'placard' | 'torch' | 'cheer', seed, skip: [x0,x1] }
const CROWD = [
  { hair: 'perm', hairCol: '#7a5a3a', coat: '#6a5a7a', coatLen: 'long' }, { hair: 'short', hat: 'bobble', hatCol: '#a03a2a', coat: '#3a5a7a', type: 'parka', pants: '#4a6890' },
  { hair: 'bald', hairCol: '#5a4a3a', hat: 'cap', hatCol: '#4a4a44', coat: '#5a5a4e', glasses: true }, { hair: 'bun', hairCol: '#b9b2a6', hat: 'scarf', hatCol: '#7a3a4a', coat: '#7a6a50', coatLen: 'long' },
  { hair: 'mullet', hairCol: '#5b4636', coat: '#8a7a5a', type: 'jacket', pants: '#4a6890' }, { hair: 'long', hairCol: '#a0703c', coat: '#4a6a4a', type: 'parka' },
  { hair: 'side', hairCol: '#2a2422', coat: '#5a4a3a', type: 'coat', moustache: true }, { hair: 'short', hairCol: '#3a2c24', hat: 'fur', hatCol: '#5a4a3a', coat: '#3a3a40', coatLen: 'long' },
  { hair: 'perm', hairCol: '#b9b2a6', coat: '#8a6a8a', type: 'coat', glasses: true }, { hair: 'short', hairCol: '#6a5a4a', coat: '#6a6a5a', type: 'jacket', beard: true },
];
function crowd(c, t, o = {}) {
  const rows = o.rows || 4, seed = o.seed || 1;
  for (let r = 0; r < rows; r++) {
    const y = lerp(o.y0 ?? -200, o.y1 ?? 200, rows > 1 ? r / (rows - 1) : 0), step = o.step || 210;
    for (let x = (o.x0 ?? -3000) + (r % 2) * step / 2; x < (o.x1 ?? 3000); x += step) {
      if (o.skip && x > o.skip[0] && x < o.skip[1]) continue;
      const i = Math.floor(x / step) * 7 + r * 13 + seed, P = CROWD[Math.abs(i) % CROWD.length], jx = (rnd(i) - .5) * step * .5, kind = o.kind;
      const front = rnd(i + 5) > (o.sideP ?? .45);
      const sign = kind === 'placard' && rnd(i + 2) > .6 ? ['Reisefreiheit!', 'Freie Wahlen', 'Keine Gewalt', 'Wir sind das Volk', 'Demokratie jetzt'][Math.abs(i) % 5] : null; const hold = kind === 'candle' ? candle : kind === 'torch' && rnd(i + 3) > .75 ? flashlight : null;
      const bob = kind === 'cheer' ? -Math.max(0, Math.sin(t * 7 + i)) * 26 : 0;
      const ex = { mouth: o.mouth || (kind === 'cheer' ? (rnd(i) > .4 ? 'shout' : 'smile') : 'flat'), open: .7, look: (rnd(i + 1) - .5) * 1.4, browUp: o.browUp ?? 0 };
      if (sign) worldPlacard(c, x + jx + 40, y + bob, sign, .25 * (.92 + rnd(i + 4) * .12));
      if (front) drawFolk(c, Object.assign({ x: x + jx, y: y + bob, h: .92 + rnd(i + 4) * .12, expr: ex, holdR: hold, arms: kind === 'cheer' && rnd(i + 6) > .4 ? { l: { a: 2.4 + Math.sin(t * 8 + i) * .2, b: -.2 }, r: { a: 2.3, b: -.3 } } : hold ? { r: { a: .6, b: -1.6 } } : undefined }, P));
      else drawFolkSide(c, Object.assign({ x: x + jx, y: y + bob, s: rnd(i + 9) > .5 ? 1 : -1, h: .92 + rnd(i + 4) * .12, expr: ex, hold, nearA: hold ? .9 : .02, nearBend: hold ? -1.5 : -.05, walk: o.walk ? t * 8 + i : null, armsUp: kind === 'cheer' && rnd(i + 7) > .6, t }, P));
    }
  }
}
// ---------------- Kneipe (West) ----------------
function kneipe(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1e140e'; c.fillRect(0, 0, W, H);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400), HZ = -300;
    woodPanels(c, x0, x1, -2200, HZ); c.fillStyle = 'rgba(30,15,5,.35)'; c.fillRect(x0, -2200, x1 - x0, 1900);
    // back shelf with bottles + mirror, neon "Bier" sign, beer taps
    c.beginPath(); c.rect(-1400, -1800, 2800, 900); fs(c, '#3a2a1e', 3); glassPane(c, -1360, -1760, 2720, 820, { sky: ['#6a5040', '#2a1a10'], hi: .1 });
    for (const sy of [-1300, -960]) { c.fillStyle = '#5a3a22'; c.fillRect(-1360, sy, 2720, 20); for (let k = 0; k < 34; k++) { const bx = -1330 + k * 80, h = 140 + rnd(k + sy) * 80; c.beginPath(); c.rect(bx, sy - h, 40, h); fs(c, ['#3a6a3a', '#7a4a1a', '#c8c8b8', '#5a2a2a', '#2a3a5a'][k % 5], 2); c.beginPath(); c.rect(bx + 12, sy - h - 40, 16, 40); fs(c, '#2a2a2a', 1.5); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(bx + 6, sy - h + 10, 6, h - 20); } }
    c.save(); c.shadowColor = '#ff4a6a'; c.shadowBlur = 40; signText(c, 'Bier', 900, -2000, 160, '#ff6a8a'); signText(c, 'Bier', 900, -2000, 160, '#fff0f4'); c.restore(); bloom(c, 900, -2000, 600, '255,80,120', .5);
    // floor
    c.fillStyle = '#4a3020'; c.fillRect(x0, HZ, x1 - x0, 2000); for (let y = HZ; y < 1700; y += 60) line(c, [x0, y, x1, y], 2, 'rgba(0,0,0,.3)'); grain(c, x0, HZ, x1 - x0, 2000, .5, 1.5);
    for (let x = Math.floor(x0 / 600) * 600; x < x1; x += 600) { line(c, [x, -2700, x, -2300], 4, '#1e1e1e'); c.beginPath(); c.moveTo(x - 120, -2300); c.lineTo(x + 120, -2300); c.lineTo(x + 60, -2380); c.lineTo(x - 60, -2380); c.closePath(); fs(c, '#c8a060', 2); bloom(c, x, -2260, 600, '255,200,120', .5); }
  });
}
function theke(c, t, o = {}) {
  // bar counter in front of the shelf with taps and glasses (world space, y = counter foot)
  const y = o.y ?? 150;
  c.beginPath(); c.rect(-1600, y - 540, 3200, 540); fs(c, '#5a3a22', 3); for (let x = -1600; x < 1600; x += 200) { c.beginPath(); c.rect(x + 20, y - 500, 160, 440); fs(c, '#6a4628', 2); }
  c.beginPath(); c.rect(-1650, y - 580, 3300, 50); fs(c, '#3a2414', 3); c.fillStyle = 'rgba(255,220,170,.2)'; c.fillRect(-1650, y - 580, 3300, 10);
  for (const tx of [-300, -150, 0]) { c.beginPath(); c.rect(tx - 20, y - 800, 40, 220); fs(c, '#c8c8c0', 3); c.beginPath(); c.rect(tx - 34, y - 840, 68, 50); fs(c, '#2a2a2a', 3); }
  for (let k = 0; k < (o.glasses ?? 8); k++) beerGlass(c, -1200 + k * 300 + (k % 2) * 40, y - 580, 1);
}
function beerGlass(c, x, y, full = 1) { c.beginPath(); c.moveTo(x - 34, y); c.lineTo(x + 34, y); c.lineTo(x + 40, y - 170); c.lineTo(x - 40, y - 170); c.closePath(); fs(c, 'rgba(230,240,240,.4)', 3); c.beginPath(); c.moveTo(x - 32, y - 4); c.lineTo(x + 32, y - 4); c.lineTo(x + 37, y - 150 * full); c.lineTo(x - 37, y - 150 * full); c.closePath(); c.fillStyle = '#e8a83a'; c.fill(); ell(c, x, y - 150 * full - 8, 40, 18); c.fillStyle = '#fbf6ea'; c.fill(); for (let k = 0; k < 6; k++) { circle(c, x - 20 + rnd(k + x) * 40, y - 20 - rnd(k + y) * 110, 3); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); } }
// ---------------- West bank front with queue ----------------
function bankFront(c, cam, t, o = {}) {
  skyFill(c, o.night ? '#0c1430' : '#9cc0dc', o.night ? '#2c3260' : '#e6e8e0');
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400), HZ = -280, night = !!o.night;
    c.fillStyle = '#d8d4ca'; c.fillRect(x0, -3400, x1 - x0, 3120); c.save(); c.beginPath(); c.rect(x0, -3400, x1 - x0, 3120); c.clip(); grain(c, x0, -3400, x1 - x0, 3120, .4, 1.5); for (let r = 0; r < 6; r++) for (let x = Math.floor(x0 / 500) * 500; x < x1; x += 500) glassPane(c, x + 80, -3200 + r * 450, 340, 300, { sky: night ? ['#ffe8b8', '#c8a870'] : ['#c8d8e0', '#5a6e7a'] }); c.restore();
    c.beginPath(); c.rect(x0, -1100, x1 - x0, 820); fs(c, '#3a4a6a', 3); for (let x = Math.floor(x0 / 700) * 700; x < x1; x += 700) { glassPane(c, x + 60, -1000, 580, 640, { sky: night ? ['#fff0c8', '#e0c890'] : ['#d8e4e8', '#7a8e98'], lit: night ? 'rgba(255,230,170,.6)' : null }); c.beginPath(); c.rect(x + 60, -1000, 580, 640); fs(c, null, 3); }
    c.beginPath(); c.rect(-1200, -1350, 2400, 200); fs(c, '#1e2e5a', 3); signText(c, 'Bank', 0, -1250, 120, '#f2f2f2', { spacing: 10 }); if (night) bloom(c, 0, -1250, 1000, '200,220,255', .4);
    if (o.nachts !== false) { c.save(); c.translate(500, -760); c.rotate(-.03); c.beginPath(); c.rect(-330, -90, 660, 180); fs(c, '#fffbe8', 4); signText(c, 'Heute auch nachts', 0, -32, 50, '#b8322a'); signText(c, 'geöffnet', 0, 36, 50, '#b8322a'); c.restore(); }
    c.fillStyle = '#b8b4aa'; c.fillRect(x0, HZ, x1 - x0, 1800); slabs(c, x0, x1, HZ, HZ + 380, 4, { base: '#c0bcb2', w: 260 }); grain(c, x0, HZ, x1 - x0, 1800, .4, 2);
  });
}
// ---------------- supermarket aisle ----------------
function supermarkt(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#e8ecee'; c.fillRect(0, 0, W, H);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400), HZ = -200;
    c.fillStyle = '#f2f4f2'; c.fillRect(x0, -2600, x1 - x0, 2400); for (let x = Math.floor(x0 / 500) * 500; x < x1; x += 500) { c.beginPath(); c.rect(x + 60, -2500, 380, 40); fs(c, '#ffffff', 2); bloom(c, x + 250, -2460, 500, '255,255,250', .6); }
    // shelves: 5 levels, densely packed colourful goods (no logos), price rails
    const cols = ['#e8463a', '#f2c531', '#3a8ad8', '#4ab86a', '#e87ab8', '#ff8a2a', '#8a5ad8', '#3ac8c8', '#ffffff', '#c8a060'];
    for (let lv = 0; lv < 5; lv++) { const sy = -380 - lv * 360; c.fillStyle = '#d8dcdc'; c.fillRect(x0, sy, x1 - x0, 26); c.fillStyle = '#f8e070'; c.fillRect(x0, sy + 26, x1 - x0, 20);
      for (let x = Math.floor(x0 / 80) * 80; x < x1; x += 80) { const k = Math.abs(Math.floor(x / 80) * 7 + lv * 3), col = cols[k % cols.length], h = 160 + (k % 5) * 30;
        if (lv === 1 && o.joghurt) { for (let j = 0; j < 2; j++) { c.beginPath(); c.moveTo(x + 8 + j * 36, sy); c.lineTo(x + 40 + j * 36, sy); c.lineTo(x + 36 + j * 36, sy - 80); c.lineTo(x + 12 + j * 36, sy - 80); c.closePath(); fs(c, '#ffffff', 2); c.fillStyle = cols[(k + j) % cols.length]; c.fillRect(x + 12 + j * 36, sy - 60, 24, 30); ell(c, x + 24 + j * 36, sy - 82, 16, 5); fs(c, '#c8c8c8', 1.5); } continue; }
        c.beginPath(); c.rect(x + 6, sy - h, 66, h); fs(c, col, 2); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x + 14, sy - h + 20, 50, 30); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x + 54, sy - h, 18, h); }
    }
    c.fillStyle = '#d8d0c0'; c.fillRect(x0, HZ, x1 - x0, 2000); for (let x = Math.floor(x0 / 200) * 200; x < x1; x += 200) line(c, [x, HZ, x, 1800], 2, 'rgba(0,0,0,.08)'); for (let y = HZ; y < 1800; y += 120) line(c, [x0, y, x1, y], 2, 'rgba(0,0,0,.08)');
  });
}
function bananas(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); for (let k = 0; k < 6; k++) { c.save(); c.rotate(-.5 + k * .2); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(60, -40, 160, -10); c.quadraticCurveTo(70, -10, 0, 20); c.closePath(); fs(c, '#f2d040', 4); line(c, [150, -12, 166, -14], 6, '#5a4a2a'); c.restore(); } c.beginPath(); c.rect(-20, -10, 30, 30); fs(c, '#7a8a3a', 3); c.restore(); }
// ---------------- the aunt's door (West Altbau, tidy) ----------------
function tanteTuer(c, cam, t, o = {}) {
  skyFill(c, '#9cc0dc', '#e6e8e0');
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400), b = -280;
    plasterWall(c, x0, -3000, x1 - x0, 2720, '#e2d2b4', 81, { sootTop: .1, sootBottom: .1, mottle: .05 }); rustication(c, x0, b - 924, x1 - x0, 814, '#d8c8a8', 3);
    ostGate(c, 0, b, { P: OST_P.westday, wall: '#d8c8a8', open: o.open || 0, wood: '#6a3a1e' });
    // bell plate with name tags (no real names), brass
    c.beginPath(); c.rect(330, b - 560, 120, 260); fs(c, '#c9a040', 3); for (let k = 0; k < 6; k++) { c.beginPath(); c.rect(345, b - 540 + k * 40, 60, 26); fs(c, '#f2ecdc', 1.5); circle(c, 425, b - 527 + k * 40, 9); fs(c, '#2a2a2a', 1.5); }
    for (const px of [-700, 700]) { c.beginPath(); c.rect(px - 90, b - 200, 180, 200); fs(c, '#a0583a', 3); for (let k = 0; k < 7; k++) { ell(c, px - 60 + k * 20, b - 230 - rnd(k + px) * 60, 22, 36); c.fillStyle = k % 2 ? '#3a6a3a' : '#4a7a44'; c.fill(); } }
    c.fillStyle = '#c0bcb2'; c.fillRect(x0, b, x1 - x0, 1800); slabs(c, x0, x1, b, b + 380, 9, { base: '#c8c4ba', w: 260 });
  });
}
// ---------------- TV screen full frame (6.x shots): old TV bezel around an image ----------------
function tvFrame(c, img, t, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#4a2e1c'; c.fillRect(0, 0, W, H); for (let k = 0; k < 60; k++) { c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(rnd(k) * W, 0, 3, H); }
  const sx = 170, sy = 90, sw = W - 340, sh = H - 180;
  rrect(c, sx - 26, sy - 26, sw + 52, sh + 52, 90); c.fillStyle = '#1a1a1a'; c.fill();
  c.save(); rrect(c, sx, sy, sw, sh, 80); c.clip(); c.translate(sx, sy); img(c, sw, sh, t); c.restore();
  c.save(); rrect(c, sx, sy, sw, sh, 80); c.clip();
  for (let y = sy; y < sy + sh; y += 4) { c.fillStyle = 'rgba(0,0,0,.13)'; c.fillRect(sx, y, sw, 2); }
  const g = c.createRadialGradient(W / 2 - 200, H / 2 - 150, 100, W / 2, H / 2, sw * .7); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
  c.fillStyle = `rgba(200,230,255,${.04 + .03 * Math.sin(t * 13)})`; c.fillRect(sx, sy, sw, sh);
  if (o.klak) { c.fillStyle = `rgba(255,255,255,${o.klak})`; c.fillRect(sx, sy, sw, sh); for (let k = 0; k < 40; k++) { c.fillStyle = `rgba(255,255,255,${o.klak * rnd(k + t)})`; c.fillRect(sx, sy + rnd(k * 3 + t) * sh, sw, 3); } }
  c.restore(); c.restore();
}
// TV pictures (stylised, no channel logos, no real faces)
function tvOst(c, w, h, t, o = {}) {
  // East broadcast: press conference wide, grey-blue, man in grey suit centre
  c.fillStyle = '#76848e'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a6670'; c.fillRect(0, 0, w, h * .35); c.fillStyle = '#3a4a42'; c.fillRect(0, h * .62, w, h * .38);
  c.save(); c.translate(w / 2, h * .95); c.scale(h / 1400, h / 1400); drawFolk(c, { x: 0, y: 0, k: 1, hair: 'side', hairCol: '#7a746c', coat: '#6a6c70', type: 'suit', tie: '#3a3a3a', glasses: '#141414', arms: o.paper ? { l: { a: .5, b: -1.8 }, r: { a: 1.3, b: -1.9 } } : { l: { a: .5, b: -1.8 }, r: { a: .5, b: -1.8 } }, holdR: o.paper ? (cc => { cc.beginPath(); cc.rect(-70, -20, 150, 200); fs(cc, '#f6f3ea', 5); }) : null, expr: { mouth: Math.sin(t * 14) > 0 ? 'o' : 'flat', look: o.look || 0 }, tilt: o.tilt || 0 }); c.restore();
  c.fillStyle = '#e8e4d8'; c.fillRect(0, h * .62, w, 18); for (let k = 0; k < 7; k++) line(c, [w * (.38 + k * .04), h * .62, w * (.39 + k * .04), h * .5], 6, '#1e1e1e');
}
function tvWest(c, w, h, t) {
  // West evening news: blue studio, presenter behind a desk, an inset picture of the Wall
  let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a3a7a'); g.addColorStop(1, '#0a1a3a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 8; k++) { c.strokeStyle = 'rgba(120,170,255,.25)'; c.lineWidth = 3; c.beginPath(); c.arc(w * .2, h * .3, 120 + k * 70, 0, Math.PI * 2); c.stroke(); }
  c.beginPath(); c.rect(w * .55, h * .12, w * .38, h * .38); fs(c, '#d8d6cc', 6); c.save(); c.beginPath(); c.rect(w * .55, h * .12, w * .38, h * .38); c.clip(); c.fillStyle = '#9ab0c8'; c.fillRect(w * .55, h * .12, w * .38, h * .2); c.fillStyle = '#b9b5aa'; c.fillRect(w * .55, h * .3, w * .38, h * .2); c.fillStyle = '#c9c5ba'; c.fillRect(w * .55, h * .28, w * .38, h * .03); c.restore();
  c.save(); c.translate(w * .3, h * 1.05); c.scale(h / 1300, h / 1300); drawFolk(c, { x: 0, y: 0, k: 1, hair: 'side', hairCol: '#4a3a2a', coat: '#2a3450', type: 'suit', tie: '#8a2a2a', expr: { mouth: Math.sin(t * 12) > 0 ? 'o' : 'soft' } }); c.restore();
  c.fillStyle = '#2a4a8a'; c.fillRect(0, h * .78, w, h * .22); c.fillStyle = '#c8d8ff'; c.fillRect(0, h * .78, w, 6);
}
function tvStatic(c, w, h, t) { for (let i = 0; i < 1400; i++) { c.fillStyle = rnd(i + Math.floor(t * 30)) > .5 ? '#ddd' : '#333'; c.fillRect(rnd(i * 3 + Math.floor(t * 30)) * w, rnd(i * 7 + Math.floor(t * 30)) * h, 10, 6); } }
