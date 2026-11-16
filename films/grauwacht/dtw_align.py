# Forced alignment without ASR: espeak-ng renders the known text, MFCC+DTW maps it onto the real voice.
import json, subprocess, numpy as np, librosa, os, tempfile, wave
sents = json.load(open('sentences.json'))
SR = 16000; HOP = 0.04
tmp = tempfile.mkdtemp()
syn = []; marks = []; t = 0.0
for i, s in enumerate(sents):
    txt = s['text'].replace('„', '').replace('“', '')
    f = f'{tmp}/{i}.wav'
    subprocess.run(['espeak-ng', '-v', 'de', '-s', '150', '-w', f, txt], check=True)
    y, _ = librosa.load(f, sr=SR)
    yt, idx = librosa.effects.trim(y, top_db=35)
    marks.append(t); syn.append(yt); t += len(yt) / SR
    gap = 0.75 if (i + 1 < len(sents) and sents[i + 1]['para'] != s['para']) else 0.4
    syn.append(np.zeros(int(gap * SR), np.float32)); t += gap
synth = np.concatenate(syn); print('synthetic dur', len(synth) / SR)
real = np.load('/tmp/claude-0/v16.npy')
def feats(y):
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=int(HOP * SR), n_fft=1024)[1:]
    m = (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
    e = librosa.feature.rms(y=y, hop_length=int(HOP * SR), frame_length=1024)[0]
    e = 20 * np.log10(e + 1e-5); e = (e - e.max()); sil = (e < -38).astype(np.float32)
    return np.vstack([m, sil[None] * 4])
A = feats(synth); B = feats(real); print(A.shape, B.shape)
from scipy.spatial.distance import cdist
C = cdist(A.T, B.T, 'cosine').astype(np.float64)
# band constraint around the linear diagonal (+-25 s)
n, m = C.shape; ii = np.arange(n)[:, None]; jj = np.arange(m)[None, :]
C[np.abs(jj - ii * m / n) > 25 / HOP] = 1e3
D, wp = librosa.sequence.dtw(C=C, step_sizes_sigma=np.array([[1, 1], [0, 1], [1, 0]]), weights_mul=np.array([1, 1, 1]))
wp = wp[::-1]
syn2real = np.interp
xs = wp[:, 0] * HOP; ys = wp[:, 1] * HOP
sil = [tuple(map(float, l.split())) for l in open('sil2.txt')]
P = [(e - d, e) for e, d in sil]
for i, s in enumerate(sents):
    k = np.searchsorted(xs, marks[i]); est = float(ys[min(k, len(ys) - 1)])
    # snap to the end of the nearest pause within 0.6 s (speech onset)
    best = min(P, key=lambda p: abs(p[1] - est)) if P else None
    s['dtw'] = round(est, 2)
    s['start2'] = round(best[1], 2) if best and abs(best[1] - est) < 0.6 else round(est, 2)
s0 = sents[0]; s0['start2'] = 0.11
json.dump(sents, open('sentences.json', 'w'), ensure_ascii=False, indent=0)
for i, s in enumerate(sents):
    flag = '  <<' if abs(s['start2'] - s['start']) > 0.6 else ''
    print(f"{i:3d} dp {s['start']:7.2f} dtw {s['dtw']:7.2f} -> {s['start2']:7.2f} {'#' if s['head'] else ' '} {s['text'][:60]}{flag}")
