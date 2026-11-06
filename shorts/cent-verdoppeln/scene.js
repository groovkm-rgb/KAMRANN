// "1 Cent oder 1 Million?" — 30 s, 1080x1920, 60 fps, ohne Ton. Alle Zahlen aus facts.json (calc.py).
GSS.scene({
  title: '1 Cent oder 1 Million?',
  duration: 30,
  loop: { dur: 0.5 },
  draw(ctx, t, S) {
    const F = window.FACTS, T = S.T, TAU = Math.PI * 2;
    const v = d => F.eur_by_day[0] * Math.pow(2, d - 1);          // stetiger Wert für Tag d (Tag 1 = 1 Cent)
    const dayEur = d => F.eur_by_day[Math.max(1, Math.min(F.days, d)) - 1];
    const eur = x => S.de(x, 2) + ' €';
    const SUPD = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    const sup = n => String(n).split('').map(c => SUPD[c]).join('');
    const GOLD = '#F2B43A', BILL = '#3DBE8B';

    const cam = S.camera([
      { t: 0, x: 540, y: 960, z: 1.08 },
      { t: 1.4, z: 1, ease: 'outExpo' },
      { t: 2.4, z: 1 },
      { t: 8.4, x: 540, y: 990, z: 1.03 },
      { t: 14, x: 540, y: 960, z: 1 },
      { t: 22, z: 1 },
      { t: 23.2, z: 1.04, ease: 'outCubic' },
      { t: 26.6, z: 1 },
      { t: 28.8, x: 540, y: 960, z: 1.08 },
    ]);

    S.background(ctx, t, { D: 30 });

    // ───────── Zeichen-Helfer ─────────
    function coin(x, y, r, a = 1) {
      if (a <= 0 || r <= 0) return;
      ctx.save(); ctx.globalAlpha *= a;
      ctx.shadowColor = S.hexA(GOLD, 0.6); ctx.shadowBlur = r * 0.6;
      const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, '#FFE7A3'); g.addColorStop(0.6, GOLD); g.addColorStop(1, '#A86A12');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Math.max(1.5, r * 0.07); ctx.strokeStyle = 'rgba(120,70,10,0.55)';
      ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, TAU); ctx.stroke();
      if (r > 14) {
        ctx.fillStyle = 'rgba(110,62,8,0.85)'; ctx.font = S.font(r * 0.95, 900);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', x, y + r * 0.04);
      }
      ctx.restore();
    }
    function bills(x, y, w, a = 1) {
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha *= a;
      const h = w * 0.48;
      for (let i = 3; i >= 0; i--) {
        const bx = x - w / 2 + i * 10, by = y - h / 2 - i * 16;
        S.roundRect(ctx, bx, by, w, h, 14);
        ctx.fillStyle = S.mix(BILL, '#0B3D2A', i * 0.12); ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(220,255,235,0.55)'; ctx.stroke();
        if (i === 0) {
          ctx.strokeStyle = 'rgba(220,255,235,0.35)'; ctx.lineWidth = 3;
          S.roundRect(ctx, bx + 14, by + 14, w - 28, h - 28, 8); ctx.stroke();
          ctx.beginPath(); ctx.arc(bx + w / 2, by + h / 2, h * 0.27, 0, TAU); ctx.stroke();
        }
      }
      ctx.restore();
    }
    function card(cx, cy, w, h, edge, a) {
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha *= a;
      S.roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 40);
      ctx.fillStyle = T.panel; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = edge;
      ctx.shadowColor = edge; ctx.shadowBlur = 30; ctx.stroke();
      ctx.restore();
    }

    // ───────── 0–2,5 s & 26,8–30 s: Startbild „Was nimmst du?“ (identisch → Loop) ─────────
    const cardsK = t < 10 ? 1 - S.prog(t, 2.4, 0.55, 'inQuad') : S.prog(t, 26.8, 0.8, 'outCubic');
    const bob = Math.sin(TAU * t * 10 / 30) * 8;                       // Periode 3 s → loopbar
    const pulse = 1 + 0.05 * Math.sin(TAU * t * 15 / 30);
    const LX = 270 - 460 * (1 - cardsK), RX = 770 + 460 * (1 - cardsK), CY = 930;
    if (cardsK > 0) {
      cam.world(ctx, t, () => {
        card(LX, CY + bob, 340, 580, S.hexA(T.cyan, 0.8), cardsK);
        card(RX, CY - bob, 340, 580, S.hexA(T.accent, 0.8), cardsK);
        bills(LX, CY - 110 + bob, 230, cardsK);
        coin(RX, CY - 110 - bob, 96 * pulse, cardsK);
      });
      const [lx, ly] = cam.toScreen(t, LX, CY + bob), [rx, ry] = cam.toScreen(t, RX, CY - bob);
      const [ox, oy] = cam.toScreen(t, 520, CY);
      const hook = t < 10;
      const o = hook ? { in: 0, out: 2.0, anim: 'none' } : { in: 27.45, anim: 'rise' };
      S.text(ctx, t, '1 Mio. €', { x: lx, y: ly + 110, size: 72, color: T.cyan, ...o });
      S.text(ctx, t, 'sofort', { x: lx, y: ly + 200, size: 56, weight: 700, color: T.muted, ...o });
      S.text(ctx, t, '1 Cent', { x: rx, y: ry + 110, size: 72, color: T.accent, ...o });
      S.text(ctx, t, 'täglich × 2', { x: rx, y: ry + 200, size: 56, weight: 700, color: T.muted, ...o });
      S.text(ctx, t, 'oder', { x: ox, y: oy, size: 52, weight: 800, color: T.ink, ...o });
      S.text(ctx, t, 'Was nimmst du?', { x: 520, y: 430, size: 96, ...o });
    }

    // ───────── 2,4–8,6 s: Kalender, Tage 1–14 ─────────
    const calA = S.vis(t, 2.35, 8.3, 0.45, 0.5);
    const dCal = 1 + 13 * S.prog(t, 2.9, 3.8, 'inOutQuad');
    const dayC = Math.floor(dCal + 1e-6);
    if (calA > 0) {
      const COLS = 6, CW = 136, CH = 112, GX = 540 - (COLS - 1) * CW / 2, GY = 1000 - 2 * CH;
      cam.world(ctx, t, () => {
        for (let i = 0; i < 30; i++) {
          const d = i + 1, x = GX + (i % COLS) * CW, y = GY + Math.floor(i / COLS) * CH;
          const pop = S.ease.outBack(S.clamp((t - 2.4 - i * 0.012) / 0.4));
          if (pop <= 0) continue;
          ctx.save(); ctx.globalAlpha = calA; ctx.translate(x, y); ctx.scale(pop, pop);
          const on = d <= dayC, cur = d === dayC;
          S.roundRect(ctx, -CW / 2 + 8, -CH / 2 + 8, CW - 16, CH - 16, 18);
          ctx.fillStyle = on ? S.hexA(GOLD, cur ? 0.42 : 0.2) : 'rgba(255,255,255,0.05)'; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = on ? S.hexA(GOLD, 0.8) : T.panelEdge; ctx.stroke();
          ctx.fillStyle = on ? T.ink : T.muted; ctx.font = S.font(40, 800);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(d), 0, 2);
          ctx.restore();
        }
        // Münze springt von Tag zu Tag
        const i = dayC - 1, x = GX + (i % COLS) * CW, y = GY + Math.floor(i / COLS) * CH;
        const hop = Math.sin(Math.PI * (dCal - dayC)) * 26;
        coin(x + CW * 0.36, y - CH * 0.36 - hop, 26, calA * S.clamp((t - 2.9) / 0.3));
      });
      S.text(ctx, t, `Tag ${dayC}`, { y: 300, size: 72, weight: 900, color: T.cyan, anim: 'none', alpha: S.vis(t, 2.7, 8.3, 0.3, 0.4), live: true });
      S.text(ctx, t, eur(dayEur(dayC)), { y: 440, size: 130, color: T.accent, anim: 'none', alpha: S.vis(t, 2.7, 8.3, 0.3, 0.4), live: true });
      S.text(ctx, t, `Nach 2 Wochen:\nnur *${eur(F.day14_eur)}*`, { x: 520, y: 1390, size: 54, weight: 800, in: 6.6, out: 8.7, bg: true });
    }

    // ───────── 8,6–14 s: Rechnung ─────────
    S.tag(ctx, t, 'Rechnung', { y: 280, in: 8.7, out: 13.5, color: T.cyan });
    S.text(ctx, t, 'Jeden Tag *× 2*', { y: 430, size: 96, in: 8.8, out: 13.5 });
    S.formula(ctx, t, [
      'Tag 1 = 1 Cent',
      `Tag ${F.days} = 1 Cent · 2${sup(F.exponent)}`,
      `= *${S.de(F.day30_cent)}* Cent`,
    ], { y: 840, t0: 9.4, step: 1.1, size: 64, out: 13.5, w: 900 });
    {
      const a = S.vis(t, 9.5, 13.5, 0.3, 0.4);
      if (a > 0) {
        const k = Math.min(6, Math.floor(S.prog(t, 9.7, 3.5, 'linear') * 7));  // 1 → 64 Münzen
        const n = 1 << k, cols = 16, cell = 52, ox = 540 - (cols - 1) * cell / 2, oy = 1130;
        const kT = 9.7 + k * 0.5;
        cam.world(ctx, t, () => {
          for (let i = 0; i < n; i++) {
            const born = i >= (n >> 1) && k > 0 ? S.ease.outBack(S.clamp((t - kT) / 0.35)) : 1;
            coin(ox + (i % cols) * cell, oy + Math.floor(i / cols) * cell, 21 * born, a);
          }
        });
        S.text(ctx, t, `${n} Cent`, { y: 1400, size: 60, weight: 900, color: T.accent, anim: 'none', alpha: a, live: true });
      }
    }

    // ───────── 14–26,5 s: Balken Tag 1–30 (lineare Skala!) ─────────
    const DK = [[14.2, 14], [17.6, 21], [18.8, 24], [20.4, 28], [21.6, 30]];
    const dOf = tt => { if (tt <= DK[0][0]) return DK[0][1]; for (let i = 1; i < DK.length; i++) if (tt <= DK[i][0]) { const [a0, d0] = DK[i - 1], [a1, d1] = DK[i]; return d0 + (d1 - d0) * (tt - a0) / (a1 - a0); } return 30; };
    const tOfD = d => { for (let i = 1; i < DK.length; i++) if (d <= DK[i][1]) { const [a0, d0] = DK[i - 1], [a1, d1] = DK[i]; return a0 + (a1 - a0) * (d - d0) / (d1 - d0); } return 21.6; };
    const barA = S.vis(t, 14.0, 26.4, 0.45, 0.6);
    if (barA > 0) {
      const d = dOf(t), dayB = Math.min(30, Math.floor(d + 1e-6));
      const GROUND = 1230, X0 = 126, PITCH = 28.4, BW = 20;
      const res = S.prog(t, 21.9, 0.9, 'inOutCubic');
      const HMAX = S.lerp(600, 470, res);
      const s = HMAX / Math.max(1.25e6, v(Math.min(d, 30)));
      const lineY = GROUND - F.million * s;
      const half = S.vis(t, 23.8, 26.3, 0.4, 0.4);
      cam.world(ctx, t, () => {
        ctx.save(); ctx.globalAlpha = barA;
        ctx.fillStyle = T.muted; ctx.fillRect(X0 - 20, GROUND, 30 * PITCH + 20, 4);
        for (let k = 1; k <= 30; k++) {
          const grow = S.clamp(d - k + 1);
          if (grow <= 0) continue;
          const h = Math.max(4, F.eur_by_day[k - 1] * s * S.ease.outCubic(grow));
          const x = X0 + (k - 1) * PITCH;
          const over = F.eur_by_day[k - 1] >= F.million;
          ctx.fillStyle = over ? T.green : GOLD;
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = over ? 24 : 10;
          S.roundRect(ctx, x, GROUND - h, BW, h, Math.min(8, h / 2)); ctx.fill();
        }
        ctx.shadowColor = 'transparent';
        // Linie 1 Mio. €
        ctx.strokeStyle = T.cyan; ctx.lineWidth = 5; ctx.setLineDash([18, 14]);
        ctx.beginPath(); ctx.moveTo(X0 - 20, lineY); ctx.lineTo(X0 + 30 * PITCH, lineY); ctx.stroke();
        ctx.setLineDash([]);
        // Hälfte des letzten Balkens markieren
        if (half > 0 && d >= 30) {
          const x30 = X0 + 29 * PITCH, top = GROUND - F.eur_by_day[29] * s, mid = GROUND - F.eur_by_day[28] * s;
          ctx.globalAlpha = barA * half;
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; S.roundRect(ctx, x30, top, BW, mid - top, 6); ctx.fill();
          S.dim(ctx, x30 - 26, top, x30 - 26, mid, S.prog(t, 23.9, 0.5), { color: T.ink, width: 5, tick: 14, alpha: barA * half });
        }
        ctx.restore();
      });
      const [, ly] = cam.toScreen(t, 0, lineY);
      S.text(ctx, t, '1 Mio. €', { x: 110, y: ly - 46, size: 52, weight: 900, color: T.cyan, align: 'left', anim: 'none', alpha: barA, live: true });
      const [, gy] = cam.toScreen(t, 0, GROUND);
      S.text(ctx, t, 'Tag 1', { x: 100, y: gy + 50, size: 52, weight: 700, color: T.muted, align: 'left', anim: 'none', alpha: barA });
      S.text(ctx, t, 'Tag 30', { x: 960, y: gy + 50, size: 52, weight: 700, color: T.muted, align: 'right', anim: 'none', alpha: barA });

      S.tag(ctx, t, 'Maßstab', { y: 280, in: 14.1, out: 21.7, color: T.cyan });
      const liveA = S.vis(t, 14.2, 21.7, 0.3, 0.35);
      S.text(ctx, t, `Tag ${dayB}`, { y: 380, size: 72, color: T.cyan, anim: 'none', alpha: liveA, live: true });
      S.text(ctx, t, eur(dayEur(dayB)), { x: 520, y: 495, size: 96, color: dayEur(dayB) >= F.million ? T.green : T.accent, anim: 'none', alpha: liveA, live: true });
      S.text(ctx, t, `Nach 3 Wochen:\nerst *${eur(F.day21_eur)}*`, { y: 1390, size: 54, weight: 800, in: 17.4, out: 19.7, bg: true });
      const tCross = tOfD(F.first_million_day);
      S.text(ctx, t, `Tag ${F.first_million_day}:\nMillion +überholt+!`, { y: 1390, size: 54, weight: 800, in: tCross, out: 22.0, bg: true });
    }

    // ───────── 22–26,5 s: Auflösung ─────────
    S.text(ctx, t, `Am Tag ${F.days}:`, { y: 310, size: 72, weight: 800, in: 22.0, out: 26.3 });
    S.text(ctx, t, `*${eur(F.day30_eur)}*`, { y: 450, size: 100, in: 22.25, out: 26.3, anim: 'pop' });
    S.text(ctx, t, `über *${Math.floor(F.ratio_to_million)}-mal* die Million`, { y: 580, size: 66, weight: 800, in: 23.0, out: 26.3 });
    S.text(ctx, t, 'Die Hälfte kommt erst\nam letzten Tag.', { y: 1390, size: 54, weight: 800, in: 23.8, out: 26.3, bg: true });
    S.flash(ctx, t, 22.0, 0.4, '#FFE6A0', 0.22);

    S.vignette(ctx, 0.5);
  },
});
