// usage: node tools_local/frame.mjs [shotId,...]  -> screen positions (px) of every actor card centre/top per sample frame
const S = await import('../web/story.js');
const T = new Proxy({ WEST: new Proxy({}, { get: () => ({}) }) }, { get: (o, k) => (k in o ? o[k] : () => {}) });
const want = process.argv[2] ? process.argv[2].split(',') : null;
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nrm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
for (const sh of S.SHOTS) {
  if (want && !want.includes(sh.id)) continue;
  for (const k of [0.1, 0.5, 0.9]) {
    const f = Math.round(sh.a + (sh.b - sh.a) * k), C = S.camAt(f);
    const fw = nrm(sub(C.look, C.pos)); let rt = nrm(cross(fw, [0, 1, 0])), up = cross(rt, fw); const r = (C.roll || 0) * Math.PI / 180;
    const rt2 = rt.map((v, i) => v * Math.cos(r) + up[i] * Math.sin(r)), up2 = up.map((v, i) => v * Math.cos(r) - rt[i] * Math.sin(r));
    const ty = Math.tan(C.fov * Math.PI / 360), tx = ty * 1080 / 1920;
    const proj = (p) => { const d = sub(p, C.pos), z = dot(d, fw); if (z <= 0) return 'behind'; const x = dot(d, rt2) / (z * tx), y = dot(d, up2) / (z * ty); return [Math.round((x + 1) * 540), Math.round((1 - y) * 960), +z.toFixed(1)]; };
    const acts = [...S.actorsAt(f, T), ...S.fxAt(f, T)].map((a) => { const s = a.s || 1; return `${a.key.slice(0, 6)} c${JSON.stringify(proj([a.x, a.y + s * 2.25 * 0.45, a.z]))} top${JSON.stringify(proj([a.x, a.y + s * 2.25 * 0.85, a.z]))} foot${JSON.stringify(proj([a.x, a.y, a.z]))}`; });
    const extra = sh.probe ? sh.probe.map((p) => `${p[0]}${JSON.stringify(proj(p[1]))}`) : [];
    console.log(sh.id, f, acts.join(' | '), extra.join(' '));
  }
}
