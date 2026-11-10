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
// "Gefängnis zu vermieten" cast (our own cartoon designs, no real people), props and fx.
// Rule for everything below: no text, letters or digits are ever drawn (no fillText).
// =====================================================================================
FACE.yawn = { eye: ["squeeze", "squeeze"], brow: [-2, 3], mouth: "O" };
FACE.bored = { eye: ["lid", "lid"], brow: [1, 1], mouth: "dash" };
FACE.innocent = { eye: ["happy", "happy"], brow: [-3, 1], mouth: "smile" };
FACE.sly = { eye: ["lid", "lid"], brow: [3, -3], mouth: "smirk" };
FACE.joy = { eye: ["happy", "happy"], brow: [-4, -4], mouth: "laugh" };

const NAVY = "#2d3b61", STRW = "#f6f3ea", STRB = "#2b2733";
export const CAST = {
  warden: { top: "suit", col: "#c7cbd1", pants: "#aeb3ba", shoes: "#4a372c", tie: "#2f7f7b", skin: "#ffe1c6", hair: "#f2cf63", hairStyle: "side", glasses: true, legs: 1.66, tw: 0.92 },
  guardFat: { top: "uniform", col: NAVY, pants: "#253150", shoes: "#1f1b22", skin: "#f5c9a0", hat: "peak", hatCol: NAVY, stout: true, tw: 1.3, legs: 1.2, moustache: "#5a3b2a" },
  guardThin: { top: "uniform", col: NAVY, pants: "#253150", shoes: "#1f1b22", skin: "#ffe2c2", hat: "peak", hatCol: NAVY, tw: 0.74, legs: 1.62 },
  conBeard: { top: "stripes", skin: "#f0c6a0", hair: "#5a3b2a", hairStyle: "short", beard: "#5d3e2a", stout: true, tw: 1.28, legs: 1.25 },
  conGlasses: { top: "stripes", skin: "#ffe2c2", hair: "#2b211c", hairStyle: "short", glasses: true, legs: 0.98, tw: 0.96 },
  conTall: { top: "stripes", skin: "#c99067", hair: "#1e1714", hairStyle: "short", legs: 1.85, tw: 0.72 },
  conBald: { top: "stripes", skin: "#f5c9a0", hairStyle: "bald", legs: 1.3, tw: 1.02 },
  north: { top: "coat", col: "#3f5f4c", pants: "#3b3a44", shoes: "#5a3b2a", fur: "#efe5d2", skin: "#ffe0c8", hat: "beanie", hatCol: "#4f7f95", beard: "#c8562b", brows: "#b9481f", tw: 1.18, legs: 1.3, stout: true },
  driver: { top: "shirt", col: "#8fb6d6", pants: "#3e4a5c", shoes: "#3a2a20", braces: "#7a4f2e", skin: "#ecd0b6", hat: "flat", hatCol: "#7b5a3c", moustache: "#3b2a20", legs: 1.3, tw: 1.0 },
};

const dashStroke = (p, pts, w, col, dash) => {
  const g = p.g; g.save(); g.lineCap = "butt"; g.lineJoin = "round"; g.setLineDash(dash); p.path(pts, false); g.strokeStyle = col; g.lineWidth = w; g.stroke(); g.restore();
};
/** a limb: ink outline + colour (+ prisoner stripes as bands across the limb) */
const limb = (p, pts, w, col, striped, u) => {
  p.stroke(pts, w + 2.6 * u, INK);
  p.stroke(pts, w, striped ? STRW : col);
  if (striped) dashStroke(p, pts, w, STRB, [4.2 * u, 4.2 * u]);
};

/** coin icon (no symbol, just a gold disc with a rim) */
const coin = (p, x, y, r, u) => { p.ell(x, y, r, r, "#f2c440", 2.2 * u); p.ell(x, y, r * 0.66, r * 0.66, null, 1.2 * u); p.stroke(ellPts(x - r * 0.25, y - r * 0.25, r * 0.4, r * 0.4, 200, 260, 0, 8), 1.4 * u, "#fff6c8"); };
/** little house icon */
const houseIcon = (p, x, y, s, col = "#2d3b61") => { p.poly([[x - s, y + s * 0.9], [x - s, y], [x, y - s * 0.9], [x + s, y], [x + s, y + s * 0.9]], col, 0); p.poly([[x - s * 0.25, y + s * 0.9], [x - s * 0.25, y + s * 0.3], [x + s * 0.25, y + s * 0.3], [x + s * 0.25, y + s * 0.9]], "#ffffff", 0); };
/** paper with grey lines only */
const paper = (p, x0, y0, x1, y1, u, box = false) => {
  p.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], "#fbfaf5", 2.2 * u);
  const n = Math.max(2, Math.floor((y1 - y0) / (7 * u)) - 1);
  for (let i = 1; i <= n; i++) { const y = y0 + (y1 - y0) * i / (n + 1); p.stroke([[x0 + 4 * u + (box && i < 3 ? 8 * u : 0), y], [x1 - 4 * u - (i % 3 === 2 ? 8 * u : 0), y]], 1.5 * u, "#a8a8b0"); }
  if (box) for (let i = 1; i < 3; i++) { const y = y0 + (y1 - y0) * i / (n + 1); p.poly(rrect(x0 + 3 * u, y - 2.5 * u, x0 + 8 * u, y + 2.5 * u, 0.6 * u), "#ffffff", 1.2 * u); }
};

