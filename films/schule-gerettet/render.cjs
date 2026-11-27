// Build film.html from the module list and render PNG stills / frame-exact MP4 (1920x1080, 30 fps).
//   node render.cjs stills <name|t> ...        -> stills/<name>.png  (name = a registered still or a time in seconds)
//   node render.cjs mp4 out.mp4 [t0 t1] [--jobs 4]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
const SK = '/root/.claude/skills/synced/4717a1bd-cd09-4f93-a969-d1bc2c78004d_a8063d07-bcae-413f-ba45-94fa5cab70af/noah-character';
const MODS = [SK + '/noah.js', SK + '/places/fonts.js', 'engine3d.js', 'people.js', 'school.js', 'exterior.js', 'shots.js', 'film.js', 'home.js', 's01.js', 's02.js', 's03.js', 'main.js'];
function build() {
  const js = MODS.map(f => `// ---- ${path.basename(f)} ----\n` + fs.readFileSync(path.resolve(__dirname, f), 'utf8')).join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style></head><body><canvas id="film" width="1920" height="1080"></canvas><script>${js}</script></body></html>`;
  fs.writeFileSync(path.join(__dirname, 'film.html'), html); return path.join(__dirname, 'film.html');
}
async function page(b, file) { const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('PAGEERROR', e.message); }); p.on('console', m => { if (m.type() === 'error' || m.type() === 'log') console.log('console:', m.text()); }); await p.goto('file://' + file); await p.waitForFunction(() => window.__film && window.__film.ready, null, { timeout: 60000 }); return p; }
const grab = (p, what, fmt) => p.evaluate(([w, fmt]) => { window.__film.render(w); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [what, fmt]);
(async () => {
  const a = process.argv.slice(2), mode = a[0], file = build();
  const b = await chromium.launch();
  if (mode === 'stills') {
    const p = await page(b, file); fs.mkdirSync(path.join(__dirname, 'stills'), { recursive: true });
    for (const n of a.slice(1)) { const w = isNaN(+n) ? n : +n; fs.writeFileSync(path.join(__dirname, 'stills', `${isNaN(+n) ? n : 't_' + n}.png`), Buffer.from(await grab(p, w, 'image/png'), 'base64')); }
  } else if (mode === 'mp4') {
    const out = a[1], ji = a.indexOf('--jobs'), jobs = ji > 0 ? +a[ji + 1] : 4, nums = a.slice(2).filter((x, i, arr) => x !== '--jobs' && arr[i - 1] !== '--jobs').map(Number);
    const p0 = await page(b, file); const { FPS, DURATION } = await p0.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION }));
    const t0 = nums.length ? nums[0] : 0, t1 = nums.length > 1 ? nums[1] : DURATION, F0 = Math.round(t0 * FPS), N = Math.round((t1 - t0) * FPS);
    const tmp = path.join(__dirname, '.parts'); fs.mkdirSync(tmp, { recursive: true });
    const per = Math.ceil(N / jobs), pages = [p0]; for (let j = 1; j < jobs; j++) pages.push(await page(b, file));
    const t = Date.now();
    await Promise.all(pages.map(async (p, j) => {
      const a0 = j * per, a1 = Math.min(N, a0 + per); if (a0 >= a1) return;
      const part = path.join(tmp, `p${j}.mp4`);
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = a0; f < a1; f++) { const d = await grab(p, (F0 + f) / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (j === 0 && f % 60 === 0) console.log(`frame ${f}/${per} ${((Date.now() - t) / 1000).toFixed(0)}s`); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
    }));
    const list = path.join(tmp, 'list.txt'); fs.writeFileSync(list, pages.map((_, j) => `file 'p${j}.mp4'`).filter((_, j) => j * per < N).join('\n'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames:format=duration', '-of', 'compact', out]).toString().trim());
  }
  await b.close(); console.log('ok');
})();
