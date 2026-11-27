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

// small German HUD sticker (time readouts, labels)
function hudTag(c, t, t0, x, y, text, o = {}) {
  const a = clamp((t - t0) / .25), s = a < 1 ? easeBack(a) : 1; if (a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(1, a * 2) * (o.alpha ?? 1); c.translate(x, y); c.rotate(o.tilt ?? -.02); c.scale(s, s);
  c.font = FONT(o.size || 46); const w = c.measureText(text).width + 60, h = (o.size || 46) * 1.55;
  c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#fff'; rrect(c, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 18); c.fill(); c.shadowColor = 'transparent';
  c.lineWidth = 4; c.strokeStyle = OUT; c.stroke(); c.fillStyle = o.bg || '#fbf6ea'; rrect(c, -w / 2, -h / 2, w, h, 12); c.fill();
  if (o.bar) { c.fillStyle = o.bar; rrect(c, -w / 2, -h / 2, 16, h, 8); c.fill(); }
  txt(c, text, 0, (o.size || 46) * .36, o.size || 46, o.col || OUT, 'center'); c.restore();
}
// digital-style time readout used with the clock close-ups
function hudClock(c, t, t0, x, y, str, o = {}) { hudTag(c, t, t0, x, y, str, Object.assign({ size: 64, bar: '#d02a22' }, o)); }

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
