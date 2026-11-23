'use strict';
// ===== places (vertical 9:16) built from parallax layers; actors are inserted by depth =====
// item: { z: draw order, p: parallax, y: main-layer floor y (feet), fn(c, base), lit: rim opts | null, blur }
function compose(c, cam, items) {
  items.slice().sort((a, b) => a.z - b.z).forEach(it => {
    const draw = c2 => it.fn(c2, it.y != null ? FY(cam, it.y, it.p) : 0);
    if (it.lit) litLayer(c, cam, it.p, draw, Object.assign({}, it.lit, { blur: it.blur || it.lit.blur }));
    else L(c, cam, it.p, draw, it.blur || 0);
  });
}
// screen x → layer x (to place things where they should appear)
const atX = (cam, p, sx) => { const zp = 1 + (cam.z - 1) * p; return (sx - W / 2) / zp + cam.x * p; };

// ------------------------------------------------------------------ M1: 1870s studio
const ST = { HZ: -130, pw: .6, wallH: 820 };
function studioWall(c, b, t, o) {
  const top = b - ST.wallH;
  // glass ceiling (skylight) with an iron grid, bright warm sky
  let g = c.createLinearGradient(0, top - 900, 0, top); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#ffe2a8'); c.fillStyle = g; c.fillRect(-2200, top - 1400, 4400, 1420);
  for (let i = 0; i < 6; i++) { const yy = top - 40 - Math.pow(i, 1.5) * 70; ln(c, [-2200, yy, 2200, yy], 10 - i, '#3a2e26'); }
  for (let i = -20; i <= 20; i++) { const x0 = i * 120; ln(c, [x0, top, x0 * 1.6, top - 1400], 7, '#3a2e26'); }
  for (let i = 0; i < 14; i++) { const x = -900 + rnd(i + 40) * 1800, y = top - 80 - rnd(i + 60) * 500; c.fillStyle = `rgba(255,255,255,${.25 + rnd(i) * .3})`; c.fillRect(x, y, 60, 30); }
  birds(c, (o.birdX || 0) - 300, top - 380, t, 3, 1.4);
  // cornice
  c.beginPath(); c.rect(-2200, top - 24, 4400, 40); ff(c, '#5b3a22', 0); ln(c, [-2200, top + 16, 2200, top + 16], 4, '#2c1d14'); ln(c, [-2200, top - 6, 2200, top - 6], 3, '#a8774a');
  // damask wallpaper
  g = c.createLinearGradient(0, top, 0, b); g.addColorStop(0, '#c49559'); g.addColorStop(1, '#a87a48'); c.fillStyle = g; c.fillRect(-2200, top + 16, 4400, ST.wallH - 16 - 250);
  c.fillStyle = 'rgba(120,80,40,.22)';
  for (let yy = top + 60; yy < b - 270; yy += 84) for (let xx = -2160; xx < 2200; xx += 72) { const ox = ((yy / 84) | 0) % 2 ? 36 : 0; c.beginPath(); c.moveTo(xx + ox, yy - 18); c.quadraticCurveTo(xx + ox + 12, yy, xx + ox, yy + 18); c.quadraticCurveTo(xx + ox - 12, yy, xx + ox, yy - 18); c.fill(); }
  // dado + wainscot
  c.fillStyle = '#6e4226'; c.fillRect(-2200, b - 255, 4400, 255); ln(c, [-2200, b - 255, 2200, b - 255], 8, '#4a2a16'); ln(c, [-2200, b - 262, 2200, b - 262], 3, '#b07a48');
  for (let xx = -2160; xx < 2200; xx += 150) { c.beginPath(); c.roundRect(xx, b - 220, 120, 170, 6); c.lineWidth = 3; c.strokeStyle = '#4a2a16'; c.stroke(); ln(c, [xx + 4, b - 216, xx + 116, b - 216], 2, '#9a6a3e'); }
  c.fillStyle = '#3e2414'; c.fillRect(-2200, b - 34, 4400, 34);
  // window (left) with a street outside
  windowView(c, -560, b - 690, 160, 420, t, o);
  // door with the enamel sign
  door(c, -330, b, t, o);
  // regulator clock
  wallClock(c, -150, b - 600, t, 1.15);
  // frames above the door and left of the backdrop
  [[-420, b - 800, 70, 90, 3, 0], [-250, b - 790, 60, 76, 5, 1], [-170, b - 790, 46, 60, 8, 0], [-60, b - 795, 64, 84, 11, 1], [40, b - 800, 74, 92, 17, 0], [140, b - 792, 56, 72, 21, 1], [220, b - 798, 70, 90, 23, 0]].forEach(([x, y, w, h, s, ov]) => photoFrame(c, x, y, w, h, { seed: s, oval: ov }));
  // painted backdrop on a roller: columns, balustrade and a garden in soft sepia-green
  backdrop(c, -100, b - 690, 380, 660, t);
  curtain(c, -150, b - 790, b, 95, t, 1); curtain(c, 330, b - 790, b, 95, t, -1);
  ln(c, [-220, b - 795, 400, b - 795], 7, BRASS.d);
  // right side: shelves with plates and bottles, more frames
  shelves(c, 320, b, t);
  [[330, b - 790, 62, 80, 31, 1], [410, b - 780, 70, 88, 33, 0], [500, b - 790, 58, 74, 37, 1]].forEach(([x, y, w, h, s, ov]) => photoFrame(c, x, y, w, h, { seed: s, oval: ov }));
}
function windowView(c, x, y, w, h, t, o) {
  c.save(); c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.clip();
  let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fff1cf'); g.addColorStop(1, '#e8c58a'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = '#c9a676'; c.fillRect(x - 10, y + 120, 70, 300); c.fillStyle = '#b8936a'; c.fillRect(x + 70, y + 90, 110, 330);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { c.fillStyle = 'rgba(110,80,50,.5)'; c.fillRect(x + 84 + i * 30, y + 110 + j * 60, 14, 30); }
  c.fillStyle = '#9a7a58'; c.fillRect(x, y + h - 70, w, 70);
  const ct = o.carT != null ? o.carT : t; carriage(c, x - 160 + ((ct * 150) % 520), y + h - 50, t, .85);
  birds(c, x - 20, y + 60, t, 2, .9);
  c.restore();
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.lineWidth = 12; c.strokeStyle = '#4a2c18'; c.stroke();
  ln(c, [x + w / 2, y, x + w / 2, y + h], 6, '#4a2c18'); for (let i = 1; i < 4; i++) ln(c, [x, y + w / 2 + i * (h - w / 2) / 4, x + w, y + w / 2 + i * (h - w / 2) / 4], 5, '#4a2c18');
  c.beginPath(); c.rect(x - 16, y + h, w + 32, 16); ff(c, '#6e4226', 3);
  bloom(c, x + w / 2, y + h * .5, 260, '255,230,170', .35);
}
function door(c, x, b, t, o) {
  const w = 130, h = 470, open = o.doorOpen || 0;
  c.beginPath(); c.rect(x - 10, b - h - 14, w + 20, h + 14); ff(c, '#4a2c18', 3);
  // light through the open door
  c.fillStyle = '#fff0cf'; c.fillRect(x, b - h, w, h); bloom(c, x + w / 2, b - h / 2, 260 * open, '255,235,190', .5 * open);
  c.save(); c.translate(x, b - h); c.scale(1 - open * .82, 1);
  c.beginPath(); c.rect(0, 0, w, h); ff(c, '#7a4626', 3);
  c.beginPath(); c.roundRect(14, 16, w - 28, 170, 6); ff(c, '#f0e2c0', 3); for (let i = 1; i < 3; i++) ln(c, [14, 16 + i * 57, w - 14, 16 + i * 57], 3, '#4a2c18'); ln(c, [w / 2, 16, w / 2, 186], 3, '#4a2c18');
  c.beginPath(); c.roundRect(-6, 204, w + 12, 50, 8); ff(c, '#1d2b24', 3); c.beginPath(); c.roundRect(0, 210, w, 38, 6); c.lineWidth = 2; c.strokeStyle = BRASS.l; c.stroke(); serif(c, 'Fotoatelier', w / 2, 229.5, 21, '#f2d589');
  c.beginPath(); c.roundRect(14, 300, w - 28, 150, 6); c.lineWidth = 3; c.strokeStyle = '#4a2c18'; c.stroke();
  // enamel sign "Fotoatelier"
  c.beginPath(); c.arc(w - 16, 270, 6, 0, 7); ff(c, BRASS.m, 2);
  c.restore();

}
function backdrop(c, x, y, w, h, t) {
  // roller + painted canvas
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#d9cfb0'); g.addColorStop(.6, '#b9b08e'); g.addColorStop(1, '#8f876a'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(120,130,100,.55)'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(x + 30 + i * 60, y + 330 + Math.sin(i) * 20, 70 + rnd(i) * 30, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(90,100,75,.6)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x + 50 + i * 80, y + 380, 60, 0, 7); c.fill(); }
  // two columns + balustrade
  for (const cx of [x + 50, x + w - 50]) { c.fillStyle = '#e7dcc2'; c.fillRect(cx - 24, y + 70, 48, 470); c.fillStyle = 'rgba(120,100,70,.35)'; c.fillRect(cx + 8, y + 70, 16, 470); for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(120,100,70,.25)'; c.fillRect(cx - 20 + i * 12, y + 70, 3, 470); } c.fillStyle = '#d8ccb0'; c.fillRect(cx - 34, y + 50, 68, 24); c.fillRect(cx - 34, y + 530, 68, 24); }
  c.fillStyle = '#d6cab0'; c.fillRect(x, y + 470, w, 22); for (let i = 0; i < 12; i++) { c.beginPath(); c.ellipse(x + 20 + i * 32, y + 530, 9, 34, 0, 0, 7); c.fill(); } c.fillRect(x, y + 560, w, 18);
  c.fillStyle = '#7d7458'; c.fillRect(x, y + 580, w, h - 580);
  c.restore();
  c.beginPath(); c.rect(x, y, w, h); c.lineWidth = 3; c.strokeStyle = 'rgba(60,40,20,.6)'; c.stroke();
  c.beginPath(); c.roundRect(x - 16, y - 18, w + 32, 22, 10); ff(c, WOOD.d, 3); for (const s of [x - 16, x + w + 16]) { c.beginPath(); c.arc(s, y - 7, 11, 0, 7); ff(c, BRASS.m, 2); }
}
function shelves(c, x, b, t) {
  for (let r = 0; r < 3; r++) {
    const y = b - 300 - r * 130; c.beginPath(); c.rect(x, y, 230, 12); ff(c, WOOD.m, 2.5);
    for (let i = 0; i < 6; i++) {
      const bx = x + 14 + i * 36, kind = (i + r) % 3, hh = 50 + rnd(i * 3 + r) * 40;
      if (kind === 0) { c.beginPath(); c.roundRect(bx, y - hh, 22, hh, 4); ff(c, ['#7a4a1c', '#3d5a6e', '#5e2a1e'][r], 2); c.beginPath(); c.roundRect(bx + 6, y - hh - 12, 10, 14, 2); ff(c, '#2a1c14', 1.5); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(bx + 4, y - hh + 6, 4, hh - 12); c.fillStyle = '#efe1c0'; c.fillRect(bx + 3, y - hh * .6, 16, 14); }
      else if (kind === 1) { for (let p = 0; p < 4; p++) { c.beginPath(); c.rect(bx + p * 4, y - 70, 3, 70); ff(c, 'rgba(200,225,230,.7)', 1); } }
      else { c.beginPath(); c.rect(bx, y - 40, 30, 40); ff(c, '#5a3a24', 2); ln(c, [bx + 4, y - 30, bx + 26, y - 30], 2, '#c9a67a'); }
    }
  }
}
function studioFloor(c, t, o) {
  const HZ = ST.HZ;
  let g = c.createLinearGradient(0, HZ, 0, 700); g.addColorStop(0, '#7a4e2c'); g.addColorStop(1, '#4a2c18'); c.fillStyle = g; c.fillRect(-3000, HZ, 6000, 1500);
  for (let i = 0; i < 12; i++) { const y = HZ + Math.pow(i / 11, 1.6) * 820; ln(c, [-3000, y, 3000, y], 2.2, 'rgba(40,20,10,.45)'); }
  for (let i = -30; i <= 30; i++) ln(c, [i * 40, HZ, i * 130, 900], 1.6, 'rgba(40,20,10,.35)');
  // persian rug under the chair
  c.beginPath(); c.moveTo(-60, HZ + 40); c.lineTo(380, HZ + 40); c.lineTo(470, 120); c.lineTo(-150, 120); c.closePath(); ff(c, '#7a2424', 3);
  c.beginPath(); c.moveTo(-36, HZ + 52); c.lineTo(356, HZ + 52); c.lineTo(430, 104); c.lineTo(-110, 104); c.closePath(); c.lineWidth = 6; c.strokeStyle = '#c99a45'; c.stroke();
  for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(-40 + i * 52, 20, 14, 6, 0, 0, 7); c.fillStyle = 'rgba(210,170,90,.55)'; c.fill(); }
  // light pool from the skylight
  c.save(); c.globalCompositeOperation = 'screen'; const lp = c.createRadialGradient(150, 0, 0, 150, 0, 420); lp.addColorStop(0, 'rgba(255,220,150,.35)'); lp.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = lp; c.beginPath(); c.ellipse(150, 0, 420, 120, 0, 0, 7); c.fill(); c.restore();
}
// light shafts from the glass ceiling (layer coords) + window beam
function studioRays(c, b, t, o) {
  sunRays(c, (o.rayX ?? 60), b - ST.wallH - 200, { n: 9, len: 1500, spread: .55, dir: Math.PI / 2 + .08, alpha: (o.rayA ?? .26), t, color: '255,236,190' });
  sunRays(c, -480, b - 480, { n: 4, len: 900, spread: .22, dir: .5, alpha: .12, t, color: '255,228,170' });
}
// full studio: o = { t, items:[], rayX, rayA, fg:[...], grade, doorOpen, carT }
function studio(c, cam, t, o = {}) {
  scr(c); c.fillStyle = '#2c1c12'; c.fillRect(0, 0, W, H);
  const items = [
    { z: 0, p: ST.pw, y: ST.HZ, fn: (c2, b) => studioWall(c2, b, t, o) },
    { z: .5, p: ST.pw, y: ST.HZ, fn: () => haze(c, '255,220,160', .06) },
    { z: 1, p: 1, fn: c2 => studioFloor(c2, t, o) },
    { z: 1.5, p: ST.pw + .1, y: ST.HZ, fn: (c2, b) => studioRays(c2, b, t, o) },
    ...(o.items || []),
  ];
  compose(c, cam, items);
  // floating dust in the beams (screen space, after actors)
  scr(c); motes(c, 60, 1020, 0, 1700, t, { n: 46, speed: .025, alpha: .65, color: '255,240,200' });
  grade(c, { sx: .5, sy: -.05, warm: '255,196,120', warmA: .3, cool: '40,22,30', coolA: .28 });
  sepiaWash(c, .1);
}
function sepiaWash(c, a) { scr(c); c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(200,150,80,${a * 2})`; c.fillRect(0, 0, W, H); c.restore(); }
// blurred foreground elements: fixed on-screen size (S px per unit), parallax translation of layer p
function fgItem(cam, p, sx, sy, S, blur, draw) { return { z: 50, p, blur, fn: c => { const zp = zpOf(cam, p), [x, y] = fromScr(cam, p, sx, sy); c.save(); c.translate(x, y); c.scale(S / zp, S / zp); draw(c); c.restore(); } }; }
function fgCurtain(cam, sx, t, side = 1, p = 1.6, blur = 14) { return fgItem(cam, p, sx, -40, 3.4, blur, c => curtain(c, -side * 70, 0, 640, 130, t, side)); }
function fgVase(cam, sx, t, p = 1.6, blur = 12, sy = 1960) { return fgItem(cam, p, sx, sy, 3.2, blur, c => sideTable(c, 0, 0, t)); }
function fgBellows(cam, sx, sy, t, p = 1.6, blur = 14) { return fgItem(cam, p, sx, sy, 2.6, blur, c => { c.rotate(-.1); bigCamera(c, 0, 268, { tripod: false, bulb: false, t }); }); }
function fgTripod(cam, sx, t, p = 1.6, blur = 12) { return fgItem(cam, p, sx, 1960, 3, blur, c => { for (const [fx, w] of [[-60, 10], [50, 10]]) { c.beginPath(); c.moveTo(-6, -420); c.lineTo(6, -420); c.lineTo(fx + w / 2, 0); c.lineTo(fx - w / 2, 0); c.closePath(); ff(c, WOOD.m, 2); } }); }

// ------------------------------------------------------------------ M2: darkroom (red safelight)
function darkroom(c, cam, t, o = {}) {
  scr(c); c.fillStyle = '#120405'; c.fillRect(0, 0, W, H);
  const HZ = -110, pw = .62;
  const items = [
    { z: 0, p: pw, y: HZ, fn: (c2, b) => {
      let g = c2.createLinearGradient(0, b - 1100, 0, b); g.addColorStop(0, '#2a0a0c'); g.addColorStop(1, '#4a1418'); c2.fillStyle = g; c2.fillRect(-1600, b - 1500, 3200, 1500);
      for (let r = 0; r < 26; r++) for (let i = 0; i < 30; i++) { const x = -1600 + i * 110 + (r % 2) * 55, y = b - 1500 + r * 58; c2.strokeStyle = 'rgba(0,0,0,.25)'; c2.lineWidth = 3; c2.strokeRect(x, y, 110, 58); }
      // door with sign
      const dx = -330; c2.beginPath(); c2.rect(dx, b - 480, 140, 480); ff(c2, '#3a1210', 3); c2.beginPath(); c2.rect(dx + 14, b - 460, 112, 200); c2.lineWidth = 3; c2.strokeStyle = '#1a0606'; c2.stroke();
      c2.beginPath(); c2.roundRect(dx - 6, b - 340, 152, 44, 7); ff(c2, '#f1e4cc', 3); serif(c2, 'Dunkelkammer', dx + 70, b - 318, 18.5, '#3a0c0c');
      c2.fillStyle = 'rgba(255,90,70,.5)'; c2.fillRect(dx, b - 8, 140, 8);
      // shelves with bottles and trays
      for (let r = 0; r < 3; r++) { const y = b - 380 - r * 150; c2.beginPath(); c2.rect(80, y, 300, 12); ff(c2, '#3a1612', 2.5);
        for (let i = 0; i < 7; i++) { const bx = 95 + i * 40, hh = 50 + rnd(i + r * 7) * 50; c2.beginPath(); c2.roundRect(bx, y - hh, 26, hh, 5); ff(c2, ['#5a1410', '#2a1418', '#6e2a14'][(i + r) % 3], 2); c2.fillStyle = 'rgba(255,120,110,.35)'; c2.fillRect(bx + 4, y - hh + 6, 5, hh - 12); c2.beginPath(); c2.roundRect(bx + 8, y - hh - 12, 10, 14, 2); ff(c2, '#1a0a0a', 1.5); } }
      // drying line with glass plates (sway)
      ln(c2, [-600, b - 820, 600, b - 790], 2.5, '#2a0a0a');
      for (let i = 0; i < 8; i++) { const px = -520 + i * 140, py = b - 815 + i * 3.6, sw = Math.sin(t * 1.6 + i) * .06; c2.save(); c2.translate(px, py); c2.rotate(sw); ln(c2, [-10, 0, -10, 14], 2, '#2a0a0a'); c2.beginPath(); c2.rect(-40, 14, 70, 92); ff(c2, 'rgba(255,150,140,.25)', 2.5); c2.fillStyle = 'rgba(40,0,0,.5)'; c2.beginPath(); c2.arc(-5, 52, 16, 0, 7); c2.fill(); c2.fillRect(-22, 66, 34, 34); c2.restore();
        const dp = (t * .7 + i * .37) % 1; c2.beginPath(); c2.arc(px - 5, py + 108 + dp * 120, 3, 0, 7); c2.fillStyle = `rgba(255,140,130,${.7 * (1 - dp)})`; c2.fill(); }
      // safelight lamp
      const lx = 220, ly = b - 700, fl = .92 + .08 * Math.sin(t * 17) * Math.sin(t * 5.3);
      c2.beginPath(); c2.roundRect(lx - 40, ly - 60, 80, 110, 10); ff(c2, '#2a1210', 3); c2.beginPath(); c2.roundRect(lx - 28, ly - 44, 56, 76, 6); c2.fillStyle = `rgb(${Math.round(255 * fl)},40,30)`; c2.fill();
      ln(c2, [lx, ly - 60, lx, ly - 140], 4, '#1a0808');
      bloom(c2, lx, ly - 6, 700, '255,40,30', .55 * fl); bloom(c2, lx, ly - 6, 160, '255,120,100', .8 * fl);
    } },
    { z: .5, p: pw, fn: () => haze(c, '140,10,10', .08) },
    { z: 1, p: 1, fn: c2 => { c2.fillStyle = '#2a0a0a'; c2.fillRect(-3000, HZ, 6000, 1600); for (let i = 0; i < 10; i++) ln(c2, [-3000, HZ + Math.pow(i / 9, 1.6) * 700, 3000, HZ + Math.pow(i / 9, 1.6) * 700], 2, 'rgba(0,0,0,.35)'); } },
    ...(o.items || []),
  ];
  compose(c, cam, items);
  scr(c); motes(c, 60, 1020, 200, 1700, t, { n: 26, speed: .02, alpha: .45, color: '255,120,100' });
  const rk = o.red ?? 1; c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(255,120,110,${.55 * rk})`; c.fillRect(0, 0, W, H); c.restore();
  grade(c, { sx: .2, sy: .15, warm: '255,60,40', warmA: .3 * rk, cool: '20,0,10', coolA: .5 * rk });
}
function trayBench(c, x, y, t) { // workbench with developing trays + steam (world)
  c.beginPath(); c.rect(x - 230, y - 190, 460, 26); ff(c, '#4a1a14', PW); c.beginPath(); c.rect(x - 220, y - 164, 440, 164); ff(c, '#3a1210', PW);
  for (let i = 0; i < 3; i++) { ln(c, [x - 220, y - 110 + i * 40, x + 220, y - 110 + i * 40], 2, 'rgba(0,0,0,.4)'); }
  for (const [tx, col] of [[-130, '#c8c0b0'], [0, '#b0a898'], [130, '#d0c8b8']]) { c.beginPath(); c.moveTo(x + tx - 56, y - 196); c.lineTo(x + tx + 56, y - 196); c.lineTo(x + tx + 50, y - 214); c.lineTo(x + tx - 50, y - 214); c.closePath(); ff(c, col, 2.5); c.fillStyle = 'rgba(120,20,20,.5)'; c.fillRect(x + tx - 46, y - 212, 92, 8); steam(c, x + tx, y - 214, t + tx, { n: 4, h: 140, r: 10, a: .3, col: '255,170,160' }); }
  c.beginPath(); c.roundRect(x + 190, y - 260, 26, 64, 5); ff(c, '#5a1410', 2); c.beginPath(); c.roundRect(x - 210, y - 250, 22, 54, 5); ff(c, '#2a1418', 2);
}

