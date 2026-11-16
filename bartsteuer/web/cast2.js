// ===================== cast2.js: Bartsteuer costumes (appended after cast.js into toon.js) =====================
// Big character beards (fork, curly, long, spade, bushy), shaved pink chins, fur boyar hats, fur collars, brocade,
// the Tsar's green coat + tall boots (tall rig), wigs, tricorns, glasses, tears, sweat, props (razor, quill, pouch,
// coin, scissors, soap brush, chicken leg, mirror, cloth bundle) and a horse-with-sled card.

const BEARD = {}; // beard outlines in head units (u), origin = head centre
const beardPts = (style, cx, cy, u, ph = 0) => {
  const o = [], sw = (k) => Math.sin(ph + k) * 6 * u; // sway in the wind
  if (style === 'fork') {
    o.push([cx - 112 * u, cy - 6 * u], [cx - 124 * u, cy + 70 * u], [cx - 110 * u, cy + 150 * u], [cx - 84 * u + sw(0), cy + 240 * u], [cx - 56 * u + sw(0.3), cy + 330 * u],
      [cx - 34 * u + sw(0.4), cy + 250 * u], [cx, cy + 190 * u], [cx + 34 * u + sw(0.6), cy + 250 * u], [cx + 58 * u + sw(0.8), cy + 330 * u], [cx + 86 * u + sw(1), cy + 240 * u],
      [cx + 112 * u, cy + 150 * u], [cx + 124 * u, cy + 70 * u], [cx + 112 * u, cy - 6 * u], [cx + 80 * u, cy + 50 * u], [cx, cy + 66 * u], [cx - 80 * u, cy + 50 * u]);
  } else if (style === 'long') {
    o.push([cx - 110 * u, cy - 8 * u], [cx - 122 * u, cy + 80 * u], [cx - 112 * u, cy + 180 * u], [cx - 88 * u + sw(0), cy + 280 * u], [cx - 56 * u + sw(0.4), cy + 380 * u],
      [cx - 18 * u + sw(0.8), cy + 440 * u], [cx + sw(1), cy + 470 * u], [cx + 22 * u + sw(1.1), cy + 436 * u], [cx + 60 * u + sw(0.9), cy + 376 * u], [cx + 90 * u + sw(0.5), cy + 276 * u],
      [cx + 114 * u, cy + 178 * u], [cx + 122 * u, cy + 80 * u], [cx + 110 * u, cy - 8 * u], [cx + 80 * u, cy + 50 * u], [cx, cy + 66 * u], [cx - 80 * u, cy + 50 * u]);
  } else if (style === 'spade') {
    o.push([cx - 114 * u, cy - 8 * u], [cx - 140 * u, cy + 90 * u], [cx - 150 * u + sw(0), cy + 190 * u], [cx - 120 * u + sw(0.3), cy + 250 * u], [cx - 40 * u + sw(0.5), cy + 262 * u],
      [cx + sw(0.6), cy + 290 * u], [cx + 40 * u + sw(0.7), cy + 262 * u], [cx + 120 * u + sw(0.9), cy + 250 * u], [cx + 150 * u + sw(1), cy + 190 * u], [cx + 140 * u, cy + 90 * u],
      [cx + 114 * u, cy - 8 * u], [cx + 80 * u, cy + 50 * u], [cx, cy + 66 * u], [cx - 80 * u, cy + 50 * u]);
  } else { // curly / bushy: a big round scalloped cloud
    const R = style === 'bushy' ? 1.18 : 1;
    for (let i = 0; i <= 26; i++) {
      const a = dg(-8 + 196 * i / 26), r = (i % 2 ? 0.9 : 1.04) * R;
      o.push([cx + 130 * u * r * Math.cos(a) + (i > 4 && i < 22 ? sw(i * 0.3) * 0.6 : 0), cy + 60 * u + 170 * u * r * Math.sin(a)]);
    }
    o.push([cx + 80 * u, cy + 50 * u], [cx, cy + 66 * u], [cx - 80 * u, cy + 50 * u]);
  }
  return o;
};
const curlRow = (g, cx, cy, u, col, n, y, w, r) => { for (let i = 0; i < n; i++) { const x = cx - w / 2 + (i + 0.5) * w / n; ln(g, ellP(x, y, r * u, r * u, 200, 520, 14), 4 * u, col); } };
/** draw a big beard + moustache over the lower face */
export const drawBigBeard = (g, H, style, col, ph = 0, mousCol) => {
  const { cx, cy, rx } = H, u = rx / 140; // tuned for the 140 px head
  const pts = beardPts(style, cx, cy, u, ph), dk = shadeC(col, 0.68), lt = mix(col, '#ffffff', 0.35);
  shaded(g, pts, col, dk, 8 * u, [-0.12, -0.06]);
  g.save(); pth(g, pts); g.clip();
  if (style === 'curly' || style === 'bushy') {
    for (let r = 0; r < 5; r++) curlRow(g, cx, cy, u, r % 2 ? dk : lt, 6 - (r > 2 ? 1 : 0), cy + 110 * u + r * 42 * u, 230 * u, 15);
  } else {
    const len = style === 'long' ? 440 : style === 'fork' ? 300 : 250;
    for (let k = 0; k < 9; k++) {
      const x = cx - 90 * u + k * 22.5 * u, w = Math.sin(ph + k) * 4 * u;
      ln(g, [[x, cy + 80 * u], [x + w + (x - cx) * 0.08, cy + 80 * u + len * 0.45 * u], [x + 2 * w - (x - cx) * 0.25, cy + len * u]], 3.2 * u, k % 2 ? dk : lt);
    }
  }
  g.restore();
  // big droopy moustache on top
  const mc = mousCol || shadeC(col, 0.9), my = cy + 56 * u;
  inkFill(g, [[cx, my - 16 * u], [cx + 30 * u, my - 22 * u], [cx + 62 * u, my - 6 * u], [cx + 86 * u, my + 24 * u], [cx + 70 * u, my + 30 * u], [cx + 40 * u, my + 12 * u], [cx, my + 4 * u],
    [cx - 40 * u, my + 12 * u], [cx - 70 * u, my + 30 * u], [cx - 86 * u, my + 24 * u], [cx - 62 * u, my - 6 * u], [cx - 30 * u, my - 22 * u]], mc, 6 * u);
  ln(g, [[cx - 54 * u, my - 4 * u], [cx - 16 * u, my - 10 * u]], 3 * u, mix(mc, '#ffffff', 0.3));
  ln(g, [[cx + 16 * u, my - 10 * u], [cx + 54 * u, my - 4 * u]], 3 * u, mix(mc, '#ffffff', 0.3));
};
/** a loose beard on its own (for flying beard cards); centred in the 600x1000 design canvas */
export const beardCard = (p, style, col, ph = 0) => { drawBigBeard(p.g, { cx: 300, cy: 300, rx: 196, ry: 126 }, style, col, ph); };

