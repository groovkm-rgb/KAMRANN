// "Western Duel": the nervous deputy draws first; the calm outlaw draws second and wins.
const kid = (t, o = {}) => Object.assign({ who: CAST.kid, x: -420, s: 1, look: [1, 0], ...EXPR.worried, worry: .7, main: 'hover', twitch: t * 2, bob: Math.sin(t * 3) * 2 }, o);
const out = (t, o = {}) => Object.assign({ who: CAST.outlaw, x: 420, s: -1, look: [1, 0], anger: .55, lid: .25, mouth: 'none', straw: .4 + Math.sin(t * 2.2) * .08, main: 'hover', bob: Math.sin(t * 2.6 + 1) * 2 }, o);
const HAT_TARGET = [420, -752];
const DRAWN = { pose: 'hover', ang: Math.PI / 2 };                 // gun still pointing down, leaving the holster
const draw = (k, aim, recoil = 0) => k > 0 ? { from: DRAWN, to: { aim: aim + recoil }, k: easeOut(k), arc: 40, item: 'gun' } : 'hover';
const KID_AIM = aimAt(kid(0), HAT_TARGET);
const KID_HAND = handWorld(kid(0, { main: { aim: KID_AIM, item: 'gun' } }), 'main');
const OUT_AIM = aimAt(out(0), [KID_HAND[0], KID_HAND[1] - 10]);
const hatFly = (x, y, rot, sq = 1) => c => drawHat(c, CAST.outlaw.hat, x, y, rot, sq, 118, -1);

