// ======================= SHOT LIST: DRAFT 0 – 20.8 s (Bölüm 1, giriş) =======================
// word times (words.json): "Stell dir vor" 0.0 · "Dienstag" 2.09 · "Dritte Stunde" 2.99 · "Mathe" 3.98 · "Draußen" 4.82 ·
// "und drinnen tickt die Uhr" 6.06 · "dass du schwören" 8.24 · "rückwärts" 9.87 · "Und dann" 10.78 · "um 10:17 Uhr" 11.54 ·
// "geht ein Alarm los" 12.87 · "Kein Feueralarm" 14.23 · "Ein anderer" 15.47 · "Einer, den du…" 16.51 · "kennst" 18.69 · "In den nächsten" 19.48
const DURATION = 20.8;
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

// ---------------- the shots ----------------
// 0.00–0.55 black, two ticks
shot(0, .55, (c, lt) => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); });
// 0.55–1.60 COLD OPEN: ECU clock, second hand 57 -> 60, minute jumps 16 -> 17
shot(.55, 1.6, (c, lt, t) => {
  const sec = 57 + Math.min(3, Math.floor(lt / .33)), ss = sec >= 60 ? 0 : sec, mm = sec >= 60 ? 17 : 16;
  const jump = sec >= 60 ? Math.max(0, 1 - (lt - .99) / .08) : 0;
  clockECU(c, lt, [10, mm, ss], { zoom: 1.12 + lt * .08, rot: jump * .01 });
  hudClock(c, t, .7, W - 330, 140, sec >= 60 ? '10:17:00' : `10:16:${String(sec).padStart(2, '0')}`);
  vignette(c, .5);
});
// 1.60–2.95 COLD OPEN: red alarm bursts, dolly zoom on Noah (shocked)
shot(1.6, 2.95, (c, lt, t) => {
  const k = seg(lt, 0, 1.25), pulse = Math.pow(Math.max(0, Math.sin(lt * 1.6 * Math.PI * 2 + 1.2)), 2);
  noahVertigo(c, lt, k, { sunA: .2, shake: 5 + 6 * (1 - k) });
  redBurst(c, 1, .4 + .6 * pulse); flashWhite(c, (1 - seg(lt, 0, .12)) * .9, '255,80,60'); vignette(c, .55);
});
// 2.95–3.98 "Dritte Stunde." wide classroom, golden morning, slow crane down + push in
shot(2.95, 3.98, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 1.03)), cam = lookAt([lerp(8.5, 8.1, k), lerp(2.75, 2.35, k), lerp(.35, .9, k)], [3.6, .95, 6.4], { fov: 62 });
  classroomFrame(c, t, cam, { cast: classCast({ back: true }), clock: [10, 12, 30] });
  gradeScreen(c, { sx: .05, sy: .1, warmA: .32, coolA: .2 }); vignette(c, .35);
  hudTag(c, t, 3.1, 330, 140, 'Dienstag · 3. Stunde', { size: 40, bar: '#e0663a' });
  flashWhite(c, (1 - seg(lt, 0, .15)) * .6);
});
// 3.98–4.82 "Mathe." the board: Frau Becker writes (3/4 angle on the board, chalk dust)
shot(3.98, 4.82, (c, lt, t) => {
  const k = seg(lt, 0, .84), cam = lookAt([lerp(5.6, 5.3, k), 1.55, 5.55], [3.9, 1.5, 8], { fov: 48 });
  classroomFrame(c, t, cam, { clock: [10, 12, 40], cast: S => {
    const wr = Math.sin(lt * 14) * .08;
    actor(S, [3.35, 0, 7.45], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, back: true, arms: { r: { a: 2.55 + wr, b: .25 }, l: { a: .12, b: -.3 } } }), { lit: { rimA: .45 } });
  } });
  gradeScreen(c, { sx: 0, sy: .2, warmA: .3, coolA: .2 }); vignette(c, .35);
  hudTag(c, t, 4.0, W - 220, 150, 'Mathe', { size: 54, bar: '#2f6fb0' });
});
// 4.82–6.06 "Draußen scheint die Sonne" — POV out of the window, sun bloom, plant on the sill
shot(4.82, 6.06, (c, lt, t) => {
  const k = seg(lt, 0, 1.24), cam = lookAt([1.55, 1.45, lerp(4.0, 4.15, k)], [0, 1.85, 4.25], { fov: 50 });
  classroomFrame(c, t, cam, { clock: [10, 12, 45], cast: S => {} });
  glow(c, W * .25, H * .15, 900, '255,240,200', .45); gradeScreen(c, { sx: .2, sy: 0, warmA: .4, coolA: .12 }); vignette(c, .3);
});
// 6.06–8.24 "…und drinnen tickt die Uhr so langsam" — low angle up at the clock above the board, sun shaft with dust
shot(6.06, 8.24, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.18)), cam = lookAt([4.9, .95, lerp(4.6, 5.3, k)], [4.5, 2.6, 8], { fov: 46 });
  const sec = 46 + Math.floor(lt); // one tick per second, slow
  classroomFrame(c, t, cam, { clock: [10, 12, sec], cast: classCast({ back: true, teacher: false }) });
  gradeScreen(c, { sx: .0, sy: .3, warmA: .3, coolA: .2 }); vignette(c, .4);
});
// 8.24–9.87 "…dass du schwören könntest" — Noah bored, 3/4 from the front-left; Lea draws stars, Jonas sleeps
shot(8.24, 9.87, (c, lt, t) => {
  const k = seg(lt, 0, 1.63), cam = lookAt([lerp(3.2, 3.35, k), 1.25, 4.05], [4.55, .95, 2.6], { fov: 44 });
  classroomFrame(c, t, cam, { clock: [10, 12, 52], cast: S => {
    const blink = (lt % 1.3) < .1;
    actor(S, seatPos('noah'), (cc, kk) => drawNoah34(cc, { k: kk, turn: -1, sit: true, seatH: SEAT_H, ink: 1.8, tilt: .16, expr: { lid: blink ? 1 : .5, mouth: 'flat', look: -.3 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true, bias: -.05 });
    actor(S, seatPos('jonas'), (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, tilt: .42, expr: { eyes: 'closed', mouth: 'o' }, arms: { l: { a: .4, b: -1.3 }, r: { a: .4, b: -1.3 } } }), { sit: true, bias: -.05 });
    actor(S, seatPos('lea'), (cc, kk) => drawPerson(cc, CAST.lea, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, back: true, tilt: -.08, arms: { r: { a: .5, b: -1.3 + Math.sin(lt * 18) * .12 } } }), { sit: true, bias: -.05 });
  } });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .32, coolA: .2 }); vignette(c, .35);
  if (lt > .9) { c.save(); c.globalAlpha = seg(lt, .9, 1.1); for (let i = 0; i < 3; i++) txt(c, 'z', 1330 + i * 34, 330 - i * 40 - (lt * 30 % 40), 40 + i * 10, '#5a5a8a'); c.restore(); }
});
// 9.87–10.78 "…sie läuft rückwärts." — clock ECU, the second hand ticks BACKWARDS (gag)
shot(9.87, 10.78, (c, lt, t) => {
  const sec = 55 - Math.floor(lt / .3);
  clockECU(c, lt, [10, 16, sec], { zoom: 1.0 + lt * .05 });
  hudTag(c, t, 10.05, 330, 150, '?!', { size: 70, bar: '#e0663a', tilt: .05 });
  vignette(c, .45);
});
// 10.78–12.87 "Und dann, um 10:17 Uhr," — tight ECU: 57, 58, 59 … minute hand clicks to 17 on "Uhr" (12.38)
shot(10.78, 12.87, (c, lt, t) => {
  const s0 = 56, step = (12.38 - 10.78) / 4, sec = s0 + Math.min(4, Math.floor(lt / step)), ss = sec >= 60 ? 0 : sec, mm = sec >= 60 ? 17 : 16;
  const z = 1.15 + easeIO(seg(lt, 0, 2.09)) * .55;
  clockECU(c, lt, [10, mm, ss], { zoom: z, dx: -z * 120, dy: z * 220 });
  hudClock(c, t, 12.38, W / 2, H - 160, '10:17 Uhr', { size: 90 });
  vignette(c, .55 + .2 * seg(lt, 1.4, 2));
});
// 12.87–14.23 "geht ein Alarm los." — red light explodes, dolly zoom on Noah (big), shaky
shot(12.87, 14.23, (c, lt, t) => {
  const k = seg(lt, 0, 1.2), pulse = Math.pow(Math.max(0, Math.sin((t - 13.0) * 1.6 * Math.PI * 2 + 1.6)), 2);
  noahVertigo(c, lt, k, { sunA: .25, shake: 4 + 8 * (1 - k), d0: 3.6, d1: .58 });
  redBurst(c, 1, .45 + .55 * pulse); flashWhite(c, (1 - seg(lt, 0, .1)) * .85, '255,70,50'); vignette(c, .55);
});
// 14.23–15.47 "Kein Feueralarm." — empty corridor, red strobe, flickering lamps, slow push
shot(14.23, 15.47, (c, lt, t) => {
  const k = seg(lt, 0, 1.24), cam = lookAt([1.75, 1.5, lerp(1.5, 2.6, k)], [1.4, 1.2, 22], camShake({ fov: 56 }, t, 2));
  const S = scene(cam, { dir: V.norm([.2, .8, -.5]), col: [200, 210, 255], amb: .5, ambCol: [90, 110, 170], ink: 1.2, inkA: .55 });
  const fl = i => i === 3 ? (rnd(Math.floor(t * 14)) > .55 ? 1 : 0) : i === 5 ? (rnd(Math.floor(t * 9) + 7) > .4 ? .8 : .1) : .7;
  corridorScene(S, c, t, { alarm: 1, dim: .4, flicker: fl, windowGlow: '180,200,255' }); flush(S, c);
  const bp = proj(cam, [.14, 2.4, 10]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1], phase: .3 } : {}); vignette(c, .55);
});
// 15.47–16.51 "Ein anderer." — worm's-eye up at a flickering ceiling lamp; red beacon spinning at the edge
shot(15.47, 16.51, (c, lt, t) => {
  const cam = lookAt([1.3, 1.2, 8.6], [1.65, 3.0, 11.0], camShake({ fov: 60, roll: -.12 + lt * .05 }, t, 2.5));
  const S = scene(cam, { dir: V.norm([.2, .8, -.5]), col: [200, 210, 255], amb: .45, ambCol: [80, 95, 160], ink: 1.2, inkA: .55 });
  const on = rnd(Math.floor(t * 16) + 3) > .5 ? 1 : .05;
  corridorScene(S, c, t, { alarm: 1, dim: .5, flicker: i => i === 2 || i === 3 ? on : .5, noRefl: true }); flush(S, c);
  const bp = proj(cam, [.14, 2.4, 10]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1], br: 1300 } : {}); vignette(c, .6);
});
// 16.51–18.24 "Einer, den du bis jetzt nur…" — insert: the teacher's hand turns the key in the door lock (implied only)
shot(16.51, 18.24, (c, lt, t) => {
  const sh = shake(t, 2), turn = easeIO(seg(lt, .5, .78)) * 1.5, push = easeOut(seg(lt, 0, 1.7));
  c.save(); c.translate(W / 2 + sh[0], H / 2 + sh[1]); c.scale(1 + push * .08, 1 + push * .08); c.translate(-W / 2, -H / 2);
  // door leaf: wood grain, bevel, light from the side
  const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#8a5d38'); g.addColorStop(.6, '#b78656'); g.addColorStop(1, '#7a5030'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const y = rnd(i) * H; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * .3, y + 30 * Math.sin(i), W * .6, y - 20, W, y + 10); c.lineWidth = 2 + rnd(i + 3) * 3; c.strokeStyle = `rgba(70,40,20,${.12 + rnd(i + 5) * .12})`; c.stroke(); }
  // frame edge + glass pane at top-left with the corridor's red light behind it
  c.fillStyle = '#7d838c'; c.fillRect(0, 0, 150, H); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(140, 0, 10, H);
  c.save(); rrect(c, 300, -60, 330, 420, 10); c.fillStyle = '#1b1f2c'; c.fill(); c.clip(); const rp = Math.pow(Math.max(0, Math.sin((t * 1.6) % 1 * Math.PI)), 2); c.fillStyle = `rgba(255,40,30,${.25 + .6 * rp})`; c.fillRect(300, -60, 330, 420); for (let i = 0; i < 6; i++) line(c, [300, i * 70, 630, i * 70 - 90], 2, 'rgba(255,255,255,.15)'); c.restore();
  rrect(c, 290, -70, 350, 440, 14); c.lineWidth = 16; c.strokeStyle = '#6a6f78'; c.stroke();
  // lock plate with lever handle and key cylinder
  const lx = 1060, ly = 560;
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.shadowOffsetX = 18; c.shadowOffsetY = 14; rrect(c, lx - 90, ly - 320, 180, 620, 40); c.fillStyle = '#b9bec6'; c.fill(); c.restore();
  rrect(c, lx - 90, ly - 320, 180, 620, 40); const pg = c.createLinearGradient(lx - 90, 0, lx + 90, 0); pg.addColorStop(0, '#e6e9ee'); pg.addColorStop(.5, '#b4bac3'); pg.addColorStop(1, '#8b929c'); c.fillStyle = pg; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke();
  // lever handle (rest)
  c.save(); c.translate(lx, ly - 170); circle(c, 0, 0, 62); fs(c, '#cfd3d9', 5); c.beginPath(); rrect(c, -30, -30, 560, 60, 30); const hg = c.createLinearGradient(0, -30, 0, 30); hg.addColorStop(0, '#f4f6f8'); hg.addColorStop(.5, '#b7bdc6'); hg.addColorStop(1, '#7d848e'); c.fillStyle = hg; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); c.restore();
  // key cylinder + key turning
  c.save(); c.translate(lx, ly + 150); circle(c, 0, 0, 52); fs(c, '#d9c58a', 5); circle(c, 0, 0, 34); fs(c, '#a8925a', 3);
  c.rotate(turn); c.fillStyle = '#3a3226'; c.fillRect(-6, -26, 12, 52);
  // key bow (outside the lock) with ring and a dangling key bunch
  c.beginPath(); rrect(c, -16, -150, 32, 130, 8); fs(c, '#e2c66a', 5); c.beginPath(); c.ellipse(0, -205, 72, 62, 0, 0, TAU); fs(c, '#e2c66a', 6); circle(c, 0, -225, 18); fs(c, '#a8925a', 4);
  c.restore();
  const swing = Math.sin(lt * 9) * .25 * (1 - seg(lt, 1, 1.7)) + turn * .2;
  c.save(); c.translate(lx + Math.sin(turn) * 225, ly + 150 - Math.cos(turn) * 225); c.rotate(swing);
  c.beginPath(); c.arc(0, 60, 60, 0, TAU); c.lineWidth = 10; c.strokeStyle = '#8a8f98'; c.stroke();
  for (let i = 0; i < 3; i++) { c.save(); c.translate(0, 110); c.rotate(-.4 + i * .4); c.beginPath(); rrect(c, -14, 0, 28, 150, 6); fs(c, ['#c8ccd3', '#d9c36a', '#b0b6bf'][i], 5); circle(c, 0, 0, 22); fs(c, ['#c8ccd3', '#d9c36a', '#b0b6bf'][i], 5); c.restore(); }
  c.restore();
  c.restore();
  if (lt > .78 && lt < 1.05) hudTag(c, t, 17.29, 560, 820, 'Klick', { size: 56, tilt: -.06 });
  alarmGrade(c, t, .7, { bx: 460, by: 100, br: 1100 }); vignette(c, .55);
});
// 18.24–19.48 "…aus der Übung kennst." — Noah's eyes ECU, red light sweeps across
shot(18.24, 19.48, (c, lt, t) => {
  c.fillStyle = '#2a2633'; c.fillRect(0, 0, W, H);
  const look = lt < .55 ? -.9 : lt < .65 ? lerp(-.9, .9, (lt - .55) / .1) : .9;
  drawLit(c, cc => drawNoahHead(cc, W / 2 + 40, H / 2 + 210 + lt * 20, 3.1, { brow: 'worried', browUp: .4, look, eyeScale: 1.05, shine: 1, mouth: 'flat', sweat: 1, sweatY: lt * 40 }), { light: [-1, -.3], bounds: [0, 0, W, H], rimA: 0, shadeA: .4 });
  alarmGrade(c, t, 1, { bx: lerp(-200, W + 200, seg(lt, 0, 1.24)), by: H * .3, br: 900 }); letterbox(c, 1, 150); vignette(c, .6);
});
// 19.48–20.80 "In den nächsten zwanzig Minuten…" — bird's-eye on room 204, red pulse, timer 20:00 starts
shot(19.48, 20.8, (c, lt, t) => {
  const cam = makeCam({ pos: [4.4, 9.5 - lt * .8, 3.6], yaw: 0, pitch: -1.5, roll: .05 + lt * .03, fov: 60 });
  classroomFrame(c, t, cam, { sun: false, clock: [10, 17, 30], light: { amb: .55, ambCol: [100, 110, 170] }, cast: classCast({ expr: { noah: { browUp: 1, mouth: 'o' }, lea: { brow: 'worried', mouth: 'wobbly' }, jonas: { browUp: 1, mouth: 'o' } }, teacherPos: [8.3, 0, 6.9], teacherPose: { expr: { brow: 'worried', mouth: 'flat' } } }) });
  alarmGrade(c, t, 1, { bx: W * .8, by: H * .2, br: 1500 }); vignette(c, .6);
  const remain = 20 * 60 - Math.floor(Math.max(0, lt - .4) * 1);
  hudClock(c, t, 19.6, W / 2, H / 2, `${String(Math.floor(remain / 60)).padStart(2, '0')}:${String(remain % 60).padStart(2, '0')}`, { size: 120, bar: '#d02a22' });
  hudTag(c, t, 19.9, W / 2, H / 2 + 150, 'Minuten', { size: 44, tilt: .02 });
  fadeBlack(c, seg(lt, 1.05, 1.32));
});
function OVERLAY(c, t) { grain(c, t, .03); }
