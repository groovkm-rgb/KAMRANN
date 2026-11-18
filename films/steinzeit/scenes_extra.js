// EXTRA SHOTS + TRANSITION STYLES: breaks up long static shots so every few seconds there is a new angle,
// and gives each cut a fitting transition. Loaded after scenes1–3.js (later registrations at the same time win).
const SF = name => { const s = SC.find(x => x.name === name); if (!s) throw new Error('scene ' + name); return s.f; };
const style = (name, st, xf) => { const s = SC.find(x => x.name === name); if (s) { s.style = st; if (xf != null) s.xf = xf; } };

// ---- S2: timeline over a slowly panning steppe with migrating silhouettes ----
scene(S(13), t => { const lt = t - S(13), cam = { x: -300 + lt * 70, y: -460, z: .6 };
  const fr = outFrame(t, cam, { tod: 'morning', snow: 25, behind: [c => herd(c, cam, t, { lt, n: 14, p: .5, x0: -900, spread: 260, speed: 60, sc: .5, y: 20, seed: 30 })], after: [c => { c.fillStyle = 'rgba(15,12,20,.3)'; c.fillRect(0, 0, W, H); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardDinoTimeline(c, t, S(13) + .2, S(15) - .1)); return fr; }, .45, 'S2 timeline b', 'leak');

// ---- S4: mother with baby, children — close ----
scene(S(34), t => { const lt = t - S(34), cam = { x: lerp(-80, 60, ease(seg(lt, 0, 6))), y: -280, z: 1.75 };
  const fr = caveFrame(t, cam, { mouth: 1600, fires: [{ x: 420, k: .7 }], behind: [c => { hearth(c, 420, t, .7, .9); }],
    front: [c => { tribe(c, { who: 'frau1', x: -120, k: .25, babyInArm: 1, expr: EX(t, { mouth: 'smile', look: .6 }), arms: { r: { a: .7, b: 1.6 }, l: { a: .7, b: 1.6 } } }, t); tribe(c, { who: 'kind3', x: 120, k: .25, expr: EX(t, { mouth: 'smile', look: -1, seed: 4 }) }, t); tribe(c, { who: 'opa', x: -380, k: .25, expr: EX(t, { mouth: 'smile', seed: 6, look: 1 }) }, t); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardVier(c, t, [tw('familie'), tw('team'), tw('versicherung'), tw('krankenhaus')], S(35) - .1)); return fr; }, .4, 'S4 family close', 'dissolve');

// ---- S6: laughing two-shot ----
scene(S(51) + .4, t => { const cam = { x: 0, y: -300, z: 1.9 };
  const fr = caveFrame(t, cam, { mouth: 1600, fires: [{ x: -500, k: .9 }], behind: [c => hearth(c, -500, t, .9, 1)],
    front: [c => { tribe(c, { who: 'jaeger', x: -150, k: .25, expr: EX(t, { mouth: 'laugh', eyes: 'closed' }), bob: -Math.abs(Math.sin(t * 9)) * 16, arms: { r: { a: .9, b: 1.6 } } }, t); tribe(c, { who: 'malerin', x: 170, k: .25, expr: EX(t, { mouth: 'laugh', seed: 3 }), bob: -Math.abs(Math.sin(t * 9 + 1)) * 16 }, t); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, tw('sapiens') - .4, tw('sapiens') + 3.4, 'Homo sapiens', 'moderne Menschen – wie du', 'tl', 760)); return fr; }, .4, 'S6 laugh close');

// ---- S8: "Ohne Turnschuhe" — boots on frosty ground ----
scene(S(69), t => { const lt = t - S(69), cam = { x: lt * 260, y: -70, z: 3.4 };
  return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false,
    front: [c => { for (let i = 0; i < 3; i++) tribeSide(c, { who: ['frau1', 'junge', 'oma'][i], x: lt * 260 - 120 + i * 260, walk: t * 8 + i }, t); for (let i = 0; i < 30; i++) { const x = cam.x - 600 + i * 40 + rnd(i) * 20; line(c, [x, 2, x + 6, -16 - rnd(i + 3) * 10], 3, 'rgba(240,248,255,.8)'); } }],
    after: [c => { c.fillStyle = 'rgba(200,220,255,.08)'; c.fillRect(0, 0, W, H); }] }); }, .35, 'S8 boots', 'whip');
scene(S(70), SF('S8 walking'), .35, 'S8 walking b');

// ---- S9: knowledge broken into images ----
function handsPlants(t, lt) { // close-up: elder's hands with a healing herb and poisonous berries
  return { set: 'blank', setOpts: { color: '#3a4a2a' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); furPatch(c, 0, 0, W, H, 41, ['#5a6a3a', '#3e4a28', '#7a8a4a'], { n: 1500, len: 40, lw: 4, dir: 1.3 });
      c.translate(W / 2, H / 2 + 220); c.scale(1.5 + lt * .02, 1.5 + lt * .02);
      for (const [s, good] of [[-1, true], [1, false]]) { c.save(); c.translate(s * 330, 0);
        line(c, [s * 200, 600, 0, 120], 230, '#1a120d'); line(c, [s * 200, 600, 0, 120], 210, PEOPLE.opa.coat[0]);
        c.beginPath(); c.ellipse(0, 60, 130, 100, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.opa.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke();
        if (good) { line(c, [0, 40, 0, -280], 12, '#4a6a2a'); for (let i = 0; i < 8; i++) { const y = -60 - i * 30; ell(c, (i % 2 ? 1 : -1) * 34, y, 36, 12, (i % 2 ? -1 : 1) * .5); c.fillStyle = '#6a9a3a'; c.fill(); } for (let i = 0; i < 9; i++) { circle(c, -30 + (i % 3) * 30, -300 - Math.floor(i / 3) * 18, 12); c.fillStyle = '#f2ecd8'; c.fill(); } }
        else { line(c, [0, 40, 10, -220], 10, '#5a3a2a'); for (let i = 0; i < 6; i++) { ell(c, -40 + i * 16, -140 - i * 14, 30, 12, .6); c.fillStyle = '#3a5a2a'; c.fill(); } for (let i = 0; i < 7; i++) { circle(c, -10 + (i % 3) * 26, -240 - Math.floor(i / 3) * 24, 14); c.fillStyle = '#c8202a'; c.fill(); circle(c, -14 + (i % 3) * 26, -244 - Math.floor(i / 3) * 24, 4); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); } }
        c.restore(); }
      c.restore(); }],
    screen: [c => { lightMap(c, '150,140,120', [{ x: W * .7, y: H * .1, r: 1500, col: '255,240,200', a: .7 }]);
      const a1 = seg(t, tw('heilt') - .2, tw('heilt') + .3), a2 = seg(t, tw('tötet') - .2, tw('tötet') + .3);
      if (a1 > 0) { c.save(); c.globalAlpha = a1; c.translate(W / 2 - 330, 150); c.lineWidth = 16; c.strokeStyle = '#3a8a3a'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-10, 30); c.lineTo(50, -40); c.stroke(); c.restore(); }
      if (a2 > 0) { c.save(); c.globalAlpha = a2; c.translate(W / 2 + 330, 150); line(c, [-40, -40, 40, 40], 16, '#d23a2a'); line(c, [40, -40, -40, 40], 16, '#d23a2a'); c.restore(); }
      finish(c, t, { vig: .55 }); }] };
}
scene(S(77), t => handsPlants(t, t - S(77)), .4, 'S9 plants');
scene(S(78), t => { const lt = t - S(78), ripe = seg(lt, .3, 1.8), cam = { x: 0, y: -120, z: 3.2 };
  return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false, behind: [c => { c.save(); c.translate(0, 20); c.scale(2, 2); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i / 13 - .5) * 2.6, L = 50 + rnd(i) * 30; line(c, [0, 0, Math.cos(a) * L, Math.sin(a) * L], 4, '#4a3a2a'); ell(c, Math.cos(a) * L, Math.sin(a) * L, 12, 7, a); c.fillStyle = '#4a7a3a'; c.fill(); }
    for (let i = 0; i < 10; i++) { circle(c, -40 + rnd(i + 5) * 80, -60 + rnd(i + 6) * 50, 6); c.fillStyle = `rgb(${lerp(140, 46, ripe) | 0},${lerp(170, 58, ripe) | 0},${lerp(70, 122, ripe) | 0})`; c.fill(); } c.restore(); }] }); }, .4, 'S9 berries');
