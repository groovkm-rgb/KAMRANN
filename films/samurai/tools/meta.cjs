const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.resolve(process.argv[2], 'film.html')); await p.waitForFunction(() => window.__film && window.__film.meta);
  const m = await p.evaluate(() => window.__film.meta()); fs.writeFileSync(path.join(process.argv[2], 'shots.json'), JSON.stringify(m, null, 1)); await b.close(); })();
