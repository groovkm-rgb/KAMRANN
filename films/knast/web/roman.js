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
// ---------------- "Knast" cast (prison short): our own designs on the Pen / face helpers ----------------
// =====================================================================================
FACE.wink = { eye: ["happy", "dot"], brow: [-3, -4], mouth: "grin" };
FACE.smug = { eye: ["lid", "lid"], brow: [-2, -5], mouth: "smirk" };
FACE.sleepy = { eye: ["slit", "slit"], brow: [1, 2], mouth: "dash" };
FACE.yawn = { eye: ["squeeze", "squeeze"], brow: [-3, -3], mouth: "none" };
FACE.sigh = { eye: ["lid", "lid"], brow: [-4, 4], mouth: "frown" };
FACE.sighO = { eye: ["slit", "slit"], brow: [-4, 4], mouth: "o" };
FACE.joy = { eye: ["happy", "happy"], brow: [-5, -6], mouth: "laugh" };
FACE.hold = { eye: ["small", "small"], brow: [-6, -6], mouth: "none" };
FACE.sweat = { eye: ["small", "small"], brow: [-4, 3], mouth: "wave" };
FACE.deadpan = { eye: ["lid", "lid"], brow: [-5, -7], mouth: "dash" };
FACE.focus = { eye: ["dot", "dot"], brow: [4, -1], mouth: "teeth" };
FACE.angry = { eye: ["lid", "lid"], brow: [6, -3], mouth: "teeth" };
FACE.sneaky = { eye: ["dot", "dot"], brow: [3, -2], mouth: "smirk" };
FACE.awe = { eye: ["dot", "dot"], brow: [-4, -5], mouth: "smileWide" };
FACE.push = { eye: ["squeeze", "squeeze"], brow: [5, -2], mouth: "teeth" };

const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const STRIPE_W = "#f4f1e8", STRIPE_B = "#26222a";
export const CAST = {
  con: { kind: "con", skin: SKIN, hair: "#4a3022", hairStyle: "messy", a: 132, shoes: "#2b2626" },
  con2: { kind: "con", skin: "#c99067", hairStyle: "bald", a: 124, stout: true, shoes: "#2b2626", stubble: true },
  con3: { kind: "con", skin: "#f5c9a0", hair: "#d0562a", hairStyle: "messy", a: 120, shoes: "#2b2626", freckles: true },
  guard: { kind: "uniform", jacket: "#2f5240", pants: "#263c30", skin: "#f3d0b0", cap: "#2a4636", capBand: "#1b2a22", badge: "#d9b44a", keys: true, moustache: "#5a3a26", a: 124, stout: true, shoes: "#1d1a1a", hair: "#5a3a26" },
  police: { kind: "uniform", jacket: "#1f3263", pants: "#1a2747", skin: "#f5c9a0", cap: "#1d2d58", capBand: "#111a33", badge: "#e9ecf2", star: true, a: 124, shoes: "#141414", hair: "#3a2a20", shirt: "#b9d3ef" },
  judge: { kind: "robe", skin: "#f2d2b6", hair: "#c9c6c2", hairStyle: "side", a: 126, glasses: true, shoes: "#141414" },
  kumpel: { kind: "leather", jacket: "#3a2620", pants: "#3d5a8a", skin: "#e8b48c", hair: "#16110f", hairStyle: "quiff", a: 124, shades: true, shoes: "#1a1414", stubble: true },
  disguise: { kind: "uniform", jacket: "#2f5240", pants: "#263c30", skin: SKIN, cap: "#2a4636", capBand: "#1b2a22", badge: "#d9b44a", a: 132, baggy: true, shoes: "#1d1a1a", hair: "#4a3022", hairStyle: "messy" },
};

const stripeLine = (p, pts, w, u, gap) => { // a striped limb: white with black bands across
  p.ol = 2.4 * u; p.line(pts, STRIPE_W, w); p.ol = 12;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l, ny = (x1 - x0) / l;
    const steps = Math.ceil(l / 2);
    for (let k = 0; k < steps; k++) {
      const t = k / steps, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; acc += l / steps;
      if (Math.floor(acc / gap) % 2 === 1) p.stroke([[x - nx * w * 0.47, y - ny * w * 0.47], [x + nx * w * 0.47, y + ny * w * 0.47]], l / steps + 0.6, STRIPE_B);
    }
  }
};
const limb = (p, O, pts, w, col, u, gap) => { if (O.kind === "con") stripeLine(p, pts, w, u, gap); else { p.ol = 2.4 * u; p.line(pts, col, w); p.ol = 12; } };