scene(S(79), t => { const lt = t - S(79), cam = { x: lt * 40, y: -560, z: .45 };
  return outFrame(t, cam, { tod: 'day', setOpts: { snow: .2 }, behind: [c => herd(c, cam, t, { lt, n: 30, p: .5, x0: -2500, spread: 300, speed: 140, sc: .5, dust: .5, seed: 50 })], after: [c => { c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(120,200,90,.35)'; c.fillRect(0, 0, W, H); c.restore(); }] }); }, .4, 'S9 migration', 'whip');
scene(S(80), t => { const lt = t - S(80), cam = { x: 0, y: -290, z: 1.3 }, p1 = seg(lt, .3, 1.2), p2 = seg(lt, 1.4, 2.4);
  return caveFrame(t, cam, { mouth: 2400, fires: [{ x: 0, k: .8 }], behind: [c => hearth(c, 0, t, .8, .8)],
    front: [c => { tribe(c, { who: 'opa', x: -600, k: .25, expr: EX(t, { mouth: 'smile', look: 1 }), arms: { r: { a: .5 + .9 * p1, b: .2 } } }, t); tribe(c, { who: 'mann1', x: -150, k: .25, expr: EX(t, { mouth: 'smile', look: p2 > .5 ? 1 : -1 }), arms: { l: { a: .5 + .9 * p1, b: .2 }, r: { a: .5 + .9 * p2, b: .2 } } }, t); tribe(c, { who: 'kind2', x: 330, k: .25, expr: EX(t, { mouth: 'o', look: -1, browUp: .6 }), arms: { l: { a: .4 + .9 * p2, b: .2 } } }, t);
      const hx = lerp(-470, -280, p1) + (p2 > 0 ? lerp(0, 420, p2) : 0); c.save(); c.translate(hx, -230); line(c, [0, 0, 0, -90], 6, '#4a6a2a'); for (let i = 0; i < 4; i++) { ell(c, (i % 2 ? 1 : -1) * 16, -20 - i * 18, 16, 6, (i % 2 ? -1 : 1) * .5); c.fillStyle = '#6a9a3a'; c.fill(); } c.restore(); }] }); }, .4, 'S9 generations');
scene(S(81), t => { const lt = t - S(81), cam = { x: 0, y: -260, z: .8 };
  return outFrame(t, cam, { tod: 'morning', snow: 260, wind: 6, vig: .75, behind: [c => tribeSide(c, { who: 'teen2', x: -lt * 40, s: -1, walk: t * 4, armSwing: .15 }, t)], after: [c => { c.fillStyle = 'rgba(225,232,242,.4)'; c.fillRect(0, 0, W, H); }] }); }, .45, 'S9 lost', 'dip');

// ---- S10: the craftsman's concentration ----
scene(S(83), t => { const lt = t - S(83), cam = { x: 0, y: -250, z: 2.6 + lt * .05 };
  return outFrame(t, cam, { set: campSet, tod: 'day', setOpts: { rockX: -1500 }, grass: false, behind: [c => rock(c, 0, 0, 90, 4, '#7a746c')],
    front: [c => tribe(c, { who: 'meister', x: 0, pose: 'sit', k: .25, expr: EX(t, { look: .5, mouth: 'flat', frown: .4, eyes: 'open' }), arms: { l: { a: .7, b: 1.2 }, r: { a: .9 + .25 * Math.max(0, Math.sin(t * 5)), b: 1.0 } }, item: 'antler', item2: 'flint' }, t)] }); }, .35, 'S10 craftsman close');

// ---- S11: spear thrower macro ----
scene(S(95), t => { const lt = t - S(95), place = ease(seg(lt, .4, 1.8));
  return { set: 'blank', setOpts: { color: '#8a7a5a' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9ab0c8'); g.addColorStop(.6, '#d8d2c0'); g.addColorStop(1, '#b49c62'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.translate(W / 2 - 200, H / 2 + 80); c.rotate(-.12); c.scale(1.05 + lt * .01, 1.05 + lt * .01);
      // thrower (carved antler, hook at the end)
      rrect(c, -700, -26, 1100, 52, 26); c.fillStyle = '#1a120d'; c.fill(); rrect(c, -690, -18, 1080, 36, 18); const tg = c.createLinearGradient(0, -18, 0, 18); tg.addColorStop(0, '#efe4cc'); tg.addColorStop(1, '#b8a888'); c.fillStyle = tg; c.fill();
      for (let i = 0; i < 9; i++) line(c, [-600 + i * 90, -14, -560 + i * 90, 14], 4, '#7a6448');
      c.beginPath(); c.moveTo(380, -18); c.quadraticCurveTo(470, -40, 450, -110); c.lineTo(410, -100); c.quadraticCurveTo(420, -60, 370, -50); c.closePath(); c.fillStyle = '#d8c8a8'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#1a120d'; c.stroke();
      // hand gripping the end
      c.beginPath(); c.ellipse(-620, 0, 130, 90, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.jaeger.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke();
      // spear sliding into the hook
      const sx = lerp(-200, 380, place); c.save(); c.translate(sx, -90); line(c, [-1600, 0, 0, 0], 40, '#1a120d'); line(c, [-1600, 0, 0, 0], 26, '#9a6a3c'); c.beginPath(); c.moveTo(-1600, -30); c.lineTo(-1720, 0); c.lineTo(-1600, 30); c.closePath(); c.fillStyle = '#b8b2a8'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#1a120d'; c.stroke(); c.restore();
      c.restore(); }],
    screen: [c => { grade(c, { warm: '255,236,190', warmA: .2, cool: '40,50,90', coolA: .15 }); const a = seg(lt, 1.6, 2.1); if (a > 0) { c.save(); c.globalAlpha = a; c.lineWidth = 8; c.strokeStyle = CARD.amber; c.beginPath(); c.arc(W / 2 + 230, H / 2 - 20, 110, 0, Math.PI * 2); c.stroke(); cardBody(c, 'Haken', W / 2 + 230, H / 2 - 150, 46, CARD.cream, 'center'); c.restore(); }
      infoCard(c, t, { t0: S(95) - .2, t1: S(96) + .4, corner: 'tl', w: 680, h: 160, title: 'Speerschleuder' }); finish(c, t, { vig: .45 }); }] };
}, .4, 'S11 thrower macro');
scene(S(96), SF('S11 thrower'), .4, 'S11 thrower b');

// ---- S13: closer herd ----
scene(S(106), t => { const lt = t - S(106), cam = { x: lt * 120, y: -330, z: .85 };
  return outFrame(t, cam, { tod: 'day', behind: [c => { herd(c, cam, t, { lt, n: 18, p: .75, x0: -1600, spread: 300, speed: 200, sc: .85, dust: 1, seed: 60, run: 1 }); herd(c, cam, t, { lt, n: 8, p: 1, x0: -1400, spread: 420, speed: 260, sc: 1, dust: 1, seed: 61, run: 1 }); }] }); }, .35, 'S13 herd close', 'whip');
scene(S(107), SF('S13 herd'), .4, 'S13 herd b');

// ---- S14: Noah small against the mammoths ----
scene(S(115), t => { const lt = t - S(115), cam = { x: 500, y: -520, z: .62 };
  const fr = outFrame(t, cam, { tod: 'day', behind: [c => { mammut(c, 1250 - lt * 60, { t, walk: t * 2.5, s: -1 }); mammut(c, 2000 - lt * 60, { t, sc: .55, walk: t * 3, s: -1 }); }],
    front: [c => { NS(c, t, { x: -250, s: 1, walk: null, expr: EX(t, { browUp: 1, mouth: 'yawn', open: .5 }) }); castShadow(c, -250, 120, { alpha: .25 }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => { keywordCard(c, t, S(114) - .1, S(115) + .8, 'Wollhaarmammut', 'bis 3,5 m Schulterhöhe', 'tl', 760); cardMammutNoah(c, t, S(115) + 1.2, S(116) - .2); }); return fr; }, .4, 'S14 scale');

// ---- S15: rhino split into three angles ----
scene(S(118), t => { const cam = { x: 0, y: -305, z: 3.0 }, e = EX(t, { browUp: .9, mouth: 'o', look: 1 });
  return outFrame(t, cam, { tod: 'morning', grass: false, behind: [c => { N(c, t, { x: 0, expr: e }); polish(c, t, 0, -1240 * K, e, { lx: .8, ly: -.5 }); }] }); }, .4, 'S15 Noah wonder');
scene(S(119), SF('S15 rhino'), .35, 'S15 rhino b', 'whip');
scene(S(120) + 1.5, t => { const lt = t - S(120) - 1.5, hm = tw('meter', 1, S(120)), cam = { x: 420, y: -300, z: 2.0 + lt * .03 };
  const fr = outFrame(t, cam, { tod: 'morning', grass: false, behind: [c => { wollnashorn(c, -150, { t }); measureLine(c, 380 - 150 + 120 - 20, -270 + 80 - 30, 380 - 150 + 330 + 30, -270 - 160 - 40, seg(t, hm - .4, hm + .4), '', { lw: 10 }); }],
    after: [c => measureLabel(c, cam, 470, -520, 'über 1 m', seg(t, hm - .2, hm + .3))] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, S(119) - .1, S(119) + 3.4, 'Wollnashorn', 'Horn bis über 1 m', 'tl', 680)); return fr; }, .4, 'S15 horn');
scene(S(121), SF('S15 rhino'), .4, 'S15 rhino c');

// ---- S17: empty-handed, and what the gatherers found ----
scene(S(140), t => { const lt = t - S(140), cam = { x: -lt * 90, y: -360, z: .9 };
  return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .3, sunY: .55 }, front: [c => ['jaeger', 'mann1', 'mann3'].forEach((w, i) => tribeSide(c, { who: w, x: -lt * 90 + 300 - i * 230, s: -1, walk: t * 4 + i, armSwing: .15, tilt: .12, item: { k: 'spear', rot: 1.9 }, expr: EX(t, { mouth: 'frown' }) }, t))] }); }, .45, 'S17 empty', 'leak');
scene(S(141), t => { const lt = t - S(141), cam = { x: 0, y: -200, z: 2.2 };
  return caveFrame(t, cam, { mouth: 1600, fires: [{ x: 380, k: .8 }], behind: [c => hearth(c, 380, t, .8, 1)], front: [c => { tribe(c, { who: 'frau1', x: -120, pose: 'kneel', k: .25, expr: EX(t, { mouth: 'smile', look: 1 }), arms: { r: { a: 1, b: .6 } } }, t); c.save(); c.translate(140, -10); c.scale(1.4, 1.4); ITEMS.berries(c); c.restore(); c.save(); c.translate(40, -10); ITEMS.egg(c); c.restore(); }] }); }, .4, 'S17 gathered');

// ---- S20: marrow ----
scene(S(165) + 1.4, t => { const lt = t - S(165) - 1.4, hit = (lt % 1.2) < .12;
  return { set: 'blank', setOpts: { color: '#4a3424' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); furPatch(c, 0, 0, W, H, 71, ['#6a4e36', '#4a3424', '#8a6a4a'], { n: 1200, len: 40, lw: 4, dir: .2 }); c.translate(W / 2, H / 2 + 100);
      rock(c, 0, 160, 260, 7, '#7a746c'); c.save(); c.rotate(-.1); line(c, [-380, 0, 380, 0], 110, '#2a2218'); line(c, [-380, 0, 380, 0], 90, '#e6dcc4'); for (const e of [-1, 1]) { circle(c, e * 390, -30, 60); c.fillStyle = '#e6dcc4'; c.fill(); c.lineWidth = 10; c.strokeStyle = '#2a2218'; c.stroke(); circle(c, e * 390, 30, 60); c.fill(); c.stroke(); }
      if (lt > 1.3) { c.fillStyle = '#f0d070'; ell(c, 0, 0, 60, 30); c.fill(); for (let i = 0; i < 6; i++) { const ph = (t * 1.5 + i / 6) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); star(c, -40 + i * 18, -40 - ph * 80, 10, 4, .4); c.fillStyle = '#ffe9a0'; c.fill(); c.restore(); } line(c, [-10, -40, 10, 40], 8, '#2a2218'); }
      c.restore();
      const sw = hit ? 0 : Math.min(1, ((lt % 1.2) - .12) / .5); c.save(); c.translate(150 + sw * 60, -120 - sw * 260); c.rotate(-.6 - sw * .4); line(c, [0, 0, 300, -60], 60, '#1a120d'); line(c, [0, 0, 300, -60], 44, '#d8c8a8'); c.beginPath(); c.ellipse(320, -60, 110, 80, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.meister.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke(); c.restore();
      c.restore(); }],
    screen: [c => { lightMap(c, '120,96,84', [{ x: W * .2, y: H * .8, r: 1600, col: '255,160,80', a: .8 }]); finish(c, t, { vig: .55 }); }] };
}, .35, 'S20 marrow');
scene(S(167), SF('S20 sharing'), .4, 'S20 sharing b');

// ---- S22: the wolf's face, then friendship ----
scene(S(177), t => { const lt = t - S(177), cam = { x: 300, y: -150, z: 2.8 - lt * .08 };
  return outFrame(t, cam, { set: campSet, tod: 'dusk', setOpts: { rockX: -1500 }, grass: false, behind: [c => wolf(c, 420, { t, s: -1, lie: 1, wag: lt > 1.5 ? 1 : 0, tilt: Math.sin(t * .8) * .08 })],
    after: [c => lightMap(c, '110,90,110', [{ x: W * .1, y: H * .9, r: 1600, col: '255,150,70', a: .8 }])] }); }, .4, 'S22 wolf face');
scene(S(179), SF('S22 wolf'), .4, 'S22 wolf b');
scene(S(181), t => { const cam = { x: 0, y: -330, z: 1.1 };
  return outFrame(t, cam, { set: campSet, tod: 'dusk', setOpts: { rockX: -1600, sunX: .55, sunY: .56 }, grass: false, behind: [c => silh(c, c2 => { tribe(c2, { who: 'mann2', x: -150, pose: 'sit', k: .25, arms: { r: { a: 1.2, b: .6 } } }, t); wolf(c2, 220, { t, s: -1, lie: 1, wag: 1 }); }, '34,18,26')] }); }, .45, 'S22 friendship', 'leak');

// ---- S23: under the Hohle Fels card: listening children, then the flute again ----
scene(S(198), t => { const cam = { x: 120, y: -230, z: 1.9 };
  const fr = caveFrame(t, cam, { mouth: 2600, fires: [{ x: -300, k: 1 }], ambient: '40,32,44', behind: [c => hearth(c, -300, t, 1, 1)], front: [c => ['kind1', 'kind2', 'kind3'].forEach((w, i) => tribe(c, { who: w, x: 0 + i * 170, pose: 'sit', k: .25, expr: EX(t, { seed: i, mouth: 'o', browUp: .9, look: -1 }) }, t))] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardHohleFels(c, t, S(197) - .1, S(199) + 2.6)); return fr; }, .4, 'S23 kids');

// ---- S24: Lascaux — a whole painted wall, then modern visitors admiring it ----
function paintedWall(t, lt, visitors) {
  const pan = lt * 40;
  return { set: 'blank', setOpts: { color: '#5a4a3e' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(-pan, 0); rockMass(c, -100, W + 600, -50, H + 50, 401, { n: 300, cracks: 30, wet: 40, top: '#7a6a5a', mid: '#9a8470', bot: '#6a5848' });
      for (const [x, y, s] of [[300, 300, 1.4], [900, 220, 1.1], [1450, 380, 1.5], [1900, 250, 1.2]]) caveArt(c, x, y, s, t, { a: .75 });
      c.restore();
      if (visitors) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; for (const bx of [520, 1300]) { const g = c.createRadialGradient(bx, 360, 30, bx, 360, 520); g.addColorStop(0, 'rgba(255,240,210,.55)'); g.addColorStop(1, 'rgba(255,240,210,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); } c.restore();
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(0, H + 40); c.scale(1.2, 1.2);
        silh(c, c2 => { const mod = (who, coat) => Object.assign({}, PEOPLE[who], { coat, fur: coat, beads: null, ochre: 0 }); tribe(c2, { who: mod('frau2', ['#4a6a8a', '#2e3a54', '#7a8aa8']), x: 380, k: .4 }, t); tribe(c2, { who: mod('mann2', ['#6a3a3a', '#3a2020', '#8a5a5a']), x: 760, k: .42 }, t); tribe(c2, { who: mod('kind1', ['#c8a040', '#8a6a20', '#e0c070']), x: 1060, k: .4 }, t); }, '12,10,14', .95);
        c.restore(); } }],
    screen: [c => { lightMap(c, visitors ? '96,84,86' : '90,74,70', visitors ? [] : [{ x: W * .3, y: H * .9, r: 1600, col: '255,150,70', a: .85 }]); finish(c, t, { vig: .55 }); }] };
}
scene(S(206), t => { const fr = paintedWall(t, t - S(206), false); fr.screen.splice(fr.screen.length - 1, 0, c => cardLascaux(c, t, S(207) - .1, S(208) + 1.5)); return fr; }, .45, 'S24 painted wall', 'leak');
scene(S(208), t => paintedWall(t, t - S(206), true), .5, 'S24 visitors', 'dissolve');

// ---- S26: healthy elders working (under the myth chart) ----
scene(S(216), t => { const cam = { x: 0, y: -290, z: 1.3 };
  const fr = caveFrame(t, cam, { mouth: 2600, fires: [{ x: 0, k: .9 }], behind: [c => hearth(c, 0, t, .9, .9)],
    front: [c => { tribe(c, { who: 'opa', x: -420, pose: 'sit', k: .25, expr: EX(t, { mouth: 'smile', look: 1 }), arms: { r: { a: 1 + .2 * Math.sin(t * 5), b: 1 } }, item: 'antler' }, t); tribe(c, { who: 'oma', x: 420, pose: 'sit', k: .25, expr: EX(t, { mouth: 'smile', look: -1, seed: 3 }), arms: { r: { a: .9 + .2 * Math.sin(t * 4), b: 1.2 } }, item: 'needle' }, t); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardMythos(c, t, S(211) + 1.2, S(213), S(215), S(217) - .1)); return fr; }, .45, 'S26 elders');

// ---- S30: the ice age ends (warming), hunters, the last mammoths on Wrangel Island ----
scene(S(247), t => { const lt = t - S(247), k = seg(lt, 0, 5), cam = { x: lt * 50, y: -380, z: .8 };
  const fr = outFrame(t, cam, { set: forestEdge, tod: 'day', grass: false, behind: [c => { for (let i = 0; i < 8; i++) { const g = ease(clamp(k * 1.6 - i * .1)); if (g <= 0) continue; c.save(); c.translate(-900 + i * 300, 0); c.scale(g, g); birch(c, 0, 0, 420 + rnd(i) * 160, i + 70); c.restore(); } }],
    after: [c => { c.save(); c.globalAlpha = 1 - k; c.fillStyle = 'rgba(240,244,250,.6)'; c.fillRect(0, 0, W, H); c.restore(); const sx = W * (.1 + .8 * ((lt * .9) % 1)), sy = H * (.4 - .25 * Math.sin(((lt * .9) % 1) * Math.PI)); bloom(c, sx, sy, 260, '255,240,200', .6); }] });
  return fr; }, .45, 'S30 warming', 'leak');
scene(S(248) + 3.2, t => { const cam = { x: 0, y: -440, z: .7 };
  return outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .5, sunY: .55 }, grass: false, behind: [c => silh(c, c2 => { mammut(c2, 600, { t, walk: t * 2, s: -1 }); ['jaeger', 'mann1', 'mann3'].forEach((w, i) => tribe(c2, { who: w, x: -700 + i * 220, k: .25, item: { k: 'spear', rot: .02 } }, t)); }, '40,22,30')] }); }, .45, 'S30 hunted');
scene(S(250), t => { const lt = t - S(250), cam = { x: lt * 30, y: -420, z: .6 };
  const fr = outFrame(t, cam, { tod: 'morning', setOpts: { snow: 2 }, grass: false, snow: 50,
    behind: [c => { c.fillStyle = '#5a7a9a'; c.fillRect(-3000, -40, 6000, 2000); for (let i = 0; i < 30; i++) { ell(c, -2000 + rnd(i) * 4000, 40 + rnd(i + 1) * 500, 80 + rnd(i + 2) * 200, 8); c.fillStyle = 'rgba(240,248,255,.6)'; c.fill(); }
      c.beginPath(); c.ellipse(200, -10, 1300, 140, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#c8c0a8'; c.fill(); c.beginPath(); c.ellipse(200, -60, 1100, 80, 0, Math.PI, 0); c.fillStyle = '#eef2f6'; c.fill();
      mammut(c, -100 + lt * 20, { t, sc: .55, y: -60, walk: t * 2 }); mammut(c, 500, { t, sc: .5, y: -70, graze: .6, s: -1 }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => { cardWrangel(c, t, S(250) - .1, S(252) + .5, S(254) - .2); if (lt > 0 && lt < 3.5) { /* label handled by the card */ } }); return fr; }, .45, 'S30 Wrangel', 'whip');

// ---- S33: Noah close, then waving goodbye ----
scene(S(272), t => { const cam = { x: 0, y: -372, z: 2.0 }, e = EX(t, { mouth: 'smile', browUp: .4 });
  return roomFrame(t, cam, { tod: 'morning', front: [c => { N(c, t, { x: 0, expr: e }); polish(c, t, 0, -1240 * K, e, { lx: .8, ly: -.5 }); }], after: [c => cardFrage(c, t, S(271) - .1, S(274))] }); }, .4, 'S33 close');
scene(S(274), t => { const cam = { x: 120, y: -360, z: 1.35 }, wave = Math.sin((t - S(274)) * 7), e = EX(t, { mouth: 'smile', browUp: .3 });
  return roomFrame(t, cam, { tod: 'morning', horse: seg(t, VO_END - .8, VO_END + .2) * (1 - seg(t, VO_END + .5, VO_END + .9)),
    front: [c => { N(c, t, { x: 0, expr: e, arms: { r: { a: 2.5, b: .3 + .35 * wave } } }); polish(c, t, 0, -1240 * K, e, { lx: .8, ly: -.5 }); }] }); }, .4, 'S33 wave');

// ---- transition styles for the existing scenes ----
[['S1 embers', 'dissolve'], ['S1 eiszeit', 'flash'], ['S2 dino', 'dip'], ['S3 cold', 'dip'], ['S3 steppe', 'whip'], ['S4 alone in the steppe', 'whip'], ['S5 fire', 'leak'], ['S5 cape', 'leak'], ['S6 sapiens', 'flash'],
 ['S7 lumpen', 'whip'], ['S8 leave camp', 'leak'], ['S8 frosty walk', 'dissolve'], ['S9 mushroom', 'whip'], ['S10 craftsman', 'leak'], ['S11 tools', 'dissolve'], ['S12 shh', 'whip'], ['S13 herd', 'flash'],
 ['S14 horses', 'whip'], ['S14 bison', 'whip'], ['S15 rhino', 'whip'], ['S16 giant deer', 'leak'], ['S17 miss', 'whip'], ['S18 success', 'whip'], ['S19 lion', 'dip'], ['S20 sharing', 'leak'], ['S21 eating', 'leak'],
 ['S22 wolf', 'leak'], ['S22 Bonn', 'dissolve'], ['S22 friends', 'leak'], ['S23 evening', 'leak'], ['S24 art', 'leak'], ['S25 Noah hand', 'leak'], ['S26 myth', 'dip'], ['S27 stars', 'leak'], ['S28 wolves', 'dip'], ['S29 montage', 'leak'],
 ['S30 extinct', 'dip'], ['S31 sleep', 'dissolve']].forEach(([n, s]) => style(n, s));
scene(S(217), SF('S26 myth'), .45, 'S26 myth b');
