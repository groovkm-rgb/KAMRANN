// bedroomNight, hildeExterior (city night + Noah's restaurant facade), ceremonyHall (Frankfurt), closedStreet,
// rainWindow (Oma's photo), livingRoom (mother). World units, floor y = 0.
function bedroomNight(c, cam, t, o = {}) {
  const HZ = o.hz ?? -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0d1020'; c.fillRect(0, 0, W, H);
  layer(c, cam, .8, c => { c.translate(0, B(.8)); c.scale(.58, .58); const b = 0;
    c.fillStyle = '#1c2238'; c.fillRect(-7000, b - 2600, 14000, 2700); c.fillStyle = '#232a44'; for (let x = -7000; x < 7000; x += 120) c.fillRect(x, b - 2600, 3, 2700);
    // window with moon and city lights
    const wx = -900, wy = b - 1150, ww = 560, wh = 640; c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); c.fillStyle = '#0a1030'; c.fillRect(wx, wy, ww, wh); for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(255,255,255,${.3 + rnd(i) * .6})`; c.fillRect(wx + rnd(i + 3) * ww, wy + rnd(i + 5) * wh * .5, 3, 3); } c.beginPath(); c.arc(wx + 400, wy + 140, 50, 0, Math.PI * 2); c.fillStyle = '#eef2ff'; c.fill(); bloom(c, wx + 400, wy + 140, 220, '180,200,255', .6);
    for (let i = 0; i < 6; i++) { const bh = 200 + rnd(i + 9) * 260; c.fillStyle = '#161c3a'; c.fillRect(wx + i * 100, wy + wh - bh, 90, bh); for (let r = 0; r < 6; r++) if (rnd(i * 7 + r) > .6) { c.fillStyle = '#ffd98a'; c.fillRect(wx + i * 100 + 20, wy + wh - bh + 20 + r * 40, 16, 20); } } c.restore();
    c.beginPath(); c.rect(wx, wy, ww, wh); c.lineWidth = 18; c.strokeStyle = '#3a4260'; c.stroke(); line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 10, '#3a4260');
    for (const s of [0, 1]) { c.beginPath(); c.moveTo(wx + s * ww + (s ? 10 : -10), wy - 40); c.lineTo(wx + s * ww + (s ? 160 : -160), wy - 40); c.lineTo(wx + s * ww + (s ? 140 : -140), wy + wh + 80); c.lineTo(wx + s * ww + (s ? 30 : -30), wy + wh + 80); c.closePath(); fs(c, '#2a3048', 2); }
    // shelf with books, framed photo, poster
    c.beginPath(); c.rect(300, b - 1000, 700, 18); fs(c, '#3a3040', 2); for (let i = 0; i < 12; i++) { c.beginPath(); c.rect(320 + i * 46, b - 1000 - 90 - (i % 3) * 14, 38, 90 + (i % 3) * 14); fs(c, ['#5a3a4a', '#3a4a6a', '#6a5a3a', '#2a4a3a'][i % 4], 1.5); }
    c.beginPath(); c.rect(1300, b - 1200, 340, 460); fs(c, '#2a2e44', 3); c.font = hudFont(34); c.fillStyle = '#8a90b0'; c.textAlign = 'center'; c.fillText('KOCHEN', 1470, b - 1120); circle(c, 1470, b - 950, 90); fs(c, '#3a4060', 2);
    c.beginPath(); c.rect(-2200, b - 1200, 700, 1200); fs(c, '#232840', 3); line(c, [-1850, b - 1200, -1850, b], 3); circle(c, -1880, b - 600, 10); fs(c, '#6a7090', 1); circle(c, -1820, b - 600, 10); fs(c, '#6a7090', 1);
  });
  haze(c, '20,25,60', .25);
  layer(c, cam, 1, c => { const y0 = layerBase(cam, HZ, 1); c.fillStyle = '#141828'; c.fillRect(cam.x - 5000, y0, 10000, 3000);
    // bed with rumpled blanket (Noah sits/lies in it, drawn by the scene)
    c.beginPath(); c.rect(-700, -380, 40, 380); fs(c, '#3a3048', 3); c.beginPath(); c.roundRect(-680, -160, 1000, 160, 10); fs(c, '#2c2a40', 3);
    c.beginPath(); c.roundRect(-640, -240, 260, 90, 30); fs(c, '#cfd4e8', 3);
    // night stand with clock 03:12, glass of water
    c.beginPath(); c.rect(400, -220, 220, 220); fs(c, '#3a3048', 3); c.beginPath(); c.rect(430, -300, 120, 76); fs(c, '#141414', 2); c.font = hudFont(34); c.fillStyle = '#ff4a3a'; c.textAlign = 'center'; c.fillText('03:12', 490, -248); bloom(c, 490, -260, 90, '255,70,50', .35); waterGlass(c, 580, -222, .9);
    if (o.blanket) o.blanket(c);
  });
  return { base: '#0d1020' };
}
// Noah's restaurant facade (world, centred at x, ground y = 0)
function hildeFacade(c, x, t, o = {}) {
  const lit = o.lit ?? 1, w = 1500;
  c.save(); c.translate(x, 0);
  c.beginPath(); c.rect(-w / 2, -1700, w, 1700); fs(c, '#d8c8a8', 3); for (let y = -1700; y < 0; y += 60) line(c, [-w / 2, y, w / 2, y], 1.5, 'rgba(120,100,70,.3)');
  stuccoBand(c, -w / 2, w / 2, -720, 50);
  for (let i = 0; i < 3; i++) { const wx = -500 + i * 500; c.beginPath(); c.rect(wx - 110, -1500, 220, 380); fs(c, o.night ? (rnd(i + 4) > .5 ? '#ffd98a' : '#283050') : '#9cc9e4', 3); line(c, [wx, -1500, wx, -1120], 6, '#f2eee4'); c.beginPath(); c.rect(wx - 130, -1110, 260, 22); fs(c, '#eae2d0', 2); c.beginPath(); c.moveTo(wx - 140, -1510); c.quadraticCurveTo(wx, -1590, wx + 140, -1510); fs(c, '#eae2d0', 2); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(wx - 90 + k * 60, -1090, 16, 0, Math.PI * 2); fs(c, ['#e0506a', '#4f8f50'][k % 2], 1.5); } }
  // ground floor: big windows with warm interior + guests silhouettes, door, sign
  for (const wx of [-480, 380]) { c.beginPath(); c.rect(wx - 230, -620, 460, 520); fs(c, o.night ? `rgba(255,${190 + lit * 30},${110 + lit * 30},1)` : '#a9cfe4', 3); c.save(); c.beginPath(); c.rect(wx - 230, -620, 460, 520); c.clip();
      if (o.night) { c.fillStyle = `rgba(60,30,20,${1 - lit * .5})`; c.fillRect(wx - 230, -620, 460, 520); for (let i = 0; i < 3; i++) { chandelier(c, wx - 140 + i * 140, -480, .35, t + i, lit > .5); } for (let i = 0; i < (o.guests ?? 4); i++) { c.beginPath(); c.arc(wx - 170 + i * 110, -250, 34, 0, Math.PI * 2); c.fillStyle = 'rgba(60,30,30,.6)'; c.fill(); c.beginPath(); c.rect(wx - 200 + i * 110, -220, 60, 120); c.fill(); } c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(wx - 230, -200, 460, 30); }
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(wx - 200, -620); c.lineTo(wx - 120, -620); c.lineTo(wx - 260, -100); c.lineTo(wx - 340, -100); c.fill(); c.restore();
    line(c, [wx, -620, wx, -100], 8, '#3a2418'); c.beginPath(); c.rect(wx - 250, -110, 500, 110); fs(c, '#4a2c1c', 3); if (o.night) bloom(c, wx, -360, 420, '255,190,110', .4 * lit); }
  c.beginPath(); c.rect(-90, -640, 180, 640); fs(c, '#3a2418', 3); c.beginPath(); c.rect(-60, -600, 120, 300); fs(c, o.night ? '#ffd98a' : '#bcdcee', 2); circle(c, 60, -300, 9); fs(c, '#c9a24a', 2);
  if (o.note) { c.save(); c.translate(0, -440); c.rotate(.04); c.beginPath(); c.rect(-52, -60, 104, 120); fs(c, '#fffdf4', 2); c.font = hudFont(13); c.fillStyle = '#2a2a2a'; c.textAlign = 'center'; ['Wir sagen', 'Danke für', 'die schöne', 'Zeit.'].forEach((s, i) => c.fillText(s, 0, -30 + i * 20)); c.restore(); }
  // sign
  c.beginPath(); c.rect(-560, -820, 1120, 150); fs(c, '#1e2a24', 4); c.beginPath(); c.rect(-540, -804, 1080, 118); fs(c, null, 2, '#c9a24a');
  c.font = hudFont(78); c.textAlign = 'center'; c.fillStyle = o.night ? '#ffe2a0' : '#e8c878'; c.fillText(o.sign || 'HILDE – Restaurant', 0, -712); if (o.night) { c.save(); c.globalCompositeOperation = 'screen'; c.font = hudFont(78); c.fillStyle = 'rgba(255,200,110,.35)'; for (const d of [-3, 3]) c.fillText(o.sign || 'HILDE – Restaurant', d, -712 + d); c.restore(); bloom(c, 0, -745, 700, '255,200,120', .35); }
  if (o.star) { star(c, 470, -745, 40, 5, .45); fs(c, '#e8b84a', 3); }
  for (const lx of [-620, 620]) { line(c, [lx, -880, lx, -820], 5); c.beginPath(); c.moveTo(lx - 26, -820); c.lineTo(lx + 26, -820); c.lineTo(lx + 18, -790); c.lineTo(lx - 18, -790); c.closePath(); fs(c, '#2a2a2a', 2); if (o.night) bloom(c, lx, -780, 160, '255,210,140', .6); }
  // sidewalk props: menu board, planters
  if (o.board) { c.save(); c.translate(-760, 0); line(c, [-70, 0, -40, -300], 9, '#5a3a24'); line(c, [70, 0, 40, -300], 9, '#5a3a24'); c.beginPath(); c.rect(-75, -320, 150, 200); fs(c, '#2a2e2a', 3); c.font = hudFont(20); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(o.board[0], 0, -280); c.font = hudFont(30); c.fillStyle = '#ffd36a'; c.fillText(o.board[1], 0, -230); c.font = hudFont(16); c.fillStyle = '#e8e8e8'; c.fillText(o.board[2] || '', 0, -190); c.restore(); }
  for (const px of [-680, 680]) { c.beginPath(); c.rect(px - 60, -110, 120, 110); fs(c, '#5a5a5e', 2.5); bigPlant(c, px, -100, .35, t); }
  c.restore();
}
function hildeExterior(c, cam, t, o = {}) {
  const r = city(c, cam, t, { tod: o.tod || 'night', seed: o.seed || 3 }) || {};
  layer(c, cam, 1, c2 => hildeFacade(c2, o.x ?? 0, t, Object.assign({ night: (o.tod || 'night') === 'night' }, o)));
  return r;
}
// ---------------- Frankfurt ceremony hall ----------------
function ceremonyHall(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0a14'; c.fillRect(0, 0, W, H);
  const HZ = -420, B = p => layerBase(cam, HZ, p);
  layer(c, cam, .6, c => { c.translate(0, B(.6)); c.scale(.7, .7);
    // stage backdrop: dark velvet, star pattern, big screen with text
    c.fillStyle = '#1a1030'; c.fillRect(-5000, -2400, 10000, 2500); for (let i = 0; i < 160; i++) { const x = -4000 + rnd(i + 1) * 8000, y = -2300 + rnd(i + 2) * 1700, a = .3 + .5 * Math.sin(t * 2 + i); star(c, x, y, 6 + rnd(i) * 8, 5, .45); c.fillStyle = `rgba(255,230,160,${a})`; c.fill(); }
    for (let x = -5000; x < 5000; x += 160) { const g = c.createLinearGradient(x, 0, x + 160, 0); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.5, 'rgba(120,60,140,.12)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(x, -2400, 160, 2500); }
    c.save(); c.translate(0, 520); c.beginPath(); c.rect(-900, -1900, 1800, 900); fs(c, '#120c20', 6); c.save(); c.beginPath(); c.rect(-880, -1880, 1760, 860); c.clip(); const g = c.createRadialGradient(0, -1450, 50, 0, -1450, 900); g.addColorStop(0, '#3a2a60'); g.addColorStop(1, '#100a1e'); c.fillStyle = g; c.fillRect(-880, -1880, 1760, 860);
    c.font = hudFont(64); c.fillStyle = '#e8c878'; c.textAlign = 'center'; c.fillText('STERNE-VERLEIHUNG 2026', 0, -1620); c.font = hudFont(44); c.fillStyle = '#d8d0e8'; c.fillText('Frankfurt am Main', 0, -1540);
    if (o.screen) o.screen(c); else { for (let k = 0; k < 3; k++) { star(c, -160 + k * 160, -1300, 60, 5, .45); fs(c, '#e8b84a', 3); } } c.restore(); c.restore();
    // stage with steps, lectern, flower arrangements
    c.beginPath(); c.rect(-3000, -260, 6000, 260); fs(c, '#2a1a24', 4); line(c, [-3000, -260, 3000, -260], 8, '#c9a24a'); for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(-700 + i * 40, -60 * (i + 1) + 180, 1400 - i * 80, 60); }
    c.beginPath(); c.moveTo(560, -260); c.lineTo(540, -700); c.lineTo(760, -700); c.lineTo(740, -260); c.closePath(); fs(c, '#3a2a3a', 3); c.beginPath(); c.rect(520, -730, 260, 40); fs(c, '#c9a24a', 2); line(c, [650, -730, 620, -820], 5, '#222');
    if (o.host) o.host(c);
    for (const fx of [-1100, 1100]) { c.beginPath(); c.rect(fx - 80, -420, 160, 160); fs(c, '#d8c8a0', 3); for (let i = 0; i < 9; i++) clayBlob(c, fx - 80 + (i % 3) * 80, -470 - Math.floor(i / 3) * 50, 44, 34, ['#f4f1ea', '#e0506a', '#f2c94a'][i % 3], { seed: 200 + i }); }
    // stage spotlight cans on a truss
    line(c, [-3000, -2300, 3000, -2300], 22, '#3a3a44'); for (let i = -6; i <= 6; i++) { c.beginPath(); c.rect(i * 420 - 30, -2290, 60, 90); fs(c, '#222', 3); }
  });
  haze(c, '60,40,100', .2);
  // audience rows of chefs in white jackets (mid layers), backs of heads in front row facing the stage? -> faces to camera
  for (const [p, yy, sc, n, off] of [[.8, -260, .82, 12, 0], [.9, -140, .9, 10, 90]]) {
    const b = layerBase(cam, yy, p);
    layer(c, cam, p, c => { c.save(); c.translate(0, b); c.scale(sc, sc);
      for (let i = 0; i < n; i++) { const x = (i - n / 2) * 230 + off; if (o.gap && Math.abs(x * sc - o.gap) < 140 && p === .9) continue; c.beginPath(); c.rect(x - 80, -130, 160, 130); fs(c, '#3a1a2a', 2);
        drawPerson(c, { x, sit: true, seatH: 300, k: .25, who: Object.assign({}, PEOPLE.guest(i * 3 + Math.round(p * 10)), { top: { type: 'chef', col: '#fbfaf6' }, hat: null }), t, seed: i + p * 30, expr: { mouth: o.cheer ? 'grin' : 'soft', look: o.lookX ?? 0 }, arms: o.clap ? { l: { a: .5 + Math.abs(Math.sin(t * 9 + i)) * .3, b: -1.6 }, r: { a: .5 + Math.abs(Math.sin(t * 9 + i)) * .3, b: -1.6 } } : { l: { a: .3, b: -.8 }, r: { a: .3, b: -.8 } } });
        c.beginPath(); c.rect(x - 90, -70, 180, 70); fs(c, '#4a2030', 2); }
      if (p === .9 && o.noah) o.noah(c);
      c.restore(); });
  }
  return { base: '#0b0a14' };
}
function ceremonyLight(c, cam, t, o = {}) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) { const sx = W * (.1 + i * .2) + Math.sin(t * .4 + i) * 60, tx = W * (.5 + Math.sin(t * .3 + i * 1.3) * .35); const g = c.createLinearGradient(sx, 0, tx, H); g.addColorStop(0, 'rgba(200,180,255,.28)'); g.addColorStop(1, 'rgba(200,180,255,0)'); c.beginPath(); c.moveTo(sx - 20, -10); c.lineTo(sx + 20, -10); c.lineTo(tx + 180, H); c.lineTo(tx - 180, H); c.closePath(); c.fillStyle = g; c.fill(); }
  if (o.spot) { const [x, y] = o.spot; const g = c.createLinearGradient(x, 0, x, y + 300); g.addColorStop(0, 'rgba(255,240,200,.5)'); g.addColorStop(1, 'rgba(255,240,200,.12)'); c.beginPath(); c.moveTo(x - 40, 0); c.lineTo(x + 40, 0); c.lineTo(x + 300, y + 300); c.lineTo(x - 300, y + 300); c.closePath(); c.fillStyle = g; c.fill(); bloom(c, x, y, 400, '255,240,200', .4); }
  c.restore(); motes(c, 0, W, 0, H, t, { n: 40, alpha: .4, color: '220,210,255' });
  grade(c, { sx: .5, sy: 0, warm: '255,220,170', warmA: .25, cool: '30,10,60', coolA: .45 });
}
// ---------------- closed restaurants street (day) ----------------
function closedStreet(c, cam, t, o = {}) {
  const r = city(c, cam, t, { tod: o.tod || 'day', seed: 9 }) || {};
  layer(c, cam, 1, c => { for (let i = -3; i <= 3; i++) { const x = i * 700; c.save(); c.translate(x, 0);
    c.beginPath(); c.rect(-320, -760, 640, 760); fs(c, ['#c9b49a', '#b8a088', '#d4c4a8'][(i + 3) % 3], 3);
    c.beginPath(); c.rect(-280, -720, 560, 110); fs(c, '#3a3a3a', 3); c.font = hudFont(44); c.fillStyle = '#d8c8a0'; c.textAlign = 'center'; c.fillText(['Trattoria Sole', 'Zum Anker', 'Café Lena', 'Bistro 7', 'Gasthaus Linde', 'Le Petit', 'Sushi Mori'][(i + 3) % 7], 0, -648);
    c.beginPath(); c.rect(-260, -580, 520, 480); fs(c, '#7a8088', 3); for (let k = 0; k < 16; k++) line(c, [-260, -570 + k * 30, 260, -570 + k * 30], 3, '#5a6068'); // shutter
    for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(-200 + rnd(i * 9 + k) * 400, -540 + rnd(i * 7 + k) * 400, 30 + rnd(k) * 30, 0, 6.3); c.lineWidth = 5; c.strokeStyle = ['rgba(200,60,60,.5)', 'rgba(60,120,200,.5)'][k % 2]; c.stroke(); } // graffiti
    c.save(); c.translate(-60 + i * 10, -380); c.rotate((rnd(i) - .5) * .12); c.beginPath(); c.rect(-90, -70, 180, 140); fs(c, '#fffdf4', 2); c.font = hudFont(17); c.fillStyle = '#2a2a2a'; c.textAlign = 'center'; (i % 2 ? ['Geschlossen.', 'Danke für', 'alles!'] : ['Wir sagen Danke', 'für die', 'schöne Zeit.']).forEach((s, j) => c.fillText(s, 0, -30 + j * 26)); c.restore();
    if (i % 3 === 0) { c.save(); c.translate(150, -200); c.beginPath(); c.rect(-70, -40, 140, 80); fs(c, '#ffe14a', 2); c.font = hudFont(16); c.fillStyle = '#c0392b'; c.textAlign = 'center'; c.fillText('ZU VERMIETEN', 0, 6); c.restore(); }
    c.beginPath(); c.rect(-330, -100, 660, 100); fs(c, '#6a6a6a', 2); c.restore(); } });
  return r;
}
// ---------------- rainy window with Oma's photo ----------------
function rainWindow(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#5a6068'; c.fillRect(0, 0, W, H);
  layer(c, cam, .6, c => { const g = c.createLinearGradient(0, -1400, 0, 400); g.addColorStop(0, '#7a828c'); g.addColorStop(1, '#a8b0b8'); c.fillStyle = g; c.fillRect(-3000, -1400, 6000, 1800); for (let i = 0; i < 8; i++) { c.fillStyle = '#6a727c'; c.fillRect(-1600 + i * 420, -700 - rnd(i) * 400, 360, 1200); for (let r = 0; r < 10; r++) for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(200,210,220,.35)'; c.fillRect(-1560 + i * 420 + k * 110, -660 - rnd(i) * 400 + r * 110, 60, 70); } } });
  layer(c, cam, 1, c => {
    // rain on the glass
    for (let i = 0; i < 120; i++) { const x = -1200 + rnd(i + 1) * 2400, sp = 80 + rnd(i + 2) * 200, y = ((rnd(i + 3) * 2000 + t * sp) % 1600) - 1200; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 30 + rnd(i) * 40); c.lineWidth = 3; c.strokeStyle = 'rgba(220,230,240,.55)'; c.stroke(); c.beginPath(); c.arc(x - 3, y + 34 + rnd(i) * 40, 5, 0, Math.PI * 2); c.fillStyle = 'rgba(230,240,250,.6)'; c.fill(); }
    for (let i = 0; i < 160; i++) { c.beginPath(); c.arc(-1200 + rnd(i + 50) * 2400, -1200 + rnd(i + 60) * 1200, 3 + rnd(i) * 6, 0, Math.PI * 2); c.fillStyle = 'rgba(230,240,250,.35)'; c.fill(); }
    // window frame + sill
    c.lineWidth = 60; c.strokeStyle = '#e8e4dc'; c.strokeRect(-1200, -1300, 2400, 1240); line(c, [0, -1300, 0, -60], 40, '#e8e4dc'); c.beginPath(); c.rect(-1300, -60, 2600, 80); fs(c, '#ddd6c8', 3); c.beginPath(); c.rect(-1300, 20, 2600, 600); fs(c, '#cfc6b4', 3);
    // photo of Oma in a frame, candle, small flowers
    c.save(); c.translate(-180, -60); c.rotate(-.05); c.beginPath(); c.rect(-150, -380, 300, 380); fs(c, '#6a4a2a', 4); c.beginPath(); c.rect(-120, -350, 240, 320); c.fillStyle = '#e8dcc0'; c.fill();
    c.save(); c.beginPath(); c.rect(-120, -350, 240, 320); c.clip(); c.filter = 'sepia(.6)'; drawPerson(c, { x: 0, y: 260, k: .3, who: PEOPLE.oma, t: 0, seed: 1, expr: { mouth: 'smile', lid: .1, eyes: 'open' }, bob: 0 }); c.filter = 'none'; c.fillStyle = 'rgba(200,170,120,.25)'; c.fillRect(-120, -350, 240, 320); c.restore();
    line(c, [80, -20, 150, 30], 10, '#1a1a1a'); c.beginPath(); c.moveTo(80, -380); c.lineTo(150, -380); c.lineTo(150, -320); c.closePath(); c.fillStyle = '#1a1a1a'; c.fill(); c.restore();
    candle(c, 180, -60, t, 1.6); clayFlowers(c, 340, -60, 1.6, ['#f4f1ea', '#c8a0d8', '#f4f1ea']);
  });
  return { base: '#5a6068' };
}
function rainLight(c) { grade(c, { sx: .6, sy: .5, warm: '255,200,130', warmA: .2, cool: '40,50,70', coolA: .4 }); c.save(); c.fillStyle = 'rgba(60,70,90,.18)'; c.fillRect(0, 0, W, H); c.restore(); }
// ---------------- living room (mother) ----------------
function livingRoom(c, cam, t, o = {}) {
  const HZ = o.hz ?? -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#e4d4c0'; c.fillRect(0, 0, W, H);
  layer(c, cam, .8, c => { c.translate(0, B(.8)); c.scale(.58, .58); const b = 0;
    c.fillStyle = '#e8d8c2'; c.fillRect(-7000, b - 2600, 14000, 2700); for (let x = -7000; x < 7000; x += 160) { c.fillStyle = 'rgba(160,120,90,.1)'; c.fillRect(x, b - 2600, 70, 2600); } c.beginPath(); c.rect(-7000, b - 300, 14000, 300); fs(c, '#c8a888', 3); for (let x = -7000; x < 7000; x += 260) { c.beginPath(); c.rect(x + 20, b - 270, 220, 230); fs(c, null, 2, 'rgba(90,60,30,.35)'); }
    const wx = 600, wy = b - 1200, ww = 600, wh = 720; c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#b8d4e8'); g.addColorStop(1, '#eaf2f4'); c.fillStyle = g; c.fillRect(wx, wy, ww, wh); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(wx + 100 + i * 140, wy + wh - 60, 90, 0, Math.PI * 2); c.fillStyle = '#8ab07a'; c.fill(); } c.restore(); c.beginPath(); c.rect(wx, wy, ww, wh); c.lineWidth = 18; c.strokeStyle = '#fff'; c.stroke(); line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 10, '#fff');
    for (const s of [0, 1]) { c.beginPath(); c.moveTo(wx + s * ww, wy - 40); c.lineTo(wx + s * ww + (s ? 140 : -140), wy - 40); c.lineTo(wx + s * ww + (s ? 120 : -120), wy + wh + 100); c.lineTo(wx + s * ww, wy + wh + 100); c.closePath(); fs(c, '#a8c4b0', 2); }
    // framed family photos, bookshelf, standing lamp
    for (let i = 0; i < 5; i++) { const fx = -1400 + i * 200, fy = b - 1000 + (i % 2) * 120; c.beginPath(); c.rect(fx, fy, 150, 120 + (i % 3) * 20); fs(c, '#8a6a4a', 3); c.beginPath(); c.rect(fx + 12, fy + 12, 126, 96 + (i % 3) * 20); c.fillStyle = ['#c8d8e8', '#e8d8c0', '#d8e8d0'][i % 3]; c.fill(); circle(c, fx + 75, fy + 60, 22); fs(c, '#fff', 2); }
    // more wall decor across the room: clock, painting, second window, plant shelf, coat rack
    circle(c, -500, b - 1150, 70); fs(c, '#fff', 5); line(c, [-500, b - 1150, -500 + Math.cos(t * .05) * 40, b - 1150 + Math.sin(t * .05) * 40], 6); line(c, [-500, b - 1150, -500 + Math.cos(t - 1.5) * 56, b - 1150 + Math.sin(t - 1.5) * 56], 3, '#c0392b');
    goldFrame(c, -200, b - 1050, 420, 300, PAINT.landscape); goldFrame(c, 1600, b - 1100, 300, 380, PAINT.stillLife);
    { const wx2 = 2200, wy2 = b - 1200; c.save(); c.beginPath(); c.rect(wx2, wy2, 520, 720); c.clip(); const g2 = c.createLinearGradient(0, wy2, 0, wy2 + 720); g2.addColorStop(0, '#b8d4e8'); g2.addColorStop(1, '#eaf2f4'); c.fillStyle = g2; c.fillRect(wx2, wy2, 520, 720); c.fillStyle = '#c8a890'; for (let i = 0; i < 4; i++) c.fillRect(wx2 + i * 140, wy2 + 400 - rnd(i) * 200, 120, 500); c.restore(); c.beginPath(); c.rect(wx2, wy2, 520, 720); c.lineWidth = 18; c.strokeStyle = '#fff'; c.stroke(); line(c, [wx2 + 260, wy2, wx2 + 260, wy2 + 720], 10, '#fff'); for (let i = 0; i < 3; i++) plantPot(c, wx2 + 100 + i * 160, .5, wy2 + 720); }
    c.beginPath(); c.rect(-1500, b - 640, 600, 16); fs(c, '#7a5a40', 2); for (let i = 0; i < 5; i++) { c.beginPath(); c.rect(-1480 + i * 110, b - 740 - (i % 2) * 30, 70, 100 + (i % 2) * 30); fs(c, ['#c8a060', '#4a6a8a', '#a0522d'][i % 3], 1.5); }
    line(c, [-3200, b - 1100, -3200, b], 10, '#5a4030'); for (const d of [-1, 1]) line(c, [-3200, b - 1060, -3200 + d * 70, b - 1010], 8, '#5a4030'); c.beginPath(); c.moveTo(-3260, b - 1010); c.lineTo(-3140, b - 1010); c.lineTo(-3120, b - 700); c.lineTo(-3280, b - 700); c.closePath(); fs(c, '#6a3a3a', 3);
    c.beginPath(); c.rect(-2600, b - 1300, 700, 1300); fs(c, '#7a5a40', 3); for (let r = 0; r < 5; r++) { line(c, [-2600, b - 1040 + r * 250, -1900, b - 1040 + r * 250], 8, '#5a4030'); for (let i = 0; i < 12; i++) { c.beginPath(); c.rect(-2580 + i * 54, b - 1040 + r * 250 - 150 - (i % 3) * 20, 44, 150 + (i % 3) * 20); fs(c, ['#a0522d', '#4a6a8a', '#8a8a4a', '#6a3a5a', '#c8a060'][(i + r) % 5], 1.5); } }
  });
  haze(c, '255,240,220', .1);
  layer(c, cam, 1, c => { const y0 = layerBase(cam, HZ, 1); c.fillStyle = '#b89a78'; c.fillRect(cam.x - 5000, y0, 10000, 3000); for (let i = 0; i < 14; i++) line(c, [cam.x - 5000, y0 + Math.pow(i / 13, 1.6) * 800, cam.x + 5000, y0 + Math.pow(i / 13, 1.6) * 800], 2, 'rgba(90,60,30,.25)');
    c.beginPath(); c.ellipse(0, 60, 900, 120, 0, 0, Math.PI * 2); fs(c, '#a84a4a', 3); c.beginPath(); c.ellipse(0, 60, 820, 100, 0, 0, Math.PI * 2); c.lineWidth = 6; c.strokeStyle = '#e8c878'; c.stroke();
    // sofa behind
    c.beginPath(); c.roundRect(-700, -330, 900, 230, 40); fs(c, '#6a7a5a', 3); c.beginPath(); c.roundRect(-760, -220, 1020, 200, 40); fs(c, '#7a8a6a', 3); for (const x of [-560, -300, -40]) { c.beginPath(); c.roundRect(x - 100, -300, 200, 120, 30); fs(c, '#8a9a7a', 2); }
    line(c, [900, 0, 900, -560], 8, '#3a3a3a'); c.beginPath(); c.moveTo(830, -560); c.lineTo(970, -560); c.lineTo(940, -660); c.lineTo(860, -660); c.closePath(); fs(c, '#f4e8c8', 3); bloom(c, 900, -580, 260, '255,220,150', .4);
    if (o.extra) o.extra(c);
  });
  return { base: '#e4d4c0' };
}
