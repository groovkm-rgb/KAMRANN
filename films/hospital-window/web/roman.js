FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, 5.5 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  }
  // skirt / pteruges below the torso
  if (!dress) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.3 * HH], [tcx - 1.0 * T.a, torsoBot + 0.3 * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.armor) for (let i = -3; i <= 3; i++) { const x = tcx + i * 0.27 * T.a, st = [[x - 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot + 0.22 * HH], [x - 9 * u, torsoBot + 0.22 * HH]]; p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u); }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, helmet, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return 975 - 1.38 * HH - 1.08 * HH - H.b; };

// =====================================================================================
// ---------------- Hospital-window cast (original cartoon designs, no real people) ----------------
// All drawing is shapes only: no text, letters or digits anywhere (papers = grey lines).
// =====================================================================================
FACE.sad = { eye: ["lid", "lid"], brow: [-5, 3], mouth: "frown" };
FACE.cry = { eye: ["squeeze", "squeeze"], brow: [-5, 4], mouth: "wave" };
FACE.serene = { eye: ["happy", "happy"], brow: [-1, 0], mouth: "smile" };
FACE.kind = { eye: ["dot", "dot"], brow: [-2, 1], mouth: "smile" };
FACE.glad = { eye: ["happy", "happy"], brow: [-3, -2], mouth: "smileWide" };
FACE.amazed = { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" };
FACE.curious = { eye: ["dot", "dot"], brow: [-4, -6], mouth: "o" };
FACE.focus = { eye: ["dot", "dot"], brow: [3, -1], mouth: "dash" };
FACE.worried = { eye: ["small", "small"], brow: [-4, 3], mouth: "wave" };

const GOWN = "#a9cfe8", NWHITE = "#f7f6f1", SCRUB = "#5fae8e", MUSTARD = "#d8a530";
Object.assign(OUTFITS, {
  patA: { tunic: GOWN, skin: "#ffe0c6", hair: "#d0532a", freckles: true, gown: true, legsBare: true, shoes: "#c9d6e2" },
  patB: { tunic: GOWN, skin: "#ffe0c6", hair: "#6b4428", moustache: "#5a3620", gown: true, legsBare: true, shoes: "#c9d6e2" },
  nurse: { tunic: NWHITE, skin: "#f5c9a0", hair: "#3a2a22", dress: NWHITE, nurseCap: true, bun: true, collar: true, shoes: "#f2f0ea", legCol: "#e9e3d8" },
  surgeon: { tunic: SCRUB, skin: "#ecd0b6", cap: SCRUB, bouffant: true, mask: true, scrubs: true, pants: "#4f9a7c", shoes: "#d8e6df" },
  researcher: { tunic: MUSTARD, skin: "#f3cfae", hair: "#7a6a5a", messy: true, glasses: true, cardigan: true, tie: "#8c2f3a", pants: "#4b4f63", shoes: "#4a3426", rolled: true },
  granny: { tunic: "#b48ac6", skin: "#f3d6bb", hair: "#e6e2dc", bun: true, cardigan: true, shirt: "#f4ead8", pants: "#7c6a8a", shoes: "#6a4a3a" },
  youngman: { tunic: "#3f8f9a", skin: "#c99067", hair: "#231a15", pants: "#34465e", shoes: "#f2f2f2", cast: true },
  nurse2: { tunic: NWHITE, skin: "#c99067", hair: "#1e1714", dress: NWHITE, nurseCap: true, bun: true, collar: true, shoes: "#f2f0ea", legCol: "#d9cdbd" },
});

const clipboard = (p, x, y, s, lines, u) => { // brown board, white sheet, grey lines only
  const w = 34 * u * s, h = 46 * u * s;
  p.poly(rrect(x - w, y - h, x + w, y + h, 4 * u), "#9a6a3e", 2.4 * u);
  p.poly(rrect(x - w * 0.82, y - h * 0.8, x + w * 0.82, y + h * 0.9, 2 * u), "#fbfaf6", 1.4 * u);
  p.poly(rrect(x - w * 0.35, y - h - 4 * u, x + w * 0.35, y - h * 0.78, 2 * u), "#b9bec4", 1.8 * u);
  const n = Math.min(12, lines | 0);
  for (let i = 0; i < n; i++) { const ly = y - h * 0.6 + i * h * 0.12, lw = w * (0.55 + 0.25 * ((i * 37) % 7) / 7); p.stroke([[x - w * 0.62, ly], [x - w * 0.62 + lw * 1.1, ly]], 1.9 * u, "#9aa0a8"); }
};
const glassesOn = (p, cx, hc, u, col = "#2a2026") => {
  for (const s of [-1, 1]) p.poly(rrect(cx + s * 13 * u - 11 * u, hc - 9 * u, cx + s * 13 * u + 11 * u, hc + 9 * u, 4 * u), "#ffffff22", 3.4 * u);
  p.stroke([[cx - 2 * u, hc - 2 * u], [cx + 2 * u, hc - 2 * u]], 3 * u, col);
};
const tearDrops = (p, cx, hc, u, t) => {
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const ph = (t + k * 0.5 + (s > 0 ? 0.25 : 0)) % 1, x = cx + s * 15 * u, y = hc + 8 * u + ph * 34 * u;
    p.poly([[x, y - 6 * u], [x + 4 * u, y + 2 * u], [x, y + 6 * u], [x - 4 * u, y + 2 * u]], "#9fd4ff", 1.4 * u);
  }
};

