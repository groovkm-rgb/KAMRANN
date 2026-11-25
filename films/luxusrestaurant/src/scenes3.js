// PART 3: 8:17 – 13:06 (Freitag 23:12, Omas Heft, Lukas, Wende, Video, Inspektoren, Stern, Ende)
// ---------------- 13. DIESER EINE FREITAG (497.0 – 574.8) ----------------
mood(497.0, 510.9, 'dark2'); mood(510.9, 528.9, 'silence'); mood(528.9, 546.3, 'memory'); mood(546.3, 561.0, 'warm'); mood(561.0, 574.8, 'hope');
cue(ST[181] + .2, 'wind', -26, { d: 3.5 }); cue(ST[182] + .1, 'tick', -16, { f: 2200 }); cue(ST[185] + .2, 'crowd', -20, { d: 5 }); cue(ST[185] + .8, 'clink', -14, null, { every: .45, n: 5 }); cue(ST[185] + 3.2, 'shout', -18);
cue(ST[187] + .1, 'whoosh', -18, { d: .5, rev: true }); cue(ST[187] + .3, 'tick', -24, { f: 2900 }, { every: 1, n: 8, pan: -.5 }); cue(ST[191] + .2, 'chair', -18); cue(ST[192] + .1, 'door', -16);
cue(ST[193] + .2, 'buzz', -16); cue(ST[195] + .1, 'thunk', -10); cue(ST[201] + .1, 'creak', -10, { d: 1.3 }); cue(ST[203], 'thunk', -18); cue(ST[204] + .1, 'page', -12); cue(ST[208] + .3, 'sizzle', -20, { d: 3.4 }); cue(ST[211] + .2, 'mop', -24, { d: 2.5 }); cue(ST[212] + .4, 'clink', -16); cue(ST[213] + .1, 'chew', -22, { d: 2.5 }); cue(ST[218] + .1, 'ding', -14);
shot(at(181), '13a Freitag 23:12', (lt, T, t) => {
  const cam3 = s3move(lt / T, { a0: .85, a1: .1, d0: 24, d1: 17, f0: 1000, f1: 1200, y0: 2.6, y1: 1.7, ly0: 7, ly1: 4.4 }), hilde = { guests: 1, lit: .45 };
  return { set: street3d, setOpts: { cam3, tod: 'night', hilde, cars: [[-52, '#e8dcc0'], [41, '#c8ccd2']], traffic: false, walkers: [{ who: PEOPLE.guest(14), x: 30 - lt * 1.1, z: -2.2, p: walkLegs(t, 6) }] }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => street3dLight(c, cam3, t, { tod: 'night', hilde }), c => { if (t > ST[182] - .2) { inkVeil(c, 1220, 120, 560, 380, .4); const k = seg(t, ST[182] - .2, ST[182] + .3); c.save(); c.globalAlpha = k; c.fillStyle = '#111'; rrect(c, 1290, 200, 420, 180, 24); c.fill(); c.font = hudFont(130); c.fillStyle = '#ff4a3a'; c.textAlign = 'center'; c.fillText('23:12', 1500, 338); bloom(c, 1500, 290, 280, '255,60,40', .3); hudText(c, 'Freitag', 1500, 440, 40, '#fff', 'center'); c.restore(); } }], vignette: .45 };
});
shot(at(184), '13b So müsste es sein', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -300, z: 1.3 }, { x: 80, y: -300, z: 1.45 });
  const chef = P(PEOPLE.chef, t, { x: -60, expr: Object.assign({ browUp: .4 }, talkMouth(t, ST[185] + 3, ST[185] + 4.8) || { mouth: 'smile' }), arms: { l: arm(.3, -.3), r: t > ST[185] + 3 ? arm(1.9, -.4) : arm(.5, -1.2) } });
  const plates = c => { for (let i = 0; i < 4; i++) clayRoulade(c, -340 + i * 140 + 400, -226, .55); };
  return { set: proKitchen, setOpts: { tod: 'service', extra: plates }, cam, behind: [c => { for (let i = 0; i < 3; i++) heatLamp(c, 0 + i * 160 + 100, -470, t, true); }], front: [c => personW(c, chef), c => { const w = P(PEOPLE.waiterA, t, { x: 520 + Math.sin(t * 2) * 60, legs: walkLegs(t, 9).legs, expr: { mouth: 'smile' }, arms: { r: arm(1.25, -1.75), l: arm(.2, -.2) } }); personW(c, w); const [hx, hy] = drawPersonHand(w, 1); tray(c, hx, hy - 10, 1, t); }],
    screen: [c => kitchenLight(c, cam, t, { steamy: true }), c => { c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.45)'; c.fillRect(0, 0, W, H); c.restore(); c.lineWidth = 14; c.strokeStyle = 'rgba(255,255,255,.75)'; c.setLineDash([30, 20]); c.strokeRect(30, 30, W - 60, H - 60); c.setLineDash([]); }], vignette: .4 };
});
shot(at(186), '13c Totenstille', (lt, T, t) => {
  const cam3 = r3move(lt / T, { x0: -6, x1: -4, z0: -15.5, z1: -14, y0: 2.8, y1: 2.4, lx0: 2, lx1: 3, ly0: 1.2, ly1: 1.1 }), leave = seg(t, ST[191] + .2, ST[193] - .1);
  const gx = 8.4, gz = -8.8, guest = leave > 0 ? [r3person(lerp(gx, 11, leave), gz + .6, c2 => personW(c2, P(PEOPLE.guest(14), t, { x: 0, legs: walkLegs(t, 7).legs, expr: { mouth: 'flat', look: .5 } })))] : [];
  const noah = r3person(-3, -8, c2 => noahW(c2, noahP(t, { x: 0, expr: { mouth: 'flat', worry: .5, look: .8, lid: .2 }, arms: { l: arm(.35, -1.3), r: arm(.35, -1.3) } })));
  return { set: room3d, setOpts: { cam3, tod: 'night', candles: true, tables: i => (i === 11 && leave <= 0) ? 1 : 0, extra: [noah, ...guest] }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => room3dLight(c, cam3, t, { tod: 'night' }), c => { if (t > ST[188]) { inkVeil(c, 1150, 640, 720, 380, .5); chairGrid(c, 1230, 690, 10, 4, 1, 1, { s: 52, col: '#d0302a' }); hudText(c, '1 / 40', 1510, 960, 46, '#fff', 'center'); } }, c => hudBadge(c, t, { t0: ST[190] + .4, t1: ST[191] + 1, x: 1240, y: 140, text: 'nur Leitungswasser', color: '#2f6fb0' }), c => hudBadge(c, t, { t0: ST[192] + .1, t1: ST[193] - .1, x: 1240, y: 220, text: 'Trinkgeld: 0 €', color: '#d0302a' })], vignette: .55 };
});
shot(at(193), '13d Banking-App', (lt, T, t) => {
  const g = gegen(lt, T, { x0: -320, camDx: 50, z: 3.3, side: 'l', dir: -1, y: -255 }), hit = t > ST[195];
  const noah = noahP(t, { x: g.x, expr: { mouth: hit ? 'o' : 'flat', worry: .8, look: .6, browUp: hit ? .5 : 0, sweat: hit ? ((t - ST[195]) * .7) % 1 : 0 }, arms: { l: arm(.4, -1.3), r: arm(.6, -1.9) } });
  return { set: salon, setOpts: { tod: 'night', hz: -95, midY: -40 }, cam: g.cam, behind: [c => noahW(c, noah, false)], shake: hit && t < ST[195] + .5 ? 8 : 0,
    screen: [c => salonLight(c, g.cam, t, { tod: 'night', hz: -95, noMotes: true }), c => phone(c, 1350, 560, 400, 780, -.04, (c2, w, h) => appBanking(c2, w, h, { balance: t > ST[195] ? -38000 : -26800, limit: 'Dispo-Rahmen: 30.000 €', rows: [['Lieferant Fleisch', -1240.5], ['Stromversorger', -2480], ['Miete', -6200], ['Kasse Freitag', 38.5], ['Lohn Service', -7850]] }), { clock: '23:14' })], vignette: .55 };
});
shot(at(196), '13e Ganz unten', (lt, T, t) => {
  const NX = -320, cam = camPush(lt, T, { x: NX, y: -230, z: 2.4 }, { x: NX + 60, y: -320, z: 1.2 }), dyS = -(250) - (NOAH.HEM + 40) - 60;
  const ikL = noahIK(-1, -185, -146 / NK - dyS, true), ikR = noahIK(1, 190, -144 / NK - dyS, true);
  const noah = noahP(t, { x: NX, sit: true, seatH: 250, breath: .5, arms: { l: { a: ikL.a, b: ikL.b }, r: { a: ikR.a, b: ikR.b } }, expr: { eyes: 'closed', mouth: 'grim', worry: .6 }, tilt: -.12 });
  return { set: salon, setOpts: { tod: 'night' }, cam, behind: [c => chairBack(c, NX, { col: '#4a1a26' })], front: [c => noahW(c, noah, false), c => dineTable(c, NX, { w: 380, items: (c, tp) => { tableLamp(c, 120, tp - 2, t, true, .9); waterGlass(c, -120, tp, .8); } }), c => { c.save(); c.beginPath(); c.rect(NX - 400, -800, 800, 672); c.clip(); drawNoahDressed(c, Object.assign({}, noah, { onlyArms: true })); c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true })], vignette: .65 };
});
shot(at(198), '13f Allein in der Küche', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 160, y: -230, z: 2.0 }, { x: 120, y: -240, z: 2.3 });
  const noah = noahP(t, { x: 150, sit: true, seatH: 330, outfit: 'chef', breath: .6, expr: { mouth: 'grim', lid: .5, worry: .5, look: t > ST[201] - 1 ? -.8 : .2 }, arms: { l: arm(.35, -1.0), r: t > ST[201] - .6 ? reach(1, 150, 320, -150, { sit: true, seatH: 330 }) : arm(.35, -1.0) }, tilt: -.05 });
  return { set: proKitchen, setOpts: { tod: 'night', stove: false }, cam, behind: [c => { c.beginPath(); c.rect(90, -90, 120, 14); fs(c, '#6a7078', 2); line(c, [100, -80, 90, 0], 6, '#5a5e66'); line(c, [200, -80, 210, 0], 6, '#5a5e66'); }], front: [c => noahW(c, noah, false)],
    screen: [c => kitchenLight(c, cam, t, { tod: 'night' }), c => { const [x, y] = toScreen(cam, 1, 30, -600); bloom(c, x, y, 500, '255,190,110', .25); }, c => hudBadge(c, t, { t0: ST[199] + .3, t1: ST[200] + .3, x: 420, y: 140, text: 'seit heute früh: nichts gegessen', color: '#8a5a3a', size: 28 })], vignette: .6 };
});
shot(ST[201] + .2, '13g Die Schublade', (lt, T, t) => {
  const open = ease(seg(lt, .0, 1.3)), cam = { x: lerp(230, 205, lt / T), y: lerp(-420, -430, lt / T), z: lerp(2.05, 2.6, ease(lt / T)) };
  return { set: drawerSet, setOpts: { open }, cam, screen: [c => drawerLight(c, cam, t)], vignette: .6 };
});
shot(at(204), '13h Seite vierzehn', (lt, T, t) => {
  const cam = { x: 0, y: 0, z: 1 }, flash = t > ST[207] && t < ST[208] - .2;
  return { set: 'blank', setOpts: { color: '#2a2a30' }, cam, screen: [c => { c.fillStyle = '#6a727a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) line(c, [0, i * 30, W, i * 30], 1, 'rgba(255,255,255,.06)'); c.save(); c.translate(W / 2, H / 2 + 10); const s = 1.02 + lt * .012; c.scale(s, s); openBook(c, 0, 0, 1400, 860, t, { page: 'p14', write: 1 });
      if (t > ST[205]) handCircle(c, -440, -330, 240, 52, seg(t, ST[205], ST[205] + .5), { t, col: '#d0302a', w: 6, shadow: false }); if (t > ST[206]) handCircle(c, -470, 80, 230, 96, seg(t, ST[206], ST[206] + .5), { t, col: '#d0302a', w: 6, shadow: false }); if (t > ST[207]) handCircle(c, 205, 44, 170, 52, seg(t, ST[207] + 1.2, ST[207] + 1.7), { t, col: '#d0302a', w: 6, shadow: false }); c.restore(); },
      c => { const [lx, ly] = [W / 2, -100]; c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(W / 2, 200, 50, W / 2, 300, 900); g.addColorStop(0, 'rgba(255,200,130,.35)'); g.addColorStop(1, 'rgba(255,200,130,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); },
      c => { if (flash) { const k = seg(t, ST[207] + .2, ST[207] + .6) * (1 - seg(t, ST[208] - .6, ST[208] - .2)); c.save(); c.globalAlpha = k; c.fillStyle = '#000'; rrect(c, 1060, 660, 560, 380, 20); c.fill(); c.beginPath(); rrect(c, 1070, 670, 540, 360, 16); c.clip(); c.translate(1340, 1020); c.scale(.62, .62); c.translate(-(-1240 + 60), 0);
        omaStove(c, -1240, t); drawPerson(c, P(PEOPLE.oma, t, { x: -1330, k: .25, expr: { mouth: 'smile', look: .6 }, arms: { r: reach(1, -1330, -1170 + Math.sin(t * 3) * 14, -300), l: arm(.4, -.9) } })); c.restore(); c.save(); c.globalAlpha = k; memoryLook(c, t); clockBig(c, 1530, 740, 50, 3, ((t * 40) % 60), { label: false }); hudText(c, '3 Stunden', 1530, 830, 28, '#ffd36a', 'center'); c.restore(); } }], vignette: .5 };
});
shot(at(208), '13i Kochen um Mitternacht', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 60, camDx: 60, z: 3.0, side: 'r', y: -250 });
  const noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: 'soft', lid: .2, look: -.7 }, arms: { l: arm(.55 + Math.sin(t * 4) * .08, -1.5), r: arm(.3, -.4) } });
  return { set: proKitchen, setOpts: { tod: 'night', stove: true, cooking: true, extra: c => { clayRoulade(c, g.x - 230, -224, .7, { steam: true, t }); } }, cam: g.cam, front: [c => noahW(c, noah, false)],
    screen: [c => kitchenLight(c, g.cam, t, { tod: 'night', cooking: true }), c => { inkVeil(c, 120, 100, 480, 500, .3); clockBig(c, 360, 320, 140, 0, (lt * 2) % 60); }], vignette: .5 };
});
shot(at(211), '13j Lukas', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -260, z: 1.5 }, { x: 80, y: -250, z: 1.75 }), eat = t > ST[213];
  const lk = P(PEOPLE.lukas, t, eat ? { x: 260, sit: true, seatH: 330, expr: { mouth: t > ST[215] ? 'o' : (Math.sin(t * 9) > 0 ? 'flat' : 'soft'), look: t > ST[215] ? -.7 : 0, browUp: t > ST[215] ? .6 : 0, lid: t > ST[214] && t < ST[215] ? .5 : 0 }, arms: { l: arm(.4, -1.1), r: reach(1, 260, 330, -170 - Math.max(0, Math.sin(t * 4)) * 30, { sit: true, seatH: 330 }) } } : { x: lerp(500, 300, lt / 2.7), expr: { mouth: 'soft', look: -.4 }, arms: { l: arm(.5, -.8), r: arm(.6, -1.0) } });
  const give = ease(seg(t, ST[212] + .1, ST[212] + .9)), noah = noahP(t, { x: -60, outfit: 'chef', expr: { mouth: 'soft', look: .7 }, arms: { l: arm(.3, -.3), r: t < ST[213] ? reach(1, -60, lerp(20, 180, give), -170) : arm(.3, -.3) } });
  return { set: proKitchen, setOpts: { tod: 'night', stove: false }, cam, behind: [c => { if (eat) { c.beginPath(); c.rect(200, -90, 120, 14); fs(c, '#6a7078', 2); } }],
    front: [c => personW(c, lk, eat ? false : {}), c => { if (!eat) { const [hx, hy] = drawPersonHand(lk, 1); mop(c, hx - 40, 0, 1, t); } else { c.beginPath(); c.rect(220, -160, 260, 160); fs(c, '#a4acb4', 3); clayRoulade(c, 350, -164, .6); } }, c => noahW(c, noah), c => { if (!eat && t > ST[212]) { const [hx, hy] = noahHandWorld(noah, 1); clayRoulade(c, hx + 10, hy + 10, .55); } }],
    screen: [c => kitchenLight(c, cam, t, { tod: 'night' })], vignette: .5 };
});
shot(at(216), '13k Alter!', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 260, camDx: 60, z: 2.9, side: 'r', y: -225 });
  const lk = P(PEOPLE.lukas, t, { x: g.x, sit: true, seatH: 330, expr: Object.assign({ browUp: .8, look: -.5 }, talkMouth(t, ST[216], SE[217]) || { mouth: 'grin' }), arms: { l: arm(.4, -1.1), r: arm(1.1 + Math.sin(t * 5) * .1, -1.6) } });
  return { set: proKitchen, setOpts: { tod: 'night', stove: false }, cam: g.cam, front: [c => personW(c, lk, false), c => { const [hx, hy] = drawPersonHand(lk, 1); line(c, [hx, hy, hx + 10, hy - 50], 4, '#c8ccd2'); }], screen: [c => kitchenLight(c, g.cam, t, { tod: 'night' })], vignette: .45 };
});
shot(at(218), '13l Klick', (lt, T, t) => {
  const g = gegen(lt, T, { x0: -60, camDx: 70, z: 3.4, side: 'l', dir: -1, y: -258 }), click = seg(t, ST[218] + .2, ST[218] + .5);
  const noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: click > .5 ? 'o' : 'soft', browUp: .9 * click, look: .2 } });
  return { set: proKitchen, setOpts: { tod: 'night', stove: false }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => kitchenLight(c, g.cam, t, { tod: 'night' }), c => { if (click > 0) { const [x, y] = toScreen(g.cam, 1, g.x + 95, -385); c.save(); c.translate(x + 40, y - 20 * easeOut(click)); c.scale(easeBack(click), easeBack(click)); handStroke(c, arcPts(0, -40, 60, 64, Math.PI * .75, Math.PI * 2.25, 30), 1, { t, col: '#ffe14a', w: 9 }); handStroke(c, [-26, 30, -20, 60, 20, 60, 26, 30], 1, { t, col: '#ffe14a', w: 8 }); for (let i = 0; i < 7; i++) { const a = -Math.PI + i / 6 * Math.PI; handStroke(c, [Math.cos(a) * 90, -40 + Math.sin(a) * 90, Math.cos(a) * 120, -40 + Math.sin(a) * 120], 1, { t, col: '#ffe14a', w: 6 }); } bloom(c, 0, -40, 200, '255,230,120', .6); c.restore(); } }], vignette: .45 };
});
shot(at(219), '13m Wie alle anderen', (lt, T, t) => {
  const cam = { x: 0, y: 0, z: 1 };
  return { set: 'blank', setOpts: { color: '#1f1a24' }, cam, screen: [c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a2030'); g.addColorStop(1, '#141018'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const k1 = seg(t, ST[219] + .2, ST[220] + 2.5); for (let i = 0; i < 8; i++) { const kk = clamp(k1 * 8 - i); if (kk <= 0) continue; c.save(); c.translate(200 + (i % 4) * 300, 260 + Math.floor(i / 4) * 280); c.scale(kk * 1.4, kk * 1.4); platePorcelain(c, 0, 0, 80); clayBlob(c, 0, -14, 24, 10, '#f4f1ea', { seed: 300 + i }); clayBlob(c, -20, -10, 6, 5, '#5a9a3a', { seed: 310 + i, lw: 1 }); c.restore(); }
    if (t > ST[220] + 2.6) handCross(c, 80, 200, 1180, 760, seg(t, ST[220] + 2.6, ST[220] + 3.1), { t, w: 12 }); if (t > ST[220] + 2.9) handCross(c, 80, 760, 1180, 200, seg(t, ST[220] + 2.9, ST[220] + 3.4), { t, w: 12 });
    const k2 = seg(t, ST[221] + .1, ST[221] + .8); if (k2 > 0) { c.save(); c.translate(1560, 520); const s = 2.6 * easeBack(k2); c.scale(s, s); bloom(c, 0, -20, 160, '255,200,110', .6); clayRoulade(c, 0, 30, 1.2, { steam: true, t }); c.restore(); handText(c, 'Omas Roulade', 1560, 820, 56, '#ffd36a', seg(t, ST[221] + .6, ST[221] + 1.4)); }
    if (t > ST[221] + 2.2) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, r = 420; handArrow(c, 1560 + Math.cos(a) * r, 520 + Math.sin(a) * r * .8, 1560 + Math.cos(a) * 210, 520 + Math.sin(a) * 170, seg(t, ST[221] + 2.2 + i * .12, ST[221] + 2.8 + i * .12), { t, col: INK.chalk, w: 6, head: 20 }); } } }], vignette: .4 };
});
// ---------------- 14. ALLES ÄNDERN (574.8 – 636.7) ----------------
mood(574.8, 599.2, 'light'); mood(599.2, 622.2, 'hope'); mood(622.2, 636.7, 'triumph');
for (let i = 0; i < 8; i++) cue(ST[224] + .2 + i * .25, 'scribble', -20, { d: .2, speed: 9 }); cue(ST[226] + 1.2, 'cheer', -20, { d: 1.6 }); cue(ST[227] + .4, 'pop', -16); cue(ST[229] + .1, 'stamp', -12);
cue(ST[231] + .4, 'knife', -18); cue(ST[232] + .2, 'pour', -22, { d: 1.6 }); cue(ST[233] + .4, 'typing', -20, { d: 2.2 }); cue(ST[235] + .8, 'whoosh', -16, { d: .5 }); cue(ST[235] + 1.4, 'ding', -16);
cue(ST[236] + .3, 'counter', -20, { d: 1.6 }); cue(ST[237] + .3, 'counter', -18, { d: 1.6 }); cue(ST[238] + .1, 'ring', -16, null, { every: .9, n: 5 }); cue(ST[239] + .4, 'buzz', -18, null, { every: .5, n: 4 }); cue(ST[242], 'crowd', -20, { d: 14 }); cue(ST[244] - .1, 'street', -24, { d: 3 }); cue(ST[242] + .3, 'pop', -17); cue(ST[243] + .3, 'tick', -24, { f: 3000 }, { every: .06, n: 34 }); cue(ST[245] + .2, 'scribble', -19, { d: 1 });
const MENU14 = ['Amuse-Bouche', 'Gelbflossen-Thun', 'Jakobsmuschel', 'Erbsen-Schaum', 'Rote Bete Tatar', 'Kalbsbries', 'Hummer-Bisque', 'Wachtel', 'Steinbutt', 'Lamm-Rücken', 'Rinderfilet', 'Käse-Auswahl', 'Mango-Schaum', 'Schokoladen-Kugel'];
shot(at(222), '14a Die Karte schrumpft', (lt, T, t) => {
  const keep = { 1: 1, 5: 1, 8: 1, 10: 1, 11: 1, 13: 1 };
  return { set: 'blank', setOpts: { color: '#3a2418' }, cam: { x: 0, y: 0, z: 1 }, screen: [c => { c.fillStyle = '#4a3020'; c.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) line(c, [0, i * 40, W, i * 40 + 18], 4, 'rgba(20,10,0,.25)');
    let n = 0; const items = MENU14.map((s, i) => { const cr = keep[i] ? 0 : seg(t, ST[224] + .2 + (n++) * .25, ST[224] + .45 + (n - 1) * .25); return { name: s, price: fmtNum(18 + (i * 7) % 30) + ' €', cross: cr, a: 1 - cr * .5 }; });
    menuSheet(c, 300, 60, 700, 960, items, { t, title: 'SPEISEKARTE' }); const after = seg(t, ST[224] + 2.4, ST[224] + 3);
    if (after > 0) { c.save(); c.globalAlpha = after; menuSheet(c, 1120, 150, 560, 640, [{ name: 'Omas Roulade', price: '24 €', hi: 1 }, { name: 'Kartoffelsalat', price: '9 €' }, { name: 'Forelle', price: '22 €' }, { name: 'Linsensuppe', price: '8 €' }, { name: 'Käsespätzle', price: '14 €' }, { name: 'Apfelkuchen', price: '7 €' }], { t, title: 'NEUE KARTE', rot: .03 }); c.restore(); hudBadge(c, t, { t0: ST[224] + 2.6, x: 1400, y: 880, text: '14 → 6 Gerichte', color: HUD.green }); } }], vignette: .4 };
});
shot(at(225), '14b Neue Küche', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -290, z: 1.45 }, { x: 60, y: -285, z: 1.65 }), promo = t > ST[226] + .8;
  const sous = P(Object.assign({}, PEOPLE.sous, promo ? { hat: 'toque' } : {}), t, { x: 100, expr: { mouth: promo ? 'grin' : 'smile', browUp: promo ? .7 : 0 }, arms: promo ? { l: arm(1.4, -.6), r: arm(1.4, -.6) } : RELAX, bob: promo ? -Math.abs(Math.sin(t * 9)) * 18 : undefined });
  const noah = noahP(t, { x: -200, outfit: 'chef', expr: { mouth: 'grin', look: .6 }, arms: { l: arm(.3, -.3), r: promo ? arm(1.0, -.9) : arm(.3, -.3) } });
  return { set: proKitchen, setOpts: { tod: 'service' }, cam, front: [c => noahW(c, noah), c => personW(c, sous)], screen: [c => kitchenLight(c, cam, t, { steamy: true }),
    c => iconRow(c, t, [{ t0: ST[225] + .4, icon: 'euro', title: 'Weniger Ware', lines: ['weniger wegwerfen'], col: HUD.green }, { t0: ST[225] + 2.6, icon: 'clock', title: 'Schnellere Küche', lines: ['weniger Gerichte'], col: HUD.blue }], 60, 60, { t1: ST[226] + .6, w: 420, h: 120, cols: 1 }),
    c => hudBadge(c, t, { t0: ST[226] + .9, t1: ST[227] - .1, x: 1300, y: 150, text: 'neuer Küchenchef', color: HUD.accent })], vignette: .3 };
});
shot(at(227), '14c Mittagstisch', (lt, T, t) => {
  const cam3 = s3move(lt / T, { a0: -.75, a1: -.25, d0: 20, d1: 8.5, tx: 5, f0: 1050, f1: 1300, y0: 2.4, y1: 1.5, ly0: 6, ly1: 1.9 }), hilde = { guests: 6, board: ['MITTAGSTISCH', '16 €', 'Mo – Fr · 12 – 15 Uhr'] };
  return { set: street3d, setOpts: { cam3, tod: 'day', hilde, walkers: S3WALK(t) }, cam: { x: 0, y: 0, z: 1 }, screen: [c => street3dLight(c, cam3, t, { tod: 'day', hilde }), c => hudBadge(c, t, { t0: ST[227] + 2.5, t1: ST[228] - .1, x: 1450, y: 150, text: 'Miete läuft sowieso', color: '#8a5a3a' })], vignette: .25 };
});
shot(at(228), '14d Omas Roulade auf der Karte', (lt, T, t) => {
  return { set: 'blank', setOpts: { color: '#3a2418' }, cam: { x: 0, y: 0, z: 1 }, screen: [c => { c.fillStyle = '#4a3020'; c.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) line(c, [0, i * 40, W, i * 40 + 18], 4, 'rgba(20,10,0,.25)'); c.save(); c.translate(W / 2, H / 2); const s = 1 + lt * .03; c.scale(s, s); c.translate(-W / 2, -H / 2);
    c.save(); c.translate(560, 100); c.rotate(-.02); c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.fillStyle = '#fbf5e6'; c.fillRect(0, 0, 800, 880); c.restore(); c.lineWidth = 4; c.strokeStyle = '#8a6a4a'; c.strokeRect(20, 20, 760, 840); hudText(c, 'HAUPTGERICHT', 400, 110, 44, '#5a3a24', 'center');
    if (t > ST[229]) hudText(c, 'Omas Roulade', 400, 260, 74, '#a0302a', 'center'); if (t > ST[230]) hudText(c, 'Rezept von 1962', 400, 340, 40, '#5a3a24', 'center'); line(c, [200, 380, 600, 380], 3, '#c9a24a'); hudText(c, 'mit Rotkohl, Klößen & Omas Soße', 400, 440, 30, '#7d7064', 'center'); c.save(); c.translate(400, 700); clayRoulade(c, 0, 0, 2.3, { steam: true, t }); c.restore(); c.restore(); c.restore(); }], vignette: .45 };
});
shot(at(231), '14e Lukas filmt', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 40, y: -260, z: 1.7 }, { x: 80, y: -255, z: 1.95 }), cut = seg(t, ST[231] + .4, ST[231] + 2.2);
  const lk = P(PEOPLE.lukas, t, { x: 230, expr: { mouth: 'grin', look: -.6, lid: .3 }, arms: { l: arm(1.1, -1.9), r: arm(1.1, -1.9) } });
  const noah = noahP(t, { x: -200, outfit: 'chef', expr: { mouth: 'smile', look: .5 }, arms: { l: arm(.3, -.3), r: reach(1, -200, -60 + cut * 30, -230) } });
  return { set: proKitchen, setOpts: { tod: 'service', stove: false, extra: c => { platePorcelain(c, -40, -214, 70); clayRoulade(c, -40, -214, .9, { steam: true, t }); } }, cam, front: [c => noahW(c, noah), c => personW(c, lk), c => { const [hx, hy] = drawPersonHand(lk, 1); c.beginPath(); c.rect(hx - 50, hy - 70, 34, 64); fs(c, '#16161a', 2); circle(c, hx - 33, hy - 60, 5); c.fillStyle = '#ff3a3a'; c.fill(); }],
    screen: [c => kitchenLight(c, cam, t, { steamy: true }), c => { if (t > ST[232] - .5) phone(c, 1660, 420, 300, 590, -.05, (c2, w, h) => appVideo(c2, w, h, { t, cut: 1, capK: seg(t, ST[233] + .3, ST[234] + 2.4), views: 0, likes: '0' }), { dark: true, clock: '21:48', bg: '#000' }); }], vignette: .3 };
});
shot(at(235), '14f Hochladen', (lt, T, t) => {
  const up = seg(t, ST[235] + .2, ST[235] + 1.4);
  return { set: 'blank', setOpts: { color: '#121418' }, cam: { x: 0, y: 0, z: 1 }, screen: [c => { const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1000); g.addColorStop(0, '#2a3040'); g.addColorStop(1, '#0a0c10'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    phone(c, W / 2, 540, 420, 820, 0, (c2, w, h) => { appVideo(c2, w, h, { t, views: 0, likes: '0' }); c2.fillStyle = 'rgba(0,0,0,.6)'; c2.fillRect(0, h / 2 - 70, w, 140); hudText(c2, up < 1 ? 'Wird hochgeladen …' : 'Hochgeladen ✓', w / 2, h / 2 - 16, 28, '#fff', 'center'); c2.fillStyle = '#333'; rrect(c2, 40, h / 2 + 14, w - 80, 16, 8); c2.fill(); c2.fillStyle = '#3ac25a'; rrect(c2, 40, h / 2 + 14, (w - 80) * up, 16, 8); c2.fill(); }, { dark: true, clock: 'Sa 22:03', bg: '#000' }); }], vignette: .4 };
});
shot(at(236), '14g Viral', (lt, T, t) => {
  const v = t < ST[237] ? lerp(0, 200000, easeOut(seg(t, ST[236] + .3, ST[236] + 1.9))) : lerp(200000, 2300000, easeOut(seg(t, ST[237] + .3, ST[237] + 1.9)));
  return { set: 'blank', setOpts: { color: '#121418' }, cam: { x: 0, y: 0, z: 1 }, screen: [c => { const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1000); g.addColorStop(0, '#2a3040'); g.addColorStop(1, '#0a0c10'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    phone(c, 640, 540, 420, 820, -.04, (c2, w, h) => appVideo(c2, w, h, { t, views: v, likes: fmtNum(Math.round(v * .08 / 1000) * 1000) }), { dark: true, clock: t < ST[237] ? 'So 11:20' : 'Mo 08:05', bg: '#000' });
    hudText(c, t < ST[237] ? 'Sonntag' : 'Montag', 1380, 330, 60, '#9aa4b4', 'center'); hudText(c, (v >= 1e6 ? fmtNum(v / 1e6, 1) + ' Mio.' : fmtNum(Math.round(v / 1000) * 1000)), 1380, 520, 130, '#fff', 'center'); hudText(c, 'Aufrufe', 1380, 600, 50, '#9aa4b4', 'center');
    if (t > ST[237] + 1) handArrow(c, 1180, 820, 1600, 680, seg(t, ST[237] + 1, ST[237] + 1.6), { t, col: '#3ac25a', w: 10 }); }], vignette: .4 };
});
shot(at(238), '14h Telefon klingelt', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 3900, y: -330, z: 2.4 }, { x: 3950, y: -330, z: 2.6 }), ring = Math.sin(t * 40) * 4;
  const noah = noahP(t, { x: 3700, outfit: 'chef', expr: { mouth: 'o', browUp: .8, look: .7 }, arms: { l: arm(.4, -1.3), r: reach(1, 3700, 3830, -260) } });
  return { set: salon, setOpts: { tod: 'golden' }, cam, front: [c => noahW(c, noah), c => { c.save(); c.translate(3840 + ring, -260); c.beginPath(); c.roundRect(-40, -18, 80, 36, 8); fs(c, '#2a2a2e', 2.5); c.restore(); }, c => { c.save(); c.translate(4060, -255); c.rotate(-.05); c.beginPath(); c.rect(-120, -10, 240, 10); fs(c, '#7a2a20', 2); c.beginPath(); c.rect(-110, -160, 220, 150); fs(c, '#fbf6e8', 2); for (let i = 0; i < Math.floor(seg(t, ST[238], ST[240]) * 9); i++) { c.font = hudFont(11); c.fillStyle = '#24305e'; c.textAlign = 'left'; c.fillText(['Müller 4P', 'Schmidt 2P', 'Weber 6P', 'Yilmaz 3P', 'Fischer 2P', 'Becker 5P', 'Wagner 2P', 'Klein 4P', 'Wolf 3P'][i], -100, -140 + i * 15); } c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'golden' }), c => phone(c, 1560, 560, 340, 660, .08, (c2, w, h) => appCall(c2, w, h, { t, name: 'Reservierung', missed: lerp(3, 87, seg(t, ST[238], ST[240])) }), { dark: true, clock: 'Mo 09:12', bg: '#000' }),
      c => hudCard(c, t, { t0: ST[239] + .3, t1: ST[240] - .1, corner: 'tl', w: 600, h: 240, title: 'RESERVIERUNGEN', icon: 'people', color: HUD.green, draw: (c, k, l) => { hudCounter(c, 0, 400, seg(l, .1, 1.2), 0, 82, 70, { fmt: v => (v > 399 ? 'über ' : '') + fmtNum(Math.round(v)) }); hudText(c, 'Anfragen in 3 Tagen', 0, 130, 28, HUD.muted); } })], vignette: .3 };
});
shot(at(240), '14i Voll', (lt, T, t) => {
  const cam3 = r3move(lt / T, { x0: -7, x1: -2, z0: -15.5, z1: -12, y0: 2.6, y1: 2.0, lx0: 2, lx1: 0 }), nx = lerp(-3, 2.5, lt / T);
  const noah = r3person(nx, -7.0, c2 => { const p = noahP(t, { x: 0, legs: walkLegs(t, 9).legs, bob: walkLegs(t, 9).bob, expr: { mouth: 'grin', look: .3 }, arms: { r: arm(1.25, -1.75, .2), l: arm(.18, -.15) } }); drawNoahDressed(c2, p); const [hx, hy] = noahHandWorld(p, 1); tray(c2, hx, hy - 10, 1.05, t); });
  const waiting = [0, 1, 2, 3].map(i => r3person(9.6 - i * .2, -14.2 + i * .75, c2 => personW(c2, P(PEOPLE.guest(i + 30), t, { x: 0, expr: { mouth: 'soft', look: -.6 } }))));
  return { set: room3d, setOpts: { cam3, tod: 'evening', tables: 'full', extra: [noah, ...waiting] }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => room3dLight(c, cam3, t, { tod: 'evening' }), c => hudCard(c, t, { t0: ST[242] + .1, t1: ST[244] + .2, corner: 'tl', w: 560, h: 250, title: 'ZWEI DURCHGÄNGE', icon: 'clock', color: HUD.accent, draw: (c) => { hudText(c, '18:00', 0, 90, 76, HUD.ink); hudText(c, '20:30', 270, 90, 76, HUD.ink); hudText(c, 'jeden Abend', 0, 150, 28, HUD.muted); } }),
      c => { if (t > ST[243]) { inkVeil(c, 1120, 560, 760, 480, .45); const k = seg(t, ST[243] + .3, ST[243] + 2.4); hudText(c, fmtNum(Math.round(lerp(31, 65, k))) + ' Gäste', 1500, 640, 64, '#ffd36a', 'center'); barChart(c, 1240, 680, 520, 250, [{ label: 'vorher', v: 31, col: '#8a8e94' }, { label: 'jetzt', v: 31 + 34 * k, col: HUD.green, text: '60–70' }], 1, { size: 24 }); } }], vignette: .3 };
});
shot(at(244), '14j Warteliste (außen)', (lt, T, t) => {
  const cam3 = s3move(lt / T, { a0: .7, a1: .2, d0: 18, d1: 13, f0: 1100, f1: 1250, y0: 2.2, y1: 1.7, ly0: 5, ly1: 3.4 }), hilde = { guests: 12, queue: 11, lit: 1 };
  return { set: street3d, setOpts: { cam3, tod: 'evening', hilde, walkers: S3WALK(t) }, cam: { x: 0, y: 0, z: 1 }, screen: [c => street3dLight(c, cam3, t, { tod: 'evening', hilde }), c => hudBadge(c, t, { t0: ST[244] + .2, x: 960, y: 140, text: '+ 2 neue Leute · Warteliste', color: HUD.blue, size: 30 })], vignette: .3 };
});
// ---------------- 15. SECHS MONATE SPÄTER (636.7 – 657.0) ----------------
mood(636.7, 657.0, 'triumph');
cue(ST[246] + .3, 'counter', -20, { d: 1.2 }); cue(ST[247] + .3, 'register', -14); cue(ST[249] + .2, 'ding', -14); cue(ST[250] + .3, 'scribble', -18, { d: 1 }); cue(ST[251] + .5, 'cheer', -22, { d: 1.6 });
shot(at(246), '15a Gewinn', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 150, camDx: 80, z: 3.3, side: 'r', y: -262 });
  const noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: t > ST[249] ? 'grin' : 'smile', browUp: .3, look: -.4 } });
  return { set: salon, setOpts: { tod: 'golden', hz: -95, midY: -40, midGuests: fullGuests(t, false) }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => salonLight(c, g.cam, t, { tod: 'golden', hz: -95 }), c => hudCard(c, t, { t0: ST[246] + .2, t1: ST[250] - .1, corner: 'tl', w: 660, h: 430, title: 'NACH 6 MONATEN', icon: 'table', color: HUD.green,
      draw: (c, k, l, w, h) => { hudText(c, 'Umsatz / Monat', 0, 44, 28, HUD.muted); hudCounter(c, 22000, 80000, seg(l, .2, 1.6), w, 44, 34, { fmt: v => '≈ ' + fmtNum(Math.round(v / 1000) * 1000) + ' €', align: 'right' }); if (t > ST[247]) { hudText(c, 'Kosten (alles)', 0, 104, 28, HUD.muted); hudText(c, '≈ − 70.000 €', w, 104, 34, HUD.ink, 'right'); c.fillStyle = HUD.ink; c.fillRect(0, 126, w, 3); hudText(c, 'Gewinn', 0, 190, 40, HUD.green); hudCounter(c, 0, 10000, seg(t, ST[247] + 2, ST[247] + 3.4), w, 190, 52, { fmt: v => '≈ ' + fmtNum(Math.round(v / 100) * 100) + ' €', color: HUD.green, align: 'right' }); } if (t > ST[248]) hudText(c, 'vor Steuern', w, 232, 24, HUD.muted, 'right'); } }),
      c => { if (t > ST[249]) { const k = seg(t, ST[249], ST[249] + .4); hudBadge(c, t, { t0: ST[249], x: 420, y: 560, text: 'zum ersten Mal kein Minus', color: HUD.green, size: 30 }); } }], vignette: .3 };
});
shot(at(250), '15b Dispo zurück', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 1.04 });
  return { set: 'blank', setOpts: { color: '#121418' }, cam, screen: [c => { const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1000); g.addColorStop(0, '#24343a'); g.addColorStop(1, '#0a0c10'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    phone(c, 560, 540, 400, 780, -.04, (c2, w, h) => appBanking(c2, w, h, { balance: lerp(-30000, 8400, seg(t, ST[250] + .2, ST[250] + 1.8)), limit: 'Dispo-Rahmen: 30.000 €', rows: [['Kasse Samstag', 6140.3], ['Kasse Freitag', 5880], ['Rückzahlung Dispo', -7500], ['Lieferant Rind', -2140.5], ['Kasse Mittag', 1320] ] }), { clock: 'Fr 18:20' });
    inkVeil(c, 1000, 260, 820, 520, .45); hudText(c, 'DISPO', 1410, 340, 46, INK.chalk, 'center'); for (let i = 0; i < 4; i++) { const k = seg(t, ST[250] + .3 + i * .35, ST[250] + .6 + i * .35); c.fillStyle = HUD.line; rrect(c, 1100 + i * 160, 420, 130, 220, 10); c.fill(); c.fillStyle = '#d0302a'; const hh = 220 * (1 - (i + k) / 4); rrect(c, 1100 + i * 160, 420 + 220 - hh, 130, hh, 10); c.fill(); hudText(c, 'M' + (i + 1), 1165 + i * 160, 690, 30, '#fff', 'center'); } hudText(c, '30.000 € → 0 €', 1410, 760, 44, '#a8e0a0', 'center'); }], vignette: .4 };
});
shot(at(251), '15c Blumen für Mama', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -230, z: 2.0 }, { x: 0, y: -235, z: 2.3 }), give = ease(seg(lt, .3, 1.4));
  const mom = P(PEOPLE.mother, t, { x: -170, expr: { mouth: t > ST[252] ? 'grin' : 'smile', browUp: .5, look: .6, lid: .2 }, arms: { l: reach(-1, -170, lerp(-260, -60, give), -190), r: reach(1, -170, lerp(-80, -20, give), -180) } });
  const noah = noahP(t, { x: 170, outfit: 'classic', expr: { mouth: 'grin', look: -.6 }, arms: { l: reach(-1, 170, lerp(40, -20, give), -200), r: arm(.2, -.2) } });
  return { set: livingRoom, cam, front: [c => personW(c, mom), c => noahW(c, noah), c => { const [hx, hy] = noahHandWorld(noah, -1); clayFlowers(c, hx - 10, hy + 10, 2.4, ['#e0506a', '#f2c94a', '#f4f1ea']); const [mx, my] = drawPersonHand(mom, 1); envelope(c, mx + 10, my + 4, .8, '#f4f0e0'); }],
    screen: [c => grade(c, { sx: .7, sy: .2, warm: '255,200,130', warmA: .3 })], vignette: .3 };
});
// ---------------- 16. DIE INSPEKTOREN (657.0 – 702.4) ----------------
mood(657.0, 702.4, 'mystery');
cue(ST[254] + .2, 'door', -18); cue(ST[255] + .4, 'scribble', -20, { d: .6 }); [259, 260, 261].forEach(i => cue(ST[i] + .1, 'pop', -18)); cue(ST[262] + .4, 'register', -16); cue(ST[263] + .2, 'whoosh', -18, { d: .5 }); cue(ST[263] + .4, 'page', -16, null, { every: .2, n: 4 }); cue(ST[266] + .1, 'pop', -18);
[268, 269, 270, 271, 272].forEach(i => cue(ST[i] + .3, 'pop', -17));
function inspectorShot(lt, T, t, who, qTimes, o = {}) {
  const cam = camPush(lt, T, { x: 120, y: -220, z: 2.1 }, { x: 160, y: -225, z: 2.35 }), talk = qTimes.some(q => t > q && t < q + 1.3);
  const insp = P(who, t, { x: 280, sit: true, seatH: 250, expr: Object.assign({ look: -.6, lid: .15 }, talk ? talkMouth(t, 0, 999) : { mouth: 'soft' }), arms: { l: arm(.4, -1.1), r: talk ? arm(.9, -1.5) : arm(.4, -1.1) } });
  const noah = noahP(t, { x: -60, expr: { mouth: 'smile', look: .7 }, arms: { l: arm(.35, -1.4), r: arm(.35, -1.4) } });
  return { set: salon, setOpts: { tod: 'evening', midGuests: fullGuests(t, false) }, cam, behind: [c => chairBack(c, 280)], front: [c => personW(c, insp, false), c => dineTable(c, 280, { w: 380, items: (c, tp) => { PLATE(c, 0, tp + 8, .55, t); wineGlass(c, 120, tp, .8, { wine: '#6a0e1e' }); candle(c, -130, tp, t, .8); notebookSmall(c, -60, tp + 8); } }), c => noahW(c, noah)],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => grade(c, { sx: .8, sy: .3, warm: '255,190,120', warmA: .15, cool: '20,20,60', coolA: .3 }), ...qTimes.map((q, i) => c => { const [x, y] = toScreen(cam, 1, 280, -440); if (t > q && t < q + 2.6) { const k = seg(t, q, q + .3); handText(c, '?', x - 120 + i * 120, y - 60 - i * 30, 90, '#ffd36a', k); } })].concat(o.screen || []), vignette: .45 };
}
function notebookSmall(c, x, y) { c.save(); c.translate(x, y); c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.lineTo(22, -10); c.lineTo(-22, -10); c.closePath(); fs(c, '#2a2a30', 1.5); line(c, [-18, -6, 14, -6], 1, '#fff'); c.restore(); }
shot(at(253), '16a Eine Frau allein', (lt, T, t) => {
  const cam3 = r3move(lt / T, { x0: -4, x1: -1.5, z0: -15.5, z1: -14, y0: 2.2, y1: 1.9, lx0: 6, lx1: 5, ly0: 1.3, ly1: 1.2 }), ent = seg(t, ST[254], ST[254] + 3.2);
  const insp = r3person(lerp(10, 5.6, ent), lerp(-14, -9.7, ent), c2 => personW(c2, P(PEOPLE.inspectorW, t, { x: 0, legs: ent > 0 && ent < 1 ? walkLegs(t, 7).legs : null, expr: { mouth: 'soft', look: -.3 }, arms: RELAX })));
  const stand = r3person(9.2, -13.6, c2 => { line(c2, [0, 0, 0, -300], 8, '#3a2418'); c2.beginPath(); c2.rect(-120, -320, 240, 40); fs(c2, '#4a2c1c', 3); c2.save(); c2.translate(0, -322); c2.rotate(-.04); c2.beginPath(); c2.rect(-100, -12, 200, 12); fs(c2, '#7a2a20', 2); c2.beginPath(); c2.rect(-90, -120, 180, 108); fs(c2, '#fbf6e8', 2); ['Müller 4P', 'Weber 1P', 'Schmidt 2P', 'Klein 3P'].forEach((s, i) => { c2.font = hudFont(12); c2.fillStyle = i === 1 ? '#a0302a' : '#24305e'; c2.textAlign = 'left'; c2.fillText(s + '  19:30', -80, -100 + i * 22); }); c2.restore(); });
  return { set: room3d, setOpts: { cam3, tod: 'evening', tables: i => i === 10 ? 0 : 2, talk: true, extra: [insp, stand] }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => room3dLight(c, cam3, t, { tod: 'evening' }), c => grade(c, { sx: .8, sy: .3, cool: '20,20,60', coolA: .3 }), c => hudBadge(c, t, { t0: ST[255] + .3, t1: ST[256] - .1, x: 1400, y: 150, text: 'Weber · 1 Person · 19:30', color: '#5a4a7a' }), c => hudBadge(c, t, { t0: ST[256] + .2, t1: ST[257] - .1, x: 1400, y: 150, text: 'komplettes Menü', color: '#5a4a7a' })], vignette: .45 };
});
shot(at(257), '16b Fragen', (lt, T, t) => inspectorShot(lt, T, t, PEOPLE.inspectorW, [ST[259], ST[260], ST[261]], { screen: [c => hudBadge(c, t, { t0: ST[262] + .2, t1: ST[263] - .2, x: 1400, y: 150, text: 'zahlt · normales Trinkgeld', color: '#5a4a7a' })] }));
shot(at(263), '16c Vier Monate später', (lt, T, t) => inspectorShot(lt, T, t, PEOPLE.inspectorM, [ST[266], ST[266] + .8], { screen: [c => { const k = seg(t, ST[263], ST[263] + 1.2); if (t < ST[264] + .5) { c.save(); c.globalAlpha = 1 - seg(t, ST[264], ST[264] + .5); inkVeil(c, 660, 280, 600, 520, .7); for (let i = 0; i < 4; i++) { const flip = clamp(k * 4 - i); c.save(); c.translate(960, 560); c.scale(1, 1 - flip * .9); c.translate(0, -flip * 40); c.fillStyle = '#fbf6ea'; rrect(c, -150, -170, 300, 300, 14); c.fill(); c.fillStyle = '#d0302a'; c.fillRect(-150, -170, 300, 70); hudText(c, ['Juli', 'August', 'September', 'Oktober'][Math.min(3, i + (flip >= 1 ? 1 : 0))], 0, -120, 36, '#fff', 'center'); hudText(c, '+' + (i + 1), 0, 40, 110, HUD.ink, 'center'); c.restore(); } c.restore(); } }] }));
shot(at(267), '16d So arbeiten die Inspektoren', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -280, z: 1.6 }, { x: 60, y: -275, z: 1.8 });
  const iw = P(PEOPLE.inspectorW, t, { x: 420, expr: { mouth: 'soft', look: -.3, lid: .2 }, arms: RELAX }), im = P(PEOPLE.inspectorM, t, { x: 650, expr: { mouth: 'soft', look: -.5, lid: .2 }, arms: RELAX });
  return { set: salon, setOpts: { tod: 'night', sconces: true }, cam, front: [c => personW(c, iw), c => personW(c, im), c => { const [x, y] = [420, -450]; c.save(); c.translate(x, y - 20); c.rotate(-.1); c.beginPath(); c.rect(-70, -22, 140, 44); fs(c, '#fffaf0', 2); c.font = hudFont(16); c.fillStyle = '#2a2a2a'; c.textAlign = 'center'; c.fillText('Deckname', 0, 6); c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true }), c => ceremonyLight(c, cam, t, { spot: toScreen(cam, 1, 535, -300) }), c => hudCard(c, t, { t0: ST[268] + .1, t1: ST[273] - .2, corner: 'tl', w: 700, h: 560, title: 'MICHELIN-INSPEKTOREN', icon: 'people', color: '#8a1a2a',
      draw: (c, k, l, w, h) => { [['eye', 'anonym, mit Decknamen', ST[269] + .3], ['euro', 'zahlen ihre Rechnung selbst', ST[269] + 3], ['people', 'niemand weiß, wer sie sind', ST[270] + .3], ['star', 'Stern erst nach mehreren Besuchen', ST[271] + .3], ['person', '~ 2 Dutzend in Deutschland', ST[272] + .3]].forEach(([ic, s, t0], i) => { const kk = seg(t, t0, t0 + .35); if (kk <= 0) return; c.save(); c.globalAlpha = kk; c.translate((1 - easeOut(kk)) * -30, 0); c.fillStyle = '#8a1a2a'; rrect(c, 0, 10 + i * 88, 70, 70, 14); c.fill(); bigIcon(c, ic, 35, 45 + i * 88, .7, '#fff'); hudText(c, s, 92, 56 + i * 88, 30, HUD.ink); c.restore(); }); } })], vignette: .5 };
});
// ---------------- 17. DER STERN (702.4 – 731.0) ----------------
mood(702.4, 717.8, 'mystery'); mood(717.8, 731.0, 'triumph');
cue(ST[273] + .3, 'page', -14); cue(ST[275] - .3, 'crowd', -26, { d: 10 }); cue(ST[276] + .2, 'heart', -16, null, { every: .55, n: 6 }); cue(ST[279] + .3, 'ding', -14); cue(ST[280], 'stamp', -10); cue(ST[280] + .2, 'applause', -14, { d: 9 });
shot(at(273), '17a Der Brief', (lt, T, t) => ({ set: 'blank', setOpts: { color: '#5a3a26' }, cam: { x: 0, y: 0, z: 1 }, screen: [c => { c.fillStyle = '#6a4a30'; c.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) line(c, [0, i * 40, W, i * 40 + 18], 4, 'rgba(30,15,5,.22)'); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,220,160,.35)'); g.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  inviteLetter(c, W / 2, 620, 1.35 + lt * .02, seg(t, ST[273] + .4, ST[274] + .6), t); }], vignette: .45 }));
shot(at(275), '17b Im geliehenen Anzug', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 0, camDx: 60, z: 3.0, side: 'r', y: -200 }), shake = Math.sin(t * 38) * .035;
  const noah = noahP(t, { x: g.x, sit: true, seatH: 300, outfit: 'suit', expr: { mouth: 'grim', worry: .7, look: -.2, sweat: (t * .6) % 1 }, arms: { l: arm(.55 + shake, -1.5), r: arm(.55 - shake, -1.5) } });
  return { set: ceremonyHall, setOpts: {}, cam: g.cam, behind: [c => { for (const dx of [-210, 210]) drawPerson(c, P(PEOPLE.guest(Math.abs(dx) / 30), t, { x: g.x + dx, sit: true, seatH: 300, who: Object.assign({}, PEOPLE.guest(dx > 0 ? 4 : 9), { top: { type: 'chef', col: '#fbfaf6' } }), expr: { mouth: 'soft', look: dx > 0 ? -.3 : .3 } })); }, c => noahW(c, noah, false)],
    screen: [c => ceremonyLight(c, g.cam, t), c => { if (t > ST[278]) { inkVeil(c, 120, 120, 640, 460, .45); thoughtBubble(c, 440, 330, 560, 340, seg(t, ST[278], ST[278] + .5), (c2, tt) => { handStroke(c2, [-180, 40, -60, 40], 1, { t: tt, col: HUD.ink, w: 6, shadow: false }); handStroke(c2, arcPts(-120, 40, 70, 16, Math.PI, Math.PI * 2, 12), 1, { t: tt, col: HUD.ink, w: 5, shadow: false }); c2.save(); c2.translate(110, 0); c2.scale(.5, .5); recipeBook(c2, 0, 0, 260, 220, { rot: -.1 }); c2.restore(); handText(c2, '+', -10, 10, 60, HUD.ink, 1, { outline: false }); }, t); } }], vignette: .45 };
});
shot(at(279), '17c Dein Name', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 220, y: -760, z: .78 }, { x: 180, y: -700, z: .86 }), named = t > ST[279] + .4;
  const host = c => drawPerson(c, P(PEOPLE.host, t, { x: 650, y: -260, k: .3, expr: Object.assign({ look: -.3 }, talkMouth(t, ST[279], ST[279] + 1.5) || { mouth: 'smile' }), arms: { l: arm(.6, -1.6), r: arm(.9, -1.9) } }));
  return { set: ceremonyHall, setOpts: { host, gap: 0, noah: c => { const up = seg(t, ST[279] + .8, ST[279] + 1.8); drawNoahDressed(c, noahP(t, { x: 0, k: .25, sit: up < .5, seatH: 300, outfit: 'suit', expr: { mouth: up > .5 ? 'o' : 'grim', browUp: .8 * up, worry: .4 }, arms: { l: arm(.4, -1.2), r: arm(.4, -1.2) } })); }, clap: t > ST[280] + .2, cheer: t > ST[280], lookX: .3, screen: c => { if (named) { hudText(c, 'Restaurant HILDE', 0, -1320, 90, '#fff', 'center'); const k = seg(t, ST[280], ST[280] + .4); c.save(); c.translate(0, -1160); c.scale(easeBack(k), easeBack(k)); star(c, 0, 0, 90, 5, .45); c.fillStyle = '#e8b84a'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke(); c.restore(); } else { hudText(c, 'Und der Stern geht an …', 0, -1300, 70, '#d8d0e8', 'center'); } } }, cam,
    screen: [c => ceremonyLight(c, cam, t, { spot: t > ST[279] + .4 ? [W * .5, H * .72] : null }), c => { if (t > ST[280]) { for (let i = 0; i < 40; i++) { const q = ((t - ST[280]) * .4 + rnd(i)) % 1; c.save(); c.translate(rnd(i + 3) * W, q * H); c.rotate(t * 3 + i); c.fillStyle = ['#e8b84a', '#fff', '#c0392b'][i % 3]; c.fillRect(-6, -10, 12, 20); c.restore(); } } }], vignette: .35 };
});
shot(at(281), '17d 279 Sterne', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 650, y: -480, z: 1.6 }, { x: 650, y: -470, z: 1.8 });
  const noah = noahP(t, { x: 650, y: -260, outfit: 'suit', expr: { mouth: 'grin', browUp: .5 }, arms: { l: arm(.9, -1.3), r: arm(.9, -1.3) } });
  return { set: ceremonyHall, setOpts: { clap: true, cheer: true }, cam, front: [c => noahW(c, noah, false), c => { const [hx, hy] = noahHandWorld(noah, 1); c.save(); c.translate((hx + noahHandWorld(noah, -1)[0]) / 2, hy - 30); c.beginPath(); c.rect(-50, -60, 100, 80); fs(c, '#2a1a24', 3); star(c, 0, -20, 28, 5, .45); c.fillStyle = '#e8b84a'; c.fill(); c.restore(); }],
    screen: [c => ceremonyLight(c, cam, t, { spot: [W * .5, H * .55] }), c => hudCard(c, t, { t0: ST[282] + .1, t1: ST[284] - .2, corner: 'tl', w: 620, h: 330, title: 'MICHELIN 2026', icon: 'table', color: '#8a1a2a',
      draw: (c, k, l, w, h) => { hudText(c, 'Restaurants mit 1 Stern', 0, 36, 28, HUD.muted); hudCounter(c, 0, 279, seg(t, ST[282] + 2, ST[282] + 3.4), 0, 132, 96, { color: '#8a1a2a' }); hudText(c, 'in ganz Deutschland', 0, 182, 28, HUD.muted); if (t > ST[283]) { hudText(c, '… eins davon: HILDE', 0, 236, 32, '#c9a24a'); } } })], vignette: .35 };
});
// ---------------- 18. EHRLICH + ENDE (731.0 – 786.8) ----------------
mood(731.0, 749.3, 'silence'); mood(749.3, 762.8, 'memory'); mood(762.8, 774.5, 'triumph'); mood(774.5, 786.8, 'outro');
cue(ST[284] + .05, 'scratch', -18); cue(ST[286] + .2, 'street', -26, { d: 15 }); [290, 290.1, 290.2].forEach((_, i) => cue(ST[290] + .3 + i * 1.2, 'pop', -17)); cue(ST[291] + .5, 'thunk', -16);
[0, 1.5, 3.0, 4.3].forEach(d => cue(ST[292] + 1.2 + d, 'scribble', -18, { d: .4 })); cue(ST[294] + .1, 'creak', -14, { d: 1 }); cue(ST[295] + .2, 'scribble', -18, { d: 1.2 }); cue(ST[295] + 1.3, 'thunk', -14);
cue(ST[297], 'tick', -16, { f: 2200 }); cue(ST[299] - .1, 'crowd', -16, { d: 9 }); cue(ST[300] + .2, 'clink', -14, null, { every: .4, n: 6 }); cue(ST[301] + .1, 'shout', -16); cue(ST[305] + .3, 'pop', -16); cue(ST[306] + .3, 'pop', -16); cue(ST[307] + .2, 'pop', -14); cue(ST[308] + .3, 'ding', -12);
shot(at(284), '18a Ohne Filmmusik', (lt, T, t) => {
  const cam3 = { x: lerp(-27, -25.5, lt / T), y: 1.65, z: -9.5, f: lerp(1900, 2100, lt / T), look: [-25.2, 1.45, -2.4] };
  const noah = r3person(-25.2, -2.4, c2 => noahW(c2, noahP(t, { x: 0, outfit: 'classic', expr: { mouth: 'flat', look: -.3, browUp: .2 } })));
  return { set: street3d, setOpts: { cam3, tod: 'day', hilde: { closed: true }, walkers: [], extra: [noah], traffic: false }, cam: { x: 0, y: 0, z: 1 }, screen: [c => street3dLight(c, cam3, t, { tod: 'day' }), c => grade(c, { sx: .5, sy: .2, warm: '240,240,250', warmA: .1, cool: '60,70,90', coolA: .3 })], vignette: .35 };
});
shot(at(286), '18b Wir sagen Danke', (lt, T, t) => {
  const nx = lerp(-60, -38, lt / T), cam3 = { x: nx - 4, y: 1.7, z: -10, f: 1150, look: [nx + 4, 2.2, 0] };
  const noah = { x: nx, z: -2.4, draw: (c, cam) => bb3(c, cam, nx, -2.4, c2 => { castShadow(c2, 0, 110, { alpha: .25 }); drawNoahSide(c2, { x: 0, k: .25, ink: 1.8, walk: t * 7, outfit: 'classic', expr: { mouth: 'flat', look: .2 } }); }) };
  return { set: street3d, setOpts: { cam3, tod: 'day', hilde: { closed: true }, walkers: [], extra: [noah], traffic: false }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => street3dLight(c, cam3, t, { tod: 'day' }), c => grade(c, { sx: .5, sy: .1, warm: '235,235,245', warmA: .1, cool: '60,70,90', coolA: .35 }),
      c => iconRow(c, t, [{ t0: ST[290] + .3, icon: 'clock', title: '18-Stunden-Tage', lines: [''], col: '#5a4a4a' }, { t0: ST[290] + 1.5, icon: 'person', title: 'kaum Urlaub', lines: [''], col: '#5a4a4a' }, { t0: ST[290] + 2.7, icon: 'euro', title: '1 € Gewinn / Teller', lines: [''], col: '#d0302a' }], 60, 50, { t1: ST[292] - .1, w: 380, h: 100, cols: 3, gap: 30 }),
      c => { if (t > ST[291]) hudBadge(c, t, { t0: ST[291] + .3, t1: ST[292] - .1, x: 960, y: 980, text: 'ein schlechter Monat kann alles kaputt machen', color: '#d0302a', size: 28 }); }], vignette: .4 };
});
shot(at(292), '18c Nicht das Geld', (lt, T, t) => ({ set: 'blank', setOpts: { color: '#1f1a24' }, cam: { x: 0, y: 0, z: 1 }, screen: [c => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a2030'); g.addColorStop(1, '#141018'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  [['euro', 'Geld', 0], ['calc', 'Kredit', 1.5], ['fire', 'Küche', 3.0], ['star', 'Design', 4.3]].forEach(([ic, s, d], i) => { const t0 = ST[292] + .2 + d * .6 + (i === 0 ? 0 : 0); const k = seg(t, ST[292] + .2 + i * (i < 1 ? 0 : 1) * .9 + (i ? ST[293] - ST[292] - .2 : 0) * (i > 0 ? 1 : 0) - 0, 0); });
  const items = [['Geld', ST[292] + .3], ['Kredit', ST[293] + .3], ['Küche', ST[293] + 1.2], ['Design', ST[293] + 2.2]];
  items.forEach(([s, t0], i) => { const k = seg(t, t0, t0 + .3); if (k <= 0) return; const x = 300 + i * 440; c.save(); c.globalAlpha = k; c.fillStyle = '#fbf6ea'; rrect(c, x - 170, 380, 340, 240, 26); c.fill(); bigIcon(c, ['euro', 'calc', 'fire', 'star'][i], x, 460, 1.6, HUD.ink); hudText(c, s, x, 580, 44, HUD.ink, 'center'); c.restore(); handCross(c, x - 170, 380, x + 170, 620, seg(t, t0 + .5, t0 + .9), { t, w: 12 }); });
  if (t > ST[294] - .3) { const k = seg(t, ST[294] - .2, ST[294] + .5); c.save(); c.globalAlpha = k; c.fillStyle = 'rgba(10,8,14,.7)'; c.fillRect(0, 0, W, H); c.translate(W / 2, H / 2); c.scale(1 + (1 - easeOut(k)) * .3, 1 + (1 - easeOut(k)) * .3); bloom(c, 0, 0, 500, '255,200,120', .4); recipeBook(c, 0, 0, 520, 440, { rot: -.05 }); c.restore(); } }], vignette: .45 }));
