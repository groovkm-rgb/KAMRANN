
// ================= cast.js — Beyin serisi: people, the Brain host, wordless props & fx =================
// (concatenated after toonbase.js + roman.js into toon.js; uses Pen, blobPts, headBlob, faceFront, hatOn ...)
FACE.sad = { eye: ["small", "small"], brow: [-5, 3], mouth: "frown" };
FACE.angry = { eye: ["lid", "lid"], brow: [7, -4], mouth: "teeth" };
FACE.calm = { eye: ["happy", "happy"], brow: [-1, 0], mouth: "smile" };
FACE.sleepy = { eye: ["slit", "slit"], brow: [-2, 2], mouth: "o" };
FACE.yuck = { eye: ["squeeze", "squeeze"], brow: [4, -3], mouth: "wave" };
FACE.bliss = { eye: ["happy", "happy"], brow: [-4, -3], mouth: "smileWide" };
FACE.ouch = { eye: ["squeeze", "squeeze"], brow: [-4, 2], mouth: "O" };
FACE.skeptic = { eye: ["slit", "lid"], brow: [3, -1], mouth: "smirk" };
FACE.wink = { eye: ["happy", "dot"], brow: [0, -3], mouth: "smirk" };
FACE.proud = { eye: ["happy", "happy"], brow: [-2, -5], mouth: "smirk" };
FACE.blank = { eye: ["dot", "dot"], brow: [0, -1], mouth: "dash" };
FACE.gape = { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" };
FACE.shrug = { eye: ["lid", "lid"], brow: [-6, -6], mouth: "frown" };
FACE.blow = { eye: ["happy", "happy"], brow: [-2, -4], mouth: "o" };

const PINK = "#f6a0bd", PINK_D = "#d9688f", PINK_L = "#ffd0de";
const deg = (d) => d * Math.PI / 180;
const mixc = (a, b, t) => mix(a, b, Math.max(0, Math.min(1, t)));

// ---------- tiny icons (used on paper, labels, brochures — never letters or digits) ----------
export const icon = {
  coin: (p, x, y, r) => { p.ell(x, y, r, r, "#f2c14e", r * 0.16); p.ell(x, y, r * 0.62, r * 0.62, null, r * 0.08); p.ell(x - r * 0.3, y - r * 0.3, r * 0.18, r * 0.12, "#fff4c8", 0); },
  coinStack: (p, x, y, r, n = 5) => { for (let i = 0; i < n; i++) { const yy = y - i * r * 0.42; p.ell(x, yy + r * 0.2, r, r * 0.38, "#c99a2e", r * 0.14); p.ell(x, yy, r, r * 0.38, "#f2c14e", r * 0.14); } p.dot(x - r * 0.4, y - (n - 1) * r * 0.42 - r * 0.05, r * 0.12, "#fff4c8"); },
  tag: (p, x, y, s, col = "#e04545") => { const pts = [[x - s, y - s * 0.55], [x + s * 0.5, y - s * 0.55], [x + s, y], [x + s * 0.5, y + s * 0.55], [x - s, y + s * 0.55]]; p.poly(pts, col, s * 0.12); p.ell(x + s * 0.45, y, s * 0.13, s * 0.13, "#ffffff", s * 0.06); p.stroke([[x - s * 0.35, y - s * 0.3], [x - s * 0.35, y + s * 0.15]], s * 0.13, "#ffffff"); p.stroke([[x - s * 0.6, y], [x - s * 0.35, y + s * 0.3], [x - s * 0.1, y]], s * 0.13, "#ffffff"); },
  smile: (p, x, y, r, col = "#ffd23f") => { p.ell(x, y, r, r, col, r * 0.14); p.dot(x - r * 0.35, y - r * 0.2, r * 0.13); p.dot(x + r * 0.35, y - r * 0.2, r * 0.13); p.arc(x, y + r * 0.05, r * 0.5, r * 0.42, 20, 160, r * 0.13); },
  frown: (p, x, y, r, col = "#ff8a5c") => { p.ell(x, y, r, r, col, r * 0.14); p.dot(x - r * 0.35, y - r * 0.2, r * 0.13); p.dot(x + r * 0.35, y - r * 0.2, r * 0.13); p.arc(x, y + r * 0.55, r * 0.45, r * 0.32, 200, 340, r * 0.13); },
  tree: (p, x, y, s) => { p.poly([[x - s * 0.08, y + s * 0.5], [x + s * 0.08, y + s * 0.5], [x + s * 0.06, y], [x - s * 0.06, y]], "#7a5434", s * 0.05); p.ell(x, y - s * 0.12, s * 0.42, s * 0.36, "#5cae4a", s * 0.06); },
  brick: (p, x, y, s) => { p.poly([[x - s * 0.5, y - s * 0.4], [x + s * 0.5, y - s * 0.4], [x + s * 0.5, y + s * 0.4], [x - s * 0.5, y + s * 0.4]], "#b5603e", s * 0.06); for (let i = 1; i < 4; i++) p.stroke([[x - s * 0.5, y - s * 0.4 + i * s * 0.2], [x + s * 0.5, y - s * 0.4 + i * s * 0.2]], s * 0.04, "#7a3a24"); for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) { const xx = x - s * 0.25 + k * s * 0.5 + (i % 2) * s * 0.25 - s * 0.12; p.stroke([[xx, y - s * 0.4 + i * s * 0.2], [xx, y - s * 0.2 + i * s * 0.2]], s * 0.04, "#7a3a24"); } },
  pill: (p, x, y, s, col = "#ffffff") => { p.poly(rrect(x - s, y - s * 0.42, x + s, y + s * 0.42, s * 0.42), col, s * 0.16); p.stroke([[x, y - s * 0.42], [x, y + s * 0.42]], s * 0.1); },
  sun: (p, x, y, s) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.stroke([[x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.7], [x + Math.cos(a) * s, y + Math.sin(a) * s]], s * 0.12, "#f2a93b"); } p.ell(x, y, s * 0.5, s * 0.5, "#ffd23f", s * 0.1); },
  heart: (p, x, y, s, col = "#ef5b7f") => { const pts = []; for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 2; pts.push([x + s * 0.06 * 16 * Math.sin(t) ** 3, y - s * 0.06 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } p.poly(pts, col, s * 0.1); },
  grape: (p, x, y, s, col = "#7b3b8f") => { for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-0.5, 0], [0.5, 0], [0, 1]]) p.ell(x + dx * s * 0.32, y + dy * s * 0.3, s * 0.2, s * 0.2, col, s * 0.06); p.stroke([[x, y - s * 0.45], [x + s * 0.1, y - s * 0.65]], s * 0.06, "#4a7a2e"); },
  crest: (p, x, y, s) => { const pts = [[x - s * 0.5, y - s * 0.55], [x + s * 0.5, y - s * 0.55], [x + s * 0.5, y + s * 0.05], [x, y + s * 0.6], [x - s * 0.5, y + s * 0.05]]; p.poly(pts, "#7a1830", s * 0.08); p.clip(pts, () => { p.poly([[x - s, y - s], [x, y - s], [x, y + s], [x - s, y + s]], "#9c2440", 0); }); icon.grape(p, x, y - s * 0.02, s * 0.6, "#f2c14e"); p.poly(pts, null, s * 0.08); },
  lines: (p, x, y, w, n, gap, col = "#b9b9c2", lw = 6) => { for (let i = 0; i < n; i++) { const ww = w * (i === n - 1 ? 0.55 : 0.85 + 0.15 * Math.sin(i * 2.7)); p.stroke([[x - w / 2, y + i * gap], [x - w / 2 + ww, y + i * gap]], lw, col); } },
  sparkle: (p, x, y, s, col = "#fff6c4") => { const pts = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? s * 0.28 : s; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } p.poly(pts, col, s * 0.12); },
  anchor: (p, x, y, s, col) => { p.stroke([[x, y - s * 0.6], [x, y + s * 0.55]], s * 0.16, col); p.arc(x, y + s * 0.15, s * 0.5, s * 0.42, 10, 170, s * 0.16, col); p.stroke([[x - s * 0.3, y - s * 0.3], [x + s * 0.3, y - s * 0.3]], s * 0.14, col); p.arc(x, y - s * 0.72, s * 0.15, s * 0.15, 0, 360, s * 0.1, col); },
  star: (p, x, y, s, col, ol = 0) => { const pts = []; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? s * 0.42 : s; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } p.poly(pts, col, ol); },
};

