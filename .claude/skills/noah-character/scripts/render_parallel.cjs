// Render stills or a frame range of film.html to MP4 (no audio).
//   node tools/render.cjs stills t1 t2 ...            -> stills/t_<t>.png
//   node tools/render.cjs mp4 out.mp4 [f0] [f1] [html] -> frames [f0, f1)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const HERE = path.resolve(process.env.FILM_DIR || process.cwd());
(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const html = mode === 'mp4' && rest[3] ? rest[3] : (process.env.HTML || 'film.html');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(HERE, html) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 30000 }).catch(e => { console.log('ERRS', errs); throw e; });
  await p.evaluate(() => document.fonts.ready);
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [t, fmt]);
  const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION }));
  if (mode === 'stills') {
    fs.mkdirSync(path.join(HERE, 'stills'), { recursive: true });
    for (const t of rest) fs.writeFileSync(path.join(HERE, 'stills', `t_${t}.png`), Buffer.from(await grab(+t, 'image/png'), 'base64'));
  } else {
    const out = rest[0], N = Math.round(DURATION * FPS), f0 = +(rest[1] || 0), f1 = Math.min(N, +(rest[2] || N));
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      const d = await grab((f + .001) / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 300 === 0) console.log(`frame ${f}/${f1} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 10)); await b.close(); console.log('ok', DURATION);
})();
