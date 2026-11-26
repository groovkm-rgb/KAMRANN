// render one frame per shot (mid) to catch runtime errors in every shot
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + require('path').resolve(process.env.FILM_DIR || process.cwd(), 'film.html') + '?render=1'); await p.waitForFunction(() => window.__film);
  const sc = await p.evaluate(() => window.__film.scenes); let bad = 0;
  for (const s of sc) for (const q of [.05, .5, .95]) { const t = s.start + (s.end - s.start) * q; try { await p.evaluate(t => window.__film.renderAt(t), t); } catch (e) { bad++; console.log('FAIL', s.name, t.toFixed(2), e.message.split('\n')[0]); } }
  console.log('shots', sc.length, 'failures', bad, errs.slice(0, 3)); await b.close(); })();