/** props drawn in a hand at (hx, hy) */
const propAt = (p, kind, hx, hy, u, side, o = {}) => {
  switch (kind) {
    case "clipboard": {
      const x0 = hx - 20 * u, y0 = hy - 52 * u, x1 = hx + 20 * u, y1 = hy + 4 * u;
      p.poly(rrect(x0, y0, x1, y1, 3 * u), "#a8784a", 2.6 * u); paper(p, x0 + 4 * u, y0 + 9 * u, x1 - 4 * u, y1 - 4 * u, u);
      p.poly(rrect(hx - 9 * u, y0 - 3 * u, hx + 9 * u, y0 + 7 * u, 2 * u), "#b9bec6", 2 * u); break;
    }
    case "form": paper(p, hx - 16 * u, hy - 44 * u, hx + 16 * u, hy + 2 * u, u, true); break;
    case "key": {
      const s = o.big ?? 1, gold = "#f0bd3a", c = [hx, hy - 4 * u];
      p.band([[c[0], c[1]], [c[0] + side * 56 * u * s, c[1] - 30 * u * s]], gold, 7 * u * s, 2 * u);
      const tip = [c[0] + side * 56 * u * s, c[1] - 30 * u * s];
      p.poly([[tip[0] - side * 14 * u * s, tip[1] + 6 * u * s], [tip[0] - side * 8 * u * s, tip[1] + 20 * u * s], [tip[0] - side * 2 * u * s, tip[1] + 17 * u * s], [tip[0] + side * 2 * u * s, tip[1] + 3 * u * s]], gold, 2 * u);
      p.ell(c[0] - side * 10 * u * s, c[1] + 6 * u * s, 15 * u * s, 15 * u * s, gold, 2.4 * u); p.ell(c[0] - side * 10 * u * s, c[1] + 6 * u * s, 6 * u * s, 6 * u * s, "#ffffff00", 2 * u);
      p.stroke(ellPts(c[0] - side * 14 * u * s, c[1] + 1 * u * s, 8 * u * s, 8 * u * s, 200, 280, 0, 8), 2 * u * s, "#fff2b8");
      // tag with a house icon
      const tx = c[0] - side * 20 * u * s, ty = c[1] + 32 * u * s;
      p.stroke([[c[0] - side * 12 * u * s, c[1] + 18 * u * s], [tx, ty - 8 * u * s]], 1.4 * u, "#c9a466");
      p.poly(rrect(tx - 11 * u * s, ty - 8 * u * s, tx + 11 * u * s, ty + 10 * u * s, 3 * u * s), "#fff8e8", 2 * u);
      houseIcon(p, tx, ty + 1 * u * s, 6 * u * s); break;
    }
    case "bag": case "bagDrag": {
      const s = o.big ?? 1, bx = kind === "bag" ? hx : hx + side * (o.off ?? 70) * u, by = kind === "bag" ? hy + 40 * u * s : 975 - 46 * u * s;
      if (kind === "bagDrag") p.stroke([[hx, hy], [bx - side * 6 * u, by - 40 * u * s]], 2.2 * u, "#7a5a34");
      const B = { a: 44 * u * s, b: 42 * u * s, nTop: 2.4, nBot: 1.7, egg: 0.25, asym: 0, rot: 0, noise: 0.03, seed: 77 };
      const bp = blobPts(bx, by, B); p.shadedFill(bp, "#d2ad6c", "#9c7a44", rad(-120), 44 * u * s, 0.35); p.inkRing(bp, 4 * u, thickAngle(rad(-120)));
      p.poly([[bx - 14 * u * s, by - 40 * u * s], [bx + 14 * u * s, by - 40 * u * s], [bx + 22 * u * s, by - 58 * u * s], [bx, by - 52 * u * s], [bx - 22 * u * s, by - 58 * u * s]], "#d2ad6c", 2.4 * u);
      p.band([[bx - 15 * u * s, by - 41 * u * s], [bx + 15 * u * s, by - 41 * u * s]], "#8a5a30", 4 * u * s, 1.2 * u);
      coin(p, bx, by + 6 * u * s, 15 * u * s, u);
      for (const [dx, dy] of [[-26, -18], [24, 14]]) p.stroke([[bx + dx * u * s, by + dy * u * s], [bx + (dx + 6) * u * s, by + (dy + 3) * u * s]], 1.4 * u, "#9c7a44");
      break;
    }
    case "can": {
      const col = "#3f9a8c", x = hx + side * 4 * u, y = hy + 26 * u;
      p.poly(rrect(x - 20 * u, y - 18 * u, x + 20 * u, y + 20 * u, 5 * u), col, 2.6 * u);
      p.band([[x + side * 18 * u, y + 8 * u], [x + side * 46 * u, y - 16 * u]], col, 5 * u, 2 * u);
      p.ell(x + side * 48 * u, y - 18 * u, 6 * u, 4 * u, "#2f7a6e", 2 * u, 0, 360, side * -40);
      p.stroke(ellPts(x, y - 18 * u, 16 * u, 16 * u, 180, 360, 0, 12), 3.2 * u, INK);
      p.stroke([[x - 14 * u, y - 4 * u], [x + 10 * u, y - 4 * u]], 2 * u, "#ffffff66"); break;
    }
    case "chicken": chicken(p, hx - side * 4 * u, hy - 4 * u, 1.05 * u / 2.36, o.cluck || 0, side); break;
    case "basket": {
      const x = hx, y = hy + 22 * u;
      p.ell(x - 10 * u, y - 14 * u, 12 * u, 7 * u, "#e0a74e", 1.8 * u, 0, 360, -15); // bread
      p.ell(x + 10 * u, y - 13 * u, 7 * u, 7 * u, "#d9433a", 1.8 * u); // apple
      p.poly([[x + 2 * u, y - 10 * u], [x + 22 * u, y - 20 * u], [x + 20 * u, y - 8 * u]], "#f4d35e", 1.6 * u); // cheese
      p.poly([[x - 24 * u, y - 10 * u], [x + 24 * u, y - 10 * u], [x + 18 * u, y + 16 * u], [x - 18 * u, y + 16 * u]], "#b9824a", 2.4 * u);
      for (let i = -2; i <= 2; i++) p.stroke([[x + i * 8 * u, y - 9 * u], [x + i * 6.5 * u, y + 15 * u]], 1.2 * u, "#8a5a30");
      p.stroke(ellPts(x, y - 10 * u, 20 * u, 24 * u, 180, 360, 0, 14), 2.6 * u, "#8a5a30"); break;
    }
    case "suitcase": {
      const x = hx, y = hy + 34 * u, c = o.col || "#a0522d";
      p.poly(rrect(x - 30 * u, y - 22 * u, x + 30 * u, y + 24 * u, 5 * u), c, 2.6 * u);
      for (const s of [-1, 1]) p.band([[x + s * 16 * u, y - 22 * u], [x + s * 16 * u, y + 24 * u]], "#6b3a1f", 4 * u, 1 * u);
      p.stroke(ellPts(x, y - 22 * u, 9 * u, 8 * u, 180, 360, 0, 10), 3 * u, INK); break;
    }
    case "cards": {
      for (let i = -1; i <= 1; i++) {
        const a = i * 16, pts = rotPts(rrect(hx - 9 * u, hy - 30 * u, hx + 9 * u, hy - 2 * u, 2 * u), rad(a), hx, hy);
        p.poly(pts, "#c8414a", 1.8 * u); p.clip(pts, () => { for (let k = -6; k < 6; k++) p.stroke(rotPts([[hx - 12 * u + k * 4 * u, hy - 32 * u], [hx + k * 4 * u + 12 * u, hy]], rad(a), hx, hy), 1 * u, "#f3c9cc"); });
      }
      break;
    }
    case "mug": { p.poly(rrect(hx - 9 * u, hy - 16 * u, hx + 9 * u, hy + 4 * u, 2 * u), "#f4efe6", 2 * u); p.stroke(ellPts(hx + side * 10 * u, hy - 6 * u, 5 * u, 6 * u, -90, 90, 0, 8).map(([x, y]) => [hx + side * (x - hx), y]), 2.2 * u); break; }
  }
};

