// PART 2: 3:53 – 8:17 (Team, Monatskosten, Break-even, ein Teller, Eröffnung, erster Monat, Nachts googeln)
// ---------------- 7. TEAM (233.7 – 272.1) ----------------
mood(233.7, 252.7, 'light'); mood(252.7, 272.1, 'tension');
cue(ST[81] + .1, 'room', -30, { d: 4 }); cue(ST[83] + .4, 'pop', -17); cue(ST[84] + .3, 'counter', -21, { d: 1 }); cue(ST[86] + .2, 'scribble', -18, { d: 1 });
[0, .9, 1.8, 2.7, 3.6].forEach(d => cue(ST[87] + .3 + d, 'pop', -17)); cue(ST[88] + .2, 'register', -14); cue(ST[90] + .3, 'scribble', -19, { d: 1.2 }); cue(ST[91] + .1, 'counter', -21, { d: .8 }); cue(ST[93], 'thunk', -14);
const CANDS = [PEOPLE.cook, PEOPLE.guest(5), PEOPLE.waiterA, PEOPLE.guest(8), PEOPLE.lukas, PEOPLE.guest(12), PEOPLE.waiterC];
shot(at(81), '7a Bewerber', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 60, y: -300, z: 1.05 }, { x: 40, y: -290, z: 1.22 });
  const noah = noahP(t, { x: -520, sit: true, seatH: 250, outfit: 'classic', expr: { mouth: 'smile', look: .8 }, arms: { l: arm(.4, -1.1), r: arm(.4, -1.1) } });
  return { set: salon, setOpts: { tod: 'golden', row2: false }, cam, behind: [c => chairBack(c, -520)],
    front: [c => noahW(c, noah, false), c => bankDesk(c, -520, { w: 420, t, monitorX: -140 }), c => { CANDS.forEach((w, i) => personW(c, P(w, t, { x: -120 + i * 150, seed: i * 7, expr: { mouth: i % 3 ? 'soft' : 'smile', look: -.7 }, arms: { l: arm(.2, -.2), r: arm(.2, -.2) } }), { alpha: .22 })); }],
    screen: [c => salonLight(c, cam, t, { tod: 'golden' })], vignette: .3 };
});
shot(at(83), '7b Mindestlohn', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 300, camDx: 70, z: 3.4, side: 'r', y: -262 });
  const ck = P(PEOPLE.cook, t, { x: g.x, expr: { mouth: 'soft', look: -.4 }, arms: { l: arm(.2, -.2), r: arm(.2, -.2) } });
  return { set: salon, setOpts: { tod: 'golden', hz: -95, midY: -40 }, cam: g.cam, behind: [c => personW(c, ck, false)],
    screen: [c => salonLight(c, g.cam, t, { tod: 'golden', hz: -95 }), c => hudCard(c, t, { t0: ST[83] + .3, t1: ST[85] - .1, corner: 'tl', w: 620, h: 360, title: 'MINDESTLOHN 2026', icon: 'clock', color: HUD.blue,
      draw: (c, k, l, w, h) => { hudText(c, '13,90 € / Std.', 0, 64, 58, HUD.ink); if (t > ST[84]) hudCalc(c, ['13,90 € × 173 Std.', '≈ 2.409 € brutto'], seg(t, ST[84], ST[84] + 1.6), 0, 140, 40, { result: true }); } })], vignette: .32 };
});
shot(at(85), '7c Guter Küchenchef', (lt, T, t) => {
  const g = gegen(lt, T, { x0: -300, camDx: 70, z: 3.3, side: 'l', dir: -1, y: -262 });
  const chef = P(PEOPLE.chef, t, { x: g.x, expr: { mouth: 'smile', lid: .35, look: .3, browUp: .3 }, arms: { l: arm(.6, -2.3), r: arm(.6, -2.3) }, tilt: -.05 });
  return { set: proKitchen, setOpts: { tod: 'service' }, cam: g.cam, behind: [c => personW(c, chef, false)],
    screen: [c => kitchenLight(c, g.cam, t), c => { inkVeil(c, 1060, 160, 760, 640, .4); const k = seg(t, ST[85] + .6, ST[85] + 1.6); handText(c, 'Mindestlohn?', 1450, 260, 50, INK.chalk, k); handCross(c, 1270, 260, 1630, 260, seg(t, ST[85] + 1.7, ST[85] + 2.1), { t });
      const k2 = seg(t, ST[86] + .2, ST[86] + 1.2); handArrow(c, 1330, 680, 1560, 420, k2, { t, col: '#a8e0a0', w: 9 }); handText(c, '€€€', 1480, 600, 70, '#a8e0a0', seg(t, ST[86] + .8, ST[86] + 1.4)); }], vignette: .32 };
});
const TEAM = [['Küchenchef', PEOPLE.chef], ['Sous-Chef', PEOPLE.sous], ['Koch', PEOPLE.cook], ['Spüler', PEOPLE.lukas], ['Service', PEOPLE.waiterA], ['Service', PEOPLE.waiterB], ['Service', PEOPLE.waiterC]];
shot(at(87), '7d Das Team', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -300, z: 1.12 }, { x: 0, y: -295, z: 1.28 });
  const times = [0, .9, 1.8, 2.7, 3.6, 3.6, 3.6].map(d => ST[87] + .3 + d);
  return { set: proKitchen, setOpts: { tod: 'service' }, cam, front: [c => TEAM.forEach(([n, w], i) => { const k = clamp((t - times[i]) / .35); if (k <= 0) return; c.save(); c.translate(0, (1 - easeBack(k)) * 60); c.globalAlpha = Math.min(1, k * 2); personW(c, P(w, t, { x: -690 + i * 230, seed: i * 5, expr: { mouth: i === 3 ? 'grin' : 'smile' }, arms: i === 0 ? { l: arm(.6, -2.3), r: arm(.6, -2.3) } : RELAX })); c.restore(); })],
    screen: [c => kitchenLight(c, cam, t), ...TEAM.map(([n], i) => c => { const [x, y] = toScreen(cam, 1, -690 + i * 230, -420); hudBadge(c, t, { t0: [0, .9, 1.8, 2.7, 3.6, 3.7, 3.8][i] + ST[87] + .4, t1: ST[89] - .1, x, y: y - 20, text: n, color: i < 3 ? HUD.accent : i === 3 ? '#8a8e94' : HUD.blue, size: 24 }); }),
      c => hudCard(c, t, { t0: ST[88] + .1, t1: ST[89] + .2, corner: 'tl', w: 520, h: 220, title: 'PERSONAL', icon: 'people', color: HUD.blue, draw: (c, k, l) => { hudCounter(c, 0, 21000, seg(l, .1, 1), 0, 76, 60, { fmt: v => fmtNum(Math.round(v / 100) * 100) + ' €' }); hudText(c, 'brutto pro Monat', 0, 120, 26, HUD.muted); } })], vignette: .3 };
});
shot(at(89), '7e Sozialabgaben', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 0, camDx: 60, z: 3.2, side: 'r', y: -262 });
  const noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: t > ST[92] ? 'grim' : 'flat', worry: seg(t, ST[91], ST[92]) * .6, look: -.3, sweat: t > ST[92] ? ((t - ST[92]) * .6) % 1 : 0 } });
  return { set: proKitchen, setOpts: { tod: 'service' }, cam: g.cam, behind: [c => { for (let i = 0; i < 4; i++) personW(c, P(TEAM[i + 1][1], t, { x: g.x - 260 + i * 140, seed: i * 3, k: .22, expr: { mouth: 'soft' } }), false); }], front: [c => noahW(c, noah, false)],
    screen: [c => kitchenLight(c, g.cam, t), c => hudCard(c, t, { t0: ST[89] + .2, t1: ST[94] - .2, corner: 'tl', w: 640, h: 400, title: 'ARBEITGEBER ZAHLT', icon: 'calc', color: HUD.accent,
      draw: (c, k, l, w, h) => { hudCalc(c, [[{ s: '   21.000 €' }, { s: '  brutto', col: HUD.muted }], [{ s: '+ ~20 %' }, { s: '  Sozialabgaben', col: HUD.muted }], '──────────', '≈ 25.000 € / Monat'], seg(t, ST[90], ST[91] + 1.2), 0, 46, 42, { result: true }); if (t > ST[92]) hudText(c, 'jeden Monat · nur Personal', 0, 290, 26, '#d0302a'); } })], vignette: .34 };
});
// ---------------- 8. MONATSKOSTEN + BREAK-EVEN (272.1 – 333.5) ----------------
mood(272.1, 301.5, 'tension'); mood(301.5, 333.5, 'tension2');
cue(ST[94] + .1, 'whoosh', -16, { d: .5 }); cue(ST[94] + 4.8, 'pop', -16); cue(ST[94] + 5.6, 'scribble', -18, { d: .5 });
[95, 96, 97, 98, 99].forEach(i => cue(ST[i] + .1, 'pop', -17)); cue(ST[100] + .1, 'counter', -20, { d: .9 }); cue(ST[101] + .3, 'scribble', -18, { d: .6 }); cue(ST[102] + .05, 'stamp', -8);
cue(ST[104] + .5, 'pop', -17); cue(ST[106] + .5, 'counter', -20, { d: 1 }); cue(ST[108] + .3, 'scribble', -18, { d: 1.2 }); cue(ST[109] + .2, 'pop', -17); cue(ST[110] + .2, 'pop', -17);
for (let i = 0; i < 31; i++) cue(ST[112] + .2 + i * .085, 'tick', -24, { f: 3000 + (i % 3) * 300 }); cue(ST[114], 'stamp', -12); cue(ST[115], 'stamp', -11); cue(ST[116], 'stamp', -10); cue(ST[117] + .3, 'thunk', -16);
shot(at(94), '8a Ehrlich rechnen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -340, y: -200, z: 2.0 }, { x: -330, y: -190, z: 2.5 });
  const noah = noahP(t, { x: -320, sit: true, seatH: 250, outfit: 'classic', expr: { mouth: 'flat', look: .3, lid: .25 }, arms: { l: reach(-1, -320, -360, -150, { sit: true, up: true }), r: reach(1, -320, -250, -148, { sit: true, up: true }) } });
  return { set: salon, setOpts: { tod: 'night', sconces: true }, cam, behind: [c => chairBack(c, -320, { col: '#4a1a26' })], front: [c => noahW(c, noah, false), c => dineTable(c, -320, { w: 380, items: (c, tp) => { tableLamp(c, 130, tp, t, true, .9); paperStack(c, -110, tp + 4, 8, .9); calculator(c, -20, tp + 2, 1.1); if (t > ST[94] + 4.6) { clayBlob(c, 70, tp - 12, 18, 13, '#c8a060', { seed: 99 }); } } }),
    c => { c.save(); c.beginPath(); c.rect(-800, -800, 1000, 672); c.clip(); drawNoahDressed(c, Object.assign({}, noah, { onlyArms: true })); c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true }), c => { const [x, y] = toScreen(cam, 1, -250, -160); bloom(c, x + 60, y - 60, 500, '255,180,90', .25); if (t > ST[94] + 4.6) { const [px, py] = toScreen(cam, 1, -250, -170); handText(c, 'Kartoffel', px + 160, py - 150, 40, INK.chalk, seg(t, ST[94] + 4.8, ST[94] + 5.5)); handArrow(c, px + 120, py - 120, px + 30, py - 30, seg(t, ST[94] + 5, ST[94] + 5.6), { t, w: 5 }); handText(c, '0 € gekauft', px + 160, py - 90, 30, '#ff8a7a', seg(t, ST[94] + 5.6, ST[94] + 6.3)); } }], vignette: .5 };
});
shot(at(95), '8b Kosten pro Monat', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 2050, y: -280, z: 1.3 }, { x: 2150, y: -285, z: 1.45 });
  const rows = [['Miete + Nebenkosten', 6200], ['Personal', 25000], ['Strom & Gas', 2500], ['Kredit', 1600], ['Sonstiges', 1700]];
  const noah = noahP(t, { x: 2480, outfit: 'classic', expr: { mouth: t > ST[102] ? 'o' : 'flat', worry: t > ST[100] ? .55 : .2, look: -.8 }, arms: { l: arm(.5, -1.5), r: arm(.5, -1.5) } });
  return { set: salon, setOpts: { tod: 'night', sconces: true, candles: true }, cam, front: [c => noahW(c, noah)],
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true }), c => screenDim(c, .22),
      c => costPanel(c, t, { t0: ST[95] - .1, t1: ST[103] - .2, x: 100, y: 90, w: 930, rowH: 74, title: 'KOSTEN PRO MONAT', icon: 'table', color: HUD.accent, rows, times: [95, 96, 97, 98, 99].map(i => ST[i] + .1), tSum: ST[100] + .1, tCircle: ST[100] + .9 }),
      c => { const k = seg(t, ST[97] + 1.2, ST[97] + 2); if (k > 0 && t < ST[99]) hudBadge(c, t, { t0: ST[97] + 1.2, t1: ST[98] + .5, x: 1220, y: 400, text: 'Profiküche frisst Energie', color: '#c0392b', size: 26 }); },
      c => { if (t > ST[101]) handText(c, 'JEDEN MONAT', 600, 900, 54, '#ff8a7a', seg(t, ST[101] + .2, ST[101] + .8)); if (t > ST[102] - .05) titleStamp(c, t, ST[102], ['FIX'], { x: 1500, y: 860, size: 110, rot: -.12, paper: false }); }], vignette: .4,
    shake: t > ST[102] + .1 && t < ST[102] + .4 ? 10 : 0 };
});
shot(at(103), '8c Ware 30 %', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 2500, y: -330, z: 1.4 }, { x: 2650, y: -335, z: 1.5 }, k => k);
  const crates = c => { for (let i = 0; i < 6; i++) { const x = 2200 + i * 150; c.beginPath(); c.rect(x - 64, -90, 128, 90); fs(c, '#c8a070', 3); for (let j = 0; j < 4; j++) line(c, [x - 64, -70 + j * 20, x + 64, -70 + j * 20], 2, 'rgba(90,60,30,.4)'); for (let k = 0; k < 4; k++) clayBlob(c, x - 42 + k * 28, -100, 20, 16, ['#e05a3a', '#e8c040', '#5a9a3a', '#c8a060', '#8a4a8a'][(i + k) % 5], { seed: i * 4 + k + 20 }); } };
  return { set: proKitchen, setOpts: { tod: 'service', extra: crates }, cam,
    screen: [c => kitchenLight(c, cam, t), c => { inkVeil(c, 120, 100, 900, 860, .5); const k = seg(t, ST[104] + .4, ST[104] + 2); handText(c, 'UMSATZ', 560, 160, 50, INK.chalk, seg(t, ST[103], ST[103] + .6));
      pieChart(c, 560, 520, 240, [{ v: 70, label: 'Fixkosten', sub: '37.000 €', col: '#2f6fb0' }, { v: 30, label: 'Ware', sub: '30 %', col: '#e0663a', pop: true }], k, { size: 30, lab: 40 }); },
      c => hudCard(c, t, { t0: ST[106] + .2, t1: ST[108] - .1, corner: 'tr', w: 620, h: 330, title: 'BREAK-EVEN', icon: 'calc', color: HUD.green, draw: (c, k, l, w, h) => { hudCalc(c, ['37.000 € ÷ 0,7', '≈ 53.000 € Umsatz'], seg(l, .1, 1.6), 0, 50, 44, { result: true }); if (t > ST[107]) hudText(c, 'netto · pro Monat', 0, 190, 30, HUD.accent); } })], vignette: .35 };
});
shot(at(108), '8d Pro Abend, pro Gast', (lt, T, t) => {
  const g = gegen(lt, T, { x0: -200, camDx: 80, z: 3.3, side: 'r', y: -262 });
  const noah = noahP(t, { x: g.x, outfit: 'waiter', expr: { mouth: 'flat', look: -.5, browUp: .2 } });
  return { set: salon, setOpts: { tod: 'evening', hz: -95, midY: -40 }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => salonLight(c, g.cam, t, { tod: 'evening', hz: -95, noMotes: true }), c => hudCard(c, t, { t0: ST[108] + .1, t1: ST[111] + .2, corner: 'tl', w: 700, h: 420, title: 'PRO ABEND', icon: 'calc', color: HUD.blue,
      draw: (c, k, l, w, h) => { hudCalc(c, ['53.000 € ÷ 26 Abende', '≈ 2.000 € pro Abend'], seg(t, ST[108] + .2, ST[109] + 1.2), 0, 50, 40, { result: true }); if (t > ST[110]) hudCalc(c, ['2.000 € ÷ 65 € pro Gast', '≈ 31 Gäste'], seg(t, ST[110] + .2, ST[111] + .6), 0, 190, 40, { result: true }); } })], vignette: .32 };
});
shot(at(112), '8e 31 von 40 Plätzen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -300, z: 1.0 }, { x: 0, y: -310, z: 1.1 });
  return { set: salon, setOpts: { tod: 'evening' }, cam, screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => screenDim(c, .45),
    c => { const k = seg(t, ST[112] + .2, ST[112] + .2 + 31 * .085); chairGrid(c, 330, 330, 10, 4, 31, k, { s: 82 }); hudText(c, fmtNum(Math.floor(k * 31 + 1e-6)) + ' / 40', W / 2, 150, 70, '#fff', 'center');
      ['JEDEN.', 'EINZELNEN.', 'ABEND.'].forEach((s, i) => { const t0 = ST[114 + i]; if (t < t0) return; const kk = clamp((t - t0) / .15), sc = lerp(1.8, 1, easeOut(kk)); c.save(); c.translate(420 + i * 540, 900); c.rotate(-.05 + i * .03); c.scale(sc, sc); hudText(c, s, 0, 0, 84, '#ffd36a', 'center'); c.restore(); });
      if (t > ST[117]) { hudBadge(c, t, { t0: ST[117] + .2, x: W / 2, y: 1000, text: 'Gewinn bis hier: 0 €', color: '#d0302a', size: 32 }); } }], vignette: .4 };
});
// ---------------- 9. EIN TELLER (333.5 – 384.3) ----------------
mood(333.5, 354.8, 'curious'); mood(354.8, 377.0, 'tension'); mood(377.0, 384.3, 'light');
cue(ST[118] + .2, 'clink', -18); cue(ST[119] + .2, 'pop', -16); cue(ST[121] + .3, 'pop', -17); cue(ST[123] + .2, 'pop', -17); cue(ST[124] + .3, 'register', -15);
[125, 126, 127].forEach(i => cue(ST[i] + .2, 'pop', -17)); cue(ST[129] + .1, 'coin', -12); cue(ST[131] + .2, 'thunk', -16); cue(ST[134] + .8, 'pour', -20, { d: 2 }); cue(ST[135] + .5, 'clink', -16);
const PLATE = (c, x, y, s, t) => { c.save(); c.translate(x, y); c.scale(s, s); platePorcelain(c, 0, 0, 110); clayShape(c, () => { c.beginPath(); c.ellipse(0, -6, 64, 12, 0, 0, Math.PI * 2); }, '#7a2a1a', { bounds: [-64, -18, 128, 24], seed: 140, lw: 1.5 }); clayShape(c, () => { c.beginPath(); c.roundRect(-40, -46, 70, 36, 12); }, '#8a4a2a', { bounds: [-40, -46, 70, 36], seed: 141 }); clayBlob(c, 42, -20, 20, 16, '#e8d8a8', { seed: 142 }); for (let i = 0; i < 7; i++) clayBlob(c, -60 + i * 18, -8 - (i % 2) * 6, 6, 5, i % 2 ? '#5a9a3a' : '#f4f1ea', { seed: 150 + i, lw: 1 }); clayBlob(c, -10, -60, 16, 8, 'rgba(250,245,230,.9)', { seed: 160 }); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-24 + k * 14, -66 - (k % 2) * 6, 4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); } c.restore(); };
function plateClose(lt, T, t, o = {}) {
  const cam = camPush(lt, T, { x: o.x0 ?? 0, y: -150, z: o.z0 ?? 4.6 }, { x: o.x1 ?? 30, y: -152, z: o.z1 ?? 5.0 });
  return { set: salon, setOpts: { tod: 'evening' }, cam, front: [c => dineTable(c, 0, { w: 620, items: (c, tp) => { PLATE(c, 0, tp + 8, 1, t); cutlery(c, -130, tp + 10, -1, 1.4); cutlery(c, 130, tp + 10, 1, 1.4); wineGlass(c, 150, tp, .95, { wine: '#6a0e1e', glint: .5 }); waterGlass(c, 200, tp, .8); candle(c, -170, tp, t, .9); if (o.coin) { const k = easeOut(seg(t, ST[129], ST[129] + .4)); clayBlob(c, -60, tp - 80 + 70 * k, 14, 14 * (.4 + .6 * k), '#e8b84a', { seed: 170 }); } if (o.tag) { c.save(); c.translate(-90, tp - 60); c.rotate(-.2); c.beginPath(); c.rect(-30, -14, 60, 28); fs(c, '#fffaf0', 1.5); c.font = hudFont(14); c.fillStyle = '#a0302a'; c.textAlign = 'center'; c.fillText('38 €', 0, 5); c.restore(); line(c, [-62, tp - 66, -20, tp - 20], 1.5, '#8a7a5a'); } } })], screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true })].concat(o.screen || []), vignette: .38 };
}
shot(at(118), '9a Ein Teller', (lt, T, t) => plateClose(lt, T, t, { x0: -40, x1: 20, z0: 4.0, z1: 4.9, tag: t > ST[119] + .2 }));
shot(at(120), '9b Mehrwertsteuer', (lt, T, t) => plateClose(lt, T, t, { x0: 60, x1: 90, z0: 4.4, z1: 4.6, tag: true, screen: [c => hudCard(c, t, { t0: ST[120] + .1, t1: ST[125] - .2, corner: 'tl', w: 680, h: 430, title: 'MEHRWERTSTEUER 2026', icon: 'calc', color: HUD.green,
  draw: (c, k, l, w, h) => { hudText(c, 'Speisen', 0, 52, 34, HUD.muted); hudText(c, '7 %', 230, 56, 50, HUD.green); if (t > ST[121] + 1.5) { hudText(c, 'statt 19 %', 360, 52, 30, HUD.muted); handCross(c, 356, 42, 520, 42, seg(t, ST[121] + 1.8, ST[121] + 2.2), { t, shadow: false, w: 5 }); } if (t > ST[122]) hudText(c, 'dauerhaft', 0, 104, 26, HUD.accent);
    if (t > ST[123]) { hudText(c, 'Getränke', 0, 168, 34, HUD.muted); hudText(c, '19 %', 230, 172, 50, '#d0302a'); } if (t > ST[124]) hudCalc(c, ['38 € → 2,49 € MwSt'], seg(t, ST[124] + .2, ST[124] + 1.5), 0, 260, 36, { result: true }); } })] }));
