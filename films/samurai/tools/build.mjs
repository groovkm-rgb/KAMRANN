// node build.mjs <filmDir>  -> <filmDir>/film.html (modules from film.json, fonts inlined)
import fs from 'fs'; import path from 'path';
const dir = process.argv[2], cfg = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));
const lib = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../lib');
const font = (fam, f) => `@font-face{font-family:'${fam}';src:url(data:font/woff2;base64,${fs.readFileSync(path.join(lib, 'fonts', f)).toString('base64')}) format('woff2');}`;
const css = [font('Shojumaru', 'shojumaru-latin-400-normal.woff2'), font('Kaushan', 'kaushan-script-latin-400-normal.woff2'), font('CaveatBrush', 'caveat-brush-latin-400-normal.woff2')].join('\n');
const js = cfg.modules.map(m => { const p = m.startsWith('lib:') ? path.join(lib, m.slice(4)) : path.join(dir, m); return `// ---- ${m}\n` + fs.readFileSync(p, 'utf8'); }).join('\n');
const html = `<!doctype html><html><head><meta charset="utf-8"><title>${cfg.title || 'film'}</title><style>${css}
html,body{margin:0;background:#000}canvas{display:block;width:100vw;max-width:1920px}</style></head><body>
<canvas id="film" width="1920" height="1080"></canvas>
<div style="font-family:Shojumaru;position:absolute;opacity:0">ä</div><div style="font-family:Kaushan;position:absolute;opacity:0">ä</div><div style="font-family:CaveatBrush;position:absolute;opacity:0">ä</div>
<script>
window.__ready = Promise.all(['Shojumaru','Kaushan','CaveatBrush'].map(f => document.fonts.load('40px ' + f, 'Aäß'))).then(() => { window.__fontsOk = true; });
${js}
</script></body></html>`;
fs.writeFileSync(path.join(dir, 'film.html'), html); console.log('built', path.join(dir, 'film.html'), (html.length / 1e6).toFixed(2) + ' MB');
