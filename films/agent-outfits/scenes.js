// Outfit sheet: every outfit front + side on a neutral ground (stills only)
const OUTFITS = [['classic'], ['agent'], ['agent', { coat: true }], ['agent', { coat: true, hat: true }], ['pyjama'], ['home'], ['old', { tilt: .06, bob: 30 }]];
function sheetSet(c) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#e9e3d6'; c.fillRect(0, 0, W, H); return { base: '#e9e3d6' }; }
defineFilm({ shots: [
  { name: 'compare', dur: 1, f: () => ({ set: sheetSet, cam: { x: 0, y: -195, z: 2.4 }, vignette: 0, fx: [c => {
    drawNoah(c, { x: -260, k: .25, ink: 1.8, outfit: 'agent', expr: { mouth: 'flat' } });
    drawNoahSide(c, { x: 0, k: .25, ink: 1.8, outfit: 'agent', walk: null, expr: { mouth: 'flat' } });
    drawNoah(c, { x: 260, k: .25, ink: 1.8, outfit: 'agent', coat: true, hat: true, expr: { mouth: 'flat' } }); }] }) },
  { name: 'front', dur: 1, f: () => ({ set: sheetSet, cam: { x: 0, y: -360, z: 1.1 }, vignette: 0, fx: [c => OUTFITS.forEach(([o, x = {}], i) => drawNoah(c, Object.assign({ x: -750 + i * 250, y: 0, k: .25, ink: 1.8, outfit: o, expr: { mouth: 'flat' } }, x)))] }) },
  { name: 'side', dur: 1, f: () => ({ set: sheetSet, cam: { x: 0, y: -360, z: 1.1 }, vignette: 0, fx: [c => OUTFITS.forEach(([o, x = {}], i) => drawNoahSide(c, Object.assign({ x: -760 + i * 250, y: 0, k: .25, ink: 1.8, outfit: o, walk: i * .9, expr: { mouth: 'flat' } }, x)))] }) },
  { name: 'pals', dur: 1, f: () => ({ set: sheetSet, cam: { x: 0, y: -360, z: 1.1 }, vignette: 0, fx: [c => {
    drawNoah(c, { x: -750, k: .25, ink: 1.8, outfit: 'agent', coat: true, expr: { mouth: 'flat' } });
    drawPal(c, { look: 'wife', x: -500, k: .235, ink: 1.8, outfit: 'home', expr: { mouth: 'smile' } });
    drawPal(c, { look: 'son', x: -300, k: .17, ink: 1.8, outfit: 'home', expr: { mouth: 'smile' } });
    drawPal(c, { look: 'daughter', x: -140, k: .15, ink: 1.8, outfit: 'pyjama', expr: { mouth: 'smile' } });
    drawPal(c, { look: 'mother', x: 60, k: .23, ink: 1.8, outfit: 'old', expr: { mouth: 'smile' } });
    drawPal(c, { look: 'follower', x: 300, k: .26, ink: 1.8, outfit: 'agent', coat: true, hat: true, expr: { mouth: 'flat' } });
    drawPal(c, { look: 'informant', x: 540, k: .235, ink: 1.8, outfit: 'old', expr: { mouth: 'flat' } });
    drawPal(c, { look: 'colleague', x: 760, k: .25, ink: 1.8, outfit: 'home', expr: { mouth: 'flat' } });
  }] }) },
] });
