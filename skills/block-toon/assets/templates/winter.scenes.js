// Block-toon winter demo — 6 s, two shots, theme winterNight.
// 1) Wide: panel blocks at night, snowfall, sodium lamp, bus stop; the lanky guy waits, breath puffs, a window lights up.
// 2) Close-up: he exhales a cloud, his eyes slide to the camera, slow blink, faint smirk.

function streetSet(ctx, t, cam) {
  theme('winterNight');
  withCam(ctx, cam, .25, () => { sky(ctx); snowfall(ctx, t, { n: 70, seed: 21, speed: 55, size: 4, wind: 10 }); });
  withCam(ctx, cam, .45, () => {
    panelBlock(ctx, { x: -120, y: 600, w: 640, h: 700, floors: 12, cols: 11, seed: 4, far: true, lit: .3, side: 60, t });
    panelBlock(ctx, { x: 600, y: 680, w: 560, h: 620, floors: 10, cols: 9, seed: 8, far: true, lit: .25, side: -50, t });
    const [lx, ly] = streetLamp(ctx, 150, 1330, 420, 1, LW * .6); glow(ctx, lx, ly + 30, 160, '255,190,110', .3);
  });
  withCam(ctx, cam, .7, () => {
    panelBlock(ctx, { x: 110, y: 380, w: 560, h: 940, floors: 14, cols: 7, seed: 13, lit: .42, side: 90, t, onAt: [[2, 9, 1.4], [5, 6, 2.1]] });
  });
  withCam(ctx, cam, .85, () => {
    // ground + far banks
    ctx.fillStyle = TH.ground; ctx.fillRect(-400, 1290, W + 800, 900);
    snowBank(ctx, [[-300, 1340], [-100, 1250], [180, 1272], [420, 1240], [700, 1268], [960, 1236], [1300, 1290], [1300, 1400], [-300, 1400]], LW * .7);
    // tire tracks
    ctx.globalAlpha = .7;
    for (const o of [0, 26, 150, 176]) stroke(ctx, c => { c.moveTo(-100, 1480 + o * .4); c.bezierCurveTo(300, 1420 + o, 700, 1560 + o, 1200, 1500 + o); }, LW * .45);
    ctx.globalAlpha = 1;
    const [lx, ly] = streetLamp(ctx, 900, 1440, 1000, -1, LW * .9);
    glow(ctx, lx, ly + 40, 420, '255,186,105', .38);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12;
    ctx.fillStyle = '#ffbf70'; ctx.beginPath(); ctx.moveTo(lx - 50, ly + 20); ctx.lineTo(lx + 50, ly + 20); ctx.lineTo(lx + 330, 1700); ctx.lineTo(lx - 420, 1700); ctx.closePath(); ctx.fill(); ctx.restore();
    busShelter(ctx, 940, 1560, 340, 470, LW * .9);
    snowSpecks(ctx, -50, 1320, 1150, 1900, 60, 5);
  });
}

const FILM = {
  duration: 6,
  shots: [
    { name: 'wide', start: 0, end: 2.75, lw: 6, draw(ctx, t, lt, u) {
      theme('winterNight');
      const cam = { x: lerp(540, 520, E.inOut(u)), y: lerp(930, 1000, E.inOut(u)), zoom: lerp(1, 1.1, E.inOut(u)) };
      streetSet(ctx, t, cam);
      withCam(ctx, cam, 1, () => {
        const tc = twos(t);
        const lid = (lt > 1.7 && lt < 1.84) ? 1 : .5;
        const f = drawFigure(ctx, { cast: 'lanky', x: 470, y: 1740, s: .6, t: tc, sway: 1, lid, look: -.5, lookY: .2, mouth: (lt > .45 && lt < .75) || (lt > 1.95 && lt < 2.2) ? .6 : 0, headTilt: -.03, lw: 6.5 });
        breath(ctx, t, .5, f.mouth[0] - 10, f.mouth[1], { size: 34, dur: 1.4, lw: 4 });
        breath(ctx, t, 2.0, f.mouth[0] - 10, f.mouth[1], { size: 34, dur: 1.4, lw: 4 });
        // foreground snow bank (overlaps the shins)
        snowBank(ctx, [[-200, 1980], [-120, 1700], [120, 1640], [330, 1690], [520, 1660], [720, 1700], [900, 1650], [1250, 1720], [1250, 1980]], 7);
        stroke(ctx, c => { c.moveTo(60, 1720); c.quadraticCurveTo(200, 1700, 300, 1730); c.moveTo(640, 1740); c.quadraticCurveTo(760, 1715, 860, 1735); }, 3, TH.groundShade);
        snowSpecks(ctx, -50, 1720, 1100, 1900, 30, 6);
      });
      snowfall(ctx, t, { n: 90, seed: 31, speed: 140, size: 8, wind: 22 });
      snowfall(ctx, t, { n: 16, seed: 41, speed: 260, size: 15, wind: 40 });
    } },
    { name: 'close', start: 2.75, end: 6, lw: 8, draw(ctx, t, lt, u) {
      theme('winterNight');
      const cam = { x: 540, y: lerp(960, 900, E.inOut(u)), zoom: lerp(1.0, 1.07, E.inOut(u)) };
      withCam(ctx, cam, .3, () => {
        sky(ctx, '#2d3b6e', '#4d5f97');
        // big blurred-feel panel wall behind him (soft, low contrast)
        ctx.globalAlpha = .9;
        panelBlock(ctx, { x: -200, y: 260, w: 1500, h: 1900, floors: 9, cols: 8, seed: 17, lit: .35, t, lw: 4, onAt: [[6, 2, 4.4]] });
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(110,130,200,.14)'; ctx.fillRect(-400, -400, W + 800, H + 800); // atmospheric haze
        glow(ctx, 330, 980, 260, '255,200,120', .25);
        snowfall(ctx, t, { n: 60, seed: 51, speed: 70, size: 6, wind: 12, alpha: .8 });
      });
      glow(ctx, 980, 120, 520, '255,180,100', .32);
      withCam(ctx, cam, 1, () => {
        const tc = twos(t), l = twos(lt);
        const look = l < 1.5 ? -.65 : lerp(-.65, .25, E.inOut(inv(1.5, 1.85, l)));
        const lookY = l < 1.5 ? .15 : lerp(.15, -.1, inv(1.5, 1.85, l));
        let lid = .52; if (l > 2.35 && l < 2.55) lid = 1; else if (l >= 2.55) lid = .58;
        const mouth = l > .35 && l < .95 ? E.sine(inv(.35, .5, l)) * (1 - inv(.8, .95, l)) : 0;
        const f = drawFigure(ctx, { cast: 'lanky', x: 560, y: 3330, s: 1.5, t: tc, sway: .4, lid, look, lookY, mouth, smirk: E.inOut(inv(2.6, 2.9, l)), headTilt: lerp(-.04, .015, E.inOut(inv(1.4, 2, l))), lw: 9 });
        breath(ctx, t, 2.75 + .45, f.mouth[0] - 24, f.mouth[1], { size: 80, dur: 1.9, lw: 6 });
      });
      snowfall(ctx, t, { n: 40, seed: 61, speed: 180, size: 13, wind: 30 });
      snowfall(ctx, t, { n: 7, seed: 71, speed: 320, size: 26, wind: 50, alpha: .9 });
    } },
  ],
  post(ctx, t) {
    coldTint(ctx); vignette(ctx, .5); grain(ctx, t, .08);
    fade(ctx, 1 - inv(0, .3, t)); fade(ctx, inv(5.7, 6, t));
  },
};
