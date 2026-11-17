// size comparison still (Noah 1,75 m / wolf 0,8 m / mountains backdrop), shot at t = 0..1
NOAH_FONTS_READY.then(() => defineFilm({ shots: [{ name: 'Vergleich', dur: 1, f(lt, T, t) {
  const v = { x: 0, y: -420, z: 1.1 };
  const ruler = c => { for (let m = 0; m <= 2; m += .5) { const y = -m * 220; line(c, [-640, y, -580, y], 4, '#fff'); c.save(); c.font = hudFont(26); c.fillStyle = '#fff'; c.textAlign = 'right'; c.fillText(String(m).replace('.', ',') + ' m', -655, y + 9); c.restore(); } line(c, [-610, 0, -610, -440], 4, '#fff'); };
  return { set: (c, cam, t) => forest(c, cam, t, { tod: 'day', path: false, log: false, backdrop: snowyMountains, treesX: [-2400, 2400] }), cam: v, vignette: .2,
    behind: [ruler, c => castShadow(c, -380, 110, { alpha: .25 }), c => castShadow(c, 330, 200, { alpha: .25 })],
    front: [c => drawNoah(c, { x: -380, k: .25, ink: 1.8, outfit: 'caveman', expr: { beard: 1, wild: 1, mouth: 'flat' } }), c => wolf(c, 300, { s: -1, t: 0 }),
      c => { for (const [x, y, s] of [[-380, -420, 'Noah ≈ 1,75 m'], [300, -300, 'Wolf ≈ 0,8 m Schulterhöhe']]) { c.save(); c.font = hudFont(30); c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 6; c.textAlign = 'center'; c.strokeText(s, x, y); c.fillText(s, x, y); c.restore(); } }],
    screen: [c => hudText(c, 'GRÖSSENVERGLEICH', 60, 80, 40, '#fff')] };
} }] }));
