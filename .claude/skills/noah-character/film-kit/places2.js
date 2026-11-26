// More places. drawerSet: dark professional kitchen at night, close on a steel drawer that slides open (one warm lamp).
//   drawerSet(c, cam, t, { open: 0..1, lamp: 0..1 })   recipeBook(c, x, y, w, h, o) — Oma's worn handwritten notebook
function recipeBook(c, x, y, w, h, o = {}) {
  // closed notebook seen from above (cover up); x, y = centre
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.beginPath(); c.roundRect(-w / 2 + 6, -h / 2 + 8, w, h, 8); c.fillStyle = 'rgba(0,0,0,.45)'; c.fill();
  // page block edge
  c.beginPath(); c.roundRect(-w / 2 + 4, -h / 2 + 4, w, h, 6); fs(c, '#e9dcbc', 2);
  for (let i = 0; i < 5; i++) line(c, [-w / 2 + 8, h / 2 + 2 - i * 1.6, w / 2, h / 2 + 2 - i * 1.6], .8, 'rgba(120,90,50,.5)');
  // cover (worn oxblood linen)
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 6); fs(c, '#7a2e24', 2.5);
  c.save(); c.clip();
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,220,180,${.03 + rnd(i + 300) * .05})`; c.fillRect(-w / 2 + rnd(i + 310) * w, -h / 2 + rnd(i + 320) * h, 2 + rnd(i) * 10, 1.5); }
  // worn corners + spine
  c.fillStyle = 'rgba(230,190,150,.35)'; for (const [cx, cy] of [[w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]) { c.beginPath(); c.arc(cx, cy, w * .09, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#5a1e18'; c.fillRect(-w / 2, -h / 2, w * .1, h); line(c, [-w / 2 + w * .1, -h / 2, -w / 2 + w * .1, h / 2], 1.5, 'rgba(0,0,0,.4)');
  c.fillStyle = 'rgba(40,10,10,.25)'; c.beginPath(); c.ellipse(w * .2, h * .25, w * .2, h * .08, .4, 0, Math.PI * 2); c.fill();
  c.restore();
  // paper label with handwritten title
  c.save(); c.translate(w * .06, -h * .12); c.rotate(-.04);
  c.beginPath(); c.roundRect(-w * .3, -h * .12, w * .6, h * .24, 4); fs(c, '#f1e6c8', 1.5);
  line(c, [-w * .26, h * .07, w * .26, h * .07], 1, 'rgba(120,90,60,.4)');
  c.transform(1, 0, -.18, 1, 0, 0); c.font = `700 ${Math.round(h * .15)}px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = '#2a3a6a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.title || 'Rezepte', 0, 0);
  c.restore();
  // ribbon bookmark + loose recipe slips sticking out
  c.beginPath(); c.moveTo(w * .3, h / 2 - 2); c.lineTo(w * .36, h / 2 + h * .18); c.lineTo(w * .33, h / 2 + h * .14); c.lineTo(w * .3, h / 2 + h * .19); c.closePath(); fs(c, '#c9a24a', 1.2);
  c.beginPath(); c.moveTo(w / 2 - 2, -h * .2); c.lineTo(w / 2 + w * .08, -h * .18); c.lineTo(w / 2 + w * .07, -h * .02); c.lineTo(w / 2 - 2, -h * .04); c.closePath(); fs(c, '#f4ecd6', 1.2);
  c.restore();
}
function kitchenTiles(c, x0, x1, y0, y1, col = '#e6e9ea', grout = 'rgba(80,90,95,.35)') {
  c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, r = 0; y < y1; y += 38, r++) { line(c, [x0, y, x1, y], 2, grout); for (let x = x0 + (r % 2) * 38; x < x1; x += 76) line(c, [x, y, x, y + 38], 2, grout); }
}
function hangingPans(c, x0, n, y, t) {
  line(c, [x0 - 40, y, x0 + n * 120, y], 8, '#8a9098'); for (let i = 0; i < n; i++) { const px = x0 + i * 120 + 40, sw = Math.sin(t * .5 + i) * .02; c.save(); c.translate(px, y); c.rotate(sw);
    line(c, [0, 0, 0, 30], 3, '#6a7078'); if (i % 3 === 2) { line(c, [0, 30, 0, 150], 6, '#9aa2ac'); c.beginPath(); c.ellipse(0, 165, 22, 14, 0, 0, Math.PI * 2); fs(c, '#9aa2ac', 2); }
    else { line(c, [0, 30, 0, 110], 9, '#3a3a3e'); c.beginPath(); c.ellipse(0, 170, 62 - (i % 2) * 14, 62 - (i % 2) * 14, 0, 0, Math.PI * 2); fs(c, i % 2 ? '#b87333' : '#3a3c42', 3); c.beginPath(); c.ellipse(-12, 158, 40 - (i % 2) * 10, 40 - (i % 2) * 10, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill(); }
    c.restore(); }
}
function ticketRail(c, x, y, w, t, n = 5) {
  line(c, [x, y, x + w, y], 10, '#9aa2ac'); line(c, [x, y - 3, x + w, y - 3], 2, '#e0e4e8');
  for (let i = 0; i < n; i++) { const tx = x + 30 + i * (w - 60) / Math.max(1, n - 1), sw = Math.sin(t * .8 + i * 2) * .03; c.save(); c.translate(tx, y + 4); c.rotate(sw + (rnd(i + 90) - .5) * .08); c.beginPath(); c.rect(-34, 0, 68, 110 + rnd(i) * 30); fs(c, '#fbf8ef', 1.5);
    c.font = hudFont(11); c.fillStyle = '#2a2624'; c.textAlign = 'left'; c.fillText('Tisch ' + [7, 3, 12, 5, 9, 2][i % 6], -26, 20); for (let k = 0; k < 5; k++) line(c, [-26, 34 + k * 14, 18 - rnd(i * 5 + k) * 30, 34 + k * 14], 2, 'rgba(40,40,40,.45)'); c.restore(); }
}
function spiceShelf(c, x, y, w) {
  c.beginPath(); c.rect(x, y, w, 14); fs(c, '#9aa2ac', 2); const lab = ['Salz', 'Pfeffer', 'Paprika', 'Zimt', 'Lorbeer', 'Kümmel', 'Mehl', 'Zucker'];
  for (let i = 0; i < Math.floor(w / 70); i++) { const jx = x + 20 + i * 70, hh = 70 + (i % 3) * 14; c.beginPath(); c.roundRect(jx, y - hh, 52, hh, 6); fs(c, 'rgba(220,235,240,.55)', 2); c.fillStyle = ['#c8402a', '#3a2a20', '#d0602a', '#8a5a3a', '#6a8a4a', '#5a4a30', '#f0ece0', '#f8f6f0'][i % 8]; c.fillRect(jx + 4, y - hh * .7, 44, hh * .7 - 3); c.beginPath(); c.rect(jx - 2, y - hh - 10, 56, 12); fs(c, '#4a4a50', 1.5);
    c.beginPath(); c.rect(jx + 6, y - hh * .55, 40, 18); fs(c, '#f6f1e2', 1); c.font = hudFont(8.5); c.fillStyle = '#2a2624'; c.textAlign = 'center'; c.fillText(lab[i % 8], jx + 26, y - hh * .55 + 12.5); }
}
function drawerSet(c, cam, t, o = {}) {
  const open = o.open || 0, lamp = o.lamp ?? 1, LX = 40, LY = -880;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c0d12'; c.fillRect(0, 0, W, H);
  // back wall: tiles, rail with pans, ticket rail, shelf with jars (far layer)
  layer(c, cam, .8, c => {
    kitchenTiles(c, -2600, 2600, -1600, -380, '#7d878c', 'rgba(20,25,30,.45)');
    hangingPans(c, -1300, 6, -1180, t); ticketRail(c, 420, -1180, 560, t, 5); spiceShelf(c, -1500, -720, 760); spiceShelf(c, 500, -720, 700);
    // range hood edge + a dark doorway
    c.beginPath(); c.rect(-2600, -1640, 5200, 80); fs(c, '#7a828a', 3);
    c.beginPath(); c.rect(1500, -1400, 360, 1020); fs(c, '#1a1c22', 3); line(c, [1520, -900, 1540, -900], 6, '#9aa2ac');
  });
  haze(c, '20,22,35', .5);
  // counter (world)
  layer(c, cam, 1, c => {
    const top = -420;
    // counter top + things on it
    c.beginPath(); c.rect(-1600, top - 30, 3200, 34); fs(c, '#aab2ba', 3); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-1600, top - 28, 3200, 5);
    c.beginPath(); c.rect(-1600, top - 150, 3200, 120); c.fillStyle = '#9aa2aa'; c.fill();
    // near the drawer: cutting board with clay onion + herbs, plate stack, ladle in a crock
    c.beginPath(); c.roundRect(200, top - 58, 300, 30, 6); fs(c, '#b8884e', 2.5); line(c, [215, top - 46, 485, top - 46], 1.5, 'rgba(110,70,30,.4)');
    clayBlob(c, 270, top - 76, 26, 20, '#c98a4a', { seed: 71 }); clayBlob(c, 330, top - 70, 20, 13, '#3f8a3a', { seed: 72 }); clayBlob(c, 360, top - 68, 16, 11, '#5aa04a', { seed: 73 });
    c.beginPath(); c.moveTo(390, top - 62); c.lineTo(500, top - 70); c.lineTo(500, top - 60); c.lineTo(390, top - 56); c.closePath(); fs(c, '#d8dde2', 1.8); c.beginPath(); c.rect(500, top - 72, 50, 14); fs(c, '#2a2626', 1.8);
    for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(-330, top - 34 - i * 9, 70, 12, 0, 0, Math.PI * 2); fs(c, '#f4f2ec', 2); }
    c.beginPath(); c.moveTo(-170, top - 30); c.lineTo(-178, top - 120); c.lineTo(-92, top - 120); c.lineTo(-100, top - 30); c.closePath(); fs(c, '#7a5a3a', 2.5); line(c, [-150, top - 120, -168, top - 260], 6, '#c8ccd2'); line(c, [-126, top - 120, -110, top - 250], 6, '#8a6a4a'); c.beginPath(); c.ellipse(-170, top - 268, 18, 12, -.4, 0, Math.PI * 2); fs(c, '#c8ccd2', 2);
    c.beginPath(); c.roundRect(-640, top - 66, 420, 40, 6); fs(c, '#c89a62', 2.5); line(c, [-600, top - 52, -260, top - 52], 2, 'rgba(120,80,40,.4)');
    c.beginPath(); c.moveTo(-560, top - 70); c.lineTo(-330, top - 78); c.lineTo(-330, top - 68); c.lineTo(-560, top - 64); c.closePath(); fs(c, '#d8dde2', 1.8); c.beginPath(); c.rect(-640, top - 82, 80, 20); fs(c, '#2a2626', 1.8);
    clayBlob(c, -440, top - 82, 30, 14, '#7a3a8a', { seed: 61 }); clayBlob(c, -400, top - 80, 18, 12, '#e0d6c0', { seed: 62 });
    c.beginPath(); c.moveTo(640, top - 30); c.lineTo(650, top - 130); c.lineTo(800, top - 130); c.lineTo(810, top - 30); c.closePath(); fs(c, '#8a929a', 3); line(c, [646, top - 130, 804, top - 130], 8, '#6a727a'); c.beginPath(); c.arc(725, top - 138, 12, Math.PI, 0); fs(c, '#4a4e54', 2);
    for (let k = 0; k < 2; k++) { const ph = (t * .25 + k * .5) % 1; c.beginPath(); c.moveTo(700 + k * 50, top - 150); c.bezierCurveTo(680 + k * 50, top - 230, 740 + k * 50, top - 270, 710 + k * 50 + Math.sin(t + k) * 20, top - 360 - ph * 80); c.lineWidth = 14; c.strokeStyle = `rgba(200,200,210,${.12 * Math.sin(ph * Math.PI)})`; c.lineCap = 'round'; c.stroke(); }
    c.beginPath(); c.rect(900, top - 120, 50, 90); fs(c, '#e8e0cc', 2); c.beginPath(); c.rect(970, top - 70, 120, 40); fs(c, '#d8d0bc', 2); // towel + box
    // cabinet front with drawers
    c.beginPath(); c.rect(-1600, top + 4, 3200, -top); fs(c, '#8f979f', 3);
    for (let i = -4; i <= 4; i++) { const dx = i * 360; if (i === 0) continue; c.beginPath(); c.rect(dx - 170, top + 20, 340, 120); fs(c, '#a4acb4', 2.5); line(c, [dx - 60, top + 62, dx + 60, top + 62], 9, '#d0d6dc'); line(c, [dx - 60, top + 62, dx + 60, top + 62], 2, OUT); c.beginPath(); c.rect(dx - 170, top + 156, 340, 250); fs(c, '#a0a8b0', 2.5); line(c, [dx + 140, top + 190, dx + 140, top + 300], 8, '#d0d6dc'); }
    // brushed steel streaks
    c.save(); c.globalAlpha = .12; for (let i = 0; i < 60; i++) line(c, [-1600, top + 10 + i * 7, 1600, top + 10 + i * 7], 1, i % 2 ? '#fff' : '#000'); c.restore();
    // the drawer (x -170..170). Open: front slides toward the camera (lower + bigger), interior appears above it
    const dy = open * 58, sc = 1 + open * .16, fy = top + 20 + dy;
    // dark cavity
    c.beginPath(); c.rect(-170, top + 20, 340, 120); c.fillStyle = '#121418'; c.fill();
    if (open > .01) {
      const iy0 = fy - open * 150, iw0 = 300, iw1 = 340 * sc;
      // drawer box interior (perspective trapezoid)
      c.beginPath(); c.moveTo(-iw0 / 2, iy0); c.lineTo(iw0 / 2, iy0); c.lineTo(iw1 / 2, fy); c.lineTo(-iw1 / 2, fy); c.closePath(); c.fillStyle = '#6e5a44'; c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke();
      c.save(); c.clip();
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(-iw1, iy0, iw1 * 2, 18);
      for (let i = 0; i < 6; i++) line(c, [-iw0 / 2 + i * 60, iy0, -iw1 / 2 + i * 68 * sc, fy], 1, 'rgba(40,25,10,.3)');
      // string, old keys, pencil, then the notebook (flat → foreshortened)
      line(c, [-130, fy - 30, -90, fy - 60, -40, fy - 20], 2.5, '#c8b48a');
      c.save(); c.translate(110, fy - 40); c.rotate(.3); line(c, [-40, 0, 40, 0], 6, '#e0b030'); line(c, [-40, 0, 40, 0], 1, OUT); c.restore();
      c.save(); c.translate(0, (iy0 + fy) / 2 + 6); c.scale(1, .62 + open * .1); recipeBook(c, -6, 0, 170, 150, { rot: -.06 }); c.restore();
      c.restore();
      // drawer side walls
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * iw0 / 2, iy0); c.lineTo(s * iw1 / 2, fy); c.lineTo(s * (iw1 / 2 + 6), fy); c.lineTo(s * (iw0 / 2 + 6), iy0); c.closePath(); fs(c, '#7d858d', 1.5); }
    }
    c.save(); c.translate(0, fy); c.scale(sc, sc);
    c.beginPath(); c.rect(-170, 0, 340, 120); fs(c, '#aeb6be', 3); line(c, [-60, 42, 60, 42], 10, '#d8dde2'); line(c, [-60, 42, 60, 42], 2, OUT); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-166, 3, 332, 6);
    c.restore();
    // floor
    c.fillStyle = '#2a2c30'; c.fillRect(-2000, 0, 4000, 800); for (let i = -20; i < 20; i++) line(c, [i * 120, 0, i * 160, 800], 2, 'rgba(0,0,0,.3)');
  });
  // the one warm lamp: shade + cone
  layer(c, cam, 1, c => {
    line(c, [LX, LY - 900, LX, LY - 40], 4, '#2a2a2e');
    c.beginPath(); c.moveTo(LX - 90, LY + 30); c.lineTo(LX + 90, LY + 30); c.lineTo(LX + 40, LY - 40); c.lineTo(LX - 40, LY - 40); c.closePath(); fs(c, '#2c2e34', 3);
    c.beginPath(); c.ellipse(LX, LY + 30, 90, 14, 0, 0, Math.PI * 2); c.fillStyle = lamp > 0 ? '#ffe2a0' : '#444'; c.fill();
  });
  return { base: '#0c0d12' };
}
function drawerLight(c, cam, t, o = {}) {
  const lamp = o.lamp ?? 1, LX = 40, LY = -880;
  const [lx, ly] = toScreen(cam, 1, LX, LY + 30), [fl, fy] = toScreen(cam, 1, LX - 330, -300), [fr] = toScreen(cam, 1, LX + 330, -300), z = cam.z;
  { const [px, py] = toScreen(cam, 1, 0, -380), g = c.createRadialGradient(px, py, 120 * z * .5, px, py, 760 * z * .5); g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(.55, 'rgba(8,8,18,.45)'); g.addColorStop(1, 'rgba(6,6,14,.86)'); c.save(); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createLinearGradient(0, ly, 0, fy + 200 * z); g.addColorStop(0, `rgba(255,200,120,${.42 * lamp})`); g.addColorStop(1, `rgba(255,170,90,${.05 * lamp})`);
  c.beginPath(); c.moveTo(lx - 80 * z, ly); c.lineTo(lx + 80 * z, ly); c.lineTo(fr, fy + 200 * z); c.lineTo(fl, fy + 200 * z); c.closePath(); c.fillStyle = g; c.fill();
  const [px, py] = toScreen(cam, 1, 0, -330); bloom(c, px, py, 520 * z * .6, '255,190,110', .32 * lamp);
  bloom(c, lx, ly, 260 * z * .5, '255,225,160', .7 * lamp);
  c.restore();
  // motes inside the cone
  c.save(); c.beginPath(); c.moveTo(lx - 80 * z, ly); c.lineTo(lx + 80 * z, ly); c.lineTo(fr, fy + 200 * z); c.lineTo(fl, fy + 200 * z); c.closePath(); c.clip();
  motes(c, fl, fr, ly, fy + 200 * z, t, { n: 90, speed: .018, alpha: .85 * lamp, color: '255,225,170' }); c.restore();
  grade(c, { sx: .5, sy: .1, warm: '255,170,80', warmA: .3, cool: '10,15,45', coolA: .55 });
}
