// PART 1: 0:00 – 3:53 (intro, Kellner, Oma, Bank, Laden, Startkosten, Amt)
// ---------------- INTRO (approved draft) ----------------
mood(0, 7.72, 'curious'); mood(7.72, 13.9, 'light'); mood(13.9, 16.8, 'dark'); mood(16.8, 20.45, 'tension'); mood(20.45, 21.7, 'swell');
cue(.05, 'creak', -10, { d: 1.3 }); cue(2.05, 'scribble', -17, { d: 1.2 }); cue(3.22, 'thunk', -12); cue(4.1, 'whoosh', -18, { d: .45 });
cue(9.27, 'clink', -11, null, { pan: .2 }); cue(9.85, 'whoosh', -20, { d: .35 }); cue(10.78, 'register', -9); cue(10.95, 'counter', -22, { d: .9 });
cue(12.15, 'whoosh', -13, { d: .7, lo: 180, hi: 2400, rev: true }); cue(13.95, 'tick', -21, { f: 2900 }, { every: 1, n: 3, pan: -.4 }); cue(14.45, 'tick', -23, { f: 2050 }, { every: 1, n: 3, pan: -.4 });
cue(16.6, 'whoosh', -10, { d: .42, lo: 400, hi: 5000 }); cue(17.2, 'pop', -18, null, { every: .42, n: 5 }); cue(19.25, 'counter', -22, { d: .85 }); cue(19.8, 'scribble', -18, { d: .5, speed: 3 }); cue(20.45, 'stamp', -6);
shot(0, 'A Schublade', (lt, T, t) => {
  const open = ease(seg(lt, .05, 1.35)), cam = { x: lerp(230, 205, lt / T), y: lerp(-420, -430, lt / T), z: lerp(2.05, 2.6, ease(lt / T)) };
  const dk = seg(lt, 2.05, 3.25), tilt = lt < 3.2 ? 0 : .27 * (1 - Math.exp(-(lt - 3.2) * 5) * Math.cos((lt - 3.2) * 11));
  return { set: drawerSet, setOpts: { open }, cam, vignette: .6, screen: [c => drawerLight(c, cam, t), c => { if (dk > 0) { inkVeil(c, 1080, 180, 720, 700, .55); handScale(c, 1440, 840, 1.25, dk, tilt, t); } }] };
});
shot(4.36, 'B Noah weiß es', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 30, camDx: 90, z: 3.55, drift: 32 }), glance = bump(lt, 1.45, 2.6);
  const noah = noahP(t, { x: g.x, expr: { mouth: glance > .3 ? 'soft' : 'smirk', look: -glance * .9, browUp: .25 + glance * .2 }, tilt: -.04 + glance * .05 });
  return { set: salon, setOpts: { tod: 'golden', hz: -95, midY: -40 }, cam: g.cam, behind: [c => noahW(c, noah, false)], screen: [c => salonLight(c, g.cam, t, { tod: 'golden', hz: -95 })], vignette: .35 };
});
shot(7.72, 'C Luxusrestaurant', (lt, T, t) => {
  const ins = lt > 2.33, k = ease(seg(lt, 0, 2.33)), ki = ease(seg(lt, 2.33, T));
  const cam = ins ? { x: lerp(40, 215, ki), y: lerp(-150, -156, ki), z: lerp(4.4, 4.0, ki) } : { x: lerp(-20, 50, k), y: lerp(-268, -235, k), z: lerp(1.08, 1.3, k) };
  const NX = -70, TX = 150, TW = 360, ty = -128 - 22 * .45, carry = ease(seg(lt, .25, 1.5)), withdraw = ease(seg(lt, 1.75, 2.5));
  const gx = lerp(NX + 48, TX - 58, carry), gy = lerp(-118, ty + 2, carry) - bump(lt, .25, 1.5) * 24, set = lt > 1.5;
  const hx = set ? lerp(TX - 66, NX + 40, withdraw) : gx - 8, hy = set ? lerp(ty - 30, -120, withdraw) : gy - 30, ik = noahIK(1, (hx - NX) / NK, hy / NK - 50);
  const noah = noahP(t, { x: NX, arms: { r: { a: ik.a, b: ik.b, hand: -.4 }, l: { a: .1, b: -.12 } }, expr: { mouth: 'soft', look: lt < 2.4 ? .9 : 0, lid: lt < 2.4 ? .2 : 0 }, tilt: lt < 2.4 ? .06 : 0 });
  const items = (c, top) => { tableDressing(c, TW, top, t, { menu: true, glint: .5 }); clayBreadBasket(c, -118, top + 2, .52, t); clayDessert(c, 92, top + 4, .5); };
  return { set: salon, setOpts: { tod: 'golden' }, cam, behind: [c => { chairBack(c, TX - 100); chairBack(c, TX + 100); }],
    front: [c => dineTable(c, TX, { w: TW, items }), c => { wineGlass(c, gx, gy, .82, { glint: .6 }); noahW(c, noah); },
      c => layer(c, cam, 1.35, c2 => { c2.save(); c2.translate(cam.x * 1.35 - 980, 470); dineTable(c2, 0, { w: 560, items: (c3, tp) => { wineGlass(c3, 150, tp, 1); waterGlass(c3, 190, tp, .9); candle(c3, 60, tp - 4, t, 1); } }); c2.restore(); })],
    screen: [c => salonLight(c, cam, t, { tod: 'golden', noMotes: ins }), c => hudCard(c, t, { t0: 10.78, t1: 13.75, corner: 'tl', w: 560, h: 300, title: 'KONTOSTAND', icon: 'calc', color: HUD.blue,
      draw: (c, kk, l, w, h) => { const down = seg(l, .15, 1.05), val = lerp(220000, 0, easeIn(down)); hudText(c, 'Girokonto · Restaurant', 0, 26, 22, HUD.muted); hudText(c, fmtNum(Math.round(val)) + ' €', 0, 108, 74, down >= 1 ? HUD.muted : HUD.ink);
        c.fillStyle = HUD.line; rrect(c, 0, 132, w, 16, 8); c.fill(); c.fillStyle = down >= 1 ? '#d0302a' : HUD.green; rrect(c, 0, 132, Math.max(8, w * (1 - easeIn(down))), 16, 8); c.fill();
        if (l > 1.42) { const a = clamp((l - 1.42) / .25), s = 1 + (1 - easeOut(a)) * .5; c.save(); c.globalAlpha = a; c.translate(w - 10, 196); c.scale(s, s); hudText(c, '−38.000 €', 0, 0, 58, '#d0302a', 'right'); c.restore(); handArrow(c, 30, 160, 70, 214, clamp((l - 1.42) / .5), { t, col: '#d0302a', w: 6, shadow: false, head: 18 }); } } })], vignette: .32 };
});
shot(13.9, 'D Ganz unten', (lt, T, t) => {
  const k = ease(seg(lt, 0, T + .6)), NX = -320, cam = { x: lerp(NX + 20, NX + 120, k), y: lerp(-170, -215, k), z: lerp(2.05, 1.45, k) }, dyS = -(250) - (NOAH.HEM + 40) - 60;
  const ikL = noahIK(-1, -185, -146 / NK - dyS, true), ikR = noahIK(1, 190, -144 / NK - dyS, true);
  const noah = noahP(t, { x: NX, sit: true, seatH: 250, breath: .6, arms: { l: { a: ikL.a, b: ikL.b }, r: { a: ikR.a, b: ikR.b } }, expr: { mouth: 'grim', lid: .5, worry: .45, look: -.3 }, tilt: -.07 });
  return { set: salon, setOpts: { tod: 'night' }, cam, behind: [c => chairBack(c, NX, { col: '#4a1a26' })],
    front: [c => noahW(c, noah, false), c => dineTable(c, NX, { w: 380, items: (c, top) => { tableLamp(c, 120, top - 2, t, true, .9); wineGlass(c, -120, top, .8); plateSet(c, 0, top + 6, .9); } }),
      c => { c.save(); c.beginPath(); c.rect(NX - 400, -800, 800, 672); c.clip(); drawNoahDressed(c, Object.assign({}, noah, { onlyArms: true })); c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true }), c => { const [lx, ly] = toScreen(cam, 1, NX + 108, -200); bloom(c, lx, ly, 520 * cam.z / 1.6, '255,170,80', .22); }], vignette: .55 };
});
shot(16.75, 'E Kosten + Titel', (lt, T, t) => {
  const whip = ease(seg(lt, 0, .42)), x = lerp(-170, 2350, whip), cam = { x, y: -330, z: lerp(1.42, 1.3, whip) + lt * .006 };
  const rows = [['Miete + Nebenkosten', 6200], ['Personal', 25000], ['Strom & Gas', 2500], ['Kredit', 1600], ['Sonstiges', 1700]];
  return { set: salon, setOpts: { tod: 'night', sconces: true, candles: true }, cam, speed: whip > 0 && whip < 1 ? 0 : null,
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true }), c => screenDim(c, .25 * seg(lt, .3, .8)),
      c => costPanel(c, t, { t0: 16.95, t1: 99, x: 110, y: 110, w: 930, rowH: 72, title: 'KOSTEN PRO MONAT', icon: 'table', color: HUD.accent, rows, times: [17.2, 17.62, 18.04, 18.46, 18.88], tSum: 19.25, tCircle: 19.8 }),
      c => { if (t > 20.42) { screenDim(c, .35 * clamp((t - 20.42) / .2)); titleStamp(c, t, 20.45, ['WAS WÄRE, WENN DU EIN', 'LUXUSRESTAURANT ERÖFFNEST?'], { x: W / 2, y: H / 2 + 10, size: 84 }); } }],
    shake: t > 20.57 && t < 21 ? 16 * Math.exp(-(t - 20.57) * 9) : 0, vignette: .45, fade: seg(t, 21.3, 21.6) * .6 };
});
// ---------------- 1. KELLNER (21.2 – 35.6) ----------------
mood(21.8, 35.6, 'warm');
cue(21.55, 'whoosh', -16, { d: .5 }); cue(21.7, 'crowd', -26, { d: 3 }); cue(22.5, 'room', -30, { d: 13 }); cue(26.3, 'clink', -16); cue(28.8, 'stamp', -22);
shot(21.6, '1a Kellner im vollen Laden', (lt, T, t) => {
  const cam3 = r3move(lt / T, { x0: -6, x1: -3.5, z0: -14, z1: -12.5, y0: 2.3, y1: 2.0, lx0: 1, lx1: 0 }), nx = lerp(-3.5, -1, lt / T);
  const noah = r3person(nx, -7.2, c2 => { const p = noahP(t, { x: 0, legs: walkLegs(t, 8).legs, bob: walkLegs(t, 8).bob, arms: { r: arm(1.25, -1.75, .2), l: arm(.18, -.15) }, expr: { mouth: 'smile', look: .4 } }); drawNoahDressed(c2, p); const [hx, hy] = noahHandWorld(p, 1); tray(c2, hx, hy - 10, 1.05, t); });
  return { set: room3d, setOpts: { cam3, tod: 'evening', tables: 'full', extra: [noah] }, cam: { x: 0, y: 0, z: 1 }, screen: [c => room3dLight(c, cam3, t, { tod: 'evening' }), c => hudBadge(c, t, { t0: 21.8, t1: 24.4, x: 360, y: 120, text: '12 Jahre Kellner', color: HUD.blue })], vignette: .35 };
});
shot(at(7), '1b Gastro von hinten', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 120, camDx: 70, z: 3.4, side: 'l', dir: -1, y: -265 });
  const noah = noahP(t, { x: g.x, outfit: 'waiter', expr: { mouth: 'smirk', look: .5 }, arms: RELAX });
  return { set: proKitchen, setOpts: { tod: 'service' }, cam: g.cam, behind: [c => { heatLamp(c, g.x + 40, -430, t, true); heatLamp(c, g.x + 260, -430, t, true); }, c => { personW(c, P(PEOPLE.cook, t, { x: g.x + 200, expr: { mouth: 'flat', look: -.5 }, arms: { l: arm(.5, -1.2), r: arm(.6, -1.3) } }), false); }], front: [c => noahW(c, noah, false)],
    screen: [c => kitchenLight(c, g.cam, t, { steamy: true }), c => hudBadge(c, t, { t0: 21.8, t1: 24.4, x: 360, y: 120, text: '12 Jahre Kellner', color: HUD.blue })], vignette: .35 };
});
shot(at(8), '1c Wein empfehlen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 40, y: -190, z: 2.1 }, { x: 70, y: -200, z: 2.3 }), NX = -150;
  const noah = noahP(t, { x: NX, arms: { r: reach(1, NX, NX + 70, -170, { hand: .3 }), l: arm(.35, -1.25) }, expr: { mouth: 'smile', look: .7, browUp: .3 } });
  return { set: salon, setOpts: { tod: 'evening' }, cam, behind: [c => { chairBack(c, 60); chairBack(c, 260); }],
    front: [c => { personW(c, P(PEOPLE.guest(4), t, { x: 60, sit: true, seatH: 250, expr: { mouth: 'smile', look: -.8 }, arms: { l: arm(.4, -1.1), r: arm(.4, -1.1) } }), false); personW(c, P(PEOPLE.guest(7), t, { x: 260, sit: true, seatH: 250, expr: { mouth: 'soft', look: -.8 }, arms: { l: arm(.4, -1.1), r: arm(.4, -1.1) } }), false); },
      c => dineTable(c, 160, { w: 380, items: (c, tp) => tableDressing(c, 380, tp, t, { menu: false }) }), c => { noahW(c, noah); const [hx, hy] = noahHandWorld(noah, 1); bottle(c, hx + 4, hy + 30, .9); }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => { if (lt > 2.2 && lt < 4.4) { const [x, y] = toScreen(cam, 1, 60, -330); handText(c, '?!', x, y, 70, '#d0302a', seg(lt, 2.2, 2.5)); } }], vignette: .35 };
});
shot(ST[8] + 3.9, '1d Chef macht alles falsch', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -230, z: 1.9 }, { x: 40, y: -235, z: 2.15 });
  const boss = P(PEOPLE.boss, t, { x: -110, expr: Object.assign({ angry: 1 }, talkMouth(t, 0, 999)), arms: { r: arm(1.0 + Math.sin(t * 6) * .3, -.9), l: arm(.5, -.4) } });
  const noah = noahP(t, { x: 140, expr: { mouth: 'flat', lid: .45, look: -.8, browUp: .1 }, arms: { l: arm(.35, -1.4), r: arm(.35, -1.4) } });
  return { set: proKitchen, setOpts: { tod: 'service' }, cam, front: [c => personW(c, boss), c => noahW(c, noah)],
    screen: [c => kitchenLight(c, cam, t), c => { const [x, y] = toScreen(cam, 1, -110, -420); handCross(c, x - 120, y, x + 120, y, 0); thoughtBubble(c, 1450, 260, 360, 220, seg(lt, .4, .8), (c2, tt) => { handStroke(c2, [-110, 40, -40, -40, 40, 30, 110, -50], 1, { t: tt, col: '#d0302a', w: 8, shadow: false }); handStroke(c2, [-30, 60, 30, 0], 1, { t: tt, col: '#d0302a', w: 8, shadow: false }); handStroke(c2, [30, 60, -30, 0], 1, { t: tt, col: '#d0302a', w: 8, shadow: false }); }, t); }], vignette: .38 };
});
shot(at(9), '1e Wenn das mein Laden wäre', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 0, camDx: 80, z: 3.5 }), look = seg(lt, .3, 1.2);
  const noah = noahP(t, { x: g.x, expr: { mouth: lt > 1.8 ? 'smile' : 'soft', look: -.6 * look, browUp: .4 * look }, tilt: -.05 * look });
  const [hx, hy] = toScreen(g.cam, 1, g.x - 60, -440);
  return { set: salon, setOpts: { tod: 'evening', hz: -95, midY: -40 }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => salonLight(c, g.cam, t, { tod: 'evening', hz: -95, noMotes: true }), c => { inkVeil(c, 150, 120, 700, 520, .3); thoughtBubble(c, 540, 330, 640, 400, seg(lt, 1.2, 1.7), (c2, tt) => { const k = seg(t, ST[10], ST[10] + 1.6);
      handStroke(c2, [-200, 120, -200, -60, 200, -60, 200, 120], k, { t: tt, col: HUD.ink, w: 6, shadow: false }); handStroke(c2, [-230, -60, 0, -150, 230, -60], k, { t: tt, col: HUD.ink, w: 6, shadow: false, seed: 4 });
      handStroke(c2, [-150, 120, -150, 20, -80, 20, -80, 120], k, { t: tt, col: '#d0302a', w: 5, shadow: false, seed: 6 }); handStroke(c2, [20, 0, 150, 0, 150, 70, 20, 70, 20, 0], k, { t: tt, col: HUD.blue, w: 5, shadow: false, seed: 7 });
      handText(c2, 'MEIN LADEN', 0, -96, 34, HUD.accent, seg(t, ST[10] + .8, ST[10] + 1.8), { outline: false }); for (let i = 0; i < 3; i++) if (k > .8) { star(c2, -60 + i * 60, -200, 16, 5, .45); c2.fillStyle = '#e8b84a'; c2.fill(); } }, t); }], vignette: .35 };
});
// ---------------- 2. OMA (35.6 – 50.7) ----------------
mood(35.6, 46.1, 'memory'); mood(46.1, 50.7, 'warm');
cue(ST[11], 'rain', -26, { d: 3.6 }); cue(ST[12] + 1.2, 'register', -14); cue(ST[14] - .3, 'page', -14); cue(ST[16] + .2, 'creak', -14, { d: 1.2 }); cue(ST[16] + 1.5, 'thunk', -18);
shot(at(11), '2a Oma stirbt', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -60, y: -330, z: 1.2 }, { x: -120, y: -300, z: 1.55 });
  return { set: rainWindow, cam, screen: [c => rainLight(c)], vignette: .5 };
});
shot(at(12), '2b Erbe', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 600, camDx: 60, z: 3.3, side: 'r', y: -255 });
  const noah = noahP(t, { x: g.x, outfit: 'classic', expr: { mouth: 'flat', lid: .35, worry: .4, look: -.3 }, arms: { r: arm(.55, -1.6), l: arm(.2, -.2) }, tilt: .04 });
  return { set: omaKitchen, setOpts: { table: false }, cam: g.cam, behind: [c => { noahW(c, noah, false); const [hx, hy] = noahHandWorld(noah, 1); envelope(c, hx - 6, hy - 4, .9); }],
    screen: [c => grade(c, { sx: .3, sy: .2, warm: '255,190,120', warmA: .2, cool: '50,60,80', coolA: .35 }), c => hudCard(c, t, { t0: ST[12] + .5, t1: ST[13] + 1.4, corner: 'tl', w: 460, h: 220, title: 'ERBE', icon: 'people', color: '#8a5a6a',
      draw: (c, k, l, w, h) => { hudText(c, 'von Oma', 0, 30, 24, HUD.muted); hudCounter(c, 0, 70000, seg(l, .2, 1.1), 0, 112, 70, { fmt: v => fmtNum(Math.round(v / 100) * 100) + ' €' }); } })], vignette: .4 };
});
shot(at(13), '2c Oma kocht (Erinnerung)', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -1250, y: -235, z: 1.7 }, { x: -1190, y: -240, z: 2.0 });
  const oma = P(PEOPLE.oma, t, { x: -1330, expr: { mouth: 'smile', look: .6, lid: .15 }, arms: { r: reach(1, -1330, -1170 + Math.sin(t * 3) * 14, -300 + Math.cos(t * 3) * 6), l: arm(.4, -.9) } });
  return { set: omaKitchen, setOpts: { tableX: -760, items: (c, tx, ty) => { c.save(); c.translate(tx, ty); c.scale(1, .5); recipeBook(c, 0, 0, 150, 130, { rot: .1 }); c.restore(); } }, cam,
    behind: [c => omaStove(c, -1240, t)], front: [c => personW(c, oma), c => { const [hx, hy] = drawPersonHand(oma, 1); line(c, [hx, hy - 10, hx + 6, -300], 7, '#a07040'); }], screen: [c => omaLight(c, cam, t), c => memoryLook(c, t)], vignette: .45 };
});
shot(ST[14] - .3, '2d Heft Nahaufnahme', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 1.08 });
  return { set: 'blank', setOpts: { color: '#3a2418' }, cam, screen: [c => { c.fillStyle = '#5a3a26'; c.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) line(c, [0, i * 40 + 10, W, i * 40 + 30], 4, 'rgba(30,15,5,.25)'); c.save(); c.translate(W / 2, H / 2 + 20); const s = 1 + lt * .02; c.scale(s, s); c.rotate(-.03); openBook(c, 0, 0, 1300, 820, t, { write: seg(lt, .2, 3.5) }); c.restore(); }, c => memoryLook(c, t), c => grade(c, { sx: .3, sy: .2, warm: '255,180,100', warmA: .35, cool: '60,30,20', coolA: .3 })], vignette: .5 };
});
shot(at(15), '2e Geld fühlt sich riesig an', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 700, camDx: 70, z: 3.4, side: 'l', dir: -1, y: -255 }), grin = seg(lt, .2, .6);
  const noah = noahP(t, { x: g.x, outfit: 'classic', expr: { mouth: grin > .5 ? 'grin' : 'smile', browUp: .5 * grin, look: .5 }, arms: { r: arm(.6, -1.9), l: arm(.2, -.2) } });
  return { set: livingRoom, setOpts: { hz: -70 }, cam: g.cam, behind: [c => noahW(c, noah, false)], screen: [c => grade(c, { sx: .7, sy: .2, warm: '255,200,130', warmA: .25, cool: '60,50,80', coolA: .2 }), c => phone(c, 1440, 560, 360, 700, .06, (c2, w, h) => appBanking(c2, w, h, { account: 'Girokonto · privat', balance: 70000, rows: [['Erbschaft', 70000, 'heute'], ['Miete Wohnung', -890], ['Supermarkt', -64.3]] }), { clock: '18:40' })], vignette: .35 };
});
shot(at(16), '2f Heft in die Schublade', (lt, T, t) => {
  const open = 1 - ease(seg(lt, .4, 1.6)), cam = { x: lerp(60, 30, lt / T), y: -420, z: lerp(2.2, 2.0, lt / T) };
  return { set: drawerSet, setOpts: { open }, cam, screen: [c => drawerLight(c, cam, t, { lamp: .8 }), c => grade(c, { sx: .5, sy: .2, warm: '255,190,120', warmA: .2 })], vignette: .55 };
});
// ---------------- 3. BANK (50.7 – 100.4) ----------------
mood(50.7, 60.2, 'curious'); mood(60.2, 82.0, 'light'); mood(82.0, 91.5, 'warm'); mood(91.5, 100.4, 'hope');
cue(ST[17], 'room', -32, { d: 5 }); cue(ST[21] + .4, 'pop', -16); cue(ST[22] + .2, 'counter', -22, { d: 1 }); cue(ST[24] + .3, 'scribble', -17, { d: 1.6 }); cue(ST[27] + .3, 'whoosh', -18, { d: .5 });
cue(ST[29] + 1.1, 'scribble', -18, { d: 1.1 }); cue(ST[30] + .2, 'page', -14); cue(ST[31], 'stamp', -10); cue(ST[33] + .2, 'register', -12); cue(ST[35] + .3, 'tick', -18, { f: 2600 }, { every: .25, n: 6 });
shot(at(17), '3a Unterwegs zur Bank', (lt, T, t) => {
  const nx = lerp(-34, -24, lt / T), cam3 = { x: nx - 6, y: 1.7, z: -9.5, f: 1250, look: [nx + 2, 1.5, -1.8] };
  const noah = { x: nx, z: -2.2, draw: (c, cam) => bb3(c, cam, nx, -2.2, c2 => { castShadow(c2, 0, 110, { alpha: .25 }); drawNoahSide(c2, { x: 0, k: .25, ink: 1.8, walk: t * 8, outfit: 'classic', expr: { mouth: 'soft', look: .3 } }); }) };
  return { set: street3d, setOpts: { cam3, tod: 'golden', hilde: { state: 'empty' }, walkers: S3WALK(t), extra: [noah] }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => street3dLight(c, cam3, t, { tod: 'golden', motes: true }), c => hudCard(c, t, { t0: ST[17] + .2, t1: ST[19] - .3, corner: 'tr', w: 560, h: 250, title: 'BUDGET', icon: 'calc', color: HUD.green,
      draw: (c, k, l, w, h) => { hudText(c, 'Erbe', 0, 30, 24, HUD.muted); hudText(c, '70.000 €', 0, 92, 60, HUD.ink); const need = seg(l, 1.6, 2.6); c.fillStyle = HUD.line; rrect(c, 0, 118, w, 22, 11); c.fill(); c.fillStyle = HUD.green; rrect(c, 0, 118, w * .32, 22, 11); c.fill(); if (need > 0) { c.save(); c.globalAlpha = need; hudText(c, 'Restaurant: ein Vielfaches davon', 0, 172, 22, '#d0302a'); c.restore(); handArrow(c, w * .34, 129, w - 8, 129, need, { t, col: '#d0302a', w: 5, shadow: false, head: 14 }); } } })], vignette: .3 };
});
function bankScene(t, cam, o = {}) {
  const adv = P(PEOPLE.advisor, t, Object.assign({ x: 120, sit: true, seatH: 250, expr: Object.assign({ mouth: 'soft', look: -.6 }, o.advExpr || {}), arms: o.advArms || { l: arm(.4, -1.1), r: arm(.4, -1.1) } }, o.adv || {}));
  const noah = noahP(t, Object.assign({ x: -260, sit: true, seatH: 250, outfit: 'classic', expr: Object.assign({ mouth: 'soft', look: .6 }, o.noahExpr || {}), arms: { l: arm(.4, -1.1), r: arm(.4, -1.1) } }, o.noah || {}));
  return { set: office, setOpts: { tod: 'day' }, cam,
    behind: [c => { officeChair(c, 120); c.save(); c.translate(-260, 0); c.scale(-1, 1); officeChair(c, 0); c.restore(); }],
    front: [c => personW(c, adv, false), c => bankDesk(c, 40, { w: 560, t, monitorX: 250 }), c => { if (o.folder) folder(c, -20 + (o.folderX || 0), -232, .9); }, c => noahW(c, noah, false), c => { c.beginPath(); c.rect(-120, -520, 300, 70); fs(c, '#1f3a6a', 3); c.font = hudFont(26); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('Firmenkunden', 30, -478); }],
    screen: [c => officeLight(c, cam, t, { tod: 'day' })].concat(o.screen || []), vignette: .32 };
}
shot(at(19), '3b In der Bank', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -60, y: -260, z: 1.45 }, { x: -20, y: -255, z: 1.7 }), adj = bump(lt, 1.8, 3.2);
  return bankScene(t, cam, { advArms: { l: arm(.4, -1.1), r: adj > 0 ? arm(lerp(.4, 1.25, adj), lerp(-1.1, -2.2, adj)) : arm(.4, -1.1) }, advExpr: { mouth: 'smile' } });
});
shot(at(21), '3c Förderkredit (Berater)', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 160, camDx: 60, z: 3.3, side: 'l', dir: -1, y: -205 });
  const adv = P(PEOPLE.advisor, t, { x: g.x, sit: true, seatH: 250, expr: Object.assign({ look: .2 }, talkMouth(t, 0, 999)), arms: { l: arm(.4, -1.1), r: arm(.9 + Math.sin(t * 2) * .1, -1.6) } });
  return { set: office, setOpts: { tod: 'day' }, cam: g.cam, behind: [c => officeChair(c, g.x)], front: [c => personW(c, adv, false), c => bankDesk(c, g.x - 80, { w: 560, t, monitorX: 170 })],
    screen: [c => officeLight(c, g.cam, t, { tod: 'day' }), c => hudCard(c, t, { t0: ST[21] + .3, t1: ST[23] - .2, corner: 'tr', w: 640, h: 330, title: 'ERP-GRÜNDERKREDIT', icon: 'calc', color: '#2a6a4a',
      draw: (c, k, l, w, h) => { hudText(c, 'StartGeld · KfW', 0, 32, 30, HUD.ink); hudText(c, 'Förderkredit vom Staat', 0, 72, 24, HUD.muted); const k2 = seg(t, ST[22], ST[22] + 1); if (k2 > 0) { hudText(c, 'bis', 0, 150, 30, HUD.muted); hudCounter(c, 0, 200000, k2, 58, 150, 62, { fmt: v => fmtNum(Math.round(v / 1000) * 1000) + ' €', color: '#2a6a4a' }); hudText(c, 'für Gründer', 0, 196, 26, HUD.muted); } } })], vignette: .3 };
});
shot(at(23), '3d Risiko 20/80', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -200, y: -250, z: 1.9 }, { x: -240, y: -250, z: 2.1 });
  const b = bankScene(t, cam, { noahExpr: { mouth: 'o', browUp: .6, look: .7 } });
  b.screen.push(c => { inkVeil(c, 980, 120, 860, 760, .45); const k = seg(t, ST[24], ST[24] + 2.2); handText(c, 'RISIKO', 1420, 170, 56, INK.chalk, seg(t, ST[23], ST[23] + .6)); if (k > 0) pieChart(c, 1420, 520, 230, [{ v: 20, label: 'Bank', sub: '20 %', col: '#2f6fb0' }, { v: 80, label: 'KfW', sub: '80 %', col: '#3d8a4f', pop: true }], k, { size: 34, lab: 50 });
    if (t > ST[25]) { const kk = seg(t, ST[25], ST[25] + .6); handText(c, 'Deshalb: JA', 1420, 860, 52, '#a8e0a0', kk); } });
  return b;
});
shot(at(26), '3e Gegenteil von sicher', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 120, y: -230, z: 2.2 }, { x: 90, y: -235, z: 2.35 });
  const b = bankScene(t, cam, { advArms: { l: arm(.9, -1.7), r: arm(.9, -1.7) }, advExpr: { mouth: 'flat', browUp: .6 } });
  b.screen.push(c => { inkVeil(c, 80, 140, 760, 560, .45); const k = seg(t, ST[27], ST[27] + .5), need = lt < .5 ? 0 : clamp((t - ST[27] - .4) / 1.6); handText(c, 'SICHERHEIT', 460, 190, 46, INK.chalk, k);
    handStroke(c, arcPts(460, 560, 260, 260, Math.PI, Math.PI * 2, 40), k, { t, col: INK.chalk, w: 7 }); for (let i = 0; i <= 4; i++) { const a = Math.PI + i / 4 * Math.PI; handStroke(c, [460 + Math.cos(a) * 230, 560 + Math.sin(a) * 230, 460 + Math.cos(a) * 262, 560 + Math.sin(a) * 262], k, { t, w: 5, col: ['#ff6a5a', '#ffaa5a', '#ffe05a', '#b0e07a', '#7ad07a'][i] }); }
    const a = Math.PI + (.85 - .78 * easeOut(need)) * Math.PI + Math.sin(t * 20) * .02 * need; handStroke(c, [460, 560, 460 + Math.cos(a) * 210, 560 + Math.sin(a) * 210], k, { t, col: '#ff5a4a', w: 9 }); handText(c, 'Gastronomie', 460, 640, 38, '#ff8a7a', seg(t, ST[27] + 1, ST[27] + 1.8)); });
  return b;
});
shot(at(28), '3f Businessplan', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -70, y: -240, z: 1.75 }, { x: -40, y: -240, z: 1.95 }), give = ease(seg(lt, .2, 1.0));
  const b = bankScene(t, cam, { folder: true, folderX: lerp(-160, 40, give), noah: { arms: { l: arm(.4, -1.1), r: reach(1, -260, lerp(-170, -60, give), -230, { sit: true }) } }, advExpr: { mouth: 'flat', browUp: seg(lt, 1.6, 2) * .8, look: -.4 } });
  b.screen.push(c => { const [x, y] = toScreen(cam, 1, 220, -430); thoughtBubble(c, x + 120, y - 40, 380, 260, seg(t, ST[29] + 1.1, ST[29] + 1.6), (c2, tt) => { circle(c2, 90, -40, 50); c2.fillStyle = '#f4f0d8'; c2.fill(); handStroke(c2, arcPts(90, -40, 50, 50, 0, 6.3, 20), 1, { t: tt, col: HUD.ink, w: 5, shadow: false }); handStroke(c2, [-130, 80, -40, -10], 1, { t: tt, col: HUD.ink, w: 5, shadow: false }); handStroke(c2, [-60, -20, -30, -40, -20, 10, -60, -20], 1, { t: tt, col: '#d0302a', w: 5, shadow: false }); handStroke(c2, [-140, 90, -170, 110], 1, { t: tt, col: '#ffaa3a', w: 6, shadow: false }); }, t); });
  return b;
});
shot(at(30), '3g Zusage', (lt, T, t) => {
  const g = gegen(lt, T, { x0: -1300, camDx: 70, z: 3.3, side: 'r', y: -255 }), joy = seg(t, ST[31], ST[31] + .4);
  const noah = noahP(t, { x: g.x, outfit: 'classic', expr: { mouth: joy > .5 ? 'grin' : 'o', browUp: .7, look: -.4 }, arms: { l: arm(.7, -1.9), r: arm(.7, -1.9) }, bob: -joy * 20 + Math.sin(t * 10) * joy * 6 });
  return { set: livingRoom, setOpts: { hz: -70 }, cam: g.cam, behind: [c => { noahW(c, noah, false); const [hx, hy] = noahHandWorld(noah, -1); c.save(); c.translate(hx + 30, hy - 20); c.beginPath(); c.rect(-34, -46, 68, 92); fs(c, '#fffdf6', 2); for (let i = 0; i < 5; i++) line(c, [-24, -30 + i * 12, 20, -30 + i * 12], 2, '#999'); c.restore(); }],
    screen: [c => grade(c, { sx: .6, sy: .2, warm: '255,200,130', warmA: .25 }), c => { const k = seg(lt, .1, 1.4); inkVeil(c, 60, 80, 600, 360, .25); handText(c, '6 Wochen', 330, 170, 52, INK.chalk, k); for (let i = 0; i < 6; i++) { const kk = seg(lt, .2 + i * .18, .4 + i * .18); handStroke(c, [120 + i * 70, 260, 170 + i * 70, 320], kk, { t, col: '#ff8a7a', w: 6 }); handStroke(c, [170 + i * 70, 260, 120 + i * 70, 320], kk, { t, col: '#ff8a7a', w: 6, seed: i }); } },
      c => { if (t > ST[31] - .05) titleStamp(c, t, ST[31], ['ZUSAGE', '150.000 €'], { x: 560, y: 760, size: 62, rot: -.08 }); }], vignette: .32, shake: t > ST[31] + .1 && t < ST[31] + .5 ? 10 * Math.exp(-(t - ST[31] - .1) * 9) : 0 };
});
shot(at(32), '3h Plus Omas Geld', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -280, z: 1.35 }, { x: 40, y: -275, z: 1.5 });
  const noah = noahP(t, { x: 320, outfit: 'classic', expr: { mouth: 'grin', browUp: .5, look: -.5 }, arms: { l: arm(.5, -.9), r: arm(.5, -.9) } });
  return { set: livingRoom, cam, front: [c => noahW(c, noah)], screen: [c => grade(c, { sx: .6, sy: .2, warm: '255,200,130', warmA: .25 }), c => hudCard(c, t, { t0: ST[32] - .05, t1: ST[34] + .4, corner: 'tl', w: 640, h: 360, title: 'BERECHNUNG', icon: 'calc', color: HUD.accent,
    draw: (c, k, l, w, h) => hudCalc(c, [[{ s: '   70.000 €' }, { s: '  Erbe', col: HUD.muted }], [{ s: '+ 150.000 €' }, { s: '  Kredit', col: HUD.muted }], '──────────', '= 220.000 €'], seg(l, .1, 2.8), 0, 46, 46, { result: true }) })], vignette: .3 };
});
shot(at(34), '3i Kein Jahr halten', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 500, camDx: 80, z: 3.4, side: 'l', dir: -1, y: -258 }), fall = seg(t, ST[35], ST[35] + .8);
  const noah = noahP(t, { x: g.x, outfit: 'classic', expr: { mouth: fall > .3 ? 'flat' : 'grin', browUp: .4 * (1 - fall), worry: fall * .4, look: .4 } });
  return { set: livingRoom, setOpts: { hz: -70 }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => grade(c, { sx: .6, sy: .2, warm: '255,200,130', warmA: .2 }), c => { const k = seg(t, ST[35], ST[35] + 1.4); inkVeil(c, 1050, 160, 760, 640, .4); handStroke(c, [1300, 260, 1600, 260, 1460, 450, 1600, 640, 1300, 640, 1440, 450, 1300, 260], k, { t, col: INK.chalk, w: 7 });
      const sand = clamp((t - ST[35] - .8) / 1.6); c.fillStyle = '#f2c94a'; c.beginPath(); c.moveTo(1340 + 80 * sand, 290 + 120 * sand); c.lineTo(1560 - 80 * sand, 290 + 120 * sand); c.lineTo(1450, 430); c.closePath(); if (k > .9) c.fill(); c.beginPath(); c.moveTo(1450, 640 - 140 * sand); c.lineTo(1580, 630); c.lineTo(1320, 630); c.closePath(); if (k > .9) c.fill(); handText(c, '< 1 Jahr', 1450, 730, 54, '#ff8a7a', seg(t, ST[35] + .6, ST[35] + 1.4)); }], vignette: .35 };
});
// ---------------- 4. DER LADEN (100.4 – 168.7) ----------------
mood(100.4, 112.9, 'light'); mood(112.9, 133.0, 'curious'); mood(133.0, 151.4, 'tension'); mood(151.4, 168.7, 'tension');
cue(ST[36] - .1, 'street', -24, { d: 2.2 }); cue(ST[37] + .1, 'creak', -16, { d: 1.4 }); [0, .9, 1.8, 3.0].forEach((d, i) => cue(ST[37] + d, 'pop', -18)); cue(ST[38] + .2, 'register', -14); cue(ST[39], 'stamp', -16); cue(ST[41] + .4, 'keys', -14); cue(ST[42], 'whoosh', -14, { d: .6, lo: 200, hi: 2400, rev: true });
cue(ST[45], 'pop', -18); cue(ST[46], 'register', -13); cue(ST[48] + .3, 'scribble', -18, { d: 1 }); cue(ST[49] + .8, 'clap1', -18); cue(ST[51], 'rattle', -16, { d: 7.5 }); cue(ST[52], 'hiss', -22, { d: 3 });
[0, .8, 1.7, 2.5, 3.3].forEach(d => cue(ST[54] + d, 'pop', -17)); cue(ST[55], 'register', -12);
shot(at(36), '4a0 Zu vermieten (außen)', (lt, T, t) => {
  const cam3 = s3move(lt / T, { a0: .8, a1: .25, d0: 20, d1: 14, f0: 1050, f1: 1250, y0: 2.4, y1: 1.7, ly0: 6.5, ly1: 3.6 }), hilde = { state: 'empty' }, nx = lerp(20, 12, lt / T);
  return { set: street3d, setOpts: { cam3, tod: 'day', hilde, walkers: S3WALK(t), extra: [{ z: -1.9, x: nx, draw: c => bb3(c, s3cam(cam3), nx, -1.9, c2 => drawNoahSide(c2, { x: 0, k: .25, ink: 1.8, s: -1, walk: t * 7, outfit: 'classic', expr: { mouth: 'smile', browUp: .4 } })) }] }, cam: { x: 0, y: 0, z: 1 }, screen: [c => street3dLight(c, cam3, t, { tod: 'day', hilde })], vignette: .25 };
});
shot(at(37), '4a Der perfekte Laden', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -300, y: -330, z: 1.0 }, { x: -60, y: -300, z: 1.25 }), nx = lerp(-900, -200, ease(seg(lt, 0, 4.5)));
  const walking = lt < 4.5, wl = walkLegs(t, 7);
  const noah = noahP(t, { x: nx, outfit: 'classic', legs: walking ? wl.legs : null, bob: walking ? wl.bob : undefined, expr: { mouth: lt > 2 ? 'o' : 'smile', browUp: .7, look: -.2 }, arms: { l: arm(.25, -.2), r: arm(.25, -.2) } });
  const badges = [['Altbau', ST[37] + .0, 330], ['hohe Decken', ST[37] + .9, 520], ['große Fenster', ST[37] + 1.8, 720], ['160 m²', ST[37] + 3.0, 920]];
  return { set: shopRoom, setOpts: { state: 'empty' }, cam, front: [c => noahW(c, noah)], screen: [c => shopLight(c, cam, t), ...badges.map(([s, t0, y]) => c => hudBadge(c, t, { t0, t1: ST[38] - .2, x: 1580, y: y - 140, text: s, color: s === '160 m²' ? HUD.accent : HUD.blue }))], vignette: .3 };
});
shot(at(38), '4b Miete', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 120, y: -240, z: 1.75 }, { x: 150, y: -245, z: 1.95 });
  const ll = P(PEOPLE.landlord, t, { x: 300, expr: Object.assign({ look: -.5 }, talkMouth(t, ST[38], ST[38] + 1.8) || { mouth: 'smile' }), arms: { l: arm(.3, -.3), r: arm(.8, -1.4) } });
  const noah = noahP(t, { x: -80, outfit: 'classic', expr: { mouth: 'soft', look: .6, browUp: .3 } });
  return { set: shopRoom, setOpts: { state: 'empty' }, cam, front: [c => personW(c, ll), c => noahW(c, noah)], screen: [c => shopLight(c, cam, t, { motes: false }), c => hudCard(c, t, { t0: ST[38] + .1, t1: ST[41] + .2, corner: 'tl', w: 520, h: 290, title: 'MIETE', icon: 'calc', color: HUD.blue,
    draw: (c, k, l, w, h) => { hudCounter(c, 0, 5000, seg(l, .1, 1), 0, 70, 64, { fmt: v => fmtNum(Math.round(v / 10) * 10) + ' €' }); hudText(c, 'pro Monat', 0, 110, 26, HUD.muted); if (t > ST[39]) { c.save(); c.translate(300, 70); c.rotate(-.12); const s = 1 + (1 - easeOut(seg(t, ST[39], ST[39] + .2))) * .8; c.scale(s, s); c.lineWidth = 5; c.strokeStyle = '#d0302a'; rrect(c, -10, -46, 150, 60, 8); c.stroke(); hudText(c, 'KALT', 65, -4, 40, '#d0302a', 'center'); c.restore(); } if (t > ST[40]) hudText(c, '+ Nebenkosten', 0, 176, 34, HUD.accent); } })], vignette: .3 };
});
shot(at(41), '4c Kaution', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 120, y: -200, z: 3.0 }, { x: 110, y: -205, z: 3.3 }), hand = ease(seg(lt, .5, 1.6));
  const ll = P(PEOPLE.landlord, t, { x: 300, expr: { mouth: 'smile', look: -.6 }, arms: { l: arm(.3, -.3), r: reach(1, 300, lerp(140, 110, hand), -150) } });
  const noah = noahP(t, { x: -70, outfit: 'classic', expr: { mouth: t > ST[42] ? 'flat' : 'soft', look: .7, worry: t > ST[42] ? .4 : 0 }, arms: { l: arm(.2, -.2), r: reach(1, -70, lerp(40, 90, hand), -150) } });
  return { set: shopRoom, setOpts: { state: 'empty' }, cam, front: [c => personW(c, ll), c => noahW(c, noah), c => { const [hx, hy] = drawPersonHand(ll, 1); keys(c, hx - 6, hy + 6, 1.1); }],
    screen: [c => shopLight(c, cam, t, { motes: false }), c => hudCard(c, t, { t0: ST[41] + .3, t1: ST[44] - .3, corner: 'tl', w: 600, h: 330, title: 'KAUTION', icon: 'calc', color: HUD.accent,
      draw: (c, k, l, w, h) => { hudCalc(c, ['3 × 5.000 €', '= 15.000 €'], seg(l, .2, 1.4), 0, 50, 54, { result: true }); if (t > ST[42]) { hudText(c, 'Konto:', 0, 210, 30, HUD.muted); hudCounter(c, 220000, 205000, seg(t, ST[42], ST[42] + .9), 110, 210, 34, { fmt: v => fmtNum(Math.round(v / 100) * 100) + ' €', color: '#d0302a' }); } } }),
      c => { if (t > ST[43]) { inkVeil(c, 1120, 620, 700, 380, .4); handText(c, '0 Teller', 1460, 760, 60, INK.chalk, seg(t, ST[43] + .3, ST[43] + 1)); handStroke(c, arcPts(1460, 880, 80, 22, 0, Math.PI * 2, 24), seg(t, ST[43] + .4, ST[43] + 1.2), { t, col: INK.chalk, w: 6 }); handCross(c, 1360, 880, 1560, 880, seg(t, ST[43] + 1.2, ST[43] + 1.6), { t }); } }], vignette: .3 };
});
shot(at(44), '4d Der Vormieter', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -60, y: -260, z: 1.5 }, { x: 0, y: -255, z: 1.7 }), vx = lerp(-900, -300, ease(seg(lt, 0, 1.4))), wl = walkLegs(t, 8);
  const vm = P(PEOPLE.vormieter, t, { x: vx, legs: lt < 1.4 ? wl.legs : null, expr: Object.assign({ look: .6 }, talkMouth(t, ST[45], ST[46] + .5) || { mouth: 'smile' }), arms: { l: arm(.3, -.2), r: arm(lt > 2 ? 1.0 : .3, lt > 2 ? -.6 : -.2) } });
  const shake = ST[49] + .6 < t, noah = noahP(t, { x: 250, outfit: 'classic', expr: { mouth: shake ? 'smile' : 'soft', look: -.6, browUp: .3 }, arms: { l: arm(.2, -.2), r: shake ? reach(1, 250, 140, -170) : arm(.2, -.2) } });
  return { set: shopRoom, setOpts: { state: 'junk' }, cam, front: [c => personW(c, vm), c => noahW(c, noah)],
    screen: [c => shopLight(c, cam, t, { motes: false }), c => hudCard(c, t, { t0: ST[46] - .05, t1: ST[50] - .2, corner: 'tr', w: 560, h: 300, title: 'ABLÖSE', icon: 'calc', color: '#8a5a3a',
      draw: (c, k, l, w, h) => { hudText(c, '45.000 €', 0, 70, 66, HUD.ink); if (t > ST[47]) { hudText(c, '= Geld für', 0, 140, 30, HUD.muted); hudText(c, 'sein altes Zeug', 0, 182, 34, HUD.accent); } } }),
      c => { if (t > ST[48]) { const [x, y] = toScreen(cam, 1, -470, -340); handArrow(c, x + 360, y - 260, x + 60, y - 40, seg(t, ST[48], ST[48] + .8), { t, col: '#ffb08a', w: 7, bend: .3 }); } }], vignette: .32 };
});
shot(at(50), '4e Alles Schrott', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -360, y: -240, z: 1.7 }, { x: 150, y: -250, z: 1.85 }, k => k);
  const noah = noahP(t, { x: lerp(-750, 120, clamp(lt / T)), outfit: 'classic', legs: walkLegs(t, 6).legs, expr: { mouth: 'o', worry: .7, browUp: .3, look: -.4, sweat: (t * .7) % 1 }, arms: { l: arm(.6, -1.7), r: arm(.6, -1.7) } });
  return { set: shopRoom, setOpts: { state: 'junk' }, cam, front: [c => noahW(c, noah)],
    screen: [c => shopLight(c, cam, t, { motes: false }), c => { const [x, y] = toScreen(cam, 1, -510, -440); hudBadge(c, t, { t0: ST[52] + .3, t1: ST[53] - .1, x, y: y - 40, text: 'Herd von 2009', color: '#8a5a3a' }); const [x2, y2] = toScreen(cam, 1, 570, -640); hudBadge(c, t, { t0: ST[52] + 1.8, t1: ST[53] - .1, x: x2, y: y2, text: 'klingt wie ein Traktor', color: '#d0302a' }); }], vignette: .35, shake: t > ST[52] + 1.8 && t < ST[53] ? 3 : 0 };
});
shot(at(53), '4f Profiküche', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -900, y: -380, z: 1.05 }, { x: 300, y: -370, z: 1.15 }, k => k);
  const items = [['Kombidämpfer', -730, -760], ['Induktionsherd', 30, -330], ['neue Kühlzelle', 2510, -900], ['Abzugshaube', -200, -1060], ['Spülmaschine', -3000, -560]];
  return { set: proKitchen, setOpts: { tod: 'service', stove: true }, cam, front: [c => noahW(c, noahP(t, { x: lerp(-400, 600, lt / T), outfit: 'chef', legs: walkLegs(t, 6).legs, expr: { mouth: 'o', browUp: .6, look: .3 } }))],
    screen: [c => kitchenLight(c, cam, t), ...items.map(([s, wx, wy], i) => c => { const pw = wy < -500 ? .7 : 1, base = pw < 1 ? layerBase(cam, -220, .7) + (wy + 220) : wy; const [x, y] = toScreen(cam, pw, wx, base); hudBadge(c, t, { t0: ST[54] + [0, .8, 1.7, 2.5, 3.3][i], t1: ST[56] - .1, x: clamp(x, 200, 1720), y: clamp(y, 120, 900), text: s, color: HUD.blue }); }),
      c => hudCard(c, t, { t0: ST[55] - .1, t1: ST[56] + 1.0, corner: 'tl', w: 480, h: 200, title: 'KÜCHE', icon: 'calc', color: HUD.accent, draw: (c, k, l) => hudCounter(c, 0, 70000, seg(l, 0, .8), 0, 80, 66, { fmt: v => fmtNum(Math.round(v / 100) * 100) + ' €' }) })], vignette: .3 };
});
// montage of the other start costs, a running receipt in the corner
const RECEIPT = [['Kaution', 15000], ['Ablöse', 45000], ['Küche', 70000], ['Umbau & Design', 50000, ST[57]], ['Geschirr & Kasse', 12000, ST[58]], ['Erstbestand', 15000, ST[59]], ['Berater & Gebühren', 5000, ST[60]], ['Werbung', 5000, ST[61]]];
function receiptCard(c, t) {
  hudCard(c, t, { t0: ST[56] + .2, t1: ST[62] - .15, corner: 'tr', w: 470, h: 500, title: 'AUSGABEN', icon: 'table', color: HUD.accent, draw: (c, k, l, w, h) => {
    let sum = 0; RECEIPT.forEach((r, i) => { const a = r[2] ? seg(t, r[2] + .9, r[2] + 1.3) : 1; if (a <= 0) return; sum += r[1] * a; c.save(); c.globalAlpha = a; hudText(c, r[0], 0, 24 + i * 40, 22, i >= 3 ? HUD.ink : HUD.muted); hudText(c, fmtNum(r[1]) + ' €', w, 24 + i * 40, 22, HUD.ink, 'right'); c.restore(); });
    c.fillStyle = HUD.ink; c.fillRect(0, 340, w, 3); hudText(c, 'Summe', 0, 384, 28, HUD.accent); hudText(c, fmtNum(Math.round(sum / 1000) * 1000) + ' €', w, 384, 30, HUD.accent, 'right'); } });
}
cue(ST[57] + .3, 'hammer', -18, null, { every: .35, n: 4 }); cue(ST[58] + .3, 'clink', -16, null, { every: .3, n: 3 }); cue(ST[59] + .4, 'thunk', -20); cue(ST[60] + .4, 'stamp', -16); cue(ST[61] + .3, 'flash', -16);
[57, 58, 59, 60, 61].forEach(i => cue(ST[i] + 1.0, 'pop', -20));
shot(at(56), '4g Umbau', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -500, y: -280, z: 1.35 }, { x: -380, y: -285, z: 1.5 }), paint = Math.sin(t * 5);
  const noah = noahP(t, { x: -560, outfit: 'classic', expr: { mouth: 'smile', look: -.4 }, arms: { l: arm(.2, -.2), r: arm(1.6 + paint * .25, -.6) } });
  return { set: shopRoom, setOpts: { state: 'build' }, cam, front: [c => noahW(c, noah), c => { const [hx, hy] = noahHandWorld(noah, 1); line(c, [hx, hy, hx + 30, hy - 90], 8, '#c8a070'); c.beginPath(); c.rect(hx + 16, hy - 120, 40, 34); fs(c, '#efe0b8', 2); }, c => personW(c, P(PEOPLE.cook, t, { x: -180, expr: { mouth: 'flat' }, arms: { l: arm(.5, -1.1), r: arm(1.0 + Math.abs(Math.sin(t * 9)) * .3, -1.4) } }))],
    screen: [c => shopLight(c, cam, t, { motes: false }), c => receiptCard(c, t), c => hudBadge(c, t, { t0: ST[57] + .9, t1: ST[58] - .1, x: 520, y: 140, text: 'Umbau, Licht, Design: 50.000 €', color: HUD.accent })], vignette: .3 };
});
shot(at(58), '4h Geschirr', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -2600, y: -700, z: 1.6 }, { x: -2350, y: -690, z: 1.7 }, k => k);
  return { set: proKitchen, setOpts: { tod: 'service', stove: false }, cam, screen: [c => kitchenLight(c, cam, t), c => receiptCard(c, t), c => hudBadge(c, t, { t0: ST[58] + .9, t1: ST[59] - .1, x: 520, y: 140, text: 'Geschirr, Gläser, Kasse: 12.000 €', color: HUD.accent })], vignette: .3 };
});
shot(at(59), '4i Erste Ware', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 3780, y: -300, z: 1.7 }, { x: 3900, y: -310, z: 1.8 }, k => k);
  return { set: salon, setOpts: { tod: 'evening' }, cam, front: [c => { for (let i = 0; i < 4; i++) { const x = 3300 + i * 170; c.beginPath(); c.rect(x - 70, -90, 140, 90); fs(c, '#c8a070', 3); for (let k = 0; k < 4; k++) clayBlob(c, x - 45 + k * 30, -100, 22, 18, ['#e05a3a', '#e8c040', '#5a9a3a', '#8a4a8a'][(i + k) % 4], { seed: i * 4 + k }); } for (let i = 0; i < 6; i++) bottle(c, 4100 + i * 40, -10, 1, ['#3a0e18', '#2a4a2a', '#c9a24a'][i % 3]); }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => receiptCard(c, t), c => hudBadge(c, t, { t0: ST[59] + .9, t1: ST[60] - .1, x: 520, y: 140, text: 'Lebensmittel & Wein: 15.000 €', color: HUD.accent })], vignette: .3 };
});
shot(at(60), '4j Berater', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -40, y: -250, z: 1.9 }, { x: -10, y: -255, z: 2.05 });
  const b = bankScene(t, cam, { folder: true, adv: { who: PEOPLE.clerk2 }, advExpr: Object.assign({}, talkMouth(t, 0, 999)), noahExpr: { mouth: 'flat', lid: .3 } });
  b.screen.push(c => receiptCard(c, t), c => hudBadge(c, t, { t0: ST[60] + .9, t1: ST[61] - .1, x: 520, y: 140, text: 'Steuerberater, Anwalt: 5.000 €', color: HUD.accent }));
  return b;
});
shot(at(61), '4k Fotos', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 60, y: -230, z: 1.9 }, { x: 90, y: -235, z: 2.05 }), flash = lt > 1 && lt < 1.12 ? 1 - (lt - 1) / .12 : 0;
  const ph = P(PEOPLE.guest(13), t, { x: -200, expr: { mouth: 'smile', lid: .6, look: .7 }, arms: { l: arm(1.2, -2.2), r: arm(1.2, -2.2) } }), noah = noahP(t, { x: 180, outfit: 'chef', expr: { mouth: 'grin', look: -.3 }, arms: { l: arm(.4, -.9), r: arm(.4, -.9) } });
  return { set: salon, setOpts: { tod: 'evening' }, cam, flash: flash * .7, front: [c => personW(c, ph), c => { const [hx, hy] = drawPersonHand(ph, 1); c.beginPath(); c.rect(hx - 50, hy - 40, 90, 60); fs(c, '#2a2a2e', 2); circle(c, hx - 4, hy - 10, 18); fs(c, '#5a6a8a', 2); }, c => noahW(c, noah), c => { clayRoulade(c, 330, -150, 1); }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => receiptCard(c, t), c => hudBadge(c, t, { t0: ST[61] + .9, t1: ST[62] - .2, x: 520, y: 140, text: 'Fotos, Website, Werbung: 5.000 €', color: HUD.accent })], vignette: .3 };
});
// ---------------- 5. STARTKOSTEN (168.7 – 179.5) ----------------
mood(168.7, 179.5, 'tension');
cue(ST[62] - .1, 'whoosh', -14, { d: .5 }); for (let i = 0; i < 8; i++) cue(ST[62] + .2 + i * .34, 'pop', -19); cue(ST[62] + 3.0, 'counter', -21, { d: .9 }); cue(ST[63] + .6, 'pop', -16); cue(ST[63] + 2.0, 'thunk', -12); cue(ST[64] + .4, 'scribble', -18, { d: .8 });
shot(at(62), '5 Startkosten', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 1500, y: -300, z: 1.2 }, { x: 1600, y: -300, z: 1.3 });
  const rows = [['Kaution', 15000], ['Ablöse', 45000], ['Küche', 70000], ['Umbau', 50000], ['Geschirr & Kasse', 12000], ['Erstbestand', 15000], ['Berater', 5000], ['Werbung', 5000]];
  const noah = noahP(t, { x: 2150, outfit: 'classic', expr: { mouth: t > ST[63] + 2 ? 'o' : 'flat', worry: t > ST[63] + 2 ? .6 : .2, look: -.7, sweat: t > ST[63] + 2 ? ((t - ST[63]) * .6) % 1 : 0 }, arms: { l: arm(.4, -1.3), r: arm(.4, -1.3) } });
  return { set: salon, setOpts: { tod: 'evening' }, cam, front: [c => noahW(c, noah)],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => screenDim(c, .2),
      c => costPanel(c, t, { t0: ST[62] - .05, t1: FILM_END, x: 90, y: 40, w: 900, rowH: 62, title: 'STARTKOSTEN', icon: 'table', color: HUD.accent, rows, times: rows.map((r, i) => ST[62] + .2 + i * .34), tSum: ST[62] + 3.0, tCircle: ST[62] + 3.6 }),
      c => hudCard(c, t, { t0: ST[63] + .5, t1: FILM_END, corner: 'tr', w: 520, h: 280, title: 'BUDGET', icon: 'calc', color: HUD.blue,
        draw: (c, k, l, w, h) => { hudText(c, 'Budget', 0, 40, 30, HUD.muted); hudText(c, '220.000 €', w, 40, 34, HUD.ink, 'right'); hudText(c, 'Startkosten', 0, 90, 30, HUD.muted); hudText(c, '− 217.000 €', w, 90, 34, HUD.ink, 'right'); c.fillStyle = HUD.ink; c.fillRect(0, 112, w, 3); if (l > 1.4) { const s = 1 + (1 - easeOut(seg(l, 1.4, 1.7))) * .6; c.save(); c.translate(w, 172); c.scale(s, s); hudText(c, 'Rest: 3.000 €', 0, 0, 46, '#d0302a', 'right'); c.restore(); } } })], vignette: .35 };
});
// ---------------- 6. WILLKOMMEN IN DEUTSCHLAND (179.5 – 233.7) ----------------
mood(179.5, 230.5, 'bureau'); mood(230.5, 233.7, 'dark');
cue(ST[65] + .2, 'ding', -16); cue(ST[66] + .2, 'stamp', -9); cue(ST[67] + .5, 'pop', -17); cue(ST[69] + .2, 'pop', -17); cue(ST[70] + .3, 'tick', -20, { f: 2400 }, { every: .25, n: 16 });
cue(ST[71] + .2, 'ding', -18); cue(ST[72] + .4, 'pop', -17); [0, .7, 1.4, 2.1, 2.9, 3.6].forEach(d => cue(ST[73] + d, 'stamp', -15)); [74, 75, 76, 77].forEach(i => cue(ST[i] + .3, 'pop', -17)); cue(ST[77] + .9, 'jingle', -18);
[0, .55, 1.1].forEach(d => cue(ST[80] + .2 + d, 'stamp', -12));
shot(at(65), '6a Amt', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -380, z: .95 }, { x: 80, y: -360, z: 1.1 }), num = t > ST[65] + .2 ? 248 : 247;
  const noah = noahP(t, { x: lerp(-700, -260, ease(seg(lt, 0, 2.5))), outfit: 'classic', legs: lt < 2.5 ? walkLegs(t, 7).legs : null, expr: { mouth: 'soft', look: .3, browUp: .3 }, arms: { l: arm(.2, -.2), r: arm(.6, -1.6) } });
  return { set: amtOffice, setOpts: { num }, cam, front: [c => { noahW(c, noah); const [hx, hy] = noahHandWorld(noah, 1); c.beginPath(); c.rect(hx - 10, hy - 30, 24, 34); fs(c, '#fff', 1.5); }], screen: [c => amtLight(c, cam, t)], vignette: .3 };
});
shot(at(66), '6b Stempel Willkommen', (lt, T, t) => {
  const hit = ST[66] + .2, down = lt < .35 ? -280 * (1 - ease(lt / .35)) : (t < hit + .3 ? 0 : -200 * ease(seg(t, hit + .3, hit + .8)));
  return { set: 'blank', setOpts: { color: '#8a7a60' }, cam: { x: 0, y: 0, z: 1 + lt * .03 }, shake: t > hit && t < hit + .3 ? 14 : 0,
    screen: [c => { c.fillStyle = '#7a6a50'; c.fillRect(0, 0, W, H); for (let i = 0; i < 24; i++) line(c, [0, i * 48, W, i * 48 + 30], 5, 'rgba(40,25,10,.18)'); c.save(); c.translate(W / 2, H / 2 + 40); c.rotate(-.03 + lt * .01); c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fillStyle = '#fbf8ee'; c.fillRect(-520, -420, 1040, 840); c.restore();
      hudText(c, 'ANTRAG', -460, -340, 44, HUD.ink); hudText(c, 'auf Erteilung einer Gaststättenerlaubnis', -460, -290, 28, HUD.muted); ['Name, Vorname', 'Anschrift des Betriebs', 'Art des Betriebs', 'Ausschank alkoholischer Getränke', 'Datum, Unterschrift'].forEach((s, i) => { hudText(c, s, -460, -200 + i * 90, 24, HUD.muted); c.strokeStyle = '#c8c0b0'; c.lineWidth = 2; c.strokeRect(-460, -186 + i * 90, 920, 44); if (i === 0) hudText(c, 'Noah', -440, -154, 26, '#1f3a6a'); if (i === 3) { c.strokeRect(-460, -186 + i * 90, 44, 44); handStroke(c, [-452, -160 + i * 90, -440, -146 + i * 90, -420, -180 + i * 90], 1, { t, col: '#1f3a6a', w: 5, shadow: false }); } });
      if (t > hit) { c.save(); c.translate(180, 230); c.rotate(-.12); c.globalAlpha = .9; c.lineWidth = 7; c.strokeStyle = '#c9252c'; rrect(c, -260, -70, 520, 140, 14); c.stroke(); hudText(c, 'WILLKOMMEN IN', 0, -12, 44, '#c9252c', 'center'); hudText(c, 'DEUTSCHLAND', 0, 46, 54, '#c9252c', 'center'); c.restore(); }
      c.save(); c.translate(180, 230 + down - 40); c.beginPath(); c.rect(-90, -260, 180, 200); fs(c, '#7a4a2a', 4); c.beginPath(); c.roundRect(-160, -70, 320, 70, 10); fs(c, '#2a2a2a', 4); c.restore(); c.restore(); }], vignette: .4 };
});
shot(at(67), '6c Gaststättenerlaubnis', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 200, y: -260, z: 1.6 }, { x: 260, y: -265, z: 1.8 });
  const noah = noahP(t, { x: 250, sit: true, seatH: 300, k: .21, outfit: 'classic', expr: { mouth: 'flat', lid: .4, look: .5 }, arms: { l: arm(.35, -.9), r: arm(.35, -.9) } });
  return { set: amtOffice, setOpts: { gapX: 250, num: 248 + Math.floor(lt / 3) }, cam, front: [c => { c.save(); c.translate(0, -70); c.beginPath(); c.rect(180, -110, 140, 20); fs(c, '#4a6a9a', 2); c.beginPath(); c.rect(180, -250, 140, 140); fs(c, '#4a6a9a', 2); noahW(c, noah, false); c.restore(); }],
    screen: [c => amtLight(c, cam, t), c => iconRow(c, t, [{ t0: ST[67] + .5, icon: 'license', title: 'Gaststättenerlaubnis', lines: ['100 – 1.500 €', 'beim Amt beantragen'], hi: 1, col: HUD.blue }, { t0: ST[69] + .2, icon: 'school', title: 'Unterrichtung IHK', lines: ['100 € · 4 Std.', 'Pflicht vor dem Antrag'], hi: 1, col: '#8a5a3a' }], 60, 60, { t1: ST[71] - .2, w: 430, h: 150, cols: 1 })], vignette: .3 };
});
shot(at(70), '6d Vier Stunden', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 250, camDx: 50, z: 3.6, side: 'r', y: -215 }), sleepy = seg(lt, 1, 4);
  const noah = noahP(t, { x: g.x, sit: true, seatH: 300, outfit: 'classic', expr: { mouth: sleepy > .6 ? 'o' : 'flat', lid: .3 + .5 * sleepy, look: -.2 }, tilt: Math.sin(t * 1.3) * .06 * sleepy, arms: { l: arm(.35, -.9), r: arm(.35, -.9) } });
  return { set: amtOffice, setOpts: { gapX: 250, queue: false }, cam: g.cam, behind: [c => { c.save(); c.translate(0, -70); c.beginPath(); c.rect(g.x - 70, -110, 140, 20); fs(c, '#4a6a9a', 2); c.beginPath(); c.rect(g.x - 70, -250, 140, 140); fs(c, '#4a6a9a', 2); c.restore(); noahW(c, noah, false); }],
    screen: [c => amtLight(c, g.cam, t), c => { inkVeil(c, 120, 140, 560, 640, .35); const hrs = 8 + seg(lt, .3, T - .3) * 4; clockBig(c, 400, 420, 170, hrs, (hrs % 1) * 60); hudBadge(c, t, { t0: ST[70] + .4, t1: ST[71] - .1, x: 400, y: 160, text: '4 Std. · 100 €', color: '#8a5a3a' }); }], vignette: .35 };
});
shot(at(71), '6e Antrag am Schalter', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -300, z: 1.55 }, { x: 40, y: -300, z: 1.75 }), stack = Math.floor(seg(t, ST[73], ST[74]) * 22) + 4;
  const noah = noahP(t, { x: -20, outfit: 'classic', expr: { mouth: t > ST[73] ? 'o' : 'soft', worry: t > ST[73] ? .5 : 0, look: .8 }, arms: { l: arm(.2, -.2), r: arm(.5, -1.3) } });
  return { set: amtOffice, setOpts: { queue: false }, cam, front: [c => noahW(c, noah), c => paperStack(c, 300, -300, stack, 1.2)],
    screen: [c => amtLight(c, cam, t), c => hudBadge(c, t, { t0: ST[72] + .3, t1: ST[73] - .1, x: 1400, y: 150, text: '100 – 1.500 € · ein paar Wochen', color: HUD.blue }),
      c => { for (let i = 0; i < 14; i++) { const t0 = ST[73] + i * .28; if (t < t0) continue; const q = (t - t0) / 2.2, x = W * (.1 + rnd(i) * .8) + Math.sin(t * 2 + i) * 60, y = -120 + q * (H + 240), r = t * (1 + rnd(i + 2)) + i; if (q > 1) continue; c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.rect(-70, -95, 140, 190); fs(c, '#fbf8ee', 3); hudText(c, ['Formular', 'Antrag', 'Nachweis', 'Formular'][i % 4], -56, -60, 18, HUD.ink); for (let k = 0; k < 6; k++) line(c, [-56, -36 + k * 20, 50 - (k % 3) * 20, -36 + k * 20], 3, 'rgba(0,0,0,.25)'); c.restore(); } },
      c => iconRow(c, t, [{ t0: ST[73] + .1, icon: 'person', title: 'Führungszeugnis', lines: [''], col: '#5a5a62' }, { t0: ST[73] + 1.2, icon: 'euro', title: 'Nachweis Finanzamt', lines: [''], col: '#5a5a62' }], 60, 60, { t1: ST[74] - .2, w: 400, h: 110, cols: 1 })], vignette: .3 };
});
shot(at(74), '6f Auflagen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -2700, y: -330, z: 1.35 }, { x: -2450, y: -340, z: 1.5 }, k => k);
  const noah = noahP(t, { x: -2280, outfit: 'classic', expr: { mouth: 'flat', look: -.4, browUp: .5 }, arms: { l: arm(.4, -1.3), r: arm(.4, -1.3) }, tilt: -.06 });
  return { set: salon, setOpts: { tod: 'evening' }, cam, front: [c => noahW(c, noah), c => { c.save(); c.translate(-2520, -560); c.beginPath(); c.rect(-90, -40, 180, 80); fs(c, '#2a9a4a', 3); bigIcon(c, 'fire', 0, 0, .9, '#fff'); bloom(c, 0, 0, 160, '80,255,120', .3); c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => iconRow(c, t, [{ t0: ST[74] + .3, icon: 'hygiene', title: 'Infektionsschutz', lines: ['Belehrung für alle', 'mit Lebensmitteln'], col: '#2a7a8a' }, { t0: ST[75] + .3, icon: 'fire', title: 'Brandschutz', lines: ['Fluchtwege', 'Notbeleuchtung'], col: '#2a9a4a' }, { t0: ST[76] + .3, icon: 'eye', title: 'Lebensmittelkontrolle', lines: ['jederzeit', 'unangemeldet'], hi: 1, col: '#c0392b' }], 60, 60, { t1: ST[77] + .2, w: 440, h: 150, cols: 1 })], vignette: .32 };
});
shot(ST[77] + .1, '6g GEMA', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 3700, y: -330, z: 1.6 }, { x: 3800, y: -335, z: 1.75 });
  const noah = noahP(t, { x: 3560, outfit: 'classic', expr: { mouth: 'smile', look: .6 }, arms: { l: arm(.2, -.2), r: arm(.2, -.2) } });
  return { set: salon, setOpts: { tod: 'evening' }, cam, front: [c => noahW(c, noah), c => { c.save(); c.translate(3900, -360); c.beginPath(); c.roundRect(-60, -90, 120, 180, 14); fs(c, '#2a2a2e', 3); circle(c, 0, -40, 30); fs(c, '#4a4a52', 2); circle(c, 0, 40, 40 + Math.sin(t * 16) * 2); fs(c, '#4a4a52', 2); c.restore(); for (let i = 0; i < 5; i++) { const q = ((t * .4 + i / 5) % 1); c.save(); c.translate(3900 + 70 + q * 200, -420 - q * 160 + Math.sin(q * 8 + i) * 20); c.globalAlpha = Math.sin(q * Math.PI); c.scale(.8, .8); bigIcon(c, 'music', 0, 0, 1, '#211c1a'); c.restore(); } }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => iconRow(c, t, [{ t0: ST[77] + .9, icon: 'music', title: 'GEMA', lines: ['auch Hintergrundmusik', 'mehrere Hundert € / Jahr'], col: '#5a3a8a' }], 60, 60, { t1: ST[79] - .2, w: 460, h: 150, cols: 1 })], vignette: .32 };
});
shot(at(79), '6h Stempel statt Kochen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -160, z: 3.2 }, { x: 10, y: -165, z: 3.5 });
  const noah = noahP(t, { x: 0, sit: true, seatH: 250, outfit: 'classic', expr: { mouth: 'grim', lid: .5, worry: .5 }, arms: { l: arm(.4, -1.1), r: arm(.6 + Math.max(0, Math.sin((t - ST[80]) * 11)) * .5, -1.6) } });
  return { set: amtOffice, setOpts: { queue: false, clerks: false }, cam, front: [c => noahW(c, noah, false), c => { dineTable(c, 0, { w: 420, cloth: '#c8b890', items: (c, tp) => { paperStack(c, -130, tp, 18); paperStack(c, 130, tp, 24); for (let i = 0; i < 3; i++) if (t > ST[80] + .2 + i * .55) { c.save(); c.translate(-60 + i * 60, tp - 6); c.rotate(-.2 + i * .15); c.lineWidth = 3; c.strokeStyle = '#c9252c'; c.strokeRect(-26, -10, 52, 20); c.font = hudFont(9); c.fillStyle = '#c9252c'; c.textAlign = 'center'; c.fillText(['GEPRÜFT', 'GENEHMIGT', 'EINGANG'][i], 0, 3); c.restore(); } } }); }],
    screen: [c => amtLight(c, cam, t), c => { if (t > ST[79] + .2) { inkVeil(c, 80, 120, 620, 300, .35); handText(c, 'Kochen', 380, 230, 64, INK.chalk, seg(t, ST[79] + .2, ST[79] + .7)); handCross(c, 220, 230, 540, 230, seg(t, ST[80], ST[80] + .4), { t }); } }], vignette: .4 };
});
