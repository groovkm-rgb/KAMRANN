// More places for the Mauerfall Short (1 m ≈ 220 units, ground y = 0). No logos, no numerals except the allowed words.
//   wallDay      daylight wall with dancers on top, chisellers below
//   tvRoom       dim 80s living room with a CRT TV (screen graphic: blue stripes + analog clock, no numerals)
//   paperSet     close-up: spokesman's glasses (with Noah reflected) above the typed paper
//   eastStreet   evening East Berlin street: sooty plaster block, box windows, stoop, tram rails, Trabant-type cars
//   topDown      bird's-eye street: people streaming towards the border, abandoned cars
//   hutInside    guard hut interior: desk, rotary phone, window onto the crowd
//   westNight    West side: neon shapes, cheering crowd, champagne
// helpers: trabant(c,x,y,s,col,o) side view · trabantTop(c,x,y,rot,col) · stationClock(c,x,y,r,h,m)
const P2 = { plaster: '#8f8576', plasterDark: '#6e665a', soot: 'rgba(40,36,34,.35)', duskSky: ['#141d44', '#3d4a86'], lampHex: '#ffc35a', lamp: '255,195,90' };

// ---------------- shared props ----------------
function trabant(c, x, y, s = 1, col = '#a7b8a0', o = {}) {
  // small boxy two-stroke saloon, side view, facing right (s < 0 faces left); blank plate
  c.save(); c.translate(x, y); c.scale(s, Math.abs(s));
  c.beginPath(); c.moveTo(-330, -40); c.lineTo(-330, -160); c.quadraticCurveTo(-320, -190, -260, -196); c.lineTo(-170, -200); c.lineTo(-110, -330); c.lineTo(120, -330); c.lineTo(200, -205); c.lineTo(300, -196); c.quadraticCurveTo(340, -186, 340, -140); c.lineTo(340, -40); c.closePath(); fs(c, col, 7);
  c.beginPath(); c.moveTo(-95, -310); c.lineTo(5, -310); c.lineTo(5, -205); c.lineTo(-150, -205); c.closePath(); fs(c, o.night ? '#2a3150' : '#a9cfe6', 5);
  c.beginPath(); c.moveTo(25, -310); c.lineTo(112, -310); c.lineTo(175, -205); c.lineTo(25, -205); c.closePath(); fs(c, o.night ? '#2a3150' : '#a9cfe6', 5);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-60, -300, 20, 80);
  line(c, [-330, -120, 340, -120], 5, shade(col, -.25)); line(c, [15, -200, 15, -50], 4, shade(col, -.3)); line(c, [-10, -150, 30, -150], 6, '#444');
  c.beginPath(); c.rect(300, -150, 44, 30); fs(c, '#fff2b0', 4); c.beginPath(); c.rect(-334, -150, 26, 30); fs(c, '#d23a2a', 4);
  c.beginPath(); c.rect(-330, -62, 60, 26); fs(c, '#eee', 3); // blank plate
  for (const wx of [-200, 210]) { circle(c, wx, -40, 62); fs(c, '#2a2628', 7); circle(c, wx, -40, 30); fs(c, '#b8b8c0', 4); }
  c.restore();
  if (o.night) bloom(c, x + 330 * s, y - 135 * Math.abs(s), 120 * Math.abs(s), '255,240,180', .5);
}
function trabantTop(c, x, y, rot, col, s = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.roundRect(-75, -165, 150, 330, 34); fs(c, col, 6);
  c.beginPath(); c.roundRect(-58, -70, 116, 140, 18); fs(c, shade(col, .15), 4);
  c.beginPath(); c.moveTo(-60, -72); c.lineTo(60, -72); c.lineTo(50, -110); c.lineTo(-50, -110); c.closePath(); fs(c, '#2a3150', 4);
  c.beginPath(); c.moveTo(-58, 72); c.lineTo(58, 72); c.lineTo(48, 100); c.lineTo(-48, 100); c.closePath(); fs(c, '#2a3150', 4);
  for (const sx of [-1, 1]) { c.beginPath(); c.rect(sx * 60 - 8, -150, 16, 24); fs(c, '#fff2b0', 3); }
  c.restore();
}
function stationClock(c, x, y, r, h, m, o = {}) {
  // round clock without numerals: 12 bold ticks + 48 thin ones
  circle(c, x, y, r + 18); fs(c, '#2a2a30', 6); circle(c, x, y, r); fs(c, '#fbfaf4', 5);
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, L = i % 5 ? .06 : .16, w = i % 5 ? 3 : 10; line(c, [x + Math.sin(a) * r * .9, y - Math.cos(a) * r * .9, x + Math.sin(a) * r * (.9 - L), y - Math.cos(a) * r * (.9 - L)], w * r / 200, '#1d1a1c'); }
  const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2, am = m / 60 * Math.PI * 2;
  line(c, [x - Math.sin(ah) * r * .1, y + Math.cos(ah) * r * .1, x + Math.sin(ah) * r * .5, y - Math.cos(ah) * r * .5], 22 * r / 200, '#1d1a1c');
  line(c, [x - Math.sin(am) * r * .12, y + Math.cos(am) * r * .12, x + Math.sin(am) * r * .8, y - Math.cos(am) * r * .8], 14 * r / 200, '#1d1a1c');
  if (o.sec != null) { const as = o.sec / 60 * Math.PI * 2; line(c, [x, y, x + Math.sin(as) * r * .82, y - Math.cos(as) * r * .82], 5 * r / 200, '#d23a2a'); circle(c, x + Math.sin(as) * r * .62, y - Math.cos(as) * r * .62, 14 * r / 200); fs(c, '#d23a2a'); }
  circle(c, x, y, 12 * r / 200); fs(c, '#1d1a1c');
}
function graffiti(c, x, y, w, h, seed) {
  // abstract colourful shapes (no letters): blobs, hearts, stars, stripes, smiley faces
  const cols = ['#e8453c', '#f2c531', '#3fa0e0', '#5ac05a', '#e06ab0', '#ff8a2a', '#7a5ae0', '#ffffff'];
  for (let i = 0; i < 9; i++) {
    const r = rnd(seed + i), gx = x + rnd(seed + i * 3) * w, gy = y + rnd(seed + i * 5) * h, col = cols[Math.floor(rnd(seed + i * 7) * 8)], sz = 40 + rnd(seed + i * 9) * 90;
    c.save(); c.globalAlpha = .85;
    if (r < .25) { ell(c, gx, gy, sz, sz * .6, r * 3); fs(c, col, 5, shade(col, -.4)); }
    else if (r < .45) { heart(c, gx, gy, sz * .6); fs(c, col, 5, '#222'); }
    else if (r < .6) { star(c, gx, gy, sz * .7, 5, .45); fs(c, col, 5, '#222'); }
    else if (r < .8) { for (let k = 0; k < 4; k++) line(c, [gx - sz, gy + k * 22, gx + sz, gy + k * 22 - 30], 14, cols[(k + i) % 8]); }
    else { circle(c, gx, gy, sz * .6); fs(c, '#f2c531', 5, '#222'); circle(c, gx - sz * .2, gy - sz * .1, 6); fs(c, '#222'); circle(c, gx + sz * .2, gy - sz * .1, 6); fs(c, '#222'); c.beginPath(); c.arc(gx, gy + sz * .05, sz * .3, .2, Math.PI - .2); c.lineWidth = 6; c.strokeStyle = '#222'; c.stroke(); }
    c.restore();
  }
}
function walker(c, t, who, x, y, s, sc, o = {}) {
  // a toon person running/walking with a cycle
  person(c, t, P(who, x, Object.assign({ y, s, sc: PSC * sc, walk: t * (o.speed || 11) + (o.ph || 0), look: [1, 0], mouth: o.mouth || 'o', up: .4, main: o.main || 'down', off: o.off || 'down', lean: o.lean ?? .08 }, o.extra || {})));
}