/** messy / quiff / side hair over the top of the head */
const hairTop = (p, O, H, cx, hc, light, thick, ow, u, seed) => {
  const st = O.hairStyle, col = O.hair;
  if (st === "messy") {
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const a = Math.PI + Math.PI * i / 26, sp = i % 2 ? 1.0 : 1.2 + 0.1 * Math.sin(i * 2.7 + seed);
      const r = i === 0 || i === 26 ? 1.02 : sp;
      pts.push([cx + Math.cos(a) * H.a * 1.04 * r, hc - 0.1 * H.b + Math.sin(a) * H.b * 1.02 * r]);
    }
    // fringe: zig-zag back across the forehead
    const fy = hc - 0.38 * H.b;
    for (let i = 0; i <= 8; i++) { const x = cx + H.a * 1.0 - (2 * H.a * 1.0) * i / 8; pts.push([x, fy + (i % 2 ? 0.2 : -0.04) * H.b + (i === 0 || i === 8 ? 0.35 * H.b : 0)]); }
    p.shadedFill(pts, col, mul(col, [0.6, 0.6, 0.7]), light, H.a, 0.4);
    p.clip(pts, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 22 * u, hc - 0.95 * H.b], [cx + i * 26 * u + 8 * u, hc - 0.45 * H.b]], 2.2 * u, mul(col, [0.55, 0.55, 0.6])); });
    p.inkRing(pts, ow * 0.85, thick);
    // a cowlick sticking up
    p.poly([[cx - 6 * u, hc - 1.08 * H.b], [cx - 2 * u, hc - 1.42 * H.b], [cx + 10 * u, hc - 1.36 * H.b], [cx + 6 * u, hc - 1.06 * H.b]], col, 2.2 * u);
  } else if (st === "quiff") {
    const pts = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI + Math.PI * i / 20; pts.push([cx + Math.cos(a) * H.a * 1.03, hc - 0.12 * H.b + Math.sin(a) * H.b * 1.0]); }
    pts.push([cx + H.a * 0.95, hc - 0.35 * H.b], [cx + 0.2 * H.a, hc - 0.55 * H.b], [cx - H.a * 0.95, hc - 0.35 * H.b]);
    p.shadedFill(pts, col, "#000000", light, H.a, 0.4); p.inkRing(pts, ow * 0.85, thick);
    const q = [...ellPts(cx + 0.05 * H.a, hc - 1.0 * H.b, 0.78 * H.a, 0.36 * H.b, 160, 380, -8, 20), [cx + 0.3 * H.a, hc - 0.78 * H.b]];
    p.poly(q, col, ow * 0.8); p.stroke([[cx - 0.2 * H.a, hc - 1.25 * H.b], [cx + 0.6 * H.a, hc - 1.2 * H.b]], 3 * u, "#4a4250");
  } else if (st === "side") { // receding grey hair: side tufts, shiny top
    for (const s of [-1, 1]) { const tp_ = [[cx + s * 0.98 * H.a, hc - 0.55 * H.b], [cx + s * 1.1 * H.a, hc - 0.3 * H.b], [cx + s * 1.06 * H.a, hc + 0.05 * H.b], [cx + s * 0.9 * H.a, hc - 0.1 * H.b], [cx + s * 0.86 * H.a, hc - 0.45 * H.b]]; p.poly(tp_, col, 2.6 * u); }
    p.stroke(ellPts(cx - 0.3 * H.a, hc - 0.72 * H.b, 0.25 * H.a, 0.12 * H.b, 200, 320, 0, 12), 5 * u, "#ffffff88");
  } else if (st === "bald") {
    p.stroke(ellPts(cx - 0.3 * H.a, hc - 0.72 * H.b, 0.25 * H.a, 0.12 * H.b, 200, 320, 0, 12), 5 * u, "#ffffff77");
  }
};
/** peaked uniform cap (Schirmmuetze). big = oversized and slipping over the eyes */
const peakCap = (p, O, H, cx, hc, light, thick, ow, u, facing, big = 0) => {
  const S = 1 + 0.32 * big, bandY = hc - H.b * (0.5 - 0.42 * big), top = bandY - H.b * 0.62 * S, wb = H.a * 0.98 * S, wt = H.a * 1.2 * S;
  const crown = [[cx - wb, bandY], [cx - wt, top + 0.18 * H.b * S], ...ellPts(cx, top + 0.18 * H.b * S, wt, 0.3 * H.b * S, 180, 360, 0, 24), [cx + wt, top + 0.18 * H.b * S], [cx + wb, bandY]];
  p.shadedFill(crown, O.cap, mul(O.cap, [0.6, 0.62, 0.7]), light, wt, 0.4); p.inkRing(crown, ow * 0.9, thick);
  p.stroke(ellPts(cx - 0.35 * wt, top + 0.12 * H.b, 0.3 * wt, 0.08 * H.b, 200, 320, 0, 12), 4 * u, "#ffffff40");
  const band = [[cx - wb, bandY - 0.17 * H.b * S], [cx + wb, bandY - 0.17 * H.b * S], [cx + wb, bandY + 0.04 * H.b], [cx - wb, bandY + 0.04 * H.b]];
  p.poly(band, O.capBand, ow * 0.7);
  const vx = cx + facing * 8 * u, vis = ellPts(vx, bandY + 0.02 * H.b, wb * 0.92, 0.2 * H.b * S, 0, 180, 0, 24);
  p.shadedFill(vis, "#141416", "#000000", light, wb, 0.3); p.poly(vis, null, ow * 0.8);
  p.stroke(ellPts(vx, bandY + 0.04 * H.b, wb * 0.6, 0.08 * H.b * S, 20, 160, 0, 12), 2.5 * u, "#ffffff55");
  // badge
  const bx = cx + facing * 4 * u, by = bandY - 0.32 * H.b * S;
  if (O.star) { const pts = []; for (let k = 0; k < 10; k++) { const r = (k % 2 ? 6 : 14) * u * S, a = rad(k * 36 - 90); pts.push([bx + r * Math.cos(a), by + r * Math.sin(a)]); } p.poly(pts, O.badge, 1.8 * u); p.dot(bx, by, 3.5 * u, "#3b7a4a"); }
  else { p.ell(bx, by, 10 * u * S, 8 * u * S, O.badge, 1.8 * u); p.ell(bx, by, 4 * u * S, 3 * u * S, mul(O.badge, [0.7, 0.6, 0.4]), 0); }
};
const shades = (p, cx, hc, u, facing) => {
  const fx = cx + 7 * u * facing;
  for (const s of [-1, 1]) { const x = fx + s * 14 * u, L = rrect(x - 12 * u, hc - 8 * u, x + 12 * u, hc + 8 * u, 5 * u); p.poly(L, "#141018", 2.6 * u); p.stroke([[x - 7 * u, hc - 4 * u], [x - 2 * u, hc - 4 * u]], 2.4 * u, "#9ad0ff"); }
  p.stroke([[fx - 3 * u, hc - 4 * u], [fx + 3 * u, hc - 4 * u]], 3 * u);
  p.stroke([[fx - 26 * u, hc - 4 * u], [cx - 48 * u, hc - 8 * u]], 3 * u); p.stroke([[fx + 26 * u, hc - 4 * u], [cx + 48 * u, hc - 8 * u]], 3 * u);
};
const specs = (p, cx, hc, u, facing) => {
  const fx = cx + 7 * u * facing;
  for (const s of [-1, 1]) { const x = fx + s * 13 * u; p.ell(x, hc + u, 11 * u, 10 * u, "#ffffff22", 2.6 * u); p.stroke(ellPts(x - 3 * u, hc - 3 * u, 5 * u, 4 * u, 200, 280, 0, 8), 2 * u, "#ffffffcc"); }
  p.stroke([[fx - 2 * u, hc - u], [fx + 2 * u, hc - u]], 2.6 * u);
  p.stroke([[fx - 24 * u, hc - 2 * u], [cx - 47 * u, hc - 6 * u]], 2.6 * u); p.stroke([[fx + 24 * u, hc - 2 * u], [cx + 47 * u, hc - 6 * u]], 2.6 * u);
};
const keyRing = (p, x, y, u, sw = 0) => {
  p.ell(x, y, 9 * u, 9 * u, null, 2.6 * u); p.ell(x, y, 9 * u, 9 * u, null, 1.2 * u);
  for (let k = 0; k < 4; k++) {
    const a = rad(70 + k * 22 + 18 * Math.sin(sw + k)), x0 = x + Math.cos(a) * 9 * u, y0 = y + Math.sin(a) * 9 * u, x1 = x0 + Math.cos(a) * 18 * u, y1 = y0 + Math.sin(a) * 18 * u;
    p.band([[x0, y0], [x1, y1]], "#e3c05a", 3.2 * u, 1 * u, "round");
    p.ell(x0, y0, 4.5 * u, 4.5 * u, "#e3c05a", 1.6 * u);
    p.stroke([[x1, y1], [x1 + Math.cos(a + 1.57) * 4 * u, y1 + Math.sin(a + 1.57) * 4 * u]], 2.2 * u, "#e3c05a");
  }
};
const sawProp = (p, hx, hy, u, ang) => { // hacksaw held at the hand, blade along ang
  const c = Math.cos(ang), s = Math.sin(ang), L = 120 * u, P = (d, o) => [hx + c * d - s * o, hy + s * d + c * o];
  p.poly([P(-6 * u, -8 * u), P(14 * u, -8 * u), P(14 * u, 8 * u), P(-6 * u, 8 * u)], "#8a5a34", 2 * u);
  p.stroke([P(10 * u, 0), P(10 * u, -26 * u), P(L, -26 * u), P(L, 0)], 4 * u, "#3c5ea8");
  const blade = [P(10 * u, -2 * u), P(L, -2 * u), P(L, 4 * u), P(10 * u, 4 * u)]; p.poly(blade, "#d8dde3", 1.6 * u);
  for (let d = 14; d < 118; d += 6) p.stroke([P(d * u, 4 * u), P((d + 3) * u, 7 * u), P((d + 6) * u, 4 * u)], 1.2 * u, "#5a6068");
};