// ------------------------------------------------------------------ M4: today's living room (night, warm lamp)
function livingRoom(c, cam, t, o = {}) {
  scr(c); c.fillStyle = '#141820'; c.fillRect(0, 0, W, H);
  const HZ = -120, pw = .6, fl = o.flicker ?? 1;
  const items = [
    { z: 0, p: pw, y: HZ, fn: (c2, b) => {
      let g = c2.createLinearGradient(0, b - 1000, 0, b); g.addColorStop(0, '#34404c'); g.addColorStop(1, '#46525e'); c2.fillStyle = g; c2.fillRect(-1600, b - 1500, 3200, 1500);
      for (let i = 0; i < 40; i++) { c2.fillStyle = 'rgba(255,255,255,.035)'; c2.fillRect(-1600 + i * 80, b - 1500, 36, 1500); }
      // window with night city
      const wx = -560, wy = b - 820, ww = 340, wh = 560; c2.save(); c2.beginPath(); c2.rect(wx, wy, ww, wh); c2.clip();
      g = c2.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#0e1a33'); g.addColorStop(1, '#2a3550'); c2.fillStyle = g; c2.fillRect(wx, wy, ww, wh);
      c2.beginPath(); c2.arc(wx + 80, wy + 90, 26, 0, 7); c2.fillStyle = '#f3efd8'; c2.fill(); bloom(c2, wx + 80, wy + 90, 120, '220,230,255', .4);
      for (let i = 0; i < 8; i++) { const bx = wx - 20 + i * 52, bh = 160 + rnd(i + 5) * 260; c2.fillStyle = '#0a0f1c'; c2.fillRect(bx, wy + wh - bh, 46, bh); for (let j = 0; j < 12; j++) if (rnd(i * 13 + j) > .45) { const tw = .55 + .45 * Math.sin(t * (1 + rnd(j)) * 2 + i + j); c2.fillStyle = `rgba(255,${200 + j * 3},120,${.85 * tw})`; c2.fillRect(bx + 6 + (j % 3) * 13, wy + wh - bh + 14 + Math.floor(j / 3) * 34, 7, 12); } }
      for (let i = 0; i < 14; i++) { const x = wx + rnd(i + 70) * ww, y = wy + wh - 30 - rnd(i + 90) * 80, r = 8 + rnd(i) * 14; bloom(c2, x, y, r * 2, i % 2 ? '255,200,120' : '160,200,255', .35 * (.6 + .4 * Math.sin(t * 2 + i))); }
      c2.restore(); c2.beginPath(); c2.rect(wx, wy, ww, wh); c2.lineWidth = 14; c2.strokeStyle = '#e8e4dc'; c2.stroke(); ln(c2, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 8, '#e8e4dc');
      curtain(c2, wx - 40, wy - 60, b, 110, t, 1, { d: '#5a6a7a', m: '#7a8a9a', l: '#9aaaba' }); curtain(c2, wx + ww + 40, wy - 60, b, 110, t, -1, { d: '#5a6a7a', m: '#7a8a9a', l: '#9aaaba' });
      // shelf with books + framed photos + a little plant
      c2.beginPath(); c2.rect(80, b - 560, 380, 14); ff(c2, '#c8b49a', 2.5);
      for (let i = 0; i < 12; i++) { const hh = 70 + rnd(i + 3) * 40; c2.beginPath(); c2.rect(90 + i * 22, b - 560 - hh, 18, hh); ff(c2, ['#a04a3a', '#3a6a7a', '#d0a050', '#5a4a7a', '#4a7a4a'][i % 5], 2); }
      photoFrame(c2, 380, b - 660, 60, 80, { seed: 44, frame: '#2a2a2a' });
      c2.beginPath(); c2.rect(80, b - 380, 380, 14); ff(c2, '#c8b49a', 2.5);
      c2.beginPath(); c2.roundRect(110, b - 450, 40, 70, 6); ff(c2, '#d8d0c0', 2); for (let i = 0; i < 5; i++) { const a = -2.6 + i * .5 + Math.sin(t * 1.2 + i) * .06; c2.beginPath(); c2.ellipse(130 + Math.cos(a) * 34, b - 455 + Math.sin(a) * 34, 26, 9, a, 0, 7); ff(c2, '#5f9a5a', 1.6); }
      // modern wall clock
      c2.beginPath(); c2.arc(-60, b - 700, 46, 0, 7); ff(c2, '#f4f1ea', 3); ln(c2, [-60, b - 700, -60 + Math.cos(t * .5) * 30, b - 700 + Math.sin(t * .5) * 30], 3, '#222'); ln(c2, [-60, b - 700, -60 + Math.cos(-1) * 20, b - 700 + Math.sin(-1) * 20], 4, '#222'); ln(c2, [-60, b - 700, -60 + Math.cos(t * 6.28 / 60 * 6) * 38, b - 700 + Math.sin(t * 6.28 / 60 * 6) * 38], 1.4, '#c33');
    } },
    { z: 1, p: 1, fn: c2 => { c2.fillStyle = '#3a3230'; c2.fillRect(-3000, HZ, 6000, 1600); c2.beginPath(); c2.ellipse(0, 40, 420, 90, 0, 0, 7); ff(c2, '#8a6a5a', 0); c2.beginPath(); c2.ellipse(0, 40, 380, 76, 0, 0, 7); c2.lineWidth = 6; c2.strokeStyle = '#a8887a'; c2.stroke(); } },
    { z: 1.5, p: .92, y: HZ + 40, fn: (c2, b) => floorLamp(c2, o.lampX ?? 170, b, t, fl) },
    ...(o.items || []),
  ];
  compose(c, cam, items);
  scr(c); motes(c, 400, 1080, 200, 1500, t, { n: 22, speed: .015, alpha: .4, color: '255,220,170' });
  grade(c, { sx: .85, sy: .3, warm: '255,180,100', warmA: .36 * fl, cool: '20,30,60', coolA: .42 });
}

