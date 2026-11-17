// SCENES S23–S33 (paragraphs 22–32): evening, music, cave art, myth, night, wake-up, ending.
function shadowPuppets(c, t, x, y, a) {
  // animal shadows dancing on the wall behind the storyteller
  c.save(); c.globalAlpha = a; c.translate(x, y);
  const fl = 1 + .04 * Math.sin(t * 9);
  silh(c, c2 => { c2.save(); c2.translate(x - 300 + Math.sin(t * .7) * 80, y + 40); c2.scale(.32 * fl, .32 * fl); mammut(c2, 0, { t, walk: t * 2 }); c2.restore();
    c2.save(); c2.translate(x + 260 + Math.sin(t * .9 + 1) * 120, y + 30); c2.scale(.4 * fl, .4 * fl); rentier(c2, 0, { t, walk: t * 6, run: 1, s: -1 }); c2.restore();
    c2.save(); c2.translate(x + 40 + Math.sin(t * .5) * 60, y + 40); c2.scale(.28 * fl, .28 * fl); tribeSide(c2, { who: 'jaeger', x: 0, walk: t * 6, item: { k: 'spear', rot: 1.4 } }, t); c2.restore(); }, '24,14,12', .55 * a);
  c.restore();
}
function sceneAt(tp) { SC.sort((p, q) => p.a - q.a); let s = SC[0]; for (const x of SC) if (x.a <= tp) s = x; return s.f(tp); }

// ======================= S23 ABEND: GESCHICHTEN & FLÖTE =======================
scene(S(187), t => { const lt = t - S(187);
  return shots([
    [S(187), l => { const cam = { x: l * 20, y: -480, z: .6 }; return outFrame(t, cam, { set: campSet, tod: 'dusk', setOpts: { rockX: -1200, sunX: .7, sunY: .55 }, behind: [c => { hearth(c, -300, t, 1, 1.2); skinTent(c, 600); for (let i = 0; i < 6; i++) tribeSide(c, { who: ['frau1', 'kind1', 'mann1', 'oma', 'kind2', 'jaeger'][i], x: 1400 - i * 170 - l * 120, s: -1, walk: t * 7 + i }, t); }], after: [c => { const [x, y] = w2s(cam, -300, -100); lightMap(c, '150,120,150', [{ x, y, r: 900, col: '255,150,60', a: .8 }]); }] }); }],
    [S(190), l => { // storyteller + shadow theatre on the wall
      const cam = { x: lerp(-100, 100, ease(seg(l, 0, 9))), y: -380, z: 1.05 };
      const kids = ['kind1', 'kind2', 'kind3'];
      return caveFrame(t, cam, { mouth: 2600, fires: [{ x: 120, k: 1, r: 1500 }], ambient: '30,24,34', vig: .65,
        behind: [c => { shadowPuppets(c, t, -100, -700, seg(t, S(190) + 1.2, S(190) + 2.5)); hearth(c, 120, t, 1, 1); }],
        front: [c => { tribe(c, { who: 'erzaehler', x: -420, pose: 'sit', k: .25, expr: EX(t, { mouth: 'talk', open: .2 + .5 * Math.abs(Math.sin(t * 7)), look: 1 }), arms: { r: { a: 1.2 + .5 * Math.sin(t * 1.3), b: .3 + .3 * Math.sin(t * 2) } } }, t);
          kids.forEach((w, i) => tribe(c, { who: w, x: 480 + i * 170, pose: 'sit', k: .25, expr: EX(t, { seed: i, mouth: t > S(192) ? 'o' : 'smile', browUp: t > S(192) ? 1 : .4, look: -1 }) }, t)); N(c, t, { x: 1050, sit: true, seatH: 260, expr: EX(t, { look: -1, mouth: 'smile' }) }); }],
        after: [c => { if (t > S(192)) for (let i = 0; i < 3; i++) { const [x, y] = w2s(cam, 480 + i * 170, -1240 * .25 * .64 - 230 * .16 + 6); } }] }); }],
    [S(193), l => { // the bone flute
      const cam = { x: 0, y: -330, z: 1.8 }, play = t > S(195);
      return caveFrame(t, cam, { mouth: 2600, fires: [{ x: 300, k: 1 }], ambient: '30,24,34',
        behind: [c => hearth(c, 300, t, 1, 1)],
        front: [c => { tribe(c, { who: 'teen2', x: 0, pose: 'sit', k: .25, expr: EX(t, { eyes: play ? 'closed' : 'open', mouth: play ? 'o' : 'smile' }), arms: { r: { a: 1.9, b: 1.4 }, l: { a: 1.6, b: 1.5 } }, item: { k: 'flute', rot: 1.4 } }, t); }],
        after: [c => { if (play) { for (let i = 0; i < 4; i++) { const ph = (t * .5 + i / 4) % 1, [x, y] = w2s(cam, 160 + ph * 260, -360 - ph * 160 + Math.sin(ph * 9 + i) * 30); c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.fillStyle = CARD.amber; c.font = `64px ${F_BODY}`; c.fillText(i % 2 ? '♪' : '♫', x, y); c.restore(); } } }] }); }],
    [S(196), l => { const cam = { x: 200, y: -400, z: .95 }; const fr = caveFrame(t, cam, { mouth: 2600, fires: [{ x: 600, k: 1 }], ambient: '30,24,34', behind: [c => { hearth(c, 600, t, 1, 1); tribe(c, { who: 'teen2', x: 900, pose: 'sit', k: .25, expr: EX(t, { eyes: 'closed', mouth: 'o' }), arms: { r: { a: 1.9, b: 1.4 }, l: { a: 1.6, b: 1.5 } }, item: { k: 'flute', rot: 1.4 } }, t); }] });
      fr.screen.splice(fr.screen.length - 1, 0, c => cardHohleFels(c, t, S(197) - .1, S(199) + 2.6)); return fr; }],
  ], t);
}, .5, 'S23 evening');

