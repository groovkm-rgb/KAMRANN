"""Word timestamps with sherpa-onnx + NeMo Parakeet TDT v3 (multilingual, incl. German).
Used because Whisper weights (huggingface) are not reachable here. Usage: python3 asr_words.py <model_dir> voice.mp3 out.json"""
import sys, json, subprocess, numpy as np, sherpa_onnx
md, audio, out = sys.argv[1:4]
SR = 16000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{md}/encoder.int8.onnx", decoder=f"{md}/decoder.int8.onnx", joiner=f"{md}/joiner.int8.onnx",
                                                    tokens=f"{md}/tokens.txt", model_type="nemo_transducer", num_threads=4)
s = rec.create_stream(); s.accept_waveform(SR, x); rec.decode_stream(s)
r = s.result
print(r.text)
toks, ts = list(r.tokens), list(r.timestamps)
durs = list(getattr(r, "durations", []) or [])
words = []
for i, (t, st) in enumerate(zip(toks, ts)):
    if t.startswith("▁") or not words:
        words.append({"w": t.lstrip("▁"), "s": round(st, 3), "toks": [st]})
    else:
        words[-1]["w"] += t; words[-1]["toks"].append(st)
for i, w in enumerate(words):
    w["e"] = round(words[i + 1]["s"], 3) if i + 1 < len(words) else round(len(x) / SR, 3)
    w.pop("toks")
json.dump({"text": r.text, "words": words, "tokens": toks, "ts": ts, "durs": durs}, open(out, "w"), indent=1, ensure_ascii=False)
for w in words: print(f"{w['s']:6.2f} {w['w']}")
