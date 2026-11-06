#!/usr/bin/env python3
"""Phrase timing for "Tauben".

1. ffmpeg silencedetect (noise=-35dB, d=0.25) -> sentence gaps.
   The C1/C2 gap in this read is only ~0.13 s, so if fewer than 2 inner gaps are
   found we retry with d=0.10 (same noise floor) and record that in the json.
2. Inside C1 and C3 the beat split ("Ein alter Mann | fuetterte..." and
   "Am naechsten Morgen | sassen...") is placed at the deepest energy dip near
   the expected syllable position.
3. The read is fast (6.45 s). To reach the ~10 s film, pure silence is inserted
   ONLY inside detected pauses (never inside a word). INSERT below lists them;
   set all to 0 to keep the original timing.
Writes work/phrases.json and work/voice_timed.wav (48 kHz mono).
"""
import json, re, subprocess, sys
import numpy as np

SR = 48000
FPS = 30
VOICE = "voice.mp3"
TAIL = 0.6
PRE = 0.30
# seconds of silence inserted at each pause (keyed by pause name)
INSERT = {"c1_mid": 0.30, "c1_c2": 0.25, "c2_c3": 1.50, "c3_mid": 0.45}


def silences(d):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", VOICE, "-af",
                        f"silencedetect=noise=-35dB:d={d}", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    return list(zip(st, en))


def load():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", VOICE, "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()


a = load()
dur = len(a) / SR
used_d = 0.25
sil = silences(0.25)
inner = [s for s in sil if s[0] > 0.2 and s[1] < dur - 0.05]
if len(inner) < 2:
    used_d = 0.10
    sil = silences(0.10)
    inner = [s for s in sil if s[0] > 0.2 and s[1] < dur - 0.05]
tail = [s for s in sil if s[1] >= dur - 0.05]
assert len(inner) >= 2, inner
g1, g2 = inner[0], inner[1]

# speech onset / offset by -35 dB energy (10 ms hop)
hop = SR // 100
rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2) + 1e-12) for i in range(0, len(a) - hop, hop)])
db = 20 * np.log10(rms)
on = np.where(db > -35)[0]
v0, v1 = on[0] / 100, (on[-1] + 1) / 100


def dip(lo, hi, smooth=3):
    i0, i1 = int(lo * 100), int(hi * 100)
    sm = np.convolve(db, np.ones(smooth) / smooth, "same")
    return (i0 + int(np.argmin(sm[i0:i1]))) / 100 + 0.005


raw = {
    "C1": [round(v0, 3), round(g1[0], 3)],
    "C2": [round(g1[1], 3), round(g2[0], 3)],
    "C3": [round(g2[1], 3), round(tail[0][0] if tail else v1, 3)],
}
# beat splits (syllable-rate estimate, then nearest energy dip)
c1_mid = dip(raw["C1"][0] + 0.45, raw["C1"][0] + 0.85)   # after "Ein alter Mann"
c3_mid = dip(raw["C3"][0] + 0.60, raw["C3"][0] + 0.95)   # after "Am naechsten Morgen"
cuts = {"c1_mid": c1_mid, "c1_c2": (g1[0] + g1[1]) / 2, "c2_c3": (g2[0] + g2[1]) / 2, "c3_mid": c3_mid}

# build retimed voice
order = sorted(cuts.items(), key=lambda kv: kv[1])
pieces, prev = [np.zeros(int(PRE * SR), np.float32)], 0
fade = int(0.008 * SR)
for name, t in order:
    i = int(t * SR); seg = a[prev:i].copy()
    if prev > 0: seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    pieces += [seg, np.zeros(int(INSERT[name] * SR), np.float32)]
    prev = i
pieces.append(a[prev:])


def remap(t):
    off = PRE
    for name, c in order:
        if t > c: off += INSERT[name]
    return round(t + off, 3)


timed = np.concatenate(pieces)
voice_end = remap(raw["C3"][1])
total_s = voice_end + TAIL
total_s = max(total_s, len(timed) / SR)
TOTAL = int(np.ceil(total_s * FPS))
timed = np.concatenate([timed, np.zeros(max(0, TOTAL * SR // FPS - len(timed)), np.float32)])[:TOTAL * SR // FPS]

import wave
with wave.open("work/voice_timed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(timed, -1, 1) * 32767).astype(np.int16).tobytes())

# S2 mini-shot cuts: deepest stop-closure silences at word boundaries inside
# "fuetterte jeden | Tag eine | Taube" (found by 5 ms energy/ZCR inspection)
sub1 = dip(raw["C1"][0] + 1.20, raw["C1"][0] + 1.32, 1)   # jeden|Tag  (T closure)
sub2 = dip(raw["C1"][0] + 1.62, raw["C1"][0] + 1.72, 1)   # eine|Taube (T closure)
tl = {k: [remap(v[0]), remap(v[1])] for k, v in raw.items()}
beats = {"C1a_end": remap(c1_mid - 0.001), "C1b_start": remap(c1_mid + 0.001),
         "S2_sub1": remap(sub1), "S2_sub2": remap(sub2),
         "C3a_end": remap(c3_mid - 0.001), "C3b_start": remap(c3_mid + 0.001)}
out = {
    "source": VOICE, "source_duration": round(dur, 3),
    "silencedetect": {"noise": "-35dB", "d_requested": 0.25, "d_used": used_d,
                      "silences": [[round(s, 3), round(e, 3)] for s, e in sil]},
    "text": {"C1": "Ein alter Mann fütterte jeden Tag eine Taube.",
             "C2": "Eines Tages kam sie nicht.",
             "C3": "Am nächsten Morgen saßen hundert Tauben vor seinem Fenster."},
    "phrases_source_s": raw,
    "beat_splits_source_s": {"C1": round(c1_mid, 3), "C3": round(c3_mid, 3)},
    "inserted_silence_s": {k: [round(cuts[k], 3), INSERT[k]] for k in INSERT}, "preroll_s": PRE,
    "phrases_timeline_s": tl, "beats_timeline_s": beats,
    "phrases_timeline_frames": {k: [int(round(v[0] * FPS)), int(round(v[1] * FPS))] for k, v in tl.items()},
    "fps": FPS, "total_s": round(TOTAL / FPS, 3), "total_frames": TOTAL,
}
json.dump(out, open("work/phrases.json", "w"), indent=2, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False))
