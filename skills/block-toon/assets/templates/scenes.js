// Block-toon summer demo — 6 s, two shots, theme summerDay.
// 1) Wide: hot courtyard between panel blocks, poplars, laundry on balconies, poplar fluff drifting.
//    The lanky guy in a white tank top waits, hands in pockets; his stocky friend by the bench.
// 2) Close-up: a fluff tuft drifts onto his nose, he goes cross-eyed, blows it away, side-eyes the camera, smirks.

function courtyard(ctx, t, cam) {
  withCam(ctx, cam, .2, () => {
    sky(ctx); sun(ctx, 870, 250, 70);
    cloud(ctx, 180 + t * 12, 330, .9, 1); cloud(ctx, 760 + t * 8, 520, .6, 2);
  });
  withCam(ctx, cam, .45, () => {
    panelBlock(ctx, { x: -140, y: 700, w: 620, h: 640, floors: 10, cols: 10, seed: 4, far: true, lit: .3, side: 60, t });
    panelBlock(ctx, { x: 640, y: 760, w: 560, h: 580, floors: 9, cols: 9, seed: 8, far: true, lit: .3, side: -50, t });
  });
  withCam(ctx, cam, .65, () => {
    panelBlock(ctx, { x: 160, y: 520, w: 560, h: 840, floors: 12, cols: 6, seed: 13, lit: .35, side: 90, t, balconies: .55, laundry: true, dishes: .25 });
  });
  withCam(ctx, cam, .8, () => {
    ctx.fillStyle = TH.ground; ctx.fillRect(-400, 1330, W + 800, 900);
    bank(ctx, [[-300, 1380], [-60, 1310], [260, 1330], [560, 1300], [900, 1326], [1300, 1300], [1300, 1440], [-300, 1440]], LW * .7);
    tree(ctx, 80, 1380, 900, { kind: 'poplar', seed: 2, t });
    tree(ctx, 980, 1400, 760, { kind: 'round', seed: 5, t });
    tree(ctx, 820, 1380, 520, { kind: 'birch', seed: 7, t });
    bush(ctx, 380, 1400, 260, 110, 3, t);
    specks(ctx, -50, 1420, 1150, 1500, 40, 5);
  });
}