shot(at(125), '9c Wohin geht das Geld', (lt, T, t) => plateClose(lt, T, t, { x0: 200, x1: 240, z0: 3.2, z1: 3.35, tag: true, screen: [c => screenDim(c, .35), c => {
  const shown = t < ST[125] ? 0 : t < ST[126] ? 2 : t < ST[127] ? 3 : t < ST[129] ? 4 : 5, k = shown / 5 + clamp((t - [ST[125], ST[125], ST[126], ST[127], ST[129]][Math.max(0, shown - 1)]) / .6) * 0;
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 40; c.fillStyle = '#fbf6ea'; rrect(c, 60, 50, 1060, 980, 30); c.fill(); c.restore(); c.fillStyle = HUD.accent; rrect(c, 60, 50, 1060, 100, 30); c.fill(); c.fillRect(60, 120, 1060, 30); hudText(c, '38 € – WOHIN GEHT DAS GELD?', 590, 118, 48, '#fff', 'center');
  pieChart(c, 560, 600, 290, [{ v: 2.49, label: 'MwSt', sub: '2,49 €', col: '#8a8e94' }, { v: 10.6, label: 'Ware', sub: '10,60 €', col: '#e0663a' }, { v: 11.7, label: 'Personal', sub: '11,70 €', col: '#2f6fb0' }, { v: 12.0, label: 'Rest', sub: '12,00 €', col: '#5a4a7a' }, { v: 1.21, label: 'Gewinn', sub: '≈ 1 €', col: '#3d8a4f', pop: true }], Math.min(1, shown / 5 + .0001), { size: 34, lab: 46 }); }] }));
