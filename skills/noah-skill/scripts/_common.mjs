import { createRequire } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const SKILL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** Playwright from the project, the skill folder, or a global install */
export function playwright() {
  const bases = [join(process.cwd(), 'x.js'), join(SKILL, 'x.js'), '/opt/node-tools/x.js'];
  try { const { execSync } = require_('node:child_process'); bases.push(join(execSync('npm root -g').toString().trim(), 'x.js')); } catch {}
  for (const b of bases) { try { return createRequire(b)('playwright'); } catch {} }
  console.error('Playwright not found: npm i -D playwright && npx playwright install chromium'); process.exit(1);
}
const require_ = createRequire(import.meta.url);
/** accept a film folder (with film.html) or an html file */
export function htmlOf(p) { p = resolve(p); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'film.html'); if (!existsSync(p)) { console.error('not found: ' + p + ' (build first)'); process.exit(1); } return p; }
export async function openFilm(html) {
  const { chromium } = playwright();
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = []; page.on('pageerror', (e) => { errors.push(e.message); console.error('page error:', e.message); });
  await page.goto('file://' + html + '?render=1'); await page.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const info = await page.evaluate(() => ({ FPS: __film.FPS, DURATION: __film.DURATION, scenes: __film.scenes }));
  const frame = async (t, type = 'jpeg', q = 0.95) => page.evaluate(([t, type, q]) => { __film.renderAt(t); return document.getElementById('film').toDataURL('image/' + type, q).split(',')[1]; }, [t, type, q]);
  return { browser, page, info, frame, errors };
}
