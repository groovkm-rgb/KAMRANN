// Still: Magdalenian camp in front of the rock shelter at golden hour, people at work, mammoths on the steppe behind.
STZ_FONTS_READY.then(() => defineFilm({ shots: [{ name: 'camp', dur: 1, f: () => {
  const t = 4.0, cam = { x: -150, y: -560, z: .58 };
  return { set: campSet, setOpts: { tod: 'dusk', rockX: -1100, sunX: .66, sunY: .52, hill: 1900 }, cam, blur: 0, vignette: 0,
    behind: [c => {
      layer(c, cam, .3, c => { const b = layerBase(cam, SHZ, .3); for (let i = 0; i < 12; i++) rentier(c, 1500 + i * 70, { t, y: b - 2, sc: .16, walk: i * 1.7, dark: .5, darkCol: '90,50,60' }); });
      layer(c, cam, .6, c => { const b = layerBase(cam, SHZ, .6); mammut(c, 380, { t, y: b - 4, sc: .58, walk: 1.0, s: -1 }); mammut(c, 760, { t, y: b - 6, sc: .32, walk: 2.2, s: -1 }); mammut(c, 980, { t, y: b - 2, sc: .5, graze: .8, trunk: .3, s: -1 }); });
      for (let i = 0; i < 6; i++) vogel(c, 300 + i * 130, -1500 - (i % 3) * 60, { t: t + i * .3, sc: 1.6 });
      // camp
      hideOnStakes(c, -1450); meatRack(c, -1700); woodPile(c, -1150); skinTent(c, 650, .9); bones(c, 120, 4);
      hearth(c, -500, t, 1, 1.2);
      tribe(c, { who: 'oma', x: -1550, k: .25, expr: { mouth: 'smile', look: 1 }, arms: { r: { a: 1.4, b: .5 }, l: { a: 1.1, b: .7 } }, item: { k: 'flint' } }, t);
      rock(c, -900, 0, 70, 4, '#7a746c');
      tribe(c, { who: 'meister', x: -900, pose: 'sit', k: .25, expr: { mouth: 'flat', look: .5 }, arms: { l: { a: .7, b: 1.2 }, r: { a: 1.1, b: 1.0 } }, item: 'antler', item2: 'flint' }, t);
      tribe(c, { who: 'erzaehler', x: -700, pose: 'sit', k: .25, expr: { mouth: 'smile', look: 1 }, arms: { r: { a: 1.2, b: .3 } } }, t);
      tribe(c, { who: 'frau1', x: -250, pose: 'kneel', k: .25, expr: { mouth: 'smile', look: -1 }, arms: { r: { a: .9, b: .5 } }, item: 'meat' }, t);
      tribe(c, { who: 'kind1', x: -60, k: .25, expr: { mouth: 'o', browUp: .6, look: 1 }, arms: { r: { a: 1.2, b: .2 } } }, t);
      tribeSide(c, { who: 'mann1', x: -1950, walk: 2.1, item: { k: 'stick', rot: 1.2 } }, t);
      tribe(c, { who: 'jaeger', x: 250, k: .25, expr: { mouth: 'flat', look: 1 }, arms: { r: { a: .5, b: -.2 } }, item: { k: 'spear', rot: .02 } }, t);
      tribe(c, { who: 'teen2', x: 420, k: .25, expr: { mouth: 'smile', look: 1 }, arms: { l: { a: 1.6, b: .3 } } }, t);
      tribe(c, { who: 'frau3', x: -2150, pose: 'sit', k: .25, babyInArm: 1, expr: { mouth: 'smile', eyes: 'closed' } }, t);
      wolf(c, 950, { t, lie: 1, s: -1 });
    }],
    screen: [c => {
      const [fx, fy] = w2s(cam, -500, -100); smokeWisp(c, fx, fy - 40, t, { n: 7, h: 700, r: 90, a: .2, drift: 220 }); sparks(c, fx, fy, t, { n: 14, h: 300, size: 3 });
      lightMap(c, '230,200,190', [{ x: fx, y: fy, r: 800, col: '255,150,70', a: .55 }]);
      steppeFront(c, cam, t, { tod: 'dusk' });
      grade(c, { warm: '255,160,90', warmA: .4, cool: '60,30,80', coolA: .28, sx: .72, sy: .5 });
      snowfall(c, t, 40, .6, 1);
      vignette2(c, .5); grain(c, t, .05);
    }] };
} }] }));
