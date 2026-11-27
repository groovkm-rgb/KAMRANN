// ======================= Bölüm 4: Gölge (154.35 – 205.24) =======================
function corridorAlarm(c, t, cam, cast, o = {}) {
  const S = scene(cam, { dir: V.norm([.2, .8, -.5]), col: [190, 200, 255], amb: .45, ambCol: [80, 95, 160], ink: 1.2, inkA: .55 });
  corridorScene(S, c, t, Object.assign({ alarm: 1, dim: .5, flicker: i => i === 3 ? (rnd(Math.floor(t * 12)) > .6 ? .9 : .05) : .55, windowGlow: '170,190,255', noRefl: true }, o));
  if (cast) cast(S, t);
  flush(S, c);
  const bp = proj(cam, [.14, 2.4, 10]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1], br: 1300 } : {}); vignette(c, .6);
  return S;
}
const ATT_LIT = { rim: '170,200,255', rimA: .9, rimW: 4, rimInset: 2, shadeA: .45, light: [0, -1], warmA: 0, rimMode: 'source-over' };
function attackerAt(S, p, opts) { actor(S, p, (cc, kk) => drawAttacker(cc, Object.assign({ k: kk }, opts)), { lit: ATT_LIT, shadowOpt: { skew: 0, squash: .5, alpha: .55 } }); }
const classDark = (c, t, cam, o = {}) => { classroomFrame(c, t, cam, Object.assign({ sunA: .25, deskMove: deskToDoor(1), clock: o.clock || [10, 21, 0] }, o)); classAlarm(c, t, .55); vignette(c, .6); };

