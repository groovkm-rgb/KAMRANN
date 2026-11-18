// Resumable segmented renderer: node render_seg.cjs <filmDir> <outDir> <worker> <workers> <f0> <f1> [segLen]
// Renders frames [f0, f1) in segments of segLen frames -> outDir/seg_<start>.mp4. Finished segments are skipped,
// unfinished ones are written to a .part file and renamed when complete, so an interruption only loses one segment.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [dir, out, wi, wn, f0, f1, sl] = process.argv.slice(2); const W = +wi, WN = +wn, A = +f0, B = +f1, SEG = +(sl || 240), FPS = 30;
  const segs = []; for (let s = A; s < B; s += SEG) segs.push([s, Math.min(B, s + SEG)]);
  const mine = segs.filter((_, i) => i % WN === W).filter(([s]) => !fs.existsSync(path.join(out, `seg_${String(s).padStart(6, '0')}.mp4`)));
  if (!mine.length) { console.log('worker', W, 'nothing to do'); return; }
  const src = path.join(dir, 'film.html'), dst = path.join(dir, `film-169-${process.pid}.html`);
  fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080').replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}'));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(dst) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const grab = t => p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/jpeg', .96).split(',')[1]; }, t);
  for (const [s, e] of mine) {
    const name = path.join(out, `seg_${String(s).padStart(6, '0')}.mp4`), tmp = name + '.part.mp4';
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = s; f < e; f++) { const d = await grab(f / FPS); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(tmp, name);
    console.log('worker', W, 'done', s, e, new Date().toISOString());
  }
  await b.close(); fs.unlinkSync(dst);
})().catch(e => { console.error(e); process.exit(1); });
