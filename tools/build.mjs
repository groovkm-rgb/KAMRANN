// Builds each film into a single self-contained HTML file (no external dependencies).
// Shared modules: src/01–05 (core, FX, head rig, bodies, sets) + src/07 (timeline renderer, player, recorder).
// Film-specific modules: scenes + master timeline (and any extra sets).
//   node tools/build.mjs            → builds every film
//   node tools/build.mjs green-vault → builds one film
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILMS = {
  mafia: {
    out: 'index.html', title: 'What Does a Mafia Boss Actually Do?', slug: 'what-does-a-mafia-boss-actually-do',
    desc: 'A 55-second vertical noir animated documentary rendered live with Canvas. No audio.',
    duration: 55, fadeOut: 52.8, ref: true, modules: ['src/06-scenes.js'],
  },
  'green-vault': {
    out: 'green-vault.html', title: 'The Green Vault Heist · Dresden 2019', slug: 'green-vault-heist-dresden-2019',
    desc: 'A 40-second silent vertical noir animated documentary about the 2019 Green Vault jewel theft in Dresden. No audio.',
    duration: 40, fadeOut: 37.6, ref: false, modules: ['films/green-vault/sets.js', 'films/green-vault/scenes.js'],
  },
  well: {
    out: 'well.html', title: 'The Well', slug: 'the-well',
    desc: 'An 18-second silent vertical Art-Deco short: a man digs until water bursts up, climbs out and celebrates. No audio.',
    duration: 18, fadeOut: 16.6, ref: false, modules: ['films/well/scenes.js'],
  },
};
const shared = ['src/01-core.js', 'src/02-fx.js', 'src/03-head.js', 'src/04-body.js', 'src/05-sets.js', 'src/05b-scene-kit.js'];
const which = process.argv[2] ? [process.argv[2]] : Object.keys(FILMS);
const shell = readFileSync(join(root, 'src', 'shell.html'), 'utf8');
for (const id of which) {
  const f = FILMS[id]; if (!f) throw new Error('unknown film ' + id);
  const cfg = { id, title: f.title, slug: f.slug, duration: f.duration, fadeOut: f.fadeOut, ref: f.ref };
  const files = [...shared, ...f.modules, 'src/07-player.js'];
  const js = `const FILM = ${JSON.stringify(cfg)};\n` + files.map(p => `// ---- ${p} ----\n` + readFileSync(join(root, p), 'utf8')).join('\n');
  const html = shell.replaceAll('{{TITLE}}', f.title).replaceAll('{{DESC}}', f.desc).replaceAll('{{DUR}}', String(f.duration)).replace('/*__SCRIPT__*/', () => js);
  writeFileSync(join(root, f.out), html);
  console.log(`${f.out}: ${(html.length / 1024).toFixed(1)} KB (${files.length} modules, ${f.duration}s)`);
}
