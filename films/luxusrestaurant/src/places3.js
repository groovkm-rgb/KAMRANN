// More detailed places (world units, floor y = 0, 1 m ≈ 220). Each has a matching light in `screen`.
// proKitchen  — professional steel kitchen (tod 'service' | 'night'), pass with heat lamps, stove flames, steam
// omaKitchen  — Oma's 1960s kitchen (warm memory light)
// shopRoom    — empty dusty Altbau room (state 'empty' | 'junk' | 'build')
// amtOffice   — Amt / IHK waiting hall with queue display, counters, file stacks
function flame(c, x, y, s, t, i = 0) { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, fx = x + Math.cos(a) * 34 * s, fl = 1 + Math.sin(t * 17 + k * 2 + i) * .25; c.beginPath(); c.moveTo(fx - 7 * s, y); c.quadraticCurveTo(fx, y - 30 * s * fl, fx + 7 * s, y); c.fillStyle = k % 2 ? '#5aa0ff' : '#ffb040'; c.fill(); } bloom(c, x, y - 10, 90 * s, '255,150,60', .5); }
function steam(c, x, y, t, n = 3, s = 1, a = .22) { for (let k = 0; k < n; k++) { const ph = (t * .35 + k / n) % 1; c.beginPath(); c.moveTo(x + (k - n / 2) * 18 * s, y); c.bezierCurveTo(x - 30 * s + k * 20 * s, y - 80 * s, x + 40 * s, y - 140 * s, x + Math.sin(t + k) * 30 * s, y - (180 + ph * 120) * s); c.lineWidth = 22 * s; c.strokeStyle = `rgba(235,238,245,${a * Math.sin(ph * Math.PI)})`; c.lineCap = 'round'; c.stroke(); } }
function pot(c, x, y, s = 1, col = '#a8b0b8') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-60, 0); c.lineTo(-56, -80); c.lineTo(56, -80); c.lineTo(60, 0); c.closePath(); fs(c, col, 3); c.beginPath(); c.ellipse(0, -80, 58, 12, 0, 0, Math.PI * 2); fs(c, shade(col, -.25), 2.5); for (const s2 of [-1, 1]) line(c, [s2 * 56, -64, s2 * 80, -66], 7); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-46, -74, 10, 66); c.restore(); }
function pan(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, -8, 70, 14, 0, 0, Math.PI * 2); fs(c, '#2c2e34', 3); line(c, [60, -10, 170, -24], 12); line(c, [60, -10, 168, -24], 6, '#4a4e56'); c.restore(); }
function combiOven(c, x, y) { c.beginPath(); c.rect(x - 150, y - 520, 300, 520); fs(c, '#b9c0c8', 3); c.beginPath(); c.rect(x - 130, y - 480, 210, 300); fs(c, '#2a2e36', 3); c.save(); c.beginPath(); c.rect(x - 122, y - 472, 194, 284); c.clip(); for (let i = 0; i < 5; i++) { line(c, [x - 122, y - 440 + i * 56, x + 72, y - 440 + i * 56], 3, '#6a7078'); c.fillStyle = '#d8a050'; c.fillRect(x - 100, y - 462 + i * 56, 150, 12); } bloom(c, x - 25, y - 330, 160, '255,170,90', .35); c.restore(); c.beginPath(); c.rect(x + 92, y - 480, 46, 300); fs(c, '#d0d6dc', 2); c.beginPath(); c.rect(x + 98, y - 466, 34, 40); c.fillStyle = '#1a2a1a'; c.fill(); c.font = hudFont(16); c.fillStyle = '#6aff8a'; c.textAlign = 'center'; c.fillText('180°', x + 115, y - 440); for (let i = 0; i < 3; i++) { circle(c, x + 115, y - 390 + i * 54, 13); fs(c, '#8a9098', 2); } line(c, [x - 140, y - 330, x - 140, y - 250], 10, '#8a9098'); c.beginPath(); c.rect(x - 150, y - 170, 300, 170); fs(c, '#9aa2aa', 3); }
function heatLamp(c, x, y, t, on) { line(c, [x, y - 200, x, y - 40], 5, '#5a5e66'); c.beginPath(); c.moveTo(x - 60, y); c.lineTo(x + 60, y); c.lineTo(x + 34, y - 46); c.lineTo(x - 34, y - 46); c.closePath(); fs(c, '#3a3e46', 2.5); if (on) { c.beginPath(); c.ellipse(x, y, 58, 10, 0, 0, Math.PI * 2); c.fillStyle = '#ff9a40'; c.fill(); bloom(c, x, y + 40, 220, '255,120,40', .45); } }
function proKitchen(c, cam, t, o = {}) {
  const night = o.tod === 'night', HZ = -220, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = night ? '#101218' : '#c8d0d4'; c.fillRect(0, 0, W, H);
  layer(c, cam, .7, c => { const b = B(.7);
    kitchenTiles(c, -4000, 4000, b - 1500, b, night ? '#4a5258' : '#dfe5e8', night ? 'rgba(10,15,20,.5)' : 'rgba(110,120,128,.35)');
    for (let i = -4; i <= 4; i++) { const lx = i * 700; c.beginPath(); c.rect(lx - 160, b - 1500, 320, 26); fs(c, night ? '#6a7078' : '#f8fbff', 2); if (!night) bloom(c, lx, b - 1460, 260, '210,235,255', .4); }
    c.beginPath(); c.rect(-4000, b - 1180, 8000, 120); fs(c, '#9aa2aa', 3); for (let i = -40; i < 40; i++) line(c, [i * 100, b - 1180, i * 100, b - 1060], 2, 'rgba(0,0,0,.15)'); // hood
    hangingPans(c, -1500, 7, b - 1020, t); ticketRail(c, 300, b - 1020, 900, t, 7); spiceShelf(c, 1400, b - 640, 700); spiceShelf(c, -2400, b - 640, 700);
    for (const sx of [-2600, 1500]) { c.beginPath(); c.rect(sx, b - 980, 600, 18); fs(c, '#9aa2ac', 2); for (let i = 0; i < 6; i++) { pot(c, sx + 60 + i * 95, b - 980, .55, ['#a8b0b8', '#b87333', '#8a9098'][i % 3]); } }
    combiOven(c, -900, b); combiOven(c, -560, b);
    // walk-in cooler door
    c.beginPath(); c.rect(2300, b - 900, 420, 900); fs(c, '#c8ced4', 3); line(c, [2660, b - 560, 2660, b - 380], 14, '#8a9098'); c.beginPath(); c.rect(2360, b - 840, 160, 70); fs(c, '#fff', 2); c.font = hudFont(26); c.fillStyle = '#2a4a8a'; c.textAlign = 'left'; c.fillText('KÜHLZELLE', 2368, b - 795); c.font = hudFont(20); c.fillStyle = '#2a8a4a'; c.fillText('+3 °C', 2380, b - 760);
    // dishwashing corner
    c.beginPath(); c.rect(-3300, b - 520, 520, 520); fs(c, '#b0b8c0', 3); c.beginPath(); c.rect(-3260, b - 480, 440, 260); fs(c, '#8a9098', 2); for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-3200 + i * 60, b - 260, 26, 60, 0, 0, Math.PI * 2); fs(c, '#f4f2ec', 2); }
  });
  haze(c, night ? '20,25,40' : '230,236,240', night ? .35 : .18);
  layer(c, cam, 1, c => {
    // floor tiles
    const y0 = layerBase(cam, HZ, 1); c.fillStyle = night ? '#24262c' : '#8a9096'; c.fillRect(cam.x - 5000, y0, 10000, 3000); for (let i = 0; i < 14; i++) line(c, [cam.x - 5000, y0 + Math.pow(i / 13, 1.6) * 900, cam.x + 5000, y0 + Math.pow(i / 13, 1.6) * 900], 2, 'rgba(0,0,0,.25)'); for (let i = -40; i <= 40; i++) { const x0 = Math.round(cam.x / 120) * 120 + i * 120; line(c, [x0, y0, x0 + (x0 - cam.x) * 2.5, y0 + 900], 1.5, 'rgba(0,0,0,.2)'); }
    // back counter line with stove
    const top = -205; c.beginPath(); c.rect(-3000, top, 6000, -top); fs(c, '#a4acb4', 3); c.beginPath(); c.rect(-3000, top - 16, 6000, 20); fs(c, '#c8d0d8', 2.5);
    for (let i = -6; i <= 6; i++) { c.beginPath(); c.rect(i * 420 - 190, top + 30, 380, 150); fs(c, '#98a0a8', 2); line(c, [i * 420 - 60, top + 60, i * 420 + 60, top + 60], 7, '#d0d6dc'); }
    if (o.stove !== false) for (let i = 0; i < 4; i++) { const sx = -220 + i * 170; c.beginPath(); c.ellipse(sx, top - 14, 60, 10, 0, 0, Math.PI * 2); fs(c, '#2a2c30', 2); if (!night || o.cooking) flame(c, sx, top - 16, .9, t, i); if (i % 2 === 0) { pot(c, sx, top - 18, .7, i ? '#b87333' : '#a8b0b8'); steam(c, sx, top - 80, t + i, 3, .8); } else pan(c, sx, top - 18, .8); }
    c.save(); c.globalAlpha = .1; for (let i = 0; i < 26; i++) line(c, [-3000, top + 10 + i * 7, 3000, top + 10 + i * 7], 1, i % 2 ? '#fff' : '#000'); c.restore();
    if (o.extra) o.extra(c);
  });
  return { base: night ? '#101218' : '#c8d0d4' };
}
function kitchenLight(c, cam, t, o = {}) {
  const night = o.tod === 'night';
  if (!night) { c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(150,200,255,.25)'; c.fillRect(0, 0, W, H); c.restore(); }
  const [sx, sy] = toScreen(cam, 1, 30, -260); bloom(c, sx, sy, 520 * cam.z * .6, '255,140,50', night && !o.cooking ? .05 : .28);
  if (o.steamy) { c.save(); c.globalAlpha = .18; const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(240,244,250,.9)'); g.addColorStop(1, 'rgba(240,244,250,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  grade(c, night ? { sx: .5, sy: .3, warm: '255,170,90', warmA: .25, cool: '10,15,40', coolA: .5 } : { sx: .5, sy: .55, warm: '255,150,70', warmA: .22, cool: '40,70,110', coolA: .25 });
}
// ---------------- Oma's 1960s kitchen ----------------
function omaKitchen(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#e8d6a8'; c.fillRect(0, 0, W, H);
  layer(c, cam, .8, c => { c.translate(0, B(.8)); c.scale(.55, .55); const b = 0;
    // wallpaper (small flowers) above mint tiles
    c.fillStyle = '#efdcae'; c.fillRect(-7000, b - 2600, 14000, 2600);
    for (let x = -7000; x < 7000; x += 70) for (let y = b - 2600; y < b - 560; y += 70) { const ox = (Math.floor((y - b) / 70) % 2) * 35; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(x + ox, y); c.arc(x + ox + Math.cos(k * 1.57) * 6, y + Math.sin(k * 1.57) * 6, 5, 0, Math.PI * 2); } c.fillStyle = 'rgba(190,110,80,.35)'; c.fill(); c.beginPath(); c.arc(x + ox, y, 3, 0, Math.PI * 2); c.fillStyle = 'rgba(120,140,70,.5)'; c.fill(); }
    kitchenTiles(c, -7000, 7000, b - 560, b, '#a8d8c0', 'rgba(60,100,80,.35)'); c.beginPath(); c.rect(-7000, b - 572, 14000, 14); fs(c, '#6a9a80', 2);
    // window with lace curtain + evening sun
    const wx = -700, wy = b - 1250, ww = 520, wh = 520; c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); let g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#f0a868'); g.addColorStop(1, '#ffe2a8'); c.fillStyle = g; c.fillRect(wx, wy, ww, wh); c.fillStyle = '#c08a6a'; for (let i = 0; i < 5; i++) c.fillRect(wx + i * 110, wy + wh - 120 - rnd(i + 3) * 120, 90, 300); bloom(c, wx + 160, wy + 260, 200, '255,240,190', .8); c.restore();
    c.beginPath(); c.rect(wx, wy, ww, wh); c.lineWidth = 16; c.strokeStyle = '#f4ead4'; c.stroke(); line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 10, '#f4ead4'); line(c, [wx, wy + wh / 2, wx + ww, wy + wh / 2], 10, '#f4ead4');
    for (const s of [0, 1]) { c.beginPath(); c.moveTo(wx + s * ww, wy - 20); c.lineTo(wx + ww / 2 + (s ? 60 : -60), wy - 20); c.quadraticCurveTo(wx + (s ? ww - 80 : 80), wy + wh * .5, wx + s * ww + (s ? 30 : -30), wy + wh + 30); c.lineTo(wx + s * ww + (s ? 40 : -40), wy - 20); c.closePath(); c.fillStyle = 'rgba(255,252,240,.75)'; c.fill(); for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(wx + (s ? ww - 50 : 50), wy + 40 + k * 80, 12, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = 'rgba(200,190,160,.8)'; c.stroke(); } }
    c.beginPath(); c.rect(wx - 30, wy + wh, ww + 60, 24); fs(c, '#f4ead4', 2); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(wx + 60 + i * 150, wy + wh); c.lineTo(wx + 40 + i * 150, wy + wh - 70); c.lineTo(wx + 100 + i * 150, wy + wh - 70); c.lineTo(wx + 80 + i * 150, wy + wh); c.closePath(); fs(c, '#c8714a', 2); clayBlob(c, wx + 70 + i * 150, wy + wh - 96, 34, 26, ['#5a9a4a', '#e0506a', '#4f8f50'][i], { seed: 90 + i }); }
    // Kredenz cupboard with plates and jars
    const kx = 300; c.beginPath(); c.rect(kx, b - 1300, 560, 1300); fs(c, '#e8dcc0', 3); c.beginPath(); c.rect(kx + 30, b - 1260, 500, 520); fs(c, '#d4e8ec', 2); for (let r = 0; r < 3; r++) { line(c, [kx + 30, b - 1080 + r * 170, kx + 530, b - 1080 + r * 170], 6, '#c8b890'); for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(kx + 80 + i * 95, b - 1130 + r * 170, 34, 44, 0, 0, Math.PI * 2); fs(c, r === 1 ? '#f4f2ec' : '#e8f0f4', 2); c.beginPath(); c.ellipse(kx + 80 + i * 95, b - 1130 + r * 170, 22, 30, 0, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = '#4a7ab0'; c.stroke(); } }
    line(c, [kx + 280, b - 1260, kx + 280, b - 740], 6, '#c8b890'); c.beginPath(); c.rect(kx, b - 720, 560, 40); fs(c, '#d8c8a0', 2); for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(kx + 30 + i * 130, b - 820, 90, 100); fs(c, 'rgba(230,220,180,.8)', 2); c.font = hudFont(15); c.fillStyle = '#5a3a24'; c.textAlign = 'center'; c.fillText(['Mehl', 'Zucker', 'Salz', 'Kaffee'][i], kx + 75 + i * 130, b - 770); }
    for (let i = 0; i < 2; i++) { c.beginPath(); c.rect(kx + 30 + i * 260, b - 640, 240, 600); fs(c, '#efe4c8', 2); circle(c, kx + 240 + i * 260 - 200 * i, b - 340, 12); fs(c, '#c9a24a', 2); }
    // wall clock, calendar 1962, radio on a shelf
    circle(c, 1180, b - 1150, 80); fs(c, '#f8f4e8', 5); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; line(c, [1180 + Math.cos(a) * 64, b - 1150 + Math.sin(a) * 64, 1180 + Math.cos(a) * 72, b - 1150 + Math.sin(a) * 72], 3); } line(c, [1180, b - 1150, 1180 + Math.cos(t * .1 - 1) * 44, b - 1150 + Math.sin(t * .1 - 1) * 44], 6); line(c, [1180, b - 1150, 1180 + Math.cos(t * .6 - 2) * 60, b - 1150 + Math.sin(t * .6 - 2) * 60], 4);
    c.beginPath(); c.rect(1080, b - 960, 210, 260); fs(c, '#fffaf0', 2); c.fillStyle = '#c0392b'; c.fillRect(1080, b - 960, 210, 60); c.font = hudFont(30); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('1962', 1185, b - 918); c.font = hudFont(22); c.fillStyle = '#2a2a2a'; c.fillText('Oktober', 1185, b - 868); for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(40,40,40,.5)'; c.fillRect(1100 + k * 30, b - 840 + r * 30, 16, 10); }
    c.beginPath(); c.rect(1500, b - 900, 500, 20); fs(c, '#a0784a', 2); c.beginPath(); c.roundRect(1560, b - 1060, 280, 160, 20); fs(c, '#8a5a3a', 3); c.beginPath(); c.rect(1580, b - 1040, 150, 120); c.fillStyle = '#d8c8a0'; c.fill(); for (let i = 0; i < 6; i++) line(c, [1585, b - 1030 + i * 20, 1725, b - 1030 + i * 20], 2, '#8a7050'); circle(c, 1785, b - 1000, 22); fs(c, '#d8c8a0', 2); circle(c, 1785, b - 940, 16); fs(c, '#d8c8a0', 2);
    for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(1560 + i * 100, b - 990 - 90, 0, 0); }
    c.beginPath(); c.rect(1880, b - 980, 60, 80); fs(c, '#c8b080', 2); // jar
    // old enamel stove with Oma's pot
    const sx = -1700; c.beginPath(); c.rect(sx, b - 620, 600, 620); fs(c, '#f4f0e4', 3); c.beginPath(); c.rect(sx + 40, b - 470, 520, 300); fs(c, '#e8e2d0', 2); c.beginPath(); c.rect(sx + 70, b - 440, 460, 160); c.fillStyle = '#2a2a2a'; c.fill(); line(c, [sx + 100, b - 300, sx + 500, b - 300], 10, '#c8c8c8'); for (let i = 0; i < 4; i++) { circle(c, sx + 100 + i * 130, b - 560, 22); fs(c, '#3a3a3a', 2); }
    c.beginPath(); c.rect(sx - 10, b - 640, 620, 24); fs(c, '#3a3a3a', 2); pot(c, sx + 180, b - 640, 1.3, '#d24a3a'); steam(c, sx + 180, b - 760, t, 4, 1.2, .35); pan(c, sx + 430, b - 640, 1.1);
    line(c, [sx - 80, b - 1000, sx + 700, b - 1000], 8, '#8a7050'); for (let i = 0; i < 6; i++) { line(c, [sx - 40 + i * 120, b - 1000, sx - 40 + i * 120, b - 960], 4, '#6a5a40'); line(c, [sx - 40 + i * 120, b - 960, sx - 40 + i * 120, b - 860], 6, ['#c8ccd2', '#a07040'][i % 2]); }
  });
  haze(c, '255,220,170', .1);
  layer(c, cam, 1, c => {
    const y0 = layerBase(cam, HZ, 1); c.fillStyle = '#c8a878'; c.fillRect(cam.x - 5000, y0, 10000, 3000);
    for (let r = 0; r < 12; r++) for (let i = -30; i < 30; i++) if ((r + i) % 2) { const yy = y0 + Math.pow(r / 12, 1.5) * 700, yy2 = y0 + Math.pow((r + 1) / 12, 1.5) * 700, x = Math.round(cam.x / 140) * 140 + i * 140; c.beginPath(); c.moveTo(x + (x - cam.x) * (yy - y0) / 300, yy); c.lineTo(x + 140 + (x + 140 - cam.x) * (yy - y0) / 300, yy); c.lineTo(x + 140 + (x + 140 - cam.x) * (yy2 - y0) / 300, yy2); c.lineTo(x + (x - cam.x) * (yy2 - y0) / 300, yy2); c.fillStyle = '#9a7a58'; c.fill(); }
    if (o.table !== false) { // table with checkered cloth
      const tx = o.tableX ?? 450; c.beginPath(); c.moveTo(tx - 240, -130); c.lineTo(tx + 240, -130); c.lineTo(tx + 250, -40); c.lineTo(tx - 250, -40); c.closePath(); fs(c, '#fff', 3); c.save(); c.clip(); for (let i = 0; i < 20; i++) for (let k = 0; k < 4; k++) if ((i + k) % 2) { c.fillStyle = 'rgba(200,50,50,.55)'; c.fillRect(tx - 250 + i * 25, -130 + k * 24, 25, 24); } c.restore();
      for (const s of [-1, 1]) line(c, [tx + s * 220, -40, tx + s * 220, 0], 12, '#7a5a3a'); if (o.items) o.items(c, tx, -134);
    }
  });
  return { base: '#e8d6a8' };
}
function omaLight(c, cam, t) { c.save(); c.globalCompositeOperation = 'screen'; const [wx, wy] = toScreen(cam, .8, -440 * .55, layerBase(cam, -200, .8) - 990 * .55); const g = c.createLinearGradient(wx, wy, wx + 900, wy + 900); g.addColorStop(0, 'rgba(255,210,140,.35)'); g.addColorStop(1, 'rgba(255,210,140,0)'); c.beginPath(); c.moveTo(wx - 200, wy - 200); c.lineTo(wx + 200, wy - 260); c.lineTo(wx + 1400, wy + 1100); c.lineTo(wx + 500, wy + 1300); c.closePath(); c.fillStyle = g; c.fill(); c.restore(); motes(c, wx - 100, wx + 900, wy - 100, wy + 800, t, { n: 30, alpha: .5 }); grade(c, { sx: .25, sy: .2, warm: '255,170,90', warmA: .4, cool: '90,50,40', coolA: .2 });
  // memory feel: soft sepia edge
  const g2 = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); g2.addColorStop(0, 'rgba(255,230,180,0)'); g2.addColorStop(1, 'rgba(120,80,40,.45)'); c.fillStyle = g2; c.fillRect(0, 0, W, H); }
