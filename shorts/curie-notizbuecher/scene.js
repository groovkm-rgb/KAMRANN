// "Marie Curies Notizbücher strahlen bis heute" — 30 s, 1080x1920, 60 fps. Zahlen aus facts.json (calc.py).
GSS.scene({
  title: 'Marie Curies Notizbücher strahlen bis heute',
  duration: 30,
  loop: { dur: 0.5 },
  draw(ctx, t, S) {
    const F = window.FACTS, T = S.T, TAU = Math.PI * 2;
    const RAD = '#7CFFB0';                                   // Stilfarbe "Strahlung"
    const LEAD = '#566078';
    const rest = years => Math.pow(0.5, years / F.t_half);

    const cam = S.camera([
      { t: 0, x: 540, y: 960, z: 1.08 },
      { t: 1.4, z: 1, ease: 'outExpo' },
      { t: 2.4, z: 1 },
      { t: 5.2, x: 540, y: 980, z: 1.03 },
      { t: 8.4, x: 540, y: 960, z: 1.06 },
      { t: 14, x: 540, y: 960, z: 1 },
      { t: 22, z: 1 },
      { t: 23.2, z: 1.04, ease: 'outCubic' },
      { t: 26.6, z: 1 },
      { t: 28.8, x: 540, y: 960, z: 1.08 },
    ]);

    S.background(ctx, t, { D: 30 });

    // ───────── Laborheft mit Strahlungspunkten ─────────
    const NB = { x: 540, y: 1000, w: 600, h: 400 };
    const specks = (() => { const r = S.rng(11), a = []; for (let i = 0; i < 46; i++) a.push({ u: r(), v: r(), k: 1 + Math.floor(r() * 6), p: r() * TAU, s: 4 + r() * 6 }); return a; })();
    function notebook(a, glow) {
      if (a <= 0) return;
      const { x, y, w, h } = NB;
      ctx.save(); ctx.globalAlpha *= a;
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
      ctx.fillStyle = '#5A3A22'; S.roundRect(ctx, x - w / 2 - 16, y - h / 2 - 12, w + 32, h + 30, 18); ctx.fill();   // Einband
      ctx.shadowColor = 'transparent';
      for (const side of [-1, 1]) {                                         // zwei Seiten
        const px = side < 0 ? x - w / 2 : x, g = ctx.createLinearGradient(px, 0, px + w / 2, 0);
        g.addColorStop(side < 0 ? 0 : 1, '#E9DFC6'); g.addColorStop(side < 0 ? 1 : 0, '#CFC2A3');
        ctx.fillStyle = g; ctx.fillRect(px, y - h / 2, w / 2, h);
        // Handschrift-Zeilen (deterministisch)
        ctx.strokeStyle = 'rgba(60,50,70,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let l = 0; l < 9; l++) {
          const ly = y - h / 2 + 46 + l * 38, len = (0.55 + 0.4 * ((l * 37 + (side + 1) * 11) % 10) / 10) * (w / 2 - 70);
          ctx.beginPath();
          for (let s = 0; s <= len; s += 6) { const xx = px + 34 + s, yy = ly + Math.sin(s * 0.21 + l * 1.7 + side) * 4 + Math.sin(s * 0.07 + l) * 2; s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - 3, y - h / 2, 6, h);   // Bundsteg
      // Strahlungspunkte (loopbar: Frequenzen ganzzahlig über 30 s)
      if (glow > 0) {
        for (const p of specks) {
          const tw = 0.55 + 0.45 * Math.sin(TAU * p.k * t * 4 / 30 + p.p);
          const sx = x - w / 2 + 24 + p.u * (w - 48), sy = y - h / 2 + 24 + p.v * (h - 48);
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.s * 3.2);
          g.addColorStop(0, S.hexA(RAD, 0.95 * glow * tw)); g.addColorStop(0.35, S.hexA(RAD, 0.35 * glow * tw)); g.addColorStop(1, S.hexA(RAD, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, p.s * 3.2, 0, TAU); ctx.fill();
        }
      }
      ctx.restore();
    }
    function leadBox(open, a) {                                  // open: 1 = Deckel oben, 0 = geschlossen
      if (a <= 0) return;
      const { x, y, w, h } = NB, bw = w + 110, bh = h + 90, top = y - bh / 2;
      ctx.save(); ctx.globalAlpha *= a;
      const g = ctx.createLinearGradient(0, top, 0, top + bh); g.addColorStop(0, '#6C778F'); g.addColorStop(1, '#3B4357');
      // Wände (hinter dem Heft sichtbar als Rahmen)
      ctx.lineWidth = 26; ctx.strokeStyle = g; S.roundRect(ctx, x - bw / 2, top, bw, bh, 22); ctx.stroke();
      // Deckel
      const ly = S.lerp(top, top - bh - 260, open);
      ctx.fillStyle = g; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30;
      S.roundRect(ctx, x - bw / 2 - 10, ly - 4, bw + 20, bh + 8, 24); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 4;
      S.roundRect(ctx, x - bw / 2 + 24, ly + 24, bw - 28, bh - 40, 16); ctx.stroke();
      ctx.restore();
    }

    // Sichtbarkeit Heft: Hook, Setup-Teil 2, Loop
    const nbA = t < 2.6 ? 1 - S.prog(t, 2.2, 0.4) : t < 10 ? S.vis(t, 5.2, 8.3, 0.5, 0.4) : S.prog(t, 26.8, 0.7, 'outCubic');
    const glow = t < 5.2 ? 1 : t < 10 ? S.prog(t, 5.4, 1.2, 'inOutQuad') : 1;
    const lid = t > 6.6 && t < 10 ? 1 - S.prog(t, 6.9, 0.45, 'inQuad') : 1;
    cam.world(ctx, t, () => {
      notebook(nbA, glow);
      if (t > 6.5 && t < 9) leadBox(lid, S.vis(t, 6.6, 8.3, 0.3, 0.4));   // Deckel zu bei ≈7,35 s (Ton: Thud)
    });
    if (t > 7.2 && t < 8.8) {                                      // "Pb" auf dem Deckel
      const [px, py] = cam.toScreen(t, NB.x, NB.y);
      S.text(ctx, t, 'Pb', { x: px, y: py, size: 120, color: '#D9DEEA', in: 7.35, out: 8.3, anim: 'pop' });
    }

    // Hook + Loop-Texte (identisch → nahtloser Loop)
    const hook = t < 10;
    const o = hook ? { in: 0, out: 2.1, anim: 'none' } : { in: 27.2, anim: 'rise' };
    S.tag(ctx, t, 'Marie Curie · 7.11.1867', { y: 290, color: T.cyan, in: hook ? -1 : 27.0, out: hook ? 2.1 : Infinity });
    S.text(ctx, t, 'Ihre Notizbücher\n*strahlen* bis heute.', { y: 480, size: 88, ...o });

    // ───────── 2,4–5,2 s: 1898, Radium ─────────
    {
      const a = S.vis(t, 2.7, 5.0, 0.35, 0.4);
      if (a > 0) {
        const k = S.ease.outBack(S.clamp((t - 2.9) / 0.5)), cx = 540, cy = 960, sz = 340;
        cam.world(ctx, t, () => {
          ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(k, k);
          const g = ctx.createRadialGradient(0, 0, 40, 0, 0, sz);
          g.addColorStop(0, S.hexA(RAD, 0.35)); g.addColorStop(1, S.hexA(RAD, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, sz, 0, TAU); ctx.fill();
          S.roundRect(ctx, -sz / 2, -sz / 2, sz, sz, 34); ctx.fillStyle = T.panel; ctx.fill();
          ctx.lineWidth = 6; ctx.strokeStyle = RAD; ctx.shadowColor = RAD; ctx.shadowBlur = 30; ctx.stroke();
          ctx.restore();
        });
        const [sx, sy] = cam.toScreen(t, cx, cy);
        S.text(ctx, t, 'Ra', { x: sx, y: sy + 5, size: 170, color: RAD, in: 3.0, out: 5.0, anim: 'pop' });
        S.text(ctx, t, '88', { x: sx - 110, y: sy - 120, size: 52, weight: 800, color: T.muted, in: 3.1, out: 5.0 });
      }
      S.text(ctx, t, String(F.discovery), { y: 450, size: 170, color: T.accent, in: 2.6, out: 5.0, anim: 'pop' });
      S.text(ctx, t, 'Sie entdeckt\ndas *Radium*.', { y: 1360, size: 66, weight: 800, in: 3.2, out: 5.0 });
    }

    // ───────── 5,2–8,5 s: Staub im Heft, Bleikiste ─────────
    S.text(ctx, t, 'Radium-Staub landet\nin ihren Laborheften.', { y: 470, size: 70, weight: 800, in: 5.3, out: 8.3 });
    S.text(ctx, t, 'Heute liegen sie\nin *Bleikisten*.', { y: 1390, size: 58, weight: 800, in: 6.8, out: 8.5, bg: true });

    // ───────── 8,7–13,6 s: Rechnung ─────────
    S.tag(ctx, t, 'Rechnung', { y: 280, in: 8.7, out: 13.5, color: T.cyan });
    S.text(ctx, t, `Halbwertszeit:\n*${S.de(F.t_half)} Jahre*`, { y: 450, size: 84, in: 8.8, out: 13.5 });
    S.formula(ctx, t, [
      `${F.discovery} bis ${F.now}: ${F.elapsed} Jahre`,
      `Rest = 0,5 hoch ${S.de(F.hwz_fraction, 2)}`,
      `≈ *${S.de(F.rest_now_pct, 1)} %* noch da`,
    ], { y: 850, t0: 9.3, step: 1.0, size: 60, out: 13.5, w: 900 });
    {
      const a = S.vis(t, 11.9, 13.75, 0.35, 0.4);
      if (a > 0) {
        const X0 = 120, Wb = 840, y = 1190, hb = 64, k = S.prog(t, 12.0, 0.9, 'outCubic');
        const fr = F.rest_now_pct / 100;
        ctx.save(); ctx.globalAlpha = a;
        S.roundRect(ctx, X0, y - hb / 2, Wb, hb, hb / 2); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
        S.roundRect(ctx, X0, y - hb / 2, Wb * fr * k, hb, hb / 2); ctx.fillStyle = RAD; ctx.shadowColor = RAD; ctx.shadowBlur = 20; ctx.fill();
        ctx.shadowColor = 'transparent';
        if (k > 0.98) { ctx.fillStyle = T.magenta; ctx.fillRect(X0 + Wb * fr + 4, y - hb / 2, Wb * (1 - fr) - 4, hb); }
        ctx.restore();
        S.text(ctx, t, `erst *${S.de(F.decayed_now_pct, 1)} %* zerfallen`, { y: 1310, size: 56, weight: 800, in: 12.2, out: 13.8 });
      }
    }

    // ───────── 14,2–26,4 s: Zerfallskurve auf der Zeitachse ─────────
    const curveA = S.vis(t, 14.1, 26.3, 0.45, 0.6);
    if (curveA > 0) {
      const zoomOut = S.prog(t, 14.4, 6.2, 'inOutCubic'), zoomBack = S.prog(t, 22.0, 1.4, 'inOutCubic');
      const span = S.loglerp(S.loglerp(140, 16000, zoomOut), 4200, zoomBack);   // sichtbare Jahre ab 1898
      const X0 = 130, L = 820, YB = 1150, HC = 470;
      const xOf = y => X0 + (y - F.discovery) / span * L;
      const yOf = r => YB - HC * r;
      const cursor = F.discovery + Math.min(span, 16000);
      cam.world(ctx, t, () => {
        ctx.save(); ctx.globalAlpha = curveA;
        // Achsen
        ctx.strokeStyle = T.muted; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(X0, yOf(1) - 30); ctx.lineTo(X0, YB); ctx.lineTo(X0 + L + 10, YB); ctx.stroke();
        // 50 %-Linie
        ctx.setLineDash([12, 12]); ctx.strokeStyle = S.hexA(T.muted, 0.6); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(X0, yOf(0.5)); ctx.lineTo(X0 + L, yOf(0.5)); ctx.stroke(); ctx.setLineDash([]);
        // Kurve + Fläche
        ctx.beginPath(); ctx.moveTo(X0, YB);
        for (let i = 0; i <= 160; i++) { const yr = F.discovery + span * i / 160; ctx.lineTo(xOf(yr), yOf(rest(yr - F.discovery))); }
        ctx.lineTo(X0 + L, YB); ctx.closePath();
        const g = ctx.createLinearGradient(0, yOf(1), 0, YB); g.addColorStop(0, S.hexA(RAD, 0.35)); g.addColorStop(1, S.hexA(RAD, 0.03));
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath();
        for (let i = 0; i <= 160; i++) { const yr = F.discovery + span * i / 160, px = xOf(yr), py = yOf(rest(yr - F.discovery)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.strokeStyle = RAD; ctx.lineWidth = 7; ctx.shadowColor = RAD; ctx.shadowBlur = 18; ctx.stroke(); ctx.shadowColor = 'transparent';
        // "Heute"-Marker
        const hx = xOf(F.now);
        ctx.strokeStyle = T.cyan; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx, YB + 14); ctx.lineTo(hx, yOf(rest(F.elapsed)) - 20); ctx.stroke();
        // 3498-Marker
        const mx = xOf(F.half_year);
        if (mx < X0 + L + 5) {
          const pulse = t > 22 ? 1 + 0.25 * Math.sin(TAU * (t - 22) * 1.5) : 1;
          ctx.strokeStyle = T.accent; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
          ctx.beginPath(); ctx.moveTo(mx, YB); ctx.lineTo(mx, yOf(0.5)); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = T.accent; ctx.shadowColor = T.accent; ctx.shadowBlur = 20;
          ctx.beginPath(); ctx.arc(mx, yOf(0.5), 13 * pulse, 0, TAU); ctx.fill();
        }
        ctx.restore();
      });
      const [hxs, ybs] = cam.toScreen(t, xOf(F.now), YB);
      S.text(ctx, t, 'Heute', { x: Math.max(170, hxs), y: ybs + 52, size: 52, weight: 800, color: T.cyan, anim: 'none', alpha: curveA, live: true });
      const [mxs] = cam.toScreen(t, xOf(F.half_year), YB);
      const mA = curveA * S.clamp((X0 + L - mxs) / 60) * S.clamp((mxs - hxs - 150) / 60);
      if (mA > 0) S.text(ctx, t, String(F.half_year), { x: mxs, y: ybs + 52, size: 52, weight: 800, color: T.accent, anim: 'none', alpha: mA, live: true });
      const [, y50] = cam.toScreen(t, 0, yOf(0.5));
      S.text(ctx, t, '50 %', { x: 960, y: y50 - 36, size: 52, weight: 800, color: T.muted, align: 'right', anim: 'none', alpha: curveA });

      // Live-Zähler
      S.tag(ctx, t, 'Maßstab', { y: 280, in: 14.2, out: 21.7, color: T.cyan });
      const liveA = S.vis(t, 14.3, 21.7, 0.3, 0.35);
      S.text(ctx, t, `Jahr ${Math.round(cursor)}`, { y: 390, size: 72, color: T.cyan, anim: 'none', alpha: liveA, live: true });
      S.text(ctx, t, `noch ${S.de(rest(cursor - F.discovery) * 100, 1)} % Radium`, { y: 500, size: 76, color: T.accent, anim: 'none', alpha: liveA, live: true });
      S.text(ctx, t, `Selbst im Jahr ${F.ten_half_year}:\nnoch *${S.de(F.rest_ten_pct, 1)} %* übrig.`, { y: 1390, size: 56, weight: 800, in: 19.4, out: 22.0, bg: true });
    }

    // ───────── 22–26,4 s: Auflösung ─────────
    S.text(ctx, t, 'Erst im Jahr', { y: 300, size: 72, weight: 800, in: 22.0, out: 26.3 });
    S.text(ctx, t, `*${F.half_year}*`, { y: 455, size: 180, in: 22.25, out: 26.3, anim: 'pop' });
    S.text(ctx, t, 'ist die Hälfte zerfallen.', { y: 600, size: 66, weight: 800, in: 22.9, out: 26.3 });
    S.text(ctx, t, `Seit ${F.discovery} ist erst\nrund *${Math.round(F.decayed_now_pct)} %* zerfallen.`, { y: 1390, size: 56, weight: 800, in: 23.7, out: 26.3, bg: true });
    S.flash(ctx, t, 22.0, 0.4, '#C8FFE0', 0.2);

    S.vignette(ctx, 0.5);
  },
});
