#!/usr/bin/env python3
"""Look v2 patch: lighter, distance-faded world ink (per-shot `ink` in LIGHTS) and optional motion blur
(story.js sets globalThis.mbAt). Idempotent. Usage: python3 patch_look2.py  (from the project folder)"""
import pathlib
m = pathlib.Path("web/main.js"); s = m.read_text()
if "// look2-patch" not in s:
    reps = [
        ("inkU.px.value = 2.5;", "inkU.px.value = L.ink ?? 1.5; // look2-patch"),
        ("e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease",
         "e = max(e, smoothstep(.88, .72, dot(n, ns)) * .35); // crease (look2: soft)"),
        ("return e * (1. - smoothstep(140., 520., d)*.8);",
         "return e * (1. - smoothstep(25., 150., d)*.95); // look2: landscape loses its ink"),
    ]
    for a, b in reps:
        assert a in s, "main.js changed, not found: " + a
        s = s.replace(a, b)
    m.write_text(s)
r = pathlib.Path("render.mjs"); s = r.read_text()
if "mbAt" not in s:
    a = "window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', q);"
    b = ("const c = document.getElementById('c'), n = window.mbAt ? window.mbAt(f) : 1;"
         " if (n <= 1) { window.renderFrame(f); return c.toDataURL('image/jpeg', q); }"
         " const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const g = o.getContext('2d');"
         " for (let i = 0; i < n; i++) { window.renderFrame(f - 0.25 + 0.5 * (i + 0.5) / n); g.globalAlpha = 1 / (i + 1); g.drawImage(c, 0, 0); }"
         " return o.toDataURL('image/jpeg', q);")
    assert a in s, "render.mjs changed"
    r.write_text(s.replace(a, b))
print("look2 patch ok")
