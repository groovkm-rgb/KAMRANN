// node render_mp4.mjs <dir|film.html> [out.mp4] [--crf 18] [--from s] [--to s]
// Renders every frame headlessly → H.264 1920x1080, exact frame count, NO audio stream (the user adds voice-over).
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { resolve, dirname, join } from 'node:path';
import { htmlOf, openFilm } from './_common.mjs';
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const html = htmlOf(a[0] || '.'), out = resolve(a[1] && !a[1].startsWith('--') ? a[1] : join(dirname(html), 'film.mp4'));
const { browser, info, frame } = await openFilm(html);
const f0 = Math.round(+opt('from', 0) * info.FPS), f1 = Math.round(+opt('to', info.DURATION) * info.FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(info.FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', opt('crf', '18'), '-pix_fmt', 'yuv420p', '-r', String(info.FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = f0; f < f1; f++) { const b = Buffer.from(await frame(f / info.FPS, 'jpeg', 0.96), 'base64'); if (!ff.stdin.write(b)) await once(ff.stdin, 'drain');
  if ((f - f0) % 30 === 0 || f === f1 - 1) process.stdout.write(`\rframe ${f + 1}/${f1}  ${((f - f0 + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps   `); }
ff.stdin.end(); const [code] = await once(ff, 'close'); await browser.close();
if (code) { console.error('\nffmpeg failed'); process.exit(code); }
console.log('\n' + execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,width,height,nb_frames,r_frame_rate', '-of', 'compact', out]).toString().trim());
console.log('wrote ' + out);
