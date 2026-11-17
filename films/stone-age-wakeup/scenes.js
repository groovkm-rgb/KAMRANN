// Noah (primitive look: beard + wild hair, fur tunic) wakes up on a fur bed in a cave; morning light from the mouth.
const K = .25, INK = 1.8, BEDX = -150, LOOK = { beard: 1, wild: 1 };
const bed = c => furBed(c, BEDX, 520);
const blanket = (c, br) => { // fur blanket over the lying body (body to the right of the head)
  const x0 = BEDX - 140, x1 = BEDX + 270, top = -112 + br;
  c.beginPath(); c.moveTo(x0, -40); c.quadraticCurveTo(x0 - 10, top + 20, x0 + 60, top); c.quadraticCurveTo(BEDX + 60, top - 26 - br, x1 - 40, top + 14); c.quadraticCurveTo(x1 + 20, top + 30, x1, -40); c.closePath(); fs(c, '#a8703e', 4);
  c.save(); c.clip(); for (let i = 0; i < 12; i++) { c.beginPath(); c.ellipse(x0 + 20 + rnd(i + 5) * 420, top + 10 + rnd(i + 9) * 100, 18, 11, i, 0, Math.PI * 2); c.fillStyle = NOAH_FUR.furDark; c.fill(); } c.fillStyle = 'rgba(40,20,10,.18)'; c.fillRect(x0 - 20, -90, 520, 60); c.restore();
};
defineFilm({
  fadeIn: .5, fadeOut: .4,
  shots: [
    { name: 'CU: asleep → eyes open', dur: 2.5, f(lt, T, t) {
      const br = Math.sin(t * 2.2) * 3, v = CAM.mix({ x: BEDX + 60, y: -190, z: 1.9 }, { x: BEDX + 30, y: -180, z: 2.1 }, ease(lt / T));
      const lid = lt < 1.0 ? 1 : lt < 1.25 ? 1 - .5 * bump(lt, 1.0, 1.25) : lt < 1.7 ? .55 : lt < 1.85 ? 1 : lt < 2.1 ? .45 : 0;
      const e = { ...LOOK, eyes: lid >= .99 ? 'closed' : undefined, lid: lid >= .99 ? 0 : lid, mouth: lt > 2.1 ? 'o' : 'soft', browUp: lt > 2.1 ? .8 : 0, look: lt > 2.1 ? .8 : 0 };
      return { set: caveInterior, cam: v, blur: 0, vignette: .45,
        behind: [bed, c => drawNoahHead(c, BEDX - 175, -150 + br * .3, K, e, -1.25)],
        front: [c => blanket(c, br)],
        fx: [c => { if (lt < 1.1) FX.zzz(c, BEDX - 40, -330, t); }],
        screen: [c => caveLight(c, v, t, { tod: 'dawn', rays: .06 })] };
    } },
    { name: 'sits up, stretches, looks outside', dur: 2.5, f(lt, T, t) {
      const v = CAM.mix({ x: -40, y: -260, z: 1.65 }, { x: -10, y: -250, z: 1.8 }, ease(lt / T));
      const up = ease(seg(lt, .15, .7)) - ease(seg(lt, 1.45, 1.85)), yawn = bump(lt, .2, 1.6);
      const a = lerp(.3, 2.4, up), b = lerp(-.6, .5, up), looking = lt > 1.9;
      const e = { ...LOOK, ...(yawn > .25 ? { eyes: 'closed', mouth: 'yawn', open: clamp(yawn * 1.4, 0, 1), browUp: 1 } : looking ? { mouth: 'smile', look: 1, browUp: .3 } : { lid: .4, mouth: 'soft' }) };
      return { set: caveInterior, cam: v, blur: 0, vignette: .4,
        behind: [c => embers(c, 420, t, .35), c => stoneTools(c, -720), bed, c => castShadow(c, BEDX + 20, 120, { dir: -1, alpha: .25 }),
          c => drawNoah(c, { x: BEDX + 30, k: K, ink: INK, outfit: 'caveman', sit: true, seatH: 300, arms: { l: { a, b }, r: { a, b } }, expr: e, tilt: Math.sin(lt * 3) * .05 * yawn + (looking ? .06 : 0) })],
        screen: [c => caveLight(c, v, t, { tod: 'dawn' })] };
    } },
  ],
});
