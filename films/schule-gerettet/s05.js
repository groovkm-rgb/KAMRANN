// ======================= Bölüm 5: Fikir (205.24 – 275.85) =======================
// light-bulb idea effect above a screen point (grows with k)
function ideaBulb(c, x, y, k, t) {
  if (k <= 0) return; const s = .4 + .6 * easeBack(clamp(k * 1.2)); c.save(); c.translate(x, y - Math.sin(t * 3) * 6); c.scale(s, s);
  glow(c, 0, 0, 260 * k, '255,230,120', .7 * k);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .4; line(c, [Math.cos(a) * 95, Math.sin(a) * 95, Math.cos(a) * (130 + 20 * k), Math.sin(a) * (130 + 20 * k)], 8, `rgba(255,215,90,${k})`); }
  c.beginPath(); c.arc(0, -10, 70, Math.PI * .8, Math.PI * 2.2); c.lineTo(28, 70); c.lineTo(-28, 70); c.closePath(); c.fillStyle = `rgba(255,240,150,${.6 + .4 * k})`; c.fill(); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke();
  c.fillStyle = '#9aa0a8'; rrect(c, -32, 70, 64, 40, 8); c.fill(); c.stroke(); line(c, [-30, 84, 30, 84], 4, OUT); line(c, [-30, 98, 30, 98], 4, OUT);
  c.beginPath(); c.moveTo(-18, 60); c.lineTo(-10, 10); c.lineTo(0, 30); c.lineTo(10, 10); c.lineTo(18, 60); c.lineWidth = 5; c.strokeStyle = '#d0702a'; c.stroke();
  c.restore();
}
function noahHuddleClose(c, t, lt, o = {}) {
  const k = o.push != null ? o.push : 0, cam = lookAt([2.35, 1.12 + (o.dy || 0), lerp(2.85, 2.55, k)], [2.35, 1.05 + (o.dy || 0), 1.9], { fov: o.fov || 40 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: o.expr }) });
  return cam;
}
const flashback = (c, t, k = 1) => { flashbackLook(c, t); c.save(); c.globalCompositeOperation = 'source-over'; c.strokeStyle = `rgba(255,250,235,${.6 * k})`; c.lineWidth = 18; c.strokeRect(9, 9, W - 18, H - 18); c.restore(); };