// ---------------- wall, daylight ----------------
function wallDay(c, cam, t, o = {}) {
  layer(c, cam, .08, c => {
    const g = c.createLinearGradient(0, -3500, 0, -300); g.addColorStop(0, '#4f8fd8'); g.addColorStop(1, '#cfe4f2');
    c.fillStyle = g; c.fillRect(-6000, -7000, 12000, 7200);
    for (let i = 0; i < 7; i++) { const cx = -2500 + i * 800 + Math.sin(t * .2 + i) * 40, cy = -2600 + rnd(i) * 900; for (let k = 0; k < 4; k++) { circle(c, cx + k * 90, cy - (k % 2) * 40, 90 + rnd(i * 4 + k) * 40); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); } }
  });
  layer(c, cam, .35, c => {
    const B = -500;
    for (let i = 0; i < 30; i++) { const x = -3500 + i * 240, h = 300 + rnd(i + 2) * 500; c.beginPath(); c.rect(x, B - h, 230, h); fs(c, ['#c8b8a0', '#b4b8bc', '#d0c2a8'][i % 3], 2);
      for (let k = 0; k < 6; k++) { c.fillStyle = '#7a8ea0'; c.fillRect(x + 20 + (k % 3) * 70, B - h + 40 + Math.floor(k / 3) * 110, 40, 60); } }
    // bare November trees
    for (let i = 0; i < 12; i++) { const x = -3000 + i * 520; line(c, [x, B, x, B - 420], 14, '#5a4a40'); for (let k = 0; k < 6; k++) line(c, [x, B - 200 - k * 40, x + (k % 2 ? 1 : -1) * (80 + k * 12), B - 300 - k * 40], 6, '#5a4a40'); }
    c.fillStyle = '#9a9488'; c.fillRect(-6000, B, 12000, 3000);
  });
  haze(c, '220,235,250', .25);
  layer(c, cam, 1, c => {
    // death-strip sand + the wall (3,6 m) with rounded top pipe
    c.fillStyle = '#b8a890'; c.fillRect(-6000, -60, 12000, 2600);
    const WH = 790;
    for (let i = 0; i < 40; i++) { const x = -3400 + i * 270; c.beginPath(); c.rect(x, -WH, 266, WH); fs(c, '#d8d4ca', 4); c.fillStyle = 'rgba(80,70,60,.08)'; c.fillRect(x + 200, -WH, 66, WH); graffiti(c, x + 20, -WH + 160, 220, 560, i * 17); }
    c.beginPath(); c.roundRect(-3500, -WH - 60, 7000, 70, 35); fs(c, '#e4e0d6', 5);
    // chunks knocked out (holes showing rebar)
    for (const hx of [-420, 610]) { c.beginPath(); c.moveTo(hx, -300); c.lineTo(hx + 90, -330); c.lineTo(hx + 120, -230); c.lineTo(hx + 30, -200); c.closePath(); fs(c, '#6a6458', 4); line(c, [hx + 20, -300, hx + 100, -230], 4, '#8a5a3a'); }
  });
  return { base: '#cfe4f2' };
}