/** front-facing hospital character. opts: expr, blink, look, facing, seed, L, R (arm poses), tilt, headTilt, bob, step, sit,
 *  lines (clipboard lines), pen (0..1 scribble phase), tears (phase), hug, noGlasses, crutch, chair, lap */
export const hosp = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0,
    bob = 0, light = rad(-120), step = 0, sit = false } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sit ? sole - 0.62 * HH - bob * HH : sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = O.legsBare ? mix(skin, INK, 0.18) : O.legCol || mix(O.pants || O.tunic, INK, 0.45);
  const sleeve = O.dress && !O.cardigan ? mix(O.tunic, "#c8c0b4", 0.5) : mix(O.tunic, INK, 0.35);
  const fore = O.rolled || O.gown || O.scrubs || O.dress ? mix(skin, INK, 0.12) : sleeve;
  p.rot = null;
  // ---- wheelchair behind ----
  if (opts.chair) {
    for (const s of [-1, 1]) {
      const wx = cx + s * 0.62 * W, wy = sole - 0.55 * HH;
      p.ell(wx, wy, 0.16 * W, 0.55 * HH, "#3c3f46", 3.2 * u);
      p.ell(wx, wy, 0.1 * W, 0.44 * HH, null, 2.2 * u);
      p.stroke([[wx, wy - 0.44 * HH], [wx, wy + 0.44 * HH]], 1.6 * u, "#9aa3ad");
      p.band([[cx + s * 0.5 * W, hipY - 0.9 * HH], [cx + s * 0.5 * W, hipY + 0.05 * HH]], "#aeb6bf", 4 * u, 1.4 * u, "round");
    }
    p.poly(rrect(cx - 0.52 * W, hipY - 0.95 * HH, cx + 0.52 * W, hipY - 0.1 * HH, 6 * u), "#4a5a7a", 3 * u); // backrest
  }
  // ---- crutches (behind body) ----
  if (opts.crutch !== undefined) {
    for (const s of [-1, 1]) {
      const sw = Math.sin(Math.PI * 2 * (opts.crutch || 0)) * 10 * u;
      const top = [cx + s * 0.44 * W, chin + 0.14 * HH], bot = [cx + s * 0.62 * W + sw, sole - 2 * u];
      p.band([top, bot], "#c9ced6", 4.2 * u, 1.5 * u, "round");
      p.band([[top[0] - 12 * u, top[1]], [top[0] + 12 * u, top[1]]], "#5a5f68", 6 * u, 1.5 * u, "round");
      p.ell(bot[0], bot[1], 5 * u, 3 * u, "#3a3c40", 1.4 * u);
    }
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = step ? Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 : 0;
    if (sit) {
      const h = [cx + side * 15 * u, hipY], k = [cx + side * 28 * u, hipY + 0.25 * HH], f = [cx + side * 30 * u, sole - 6 * u];
      p.stroke(curve(h, [k[0], k[1] - 0.05 * HH], k), 6.4 * u, legCol); p.stroke(curve(k, [k[0], (k[1] + f[1]) / 2], f), 5.8 * u, legCol);
      p.stroke([[f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 0.5 * u]], 7.5 * u + 3, INK);
      p.stroke([[f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 0.5 * u]], 7.5 * u, O.shoes || "#5a3b2a");
      continue;
    }
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    const lc = O.cast && side > 0 ? "#f4f4f2" : legCol;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), O.cast && side > 0 ? 9 * u : 5.8 * u, lc);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, O.shoes || "#5a3b2a");
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "clip": return { pts: [s, [X(6), s[1] + 0.42 * HH], [tcx + side * 0.2 * T.a, s[1] + 0.42 * HH]], front: true, clip: true };
      case "write": { const k = opts.pen || 0, wx = Math.sin(k * 40) * 8 * u, wy = ((k * 7) % 1) * 30 * u; return { pts: [s, [X(4), s[1] + 0.48 * HH], [tcx - side * 0.05 * T.a + wx, s[1] + 0.3 * HH + wy]], front: true, pen: true }; }
      case "reach": return { pts: [s, [X(34), s[1] - 0.02 * HH], [X(66), s[1] + 0.06 * HH]], front: false };
      case "pat": { const k = Math.sin((opts.pat || 0) * Math.PI * 2) * 4 * u; return { pts: [s, [X(30), s[1] - 0.06 * HH], [X(64), s[1] + 0.1 * HH + k]], front: false }; }
      case "lens": return { pts: [s, [X(14), s[1] + 0.3 * HH], [cx + side * 0.36 * W, chin + 0.18 * HH]], front: true, lens: side };
      case "glassesOff": return { pts: [s, [X(22), s[1] + 0.05 * HH], [X(30), hc + 0.3 * H.b]], front: false, specs: true };
      case "fluff": { const k = Math.sin((opts.pat || 0) * Math.PI * 2) * 6 * u; return { pts: [s, [X(10), s[1] + 0.32 * HH], [tcx + side * 0.6 * T.a, s[1] + 0.58 * HH + k]], front: true }; }
      case "hug": return { pts: [s, [X(2), s[1] + 0.3 * HH], [tcx - side * 0.35 * T.a, s[1] + 0.34 * HH]], front: true };
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "zip": { const k = opts.zip || 0; return { pts: [s, [X(6), s[1] + 0.4 * HH], [tcx + side * (0.9 - 1.6 * k) * T.a, torsoBot + 0.05 * HH]], front: true }; }
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "crutch": return { pts: [s, [X(6), s[1] + 0.3 * HH], [tcx + side * (0.5 * W - 0 * u), s[1] + 0.48 * HH]], front: false };
      case "push": return { pts: [s, [X(10), s[1] + 0.35 * HH], [X(16), s[1] + 0.5 * HH]], front: false };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  let lensAt = null;
  const drawArm = (a) => {
    const [s, m, e] = a.pts, mid = [(s[0] + m[0]) / 2, (s[1] + m[1]) / 2];
    p.stroke(curve(s, mid, m), 5.6 * u, sleeve);
    p.stroke(curve(m, [(m[0] + e[0]) / 2, (m[1] + e[1]) / 2], e), 5.0 * u, fore);
    const [hx, hy] = e;
    if (a.clip) clipboard(p, hx, hy - 6 * u, 1, opts.lines ?? 4, u);
    if (a.lens) lensAt = [hx, hy, a.lens];
    if (a.specs) { for (const s2 of [-1, 1]) p.poly(rrect(hx + s2 * 12 * u - 10 * u, hy - 26 * u, hx + s2 * 12 * u + 10 * u, hy - 10 * u, 4 * u), "#ffffff33", 3 * u); }
    p.dot(hx, hy, 5.4 * u, INK); p.dot(hx, hy, 3.6 * u, mix(skin, INK, 0.08));
    if (a.pen) { p.band([[hx, hy], [hx + 10 * u, hy - 20 * u]], "#3a5fa0", 2.6 * u, 1 * u, "round"); }
  };
  for (const a of arms) if (!a.front) drawArm(a);
  // dress / skirt
  if (dress) {
    const D = { a: 0.5 * W * 0.9, b: 0.5 * ((sole - 0.42 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.3, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.42 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  } else if (O.gown) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.02 * T.a, torsoBot + (sit ? 0.2 : 0.42) * HH], [tcx - 1.02 * T.a, torsoBot + (sit ? 0.2 : 0.42) * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
  } else {
    const pc = O.pants || mix(O.tunic, INK, 0.3);
    const sk = [[tcx - 0.9 * T.a, torsoBot - 0.2 * HH], [tcx + 0.9 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot + 0.12 * HH], [tcx - 0.92 * T.a, torsoBot + 0.12 * HH]];
    p.gradFill(sk, pc, mul(pc, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
  }
  // torso
  const base = O.cardigan && O.shirt ? O.shirt : O.cardigan ? "#f2efe6" : O.tunic;
  p.gradFill(tp, base, mul(base, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.gown) { // little diamond print + neckline
      for (let i = -4; i <= 4; i++) for (let j = 0; j < 6; j++) p.dot(tcx + i * 0.24 * T.a + (j % 2) * 0.12 * T.a, chin + (0.18 + j * 0.16) * HH, 1.6 * u, "#7fa9c8");
      p.stroke([[tcx - 0.28 * T.a, chin + 0.02 * HH], [tcx, chin + 0.22 * HH], [tcx + 0.28 * T.a, chin + 0.02 * HH]], 2.2 * u);
    }
    if (O.cardigan) { // open cardigan panels over shirt
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.18 * T.a, chin - 0.05 * HH], [tcx + s * 1.6 * T.a, chin - 0.05 * HH], [tcx + s * 1.6 * T.a, torsoBot + 0.2 * HH], [tcx + s * 0.3 * T.a, torsoBot + 0.2 * HH]], O.tunic, 2 * u);
      for (let i = 0; i < 4; i++) p.dot(tcx - 0.36 * T.a, chin + (0.28 + i * 0.2) * HH, 2.4 * u, "#7a5a20");
      for (let i = 0; i < 6; i++) p.stroke([[tcx + 0.5 * T.a, chin + (0.15 + i * 0.13) * HH], [tcx + 1.2 * T.a, chin + (0.15 + i * 0.13) * HH]], 1 * u, mul(O.tunic, [0.85, 0.82, 0.8]));
    }
    if (O.tie) { p.poly([[tcx - 6 * u, chin + 0.04 * HH], [tcx + 6 * u, chin + 0.04 * HH], [tcx + 8 * u, chin + 0.55 * HH], [tcx, chin + 0.66 * HH], [tcx - 8 * u, chin + 0.55 * HH]], O.tie, 1.8 * u); p.poly(rrect(tcx - 7 * u, chin - 0.02 * HH, tcx + 7 * u, chin + 0.08 * HH, 2 * u), mul(O.tie, [0.8, 0.8, 0.8]), 1.6 * u); }
    if (O.scrubs) { p.stroke([[tcx - 0.32 * T.a, chin + 0.0 * HH], [tcx, chin + 0.26 * HH], [tcx + 0.32 * T.a, chin + 0.0 * HH]], 2.4 * u); p.poly(rrect(tcx + 0.3 * T.a, chin + 0.32 * HH, tcx + 0.72 * T.a, chin + 0.5 * HH, 2 * u), mul(O.tunic, [0.9, 0.9, 0.9]), 1.5 * u); }
    if (O.collar) { for (const s of [-1, 1]) p.poly([[tcx, chin + 0.08 * HH], [tcx + s * 0.55 * T.a, chin - 0.04 * HH], [tcx + s * 0.42 * T.a, chin + 0.16 * HH]], "#ffffff", 1.6 * u);
      for (let i = 0; i < 3; i++) p.dot(tcx, chin + (0.26 + i * 0.18) * HH, 2.2 * u, "#c9c2b6");
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], "#e8e2d6", 0.05 * HH, 1.2 * u); }
    if (!O.gown && !O.cardigan && !O.scrubs && !O.collar) p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
  });
  p.inkRing(tp, ow, thick);
  if (opts.lap) { const lp = blobPts(cx, torsoBot + 0.05 * HH, { a: 0.62 * W, b: 0.2 * HH, nTop: 2.2, nBot: 2.4, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 5 });
    p.gradFill(lp, opts.lap, mul(opts.lap, SH_CLOTH), light); p.clip(lp, () => { for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 0.14 * W, torsoBot - 0.2 * HH], [cx + i * 0.14 * W, torsoBot + 0.3 * HH]], 3 * u, mul(opts.lap, [0.85, 0.85, 0.85])); }); p.inkRing(lp, ow * 0.8, thick); }
  if (opts.hug) { const pp = blobPts(cx, chin + 0.42 * HH, { a: 0.5 * W, b: 0.3 * HH, nTop: 2.4, nBot: 2.4, egg: 0, asym: 0, rot: rad(-6), noise: 0.012, seed: 8 });
    p.gradFill(pp, "#f4f6f8", "#c8d0da", light); p.stroke([[cx - 0.3 * W, chin + 0.36 * HH], [cx + 0.25 * W, chin + 0.48 * HH]], 1.4 * u, "#c8d0da"); p.inkRing(pp, ow * 0.85, thick); }
  if (opts.bag !== undefined) { // travel bag held in front (zip line closes left to right)
    const by = torsoBot + 0.18 * HH, bp = rrect(cx - 0.5 * W, by - 0.26 * HH, cx + 0.5 * W, by + 0.22 * HH, 10 * u);
    p.gradFill(bp, "#c8643c", "#8e3f24", light); p.inkRing(bp, ow * 0.9, thick);
    const zx = cx - 0.45 * W + 0.9 * W * (opts.bag || 0);
    p.stroke([[cx - 0.45 * W, by - 0.16 * HH], [cx + 0.45 * W, by - 0.16 * HH]], 3 * u, "#6a2c18");
    p.stroke([[cx - 0.45 * W, by - 0.16 * HH], [zx, by - 0.16 * HH]], 3 * u, "#e8c45a");
    p.poly(rrect(zx - 4 * u, by - 0.16 * HH - 2 * u, zx + 4 * u, by - 0.16 * HH + 12 * u, 2 * u), "#e8c45a", 1.4 * u);
    for (const s of [-1, 1]) p.band(curve([cx + s * 0.28 * W, by - 0.25 * HH], [cx + s * 0.18 * W, by - 0.5 * HH], [cx - s * 0.05 * W, by - 0.25 * HH]), "#8e3f24", 4 * u, 1.4 * u);
  }
  for (const a of arms) if (a.front) drawArm(a);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  const hp = blobPts(cx, hc, H);
  if (O.bun) p.ell(cx + (O.nurseCap ? 0 : 0), hc - 1.02 * H.b, 0.36 * H.a, 0.3 * H.b, O.hair, ow * 0.9);
  if (O.hair) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (O.bouffant) { // gathered surgical cap
    const cp = blobPts(cx, hc - 0.55 * H.b, { a: H.a * 1.1, b: H.b * 0.62, nTop: 2.0, nBot: 3.0, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: seed + 3 });
    p.shadedFill(cp, O.cap, mul(O.cap, SH_FELT), light, H.a, 0.35); p.clip(cp, () => { for (let i = -5; i <= 5; i++) p.stroke([[cx + i * 18 * u, hc - 1.15 * H.b], [cx + i * 16 * u, hc - 0.05 * H.b]], 1.2 * u, mul(O.cap, [0.8, 0.8, 0.8])); }); p.inkRing(cp, ow * 0.85, thick);
  } else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  if (O.messy) for (let i = 0; i < 8; i++) { const a = rad(-172 + i * 23.5), r0 = H.a * 0.98, x0 = cx + Math.cos(a) * r0, y0 = hc - 0.08 * H.b + Math.sin(a) * H.b * 0.98;
    p.ell(x0 + Math.cos(a) * 4 * u, y0 + Math.sin(a) * 4 * u, 15 * u, 9 * u, O.hair, 2.2 * u, 0, 360, a * 180 / Math.PI + (i % 2 ? 25 : -25));
    if (i % 3 === 1) p.poly([[x0 - 6 * u, y0], [x0 + Math.cos(a) * 20 * u + 6 * u, y0 + Math.sin(a) * 20 * u], [x0 + 6 * u, y0]], O.hair, 2 * u); }
  if (O.nurseCap) { const cy0 = hc - 0.92 * H.b, cp = [[cx - 0.62 * H.a, cy0 + 0.16 * H.b], [cx - 0.7 * H.a, cy0 - 0.2 * H.b], [cx, cy0 - 0.34 * H.b], [cx + 0.7 * H.a, cy0 - 0.2 * H.b], [cx + 0.62 * H.a, cy0 + 0.16 * H.b]];
    p.gradFill(cp, "#ffffff", "#d8dde2", light); p.inkRing(cp, ow * 0.8, thick); p.stroke([[cx - 0.62 * H.a, cy0 + 0.06 * H.b], [cx + 0.62 * H.a, cy0 + 0.06 * H.b]], 3.2 * u, "#7fb1d6"); }
  if (O.freckles) { const r = (k) => ((Math.sin(k * 91.7) + 1) / 2); for (const s of [-1, 1]) for (let k = 0; k < 5; k++) p.dot(cx + s * (22 + r(k + s) * 14) * u, hc + (8 + r(k * 3 + s) * 9) * u, 1.6 * u, "#c9774a"); }
  const mouthHidden = !!O.mask;
  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, mouthHidden ? null : O.moustache, false);
  if (O.mask) { const mp = rrect(cx - 0.72 * H.a, hc + 0.12 * H.b, cx + 0.72 * H.a, hc + 0.78 * H.b, 14 * u);
    p.gradFill(mp, "#bfe3d4", "#8fc2ae", light); for (let i = 1; i <= 3; i++) p.stroke([[cx - 0.62 * H.a, hc + (0.12 + i * 0.16) * H.b], [cx + 0.62 * H.a, hc + (0.12 + i * 0.16) * H.b]], 1.4 * u, "#7fae9a");
    p.inkRing(mp, ow * 0.8, thick); for (const s of [-1, 1]) p.stroke([[cx + s * 0.72 * H.a, hc + 0.22 * H.b], [cx + s * 0.98 * H.a, hc - 0.05 * H.b]], 1.6 * u, "#e8f4ee"); }
  if (O.glasses && !opts.noGlasses) glassesOn(p, cx + 7 * u * facing, hc, u);
  if (lensAt) { // magnifier held in front of one eye: handle from the hand, big magnified eye inside the glass
    const [hx, hy, sd] = lensAt, lx = cx + 7 * u * facing + sd * 13 * u, ly = hc + 2 * u, R0 = 24 * u;
    p.rot = null; p.band([[hx, hy], [lx + sd * 0.5 * R0, ly + 0.9 * R0]], "#6a4a32", 5 * u, 1.6 * u, "round");
    p.ell(lx, ly, R0, R0, "#eaf6ffd0", 4 * u); p.ell(lx, ly, 13 * u, 15 * u, "#ffffff", 2.4 * u); p.ell(lx + (look || 0) * 4 * u, ly + 2 * u, 6.5 * u, 8 * u, INK, 0);
    p.stroke(ellPts(lx - 6 * u, ly - 8 * u, 14 * u, 14 * u, 200, 270, 0, 10), 3 * u, "#ffffff"); p.dot(hx, hy, 5.4 * u, INK); p.dot(hx, hy, 3.6 * u, mix(skin, INK, 0.08)); }
  if (opts.tears !== undefined) tearDrops(p, cx + 7 * u * facing, hc, u, opts.tears);
  if (opts.blush) for (const s of [-1, 1]) p.ell(cx + s * 30 * u, hc + 14 * u, 9 * u, 5 * u, "#f29a8a88", 0);
  p.rot = null;
};