/** front-facing prison cast. opts: expr, blink, look, facing, seed, L/R arm poses, legs, step, tilt, headTilt, bob, sweat, blush, wv, saw, light */
export const castFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? CAST[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", legs = "stand", step = 0, tilt = 0, headTilt = 0,
    bob = 0, light = rad(-120), sweat = 0, swing = 0, sawA = 0, capBig = O.baggy ? 1 : 0, capLift = 0, puff = 0, cuffs = false } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, O.a || 124, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.kind === "robe" ? 1.15 : 1.0, legsL = O.kind === "robe" ? 1.15 : 1.12, sit = legs === "sit";
  const sole = 975, lift = legs === "tiptoe" ? 0.06 * HH : 0;
  const torsoBot = (sit ? sole - 0.55 * HH : sole - legsL * HH - lift) - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const jacket = O.kind === "con" ? STRIPE_W : O.jacket || "#1c1b22", pants = O.kind === "con" ? STRIPE_W : O.pants || "#1c1b22";
  const sleeve = O.kind === "robe" ? "#1d1c24" : jacket;
  const gap = 9 * u, baggy = !!O.baggy;
  p.rot = null;
  // ---- robe back ----
  if (O.kind === "robe") {
    const D = { a: 0.5 * W * 0.92, b: 0.5 * ((sole - 0.08 * HH) - (chin - 0.12 * HH)), nTop: 2.2, nBot: 4.0, egg: 0.32, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const rb = blobPts(cx, sole - 0.08 * HH - D.b, D);
    p.gradFill(rb, "#2b2a35", "#0e0e14", light); p.inkRing(rb, ow, thick);
    p.clip(rb, () => { for (const s of [-1, 1]) p.poly([[cx + s * 0.16 * W, chin], [cx + s * 0.3 * W, chin], [cx + s * 0.36 * W, sole], [cx + s * 0.2 * W, sole]], "#3d3c4a", 1.4 * u); for (let i = -2; i <= 2; i++) p.stroke([[cx + i * 0.12 * W, torsoBot], [cx + i * 0.16 * W, sole]], 1.6 * u, "#00000055"); });
  }
  // ---- legs ----
  const legW = (baggy ? 9 : 7) * u;
  for (const side of [-1, 1]) {
    const ph = Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)), up = step ? Math.max(0, Math.sin(ph)) * (legs === "run" ? 0.3 : legs === "tiptoe" ? 0.22 : 0.12) * HH : 0;
    const swingX = legs === "run" && step ? Math.cos(ph) * 10 * u : 0;
    const hx = cx + side * 15 * u;
    let pts, fx, fy;
    if (sit) { fx = cx + side * 30 * u; fy = sole - 4 * u; pts = [[hx, hipY], [cx + side * 26 * u, hipY + 0.12 * HH], [fx, fy]]; }
    else if (legs === "tuck") { fx = cx + side * 26 * u; fy = torsoBot + 0.5 * HH; pts = [[hx, hipY], [cx + side * 40 * u, torsoBot + 0.35 * HH], [fx, fy]]; }
    else if (legs === "squat") { fx = cx + side * 38 * u; fy = sole - 4 * u; pts = [[hx, hipY], [cx + side * 46 * u, hipY + 0.45 * HH], [fx, fy]]; }
    else if (legs === "climb") { const k = Math.sin(ph); fx = cx + side * 24 * u; fy = sole - 4 * u - Math.max(0, k) * 0.45 * HH; pts = [[hx, hipY], [cx + side * 34 * u, (hipY + fy) / 2], [fx, fy]]; }
    else { fx = cx + side * (legs === "wide" ? 30 : 20) * u + swingX; fy = sole - 4 * u - up - (legs === "tiptoe" ? 0 : 0); pts = [[hx, hipY], [(hx + fx) / 2 + side * (up ? 8 : 2) * u, (hipY + fy) / 2 - up * 0.2], [fx, fy]]; }
    if (O.kind !== "robe") limb(p, O, curve(pts[0], pts[1], pts[2]), legW, pants, u, gap);
    // shoe
    const toe = legs === "tiptoe" ? [[fx - side * 2 * u, fy + 2 * u], [fx + side * 6 * u, fy + 9 * u]] : [[fx - side * 4 * u, fy + 2 * u], [fx + side * 13 * u, fy + 2.5 * u]];
    p.stroke(toe, 9 * u + 3, INK); p.stroke(toe, 9 * u, O.shoes || "#222");
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.42 * W) / 1.06 * (O.stout ? 1.14 : 1) * (baggy ? 1.22 : 1), b: 0.5 * (torsoBot - (chin - 0.22 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.1, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.82 * T.a, chin + 0.14 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.05 + k * u);
    switch (pose) {
      case "up": return { pts: [s, [X(24), s[1] - 0.42 * HH], [X(30), hc - 0.85 * HH]] };
      case "upbent": return { pts: [s, [X(34), s[1] - 0.08 * HH], [X(26), hc - 0.55 * HH]] };
      case "shrug": return { pts: [s, [X(22), s[1] + 0.32 * HH], [X(46), s[1] + 0.02 * HH]], palm: true };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], finger: [1, -0.15] };
      case "finger": return { pts: [s, [X(26), s[1] + 0.12 * HH], [X(20), hc - 0.15 * HH]], finger: [0, -1] };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]] };
      case "head": return { pts: [s, [X(30), hc - 0.2 * HH], [cx + side * 0.5 * H.a, hc - 0.55 * H.b]], behind: true };
      case "mouth": return { pts: [s, [X(6), s[1] + 0.32 * HH], [cx + side * 6 * u + facing * 8 * u, hc + 0.55 * H.b]], front: true };
      case "cuffs": return { pts: [s, [X(2), s[1] + 0.4 * HH], [tcx + side * 9 * u, torsoBot - 0.05 * HH]], front: true, cuff: true };
      case "behind": return { pts: [s, [X(2), s[1] + 0.36 * HH], [tcx + side * 0.5 * T.a, torsoBot - 0.05 * HH]], behind: true, nohand: true };
      case "wheel": return { pts: [s, [X(10), s[1] + 0.3 * HH], [tcx + side * 0.55 * T.a, s[1] + 0.32 * HH]], front: true };
      case "push": return { pts: [s, [X(26), s[1] - 0.05 * HH], [X(18), s[1] - 0.32 * HH]], palm: true };
      case "reach": return { pts: [s, [X(16), s[1] - 0.4 * HH], [X(8), hc - 0.9 * HH]] };
      case "sneak": return { pts: [s, [X(30), s[1] + 0.06 * HH], [X(12), s[1] - 0.1 * HH]], droop: true };
      case "tight": return { pts: [s, [X(-2), s[1] + 0.38 * HH], [X(-6), chin + 0.95 * HH]], front: false };
      case "salute": return side < 0 ? { pts: [s, [X(28), s[1] - 0.12 * HH], [cx - 0.55 * H.a, hc - 0.5 * H.b]], front: true } : arm(side, "hang");
      case "saw": { const sw = (opts.sawX || 0) * u; return { pts: [s, [X(14 + sw * 0.3 / u), s[1] + 0.2 * HH], [X(30) + side * sw, s[1] - 0.05 * HH]], saw: true }; }
      case "run": { const k = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5))); return { pts: [s, [X(14), s[1] + 0.2 * HH + k * 0.06 * HH], [X(14 + 14 * k), s[1] + 0.05 * HH - k * 0.28 * HH]] }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: true };
      case "flail": { const k = Math.sin((opts.wv || 0) + side); return { pts: [s, [X(26), s[1] - 0.2 * HH], [X(40 + 10 * k), hc - (0.4 + 0.2 * k) * HH]] }; }
      default: return { pts: [s, [X(baggy ? 6 : 4), s[1] + 0.46 * HH], [X(baggy ? 6 : 3), chin + 1.0 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const armW = (O.kind === "robe" ? 9 : baggy ? 9.5 : 6.2) * u;
  const drawArm = (a, side) => {
    const pts = curve(a.pts[0], a.pts[1], a.pts[2]);
    limb(p, O, pts, armW, sleeve, u, gap);
    const [hx, hy] = a.pts[2];
    if (baggy && !a.saw) { p.ell(hx, hy, 7 * u, 6 * u, sleeve, 2 * u); return; } // sleeves swallow the hands
    if (O.kind === "robe") p.ell(a.pts[2][0] * 0.9 + a.pts[1][0] * 0.1, a.pts[2][1] * 0.9 + a.pts[1][1] * 0.1, 7.5 * u, 6 * u, "#f4f4f4", 1.8 * u); // white cuff
    if (a.nohand) return;
    if (a.cuff || cuffs) { p.ell(hx, hy - 6 * u, 7 * u, 3.5 * u, "#c9d0d8", 2 * u); }
    p.ell(hx, hy, 6.4 * u, 6.4 * u, skin, 2.2 * u);
    if (a.finger) { const [dx, dy] = a.finger; p.ol = 2 * u; p.line([[hx, hy], [hx + dx * 13 * u, hy + dy * 13 * u]], skin, 3.6 * u); p.ol = 12; }
    if (a.palm) for (const k of [-1, 0, 1]) p.stroke([[hx + side * 4 * u, hy - 3 * u + k * 3 * u], [hx + side * 10 * u, hy - 5 * u + k * 4 * u]], 2.4 * u, INK);
    if (a.droop) p.stroke([[hx, hy], [hx + side * 3 * u, hy + 9 * u]], 4 * u, skin);
    if (a.saw) sawProp(p, hx, hy, u, rad(sawA));
  };
  for (const [i, a] of arms.entries()) if (a.behind) drawArm(a, i ? 1 : -1);
  // torso
  if (O.kind === "robe") {
    p.poly([[tcx - 0.18 * T.a, chin], [tcx + 0.18 * T.a, chin], [tcx, chin + 0.3 * HH]], "#f6f6f6", 1.6 * u); // shirt
    p.poly([[tcx - 4 * u, chin + 0.04 * HH], [tcx + 4 * u, chin + 0.04 * HH], [tcx + 5 * u, chin + 0.26 * HH], [tcx, chin + 0.3 * HH], [tcx - 5 * u, chin + 0.26 * HH]], "#ffffff", 1.6 * u); // white tie
  } else {
    p.gradFill(tp, jacket, mul(jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (O.kind === "con") {
        for (let y = chin - 0.2 * HH; y < torsoBot + 0.1 * HH; y += gap * 2) p.poly([[tcx - 1.6 * T.a, y + gap], [tcx + 1.6 * T.a, y + gap + 2 * u * facing], [tcx + 1.6 * T.a, y + 2 * gap + 2 * u * facing], [tcx - 1.6 * T.a, y + 2 * gap]], STRIPE_B, 0);
        p.ell(tcx, chin + 0.02 * HH, 0.36 * T.a, 0.1 * HH, skin, 2 * u, 0, 180); // round collar opening
      } else if (O.kind === "uniform") {
        if (O.shirt) p.poly([[tcx - 0.3 * T.a, chin - 0.02 * HH], [tcx + 0.3 * T.a, chin - 0.02 * HH], [tcx, chin + 0.24 * HH]], O.shirt, 1.6 * u);
        p.stroke([[tcx, chin + 0.22 * HH], [tcx, torsoBot]], 2 * u, mul(jacket, [0.6, 0.6, 0.7]));
        for (let k = 0; k < 3; k++) p.dot(tcx + 7 * u, chin + (0.34 + k * 0.2) * HH, 3 * u, O.badge);
        for (const s of [-1, 1]) p.poly(rrect(tcx + s * 0.5 * T.a - 13 * u, chin + 0.3 * HH, tcx + s * 0.5 * T.a + 13 * u, chin + 0.46 * HH, 3 * u), mul(jacket, [0.85, 0.85, 0.9]), 1.6 * u);
        p.band([[tcx - 1.5 * T.a, torsoBot - 0.18 * HH], [tcx + 1.5 * T.a, torsoBot - 0.18 * HH]], "#1a1614", 0.07 * HH, 1.2 * u);
        p.poly(rrect(tcx - 9 * u, torsoBot - 0.22 * HH, tcx + 9 * u, torsoBot - 0.14 * HH, 2 * u), "#cfc6a0", 1.4 * u);
        if (O.star) for (const s of [-1, 1]) p.poly(rrect(tcx + s * 0.62 * T.a - 10 * u, chin + 0.06 * HH, tcx + s * 0.62 * T.a + 10 * u, chin + 0.13 * HH, 2 * u), "#e9ecf2", 1.2 * u);
      } else if (O.kind === "leather") {
        p.poly([[tcx - 0.32 * T.a, chin - 0.02 * HH], [tcx + 0.32 * T.a, chin - 0.02 * HH], [tcx + 0.1 * T.a, torsoBot], [tcx - 0.1 * T.a, torsoBot]], "#f0ede6", 1.6 * u);
        for (const s of [-1, 1]) p.poly([[tcx + s * 0.32 * T.a, chin - 0.04 * HH], [tcx + s * 0.75 * T.a, chin + 0.02 * HH], [tcx + s * 0.25 * T.a, chin + 0.42 * HH], [tcx + s * 0.12 * T.a, chin + 0.3 * HH]], mul(jacket, [0.8, 0.8, 0.85]), 1.8 * u);
        for (const s of [-1, 1]) p.stroke(ellPts(tcx + s * 0.55 * T.a, chin + 0.5 * HH, 0.2 * T.a, 0.3 * HH, 200, 300, 0, 10), 4 * u, "#ffffff30");
        p.stroke([[tcx + 0.1 * T.a, chin + 0.42 * HH], [tcx + 0.1 * T.a, torsoBot]], 1.6 * u, "#c9c9c9");
      }
    });
    p.inkRing(tp, ow, thick);
    if (O.kind === "con") p.ell(tcx, chin + 0.02 * HH, 0.36 * T.a, 0.1 * HH, null, 2.2 * u, 0, 180);
    if (O.keys) keyRing(p, tcx + 0.72 * T.a, torsoBot - 0.1 * HH, u, swing);
  }
  for (const [i, a] of arms.entries()) if (!a.behind && !a.front) drawArm(a, i ? 1 : -1);
  for (const [i, a] of arms.entries()) if (a.front) drawArm(a, i ? 1 : -1);
  if (arms[0].cuff && arms[1].cuff) p.stroke([[arms[0].pts[2][0], arms[0].pts[2][1] - 6 * u], [arms[1].pts[2][0], arms[1].pts[2][1] - 6 * u]], 2.4 * u, "#9aa3ad");
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  for (const s of [-1, 1]) { const ep = ellPts(cx + s * 0.96 * H.a, hc + 0.08 * H.b, 0.17 * H.a, 0.24 * H.b, 0, 360, 0, 20); p.shadedFill(ep, skin, mul(skin, SH_SKIN), light, 0.2 * H.a); p.inkRing(ep, ow * 0.8, thick); }
  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (O.stubble) p.clip(hp, () => { const r = rng(seed + 5); for (let i = 0; i < 70; i++) { const a = rad(15 + r() * 150), d = 0.6 + 0.4 * r(); p.dot(cx + Math.cos(a) * H.a * d, hc + 0.1 * H.b + Math.sin(a) * H.b * d * 0.9, 1.1 * u, "#00000030"); } });
  p.inkRing(hp, ow, thick);
  const capped = !!O.cap;
  if (!capped || capLift > 0.5) hairTop(p, O, H, cx, hc, light, thick, ow, u, seed);
  else if (O.hair && !baggy) for (const s of [-1, 1]) p.ell(cx + s * 0.93 * H.a, hc - 0.12 * H.b, 0.12 * H.a, 0.26 * H.b, O.hair, 2 * u);
  if (O.freckles) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) p.dot(cx + 7 * u * facing + s * (22 + k * 4) * u, hc + (12 + (k % 2) * 4) * u, 1.6 * u, "#c2703e");
  if (puff > 0) for (const s of [-1, 1]) { const ce = ellPts(cx + 7 * u * facing + s * 30 * u, hc + 20 * u, (9 + 5 * puff) * u, (8 + 4 * puff) * u, 0, 360, 0, 20); p.shadedFill(ce, mix(skin, "#ff8a8a", 0.35), mul(skin, SH_SKIN), light, 12 * u); p.inkRing(ce, 2.6 * u, thick); }; // puffed cheeks (holding breath)
  faceFront(p, cx, hc, W, expr, facing, look, lid, capped, skin, O.moustache, !!O.stout);
  const mx = cx + 8 * u * facing, my = hc + 20 * u;
  if (expr === "yawn") { p.ell(mx, my + 4 * u, 13 * u, 17 * u, "#5a1e28", 3.2 * u); p.ell(mx, my + 13 * u, 7 * u, 5 * u, "#e86e78", 0); }
  if (expr === "hold") { p.ell(mx, my, 5 * u, 3 * u, "#e07b7b", 2.6 * u); }
  if (O.glasses) specs(p, cx, hc, u, facing);
  if (O.shades) shades(p, cx, hc, u, facing);
  if (sweat > 0) for (let k = 0; k < 3; k++) { const t = (sweat + k * 0.37) % 1, s = k % 2 ? 1 : -1, x = cx + s * (0.62 + 0.12 * k) * H.a, y = hc - 0.5 * H.b + t * 0.9 * H.b; p.poly([[x, y - 9 * u], [x + 5 * u, y + 2 * u], [x, y + 7 * u], [x - 5 * u, y + 2 * u]], "#a8dcff", 1.8 * u); }
  if (O.blush || expr === "joy" || expr === "awe") for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 27 * u, hc + 14 * u, 8 * u, 4.5 * u, "#ff9c9c80", 0);
  if (capped) peakCap(p, O, H, cx, hc - capLift * 0.6 * HH, light, thick, ow, u, facing, capBig);
  p.rot = null;
};
export const castHead = (key, seed = 3) => { const O = CAST[key], H = headBlob(seed, O.a || 124, 0), HH = 2 * H.b; return 975 - 1.12 * HH - 1.0 * HH - H.b; };