shot(at(130), '9d Ein Euro', (lt, T, t) => plateClose(lt, T, t, { x0: -40, x1: -60, z0: 5.6, z1: 6.2, coin: true, screen: [c => hudCard(c, t, { t0: ST[133] + .1, t1: ST[134] + .2, corner: 'tr', w: 560, h: 240, title: 'GEWINN', icon: 'calc', color: HUD.green, draw: (c, k, l) => { hudText(c, '1 – 3 %', 0, 84, 74, HUD.green); hudText(c, 'vom Umsatz · viele Restaurants', 0, 130, 24, HUD.muted); } }),
  c => { if (t > ST[130]) { inkVeil(c, 1060, 640, 700, 380, .35); handText(c, '1 € von 38 €', 1410, 800, 60, '#ffd36a', seg(t, ST[130] + .2, ST[131] + .4)); } }] }));
shot(at(134), '9e Getränke', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 120, y: -210, z: 2.2 }, { x: 150, y: -215, z: 2.4 }), pour = seg(t, ST[134] + .8, ST[134] + 2.4);
  const wa = P(PEOPLE.waiterB, t, { x: -90, expr: { mouth: 'grin', look: .7 }, arms: { l: arm(.3, -.3), r: reach(1, -90, 60, -230 + pour * 30, { hand: .5 }) } });
  return { set: salon, setOpts: { tod: 'evening' }, cam, behind: [c => chairBack(c, 260)], front: [c => personW(c, P(PEOPLE.guest(21), t, { x: 260, sit: true, seatH: 250, expr: { mouth: 'soft', look: -.8 }, arms: { l: arm(.4, -1.1), r: arm(.4, -1.1) } }), false), c => dineTable(c, 200, { w: 380, items: (c, tp) => { wineGlass(c, 90, tp, .9, { wine: pour > .3 ? '#6a0e1e' : null }); PLATE(c, 220, tp + 6, .5, t); } }), c => { personW(c, wa); const [hx, hy] = drawPersonHand(wa, 1); c.save(); c.translate(hx, hy + 10); c.rotate(1.2 * pour + .2); bottle(c, 0, 40, .95); c.restore(); }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => hudCard(c, t, { t0: ST[135] - .2, t1: ST[136] + .3, corner: 'tl', w: 600, h: 260, title: 'MARGE', icon: 'calc', color: '#6a0e1e', draw: (c, k, l, w) => { hudText(c, 'Getränke', 0, 54, 40, '#6a0e1e'); hudText(c, '> Essen', 230, 54, 40, HUD.ink); hudText(c, 'Speisen 7 % · Getränke 19 %', 0, 120, 26, HUD.muted); } })], vignette: .34 };
});
// ---------------- 10. ERÖFFNUNG (384.3 – 431.9) ----------------
mood(384.3, 401.3, 'hope'); mood(401.3, 406, 'light'); mood(406, 431.9, 'dark');
cue(ST[136] + .3, 'room', -28, { d: 4.5 }); cue(ST[138], 'crowd', -20, { d: 8 }); cue(ST[139] + .3, 'clink', -16, null, { every: .5, n: 4 }); cue(ST[141] + .4, 'flash', -18, null, { every: .9, n: 3 });
cue(ST[142] + .2, 'tick', -26, { f: 2400 }, { every: 1, n: 4 }); cue(ST[144] + .2, 'register', -16); cue(ST[145] + .4, 'scribble', -18, { d: .8 });
cue(ST[147], 'tick', -24, { f: 2600 }, { every: 1, n: 3 }); [148, 149, 150].forEach(i => cue(ST[i] + .15, 'pop', -16)); cue(ST[152] + .2, 'pop', -16); cue(ST[153] + 1.5, 'pop', -20, null, { every: .12, n: 20 }); cue(ST[154] + .2, 'buzz', -16); cue(ST[155] + .1, 'thunk', -15);
shot(at(136), '10a HILDE von außen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -900, z: .7 }, { x: 0, y: -620, z: .86 });
  return { set: hildeExterior, setOpts: { tod: 'golden', guests: 0, lit: .4 }, cam, screen: [c => cityLight(c, cam, t, { tod: 'golden' })], vignette: .3 };
});
const fullGuests = (t, talk = true) => (c, tx, i) => { for (const dx of [-90, 90]) drawPerson(c, P(PEOPLE.guest((Math.abs(Math.round(tx / 37)) * 5 + (dx > 0 ? 3 : 0)) % 41), t, { x: tx + dx, sit: true, seatH: 250, seed: i * 3 + dx, expr: talk ? (talkMouth(t + i + dx, 0, 999) || { mouth: 'smile' }) : { mouth: 'smile' }, arms: { l: arm(.4, -1.1), r: Math.sin(i + dx) > .5 ? arm(1.1, -1.7) : arm(.4, -1.1) } })); };
shot(at(138), '10b Eröffnung', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -200, y: -300, z: 1.0 }, { x: 150, y: -280, z: 1.25 }), nx = lerp(-400, 300, ease(lt / T)), wl = walkLegs(t, 8);
  const noah = noahP(t, { x: nx, legs: wl.legs, bob: wl.bob, expr: { mouth: 'grin', look: .3 }, arms: { r: arm(1.25, -1.75, .2), l: arm(.18, -.15) } });
  return { set: salon, setOpts: { tod: 'evening', midGuests: fullGuests(t), row2Guests: (c, tx) => fullGuests(t)(c, tx, tx / 300) }, cam,
    front: [c => { noahW(c, noah); const [hx, hy] = noahHandWorld(noah, 1); tray(c, hx, hy - 10, 1.05, t); }],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => { for (let i = 0; i < 3; i++) { const t0 = ST[141] + .4 + i * .9; if (t > t0 && t < t0 + .12) { c.fillStyle = `rgba(255,255,255,${.5 * (1 - (t - t0) / .12)})`; c.fillRect(0, 0, W, H); } } },
      c => iconRow(c, t, [{ t0: ST[141] + .1, icon: 'people', title: 'Freunde', lines: [''], col: HUD.blue }, { t0: ST[141] + .9, icon: 'people', title: 'Familie', lines: [''], col: '#8a5a6a' }, { t0: ST[141] + 1.8, icon: 'eye', title: 'Instagram', lines: [''], col: '#c0397b' }, { t0: ST[141] + 2.8, icon: 'person', title: 'Kollegen', lines: [''], col: HUD.green }], 60, 50, { t1: ST[142] - .1, w: 300, h: 90, cols: 4, gap: 30 })], vignette: .3 };
});
shot(at(142), '10c Zwei Uhr nachts', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 0, camDx: 70, z: 3.3, side: 'r', y: -262 });
  const noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: t > ST[143] ? 'grin' : 'smile', lid: .3, look: -.3, browUp: t > ST[143] ? .4 : 0 }, arms: { l: arm(.6, -2.3), r: arm(.6, -2.3) } });
  return { set: proKitchen, setOpts: { tod: 'night' }, cam: g.cam, behind: [c => noahW(c, noah, false)], screen: [c => kitchenLight(c, g.cam, t, { tod: 'night' }), c => { inkVeil(c, 150, 140, 520, 560, .35); clockBig(c, 410, 380, 160, 2, 0 + lt * .5); }], vignette: .45 };
});
shot(at(144), '10d Nicht bezahlt', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 200, y: -260, z: 1.6 }, { x: 260, y: -265, z: 1.8 });
  const mom = P(PEOPLE.mother, t, { x: 150, expr: { mouth: 'grin' }, arms: { l: arm(1.2, -1.2), r: arm(.3, -.3) } }), uncle = P(PEOPLE.guest(6), t, { x: 520, expr: { mouth: 'grin', lid: .4 }, arms: { l: arm(.3, -.3), r: arm(1.6, -.8) } });
  const noah = noahP(t, { x: 330, expr: { mouth: 'smile', worry: .3, look: -.3 }, arms: { l: arm(.4, -.4), r: arm(.3, -.3) } });
  return { set: salon, setOpts: { tod: 'evening', midGuests: fullGuests(t) }, cam, front: [c => personW(c, mom), c => noahW(c, noah), c => personW(c, uncle)],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => hudCard(c, t, { t0: ST[144] + .2, t1: ST[147] - .1, corner: 'tl', w: 560, h: 330, title: 'BEZAHLT?', icon: 'calc', color: '#d0302a',
      draw: (c, k, l, w, h) => { pieChart(c, 120, 140, 100, [{ v: 50, col: '#3d8a4f' }, { v: 50, col: '#d0302a', pop: true }], seg(l, .2, 1.2)); hudText(c, '50 % bezahlt', 260, 110, 30, HUD.green); hudText(c, '50 % „Familie“', 260, 170, 30, '#d0302a'); } })], vignette: .32 };
});
shot(at(147), '10e Es wird ruhig', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -100, y: -300, z: 1.05 }, { x: 100, y: -295, z: 1.15 }, k => k), few = [6, 9, 11][Math.max(0, Math.min(2, t < ST[149] ? 0 : t < ST[150] ? 1 : 2))];
  const sparse = (c, tx, i) => { if (rnd(i * 3 + few) < few / 26) drawPerson(c, P(PEOPLE.guest(i + 3), t, { x: tx - 90, sit: true, seatH: 250, expr: { mouth: 'flat' }, arms: { l: arm(.4, -1.1), r: arm(.4, -1.1) } })); };
  const noah = noahP(t, { x: lerp(-300, 200, lt / T), legs: walkLegs(t, 4).legs, expr: { mouth: 'flat', look: .4, worry: .3 } });
  return { set: salon, setOpts: { tod: 'evening', midGuests: sparse, row2Guests: (c, tx) => sparse(c, tx, Math.round(tx / 100)) }, cam, front: [c => noahW(c, noah)],
    screen: [c => salonLight(c, cam, t, { tod: 'evening', noMotes: true }), c => { if (t < ST[151]) { inkVeil(c, 60, 60, 760, 420, .45); barChart(c, 120, 120, 620, 260, [{ label: 'Di', v: 6, col: '#d0302a' }, { label: 'Mi', v: 9, col: '#d0302a' }, { label: 'Do', v: 11, col: '#d0302a' }, { label: 'nötig', v: 31, col: '#3d8a4f' }], seg(t, ST[148], ST[150] + 1.2), { size: 28 }); } },
      c => hudCard(c, t, { t0: ST[152] + .1, t1: ST[153] + 1.2, corner: 'tr', w: 460, h: 200, title: 'MENÜ', icon: 'table', color: '#5a3a24', draw: (c) => { hudText(c, '95 €', 0, 90, 80, HUD.ink); } }),
      c => { if (t > ST[153] + 1.4) { inkVeil(c, 1000, 300, 880, 560, .5); hudText(c, '20 andere Restaurants', 1440, 360, 40, '#fff', 'center'); for (let i = 0; i < 20; i++) { const k = clamp((t - ST[153] - 1.5 - i * .12) / .2); if (k <= 0) continue; c.save(); c.translate(1120 + (i % 5) * 160, 450 + Math.floor(i / 5) * 110); c.scale(k, k); c.beginPath(); c.ellipse(0, 0, 52, 14, 0, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 3; c.strokeStyle = HUD.ink; c.stroke(); c.beginPath(); c.arc(0, -10, 14, Math.PI, 0); c.fillStyle = '#f4ecd6'; c.fill(); c.stroke(); for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(-8 + j * 8, -26, 4, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.stroke(); } c.restore(); } } }], vignette: .35 };
});
shot(at(154), '10f Google-Bewertung', (lt, T, t) => {
  const g = gegen(lt, T, { x0: -400, camDx: 70, z: 3.3, side: 'l', dir: -1, y: -262 }), shame = t > ST[157];
  const noah = noahP(t, { x: g.x, expr: { mouth: shame ? 'grim' : 'o', worry: .6, look: .7, sweat: shame ? ((t - ST[157]) * .8) % 1 : 0 }, arms: { l: arm(.4, -1.3), r: arm(.6, -1.8) } });
  return { set: salon, setOpts: { tod: 'evening', hz: -95, midY: -40 }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => salonLight(c, g.cam, t, { tod: 'evening', hz: -95, noMotes: true }), c => phone(c, 1400, 560, 400, 780, .05, (c2, w, h) => appReview(c2, w, h, { k: seg(t, ST[156], ST[156] + 2.4) }), { clock: '22:47' }),
      c => { if (shame) { handText(c, 'DU', 760, 200, 90, '#ff8a7a', seg(t, ST[157] + .3, ST[157] + .7)); handArrow(c, 760, 260, 650, 400, seg(t, ST[157] + .4, ST[157] + 1), { t, col: '#ff8a7a', w: 8 }); } }], vignette: .34 };
});
// ---------------- 11. ERSTER MONAT (431.9 – 469.5) ----------------
mood(431.9, 469.5, 'dark');
cue(ST[158] + .3, 'pop', -16); cue(ST[159] + .2, 'pop', -16); cue(ST[160], 'whoosh', -12, { d: .8, lo: 160, hi: 2000, rev: true }); cue(ST[163] + .3, 'stamp', -14); cue(ST[165] + .2, 'register', -18); cue(ST[167] + .2, 'keys', -14); cue(ST[167] + .6, 'carstart', -20);
cue(ST[169] + .2, 'crowd', -22, { d: 9 }); cue(ST[171] + .5, 'door', -14);
shot(at(158), '11a Erster Monat', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -320, y: -200, z: 1.9 }, { x: -340, y: -190, z: 2.3 }), dyS = -(250) - (NOAH.HEM + 40) - 60;
  const noah = noahP(t, { x: -320, sit: true, seatH: 250, outfit: 'classic', breath: .5, arms: { l: arm(.4, -1.2), r: arm(.4, -1.2) }, expr: { mouth: 'grim', lid: .4, worry: .6, look: .5 }, tilt: -.05 });
  return { set: salon, setOpts: { tod: 'night' }, cam, behind: [c => chairBack(c, -320, { col: '#4a1a26' })], front: [c => noahW(c, noah, false), c => dineTable(c, -320, { w: 380, items: (c, tp) => { tableLamp(c, 130, tp, t, true, .9); paperStack(c, -100, tp + 4, 14, .9); calculator(c, 0, tp + 2, 1.1); } })],
    screen: [c => salonLight(c, cam, t, { tod: 'night', noMotes: true }), c => hudCard(c, t, { t0: ST[158] + .2, t1: ST[162] - .2, corner: 'tl', w: 700, h: 430, title: 'MONAT 1', icon: 'table', color: '#d0302a',
      draw: (c, k, l, w, h) => { barChart(c, 0, 10, 380, 280, [{ label: 'Umsatz', v: 22000, col: HUD.green, text: '22.000 €' }, { label: 'Kosten', v: 43000, col: '#d0302a', text: '> 40.000 €' }], seg(t, ST[158] + .3, ST[159] + 1.2), { size: 22 }); if (t > ST[160]) { const s = 1 + (1 - easeOut(seg(t, ST[160], ST[160] + .3))) * .7; c.save(); c.translate(560, 170); c.scale(s, s); hudText(c, '−21.000 €', 0, 0, 52, '#d0302a', 'center'); c.restore(); } if (t > ST[161]) hudText(c, 'in einem Monat', 560, 230, 26, HUD.muted, 'center'); } })], vignette: .5 };
});
shot(at(162), '11b Kontokorrentkredit', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -60, y: -250, z: 1.6 }, { x: -30, y: -250, z: 1.8 });
  const b = bankScene(t, cam, { noahExpr: { mouth: 'grim', worry: .6, look: .6 }, advExpr: Object.assign({ browUp: .3 }, talkMouth(t, ST[163], ST[164]) || { mouth: 'flat' }) });
  b.screen.push(c => hudCard(c, t, { t0: ST[163] + .2, t1: ST[166] - .1, corner: 'tr', w: 620, h: 340, title: 'KONTOKORRENTKREDIT', icon: 'calc', color: '#8a5a3a', draw: (c, k, l) => { hudText(c, '= Dispo für Firmen', 0, 40, 30, HUD.muted); if (t > ST[164]) hudCounter(c, 0, 30000, seg(t, ST[164], ST[164] + .8), 0, 130, 70, { fmt: v => fmtNum(Math.round(v / 100) * 100) + ' €' }); if (t > ST[165]) hudText(c, 'mit richtig hohen Zinsen', 0, 200, 30, '#d0302a'); } }));
  return b;
});
shot(at(166), '11c Auto verkaufen', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 100, y: -280, z: 1.45 }, { x: 160, y: -285, z: 1.6 }), give = ease(seg(t, ST[167], ST[167] + .8));
  const buyer = P(PEOPLE.guest(17), t, { x: 380, expr: { mouth: 'smile', look: -.6 }, arms: { l: arm(.3, -.3), r: reach(1, 380, lerp(280, 230, give), -170) } });
  const noah = noahP(t, { x: -40, outfit: 'classic', expr: { mouth: 'flat', worry: .5, look: .6, lid: .3 }, arms: { l: arm(.2, -.2), r: reach(1, -40, lerp(100, 210, give), -170) } });
  return { set: city, setOpts: { tod: 'day' }, cam, behind: [c => { car(c, -420, { color: '#c0392b', s: 1 }); c.save(); c.translate(-420, -230); c.rotate(-.05); c.beginPath(); c.rect(-80, -30, 160, 60); fs(c, '#ffe14a', 2.5); c.font = hudFont(28); c.fillStyle = '#c0392b'; c.textAlign = 'center'; c.fillText('VERKAUFT', 0, 10); c.restore(); }],
    front: [c => personW(c, buyer), c => noahW(c, noah), c => { const [hx, hy] = noahHandWorld(noah, 1); keys(c, hx + 4, hy + 6, 1); }], screen: [c => cityLight(c, cam, t, { tod: 'day' }), c => hudBadge(c, t, { t0: ST[166] + .1, t1: ST[167] + .2, x: 400, y: 120, text: 'Monat 2: wieder minus', color: '#d0302a' })], vignette: .3 };
});
shot(at(168), '11d Mutter', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -230, z: 2.1 }, { x: 20, y: -235, z: 2.35 }), give = ease(seg(lt, .4, 1.6));
  const mom = P(PEOPLE.mother, t, { x: -150, expr: { mouth: 'flat', worry: .7, lid: .3, look: .6 }, arms: { l: arm(.3, -.3), r: reach(1, -150, lerp(-60, 10, give), -170) } });
  const noah = noahP(t, { x: 180, outfit: 'classic', expr: { mouth: 'grim', worry: .5, look: -.5, lid: .45 }, arms: { l: reach(-1, 180, lerp(110, 40, give), -168), r: arm(.2, -.2) }, tilt: .06 });
  return { set: livingRoom, cam, front: [c => personW(c, mom), c => noahW(c, noah), c => { const [hx, hy] = drawPersonHand(mom, 1); envelope(c, hx + 14, hy + 6, .9, '#f4f0e0'); c.font = hudFont(12); c.fillStyle = '#5a5048'; c.textAlign = 'center'; c.fillText('5.000 €', hx + 14, hy + 14); }],
    screen: [c => grade(c, { sx: .7, sy: .2, warm: '255,190,130', warmA: .2, cool: '50,50,80', coolA: .3 })], vignette: .4 };
});
shot(at(169), '11e Küchenchef kündigt', (lt, T, t) => {
  const cam = camPush(lt, T, { x: 0, y: -290, z: 1.5 }, { x: 40, y: -285, z: 1.7 }), leave = seg(t, ST[171] + 1.4, ST[172] - .1), wl = walkLegs(t, 8);
  const chef = P(Object.assign({}, PEOPLE.chef, leave > 0 || t > ST[171] + .4 ? { top: { type: 'shirt', col: '#e8e4dc', col2: '#fff' } } : {}), t, { x: lerp(-180, 900, leave), legs: leave > 0 ? wl.legs : null, expr: Object.assign({ look: .6, worry: .3 }, talkMouth(t, ST[171] + .8, ST[171] + 1.8) || { mouth: 'flat' }), arms: t > ST[171] && t < ST[171] + .5 ? { l: arm(1.2, -1.6), r: arm(1.2, -1.6) } : RELAX });
  const noah = noahP(t, { x: 220, outfit: 'chef', expr: { mouth: t > ST[169] + 1.5 ? 'o' : 'soft', browUp: .7, worry: .4, look: -.6 }, arms: { l: arm(.3, -.4), r: arm(.3, -.4) } });
  return { set: proKitchen, setOpts: { tod: 'service' }, cam, front: [c => { if (t > ST[171] + .4) { c.save(); c.translate(-80, -10); c.rotate(.3); c.beginPath(); c.moveTo(-60, 0); c.lineTo(60, 0); c.lineTo(50, -30); c.lineTo(-50, -30); c.closePath(); fs(c, '#1f1d20', 3); c.restore(); } personW(c, chef); }, c => noahW(c, noah)],
    screen: [c => kitchenLight(c, cam, t, { steamy: true }), c => hudBadge(c, t, { t0: ST[169] + .2, t1: ST[170] - .2, x: 380, y: 120, text: 'Samstag · mitten im Service', color: HUD.accent })], vignette: .35 };
});
// ---------------- 12. NACHTS GOOGELN (469.5 – 497.0) ----------------
mood(469.5, 497.0, 'dark2');
cue(ST[172] + .2, 'typing', -20, { d: 1.5 }); cue(ST[175] + .3, 'pop', -16); cue(ST[176] + .2, 'pop', -16); cue(ST[177] + 1, 'pop', -22, null, { every: .1, n: 25 }); cue(ST[180] + 1.2, 'thunk', -14);
shot(at(172), '12a Im Bett googeln', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -100, y: -260, z: 1.6 }, { x: -60, y: -250, z: 1.9 });
  const noah = noahP(t, { x: -380, sit: true, seatH: 160, outfit: 'classic', expr: { mouth: 'flat', lid: .35, worry: .4, look: .4 }, arms: { l: arm(.5, -1.9), r: arm(.6, -2.0) }, tilt: .05 });
  return { set: bedroomNight, cam, front: [c => noahW(c, noah, false), c => { c.beginPath(); c.roundRect(-680, -150, 760, 150, 30); fs(c, '#3a3a5a', 3); for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-640 + i * 150, -150); c.quadraticCurveTo(-600 + i * 150, -110, -560 + i * 150, -150); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke(); } const [hx, hy] = noahHandWorld(noah, 1); c.beginPath(); c.rect(hx - 6, hy - 40, 26, 46); fs(c, '#16161a', 2); }],
    screen: [c => { const [x, y] = toScreen(cam, 1, -380, -310); bloom(c, x, y, 420, '150,190,255', .45); }, c => grade(c, { sx: .3, sy: .4, warm: '150,190,255', warmA: .25, cool: '5,5,25', coolA: .55 }), c => phone(c, 1380, 560, 400, 780, .04, (c2, w, h) => appSearch(c2, w, h, { k: seg(t, ST[172] + .2, ST[173] + .6), k2: seg(t, ST[173] + .3, ST[175]), t }), { dark: true, clock: '03:12', bg: '#121418' })], vignette: .6 };
});
shot(at(175), '12b Statistik', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -380, y: -250, z: 2.6 }, { x: -380, y: -255, z: 2.9 });
  const noah = noahP(t, { x: -560, sit: true, seatH: 160, outfit: 'classic', expr: { mouth: 'grim', lid: .3, worry: .6, look: .7 }, arms: { l: arm(.5, -1.9), r: arm(.6, -2.0) } });
  return { set: bedroomNight, cam, front: [c => noahW(c, noah, false)], screen: [c => grade(c, { sx: .2, sy: .4, warm: '150,190,255', warmA: .25, cool: '5,5,25', coolA: .5 }), c => screenDim(c, .2),
    c => { if (t < ST[177] + .2) { c.save(); c.globalAlpha = 1 - seg(t, ST[177], ST[177] + .2); hudCard(c, t, { t0: ST[175] + .1, t1: ST[177] + .2, corner: 'tr', w: 900, h: 640, title: 'INSOLVENZEN GASTRONOMIE', icon: 'table', color: '#d0302a',
      draw: (c, k, l, w, h) => { barChart(c, 10, 30, w - 30, 400, [{ label: '2011', v: 2950, col: '#8a8e94', text: '' }, { label: '2019', v: 1800, col: '#8a8e94', text: '' }, { label: '2021', v: 1150, col: '#8a8e94', text: '' }, { label: '2023', v: 2200, col: '#8a8e94', text: '' }, { label: '2025', v: 2900, col: '#d0302a', text: '≈ 2.900' }], seg(l, .2, 2.2), { size: 24 }); if (t > ST[176]) hudText(c, 'höchster Stand seit 2011', 10, 520, 34, '#d0302a'); } }); c.restore(); }
      if (t > ST[177] + .2) { hudCard(c, t, { t0: ST[177] + .2, t1: ST[178] + .3, corner: 'tr', w: 900, h: 640, title: '2024 + 2025: AUFGEGEBEN', icon: 'people', color: '#5a4a4a', draw: (c, k, l, w, h) => { const n = Math.floor(seg(l, .5, 4.5) * 245); for (let i = 0; i < 245; i++) { const x = (i % 20) * 42, y = 20 + Math.floor(i / 20) * 34; c.fillStyle = i < n ? '#5a4a4a' : HUD.line; rrect(c, x, y, 30, 26, 4); c.fill(); if (i < n) { c.fillStyle = '#f2ede2'; c.fillRect(x + 12, y + 8, 6, 12); } } hudText(c, '≈ ' + fmtNum(Math.round(seg(l, .5, 4.5) * 24500 / 100) * 100) + ' Betriebe', 10, h - 6, 40, HUD.ink); hudText(c, '1 Symbol = 100', w, h - 6, 22, HUD.muted, 'right'); } }); } }], vignette: .5 };
});
shot(at(178), '12c Der Nächste', (lt, T, t) => {
  const cam = camPush(lt, T, { x: -380, y: -300, z: 4.6 }, { x: -380, y: -300, z: 5.4 });
  const noah = noahP(t, { x: -380, sit: true, seatH: 160, outfit: 'classic', expr: { mouth: 'grim', lid: .2, worry: .8, look: .2, sweat: (t * .5) % 1 }, arms: { l: arm(.5, -1.9), r: arm(.6, -2.0) } });
  return { set: bedroomNight, cam, front: [c => noahW(c, noah, false)], screen: [c => { bloom(c, W * .62, H * .7, 700, '150,190,255', .4); }, c => grade(c, { sx: .6, sy: .7, warm: '150,190,255', warmA: .3, cool: '5,5,25', coolA: .6 }),
    c => { if (t > ST[180] + .8) { inkVeil(c, 1100, 100, 760, 520, .55); for (let i = 0; i < 24; i++) { c.fillStyle = '#5a4a4a'; rrect(c, 1200 + (i % 6) * 90, 160 + Math.floor(i / 6) * 70, 64, 52, 6); c.fill(); } const k = seg(t, ST[180] + 1.2, ST[180] + 1.6); c.save(); c.translate(1200 + 5 * 90 + 32, 160 + 3 * 70 + 26); c.scale(1 + (1 - easeOut(k)) * 1.5, 1 + (1 - easeOut(k)) * 1.5); c.globalAlpha = k; c.fillStyle = '#d0302a'; rrect(c, -32, -26, 64, 52, 6); c.fill(); hudText(c, 'HILDE', 0, 8, 16, '#fff', 'center'); c.restore(); } }], vignette: .65 };
});
