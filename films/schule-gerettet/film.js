// ======================= FILM: shared shot helpers (sections in s01.js … s12.js) =======================
// word times (words.json): "Stell dir vor" 0.0 · "Dienstag" 2.09 · "Dritte Stunde" 2.99 · "Mathe" 3.98 · "Draußen" 4.82 ·
// "und drinnen tickt die Uhr" 6.06 · "dass du schwören" 8.24 · "rückwärts" 9.87 · "Und dann" 10.78 · "um 10:17 Uhr" 11.54 ·
// "geht ein Alarm los" 12.87 · "Kein Feueralarm" 14.23 · "Ein anderer" 15.47 · "Einer, den du…" 16.51 · "kennst" 18.69 · "In den nächsten" 19.48
const DURATION = 694.75;
const SHOTS = [];
function shot(t0, t1, draw) { SHOTS.push({ t0, t1, draw }); }
const shake = (t, a) => [noise1(t * 9, 1) * a, noise1(t * 9, 2) * a];
function camShake(o, t, a) { const s = shake(t, a); return Object.assign({}, o, { ox: (o.ox || 0) + s[0], oy: (o.oy || 0) + s[1] }); }
function flashWhite(c, k, col = '255,255,255') { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(${col},${k})`; c.fillRect(0, 0, W, H); c.restore(); }
function fadeBlack(c, k) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, W, H); c.restore(); }

// on-screen labels: a strip of masking tape slapped onto the frame, text written on it with a marker (left-to-right reveal)
function hudTag(c, t, t0, x, y, text, o = {}) {
  const a = clamp((t - t0) / .22); if (a <= 0) return;
  const size = o.size || 46, seed = text.length * 7 + Math.round(x);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = FONT(size);
  const tw = c.measureText(text).width, w = tw + size * 1.4, h = size * 1.5;
  const slap = a < 1 ? 1 + (1 - easeOut(a)) * .25 : 1, rot = (o.tilt ?? (rnd(seed) - .5) * .08) + (1 - easeOut(a)) * .08;
  c.globalAlpha = Math.min(1, a * 3) * (o.alpha ?? 1); c.translate(x, y); c.rotate(rot); c.scale(slap, slap);
  // tape body with torn ends
  const tape = () => { c.beginPath(); c.moveTo(-w / 2, -h / 2); for (let i = 0; i <= 10; i++) c.lineTo(-w / 2 + i * w / 10, -h / 2 + (i % 2 ? 2 : 0)); for (let i = 0; i <= 6; i++) c.lineTo(w / 2 + (i % 2 ? 7 : -1) - rnd(seed + i) * 4, -h / 2 + i * h / 6); for (let i = 10; i >= 0; i--) c.lineTo(-w / 2 + i * w / 10, h / 2 - (i % 2 ? 2 : 0)); for (let i = 6; i >= 0; i--) c.lineTo(-w / 2 - (i % 2 ? 7 : -1) + rnd(seed + i + 9) * 4, -h / 2 + i * h / 6); c.closePath(); };
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 14; c.shadowOffsetX = 4; c.shadowOffsetY = 8; tape(); c.fillStyle = o.tape || 'rgba(236,222,184,.96)'; c.fill(); c.shadowColor = 'transparent';
  c.save(); tape(); c.clip(); for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(255,255,255,${.05 + rnd(seed + i * 3) * .08})`; c.fillRect(-w / 2, -h / 2 + rnd(seed + i) * h, w, 1.5 + rnd(i) * 2); } const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(120,90,40,.15)'); c.fillStyle = g; c.fillRect(-w / 2 - 10, -h / 2, w + 20, h); c.restore();
  // marker text, revealed as if written
  const wr = clamp((t - t0 - .1) / Math.max(.25, text.length * .035));
  c.save(); c.beginPath(); c.rect(-tw / 2 - 4, -h, (tw + 8) * wr, h * 2); c.clip();
  c.translate(0, size * .34); c.transform(1, 0, -.12, 1, 0, 0); c.fillStyle = o.col || '#1c1a20'; c.textAlign = 'center'; c.fillText(text, 0, 0);
  if (o.bar) { c.beginPath(); c.moveTo(-tw / 2, size * .22); c.quadraticCurveTo(0, size * .32, tw / 2, size * .18); c.lineWidth = size * .12; c.strokeStyle = o.bar; c.lineCap = 'round'; c.globalAlpha *= .85; c.stroke(); }
  c.restore(); c.restore();
}
// time readouts: a small red LED clock display
function hudClock(c, t, t0, x, y, str, o = {}) {
  const a = clamp((t - t0) / .25); if (a <= 0) return;
  const size = o.size || 64; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = `700 ${size}px "Courier New", ${FONT(size).split('px ')[1]}`;
  const tw = c.measureText(str).width, w = tw + size * .9, h = size * 1.45;
  c.globalAlpha = a; c.translate(x, y); c.scale(.9 + .1 * easeOut(a), .9 + .1 * easeOut(a));
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.shadowOffsetY = 8; rrect(c, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 22); c.fillStyle = '#2b2d33'; c.fill(); c.shadowColor = 'transparent';
  rrect(c, -w / 2, -h / 2, w, h, 14); const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#120708'); g.addColorStop(1, '#250c0c'); c.fillStyle = g; c.fill();
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,60,40,.12)'; c.fillText(str.replace(/[0-9]/g, '8'), 0, 4);
  const blink = (t * 2) % 1 < .5 ? 1 : .75; c.shadowColor = '#ff2a1a'; c.shadowBlur = 18; c.fillStyle = `rgba(255,70,50,${blink})`; c.fillText(str, 0, 4); c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,255,255,.08)'; rrect(c, -w / 2 + 6, -h / 2 + 6, w - 12, h * .38, 10); c.fill();
  c.restore();
}