// ---------- props held in hands ----------
const HELD = {
  cup: (p, x, y, u, o = {}) => { const w = 14 * u, h = 22 * u; p.poly([[x - w, y - h], [x + w, y - h], [x + w * 0.8, y + h * 0.6], [x - w * 0.8, y + h * 0.6]], "#fafafa", 2.4 * u); p.poly([[x - w * 0.95, y - h * 0.2], [x + w * 0.95, y - h * 0.2], [x + w * 0.88, y + h * 0.25], [x - w * 0.88, y + h * 0.25]], "#b8763e", 2 * u); p.poly([[x - w * 1.12, y - h - 5 * u], [x + w * 1.12, y - h - 5 * u], [x + w * 1.05, y - h + 2 * u], [x - w * 1.05, y - h + 2 * u]], "#5b3b2a", 2 * u); if (o.slosh) { for (let i = 0; i < 3; i++) p.ell(x + (i - 1) * 10 * u + o.slosh * 8 * u, y - h - 12 * u - Math.abs(o.slosh) * (6 + i * 5) * u, 3.5 * u, 4.5 * u, "#8a5530", 1.2 * u); } p.dot(x, y + 2 * u, 5.5 * u); },
  glass: (p, x, y, u, o = {}) => { const col = o.col || "#f3e6a2", lv = o.level ?? 0.5; const bw = 15 * u, bh = 22 * u, by = y - 30 * u; const bowl = [[x + bw, by - bh * 0.4], ...ellPts(x, by, bw, bh, 0, 180, 0, 20), [x - bw, by - bh * 0.4]]; p.clip(bowl, () => p.poly([[x - bw, by - bh * 0.4 + (1 - lv) * bh * 1.2], [x + bw, by - bh * 0.4 + (1 - lv) * bh * 1.2], [x + bw, by + bh], [x - bw, by + bh]], col, 0)); p.poly(bowl, "#ffffff22", 2.2 * u); p.stroke([[x, by + bh], [x, y + 4 * u]], 2.6 * u); p.stroke([[x - 9 * u, y + 4 * u], [x + 9 * u, y + 4 * u]], 2.6 * u); p.stroke([[x - bw * 0.55, by - bh * 0.1], [x - bw * 0.6, by + bh * 0.4]], 2 * u, "#ffffffcc"); p.dot(x, y + 2 * u, 5.5 * u); },
  notebook: (p, x, y, u) => { const w = 24 * u, h = 30 * u; p.poly([[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]], "#f8f4ea", 2.4 * u); p.stroke([[x - w, y - h], [x - w, y + h]], 4 * u, "#7a3b3b"); icon.lines(p, x + 2 * u, y - h + 12 * u, w * 1.4, 5, 10 * u, "#b9b9c2", 2 * u); p.dot(x - w * 0.4, y + h * 0.6, 5.5 * u); },
  clipboard: (p, x, y, u) => { const w = 24 * u, h = 32 * u; p.poly(rrect(x - w, y - h, x + w, y + h, 4 * u), "#b07a46", 2.4 * u); p.poly([[x - w + 5 * u, y - h + 8 * u], [x + w - 5 * u, y - h + 8 * u], [x + w - 5 * u, y + h - 5 * u], [x - w + 5 * u, y + h - 5 * u]], "#fbfbf6", 1.5 * u); p.poly(rrect(x - 9 * u, y - h - 4 * u, x + 9 * u, y - h + 8 * u, 2 * u), "#9aa3ad", 1.8 * u); icon.lines(p, x, y - h + 18 * u, w * 1.4, 4, 10 * u, "#b9b9c2", 2 * u); p.dot(x - w * 0.5, y + h * 0.6, 5.5 * u); },
  stopwatch: (p, x, y, u, o = {}) => { const r = 18 * u; p.poly(rrect(x - 4 * u, y - r - 10 * u, x + 4 * u, y - r + 2 * u, 2 * u), "#9aa3ad", 1.6 * u); p.ell(x, y, r, r, "#e8edf2", 2.6 * u); p.ell(x, y, r * 0.8, r * 0.8, "#ffffff", 1.2 * u); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.dot(x + Math.cos(a) * r * 0.65, y + Math.sin(a) * r * 0.65, 1.3 * u); } const a = (o.t || 0) * Math.PI * 2 - Math.PI / 2; p.stroke([[x, y], [x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6]], 2.2 * u, "#d23c3c"); p.dot(x, y, 2 * u); if (!o.nohand) p.dot(x + r * 0.9, y + r * 0.4, 5.5 * u); },
  pill: (p, x, y, u) => { icon.pill(p, x, y - 8 * u, 6 * u); p.dot(x, y + 2 * u, 5.5 * u); },
  key: (p, x, y, u) => { p.ell(x - 12 * u, y - 10 * u, 8 * u, 8 * u, "#e7c255", 2 * u); p.stroke([[x - 6 * u, y - 6 * u], [x + 16 * u, y - 18 * u]], 3.2 * u, "#e7c255"); p.dot(x, y + 1 * u, 5.5 * u); },
  folder: (p, x, y, u, o = {}) => { const w = 26 * u, h = 20 * u; p.poly([[x - w, y - h], [x - w * 0.3, y - h], [x - w * 0.2, y - h - 6 * u], [x + w, y - h - 6 * u], [x + w, y + h], [x - w, y + h]], o.col || "#e8c26a", 2.4 * u); p.poly([[x - w + 4 * u, y - h + 4 * u], [x + w - 4 * u, y - h + 4 * u], [x + w - 4 * u, y + h - 4 * u], [x - w + 4 * u, y + h - 4 * u]], "#fbfbf6", 1.4 * u); icon.lines(p, x + 6 * u, y - h + 12 * u, w * 1.1, 3, 9 * u, "#b9b9c2", 2 * u); if (o.ic === "tree") icon.tree(p, x - w * 0.62, y + 4 * u, 14 * u); if (o.ic === "brick") icon.brick(p, x - w * 0.62, y + 6 * u, 12 * u); p.dot(x, y + h, 5.5 * u); },
  brochure: (p, x, y, u, o = {}) => { const rich = o.kind === "rich", w = 22 * u, h = 30 * u; p.poly([[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]], rich ? "#1f2d5c" : "#f1efe6", 2.4 * u); if (rich) { p.poly([[x - w + 4 * u, y - h + 4 * u], [x + w - 4 * u, y - h + 4 * u], [x + w - 4 * u, y + h - 4 * u], [x - w + 4 * u, y + h - 4 * u]], null, 1.5 * u); icon.coinStack(p, x, y - 2 * u, 9 * u, 4); icon.lines(p, x, y + 16 * u, w * 1.3, 2, 7 * u, "#e8c56a", 2 * u); } else { icon.tag(p, x - 4 * u, y - 12 * u, 11 * u); icon.coin(p, x + 10 * u, y + 6 * u, 5 * u); icon.lines(p, x, y + 18 * u, w * 1.3, 2, 7 * u, "#b9b9c2", 2 * u); } if (!o.nohand) p.dot(x - w * 0.6, y + h * 0.5, 5.5 * u); },
  cane: (p, x, y, u) => { p.stroke([[x, y], [x + 2 * u, y + 105 * u]], 3.4 * u, "#6a4a32"); p.arc(x - 7 * u, y, 7 * u, 7 * u, 180, 360, 3.4 * u, "#6a4a32"); p.dot(x, y + 2 * u, 5.5 * u); },
  bag: (p, x, y, u) => { p.poly(rrect(x - 22 * u, y + 2 * u, x + 22 * u, y + 34 * u, 6 * u), "#b5653f", 2.4 * u); p.arc(x, y + 3 * u, 12 * u, 12 * u, 180, 360, 2.6 * u); p.stroke([[x - 22 * u, y + 14 * u], [x + 22 * u, y + 14 * u]], 1.6 * u, "#7a3b24"); p.dot(x, y, 5.5 * u); },
  roller: (p, x, y, u) => { p.stroke([[x, y], [x, y - 40 * u]], 3 * u, "#7a5434"); p.poly(rrect(x - 26 * u, y - 56 * u, x + 26 * u, y - 40 * u, 7 * u), "#f2a6c2", 2 * u); p.dot(x, y, 5.5 * u); },
};

