'use strict';
// ===== side cast in Noah's drawing language (round white heads, dot eyes, thick ink), local units, drawn at k = .25 =====
function withInk(fn) { const w0 = NOAH.W; NOAH.W = INKW; try { fn(); } finally { NOAH.W = w0; } }
function limb(c, pts, w, col) { nLine(c, pts, w + INKW * 2, NOAH.out); nLine(c, pts, w, col); }
function headBase(c, cx, cy, R, skin, shadeC) {
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fillStyle = shadeC; c.fill(); c.clip();
  c.beginPath(); c.arc(cx - 4, cy - R * .13, R - 4, 0, 7); c.fillStyle = skin; c.fill(); c.restore();
  c.beginPath(); c.arc(cx, cy, R, 0, 7); nFill(c, null);
}
function eyesPair(c, cx, cy, dx, e) {
  for (const s of [-1, 1]) {
    const ex = cx + s * dx, ey = cy, sc = e.sc || 1;
    if (e.eyes === 'wide') {
      const r = 52 * sc, jx = (e.jit || 0) * Math.sin((e.t || 0) * 53 + s * 2), jy = (e.jit || 0) * Math.cos((e.t || 0) * 47 + s);
      c.beginPath(); c.arc(ex, ey, r, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 11; c.strokeStyle = NOAH.out; c.stroke();
      c.beginPath(); c.arc(ex + ((e.look || 0) - s * (e.cross || 0)) * 16 + jx, ey + (e.lookY || 0) * 16 + jy, 14 * (e.pupil || 1), 0, 7); c.fillStyle = NOAH.eye; c.fill();
      if (e.lidTw) { const l = e.lidTw; c.save(); c.beginPath(); c.arc(ex, ey, r + 6, 0, 7); c.clip(); c.fillStyle = '#f3ebe0'; c.fillRect(ex - r - 8, ey - r - 8, 2 * r + 16, (2 * r + 16) * l); c.restore(); nLine(c, [ex - r, ey - r + (2 * r) * l, ex + r, ey - r + (2 * r) * l], 9, NOAH.out); }
    } else if (e.eyes === 'shut') {
      nLine(c, [ex - s * 32, ey - 26, ex + s * 20, ey, ex - s * 32, ey + 26], 12, NOAH.eye);
    } else if (e.eyes === 'happy') {
      c.beginPath(); c.moveTo(ex - 26, ey + 8); c.quadraticCurveTo(ex, ey - 24, ex + 26, ey + 8); c.lineWidth = 11; c.strokeStyle = NOAH.eye; c.lineCap = 'round'; c.stroke();
    } else {
      const lid = e.lid || 0, rx = 21 * sc, ry = 31 * sc;
      c.save(); c.beginPath(); c.rect(ex - 40, ey - ry - 2 + lid * ry * 2, 80, 120); c.clip();
      c.beginPath(); c.ellipse(ex + ((e.look || 0) - s * (e.cross || 0)) * 7, ey + (e.lookY || 0) * 6, rx, ry, 0, 0, 7); c.fillStyle = NOAH.eye; c.fill(); c.restore();
      if (lid > .05) nLine(c, [ex - 27, ey - ry - 2 + lid * ry * 2, ex + 27, ey - ry - 2 + lid * ry * 2], 8, NOAH.eye);
    }
    if (e.lashes && e.eyes !== 'shut') for (const q of [0, 1]) nLine(c, [ex + s * (12 + q * 9), ey - 26 + q * 7, ex + s * (30 + q * 9), ey - 40 + q * 7], 6, NOAH.eye);
  }
}
function genericArm(c, side, spec, S, U, F, w, sleeve, cuff, hand = true) {
  let a = spec.a, b = spec.b || 0;
  if (spec.tx != null) { // IK
    const ux = side * (spec.tx - side * S[0]), uy = spec.ty - S[1], d = Math.max(1, Math.hypot(ux, uy)), dm = clamp(d, Math.abs(U - F) + 2, U + F - 2);
    const th = Math.atan2(ux, uy), al = Math.acos(clamp((U * U + dm * dm - F * F) / (2 * U * dm), -1, 1));
    a = th + (spec.flip ?? 1) * al; const ex = Math.sin(a) * U, ey = Math.cos(a) * U; b = Math.atan2(ux / d * dm - ex, uy / d * dm - ey) - a;
  }
  const sx = side * S[0], sy = S[1], a2 = a + b;
  const ex = sx + side * Math.sin(a) * U, ey = sy + Math.cos(a) * U, wx = ex + side * Math.sin(a2) * F, wy = ey + Math.cos(a2) * F;
  limb(c, [sx, sy, ex, ey, wx, wy], w, sleeve);
  if (cuff) { const fx = (wx - ex) / F, fy = (wy - ey) / F; limb(c, [wx - fx * 34, wy - fy * 34, wx - fx * 6, wy - fy * 6], w * .92, cuff); }
  if (hand) { c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore(); }
  return { wx, wy, a2 };
}

// ------------------------------------------------------------------ the vain customer (Herr mit Zylinder)
const GENT = { skin: '#fffaf2', shade: '#eadfcf', coat: '#7b2f33', coatD: '#57202a', vest: '#e6cd93', vestD: '#c9aa6c', shirt: '#fbf8f0', tie: '#2b2233',
  pants: '#8a8178', check: '#625a53', shoe: '#1f1a1a', spat: '#efe7d8', hat: '#231f25', hatHi: '#4a4350', band: '#7a2a2e', stache: '#3b2a20', burns: '#7a6656', gold: '#d6aa4c', nose: '#f6d3c8', blush: '#f2a49b' };
function gentLegsStand(c, walk) {
  const G = GENT;
  for (const s of [-1, 1]) {
    const lift = walk != null ? Math.max(0, Math.sin(walk + (s > 0 ? Math.PI : 0))) * 46 : 0;
    c.beginPath(); c.moveTo(s * 8, -500); c.lineTo(s * 120, -500); c.lineTo(s * 112, -130 - lift); c.lineTo(s * 18, -130 - lift); c.closePath(); nFill(c, G.pants);
    c.save(); c.clip(); for (let i = 0; i < 5; i++) nLine(c, [s * (22 + i * 22), -500, s * (22 + i * 21), -120], 4, G.check); for (let j = 0; j < 9; j++) nLine(c, [s * 8, -480 + j * 42, s * 125, -480 + j * 42], 4, G.check); c.restore();
    c.beginPath(); c.moveTo(s * 16, -150 - lift); c.lineTo(s * 114, -150 - lift); c.lineTo(s * 118, -70 - lift); c.lineTo(s * 14, -70 - lift); c.closePath(); nFill(c, G.spat);
    c.beginPath(); c.moveTo(s * 14, -82 - lift); c.lineTo(s * 116, -82 - lift); c.quadraticCurveTo(s * 196, -60 - lift, s * 200, -14 - lift); c.quadraticCurveTo(s * 194, 4 - lift, s * 140, 2 - lift); c.lineTo(s * 24, 2 - lift); c.quadraticCurveTo(s * 6, -40 - lift, s * 14, -82 - lift); nFill(c, G.shoe);
    nLine(c, [s * 60, -70 - lift, s * 150, -50 - lift], 6, 'rgba(255,255,255,.25)');
  }
}
function gentLegsSit(c) {
  const G = GENT;
  for (const s of [-1, 1]) {
    limb(c, [s * 118, -360, s * 112, -110], 112, G.pants);
    c.save(); c.beginPath(); c.rect(s > 0 ? 50 : -175, -380, 125, 260); c.clip(); for (let j = 0; j < 6; j++) nLine(c, [s * 50, -350 + j * 44, s * 175, -350 + j * 44], 4, G.check); c.restore();
    c.beginPath(); c.ellipse(s * 118, -385, 92, 70, 0, 0, 7); nFill(c, G.pants);
    c.beginPath(); c.moveTo(s * 62, -150); c.lineTo(s * 166, -150); c.lineTo(s * 168, -80); c.lineTo(s * 58, -80); c.closePath(); nFill(c, G.spat);
    c.beginPath(); c.ellipse(s * 116, -44, 92, 46, 0, 0, 7); nFill(c, G.shoe);
  }
}
function gentTorso(c) {
  const G = GENT;
  c.beginPath(); c.rect(-52, -1045, 104, 80); c.fillStyle = G.skin; c.fill(); nLine(c, [-52, -1045, -52, -980], 10, NOAH.out); nLine(c, [52, -1045, 52, -980], 10, NOAH.out);
  c.beginPath(); c.moveTo(-70, -1000); c.lineTo(-185, -985); c.quadraticCurveTo(-240, -840, -236, -690); c.quadraticCurveTo(-234, -560, -212, -452); c.lineTo(212, -452); c.quadraticCurveTo(234, -560, 236, -690); c.quadraticCurveTo(240, -840, 185, -985); c.lineTo(70, -1000); c.closePath(); nFill(c, G.coat);
  // round belly in a waistcoat
  c.beginPath(); c.moveTo(-72, -992); c.lineTo(72, -992); c.bezierCurveTo(185, -900, 215, -630, 150, -505); c.lineTo(40, -470); c.lineTo(0, -500); c.lineTo(-40, -470); c.lineTo(-150, -505); c.bezierCurveTo(-215, -630, -185, -900, -72, -992); c.closePath(); nFill(c, G.vest);
  c.save(); c.clip(); c.beginPath(); c.ellipse(120, -650, 110, 230, 0, 0, 7); c.fillStyle = 'rgba(150,110,50,.22)'; c.fill(); c.beginPath(); c.ellipse(-60, -760, 60, 90, -.4, 0, 7); c.fillStyle = 'rgba(255,255,255,.28)'; c.fill(); c.restore();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 72, -1000); c.lineTo(s * 158, -965); c.lineTo(s * 112, -862); c.lineTo(s * 152, -835); c.quadraticCurveTo(s * 188, -700, s * 170, -500); c.lineTo(s * 132, -500); c.quadraticCurveTo(s * 160, -700, s * 116, -850); c.closePath(); nFill(c, G.coatD, INKW * .6); }
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, -880 + i * 96, 14, 0, 7); nFill(c, G.gold, 6); }
  c.beginPath(); c.moveTo(-128, -700); c.quadraticCurveTo(-50, -630, 0, -686); c.quadraticCurveTo(55, -615, 126, -706); c.lineWidth = 9; c.strokeStyle = G.gold; c.stroke();
  c.beginPath(); c.arc(-128, -700, 12, 0, 7); nFill(c, G.gold, 5);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -985); c.lineTo(s * 64, -1050); c.lineTo(s * 80, -985); c.lineTo(s * 26, -958); c.closePath(); nFill(c, G.shirt, INKW * .55); }
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -980); c.lineTo(s * 62, -1012); c.lineTo(s * 60, -948); c.closePath(); nFill(c, G.tie, INKW * .55); }
  c.beginPath(); c.arc(0, -980, 19, 0, 7); nFill(c, G.tie, INKW * .55);
}
function gentHead(c, o) {
  const G = GENT, cx = 0, cy = -1268, R = 235, t = o.t || 0;
  headBase(c, cx, cy, R, G.skin, G.shade);
  // greying mutton chops
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 228, cy - 120); c.quadraticCurveTo(s * 246, cy + 20, s * 196, cy + 110); c.quadraticCurveTo(s * 160, cy + 120, s * 150, cy + 70); c.quadraticCurveTo(s * 186, cy - 10, s * 178, cy - 128); c.closePath(); nFill(c, G.burns, INKW * .6);
    for (let i = 0; i < 3; i++) nLine(c, [s * (200 - i * 12), cy - 90 + i * 10, s * (196 - i * 10), cy + 50 + i * 12], 4, '#5c4a3c'); }
  if (o.blush) { for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 132, cy + 72, 46, 26, 0, 0, 7); c.fillStyle = `rgba(242,140,130,${.45 * o.blush})`; c.fill(); } }
  eyesPair(c, cx, cy + 6, 86, Object.assign({ t }, o.e || {}));
  // bushy brows
  const e = o.e || {}, bu = (e.browUp || 0) * 26, ang = e.browAng || 0;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 40, cy - 68 - bu + ang * 30); c.quadraticCurveTo(s * 95, cy - 98 - bu, s * 150, cy - 80 - bu - ang * 8); c.lineWidth = 26; c.strokeStyle = '#5d4a3c'; c.lineCap = 'round'; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#86715f'; c.stroke(); }
  // nose
  c.beginPath(); c.ellipse(0, cy + 78, 36, 29, 0, 0, 7); nFill(c, G.nose, INKW * .65);
  c.beginPath(); c.ellipse(-10, cy + 70, 9, 6, 0, 0, 7); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  // mouth under the moustache
  const my = cy + 168, m = o.mouth || 'smug';
  if (m === 'smug') { c.beginPath(); c.moveTo(-30, my); c.quadraticCurveTo(20, my + 18, 46, my - 10); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'flat') nLine(c, [-40, my + 4, 40, my + 4], 9, NOAH.out);
  else if (m === 'frown') { c.beginPath(); c.moveTo(-44, my + 14); c.quadraticCurveTo(0, my - 12, 44, my + 14); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'tight') { c.beginPath(); c.moveTo(-44, my + 4); for (let i = 1; i <= 8; i++) c.lineTo(-44 + i * 11, my + 4 + (i % 2 ? -6 : 6)); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'o' || m === 'sneeze') { const r = m === 'sneeze' ? 1.6 : 1; c.beginPath(); c.ellipse(0, my + 14, 26 * r, 34 * r, 0, 0, 7); nFill(c, '#5a2026', 9); }
  else if (m === 'gulp') { c.beginPath(); c.ellipse(0, my + 8, 22, 12, 0, 0, 7); nFill(c, '#5a2026', 8); }
  else if (m === 'grin') { // forced smile: k = width 0..1, wob = tremble
    const k = o.smile ?? 1, wob = o.wob || 0, w = 40 + 70 * k, h = 14 + 34 * k, j = i => Math.sin(t * 38 + i * 1.7) * wob * 6;
    c.beginPath(); c.moveTo(-w, my - 4 + j(0)); c.quadraticCurveTo(0, my - 10 + j(1), w, my - 4 + j(2)); c.quadraticCurveTo(w * .6, my + h + j(3), 0, my + h + j(4)); c.quadraticCurveTo(-w * .6, my + h + j(5), -w, my - 4 + j(0)); c.closePath();
    c.fillStyle = '#fff'; c.fill(); c.save(); c.clip(); for (let i = -3; i <= 3; i++) nLine(c, [i * w / 3.6, my - 12, i * w / 3.6, my + h + 6], 5, '#b8aea2'); nLine(c, [-w, my + h * .45, w, my + h * .45], 5, '#b8aea2'); c.restore();
    c.lineWidth = 9; c.strokeStyle = NOAH.out; c.stroke();
  }
  // handlebar moustache
  const y0 = cy + 116, tw = o.twirl || 0, wig = o.stacheWig || 0;
  for (const s of [-1, 1]) {
    c.save(); c.translate(0, y0); c.rotate(s * Math.sin(t * 44) * wig * .1 + s * (o.stacheUp || 0) * -.12); c.translate(0, -y0);
    const tipY = y0 - 64 - (s > 0 ? tw * 26 : 0) - (o.stacheUp || 0) * 20, tipX = s * (205 + (s > 0 ? tw * 10 : 0));
    c.beginPath(); c.moveTo(0, y0 - 18); c.bezierCurveTo(s * 70, y0 - 40, s * 140, y0 - 4, tipX - s * 6, tipY + 22);
    c.quadraticCurveTo(tipX + s * 18, tipY + 2, tipX, tipY - 8); c.quadraticCurveTo(tipX - s * 14, tipY - 4, tipX - s * 10, tipY + 12);
    c.bezierCurveTo(s * 130, y0 + 50, s * 60, y0 + 46, 0, y0 + 22); c.closePath(); nFill(c, G.stache, INKW * .7);
    for (let i = 0; i < 4; i++) nLine(c, [s * (20 + i * 26), y0 + 2 + i * 2, s * (60 + i * 30), y0 - 6 - i * 4], 4, '#6b5240');
    c.restore();
  }
  // top hat
  if (o.hat !== false) {
    c.save(); c.translate(0, -(o.hatUp || 0)); c.translate(0, cy - 200); c.rotate(o.hatRot || 0); c.translate(0, -(cy - 200));
    const by = cy - 196;
    c.beginPath(); c.moveTo(-148, by - 10); c.lineTo(-162, by - 360); c.quadraticCurveTo(0, by - 386, 162, by - 360); c.lineTo(148, by - 10); c.closePath(); nFill(c, G.hat);
    c.save(); c.clip(); c.fillStyle = 'rgba(140,130,160,.25)'; c.fillRect(-120, by - 380, 40, 380); c.fillRect(-60, by - 380, 14, 380); c.restore();
    c.beginPath(); c.ellipse(0, by - 360, 162, 26, 0, 0, 7); nFill(c, G.hatHi);
    c.beginPath(); c.moveTo(-150, by - 70); c.lineTo(150, by - 70); c.lineTo(149, by - 18); c.lineTo(-149, by - 18); c.closePath(); nFill(c, G.band, INKW * .6);
    c.beginPath(); c.moveTo(-262, by - 6); c.quadraticCurveTo(-250, by + 38, 0, by + 40); c.quadraticCurveTo(250, by + 38, 262, by - 6); c.quadraticCurveTo(240, by - 36, 200, by - 14); c.quadraticCurveTo(0, by + 6, -200, by - 14); c.quadraticCurveTo(-240, by - 36, -262, by - 6); c.closePath(); nFill(c, G.hat);
    c.restore();
  }
  // sweat drops (world-ish local units)
  for (const d of o.sweat || []) { const p = clamp(d.p); if (p <= 0 || p >= 1) continue; c.save(); c.translate(d.x, cy - 150 + p * (d.len || 240)); c.scale(4.2, 4.2); drop(c, 0, 0, 1, 1 - Math.max(0, p - .85) / .15); c.restore(); }
}
function drawGent(c, o = {}) {
  withInk(() => {
    const k = o.k ?? NK; c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
    const dy = o.sit ? 150 : 0;
    if (o.sit) gentLegsSit(c); else gentLegsStand(c, o.walk);
    c.save(); c.translate(0, dy + (o.bob || 0)); if (o.lean) c.rotate(o.lean);
    const arms = o.arms || {}, S = [178, -975];
    gentTorso(c);
    const up = sp => sp && ((sp.a || 0) > 1.4 || (sp.ty != null && sp.ty < -1000));
    const drawA = (side, sp) => genericArm(c, side, sp || (o.sit ? { tx: side * 128, ty: -560 } : { a: .2, b: -.15 }), S, 225, 215, 86, side < 0 ? GENT.coat : GENT.coat, GENT.shirt);
    if (!up(arms.l)) drawA(-1, arms.l); if (!up(arms.r)) drawA(1, arms.r);
    c.save(); c.translate(0, -1010); c.rotate(o.tilt || 0); c.translate(0, 1010 + (o.headBob || 0)); gentHead(c, o); c.restore();
    if (up(arms.l)) drawA(-1, arms.l); if (up(arms.r)) drawA(1, arms.r);
    c.restore(); c.restore();
  });
}
// head position (world) of the gent for camera work
function gentHeadPos(o) { const k = o.k ?? NK; return [o.x, o.y + (-1268 + (o.sit ? 150 : 0) + (o.bob || 0)) * k]; }

