// Inlines src/*.js into src/shell.html → index.html (single self-contained file, no external deps).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(join(root, 'src')).filter(f => /^\d\d-.*\.js$/.test(f)).sort();
const js = files.map(f => `// ---- ${f} ----\n` + readFileSync(join(root, 'src', f), 'utf8')).join('\n');
const shell = readFileSync(join(root, 'src', 'shell.html'), 'utf8');
if (!shell.includes('/*__SCRIPT__*/')) throw new Error('shell placeholder missing');
const out = shell.replace('/*__SCRIPT__*/', () => js);
writeFileSync(join(root, 'index.html'), out);
console.log(`index.html written: ${(out.length / 1024).toFixed(1)} KB from ${files.length} modules`);