// ---------- person ----------
const BUILDS = { normal: 1, big: 1.38, thin: 0.72, round: 1.22 };
export const person = (p, O, o = {}) => {
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, mode = "stand", step = 0, light = rad(-120) } = o;
  const lid = lidOf(blink), skin = O.skin ?? SKIN, bk = BUILDS[O.build || "normal"];
  const H = headBlob(seed, O.headA || 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const legsL = mode === "sit" ? 0.9 : (O.legs || 1.38), sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, torsoL = O.build === "big" ? 1.18 : O.build === "thin" ? 1.12 : 1.08;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const top = O.top || "#4f7fb8", pants = O.pants || "#3b3f52", shoes = O.shoes || "#3a2a20";
  const legCol = mix(pants, INK, 0.45), sleeve = O.coat || O.cardigan || O.gown || top;
  const armW = (O.build === "big" ? 8.5 : O.build === "thin" ? 3.6 : 5.4) * u;
  p.rot = null;
  // wheelchair behind
  if (O.wheelchair) {
    const wy = sole - 0.62 * HH;
    p.poly(rrect(cx - 0.62 * W, torsoBot - 0.95 * HH, cx + 0.62 * W, torsoBot + 0.05 * HH, 10 * u), "#3d7fb0", 2.5 * u);
    for (const s of [-1, 1]) { p.ell(cx + s * 0.7 * W, wy, 0.62 * HH, 0.62 * HH, null, 5 * u); p.ell(cx + s * 0.7 * W, wy, 0.56 * HH, 0.56 * HH, null, 2.6 * u, 0, 360); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + (o.roll || 0); p.stroke([[cx + s * 0.7 * W, wy], [cx + s * 0.7 * W + Math.cos(a) * 0.56 * HH, wy + Math.sin(a) * 0.56 * HH]], 1.2 * u, "#8a96a3"); } p.dot(cx + s * 0.7 * W, wy, 4 * u, "#9aa3ad"); }
  }
  // ---- legs ----
  const dress = O.skirt || O.gown;
  for (const side of [-1, 1]) {
    if (mode === "sit") {
      const h = [cx + side * 16 * u, hipY], k = [cx + side * 30 * u, torsoBot + 0.12 * HH], f = [cx + side * 30 * u, sole - 5 * u];
      p.stroke([h, k], 6.2 * u * Math.sqrt(bk), legCol); p.stroke([k, f], 6 * u * Math.sqrt(bk), dress && !O.pantsUnder ? skin : legCol);
      p.stroke([[f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 0.5 * u]], 8 * u + 3, INK); p.stroke([[f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 0.5 * u]], 8 * u, shoes);
      continue;
    }
    const ph = step ? Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0))) : 0, up = Math.max(0, ph) * 26 * u, sw = ph * 10 * u;
    const hx = cx + side * 15 * u * Math.sqrt(bk), fx = cx + side * 20 * u * Math.sqrt(bk) + sw, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 6 * u * Math.sqrt(bk), dress && !O.pantsUnder ? skin : legCol);
    p.stroke([[fx - side * 4 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.5 * u + 3, INK); p.stroke([[fx - side * 4 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.5 * u, shoes);
    if (O.sneakers) p.stroke([[fx - side * 3 * u, fy + 2.5 * u], [fx + side * 12 * u, fy + 3 * u]], 2 * u, "#ffffff");
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const Tb = { a: (0.4 * W) / 1.06 * bk, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.build === "big" || O.build === "round" ? 0.17 : 0.1, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - Tb.b, tp = blobPts(tcx, tcy, Tb);
  const S = (side) => [tcx + side * 0.85 * Tb.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (Tb.a * 1.1 + k * u), Y0 = s[1];
    switch (pose) {
      case "point": return { pts: [s, [X(28), Y0 - 0.02 * HH], [X(62), Y0 - 0.1 * HH]], finger: true };
      case "press": return { pts: [s, [X(26), Y0 - 0.05 * HH], [X(48), Y0 - 0.32 * HH]], finger: true };
      case "up": return { pts: [s, [X(14), Y0 - 0.3 * HH], [X(22), Y0 - 0.75 * HH]] };
      case "wave": return { pts: [s, [X(16), Y0 - 0.2 * HH], [X(30 + 10 * Math.sin(o.wv || 0)), Y0 - 0.62 * HH]] };
      case "fist": return { pts: [s, [X(18), Y0 - 0.25 * HH], [X(12), Y0 - 0.66 * HH]], fist: true };
      case "hip": return { pts: [s, [X(22), Y0 + 0.3 * HH], [tcx + side * Tb.a * 0.95, torsoBot - 0.3 * HH]] };
      case "belly": return { pts: [s, [X(8), Y0 + 0.45 * HH], [tcx + side * 0.25 * Tb.a, torsoBot - 0.35 * HH]], front: true };
      case "cheek": return { pts: [s, [X(16), Y0 + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]] };
      case "chin": return { pts: [s, [X(6), Y0 + 0.3 * HH], [cx + side * 14 * u, hc + 0.85 * H.b]], front: true };
      case "mouth": return { pts: [s, [X(10), Y0 + 0.28 * HH], [cx + side * 6 * u, hc + 0.42 * H.b]], front: true };
      case "eyes": return { pts: [s, [X(10), Y0 + 0.2 * HH], [cx + side * 12 * u, hc - 0.05 * H.b]], front: true };
      case "thumb": return { pts: [s, [X(20), Y0 + 0.12 * HH], [X(44), Y0 - 0.12 * HH]], thumb: 1 };
      case "thumbdown": return { pts: [s, [X(22), Y0 + 0.05 * HH], [X(44), Y0 + 0.2 * HH]], thumb: -1 };
      case "shrug": return { pts: [s, [X(24), Y0 + 0.18 * HH], [X(46), Y0 - 0.05 * HH]], palm: true };
      case "cross": return { pts: [s, [X(2), Y0 + 0.38 * HH], [tcx - side * 0.45 * Tb.a, Y0 + 0.32 * HH]], front: true };
      case "hold": return { pts: [s, [X(10), Y0 + 0.42 * HH], [tcx + side * (Tb.a * 0.55 + 6 * u), Y0 + 0.22 * HH]], front: true };
      case "holdHi": return { pts: [s, [X(16), Y0 + 0.25 * HH], [X(10), Y0 - 0.12 * HH]] };
      case "out": return { pts: [s, [X(30), Y0 + 0.1 * HH], [X(60), Y0 + 0.02 * HH]] };
      case "reach": return { pts: [s, [X(42), Y0 - 0.12 * HH], [X(82), Y0 - 0.4 * HH]] };
      case "wrestle": { const a = o.wr ?? 0; return { pts: [s, [X(34), Y0 + 0.36 * HH], [X(40 + 30 * a), Y0 + 0.02 * HH - 38 * u * Math.cos(a * 1.2)]], fist: true }; }
      case "down": return { pts: [s, [X(14), Y0 + 0.42 * HH], [X(26), chin + 0.95 * HH]] };
      case "pace": return { pts: [s, [X(6), Y0 + 0.45 * HH], [X(6 + 10 * Math.sin(o.sw || 0)), chin + 1.0 * HH]], fist: true };
      default: return { pts: [s, [X(4), Y0 + 0.48 * HH], [X(3), chin + 1.04 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a, side) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]);
    if (O.sleeves === "short") { const half = c.slice(0, 5); p.stroke(c, armW + 2.4 * u, INK); p.stroke(c, armW, skin); p.stroke(half, armW + 2.4 * u, INK); p.stroke(half, armW + 1 * u, sleeve);
      if (O.tattoo) { const [tx, ty] = c[7]; (side < 0 ? icon.anchor : icon.star)(p, tx, ty, 6.5 * u, "#2c5a8a"); } }
    else p.stroke(c, armW, mix(sleeve, INK, 0.35));
    const [hx, hy] = a.pts[2], hr = (O.build === "big" ? 7.5 : 5.5) * u;
    if (a.palm) { p.ell(hx, hy, hr * 1.1, hr * 0.8, skin, 2.2 * u); }
    else p.ell(hx, hy, hr, hr, skin, 2.4 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.band([[hx, hy], [hx + dx / l * 13 * u, hy + dy / l * 13 * u]], skin, 2.6 * u, 1.2 * u, "round"); }
    if (a.thumb) p.band([[hx, hy], [hx + Math.sign(hx - cx) * 2 * u, hy - a.thumb * 12 * u]], skin, 3 * u, 1.2 * u, "round");
    const held = side < 0 ? o.heldL : o.heldR;
    if (held) HELD[held.k](p, hx, hy, u, held);
  };
  for (const [i, a] of arms.entries()) if (!a.front) drawArm(a, i ? 1 : -1);
  // dress / gown skirt
  if (dress) {
    const D = { a: 0.5 * W * 0.95 * bk, b: 0.5 * ((sole - (O.gown ? 0.62 : 0.45) * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.3, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - (O.gown ? 0.62 : 0.45) * HH - D.b, D), dc = O.gown || O.skirt;
    p.gradFill(dp, dc, mul(dc, SH_CLOTH), light); if (O.gown) p.clip(dp, () => { for (let i = 0; i < 14; i++) p.dot(cx - D.a + (i % 5) * D.a * 0.5 + (i % 2) * 12 * u, tcy + Math.floor(i / 5) * 0.4 * HH, 3 * u, "#ffffff88"); }); p.inkRing(dp, ow, thick);
  } else if (mode !== "sit") { // trouser top
    const sk = [[tcx - 0.9 * Tb.a, torsoBot - 0.2 * HH], [tcx + 0.9 * Tb.a, torsoBot - 0.2 * HH], [tcx + 0.95 * Tb.a, torsoBot + 0.22 * HH], [tcx - 0.95 * Tb.a, torsoBot + 0.22 * HH]];
    p.gradFill(sk, pants, mul(pants, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.stripes) p.clip(sk, () => { for (let i = 0; i < 4; i++) p.poly([[tcx - Tb.a * 1.2, torsoBot - 0.2 * HH + i * 0.12 * HH], [tcx + Tb.a * 1.2, torsoBot - 0.2 * HH + i * 0.12 * HH], [tcx + Tb.a * 1.2, torsoBot - 0.14 * HH + i * 0.12 * HH], [tcx - Tb.a * 1.2, torsoBot - 0.14 * HH + i * 0.12 * HH]], O.stripes, 0); });
  } else { // lap
    const lp = [[tcx - 0.95 * Tb.a, torsoBot - 0.2 * HH], [tcx + 0.95 * Tb.a, torsoBot - 0.2 * HH], [tcx + 1.0 * Tb.a, torsoBot + 0.16 * HH], [tcx - 1.0 * Tb.a, torsoBot + 0.16 * HH]];
    const lc = O.gown || O.skirt || pants; p.gradFill(lp, lc, mul(lc, SH_CLOTH), light); p.poly(lp, null, ow * 0.8);
  }
  // torso
  p.gradFill(tp, top, mul(top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.stripes) for (let i = 0; i < 7; i++) { const y0 = chin - 0.05 * HH + i * 0.16 * HH; p.poly([[tcx - 2 * Tb.a, y0], [tcx + 2 * Tb.a, y0], [tcx + 2 * Tb.a, y0 + 0.07 * HH], [tcx - 2 * Tb.a, y0 + 0.07 * HH]], O.stripes, 0); }
    if (O.jersey) { p.poly([[tcx - 2 * Tb.a, tcy - 0.05 * HH], [tcx + 2 * Tb.a, tcy - 0.05 * HH], [tcx + 2 * Tb.a, tcy + 0.06 * HH], [tcx - 2 * Tb.a, tcy + 0.06 * HH]], O.jersey, 0); }
    if (O.coat || O.cardigan) { const cc = O.coat || O.cardigan; for (const s of [-1, 1]) p.poly([[tcx + s * 2 * Tb.a, chin - 0.2 * HH], [tcx + s * 0.18 * Tb.a, chin - 0.2 * HH], [tcx + s * 0.3 * Tb.a, torsoBot + 0.2 * HH], [tcx + s * 2 * Tb.a, torsoBot + 0.2 * HH]], mixc(cc, "#ffffff", 0), 0);
      p.stroke([[tcx - 0.18 * Tb.a, chin - 0.1 * HH], [tcx - 0.3 * Tb.a, torsoBot + 0.2 * HH]], 2 * u); p.stroke([[tcx + 0.18 * Tb.a, chin - 0.1 * HH], [tcx + 0.3 * Tb.a, torsoBot + 0.2 * HH]], 2 * u);
      if (O.coat) p.poly(rrect(tcx + 0.4 * Tb.a, tcy - 0.05 * HH, tcx + 0.8 * Tb.a, tcy + 0.15 * HH, 3 * u), mul(O.coat, [0.92, 0.94, 0.97]), 1.6 * u);
      if (O.cardigan) for (let i = 0; i < 3; i++) p.dot(tcx - 0.24 * Tb.a, chin + (0.15 + i * 0.22) * HH, 2.6 * u, "#6b4a1e"); }
    if (O.apron) p.poly([[tcx - 0.62 * Tb.a, chin + 0.1 * HH], [tcx + 0.62 * Tb.a, chin + 0.1 * HH], [tcx + 0.7 * Tb.a, torsoBot + 0.25 * HH], [tcx - 0.7 * Tb.a, torsoBot + 0.25 * HH]], O.apron, 1.8 * u);
    if (O.uniform) { p.band([[tcx - 1.4 * Tb.a, torsoBot - 0.22 * HH], [tcx + 1.4 * Tb.a, torsoBot - 0.22 * HH]], "#2a2a2a", 0.07 * HH, 1.2 * u); p.poly(rrect(tcx - 6 * u, torsoBot - 0.26 * HH, tcx + 6 * u, torsoBot - 0.18 * HH, 1.5 * u), "#e2c27a", 1.2 * u);
      for (let i = 0; i < 3; i++) p.dot(tcx, chin + (0.15 + i * 0.2) * HH, 2.4 * u, "#e2c27a"); icon.star(p, tcx + 0.5 * Tb.a, chin + 0.25 * HH, 6 * u, "#e2c27a", 1.2 * u); }
    if (O.fireCoat) { for (const yy of [0.35, 0.75]) p.band([[tcx - 1.4 * Tb.a, chin + yy * HH], [tcx + 1.4 * Tb.a, chin + yy * HH]], "#f3e04a", 0.05 * HH, 1 * u); p.band([[tcx - 1.4 * Tb.a, chin + 0.55 * HH], [tcx + 1.4 * Tb.a, chin + 0.55 * HH]], "#d9dde0", 0.03 * HH, 0.8 * u); }
    p.stroke([[tcx - 0.2 * Tb.a, chin + 0.02 * HH], [tcx, chin + 0.14 * HH], [tcx + 0.2 * Tb.a, chin + 0.02 * HH]], 2 * u);
  });
  p.inkRing(tp, ow, thick);
  if (O.bowtie) { const by = chin + 0.06 * HH; p.poly([[tcx, by], [tcx - 13 * u, by - 7 * u], [tcx - 13 * u, by + 7 * u]], O.bowtie, 1.6 * u); p.poly([[tcx, by], [tcx + 13 * u, by - 7 * u], [tcx + 13 * u, by + 7 * u]], O.bowtie, 1.6 * u); p.dot(tcx, by, 3.2 * u, mul(O.bowtie, [0.7, 0.7, 0.7])); }
  if (O.tie) p.poly([[tcx - 4 * u, chin + 0.04 * HH], [tcx + 4 * u, chin + 0.04 * HH], [tcx + 6 * u, chin + 0.45 * HH], [tcx, chin + 0.52 * HH], [tcx - 6 * u, chin + 0.45 * HH]], O.tie, 1.6 * u);
  if (O.electrode) { const a = arms[1].pts; const [ex, ey] = lerp2(a[1], a[2], 0.7); p.poly(rrect(ex - 7 * u, ey - 4 * u, ex + 7 * u, ey + 4 * u, 2 * u), "#3a3f4a", 1.4 * u); p.stroke([[ex, ey], [ex + 20 * u, ey + 40 * u], [ex + 10 * u, ey + 80 * u]], 1.4 * u, "#d23c3c"); }
  for (const [i, a] of arms.entries()) if (a.front) drawArm(a, i ? 1 : -1);
  if (O.wheelchair) for (const s of [-1, 1]) { const wy = sole - 0.62 * HH; p.arc(cx + s * 0.7 * W, wy, 0.62 * HH, 0.62 * HH, s > 0 ? -60 : 120, s > 0 ? 60 : 240, 5 * u, "#2c3e50"); }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  const hp = blobPts(cx, hc, H);
  if (O.long) { const hb = blobPts(cx, hc + 0.18 * HH, { ...H, a: H.a * 1.12, b: H.b * 1.18, egg: 0.1 }); p.poly(hb, O.hair, 3 * u); }
  if (O.hair && O.hat !== "fire") { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: top }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair && !O.hat) hatOn(p, { hat: "hair", hair: O.hair, jacket: top }, hp, H, cx, hc, light, seed, facing, false);
  if (O.bun) { p.ell(cx, hc - 1.05 * H.b, 0.32 * H.a, 0.26 * H.b, O.hair, 3 * u); }
  if (O.bald) for (const s of [-1, 1]) p.ell(cx + s * 0.92 * H.a, hc - 0.05 * H.b, 0.16 * H.a, 0.28 * H.b, O.bald, 2.4 * u);
  if (O.beard) { const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.62 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 }); p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3); p.inkRing(bd, ow * 0.8, thick); }
  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.moustache, O.build === "big");
  if (O.glasses) for (const s of [-1, 1]) { p.ell(cx + 7 * u * facing + s * 13 * u, hc, 10.5 * u, 9.5 * u, "#ffffff30", 2.6 * u); if (s < 0) p.stroke([[cx + 7 * u * facing - 3 * u, hc - 1 * u], [cx + 7 * u * facing + 3 * u, hc - 1 * u]], 2.4 * u); }
  if (O.hat === "guard") { const cy0 = hc - 0.72 * H.b; p.poly([[cx - 0.98 * H.a, cy0 + 8 * u], [cx + 0.98 * H.a, cy0 + 8 * u], [cx + 1.08 * H.a, cy0 - 30 * u], [cx - 1.08 * H.a, cy0 - 30 * u]], "#2c3a5e", ow * 0.8); p.poly([[cx - 0.98 * H.a, cy0 + 2 * u], [cx + 0.98 * H.a, cy0 + 2 * u], [cx + 0.98 * H.a, cy0 + 10 * u], [cx - 0.98 * H.a, cy0 + 10 * u]], "#1b2238", 1.6 * u); p.ell(cx, cy0 + 14 * u, 0.85 * H.a, 9 * u, "#1b2238", 2 * u, 0, 180); icon.star(p, cx, cy0 - 12 * u, 8 * u, "#e2c27a", 1.2 * u); }
  if (O.hat === "nurse") { const cy0 = hc - 0.85 * H.b; p.poly([[cx - 0.6 * H.a, cy0 + 6 * u], [cx + 0.6 * H.a, cy0 + 6 * u], [cx + 0.5 * H.a, cy0 - 20 * u], [cx - 0.5 * H.a, cy0 - 20 * u]], "#ffffff", 2.4 * u); icon.heart(p, cx, cy0 - 7 * u, 7 * u); }
  if (O.hat === "fire") { const cy0 = hc - 0.38 * H.b; const hp2 = ellPts(cx, cy0, H.a * 1.06, H.b * 0.78, 180, 360, 0, 40); p.shadedFill(hp2, "#d8322c", "#9a1e1e", light, H.a); p.inkRing(hp2, ow, thick); p.ell(cx, cy0 + 2 * u, H.a * 1.45, 10 * u, "#c12a26", ow * 0.8); p.poly(rrect(cx - 10 * u, cy0 - H.b * 0.7, cx + 10 * u, cy0 - 6 * u, 4 * u), "#b7242a", 1.8 * u); p.stroke(ellPts(cx - 0.4 * H.a, cy0 - 0.45 * H.b, 0.2 * H.a, 0.15 * H.b, 200, 300, 0, 12), 4 * u, "#ffffff66"); }
  if (O.hat === "chef") {}
  p.rot = null;
};

// ---------- the Brain host ----------
const brainOutline = (cx, cy, rx, ry) => { const pts = []; const n = 120; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; const b = 1 + 0.035 * Math.abs(Math.sin(t * 6.5)) + 0.012 * Math.sin(t * 13); pts.push([cx + Math.cos(t) * rx * b, cy + Math.sin(t) * ry * b * (Math.sin(t) > 0 ? 0.92 : 1)]); } return pts; };
const GYRI = [ // squiggles in unit brain space (x,y in -1..1)
  [[-0.78, -0.1], [-0.6, -0.35], [-0.38, -0.25], [-0.32, -0.52], [-0.12, -0.62]], [[0.78, -0.1], [0.6, -0.35], [0.38, -0.25], [0.32, -0.52], [0.12, -0.62]],
  [[-0.88, 0.2], [-0.72, 0.05], [-0.62, 0.22]], [[0.88, 0.2], [0.72, 0.05], [0.62, 0.22]],
  [[-0.55, -0.72], [-0.42, -0.58], [-0.6, -0.5]], [[0.55, -0.72], [0.42, -0.58], [0.6, -0.5]],
  [[-0.7, 0.55], [-0.5, 0.48], [-0.42, 0.66]], [[0.7, 0.55], [0.5, 0.48], [0.42, 0.66]],
];
const BEXPR = {
  neutral: { eye: "open", brow: [0, 0], mouth: "smile" }, happy: { eye: "happy", brow: [-6, -6], mouth: "grin" }, wow: { eye: "wide", brow: [-16, -16], mouth: "O" },
  smug: { eye: "half", brow: [-4, -18], mouth: "smirk" }, worried: { eye: "open", brow: [8, -6], mouth: "wave" }, sly: { eye: "sly", brow: [6, -6], mouth: "smirk" },
  closed: { eye: "closed", brow: [-2, -2], mouth: "smile" }, ouch: { eye: "squeeze", brow: [8, 8], mouth: "wave" }, excited: { eye: "wide", brow: [-12, -12], mouth: "grin" },
  shrug: { eye: "half", brow: [-10, -10], mouth: "flat" }, curious: { eye: "open", brow: [-12, 2], mouth: "o" }, oops: { eye: "squeeze", brow: [6, 6], mouth: "grin" },
};
export const brain = (p, o = {}) => {
  const { expr = "neutral", blink = 0, look = [0, 0], L = "hang", R = "hang", legs = "stand", step = 0, shadow = false, wv = 0, wheel = null, wineGlasses = false, sitting = false } = o;
  const E = BEXPR[expr] || BEXPR.neutral, cx = 300, sole = 975, legL = legs === "jump" ? 70 : legs === "sit" ? 70 : 120, bcy = sole - legL - 205, rx = 230, ry = 200, u = 2.4;
  const body = shadow ? "#3a2b57" : PINK, dark = shadow ? "#251a3b" : PINK_D, inkC = shadow ? "#120c1e" : INK;
  const light = rad(-125), thick = thickAngle(light);
  const limb = (pts, w, col) => { p.stroke(pts, w + 7, inkC); p.stroke(pts, w, col); };
  // legs + sneakers
  for (const s of [-1, 1]) {
    const hx = cx + s * 70, hy = bcy + ry * 0.85;
    let kx = hx + s * 6, ky = hy + legL * 0.5, fx = hx + s * 10, fy = sole - 18;
    if (legs === "jump") { kx = hx + s * 40; ky = hy + 30; fx = hx + s * 18; fy = hy + 62; }
    if (legs === "walk") { const ph = Math.sin(Math.PI * 2 * (step + (s > 0 ? 0.5 : 0))); fx += ph * 22; fy -= Math.max(0, ph) * 24; kx += ph * 10; }
    if (legs === "sit") { kx = hx + s * 30; ky = hy + 20; fx = hx + s * 52; fy = hy + 60; }
    limb(curve([hx, hy], [kx, ky], [fx, fy]), 18, body);
    if (!shadow) { const sh = [[fx - s * 34, fy - 10], [fx - s * 30, fy - 30], [fx + s * 12, fy - 32], [fx + s * 44, fy - 8], [fx + s * 46, fy + 10], [fx - s * 36, fy + 12]]; p.poly(sh, "#ffffff", 7); p.stroke([[fx - s * 34, fy + 4], [fx + s * 44, fy + 4]], 6, "#cfd6de"); p.stroke([[fx - s * 14, fy - 20], [fx + s * 20, fy - 6]], 7, "#36c2c9"); }
    else p.ell(fx + s * 6, fy - 6, 40, 18, dark, 0);
  }
  // arms (behind / front)
  const sh = (s) => [cx + s * rx * 0.86, bcy + ry * 0.32];
  const armP = (s, pose) => { const [sx, sy] = sh(s); switch (pose) {
    case "wave": return [[sx, sy], [sx + s * 60, sy - 40], [sx + s * (90 + 20 * Math.sin(wv)), sy - 150]];
    case "up": return [[sx, sy], [sx + s * 50, sy - 70], [sx + s * 60, sy - 190]];
    case "knock": return [[sx, sy], [sx + s * 40, sy - 160], [cx + s * 80, bcy - ry * 0.98 - 10 * (o.kn || 0)]];
    case "sign": return [[sx, sy], [sx + s * 10, sy - 30], [cx + s * 70, sy - 40]];
    case "throw": return [[sx, sy], [sx + s * 30, sy - 120], [sx + s * 10 + s * 40 * (o.th || 0), sy - 220 + 60 * (o.th || 0)]];
    case "shrug": return [[sx, sy], [sx + s * 70, sy + 20], [sx + s * 120, sy - 50]];
    case "facepalm": return [[sx, sy], [sx - s * 10, sy + 40], [cx + s * 20, bcy + 10]];
    case "wheel": return [[sx, sy], [sx - s * 20, sy + 60], [cx + s * 95 * Math.cos(o.wa || 0) - 95 * Math.sin(o.wa || 0) * 0, bcy + ry * 0.62 + s * 0]];
    case "hold": return [[sx, sy], [sx + s * 60, sy - 50], [sx + s * 80, sy - 130]];
    case "point": return [[sx, sy], [sx + s * 70, sy - 20], [sx + s * 140, sy - 50]];
    case "chin": return [[sx, sy], [sx + s * 10, sy + 70], [cx + s * 40, bcy + ry * 0.6]];
    case "thumb": return [[sx, sy], [sx + s * 60, sy + 10], [sx + s * 100, sy - 40]];
    case "rest": return [[sx, sy], [sx + s * 60, sy + 60], [sx + s * 110, sy + 70]];
    case "glasses": return [[sx, sy], [sx + s * 30, sy - 60], [cx + s * 150, bcy - 10]];
    default: return [[sx, sy], [sx + s * 30, sy + 60], [sx + s * 30, sy + 130]];
  } };
  const front = (pose) => pose === "facepalm" || pose === "wheel" || pose === "chin" || pose === "sign";
  const hand = (x, y, pose, s) => { if (shadow) { p.ell(x, y, 26, 26, dark, 0); return; } p.ell(x, y, 27, 25, "#ffffff", 6); if (pose === "thumb") p.band([[x, y], [x, y - 32]], "#ffffff", 14, 4, "round"); p.stroke([[x - 6 * s, y + 4], [x + 8 * s, y + 4]], 3, "#cfd6de"); };
  for (const [s, pose] of [[-1, L], [1, R]]) if (!front(pose)) { const a = armP(s, pose); limb(curve(a[0], a[1], a[2]), 15, body); hand(a[2][0], a[2][1], pose, s); }
  // body
  const bp = brainOutline(cx, bcy, rx, ry);
  if (shadow) { p.poly(bp, body, 0); p.inkRing(bp, 10, thick, 0.45, inkC); }
  else {
    p.shadedFill(bp, body, PINK_D, light, rx, 0.45, 0.95, 1.3);
    p.clip(bp, () => {
      for (const g of GYRI) { const pts = g.map(([x, y]) => [cx + x * rx, bcy + y * ry]); p.stroke(curve(pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1], 14), 9, dark); }
      p.stroke(curve([cx, bcy - ry * 1.05], [cx - 14, bcy - ry * 0.75], [cx + 4, bcy - ry * 0.5], 12), 10, dark);
      p.ell(cx - rx * 0.45, bcy - ry * 0.62, rx * 0.22, ry * 0.1, PINK_L + "aa", 0, 0, 360, -20);
    });
    p.inkRing(bp, 10, thick);
  }
  // face
  const ex = 72, ey = bcy + 10, erx = E.eye === "wide" ? 56 : 50, ery = E.eye === "wide" ? 66 : 60, lid = lidOf(blink);
  for (const s of [-1, 1]) {
    const x = cx + s * ex, y = ey;
    if (shadow) { // sly glowing slits
      p.ell(x, y, erx * 0.95, 16, "#ffd84a", 0, 0, 360, s * -12); p.dot(x + 14, y, 9, "#120c1e");
    } else if (E.eye === "happy" || E.eye === "closed" || lid >= 1) { p.arc(x, y + (E.eye === "happy" ? 12 : 0), erx * 0.7, ery * 0.45, E.eye === "happy" ? 200 : 20, E.eye === "happy" ? 340 : 160, 10); }
    else if (E.eye === "squeeze") { p.stroke([[x - s * 34, y - 22], [x + s * 26, y], [x - s * 34, y + 22]], 10); }
    else {
      p.ell(x, y, erx, ery, "#ffffff", 8);
      const pr = E.eye === "wide" ? 20 : 28, px = x + look[0] * 18 + (E.eye === "sly" ? 18 : 0), py = y + 8 + look[1] * 16;
      p.clip(ellPts(x, y, erx, ery), () => { p.dot(px, py, pr, "#2b1d33"); p.dot(px, py, pr * 0.55, "#5a3b7a"); p.dot(px - pr * 0.45, py - pr * 0.45, pr * 0.32, "#ffffff"); p.dot(px + pr * 0.35, py + pr * 0.35, pr * 0.14, "#ffffff");
        const lidY = E.eye === "half" || E.eye === "sly" ? 0.42 : lid > 0 ? 0.55 : 0;
        if (lidY) p.poly([[x - erx * 1.2, y - ery * 1.2], [x + erx * 1.2, y - ery * 1.2], [x + erx * 1.2, y - ery + ery * 2 * lidY], [x - erx * 1.2, y - ery + ery * 2 * lidY]], PINK, 0); });
      p.ell(x, y, erx, ery, null, 8);
      if (E.eye === "half" || E.eye === "sly" || lid > 0) p.stroke([[x - erx * 0.98, y - ery + ery * 2 * (E.eye === "half" || E.eye === "sly" ? 0.42 : 0.55)], [x + erx * 0.98, y - ery + ery * 2 * (E.eye === "half" || E.eye === "sly" ? 0.42 : 0.55)]], 8);
    }
    // brows
    if (!shadow) { const [dI, dO] = E.brow, by = y - ery - 26, bo = s > 0 ? (o.browR ?? 0) : (o.browL ?? 0); p.band([[x - s * 34, by + dI + bo], [x + s * 30, by + dO + bo]], "#8c3556", 12, 4, "round"); }
  }
  if (!shadow) for (const s of [-1, 1]) p.ell(cx + s * 140, ey + 62, 26, 14, "#ff7fa3aa", 0);
  // mouth
  const mx = cx, my = ey + 92, M = shadow ? "smirk" : E.mouth;
  if (M === "smile") p.arc(mx, my - 14, 34, 22, 20, 160, 9);
  else if (M === "grin") { const mp = [...ellPts(mx, my - 10, 44, 38, 0, 180, 0, 20)]; mp.unshift([mx - 44, my - 10]); p.poly(mp, "#7a2440", 7); p.clip(mp, () => p.ell(mx, my + 26, 26, 16, "#ff8aa5", 0)); }
  else if (M === "O") p.ell(mx, my + 2, 22, 28, "#7a2440", 7);
  else if (M === "o") p.ell(mx, my, 12, 14, "#7a2440", 6);
  else if (M === "smirk") p.stroke(curve([mx - 30, my - 2], [mx + 4, my + 6], [mx + 34, my - 14]), shadow ? 8 : 9, shadow ? "#ffd84a" : INK);
  else if (M === "wave") p.stroke([[mx - 32, my], [mx - 16, my - 8], [mx, my], [mx + 16, my - 8], [mx + 32, my]], 8);
  else if (M === "flat") p.stroke([[mx - 26, my], [mx + 26, my]], 8);
  else if (M === "frown") p.arc(mx, my + 14, 30, 18, 200, 340, 9);
  // front arms
  for (const [s, pose] of [[-1, L], [1, R]]) if (front(pose)) { const a = armP(s, pose); limb(curve(a[0], a[1], a[2]), 15, body); hand(a[2][0], a[2][1], pose, s); }
  if (wheel !== null) { const wy = bcy + ry * 0.62, wr = 110, a = o.wa || 0; p.ell(cx, wy, wr, wr, null, 26); p.ell(cx, wy, wr, wr, null, 0); p.arc(cx, wy, wr, wr, 0, 360, 16, "#e74c3c"); for (let k = 0; k < 3; k++) { const aa = a + k * Math.PI * 2 / 3 + Math.PI / 2; p.band([[cx, wy], [cx + Math.cos(aa) * wr, wy + Math.sin(aa) * wr]], "#f1c40f", 12, 4); } p.ell(cx, wy, 26, 26, "#3498db", 6); for (const s of [-1, 1]) { const aa = a + (s < 0 ? Math.PI : 0); hand(cx + Math.cos(aa) * wr, wy + Math.sin(aa) * wr, "", s); } }
  if (wineGlasses) for (const s of [-1, 1]) { const x = cx + s * ex, y = ey; p.ell(x, y, 66, 66, "#ffffff22", 9); p.ell(x, y, 66, 66, null, 4); p.stroke([[x, y + 66], [x + s * 6, y + 150]], 9); p.stroke([[x - 26, y + 150], [x + 30, y + 150]], 9); p.stroke([[x - 40 * s, y - 34], [x - 26 * s, y + 4]], 7, "#ffffffcc"); }
};