// ------------------------------------------------------------------ the mother and the baby
const MOM = { skin: '#fffaf4', shade: '#efe3d6', hair: '#7e4426', hairD: '#552a14', hairL: '#a8643c', blouse: '#fbf7ee', blouseS: '#e3d9c6', skirt: '#36596b', skirtD: '#25404e', skirtL: '#4f7586', gold: '#d6aa4c', cameo: '#e9d6c4' };
function momHead(c, o) {
  const cx = 0, cy = -1225, R = 215, t = o.t || 0;
  // bun behind
  c.beginPath(); c.arc(0, cy - 238, 92, 0, 7); nFill(c, MOM.hair, INKW * .8);
  c.save(); c.clip(); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(0, cy - 238, 30 + i * 14, i, i + 3.6); c.lineWidth = 6; c.strokeStyle = i % 2 ? MOM.hairD : MOM.hairL; c.stroke(); } c.restore();
  headBase(c, cx, cy, R, MOM.skin, MOM.shade);
  // hair cap, centre parting, soft waves over the temples
  c.beginPath(); c.moveTo(-R + 4, cy + 10); c.bezierCurveTo(-R - 20, cy - 170, -150, cy - 262, 0, cy - 258); c.bezierCurveTo(150, cy - 262, R + 20, cy - 170, R - 4, cy + 10);
  c.bezierCurveTo(R - 40, cy - 40, R - 70, cy - 90, 120, cy - 110); c.quadraticCurveTo(50, cy - 150, 0, cy - 190); c.quadraticCurveTo(-50, cy - 150, -120, cy - 110); c.bezierCurveTo(-(R - 70), cy - 90, -(R - 40), cy - 40, -R + 4, cy + 10); c.closePath(); nFill(c, MOM.hair, INKW * .8);
  c.save(); c.clip(); for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(s * 6, cy - 200 + i * 6); c.quadraticCurveTo(s * (90 + i * 25), cy - 230 + i * 20, s * (170 + i * 12), cy - 60 + i * 20); c.lineWidth = 5; c.strokeStyle = i % 2 ? MOM.hairD : MOM.hairL; c.stroke(); } c.restore();
  // little curl at each temple
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 182, cy + 18, 18, 0, 7); nFill(c, MOM.hair, INKW * .5); }
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 120, cy + 70, 40, 22, 0, 0, 7); c.fillStyle = 'rgba(240,140,130,.38)'; c.fill(); }
  eyesPair(c, cx, cy + 16, 84, Object.assign({ t, lashes: true }, o.e || { lid: .15 }));
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 130, cy - 34); c.quadraticCurveTo(s * 88, cy - 54, s * 50, cy - 42); c.lineWidth = 11; c.strokeStyle = '#7a5040'; c.lineCap = 'round'; c.stroke(); }
  const my = cy + 136;
  if (o.mouth === 'o') { c.beginPath(); c.ellipse(0, my + 4, 18, 22, 0, 0, 7); nFill(c, '#5a2026', 8); }
  else { c.beginPath(); c.moveTo(-46, my - 6); c.quadraticCurveTo(0, my + 22, 46, my - 6); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
}
function momTorso(c) {
  c.beginPath(); c.rect(-44, -1030, 88, 70); c.fillStyle = MOM.skin; c.fill();
  c.beginPath(); c.moveTo(-60, -975); c.lineTo(-150, -950); c.quadraticCurveTo(-150, -800, -112, -640); c.lineTo(112, -640); c.quadraticCurveTo(150, -800, 150, -950); c.lineTo(60, -975); c.closePath(); nFill(c, MOM.blouse);
  c.save(); c.clip(); for (let i = -2; i <= 2; i++) nLine(c, [i * 26, -950, i * 22, -650], 4, MOM.blouseS); c.restore();
  // pin-tucks + cameo brooch + lace high collar
  c.beginPath(); c.moveTo(-60, -1060); c.lineTo(60, -1060); c.lineTo(66, -965); c.lineTo(-66, -965); c.closePath(); nFill(c, MOM.blouse, INKW * .6);
  for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-60 + i * 20, -1060, 11, Math.PI, 0); nFill(c, '#fff', 4); }
  c.beginPath(); c.ellipse(0, -935, 30, 38, 0, 0, 7); nFill(c, MOM.gold, 7); c.beginPath(); c.ellipse(0, -935, 19, 26, 0, 0, 7); c.fillStyle = MOM.cameo; c.fill();
  // waist sash
  c.beginPath(); c.moveTo(-114, -660); c.lineTo(114, -660); c.lineTo(118, -610); c.lineTo(-118, -610); c.closePath(); nFill(c, MOM.skirtD, INKW * .6);
}
function momSleeve(c, side, sw = 0) { // puffy leg-of-mutton upper sleeve
  c.beginPath(); c.ellipse(side * 170, -880, 80, 105, side * .25 + sw, 0, 7); nFill(c, MOM.blouse);
  c.save(); c.clip(); for (let i = 0; i < 3; i++) nLine(c, [side * (130 + i * 30), -960, side * (150 + i * 26), -800], 4, MOM.blouseS); c.restore();
}
function drawMother(c, o = {}) {
  withInk(() => {
    const k = o.k ?? NK, t = o.t || 0; c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
    const sit = !!o.sit, dy = sit ? 170 : 0, sway = o.walk != null ? Math.sin(o.walk) : 0;
    // skirt
    if (sit) {
      c.beginPath(); c.moveTo(-118, -440); c.quadraticCurveTo(-250, -470, -262, -360); c.lineTo(-282, -12); c.lineTo(282, -12); c.lineTo(262, -360); c.quadraticCurveTo(250, -470, 118, -440); c.closePath(); nFill(c, MOM.skirt);
      c.save(); c.clip(); for (let i = -3; i <= 3; i++) nLine(c, [i * 60, -380, i * 80, -10], 6, MOM.skirtD); c.beginPath(); c.ellipse(0, -410, 230, 70, 0, 0, 7); c.fillStyle = MOM.skirtL; c.globalAlpha = .45; c.fill(); c.restore();
    } else {
      c.beginPath(); c.moveTo(-112, -630); c.quadraticCurveTo(-200, -300, -250 - sway * 16, -14); for (let i = 0; i <= 10; i++) c.lineTo(-250 + i * 50 - sway * 16, -14 + (i % 2 ? 14 : 0)); c.quadraticCurveTo(200, -300, 112, -630); c.closePath(); nFill(c, MOM.skirt);
      c.save(); c.clip(); for (let i = -3; i <= 3; i++) nLine(c, [i * 26, -620, i * 74 - sway * 16, -10], 6, MOM.skirtD); c.restore();
      for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 70 + (s > 0 ? sway : -sway) * 20, -8, 50, 22, 0, 0, 7); nFill(c, '#2a2026'); }
    }
    c.save(); c.translate(0, dy + (o.bob || 0));
    momSleeve(c, -1); momSleeve(c, 1);
    momTorso(c);
    c.save(); c.translate(0, -1000); c.rotate(o.tilt || 0); c.translate(0, 1000); momHead(c, o); c.restore();
    // forearms cradling the baby (baby drawn in between)
    if (o.baby) { c.save(); o.baby(c); c.restore(); }
    const arm = (side, tx, ty) => genericArm(c, side, { tx, ty, flip: 1 }, [178, -880], 160, 190, 74, MOM.blouse, '#fff');
    arm(-1, o.lx ?? 70, o.ly ?? -640); arm(1, o.rx ?? -40, o.ry ?? -700);
    c.restore(); c.restore();
  });
}
// baby (local units, origin = bottom of the dress); wig 0..1 wriggle amount
function drawBaby(c, o = {}) {
  withInk(() => {
    const t = o.t || 0, wg = o.wig ?? 1, k = o.k ?? NK;
    c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
    c.rotate(Math.sin(t * 7.1) * .13 * wg + (o.rot || 0)); c.translate(0, -Math.abs(Math.sin(t * 8.7)) * 22 * wg);
    // chubby kicking legs with booties
    for (const s of [-1, 1]) { const kick = Math.sin(t * 11 + s * 1.3) * 26 * wg; limb(c, [s * 50, -60, s * (95 + kick * .4), 30 + kick], 62, '#fffaf4'); c.beginPath(); c.ellipse(s * (100 + kick * .4), 50 + kick, 40, 30, s * .3, 0, 7); nFill(c, '#f4f0ff'); }
    // lace dress
    c.beginPath(); c.moveTo(-70, -330); c.lineTo(70, -330); c.quadraticCurveTo(140, -200, 160, -40);
    for (let i = 0; i <= 8; i++) { const x = 160 - i * 40; c.quadraticCurveTo(x - 20, -10, x - 40, -40); }
    c.quadraticCurveTo(-140, -200, -70, -330); c.closePath(); nFill(c, '#fdfbf6');
    c.save(); c.clip(); for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-150 + (i % 7) * 50 + (i > 6 ? 25 : 0), -60 - (i > 6 ? 40 : 0), 8, 0, 7); c.fillStyle = '#e7e0d2'; c.fill(); } nLine(c, [-160, -110, 160, -110], 6, '#e7e0d2'); c.restore();
    // arms
    const reach = o.reach;
    for (const s of [-1, 1]) {
      const wave = Math.sin(t * 9 + s * 2) * .5 * wg;
      let a = .9 + wave, L1 = 120; if (reach && s === reach.side) a = reach.a;
      const sx = s * 70, sy = -300, ex = sx + s * Math.sin(a) * L1, ey = sy + Math.cos(a) * L1;
      limb(c, [sx, sy, ex, ey], 58, '#fdfbf6'); c.beginPath(); c.arc(ex, ey, 34, 0, 7); nFill(c, '#fffaf4');
      if (o.rattle && s < 0) { const ra = Math.sin(t * 22) * .5; c.save(); c.translate(ex, ey); c.rotate(ra - .6); nLine(c, [0, 0, 0, -110], 14, '#c99a45'); c.beginPath(); c.arc(0, -140, 42, 0, 7); nFill(c, '#e98aa6', INKW * .6); for (let q = 0; q < 3; q++) nLine(c, [-38, -160 + q * 20, 38, -160 + q * 20], 6, '#fff3c0'); c.restore(); }
      nLine(c, [ex - 10, ey + 6, ex + 10, ey + 6], 4, NOAH.out);
    }
    // head with one curl and a lace bonnet ring
    const cy = -470, R = 138;
    c.beginPath(); c.arc(0, cy, R + 34, Math.PI * .9, Math.PI * 2.1); c.lineWidth = 30; c.strokeStyle = '#fdfbf6'; c.stroke();
    headBase(c, 0, cy, R, '#fffaf4', '#efe3d6');
    for (let i = 0; i < 9; i++) { const an = Math.PI * (.95 + i * .13); c.beginPath(); c.arc(Math.cos(an) * (R + 34), cy + Math.sin(an) * (R + 34), 16, 0, 7); nFill(c, '#fdfbf6', 5); }
    c.beginPath(); c.moveTo(-6, cy - R + 4); c.bezierCurveTo(-30, cy - R - 60, 40, cy - R - 70, 30, cy - R - 20); c.bezierCurveTo(20, cy - R - 2, 0, cy - R - 30, 8, cy - R - 40); c.lineWidth = 11; c.strokeStyle = '#8a5a34'; c.lineCap = 'round'; c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 82, cy + 40, 30, 18, 0, 0, 7); c.fillStyle = 'rgba(245,130,130,.5)'; c.fill(); }
    const gg = o.giggle ?? (.5 + .5 * Math.sin(t * 13));
    eyesPair(c, 0, cy - 2, 52, gg > .6 ? { eyes: 'happy' } : { sc: .8, look: o.look || 0 });
    c.beginPath(); c.moveTo(-34, cy + 50); c.quadraticCurveTo(0, cy + 52 + 46 * gg, 34, cy + 50); c.closePath(); nFill(c, '#7a2a30', 7);
    if (gg > .3) { c.beginPath(); c.ellipse(0, cy + 70 + 20 * gg, 14, 8 * gg, 0, 0, 7); c.fillStyle = '#e8737b'; c.fill(); }
    c.restore();
  });
}
// a hand that peeks from under the cloth (local units at k)
function hiddenHand(c, x, y, k, ang) { withInk(() => { c.save(); c.translate(x, y); c.scale(k, k); noahHandLocal(c, ang); c.restore(); }); }

