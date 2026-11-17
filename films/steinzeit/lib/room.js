// MODERN BEDROOM (world: floor y = 0, 1 m ≈ 220). roomSet(c, cam, t, { tod: 'night' | 'morning', horse: 0..1 (cave-art horse in the window) })
// props: bedFront(c, t, o) (duvet over a lying Noah, draw in `front`), phoneOnStand(c, x, t, { glow, buzz })
const RM = { wall: '#d9d2c6', wall2: '#cbc3b5', floor: '#a8835e', floor2: '#8f6c4a', bed: '#6f7c8c', duvet: '#e8e3da', duvetS: '#c9c2b6', pillow: '#f4f1ea', wood: '#9a7652' };
function roomSet(c, cam, t, o = {}) {
  const night = o.tod === 'night';
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = night ? '#1a1d2a' : RM.wall; c.fillRect(0, 0, W, H);
  layer(c, cam, .9, c => {
    // wall with subtle texture
    const g = c.createLinearGradient(0, -900, 0, 0); g.addColorStop(0, night ? '#2a2d3e' : '#e4ddd0'); g.addColorStop(1, night ? '#1e2030' : RM.wall2); c.fillStyle = g; c.fillRect(-3000, -1600, 6000, 1650);
    // skirting
    c.fillStyle = night ? '#2a2a34' : '#efebe4'; c.fillRect(-3000, -40, 6000, 44);
    // window with curtains
    const wx = 380, wy = -760, ww = 520, wh = 470;
    const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, night ? '#0e1630' : '#9cc6e8'); sky.addColorStop(1, night ? '#24305a' : '#f4e2c4'); c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
    // houses / tree outside
    c.fillStyle = night ? '#121726' : '#b9c3c8'; for (let i = 0; i < 5; i++) { const hx = wx + i * 110, hh = 120 + rnd(i + 7) * 120; c.fillRect(hx, wy + wh - hh, 90, hh); if (night) for (let j = 0; j < 3; j++) { c.fillStyle = rnd(i * 5 + j) > .5 ? 'rgba(255,210,120,.8)' : 'rgba(0,0,0,0)'; c.fillRect(hx + 14 + (j % 2) * 40, wy + wh - hh + 20 + j * 34, 18, 18); c.fillStyle = '#121726'; } }
    if (o.horse) { c.save(); c.globalAlpha = o.horse; c.translate(wx + ww * .55, wy + wh * .55); c.scale(1.2, 1.2); caveHorseSil(c); c.restore(); }
    c.lineWidth = 16; c.strokeStyle = night ? '#3a3c48' : '#f6f3ee'; c.strokeRect(wx, wy, ww, wh); line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 10, night ? '#3a3c48' : '#f6f3ee'); line(c, [wx, wy + wh / 2, wx + ww, wy + wh / 2], 10, night ? '#3a3c48' : '#f6f3ee');
    c.fillStyle = night ? '#3a3c48' : '#f6f3ee'; c.fillRect(wx - 30, wy + wh, ww + 60, 24);
    for (const s of [-1, 1]) { const cx = s < 0 ? wx - 70 : wx + ww + 10; c.beginPath(); c.moveTo(cx, wy - 60); c.lineTo(cx + 60, wy - 60); for (let i = 0; i <= 6; i++) c.lineTo(cx + 60 - (i % 2) * 14, wy - 60 + i * 110); c.lineTo(cx, wy + 600); c.closePath(); c.fillStyle = night ? '#3a3050' : '#c86a4a'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.25)'; c.stroke(); }
    line(c, [wx - 100, wy - 64, wx + ww + 100, wy - 64], 8, night ? '#4a4a55' : '#8a8a90');
    // poster + shelf
    c.save(); c.translate(-720, -720); c.fillStyle = night ? '#2c2c40' : '#3a5a7a'; c.fillRect(0, 0, 260, 340); c.fillStyle = night ? '#4a4258' : '#f2c14e'; c.beginPath(); c.arc(130, 130, 70, 0, Math.PI * 2); c.fill(); c.fillStyle = night ? '#3a3448' : '#e8e2d4'; c.fillRect(30, 250, 200, 16); c.fillRect(30, 280, 140, 12); c.restore();
    c.fillStyle = night ? '#3a3640' : RM.wood; c.fillRect(-420, -620, 300, 18); for (let i = 0; i < 6; i++) { c.fillStyle = ['#c84a3a', '#3a6a9a', '#e0b040', '#4a8a5a', '#8a5aa0', '#d0d0d0'][i]; if (night) c.fillStyle = shadeHex(c.fillStyle, -.6); c.fillRect(-410 + i * 34, -700 + (i % 2) * 14, 26, 80 - (i % 2) * 14); }
  });
  layer(c, cam, 1, c => {
    const g = c.createLinearGradient(0, -40, 0, 600); g.addColorStop(0, night ? '#2a2420' : RM.floor); g.addColorStop(1, night ? '#16120f' : RM.floor2); c.fillStyle = g; c.fillRect(-3000, -40, 6000, 1200);
    for (let i = 0; i < 18; i++) line(c, [-3000, -40 + i * 40 + i * i * 3, 3000, -40 + i * 40 + i * i * 3], 2, 'rgba(60,40,25,.25)');
    // rug
    ell(c, 0, 80, 700, 90); c.fillStyle = night ? '#2a2638' : '#6a8a9a'; c.fill();
  });
  return { base: night ? '#1a1d2a' : RM.wall };
}
function caveHorseSil(c) {
  c.lineCap = 'round'; c.lineWidth = 6; c.strokeStyle = 'rgba(70,40,30,.85)'; c.fillStyle = 'rgba(160,70,40,.35)';
  c.beginPath(); c.moveTo(-70, 0); c.bezierCurveTo(-60, -40, 30, -45, 60, -30); c.quadraticCurveTo(85, -60, 108, -78); c.quadraticCurveTo(128, -70, 120, -50); c.quadraticCurveTo(100, -32, 92, -8); c.quadraticCurveTo(70, 30, 30, 26); c.lineTo(-40, 28); c.quadraticCurveTo(-75, 20, -70, 0); c.fill(); c.stroke();
  for (const lx of [-50, -30, 40, 58]) { c.beginPath(); c.moveTo(lx, 24); c.lineTo(lx + (lx > 0 ? 6 : -4), 70); c.stroke(); }
}
// bed (headboard left), mattress top at y = -230. Noah's head lies at (x + 120, -300).
function bedBack(c, x, night) {
  rrect(c, x - 60, -620, 60, 620, 14); c.fillStyle = night ? '#3a3036' : RM.wood; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke();
  rrect(c, x - 20, -260, 1000, 120, 20); c.fillStyle = night ? '#2a2e3a' : RM.bed; c.fill();
  for (let i = 0; i < 4; i++) { rrect(c, x + 940 - (i ? 0 : 0), -150, 30, 150, 8); }
  c.fillStyle = night ? '#22242c' : '#5a4a3a'; c.fillRect(x - 10, -150, 26, 150); c.fillRect(x + 950, -150, 26, 150);
  rrect(c, x + 10, -350, 260, 110, 50); c.fillStyle = night ? '#5a5e70' : RM.pillow; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.2)'; c.stroke();
}
function bedFront(c, x, t, o = {}) {
  // duvet over the body; o.lift raises it (sitting up)
  const b = Math.sin(t * 1.4) * 4, night = o.night;
  c.beginPath(); c.moveTo(x + 210, -250 - b); c.bezierCurveTo(x + 420, -330 - b, x + 720, -320, x + 990, -290); c.lineTo(x + 1010, -110); c.quadraticCurveTo(x + 600, -80, x + 180, -120); c.closePath();
  const g = c.createLinearGradient(0, -330, 0, -100); g.addColorStop(0, night ? '#6a7088' : RM.duvet); g.addColorStop(1, night ? '#3a3e50' : RM.duvetS); c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(30,30,40,.5)'; c.stroke();
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + 330 + i * 160, -300); c.quadraticCurveTo(x + 360 + i * 160, -200, x + 340 + i * 150, -120); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.08)'; c.stroke(); }
}
function nightstand(c, x, t, o = {}) {
  const night = o.night;
  rrect(c, x - 110, -330, 220, 330, 10); c.fillStyle = night ? '#2e2a30' : RM.wood; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke();
  line(c, [x - 90, -220, x + 90, -220], 3, 'rgba(0,0,0,.3)'); circle(c, x, -270, 8); c.fillStyle = '#d8c8a8'; c.fill();
  // alarm clock
  rrect(c, x + 10, -420, 90, 90, 18); c.fillStyle = night ? '#3a3a44' : '#e6e2da'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a2a2a'; c.stroke();
  rrect(c, x + 20, -400, 70, 34, 6); c.fillStyle = '#121418'; c.fill();
  const on = o.alarm ? (Math.floor(t * 4) % 2 ? 1 : .35) : .8;
  c.fillStyle = `rgba(255,70,60,${on})`; c.font = `28px ${F_BODY}`; c.textAlign = 'center'; c.fillText('6:30', x + 55, -374);
  if (o.alarm) { bloom(c, x + 55, -390, 140, '255,80,60', .25 * on); }
  // phone
  if (!o.noPhone) phoneProp(c, x - 50, -334, t, o);
}
function phoneProp(c, x, y, t, o = {}) {
  const bz = o.buzz ? Math.sin(t * 90) * 4 : 0;
  c.save(); c.translate(x + bz, y);
  rrect(c, -38, -12, 76, 14, 5); c.fillStyle = '#1a1a1e'; c.fill();
  if (o.glow) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, -10, 0, 0, -10, 260); g.addColorStop(0, `rgba(150,190,255,${.55 * o.glow})`); g.addColorStop(1, 'rgba(150,190,255,0)'); c.fillStyle = g; c.fillRect(-260, -270, 520, 520); c.restore(); }
  c.restore();
}
