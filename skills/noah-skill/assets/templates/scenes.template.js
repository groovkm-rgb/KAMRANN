// TITLE: __TITLE__
// Shot list (seconds): write it here first, one line per scene.
// 0.0–3.0  ...
// 3.0–6.0  ...
const { F } = K;

// ---------------------------------------------------------------- sets: painted once at 2x, reused by scenes
const ROOM = K.set((g) => {
  K.ceiling(g, { y1: 70 });
  K.wall(g, { y0: 70, y1: 780, color: '#e7c9a0', wainscot: { y: 600, color: '#8b9874' } });
  K.floor(g, { y0: 780, color: '#b06c3c', vp: [960, 300] });
  K.rug(g, [[440, 920], [1480, 920], [1640, 1080], [280, 1080]], { style: 'kilim' });
  K.window(g, 110, 150, 360, 420, { outside: { season: 'winter', time: 'day' }, plant: true });
  F.sedir(g, 560, 1380, 900);
  F.stove(g, 1640, 900);
  F.sign(g, 1180, 200, 300, 90, 'Willkommen');   // in-scene text is always German
});
const STREET = K.set((g) => { K.outdoor(g, { season: 'winter', time: 'day', groundY: 820 }); });

// ---------------------------------------------------------------- scenes
FILM({
  fps: 30, fadeIn: 0.3, fadeOut: 0.5, music: { mood: 'cozy' },
  scenes: [
    { name: 'tea on the sedir', dur: 3, set: ROOM,
      sfx: [[0, 'fire', 0.4, { dur: 3 }], [1.05, 'sip', 0.9], [2.3, 'clink', 0.5]],
      cam: [{ t: 0, x: 960, y: 560, z: 1.1 }, { t: 3, x: 970, y: 540, z: 1.2 }],
      draw(g, t) {
        const arm = K.key(t, [[0.3, K.ARMS.hold], [1.0, K.ARMS.drink], [2.0, K.ARMS.drink], [2.6, K.ARMS.hold]]);
        const tilt = K.key(t, [[0.8, 0], [1.1, -0.5], [1.9, -0.5], [2.2, 0]]);
        const r = K.noah(g, { x: 960, y: 1000, pose: 'sit', outfit: 'villager', eyes: t > 1.05 && t < 1.95 ? 'happy' : 'open', blink: K.blinkAt(t),
          armL: 'rest', armR: arm, holdR: { item: 'tea', tilt }, t });
        K.steam(g, r.hands[1][0], r.hands[1][1] - 60, t, { s: 0.8, a: tilt > -0.1 ? 0.6 : 0 });
      } },
    { name: 'walk outside', dur: 3, set: STREET, in: 'fade',
      sfx: [...K.steps(0, 3, 1.4, 'step-snow', 0.7), [0, 'wind', 0.4, { dur: 3 }]],
      cam: (t) => ({ x: K.lerp(800, 1100, K.sm(t / 3)), y: 600, z: 1.25 }),
      draw(g, t) {
        K.noah(g, { x: K.lerp(600, 1250, t / 3), y: 940, s: 0.9, pose: 'walk', step: t * 1.4, outfit: 'winter', armL: 'swing', armR: 'swing', look: [0.5, 0], t });
        K.snow(g, [0, 0, 1920, 1080], t, { n: 140, size: 1.3 });
      } },
  ],
});
