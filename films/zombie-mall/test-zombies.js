function renderFrame(c, t) {
  c.fillStyle = '#9aa4b0'; c.fillRect(0, 0, W, H);
  const n = ZOMBIES.length, gap = 1920 / 8.6;
  ZOMBIES.forEach((Z, i) => { const row = Math.floor(i / 8), x = gap * (i % 8 + .8);
    if (row === 0) drawZombieSide(c, Z, { x, y: 500, k: .17, walk: t * 5 + i, t });
    else drawZombieFront(c, Z, { x, y: 1040, k: .17, t, press: i % 2 }); });
}
