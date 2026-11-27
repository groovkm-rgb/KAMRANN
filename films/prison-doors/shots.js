// SHOTS: timeline, cameras, light per shot, lit characters, brass info cards, transitions, renderAt(t).
const DUR = 44.93;
const mkOff = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv.getContext('2d'); };
const OA = mkOff(), OB = mkOff(), OC = mkOff(), ON = mkOff(), OF = mkOff(), OX = mkOff();

// ---------- lit character compositing: tint by local light, bar shadows, rim light, depth-of-field blur ----------
function litChar(c, x, y, z, bb, fn, o = {}) {
  const p = P(x, y, z); if (!p) return null;
  const s = p[2];
  let x0 = Math.floor(p[0] + bb[0] * s) - 6, y0 = Math.floor(p[1] + bb[1] * s) - 6, x1 = Math.ceil(p[0] + bb[2] * s) + 6, y1 = Math.ceil(p[1] + bb[3] * s) + 6;
  if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) return p;
  x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W, x1); y1 = Math.min(H, y1);
  const w = x1 - x0, h = y1 - y0; if (w < 3 || h < 3) return p;
  const A = OA, B = OB;
  A.clearRect(0, 0, w + 2, h + 2); A.save(); A.translate(p[0] - x0, p[1] - y0); A.scale(s, s); fn(A, s); A.restore();
  // tint
  let l = o.light || lightAt(x, y + (o.chest ?? 250), z); if (o.add) l = [l[0] + o.add[0], l[1] + o.add[1], l[2] + o.add[2]];
  const g = (o.gain ?? 1.35) * .8, mn = (o.min ?? .26) * .85, m = [0, 1, 2].map(i => clamp(mn + l[i] * g, 0, 1));
  if (m[0] < .995 || m[1] < .995 || m[2] < .995) {
    B.clearRect(0, 0, w + 2, h + 2); B.drawImage(A.canvas, 0, 0, w, h, 0, 0, w, h);
    A.globalCompositeOperation = 'multiply'; A.fillStyle = `rgb(${m[0] * 255 | 0},${m[1] * 255 | 0},${m[2] * 255 | 0})`; A.fillRect(0, 0, w, h);
    A.globalCompositeOperation = 'destination-in'; A.drawImage(B.canvas, 0, 0, w, h, 0, 0, w, h); A.globalCompositeOperation = 'source-over';
  }
  // key light wash (warm/cool gradient) on the lit side
  if (o.key) { A.save(); A.globalCompositeOperation = 'source-atop'; const gx = o.key.dir < 0 ? 0 : w, gr = A.createLinearGradient(gx, 0, w - gx, 0); gr.addColorStop(0, `rgba(${o.key.col},${o.key.a})`); gr.addColorStop(1, `rgba(${o.key.col},0)`); A.fillStyle = gr; A.fillRect(0, 0, w, h); A.restore(); }
  // shadows of the cell bars across the character
  if (o.bars) { const b = o.bars; A.save(); A.globalCompositeOperation = 'source-atop'; A.fillStyle = `rgba(8,10,20,${b.a ?? .45})`; const pitch = b.pitch * s, bw = b.w * s;
    A.translate(0, 0); A.transform(1, 0, b.skew || 0, 1, 0, 0); for (let xx = ((p[0] - x0 + (b.off || 0) * s) % pitch) - pitch * 4; xx < w + pitch * 4; xx += pitch) A.fillRect(xx, -50, bw, h + 100); A.restore(); }
  // rim light: silhouette minus shifted silhouette
  let rim = false;
  if (o.rim) {
    const r = o.rim, C = OC; B.clearRect(0, 0, w + 2, h + 2); B.drawImage(A.canvas, 0, 0, w, h, 0, 0, w, h);
    C.clearRect(0, 0, w + 40, h + 40); C.drawImage(B.canvas, 0, 0, w, h, 0, 0, w, h);
    C.globalCompositeOperation = 'destination-out'; C.drawImage(B.canvas, 0, 0, w, h, r.dx * s * 4, r.dy * s * 4, w, h);
    C.globalCompositeOperation = 'source-in'; C.fillStyle = `rgb(${r.col})`; C.fillRect(0, 0, w, h); C.globalCompositeOperation = 'source-over'; rim = true;
  }
  c.save(); if (o.blur > .3) c.filter = `blur(${o.blur.toFixed(1)}px)`; c.globalAlpha = o.alpha ?? 1;
  c.drawImage(A.canvas, 0, 0, w, h, x0, y0, w, h);
  if (rim) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = (o.alpha ?? 1) * (o.rim.a ?? .8); c.drawImage(OC.canvas, 0, 0, w, h, x0, y0, w, h); }
  c.restore();
  return p;
}

// ---------- story door logic: round r (2.4 = round 3 is 40 % done; the guard walks door 1 -> 100 each round) ----------
function doorAfter(n, r) {
  const R = Math.floor(r), fr = r - R; let st = 0;
  for (let d = 1; d <= Math.min(R, n); d++) if (n % d === 0) st ^= 1;
  const d = R + 1; if (d <= 100 && n % d === 0) { const k = ease((fr - (n - 1) / 100) / .015); return st ? 1 - k : k; }
  return st;
}
const isSq = n => Math.round(Math.sqrt(n)) ** 2 === n;
function roundAt(t) {
  if (t < 6.35) return 0;
  if (t < 8.05) return (63.4 + (t - 6.35) * 2600 / 440 - 1) / 100;
  if (t < 8.45) return 1;
  if (t < 10.4) return 1 + (63.4 + (t - 8.45) * 1500 / 440 - 1) / 100;
  if (t < 12.28) return 2;
  if (t < 13.4) return 2 + seg(t, 12.28, 13.4) * .995;
  return Math.min(100, 3 + 97 * Math.pow(seg(t, 13.4, 15.0), 2.2));
}
function roundLabel(t) { if (t < 8.45) return 1; if (t < 12.25) return 2; if (t < 13.4) return 3; return Math.min(100, Math.floor(roundAt(t)) + 1); }

