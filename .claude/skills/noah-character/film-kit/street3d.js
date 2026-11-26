// 3D STREET in an upscale Altbau neighbourhood (Gründerzeit facades), real perspective camera.
// Metres, Y up, facades on the plane Z = 0 facing the camera (camera at Z < 0). HILDE spans X 0..16.
//   street3d(c, cam2d, t, { cam3, tod: 'golden'|'day'|'evening'|'night', hilde: { state, guests, star, opening, board, queue }, walkers, terrace })
//   cam3 = { x, y, z, f, look: [X, Y, Z] }  (yaw from look-at, vertical shift lens keeps verticals straight)
const S3 = { PXM: 64, cache: new Map() };
const S3B = (() => {
  const P = [['#e9d6b0', '#f8efdc', '#4e5d6e'], ['#d7b8a8', '#f4e6dc', '#5a5560'], ['#c9d3c3', '#f2f2ea', '#4a5a6a'], ['#efe2c4', '#fbf4e2', '#56606e'], ['#cfc0d6', '#f4eef6', '#4e5868'], ['#e6c9a0', '#fbefd8', '#5e5a58'], ['#bfcfd8', '#f0f4f6', '#4a5866'], ['#ead0c0', '#fbeee6', '#585868']];
  const shops = ['feinkost', 'wein', 'cafe', 'blumen', 'buch', 'baecker', 'galerie', 'apotheke', 'mode', 'cafe2'];
  const L = [], widths = [14, 15, 12.5, 16, 13.5], widthsR = [13, 15, 12.5, 14, 16, 13];
  let x = 0; widths.forEach((w, i) => { x -= w; L.unshift({ x0: x, w, i: -(i + 1) }); });
  L.push({ x0: 0, w: 16, i: 0, hilde: true }); x = 16; widthsR.forEach((w, i) => { L.push({ x0: x, w, i: i + 1 }); x += w; });
  L.forEach((b, k) => { const s = Math.abs(b.i * 7 + 3); const p = b.hilde ? ['#efe4cc', '#fbf6ea', '#4a5868'] : P[s % P.length]; Object.assign(b, { col: p[0], trim: p[1], roof: p[2], floors: 4 + (s % 2), shop: b.hilde ? 'hilde' : shops[(s + k) % shops.length], seed: s, balcony: s % 3 !== 1, bay: s % 4 === 0, tower: s % 5 === 2 }); b.h = 4.6 + (b.floors - 1) * 3.5 + .6; });
  return L;
})();
const S3TREES = [-70, -58, -46, -34, -22, -10, -3, 19, 26, 38, 50, 62, 74, 86], S3LAMPS = [-64, -52, -40, -28, -16, -6.5, .2, 15.8, 22.5, 32, 44, 56, 68, 80];
const SHOPNAME = { feinkost: 'Feinkost Moser', wein: 'Weinhandlung', cafe: 'Café Rosa', blumen: 'Blumen Lindner', buch: 'Buchhandlung', baecker: 'Bäckerei Krume', galerie: 'Galerie Neun', apotheke: 'Apotheke', mode: 'Atelier Mode', cafe2: 'Konditorei' };
function s3lit(seed, i, night) { return night && rnd(seed * 13 + i * 7) > .42; }
// ---------- facade texture (cached) ----------
function s3Facade(b, tod, hs) {
  const key = (b.hilde ? 'H' + JSON.stringify(hs) : b.i + (hs.closed ? 'C' : '')) + '|' + tod; if (S3.cache.has(key)) return S3.cache.get(key);
  const M = S3.PXM, top = b.h + 5.2, cv = document.createElement('canvas'); cv.width = Math.ceil(b.w * M); cv.height = Math.ceil(top * M);
  const c = cv.getContext('2d'); c.translate(0, top * M); c.scale(M, M); c.lineJoin = 'round'; c.lineCap = 'round';
  const night = tod === 'night' || tod === 'evening', w = b.w, h = b.h, dim = tod === 'night' ? -.55 : tod === 'evening' ? -.35 : 0;
  const C = col => dim ? shade(col, dim) : col, trim = C(b.trim), wall = C(b.col), ink = 'rgba(30,24,30,.85)';
  const L = (pts, lw, col) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = lw; c.strokeStyle = col; c.stroke(); };
  const R = (x, y, ww, hh, fill, lw = .035, st = ink) => { c.beginPath(); c.rect(x, y, ww, hh); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = st; c.stroke(); } };
  // roof (mansard + dormers + chimneys)
  c.beginPath(); c.moveTo(-.05, -h); c.lineTo(w + .05, -h); c.lineTo(w - .9, -h - 2.7); c.lineTo(.9, -h - 2.7); c.closePath(); c.fillStyle = C(b.roof); c.fill(); c.lineWidth = .04; c.strokeStyle = ink; c.stroke();
  c.save(); c.clip(); for (let y = -h; y > -h - 2.8; y -= .22) L([0, y, w, y], .015, 'rgba(0,0,0,.25)'); for (let x = 0; x < w; x += .3) L([x, -h, x + (x - w / 2) * -.05, -h - 2.7], .012, 'rgba(255,255,255,.08)'); c.restore();
  c.beginPath(); c.moveTo(.9, -h - 2.7); c.lineTo(w - .9, -h - 2.7); c.lineTo(w - 1.6, -h - 3.3); c.lineTo(1.6, -h - 3.3); c.closePath(); c.fillStyle = C(shade(b.roof, -.15)); c.fill(); c.stroke();
  const nW = Math.max(3, Math.floor((w - 1) / 2.6)), sp = w / nW;
  for (let i = 0; i < nW; i++) { if (i % 2 && nW > 3) continue; const cx = (i + .5) * sp; c.beginPath(); c.moveTo(cx - .55, -h - .3); c.lineTo(cx - .55, -h - 1.8); c.lineTo(cx, -h - 2.4); c.lineTo(cx + .55, -h - 1.8); c.lineTo(cx + .55, -h - .3); c.closePath(); c.fillStyle = trim; c.fill(); c.stroke(); R(cx - .35, -h - 1.7, .7, 1.1, night && s3lit(b.seed, i + 50, 1) ? '#ffd890' : C('#7f9fb8')); }
  for (const cx of [w * .18, w * .78]) { R(cx - .35, -h - 4.3, .7, 1.8, C('#a0685a')); R(cx - .45, -h - 4.45, .9, .2, C('#7a4a40')); }
  if (b.tower) { c.beginPath(); c.moveTo(w - 3.2, -h); c.lineTo(w - 3.2, -h - 3.5); c.quadraticCurveTo(w - 1.9, -h - 6.2, w - .6, -h - 3.5); c.lineTo(w - .6, -h); c.closePath(); c.fillStyle = C('#5a7a6a'); c.fill(); c.stroke(); L([w - 1.9, -h - 5.4, w - 1.9, -h - 6.4], .06, C('#c9a24a')); }
  // wall
  R(0, -h, w, h, wall, .04); const g = c.createLinearGradient(0, -h, w, 0); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.10)'); c.fillStyle = g; c.fillRect(0, -h, w, h);
  for (let y = -.35; y > -4.6; y -= .35) L([0, y, w, y], .02, 'rgba(0,0,0,.18)'); // rustication
  R(-.08, -4.75, w + .16, .22, trim, .03); R(-.15, -h - .1, w + .3, .45, trim, .035); for (let x = .1; x < w; x += .26) R(x, -h + .35, .13, .14, C(shade(b.trim, -.12)), 0);
  L([0, -h + .7, w, -h + .7], .05, C(shade(b.trim, -.1)));
  // upper floor windows
  for (let f = 1; f < b.floors; f++) {
    const y0 = -(4.6 + (f - 1) * 3.5 + .95), wh = f === 1 ? 2.05 : 1.85, ww = 1.15;
    if (f > 1) L([0, y0 + .95, w, y0 + .95], .05, C(shade(b.trim, -.08)));
    for (let i = 0; i < nW; i++) {
      const cx = (i + .5) * sp, x = cx - ww / 2, y = y0 - wh, lit = s3lit(b.seed, f * 10 + i, night);
      R(x - .14, y - .14, ww + .28, wh + .28, trim, .035);
      let gl; if (lit) gl = '#ffcf7a'; else if (tod === 'golden') { gl = c.createLinearGradient(x, y, x + ww, y + wh); gl.addColorStop(0, '#ffd9a0'); gl.addColorStop(1, '#7a8aa8'); } else if (night) gl = '#1a2340'; else { gl = c.createLinearGradient(x, y, x + ww, y + wh); gl.addColorStop(0, '#cfe6f4'); gl.addColorStop(1, '#6f92b4'); }
      R(x, y, ww, wh, gl, .03);
      if (lit) { c.fillStyle = 'rgba(255,240,200,.5)'; c.fillRect(x + .1, y + .1, ww - .2, wh * .5); c.fillStyle = 'rgba(120,60,30,.35)'; c.fillRect(x, y, .22, wh); c.fillRect(x + ww - .22, y, .22, wh); if (rnd(f + i + b.seed) > .5) { c.beginPath(); c.arc(cx, y + .5, .16, 0, Math.PI * 2); c.fillStyle = '#fff4d0'; c.fill(); } }
      else if (!night) { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x + .1, y + wh); c.lineTo(x + .45, y); c.lineTo(x + .7, y); c.lineTo(x + .35, y + wh); c.fill(); c.fillStyle = 'rgba(250,248,240,.85)'; c.fillRect(x, y, ww, .3); }
      L([cx, y, cx, y + wh], .05, trim); L([x, y + wh * .32, x + ww, y + wh * .32], .05, trim);
      R(x - .25, y + wh + .1, ww + .5, .14, trim, .03);
      if (f === 1) { c.beginPath(); c.moveTo(x - .25, y - .2); c.lineTo(cx, y - .75); c.lineTo(x + ww + .25, y - .2); c.closePath(); c.fillStyle = trim; c.fill(); c.lineWidth = .03; c.strokeStyle = ink; c.stroke();
        R(x - .05, y + wh + .24, ww + .1, .28, C('#8a5a3a'), .025); for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + .05 + k * .2, y + wh + .2, .1, 0, Math.PI * 2); c.fillStyle = C(['#d8405a', '#f2c94a', '#e86a8a', '#4f8f50'][(k + i) % 4]); c.fill(); } }
      else if (f === 2) { c.beginPath(); c.moveTo(x - .2, y - .12); c.quadraticCurveTo(cx, y - .7, x + ww + .2, y - .12); c.closePath(); c.fillStyle = trim; c.fill(); c.lineWidth = .03; c.strokeStyle = ink; c.stroke(); }
      else { R(x - .2, y - .32, ww + .4, .2, trim, .025); R(cx - .1, y - .36, .2, .3, C(shade(b.trim, -.1)), .02); }
    }
  }
  // ground floor shop / restaurant
  const gf = -4.45;
  if (b.hilde) s3HildeGround(c, b, tod, hs, C, R, L, ink);
  else {
    const S = b.shop, band = C(['#2a4a3a', '#5a2a30', '#2a3a5a', '#4a3a2a', '#1f2a3a'][b.seed % 5]);
    R(.25, gf + .15, w - .5, 4.3, C('#3a2e2a'), .035); R(.4, gf + .3, w - .8, .75, band, .03);
    c.font = `700 .48px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = night ? '#ffe2a0' : '#f0d79a'; c.fillText(SHOPNAME[S] || 'Laden', w / 2, gf + .69);
    const dw = 1.3, dx = b.seed % 2 ? w - .6 - dw : .6, wx0 = b.seed % 2 ? .6 : .6 + dw + .3, wx1 = b.seed % 2 ? w - .9 - dw : w - .6;
    R(dx, gf + 1.2, dw, 3.2, C('#4a3426'), .035); R(dx + .15, gf + 1.4, dw - .3, 1.6, night ? '#e8b060' : C('#8aa6b8'), .025); c.beginPath(); c.arc(dx + dw - .25, gf + 3, .06, 0, 7); c.fillStyle = '#c9a24a'; c.fill();
    const glass = night ? '#f4c070' : C('#9ec2d6'); R(wx0, gf + 1.2, wx1 - wx0, 2.8, glass, .035);
    c.save(); c.beginPath(); c.rect(wx0, gf + 1.2, wx1 - wx0, 2.8); c.clip();
    for (let r = 0; r < 2; r++) { const sy = gf + 2.6 + r * 1.1; L([wx0, sy, wx1, sy], .05, C('#6a4a30')); for (let x = wx0 + .3; x < wx1 - .2; x += .38) { const k = (x * 7 + r) | 0; c.beginPath();
      if (S === 'wein') { c.rect(x - .07, sy - .5, .14, .5); c.fillStyle = ['#3a0e18', '#2a4a2a', '#c9a24a'][k % 3]; }
      else if (S === 'blumen') { c.arc(x, sy - .25, .2, 0, 7); c.fillStyle = ['#e05a7a', '#f2c94a', '#9b7fd6', '#f4f1ea'][k % 4]; }
      else if (S === 'buch') { c.rect(x - .12, sy - .45, .1 + (k % 3) * .04, .45); c.fillStyle = ['#a0522d', '#4a6a8a', '#8a8a4a', '#6a3a5a'][k % 4]; }
      else if (S === 'baecker' || S === 'cafe2') { c.ellipse(x, sy - .15, .17, .11, 0, 0, 7); c.fillStyle = ['#d8a050', '#c08040', '#f0d8b0'][k % 3]; }
      else { c.rect(x - .12, sy - .35, .24, .35); c.fillStyle = ['#c8a070', '#a04030', '#e8d8b0', '#5a7a3a'][k % 4]; } c.fill(); } }
    c.fillStyle = night ? 'rgba(255,220,150,.25)' : 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(wx0 + .3, gf + 4); c.lineTo(wx0 + 1.3, gf + 1.2); c.lineTo(wx0 + 1.9, gf + 1.2); c.lineTo(wx0 + .9, gf + 4); c.fill(); c.restore();
    L([(wx0 + wx1) / 2, gf + 1.2, (wx0 + wx1) / 2, gf + 4], .06, C('#3a2e2a')); R(.2, -.35, w - .4, .35, C('#6a6460'), .03);
    if (hs.closed) {
      R(.4, gf + .3, w - .8, .75, C('#2a2a2e'), .03); c.font = `700 .44px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = C('#c8b890'); c.fillText(['Trattoria Sole', 'Zum Anker', 'Bistro 7', 'Gasthaus Linde', 'Le Petit', 'Sushi Mori', 'Café Lena', 'Brasserie Nord'][Math.abs(b.i) % 8], w / 2, gf + .69);
      R(wx0, gf + 1.2, wx1 - wx0, 2.8, C('#8a9098'), .035); for (let y = gf + 1.3; y < gf + 4; y += .14) L([wx0, y, wx1, y], .02, C('#6a7078'));
      for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(wx0 + .6 + rnd(b.seed + k) * (wx1 - wx0 - 1.2), gf + 2 + rnd(b.seed + k + 4) * 1.6, .25 + rnd(k) * .3, 0, 6.3); c.lineWidth = .06; c.strokeStyle = ['rgba(200,60,60,.6)', 'rgba(60,120,200,.6)', 'rgba(60,160,90,.6)'][k % 3]; c.stroke(); }
      c.save(); c.translate(dx + dw / 2, gf + 2.3); c.rotate((rnd(b.seed) - .5) * .15); R(-.4, -.32, .8, .64, '#fffdf4', .02); c.font = `700 .09px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = '#333'; c.textAlign = 'center'; (b.seed % 2 ? ['Geschlossen.', 'Danke für', 'alles!'] : ['Wir sagen Danke', 'für die', 'schöne Zeit.']).forEach((t2, i) => c.fillText(t2, 0, -.14 + i * .13)); c.restore();
      if (b.seed % 3 === 0) { R((wx0 + wx1) / 2 - .9, gf + 2.6, 1.8, .55, '#ffe14a', .02); c.font = `700 .22px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = '#c0392b'; c.fillText('ZU VERMIETEN', (wx0 + wx1) / 2, gf + 2.88); }
    }
  }
  S3.cache.set(key, cv); return cv;
}
function s3HildeGround(c, b, tod, hs, C, R, L, ink) {
  const w = b.w, gf = -4.45, night = tod === 'night' || tod === 'evening', empty = hs.state === 'empty';
  const front = empty ? C('#8a8680') : C('#1f3d32'), gold = '#d8b25a';
  R(.2, gf + .1, w - .4, 4.35, front, .04);
  if (!empty) { for (const x of [.2, w - .6]) R(x, gf + .1, .4, 4.35, C('#173026'), .03); L([.2, gf + .1, w - .2, gf + .1], .06, gold); L([.2, -.05, w - .2, -.05], .06, gold); }
  // sign band
  R(.6, gf + .25, w - 1.2, 1.0, empty ? C('#a8a49c') : C('#132820'), .035);
  if (!empty) { L([.75, gf + .35, w - .75, gf + .35], .03, gold); L([.75, gf + 1.15, w - .75, gf + 1.15], .03, gold); c.font = `700 .78px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = night ? '#ffe7a8' : '#e8c878'; c.fillText('HILDE', w / 2 - 1.6, gf + .76); c.font = `700 .42px ${NOAH_FONT}, Inter, sans-serif`; c.fillText('– Restaurant –', w / 2 + 2.2, gf + .8); if (hs.star) { star(c, w - 1.4, gf + .75, .3, 5, .45); c.fillStyle = gold; c.fill(); } }
  else { c.font = `700 .5px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(80,70,60,.35)'; c.fillText('R E S T A U R A N T', w / 2, gf + .76); }
  // three tall arched windows + central door
  const wins = [[.9, 4.2], [w - 5.1, 4.2]], door = [w / 2 - .9, 1.8];
  const glowA = night ? 1 : .55, guests = hs.guests ?? 4;
  for (const [x0, ww] of wins) {
    const y0 = gf + 1.45, hh = 2.95; c.beginPath(); c.moveTo(x0, y0 + hh); c.lineTo(x0, y0 + .6); c.quadraticCurveTo(x0 + ww / 2, y0 - .25, x0 + ww, y0 + .6); c.lineTo(x0 + ww, y0 + hh); c.closePath();
    c.save(); c.clip();
    if (empty) { c.fillStyle = C('#e8e2d4'); c.fillRect(x0, y0 - .5, ww, hh + .6); for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(160,150,130,.25)'; c.fillRect(x0 + rnd(i) * ww, y0 + rnd(i + 3) * hh, .5, .08); } R(x0 + ww / 2 - 1.1, y0 + .7, 2.2, 1.5, '#fff8e0', .03); c.font = `700 .34px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = '#c0392b'; c.textAlign = 'center'; c.fillText('ZU VERMIETEN', x0 + ww / 2, y0 + 1.2); c.font = `700 .2px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = '#333'; c.fillText('160 m² · Altbau', x0 + ww / 2, y0 + 1.6); c.fillText('Tel. 030 / 41 27 93', x0 + ww / 2, y0 + 1.9); }
    else {
      const g = c.createLinearGradient(0, y0, 0, y0 + hh); g.addColorStop(0, night ? '#ffcf80' : '#e8b880'); g.addColorStop(1, night ? '#c0703a' : '#9a6a4a'); c.fillStyle = g; c.fillRect(x0, y0 - .5, ww, hh + .6);
      c.fillStyle = 'rgba(80,30,25,.55)'; c.fillRect(x0, y0 + 1.1, ww, hh); // back wall wainscot
      for (let k = 0; k < 3; k++) { const cx = x0 + .7 + k * 1.4; L([cx, y0 - .3, cx, y0 + .35], .02, '#5a4020'); c.beginPath(); c.ellipse(cx, y0 + .45, .3, .15, 0, 0, 7); c.fillStyle = '#ffe8b0'; c.fill(); for (let j = 0; j < 5; j++) { c.beginPath(); c.arc(cx - .25 + j * .125, y0 + .6, .035, 0, 7); c.fillStyle = '#fff6dc'; c.fill(); } }
      for (let k = 0; k < 2; k++) { const tx = x0 + 1 + k * 2.2; R(tx - .6, y0 + 2.2, 1.2, .1, '#fbf6ea', 0); R(tx - .6, y0 + 2.3, 1.2, .5, '#f4ecdc', 0); c.beginPath(); c.arc(tx, y0 + 2.05, .05, 0, 7); c.fillStyle = '#fff2b0'; c.fill(); }
      for (let i = 0; i < guests; i++) { const gx = x0 + .5 + ((i * 1.3) % (ww - .8)), gy = y0 + 1.75; c.beginPath(); c.arc(gx, gy, .2, 0, 7); c.fillStyle = 'rgba(250,246,236,.95)'; c.fill(); c.lineWidth = .03; c.strokeStyle = 'rgba(40,20,20,.7)'; c.stroke(); c.beginPath(); c.moveTo(gx - .28, gy + .55); c.quadraticCurveTo(gx, gy + .1, gx + .28, gy + .55); c.fillStyle = ['#6a2a3a', '#2a3a5a', '#3a5a3a', '#5a4a6a'][i % 4]; c.fill(); }
      c.fillStyle = `rgba(255,240,200,${.18 * glowA})`; c.fillRect(x0, y0 - .5, ww, hh + .6);
    }
    c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(x0 + .4, y0 + hh); c.lineTo(x0 + 1.4, y0); c.lineTo(x0 + 1.9, y0); c.lineTo(x0 + .9, y0 + hh); c.fill(); c.restore();
    c.beginPath(); c.moveTo(x0, y0 + hh); c.lineTo(x0, y0 + .6); c.quadraticCurveTo(x0 + ww / 2, y0 - .25, x0 + ww, y0 + .6); c.lineTo(x0 + ww, y0 + hh); c.lineWidth = .1; c.strokeStyle = empty ? C('#6a6660') : gold; c.stroke();
    for (let k = 1; k < 3; k++) L([x0 + k * ww / 3, y0 + .2, x0 + k * ww / 3, y0 + hh], .05, empty ? C('#6a6660') : C('#173026'));
    R(x0 - .1, y0 + hh, ww + .2, .25, empty ? C('#9a968e') : C('#173026'), .03);
  }
  const [dx, dw] = door; R(dx, gf + 1.3, dw, 3.15, empty ? C('#6a6660') : C('#2a1a12'), .04); R(dx + .2, gf + 1.55, dw - .4, 1.9, night && !empty ? '#ffd890' : C('#7a8a98'), .03); L([dx + dw / 2, gf + 1.3, dx + dw / 2, -.05], .04, C('#1a100a'));
  if (!empty) { for (const s of [-1, 1]) { const hx = dx + dw / 2 + s * .25; L([hx, gf + 2.9, hx, gf + 3.4], .07, gold); } R(dx - .1, gf + 1.15, dw + .2, .18, gold, .02); c.font = `700 .18px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.fillStyle = gold; c.fillText('Nr. 12', dx + dw / 2, gf + 1.27); }
  if (hs.star) { R(dx + dw + .15, gf + 2.2, .6, .6, '#8a1a2a', .03); star(c, dx + dw + .45, gf + 2.5, .2, 5, .45); c.fillStyle = gold; c.fill(); }
  if (hs.opening) { R(1.2, gf + .2 - .55, w - 2.4, .5, '#fff8e8', .03); c.font = `700 .34px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.fillStyle = '#a0302a'; c.fillText('NEUERÖFFNUNG', w / 2, gf - .1); }
  if (hs.note) { c.save(); c.translate(dx + dw / 2, gf + 2.4); c.rotate(.05); R(-.32, -.3, .64, .6, '#fffdf4', .02); c.font = `700 .09px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = '#333'; c.textAlign = 'center'; ['Wir sagen', 'Danke für', 'die schöne', 'Zeit.'].forEach((s, i) => c.fillText(s, 0, -.14 + i * .11)); c.restore(); }
}
// ---------- projection ----------
function s3cam(cam) { const yaw = Math.atan2(cam.look[0] - cam.x, cam.look[2] - cam.z); const o = { x: cam.x, y: cam.y, z: cam.z, f: cam.f || 1300, cs: Math.cos(yaw), sn: Math.sin(yaw), yaw };
  const dx = cam.look[0] - cam.x, dz = cam.look[2] - cam.z, zt = dx * o.sn + dz * o.cs; o.shift = o.f * (cam.look[1] - cam.y) / zt; return o; }
function p3(o, X, Y, Z) { const dx = X - o.x, dz = Z - o.z, xc = dx * o.cs - dz * o.sn, zc = dx * o.sn + dz * o.cs; return [W / 2 + o.f * xc / zc, H / 2 + o.shift - o.f * (Y - o.y) / zc, zc]; }
function poly3(c, o, pts, fill, stroke, lw = 2) { const P = pts.map(p => p3(o, p[0], p[1], p[2])); if (P.some(p => p[2] < .3)) return false; c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.lineWidth = lw; c.strokeStyle = stroke; c.stroke(); } return true; }
// map a texture onto a vertical plane: bottom edge from (xa, za) to (xb, zb), from Y = y0 to y1 (texture covers it exactly)
function plane3(c, o, tex, xa, za, xb, zb, y0, y1) {
  const A = p3(o, xa, 0, za), B = p3(o, xb, 0, zb), span = Math.abs(B[0] - A[0]), n = Math.max(2, Math.min(400, Math.ceil(span / 5))), tw = tex.width, th = tex.height;
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, X0 = lerp(xa, xb, u0), Z0 = lerp(za, zb, u0), X1 = lerp(xa, xb, u1), Z1 = lerp(za, zb, u1);
    const a = p3(o, X0, y1, Z0), b = p3(o, X0, y0, Z0), d = p3(o, X1, y1, Z1);
    if (a[2] < .3 || d[2] < .3) continue; if (Math.max(a[0], d[0]) < -20 || Math.min(a[0], d[0]) > W + 20) continue;
    const sx = Math.min(a[0], d[0]), sw = Math.abs(d[0] - a[0]) + .7;
    c.drawImage(tex, u0 * tw, 0, Math.max(1, (u1 - u0) * tw), th, sx, a[1], sw, b[1] - a[1]);
  }
}
// billboard: draw fn in "world units" (220 per metre) standing at (X, Z)
function bb3(c, o, X, Z, fn, k = 1) { const p = p3(o, X, 0, Z); if (p[2] < .6) return; const s = o.f / p[2] / 220 * k; c.save(); c.translate(p[0], p[1]); c.scale(s, s); fn(c, s); c.restore(); }
// ---------- props (world units, 220/m) ----------
function lantern3(c, on, t) {
  c.beginPath(); c.moveTo(-34, 0); c.lineTo(34, 0); c.lineTo(22, -60); c.lineTo(-22, -60); c.closePath(); fs(c, '#2c3e34', 3);
  line(c, [0, -60, 0, -960], 22, OUT); line(c, [0, -60, 0, -960], 14, '#34493e'); for (let i = 0; i < 5; i++) line(c, [-9, -120 - i * 160, 9, -120 - i * 160], 4, '#4a6456');
  c.beginPath(); c.rect(-30, -980, 60, 26); fs(c, '#34493e', 3);
  c.beginPath(); c.moveTo(-50, -980); c.lineTo(50, -980); c.lineTo(62, -1110); c.lineTo(-62, -1110); c.closePath(); fs(c, on ? '#ffe6a8' : '#d8e0e4', 4); line(c, [0, -980, 0, -1110], 4, '#34493e');
  c.beginPath(); c.moveTo(-76, -1110); c.lineTo(76, -1110); c.lineTo(0, -1170); c.closePath(); fs(c, '#34493e', 3); circle(c, 0, -1186, 12); fs(c, '#34493e', 2);
  if (on) { const fl = 1 + Math.sin(t * 9) * .03; bloom(c, 0, -1040, 420 * fl, '255,200,120', .55); bloom(c, 0, -1040, 120, '255,240,200', .8); }
}
function linden3(c, tod, seed, t) {
  const night = tod === 'night' || tod === 'evening', P = { day: ['#4f8a3a', '#6aa84a', '#8cc860'], golden: ['#4f7030', '#7a9a3a', '#c8b858'], evening: ['#2a4a3a', '#3a5a44', '#5a7a50'], night: ['#16261f', '#22382c', '#3a5a3a'] }[tod];
  const tr = night ? '#2a2420' : '#5a4636'; line(c, [0, 0, -12, -1250], 60, OUT); line(c, [0, 0, -12, -1250], 46, tr); line(c, [-8, -1000, 150, -1250], 28, OUT); line(c, [-8, -1000, 150, -1250], 18, tr); line(c, [-8, -1080, -170, -1300], 26, OUT); line(c, [-8, -1080, -170, -1300], 16, tr);
  for (let k = 0; k < 6; k++) line(c, [-14 + k * 5, -60 - k * 170, -4 + k * 5, -120 - k * 170], 4, 'rgba(0,0,0,.25)');
  const blobs = []; for (let i = 0; i < 24; i++) { const a = rnd(seed + i) * Math.PI * 2, d = 100 + rnd(seed + i + 9) * 330; blobs.push([Math.cos(a) * d * 1.15, -1620 + Math.sin(a) * d * .75, 120 + rnd(seed + i + 3) * 90]); } blobs.push([0, -1620, 260]);
  for (const [x, y, r] of blobs) { c.beginPath(); c.arc(x, y, r + 8, 0, 7); c.fillStyle = OUT; c.fill(); }
  for (const [x, y, r] of blobs) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = P[0]; c.fill(); }
  for (const [x, y, r] of blobs) { c.beginPath(); c.arc(x - r * .25, y - r * .25, r * .7, 0, 7); c.fillStyle = P[1]; c.fill(); }
  for (const [x, y, r] of blobs) { c.beginPath(); c.arc(x - r * .4, y - r * .45, r * .32, 0, 7); c.fillStyle = P[2]; c.fill(); }
  for (let i = 0; i < 60; i++) { const x = (rnd(seed + i + 70) - .5) * 900, y = -1620 + (rnd(seed + i + 80) - .5) * 560; c.beginPath(); c.ellipse(x, y + Math.sin(t * 2 + i) * 3, 14, 9, rnd(i) * 3, 0, 7); c.fillStyle = P[2]; c.fill(); }
  c.beginPath(); c.rect(-140, -10, 280, 20); fs(c, '#4a4a52', 3); for (let i = 0; i < 7; i++) line(c, [-120 + i * 40, -8, -120 + i * 40, 8], 3, '#2a2a30');
}
function cafeSet3(c, t, tod, guests) {
  const um = tod === 'night' ? '#6a2a30' : '#b8323a';
  line(c, [0, 0, 0, -560], 14, OUT); line(c, [0, 0, 0, -560], 8, '#d8d0c0');
  c.beginPath(); c.moveTo(-330, -470); c.quadraticCurveTo(0, -650, 330, -470); c.lineTo(300, -440); c.quadraticCurveTo(0, -560, -300, -440); c.closePath(); fs(c, um, 4); for (let i = -2; i <= 2; i++) line(c, [i * 120, -440 + Math.abs(i) * 6, i * 60, -620], 3, 'rgba(255,255,255,.35)');
  for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-300 + i * 75, -440, 36, 0, Math.PI); fs(c, i % 2 ? um : '#f4ece0', 3); }
  for (const s of [-1, 1]) { c.save(); c.translate(s * 170, 0); line(c, [-50, 0, -40, -230], 7, '#2a2a30'); line(c, [50, 0, 40, -230], 7, '#2a2a30'); c.beginPath(); c.rect(-56, -230, 112, 14); fs(c, '#3a3a40', 2); c.beginPath(); c.rect(-50, -400, 100, 170); fs(c, '#d8c8a0', 2); for (let k = 0; k < 4; k++) line(c, [-40, -380 + k * 40, 40, -380 + k * 40], 3, '#a08860'); c.restore(); }
  for (let gi = 0; gi < guests; gi++) { const s = gi ? 1 : -1; drawPerson(c, P(PEOPLE.guest(31 + gi * 7 + ((t * 0) | 0)), t, { x: s * 170, sit: true, seatH: 250, k: .25, expr: Object.assign({ look: -s * .8 }, talkMouth(t + gi, 0, 999) || { mouth: 'smile' }), arms: { l: arm(.5, -1.3), r: arm(.5, -1.3) } })); }
  line(c, [0, 0, 0, -330], 12, '#2a2a30'); c.beginPath(); c.ellipse(0, -330, 120, 22, 0, 0, 7); fs(c, '#f4f0e8', 3); wineGlass(c, -30, -336, 1.3, { wine: '#6a0e1e' }); waterGlass(c, 40, -336, 1.2); candle(c, 0, -336, t, 1.2, tod === 'night' || tod === 'evening');
}
function s3sky(c, o, tod, t) {
  const S = { golden: ['#4f6fb0', '#f9b77a', '#ffe4b0'], day: ['#4a8fd8', '#9fcbef', '#e4f2fa'], evening: ['#141c48', '#3a4c8a', '#f09a6a'], night: ['#050818', '#0e1638', '#243060'] }[tod];
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, S[0]); g.addColorStop(.55, S[1]); g.addColorStop(1, S[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const pan = -o.yaw * o.f * .9;
  if (tod === 'night' || tod === 'evening') { for (let i = 0; i < 120; i++) { const x = ((rnd(i + 5) * 4000 + pan) % 4000 + 4000) % 4000 - 1000, y = rnd(i + 8) * H * .5; c.fillStyle = `rgba(255,255,255,${(.3 + rnd(i) * .6) * (tod === 'night' ? 1 : .5)})`; c.fillRect(x, y, 2.2, 2.2); } const mx = W * .78 + pan * .3, my = 140; c.beginPath(); c.arc(mx, my, 46, 0, 7); c.fillStyle = '#f2f4ff'; c.fill(); bloom(c, mx, my, 260, '180,200,255', .45); }
  else { for (let i = 0; i < 8; i++) { const x = ((rnd(i + 30) * 3600 + pan * .5 + t * 6) % 3600 + 3600) % 3600 - 800, y = 80 + rnd(i + 31) * 260; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + k * 70, y + Math.sin(k) * 14, 90, 38, 0, 0, 7); c.fillStyle = tod === 'golden' ? 'rgba(255,220,190,.55)' : 'rgba(255,255,255,.8)'; c.fill(); } }
    if (tod === 'golden') { const sx = W * .08 + pan * .3, sy = H * .55; bloom(c, sx, sy, 700, '255,190,110', .55); c.beginPath(); c.arc(sx, sy, 60, 0, 7); c.fillStyle = '#fff3d0'; c.fill(); } }
  // distant towers/domes far behind the street (parallax)
  for (const [X, hgt, kind] of [[-120, 62, 'spire'], [-40, 40, 'dome'], [70, 55, 'spire'], [150, 38, 'dome'], [25, 30, 'tv']]) { const b = p3(o, X, 0, 260), tp = p3(o, X, hgt, 260); if (b[2] < 1) continue; const s = (b[1] - tp[1]) / hgt; c.fillStyle = tod === 'night' ? '#0c1230' : tod === 'evening' ? '#2a2e5a' : tod === 'golden' ? '#b88a8a' : '#a8bcd0';
    if (kind === 'spire') { c.beginPath(); c.moveTo(b[0] - 6 * s, b[1]); c.lineTo(b[0] - 6 * s, b[1] - hgt * .55 * s); c.lineTo(b[0], tp[1]); c.lineTo(b[0] + 6 * s, b[1] - hgt * .55 * s); c.lineTo(b[0] + 6 * s, b[1]); c.fill(); }
    else if (kind === 'dome') { c.fillRect(b[0] - 14 * s, b[1] - hgt * .6 * s, 28 * s, hgt * .6 * s); c.beginPath(); c.arc(b[0], b[1] - hgt * .6 * s, 12 * s, Math.PI, 0); c.fill(); c.fillRect(b[0] - 1.5 * s, tp[1], 3 * s, hgt * .2 * s); }
    else { c.fillRect(b[0] - 2 * s, b[1] - hgt * s, 4 * s, hgt * s); c.beginPath(); c.arc(b[0], b[1] - hgt * .8 * s, 5 * s, 0, 7); c.fill(); } }
  haze(c, tod === 'night' ? '20,30,70' : tod === 'evening' ? '120,100,150' : tod === 'golden' ? '255,200,150' : '220,235,250', .12);
}
// ---------- the set ----------
function street3d(c, cam2, t, o = {}) {
  const tod = o.tod || 'golden', night = tod === 'night' || tod === 'evening', cam = s3cam(o.cam3), hs = Object.assign({ guests: 4 }, o.hilde || {});
  c.setTransform(1, 0, 0, 1, 0, 0); s3sky(c, cam, tod, t);
  // facades (all on Z = 0)
  for (const b of S3B) { const tex = s3Facade(b, tod, hs); plane3(c, cam, tex, b.x0, 0, b.x0 + b.w, 0, 0, b.h + 5.2); }
  // ground: sidewalk slabs, curb, cobbled street
  const xs = []; for (let X = -80; X <= 100; X += 2) xs.push(X);
  const band = (z0, z1, colA, colB, step = 2, lines = true) => { for (let i = 0; i < xs.length - 1; i++) { const X0 = xs[i], X1 = xs[i + 1]; for (let z = z0; z > z1 + 1e-6; z -= (z0 - z1) / Math.max(1, Math.round((z0 - z1) / 1.4))) { const za = z, zb = Math.max(z1, z - (z0 - z1) / Math.max(1, Math.round((z0 - z1) / 1.4))); poly3(c, cam, [[X0, 0, za], [X1, 0, za], [X1, 0, zb], [X0, 0, zb]], (Math.round(X0 / 2 + za * 3) % 2) ? colA : colB, lines ? 'rgba(0,0,0,.18)' : null, 1); } } };
  const D = night ? -.55 : 0, sh = col => D ? shade(col, D) : col;
  band(0, -4.2, sh('#c8c2b6'), sh('#bdb6a8'));
  poly3(c, cam, [[-80, .14, -4.2], [100, .14, -4.2], [100, 0, -4.35], [-80, 0, -4.35]], sh('#9a948a'), 'rgba(0,0,0,.3)', 1.5);
  band(-4.35, -20, sh('#6a6670'), sh('#5e5a66'), 2, true);
  for (let X = -80; X < 100; X += 6) poly3(c, cam, [[X, .01, -11.9], [X + 3, .01, -11.9], [X + 3, .01, -12.1], [X, .01, -12.1]], night ? 'rgba(220,220,200,.25)' : 'rgba(250,250,240,.7)');
  // 3D attachments + billboards, sorted far → near
  const items = [];
  for (const b of S3B) {
    if (!b.hilde && !hs.closed && (b.shop === 'cafe' || b.shop === 'blumen' || b.shop === 'baecker' || b.shop === 'wein' || b.shop === 'cafe2')) items.push({ z: -.7, x: b.x0 + b.w / 2, draw: () => { const x0 = b.x0 + .5, x1 = b.x0 + b.w - .5, n = 12, cA = ['#b8323a', '#2a6a4a', '#2a4a8a', '#c9a24a', '#6a2a5a'][b.seed % 5]; for (let i = 0; i < n; i++) { const xa = lerp(x0, x1, i / n), xb = lerp(x0, x1, (i + 1) / n); poly3(c, cam, [[xa, 3.35, 0], [xb, 3.35, 0], [xb, 2.6, -1.5], [xa, 2.6, -1.5]], i % 2 ? sh(cA) : sh('#f4ece0')); } poly3(c, cam, [[x0, 2.6, -1.5], [x1, 2.6, -1.5], [x1, 2.35, -1.5], [x0, 2.35, -1.5]], sh(shade(cA, -.15)), OUT, 1.5); poly3(c, cam, [[x0, 3.35, 0], [x1, 3.35, 0], [x1, 2.6, -1.5], [x0, 2.6, -1.5]], null, OUT, 1.5); } });
    if (b.balcony && b.floors > 3) { const nW = Math.max(3, Math.floor((b.w - 1) / 2.6)), sp = b.w / nW, ci = Math.floor(nW / 2), xa = b.x0 + (ci - .5) * sp + .1, xb = b.x0 + (ci + 1.5) * sp - .1, y = 4.6 + 3.5 + .9;
      items.push({ z: -.5, x: (xa + xb) / 2, draw: () => { poly3(c, cam, [[xa, y, 0], [xb, y, 0], [xb, y, -.9], [xa, y, -.9]], sh(shade(b.trim, -.08)), OUT, 1.5); poly3(c, cam, [[xa, y, -.9], [xb, y, -.9], [xb, y - .22, -.9], [xa, y - .22, -.9]], sh(b.trim), OUT, 1.5);
        for (let k = 0; k <= 16; k++) { const X = lerp(xa, xb, k / 16), A = p3(cam, X, y, -.9), B2 = p3(cam, X, y + 1.0, -.9); if (A[2] > .3) line(c, [A[0], A[1], B2[0], B2[1]], Math.max(1, 30 / A[2]), night ? '#0a0a10' : '#1e1e24'); }
        for (const Z of [-.9, 0]) for (const X of [xa, xb]) { const A = p3(cam, X, y, Z), B2 = p3(cam, X, y + 1, Z); if (A[2] > .3) line(c, [A[0], A[1], B2[0], B2[1]], Math.max(1.5, 50 / A[2]), '#1e1e24'); }
        for (const yy of [y + 1, y + .5]) { const A = p3(cam, xa, yy, -.9), B2 = p3(cam, xb, yy, -.9), C2 = p3(cam, xa, yy, 0), D2 = p3(cam, xb, yy, 0); if (A[2] > .3) { line(c, [A[0], A[1], B2[0], B2[1]], Math.max(1.5, 60 / A[2]), '#1e1e24'); line(c, [C2[0], C2[1], A[0], A[1]], Math.max(1.5, 50 / A[2]), '#1e1e24'); line(c, [D2[0], D2[1], B2[0], B2[1]], Math.max(1.5, 50 / A[2]), '#1e1e24'); } }
        for (let k = 0; k < 6; k++) { const X = lerp(xa + .2, xb - .2, k / 5); bb3(c, cam, X, -.85, c2 => { for (let j = 0; j < 3; j++) { c2.beginPath(); c2.arc(-30 + j * 30, -250 - (j % 2) * 20, 34, 0, 7); c2.fillStyle = ['#d8405a', '#f2c94a', '#4f8f50'][(k + j) % 3]; c2.fill(); } }, 1); } } }); }
  }
  // HILDE blade sign (perpendicular, 3D) + entrance lanterns + bay trees
  if (hs.state !== 'empty') {
    items.push({ z: -.6, x: 15.6, draw: () => { const tex = s3Blade(tod, hs.star); plane3(c, cam, tex, 15.7, -.25, 15.7, -1.55, 3.4, 4.7); const a = p3(cam, 15.7, 4.9, 0), b2 = p3(cam, 15.7, 4.9, -1.6); if (a[2] > .3) line(c, [a[0], a[1], b2[0], b2[1]], Math.max(2, 90 / a[2]), '#1e1e24'); } });
    for (const X of [6.75, 9.25]) items.push({ z: -.25, x: X, draw: () => { const p = p3(cam, X, 2.5, -.2); if (p[2] < .3) return; const s = cam.f / p[2]; c.save(); c.translate(p[0], p[1]); c.beginPath(); c.rect(-.13 * s, -.35 * s, .26 * s, .42 * s); fs(c, night ? '#ffd890' : '#e8e0c0', Math.max(1, s * .02)); c.beginPath(); c.moveTo(-.18 * s, -.35 * s); c.lineTo(.18 * s, -.35 * s); c.lineTo(0, -.52 * s); c.closePath(); fs(c, '#1e1e24', 1); if (night) bloom(c, 0, -.1 * s, s * 1.4, '255,200,120', .55); c.restore(); } });
    for (const X of [5.6, 10.4]) items.push({ z: -.7, x: X, draw: () => bb3(c, cam, X, -.7, c2 => { c2.beginPath(); c2.moveTo(-80, 0); c2.lineTo(80, 0); c2.lineTo(95, -170); c2.lineTo(-95, -170); c2.closePath(); fs(c2, '#2a3a32', 3); line(c2, [0, -170, 0, -330], 12, '#4a3020'); circle(c2, 0, -430, 110); fs(c2, night ? '#1e3a28' : '#3f7a44', 4); circle(c2, -30, -460, 60); c2.fillStyle = night ? '#2a4a34' : '#5a9a50'; c2.fill(); }) });
    if (hs.board) items.push({ z: -1.6, x: 3.2, draw: () => bb3(c, cam, 3.2, -1.6, c2 => { line(c2, [-80, 0, -50, -330], 10, '#5a3a24'); line(c2, [80, 0, 50, -330], 10, '#5a3a24'); c2.beginPath(); c2.rect(-90, -350, 180, 230); fs(c2, '#1f2a24', 4); c2.lineWidth = 3; c2.strokeStyle = '#c9a24a'; c2.strokeRect(-80, -340, 160, 210); c2.font = hudFont(24); c2.fillStyle = '#fff'; c2.textAlign = 'center'; c2.fillText(hs.board[0], 0, -300); c2.font = hudFont(56); c2.fillStyle = '#ffd36a'; c2.fillText(hs.board[1], 0, -232); c2.font = hudFont(18); c2.fillStyle = '#e8e8e8'; c2.fillText(hs.board[2] || '', 0, -180); }) });
    if (hs.flowers) for (const X of [4.6, 11.4]) items.push({ z: -.9, x: X, draw: () => bb3(c, cam, X, -.9, c2 => { line(c2, [-40, 0, 0, -200], 6, '#5a4030'); line(c2, [40, 0, 0, -200], 6, '#5a4030'); for (let i = 0; i < 12; i++) clayBlob(c2, -90 + (i % 4) * 60, -260 - Math.floor(i / 4) * 55, 38, 30, ['#f4f1ea', '#e0506a', '#f2c94a', '#c890d8'][i % 4], { seed: 400 + i, lw: 2 }); c2.beginPath(); c2.rect(-60, -220, 120, 24); fs(c2, '#fff8e8', 2); c2.font = hudFont(15); c2.fillStyle = '#a0302a'; c2.textAlign = 'center'; c2.fillText('Viel Erfolg!', 0, -203); }) });
  }
  // street trees, lanterns, parked cars, café terraces, bikes
  for (const X of S3TREES) { const sd = Math.round(X); items.push({ z: -3.5, x: X, draw: () => bb3(c, cam, X, -3.5, c2 => linden3(c2, tod, sd + 100, t)) }); }
  for (const X of S3LAMPS) items.push({ z: -3.9, x: X, draw: () => bb3(c, cam, X, -3.9, c2 => lantern3(c2, night, t)) });
  const cars = o.cars ?? [[-52, '#e8dcc0'], [-37, '#1f3a30'], [-22, '#2a2a30'], [27, '#7a1e2c'], [41, '#c8ccd2'], [58, '#2f4a6a']];
  for (const [X, col] of cars) items.push({ z: -5.3, x: X, draw: () => bb3(c, cam, X, -5.3, c2 => { car(c2, 0, { color: night ? shade(col, -.4) : col, s: 1 }); if (night) { bloom(c2, 340, -140, 120, '255,230,170', .35); } }, 1.25) });
  for (const b of S3B) if (!hs.closed && (b.shop === 'cafe' || b.shop === 'cafe2')) for (let k = 0; k < (b.hilde ? 0 : 2); k++) { const X = b.x0 + 3 + k * (b.w - 6); items.push({ z: -2.2, x: X, draw: () => bb3(c, cam, X, -2.2, c2 => cafeSet3(c2, t, tod, (b.seed + k) % 3 === 0 ? 1 : 2)) }); }
  items.push({ z: -3.0, x: -8, draw: () => bb3(c, cam, -8, -3.0, c2 => { bike(c2, 0); }) }, { z: -3.0, x: 21, draw: () => bb3(c, cam, 21, -3.0, c2 => { bike(c2, 0); }) });
  // people: walkers + queue + extras from the scene
  for (const w of (o.walkers || [])) items.push({ z: w.z, x: w.x, draw: () => bb3(c, cam, w.x, w.z, c2 => drawPerson(c2, P(w.who, t, Object.assign({ x: 0, k: .25 }, w.p || {})))) });
  if (hs.queue) for (let i = 0; i < hs.queue; i++) { const X = 10.6 + i * .72, Z = -1.2 - (i % 2) * .35; items.push({ z: Z, x: X, draw: () => bb3(c, cam, X, Z, c2 => drawPerson(c2, P(PEOPLE.guest(i * 3 + 7), t, { x: 0, k: .25, seed: i, expr: Object.assign({ look: -.6 }, talkMouth(t + i, 0, 999) || { mouth: 'smile' }) }))) }); }
  for (const it of (o.extra || [])) items.push(it);
  // moving car on the street
  if (o.traffic !== false) { const X = ((t * 9) % 200) - 90; items.push({ z: -9, x: X, draw: () => bb3(c, cam, X, -9, c2 => { c2.scale(-1, 1); car(c2, 0, { color: night ? '#3a3a4a' : '#e05a3a' }); if (night) bloom(c2, -340, -150, 260, '255,240,200', .5); }, 1.25) }); }
  items.forEach(it => { const p = p3(cam, it.x, 0, it.z); it.d = p[2]; });
  items.sort((a, b) => b.d - a.d).forEach(it => { if (it.d > .3) it.draw(c, cam); });
  c.__s3cam = cam;
  return { base: '#000' };
}
function s3Blade(tod, starOn) {
  const key = 'blade|' + tod + '|' + !!starOn; if (S3.cache.has(key)) return S3.cache.get(key);
  const cv = document.createElement('canvas'); cv.width = 260; cv.height = 260; const c = cv.getContext('2d'), night = tod === 'night' || tod === 'evening';
  c.fillStyle = '#132820'; c.fillRect(0, 0, 260, 260); c.lineWidth = 10; c.strokeStyle = '#d8b25a'; c.strokeRect(10, 10, 240, 240); c.font = `700 70px ${NOAH_FONT}, Inter, sans-serif`; c.textAlign = 'center'; c.fillStyle = night ? '#ffe7a8' : '#e8c878'; c.fillText('HILDE', 130, 125); c.font = `700 28px ${NOAH_FONT}, Inter, sans-serif`; c.fillText('Restaurant', 130, 175);
  if (starOn) { star(c, 130, 215, 22, 5, .45); c.fillStyle = '#d8b25a'; c.fill(); }
  S3.cache.set(key, cv); return cv;
}
// light pass for the street (screen list): warm sun grade, lantern pools, window glows, night grade
function street3dLight(c, cam3, t, o = {}) {
  const tod = o.tod || 'golden', cam = s3cam(cam3), night = tod === 'night' || tod === 'evening';
  c.save(); c.globalCompositeOperation = 'screen';
  if (night) {
    for (const X of S3LAMPS) { const p = p3(cam, X, 0, -3.9); if (p[2] < .6) continue; const s = cam.f / p[2]; c.save(); c.translate(p[0], p[1]); c.scale(1, .28); const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 4); g.addColorStop(0, 'rgba(255,190,110,.45)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(-s * 4, -s * 4, s * 8, s * 8); c.restore(); }
    if ((o.hilde || {}).state !== 'empty') { const lit = (o.hilde || {}).lit ?? 1; for (const X of [3, 13]) { const p = p3(cam, X, 2.6, 0); if (p[2] > .5) bloom(c, p[0], p[1], cam.f / p[2] * 4.5, '255,190,110', .5 * lit); } const g0 = p3(cam, 8, 0, -1.5); if (g0[2] > .5) { const s = cam.f / g0[2]; c.save(); c.translate(g0[0], g0[1]); c.scale(1, .3); const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 7); g.addColorStop(0, `rgba(255,200,120,${.4 * lit})`); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(-s * 7, -s * 7, s * 14, s * 14); c.restore(); } }
  } else if (tod === 'golden') { const g = c.createLinearGradient(0, H * .5, W, H * .2); g.addColorStop(0, 'rgba(255,170,90,.35)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-100, H * (.1 + i * .12)); c.lineTo(W * 1.2, H * (.25 + i * .14) + 200); c.lineTo(W * 1.2, H * (.25 + i * .14) + 260); c.lineTo(-100, H * (.1 + i * .12) + 40); c.fillStyle = 'rgba(255,220,160,.05)'; c.fill(); } }
  c.restore();
  if (o.motes) motes(c, 0, W, 0, H, t, { n: 50, speed: .015, alpha: .5 });
  grade(c, night ? { sx: .5, sy: .7, warm: '255,180,100', warmA: .3, cool: '10,15,50', coolA: tod === 'night' ? .5 : .35 } : tod === 'golden' ? { sx: .05, sy: .5, warm: '255,170,90', warmA: .4, cool: '70,40,90', coolA: .2 } : { sx: .2, sy: 0, warm: '255,240,210', warmA: .15, cool: '40,70,120', coolA: .12 });
}
// handy camera move: oblique (from down the street) → frontal, always looking at HILDE
function s3move(k, o = {}) { const a = lerp(o.a0 ?? -.75, o.a1 ?? -.05, ease(clamp(k))), d = lerp(o.d0 ?? 19, o.d1 ?? 15, ease(clamp(k))), tx = o.tx ?? 8;
  return { x: tx + Math.sin(a) * d, y: lerp(o.y0 ?? 2.4, o.y1 ?? 1.7, ease(clamp(k))), z: -Math.cos(a) * d, f: lerp(o.f0 ?? 1100, o.f1 ?? 1250, ease(clamp(k))), look: [tx + (o.lx || 0), lerp(o.ly0 ?? 6.5, o.ly1 ?? 4.2, ease(clamp(k))), 0] }; }
