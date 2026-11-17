// INFO CARDS (all German, stone-slab template from fx.js). Call in `screen` with absolute film time t.
// Safe area: ≥ 80 px from the edges. Title ≥ 64 px, numbers 96–140 px, body ≥ 40 px.
const CW = { cream: CARD.cream, ochre: CARD.ochre, amber: CARD.amber };
const NUM = (c, s, x, y, size = 120, o = {}) => cardTitle(c, s, x, y, size, Object.assign({ top: CW.amber, bot: CW.ochre }, o));
const lonlat = (lon, lat, k = 12) => [(lon + 11) * k, (72 - lat) * k];

// ---- simple card: title + optional big number / line ----
function infoCard(c, t, o) {
  // o: { t0, t1, x, y, w, h, title, sub, num, from, to, fmt, icon(c,x,y), corner }
  const w = o.w || 720, h = o.h || (o.num != null || o.counter ? 330 : 230);
  const pos = cardPos(o.corner || 'bl', w, h, o);
  stoneCard(c, t, { t0: o.t0, t1: o.t1, x: pos[0], y: pos[1], w, h, seed: o.seed || 7, draw: (c, k, lt, w, h) => {
    let y = 92; const x0 = o.icon ? 150 : 54;
    if (o.icon) o.icon(c, 90, 96, lt);
    cardTitle(c, o.title, x0, y, o.titleSize || 68, { maxW: w - x0 - 60 }); ochreRule(c, x0, y + 24, Math.min(360, w - x0 - 80), 3);
    if (o.counter) {
      const [a, b, d] = o.counter, ck = countK(lt, .35, d || 1.3), v = lerp(a, b, ck);
      NUM(c, o.fmt ? o.fmt(v, ck) : deNum(Math.round(v)), x0, y + 152, o.numSize || 124, { maxW: w - x0 - 50 });
      landFlash(c, x0 + 160, y + 110, 300, lt, .35 + (d || 1.3));
      if (o.sub) cardBody(c, o.sub, x0, y + 210, 44);
    } else if (o.num != null) { NUM(c, o.num, x0, y + 152, o.numSize || 124, { maxW: w - x0 - 50 }); if (o.sub) cardBody(c, o.sub, x0, y + 210, 44); }
    else if (o.sub) cardBody(c, o.sub, x0, y + 92, 46);
    if (o.extra) o.extra(c, lt, w, h);
  } });
}
function cardPos(corner, w, h, o = {}) {
  if (o.x != null) return [o.x, o.y];
  return { bl: [96, H - h - 90], br: [W - w - 96, H - h - 90], tl: [96, 90], tr: [W - w - 96, 90] }[corner];
}

