// TRIBE: Magdalenian people in the same drawing language as Noah (round head, dot eyes, thick ink).
// Units like NOAH (head r 262, standing ≈ 1527); draw at k ≈ .25 adults, .2 teens, .15–.17 children, .1 baby.
// tribe(c, P, t)  front view          tribeSide(c, P, t)  side view (walk/crouch/throw)
// P: { x, y, k, s, who: <person def>, arms, expr, walk, pose: 'stand'|'sit'|'crouch'|'kneel', bob, tilt, item, item2 }
const TOUT = '#211c1a';
const TSKIN = { a: '#f1d2b6', b: '#dcb08a', c: '#c08a62', d: '#9a6844', e: '#7a4e32' };
const LEATH = { tan: ['#a8784a', '#7e5530', '#c99a66'], brown: ['#7a5236', '#553722', '#9a7050'], grey: ['#8a8076', '#625a52', '#aaa196'], dark: ['#5a4232', '#3c2c20', '#7a5e48'], red: ['#9a5a3a', '#6e3c24', '#b87a56'] };
const FURC = { light: ['#d9c4a0', '#b09a78', '#efe0c4'], brown: ['#8a6440', '#5e4228', '#ab8458'], grey: ['#a09a92', '#78726a', '#c4beb4'] };
// person definitions (recurring characters keep the same look in every scene)
const PEOPLE = {
  oma:     { skin: TSKIN.b, hair: 'bun', hairCol: '#d8d4cc', coat: LEATH.brown, fur: FURC.light, elder: 1, female: 1, beads: 'shell', ochre: 1 },
  junge:   { skin: TSKIN.c, hair: 'short', hairCol: '#2e2420', coat: LEATH.tan, fur: FURC.brown, teen: 1, beads: 'tooth' },
  meister: { skin: TSKIN.b, hair: 'tied', hairCol: '#4a3426', beard: 'full', beardCol: '#4a3426', coat: LEATH.dark, fur: FURC.grey, beads: 'tooth', ochre: 0 },
  jaeger:  { skin: TSKIN.d, hair: 'long', hairCol: '#1e1612', beard: 'short', beardCol: '#1e1612', coat: LEATH.grey, fur: FURC.brown, ochre: 2, beads: 'tooth', tall: 1 },
  erzaehler:{ skin: TSKIN.c, hair: 'long', hairCol: '#e2ded6', beard: 'long', beardCol: '#e2ded6', coat: LEATH.brown, fur: FURC.grey, elder: 1, beads: 'shell' },
  malerin: { skin: TSKIN.a, hair: 'braids', hairCol: '#7a3e22', coat: LEATH.red, fur: FURC.light, female: 1, beads: 'shell', ochre: 1 },
  // extras
  frau1: { skin: TSKIN.d, hair: 'braids', hairCol: '#1a1410', coat: LEATH.tan, fur: FURC.brown, female: 1, beads: 'shell' },
  frau2: { skin: TSKIN.a, hair: 'bun', hairCol: '#6a4a30', coat: LEATH.grey, fur: FURC.light, female: 1 },
  frau3: { skin: TSKIN.c, hair: 'long', hairCol: '#2a1e18', coat: LEATH.dark, fur: FURC.grey, female: 1, beads: 'tooth', ochre: 1 },
  mann1: { skin: TSKIN.c, hair: 'short', hairCol: '#2a1e18', beard: 'full', beardCol: '#2a1e18', coat: LEATH.tan, fur: FURC.grey, beads: 'tooth' },
  mann2: { skin: TSKIN.a, hair: 'tied', hairCol: '#9a6a3a', beard: 'short', beardCol: '#9a6a3a', coat: LEATH.brown, fur: FURC.light },
  mann3: { skin: TSKIN.e, hair: 'short', hairCol: '#141010', beard: 'short', beardCol: '#141010', coat: LEATH.grey, fur: FURC.brown, ochre: 2 },
  opa:   { skin: TSKIN.a, hair: 'bald', hairCol: '#cfcac2', beard: 'full', beardCol: '#cfcac2', coat: LEATH.grey, fur: FURC.light, elder: 1 },
  kind1: { skin: TSKIN.b, hair: 'short', hairCol: '#5a3a24', coat: LEATH.tan, fur: FURC.light, child: 1 },
  kind2: { skin: TSKIN.d, hair: 'braids', hairCol: '#1a1410', coat: LEATH.red, fur: FURC.brown, child: 1, female: 1 },
  kind3: { skin: TSKIN.a, hair: 'long', hairCol: '#b07a42', coat: LEATH.brown, fur: FURC.grey, child: 1, female: 1 },
  teen2: { skin: TSKIN.e, hair: 'tied', hairCol: '#141010', coat: LEATH.dark, fur: FURC.brown, teen: 1, female: 1, beads: 'shell' },
  baby:  { skin: TSKIN.b, hair: 'short', hairCol: '#5a3a24', coat: FURC.light, fur: FURC.light, baby: 1 },
};
const tl = (c, pts, w, col) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
const tf = (c, fill, w = 13) => { if (fill) { c.fillStyle = fill; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = TOUT; c.lineJoin = 'round'; c.stroke(); } };