// 205.24–209.39 "Und genau in diesem Moment passiert in deinem Kopf etwas Komisches." — push in, a tiny spark appears
shot(205.24, 209.39, (c, lt, t) => {
  noahHuddleClose(c, t, lt, { push: easeIO(seg(lt, 0, 4)), expr: { brow: 'worried', browUp: .3, mouth: 'flat', look: .6, lookY: -.6 } });
  const k = seg(lt, 2.4, 4.1); if (k > 0) { glow(c, W / 2 + 230, 260, 120 * k, '255,240,170', .9); for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6; star(c, W / 2 + 230 + Math.cos(a) * 60 * k, 260 + Math.sin(a) * 40 * k, 10 * k, '#ffe58a'); } }
});
// 209.39–212.92 "Die Angst ist noch da. Klar. Deine Hände sind eiskalt." — insert: Noah's trembling hands, frost creeping in
shot(209.39, 212.92, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a2f44'); g.addColorStop(1, '#1a1d2c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#5a4e48'; c.beginPath(); c.ellipse(W / 2, H + 200, 900, 520, 0, 0, TAU); c.fill(); for (let i = 0; i < 9; i++) line(c, [W / 2 - 700 + i * 170, H, W / 2 - 600 + i * 140, H - 300], 5, '#8e837c');
  const tr = Math.sin(t * 38) * 4;
  for (const s of [-1, 1]) { const hx = W / 2 + s * 260 + tr * s, hy = 560 + tr; line(c, [hx + s * 260, H + 40, hx, hy + 60], 150, OUT); line(c, [hx + s * 260, H + 40, hx, hy + 60], 126, NOAH.skin); c.save(); c.translate(hx, hy + 40); c.scale(2.6, 2.6); c.rotate(Math.PI - s * .45); noahHandLocal(c, 0); c.restore(); if (s > 0) { c.save(); c.translate(hx + 70, hy + 220); c.rotate(-.5); nLine(c, [-70, 0, 70, 0], 40, OUT); nLine(c, [-64, 0, 64, 0], 24, NOAH.watch); c.restore(); } }
  const k = seg(lt, .4, 3.3); c.save(); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 60 * k; i++) { const x = W / 2 + (rnd(i) - .5) * 700, y = 450 + rnd(i + 3) * 350; c.strokeStyle = 'rgba(170,220,255,.6)'; c.lineWidth = 2; c.beginPath(); for (let a = 0; a < 6; a++) { c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); } c.stroke(); } c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(120,170,255,${k * .4})`; c.fillRect(0, 0, W, H); c.restore();
  hudTag(c, t, 211.1, W - 330, 160, 'eiskalt', { size: 52, bar: '#5ab0ff' }); vignette(c, .6);
});
// 212.92–218.22 "Aber daneben taucht ein Gedanke auf. Erst ganz klein. Dann immer lauter." — the bulb grows above Noah
shot(212.92, 218.22, (c, lt, t) => {
  noahHuddleClose(c, t, lt, { push: .3 + .2 * seg(lt, 0, 5.3), dy: .1, fov: 46, expr: { brow: 'worried', browUp: .3 + .5 * seg(lt, 2.5, 4), mouth: lt > 3.8 ? 'o' : 'flat', look: .5, lookY: -1, eyeScale: 1 + .15 * seg(lt, 3.5, 4.5), shine: lt > 3.8 ? 1 : 0 } });
  ideaBulb(c, W / 2 + 40, 170, seg(t, 215.26, 217.5) * .55 + seg(t, 216.73, 217.6) * .45, t);
});
// 218.22–220.62 "Das Sportfest. Die Kabel." — flash cut into the summer memory
shot(218.22, 220.62, (c, lt, t) => {
  const cam = lookAt([-3.4, 1.1, -9.8], [-2.6, .8, -7.2], { fov: 44 });
  exteriorFrame(c, t, cam, { tod: 'summer', ball: false, cast: S => { sportfest(S, t); actor(S, [-2.6, 0, -7.2], (cc, kk) => drawNoah(cc, { k: kk, ink: 1.8, expr: { mouth: 'smile', sweat: 1 }, arms: { l: { a: .45, b: -.9 }, r: { a: .45, b: -.9 } } }), {}); actor(S, [-1.3, 0, -7.0], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: { mouth: 'smile' }, arms: { r: { a: 1.2, b: -.3 } } }), {}); } });
  flashback(c, t); flashWhite(c, (1 - seg(lt, 0, .2)) * .8); vignette(c, .35);
  hudTag(c, t, 218.4, 360, 150, 'Sportfest', { size: 50, bar: '#f2a53a' }); hudTag(c, t, 219.6, W - 330, 160, 'Kabel', { size: 50, bar: '#d0702a' });
});
// 220.62–224.36 "In der Turnhalle gibt es oben einen kleinen Technikraum mit einem Mikrofon." — gym in the summer light, tilt up to the glass room
shot(220.62, 224.36, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.7)), cam = lookAt([9.5, 1.6, 14], [lerp(9, 11.5, k), lerp(1.8, 4.5, k), 1.0], { fov: lerp(56, 38, k) });
  gymFrame(c, t, cam, { door: 1 });
  flashback(c, t); vignette(c, .35); hudTag(c, t, 222.3, W - 330, 160, 'Technikraum', { size: 50, bar: '#2f6fb0' }); hudTag(c, t, 223.4, W - 330, 260, 'Mikrofon', { size: 44 });
});
// 224.36–231.35 Herr Krüger: „Von hier aus, Junge, hört dich die ganze Schule. Jeder Flur. Jedes Klassenzimmer.“
shot(224.36, 228.2, (c, lt, t) => {
  techRoomInterior(c, t, { onAir: false, level: false });
  // Krüger and Noah in front of the window (2D, lit)
  drawLit(c, cc => drawPerson(cc, CAST.krueger, { x: 760, y: 1180, k: .5, ink: 1.6, expr: { mouth: Math.sin(t * 9) > 0 ? 'o' : 'smile' }, arms: { r: { a: 1.75, b: -.15 }, l: { a: .2, b: -.2 } } }), { light: [-1, -.5], bounds: [400, 200, 1100, 1080], rimInset: 10, rimW: 6, rimA: .4 });
  drawLit(c, cc => drawNoah(cc, { x: 1200, y: 1180, k: .45, ink: 1.8, expr: { browUp: .6, mouth: 'o', look: -.8, shine: 1 } }), { light: [-1, -.5], bounds: [900, 300, 1500, 1080], rimInset: 10, rimW: 6, rimA: .4 });
  flashback(c, t); vignette(c, .4);
});
shot(228.2, 231.35, (c, lt, t) => {
  // the voice spreads through the school: plan with sound rings in every room
  floorPlan(c, t, 228.25, { speaker: true, notes: [{ t: 229.0, text: 'Jeder Flur', x: 410, y: 380, col: '#2f6fb0' }, { t: 229.7, text: 'Jedes Klassenzimmer', x: 640, y: 620, col: '#2f6fb0' }] });
  flashback(c, t, .6);
});
// 231.35–237.64 "Und er hat dir noch was gezeigt. Den Ersatzschlüssel. Unter dem Feuerlöscherkasten am Eingang. „Für Notfälle.“"
shot(231.35, 237.64, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 2.5)), cam = lookAt([lerp(8.5, 10.2, k), lerp(1.6, 1.1, k), lerp(-26, -30.3, k)], [EXT.gym.x0 - .15, lerp(1.2, .95, k), EXT.gym.z0 + 5.7], { fov: lerp(50, 30, k) });
  exteriorFrame(c, t, cam, { tod: 'summer', ball: false, door: 0, cast: S => {
    if (lt < 2.6) actor(S, [EXT.gym.x0 - 1.3, 0, EXT.gym.z0 + 4.2], (cc, kk) => drawPerson(cc, CAST.krueger, { k: kk, ink: 1.6, expr: { mouth: 'smile', eyes: lt > 1.5 ? 'closed' : 'open' }, arms: { r: { a: 1.3, b: -.2 } } }), {});
    // the key under the box (appears when we are close)
    const kp = [EXT.gym.x0 - .2, .97, EXT.gym.z0 + 5.62]; push(S, depthOf(S, kp) - .3, cc => { const p = proj(S.cam, kp); if (!p || lt < 2.2) return; const r = S.cam.f * .05 / p[2]; cc.save(); cc.translate(p[0], p[1]); cc.rotate(-.2); cc.fillStyle = '#d9c36a'; cc.beginPath(); cc.arc(-r * 1.4, 0, r * .6, 0, TAU); cc.fill(); cc.fillRect(-r, -r * .15, r * 2.2, r * .3); cc.fillRect(r * .6, 0, r * .25, r * .4); cc.fillRect(r * 1.0, 0, r * .25, r * .3); cc.lineWidth = 2; cc.strokeStyle = OUT; cc.stroke(); cc.restore(); glow(cc, p[0], p[1], r * 5, '255,230,150', .5 * seg(lt, 2.2, 3)); });
  } });
  flashback(c, t); vignette(c, .4);
  hudTag(c, t, 233.2, 360, 150, 'Ersatzschlüssel', { size: 50, bar: '#d9c36a' }); hudTag(c, t, 236.5, W - 360, 170, '„Für Notfälle.“', { size: 50, bar: '#d02a22' });
});
// 237.64–241.52 "Die Hintertüren der Turnhalle sind seit dem Einbruch letztes Jahr immer verriegelt." — chained back doors
shot(237.64, 241.52, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.9)), cam = lookAt([8, 1.5, lerp(20, 23.5, k)], [7.8, 1.3, 28], { fov: 46 });
  gymFrame(c, t, cam, { door: 0, beamA: .7 }); vignette(c, .45);
});
// 241.52–245.23 "Es gibt nur einen Weg rein und raus: die große Stahltür vorne." — turn around to the entrance
shot(241.52, 245.23, (c, lt, t) => {
  const k = easeIO(seg(lt, 0, 3.7)), cam = lookAt([lerp(6, 7.6, k), 1.4, lerp(14, 6, k)], [7.6, 1.3, 0], { fov: 50 });
  gymFrame(c, t, cam, { door: 0, beamA: .8 }); vignette(c, .45);
  hudTag(c, t, 243.6, W / 2, 140, 'nur ein Weg: die Stahltür', { size: 48, bar: '#7d8590' });
});
// 245.23–247.66 "Und die kann man von außen abschließen." — outside: a key turns in the steel door (insert)
shot(245.23, 247.66, (c, lt, t) => {
  const cam = lookAt([EXT.gym.x0 - 1.4, 1.2, EXT.gym.z0 + 5.6], [EXT.gym.x0, 1.05, EXT.gym.z0 + 6.6], { fov: 34 });
  exteriorFrame(c, t, cam, { tod: 'morning', ball: false, door: 0 });
  const p = proj(cam, [EXT.gym.x0 - .05, 1.05, EXT.gym.z0 + 6.5]); if (p) { const turn = easeIO(seg(lt, .6, 1.2)) * 1.5; c.save(); c.translate(p[0], p[1]); circle(c, 0, 0, 36); fs(c, '#c9ced6', 5); c.rotate(turn); c.fillStyle = '#d9c36a'; c.fillRect(-8, -110, 16, 110); c.beginPath(); c.arc(0, -140, 44, 0, TAU); fs(c, '#d9c36a', 5); c.restore(); }
  vignette(c, .4); if (lt > 1.2) hudTag(c, t, 246.45, W - 330, 170, 'Klick', { size: 56 });
});
// 247.66–250.59 "Plötzlich siehst du den Plan vor dir. Ganz klar." — the floor plan unfolds
shot(247.66, 250.59, (c, lt, t) => {
  const cam = lookAt([2.35, 1.12, 2.6], [2.35, 1.05, 1.9], { fov: 40 });
  classDark(c, t, cam, { cast: huddleCast({ noahExpr: { brow: 'angry', mouth: 'flat', look: .2, shine: 1 } }) });
  floorPlan(c, t, 248.0, {});
});
// 250.59–254.50 "Der Mann da draußen sucht Menschen. Er will dahin, wo viele sind." — red dot searching
shot(250.59, 254.5, (c, lt, t) => { floorPlan(c, t, 248.0, { redSearch: true, notes: [{ t: 252.5, text: 'wo viele sind', x: 700, y: 60, col: '#d02a22' }] }); });
// 254.50–260.32 "Was, wenn du ihm sagst, wo „alle“ sind? Und an diesem Ort ist niemand. Außer ihm."
shot(254.5, 260.32, (c, lt, t) => {
  floorPlan(c, t, 248.0, { redSearch: t < 256.4, red: t >= 256.4 ? seg(t, 256.4, 259.3) : 0, falle: t > 258.0, notes: [{ t: 255.3, arrow: [700, 330, 1300, 620] }, { t: 256.2, text: '„alle“', x: 1000, y: 420, size: 54 }, { t: 258.0, circle: [1320, 660], r: 170 }, { t: 259.3, text: 'FALLE', x: 1320, y: 800, size: 64 }] });
});
// 260.32–271.35 "Und jetzt kommt der Trick…" — teachers stay; every classroom: "bleibt zu"; only the police opens doors
shot(260.32, 266.93, (c, lt, t) => {
  floorPlan(c, t, 248.0, { falle: true, speaker: t > 266.0, closed: t > 264.3, notes: [{ t: 261.0, text: 'Der Trick:', x: 330, y: 600, size: 50, col: '#2f8a4a' }, { t: 264.6, text: 'Bei Alarm verlässt keiner den Raum', x: 560, y: 680, size: 36, col: '#2f8a4a' }] });
});
shot(266.93, 271.35, (c, lt, t) => {
  // a classroom door from the corridor; a speaker crackles; it stays shut — badge "Nur die Polizei"
  const cam = lookAt([2.6, 1.5, 16.5], [.2, 1.3, 20.5], { fov: 40 });
  corridorAlarm(c, t, cam, null);
  hudTag(c, t, 267.4, W - 420, 170, 'Tür bleibt zu', { size: 50, bar: '#2f8a4a' });
  if (t > 269.2) { c.save(); c.translate(W / 2, H / 2 + 60); c.scale(easeBack(seg(t, 269.2, 269.6)), easeBack(seg(t, 269.2, 269.6))); c.beginPath(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; c.lineTo(Math.cos(a) * 140, Math.sin(a) * 160); } c.closePath(); c.fillStyle = '#2f4f86'; c.fill(); c.lineWidth = 10; c.strokeStyle = '#f2c230'; c.stroke(); star(c, 0, -20, 60, '#f2c230'); txt(c, 'POLIZEI', 0, 90, 40, '#fff', 'center'); c.restore(); hudTag(c, t, 269.7, W / 2, H / 2 + 290, 'Die Tür macht nur die Polizei auf', { size: 44 }); }
});
// 271.35–275.85 "Das heißt: Alle bleiben, wo sie sind. Nur einer fällt auf die Durchsage rein."
shot(271.35, 275.85, (c, lt, t) => {
  floorPlan(c, t, 248.0, { falle: true, closed: true, speaker: true, red: seg(t, 273.8, 275.6), notes: [{ t: 273.9, text: 'nur einer', x: 980, y: 560, size: 46 }] });
});
