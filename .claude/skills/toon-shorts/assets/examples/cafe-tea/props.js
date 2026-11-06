// Film-only helpers for "Tea at the Café".
const TABLE = { x: 0, top: -280, w: 440 };
// a held teapot (item function: origin = hand, drawn before the hand)
const heldTeapot = (c) => { c.save(); c.scale(.85, .85); PROPS.teapot(c, -20, 60); c.restore(); };
// spout of the held teapot in world space, for the pour stream
function spoutWorld(p, t) {
  const sol = armSolve(p.main, t), [hx, hy] = handWorld(p, 'main', t), s = p.s || 1;
  const lx = (104 - 20) * .85, ly = (-100 + 60) * .85, ca = Math.cos(sol.ang), sa = Math.sin(sol.ang);
  return [hx + s * (ca * lx - sa * ly), hy + (sa * lx + ca * ly)];
}
function cafeTable(c, t, glasses) {
  PROPS.table(c, TABLE.x, { top: TABLE.top, w: TABLE.w, legs: 'pedestal', cloth: '#f7f2e6' });
  PROPS.plate(c, -10, TABLE.top + 6, { simit: true });
  PROPS.sugar(c, 70, TABLE.top + 2);
  for (const g of glasses) PROPS.teaglass(c, g.x, TABLE.top + 8, { fill: g.fill ?? .85, spoon: true });
}
