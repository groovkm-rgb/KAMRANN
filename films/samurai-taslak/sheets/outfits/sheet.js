const paper = c => { c.fillStyle = '#f1eadb'; c.fillRect(0, 0, W, H); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(150,130,100,${rnd(i) * .12})`; c.fillRect(rnd(i + 1) * W, rnd(i + 2) * H, 30 * rnd(i + 3), 1.5); } };
const label = (c, s, x, y, sz = 40) => { c.font = `${sz}px Shojumaru`; c.textAlign = 'center'; c.fillStyle = '#1d1715'; c.fillText(s, x, y); };
const E = { lid: .25, mouth: 'flat' };
defineShots([
  { name: 'outfits', dur: 1, draw(c) {
    paper(c);
    const items = [['samurai', 'Alltag', {}], ['armor', 'Rüstung', { flag: true }], ['ronin', 'Rōnin', {}], ['edo', 'Edo-Beamter', {}]];
    items.forEach(([of, name, o], i) => { const x = 240 + i * 480; drawSam(c, Object.assign({ x, y: 960, k: .5, ink: 1.6, outfit: of, expr: E }, o)); label(c, name, x, 1040); });
  } },
  { name: 'hair', dur: 1, draw(c) {
    paper(c);
    drawNoahHead(c, 330, 520, 1.1, { mouth: 'smile' }); label(c, 'Original', 330, 960);
    drawSamHead(c, 960, 520, 1.1, E, 0, 'chonmage'); label(c, 'A: Chonmage', 960, 960);
    drawSamHead(c, 1590, 520, 1.1, E, 0, 'bun'); label(c, 'B: Dutt', 1590, 960);
  } },
  { name: 'child', dur: 1, draw(c) {
    paper(c);
    drawSam(c, { x: 700, y: 980, k: .55, ink: 1.6, outfit: 'samurai', expr: { mouth: 'smile', lid: .2 } });
    drawChild(c, { x: 1150, y: 980, k: .55, bokken: true, arms: { r: { a: .5, b: -.3, fist: true } }, expr: { mouth: 'press' } });
    label(c, 'Kind (eigene Figur)', 1150, 1050, 34);
  } },
]);
