# Align the given German script to the MP3 using pauses (ffmpeg silencedetect), no ASR.
# Sentence ends are snapped to pauses with dynamic programming; words inside a sentence are spread by syllables
# over the sentence's speech parts (internal pauses go to commas first). Output: words.json, sentences.json
import re, json, sys, numpy as np
sil_txt, script, outdir, dur = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', open(sil_txt).read())]
en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', open(sil_txt).read())]
gaps = [(0.0, 0.0)] + list(zip(st, en))[:len(en)] + [(dur, dur)]
if gaps[1][0] < 0.05: gaps = gaps[1:]
G = len(gaps)
text = open(script, encoding='utf8').read().replace('\n', ' ')
sents = [s.strip() for s in re.findall(r'[^.?!:]+[.?!:]+["“”]?', text) if s.strip()]
syl = lambda w: max(1, len(re.findall(r'[aeiouyäöü]+', w.lower())))
W = np.array([sum(syl(w) for w in s.split()) + .6 for s in sents])
# speech time between gaps a<b = start(b) - end(a) - silences inside
gs = np.array([g[0] for g in gaps]); ge = np.array([g[1] for g in gaps]); gd = gs * 0 + (ge - gs)
csil = np.concatenate([[0], np.cumsum(gd)])
def speech(a, b): return gs[b] - ge[a] - (csil[b] - csil[a + 1])
total = speech(0, G - 1); r = total / W.sum()
N = len(sents); INF = 1e18
dp = np.full((N + 1, G), INF); bk = np.zeros((N + 1, G), int); dp[0][0] = 0
for i in range(1, N + 1):
    e = W[i - 1] * r
    for j in range(1, G):
        ks = np.arange(0, j)
        S = gs[j] - ge[ks] - (csil[j] - csil[ks + 1])
        # long pauses swallowed inside one sentence are unlikely
        inner_long = np.array([0.0] * len(ks))
        cost = ((S - e) / max(e, .4)) ** 2 + dp[i - 1][ks] - (.3 * min(gd[j], 1.2) if j < G - 1 else 0)
        k = int(np.argmin(cost)); dp[i][j] = cost[k]; bk[i][j] = k
j = G - 1; bounds = []
for i in range(N, 0, -1): k = bk[i][j]; bounds.append((k, j)); j = k
bounds.reverse()
words, out = [], []
for si, (s, (a, b)) in enumerate(zip(sents, bounds)):
    t0, t1 = ge[a], gs[b]
    segs = []; cur = t0
    for g in range(a + 1, b): segs.append((cur, gs[g])); cur = ge[g]
    segs.append((cur, t1))
    ws = s.split(); wt = [syl(w) + .3 for w in ws]; tot = sum(wt)
    segdur = [y - x for x, y in segs]; sp = sum(segdur)
    # map cumulative syllable share -> time through speech parts
    def at(f):
        need = f * sp
        for (x, y), d in zip(segs, segdur):
            if need <= d: return x + need
            need -= d
        return segs[-1][1]
    acc = 0
    for w, q in zip(ws, wt):
        words.append({'w': w, 's': round(at(acc / tot), 3), 'e': round(at((acc + q) / tot), 3), 'sent': si}); acc += q
    out.append({'i': si, 'text': s, 's': round(t0, 3), 'e': round(t1, 3)})
json.dump(words, open(outdir + '/words.json', 'w'), ensure_ascii=False, indent=0)
json.dump(out, open(outdir + '/sentences.json', 'w'), ensure_ascii=False, indent=1)
print(N, 'sentences', len(words), 'words, speech rate', round(W.sum() / total, 2), 'syl/s')
