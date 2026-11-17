// SCENES S12–S22 (paragraphs 11–21): the hunt, the animals, the lion, sharing, the first dog.
function herd(c, cam, t, o) {
  // many reindeer across parallax depths; o: { n, p (layer), x0, spread, run, speed, sc, y, dir }
  layer(c, cam, o.p ?? 1, c => { const b = (o.p ?? 1) === 1 ? 0 : layerBase(cam, SHZ, o.p) ;
    for (let i = 0; i < o.n; i++) { const r = rnd(i + (o.seed || 0)), x = o.x0 + (i % 12) * (o.spread || 180) + r * 120 + ((o.lt || 0) * (o.speed || 0)), yy = b + (o.y || 0) + Math.floor(i / 12) * 26 + r * 20;
      rentier(c, x, { t, y: yy, sc: (o.sc || 1) * (.85 + r * .3), walk: o.still ? null : t * (o.run ? 9 : 5) + i * 1.3, run: o.run, graze: o.graze && r > .5 ? 1 : 0, s: o.dir || 1, male: r > .3 }); }
    if (o.dust) for (let i = 0; i < 26; i++) { const x = o.x0 + rnd(i + 50) * (o.spread || 180) * 12 + (o.lt || 0) * (o.speed || 0), y = b + (o.y || 0) - 20; const g = c.createRadialGradient(x, y, 0, x, y, 160); g.addColorStop(0, `rgba(235,230,215,${.35 * o.dust})`); g.addColorStop(1, 'rgba(235,230,215,0)'); c.fillStyle = g; c.fillRect(x - 160, y - 160, 320, 320); }
  });
}
function silh(c, fn, col = '20,14,24', a = 1) { const L = _fl(); L.c.setTransform(1, 0, 0, 1, 0, 0); L.c.clearRect(0, 0, W, H); L.c.setTransform(c.getTransform()); fn(L.c); L.c.setTransform(1, 0, 0, 1, 0, 0); L.c.globalCompositeOperation = 'source-atop'; L.c.fillStyle = `rgb(${col})`; L.c.fillRect(0, 0, W, H); L.c.globalCompositeOperation = 'source-over'; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.drawImage(L.cv, 0, 0); c.restore(); }
function lyingDeer(c, x, t, o = {}) { c.save(); c.beginPath(); c.rect(x - 600, -2000, 1200, 2000 - 6); c.clip(); rentier(c, x, Object.assign({ t, y: 150, graze: .2 }, o)); c.restore(); ell(c, x, 0, 260, 22); c.fillStyle = 'rgba(30,22,16,.3)'; c.fill(); }
function noahHandWorld(x, y, side, spec) { const P = armPts(side, spec); return [x + P.wx * K, y + P.wy * K]; }
function bushes(c, x, t, s = 1, shake = 0) { c.save(); c.translate(x, 0); c.scale(s, s); for (let i = 0; i < 9; i++) { const bx = -260 + i * 64 + Math.sin(t * 20 + i) * shake * 10, by = -60 - rnd(i) * 120; ell(c, bx, by, 90, 70); c.fillStyle = ['#5a6034', '#4a5028', '#6a6a3a'][i % 3]; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(20,24,10,.6)'; c.stroke(); } for (let i = 0; i < 20; i++) line(c, [-280 + i * 28, 0, -270 + i * 28 + Math.sin(t * 3 + i) * 6, -120 - rnd(i) * 80], 3, '#4a3a22'); c.restore(); }

// ======================= S12 JÄGER =======================
scene(S(100), t => { const lt = t - S(100), cam = { x: 0, y: -290, z: 1.45 };
  const shh = seg(t, S(102), S(102) + .3) * (1 - seg(t, S(103) - .2, S(103))), [hx, hy] = noahHeadAt(320, 0, false);
  const ne = EX(t, { look: -1, browUp: shh > .5 ? .7 : .3, mouth: shh > .5 ? 'flat' : 'smile' });
  if (t >= S(103)) { // they leave into the steppe
    const go = t - S(103), cm = { x: go * 180, y: -330, z: 1 };
    return outFrame(t, cm, { set: campSet, tod: 'day', setOpts: { rockX: -1600 },
      front: [c => { ['jaeger', 'mann1', 'mann3', 'teen2'].forEach((w, i) => tribeSide(c, { who: w, x: go * 180 + 200 - i * 220, walk: t * 8 + i, item: { k: 'spear', rot: 1.35 } }, t)); NS(c, t, { x: go * 180 - 750, walk: t * 8 }); }] });
  }
  return outFrame(t, cam, { set: campSet, tod: 'day', setOpts: { rockX: -1500 },
    front: [c => { tribe(c, { who: 'jaeger', x: -80, k: .25, expr: EX(t, { mouth: shh > .5 ? 'o' : 'flat', frown: .5, look: 1 }), arms: { r: { a: .8 + 1.2 * shh, b: 1.6 * shh + .2 } }, item2: { k: 'spear', rot: 0 } }, t);
      N(c, t, { x: 320, expr: ne, arms: shh > .5 ? { l: { a: -.2, b: -2.4 } } : undefined }); polish(c, t, hx, hy, ne, { lx: .8, ly: -.4 }); }] });
}, .45, 'S12 shh');
scene(S(104), t => { const lt = t - S(104), cam = { x: 0, y: -300, z: 3.0 - lt * .08 }, e = EX(t, { browUp: 1, mouth: 'yawn', open: .5 + .2 * Math.sin(t * 2), lid: 0 });
  return outFrame(t, cam, { tod: 'day', grass: false, behind: [c => { N(c, t, { x: 0, expr: e }); polish(c, t, 0, -1240 * K, e, { lx: .8, ly: -.5, rim: .3 }); }],
    after: [c => withWorld(c, cam, c => noahHeadPolish(c, 0, -1240 * K, K, e, 0, { shadow: 0, glint: 1, glintCol: '255,255,255' }))] });
}, .4, 'S12 amazed');

// ======================= S13 RENTIERE =======================
scene(S(105), t => { const lt = t - S(105), cam = { x: lt * 40, y: -560, z: .42 };
  const fr = outFrame(t, cam, { tod: 'day', snow: 0,
    behind: [c => { herd(c, cam, t, { lt, n: 48, p: .45, x0: -3800, spread: 420, speed: 110, sc: .55, y: 30, dust: 1, seed: 1 }); herd(c, cam, t, { lt, n: 24, p: .7, x0: -2800, spread: 420, speed: 130, sc: .75, y: 30, dust: 1, seed: 9 }); herd(c, cam, t, { lt, n: 10, p: 1, x0: -2400, spread: 520, speed: 150, sc: 1, dust: .8, seed: 20 }); }],
    after: [c => { for (let i = 0; i < 6; i++) vogel(c, 200 + i * 160 + lt * 40, 160 + rnd(i) * 80, { t: t + i, sc: .8 }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, S(105) + 1.2, S(105) + 4.6, 'Rentier', 'wichtigstes Beutetier', 'tl', 660));
  return fr; }, .5, 'S13 herd');
scene(S(108), t => { const lt = t - S(108), cam = { x: 0, y: -330, z: 1.05 };
  return outFrame(t, cam, { tod: 'day', behind: [c => { rentier(c, -100, { t, walk: null, graze: .8 + .2 * Math.sin(t) }); rentier(c, 400, { t, s: -1, walk: null, male: 0, graze: .5 + .5 * Math.sin(t * .7) }); }],
    after: [c => { const items = [['Fleisch', tw('fleisch')], ['Fell', tw('fell', 1, S(108))], ['Sehnen', tw('sehnen')], ['Knochen & Geweih', tw('knochen', 1, S(108))]]; items.forEach(([nm, t0], i) => { const a = easeBack(clamp(seg(t, t0 - .1, t0 + .3))) * (1 - seg(t, S(110) - .5, S(110))); if (a <= 0) return; c.save(); c.translate(260 + i * 460, 170); c.scale(a, a); c.font = `54px ${F_TITLE}`; const w = c.measureText(nm).width + 60; c.translate(-w / 2, -50); slabPath(c, w, 92, 30 + i); c.fillStyle = `rgba(${CARD.bg},.8)`; c.fill(); c.lineWidth = 2.5; c.strokeStyle = 'rgba(232,163,61,.5)'; c.stroke(); cardTitle(c, nm, 30, 66, 54); c.restore(); }); }] });
}, .45, 'S13 uses');

// ======================= S14 PFERDE, BISONS, MAMMUTS =======================
scene(S(110), t => { const lt = t - S(110), cam = { x: 200 + lt * 30, y: -380, z: .82 };
  const fr = outFrame(t, cam, { tod: 'day', behind: [c => { wildpferd(c, -300, { t, graze: 1 }); wildpferd(c, 250, { t, walk: t * 4, s: -1 }); wildpferd(c, 800, { t, graze: .3 + .7 * Math.abs(Math.sin(t * .4)) }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, S(110) + .2, S(110) + 3.6, 'Wildpferd', 'klein, stämmig, dichtes Fell', 'tl', 700)); return fr; }, .45, 'S14 horses');
scene(S(112), t => { const lt = t - S(112), cam = { x: 0, y: -440, z: .7 };
  const fr = outFrame(t, cam, { tod: 'day', behind: [c => { bison(c, -500, { t, graze: .8 }); bison(c, 250, { t, walk: t * 3, s: -1 }); bison(c, 900, { t, graze: .4 }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, S(112) + .3, S(112) + 3.8, 'Steppenbison', 'Hörner und Buckel', 'tl', 700)); return fr; }, .45, 'S14 bison');
const T_MAM = tw('mammuts', 2);
scene(S(113), t => { // mammoths rise over the hill — Noah's jaw drops
  const lt = t - S(113), rise = ease(seg(t, T_MAM - 2.2, T_MAM + 1.5));
  const cam = { x: lerp(-200, 0, rise), y: lerp(-300, -620, rise), z: lerp(1.15, .5, rise) };
  const shake = t > T_MAM && t < T_MAM + 6 ? 1 + Math.sin(t * 2.6) : 0;
  const [hx, hy] = noahHeadAt(-900, 0, false), e = EX(t, { browUp: rise, mouth: rise > .4 ? 'yawn' : 'soft', open: .4 + .2 * rise, look: 1 });
  const fr = outFrame(t, Object.assign({}, cam, { y: cam.y + shake * 2 }), { tod: 'day', setOpts: { hill: 900 },
    behind: [c => { layer(c, cam, .6, c => { const b = layerBase(cam, SHZ, .6); const hy0 = b - 230; for (const [dx, sc, d] of [[0, 1, 0], [520, .55, .6], [-420, .95, .3]]) { const up = ease(seg(t, T_MAM - 2 + d, T_MAM + 1 + d)); mammut(c, 900 * .6 + dx - 600 + lt * 30, { t, y: hy0 + (1 - up) * 700, sc: .62 * sc, walk: t * 2.5 + dx, trunk: .5 + .5 * Math.sin(t + dx) }); } }); }],
    front: [c => { NS(c, t, { x: -900, s: 1, walk: null, expr: e }); }],
    after: [c => { if (rise > .2) withWorld(c, cam, c => {}); }] });
  return fr; }, .45, 'S14 mammoths');
scene(S(114), t => { const lt = t - S(114), cam = { x: 300 + lt * 25, y: -620, z: .55 };
  const fr = outFrame(t, cam, { tod: 'day', behind: [c => { mammut(c, -200, { t, walk: t * 2.5 }); mammut(c, 520, { t, sc: .55, walk: t * 3 + 1 }); mammut(c, 1100, { t, graze: .6, trunk: .2, s: -1 }); castShadow(c, -200, 900, { alpha: .2 }); }],
    front: [c => NS(c, t, { x: 1700, s: -1, walk: null, expr: EX(t, { browUp: 1, mouth: 'o' }) })] });
  fr.screen.splice(fr.screen.length - 1, 0, c => { keywordCard(c, t, S(114) - .1, S(115) + .8, 'Wollhaarmammut', 'bis 3,5 m Schulterhöhe', 'tl', 760); cardMammutNoah(c, t, S(115) + 1.2, S(116) - .2); }); return fr; }, .45, 'S14 mammoth cards');
scene(S(116), t => { const lt = t - S(116), cam = { x: 380, y: -560, z: 1.0 + lt * .02 };
  const fr = outFrame(t, cam, { tod: 'day', behind: [c => { mammut(c, 0, { t, graze: 1, trunk: .5 + .5 * Math.sin(t * 2) }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => infoCard(c, t, { t0: tw('hundert', 1, S(117)) - .3, t1: S(118) + .2, corner: 'tl', w: 700, h: 340, title: 'Futter', counter: [0, 100, 1.2], fmt: (v, k) => (k < 1 ? deNum(Math.round(v)) : '100+') + ' kg', sub: 'pro Tag' })); return fr; }, .45, 'S14 grazing');

// ======================= S15 WOLLNASHORN =======================
scene(S(118), t => { const lt = t - S(118), push = t > S(121) ? .5 + .5 * Math.sin((t - S(121)) * 3) : 0, back = ease(seg(t, S(122), S(122) + 1.5));
  const cam = { x: 100, y: -340, z: .95 }, hm = tw('meter', 1, S(120));
  const fr = outFrame(t, cam, { tod: 'morning', snow: 20, setOpts: { snow: 1.4 },
    behind: [c => { wollnashorn(c, -150, { t, push, walk: t > S(121) ? null : t * 2 }); if (t > S(121)) { for (let i = 0; i < 8; i++) { const ph = ((t - S(121)) * 1.5 + i / 8) % 1; ell(c, 360 + ph * 160, -10 - ph * 40, 30 * (1 - ph) + 6, 12); c.fillStyle = `rgba(250,252,255,${.8 * (1 - ph)})`; c.fill(); } } }],
    front: [c => { NS(c, t, { x: lerp(820, 1000, back), s: -1, walk: back > 0 && back < 1 ? -t * 6 : null, expr: EX(t, { browUp: .4 + .6 * back, mouth: back > .1 ? 'o' : 'soft' }) }); measureLine(c, 380 - 150 + 120, -270 + 80, 380 - 150 + 330, -270 - 160, seg(t, hm - .4, hm + .4) * (1 - seg(t, S(121), S(121) + .5)), ''); }],
    after: [c => { const a = seg(t, hm - .2, hm + .3) * (1 - seg(t, S(121), S(121) + .5)); measureLabel(c, cam, 480, -560, 'über 1 m', a); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, S(119) - .1, S(119) + 3.4, 'Wollnashorn', 'Horn bis über 1 m', 'tl', 680)); return fr; }, .45, 'S15 rhino');

// ======================= S16 RIESENHIRSCH =======================
scene(S(124), t => { const lt = t - S(124), cam = { x: 0, y: -640, z: .5 }, dm = S(127);
  const fr = outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .55, sunY: .5 },
    behind: [c => { layer(c, cam, .55, c => { const b = layerBase(cam, SHZ, .55); riesenhirsch(c, -100 + lt * 25, { t, y: b - 10, sc: .8, dark: .85, darkCol: '40,24,30', walk: lt < 4 ? t * 2 : null }); if (t > S(125) + 1) { const k = seg(t, S(126), S(127) + .4), ax = -100 + lt * 25 + 360 * .8, ay = b - 10 - (460 + 360 + 220) * .8; measureLine(c, ax - 385 * .8, ay - 30, ax + 385 * .8, ay - 30, k, '', { lw: 14 }); } }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => { keywordCard(c, t, S(124) + .4, S(125) + 1.4, 'Riesenhirsch', 'Geweih bis 3,5 m breit', 'tl', 700); const a = seg(t, dm - .2, dm + .3); if (a > 0) { c.save(); c.globalAlpha = a; NUM(c, '3,5 m', W / 2, 200, 140, { align: 'center' }); cardBody(c, 'Geweih', W / 2, 260, 48, CARD.cream, 'center'); c.restore(); } }); return fr; }, .45, 'S16 giant deer');

// ======================= S17 JAGD (DANEBEN) =======================
const T_THROW = tw('wirft') ;
scene(S(129), t => { const lt = t - S(129);
  return shots([
    [S(129), l => { const cam = { x: 400, y: -400, z: .7 }; return outFrame(t, cam, { tod: 'day', behind: [c => herd(c, cam, t, { n: 12, p: 1, x0: 700, spread: 260, speed: 0, still: 1, graze: 1, seed: 4 })], front: [c => { const go = seg(t, S(130), S(131)); ['jaeger', 'mann1', 'mann3'].forEach((w, i) => tribeSide(c, { who: w, x: -700 + go * 300 - i * 180, walk: go > 0 && go < 1 ? t * 5 : null, pose: t > S(131) ? 'crouch' : null, item: { k: 'spear', rot: 1.4 } }, t)); NS(c, t, { x: -1300 + go * 300, walk: go > 0 && go < 1 ? t * 5 : null }); }],
      after: [c => { // wind direction arrow (from the herd towards the hunters)
        const a = bump(t, S(130) + .3, S(131) + .4); if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(W * .62, H * .3); for (let i = 0; i < 3; i++) { const o = ((t * 120 + i * 120) % 360); line(c, [200 - o, i * 26, 120 - o, i * 26], 6, 'rgba(242,230,208,.7)'); } line(c, [220, 26, -200, 26], 10, '#1a120d'); line(c, [220, 26, -200, 26], 6, CARD.amber); c.beginPath(); c.moveTo(-200, 0); c.lineTo(-250, 26); c.lineTo(-200, 52); c.closePath(); c.fillStyle = CARD.amber; c.fill(); cardBody(c, 'Wind', 10, -20, 44, CARD.cream, 'center'); c.restore(); }] }); }],
    [S(133), l => { const cam = { x: 0, y: -230, z: 2.6 }; const sign = Math.floor(l * 1.6) % 3; return outFrame(t, cam, { tod: 'day', grass: false, behind: [c => tribe(c, { who: 'jaeger', x: 0, k: .25, pose: 'crouch', expr: EX(t, { mouth: 'flat', frown: .4, look: 1 }), arms: { r: [{ a: 1.6, b: .2, fist: 1 }, { a: 1.2, b: 1.2 }, { a: 2.2, b: -.2 }][sign] } }, t)] }); }],
    [S(134), l => { const cam = { x: 0, y: -305, z: 3.3 }; const e = EX(t, { browUp: .8, mouth: 'flat', lid: 0 }); return outFrame(t, cam, { tod: 'day', grass: false, behind: [c => { N(c, t, { x: 0, expr: e }); for (const s of [-1, 1]) { ell(c, s * 40, -1240 * K + 26, 16, 12); c.fillStyle = 'rgba(240,190,190,.6)'; c.fill(); } }] }); }],
    [S(135), l => { // slow-motion throw … and miss
      const thr = T_THROW, p = seg(t, thr - 1.2, thr), fly = seg(t, thr, thr + 2.6), cam = { x: lerp(-200, 900, ease(fly)), y: -420, z: .8 };
      const fr = outFrame(t, cam, { tod: 'day', behind: [c => herd(c, cam, t, { n: 12, p: 1, x0: 1300 + (t > S(136) ? (t - S(136)) * 1200 : 0), spread: 260, speed: 0, still: t < S(136), run: t > S(136), seed: 4, dust: t > S(136) ? 1 : 0 })],
        front: [c => { tribeSide(c, { who: 'jaeger', x: -300, armsSide: { nearA: lerp(-2.4, 1, ease(p)), nearB: .2, farA: .6, farB: .4 }, item: { k: 'thrower' }, expr: EX(t, { mouth: t > S(137) ? 'frown' : 'flat', frown: .6 }) }, t);
          if (fly > 0) { const x = lerp(-150, 2300, fly), y = -560 - Math.sin(fly * Math.PI) * 300 + (fly > .9 ? (fly - .9) * 3000 : 0); c.save(); c.translate(x, y); c.rotate(-.3 + fly * .8); line(c, [-220, 0, 220, 0], 12, '#1a120d'); line(c, [-220, 0, 220, 0], 7, '#9a6a3c'); c.beginPath(); c.moveTo(220, -10); c.lineTo(270, 0); c.lineTo(220, 10); c.closePath(); c.fillStyle = '#b8b2a8'; c.fill(); c.restore(); } }] });
      return fr; }],
    [S(137), l => { const cam = { x: 0, y: -360, z: 1.1 }; return outFrame(t, cam, { tod: 'day', snow: t > S(140) ? 30 : 0, behind: [c => { ['jaeger', 'mann1', 'mann3'].forEach((w, i) => tribe(c, { who: w, x: -400 + i * 300, k: .25, expr: EX(t, { seed: i, mouth: i === 0 && Math.sin(t * 5) > 0 ? 'talk' : 'frown', frown: .8, open: .3 }), item: { k: 'spear', rot: .02 } }, t)); N(c, t, { x: 600, expr: EX(t, { mouth: 'flat', browUp: .2 }) }); }] }); }],
  ], t);
}, .45, 'S17 miss');

// ======================= S18 ERFOLG =======================
const T_HIT = tw('wurf') ;
scene(S(142), t => { const lt = t - S(142);
  return shots([
    [S(142), l => { const cam = { x: l * 200, y: -420, z: .75 }; return outFrame(t, cam, { tod: 'day', behind: [c => herd(c, cam, t, { lt: l, n: 10, p: 1, x0: 600, spread: 300, speed: 200, seed: 5 })], front: [c => { ['jaeger', 'mann1', 'mann3', 'teen2'].forEach((w, i) => tribeSide(c, { who: w, x: l * 200 - 200 - i * 170, walk: t * 8 + i, item: { k: 'spear', rot: 1.4 } }, t)); NS(c, t, { x: l * 200 - 950, walk: t * 8 }); }] }); }],
    [S(144), l => { const cam = { x: 0, y: -440, z: .7 }, enc = ease(seg(l, 0, 3)); return outFrame(t, cam, { tod: 'day', behind: [c => { rentier(c, -60, { t, walk: null, graze: 0 }); rentier(c, 220, { t, walk: null, s: -1, male: 0 }); }],
      front: [c => { tribeSide(c, { who: 'jaeger', x: lerp(-1300, -800, enc), walk: enc < 1 ? t * 6 : null, item: { k: 'spear', rot: 1.4 } }, t); tribeSide(c, { who: 'mann1', x: lerp(1500, 1000, enc), s: -1, walk: enc < 1 ? t * 6 : null, item: { k: 'spear', rot: 1.4 } }, t); tribeSide(c, { who: 'mann3', x: lerp(-1500, -1050, enc), walk: enc < 1 ? t * 6 : null, item: { k: 'spear', rot: 1.4 } }, t); }] }); }],
    [T_HIT - 1.2, l => { // the throw: we see the spear fly out of frame (no violence shown), birds flush
      const cam = { x: 0, y: -420, z: .9 }, p = seg(t, T_HIT - 1.1, T_HIT - .2), fly = seg(t, T_HIT - .2, T_HIT + .8);
      return outFrame(t, cam, { tod: 'day', front: [c => { tribeSide(c, { who: 'jaeger', x: -500, armsSide: { nearA: lerp(-2.4, 1, ease(p)), nearB: .2 }, item: { k: 'thrower' } }, t); if (fly > 0 && fly < 1) { const x = lerp(-350, 1600, fly), y = -560 - Math.sin(fly * Math.PI) * 100; c.save(); c.translate(x, y); line(c, [-220, 0, 220, 0], 12, '#1a120d'); line(c, [-220, 0, 220, 0], 7, '#9a6a3c'); c.restore(); } }],
        after: [c => { if (t > T_HIT + .4) for (let i = 0; i < 7; i++) { const k = t - T_HIT - .4; vogel(c, W * .7 + i * 40 + k * 300, H * .4 - k * 200 - i * 20, { t: t + i }); } }] }); }],
    [S(145), l => { const cam = { x: 0, y: -320, z: 1.25 + l * .02 }, kneel = seg(t, S(146), S(146) + 1.2); return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .3, sunY: .5 }, behind: [c => lyingDeer(c, 120, t)],
      front: [c => { tribe(c, { who: 'jaeger', x: -200, k: .25, pose: kneel > .5 ? 'kneel' : 'stand', expr: EX(t, { eyes: t > S(146) + 1.5 && t < S(147) + 1 ? 'closed' : 'open', mouth: 'soft', look: 1 }), arms: { r: { a: .5 + kneel * .7, b: .2 } } }, t); ['mann1', 'teen2'].forEach((w, i) => tribe(c, { who: w, x: 480 + i * 200, k: .25, expr: EX(t, { seed: i, mouth: 'soft', look: -1 }), item: { k: 'spear', rot: .02 } }, t)); N(c, t, { x: 900, expr: EX(t, { mouth: 'soft', look: -1 }) }); }] }); }],
  ], t);
}, .45, 'S18 success');

// ======================= S19 HÖHLENLÖWE =======================
const T_LION = S(152);
scene(S(149), t => { const lt = t - S(149);
  const group = (c, close, shout) => { ['jaeger', 'mann1', 'mann3', 'teen2'].forEach((w, i) => { const x = lerp(-700 + i * 260, -420 + i * 120, close); tribe(c, { who: w, x, k: .25, expr: EX(t, { seed: i, mouth: shout ? 'shout' : 'flat', frown: .7, look: 1, browUp: shout ? 0 : .4 }), arms: shout ? { r: { a: 2.3, b: .1 }, l: { a: 1.9, b: .3 } } : { r: { a: .4, b: .2 } }, item: shout ? { k: 'spear', rot: 3.1, dx: 0 } : { k: 'spear', rot: .02 }, bob: shout ? -Math.abs(Math.sin(t * 8 + i)) * 20 : 0 }, t); }); };
  return shots([
    [S(149), l => { const cam = { x: 0, y: -360, z: 1.1 }; return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .2, sunY: .5 }, behind: [c => bushes(c, 900, t, 1.2, bump(t, S(151), S(151) + 1.8))], front: [c => { group(c, 0, 0); N(c, t, { x: -950, expr: EX(t, { look: 1, browUp: .8, mouth: 'flat' }) }); }] }); }],
    [T_LION - .1, l => { // lion steps out of the bush, close on its eyes (hard cut)
      const lx = lerp(1350, 800, ease(seg(l, 0, 2.5))), cam = { x: lerp(1000, lx - 300, ease(seg(l, 1.2, 4))), y: lerp(-300, -300, 1), z: lerp(1.2, 3.4, ease(seg(l, 1.2, 4))) };
      return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .2, sunY: .5 }, vig: .75, behind: [c => { loewe(c, lerp(1350, 800, ease(seg(l, 0, 2.5))), { t, s: -1, walk: l < 2.5 ? t * 3 : null, crouch: .6, snarl: seg(t, S(154), S(154) + .5) }); bushes(c, 1250, t, 1.2, bump(l, 0, 1)); }] }); }],
    [S(155), l => { const cam = { x: 0, y: -380, z: .85 }; return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .2, sunY: .5 }, vig: .7, behind: [c => { loewe(c, 800, { t, s: -1, crouch: .6, snarl: .6 }); }], front: [c => { group(c, seg(t, S(156), S(156) + 1), t > S(156) + 1.2); N(c, t, { x: -900, expr: EX(t, { browUp: 1, mouth: 'o', look: 1 }), tilt: Math.sin(t * 20) * .01 }); }] }); }],
    [S(157), l => { const cam = { x: 200, y: -380, z: .85 }; return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .2, sunY: .5 }, behind: [c => { loewe(c, 900 + l * 260, { t, s: 1, walk: t * 4 }); }], front: [c => { group(c, 1, 0); const e = EX(t, { eyes: t > S(158) && t < S(158) + 1 ? 'closed' : 'open', mouth: t > S(158) ? 'o' : 'flat', browUp: .6 }); N(c, t, { x: -700, expr: e, arms: t > S(158) && t < S(159) + .5 ? { r: { a: 1.2, b: 2.2 } } : undefined }); }] }); }],
    [S(161), l => { // together against the sunset: group silhouette
      const cam = { x: 0, y: -360, z: 1 };
      return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .5, sunY: .56 }, grass: false, behind: [c => {
        if (t < tw('zusammen', 1, S(161)) - .3) silh(c, c2 => tribe(c2, { who: 'jaeger', x: 600, k: .25, item: { k: 'spear', rot: .02 } }, t), '30,16,24');
        else silh(c, c2 => { ['jaeger', 'mann1', 'mann3', 'teen2', 'frau1', 'oma'].forEach((w, i) => tribe(c2, { who: w, x: -600 + i * 220, k: .25, item: i < 4 ? { k: 'spear', rot: .02 } : null }, t)); NS(c2, t, { x: 760, walk: null }); }, '30,16,24'); }] }); }],
  ], t);
}, .45, 'S19 lion');

