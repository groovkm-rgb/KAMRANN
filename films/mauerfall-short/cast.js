// Supporting cast (toon-shorts defChar rig, scaled to Noah's height: sc .53 ≈ 1,75 m at 1 m ≈ 220 units).
// Generic, stylised people only: no real person likenesses, no logos.
const PSC = .53;
const CAST = {
  spokes: defChar({ skin: 'pale', eyes: 'dot', brows: 'thick', browColor: '#4a3a30', hair: { style: 'side', color: '#6a5a4c' }, nose: 'round',
    glasses: { style: 'square', color: '#3a3330' }, top: { style: 'suit', color: '#8a8c90', inner: '#e8e6e0' }, neck: { style: 'tie', color: '#5a4050' }, pants: '#7a7c80', shoes: '#2a2626', seed: 3 }),
  off1: defChar({ skin: 'light', eyes: 'dot', hair: { style: 'short', color: '#8a8480' }, top: { style: 'suit', color: '#5f646c', inner: '#e8e6e0' }, neck: { style: 'tie', color: '#334' }, pants: '#555a60', seed: 7 }),
  off2: defChar({ skin: 'pale', eyes: 'dot', hair: { style: 'bald', color: '#9a9496' }, glasses: { style: 'round', color: '#444' }, top: { style: 'suit', color: '#6e6a64', inner: '#efece4' }, neck: { style: 'tie', color: '#6a3a3a' }, pants: '#5a5650', seed: 11 }),
  j1: defChar({ skin: 'light', hair: { style: 'curly', color: 'brown' }, glasses: { style: 'round', color: '#333' }, top: { style: 'sweater', color: '#b4763c' }, pants: '#5a4a3a', stubble: true, seed: 21 }),
  j2: defChar({ skin: 'pale', lashes: true, hair: { style: 'bob', color: 'blond' }, top: { style: 'coat', color: '#c9b48a', inner: '#f2efe6' }, pants: '#4a4a55', lips: '#b8344f', seed: 22 }),
  j3: defChar({ skin: 'tan', hair: { style: 'short', color: 'black' }, facial: { style: 'thin', color: '#2b2326' }, top: { style: 'suit', color: '#3c4a66', inner: '#f2efe6' }, neck: { style: 'tie', color: '#a33' }, pants: '#2f3a50', seed: 23 }),
  j4: defChar({ skin: 'light', hair: { style: 'tufts', color: 'grey' }, glasses: { style: 'square', color: '#222' }, top: { style: 'vest', color: '#7a6a50', inner: '#e8e2d0' }, pants: '#4a4036', seed: 24 }),
  j5: defChar({ skin: 'pale', lashes: true, hair: { style: 'long', color: 'chestnut' }, top: { style: 'sweater', color: '#5a7a6a', pattern: 'stripes', patternColor: '#e8e0c8' }, pants: '#3a3a44', seed: 25 }),
  j6: defChar({ skin: 'olive', hair: { style: 'spiky', color: 'brown' }, top: { style: 'hoodie', color: '#8a3a3a' }, pants: '#3a4050', seed: 26 }),
  j7: defChar({ skin: 'light', hair: { style: 'combover', color: 'brown' }, facial: { style: 'beard', color: '#5a3b26' }, top: { style: 'coat', color: '#5a5a48', inner: '#d8d0bc' }, pants: '#3a3a32', seed: 27 }),
  j8: defChar({ skin: 'pale', hair: { style: 'short', color: 'ginger' }, freckles: true, top: { style: 'shirt', color: '#7c9cc0' }, pants: '#4a4a52', seed: 28 }),
  soldier: defChar({ skin: 'light', eyes: 'dot', hair: { style: 'short', color: 'brown' }, hat: { style: 'flatcap', color: '#5c6450', band: '#3a3e32' }, top: { style: 'coat', color: '#6a7258', inner: '#5a6048' }, belt: { color: '#3a3326', buckle: '#b9a46a' }, pants: '#545a46', shoes: '#1f1c1a', seed: 31 }),
  officer: defChar({ skin: 'pale', eyes: 'dot', brows: 'thick', hair: { style: 'short', color: 'grey' }, hat: { style: 'flatcap', color: '#5c6450', band: '#7a2a2a' }, top: { style: 'coat', color: '#626a52', inner: '#545a44' }, belt: { color: '#3a3326', buckle: '#b9a46a' }, pants: '#4c5240', shoes: '#1f1c1a', seed: 32 }),
  c1: defChar({ skin: 'light', hair: { style: 'short', color: 'brown' }, hat: { style: 'beanie', color: '#b04040' }, top: { style: 'coat', color: '#4a5a7a', inner: '#ddd' }, neck: { style: 'scarf', color: '#e0c050' }, pants: '#3a3a40', seed: 41 }),
  c2: defChar({ skin: 'pale', lashes: true, hair: { style: 'ponytail', color: 'blond' }, top: { style: 'coat', color: '#9a4a5a', inner: '#eee' }, neck: { style: 'scarf', color: '#f0f0e8' }, pants: '#3a3440', seed: 42 }),
  c3: defChar({ skin: 'tan', hair: { style: 'afro', color: 'black' }, top: { style: 'hoodie', color: '#4f7a5a' }, pants: '#2f3a4a', seed: 43 }),
  c4: defChar({ skin: 'light', hair: { style: 'tufts', color: 'white' }, glasses: { style: 'round', color: '#444' }, hat: { style: 'flatcap', color: '#6a5a48' }, top: { style: 'coat', color: '#7a6a52', inner: '#ddd' }, pants: '#4a4036', seed: 44 }),
  c5: defChar({ skin: 'pale', lashes: true, hair: { style: 'curly', color: 'chestnut' }, top: { style: 'coat', color: '#3f6f7a', inner: '#eee' }, neck: { style: 'scarf', color: '#d05050' }, pants: '#33333c', seed: 45 }),
  c6: defChar({ skin: 'light', hair: { style: 'spiky', color: 'blond' }, top: { style: 'sweater', color: '#c8843a', pattern: 'stripes', patternColor: '#7a3a2a' }, pants: '#3a4258', seed: 46 }),
  c7: defChar({ skin: 'olive', hair: { style: 'short', color: 'black' }, facial: { style: 'horseshoe', color: '#2b2326' }, top: { style: 'coat', color: '#5a4a3a', inner: '#ccc' }, pants: '#2a2a30', seed: 47 }),
  c8: defChar({ skin: 'pale', lashes: true, hair: { style: 'bun', color: 'brown' }, hat: { style: 'beanie', color: '#4a6aa0' }, top: { style: 'coat', color: '#c0a060', inner: '#eee' }, pants: '#3a3040', seed: 48 }),
};
const JOURN = ['j1', 'j2', 'j3', 'j4', 'j5', 'j6', 'j7', 'j8'];
const CROWD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
// pose factory: person at x (feet), scale relative to Noah
const P = (who, x, o = {}) => Object.assign({ who: CAST[who], x, y: 0, s: 1, sc: PSC, look: [0, 0], ...EXPR.neutral }, o);
const person = (c, t, p) => drawPerson(c, p, t);

