// dump shot list (name, start, end) of a built film: node shots.cjs <filmDir> <out.json>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.resolve(process.argv[2], 'film.html') + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  fs.writeFileSync(process.argv[3], JSON.stringify(await p.evaluate(() => window.__film.scenes.map(s => ({ type: s.name.split(' ')[1], s: s.start, e: s.end }))))); await b.close(); })();
