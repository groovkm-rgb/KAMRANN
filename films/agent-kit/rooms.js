// GENERIC INTERIOR + PROPS (side-on, floor y = 0, back wall in a .9 parallax layer). Scale ≈ room built for k ≈ .5–.7 people.
//   room(c, cam, t, o)  o = { wall, floor, floorType: 'wood'|'carpet'|'tile', light: 'night'|'warm'|'day'|'grey'|'cold',
//        windows: [{ x, w, h, y, view: 'rain'|'city'|'day'|'dusk'|'fog'|'none', blinds }], doors: [x], pictures: [[x,y]],
//        shelf: x, lampsCeil: [x], back: fn(c, b, t) extra wall decor, floorFn: fn(c, t) floor-layer props }
// props (world, floor-based): sofa, dinTable, chairBack, cake, tv, laptop, counter, bookshelf, floorLamp, pendantLamp, hotelBed,
//   kidsBed, cabinetLow, door, plant, mirrorWall, interrogTable, podium, filingStack
const RM = { HZ: -170 };
function viewRect(c, x, y, w, h, view, t) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const P = { rain: ['#0b1124', '#25305a'], city: ['#0d1430', '#2b3466'], day: ['#8fb8d8', '#dbe8ee'], dusk: ['#4a4a7a', '#d99a7a'], fog: ['#9aa4ae', '#c8ccd0'], grey: ['#9aa6b4', '#c9d0d6'] }[view] || ['#111', '#222'];
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, P[0]); g.addColorStop(1, P[1]); c.fillStyle = g; c.fillRect(x, y, w, h);
  const night = view === 'rain' || view === 'city';
  for (let i = 0; i < Math.ceil(w / 60) + 1; i++) { const bx = x - 20 + i * 64, bh = h * (.25 + rnd(i * 7 + (x | 0)) * .5); c.fillStyle = night ? '#0c1020' : view === 'fog' ? 'rgba(120,128,138,.6)' : 'rgba(110,125,145,.8)'; c.fillRect(bx, y + h - bh, 54, bh);
    if (night) for (let r = 0; r < bh / 30; r++) if (rnd(i * 31 + r * 5 + (x | 0)) > .72) { c.fillStyle = 'rgba(255,200,120,.75)'; c.fillRect(bx + 12, y + h - bh + 10 + r * 30, 12, 14); } }
  if (view === 'rain') windowRain(c, x, y, w, h, t, { n: Math.round(w * h / 6000), rivulets: Math.round(w / 60) });
  c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(x + w * .2, y); c.lineTo(x + w * .45, y); c.lineTo(x + w * .1, y + h); c.lineTo(x - w * .15, y + h); c.fill();
  c.restore();
}
function room(c, cam, t, o = {}) {
  const HZ = o.HZ ?? RM.HZ, B = p => layerBase(cam, HZ, p), L = o.light || 'warm';
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.wall || '#5a4a40'; c.fillRect(0, 0, W, H);
  layer(c, cam, .9, c => {
    const b = B(.9), wall = o.wall || '#5a4a40';
    let g = c.createLinearGradient(0, b - 1600, 0, b); g.addColorStop(0, shade(wall, -.25)); g.addColorStop(1, wall); c.fillStyle = g; c.fillRect(-5000, b - 3000, 10000, 3000);
    if (o.wallpaper !== false) for (let x = -5000; x < 5000; x += 80) { c.fillStyle = 'rgba(255,255,255,.025)'; c.fillRect(x, b - 3000, 26, 3000); }
    if (o.wainscot) { c.fillStyle = shade(wall, -.15); c.fillRect(-5000, b - 380, 10000, 380); for (let x = -5000; x < 5000; x += 260) { c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.strokeRect(x + 20, b - 350, 220, 300); } c.fillStyle = shade(wall, .1); c.fillRect(-5000, b - 392, 10000, 14); }
    c.beginPath(); c.rect(-5000, b - 30, 10000, 30); fs(c, shade(wall, -.35), 2);
    for (const wd of o.windows || []) {
      const wy = b - (wd.y ?? 1050), wh = wd.h ?? 620, ww = wd.w ?? 520;
      viewRect(c, wd.x, wy, ww, wh, wd.view || 'rain', t);
      if (wd.blinds) { c.save(); c.beginPath(); c.rect(wd.x, wy, ww, wh); c.clip(); for (let k = 0; k < wh * wd.blinds / 22; k++) { c.fillStyle = '#3a3e48'; c.fillRect(wd.x, wy + k * 22, ww, 14); } c.restore(); }
      c.beginPath(); c.rect(wd.x - 16, wy - 16, ww + 32, wh + 32); c.lineWidth = 18; c.strokeStyle = o.frame || '#e8e2d6'; c.stroke(); c.lineWidth = 3; c.strokeStyle = OUT; c.strokeRect(wd.x - 25, wy - 25, ww + 50, wh + 50);
      line(c, [wd.x + ww / 2, wy, wd.x + ww / 2, wy + wh], 9, o.frame || '#e8e2d6'); c.beginPath(); c.rect(wd.x - 34, wy + wh + 12, ww + 68, 20); fs(c, o.frame || '#e8e2d6', 2);
      if (wd.curtains !== false) for (const s of [0, 1]) { const cx = s ? wd.x + ww + 26 : wd.x - 120; c.beginPath(); c.moveTo(cx, wy - 60); c.lineTo(cx + 94, wy - 60); for (let i = 0; i <= 8; i++) c.lineTo(cx + 94 - (i % 2) * 12, wy - 30 + i * (wh + 160) / 8); c.lineTo(cx, wy + wh + 130); c.closePath(); fs(c, o.curtain || '#6a3a3a', 2.5); }
    }
    for (const dx of o.doors || []) door(c, dx, b);
    for (const [px, py, kind] of o.pictures || []) { c.beginPath(); c.rect(px, b - py, 150, 190); fs(c, '#3a2a20', 4); c.fillStyle = '#d8d0c0'; c.fillRect(px + 12, b - py + 12, 126, 166); if (kind === 'family') { drawPalHead(c, px + 50, b - py + 90, .1, 'wife', { mouth: 'smile' }); drawNoahHead(c, px + 100, b - py + 85, .1, { mouth: 'smile' }); } else { c.fillStyle = ['#7fa66a', '#d98e6a', '#6a8ab0'][(px | 0) % 3]; c.beginPath(); c.moveTo(px + 14, b - py + 176); c.lineTo(px + 60, b - py + 90); c.lineTo(px + 90, b - py + 130); c.lineTo(px + 136, b - py + 70); c.lineTo(px + 136, b - py + 176); c.fill(); } }
    if (o.shelf != null) bookshelf(c, o.shelf, b);
    if (o.back) o.back(c, b, t);
    for (const lx of o.lampsCeil || []) { line(c, [lx, b - 2000, lx, b - 1200], 5, '#222'); c.beginPath(); c.moveTo(lx - 110, b - 1120); c.lineTo(lx + 110, b - 1120); c.lineTo(lx + 40, b - 1210); c.lineTo(lx - 40, b - 1210); c.closePath(); fs(c, '#2a2a30', 3); const on = o.lampOn !== false; if (on) { bloom(c, lx, b - 1110, 380, L === 'cold' ? '210,225,255' : '255,210,140', .55); c.save(); c.globalCompositeOperation = 'screen'; const gg = c.createLinearGradient(0, b - 1120, 0, b); gg.addColorStop(0, `rgba(${L === 'cold' ? '210,225,255' : '255,215,150'},.28)`); gg.addColorStop(1, 'rgba(255,215,150,0)'); c.fillStyle = gg; c.beginPath(); c.moveTo(lx - 100, b - 1120); c.lineTo(lx + 100, b - 1120); c.lineTo(lx + 600, b + 200); c.lineTo(lx - 600, b + 200); c.closePath(); c.fill(); c.restore(); } }
  });
  layer(c, cam, 1, c => {
    const fl = o.floor || '#4a3428', ft = o.floorType || 'wood';
    c.fillStyle = fl; c.fillRect(-6000, HZ, 12000, 3000);
    if (ft === 'wood') for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.03)'; c.fillRect(-6000, HZ + i * 36, 12000, 36); }
    else if (ft === 'tile') for (let r = 0; r < 8; r++) for (let k = -60; k < 60; k++) { c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 2; c.strokeRect(k * 120 + (r % 2) * 60, HZ + r * 60, 120, 60); }
    else { for (let i = 0; i < 400; i++) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-3000 + rnd(i) * 6000, HZ + rnd(i + 9) * 600, 6, 3); } }
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-6000, HZ, 12000, 20);
    if (o.rug) { c.fillStyle = o.rug; c.beginPath(); c.ellipse(o.rugX || 0, HZ + 150, 900, 110, 0, 0, Math.PI * 2); c.fill(); }
    if (o.floorFn) o.floorFn(c, t);
  });
  return { base: o.floor || '#4a3428' };
}
// grade per light idea for rooms (screen space)
function roomLight(c, t, kind = 'warm', o = {}) {
  if (kind === 'warm') noirGrade(c, t, { mult: 'rgba(235,205,170,.35)', soft: 'rgba(80,40,10,.12)', warm: .35, wx: o.wx ?? .5, wy: o.wy ?? .3, vig: .45, grain: .6 });
  else if (kind === 'day') noirGrade(c, t, { mult: 'rgba(215,215,220,.2)', soft: 'rgba(60,60,80,.1)', vig: .35, grain: .5 });
  else if (kind === 'grey') noirGrade(c, t, { mult: 'rgba(185,195,205,.4)', soft: 'rgba(30,40,60,.2)', vig: .5, grain: .7 });
  else if (kind === 'cold') noirGrade(c, t, { mult: 'rgba(140,155,200,.45)', soft: 'rgba(10,20,50,.35)', vig: .7, grain: .8 });
  else noirGrade(c, t, { vig: .6 });
}
function door(c, x, b = 0, o = {}) {
  const h = 820; c.beginPath(); c.rect(x - 220, b - h - 30, 440, h + 30); fs(c, o.frame || '#d8d0c0', 3);
  c.beginPath(); c.rect(x - 195, b - h, 390, h); fs(c, o.col || '#6a4a34', 3);
  for (const yy of [b - h + 40, b - h / 2 + 20]) { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; c.strokeRect(x - 160, yy, 320, h / 2 - 80); }
  circle(c, x + 150, b - h / 2, 14); fs(c, '#c9a85a', 2);
  if (o.sign) { c.fillStyle = '#1a6a3a'; c.fillRect(x - 130, b - h - 140, 260, 80); hudText(c, o.sign, x, b - h - 86, 44, '#eaffea', 'center'); bloom(c, x, b - h - 100, 220, '120,255,160', .3); }
}
function bookshelf(c, x, b = 0) {
  c.beginPath(); c.rect(x, b - 900, 420, 900); fs(c, '#4a3020', 3);
  for (let r = 0; r < 5; r++) { c.fillStyle = '#2a1a12'; c.fillRect(x + 14, b - 886 + r * 176, 392, 160); for (let k = 0; k < 11; k++) { const bh = 100 + rnd(r * 11 + k + (x | 0)) * 50; c.beginPath(); c.rect(x + 22 + k * 34, b - 886 + r * 176 + 160 - bh, 30, bh); fs(c, ['#6a2a2a', '#2a4a6a', '#6a5a2a', '#2a5a3a', '#5a3a5a', '#7a6a5a'][(k + r) % 6], 1.5); } }
}
function sofa(c, x, o = {}) {
  const col = o.col || '#7a4a3a', w = o.w || 900;
  c.beginPath(); rrect(c, x - w / 2, -520, w, 300, 40); fs(c, shade(col, -.15), 3);
  c.beginPath(); rrect(c, x - w / 2 + 20, -300, w - 40, 160, 30); fs(c, col, 3); for (let i = 1; i < 3; i++) line(c, [x - w / 2 + i * w / 3, -296, x - w / 2 + i * w / 3, -150], 4, 'rgba(0,0,0,.3)');
  for (const s of [-1, 1]) { c.beginPath(); rrect(c, x + s * w / 2 - (s > 0 ? 110 : 0), -400, 110, 300, 40); fs(c, shade(col, -.08), 3); }
  for (const s of [-1, 1]) line(c, [x + s * (w / 2 - 50), -110, x + s * (w / 2 - 50), 0], 16, '#2a1a12');
  if (o.cushions !== false) { c.beginPath(); rrect(c, x - w / 2 + 130, -440, 150, 130, 30); fs(c, '#d9b46a', 2.5); c.beginPath(); rrect(c, x + w / 2 - 280, -440, 150, 130, 30); fs(c, '#6a8aa0', 2.5); }
}
function dinTable(c, x, o = {}) {
  const w = o.w || 1300, top = o.top ?? -300;
  c.beginPath(); c.rect(x - w / 2, top, w, 30); fs(c, o.cloth || '#e8e0d0', 3); c.fillStyle = o.cloth || '#e8e0d0'; c.beginPath(); c.moveTo(x - w / 2, top + 30); c.lineTo(x - w / 2 - 20, top + 140); c.lineTo(x + w / 2 + 20, top + 140); c.lineTo(x + w / 2, top + 30); c.closePath(); c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
  for (const s of [-1, 1]) line(c, [x + s * (w / 2 - 60), top + 140, x + s * (w / 2 - 60), 0], 18, '#3a2418');
  for (const item of o.items || []) item(c, top);
}
function plateFood(c, x, top) { c.beginPath(); c.ellipse(x, top - 6, 70, 14, 0, 0, Math.PI * 2); fs(c, '#f4f0e8', 2.5); c.beginPath(); c.ellipse(x, top - 14, 40, 10, 0, 0, Math.PI * 2); fs(c, '#b8743a', 2); }
function glassW(c, x, top) { c.beginPath(); c.moveTo(x - 18, top - 90); c.lineTo(x + 18, top - 90); c.lineTo(x + 12, top); c.lineTo(x - 12, top); c.closePath(); fs(c, 'rgba(200,220,240,.5)', 2.5); c.fillStyle = 'rgba(180,40,60,.6)'; c.fillRect(x - 14, top - 50, 28, 46); }
function cake(c, x, top, t = 0, n = 5) {
  c.beginPath(); c.ellipse(x, top - 6, 130, 20, 0, 0, Math.PI * 2); fs(c, '#f4f0e8', 2.5);
  c.beginPath(); c.rect(x - 100, top - 120, 200, 110); fs(c, '#f2d7e0', 3); c.fillStyle = '#7a3a2a'; c.fillRect(x - 100, top - 70, 200, 16); c.beginPath(); c.ellipse(x, top - 120, 100, 18, 0, 0, Math.PI * 2); fs(c, '#fbe8ef', 3);
  for (let i = 0; i < n; i++) { const cx = x - 60 + i * 30; line(c, [cx, top - 124, cx, top - 175], 7, ['#6aa0e0', '#e07a9a', '#f2c531'][i % 3]); const fl = 1 + .15 * Math.sin(t * 20 + i); c.beginPath(); c.ellipse(cx, top - 188, 7, 13 * fl, 0, 0, Math.PI * 2); c.fillStyle = '#ffd56a'; c.fill(); bloom(c, cx, top - 188, 60, '255,200,100', .5); }
}
function tv(c, x, y, o = {}) {
  const w = o.w || 560, h = w * .58; c.beginPath(); rrect(c, x - w / 2 - 14, y - h - 14, w + 28, h + 28, 10); fs(c, '#121216', 3);
  c.save(); c.beginPath(); c.rect(x - w / 2, y - h, w, h); c.clip(); c.fillStyle = '#1a2a4a'; c.fillRect(x - w / 2, y - h, w, h);
  if (o.news) { // generic news layout: studio gradient, a desk, a lower third (German text, no names, no logos)
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#1a3a7a'); g.addColorStop(1, '#0a1a3a'); c.fillStyle = g; c.fillRect(x - w / 2, y - h, w, h);
    c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 8; i++) c.fillRect(x - w / 2 + i * w / 8, y - h, 2, h);
    c.fillStyle = '#b8202a'; c.fillRect(x - w / 2, y - h * .3, w * .72, h * .16); c.fillStyle = '#f2f2f2'; c.fillRect(x - w / 2, y - h * .14, w, h * .1);
    hudText(c, o.news, x - w / 2 + w * .03, y - h * .18, h * .1, '#fff'); hudText(c, o.sub || 'Keine Verletzten', x - w / 2 + w * .03, y - h * .055, h * .065, '#222');
    c.fillStyle = '#e8c070'; c.fillRect(x + w * .3, y - h * .95, w * .17, h * .1);
  }
  c.restore(); if (o.glow !== false) bloom(c, x, y - h / 2, w, '110,150,255', .3);
}
function laptop(c, x, top, o = {}) {
  const w = o.w || 300; c.beginPath(); c.moveTo(x - w / 2 - 20, top); c.lineTo(x + w / 2 + 20, top); c.lineTo(x + w / 2, top - 16); c.lineTo(x - w / 2, top - 16); c.closePath(); fs(c, '#9aa0aa', 2.5);
  c.beginPath(); rrect(c, x - w / 2, top - 16 - w * .62, w, w * .62, 8); fs(c, '#222', 3); c.fillStyle = o.screen || '#dfe6f0'; c.fillRect(x - w / 2 + 10, top - 6 - w * .62, w - 20, w * .62 - 20);
  if (o.draw) { c.save(); c.translate(x - w / 2 + 10, top - 6 - w * .62); o.draw(c, w - 20, w * .62 - 20); c.restore(); }
  bloom(c, x, top - w * .3, w * 1.2, '180,200,255', .3);
}
function counter(c, x, w = 1400) {
  c.beginPath(); c.rect(x - w / 2, -420, w, 420); fs(c, '#c9c2b4', 3); for (let i = 0; i < w / 300; i++) { c.beginPath(); c.rect(x - w / 2 + 20 + i * 300, -380, 270, 340); fs(c, '#b8b0a0', 2); circle(c, x - w / 2 + 250 + i * 300, -220, 8); fs(c, '#555', 1.5); }
  c.beginPath(); c.rect(x - w / 2 - 20, -440, w + 40, 26); fs(c, '#e8e4dc', 3);
}
function hotelBed(c, x) { c.beginPath(); rrect(c, x - 600, -380, 1200, 200, 20); fs(c, '#d8d2c4', 3); c.beginPath(); c.rect(x - 640, -180, 1280, 180); fs(c, '#5a3a2a', 3); c.beginPath(); c.rect(x + 560, -700, 80, 700); fs(c, '#4a2a1a', 3); c.beginPath(); rrect(c, x - 600, -360, 900, 160, 20); fs(c, '#7a2a2a', 3); c.beginPath(); c.ellipse(x + 430, -400, 140, 50, 0, 0, Math.PI * 2); fs(c, '#efeae0', 3); }
function floorLamp(c, x, on = true) { line(c, [x, 0, x, -900], 10, '#2a2a2e'); ell(c, x, -4, 70, 14); fs(c, '#2a2a2e', 2); c.beginPath(); c.moveTo(x - 110, -880); c.lineTo(x + 110, -880); c.lineTo(x + 70, -1040); c.lineTo(x - 70, -1040); c.closePath(); fs(c, '#d9b98a', 3); if (on) bloom(c, x, -900, 520, '255,200,120', .55); }
function deskLamp(c, x, top, on = true) { ell(c, x, top - 6, 50, 12); fs(c, '#2a2a2e', 2); line(c, [x, top - 6, x - 20, top - 160, x + 40, top - 230], 8, '#2a2a2e'); c.beginPath(); c.moveTo(x + 10, top - 260); c.lineTo(x + 110, top - 230); c.lineTo(x + 70, top - 180); c.closePath(); fs(c, '#2f4f3f', 2.5); if (on) bloom(c, x + 80, top - 180, 300, '255,210,140', .6); }
function chairBack(c, x, o = {}) { c.beginPath(); rrect(c, x - 110, -560, 220, 300, 20); fs(c, o.col || '#5a3a28', 3); line(c, [x - 90, -260, x - 90, 0], 12, o.col || '#5a3a28'); line(c, [x + 90, -260, x + 90, 0], 12, o.col || '#5a3a28'); }
function plant(c, x, s = 1) { plantPot(c, x, s); }
function interrogTable(c, x) { c.beginPath(); c.rect(x - 500, -330, 1000, 26); fs(c, '#6a6e74', 3); for (const s of [-1, 1]) line(c, [x + s * 440, -304, x + s * 440, 0], 14, '#4a4e54'); }
function mirrorWall(c, x0, x1, b) { c.beginPath(); c.rect(x0, b - 1100, x1 - x0, 700); fs(c, '#1a2028', 4); c.fillStyle = 'rgba(160,190,220,.08)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x0 + i * 220, b - 1100); c.lineTo(x0 + i * 220 + 90, b - 1100); c.lineTo(x0 + i * 220 - 60, b - 400); c.lineTo(x0 + i * 220 - 150, b - 400); c.fill(); } }
function filingStack(c, x, n = 6, y = 0) { for (let i = 0; i < n; i++) { c.beginPath(); c.rect(x - 90 + (rnd(i + (x | 0)) - .5) * 14, y - (i + 1) * 26, 180, 24); fs(c, ['#c9b48a', '#a8b4c4', '#d8d0c0'][i % 3], 2); } }
function kidsBed(c, x, top, kid, e) { /* overhead kid sleeping */ }