const FILM = {
  duration: 6,
  shots: [
    { name: 'wide', start: 0, end: 3, lw: 6, draw(ctx, t, lt, u) {
      theme('summerDay');
      const cam = { x: lerp(540, 560, E.inOut(u)), y: lerp(940, 1010, E.inOut(u)), zoom: lerp(1, 1.1, E.inOut(u)) };
      courtyard(ctx, t, cam);
      withCam(ctx, cam, 1, () => {
        asphalt(ctx, -200, 1520, 1300, 1760, 3);
        heatLines(ctx, t, 100, 1000, 1700);
        bench(ctx, 40, 1590, 330, 6);
        const tc = twos(t);
        drawFigure(ctx, { cast: 'stockySummer', x: 300, y: 1640, s: .4, t: tc + 1, sway: 1, lid: .55, look: .6, lw: 6 });
        const lid = (lt > 1.6 && lt < 1.74) ? 1 : .62;
        drawFigure(ctx, { cast: 'lankySummer', x: 640, y: 1800, s: .58, t: tc, sway: 1, lid, look: -.4, lookY: .1, headTilt: -.03, lw: 6.5 });
        bank(ctx, [[-200, 1980], [-120, 1780], [200, 1760], [520, 1790], [900, 1750], [1250, 1790], [1250, 1980]], 7);
        specks(ctx, -50, 1800, 1100, 1900, 30, 6);
      });
      fluff(ctx, t, { n: 26, seed: 31, speed: 35, size: 9, wind: 28 });
      fluff(ctx, t, { n: 6, seed: 41, speed: 60, size: 18, wind: 45 });
    } },
    { name: 'close', start: 3, end: 6, lw: 8, draw(ctx, t, lt, u) {
      theme('summerDay');
      const cam = { x: 540, y: lerp(960, 900, E.inOut(u)), zoom: lerp(1.0, 1.07, E.inOut(u)) };
      withCam(ctx, cam, .3, () => {
        sky(ctx); sun(ctx, 930, 200, 90, 6);
        panelBlock(ctx, { x: -200, y: 700, w: 1500, h: 1700, floors: 7, cols: 7, seed: 17, lit: .35, t, lw: 4, balconies: .5, laundry: true });
        ctx.fillStyle = 'rgba(230,240,250,.18)'; ctx.fillRect(-400, -400, W + 800, H + 800); // haze, pushes bg back
      });
      withCam(ctx, cam, .5, () => { tree(ctx, 60, 1500, 1300, { kind: 'poplar', seed: 9, t, lw: 6 }); });
      fluff(ctx, t, { n: 14, seed: 51, speed: 30, size: 10, wind: 25, alpha: .8 });
      withCam(ctx, cam, 1, () => {
        const tc = twos(t), l = twos(lt);
        // beat: fluff arrives (0.2–1.3), cross-eyed stare, blow (1.45–1.8), fluff flies off, side-eye + blink + smirk
        const cross = E.inOut(inv(.7, 1.1, l)) * (1 - inv(1.5, 1.7, l)) * .9;
        const look = l < 2 ? lerp(-.3, -.1, inv(.2, 1, l)) : lerp(-.1, .3, E.inOut(inv(2, 2.25, l)));
        let lid = .6; if (l > .7 && l < 1.5) lid = .4; if (l > 2.5 && l < 2.67) lid = 1; else if (l >= 2.67) lid = .6;
        const mouth = l > 1.45 && l < 1.85 ? E.sine(inv(1.45, 1.55, l)) * (1 - inv(1.7, 1.85, l)) : 0;
        drawFigure(ctx, { cast: 'lankySummer', x: 560, y: 3330, s: 1.5, t: tc, sway: .4, lid, look, cross, lookY: l < 1.6 ? .2 : 0, mouth, smirk: E.inOut(inv(2.7, 2.95, lt)), headTilt: lerp(-.03, .015, E.inOut(inv(1.9, 2.3, l))), lw: 9 });
        // hero fluff tuft
        const nose = [520, 838];
        let fx, fy, fr = 40;
        if (lt < 1.5) { const k = E.out(inv(0, 1.3, lt)); fx = lerp(1150, nose[0] - 20, k) + Math.sin(lt * 5) * 10 * (1 - k); fy = lerp(560, nose[1] - 40, k) + Math.sin(lt * 3) * 30 * (1 - k) + Math.sin(lt * 6) * 4; }
        else { const k = E.in(inv(1.5, 2.1, lt)); fx = lerp(nose[0] - 20, -200, k); fy = lerp(nose[1] - 40, 300, k); fr = 40 + k * 16; }
        fluffTuft(ctx, fx, fy, fr, lt * 1.5);
        if (lt > 1.5 && lt < 2.0) { ctx.globalAlpha = 1 - inv(1.6, 2, lt); for (let i = 0; i < 3; i++) stroke(ctx, c => { const y = nose[1] + 50 + (i - 1) * 26; c.moveTo(470 - i * 10, y); c.quadraticCurveTo(380, y - 40 - i * 10, 300 - i * 30, y - 90); }, 5, '#ffffff'); ctx.globalAlpha = 1; }
      });
      fluff(ctx, t, { n: 5, seed: 61, speed: 55, size: 26, wind: 40, alpha: .9 });
    } },
  ],
  post(ctx, t) {
    tint(ctx); vignette(ctx, .3, '60,40,20'); grain(ctx, t, .07);
    fade(ctx, 1 - inv(0, .3, t), '255,250,235'); fade(ctx, inv(5.7, 6, t));
  },
};
