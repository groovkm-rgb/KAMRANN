# Align known story sentences to detected pauses (no ASR model available offline).
import re, json
txt = open('story.txt', encoding='utf8').read()
NUM = {'1903': 'neunzehnhundertdrei', '1911': 'neunzehnhundertelf', '1912': 'neunzehnhundertzwölf', 'Teil 10': 'Teil zehn', 'Teil 1:': 'Teil eins:', 'Teil 2': 'Teil zwei', 'Teil 3': 'Teil drei', 'Teil 4': 'Teil vier', 'Teil 5': 'Teil fünf', 'Teil 6': 'Teil sechs', 'Teil 7': 'Teil sieben', 'Teil 8': 'Teil acht', 'Teil 9': 'Teil neun'}
sents = []
for para, line in enumerate(txt.strip().split('\n')):
    parts = re.split(r'(?<=[.!?])[“"]?\s+(?=[„A-ZÄÖÜ„])', line) if not line.startswith('Teil') else [line]
    # re.split drops the closing quote; good enough for counting
    for p in parts:
        if p.strip(): sents.append({'text': p.strip(), 'para': para, 'head': line.startswith('Teil')})
def spoken(s):
    for k, v in NUM.items(): s = s.replace(k, v)
    return len(re.sub(r'[^A-Za-zÄÖÜäöüß]', '', s))
import re as _r
def syl(s):
    for k, v in NUM.items(): s = s.replace(k, v)
    return len(_r.findall(r'(?i)(?:eu|ei|ie|au|äu|aa|ee|oo|[aeiouyäöü])+', s))
for s in sents: s['n'] = syl(s['text']) + 0.6  # small constant per sentence
sil = [tuple(map(float, l.split())) for l in open('sil2.txt')]
P = [(e - d, e, d) for e, d in sil]  # (start, end, dur)
P = [(0.0, 0.114, 0.3)] + [p for p in P if p[0] > 0.2]
S = len(sents); NP = len(P)
endspeech = 700.538
P.append((endspeech, 700.94, 0.4))
tot = endspeech - 0.114
nsum = sum(s['n'] for s in sents)
import math
INF = 1e18
# dp[i][j]: sentence i ends at pause j
dp = [[INF] * len(P) for _ in range(S + 1)]; bk = [[-1] * len(P) for _ in range(S + 1)]
dp[0][0] = 0
# global rate fitted iteratively
rate = tot / nsum
for it in range(3):
    dp = [[INF] * len(P) for _ in range(S + 1)]; bk = [[-1] * len(P) for _ in range(S + 1)]; dp[0][0] = 0
    for i in range(1, S + 1):
        pred = sents[i - 1]['n'] * rate
        for j in range(1, len(P)):
            best = INF; bj = -1
            for k in range(max(0, j - 12), j):
                if dp[i - 1][k] >= INF: continue
                dur = P[j][0] - P[k][1]
                if dur <= 0.3: continue
                # internal pauses (between k and j) add time; skip-penalty for long unused pauses
                c = ((dur - pred) / (0.35 + 0.18 * math.sqrt(pred))) ** 2
                c += sum(max(0, P[m][2] - 0.45) * 6 for m in range(k + 1, j))
                c += max(0, 0.4 - P[j][2]) * 8 * (2 if sents[i-1]['text'][-1] in '.?!“' else 1)
                if dp[i - 1][k] + c < best: best = dp[i - 1][k] + c; bj = k
            dp[i][j] = best; bk[i][j] = bj
    j = len(P) - 1; path = []
    for i in range(S, 0, -1): path.append(j); j = bk[i][j]
    path = path[::-1]
    # refit rate
    starts = [P[0][1]] + [P[j][1] for j in path[:-1]]
    ends = [P[j][0] for j in path]
    rate = sum(e - s for s, e in zip(starts, ends)) / nsum
for i, s in enumerate(sents): s['start'] = round(starts[i], 2); s['end'] = round(ends[i], 2)
json.dump(sents, open('sentences_syl.json', 'w'), ensure_ascii=False, indent=0)
print('rate', rate, 'cost', dp[S][len(P)-1])
for i, s in enumerate(sents): print(f"{i:3d} {s['start']:7.2f} {s['end']:7.2f} {s['end']-s['start']:5.2f}/{s['n']*rate:5.2f} {'#' if s['head'] else ' '} {s['text'][:70]}")