// ---- year counter 2026 -> ca. 13.000 v. Chr. ----
function cardZeitreise(c, t, t0, t1, corner = 'bl') {
  const w = 780, h = 350, p = cardPos(corner, w, h);
  stoneCard(c, t, { t0, t1, x: p[0], y: p[1], w, h, seed: 5, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Zeitreise', 54, 100, 68); ochreRule(c, 54, 124, 340, 4);
    const ck = countK(l, .45, 1.5), yr = lerp(2026, -13000, ck);
    const txt = ck < 1 ? deYear(yr > 0 ? Math.round(yr) : -Math.round(-yr / 10) * 10) : 'ca. ' + deYear(-13000);
    NUM(c, txt, 54, 250, 116, { maxW: w - 110 }); landFlash(c, 330, 210, 360, l, 1.95);
    iconPoint(c, 70, 298, .9, CW.cream); cardBody(c, 'vor 15.000 Jahren', 98, 312, 46);
  } });
}
// ---- timeline Dinos / Steinzeit / Heute (true proportion: the last two almost on top of each other) ----
function cardDinoTimeline(c, t, t0, t1) {
  const w = 1180, h = 330, x = (W - w) / 2, y = H - h - 80;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 13, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Zeitstrahl', 54, 92, 64); ochreRule(c, 54, 114, 300, 6);
    const L = 60, R = w - 80, ly = 200, grow = easeOut(seg(l, .3, 1.3));
    line(c, [L, ly, L + (R - L) * grow, ly], 10, '#1a120d'); line(c, [L, ly, L + (R - L) * grow, ly], 5, CW.amber);
    // 66 Mio -> 0 : 15.000 years is 0,023 % of the line
    const px = yrs => R - (R - L) * yrs / 66e6;
    const marks = [[66e6, 'Dinos', 'vor 66 Mio. Jahren', .5, 'down'], [15000, 'Steinzeit', 'vor 15.000 Jahren', 1.4, 'up'], [0, 'Heute', '', 1.8, 'down']];
    for (const [yr, nm, sub, at, dir] of marks) { const a = easeOut(seg(l, at, at + .4)); if (a <= 0) continue; const mx = px(yr);
      c.save(); c.globalAlpha *= a; circle(c, mx, ly, 14); c.fillStyle = yr ? CW.ochre : CW.cream; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a120d'; c.stroke();
      if (dir === 'down') { cardTitle(c, nm, mx, ly + 66, 46, { align: yr ? 'left' : 'right' }); if (sub) cardBody(c, sub, mx, ly + 110, 38, CW.cream, yr ? 'left' : 'right'); }
      else { cardTitle(c, nm, mx - 30, ly - 62, 46, { align: 'right' }); cardBody(c, sub, mx - 30, ly - 20, 38, CW.cream, 'right'); }
      c.restore(); }
  } });
}
// ---- Europe in the Ice Age: ice sheet in the north, lower sea level (today's coast dashed) ----
const EU_MAIN = [[-9, 37], [-9, 43], [-2, 43.5], [-1.5, 46], [-4.5, 48.5], [-1, 49.5], [2, 51], [4, 51.5], [8, 54], [8.5, 57], [10.5, 57.7], [10.5, 55], [12.5, 54.5], [14, 54], [19, 54.5], [21, 55.5], [21, 57], [24, 57.5], [23.5, 59.5], [30, 60], [40, 61], [40, 45], [30, 45], [29, 41], [26, 40.5], [23, 40], [22, 37], [21, 39], [19.5, 42], [16, 43.5], [13.5, 45.5], [12.3, 45], [14, 42], [16, 41], [18.5, 40], [16, 38], [15.5, 40], [12, 42], [10, 44], [7, 43.5], [3, 43], [3, 42], [0, 39], [-0.5, 38], [-2, 36.8], [-5.5, 36], [-6.5, 37]];
const EU_SCAN = [[5, 58], [5, 62], [10, 64], [15, 68], [20, 70], [28, 71], [30, 70], [28, 66], [24, 65.5], [21, 63], [18, 60], [19, 59], [16, 56.5], [13, 55.5], [12, 56.5], [10.5, 59], [8, 58]];
const EU_GB = [[-5.5, 50], [1.5, 51], [1.7, 52.8], [0, 53.5], [-1.5, 55], [-2, 57.7], [-3.5, 58.6], [-5, 58.6], [-6, 56.5], [-5, 55], [-3, 54], [-4.5, 53.3], [-4.5, 51.7]];
const EU_IE = [[-6, 52], [-6, 54], [-7, 55.3], [-10, 54], [-10, 52]];
const EU_ICE = [[-11, 55.5], [-7, 53.5], [-3, 52.8], [1, 54.5], [6, 55], [10, 54], [14, 52.8], [20, 52.5], [26, 53.5], [32, 55.5], [38, 58], [40, 60], [40, 72], [-11, 72]];
const DOGGER = [[-5.5, 49.6], [-2, 48.9], [2, 50.4], [5, 52.6], [8.5, 54.2], [8, 56.5], [3, 57.5], [-1, 56.5], [-2.2, 55], [0.8, 53.2], [1.5, 51]];
function polyLL(c, pts, k) { c.beginPath(); pts.forEach((p, i) => { const [x, y] = lonlat(p[0], p[1], k); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); }
function cardEuropaEiszeit(c, t, t0, t1, tSea) {
  const w = 760, h = 640, x = W - w - 90, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 21, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Europa in der Eiszeit', 44, 82, 56); ochreRule(c, 44, 102, 420, 7);
    c.save(); c.translate(60, 130); const K = 12.4;
    c.beginPath(); c.rect(0, 0, 51 * K, 36 * K); c.fillStyle = 'rgba(40,70,100,.55)'; c.fill(); c.clip();
    const low = easeOut(seg(t, tSea, tSea + 1.6));
    const land = 'rgba(176,150,98,.95)';
    // lowered sea level: coasts reach further out (thick stroke in land colour) + Doggerland
    for (const P of [EU_MAIN, EU_SCAN, EU_GB, EU_IE]) { polyLL(c, P, K); c.fillStyle = land; c.fill(); c.lineWidth = 2 + 16 * low; c.strokeStyle = land; c.lineJoin = 'round'; c.stroke(); }
    c.globalAlpha = low; polyLL(c, DOGGER, K); c.fillStyle = land; c.fill(); c.globalAlpha = 1;
    // today's coastline dashed
    c.save(); c.setLineDash([6, 6]); c.lineWidth = 2; c.strokeStyle = 'rgba(30,50,80,.8)'; for (const P of [EU_MAIN, EU_SCAN, EU_GB, EU_IE]) { polyLL(c, P, K); c.stroke(); } c.restore();
    // ice sheet grows in from the north
    const ice = easeOut(seg(l, .4, 1.6)); c.save(); c.translate(0, -(1 - ice) * 300); polyLL(c, EU_ICE, K); const ig = c.createLinearGradient(0, 0, 0, 260); ig.addColorStop(0, '#ffffff'); ig.addColorStop(1, '#dce8f2'); c.fillStyle = ig; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(120,150,190,.8)'; c.stroke();
    for (let i = 0; i < 30; i++) { const [px, py] = lonlat(-8 + rnd(i) * 46, 58 + rnd(i + 1) * 13, K); line(c, [px, py, px + 16, py + 6], 2, 'rgba(140,170,210,.6)'); } c.restore();
    c.restore();
    cardBody(c, 'Gletscher', 90, 200, 36, '#1d2a3a'); // label on the ice
    // sea level gauge
    const gx = w - 120, gy = 160; line(c, [gx, gy, gx, gy + 300], 6, '#1a120d'); for (let i = 0; i <= 4; i++) line(c, [gx - 14, gy + i * 75, gx + 14, gy + i * 75], 4, CW.cream);
    const wl = gy + 40 + low * 220; c.fillStyle = 'rgba(90,140,200,.7)'; c.fillRect(gx - 30, wl, 60, gy + 300 - wl); line(c, [gx - 34, wl, gx + 34, wl], 5, '#bfe0ff');
    if (low > 0) { c.save(); c.globalAlpha = low; NUM(c, 'ca. –100 m', w - 50, h - 50, 64, { align: 'right' }); cardBody(c, 'Meeresspiegel', w - 50, h - 112, 40, CW.cream, 'right'); c.restore(); }
  } });
}
// ---- 20–30 Menschen: figures fill up ----
function cardMenschen(c, t, t0, t1) {
  infoCard(c, t, { t0, t1, corner: 'br', w: 760, h: 360, title: 'Eine Gruppe', num: '20–30 Menschen', numSize: 92, extra: (c, lt) => {
    const n = Math.floor(clamp(seg(lt, .4, 1.8)) * 30);
    for (let i = 0; i < 30; i++) { const a = i < n ? 1 : .18, px = 60 + (i % 15) * 44, py = 290 + Math.floor(i / 15) * 50; c.save(); c.globalAlpha *= a; circle(c, px, py - 26, 10); c.fillStyle = i < 20 ? CW.cream : CW.amber; c.fill(); rrect(c, px - 11, py - 14, 22, 30, 8); c.fill(); c.restore(); }
  }, h: 380 });
}
// ---- Familie / Team / Versicherung / Krankenhaus icons one after another ----
function cardVier(c, t, times, t1) {
  const w = 1240, h = 280, x = (W - w) / 2, y = H - h - 80;
  stoneCard(c, t, { t0: times[0] - .3, t1, x, y, w, h, seed: 33, draw: (c, k, l, w, h) => {
    const names = ['Familie', 'Team', 'Versicherung', 'Krankenhaus'];
    names.forEach((nm, i) => { const a = easeBack(clamp(seg(t, times[i], times[i] + .4))); if (a <= 0) return; const cx = 160 + i * 300;
      c.save(); c.translate(cx, 120); c.scale(a, a); c.globalAlpha *= clamp(a);
      c.fillStyle = CW.amber; c.strokeStyle = '#1a120d'; c.lineWidth = 4;
      if (i === 0) { for (const [dx, s] of [[-34, 1], [34, 1], [0, .6]]) { circle(c, dx, -30 * s - (s < 1 ? -20 : 0), 18 * s); c.fill(); c.stroke(); rrect(c, dx - 20 * s, -8 + (s < 1 ? 20 : 0), 40 * s, 50 * s, 12); c.fill(); c.stroke(); } }
      if (i === 1) { for (let j = 0; j < 3; j++) { const dx = -50 + j * 50; circle(c, dx, -30, 16); c.fill(); c.stroke(); rrect(c, dx - 18, -10, 36, 46, 10); c.fill(); c.stroke(); } line(c, [-70, 0, 70, 0], 6, CW.ochre); }
      if (i === 2) { c.beginPath(); c.moveTo(0, -60); c.lineTo(50, -40); c.quadraticCurveTo(50, 30, 0, 60); c.quadraticCurveTo(-50, 30, -50, -40); c.closePath(); c.fill(); c.stroke(); line(c, [-18, 0, -4, 16, 22, -18], 8, '#1a120d'); }
      if (i === 3) { rrect(c, -50, -50, 100, 100, 18); c.fill(); c.stroke(); c.fillStyle = CW.ochre; c.fillRect(-12, -36, 24, 72); c.fillRect(-36, -12, 72, 24); }
      c.restore();
      c.save(); c.globalAlpha *= clamp(a); cardBody(c, nm, cx, 230, 42, CW.cream, 'center'); c.restore(); });
  } });
}
// ---- 10–15 km pro Tag with footprints ----
function cardKm(c, t, t0, t1) {
  infoCard(c, t, { t0, t1, corner: 'tr', w: 700, h: 360, title: 'Jeden Tag unterwegs', counter: [0, 15, 1.4], fmt: (v, k) => k < 1 ? deNum(Math.round(v)) + ' km' : '10–15 km', sub: 'pro Tag zu Fuß', extra: (c, lt) => {
    for (let i = 0; i < 9; i++) { const a = clamp(seg(lt, .4 + i * .15, .6 + i * .15)); if (!a) continue; const px = 380 + i * 34, py = 210 + (i % 2) * 26; c.save(); c.globalAlpha *= a; c.translate(px, py); c.rotate(-.2); ell(c, 0, 0, 10, 17); c.fillStyle = CW.ochre; c.fill(); for (let j = 0; j < 4; j++) { circle(c, -6 + j * 4, -20, 3); c.fill(); } c.restore(); }
  } });
}
// ---- spear thrower: hand throw vs. thrower (arcs) ----
function cardSpeerschleuder(c, t, t0, t1) {
  const w = 900, h = 420, x = W - w - 90, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 41, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Speerschleuder', 50, 92, 68); ochreRule(c, 50, 116, 340, 2);
    const gy = 360; line(c, [40, gy, w - 40, gy], 4, 'rgba(242,230,208,.5)');
    const arc = (dist, hgt, col, k2, label, ly) => { const n = 40; c.beginPath(); for (let i = 0; i <= n * k2; i++) { const u = i / n, px = 90 + u * dist, py = gy - 30 - 4 * hgt * u * (1 - u); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.lineWidth = 6; c.strokeStyle = col; c.setLineDash([16, 10]); c.stroke(); c.setLineDash([]);
      if (k2 >= 1) { iconPoint(c, 90 + dist, gy - 30, .8, col); cardBody(c, label, 90 + dist, ly, 38, col, 'right'); } };
    arc(300, 120, CW.cream, easeOut(seg(l, .5, 1.3)), 'Hand', gy - 60);
    arc(720, 220, CW.amber, easeOut(seg(l, 1.4, 2.6)), 'mit Speerschleuder', gy - 70);
    // the "longer arm" diagram
    c.save(); c.translate(90, gy - 10); line(c, [0, 0, 0, -90], 14, CW.cream); line(c, [0, -90, 40, -150], 12, CW.cream); line(c, [40, -150, 100, -200], 8, CW.amber); circle(c, 0, -110, 14); c.restore();
  } });
}
// ---- mammoth vs. Noah size comparison ----
function cardMammutNoah(c, t, t0, t1) {
  const w = 640, h = 440, x = W - w - 90, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 55, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Größenvergleich', 44, 84, 56); ochreRule(c, 44, 104, 330, 9);
    c.save(); c.translate(70, 400); const s = .19;
    c.save(); c.scale(s, s); mammut(c, 1400, { t, dark: .92, darkCol: '232,163,61' }); c.restore();
    c.save(); c.scale(s, s); drawNoahE(c, { x: 500, k: .25, ink: 1.8 }); c.restore();
    // height bars
    line(c, [w - 140, 0, w - 140, -700 * s], 4, CW.cream); line(c, [w - 155, -700 * s, w - 125, -700 * s], 4, CW.cream);
    c.restore();
    NUM(c, '3,5 m', w - 50, 150, 70, { align: 'right' }); cardBody(c, 'Schulterhöhe', w - 50, 196, 36, CW.cream, 'right');
    cardBody(c, 'Noah: 1,75 m', 150, 390, 34, CW.cream);
  } });
}
// ---- measure line in world space (horn / antlers) ----
function measureLine(c, x0, y0, x1, y1, k, label, o = {}) {
  if (k <= 0) return; const ex = lerp(x0, x1, easeOut(k)), ey = lerp(y0, y1, easeOut(k)), n = [-(y1 - y0), x1 - x0], L = Math.hypot(...n), nx = n[0] / L * 18, ny = n[1] / L * 18;
  c.save(); line(c, [x0, y0, ex, ey], o.lw || 6, '#1a120d'); line(c, [x0, y0, ex, ey], (o.lw || 6) * .55, CW.amber);
  line(c, [x0 - nx, y0 - ny, x0 + nx, y0 + ny], 5, CW.amber); if (k >= 1) line(c, [x1 - nx, y1 - ny, x1 + nx, y1 + ny], 5, CW.amber); c.restore();
}
function measureLabel(c, cam, wx, wy, text, a) { if (a <= 0) return; const [sx, sy] = w2s(cam, wx, wy); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.font = `84px ${F_TITLE}`; const tw = c.measureText(text).width;
  c.translate(sx, sy); slabPath(c, tw + 70, 120, 77); c.save(); c.translate(-(tw + 70) / 2, -60); slabPath(c, tw + 70, 120, 77); c.fillStyle = `rgba(${CARD.bg},.82)`; c.fill(); c.lineWidth = 2.5; c.strokeStyle = 'rgba(232,163,61,.5)'; c.stroke(); NUM(c, text, 35, 88, 84); c.restore(); c.restore(); }
