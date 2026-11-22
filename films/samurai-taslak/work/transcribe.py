import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("/tmp/wm/model", device="cpu", compute_type="int8", cpu_threads=4)
import subprocess, numpy as np
raw=subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
audio=np.frombuffer(raw,np.float32).copy()
segs, info = m.transcribe(audio, language="de", word_timestamps=True, vad_filter=False, beam_size=5)
words = []; out = []
for s in segs:
    out.append({"s": round(s.start, 2), "e": round(s.end, 2), "text": s.text.strip()})
    for w in s.words: words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
    print(f"{s.start:7.2f} {s.text.strip()}", flush=True)
json.dump(words, open(sys.argv[2] + "/words.json", "w"), ensure_ascii=False, indent=0)
json.dump(out, open(sys.argv[2] + "/segments.json", "w"), ensure_ascii=False, indent=1)