// ---------------- TV room + 80s clock graphic ----------------
function tvGraphic(c, x, y, w, h, t, o = {}) {
  // inside the screen: blue gradient, sweeping stripes, analog clock (no numerals), scanlines
  c.save(); c.beginPath(); c.roundRect(x, y, w, h, 40); c.clip();
  const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#0b1a6a'); g.addColorStop(1, '#2a4ad0'); c.fillStyle = g; c.fillRect(x, y, w, h);
  for (let i = 0; i < 7; i++) { c.fillStyle = `rgba(${i % 2 ? '255,200,60' : '120,220,255'},.55)`; c.fillRect(x, y + h * .68 + i * 18, w, 7); }
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(x, y + h * .2); c.lineTo(x + w, y); c.lineTo(x + w, y + h * .1); c.lineTo(x, y + h * .32); c.fill();
  stationClock(c, x + w * .5, y + h * .4, h * .26, 18, 53, { sec: (t * 6) % 60 });
  for (let yy = y; yy < y + h; yy += 6) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, yy, w, 2); }
  const vg = c.createRadialGradient(x + w / 2, y + h / 2, h * .3, x + w / 2, y + h / 2, w * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = vg; c.fillRect(x, y, w, h);
  c.restore();
}
function tvRoom(c, cam, t, o = {}) {
  layer(c, cam, .6, c => {
    // 70s wallpaper
    c.fillStyle = '#a8703a'; c.fillRect(-4000, -4000, 8000, 4000);
    for (let r = 0; r < 40; r++) for (let k = 0; k < 40; k++) { const x = -2000 + k * 110 + (r % 2) * 55, y = -2600 + r * 110; circle(c, x, y, 34); c.fillStyle = '#c48a48'; c.fill(); circle(c, x, y, 16); c.fillStyle = '#8a5428'; c.fill(); }
    // shelf with books, plant, framed picture
    c.beginPath(); c.rect(-900, -1250, 560, 30); fs(c, '#6a4428', 4);
    for (let i = 0; i < 9; i++) { c.beginPath(); c.rect(-880 + i * 44, -1400 + (i % 3) * 14, 36, 150 - (i % 3) * 14); fs(c, ['#b03a2a', '#2a5a8a', '#d8b040', '#3a7a4a'][i % 4], 3); }
    c.beginPath(); c.rect(500, -1500, 300, 220); fs(c, '#6a4428', 6); c.beginPath(); c.rect(520, -1480, 260, 180); fs(c, '#7ab0c8', 3); c.beginPath(); c.moveTo(520, -1320); c.lineTo(620, -1420); c.lineTo(700, -1350); c.lineTo(780, -1400); c.lineTo(780, -1300); c.lineTo(520, -1300); fs(c, '#4a7a4a');
    c.fillStyle = '#5a3a22'; c.fillRect(-4000, -60, 8000, 3000);
  });
  haze(c, '20,30,80', .25);
  layer(c, cam, 1, c => {
    // cabinet + CRT TV
    c.beginPath(); c.rect(-520, -380, 1040, 380); fs(c, '#6a4026', 6); for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(-490 + i * 340, -340, 300, 300); fs(c, '#7a4c2e', 4); circle(c, -350 + i * 340, -190, 12); fs(c, '#d8b060', 3); }
    c.beginPath(); c.roundRect(-440, -1080, 880, 690, 40); fs(c, '#5a3a24', 8);
    for (let i = 0; i < 12; i++) line(c, [-430, -1060 + i * 56, 430, -1056 + i * 56], 3, '#4a2e1c');
    c.beginPath(); c.roundRect(-400, -1040, 620, 610, 50); fs(c, '#1a1a1e', 7);
    tvGraphic(c, -380, -1020, 580, 570, t, o);
    c.beginPath(); c.rect(250, -1040, 160, 610); fs(c, '#3a2a1e', 5); for (let i = 0; i < 2; i++) { circle(c, 330, -940 + i * 130, 40); fs(c, '#c8c0b0', 5); line(c, [330, -940 + i * 130, 352, -960 + i * 130], 6); }
    for (let i = 0; i < 6; i++) line(c, [270, -680 + i * 30, 390, -680 + i * 30], 5, '#1a1410');
    line(c, [0, -1080, -200, -1500], 8, '#8a8a90'); line(c, [0, -1080, 220, -1480], 8, '#8a8a90'); circle(c, 0, -1084, 30); fs(c, '#2a2a2e', 5);
    // screen glow on the room
    bloom(c, -90, -735, 1100, '90,140,255', .35);
  });
  return { base: '#3a2416' };
}