shot(at(295), '18d Die Waage', (lt, T, t) => {
  const open = 1, cam = { x: lerp(230, 210, lt / T), y: -430, z: lerp(2.5, 2.7, lt / T) }, dk = seg(t, ST[295] + .1, ST[295] + 1.2), tilt = t < ST[295] + 1.25 ? 0 : .27 * (1 - Math.exp(-(t - ST[295] - 1.25) * 5) * Math.cos((t - ST[295] - 1.25) * 11));
  return { set: drawerSet, setOpts: { open }, cam, screen: [c => drawerLight(c, cam, t), c => { inkVeil(c, 1080, 180, 720, 700, .55); handScale(c, 1440, 840, 1.25, dk, tilt, t); }], vignette: .6 };
});
shot(at(297), '18e Freitag 23:12 – laut', (lt, T, t) => {
  const cam3 = s3move(lt / T, { a0: -.9, a1: -.08, d0: 25, d1: 17, f0: 1000, f1: 1200, y0: 3, y1: 1.7, ly0: 8, ly1: 4.4 }), hilde = { guests: 10, star: true, queue: 7 };
  return { set: street3d, setOpts: { cam3, tod: 'night', hilde, walkers: S3WALK(t) }, cam: { x: 0, y: 0, z: 1 },
    screen: [c => street3dLight(c, cam3, t, { tod: 'night', hilde }), c => { if (t > ST[298] - .2) { inkVeil(c, 1220, 120, 560, 380, .4); const k = seg(t, ST[298] - .2, ST[298] + .3); c.save(); c.globalAlpha = k; c.fillStyle = '#111'; rrect(c, 1290, 200, 420, 180, 24); c.fill(); c.font = hudFont(130); c.fillStyle = '#3ae07a'; c.textAlign = 'center'; c.fillText('23:12', 1500, 338); bloom(c, 1500, 290, 280, '60,255,120', .25); hudText(c, 'Freitag', 1500, 440, 40, '#fff', 'center'); c.restore(); } }], vignette: .35 };
});
shot(at(299), '18f Tisch sieben', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -300, z: 1.3 }, { x: 80, y: -300, z: 1.5 });
  const sous = P(Object.assign({}, PEOPLE.sous, { hat: 'toque' }), t, { x: -60, expr: Object.assign({ browUp: .4 }, talkMouth(t, ST[301], ST[301] + 1.8) || { mouth: 'grin' }), arms: { l: arm(.3, -.3), r: t > ST[301] ? arm(1.9, -.4) : arm(.5, -1.2) } });
  const plates = c => { for (let i = 0; i < 4; i++) clayRoulade(c, -340 + i * 140 + 400, -226, .55, { steam: true, t: t + i }); };
  return { set: proKitchen, setOpts: { tod: 'service', extra: plates }, cam, behind: [c => { for (let i = 0; i < 3; i++) heatLamp(c, 0 + i * 160 + 100, -470, t, true); }], front: [c => personW(c, sous), c => { const w = P(PEOPLE.waiterA, t, { x: 520 + Math.sin(t * 2) * 60, legs: walkLegs(t, 9).legs, expr: { mouth: 'smile' }, arms: { r: arm(1.25, -1.75), l: arm(.2, -.2) } }); personW(c, w); const [hx, hy] = drawPersonHand(w, 1); tray(c, hx, hy - 10, 1, t); }, c => { const ck = P(PEOPLE.cook, t, { x: -420, expr: { mouth: 'smile' }, arms: { l: arm(.6, -1.2), r: arm(.8 + Math.sin(t * 8) * .2, -1.3) } }); personW(c, ck); }],
    screen: [c => kitchenLight(c, cam, t, { steamy: true }), c => { if (t > ST[301]) { const [x, y] = toScreen(cam, 1, 400, -300); hudBadge(c, t, { t0: ST[301] + .1, t1: ST[302] - .1, x, y: y - 140, text: 'Tisch 7 · 2× Omas Roulade', color: HUD.accent }); } }], vignette: .3 };
});
shot(at(302), '18g Du lächelst', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 0, camDx: 80, z: 3.5, side: 'r', y: -262 }), smile = seg(t, ST[303] - .2, ST[303] + .5);
  const noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: smile > .5 ? 'smile' : 'soft', lid: .15 + smile * .15, look: -.2, browUp: .2 } });
  return { set: salon, setOpts: { tod: 'evening', hz: -95, midY: -40, midGuests: fullGuests(t) }, cam: g.cam, behind: [c => noahW(c, noah, false)], screen: [c => salonLight(c, g.cam, t, { tod: 'evening', hz: -95 })], vignette: .3 };
});
shot(at(304), '18h Und du?', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -280, z: 1.3 }, { x: 0, y: -270, z: 1.45 }), endK = seg(t, ST[307] - .2, ST[307] + .6);
  const noah = noahP(t, { x: 0, outfit: 'classic', expr: { mouth: 'smile', look: 0, browUp: .3 }, arms: { l: arm(.55, -.5), r: arm(.55, -.5) } });
  return { set: salon, setOpts: { tod: 'golden' }, cam, front: [c => noahW(c, noah)],
    screen: [c => salonLight(c, cam, t, { tod: 'golden' }), c => { if (endK < 1) { c.save(); c.globalAlpha = 1 - endK; hudBadge(c, t, { t0: ST[305] + .1, x: W / 2, y: 110, text: '70.000 € – und du?', color: HUD.ink, size: 40 });
      const opt = (x, t0, ic, s, col) => { const e = hudEnv(t, t0, null); if (e.k <= 0) return; c.save(); c.translate(x, 520); c.scale(e.s, e.s); c.fillStyle = '#fff'; rrect(c, -230, -150, 460, 300, 30); c.fill(); c.lineWidth = 4; c.strokeStyle = HUD.ink; c.stroke(); c.fillStyle = col; rrect(c, -230, -150, 460, 100, 30); c.fill(); c.fillRect(-230, -80, 460, 30); bigIcon(c, ic, 0, -100, 1.1, '#fff'); hudText(c, s[0], 0, 30, 40, HUD.ink, 'center'); hudText(c, s[1], 0, 90, 30, HUD.muted, 'center'); c.restore(); };
      opt(380, ST[306] + .2, 'star', ['Restaurant', 'aufmachen'], HUD.accent); opt(1540, ST[306] + 1.6, 'euro', ['Geld', 'behalten'], HUD.green); hudText(c, 'oder', W / 2, 250, 54, '#fff', 'center'); c.restore(); }
      if (endK > 0) { c.save(); c.globalAlpha = endK; c.fillStyle = 'rgba(14,10,20,.6)'; c.fillRect(0, 0, W, H);
        const btn = (x, y, t0, ic, s, col) => { const e = hudEnv(t, t0, null); if (e.k <= 0) return; c.save(); c.translate(x, y); c.scale(e.s, e.s); c.fillStyle = col; rrect(c, -260, -70, 520, 140, 70); c.fill(); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke(); c.save(); c.translate(-170, 0); if (ic === 'bell') { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-30, 24); c.quadraticCurveTo(-24, -40, 0, -40); c.quadraticCurveTo(24, -40, 30, 24); c.closePath(); c.fill(); circle(c, 0, 32, 9); c.fill(); const sw = Math.sin(t * 14) * .3; c.rotate(sw); } else { c.fillStyle = '#fff'; rrect(c, -40, -30, 80, 56, 14); c.fill(); c.beginPath(); c.moveTo(-14, 26); c.lineTo(-24, 46); c.lineTo(6, 26); c.fill(); for (let i = 0; i < 3; i++) { circle(c, -18 + i * 18, -2, 6); c.fillStyle = col; c.fill(); } } c.restore(); hudText(c, s, 50, 16, 46, '#fff', 'center'); c.restore(); };
        btn(W / 2, 430, ST[307] + .2, 'comment', 'Kommentieren', '#2f6fb0'); btn(W / 2, 640, ST[308] + .2, 'bell', 'Abonnieren', '#c9252c'); if (t > ST[309]) hudText(c, 'Bis zum nächsten Mal!', W / 2, 880, 56, '#ffd36a', 'center'); c.restore(); } }], vignette: .35 };
});
