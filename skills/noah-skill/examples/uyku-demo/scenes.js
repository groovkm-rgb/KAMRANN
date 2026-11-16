// TITLE: 1 Ay Uyumazsan Ne Olur? (demo)
// 12 s horizontal sample: four places, four outfits, one character.
// 0.0–3.0  bedroom at night: lies awake, wall clock spins
// 3.0–6.0  home office by day: tired eyes, bags, drinks coffee at the computer
// 6.0–9.0  snowy village street: staggers along in profile, dizzy stars
// Audio: quirky explainer music (sleepy at the end) + sound effects. In-scene text is German.
// 9.0–12.0 village room: sits on the sedir, dreams of a bed, falls asleep
const { F } = K;

// ---------------------------------------------------------------- sets (painted once)
const BEDROOM = K.set((g) => {
  K.wall(g, { y1: 760, color: '#c9cfe2', wainscot: { y: 560, color: '#7a86a8' } });
  K.floor(g, { y0: 760, color: '#9c6a46', vp: [960, 260] });
  K.rug(g, [[560, 930], [1500, 930], [1640, 1080], [420, 1080]], { style: 'plain', color: '#7a4a6a', color2: '#d8b46a' });
  K.window(g, 150, 170, 360, 420, { outside: { season: 'winter', time: 'night', seed: 4 }, curtains: '#5a6a9a', rows: 2 });
  F.wallClock(g, 1060, 300, 62);
  F.frame(g, 1500, 220, 110, 140);
  F.bed(g, 690, 1440, 930, { frame: '#7a4a2a' });
  F.nightstand(g, 1570, 930); F.lamp(g, 1600, 780, { on: false });
  F.wardrobe(g, 1820, 900, { w: 260, h: 640 });
});
const OFFICE = K.set((g) => {
  K.wall(g, { y1: 740, color: '#ead6b0', wainscot: { y: 560, color: '#8b9874' } });
  K.floor(g, { y0: 740, color: '#b07446', vp: [960, 240] });
  K.window(g, 120, 140, 400, 440, { outside: { season: 'winter', time: 'day', seed: 2 }, plant: true });
  F.calendar(g, 1060, 130, { w: 150, h: 170, label: 'Tag 7', month: 'MÄRZ' });
  F.poster(g, 1260, 80, 200, 260, { title: 'SCHLAF', lines: ['8 Stunden', 'jede Nacht!'], accent: '#3d6ea8', pic: (g2, x, y, w, h) => { g2.fillStyle = '#c8d8f0'; g2.fillRect(x, y, w, h); K.star(g2, x + w * 0.7, y + h * 0.35, 16, 0, '#f6d24a'); g2.fillStyle = '#f6f2dc'; g2.beginPath(); g2.arc(x + w * 0.35, y + h * 0.5, h * 0.3, 0, 7); g2.fill(); } });
  F.shelf(g, 1500, 1880, 330, { items: ['books', 'jar', 'plant'] });
  F.chair(g, 700, 960, { color: '#8a5a34' });
  F.desk(g, 900, 1640, 960, { h: 250 });
  F.computer(g, 1260, 686, { on: true });
  F.note(g, 1380, 400, 'Kaffee!', { s: 0.75, rot: 0.1 });
  F.plant(g, 1780, 960, { s: 1.2 });
});
const STREET = K.set((g) => { K.outdoor(g, { season: 'winter', time: 'day', groundY: 820, seed: 12 }); });
const ROOM = K.set((g) => {
  K.ceiling(g, { y1: 70 });
  K.wall(g, { y0: 70, y1: 780, color: '#e7c9a0', wainscot: { y: 600, color: '#8b9874' } });
  K.floor(g, { y0: 780, color: '#b06c3c', vp: [960, 300] });
  K.rug(g, [[440, 920], [1480, 920], [1640, 1080], [280, 1080]], { style: 'kilim' });
  K.window(g, 110, 150, 360, 420, { outside: { season: 'winter', time: 'golden', seed: 9 }, plant: true });
  F.frame(g, 1080, 170, 104, 130); F.shelf(g, 1240, 1500, 320, { items: ['jug', 'plates'] });
  F.sedir(g, 560, 1380, 900);
  F.stove(g, 1640, 900); F.firewood(g, 1760, 900);
  F.hangingLamp(g, 1400, 120, { top: 70 });
});