// ---------------- paper close-up with glasses ----------------
function paperSheet(c, x, y, w, h, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-w / 2 + 16, -h / 2 + 20, w, h);
  c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c, '#f6f2e4', 6);
  // typed lines (no readable characters): word blocks
  for (let i = 0; i < 16; i++) { let lx = -w / 2 + 70; const ly = -h / 2 + 150 + i * 62; while (lx < w / 2 - 90) { const ww = 40 + rnd(i * 31 + lx) * 120; if (lx + ww > w / 2 - 70) break; c.fillStyle = o.hiRow === i ? '#2a2a30' : '#5a5a66'; c.fillRect(lx, ly, ww, 18); lx += ww + 22; } if (i % 5 === 4) i++; }
  // header bar + round stamp (no text)
  c.fillStyle = '#3a3a44'; c.fillRect(-w / 2 + 70, -h / 2 + 60, w * .5, 34);
  circle(c, w / 2 - 150, h / 2 - 150, 80); c.lineWidth = 10; c.strokeStyle = 'rgba(160,40,60,.55)'; c.stroke(); circle(c, w / 2 - 150, h / 2 - 150, 56); c.lineWidth = 5; c.stroke();
  c.restore();
}
function paperSet(c, cam, t, o = {}) {
  layer(c, cam, .7, c => { // green felt table + blurred-free hall far below
    c.fillStyle = '#3e5a48'; c.fillRect(-4000, -4000, 8000, 8000);
    for (let i = 0; i < 60; i++) line(c, [-3000 + i * 100, -4000, -3000 + i * 100, 4000], 2, 'rgba(255,255,255,.05)');
    // other papers and a glass on the table
    c.save(); c.translate(-700, 300); c.rotate(.3); c.beginPath(); c.rect(-300, -400, 600, 800); fs(c, '#e8e4d6', 5); c.restore();
    circle(c, 720, -200, 110); fs(c, 'rgba(200,225,240,.55)', 6); circle(c, 720, -200, 80); fs(c, 'rgba(150,190,220,.5)');
  });
  return { base: '#3e5a48' };
}
// big spectacle lens of the spokesman with Noah's reflection (world space)
function glassesCU(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // forehead/cheek skin area + brow
  c.beginPath(); c.ellipse(0, 60, 900, 520, 0, 0, Math.PI * 2); fs(c, '#fbe6cf', 8);
  c.fillStyle = '#ecc9a8'; c.beginPath(); c.ellipse(0, 330, 900, 260, 0, 0, Math.PI * 2); c.fill();
  for (const sx of [-1, 1]) {
    c.beginPath(); c.moveTo(sx * 520, -240); c.quadraticCurveTo(sx * 340, -330, sx * 120, -260); c.lineWidth = 46; c.strokeStyle = '#4a3a30'; c.lineCap = 'round'; c.stroke();
    // lens
    c.beginPath(); c.roundRect(sx * 330 - 230, -190, 460, 330, 60); fs(c, 'rgba(210,230,245,.35)', 26, '#3a3330');
    // eye behind the lens
    circle(c, sx * 320, -10, 56); fs(c, '#fff', 6); circle(c, sx * 320 + (o.look || 0) * 18, -6, 28); fs(c, '#231c2c');
    if (o.lid) { c.beginPath(); c.rect(sx * 320 - 60, -70, 120, 60 * o.lid + 10); fs(c, '#ecc9a8'); }
  }
  line(c, [-100, -40, 100, -40], 26, '#3a3330');
  // Noah reflected in the right lens: tiny figure + bright light spots, mirrored, clipped
  c.save(); c.beginPath(); c.roundRect(330 - 230, -190, 460, 330, 60); c.clip();
  c.globalAlpha = .75; c.translate(330, 120); c.scale(-1, 1); c.rotate(-.05);
  withParka(() => drawNoah(c, { x: 40, y: 0, k: .2, ink: 1.6, expr: { mouth: 'soft', browUp: .4 } }));
  c.globalAlpha = 1; c.restore();
  for (const sx of [-1, 1]) { c.save(); c.beginPath(); c.roundRect(sx * 330 - 230, -190, 460, 330, 60); c.clip(); c.globalCompositeOperation = 'screen';
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(sx * 330 - 200, -190); c.lineTo(sx * 330 - 120, -190); c.lineTo(sx * 330 - 230, 0); c.lineTo(sx * 330 - 230, -110); c.fill();
    circle(c, sx * 330 + 120, -120, 22); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); c.restore(); }
  c.restore();
}