// ---------- head (front) ----------
function tribeHead(c, d, e = {}) {
  const cy = -1240, R = 262;
  // hair behind head
  if (d.hair === 'long' || d.hair === 'braids') { c.beginPath(); c.moveTo(-R + 10, cy - 60); c.quadraticCurveTo(-R - 40, cy + 200, -R + 30, cy + 330); c.lineTo(R - 30, cy + 330); c.quadraticCurveTo(R + 40, cy + 200, R - 10, cy - 60); c.closePath(); tf(c, d.hairCol, 10); }
  if (d.hood === 'up') { c.beginPath(); c.ellipse(0, cy - 10, R + 70, R + 60, 0, 0, Math.PI * 2); tf(c, d.fur[0], 12); furEdge(c, 0, cy - 10, R + 66, R + 56, d.fur); }
  // skull with soft shade
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = shadeT(d.skin, -.12); c.fill(); c.clip();
  c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = d.skin; c.fill();
  if (d.ochre === 1) { for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 150, cy + 90, 34, 14, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(190,80,40,.55)'; c.fill(); } }
  if (d.ochre === 2) { for (const s of [-1, 1]) for (let i = 0; i < 2; i++) tl(c, [s * 120, cy + 40 + i * 34, s * 200, cy + 30 + i * 34], 12, 'rgba(180,70,35,.75)'); }
  if (d.elder) { tl(c, [-60, cy - 120, 60, cy - 120], 4, 'rgba(60,40,30,.35)'); tl(c, [-50, cy - 95, 50, cy - 95], 4, 'rgba(60,40,30,.3)'); for (const s of [-1, 1]) tl(c, [s * 140, cy + 30, s * 160, cy + 50], 4, 'rgba(60,40,30,.35)'); }
  c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); tf(c, null, 13);
  // hair cap per style
  const H = d.hairCol;
  if (d.hair !== 'bald') {
    c.beginPath(); c.moveTo(-R + 4, cy - 10);
    c.bezierCurveTo(-R - 10, cy - 200, -150, cy - 290, 0, cy - 288); c.bezierCurveTo(150, cy - 290, R + 10, cy - 200, R - 4, cy - 10);
    if (d.hair === 'short' || d.hair === 'tied') { c.bezierCurveTo(R - 30, cy - 120, 120, cy - 170, 30, cy - 150); c.quadraticCurveTo(-60, cy - 185, -150, cy - 150); c.bezierCurveTo(-210, cy - 130, -R + 26, cy - 90, -R + 4, cy - 10); }
    else { c.bezierCurveTo(R - 26, cy - 130, 90, cy - 200, 0, cy - 160); c.bezierCurveTo(-90, cy - 200, -R + 26, cy - 130, -R + 4, cy - 10); }
    c.closePath(); tf(c, H, 10);
    c.save(); c.clip(); for (let i = -4; i <= 4; i++) tl(c, [i * 44, cy - 160 - Math.abs(i) * 8, i * 56, cy - 290], 4, shadeT(H, i % 2 ? -.25 : .2)); c.restore();
  } else { for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * (R - 22), cy - 10, 34, 80, 0, 0, Math.PI * 2); tf(c, d.hairCol, 8); } }
  if (d.hair === 'bun') { c.beginPath(); c.arc(0, cy - 300, 80, 0, Math.PI * 2); tf(c, H, 10); tl(c, [-60, cy - 300, 60, cy - 300], 5, shadeT(H, -.25)); }
  if (d.hair === 'tied') { c.beginPath(); c.arc(0, cy - 296, 46, 0, Math.PI * 2); tf(c, H, 9); }
  if (d.hair === 'braids') for (const s of [-1, 1]) { for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(s * (R - 20), cy + 40 + i * 70, 34, 42, 0, 0, Math.PI * 2); tf(c, H, 8); } tl(c, [s * (R - 20), cy + 360, s * (R - 10), cy + 400], 10, '#b07a42'); }
  // face
  const ey = cy + 25, lid = e.lid || 0, look = e.look || 0;
  for (const s of [-1, 1]) {
    const ex = s * 92;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 26, ey - 4); c.quadraticCurveTo(ex, ey + 20, ex + 26, ey - 4); c.lineWidth = 9; c.strokeStyle = '#231d1b'; c.lineCap = 'round'; c.stroke(); }
    else {
      const sq = e.squint ? .55 : 1;
      c.save(); c.beginPath(); c.rect(ex - 40, ey - 40 + lid * 70, 80, 90); c.clip(); c.beginPath(); c.ellipse(ex + look * 6, ey, 22, 32 * sq, 0, 0, Math.PI * 2); c.fillStyle = '#231d1b'; c.fill();
      c.beginPath(); c.arc(ex + look * 6 + 8, ey - 10, 7, 0, Math.PI * 2); c.fillStyle = 'rgba(255,250,240,.9)'; c.fill(); c.restore();
      if (lid > .05) tl(c, [ex - 25, ey - 34 + lid * 68, ex + 25, ey - 34 + lid * 68], 7, '#231d1b');
    }
  }
  const bu = (e.browUp || 0) * 18, bf = e.frown || 0;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 140, cy - 22 - bu); c.quadraticCurveTo(s * 95, cy - 46 - bu + bf * 20, s * 52, cy - 36 - bu + bf * 26); c.lineWidth = 14; c.strokeStyle = shadeT(d.hairCol === '#d8d4cc' || d.elder ? '#8a8078' : d.hairCol, .1); c.lineCap = 'round'; c.stroke(); }
  if (d.beard) tribeBeard(c, d, cy, e);
  const my = cy + 148, m = e.mouth || 'smile';
  if (m === 'smile') { c.beginPath(); c.moveTo(-58, my - 6); c.quadraticCurveTo(0, my + 22, 58, my - 6); c.lineWidth = 9; c.strokeStyle = TOUT; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'soft') { c.beginPath(); c.moveTo(-30, my); c.quadraticCurveTo(0, my + 10, 30, my); c.lineWidth = 8; c.strokeStyle = TOUT; c.stroke(); }
  else if (m === 'flat') tl(c, [-34, my + 2, 34, my + 2], 8, TOUT);
  else if (m === 'frown') { c.beginPath(); c.moveTo(-40, my + 10); c.quadraticCurveTo(0, my - 12, 40, my + 10); c.lineWidth = 8; c.strokeStyle = TOUT; c.stroke(); }
  else { // 'o' | 'laugh' | 'shout' | 'talk'
    const o = m === 'laugh' ? .9 : m === 'shout' ? 1 : m === 'talk' ? (e.open ?? .5) : .45;
    const rw = m === 'laugh' ? 62 : 26 + 14 * o, rh = 12 + 44 * o;
    c.beginPath(); if (m === 'laugh') { c.moveTo(-rw, my - 10); c.quadraticCurveTo(0, my - 4, rw, my - 10); c.quadraticCurveTo(rw * .7, my + rh, 0, my + rh); c.quadraticCurveTo(-rw * .7, my + rh, -rw, my - 10); } else c.ellipse(0, my + 6, rw, rh, 0, 0, Math.PI * 2);
    c.fillStyle = '#5a2026'; c.fill(); c.lineWidth = 8; c.strokeStyle = TOUT; c.stroke();
  }
}
function tribeBeard(c, d, cy, e) {
  const L = d.beard === 'long' ? 200 : d.beard === 'full' ? 110 : 50;
  c.beginPath(); c.moveTo(-240, cy + 10); c.bezierCurveTo(-240, cy + 160, -170, cy + 230 + L * .6, 0, cy + 250 + L);
  c.bezierCurveTo(170, cy + 230 + L * .6, 240, cy + 160, 240, cy + 10); c.lineTo(222, cy + 10); c.bezierCurveTo(200, cy + 120, 150, cy + 140, 90, cy + 130); c.quadraticCurveTo(0, cy + 115, -90, cy + 130); c.bezierCurveTo(-150, cy + 140, -200, cy + 120, -222, cy + 10); c.closePath();
  tf(c, d.beardCol, 9); c.save(); c.clip(); for (let i = 0; i < 12; i++) tl(c, [-150 + i * 27, cy + 150, -150 + i * 27 + (i - 6) * 3, cy + 230 + L * .8], 4, shadeT(d.beardCol, i % 2 ? -.3 : .25)); c.restore();
  const open = e.mouth && !['smile', 'soft', 'flat', 'frown'].includes(e.mouth);
  c.beginPath(); c.ellipse(0, cy + 154, open ? 62 : 48, open ? 64 : 20, 0, 0, Math.PI * 2); c.fillStyle = d.skin; c.fill(); c.lineWidth = 5; c.strokeStyle = TOUT; c.stroke();
  c.beginPath(); c.moveTo(-100, cy + 152); c.quadraticCurveTo(-70, cy + 104, 0, cy + 120); c.quadraticCurveTo(70, cy + 104, 100, cy + 152); c.quadraticCurveTo(60, cy + 136, 0, cy + 142); c.quadraticCurveTo(-60, cy + 136, -100, cy + 152); c.closePath(); tf(c, d.beardCol, 5);
}
function shadeT(col, k) { return shadeHex(col, k); }
function furEdge(c, x, y, rx, ry, fur) { c.save(); for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry; tl(c, [px, py, px + Math.cos(a) * 26, py + Math.sin(a) * 26], 9, i % 2 ? fur[2] : fur[1]); } c.restore(); }

