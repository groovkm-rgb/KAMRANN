// node render.cjs <filmDir> [t1 t2 ...] [--mp4 out.mp4] [--from s --to s] [--sheet name.png t1 t2 ...]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const args = process.argv.slice(2), dir = args[0];
  const opt = n => { const i = args.indexOf(n); return i > 0 ? args[i + 1] : null; };
  const out = opt('--mp4'), from = +(opt('--from') || 0), to = opt('--to');
  const times = args.slice(1).filter((a, i, A) => !a.startsWith('--') && !(A[i - 1] || '').startsWith('--'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(dir, 'film.html')); await p.waitForFunction(() => window.__film && window.__fontsOk, null, { timeout: 60000 });
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [t, fmt]);
  fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const t of times) fs.writeFileSync(path.join(dir, 'stills', `t_${(+t).toFixed(2)}.png`), Buffer.from(await grab(+t, 'image/png'), 'base64'));
  if (out) {
    const D = await p.evaluate(() => window.__film.DURATION), FPS = 30, f0 = Math.round(from * FPS), f1 = Math.round((to ? +to : D) * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) { const d = await grab(f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stdout.write(`${f}/${f1} `); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('\nvideo', out, f1 - f0, 'frames');
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 10)); await b.close(); console.log('ok');
})();