// ---------------- reusable shot bodies ----------------
// ECU of the wall clock: face nearly fills the frame, slight perspective, glass glint. time: [h, m, s]
function clockECU(c, lt, tm, o = {}) {
  c.fillStyle = '#ece3d2'; c.fillRect(0, 0, W, H);
  // wall plaster detail + soft window light
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(120,100,80,${.03 + rnd(i) * .04})`; c.fillRect(rnd(i + 1) * W, rnd(i + 2) * H, 3, 3); }
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,220,160,.35)'); g.addColorStop(1, 'rgba(40,40,90,.25)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const z = o.zoom || 1, r = 640 * z, cx = W / 2 + (o.dx || 0), cy = H / 2 + 60 + (o.dy || 0);
  c.save(); c.translate(cx, cy); c.transform(1, -.04, .06, 1, 0, 0); c.rotate(o.rot || 0);
  // casing depth (3D rim)
  c.beginPath(); c.arc(24, 30, r * 1.05, 0, TAU); c.fillStyle = 'rgba(20,15,30,.35)'; c.fill();
  c.beginPath(); c.arc(0, 0, r * 1.04, 0, TAU); const rg = c.createLinearGradient(-r, -r, r, r); rg.addColorStop(0, '#5a5a62'); rg.addColorStop(.5, '#202024'); rg.addColorStop(1, '#0c0c0e'); c.fillStyle = rg; c.fill();
  drawClockFace(c, 0, 0, r, tm[0], tm[1], tm[2]);
  c.restore();
  if (o.red) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(255,60,50,${o.red})`; c.fillRect(0, 0, W, H); c.restore(); }
}
// seated Noah in the classroom, camera in front: used for the vertigo (dolly zoom) shock
function noahVertigo(c, lt, k, o = {}) {
  // k: 0..1 progress. camera dollies in while the field of view widens -> Noah grows, room rushes away
  const head = [4.25, 1.22, 2.6], d = lerp(o.d0 ?? 3.2, o.d1 ?? .62, easeOut(k)), fov = lerp(o.f0 ?? 24, o.f1 ?? 50, easeOut(k));
  const pos = [head[0] - .3 * d / 3, head[1] + .05, head[2] + d];
  const cam = lookAt(pos, [head[0], head[1] - .05, head[2]], camShake({ fov }, lt, o.shake ?? 6));
  const ex = o.expr || { browUp: 1, mouth: 'gasp', open: .8, eyeScale: 1.15, shine: 1 };
  classroomFrame(c, lt, cam, { sunA: o.sunA ?? 1, clock: [10, 17, 0], cast: (S) => {
    actor(S, seatPos('noah'), (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H, ink: 1.8, expr: ex, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true, bias: -.05, lit: o.lit });
    actor(S, seatPos('jonas'), (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, expr: { browUp: 1, mouth: 'o', eyeScale: 1.1 } }), { sit: true, bias: -.05, lit: o.lit });
    actor(S, seatPos('s2'), (cc, kk) => drawPerson(cc, CAST.student2, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, expr: { browUp: 1, mouth: 'o' } }), { sit: true, bias: -.05, lit: o.lit });
    actor(S, seatPos('s5'), (cc, kk) => drawPerson(cc, CAST.student2, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, expr: { browUp: .6, mouth: 'flat' } }), { sit: true, bias: -.05, lit: o.lit });
  } });
}
function redBurst(c, k, pulse) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(60,70,140,${.55 * k})`; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(W * .85, H * .1, 0, W * .85, H * .1, W * 1.1); g.addColorStop(0, `rgba(255,40,30,${.85 * pulse})`); g.addColorStop(1, `rgba(255,0,0,${.12 * pulse})`); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}


// big cinematic title: flickering, glowing letters
function titleCard(c, t, t0, title, sub, tSub) {
  const a = clamp((t - t0) / .5); if (a <= 0) return;
  const fl = (rnd(Math.floor(t * 18)) > .9 ? .55 : 1) * (.92 + .08 * Math.sin(t * 40));
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const sc = 1.12 - .12 * easeOut(a); c.translate(W / 2, H / 2 - 10); c.scale(sc, sc); c.translate(-W / 2, -(H / 2 - 10));
  c.font = FONT(168); c.globalAlpha = a * fl;
  for (const [blur, col] of [[60, 'rgba(255,70,50,.8)'], [24, 'rgba(255,150,120,.9)']]) { c.shadowColor = col; c.shadowBlur = blur; c.fillStyle = '#fff5ef'; c.fillText(title, W / 2, H / 2 + 50); }
  c.shadowBlur = 0; c.lineWidth = 5; c.strokeStyle = 'rgba(120,10,10,.8)'; c.strokeText(title, W / 2, H / 2 + 50); c.fillStyle = '#fff8f2'; c.fillText(title, W / 2, H / 2 + 50);
  const b = clamp((t - tSub) / .5); if (b > 0) { c.globalAlpha = b; c.font = FONT(54); c.fillStyle = '#f4e6dc'; c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 12; c.fillText(sub, W / 2, H / 2 + 150); }
  c.restore();
}
function OVERLAY(c, t) { grain(c, t, .03); }
