// ======================= Bölüm 8: Sahte anons (352.9 – 398.68) =======================
// Noah at the mic inside the Technikraum (2D close set)
function noahAtMic(c, t, o = {}) {
  techRoomInterior(c, t, { onAir: o.onAir, level: o.level, faders: o.level, shake: o.shake || 0, micX: 1180 });
  const talk = o.talk ? (Math.sin(t * 13) > 0 ? 'o' : 'soft') : null;
  drawLit(c, cc => socks(() => drawNoah(cc, { x: 760, y: 1250, k: .62, ink: 1.8, bob: Math.sin(t * 30) * (o.tremble ? 4 : 0), expr: o.expr || { brow: 'angry', mouth: talk || 'flat', look: .8 }, arms: o.arms || { r: { a: .9, b: -1.7 }, l: { a: .3, b: -.3 } } })), { light: [1, -.4], bounds: [300, 0, 1250, 1080], rimInset: 12, rimW: 8, rimA: .4, rim: '255,120,100' });
  if (o.onAir) { c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,40,30,.08)'; c.fillRect(0, 0, W, H); c.restore(); }
  vignette(c, .45);
}
// 352.90–354.98 "Du kletterst hoch in den Technikraum." — Noah climbs the steel stairs (side), camera follows up
shot(352.9, 354.98, (c, lt, t) => {
  const u = seg(lt, 0, 2.08), p = [lerp(15.9, 13.7, u), lerp(.2, 3.3, u), .55];
  const cam = lookAt([p[0] - 1, p[1] + .6, 6], [p[0], p[1] + .5, .55], { fov: 50 });
  gymFrame(c, t, cam, { door: 1, cast: S => actor(S, p, (cc, kk) => socks(() => drawNoahSide(cc, { k: kk, s: -1, ink: 1.8, walk: t * 7, expr: { brow: 'angry', mouth: 'flat' } })), {}) }); vignette(c, .45);
});
// 354.98–356.27 "Ein altes Mischpult."
shot(354.98, 356.27, (c, lt, t) => { techRoomInterior(c, t, {}); vignette(c, .45); hudTag(c, t, 355.2, 360, 150, 'altes Mischpult', { size: 48 }); });
// 356.27–357.52 "Und das Mikrofon." — push in on the mic
shot(356.27, 357.52, (c, lt, t) => {
  const z = 1 + easeIO(seg(lt, 0, 1.25)) * .5; c.save(); c.translate(1520, 330); c.scale(z, z); c.translate(-1520, -330); techRoomInterior(c, t, {}); c.restore(); vignette(c, .5);
});
// 357.52–360.92 "Du schaltest es ein. Ein kleines rotes Licht geht an."
shot(357.52, 360.92, (c, lt, t) => {
  const on = t > 358.16; techRoomInterior(c, t, { onAir: on, level: on });
  // the switch on the desk (insert top right)
  c.save(); c.translate(1500, 820); rrect(c, -160, -80, 320, 160, 20); c.fillStyle = '#2a2d34'; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.save(); c.rotate(on ? .5 : -.5); rrect(c, -18, -90, 36, 90, 10); c.fillStyle = '#d8dce2'; c.fill(); c.stroke(); c.restore(); txt(c, on ? 'AN' : 'AUS', 0, 62, 36, on ? '#ff4a3a' : '#9aa0a8', 'center'); c.restore();
  if (on) { hudTag(c, t, 359.0, 360, 150, 'rotes Licht', { size: 48, bar: '#d02a22' }); }
  vignette(c, .45);
});
// 360.92–364.51 "Deine Hand zittert so sehr, dass du das Mikro kaum halten kannst." — insert: trembling hand on the mic
shot(360.92, 364.51, (c, lt, t) => {
  techRoomInterior(c, t, { onAir: true, micX: 1200 });
  const tr = Math.sin(t * 45) * 7; c.save(); c.translate(1150 + tr, 420 + tr * .6); c.scale(3, 3); c.rotate(-1.1); noahHandLocal(c, 0); c.restore();
  line(c, [1000 + tr, H + 60, 1110 + tr, 520], 170, OUT); line(c, [1000 + tr, H + 60, 1110 + tr, 520], 144, NOAH.skin);
  vignette(c, .5);
});
// 364.51–366.16 "Du atmest tief ein." — eyes closed, chest rises
shot(364.51, 366.16, (c, lt, t) => { noahAtMic(c, t, { onAir: true, expr: { eyes: 'closed', mouth: 'soft', browUp: .3 }, arms: { r: { a: .9, b: -1.7 } } }); });
// 366.16–373.60 "Jetzt musst du so erwachsen klingen wie noch nie… Nachrichtensprecher mit Halsschmerzen. Aber egal."
shot(366.16, 369.45, (c, lt, t) => { noahAtMic(c, t, { onAir: true, expr: { brow: 'angry', mouth: 'flat', look: .8 } }); hudTag(c, t, 366.9, 360, 150, 'erwachsen klingen!', { size: 48, bar: '#2f6fb0' }); });
shot(369.45, 373.6, (c, lt, t) => {
  noahAtMic(c, t, { onAir: true, expr: { brow: 'worried', mouth: t < 372 ? 'wobbly' : 'flat', look: .8, sweat: 1 } });
  hudTag(c, t, 370.9, W - 420, 170, 'Nachrichtensprecher', { size: 46 }); hudTag(c, t, 371.9, W - 420, 270, '… mit Halsschmerzen', { size: 42, bar: '#e0663a' });
  if (t > 372.87) hudTag(c, t, 372.9, 360, 150, 'egal!', { size: 54, bar: '#3d8a4f' });
});
// 374.20–383.64 the fake announcement — Noah speaks, the announcement card; cut to the plan with sound rings at 379
shot(374.2, 379.0, (c, lt, t) => {
  noahAtMic(c, t, { onAir: true, level: true, talk: true });
  speakerCard(c, t, 374.1, 383.6, [['„Achtung, Achtung.', 374.2], ['Hier spricht die Schulleitung.', 375.39], ['Alle Schülerinnen und Schüler', 376.95], ['gehen sofort in die Turnhalle.', 378.46]], { title: 'DURCHSAGE', y: 70, x: W - 1000 });
});
shot(379.0, 383.64, (c, lt, t) => {
  floorPlan(c, t, 378.6, { speaker: true, falle: true });
  speakerCard(c, t, 374.1, 383.6, [['„Ich wiederhole:', 380.31], ['Alle sofort in die Turnhalle.“', 381.3]], { title: 'DURCHSAGE', y: H - 330 });
});
// 383.64–386.17 "Deine Stimme hallt durch die ganze Schule." — the building, rings pulse out of every window
shot(383.64, 386.17, (c, lt, t) => {
  const cam = lookAt([0, 3, -32], [0, 6, 0], { fov: 56 });
  yardAlarm(c, t, cam, null);
  c.save(); c.globalCompositeOperation = 'screen'; for (const [x, y] of [[-12, 8.1], [-4, 8.1], [6, 4.6], [-10, 1.1], [12, 1.1]]) { const p = proj(cam, [x, y, 0]); if (!p) continue; for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i / 3 + x * .1) % 1; c.beginPath(); c.arc(p[0], p[1], 20 + ph * 260, 0, TAU); c.lineWidth = 6 * (1 - ph); c.strokeStyle = `rgba(255,230,200,${(1 - ph) * .8})`; c.stroke(); } } c.restore();
});
// 386.17–389.26 "Und in jedem Klassenzimmer passiert genau das Gleiche." — split montage: 204 and 5a
shot(386.17, 389.26, (c, lt, t) => {
  const camA = lookAt([3.2, 1.2, 2.9], [3.0, 1.0, 1.75], { fov: 50 });
  c.save(); c.beginPath(); c.rect(0, 0, W / 2 - 6, H); c.clip(); c.translate(-W / 4, 0); classDark(c, t, camA, { cast: huddleCast({ beckerExpr: { brow: 'worried', mouth: 'flat', look: .8 } }) }); c.restore();
  c.save(); c.beginPath(); c.rect(W / 2 + 6, 0, W / 2, H); c.clip(); c.translate(W / 4, 0); const camB = lookAt([4.5, 1.2, 3.3], [2.3, .8, 1.4], { fov: 52 });
  classroomFrame(c, t, camB, { sunA: .3, clock: [10, 30, 0], deskMove: deskToDoor(1), cast: S => { [[1.4, 1.2], [1.9, 1.5], [2.4, 1.2], [2.9, 1.55], [3.4, 1.25]].forEach(([x, z], i) => actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, i % 2 ? CAST.kid5a : CAST.kid5b, { k: kk, sit: true, seatH: 90, ink: 1.6, expr: { browUp: .8, mouth: 'o' } }), { sit: true, depthY: .4, scale: .82 })); actor(S, [3.9, 0, 1.6], (cc, kk) => drawPerson(cc, CAST.schroeder, { k: kk, sit: true, seatH: 140, ink: 1.6, expr: { brow: 'worried', mouth: 'flat', look: -.6 } }), { sit: true, depthY: .5 }); } });
  classAlarm(c, t, .5); c.restore();
  line(c, [W / 2, 0, W / 2, H], 12, '#111'); vignette(c, .5);
  hudTag(c, t, 386.4, 300, 150, 'Raum 204', { size: 44 }); hudTag(c, t, 386.7, W - 300, 150, 'Klasse 5a', { size: 44 });
});
// 389.26–391.05 "Die Lehrer gucken sich kurz an." — Frau Becker exchanges a look with a colleague? (204: she looks at the door, then at us)
shot(389.26, 391.05, (c, lt, t) => {
  const cam = lookAt([3.1, 1.15, 2.75], [3.55, 1.05, 1.75], { fov: 44 });
  classDark(c, t, cam, { cast: huddleCast({ beckerExpr: { brow: 'arch', browUp: .6, mouth: 'flat', look: lt < .9 ? -1 : .5 } }) });
});
// 391.05–393.90 "Und bleiben sitzen. Keiner macht die Tür auf." — corridor: every door stays shut, one after another
shot(391.05, 393.9, (c, lt, t) => {
  const cam = lookAt([1.7, 1.5, lerp(26, 18, seg(lt, 0, 2.85))], [1.7, 1.3, 2], { fov: 52 });
  corridorAlarm(c, t, cam, null);
  const n = Math.min(3, Math.floor(lt / .8) + 1); for (let i = 0; i < n; i++) hudTag(c, t, 391.2 + i * .8, [520, 1400, 960][i], [420, 460, 300][i], 'bleibt zu', { size: 40, bar: '#2f8a4a' });
});
// 393.90–395.20 "Weil sie es wissen." — Becker: a tiny knowing nod
shot(393.9, 395.2, (c, lt, t) => {
  const cam = lookAt([3.2, 1.15, 2.6], [3.55, 1.05, 1.75], { fov: 38 });
  classDark(c, t, cam, { cast: S => actor(S, BECK, (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, sit: true, seatH: 140, ink: 1.6, tilt: Math.sin(lt * 7) * .05, expr: { brow: 'angry', mouth: 'soft', look: -.4 } }), { sit: true, depthY: .5 }) });
});
// 395.20–398.68 "Nur an einer Stelle im ganzen Gebäude bleibt jemand stehen." — the plan: one red dot stops in the stairwell
shot(395.2, 398.68, (c, lt, t) => {
  floorPlan(c, t, 395.0, { closed: true, notes: [{ t: 396.6, circle: [410, 230], r: 70 }, { t: 397.4, text: 'Treppenhaus', x: 410, y: 380, size: 40 }] });
  const P = [W / 2 - 820 + 410, H / 2 - 440 + 230]; circle(c, P[0], P[1], 16 + Math.sin(t * 8) * 4); c.fillStyle = '#d02a22'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); glow(c, P[0], P[1], 70, '255,40,30', .7);
});
