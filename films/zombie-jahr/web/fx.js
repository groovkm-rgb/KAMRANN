// fx.js — 2D inserts and small FX drawn on cards (design space 600x1000). All text German.
const CK = '#1a1416';
const rr = (g, x, y, w, h, r, fill, stroke = 0, sc = CK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = stroke; g.strokeStyle = sc; g.stroke(); } };
const tx = (g, s, x, y, size, col = CK, align = 'center', weight = 'bold') => { g.font = `${weight} ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
const circ = (g, x, y, r, fill, stroke = 0) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = stroke; g.strokeStyle = CK; g.stroke(); } };
const wrap = (g, s, x, y, maxW, size, lh, col, align = 'left') => { g.font = `bold ${size}px "DejaVu Sans", Arial`; const words = s.split(' '); let line = '', yy = y; for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { tx(g, line, x, yy, size, col, align); line = w; yy += lh; } else line = t; } if (line) tx(g, line, x, yy, size, col, align); return yy; };

/** big hand-held phone, centred at (300, 500). mode: calls | alert | call | chat | nonet | oldchat ; t = 0..1 progress inside the mode */
export const phone = (p, mode, t = 0, o = {}) => {
  const g = p.g, X = 120, Y = 110, W = 360, H = 760;
  g.save(); if (o.shake) g.translate(o.shake, 0);
  // hand behind
  rr(g, X - 40, Y + 420, 120, 300, 60, '#fbfaf7', 9);
  rr(g, X, Y, W, H, 56, '#1f1f28', 10);
  const sx = X + 22, sy = Y + 30, sw = W - 44, sh = H - 60;
  const dim = mode === 'oldchat';
  const scr = mode === 'alert' ? '#20283a' : mode === 'nonet' ? '#1a1e2a' : dim ? '#1a2238' : '#2a3a6a';
  rr(g, sx, sy, sw, sh, 36, scr);
  g.save(); g.beginPath(); g.roundRect(sx, sy, sw, sh, 36); g.clip();
  if (mode !== 'nonet' && mode !== 'oldchat') { const gr = g.createLinearGradient(0, sy, 0, sy + sh); gr.addColorStop(0, '#4a6ad0'); gr.addColorStop(1, '#a05ac0'); g.fillStyle = gr; g.fillRect(sx, sy, sw, sh); }
  // status bar
  tx(g, o.time || '07:12', sx + 30, sy + 30, 22, '#ffffff', 'left');
  const noNet = mode === 'nonet' || dim;
  for (let k = 0; k < 4; k++) g.fillStyle = noNet ? 'rgba(255,255,255,.25)' : '#ffffff', g.fillRect(sx + sw - 110 + k * 12, sy + 38 - k * 6, 8, 6 + k * 6);
  if (noNet) { g.strokeStyle = '#ff5a4a'; g.lineWidth = 5; g.beginPath(); g.moveTo(sx + sw - 114, sy + 16); g.lineTo(sx + sw - 64, sy + 44); g.stroke(); }
  rr(g, sx + sw - 54, sy + 22, 36, 18, 4, null, 3, '#ffffff'); g.fillStyle = dim ? '#ff5a4a' : '#7ae07a'; g.fillRect(sx + sw - 51, sy + 25, dim ? 6 : 26, 12);
  if (mode === 'calls' || mode === 'alert') {
    tx(g, '07:12', 300, sy + 150, 86, '#ffffff'); tx(g, 'Montag', 300, sy + 215, 28, 'rgba(255,255,255,.85)', 'center', 'normal');
    const k = mode === 'calls' ? Math.min(1, t * 4) : 1;
    g.globalAlpha = k; rr(g, sx + 16, sy + 270, sw - 32, 150, 22, 'rgba(255,255,255,.92)');
    circ(g, sx + 62, sy + 330, 28, '#e83a3a'); tx(g, '✆', sx + 62, sy + 332, 32, '#ffffff');
    tx(g, 'Mama', sx + 104, sy + 312, 30, '#1a1a2a', 'left'); tx(g, '47 verpasste Anrufe', sx + 104, sy + 354, 23, '#c02a2a', 'left');
    tx(g, 'jetzt', sx + sw - 34, sy + 300, 18, '#666', 'right', 'normal');
    for (let i = 0; i < 3; i++) rr(g, sx + 26 + i * 6, sy + 432 + i * 14, sw - 52 - i * 12, 12, 6, 'rgba(255,255,255,.55)');
    g.globalAlpha = 1;
  }
  if (mode === 'alert') { // emergency warning slides down
    const e = 1 - (1 - Math.min(1, t * 3)) ** 3, y0 = sy + 40 - 480 * (1 - e);
    rr(g, sx + 10, y0 + 30, sw - 20, 430, 26, '#fff4e8', 4, '#e8402a');
    rr(g, sx + 10, y0 + 30, sw - 20, 82, 26, '#e8402a');
    g.fillStyle = '#e8402a'; g.fillRect(sx + 10, y0 + 80, sw - 20, 32);
    tx(g, '⚠  NOTFALL-WARNUNG', 300, y0 + 74, 26, '#ffffff');
    wrap(g, 'Bleiben Sie zu Hause.', sx + 34, y0 + 160, sw - 60, 30, 40, '#1a1a1a');
    wrap(g, 'Öffnen Sie niemandem die Tür.', sx + 34, y0 + 250, sw - 60, 30, 40, '#1a1a1a');
    tx(g, 'Behörde für Katastrophenschutz', 300, y0 + 410, 15, '#7a5a50', 'center', 'normal');
  }
  if (mode === 'call') {
    circ(g, 300, sy + 230, 92, '#f2c0c8', 6); tx(g, '♥', 300, sy + 236, 90, '#e83a5a');
    tx(g, 'Mama', 300, sy + 380, 48, '#ffffff');
    for (let i = 0; i < 3; i++) { const on = ((t * 9) | 0) % 2 === 0; circ(g, 250 + i * 50, sy + 450, 9, on ? '#ffffff' : 'rgba(255,255,255,.3)'); }
    circ(g, 300, sy + sh - 110, 52, '#e83a3a'); g.save(); g.translate(300, sy + sh - 108); g.rotate(2.36); tx(g, '✆', 0, 0, 54, '#ffffff'); g.restore();
  }
  if (mode === 'chat' || mode === 'oldchat') {
    g.fillStyle = dim ? 'rgba(10,14,30,.9)' : 'rgba(255,255,255,.12)'; g.fillRect(sx, sy + 60, sw, sh);
    rr(g, sx, sy + 60, sw, 80, 0, dim ? '#2a3050' : '#3a4a8a'); circ(g, sx + 56, sy + 100, 26, '#f2c0c8'); tx(g, '♥', sx + 56, sy + 102, 28, '#e83a5a'); tx(g, 'Mama', sx + 96, sy + 100, 30, '#ffffff', 'left');
    const n = o.n ?? 2, typing = o.typing;
    let y = sy + 180;
    const bubble = (s, right, size = 26) => { g.font = `bold ${size}px "DejaVu Sans", Arial`; const lines = []; let line = ''; for (const w of s.split(' ')) { const tt = line ? line + ' ' + w : w; if (g.measureText(tt).width > sw - 110 && line) { lines.push(line); line = w; } else line = tt; } lines.push(line);
      const bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 40, bh = lines.length * 36 + 26, bx = right ? sx + sw - 16 - bw : sx + 16;
      rr(g, bx, y, bw, bh, 22, right ? '#4aa0f0' : '#f2f2f6'); lines.forEach((l, i) => tx(g, l, bx + 20, y + 30 + i * 36, size, right ? '#ffffff' : '#1a1a2a', 'left')); y += bh + 18; };
    if (dim) { bubble('Mir geht’s gut. Ich bleib drin.', true); bubble('Hast du genug zu essen?', false); tx(g, 'Kein Netz', 300, sy + sh - 50, 22, 'rgba(255,255,255,.45)'); }
    else { if (n >= 1) bubble('Mir geht’s gut. Ich bleib drin.', true); if (n >= 2) bubble('Hast du genug zu essen?', false);
      if (typing) { rr(g, sx + 16, y, 110, 52, 22, '#f2f2f6'); for (let i = 0; i < 3; i++) circ(g, sx + 46 + i * 26, y + 26, 8, ((t * 12 | 0) % 3) === i ? '#555' : '#aaa'); } }
  }
  if (mode === 'nonet') {
    g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(300, sy + 330, 50 + k * 50, Math.PI * 1.22, Math.PI * 1.78); g.globalAlpha = 0.35; g.stroke(); }
    g.globalAlpha = 1; circ(g, 300, sy + 330, 14, '#ffffff');
    g.strokeStyle = '#ff4a3a'; g.lineWidth = 16; g.beginPath(); g.moveTo(170, sy + 160); g.lineTo(430, sy + 380); g.stroke();
    tx(g, 'Kein Netz', 300, sy + 470, 44, '#ffffff'); tx(g, 'WLAN nicht verfügbar', 300, sy + 530, 22, 'rgba(255,255,255,.6)', 'center', 'normal');
  }
  g.restore(); g.restore();
  // thumb over the edge
  circ(p.g, X + 6 + (o.shake || 0), Y + 520, 30, '#fbfaf7', 8);
};

export const heart = (p, k = 1) => { const g = p.g; g.save(); g.translate(300, 500); g.scale(k, k); g.beginPath(); g.moveTo(0, 60); g.bezierCurveTo(-120, -20, -60, -110, 0, -50); g.bezierCurveTo(60, -110, 120, -20, 0, 60); g.closePath(); g.fillStyle = '#e8303a'; g.fill(); g.lineWidth = 12; g.strokeStyle = CK; g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-36, -40, 16, 10, -0.6, 0, 7); g.fill(); g.restore(); };
export const drop = (p, col = '#8fd0ff') => { const g = p.g; g.beginPath(); g.moveTo(300, 380); g.quadraticCurveTo(360, 500, 300, 540); g.quadraticCurveTo(240, 500, 300, 380); g.fillStyle = col; g.fill(); g.lineWidth = 10; g.strokeStyle = CK; g.stroke(); };
export const moan = (p, t) => { const g = p.g; g.strokeStyle = CK; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { const y = 380 + k * 90, a = 1 - Math.abs(((t + k * 0.33) % 1) - 0.5) * 2; g.globalAlpha = a; g.lineWidth = 14; g.beginPath(); for (let x = 0; x <= 360; x += 12) { const yy = y + Math.sin(x * 0.06 + t * 12 + k) * 22; x ? g.lineTo(120 + x, yy) : g.moveTo(120 + x, yy); } g.stroke(); } g.globalAlpha = 1; };
export const bird = (p, flap = 0, col = CK) => { const g = p.g, w = 20 + 60 * Math.abs(Math.sin(flap)); g.strokeStyle = col; g.lineWidth = 22; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(140, 500 - w); g.quadraticCurveTo(220, 480, 300, 540); g.quadraticCurveTo(380, 480, 460, 500 - w); g.stroke(); };
export const roundBird = (p, t = 0) => { const g = p.g; g.save(); g.translate(300, 600); g.rotate(Math.sin(t * 6) * 0.08);
  g.beginPath(); g.ellipse(0, 0, 150, 120, 0, 0, 7); g.fillStyle = '#5aa8e8'; g.fill(); g.lineWidth = 14; g.strokeStyle = CK; g.stroke();
  g.beginPath(); g.ellipse(-30, 30, 80, 60, 0.3, 0, 7); g.fillStyle = '#3a88c8'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(130, -20); g.lineTo(200, 0); g.lineTo(130, 20); g.closePath(); g.fillStyle = '#f2b030'; g.fill(); g.stroke();
  g.beginPath(); g.arc(70, -30, 20, 0, 7); g.fillStyle = '#fff'; g.fill(); g.stroke(); g.beginPath(); g.arc(76, -30, 9, 0, 7); g.fillStyle = CK; g.fill(); g.restore(); };
export const sweat = (p) => { const g = p.g; for (const [x, y, k] of [[200, 420, 1], [420, 380, 0.8]]) { g.save(); g.translate(x - 300 * k, y - 460 * k); g.scale(k, k); drop(p, '#bfe8ff'); g.restore(); } };
export const flame = (p, t) => { const g = p.g; const f = (s, c, w) => { g.beginPath(); g.moveTo(300 - w, 700); g.quadraticCurveTo(300 - w * 1.2, 520 - s * 40, 300 + Math.sin(t * 9) * 20, 400 - s * 60); g.quadraticCurveTo(300 + w * 1.2, 520 - s * 40, 300 + w, 700); g.closePath(); g.fillStyle = c; g.fill(); };
  f(1 + Math.sin(t * 7) * 0.2, '#ff7a20', 120); f(0.5 + Math.sin(t * 11) * 0.2, '#ffc040', 80); f(0, '#fff2a0', 40); };
export const zzz = (p, t) => { for (let k = 0; k < 3; k++) { const u = (t + k / 3) % 1; p.g.globalAlpha = Math.sin(u * Math.PI); tx(p.g, 'z', 250 + k * 60 + u * 40, 600 - u * 300 - k * 40, 90 + k * 20, CK); } p.g.globalAlpha = 1; };
export const speed = (p, dir = 1) => { const g = p.g; g.strokeStyle = 'rgba(26,20,22,.8)'; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { g.lineWidth = 10; g.beginPath(); const y = 300 + k * 90; g.moveTo(300 - dir * (60 + (k % 2) * 40), y); g.lineTo(300 - dir * (260 + (k % 3) * 30), y); g.stroke(); } };
/** whole-screen weather overlay (rain | snow), deterministic per frame */
export const weather = (p, kind, f) => { const g = p.g; let s = 1234; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  if (kind === 'rain') { g.strokeStyle = 'rgba(210,225,255,.75)'; g.lineWidth = 4; for (let i = 0; i < 140; i++) { const x = r() * 700 - 50, y = ((r() * 1100 + f * 55) % 1100) - 50; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 60); g.stroke(); } }
  else { for (let i = 0; i < 120; i++) { const x0 = r() * 640 - 20, sp = 2 + r() * 4, rad = 3 + r() * 7, y = ((r() * 1100 + f * sp) % 1100) - 50, x = x0 + Math.sin(f * 0.05 + i) * 14; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); } } };

// ---------- inventory items (bottom centre at 300, 975) ----------
export const item = (p, kind, o = {}) => { const g = p.g; g.save(); g.lineJoin = 'round';
  const ink = 10;
  if (kind === 'nudeln') { for (let k = 0; k < 3; k++) { const x = 120 + k * 120; rr(g, x, 560 + (k % 2) * 20, 140, 400, 14, o.empty ? '#d8c890' : '#f2d23a', ink); rr(g, x + 14, 640, 112, 120, 50, '#fff8d8', 6); for (let i = 0; i < 5; i++) { g.strokeStyle = '#d8a030'; g.lineWidth = 8; g.beginPath(); g.moveTo(x + 30, 660 + i * 20); g.lineTo(x + 110, 650 + i * 20); g.stroke(); } tx(g, 'Nudeln', x + 70, 820, 30, '#2a4aa0'); if (o.empty) { g.fillStyle = 'rgba(80,60,40,.25)'; g.fillRect(x, 560, 140, 60); } } }
  if (kind === 'brot') { g.beginPath(); g.moveTo(120, 960); g.quadraticCurveTo(120, 640, 300, 640); g.lineTo(480, 660); g.lineTo(480, 960); g.closePath(); g.fillStyle = '#d89a4a'; g.fill(); g.lineWidth = ink; g.strokeStyle = CK; g.stroke();
    g.beginPath(); g.ellipse(480, 810, 30, 150, 0, 0, 7); g.fillStyle = '#f2e0b0'; g.fill(); g.stroke(); for (const [x, y, r_] of [[200, 760, 38], [300, 700, 26], [350, 860, 44], [250, 900, 22], [470, 760, 18]]) { g.beginPath(); g.arc(x, y, r_, 0, 7); g.fillStyle = '#7ab040'; g.fill(); g.lineWidth = 4; g.stroke(); } }
  if (kind === 'ketchup') { g.beginPath(); g.moveTo(230, 960); g.lineTo(220, 560); g.quadraticCurveTo(230, 480, 280, 470); g.lineTo(280, 400); g.lineTo(320, 400); g.lineTo(320, 470); g.quadraticCurveTo(370, 480, 380, 560); g.lineTo(370, 960); g.closePath(); g.fillStyle = '#d82a2a'; g.fill(); g.lineWidth = ink; g.strokeStyle = CK; g.stroke(); rr(g, 270, 360, 60, 50, 8, '#f4f4f0', 7); rr(g, 228, 640, 144, 180, 14, '#fff8e8', 6); tx(g, 'Ketchup', 300, 730, 30, '#c02a2a'); }
  if (kind === 'mais') { rr(g, 180, 620, 240, 340, 18, '#c8ccd4', ink); rr(g, 180, 680, 240, 220, 0, '#f2d23a', 6); tx(g, 'Mais', 300, 790, 56, '#2a7a2a'); g.beginPath(); g.ellipse(300, 620, 120, 26, 0, 0, 7); g.fillStyle = '#e0e4ea'; g.fill(); g.lineWidth = 8; g.stroke(); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(120,110,90,.4)'; g.beginPath(); g.arc(200 + i * 38, 650 + (i % 2) * 12, 10, 0, 7); g.fill(); } }
  if (kind === 'gummy') { g.beginPath(); g.moveTo(170, 960); g.lineTo(150, 560); g.lineTo(450, 560); g.lineTo(430, 960); g.closePath(); g.fillStyle = '#f2d23a'; g.fill(); g.lineWidth = ink; g.strokeStyle = CK; g.stroke(); rr(g, 150, 540, 300, 40, 8, '#e8402a', 8); tx(g, 'Gummi-', 300, 650, 46, '#d0302a'); tx(g, 'bärchen', 300, 705, 46, '#d0302a');
    for (const [x, y, c] of [[220, 820, '#e0303a'], [300, 840, '#3ab04a'], [380, 820, '#f08a2a'], [260, 900, '#f2f2f2'], [340, 900, '#e0303a']]) { g.beginPath(); g.ellipse(x, y, 26, 34, 0, 0, 7); g.fillStyle = c; g.fill(); g.lineWidth = 5; g.stroke(); g.beginPath(); g.arc(x, y - 36, 18, 0, 7); g.fill(); g.stroke(); } }
  if (kind === 'cans') { const kinds = [['Ravioli', '#d84a2a'], ['Pfirsiche', '#f0a030'], ['Linsen', '#6a8a3a'], ['Ravioli', '#d84a2a']]; let i = 0;
    for (const [row, cnt] of [[0, 4], [1, 3], [2, 2], [3, 1]]) for (let k = 0; k < cnt; k++) { const x = 300 + (k - (cnt - 1) / 2) * 120, y = 960 - row * 150; rr(g, x - 54, y - 140, 108, 140, 8, '#c8ccd4', 7); rr(g, x - 54, y - 116, 108, 90, 0, kinds[i % 4][1], 4); tx(g, kinds[i % 4][0], x, y - 72, 20, '#fff8e8'); i++; } }
  if (kind === 'tp') { for (const [x, y] of [[200, 960], [330, 960], [460, 960], [265, 830], [395, 830], [330, 700]]) { rr(g, x - 60, y - 130, 120, 130, 14, '#ffffff', 8); g.beginPath(); g.ellipse(x, y - 65, 22, 30, 0, 0, 7); g.fillStyle = '#d8d0c0'; g.fill(); g.stroke(); } }
  if (kind === 'cakecan') { rr(g, 200, 700, 200, 260, 14, '#c8ccd4', ink); rr(g, 200, 740, 200, 170, 0, '#d84a2a', 6); tx(g, 'Ravioli', 300, 825, 40, '#fff8e8'); g.beginPath(); g.ellipse(300, 700, 100, 22, 0, 0, 7); g.fillStyle = '#e0e4ea'; g.fill(); g.lineWidth = 8; g.stroke();
    rr(g, 288, 520, 24, 180, 8, '#f4f0e0', 6); const fl = o.t || 0; g.beginPath(); g.moveTo(300, 420 + Math.sin(fl * 9) * 8); g.quadraticCurveTo(340, 490, 300, 515); g.quadraticCurveTo(260, 490, 300, 420 + Math.sin(fl * 9) * 8); g.fillStyle = '#ffc040'; g.fill(); g.lineWidth = 5; g.stroke(); }
  if (kind === 'billy') { rr(g, 80, 880, 440, 70, 10, '#f2efe6', ink); tx(g, 'BILLY', 300, 916, 40, '#555'); }
  if (kind === 'deskbox') { rr(g, 30, 640, 540, 330, 12, '#c89a62', ink); rr(g, 60, 680, 480, 90, 10, '#2e5a9a', 6); for (let i = 0; i < 9; i++) circ(g, 90 + i * 52, 725, 12, i % 2 ? '#f2c43a' : '#ffffff'); }
  g.restore(); };
/** the scooter kid's scooter (drawn under the kid card) */
export const scooter = (p) => { const g = p.g; g.lineCap = 'round'; g.strokeStyle = CK; g.lineWidth = 22; g.beginPath(); g.moveTo(140, 940); g.lineTo(470, 940); g.moveTo(450, 940); g.lineTo(420, 560); g.moveTo(370, 560); g.lineTo(480, 560); g.stroke(); g.strokeStyle = '#3ad0a0'; g.lineWidth = 10; g.beginPath(); g.moveTo(140, 940); g.lineTo(470, 940); g.moveTo(450, 940); g.lineTo(420, 560); g.stroke(); circ(g, 160, 955, 26, '#2a2a32', 8); circ(g, 460, 955, 26, '#2a2a32', 8); };
