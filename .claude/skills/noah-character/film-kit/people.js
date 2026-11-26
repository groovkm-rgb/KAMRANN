// OTHER CHARACTERS in Noah's style (white round head, dot eyes, thick ink) built on the same skeleton
// (NOAH geometry), told apart by hair, glasses, beard and detailed clothes. Front view.
//   drawPerson(c, { x, y, k, s, who, arms, expr, sit, seatH, bob, tilt, legs, onlyArms, item:{side, draw(c)} })
//   who = { hair:{style,col}, beard, glasses, hat, top:{type,col,col2,tie,apron,pattern}, bottom:{type,col}, shoes, brow, gloves }
const PEOPLE = {
  oma: { hair: { style: 'bun', col: '#b9b4ae' }, glasses: { style: 'round', col: '#8a6a3a' }, brow: '#9a948e', top: { type: 'cardigan', col: '#8a5a6a', col2: '#efe6d6', pattern: 'knit' }, bottom: { type: 'skirt', col: '#5a4a5a' }, shoes: '#4a3a34', apron: '#e8d9b0' },
  advisor: { hair: { style: 'side', col: '#3a2e28' }, glasses: { style: 'square', col: '#222' }, top: { type: 'suit', col: '#3a4250', col2: '#f2f2f4', tie: '#2f5a8a' }, bottom: { type: 'pants', col: '#3a4250' }, shoes: '#1e1a18' },
  vormieter: { hair: { style: 'messy', col: '#6a4a2a' }, beard: 'stubble', top: { type: 'denim', col: '#4a6a9a', col2: '#d8d0c0' }, bottom: { type: 'pants', col: '#3a3a40' }, shoes: '#5a4030' },
  landlord: { hair: { style: 'bald', col: '#8a8078' }, beard: 'mustache', top: { type: 'sweater', col: '#6a7a5a', col2: '#e8e0d0' }, bottom: { type: 'pants', col: '#5a5048' }, shoes: '#2a2420' },
  clerk: { hair: { style: 'bob', col: '#7a4a32' }, glasses: { style: 'square', col: '#7a2a4a' }, top: { type: 'blouse', col: '#a8c4d8', col2: '#fff' }, bottom: { type: 'skirt', col: '#3a3a48' }, shoes: '#2a2420' },
  clerk2: { hair: { style: 'short', col: '#9a9088' }, glasses: { style: 'round', col: '#333' }, top: { type: 'shirt', col: '#e8e2c8', col2: '#fff', tie: '#6a5a3a' }, bottom: { type: 'pants', col: '#6a6458' }, shoes: '#3a3028' },
  chef: { hair: { style: 'short', col: '#2a2220' }, beard: 'full', hat: 'toque', top: { type: 'chef', col: '#fbfaf6' }, bottom: { type: 'pants', col: '#2f2a30' }, shoes: '#1e1a18' },
  sous: { hair: { style: 'curly', col: '#3a2418' }, hat: 'bandana', top: { type: 'chef', col: '#f4f2ec', bandana: '#c23a3a' }, bottom: { type: 'pants', col: '#2f2a30' }, shoes: '#1e1a18' },
  cook: { hair: { style: 'buzz', col: '#4a3a30' }, hat: 'cap', top: { type: 'chef', col: '#f4f2ec' }, bottom: { type: 'pants', col: '#3a3436' }, shoes: '#1e1a18' },
  lukas: { hair: { style: 'messy', col: '#c89a5a' }, top: { type: 'tshirt', col: '#8a8e94', rubber: '#e8a020' }, bottom: { type: 'pants', col: '#3a3e48' }, shoes: '#2a2a2e', gloves: '#f2cf2a' },
  waiterA: { hair: { style: 'pony', col: '#2a1e18' }, top: { type: 'waiter', col: '#f6f4ef', col2: '#232022' }, bottom: { type: 'pants', col: '#232022' }, shoes: '#1e1a18' },
  waiterB: { hair: { style: 'side', col: '#b87a3a' }, top: { type: 'waiter', col: '#f6f4ef', col2: '#232022' }, bottom: { type: 'pants', col: '#232022' }, shoes: '#1e1a18' },
  waiterC: { hair: { style: 'curly', col: '#1e1612' }, top: { type: 'waiter', col: '#f6f4ef', col2: '#232022' }, bottom: { type: 'pants', col: '#232022' }, shoes: '#1e1a18' },
  boss: { hair: { style: 'bald', col: '#4a3a30' }, beard: 'mustache', top: { type: 'suit', col: '#5a2a2a', col2: '#efe6d6', tie: '#c9a24a' }, bottom: { type: 'pants', col: '#3a2424' }, shoes: '#1e1a18' },
  mother: { hair: { style: 'long', col: '#5a3a2a' }, top: { type: 'sweater', col: '#c98a7a', col2: '#f0e6d8', pattern: 'knit' }, bottom: { type: 'pants', col: '#4a4a5a' }, shoes: '#3a2a24' },
  inspectorW: { hair: { style: 'bob', col: '#2a2228' }, top: { type: 'blazer', col: '#5a5a62', col2: '#eae6dc' }, bottom: { type: 'pants', col: '#3a3a40' }, shoes: '#1e1a18' },
  inspectorM: { hair: { style: 'side', col: '#6a6a6a' }, glasses: { style: 'square', col: '#333' }, top: { type: 'blazer', col: '#4a4a3e', col2: '#dfe6ea' }, bottom: { type: 'pants', col: '#3a3830' }, shoes: '#2a2420' },
  host: { hair: { style: 'long', col: '#c8a060' }, top: { type: 'dress', col: '#1e2440', col2: '#c9a24a' }, bottom: { type: 'skirt', col: '#1e2440' }, shoes: '#111' },
  guest: (i) => { const H = ['short', 'long', 'side', 'curly', 'bob', 'bald', 'pony', 'messy', 'bun'], C = ['#2a2220', '#6a4a2a', '#c8a060', '#3a2418', '#8a8078', '#a0522d', '#1e1612'], T = ['sweater', 'shirt', 'blouse', 'blazer', 'dress', 'tshirt', 'cardigan'], TC = ['#3a5a8a', '#8a3a4a', '#4a7a5a', '#c9a24a', '#5a4a7a', '#d8d0c0', '#7a5a3a', '#2a4a5a', '#b05a3a'];
    return { hair: { style: H[i % H.length], col: C[(i * 3) % C.length] }, glasses: i % 4 === 1 ? { style: i % 8 === 1 ? 'round' : 'square', col: '#2a2a2a' } : null, beard: i % 5 === 2 ? 'stubble' : (i % 7 === 3 ? 'full' : null), top: { type: T[(i * 5) % T.length], col: TC[(i * 7) % TC.length], col2: '#f2ede2', tie: i % 6 === 0 ? '#2a3a6a' : null, pattern: i % 3 === 0 ? 'knit' : null }, bottom: { type: i % 4 === 2 ? 'skirt' : 'pants', col: ['#2a2a34', '#4a3a30', '#3a4a5a'][i % 3] }, shoes: '#2a2420' }; },
};
function personHairBack(c, w, cy, R) {
  const h = w.hair || {}, col = h.col || '#333';
  if (h.style === 'long' || h.style === 'bob') { const L = h.style === 'long' ? 330 : 190; c.beginPath(); c.moveTo(-R - 14, cy - 40); c.quadraticCurveTo(-R - 40, cy + L * .6, -R + 10, cy + L); c.lineTo(R - 10, cy + L); c.quadraticCurveTo(R + 40, cy + L * .6, R + 14, cy - 40); c.closePath(); nFill(c, col, NOAH.W * .8); }
  if (h.style === 'pony') { c.beginPath(); c.moveTo(R - 40, cy - 60); c.quadraticCurveTo(R + 120, cy + 40, R + 60, cy + 260); c.quadraticCurveTo(R + 20, cy + 120, R - 60, cy + 20); c.closePath(); nFill(c, col, NOAH.W * .8); }
  if (h.style === 'bun') { c.beginPath(); c.arc(0, cy - R - 40, 92, 0, Math.PI * 2); nFill(c, col, NOAH.W * .8); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(0, cy - R - 40, 30 + i * 12, -2.6 + i * .3, -.6 + i * .2); c.lineWidth = 5; c.strokeStyle = shade(col, -.25); c.stroke(); } }
}
function personHairFront(c, w, cy, R) {
  const h = w.hair || {}, col = h.col || '#333', st = h.style || 'short', dark = shade(col, -.3), lite = shade(col, .25);
  const strands = (n, y0, y1, spread) => { for (let i = 0; i < n; i++) { const x = (i / (n - 1) - .5) * spread; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x * 1.1, (y0 + y1) / 2, x * 1.3, y1); c.lineWidth = 4; c.strokeStyle = i % 2 ? dark : lite; c.stroke(); } };
  if (st === 'bald') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (R - 2), cy - 10); c.quadraticCurveTo(s * (R + 12), cy - 110, s * (R - 60), cy - 175); c.lineTo(s * (R - 80), cy - 140); c.quadraticCurveTo(s * (R - 30), cy - 80, s * (R - 30), cy - 6); c.closePath(); nFill(c, col, NOAH.W * .7); } c.beginPath(); c.ellipse(-70, cy - 170, 60, 26, -.3, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); return; }
  let path;
  if (st === 'bun' || st === 'side' || st === 'short' || st === 'buzz' || st === 'pony' || st === 'long' || st === 'bob') {
    const fringe = st === 'short' || st === 'bob' ? 150 : st === 'buzz' ? 175 : 165, part = st === 'side' ? -70 : st === 'bun' || st === 'long' || st === 'pony' ? 0 : null;
    path = () => { c.beginPath(); c.moveTo(-R + 4, cy - 10); c.bezierCurveTo(-R - 18, cy - 190, -170, cy - R - 30, 0, cy - R - 26); c.bezierCurveTo(170, cy - R - 30, R + 18, cy - 190, R - 4, cy - 10);
      if (st === 'short' || st === 'bob') { c.quadraticCurveTo(R - 30, cy - 120, 150, cy - fringe); c.quadraticCurveTo(60, cy - fringe + 30, 0, cy - fringe + 6); c.quadraticCurveTo(-90, cy - fringe + 34, -170, cy - fringe); c.quadraticCurveTo(-R + 30, cy - 120, -R + 4, cy - 10); }
      else if (part != null) { c.quadraticCurveTo(R - 26, cy - 150, part + 120, cy - fringe - 10); c.quadraticCurveTo(part + 30, cy - fringe - 30, part, cy - fringe - 40); c.quadraticCurveTo(part - 50, cy - fringe - 10, -170, cy - fringe + 10); c.quadraticCurveTo(-R + 26, cy - 130, -R + 4, cy - 10); }
      else { c.quadraticCurveTo(R - 20, cy - 140, 0, cy - fringe); c.quadraticCurveTo(-R + 20, cy - 140, -R + 4, cy - 10); }
      c.closePath(); };
    path(); nFill(c, col, NOAH.W * .8); c.save(); path(); c.clip();
    if (st === 'buzz') { for (let i = 0; i < 60; i++) { c.beginPath(); c.arc((rnd(i) - .5) * 2 * R, cy - R + rnd(i + 3) * 160, 3, 0, Math.PI * 2); c.fillStyle = dark; c.fill(); } }
    else if (st === 'bun' || st === 'long' || st === 'pony') { for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(s * 6, cy - fringe - 40); c.quadraticCurveTo(s * (90 + i * 40), cy - R - 10 + i * 20, s * (R - 10 - i * 8), cy - 40 + i * 6); c.lineWidth = 4; c.strokeStyle = i % 2 ? dark : lite; c.stroke(); } }
    else strands(8, cy - R - 20, cy - fringe + 10, 340);
    c.restore();
  } else if (st === 'curly' || st === 'messy') {
    const n = st === 'curly' ? 14 : 9, pts = [];
    for (let i = 0; i < n; i++) { const a = Math.PI + (i / (n - 1)) * Math.PI, r = R + (st === 'curly' ? 34 : 20); pts.push([Math.cos(a) * r * .98, cy - 30 + Math.sin(a) * r * .92, st === 'curly' ? 58 : 70 + rnd(i) * 20]); }
    c.beginPath(); c.moveTo(-R + 4, cy - 10); c.bezierCurveTo(-R - 18, cy - 190, -170, cy - R - 30, 0, cy - R - 26); c.bezierCurveTo(170, cy - R - 30, R + 18, cy - 190, R - 4, cy - 10); c.quadraticCurveTo(0, cy - 230, -R + 4, cy - 10); nFill(c, col, NOAH.W * .7);
    for (const [x, y, r] of pts) { c.beginPath(); if (st === 'curly') c.arc(x, y, r, 0, Math.PI * 2); else { c.moveTo(x - r * .6, y + 20); c.quadraticCurveTo(x, y - r, x + r * .7, y + 10); c.quadraticCurveTo(x, y - 10, x - r * .6, y + 20); } nFill(c, col, NOAH.W * .6); if (st === 'curly') { c.beginPath(); c.arc(x, y, r * .5, 3.6, 5.6); c.lineWidth = 4; c.strokeStyle = lite; c.stroke(); } }
  }
}
function personHat(c, w, cy, R) {
  if (w.hat === 'toque') { c.beginPath(); c.rect(-200, cy - R - 60, 400, 110); nFill(c, '#fbfaf6', NOAH.W * .8); for (const [x, y, r] of [[-130, cy - R - 120, 110], [0, cy - R - 170, 130], [130, cy - R - 120, 110]]) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); nFill(c, '#fbfaf6', NOAH.W * .8); } c.beginPath(); c.rect(-196, cy - R - 64, 392, 110); c.fillStyle = '#fbfaf6'; c.fill(); for (const x of [-120, -40, 40, 120]) nLine(c, [x, cy - R - 50, x, cy - R + 40], 4, '#d8d4ca'); nLine(c, [-200, cy - R + 50, 200, cy - R + 50], NOAH.W * .8, NOAH.out); }
  if (w.hat === 'bandana') { c.beginPath(); c.moveTo(-R - 6, cy - 80); c.quadraticCurveTo(0, cy - R - 120, R + 6, cy - 80); c.quadraticCurveTo(0, cy - 160, -R - 6, cy - 80); nFill(c, w.top.bandana || '#c23a3a', NOAH.W * .7); for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(-160 + i * 46, cy - 170 - Math.sin(i / 7 * Math.PI) * 70, 8, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); } }
  if (w.hat === 'cap') { c.beginPath(); c.moveTo(-R + 6, cy - 100); c.quadraticCurveTo(0, cy - R - 110, R - 6, cy - 100); c.closePath(); nFill(c, '#2a2a30', NOAH.W * .7); c.beginPath(); c.ellipse(60, cy - 100, 200, 30, 0, 0, Math.PI * 2); nFill(c, '#2a2a30', NOAH.W * .7); }
}
function personFace(c, w, e, cy) {
  const R = NOAH.HEAD.r;
  const B0 = NOAH.brow; NOAH.brow = w.brow || shade((w.hair && w.hair.col) || '#555', .1); try { noahFace(c, Object.assign({}, e, { beard: 0 })); } finally { NOAH.brow = B0; }
  if (e.worry) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 140, cy - 22); c.quadraticCurveTo(s * 95, cy - 46, s * 52, cy - 36); c.lineWidth = 20; c.strokeStyle = NOAH.skin; c.lineCap = 'round'; c.stroke(); c.beginPath(); c.moveTo(s * 146, cy - 22); c.quadraticCurveTo(s * 100, cy - 40, s * 54, cy - 36 - e.worry * 34); c.lineWidth = 15; c.strokeStyle = w.brow || '#555'; c.stroke(); }
  if (e.angry) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 140, cy - 22); c.quadraticCurveTo(s * 95, cy - 46, s * 52, cy - 36); c.lineWidth = 20; c.strokeStyle = NOAH.skin; c.lineCap = 'round'; c.stroke(); nLine(c, [s * 150, cy - 50, s * 50, cy - 14], 16, w.brow || '#555'); }
  if (w.beard === 'full') { const H0 = NOAH.hair; NOAH.hair = (w.hair && w.hair.col) || '#333'; try { noahBeard(c, cy, e); noahMoustache(c, cy); } finally { NOAH.hair = H0; } e._moustache = false; }
  if (w.beard === 'mustache') { const H0 = NOAH.hair; NOAH.hair = w.mustacheCol || shade((w.hair && w.hair.col) || '#333', -.1); try { noahMoustache(c, cy); } finally { NOAH.hair = H0; } }
  if (w.beard === 'stubble') { for (let i = 0; i < 70; i++) { const a = Math.PI * (.12 + rnd(i) * .76), r = 180 + rnd(i + 4) * 70; c.beginPath(); c.arc(Math.cos(a) * r, cy + Math.sin(a) * r * .95, 3.5, 0, Math.PI * 2); c.fillStyle = 'rgba(70,60,55,.55)'; c.fill(); } }
  if (e.mouth === 'talk') { const o = e.open ?? .5, my = cy + 148; c.beginPath(); c.ellipse(0, my + 6, 34, 10 + 30 * o, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  if (e.mouth === 'grin') { const my = cy + 148; c.beginPath(); c.moveTo(-66, my - 12); c.quadraticCurveTo(0, my + 40, 68, my - 12); c.closePath(); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(-70, my - 16, 140, 16); c.restore(); }
  if (e.mouth === 'frown') { const my = cy + 148; c.beginPath(); c.moveTo(-44, my + 14); c.quadraticCurveTo(0, my - 14, 44, my + 14); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  const g = w.glasses; if (g) { c.lineWidth = 9; c.strokeStyle = g.col || '#222';
    for (const s of [-1, 1]) { c.beginPath(); if (g.style === 'round') c.arc(s * 92, cy + 25, 58, 0, Math.PI * 2); else c.roundRect(s * 92 - 66, cy - 18, 132, 92, 18); c.fillStyle = 'rgba(200,225,240,.18)'; c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(-34, cy + 14); c.quadraticCurveTo(0, cy - 4, 34, cy + 14); c.stroke(); nLine(c, [-150, cy + 10, -R + 4, cy - 4], 7, g.col || '#222'); nLine(c, [150, cy + 10, R - 4, cy - 4], 7, g.col || '#222');
    c.beginPath(); c.moveTo(-120, cy - 2); c.lineTo(-100, cy - 10); c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.8)'; c.stroke(); }
  if (w.earring) for (const s of [-1, 1]) { c.beginPath(); c.arc(s * (R + 4), cy + 70, 12, 0, Math.PI * 2); nFill(c, '#c9a24a', 4); }
}
function personHead(c, w, e) {
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r;
  personHairBack(c, w, cy, R);
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip(); c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);
  if (w.hat !== 'toque' && w.hat !== 'cap') personHairFront(c, w, cy, R);
  personHat(c, w, cy, R);
  personFace(c, w, e, cy);
}
function personTorso(c, w) {
  const T = w.top || {}, col = T.col || '#888', c2 = T.col2 || '#fff', ty = T.type || 'shirt';
  const hem = ty === 'blazer' || ty === 'suit' ? NOAH.HEM + 50 : ty === 'cardigan' ? NOAH.HEM + 40 : NOAH.HEM;
  noahTorsoPath(c, ty === 'suit' || ty === 'blazer' ? 8 : 0, hem); nFill(c, col);
  c.save(); noahTorsoPath(c, 8, hem); c.clip(); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(-180, -960, 50, 600); c.fillRect(124, -960, 50, 600);
  if (T.pattern === 'knit') for (let y = -900; y < hem; y += 34) for (let x = -150; x < 160; x += 30) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8, y + 12); c.lineTo(x + 16, y); c.lineWidth = 3; c.strokeStyle = shade(col, -.18); c.stroke(); }
  c.restore();
  if (ty === 'suit' || ty === 'blazer') {
    c.beginPath(); c.moveTo(-58, -950); c.quadraticCurveTo(0, -915, 58, -950); c.lineTo(18, -700); c.lineTo(-18, -700); c.closePath(); nFill(c, c2, NOAH.W * .6);
    if (T.tie) { c.beginPath(); c.moveTo(-14, -912); c.lineTo(14, -912); c.lineTo(20, -735); c.lineTo(0, -712); c.lineTo(-20, -735); c.closePath(); nFill(c, T.tie, 5); }
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 60, -952); c.lineTo(s * 98, -938); c.lineTo(s * 100, -880); c.lineTo(s * 84, -866); c.lineTo(s * 94, -840); c.lineTo(s * 22, -690); c.lineTo(s * 30, -760); c.closePath(); nFill(c, shade(col, .12), NOAH.W * .6); stitchLine(c, [s * 84, -930, s * 88, -860, s * 36, -740], shade(col, .3), 2.5); }
    for (const y of [-650, -570]) { c.beginPath(); c.arc(8, y, 11, 0, Math.PI * 2); nFill(c, shade(col, -.35), 4); }
    for (const s of [-1, 1]) nLine(c, [s * 50, -540, s * 120, -546], 8, shade(col, -.35)); nLine(c, [0, -700, 0, hem], 4, shade(col, -.3));
  } else if (ty === 'shirt' || ty === 'blouse') {
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -925); c.lineTo(s * 62, -958); c.lineTo(s * 50, -885); c.closePath(); nFill(c, shade(col, .2), NOAH.W * .6); }
    if (T.tie) { c.beginPath(); c.moveTo(-14, -912); c.lineTo(14, -912); c.lineTo(20, -640); c.lineTo(0, -616); c.lineTo(-20, -640); c.closePath(); nFill(c, T.tie, 5); }
    else { nLine(c, [0, -920, 0, NOAH.HEM], 4, shade(col, -.25)); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(10, -870 + i * 72, 7, 0, Math.PI * 2); nFill(c, '#fff', 3); } }
    c.beginPath(); c.rect(-120, -820, 56, 6); c.fillStyle = shade(col, -.25); c.fill();
  } else if (ty === 'cardigan') {
    c.beginPath(); c.moveTo(-58, -950); c.quadraticCurveTo(0, -915, 58, -950); c.lineTo(24, NOAH.HEM + 40); c.lineTo(-24, NOAH.HEM + 40); c.closePath(); nFill(c, c2, NOAH.W * .6);
    for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(30, -820 + i * 80, 10, 0, Math.PI * 2); nFill(c, '#d8c8a8', 4); }
    for (const s of [-1, 1]) { c.beginPath(); c.rect(s * 60 - 34, -640, 68, 70); nFill(c, shade(col, -.08), 4); }
    if (w.apron) { c.beginPath(); c.moveTo(-110, -700); c.lineTo(110, -700); c.lineTo(126, -380); c.lineTo(-126, -380); c.closePath(); nFill(c, w.apron, NOAH.W * .7); for (let i = 0; i < 6; i++) for (let k = 0; k < 7; k++) if ((i + k) % 2) { c.fillStyle = 'rgba(200,80,80,.35)'; c.fillRect(-110 + k * 34, -690 + i * 50, 30, 46); } }
  } else if (ty === 'sweater') { c.beginPath(); c.moveTo(-60, -952); c.quadraticCurveTo(0, -900, 60, -952); c.lineWidth = 22; c.strokeStyle = shade(col, -.15); c.stroke(); nLine(c, [-120, NOAH.HEM + 20, 124, NOAH.HEM + 20], 26, shade(col, -.15)); }
  else if (ty === 'tshirt') { c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke(); if (T.rubber) { c.beginPath(); c.moveTo(-100, -860); c.lineTo(100, -860); c.lineTo(132, -200); c.lineTo(-132, -200); c.closePath(); nFill(c, T.rubber, NOAH.W * .8); nLine(c, [-100, -860, -130, -960], 10, T.rubber); nLine(c, [100, -860, 130, -960], 10, T.rubber); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-80, -840, 20, 600); } }
  else if (ty === 'denim') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 58, -950); c.lineTo(s * 96, -920); c.lineTo(s * 40, -780); c.lineTo(s * 8, -800); c.closePath(); nFill(c, shade(col, .1), 5); c.beginPath(); c.rect(s * 75 - 40, -820, 80, 60); nFill(c, shade(col, .05), 4); stitchLine(c, [s * 75 - 34, -790, s * 75 + 34, -790], '#e8b860', 2.5); } c.beginPath(); c.moveTo(-58, -950); c.quadraticCurveTo(0, -915, 58, -950); c.lineTo(8, -800); c.lineTo(-8, -800); c.closePath(); nFill(c, c2, 4); nLine(c, [0, -800, 0, NOAH.HEM], 5, shade(col, -.3)); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-14, -760 + i * 66, 8, 0, Math.PI * 2); nFill(c, '#c9a24a', 3); } stitchLine(c, [-120, -640, 124, -640], '#e8b860', 2.5); }
  else if (ty === 'chef') noahChefTorsoCol(c, col);
  else if (ty === 'waiter') noahWaiterTorso(c);
  else if (ty === 'dress') { c.beginPath(); c.moveTo(-60, -952); c.quadraticCurveTo(0, -880, 60, -952); c.lineWidth = 10; c.strokeStyle = T.col2 || '#c9a24a'; c.stroke(); for (let i = 0; i < 20; i++) { c.beginPath(); c.arc(-110 + rnd(i) * 220, -900 + rnd(i + 3) * 380, 4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,230,150,.6)'; c.fill(); } }
}
function noahChefTorsoCol(c) { const O = OUTFIT.chef; c.save(); noahChefTorso(c); c.restore(); }
function personLegs(c, w, p) {
  const B = w.bottom || {}, P0 = NOAH.pants, S0 = NOAH.stripe, SH0 = NOAH.shoe; NOAH.pants = B.col || '#444'; NOAH.stripe = B.col || '#444'; NOAH.shoe = w.shoes || '#2a2420';
  try {
    if (p.sit) noahLegsSitting(c, p, false); else noahLegs(c, p);
    if (B.type === 'skirt' && !p.sit) { c.beginPath(); c.moveTo(-128, NOAH.HEM - 30); c.lineTo(128, NOAH.HEM - 30); c.lineTo(160, -230); c.quadraticCurveTo(0, -210, -160, -230); c.closePath(); nFill(c, B.col); for (const x of [-80, 0, 80]) nLine(c, [x * .8, NOAH.HEM, x, -236], 4, shade(B.col, -.25)); }
  } finally { NOAH.pants = P0; NOAH.stripe = S0; NOAH.shoe = SH0; }
}
function drawPerson(c, p) {
  const w = p.who, W0 = NOAH.W; NOAH.W = W0 * (p.ink || 1.8);
  try {
    const k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = Object.assign({ mouth: 'soft' }, p.expr || {});
    const L = lifeAt(p.t || 0, p.seed || 5); if (!e.eyes) { e.lid = Math.max(e.lid || 0, L.lid); if (e.lid > .85) e.eyes = 'closed'; }
    const dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0, bob = (p.bob ?? L.bob * .7);
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
    if (!p.onlyArms) personLegs(c, w, p);
    c.save(); c.translate(0, dy + bob);
    const T = w.top || {}, ty = T.type || 'shirt';
    if (!p.onlyArms) { personTorso(c, w);
      c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
      if (ty === 'chef') { c.beginPath(); c.moveTo(-64, -960); c.quadraticCurveTo(0, -905, 64, -960); c.lineTo(58, -925); c.quadraticCurveTo(0, -880, -58, -925); c.closePath(); nFill(c, OUTFIT.chef.jacket, NOAH.W * .7); if (T.bandana) { c.beginPath(); c.moveTo(-60, -950); c.lineTo(60, -950); c.lineTo(0, -880); c.closePath(); nFill(c, T.bandana, 5); } }
      else if (ty === 'waiter') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -925); c.lineTo(s * 62, -958); c.lineTo(s * 50, -885); c.closePath(); nFill(c, '#f6f4ef', NOAH.W * .7); } c.beginPath(); c.moveTo(0, -930); c.lineTo(-46, -952); c.lineTo(-46, -904); c.closePath(); nFill(c, '#141214', 5); c.beginPath(); c.moveTo(0, -930); c.lineTo(46, -952); c.lineTo(46, -904); c.closePath(); nFill(c, '#141214', 5); }
      else if (ty === 'suit' || ty === 'blazer') { if (T.tie) { c.beginPath(); c.moveTo(-16, -930); c.lineTo(16, -930); c.lineTo(12, -905); c.lineTo(-12, -905); c.closePath(); nFill(c, T.tie, 4); } }
      else if (ty === 'tshirt' || ty === 'sweater' || ty === 'dress') { c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke(); }
    }
    const long = { shirt: 1, blouse: 1, suit: 1, blazer: 1, cardigan: 1, sweater: 1, chef: 1, waiter: 1, denim: 1 }[ty];
    const sl = ty === 'waiter' ? { col: '#f6f4ef', shade: '#d9d6cf', fold: '#cfcac1', cuff: '#fff', width: 84 } : { col: T.col || '#888', shade: shade(T.col || '#888', -.2), fold: shade(T.col || '#888', -.28), cuff: shade(T.col || '#888', ty === 'chef' ? -.05 : -.1), width: ty === 'suit' || ty === 'blazer' ? 94 : 88, shirtCuff: ty === 'suit' || ty === 'blazer' ? (T.col2 || '#fff') : null, cuffK: ty === 'chef' ? .78 : .86 };
    const drawArms = () => {
      for (const side of [-1, 1]) {
        const spec = side < 0 ? arms.l : arms.r;
        if (long) noahSleeveArm(c, side, spec, Object.assign({}, sl, { watch: false }));
        else { const S0 = NOAH.shirt; NOAH.shirt = T.col || '#888'; try { noahArm(c, side, spec, false, ty !== 'dress'); } finally { NOAH.shirt = S0; } }
        if (w.gloves) { const q = noahArmPts(side, spec); c.save(); c.translate(q.wx, q.wy); c.rotate(-side * q.a2); c.beginPath(); c.ellipse(0, 50, 52, 70, 0, 0, Math.PI * 2); nFill(c, w.gloves, NOAH.W * .8); c.beginPath(); c.rect(-46, -20, 92, 40); nFill(c, w.gloves, NOAH.W * .7); c.restore(); }
        if (p.item && p.item.side === side) { const q = noahArmPts(side, spec), fx = side * Math.sin(q.a2), fy = Math.cos(q.a2); c.save(); c.translate(q.wx + fx * 70, q.wy + fy * 70); c.scale(1 / k, 1 / k); p.item.draw(c); c.restore(); }
      }
    };
    if (p.onlyArms) drawArms();
    else { const up = arms.l.a > 1.6 || arms.r.a > 1.6; if (!up) drawArms(); c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260)); personHead(c, w, e); c.restore(); if (up) drawArms(); }
    c.restore(); c.restore();
  } finally { NOAH.W = W0; }
}
// convenience: talking mouth animation for a character speaking between t0..t1
function talkMouth(t, t0, t1) { if (t < t0 || t > t1) return null; const o = Math.abs(Math.sin(t * 13)) * .6 + Math.abs(Math.sin(t * 7.3)) * .3; return o > .25 ? { mouth: 'talk', open: o } : { mouth: 'soft' }; }
// walking in front view: alternate leg lifts + bob
function walkLegs(t, speed = 7) { const s = Math.sin(t * speed); return { legs: [Math.max(0, s) * 50, Math.max(0, -s) * 50], bob: -Math.abs(s) * 14 }; }
