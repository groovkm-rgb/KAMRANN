// ANIMALS (detailed, side view, facing right; s = -1 faces left). Feet on y = 0. Sizes match Noah at k ≈ .25 (1 m ≈ 220 units);
// pass sc to rescale. Every animal: flat colour + cool shadow side + highlight + fur/feather strokes + thin ink.
//   rabbit deer fox bear dog cat horse mammoth (c, x, { s, sc, t, walk })   bird owl (c, x, y, { s, sc, t, color })
const AINK = 3;
function aShape(c, path, col, o = {}) {
  path(); c.fillStyle = col; c.fill(); c.save(); path(); c.clip();
  c.fillStyle = shade(col, -.22); c.globalAlpha = .9; o.shadow ? o.shadow() : null; c.globalAlpha = 1;
  if (o.light) { c.fillStyle = shade(col, .18); o.light(); }
  if (o.fur) { c.lineWidth = 2; c.strokeStyle = shade(col, -.3); o.fur(); }
  c.restore(); path(); c.lineWidth = o.lw ?? AINK; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke();
}
function aEye(c, x, y, r = 6) { circle(c, x, y, r); c.fillStyle = OUT; c.fill(); circle(c, x + r * .35, y - r * .35, r * .38); c.fillStyle = '#fff'; c.fill(); }
function aLegSeg(c, pts, w, col) { line(c, pts, w + AINK * 2); line(c, pts, w, col); }
function aStart(c, x, o, sc0) { const sc = (o.sc ?? 1) * sc0; c.save(); c.translate(x, o.y || 0); c.scale((o.s || 1) * sc, sc); }
function furTicks(c, x0, y0, x1, y1, n, seed, len = 10) { for (let i = 0; i < n; i++) { const x = x0 + rnd(seed + i) * (x1 - x0), y = y0 + rnd(seed + i + 50) * (y1 - y0); c.beginPath(); c.moveTo(x, y); c.lineTo(x - len * .4, y + len); c.stroke(); } }
function rabbit(c, x, o = {}) {
  const t = o.t || 0, hop = o.hop ? Math.abs(Math.sin(t * 6)) * 50 : 0, col = o.color || '#cbb59a';
  aStart(c, x, o, .6); c.translate(0, -hop);
  aShape(c, () => { c.beginPath(); c.ellipse(70, -150, 12, 48, .25, 0, Math.PI * 2); }, col, { light: () => { c.beginPath(); c.ellipse(72, -150, 6, 36, .25, 0, Math.PI * 2); c.fillStyle = '#f0b8b8'; c.fill(); } });
  aShape(c, () => { c.beginPath(); c.ellipse(-10, -62, 72, 54, 0, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(-90, -40, 170, 60), light: () => { c.beginPath(); c.ellipse(-20, -96, 40, 14, 0, 0, Math.PI * 2); c.fill(); }, fur: () => furTicks(c, -70, -100, 40, -30, 14, 11) });
  circle(c, -80, -72, 22); c.fillStyle = '#fff'; c.fill(); c.lineWidth = AINK; c.strokeStyle = OUT; c.stroke();
  aShape(c, () => { c.beginPath(); c.ellipse(50, -150, 11, 50, .1, 0, Math.PI * 2); }, col, { light: () => { c.beginPath(); c.ellipse(52, -150, 5, 38, .1, 0, Math.PI * 2); c.fillStyle = '#f0b8b8'; c.fill(); } });
  aShape(c, () => { c.beginPath(); c.arc(50, -105, 40, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(20, -90, 80, 40), light: () => { c.beginPath(); c.arc(70, -110, 16, 0, Math.PI * 2); c.fillStyle = '#f2e6d6'; c.fill(); } });
  aEye(c, 62, -114, 7); circle(c, 88, -100, 5); c.fillStyle = '#e88a9a'; c.fill(); for (const d of [-4, 4]) line(c, [86, -98 + d, 118, -100 + d * 2], 1.5, 'rgba(40,30,30,.6)');
  aShape(c, () => { c.beginPath(); c.ellipse(22, -8, 32, 12, 0, 0, Math.PI * 2); }, shade(col, -.05)); aShape(c, () => { c.beginPath(); c.ellipse(-38, -10, 40, 14, 0, 0, Math.PI * 2); }, shade(col, -.05));
  c.restore();
}
function deer(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 7 : 0, sw = o.walk ? Math.sin(ph) * .3 : 0, col = o.color || '#b4743f', belly = '#ecd3ad';
  aStart(c, x, o, .55);
  const leg = (hx, hy, a, front, far) => { const k = [hx + Math.sin(a) * 140, hy + 140], f = [k[0] + (front ? -10 : 20) + Math.sin(a) * 30, -14]; aLegSeg(c, [hx, hy, k[0], k[1], f[0], f[1]], front ? 18 : 20, far ? shade(col, -.25) : col); c.beginPath(); c.moveTo(f[0] - 10, -16); c.lineTo(f[0] + 14, -16); c.lineTo(f[0] + 12, 0); c.lineTo(f[0] - 12, 0); c.closePath(); c.fillStyle = '#2a2020'; c.fill(); };
  leg(-120, -300, -sw, false, true); leg(130, -300, sw, true, true);
  aShape(c, () => { c.beginPath(); c.moveTo(-200, -350); c.bezierCurveTo(-210, -440, 120, -460, 190, -400); c.bezierCurveTo(230, -360, 200, -270, 140, -270); c.lineTo(-150, -268); c.bezierCurveTo(-210, -275, -205, -320, -200, -350); }, col,
    { shadow: () => { c.beginPath(); c.ellipse(0, -255, 260, 55, 0, 0, Math.PI * 2); c.fill(); }, light: () => { c.beginPath(); c.ellipse(-20, -425, 170, 18, -.03, 0, Math.PI * 2); c.fill(); for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-130 + i * 34, -395 + (i % 2) * 20, 7, 0, Math.PI * 2); c.fillStyle = '#f6e8cc'; c.fill(); } }, fur: () => furTicks(c, -180, -400, 160, -300, 22, 41, 12) });
  c.beginPath(); c.ellipse(10, -282, 150, 22, 0, 0, Math.PI * 2); c.fillStyle = belly; c.fill();
  aShape(c, () => { c.beginPath(); c.ellipse(-205, -385, 20, 30, -.5, 0, Math.PI * 2); }, '#f4ead8');
  leg(-100, -290, sw, false, false); leg(150, -290, -sw, true, false);
  aShape(c, () => { c.beginPath(); c.moveTo(120, -400); c.quadraticCurveTo(160, -500, 205, -590); c.lineTo(275, -572); c.quadraticCurveTo(250, -470, 215, -340); c.closePath(); }, col, { shadow: () => { c.beginPath(); c.moveTo(220, -580); c.lineTo(290, -560); c.lineTo(240, -330); c.lineTo(200, -340); c.fill(); }, light: () => { c.beginPath(); c.moveTo(200, -540); c.lineTo(220, -540); c.lineTo(180, -420); c.lineTo(165, -420); c.fill(); } });
  aShape(c, () => { c.beginPath(); c.ellipse(195, -660, 18, 40, -.7, 0, Math.PI * 2); }, col, { light: () => { c.beginPath(); c.ellipse(197, -660, 9, 28, -.7, 0, Math.PI * 2); c.fillStyle = '#e8c8b0'; c.fill(); } });
  for (const [dx, cc] of [[-6, shade('#e8dcc0', -.15)], [22, '#e8dcc0']]) { const bx = 238 + dx; const br = [[bx, -650, bx - 20, -780], [bx - 10, -720, bx + 26, -760], [bx - 18, -770, bx - 50, -812], [bx - 16, -760, bx + 6, -830]]; for (const p of br) aLegSeg(c, p, 7, cc); }
  aShape(c, () => { c.beginPath(); c.moveTo(200, -640); c.quadraticCurveTo(230, -690, 270, -670); c.quadraticCurveTo(330, -640, 335, -610); c.quadraticCurveTo(320, -585, 280, -590); c.quadraticCurveTo(230, -585, 205, -605); c.closePath(); }, col, { shadow: () => c.fillRect(200, -615, 140, 40), light: () => { c.beginPath(); c.ellipse(260, -660, 30, 10, -.3, 0, Math.PI * 2); c.fill(); } });
  ell(c, 326, -612, 12, 10); c.fillStyle = '#2a2020'; c.fill(); aEye(c, 258, -638, 8); line(c, [248, -650, 272, -652], 2, OUT);
  c.restore();
}
function fox(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 9 : 0, sw = o.walk ? Math.sin(ph) * .35 : 0, col = o.color || '#d9692c';
  aStart(c, x, o, .5);
  const leg = (hx, a, far) => { const f = hx + Math.sin(a) * 60; aLegSeg(c, [hx, -110, f, -12], 14, far ? '#2a2020' : '#3a2a26'); };
  leg(-80, -sw, true); leg(80, sw, true);
  aShape(c, () => { c.beginPath(); c.moveTo(-120, -150); c.bezierCurveTo(-240, -200, -330, -120, -300, -60); c.bezierCurveTo(-270, -40, -200, -110, -110, -110); c.closePath(); }, col, { light: () => { c.beginPath(); c.moveTo(-300, -60); c.bezierCurveTo(-320, -90, -300, -110, -270, -100); c.lineTo(-250, -60); c.closePath(); c.fillStyle = '#fff'; c.fill(); }, fur: () => furTicks(c, -280, -170, -140, -110, 10, 61) });
  aShape(c, () => { c.beginPath(); c.ellipse(0, -150, 135, 52, 0, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(-140, -125, 280, 40), light: () => { c.beginPath(); c.ellipse(-10, -190, 90, 10, 0, 0, Math.PI * 2); c.fill(); }, fur: () => furTicks(c, -120, -190, 110, -120, 16, 71) });
  c.beginPath(); c.ellipse(40, -112, 70, 14, 0, 0, Math.PI * 2); c.fillStyle = '#f6efe4'; c.fill();
  leg(-60, sw, false); leg(100, -sw, false);
  for (const ex of [130, 162]) aShape(c, () => { c.beginPath(); c.moveTo(ex - 20, -235); c.lineTo(ex, -295); c.lineTo(ex + 18, -232); c.closePath(); }, ex > 140 ? col : shade(col, -.2), { light: () => { c.beginPath(); c.moveTo(ex - 10, -240); c.lineTo(ex, -275); c.lineTo(ex + 8, -240); c.closePath(); c.fillStyle = '#3a2a26'; c.fill(); } });
  aShape(c, () => { c.beginPath(); c.moveTo(100, -230); c.quadraticCurveTo(160, -260, 200, -220); c.lineTo(265, -185); c.quadraticCurveTo(262, -170, 240, -168); c.quadraticCurveTo(170, -150, 120, -165); c.quadraticCurveTo(90, -190, 100, -230); c.closePath(); }, col, { light: () => { c.beginPath(); c.moveTo(150, -185); c.lineTo(255, -180); c.quadraticCurveTo(200, -160, 140, -160); c.closePath(); c.fillStyle = '#fff'; c.fill(); } });
  circle(c, 262, -182, 7); c.fillStyle = OUT; c.fill(); aEye(c, 182, -212, 6);
  c.restore();
}
function bear(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 4 : 0, sw = o.walk ? Math.sin(ph) * .25 : 0, col = o.color || '#6e4a30';
  aStart(c, x, o, .6);
  const leg = (hx, a, far) => { aShape(c, () => { c.beginPath(); c.rect(hx - 40 + Math.sin(a) * 40, -180, 80, 180); }, far ? shade(col, -.25) : col, { shadow: () => c.fillRect(hx - 60, -60, 120, 60) }); };
  leg(-150, -sw, true); leg(140, sw, true);
  aShape(c, () => { c.beginPath(); c.moveTo(-230, -150); c.bezierCurveTo(-260, -380, 30, -420, 180, -340); c.bezierCurveTo(250, -300, 240, -160, 190, -140); c.lineTo(-200, -130); c.closePath(); }, col,
    { shadow: () => { c.beginPath(); c.ellipse(0, -130, 260, 60, 0, 0, Math.PI * 2); c.fill(); }, light: () => { c.beginPath(); c.ellipse(-40, -370, 150, 22, -.1, 0, Math.PI * 2); c.fill(); }, fur: () => furTicks(c, -220, -380, 200, -150, 40, 81, 14) });
  leg(-120, sw, false); leg(170, -sw, false);
  aShape(c, () => { c.beginPath(); c.arc(250, -300, 80, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(170, -270, 170, 60), fur: () => furTicks(c, 190, -360, 300, -260, 10, 91) });
  for (const ex of [205, 248]) aShape(c, () => { c.beginPath(); c.arc(ex, -372, 24, 0, Math.PI * 2); }, ex < 220 ? shade(col, -.2) : col, { light: () => { c.beginPath(); c.arc(ex, -372, 11, 0, Math.PI * 2); c.fillStyle = '#c8a07a'; c.fill(); } });
  aShape(c, () => { c.beginPath(); c.ellipse(320, -280, 50, 34, 0, 0, Math.PI * 2); }, '#c8a07a'); ell(c, 360, -290, 14, 11); c.fillStyle = OUT; c.fill(); aEye(c, 270, -322, 8); line(c, [330, -262, 352, -266], 3, OUT);
  c.restore();
}
function dog(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 10 : 0, sw = o.walk ? Math.sin(ph) * .4 : 0, col = o.color || '#c98a4a';
  aStart(c, x, o, .5);
  const leg = (hx, a, far) => { const f = hx + Math.sin(a) * 50; aLegSeg(c, [hx, -110, f, -10], 22, far ? shade(col, -.25) : col); ell(c, f + 6, -8, 18, 9); c.fillStyle = far ? shade(col, -.25) : col; c.fill(); c.lineWidth = AINK; c.strokeStyle = OUT; c.stroke(); };
  leg(-70, -sw, true); leg(80, sw, true);
  const wag = Math.sin(t * 14) * .35; c.save(); c.translate(-108, -160); c.rotate(-.7 + wag); aShape(c, () => { c.beginPath(); c.ellipse(0, -40, 12, 48, 0, 0, Math.PI * 2); }, col); c.restore();
  aShape(c, () => { c.beginPath(); c.ellipse(0, -150, 122, 58, 0, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(-130, -125, 260, 40), light: () => { c.beginPath(); c.ellipse(-10, -195, 80, 10, 0, 0, Math.PI * 2); c.fill(); }, fur: () => furTicks(c, -100, -190, 100, -120, 14, 101) });
  c.beginPath(); c.ellipse(20, -110, 80, 18, 0, 0, Math.PI * 2); c.fillStyle = '#f2e2c8'; c.fill();
  leg(-50, sw, false); leg(100, -sw, false);
  aShape(c, () => { c.beginPath(); c.arc(125, -235, 62, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(70, -205, 130, 40), light: () => { c.beginPath(); c.arc(140, -262, 20, 0, Math.PI * 2); c.fill(); } });
  aShape(c, () => { c.beginPath(); c.ellipse(186, -214, 42, 30, 0, 0, Math.PI * 2); }, '#f2e2c8'); circle(c, 222, -224, 11); c.fillStyle = OUT; c.fill();
  aShape(c, () => { c.beginPath(); c.ellipse(98, -236, 26, 54, .35, 0, Math.PI * 2); }, shade(col, -.35)); aEye(c, 145, -250, 8);
  c.beginPath(); c.rect(78, -190, 86, 18); c.fillStyle = '#d9473a'; c.fill(); c.lineWidth = AINK; c.strokeStyle = OUT; c.stroke(); circle(c, 120, -168, 9); c.fillStyle = '#f2c531'; c.fill(); c.stroke();
  c.restore();
}
function cat(c, x, o = {}) {
  const t = o.t || 0, col = o.color || '#8a8a96';
  aStart(c, x, o, .42);
  c.beginPath(); c.moveTo(-100, -60); c.bezierCurveTo(-220, -60, -200, -260, -150 + Math.sin(t * 3) * 20, -280); c.lineWidth = 22 + AINK * 2; c.strokeStyle = OUT; c.lineCap = 'round'; c.stroke(); c.lineWidth = 22; c.strokeStyle = col; c.stroke();
  aShape(c, () => { c.beginPath(); c.ellipse(-20, -90, 110, 80, 0, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(-130, -50, 230, 50), fur: () => { for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-80 + i * 34, -160); c.quadraticCurveTo(-70 + i * 34, -120, -84 + i * 34, -90); c.lineWidth = 5; c.stroke(); } } });
  aShape(c, () => { c.beginPath(); c.ellipse(60, -18, 50, 18, 0, 0, Math.PI * 2); }, col);
  for (const ex of [40, 100]) aShape(c, () => { c.beginPath(); c.moveTo(ex - 22, -225); c.lineTo(ex - 5, -275); c.lineTo(ex + 18, -222); c.closePath(); }, col, { light: () => { c.beginPath(); c.moveTo(ex - 12, -228); c.lineTo(ex - 5, -258); c.lineTo(ex + 8, -228); c.fillStyle = '#e8a0a8'; c.fill(); } });
  aShape(c, () => { c.beginPath(); c.arc(70, -190, 58, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(20, -160, 110, 40) });
  for (const ex of [52, 96]) { ell(c, ex, -198, 10, 13); c.fillStyle = '#c8e05a'; c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke(); ell(c, ex, -198, 3, 11); c.fillStyle = OUT; c.fill(); }
  c.beginPath(); c.moveTo(66, -176); c.lineTo(80, -176); c.lineTo(73, -168); c.closePath(); c.fillStyle = '#e88a9a'; c.fill(); for (const d of [-1, 1]) for (const k of [0, 8]) line(c, [73 + d * 20, -170 + k, 73 + d * 60, -176 + k * 1.5], 1.5, 'rgba(30,30,30,.6)');
  c.restore();
}
function horse(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 6 : 0, sw = o.walk ? Math.sin(ph) * .3 : 0, col = o.color || '#8a5232', mane = '#3a2418';
  aStart(c, x, o, .62);
  const leg = (hx, a, far) => { const k = [hx + Math.sin(a) * 60, -180], f = [k[0] + Math.sin(a) * 20, -24]; aLegSeg(c, [hx, -330, k[0], k[1], f[0], f[1]], 30, far ? shade(col, -.25) : col); c.beginPath(); c.rect(f[0] - 22, -26, 44, 26); c.fillStyle = '#2a2020'; c.fill(); };
  leg(-160, -sw, true); leg(170, sw, true);
  c.beginPath(); c.moveTo(-250, -420); c.quadraticCurveTo(-330, -380, -320, -200); c.lineWidth = 40; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 32; c.strokeStyle = mane; c.stroke();
  aShape(c, () => { c.beginPath(); c.moveTo(-260, -400); c.bezierCurveTo(-270, -520, 180, -520, 250, -440); c.bezierCurveTo(290, -380, 260, -300, 200, -300); c.lineTo(-210, -298); c.bezierCurveTo(-270, -310, -265, -360, -260, -400); }, col,
    { shadow: () => { c.beginPath(); c.ellipse(0, -290, 300, 60, 0, 0, Math.PI * 2); c.fill(); }, light: () => { c.beginPath(); c.ellipse(-30, -488, 200, 16, 0, 0, Math.PI * 2); c.fill(); }, fur: () => furTicks(c, -220, -480, 220, -320, 18, 121, 14) });
  leg(-130, sw, false); leg(200, -sw, false);
  aShape(c, () => { c.beginPath(); c.moveTo(160, -470); c.quadraticCurveTo(220, -640, 290, -720); c.lineTo(350, -690); c.quadraticCurveTo(330, -560, 280, -400); c.closePath(); }, col, { shadow: () => { c.beginPath(); c.moveTo(310, -700); c.lineTo(360, -690); c.lineTo(300, -400); c.lineTo(260, -410); c.fill(); } });
  aShape(c, () => { c.beginPath(); c.moveTo(280, -730); c.quadraticCurveTo(330, -770, 370, -740); c.lineTo(450, -620); c.quadraticCurveTo(460, -580, 420, -575); c.quadraticCurveTo(360, -590, 320, -650); c.closePath(); }, col, { shadow: () => c.fillRect(330, -620, 140, 60), light: () => { c.beginPath(); c.ellipse(350, -715, 30, 9, .6, 0, Math.PI * 2); c.fill(); } });
  aShape(c, () => { c.beginPath(); c.moveTo(300, -750); c.lineTo(312, -800); c.lineTo(330, -752); c.closePath(); }, col);
  for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(285 - i * 22, -735 + i * 38); c.quadraticCurveTo(250 - i * 22, -720 + i * 38, 240 - i * 24, -690 + i * 40); c.lineWidth = 20; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 13; c.strokeStyle = mane; c.stroke(); }
  aEye(c, 350, -700, 9); ell(c, 436, -600, 8, 6); c.fillStyle = OUT; c.fill();
  c.restore();
}
function bird(c, x, y, o = {}) {
  const t = o.t || 0, flap = Math.sin(t * 22), col = o.color || '#4f86c6';
  c.save(); c.translate(x, y); const sc = (o.sc ?? 1) * .55; c.scale((o.s || 1) * sc, sc);
  aShape(c, () => { c.beginPath(); c.moveTo(-36, -4); c.lineTo(-74, -18); c.lineTo(-66, 12); c.closePath(); }, shade(col, -.15));
  aShape(c, () => { c.beginPath(); c.ellipse(0, 0, 42, 30, 0, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(-45, 10, 90, 30), light: () => { c.beginPath(); c.ellipse(10, 10, 26, 16, 0, 0, Math.PI * 2); c.fillStyle = '#f2e6c8'; c.fill(); } });
  aShape(c, () => { c.beginPath(); c.moveTo(-12, -8); c.quadraticCurveTo(-24, -64 * flap, 22, -54 * flap - 6); c.quadraticCurveTo(16, -18, 12, -4); c.closePath(); }, shade(col, -.2), { fur: () => { for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-8 + i * 8, -10); c.lineTo(-4 + i * 10, -40 * flap); c.stroke(); } } });
  c.beginPath(); c.moveTo(38, -6); c.lineTo(62, 2); c.lineTo(38, 9); c.closePath(); c.fillStyle = '#f2b531'; c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke(); aEye(c, 24, -8, 6);
  c.restore();
}
function owl(c, x, y, o = {}) {
  const t = o.t || 0, col = o.color || '#8a6a4a', blink = (t % 4) < .12;
  c.save(); c.translate(x, y); const sc = (o.sc ?? 1) * .6; c.scale(sc, sc);
  aShape(c, () => { c.beginPath(); c.ellipse(0, -80, 62, 82, 0, 0, Math.PI * 2); }, col, { shadow: () => c.fillRect(10, -170, 60, 180), light: () => { c.beginPath(); c.ellipse(0, -55, 38, 50, 0, 0, Math.PI * 2); c.fillStyle = '#e8d8b8'; c.fill(); }, fur: () => { for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-24 + k * 16, -80 + r * 18, 6, 0, Math.PI); c.stroke(); } } });
  for (const s of [-1, 1]) aShape(c, () => { c.beginPath(); c.moveTo(s * 30, -150); c.lineTo(s * 46, -190); c.lineTo(s * 56, -140); c.closePath(); }, col);
  for (const s of [-1, 1]) { circle(c, s * 26, -120, 24); c.fillStyle = '#f6efe0'; c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke(); if (blink) line(c, [s * 26 - 16, -120, s * 26 + 16, -120], 4); else { circle(c, s * 26, -120, 13); c.fillStyle = '#f2a830'; c.fill(); circle(c, s * 26, -120, 7); c.fillStyle = OUT; c.fill(); } }
  c.beginPath(); c.moveTo(-8, -104); c.lineTo(8, -104); c.lineTo(0, -88); c.closePath(); c.fillStyle = '#d9a040'; c.fill();
  for (const s of [-1, 1]) line(c, [s * 18, 0, s * 18, 10], 5, '#d9a040');
  c.restore();
}
function mammoth(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 4 : 0, sw = o.walk ? Math.sin(ph) * .2 : 0, fur = o.color || '#7a4f34', dark = shade(fur, -.3);
  aStart(c, x, o, .75);
  const leg = (lx, k, far) => aShape(c, () => { c.beginPath(); c.moveTo(lx - 55 - sw * 50 * k, -340); c.lineTo(lx + 60 - sw * 50 * k, -340); c.lineTo(lx + 64 - sw * 50 * k, 0); c.lineTo(lx - 60 - sw * 50 * k, 0); c.closePath(); }, far ? dark : fur, { fur: () => { for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(lx - 40 + j * 28, -60); c.lineTo(lx - 44 + j * 28, 0); c.stroke(); } } });
  leg(-210, -1, true); leg(150, 1, true);
  aShape(c, () => { c.beginPath(); c.moveTo(-330, -260); c.quadraticCurveTo(-370, -700, -60, -830); c.quadraticCurveTo(210, -890, 310, -650); c.quadraticCurveTo(360, -420, 280, -250); c.closePath(); }, fur,
    { shadow: () => { c.beginPath(); c.ellipse(0, -250, 380, 110, 0, 0, Math.PI * 2); c.fill(); }, light: () => { c.beginPath(); c.ellipse(-60, -790, 200, 30, -.15, 0, Math.PI * 2); c.fill(); }, fur: () => { c.lineWidth = 4; for (let i = 0; i < 40; i++) { const px = -300 + rnd(i + 130) * 560, py = -760 + rnd(i + 160) * 480; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 8, py + 40, px - 4, py + 80); c.stroke(); } } });
  for (let i = 0; i < 13; i++) { const px = -310 + i * 48; c.beginPath(); c.moveTo(px, -300); c.quadraticCurveTo(px + 10, -260, px + 2, -220 - (i % 3) * 16); c.lineWidth = 9; c.strokeStyle = dark; c.stroke(); }
  leg(-170, 1, false); leg(200, -1, false);
  aShape(c, () => { c.beginPath(); c.arc(290, -620, 155, 0, Math.PI * 2); }, fur, { shadow: () => c.fillRect(160, -560, 300, 120), fur: () => { c.lineWidth = 4; for (let i = 0; i < 14; i++) { const px = 180 + rnd(i + 190) * 220, py = -740 + rnd(i + 200) * 200; c.beginPath(); c.moveTo(px, py); c.lineTo(px - 6, py + 30); c.stroke(); } } });
  aShape(c, () => { c.beginPath(); c.ellipse(320, -775, 75, 42, 0, 0, Math.PI * 2); }, dark);
  aShape(c, () => { c.beginPath(); c.moveTo(380, -560); c.quadraticCurveTo(470, -420, 425, -220); c.quadraticCurveTo(415, -170, 455, -160); c.lineTo(460, -128); c.quadraticCurveTo(360, -150, 375, -230); c.quadraticCurveTo(400, -400, 320, -520); c.closePath(); }, fur, { shadow: () => { c.beginPath(); c.moveTo(410, -540); c.lineTo(480, -400); c.lineTo(440, -150); c.lineTo(420, -150); c.fill(); }, fur: () => { for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(370 + i * 4, -500 + i * 40); c.lineTo(420 + i * 3, -505 + i * 40); c.stroke(); } } });
  aShape(c, () => { c.beginPath(); c.moveTo(335, -480); c.quadraticCurveTo(540, -390, 575, -580); c.quadraticCurveTo(560, -410, 345, -440); c.closePath(); }, '#f4ecd8', { light: () => { c.beginPath(); c.moveTo(360, -470); c.quadraticCurveTo(520, -410, 560, -540); c.lineTo(565, -530); c.quadraticCurveTo(520, -400, 360, -460); c.fill(); } });
  aShape(c, () => { c.beginPath(); c.ellipse(205, -640, 62, 95, -.2, 0, Math.PI * 2); }, dark); aEye(c, 350, -650, 11);
  c.restore();
}
// WOLF (wild, NOT a dog): grey-beige coat with a darker saddle, cream belly/cheeks, long legs, narrow muzzle, upright ears,
// low bushy tail with a dark tip, yellow eyes. Real size: ~0.8 m at the shoulder (≈ 176 units at 1 m ≈ 220).
//   wolf(c, x, { s, sc, t, walk, stalk: 0..1 (head low), snarl: 0..1, glow: 0..1 (eyes shine in the dark) })
const WOLF = { coat: '#a39a8c', saddle: '#6c665e', cream: '#e6dccb', dark: '#3f3a35', eye: '#f2c230' };
function wolfEye(c, x, y, o) {
  c.save(); c.translate(x, y); c.rotate(-.18);
  c.beginPath(); c.moveTo(-11, 0); c.quadraticCurveTo(0, -9, 12, -1); c.quadraticCurveTo(0, 7, -11, 0); c.closePath(); c.fillStyle = WOLF.eye; c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
  circle(c, 2, -1, 3.6); c.fillStyle = OUT; c.fill(); circle(c, 4, -3, 1.4); c.fillStyle = '#fff'; c.fill();
  c.restore();
  if (o.glow) bloom(c, x, y, 40, '255,215,90', .6 * o.glow);
}
function wolf(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 7 : 0, sw = o.walk ? Math.sin(ph) : 0, st = o.stalk || 0, sn = o.snarl || 0;
  const C = o.color || WOLF.coat, S = WOLF.saddle, far = shade(C, -.28);
  aStart(c, x, o, .76);   // withers ≈ 176 units ≈ 0,8 m
  // legs: front (straight, wrist) and hind (backward hock); far pair first
  const fLeg = (lx, a, col) => { const kx = lx + Math.sin(a) * 30, px = lx + Math.sin(a) * 52; aLegSeg(c, [lx, -150, kx + 4, -60, px + 6, -8], 17, col); ell(c, px + 14, -6, 15, 7); c.fillStyle = col; c.fill(); c.lineWidth = AINK; c.strokeStyle = OUT; c.stroke(); };
  const hLeg = (lx, a, col) => { const kx = lx + 18 + Math.sin(a) * 30, hx = lx - 26 + Math.sin(a) * 40, px = lx - 14 + Math.sin(a) * 52;
    aShape(c, () => { c.beginPath(); c.ellipse(lx, -138, 34, 46, .25, 0, Math.PI * 2); }, col);
    aLegSeg(c, [lx + 6, -120, kx, -96, hx, -50, px, -8], 16, col); ell(c, px + 12, -6, 15, 7); c.fillStyle = col; c.fill(); c.lineWidth = AINK; c.strokeStyle = OUT; c.stroke(); };
  hLeg(-112, -.35 * sw, far); fLeg(108, .35 * sw, far);
  // tail: low, bushy, dark tip
  c.save(); c.translate(-160, -168); c.rotate(.55 + Math.sin(t * 2) * .05);
  aShape(c, () => { c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(-30, 50, -22, 120); c.quadraticCurveTo(-8, 150, 8, 122); c.quadraticCurveTo(22, 60, 14, -10); c.closePath(); }, C,
    { shadow: () => c.fillRect(0, -20, 40, 160), fur: () => furTicks(c, -20, 10, 14, 110, 8, 301, 12) });
  c.beginPath(); c.moveTo(-23, 104); c.quadraticCurveTo(-8, 152, 9, 112); c.quadraticCurveTo(-5, 118, -23, 104); c.fillStyle = WOLF.dark; c.fill(); c.restore();
  // body: deep chest, tucked waist, slightly sloping back
  const body = () => { c.beginPath(); c.moveTo(-175, -165); c.quadraticCurveTo(-178, -212, -120, -214); c.quadraticCurveTo(-10, -222, 95, -232); c.quadraticCurveTo(160, -228, 172, -175);
    c.quadraticCurveTo(170, -128, 125, -120); c.quadraticCurveTo(40, -122, -20, -138); c.quadraticCurveTo(-90, -142, -130, -128); c.quadraticCurveTo(-172, -128, -175, -165); c.closePath(); };
  aShape(c, body, C, {
    shadow: () => { c.beginPath(); c.ellipse(0, -118, 220, 34, 0, 0, Math.PI * 2); c.fill(); },
    light: () => { c.fillStyle = S; c.beginPath(); c.moveTo(-160, -205); c.quadraticCurveTo(-20, -240, 110, -236); c.quadraticCurveTo(60, -195, -40, -192); c.quadraticCurveTo(-120, -185, -160, -205); c.fill();
      c.fillStyle = WOLF.cream; c.beginPath(); c.ellipse(120, -140, 50, 22, -.3, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(-10, -132, 90, 9, 0, 0, Math.PI * 2); c.fill(); },
    fur: () => { furTicks(c, -150, -210, 140, -150, 30, 311, 13); } });
  // near legs
  hLeg(-96, .35 * sw, C); fLeg(124, -.35 * sw, C);
  // neck ruff + head (head lowers when stalking)
  const hx = 215 + st * 20, hy = -262 + st * 70;
  aShape(c, () => { c.beginPath(); c.moveTo(95, -236); c.quadraticCurveTo(150, -268 + st * 40, hx - 20, hy - 20); c.lineTo(hx + 10, hy + 30); c.quadraticCurveTo(170, -150, 150, -132); c.quadraticCurveTo(130, -170, 95, -236); c.closePath(); }, C,
    { shadow: () => { c.beginPath(); c.moveTo(140, -130); c.lineTo(hx, hy + 40); c.lineTo(hx + 30, hy + 40); c.lineTo(170, -120); c.fill(); }, fur: () => furTicks(c, 110, -250 + st * 40, hx, hy + 30, 12, 321, 14) });
  c.save(); c.translate(hx, hy); c.rotate(st * .25);
  // far ear, skull, muzzle, near ear
  aShape(c, () => { c.beginPath(); c.moveTo(-28, -30); c.lineTo(-16, -84); c.lineTo(8, -36); c.closePath(); }, far);
  aShape(c, () => { c.beginPath(); c.moveTo(-52, 6); c.quadraticCurveTo(-54, -44, -6, -48); c.quadraticCurveTo(38, -46, 52, -22); c.lineTo(100, -6); c.quadraticCurveTo(114, 0, 108, 14);
      c.quadraticCurveTo(70, 26 + sn * 6, 30, 30); c.quadraticCurveTo(-30, 46, -52, 6); c.closePath(); }, C,
    { shadow: () => { c.beginPath(); c.ellipse(-10, 34, 70, 18, 0, 0, Math.PI * 2); c.fill(); },
      light: () => { c.fillStyle = WOLF.cream; c.beginPath(); c.moveTo(40, 4); c.quadraticCurveTo(80, 4, 108, 12); c.quadraticCurveTo(70, 28, 26, 30); c.quadraticCurveTo(-10, 34, -30, 22); c.quadraticCurveTo(0, 8, 40, 4); c.fill();
        c.fillStyle = S; c.beginPath(); c.moveTo(-40, -36); c.quadraticCurveTo(0, -56, 44, -26); c.quadraticCurveTo(0, -30, -40, -26); c.fill(); },
      fur: () => furTicks(c, -44, -30, 20, 20, 10, 331, 10) });
  // nose, mouth line (snarl: lips back, teeth), eye, near ear
  ell(c, 108, 0, 10, 8); c.fillStyle = OUT; c.fill();
  c.beginPath(); c.moveTo(106, 14); c.quadraticCurveTo(70, 22 + sn * 4, 46 - sn * 10, 20 + sn * 2); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke();
  if (sn > 0) { c.fillStyle = '#f6f1e4'; for (let k = 0; k < 4; k++) { const tx = 54 + k * 14; c.beginPath(); c.moveTo(tx, 16); c.lineTo(tx + 5, 16 + 10 * sn); c.lineTo(tx + 10, 16); c.closePath(); c.fill(); c.lineWidth = 1.5; c.stroke(); }
    line(c, [70, -6, 86, 2], 2.5, shade(C, -.45)); line(c, [64, -2, 78, 8], 2.5, shade(C, -.45)); }
  wolfEye(c, 26, -16, o);
  line(c, [8, -30, 40, -28], 3, shade(C, -.45)); // brow ridge
  aShape(c, () => { c.beginPath(); c.moveTo(-38, -28); c.lineTo(-30, -92); c.lineTo(-2, -38); c.closePath(); }, C, { light: () => { c.fillStyle = WOLF.dark; c.beginPath(); c.moveTo(-36, -40); c.lineTo(-30, -86); c.lineTo(-12, -40); c.fill(); } });
  c.restore();
  c.restore();
}
// eyes only, shining out of the dark (for a "something is watching" shot); x, y = between the eyes, size in world units
function wolfEyesInDark(c, x, y, k = 1, size = 1) {
  for (const dx of [-24, 24]) { bloom(c, x + dx * size, y, 70 * size, '255,210,80', .55 * k); c.save(); c.translate(x + dx * size, y); c.scale(size, size); c.globalAlpha = k;
    c.beginPath(); c.moveTo(-13, 2); c.quadraticCurveTo(0, -10, 13, -2); c.quadraticCurveTo(0, 8, -13, 2); c.closePath(); c.fillStyle = '#ffe27a'; c.fill(); circle(c, 1, -1, 3.5); c.fillStyle = '#3a2a10'; c.fill(); c.restore(); }
}
