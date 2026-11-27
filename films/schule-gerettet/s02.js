// ======================= Bölüm 2: Sıradan sabah (36.95 – 94.2) =======================
function bedShot(c, t, cam, o = {}) {
  bedroomFrame(c, t, cam, Object.assign({ tod: 'dawn', noBed: true, cast: S => bedSide(S, { expr: o.expr, arm: o.arm }) }, o));
  gradeScreen(c, { sx: 1, sy: .3, warm: '255,170,110', warmA: .35, coolA: .25 }); vignette(c, .45);
}
const BEDCAM = (dx = 0, dz = 0, fov = 46) => lookAt([2.75 + dx, 1.1, 3.0 + dz], [.6, .7, 3.35], { fov });
// 36.95–38.90 "Dein Wecker klingelt um Viertel vor sieben." — alarm clock ECU on the nightstand, Noah asleep behind it
shot(36.95, 38.9, (c, lt, t) => {
  const cam = lookAt([2.5, 1.0, 3.2], [.6, .72, 3.6], camShake({ fov: lerp(42, 36, seg(lt, 0, 1.9)) }, t, .8));
  bedShot(c, t, cam, { ringing: true, clockText: '06:45', expr: { eyes: 'closed', mouth: 'soft' } });
  if (lt > .25) hudTag(c, t, 37.2, 1350, 260, 'RRRING!', { size: 64, bar: '#d02a22', tilt: .06 + Math.sin(t * 40) * .02 });
  hudClock(c, t, 37.6, 300, 140, '06:45 Uhr');
});
// 38.90–42.16 "Du drückst auf Schlummern. Einmal. Zweimal." — side view of the bed: the arm comes out and slaps the snooze button
shot(38.9, 42.16, (c, lt, t) => {
  const cam = BEDCAM(0, 0, 50);
  const n = t < 40.18 ? 0 : t < 41.13 ? 1 : 2, txtc = ['06:45', '06:54', '07:03'][n];
  const hits = [39.36, 40.3, 41.25]; let arm = 0; for (const h of hits) arm = Math.max(arm, bump(t, h - .35, h + .45));
  bedShot(c, t, cam, { ringing: arm < .5 && (t % .95) > .45, clockText: txtc, arm, expr: { eyes: 'closed', mouth: arm > .5 ? 'flat' : 'soft' } });
  hudClock(c, t, 39.0, W - 300, 140, txtc + ' Uhr');
  if (n > 0) hudTag(c, t, n === 1 ? 40.18 : 41.13, 330, 150, `Schlummern ×${n}`, { size: 48, bar: '#2f6fb0' });
});
// 42.16–44.94 "Beim dritten Mal steht deine Mutter in der Tür…" — POV from the pillow: door opens, mum backlit, arms crossed
shot(42.16, 44.94, (c, lt, t) => {
  const cam = lookAt([.7, 1.25, 3.6], [1.65, 1.1, 0], { fov: 46, roll: -.08 });
  const open = easeOut(seg(lt, 0, .6));
  bedroomFrame(c, t, cam, { tod: 'dawn', door: open, clockText: '07:12', cast: S => {
    actor(S, [1.85, 0, .3], (cc, kk) => drawPerson(cc, CAST.mama, { k: kk, ink: 1.6, expr: { brow: 'angry', mouth: 'flat' }, arms: { l: { a: .9, b: -2.2 }, r: { a: .9, b: -2.2 } } }), { lit: { rim: '255,225,170', rimA: .9, light: [0, -1], shadeA: .45 }, shadowOpt: { skew: 0, squash: .5, alpha: .45 } });
  } });
  gradeScreen(c, { sx: .5, sy: .3, warmA: .35, coolA: .25 }); vignette(c, .5);
  hudClock(c, t, 42.4, W - 300, 140, '07:12 Uhr');
});
// 44.94–46.27 "Jetzt wird's ernst." — Noah's eyes snap open, quick zoom
shot(44.94, 46.27, (c, lt, t) => {
  const z = easeOut(seg(lt, 0, .3)), cam = lookAt([2.2, 1.0, 3.45], [.6, .68, 3.45], camShake({ fov: lerp(36, 20, z) }, t, 3 * (1 - seg(lt, .3, 1))));
  bedShot(c, t, cam, { clockText: '07:12', expr: { browUp: 1, eyeScale: 1.2, shine: 1, mouth: 'o' } });
});
// 46.27–49.20 "Toast im Mund, Rucksack halb offen – und los." — Noah sprints along the street to the bus stop, papers fly
shot(46.27, 49.2, (c, lt, t) => {
  const nx = lerp(-7, 3.2, seg(lt, 0, 2.6)), cam = lookAt([nx - 1.2, 1.1, -3.6], [nx + .6, 1.0, 1.5], { fov: 50 });
  streetFrame(c, t, cam, { bus: lerp(30, 9, easeOut(seg(lt, .5, 2.9))), cast: S => {
    actor(S, [nx, .12, 1.2], (cc, kk) => { drawNoahSide(cc, { k: kk, ink: 1.8, walk: t * 13, armSwing: .7, expr: { browUp: .6, mouth: 'flat' } });
      // toast in the mouth + half-open backpack
      cc.save(); cc.scale(kk, kk); cc.fillStyle = '#e0b060'; cc.strokeStyle = OUT; cc.lineWidth = 12; rrect(cc, 160, -1110, 150, 120, 26); cc.fill(); cc.stroke(); cc.fillStyle = '#f4dca0'; rrect(cc, 178, -1092, 114, 84, 16); cc.fill();
      cc.fillStyle = '#2f6fb0'; rrect(cc, -280, -960, 200, 360, 40); cc.fill(); cc.stroke(); cc.fillStyle = '#244f80'; rrect(cc, -290, -980, 140, 90, 30); cc.fill(); cc.stroke(); cc.restore(); }, {});
    for (let i = 0; i < 4; i++) { const ph = (lt * .8 + i * .25) % 1; billboard(S, [nx - .6 - ph * 2, 1.2 + ph * .8 - ph * ph, 1.2 + i * .1], (cc, sc) => { cc.rotate(ph * 6 + i); cc.fillStyle = '#fff'; cc.fillRect(-sc * .1, -sc * .07, sc * .2, sc * .14); cc.strokeStyle = 'rgba(0,0,0,.5)'; cc.lineWidth = 1.5; cc.strokeRect(-sc * .1, -sc * .07, sc * .2, sc * .14); for (let k = 0; k < 3; k++) line(cc, [-sc * .07, -sc * .03 + k * sc * .03, sc * .06, -sc * .03 + k * sc * .03], 1.2, '#999'); }, { bias: -.4 }); }
  } });
  gradeScreen(c, { sx: .9, sy: 0, warmA: .3, coolA: .15 }); vignette(c, .35);
  hudClock(c, t, 46.5, W - 300, 140, '07:24 Uhr');
});
// bus interior: Noah at the window, Jonas next to him talking about his game
function busTwoShot(c, t, cam, o = {}) {
  busInteriorFrame(c, t, cam, { cast: S => {
    const talk = o.talk ? Math.abs(Math.sin(t * 11)) : 0, gest = o.talk ? Math.sin(t * 4) : 0;
    actor(S, [.42, 0, 4.85], (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H + 40, ink: 1.8, tilt: o.nod ? Math.sin(t * 7) * .05 : .04, expr: o.noahExpr || { lid: .3, mouth: 'flat', look: -.6 }, arms: { l: { a: .3, b: -1.1 }, r: { a: .3, b: -1.1 } } }), { sit: true });
    actor(S, [.98, 0, 4.85], (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, sit: true, seatH: SEAT_H + 40, ink: 1.6, tilt: -.06, expr: o.jonasExpr || { mouth: talk > .5 ? 'grin' : 'o', browUp: .6, look: -.8, shine: 1 }, arms: o.calm ? { l: { a: .3, b: -1.1 }, r: { a: .3, b: -1.1 } } : { l: { a: 1.2 + gest * .4, b: -1.6 }, r: { a: 2.2 - gest * .3, b: .3 } } }), { sit: true });
  } });
}
// 49.20–53.74 "Im Bus erzählt dir dein bester Kumpel Jonas zum hundertsten Mal von seinem neuen Videospiel."
shot(49.2, 53.74, (c, lt, t) => {
  const cam = lookAt([lerp(1.35, 1.15, seg(lt, 0, 4.5)), 1.4, 3.3], [.7, .95, 4.9], { fov: 50 });
  busTwoShot(c, t, cam, { talk: true });
  // game "speech bubble": rocket, controller, stars
  const a = clamp((t - 50.2) / .3); if (a > 0) { c.save(); c.globalAlpha = a; c.translate(1330, 260); c.scale(easeBack(a), easeBack(a)); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, 0, 230, 140, 0, 0, TAU); c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.moveTo(-120, 110); c.lineTo(-200, 200); c.lineTo(-60, 125); c.fillStyle = '#fff'; c.fill(); c.stroke();
    c.rotate(Math.sin(t * 3) * .1); c.fillStyle = '#e05a4a'; c.beginPath(); c.moveTo(-90, 40); c.lineTo(-30, -70); c.lineTo(20, 40); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(-70, 40); c.lineTo(-30, 90 + Math.sin(t * 30) * 12); c.lineTo(0, 40); c.fill();
    rrect(c, 50, -20, 140, 80, 34); c.fillStyle = '#3a3f4a'; c.fill(); c.stroke(); circle(c, 90, 20, 10); c.fillStyle = '#fff'; c.fill(); circle(c, 150, 10, 9); c.fillStyle = '#e05a4a'; c.fill(); circle(c, 165, 32, 9); c.fillStyle = '#5ab04a'; c.fill();
    for (let i = 0; i < 3; i++) star(c, -150 + i * 40, -60 - i * 20, 14, '#ffd84a'); c.restore(); }
  hudTag(c, t, 51.4, 380, 150, '100. Mal', { size: 48, bar: '#e0663a' });
});
// 53.74–57.39 "Du nickst. Du hörst nicht zu. Er weiß das. Ist okay." — side angle, Noah nods and looks out of the window
shot(53.74, 57.39, (c, lt, t) => {
  const cam = lookAt([1.9, 1.3, 3.5], [.6, 1.0, 4.85], { fov: 46 });
  busTwoShot(c, t, cam, { talk: t < 55.5, nod: t < 54.4, noahExpr: { lid: .25, mouth: 'flat', look: -1 }, jonasExpr: t < 55.5 ? undefined : { mouth: 'smile', eyes: 'closed', browUp: .4 }, calm: true });
  if (t > 55.5) hudTag(c, t, 56.38, W - 340, 160, 'Ist okay.', { size: 48, bar: '#3d8a4f' });
});
// school entrance with Herr Krüger
function entranceShot(c, t, cam, o = {}) {
  exteriorFrame(c, t, cam, { tod: 'morning', clock: [7, 52, 0], cast: S => {
    actor(S, [3.6, 0, -2.6], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: o.kexpr || { brow: 'angry', mouth: 'frown' }, arms: { l: { a: .7, b: -2.0 }, r: { a: .7, b: -2.0 } } }), {});
    for (let i = 0; i < 6; i++) { const ph = ((t * .12 + i / 6) % 1), x = lerp(-6 + i * 1.2, -.6 + (i % 3) * .5, ph), z = lerp(-14, -2.4, ph), P = [CAST.student1, CAST.student2, CAST.student3, CAST.lea, CAST.jonas, CAST.student2][i];
      if (o.students !== false) actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, P, { k: kk, ink: 1.6, back: true, arms: { l: { a: .15 + Math.sin(t * 8 + i) * .15 }, r: { a: .15 - Math.sin(t * 8 + i) * .15 } } }), {}); }
  } });
  gradeScreen(c, { sx: .1, sy: 0, warmA: .3, coolA: .2 }); vignette(c, .4);
}
// 57.39–60.92 "Am Schuleingang steht wie jeden Morgen Herr Krüger, der Hausmeister."
shot(57.39, 60.92, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.5)), cam = lookAt([lerp(-1, 1.5, k), 2.2, lerp(-15, -10, k)], [2.6, 1.6, -2.2], { fov: 44 });
  entranceShot(c, t, cam); hudTag(c, t, 59.3, W - 420, 170, 'Herr Krüger · Hausmeister', { size: 44, bar: '#3f5f86' });
});
// 60.92–64.01 "Er guckt grimmig, als hätte ihm jemand sein Frühstück geklaut." — low angle on Krüger + thought bubble
shot(60.92, 64.01, (c, lt, t) => {
  const cam = lookAt([3.0, .8, -5.2], [3.6, 1.6, -2.6], { fov: 42 });
  entranceShot(c, t, cam, { students: false });
  const a = clamp((t - 62.2) / .3); if (a > 0) { c.save(); c.globalAlpha = a; c.translate(1450, 300); c.scale(easeBack(a), easeBack(a)); for (const [x, y, r] of [[-200, 150, 16], [-160, 110, 24]]) { circle(c, x, y, r); fs(c, '#fff', 5); }
    c.beginPath(); for (let i = 0; i < 9; i++) { const ang = i / 9 * TAU; c.arc(Math.cos(ang) * 120, Math.sin(ang) * 70, 55, 0, TAU); } c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.ellipse(0, 0, 160, 100, 0, 0, TAU); c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke();
    c.fillStyle = '#e8c27a'; rrect(c, -70, -30, 140, 60, 20); c.fill(); c.stroke(); c.fillStyle = '#6ab04a'; c.fillRect(-60, -10, 120, 10); c.fillStyle = '#e05a4a'; c.fillRect(-60, 2, 120, 8); line(c, [-90, -60, 90, 60], 12, '#d02a22'); line(c, [-90, 60, 90, -60], 12, '#d02a22'); c.restore(); }
});
// 64.01–65.30 "Aber das ist nur Show." — Krüger winks
shot(64.01, 65.3, (c, lt, t) => {
  const cam = lookAt([3.3, 1.55, -5.0], [3.6, 1.6, -2.6], { fov: 40 });
  exteriorFrame(c, t, cam, { tod: 'morning', clock: [7, 52, 0], cast: S => actor(S, [3.6, 0, -2.6], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: lt > .4 ? { eyes: 'closed', mouth: 'smile' } : { brow: 'angry', mouth: 'frown' } }), {}) });
  gradeScreen(c, { sx: .1, sy: 0, warmA: .3, coolA: .2 }); vignette(c, .4);
  if (lt > .4) hudTag(c, t, 64.45, 1300, 300, '*zwinker*', { size: 40, tilt: .08 });
});
// Sportfest flashback (summer): bunting, tables, loudspeaker poles, cable drums
function sportfest(S, t) {
  for (let i = 0; i < 8; i++) { const x0 = -14 + i * 3.6; push(S, depthOf(S, [x0 + 1.8, 3, -8]), c => { const a = proj(S.cam, [x0, 3.2, -8]), b = proj(S.cam, [x0 + 3.6, 3.2, -8]); if (!a || !b) return; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 30, b[0], b[1]); c.lineWidth = 2; c.strokeStyle = '#555'; c.stroke(); for (let k = 0; k < 6; k++) { const u = (k + .5) / 6, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 30, s = Math.abs(b[0] - a[0]) / 14; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.lineTo(x, y + s * 1.8 + Math.sin(t * 4 + k) * 2); c.closePath(); c.fillStyle = ['#e05a4a', '#f2c230', '#3a7ad2', '#3aa05a'][(k + i) % 4]; c.fill(); } }); }
  for (const x of [-10, 4]) { solid(S, x, 0, -8, .1, 3.5, .1, '#888'); solid(S, x - .25, 3.3, -8.2, .5, .35, .35, '#333', { cols: { front: '#555' } }); }
  for (const x of [-7, -3]) { solid(S, x, .72, -10, 2.2, .06, .9, '#f4f1ea'); for (const dx of [.1, 2]) solid(S, x + dx, 0, -9.9, .06, .72, .7, '#999'); }
  for (let i = 0; i < 4; i++) cylinder(S, -1 + i * .9, 0, -6 - (i % 2) * .4, .3, .35, '#d0702a', { seg: 12, capCol: '#e08a3a' });
  push(S, depthOf(S, [0, 0, -6]) + .2, c => { c.beginPath(); for (let i = 0; i <= 30; i++) { const p = proj(S.cam, [-1 + i * .4, .02, -6 + Math.sin(i * .7) * .8]); if (p) i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.lineWidth = 5; c.strokeStyle = '#222'; c.stroke(); });
}
function flashbackLook(c, t) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(255,200,120,.55)'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; const g = c.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(255,240,210,.55)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
// 65.30–68.56 "Letzten Sommer, beim Sportfest, hast du ihm einen ganzen Nachmittag lang geholfen…"
shot(65.3, 68.56, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.2)), cam = lookAt([lerp(-9, -6, k), 2.2, -18], [-1, 1.2, -7], { fov: 52 });
  exteriorFrame(c, t, cam, { tod: 'summer', ball: false, cast: S => { sportfest(S, t);
    const nx = lerp(-6, -1.5, seg(lt, 0, 3.2));
    actor(S, [nx, 0, -7.2], (cc, kk) => drawNoahSide(cc, { k: kk, ink: 1.8, walk: t * 8, armSwing: .1, expr: { mouth: 'flat', sweat: 1 } }), {});
    actor(S, [nx + 1.4, 0, -7.0], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: { mouth: 'smile' }, arms: { r: { a: 1.4, b: -.4 } } }), {});
    for (let i = 0; i < 6; i++) actor(S, [-12 + i * 3.1, 0, -12 - (i % 2) * 2], (cc, kk) => drawPerson(cc, [CAST.student1, CAST.student2, CAST.student3][i % 3], { k: kk, ink: 1.6, expr: { mouth: 'grin' }, arms: { l: { a: 2.4 + Math.sin(t * 6 + i) * .2, b: .3 } } }), {});
  } });
  flashbackLook(c, t); vignette(c, .35);
  hudTag(c, t, 65.5, 420, 150, 'Letzten Sommer · Sportfest', { size: 44, bar: '#f2a53a' });
});
// 68.56–70.30 "…Kabel zu schleppen." — close: Noah hauls a heavy cable drum, sweating
shot(68.56, 70.3, (c, lt, t) => {
  const cam = lookAt([-3.2, 1.0, -9.6], [-2.6, .8, -7.2], { fov: 42 });
  exteriorFrame(c, t, cam, { tod: 'summer', ball: false, cast: S => { sportfest(S, t);
    actor(S, [-2.6, 0, -7.2], (cc, kk) => { drawNoah(cc, { k: kk, ink: 1.8, lean: Math.sin(t * 5) * .03, expr: { brow: 'worried', mouth: 'wobbly', sweat: 1, sweatY: (lt * 60) % 60 }, arms: { l: { a: .45, b: -.9 }, r: { a: .45, b: -.9 } } }); cc.save(); cc.scale(kk, kk); cc.beginPath(); cc.ellipse(0, -520, 260, 200, 0, 0, TAU); cc.fillStyle = '#d0702a'; cc.fill(); cc.lineWidth = 14; cc.strokeStyle = OUT; cc.stroke(); cc.beginPath(); cc.ellipse(0, -520, 120, 90, 0, 0, TAU); cc.fillStyle = '#222'; cc.fill(); for (let i = 0; i < 6; i++) { cc.beginPath(); cc.ellipse(0, -520, 140 + i * 18, 105 + i * 14, 0, 0, TAU); cc.lineWidth = 6; cc.strokeStyle = '#333'; cc.stroke(); } cc.restore(); }, {});
  } });
  flashbackLook(c, t); vignette(c, .4);
});
// 70.30–72.69 "Merk dir das. Das wird noch wichtig." — freeze frame with a pinned note, push towards the gym
shot(70.3, 72.69, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.4)), cam = lookAt([lerp(-2, 4, k), 2.0, lerp(-14, -22, k)], [EXT.gym.x0, 2.0, -31], { fov: lerp(50, 36, k) });
  exteriorFrame(c, 68, cam, { tod: 'summer', ball: false, cast: S => sportfest(S, 68) });
  flashbackLook(c, t); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.6)'; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .45);
  const a = clamp((t - 70.4) / .3); if (a > 0) { c.save(); c.translate(1420, 330); c.rotate(.05); c.scale(easeBack(a), easeBack(a)); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 20; c.fillStyle = '#ffe36a'; c.fillRect(-230, -170, 460, 340); c.shadowColor = 'transparent'; circle(c, 0, -150, 18); c.fillStyle = '#d02a22'; c.fill(); txt(c, 'Merk dir das!', 0, -50, 56, '#2a2a33', 'center'); txt(c, 'Technikraum', 0, 30, 40, '#2a2a33', 'center'); txt(c, 'Kabel · Mikrofon', 0, 90, 34, '#555', 'center'); c.restore(); }
});
// 72.69–76.95 "Dritte Stunde: Mathe bei Frau Becker. Raum 204, zweiter Stock." — push in on the facade to the 204 window
shot(72.69, 76.95, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 4.2)), tgt = [-12.4, 8.1, 0], cam = lookAt([lerp(-4, -10.5, k), lerp(2, 7.2, k), lerp(-30, -7, k)], tgt, { fov: lerp(48, 34, k) });
  exteriorFrame(c, t, cam, { tod: 'morning', clock: [10, 5, 0] });
  gradeScreen(c, { sx: .1, sy: 0, warmA: .3, coolA: .2 }); vignette(c, .4);
  hudTag(c, t, 73.0, 360, 150, '3. Stunde · Mathe', { size: 46, bar: '#2f6fb0' });
  hudTag(c, t, 74.9, W - 380, 170, 'Raum 204 · 2. Stock', { size: 46, bar: '#d02a22' });
});
// 76.95–80.96 "Frau Becker schreibt eine Gleichung an die Tafel, die aussieht wie ein Geheimcode."
shot(76.95, 80.96, (c, lt, t) => {
  const k = seg(lt, 0, 4), cam = lookAt([lerp(5.9, 5.2, k), 1.55, 5.45], [3.9, 1.55, 8], { fov: 46 });
  classroomFrame(c, t, cam, { clock: [10, 8, 30], cast: S => { const wr = Math.sin(lt * 14) * .08; actor(S, [3.35, 0, 7.3], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, back: true, arms: { r: { a: 2.55 + wr, b: .25 }, l: { a: .12, b: -.3 } } }), { lit: { rimA: .45 } }); } });
  gradeScreen(c, { sx: 0, sy: .2, warmA: .3, coolA: .2 }); vignette(c, .35);
  if (t > 79.4) { c.save(); for (let i = 0; i < 14; i++) { const x = 700 + rnd(i) * 900, y = 250 + rnd(i + 4) * 350; c.globalAlpha = .9; txt(c, '∑∫π√∞≠±×÷∂'[i % 10], x, y, 60 + rnd(i) * 40, '#f6f0d8'); } c.restore(); hudTag(c, t, 79.6, W - 360, 160, 'Geheimcode?', { size: 50, bar: '#8a5ab0' }); }
});
// 80.96–84.02 "Lea, vor dir, malt kleine Sterne auf ihren Block." — over Noah's shoulder, then insert of the stars
shot(80.96, 84.02, (c, lt, t) => {
  const cam = lookAt([4.15, 1.45, 3.05], [4.2, .8, 4.5], { fov: 44 });
  classroomFrame(c, t, cam, { clock: [10, 9, 0], cast: S => actor(S, seatPos('lea'), (cc, kk) => drawPerson(cc, CAST.lea, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, back: true, tilt: -.1, arms: { r: { a: .5, b: -1.3 + Math.sin(lt * 18) * .12 } } }), { sit: true }) });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .3, coolA: .2 });
  // the notebook page with stars appearing one by one (insert in the lower right)
  const a = clamp((t - 81.6) / .3); if (a > 0) { c.save(); c.translate(1430, 720); c.rotate(-.04); c.scale(easeBack(a), easeBack(a)); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 24; c.fillStyle = '#fff'; c.fillRect(-300, -220, 600, 440); c.shadowColor = 'transparent'; for (let i = 0; i < 12; i++) line(c, [-300, -180 + i * 36, 300, -180 + i * 36], 2, '#b8d0e8'); line(c, [-240, -220, -240, 220], 3, '#e8a0a0');
    const n = Math.floor((t - 81.6) * 4); for (let i = 0; i < Math.min(n, 14); i++) star(c, -180 + (i % 5) * 100 + rnd(i) * 30, -140 + Math.floor(i / 5) * 120 + rnd(i + 3) * 30, 22 + rnd(i + 5) * 14, ['#ffd84a', '#ff9ec0', '#8fd0ff'][i % 3]); c.restore(); }
  vignette(c, .35);
});
// 84.02–87.39 "Und Jonas ist kurz davor, auf seinem Mathebuch einzuschlafen."
shot(84.02, 87.39, (c, lt, t) => {
  const cam = lookAt([5.75, 1.3, 3.45], [4.95, .95, 2.6], { fov: 40 });
  const droop = easeIO(seg(lt, 0, 3.2));
  classroomFrame(c, t, cam, { clock: [10, 10, 0], cast: S => {
    actor(S, seatPos('jonas'), (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, tilt: .15 + droop * .35 + Math.sin(t * 2) * .03, expr: { lid: .5 + droop * .5, eyes: droop > .85 ? 'closed' : 'open', mouth: droop > .6 ? 'o' : 'flat' }, arms: { l: { a: .4, b: -1.3 }, r: { a: .4, b: -1.3 } } }), { sit: true, bias: -.05 });
    actor(S, seatPos('noah'), (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H, ink: 1.8, expr: { lid: .4, mouth: 'flat', look: .8 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true, bias: -.05 });
  } });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .3, coolA: .2 }); vignette(c, .4);
  if (droop > .6) { c.save(); c.globalAlpha = seg(droop, .6, .8); for (let i = 0; i < 3; i++) txt(c, 'z', 1180 + i * 40, 330 - i * 44 - (lt * 30 % 40), 46 + i * 12, '#5a5a8a'); c.restore(); }
});
// 87.39–90.59 "Alles ist so normal. So langweilig." — static wide, nothing moves but the dust
shot(87.39, 90.59, (c, lt, t) => {
  const cam = lookAt([8.4, 2.3, .6], [3.6, .95, 6.4], { fov: 60 });
  classroomFrame(c, t, cam, { cast: classCast({ back: true }), clock: [10, 14, 0] });
  gradeScreen(c, { sx: .05, sy: .1, warmA: .3, coolA: .2 }); vignette(c, .35);
  if (t > 89.1) hudTag(c, t, 89.3, W / 2, H - 150, 'gääähn …', { size: 52, tilt: -.03 });
});
// 90.59–94.25 "Und genau diese Langeweile wirst du dir gleich zurückwünschen." — slow ominous push on the clock, light cools
shot(90.59, 94.25, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.66)), cam = lookAt([4.5, lerp(1.4, 2.2, k), lerp(4.2, 7.2, k)], [4.5, 2.7, 8], { fov: lerp(46, 30, k) });
  const sec = 50 + Math.floor(lt * 2.4);
  classroomFrame(c, t, cam, { clock: [10, 16, Math.min(59, sec)], sunA: 1 - k * .7, cast: classCast({ back: true, teacher: false }) });
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(80,90,150,${k * .45})`; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .4 + k * .3);
});
