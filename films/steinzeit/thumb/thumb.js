// YouTube thumbnail: shocked Noah in front of a towering mammoth at an ice-age sunset, big German title.
function bigText(c, s, x, y, size, o = {}) {
  c.save(); c.font = `${size}px ${F_TITLE}`; c.textAlign = o.align || 'left'; c.lineJoin = 'round';
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.lineWidth = size * .2; c.strokeStyle = '#140c08'; c.strokeText(s, x, y); c.shadowColor = 'transparent';
  c.lineWidth = size * .07; c.strokeStyle = o.rim || '#5a2a10'; c.strokeText(s, x, y);
  const g = c.createLinearGradient(0, y - size * .85, 0, y + size * .1); g.addColorStop(0, o.top || '#fff3c8'); g.addColorStop(.55, o.mid || '#ffc24a'); g.addColorStop(1, o.bot || '#e8762a');
  c.fillStyle = g; c.fillText(s, x, y);
  c.save(); c.beginPath(); c.rect(x - 3000, y - size * .9, 6000, size * .35); c.clip(); c.globalAlpha = .4; c.fillStyle = '#fff'; c.fillText(s, x, y - 2); c.restore();
  c.restore();
}
STZ_FONTS_READY.then(() => defineFilm({ shots: [{ name: 'thumb', dur: 1, f: () => {
  const t = 3.2, cam = { x: 980, y: -470, z: .66 };
  return { set: steppeSet, setOpts: { tod: 'dusk', sunX: .62, sunY: .5, hill: 900 }, cam, blur: 0, vignette: 0,
    behind: [c => { castShadow(c, 1250, 900, { alpha: .25 }); mammut(c, 1250, { t, s: -1, trunk: 1, walk: 1.2 }); mammut(c, 2050, { t, s: -1, sc: .55, walk: 2 }); for (let i = 0; i < 5; i++) vogel(c, 300 + i * 140, -1250 - (i % 2) * 60, { t: t + i, sc: 1.4 }); }],
    screen: [c => {
      steppeFront(c, cam, t, { tod: 'dusk' });
      grade(c, { warm: '255,150,80', warmA: .45, cool: '50,20,70', coolA: .3, sx: .62, sy: .5 });
      snowfall(c, t, 70, .7, 1.5);
      // big Noah, foreground left (screen space close-up)
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(560, 1260); c.scale(.62, .62);
      const e = { eyes: 'open', browUp: 1, mouth: 'yawn', open: .75, look: .8 };
      // rim light glow behind him
      const g = c.createRadialGradient(0, -1250, 100, 0, -1250, 900); g.addColorStop(0, 'rgba(255,190,110,.55)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(-1000, -2200, 2000, 2000);
      drawNoahE(c, { x: 0, y: 0, k: 1, ink: 1.5, era: 0, expr: e, arms: { l: { a: .55, b: 2.15 }, r: { a: .55, b: 2.15 } }, tilt: -.05 });
      noahHeadPolish(c, 0, -1240, 1, e, -.05, { lx: .9, ly: -.3, shadow: .3, rim: .8, rimCol: '255,170,90', glint: 1, glintCol: '255,255,255' });
      c.restore();
      // title
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(1270, 175); c.rotate(-.035);
      bigText(c, '15.000', 0, 0, 190, { align: 'center' });
      bigText(c, 'JAHRE ZURÜCK!', 0, 135, 104, { align: 'center', mid: '#ffffff', top: '#ffffff', bot: '#ffd890', rim: '#7a2a10' });
      c.restore();
      // small stone tag "Eiszeit"
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(1500, 930); c.rotate(.03); slabPath(c, 360, 110, 9); c.fillStyle = 'rgba(42,33,27,.88)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(232,163,61,.8)'; c.stroke(); cardTitle(c, 'Eiszeit', 180, 82, 72, { align: 'center', top: CARD.cream, bot: '#e8c890' }); c.restore();
      vignette2(c, .6); grain(c, t, .05);
    }] };
} }] }));