/** chicken (also used as its own card). s scales a design-sized bird around (x, y) = body centre */
export const chicken = (p, x, y, s = 1, cluck = 0, side = 1) => {
  const k = s * 2.36, U = (v) => v * k;
  for (const d of [-1, 1]) { p.stroke([[x + d * U(5), y + U(14)], [x + d * U(6), y + U(26)]], U(2.4), "#e3a32a"); p.stroke([[x + d * U(6), y + U(26)], [x + d * U(6) + side * U(5), y + U(27)]], U(2), "#e3a32a"); }
  p.ell(x - side * U(18), y - U(6), U(9), U(12), "#f4f1ea", U(2.2), 0, 360, side * -30); // tail
  p.ell(x, y, U(22), U(17), "#fbf9f4", U(2.6));
  p.ell(x - side * U(2), y + U(2), U(10), U(7), "#e9e3d6", U(1.6), 0, 360, side * 10); // wing
  const hx = x + side * U(16), hy = y - U(16) - cluck * U(3);
  p.ell(hx, hy, U(10), U(10), "#fbf9f4", U(2.4));
  p.poly([[hx - U(5), hy - U(9)], [hx - U(3), hy - U(15)], [hx, hy - U(10)], [hx + U(3), hy - U(16)], [hx + U(5), hy - U(8)]], "#e2453c", U(1.6));
  p.ell(hx + side * U(2), hy + U(10), U(3), U(4), "#e2453c", U(1.2));
  const bo = cluck * U(3);
  p.poly([[hx + side * U(8), hy - U(2)], [hx + side * U(17), hy + U(1) - bo * 0.3], [hx + side * U(8), hy + U(2)]], "#f2b53a", U(1.4));
  if (cluck > 0.3) p.poly([[hx + side * U(8), hy + U(3)], [hx + side * U(15), hy + U(5) + bo], [hx + side * U(8), hy + U(5)]], "#f2b53a", U(1.4));
  p.dot(hx + side * U(3), hy - U(2), U(2.2));
};
export const chickenCard = (p, cluck = 0, side = 1, peck = 0) => { chicken(p, 300, 880 + peck * 14, 2.6, cluck, side); };

