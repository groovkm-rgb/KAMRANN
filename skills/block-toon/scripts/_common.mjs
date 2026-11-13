// Shared helpers for winter-block-toon scripts.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const fileUrl = p => pathToFileURL(p).href;
export function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
export async function launch() {
  let pw; for (const base of [process.cwd(), SKILL]) { try { pw = createRequire(join(base, 'x.js'))('playwright'); break; } catch {} }
  if (!pw) { try { pw = createRequire(import.meta.url)('playwright'); } catch { console.error('Playwright required: npm i -D playwright'); process.exit(1); } }
  const opts = {}; if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  return pw.chromium.launch(opts);
}
// Build <dir>/film.html from the engine + <dir>/scenes.js. Returns {dir, cfg, html}.
export function build(dir) {
  dir = resolve(dir);
  const cfg = JSON.parse(readFileSync(join(dir, 'film.json'), 'utf8'));
  const eng = ['engine.js', 'character.js'].map(f => readFileSync(join(SKILL, 'assets', f), 'utf8')).join('\n');
  const scenes = (cfg.modules || ['scenes.js']).filter(f => existsSync(join(dir, f))).map(f => readFileSync(join(dir, f), 'utf8')).join('\n');
  const html = readFileSync(join(SKILL, 'assets', 'shell.html'), 'utf8').replace('__TITLE__', cfg.title).replace('/*__ENGINE__*/', () => eng).replace('/*__SCENES__*/', () => scenes);
  writeFileSync(join(dir, 'film.html'), html);
  return { dir, cfg, html: join(dir, 'film.html') };
}
