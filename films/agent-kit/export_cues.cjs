// node export_cues.cjs <filmDir>  → <filmDir>/cues.json (sound cues registered by the film's scenes)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const dir = process.argv[2], b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.resolve(dir, 'film.html') + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const cues = await p.evaluate(() => window.__cues.slice().sort((a, b) => a.at - b.at)); fs.writeFileSync(path.join(dir, 'cues.json'), JSON.stringify(cues, null, 1));
  console.log(cues.length, 'cues'); await b.close(); })();
