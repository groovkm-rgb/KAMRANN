// SHOTS — timed to the voice-over (word times from Whisper, language de). TOTAL = mp3 + 0.5 s.
const TOTAL = 47.464 + 0.5;
const NK = .65;
// light rigs for Noah per mood
const LGOLD = { lx: -.85, ly: -.35, key: '255,190,110', keyA: .2, fill: '70,50,130', fillA: .34, rim: '255,205,130', rimA: 1, rimW: 10, rim2: '255,110,170', rim2A: .45 };
const LCOLD = { lx: -.9, ly: -.4, key: '190,215,245', keyA: .16, fill: '30,40,80', fillA: .45, rim: '200,225,255', rimA: 1, rimW: 10, rim2: '255,200,140', rim2A: .35 };
const LKITCH = { lx: .6, ly: -.8, key: '255,200,130', keyA: .18, fill: '40,60,80', fillA: .36, rim: '255,190,120', rimA: .95, rimW: 9, rim2: '200,230,255', rim2A: .4 };
const LDESK = { lx: -.8, ly: .1, key: '255,180,90', keyA: .25, fill: '20,30,90', fillA: .55, rim: '255,190,110', rimA: 1, rimW: 10, rim2: '110,140,255', rim2A: .7 };
const LREST = { lx: .2, ly: -1, key: '255,200,120', keyA: .22, fill: '40,15,30', fillA: .45, rim: '255,190,110', rimA: 1, rimW: 10, rim2: '255,140,80', rim2A: .5 };
const LNEON = { lx: -.7, ly: -.6, key: '255,120,190', keyA: .18, fill: '10,20,70', fillA: .55, rim: '255,90,170', rimA: 1, rimW: 11, rim2: '110,210,255', rim2A: .85 };