EXT.face = (g, H, o) => {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  if (o.glint) for (const s of [-1, 1]) { dt(g, fx + s * 37 * u + 6 * u, eyeY - 10 * u, 4.5 * u, '#ffffff'); }
  if (o.glasses) { for (const s of [-1, 1]) { g.lineWidth = 4.5 * u; g.strokeStyle = CK; g.beginPath(); g.arc(fx + s * 37 * u, eyeY, 22 * u, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(200,230,255,0.25)'; g.fill(); }
    ln(g, [[fx - 15 * u, eyeY - 2 * u], [fx + 15 * u, eyeY - 2 * u]], 4 * u); ln(g, [[fx + 58 * u, eyeY - 4 * u], [cx + rx * 0.98, eyeY - 12 * u]], 4 * u);
    ln(g, ellP(fx + 30 * u, eyeY - 8 * u, 10 * u, 10 * u, 200, 260, 6), 3 * u, '#ffffff'); }
  if (o.shaved) { // comically smooth pink chin
    const gr = g.createRadialGradient(fx, cy + 62 * u, 4 * u, fx, cy + 62 * u, 78 * u); gr.addColorStop(0, 'rgba(255,150,170,0.85)'); gr.addColorStop(0.6, 'rgba(255,170,185,0.5)'); gr.addColorStop(1, 'rgba(255,180,190,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(fx, cy + 62 * u, 84 * u, 46 * u, 0, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) dt(g, fx + s * 58 * u, cy + 28 * u, 13 * u, 'rgba(255,120,150,0.45)');
    ln(g, ellP(fx - 30 * u, cy + 72 * u, 18 * u, 10 * u, 200, 300, 8), 4 * u, '#ffffff');
  }
  if (o.bigBeard) drawBigBeard(g, { cx: fx * 0.7 + cx * 0.3, cy, rx: rx * 1.4, ry: rx }, o.bigBeard, o.beardCol || '#5a3a26', o.beardPh || 0, o.mousCol);
  if (o.medal) { const my2 = cy + 175 * u; ln(g, [[cx - 70 * u, cy + 60 * u], [cx, my2], [cx + 70 * u, cy + 60 * u]], 5 * u, '#c8202a');
    inkFill(g, ellP(cx, my2 + 26 * u, 34 * u, 34 * u, 0, 360, 24), '#f2c040', 5 * u); ln(g, ellP(cx, my2 + 26 * u, 24 * u, 24 * u, 0, 360, 20), 3 * u, '#a8761a'); ln(g, ellP(cx - 10 * u, my2 + 16 * u, 10 * u, 10 * u, 200, 290, 6), 3 * u, '#fff4c0'); }
  if (o.tears) { const t = o.tears; for (const s of [-1, 1]) { const x = fx + s * 37 * u; ln(g, [[x, eyeY + 10 * u], [x + s * 6 * u, eyeY + 70 * u], [x + s * 4 * u, eyeY + 140 * u]], 9 * u, '#7ec8f0');
      inkFill(g, ellP(x + s * 10 * u, eyeY + 60 * u + (t * 80 % 80) * u, 9 * u, 12 * u, 0, 360, 14), '#9fdcff', 3 * u); } }
  if (o.sweat) inkFill(g, [[cx + rx * 0.7, cy - 70 * u], [cx + rx * 0.78, cy - 40 * u], [cx + rx * 0.7, cy - 30 * u], [cx + rx * 0.62, cy - 40 * u]], '#bfe8ff', 3.5 * u);
  if (o.blush) for (const s of [-1, 1]) dt(g, fx + s * 60 * u, cy + 18 * u, 14 * u, 'rgba(255,110,140,0.4)');
};

EXT.hat = (g, H, o, h) => {
  const { cx, cy, rx, ry } = H, u = rx / 100, top = cy - ry, c = h.color || '#5a3a26';
  if (h.type === 'fur') { // tall boyar fur hat with brocade crown
    const ht = (h.h || 150) * u, crown = h.crown || '#9a1a2a';
    const body = [[cx - 84 * u, top + 30 * u], [cx - 92 * u, top - ht + 20 * u], [cx - 60 * u, top - ht - 6 * u], [cx, top - ht - 14 * u], [cx + 60 * u, top - ht - 6 * u], [cx + 92 * u, top - ht + 20 * u], [cx + 84 * u, top + 30 * u]];
    shaded(g, body, crown, shadeC(crown, 0.7), 7 * u);
    g.save(); pth(g, body); g.clip(); for (let x = cx - 90 * u; x < cx + 90 * u; x += 30 * u) for (let y = top - ht; y < top + 20 * u; y += 30 * u) inkFill(g, [[x, y], [x + 7 * u, y + 7 * u], [x, y + 14 * u], [x - 7 * u, y + 7 * u]], '#e8c050', 0); g.restore();
    // fur band (fluffy scallops)
    const fb = []; for (let i = 0; i <= 20; i++) { const t = i / 20; fb.push([cx - 112 * u + 224 * u * t, top - 30 * u - (i % 2 ? 10 : 0) * u]); }
    for (let i = 0; i <= 20; i++) { const t = i / 20; fb.push([cx + 112 * u - 224 * u * t, top + 44 * u + (i % 2 ? 8 : 0) * u]); }
    shaded(g, fb, c, shadeC(c, 0.65), 7 * u);
    for (let k = 0; k < 14; k++) { const x = cx - 100 * u + k * 15.5 * u; ln(g, [[x, top - 18 * u], [x + 4 * u, top + 30 * u]], 3 * u, k % 2 ? shadeC(c, 0.75) : mix(c, '#ffffff', 0.3)); }
    if (h.gem) inkFill(g, ellP(cx, top - 54 * u, 14 * u, 18 * u, 0, 360, 16), h.gem, 4 * u);
  } else if (h.type === 'tricorn') {
    inkFill(g, [[cx - 130 * u, top + 10 * u], [cx - 60 * u, top - 70 * u], [cx, top - 40 * u], [cx + 60 * u, top - 70 * u], [cx + 130 * u, top + 10 * u], [cx, top + 30 * u]], c, 7 * u);
    ln(g, [[cx - 120 * u, top + 6 * u], [cx, top + 22 * u], [cx + 120 * u, top + 6 * u]], 5 * u, h.band || '#e8c050');
  } else if (h.type === 'shako') { // guard cap with plume
    inkFill(g, [[cx - 80 * u, top + 26 * u], [cx - 74 * u, top - 90 * u], [cx + 74 * u, top - 90 * u], [cx + 80 * u, top + 26 * u]], c, 7 * u);
    inkFill(g, [[cx - 82 * u, top + 6 * u], [cx + 82 * u, top + 6 * u], [cx + 82 * u, top + 26 * u], [cx - 82 * u, top + 26 * u]], h.band || '#c8202a', 5 * u);
    inkFill(g, [[cx - 70 * u, top + 26 * u], [cx + 70 * u, top + 26 * u], [cx + 40 * u, top + 44 * u], [cx - 60 * u, top + 42 * u]], '#14121a', 5 * u);
    inkFill(g, ellP(cx, top - 40 * u, 20 * u, 20 * u, 0, 360, 14), '#e8c050', 4 * u);
    inkFill(g, [[cx - 6 * u, top - 90 * u], [cx - 30 * u, top - 170 * u], [cx + 4 * u, top - 140 * u], [cx + 26 * u, top - 180 * u], [cx + 10 * u, top - 90 * u]], h.plume || '#f4f0e8', 5 * u);
  } else if (h.type === 'ushanka') {
    shaded(g, [...ellP(cx, top + 30 * u, rx * 1.06, 70 * u, 180, 360, 24)], c, shadeC(c, 0.72), 7 * u);
    for (const s of [-1, 1]) inkFill(g, [[cx + s * rx * 0.97, top + 50 * u], [cx + s * rx * 1.2, top + 50 * u], [cx + s * rx * 1.16, top + 150 * u], [cx + s * rx * 0.99, top + 140 * u]], h.fur || '#d8c8a8', 6 * u);
    inkFill(g, [[cx - rx * 1.08, top + 10 * u], [cx + rx * 1.08, top + 10 * u], [cx + rx * 1.08, top + 40 * u], [cx - rx * 1.08, top + 40 * u]], h.fur || '#d8c8a8', 6 * u);
  } else if (h.type === 'halo') {
    g.lineWidth = 9 * u; g.strokeStyle = '#ffe89a'; g.beginPath(); g.ellipse(cx, top - 50 * u, 80 * u, 18 * u, 0, 0, Math.PI * 2); g.stroke();
  }
};

EXT.detail = (g, t, dc, B) => {
  const { x0, x1, y0, y1, bw, col } = B;
  if (t === 'brocade') { const c2 = dc || '#e8c050'; for (let y = y0 + 40; y < y1 + 60; y += 46) for (let x = x0 - 10 + ((y / 46) % 2) * 23; x < x1 + 10; x += 46) { inkFill(g, [[x, y - 10], [x + 9, y], [x, y + 10], [x - 9, y]], c2, 0); dt(g, x, y, 3, shadeC(col, 0.6)); } }
  if (t === 'kaftan') { inkFill(g, [[300 - 26, y0 - 10], [300 + 26, y0 - 10], [300 + 30, y1 + 30], [300 - 30, y1 + 30]], dc || '#e8c050', 5); for (let y = y0 + 60; y < y1; y += 52) { ln(g, [[300 - 22, y], [300 + 22, y]], 6, '#7a1a1a'); dt(g, 300, y, 6, '#ffe8a0'); } }
  if (t === 'fur') { const c = dc || '#7a5a3a', pts = []; for (let i = 0; i <= 24; i++) { const a = dg(180 + 180 * i / 24); pts.push([300 + (bw / 2 + 30) * Math.cos(a) * (i % 2 ? 0.94 : 1.04), y0 + 70 + 70 * Math.sin(a) * (i % 2 ? 0.9 : 1.06)]); }
    for (let i = 0; i <= 12; i++) { const x = 300 + (bw / 2 + 30) - (bw + 60) * i / 12; pts.push([x, y0 + 96 + (i % 2) * 18]); } shaded(g, pts, c, shadeC(c, 0.65), 7);
    for (let k = 0; k < 10; k++) ln(g, [[x0 + k * bw / 9, y0 + 20], [x0 + k * bw / 9 + 4, y0 + 80]], 3, mix(c, '#ffffff', 0.3)); }
  if (t === 'coat') { // the Tsar: lapels, two columns of gold buttons, white jabot, gold sash
    for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 8, y0 - 6], [300 + sd * 70, y0 - 6], [300 + sd * 40, y0 + 150], [300 + sd * 10, y0 + 170]], shadeC(col, 0.78), 5);
    for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) { inkFill(g, ellP(300 + sd * 34, y0 + 120 + k * 50, 9, 9, 0, 360, 12), '#f2c84a', 3); dt(g, 300 + sd * 34 - 3, y0 + 117 + k * 50, 2.5, '#fff6c8'); }
    inkFill(g, [[300 - 34, y0 - 8], [300 + 34, y0 - 8], [300 + 22, y0 + 70], [300, y0 + 90], [300 - 22, y0 + 70]], '#ffffff', 5);
    for (let k = 0; k < 3; k++) ln(g, [[300 - 20, y0 + 20 + k * 20], [300 + 20, y0 + 20 + k * 20]], 3, '#d8d4cc');
    ln(g, [[x0 - 4, y1 - 64], [x1 + 4, y1 - 64]], 20, CK); ln(g, [[x0 - 4, y1 - 64], [x1 + 4, y1 - 64]], 13, '#c8a03a');
  }
  if (t === 'uniform') { for (let k = 0; k < 4; k++) inkFill(g, ellP(300, y0 + 80 + k * 54, 8, 8, 0, 360, 12), '#f2c84a', 3); ln(g, [[x0 + 6, y0 + 20], [x1 - 10, y1 - 60]], 16, '#f4f0e8'); ln(g, [[x0 - 4, y1 - 50], [x1 + 4, y1 - 50]], 18, '#2a2228'); }
  if (t === 'patch') { inkFill(g, [[x0 + 30, y1 - 150], [x0 + 80, y1 - 156], [x0 + 84, y1 - 104], [x0 + 32, y1 - 100]], dc || '#a8783a', 4); ln(g, [[x0 + 40, y1 - 140], [x0 + 74, y1 - 112]], 2, '#5a3a20'); }
  if (t === 'rope') { ln(g, [[x0 - 4, y1 - 70], [x1 + 4, y1 - 74]], 12, CK); ln(g, [[x0 - 4, y1 - 70], [x1 + 4, y1 - 74]], 7, dc || '#c8a060'); }
  if (t === 'medal') { ln(g, [[300 - 60, y0 + 10], [300 - 40, y0 + 120]], 6, '#c8202a'); inkFill(g, ellP(300 - 40, y0 + 130, 18, 18, 0, 360, 16), dc || '#f2c84a', 4); }
};

