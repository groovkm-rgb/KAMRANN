// 16:9 example stills (no background blur, Noah small in the world, cinematic light).
const K = .25, INK = 1.8;
const V = (x, y, z = 1) => ({ x, y, z });
defineFilm({ shots: [
  { name: 'sunny forest + animals', dur: 1, f(lt, T, t) {
    const v = V(0, -360);
    return { set: forestSet, cam: v, blur: 0, vignette: .28,
      behind: [c => castShadow(c, 520, 200, { dir: 1 }), c => deer(c, 520, { s: -1, t }), c => owl(c, -720, -430, { t }),
        c => castShadow(c, -250, 110, { dir: 1 }), c => drawNoahSide(c, { x: -250, k: K, ink: INK, walk: t * 8 }),
        c => castShadow(c, -480, 100, { dir: 1 }), c => dog(c, -480, { t, walk: true }), c => fox(c, 260, { t, s: -1 }), c => rabbit(c, 90, { t, s: -1 })],
      fx: [c => bird(c, -60, -760, { t }), c => bird(c, 140, -820, { t: t + .3, color: '#d9603a' })],
      screen: [c => forestFrame(c, v, t), c => forestLight(c, v, t)] };
  } },
  { name: 'stone age night camp', dur: 1, f(lt, T, t) {
    const v = V(0, -360), NX = -330, FXX = 60;
    return { set: stoneAgeForest, setOpts: { caveX: 420, path: false }, cam: v, blur: 0, vignette: .4,
      behind: [c => mammoth(c, 720, { t, s: -1, sc: .5 }), c => { c.save(); c.translate(-560, 0); c.scale(.55, .55); spear(c, 0, .14); c.restore(); },
        c => { c.save(); c.translate(NX, 0); c.scale(.55, .55); logSeat(c, 20, 560); c.restore(); },
        c => drawNoah(c, { x: NX, k: K * .95, ink: INK, outfit: 'caveman', sit: true, seatH: 300, arms: { l: { a: .45, b: -.75 }, r: { a: 1.15, b: .3 } }, expr: { mouth: 'smile', look: .6 } }),
        c => { c.save(); c.translate(-620, 0); c.scale(.5, .5); bonePile(c, 0); c.restore(); }],
      front: [c => campfire(c, FXX, t, .5)], fx: [c => fireGlow(c, FXX, t, 1.2), c => bloom(c, FXX, -90, 260, '255,170,80', .45)],
      screen: [c => forestFrame(c, v, t, { tod: 'night' }), c => forestLight(c, v, t, { tod: 'night' })] };
  } },
  { name: 'office', dur: 1, f(lt, T, t) {
    const v = V(0, -380);
    return { set: office, cam: v, blur: 0, vignette: .3,
      behind: [c => officeChair(c, 360, -1), c => castShadow(c, -80, 110, { dir: 1, alpha: .22 }), c => drawNoah(c, { x: -80, k: K, ink: INK, arms: { l: { a: .13, b: -.08 }, r: { a: 2.5, b: .35 } } }), c => cat(c, -380, { t })],
      front: [c => desk(c, 300, { t }), c => plantPot(c, 820, 1.1)],
      screen: [c => officeLight(c, v, t)] };
  } },
  { name: 'city golden hour', dur: 1, f(lt, T, t) {
    const v = V(0, -400), P = { ...FOREST.day, leaf: '#5e9a48', leafDark: '#3f7a3c', leafLight: '#9ad06a' };
    return { set: city, setOpts: { tod: 'golden' }, cam: v, blur: 0, vignette: .3,
      behind: [c => streetTree(c, -900, P), c => streetLamp(c, -560), c => bench(c, -320), c => bin(c, 120), c => hydrant(c, 520), c => bike(c, 820), c => trafficLight(c, 1060, 'green'),
        c => castShadow(c, -40, 110, { dir: 1, len: 3 }), c => drawNoahSide(c, { x: -40, k: K, ink: INK, walk: t * 8 }), c => castShadow(c, 260, 100, { dir: 1, len: 3 }), c => dog(c, 260, { t, walk: true, color: '#e9e2d6' }),
        c => pigeon(c, 420, t), c => pigeon(c, 470, t + .4)],
      front: [c => car(c, -600, { color: '#2f6fb0' }) ],
      screen: [c => cityLight(c, v, t, { tod: 'golden' })] };
  } },
  { name: 'animal sheet', dur: 1, f(lt, T, t) {
    const v = V(0, -330);
    return { set: forestSet, setOpts: { path: false, log: false }, cam: v, blur: 0, vignette: .25,
      behind: [c => mammoth(c, -620, { t, sc: .85 }), c => horse(c, 40, { t, sc: .62 }), c => bear(c, 430, { t, sc: .8 }), c => deer(c, 860, { t, s: -1, sc: .85 })],
      front: [c => rabbit(c, -900, { t }), c => fox(c, -330, { t }), c => cat(c, 130, { t }), c => dog(c, 640, { t }), c => owl(c, 280, -60, { t })],
      fx: [c => bird(c, -200, -760, { t }), c => bird(c, 60, -800, { t: t + .3, color: '#d9603a' })],
      screen: [c => forestLight(c, v, t)] };
  } },
]});
