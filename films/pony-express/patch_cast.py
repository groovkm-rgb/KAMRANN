import pathlib
p=pathlib.Path('web/cast.js'); s=p.read_text()
if '// western-patch' in s: print('already'); raise SystemExit
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (a, s.count(a)); s=s.replace(a,b)
rep("""  const legs = o.legs || 'stand', st = o.step || 0, hipY = B.y1 - 14, c = s.legs || null;
  const L = (pts) => { if (c) { ln(g, pts, 18); ln(g, pts, 9, c); } else ln(g, pts, 8); };""",
"""  const legs = o.legs || 'stand', st = o.step || 0, hipY = B.y1 - 14, c = s.legs || null; // western-patch
  if (legs === 'none') return;
  const L = (pts) => { if (c) { ln(g, pts, 30); ln(g, pts, 19, c); } else ln(g, pts, 8);
    if (s.boots) { const a = pts[pts.length - 2], b = pts[pts.length - 1], dx = b[0] - a[0], l = Math.abs(dx) || 1;
      const k0 = pts[pts.length - 3] || a; const bx = a[0] - k0[0], by = a[1] - k0[1], bl = Math.hypot(bx, by) || 1;
      ln(g, [[a[0] - bx / bl * 80, a[1] - by / bl * 80], a], 42); ln(g, [[a[0] - bx / bl * 80, a[1] - by / bl * 80], a], 29, s.boots);
      inkFill(g, [[a[0] - 18 * Math.sign(dx || 1), a[1] - 16], [b[0] + dx / l * 12, b[1] - 12], [b[0] + dx / l * 16, b[1] + 8], [a[0] - 18 * Math.sign(dx || 1), a[1] + 10]], s.boots, 6); } };
  if (legs === 'ride') { for (const sd of [-1, 1]) { const hx = 300 + sd * 40; L([[hx, hipY], [hx + sd * 110, hipY + 60], [hx + sd * 96, hipY + 190], [hx + sd * 120, hipY + 196]]); } return; }
  if (legs === 'rideSide') { const k = o.knee || 0; L([[300, hipY], [300 + 120 + k * 20, hipY + 40 - k * 30], [300 + 80 + k * 30, hipY + 200 - k * 40], [300 + 125 + k * 30, hipY + 205 - k * 40]]); return; }""")
rep("""      inkFill(g, ellP(x, eyeY - 4 * u, 21 * u * k, 24 * u, 0, 360, 32), '#ffffff', 6 * u);
      dt(g, x + look * 9 * u * k, eyeY - 2 * u, 7.5 * u * (E.pupil || 1));""",
"""      inkFill(g, ellP(x, eyeY - 4 * u, 21 * u * k, 24 * u, 0, 360, 32), '#ffffff', 6 * u);
      if (o.iris) dt(g, x + look * 9 * u * k, eyeY - 2 * u, 12 * u * (E.pupil || 1), o.iris);
      dt(g, x + look * 9 * u * k, eyeY - 2 * u, 7.5 * u * (E.pupil || 1) * (o.iris ? 0.7 : 1));
      if (o.iris) dt(g, x + look * 9 * u * k + 4 * u, eyeY - 6 * u, 3 * u, '#ffffff');""")
rep("""      g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 13 * u * k, 11 * u, 0, 180, 16)); g.fillStyle = CK; g.fill(); g.restore();""",
"""      g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 13 * u * k, 11 * u, 0, 180, 16)); g.fillStyle = o.iris || CK; g.fill(); g.restore();
      if (o.iris) { g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 6.5 * u * k, 6 * u, 0, 180, 12)); g.fillStyle = CK; g.fill(); g.restore(); }""")
rep("""} else if (typ === 'dot') dt(g, x + look * 6 * u, eyeY, 8 * u);""",
"""} else if (typ === 'dot') { if (o.iris) dt(g, x + look * 6 * u, eyeY, 11 * u, o.iris); dt(g, x + look * 6 * u, eyeY, o.iris ? 6 * u : 8 * u); }""")
rep("""  // nose hint for 3/4 turns""",
"""  if (o.freckles) for (const s of [-1, 1]) for (let k = 0; k < 4; k++) dt(g, fx + s * (30 + (k % 2) * 13 + k * 4) * u, cy + (14 + (k > 1 ? 9 : 0) + (k % 2) * 4) * u, 3.4 * u, '#c8784a');
  if (o.glasses) for (const e of eyes) { inkFill(g, ellP(e.x, eyeY - 2 * u, 27 * u * e.k, 24 * u, 0, 360, 24), 'rgba(220,240,255,0.25)', 5 * u); }
  if (o.glasses) ln(g, [[eyes[0].x + 26 * u, eyeY - 6 * u], [eyes[1].x - 26 * u, eyeY - 6 * u]], 5 * u);
  if (o.sweat) for (const [sx, sy] of [[-1, -40], [1, -20], [1, -60]]) inkFill(g, [[cx + sx * rx * 0.86, cy + sy * u - 16 * u], [cx + sx * rx * 0.86 + 9 * u, cy + sy * u + 6 * u], [cx + sx * rx * 0.86, cy + sy * u + 12 * u], [cx + sx * rx * 0.86 - 9 * u, cy + sy * u + 6 * u]], '#bfe6ff', 3.5 * u);
  // nose hint for 3/4 turns""")
