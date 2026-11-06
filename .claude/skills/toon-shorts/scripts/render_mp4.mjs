// Frame-exact MP4: renders every frame headlessly, H.264 yuv420p, exact frame count, NO audio stream.
//   node scripts/render_mp4.mjs <dir> [out.mp4] [--crf 20] [--from s] [--to s]
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { join } from 'node:path';
import { readFilm, openFilm, arg, positional } from './_common.mjs';
const [dirArg, outArg] = positional();
const { html, cfg, dir } = readFilm(dirArg || '.');
const out = outArg || join(dir, `${cfg.slug}.mp4`);
const { b, p, errs } = await openFilm(html);
const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION }));
const f0 = Math.round(+arg('from', 0) * FPS), f1 = Math.round(+arg('to', DURATION) * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow',
  '-crf', arg('crf', '20'), '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  const d = await p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/jpeg', .95).split(',')[1]; }, f / FPS);
  if (!ff.stdin.write(Buffer.from(d, 'base64'))) await once(ff.stdin, 'drain');
  if ((f - f0) % FPS === 0 || f === f1 - 1) process.stdout.write(`\rframe ${f + 1}/${f1}  ${((f - f0 + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps   `);
}
ff.stdin.end(); const [code] = await once(ff, 'close'); await b.close();
if (errs.length) console.log('\nPAGE ERRORS:\n' + errs.join('\n'));
if (code) { console.error(`\nffmpeg exited with ${code}`); process.exit(code); }
console.log(`\nwrote ${out}: ${f1 - f0} frames @ ${FPS} fps = ${((f1 - f0) / FPS).toFixed(3)} s`);
console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames:format=duration,size', '-of', 'compact', out]).toString().trim());