// tall rig: long thin legs in tall boots (soles land at canvas y 975 after the tall transform)
EXT.legs = (g, s, o, B) => {
  const hipY = B.y1 - 14, sole = o._soleY || 968, st = o.step || 0, legs = o.legs || 'stand', bc = s.bootCol || '#1e1a1c', pc = s.legs || '#e8e2d0';
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * 34, sw = legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 60 : (o.spread || 0) * sd, lift = legs === 'walk' ? Math.max(0, Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI))) * 26 : 0;
    const knee = [hx + sd * 6 + sw * 0.5, (hipY + sole) / 2 - lift * 0.4], foot = [hx + sd * 10 + sw, sole - lift];
    ln(g, [[hx, hipY], knee], 30); ln(g, [[hx, hipY], knee], 20, pc);
    ln(g, [knee, foot], 40); ln(g, [knee, foot], 30, bc); // tall boot
    inkFill(g, [[foot[0] - 22, foot[1] - 14], [foot[0] + sd * 52, foot[1] - 12], [foot[0] + sd * 56, foot[1] + 6], [foot[0] - 22, foot[1] + 6]], bc, 6);
    ln(g, [[knee[0] - 18, knee[1] + 10], [knee[0] + 18, knee[1] + 10]], 8, '#3a3236');
    ln(g, [[knee[0] - 8, knee[1] + 30], [foot[0] - 6, foot[1] - 30]], 3, '#6a6266');
  }
};