// ------------------------------------------------------------------ collage wall of hidden-mother photos
function collage(c, cam, t, o = {}) {
  scr(c); c.fillStyle = '#2a1a12'; c.fillRect(0, 0, W, H);
  const items = [
    { z: 0, p: .6, fn: c2 => {
      c2.fillStyle = '#5a3a24'; c2.fillRect(-1200, -3000, 2400, 6000);
      c2.fillStyle = 'rgba(30,15,8,.25)'; for (let y = -3000; y < 3000; y += 70) for (let x = -1200; x < 1200; x += 60) { c2.beginPath(); c2.arc(x + ((y / 70) % 2 ? 30 : 0), y, 8, 0, 7); c2.fill(); }
      for (let i = 0; i < 40; i++) { const col = i % 5, row = Math.floor(i / 5), w = 90 + rnd(i) * 30, h = w * 1.3; const x = -330 + col * 140 + (rnd(i + 2) - .5) * 20, y = -1500 + row * 230 + (rnd(i + 5) - .5) * 30; photoFrame(c2, x, y, w, h, { oval: i % 3 === 0, frame: i % 2 ? '#3a2a1c' : '#8a6a34', draw: (cc, cx, cy, ww, hh) => hiddenMotherPhoto(cc, cx, cy, ww, hh, i + 3) }); }
    } },
    { z: .5, p: .6, fn: () => haze(c, '40,20,10', .25) },
    { z: 1, p: 1, fn: c2 => {
      for (let i = 0; i < 16; i++) { const col = i % 2, row = Math.floor(i / 2), w = 150 + rnd(i + 30) * 30, h = w * 1.32, sw = Math.sin(t * 1.4 + i) * .025;
        const x = (col ? 40 : -200) + (rnd(i + 31) - .5) * 40, y = -1300 + row * 330 + (rnd(i + 33) - .5) * 40;
        c2.save(); c2.translate(x + w / 2, y - 40); c2.rotate(sw + (rnd(i + 40) - .5) * .08); ln(c2, [-w * .3, 40, 0, 0, w * .3, 40], 2, '#2a1a10'); c2.beginPath(); c2.arc(0, 0, 4, 0, 7); ff(c2, BRASS.m, 1.4);
        photoFrame(c2, -w / 2, 40, w, h, { oval: i % 3 === 1, frame: i % 2 ? '#8a6a34' : '#3a2a1c', draw: (cc, cx, cy, ww, hh) => hiddenMotherPhoto(cc, cx, cy, ww, hh, i + 101) }); c2.restore(); }
    } },
    ...(o.items || []),
  ];
  compose(c, cam, items);
  scr(c); motes(c, 0, 1080, 0, 1920, t, { n: 40, speed: .02, alpha: .5 });
  grade(c, { sx: .5, sy: 0, warm: '255,200,130', warmA: .3, cool: '30,15,10', coolA: .35 });
  sepiaWash(c, .12);
}
