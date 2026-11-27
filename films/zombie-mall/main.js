// MAIN FILM after the intro: data-driven shot list. Times in the list are SOURCE (MP3) seconds; V() maps to video time.
// Shot kinds: atr (3D atrium), lot (3D exterior), ent (entrance from inside, 2D), card (info card), cl (close-up with name tag),
//             tv (TV wall), phone, food, bed, game, plush, jackets, grille (night scratching) … more in main2.js.
const V = s => s + T.vo_offset + (s > T.gap_at ? T.gap : 0);
const PEOPLE = Object.assign({}, CAST);
// ---------- actors in 3D sets ----------
function actor(c, a, t, lt, P, o = {}) {
  const x = a.x + (a.v || 0) * (a.s || 1) * lt, q = P(x, 0, a.z); if (!q.front) return;
  const k = kAt(q.ppm) * (a.sc || 1), ph = t * 8 * (a.run ? 1.9 : Math.max(.6, (a.v || 1.2) / 1.2)) + (a.ph || 0);
  c.save(); c.fillStyle = o.night ? 'rgba(0,0,0,.4)' : 'rgba(60,40,20,.22)'; c.beginPath(); c.ellipse(q.x + q.ppm * .2, q.y, .42 * q.ppm, .09 * q.ppm, 0, 0, Math.PI * 2); c.fill(); c.restore();
  const shake = a.shake ? Math.sin(t * 60) * 3 : 0, X = q.x + shake, Y = q.y, w = a.w;
  if (w === 'noah') {
    if (a.pose === 'front') drawNoah(c, { x: X, y: Y, k, ink: 1.8, expr: a.expr, arms: a.arms, tilt: a.tilt, sit: a.sit, seatH: a.seatH });
    else drawNoahSide(c, { x: X, y: Y, k, ink: 1.8, s: a.s || 1, walk: a.pose === 'walk' || a.run ? ph : null, expr: a.expr, tilt: a.run ? .12 : 0 });
  } else if (w[0] === 'z' && !isNaN(+w.slice(1))) {
    const Z = HORDE[+w.slice(1)];
    if (a.pose === 'front') drawZombieFront(c, Z, { x: X, y: Y, k, t, dim: a.dim ?? .2, press: a.press });
    else drawZombieSide(c, Z, { x: X, y: Y, k, s: a.s || 1, walk: a.pose === 'stand' ? 0 : t * 3 + (a.ph || 0), t, dim: a.dim ?? .2 });
  } else {
    const Pp = PEOPLE[w] || w;
    if (a.pose === 'front') drawPerson(c, Pp, { x: X, y: Y, k, expr: a.expr, arms: a.arms, tilt: a.tilt, sit: a.sit, seatH: a.seatH });
    else drawPersonSide(c, Pp, { x: X, y: Y, k, s: a.s || 1, walk: a.pose === 'walk' || a.run ? ph : null, expr: a.expr, sit: a.sit, seatH: a.seatH });
  }
}
function actors(c, list, t, lt, P, o) { list.slice().sort((a, b) => a.z - b.z).forEach(a => actor(c, a, t, lt, P, o)); }
const lerp3 = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
function camOf(p, u) { const e = ez(u); return { pos: lerp3(p.c0, p.c1 || p.c0, e), look: lerp3(p.l0, p.l1 || p.l0, e), fov: p.fov || 50 }; }
// lower-third name tag
function nameTag(c, name, sub, lt) {
  const a = ez(clamp(lt / .4)); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; const x = 110 - (1 - a) * 60, y = 900;
  const gp = c.createLinearGradient(0, 0, 900, 0); gp.addColorStop(0, 'rgba(10,6,4,.7)'); gp.addColorStop(1, 'rgba(10,6,4,0)'); c.fillStyle = gp; c.fillRect(0, y - 150, 900, 220);
  c.fillStyle = '#ff7a2a'; c.fillRect(x - 30, y - 120, 9, 150);
  c.font = '150px FBebas'; c.fillStyle = 'rgba(0,0,0,.5)'; spaced(c, name, x + 4, y - 4, 8); c.fillStyle = '#fff6e8'; spaced(c, name, x, y - 8, 8);
  c.font = '50px FType'; c.fillStyle = '#ffb36b'; spaced(c, sub, x, y + 36, 3); c.restore();
}
// day title used for section openers (same template as the intro, day colours)
function dayStamp(c, big, small, lt, dark) {
  const n0 = clamp(Math.floor(lt / .085) + 1, 0, big.length), n1 = clamp(Math.floor((lt - big.length * .085 - .3) / .07) + 1, 0, small.length), out = 1 - clamp((lt - 3.2) / .4);
  if (out <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = out; const x = 128, y = 905;
  const g = c.createRadialGradient(x + 220, y - 90, 20, x + 220, y - 90, 520); g.addColorStop(0, 'rgba(0,0,6,.5)'); g.addColorStop(1, 'rgba(0,0,6,0)'); c.fillStyle = g; c.fillRect(0, y - 520, 900, 700);
  c.fillStyle = '#ff7a2a'; c.fillRect(x - 36, y - 210, 9, 250 * ez(clamp(lt / .3)));
  c.font = '200px FBebas'; c.fillStyle = 'rgba(0,0,0,.6)'; spaced(c, big.slice(0, n0), x + 5, y - 55, 10); c.fillStyle = '#f6f0e6'; spaced(c, big.slice(0, n0), x, y - 60, 10);
  c.fillStyle = 'rgba(246,240,230,.55)'; c.fillRect(x, y - 34, 430 * ez(clamp((lt - .5) / .3)), 3);
  c.font = '60px FType'; c.fillStyle = '#ffb36b'; spaced(c, small.slice(0, n1), x, y + 33, 6); c.restore();
}
// generic info card: dark paper with title + items that pop in
function card(c, t, lt, p) {
  const bg = p.bg || ['#141a2a', '#070a12']; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  if (p.title) { const a = ez(clamp(lt / .35)); c.globalAlpha = a; c.font = '600 46px FOswald'; c.textAlign = 'center'; c.fillStyle = p.accent || '#ff9a4a'; spaced(c, p.title, W / 2 + 6, 150, 12); c.globalAlpha = 1; c.textAlign = 'left'; }
  if (p.draw) p.draw(c, t, lt);
  c.restore(); grain(c, t, .03);
}
function pop(lt, t0, d = .3) { return ez(clamp((lt - t0) / d)); }
function bigText(c, s, x, y, size, col, a, o = {}) { c.save(); c.globalAlpha = a; c.font = `${size}px ${o.font || 'FAnton'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; const sc = lerp(1.25, 1, a); c.translate(x, y); c.scale(sc, sc); if (o.shadow !== false) { c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(s, 8, 8); } c.fillStyle = col; c.fillText(s, 0, 0); c.restore(); }
// emoji-free simple icons
function icon(c, kind, x, y, s, col = '#fff') {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round';
  if (kind === 'can') { c.beginPath(); c.roundRect(-40, -55, 80, 110, 10); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-40, -20, 80, 40); }
  else if (kind === 'bottle') { c.beginPath(); c.roundRect(-28, -40, 56, 100, 14); c.fill(); c.fillRect(-12, -70, 24, 34); }
  else if (kind === 'zombie') { circle(c, 0, -40, 30); c.fill(); c.beginPath(); c.roundRect(-30, -8, 60, 70, 14); c.fill(); c.fillStyle = '#e6eee6'; circle(c, -10, -42, 6); c.fill(); circle(c, 10, -38, 5); c.fill(); }
  else if (kind === 'bolt') { c.beginPath(); c.moveTo(10, -60); c.lineTo(-30, 10); c.lineTo(0, 10); c.lineTo(-10, 60); c.lineTo(30, -10); c.lineTo(0, -10); c.closePath(); c.fill(); }
  else if (kind === 'plate') { c.beginPath(); c.ellipse(0, 10, 60, 22, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#c8a050'; c.beginPath(); c.ellipse(0, 0, 30, 14, 0, 0, Math.PI * 2); c.fill(); }
  else if (kind === 'lock') { c.beginPath(); c.roundRect(-40, -10, 80, 70, 10); c.fill(); c.beginPath(); c.arc(0, -10, 28, Math.PI, 0); c.stroke(); }
  else if (kind === 'moon') { c.beginPath(); c.arc(0, 0, 45, .6, Math.PI * 2 - .6); c.quadraticCurveTo(10, 0, 0, 0); c.fill(); }
  else if (kind === 'walk') { circle(c, 0, -50, 16); c.fill(); line(c, [0, -30, 0, 15], 12, col); line(c, [0, 15, -20, 55], 12, col); line(c, [0, 15, 20, 55], 12, col); line(c, [0, -20, -24, 5], 10, col); line(c, [0, -20, 24, 0], 10, col); }
  c.restore();
}

// ================= shot kinds =================
const K = {};
K.atr = (c, t, lt, u, p) => {
  const cam = camOf(p, u), r = MALL3D.day(t, cam, { mood: p.mood, alert: p.alert && lt > (p.alertAt || 0) }), P = MALL3D.proj;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = p.mood === 'night' ? '#05070d' : p.mood === 'dark' ? '#2a2e38' : '#f6ead6'; c.fillRect(0, 0, W, H); c.restore();
  c.drawImage(r.bg, 0, 0);
  if (p.crowd) DAY_CROWD.forEach(([Pp, x, z, d, v], i) => { if (p.crowd === 'freeze') actor(c, { w: Pp, x, z, pose: 'front', expr: { mouth: 'o', browUp: .8, look: .6 } }, t, 0, P); else actor(c, { w: Pp, x: x + (p.panic ? 0 : 0), z, s: p.panic ? 1 : d, v: p.panic ? 4.5 : v, pose: 'walk', run: p.panic, ph: i * 1.3, shake: p.panic }, t, lt, P); });
  if (p.act) actors(c, p.act, t, lt, P, { night: p.mood === 'night' });
  if (p.fx) p.fx(c, t, lt, P);
  if (p.mood === 'day' || !p.mood) { const sk = P(-3, 16, -6); if (sk.front) sunRays(c, sk.x, sk.y, { n: 9, len: 2200, spread: .55, dir: Math.PI / 2 + .25, color: '255,240,200', alpha: .14, t }); grade(c, { sx: .35, sy: 0, warm: '255,200,130', warmA: .28, cool: '120,80,40', coolA: .08 }); }
  else { coldGrade(c, p.mood === 'night' ? 1 : .6); vignette(c, .55); }
  if (p.shake) { /* camera shake handled in cam jitter */ }
};
K.lot = (c, t, lt, u, p) => {
  const cam = camOf(p, u), day = !!p.day; if (p.jit) cam.pos[1] += Math.sin(t * 9) * .03;
  const r = MALL3D.night(t, cam, { day, noHaz: p.noHaz }), P = MALL3D.proj;
  if (day) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7fb2e0'); g.addColorStop(1, '#d8e6f0'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); const hz = P(0, 0, -2600); if (hz.front) skyline(c, -300, W + 300, hz.y + 2, t, { col: '#9aaabb', lit: 0, tall: .5, fires: p.fires || [] }); }
  else sky3D(c, t);
  c.drawImage(r.bg, 0, 0); if (p.act) actors(c, p.act.filter(a => a.z < 10), t, lt, P, { night: !day }); c.drawImage(r.mid, 0, 0); if (p.act) actors(c, p.act.filter(a => a.z >= 10), t, lt, P, { night: !day }); c.drawImage(r.fg, 0, 0);
  if (p.fx) p.fx(c, t, lt, P);
  if (day) grade(c, { sx: .2, sy: 0, warm: '255,220,170', warmA: .2, cool: '60,80,120', coolA: .1 }); else { coldGrade(c, .7); vignette(c, .6); }
};
K.card = (c, t, lt, u, p) => card(c, t, lt, p);
K.fn = (c, t, lt, u, p) => p.f(c, t, lt, u, p);

// ---------- Section 1: TAG 1 (src 26.7 – 110.86) ----------
const NOAH_SHOP = { w: 'noah', x: -5.2, z: 9.5, pose: 'walk', s: -1, v: .9 };
function tvWall(c, t, lt, wrong) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c0d12'; c.fillRect(0, 0, W, H);
  const zoom = wrong ? lerp(1, 1.9, ez(clamp(lt / 2.6))) : lerp(1, 1.08, lt / 3); c.translate(W / 2, H / 2); c.scale(zoom, zoom); c.translate(-W / 2, -H / 2);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const x = 120 + i * 580, y = 110 + j * 450, w = 520, h = 400; c.fillStyle = '#1a1b22'; c.fillRect(x - 16, y - 16, w + 32, h + 32);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#5a6a80'); g.addColorStop(1, '#2a2e3a'); c.fillStyle = g; c.fillRect(x, y, w, h);
    skyline(c, x - 40, x + w + 40, y + h * .72, t, { col: '#20242e', lit: 0, tall: .45, fires: [[x + 120 + i * 40, 80, .5]] });
    c.fillStyle = '#3a3e48'; c.fillRect(x, y + h * .72, w, h * .28);
    for (let n = 0; n < 6; n++) { const px = x + ((n * 97 + t * (wrong ? 40 : 160) + i * 50) % (w + 80)) - 40, py = y + h * .9; if (wrong && n % 2) drawZombieSide(c, HORDE[n + i * 3], { x: px, y: py, k: .09, s: 1, walk: t * 3 + n, t, dim: .55 }); else drawPersonSide(c, Object.values(CAST)[(n + i * 2 + j) % 12], { x: px, y: py, k: .09, s: 1, walk: t * 14 + n }); }
    c.fillStyle = '#c81818'; c.fillRect(x, y + h - 70, w, 70); c.font = '700 44px FOswald'; c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.fillText('EILMELDUNG', x + 20, y + h - 35);
    c.fillStyle = '#fff'; c.fillRect(x + w - 150, y + 20, 130, 40); c.fillStyle = '#c81818'; c.font = '700 28px FOswald'; c.fillText('LIVE', x + w - 118, y + 40);
    c.restore();
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = y; yy < y + h; yy += 4) c.fillRect(x, yy, w, 1);
  }
  c.restore(); vignette(c, .5);
}
function phoneShot(c, t, lt) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  // blurred-free background: atrium dimmed
  const r = MALL3D.day(t, { pos: [0, 1.6, 12], look: [0, 2, -10], fov: 55 }, { mood: 'day' }); c.drawImage(r.bg, 0, 0); c.fillStyle = 'rgba(10,8,20,.55)'; c.fillRect(0, 0, W, H);
  const vib = lt < 2.4 ? Math.sin(t * 90) * 7 : 0, x = W / 2 + vib, y = 560;
  c.save(); c.translate(x, y); c.rotate(-.04);
  c.fillStyle = '#0a0a0e'; c.beginPath(); c.roundRect(-230, -440, 460, 880, 60); c.fill(); c.fillStyle = '#20222c'; c.beginPath(); c.roundRect(-210, -420, 420, 840, 46); c.fill();
  const a = pop(lt, .25); c.globalAlpha = a; c.fillStyle = '#f2f2f4'; c.beginPath(); c.roundRect(-190, -260, 380, 330, 30); c.fill();
  c.fillStyle = '#d02020'; c.beginPath(); c.roundRect(-190, -260, 380, 80, [30, 30, 0, 0]); c.fill();
  c.fillStyle = '#fff'; c.font = '700 44px FOswald'; c.textAlign = 'center'; c.fillText('⚠ WARNUNG', 0, -205);
  c.fillStyle = '#1a1a22'; c.font = '600 40px FOswald'; c.fillText('Bleiben Sie in', 0, -110); c.fillText('geschlossenen', 0, -55); c.fillText('Räumen.', 0, 0); c.font = '400 26px FOswald'; c.fillStyle = '#5a5a66'; c.fillText('Katastrophenschutz · jetzt', 0, 50);
  c.restore();
  // hand
  drawNoahHand(c, x - 160, y + 330, .5, -.6); drawNoahHand(c, x + 170, y + 320, .5, .6);
  c.restore(); vignette(c, .5);
}
const HELLO = [];
const SECTION1 = [
  [26.7, 'atr', { c0: [-1.4, 1.9, 18.5], c1: [-.6, 1.8, 15], l0: [.4, 4.2, -20], l1: [0, 3.6, -20], fov: 52, crowd: 1, fx: (c, t, lt) => dayStamp(c, 'TAG 1', 'SAMSTAG · 10:07 UHR', lt + .2) }],
  [29.38, 'atr', { c0: [-1, 1.7, 15], c1: [-2.5, 1.7, 13.5], l0: [-11, 2.4, 6], l1: [-11, 2.2, 4], fov: 46, crowd: 1, act: [NOAH_SHOP, { w: 'malik', x: -6.2, z: 4.5, pose: 'front', expr: { mouth: 'o', eyes: 'closed', browUp: 1 } }, { w: 'grace', x: -4, z: 2, pose: 'walk', s: 1, v: .5 }] }],
  [34.68, 'atr', { c0: [0, 1.6, 12], c1: [0, 1.6, 11], l0: [0, 9, -2], l1: [0, 10, -4], fov: 50, crowd: 1, fx: (c, t, lt, P) => { const q = P(0, 12.2, -2); for (let i = 0; i < 6; i++) { const ph = (lt * .5 + i / 6) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.font = '90px serif'; c.fillStyle = '#5a3a2a'; c.fillText(i % 2 ? '♪' : '♫', q.x - 200 + i * 80 + Math.sin(t * 2 + i) * 30, q.y - ph * 260); c.restore(); } bigText(c, '5×', W - 260, 220, 160, '#ff7a2a', pop(lt, 1.4)); } }],
  [38.26, 'atr', { c0: [3, 1.7, 15], c1: [2.6, 1.7, 13.5], l0: [11, 2, 2], l1: [11, 2, 1], fov: 44, crowd: 1, alert: 1, alertAt: 2.6, act: [{ w: 'noah', x: 1.2, z: 9.8, pose: 'front', expr: { mouth: 'flat', look: .8 } }, { w: 'sade', x: 3.5, z: 6, pose: 'front', expr: { mouth: 'o', look: .8 } }] }],
  [43.24, 'fn', { f: (c, t, lt) => tvWall(c, t, lt, false) }],
  [46.44, 'fn', { f: (c, t, lt) => tvWall(c, t, lt, true) }],
  [49.94, 'atr', { c0: [0, 1.7, 17], c1: [0, 1.7, 15.5], l0: [0, 3, -20], fov: 50, crowd: 'freeze' }],
  [52.08, 'fn', { f: phoneShot }],
  [57.38, 'atr', { c0: [0, 2.2, 17], c1: [.4, 1.9, 13], l0: [6, 2.5, -20], fov: 54, crowd: 1, panic: 1, act: [{ w: 'noah', x: -3, z: 12, pose: 'walk', run: 1, v: 3.5, s: 1 }] }],
  [62.16, 'fn', { f: (c, t, lt) => entrance(c, t, lt, { zed: 1 }) }],
  [65.0, 'lot', { day: 1, c0: [2, 1.6, 4.5], c1: [1.5, 1.6, 7], l0: [-4, 1.2, 22], l1: [-6, 1.2, 22], fov: 40, noHaz: 1, act: [{ w: 'z0', x: -9, z: 18, s: 1, v: .5, dim: .1 }] }],
  [69.84, 'lot', { day: 1, c0: [-3, 1.5, 14], c1: [-3.4, 1.5, 15], l0: [-6.5, 1.3, 19], fov: 30, noHaz: 1, act: [{ w: 'z0', x: -7.2, z: 18, s: 1, v: .5, dim: .1 }] }],
  [71.16, 'lot', { day: 1, c0: [1.5, 1.6, 7], c1: [1.5, 1.9, 6], l0: [-6, 1.2, 22], l1: [-2, 1.4, 24], fov: 44, noHaz: 1, act: [{ w: 'z0', x: -6.5, z: 18, s: 1, v: .5, dim: .1 }, { w: 'z1', x: -14, z: 21, s: 1, v: .6, dim: .1 }, { w: 'z3', x: 4, z: 23, s: -1, v: .5, dim: .1 }, { w: 'z5', x: -1, z: 26, s: 1, v: .4, dim: .1 }, { w: 'z7', x: 9, z: 20, s: -1, v: .5, dim: .1 }, { w: 'z9', x: -20, z: 25, s: 1, v: .5, dim: .1 }] }],
  [73.24, 'fn', { f: (c, t, lt) => entrance(c, t, lt, { jamal: 1, btn: lt > 3.2 ? 1 : 0 }) }],
  [78.8, 'fn', { f: (c, t, lt) => entrance(c, t, lt, { gate: ez(clamp(lt / 1.9)), runners: 1, jamal: 2 }) }],
  [82.4, 'atr', { mood: 'day', c0: [0, 1.7, 14], c1: [0, 1.7, 12.5], l0: [0, 2.6, -20], fov: 50, act: [{ w: 'noah', x: -1, z: 9, pose: 'front', expr: { mouth: 'flat', browUp: .5 } }], fx: (c, t) => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(20,20,30,.25)'; c.fillRect(0, 0, W, H); c.restore(); } }],
  [84.44, 'atr', { c0: [0, 1.7, 16.5], c1: [0, 1.65, 14.5], l0: [0, 2.2, 0], fov: 46, act: FIVE(10.5) }],
  [87.9, 'fn', { f: (c, t, lt) => closeUp(c, t, lt, 'jamal', 'JAMAL', 'hat zuerst Hunger', { mouth: 'grin', look: .2 }, { l: { a: .3, b: 1.9 } }, 'burger') }],
  [91.94, 'fn', { f: (c, t, lt) => closeUp(c, t, lt, 'grace', 'GRACE', 'Krankenschwester', { mouth: 'smile', eyes: lt > 2 ? 'closed' : 'open' }, { l: { a: .45, b: 2.5 }, r: { a: .45, b: 2.5 } }) }],
  [97.28, 'fn', { f: (c, t, lt) => closeUp(c, t, lt, 'imani', 'IMANI', 'Ingenieurin', { mouth: 'flat', look: -.6 }, { r: { a: 1.4, b: 1.2 } }, 'map') }],
  [100.72, 'fn', { f: (c, t, lt) => closeUp(c, t, lt, 'nia', 'NIA', 'sucht ihre Mama', { mouth: 'flat', browUp: 1 }, {}) }],
  [106.08, 'fn', { f: (c, t, lt) => entrance(c, t, lt, { gate: 1, five: 1, night: 0 }) }],
  [108.1, 'lot', { day: 1, c0: [0, 9, 70], c1: [0, 14, 80], l0: [0, 6, 0], fov: 46, noHaz: 1, fires: [[200, 120, 1], [1500, 160, 1.2], [900, 90, .8]], act: Array.from({ length: 14 }, (_, i) => ({ w: 'z' + (10 + i), x: -30 + i * 4.4, z: 8 + (i % 4) * 5, s: i % 2 ? -1 : 1, v: .4, dim: .2 })) }],
];
function FIVE(z) { return [{ w: 'jamal', x: -2.6, z, pose: 'front', expr: { mouth: 'flat' } }, { w: 'grace', x: -1.1, z: z + .4, pose: 'front', expr: { mouth: 'flat' } }, { w: 'noah', x: .3, z: z + .8, pose: 'front', expr: { mouth: 'flat' } }, { w: 'nia', x: 1.3, z: z + .9, pose: 'front', expr: { mouth: 'flat', browUp: .8 } }, { w: 'imani', x: 2.6, z: z + .3, pose: 'front', expr: { mouth: 'flat' } }]; }
function closeUp(c, t, lt, who, name, sub, expr, arms, prop) {
  const cam = { pos: [-1, 1.5, 14], look: [-2, 2.2, -10], fov: 50 }; const r = MALL3D.day(t, cam, { mood: 'day' });
  c.drawImage(r.bg, 0, 0); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(30,20,10,.25)'; c.fillRect(0, 0, W, H); c.restore();
  const k = lerp(.62, .68, lt / 4), x = W * .62, y = H + (who === 'nia' ? 80 : 420) * k / .62;
  drawPerson(c, PEOPLE[who], { x, y, k, expr, arms, tilt: Math.sin(t * 1.3) * .02 });
  if (prop === 'burger') { const a = pop(lt, .6); c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x - 420, 260, 150, 110, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x - 330, 340); c.lineTo(x - 280, 420); c.lineTo(x - 360, 350); c.fill(); c.fillStyle = '#d89040'; c.beginPath(); c.ellipse(x - 420, 225, 80, 40, 0, Math.PI, 0); c.fill(); c.fillStyle = '#5a9a3a'; c.fillRect(x - 500, 228, 160, 12); c.fillStyle = '#6a3a20'; c.fillRect(x - 498, 242, 156, 26); c.fillStyle = '#d89040'; c.beginPath(); c.roundRect(x - 500, 270, 160, 22, 10); c.fill(); c.restore(); }
  if (prop === 'map') { c.save(); c.fillStyle = '#2a3a5a'; c.fillRect(120, 160, 560, 600); c.fillStyle = '#f2eee4'; c.fillRect(140, 220, 520, 520); c.font = '700 44px FOswald'; c.fillStyle = '#fff'; c.fillText('LAGEPLAN', 160, 205); for (let i = 0; i < 12; i++) { c.fillStyle = ['#e05a3a', '#2f7fd0', '#e8b030', '#3aa060'][i % 4]; c.fillRect(170 + (i % 4) * 120, 260 + Math.floor(i / 4) * 150, 100, 120); } c.fillStyle = '#d02020'; circle(c, 400, 640, 16); c.fill(); c.font = '600 28px FOswald'; c.fillText('Sie sind hier', 425, 650); if (Math.floor(lt * 2) % 3 === 0 && lt > .8) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(0, 0, W, H); } c.restore(); }
  nameTag(c, name, sub, lt - .3); vignette(c, .45);
}
function entrance(c, t, lt, o) {
  // inside the main entrance looking out (day): glass front, lot outside, roller grille coming down
  const cam = { x: lerp(-60, 60, lt / 5), y: -300, z: 1.0 };
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fbce4'); g.addColorStop(1, '#e0ecf4'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  layer(c, cam, .45, c => { skyline(c, -1500, 1500, wy(560, .45, cam), t, { col: '#a8b4c4', lit: 0, tall: .5, fires: [[300, 120, .7]] }); asphalt(c, -2000, 2000, wy(560, .45, cam), 900, t, { far: '#6a7280', near: '#545a66' }); });
  layer(c, cam, .55, c => { for (let i = 0; i < 4; i++) nightCar(c, -900 + i * 600, wy(740, .55, cam), { sc: .7, color: ['#c84a3a', '#3a6ad0', '#e8e0d0', '#3a3a40'][i], dark: 0, s: i % 2 ? -1 : 1 }); });
  if (o.zed || o.gate) layer(c, cam, .7, c => { const list = o.gate ? [0, 1, 3, 5, 7, 9, 11] : [0]; list.forEach((zi, j) => drawZombieSide(c, HORDE[zi], { x: (o.zed ? -300 : -900 + j * 300) + t * 20 * (j % 2 ? -1 : 1), y: wy(800, .7, cam), k: o.zed ? .16 : .2, s: j % 2 ? -1 : 1, walk: t * 3 + j, t, dim: .1 })); });
  if (o.runners) layer(c, cam, .85, c => { for (let i = 0; i < 3; i++) { const P0 = Object.values(CAST)[[1, 5, 10][i]], x = 700 - ((lt * 500 + i * 300) % 1600); drawPersonSide(c, P0, { x, y: wy(830, .85, cam), k: .24, s: -1, walk: t * 16 + i, expr: { mouth: 'o' } }); } });
  layer(c, cam, 1, c => {
    const top = wy(110, 1, cam), base = wy(830, 1, cam);
    glassFront(c, -1500, 1500, top, base, t, { n: 7, doors: [3] });
    if (o.gate !== undefined) { const gb = lerp(top, base, o.gate); c.fillStyle = 'rgba(70,76,88,.92)'; c.fillRect(-1500, top, 3000, gb - top); c.strokeStyle = '#2a2e38'; c.lineWidth = 6; for (let y = top + 18; y < gb; y += 26) { c.beginPath(); c.moveTo(-1500, y); c.lineTo(1500, y); c.stroke(); } c.fillStyle = '#9aa0ac'; c.fillRect(-1500, gb - 30, 3000, 30); c.fillStyle = '#20242e'; c.fillRect(-1500, top - 70, 3000, 70); }
    const g2 = c.createLinearGradient(0, base, 0, base + 600); g2.addColorStop(0, '#d8ccb6'); g2.addColorStop(1, '#b8a890'); c.fillStyle = g2; c.fillRect(-2000, base + 10, 4000, 900);
    // red button on the pillar
    c.fillStyle = '#e8e2d8'; c.fillRect(-1180, top, 160, base - top); c.fillStyle = '#ffd84a'; c.fillRect(-1150, wy(520, 1, cam) - 50, 100, 130); circle(c, -1100, wy(520, 1, cam), 32); c.fillStyle = o.btn ? '#ff6a4a' : '#d81818'; c.fill(); c.fillStyle = '#1a1a1a'; c.font = '700 20px FOswald'; c.textAlign = 'center'; c.fillText('NOT-AUS', -1100, wy(520, 1, cam) + 60);
    if (o.five) { const ppl = [['jamal', -380], ['grace', -190], ['nia', 120], ['imani', 300]]; drawNoah(c, { x: -20, y: base + 260, k: .3, ink: 1.8, expr: { mouth: 'flat' } }); ppl.forEach(([n, x]) => drawPerson(c, PEOPLE[n], { x: x * 1.2, y: base + 250, k: .3, s: 1, expr: { mouth: 'flat', look: 0 } })); }
    else if (o.jamal) {
      const pull = o.jamal === 1 ? ez(clamp((lt - .3) / .8)) : 1;
      drawNoahSide(c, { x: lerp(-200, -560, pull), y: base + 300, k: .34, ink: 1.8, s: 1, walk: null, expr: { mouth: 'o', browUp: 1 }, tilt: -.08 * pull });
      drawPerson(c, PEOPLE.jamal, { x: -860, y: base + 280, k: .36, expr: { mouth: 'flat', browUp: .2 }, arms: { l: { a: o.btn ? 2.3 : 1.6, b: .2 }, r: { a: 1.5, b: .3 } } });
    } else drawNoahSide(c, { x: 200, y: base + 220, k: .34, ink: 1.8, s: 1, walk: null, expr: { mouth: 'o', browUp: 1 } });
  });
  grade(c, { sx: .5, sy: .1, warm: '255,220,170', warmA: .2, cool: '60,80,120', coolA: .14 }); vignette(c, .4);
}

// ---------- Section 2: paradise (src 110.86 – 151.86) ----------
function interior(c, t, cam, o = {}) { const r = MALL3D.day(t, cam, { mood: o.mood || 'day' }); c.drawImage(r.bg, 0, 0); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.tint || 'rgba(40,24,10,.18)'; c.fillRect(0, 0, W, H); c.restore(); }
function tableScene(c, t, lt) {
  interior(c, t, { pos: [4, 1.4, 6], look: [11, 1.6, 2], fov: 55 });
  const y0 = 760; [['jamal', 560], ['nia', 900], ['noah', 1180], ['grace', 1430]].forEach(([n, x], i) => { const e = { mouth: i % 2 ? 'grin' : 'smile' }; if (n === 'noah') drawNoah(c, { x, y: y0 + 260, k: .42, ink: 1.8, expr: { mouth: 'smile' }, arms: { r: { a: 1.6, b: 1.0 } } }); else drawPerson(c, PEOPLE[n], { x, y: y0 + (n === 'nia' ? 120 : 270), k: .42, expr: e, arms: { l: { a: .9, b: 1.4 } } }); });
  c.fillStyle = '#c89060'; c.fillRect(300, y0, 1400, 70); c.fillStyle = '#8a5a3a'; c.fillRect(300, y0 + 70, 1400, 400);
  const foods = [[460, 'pizza'], [700, 'burger'], [1000, 'ice'], [1260, 'pizza'], [1520, 'burger']]; foods.forEach(([x, f], i) => { const a = pop(lt, .2 + i * .25, .25); c.save(); c.globalAlpha = a; c.translate(x, y0 + 10 - a * 6); c.fillStyle = '#f4f0e8'; c.beginPath(); c.ellipse(0, 0, 110, 28, 0, 0, Math.PI * 2); c.fill();
    if (f === 'pizza') { c.fillStyle = '#e8a040'; c.beginPath(); c.ellipse(0, -10, 85, 22, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#d84030'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(-50 + k * 20, -12 + (k % 2) * 6, 10, 5, 0, 0, Math.PI * 2); c.fill(); } }
    else if (f === 'burger') { c.fillStyle = '#d89040'; c.beginPath(); c.ellipse(0, -60, 60, 38, 0, Math.PI, 0); c.fill(); c.fillStyle = '#5a9a3a'; c.fillRect(-62, -60, 124, 10); c.fillStyle = '#6a3a20'; c.fillRect(-60, -50, 120, 24); c.fillStyle = '#d89040'; c.fillRect(-60, -26, 120, 18); }
    else { c.fillStyle = '#d8b080'; c.beginPath(); c.moveTo(-30, -20); c.lineTo(30, -20); c.lineTo(0, 50); c.fill(); for (const [dx, col] of [[-18, '#f8c8d8'], [18, '#fff4d0'], [0, '#8a5a3a']]) { circle(c, dx, -40 - (dx === 0 ? 26 : 0), 28); c.fillStyle = col; c.fill(); } }
    c.restore(); });
  if (lt > 3.4) { const a = pop(lt, 3.5); c.save(); c.globalAlpha = a; c.translate(W - 330, 260); c.rotate(-.12); c.strokeStyle = '#d82020'; c.lineWidth = 12; c.strokeRect(-230, -80, 460, 160); c.font = '72px FAnton'; c.fillStyle = '#d82020'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('0,00 €', 0, 0); c.restore(); }
  vignette(c, .4);
}
function bedScene(c, t, lt) {
  interior(c, t, { pos: [-4, 6.6, 6], look: [-11, 6.5, 1], fov: 55 }, { tint: 'rgba(40,24,10,.3)' });
  c.fillStyle = '#e8e2d8'; c.beginPath(); c.roundRect(360, 520, 1200, 120, 30); c.fill(); c.fillStyle = '#6a7aa8'; c.fillRect(300, 620, 1320, 200); c.fillStyle = '#4a5478'; c.fillRect(300, 800, 1320, 90); c.fillStyle = '#8a6a4a'; c.beginPath(); c.roundRect(300, 360, 70, 520, 20); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(420, 540, 240, 90, 40); c.fill();
  drawNoah(c, { x: 960, y: 900, k: .42, ink: 1.8, sit: true, seatH: 380, expr: { mouth: 'grin', eyes: lt > 1.4 ? 'closed' : 'open' }, arms: { l: { a: 2.6, b: .3 }, r: { a: 2.6, b: .3 } }, bob: Math.abs(Math.sin(t * 5)) * -40 });
  const a = pop(lt, .8); c.save(); c.globalAlpha = a; c.translate(1560, 300); c.rotate(.08); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-190, -70, 380, 140, 14); c.fill(); c.strokeStyle = '#d82020'; c.lineWidth = 6; c.stroke(); c.font = '80px FAnton'; c.fillStyle = '#d82020'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('24.999 €', 0, 4); c.restore();
  if (lt > 2.2) { c.save(); c.globalAlpha = pop(lt, 2.2); c.font = '64px FAnton'; c.fillStyle = '#fff6e8'; c.textAlign = 'center'; c.fillText('= 1 AUTO', 1560, 440); c.restore(); }
  vignette(c, .45);
}
function gameScene(c, t, lt) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0a0c16'; c.fillRect(0, 0, W, H);
  const sx = 260, sy = 90, sw = 1400, sh = 760; c.fillStyle = '#05060a'; c.fillRect(sx - 20, sy - 20, sw + 40, sh + 40); c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
  const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#ff6ab0'); g.addColorStop(.5, '#6a4ad0'); g.addColorStop(1, '#1a1a40'); c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
  c.fillStyle = '#2a2a3a'; c.beginPath(); c.moveTo(sx + sw / 2 - 30, sy + sh * .45); c.lineTo(sx + sw / 2 + 30, sy + sh * .45); c.lineTo(sx + sw, sy + sh); c.lineTo(sx, sy + sh); c.fill();
  for (let i = 0; i < 8; i++) { const ph = (t * 1.5 + i / 8) % 1, y = sy + sh * .45 + ph * ph * sh * .55; c.fillStyle = '#fff'; c.fillRect(sx + sw / 2 - 6 - ph * 20, y, 12 + ph * 40, 8 + ph * 30); }
  for (const [cx, col, o] of [[sx + sw * .4, '#ff3a3a', 0], [sx + sw * .6, '#3ad0ff', 1]]) { const bx = cx + Math.sin(t * 3 + o * 2) * 60; c.fillStyle = col; c.beginPath(); c.roundRect(bx - 90, sy + sh - 200, 180, 90, 20); c.fill(); c.fillStyle = '#111'; c.fillRect(bx - 80, sy + sh - 120, 50, 30); c.fillRect(bx + 30, sy + sh - 120, 50, 30); }
  c.font = '64px FVHS'; c.fillStyle = '#fff'; c.fillText(`RUNDE ${1 + Math.floor(lt)}`, sx + 40, sy + 70); c.restore();
  bloom(c, W / 2, sy + sh / 2, 900, '180,120,255', .25);
  c.fillStyle = '#6a2a2a'; c.beginPath(); c.roundRect(300, 880, 1320, 220, 40); c.fill();
  drawNoah(c, { x: 820, y: 1220, k: .5, ink: 1.8, expr: { mouth: 'grin', look: 0 }, arms: { l: { a: .9, b: -1.5 }, r: { a: .9, b: -1.5 } }, bob: Math.sin(t * 8) * 8 });
  drawPerson(c, PEOPLE.jamal, { x: 1160, y: 1240, k: .5, expr: { mouth: lt % 2 > 1 ? 'grin' : 'o' }, arms: { l: { a: .9, b: -1.5 }, r: { a: .9, b: -1.5 } }, tilt: Math.sin(t * 5) * .06 });
  c.restore(); vignette(c, .5);
}
function plushScene(c, t, lt) {
  interior(c, t, { pos: [3, 1.6, -4], look: [-11, 2.2, -12], fov: 55 });
  const cols = ['#f4b8c8', '#b8d8f4', '#f4e0a0', '#c8f0c0', '#d8c0f0', '#f4c8a0'];
  for (let row = 0; row < 6; row++) for (let i = 0; i < 9 - row; i++) { if (pop(lt, .1 + (row * 8 + i) * .03) < .5) continue; const x = 560 + row * 50 + i * 100 + (row % 2) * 10, y = 1000 - row * 90; c.fillStyle = cols[(i + row) % 6]; circle(c, x, y, 52); c.fill(); c.lineWidth = 6; c.strokeStyle = '#3a2a2a'; c.stroke(); circle(c, x - 30, y - 42, 18); c.fill(); c.stroke(); circle(c, x + 30, y - 42, 18); c.fill(); c.stroke(); c.fillStyle = '#2a1a1a'; circle(c, x - 14, y - 6, 6); c.fill(); circle(c, x + 14, y - 6, 6); c.fill(); }
  line(c, [1010, 470, 1010, 330], 8, '#6a4a30'); c.fillStyle = '#e83a6a'; c.beginPath(); c.moveTo(1014, 330); c.lineTo(1110, 360 + Math.sin(t * 6) * 8); c.lineTo(1014, 390); c.fill();
  if (lt > 1.2) drawPerson(c, PEOPLE.nia, { x: 900, y: 520 + (1 - pop(lt, 1.2, .5)) * 200, k: .3, expr: { mouth: 'grin' }, arms: { r: { a: 2.6 + Math.sin(t * 7) * .3, b: .4 } } });
  vignette(c, .45);
}
function jacketScene(c, t, lt) {
  interior(c, t, { pos: [-3, 1.6, -10], look: [11, 2, -16], fov: 55 });
  const cols = ['#c8783a', '#2a6ad0', '#d02a3a', '#3aa060', '#e8d040', '#6a3aa0', '#1a1a1a', '#f0f0f0'], i = Math.floor(lt / .45) % cols.length;
  const J = Object.assign({}, PEOPLE.jamal, { top: 'coat', topCol: cols[i] });
  c.fillStyle = '#d8ccb6'; c.fillRect(1300, 140, 26, 800); c.fillRect(1240, 940, 140, 20);
  c.fillStyle = 'rgba(220,235,245,.8)'; c.beginPath(); c.roundRect(1180, 180, 440, 760, 20); c.fill(); c.lineWidth = 14; c.strokeStyle = '#8a6a4a'; c.stroke();
  drawPerson(c, J, { x: 1400, y: 1040, k: .46, expr: { mouth: 'grin' }, arms: { l: { a: .4, b: 0 }, r: { a: 1.0, b: 1.2 } }, tilt: Math.sin(t * 3) * .04 });
  drawPerson(c, J, { x: 700, y: 1060, k: .5, expr: { mouth: 'smile', look: .6 }, arms: { r: { a: .9, b: 1.6 } } });
  for (let k = 0; k < 5; k++) { const x = 200 + k * 60; line(c, [x, 160, x, 200], 4, '#6a6a6a'); c.fillStyle = cols[(k + 3) % 8]; c.beginPath(); c.roundRect(x - 40, 200, 80, 220, 12); c.fill(); }
  c.font = '64px FAnton'; c.fillStyle = '#fff6e8'; c.textAlign = 'right'; c.fillText(`JACKE #${i + 1 + Math.floor(lt / 3.6) * 8}`, W - 90, 120); vignette(c, .4);
}
function grilleNight(c, t, lt, more) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#04060c'; c.fillRect(0, 0, W, H);
  // outside silhouettes behind the grille, eyes glowing
  const n = more ? 9 : 5; for (let i = 0; i < n; i++) drawZombieFront(c, HORDE[i + 3], { x: 180 + i * (1600 / n), y: 1180, k: .42, t: t + i, dim: .62, press: 1 });
  c.fillStyle = 'rgba(40,46,58,.5)'; c.fillRect(0, 0, W, H); for (let y = 10; y < H; y += 34) { c.fillStyle = '#5a6272'; c.fillRect(0, y, W, 6); } for (let x = 0; x < W; x += 140) { c.fillStyle = '#2a2e38'; c.fillRect(x, 0, 10, H); }
  for (let i = 0; i < n; i++) { const fx = 220 + i * (1600 / n), fy = 520 + Math.sin(t * 3 + i) * 10; for (let k = 0; k < 4; k++) { const sc = Math.sin(t * 5 + i + k) * 10; line(c, [fx + k * 22, fy + sc, fx + k * 22 + 4, fy + 70 + sc], 14, '#100d0c'); } }
  if (lt > .4) for (let i = 0; i < n * 2; i++) { const e = (t * 1.5 + i * .37) % 1; c.fillStyle = `rgba(215,235,225,${.8 * Math.sin(e * Math.PI)})`; circle(c, 150 + (i * 233) % 1650, 300 + (i * 97) % 300, 6); c.fill(); }
  c.restore(); bloom(c, W / 2, H, 900, '60,90,180', .2); coldGrade(c, 1); vignette(c, .7);
  if (more) { const days = [['TAG 2', 12], ['TAG 3', 19], ['TAG 4', 31], ['TAG 5', 46]]; days.forEach(([d, n2], i) => { const a = pop(lt, .3 + i * .4); if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.font = '58px FBebas'; c.fillStyle = '#f6f0e6'; spaced(c, d, 110, 200 + i * 110, 6); c.font = '78px FVHS'; c.fillStyle = '#ff7a7a'; c.fillText(String(n2), 330, 205 + i * 110); icon(c, 'zombie', 430, 178 + i * 110, .5, '#ff7a7a'); c.restore(); }); }
}
const SECTION2 = [
  [110.86, 'card', { title: 'WAS DIR KEIN FILM ZEIGT', draw: (c, t, lt) => { bigText(c, 'DIE ERSTEN TAGE', W / 2, 470, 170, '#f6f0e6', pop(lt, .3)); if (lt > 3.4) bigText(c, 'SIND GENIAL.', W / 2, 700, 190, '#ff9a4a', pop(lt, 3.5)); } }],
  [117.2, 'atr', { c0: [0, 9, 14], c1: [0, 3, 13], l0: [0, 1, -6], l1: [0, 2, -10], fov: 52, act: [{ w: 'noah', x: 0, z: 10.5, pose: 'front', expr: { mouth: 'grin' }, arms: { l: { a: 2.4, b: .3 }, r: { a: 2.4, b: .3 } } }] }],
  [120.46, 'fn', { f: tableScene }],
  [126.2, 'fn', { f: bedScene }],
  [130.38, 'fn', { f: gameScene }],
  [134.2, 'fn', { f: plushScene }],
  [137.06, 'fn', { f: jacketScene }],
  [140.9, 'atr', { mood: 'dusk', c0: [0, 1.6, 14], c1: [0, 1.6, 12.5], l0: [0, 2.2, -10], fov: 50, act: [{ w: 'jamal', x: -2.4, z: 7, pose: 'front', sit: true, seatH: 300, expr: { mouth: 'smile' } }, { w: 'grace', x: -1, z: 7.4, pose: 'front', expr: { mouth: 'smile' } }, { w: 'nia', x: .6, z: 7.6, pose: 'front', expr: { mouth: 'grin' } }, { w: 'imani', x: 2, z: 7.2, pose: 'front', expr: { mouth: 'smile' } }, { w: 'noah', x: 3.2, z: 8, pose: 'front', expr: { mouth: 'smile' } }] }],
  [144.02, 'fn', { f: (c, t, lt) => grilleNight(c, t, lt, false) }],
  [149.3, 'fn', { f: (c, t, lt) => grilleNight(c, t, lt, true) }],
];
let MAIN = SECTION1.concat(SECTION2);
function mainShot(c, t) {
  let i = MAIN.length - 1; while (i > 0 && V(MAIN[i][0]) > t) i--;
  const [s0, kind, p] = MAIN[i], a = Math.max(V(s0), SH.day + .9), b = i + 1 < MAIN.length ? V(MAIN[i + 1][0]) : T.end, lt = t - V(s0), u = clamp((t - V(s0)) / (b - V(s0)));
  K[kind](c, t, lt, u, p);
  const fi = clamp(lt / .18); if (fi < 1 && i > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${(1 - fi) * .6})`; c.fillRect(0, 0, W, H); c.restore(); }
}
