// YouTube thumbnails (1920x1080 render, saved as 1280x720): A = "KOMM ALLEIN." noir street, B = phone message + "NICHTS WIE IM FILM"
function bigText(c, s, x, y, size, o = {}) {
  c.save(); c.font = hudFont(size); c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  c.lineWidth = size * .2; c.strokeStyle = '#05060a'; c.strokeText(s, x, y);
  c.fillStyle = o.col || '#ffffff'; c.fillText(s, x, y); c.restore(); c.font = hudFont(size); return c.measureText(s).width;
}
function shotA(lt, T, t) {
  const v = S(150, -330, 1.25);
  return { set: rainStreet, setOpts: { lamps: [-700, 690, 1500], seed: 3 }, cam: v, vignette: .2,
    fx: [c => {
      silhouette(c, cc => drawPal(cc, { look: 'follower', x: 760, k: .25, outfit: 'agent', coat: true, hat: true, s: -1 }), '#07090f', { col: 'rgba(255,200,130,.95)', off: [[-4, -3]] });
      rainSplashes(c, 3.3, { x0: -400, x1: 1200, n: 70 });
    }],
    screen: [c => rainSheet(c, 3.3, { amount: 1.1, alpha: .4 }), c => noirGrade(c, 3.3, { vig: .55, grain: .3 }),
      c => { // Noah close in the foreground (left), eyes sliding toward the man
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(400, 1290); c.scale(1.45, 1.45);
        drawNoah(c, { x: 0, y: 0, k: .5, ink: 1.8, outfit: 'agent', coat: true, hat: true, expr: { lid: .12, look: .95, mouth: 'flat', browUp: .25 } });
        c.restore();
        c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(900, 300, 0, 900, 300, 700); g.addColorStop(0, 'rgba(255,60,60,.12)'); g.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
        bigText(c, 'KOMM', 760, 260, 200, { col: '#ffffff' });
        bigText(c, 'ALLEIN.', 760, 470, 200, { col: '#ff3b30' });
        c.save(); c.translate(785, 580); c.rotate(-.04); c.fillStyle = '#05060a'; c.fillRect(-12, -62, 600, 84); c.fillStyle = '#ffd34a'; c.fillRect(0, -52, 576, 64); hudText(c, '3 UHR NACHTS', 288, -2, 50, '#05060a', 'center'); c.restore();
      }] };
}
function shotB(lt, T, t) {
  return { set: (c, cam, tt) => { ceilingNightT(c, cam, tt); return { base: '#0c0f18' }; }, cam: S(0, 0, 1), vignette: .3,
    screen: [c => noirGrade(c, 1, { vig: .6, grain: .3 }),
      c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(430, 600); c.rotate(-.08); c.scale(.95, .95); phoneUI(c, -250, -470, 500, 1000, { mode: 'chat', words: 6, t: 1, glow: 2.2 });
        line(c, [120, 900, 150, 520], 170, OUT); line(c, [120, 900, 150, 520], 150, '#8fa3bf'); for (const d of [-40, 0, 40]) line(c, [120 + d, 900, 150 + d, 520], 10, '#c9d6e6'); drawNoahHand(c, 160, 470, 1.05, Math.PI * .92); c.restore(); },
      c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(1520, 1360); c.scale(1.55, 1.55); drawNoah(c, { x: 0, y: 0, k: .5, ink: 1.8, outfit: 'pyjama', expr: { lid: 0, browUp: 1, mouth: 'o', open: .4, look: -.6 } }); c.restore();
        c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(1500, 500, 0, 1500, 500, 500); g.addColorStop(0, 'rgba(90,130,255,.35)'); g.addColorStop(1, 'rgba(90,130,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
        bigText(c, 'NICHTS WIE', 700, 190, 140, { col: '#ffffff' }); const w = bigText(c, 'IM FILM', 700, 340, 140, { col: '#ffd34a' });
        c.save(); c.lineCap = 'round'; c.strokeStyle = '#05060a'; c.lineWidth = 24; c.beginPath(); c.moveTo(690, 300); c.lineTo(710 + w, 282); c.stroke(); c.strokeStyle = '#ff3b30'; c.lineWidth = 12; c.stroke(); c.restore();
      }] };
}
function ceilingNightT(c, cam, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0d111c'; c.fillRect(0, 0, W, H); layer(c, cam, .8, c => { c.fillStyle = '#151a28'; c.fillRect(-3000, -3000, 6000, 6000); blindStripes(c, -2200, -1400, 3600, 1300, 12, 120, 40, .12); }); }
NOAH_FONTS_READY.then(() => defineFilm({ shots: [{ name: 'A', dur: 1, f: shotA }, { name: 'B', dur: 1, f: shotB }] }));