// ---------- round sign with dots ----------
export const dotSign = (p, n, cx = 300, cy = 420, r = 230) => {
  p.band([[cx, cy + r * 0.8], [cx, cy + r + 230]], "#c9935a", 26, 7);
  p.ell(cx, cy + 10, r, r, "#1b6f7a", 0);
  p.ell(cx, cy, r, r, "#fff3d6", 14); p.ell(cx, cy, r * 0.86, r * 0.86, null, 6); p.arc(cx, cy, r * 0.93, r * 0.93, 0, 360, 14, "#36c2c9");
  const pos = { 1: [[0, 0]], 2: [[-0.35, 0], [0.35, 0]], 3: [[0, -0.32], [-0.36, 0.26], [0.36, 0.26]], 4: [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]], 5: [[-0.38, -0.38], [0.38, -0.38], [0, 0], [-0.38, 0.38], [0.38, 0.38]] }[n];
  for (const [dx, dy] of pos) { p.ell(cx + dx * r, cy + dy * r, r * 0.17, r * 0.17, PINK, 9); p.dot(cx + dx * r - r * 0.05, cy + dy * r - r * 0.05, r * 0.05, "#ffffff"); }
};

// ---------- props (drawn around the origin; story places them in centred cards) ----------
export const PROP = {
  roller: (p, k = 0) => { // giant paint roller (tilted, pink nap)
    p.band([[0, 340], [0, 40]], "#8a5a34", 26, 7, "round"); p.stroke([[0, 40], [0, -60], [-180, -60], [-180, -110]], 22); p.stroke([[0, 40], [0, -60], [-180, -60], [-180, -110]], 12, "#c7ccd2");
    p.poly(rrect(-330, -230, -30, -110, 50), "#f48fb1", 10); p.clip(rrect(-330, -230, -30, -110, 50), () => { for (let i = 0; i < 14; i++) p.stroke([[-330 + i * 24 + k * 30 % 24, -230], [-322 + i * 24 + k * 30 % 24, -110]], 5, "#e0709a"); });
    for (let i = 0; i < 4; i++) p.ell(-280 + i * 70, -95 + (i % 2) * 18, 9, 14, "#f48fb1", 4);
  },
  can: (p, pour = 0) => { // small red paint can, tilts to pour
    p.g.save(); p.g.rotate(-pour * 1.6);
    p.poly(rrect(-90, -110, 90, 110, 16), "#e6e9ee", 9); p.poly(rrect(-90, -60, 90, 50, 4), "#d32f2f", 6); p.ell(0, -110, 90, 20, "#c4c9cf", 7); p.ell(-10, -110, 70, 14, "#c0171a", 0); icon.heart(p, 0, -5, 40, "#ffffff");
    p.arc(0, -110, 100, 70, 180, 360, 8, "#5a6470");
    p.g.restore();
    if (pour > 0.55) { const k = (pour - 0.55) / 0.45; p.stroke([[-160, -40], [-175, 60 + 300 * k]], 26 * Math.min(1, k * 3), "#c0171a"); }
  },
  stick: (p) => { p.poly(rrect(-24, -360, 24, 300, 18), "#d9b47a", 8); p.clip(rrect(-24, -360, 24, 300, 18), () => p.poly([[-30, 120], [30, 120], [30, 300], [-30, 300]], "#f48fb1", 0)); for (let i = 0; i < 4; i++) p.stroke([[-10, -300 + i * 90], [8, -260 + i * 90]], 4, "#b38a52"); },
  wineGlass: (p, col = "#f3e6a2", lv = 0.55, cloud = 0, cloudCol = "#c0171a", seed = 1) => {
    const bw = 170, bh = 230, by = -150;
    const bowl = [[bw, by - 150], ...ellPts(0, by, bw, bh, 0, 180, 0, 40), [-bw, by - 150]];
    const top = by - 150 + (1 - lv) * (bh + 150);
    p.clip(bowl, () => { p.poly([[-bw, top], [bw, top], [bw, by + bh + 10], [-bw, by + bh + 10]], col, 0);
      if (cloud > 0) { for (let i = 0; i < 9; i++) { const a = i * 2.39 + seed, d = cloud * 90 * ((i % 3) / 2 + 0.4); p.ell(Math.cos(a) * d, top + 30 + cloud * 100 + Math.sin(a) * d * 0.7, 30 + cloud * 70, 24 + cloud * 60, cloudCol + (cloud > 0.8 ? "" : "cc"), 0); } }
      p.ell(0, top, bw, 16, mixc(col, "#ffffff", 0.35), 4); });
    p.poly(bowl, "#ffffff18", 9); p.stroke([[-bw * 0.62, by - 100], [-bw * 0.7, by + 80]], 14, "#ffffffcc"); p.dot(bw * 0.55, by - 120, 9, "#ffffffcc");
    p.band([[0, by + bh], [0, 330]], "#eef4f7", 14, 5); p.ell(0, 340, 120, 22, "#eef4f7", 7);
  },
  bottle: (p, kind = "fancy", fill = 0.7) => {
    const body = rrect(-95, -120, 95, 360, 40);
    const neck = [[-36, -120], [-36, -300], [36, -300], [36, -120]];
    if (kind === "fancy") {
      p.poly([[-95, -100], [-36, -200], [-36, -330], [36, -330], [36, -200], [95, -100]], "#203a2a", 0);
      p.poly(body, "#1d3b2a", 9); p.poly(neck, "#1d3b2a", 8); p.poly([[-40, -330], [40, -330], [44, -230], [-44, -230]], "#e6b84a", 7);
      p.clip([[-40, -330], [40, -330], [44, -230], [-44, -230]], () => { for (let i = 0; i < 5; i++) p.stroke([[-50, -320 + i * 22], [50, -310 + i * 22]], 4, "#c99a2e"); });
      p.ell(0, -205, 40, 34, "#a61e2b", 6); p.ell(-10, -214, 12, 8, "#d8505c", 0);
      p.poly(rrect(-78, 40, 78, 250, 12), "#f6edd6", 7); p.poly(rrect(-66, 52, 66, 238, 8), null, 4); icon.crest(p, 0, 120, 60); icon.lines(p, 0, 200, 90, 2, 16, "#c9a75a", 6);
      p.stroke([[-70, -60], [-70, 10]], 12, "#ffffff44");
      for (let i = 0; i < 4; i++) icon.sparkle(p, -120 + i * 80, -260 + (i % 2) * 120, 14 + (i % 2) * 8, "#fff6c4");
    } else if (kind === "white") {
      p.poly(rrect(-85, -100, 85, 360, 22), "#cfe3b8", 8); p.poly([[-30, -100], [-30, -280], [30, -280], [30, -100]], "#cfe3b8", 7); p.poly(rrect(-34, -320, 34, -270, 6), "#e8d9b0", 6);
      p.clip(rrect(-85, -100, 85, 360, 22), () => p.poly([[-90, -40], [90, -40], [90, 370], [-90, 370]], "#efe2a0", 0)); p.poly(rrect(-85, -100, 85, 360, 22), null, 8);
      p.poly(rrect(-66, 70, 66, 210, 6), "#ffffff", 5); icon.grape(p, 0, 140, 80, "#9cc25a"); p.stroke([[-60, -40], [-60, 20]], 10, "#ffffff66");
    } else {
      p.poly(rrect(-85, -100, 85, 360, 22), "#7fae5a", 8); p.poly([[-30, -100], [-30, -270], [30, -270], [30, -100]], "#7fae5a", 7); p.poly(rrect(-34, -310, 34, -262, 6), "#b5bcc4", 6);
      for (let i = 0; i < 3; i++) p.stroke([[-34, -298 + i * 14], [34, -298 + i * 14]], 3, "#8a9299");
      p.poly(rrect(-70, 80, 70, 200, 4), "#ffffff", 5); icon.tag(p, 0, 140, 34, "#e04545");
      p.stroke([[-60, -40], [-60, 20]], 10, "#ffffff44");
    }
  },
  pillHalf: (p, k = 0) => { // capsule breaks open, sparkly sugar dust pours out
    const a = k * 0.9, d = k * 70;
    for (const s of [-1, 1]) { p.g.save(); p.g.translate(s * d, -k * 30); p.g.rotate(s * a);
      const pts = s < 0 ? [[-200, -70], [0, -70], [0, 70], [-200, 70]] : [[0, -70], [200, -70], [200, 70], [0, 70]];
      p.clip(pts, () => p.poly(rrect(-200, -70, 200, 70, 70), s < 0 ? "#ffffff" : "#f6f8fb", 9)); p.stroke([[0, -70], [0, 70]], 8); if (k > 0.05) p.ell(0, 0, 10, 62, "#e9edf2", 5);
      p.g.restore(); }
    if (k > 0.15) for (let i = 0; i < 26; i++) { const t = (i * 0.137 + k * 1.3) % 1, x = Math.sin(i * 3.7) * 60 * t, y = 20 + t * 260; icon.sparkle(p, x, y, 6 + (i % 4) * 4, i % 3 ? "#fff6c4" : "#ffd1e3"); }
  },
  hourglass: (p, k = 0.5) => {
    p.poly(rrect(-150, -300, 150, -260, 12), "#8a5a34", 8); p.poly(rrect(-150, 260, 150, 300, 12), "#8a5a34", 8);
    for (const s of [-1, 1]) p.band([[s * 130, -260], [s * 130, 260]], "#a87444", 18, 6);
    const glass = [[-100, -260], [100, -260], [100, -200], [16, -10], [16, 10], [100, 200], [100, 260], [-100, 260], [-100, 200], [-16, 10], [-16, -10], [-100, -200]];
    p.poly(glass, "#e8f6ff88", 0);
    const top = 1 - k; p.clip(glass, () => { p.poly([[-100, -200 + 190 * (1 - top)], [100, -200 + 190 * (1 - top)], [16, -10], [-16, -10]], "#f2c76a", 0); p.poly([[-100, 260], [100, 260], [100, 260 - 180 * k], [0, 260 - 230 * k], [-100, 260 - 180 * k]], "#f2c76a", 0); p.stroke([[0, -10], [0, 255]], 6, "#f2c76a"); });
    p.poly(glass, null, 8); p.stroke([[-70, -230], [-70, -190]], 10, "#ffffffaa");
  },
  clock: (p, t = 0) => { // wall clock: no numbers, only dots + hands
    p.ell(0, 0, 230, 230, "#f4f1ea", 14); p.ell(0, 0, 200, 200, null, 5);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; p.dot(Math.cos(a) * 170, Math.sin(a) * 170, i % 3 ? 9 : 16); }
    const h = t * Math.PI * 2 / 12 - Math.PI / 2, m = t * Math.PI * 2 - Math.PI / 2;
    p.band([[0, 0], [Math.cos(h) * 100, Math.sin(h) * 100]], "#2b2b33", 18, 3, "round"); p.band([[0, 0], [Math.cos(m) * 155, Math.sin(m) * 155]], "#2b2b33", 11, 3, "round"); p.dot(0, 0, 18, "#d23c3c");
  },
  stopwatch: (p, t = 0) => { HELD.stopwatch(p, 0, 0, 10, { t, nohand: 1 }); },
  folder: (p, ic = "tree", long = false) => { p.poly([[-300, -200], [-120, -200], [-90, -240], [300, -240], [300, 220], [-300, 220]], "#e8c26a", 10); p.poly([[-270, -180], [270, -180], [270, 200], [-270, 200]], "#fbfbf6", 6);
    if (ic === "tree") icon.tree(p, -160, -50, 170); else icon.brick(p, -160, -60, 150);
    icon.lines(p, 110, -120, 230, 3, 44, "#b9b9c2", 12);
    const n = long ? 7 : 2; for (let i = 0; i < n; i++) icon.pill(p, -200 + i * 66, 120, 26, i % 2 ? "#ffd1e3" : "#ffffff");
  },
  brochure: (p, kind = "rich") => { HELD.brochure(p, 0, 0, 9, { kind, nohand: 1 }); },
  smileChart: (p, nA = 9, nB = 4, k = 1) => {
    p.poly(rrect(-760, -300, 760, 300, 30), "#ffffff", 10);
    p.poly(rrect(-740, -260, -620, -60, 16), "#1f2d5c", 6); icon.coinStack(p, -680, -130, 34, 3);
    p.poly(rrect(-740, 60, -620, 260, 16), "#f1efe6", 6); icon.tag(p, -680, 160, 40);
    for (let i = 0; i < Math.round(nA * k); i++) icon.smile(p, -540 + i * 140, -160, 54, "#ffd23f");
    for (let i = 0; i < Math.round(nB * k); i++) icon.smile(p, -540 + i * 140, 160, 54, "#ffd23f");
    p.stroke([[-760, 0], [760, 0]], 6, "#d8d8e0");
  },
  priceTag: (p, side = 1) => { const pts = [[-200, -130], [140, -130], [230, 0], [140, 130], [-200, 130]]; p.poly(pts, side > 0 ? "#f2c14e" : "#e04545", 12); p.ell(150, 0, 24, 24, "#fff", 7); p.stroke([[174, 0], [260, -60], [300, -150]], 7, "#7a5434");
    if (side > 0) icon.coinStack(p, -40, 40, 60, 4); else icon.coin(p, -40, 0, 50); },
  gauge: (p, v = 1) => { // v: 1 = red (pain), 0 = green
    p.poly(rrect(-70, -330, 70, 330, 70), "#ffffff", 10);
    const g = p.g, gr = g.createLinearGradient(0, -300, 0, 300); gr.addColorStop(0, "#e53935"); gr.addColorStop(0.5, "#fbc02d"); gr.addColorStop(1, "#43a047");
    p.clip(rrect(-46, -306, 46, 306, 46), () => { g.fillStyle = "#e8e8ee"; g.fillRect(-60, -320, 120, 640); const top = 300 - 600 * v; g.fillStyle = gr; g.fillRect(-60, top, 120, 320 - top); });
    p.poly(rrect(-46, -306, 46, 306, 46), null, 6);
    const y = 300 - 600 * v; p.poly([[80, y], [140, y - 36], [140, y + 36]], "#2b2b33", 6);
    icon.frown(p, 0, -400, 54, "#ff8a7a"); icon.smile(p, 0, 400, 54, "#9be37a");
  },
  wheel: (p, a = 0) => { p.ell(0, 0, 260, 260, null, 0); p.arc(0, 0, 250, 250, 0, 360, 44, "#e74c3c"); p.arc(0, 0, 250, 250, 0, 360, 6); for (let k = 0; k < 3; k++) { const aa = a + k * Math.PI * 2 / 3 + Math.PI / 2; p.band([[0, 0], [Math.cos(aa) * 240, Math.sin(aa) * 240]], "#f1c40f", 30, 6); } p.ell(0, 0, 60, 60, "#3498db", 10); },
  thought: (p, fruit = "raspberry", k = 1) => {
    p.g.save(); p.g.scale(k, k);
    p.ell(-150, 300, 22, 22, "#ffffff", 7); p.ell(-90, 220, 36, 36, "#ffffff", 7);
    const pts = []; for (let i = 0; i < 90; i++) { const t = i / 90 * Math.PI * 2; const b = 1 + 0.09 * Math.abs(Math.sin(t * 4)); pts.push([Math.cos(t) * 230 * b, -40 + Math.sin(t) * 170 * b]); }
    p.poly(pts, "#ffffff", 10);
    if (fruit === "raspberry") { for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 20 + (i % 4) * 22; p.ell(Math.cos(a) * r, -40 + Math.sin(a) * r * 0.9, 30, 30, "#e0306a", 5); } p.poly([[-40, -150], [0, -120], [40, -150], [0, -170]], "#4a9a3a", 5); }
    if (fruit === "cherry") { for (const s of [-1, 1]) { p.stroke(curve([s * 60, 10], [s * 20, -100], [10, -160]), 9, "#4a7a2e"); p.ell(s * 60, 30, 62, 58, "#c8102e", 8); p.ell(s * 60 - 20, 10, 14, 10, "#ff8a9a", 0); } p.ell(30, -160, 50, 22, "#5cae4a", 6); }
    if (fruit === "blackberry") { for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 15 + (i % 4) * 22; p.ell(Math.cos(a) * r * 0.85, -30 + Math.sin(a) * r, 28, 28, "#3b1f4a", 5); p.dot(Math.cos(a) * r * 0.85 - 8, -38 + Math.sin(a) * r, 6, "#8a6aa8"); } p.poly([[-40, -150], [0, -120], [40, -150], [0, -170]], "#4a9a3a", 5); }
    if (fruit === "grape") icon.grape(p, 0, -40, 220);
    p.g.restore();
  },
  cloud: (p, col = "#e53935", k = 1, angry = true, seed = 1) => {
    const pts = []; for (let i = 0; i < 90; i++) { const t = i / 90 * Math.PI * 2; const b = 1 + 0.12 * Math.abs(Math.sin(t * 5 + seed)); pts.push([Math.cos(t) * 260 * b * k, Math.sin(t) * 150 * b * k]); }
    p.poly(pts, col, 10 * Math.max(0.4, k));
    if (angry && k > 0.3) { p.poly([[-40 * k, 120 * k], [10 * k, 40 * k], [-10 * k, 40 * k], [40 * k, -60 * k], [-20 * k, 20 * k], [0, 20 * k]], "#ffe14a", 5); for (const s of [-1, 1]) p.stroke([[s * 120 * k, -40 * k], [s * 60 * k, -10 * k]], 12 * k, "#7a0f12"); }
  },
  steam: (p, t = 0) => { for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1; p.g.save(); p.g.globalAlpha = Math.min(1, (1 - k) * 2); p.ell(Math.sin(k * 6 + i) * 40, 200 - k * 420, 50 + k * 70, 40 + k * 55, "#ffffff", 7); p.g.restore(); } },
  puff: (p, k = 0, col = "#ffffff") => { p.g.save(); p.g.globalAlpha = Math.max(0, 1 - k * k); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 60 + 180 * k; p.ell(Math.cos(a) * r, Math.sin(a) * r * 0.6, 80 + 50 * k, 70 + 40 * k, col, 8); } p.g.restore(); },
  spark: (p, k = 0) => { const s = 1 - Math.abs(k - 0.4) * 1.6; if (s <= 0) return; icon.star(p, 0, 0, 220 * s, "#ffe14a", 10); icon.star(p, 0, 0, 110 * s, "#ffffff", 0); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + k * 2; p.stroke([[Math.cos(a) * 240 * s, Math.sin(a) * 240 * s], [Math.cos(a) * 340 * s, Math.sin(a) * 340 * s]], 16, "#ffb300"); } },
  sparkles: (p, t = 0, n = 7, col = "#fff6c4") => { for (let i = 0; i < n; i++) { const k = (t * 1.3 + i / n) % 1, a = i * 2.4; const s = Math.sin(k * Math.PI); icon.sparkle(p, Math.cos(a) * (120 + 220 * (i % 3) / 2), Math.sin(a) * (120 + 200 * ((i + 1) % 3) / 2) - k * 60, 20 + 40 * s, col); } },
  bird: (p, t = 0, col = "#3d5a80") => { const w = Math.sin(t * Math.PI * 2) * 70; p.ell(0, 0, 90, 60, col, 9); p.ell(70, -40, 46, 42, col, 9); p.dot(84, -48, 8); p.poly([[112, -40], [150, -30], [112, -22]], "#f2a93b", 5); p.poly([[-20, -10], [40, -10], [10, -60 - w]], mul(col, [1.2, 1.2, 1.2]), 7); p.poly([[-90, 0], [-150, -30], [-150, 20]], col, 7); },
  leaf: (p, col = "#4f9a3a") => { p.poly([[0, -120], [80, -10], [0, 120], [-80, -10]], col, 9); p.stroke([[0, -100], [0, 100]], 6); },
  tree: (p, k = 1, seed = 2) => { // time-lapse tree: bare branches -> leafy crown
    p.band([[0, 380], [0, 40]], "#7a5434", 46, 8);
    const br = [[[0, 120], [-160, -60]], [[0, 80], [170, -80]], [[0, 40], [-60, -220]], [[0, 40], [80, -240]], [[-120, -20], [-230, -120]], [[120, -40], [230, -150]]];
    for (const [a, b] of br) p.band([a, b], "#7a5434", 18, 6, "round");
    if (k > 0) { const n = 14; for (let i = 0; i < n; i++) { const a = i * 2.39 + seed, r = 150 * Math.sqrt((i + 0.5) / n); const s = Math.max(0, Math.min(1, k * 1.6 - i / n * 0.6)); if (s > 0) p.ell(Math.cos(a) * r * 1.3, -130 + Math.sin(a) * r, 90 * s, 80 * s, i % 3 ? "#5cae4a" : "#78c25a", 7 * Math.max(0.4, s)); } }
    if (k > 0.85) for (let i = 0; i < 4; i++) p.ell(-120 + i * 80, -140 + (i % 2) * 60, 14, 14, "#ff8aa5", 4);
  },
  panel: (p, lit = -1, press = 0) => { // elevator panel: no digits — round buttons, door icons, keyhole, dot indicators
    p.poly(rrect(-200, -460, 200, 460, 30), "#c9d0d6", 10); p.clip(rrect(-200, -460, 200, 460, 30), () => { for (let i = 0; i < 40; i++) p.stroke([[-210, -460 + i * 24], [210, -456 + i * 24]], 2, "#b6bdc4"); });
    for (let i = 0; i < 8; i++) { const x = (i % 2 ? 70 : -70), y = -330 + Math.floor(i / 2) * 120; p.ell(x, y, 46, 46, "#e3e7eb", 7); p.ell(x, y, 30, 30, i === 5 ? "#ffd24a" : "#f5f7f9", 4); }
    const btn = (x, y, inward, on) => { p.ell(x, y, 52, 52, on ? "#ffd24a" : "#e3e7eb", 8); const s = inward ? 1 : -1;
      p.poly([[x - 36, y - 20], [x - 36 + s * 0 + (inward ? 26 : 0), y], [x - 36, y + 20]].map(([a, b]) => [a, b]), null, 0);
      if (inward) { p.poly([[x - 38, y - 20], [x - 12, y], [x - 38, y + 20]], "#2b2b33", 0); p.poly([[x + 38, y - 20], [x + 12, y], [x + 38, y + 20]], "#2b2b33", 0); }
      else { p.poly([[x - 14, y - 20], [x - 40, y], [x - 14, y + 20]], "#2b2b33", 0); p.poly([[x + 14, y - 20], [x + 40, y], [x + 14, y + 20]], "#2b2b33", 0); }
      p.stroke([[x, y - 24], [x, y + 24]], 7, "#2b2b33"); };
    btn(-80, 200, false, lit === 0); btn(80, 200, true, lit === 1);
    p.ell(0, 340, 34, 34, "#9aa3ad", 6); p.ell(0, 334, 9, 9, "#2b2b33", 0); p.poly([[-5, 334], [5, 334], [8, 362], [-8, 362]], "#2b2b33", 0);
  },
  hand: (p, k = 0) => { // close-up pointing hand (for button punch-ins)
    p.poly([[-420, 180], [-120, 120], [-60, 60], [80, 70], [210, 54], [240, 80], [210, 110], [90, 112], [60, 170], [-10, 220], [-420, 290]], "#ffd6b5", 12);
    p.stroke([[60, 112], [-10, 120]], 6, "#d9a07a"); p.stroke([[-60, 160], [20, 160]], 6, "#d9a07a"); p.poly([[-420, 170], [-200, 140], [-180, 300], [-420, 320]], "#2f4d7a", 10);
  },
  blueprint: (p, kind = "wire", t = 0) => { // white line art for the cutaway
    const W_ = "#eaf6ff", g = p.g; g.save();
    const L = (pts, w = 6) => p.stroke(pts, w, W_);
    if (kind === "wire") {
      L(rrect(-160, -280, 160, 280, 20)); for (let i = 0; i < 3; i++) p.ell(0, -150 + i * 130, 46, 46, null, 0), p.arc(0, -150 + i * 130, 46, 46, 0, 360, 6, W_);
      p.arc(0, 110, 46, 46, 0, 360, 10, "#ffd24a");
      const sw = Math.sin(t * Math.PI * 2) * 0.5; const ex = 0 + Math.sin(sw) * 200, ey = 110 + 60 + Math.cos(sw) * 200;
      L(curve([0, 160], [0 + Math.sin(sw) * 120, 230], [ex, ey]), 8); p.stroke([[ex - 14, ey], [ex - 4, ey + 16], [ex + 6, ey - 6], [ex + 16, ey + 12]], 5, "#ffd24a");
      L([[340, ey - 30], [330, ey + 40]], 8); L(curve([340, ey - 30], [380, -200], [420, -380]), 8); p.stroke([[326, ey + 40], [336, ey + 56], [346, ey + 38], [356, ey + 58]], 5, "#ffd24a");
    } else if (kind === "gears") {
      for (const [x, y, r, dir] of [[-140, 0, 120, 1], [70, -110, 80, -1], [90, 120, 70, -1]]) { const a0 = t * Math.PI * 2 * dir * (120 / r); const pts = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; const rr = r + (Math.floor(i / 4) % 2 ? 18 : 0); pts.push([x + Math.cos(a + a0) * rr, y + Math.sin(a + a0) * rr]); } pts.push(pts[0]); L(pts, 6); p.arc(x, y, r * 0.35, r * 0.35, 0, 360, 6, W_); L([[x + Math.cos(a0) * r * 0.35, y + Math.sin(a0) * r * 0.35], [x + Math.cos(a0) * r * 0.8, y + Math.sin(a0) * r * 0.8]], 5); }
    } else if (kind === "hourglass") { g.globalAlpha = 1; L([[-110, -260], [110, -260], [16, -10], [110, 240], [-110, 240], [-16, -10], [-110, -260]], 7); L([[-140, -270], [140, -270]], 10); L([[-140, 250], [140, 250]], 10); const k = t % 1; p.poly([[-110 + 94 * k, -260 + 250 * k], [110 - 94 * k, -260 + 250 * k], [16, -10], [-16, -10]], "#eaf6ff66", 0); p.poly([[-110, 240], [110, 240], [0, 240 - 200 * k]], "#eaf6ff66", 0); }
    else if (kind === "door") { L(rrect(-300, -320, 300, 320, 10), 7); const o = t; L([[-290 + o * 0, -310], [-10 - o * 200, -310], [-10 - o * 200, 310], [-290, 310]], 6); L([[290, -310], [10 + o * 200, -310], [10 + o * 200, 310], [290, 310]], 6); L([[-150, -360], [150, -360]], 5); L([[-100, -400], [-100, -360]], 4); L([[100, -400], [100, -360]], 4); }
    g.restore();
  },
  buttonBox: (p, cut = 1, press = 0) => { // pedestrian push-button box with a cutaway showing a loose wire
    p.band([[0, 420], [0, 120]], "#6b7480", 46, 8); p.poly(rrect(-140, -260, 140, 140, 24), "#f2c14e", 10);
    p.ell(0, -40, 70 - press * 8, 70 - press * 8, "#c9d0d6", 9); p.ell(0, -40, 40, 40, press > 0.5 ? "#ffffff" : "#e3e7eb", 6); icon.star(p, 0, -170, 34, "#2b2b33");
    if (cut > 0) { p.g.save(); p.g.globalAlpha = cut; p.poly(rrect(-120, 10, 120, 130, 12), "#1f3a5f", 6); p.stroke(curve([-80, 30], [-60, 110], [-20, 90]), 7, "#e74c3c"); p.stroke([[-20, 90], [-10, 102], [0, 86], [10, 100]], 4, "#ffd24a"); p.stroke(curve([80, 30], [70, 100], [50, 120]), 7, "#3498db"); p.g.restore(); }
  },
  taxi: (p) => {},
  meta: (p, t = 0) => { // taster close-up: tongue taped shut, eyes huge and sparkling
    const H = headBlob(5, 300, 0), cx = 0, cy = 0;
    const hp = blobPts(cx, cy, H); p.shadedFill(hp, "#f5c9a0", mul("#f5c9a0", SH_SKIN), rad(-120), H.a); p.inkRing(hp, 16, thickAngle(rad(-120)));
    p.poly(blobPts(cx, cy - 40, { ...H, a: H.a * 1.04, b: H.b * 1.02 }).filter(([x, y]) => y < cy - H.b * 0.35), "#5a3b2a", 0);
    for (const s of [-1, 1]) { const x = cx + s * 110, y = cy - 20; p.ell(x, y, 90, 104, "#ffffff", 12); p.dot(x + 6, y + 10, 52, "#2b1d33"); p.dot(x + 6, y + 10, 28, "#3f6fb5"); p.dot(x - 18, y - 16, 20, "#fff"); icon.sparkle(p, x + 30, y + 34, 16 + 6 * Math.sin(t * 12 + s), "#ffffff"); }
    p.ell(cx, cy + 180, 70, 36, "#7a2440", 10); p.poly(rrect(cx - 46, cy + 170, cx + 46, cy + 280, 40), "#ef7f8f", 10);
    p.g.save(); p.g.translate(cx, cy + 230); p.g.rotate(-0.25); p.poly(rrect(-90, -26, 90, 26, 6), "#f2e3c2", 8); for (let i = 0; i < 5; i++) p.dot(-60 + i * 30, 0, 4, "#d8c39a"); p.g.restore();
    p.g.save(); p.g.translate(cx, cy + 230); p.g.rotate(0.35); p.poly(rrect(-90, -26, 90, 26, 6), "#f2e3c2", 8); p.g.restore();
  },
  arrowDown: (p) => {},
  splat: (p, k = 1, col = "#c0171a") => { for (let i = 0; i < 8; i++) { const a = i * 0.785, r = 120 * k; p.ell(Math.cos(a) * r, Math.sin(a) * r * 0.5, 40 * k, 30 * k, col, 0); } p.ell(0, 0, 150 * k, 90 * k, col, 0); },
  drop: (p, col = "#c0171a") => { p.poly([[0, -120], [60, 20], [50, 70], [0, 100], [-50, 70], [-60, 20]], col, 9); p.ell(-18, 30, 12, 20, "#ffffff88", 0); },
  dropper: (p, sq = 0) => { p.poly(rrect(-36, -300, 36, -150, 30), "#d23c3c", 8); p.poly([[-26, -150], [26, -150], [10, 220], [-10, 220]], "#eef7fbcc", 8); p.clip([[-26, -150], [26, -150], [10, 220], [-10, 220]], () => p.poly([[-30, 60], [30, 60], [30, 230], [-30, 230]], "#c0171a", 0)); },
  bubble: (p, k = 1) => { p.ell(0, 0, 120 * k, 120 * k, "#bfe9ff66", 7); p.ell(-40 * k, -40 * k, 24 * k, 18 * k, "#ffffffcc", 0); },
  scribble: (p, k = 1) => { // grey stress scribble cloud
    const pts = []; for (let i = 0; i < 140; i++) { const t = i / 140 * Math.PI * 8; const r = (140 + 60 * Math.sin(i * 0.7)) * k; pts.push([Math.cos(t) * r * 1.4, Math.sin(t) * r * 0.7]); } p.stroke(pts, 12 * Math.max(0.3, k), "#5b5f6b");
  },
  fountain: (p, t = 0) => { for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22, k = (t * 2 + i * 0.13) % 1; p.stroke(curve([0, 200], [Math.cos(a) * 160, -140], [Math.cos(a) * 320, 200 - 40 * k]), 10, "#bfe9ffcc"); } for (let i = 0; i < 10; i++) { const k = (t * 3 + i * 0.1) % 1; p.ell(Math.sin(i * 2.3) * 300 * k, 200 - Math.sin(k * Math.PI) * 120, 10, 14, "#e9f8ffcc", 0); } },
  leafShadow: (p, t = 0) => { p.g.save(); p.g.globalAlpha = 0.35; for (let i = 0; i < 26; i++) { const x = -700 + (i % 7) * 230 + Math.sin(t * 2 + i) * 40, y = -380 + Math.floor(i / 7) * 220 + Math.cos(t * 1.6 + i * 1.3) * 30; p.ell(x, y, 70 + (i % 3) * 25, 40 + (i % 2) * 20, "#2f5a2a", 0, 0, 360, (i * 37) % 180); } p.g.restore(); },
  sunbeam: (p, a = 0.4) => { p.g.save(); p.g.globalAlpha = a; for (let i = 0; i < 4; i++) p.poly([[-500 + i * 260, -450], [-380 + i * 260, -450], [-100 + i * 300, 450], [-260 + i * 300, 450]], "#fff2b0", 0); p.g.restore(); },

  rollerV: (p, k = 0) => { // vertical giant roller: head centred at origin, frame + handle to the left
    p.stroke([[0, -345], [-150, -345], [-150, -180], [-150, 420]], 30); p.stroke([[0, -345], [-150, -345], [-150, -180], [-150, 420]], 16, "#c7ccd2");
    p.band([[-150, 180], [-150, 420]], "#8a5a34", 40, 8, "round");
    p.poly(rrect(-75, -330, 75, 330, 60), "#f48fb1", 12); p.clip(rrect(-75, -330, 75, 330, 60), () => { for (let i = 0; i < 18; i++) { const y = -330 + ((i * 40 + k * 400) % 720); p.stroke([[-75, y], [75, y + 20]], 6, "#e0709a"); } p.poly([[30, -340], [80, -340], [80, 340], [30, 340]], "#ffffff33", 0); });
    for (let i = 0; i < 3; i++) p.ell(-60 + i * 4, 360 + i * 30, 14, 20, "#f48fb1", 5);
  },
  armwrestle: (p, th = 115, colL = "#e8b48a", colR = "#ecd0b6", slL = "#f39a3c", slR = "#3b5b8a") => {
    const a = th * Math.PI / 180, ex = 210, L = 330, P = [ex + L * Math.cos(a), -L * Math.sin(a)];
    const arm = (e, col, sl, w) => { const m = [e[0] * 0.55 + P[0] * 0.45, e[1] * 0.55 + P[1] * 0.45]; p.band([e, m], sl, w + 6, 8, "round"); p.band([m, P], col, w, 8, "round"); };
    arm([-ex, 0], colL, slL, 78); arm([ex, 0], colR, slR, 36);
    p.ell(P[0], P[1], 62, 54, colL, 9); p.ell(P[0] + 18, P[1] - 18, 40, 36, colR, 8); for (let i = 0; i < 3; i++) p.stroke([[P[0] - 30 + i * 22, P[1] + 10], [P[0] - 26 + i * 22, P[1] + 34]], 5);
    icon.anchor(p, -ex * 0.55, -40, 30, "#2c5a8a");
    for (const e of [[-ex, 0], [ex, 0]]) p.ell(e[0], e[1] + 20, 60, 26, "#00000022", 0);
  },
  jug: (p, tilt = 0, flow = 0) => { p.g.save(); p.g.rotate(-tilt);
    p.poly([[-120, 200], [120, 200], [150, -40], [70, -200], [-70, -200], [-150, -40]], "#d9ecf2cc", 10); p.clip([[-120, 200], [120, 200], [150, -40], [70, -200], [-70, -200], [-150, -40]], () => p.poly([[-200, -20 + tilt * 60], [200, -20 - tilt * 120], [200, 220], [-200, 220]], "#efe2a0", 0));
    p.poly([[-70, -200], [-110, -240], [-60, -230]], "#d9ecf2", 8); p.arc(170, 0, 60, 110, -80, 80, 16); p.stroke([[-90, -120], [-100, 120]], 14, "#ffffffaa"); p.g.restore();
    if (flow > 0) p.stroke([[-200, -170], [-215, -170 + 330 * flow]], 18, "#efe2a0"); },
  paintBucket: (p) => { p.poly([[-170, -150], [170, -150], [140, 200], [-140, 200]], "#f4f5f7", 10); p.ell(0, -150, 170, 40, "#f48fb1", 10); p.ell(-40, -160, 50, 10, "#ffd0de", 0); p.arc(0, -150, 190, 150, 190, 350, 9, "#7f8794"); for (let i = 0; i < 3; i++) p.ell(-120 + i * 110, -100 + (i % 2) * 40, 18, 30, "#f48fb1", 5); },
  pottedTree: (p) => { p.poly([[-130, 120], [130, 120], [100, 360], [-100, 360]], "#c9673f", 10); p.poly(rrect(-150, 90, 150, 140, 14), "#b5562f", 8); p.band([[0, 110], [0, -60]], "#7a5434", 26, 7); for (let i = 0; i < 6; i++) { const a = i * 1.05; p.ell(Math.cos(a) * 90, -170 + Math.sin(a) * 70, 100, 90, i % 2 ? "#5cae4a" : "#78c25a", 8); } p.ell(0, -170, 100, 90, "#78c25a", 8); },
  button: (p, lit = 0) => { p.ell(0, 30, 230, 230, "#9aa3ad", 12); p.ell(0, 0, 230, 230, "#c9d0d6", 12); p.ell(0, 0, 150, 150, lit ? "#ffd24a" : "#f5f7f9", 10); p.poly([[-90, -50], [-30, 0], [-90, 50]], "#2b2b33", 0); p.poly([[90, -50], [30, 0], [90, 50]], "#2b2b33", 0); p.stroke([[0, -60], [0, 60]], 14, "#2b2b33"); },
  spittoon: (p) => { p.poly([[-150, -120], [150, -120], [120, 160], [-120, 160]], "#b8c2cc", 10); p.ell(0, -120, 150, 36, "#6a7480", 10); p.stroke([[-110, -60], [-100, 120]], 12, "#ffffff88"); },
  spray: (p, k = 0) => { for (let i = 0; i < 12; i++) { const a = -0.5 + i * 0.09, d = 60 + k * 300 * (0.6 + (i % 3) * 0.2); p.ell(Math.cos(a) * d, Math.sin(a) * d * 0.6 + k * k * 120, 14 * (1 - k * 0.5), 10 * (1 - k * 0.5), "#b0122a", 3); } },
};
export const prop = (name, ...args) => (p, dw, dh) => { p.g.translate(dw / 2, dh / 2); PROP[name](p, ...args); };
export const brainCard = (o) => (p) => brain(p, o);
export const personCard = (O, o) => (p) => person(p, O, o);
export const signCard = (n) => (p, dw, dh) => { p.g.translate(dw / 2 - 300, dh / 2 - 420); dotSign(p, n); };
