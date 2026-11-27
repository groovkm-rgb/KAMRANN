// Police cars, police officers, the crowd, Mensa, balcony, and paper cards (Urkunde, banner, newspaper). All text German.
CAST.polizist = { hairStyle: 'crew', hair: '#3a2a22', top: '#2f4f86', kind: 'police', sleeve: 'long', pants: '#22304a', shoe: '#111', scale: 1.05, tall: 1.12, helmet: true };
CAST.polizistin.kind = 'police'; CAST.polizistin.cap = true;
CAST.parent1 = { hairStyle: 'crew', hair: '#6a4a3a', top: '#4a7a5a', kind: 'plain', sleeve: 'long', pants: '#3a3f4a', shoe: '#222', scale: 1.04, tall: 1.12 };
CAST.parent2 = { hairStyle: 'bob', hair: '#2a2220', top: '#c8705a', kind: 'cardigan', sleeve: 'long', blouse: '#f2efe8', pants: '#3a3f6a', shoe: '#222', scale: 1.0, tall: 1.1 };
CAST.student4 = { hairStyle: 'long', hair: '#2a1e18', top: '#3aa05a', kind: 'sweater', sleeve: 'long', pants: '#3e5a86', shoe: '#fff' };
// police vest + helmet/cap drawn on top of the generic person
const _personTorso = personTorso;
personTorso = function (c, P) {
  _personTorso(c, P);
  if (P.kind === 'police') { c.save(); c.beginPath(); c.moveTo(-140, -930); c.lineTo(140, -930); c.lineTo(132, NOAH.HEM + 20); c.lineTo(-128, NOAH.HEM + 20); c.closePath(); c.fillStyle = '#d8e04a'; c.fill(); c.lineWidth = NOAH.W; c.strokeStyle = OUT; c.stroke(); c.fillStyle = '#cfd3d8'; c.fillRect(-128, -700, 260, 26); c.fillRect(-128, -600, 260, 26); c.fillStyle = '#2f4f86'; c.fillRect(-110, -830, 220, 80); c.font = '700 62px sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('POLIZEI', 0, -768); c.restore(); }
};
const _personHead = personHead;
personHead = function (c, P, e, back) {
  _personHead(c, P, e, back);
  const cy = -1240;
  if (P.helmet) { c.beginPath(); c.moveTo(-290, cy - 20); c.bezierCurveTo(-300, cy - 330, 300, cy - 330, 290, cy - 20); c.lineTo(250, cy - 40); c.lineTo(-250, cy - 40); c.closePath(); c.fillStyle = '#2a3550'; c.fill(); c.lineWidth = NOAH.W; c.strokeStyle = OUT; c.stroke(); if (!back) { c.fillStyle = 'rgba(150,190,230,.35)'; c.fillRect(-240, cy - 40, 480, 60); } }
  if (P.cap) { c.beginPath(); c.moveTo(-250, cy - 120); c.bezierCurveTo(-240, cy - 330, 240, cy - 330, 250, cy - 120); c.closePath(); c.fillStyle = '#22304a'; c.fill(); c.lineWidth = NOAH.W; c.strokeStyle = OUT; c.stroke(); if (!back) { c.beginPath(); c.ellipse(0, cy - 120, 300, 40, 0, 0, TAU); c.fillStyle = '#1a2338'; c.fill(); c.stroke(); star(c, 0, cy - 210, 34, '#f2c230'); } }
};
// the arrested man from behind: hood down, short dark hair, hands cuffed behind his back (no face)
function drawArrested(c, p = {}) {
  const k = (p.k ?? .25) * 1.2; c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k, k);
  drawAttacker(c, { k: 1 / 1.2, view: 'back', armL: -.05, armR: -.05 });
  c.translate(0, -215);
  c.beginPath(); c.arc(0, -1300, 210, 0, TAU); c.fillStyle = '#e8e2da'; c.fill(); c.lineWidth = 12; c.strokeStyle = '#060609'; c.stroke();
  c.beginPath(); c.arc(0, -1320, 205, Math.PI * .95, Math.PI * 2.05); c.lineTo(190, -1180); c.lineTo(-190, -1180); c.closePath(); c.fillStyle = '#3a2e28'; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-230, -1110); c.quadraticCurveTo(0, -1010, 230, -1110); c.lineTo(200, -1060); c.quadraticCurveTo(0, -980, -200, -1060); c.closePath(); c.fillStyle = '#15161b'; c.fill(); c.stroke(); // hood down
  c.restore();
}
// ---------- police car ----------
function policeCar(S, x, z, ry, t, o = {}) {
  const cs = Math.cos(ry), sn = Math.sin(ry), P = (dx, dy, dz) => [x + dx * cs + dz * sn, dy, z - dx * sn + dz * cs];
  solid(S, x - 2.2, .35, z - .9, 4.4, .75, 1.8, '#f4f4f4', { ry, cols: { left: '#2f8a5a', right: '#2f8a5a', front: '#e8e8e8', back: '#e8e8e8' } });
  solid(S, x - 1.1, 1.1, z - .8, 2.3, .6, 1.6, '#e0e6ec', { ry, cols: { left: '#5a7a9a', right: '#5a7a9a', front: '#7aa0c0', back: '#7aa0c0' } });
  for (const [dx, dz] of [[-1.4, -.92], [1.4, -.92], [-1.4, .92], [1.4, .92]]) { const w = P(dx, .35, dz); push(S, depthOf(S, w) - .1, c => { const p = proj(S.cam, w); if (!p) return; const r = S.cam.f * .35 / p[2]; circle(c, p[0], p[1], r); c.fillStyle = '#1a1a1a'; c.fill(); circle(c, p[0], p[1], r * .45); c.fillStyle = '#9aa0a8'; c.fill(); }); }
  const lb = P(0, 1.75, 0); push(S, depthOf(S, lb) - .2, c => { const p = proj(S.cam, lb); if (!p) return; const r = S.cam.f * .5 / p[2]; c.fillStyle = '#222'; c.fillRect(p[0] - r, p[1] - r * .15, r * 2, r * .3); const ph = Math.floor(t * 6 + (o.seed || 0)) % 2; c.fillStyle = ph ? '#3a7aff' : '#1a2a6a'; c.fillRect(p[0] - r, p[1] - r * .25, r * .9, r * .3); c.fillStyle = ph ? '#1a2a6a' : '#3a7aff'; c.fillRect(p[0] + r * .1, p[1] - r * .25, r * .9, r * .3); glow(c, p[0] + (ph ? -r * .5 : r * .5), p[1], r * 5, '60,120,255', .7); });
  const side = P(0, .75, 0); push(S, depthOf(S, side) - .3, c => { const p = proj(S.cam, side); if (!p) return; const r = S.cam.f * .22 / p[2]; c.font = FONT(Math.max(8, r)); c.fillStyle = '#2a4a8a'; c.textAlign = 'center'; c.fillText('POLIZEI', p[0], p[1]); });
}
// blue + red light flooding the yard
function policeGrade(c, t, k = 1) {
  const ph = Math.floor(t * 6) % 2;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(70,80,150,${.45 * k})`; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen'; let g = c.createRadialGradient(ph ? W * .2 : W * .8, H * .5, 0, ph ? W * .2 : W * .8, H * .5, W); g.addColorStop(0, `rgba(60,110,255,${.45 * k})`); g.addColorStop(1, 'rgba(60,110,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  g = c.createRadialGradient(ph ? W * .8 : W * .2, H * .6, 0, ph ? W * .8 : W * .2, H * .6, W * .7); g.addColorStop(0, `rgba(255,50,50,${.25 * k})`); g.addColorStop(1, 'rgba(255,50,50,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}
// ---------- crowd in the yard (billboards) ----------
const CROWD_P = [CAST.student1, CAST.student2, CAST.student3, CAST.student4, CAST.parent1, CAST.parent2, CAST.kid5a, CAST.kid5b, CAST.krueger, CAST.schroeder];
function crowd(S, t, o = {}) {
  const n = o.n || 46;
  for (let i = 0; i < n; i++) {
    const x = -14 + rnd(i * 3 + 1) * 26, z = -6 - rnd(i * 5 + 2) * 16; if (Math.abs(x - (o.gapX ?? -2)) < 1.6 && z < -14 && o.gap) continue;
    const P = CROWD_P[i % 8], clap = o.clap ? Math.sin(t * 9 + i) : 0;
    actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, P, { k: kk, ink: 1.6, back: o.back, expr: { mouth: o.cheer ? (Math.sin(t * 6 + i) > 0 ? 'grin' : 'o') : 'smile', eyes: o.cheer && i % 3 === 0 ? 'closed' : 'open' }, arms: o.clap ? { l: { a: .9 + clap * .15, b: -1.6 }, r: { a: .9 - clap * .15, b: -1.6 } } : (o.cheer && i % 4 === 0 ? { l: { a: 2.5, b: .2 }, r: { a: 2.5, b: .2 } } : undefined) }), { scale: P.scale || 1 });
  }
}
// ---------- paper cards ----------
function urkundeCard(c, t, t0, o = {}) {
  const a = clamp((t - t0) / .5); if (a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(o.x ?? W / 2, o.y ?? H / 2); c.rotate(-.03 + (1 - easeOut(a)) * .3); c.scale(.6 + .4 * easeBack(a), .6 + .4 * easeBack(a));
  const w = 980, h = 680; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#fbf6e6'; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
  c.strokeStyle = '#b8913e'; c.lineWidth = 22; c.strokeRect(-w / 2 + 26, -h / 2 + 26, w - 52, h - 52); c.lineWidth = 4; c.strokeRect(-w / 2 + 50, -h / 2 + 50, w - 100, h - 100);
  txt(c, 'URKUNDE', 0, -170, 96, '#7a5a1e', 'center'); line(c, [-260, -130, 260, -130], 4, '#b8913e');
  txt(c, 'für Noah', 0, -50, 56, '#2a2a33', 'center'); txt(c, 'Für Mut und Zivilcourage', 0, 50, 58, '#2a2a33', 'center');
  txt(c, 'Polizei · Lindenhof-Schule', 0, 230, 30, '#555', 'center');
  c.beginPath(); for (let i = 0; i < 24; i++) { const an = i / 24 * TAU, r = i % 2 ? 60 : 74; c.lineTo(330 + Math.cos(an) * r, 190 + Math.sin(an) * r); } c.closePath(); c.fillStyle = '#d0302a'; c.fill(); star(c, 330, 190, 34, '#f2c230');
  c.restore();
}
function bannerCard(c, t, t0, o = {}) {
  const a = clamp((t - t0) / .6); if (a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(o.x ?? W / 2, o.y ?? H / 2 - 20); c.scale(o.s || 1, o.s || 1); const unroll = easeOut(a);
  const w = 1500 * unroll, h = 760; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = '#fffdf6'; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  // child-like letters, wobbly, multicolour
  const letters = 'DANKE NOAH!'.split(''); letters.forEach((ch, i) => { c.save(); c.translate(-560 + i * 108, -230 + Math.sin(i * 1.7) * 14); c.rotate((rnd(i) - .5) * .3); c.font = FONT(130); c.fillStyle = ['#e04a3a', '#f2a53a', '#3aa05a', '#3a7ad2', '#8a5ab0'][i % 5]; c.textAlign = 'center'; c.fillText(ch, 0, 0); c.restore(); });
  // crayon drawing of Noah with a cape (nose a bit crooked)
  c.save(); c.translate(-150, 210); c.lineWidth = 9; c.strokeStyle = '#2a2a33'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-40, -120); c.quadraticCurveTo(-200, 40, -150, 200); c.lineTo(150, 200); c.quadraticCurveTo(200, 40, 40, -120); c.closePath(); c.fillStyle = '#e04a3a'; c.fill(); c.stroke(); // cape
  c.beginPath(); c.arc(0, -200, 90, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.stroke(); c.beginPath(); c.arc(0, -230, 92, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 30; c.strokeStyle = '#5a4a40'; c.stroke(); c.lineWidth = 9; c.strokeStyle = '#2a2a33';
  circle(c, -30, -205, 9); c.fill(); circle(c, 30, -205, 9); c.fillStyle = '#2a2a33'; c.fill(); c.beginPath(); c.moveTo(2, -195); c.lineTo(28, -168); c.lineTo(4, -165); c.stroke(); c.beginPath(); c.arc(0, -160, 34, .2, Math.PI - .2); c.stroke();
  c.fillStyle = '#2a2a33'; c.fillRect(-60, -110, 120, 170); c.font = FONT(36); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('Noah', 0, -40);
  line(c, [-60, -90, -150, -200], 14, '#2a2a33'); line(c, [60, -90, 150, -200], 14, '#2a2a33'); line(c, [-30, 60, -40, 190], 16, '#7a5a40'); line(c, [30, 60, 40, 190], 16, '#7a5a40');
  c.restore();
  for (let i = 0; i < 9; i++) star(c, 160 + (i % 3) * 140, 30 + Math.floor(i / 3) * 110, 30 + rnd(i) * 16, ['#ffd84a', '#ff9ec0', '#8fd0ff'][i % 3]);
  // little signatures
  ['Mia', 'Ben', 'Elif', 'Tom', 'Lina'].forEach((n, i) => { c.save(); c.translate(160 + i * 110, 340); c.rotate((rnd(i + 9) - .5) * .4); c.font = FONT(30); c.fillStyle = '#555'; c.fillText(n, 0, 0); c.restore(); });
  c.restore(); c.restore();
}
function newspaperCard(c, t, t0, o = {}) {
  const a = clamp((t - t0) / .4); if (a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(o.x ?? W / 2, o.y ?? H / 2); c.rotate(.06 - (1 - easeOut(a)) * 1.2); c.scale(.3 + .7 * easeBack(a), .3 + .7 * easeBack(a));
  const w = 900, h = 640; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = '#efeadc'; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
  txt(c, 'Stadt-Anzeiger', 0, -250, 54, '#222', 'center'); line(c, [-410, -225, 410, -225], 4, '#222');
  txt(c, 'Schüler (14) stoppt Eindringling', 0, -160, 46, '#111', 'center'); txt(c, 'mit falscher Durchsage', 0, -105, 40, '#111', 'center');
  c.fillStyle = '#b9b3a6'; c.fillRect(-400, -60, 400, 300); drawNoah(c, { x: -200, y: 230, k: .17, ink: 1.6, expr: { mouth: 'grin', blush: 1 } });
  for (let i = 0; i < 10; i++) line(c, [40, -40 + i * 28, 400 - (i % 3) * 30, -40 + i * 28], 6, 'rgba(40,40,40,.4)');
  c.restore();
}
// ---------- MENSA (cafeteria): counter along z = 4, tables ----------
function mensaFrame(c, t, cam, o = {}) {
  const S = scene(cam, Object.assign({ dir: V.norm([.5, .7, -.4]), col: [255, 244, 215], amb: .68, ambCol: [185, 195, 230], ink: 1.2, inkA: .45 }, o.light || {}));
  const fc = (P, col, n, oo = {}) => drawFace(S, c, P, col, n, Object.assign({ ink: 0 }, oo)), R = { w: 10, d: 8, h: 3.2 };
  fc([[0, 0, R.d], [R.w, 0, R.d], [R.w, 0, 0], [0, 0, 0]], '#d8cdb8', [0, 1, 0], { after: cc => { for (let i = 0; i <= 10; i++) { const a = proj(cam, [i, .001, 0]), b = proj(cam, [i, .001, R.d]); if (a && b) line(cc, [a[0], a[1], b[0], b[1]], 1.2, 'rgba(0,0,0,.12)'); } } });
  fc([[0, R.h, 0], [R.w, R.h, 0], [R.w, R.h, R.d], [0, R.h, R.d]], '#f4f1ea', [0, -1, 0], { extra: .15 });
  for (const [P, n, col] of [[[[0, 0, R.d], [0, R.h, R.d], [R.w, R.h, R.d], [R.w, 0, R.d]], [0, 0, -1], '#f2d9a8'], [[[0, 0, 0], [0, R.h, 0], [0, R.h, R.d], [0, 0, R.d]], [1, 0, 0], '#e8d0a0'], [[[R.w, 0, R.d], [R.w, R.h, R.d], [R.w, R.h, 0], [R.w, 0, 0]], [-1, 0, 0], '#e8d0a0']]) fc(P, col, n, { grad: [.05, .15] });
  texQuad(S, makeTex('mensasign', 600, 150, (cc, w, h) => { cc.fillStyle = '#e0663a'; cc.fillRect(0, 0, w, h); txt(cc, 'Mensa', w / 2, 108, 100, '#fff', 'center'); }), [[3.5, 2.9, R.d - .01], [6.5, 2.9, R.d - .01], [6.5, 2.2, R.d - .01], [3.5, 2.2, R.d - .01]], { now: c, nx: 1, ny: 1 });
  texQuad(S, makeTex('speiseplan', 500, 400, (cc, w, h) => { cc.fillStyle = '#fff'; cc.fillRect(0, 0, w, h); txt(cc, 'Speiseplan', w / 2, 60, 44, '#2a2a33', 'center'); ['Mo  Nudeln', 'Di  Gemüsecurry', 'Mi  Fischstäbchen', 'Do  Pizza', 'Fr  Kartoffelsuppe'].forEach((s, i) => txt(cc, s, 40, 130 + i * 56, 32, '#333')); }), [[7.2, 2.1, R.d - .01], [8.8, 2.1, R.d - .01], [8.8, .9, R.d - .01], [7.2, .9, R.d - .01]], { now: c, nx: 1, ny: 1 });
  solid(S, 1.5, 0, 5.2, 7, .95, .8, '#c9ced6', { gloss: .3, cols: { front: '#b8bec8' } }); solid(S, 1.5, .95, 5.2, 7, .05, .8, '#e8ecf0', { gloss: .4 });
  solid(S, 1.6, 1.3, 5.35, 6.8, .05, .5, 'rgba(220,240,255,.5)' === '' ? '#ddd' : '#dfe8ef', { bias: -.1 });
  for (let i = 0; i < 6; i++) { cylinder(S, 2.2 + i * .5, 1.0, 5.4, .09, .09, '#fff', { seg: 10, capCol: '#e9c26a', bias: -.2 }); }
  for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { const x = 1.6 + k * 4.2, z = 1.0 + r * 2.1; solid(S, x, .72, z, 3.2, .05, 1.0, '#e2a96a'); for (const dx of [.1, 3.0]) solid(S, x + dx, 0, z + .4, .06, .72, .2, '#777'); }
  if (o.cast) o.cast(S, t);
  flush(S, c);
  return S;
}
function puddingCup(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-60, -40); c.lineTo(60, -40); c.lineTo(46, 50); c.lineTo(-46, 50); c.closePath(); c.fillStyle = '#f4f4f4'; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.ellipse(0, -46, 56, 22, 0, Math.PI, TAU); c.fillStyle = '#f0c060'; c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -66, 18, 10, 0, 0, TAU); c.fillStyle = '#7a3a1a'; c.fill(); c.restore(); }
// ---------- BALCONY at sunset (screen-space layered set) ----------
function balconyFrame(c, t, o = {}) {
  const sx = o.sunX ?? W * .72, sy = o.sunY ?? H * .52 + (o.sink || 0);
  let g = c.createLinearGradient(0, 0, 0, H * .7); g.addColorStop(0, '#3f4a8a'); g.addColorStop(.45, '#e0785a'); g.addColorStop(1, '#ffd38a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  glow(c, sx, sy, 700, '255,200,120', .8); circle(c, sx, sy, 90); c.fillStyle = '#fff1c0'; c.fill();
  for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,190,150,.5)'; c.beginPath(); c.ellipse((i * 380 + t * 8) % (W + 400) - 200, 180 + (i % 3) * 70, 220, 26, 0, 0, TAU); c.fill(); }
  // far + mid skyline (parallax), haze
  for (const [p, col, hmax, by] of [[.2, 'rgba(110,70,110,.75)', 260, H * .62], [.45, 'rgba(70,45,80,.9)', 330, H * .7]]) { for (let i = -2; i < 34; i++) { const bw = 60 + rnd(i * 7 + p * 10) * 90, x = i * 70 - (o.pan || 0) * p * 200, bh = 80 + rnd(i * 3 + p * 20) * hmax; c.fillStyle = col; c.fillRect(x, by - bh, bw, bh + 300); if (p > .3) for (let r = 0; r < bh / 30; r++) for (let k = 0; k < 2; k++) if (rnd(i * 31 + r * 7 + k) > .7) { c.fillStyle = 'rgba(255,210,120,.75)'; c.fillRect(x + 10 + k * 26, by - bh + 12 + r * 30, 10, 12); c.fillStyle = col; } } c.fillStyle = 'rgba(255,180,120,.12)'; c.fillRect(0, 0, W, H); }
  // balcony floor + railing (foreground), plant, chair
  c.fillStyle = '#6a4a3a'; c.fillRect(0, H * .8, W, H * .2); g = c.createLinearGradient(0, H * .8, 0, H); g.addColorStop(0, 'rgba(255,190,120,.35)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = g; c.fillRect(0, H * .8, W, H * .2);
  line(c, [0, H * .6, W, H * .6], 16, '#2a2228'); for (let x = 30; x < W; x += 70) line(c, [x, H * .6, x, H * .8], 8, '#2a2228'); line(c, [0, H * .8, W, H * .8], 12, '#2a2228');
  c.save(); c.translate(250, H * .8); c.beginPath(); c.moveTo(-70, -150); c.lineTo(70, -150); c.lineTo(55, 0); c.lineTo(-55, 0); c.closePath(); c.fillStyle = '#c8714a'; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .3; c.beginPath(); c.moveTo(0, -150); c.quadraticCurveTo(Math.cos(a) * 80, -150 + Math.sin(a) * 200, Math.cos(a) * 160, -150 + Math.sin(a) * 280); c.lineWidth = 14; c.strokeStyle = '#3a5a2a'; c.stroke(); } c.restore();
}