// ---------------------------------------------------------------- scenes
FILM({
  fps: 30, fadeIn: 0.3, fadeOut: 0.6, music: { mood: 'quirky', seed: 3 },
  scenes: [
    { name: 'awake at night', dur: 3, set: BEDROOM, light: 1,
      sfx: [[0, 'clock-fast', 0.45, { dur: 3, rate: 7 }], [0.5, 'owl', 0.35], [1.4, 'rustle', 0.6, { dur: 0.6 }]],
      cam: [{ t: 0, x: 960, y: 560, z: 1.0 }, { t: 3, x: 900, y: 560, z: 1.18 }],
      grade: { tint: '#5a6ab0', tintA: 0.42, warm: 0, vignette: 0.45 },
      draw(g, t) {
        K.clockHands(g, 1060, 300, 62, 23 + t * 2.2);
        K.beam(g, [[300, 200], [520, 200], [1300, 940], [700, 1080], [200, 1080]], { color: '190,210,255', a: 0.22, from: [360, 300], to: [900, 1000] });
        const look = K.key(t, [[0, [0.3, -0.6]], [1.2, [0.3, -0.6]], [1.6, [0.9, -0.8]], [2.6, [0.9, -0.8]]]);
        K.noah(g, { x: 815, y: 712, s: 0.82, pose: 'lie', outfit: 'pajamas', eyes: 'wide', look, blink: K.blinkAt(t, 3), handsOut: true, blanket: '#5f7ab0', breath: Math.sin(t * 2) * 3, t });
        K.item(g, 'phone', 1520, 772, 1.1, { tilt: 1.45, time: '03:47', text: 'Wecker: 06:00' });
        K.motes(g, [400, 300, 900, 600], t, { color: '200,215,255' });
      } },
    { name: 'tired at the desk', dur: 3, set: OFFICE, in: 'fade',
      sfx: [[0, 'typing', 0.5, { dur: 0.7 }], [1.0, 'sip', 0.9], [1.55, 'gulp', 0.6], [2.45, 'cup', 0.7]],
      cam: [{ t: 0, x: 940, y: 540, z: 1.1 }, { t: 3, x: 920, y: 540, z: 1.18 }],
      draw(g, t) {
        K.beam(g, [[520, 150], [520, 580], [1100, 1080], [1600, 1080], [900, 600]], { a: 0.16, from: [520, 300], to: [1100, 900] });
        const arm = K.key(t, [[0.2, K.ARMS.hold], [0.9, K.ARMS.drink], [1.9, K.ARMS.drink], [2.5, K.ARMS.hold]]);
        const tilt = K.key(t, [[0.7, 0], [1.0, -0.5], [1.8, -0.5], [2.1, 0]]);
        const drinking = t > 0.95 && t < 1.95;
        const r = K.noah(g, { x: 700, y: 960, pose: 'sit', outfit: 'office', eyes: drinking ? 'closed' : 'tired', bags: 0.55, look: [0.7, 0.1], blink: K.blinkAt(t, 5),
          armL: 'rest', armR: arm, holdR: { item: 'mug', tilt, color: '#e8e2d4' }, bob: Math.sin(t * 2.4) * 2, t });
        if (!drinking) K.steam(g, r.hands[1][0], r.hands[1][1] - 50, t, { s: 0.7, a: 0.5, h: 120 });
        K.glow(g, 1260, 560, 260, '140,190,255', 0.25 * K.flicker(t, 2));
      } },
    { name: 'staggering outside', dur: 3, set: STREET, in: 'flash',
      sfx: [...K.steps(0, 3, 1.25, 'step-snow', 0.7), [0, 'wind', 0.5, { dur: 3 }], [0.3, 'dizzy', 0.6]],
      cam: (t) => ({ x: K.lerp(760, 1120, K.sm(t / 3)), y: 600, z: 1.3 }),
      draw(g, t) {
        const x = K.lerp(560, 1300, t / 3), sway = Math.sin(t * 3.1) * 0.08;
        const r = K.noah(g, { x, y: 940, s: 0.92, pose: 'walk', step: t * 1.25, outfit: 'winter', eyes: 'sleepy', bags: 0.95, look: [0, 0.4], headTilt: sway, armL: 'swing', armR: 'swing', t });
        K.dizzy(g, r.top[0], r.top[1] + 10, t, { r: 120, s: 0.92 });
        K.snow(g, [0, 0, 1920, 1080], t, { n: 160, size: 1.4, seed: 8 });
      } },
    { name: 'falls asleep', dur: 3, set: ROOM, in: 'wipe', inDur: 0.45, music: 'sleepy',
      sfx: [[0, 'fire', 0.45, { dur: 3 }], [0.25, 'sparkle', 0.5], [1.9, 'snore', 0.7, { dur: 1.1 }]],
      cam: [{ t: 0, x: 960, y: 560, z: 1.12 }, { t: 3, x: 980, y: 520, z: 1.24 }],
      draw(g, t) {
        K.steam(g, 1724, 510, t, { s: 0.7, a: 0.6, h: 140 });
        K.glow(g, 1640, 750, 240, '255,140,50', 0.35 * K.flicker(t));
        K.beam(g, [[470, 160], [470, 570], [900, 1080], [1500, 1080], [1200, 700]], { a: 0.18, from: [470, 300], to: [1000, 900] });
        const sleep = K.ramp(t, 1.4, 1.9), eyes = t < 0.9 ? 'tired' : t < 1.6 ? 'sleepy' : 'closed';
        const r = K.noah(g, { x: 960, y: 1000, pose: 'sit', outfit: 'villager', eyes, bags: 0.95, look: [-0.4, -0.5], headTilt: 0.12 * K.sm(sleep), armL: 'rest', armR: 'rest', bob: Math.sin(t * 1.6) * 2, t });
        K.thought(g, 1300, 300, 380, 250, (g2, cx, cy) => { g2.save(); g2.translate(cx - 262, cy - 290); g2.scale(0.42, 0.42); F.bed(g2, 200, 1050, 820, { made: true }); g2.restore(); },
          { from: [r.top[0] + 90, r.top[1] + 40], a: K.sm(K.ramp(t, 0.2, 0.7)) });
        if (t > 1.7) K.zzz(g, r.top[0] + 100, r.top[1] + 60, t - 1.7, { s: 1 });
      } },
  ],
});