defineFilm({
  shots: [
    { name: 'wide street', dur: 2.6, f(lt, T, t) {
      return { set: 'western', cam: CAM.mix({ x: 0, y: -400, z: .84 }, { x: 0, y: -400, z: .92 }, ease(lt / T)), blur: 2, chars: [kid(t), out(t)],
        fx: [c => PROPS.tumbleweed(c, -1000 + lt * 760, 40 - Math.abs(Math.sin(lt * 5.5)) * 80, 70, lt * 7), c => FX.dust(c, t, -900, 900, -500, 200)] };
    } },
    { name: 'CU deputy sweats', dur: 2.0, f(lt, T, t) {
      const k = kid(t, { sweat: seg(lt, .25, 1.95), look: keys(lt, [[0, [1, 0]], [.6, [1, 0]], [.72, [-.8, .3]], [1.0, [-.8, .3]], [1.12, [1, 0]]]),
        mouth: bump(lt, 1.35, 1.7) > .2 ? 'gulp' : 'wobble', worry: .8 + .3 * seg(lt, 1, 1.5) });
      k.bob += -12 * bump(lt, 1.35, 1.7);
      return { set: 'western', cam: CAM.mix({ x: -420, y: -560, z: 2.3 }, { x: -420, y: -560, z: 2.45 }, ease(lt / T)), blur: 12, chars: [k, out(t)] };
    } },
    { name: 'CU outlaw squints', dur: 1.8, f(lt, T, t) {
      const o = out(t, { lid: lerp(.25, .72, ease(seg(lt, .2, 1.4))), anger: lerp(.55, .95, ease(seg(lt, .2, 1.4))), straw: .4 + Math.sin(lt * 6) * .22 });
      return { set: 'western', cam: CAM.mix({ x: 420, y: -575, z: 2.3 }, { x: 420, y: -575, z: 2.55 }, ease(lt / T)), blur: 12, chars: [kid(t), o] };
    } },
    { name: 'ECU twitching hand', dur: 1.1, f(lt, T, t) {
      return { set: 'western', cam: { x: -310, y: -310, z: lerp(4.1, 4.7, ease(lt / T)), rot: .05 }, blur: 16,
        chars: [kid(t, { twitch: t * 9, main: { pose: 'hover', dx: Math.sin(t * 47) * 3 } }), out(t)] };
    } },
    { name: 'ECU outlaw eyes', dur: .9, f(lt, T, t) {
      return { set: 'western', cam: { x: 420, y: -628, z: lerp(5.4, 6.1, ease(lt / T)) }, blur: 18, chars: [kid(t), out(t, { lid: lerp(.72, .9, ease(lt / T)), anger: 1, straw: .4 })] };
    } },
    { name: 'deputy draws first', dur: .9, f(lt, T, t) {
      const tf = .32, rec = lt > tf ? -.35 * Math.exp(-(lt - tf) * 9) : 0;
      const k = kid(t, { main: draw(seg(lt, .04, .2), KID_AIM, rec), lid: lt > .26 && lt < .62 ? 1 : 0, mouth: lt > .26 ? 'grit' : 'wobble', worry: 1, blink: false });
      if (lt > tf) k.bob -= 6 * Math.exp(-(lt - tf) * 8);
      const m = muzzleWorld(k, t);
      return { set: 'western', cam: { x: -360, y: -500, z: 1.7 }, blur: 9, chars: [k, out(t)],
        fx: [c => FX.flash(c, m.x, m.y, m.ang, (lt - tf) / .12, 1.1), c => lt > tf && FX.smoke(c, m.x, m.y, lt - tf, 3, [Math.cos(m.ang) * .6, -.4])],
        shake: lt > tf ? 22 * Math.exp(-(lt - tf) * 7) : 0, flash: lt > tf ? Math.max(0, .7 - (lt - tf) * 8) : 0 };
    } },
    { name: 'slow-motion bullet', dur: 1.7, f(lt, T, t) {
      const k = kid(t, { main: { aim: KID_AIM, item: 'gun' }, lid: 1, mouth: 'grit', blink: false });
      const m0 = muzzleWorld(k, 0), u = lerp(.1, .985, lt / T), ang = Math.atan2(HAT_TARGET[1] - m0.y, HAT_TARGET[0] - m0.x);
      const bx = lerp(m0.x, HAT_TARGET[0], u), by = lerp(m0.y, HAT_TARGET[1], u), uc = Math.min(u, .74);
      return { set: 'western', cam: { x: lerp(m0.x, HAT_TARGET[0], uc) + 40, y: lerp(m0.y, HAT_TARGET[1], uc) + 30, z: 2.9 }, blur: 18, speed: ang,
        chars: [k, out(t, { lid: .9, anger: 1 })], fx: [c => FX.rings(c, bx, by, ang, lt), c => PROPS.bullet(c, bx, by, ang, t)] };
    } },
    { name: 'hat shot off', dur: 1.2, f(lt, T, t) {
      const hit = .05, a = lt - hit;
      const o = out(t, { lid: .55, anger: .8, hat: lt < hit, quirk: bump(lt, .35, 1.0) * .8,
        look: keys(lt, [[0, [1, 0]], [.35, [1, 0]], [.45, [.1, -1.4]], [.85, [.1, -1.4]], [.95, [1, 0]]]), straw: .4 + Math.sin(lt * 3) * .06 });
      const fx = [];
      if (lt < .25) fx.push(c => PROPS.bullet(c, HAT_TARGET[0] + a * 2400 * Math.cos(-.39), HAT_TARGET[1] + a * 2400 * Math.sin(-.39), -.39, t));
      if (a > 0) {
        fx.push(hatFly(420 + a * 520, -600 - 30 + (-900 * a + 900 * a * a), a * 9));
        fx.push(c => { for (let i = 0; i < 9; i++) { const vx = (rnd(i) - .3) * 500, vy = -200 - rnd(i + 5) * 400; c.save(); c.translate(HAT_TARGET[0] + vx * a, HAT_TARGET[1] + vy * a + 600 * a * a); c.rotate(a * (8 + i)); c.globalAlpha = clamp(1 - a * 1.5); c.fillStyle = i % 2 ? '#5a4636' : '#b8362e'; c.fillRect(-5, -3, 10, 6); c.restore(); } });
      }
      return { set: 'western', cam: { x: 420, y: -600, z: 1.9 }, blur: 10, chars: [kid(t), o], fx, shake: lt < .2 ? 6 : 0 };
    } },
    { name: 'outlaw draws second', dur: 1.1, f(lt, T, t) {
      const tf = .62, rec = lt > tf ? -.25 * Math.exp(-(lt - tf) * 7) : 0;
      const o = out(t, { hat: false, lid: .6, anger: .8, main: draw(ease(seg(lt, .1, .5)), OUT_AIM, rec) });
      const m = muzzleWorld(o, t);
      return { set: 'western', cam: CAM.mix({ x: 330, y: -520, z: 1.5 }, { x: 330, y: -520, z: 1.6 }, ease(lt / T)), blur: 8, chars: [kid(t), o],
        fx: [c => FX.flash(c, m.x, m.y, m.ang, (lt - tf) / .12, 1.1), c => lt > tf && FX.smoke(c, m.x, m.y, lt - tf, 11, [Math.cos(m.ang) * .5, -.4])],
        shake: lt > tf ? 18 * Math.exp(-(lt - tf) * 7) : 0, flash: lt > tf ? Math.max(0, .6 - (lt - tf) * 8) : 0 };
    } },
    { name: 'gun knocked away', dur: 1.7, f(lt, T, t) {
      const hit = .06, a = lt - hit, up = ease(seg(lt, .35, .6));
      let k;
      const fx = [];
      if (lt < hit) k = kid(t, { main: { aim: KID_AIM, item: 'gun' }, lid: 1, mouth: 'grit', blink: false });
      else {
        const rec = .5 * Math.exp(-a * 6);
        k = kid(t, { gunGone: true, main: { from: { aim: KID_AIM + rec }, to: 'up', k: up, arc: 0 }, off: { from: 'down', to: 'up', k: up, arc: 0 },
          ...EXPR.scared, worry: 1.3, look: [lerp(1, .2, seg(lt, .2, .4)), lerp(0, -.6, seg(lt, .2, .4))], blink: false });
        k.bob -= 22 * bump(lt, .32, .58);
        fx.push(c => PROPS.gun(c, KID_HAND[0] - a * 380, KID_HAND[1] - 1500 * a + 1700 * a * a, -.39 - a * 22, CAST.kid.grip));
        fx.push(c => FX.flash(c, KID_HAND[0] + 30, KID_HAND[1] - 10, Math.PI, a / .1, .7));
        fx.push(c => { for (let i = 0; i < 4; i++) { const b = lt - .4 - i * .05; if (b < 0 || b > .7) continue; FX.drop(c, -420 + (i % 2 ? 90 : -90) + (i % 2 ? 1 : -1) * (40 + i * 30) * b * 4, -700 - 260 * b + 900 * b * b, .9, (i % 2 ? 1 : -1) * .8, clamp(1 - b * 1.4)); } });
      }
      return { set: 'western', cam: CAM.mix({ x: -380, y: -520, z: 1.42 }, { x: -380, y: -520, z: 1.52 }, ease(lt / T)), blur: 8, chars: [k, out(t, { hat: false })], fx, shake: lt > hit && lt < .25 ? 10 : 0 };
    } },
    { name: 'blows the smoke, hat lands', dur: 2.0, f(lt, T, t) {
      const landT = 1.15;
      const o = out(t, { main: { pose: 'blow', item: 'gun' }, lid: .55, anger: .5, mouth: lt < .95 ? 'blow' : 'none', straw: null, hat: lt >= landT,
        hatSq: 1 - .18 * bump(lt, landT, landT + .2), smirk: ease(seg(lt, 1.4, 1.7)), quirk: ease(seg(lt, 1.45, 1.7)) * .7 });
      o.bob += 10 * bump(lt, landT, landT + .2);
      const m = muzzleWorld(o, t), fx = [c => FX.smoke(c, m.x, m.y - 4, lt + .2, 21, [0, -1], 9)];
      if (lt < .95) fx.push(c => { for (let i = 0; i < 3; i++) { const p = ((lt * 2.2 + i / 3) % 1); line(c, [m.x + 30 - p * 30, m.y + 30 - p * 50, m.x + 10 - p * 30, m.y + 10 - p * 50], 4, `rgba(255,255,255,${.7 * (1 - p)})`); } });
      if (lt > .8 && lt < landT) { const k2 = easeIn(seg(lt, .85, landT)); fx.push(hatFly(420, lerp(-1250, headWorld(o)[1] , k2), lerp(.5, 0, k2))); }
      return { set: 'western', cam: CAM.mix({ x: 430, y: -580, z: 2.0 }, { x: 430, y: -580, z: 2.15 }, ease(lt / T)), blur: 12, chars: [kid(t), o], fx };
    } },
  ],
});
