// print sample frame list for a time range: node tools/frames.mjs a b perShot
import { SHOTS } from '../web/story.js';
const [,, a = 0, b = 300, n = 3] = process.argv; const out = [];
for (const s of SHOTS) if (s.a >= +a && s.b <= +b) for (let i = 0; i < +n; i++) out.push(Math.round(s.fa + (s.fb - s.fa) * (i + 0.5) / +n));
console.log(out.join(','));
