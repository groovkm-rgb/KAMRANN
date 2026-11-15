
// ===================== castx.js: story-specific cast extensions (Die Milliarde) =====================
// Appended after cast.js into toon.js. Adds hair styles, hats, face extras, body details and props,
// and THE cast (one design per character, used in every scene). Never redesign: change only outfit keys.
const EXTRA_DETAIL = {
  courier: (g, b) => { // yellow chest band + lightning badge
    inkFill(g, [[b.x0 - 6, b.y0 + 120], [b.x1 + 6, b.y0 + 120], [b.x1 + 6, b.y0 + 150], [b.x0 - 6, b.y0 + 150]], '#f2c230', 5);
    inkFill(g, [[262, b.y0 + 64], [292, b.y0 + 64], [280, b.y0 + 86], [298, b.y0 + 86], [256, b.y0 + 124], [268, b.y0 + 96], [252, b.y0 + 96]], '#f2c230', 3.5);
  },
  lapels: (g, b) => { // suit lapels over a shirt
    inkFill(g, [[300 - 40, b.y0 - 6], [300 + 40, b.y0 - 6], [300, b.y0 + 120]], b.dc || '#f6d0e4', 5);
    for (const s of [-1, 1]) inkFill(g, [[300 + s * 42, b.y0 - 8], [300 + s * 4, b.y0 + 130], [300 + s * 70, b.y0 + 70], [300 + s * 56, b.y0 + 20]], shadeC(b.col, 0.82), 5);
    for (let k = 0; k < 2; k++) inkFill(g, ellP(300, b.y0 + 170 + k * 50, 7, 7, 0, 360, 10), '#e8c048', 3);
  },
  chain: (g, b) => { // fat gold chain with a € pendant
    for (let i = 0; i <= 12; i++) { const a = dg(15 + 150 * i / 12); dt(g, 300 + 62 * Math.cos(a), b.y0 - 10 + 82 * Math.sin(a), 8.5, CK); dt(g, 300 + 62 * Math.cos(a), b.y0 - 10 + 82 * Math.sin(a), 6, '#f2c540'); }
    inkFill(g, ellP(300, b.y0 + 92, 20, 20, 0, 360, 18), '#f2c540', 4);
    g.fillStyle = CK; g.font = 'bold 28px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', 300, b.y0 + 93);
  },
  hood: (g, b) => { // hoodie: hood around neck, kangaroo pocket, strings
    inkFill(g, [...ellP(300, b.y0 + 6, 92, 40, 0, 180, 18)], shadeC(b.col, 0.85), 6);
    ln(g, [[284, b.y0 + 36], [280, b.y0 + 120]], 4, '#f4f0e6'); ln(g, [[316, b.y0 + 36], [320, b.y0 + 120]], 4, '#f4f0e6');
    inkFill(g, [[300 - 62, b.y1 - 150], [300 + 62, b.y1 - 150], [300 + 80, b.y1 - 70], [300 - 80, b.y1 - 70]], shadeC(b.col, 0.9), 5);
  },
  floral: (g, b) => { // flowered cardigan
    const r = mulb(11);
    for (let i = 0; i < 26; i++) { const x = b.x0 + r() * (b.x1 - b.x0), y = b.y0 + 20 + r() * (b.y1 - b.y0 + 160); const c = ['#f4a0b8', '#ffe08a', '#a8d8f0', '#f6f0f0'][i % 4];
      for (let k = 0; k < 5; k++) { const a = dg(k * 72); dt(g, x + 9 * Math.cos(a), y + 9 * Math.sin(a), 6.5, c); } dt(g, x, y, 4, '#e8a030'); }
    ln(g, [[300, b.y0 + 20], [300, b.y1 + 200]], 5);
    for (let k = 0; k < 4; k++) inkFill(g, ellP(316, b.y0 + 90 + k * 70, 7, 7, 0, 360, 10), '#f2e6c8', 3);
  },
  hawaii: (g, b) => { // loud patterned shirt
    const r = mulb(5);
    for (let i = 0; i < 18; i++) { const x = b.x0 + r() * (b.x1 - b.x0), y = b.y0 + r() * (b.y1 - b.y0); const c = ['#ffd23a', '#2ab0a0', '#ff6a3a'][i % 3];
      inkFill(g, [[x, y - 18], [x + 16, y], [x, y + 18], [x - 16, y]], c, 3); }
    inkFill(g, [[300 - 46, b.y0 - 4], [300, b.y0 + 50], [300 + 46, b.y0 - 4]], '#ffffff', 5);
  },
  greysuit: (g, b) => { inkFill(g, [[300 - 34, b.y0 - 6], [300 + 34, b.y0 - 6], [300, b.y0 + 110]], '#ffffff', 5); inkFill(g, [[294, b.y0 + 10], [306, b.y0 + 10], [312, b.y0 + 120], [300, b.y0 + 136], [288, b.y0 + 120]], '#1e1e26', 4);
    for (const s of [-1, 1]) inkFill(g, [[300 + s * 36, b.y0 - 8], [300 + s * 4, b.y0 + 120], [300 + s * 60, b.y0 + 64]], shadeC(b.col, 0.8), 4); },
  navysuit: (g, b) => { inkFill(g, [[300 - 34, b.y0 - 6], [300 + 34, b.y0 - 6], [300, b.y0 + 120]], '#f4f6fa', 5); inkFill(g, [[294, b.y0 + 10], [306, b.y0 + 10], [312, b.y0 + 130], [300, b.y0 + 146], [288, b.y0 + 130]], '#b8202a', 4);
    for (const s of [-1, 1]) inkFill(g, [[300 + s * 36, b.y0 - 8], [300 + s * 4, b.y0 + 130], [300 + s * 64, b.y0 + 70]], shadeC(b.col, 0.78), 4);
    inkFill(g, [[300 + 44, b.y0 + 70], [300 + 72, b.y0 + 66], [300 + 70, b.y0 + 78], [300 + 46, b.y0 + 80]], '#f4f6fa', 3); },
  gown: (g, b) => { const r = mulb(3); for (let i = 0; i < 16; i++) { const x = b.x0 + r() * (b.x1 - b.x0), y = b.y0 + r() * (b.y1 - b.y0); for (let k = 0; k < 5; k++) { const a = dg(k * 72 - 90); dt(g, x + 8 * Math.cos(a), y + 8 * Math.sin(a), 4, '#ffe08a'); } } },
  stripeT: (g, b) => { for (let y = b.y0 + 40; y < b.y1; y += 46) inkFill(g, [[b.x0 - 5, y], [b.x1 + 5, y], [b.x1 + 5, y + 18], [b.x0 - 5, y + 18]], b.dc || '#ffffff', 0); },
  vestB: (g, b) => { for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 10, b.y0 - 10], [300 + sd * (b.bw / 2 + 10), b.y0 - 10], [300 + sd * (b.bw / 2 + 10), b.y1 + 10], [300 + sd * 14, b.y1 + 10]], b.dc || '#3a3a44', 5); },
  nurse: (g, b) => { inkFill(g, [[286, b.y0 + 60], [314, b.y0 + 60], [314, b.y0 + 76], [286, b.y0 + 76]], '#e0383a', 0); inkFill(g, [[292, b.y0 + 52], [308, b.y0 + 52], [308, b.y0 + 84], [292, b.y0 + 84]], '#e0383a', 0); },
};
const mulb = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