// ---------------- East Berlin street, evening ----------------
function boxWindow(c, x, y, w, h, lit, open = 0, seed = 0) {
  c.beginPath(); c.rect(x - 14, y - 14, w + 28, h + 28); fs(c, '#a49a88', 3);
  c.beginPath(); c.rect(x, y, w, h); fs(c, lit ? '#ffcf7a' : '#2a3150', 4);
  if (lit) { bloom(c, x + w / 2, y + h / 2, w * 1.1, '255,200,120', .35); // net curtain + silhouette plant
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, h * .45); for (let k = 0; k < 6; k++) line(c, [x + k * w / 6, y, x + k * w / 6 + 6, y + h * .45], 2, 'rgba(200,170,120,.6)'); }
  // two casements; open swings the right one outward (perspective squash)
  const hw = w / 2; line(c, [x + hw, y, x + hw, y + h], 6, '#e8e2d4'); line(c, [x, y + h * .32, x + w, y + h * .32], 5, '#e8e2d4');
  if (open > 0) { const ow = hw * (1 - open * .75); c.beginPath(); c.moveTo(x + w, y - 6 * open); c.lineTo(x + w + ow * .9, y - 20 * open); c.lineTo(x + w + ow * .9, y + h + 20 * open); c.lineTo(x + w, y + h + 6 * open); c.closePath(); fs(c, 'rgba(160,190,220,.6)', 4, '#e8e2d4'); }
  c.beginPath(); c.rect(x - 22, y + h + 10, w + 44, 14); fs(c, '#b0a690', 3);
}
function eastStreet(c, cam, t, o = {}) {
  layer(c, cam, .1, c => {
    const g = c.createLinearGradient(0, -4000, 0, -600); g.addColorStop(0, P2.duskSky[0]); g.addColorStop(1, P2.duskSky[1]); c.fillStyle = g; c.fillRect(-6000, -7000, 12000, 7000);
    c.fillStyle = '#20223a'; c.fillRect(-6000, -600, 12000, 4000);
    circle(c, 900, -2900, 70); fs(c, '#f4f0d8'); bloom(c, 900, -2900, 300, '240,240,210', .3);
  });
  layer(c, cam, .3, c => { // roofs + chimneys with coal smoke
    const B = -900;
    for (let i = 0; i < 26; i++) { const x = -3500 + i * 280, h = 200 + rnd(i) * 300; c.fillStyle = '#262a46'; c.beginPath(); c.moveTo(x, B); c.lineTo(x, B - h); c.lineTo(x + 140, B - h - 120); c.lineTo(x + 280, B - h); c.lineTo(x + 280, B); c.fill();
      if (i % 2) { c.fillRect(x + 60, B - h - 160, 34, 120); for (let k = 0; k < 4; k++) { const ph = (t * .15 + k / 4 + rnd(i)) % 1; circle(c, x + 77 + ph * 120, B - h - 170 - ph * 300, 20 + ph * 50); c.fillStyle = `rgba(150,150,170,${.25 * (1 - ph)})`; c.fill(); } } }
    c.fillStyle = '#262a46'; c.fillRect(-6000, B, 12000, 4000);
  });
  haze(c, '60,70,120', .12);
  layer(c, cam, o.facadeP ?? .85, c => {
    // Altbau facade: sooty plaster, cornices, box windows, a few bullet pocks
    const X0 = -2600, X1 = 2600, B = -60, top = -3600;
    c.beginPath(); c.rect(X0, top, X1 - X0, B - top); fs(c, P2.plaster, 4);
    c.save(); c.beginPath(); c.rect(X0, top, X1 - X0, B - top); c.clip();
    for (let i = 0; i < 60; i++) { const sx = X0 + rnd(i) * (X1 - X0), sy = top + rnd(i + 9) * (B - top); c.fillStyle = P2.soot; c.beginPath(); c.ellipse(sx, sy, 30 + rnd(i + 3) * 80, 120 + rnd(i + 4) * 400, 0, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 80; i++) { circle(c, X0 + rnd(i + 200) * (X1 - X0), top + rnd(i + 300) * (B - top), 6 + rnd(i) * 8); c.fillStyle = 'rgba(70,64,58,.55)'; c.fill(); }
    c.restore();
    for (let f = 0; f < 4; f++) { const fy = -760 - f * 720; c.beginPath(); c.rect(X0 - 20, fy + 560, X1 - X0 + 40, 30); fs(c, '#a29684', 3); }
    for (let f = 0; f < 4; f++) for (let i = 0; i < 9; i++) {
      const wx = X0 + 150 + i * 560, wy = -680 - f * 720; if (Math.abs(wx + 115 - (o.doorX ?? 0)) < 300 && f === 0) continue;
      const seed = f * 9 + i, lit = rnd(seed + 5) > .3, open = (o.open || 0) * (rnd(seed + 8) > .5 ? clamp((t - (o.openT || 0) - rnd(seed) * .6) * 3) : 0);
      boxWindow(c, wx, wy, 230, 380, lit, open, seed);
      if (open > .5 && rnd(seed + 11) > .4) { // someone leaning out
        person(c, t, P(CROWD[seed % 8], wx + 115, { y: wy + 470, sc: PSC * .85, look: [rnd(seed) > .5 ? 1 : -1, .3], mouth: 'o', up: 1, main: rnd(seed) > .5 ? 'wave' : 'chest', off: 'front' })); c.beginPath(); c.rect(wx - 14, wy + 300, 258, 120); fs(c, '#a49a88', 3); }
    }
    // entrance door + stoop
    const dx = o.doorX ?? 0;
    c.beginPath(); c.rect(dx - 170, -760, 340, 700); fs(c, '#5a3a26', 5); c.beginPath(); c.arc(dx, -760, 170, Math.PI, 0); fs(c, '#4a3020', 5);
    c.beginPath(); c.rect(dx - 150, -740, 300, 660); fs(c, o.doorOpen ? '#ffcf7a' : '#6a4630', 4); if (o.doorOpen) bloom(c, dx, -400, 500, '255,200,120', .5);
    c.fillStyle = P2.plasterDark; c.fillRect(X0, B, X1 - X0, 3000);
  });
  layer(c, cam, 1, c => {
    // pavement, kerb, cobbles, tram rails
    c.fillStyle = '#4a4650'; c.fillRect(-6000, 0, 12000, 140);
    for (let i = 0; i < 80; i++) line(c, [-4000 + i * 100, 0, -4000 + i * 100 - 20, 140], 2, '#3e3a44');
    c.beginPath(); c.rect(-6000, 140, 12000, 30); fs(c, '#8a8680', 3);
    c.fillStyle = '#34323c'; c.fillRect(-6000, 170, 12000, 3000);
    for (let r = 0; r < 18; r++) for (let i = 0; i < 70; i++) { c.beginPath(); c.roundRect(-4000 + i * 116 + (r % 2) * 58, 180 + r * 40, 104, 32, 10); c.fillStyle = rnd(r * 70 + i) > .5 ? '#3e3c46' : '#46444e'; c.fill(); }
    for (const ry of [420, 520, 700, 800]) { line(c, [-6000, ry, 6000, ry], 12, '#8a8a92'); line(c, [-6000, ry - 3, 6000, ry - 3], 3, '#c8c8d0'); }
    // street lamps (sodium) + their pools of light
    for (const lx of (o.lamps || [-1300, 1200])) { line(c, [lx, 150, lx, -900], 16, OUT); line(c, [lx, 150, lx, -900], 9, '#3a3a44'); line(c, [lx, -900, lx + 160, -960], 9, '#3a3a44'); c.beginPath(); c.moveTo(lx + 120, -980); c.lineTo(lx + 220, -980); c.lineTo(lx + 200, -930); c.lineTo(lx + 140, -930); c.closePath(); fs(c, '#3a3a44', 4); ell(c, lx + 170, -928, 30, 8); fs(c, '#fff2c0');
      bloom(c, lx + 170, -930, 420, P2.lamp, .6); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(lx + 170, 300, 0, lx + 170, 300, 700); g.addColorStop(0, `rgba(${P2.lamp},.3)`); g.addColorStop(1, `rgba(${P2.lamp},0)`); c.fillStyle = g; c.fillRect(lx - 600, 0, 1500, 900); c.restore(); }
  });
  return { base: '#20223a' };
}

// ---------------- bird's-eye: crowd streaming to the border ----------------
function topPerson(c, x, y, ang, col, hair, t, ph, s = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const sw = Math.sin(t * 10 + ph) * 22;
  for (const sx of [-1, 1]) { line(c, [sx * 52, 0, sx * 58, sx * sw], 34, OUT); line(c, [sx * 52, 0, sx * 58, sx * sw], 24, col); }
  ell(c, 0, 0, 66, 40); fs(c, col, 6); circle(c, 0, -4, 34); fs(c, hair, 5);
  c.restore();
  // breath steam drifting back
  c.save(); c.globalAlpha = .18; circle(c, x - Math.sin(ang) * 0, y + 70 * s, 26 * s); c.fillStyle = '#e8eef8'; c.fill(); c.restore();
}
function topDown(c, cam, t, o = {}) {
  layer(c, cam, 1, c => {
    c.fillStyle = '#2e2c36'; c.fillRect(-6000, -9000, 12000, 18000);
    for (let r = 0; r < 120; r++) for (let i = 0; i < 26; i++) { c.beginPath(); c.roundRect(-1300 + i * 100 + (r % 2) * 50, -6000 + r * 100, 92, 92, 14); c.fillStyle = rnd(r * 26 + i) > .5 ? '#3a3842' : '#34323c'; c.fill(); }
    // pavements both sides
    for (const sx of [-1, 1]) { c.fillStyle = '#4a4650'; c.fillRect(sx > 0 ? 1300 : -2600, -9000, 1300, 18000); line(c, [sx * 1300, -9000, sx * 1300, 9000], 20, '#8a8680'); for (let i = 0; i < 90; i++) line(c, [sx > 0 ? 1300 : -2600, -6000 + i * 140, sx > 0 ? 2600 : -1300, -6000 + i * 140], 3, '#3e3a44'); }
    for (const rx of [-420, -260, 260, 420]) { line(c, [rx, -9000, rx, 9000], 14, '#8a8a92'); line(c, [rx - 3, -9000, rx - 3, 9000], 4, '#c8c8d0'); }
    // abandoned cars (doors open), some diagonal
    const cars = [[-900, -1200, .4, '#a7b8a0'], [-1050, -400, -.2, '#d8c89a'], [900, -900, -.5, '#8aa0c0'], [1000, 200, .15, '#c8705a'], [-950, 700, .3, '#e8e2d0'], [880, -2300, .2, '#a7b8a0'], [-900, -2600, -.3, '#c8705a']];
    for (const [x, y, r, col] of cars) { trabantTop(c, x, y, r, col, 1.4); c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.moveTo(105, -20); c.lineTo(220, -60); c.lineTo(225, -40); c.lineTo(110, 10); c.closePath(); fs(c, col, 5); c.restore(); }
    // lamps (glow pools)
    for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const ly = -6000 + i * 1200; bloom(c, sx * 1380, ly, 600, P2.lamp, .45); circle(c, sx * 1380, ly, 26); fs(c, '#fff2c0', 4); }
    // the stream of people moving "up" the frame
    for (let i = 0; i < (o.n || 160); i++) {
      const lane = (rnd(i) - .5) * 2300, sp = 160 + rnd(i + 5) * 90, y = ((rnd(i + 9) * 9000 - t * sp) % 9000 + 9000) % 9000 - 6000;
      const col = ['#4a5a7a', '#9a4a5a', '#4f7a5a', '#7a6a52', '#3f6f7a', '#c8843a', '#5a4a3a', '#c0a060', '#6a3a5a'][i % 9], hair = ['#2b2326', '#5a3b26', '#e8c060', '#b04040', '#4a6aa0', '#9a9496'][i % 6];
      topPerson(c, lane, y, -.05 + (rnd(i + 2) - .5) * .3, col, hair, t, i, .9 + rnd(i + 3) * .2);
    }
    if (o.noah) { // Noah from above: olive shoulders, swept-back brown hair
      const nx = o.noah[0], ny = o.noah[1] - t * 200; topPerson(c, nx, ny, -.08, PARKA.olive, NOAH.hair, t, 0, 1.15); c.save(); c.translate(nx, ny - 4); for (let k = -2; k <= 2; k++) line(c, [k * 10, -30, k * 13, 30], 4, NOAH.hairLight); c.restore(); }
  });
  return { base: '#2e2c36' };
}