rep("""    case 'flatcap': {""",
"""    case 'cowboy': {
      const brim = [];
      for (let i = 0; i <= 40; i++) { const a = dg(180 + 180 * i / 40); brim.push([cx + 190 * u * Math.cos(a), top + 26 * u + 22 * u * Math.sin(a) - Math.abs(Math.cos(a)) ** 3 * 34 * u]); }
      for (let i = 40; i >= 0; i--) { const a = dg(180 + 180 * i / 40); brim.push([cx + 190 * u * Math.cos(a), top + 36 * u - 14 * u * Math.sin(a) - Math.abs(Math.cos(a)) ** 3 * 30 * u]); }
      shaded(g, [[cx - 78 * u, top + 22 * u], [cx - 70 * u, top - 64 * u], [cx - 34 * u, top - 84 * u], [cx, top - 66 * u], [cx + 34 * u, top - 84 * u], [cx + 72 * u, top - 64 * u], [cx + 80 * u, top + 22 * u]], c, shadeC(c, 0.72), 8 * u);
      inkFill(g, [[cx - 78 * u, top - 4 * u], [cx + 80 * u, top - 4 * u], [cx + 80 * u, top + 16 * u], [cx - 78 * u, top + 16 * u]], b, 5 * u);
      shaded(g, brim, c, shadeC(c, 0.78), 8 * u, [0, -0.25]);
      ln(g, [[cx, top - 66 * u], [cx, top - 30 * u]], 4 * u, shadeC(c, 0.7));
      break;
    }
    case 'visor': {
      inkFill(g, [[cx - 104 * u, top + 40 * u], [cx + 104 * u, top + 40 * u], [cx + 100 * u, top + 58 * u], [cx - 100 * u, top + 58 * u]], shadeC(c, 0.8), 6 * u);
      inkFill(g, [[cx - 100 * u, top + 52 * u], [cx + 100 * u, top + 52 * u], [cx + 150 * u, top + 104 * u], [cx - 150 * u, top + 104 * u]], 'rgba(60,170,90,0.82)', 7 * u);
      break;
    }
    case 'flatcap': {""")
rep("""  else if (kind === 'key') {""",
"""  else if (kind === 'hat') { g.save(); g.translate(x, y - 30); g.rotate(dg(-15 * side)); inkFill(g, ellP(0, 20, 110, 22), '#b8875a', 7); inkFill(g, [[-50, 20], [-44, -50], [0, -62], [44, -50], [50, 20]], '#b8875a', 7); inkFill(g, [[-50, 0], [50, 0], [50, 16], [-50, 16]], '#6a4426', 5); g.restore(); }
  else if (kind === 'binoc') { inkFill(g, ellP(x - 22, y - 10, 22, 30), '#3a3a40', 6); inkFill(g, ellP(x + 22, y - 10, 22, 30), '#3a3a40', 6); inkFill(g, ellP(x - 22, y - 30, 14, 8), '#a8d0f0', 4); inkFill(g, ellP(x + 22, y - 30, 14, 8), '#a8d0f0', 4); }
  else if (kind === 'megaphone') { inkFill(g, [[x - 10, y - 14], [x + 110 * side, y - 70], [x + 120 * side, y + 50], [x - 10, y + 14]], '#c8a050', 7); inkFill(g, ellP(x + 115 * side, y - 10, 14, 60), '#8a6a30', 6); }
  else if (kind === 'news') { inkFill(g, [[x - 80, y - 110], [x + 80, y - 110], [x + 80, y + 40], [x - 80, y + 40]], '#f2ead6', 6); ln(g, [[x - 66, y - 82], [x + 66, y - 82]], 12, '#2a2228'); for (let k = 0; k < 5; k++) ln(g, [[x - 66, y - 50 + k * 18], [x + 66, y - 50 + k * 18]], 4, '#8a8070'); }
  else if (kind === 'key') {""")
rep("""  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  drawLegs(g, s, o, { y1: s.robe ? 925 : 705 });""",
"""  if (o.tilt) { const py = o.legs === 'none' || o.legs === 'ride' || o.legs === 'rideSide' ? 705 : 975; g.translate(300, py); g.rotate(dg(o.tilt)); g.translate(-300, -py); }
  if (o.scarfTail) { const st = o.scarfTail, ph = st.ph || 0, d = st.dir || -1, c = st.c || '#d03a34';
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([300 + d * (40 + t * 230 * (st.len || 1)), 362 - t * 40 * (st.up ?? 1) + Math.sin(ph * 6.283 + t * 5) * 30 * t]); }
    const top = pts.map(([x, y], i) => [x, y - 24 * (1 - i / 10)]), bot = pts.map(([x, y], i) => [x, y + 24 * (1 - i / 10)]).reverse(); inkFill(g, [...top, ...bot], c, 7); }
  if (o.hatBack) { const hc = o.hatBack, dx = o.hatBackDx || 0; ln(g, [[255, 330], [300 + dx, 420], [345, 330]], 4); inkFill(g, ellP(300 + dx, 430, 150, 64), hc, 8); inkFill(g, ellP(300 + dx, 430, 76, 40), shadeC(hc, 0.75), 6); }
  drawLegs(g, s, o, { y1: s.robe ? 925 : 705 });""")
rep("""    ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5);""",
"""    if (s.sleeve) { ln(g, [pts[0], pts[1]], 28); ln(g, [pts[0], pts[1]], 18, s.sleeve); if (s.garter) { const m = [(pts[0][0] + pts[1][0] * 2) / 3, (pts[0][1] + pts[1][1] * 2) / 3]; dt(g, m[0], m[1], 13, s.garter); } }
    ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5);""")
p.write_text(s); print('ok')
