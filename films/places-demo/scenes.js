// 16:9 example stills: profile sheet, stone-age camp, sunny forest with animals, office, city street.
const scaled = (fn, x, sc) => c => { c.save(); c.translate(x, 0); c.scale(sc, sc); c.translate(-x, 0); fn(c); c.restore(); };
defineFilm({
  shots: [
    { name: 'profile sheet', dur: 1, f(lt, T, t) {
      const xs = [-780, -470, -160, 170, 480, 790];
      return { set: 'blank', setOpts: { color: '#efece4' }, cam: { x: 0, y: -400, z: 1.0 }, blur: 0, vignette: .1,
        behind: [c => { for (const x of xs) { ell(c, x, 4, 150, 16); fs(c, 'rgba(0,0,0,.12)'); } },
          c => drawNoah(c, { x: xs[0], k: .5 }),
          c => drawNoahSide(c, { x: xs[1], k: .5, s: 1 }),
          c => drawNoahSide(c, { x: xs[2], k: .5, s: -1 }),
          c => drawNoahSide(c, { x: xs[3], k: .5, walk: 0 }),
          c => drawNoahSide(c, { x: xs[4], k: .5, walk: Math.PI / 2 }),
          c => drawNoahSide(c, { x: xs[5], k: .5, outfit: 'caveman', walk: Math.PI * 1.5 })] };
    } },
    { name: 'stone age camp', dur: 1, f(lt, T, t) {
      const NX = -330, FXX = 120;
      return { set: stoneAgeForest, setOpts: { tod: 'night', caveX: 350 }, cam: { x: 0, y: -430, z: 1.0 }, blur: 4, vignette: .45,
        behind: [scaled(c => mammoth(c, 720, { t, s: -1 }), 720, .5), c => spear(c, -620, .14), c => logSeat(c, NX + 10, 560),
          c => drawNoah(c, { x: NX, k: .5, outfit: 'caveman', sit: true, seatH: 300, arms: { l: { a: .45, b: -.75 }, r: { a: 1.15, b: .3 } }, expr: { mouth: 'smile', look: .6 } }),
          c => bonePile(c, -700)],
        front: [c => campfire(c, FXX, t, .9)], fx: [c => fireGlow(c, FXX, t, 1)] };
    } },
    { name: 'sunny forest + animals', dur: 1, f(lt, T, t) {
      return { set: forestSet, cam: { x: 0, y: -430, z: 1.0 }, blur: 5,
        behind: [c => deer(c, 520, { s: -1, t }), c => rabbit(c, 230, { s: -1, t }), c => drawNoahSide(c, { x: -300, k: .5, walk: t * 8, expr: { mouth: 'smile' } }),
          c => dog(c, -650, { t, walk: true })],
        fx: [c => bird(c, -100, -880, { t }), c => bird(c, 120, -960, { t: t + .3, color: '#d9603a' }), c => { for (let i = 0; i < 5; i++) { circle(c, -900 + i * 420, 80 + (i % 2) * 120, 14); fs(c, ['#f2c531', '#e98aa6', '#fff'][i % 3], 4); } }] };
    } },
    { name: 'office', dur: 1, f(lt, T, t) {
      return { set: 'office', cam: { x: 0, y: -430, z: 1.0 }, blur: 6,
        behind: [c => drawNoah(c, { x: -150, k: .5, arms: { l: { a: .13, b: -.08 }, r: { a: 2.5, b: .35 } }, expr: { mouth: 'smile' } }),
          c => drawNoahSide(c, { x: 350, k: .5, s: -1, expr: { mouth: 'soft' } })] };
    } },
    { name: 'city street', dur: 1, f(lt, T, t) {
      return { set: 'street', setOpts: { tod: 'day' }, cam: { x: 0, y: -430, z: 1.0 }, blur: 5,
        behind: [c => drawNoahSide(c, { x: -120, k: .5, walk: t * 8, expr: { mouth: 'smile' } }), c => dog(c, 250, { t, walk: true, color: '#e9e2d6' })],
        fx: [c => bird(c, 500, -900, { t, color: '#6b6b78' })] };
    } },
  ],
});
