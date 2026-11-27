// ======================= Bölüm 3: Alarm (94.25 – 154.35) =======================
// classroom under alarm: daylight dimmed, red strobe from the speaker corner
function classAlarm(c, t, k = 1, o = {}) { alarmGrade(c, t, k, { bx: o.bx ?? W * .92, by: o.by ?? 90, br: o.br ?? 1500 }); }
const SPEAKER = [8.12, 2.81, 7.79];
// announcement card: loudspeaker icon + animated waves + German lines appearing at their times
function speakerCard(c, t, t0, t1, lines, o = {}) {
  const a = clamp((t - t0) / .35) * clamp((t1 - t) / .3); if (a <= 0) return;
  const w = o.w || 980, h = 110 + lines.length * 74, x = o.x ?? (W - w) / 2, y = o.y ?? H - h - 90;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.translate(x + w / 2, y + h / 2); const s = .9 + .1 * easeBack(clamp((t - t0) / .35)); c.scale(s, s); c.translate(-(x + w / 2), -(y + h / 2));
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = 'rgba(18,20,30,.88)'; rrect(c, x, y, w, h, 26); c.fill(); c.shadowColor = 'transparent';
  c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.85)'; c.stroke(); c.fillStyle = '#d02a22'; rrect(c, x, y, w, 64, 26); c.fill(); c.fillRect(x, y + 34, w, 30);
  // speaker icon + waves
  const ix = x + 52, iy = y + 32; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(ix - 22, iy - 10); c.lineTo(ix - 8, iy - 10); c.lineTo(ix + 10, iy - 24); c.lineTo(ix + 10, iy + 24); c.lineTo(ix - 8, iy + 10); c.lineTo(ix - 22, iy + 10); c.closePath(); c.fill();
  for (let i = 0; i < 3; i++) { const ph = (t * 1.8 + i / 3) % 1; c.beginPath(); c.arc(ix + 10, iy, 14 + ph * 34, -.7, .7); c.lineWidth = 4; c.strokeStyle = `rgba(255,255,255,${1 - ph})`; c.stroke(); }
  txt(c, o.title || 'DURCHSAGE', x + 120, y + 44, 32, '#fff');
  lines.forEach(([s2, ts], i) => { const b = clamp((t - ts) / .25); if (b <= 0) return; c.globalAlpha = a * b; txt(c, s2, x + 40, y + 120 + i * 74, 48, '#fff'); });
  c.restore();
}
// checklist sticker (Frau Becker's orders)
function checklist(c, t, t0, items, o = {}) {
  const a = clamp((t - t0) / .3); if (a <= 0) return;
  const w = 640, h = 100 + items.length * 72, x = o.x ?? W - w - 60, y = o.y ?? 70;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x + w, y); c.rotate(.015); c.scale(easeBack(a), easeBack(a)); c.translate(-(x + w), -y);
  c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#fff'; rrect(c, x - 8, y - 8, w + 16, h + 16, 22); c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 4; c.strokeStyle = OUT; c.stroke();
  c.fillStyle = '#fbf6ea'; rrect(c, x, y, w, h, 16); c.fill(); c.fillStyle = '#2f8a8a'; rrect(c, x, y, w, 70, 16); c.fill(); c.fillRect(x, y + 40, w, 30);
  txt(c, 'Wie in der Übung', x + 30, y + 48, 36, '#fff');
  items.forEach(([s2, ts], i) => { const b = clamp((t - ts) / .2); if (b <= 0) return; const yy = y + 120 + i * 72; c.globalAlpha = b; c.fillStyle = '#fff'; rrect(c, x + 28, yy - 34, 40, 40, 8); c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); line(c, [x + 36, yy - 14, x + 46, yy - 2, x + 64, yy - 30], 6, '#3d8a4f'); txt(c, s2, x + 90, yy, 38, OUT); c.globalAlpha = 1; });
  c.restore();
}
function phoneInHand(c, k, side = 1) { c.save(); c.scale(k, k); c.translate(side * 360, -1060); c.rotate(-.2 * side); c.fillStyle = '#22252c'; rrect(c, -40, -80, 80, 160, 16); c.fill(); c.lineWidth = 10; c.strokeStyle = OUT; c.stroke(); c.fillStyle = '#5ab0ff'; rrect(c, -28, -64, 56, 120, 8); c.fill(); c.restore(); }
const BECKER_PHONE = { r: { a: 1.0, b: 2.1 }, l: { a: .3, b: -.8 } };
// huddle corner (back-left, in front of the cupboard)
const HUDDLE = { noah: [2.35, 1.9], jonas: [2.85, 1.85], lea: [1.85, 1.95], s1: [1.3, 1.05], s2: [3.2, 1.1], s3: [1.75, 1.2], s4: [2.6, 1.15], s5: [3.6, 1.15], s6: [1.2, 1.6], s7: [2.15, 1.5], becker: [3.55, 1.75] };
function huddleCast(o = {}) {
  return (S, t) => {
    const crouch = (n, P, e) => actor(S, [HUDDLE[n][0], 0, HUDDLE[n][1]], (cc, kk) => drawPerson(cc, P, { k: kk, sit: true, seatH: 110, ink: 1.6, bob: Math.sin(t * 30 + HUDDLE[n][0]) * (n === 'lea' && o.leaShake ? 6 : 0), expr: e, arms: { l: { a: .5, b: -1.5 }, r: { a: .5, b: -1.5 } } }), { sit: true, depthY: .45 });
    crouch('s1', CAST.student1, { brow: 'worried', mouth: 'flat' }); crouch('s3', CAST.student3, { brow: 'worried', mouth: 'wobbly' }); crouch('s6', CAST.student2, { brow: 'worried', mouth: 'flat' }); crouch('s7', CAST.student1, { brow: 'worried', mouth: 'flat', look: .5 });
    crouch('s2', CAST.student2, { brow: 'worried', mouth: 'flat' }); crouch('s4', CAST.student3, { brow: 'worried', mouth: 'flat' }); crouch('s5', CAST.student1, { brow: 'worried', mouth: 'flat' });
    crouch('lea', CAST.lea, o.leaExpr || { brow: 'worried', mouth: 'wobbly', look: .4 });
    crouch('jonas', CAST.jonas, o.jonasExpr || { brow: 'worried', mouth: 'flat' });
    actor(S, [HUDDLE.noah[0], 0, HUDDLE.noah[1]], (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: 110, ink: 1.8, expr: o.noahExpr || { brow: 'worried', mouth: 'flat', look: .6 }, arms: { l: { a: .5, b: -1.5 }, r: { a: .5, b: -1.5 } } }), { sit: true, depthY: .45 });
    actor(S, [HUDDLE.becker[0], 0, HUDDLE.becker[1]], (cc, kk) => { drawPerson(cc, CAST.becker, { k: kk, sit: true, seatH: 140, ink: 1.6, expr: o.beckerExpr || { brow: 'worried', mouth: 'soft', look: -.5 }, arms: o.phone ? BECKER_PHONE : { l: { a: .5, b: -1.5 }, r: { a: .5, b: -1.5 } } }); if (o.phone) phoneInHand(cc, kk * 1.0); }, { sit: true, depthY: .5 });
  };
}
const deskToDoor = p => (i, x, z) => { const col = i % 3, r = Math.floor(i / 3); let slot = -1; if (col === 2 && r <= 2) slot = r; else if (r === 3 && col < 2) slot = 3 + col; if (slot < 0) return null; const tgt = [[8.35, 6.95], [8.3, 6.25], [7.7, 7.35], [8.3, 5.55], [7.6, 5.9]][slot], u = easeIO(clamp(p * 1.4 - (slot % 3) * .2)); return [lerp(x, tgt[0], u), lerp(z, tgt[1], u)]; };