// ---------- per-frame reset ----------
const NST = { pose: 'bars', expr: { mouth: 'soft', browUp: .4 }, x: 120, z: 0, y: 0, jump: 0, out: 0, runZ: 0, run: null, tilt: 0, blur: 0, s: 1, side: false, look: 0 };
function resetState(t) {
  const r = roundAt(t);
  for (let n = 1; n <= 100; n++) { DOOR[n] = doorAfter(n, r); DOORGLOW[n] = 0; DOORSHADE[n] = 0; CH.cheer[n] = 0; CH.out[n] = 0; CH.peek[n] = 0; }
  CH.sad = 0; PLATEGLOW = 0; MARKS = { n: 0, hi: -1, a: 0 }; CHALK = { n: 0, cur: null, k: 0 }; NOAH_CANDLE = 1;
  Object.assign(LT, { amb: [.1, .13, .19], fog: [16, 24, 36], fogNear: 1800, fogFar: 9500, fogMax: .55, dawn: 0, t });
  Object.assign(NST, { pose: 'bars', expr: { mouth: 'soft', browUp: .4 }, x: 120, z: 0, y: 0, jump: 0, out: 0, run: null, tilt: 0, blur: 0, side: false });
  CAM.F = 1000;
}

// ---------- the world pass ----------
function drawNoahLit(c, q, t, o = {}) {
  const x = q.x + q.side * NST.x, y = q.yf + NST.y, z = q.zc + NST.z;
  const pose = NST.pose, e = NST.expr;
  const draw = (A) => {
    if (pose === 'sit') { // stool behind
      A.fillStyle = '#5a3c22'; A.fillRect(-60, -64, 120, 14); A.fillRect(-54, -50, 12, 50); A.fillRect(42, -50, 12, 50);
      drawNoahP(A, { k: .25, ink: 1.8, sit: true, seatH: 250, expr: e, tilt: NST.tilt, armsFront: true, arms: NST.arms || { l: { a: .5, b: 2.0 + Math.sin(t * 6) * .15 }, r: { a: -.2, b: 3.6, fist: true } } });
    } else if (pose === 'side') drawNoahPSide(A, { k: .25, ink: 1.8, s: NST.s || 1, walk: NST.run, stride: 1.4, armSwing: .7, expr: e, lean: .12 });
    else drawNoahP(A, { k: .25, ink: 1.8, expr: e, tilt: NST.tilt, y: -NST.jump, arms: NST.arms || { l: { a: .35, b: 2.4, fist: true }, r: { a: .35, b: 2.4, fist: true } } });
  };
  const bars = NST.inside !== false && !NST.out && DOOR[64] < .5 ? { pitch: 38, w: 13, a: .38 * (1 - DOOR[64]), skew: -.12, off: 0 } : null;
  litChar(c, x, y, z, [-140, -470, 140, 20], draw, Object.assign({ chest: 300, gain: 1.25, min: .42, add: [NOAH_CANDLE * .25 + DOORGLOW[64] * .9, NOAH_CANDLE * .16 + DOORGLOW[64] * .65, NOAH_CANDLE * .05 + DOORGLOW[64] * .25], bars, rim: RIM, blur: NST.blur, key: KEY }, o));
}
let RIM = { dx: -1.2, dy: -.6, col: '170,205,255', a: .9 }, KEY = null;
function inhabitant(c, q, t, detail) {
  if (q.n === 64) { if (!NST.out) drawNoahLit(c, q, t); return; }
  if (CH.out[q.n] > .02) return; // drawn as a walkway actor
  const ty = typeOf(q.n);
  const peek = CH.peek[q.n];
  const d = ty === 'sleep' ? 380 : ty === 'pushup' ? 360 : lerp(330, 150, peek);
  const x = q.x + q.side * d, y = q.yf + (ty === 'sleep' ? 120 : 0), z = q.zc + (ty === 'giant' ? -60 : 0);
  const l = lightAt(x, y + 250, z), own = CELL_LIGHT(q, t), gl = DOORGLOW[q.n], dk = 1 - DOORSHADE[q.n] * .85;
  const L = [(l[0] + own[0] + gl * 1.2) * dk, (l[1] + own[1] + gl * .9) * dk, (l[2] + own[2] + gl * .4) * dk];
  litChar(c, x, y, z, [-230, -500, 280, 20], (A) => drawPrisoner(A, q.n, t, detail), { light: L, gain: 1.3, min: .2 * dk, rim: detail > 1 ? RIM : null });
}
function prisonerOut(q, t) { // prisoner standing on the walkway in front of his open door
  const k = CH.out[q.n], x = q.x - q.side * lerp(-150, 140, k);
  return { x, y: q.yf, z: q.zc, f: q.f, draw: (c) => { const l = lightAt(x, q.yf + 250, q.zc); litChar(c, x, q.yf, q.zc, [-230, -520, 280, 20], (A) => drawPrisoner(A, q.n, t, 2), { light: [l[0] + .6, l[1] + .45, l[2] + .2], gain: 1.3, min: .3, rim: { dx: -1, dy: -.5, col: '255,210,140', a: .9 } }); } };
}
function drawWorld(c, t, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, `rgb(${LT.fog.join(',')})`); bg.addColorStop(1, '#0a0d14'); c.fillStyle = bg; c.fillRect(0, 0, W, H); c.restore();
  drawCeiling(c, t); drawUpperWalls(c, t); drawEndWall(c, t, o.end || {}); drawFloor(c, t); drawPlainWalls(c, t);
  // cells far -> near
  const list = [];
  for (const q of CELLS) {
    const qc = toCam(q.x, q.yf + 300, q.zc);
    if (qc[2] < -700) continue;
    const r = PP([[q.x, q.yf, q.z0], [q.x, q.yf, q.z0 + G.CW], [q.x, q.yf + G.FH, q.z0 + G.CW], [q.x, q.yf + G.FH, q.z0], [q.x + q.side * G.CD, q.yf + 300, q.zc]]);
    if (!r) continue;
    let mnx = 1e9, mxx = -1e9; for (const p of r) { mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); }
    const px = mxx - mnx; list.push({ q, d: Math.hypot(qc[0], qc[1], qc[2]), det: px < 30 ? 0 : px < 240 ? 1 : 2 });
  }
  list.sort((a, b) => b.d - a.d);
  const foc = o.focus;
  for (const it of list) {
    const q = it.q;
    if (foc && q.n === foc.n) {
      ON.clearRect(0, 0, W, H); drawCell(ON, q, t, 2); inhabitant(ON, q, t, 2);
      c.save(); if (foc.inBlur > .3) c.filter = `blur(${foc.inBlur.toFixed(1)}px)`; c.drawImage(ON.canvas, 0, 0); c.restore();
      OF.clearRect(0, 0, W, H); drawFacade(OF, q, t, 2);
      c.save(); if (foc.faceBlur > .3) c.filter = `blur(${foc.faceBlur.toFixed(1)}px)`; c.drawImage(OF.canvas, 0, 0); c.restore();
      continue;
    }
    drawCell(c, q, t, it.det); if (it.det > 0 || it.d < 9000) inhabitant(c, q, t, it.det); drawFacade(c, q, t, it.det);
  }
  // walkways: slabs, actors on them, railings (sorted far -> near)
  const segs = [];
  for (const s of [-1, 1]) for (let f = 1; f < 4; f++) for (let z = G.ZS; z < G.L; z += 440) { const q = toCam(s * (G.HW - G.WW / 2), f * G.FH, z + 220); if (q[2] < -500) continue; segs.push({ s, f, z, d: Math.hypot(...q) }); }
  segs.sort((a, b) => b.d - a.d);
  for (const g of segs) drawWalkway(c, g.s, g.f, g.z, Math.min(G.L, g.z + 440), t);
  const actors = (o.actors || []).slice();
  for (const q of CELLS) if (CH.out[q.n] > .02) actors.push(prisonerOut(q, t));
  const wact = actors.filter(a => a.f > 0 || a.walk), gact = actors.filter(a => !(a.f > 0 || a.walk));
  const byD = (a, b) => Math.hypot(...toCam(b.x, b.y, b.z)) - Math.hypot(...toCam(a.x, a.y, a.z));
  wact.sort(byD); for (const a of wact) a.draw(c);
  for (const g of segs) drawRailing(c, g.s, g.f, g.z, Math.min(G.L, g.z + 440), t);
  gact.sort(byD); for (const a of gact) a.draw(c);
  drawNet(c, 1, t);
  drawHangingLamps(c, t);
  if (o.beams !== 0) drawBeams(c, t, { a: o.beams ?? .12, sides: [1, -1] });
  if (o.motes) motes3(c, t, ...o.motes);
}

