// ---------------- the shots ----------------
// 0.00–2.95 OPENING: one continuous move from the front corner of Raum 204 straight into Noah's face.
// Sunny and calm first; at 1.62 the red alarm light bursts and the last stretch turns into a dolly zoom (vertigo).
shot(0, 2.95, (c, lt, t) => {
  const tA = 1.62, a = lt < tA ? 0 : seg(lt, tA, 2.95), fly = easeIO(seg(lt, 0, tA + .1));
  const head = [4.25, 1.22, 2.6];
  const start = [1.2, 2.7, 7.6], mid = [3.1, 1.5, 4.6];
  let pos = V.lerp(start, mid, fly), fov = 56, target = V.lerp([4.6, .9, 3.0], head, fly);
  if (lt >= tA) { const d = lerp(2.0, .72, easeOut(a)); pos = [head[0] - .6 * d, head[1] + .06, head[2] + .8 * d]; fov = lerp(30, 54, easeOut(a)); target = [head[0], head[1] - .04, head[2]]; }
  else { // blend the flight end onto the vertigo start so the cut is seamless
    const d0 = 2.0, endPos = [head[0] - .6 * d0, head[1] + .06, head[2] + .8 * d0], u = easeIO(seg(lt, .9, tA)); pos = V.lerp(pos, endPos, u); fov = lerp(56, 30, u); target = V.lerp(target, head, u);
  }
  const cam = lookAt(pos, target, camShake({ fov, roll: lt < tA ? Math.sin(lt * 2) * .02 : 0 }, t, lt < tA ? .8 : 5 + 7 * (1 - a)));
  const shock = lt >= tA, ex = shock ? { browUp: 1, mouth: 'gasp', open: .8, eyeScale: 1.15, shine: 1 } : { lid: .45, mouth: 'flat', look: .4 };
  classroomFrame(c, t, cam, { sunA: shock ? .25 : 1, clock: shock ? [10, 17, 0] : [10, 16, 58], cast: (S) => {
    classCast({ teacherPos: [3.0, 0, 7.3], teacherPose: { back: true, arms: { r: { a: 2.6, b: .2 }, l: { a: .1, b: -.2 } } }, expr: { noah: ex, jonas: shock ? { browUp: 1, mouth: 'o', eyeScale: 1.1 } : undefined } })(S, t);
  } });
  if (shock) { const pulse = Math.pow(Math.max(0, Math.sin(a * 1.6 * Math.PI * 2 + 1.2)), 2); redBurst(c, 1, .4 + .6 * pulse); flashWhite(c, (1 - seg(lt, tA, tA + .12)) * .9, '255,80,60'); vignette(c, .55); }
  else { gradeScreen(c, { sx: .05, sy: .1, warmA: .3, coolA: .2 }); vignette(c, .35); }
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
shot(19.48, 21.87, (c, lt, t) => {
  const cam = makeCam({ pos: [4.4, 9.5 - lt * .8, 3.6], yaw: 0, pitch: -1.5, roll: .05 + lt * .03, fov: 60 });
  classroomFrame(c, t, cam, { sun: false, clock: [10, 17, 30], light: { amb: .55, ambCol: [100, 110, 170] }, cast: classCast({ expr: { noah: { browUp: 1, mouth: 'o' }, lea: { brow: 'worried', mouth: 'wobbly' }, jonas: { browUp: 1, mouth: 'o' } }, teacherPos: [8.3, 0, 6.9], teacherPose: { expr: { brow: 'worried', mouth: 'flat' } } }) });
  alarmGrade(c, t, 1, { bx: W * .8, by: H * .2, br: 1500 }); vignette(c, .6);
  const remain = 20 * 60 - Math.floor(Math.max(0, lt - .4) * 1);
  hudClock(c, t, 19.6, W / 2, H / 2, `${String(Math.floor(remain / 60)).padStart(2, '0')}:${String(remain % 60).padStart(2, '0')}`, { size: 120, bar: '#d02a22' });
  hudTag(c, t, 19.9, W / 2, H / 2 + 150, 'Minuten', { size: 44, tilt: .02 });
});

// 21.87–23.95 "…die dein Leben verändert." — Noah 3/4 in the red light; behind him the green Notausgang sign (foreshadowing)
shot(21.87, 23.95, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.08)), cam = lookAt([lerp(3.35, 3.55, k), 1.3, lerp(3.75, 3.45, k)], [4.0, 1.18, 2.0], camShake({ fov: lerp(40, 32, k) }, t, 1.5));
  classroomFrame(c, t, cam, { sun: false, clock: [10, 17, 30], light: { amb: .55, ambCol: [110, 120, 180] }, cast: S => {
    actor(S, seatPos('noah'), (cc, kk) => drawNoah34(cc, { k: kk, turn: -1, sit: true, seatH: SEAT_H, ink: 1.8, expr: { brow: 'worried', browUp: .3, mouth: 'flat', look: -.8 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true, bias: -.05, lit: { rim: '255,80,70', rimA: .7 } });
  } });
  const ep = proj(cam, [.02, 2.4, .8]); if (ep) glow(c, ep[0], ep[1], 260, '40,220,120', .35);
  alarmGrade(c, t, 1, { bx: W * .95, by: 120, br: 1400 }); vignette(c, .55);
});
// 23.95–26.95 "Und das Leben von fünfhundert anderen Menschen gleich mit." — the whole school from the yard, alarm beacon, counter 500
shot(23.95, 26.95, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3)), cam = lookAt([lerp(-9, -3, k), lerp(2.0, 3.0, k), -25], [0, 6.0, 0], { fov: 56 });
  exteriorFrame(c, t, cam, { tod: 'alarm', alarm: 1, clock: [10, 17, 40] });
  const bp = proj(cam, [4, 9.4, -.4]); alarmGrade(c, t, .55, bp ? { bx: bp[0], by: bp[1], br: 700 } : {}); vignette(c, .45);
  const n = Math.round(500 * easeOut(seg(t, 24.6, 25.9)));
  hudTag(c, t, 24.6, W - 330, 170, `${n} Menschen`, { size: 60, bar: '#d02a22' });
});
// 26.95–30.45 "Das hier ist die Geschichte von Noah. Aber eigentlich ist es deine." — Noah alone in the yard, looks at us
shot(26.95, 30.45, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.5)), cam = lookAt([lerp(-3.4, -3.0, k), 1.15, lerp(-19.5, -17.4, k)], [-3.0, 1.0, -14], { fov: 40 });
  exteriorFrame(c, t, cam, { tod: 'morning', clock: [10, 16, 0], cast: S => {
    const look = t > 29.5 ? 0 : .3;
    actor(S, [-3.0, 0, -14], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: t > 29.5 ? 'soft' : 'smile', look, shine: t > 29.5 ? 1 : 0, browUp: t > 29.5 ? .3 : 0 } }), {});
  } });
  gradeScreen(c, { sx: .1, sy: 0, warmA: .3, coolA: .18 }); vignette(c, .4);
  hudTag(c, t, 28.55, 560, 300, 'Noah', { size: 64, bar: '#2f6fb0', tilt: -.05 });
  hudTag(c, t, 30.0, 1360, 300, '… und du?', { size: 54, bar: '#e0663a', tilt: .04 });
});
// 30.45–35.40 title card "WAS WÄRE, WENN…" over the school at the moment of the alarm
shot(30.45, 35.4, (c, lt, t) => {
  const cam = lookAt([0, 1.4, -42 + lt * .5], [0, 6, 0], { fov: 50 });
  exteriorFrame(c, t, cam, { tod: 'alarm', alarm: 1, clock: [10, 17, 50] });
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(25,25,55,.72)'; c.fillRect(0, 0, W, H); c.restore();
  const bp = proj(cam, [4, 9.4, -.4]); alarmGrade(c, t, .6, bp ? { bx: bp[0], by: bp[1], br: 600 } : {});
  titleCard(c, t, 30.6, 'WAS WÄRE, WENN…', 'du deine Schule gerettet hättest?', 32.1);
  letterbox(c, 1, 110); vignette(c, .6);
});
// 35.40–36.95 "Fangen wir von vorne an." — rewind: the clock races backwards to 6:45 with tape-rewind stripes
shot(35.4, 36.95, (c, lt, t) => {
  const u = easeIO(seg(lt, 0, 1.4)), total = lerp(10 * 60 + 17, 6 * 60 + 45, u), hh = Math.floor(total / 60), mm = Math.floor(total % 60), ss = (total * 60) % 60;
  clockECU(c, lt, [hh, mm, ss], { zoom: 1.05 });
  c.save(); for (let i = 0; i < 9; i++) { const y = ((i * 137 + lt * 2400) % (H + 200)) - 100; c.fillStyle = `rgba(255,255,255,${.12 + rnd(i) * .2})`; c.fillRect(0, y, W, 6 + rnd(i + 3) * 14); } c.restore();
  hudTag(c, t, 35.45, 260, 140, '◀◀', { size: 60, bar: '#2f6fb0' });
  hudClock(c, t, 35.45, W - 300, 140, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} Uhr`);
  flashWhite(c, seg(lt, 1.25, 1.55));
});