// ---------------- guard hut interior ----------------
function hutInside(c, cam, t, o = {}) {
  layer(c, cam, .9, c => {
    c.fillStyle = '#b8b49a'; c.fillRect(-4000, -4000, 8000, 4000); c.fillStyle = '#8a8670'; c.fillRect(-4000, -520, 8000, 460);
    line(c, [-4000, -520, 4000, -520], 10, '#6a664e');
    // window onto the crowd + floodlight
    const wx = -760, wy = -900, ww = 760, wh = 520;
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
    c.fillStyle = '#1a2050'; c.fillRect(wx, wy, ww, wh); bloom(c, wx + 700, wy + 80, 400, BN.sodium, .8);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const px = wx + 40 + i * 120 + (r % 2) * 60, py = wy + 240 + r * 100, ph = t * 7 + i + r; circle(c, px, py - Math.abs(Math.sin(ph)) * 10, 46); fs(c, ['#f6dcae', '#eac38c', '#fbe6cf'][i % 3], 4); c.beginPath(); c.rect(px - 60, py + 40, 120, 200); fs(c, ['#4a5a7a', '#9a4a5a', '#4f7a5a', '#7a6a52'][(i + r) % 4], 4);
      if ((i + r) % 3 === 0) { line(c, [px + 40, py + 40, px + 60, py - 90 - Math.abs(Math.sin(ph)) * 30], 22); circle(c, px + 60, py - 100 - Math.abs(Math.sin(ph)) * 30, 18); fs(c, '#f6dcae', 4); } }
    c.restore();
    c.beginPath(); c.rect(wx, wy, ww, wh); fs(c, null, 18, '#e8e4d8'); line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 12, '#e8e4d8');
    // map board (shapes only) + wall calendar-less notice board
    c.beginPath(); c.rect(150, -880, 520, 380); fs(c, '#d8d0b0', 6); c.beginPath(); c.moveTo(190, -540); c.bezierCurveTo(300, -800, 480, -620, 640, -840); c.lineWidth = 14; c.strokeStyle = '#4a7ab0'; c.stroke(); for (let i = 0; i < 6; i++) { circle(c, 200 + rnd(i) * 440, -850 + rnd(i + 3) * 300, 10); fs(c, '#c83a2a', 3); }
    // hanging lamp
    line(c, [-100, -4000, -100, -1750], 5); c.beginPath(); c.moveTo(-200, -1650); c.lineTo(0, -1650); c.lineTo(-40, -1750); c.lineTo(-160, -1750); c.closePath(); fs(c, '#3a5a3a', 4); bloom(c, -100, -1640, 900, '255,230,170', .55);
    c.fillStyle = '#5a5444'; c.fillRect(-4000, -60, 8000, 3000);
  });
  return { base: '#5a5444' };
}
function hutDesk(c, t, o = {}) {
  // desk with rotary phone base, papers, ashtray, lamp
  c.beginPath(); c.rect(-700, -170, 1400, 40); fs(c, '#6a5a40', 5); c.beginPath(); c.rect(-680, -130, 1360, 400); fs(c, '#5a4a34', 5);
  c.beginPath(); c.moveTo(150, -175); c.lineTo(330, -175); c.lineTo(310, -260); c.lineTo(170, -260); c.closePath(); fs(c, '#3a3a36', 5);
  circle(c, 240, -222, 34); fs(c, '#d8d0c0', 4); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 1.6 + .6; circle(c, 240 + Math.cos(a + (o.dial || 0)) * 22, -222 + Math.sin(a + (o.dial || 0)) * 22, 5); fs(c, '#3a3a36'); }
  if (o.cord) { c.beginPath(); c.moveTo(170, -200); for (let i = 0; i < 14; i++) c.quadraticCurveTo(140 - i * 8, -230 + i * 6 + (i % 2 ? 14 : -14), o.cord[0] * i / 14 + 150 * (1 - i / 14), o.cord[1] * i / 14 - 200 * (1 - i / 14)); c.lineWidth = 5; c.strokeStyle = '#2a2a26'; c.stroke(); }
  c.save(); c.translate(-350, -172); c.rotate(-.06); c.beginPath(); c.rect(-140, -10, 280, 14); fs(c, '#f4f1e6', 3); c.restore();
  ell(c, -560, -174, 44, 12); fs(c, '#8a8a90', 4);
}

