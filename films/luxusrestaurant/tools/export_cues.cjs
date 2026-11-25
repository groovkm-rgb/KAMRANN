// dump window.__cues / __moods / __shots from film.html to audio/full_cues.json
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.resolve(__dirname, '..', 'film.html') + '?render=1');
  await p.waitForFunction(() => window.__cues, null, { timeout: 60000 }); const d = await p.evaluate(() => ({ cues: window.__cues, moods: window.__moods, shots: window.__shots, duration: window.__film.DURATION }));
  fs.writeFileSync(path.resolve(__dirname, '..', 'audio', 'full_cues.json'), JSON.stringify(d, null, 0)); console.log(d.cues.length, 'cues', d.moods.length, 'moods', d.shots.length, 'shots', d.duration); await b.close(); })();
