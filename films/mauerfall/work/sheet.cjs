// QA: render the middle frame of every shot (or given times) as thumbnails -> contact sheets
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
(async () => {
  const dir = process.argv[2], out = process.argv[3], from = +(process.argv[4] || 0), to = +(process.argv[5] || 1e9);
  const src = path.join(dir, 'film.html'), dst = path.join(dir, 'film-qa.html');
  fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080').replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(dst) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 }).catch(() => {});
  const sc = await p.evaluate(() => window.__film ? window.__film.scenes : null); if (!sc) { console.log('NO FILM', errs); process.exit(1); }
  fs.mkdirSync(out, { recursive: true }); const list = [];
  for (let i = 0; i < sc.length; i++) { if (i < from || i >= to) continue; const s = sc[i], t = (s.start + s.end) / 2; const d = await p.evaluate(t => { try { window.__film.renderAt(t); } catch (e) { return 'ERR ' + e.message; } return document.getElementById('film').toDataURL('image/jpeg', .8).split(',')[1]; }, t); if (d.startsWith('ERR')) { console.log(i, s.name, d); continue; } const f = path.join(out, `s${String(i).padStart(3, '0')}.jpg`); fs.writeFileSync(f, Buffer.from(d, 'base64')); list.push([f, `${i} ${s.start.toFixed(1)}s ${s.name}`]); }
  fs.writeFileSync(path.join(out, 'list.json'), JSON.stringify(list)); console.log('shots', sc.length, 'rendered', list.length, errs.slice(0, 5)); await b.close(); fs.unlinkSync(dst);
})();