// ---------------- West side, night ----------------
function neonShape(c, kind, x, y, s, col, on) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath();
  if (kind === 'glass') { c.moveTo(-60, -60); c.lineTo(60, -60); c.lineTo(0, 10); c.closePath(); c.moveTo(0, 10); c.lineTo(0, 70); c.moveTo(-34, 70); c.lineTo(34, 70); }
  else if (kind === 'star') { star(c, 0, 0, 70, 5, .45); }
  else if (kind === 'heart') { heart(c, 0, 0, 60); }
  else if (kind === 'arrow') { c.moveTo(-90, 0); c.lineTo(80, 0); c.moveTo(40, -40); c.lineTo(80, 0); c.lineTo(40, 40); }
  else if (kind === 'note') { c.moveTo(-30, 50); c.lineTo(-30, -60); c.lineTo(50, -80); c.lineTo(50, 30); c.moveTo(-30, -30); c.lineTo(50, -50); }
  c.lineWidth = 16; c.strokeStyle = on ? '#fff' : shade(col, -.4); c.stroke(); c.lineWidth = 8; c.strokeStyle = on ? col : shade(col, -.3); c.stroke();
  c.restore();
  if (on) bloom(c, x, y, 220 * s, hexRgb(col), .7);
}
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; }
function westNight(c, cam, t, o = {}) {
  layer(c, cam, .1, c => { const g = c.createLinearGradient(0, -4000, 0, -500); g.addColorStop(0, '#0a0c24'); g.addColorStop(1, '#3a2450'); c.fillStyle = g; c.fillRect(-6000, -7000, 12000, 8000); });
  layer(c, cam, .5, c => {
    const B = -150;
    for (let i = 0; i < 16; i++) { const x = -3200 + i * 420, h = 1400 + rnd(i) * 900; c.beginPath(); c.rect(x, B - h, 400, h); fs(c, ['#2a2440', '#33284a', '#24203a'][i % 3], 3);
      for (let k = 0; k < 12; k++) { c.fillStyle = rnd(i * 12 + k) > .5 ? '#ffd27a' : '#4a4a7a'; c.fillRect(x + 40 + (k % 3) * 120, B - h + 80 + Math.floor(k / 3) * 220, 70, 110); } }
    const kinds = ['glass', 'star', 'heart', 'arrow', 'note'], cols = ['#ff3aa0', '#3ae0ff', '#ffe03a', '#ff6a3a', '#7aff6a'];
    for (let i = 0; i < 9; i++) neonShape(c, kinds[i % 5], -1800 + i * 450, -1100 - (i % 3) * 260, 1.3, cols[i % 5], Math.sin(t * 5 + i * 2.3) > -.6);
    // awnings with bulb strings
    for (let i = 0; i < 40; i++) { const x = -2400 + i * 120, y = -560 + Math.sin(i * .5) * 30; circle(c, x, y, 12); fs(c, i % 2 ? '#fff2a0' : '#ffb0d0', 3); bloom(c, x, y, 60, '255,240,170', .5); }
    c.fillStyle = '#2a2236'; c.fillRect(-6000, B, 12000, 3000);
  });
  haze(c, '120,60,140', .1);
  layer(c, cam, 1, c => {
    c.fillStyle = '#2c2838'; c.fillRect(-6000, -200, 12000, 4000);
    for (let i = 0; i < 40; i++) { c.save(); c.globalCompositeOperation = 'screen'; const x = -2400 + i * 140; c.fillStyle = `rgba(${['255,58,160', '58,224,255', '255,224,58'][i % 3]},.08)`; c.fillRect(x, -100, 40, 900); c.restore(); }
    if (o.crowd !== false) { crowdRow(c, t, -120, .6, -1400, 1400, 91, { cheer: .7, steam: false }); crowdRow(c, t, -60, .8, -1200, 1300, 97, { cheer: .6, steam: false }); }
  });
  return { base: '#2a2236' };
}
// confetti + champagne spray (world space)
function confetti(c, t, x0, x1, y0, y1, n = 60) {
  for (let i = 0; i < n; i++) { const ph = (t * (.25 + rnd(i) * .2) + rnd(i + 4)) % 1, x = x0 + rnd(i + 8) * (x1 - x0) + Math.sin(t * 3 + i) * 40, y = y0 + ph * (y1 - y0);
    c.save(); c.translate(x, y); c.rotate(t * 4 + i); c.fillStyle = ['#ff3a6a', '#ffe03a', '#3ad0ff', '#7aff6a', '#ffffff'][i % 5]; c.fillRect(-10, -5, 20, 10); c.restore(); }
}
function spray(c, x, y, ang, k, t) {
  if (k <= 0) return;
  for (let i = 0; i < 40; i++) { const d = rnd(i) * 600 * k, a = ang + (rnd(i + 3) - .5) * .5, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + d * d * .0008; circle(c, px, py, 6 + rnd(i + 6) * 10); c.fillStyle = `rgba(255,250,210,${.8 * (1 - d / 650)})`; c.fill(); }
  bloom(c, x, y, 160, '255,250,220', .6 * k);
}