EXT.prop = (g, kind, x, y, side) => {
  if (kind === 'razor') { // straight razor: dark handle + big gleaming blade pointing up
    g.save(); g.translate(x, y); g.rotate(side * 0.25);
    inkFill(g, [[-11, 10], [11, 10], [9, 96], [-9, 96]], '#2a1a14', 5); dt(g, 0, 22, 4, '#e8c050'); dt(g, 0, 80, 4, '#e8c050');
    const bl = [[-12, 4], [-14, -150], [24, -168], [30, -150], [14, 4]]; inkFill(g, bl, '#dfe6ef', 6);
    ln(g, [[-6, -10], [-8, -146]], 6, '#ffffff'); ln(g, [[20, -150], [10, -10]], 4, '#9aa6b8'); g.restore(); return true; }
  if (kind === 'palm') { // big open palm facing the viewer
    g.save(); g.translate(x, y); const W = '#fbfaf7';
    for (const [dx, len, a] of [[-30, 70, -0.25], [-10, 84, -0.08], [10, 86, 0.06], [30, 74, 0.2]]) { g.save(); g.translate(dx, -30); g.rotate(a); inkFill(g, pill(-10, -len, 10, 0, 10), W, 6); g.restore(); }
    g.save(); g.translate(-44, 10); g.rotate(-0.9); inkFill(g, pill(-10, -60, 10, 0, 10), W, 6); g.restore();
    inkFill(g, ellP(0, 0, 46, 44, 0, 360, 28), W, 7); ln(g, ellP(4, 4, 24, 18, 200, 330, 10), 3, '#c8c4bc'); g.restore(); return true; }
  if (kind === 'quill') { g.save(); g.translate(x, y); g.rotate(-0.4 * side); inkFill(g, [[0, 20], [-24, -60], [-14, -150], [8, -120], [10, -40]], '#f6f2ea', 5); ln(g, [[0, 30], [-6, -130]], 3, '#9a8a7a'); g.restore(); return true; }
  if (kind === 'pouch') { inkFill(g, ellP(x, y + 46, 34, 38, 0, 360, 22), '#8a5a2a', 6); inkFill(g, [[x - 12, y + 2], [x + 12, y + 2], [x + 16, y + 14], [x - 16, y + 14]], '#c8a060', 4); for (const k of [-1, 1]) inkFill(g, ellP(x + k * 10, y - 4, 10, 10, 0, 360, 12), '#f2c84a', 3); return true; }
  if (kind === 'goldsack') { inkFill(g, ellP(x, y + 92, 82, 86, 0, 360, 28), '#c8a060', 7); inkFill(g, [[x - 24, y], [x + 24, y], [x + 30, y + 22], [x - 30, y + 22]], '#8a6a3a', 5); for (let k = 0; k < 5; k++) inkFill(g, ellP(x - 26 + k * 13, y - 6 - (k % 2) * 8, 11, 11, 0, 360, 12), '#f2c84a', 3); return true; }
  if (kind === 'coin') { inkFill(g, ellP(x, y - 6, 18, 18, 0, 360, 18), '#f2c84a', 4); ln(g, ellP(x, y - 6, 11, 11, 0, 360, 14), 2, '#a87a2a'); return true; }
  if (kind === 'scissors') { g.save(); g.translate(x, y); g.rotate(-0.6 * side); for (const k of [-1, 1]) { inkFill(g, ellP(k * 16, 24, 14, 18, 0, 360, 14), null, 7); inkFill(g, [[k * 4, 6], [k * 18 - k * 14, -120], [k * 10, -120], [k * 12, 6]], '#dfe6ef', 5); } dt(g, 0, 4, 5); g.restore(); return true; }
  if (kind === 'brush') { g.save(); g.translate(x, y); g.rotate(0.3 * side); inkFill(g, [[-10, 0], [10, 0], [12, 70], [-12, 70]], '#8a4a2a', 5); inkFill(g, [[-20, 0], [-24, -40], [-10, -64], [10, -64], [24, -40], [20, 0]], '#e8dcc0', 5);
    for (let k = 0; k < 5; k++) inkFill(g, ellP(-20 + k * 10, -66 - (k % 2) * 8, 14, 12, 0, 360, 12), '#ffffff', 3); g.restore(); return true; }
  if (kind === 'drumstick') { g.save(); g.translate(x, y); g.rotate(-0.5 * side); inkFill(g, ellP(0, -46, 30, 40, 0, 360, 22), '#c8763a', 6); ln(g, ellP(-8, -56, 14, 16, 200, 300, 8), 4, '#f0b070'); ln(g, [[0, -8], [0, 30]], 12); ln(g, [[0, -8], [0, 30]], 6, '#f6eedc'); inkFill(g, ellP(-7, 36, 8, 8), '#f6eedc', 3); inkFill(g, ellP(7, 36, 8, 8), '#f6eedc', 3); g.restore(); return true; }
  if (kind === 'mirror') { g.save(); g.translate(x, y); ln(g, [[0, 10], [0, 80]], 14); ln(g, [[0, 10], [0, 80]], 8, '#c8a040'); inkFill(g, ellP(0, -50, 48, 60, 0, 360, 24), '#e8c050', 6); inkFill(g, ellP(0, -50, 38, 50, 0, 360, 24), '#cfe6f4', 3); ln(g, [[-18, -80], [-4, -96]], 5, '#ffffff'); g.restore(); return true; }
  if (kind === 'bundle') { inkFill(g, ellP(x, y + 10, 70, 46, 0, 360, 24), '#e8dcc8', 6); for (let k = 0; k < 3; k++) ln(g, [[x - 50 + k * 30, y - 20], [x - 40 + k * 30, y + 40]], 3, '#c8b8a0'); ln(g, [[x - 66, y + 6], [x + 66, y + 14]], 6, '#a8202a'); return true; }
  if (kind === 'ledger') { inkFill(g, [[x - 60, y - 30], [x + 60, y - 40], [x + 64, y + 40], [x - 58, y + 46]], '#5a2a2a', 6); inkFill(g, [[x - 50, y - 24], [x + 52, y - 32], [x + 54, y + 30], [x - 48, y + 36]], '#f4ead2', 3); for (let k = 0; k < 4; k++) ln(g, [[x - 40, y - 10 + k * 12], [x + 40, y - 16 + k * 12]], 2.5, '#8a7a60'); return true; }
  if (kind === 'beardpiece') { const c = '#7a4a2a'; inkFill(g, [[x - 40, y - 20], [x + 40, y - 20], [x + 50, y + 60], [x + 20, y + 130], [x, y + 160], [x - 20, y + 130], [x - 50, y + 60]], '#b8b4ae', 6); for (let k = 0; k < 5; k++) ln(g, [[x - 30 + k * 15, y - 10], [x - 20 + k * 10, y + 120]], 3, '#8a8680'); return true; }
  return false;
};

