// DRAFT 0:00–0:22 of "Was wäre, wenn du ein Luxusrestaurant eröffnest?" — synced to the MP3 (silencedetect):
//  0.08 Dieses kleine Heft … 2.12 zweihundertzwanzigtausend Euro (→3.84) | 4.36 Du weißt es nur noch nicht (→5.22)
//  5.72 Im Moment liegt es in einer Schublade (→7.20) | 7.72 Und du bist gerade dabei … 10.77 deine ganze Kohle zu verlieren … 12.17 fast pleitezugehen (→13.30)
//  13.90 Erst wenn du ganz unten bist … (→16.34) | 16.83 Aber bis dahin … wie brutal Gastro in Deutschland wirklich ist (→20.44)
const NK = .25;
function noahP(t, o = {}) {
  const L = lifeAt(t, o.seed || 3), e = Object.assign({ mouth: 'smile' }, o.expr || {});
  if (e.lid == null || e.lid < L.lid) e.lid = Math.max(e.lid || 0, L.lid);
  if (e.lid > .85) { e.eyes = 'closed'; }
  return Object.assign({ k: NK, ink: 1.8, outfit: 'waiter', bob: L.bob * (o.breath ?? 1), tilt: (o.tilt || 0) + L.sway }, o, { expr: e });
}
// world-space Noah with soft contact + cast shadow
function noahW(c, p, shadow = {}) { if (!p.sit && shadow !== false) castShadow(c, p.x, 120, Object.assign({ alpha: .3, len: 1.1, dir: 1 }, shadow)); drawNoahDressed(c, p); }