/** modern front-facing cartoon person for this film. Same rig ideas as romanFront (blob head, stick limbs). */
export const castFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? CAST[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, light = rad(-120),
    step = 0, hold = {}, toe = 0, wv = 0, lift = 0, cluck = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = O.legs ?? 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300, striped = O.top === "stripes";
  const pants = striped ? STRW : mix(O.pants, INK, 0.2), armCol = striped ? STRW : O.top === "shirt" ? O.col : mix(O.col, INK, 0.12);
  p.rot = null;
  // ---- legs (stick legs with outline; walk via step, tiptoe via toe) ----
  for (const side of [-1, 1]) {
    const up = step ? Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 : 0;
    const tt = toe ? Math.max(0, Math.sin(Math.PI * 2 * (toe + (side > 0 ? 0.5 : 0)))) * 26 : 0;
    const hx = cx + side * 15 * u * (O.tw ?? 1), fx = cx + side * 21 * u * (O.tw ?? 1), fy = sole - 4 * u - up - tt - (toe ? 8 * u : 0);
    limb(p, curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 6.2 * u, pants, striped, u);
    const shoe = striped ? "#3b3540" : O.shoes ?? "#3a2a20";
    if (toe) { p.stroke([[fx, fy - 2 * u], [fx + side * 7 * u, fy + 8 * u]], 7.5 * u + 3, INK); p.stroke([[fx, fy - 2 * u], [fx + side * 7 * u, fy + 8 * u]], 7.5 * u, shoe); }
    else { p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8 * u + 3, INK); p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8 * u, shoe); }
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.tw ?? 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "cheer": return { pts: [s, [X(18), s[1] - 0.32 * HH], [X(34), s[1] - 0.78 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(wv)), s[1] - 0.62 * HH]], front: false };
      case "finger": return { pts: [s, [X(30), s[1] + 0.12 * HH], [X(36), s[1] - 0.3 * HH]], front: false, fingerUp: true };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "hold": return { pts: [s, [X(8), s[1] + 0.42 * HH], [tcx + side * 0.35 * T.a, s[1] + 0.36 * HH]], front: true };
      case "hug": return { pts: [s, [X(6), s[1] + 0.4 * HH], [tcx + side * 0.15 * T.a, s[1] + 0.42 * HH]], front: true };
      case "forward": return { pts: [s, [X(14), s[1] + 0.28 * HH], [tcx + side * 0.55 * T.a, s[1] + 0.22 * HH]], front: true, big: true };
      case "carry": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(8), chin + 0.98 * HH]], front: false };
      case "drag": return { pts: [s, [X(22), s[1] + 0.32 * HH], [X(44), s[1] + 0.58 * HH]], front: false };
      case "shake": return { pts: [s, [X(24), s[1] + (0.2 + (opts.hy || 0) * 0.5) * HH], [X(56), s[1] + (0.26 + (opts.hy || 0)) * HH]], front: false };
      case "shoulder": return { pts: [s, [X(26), s[1] - 0.05 * HH], [X(58), s[1] + 0.02 * HH]], front: false };
      case "yawn": return { pts: [s, [X(12), s[1] + 0.12 * HH], [cx + side * 6 * u, hc + 0.45 * H.b]], front: true };
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "sneak": return { pts: [s, [X(10), s[1] + 0.2 * HH], [tcx + side * 0.7 * T.a, s[1] + 0.05 * HH]], front: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const sleeve = O.top === "shirt" ? O.col : armCol;
  const drawArm = (a, side) => {
    limb(p, curve(a.pts[0], a.pts[1], a.pts[2]), 5.4 * u, sleeve, striped, u);
    const [hx, hy] = a.pts[2];
    p.ell(hx, hy, (a.big ? 7.5 : a.fingerUp ? 7 : 5.6) * u, (a.big ? 7.5 : a.fingerUp ? 6.4 : 5.6) * u, skin, 2 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.line([[hx, hy], [hx + dx / l * 12 * u, hy + dy / l * 12 * u]], skin, 2.6 * u); }
    if (a.fingerUp) p.line([[hx - 1 * u, hy - 5 * u], [hx - 1 * u, hy - 16 * u]], skin, 2.3 * u);
    if (a.thumb) p.line([[hx, hy], [hx + Math.sign(hx - cx) * 5 * u, hy - 11 * u]], skin, 2.6 * u);
    const pr = side < 0 ? hold.L : hold.R;
    if (pr) propAt(p, pr, hx, hy, u, side, { big: hold.big, cluck, col: hold.col, off: hold.off });
  };
  arms.forEach((a, i) => { if (!a.front) drawArm(a, i ? 1 : -1); });
  // torso
  const base = striped ? STRW : O.col;
  p.gradFill(tp, base, mul(base, SH_CLOTH), light);
  p.clip(tp, () => {
    const top = chin - 0.3 * HH, bot = torsoBot + 0.1 * HH;
    if (striped) {
      for (let y = top + 0.05 * HH; y < bot; y += 0.17 * HH) p.poly([[tcx - 2 * T.a, y], [tcx + 2 * T.a, y], [tcx + 2 * T.a, y + 0.085 * HH], [tcx - 2 * T.a, y + 0.085 * HH]], STRB, 0);
      p.poly([[tcx - 0.32 * T.a, chin - 0.05 * HH], [tcx + 0.32 * T.a, chin - 0.05 * HH], [tcx, chin + 0.2 * HH]], STRW, 1.6 * u);
    } else if (O.top === "suit") {
      p.poly([[tcx - 0.42 * T.a, chin - 0.1 * HH], [tcx + 0.42 * T.a, chin - 0.1 * HH], [tcx, chin + 0.62 * HH]], "#ffffff", 1.6 * u);
      p.poly([[tcx - 5 * u, chin + 0.02 * HH], [tcx + 5 * u, chin + 0.02 * HH], [tcx + 7 * u, chin + 0.46 * HH], [tcx, chin + 0.56 * HH], [tcx - 7 * u, chin + 0.46 * HH]], O.tie, 1.6 * u);
      p.poly(rrect(tcx - 6 * u, chin - 0.04 * HH, tcx + 6 * u, chin + 0.05 * HH, 2 * u), O.tie, 1.6 * u);
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.42 * T.a, chin - 0.1 * HH], [tcx + s * 0.62 * T.a, chin + 0.1 * HH], [tcx + s * 0.32 * T.a, chin + 0.2 * HH], [tcx + s * 0.06 * T.a, chin + 0.62 * HH]], mul(O.col, [0.86, 0.86, 0.9]), 1.6 * u);
      for (let i = 0; i < 2; i++) p.dot(tcx + 0.1 * T.a, chin + 0.75 * HH + i * 0.16 * HH, 2.4 * u, "#5c5f66");
      p.stroke([[tcx - 0.75 * T.a, chin + 0.62 * HH], [tcx - 0.4 * T.a, chin + 0.62 * HH]], 1.6 * u);
    } else if (O.top === "uniform") {
      p.poly([[tcx - 0.3 * T.a, chin - 0.1 * HH], [tcx + 0.3 * T.a, chin - 0.1 * HH], [tcx, chin + 0.2 * HH]], "#9fb4d6", 1.6 * u);
      for (let i = 0; i < 4; i++) p.dot(tcx + 2 * u * facing, chin + 0.3 * HH + i * 0.2 * HH, 2.6 * u, "#16203a");
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], "#1a2238", 0.07 * HH, 1.2 * u);
      for (const s of [-1, 1]) p.poly(rrect(tcx + s * 0.55 * T.a - 9 * u, chin + 0.3 * HH, tcx + s * 0.55 * T.a + 9 * u, chin + 0.44 * HH, 2 * u), mul(O.col, [0.8, 0.8, 0.85]), 1.4 * u);
    } else if (O.top === "coat") {
      p.stroke([[tcx, chin], [tcx, bot]], 2 * u);
      for (let i = 0; i < 3; i++) { const y = chin + 0.35 * HH + i * 0.22 * HH; p.poly(rrect(tcx - 7 * u, y - 2 * u, tcx + 7 * u, y + 2 * u, 2 * u), "#d8c39a", 1.4 * u); }
      for (const s of [-1, 1]) p.poly(rrect(tcx + s * 0.55 * T.a - 10 * u, chin + 0.62 * HH, tcx + s * 0.55 * T.a + 10 * u, chin + 0.68 * HH, 1 * u), mul(O.col, [0.75, 0.75, 0.8]), 1.4 * u);
    } else if (O.top === "shirt") {
      for (const s of [-1, 1]) p.band([[tcx + s * 0.45 * T.a, chin - 0.1 * HH], [tcx + s * 0.38 * T.a, bot]], O.braces, 4 * u, 1 * u);
      p.poly([[tcx - 0.3 * T.a, chin - 0.1 * HH], [tcx, chin + 0.12 * HH], [tcx + 0.3 * T.a, chin - 0.1 * HH]], "#ffffff", 1.6 * u);
      p.poly([[tcx - 2 * T.a, torsoBot - 0.2 * HH], [tcx + 2 * T.a, torsoBot - 0.2 * HH], [tcx + 2 * T.a, bot], [tcx - 2 * T.a, bot]], O.pants, 0);
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.fur) { // fluffy fur collar around the neck
    for (let i = 0; i <= 10; i++) { const a = rad(180 + i * 18), x = tcx + Math.cos(a) * 0.62 * T.a, y = chin + 0.06 * HH + Math.sin(a) * -0.1 * HH + Math.abs(Math.cos(a)) * 0.08 * HH; p.ell(x, y, 11 * u, 9 * u, O.fur, 1.8 * u); }
    p.ell(tcx, chin + 0.06 * HH, 0.5 * T.a, 0.1 * HH, O.fur, 0);
  }
  arms.forEach((a, i) => { if (a.front) drawArm(a, i ? 1 : -1); });
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  const hp = blobPts(cx, hc, H);
  if (O.hair && O.hairStyle !== "bald" && !O.hat) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (O.hairStyle === "bald") {
    p.stroke(ellPts(cx - 18 * u, hc - 0.62 * H.b, 0.28 * H.a, 0.16 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff88");
    if (O.tufts) for (const s of [-1, 1]) p.ell(cx + s * 0.93 * H.a, hc - 0.08 * H.b, 0.14 * H.a, 0.24 * H.b, O.tufts, 2.4 * u);
  }
  if (O.hat === "flat") hatOn(p, { hat: "cap", cap: O.hatCol, jacket: O.col }, hp, H, cx, hc, light, seed, facing, false);
  else if (!O.hat && O.hair && O.hairStyle !== "bald") { // short hair cap with a soft hairline (keeps the brows visible)
    const crown = hc - H.b, side = O.hairStyle === "side", cut0 = crown + (side ? 0.27 : 0.25) * HH, line = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24, x = cx - 1.25 * H.a + 2.5 * H.a * t, e = Math.abs(2 * t - 1);
      line.push([x, cut0 + e * e * 0.16 * HH + Math.sin(i * 1.7 + seed) * 1.6 * u + (side ? (t - 0.5) * 0.07 * HH : 0)]); }
    const cap = [...line, [cx + 1.3 * H.a, hc - 1.3 * H.b], [cx - 1.3 * H.a, hc - 1.3 * H.b]];
    p.clip(hp, () => { p.shadedFill(cap, O.hair, mul(O.hair, SH_FELT), light, H.a, 0.35); p.stroke(line, 2.2 * u);
      if (side) p.stroke(curve([cx - 0.38 * H.a, crown + 0.02 * HH], [cx - 0.3 * H.a, crown + 0.14 * HH], [cx - 0.05 * H.a, cut0 + 0.02 * HH]), 1.8 * u);
      else for (const k of [-0.4, 0.15]) p.stroke([[cx + k * H.a, crown + 0.08 * HH], [cx + (k + 0.12) * H.a, crown + 0.18 * HH]], 1.4 * u, mul(O.hair, [0.6, 0.6, 0.6])); });
    p.inkRing(hp, ow, thick);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.66 * H.a, b: 0.72 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.03, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.82, 0.82, 0.86]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.5 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, mul(O.beard, [0.7, 0.7, 0.7])); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  const brim = O.hat === "peak" || O.hat === "beanie";
  faceFront(p, cx, hc + (O.hat === "beanie" ? 4 * u : 0), W, expr, facing, look, lid, brim, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.beard && (expr === "shock" || expr === "yawn" || expr === "joy" || expr === "laugh")) p.ell(cx + 8 * u * facing, hc + 22 * u, 7 * u, 8 * u, "#5a1e28", 2 * u);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 19 * u, 10 * u, 4 * u, O.brows, 1.6 * u);
  if (O.glasses) {
    const fx = cx + 7 * u * facing;
    for (const s of [-1, 1]) { p.ell(fx + s * 13 * u, hc, 11 * u, 10.5 * u, "#ffffff22", 2.8 * u); p.stroke(ellPts(fx + s * 13 * u - 3 * u, hc - 3 * u, 6 * u, 5 * u, 200, 260, 0, 8), 1.6 * u, "#ffffffcc"); }
    p.stroke([[fx - 3 * u, hc - 2 * u], [fx + 3 * u, hc - 2 * u]], 2.4 * u);
    for (const s of [-1, 1]) p.stroke([[fx + s * 24 * u, hc - 1 * u], [cx + s * 0.97 * H.a, hc - 4 * u]], 2.2 * u);
  }
  if (O.hat === "peak") { // plain peaked cap: no badge, no emblem
    const crown = hc - H.b, yb = crown + 0.2 * HH, wt = 1.18 * H.a, wb = 0.98 * H.a, ht = 0.34 * HH, col = O.hatCol;
    const body = [[cx - wb, yb], [cx + wb, yb], [cx + wt, yb - ht], [cx + wt * 0.6, yb - ht - 0.06 * HH], [cx - wt * 0.6, yb - ht - 0.06 * HH], [cx - wt, yb - ht]];
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4); p.poly(body, null, ow * 0.9);
    p.band([[cx - wb * 1.02, yb - 0.04 * HH], [cx + wb * 1.02, yb - 0.04 * HH]], "#1a2238", 0.07 * HH, 1.2 * u);
    p.ell(cx + 3 * u * facing, yb + 0.03 * HH, 0.8 * H.a, 0.07 * HH, "#15182a", ow * 0.8, 0, 180);
  } else if (O.hat === "beanie") {
    const crown = hc - H.b, yb = crown + 0.36 * HH;
    const dome = [...ellPts(cx, yb, 1.06 * H.a, 0.52 * HH, 180, 360, 0, 30)];
    p.shadedFill(dome, O.hatCol, mul(O.hatCol, SH_FELT), light, H.a, 0.35); p.clip(dome, () => { for (let i = -8; i <= 8; i++) p.stroke([[cx + i * 12 * u, yb], [cx + i * 9 * u, yb - 0.6 * HH]], 1.2 * u, mul(O.hatCol, [0.8, 0.8, 0.85])); });
    p.poly(dome, null, ow * 0.9);
    p.band([[cx - 1.07 * H.a, yb - 0.03 * HH], [cx + 1.07 * H.a, yb - 0.03 * HH]], mul(O.hatCol, [0.85, 0.85, 0.9]), 0.12 * HH, 1.6 * u, "round");
    p.ell(cx, yb - 0.55 * HH, 16 * u, 15 * u, "#efe5d2", 2.4 * u);
  }
  p.rot = null;
};

