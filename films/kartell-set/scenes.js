// Set-test stills for "Was wäre, wenn du ein Kartell aufgebaut hättest?" (one still per 1 s shot)
const SHOTS = [];
const still = (name, f) => SHOTS.push({ name, dur: 1, f });
const blankSet = col => (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = col; c.fillRect(0, 0, W, H); return { base: col }; };
const NOAH_CUP = { l: { a: .1, b: -.12 }, r: { a: .16, b: -2.45 } };
// a1: villa wide, noon
still('a1 villa wide', (lt, T, t) => { const v = { x: 300, y: -1080, z: .4 };
  return { set: villaSet, setOpts: {}, cam: v, vignette: .18,
    behind: [c => castShadow(c, -350, 120, { len: .4, alpha: .3 })],
    front: [c => drawNoahK(c, { x: -350, y: 0, k: .25, ink: 1.8, outfit: 'boss', arms: NOAH_CUP, expr: KX.paranoid, holdFront: (c, gl, gr) => kCup(c, gr, 1, t) })],
    screen: [c => villaLight(c, v, t), c => villaFront(c, v, t, { side: -1 })] }; });
// a2: villa, Noah with coffee, eyes on the gate
still('a2 villa noah', (lt, T, t) => { const v = { x: -2250, y: -330, z: 1.3 };
  return { set: villaSet, setOpts: { potX: -3150, loungerX: -700 }, cam: v, vignette: .2,
    behind: [c => castShadow(c, -2080, 120, { len: .4, alpha: .32 })],
    front: [c => drawNoahK(c, { x: -2080, y: 0, k: .25, ink: 1.8, outfit: 'boss', arms: NOAH_CUP, expr: KX.paranoid, holdFront: (c, gl, gr) => kCup(c, gr, 1, t + .3) })],
    screen: [c => villaLight(c, v, t), c => villaFront(c, v, t, { side: 1 })] }; });
// b: warehouse, Noah carries a box, tired
still('b lager', (lt, T, t) => { const v = { x: -120, y: -470, z: 1.0 };
  return { set: lagerSet, setOpts: { clockX: -850, palletsX: -1500, forkX: 520 }, cam: v, vignette: .3,
    behind: [c => castShadow(c, -380, 130, { len: .2, alpha: .35 })],
    front: [c => drawNoahK(c, { x: -380, y: 0, k: .25, ink: 1.8, outfit: 'lager', expr: KX.tired, arms: { l: { a: .12, b: -.5 }, r: { a: .12, b: -.5 } },
      hold: c => { kRect(c, -190, -890, 380, 360, '#c69c62', NOAH.W * .8, NOAH.out); c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(-190, -890, 380, 60); kRect(c, -40, -890, 80, 360, '#d8b888', 0); line(c, [-40, -890, -40, -530], 3, 'rgba(0,0,0,.2)'); line(c, [40, -890, 40, -530], 3, 'rgba(0,0,0,.2)'); } })],
    screen: [c => lagerLight(c, v, t), c => lagerFront(c, v, t, { side: 1 })] }; });
// c1: car line-up with Noah for scale
const LINE = [['hatch', -2160], ['van', -961], ['sport', 293], ['suv', 1514]];
const drawCar = (c, k, x, t) => ({ hatch: hatchback, van: panelVan, sport: sportsCar, suv }[k])(c, x, { t });
still('c1 autos', (lt, T, t) => { const v = { x: -470, y: -420, z: .37 };
  return { set: parkSet, setOpts: { stalls: [-2700, -1570, -330, 900, 2120], oil: [[-1000, 140], [1500, 160]] }, cam: v, vignette: .2,
    behind: [c => { for (const [k, x] of LINE) drawCar(c, k, x, t); castShadow(c, -2900, 120, { len: .3 }); }],
    front: [c => drawNoahK(c, { x: -2900, y: 0, k: .25, ink: 1.8, outfit: 'aufstieg', expr: KX.serious })],
    screen: [c => parkLight(c, v, t)] }; });
// c2: closer look at details (sports car + SUV)
still('c2 autos nah', (lt, T, t) => { const v = { x: 900, y: -260, z: .95 };
  return { set: parkSet, setOpts: { stalls: [-330, 900, 2120], oil: [[1500, 160]] }, cam: v, vignette: .22,
    behind: [c => { drawCar(c, 'sport', 293, t); drawCar(c, 'suv', 1514, t); }], screen: [c => parkLight(c, v, t)] }; });
// d: four outfits next to the reference
still('d outfits', (lt, T, t) => ({ set: blankSet('#efebe3'), cam: { x: 0, y: -215, z: 1.38 }, vignette: 0,
  behind: [c => { const L = [['lager', KX.tired], ['aufstieg', KX.thrill], ['boss', KX.arrogant], ['haft', KX.empty]];
    L.forEach(([o, e], i) => { castShadow(c, -510 + i * 340, 110, { len: 0, alpha: .2 }); drawNoahK(c, { x: -510 + i * 340, y: 0, k: .25, ink: 1.8, outfit: o, expr: e }); }); }],
  screen: [c => { c.font = '700 30px Inter'; c.fillStyle = '#3a3330'; c.textAlign = 'center'; ['LAGER', 'AUFSTIEG', 'BOSS', 'HAFT'].forEach((s, i) => c.fillText(s, W / 2 + (-510 + i * 340) * 1.38, 1050)); }] }));
// e1: table T1 on the dossier page
still('e1 T1', (lt, T, t) => ({ set: blankSet('#3a2a20'), vignette: .35,
  screen: [c => dossierDesk(c, t), c => dossierTable(c, t, { title: 'Zigaretten-Schwarzmarkt', kicker: 'Anlage: Schmuggel und Fälschung', k: 1,
    rows: [['Deutschland 2025', '≈ 1,9 Mrd. Zigaretten'], ['Europa', '≈ 55 Mrd. Zigaretten'], ['Steuerausfall', '≈ 22 Mrd. €']],
    note: 'Quelle: Studie im Auftrag eines Tabakkonzerns',
    mark: (c, w, h, top, rh) => { markerEllipse(c, w - 230, top + 2 * rh - 10, 190, 52, 1); markerText(c, 'Nur Tabak?', 600, top + 3 * rh + 50, 64, 1, { rot: -.06 }); markerLine(c, [640, top + 3 * rh - 20, 700, top + 2 * rh + 40], 1, { w: 5 }); } })] }));
// e2: closing HINWEIS screen (all lines visible)
still('e2 hinweis', (lt, T, t) => ({ set: blankSet('#26282b'), vignette: 0, screen: [c => hinweisScreen(c, 9)] }));
NOAH_FONTS_READY.then(() => defineFilm({ shots: SHOTS }));
