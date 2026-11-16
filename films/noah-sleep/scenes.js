// "Noah Goes to Sleep": yawn and stretch, get into bed, lamp off, zzz.
const STAND_X = -20;
const N_K = .5;               // Noah scale in world units (standing ~763 tall)
const HEAD_Y = -585;          // head centre on the pillow
const dark = k => `rgba(12,16,48,${.55 * k})`;

defineFilm({
  fadeIn: .3, fadeOut: .6,
  shots: [
    { name: 'wide: big yawn', dur: 2.4, f(lt, T, t) {
      const up = ease(seg(lt, .35, .95)) - ease(seg(lt, 1.6, 2.05));
      const yawn = bump(lt, .4, 1.75);
      const a = lerp(.13, 2.45, up), b = lerp(-.08, .55, up);
      const sleepy = lt > 1.9;
      const expr = yawn > .2 ? { eyes: 'closed', mouth: 'yawn', open: clamp(yawn * 1.3, 0, 1), browUp: yawn } : { lid: sleepy ? .5 : 0, mouth: sleepy ? 'soft' : 'smile' };
      const noah = c => drawNoah(c, { x: STAND_X, y: 0, k: N_K, arms: { l: { a, b }, r: { a, b } }, expr, tilt: Math.sin(lt * 3) * .04 * yawn, bob: -12 * up });
      return { set: bedroomSet, cam: CAM.mix({ x: 230, y: -540, z: .92 }, { x: 120, y: -520, z: 1.12 }, ease(lt / T)), blur: 5,
        behind: [c => bedBack(c), c => bedFront(c, t, { top: -430 }), c => nightstand(c, true), noah], front: [], fx: [c => lampGlow(c, 1)], tint: dark(.15) };
    } },
    { name: 'in bed: eyes getting heavy', dur: 1.6, f(lt, T, t) {
      const lid = lt < .9 ? lerp(.35, .7, ease(seg(lt, 0, .8))) : .7 - .7 * bump(lt, 1.0, 1.25) * 0 + .15 * bump(lt, .95, 1.3);
      const br = Math.sin(t * 2.4) * 4;
      return { set: bedroomSet, cam: CAM.mix({ x: BED.x + 60, y: -560, z: 1.55 }, { x: BED.x + 60, y: -565, z: 1.65 }, lt / T), blur: 9,
        behind: [c => bedBack(c), c => nightstand(c, true), c => drawNoahHead(c, BED.x, HEAD_Y + br * .3, N_K, { lid, mouth: 'soft' }, -.06)],
        front: [c => bedFront(c, t, { breathe: br }), c => { drawNoahHand(c, BED.x - 95, -452 + br, N_K, .15); drawNoahHand(c, BED.x + 95, -452 + br, N_K, -.15); }],
        fx: [c => lampGlow(c, 1)], tint: dark(.15) };
    } },
    { name: 'lights out: zzz', dur: 2.6, f(lt, T, t) {
      const off = ease(seg(lt, .15, .35)), br = Math.sin(t * 2.0) * 6;
      const [hx, hy] = [BED.x, HEAD_Y];
      return { set: bedroomSet, cam: CAM.mix({ x: BED.x + 40, y: -580, z: 1.45 }, { x: BED.x + 20, y: -600, z: 1.8 }, ease(lt / T)), blur: 9,
        behind: [c => bedBack(c), c => nightstand(c, off < .5), c => drawNoahHead(c, BED.x, HEAD_Y + br * .3, N_K, { eyes: lt < .5 ? undefined : 'closed', lid: .8, mouth: 'soft' }, -.06)],
        front: [c => bedFront(c, t, { breathe: br }), c => { drawNoahHand(c, BED.x - 95, -452 + br, N_K, .15); drawNoahHand(c, BED.x + 95, -452 + br, N_K, -.15); }],
        fx: [c => lampGlow(c, 1 - off), c => { if (lt > .6) FX.zzz(c, hx + 150, hy - 150, t - 1.6); }], tint: dark(.15 + .85 * off) };
    } },
  ],
});
