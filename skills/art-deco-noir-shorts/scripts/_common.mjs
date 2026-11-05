// Shared helpers for the art-deco-noir-shorts scripts.
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ENGINE = join(SKILL, 'assets', 'engine');
export const SHARED = ['01-core.js', '02-fx.js', '03-head.js', '04-body.js', '05-sets.js', '05b-scene-kit.js'].map(f => join(ENGINE, f));
export const PLAYER = join(ENGINE, '07-player.js');

export function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const base of [process.cwd(), SKILL]) {
    try { return createRequire(join(base, 'x.js'))('playwright'); } catch {}
  }
  try { return require('playwright'); } catch {}
  console.error('Playwright is required: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}
export async function launch() {
  const { chromium } = loadPlaywright();
  const opts = { args: ['--allow-file-access-from-files'] };
  if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  return chromium.launch(opts);
}
export function readFilm(dir) {
  dir = resolve(dir);
  const cfgPath = join(dir, 'film.json');
  if (!existsSync(cfgPath)) { console.error(`No film.json in ${dir} — create one with scripts/new_film.mjs`); process.exit(1); }
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  cfg.fadeOut ??= Math.max(0.5, cfg.duration - 1.4);
  const mods = [];
  for (const lib of cfg.libraries || []) mods.push(join(SKILL, 'assets', 'library', lib.endsWith('.js') ? lib : lib + '.js'));
  for (const f of cfg.modules || ['sets.js', 'scenes.js']) { const p = join(dir, f); if (existsSync(p)) mods.push(p); }
  return { dir, cfg, mods, html: join(dir, 'film.html') };
}
export const fileUrl = p => pathToFileURL(p).href;
export function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
