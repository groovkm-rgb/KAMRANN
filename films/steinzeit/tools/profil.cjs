const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///tmp/claude-0/profil.html'); await p.waitForFunction(() => window.done, null, { timeout: 15000 }).catch(() => { console.log('ERR', errs); process.exit(1); });
  for (const [id, n] of [['a', 'warm'], ['b', 'blau'], ['c', 'steinzeit']]) { const d = await p.evaluate(id => document.getElementById(id).toDataURL('image/png').split(',')[1], id); fs.writeFileSync(process.argv[2] + '/noah_profil_' + n + '.png', Buffer.from(d, 'base64')); }
  await b.close(); })();
