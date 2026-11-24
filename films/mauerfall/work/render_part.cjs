// render frames [a, b) of film.html at 1920x1080 into an H.264 segment (no audio)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => {
  const [dir, a, b, out] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
  const src = path.join(dir, 'film.html'), dst = path.join(dir, `film-r${a}.html`);
  fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080').replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}'));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(dst) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const FPS = await p.evaluate(() => window.__film.FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    const d = await p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/jpeg', .93).split(',')[1]; }, f / FPS);
    if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 500 === 0) console.log(`part ${a}: ${f - a}/${b - a}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close(); fs.unlinkSync(dst); console.log('DONE', a, b, errs.slice(0, 3));
})();