/** patient lying on a stretcher, seen from the foot end (blanket mound in front, head on pillow behind) */
export const lying = (p, key, opts = {}) => {
  const O = OUTFITS[key], { expr = "dazed", blink = 0, seed = 3, light = rad(-120) } = opts, skin = O.skin;
  const H = headBlob(seed, 118, 0), u = 2 * H.a / 100, thick = thickAngle(light), ow = 5 * u, cx = 300, hc = 690;
  p.ell(cx, hc + 40 * u, 1.3 * H.a, 0.55 * H.b, "#ffffff", ow * 0.8); // pillow
  const hb = blobPts(cx, hc - 0.03 * 2 * H.b, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0);
  const hp = blobPts(cx, hc, H); p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a); p.inkRing(hp, ow, thick);
  hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, 0, false);
  if (O.freckles) for (const s of [-1, 1]) for (let k = 0; k < 4; k++) p.dot(cx + s * (22 + k * 4) * u, hc + (10 + (k % 2) * 6) * u, 1.6 * u, "#c9774a");
  faceFront(p, cx, hc, 2 * H.a, expr, 0, 0, lidOf(blink), false, skin, O.moustache, false);
  const bl = blobPts(cx, 900, { a: 1.35 * H.a, b: 0.5 * H.b, nTop: 2.0, nBot: 3.2, egg: 0, asym: 0, rot: 0, noise: 0.012, seed: 4 });
  p.gradFill(bl, "#eef2f4", "#b9c6d0", light); p.clip(bl, () => { p.band([[cx - 2 * H.a, 870], [cx + 2 * H.a, 870]], "#a9cfe8", 14 * u, 0); }); p.inkRing(bl, ow, thick);
};

