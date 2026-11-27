// ======================= Bölüm 7: Yangın merdiveni → spor salonu (309.34 – 352.9) =======================
const socks = fn => withPal({ shoe: '#e9e4da' }, fn);
const GX = EXT.gym.x0, GDZ = EXT.gym.z0 + 6.4; // gym steel door (outside): x = GX, z GDZ..GDZ+2.2
function yardAlarm(c, t, cam, cast, o = {}) {
  exteriorFrame(c, t, cam, Object.assign({ tod: 'alarm', alarm: 1, clock: [10, 27, 0], door: 1, cast }, o));
  const bp = proj(cam, [4, 9.4, -.4]); alarmGrade(c, t, .5, bp ? { bx: bp[0], by: bp[1], br: 900 } : {}); vignette(c, .5);
}
// 309.34–311.00 "Die Feuertreppe ist aus Metall." — Noah steps out onto the top landing, high angle
shot(309.34, 311.0, (c, lt, t) => {
  const cam = lookAt([-11.5, 10.5, -6], [-15.2, 7.0, -.8], { fov: 46 });
  yardAlarm(c, t, cam, S => actor(S, [-15.0, 7.0, -.75], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { brow: 'worried', mouth: 'flat', look: .6 } }), {}));
  hudTag(c, t, 309.6, 360, 150, 'Metall', { size: 50, bar: '#7d8590' });
});
// 311.00–313.09 "Jeder Schritt klingt wie ein Gong." — ECU shoe on the grating, ring waves
shot(311.0, 313.09, (c, lt, t) => {
  const cam = lookAt([-14.2, 7.35, -2.4], [-15.0, 7.05, -.9], { fov: 34 });
  yardAlarm(c, t, cam, S => actor(S, [-15.0, 7.0, -.85], (cc, kk) => drawNoahSide(cc, { k: kk, ink: 1.8, walk: lt < .8 ? lt * 4 : 3.2 }), {}));
  if (lt > .7) { c.save(); for (let i = 0; i < 4; i++) { const ph = ((lt - .7) * 1.5 + i / 4) % 1; c.beginPath(); c.ellipse(W / 2, H * .82, 120 + ph * 700, 30 + ph * 160, 0, 0, TAU); c.lineWidth = 8 * (1 - ph); c.strokeStyle = `rgba(255,240,200,${1 - ph})`; c.stroke(); } c.restore(); hudTag(c, t, 312.3, W - 330, 170, 'GOOONG!', { size: 66, tilt: .06 }); }
});
// 313.09–315.54 "Also ziehst du die Schuhe aus und gehst auf Socken." — he pulls off his shoes on the landing
shot(313.09, 315.54, (c, lt, t) => {
  const cam = lookAt([-13.4, 7.9, -3.4], [-15.0, 7.3, -.85], { fov: 38 });
  const off = lt > 1.3;
  yardAlarm(c, t, cam, S => {
    actor(S, [-15.0, 7.0, -.85], (cc, kk) => (off ? socks : f => f())(() => drawNoah(cc, { k: kk, sit: true, seatH: 120, ink: 1.8, expr: { brow: 'angry', mouth: 'flat', look: .3, lookY: 1 }, arms: { l: { a: .4, b: -1.6 }, r: { a: .4, b: -1.6 } } })), { sit: true });
    if (off) for (const dx of [-.45, -.3]) solid(S, -15.0 + dx, 7.0, -.6, .12, .08, .26, NOAH.shoe, { bias: -.2 });
  });
  hudTag(c, t, 314.6, 360, 150, 'Socken', { size: 50, bar: '#e0663a' });
});
// 315.54–317.37 "Stufe für Stufe." — side view on the stairs, socks, tiptoe
shot(315.54, 317.37, (c, lt, t) => {
  const u = seg(lt, 0, 1.8), p = [lerp(-17.0, -19.0, u), lerp(6.75, 5.0, u), -.85];
  const cam = lookAt([p[0] + .6, p[1] + .7, -4.6], [p[0], p[1] + .5, -.85], { fov: 40 });
  yardAlarm(c, t, cam, S => actor(S, p, (cc, kk) => socks(() => drawNoahSide(cc, { k: kk, ink: 1.8, walk: t * 4, armSwing: .2, s: -1, expr: { brow: 'angry', mouth: 'flat' } })), {}));
});
// 317.37–321.06 "Der Schulhof ist komplett leer. So hast du ihn noch nie gesehen." — wide, from the stairs
shot(317.37, 321.06, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.7)), cam = lookAt([-12, lerp(4.5, 3.6, k), -2], [lerp(0, 6, k), 1.0, -26], { fov: 58 });
  yardAlarm(c, t, cam, null);
  hudTag(c, t, 318.0, W - 330, 170, 'leer', { size: 56 });
});
// 321.06–323.28 "Ein Fußball liegt einsam vor dem Tor." — low angle on the ball
shot(321.06, 323.28, (c, lt, t) => {
  const cam = lookAt([-1.0, .25, -25.8], [-1.2, .3, -28.5], { fov: lerp(40, 34, seg(lt, 0, 2.2)) });
  yardAlarm(c, t, cam, null);
});
// 323.28–326.00 "Und über allem blinkt ein rotes Alarmlicht." — the beacon on the facade, pulses
shot(323.28, 326.0, (c, lt, t) => {
  const cam = lookAt([5.5, 7.5, -5], [4, 9.4, -.3], { fov: 30 });
  yardAlarm(c, t, cam, null);
});
// 326.00–329.27 "Du rennst. Geduckt. Hinter den Fahrradständern entlang." — tracking, Noah crouched behind the bikes
shot(326.0, 329.27, (c, lt, t) => {
  const x = lerp(-13, -3.5, seg(lt, 0, 3.27)), cam = lookAt([x - .5, .8, -7.0], [x + .3, .6, -3.6], { fov: 46 });
  yardAlarm(c, t, cam, S => actor(S, [x, 0, -4.4], (cc, kk) => socks(() => drawNoahSide(cc, { k: kk * .92, ink: 1.8, walk: t * 12, armSwing: .55, tilt: .22, bob: 60, expr: { brow: 'angry', mouth: 'flat' } })), {}));
});
// 329.27–332.58 "Die Turnhalle. Die Stahltür steht offen, wie jeden Morgen." — push towards the gym door
shot(329.27, 332.58, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.3)), cam = lookAt([lerp(0, 7.5, k), 1.5, lerp(-24, -30, k)], [GX, 1.4, GDZ + 1.0], { fov: 48 });
  yardAlarm(c, t, cam, null);
  hudTag(c, t, 329.6, 360, 150, 'Turnhalle', { size: 52, bar: '#b46a4a' });
});
// fire extinguisher box insert: the hand gropes under it (2D, lit)
function extinguisherInsert(c, t, lt, found, o = {}) {
  const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#a05a3e'); g.addColorStop(1, '#8a4a34'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 60) for (let x = (y / 60 % 2) * 60; x < W; x += 120) { c.fillStyle = `rgba(${170 + rnd(x + y) * 40 | 0},${90 + rnd(x * y) * 30 | 0},60,.55)`; c.fillRect(x + 3, y + 3, 114, 54); }
  c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.shadowOffsetY = 30; rrect(c, 560, 80, 800, 560, 20); c.fillStyle = '#d0281e'; c.fill(); c.restore();
  rrect(c, 560, 80, 800, 560, 20); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); rrect(c, 620, 140, 680, 300, 14); c.fillStyle = '#e8e8e8'; c.fill(); c.stroke(); txt(c, 'FEUERLÖSCHER', 960, 320, 74, '#d0281e', 'center');
  c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(560, 640, 800, 90);
  // the hand coming in from below, groping under the box
  const gx = o.gx ?? (700 + Math.sin(lt * 5) * 160), gy = 700;
  line(c, [gx - 200, H + 80, gx, gy + 60], 150, OUT); line(c, [gx - 200, H + 80, gx, gy + 60], 126, NOAH.skin);
  c.save(); c.translate(gx, gy + 40); c.scale(2.4, 2.4); c.rotate(Math.PI * .85); noahHandLocal(c, 0); c.restore();
  if (found) { c.save(); c.translate(gx + 40, gy - 40 - (o.lift || 0)); c.rotate(-.25); glow(c, 0, 0, 160, '255,230,150', .7); c.fillStyle = '#d9c36a'; c.beginPath(); c.arc(-70, 0, 34, 0, TAU); c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.fillRect(-40, -10, 140, 20); c.strokeRect(-40, -10, 140, 20); c.fillRect(60, 10, 14, 24); c.fillRect(84, 10, 14, 16); c.restore(); }
  vignette(c, .55);
}
// 332.58–335.60 "Du tastest unter dem Feuerlöscherkasten. Nichts."
shot(332.58, 335.6, (c, lt, t) => { extinguisherInsert(c, t, lt, false); if (t > 334.73) hudTag(c, t, 334.8, W - 330, 170, 'nichts …', { size: 52 }); classAlarm(c, t, .3); });
// 335.60–337.31 "Dein Herz rutscht in die Hose." — Noah's face, vertigo drop
shot(335.6, 337.31, (c, lt, t) => {
  const k = easeOut(seg(lt, 0, .8)), cam = lookAt([GX - 1.2 - k * .6, 1.35, GDZ - .9], [GX - .45, 1.25 - k * .1, GDZ - .5], { fov: lerp(28, 50, k) });
  yardAlarm(c, t, cam, S => actor(S, [GX - .5, 0, GDZ - .55], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: { browUp: 1, mouth: 'gasp', open: .7, eyeScale: .9, sweat: 1 } })), {}));
  // heart sliding down
  const hy = lerp(380, 980, easeIO(seg(lt, .2, 1.4))); c.save(); c.translate(W / 2 + 260, hy); c.scale(1.4, 1.4); c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fillStyle = '#e04a4a'; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); c.restore();
});
// 337.31–341.25 "Dann, ein bisschen weiter hinten: kaltes Metall. Der Schlüssel."
shot(337.31, 341.25, (c, lt, t) => { extinguisherInsert(c, t, lt, lt > 1.9, { gx: lerp(700, 1150, easeIO(seg(lt, 0, 1.8))), lift: easeOut(seg(lt, 2.5, 3.5)) * 220 }); classAlarm(c, t, .3); if (lt > 1.9) hudTag(c, t, 339.2, 360, 150, 'kaltes Metall', { size: 50, bar: '#9aa0a8' }); });
// 341.25–342.62 "Danke, Herr Krüger." — Noah, small smile, key in hand
shot(341.25, 342.62, (c, lt, t) => {
  const cam = lookAt([GX - 1.7, 1.3, GDZ - 1.0], [GX - .5, 1.2, GDZ - .55], { fov: 32 });
  yardAlarm(c, t, cam, S => actor(S, [GX - .5, 0, GDZ - .55], (cc, kk) => { socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'smile', eyes: 'closed', browUp: .4 }, arms: { r: { a: .9, b: -1.6 } } })); }, {}));
  hudTag(c, t, 341.4, W - 380, 170, 'Danke, Herr Krüger.', { size: 46, bar: '#3f5f86' });
});
// 342.62–344.22 "Drinnen ist es still." — Noah in the bright doorway, silhouette, the hall ahead
shot(342.62, 344.22, (c, lt, t) => {
  const cam = lookAt([7.6, 1.3, 12], [7.6, 1.1, 0], { fov: 46 });
  gymFrame(c, t, cam, { door: 1, cast: S => actor(S, [7.4, 0, .5], (cc, kk) => socks(() => drawNoah(cc, { k: kk, ink: 1.8, expr: { brow: 'worried', mouth: 'flat' } })), { lit: { rim: '255,240,210', rimA: .9, light: [0, -1], shadeA: .55 }, shadowOpt: { skew: 0, squash: 1.2, alpha: .4 } }) });
  vignette(c, .45);
});
// 344.22–348.53 "Die Sonne fällt durch die hohen Fenster und malt helle Streifen auf den Hallenboden." — wide crane
shot(344.22, 348.53, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 4.3)), cam = lookAt([lerp(13, 11, k), lerp(5.5, 3.5, k), 3], [3, 0, 18], { fov: 56 });
  gymFrame(c, t, cam, { door: 1 }); vignette(c, .4);
});
// 348.53–350.24 "Staub tanzt im Licht." — close on a beam, motes
shot(348.53, 350.24, (c, lt, t) => {
  const cam = lookAt([5, 1.6, 9], [2.0, 2.6, 13], { fov: 40 });
  gymFrame(c, t, cam, { door: 1 }); motes3D(scene(cam, GYM_LIGHT), c, [.5, .5, 9, 5, 4, 8], t, { n: 160, a: .9, speed: .01 }); vignette(c, .4);
});
// 350.24–352.90 "Als wüsste die Turnhalle nicht, was draußen los ist." — quiet wide, Noah small in the middle
shot(350.24, 352.9, (c, lt, t) => {
  const cam = lookAt([14, 2.2, 22], [6, .8, 6], { fov: 52 });
  gymFrame(c, t, cam, { door: 1, cast: S => actor(S, [7.6, 0, 3.0], (cc, kk) => socks(() => drawNoah34(cc, { k: kk, ink: 1.8, turn: -1, expr: { brow: 'worried', mouth: 'flat', look: -.5, lookY: -.5 } })), {}) }); vignette(c, .4);
});