const HAIR_EXTRA = {
  messy: (g, H, o) => { // Leon: messy brown hair, tufts sticking out
    const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair, turn = o.turn || 0;
    const pts = []; for (let i = 0; i <= 34; i++) { const a = dg(176 + 188 * i / 34); const sp = i % 3 === 1 ? 1.16 : 1.04; pts.push([cx + rx * sp * Math.cos(a), cy + ry * sp * Math.sin(a) - 4 * u]); }
    const fr = [[cx + rx * 1.0, cy - 30 * u], [cx + 70 * u, cy - 52 * u], [cx + 48 * u, cy - 34 * u], [cx + 26 * u, cy - 62 * u], [cx + 2 * u, cy - 38 * u], [cx - 22 * u, cy - 66 * u], [cx - 40 * u, cy - 40 * u], [cx - 66 * u, cy - 58 * u], [cx - 78 * u, cy - 28 * u], [cx - rx * 1.02, cy - 10 * u]].map(([x, y]) => [x + turn * 14 * u, y]);
    shaded(g, [...pts, ...fr], c, shadeC(c, 0.7), 8 * u, [-0.1, -0.12]);
    for (let k = 0; k < 4; k++) ln(g, ellP(cx - 30 * u + k * 22 * u, cy - 50 * u, 50 * u, 46 * u, 228 + k * 8, 286 + k * 8, 10), 3 * u, mix(c, '#ffffff', 0.35));
    // tuft sticking up
    inkFill(g, [[cx - 6 * u, cy - ry * 1.02], [cx + 10 * u, cy - ry * 1.32], [cx + 18 * u, cy - ry * 1.0]], c, 6 * u);
  },
  curly: (g, H, o) => { // Kerem: black curls
    const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair;
    const blobs = []; for (let i = 0; i <= 12; i++) { const a = dg(172 + 196 * i / 12); blobs.push([cx + rx * 1.0 * Math.cos(a), cy + ry * 0.98 * Math.sin(a) - 6 * u]); }
    for (let i = 0; i < 6; i++) blobs.push([cx + rx * (0.78 - i * 0.31), cy - 46 * u + (i % 2) * 10 * u]);
    for (const [x, y] of blobs) inkFill(g, ellP(x, y, 30 * u, 28 * u, 0, 360, 16), c, 6 * u);
    for (const [x, y] of blobs) dt(g, x - 2 * u, y - 2 * u, 22 * u, c);
    for (const [x, y] of blobs.filter((_, i) => i % 2)) ln(g, ellP(x, y, 14 * u, 12 * u, 200, 320, 8), 3 * u, mix(c, '#ffffff', 0.3));
  },
  slick: (g, H, o) => { // von Hahn: slicked-back silver hair
    const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair;
    const pts = []; for (let i = 0; i <= 30; i++) { const a = dg(184 + 172 * i / 30); pts.push([cx + rx * 1.03 * Math.cos(a), cy + ry * 1.05 * Math.sin(a) - 4 * u]); }
    pts.push([cx + rx * 0.92, cy - 44 * u], [cx, cy - 62 * u], [cx - rx * 0.92, cy - 44 * u]);
    shaded(g, pts, c, shadeC(c, 0.72), 7 * u, [-0.08, -0.12]);
    for (let k = -3; k <= 3; k++) ln(g, [[cx + k * 22 * u, cy - 62 * u + Math.abs(k) * 3 * u], [cx + k * 26 * u, cy - ry * 0.98]], 3 * u, shadeC(c, 0.7));
  },
  scarf: (g, H, o) => { // headscarf (Kerem's mother)
    const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair;
    const pts = [...ellP(cx, cy - 4 * u, rx * 1.12, ry * 1.12, 150, 390, 30), [cx + rx * 0.9, cy + 70 * u], [cx + rx * 0.5, cy + ry * 1.05], [cx - rx * 0.5, cy + ry * 1.05], [cx - rx * 0.9, cy + 70 * u]];
    shaded(g, pts, c, shadeC(c, 0.75), 8 * u);
    // face opening (white) re-drawn by the face oval
    const face = wob(cx, cy + 6 * u, rx * 0.8, ry * 0.8, 5, 0.02);
    shaded(g, face, HEAD, HEAD_SH, 6 * u, [-0.08, -0.05]);
    for (let i = 0; i < 6; i++) dt(g, cx - rx * 0.9 + i * rx * 0.36, cy - ry * 0.9 + Math.abs(i - 2.5) * 14 * u, 5 * u, mix(c, '#ffffff', 0.5));
  },
  pigtails: (g, H, o) => { const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair;
    for (const s of [-1, 1]) { inkFill(g, ellP(cx + s * rx * 1.08, cy + 10 * u, 28 * u, 46 * u, 0, 360, 18), c, 6 * u); inkFill(g, ellP(cx + s * rx * 0.96, cy - 26 * u, 12 * u, 12 * u, 0, 360, 10), '#ff5a8a', 4 * u); }
    drawHair(g, H, { ...o, hairStyle: 'short' }); },
  balding: (g, H, o) => { drawHair(g, H, { ...o, hairStyle: 'sides' }); ln(g, [[H.cx - 20, H.cy - H.ry * 0.96], [H.cx + 6, H.cy - H.ry * 1.14], [H.cx + 26, H.cy - H.ry * 0.98]], 5, o.hair); },
};

