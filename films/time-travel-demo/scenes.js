// Noah walks through the forest while a corner card counts the years back to 10,000 years ago.
const K = .25, INK = 1.8;
// years under 10,000 are written without a thousands dot (Turkish convention: M.Ö. 8000)
const yearFmt = v => { const n = Math.abs(Math.round(v)), s = n >= 10000 ? fmtNum(n) : String(n); return v >= 0 ? s : 'M.Ö. ' + s; };
NOAH_FONTS_READY.then(() => defineFilm({
  fadeIn: .3, fadeOut: .4,
  shots: [
    { name: 'walk + time card', dur: 8, f(lt, T, t) {
      const nx = -700 + lt * 150, v = { x: nx + 260, y: -290, z: 1.35 };
      const warp = bump(t, 1.4, 3.6);
      return { set: forestSet, cam: v, blur: 0, vignette: .28,
        behind: [c => deer(c, 900, { s: -1, t }), c => castShadow(c, nx, 110, { dir: 1 }), c => drawNoahSide(c, { x: nx, k: K, ink: INK, walk: t * 8, expr: { mouth: t > 2 && t < 3.4 ? 'o' : 'smile', browUp: warp } }), c => rabbit(c, 420, { t, s: -1 })],
        fx: [c => bird(c, v.x + 300, -760, { t })],
        screen: [c => forestFrame(c, v, t), c => forestLight(c, v, t),
          // "rewind" streaks while the years roll back
          c => { if (warp <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 14; i++) { const y = rnd(i + 50) * H, x = ((t * 1400 + rnd(i) * W) % (W + 600)) - 300; c.fillStyle = `rgba(255,240,200,${.18 * warp})`; c.fillRect(W - x, y, 260, 3); } c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(120,80,40,${.12 * warp})`; c.fillRect(0, 0, W, H); c.restore(); },
          c => hudCard(c, t, { t0: .8, t1: 7.6, corner: 'tr', w: 600, h: 440, title: 'ZAMAN YOLCULUĞU', icon: 'hourglass', color: HUD.accent,
            draw: (c, k, lt, w, h) => {
              hudText(c, 'YIL', 0, 22, 18, HUD.muted);
              hudCounter(c, 2026, -8000, (t - 1.4) / 2.2, 0, 96, 72, { fmt: yearFmt, color: t > 3.6 ? HUD.accent : HUD.ink });
              hudTimeline(c, 60, 160, w - 110, [{ v: -10000, label: 'M.Ö. 10.000' }, { v: -5000, label: 'M.Ö. 5000' }, { v: 0, label: '0' }, { v: 2026, label: '2026' }], 2026 + (-8000 - 2026) * ease(clamp((t - 1.4) / 2.2, 0, 1)));
              hudCalc(c, [[{ s: '2026 ' }, { s: '− 10.000', col: HUD.blue }, { s: ' = −7974' }], '≈ M.Ö. 8000'], (t - 3.8) / 1.4, 0, 270, 34, { result: true });
            } }),
          c => hudBadge(c, t, { t0: 2.0, t1: 3.9, x: W * .36, y: H * .38, text: '−10.000 yıl', color: HUD.blue }),
          c => hudCard(c, t, { t0: 5.0, t1: 7.6, corner: 'tl', w: 620, h: 250, title: 'DÜNYA NÜFUSU', icon: 'people', color: HUD.green, tilt: .012,
            draw: (c, k, lt, w, h) => hudTable(c, 0, 0, [{ w: 200 }, { w: 200, align: 'right' }, { w: 164, align: 'right' }], [['DÖNEM', 'YIL', 'NÜFUS'], ['Bugün', '2026', '8,2 milyar'], ['Taş Devri', 'M.Ö. 8000', '~5 milyon']], clamp(lt / 1.2, 0, 1), { hi: 2, size: 24 }) }),
        ] };
    } },
  ],
}));
