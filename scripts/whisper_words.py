#!/usr/bin/env python3
"""
faster-whisper로 mp3에서 단어별 타임스탬프 추출
Usage: python scripts/whisper_words.py <audio_file>
Output: JSON array of {"start": float, "end": float, "word": str}
"""
import sys, json
from faster_whisper import WhisperModel

if len(sys.argv) < 2:
    print("Usage: whisper_words.py <audio_file>", file=sys.stderr)
    sys.exit(1)

audio_file = sys.argv[1]
model = WhisperModel("tiny", device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio_file, language="ko", word_timestamps=True)

words = []
for segment in segments:
    if segment.words:
        for word in segment.words:
            words.append({"start": word.start, "end": word.end, "word": word.word})

print(json.dumps(words, ensure_ascii=False))
