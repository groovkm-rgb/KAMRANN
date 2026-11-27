// ======================= Bölüm 9: Tuzak (398.68 – 479.38) =======================
const NOAH_HIDE = [3.75, 0, 1.0];
function gymAtt(S, p, opts, o = {}) { actor(S, p, (cc, kk) => drawAttacker(cc, Object.assign({ k: kk }, opts)), { lit: Object.assign({}, ATT_LIT, { rim: '255,225,170', light: [-1, -.5] }), shadowOpt: { skew: .9, squash: .25, alpha: .45 } }); }
function noahHiding(S, e, o = {}) { actor(S, NOAH_HIDE, (cc, kk) => socks(() => drawNoah(cc, { k: kk, sit: true, seatH: 110, ink: 1.8, expr: e, arms: o.arms || { l: { a: .5, b: -1.5 }, r: { a: .5, b: -1.5 } } })), { sit: true, depthY: .45 }); }
const ATT_ENTER = t => [lerp(7.6, 7.9, seg(t, 415.1, 416.6)), 0, lerp(-.6, 4.5, seg(t, 415.1, 420.5))]; // walking in
const ATT_MID = [8, 0, 13];
function attPos(t) { if (t < 420.5) return ATT_ENTER(t); const u = seg(t, 420.5, 422.3); return [lerp(7.9, ATT_MID[0], u), 0, lerp(4.5, ATT_MID[2], u)]; }

