// Section 07 (240,9–265,1): the dōjō.
const SWING = (lt, sp = 6) => { const s = Math.sin(lt * sp); return { r: { a: 1.6 + s * .9, b: -.3, fist: true }, l: { a: 1.4 + s * .8, b: -.5, fist: true } }; };
function bokkenInHands(c, x, y, k, arms, s = 1) { const P = samArmPts(1, arms.r); c.save(); c.translate(x + P.wx * k * s, y + P.wy * k); c.rotate(-Math.PI / 2 - (arms.r.a - 1.6) * 1.4); drawBokken(c, 0, 0, k * 1.3); c.restore(); }
SH(240.90, '07 Morgens zum Training', { ang: 'wide', tr: { type: 'ink', dur: .5, seed: 51 }, sfx: [[0, 'ink', -10], [0.4, 'steps', -14]], amb: 'morning' }, (c, lt) => {
  const x = 200 + lt * 150, cm = cam(x + 300, 560, 1.15); villageSet(c, cm, lt); layer(c, cm, 1, c => NS(c, x, 1000, .3, { walk: lt * 8, expr: ex('focus', lt, 39), outfit: 'nohaori' })); vignette(c, .3);
});
SH(244.00, '07 Die Halle aus Holz', { ang: 'wide', sfx: [[0.2, 'doorSlide', -10], [0.6, 'woodCreak', -16]], amb: 'dojo' }, (c, lt) => { dojoSet(c, cam(960 + lt * 30, 540, push(lt, 2.8, 1, 1.08)), lt); vignette(c, .4); });
SH(246.80, '07 Schweißtropfen (Makro, langsam)', { ang: 'macro', sfx: [[1.6, 'drop', -8]], amb: 'dojo' }, (c, lt) => {
  fill(c, '#5a3a22'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#3a2616'], [1, '#7a5232']]); c.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) stroke(c, [0, 700 + i * 34, W, 690 + i * 34], 3, 'rgba(30,18,10,.5)');
  const k = easeIn(seg(lt, .3, 1.6)); c.save(); c.translate(960, 100 + k * 760); c.beginPath(); c.moveTo(0, -50); c.quadraticCurveTo(40, 10, 0, 40); c.quadraticCurveTo(-40, 10, 0, -50); c.fillStyle = 'rgba(220,235,255,.85)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(80,100,120,.6)'; c.stroke(); c.restore();
  const s = seg(lt, 1.6, 2.4); if (s > 0) for (let i = 0; i < 10; i++) { const a = -Math.PI + i / 9 * Math.PI; circ(c, 960 + Math.cos(a) * s * 160, 880 + Math.sin(a) * s * 90 + s * s * 80, 8 * (1 - s)); c.fillStyle = 'rgba(220,235,255,.8)'; c.fill(); } vignette(c, .4);
});
const REP = [[249.30, 'wide', 1.0], [250.00, 'low', 1.6], [250.70, 'closeup', 2.2], [251.40, 'side', 1.3], [252.00, 'overhead', 1.0], [252.60, 'medium', 1.4]];
REP.forEach(([t0, ang, z], i) => SH(t0, '07 Wiederholung ' + (i + 1), { ang, sfx: [[0.15, 'swish', -8], [0.3, 'kiai', -20]], amb: 'dojo' }, (c, lt) => {
  dojoSet(c, cam(960, ang === 'low' ? 380 : 560, z), lt + i); const a = SWING(lt * 1.4 + 1.2);
  if (ang === 'side') NS(c, 900, 1100, .45, { outfit: 'nohaori', expr: ex('focus', lt, 40), arms: { near: { hand: [200 + Math.sin(lt * 8) * 150, -1100 + Math.sin(lt * 8) * 400], fist: true }, far: { hand: [180 + Math.sin(lt * 8) * 150, -1050 + Math.sin(lt * 8) * 400], fist: true } } });
  else if (ang === 'overhead') { c.save(); c.translate(960, 540); c.rotate(lt); c.translate(-960, -540); drawSamHead(c, 960, 540, .8, ex('focus', lt, 41)); c.restore(); stroke(c, [960, 540, 960 + Math.cos(lt * 9) * 500, 540 + Math.sin(lt * 9) * 500], 30, '#b08050'); }
  else { const k = { wide: .4, low: .62, closeup: .95, medium: .55 }[ang], y = { wide: 1000, low: 1320, closeup: 1800, medium: 1250 }[ang]; NF(c, 960, y, k, { outfit: 'nohaori', haori: false, swords: false, expr: ex('focus', lt, 42), arms: a }); bokkenInHands(c, 960, y, k, a); }
  vignette(c, .35);
}));
SH(253.20, '07 Zehntausendmal (Zeitraffer)', { ang: 'wide', sfx: [[0, 'swishFast', -10]], amb: 'dojo' }, (c, lt) => {
  dojoSet(c, cam(960, 560, 1.1), lt * 6); const a = SWING(lt * 4, 9); NF(c, 960, 1080, .48, { haori: false, swords: false, expr: ex('focus', lt, 43), arms: a }); bokkenInHands(c, 960, 1080, .48, a);
  c.save(); c.globalAlpha = .2 + .15 * Math.sin(lt * 3); fill(c, lt % 1 < .5 ? '#ffe0a0' : '#a0b0d0'); c.restore(); vignette(c, .35);
});
SH(255.50, '07 Bis der Körper es im Schlaf kann', { ang: 'closeup', sfx: [[0.2, 'swish', -12], [1.2, 'swish', -12]], amb: 'dojo' }, (c, lt) => {
  dojoSet(c, cam(960, 300, 1.6), lt); const a = SWING(lt, 3); NF(c, 960, 1750, .95, { haori: false, swords: false, expr: EX.closed, arms: a }); vignette(c, .4);
});
SH(257.80, '07 Partnerübung: Holz auf Holz', { ang: 'medium', tr: { type: 'cut', dur: .3, ang: -.3 }, sfx: [[0.2, 'bokkenClash', -6], [0.8, 'bokkenClash', -6], [1.5, 'bokkenClash', -6], [2.4, 'bokkenClash', -6]], amb: 'dojo' }, (c, lt) => {
  dojoSet(c, cam(960, 600, 1.2), lt); const s = Math.sin(lt * 7);
  NS(c, 700, 1020, .36, { outfit: 'nohaori', expr: ex('alert', lt, 44), arms: { near: { hand: [380 + s * 60, -800 - s * 200], fist: true }, far: { hand: [360 + s * 60, -780 - s * 200], fist: true } } });
  PS(c, 'father', 1220, 1020, .36, { s: -1, swords: false, expr: EX.alert, arms: { near: { hand: [380 - s * 60, -800 + s * 200], fist: true }, far: { hand: [360 - s * 60, -780 + s * 200], fist: true } } });
  stroke(c, [700 + 140, 1020 - 290 - s * 70, 960, 700 - s * 60], 16, '#b08050'); stroke(c, [1220 - 140, 1020 - 290 + s * 70, 960, 700 + s * 60], 16, '#b08050');
  if (Math.abs(Math.cos(lt * 7)) > .95) bloom(c, 960, 700, 120, '255,240,200', .5); vignette(c, .35);
});
SH(261.00, '07 Ein Schlag entscheidet (eingefroren)', { ang: 'low', sfx: [[0.15, 'bokkenClash', -2], [0.2, 'freezeHit', -10], [0.6, 'brush', -10]], amb: 'dojo' }, (c, lt) => {
  const f = freeze(lt, .2); dojoSet(c, cam(960, 420, 1.4), f); const k = ease(seg(f, 0, .2));
  NS(c, 760, 1150, .5, { outfit: 'nohaori', expr: { lid: .05, mouth: 'flat' }, arms: { near: { hand: [400 + k * 300, -900 + k * 400], fist: true }, far: { hand: [380 + k * 300, -880 + k * 400], fist: true } } });
  if (lt > .2) { c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.6)'; c.fillRect(0, 0, W, H); c.restore(); }
  NOTE(c, lt, 'Ein Schlag entscheidet.', 1380, 300, .5, { size: 66 }); vignette(c, .45);
});
SH(263.20, '07 Wer zu spät ist…', { ang: 'macro', sfx: [[0.2, 'heartbeat', -10], [1.7, 'taiko', -4]] }, (c, lt) => {
  dojoSet(c, cam(960, 500, 2.4), 0); c.save(); c.translate(-400 + ease(seg(lt, 0, .5)) * 500, 540); drawBokken(c, 0, 0, 1.4); c.restore();
  c.save(); c.translate(1600, 700); drawSamHead(c, 0, 0, 1.0, { lid: 0, browUp: 1, mouth: 'flat' }); c.restore(); if (lt > 1.7) fill(c, '#000'); vignette(c, .5);
});