NOAH_FONTS_READY.then(() => defineFilm({
  fadeIn: .25,
  shots: [
    // A — dark kitchen, one warm lamp, the drawer opens; hand-drawn scale on "220.000 €"
    { name: 'A Schublade', dur: 4.36, f(lt, T, t) {
      const open = ease(seg(lt, .05, 1.35)), z = lerp(2.05, 2.6, ease(seg(lt, 0, T))), cam = { x: lerp(230, 205, seg(lt, 0, T)), y: lerp(-420, -430, seg(lt, 0, T)), z };
      const dk = seg(lt, 2.05, 3.25), tilt = lt < 3.2 ? 0 : .27 * (1 - Math.exp(-(lt - 3.2) * 5) * Math.cos((lt - 3.2) * 11));
      return { set: drawerSet, setOpts: { open }, cam, vignette: .6,
        screen: [c => drawerLight(c, cam, t), c => { if (dk > 0) { inkVeil(c, 1080, 180, 720, 700, .55); handScale(c, 1440, 840, 1.25, dk, tilt, t); } }] };
    } },
    // B — waist-up Noah (waiter) right third, golden salon; Gegenbewegung: background slides left, Noah drifts right
    { name: 'B Noah weiß es', dur: 3.36, f(lt, T, t) {
      const k = ease(seg(lt, 0, T)), z = 3.55, cam = { x: lerp(-60, 120, k), y: -262, z };
      const sx = lerp(1235, 1300, k), nx = cam.x + (sx - W / 2) / z;
      const glance = bump(lt, 1.45, 2.6), look = -glance * .9;
      const noah = noahP(t, { x: nx, expr: { mouth: glance > .3 ? 'soft' : 'smirk', look, browUp: .25 + glance * .2 }, tilt: -.04 + glance * .05 });
      return { set: salon, setOpts: { tod: 'golden', hz: -95, midY: -40 }, cam,
        behind: [c => noahW(c, noah, false)],
        screen: [c => salonLight(c, cam, t, { tod: 'golden', hz: -95 })], vignette: .35 };
    } },
    // C — wide room, slow push-in; Noah sets a wine glass on a table (clay bread basket + dessert); KONTOSTAND card
    { name: 'C Luxusrestaurant', dur: 6.18, f(lt, T, t) {
      const ins = lt > 2.33, k = ease(seg(lt, 0, 2.33)), ki = ease(seg(lt, 2.33, T)), cam = ins ? { x: lerp(40, 215, ki), y: lerp(-150, -156, ki), z: lerp(4.4, 4.0, ki) } : { x: lerp(-20, 50, k), y: lerp(-268, -235, k), z: lerp(1.08, 1.3, k) };
      const NX = -70, TX = 150, TW = 360, ty = -128 - 22 * .45;
      // glass path (world): held at waist, carried to the table, set down at 1.55 s, hand withdraws
      const carry = ease(seg(lt, .25, 1.5)), withdraw = ease(seg(lt, 1.75, 2.5));
      const gx = lerp(NX + 48, TX - 58, carry), gy = lerp(-118, ty + 2, carry) - bump(lt, .25, 1.5) * 24;
      const set = lt > 1.5;
      // hand target in rig units (relative to Noah origin)
      const hx = set ? lerp(TX - 58 - 8, NX + 40, withdraw) : gx - 8, hy = set ? lerp(ty - 30, -120, withdraw) : gy - 30;
      const ik = noahIK(1, (hx - NX) / NK, hy / NK - 50);
      const noah = noahP(t, { x: NX, arms: { r: { a: ik.a, b: ik.b, hand: -.4 }, l: { a: .1, b: -.12 } }, expr: { mouth: 'soft', look: lt < 2.4 ? .9 : 0, lid: lt < 2.4 ? .2 : 0 }, tilt: lt < 2.4 ? .06 : 0 });
      const items = (c, top) => { tableDressing(c, TW, top, t, { menu: true, glint: .5 }); clayBreadBasket(c, -118, top + 2, .52, t); clayDessert(c, 92, top + 4, .5); };
      return { set: salon, setOpts: { tod: 'golden' }, cam,
        behind: [c => { chairBack(c, TX - 100); chairBack(c, TX + 100); }],
        front: [c => dineTable(c, TX, { w: TW, items }), c => { wineGlass(c, gx, gy, .82, { glint: .6 }); noahW(c, noah); },
          c => { // foreground: corner of a near table + plant leaves (depth)
            layer(c, cam, 1.35, c2 => { c2.save(); c2.translate(cam.x * 1.35 - 980, 470); dineTable(c2, 0, { w: 560, top: -128, items: (c3, tp) => { wineGlass(c3, 150, tp, 1); waterGlass(c3, 190, tp, .9); candle(c3, 60, tp - 4, t, 1); } }); c2.restore(); });
          }],
        screen: [c => salonLight(c, cam, t, { tod: 'golden' }),
          c => hudCard(c, t, { t0: 10.78, t1: 13.75, corner: 'tl', w: 560, h: 300, title: 'KONTOSTAND', icon: 'calc', color: HUD.blue,
            draw: (c, kk, l, w, h) => {
              const down = seg(l, .15, 1.05), val = lerp(220000, 0, easeIn(down));
              hudText(c, 'Girokonto · Restaurant', 0, 26, 22, HUD.muted);
              hudText(c, fmtNum(Math.round(val)) + ' €', 0, 108, 74, down >= 1 ? HUD.muted : HUD.ink);
              c.fillStyle = HUD.line; rrect(c, 0, 132, w, 16, 8); c.fill(); c.fillStyle = down >= 1 ? '#d0302a' : HUD.green; rrect(c, 0, 132, Math.max(8, w * (1 - easeIn(down))), 16, 8); c.fill();
              if (l > 1.42) { const a = clamp((l - 1.42) / .25), s = 1 + (1 - easeOut(a)) * .5; c.save(); c.globalAlpha = a; c.translate(w - 10, 196); c.scale(s, s); hudText(c, '−38.000 €', 0, 0, 58, '#d0302a', 'right'); c.restore(); handArrow(c, 30, 160, 70, 214, clamp((l - 1.42) / .5), { t, col: '#d0302a', w: 6, shadow: false, head: 18 }); }
            } })], vignette: .32 };
    } },
    // D — night, empty restaurant: blue moonlight, one table lamp; Noah sits tired; slow pull-out
    { name: 'D Ganz unten', dur: 2.85, f(lt, T, t) {
      const k = ease(seg(lt, 0, T + .6)), NX = -320, cam = { x: lerp(NX + 20, NX + 120, k), y: lerp(-170, -215, k), z: lerp(2.05, 1.45, k) };
      const tableTop = -128, tl = -150;
      const ikL = noahIK(-1, -185, (tl + 4) / NK - (-(250) - (NOAH.HEM + 40) - 60), true), ikR = noahIK(1, 190, (tl + 6) / NK - (-(250) - (NOAH.HEM + 40) - 60), true);
      const noah = noahP(t, { x: NX, sit: true, seatH: 250, breath: .6, arms: { l: { a: ikL.a, b: ikL.b }, r: { a: ikR.a, b: ikR.b } }, expr: { mouth: 'grim', lid: .5, worry: .45, look: -.3 }, tilt: -.07 });
      return { set: salon, setOpts: { tod: 'night' }, cam,
        behind: [c => { chairBack(c, NX, { col: '#4a1a26' }); }],
        front: [c => noahW(c, noah, false), c => dineTable(c, NX, { w: 380, items: (c, top) => { tableLamp(c, 120, top - 2, t, true, .9); wineGlass(c, -120, top, .8); plateSet(c, 0, top + 6, .9); } }),
          c => { c.save(); c.beginPath(); c.rect(NX - 400, -800, 800, 800 - 128); c.clip(); drawNoahDressed(c, Object.assign({}, noah, { onlyArms: true })); c.restore(); }],
        screen: [c => salonLight(c, cam, t, { tod: 'night' }), c => { const [lx, ly] = toScreen(cam, 1, NX + 108, -200); bloom(c, lx, ly, 520 * cam.z / 1.6, '255,170,80', .22); }], vignette: .55 };
    } },
    // E — whip-pan, then the cost table with a running SUMME; title stamp
    { name: 'E Kosten + Titel', dur: 5.25, f(lt, T, t) {
      const whip = ease(seg(lt, 0, .42)), NX = -320, x = lerp(NX + 150, 2350, whip), cam = { x, y: -330, z: lerp(1.42, 1.3, whip) };
      const rows = [['Miete + Nebenkosten', 6200], ['Personal', 25000], ['Strom & Gas', 2500], ['Kredit', 1600], ['Sonstiges', 1700]];
      return { set: salon, setOpts: { tod: 'night', sconces: true, candles: true }, cam, speed: whip > 0 && whip < 1 ? 0 : null,
        screen: [c => salonLight(c, cam, t, { tod: 'night' }), c => screenDim(c, .25 * seg(lt, .3, .8)),
          c => costPanel(c, t, { t0: 16.95, t1: 99, x: 110, y: 110, w: 930, rowH: 72, title: 'KOSTEN PRO MONAT', icon: 'table', color: HUD.accent, rows,
            times: [17.2, 17.62, 18.04, 18.46, 18.88], tSum: 19.25, tCircle: 19.8 }),
          c => { if (t > 20.42) { screenDim(c, .35 * clamp((t - 20.42) / .2)); titleStamp(c, t, 20.45, ['WAS WÄRE, WENN DU EIN', 'LUXUSRESTAURANT ERÖFFNEST?'], { x: W / 2, y: H / 2 + 10, size: 84 }); } }],
        shake: t > 20.57 && t < 21 ? 16 * Math.exp(-(t - 20.57) * 9) : 0, vignette: .45, fade: seg(t, 21.75, 22.0) };
    } },
  ],
}));