function noahAt(c, cam, P, L, p = 1, extra) {
  const [cx, cy] = toScreen(cam, p, P.x || 0, (P.y || 0) - 700 * (P.k || NK));
  layer(c, cam, p, c => {
    // contact shadow
    if (!P.noShadow) { c.save(); c.fillStyle = 'rgba(10,8,20,.45)'; c.filter = 'blur(6px)'; c.beginPath(); c.ellipse(P.x || 0, (P.y || 0) + 6, 230 * (P.k || NK), 40 * (P.k || NK), 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    lit(c, x => { drawNoah(x, Object.assign({ k: NK, ink: 1.8 }, P)); if (extra) extra(x); }, Object.assign({ cx, cy, R: 600 * (cam.z || 1) }, L));
  });
}
function personAt(c, cam, P, L, p = 1, extra) {
  const [cx, cy] = toScreen(cam, p, P.x || 0, (P.y || 0) - 700 * (P.k || .5));
  layer(c, cam, p, c => lit(c, x => { person(x, P); if (extra) extra(x); }, Object.assign({ cx, cy, R: 500 * (cam.z || 1) }, L)), P.blur || 0);
}
const blink = (lt, ts) => ts.some(b => lt > b && lt < b + .13) ? .95 : 0;
// a sheet of paper falling with flutter from (x0,y0) to (x1,y1) between t0..t1 (k 0..1)
function flutter(k, x0, y0, x1, y1) { const e = easeIn(k * .4 + .6 * k * k); return [lerp(x0, x1, k) + Math.sin(k * 9) * 120 * (1 - k), lerp(y0, y1, e), Math.sin(k * 7) * .5 * (1 - k)]; }

// =============== 1  HOOK: ribbon cut (0 – 1.86) ===============
shot(0, 1.86, (c, lt, t) => {
  const pk = easeOut(lt / 1.3), cam = { x: lerp(-30, 0, pk), y: lerp(40, -56, pk), z: lerp(.86, 1.06, pk), r: lerp(-.05, -.01, pk) };
  const cut = 1.38, after = lt > cut;
  const neon = after ? (lt < cut + .12 ? .6 : lt < cut + .2 ? .2 : 1) : .12 + (Math.sin(lt * 30) > .7 ? .25 : 0);
  m1Back(c, cam, t); m1Facade(c, cam, t, { neon }); m1Ground(c, cam, t);
  const ua = ease(seg(lt, cut + .05, cut + .3));
  const P = { x: 0, y: 820, arms: { l: { a: lerp(.32, 2.5, ua), b: lerp(-1.25, .25, ua) }, r: { a: lerp(.32, 2.35, ua), b: lerp(-1.25, -.2, ua) } }, expr: after ? { mouth: 'yawn', open: .55 * ua + .1, browUp: .7 * ua, eyes: lt > cut + .05 && lt < cut + .25 ? 'closed' : 'open' } : { mouth: 'smile', look: 0, browUp: .2 }, bob: after ? -bump(lt, cut + .05, cut + .45) * 60 : 0 };
  noahAt(c, cam, P, LGOLD, 1, x => {
    const hl = noahHand(P, -1), hr = noahHand(P, 1);
    if (!after || ua < .05) { const mx = (hl[0] + hr[0]) / 2, my = (hl[1] + hr[1]) / 2; const open = lt < 1.0 ? .8 + Math.sin(lt * 6) * .15 : lerp(.95, 0, seg(lt, 1.18, cut)); scissors(x, mx, my, -1.0, open, 1.1); }
    else scissors(x, hr[0], hr[1], -1.9, 0, 1.1);
  });
  m1Ribbon(c, cam, t, { cutK: after ? (lt - cut) / .8 : 0 });
  // confetti from cannons on both sides + from the cut
  layer(c, cam, 1.05, c => { confetti(c, 0, 520, lt - cut - .02, 90, 1); confetti(c, -470, 520, lt - cut - .05, 60, 7); confetti(c, 470, 520, lt - cut - .05, 60, 13); });
  // foreground: clapping bystanders (blurred), chalkboard
  layer(c, cam, 1.35, c => {
    chalkboard(c, -520, 1500, 1.4, t);
    const clap = after ? Math.abs(Math.sin(lt * 14)) : 0;
    person(c, { x: 560, y: 1700, k: .55, skin: '#8a5a3a', hair: { style: 'curly', col: '#1a1410' }, top: '#3e8fb0', arms: { l: { a: .7, b: -1.5 + clap * .3 }, r: { a: .7, b: -1.5 + clap * .3 } }, expr: { mouth: 'grin' } });
  }, 7);
  m1Light(c, cam, t);
});
// =============== 2  "Dein eigenes Restaurant. Endlich!"  (1.86 – 4.60) ===============
shot(1.86, 4.60, (c, lt, t) => {
  // tilt up to the sign & sky, back down for the jump, push in for the slap
  const up = ease(seg(lt, 0, 1.2)), down = ease(seg(lt, 1.25, 1.95)), slap = ease(seg(lt, 2.2, 2.6));
  const cam = { x: lerp(40, 0, up), y: lerp(lerp(-80, -560, up), -40, down) + lerp(0, -40, slap), z: lerp(lerp(1.05, .82, up), 1.12, down) + slap * .45, r: Math.sin(lt * .9) * .012 };
  m1Back(c, cam, t); m1Facade(c, cam, t, { neon: 1 }); m1Ground(c, cam, t);
  const jump = bump(lt, 1.98, 2.5), slapT = 2.54, slapped = lt > slapT;
  const P = { x: 0, y: 820 - jump * 230, arms: slapped ? { l: { a: 1.4 + Math.sin(lt * 25) * .5, b: -.5 }, r: { a: 1.3 + Math.cos(lt * 23) * .5, b: -.6 } } : { l: { a: 2.45 - jump * .25, b: .2 }, r: { a: 2.3 - jump * .2, b: -.2 } }, expr: slapped ? { mouth: 'o', browUp: 1 } : { mouth: 'yawn', open: .45 + jump * .35, browUp: .6, eyes: jump > .4 ? 'closed' : 'open' }, legs: [jump * 60, jump * 40] };
  noahAt(c, cam, Object.assign({ noShadow: jump > .1 }, P), LGOLD, 1, x => { const hr = noahHand(P, 1); if (!slapped) scissors(x, hr[0], hr[1], -1.9 + jump * .3, 0, 1.1); });
  layer(c, cam, 1, c => { c.save(); c.fillStyle = 'rgba(10,8,20,.35)'; c.filter = 'blur(8px)'; c.beginPath(); c.ellipse(0, 826, 150 * (1 - jump * .4), 26, 0, 0, Math.PI * 2); c.fill(); c.restore(); });
  // the first bill floats down from the sky onto his face
  const [hx, hy] = noahHeadPos(P);
  layer(c, cam, 1.02, c => {
    if (!slapped) { const k = seg(lt, .7, slapT - 1.86 + 1.86 - 1.86 + 0), kk = seg(lt, .7, slapT); const [bx, by, ba] = flutter(kk, 260, -1500, hx, hy); bill(c, bx, by, ba + .2, 'Rechnung', .55); }
    else { bill(c, hx + 8, hy + 10, -.08 + Math.sin(lt * 30) * .03 * (1 - seg(lt, slapT, slapT + .3)), 'Rechnung', .62); }
    // more bills start raining
    for (let i = 0; i < 8; i++) { const k = seg(lt, 2.3 + i * .05, 3.4 + i * .05); if (k > 0) { const [bx, by, ba] = flutter(k, -500 + i * 140, -1300 - i * 60, -450 + i * 130 + (i % 2) * 80, 1100); bill(c, bx, by, ba + i, ['Rechnung', 'Miete', 'Strom', 'Personal'][i % 4], .45, { back: i % 3 === 0 }); } }
  });
  layer(c, cam, 1.3, c => { confetti(c, 0, 400, lt + .48, 70, 3); }, 3);
  m1Light(c, cam, t);
});
// =============== 3a  M2 dusty hall, wallet (4.60 – 6.38) ===============
shot(4.60, 6.38, (c, lt, t) => {
  const k = ease(lt / 1.78), cam = { x: lerp(-60, 0, k), y: lerp(-320, -40, k), z: lerp(1.0, 1.12, k), r: .01 };
  m2Back(c, cam, t, { paint: .2 + lt * .1 });
  // worker on the ladder rolling paint in the back
  personAt(c, cam, { x: 520, y: 160, k: .38, skin: '#e8b48a', hair: { style: 'short', col: '#6a3a1a' }, top: '#d9d3c4', overalls: '#3f6fa0', hat: 'hard', arms: { l: { a: .3, b: 0 }, r: { a: 2.6, b: -.3 + Math.sin(t * 5) * .4 } }, expr: { mouth: 'smile', look: -.8 } }, LCOLD, .85);
  const op = ease(seg(lt, 1.0, 1.6));
  const P = { x: 0, y: 820, arms: { l: { a: .3, b: -1.3 }, r: { a: .3, b: -1.3 } }, expr: { mouth: op > .5 ? 'flat' : 'smile', look: op > .3 ? 0 : -.4, browUp: op * .5, lid: op * .2 } };
  noahAt(c, cam, P, LCOLD, 1, x => { const hl = noahHand(P, -1), hr = noahHand(P, 1); wallet(x, (hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 - 40, op, .75); });
  m2Front(c, cam, t);
  m2Light(c, cam, t);
}, { tin: { type: 'whip', dir: [0, -1], d: .22 } });
// =============== 3b  close-up: moth flies out (6.38 – 7.85) ===============
shot(6.38, 7.85, (c, lt, t) => {
  const k = ease(lt / 1.47), cam = { x: 0, y: lerp(160, 120, k), z: lerp(1.75, 2.05, k), r: lerp(.02, -.01, k) };
  m2Back(c, cam, t, { paint: .4 });
  const mt = lt - .45; // moth timeline
  const mx = mt < 0 ? 0 : Math.sin(mt * 5) * 160 + mt * 60, my = mt < 0 ? 330 : 330 - mt * 420 + Math.sin(mt * 9) * 40;
  const look = mt < 0 ? 0 : clamp(mx / 200, -1, 1);
  const P = { x: 0, y: 820, arms: { l: { a: .48, b: -1.75 }, r: { a: .48, b: -1.75 } }, expr: { mouth: 'flat', look, browUp: .6 + clamp(mt) * .3, lid: blink(lt, [1.15]) } };
  noahAt(c, cam, P, LCOLD, 1, x => { const hl = noahHand(P, -1), hr = noahHand(P, 1); wallet(x, (hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 - 40, 1, .75); });
  layer(c, cam, 1.02, c => { if (mt > 0) { moth(c, mx, my, t, 1.1); dust(c, mx - 40, mx + 40, my, my + 120, t, { n: 10, fall: true, color: '230,220,200', alpha: .8, speed: .3 }); } });
  m2Front(c, cam, t, { fgBlur: 14 });
  m2Light(c, cam, t);
});
// =============== 4  montage + Startkosten card (7.85 – 10.30) ===============
const COST = [{ s: 'Küche', v: 18000, t: 8.04, ic: iconStove }, { s: 'Umbau', v: 13000, t: 8.45, ic: iconHammer }, { s: 'Möbel', v: 12000, t: 8.90, ic: iconChair }, { s: 'Genehmigungen', v: 6000, t: 9.40, ic: iconStamp }];
function costCard(c, t, o = {}) {
  const y = o.y ?? 680, h = o.h ?? 520, w = o.w ?? 660;
  card(c, t - 7.85, { cx: o.cx ?? 520, y, w, h, t0: .05, tilt: o.tilt ?? -.025, shake: o.shake || 0, sx: o.sx, sy: o.sy }, (c, w, h) => {
    cardTitle(c, 'Startkosten', w);
    let sum = 0;
    COST.forEach((r, i) => {
      const k = seg(t, r.t, r.t + .22); if (k <= 0) return; sum += r.v * ease(seg(t, r.t, r.t + .3));
      const yy = 112 + i * 66; c.save(); c.globalAlpha = k; c.translate((1 - easeOut(k)) * 60, 0);
      r.ic(c, 56, yy + 24, 1.1); txt(c, r.s, 100, yy + 38, 38, CARD.ink, 'left'); txt(c, fmtNum(r.v) + ' €', w - 34, yy + 38, 34, CARD.muted, 'right');
      c.fillStyle = CARD.line; c.fillRect(34, yy + 56, w - 68, 3); c.restore();
    });
    // big counter
    let v = sum; if (o.spin) v = 49000 + o.spin;
    const big = o.big || 1;
    c.fillStyle = 'rgba(217,67,58,.1)'; c.fillRect(0, h - 128, w, 128);
    txt(c, '€', 56, h - 44, 72 * Math.min(1.2, big), CARD.red, 'left');
    c.save(); c.translate(w - 34, h - 40); c.scale(big, big); txt(c, fmtNum(Math.round(v / 100) * 100), 0, 0, 84, CARD.red, 'right'); c.restore();
    if (o.spin && o.blurTick) { c.save(); c.globalAlpha = .3; txt(c, fmtNum(Math.round((v + 3700) / 100) * 100), w - 34, h - 40 - 30 * Math.sin(t * 60), 84 * big, CARD.red, 'right'); c.restore(); }
  });
}
function fmtNum(n) { const neg = n < 0; n = Math.abs(Math.round(n)); return (neg ? '−' : '') + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
shot(7.85, 10.30, (c, lt, t) => {
  const sub = t < 8.45 ? 0 : t < 8.90 ? 1 : t < 9.40 ? 2 : 3, st = t - [7.85, 8.45, 8.90, 9.40][sub];
  const zz = 1.3 + st * .1, cam = { x: [0, 40, -40, 0][sub], y: 14 - 500 / zz, z: zz, r: [-.02, .02, -.015, .01][sub] };
  const P = { x: 0, y: 820, arms: { l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } }, expr: { mouth: ['smile', 'flat', 'o', 'o'][sub], browUp: [.2, .4, .7, 1][sub], look: [.5, -.5, .4, -.3][sub], lid: blink(st, [.3]) } };
  if (sub === 0) {
    m3Back(c, cam, t, { fire: seg(t, 8.1, 8.2) });
    noahAt(c, cam, P, LKITCH); m3Front(c, cam, t); m3Light(c, cam, t);
  } else if (sub === 1 || sub === 2) {
    m2Back(c, cam, t, { paint: sub === 1 ? .3 + st * 1.2 : .9 });
    // painters / unpacking
    if (sub === 1) for (let i = 0; i < 2; i++) personAt(c, cam, { x: -420 + i * 760, y: 700, k: .45, skin: i ? '#9a6544' : '#f0c8a8', hair: { style: i ? 'curly' : 'short', col: '#2a1a10' }, top: '#d9d3c4', overalls: i ? '#c0392b' : '#3f6fa0', hat: i ? 'cap' : 'hard', capCol: '#2f6fb0', arms: { l: { a: .2, b: 0 }, r: { a: 2.2 + Math.sin(t * 9 + i) * .35, b: -.4 } }, expr: { mouth: 'smile', look: i ? -1 : 1 } }, LCOLD, .85);
    if (sub === 2) layer(c, cam, .9, c => { for (let i = 0; i < 3; i++) { const pop = easeBack(seg(st, .05 + i * .1, .3 + i * .1)); cardboard(c, -480 + i * 480, 760, 240, 170, 1); chair(c, -480 + i * 480, 760 - 120 - pop * 200, .8 * pop + .01, '#7a4a2a'); } });
    noahAt(c, cam, P, LCOLD); m2Front(c, cam, t); m2Light(c, cam, t);
  } else {
    m4Back(c, cam, t, { calendar: false, wall: '#4a5a52' });
    // official stamping documents
    const stampK = Math.abs(Math.sin(st * 9));
    personAt(c, cam, { x: 330, y: 760, k: .5, skin: '#e8c4a0', hair: { style: 'bald', col: '#5a4a3a' }, glasses: true, top: '#5a6a7a', sleeve: 'long', arms: { l: { a: .4, b: -1.3 }, r: { a: .9, b: -1.6 + stampK * .4 } }, expr: { mouth: 'flat' } }, LDESK, .9);
    noahAt(c, cam, P, LDESK);
    m4Desk(c, cam, t, { calc: false, lampX: -380 });
    layer(c, cam, 1.05, c => { for (let i = 0; i < 4; i++) { const k = seg(st, i * .18, .3 + i * .18); if (k > 0) bill(c, -300 + i * 200, 600 + (1 - easeOut(k)) * -500, (i - 1.5) * .2, ['Antrag', 'Formular', 'Antrag', 'Formular'][i], .5); } stamp(c, 380, 700, seg(st, .25, .4), 'Amt'); });
    m4Light(c, cam, t, { lampX: -380 });
  }
  costCard(c, t);
}, { tin: { type: 'whip', dir: [1, 0], d: .2 } });
// =============== 5a  counter spins up (10.30 – 12.30) ===============
shot(10.30, 12.30, (c, lt, t) => {
  const k = ease(lt / 2), zz = lerp(1.3, 1.42, k), cam = { x: 0, y: 14 - 500 / zz, z: zz, r: Math.sin(lt * 2) * .006 };
  m2Back(c, cam, t, { paint: 1 });
  const P = { x: 0, y: 820, expr: { mouth: 'o', browUp: .5 + k * .5, look: 0, lid: blink(lt, [.6]) }, arms: { l: { a: .2, b: -.1 }, r: { a: .2, b: -.1 } } };
  noahAt(c, cam, P, LCOLD); m2Front(c, cam, t); m2Light(c, cam, t);
  const spin = easeIn(seg(t, 10.9, 12.2)) * 41000;
  costCard(c, t, { spin, blurTick: spin > 0 && spin < 41000, shake: seg(t, 11.3, 12.3) * 10, big: 1 + seg(t, 11.5, 12.3) * .12 });
});
// =============== 5b  "Oft sogar viel mehr." overflow (12.30 – 13.60) ===============
shot(12.30, 13.60, (c, lt, t) => {
  const k = ease(lt / 1.3), zz = lerp(1.9, 2.05, k), cam = { x: 0, y: 14 - 560 / zz, z: zz, r: -.015 };
  m2Back(c, cam, t, { paint: 1 });
  const P = { x: 0, y: 820, expr: { mouth: 'yawn', open: .75, browUp: 1, look: 0 }, arms: { l: { a: .6, b: .4 }, r: { a: .6, b: .4 } } };
  noahAt(c, cam, P, LCOLD); m2Light(c, cam, t);
  // the number bursts the card
  const big = 1.12 + easeOut(seg(t, 12.32, 12.6)) * .35 + seg(t, 12.8, 13.5) * .2;
  costCard(c, t, { y: 670, spin: 41000 + easeOut(seg(t, 12.3, 13.3)) * 80000, big, shake: 14, sx: 1 + seg(t, 12.35, 12.5) * .05 });
}, { tin: { type: 'flash' } });
// =============== 6  calendar "Jahr 1" page tears (13.60 – 15.20) ===============
shot(13.60, 15.20, (c, lt, t) => {
  const k = ease(lt / 1.6), cam = { x: -340, y: lerp(-1000, -760, k), z: lerp(1.15, 1.25, k), r: .01 };
  m4Back(c, cam, t, { calYear: 'Jahr 1', calTear: seg(t, 14.62, 15.2) * 1.2 });
  const P = { x: -340, y: 820 - 760 + 300 + 260, expr: { mouth: 'flat', look: -.6, browUp: .4, lid: blink(lt, [.4]) }, tilt: -.08 };
  P.y = 120; // standing lower in frame
  noahAt(c, cam, P, LDESK, .95);
  m4Light(c, cam, t, { lampX: -900, lampY: 300 });
  // light cools over the shot
  haze(c, '40,70,160', .1 + k * .12);
}, { tin: { type: 'whip', dir: [0, 1], d: .2 } });
// =============== 7  "Miete. Personal. Strom." bills drop (15.20 – 17.05) ===============
const DROPS = [{ s: 'Miete', t: 15.30, x: -280, y: 860, a: -.15 }, { s: 'Personal', t: 15.76, x: 40, y: 900, a: .08 }, { s: 'Strom', t: 16.50, x: 320, y: 860, a: .2 }];
shot(15.20, 17.05, (c, lt, t) => {
  const k = ease(lt / 1.85), cam = { x: 0, y: lerp(120, 200, k), z: lerp(1.0, 1.12, k), r: 0 };
  m4Back(c, cam, t, { calYear: 'Jahr 1' });
  const hit = DROPS.reduce((m, d) => Math.max(m, bump(t, d.t + .1, d.t + .3)), 0);
  const P = { x: 0, y: 960, sit: true, seatH: 300, expr: { mouth: hit > .2 ? 'o' : 'flat', browUp: .3 + hit * .7, eyes: hit > .5 ? 'closed' : 'open', look: 0 }, arms: { l: { a: .5, b: -1.4 }, r: { a: .5, b: -1.4 } }, bob: hit * 14 };
  noahAt(c, cam, Object.assign({ noShadow: true }, P), LDESK);
  m4Desk(c, cam, t, { calcX: 680 });
  layer(c, cam, 1.0, c => {
    DROPS.forEach((d, i) => {
      const kk = seg(t, d.t - .25, d.t + .1); if (kk <= 0) return;
      const land = kk >= 1, by = land ? d.y - bump(t, d.t + .1, d.t + .25) * 20 : lerp(-900, d.y, easeIn(kk));
      bill(c, d.x, by, land ? d.a : d.a + (1 - kk) * 1.5, d.s, .8);
      if (land) dust(c, d.x - 150, d.x + 150, d.y - 40, d.y + 60, t - d.t, { n: 14, color: '255,220,170', alpha: (1 - seg(t, d.t + .1, d.t + .8)) * .8, speed: 1.2 });
    });
  });
  m4Light(c, cam, t, { flicker: true });
}, { tin: { type: 'whip', dir: [0, 1], d: .18 } });
// =============== 8a  pie chart: Miete + Personal eats the Umsatz (17.05 – 18.75) ===============
function pieCard(c, t, o) {
  card(c, t - (o.base ?? 17.05), { cx: o.cx ?? 520, y: o.y, w: o.w, h: o.h, t0: .05, tilt: .02 }, (c, w, h) => {
    cardTitle(c, 'Umsatz', w, CARD.green);
    const cx = w / 2, cy = 96 + (h - 96 - (o.legend === false ? 0 : 110)) / 2, R = Math.min(w * .36, (h - 220) * .45);
    const eat = .62 * easeOut(seg(t, 17.6, 19.4)), chomp = Math.abs(Math.sin(t * 11)) * .5 * (t > 17.6 && t < 19.5 ? 1 : 0.15);
    // remaining revenue (beige)
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, -Math.PI / 2 + eat * Math.PI * 2, Math.PI * 1.5); c.closePath(); fs(c, '#f2c46a', 6);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + eat * Math.PI * 2 + (i + .5) / 5 * (1 - eat) * Math.PI * 2; ell(c, cx + Math.cos(a) * R * .6, cy + Math.sin(a) * R * .6, 7, 7, 'rgba(160,100,30,.5)', 0); }
    // pac-man (eaten part): wedge with a chomping mouth on its leading edge
    if (eat > .01) {
      const a0 = -Math.PI / 2, a1 = -Math.PI / 2 + eat * Math.PI * 2, m = Math.min(chomp, eat * 2.5);
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R * 1.04, a0, a1 - m); c.closePath(); fs(c, CARD.red, 6);
      const ea = a1 - m - .35; ell(c, cx + Math.cos(ea) * R * .62, cy + Math.sin(ea) * R * .62, 13, 13, '#fff', 3); ell(c, cx + Math.cos(ea) * R * .62 + 3, cy + Math.sin(ea) * R * .62, 5, 5, OUT, 0);
      if (eat > .3) { c.save(); c.translate(cx + Math.cos((a0 + a1) / 2) * R * .5, cy + Math.sin((a0 + a1) / 2) * R * .5); txt(c, Math.round(eat * 100) + ' %', 0, 14, 44, '#fff'); c.restore(); }
    }
    if (o.legend !== false) { ell(c, 60, h - 58, 16, 16, CARD.red, 4); txt(c, 'Miete + Personal', 92, h - 44, 40, CARD.ink, 'left'); }
  });
}
shot(17.05, 18.75, (c, lt, t) => {
  const k = ease(lt / 1.7), zz = lerp(1.32, 1.4, k), cam = { x: 0, y: 14 - 500 / zz, z: zz, r: 0 };
  m4Back(c, cam, t, { calYear: 'Jahr 1' });
  const P = { x: 0, y: 820, arms: { l: { a: .15, b: -.1 }, r: { a: .5, b: -1.75 } }, expr: { mouth: 'flat', look: 0, browUp: .3 + k * .4, lid: blink(lt, [1.1]) } };
  noahAt(c, cam, P, LDESK, 1, x => { const hr = noahHand(P, 1); fork(x, hr[0], hr[1] - 150, .1, 1.0); });
  m4Light(c, cam, t, { lampX: -700, lampY: 900 });
  pieCard(c, t, { y: 680, w: 620, h: 540 });
}, { tin: { type: 'whip', dir: [-1, 0], d: .2 } });
// =============== 8b  Noah with fork looks at the tiny leftover slice (18.75 – 20.90) ===============
shot(18.75, 20.90, (c, lt, t) => {
  const k = ease(lt / 2.15), cam = { x: lerp(20, -10, k), y: lerp(60, 90, k), z: lerp(1.5, 1.62, k), r: .01 };
  m4Back(c, cam, t, { calYear: 'Jahr 1' });
  const lookDown = ease(seg(lt, .5, .9)) * (1 - ease(seg(lt, 1.6, 1.9)));
  const P = { x: 0, y: 820, arms: { l: { a: 2.0, b: -2.6 }, r: { a: 1.9, b: -2.4 } }, expr: { mouth: lt > 1.6 ? 'flat' : 'soft', look: -.3 * lookDown, lid: lookDown * .45 + blink(lt, [1.95]), browUp: .4 }, tilt: lookDown * .06 };
  noahAt(c, cam, P, LDESK, 1, x => {
    const hl = noahHand(P, -1), hr = noahHand(P, 1);
    plate(x, hl[0] + 20, hl[1] - 30, 1.1);
    // tiny cake slice
    x.beginPath(); x.moveTo(hl[0], hl[1] - 40); x.lineTo(hl[0] + 40, hl[1] - 50); x.lineTo(hl[0] + 36, hl[1] - 70); x.closePath(); fs(x, '#f2c46a', 3); ell(x, hl[0] + 30, hl[1] - 70, 6, 6, '#d9433a', 2);
    fork(x, hr[0] - 10, hr[1] - 150, .25, 1.0);
  });
  m4Light(c, cam, t, { lampX: -700, lampY: 600 });
}, {});
// =============== 9  guest pays 100 € (20.90 – 22.55) ===============
shot(20.90, 22.55, (c, lt, t) => {
  const k = ease(lt / 1.4), cam = { x: 0, y: lerp(-650, -60, k), z: lerp(1.0, 1.12, k), r: lerp(.02, 0, k) };
  m5Back(c, cam, t); m5Lamps(c, cam, t);
  // Noah behind the table (host with notebook)
  const P = { x: 230, y: 700, k: .6, arms: { l: { a: .45, b: -1.5 }, r: { a: .2, b: -.2 } }, expr: { mouth: 'smile', look: -.8, browUp: .3 } };
  noahAt(c, cam, P, LREST, .97, x => { const hl = noahHand(P, -1); notebook(x, hl[0], hl[1] - 40, .2, .9); });
  // guest seated, places the note
  const put = ease(seg(t, 21.35, 21.75));
  const G = { x: -220, y: 470, k: .56, sit: true, noLegs: true, skin: '#e8b48a', hair: { style: 'bun', col: '#4a2416' }, top: '#3d8a6f', earring: true, arms: { l: { a: .35, b: -1.2 }, r: { a: lerp(.3, .75, put), b: lerp(-1.4, -1.0, put) } }, expr: { mouth: 'smile', look: .6 } };
  personAt(c, cam, G, LREST, 1);
  layer(c, cam, 1, c => {
    table(c, 0, 470, 820, 1); candle(c, -60, 466, 1, t, 1.1, 2); wineGlass(c, -300, 470, .9, .3); plate(c, -250, 476, 1);
    const [gx, gy] = personHand2(G, 1); banknote(c, lerp(gx + 20, 120, put), lerp(gy - 10, 480, put), lerp(-.4, .06, put), .6);
  });
  m5Table(c, cam, t, -520, 1100, { p: 1.3, blur: 9 });
  m5Light(c, cam, t, { spot: [0, 470], sy: .55 });
}, { tin: { type: 'whip', dir: [0, 1], d: .2 } });
// =============== 10  Noah raises the note, it becomes the 100 € card (22.55 – 25.10) ===============
const SPLIT = [{ s: 'Waren', v: 30, col: '#e0a43a' }, { s: 'Personal', v: 33, col: '#d9433a' }, { s: 'Miete', v: 12, col: '#2f6fb0' }, { s: 'Energie', v: 5, col: '#8a5ab0' }, { s: 'Steuern', v: 15, col: '#7d7064' }, { s: 'Gewinn', v: 5, col: '#3d8a4f' }];
function hundredCard(c, t, o) {
  if (o.alpha != null) { c.save(); c.globalAlpha = o.alpha; }
  card(c, t - o.base, { cx: o.cx ?? 520, y: o.y, w: o.w, h: o.h, t0: 0, tilt: -.02 }, (c, w, h) => {
    txt(c, '100 €', w / 2, 120, 110, CARD.green);
    const bx = 60, bw = 170, by = 170, bh = h - 250, sp = ease(seg(t, 24.15, 24.6)) * 12;
    let y = by, ly = 0;
    SPLIT.forEach((s, i) => {
      const hh = bh * s.v / 100 - 0, fly = o.fly ? seg(t, o.fly[i] ?? 99, (o.fly[i] ?? 99) + .45) : 0; const dy = i * sp;
      c.save(); c.translate(fly * (i % 2 ? 900 : -900) * easeIn(fly), -fly * 700 * easeIn(fly)); c.rotate(fly * (i % 2 ? 1 : -1)); c.globalAlpha = 1 - fly * .6;
      if (i === 5 && o.gone) c.globalAlpha *= 1 - o.gone;
      c.beginPath(); c.rect(bx, y + dy, bw, hh); fs(c, s.col, 5);
      if (sp > 2) { const cyy = Math.max(y + dy + hh / 2 + 14, ly + 42); ly = cyy; line(c, [bx + bw + 6, y + dy + hh / 2, bx + bw + 24, cyy - 12], 3, '#aaa'); txt(c, s.s, bx + bw + 30, cyy, i === 5 ? 44 : 38, i === 5 ? CARD.green : CARD.ink, 'left'); txt(c, s.v + ' €', w - 34, cyy, 38, i === 5 ? CARD.green : CARD.muted, 'right'); }
      c.restore(); y += hh;
    });
  });
  if (o.alpha != null) c.restore();
}
shot(22.55, 25.10, (c, lt, t) => {
  const up = ease(seg(lt, .1, .6)), k = ease(seg(t, 23.2, 23.8)), zz = lerp(1.15, 1.3, k) + lt * .02, cam = { x: lerp(-20, 30, k), y: lerp(-150, 14 - 580 / zz, k), z: zz, r: lerp(-.01, .015, k) };
  m5Back(c, cam, t); m5Lamps(c, cam, t);
  const P = { x: 0, y: 820, arms: { l: { a: .3, b: -.4 }, r: { a: lerp(.3, 2.55, up), b: lerp(-.5, .15, up) } }, expr: { mouth: t > 24.2 ? 'flat' : 'smile', look: lerp(0, .4, up), browUp: up * .7, lid: blink(lt, [2.1]) }, tilt: -up * .06 };
  const morph = seg(t, 23.4, 23.75);
  noahAt(c, cam, P, LREST, 1, x => { const hr = noahHand(P, 1); if (morph < 1) { x.save(); x.globalAlpha = 1 - morph; banknote(x, hr[0], hr[1] - 50, -.1 + Math.sin(lt * 3) * .05, .75 + morph * .6); x.restore(); if (morph === 0) glowAt(x, hr[0], hr[1] - 50, 260, '255,230,150', .4 + Math.sin(lt * 6) * .1); } });
  m5Table(c, cam, t, 420, 1150, { p: 1.3, blur: 10 });
  m5Light(c, cam, t, { sx: .5, sy: .3 });
  if (t > 23.4) hundredCard(c, t, { base: 23.4, y: 680, w: 640, h: 640 });
}, { tin: { type: 'whip', dir: [0, -1], d: .18 } });
// =============== 11  pieces fly away, Gewinn lands in his palm (25.10 – 26.65) ===============
shot(25.10, 26.65, (c, lt, t) => {
  const k = ease(seg(t, 25.85, 26.25)), cam = { x: 0, y: lerp(14 - 580 / 1.32, 60, k), z: lerp(1.32, 1.55, k), r: .01 };
  m5Back(c, cam, t); m5Lamps(c, cam, t);
  const P = { x: 0, y: 820, arms: { l: { a: 1.0, b: -2.0 }, r: { a: .15, b: -.1 } }, expr: { mouth: t > 26.1 ? 'flat' : 'o', look: t > 26.05 ? -.3 : 0, browUp: .7, lid: blink(lt, [1.3]) } };
  const land = seg(t, 25.95, 26.2);
  noahAt(c, cam, P, LREST, 1, x => { const hl = noahHand(P, -1); if (land >= 1) { coin(x, hl[0] - 18, hl[1] - 42, 24, t * 8); coin(x, hl[0] + 22, hl[1] - 36, 20, t * 6 + 1); coin(x, hl[0] + 4, hl[1] - 58, 18, t * 7 + 2); } });
  m5Light(c, cam, t, { sx: .5, sy: .45 });
  hundredCard(c, t, { base: 23.4 - 2, y: 680 - k * 1000, alpha: 1 - k, w: 640, h: 640, fly: [25.2, 25.35, 25.5, 25.65, 25.8, 99], gone: land });
  // the Gewinn chunk falls into the palm (screen space via camera)
  if (land > 0 && land < 1) { const [hx, hy] = toScreen(cam, 1, noahHand(P, -1)[0], noahHand(P, -1)[1] - 40); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(lerp(330, hx, easeIn(land)), lerp(900, hy, easeIn(land))); c.rotate(land * 3); c.fillStyle = CARD.green; c.fillRect(-40, -12, 80, 24); c.strokeStyle = OUT; c.lineWidth = 4; c.strokeRect(-40, -12, 80, 24); c.restore(); }
});
// =============== 12  two empty tables (26.65 – 28.95) ===============
shot(26.65, 28.95, (c, lt, t) => {
  const k = ease(lt / 2.3), cam = { x: lerp(60, 0, k), y: lerp(-520, -80, k), z: lerp(1.0, 1.1, k), r: 0 };
  m5Back(c, cam, t); m5Lamps(c, cam, t);
  m5Table(c, cam, t, -330, 700, { p: .9, empty: true });
  const P = { x: 260, y: 860, arms: { l: { a: .1, b: -.05 }, r: { a: .1, b: -.05 } }, expr: { mouth: 'flat', look: -.9, browUp: .5, lid: .25 + blink(lt, [1.5]) }, tilt: .05 };
  noahAt(c, cam, P, LREST);
  m5Table(c, cam, t, -120, 1250, { p: 1.25, empty: true, blur: 8 });
  m5Light(c, cam, t, { sx: .7, sy: .2 });
  // cold pool of light over the empty tables
  c.save(); c.globalCompositeOperation = 'multiply'; const [ex, ey] = toScreen(cam, .9, -330, 700); const g = c.createRadialGradient(ex, ey, 50, ex, ey, 600); g.addColorStop(0, 'rgba(60,80,140,.55)'); g.addColorStop(1, 'rgba(60,80,140,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}, { tin: { type: 'whip', dir: [0, 1], d: .2 } });
// =============== 13  "Dann ist dein Gewinn schon weg." coins vanish (28.95 – 30.75) ===============
shot(28.95, 30.75, (c, lt, t) => {
  const k = ease(lt / 1.8), cam = { x: 0, y: lerp(100, 130, k), z: lerp(1.7, 1.85, k), r: -.01 };
  m5Back(c, cam, t); m5Lamps(c, cam, t, { on: .8 });
  const gone = t > 30.28;
  const P = { x: 0, y: 820, arms: { l: { a: 1.0, b: -2.0 }, r: { a: .15, b: -.1 } }, expr: { mouth: gone ? 'o' : 'flat', look: 0, browUp: gone ? .9 : .4, lid: gone ? 0 : .3 } };
  noahAt(c, cam, P, LREST, 1, x => {
    const hl = noahHand(P, -1);
    if (!gone) { coin(x, hl[0] - 18, hl[1] - 42, 24, t * 3); coin(x, hl[0] + 22, hl[1] - 36, 20, t * 2 + 1); coin(x, hl[0] + 4, hl[1] - 58, 18, t * 2.5 + 2); }
    else { const pk = seg(t, 30.28, 30.75); x.save(); x.globalAlpha = 1 - pk; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ell(x, hl[0] + Math.cos(a) * 60 * easeOut(pk), hl[1] - 50 + Math.sin(a) * 40 * easeOut(pk) - pk * 60, 26 * (1 - pk * .5), 26 * (1 - pk * .5), 'rgba(230,230,240,.8)', 0); } x.restore(); }
  });
  // extinguished candles of the empty tables smoke in the foreground
  layer(c, cam, 1.25, c => { candle(c, -330, 1150, 0, t, 1.6); candle(c, 330, 1200, 0, t, 1.6); }, 6);
  layer(c, cam, 1.25, c => { smokeWisp(c, -330, 1000, t, 2, .9, 1); smokeWisp(c, 330, 1050, t, 2, .9, 5); });
  m5Light(c, cam, t, { sx: .5, sy: .5 });
  haze(c, '40,50,110', .08 + seg(t, 30.2, 30.7) * .1);
});
// =============== 14a  rainy street (30.75 – 32.05) ===============
shot(30.75, 32.05, (c, lt, t) => {
  const k = ease(lt / 1.3), cam = { x: 0, y: lerp(-360, -40, k), z: lerp(1.0, 1.08, k), r: lerp(-.02, 0, k) };
  m6Back(c, cam, t); m6Ground(c, cam, t);
  const P = { x: 0, y: 830, expr: { mouth: 'flat', look: 0, browUp: .4, lid: blink(lt, [.8]) } };
  noahAt(c, cam, P, LNEON);
  m6Light(c, cam, t);
}, { tin: { type: 'whip', dir: [1, 0], d: .2 } });
// =============== 14b / 15  "9 von 10" … "Mythos" (32.05 – 36.25) ===============
function nineCard(c, t, o) {
  const stampK = seg(t, 35.62, 35.74), shake = bump(t, 35.66, 35.95) * 22;
  card(c, t - 32.05, { cx: 520, y: o.y ?? 680, w: 640, h: o.h ?? 500, t0: .05, tilt: -.02, shake }, (c, w, h) => {
    txt(c, '9 von 10', w / 2, 140, 120, CARD.ink, 'center', { weight: 800 });
    for (let i = 0; i < 10; i++) {
      const col = i % 5, row = Math.floor(i / 5), x = 80 + col * 120, y = 270 + row * 135;
      const dark = i < 9 ? seg(t, 32.75 + i * .2, 32.85 + i * .2) : 0, relit = seg(t, 35.85 + i * .04, 35.95 + i * .04);
      shopIcon(c, x, y, 1.1, 1 - dark + relit);
    }
    stamp(c, w / 2, h / 2 + 10, stampK, 'Mythos');
  });
}
shot(32.05, 34.75, (c, lt, t) => {
  const k = ease(lt / 2.7), zz = lerp(1.3, 1.38, k), cam = { x: 0, y: 14 - 480 / zz, z: zz, r: 0 };
  m6Back(c, cam, t); m6Ground(c, cam, t);
  const P = { x: 0, y: 830, expr: { mouth: k > .5 ? 'o' : 'flat', look: 0, browUp: .4 + k * .5, lid: blink(lt, [1.4]) } };
  noahAt(c, cam, P, LNEON); m6Light(c, cam, t);
  nineCard(c, t, {});
});
shot(34.75, 36.25, (c, lt, t) => {
  const k = ease(lt / 1.5), shake = bump(t, 35.66, 35.9), cam = { x: (rnd(Math.floor(t * 40)) - .5) * shake * 30, y: 14 - 480 / lerp(1.45, 1.5, k), z: lerp(1.45, 1.5, k), r: (rnd(Math.floor(t * 40) + 5) - .5) * shake * .02 };
  m6Back(c, cam, t); m6Ground(c, cam, t);
  const sk = t > 35.7;
  const P = { x: 0, y: 830, expr: { mouth: sk ? 'soft' : 'flat', look: sk ? .5 : 0, browUp: sk ? 1 : .5, lid: sk ? .25 : 0 }, tilt: sk ? .07 : 0 };
  noahAt(c, cam, P, LNEON); m6Light(c, cam, t);
  nineCard(c, t, {});
});
// =============== 16  signs light up again (36.25 – 38.20) ===============
shot(36.25, 38.20, (c, lt, t) => {
  const k = ease(lt / 1.95), cam = { x: 0, y: lerp(450, -150, k), z: lerp(1.15, 1.05, k), r: lerp(.02, 0, k) };
  const on = i => clamp((t - 36.4 - i * .18) / .1);
  const shopsL = [{ sign: 'Bistro', col: '255,90,150', on: on(0) }, { sign: 'Pizzeria', col: '120,220,255', on: on(2) }, { sign: 'Café', col: '255,210,90', on: on(4) }, { sign: 'Grill', col: '160,255,140', on: on(6) }, { sign: 'Imbiss', col: '255,140,60', on: on(8) }];
  const shopsR = [{ sign: 'Trattoria', col: '255,210,90', on: on(1) }, { sign: 'Bäckerei', col: '255,90,150', on: on(3) }, { sign: 'Bar', col: '120,220,255', on: on(5) }, { sign: 'Sushi', col: '255,120,90', on: on(7) }, { sign: 'Döner', col: '160,255,140', on: on(9) }];
  m6Back(c, cam, t, { shopsL, shopsR }); m6Ground(c, cam, t);
  const P = { x: 0, y: 830, expr: { mouth: 'smile', look: 0, browUp: .2, lid: blink(lt, [1.2]) }, arms: { l: { a: .2, b: -.1 }, r: { a: .2, b: -.1 } }, bob: -bump(lt, .6, 1.2) * 12 };
  noahAt(c, cam, P, LNEON);
  m6Light(c, cam, t);
}, { tin: { type: 'whip', dir: [0, 1], d: .2 } });
// =============== 17  calendar pages fly to "Jahr 3" (38.20 – 39.60) ===============
shot(38.20, 39.60, (c, lt, t) => {
  const k = ease(lt / 1.4), cam = { x: -340, y: lerp(-760, -820, k), z: lerp(1.25, 1.35, k), r: Math.sin(lt * 3) * .01 };
  const yr = t < 38.65 ? 'Jahr 1' : t < 39.05 ? 'Jahr 2' : 'Jahr 3';
  m4Back(c, cam, t, { calYear: yr });
  const P = { x: -340, y: 120, expr: { mouth: 'o', look: -.5, browUp: .8 }, tilt: -.08 };
  noahAt(c, cam, P, LDESK, .95);
  // page storm
  layer(c, cam, .9, c => { for (let i = 0; i < 16; i++) { const kk = (lt * 1.6 + i / 16) % 1; if (t > 39.3 && kk > .5) continue; const sd = i % 2 ? 1 : -1, x = -300 + sd * (150 + kk * 900) + Math.cos(i * 2.3) * 80, y = -1000 - Math.sin(kk * 3) * 260 + kk * kk * 500 + Math.sin(i) * 120; c.save(); c.translate(x, y); c.rotate(kk * 6 + i); c.scale(.5, .5); c.beginPath(); c.rect(-200, -180, 400, 360); fs(c, '#fffdf7', 6); for (let r = 0; r < 4; r++) line(c, [-170, -120 + r * 80, 170, -120 + r * 80], 4, '#c8bfb0'); c.restore(); } });
  m4Light(c, cam, t, { lampX: -900, lampY: 300 });
  haze(c, '30,40,90', .15);
}, { tin: { type: 'whip', dir: [-1, 0], d: .2 } });
// =============== 18a / 18b  three restaurants, one closes (39.60 – 44.95) ===============
function usaCard(c, t, o) {
  card(c, t - 39.6, { cx: 520, y: 690, w: 640, h: 330, t0: .2, tilt: .02 }, (c, w, h) => {
    txt(c, 'USA · nach 3 Jahren', w / 2, 66, 46, CARD.ink);
    const g = seg(t, 44.45, 44.6);
    for (let i = 0; i < 3; i++) shopIcon(c, 150 + i * 170, 190, 1.5, i === 1 ? 1 - g : 1);
    if (g > 0) { c.save(); c.globalAlpha = g; txt(c, '1 von 3', w / 2, h - 26, 44, CARD.red); c.restore(); }
  });
}
const THREE = (t) => { const dying = t > 43.6 ? (t > 44.45 ? 0 : (Math.sin(t * 60) > 0 || Math.sin(t * 23) > .7 ? 1 : .1)) : 1; return [{ sign: 'Bistro', col: '255,90,150' }, { sign: 'Pizzeria', col: '120,220,255', flick: dying, on: t > 44.45 ? .05 : 1, closed: seg(t, 44.55, 44.9) }, { sign: 'Café', col: '255,210,90' }, { sign: 'Grill', col: '160,255,140', on: 0 }, { sign: 'Imbiss', col: '255,140,60', on: 0 }]; };
shot(39.60, 42.00, (c, lt, t) => {
  const k = ease(lt / 2.4), cam = { x: lerp(-40, -120, k), y: 14 - 500 / 1.27, z: 1.27, r: 0 };
  m6Back(c, cam, t, { shopsL: THREE(t), shopsR: [{ sign: 'Bar', col: '120,220,255', on: .3 }, { sign: 'Sushi', col: '255,120,90', on: .3 }, { sign: 'Döner', col: '160,255,140', on: .2 }, { sign: 'Café', on: 0 }, { sign: 'Bar', on: 0 }], carSeed: 900 }); m6Ground(c, cam, t);
  const P = { x: cam.x, y: 830, expr: { mouth: 'flat', look: -1, browUp: .3, lid: blink(lt, [1.6]) }, tilt: .04 };
  noahAt(c, cam, P, LNEON); m6Light(c, cam, t);
  usaCard(c, t);
}, { tin: { type: 'whip', dir: [1, 0], d: .2 } });
shot(42.00, 44.95, (c, lt, t) => {
  const k = ease(lt / 2.95), cam = { x: lerp(-160, -230, k), y: 14 - 520 / lerp(1.35, 1.5, k), z: lerp(1.35, 1.5, k), r: lerp(0, -.02, k) };
  m6Back(c, cam, t, { shopsL: THREE(t), shopsR: [{ sign: 'Bar', col: '120,220,255', on: .3 }, { sign: 'Sushi', col: '255,120,90', on: .3 }, { sign: 'Döner', col: '160,255,140', on: .2 }, { sign: 'Café', on: 0 }, { sign: 'Bar', on: 0 }], carSeed: 300 }); m6Ground(c, cam, t);
  const dyingFlash = t > 43.6 && t < 44.45 ? (Math.sin(t * 60) > 0 ? 1 : 0) : 0, after = t > 44.5;
  const P = { x: cam.x, y: 830, expr: { mouth: after ? 'flat' : 'soft', look: -1, browUp: after ? .8 : .3, lid: after ? .3 : 0 }, tilt: after ? -.05 : .03 };
  noahAt(c, cam, P, Object.assign({}, LNEON, { rim2: dyingFlash ? '120,220,255' : '40,60,120', rim2A: dyingFlash ? 1 : .4 }));
  m6Light(c, cam, t);
  usaCard(c, t);
});
// =============== 19  final: night, rain, spotlight (44.95 – 47.96) ===============
shot(44.95, TOTAL, (c, lt, t) => {
  const k = ease(lt / 3), cam = { x: 0, y: -150, z: lerp(1.25, 1.5, k), r: 0 };
  const flickA = t > 47.15 && t < 47.55 ? (Math.sin(t * 70) > 0 ? .1 : 1) : 1;
  m1Back(c, cam, t, { night: true }); m1Facade(c, cam, t, { night: true, neon: 1, flickA, banner: false }); m1Ground(c, cam, t, { night: true, neon: 1, balloons: false });
  const turn = ease(seg(t, 45.6, 46.1)), tilt = ease(seg(t, 46.3, 46.9));
  const P = { x: 0, y: 820, arms: { l: { a: .14, b: -.08 }, r: { a: .22, b: -.3 } }, expr: { mouth: tilt > .5 ? 'soft' : 'flat', look: lerp(-1, 0, turn), browUp: .35 + tilt * .4, lid: blink(lt, [2.5]) }, tilt: lerp(-.12, .17, tilt) - (1 - turn) * .0 };
  // spotlight from above
  const [sx, sy] = toScreen(cam, 1, 0, 0);
  noahAt(c, cam, P, LNEON, 1, x => { const hr = noahHand(P, 1); scissors(x, hr[0] + 10, hr[1] + 20, 1.35, 0, 1.0); });
  beam(c, sx, -200, sx, sy + 900, 200, 900, '220,230,255', .3, t);
  m1Light(c, cam, t, { night: true });
  // neon reflection on his face
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, sx, sy - 120, 300, '255,80,150', .12 * flickA); c.restore();
}, { tin: { type: 'whip', dir: [0, -1], d: .22 } });
DURATION = TOTAL;
