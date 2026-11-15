import re, pathlib, sys
P = pathlib.Path('web/shots.js')
def rb(name, new):
    s = P.read_text(); i = s.index(f"const {name} = {{"); j = s.index("\n};\n", i) + 4
    P.write_text(s[:i] + new.strip() + "\n" + s[j:])
