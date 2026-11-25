// Draft: first 20 s of "Was wäre, wenn du ein Kartell aufgebaut hättest?" (section 01, first half)
const SHOTS = [];
const shot = (name, dur, f) => SHOTS.push({ name, dur, f });
const blank = col => (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = col; c.fillRect(0, 0, W, H); return { base: col }; };
const CUP = { l: { a: .1, b: -.12 }, r: { a: .16, b: -2.45 } };
const VILLA_O = { potX: -1050, loungerX: 500, tableX: 1750, parasolX: 1450, lanterns: [-1500, 900, 2350], ladderX: 150 };
// 1  0.00–3.00  slow glide over the pool onto Noah (boss), eyes on the gate side
shot('01 villa glide', 3.0, (lt, T, t) => { const k = ease(lt / T), v = CAM.mix({ x: 450, y: -1080, z: .42 }, { x: 1180, y: -320, z: 1.3 }, k);
  return { set: villaSet, setOpts: VILLA_O, cam: v, vignette: .18, behind: [c => castShadow(c, 1180, 120, { len: .4 })],
    front: [c => drawNoahK(c, { x: 1180, y: 0, k: .25, ink: 1.8, outfit: 'boss', arms: CUP, bob: Math.sin(t * 2) * 4, expr: { ...KX.paranoid, look: lt > 1.6 ? -.9 : 0 }, holdFront: (c, gl, gr) => kCup(c, gr, 1, t) })],
    screen: [c => villaLight(c, v, t), c => villaFront(c, v, t, { side: -1 })] }; });
// 2  3.00–4.35  garage: three cars, LED strips
shot('02 garage', 1.35, (lt, T, t) => { const v = { x: -60 + lt * 60, y: -470, z: .56 };
  return { set: garageSet, setOpts: { stalls: [-1980, -660, 660, 1980] }, cam: v, vignette: .25,
    behind: [c => { sportsCar(c, -1320, { color: '#c4c7cc' }); suv(c, 0, {}); sportsCar(c, 1320, { color: '#5a1a22' }); }],
    screen: [c => grade(c, { sx: .5, sy: 0, warm: '235,245,255', warmA: .2, cool: '20,25,40', coolA: .25 })] }; });
// 3  4.35–6.95  counting machine riffles notes, untouched coffee, tapping fingers
shot('03 geldzaehler', 2.6, (lt, T, t) => ({ set: blank('#2c2c31'), vignette: .35, screen: [c => moneyCounterShot(c, lt, t)] }));
// 4  6.95–10.95  bedroom: unused bed, curtains closed, Noah peeks through the gap; pen note
shot('04 schlafzimmer', 4.0, (lt, T, t) => { const v = { x: 30 + lt * 20, y: -300, z: 1.3 + lt * .03 };
  return { set: bedroomSet, setOpts: { gapX: 560, bedX: -260 }, cam: v, vignette: .35,
    front: [c => drawNoahK(c, { x: 330, y: 0, k: .25, ink: 1.8, outfit: 'boss', expr: { ...KX.paranoid, look: .9, bags: .8 } })],
    screen: [c => bedroomLight(c, v, t), c => markerText(c, '3 Jahre kein Schlaf', 90, 1010, 66, clamp((lt - 1.4) / 1.4), { rot: -.04 }),
      c => markerLine(c, [90, 1035, 600, 1025], clamp((lt - 2.8) / .5), { w: 6 })] }; });
// 5  10.95–12.30  eye ECU: CCTV monitor reflected in the pupil
shot('05 gesicht', 1.35, (lt, T, t) => ({ set: blank('#1c1f26'), vignette: 0, screen: [c => faceShot(c, lt, t)] }));
// 6  12.30–13.80  CCTV: a car slows down outside
shot('06 kamera', 1.5, (lt, T, t) => ({ set: blank('#888'), vignette: 0, screen: [c => cctvShot(c, lt, t)] }));
// 7  13.80–14.80  hand squeezes the cup
shot('07 tasse', 1.0, (lt, T, t) => ({ set: blank('#ccc'), vignette: .3, screen: [c => cupShot(c, lt, t)] }));
// 8  14.80–16.00  rear-view mirror, a car follows ("Polizei")
shot('08 spiegel', 1.2, (lt, T, t) => ({ set: blank('#ddd'), vignette: .3, screen: [c => mirrorShot(c, lt, t)] }));
// 9  16.00–17.30  deadbolt turned ("Rivale")
shot('09 schloss', 1.3, (lt, T, t) => ({ set: blank('#3b3430'), vignette: .35, screen: [c => lockShot(c, lt, t)] }));
// 10 17.30–18.70  phone vibrating face down
shot('10 handy', 1.4, (lt, T, t) => ({ set: blank('#e4e2de'), vignette: .35, screen: [c => phoneShot(c, lt, t)] }));
// 11 18.70–20.00  SIM card snapped ("bester Freund")
shot('11 sim', 1.3, (lt, T, t) => ({ set: blank('#26282d'), vignette: .4, screen: [c => simShot(c, lt, t)] }));
NOAH_FONTS_READY.then(() => defineFilm({ shots: SHOTS }));