// ---------- fx cards (all text-free) ----------
/** tumbleweed: tangled brown ball, drawn around (300, 500) */
export const fxTumble = (p) => {
  const r = (k) => rnd(91, k);
  p.ell(300, 500, 170, 170, "#c9a46a55", 0);
  for (let i = 0; i < 26; i++) { const a0 = r(i) * 6.28, rr = 60 + r(i + 40) * 110; p.arc(300 + Math.cos(a0) * 30, 500 + Math.sin(a0) * 30, rr, rr * (0.6 + 0.4 * r(i + 80)), r(i + 120) * 360, r(i + 120) * 360 + 140 + r(i + 7) * 120, 7, i % 3 ? "#8a6a3e" : "#5e4426"); }
};
/** light bulb with rays (t 0..1 glow) */
export const fxBulb = (p, t) => {
  const on = t > 0.15;
  if (on) for (let i = 0; i < 10; i++) { const a = rad(-180 + i * 20), r0 = 150, r1 = 150 + 70 * Math.min(1, t * 2); p.line([[300 + r0 * Math.cos(a), 400 + r0 * Math.sin(a)], [300 + r1 * Math.cos(a), 400 + r1 * Math.sin(a)]], "#fff3a0", 14); }
  if (on) p.ell(300, 400, 150, 150, "#fff7b866", 0);
  p.ell(300, 400, 100, 104, on ? "#fff07a" : "#f4f1e6", 12);
  p.poly(rrect(250, 490, 350, 580, 14), "#b9bec6", 10);
  for (const y of [515, 545]) p.stroke([[252, y], [348, y]], 8);
  p.stroke([[300, 490], [300, 440]], 8, on ? "#f2a41a" : "#9a9a9a"); p.ell(300, 410, 26, 26, on ? "#ffd84a" : "#d8d8d0", 6);
  if (on) p.stroke(ellPts(262, 360, 40, 50, 200, 250, 0, 8), 12, "#ffffff");
};
/** padlock */
export const fxLock = (p, t = 1) => {
  const y = 520 - (1 - t) * 160;
  p.stroke(ellPts(300, y - 40, 70, 90, 180, 360, 0, 20), 34, INK); p.stroke(ellPts(300, y - 40, 70, 90, 180, 360, 0, 20), 18, "#b9bec6");
  p.poly(rrect(190, y - 40, 410, y + 140, 26), "#e2b13c", 12);
  p.ell(300, y + 40, 22, 22, INK, 0); p.poly([[290, y + 50], [310, y + 50], [316, y + 100], [284, y + 100]], INK, 0);
};
/** chalk arrow on a board: wobbly line stepping down, drawn progressively (k 0..1) */
export const fxChalk = (p, k) => {
  const pts = [[60, 160], [150, 230], [220, 210], [300, 330], [380, 310], [470, 470], [540, 560]];
  const n = pts.length - 1, upto = k * n, out = [];
  for (let i = 0; i <= n; i++) { if (i <= upto) out.push(pts[i]); else { const j = Math.floor(upto), f = upto - j; if (j < n) out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]); break; } }
  if (out.length > 1) { p.stroke(out, 16, "#f4f4ee"); p.stroke(out.map(([x, y]) => [x + 3, y + 2]), 5, "#ffffffaa"); }
  if (k > 0.97) { const [x, y] = pts[n]; p.stroke([[x - 70, y - 10], [x, y], [x - 20, y - 70]], 16, "#f4f4ee"); }
};
/** wall calendar: blank grid only, no digits. torn = number of pages already gone (just changes the colour band) */
export const fxCalendar = (p, page = 0) => {
  const cols = ["#d9534f", "#4f8fd9", "#5aa469", "#e0a43a", "#9a6ad6"];
  p.poly(rrect(70, 80, 530, 640, 16), "#fbfaf5", 12);
  p.poly([[70, 80], [530, 80], [530, 200], [70, 200]], cols[page % cols.length], 12);
  for (const x of [190, 410]) { p.ell(x, 80, 18, 30, "#b9bec6", 8); }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) p.poly(rrect(100 + c * 84, 230 + r * 98, 168 + c * 84, 310 + r * 98, 6), "#ffffff", 5);
};
export const fxPage = (p, page = 0, curl = 0) => {
  const cols = ["#d9534f", "#4f8fd9", "#5aa469", "#e0a43a", "#9a6ad6"];
  const pts = [[100, 120], [500, 120], [500 - curl * 60, 520], [100, 520 - curl * 40]];
  p.poly(pts, "#fbfaf5", 10); p.clip(pts, () => p.poly([[100, 120], [500, 120], [500, 210], [100, 210]], cols[page % cols.length], 0));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) p.poly(rrect(125 + c * 92, 240 + r * 88, 195 + c * 92, 305 + r * 88, 5), "#ffffff", 4);
};
/** price tag with a coin icon (no number) */
export const fxTag = (p, glow = 0) => {
  if (glow > 0) for (let i = 0; i < 8; i++) { const a = rad(i * 45); p.line([[300 + 170 * Math.cos(a), 500 + 120 * Math.sin(a)], [300 + (170 + 70 * glow) * Math.cos(a), 500 + (120 + 70 * glow) * Math.sin(a)]], "#fff3a0", 12); }
  p.poly([[150, 420], [400, 420], [470, 500], [400, 580], [150, 580]], "#fff8e8", 12);
  p.ell(420, 500, 14, 14, "#ffffff", 7);
  coin(p, 255, 500, 52, 3.4);
};
/** cobweb in a corner (exported version of the helper above) */
export const fxWeb = (p) => cobweb(p, 300, 300, 260, 4);
/** water drops from a watering can */
export const fxDrops = (p, t) => { for (let i = 0; i < 6; i++) { const k = (t + i / 6) % 1; p.ell(260 + i * 18 + k * 30, 200 + k * 520, 10, 16, "#8fd0ff", 4); } };
/** snowflake dots */
export const fxSnow = (p) => { p.ell(300, 500, 26, 26, "#ffffff", 0); };
/** sparkle star */
export const fxSpark = (p, t) => { const s = 0.5 + 0.5 * Math.sin(t * Math.PI); const pts = []; for (let k = 0; k < 8; k++) { const r = k % 2 ? 30 * s : 110 * s, b = rad(k * 45); pts.push([300 + r * Math.cos(b), 500 + r * Math.sin(b)]); } p.poly(pts, "#fff7c0", 8); };
/** cyclist (tiny, for the final aerial) */
export const fxBike = (p, ph = 0, col = "#e05a8a") => {
  for (const x of [190, 410]) { p.ell(x, 820, 80, 80, null, 16); for (let i = 0; i < 4; i++) { const a = ph * 6.28 + i * 0.785; p.stroke([[x - 70 * Math.cos(a), 820 - 70 * Math.sin(a)], [x + 70 * Math.cos(a), 820 + 70 * Math.sin(a)]], 5); } }
  p.stroke([[190, 820], [270, 700], [400, 700], [410, 820]], 14); p.stroke([[270, 700], [300, 820], [400, 700]], 14);
  p.stroke([[300, 580], [270, 700]], 50, col); p.ell(300, 500, 70, 70, "#ffe2c2", 12);
  p.stroke([[300, 600], [390, 660]], 20, col); p.stroke([[275, 700], [300 + 40 * Math.sin(ph * 6.28), 800]], 22, "#3b3f52");
};
/** standalone money bag on the ground (coin icon only) */
export const bagCard = (p, big = 1.6) => { const u = 2.36; propAt(p, "bag", 300, 975 - 84 * u * big, u, 1, { big }); };
