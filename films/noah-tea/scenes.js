// Noah sits at home and drinks tea (3 s). The character is the user's own artwork used as sprites.
const ROOM = { tod: 'day' };
const chair = c => PROPS.chair(c, 0, { color: '#6b4a34' });
const breathe = t => Math.sin(t * 3.2) * 3;
const GX = TABLE.x + 50;
// opaque glass body (same outline as the engine's tea glass) so the face doesn't show through
function glassBack(c) {
  c.beginPath(); c.moveTo(-17, -52); c.quadraticCurveTo(-22, -30, -10, -14); c.quadraticCurveTo(-19, 0, -14, 12); c.lineTo(14, 12);
  c.quadraticCurveTo(19, 0, 10, -14); c.quadraticCurveTo(22, -30, 17, -52); c.closePath(); c.fillStyle = '#e8f0ef'; c.fill();
}

SPRITES_READY.then(() => defineFilm({
  fadeIn: .25, fadeOut: .35,
  shots: [
    { name: 'medium: tea on the table', dur: 1.3, f(lt, T, t) {
      return { set: 'room', setOpts: ROOM, cam: CAM.mix({ x: 20, y: -500, z: 1.6 }, { x: 20, y: -510, z: 1.75 }, ease(lt / T)), blur: 7,
        behind: [chair, c => drawNoah(c, 'happy', breathe(t))], front: [c => homeTable(c, t, { fill: .85 })],
        fx: [c => FX.steam(c, GX, TABLE.top - 60, t, { h: 130 })] };
    } },
    { name: 'CU: sip', dur: 1.1, f(lt, T, t) {
      const b = breathe(t), tilt = -.08 - .12 * ease(seg(lt, .1, .9));
      const [gx, gy] = sprPt('think', 85, 141, b);
      return { set: 'room', setOpts: ROOM, cam: CAM.mix({ x: 0, y: -560, z: 2.1 }, { x: 0, y: -555, z: 2.25 }, lt / T), blur: 12,
        behind: [chair, c => drawNoah(c, 'think', b)], front: [c => homeTable(c, t, null)],
        fx: [c => { c.save(); c.translate(gx - 14, gy + 10); c.rotate(tilt); c.scale(1.8, 1.8); glassBack(c); drawTeaGlass(c, { fill: .7 - .15 * lt / T }); c.restore(); },
             c => FX.steam(c, gx + 10, gy - 130, t, { h: 70, a: .6 })] };
    } },
    { name: 'medium: content', dur: 0.6, f(lt, T, t) {
      const [hx, hy] = sprPt('happy', 73, 60);
      return { set: 'room', setOpts: ROOM, cam: { x: 20, y: -510, z: 1.75 }, blur: 7,
        behind: [chair, c => drawNoah(c, 'happy', breathe(t))], front: [c => homeTable(c, t, { fill: .5 })],
        fx: [c => FX.steam(c, GX, TABLE.top - 60, t, { h: 90, a: .6 }), c => FX.sparkle(c, hx + 170, hy - 60, seg(lt, 0, .55), 1.4)] };
    } },
  ],
}));