/** full character with the Bartsteuer extras. spec.tall = the Tsar rig. opts.rim = rim-light colour (painted crescent) */
const _tmp = { c: null, g: null, r: null, rg: null };
export const char2 = (p, spec, opts = {}) => {
  const s = typeof spec === 'string' ? CAST[spec] : spec;
  const draw = (g) => {
    if (s.tall) { const k = 0.62, dy = 183; g.save(); g.translate(300 * (1 - k), dy); g.scale(k, k); toonChar({ g }, s, { ...opts, _soleY: (975 - dy) / k }); g.restore(); }
    else if (s.fit) { g.save(); g.translate(300, 975); g.scale(s.fit, s.fit); g.translate(-300, -975); toonChar({ g }, s, opts); g.restore(); }
    else toonChar({ g }, s, opts);
  };
  if (!opts.rim) { draw(p.g); return; }
  const G = p.g, cv = G.canvas;
  if (!_tmp.c) { _tmp.c = document.createElement('canvas'); _tmp.r = document.createElement('canvas'); }
  for (const c of [_tmp.c, _tmp.r]) { c.width = cv.width; c.height = cv.height; }
  const tg = _tmp.c.getContext('2d'), rg = _tmp.r.getContext('2d');
  tg.setTransform(G.getTransform()); draw(tg);
  const sx = Math.abs(G.getTransform().a), rd = (opts.rimW || 4.5) * sx, dir = opts.rimDir ?? -1;
  rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'source-over'; rg.drawImage(_tmp.c, 0, 0);
  rg.globalCompositeOperation = 'source-in'; rg.fillStyle = opts.rim; rg.fillRect(0, 0, cv.width, cv.height);
  rg.globalCompositeOperation = 'destination-out'; rg.drawImage(_tmp.c, -dir * rd, rd * 0.55);
  G.save(); G.setTransform(1, 0, 0, 1, 0, 0); G.drawImage(_tmp.c, 0, 0); G.globalAlpha = opts.rimA ?? 0.7; G.drawImage(_tmp.r, 0, 0); G.restore();
};

