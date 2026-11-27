import json, sys
w = json.load(open('words.json')); a, b = float(sys.argv[1]), float(sys.argv[2])
print(' '.join(f"{x['w']}[{x['s']}]" for x in w if a <= x['s'] < b))