// 94.25–95.45 "10:17 Uhr." — the clock motif again, minute hand clicks
shot(94.25, 95.45, (c, lt, t) => {
  const sec = 59 + Math.floor(lt / .3); clockECU(c, lt, [10, sec >= 60 ? 17 : 16, sec >= 60 ? 0 : 59], { zoom: 1.2 + lt * .1, dx: -150, dy: 260 });
  hudClock(c, t, 94.4, W / 2, H - 150, '10:17 Uhr', { size: 90 }); vignette(c, .5);
});
// speaker on the wall: low angle, red strobe, sound rings
function speakerShot(c, t, lt, o = {}) {
  const cam = lookAt([7.0, 1.6, 6.2], SPEAKER, camShake({ fov: o.fov || 34 }, t, o.shake || 1.5));
  classroomFrame(c, t, cam, { sunA: .4, clock: [10, 17, 3] });
  const p = proj(cam, SPEAKER); if (p && o.rings) { c.save(); for (let i = 0; i < 3; i++) { const ph = ((t - (o.t0 || 0)) * 2 + i / 3) % 1; c.beginPath(); c.arc(p[0], p[1], 80 + ph * 520, 0, TAU); c.lineWidth = 10 * (1 - ph); c.strokeStyle = `rgba(255,${o.red ? 60 : 255},${o.red ? 40 : 255},${(1 - ph) * .8})`; c.stroke(); } c.restore(); }
  classAlarm(c, t, o.k ?? 1, p ? { bx: p[0], by: p[1], br: 1100 } : {}); vignette(c, .5);
}
// 95.45–97.23 "Ein schriller Ton. Drei kurze Signale."
shot(95.45, 97.23, (c, lt, t) => { speakerShot(c, t, lt, { rings: true, red: true, t0: 95.45 }); const n = Math.min(3, 1 + Math.floor((t - 96.64) / .26)); if (t > 96.64) hudTag(c, t, 96.64, 330, 150, '•'.repeat(n), { size: 64, bar: '#d02a22' }); });
// 97.23–98.97 "Pause." — the class, frozen, seen from the board
shot(97.23, 98.97, (c, lt, t) => {
  const cam = lookAt([4.4, 1.6, 7.3], [4.4, .9, 2.0], { fov: 56 });
  classroomFrame(c, t, cam, { sunA: .5, clock: [10, 17, 4], cast: classCast({ teacher: false, expr: { noah: { browUp: .8, mouth: 'o' }, jonas: { browUp: .8, mouth: 'o', eyeScale: 1.1 }, lea: { browUp: .8, mouth: 'o' } } }) });
  classAlarm(c, t, .55); vignette(c, .5); hudTag(c, t, 98.11, W / 2, 140, 'Pause …', { size: 48 });
});
// 98.97–100.05 "Wieder drei."
shot(98.97, 100.05, (c, lt, t) => { speakerShot(c, t, lt, { rings: true, red: true, t0: 98.97, fov: 28, shake: 3 }); });
// 100.05–101.32 "Alle gucken sich an." — pan across the faces, heads turning
shot(100.05, 101.32, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 1.27)), cam = lookAt([lerp(2.4, 6.0, k), 1.3, 6.2], [lerp(2.0, 6.4, k), .95, 2.8], { fov: 50 });
  const lk = Math.sin(t * 5);
  classroomFrame(c, t, cam, { sunA: .5, clock: [10, 17, 6], cast: classCast({ teacher: false, expr: { noah: { browUp: .6, look: lk, mouth: 'flat' }, jonas: { browUp: .6, look: -lk, mouth: 'flat' }, lea: { browUp: .6, look: lk, mouth: 'flat' } } }) });
  classAlarm(c, t, .55); vignette(c, .45);
});
// 101.32–102.61 "Jemand lacht nervös."
shot(101.32, 102.61, (c, lt, t) => {
  const cam = lookAt([6.5, 1.25, 4.0], [6.9, 1.05, 2.6], { fov: 40 });
  classroomFrame(c, t, cam, { sunA: .5, clock: [10, 17, 7], cast: S => actor(S, seatPos('s4'), (cc, kk) => drawPerson(cc, CAST.student1, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, bob: Math.abs(Math.sin(t * 22)) * -10, expr: { mouth: 'grin', eyes: 'closed', sweat: 1, brow: 'worried' }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true }) });
  classAlarm(c, t, .55); vignette(c, .45); hudTag(c, t, 101.6, 1340, 260, 'hehe …', { size: 44, tilt: .06 });
});
// 102.61–104.64 „Ist das 'ne Übung, oder was?“ — Jonas, 3/4, half-joking
shot(102.61, 104.64, (c, lt, t) => {
  const cam = lookAt([4.15, 1.25, 4.0], [4.7, 1.05, 2.6], { fov: 42 });
  classroomFrame(c, t, cam, { sunA: .5, clock: [10, 17, 9], cast: S => {
    actor(S, seatPos('jonas'), (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, expr: { mouth: Math.sin(t * 12) > 0 ? 'o' : 'soft', browUp: .5, look: -.6 }, arms: { l: { a: .35, b: -1.2 }, r: { a: 1.3, b: -1.0 } } }), { sit: true });
    actor(S, seatPos('noah'), (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H, ink: 1.8, expr: { brow: 'worried', mouth: 'flat', look: .7 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true });
  } });
  classAlarm(c, t, .5); vignette(c, .45);
});
// 104.64–106.11 "Dann knackt der Lautsprecher." — ECU speaker, crackle
shot(104.64, 106.11, (c, lt, t) => {
  speakerShot(c, t, lt, { fov: 20, k: .7, shake: .6 });
  if (lt > .2 && lt < .9) { c.save(); c.translate(W / 2 + 160, H / 2 - 120); for (let i = 0; i < 3; i++) { c.rotate(.9); line(c, [0, 0, 60, -20, 40, 30, 120, 10], 7, '#ffe36a'); } c.restore(); hudTag(c, t, 104.85, W / 2 + 330, H / 2 - 260, 'KNACK', { size: 60, tilt: .1 }); }
});
// principal's office: Frau Schröder at the PA console
function schroederShot(c, t, cam, o = {}) {
  officeFrame(c, t, cam, { onAir: true, cast: S => actor(S, [2.6, 0, 1.3], (cc, kk) => drawPerson(cc, CAST.schroeder, { k: kk, sit: true, seatH: 470, ink: 1.6, expr: o.expr || { mouth: Math.sin(t * 10) > 0 ? 'soft' : 'flat', look: .3 }, arms: { l: { a: .4, b: -1.3 }, r: { a: .4, b: -1.3 } } }), { sit: true }) });
  vignette(c, .4);
}
// 106.11–108.54 "Die Stimme der Schulleiterin, Frau Schröder."
shot(106.11, 108.54, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.4)), cam = lookAt([lerp(4.4, 3.8, k), 1.45, 3.6], [2.4, 1.0, 1.6], { fov: 46 });
  schroederShot(c, t, cam); hudTag(c, t, 106.9, 400, 150, 'Frau Schröder · Schulleiterin', { size: 44, bar: '#7a2f45' });
});
// 108.54–111.28 "Ganz ruhig. Fast zu ruhig." — close; calm face, but the hand on the desk trembles
shot(108.54, 111.28, (c, lt, t) => {
  const cam = lookAt([2.75, 1.25, 2.55], [2.6, 1.18, 1.3], { fov: 36 });
  schroederShot(c, t, cam, { expr: { mouth: Math.sin(t * 10) > 0 ? 'soft' : 'flat', brow: t > 109.5 ? 'worried' : 'arch', sweat: t > 109.6 ? 1 : 0 } });
});
// 111.28–118.45 the announcement — the class listens (bird's eye, slow rotation), announcement card
shot(111.28, 118.45, (c, lt, t) => {
  const a = lt * .04, cam = makeCam({ pos: [4.5 + Math.sin(a) * .4, 8.0, 3.8], yaw: a, pitch: -1.45, fov: 60 });
  classroomFrame(c, t, cam, { sunA: .4, clock: [10, 17, 30], cast: classCast({ expr: { noah: { browUp: .8, mouth: 'flat' }, jonas: { browUp: .8, mouth: 'flat' }, lea: { brow: 'worried', mouth: 'flat' } }, teacherPos: [6.0, 0, 7.1], teacherPose: { expr: { brow: 'worried', mouth: 'flat' } } }) });
  classAlarm(c, t, .6); vignette(c, .5);
  speakerCard(c, t, 111.2, 118.3, [['„Achtung. Das ist keine Übung.', 111.28], ['Alle bleiben in ihren Räumen.', 113.69], ['Türen abschließen.', 115.34], ['Weg von Fenstern und Türen.“', 116.45]]);
});
// 118.45–120.30 "Und dann wird es still." — wide, nothing moves; red light fades to a slow pulse
shot(118.45, 120.3, (c, lt, t) => {
  const cam = lookAt([8.4, 2.3, .6], [3.6, .95, 6.4], { fov: 60 });
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 17, 40], cast: classCast({ back: true, teacherPos: [6.0, 0, 7.1] }) });
  classAlarm(c, t, .45); vignette(c, .55);
});
// 120.30–123.79 "So still, dass du dein eigenes Herz klopfen hörst." — Noah ECU, the frame pulses with the heartbeat
shot(120.3, 123.79, (c, lt, t) => {
  const beat = Math.max(0, Math.sin(((t - 120.3) % .8) / .8 * Math.PI * 2)) ** 8, z = 1 + beat * .03;
  const cam = lookAt([4.0, 1.28, 2.6 + 1.05], [4.25, 1.22, 2.6], { fov: 36 / z });
  classroomFrame(c, t, cam, { sunA: .3, clock: [10, 17, 45], cast: S => actor(S, seatPos('noah'), (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H, ink: 1.8, expr: { brow: 'worried', mouth: 'flat', eyeScale: 1.08, shine: 1, sweat: t > 121.5 ? 1 : 0, sweatY: (t - 121.5) * 30 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true }) });
  classAlarm(c, t, .5); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(140,20,20,${beat * .35})`; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .55 + beat * .2);
});
// 123.79–125.51 "Frau Becker ist sofort an der Tür." — she hurries to the door (side view)
shot(123.79, 125.51, (c, lt, t) => {
  const bx = lerp(6.2, 8.55, easeOut(seg(lt, 0, 1.2))), cam = lookAt([6.6, 1.4, 4.6], [8.4, 1.1, 6.9], { fov: 50 });
  classroomFrame(c, t, cam, { sunA: .4, clock: [10, 17, 50], cast: S => actor(S, [bx, 0, 6.95], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, back: true, arms: { l: { a: .3 + Math.sin(t * 12) * .3 }, r: { a: .3 - Math.sin(t * 12) * .3 } } }), {}) });
  classAlarm(c, t, .55); vignette(c, .5);
});
// 125.51–127.19 "Schlüssel rein, umdrehen." — reuse the lock insert
shot(125.51, 127.19, (c, lt, t) => { SHOTS.find(s => s.t0 === 16.51).draw(c, lt * 1.03, 16.51 + lt * 1.03); });
// 127.19–128.81 "Dann dreht sie sich zu euch um." — she turns around (back -> front) by the door
shot(127.19, 128.81, (c, lt, t) => {
  const cam = lookAt([6.2, 1.25, 4.4], [8.4, 1.4, 6.95], { fov: 40 }), turned = lt > .7;
  classroomFrame(c, t, cam, { sunA: .4, clock: [10, 18, 0], cast: S => actor(S, [8.4, 0, 6.95], (cc, kk) => turned ? drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, expr: { brow: 'worried', mouth: 'flat' } }) : drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, back: true, s: lt > .5 ? .6 : 1 }), {}) });
  classAlarm(c, t, .55); vignette(c, .5);
});
// 128.81–130.84 "Du siehst ihr an, dass sie Angst hat."
shot(128.81, 130.84, (c, lt, t) => {
  const cam = lookAt([7.6, 1.75, 5.7], [8.4, 1.75, 6.95], { fov: lerp(36, 30, seg(lt, 0, 2)) });
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 18, 2], cast: S => actor(S, [8.4, 0, 6.95], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, bob: Math.sin(t * 40) * 3, expr: { brow: 'worried', mouth: 'wobbly', sweat: 1, sweatY: lt * 25, look: -.2 } }), {}) });
  classAlarm(c, t, .55); vignette(c, .55);
});
// 130.84–132.57 "Aber ihre Stimme ist fest." — she straightens, firm look, slight low angle
shot(130.84, 132.57, (c, lt, t) => {
  const cam = lookAt([7.5, 1.1, 5.6], [8.4, 1.7, 6.95], { fov: 36 });
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 18, 4], cast: S => actor(S, [8.4, 0, 6.95], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, expr: { brow: 'angry', mouth: 'flat' } }), {}) });
  classAlarm(c, t, .5); vignette(c, .5);
});
// 132.57–136.05 „Okay, Leute. Wie in der Übung. Tische vor die Tür.“ — Becker gives orders, checklist ticks
shot(132.57, 136.05, (c, lt, t) => {
  const cam = lookAt([5.2, 1.45, 3.6], [8.2, 1.3, 6.8], { fov: 48 });
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 18, 8], cast: S => { classCast({ teacher: false, expr: { noah: { brow: 'worried', mouth: 'flat', look: .8 }, jonas: { brow: 'worried', mouth: 'flat', look: .8 }, lea: { brow: 'worried', mouth: 'flat', look: .8 } } })(S, t); actor(S, [8.3, 0, 6.6], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, expr: { brow: 'angry', mouth: Math.sin(t * 9) > 0 ? 'o' : 'flat' }, arms: { r: { a: 1.4 + Math.sin(t * 3) * .2, b: -.2 } } }), {}); } });
  classAlarm(c, t, .5); vignette(c, .5);
  checklist(c, t, 132.9, [['Tische vor die Tür', 134.53], ['Alle nach hinten in die Ecke', 135.66], ['Handys auf lautlos', 137.07], ['Kein Wort', 139.3]]);
});
// 136.05–140.54 „Alle nach hinten in die Ecke. Handys auf lautlos. Und ab jetzt: kein Wort.“ — 3/4 on Becker, finger on the lips
shot(136.05, 140.54, (c, lt, t) => {
  const cam = lookAt([7.0, 1.6, 5.2], [8.3, 1.6, 6.6], { fov: 38 });
  const shh = t > 139.2;
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 18, 12], cast: S => actor(S, [8.3, 0, 6.6], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, expr: { brow: shh ? 'worried' : 'angry', mouth: shh ? 'soft' : (Math.sin(t * 9) > 0 ? 'o' : 'flat') }, arms: shh ? { r: { a: .55, b: 2.75 } } : { r: { a: 1.2, b: -.4 }, l: { a: .9, b: -.6 } } }), {}) });
  classAlarm(c, t, .5); vignette(c, .5);
  checklist(c, t, 132.9, [['Tische vor die Tür', 134.53], ['Alle nach hinten in die Ecke', 135.66], ['Handys auf lautlos', 137.07], ['Kein Wort', 139.3]]);
  if (shh) hudTag(c, t, 139.3, 520, 300, 'Psst!', { size: 60, tilt: -.06 });
});
// 140.54–142.01 "Ihr schiebt die Tische zusammen." — bird's eye: desks slide to the door
shot(140.54, 142.01, (c, lt, t) => {
  const cam = makeCam({ pos: [6.4, 7.5, 4.6], yaw: 0, pitch: -1.5, fov: 58 });
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 18, 20], deskMove: deskToDoor(seg(lt, 0, 1.4)), cast: S => {
    for (const [n, P, dx] of [['jonas', CAST.jonas, -.5], ['s3', CAST.student3, -.4], ['s4', CAST.student1, -.5]]) { const sp = SEATS[n], u = easeIO(seg(lt, 0, 1.4)); actor(S, [lerp(sp[0], 8.0, u * .8) + dx, 0, lerp(sp[1], 6.5, u * .8)], (cc, kk) => drawPerson(cc, P, { k: kk, ink: 1.6, back: true, arms: { l: { a: .9, b: -.5 }, r: { a: .9, b: -.5 } } }), {}); }
    actor(S, [lerp(4.27, 7.5, easeIO(seg(lt, 0, 1.4)) * .8) - .4, 0, lerp(2.6, 5.9, easeIO(seg(lt, 0, 1.4)) * .8)], (cc, kk) => drawNoahBack(cc, { k: kk, ink: 1.8, arms: { l: { a: .9, b: -.5 }, r: { a: .9, b: -.5 } } }), {});
  } });
  classAlarm(c, t, .55); vignette(c, .5);
});
// 142.01–145.23 "Das Quietschen auf dem Boden ist plötzlich das lauteste Geräusch der Welt." — floor level, desk legs scrape
shot(142.01, 145.23, (c, lt, t) => {
  const cam = lookAt([7.0, .18, 4.9], [8.3, .3, 6.6], camShake({ fov: 44 }, t, 1.5));
  classroomFrame(c, t, cam, { sunA: .35, clock: [10, 18, 24], deskMove: deskToDoor(.55 + seg(lt, 0, 3.2) * .45) });
  classAlarm(c, t, .55); vignette(c, .55);
  const q = Math.abs(Math.sin(t * 5)); if (q > .3) hudTag(c, t, 142.2, 1250 + Math.sin(t * 20) * 8, 330, 'QUIIIETSCH!', { size: 70 + q * 16, tilt: .05 + Math.sin(t * 13) * .03, bar: '#e0663a' });
});
// 145.23–148.81 "Dann hockt ihr alle hinten in der Ecke, ganz eng aneinander." — low wide on the huddle
shot(145.23, 148.81, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.5)), cam = lookAt([lerp(4.6, 4.2, k), 1.2, lerp(4.0, 3.6, k)], [2.3, .55, 1.4], { fov: 52 });
  classroomFrame(c, t, cam, { sunA: .3, clock: [10, 18, 40], deskMove: deskToDoor(1), cast: huddleCast() });
  classAlarm(c, t, .55); vignette(c, .55);
});
// 148.81–149.86 "Lea zittert."
shot(148.81, 149.86, (c, lt, t) => {
  const cam = lookAt([1.95, 1.12, 2.65], [1.85, .98, 1.95], { fov: 50 });
  classroomFrame(c, t, cam, { sunA: .3, clock: [10, 18, 45], deskMove: deskToDoor(1), cast: huddleCast({ leaShake: true, leaExpr: { brow: 'worried', mouth: 'wobbly', look: .2, sweat: 1 } }) });
  classAlarm(c, t, .5); vignette(c, .55);
});
// 149.86–151.68 "Jonas ist auf einmal hellwach." — quick zoom on Jonas, eyes wide
shot(149.86, 151.68, (c, lt, t) => {
  const z = easeOut(seg(lt, 0, .3)), cam = lookAt([2.95, 1.12, 2.6], [2.85, 1.0, 1.85], { fov: lerp(60, 40, z) });
  classroomFrame(c, t, cam, { sunA: .3, clock: [10, 18, 48], deskMove: deskToDoor(1), cast: huddleCast({ jonasExpr: { browUp: 1, eyeScale: 1.25, shine: 1, mouth: 'flat' } }) });
  classAlarm(c, t, .5); vignette(c, .55);
});
// 151.68–154.35 "Und Frau Becker flüstert schon mit der Polizei am Handy." — Becker crouched with the phone, call card
shot(151.68, 154.35, (c, lt, t) => {
  const cam = lookAt([3.15, 1.15, 2.6], [3.55, 1.0, 1.75], { fov: 52 });
  classroomFrame(c, t, cam, { sunA: .3, clock: [10, 18, 55], deskMove: deskToDoor(1), cast: huddleCast({ phone: true, beckerExpr: { brow: 'worried', mouth: Math.sin(t * 14) > .3 ? 'soft' : 'flat', look: .3 } }) });
  classAlarm(c, t, .5); vignette(c, .55);
  hudTag(c, t, 152.2, 400, 150, 'Notruf 110 · Polizei', { size: 46, bar: '#2f4f86' });
});
