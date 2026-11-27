// Sections 8 (radio, HILFE, horde grows), 9 (TAG 30 rescue), 10 (outro). SOURCE times.
function radioScene(c, t, lt, o) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#16120e'; c.fillRect(0, 0, W, H); bloom(c, 700, 300, 700, '255,180,90', .3);
  c.fillStyle = '#5a3e26'; c.fillRect(0, 740, W, 340); c.fillStyle = '#3a2816'; c.fillRect(0, 740, W, 24);
  c.fillStyle = '#2a2e36'; c.beginPath(); c.roundRect(620, 440, 760, 300, 20); c.fill(); c.lineWidth = 10; c.strokeStyle = '#0a0a0a'; c.stroke();
  c.fillStyle = '#0c1a10'; c.fillRect(660, 480, 420, 180); c.strokeStyle = '#3aff6a'; c.lineWidth = 4; c.beginPath();
  for (let x = 0; x < 420; x += 3) { const n = (rnd(Math.floor(t * 30) * 7 + x) - .5) * 120, v = o.voice ? Math.sin(x * .12 + t * 20) * 50 * Math.abs(Math.sin(x * .02 + t * 4)) + n * .25 : n; c.lineTo(660 + x, 570 + v); } c.stroke();
  for (let i = 0; i < 2; i++) { const a = t * (i ? -1.3 : .9); c.fillStyle = '#9aa0aa'; circle(c, 1180 + i * 130, 560, 46); c.fill(); line(c, [1180 + i * 130, 560, 1180 + i * 130 + Math.cos(a) * 38, 560 + Math.sin(a) * 38], 8, '#1a1a1a'); }
  c.fillStyle = '#1a1a1a'; c.fillRect(260, 600, 260, 140); c.fillStyle = '#d83a3a'; c.fillRect(290, 580, 40, 24); c.fillStyle = '#3a3a3a'; c.fillRect(450, 580, 40, 24); c.font = '700 30px FOswald'; c.fillStyle = '#c8c8c8'; c.fillText('12V', 350, 690);
  line(c, [520, 640, 620, 600], 8, '#c83a2a'); line(c, [1300, 440, 1340, 60], 8, '#2a2a2a');
  drawPerson(c, PEOPLE.imani, { x: 1650, y: 1240, k: .5, expr: { mouth: o.voice ? 'o' : 'flat', browUp: o.voice ? 1 : .3, look: -.8 }, arms: { l: { a: 1.1, b: .9 } } });
  c.restore();
  if (o.label) bigText(c, o.label, 870, 340, 90, o.voice ? '#7affa0' : '#9aa4b8', pop(lt, .2));
  if (o.sub) o.sub.forEach(([tt, s], i) => { if (t > V(tt)) { const a = pop(t, V(tt)); c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,.65)'; c.font = '700 56px FType'; const w = c.measureText(s).width; c.fillRect(W / 2 - w / 2 - 30, 860 + i * 90 - 50, w + 60, 80); c.fillStyle = '#7affa0'; c.textAlign = 'center'; c.fillText(s, W / 2, 878 + i * 90); c.restore(); } });
  vignette(c, .5);
}
function hilfePaint(c, t, lt) {
  const p = ez(clamp(lt / 6));
  roofScene(c, t, lt, { tod: 'night', barrels: 1, planters: 3, door: 1, antenna: 1, z0: 1.1, z1: 1.18, cy: -250, act: [{ w: 'jamal', x: -700, y: 40, pose: 'front', expr: { mouth: 'flat' }, arms: { r: { a: .9, b: 1.0 } } }, { w: 'noah', x: 380, y: 60, pose: 'front', expr: { mouth: 'flat' }, arms: { r: { a: .8, b: 1.1 } } }, { w: 'nia', x: 650, y: 70, pose: 'front', expr: { mouth: 'grin' } }],
    extra: (c) => { c.save(); c.beginPath(); c.rect(-1100, -400, 2200 * p, 800); c.clip(); roofHILFE(c, 0, -70, 1900, .27, .9); c.restore(); for (let i = 0; i < 4; i++) { c.fillStyle = ['#e8e8e8', '#f0e070', '#e8e8e8', '#d0d0d8'][i]; c.fillRect(-860 + i * 520, -20, 60, 70); } } });
}
function hordeCard(c, t, lt) {
  card(c, t, lt, { title: 'VOR DEN TÜREN', bg: ['#1e1010', '#060303'], draw: (c, t, lt) => {
    const a = pop(t, V(438.72) - .1), b = pop(t, V(441.64) - .1), n = b > 0 ? Math.round(lerp(40, 300, ez(clamp((t - V(441.64)) / 1.2)))) : 40;
    c.save(); c.globalAlpha = a; c.font = '90px FBebas'; c.fillStyle = '#9aa4b8'; c.fillText(b > 0 ? 'TAG 27' : 'TAG 20', 220, 300); c.font = '260px FAnton'; c.fillStyle = b > 0 ? '#ff4a3a' : '#f6f0e6'; c.fillText(String(n), 200, 560);
    for (let i = 0; i < n; i++) icon(c, 'zombie', 980 + (i % 20) * 40, 260 + Math.floor(i / 20) * 50, .32, i < 40 ? '#8a7a70' : '#c83a2a'); c.restore();
    if (t > V(444.28)) { const d = pop(t, V(444.28)); c.save(); c.globalAlpha = d; c.fillStyle = '#080404'; c.fillRect(0, 0, W, H); c.font = '90px FBebas'; c.fillStyle = '#9aa4b8'; c.fillText('TAG 28', 380, 420); c.font = '200px FAnton'; c.fillStyle = '#ff9a4a'; c.fillText('DIESEL: LEER', 360, 640); c.restore(); }
    if (t > V(446.7)) { const e = pop(t, V(446.7)); c.save(); c.globalAlpha = e; c.fillStyle = '#080404'; c.fillRect(0, 0, W, H); c.font = '90px FBebas'; c.fillStyle = '#9aa4b8'; c.fillText('TAG 29', 380, 420); icon(c, 'can', 520, 660, 2.4, '#c8a040'); c.font = '150px FAnton'; c.fillStyle = '#f6f0e6'; c.fillText('LETZTE DOSE', 760, 720); c.restore(); }
  } });
}
function heli(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); c.rotate(o.tilt || 0);
  c.fillStyle = '#2a3428'; c.beginPath(); c.ellipse(0, 0, 260, 120, 0, 0, Math.PI * 2); c.fill(); c.fillRect(150, -40, 420, 60); c.beginPath(); c.moveTo(540, -40); c.lineTo(600, -160); c.lineTo(640, -160); c.lineTo(600, 20); c.fill();
  c.lineWidth = 10; c.strokeStyle = '#0a0c08'; c.beginPath(); c.ellipse(0, 0, 260, 120, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#8ab0c8'; c.beginPath(); c.ellipse(-150, -30, 90, 60, -.3, 0, Math.PI * 2); c.fill(); c.stroke();
  line(c, [-150, 120, -150, 160, 180, 160], 12, '#0a0c08'); line(c, [100, 120, 100, 160], 12, '#0a0c08');
  c.fillRect(-12, -150, 24, 40); const r = t * 40; for (let i = 0; i < 2; i++) { const L = Math.cos(r + i * Math.PI / 2) * 520; line(c, [-L, -150, L, -150], 10, 'rgba(20,24,20,.85)'); }
  const tr = t * 50; line(c, [620 + Math.cos(tr) * 70, -100 + Math.sin(tr) * 70, 620 - Math.cos(tr) * 70, -100 - Math.sin(tr) * 70], 8, '#0a0c08');
  c.fillStyle = '#f6f0e6'; c.font = '700 54px FOswald'; c.fillText('BW', 230, 0);
  if (o.light) { c.fillStyle = '#fffbe0'; circle(c, -200, 90, 22); c.fill(); }
  c.restore();
}
function rescue(c, t, lt, o) {
  roofScene(c, t, lt, { tod: 'night', barrels: 1, planters: 3, door: 1, hilfe: o.spot ? 1 : .85, z0: 1.0, z1: 1.04, cy: -360, act: o.act,
    extra: (c, t, lt) => {
      if (o.door) { const b = o.door; c.save(); c.translate(770, -390); if (b > 1) { c.fillStyle = '#05060a'; c.fillRect(-90, -80, 180, 220); for (let i = 0; i < 3; i++) drawZombieFront(c, HORDE[i + 2], { x: -40 + i * 40, y: 140, k: .14, t: t + i, dim: .4 }); } else { const d = Math.sin(t * 30) * 4 * b; c.translate(d, 0); shelfUnit(c, 0, 140, 220, 200, { seed: 8 }); } c.restore(); }
    } });
  if (o.heli) { const [hx, hy, hs] = o.heli; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); if (o.spot) { const g = c.createLinearGradient(hx, hy, 960, 900); g.addColorStop(0, 'rgba(255,250,220,.55)'); g.addColorStop(1, 'rgba(255,250,220,.08)'); c.fillStyle = g; c.beginPath(); c.moveTo(hx - 20, hy + 40); c.lineTo(hx + 20, hy + 40); c.lineTo(1500, 1000); c.lineTo(400, 1000); c.closePath(); c.globalCompositeOperation = 'screen'; c.fill(); c.globalCompositeOperation = 'source-over'; } heli(c, hx, hy, hs, t, { light: o.spot, tilt: o.tilt || 0 }); c.restore(); }
  if (o.wind) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.strokeStyle = 'rgba(200,210,230,.35)'; c.lineWidth = 3; for (let i = 0; i < 60; i++) { const x = (rnd(i) * W + t * 900 * (i % 2 ? 1 : -1)) % W, y = 700 + rnd(i + 3) * 380; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 60, y - 4); c.stroke(); } c.restore(); }
}
const BOARD = (lt) => { const order = [['grace', V(496.38)], ['nia', V(497.46)], ['imani', V(498.3)], ['jamal', V(499.2)]]; return order.map(([w, t0], i) => ({ w, x: -700 + i * 160, y: 10 + i * 10, s: 1, v: 0, pose: 'side', _t0: t0 })); };
const SECTION8 = [
  [394.96, 'fn', { f: (c, t, lt) => { sickScene(c, t, lt, {}); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2a2420'; c.fillRect(380, 300, 1200, 420); c.restore(); c.fillStyle = '#4a5a3a'; c.fillRect(380, 640, 1150, 70); drawPerson(c, PEOPLE.nia, { x: 960, y: 700, k: .55, sit: true, seatH: 30, expr: { mouth: 'grin' }, arms: { r: { a: 2.5, b: .4 } } }); if (t > V(398.22)) bubble(c, 'RADIESCHEN!', 1260, 260, pop(t, V(398.22))); } }],
  [399.54, 'fn', { f: (c, t, lt) => radioScene(c, t, lt, {}) }],
  [407.82, 'fn', { f: (c, t, lt) => radioScene(c, t, lt, { label: t > V(410.06) ? 'RAUSCHEN. NUR RAUSCHEN.' : '' }) }],
  [412.4, 'fn', { f: (c, t, lt) => { radioScene(c, t, lt, { voice: t > V(414.28), label: t > V(416.44) ? 'MILITÄR' : '', sub: [[419.7, 'EVAKUIERUNG IN SECHS TAGEN.'], [421.58, 'ÜBERLEBENDE, MARKIERT EURE DÄCHER.']] }); dayStamp(c, 'TAG 24', 'FUNKGERÄT', lt); } }],
  [423.5, 'fn', { f: hilfePaint }],
  [430.02, 'fn', { f: (c, t, lt) => { hilfePaint(c, t, 6 + lt); if (t > V(430.6)) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${.6 * pop(t, V(430.6))})`; c.fillRect(0, 0, W, H); c.restore(); bigText(c, 'ABER IHR HABT EINEN FEHLER GEMACHT.', W / 2, 300, 80, '#ff9a4a', pop(t, V(430.6))); } } }],
  [433.04, 'lot', { c0: [0, 5, 52], c1: [0, 6, 56], l0: [0, 8, 0], fov: 50, act: ZZ(24, -16, 6, 3).map(a => ({ ...a, pose: 'front', dim: .5 })), fx: (c, t, lt, P) => { const q = P(0, 22, -10); bloom(c, q.x, q.y, 500, '255,220,150', .35 + .15 * Math.sin(t * 6)); for (const [x, s] of [[433.04, 'DER GENERATOR'], [434.36, 'DAS LICHT'], [434.8, 'DAS HIN UND HER']]) if (t > V(x)) bigText(c, s, 380 + [433.04, 434.36, 434.8].indexOf(x) * 560, 150, 62, '#ffd84a', pop(t, V(x))); } }],
  [438.72, 'fn', { f: hordeCard }],
];
const SECTION9 = [
  [450.04, 'fn', { f: (c, t, lt) => { shot2(c, SH.s2 + lt); dayStamp(c, 'TAG 30', '03:00 UHR', lt); } }],
  [453.38, 'fn', { f: (c, t, lt) => { shotCrack(c, T.knack - .1 + lt * .6); if (lt < .15) { c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(0, 0, W, H); } } }],
  [454.9, 'fn', { f: (c, t, lt) => { shot2(c, SH.s2 + 2 + lt); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const f = ez(clamp((t - V(456.46)) / .6)); for (let i = 0; i < 4; i++) { c.save(); c.translate(180 + i * 440, 920); c.rotate(-f * (1.2 + i * .1) * (i % 2 ? 1 : .9)); shelfUnit(c, 0, 0, 400, 640, { seed: i }); c.restore(); } c.fillStyle = `rgba(255,255,255,${lt < .12 ? .35 : 0})`; c.fillRect(0, 0, W, H); c.restore(); } }],
  [458.44, 'atr', { mood: 'night', c0: [0, 1.6, 16], c1: [0, 1.6, 14], l0: [0, 2, -20], fov: 54, act: Array.from({ length: 20 }, (_, i) => ({ w: 'z' + (10 + i), x: -6 + (i % 7) * 2, z: -14 + Math.floor(i / 7) * 4 + rnd(i) * 2, s: rnd(i + 2) > .5 ? 1 : -1, v: .5, dim: .45 })) }],
  [460.56, 'fn', { f: (c, t, lt) => rescue(c, t, lt, { door: lt > 1.6 ? .2 : 0, act: [{ w: 'noah', x: lerp(600, 100, ez(clamp(lt / 1.6))), y: 0, s: -1, v: 0 }, { w: 'jamal', x: lerp(800, 400, ez(clamp(lt / 1.6))), y: -30, pose: 'side', s: 1 }, { w: 'nia', x: lerp(650, -200, ez(clamp(lt / 1.3))), y: 20, s: -1 }, { w: 'grace', x: lerp(700, -420, ez(clamp(lt / 1.4))), y: -20, s: -1 }, { w: 'imani', x: lerp(720, -650, ez(clamp(lt / 1.5))), y: -40, s: -1 }] }) }],
  [464.68, 'fn', { f: (c, t, lt) => { rescue(c, t, lt, { door: .6 + lt * .15, act: [] }); if (Math.floor(t * 4) % 2 === 0) bigText(c, 'BUMM!', 1300 + rnd(Math.floor(t * 4)) * 200, 260, 110, '#f6f0e6', 1); } }],
  [468.98, 'fn', { f: (c, t, lt) => shot3(c, SH.s3 + 1.5 + lt * .8) }],
  [473.28, 'fn', { f: (c, t, lt) => shot4(c, T.torch_flicker[0][0] - .2 + lt) }],
  [474.74, 'fn', { f: (c, t, lt) => shot4(c, T.tilt[1] + lt) }],
  [476.46, 'fn', { f: (c, t, lt) => { shot4(c, T.tilt[1] + 1.6 + lt * .3); const s = t > V(479.12) ? '3:50' : '3:40'; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = '260px FVHS'; c.textAlign = 'center'; c.fillStyle = '#ff6a5a'; c.shadowColor = 'rgba(255,60,60,.7)'; c.shadowBlur = 30; c.fillText(s + ' UHR', W / 2, 600); c.restore(); if (t > V(478.3) && t < V(479.12)) bigText(c, 'NICHTS.', W / 2, 780, 90, '#f6f0e6', pop(t, V(478.3))); } }],
  [480.42, 'fn', { f: (c, t, lt) => { rescue(c, t, lt, { door: 1.0, act: [] }); bigText(c, 'DELLE', 1250, 220, 80, '#ff9a4a', pop(lt, .3)); } }],
  [482.16, 'fn', { f: (c, t, lt) => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#070a14'; c.fillRect(0, 0, W, H); bloom(c, W / 2, H / 2, 900, '255,200,140', .35); const p = ez(clamp(lt / 1.2)); drawNoahHand(c, 1100, 260, 2.4, .3); c.save(); c.translate(lerp(380, 860, p), lerp(900, 640, p)); c.rotate(-.9); c.scale(2.8, 2.8); pHand(c, 0, 0, 0, .8); c.restore(); c.restore(); vignette(c, .6); } }],
  [483.9, 'fn', { f: (c, t, lt) => { shot4(c, T.look_up + .1 + lt * .04); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < 4; i++) { const ph = (lt * .6 + i / 4) % 1; c.strokeStyle = `rgba(220,230,255,${(1 - ph) * .5 * clamp(lt / 2)})`; c.lineWidth = 6; c.beginPath(); c.arc(W / 2, -200, 200 + ph * 900, .3, Math.PI - .3); c.stroke(); } c.restore(); if (t > V(488.8)) bigText(c, 'ROTOREN.', W / 2, 860, 120, '#f6f0e6', pop(t, V(488.8))); } }],
  [489.9, 'fn', { f: (c, t, lt) => rescue(c, t, lt, { door: 1.0, heli: [lerp(1500, 1100, ez(clamp(lt / 4))), lerp(-100, 120, ez(clamp(lt / 4))), .45], spot: 1, act: [{ w: 'noah', x: 200, y: 40, pose: 'front', expr: { mouth: 'o', browUp: 1 } }, { w: 'nia', x: 380, y: 50, pose: 'front', expr: { mouth: 'grin' }, arms: { r: { a: 2.7, b: .3 } } }] }) }],
  [494.82, 'fn', { f: (c, t, lt) => { const lt2 = t - V(496.38); rescue(c, t, lt, { door: 1.0, heli: [lerp(1100, 1250, ez(clamp(lt / 1.5))), lerp(120, 520, ez(clamp(lt / 1.5))), .7], spot: 1, wind: 1, act: BOARD().filter(a => t < a._t0 + 1.2).map(a => ({ ...a, x: a.x + (t > a._t0 ? (t - a._t0) * 900 : 0), v: 0, pose: t > a._t0 ? 'walk' : 'side' })).concat([{ w: 'noah', x: -900, y: 30, s: 1 }]) }); } }],
  [500.36, 'fn', { f: (c, t, lt) => { const burst = t > V(502.2); rescue(c, t, lt, { door: burst ? 2 : 1, heli: [1250, 520, .7], spot: 1, wind: 1, act: [{ w: 'noah', x: lerp(-200, 520, ez(clamp(lt / 1.6))), y: 30, s: 1, v: 0, pose: 'side' }] }); if (burst && t < V(502.4)) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, 0, W, H); } } }],
  [504.64, 'lot', { c0: [0, 30, 30], c1: [0, 70, 80], l0: [0, 18, -6], l1: [0, 10, -10], fov: 50, act: ZZ(30, -20, 3, 2).map(a => ({ ...a, pose: 'front' })), fx: (c, t, lt) => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H * .6); g.addColorStop(0, `rgba(255,170,110,${.25 * ez(clamp(lt / 8))})`); g.addColorStop(1, 'rgba(255,170,110,0)'); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); } }],
  [515.2, 'card', { bg: ['#1a1a24', '#06060a'], draw: (c, t, lt) => { [[515.2, '30', 'TAGE'], [516.58, '5', 'ÜBERLEBENDE'], [518.0, '0', 'VERLUSTE']].forEach(([tt, n, s], i) => { const a = pop(t, V(tt)); if (a <= 0) return; bigText(c, n, 420 + i * 540, 470, 300, i === 2 ? '#7affa0' : '#f6f0e6', a); c.save(); c.globalAlpha = a; c.font = '600 54px FOswald'; c.fillStyle = '#ffb36b'; c.textAlign = 'center'; spaced(c, s, 420 + i * 540, 700, 8); c.restore(); }); } }],
];
const SECTION10 = [
  [519.5, 'card', { title: 'JETZT BIST DU DRAN', draw: (c, t, lt) => { bigText(c, 'WAS HÄTTEST DU DIR', W / 2, 400, 130, '#f6f0e6', pop(lt, .3)); bigText(c, 'ALS ERSTES GEHOLT?', W / 2, 560, 130, '#ff9a4a', pop(lt, .8)); const it = ['plate', 'can', 'bolt', 'bottle', 'lock']; it.forEach((k, i) => { const a = pop(lt, 1.4 + i * .2); c.save(); c.globalAlpha = a; icon(c, k, 560 + i * 200, 780, 1.1, '#9aa4b8'); c.restore(); }); if (t > V(524.36)) { c.save(); c.globalAlpha = pop(t, V(524.36)); c.fillStyle = '#ff9a4a'; c.beginPath(); c.roundRect(560, 880, 800, 110, 55); c.fill(); c.font = '600 50px FOswald'; c.fillStyle = '#1a0e06'; c.textAlign = 'center'; c.fillText('SCHREIB ES IN DIE KOMMENTARE', W / 2, 952); c.restore(); } } }],
  [525.9, 'fn', { f: (c, t, lt) => { rescue(c, t, lt, { door: 1.0, act: [{ w: 'noah', x: 200, y: 40, pose: 'front', expr: { mouth: 'flat', browUp: .6 } }] }); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${.55 * pop(lt, 1.5)})`; c.fillRect(0, 0, W, H); c.restore(); if (t > V(528.52)) { bigText(c, 'WAS WÄRE PASSIERT,', W / 2, 420, 110, '#f6f0e6', pop(t, V(528.52))); bigText(c, 'WENN DER HUBSCHRAUBER', W / 2, 560, 110, '#f6f0e6', pop(t, V(529.4))); bigText(c, 'NICHT GEKOMMEN WÄRE?', W / 2, 700, 110, '#ff6a5a', pop(t, V(530.2))); } const fo = clamp((t - (T.end - 1.6)) / 1.4); if (fo > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${fo})`; c.fillRect(0, 0, W, H); c.restore(); } } }],
];
MAIN = MAIN.concat(SECTION8, SECTION9, SECTION10);
