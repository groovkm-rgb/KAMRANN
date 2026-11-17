// Still: stone-age Noah sits on a log by a campfire in a night forest.
const NX = -170, FX_X = 250;
defineFilm({
  shots: [
    { name: 'campfire', dur: 1, f(lt, T, t) {
      const noah = c => drawNoah(c, { x: NX, y: 0, k: .5, outfit: 'caveman', sit: true, seatH: 300,
        arms: { l: { a: .45, b: -.75 }, r: { a: 1.15, b: .3 } }, expr: { mouth: 'smile', look: .6 } });
      return { set: stoneAgeForest, setOpts: { tod: 'night' }, cam: { x: 40, y: -700, z: 1.08 }, blur: 4,
        behind: [c => spear(c, -430, .14), c => logSeat(c, NX + 10, 560), noah, c => bonePile(c, -420)],
        front: [c => campfire(c, FX_X, t, .9)], fx: [c => fireGlow(c, FX_X, t, 1)], vignette: .45 };
    } },
  ],
});