/** small cartoon bird (side view), wing phase w 0..1 */
export const fxBird = (p, w, col = "#f2c94c") => {
  const a = Math.sin(w * Math.PI * 2);
  p.poly([[230, 520], [190, 500], [205, 535]], mul(col, [0.8, 0.7, 0.6]), 6); // tail
  p.ell(300, 520, 85, 62, col, 9);
  p.ell(372, 470, 46, 44, col, 9);
  p.poly([[410, 462], [452, 476], [410, 488]], "#f08a2c", 6);
  p.dot(385, 462, 9); p.dot(388, 459, 3, "#ffffff");
  p.ell(355, 488, 9, 6, "#ff9c9c", 0);
  const wy = 500 - 90 * a;
  p.poly([[270, 505], [330, 500], [300 + 10 * a, wy - 40 * a], [240, wy]], mul(col, [0.86, 0.8, 0.7]), 8);
  p.stroke([[290, 580], [285, 610]], 6); p.stroke([[315, 580], [320, 610]], 6);
};
/** ding sparkle star (wink) */
export const fxSpark = (p, t) => {
  const s = Math.sin(Math.min(1, t) * Math.PI), pts = [];
  for (let k = 0; k < 8; k++) { const r = (k % 2 ? 22 : 90) * s, a = rad(k * 45); pts.push([300 + r * Math.cos(a), 500 + r * Math.sin(a)]); }
  if (s > 0.05) { p.poly(pts, "#fff6c8", 7); p.ell(300, 500, 16 * s, 16 * s, "#ffffff", 0); }
};
/** sweat / sigh / breath puff, dust, sparks */
export const fxSigh = (p, t) => { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - t); for (let i = 0; i < 3; i++) p.ell(250 + i * 60 + t * 120, 500 - i * 20 - t * 60, (40 + i * 10) * (0.6 + t), (28 + i * 6) * (0.6 + t), "#eef4ff", 6); g.restore(); };
export const fxSparks = (p, t, seed = 1) => {
  const r = rng(seed);
  for (let i = 0; i < 14; i++) { const a = rad(200 + r() * 140), v = 160 + r() * 260, x = 300 + Math.cos(a) * v * t, y = 500 + Math.sin(a) * v * t + 420 * t * t, l = 26 * (1 - t);
    if (l > 1) { p.stroke([[x, y], [x - Math.cos(a) * l, y - Math.sin(a) * l]], 9, "#ffb43a"); p.stroke([[x, y], [x - Math.cos(a) * l, y - Math.sin(a) * l]], 4, "#fff6c8"); } }
};
export const fxPop = (p, t, seed = 2) => { // confetti burst
  const r = rng(seed), cols = ["#ff5a5a", "#ffd84a", "#4ac0ff", "#7be07b", "#ff8ad8"];
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, v = 120 + r() * 280, x = 300 + Math.cos(a) * v * t, y = 500 + Math.sin(a) * v * t + 380 * t * t;
    p.g.save(); p.g.translate(x, y); p.g.rotate(t * 8 + i); p.g.fillStyle = cols[i % 5]; p.g.globalAlpha = Math.max(0, 1 - t * 0.9); p.g.fillRect(-12, -6, 24, 12); p.g.restore(); }
};
/** chalk tally marks on the cell wall: n groups of five, plus `extra` strokes. drawn on a 512 canvas */
export const tallyMarks = (g, n, extra = 0, k = 1) => {
  g.save(); g.strokeStyle = "#f2f0ea"; g.lineCap = "round"; let x = 30, y = 60, cnt = 0; const r = rng(9);
  const total = n * 5 + extra;
  for (let i = 0; i < total; i++) {
    const inG = i % 5, gx = x + inG * 16, wob = () => (r() - 0.5) * 5;
    g.lineWidth = 5; g.globalAlpha = 0.85;
    if (inG < 4) { g.beginPath(); g.moveTo(gx + wob(), y + wob()); const last = i === total - 1 ? k : 1; g.lineTo(gx + wob(), y + 60 * last); g.stroke(); }
    else { g.beginPath(); g.moveTo(x - 8, y + 50); g.lineTo(x - 8 + (80) * (i === total - 1 ? k : 1), y + 50 - 40 * (i === total - 1 ? k : 1)); g.stroke(); }
    if (inG === 4) { x += 100; if (x > 430) { x = 30; y += 92; } }
    cnt++;
  }
  g.restore();
};
