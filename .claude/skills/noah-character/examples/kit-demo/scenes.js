// Demo of the film kit: 3D street (oblique → front dolly), 3D dining room, waist-up Gegenbewegung shot with a card.
mood(0, 12, 'warm');
shot(0, '3D-Straße', (lt, T, t) => {
  const cam3 = s3move(lt / T, { a0: -.85, a1: -.1, d0: 24, d1: 17, f0: 1000, f1: 1150, y0: 3, y1: 1.8, ly0: 8, ly1: 5 }), hilde = { guests: 4, flowers: true };
  return { set: street3d, setOpts: { cam3, tod: 'golden', hilde, walkers: S3WALK(t) }, cam: { x: 0, y: 0, z: 1 }, screen: [c => street3dLight(c, cam3, t, { tod: 'golden', hilde })], vignette: .3 };
});
shot(4, '3D-Saal', (lt, T, t) => {
  const cam3 = r3move(lt / T, {}), noah = r3person(lerp(-2, 1, lt / T), -6.5, c2 => { const p = noahP(t, { x: 0, legs: walkLegs(t, 8).legs, arms: { r: arm(1.25, -1.75, .2), l: arm(.18, -.15) }, expr: { mouth: 'grin' } }); drawNoahDressed(c2, p); const [hx, hy] = noahHandWorld(p, 1); tray(c2, hx, hy - 10, 1.05, t); });
  return { set: room3d, setOpts: { cam3, tod: 'evening', tables: 'full', extra: [noah] }, cam: { x: 0, y: 0, z: 1 }, screen: [c => room3dLight(c, cam3, t, { tod: 'evening' })], vignette: .3 };
});
shot(8, 'Belden yukarı', (lt, T, t) => {
  const g = gegen(lt, T, { x0: 0, camDx: 80, z: 3.5 }), noah = noahP(t, { x: g.x, outfit: 'chef', expr: { mouth: 'smirk' } });
  return { set: salon, setOpts: { tod: 'golden', hz: -95, midY: -40 }, cam: g.cam, behind: [c => noahW(c, noah, false)],
    screen: [c => salonLight(c, g.cam, t, { tod: 'golden', hz: -95 }), c => hudCard(c, t, { t0: 8.5, t1: 11.6, corner: 'tl', w: 520, h: 230, title: 'BEISPIEL', icon: 'calc', color: HUD.accent, draw: (c, k, l) => hudCounter(c, 0, 37000, seg(l, .2, 1.2), 0, 90, 70, { fmt: v => fmtNum(Math.round(v / 100) * 100) + ' €' }) })], vignette: .3 };
});
NOAH_FONTS_READY.then(() => defineFilm({ fadeIn: .3, fadeOut: .6, shots: buildShots() }));
