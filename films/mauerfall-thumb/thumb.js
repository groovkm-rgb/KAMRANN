// YouTube thumbnail (single frame)
function thumbText(c) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(900, 0, 1920, 0); g.addColorStop(0, 'rgba(10,14,30,0)'); g.addColorStop(.35, 'rgba(10,14,30,.55)'); g.addColorStop(1, 'rgba(10,14,30,.75)');
  c.fillStyle = g; c.fillRect(900, 0, 1020, 520);
  c.font = "900 210px 'DejaVu Sans Condensed','DejaVu Sans',sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const tx = 1400;
  [['MAUER', 170], ['AUF!', 365]].forEach(([s, y]) => {
    c.lineWidth = 34; c.strokeStyle = '#111'; c.strokeText(s, tx + 8, y + 10);
    c.lineWidth = 26; c.strokeStyle = '#d0201c'; c.strokeText(s, tx, y);
    c.fillStyle = '#fff8e8'; c.fillText(s, tx, y);
  });
  c.font = "700 64px 'DejaVu Sans Condensed','DejaVu Sans',sans-serif";
  c.lineWidth = 14; c.strokeStyle = '#111'; c.strokeText('9. November 1989', tx, 510);
  c.fillStyle = '#ffd34a'; c.fillText('9. November 1989', tx, 510);
  c.restore();
}
const TCAM = { x: 500, y: TOR_TOP - 330, z: .62 };
defineFilm({ shots: [{ name: 'thumb', dur: 2, f(lt, T, t) {
  const S = kTor(TCAM, 0.62, { night: true, crowd: { xs: [-500, -200, 100, 420, 760, 1100, 1450, 1800], hammer: false },
    near: c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(420, 700, 50, 420, 700, 700); g.addColorStop(0, 'rgba(255,200,130,.35)'); g.addColorStop(1, 'rgba(255,200,130,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.setTransform(2.5, 0, 0, 2.5, 430, 1330); NF(c, 0, 0, { noShadow: true, expr: { browUp: 1, mouth: 'o', open: .9, look: .25 }, tilt: -.1 }, 0); c.restore(); } });
  S.screen.push(c => thumbText(c)); S.vignette = .22; return S; } }] });