// ---------- body parts (front) ----------
function tribeArm(c, side, spec, d, item) {
  const sx = side * 150, sy = -915, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * 215, ey = sy + Math.cos(a) * 215, wx = ex + side * Math.sin(a2) * 205, wy = ey + Math.cos(a2) * 205;
  tl(c, [sx, sy, ex, ey, wx, wy], 92 + 26, TOUT); tl(c, [sx, sy, ex, ey, wx, wy], 92, d.coat[0]);
  tl(c, [sx + 10, sy, ex + 10, ey], 18, shadeT(d.coat[0], -.15));
  // fur cuff
  const cx = ex + (wx - ex) * .86, cy = ey + (wy - ey) * .86; c.beginPath(); c.arc(cx, cy, 52, 0, Math.PI * 2); tf(c, d.fur[0], 9);
  c.save(); c.translate(wx, wy); handT(c, -side * a2 + (spec.hand || 0), d.skin, spec.fist); c.restore();
  if (item) { c.save(); c.translate(wx, wy); c.rotate(-side * a2 + (spec.itemRot || 0)); tDrawItem(c, item, side); c.restore(); }
}
function handT(c, ang, skin, fist) {
  c.save(); c.rotate(ang);
  if (fist) { c.beginPath(); c.ellipse(0, 40, 44, 50, 0, 0, Math.PI * 2); tf(c, skin, 10); tl(c, [-20, 30, 20, 30], 5, TOUT); c.restore(); return; }
  c.beginPath(); c.moveTo(-34, -6); c.quadraticCurveTo(-44, 50, -26, 92); c.quadraticCurveTo(-14, 104, -6, 86); c.lineTo(-4, 100); c.quadraticCurveTo(8, 112, 16, 94); c.lineTo(20, 98); c.quadraticCurveTo(32, 104, 34, 84); c.quadraticCurveTo(44, 40, 34, -6); c.closePath(); tf(c, skin, 10);
  c.beginPath(); c.moveTo(-32, 20); c.quadraticCurveTo(-62, 44, -52, 66); c.quadraticCurveTo(-40, 72, -30, 52); tf(c, skin, 9);
  c.restore();
}
function tribeTorso(c, d) {
  // hooded parka/tunic, fringe hem, belt with visible stitching, necklace
  const coat = d.coat;
  c.beginPath(); c.moveTo(-70, -965); c.lineTo(-165, -945); c.quadraticCurveTo(-180, -700, -175, -360); c.lineTo(175, -360); c.quadraticCurveTo(180, -700, 165, -945); c.lineTo(70, -965); c.closePath();
  const g = c.createLinearGradient(-175, 0, 175, 0); g.addColorStop(0, shadeT(coat[0], -.12)); g.addColorStop(.45, coat[0]); g.addColorStop(1, shadeT(coat[0], -.22)); c.fillStyle = g; c.fill(); c.lineWidth = 13; c.strokeStyle = TOUT; c.stroke();
  // seams (sinew stitches)
  c.save(); c.setLineDash([14, 12]); tl(c, [0, -930, 0, -380], 4, coat[2]); tl(c, [-120, -900, -130, -400], 3, shadeT(coat[2], -.1)); tl(c, [120, -900, 130, -400], 3, shadeT(coat[2], -.1)); c.restore();
  // fringe hem
  for (let i = 0; i < 12; i++) { const x = -165 + i * 30; tl(c, [x, -362, x - 4, -310 - (i % 3) * 10], 9, coat[1]); }
  // fur collar / hood down behind neck
  if (d.hood !== 'up') { c.beginPath(); c.ellipse(0, -960, 150, 50, 0, 0, Math.PI * 2); tf(c, d.fur[0], 10); furEdge(c, 0, -960, 140, 44, d.fur); }
  // belt
  tl(c, [-176, -540, 176, -540], 40, TOUT); tl(c, [-174, -540, 174, -540], 26, d.coat[1]);
  c.save(); c.setLineDash([10, 10]); tl(c, [-170, -540, 170, -540], 3, coat[2]); c.restore();
  // pouch
  c.beginPath(); c.moveTo(70, -530); c.lineTo(140, -530); c.quadraticCurveTo(150, -440, 105, -430); c.quadraticCurveTo(62, -440, 70, -530); tf(c, shadeT(coat[0], -.25), 8);
  // necklace
  if (d.beads) { c.beginPath(); c.moveTo(-90, -950); c.quadraticCurveTo(0, -830, 90, -950); c.lineWidth = 4; c.strokeStyle = '#3a2a1e'; c.stroke();
    for (let i = 0; i < 9; i++) { const u = i / 8, x = -84 + u * 168, y = -948 + Math.sin(u * Math.PI) * 112; if (d.beads === 'shell') { c.beginPath(); c.ellipse(x, y, 13, 16, 0, 0, Math.PI * 2); tf(c, '#f2ead8', 4); } else { c.beginPath(); c.moveTo(x - 9, y - 6); c.quadraticCurveTo(x, y + 36, x + 9, y - 6); c.closePath(); tf(c, '#efe4c8', 4); } } }
}
function tribeLegs(c, d, legs) {
  for (const s of [-1, 1]) {
    const lift = (legs && legs[s < 0 ? 0 : 1]) || 0;
    c.beginPath(); c.moveTo(s * 10, -380); c.lineTo(s * 125, -380); c.lineTo(s * 120, -180 - lift); c.lineTo(s * 20, -180 - lift); c.closePath(); tf(c, d.coat[1], 12);
    // fur-lined soft boots
    c.beginPath(); c.moveTo(s * 14, -200 - lift); c.lineTo(s * 128, -200 - lift); c.quadraticCurveTo(s * 196, -60 - lift, s * 200, -16 - lift); c.quadraticCurveTo(s * 190, 4 - lift, s * 140, 2 - lift); c.lineTo(s * 26, 2 - lift); c.quadraticCurveTo(s * 6, -80 - lift, s * 14, -200 - lift); tf(c, d.coat[1] === LEATH.dark[1] ? '#4a3626' : shadeT(d.coat[1], -.1), 12);
    c.beginPath(); c.ellipse(s * 70, -200 - lift, 70, 28, 0, 0, Math.PI * 2); tf(c, d.fur[0], 9);
  }
}
const ITEMS = {
  spear: (c, s, o = {}) => { const L = o.len || 2000; tl(c, [0, 900, 0, 900 - L], 34, TOUT); tl(c, [0, 900, 0, 900 - L], 20, '#9a6a3c'); c.beginPath(); c.moveTo(-26, 900 - L + 10); c.lineTo(0, 900 - L - 120); c.lineTo(26, 900 - L + 10); c.closePath(); tf(c, '#b8b2a8', 8); tl(c, [-22, 900 - L + 20, 22, 900 - L - 4], 8, '#c9a46a'); },
  thrower: (c) => { tl(c, [0, 40, 0, -330], 30, TOUT); tl(c, [0, 40, 0, -330], 18, '#d8c8a8'); c.beginPath(); c.moveTo(-8, -330); c.quadraticCurveTo(26, -350, 18, -300); tf(c, '#d8c8a8', 7); for (let i = 0; i < 4; i++) tl(c, [-6, -40 - i * 60, 6, -60 - i * 60], 3, '#7a6448'); },
  flint: (c) => { c.beginPath(); c.moveTo(-50, 30); c.lineTo(-10, -30); c.lineTo(50, -10); c.lineTo(40, 50); c.lineTo(-20, 60); c.closePath(); tf(c, '#8a8a96', 8); tl(c, [-20, 0, 20, 10], 4, '#c4c4d0'); },
  antler: (c) => { tl(c, [0, 60, 10, -200], 40, TOUT); tl(c, [0, 60, 10, -200], 26, '#d8c8a8'); tl(c, [6, -120, 60, -170], 22, TOUT); tl(c, [6, -120, 60, -170], 12, '#d8c8a8'); },
  flute: (c) => { tl(c, [0, 40, 0, -300], 36, TOUT); tl(c, [0, 40, 0, -300], 24, '#efe4cc'); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, -40 - i * 60, 7, 0, Math.PI * 2); c.fillStyle = '#3a2a1e'; c.fill(); } },
  meat: (c) => { c.beginPath(); c.ellipse(0, 40, 70, 46, .3, 0, Math.PI * 2); tf(c, '#8a3a26', 9); c.beginPath(); c.ellipse(-10, 30, 40, 22, .3, 0, Math.PI * 2); c.fillStyle = '#b0563a'; c.fill(); tl(c, [40, 60, 110, 90], 26, '#efe4c8'); },
  torch: (c, s, o = {}) => { tl(c, [0, 60, 0, -380], 34, TOUT); tl(c, [0, 60, 0, -380], 20, '#6a4a2a'); },
  grass: (c) => { for (let i = 0; i < 9; i++) tl(c, [0, 30, -40 + i * 10, -60 - rnd(i) * 40], 6, i % 2 ? '#c9a24a' : '#a8843a'); },
  berries: (c) => { c.beginPath(); c.ellipse(0, 30, 60, 30, 0, 0, Math.PI); tf(c, '#7a5530', 8); for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-40 + i * 13, 22 - (i % 2) * 10, 11, 0, Math.PI * 2); tf(c, '#3a3a7a', 4); } },
  egg: (c) => { c.beginPath(); c.ellipse(0, 20, 26, 34, 0, 0, Math.PI * 2); tf(c, '#e6e2cc', 7); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-8 + i * 6, 10 + (i % 2) * 14, 4, 0, Math.PI * 2); c.fillStyle = '#8a7a5a'; c.fill(); } },
  stick: (c) => { tl(c, [0, 60, 0, -460], 26, TOUT); tl(c, [0, 60, 0, -460], 14, '#7a5636'); },
  needle: (c) => { tl(c, [0, 30, 0, -120], 12, '#efe4cc'); c.beginPath(); c.arc(0, -105, 5, 0, Math.PI * 2); c.fillStyle = '#3a2a1e'; c.fill(); },
};
function tDrawItem(c, it, side) { const o = typeof it === 'string' ? { k: it } : it; c.save(); if (o.rot) c.rotate(o.rot); if (o.dx || o.dy) c.translate(o.dx || 0, o.dy || 0); ITEMS[o.k](c, side, o); c.restore(); }
const AGE_K = d => d.baby ? .38 : d.child ? .64 : d.teen ? .84 : d.tall ? 1.05 : d.elder ? .96 : d.female ? .95 : 1;