// ------------------------------------------------------------------ the mother under the black cloth (person → armchair → ghost)
const DRAPE_P = [[-270, 0], [-262, -180], [-252, -360], [-240, -520], [-232, -620], [-215, -720], [-200, -840], [-170, -960], [-200, -1060], [-218, -1200], [-195, -1350], [-120, -1440], [-40, -1462], [40, -1462], [120, -1440], [195, -1350], [218, -1200], [200, -1060], [170, -960], [200, -840], [215, -720], [232, -620], [252, -520], [262, -360], [270, -180]];
const DRAPE_S = [[-272, 0], [-266, -180], [-280, -360], [-300, -520], [-298, -610], [-262, -660], [-198, -660], [-196, -820], [-200, -1000], [-202, -1160], [-198, -1300], [-160, -1385], [-60, -1402], [60, -1402], [160, -1385], [198, -1300], [202, -1160], [200, -1000], [196, -820], [198, -660], [262, -660], [298, -610], [300, -520], [280, -360], [266, -180]];
const DRAPE_G = [[-250, -60], [-248, -250], [-244, -420], [-238, -560], [-232, -680], [-228, -800], [-224, -920], [-222, -1020], [-222, -1140], [-214, -1290], [-176, -1420], [-110, -1505], [-40, -1530], [40, -1530], [110, -1505], [176, -1420], [214, -1290], [222, -1140], [222, -1020], [224, -920], [228, -800], [232, -680], [238, -560], [244, -420], [248, -250]];
function drawDraped(c, o = {}) {
  withInk(() => {
    const k = o.k ?? NK, t = o.t || 0, s = clamp(o.sessel || 0), g = clamp(o.ghost || 0), p = 1 - s - g;
    c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k, k);
    const fl = g * (40 + Math.sin(t * 3.2) * 22); c.translate(0, -fl); c.rotate(Math.sin(t * 2.6) * .045 * g);
    // little chair legs when it looks like an armchair
    if (s > .02) { c.save(); c.globalAlpha = s; for (const x of [-235, -110, 110, 235]) { c.beginPath(); c.moveTo(x - 16, -30); c.lineTo(x + 16, -30); c.lineTo(x + 9, 36); c.lineTo(x - 9, 36); c.closePath(); nFill(c, '#7a4a26', INKW * .6); c.beginPath(); c.arc(x, 44, 12, 0, 7); nFill(c, MOM.gold, 6); } c.restore(); }
    const pts = DRAPE_P.map((q, i) => [q[0] * p + DRAPE_S[i][0] * s + DRAPE_G[i][0] * g, q[1] * p + DRAPE_S[i][1] * s + DRAPE_G[i][1] * g + Math.sin(t * 2 + i) * 4]);
    // hem: straight on the floor, wavy when it is a ghost
    const hem = [], n = 9, yB = pts[0][1];
    for (let i = 1; i < n; i++) { const x = pts[pts.length - 1][0] * (1 - i / n) + pts[0][0] * (i / n); hem.push([x, yB + (i % 2 ? 1 : -1) * 30 * g + Math.sin(t * 5 + i) * 10 * g]); }
    // hem from right to left: pts ends at right bottom (270,-180) ... add a right-bottom corner
    const right = [-pts[0][0], yB];
    const outline = [...pts, right, ...hem];
    // velvet body
    smoothPath(c, outline); const gr = c.createLinearGradient(-260, -1400, 260, 0); gr.addColorStop(0, '#3a2f44'); gr.addColorStop(.45, '#1d1724'); gr.addColorStop(1, '#120e16');
    c.fillStyle = gr; c.fill(); c.lineWidth = INKW; c.strokeStyle = NOAH.out; c.stroke();
    c.save(); smoothPath(c, outline); c.clip();
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 55, -1300 * (p + s * .95 + g)); c.quadraticCurveTo(i * 80 + Math.sin(t + i) * 10, -600, i * 95, 0); c.lineWidth = 16; c.strokeStyle = `rgba(150,130,175,${.18 + .06 * Math.sin(i)})`; c.stroke(); }
    c.beginPath(); c.ellipse(-90, -1240 + s * 60, 70, 110, -.3, 0, 7); c.fillStyle = 'rgba(190,170,215,.22)'; c.fill();
    // velvet armrest tassels (armchair look)
    if (s > .02) { c.globalAlpha = s; for (const x of [-250, 250]) for (let j = 0; j < 5; j++) nLine(c, [x - 40 + j * 20, -660, x - 40 + j * 20, -600], 7, MOM.gold); c.globalAlpha = 1; }
    c.restore();
    // ghost: cute little wiggle marks
    if (g > .05) { c.save(); c.globalAlpha = g; for (const sd of [-1, 1]) for (let j = 0; j < 2; j++) { c.beginPath(); const x0 = sd * (290 + j * 40), y0 = -1100 + j * 120; c.moveTo(x0, y0); c.quadraticCurveTo(x0 + sd * 20, y0 + 25, x0, y0 + 50); c.quadraticCurveTo(x0 - sd * 20, y0 + 75, x0, y0 + 100); c.lineWidth = 10; c.strokeStyle = 'rgba(255,240,220,.75)'; c.stroke(); } c.restore(); }
    // the baby on the hidden lap + cloth-covered arms around it
    if (o.baby) { c.save(); o.baby(c); c.restore(); }
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 215, -820); c.quadraticCurveTo(sd * 190, -560, sd * 60, -560); c.lineTo(sd * 40, -620); c.quadraticCurveTo(sd * 150, -640, sd * 150, -800); c.closePath();
      c.fillStyle = '#231b2b'; c.fill(); c.lineWidth = INKW * .8; c.strokeStyle = NOAH.out; c.stroke();
      nLine(c, [sd * 180, -780, sd * 110, -610], 8, 'rgba(160,140,185,.35)');
    }
    if (o.hand) hiddenHand(c, 64, -585, 1.05, -1.35);
    c.restore();
  });
}