// ---------- brass info cards (screen space) ----------
function brass(c, x, y, w, h, a, glowA = 0) {
  c.save(); c.globalAlpha = a;
  c.save(); c.shadowColor = `rgba(255,190,100,${.35 + glowA * .6})`; c.shadowBlur = 30 + glowA * 60;
  const g = c.createLinearGradient(x, y - 14, x + w * .3, y + h + 14); g.addColorStop(0, '#f6dc96'); g.addColorStop(.35, '#b88a3c'); g.addColorStop(.6, '#e7c378'); g.addColorStop(1, '#7a5520');
  rrect(c, x - 14, y - 14, w + 28, h + 28, 24); c.fillStyle = g; c.fill(); c.restore();
  rrect(c, x - 14, y - 14, w + 28, h + 28, 24); c.lineWidth = 3; c.strokeStyle = '#3a2a10'; c.stroke();
  const gl = c.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, 'rgba(26,32,44,.93)'); gl.addColorStop(1, 'rgba(10,13,20,.95)');
  rrect(c, x, y, w, h, 14); c.fillStyle = gl; c.fill(); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,220,150,.45)'; c.stroke();
  for (const [rx, ry] of [[x - 4, y - 4], [x + w + 4, y - 4], [x - 4, y + h + 4], [x + w + 4, y + h + 4]]) { c.beginPath(); c.arc(rx, ry, 6, 0, 7); c.fillStyle = '#5a4018'; c.fill(); c.beginPath(); c.arc(rx - 1.5, ry - 1.5, 2.5, 0, 7); c.fillStyle = '#ffeab0'; c.fill(); }
  c.restore();
}
function gtext(c, s, x, y, size, col = '#ffe9b8', glowA = .6, align = 'center') {
  c.save(); c.font = `700 ${size}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle';
  c.shadowColor = `rgba(255,190,90,${glowA})`; c.shadowBlur = size * .45; c.fillStyle = col; c.fillText(s, x, y); c.restore();
  c.save(); c.font = `700 ${size}px ${FONT}`; return c.measureText(s).width;
}
const cardEnv = (t, t0, t1, fi = .35, fo = .3) => Math.min(ease((t - t0) / fi), t1 == null ? 1 : ease((t1 - t) / fo));
function roundCard(c, t, a) {
  if (a <= 0) return; const n = roundLabel(t), cx = 470, y = 1380 + Math.sin(t * 1.3) * 4, w = 400, h = 140;
  c.save(); c.globalAlpha = a; c.translate(cx, y + h / 2); c.scale(.92 + .08 * a, .92 + .08 * a); c.translate(-cx, -(y + h / 2));
  brass(c, cx - w / 2, y, w, h, 1, 0);
  // number rolls in from below on change
  const tPrev = [6.3, 8.45, 12.25].filter(v => v <= t).pop() || 0, kk = t < 13.4 ? ease((t - tPrev) / .18) : 1;
  c.save(); rrect(c, cx - w / 2, y, w, h, 14); c.clip();
  c.font = `700 62px ${FONT}`; const w1 = c.measureText('Runde ').width; c.font = `700 76px ${FONT}`; const w2 = c.measureText(String(n)).width, x0 = cx - (w1 + w2) / 2;
  gtext(c, 'Runde', x0, y + h / 2 + 4, 62, '#f4dca0', .5, 'left');
  c.globalAlpha = kk; gtext(c, String(n), x0 + w1, y + h / 2 + 4 + (1 - kk) * 40, 76, '#fff4d0', .8, 'left');
  c.restore(); c.restore();
}
function hourglass(c, x, y, s, k) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#c99a4a'; c.fillRect(-60, -110, 120, 16); c.fillRect(-60, 94, 120, 16);
  c.beginPath(); c.moveTo(-46, -94); c.lineTo(46, -94); c.quadraticCurveTo(44, -30, 6, 0); c.quadraticCurveTo(44, 30, 46, 94); c.lineTo(-46, 94); c.quadraticCurveTo(-44, 30, -6, 0); c.quadraticCurveTo(-44, -30, -46, -94); c.closePath();
  c.fillStyle = 'rgba(200,225,255,.16)'; c.fill(); c.lineWidth = 5; c.strokeStyle = 'rgba(255,230,180,.8)'; c.stroke();
  c.save(); c.clip(); c.fillStyle = '#f2c46a'; const top = lerp(-60, -2, k), bot = lerp(90, 30, k);
  c.fillRect(-50, top, 100, -2 - top); c.beginPath(); c.moveTo(-50, 94); c.lineTo(-50, bot + 20); c.quadraticCurveTo(0, bot - 30, 50, bot + 20); c.lineTo(50, 94); c.fill(); c.fillRect(-3, 0, 6, 94); c.restore();
  c.restore();
}

// ---------- camera path helper ----------
function camKeys(keys, u) {
  // keys: [[u, x, y, z, yaw, pitch, F?]...] u in 0..1 ; Catmull-Rom between keys
  u = clamp(u, 0, 1); let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
  const s = (u - k1[0]) / (k2[0] - k1[0] || 1), s2 = s * s, s3 = s2 * s;
  const cr = (a, b, c2, d) => .5 * ((2 * b) + (-a + c2) * s + (2 * a - 5 * b + 4 * c2 - d) * s2 + (-a + 3 * b - 3 * c2 + d) * s3);
  CAM.x = cr(k0[1], k1[1], k2[1], k3[1]); CAM.y = cr(k0[2], k1[2], k2[2], k3[2]); CAM.z = cr(k0[3], k1[3], k2[3], k3[3]);
  CAM.yaw = cr(k0[4], k1[4], k2[4], k3[4]); CAM.pitch = cr(k0[5], k1[5], k2[5], k3[5]);
  if (k1[6]) CAM.F = lerp(k1[6], k2[6] || k1[6], ease(s));
}
const HP = Math.PI / 2;
const C64 = CELLS[63];
const guardActor = (x, y, z, o) => ({ x, y, z, f: Math.round(y / G.FH), walk: y > 10, draw: (c) => {
  const l = lightAt(x, y + 300, z);
  litChar(c, x, y, z, [-170, -500, 170, 20], (A) => { if (o.view === 'side') drawGuardSide(A, Object.assign({ k: .25 }, o)); else drawGuardFront(A, Object.assign({ k: .25 }, o)); },
    { light: [l[0] + .35, l[1] + .25, l[2] + .1], gain: 1.3, min: .3, rim: o.rim || { dx: 1.2, dy: -.6, col: '255,200,130', a: .85 }, alpha: o.alpha ?? 1, blur: o.blur || 0 });
  const lp = o.view === 'side' ? [x, y + 150, z - (o.s || 1) * 75] : [x, y + 150, z];
  glow3(c, lp[0], lp[1], lp[2], 520, '255,180,90', .5 * (o.alpha ?? 1)); glow3(c, lp[0], lp[1], lp[2], 80, '255,240,190', .7 * (o.alpha ?? 1));
} });
const lanternLamp = (x, y, z, i = 1.4) => ({ x, y: y + 150, z, i, r: 700, c: [1, .68, .32] });

// ============================== SHOTS ==============================
const SHOTS = [];
const shot = (t0, t1, tr, fn) => SHOTS.push({ t0, t1, tr, fn });

// S1+S2 HOOK: crane down from the roof, diagonal slide into the corridor, dolly-in to cell 64 (Noah behind the bars)
shot(0, 2.25, 'cut', (c, t) => {
  const u = ease5(seg(t, 0, 2.25) * .9 + .1 * seg(t, 0, 2.25) ** 2);
  camKeys([[0, -150, 3150, -700, .12, -.62], [.38, 100, 2350, 2300, .2, -.45], [.68, 420, 1300, 4300, .75, -.12], [.88, 760, 1110, 5200, 1.35, -.03], [1, 845, 1090, 5360, HP, -.02]], u);
  buildLamps(t); RIM = { dx: -1.2, dy: -.7, col: '170,205,255', a: .9 }; KEY = { col: '255,190,110', a: .18, dir: -1 };
  NST.expr = { mouth: 'soft', browUp: .5, look: 0 };
  drawWorld(c, t, { motes: [t, 0, 1800, 3600, 1800, 2800, 3000, 120] });
  return { temp: -.55, vig: .5 };
});
// S3 lateral track along the closed doors (ground floor right, left -> right)
shot(2.25, 3.65, 'dis', (c, t) => {
  const u = seg(t, 2.0, 3.9);
  camKeys([[0, 380, 590, 3350, HP, -.01], [1, 380, 590, 2500, HP, -.01]], ease(u) * .9 + u * .1);
  buildLamps(t); RIM = { dx: -1, dy: -.6, col: '170,205,255', a: .8 };
  drawWorld(c, t, {});
  // foreground: blurred hanging chain + lamp passing (parallax)
  return { temp: -.55, vig: .5 };
});
// S4 the guard appears out of the dark at the end of the corridor (low angle, walking towards us)
shot(3.65, 6.05, 'dis', (c, t) => {
  const u = seg(t, 3.65, 6.05);
  camKeys([[0, 900, 830, 3500, 0, .14], [1, 900, 860, 3950, 0, .1]], ease(u));
  const gz = lerp(6250, 5050, u), ph = t * 5.2;
  buildLamps(t, { wall: .7, extra: [lanternLamp(900, 760, gz)] }); RIM = { dx: -1, dy: -.6, col: '170,205,255', a: .8 };
  LT.fogFar = 6000;
  drawWorld(c, t, { actors: [guardActor(900, 760, gz, { view: 'front', walk: ph, t, sag: .3 })], motes: [t, 900, 1000, gz - 300, 500, 500, 600, 50] });
  return { temp: -.5, vig: .6 };
});
// S5 Runde 1: lateral tracking with the guard; doors open like dominoes
shot(6.05, 8.05, 'dis', (c, t) => {
  const u = seg(t, 6.05, 8.05), gz = lerp(5650, 4250, u);
  camKeys([[0, 260, 1060, 5550, HP, -.02], [1, 260, 1060, 4200, HP, -.02]], u);
  buildLamps(t, { extra: [lanternLamp(880, 760, gz)] }); RIM = { dx: -1, dy: -.6, col: '170,205,255', a: .8 };
  for (const q of CELLS) if (q.f === 1 && q.side === 1) CH.peek[q.n] = clamp((DOOR[q.n] - .3) * 2, 0, 1);
  drawWorld(c, t, { actors: [guardActor(880, 760, gz, { view: 'side', walk: t * 6.5, t, s: 1, sag: .35 })] });
  roundCard(c, t, cardEnv(t, 6.28, null));
  return { temp: -.45, vig: .5 };
});
// S6 Runde 2: over the guard's shoulder, every second door
shot(8.05, 9.98, 'dis', (c, t) => {
  const u = seg(t, 8.05, 9.98), gz = lerp(5300, 4100, u);
  Object.assign(CAM, { x: 640, y: 1310, z: gz + 560, yaw: Math.PI + .28, pitch: -.2 });
  buildLamps(t, { extra: [lanternLamp(880, 760, gz)] }); RIM = { dx: 1, dy: -.6, col: '255,200,130', a: .8 };
  for (const q of CELLS) if (q.f === 1 && q.side === 1) CH.peek[q.n] = clamp((DOOR[q.n] - .3) * 2, 0, 1);
  drawWorld(c, t, { actors: [guardActor(880, 760, gz, { view: 'front', back: true, walk: t * 6, t, sag: .4 })] });
  roundCard(c, t, 1);
  return { temp: -.45, vig: .5 };
});
// S7 "Offen wird zu, zu wird offen": close-up of a sliding door + lock, match cut to another door opening
shot(9.98, 11.85, 'dis', (c, t) => {
  const first = t < 10.88, q = first ? CELLS[65] : CELLS[53], s = q.side;
  const u = first ? seg(t, 9.98, 10.88) : seg(t, 10.88, 11.85);
  const za = q.z0 + G.PIL / 2;
  camKeys([[0, q.x - s * 430, q.yf + 330, q.zc - 40, s * HP, -.12], [1, q.x - s * 380, q.yf + 320, q.zc - 60, s * HP, -.12]], ease(u));
  buildLamps(t, { extra: [{ x: q.x - s * 200, y: q.yf + 500, z: za - 300, i: 1.4, r: 600, c: [1, .7, .38] }] }); RIM = { dx: -1, dy: -.6, col: '255,200,130', a: .8 };
  if (first) DOOR[66] = 1 - ease(seg(t, 10.42, 10.62)); else DOOR[54] = ease(seg(t, 11.24, 11.44));
  drawWorld(c, t, {});
  roundCard(c, t, 1);
  return { temp: -.35, vig: .55 };
});
// S8 Runde 3 ... 100: time lapse, doors flip like piano keys, the guard zips back and forth, the clock spins
shot(11.85, 15.62, 'dis', (c, t) => {
  const u = seg(t, 11.85, 15.62), r = roundAt(t);
  camKeys([[0, 150, 1350, 2900, .3, .04], [1, 160, 1400, 3300, .3, .04]], ease(u));
  const fr = r % 1, tl = clamp((t - 13.4) / 1.6, 0, 1);
  const zig = (x) => 1 - Math.abs(((x % 2) + 2) % 2 - 1);
  const gzs = [0, 1, 2, 3].map(i => lerp(800, 5900, zig(r * (1 + tl * 2) + .5 - i * .05 * (1 + tl * 3))));
  buildLamps(t, { extra: [lanternLamp(880, 760, gzs[0])] }); RIM = { dx: -1, dy: -.6, col: '170,205,255', a: .8 };
  const acts = gzs.map((gz, i) => guardActor(880, 760, gz, { view: 'side', walk: t * (8 + tl * 20), t, s: (Math.floor(r * (1 + tl * 2) + .5) % 2) ? -1 : 1, sag: .3 + u * .7, alpha: i === 0 ? 1 : (.35 - i * .1) * (tl > 0 ? 1 : .0) }));
  drawWorld(c, t, { actors: acts, end: { clockM: t * (1 + tl * 30) * 2, clockH: 1.2 + t * (.1 + tl * 3) } });
  roundCard(c, t, cardEnv(t, 0, 15.62, .3, .25));
  return { temp: -.35, vig: .5 };
});
// S9 crane up over the whole block: some doors open, but all in shadow; warm light leaks through the "Ausgang"
shot(15.62, 17.75, 'dis', (c, t) => {
  const u = seg(t, 15.62, 17.75);
  camKeys([[0, 0, 900, -900, 0, .22, 920], [1, 0, 2900, -1500, 0, -.36, 920]], ease5(u));
  buildLamps(t, { wall: .45, hang: .9 });
  for (let n = 1; n <= 100; n++) { DOORSHADE[n] = .8; if (isSq(n)) DOOR[n] = .32; else DOOR[n] = 0; }
  LT.amb = [.14, .18, .26];
  drawWorld(c, t, { end: { gateOpen: .04 }, beams: .14 });
  return { temp: -.6, vig: .62 };
});
// S10 dolly-in to plate 64, it glows on "vierundsechzig", rack focus to Noah gripping the bars
shot(17.75, 21.05, 'dis', (c, t) => {
  const u = seg(t, 17.75, 20.4);
  camKeys([[0, 420, 1470, 5360, HP, -.32], [1, 845, 1430, 5360, HP, -.47]], ease5(u));
  for (let n = 1; n <= 100; n++) DOOR[n] = 0;
  buildLamps(t); RIM = { dx: -1.2, dy: -.8, col: '170,205,255', a: 1 };
  PLATEGLOW = ease(seg(t, 18.98, 19.35)) * (1 - .4 * seg(t, 20.2, 21));
  const f = ease(seg(t, 19.75, 20.45));
  NST.expr = { mouth: f > .5 ? 'soft' : 'flat', browUp: .3 + f * .5, look: 0 }; NST.tilt = -.04;
  drawWorld(c, t, { focus: { n: 64, inBlur: lerp(7, 0, f), faceBlur: lerp(0, 5, f) } });
  return { temp: -.5, vig: .62, dark: .45 * ease(seg(t, 20.75, 21.05)) };
});
// S11 think: almost dark, one spot on Noah (stool, chin, counting fingers), slow half orbit, hourglass + countdown
shot(21.05, 23.0, 'cut', (c, t) => {
  const u = seg(t, 21.05, 23.0), a = lerp(-.5, .5, ease(u)), R = 600, cx = 1300, cz = 5360, yaw = HP + a;
  CAM.x = cx - Math.sin(yaw) * R; CAM.z = cz - Math.cos(yaw) * R; CAM.y = 1000; CAM.yaw = yaw; CAM.pitch = -.06;
  for (let n = 1; n <= 100; n++) DOOR[n] = 0;
  LT.amb = [.03, .035, .05]; LT.fog = [4, 6, 10]; NOAH_CANDLE = .25;
  buildLamps(t, { wall: .05, hang: .05, extra: [{ x: 1300, y: 1480, z: 5360, i: 2.2, r: 380, c: [1, .9, .7] }] });
  NST.pose = 'sit'; NST.x = 250; NST.expr = { mouth: 'flat', browUp: .25, look: .6 }; NST.tilt = .05;
  RIM = { dx: 1.2, dy: -1, col: '255,230,190', a: 1 }; KEY = null;
  drawWorld(c, t, { beams: .02 });
  // the spot cone
  const top = P(1300, 1480, 5360), bot = P(1300, 760, 5360);
  if (top && bot) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, top[1], 0, bot[1]); g.addColorStop(0, 'rgba(255,235,200,.28)'); g.addColorStop(1, 'rgba(255,235,200,.06)'); c.fillStyle = g; c.beginPath(); c.moveTo(top[0] - 20 * top[2], top[1]); c.lineTo(top[0] + 20 * top[2], top[1]); c.lineTo(bot[0] + 170 * bot[2], bot[1]); c.lineTo(bot[0] - 170 * bot[2], bot[1]); c.closePath(); c.fill();
    c.translate(bot[0], bot[1]); c.scale(1, .3); glow(c, 0, 0, 210 * bot[2], '255,225,180', .5); c.restore(); }
  motes3(c, t, 1300, 1150, 5360, 250, 700, 250, 40, '255,235,200', .8);
  // card: hourglass + "Denk nach!" + 5..1
  const ca = cardEnv(t, 21.15, 22.95, .3, .2);
  if (ca > 0) {
    const cx = 470, y = 1170, w = 560, h = 330; c.save(); c.globalAlpha = ca; brass(c, cx - w / 2, y, w, h, 1, .3);
    gtext(c, 'Denk nach!', cx, y + 62, 58, '#ffe9b8', .7);
    hourglass(c, cx - 130, y + 210, .8, seg(t, 21.2, 22.95));
    const nmb = clamp(5 - Math.floor((t - 21.2) / .35), 1, 5), kk = ease(((t - 21.2) % .35) / .12);
    c.save(); c.globalAlpha = ca * kk; gtext(c, String(nmb), cx + 110, y + 212, 150 - (1 - kk) * 30, '#fff4d0', .9); c.restore();
    c.restore();
  }
  return { temp: .05, vig: .85, dark: .55 * (1 - ease(seg(t, 21.05, 21.4))) + .5 * ease(seg(t, 22.75, 23.0)) };
});
// S12 the light comes back; each visit of the guard leaves a glowing mark on door 64
const MARK_T = [23.35, 23.7, 24.05, 24.4, 24.75, 25.1, 25.45];
shot(23.0, 25.95, 'cut', (c, t) => {
  const u = seg(t, 23.0, 25.95);
  camKeys([[0, 600, 1200, 5440, HP + .08, -.17], [1, 690, 1180, 5410, HP + .06, -.16]], ease(u));
  for (let n = 1; n <= 100; n++) DOOR[n] = 0;
  const lightK = ease(seg(t, 23.0, 23.6));
  LT.amb = [lerp(.05, .2, lightK), lerp(.06, .22, lightK), lerp(.08, .26, lightK)];
  buildLamps(t, { wall: lightK * 1.1, hang: lightK * 1.2 });
  MARKS.n = MARK_T.filter(v => t >= v).length; MARKS.a = 1; MARKS.last = ease((t - (MARK_T[MARKS.n - 1] || 0)) / .15);
  RIM = { dx: -1.2, dy: -.8, col: '255,210,150', a: .9 }; KEY = { col: '255,190,110', a: .2, dir: -1 };
  NST.expr = { mouth: 'soft', browUp: .5, look: -.3 };
  // guard ghosts touching the door at each mark
  const acts = [];
  MARK_T.forEach((m, i) => { const a = Math.max(0, 1 - Math.abs(t - m) / .22); if (a > 0) acts.push(guardActor(860, 760, 5700, { view: 'side', s: 1, t, alpha: a * .8, sag: .3 + i * .1 })); });
  drawWorld(c, t, { actors: acts });
  return { temp: lerp(-.3, -.05, u), vig: .55, dark: .4 * (1 - lightK) };
});
// S13 pairs of divisors: card + Noah writes the same pairs on the wall
const PAIR_T = [26.4, 28.95, 29.85];
function pairsCard(c, t, a, eight) {
  if (a <= 0) return; const cx = 470, y = 1080, w = 600, h = 430;
  c.save(); c.globalAlpha = a; brass(c, cx - w / 2, y, w, h, 1, .15 + eight * .5);
  const rows = [['1', '64'], ['2', '32'], ['4', '16']];
  rows.forEach(([l, r], i) => {
    const k = ease((t - PAIR_T[i]) / .35); if (k <= 0) return; const yy = y + 70 + i * 92, lock = ease((t - PAIR_T[i] - .25) / .15);
    c.save(); c.globalAlpha = a * k;
    const off = (1 - k) * 120;
    for (const [s, v] of [[-1, l], [1, r]]) { const tx = cx + s * (110 + off); c.fillStyle = 'rgba(255,220,150,.10)'; rrect(c, tx - 70, yy - 38, 140, 76, 12); c.fill(); c.lineWidth = 2.5; c.strokeStyle = `rgba(255,214,140,${.4 + lock * .5})`; c.stroke(); gtext(c, v, tx, yy + 3, 56, '#ffeec8', .5); }
    gtext(c, '×', cx, yy + 2, 50, `rgba(255,214,140,${lock})`, .6);
    c.restore();
  });
  // the lonely 8 x 8
  if (eight > 0) {
    const yy = y + 70 + 3 * 92 + 22;
    c.save(); c.globalAlpha = a * ease(eight * 3); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(cx, yy, 10, cx, yy, 260); g.addColorStop(0, `rgba(255,214,130,${.45 * eight})`); g.addColorStop(1, 'rgba(255,214,130,0)'); c.fillStyle = g; c.fillRect(cx - 300, yy - 200, 600, 400); c.restore();
    c.save(); c.globalAlpha = a * ease(eight * 3); const sc = 1 + .08 * Math.sin(Math.min(1, eight) * Math.PI);
    c.translate(cx, yy); c.scale(sc, sc); c.fillStyle = 'rgba(255,220,150,.22)'; rrect(c, -150, -46, 300, 92, 16); c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#ffe2a0'; c.stroke();
    gtext(c, '8 × 8', 0, 4, 70, '#fffbe8', 1); c.restore();
  }
  c.restore();
}
const chalkShot = (t0, t1, tr) => shot(t0, t1, tr, (c, t) => {
  const u = seg(t, 25.95, 33.4);
  camKeys([[0, 860, 1170, 5150, HP + .3, -.12], [.6, 880, 1160, 5180, HP + .26, -.11], [1, 930, 1120, 5230, HP + .2, -.08]], ease(u));
  for (let n = 1; n <= 100; n++) DOOR[n] = 0;
  buildLamps(t, { wall: 1.1, extra: [{ x: 900, y: 1300, z: 5200, i: .8, r: 500, c: [1, .72, .4] }] });
  NST.x = 360; NST.z = -80; RIM = { dx: 1.1, dy: -.8, col: '255,214,160', a: .9 }; KEY = { col: '255,200,120', a: .22, dir: 1 };
  // writing: chalk lines appear right after each card pair
  const W8 = 31.5;
  CHALK.n = PAIR_T.filter(v => t > v + .9).length; const cur = PAIR_T.findIndex(v => t > v + .1 && t <= v + .9);
  if (cur >= 0) { CHALK.cur = cur; CHALK.k = seg(t, PAIR_T[cur] + .1, PAIR_T[cur] + .9); }
  if (t > W8) { CHALK.n = Math.max(CHALK.n, 3); if (t < 32.4) { CHALK.cur = 3; CHALK.k = seg(t, W8, 32.3); } else CHALK.n = 4; }
  const writing = cur >= 0 || (t > W8 && t < 32.3);
  const drop = t > 31.75;
  NST.arms = writing ? { l: { a: 1.75 + Math.sin(t * 14) * .06, b: .25, fist: true }, r: { a: .15, b: -.05 } } : drop ? { l: { a: .4, b: -.05 }, r: { a: .2, b: -.05 } } : { l: { a: 1.1, b: .7, fist: true }, r: { a: .25, b: .1 } };
  const wow = ease(seg(t, 31.4, 31.8));
  NST.expr = wow > 0 ? { mouth: 'o', browUp: wow, look: 0 } : { mouth: 'flat', browUp: .2, look: -.7 };
  if (wow > 0) { NST.expr.lid = 0; }
  drawWorld(c, t, { focus: { n: 64, inBlur: 0, faceBlur: 5 } });
  // falling chalk
  if (drop && t < 32.3) { const k = seg(t, 31.75, 32.15), p = P(C64.x + 180, 760 + lerp(330, 6, k * k), 5300); if (p) { c.save(); c.translate(p[0], p[1]); c.rotate(k * 6); c.fillStyle = '#f4f2ea'; c.fillRect(-7 * p[2] * 2, -3 * p[2] * 2, 14 * p[2] * 2, 6 * p[2] * 2); c.restore(); } }
  const eight = ease(seg(t, 31.3, 31.75));
  pairsCard(c, t, cardEnv(t, 26.2, 33.35, .35, .3), eight);
  return { temp: lerp(-.15, .25, u), vig: .55 + eight * .1 };
});
chalkShot(25.95, 28.7, 'dis'); chalkShot(28.7, 30.9, 'cut'); chalkShot(30.9, 33.4, 'cut');
// S15 counting the seven marks: the door flips with each one and stays open on the seventh
const CNT_T = [33.65, 33.98, 34.31, 34.64, 34.97, 35.3, 35.63];
shot(33.4, 36.47, 'dis', (c, t) => {
  const u = seg(t, 33.4, 36.47);
  camKeys([[0, 700, 1170, 5420, HP + .06, -.14], [1, 760, 1140, 5390, HP + .04, -.11]], ease(u));
  for (let n = 1; n <= 100; n++) DOOR[n] = 0;
  const cnt = CNT_T.filter(v => t >= v).length; MARKS.n = 7; MARKS.a = 1; MARKS.hi = cnt - 1;
  let st = 0; CNT_T.forEach((v, i) => { const k = ease((t - v) / .14); if (k > 0) st = i % 2 === 0 ? lerp(st, 1, k) : lerp(st, 0, k); });
  DOOR[64] = st * .42;
  const warm = ease(seg(t, 35.63, 36.3)); DOORGLOW[64] = warm * .7;
  buildLamps(t, { extra: [{ x: 1300, y: 1100, z: 5360, i: warm * 1.6, r: 700, c: [1, .75, .4] }] });
  RIM = { dx: -1.2, dy: -.8, col: '255,214,150', a: 1 }; KEY = { col: '255,190,100', a: .2 + warm * .2, dir: -1 };
  NST.expr = cnt >= 7 ? { mouth: 'smile', browUp: .6 } : { mouth: 'soft', browUp: .4, look: -.2 };
  LT.amb = [.2 + warm * .08, .22 + warm * .05, .26];
  drawWorld(c, t, {});
  return { temp: lerp(.0, .35, u), vig: .5 };
});
// S16 crane up in the morning: square-number cells light up on "eins, vier, neun, sechzehn"; card with all squares
const SQ_T = { 1: 38.36, 4: 38.66, 9: 38.96, 16: 39.52 };
function squaresCard(c, t, a) {
  if (a <= 0) return; const cx = 470, y = 1230 + Math.sin(t * 1.2) * 4, w = 700, h = 230;
  c.save(); c.globalAlpha = a; brass(c, cx - w / 2, y, w, h, 1, .25);
  const L1 = ['1', '4', '9', '16', '25'], L2 = ['36', '49', '64', '81', '100'];
  const lit = { '1': 38.36, '4': 38.66, '9': 38.96, '16': 39.52 };
  [L1, L2].forEach((line, li) => {
    c.font = `700 58px ${FONT}`; const parts = line.map((s, i) => s + (i < line.length - 1 || li === 0 ? ',' : '')), sw = parts.map(p => c.measureText(p).width), gap = 22, tot = sw.reduce((a, b) => a + b, 0) + gap * (parts.length - 1);
    let x = cx - tot / 2;
    parts.forEach((p, i) => { const v = line[i], hl = lit[v] ? ease((t - lit[v]) / .15) : (v === '64' ? .55 : 0); gtext(c, p, x, y + 72 + li * 88, 58, hl > 0 ? `rgb(255,${lerp(236, 214, hl) | 0},${lerp(200, 120, hl) | 0})` : '#f1e2bf', .4 + hl * .6, 'left'); x += sw[i] + gap; });
  });
  c.restore();
}
shot(36.47, 40.05, 'dis', (c, t) => {
  const u = seg(t, 36.47, 40.05);
  camKeys([[0, -120, 1950, -1500, -.05, -.02, 860], [1, -150, 2780, -1250, -.05, -.17, 860]], ease5(u));
  LT.dawn = ease(seg(t, 36.47, 38.0)) * .9 + .1; LT.amb = [.28, .26, .24]; LT.fog = [60, 52, 48];
  buildLamps(t, { wall: .8, hang: .9 });
  for (let n = 1; n <= 100; n++) { DOOR[n] = isSq(n) ? .32 : 0; DOORSHADE[n] = isSq(n) ? .4 : 0; }
  DOOR[64] = .42; DOORGLOW[64] = .5;
  for (const [n, tt] of Object.entries(SQ_T)) { const k = ease(seg(t, tt, tt + .35)); DOOR[n] = lerp(.32, 1, k); DOORGLOW[n] = k; DOORSHADE[n] = .4 * (1 - k); CH.out[n] = ease(seg(t, tt + .2, tt + .9)); CH.cheer[n] = ease(seg(t, tt + .4, tt + .8)); }
  RIM = { dx: -1, dy: -.7, col: '255,214,150', a: .8 };
  drawWorld(c, t, { beams: .16, end: { gateOpen: .1 } });
  squaresCard(c, t, cardEnv(t, 36.9, null));
  return { temp: lerp(.1, .45, u), vig: .45 };
});
// S17 ten of a hundred: start on bald 37 (closed, shoulders drop) next to 36 (gold), pull back to the whole block
shot(40.05, 42.62, 'dis', (c, t) => {
  const u = seg(t, 40.05, 42.62);
  camKeys([[0, -360, 1870, 1180, -HP, -.08, 1000], [.3, -280, 1880, 900, -HP + .25, -.06, 980], [1, 0, 1650, -2300, 0, .0, 860]], ease5(u));
  LT.dawn = 1; LT.amb = [.3, .27, .24]; LT.fog = [70, 58, 50];
  buildLamps(t, { wall: .8, hang: .9 });
  for (let n = 1; n <= 100; n++) { DOOR[n] = 0; if (isSq(n)) { DOOR[n] = n === 64 ? .42 : 1; DOORGLOW[n] = 1; if (n !== 64) { CH.out[n] = 1; CH.cheer[n] = 1; } } }
  DOORGLOW[64] = .9; CH.sad = ease(seg(t, 40.3, 40.8));
  RIM = { dx: -1, dy: -.7, col: '255,214,150', a: .8 };
  drawWorld(c, t, { beams: .17, end: { gateOpen: .15 } });
  const ca = cardEnv(t, 41.84, null, .3);
  if (ca > 0) { const cx = 470, y = 1300, w = 560, h = 170; c.save(); c.globalAlpha = ca; c.translate(cx, y + h / 2); const sc = .9 + .1 * ca; c.scale(sc, sc); c.translate(-cx, -(y + h / 2)); brass(c, cx - w / 2, y, w, h, 1, .5); gtext(c, '10 von 100', cx, y + h / 2 + 4, 92, '#fff4d0', 1); c.restore(); }
  return { temp: .45, vig: .45 };
});
// S18 "und du bist einer davon": the door opens, Noah jumps, the guard nods, Noah runs out; crane up and back
shot(42.62, DUR, 'dis', (c, t) => {
  const u = seg(t, 43.75, DUR);
  camKeys([[0, 820, 1090, 5320, HP + .05, -.03], [.35, 520, 1350, 4900, HP - .25, -.12], [1, -100, 2450, 3300, .55, -.33, 900]], ease5(u));
  LT.dawn = 1; LT.amb = [.32, .28, .24]; LT.fog = [80, 64, 52];
  for (let n = 1; n <= 100; n++) { DOOR[n] = 0; if (isSq(n)) { DOOR[n] = 1; DOORGLOW[n] = 1; if (n !== 64) { CH.out[n] = 1; CH.cheer[n] = 1; } } }
  const open = ease(seg(t, 43.62, 44.15)); DOOR[64] = lerp(.42, 1, open); DOORGLOW[64] = 1;
  buildLamps(t, { wall: .8, hang: .9, extra: [{ x: 1300, y: 1100, z: 5360, i: 1.6, r: 700, c: [1, .76, .42] }] });
  NST.jump = Math.max(0, Math.sin(seg(t, 43.9, 44.3) * Math.PI)) * 120;
  NST.arms = t > 43.8 ? { l: { a: 2.5, b: .3 }, r: { a: 2.5, b: .3 } } : { l: { a: .35, b: 2.4, fist: true }, r: { a: .35, b: 2.4, fist: true } };
  NST.expr = t > 43.7 ? { mouth: 'yawn', open: .45, browUp: 1 } : { mouth: 'soft', browUp: .6 };
  const step = seg(t, 44.3, 44.6); RIM = { dx: -1.2, dy: -.8, col: '255,220,160', a: 1 }; KEY = { col: '255,200,120', a: .3, dir: -1 };
  const acts = [guardActor(870, 760, 5720, { view: 'front', t, nod: Math.sin(seg(t, 43.95, 44.5) * Math.PI) * .8, sag: .5 })];
  if (step > 0) {
    NST.out = 1;
    const nx = lerp(1180, 880, ease(step)), nz = 5360 + Math.max(0, t - 44.5) * 900;
    acts.push({ x: nx, y: 760, z: nz, f: 1, draw: (cc) => litChar(cc, nx, 760, nz, [-140, -470, 140, 20], (A) => { if (t < 44.5) drawNoahP(A, { k: .25, ink: 1.8, expr: { mouth: 'smile', browUp: .8 }, arms: { l: { a: 2.4, b: .3 }, r: { a: 2.4, b: .3 } } }); else drawNoahPSide(A, { k: .25, ink: 1.8, s: -1, walk: t * 13, stride: 1.4, armSwing: .8, expr: { mouth: 'smile' }, lean: -.12 }); }, { light: [1.1, .9, .7], gain: 1, min: .6, rim: RIM }) });
  }
  drawWorld(c, t, { actors: acts, beams: .18, end: { gateOpen: ease(seg(t, 44.0, 44.9)) } });
  return { temp: .5, vig: .42 };
});

// ---------- grade + compositing ----------
function finalGrade(c, g) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  if (g.temp) { c.globalCompositeOperation = 'soft-light'; c.fillStyle = g.temp < 0 ? `rgba(30,110,150,${-g.temp * .55})` : `rgba(255,165,60,${g.temp * .5})`; c.fillRect(0, 0, W, H); }
  c.globalCompositeOperation = 'multiply'; const v = c.createRadialGradient(W / 2, H * .48, H * .22, W / 2, H * .5, H * .75); v.addColorStop(0, 'rgba(255,255,255,1)'); v.addColorStop(1, `rgba(${g.temp > 0 ? '70,40,20' : '10,16,30'},1)`);
  c.globalAlpha = g.vig ?? .5; c.fillStyle = v; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
  if (g.dark) { c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(0,0,0,${g.dark})`; c.fillRect(0, 0, W, H); }
  c.restore();
}
function renderShot(c, i, t) { resetState(t); c.save(); const g = SHOTS[i].fn(c, t) || {}; c.restore(); finalGrade(c, g); }
const DISS = 8 / FPS;
function renderAt(t) {
  const c = document.getElementById('film').getContext('2d');
  let i = SHOTS.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = SHOTS.length - 1;
  const S = SHOTS[i];
  if (S.tr === 'dis' && i > 0 && t < S.t0 + DISS) {
    renderShot(OX, i - 1, t); renderShot(c, i, t);
    c.save(); c.globalAlpha = 1 - ease((t - S.t0) / DISS); c.drawImage(OX.canvas, 0, 0); c.restore();
  } else renderShot(c, i, t);
}
window.__film = { renderAt, FPS, DURATION: DUR, SHOTS };