// ======================= S24 HÖHLENKUNST =======================
function wallClose(t, lt, o) {
  // full-frame painted rock wall; o.hand (0..1 pressed), o.spray, o.print (0..1), o.horse (0..1 drawing progress), o.run, o.noahHand, o.noahPrint
  const cx = W / 2, cy = H / 2;
  return { set: 'blank', setOpts: { color: '#5a4a3e' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(0, 0); rockMass(c, -50, W + 50, -50, H + 50, 301, { n: 260, cracks: 30, wet: 40, top: '#6e5c4e', mid: '#8a7462', bot: '#6a5848' });
      // old art already on the wall
      caveArt(c, cx - 600, cy - 220, 1.3, t, { a: .5 });
      // the new hand stencil
      const hx = cx - 120, hy = cy + 40;
      if (o.print > 0) { c.save(); c.globalAlpha = o.print; const g = c.createRadialGradient(hx, hy, 30, hx, hy, 190); g.addColorStop(0, 'rgba(184,62,30,.85)'); g.addColorStop(1, 'rgba(184,62,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(hx, hy, 200, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.restore();
        c.save(); c.globalAlpha = o.print * .9; c.globalCompositeOperation = 'multiply'; c.restore(); }
      // spray particles while blowing
      if (o.spray > 0) { for (let i = 0; i < 120; i++) { const a = rnd(i + Math.floor(t * 20)) * Math.PI * 2, d = 90 + rnd(i * 3 + Math.floor(t * 20)) * 140; circle(c, hx + Math.cos(a) * d, hy + Math.sin(a) * d, 2 + rnd(i) * 3); c.fillStyle = `rgba(190,64,30,${.6 * o.spray})`; c.fill(); } }
      // hand pressed against the wall (painter's) — with its stencil cut-out
      if (o.print > 0) { c.save(); c.fillStyle = '#7a6a5a'; c.globalAlpha = o.print; iconHand(c, hx, hy + 10, 4.2, 'rgba(150,128,108,1)'); c.restore(); }
      if (o.hand > 0) { c.save(); c.globalAlpha = o.hand; iconHand(c, hx, hy + 10, 4.2, PEOPLE.malerin.skin); c.lineWidth = 6; c.restore(); line(c, [hx - 30, hy + 120, hx - 120, H + 100], 150 * o.hand, '#1a120d'); line(c, [hx - 30, hy + 120, hx - 120, H + 100], 130 * o.hand, PEOPLE.malerin.coat[0]); }
      // charcoal horse, drawn stroke by stroke, then "runs"
      if (o.horse > 0) { c.save(); const run = o.run || 0; c.translate(cx + 330 + Math.sin(run * 12) * 10 * Math.sin(run * Math.PI) + run * 60, cy - 30 - Math.abs(Math.sin(run * 12)) * 12 * Math.sin(run * Math.PI)); c.scale(2.6, 2.6);
        c.beginPath(); c.rect(-140, -100, 280 * o.horse, 200); c.clip(); c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = 'rgba(24,18,16,.9)';
        c.beginPath(); c.moveTo(-70, 0); c.bezierCurveTo(-60, -40, 30, -45, 60, -30); c.quadraticCurveTo(85, -60, 108, -78); c.quadraticCurveTo(128, -70, 120, -50); c.quadraticCurveTo(100, -32, 92, -8); c.quadraticCurveTo(70, 30, 30, 26); c.lineTo(-40, 28); c.quadraticCurveTo(-75, 20, -70, 0); c.stroke();
        c.beginPath(); c.moveTo(60, -36); c.lineTo(70, -58); c.lineTo(80, -50); c.lineTo(88, -68); c.stroke();
        const lg = Math.sin(run * 30) * 10 * Math.sin(run * Math.PI); for (const [lx, s] of [[-50, 1], [-30, -1], [40, 1], [58, -1]]) { c.beginPath(); c.moveTo(lx, 24); c.lineTo(lx + s * lg + (lx > 0 ? 6 : -4), 70); c.stroke(); }
        c.beginPath(); c.moveTo(-70, 0); c.quadraticCurveTo(-95, 15, -88, 45); c.stroke(); c.restore(); }
      // Noah's hand print next to it (with the watch on his wrist while pressing)
      const nx = cx - 420, ny = cy + 160;
      if (o.noahPrint > 0) { c.save(); c.globalAlpha = o.noahPrint; const g = c.createRadialGradient(nx, ny, 30, nx, ny, 180); g.addColorStop(0, 'rgba(184,62,30,.8)'); g.addColorStop(1, 'rgba(184,62,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(nx, ny, 190, 0, Math.PI * 2); c.fill(); iconHand(c, nx, ny + 10, 4, 'rgba(150,128,108,1)'); c.restore(); }
      if (o.noahHand > 0) { c.save(); c.globalAlpha = o.noahHand; c.translate(nx, ny + 260); c.rotate(Math.PI); c.scale(2.6, 2.6); noahHandLocal(c, 0); c.restore(); line(c, [nx, ny + 250, nx + 40, H + 120], 190, NOAH.out); line(c, [nx, ny + 250, nx + 40, H + 120], 170, NOAH.skin);
        rrect(c, nx - 90, ny + 330, 200, 70, 24); c.fillStyle = NOAH.out; c.fill(); rrect(c, nx - 84, ny + 336, 188, 58, 20); c.fillStyle = NOAH.watch; c.fill(); circle(c, nx + 10, ny + 365, 46); c.fillStyle = NOAH.out; c.fill(); circle(c, nx + 10, ny + 365, 38); c.fillStyle = '#f4efe2'; c.fill(); line(c, [nx + 10, ny + 365, nx + 10, ny + 338], 5, '#2a2218'); line(c, [nx + 10, ny + 365, nx + 30, ny + 372], 5, '#2a2218'); }
      c.restore(); }],
    screen: [c => { lightMap(c, '50,40,46', [{ x: W * .25, y: H * .95, r: 1500, col: '255,150,70', a: .95 * (1 + .08 * Math.sin(t * 9)) }, { x: W * .7, y: H * .4, r: 1000, col: '255,190,120', a: .4 }]); for (const f of o.after || []) f(c); finish(c, t, { vig: .6 }); }] };
}
scene(S(200), t => { const lt = t - S(200);
  if (t < S(202)) { const cam = { x: 0, y: -300, z: 1.6 }; return caveFrame(t, cam, { mouth: 2400, fires: [{ x: -500, k: 1 }], behind: [c => { hearth(c, -500, t, 1, 1); }], front: [c => { tribe(c, { who: 'malerin', x: 0, pose: 'kneel', k: .25, expr: EX(t, { mouth: 'smile', look: 1 }), arms: { r: { a: .9 + .3 * Math.sin(t * 5), b: 1 } } }, t); ell(c, 220, -10, 70, 24); c.fillStyle = '#5a4030'; c.fill(); ell(c, 220, -18, 54, 12); c.fillStyle = '#b8402a'; c.fill(); }] }); }
  const hand = t < S(203) + .3 ? 1 : 1 - seg(t, S(203) + .3, S(203) + .9), spray = t > S(202) + 1.4 && t < S(203) + .2 ? 1 : 0, print = seg(t, S(203) + .3, S(203) + .9);
  const horse = seg(t, S(204) + .5, S(205) - .2), run = seg(t, S(205) + 1.2, S(205) + 3.4);
  return wallClose(t, lt, { hand, spray, print, horse, run });
}, .45, 'S24 art');
scene(S(206), t => { const lt = t - S(206), cam = { x: -400 + lt * 30, y: -500, z: .9 };
  const fr = caveFrame(t, cam, { mouth: 2600, fires: [{ x: -200, k: 1, r: 1600 }], ambient: '40,32,40', behind: [c => hearth(c, -200, t, 1, 1)] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardLascaux(c, t, S(207) - .1, S(208) + 1.5)); return fr; }, .45, 'S24 Lascaux');
scene(S(209), t => { const lt = t - S(209);
  return wallClose(t, lt, { print: 1, horse: 1, noahHand: t < S(210) ? 1 : 1 - seg(t, S(210), S(210) + .6), noahPrint: seg(t, S(210), S(210) + .6) });
}, .45, 'S25 Noah hand');

// ======================= S26 MYTHOS =======================
scene(S(211), t => { const lt = t - S(211);
  if (t < S(217)) { const cam = { x: 0, y: -300, z: 1.1 }; const fr = caveFrame(t, cam, { mouth: 2600, fires: [{ x: -600, k: .9 }], behind: [c => { hearth(c, -600, t, .9, 1); tribe(c, { who: 'erzaehler', x: -250, k: .25, expr: EX(t, { mouth: 'smile' }) }, t); tribe(c, { who: 'opa', x: 0, k: .25, expr: EX(t, { mouth: 'smile', seed: 2 }) }, t); tribe(c, { who: 'oma', x: 250, k: .25, expr: EX(t, { mouth: 'smile', seed: 3 }) }, t); }], vig: .7 });
    fr.screen.splice(fr.screen.length - 1, 0, c => { c.fillStyle = 'rgba(10,8,14,.4)'; c.fillRect(0, 0, W, H); cardMythos(c, t, S(211) + 1.2, S(213), S(215), S(217) - .1); }); return fr; }
  const cam = { x: 0, y: -300, z: 1.25 }, wifi = seg(t, tw('internet', 2) - .4, tw('internet', 2) + .6);
  return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false,
    front: [c => { tribe(c, { who: 'oma', x: -280, k: .25, expr: EX(t, { mouth: 'talk', open: .2 + .4 * Math.abs(Math.sin(t * 6)), look: 1 }), arms: { r: { a: 1.3, b: .2 } } }, t); ['kind1', 'kind3'].forEach((w, i) => tribe(c, { who: w, x: 200 + i * 180, k: .25, expr: EX(t, { seed: i, mouth: 'o', browUp: .6, look: -1 }) }, t)); }],
    after: [c => { const [x, y] = w2s(cam, -280, -1240 * .25 * .96 - 110); wifiIcon(c, x, y, 2.2, wifi); }] });
}, .45, 'S26 myth');

// ======================= S27 STERNENHIMMEL =======================
scene(S(222), t => { const lt = t - S(222), tilt = ease(seg(t, S(225), S(225) + 3.5));
  // camp at night, camera tilts up into the Milky Way
  const cam = { x: 0, y: lerp(-320, -2600, tilt), z: lerp(1.1, .9, tilt) };
  return { set: (c, cm, tt) => { steppeSet(c, cm, tt, { tod: 'night' }); return { base: '#0a0e18' }; }, cam, blur: 0, vignette: 0,
    behind: [c => { hearth(c, -100, t, 1, 1); sleepersRow(c, t, w => ['opa', 'frau2', 'mann2', 'kind2'].includes(w)); noahLying(c, t, 300, { e: EX(t, { look: 0, browUp: .6, mouth: tilt > .5 ? 'o' : 'soft' }), lift: .2 }); }],
    screen: [c => { const [x, y] = w2s(cam, -100, -100); lightMap(c, '50,60,100', [{ x, y, r: 1100 * cam.z, col: '255,140,60', a: .9 }]);
      nightSky(c, t, { a: clamp(tilt * 1.4 + (t > S(225) ? .25 : 0)), dy: lerp(-600, 0, tilt) });
      layer(c, cam, 1, c => {}); if (tilt < .7) { const [fx, fy] = w2s(cam, -100, -120); sparks(c, fx, fy, t, { n: 10, h: 400, size: 3 }); }
      finish(c, t, { vig: .55 }); }] };
}, .5, 'S27 stars');

// ======================= S28 WÖLFE & WACHE =======================
scene(S(229), t => { const lt = t - S(229);
  return shots([
    [S(229), l => { const cam = { x: 0, y: -500, z: .6 }; return { set: (c, cm, tt) => { steppeSet(c, cm, tt, { tod: 'night', hill: 300 }); layer(c, cm, .45, c => { const b = layerBase(cm, SHZ, .45); bloom(c, 300, b - 260, 1000, '190,210,255', .6); circle(c, 300, b - 260, 170); c.fillStyle = '#e8eefc'; c.fill(); }); return { base: '#0a0e18' }; }, cam, vignette: 0,
      behind: [c => { layer(c, cam, .6, c => { const b = layerBase(cam, SHZ, .6) - 240; for (let i = 0; i < 3; i++) wolf(c, -160 + i * 420, { t, y: b - 120 + Math.abs(i - 1) * 50, sc: 1.1, howl: bump(t, tw('heulen') - .3 + i * .3, tw('heulen') + 2.5 + i * .3), dark: .95, darkCol: '8,10,20', s: i % 2 ? 1 : -1 }); }); }],
      screen: [c => { lightMap(c, '170,185,230', []); finish(c, t, { vig: .6 }); }] }; }],
    [S(231), l => { const cam = { x: 0, y: -320, z: 1.05 }; return caveFrame(t, cam, { mouth: 2600, outside: 'night', fires: [{ x: 0, k: 1 }], ambient: '20,22,40',
      behind: [c => { hearth(c, 0, t, 1, 1); ['kind1', 'kind2', 'kind3'].forEach((w, i) => tribe(c, { who: w, x: lerp(-700, -330, seg(t, S(231), S(231) + 1.4)) - i * 150, pose: 'sit', k: .25, expr: EX(t, { seed: i, mouth: 'o', browUp: .8, look: -1 }) }, t));
        tribe(c, { who: 'jaeger', x: 400, pose: 'sit', k: .25, expr: EX(t, { look: 1, mouth: 'flat' }), item: { k: 'spear', rot: .1 } }, t); tribe(c, { who: 'mann3', x: 620, k: .25, expr: EX(t, { look: -1, mouth: 'flat' }), arms: { r: { a: .9 + bump(t % 3, 1, 2) * .6, b: .4 } }, item: t > S(233) ? { k: 'stick', rot: 1.2 } : null }, t); }] }); }],
    [S(234), l => { const cam = { x: lerp(-200, 120, ease(seg(l, 0, 8))), y: -170, z: 1.7 }; return caveFrame(t, cam, { mouth: 2600, outside: 'night', fires: [{ x: 700, k: .7 }], ambient: '18,20,36',
      behind: [c => { hearth(c, 700, t, .7, 1); sleepersRow(c, t, w => ['frau1', 'baby', 'mann1', 'kind1', 'teen2'].includes(w)); noahLying(c, t, 40, { e: EX(t, { eyes: t > S(237) + 1 ? 'closed' : 'open', mouth: 'smile', look: .3 }) }); }] }); }],
  ], t);
}, .45, 'S28 wolves');

// ======================= S29 NACHDENKEN (montage of the day) =======================
scene(S(238), t => { const lt = t - S(238);
  if (t < S(242)) { const cam = { x: 40, y: -150, z: 2.4 }; return caveFrame(t, cam, { mouth: 2600, outside: 'night', fires: [{ x: 600, k: .6 }], ambient: '18,20,36', behind: [c => { hearth(c, 600, t, .6, 1); noahLying(c, t, 0, { e: EX(t, { look: .2, browUp: .3, mouth: 'soft' }) }); }],
    after: [c => { const ic = [[tw('handy', 1, S(240)), 'phone'], [tw('heizung'), 'heat'], [tw('supermarkt'), 'cart'], [tw('arzt'), 'cross']]; ic.forEach(([t0, k], i) => { const a = seg(t, t0 - .1, t0 + .3); if (a <= 0) return; const x = W * .58 + i * 170, y = H * .2; c.save(); c.globalAlpha = a * (1 - seg(t, S(241), S(241) + .6)); c.translate(x, y); c.lineWidth = 8; c.strokeStyle = CARD.cream; c.fillStyle = 'rgba(42,33,27,.7)'; circle(c, 0, 0, 62); c.fill(); c.stroke();
      if (k === 'phone') { rrect(c, -18, -32, 36, 64, 8); c.stroke(); } if (k === 'heat') { for (let j = -1; j <= 1; j++) { c.beginPath(); c.moveTo(j * 16, 26); c.bezierCurveTo(j * 16 - 12, 8, j * 16 + 12, -8, j * 16, -28); c.stroke(); } } if (k === 'cart') { c.beginPath(); c.moveTo(-34, -20); c.lineTo(-22, -20); c.lineTo(-12, 14); c.lineTo(26, 14); c.lineTo(32, -10); c.lineTo(-16, -10); c.stroke(); circle(c, -8, 26, 5); c.stroke(); circle(c, 20, 26, 5); c.stroke(); } if (k === 'cross') { c.fillStyle = CARD.cream; c.fillRect(-8, -28, 16, 56); c.fillRect(-28, -8, 56, 16); }
      line(c, [-44, -44, 44, 44], 10, '#d23a2a'); c.restore(); }); }] }); }
  // montage of the day's warm moments
  const list = [[S(242), 275.2], [S(242) + 1.6, 498.5], [S(242) + 3.2, 575.5], [S(242) + 4.8, 604], [S(242) + 6.4, 345.5], [S(242) + 8, 466], [S(242) + 9.6, 141.5]];
  let tp = list[0][1], t0 = list[0][0]; for (const [a, p] of list) if (t >= a) { tp = p; t0 = a; }
  const fr = sceneAt(tp + (t - t0) * .5);
  fr.screen = (fr.screen || []).concat([c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(255,190,120,.35)'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; const f = bump(t - t0, 0, .25); if (f > 0) { c.fillStyle = `rgba(255,236,210,${.35 * f})`; c.fillRect(0, 0, W, H); } vignette2(c, .7, '20,10,4'); c.restore(); }]);
  return fr;
}, .5, 'S29 montage');

// ======================= S30 AUSGESTORBEN =======================
scene(S(245), t => { const lt = t - S(245), cam = { x: 300, y: -520, z: .55 };
  const names = [tw('wollnashorn', 1, S(246)), tw('höhlenlöwe', 1, S(246)), tw('riesenhirsch', 1, S(246)), tw('mammuts', 1, S(246))];
  const fade = i => 1 - seg(t, names[i], names[i] + 1.4);
  const fr = outFrame(t, cam, { tod: 'dusk', setOpts: { sunX: .5, sunY: .55 }, grass: true,
    behind: [c => { const L = [[i => wollnashorn(c, -1300, { t, a: fade(0), dark: .4, darkCol: '60,30,40' })], [i => loewe(c, -500, { t, a: fade(1), dark: .4, darkCol: '60,30,40' })], [i => riesenhirsch(c, 300, { t, a: fade(2), dark: .4, darkCol: '60,30,40' })], [i => mammut(c, 1400, { t, a: fade(3), dark: .4, darkCol: '60,30,40' })]];
      L.forEach(([f], i) => { if (fade(i) > 0) f(i); const d = seg(t, names[i], names[i] + 1.4); if (d > 0 && d < 1) { const x = [-1300, -500, 300, 1400][i]; for (let j = 0; j < 30; j++) { circle(c, x + (rnd(j + i * 40) - .5) * 700 + d * 300, -200 - rnd(j + 3) * 500 - d * 200, 6 + rnd(j) * 8); c.fillStyle = `rgba(240,200,170,${.6 * (1 - d)})`; c.fill(); } } }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardWrangel(c, t, S(250) - .1, S(252) + .5, S(254) - .2)); return fr; }, .5, 'S30 extinct');

// ======================= S31 SCHLAF =======================
scene(S(254), t => { const lt = t - S(254), lid = seg(t, S(254), S(255) + .5), fire = 1 - seg(t, S(255), S(256) + 1), dark = seg(t, S(256), S(256) + 1.3);
  const fr = noahLyingECU(t, lt, { z: 4.2 + lt * .1, e: { eyes: lid > .95 ? 'closed' : 'open', lid: lid * .9, mouth: 'smile' }, ember: .3 + .6 * fire,
    after: [c => { if (dark > 0) { c.fillStyle = `rgba(0,0,0,${dark})`; c.fillRect(0, 0, W, H); } }] });
  return fr;
}, .5, 'S31 sleep');

// ======================= S32 PIEP — AUFWACHEN =======================
scene(S(257), t => { const lt = t - S(257), up = ease(seg(t, S(260), S(260) + .4));
  return shots([
    [S(257), l => { const cam = { x: -200 + Math.sin(t * 40) * 3, y: -340, z: 1.5 }; return roomFrame(t, cam, { tod: 'morning', alarm: 1, behind: [c => noahInBed(c, t, -300, { up, e: EX(t, { eyes: up > .5 ? 'open' : 'closed', browUp: up, mouth: up > .5 ? 'o' : 'soft', lid: 0 }) })],
      after: [c => { for (const tp of [S(257), S(258), S(259)]) { const a = bump(t, tp - .02, tp + .45); if (a > 0) { const [x, y] = w2s(cam, -425, -470); c.save(); c.globalAlpha = a; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x, y, 60 + i * 30 + a * 20, -1.2, -.2); c.lineWidth = 8; c.strokeStyle = '#ff5a4a'; c.stroke(); } c.restore(); } } }] }); }],
    [S(261), l => { const k = Math.floor((t - S(261)) / ((S(264) - S(261)) / 3)); const cam = [{ x: -430, y: -400, z: 3 }, { x: 300, y: -500, z: .9 }, { x: 0, y: -300, z: 1.6 }][Math.min(2, k)]; return roomFrame(t, cam, { tod: 'morning', behind: [c => noahInBed(c, t, -300, { up: 1, e: EX(t, { browUp: .8, mouth: 'o', look: k === 0 ? -1 : k === 1 ? 1 : 0 }) })] }); }],
    [S(264), l => { const cam = { x: 640, y: -500, z: 1.8 }; return roomFrame(t, cam, { tod: 'morning', after: [c => { const x = W * 1.3 - l * 1600, y = H * .72; c.save(); c.translate(x, y); rrect(c, -200, -70, 400, 90, 30); c.fillStyle = '#c8323a'; c.fill(); rrect(c, -120, -120, 220, 60, 24); c.fill(); for (const wx of [-120, 120]) { circle(c, wx, 22, 34); c.fillStyle = '#1a1a1e'; c.fill(); } c.restore(); }] }); }],
    [S(265), l => { const cam = { x: -100, y: -330, z: 1.7 }, grab = ease(seg(t, S(265), S(265) + .8)); return roomFrame(t, cam, { tod: 'morning', noPhone: grab > .5, behind: [c => { noahInBed(c, t, -300, { up: 1, e: EX(t, { mouth: t > S(266) ? 'smile' : 'o', browUp: t > S(266) ? .2 : .7, eyes: t > S(266) && t < S(266) + .8 ? 'closed' : 'open', look: -1 }), arms: { r: { a: .6 + grab * .6, b: 1.2 * grab } } }); if (grab > .5) { const [px, py] = noahHandWorld(-40, -150 + (0 - (NOAH.HEM + 40) - 60) * K, 1, { a: 1.2, b: 1.2 }); drawItemPhone(c, px, py - 10); } }] }); }],
    [S(267), l => { // close on the hand: a small cut on the finger (the one from the Stone Age)
      const z = 1 + l * .03; return { set: 'blank', setOpts: { color: '#d9d2c6' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
        behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e8e2d6'); g.addColorStop(1, '#bfb6a6'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.translate(W / 2, H / 2 + 80); c.scale(z, z);
          line(c, [0, 900, 0, 200], 300, NOAH.out); line(c, [0, 900, 0, 200], 280, NOAH.skin); c.save(); c.translate(0, 180); c.rotate(Math.PI); c.scale(4.6, 4.6); noahHandLocal(c, 0); c.restore();
          const cutA = seg(t, S(269), S(269) + .6); c.save(); c.translate(0, 180); c.rotate(Math.PI); c.scale(4.6, 4.6); nLine(c, [-12, 70, 2, 76], 3 + 2 * cutA, `rgba(200,50,58,${.4 + .6 * cutA})`); c.restore();
          rrect(c, -160, 420, 320, 120, 30); c.fillStyle = NOAH.out; c.fill(); rrect(c, -150, 430, 300, 100, 26); c.fillStyle = NOAH.watch; c.fill(); c.restore(); }],
        screen: [c => { grade(c, { warm: '255,230,190', warmA: .2, cool: '40,40,70', coolA: .1 }); const a = seg(t, S(269), S(269) + .5); if (a > 0) { c.save(); c.globalAlpha = a; c.lineWidth = 8; c.strokeStyle = CARD.ochre; c.beginPath(); c.arc(W / 2 - 4 * 4.6 + 20, H / 2 + 80 + 180 - 73 * 4.6, 90 + 10 * Math.sin(t * 6), 0, Math.PI * 2); c.stroke(); c.restore(); } finish(c, t, { vig: .4, grain: .05 }); }] }; }],
  ], t);
}, 0, 'S32 wake up');

// ======================= S33 SCHLUSS =======================
scene(S(270), t => { const lt = t - S(270), cam = { x: 120, y: -360, z: 1.35 }, shrug = bump(t, S(270) + .4, S(270) + 2.2);
  const [hx, hy] = noahHeadAt(0, 0, false), e = EX(t, { mouth: 'smile', browUp: .3 + shrug * .6 });
  return roomFrame(t, cam, { tod: 'morning', horse: seg(t, VO_END - .8, VO_END + .2) * (1 - seg(t, VO_END + .5, VO_END + .9)),
    front: [c => { N(c, t, { x: 0, expr: e, tilt: shrug * .08, arms: shrug > .1 ? { l: { a: .9 * shrug + .2, b: 1.6 * shrug }, r: { a: .9 * shrug + .2, b: 1.6 * shrug } } : undefined }); polish(c, t, hx, hy, e, { lx: .8, ly: -.5 }); }],
    after: [c => cardFrage(c, t, S(271) - .1, S(274))] }); // card at the top so Noah stays visible
}, .45, 'S33 end');