// 154.35–157.88 "Minuten vergehen. Die Zeit fühlt sich an wie Kaugummi." — the clock stretches like chewing gum
shot(154.35, 157.88, (c, lt, t) => {
  const tot = lerp(18 * 60, 21 * 60 + 30, seg(lt, 0, 3.5)), mm = Math.floor(tot / 60), ss = tot % 60;
  c.save(); const st = 1 + Math.sin(lt * 2.2) * .12; c.translate(W / 2, H / 2); c.transform(1 / st, 0, Math.sin(lt * 1.7) * .12, st, 0, 0); c.translate(-W / 2, -H / 2);
  clockECU(c, lt, [10, mm, ss], { zoom: .95 }); c.restore();
  classAlarm(c, t, .4); vignette(c, .5); hudClock(c, t, 154.5, W - 300, 140, `10:${String(mm).padStart(2, '0')} Uhr`);
  hudTag(c, t, 156.8, 360, 150, 'Kaugummi …', { size: 48, bar: '#ff9ec0' });
});
// 157.88–159.01 "Dann hörst du was." — Noah's eyes snap towards the door
shot(157.88, 159.01, (c, lt, t) => {
  const cam = lookAt([2.45, 1.12, 2.7], [2.35, 1.0, 1.9], { fov: 34 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { browUp: .9, look: lt > .3 ? 1 : 0, eyeScale: 1.1, shine: 1, mouth: 'flat' } }) });
});
// 159.01–162.22 "Schritte. Draußen auf dem Flur. Langsam." — floor level in the corridor: heavy boots, slow steps
shot(159.01, 162.22, (c, lt, t) => {
  const z = lerp(4.2, 8.8, seg(lt, 0, 3.2)), cam = lookAt([.6, .25, z + 2.6], [1.7, .3, z], { fov: 48 });
  corridorAlarm(c, t, cam, S => attackerAt(S, [1.7, 0, z], { view: 'side', s: -1, walk: t * 3.6 }));
  hudTag(c, t, 159.3, W - 330, 160, 'Schritte …', { size: 48 });
});
// 162.22–163.35 "Schwer." — ECU boot stomps, dust jumps
shot(162.22, 163.35, (c, lt, t) => {
  const cam = lookAt([.5, .45, 11.4], [1.7, .45, 9.6], camShake({ fov: 40 }, t, lt < .2 ? 6 : 1));
  corridorAlarm(c, t, cam, S => attackerAt(S, [1.75, 0, 9.6], { view: 'side', s: -1, walk: 1.2 + seg(lt, 0, .15) * .6 }));
});
// 163.35–164.69 "Sie kommen näher." — from the huddle: everybody stares at the door, desks piled up in front of it
shot(163.35, 164.69, (c, lt, t) => {
  const cam = lookAt([1.2, 1.45, .45], [8.4, 1.0, 6.9], { fov: 48 });
  classDark(c, t, cam, { cast: huddleCast() });
});
// 164.69–166.61 "Bleiben stehen. Direkt vor eurer Tür." — corridor: the figure stops at the 204 door, seen from far behind
shot(164.69, 166.61, (c, lt, t) => {
  const z = lerp(10.4, 11.6, easeOut(seg(lt, 0, .9))), cam = lookAt([2.2, 1.4, 24], [1.0, 1.2, 12], { fov: 34 });
  corridorAlarm(c, t, cam, S => attackerAt(S, [.75, 0, z], { view: 'back', armL: .05 }));
});
// 166.61–168.44 "Keiner atmet." — the huddle frozen, cheeks puffed
shot(166.61, 168.44, (c, lt, t) => {
  const cam = lookAt([2.4, 1.15, 2.85], [2.4, .98, 1.9], { fov: 48 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { brow: 'worried', mouth: 'flat', eyeScale: 1.05 }, leaExpr: { brow: 'worried', mouth: 'flat', eyes: 'closed' }, jonasExpr: { brow: 'worried', mouth: 'flat', eyeScale: 1.1 } }) });
});
// 168.44–172.21 "Durch das kleine Fenster in der Tür fällt ein Schatten. Nur ganz kurz." — POV past the desks: a shadow crosses the door pane
shot(168.44, 172.21, (c, lt, t) => {
  const cam = lookAt([6.4, .95, 4.3], [9, 1.5, 6.6], { fov: 36 });
  classDark(c, t, cam, {});
  const gp = projPoly(cam, [[8.96, 1.85, 6.7], [8.96, 1.85, 6.45], [8.96, 1.15, 6.45], [8.96, 1.15, 6.7]]);
  if (gp) { const u = seg(lt, 1.6, 2.6); c.save(); pathPoly(c, gp); c.clip(); const xs = gp.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), ys = gp.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const sx = lerp(x1 + 80, x0 - 80, u); c.fillStyle = 'rgba(5,5,10,.92)'; c.beginPath(); c.ellipse(sx, y0 + (y1 - y0) * .25, (x1 - x0) * .45, (y1 - y0) * .28, 0, 0, TAU); c.fill(); c.fillRect(sx - (x1 - x0) * .6, y0 + (y1 - y0) * .45, (x1 - x0) * 1.2, y1 - y0); c.restore(); }
  // the shadow also slides over the floor through the door gap
  const u = seg(lt, 1.6, 2.6); if (u > 0 && u < 1) { const fp = proj(cam, [8.9, 0, lerp(7.4, 6.4, u)]); if (fp) { c.save(); c.globalAlpha = .5 * bump(u, 0, 1); c.fillStyle = '#000'; c.beginPath(); c.ellipse(fp[0] - 60, fp[1], 120, 26, 0, 0, TAU); c.fill(); c.restore(); } }
});
// 172.21–174.46 "Eine Gestalt, ganz in Schwarz." — corridor: profile at the door, half in shadow, backlit
shot(172.21, 174.46, (c, lt, t) => {
  const cam = lookAt([2.9, 1.3, 14.6], [.8, 1.4, 12.2], { fov: 36 });
  corridorAlarm(c, t, cam, S => attackerAt(S, [.85, 0, 12.0], { view: 'side', s: -1 }));
});
// 174.46–175.55 "Schwarze Jacke." — detail: padded shoulder, zip, seams (half frame)
shot(174.46, 175.55, (c, lt, t) => {
  const cam = lookAt([1.85, 1.55, 13.4], [.85, 1.45, 12.0], { fov: 22 });
  corridorAlarm(c, t, cam, S => attackerAt(S, [.85, 0, 12.0], { view: 'front' }));
});
// 175.55–176.76 "Schwarze Handschuhe." — detail: the gloved hand hangs by the door frame
shot(175.55, 176.76, (c, lt, t) => {
  const cam = lookAt([1.6, .95, 12.8], [.75, .95, 12.0], { fov: 22 });
  corridorAlarm(c, t, cam, S => attackerAt(S, [.85, 0, 12.0], { view: 'front', armL: .1 + Math.sin(t * 3) * .03 }));
});
// 176.76–179.20 "Und über dem Gesicht eine schwarze Maske." — the hood from below; the opening is only darkness
shot(176.76, 179.2, (c, lt, t) => {
  const cam = lookAt([2.1, 1.2, 13.6], [.85, 1.9, 12.0], { fov: lerp(40, 32, seg(lt, 0, 2.4)) });
  corridorAlarm(c, t, cam, S => attackerAt(S, [.85, 0, 12.0], { view: 'front', headTurn: -.06 }));
});
// 179.20–182.50 "Die Türklinke bewegt sich. Ganz langsam nach unten." — inside: the handle goes down, dolly zoom on it
shot(179.2, 182.5, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.3)), h = [8.93, 1.05, 7.28], d = lerp(1.6, .55, k), fov = lerp(22, 52, k);
  const cam = lookAt([h[0] - d * .75, h[1] + .05, h[2] - d * .65], h, { fov });
  classroomFrame(c, t, cam, { sunA: .2, deskMove: deskToDoor(1), clock: [10, 22, 0], doorHandle: easeIO(seg(lt, .4, 3.1)) });
  classAlarm(c, t, .6); vignette(c, .6);
});
// 182.50–185.24 "Aber die Tür ist abgeschlossen. Die Tische halten." — handle springs back, desks rattle once
shot(182.5, 185.24, (c, lt, t) => {
  const cam = lookAt([6.9, 1.2, 5.0], [8.6, .9, 6.8], camShake({ fov: 44 }, t, lt < .4 ? 4 : .5));
  const rattle = lt < .5 ? Math.sin(lt * 60) * .02 : 0;
  classroomFrame(c, t, cam, { sunA: .2, clock: [10, 22, 5], doorHandle: lt < .2 ? 1 - lt * 5 : 0, deskMove: (i, x, z) => { const m = deskToDoor(1)(i, x, z); return m ? [m[0] + rattle, m[1]] : null; } });
  classAlarm(c, t, .6); vignette(c, .6);
  hudTag(c, t, 182.9, 420, 160, 'abgeschlossen', { size: 50, bar: '#3d8a4f' });
});
// 185.24–188.96 "Dann gehen die Schritte weiter. Werden leiser. Richtung Treppe." — corridor: he walks away towards the stairwell
shot(185.24, 188.96, (c, lt, t) => {
  const z = lerp(11.6, 3.2, seg(lt, 0, 3.7)), cam = lookAt([1.9, 1.5, 20], [1.4, 1.2, 4], { fov: 40 });
  corridorAlarm(c, t, cam, S => attackerAt(S, [1.5, 0, z], { view: 'back', armL: Math.sin(t * 3.6) * .12, armR: -Math.sin(t * 3.6) * .12 }));
  hudTag(c, t, 187.9, W - 360, 160, '→ Treppenhaus', { size: 46 });
});
// 188.96–192.19 Jonas flüstert: „Der geht runter. Zu den Kleinen.“
shot(188.96, 192.19, (c, lt, t) => {
  const cam = lookAt([2.55, 1.15, 2.6], [2.6, 1.0, 1.88], { fov: 50 });
  classDark(c, t, cam, { cast: huddleCast({ jonasExpr: { brow: 'worried', mouth: Math.sin(t * 9) > 0 ? 'o' : 'soft', look: -1 }, noahExpr: { brow: 'worried', mouth: 'flat', look: 1 } }) });
  hudTag(c, t, 189.3, 360, 150, 'psst …', { size: 42 });
});
// 192.19–195.69 "Im Erdgeschoss sind die Fünftklässler. Zehn, elf Jahre alt." — the stairwell, then the little ones
shot(192.19, 193.9, (c, lt, t) => {
  const cam = lookAt([3.8, 1.5, .4], [1.0, 1.3, 2.6], { fov: 54 });
  const st = 7 - Math.floor(lt * 3.2); stairwellFrame(c, t, cam, { alarm: 1, cast: S => attackerAt(S, [1.0, .16 * st, .6 + st * .3 + .15], { view: 'side', s: -1, walk: t * 3 }) });
  const bp = proj(cam, [4.3, 6.2, 2.5]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .6);
  hudTag(c, t, 192.3, 300, 150, 'Erdgeschoss', { size: 46 });
});
shot(193.9, 195.69, (c, lt, t) => {
  const cam = lookAt([4.5, 1.2, 3.3], [2.3, .8, 1.4], { fov: 52 });
  classroomFrame(c, t, cam, { sunA: .3, clock: [10, 22, 30], deskMove: deskToDoor(1), cast: S => {
    const list = [[1.4, 1.2], [1.9, 1.5], [2.4, 1.2], [2.9, 1.55], [3.4, 1.25], [1.6, 1.9], [2.2, 1.95], [2.8, 1.9]];
    list.forEach(([x, z], i) => actor(S, [x, 0, z], (cc, kk) => drawPerson(cc, i % 2 ? CAST.kid5a : CAST.kid5b, { k: kk, sit: true, seatH: 90, ink: 1.6, expr: { brow: 'worried', mouth: i % 3 ? 'wobbly' : 'flat', look: (i % 3 - 1) * .5 } }), { sit: true, depthY: .4, scale: .82 }));
  } });
  classAlarm(c, t, .55); vignette(c, .55); hudTag(c, t, 194.0, W - 330, 160, 'Klasse 5a', { size: 50, bar: '#5ab0d0' }); hudTag(c, t, 194.5, W - 330, 260, '10–11 Jahre', { size: 40 });
});
// 195.69–200.70 Frau Becker hält kurz das Handy zu: „Die Polizei ist unterwegs. Aber sie braucht noch ein paar Minuten.“
shot(195.69, 200.7, (c, lt, t) => {
  const cam = lookAt([3.2, 1.15, 2.75], [3.55, 1.0, 1.75], { fov: 44 });
  classDark(c, t, cam, { cast: huddleCast({ phone: true, beckerExpr: { brow: 'worried', mouth: t > 197.4 && Math.sin(t * 9) > 0 ? 'o' : 'flat', look: -.6 } }) });
  hudTag(c, t, 198.2, 380, 160, 'Polizei unterwegs', { size: 46, bar: '#2f4f86' });
});
// 200.70–202.69 "Ein paar Minuten. Klingt nach nichts." — LED countdown over the dark room
shot(200.7, 202.69, (c, lt, t) => {
  const cam = makeCam({ pos: [4.4, 8.6, 3.6], yaw: .1, pitch: -1.5, fov: 60 });
  classDark(c, t, cam, { cast: huddleCast() });
  const rem = 5 * 60 - Math.floor(lt * 2); hudClock(c, t, 200.8, W / 2, H / 2, `0${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, '0')}`, { size: 120 });
});
// 202.69–205.24 "Fühlt sich an wie eine Ewigkeit." — slow push on Noah, the world goes quiet and blue
shot(202.69, 205.24, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.55)), cam = lookAt([2.35, 1.12, lerp(3.3, 2.65, k)], [2.35, 1.02, 1.9], { fov: 42 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { brow: 'worried', mouth: 'flat', look: .2 } }) });
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(60,70,140,${k * .35})`; c.fillRect(0, 0, W, H); c.restore();
});
