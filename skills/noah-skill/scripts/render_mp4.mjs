// node render_mp4.mjs <dir|film.html> [out.mp4] [--crf 18] [--from s] [--to s] [--no-audio]
// Renders every frame headlessly → H.264 1920x1080, exact frame count; then synthesizes music + SFX
// (scripts/audio.py, from the film's cue sheet) and muxes them in as AAC. No speech, no subtitles.
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { writeFileSync, renameSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { htmlOf, openFilm, SKILL } from './_common.mjs';
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const html = htmlOf(a[0] || '.'), out = resolve(a[1] && !a[1].startsWith('--') ? a[1] : join(dirname(html), 'film.mp4'));
const withAudio = !a.includes('--no-audio');
const { browser, page, info, frame } = await openFilm(html);
const f0 = Math.round(+opt('from', 0) * info.FPS), f1 = Math.round(+opt('to', info.DURATION) * info.FPS);
const vtmp = out.replace(/\.mp4$/, '') + '.video.mp4';
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(info.FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', opt('crf', '18'), '-pix_fmt', 'yuv420p', '-r', String(info.FPS), '-movflags', '+faststart', withAudio ? vtmp : out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = f0; f < f1; f++) { const b = Buffer.from(await frame(f / info.FPS, 'jpeg', 0.96), 'base64'); if (!ff.stdin.write(b)) await once(ff.stdin, 'drain');
  if ((f - f0) % 30 === 0 || f === f1 - 1) process.stdout.write(`\rframe ${f + 1}/${f1}  ${((f - f0 + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps   `); }
ff.stdin.end(); const [code] = await once(ff, 'close');
const audio = await page.evaluate(() => window.__film.audio); await browser.close();
if (code) { console.error('\nffmpeg failed'); process.exit(code); }
if (withAudio) {
  const cj = out.replace(/\.mp4$/, '') + '.cues.json', wav = out.replace(/\.mp4$/, '') + '.wav';
  if (f0 || f1 !== Math.round(info.DURATION * info.FPS)) { audio.cues = audio.cues.map((c) => ({ ...c, t: c.t - f0 / info.FPS })); audio.sections = audio.sections.map((s) => ({ ...s, t: Math.max(0, s.t - f0 / info.FPS) })); audio.duration = (f1 - f0) / info.FPS; }
  writeFileSync(cj, JSON.stringify(audio, null, 1));
  console.log('\n' + execFileSync('python3', [join(SKILL, 'scripts/audio.py'), cj, wav]).toString().trim());
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', vtmp, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  rmSync(vtmp); rmSync(wav); if (!a.includes('--keep-cues')) rmSync(cj);
}
console.log('\n' + execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,width,height,nb_frames', '-of', 'compact', out]).toString().trim());
console.log('wrote ' + out);
