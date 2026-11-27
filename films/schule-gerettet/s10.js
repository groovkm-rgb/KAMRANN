// ======================= Bölüm 10: Polis (479.38 – 531.96) =======================
const CARS = [[2, -20, .5], [-4, -24, -.4], [6, -27, 1.2]];
function policeYard(c, t, cam, cast, o = {}) {
  const arrive = o.arrive ?? 1;
  exteriorFrame(c, t, cam, { tod: 'police', alarm: o.alarm ?? 1, door: o.door ?? 0, clock: [10, 33, 0], cast: S => {
    CARS.forEach(([x, z, ry], i) => { const d = (1 - easeOut(clamp(arrive * 1.3 - i * .15))) * 30; policeCar(S, x - d * .3, z - d, ry, t, { seed: i }); });
    if (cast) cast(S, t);
  } });
  policeGrade(c, t, o.k ?? 1); vignette(c, .5);
}
const NOAH_DOOR = [GX - .6, 0, GDZ + 2.8];
// 479.38–483.13 "Dann die Sirenen. Erst weit weg. Dann immer näher." — Noah at the door listens; the street beyond the fence starts flashing
shot(479.38, 483.13, (c, lt, t) => {
  const cam = lookAt([GX - 3, 1.0, GDZ + 4.5], [GX - .5, .8, GDZ + 1.5], { fov: 46 });
  yardAlarm(c, t, cam, S => actor(S, [GX - .35, 0, GDZ + 1.1], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, sit: true, seatH: 60, expr: { browUp: .6, mouth: 'o', look: -1 } })), { sit: true }), { door: 0 });
  const k = seg(lt, 1.5, 3.7); if (k > 0) policeGrade(c, t, k * .7);
  hudTag(c, t, 479.6, 360, 150, 'Sirenen', { size: 50, bar: '#3a7aff' }); if (t > 481.74) hudTag(c, t, 481.8, W - 330, 170, '… immer näher', { size: 46 });
});
// 483.13–484.91 "Blaulicht flutet den Schulhof." — wide, the cars race in
shot(483.13, 484.91, (c, lt, t) => {
  const cam = lookAt([-12, 4.5, -34], [2, 1, -18], { fov: 56 });
  policeYard(c, t, cam, null, { arrive: seg(lt, 0, 1.3) });
});
// 484.91–487.97 "Polizisten mit Helmen und Westen springen aus den Autos." — officers run across the yard
shot(484.91, 487.97, (c, lt, t) => {
  const cam = lookAt([-6, 1.5, -30], [4, 1.2, -24], { fov: 50 });
  policeYard(c, t, cam, S => { for (let i = 0; i < 5; i++) { const u = seg(lt, i * .2, 3), x = lerp(-2 + i * 1.6, 7 + i * .5, u), z = lerp(-22 - i * .8, -29 - i * .3, u); actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, CAST.polizist, { k: kk, ink: 1.6, back: true, arms: { l: { a: .3 + Math.sin(t * 12 + i) * .4 }, r: { a: .3 - Math.sin(t * 12 + i) * .4 } } }), { scale: 1.05 }); } });
  hudTag(c, t, 485.6, 360, 150, 'Helme · Westen', { size: 46, bar: '#d8e04a' });
});
// 487.97–489.95 "Eine Polizistin rennt auf dich zu."
shot(487.97, 489.95, (c, lt, t) => {
  const u = seg(lt, 0, 1.9), cam = lookAt([GX - 1.0, 1.0, GDZ + 3.4], [GX - 4, 1.2, GDZ - 3], { fov: 46 });
  policeYard(c, t, cam, S => actor(S, [lerp(GX - 8, GX - 2.2, u), 0, lerp(GDZ - 6, GDZ + .5, u)], (cc, kk) => drawPerson(cc, CAST.polizistin, { k: kk, ink: 1.6, expr: { brow: 'worried', mouth: 'o' }, arms: { l: { a: .4 + Math.sin(t * 12) * .5 }, r: { a: .4 - Math.sin(t * 12) * .5 } } }), { scale: 1.02 }));
});
// 489.95–491.93 "Du hältst ihr einfach nur den Schlüssel hin."
shot(489.95, 491.93, (c, lt, t) => {
  const cam = lookAt([GX - 2.4, 1.15, GDZ + 2.2], [GX - 1.1, 1.0, GDZ + 1.3], { fov: 42 });
  policeYard(c, t, cam, S => {
    actor(S, [GX - .5, 0, GDZ + 1.1], (cc, kk) => { socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: { brow: 'worried', mouth: 'flat' }, arms: { r: { a: 1.25, b: -.3 } } })); cc.save(); cc.scale(kk, kk); cc.translate(520, -760); glow(cc, 0, 0, 120, '255,230,150', .6); cc.fillStyle = '#d9c36a'; cc.beginPath(); cc.arc(-40, 0, 26, 0, TAU); cc.fill(); cc.fillRect(-20, -8, 110, 16); cc.lineWidth = 6; cc.strokeStyle = OUT; cc.stroke(); cc.restore(); }, {});
    actor(S, [GX - 1.9, 0, GDZ + .4], (cc, kk) => drawPerson(cc, CAST.polizistin, { k: kk, ink: 1.6, expr: { mouth: 'soft', look: .8 }, arms: { l: { a: 1.0, b: -.4 } } }), { scale: 1.02 });
  });
});
// 491.93–496.12 Sie nimmt ihn und sagt: „Du bist Noah, oder? Wir haben schon von dir gehört.“
shot(491.93, 496.12, (c, lt, t) => {
  const cam = lookAt([GX - .9, 1.55, GDZ + 1.9], [GX - 1.9, 1.75, GDZ + .4], { fov: 36 });
  policeYard(c, t, cam, S => actor(S, [GX - 1.9, 0, GDZ + .4], (cc, kk) => drawPerson(cc, CAST.polizistin, { k: kk, ink: 1.6, expr: { mouth: Math.sin(t * 10) > 0 ? 'smile' : 'soft', look: .6 } }), { scale: 1.02 }), { k: .6 });
});
// 496.12–500.55 "Ein paar Minuten später führen sie ihn raus. In Handschellen. Ohne Maske." — from behind, face never seen
shot(496.12, 500.55, (c, lt, t) => {
  const u = seg(lt, 0, 4.4), p = [lerp(GX - 1.2, GX - 5.5, u), 0, lerp(GDZ + 1.1, GDZ - 5, u)];
  const cam = lookAt([GX - 1.0, 1.6, GDZ + 4.0], [p[0] - .5, 1.3, p[2]], { fov: 46 });
  policeYard(c, t, cam, S => {
    actor(S, p, (cc, kk) => drawArrested(cc, { k: kk }), { lit: ATT_LIT, scale: 1.0 });
    actor(S, [p[0] - .7, 0, p[2] + .25], (cc, kk) => drawPerson(cc, CAST.polizist, { k: kk, ink: 1.6, back: true }), { scale: 1.05 });
    actor(S, [p[0] + .7, 0, p[2] + .25], (cc, kk) => drawPerson(cc, CAST.polizist, { k: kk, ink: 1.6, back: true }), { scale: 1.05 });
  }, { door: 1 });
  if (t > 498.54) hudTag(c, t, 498.6, 360, 150, 'Handschellen', { size: 48, bar: '#9aa0a8' }); if (t > 499.47) hudTag(c, t, 499.5, W - 360, 170, 'ohne Maske', { size: 46 });
});
// 500.55–507.64 "Und weißt du was? Er sieht aus wie irgendein Mann. Gar nicht wie ein Monster. Und heute hat er niemandem etwas getan."
shot(500.55, 504.17, (c, lt, t) => {
  // the back of an ordinary man between two officers, the "monster" shadow shrinking on the wall
  const cam = lookAt([GX - 6.5, 1.5, GDZ - 1.5], [GX - 6, 1.4, GDZ - 6], { fov: 40 });
  policeYard(c, t, cam, S => { actor(S, [GX - 6, 0, GDZ - 5.5], (cc, kk) => drawArrested(cc, { k: kk }), { lit: ATT_LIT }); actor(S, [GX - 6.8, 0, GDZ - 5.3], (cc, kk) => drawPerson(cc, CAST.polizist, { k: kk, ink: 1.6, back: true }), { scale: 1.05 }); actor(S, [GX - 5.2, 0, GDZ - 5.3], (cc, kk) => drawPerson(cc, CAST.polizist, { k: kk, ink: 1.6, back: true }), { scale: 1.05 }); }, { door: 1 });
  hudTag(c, t, 501.8, 400, 150, 'irgendein Mann', { size: 48 }); if (t > 503.64) hudTag(c, t, 503.7, W - 420, 170, 'kein Monster', { size: 48, bar: '#3d8a4f' });
});
shot(504.17, 507.64, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.4)), cam = lookAt([lerp(-2, -6, k), lerp(2, 6, k), -40], [0, 3, -12], { fov: 56 });
  policeYard(c, t, cam, null, { k: .5, alarm: 0 });
  hudTag(c, t, 505.4, W / 2, 150, 'niemandem etwas getan', { size: 50, bar: '#3d8a4f' });
});
// 507.64–512.28 "Dann holt die Polizei die Klassen raus. Eine nach der anderen. Zuerst die Kleinen."
shot(507.64, 512.28, (c, lt, t) => {
  const cam = lookAt([-6, 2.6, -16], [1, 1, -2], { fov: 50 });
  policeYard(c, t, cam, S => { for (let i = 0; i < 10; i++) { const u = clamp((lt - i * .25) / 3), x = lerp(-.6 + (i % 2) * .7, -6 - (i % 3), u), z = lerp(-1.5, -12 - i * .5, u); if (u > 0) actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, i % 2 ? CAST.kid5a : CAST.kid5b, { k: kk, ink: 1.6, expr: { brow: 'worried', mouth: 'flat' }, arms: { l: { a: .2 + Math.sin(t * 8 + i) * .2 }, r: { a: .2 - Math.sin(t * 8 + i) * .2 } } }), { scale: .82 }); }
    actor(S, [1.6, 0, -4], (cc, kk) => drawPerson(cc, CAST.polizist, { k: kk, ink: 1.6, arms: { r: { a: 1.4, b: -.2 } } }), { scale: 1.05 }); }, { k: .5, alarm: 0 });
  hudTag(c, t, 511.1, W - 360, 170, 'zuerst die Kleinen', { size: 46, bar: '#5ab0d0' });
});
// 512.28–514.38 "Und dann Raum 204." — the back door of 204 opens on the fire escape? No: they come out of the main entrance
shot(512.28, 514.38, (c, lt, t) => {
  const cam = lookAt([1.5, 1.6, -9], [0, 1.6, -1], { fov: 44 });
  policeYard(c, t, cam, S => { [CAST.lea, CAST.jonas, CAST.student2, CAST.becker].forEach((P, i) => { const u = clamp((lt - i * .3) / 1.6); actor(S, [lerp(-.5 + i * .5, -1 + i * .7, u), 0, lerp(-1.2, -4.5, u)], (cc, kk) => drawPerson(cc, P, { k: kk, ink: 1.6, expr: { brow: 'worried', mouth: 'flat', look: -.5 } }), {}); }); }, { k: .4, alarm: 0 });
  hudTag(c, t, 512.8, 380, 150, 'Raum 204', { size: 54, bar: '#d02a22' });
});
// reunion staging in the yard
function reunion(c, t, cam, o = {}) {
  policeYard(c, t, cam, S => {
    const hugLea = o.lea, hugB = o.becker;
    actor(S, [-1.8, 0, -8.0], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: o.noahExpr || { mouth: 'smile', browUp: .4 }, arms: hugLea || hugB ? { l: { a: 1.2, b: -1.6 }, r: { a: 1.2, b: -1.6 } } : undefined })), {});
    actor(S, [hugLea ? -1.45 : -2.9, 0, hugLea ? -8.15 : -8.2], (cc, kk) => drawPerson(cc, CAST.lea, { k: kk, ink: 1.6, expr: { mouth: 'grin', eyes: 'closed' }, arms: hugLea ? { l: { a: 2.0, b: .6 }, r: { a: 2.0, b: .6 } } : undefined }), {});
    actor(S, [-.6, 0, -8.1], (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, ink: 1.6, expr: o.jonasExpr || { mouth: 'o', browUp: 1, eyeScale: 1.1 }, arms: o.pat ? { l: { a: 1.6 + Math.sin(t * 10) * .2, b: .3 } } : undefined }), {});
    actor(S, [hugB ? -2.2 : -3.6, 0, hugB ? -8.3 : -8.7], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, expr: o.beckerExpr || { mouth: 'smile', eyes: 'closed' }, arms: hugB ? { l: { a: 1.9, b: .7 }, r: { a: 1.9, b: .7 } } : undefined }), {});
    for (let i = 0; i < 6; i++) actor(S, [-6 + i * 1.6, 0, -11 - (i % 2)], (cc, kk) => drawPerson(cc, [CAST.student1, CAST.student2, CAST.student3][i % 3], { k: kk, ink: 1.6, expr: { mouth: o.laugh ? 'grin' : 'smile' } }), {});
  }, { k: .35, alarm: 0, door: 1 });
}
// 514.38–516.04 "Lea fällt dir um den Hals."
shot(514.38, 516.04, (c, lt, t) => { reunion(c, t, lookAt([-1.6, 1.4, -5.6], [-1.8, 1.2, -8.0], { fov: 44 }), { lea: true, noahExpr: { mouth: 'smile', blush: 1, browUp: .5 } }); });
// 516.04–521.19 Jonas klopft dir auf die Schulter: „Alter. Alter. Alter.“ Mehr kriegt er nicht raus.
shot(516.04, 521.19, (c, lt, t) => {
  reunion(c, t, lookAt([-.9, 1.4, -5.8], [-1.1, 1.25, -8.0], { fov: 42 }), { pat: t < 519, jonasExpr: { mouth: Math.sin(t * 8) > 0 ? 'o' : 'grin', browUp: 1, eyeScale: 1.1, shine: 1 } });
  ['Alter.', 'Alter.', 'Alter.'].forEach((s, i) => { const ts = [517.71, 518.25, 518.8][i]; if (t > ts) hudTag(c, t, ts, 1250 + i * 150, 260 + i * 90, s, { size: 46 + i * 8, tilt: (i - 1) * .08 }); });
});
// 521.19–525.25 Frau Becker nimmt dich in den Arm. „Ich hab dir gesagt, du sollst anrufen!“
shot(521.19, 525.25, (c, lt, t) => { reunion(c, t, lookAt([-2.4, 1.5, -5.6], [-2.0, 1.4, -8.2], { fov: 42 }), { becker: true, beckerExpr: { mouth: Math.sin(t * 10) > 0 ? 'o' : 'grin', brow: 'worried' } }); if (t > 523) hudTag(c, t, 523.0, W - 420, 170, '„… anrufen!“', { size: 48 }); });
// 525.25–529.04 „Hab ich ja. Sie haben angerufen. Genau im falschen Moment.“
shot(525.25, 529.04, (c, lt, t) => { reunion(c, t, lookAt([-1.4, 1.35, -6.4], [-1.8, 1.2, -8.0], { fov: 36 }), { noahExpr: { mouth: Math.sin(t * 10) > 0 ? 'o' : 'smile', brow: 'worried', browUp: .3, look: -.5 } }); if (t > 527.3) hudTag(c, t, 527.35, 380, 160, 'im falschen Moment', { size: 46, bar: '#e0663a' }); });
// 529.04–531.96 "Und zum ersten Mal an diesem Tag lacht ihr alle." — wide, everyone laughing, police lights calm
shot(529.04, 531.96, (c, lt, t) => { reunion(c, t, lookAt([-2, 2.0, -3.5], [-2, 1.0, -9], { fov: 54 }), { laugh: true, noahExpr: { mouth: 'grin', eyes: 'closed' }, jonasExpr: { mouth: 'grin', eyes: 'closed' }, beckerExpr: { mouth: 'grin', eyes: 'closed' } }); });
