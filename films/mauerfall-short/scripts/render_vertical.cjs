// Frame-exact vertical render (1080x1920) of film.html to a silent H.264 MP4.
//   node scripts/render_vertical.cjs <filmDir> <out.mp4>
const { chromium } = require('playwright'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [dir, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(dir, 'film.html') + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION })), N = Math.round(DURATION * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    const d = await p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/jpeg', .94).split(',')[1]; }, f / FPS);
    if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 100 === 0) console.log(`frame ${f}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  if (errs.length) console.log('ERRORS', errs.slice(0, 5)); await b.close(); console.log('done', N, 'frames');
})();