// ---------------- empty Altbau shop ----------------
function shopRoom(c, cam, t, o = {}) {
  const st = o.state || 'empty', HZ = -230, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#d8ccb4'; c.fillRect(0, 0, W, H);
  layer(c, cam, .72, c => { c.translate(0, B(.72)); c.scale(.62, .62); const b = 0;
    c.fillStyle = '#d8ccb4'; c.fillRect(-6000, b - 1600, 12000, 1700);
    // peeling wallpaper patches + old marks of removed pictures
    for (let i = 0; i < 26; i++) { const x = -5000 + rnd(i + 11) * 10000, y = b - 300 - rnd(i + 12) * 900; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 60 + rnd(i) * 100, y + 10); c.lineTo(x + 40 + rnd(i) * 80, y + 90 + rnd(i + 2) * 60); c.lineTo(x - 10, y + 70); c.closePath(); c.fillStyle = 'rgba(160,140,110,.45)'; c.fill(); }
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,250,235,.35)'; c.fillRect(-2500 + i * 900, b - 900, 240, 180); }
    stuccoBand(c, -6000, 6000, b - 1600, 70);
    for (const wx of [-2400, -1200, 0, 1200, 2400]) { const ww = 340, wh = 820, wy = b - 120 - wh; c.save(); c.beginPath(); c.rect(wx - ww / 2, wy, ww, wh); c.arc(wx, wy, ww / 2, Math.PI, 0); c.clip(); const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#f8e0b0'); g.addColorStop(1, '#fff4dc'); c.fillStyle = g; c.fillRect(wx - ww, wy - ww, ww * 2, wh + ww * 2); c.fillStyle = 'rgba(160,130,100,.5)'; for (let i = 0; i < 4; i++) c.fillRect(wx - ww / 2 + i * 90, wy + wh - 300 - rnd(wx + i) * 200, 80, 600); if (st === 'empty') { c.fillStyle = 'rgba(230,220,200,.55)'; c.fillRect(wx - ww / 2, wy + wh * .55, ww, wh * .45); c.font = hudFont(40); c.fillStyle = '#c0392b'; c.textAlign = 'center'; if (wx === 0) c.fillText('ZU VERMIETEN', wx, wy + wh * .75); } c.restore();
      c.beginPath(); c.rect(wx - ww / 2, wy, ww, wh); c.arc(wx, wy, ww / 2, Math.PI, 0); c.lineWidth = 18; c.strokeStyle = '#eae2d0'; c.stroke(); c.lineWidth = 2.5; c.strokeStyle = OUT; c.stroke(); line(c, [wx, wy - ww / 2, wx, wy + wh], 9, '#eae2d0'); for (let k = 1; k < 4; k++) line(c, [wx - ww / 2, wy + k * wh / 4, wx + ww / 2, wy + k * wh / 4], 7, '#eae2d0'); }
    c.beginPath(); c.rect(-6000, b - 40, 12000, 40); fs(c, '#a89070', 2);
    // cables hanging from the ceiling, a bare bulb
    for (const x of [-1800, 600, 1800]) { line(c, [x, b - 1530, x + 10, b - 1150], 3, '#2a2a2a'); circle(c, x + 10, b - 1130, 22); fs(c, st === 'empty' ? '#f4e8c0' : '#ffe9a0', 2); }
  });
  haze(c, '255,235,200', .14);
  layer(c, cam, 1, c => {
    const y0 = layerBase(cam, HZ, 1); c.fillStyle = '#9a7a56'; c.fillRect(cam.x - 5000, y0, 10000, 3000);
    for (let i = 0; i < 18; i++) line(c, [cam.x - 5000, y0 + Math.pow(i / 17, 1.6) * 900, cam.x + 5000, y0 + Math.pow(i / 17, 1.6) * 900], 2, 'rgba(60,40,20,.3)'); for (let i = -40; i <= 40; i++) { const x0 = Math.round(cam.x / 80) * 80 + i * 80; line(c, [x0, y0, x0 + (x0 - cam.x) * 2.8, y0 + 900], 1.5, 'rgba(60,40,20,.25)'); }
    for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(cam.x - 2000 + rnd(i + 5) * 4000, y0 + 40 + rnd(i + 6) * 500, 40 + rnd(i) * 80, 8, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(230,220,200,.25)'; c.fill(); } // dust
    if (st === 'empty' || st === 'build') {
      // stacked old chairs, ladder, paint buckets, a sheet-covered table
      for (let i = 0; i < 4; i++) { c.save(); c.translate(-760, -i * 60); chairBack(c, 0, { col: '#6a5a4a', s: .9 }); c.restore(); }
      c.save(); c.translate(820, 0); line(c, [-90, 0, -30, -520], 12, '#c8a070'); line(c, [90, 0, 30, -520], 12, '#c8a070'); for (let i = 1; i < 7; i++) line(c, [-90 + i * 9, -i * 75, 90 - i * 9, -i * 75], 8, '#b89060'); c.restore();
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(980 + i * 80, 0); c.lineTo(970 + i * 80, -80); c.lineTo(1040 + i * 80, -80); c.lineTo(1030 + i * 80, 0); c.closePath(); fs(c, ['#f4f4f4', '#4a7ab0', '#e8d0a0'][i], 2.5); c.beginPath(); c.ellipse(1005 + i * 80, -80, 35, 7, 0, 0, Math.PI * 2); fs(c, '#ddd', 1.5); }
      c.beginPath(); c.moveTo(-420, 0); c.lineTo(-440, -150); c.quadraticCurveTo(-300, -210, -160, -150); c.lineTo(-180, 0); c.quadraticCurveTo(-300, 14, -420, 0); fs(c, '#efe8da', 3); for (let k = 0; k < 4; k++) line(c, [-400 + k * 60, -160, -390 + k * 66, 0], 2, 'rgba(120,110,90,.4)');
    }
    if (st === 'junk') {
      // rusty old stove, smoking clay oven, rattling cooler, broken shelf
      c.beginPath(); c.rect(-700, -300, 380, 300); fs(c, '#8a6a50', 3); for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(-680 + rnd(i) * 340, -280 + rnd(i + 1) * 260, 6 + rnd(i + 2) * 14, 0, Math.PI * 2); c.fillStyle = 'rgba(150,70,30,.5)'; c.fill(); } for (let i = 0; i < 4; i++) { circle(c, -640 + i * 90, -310, 26); fs(c, '#3a3030', 2); } c.beginPath(); c.rect(-680, -230, 340, 150); fs(c, '#4a3a30', 2); c.font = hudFont(26); c.fillStyle = '#f4e8c0'; c.textAlign = 'center'; c.fillText('Bj. 2009', -510, -140);
      clayShape(c, () => { c.beginPath(); c.roundRect(-180, -340, 300, 340, 50); }, '#9a8a7a', { bounds: [-180, -340, 300, 340], seed: 77 });
      clayShape(c, () => { c.beginPath(); c.roundRect(-140, -260, 220, 140, 30); }, '#3a2a24', { bounds: [-140, -260, 220, 140], seed: 78 });
      for (let k = 0; k < 4; k++) { const ph = (t * .4 + k / 4) % 1; clayBlob(c, -40 + Math.sin(t + k) * 30 + ph * 40, -380 - ph * 320, 40 + ph * 50, 32 + ph * 40, `rgba(90,90,96,${(1 - ph) * .85})`, { seed: 80 + k, lw: 1 }); }
      const sh = Math.sin(t * 40) * 3; c.save(); c.translate(380 + sh, 0); c.beginPath(); c.rect(0, -560, 380, 560); fs(c, '#c8ced4', 3); c.beginPath(); c.rect(20, -540, 340, 520); fs(c, '#b8c0c8', 2); line(c, [320, -380, 320, -200], 14, '#8a9098'); c.font = hudFont(30); c.fillStyle = '#2a4a8a'; c.textAlign = 'center'; c.fillText('KÜHLZELLE', 190, -460); c.restore();
      for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(790, -480, 30 + k * 26 + (t * 60 % 26), -.6, .6); c.lineWidth = 5; c.strokeStyle = `rgba(40,40,40,${.6 - k * .18})`; c.stroke(); }
    }
    if (o.extra) o.extra(c);
  });
  return { base: '#d8ccb4' };
}
function shopLight(c, cam, t, o = {}) {
  const pw = .72, b = layerBase(cam, -230, pw);
  c.save(); c.globalCompositeOperation = 'screen';
  for (const wx of [-2400, -1200, 0, 1200, 2400]) { const ww = 340 * .62, top = b + (-120 - 820) * .62, bot = b - 120 * .62, xs = wx * .62;
    const [ax, ay] = toScreen(cam, pw, xs - ww / 2, top), [bx] = toScreen(cam, pw, xs + ww / 2, top), [, by] = toScreen(cam, pw, 0, bot);
    const [fx0, fy] = toScreen(cam, 1, xs + 300, 60), [fx1] = toScreen(cam, 1, xs + 560, 60), [gx0, gy] = toScreen(cam, 1, xs + 450, 400), [gx1] = toScreen(cam, 1, xs + 740, 400);
    const g = c.createLinearGradient(ax, ay, gx0, gy); g.addColorStop(0, 'rgba(255,225,160,.32)'); g.addColorStop(1, 'rgba(255,225,160,.04)');
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, ay); c.lineTo(gx1, gy); c.lineTo(gx0, gy); c.closePath(); c.fillStyle = g; c.fill();
    c.beginPath(); c.moveTo(fx0, fy); c.lineTo(fx1, fy); c.lineTo(gx1, gy); c.lineTo(gx0, gy); c.closePath(); c.fillStyle = 'rgba(255,220,150,.28)'; c.fill(); }
  c.restore();
  if (o.motes !== false) motes(c, 0, W, 0, H, t, { n: 70, speed: .015, alpha: .7 });
  grade(c, { sx: .2, sy: .2, warm: '255,190,110', warmA: .3, cool: '70,50,60', coolA: .2 });
}
// ---------------- Amt / IHK waiting hall ----------------
function amtOffice(c, cam, t, o = {}) {
  const HZ = -230, B = p => layerBase(cam, HZ, p), num = o.num ?? 247;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#cfd3c8'; c.fillRect(0, 0, W, H);
  layer(c, cam, .72, c => { c.translate(0, B(.72)); c.scale(.66, .66); const b = 0;
    c.fillStyle = '#d6dacb'; c.fillRect(-6000, b - 1500, 12000, 1600); c.fillStyle = '#b8bca8'; c.fillRect(-6000, b - 420, 12000, 420); line(c, [-6000, b - 420, 6000, b - 420], 6, '#8a8e7a');
    for (let i = -5; i <= 5; i++) { c.beginPath(); c.rect(i * 800 - 200, b - 1480, 400, 30); fs(c, '#f4f8f4', 2); bloom(c, i * 800, b - 1440, 300, '230,245,230', .3); }
    // counters with clerks behind glass
    for (let i = -3; i <= 3; i++) { const x = i * 900;
      c.beginPath(); c.rect(x - 380, b - 1150, 760, 60); fs(c, '#3a5a8a', 2); c.font = hudFont(34); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('Schalter ' + (i + 4), x, b - 1108);
      if (o.clerks !== false) drawPerson(c, { x, y: -330, k: .27, who: [PEOPLE.clerk, PEOPLE.clerk2][(i + 4) % 2], t, seed: 40 + i, expr: { mouth: 'flat', lid: .3 }, arms: { l: { a: .4, b: -.9 }, r: { a: .4, b: -.9 } } });
      c.beginPath(); c.rect(x - 380, b - 700, 760, 280); fs(c, 'rgba(210,235,245,.35)', 3); line(c, [x - 300, b - 690, x - 200, b - 430], 6, 'rgba(255,255,255,.5)');
      c.beginPath(); c.rect(x - 400, b - 430, 800, 430); fs(c, '#a89a80', 3); c.beginPath(); c.rect(x - 420, b - 450, 840, 30); fs(c, '#8a7a60', 2);
      // file stacks + stamp on the counter
      for (let k = 0; k < 2; k++) for (let j = 0; j < 6 + (i + k) % 4; j++) { c.beginPath(); c.rect(x - 340 + k * 520, b - 470 - j * 24, 170, 22); fs(c, ['#e8d890', '#f4f0e4', '#c8d8e8', '#f0c8a0'][j % 4], 2); }
      c.beginPath(); c.rect(x + 40, b - 500, 40, 50); fs(c, '#7a4a2a', 2); c.beginPath(); c.rect(x + 25, b - 470, 70, 20); fs(c, '#2a2a2a', 2);
    }
    // queue display + posters
    c.beginPath(); c.rect(-260, b - 1420, 520, 220); fs(c, '#1a1a1e', 4); c.font = hudFont(40); c.fillStyle = '#9aa0a8'; c.textAlign = 'center'; c.fillText('AUFRUF', 0, b - 1360); c.font = hudFont(110); c.fillStyle = '#ff3a2a'; c.fillText(String(num), 0, b - 1240); bloom(c, 0, b - 1280, 260, '255,60,40', .35);
    for (const [px, txt] of [[-1500, 'Bitte Wartenummer ziehen'], [1500, 'Anträge nur vollständig'], [2700, 'Gewerbeamt · 2. OG']]) { c.beginPath(); c.rect(px - 230, b - 1050, 460, 300); fs(c, '#fffdf4', 3); c.fillStyle = '#3a5a8a'; c.fillRect(px - 230, b - 1050, 460, 70); c.font = hudFont(30); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('HINWEIS', px, b - 1003); c.font = hudFont(28); c.fillStyle = '#2a2a2a'; c.fillText(txt, px, b - 920); for (let k = 0; k < 4; k++) line(c, [px - 190, b - 870 + k * 34, px + 190 - k * 40, b - 870 + k * 34], 4, 'rgba(0,0,0,.25)'); }
    circle(c, -2700, b - 1200, 70); fs(c, '#fff', 5); line(c, [-2700, b - 1200, -2700 + Math.cos(t * .05) * 40, b - 1200 + Math.sin(t * .05) * 40], 6); line(c, [-2700, b - 1200, -2700 + Math.cos(t - 1.5) * 56, b - 1200 + Math.sin(t - 1.5) * 56], 3, '#c0392b');
  });
  haze(c, '230,235,225', .12);
  layer(c, cam, 1, c => {
    const y0 = layerBase(cam, HZ, 1); c.fillStyle = '#a8a89a'; c.fillRect(cam.x - 5000, y0, 10000, 3000); for (let i = -30; i <= 30; i++) for (let r = 0; r < 10; r++) if ((i + r) % 2) { const x = Math.round(cam.x / 150) * 150 + i * 150, yy = y0 + Math.pow(r / 10, 1.6) * 900, yy2 = y0 + Math.pow((r + 1) / 10, 1.6) * 900; c.beginPath(); c.moveTo(x + (x - cam.x) * (yy - y0) / 320, yy); c.lineTo(x + 150 + (x + 150 - cam.x) * (yy - y0) / 320, yy); c.lineTo(x + 150 + (x + 150 - cam.x) * (yy2 - y0) / 320, yy2); c.lineTo(x + (x - cam.x) * (yy2 - y0) / 320, yy2); c.fillStyle = '#989888'; c.fill(); }
    // waiting chairs row with people (behind the action line)
    if (o.queue !== false) for (let i = -6; i <= 6; i++) { const x = i * 190 + 60; if (Math.abs(x - (o.gapX ?? 9999)) < 200) continue; c.save(); c.translate(0, -70); c.beginPath(); c.rect(x - 70, -110, 140, 20); fs(c, '#4a6a9a', 2); c.beginPath(); c.rect(x - 70, -250, 140, 140); fs(c, '#4a6a9a', 2); line(c, [x - 60, -90, x - 60, 0], 6, '#5a5e66'); line(c, [x + 60, -90, x + 60, 0], 6, '#5a5e66');
      if (rnd(i + 30) > .25) drawPerson(c, { x, sit: true, seatH: 300, k: .21, who: PEOPLE.guest(i + 11), t, seed: i + 70, expr: { mouth: rnd(i) > .5 ? 'flat' : 'soft', lid: .35 + rnd(i) * .3, look: rnd(i + 2) - .5 }, arms: { l: { a: .35, b: -.9 }, r: { a: .35, b: -.9 } }, item: rnd(i + 9) > .5 ? { side: 1, draw: c2 => { c2.beginPath(); c2.rect(-14, -40, 28, 44); fs(c2, '#fff', 1.5); c2.font = hudFont(10); c2.fillStyle = '#c0392b'; c2.textAlign = 'center'; c2.fillText(String(250 + i), 0, -12); } } : null }); c.restore(); }
    if (o.extra) o.extra(c);
  });
  return { base: '#cfd3c8' };
}
function amtLight(c, cam, t) { c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(170,220,190,.3)'; c.fillRect(0, 0, W, H); c.restore(); grade(c, { sx: .5, sy: 0, warm: '240,255,240', warmA: .2, cool: '40,60,60', coolA: .25 }); }

// world-scale 1960s enamel stove with Oma's pot (front of the action), x = centre
function omaStove(c, x, t) {
  c.save(); c.translate(x, 0); c.scale(.42, .42); const b = 0;
  c.beginPath(); c.ellipse(300, 6, 340, 26, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(40,20,10,.3)'; c.fill();
  c.beginPath(); c.rect(0, b - 620, 600, 620); fs(c, '#f4f0e4', 4); c.beginPath(); c.rect(40, b - 470, 520, 300); fs(c, '#e8e2d0', 3); c.beginPath(); c.rect(70, b - 440, 460, 160); c.fillStyle = '#2a2a2a'; c.fill(); line(c, [100, b - 300, 500, b - 300], 12, '#c8c8c8');
  for (let i = 0; i < 4; i++) { circle(c, 100 + i * 130, b - 560, 22); fs(c, '#3a3a3a', 3); } c.beginPath(); c.rect(40, b - 140, 520, 110); fs(c, '#e8e2d0', 3); line(c, [250, b - 90, 350, b - 90], 10, '#9a9a9a');
  c.beginPath(); c.rect(-10, b - 640, 620, 24); fs(c, '#3a3a3a', 3); c.restore();
  pot(c, x + 80, -270, .62, '#d24a3a'); steam(c, x + 80, -330, t, 4, .7, .35); pan(c, x + 190, -270, .5);
}
