// ======================= Bölüm 6: Karar (275.85 – 309.34) =======================
// Noah leans to Frau Becker; two-shot in the huddle (side angle)
function beckerNoah(c, t, cam, o = {}) {
  classDark(c, t, cam, { cast: S => {
    huddleCast({ phone: o.phone, noahExpr: { brow: 'worried', mouth: 'flat' } })(S, t);
    // Noah moved next to Becker
  } });
}
const BECK = [3.55, 0, 1.75];
function twoShot(c, t, cam, nE, bE, o = {}) {
  classDark(c, t, cam, { cast: S => {
    const h = huddleCast({ phone: o.phone, beckerExpr: bE });
    // reuse the huddle, but Noah sits right next to Becker
    const saved = HUDDLE.noah; HUDDLE.noah = [3.05, 1.8]; h(S, t); HUDDLE.noah = saved;
  } });
}
// 275.85–278.06 "Du flüsterst Frau Becker den Plan ins Ohr."
shot(275.85, 278.06, (c, lt, t) => {
  const cam = lookAt([3.3, 1.15, 2.8], [3.3, 1.0, 1.78], { fov: 44 });
  classDark(c, t, cam, { cast: S => { const sv = HUDDLE.noah; HUDDLE.noah = [3.1, 1.8]; huddleCast({ noahExpr: { brow: 'angry', mouth: Math.sin(t * 14) > 0 ? 'o' : 'soft', look: 1 }, beckerExpr: { brow: 'worried', mouth: 'flat', look: -.8 } })(S, t); HUDDLE.noah = sv; } });
  hudTag(c, t, 276.3, 380, 150, 'psst …', { size: 44 });
});
// 278.06–280.91 Sie schüttelt sofort den Kopf. „Auf gar keinen Fall.“
shot(278.06, 280.91, (c, lt, t) => {
  const cam = lookAt([3.55, 1.15, 2.75], [3.55, 1.05, 1.75], { fov: 46 });
  classDark(c, t, cam, { cast: S => { actor(S, BECK, (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, sit: true, seatH: 140, ink: 1.6, tilt: lt < 1.4 ? Math.sin(lt * 18) * .12 : 0, expr: { brow: 'angry', mouth: t > 279.5 && Math.sin(t * 10) > 0 ? 'o' : 'frown' }, arms: { l: { a: .5, b: -1.5 }, r: { a: .5, b: -1.5 } } }), { sit: true, depthY: .5 }); } });
  if (t > 279.5) hudTag(c, t, 279.55, W - 380, 170, 'Auf gar keinen Fall!', { size: 48, bar: '#d02a22' });
});
// 280.91–283.48 "Aber dann hört ihr es alle. Von unten." — everybody looks down at the floor, camera drops
shot(280.91, 283.48, (c, lt, t) => {
  const cam = lookAt([2.4, 1.5, 3.2], [2.4, .7, 1.6], camShake({ fov: 50 }, t, 2));
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { browUp: 1, mouth: 'o', lookY: 1 }, leaExpr: { browUp: 1, mouth: 'o', lookY: 1 }, jonasExpr: { browUp: 1, mouth: 'o', lookY: 1 }, beckerExpr: { browUp: 1, mouth: 'o', lookY: 1 } }) });
  hudTag(c, t, 282.56, W / 2, H - 140, '↓ von unten', { size: 50 });
});
// 283.48–286.14 "Jemand reißt an einer Tür. Bei den Kleinen." — ground floor: the 5a door handle rattles, kids cover their ears
shot(283.48, 286.14, (c, lt, t) => {
  const cam = lookAt([6.8, 1.2, 5.3], [8.9, 1.05, 7.0], camShake({ fov: 40 }, t, 3));
  classroomFrame(c, t, cam, { sunA: .25, deskMove: deskToDoor(1), clock: [10, 24, 0], doorHandle: Math.abs(Math.sin(t * 14)) * .9, cast: S => {
    [[7.3, 5.6], [7.0, 5.1], [7.7, 5.0]].forEach(([x, z], i) => actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, i % 2 ? CAST.kid5a : CAST.kid5b, { k: kk, sit: true, seatH: 90, ink: 1.6, expr: { brow: 'worried', mouth: 'wobbly', eyes: 'closed' }, arms: { l: { a: 2.2, b: 1.2 }, r: { a: 2.2, b: 1.2 } } }), { sit: true, depthY: .4, scale: .82 }));
  } });
  classAlarm(c, t, .6); vignette(c, .6);
  hudTag(c, t, 283.6, 330, 150, 'Erdgeschoss', { size: 44 }); if (Math.sin(t * 14) > .6) hudTag(c, t, 283.8, W - 360, 300, 'RATTER!', { size: 60, tilt: .08 });
});
// 286.14–288.49 "Frau Becker guckt dich an. Lange." — shot / reverse shot, slow
shot(286.14, 287.4, (c, lt, t) => {
  const cam = lookAt([3.0, 1.15, 2.7], [3.55, 1.05, 1.75], { fov: 44 });
  classDark(c, t, cam, { cast: huddleCast({ beckerExpr: { brow: 'worried', mouth: 'flat', look: -.9 } }) });
});
shot(287.4, 288.49, (c, lt, t) => {
  const cam = lookAt([2.85, 1.15, 2.75], [2.35, 1.05, 1.9], { fov: 44 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { brow: 'angry', mouth: 'flat', look: .9 } }) });
});
// 288.49–293.02 "Dann guckt sie zur hinteren Tür. Raum 204 hat nämlich eine zweite Tür." — pan to the grey steel door + Notausgang sign
shot(288.49, 293.02, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.6)), cam = lookAt([3.0, 1.3, 2.9], V.lerp([3.55, 1.0, 1.75], [0, 1.4, .8], k), { fov: lerp(44, 38, k) });
  classDark(c, t, cam, { cast: huddleCast({ beckerExpr: { brow: 'worried', mouth: 'flat', look: -1 } }) });
  const ep = proj(cam, [.02, 2.4, .8]); if (ep) glow(c, ep[0], ep[1], 300, '40,220,120', .5);
  hudTag(c, t, 291.5, W - 400, 170, 'zweite Tür', { size: 50, bar: '#1f9a52' });
});
// 293.02–298.27 "Raus auf die Feuertreppe. An der Außenwand runter, direkt auf den Hof. Weg vom Gebäude. Weg von ihm." — outside, crane down the fire escape
shot(293.02, 298.27, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 5.2)), cam = lookAt([lerp(-9, -10, k), lerp(9.5, 2.2, k), -9], [lerp(-15, -11, k), lerp(7.5, .8, k), -1.2], { fov: 48 });
  exteriorFrame(c, t, cam, { tod: 'alarm', alarm: 1, clock: [10, 25, 0] });
  const bp = proj(cam, [4, 9.4, -.4]); alarmGrade(c, t, .5, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .5);
  // dashed route overlay along the stairs
  const route = [[-15.2, 7.0, -1.4], [-12, 4.0, -1.4], [-15.2, 3.5, -1.4], [-10.4, .3, -1.4], [-8, .1, -4], [-4, .1, -6]].map(p => proj(cam, p)).filter(Boolean);
  if (route.length > 1) dashedPath(c, route.map(p => [p[0], p[1]]), seg(lt, .3, 4.6), '#2fd07a', null);
  hudTag(c, t, 293.6, 360, 150, 'Feuertreppe', { size: 50, bar: '#1f9a52' }); hudTag(c, t, 296.7, W - 360, 170, 'weg von ihm', { size: 48 });
});
// 298.27–303.60 "Sie sagt der Polizei am Telefon, was du vorhast. Kurze Pause. Dann nickt sie."
shot(298.27, 303.6, (c, lt, t) => {
  const cam = lookAt([3.3, 1.12, 2.7], [3.55, 1.02, 1.75], { fov: 40 });
  const nod = t > 302.55 ? Math.sin((t - 302.55) * 12) * .1 * (1 - seg(t, 302.55, 303.4)) : 0;
  classDark(c, t, cam, { cast: S => { actor(S, BECK, (cc, kk) => { drawPerson(cc, CAST.becker, { k: kk, sit: true, seatH: 140, ink: 1.6, tilt: nod, bob: nod * 40, expr: { brow: 'worried', mouth: t < 301.4 && Math.sin(t * 12) > 0 ? 'soft' : 'flat', look: t > 302 ? -.8 : .2 }, arms: BECKER_PHONE }); phoneInHand(cc, kk); }, { sit: true, depthY: .5 }); } });
  if (t > 301.54 && t < 302.6) hudTag(c, t, 301.6, W / 2, 150, '…', { size: 60 });
});
// 303.60–308.35 „Du gehst nur außen rum. Und wenn irgendwas komisch ist, rennst du weg. Versprochen?“ — close, finger raised
shot(303.6, 308.35, (c, lt, t) => {
  const cam = lookAt([2.95, 1.18, 2.7], [3.45, 1.05, 1.75], { fov: 50 });
  classDark(c, t, cam, { cast: S => { actor(S, BECK, (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, sit: true, seatH: 140, ink: 1.6, expr: { brow: 'worried', browUp: .2, mouth: Math.sin(t * 10) > 0 ? 'o' : 'flat', look: -.6 }, arms: { r: { a: 1.6, b: 1.0 }, l: { a: .5, b: -1.5 } } }), { sit: true, depthY: .5 }); } });
  if (t > 307.4) hudTag(c, t, 307.5, W - 360, 170, 'Versprochen?', { size: 50 });
});
// 308.35–309.34 „Versprochen.“ — Noah, determined nod
shot(308.35, 309.34, (c, lt, t) => {
  const cam = lookAt([2.65, 1.15, 2.75], [2.35, 1.05, 1.9], { fov: 44 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { brow: 'angry', mouth: 'soft', look: .6 } }) });
  hudTag(c, t, 308.4, 360, 150, 'Versprochen.', { size: 50, bar: '#2f6fb0' });
});
