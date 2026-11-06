// Two-shot starter film: friends meet in the park, one waves, the other laughs. Replace with your shots.
const A = (t, o = {}) => Object.assign({ who: CAST.a, x: -260, s: 1, look: [1, 0], ...EXPR.happy }, o);
const B = (t, o = {}) => Object.assign({ who: CAST.b, x: 260, s: -1, look: [1, 0], ...EXPR.happy }, o);

defineFilm({
  fadeIn: .3, fadeOut: .4,
  shots: [
    { name: 'wide: hello', dur: 3, f(lt, T, t) {
      const a = A(t, { main: lt > .4 ? 'wave' : 'down', talk: lt > .6 ? .8 : 0 });
      const b = B(t, { x: lerp(700, 260, ease(seg(lt, 0, 1.2))), walk: lt < 1.2 ? lt * 9 : null });
      return { set: 'park', cam: CAM.mix(CAM.wide(0, .9), CAM.wide(0, 1.0), ease(lt / T)), blur: 4, chars: [a, b] };
    } },
    { name: 'CU: she laughs', dur: 2, f(lt, T, t) {
      const b = B(t, { ...EXPR.laugh, bob: -Math.abs(Math.sin(lt * 12)) * 8, off: 'chest' });
      return { set: 'park', cam: CAM.mix(CAM.closeUp(b, 2.2), CAM.closeUp(b, 2.4), lt / T), blur: 12, chars: [A(t), b],
        fx: [c => FX.hearts(c, b.x, -760, t, 3)] };
    } },
  ],
});
