// Noah sits at home and drinks tea (3 s).
const SEAT = -60;
const noah = (t, o = {}) => Object.assign({ who: CAST.noah, x: SEAT, s: 1, sit: 1, look: [1, .3], main: 'front', off: 'down', ...EXPR.content, lid: .2 }, o);
const chair = c => PROPS.chair(c, SEAT, { color: '#6b4a34' });
const ROOM = { tod: 'day' };

defineFilm({
  fadeIn: .25, fadeOut: .35,
  shots: [
    { name: 'wide: tea is ready', dur: 1.2, f(lt, T, t) {
      const reach = ease(seg(lt, .45, 1.1));
      const glassOnTable = reach < .98;
      const n = noah(t, { main: glassOnTable ? { from: 'down', to: 'front', k: reach } : { pose: 'front', item: 'teaglass' }, mouth: 'smile', look: [1, .6] });
      return { set: 'room', setOpts: ROOM, cam: CAM.mix({ x: 40, y: -420, z: 1.45 }, { x: 30, y: -430, z: 1.6 }, ease(lt / T)), blur: 6,
        behind: [chair], chars: [n], front: [c => homeTable(c, t, glassOnTable)],
        fx: glassOnTable ? [c => FX.steam(c, TABLE.x - 148, TABLE.top - 60, t, { h: 120 })] : [] };
    } },
    { name: 'CU: sip', dur: 1.8, f(lt, T, t) {
      const k = ease(seg(lt, 0, .55)), down = ease(seg(lt, 1.35, 1.8));
      const sipping = k > .85 && down < .2;
      const n = noah(t, { main: { from: 'front', to: 'drink', k: k - down, item: 'teaglass', itemOpts: { fill: .8 } },
        ...(sipping ? EXPR.content : EXPR.happy), mouth: sipping ? 'sip' : 'smile', lid: sipping ? .8 : .25, blush: .35 * k, look: [.4, 0] });
      const [hx, hy] = handWorld(n, 'main', t), [cx, cy] = headWorld(n);
      return { set: 'room', setOpts: ROOM, cam: CAM.mix(CAM.closeUp(n, 2.1), CAM.closeUp(n, 2.3), lt / T), blur: 12,
        behind: [chair], chars: [n], front: [c => homeTable(c, t, false)],
        fx: [c => FX.steam(c, hx - 8, hy - 70, t, { h: 90, a: .8 }), c => FX.sparkle(c, cx + 150, cy - 110, seg(lt, 1.0, 1.6), 1.3)] };
    } },
  ],
});
