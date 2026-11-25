// Contact sheets: one thumbnail per shot (at 55 % of the shot), 6x5 per sheet. node sheet.cjs <filmDir> <outPrefix>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const dir = process.argv[2], out = process.argv[3];
  const src = path.join(dir, 'film.html'), dst = path.join(dir, 'film-169.html');
  fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080').replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(dst) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const n = await p.evaluate(() => window.__film.scenes.length); console.log('shots', n, 'duration', await p.evaluate(() => window.__film.DURATION));
  for (let s0 = 0, sh = 0; s0 < n; s0 += 30, sh++) {
    const data = await p.evaluate(([s0, n]) => { const cv = document.createElement('canvas'); cv.width = 6 * 320; cv.height = 5 * 200; const q = cv.getContext('2d'); q.fillStyle = '#111'; q.fillRect(0, 0, cv.width, cv.height); const sc = window.__film.scenes; const bad = [];
      for (let i = s0; i < Math.min(n, s0 + 30); i++) { const s = sc[i]; try { window.__film.renderAt(s.start + (s.end - s.start) * .55); } catch (e) { bad.push(i + ': ' + e.message); continue; } const k = i - s0; q.drawImage(document.getElementById('film'), (k % 6) * 320, Math.floor(k / 6) * 200, 316, 178); q.fillStyle = '#fff'; q.font = '14px sans-serif'; q.fillText(s.name + ' ' + s.start.toFixed(1), (k % 6) * 320 + 4, Math.floor(k / 6) * 200 + 194); }
      return [cv.toDataURL('image/jpeg', .85).split(',')[1], bad]; }, [s0, n]);
    fs.writeFileSync(`${out}_${sh}.jpg`, Buffer.from(data[0], 'base64')); if (data[1].length) console.log('ERR', data[1]);
  }
  if (errs.length) console.log('PAGEERR', errs.slice(0, 5)); await b.close(); fs.unlinkSync(dst);
})();
