import re, json, math
txt = open('script.txt').read()
paras = [p.strip() for p in txt.split('\n\n') if p.strip()]
NUM = {'2026': 7, '2009': 6, '2011': 5, '1962': 7, '2024': 7, '2025': 7, '23': 4, '12': 2, 'ERP': 3, 'KfW': 3, 'IHK': 3, 'GEMA': 2}
def syl(s):
    n = 0
    for w in re.findall(r"[\wÄÖÜäöüß’'-]+", s):
        if w in NUM: n += NUM[w]; continue
        if w.isdigit(): n += 2 * len(w); continue
        n += max(1, len(re.findall(r'[aeiouyäöü]+', w.lower())))
    return n
sents = []
for pi, p in enumerate(paras):
    parts = re.split(r'(?<=[.!?:“])\s+(?=[A-ZÄÖÜ„0-9])', p)
    for s in parts:
        if s.strip(): sents.append({'para': pi, 'text': s.strip(), 'syl': syl(s)})
P = [tuple(map(float, l.split())) for l in open('pauses.tsv')]
P = [(0.0, 0.0)] + [p for p in P if p[1] - p[0] >= .18 and p[0] > .05]
ends = [p[1] for p in P]; starts = [p[0] for p in P]
first = 0.0
# speech time excluding pauses between pause a (end) and pause b (start)
def speech(a, b):
    t = starts[b] - ends[a]
    return t - sum(P[k][1] - P[k][0] for k in range(a + 1, b))
N = len(sents); tot_syl = sum(s['syl'] for s in sents)
tot_speech = 786.57 - first - sum(p[1] - p[0] for p in P[1:-1])
rate = tot_speech / tot_syl
print('sentences', N, 'pauses', len(P), 'sec/syl', round(rate, 4))
INF = 1e18; M = len(P)
# candidate start indices: sentence 0 starts at pause 0 end; last sentence ends at pause M-1 start
dp = [[INF] * M for _ in range(N + 1)]; bk = [[-1] * M for _ in range(N + 1)]
dp[0][0] = 0
for i in range(N):
    e = rate * sents[i]['syl']
    for a in range(M):
        if dp[i][a] >= INF: continue
        for b in range(a + 1, min(M, a + 40)):
            d = speech(a, b)
            if d > e * 2.2 + 2: break
            cost = ((d - e) / (.22 * e + .35)) ** 2
            pl = max(.18, P[b][1] - P[b][0])
            cost -= 1.2 * math.log(pl / .18)
            if i == N - 1 and b != M - 1: continue
            v = dp[i][a] + cost
            if v < dp[i + 1][b]: dp[i + 1][b] = v; bk[i + 1][b] = a
b = M - 1; idx = []
for i in range(N, 0, -1): a = bk[i][b]; idx.append(a); b = a
idx = idx[::-1]
out = []
for i, s in enumerate(sents):
    a = idx[i]; nb = idx[i + 1] if i + 1 < N else M - 1
    out.append({'i': i, 'para': s['para'], 't': round(ends[a], 2), 'end': round(starts[nb], 2), 'text': s['text']})
json.dump(out, open('sentences.json', 'w'), ensure_ascii=False, indent=0)
for o in out: print(f"{o['t']:7.2f} {o['end']:7.2f} p{o['para']:<3} {o['text'][:70]}")
