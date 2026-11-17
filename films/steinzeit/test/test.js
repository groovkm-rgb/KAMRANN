STZ_FONTS_READY.then(() => defineFilm({ shots: [
 { name: 'steppe', dur: 1, f: lt => { const cam = { x: 0, y: -380, z: .55 }; return { set: steppeSet, setOpts: { tod: 'day', hill: 1500 }, cam, vignette: 0,
   behind: [c => { castShadow(c, -400, 600, { alpha: .25 }); mammut(c, -400, { t: lt, walk: lt * 3 }); mammut(c, 400, { t: lt, sc: .55, s: -1 }); rentier(c, 1200, { t: lt, walk: lt * 6 }); wildpferd(c, 1600, { t: lt, graze: 1 }); drawNoahSideE(c, { x: -1200, k: .25, ink: 1.8, era: 2 }); }],
   screen: [c => { steppeFront(c, cam, lt, {}); finish(c, lt); }] }; } },
 { name: 'forest', dur: 1, f: lt => { const cam = { x: 0, y: -330, z: 1.1 }; return { set: forestEdge, cam, vignette: 0,
   behind: [c => { blueberryBush(c, 200, 30, 1); mushroom(c, -200, 40, 1.2); tribeSide(c, { who: 'junge', x: 450, walk: lt * 8 }, lt); drawNoahE(c, { x: -500, k: .25, ink: 1.8, era: 2 }); }],
   screen: [c => { layer(c, cam, 1, c => sunRays(c, 900, -1200, { n: 7, len: 2400, spread: .5, dir: Math.PI / 2 + .45, alpha: .18, t: lt })); finish(c, lt); }] }; } },
 { name: 'camp', dur: 1, f: lt => { const cam = { x: -300, y: -420, z: .75 }; return { set: campSet, setOpts: { tod: 'morning' }, cam, vignette: 0,
   behind: [c => { hideOnStakes(c, 200); meatRack(c, 600); skinTent(c, 1100); woodPile(c, -200); bones(c, 350); hearth(c, -500, lt, 1); tribe(c, { who: 'oma', x: -650, k: .25 }, lt); }],
   screen: [c => finish(c, lt)] }; } },
 { name: 'night', dur: 1, f: lt => ({ set: 'blank', setOpts: { color: '#000' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0, screen: [c => { nightSky(c, lt); finish(c, lt); }] }) },
]}));
