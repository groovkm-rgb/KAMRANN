// Shared helpers for the toon-shorts scripts.
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ENGINE = join(SKILL, 'assets', 'engine');
export const ENGINE_FILES = ['toon.js', 'sets.js'].map(f => join(ENGINE, f));

export function loadPlaywright() {
  for (const base of [process.cwd(), SKILL]) { try { return createRequire(join(base, 'x.js'))('playwright'); } catch {} }
  try { return createRequire(import.meta.url)('playwright'); } catch {}
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
  if (!existsSync(cfgPath)) { console.error(`No film.json in ${dir}: create one with scripts/new_film.mjs`); process.exit(1); }
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  cfg.fps ??= 30;
  const mods = [];
  for (const f of cfg.modules || ['cast.js', 'props.js', 'scenes.js']) { const p = join(dir, f); if (existsSync(p)) mods.push(p); }
  return { dir, cfg, mods, html: join(dir, 'film.html') };
}
export async function openFilm(html) {
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(pathToFileURL(html).href + '?render=1');
  await p.waitForFunction(() => window.__film, null, { timeout: 15000 }).catch(() => {});
  return { b, p, errs };
}
export function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
export const positional = () => { const out = []; const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) { if (a[i].startsWith('--')) { i++; continue; } out.push(a[i]); } return out; };