/** horse pulling a small sled, side view (card). step = gait phase */
export const horseSled = (p, step = 0, col = '#7a4a2a') => {
  const g = p.g, b = Math.sin(step * Math.PI * 2) * 6;
  g.save(); g.translate(0, 120);
  // sled
  inkFill(g, [[20, 640], [250, 640], [260, 700], [30, 700]], '#a8282a', 7); for (let k = 0; k < 3; k++) dt(g, 70 + k * 70, 670, 8, '#f2c84a');
  ln(g, [[0, 740], [270, 740], [300, 710]], 10); ln(g, [[60, 700], [60, 740]], 8); ln(g, [[210, 700], [210, 740]], 8);
  ln(g, [[250, 660], [360, 620]], 7, '#5a3a20');
  // legs
  for (const [lx, ph] of [[350, 0], [380, 0.5], [500, 0.5], [530, 0]]) { const sw = Math.sin((step + ph) * Math.PI * 2) * 26; ln(g, [[lx, 600], [lx + sw * 0.5, 680], [lx + sw, 760]], 16); ln(g, [[lx, 600], [lx + sw * 0.5, 680], [lx + sw, 760]], 8, col); ln(g, [[lx + sw - 8, 760], [lx + sw + 12, 760]], 14, '#2a1a14'); }
  // body + neck + head
  shaded(g, ellP(440, 560 + b, 130, 66, 0, 360, 36), col, shadeC(col, 0.7), 8);
  shaded(g, [[520, 540 + b], [560, 420 + b], [600, 380 + b], [640, 410 + b], [600, 460 + b], [576, 560 + b]], col, shadeC(col, 0.7), 8);
  shaded(g, ellP(612, 400 + b, 46, 30, -20, 340, 24), col, shadeC(col, 0.7), 8);
  inkFill(g, [[560, 410 + b], [590, 360 + b], [600, 390 + b]], '#2a1a14', 5); dt(g, 616, 390 + b, 6);
  inkFill(g, [[540, 470 + b], [560, 400 + b], [590, 370 + b], [580, 420 + b], [560, 500 + b]], '#3a2418', 5);
  inkFill(g, [[312, 540 + b], [290, 600 + b], [300, 660 + b], [324, 600 + b]], '#3a2418', 5);
  ln(g, [[470, 500 + b], [470, 620 + b]], 10, '#a8282a'); dt(g, 470, 520 + b, 10, '#f2c84a');
  g.restore();
};

EXT.hair = (g, H, o) => {
  const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair;
  if (o.hairStyle === 'wig') { // powdered wig: smooth top, side rolls, little bow
    const top = []; for (let i = 0; i <= 30; i++) { const a = dg(180 + 180 * i / 30); top.push([cx + rx * 1.06 * Math.cos(a), cy - 10 * u + ry * 1.05 * Math.sin(a)]); }
    top.push([cx + rx * 0.9, cy - 40 * u], [cx - rx * 0.9, cy - 40 * u]); shaded(g, top, c, shadeC(c, 0.82), 7 * u);
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) shaded(g, ellP(cx + s * rx * 0.98, cy - 20 * u + k * 40 * u, 24 * u, 20 * u, 0, 360, 18), c, shadeC(c, 0.8), 5 * u);
    inkFill(g, [[cx + rx * 0.9, cy - 60 * u], [cx + rx * 1.3, cy - 80 * u], [cx + rx * 1.3, cy - 40 * u]], '#2a2228', 4 * u);
  }
};