// ---- crossed out icons (Salz, Soße, Ketchup) ----
function cardKeinSalz(c, t, times, t1) {
  const w = 980, h = 290, x = (W - w) / 2, y = 90;
  stoneCard(c, t, { t0: times[0] - .3, t1, x, y, w, h, seed: 61, draw: (c, k, l, w, h) => {
    ['Salz', 'Soße', 'Ketchup'].forEach((nm, i) => { const a = easeBack(clamp(seg(t, times[i], times[i] + .35))); if (a <= 0) return; const cx = 170 + i * 320;
      c.save(); c.translate(cx, 120); c.scale(a, a);
      if (i === 0) { rrect(c, -30, -50, 60, 100, 14); c.fillStyle = CW.cream; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a120d'; c.stroke(); for (let j = 0; j < 5; j++) { circle(c, -16 + (j % 3) * 16, -36 - Math.floor(j / 3) * 10, 3); c.fillStyle = '#1a120d'; c.fill(); } }
      if (i === 1) { c.beginPath(); c.ellipse(0, 20, 60, 26, 0, 0, Math.PI); c.closePath(); c.fillStyle = CW.cream; c.fill(); c.stroke(); ell(c, 0, 18, 46, 10); c.fillStyle = '#8a4a2a'; c.fill(); }
      if (i === 2) { c.beginPath(); c.moveTo(-28, 50); c.lineTo(-30, -20); c.quadraticCurveTo(-30, -40, -10, -44); c.lineTo(-10, -60); c.lineTo(10, -60); c.lineTo(10, -44); c.quadraticCurveTo(30, -40, 30, -20); c.lineTo(28, 50); c.closePath(); c.fillStyle = '#c8323a'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a120d'; c.stroke(); }
      const xk = clamp(seg(t, times[i] + .3, times[i] + .55)); if (xk > 0) { line(c, [-60, -60, -60 + 120 * xk, -60 + 120 * xk], 14, '#1a120d'); line(c, [-60, -60, -60 + 120 * xk, -60 + 120 * xk], 8, CW.ochre); line(c, [60, -60, 60 - 120 * xk, -60 + 120 * xk], 14, '#1a120d'); line(c, [60, -60, 60 - 120 * xk, -60 + 120 * xk], 8, CW.ochre); }
      c.restore(); c.save(); c.globalAlpha *= clamp(a); cardBody(c, nm, cx, 250, 42, CW.cream, 'center'); c.restore(); });
  } });
}
// ---- Germany map with a place dot ----
const DE = [[6, 51.8], [7, 53.3], [8.5, 53.6], [9, 54.8], [11, 54], [14, 53.8], [14.6, 52.6], [14.8, 51], [12.5, 50.3], [13.8, 48.8], [13, 47.5], [10, 47.5], [7.6, 47.6], [8, 48.9], [6.4, 49.4], [6.1, 50.7]];
function deMap(c, x, y, s, place, l) {
  c.save(); c.translate(x, y); const P = ([lo, la]) => [(lo - 5.8) * 26 * s, (55.2 - la) * 40 * s];
  c.beginPath(); DE.forEach((p, i) => { const [px, py] = P(p); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); c.fillStyle = 'rgba(232,163,61,.28)'; c.fill(); c.lineWidth = 4; c.strokeStyle = CW.amber; c.lineJoin = 'round'; c.stroke();
  const [bx, by] = P(place), pulse = 1 + .25 * Math.sin(l * 6); circle(c, bx, by, 26 * pulse); c.fillStyle = 'rgba(200,85,43,.35)'; c.fill(); circle(c, bx, by, 11); c.fillStyle = CW.ochre; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a120d'; c.stroke();
  c.restore(); return P(place).map((v, i) => v + (i ? y : x));
}
function cardBonn(c, t, t0, t1) {
  const w = 920, h = 460, x = W - w - 90, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 71, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Bonn-Oberkassel', 50, 88, 66, { maxW: 520 }); ochreRule(c, 50, 110, 380, 5);
    const [bx, by] = deMap(c, 560, 60, 1.05, [7.1, 50.7], l); cardBody(c, 'Bonn', bx + 24, by + 10, 36);
    const ck = countK(l, .6, 1.3); NUM(c, 'ca. ' + deNum(Math.round(lerp(0, 14000, ck) / 100) * 100), 50, 230, 96); cardBody(c, 'Jahre alt', 50, 285, 42); landFlash(c, 250, 200, 280, l, 1.9);
    // grave icon: two people + a dog (stylised, respectful)
    const ga = easeOut(seg(l, 1.6, 2.2)); c.save(); c.globalAlpha *= ga; c.translate(60, 330);
    rrect(c, 0, 0, 420, 90, 30); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); c.lineWidth = 3; c.strokeStyle = CW.amber; c.stroke();
    for (const dx of [40, 170]) { circle(c, dx + 18, 45, 16); c.fillStyle = CW.cream; c.fill(); rrect(c, dx + 36, 34, 90, 22, 10); c.fill(); }
    c.translate(320, 48); ell(c, 0, 0, 40, 15); c.fillStyle = CW.amber; c.fill(); circle(c, 44, -6, 13); c.fill(); c.beginPath(); c.moveTo(40, -14); c.lineTo(46, -32); c.lineTo(54, -14); c.fill(); line(c, [-40, 0, -64, -12], 6, CW.amber);
    c.restore(); cardBody(c, '2 Menschen + 1 Hund', 500, 390, 40);
  } });
}
function cardHohleFels(c, t, t0, t1) {
  const w = 920, h = 420, x = 96, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 83, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Hohle Fels', 50, 92, 70); ochreRule(c, 50, 116, 320, 8); cardBody(c, 'Schwäbische Alb', 50, 168, 40);
    const [bx, by] = deMap(c, 560, 50, 1.0, [9.75, 48.38], l); cardBody(c, 'Hohle Fels', bx - 20, by + 50, 32, CW.cream, 'center');
    const ck = countK(l, .5, 1.4); NUM(c, 'über ' + deNum(Math.round(lerp(0, 35000, ck) / 100) * 100), 50, 290, 92, { maxW: 470 }); cardBody(c, 'Jahre alt', 50, 345, 42); landFlash(c, 250, 250, 300, l, 1.9);
    // the flute
    c.save(); c.translate(60, 380); line(c, [0, 0, 380, -6], 26, '#1a120d'); line(c, [0, 0, 380, -6], 18, '#efe4cc'); for (let i = 0; i < 5; i++) { circle(c, 80 + i * 56, -2, 5); c.fillStyle = '#3a2a1e'; c.fill(); } c.restore();
  } });
}
function cardLascaux(c, t, t0, t1) {
  infoCard(c, t, { t0, t1, corner: 'tr', w: 700, title: 'Höhle von Lascaux', counter: [0, 17000, 1.3], fmt: (v, k) => 'ca. ' + deNum(Math.round(v / 100) * 100), sub: 'Jahre alt · Frankreich', numSize: 110, h: 340 });
}
// ---- Mythos: "Alle starben mit 30?" -> MYTHOS stamp; bar chart ----
function cardMythos(c, t, t0, tStamp, tChart, t1) {
  const w = 1000, h = 500, x = W - w - 90, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 91, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Alle starben mit 30?', 50, 96, 72, { maxW: w - 100 }); ochreRule(c, 50, 120, 420, 4);
    const sk = clamp(seg(t, tStamp, tStamp + .25));
    if (sk > 0) { c.save(); c.translate(w - 240, 210); c.rotate(-.18); c.scale(2 - sk, 2 - sk); c.globalAlpha *= sk; rrect(c, -190, -60, 380, 120, 16); c.lineWidth = 12; c.strokeStyle = '#d23a2a'; c.stroke(); c.font = `92px ${F_TITLE}`; c.textAlign = 'center'; c.fillStyle = '#d23a2a'; c.fillText('Mythos', 0, 32); c.restore(); }
    const ck = easeOut(seg(t, tChart, tChart + 1.2)); if (ck <= 0) return;
    // two bars: "Durchschnitt" low (pulled down by child deaths), "Wer die Kindheit überlebt" 50–60+
    const bx = 80, by = 440, bw = 150;
    const bar = (x0, val, col, lab, num) => { const hh = val * 3.6 * ck; rrect(c, x0, by - hh, bw, hh, 10); c.fillStyle = col; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a120d'; c.stroke(); NUM(c, num, x0 + bw / 2, by - hh - 16, 56, { align: 'center' }); cardBody(c, lab, x0 + bw / 2, by + 44, 32, CW.cream, 'center'); };
    c.save(); c.translate(0, -30);
    bar(bx, 30, 'rgba(242,230,208,.55)', 'Durchschnitt', '~30'); bar(bx + 300, 62, CW.amber, 'nach der Kindheit', '50, 60+');
    cardBody(c, 'viele Kinder starben früh', bx + 560, 300, 38, CW.cream); line(c, [bx + 540, 290, bx + 170, by - 60], 3, CW.ochre); c.restore();
  } });
}
// ---- Wrangel Island vs. pyramids timeline ----
function cardWrangel(c, t, t0, tPyr, t1) {
  const w = 1240, h = 400, x = (W - w) / 2, y = 90;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 97, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Zur gleichen Zeit', 54, 90, 66); ochreRule(c, 54, 112, 330, 3);
    const L = 80, R = w - 80, ly = 250, yrs = y2 => L + (R - L) * (1 - y2 / 6000);
    line(c, [L, ly, R, ly], 10, '#1a120d'); line(c, [L, ly, R, ly], 5, CW.cream);
    for (const [yr, lab] of [[6000, 'vor 6000 J.'], [0, 'heute']]) { cardBody(c, lab, yrs(yr), ly + 64, 34, CW.cream, 'center'); line(c, [yrs(yr), ly - 14, yrs(yr), ly + 14], 4, CW.cream); }
    // mammoths on Wrangel until ~4.000 years ago
    const m = easeOut(seg(l, .3, 1.2)); rrect(c, yrs(6000), ly - 60, (yrs(4000) - yrs(6000)) * m, 34, 10); c.fillStyle = CW.amber; c.fill();
    if (m > .9) { cardBody(c, 'Letzte Mammuts (Wrangelinsel)', yrs(6000), ly - 76, 38, CW.amber); c.save(); c.translate(yrs(4000) + 60, ly - 30); c.scale(.06, .06); mammut(c, 0, { t: l, dark: .9, darkCol: '232,163,61' }); c.restore(); }
    // pyramids from ~4.500 years ago
    const p = easeOut(seg(t, tPyr, tPyr + .8)); if (p > 0) { c.save(); c.globalAlpha *= p; const px = yrs(4500); c.beginPath(); c.moveTo(px - 50, ly + 30 + 100); c.lineTo(px, ly + 30 + 40); c.lineTo(px + 50, ly + 130); c.closePath(); c.fillStyle = CW.ochre; c.fill(); line(c, [px, ly - 14, px, ly + 14], 6, CW.ochre);
      cardBody(c, 'Pyramiden von Gizeh: ca. 4.500 Jahre', px + 70, ly + 120, 38, CW.cream); rrect(c, yrs(4500), ly + 8, yrs(4000) - yrs(4500), 20, 6); c.fillStyle = 'rgba(200,85,43,.8)'; c.fill(); c.restore(); }
  } });
}
// ---- end question ----
function cardFrage(c, t, t0, t1) {
  const w = 1100, h = 300, x = (W - w) / 2, y = 80;
  stoneCard(c, t, { t0, t1, x, y, w, h, seed: 101, draw: (c, k, l, w, h) => {
    cardTitle(c, 'Hättest du überlebt?', w / 2, 140, 92, { align: 'center', maxW: w - 100 }); ochreRule(c, w / 2 - 220, 170, 440, 4);
    // comment icon
    const a = easeBack(clamp(seg(l, .6, 1))); c.save(); c.translate(w / 2, 232); c.scale(a, a); rrect(c, -60, -36, 120, 66, 18); c.fillStyle = CW.amber; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a120d'; c.stroke(); c.beginPath(); c.moveTo(-20, 28); c.lineTo(-34, 52); c.lineTo(4, 30); c.fill(); c.stroke(); for (const dx of [-26, 0, 26]) { circle(c, dx, -2, 7); c.fillStyle = '#1a120d'; c.fill(); } c.restore();
  } });
}
// ---- floating icons (screen space) ----
function phoneIconX(c, x, y, s, k, xk) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s * easeBack(clamp(k)), s * easeBack(clamp(k))); c.globalAlpha = clamp(k * 3);
  rrect(c, -40, -70, 80, 140, 16); c.fillStyle = '#2a2a30'; c.fill(); c.lineWidth = 6; c.strokeStyle = CW.cream; c.stroke(); rrect(c, -30, -56, 60, 104, 6); c.fillStyle = `rgba(120,170,230,${.9 * (1 - xk)})`; c.fill();
  if (xk > 0) { line(c, [-60, -60, -60 + 120 * clamp(xk * 2), -60 + 120 * clamp(xk * 2)], 14, '#d23a2a'); if (xk > .5) line(c, [60, -60, 60 - 120 * clamp(xk * 2 - 1), -60 + 120 * clamp(xk * 2 - 1)], 14, '#d23a2a'); } c.restore(); }
function wifiIcon(c, x, y, s, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = clamp(k); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 18 + i * 18, -2.4, -.74); c.lineWidth = 9; c.strokeStyle = '#1a120d'; c.lineCap = 'round'; c.stroke(); c.lineWidth = 5; c.strokeStyle = i < Math.floor(k * 4) ? CW.amber : 'rgba(242,230,208,.4)'; c.stroke(); } circle(c, 0, 0, 6); c.fillStyle = CW.amber; c.fill(); c.restore(); }
function keywordCard(c, t, t0, t1, title, sub, corner = 'tl', w = 640) { infoCard(c, t, { t0, t1, corner, w, h: sub ? 230 : 160, title, sub, titleSize: 70 }); }