const FACE_EXTRA = {
  freckles: (g, H, o) => { const u = H.rx / 100, fx = H.cx + (o.turn || 0) * 26 * u;
    for (const s of [-1, 1]) for (const [dx, dy] of [[34, 22], [46, 30], [28, 34], [52, 18], [40, 40]]) dt(g, fx + s * dx * u, H.cy + dy * u, 3.6 * u, '#c88a5a'); },
  glasses: (g, H, o) => { // round glasses; o.reflect draws mirrored gold digits in the lenses
    const u = H.rx / 100, turn = o.turn || 0, fx = H.cx + turn * 26 * u, ey = H.cy - 8 * u;
    const xs = [-1, 1].map((s) => fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)));
    const ks = [-1, 1].map((s) => 1 - 0.22 * Math.max(0, -s * turn));
    xs.forEach((x, i) => {
      g.save(); pth(g, ellP(x, ey, 30 * u * ks[i], 28 * u, 0, 360, 28)); g.clip();
      g.fillStyle = o.reflect ? 'rgba(255,214,90,0.32)' : 'rgba(190,225,255,0.22)'; g.fill();
      if (o.reflect) { g.save(); g.translate(x, ey); g.scale(-1, 1); g.fillStyle = '#ffe27a'; g.font = `bold ${10 * u}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.reflect, 0, -6 * u); g.fillText(o.reflect, 0, 10 * u); g.restore(); }
      ln(g, [[x - 18 * u, ey - 14 * u], [x - 6 * u, ey - 22 * u]], 4 * u, 'rgba(255,255,255,0.85)');
      g.restore();
      inkFill(g, ellP(x, ey, 30 * u * ks[i], 28 * u, 0, 360, 28), null, 6 * u);
    });
    ln(g, [[xs[0] + 30 * u * ks[0], ey - 4 * u], [xs[1] - 30 * u * ks[1], ey - 4 * u]], 5 * u);
  },
  shades: (g, H, o) => { // sunglasses (rich phase, grey men)
    const u = H.rx / 100, turn = o.turn || 0, fx = H.cx + turn * 26 * u, ey = H.cy - 8 * u;
    for (const s of [-1, 1]) { const k = 1 - 0.22 * Math.max(0, -s * turn), x = fx + s * 38 * u * k;
      inkFill(g, [[x - 32 * u * k, ey - 18 * u], [x + 32 * u * k, ey - 18 * u], [x + 28 * u * k, ey + 12 * u], [x, ey + 22 * u], [x - 28 * u * k, ey + 12 * u]], o.shadeCol || '#16141c', 5 * u);
      ln(g, [[x - 20 * u * k, ey - 10 * u], [x - 6 * u * k, ey - 12 * u]], 4 * u, 'rgba(255,255,255,0.7)'); }
    ln(g, [[fx - 8 * u, ey - 14 * u], [fx + 8 * u, ey - 14 * u]], 6 * u);
  },
  roundglasses: (g, H, o) => FACE_EXTRA.glasses(g, H, o),
};

const HAT_EXTRA = {
  courier: (g, H, o) => { // Blitzpaket cap: brown cap, yellow band, text + bolt on the front
    const { cx, cy, rx, ry } = H, u = rx / 100, top = cy - ry, c = o.hat.color || '#7a5424';
    const dome = ellP(cx, top + 34 * u, rx * 1.04, ry * 0.66, 180, 360, 30);
    const pts = [...dome, [cx + rx * 1.04, top + 46 * u], [cx - rx * 1.04, top + 46 * u]];
    shaded(g, pts, c, shadeC(c, 0.72), 8 * u);
    inkFill(g, [[cx - rx * 1.03, top + 22 * u], [cx + rx * 1.03, top + 22 * u], [cx + rx * 1.04, top + 46 * u], [cx - rx * 1.04, top + 46 * u]], '#f2c230', 5 * u);
    g.save(); g.fillStyle = CK; g.font = `900 ${23 * u}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Blitzpaket', cx + (o.turn || 0) * 16 * u, top + 35 * u); g.restore();
    inkFill(g, [[cx - 8 * u, top - 34 * u], [cx + 14 * u, top - 34 * u], [cx + 4 * u, top - 16 * u], [cx + 18 * u, top - 16 * u], [cx - 12 * u, top + 12 * u], [cx - 4 * u, top - 8 * u], [cx - 16 * u, top - 8 * u]], '#f2c230', 3.5 * u);
    const t = o.turn || 0; // visor toward the facing side
    inkFill(g, [[cx - 80 * u + t * 30 * u, top + 44 * u], [cx + 80 * u + t * 30 * u, top + 44 * u], [cx + 96 * u + t * 50 * u, top + 62 * u], [cx - 96 * u + t * 10 * u, top + 62 * u]], shadeC(c, 0.8), 6 * u);
  },
};

const PROP_EXTRA = {
  pide: (g, x, y, s) => { inkFill(g, ellP(x + s * 30, y - 8, 64, 26, 0, 360, 26), '#e2a85a', 6); for (let k = 0; k < 5; k++) dt(g, x + s * (0 + k * 15), y - 14 + (k % 2) * 8, 3.5, '#5a3a20'); ln(g, ellP(x + s * 30, y - 16, 48, 12, 200, 340, 12), 3, '#f6d79a'); },
  phone: (g, x, y, s, o) => { g.save(); g.translate(x, y); g.rotate(s * 0.15); inkFill(g, [[-26, -52], [26, -52], [26, 52], [-26, 52]], '#22202a', 5);
    g.fillStyle = o.screenCol || '#7ad0ff'; g.fillRect(-19, -44, 38, 86); g.restore(); },
  news: (g, x, y, s) => { inkFill(g, [[x - 80, y - 110], [x + 80, y - 116], [x + 84, y + 20], [x - 76, y + 26]], '#ece6d6', 5); for (let k = 0; k < 6; k++) ln(g, [[x - 60, y - 84 + k * 18], [x + 60, y - 88 + k * 18]], 4, '#9a948a'); inkFill(g, [[x - 60, y - 104], [x + 10, y - 106], [x + 10, y - 94], [x - 60, y - 92]], '#3a3a44', 0); },
  suitcase: (g, x, y, s) => { const x0 = s > 0 ? x - 30 : x - 110, x1 = x0 + 140; inkFill(g, pill(x0, y + 24, x1, y + 150, 14), '#c0582e', 6); ln(g, [[x - 18, y + 24], [x - 18, y - 4], [x + 18, y - 4], [x + 18, y + 24]], 7); for (const k of [0.28, 0.72]) ln(g, [[x0 + k * 140, y + 24], [x0 + k * 140, y + 150]], 5, '#e8b84a'); },
  drawing: (g, x, y, s) => { inkFill(g, [[x - 70, y - 100], [x + 70, y - 104], [x + 74, y + 4], [x - 66, y + 8]], '#fffdf4', 5); dt(g, x - 26, y - 64, 12, '#3a3a44'); ln(g, [[x - 26, y - 52], [x - 26, y - 20]], 6, '#3a6ac8'); ln(g, [[x - 26, y - 46], [x - 12, y - 26]], 4, '#c83a3a');
    g.fillStyle = '#e8304a'; g.beginPath(); g.moveTo(x + 30, y - 40); g.bezierCurveTo(x + 30, y - 70, x + 64, y - 70, x + 30, y - 18); g.bezierCurveTo(x - 4, y - 70, x + 30, y - 70, x + 30, y - 40); g.fill(); },
  tea: (g, x, y) => { inkFill(g, [[x - 14, y - 50], [x + 14, y - 50], [x + 8, y + 6], [x - 8, y + 6]], 'rgba(200,90,40,0.85)', 4); inkFill(g, ellP(x, y + 8, 22, 6), '#d0c8b8', 3); },
  scanner: (g, x, y, s) => { inkFill(g, pill(x - 30, y - 70, x + 30, y + 40, 12), '#34323c', 6); g.fillStyle = '#7ad0ff'; g.fillRect(x - 20, y - 58, 40, 40); dt(g, x, y + 10, 8, '#f2c230'); },
  card: (g, x, y, s) => { g.save(); g.translate(x, y - 20); g.rotate(-0.3 * s); inkFill(g, [[-40, -26], [40, -26], [40, 26], [-40, 26]], '#3a6ac8', 5); g.fillStyle = '#e8c048'; g.fillRect(-28, -10, 16, 12); g.restore(); },
  bouquet: (g, x, y, s) => { inkFill(g, [[x - 18, y + 70], [x + 18, y + 70], [x + 70, y - 60], [x - 70, y - 60]], '#f6e6c8', 5); const r = mulb(9);
    for (let i = 0; i < 30; i++) { const a = dg(200 + 140 * r()), d = 40 + 110 * r(); inkFill(g, ellP(x + d * Math.cos(a), y - 60 + d * Math.sin(a) * 0.9, 20, 20, 0, 360, 10), ['#e0385a', '#f6a0c0', '#ffd23a', '#ffffff', '#c05ad8'][i % 5], 4); } },
  keys: (g, x, y) => { inkFill(g, ellP(x, y - 10, 14, 14), null, 5); ln(g, [[x, y + 4], [x + 6, y + 44]], 8, '#e0b040'); ln(g, [[x - 10, y + 2], [x - 22, y + 40]], 8, '#c0c0c8'); },
  envelope: (g, x, y) => { inkFill(g, [[x - 60, y - 70], [x + 60, y - 74], [x + 62, y + 4], [x - 58, y + 8]], '#f4ead2', 5); ln(g, [[x - 60, y - 70], [x, y - 30], [x + 60, y - 74]], 4); inkFill(g, [[x - 40, y - 20], [x + 20, y - 22], [x + 20, y - 4], [x - 40, y - 2]], '#d8303a', 0); },
  binder: (g, x, y, s) => { inkFill(g, [[x - 70, y - 90], [x + 70, y - 94], [x + 74, y + 10], [x - 66, y + 14]], '#c8b890', 6); inkFill(g, [[x - 50, y - 70], [x + 20, y - 72], [x + 20, y - 52], [x - 50, y - 50]], '#f4f0e0', 3); },
  plan: (g, x, y, s) => PROP_EXTRA.drawing(g, x, y, s),
  cloth: (g, x, y) => { inkFill(g, [[x - 30, y - 20], [x + 36, y - 26], [x + 30, y + 30], [x - 34, y + 24]], '#f0e8ff', 4); },
  doner: (g, x, y, s) => { inkFill(g, [[x - 40, y - 70], [x + 40, y - 70], [x + 10, y + 40], [x - 10, y + 40]], '#f6efe0', 5); inkFill(g, ellP(x, y - 72, 40, 18), '#c8783a', 5); dt(g, x - 14, y - 82, 7, '#5ab04a'); dt(g, x + 16, y - 80, 7, '#e03a3a'); },
};

// ------------- THE CAST (single designs) -------------
const LEON_BASE = { hair: '#8a5530', hairStyle: 'messy', freckles: true, glasses: true, bw: 176, seed: 4 };
export const LEON = {
  courier: { ...LEON_BASE, body: '#b8862e', detail: ['courier', 'pocket', { t: 'belt', c: '#5a3c1e' }], legs: '#6a4a24', sleeve: '#b8862e', hat: { type: 'courier', color: '#7a5424' } },
  courierNoCap: { ...LEON_BASE, body: '#b8862e', detail: ['courier', 'pocket', { t: 'belt', c: '#5a3c1e' }], legs: '#6a4a24', sleeve: '#b8862e' },
  rich: { ...LEON_BASE, glasses: false, shades: true, shadeCol: '#3a1050', body: '#7a3ab0', detail: [{ t: 'lapels', c: '#f6c0dc' }, 'chain'], legs: '#5c2a88', sleeve: '#7a3ab0' },
  richNoShades: { ...LEON_BASE, body: '#7a3ab0', detail: [{ t: 'lapels', c: '#f6c0dc' }, 'chain'], legs: '#5c2a88', sleeve: '#7a3ab0' },
  hoodie: { ...LEON_BASE, body: '#4a9a5a', detail: ['hood'], legs: '#3a5a9a', sleeve: '#4a9a5a' },
};
export const KEREM = { body: '#e8e4dc', detail: [{ t: 'apron', c: '#d84a3a' }], hair: '#16141a', hairStyle: 'curly', mous: '#16141a', mousStyle: 'thin', bw: 190, legs: '#3a3a48', sleeve: '#e8e4dc', seed: 8, holdR: 'pide', R: 'forward' };
export const OMA = { body: '#c86a8a', robe: true, detail: ['floral'], hair: '#f4f4f6', hairStyle: 'bun', glasses: true, bw: 200, sleeve: '#c86a8a', seed: 2, headScale: 0.96 };
export const HAHN = { body: '#1e2c5a', detail: ['navysuit'], hair: '#c8ccd4', hairStyle: 'slick', bw: 168, legs: '#1a2448', sleeve: '#1e2c5a', seed: 6, headScale: 0.94 };
export const GREY = { body: '#7a7c84', detail: ['greysuit'], hair: '#2a2830', hairStyle: 'short', shades: true, bw: 190, legs: '#5a5c64', sleeve: '#7a7c84', seed: 1, holdR: 'news' };
export const DIETER = { body: '#2ab0a0', detail: ['hawaii'], hair: '#7a6a5a', hairStyle: 'balding', mous: '#7a6a5a', bw: 230, legs: '#d8c49a', sleeve: '#2ab0a0', seed: 9 };
export const GIRL = { body: '#a8d8f0', robe: true, detail: ['gown'], hair: '#5a3a24', hairStyle: 'pigtails', bw: 160, headScale: 1.05, sleeve: '#a8d8f0', seed: 7 };
export const MOTHER = { body: '#3a8a6a', robe: true, detail: [{ t: 'apron', c: '#f2ead8' }], hair: '#c8504a', hairStyle: 'scarf', bw: 210, sleeve: '#3a8a6a', seed: 12 };
// extras
export const BOSS = { body: '#f2f0ea', detail: [{ t: 'vestB', c: '#3a5a8a' }, 'tie'], hair: '#5a4a3a', hairStyle: 'balding', mous: '#3a2a20', mousStyle: 'handle', bw: 250, legs: '#3a3a48', sleeve: '#f2f0ea', seed: 13 };
export const SALES = { body: '#2a2a32', detail: ['collar', { t: 'tie', c: '#e0383a' }], hair: '#1a1a20', hairStyle: 'side', bw: 180, legs: '#2a2a32', sleeve: '#2a2a32', seed: 14 };
export const DJ = { body: '#2a2a3a', detail: [{ t: 'stripeT', c: '#ff3a8a' }], hair: '#3a2a6a', hairStyle: 'short', shades: true, shadeCol: '#ff3a8a', bw: 190, legs: '#22222a', sleeve: '#2a2a3a', seed: 15 };
export const NURSE = { body: '#f4f6f8', detail: ['nurse', 'pocket'], hair: '#e0b050', hairStyle: 'bun', bw: 180, legs: '#e8eef4', sleeve: '#f4f6f8', seed: 16 };
export const BUSWOMAN = { body: '#a85ab0', robe: true, detail: [{ t: 'scarf', c: '#ffd23a' }], hair: '#8a8a94', hairStyle: 'short', bw: 220, sleeve: '#a85ab0', seed: 17 };
export const SKATER = { body: '#ff8a2a', detail: ['pocket'], hair: '#3a2a22', hairStyle: 'side', headScale: 1.05, bw: 160, legs: '#3a4a7a', sleeve: '#ff8a2a', seed: 18, hat: { type: 'beanie', color: '#2a6ac8' } };
export const GUESTS = [
  { body: '#e0384a', detail: ['collar'], hair: '#f2c84a', hairStyle: 'side', bw: 180, legs: '#2a2a32', sleeve: '#e0384a', seed: 21 },
  { body: '#2ab0e0', detail: ['stripeT'], hair: '#2a1a14', hairStyle: 'short', bw: 190, legs: '#22283a', sleeve: '#2ab0e0', seed: 22 },
  { body: '#f2a63a', robe: true, detail: ['gown'], hair: '#a03a2a', hairStyle: 'bun', bw: 180, sleeve: '#f2a63a', seed: 23 },
  { body: '#6ad04a', detail: ['pocket'], hair: '#3a2a6a', hairStyle: 'mop', shades: true, bw: 180, legs: '#3a3a48', sleeve: '#6ad04a', seed: 24 },
  { body: '#c84ad8', detail: ['collar', 'buttons'], hair: '#1a1a1a', hairStyle: 'side', bw: 190, legs: '#2a2a32', sleeve: '#c84ad8', seed: 25, mous: '#1a1a1a' },
  { body: '#f4f0e8', detail: [{ t: 'tie', c: '#3a6ac8' }, 'collar'], hair: '#d8a050', hairStyle: 'short', bw: 190, legs: '#5a6070', sleeve: '#f4f0e8', seed: 26 },
];
export const KIDS = [
  { body: '#ff5a5a', detail: ['pocket'], hair: '#3a2a22', hairStyle: 'mop', headScale: 1.08, bw: 150, legs: '#3a4a7a', sleeve: '#ff5a5a', seed: 31 },
  { body: '#3ab0ff', detail: ['stripeT'], hair: '#f2c84a', hairStyle: 'pigtails', headScale: 1.08, bw: 150, legs: '#2a2a40', sleeve: '#3ab0ff', seed: 32 },
  { body: '#ffd23a', detail: ['pocket'], hair: '#1a1a1a', hairStyle: 'curly', headScale: 1.08, bw: 150, legs: '#3a5a3a', sleeve: '#ffd23a', seed: 33 },
  { body: '#8a5ad8', detail: [], hair: '#a05a2a', hairStyle: 'side', headScale: 1.08, bw: 150, legs: '#2a2a40', sleeve: '#8a5ad8', seed: 34, hat: { type: 'beanie', color: '#e03a3a' } },
];