/** POV hands holding a phone (screen = blank glow, no icons) */
export const phoneHands = (p, opts = {}) => {
  const glow = opts.glow ?? 1, skin = "#f3cfae", sl = "#6d7fa6";
  for (const s of [-1, 1]) p.poly([[300 + s * 120, 1000], [300 + s * 300, 1000], [300 + s * 240, 760], [300 + s * 150, 720]], sl, 10);
  p.poly(rrect(170, 300, 430, 820, 40), "#26252c", 10);
  const g = p.g, gr = g.createLinearGradient(0, 330, 0, 790); gr.addColorStop(0, `rgba(236,246,255,${0.7 + 0.3 * glow})`); gr.addColorStop(1, `rgba(170,205,240,${0.6 + 0.3 * glow})`);
  p.path(rrect(190, 330, 410, 790, 26), true); g.fillStyle = gr; g.fill();
  p.ell(300, 312, 16, 5, "#111", 0);
  for (const s of [-1, 1]) {
    p.poly([[300 + s * 120, 820], [300 + s * 150, 560], [300 + s * 135, 480], [300 + s * 165, 470], [300 + s * 205, 600], [300 + s * 215, 820]], skin, 9);
    p.poly([[300 + s * 132, 600], [300 + s * 102, 520], [300 + s * 92, 470], [300 + s * 115, 462], [300 + s * 150, 540]], skin, 8); // thumb
    for (let k = 0; k < 3; k++) p.ell(300 + s * 128, 420 + k * 70, 22, 30, skin, 7); // fingers wrapping the edge
  }
};
export const fxBird = (p, ph, col = "#e9573f") => {
  const fl = Math.sin(ph * Math.PI * 2);
  p.poly([[230, 520], [380, 470], [420, 560], [300, 620]], col, 12);
  p.ell(400, 470, 55, 52, col, 12); p.dot(415, 460, 9); p.poly([[450, 470], [490, 482], [450, 492]], "#f2b43a", 6);
  p.poly([[300, 530], [250 - fl * 10, 420 - fl * 90], [360, 520]], mul(col, [0.8, 0.8, 0.8]), 10);
  p.poly([[230, 540], [150, 520], [170, 580]], col, 10);
};
export const fxPaper = (p, k = 0) => { p.poly([[160, 300], [440, 300], [440, 700], [160, 700]], "#fbfaf4", 10); for (let i = 0; i < 7; i++) p.stroke([[200, 360 + i * 46], [380 - (i % 3) * 30, 360 + i * 46]], 9, "#a3a8ae"); };
export const fxMote = (p, a = 1) => { const g = p.g, gr = g.createRadialGradient(300, 500, 0, 300, 500, 120); gr.addColorStop(0, `rgba(255,244,214,${0.9 * a})`); gr.addColorStop(1, "rgba(255,244,214,0)"); g.fillStyle = gr; g.beginPath(); g.arc(300, 500, 120, 0, 7); g.fill(); };
export const fxGlow = (p, col = "255,246,220", a = 1) => { const g = p.g, gr = g.createRadialGradient(300, 500, 0, 300, 500, 300); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.4, `rgba(${col},${0.35 * a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 200, 600, 600); };
export const fxDrop = (p) => p.poly([[300, 380], [345, 520], [300, 580], [255, 520]], "#bcd0de", 10);
export const fxSpray = (p, t) => { for (let i = 0; i < 18; i++) { const k = (t + i / 18) % 1, a = (i / 18 - 0.5) * 2.2, x = 300 + Math.sin(a) * 260 * k, y = 860 - 640 * k + 700 * k * k; p.ell(x, y, 16 * (1 - k * 0.5), 22 * (1 - k * 0.5), "#d7f0ff", 5); } };
