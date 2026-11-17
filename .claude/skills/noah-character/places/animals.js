// ANIMALS for Noah films. Side view, facing right (s = -1 faces left), feet on y = 0, toon style (flat fills + OUT outline).
//   rabbit(c, x, { s, t, hop })  deer(c, x, { s, t, walk })  dog(c, x, { s, t, walk, color })
//   bird(c, x, y, { s, t, color })  mammoth(c, x, { s, t, walk })
function aLeg(c, x0, y0, x1, y1, w, col) { line(c, [x0, y0, x1, y1], w + 14); line(c, [x0, y0, x1, y1], w, col); }
function aEye(c, x, y, r = 9) { circle(c, x, y, r); fs(c, OUT); circle(c, x + r * .35, y - r * .35, r * .35); fs(c, '#fff'); }
function rabbit(c, x, o = {}) {
  const t = o.t || 0, hop = o.hop ? Math.abs(Math.sin(t * 6)) * 60 : 0;
  c.save(); c.translate(x, -hop); c.scale(o.s || 1, 1);
  ell(c, -10, -60, 70, 52); fs(c, '#d9cbb8', 7); circle(c, -78, -70, 22); fs(c, '#fff', 6);
  for (const dx of [-14, 14]) { ell(c, 52 + dx * .4, -168, 13, 50, .15 + dx * .01); fs(c, '#d9cbb8', 6); ell(c, 52 + dx * .4, -166, 6, 36, .15); fs(c, '#f0b8b8'); }
  circle(c, 50, -105, 42); fs(c, '#d9cbb8', 7); aEye(c, 66, -112, 7); circle(c, 90, -98, 6); fs(c, '#e88a9a');
  ell(c, 20, -8, 30, 12); fs(c, '#cbbca8', 6); ell(c, -40, -8, 36, 12); fs(c, '#cbbca8', 6);
  c.restore();
}
function deer(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 7 : 0, sw = o.walk ? Math.sin(ph) * .35 : 0;
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1);
  const body = '#b07040', belly = '#e8cfa8';
  aLeg(c, -110, -300, -110 - sw * 120, 0, 20, shade(body, -.15)); aLeg(c, 120, -300, 120 + sw * 120, 0, 20, shade(body, -.15));
  ell(c, 0, -360, 190, 95); fs(c, body, 8); ell(c, 10, -315, 130, 40); fs(c, belly);
  for (let i = 0; i < 6; i++) { circle(c, -110 + i * 42, -400 + (i % 2) * 22, 9); fs(c, '#f2e2c4'); }
  ell(c, -188, -400, 22, 32, -.5); fs(c, belly, 6);
  aLeg(c, -90, -300, -90 + sw * 120, 0, 22, body); aLeg(c, 140, -300, 140 - sw * 120, 0, 22, body);
  c.beginPath(); c.moveTo(90, -430); c.quadraticCurveTo(150, -520, 180, -620); c.lineTo(270, -600); c.quadraticCurveTo(240, -470, 220, -370); c.closePath(); fs(c, body, 8);
  ell(c, 245, -640, 70, 48, .3); fs(c, body, 8); ell(c, 300, -615, 26, 22); fs(c, '#3a2a22', 5);
  ell(c, 195, -700, 18, 38, -.6); fs(c, body, 6); aEye(c, 245, -655, 10);
  for (const dx of [0, 34]) { const bx = 225 + dx; line(c, [bx, -680, bx - 20, -820], 14); line(c, [bx, -680, bx - 20, -820], 7, '#e8dcc0'); line(c, [bx - 12, -760, bx + 25, -800], 12); line(c, [bx - 12, -760, bx + 25, -800], 6, '#e8dcc0'); line(c, [bx - 18, -800, bx - 55, -840], 12); line(c, [bx - 18, -800, bx - 55, -840], 6, '#e8dcc0'); }
  c.restore();
}
function dog(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 10 : 0, sw = o.walk ? Math.sin(ph) * .4 : 0, col = o.color || '#c98a4a';
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1);
  aLeg(c, -70, -110, -70 - sw * 60, 0, 22, shade(col, -.15)); aLeg(c, 70, -110, 70 + sw * 60, 0, 22, shade(col, -.15));
  const wag = Math.sin(t * 14) * .4;
  c.save(); c.translate(-105, -150); c.rotate(-.6 + wag); rrect(c, -10, -80, 24, 85, 12); fs(c, col, 6); c.restore();
  ell(c, 0, -150, 120, 58); fs(c, col, 7); ell(c, 10, -118, 80, 22); fs(c, '#f2e2c8');
  aLeg(c, -55, -110, -55 + sw * 60, 0, 24, col); aLeg(c, 85, -110, 85 - sw * 60, 0, 24, col);
  circle(c, 120, -230, 62); fs(c, col, 7); ell(c, 178, -212, 40, 28); fs(c, '#f2e2c8', 6); circle(c, 214, -222, 11); fs(c, OUT);
  ell(c, 96, -232, 26, 52, .35); fs(c, shade(col, -.3), 6); aEye(c, 140, -246, 9);
  line(c, [168, -192, 196, -194], 5); c.beginPath(); c.rect(80, -184, 80, 18); fs(c, '#d9473a', 5);
  c.restore();
}
function bird(c, x, y, o = {}) {
  const t = o.t || 0, flap = Math.sin(t * 22), col = o.color || '#4f86c6';
  c.save(); c.translate(x, y); c.scale(o.s || 1, 1);
  ell(c, 0, 0, 40, 30); fs(c, col, 6); ell(c, 8, 8, 24, 16); fs(c, '#f2e6c8');
  c.beginPath(); c.moveTo(-36, -4); c.lineTo(-70, -16); c.lineTo(-62, 10); c.closePath(); fs(c, col, 5);
  c.beginPath(); c.moveTo(-10, -10); c.quadraticCurveTo(-20, -60 * flap, 20, -50 * flap - 6); c.quadraticCurveTo(14, -18, 10, -6); c.closePath(); fs(c, shade(col, -.2), 5);
  c.beginPath(); c.moveTo(36, -6); c.lineTo(60, 2); c.lineTo(36, 8); c.closePath(); fs(c, '#f2b531', 4); aEye(c, 22, -8, 6);
  c.restore();
}
function mammoth(c, x, o = {}) {
  const t = o.t || 0, ph = o.walk ? t * 4 : 0, sw = o.walk ? Math.sin(ph) * .2 : 0;
  const fur = '#7a4f34', dark = '#5a3624';
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1);
  for (const [lx, k] of [[-210, -1], [150, 1]]) { c.beginPath(); c.rect(lx - 50 - sw * 60 * k, -330, 110, 330); fs(c, dark, 8); }
  c.beginPath(); c.moveTo(-330, -260); c.quadraticCurveTo(-360, -700, -60, -820); c.quadraticCurveTo(200, -880, 300, -650); c.quadraticCurveTo(360, -420, 280, -260); c.closePath(); fs(c, fur, 9);
  for (let i = 0; i < 12; i++) { const px = -300 + i * 52; line(c, [px, -300 - (i % 3) * 30, px + 6, -230], 7, dark); }
  for (const [lx, k] of [[-170, 1], [200, -1]]) { c.beginPath(); c.rect(lx - 55 - sw * 60 * k, -330, 120, 330); fs(c, fur, 8); for (let j = 0; j < 3; j++) line(c, [lx - 40 + j * 35, -40, lx - 40 + j * 35, 0], 5, dark); }
  circle(c, 290, -620, 150); fs(c, fur, 9); ell(c, 330, -770, 70, 40); fs(c, dark, 6);
  c.beginPath(); c.moveTo(370, -560); c.quadraticCurveTo(460, -420, 420, -220); c.quadraticCurveTo(410, -170, 450, -160); c.lineTo(455, -130); c.quadraticCurveTo(360, -150, 375, -230); c.quadraticCurveTo(400, -400, 320, -520); c.closePath(); fs(c, fur, 8);
  c.beginPath(); c.moveTo(330, -480); c.quadraticCurveTo(520, -380, 560, -560); c.quadraticCurveTo(540, -420, 340, -440); c.closePath(); fs(c, '#f2ead6', 7);
  ell(c, 210, -640, 60, 90, -.2); fs(c, dark, 7); aEye(c, 345, -650, 11);
  c.restore();
}