// ---------- front view ----------
function tribe(c, P, t = 0) {
  const d = typeof P.who === 'string' ? PEOPLE[P.who] : P.who, k = (P.k ?? .25) * AGE_K(d), e = P.expr || {};
  const arms = Object.assign({ l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } }, P.arms || {});
  const blink = P.blink !== false && (Math.sin((t + (P.x || 0) * .01) * 1.3) > .985) ? { lid: .95 } : {};
  c.save(); c.translate(P.x || 0, P.y || 0); c.scale(k * (P.s || 1), k);
  if (d.elder && P.pose !== 'lie') c.rotate(.02);
  const pose = P.pose || 'stand';
  let dy = 0;
  if (pose === 'sit' || pose === 'crouch' || pose === 'kneel') {
    dy = pose === 'crouch' ? 260 : pose === 'kneel' ? 220 : 230;
    // folded legs: knees forward
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 120, -160, 120, 90, 0, 0, Math.PI * 2); tf(c, d.coat[1], 12); c.beginPath(); c.ellipse(s * 140, -40, 100, 50, 0, 0, Math.PI * 2); tf(c, shadeT(d.coat[1], -.1), 11); }
  } else tribeLegs(c, d, P.legs);
  c.translate(0, dy + (P.bob || 0) + Math.sin(t * 1.6 + (P.x || 0)) * 6);
  const up = arms.l.a > 1.6 || arms.r.a > 1.6;
  if (!up) { tribeArm(c, -1, arms.l, d, P.item2); tribeArm(c, 1, arms.r, d, P.item); }
  tribeTorso(c, d);
  if (P.babyInArm) { c.save(); c.translate(-40, -700); c.scale(.42, .42); c.translate(0, 900); tribeHead(c, PEOPLE.baby, { eyes: 'closed', mouth: 'soft' }); c.restore(); c.beginPath(); c.ellipse(-40, -640, 120, 90, 0, 0, Math.PI * 2); tf(c, FURC.light[0], 10); }
  c.save(); c.translate(0, -980); c.rotate(P.tilt || 0); c.translate(0, 980);
  tribeHead(c, d, Object.assign({}, e, blink.lid && e.eyes !== 'closed' ? blink : {}));
  c.restore();
  if (up) { tribeArm(c, -1, arms.l, d, P.item2); tribeArm(c, 1, arms.r, d, P.item); }
  c.restore();
}
// ---------- side view (facing s = 1 right / -1 left) ----------
function tribeSide(c, P, t = 0) {
  const d = typeof P.who === 'string' ? PEOPLE[P.who] : P.who, k = (P.k ?? .25) * AGE_K(d), e = P.expr || {};
  const ph = P.walk, walking = ph != null, sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
  const crouch = P.pose === 'crouch' ? 1 : 0, bob = (walking ? -Math.abs(Math.cos(ph)) * 14 : 0) + crouch * 240 + (P.bob || 0);
  c.save(); c.translate(P.x || 0, P.y || 0); c.scale(k * (P.s || 1), k);
  const leg = (th, bend, far) => {
    const hx = 0, hy = -380 + crouch * 240, L1 = crouch ? 230 : 200, L2 = 200;
    const th1 = crouch ? th + .9 : th, kx = hx + Math.sin(th1) * L1, ky = hy + Math.cos(th1) * L1;
    const t2 = crouch ? th1 - 2.0 : th - bend, ax = kx + Math.sin(t2) * L2, ay = Math.min(-10, ky + Math.cos(t2) * L2);
    const col = far ? shadeT(d.coat[1], -.2) : d.coat[1];
    tl(c, [hx, hy, kx, ky, ax, ay], 110 + 26, TOUT); tl(c, [hx, hy, kx, ky, ax, ay], 110, col);
    c.save(); c.translate(ax, ay); c.beginPath(); c.moveTo(-60, -60); c.lineTo(-62, 30); c.lineTo(120, 32); c.quadraticCurveTo(150, 20, 130, -10); c.quadraticCurveTo(80, -50, 30, -60); c.closePath(); tf(c, far ? '#3e2e22' : '#54402e', 12); c.restore();
  };
  const arm = (th, bend, far, item) => {
    const sx = -10, sy = -915 + bob, ex = sx + Math.sin(th) * 215, ey = sy + Math.cos(th) * 215, t2 = th + bend, wx = ex + Math.sin(t2) * 205, wy = ey + Math.cos(t2) * 205;
    tl(c, [sx, sy, ex, ey, wx, wy], 92 + 26, TOUT); tl(c, [sx, sy, ex, ey, wx, wy], 92, far ? shadeT(d.coat[0], -.2) : d.coat[0]);
    c.save(); c.translate(wx, wy); handT(c, -t2, far ? shadeT(d.skin, -.1) : d.skin, P.fist); if (item) { c.rotate(-t2); tDrawItem(c, item, 1); } c.restore();
  };
  const A = P.armsSide || {}, sa = P.armSwing ?? .4;
  arm(A.farA ?? (walking ? sa * sw : .1), A.farB ?? .15, true, P.item2);
  leg(walking ? -.42 * sw : -.05, walking ? .7 * lift2 : 0, true);
  leg(walking ? .42 * sw : .05, walking ? .7 * lift : 0, false);
  c.save(); c.translate(0, bob);
  // torso (side): parka with hood bump at the back
  c.beginPath(); c.moveTo(-120, -960); c.quadraticCurveTo(-150, -700, -140, -360); c.lineTo(130, -360); c.quadraticCurveTo(140, -700, 100, -960); c.closePath(); tf(c, d.coat[0], 13);
  c.save(); c.setLineDash([14, 12]); tl(c, [60, -930, 70, -380], 4, d.coat[2]); c.restore();
  for (let i = 0; i < 9; i++) tl(c, [-130 + i * 30, -362, -134 + i * 30, -312 - (i % 3) * 10], 9, d.coat[1]);
  tl(c, [-146, -540, 136, -540], 40, TOUT); tl(c, [-144, -540, 134, -540], 26, d.coat[1]);
  if (d.hood !== 'up') { c.beginPath(); c.ellipse(-90, -950, 90, 60, -.3, 0, Math.PI * 2); tf(c, d.fur[0], 10); }
  // head (profile-ish like Noah's side view: both eyes towards the front)
  c.save(); c.translate(0, -980); c.rotate(P.tilt || 0); c.translate(0, 980);
  tribeSideHead(c, d, e, t);
  c.restore();
  c.restore();
  arm(A.nearA ?? (walking ? -sa * sw : .05), A.nearB ?? .15, false, P.item);
  c.restore();
}
function tribeSideHead(c, d, e) {
  const cx = 0, cy = -1240, R = 255, H = d.hairCol;
  if (d.hair === 'long' || d.hair === 'braids') { c.beginPath(); c.moveTo(-60, cy - 200); c.quadraticCurveTo(-320, cy + 40, -220, cy + 330); c.lineTo(-60, cy + 200); c.closePath(); tf(c, H, 10); }
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fillStyle = shadeT(d.skin, -.12); c.fill(); c.clip(); c.beginPath(); c.arc(cx + 6, cy - 30, R - 4, 0, Math.PI * 2); c.fillStyle = d.skin; c.fill();
  if (d.ochre === 2) tl(c, [80, cy + 70, 200, cy + 60], 12, 'rgba(180,70,35,.75)');
  c.restore(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); tf(c, null, 13);
  if (d.hair !== 'bald') { c.beginPath(); c.moveTo(150, cy - 210); c.bezierCurveTo(60, cy - 300, -200, cy - 300, -250, cy - 120); c.bezierCurveTo(-268, cy - 20, -250, cy + 60, -200, cy + 130); c.bezierCurveTo(-120, cy + 40, -60, cy - 60, -20, cy - 130); c.quadraticCurveTo(60, cy - 170, 150, cy - 210); c.closePath(); tf(c, H, 10); }
  else { c.beginPath(); c.arc(-180, cy + 20, 70, 1.8, 4.6); c.fillStyle = H; c.fill(); }
  if (d.hair === 'bun') { c.beginPath(); c.arc(-150, cy - 250, 78, 0, Math.PI * 2); tf(c, H, 10); }
  if (d.hair === 'tied') { c.beginPath(); c.arc(-210, cy - 180, 46, 0, Math.PI * 2); tf(c, H, 9); tl(c, [-230, cy - 150, -280, cy + 40], 30, H); }
  if (d.hair === 'braids') for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(-210, cy + 40 + i * 66, 32, 40, 0, 0, Math.PI * 2); tf(c, H, 8); }
  for (const [ex, sc] of [[122, .95], [214, .78]]) {
    const ey = cy + 28;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 22, ey - 4); c.quadraticCurveTo(ex, ey + 18, ex + 22, ey - 4); c.lineWidth = 9; c.strokeStyle = '#231d1b'; c.stroke(); }
    else { const lid = e.lid || 0; c.save(); c.beginPath(); c.rect(ex - 40, ey - 40 + lid * 70, 80, 90); c.clip(); c.beginPath(); c.ellipse(ex, ey, 20 * sc, 30, 0, 0, Math.PI * 2); c.fillStyle = '#231d1b'; c.fill(); c.restore(); }
  }
  const bu = (e.browUp || 0) * 16, bf = (e.frown || 0) * 18;
  tl(c, [88, cy - 32 - bu, 122, cy - 50 - bu + bf * .5, 155, cy - 36 - bu + bf], 13, shadeT(H, .1));
  if (d.beard) { c.beginPath(); c.moveTo(-160, cy + 60); c.quadraticCurveTo(-60, cy + 180, 60, cy + 200); c.quadraticCurveTo(160, cy + 210, 220, cy + 100); c.quadraticCurveTo(210, cy + 240 + (d.beard === 'long' ? 160 : d.beard === 'full' ? 70 : 10), 60, cy + 270 + (d.beard === 'long' ? 160 : 40)); c.quadraticCurveTo(-100, cy + 250, -160, cy + 60); c.closePath(); tf(c, d.beardCol, 9); }
  const m = e.mouth || 'smile';
  if (m === 'smile') { c.beginPath(); c.moveTo(100, cy + 142); c.quadraticCurveTo(145, cy + 162, 190, cy + 140); c.lineWidth = 9; c.strokeStyle = TOUT; c.stroke(); }
  else if (m === 'soft' || m === 'flat' || m === 'frown') tl(c, [112, cy + 148, 168, cy + 148], 8, TOUT);
  else { const o = m === 'shout' || m === 'laugh' ? 1 : .45; c.beginPath(); c.ellipse(148, cy + 152, 18 + 10 * o, 12 + 34 * o, 0, 0, Math.PI * 2); c.fillStyle = '#5a2026'; c.fill(); c.lineWidth = 7; c.strokeStyle = TOUT; c.stroke(); }
}
// a sleeper under a fur: only the head + fur mound (lying, seen from the side-front)
function sleeper(c, x, who, o = {}) {
  const d = PEOPLE[who], k = (o.k ?? .25) * AGE_K(d), L = (o.len ?? 1500) * k;
  c.save(); c.translate(x, 0);
  c.beginPath(); c.moveTo(-L * .1, 0); c.quadraticCurveTo(-L * .05, -130 * k / .25 - (o.breath || 0), L * .45, -135 * k / .25 - (o.breath || 0)); c.quadraticCurveTo(L * .95, -110 * k / .25, L, 0); c.closePath();
  c.save(); c.clip(); furPatch(c, -L * .2, -140 * k / .25, L * 1.1, 10, (x | 0) % 97, o.fur || FURC.brown, { n: 500, len: 14 * k / .25, lw: 2.2 * k / .25, dir: 1.5 }); c.restore();
  c.lineWidth = 3; c.strokeStyle = TOUT; c.stroke();
  c.save(); c.translate(-L * .02, -70 * k / .25); c.rotate(-1.35 * (o.dir || 1)); c.scale(k, k); c.translate(0, 1240); tribeHead(c, d, { eyes: 'closed', mouth: 'soft' }); c.restore();
  c.restore();
}