// ---- held items ----
function itemMic(c, o = {}) { // hand microphone with windscreen
  line(c, [0, 10, 0, -70], 16); line(c, [0, 10, 0, -70], 9, '#2a2a2e');
  ell(c, 0, -90, 22, 26); fs(c, o.color || '#3a3a40', 5); c.globalAlpha = .3; for (let i = -2; i <= 2; i++) line(c, [-18, -90 + i * 8, 18, -90 + i * 8], 2, '#fff'); c.globalAlpha = 1;
}
function itemPad(c) { c.beginPath(); c.rect(-26, -40, 52, 70); fs(c, '#f6f2e2', 4); for (let i = 0; i < 5; i++) line(c, [-18, -26 + i * 11, 18, -26 + i * 11], 2, '#8aa0c0'); line(c, [-26, -40, 26, -40], 7, '#c03a3a'); }
function itemFlashCam(c, t, fire) { // press camera with flash gun
  c.beginPath(); c.rect(-48, -36, 96, 60); fs(c, '#2c2a2e', 5); circle(c, 0, -6, 24); fs(c, '#4a4a52', 4); circle(c, 0, -6, 13); fs(c, '#1a2a3a', 3);
  c.beginPath(); c.rect(-40, -96, 34, 60); fs(c, '#3a3a40', 4); c.beginPath(); c.rect(-44, -112, 42, 22); fs(c, fire ? '#fffbe8' : '#d8dde2', 4);
}
function itemPaper(c) { c.beginPath(); c.moveTo(-40, -70); c.lineTo(42, -76); c.lineTo(46, 40); c.lineTo(-36, 46); c.closePath(); fs(c, '#f4f1e6', 4); for (let i = 0; i < 7; i++) line(c, [-26, -54 + i * 13, 30 - (i % 3) * 8, -56 + i * 13], 3, '#6a6a72'); }
function itemPhone(c) { // telephone handset
  c.save(); c.rotate(-.3); c.beginPath(); c.roundRect(-14, -70, 28, 140, 12); fs(c, '#3a3a36', 5); ell(c, 0, -74, 24, 16); fs(c, '#3a3a36', 5); ell(c, 0, 74, 24, 16); fs(c, '#3a3a36', 5); c.restore();
}
function itemBottle(c, o = {}) { // champagne bottle (no label text)
  c.save(); c.rotate(o.tilt || 0); c.beginPath(); c.moveTo(-20, 40); c.lineTo(-20, -40); c.quadraticCurveTo(-20, -60, -8, -72); c.lineTo(-8, -110); c.lineTo(8, -110); c.lineTo(8, -72); c.quadraticCurveTo(20, -60, 20, -40); c.lineTo(20, 40); c.closePath(); fs(c, '#2f5a3a', 5);
  c.beginPath(); c.rect(-9, -112, 18, 30); fs(c, '#e8c860', 4); c.beginPath(); c.rect(-20, -20, 40, 34); fs(c, '#f2ead0', 3); c.restore();
}