// 398.68–401.52 "Im Treppenhaus. Eine schwarze Gestalt." — low angle, backlit on the landing
shot(398.68, 401.52, (c, lt, t) => {
  const cam = lookAt([3.6, .6, .5], [1.0, 2.6, 3.0], { fov: 54 });
  stairwellFrame(c, t, cam, { alarm: 1, cast: S => attackerAt(S, [1.0, .16 * 6, 2.5], { view: 'side', s: -1 }) });
  const bp = proj(cam, [4.3, 6.2, 2.5]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .6);
});
// 401.52–403.81 "Sie hebt den Kopf, als würde sie lauschen." — the hood tilts up towards the speaker
shot(401.52, 403.81, (c, lt, t) => {
  const cam = lookAt([2.4, 1.6, 1.0], [1.0, 2.4, 2.5], { fov: 36 });
  stairwellFrame(c, t, cam, { alarm: 1, cast: S => attackerAt(S, [1.0, .16 * 6, 2.5], { view: 'side', s: -1, headTurn: -easeIO(seg(lt, .2, 1.4)) * .3 }) });
  const bp = proj(cam, [4.3, 6.2, 2.5]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .6);
  c.save(); for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i / 3) % 1; c.beginPath(); c.arc(W * .85, 120, 40 + ph * 300, 0, TAU); c.lineWidth = 5 * (1 - ph); c.strokeStyle = `rgba(255,230,200,${(1 - ph) * .7})`; c.stroke(); } c.restore();
});
// 403.81–405.30 "Dann dreht sie sich um."
shot(403.81, 405.3, (c, lt, t) => {
  const cam = lookAt([3.6, .6, .5], [1.0, 2.6, 3.0], { fov: 54 });
  stairwellFrame(c, t, cam, { alarm: 1, cast: S => attackerAt(S, [1.0, .16 * 6, 2.5], { view: lt < .6 ? 'side' : 'back', s: -1 }) });
  const bp = proj(cam, [4.3, 6.2, 2.5]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .6);
});
// 405.30–409.34 "Und geht raus. Über den Hof. Direkt auf die Turnhalle zu." — across the empty yard, towards the open steel door
shot(405.3, 409.34, (c, lt, t) => {
  const u = seg(lt, 0, 4), p = [lerp(1.5, 9.5, u), 0, lerp(-3, -30, u)];
  const cam = lookAt([-6, 2.4, -5], [lerp(2, 10, u), 1.2, lerp(-8, -30, u)], { fov: 44 });
  yardAlarm(c, t, cam, S => attackerAt(S, p, { view: 'back', armL: Math.sin(t * 3.6) * .12, armR: -Math.sin(t * 3.6) * .12 }));
  hudTag(c, t, 407.4, W - 330, 170, '→ Turnhalle', { size: 50, bar: '#d02a22' });
});
// 409.34–412.58 "Du schleichst die Treppe runter und drückst dich in die dunkle Ecke neben dem Eingang."
shot(409.34, 412.58, (c, lt, t) => {
  const u = seg(lt, 0, 2.3), p = lt < 2.3 ? [lerp(13.7, 15.9, u), lerp(3.3, .1, u), .55] : [lerp(15.9, 3.75, seg(lt, 2.3, 3.2)), 0, lerp(.55, 1.0, seg(lt, 2.3, 3.2))];
  const cam = lookAt([10, 2.5, 9], [p[0], p[1] + .6, p[2]], { fov: 50 });
  gymFrame(c, t, cam, { door: 1, cast: S => actor(S, p, (cc, kk) => socks(() => drawNoahSide(cc, { k: kk, s: lt < 2.3 ? 1 : -1, ink: 1.8, walk: t * 6, tilt: .15, armSwing: .2, expr: { brow: 'angry', mouth: 'flat' } })), {}) }); vignette(c, .45);
});
// 412.58–415.12 "Hinter einen Stapel Turnmatten." — POV from behind the mats towards the door
shot(412.58, 415.12, (c, lt, t) => {
  const cam = lookAt([2.9, 1.2, 2.5], [7.6, 1.1, -.2], { fov: 56 });
  gymFrame(c, t, cam, { door: 1, cast: S => noahHiding(S, { brow: 'worried', mouth: 'flat', look: 1 }) }); vignette(c, .55);
  hudTag(c, t, 413.4, 360, 150, 'Turnmatten', { size: 48, bar: '#3a5a9a' });
});
// 415.12–416.99 "Schritte. Er ist drin." — the doorway: his silhouette fills the light
shot(415.12, 416.99, (c, lt, t) => {
  const cam = lookAt([4.4, 1.0, 2.2], [7.6, 1.4, 0], { fov: 46 });
  gymFrame(c, t, cam, { door: 1, cast: S => gymAtt(S, attPos(t), { view: 'front' }, {}) }); vignette(c, .6);
});
// 416.99–419.87 "Er läuft an dir vorbei. Keine zwei Meter entfernt." — floor level past the mats; his boots go by
shot(416.99, 419.87, (c, lt, t) => {
  const cam = lookAt([3.5, .55, 2.0], [7.6, .8, 3.6], camShake({ fov: 52 }, t, 1));
  gymFrame(c, t, cam, { door: 1, cast: S => { gymAtt(S, attPos(t), { view: 'side', s: 1, walk: t * 3.4 }); } }); vignette(c, .6);
  hudTag(c, t, 418.3, W - 380, 160, '< 2 Meter', { size: 50, bar: '#d02a22' });
});
// 419.87–421.22 "Du hältst die Luft an." — ECU Noah, cheeks puffed, eyes wide
shot(419.87, 421.22, (c, lt, t) => {
  const cam = lookAt([3.75, 1.05, 1.75], [3.75, 1.0, 1.0], { fov: 34 });
  gymFrame(c, t, cam, { door: 1, cast: S => noahHiding(S, { brow: 'worried', mouth: 'flat', eyeScale: 1.15, shine: 1, sweat: 1 }) }); vignette(c, .6);
});
// 421.22–424.70 "Mitten in der Halle bleibt er stehen. Dreht sich einmal im Kreis." — bird's eye: he turns in the light stripes
shot(421.22, 424.7, (c, lt, t) => {
  const cam = makeCam({ pos: [8, 7.2, 10.5], yaw: 0, pitch: -1.35, fov: 80 });
  const turn = seg(t, 422.9, 424.4), views = ['back', 'side', 'front', 'side', 'back'], v = views[Math.floor(turn * 4.99)];
  gymFrame(c, t, cam, { door: 1, cast: S => gymAtt(S, attPos(t), { view: v, s: turn < .5 ? 1 : -1 }) }); vignette(c, .5);
});
// 424.70–428.15 "Die Halle ist leer. Nur die Sonnenstreifen auf dem Boden." — wide, very still
shot(424.7, 428.15, (c, lt, t) => {
  const cam = lookAt([14.5, 3.2, 24], [6, .5, 8], { fov: 56 });
  gymFrame(c, t, cam, { door: 1, cast: S => gymAtt(S, ATT_MID, { view: 'side', s: -1 }) }); vignette(c, .45);
});
// 428.15–430.37 "Und genau in diesem Moment …" — slow push on Noah behind the mats; silence
shot(428.15, 430.37, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.2)), cam = lookAt([3.75, 1.05, lerp(2.6, 1.85, k)], [3.75, 1.0, 1.0], { fov: 40 });
  gymFrame(c, t, cam, { door: 1, cast: S => noahHiding(S, { brow: 'worried', mouth: 'flat', look: 1 }) }); vignette(c, .55 + k * .15);
});
// phone insert: vibrating in the trouser pocket / then the screen "Frau Becker"
function phoneInsert(c, t, lt, o = {}) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a4e48'); g.addColorStop(1, '#3a322e'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) line(c, [i * 150, 0, i * 150 - 80, H], 6, '#8e837c');
  const v = Math.sin(t * 70) * (o.vibe ? 10 : 0), z = o.zoom || 1;
  c.save(); c.translate(W / 2 + v, H / 2); c.scale(z, z); c.rotate(-.08);
  if (o.pocket) { c.fillStyle = '#4a3f3a'; rrect(c, -360, -440, 720, 880, 60); c.fill(); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); }
  c.fillStyle = '#16181c'; rrect(c, -190, -360, 380, 720, 50); c.fill(); c.lineWidth = 10; c.strokeStyle = OUT; c.stroke();
  const sg = c.createLinearGradient(0, -330, 0, 330); sg.addColorStop(0, '#2f4f86'); sg.addColorStop(1, '#5a8fd0'); c.fillStyle = sg; rrect(c, -165, -330, 330, 660, 34); c.fill();
  circle(c, 0, -120, 80); c.fillStyle = '#2f8a8a'; c.fill(); txt(c, 'FB', 0, -100, 64, '#fff', 'center');
  txt(c, 'Frau Becker', 0, 20, 44, '#fff', 'center'); txt(c, 'ruft an …', 0, 70, 30, '#cfe0ef', 'center');
  circle(c, -90, 230, 46); c.fillStyle = '#d02a22'; c.fill(); circle(c, 90, 230, 46); c.fillStyle = '#3d8a4f'; c.fill();
  if (o.vibe) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) line(c, [s * (230 + i * 30), -60 + i * 40, s * (250 + i * 30), -20 + i * 40], 8, '#ffe36a');
  c.restore(); vignette(c, .55);
}
// 430.37–431.67 "… vibriert dein Handy." — dolly zoom on the buzzing phone (dry tick-tick, no hum)
shot(430.37, 431.67, (c, lt, t) => { phoneInsert(c, t, lt, { vibe: true, pocket: true, zoom: 1.1 + easeOut(seg(lt, 0, 1.2)) * .25 }); hudTag(c, t, 430.5, W - 360, 170, 'tick-tick-tick', { size: 50, bar: '#ffe36a' }); });
// 431.67–435.21 "Frau Becker. Natürlich ruft sie genau jetzt an." — the screen, Noah fumbles for the button
shot(431.67, 433.4, (c, lt, t) => { phoneInsert(c, t, lt, { vibe: true, zoom: 1.0 }); });
shot(433.4, 435.21, (c, lt, t) => {
  const cam = lookAt([3.75, 1.05, 1.9], [3.75, .95, 1.0], camShake({ fov: 40 }, t, 2));
  gymFrame(c, t, cam, { door: 1, cast: S => noahHiding(S, { brow: 'worried', mouth: 'gasp', open: .5, eyeScale: 1.1, sweat: 1 }, { arms: { l: { a: .6, b: -1.8 }, r: { a: .8, b: -2.1 } } }) }); vignette(c, .6);
  hudTag(c, t, 433.5, 360, 150, 'natürlich jetzt …', { size: 46 });
});
// 435.21–438.48 "In der leeren Halle klingt das leise Brummen wie ein Presslufthammer." — the buzz rings out over the whole hall
shot(435.21, 438.48, (c, lt, t) => {
  const cam = lookAt([12, 4.5, 18], [5, .5, 3], { fov: 52 });
  gymFrame(c, t, cam, { door: 1, cast: S => { gymAtt(S, ATT_MID, { view: 'side', s: -1 }); noahHiding(S, { brow: 'worried', mouth: 'flat' }); } });
  const p = proj(cam, [3.75, .5, 1.0]); if (p) { c.save(); for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i / 5) % 1; c.beginPath(); c.ellipse(p[0], p[1], 30 + ph * 900, 10 + ph * 330, 0, 0, TAU); c.lineWidth = 7 * (1 - ph); c.strokeStyle = `rgba(255,227,106,${(1 - ph) * .9})`; c.stroke(); } c.restore(); }
  vignette(c, .5); hudTag(c, t, 436.6, W - 380, 160, 'wie ein Presslufthammer!', { size: 44, bar: '#e0663a' });
});
// 438.48–439.96 "Der Mann erstarrt." — freeze on him, hard shadow
shot(438.48, 439.96, (c, lt, t) => {
  const cam = lookAt([9.8, 1.4, 16.2], [8, 1.5, 13], { fov: 36 });
  gymFrame(c, t, cam, { door: 1, cast: S => gymAtt(S, ATT_MID, { view: 'side', s: -1 }) }); vignette(c, .6);
  c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.6)'; c.fillRect(0, 0, W, H); c.restore();
});
// 439.96–442.92 "Langsam dreht er den Kopf. In deine Richtung." — dolly zoom; the hood turns to camera, only darkness inside
shot(439.96, 442.92, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.9)), d = lerp(5.5, 2.2, k), dir = V.norm([-.55, 0, -1]), tgt = [8, 1.8, 13];
  const cam = lookAt(V.add(tgt, V.mul(dir, d)), tgt, { fov: lerp(20, 50, k) });
  gymFrame(c, t, cam, { door: 1, cast: S => gymAtt(S, ATT_MID, { view: k > .5 ? 'front' : 'side', s: -1, headTurn: k > .5 ? 0 : -.2 }) }); vignette(c, .65);
});
// 442.92–448.38 "Und dann, oben am Fenster, flattert eine Taube auf. Klatscht mit den Flügeln gegen die Scheibe."
function pigeon(c, x, y, s, t, flap) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const w = Math.sin(t * (flap ? 30 : 3)) * (flap ? 1 : .1);
  c.fillStyle = '#8a929e'; c.strokeStyle = OUT; c.lineWidth = 4;
  for (const sd of [-1, 1]) { c.save(); c.scale(sd, 1); c.rotate(-.3 - w * .9); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(60, -40, 120, -10); c.lineTo(110, 10); c.lineTo(90, 6); c.lineTo(80, 22); c.lineTo(60, 14); c.quadraticCurveTo(30, 20, 0, 12); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  c.beginPath(); c.ellipse(0, 10, 34, 44, 0, 0, TAU); c.fillStyle = '#9aa3ae'; c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -2, 22, 18, 0, 0, TAU); c.fillStyle = '#6aa08a'; c.fill();
  circle(c, 0, -40, 22); c.fillStyle = '#7d8590'; c.fill(); c.stroke(); circle(c, 8, -44, 5); c.fillStyle = '#e08a2a'; c.fill(); c.beginPath(); c.moveTo(18, -38); c.lineTo(34, -34); c.lineTo(18, -30); c.fillStyle = '#e8c070'; c.fill();
  c.restore();
}
shot(442.92, 448.38, (c, lt, t) => {
  const cam = lookAt([6, 3.0, 9], [.2, 6.0, 10.6], { fov: 40 });
  gymFrame(c, t, cam, { door: 1 });
  const wp = proj(cam, [.15, 5.9, 10.6]); if (wp) { const hit = t > 446.3 && t < 447.8; pigeon(c, wp[0] + (hit ? Math.sin(t * 40) * 30 : 0), wp[1] - (t > 444.8 ? 40 : 0), 1.4, t, t > 444.8); if (hit) { for (let i = 0; i < 8; i++) { const a = rnd(i) * TAU, r = (t - 446.3) * 300; c.save(); c.translate(wp[0] + Math.cos(a) * r, wp[1] + Math.sin(a) * r + (t - 446.3) * 120); c.rotate(a); c.fillStyle = '#e8ecf0'; c.beginPath(); c.ellipse(0, 0, 18, 6, 0, 0, TAU); c.fill(); c.restore(); } hudTag(c, t, 446.35, wp[0] + 260, wp[1] - 80, 'KLATSCH!', { size: 58 }); } }
  vignette(c, .5); if (t > 444.8) hudTag(c, t, 444.85, 360, 150, 'eine Taube', { size: 48 });
});
// 448.38–449.75 "Er reißt den Kopf hoch."
shot(448.38, 449.75, (c, lt, t) => {
  const cam = lookAt([9.2, 1.2, 15.5], [8, 2.0, 13], camShake({ fov: 38 }, t, lt < .3 ? 5 : 1));
  gymFrame(c, t, cam, { door: 1, cast: S => gymAtt(S, ATT_MID, { view: 'side', s: -1, headTurn: -easeOut(seg(lt, 0, .25)) * .45 }) }); vignette(c, .6);
});
// 449.75–451.67 "Eine Sekunde. Mehr hast du nicht." — Noah, eyes to the door, LED 00:01
shot(449.75, 451.67, (c, lt, t) => {
  const cam = lookAt([3.75, 1.05, 1.85], [3.75, 1.0, 1.0], { fov: 36 });
  gymFrame(c, t, cam, { door: 1, cast: S => noahHiding(S, { brow: 'angry', mouth: 'flat', look: 1 }) }); vignette(c, .6);
  hudClock(c, t, 449.9, W - 280, 150, '00:01', { size: 80 });
});
// 451.67–455.08 "Du springst raus. Die schwere Tür. Mit aller Kraft." — outside: Noah throws his weight against the steel door
shot(451.67, 453.38, (c, lt, t) => {
  const cam = lookAt([GX - 3.6, 1.2, GDZ + 1.1], [GX, 1.1, GDZ + 1.1], camShake({ fov: 50 }, t, 3));
  const nx = lerp(GX - .5, GX - 1.6, seg(lt, 0, 1.6)), nz = GDZ + lerp(1.0, .4, seg(lt, 0, 1.6));
  yardAlarm(c, t, cam, S => actor(S, [nx, 0, nz], (cc, kk) => socks(() => drawNoahSide(cc, { k: kk, s: -1, ink: 1.8, walk: t * 13, armSwing: .7, expr: { brow: 'angry', mouth: 'o' } })), {}), { door: 1 });
});
shot(453.38, 455.08, (c, lt, t) => {
  const cam = lookAt([GX - 3.2, 1.3, GDZ - 1.3], [GX, 1.2, GDZ + .9], camShake({ fov: 46 }, t, 2));
  yardAlarm(c, t, cam, S => actor(S, [GX - .45, 0, GDZ + 2.0 - lt * .5], (cc, kk) => socks(() => drawNoahSide(cc, { k: kk, s: 1, ink: 1.8, tilt: .3, armSwing: 0, expr: { brow: 'angry', mouth: 'grin' } })), {}), { door: 1 - easeIO(seg(lt, 0, 1.6)) });
  hudTag(c, t, 453.8, 360, 150, 'mit aller Kraft', { size: 48, bar: '#e0663a' });
});
// 455.08–455.81 "BAMM." — impact
shot(455.08, 455.81, (c, lt, t) => {
  const cam = lookAt([GX - 3.2, 1.3, GDZ + 1.1], [GX, 1.2, GDZ + 1.1], camShake({ fov: 46 }, t, 18 * (1 - seg(lt, 0, .5))));
  yardAlarm(c, t, cam, null, { door: 0 }); flashWhite(c, (1 - seg(lt, 0, .15)) * .9);
  hudTag(c, t, 455.08, W / 2, H / 2 - 40, 'BAMM!', { size: 150, tilt: -.05, bar: '#d02a22' });
});
// 455.81–457.81 "Schlüssel rein. Umdrehen. Klick." — key insert outside
shot(455.81, 457.81, (c, lt, t) => {
  const cam = lookAt([GX - 1.4, 1.2, GDZ - .8], [GX, 1.05, GDZ + .2], { fov: 34 });
  yardAlarm(c, t, cam, null, { door: 0 });
  const p = proj(cam, [GX - .05, 1.05, GDZ + .1]); if (p) { const turn = easeIO(seg(t, 456.6, 457.25)) * 1.5, ins = easeOut(seg(lt, 0, .4)); c.save(); c.translate(p[0], p[1]); circle(c, 0, 0, 40); fs(c, '#c9ced6', 5); c.rotate(turn); c.translate(0, -(1 - ins) * 120); c.fillStyle = '#d9c36a'; c.fillRect(-9, -120, 18, 120); c.beginPath(); c.arc(0, -150, 46, 0, TAU); fs(c, '#d9c36a', 5); c.restore();
    c.save(); c.translate(p[0] + 60, p[1] - 160); c.scale(2.0, 2.0); c.rotate(-1.4 + turn); noahHandLocal(c, 0); c.restore(); }
  vignette(c, .5); if (t > 457.23) hudTag(c, t, 457.25, W - 330, 170, 'Klick', { size: 60, bar: '#3d8a4f' });
});
// 457.81–458.56 "Zu."
shot(457.81, 458.56, (c, lt, t) => {
  const cam = lookAt([GX - 6, 1.6, GDZ + 1.1], [GX, 1.6, GDZ + 1.1], { fov: 44 });
  yardAlarm(c, t, cam, S => actor(S, [GX - .6, 0, GDZ + 2.6], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: { brow: 'angry', mouth: 'flat' } })), {}), { door: 0 });
  hudTag(c, t, 457.85, W / 2, 150, 'ZU.', { size: 70, bar: '#3d8a4f' });
});
// 458.56–461.68 "Von innen hämmert es gegen die Tür. Wieder und wieder." — the steel door shudders, dust falls
shot(458.56, 461.68, (c, lt, t) => {
  const hit = Math.max(0, Math.sin(t * 7)) ** 6, cam = lookAt([GX - 2.6, 1.3, GDZ + 1.1], [GX, 1.3, GDZ + 1.1], camShake({ fov: 50 }, t, hit * 6));
  yardAlarm(c, t, cam, S => actor(S, [GX - 1.8, 0, GDZ + 2.6], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: { browUp: 1, mouth: 'gasp', open: .5 }, lean: -.05 })), {}), { door: 0 });
  if (hit > .3) { hudTag(c, t, t - .01, 1300, 360 + rnd(Math.floor(t * 7)) * 200, 'BUMM', { size: 60 + hit * 30, tilt: (rnd(Math.floor(t * 7)) - .5) * .3 }); }
});
// 461.68–467.18 "Aber die Tür ist aus Stahl. Die Hintertüren sind verriegelt. Und die Fenster sind vier Meter hoch."
shot(461.68, 463.24, (c, lt, t) => { const cam = lookAt([GX - 1.2, 1.4, GDZ + 1.1], [GX, 1.4, GDZ + 1.1], { fov: 40 }); yardAlarm(c, t, cam, null, { door: 0 }); hudTag(c, t, 461.8, W / 2, 160, 'Stahl', { size: 66, bar: '#7d8590' }); });
shot(463.24, 464.79, (c, lt, t) => { const cam = lookAt([8, 1.5, 23.5], [7.8, 1.3, 28], { fov: 46 }); gymFrame(c, t, cam, { door: 0, beamA: .7 }); vignette(c, .5); hudTag(c, t, 463.4, W / 2, 160, 'verriegelt', { size: 60, bar: '#d02a22' }); });
shot(464.79, 467.18, (c, lt, t) => {
  const cam = lookAt([GX - 10, 1.8, GDZ + 2], [GX, 3.0, GDZ + 4], { fov: 48 });
  yardAlarm(c, t, cam, null, { door: 0 });
  const a = proj(cam, [GX - .1, 0, GDZ + 5]), b = proj(cam, [GX - .1, 5.2, GDZ + 5]); if (a && b) { const u = seg(lt, .2, 1.4); line(c, [a[0] - 40, a[1], a[0] - 40, lerp(a[1], b[1], u)], 6, '#ffe36a'); line(c, [a[0] - 60, a[1], a[0] - 20, a[1]], 6, '#ffe36a'); if (u >= 1) { line(c, [b[0] - 60, b[1], b[0] - 20, b[1]], 6, '#ffe36a'); hudTag(c, t, 466.0, a[0] - 200, (a[1] + b[1]) / 2, '4 Meter', { size: 52, bar: '#ffe36a' }); } }
});
// 467.18–468.73 "Er sitzt in der Falle." — the plan: FALLE stamped on the gym
shot(467.18, 468.73, (c, lt, t) => {
  floorPlan(c, t, 467.0, { falle: true, locks: true, lockFront: true, red: 1, notes: [{ t: 467.3, circle: [1320, 660], r: 170 }, { t: 467.6, text: 'FALLE', x: 1320, y: 800, size: 72 }] });
});
// 468.73–472.47 "Du rutschst mit dem Rücken an der Tür runter. Deine Beine sind wie Pudding."
shot(468.73, 472.47, (c, lt, t) => {
  const s = easeIO(seg(lt, 0, 1.6)), cam = lookAt([GX - 2.8, .9, GDZ - .2], [GX - .3, .7, GDZ + 1.1], { fov: 44 });
  yardAlarm(c, t, cam, S => actor(S, [GX - .35, 0, GDZ + 1.1], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, sit: s > .5, seatH: lerp(400, 60, s), bob: Math.sin(t * 25) * (lt > 2 ? 5 : 0), expr: { eyes: lt > 1.6 ? 'closed' : 'open', mouth: 'wobbly', browUp: .5 }, legs: [Math.sin(t * 30) * 10, Math.cos(t * 30) * 10] })), { sit: s > .5 }), { door: 0 });
  hudTag(c, t, 470.9, W - 330, 170, 'Pudding', { size: 54, bar: '#ffd84a' });
});
// 472.47–475.78 „Frau Becker? Er ist drin. Die Tür ist zu.“ — Noah on the phone, sitting against the door
shot(472.47, 475.78, (c, lt, t) => {
  const cam = lookAt([GX - 1.7, .85, GDZ + .4], [GX - .35, .75, GDZ + 1.1], { fov: 40 });
  yardAlarm(c, t, cam, S => actor(S, [GX - .35, 0, GDZ + 1.1], (cc, kk) => { socks(() => drawNoah(cc, { k: kk, ink: 1.8, sit: true, seatH: 60, expr: { brow: 'worried', mouth: Math.sin(t * 11) > 0 ? 'o' : 'soft', look: .4 }, arms: { r: { a: 1.0, b: 2.1 }, l: { a: .4, b: -1.4 } } })); phoneInHand(cc, kk); }, { sit: true }), { door: 0 });
});
// 475.78–479.38 "Am anderen Ende hörst du sie weinen. Und gleichzeitig lachen." — Becker in 204: tears and a laugh
shot(475.78, 479.38, (c, lt, t) => {
  const cam = lookAt([3.3, 1.12, 2.6], [3.55, 1.02, 1.75], { fov: 40 });
  const laugh = t > 477.8;
  classDark(c, t, cam, { cast: S => actor(S, BECK, (cc, kk) => { drawPerson(cc, CAST.becker, { k: kk, sit: true, seatH: 140, ink: 1.6, bob: laugh ? Math.abs(Math.sin(t * 16)) * -8 : 0, expr: laugh ? { eyes: 'closed', mouth: 'grin', brow: 'worried' } : { brow: 'worried', mouth: 'wobbly', eyes: 'closed' }, arms: BECKER_PHONE }); phoneInHand(cc, kk); cc.save(); cc.scale(kk, kk); for (const s of [-1, 1]) { const ty = -1180 + ((t * 300 + s * 50) % 260); cc.beginPath(); cc.ellipse(s * 92, ty, 14, 22, 0, 0, TAU); cc.fillStyle = '#9fd4ff'; cc.fill(); cc.lineWidth = 5; cc.strokeStyle = OUT; cc.stroke(); } cc.restore(); }, { sit: true, depthY: .5 }) });
});
