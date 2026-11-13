// node scripts/build.mjs <filmDir>  → <filmDir>/film.html (single self-contained file)
import { build } from './_common.mjs';
const { html } = build(process.argv[2] || '.'); console.log('built ' + html);