// ======================= S20 TEILEN =======================
scene(S(163), t => { const lt = t - S(163);
  return shots([
    [S(163), l => { const cam = { x: 0, y: -330, z: 1.15 }; return outFrame(t, cam, { set: campSet, tod: 'dusk', setOpts: { rockX: -1600 }, behind: [c => { hideOnStakes(c, 900); lyingDeer(c, 100, t); }],
      front: [c => { tribe(c, { who: 'frau1', x: -220, k: .25, pose: 'kneel', arms: { r: { a: 1 + .2 * Math.sin(t * 4), b: .4 } }, item: { k: 'flint', rot: 0 }, expr: EX(t, { mouth: 'flat', look: 1 }) }, t); tribe(c, { who: 'mann1', x: 420, k: .25, pose: 'kneel', arms: { r: { a: .9 + .2 * Math.sin(t * 4 + 1), b: .5 } }, expr: EX(t, { mouth: 'flat', look: -1 }) }, t);
        tribe(c, { who: 'meister', x: 760, pose: 'sit', k: .25, arms: { r: { a: 1.5 + .6 * Math.max(0, Math.sin(t * 5)), b: .4 } }, item: { k: 'antler' }, expr: EX(t, { mouth: 'flat' }) }, t); bones(c, 820, 3); }] }); }],
    [S(167), l => { const cam = { x: 0, y: -190, z: 2.2 }; return caveFrame(t, cam, { mouth: 1600, fires: [{ x: 0, k: 1 }], behind: [c => { hearth(c, 0, t, 1, 1); line(c, [-260, -250, 220, -150], 12, '#5a3a22'); for (const dx of [-120, 40]) { c.save(); c.translate(dx, -215 + dx * .2); c.rotate(.2); ell(c, 0, 0, 60, 36); c.fillStyle = '#8a3a26'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#2a120a'; c.stroke(); ell(c, -8, -8, 34, 14); c.fillStyle = '#b8603e'; c.fill(); c.restore(); } }], after: [c => { const [x, y] = w2s(cam, -40, -260); smokeWisp(c, x, y, t, { n: 7, h: 400, r: 50, a: .3 }); for (let i = 0; i < 6; i++) { const ph = (t * 2 + i / 6) % 1; circle(c, x - 60 + i * 30, y + 40 - ph * 30, 3); c.fillStyle = `rgba(255,230,160,${1 - ph})`; c.fill(); } }] }); }],
    [S(168), l => { const cam = { x: 0, y: -300, z: 1.05 }; const who = ['oma', 'kind1', 'mann1', 'frau1', 'kind2', 'jaeger', 'opa']; return caveFrame(t, cam, { mouth: 1700, fires: [{ x: 0, k: 1 }], behind: [c => { hearth(c, 0, t, 1, 1); who.forEach((w, i) => { const x = [-900, -650, -400, 330, 560, 800, 1040][i], got = t > S(168) + .5 + i * .45; tribe(c, { who: w, x, pose: 'sit', k: .25, expr: EX(t, { seed: i, mouth: got ? 'smile' : 'soft', look: x < 0 ? 1 : -1 }), arms: got ? { r: { a: .9, b: 1.4 } } : undefined, item: got ? 'meat' : null }, t); }); }] }); }],
  ], t);
}, .45, 'S20 sharing');

// ======================= S21 NOAH ISST =======================
scene(S(172), t => { const lt = t - S(172), cam = { x: 0, y: -260, z: 1.9 }, [hx, hy] = noahHeadAt(0, 0, true), chew = t > S(172) + .8 ? Math.abs(Math.sin(t * 6)) : 0;
  const e = EX(t, { eyes: t > S(174) ? 'closed' : 'open', mouth: chew > .5 ? 'o' : 'smile', browUp: t > S(175) ? .6 : .2 });
  const fr = caveFrame(t, cam, { mouth: 1600, fires: [{ x: -300, k: 1 }], behind: [c => hearth(c, -300, t, 1, 1)],
    front: [c => { N(c, t, { x: 0, sit: true, seatH: 300, expr: e, arms: { r: { a: .9 - .5 * chew, b: 1.5 } } }); polish(c, t, hx, hy, e, { lx: -.8, ly: .4 }); const [mx, my] = noahHandWorld(0, (-300 - (NOAH.HEM + 40) - 60) * K, 1, { a: .9 - .5 * chew, b: 1.5 }); c.save(); c.translate(mx, my); c.scale(.25, .25); ITEMS.meat(c); c.restore(); }],
    after: [c => polishLit(c, cam, t, hx, hy, e, { lx: -.8, ly: .4, gdx: -8, gdy: 4 })] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardKeinSalz(c, t, [tw('salz'), tw('soße'), tw('ketchup')], S(174) + .4)); return fr; }, .45, 'S21 eating');

// ======================= S22 DER ERSTE HUND =======================
scene(S(176), t => { const lt = t - S(176), offer = seg(t, S(179), S(179) + 1.5), come = ease(seg(t, S(179) + 1, S(180) + 2));
  const cam = { x: 300, y: -280, z: 1.35 }, arm = { a: .4 + offer * .9, b: .1 }, [hx, hy] = noahHeadAt(0, 0, false), e = EX(t, { look: 1, mouth: 'smile', browUp: .3 });
  const fr = outFrame(t, cam, { set: campSet, tod: 'dusk', setOpts: { rockX: -1500 }, grass: true,
    behind: [c => { hearth(c, -500, t, 1, 1); woodPile(c, -900); }],
    front: [c => { wolf(c, lerp(900, 420, come), { t, s: -1, lie: come < .05 || come > .99 ? 1 : 0, walk: come > .05 && come < .99 ? t * 4 : null, wag: come, tilt: come > .9 ? Math.sin(t * 2) * .1 : 0 }); N(c, t, { x: 0, expr: e, arms: { r: arm } }); polish(c, t, hx, hy, e, { lx: -.6, ly: .3 });
      if (offer > 0) { const [mx, my] = noahHandWorld(0, 0, 1, arm); c.save(); c.translate(mx, my); c.scale(.22, .22); ITEMS.meat(c); c.restore(); } }],
    after: [c => { const [x, y] = w2s(cam, -500, -100); lightMap(c, '90,70,90', [{ x, y, r: 1400, col: '255,150,70', a: .8 }]); }] });
  return fr; }, .45, 'S22 wolf');
scene(S(182), t => { const lt = t - S(182), cam = { x: 0, y: -260, z: 1.6 };
  if (t > S(184) + .2 && t < S(186)) { // the sick puppy was cared for (warm, soft illustration)
    const fr = caveFrame(t, cam, { mouth: 1800, fires: [{ x: -300, k: .8 }], behind: [c => { hearth(c, -300, t, .8, 1); tribe(c, { who: 'frau3', x: 80, pose: 'sit', k: .25, expr: EX(t, { mouth: 'smile', eyes: 'closed' }), arms: { r: { a: .9, b: 1.2 }, l: { a: .9, b: 1.2 } } }, t); c.save(); c.translate(70, -110); c.scale(.42, .42); wolf(c, 0, { t, lie: 1 }); c.restore(); c.save(); c.translate(80, -92); ell(c, 0, 0, 70, 20); c.fillStyle = FURC.brown[0]; c.fill(); c.lineWidth = 4; c.strokeStyle = '#3a2a1a'; c.stroke(); c.restore(); }],
      after: [c => { c.fillStyle = 'rgba(255,200,140,.12)'; c.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { const ph = (t * .4 + i / 3) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.translate(W * .52 + i * 30, H * .35 - ph * 120); c.scale(.9, .9); heart(c, 0, 0, 20); c.fillStyle = '#e86a5a'; c.fill(); c.restore(); } }] });
    return fr; }
  const fr = outFrame(t, { x: 0, y: -300, z: 1.2 }, { set: campSet, tod: 'dusk', setOpts: { rockX: -1500 }, behind: [c => { hearth(c, -400, t, 1, 1); wolf(c, 300, { t, s: -1, lie: 1, wag: 1 }); N(c, t, { x: 0, sit: true, seatH: 260, expr: EX(t, { mouth: 'smile', look: 1 }), arms: { r: { a: .8, b: .6 } } }); }],
    after: [c => { c.fillStyle = 'rgba(10,8,14,.35)'; c.fillRect(0, 0, W, H); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardBonn(c, t, S(182) + .2, S(184) + .1)); return fr; }, .45, 'S22 Bonn');
scene(S(186), t => { const cam = { x: 150, y: -260, z: 1.5 }, [hx, hy] = noahHeadAt(0, 0, true, 260), e = EX(t, { mouth: 'smile', look: 1, eyes: 'open' });
  return outFrame(t, cam, { set: campSet, tod: 'dusk', setOpts: { rockX: -1500 }, behind: [c => hearth(c, -500, t, 1, 1)],
    front: [c => { N(c, t, { x: 0, sit: true, seatH: 260, expr: e, arms: { r: { a: 1.0, b: .3 } } }); wolf(c, 230, { t, s: -1, lie: 1, wag: 1, tilt: -.2 }); polish(c, t, hx, hy, e, { lx: -.6, ly: .3 }); }],
    after: [c => { const [x, y] = w2s(cam, -500, -100); lightMap(c, '90,70,90', [{ x, y, r: 1400, col: '255,150,70', a: .85 }]); }] }); }, .45, 'S22 friends');
