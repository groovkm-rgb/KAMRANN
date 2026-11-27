// ======================= Bölüm 11: Ertesi gün (531.96 – 638.96) =======================
// 531.96–537.72 "In der Nacht kannst du nicht schlafen. Immer wieder siehst du die Taube. Die Tür. Das Klick."
shot(531.96, 533.89, (c, lt, t) => {
  bedroomFrame(c, t, BEDCAM(0, 0, 46), { tod: 'night', noBed: true, clockText: '02:14', cast: S => bedSide(S, { expr: { eyes: 'open', mouth: 'flat', brow: 'worried', look: .4 } }) });
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(40,50,110,.55)'; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .6);
  hudClock(c, t, 532.1, W - 300, 140, '02:14 Uhr');
});
// memory flashes (desaturated, quick)
function memFlash(c, t, fn) { fn(); c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.85)'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(70,80,140,.5)'; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .7); }
shot(533.89, 535.76, (c, lt, t) => memFlash(c, t, () => { SHOTS.find(s => s.t0 === 442.92).draw(c, 3.6 + lt * .3, 446.5 + lt * .3); }));
shot(535.76, 536.59, (c, lt, t) => memFlash(c, t, () => { SHOTS.find(s => s.t0 === 455.08).draw(c, .05 + lt * .3, 455.13 + lt * .3); }));
shot(536.59, 537.72, (c, lt, t) => memFlash(c, t, () => { SHOTS.find(s => s.t0 === 455.81).draw(c, 1.5 + lt * .2, 457.3 + lt * .2); }));
// next morning
function morningYard(c, t, cam, cast, o = {}) {
  exteriorFrame(c, t, cam, Object.assign({ tod: 'bright', alarm: 0, door: 1, clock: [7, 50, 0], cast }, o));
  gradeScreen(c, { sx: .8, sy: 0, warm: '255,220,150', warmA: .35, coolA: .1 }); vignette(c, .3);
}
// 537.72–543.71 "Am nächsten Morgen stehst du vor dem Schultor. Ehrlich gesagt willst du gar nicht rein. Der Bauch kribbelt."
shot(537.72, 540.22, (c, lt, t) => {
  const cam = lookAt([0, 1.4, -53], [0, 1.6, -45], { fov: 50 });
  morningYard(c, t, cam, S => actor(S, [0, 0, -46.4], (cc, kk) => drawNoahBack(cc, { k: kk, ink: 1.8 }), {}));
  hudTag(c, t, 537.9, 360, 150, 'Am nächsten Morgen', { size: 48, bar: '#f2a53a' });
});
shot(540.22, 543.71, (c, lt, t) => {
  const cam = lookAt([.6, 1.35, -44.6], [0, 1.25, -46.4], { fov: 40 });
  morningYard(c, t, cam, S => actor(S, [0, 0, -46.4], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { brow: 'worried', mouth: 'wobbly', look: .3 }, arms: { l: { a: .4, b: -1.4 }, r: { a: .4, b: -1.4 } } }), {}));
  if (t > 542.23) { for (let i = 0; i < 6; i++) { const a = t * 6 + i; c.save(); c.translate(W / 2 + Math.cos(a) * 70, 760 + Math.sin(a * 1.3) * 30); c.rotate(a); c.fillStyle = ['#ff9ec0', '#ffd84a', '#8fd0ff'][i % 3]; c.beginPath(); c.ellipse(0, 0, 18, 8, 0, 0, TAU); c.fill(); c.restore(); } hudTag(c, t, 542.3, W - 360, 170, 'Bauchkribbeln', { size: 46 }); }
});
// 543.71–546.93 "Dann gehst du durchs Tor. Und bleibst stehen."
shot(543.71, 546.93, (c, lt, t) => {
  const z = lerp(-46.4, -43.6, seg(lt, 0, 1.7)), cam = lookAt([0, 1.3, z - 3.2], [0, 1.2, z + 4], { fov: 50 });
  morningYard(c, t, cam, S => { actor(S, [0, 0, z], (cc, kk) => drawNoahBack(cc, { k: kk, ink: 1.8 }), {}); crowd(S, t, { gap: true, gapX: 0 }); });
});
// 546.93–553.76 "Der ganze Schulhof ist voll. Schüler, Lehrer, Eltern. Und als sie dich sehen, wird es kurz still."
shot(546.93, 551.34, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 4.4)), cam = lookAt([lerp(-10, 8, k), 3.8, -44], [lerp(-4, 4, k), 1, -14], { fov: 56 });
  morningYard(c, t, cam, S => { crowd(S, t, {}); actor(S, [0, 0, -43.6], (cc, kk) => drawNoahBack(cc, { k: kk, ink: 1.8 }), {}); });
  ['Schüler', 'Lehrer', 'Eltern'].forEach((s, i) => { const ts = [549.18, 549.8, 550.35][i]; if (t > ts) hudTag(c, t, ts, 520 + i * 440, 160, s, { size: 48 }); });
});
shot(551.34, 553.76, (c, lt, t) => {
  const cam = lookAt([0, 1.6, -36], [0, 1.4, -14], { fov: 50 });
  morningYard(c, t, cam, S => crowd(S, t, {}));
  hudTag(c, t, 552.4, W / 2, 150, 'Stille.', { size: 54 });
});
// 553.76–562.89 "Dann fangen sie an zu klatschen. Erst ein paar. Dann alle. Immer lauter. „No-ah! No-ah! No-ah!“" — dolly zoom on Noah at the applause
shot(553.76, 558.02, (c, lt, t) => {
  const cam = lookAt([0, 1.8, -24], [0, 1.4, -14], { fov: 54 });
  morningYard(c, t, cam, S => crowd(S, t, { clap: true, cheer: t > 556.3 }));
  if (t > 555.49) for (let i = 0; i < 8; i++) { const ph = (t * 1.5 + i / 8) % 1; hudTag(c, t, 555.5, 200 + rnd(i) * 1500, 300 + rnd(i + 4) * 500, '*klatsch*', { size: 34, alpha: Math.sin(ph * Math.PI), tilt: (rnd(i) - .5) * .3 }); }
});
shot(558.02, 562.89, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 4.8)), tgt = [0, 1.25, -43.6], d = lerp(5, 1.6, k);
  const cam = lookAt([tgt[0] + .3, 1.35, tgt[2] + d], tgt, { fov: lerp(22, 58, k) });
  morningYard(c, t, cam, S => { crowd(S, t, { clap: true, cheer: true }); actor(S, [0, 0, -43.6], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { browUp: 1, mouth: 'o', eyeScale: 1.15, shine: 1, blush: k } }), {}); });
  ['No-ah!', 'No-ah!', 'No-ah!'].forEach((s, i) => { const ts = [560.05, 560.98, 561.79][i]; if (t > ts) hudTag(c, t, ts, [420, 1500, 960][i], [300, 360, 180][i], s, { size: 70, bar: ['#e04a3a', '#3a7ad2', '#3aa05a'][i], tilt: (i - 1) * .1 }); });
});
// 562.89–566.12 "Dein Kopf ist bestimmt so rot wie das Alarmlicht von gestern."
shot(562.89, 566.12, (c, lt, t) => {
  const cam = lookAt([.2, 1.32, -42.3], [0, 1.28, -43.6], { fov: 36 });
  morningYard(c, t, cam, S => actor(S, [0, 0, -43.6], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'grin', eyes: 'closed', blush: 1 } }), {}));
  c.save(); c.globalCompositeOperation = 'soft-light'; const pulse = .5 + .5 * Math.sin(t * 6); c.fillStyle = `rgba(255,60,50,${.25 + .2 * pulse})`; c.fillRect(0, 0, W, H); c.restore();
  hudTag(c, t, 564.2, W - 360, 170, 'knallrot', { size: 52, bar: '#d02a22' });
});
// 566.12–577.32 Herr Krüger at the entrance, grinning, gives the gym key on a red ribbon
shot(566.12, 570.62, (c, lt, t) => {
  const cam = lookAt([2.2, 1.6, -7.5], [3.2, 1.5, -2.6], { fov: 44 });
  morningYard(c, t, cam, S => { actor(S, [3.6, 0, -2.6], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: { mouth: 'grin' } }), {}); actor(S, [2.4, 0, -3.6], (cc, kk) => drawNoahBack(cc, { k: kk, ink: 1.8 }), {}); });
  hudTag(c, t, 568.3, W - 380, 170, 'von einem Ohr zum anderen', { size: 42 });
});
shot(570.62, 573.97, (c, lt, t) => {
  // insert: the key with a red ribbon drops into Noah's hand
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f6e7c8'); g.addColorStop(1, '#d9c3a0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  line(c, [W / 2 + 200, H + 80, W / 2 + 60, 760], 170, OUT); line(c, [W / 2 + 200, H + 80, W / 2 + 60, 760], 146, NOAH.skin);
  c.save(); c.translate(W / 2 + 40, 700); c.scale(3, 3); c.rotate(Math.PI * .9); noahHandLocal(c, 0); c.restore();
  const y = lerp(-200, 560, easeOut(seg(lt, .2, 1.1))); c.save(); c.translate(W / 2 - 20, y); c.rotate(-.3);
  c.beginPath(); c.moveTo(-10, -300); c.bezierCurveTo(-120, -200, 80, -120, 0, 0); c.lineWidth = 26; c.strokeStyle = '#d02a22'; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#8a1a14'; c.stroke();
  glow(c, 0, 40, 160, '255,230,150', .7); c.fillStyle = '#d9c36a'; c.beginPath(); c.arc(0, 40, 50, 0, TAU); c.fill(); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); circle(c, 0, 40, 18); c.fillStyle = '#a8925a'; c.fill(); c.fillStyle = '#d9c36a'; c.fillRect(-14, 80, 28, 180); c.strokeRect(-14, 80, 28, 180); c.fillRect(14, 200, 30, 20); c.fillRect(14, 235, 22, 18);
  c.restore(); vignette(c, .4);
  hudTag(c, t, 571.4, 400, 150, 'Turnhallenschlüssel', { size: 46, bar: '#d02a22' });
});
shot(573.97, 577.32, (c, lt, t) => {
  const cam = lookAt([3.2, 1.65, -4.4], [3.6, 1.75, -2.6], { fov: 40 });
  morningYard(c, t, cam, S => actor(S, [3.6, 0, -2.6], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: t > 575.3 ? { mouth: 'soft', brow: 'angry' } : { mouth: Math.sin(t * 10) > 0 ? 'grin' : 'smile' }, arms: t > 575.3 ? { r: { a: 1.7, b: .9 } } : undefined }), {}));
  if (t > 575.33) hudTag(c, t, 575.4, 380, 160, 'bloß keinen Quatsch!', { size: 46, bar: '#3f5f86' });
});
// 577.32–591.67 Frau Schröder at the microphone
function schroederYard(c, t, cam, e, o = {}) {
  morningYard(c, t, cam, S => {
    solid(S, -2.0, 0, -6, 4, .5, 2, '#8a5a42', { cols: { top: '#a8744e' } }); // small stage
    actor(S, [0, .5, -5.2], (cc, kk) => drawPerson(cc, CAST.schroeder, { k: kk, ink: 1.6, expr: e, arms: o.arms }), {});
    push(S, depthOf(S, [.4, 1.8, -5.6]) - .3, cc => { const a = proj(S.cam, [.45, .5, -5.6]), b = proj(S.cam, [.45, 1.95, -5.6]); if (a && b) { line(cc, [a[0], a[1], b[0], b[1]], 6, '#2a2a2a'); circle(cc, b[0], b[1], Math.max(6, S.cam.f * .05 / b[2])); fs(cc, '#3a3a3a', 3); } });
    if (o.crowd) crowd(S, t, { back: true, cheer: o.cheer, clap: o.clap });
  });
}
shot(577.32, 580.75, (c, lt, t) => { schroederYard(c, t, lookAt([0, 1.9, -11], [0, 1.6, -5], { fov: 46 }), { mouth: 'soft', look: .3 }, { crowd: true }); hudTag(c, t, 577.5, 380, 150, 'Frau Schröder', { size: 48, bar: '#7a2f45' }); });
shot(580.75, 584.58, (c, lt, t) => { schroederYard(c, t, lookAt([.6, 2.0, -7.2], [0, 1.95, -5.2], { fov: 38 }), { mouth: Math.sin(t * 10) > 0 ? 'o' : 'smile', look: .5, browUp: .3 }); if (t > 583.1) hudTag(c, t, 583.15, W - 400, 170, '„ziemlich schlecht“', { size: 46 }); });
shot(584.58, 586.26, (c, lt, t) => { schroederYard(c, t, lookAt([0, 3.2, -4], [0, 1.0, -16], { fov: 56 }), { mouth: 'grin', eyes: 'closed' }, { crowd: true, cheer: true }); hudTag(c, t, 584.8, W / 2, 150, 'Hahaha!', { size: 60, tilt: .04 }); });
shot(586.26, 591.67, (c, lt, t) => { schroederYard(c, t, lookAt([.4, 2.0, -7.4], [0, 1.95, -5.2], { fov: lerp(40, 32, seg(lt, 0, 5)) }), { mouth: Math.sin(t * 9) > 0 ? 'o' : 'soft', look: .4, brow: t < 590 ? 'worried' : 'arch' }); if (t > 590.69) hudTag(c, t, 590.7, 400, 160, '„Danke, Noah.“', { size: 52, bar: '#7a2f45' }); });
// 591.67–596.11 Die Polizistin gibt dir eine Urkunde: „Für Mut und Zivilcourage.“
shot(591.67, 596.11, (c, lt, t) => {
  const cam = lookAt([-.2, 1.5, -9.0], [-.2, 1.3, -6.4], { fov: 42 });
  morningYard(c, t, cam, S => { actor(S, [-.9, 0, -6.4], (cc, kk) => drawPerson(cc, CAST.polizistin, { k: kk, ink: 1.6, expr: { mouth: 'smile' }, arms: { r: { a: 1.2, b: -.5 } } }), { scale: 1.02 }); actor(S, [.5, 0, -6.6], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'grin', blush: 1, browUp: .4 }, arms: { l: { a: 1.2, b: -.6 } } }), {}); });
  urkundeCard(c, t, 593.2, { x: W / 2 + 120, y: H / 2 + 30 });
});
// 596.11–610.35 the 5th graders' banner "DANKE NOAH!"
shot(596.11, 599.39, (c, lt, t) => {
  const cam = lookAt([0, 1.4, -10], [0, 1.0, -4], { fov: 50 });
  morningYard(c, t, cam, S => { for (let i = 0; i < 8; i++) { const u = seg(lt, i * .08, 2), x = -2.5 + i * .7; actor(S, [x, 0, lerp(-2, -5.5, u)], (cc, kk) => drawPerson(cc, i % 2 ? CAST.kid5a : CAST.kid5b, { k: kk, ink: 1.6, expr: { mouth: 'grin' }, arms: { l: { a: 2.6, b: .1 }, r: { a: 2.6, b: .1 } } }), { scale: .82 }); }
    const bz = lerp(-2.1, -5.6, seg(lt, 0, 2)); push(S, depthOf(S, [0, 1.6, bz]) - .2, cc => { const a = proj(S.cam, [-2.8, 2.0, bz]), b = proj(S.cam, [2.8, 1.25, bz]); if (a && b) { cc.fillStyle = '#fffdf6'; cc.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); cc.lineWidth = 4; cc.strokeStyle = OUT; cc.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); cc.font = FONT((b[1] - a[1]) * .5); cc.fillStyle = '#e04a3a'; cc.textAlign = 'center'; cc.fillText('DANKE NOAH!', (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .65); } }); });
});
shot(599.39, 604.79, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fd0f0'); g.addColorStop(1, '#fff1cc'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  bannerCard(c, t, 599.45, { s: .95 });
  if (t > 602.35) hudTag(c, t, 602.4, 1500, 900, 'mit Umhang!', { size: 46, bar: '#e04a3a' }); if (t > 603.25) hudTag(c, t, 603.3, 400, 900, 'Superheld', { size: 46, bar: '#3a7ad2' });
});
shot(604.79, 610.35, (c, lt, t) => {
  // close on the drawing: the crooked nose, then Noah's moved face
  if (t < 606.87) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fd0f0'); g.addColorStop(1, '#fff1cc'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.save(); const z = 1 + easeIO(seg(lt, 0, 1.2)) * 1.6; c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2 + 150, -H / 2 + 140); bannerCard(c, t, 599.45, { s: .95 }); c.restore(); hudTag(c, t, 605.3, W - 360, 170, 'Nase: leicht schief', { size: 44 }); }
  else { const cam = lookAt([.15, 1.32, -6.4], [0, 1.28, -7.6], { fov: 36 }); morningYard(c, t, cam, S => actor(S, [0, 0, -7.6], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'smile', eyes: 'closed', blush: .8, browUp: .5 } }), {})); for (let i = 0; i < 5; i++) star(c, 500 + i * 230, 200 + Math.sin(t * 3 + i) * 30, 24, '#ffe58a'); }
});
// 610.35–618.01 "Der restliche Tag ist komplett verrückt. Die Zeitung will ein Foto. In der Pause wollen alle ein Selfie mit dir. Sogar die aus der Zwölften."
shot(610.35, 612.52, (c, lt, t) => { morningYard(c, t, lookAt([-4, 2.4, -16], [0, 1.2, -6], { fov: 54 }), S => { crowd(S, t, { cheer: true, n: 30 }); actor(S, [0, 0, -8], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'grin', blush: .6 } }), {}); }); hudTag(c, t, 610.6, W / 2, 150, 'komplett verrückt', { size: 52, bar: '#8a5ab0' }); });
shot(612.52, 614.12, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#d9c3a0'); g.addColorStop(1, '#b8a07c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  newspaperCard(c, t, 612.6); if (lt > .6 && lt < .75) flashWhite(c, .8);
});
shot(614.12, 618.01, (c, lt, t) => {
  const cam = lookAt([0, 1.5, -5.5], [0, 1.3, -8.5], { fov: 46 });
  morningYard(c, t, cam, S => { actor(S, [0, 0, -8.5], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'grin', eyes: Math.floor(t * 2) % 2 ? 'open' : 'closed', blush: .7 } }), {}); [CAST.student4, CAST.student3, CAST.parent1].forEach((P, i) => actor(S, [-1.1 + i * 1.1 + (i === 1 ? .0 : 0), 0, -8.8 - (i === 2 ? .2 : 0)], (cc, kk) => drawPerson(cc, P, { k: kk, ink: 1.6, expr: { mouth: 'grin' }, arms: { r: { a: 2.4, b: .3 } } }), { scale: i === 2 ? 1.12 : 1 })); });
  if (Math.floor(t * 2.5) % 3 === 0 && (t * 2.5) % 1 < .15) flashWhite(c, .7);
  hudTag(c, t, 614.5, 360, 150, 'Selfie!', { size: 52, bar: '#ff9ec0' }); if (t > 616.31) hudTag(c, t, 616.35, W - 400, 170, 'sogar die Zwölfte', { size: 44 });
});
// 618.01–622.44 Mensa: Frau Yilmaz gives two puddings. „Helden brauchen Zucker.“
shot(618.01, 620.43, (c, lt, t) => {
  const cam = lookAt([4.6, 1.5, 2.8], [4.6, 1.3, 5.8], { fov: 48 });
  mensaFrame(c, t, cam, { cast: S => { actor(S, [4.4, 0, 6.3], (cc, kk) => drawPerson(cc, CAST.yilmaz, { k: kk, ink: 1.6, expr: { mouth: 'grin' }, arms: { r: { a: 1.3, b: -.4 }, l: { a: 1.3, b: -.4 } } }), {}); actor(S, [5.7, 0, 4.4], (cc, kk) => drawNoahBack(cc, { k: kk, ink: 1.8 }), {}); } });
  vignette(c, .3); hudTag(c, t, 618.3, 360, 150, 'Mensa', { size: 50, bar: '#e0663a' });
});
shot(620.43, 622.44, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f2d9a8'); g.addColorStop(1, '#d8b880'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#8a9aa8'; rrect(c, 400, 560, 1120, 420, 30); c.fill(); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke();
  puddingCup(c, 800, 720, 2.0); puddingCup(c, 1120, 720 - (1 - easeOut(seg(lt, 0, .5))) * 300, 2.0);
  hudTag(c, t, 620.5, W / 2, 200, '2 statt 1', { size: 60, bar: '#f0c060' }); if (t > 621.06) hudTag(c, t, 621.1, W / 2, 380, '„Helden brauchen Zucker.“', { size: 48 }); vignette(c, .3);
});
// 622.44–632.58 Math class: test postponed, class cheers
shot(622.44, 626.53, (c, lt, t) => {
  const cam = lookAt([5.2, 1.6, 6.2], [4.4, 1.2, 2.6], { fov: 54 });
  classroomFrame(c, t, cam, { clock: [10, 5, 0], cast: classCast({ teacherPos: [6.2, 0, 7.1], teacherPose: { expr: { mouth: Math.sin(t * 10) > 0 ? 'o' : 'smile' } }, expr: { noah: { mouth: 'smile' }, jonas: { mouth: 'smile', look: .4 }, lea: { mouth: 'smile' } } }) });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .35, coolA: .15 }); vignette(c, .3);
  hudTag(c, t, 623.4, 400, 150, 'beste Nachricht', { size: 46, bar: '#3d8a4f' });
});
shot(626.53, 629.56, (c, lt, t) => {
  const cam = lookAt([5.4, 1.65, 4.6], [6.2, 1.7, 7.1], { fov: 40 });
  classroomFrame(c, t, cam, { clock: [10, 5, 20], cast: S => actor(S, [6.2, 0, 7.1], (cc, kk) => drawPerson(cc, CAST.becker, { k: kk, ink: 1.6, expr: { mouth: t > 628.4 ? 'grin' : 'soft', eyes: t > 628.9 ? 'closed' : 'open' } }), {}) });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .35, coolA: .15 }); vignette(c, .3);
  hudTag(c, t, 626.7, 420, 150, 'Klassenarbeit · Freitag', { size: 44 });
  if (t > 628.6) { c.save(); c.translate(420, 150); c.rotate(-.06); line(c, [-230, 0, 230, 0], 12, '#d02a22'); c.restore(); hudTag(c, t, 628.7, W - 360, 170, 'verschoben!', { size: 54, bar: '#3d8a4f' }); }
});
shot(629.56, 632.58, (c, lt, t) => {
  const cam = lookAt([4.4, 1.6, 7.3], [4.4, .9, 2.0], camShake({ fov: 58 }, t, 2));
  classroomFrame(c, t, cam, { clock: [10, 5, 30], cast: S => { const sit = (n, P) => actor(S, seatPos(n), (cc, kk) => drawPerson(cc, P, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, bob: Math.abs(Math.sin(t * 10 + n.length)) * -30, expr: { mouth: 'grin', eyes: 'closed' }, arms: { l: { a: 2.5, b: .2 }, r: { a: 2.5, b: .2 } } }), { sit: true }); sit('s1', CAST.student1); sit('s2', CAST.student2); sit('s3', CAST.student3); sit('s4', CAST.student1); sit('s5', CAST.student2); sit('lea', CAST.lea); sit('jonas', CAST.jonas); actor(S, seatPos('noah'), (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H, ink: 1.8, expr: { mouth: 'grin', eyes: 'closed' }, arms: { l: { a: 2.5, b: .2 }, r: { a: 2.5, b: .2 } } }), { sit: true }); } });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .35, coolA: .15 }); vignette(c, .3);
  hudTag(c, t, 629.7, W / 2, 150, 'JUBEL!', { size: 70, bar: '#f2a53a' });
});
// 632.58–638.96 Jonas lehnt sich rüber: „Alter. Du hast die Schule gerettet. Und die Mathearbeit. In zwei Tagen.“
shot(632.58, 638.96, (c, lt, t) => {
  const cam = lookAt([4.55, 1.25, 3.85], [4.6, 1.05, 2.6], { fov: 44 });
  classroomFrame(c, t, cam, { clock: [10, 6, 0], cast: S => {
    actor(S, seatPos('jonas'), (cc, kk) => drawPerson(cc, CAST.jonas, { k: kk, sit: true, seatH: SEAT_H, ink: 1.6, tilt: -.25, expr: { mouth: Math.sin(t * 9) > 0 ? 'o' : 'grin', look: -1 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true });
    actor(S, seatPos('noah'), (cc, kk) => drawNoah(cc, { k: kk, sit: true, seatH: SEAT_H, ink: 1.8, expr: { mouth: t > 636.4 ? 'grin' : 'smile', blush: .5, look: .8 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true });
  } });
  gradeScreen(c, { sx: 0, sy: .1, warmA: .35, coolA: .15 }); vignette(c, .3);
  if (t > 634.86) hudTag(c, t, 634.9, 400, 150, 'Schule gerettet ✓', { size: 44, bar: '#3d8a4f' }); if (t > 636.44) hudTag(c, t, 636.5, 400, 250, 'Mathearbeit gerettet ✓', { size: 44, bar: '#3d8a4f' }); if (t > 637.71) hudTag(c, t, 637.75, W - 360, 170, 'in 2 Tagen', { size: 46 });
});
