// "Tea at the Café": two friends drink tea; he burns his tongue, she laughs, the waiter refills, cheers.
const SEAT_A = -250, SEAT_B = 250;
const ali = (t, o = {}) => Object.assign({ who: CAST.ali, x: SEAT_A, s: 1, sit: 1, look: [1, 0], main: 'front', off: 'front', ...EXPR.content, lid: .2 }, o);
const zey = (t, o = {}) => Object.assign({ who: CAST.zeynep, x: SEAT_B, s: -1, sit: 1, look: [1, 0], main: 'front', off: 'front', ...EXPR.happy }, o);
const steamOn = (x) => (c, t) => FX.steam(c, x, TABLE.top - 60, t, { h: 120 });
const chairs = [c => PROPS.chair(c, SEAT_A), c => PROPS.chair(c, SEAT_B)];
const GA = -118, GB = 132; // tea glass spots on the table

defineFilm({
  fadeIn: .3, fadeOut: .5,
  shots: [
    { name: 'wide: chatting', dur: 3, f(lt, T, t) {
      const a = ali(t, { talk: lt < 2.4 ? .8 : 0, main: { from: 'front', to: 'shrug', k: bump(lt, .6, 1.6) }, up: .3 });
      const b = zey(t, { bob: Math.sin(lt * 7) * 4 * (lt > .5 && lt < 2 ? 1 : 0), mouth: 'smile' });
      return { set: 'cafe', cam: CAM.mix({ x: 0, y: -360, z: 1.12 }, { x: 0, y: -380, z: 1.24 }, ease(lt / T)), blur: 6,
        behind: chairs, chars: [a, b], front: [c => cafeTable(c, t, [{ x: GA }, { x: GB }])], fx: [steamOn(GA), steamOn(GB)] };
    } },
    { name: 'CU: she sips', dur: 2.2, f(lt, T, t) {
      const k = ease(seg(lt, .2, .8)), back = ease(seg(lt, 1.6, 2.1));
      const b = zey(t, { main: { from: 'front', to: 'drink', k: k - back, item: 'teaglass', itemOpts: { fill: .8 } }, ...(k > .9 && back < .1 ? EXPR.content : EXPR.happy), blush: .6 * k });
      const a = ali(t);
      return { set: 'cafe', cam: CAM.mix(CAM.closeUp(b, 2.2), CAM.closeUp(b, 2.35), lt / T), blur: 12,
        behind: chairs, chars: [a, b], front: [c => cafeTable(c, t, [{ x: GA }])], fx: [] };
    } },
    { name: 'CU: hot tea!', dur: 2.6, f(lt, T, t) {
      // blow (0-1.0), sip (1.0-1.4), burn reaction (1.4+)
      const lift = ease(seg(lt, 0, .35));
      const sipK = ease(seg(lt, .95, 1.25));
      const burn = lt > 1.35;
      const a = ali(t, {
        main: burn ? { from: 'drink', to: 'hold', k: ease(seg(lt, 1.35, 1.6)), item: 'teaglass' } : { from: 'front', to: sipK > 0 ? 'drink' : 'sip', k: sipK > 0 ? 1 : lift, item: 'teaglass' },
        mouth: burn ? 'gasp' : lt < .95 ? 'blow' : 'sip', lid: burn ? 0 : .35, pupil: burn ? .45 : 1, up: burn ? 1 : 0,
        blush: burn ? 1 : 0, sweat: burn ? seg(lt, 1.5, 2.5) : -1, bob: burn ? -14 * bump(lt, 1.35, 1.6) : 0,
      });
      const fx = [];
      const [hx, hy] = handWorld(a, 'main', t);
      if (!burn) fx.push(c => FX.steam(c, hx - 8, hy - 70, t, { h: 90, a: lt < .95 ? .5 : 1 }));
      if (lt < .95) fx.push(c => { for (let i = 0; i < 3; i++) { const ph = (lt * 2.5 + i / 3) % 1; line(c, [a.x + 40 + ph * 20, -470 + 120 - ph * 10, a.x + 60 + ph * 30, -470 + 110 - ph * 16], 4, `rgba(255,255,255,${.8 * (1 - ph)})`); } });
      if (burn) { const [hx2, hy2] = headWorld(a); fx.push(c => { FX.smoke(c, hx2 - 120, hy2 - 10, lt - 1.35, 4, [-1, -.6], 5); FX.smoke(c, hx2 + 120, hy2 - 10, lt - 1.35, 9, [1, -.6], 5); }); }
      return { set: 'cafe', cam: CAM.closeUp(a, 2.3), blur: 12, behind: chairs, chars: [a, zey(t)], front: [c => cafeTable(c, t, [{ x: GB }])], fx, shake: burn && lt < 1.6 ? 8 : 0 };
    } },
    { name: 'two-shot: fanning / she laughs', dur: 2.2, f(lt, T, t) {
      const a = ali(t, { main: { pose: 'hold', item: 'teaglass' }, off: { hand: [60 + Math.sin(t * 26) * 22, -548] }, mouth: 'o', blush: 1 - lt / T * .6, up: .6, look: [0, 0], sweat: seg(lt, 0, 1.2) });
      const b = zey(t, { ...EXPR.laugh, off: { pose: 'chest' }, bob: Math.abs(Math.sin(lt * 12)) * -8, tilt: Math.sin(lt * 12) * .04 });
      return { set: 'cafe', cam: CAM.two(a, b, 1.35), blur: 8, behind: chairs, chars: [a, b], front: [c => cafeTable(c, t, [{ x: GB }])], fx: [steamOn(GB)] };
    } },
    { name: 'waiter refills', dur: 2.6, f(lt, T, t) {
      // the waiter walks in behind the table and refills Ali's glass
      const arrive = ease(seg(lt, 0, 1.0)), pour = seg(lt, 1.2, 2.2);
      const w = { who: CAST.waiter, x: lerp(900, 95, arrive), s: -1, ...EXPR.happy, look: [.6, .5], walk: arrive < 1 ? lt * 9 : null,
        main: { from: 'hold', to: { hand: [200, -380], ang: .6 }, k: ease(seg(lt, 1.0, 1.3)) - ease(seg(lt, 2.2, 2.5)), item: heldTeapot }, off: 'down' };
      const a = ali(t, { ...EXPR.happy, look: [.8, .4], blush: .3 });
      const b = zey(t, { look: [-.8, .2], mouth: 'smile' });
      const fx = [];
      if (pour > 0 && pour < 1) {
        const [sx, sy] = spoutWorld(w, t);
        fx.push(c => { c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx - 10, sy + 40, GA + 4, TABLE.top - 40); c.lineWidth = 9; c.strokeStyle = '#b8401f'; c.lineCap = 'round'; c.stroke(); });
      }
      fx.push(steamOn(GA));
      return { set: 'cafe', cam: { x: 0, y: -400, z: 1.3 }, blur: 7, behind: [...chairs], chars: [w, a, b],
        front: [c => cafeTable(c, t, [{ x: GA, fill: lerp(.2, .9, pour) }, { x: GB }])], fx };
    } },
    { name: 'CU: perfect sip', dur: 2.2, f(lt, T, t) {
      const k = ease(seg(lt, .1, .6));
      const a = ali(t, { main: { from: 'front', to: 'drink', k, item: 'teaglass', itemOpts: { fill: .7 } }, ...EXPR.content, lid: k > .8 ? .75 : .3, blush: .4 });
      const [hx, hy] = headWorld(a);
      return { set: 'cafe', cam: CAM.mix(CAM.closeUp(a, 2.3), CAM.closeUp(a, 2.5), lt / T), blur: 12, behind: chairs, chars: [a, zey(t)],
        front: [c => cafeTable(c, t, [{ x: GB }])], fx: [c => { for (let i = 0; i < 3; i++) FX.sparkle(c, hx + 150 - i * 40, hy - 110 + i * 30, seg(lt, .9 + i * .2, 1.5 + i * .2), 1.4); }] };
    } },
    { name: 'wide: cheers', dur: 2.2, f(lt, T, t) {
      const up = ease(seg(lt, .2, .7));
      const a = ali(t, { main: { from: 'front', to: { hand: [190, -560], ang: .25 }, k: up, item: 'teaglass' }, ...EXPR.grin });
      const b = zey(t, { main: { from: 'front', to: { hand: [190, -560], ang: .25 }, k: up, item: 'teaglass' }, ...EXPR.grin });
      const w = { who: CAST.waiter, x: 560, s: -1, ...EXPR.happy, main: { pose: 'hold', item: heldTeapot }, off: 'hip', look: [.5, 0] };
      const [ax] = handWorld(a, 'main', t), [bx, by] = handWorld(b, 'main', t);
      return { set: 'cafe', cam: CAM.mix({ x: 140, y: -400, z: 1.3 }, { x: 140, y: -380, z: 1.12 }, ease(lt / T)), blur: 6, behind: chairs, chars: [a, b, w],
        front: [c => cafeTable(c, t, [])], fx: [c => FX.sparkle(c, (ax + bx) / 2, by - 60, seg(lt, .65, 1.2), 2.2), c => FX.hearts(c, 0, -820, t, up > .9 ? 4 : 0)] };
    } },
  ],
});
