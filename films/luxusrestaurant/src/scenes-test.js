NOAH_FONTS_READY.then(() => defineFilm({ shots: ['evening', 'night', 'golden'].map((tod, i) => ({ name: tod, dur: 4, f(lt, T, t) {
  const cam3 = r3move(lt / T, {}), noah = r3person(lerp(-2, 1, lt / T), -6, c2 => drawNoahDressed(c2, noahP(t, { x: 0, legs: walkLegs(t, 8).legs, arms: { r: arm(1.25, -1.75, .2), l: arm(.18, -.15) }, expr: { mouth: 'grin' } })));
  return { set: room3d, setOpts: { cam3, tod, tables: ['full', 'few', 'empty'][i], extra: [noah] }, cam: { x: 0, y: 0, z: 1 }, screen: [c => room3dLight(c, cam3, t, { tod })], vignette: .3 };
} })) }));
