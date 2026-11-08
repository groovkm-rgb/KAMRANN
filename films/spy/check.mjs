// Projects actors of each shot to screen px (1080x1920) at start/mid/end frames: flags anything outside the frame.
const ST = await import('./web/story.js');
const T = new Proxy({}, { get: () => () => {} });
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nrm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const proj = (C, p) => {
  const f = nrm(sub(C.look, C.pos)); let r = nrm(cross(f, [0, 1, 0])), u = cross(r, f);
  const ro = (C.roll || 0) * Math.PI / 180, c = Math.cos(ro), s = Math.sin(ro);
  const r2 = r.map((v, i) => v * c + u[i] * s), u2 = u.map((v, i) => -r[i] * s + v * c);
  const d = sub(p, C.pos), z = dot(d, f), th = Math.tan(C.fov * Math.PI / 360);
  return [Math.round((dot(d, r2) / (z * th * 1080 / 1920) + 1) / 2 * 1080), Math.round((1 - dot(d, u2) / (z * th)) / 2 * 1920), z.toFixed(1)];
};
for (const S of ST.SHOTS) {
  const line = [];
  for (const f of [S.a, Math.round((S.a + S.b) / 2), S.b]) {
    const C = ST.camAt(f), A = ST.actorsAt(f, T).filter((a) => !a.add);
    const pts = A.map((a) => { const s = a.s || 1, head = a.flat ? [a.x, a.y, a.z] : [a.x, a.y + 1.55 * s, a.z]; const [x, y, z] = proj(C, head); const [, yf] = a.flat ? [0, y] : proj(C, [a.x, a.y, a.z]);
      const bad = x < 40 || x > 930 || y < 0 || y > 1920 || z < 0; const top = !a.flat && y < 690; return `${a.key.replace(/[{].*/, '').slice(0, 9)}(${x},${y}${a.flat ? '' : '/' + yf})${bad ? "!!" : ""}${top ? "^" : ""}`; });
    line.push(`f${f}: ${pts.join(' ')}`);
  }
  console.log(S.id.padEnd(5), line.join(' | '));
}
