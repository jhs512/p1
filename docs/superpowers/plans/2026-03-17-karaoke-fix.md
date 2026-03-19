# Karaoke Subtitle Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `feat/karaoke-subtitles` 브랜치에서 단어별 하이라이팅(카라오케 자막)을 올바르게 구현한다. Whisper 실행 실패 버그(tiny 모델)와 display-word/TTS-word 개수 불일치 매핑 버그를 수정한다.

**Architecture:** `scripts/whisper_words.py`에서 `small` 모델 사용; `sync.ts`에서 Whisper 단어 타임스탬프를 display 단어 개수에 맞게 위치 보간으로 매핑(display-word-length 배열 생성); `Subtitle` 컴포넌트에서 ratio 계산 제거 후 직접 인덱스 사용(`wFrames[i]` = display word `i`의 시작 프레임, 길이 보장).

**Tech Stack:** TypeScript, Python (faster-whisper), Remotion, edge-tts, ffmpeg

---

## 변경 파일 목록

| 파일                                                    | 작업                                     |
| ------------------------------------------------------- | ---------------------------------------- |
| (없음 — git merge)                                      | `main`을 `feat/karaoke-subtitles`에 머지 |
| `scripts/whisper_words.py`                              | `tiny` → `small`, stderr 억제            |
| `scripts/sync.ts`                                       | 매핑 버그 수정, 죽은 VTT 코드 제거       |
| `src/compositions/001-Java-Basic/001-JavaVariables.tsx` | `Subtitle`: ratio 제거 → 직접 인덱스     |
| `src/compositions/001-Java-Basic/002-JavaDataTypes.tsx` | 동일                                     |
| `src/compositions/001-Java-Basic/001-audio.ts`          | `pnpm sync:all` 재생성                   |
| `src/compositions/001-Java-Basic/002-audio.ts`          | `pnpm sync:all` 재생성                   |

---

## 버그 요약

**버그 1: Whisper 모델 다운로드 실패**

- 현재: `whisper_words.py`가 `tiny` 모델 사용 → 첫 실행 시 다운로드 실패 → `status !== 0` → `wordStartFrames: []`
- 수정: `small` 모델로 교체, 한국어 인식 정확도도 향상

**버그 2: display-word ↔ TTS-word 개수 불일치**

- 현재: `groupWordsBySentence()`가 Whisper 단어 개수 길이 배열 반환 → `wFrames.length = N_whisper`
- 하지만 Subtitle은 `wFrames[j]`를 TTS 단어 인덱스로 취급하며 ratio로 display 단어로 변환
- PRONUNCIATION이 `"System.out.println"` → `"print line"` (1→2단어)처럼 바꾸면 개수가 달라져 매핑 오류
- 수정: `wordStartFrames[sentenceIdx]`의 길이를 항상 `displayWords.length`와 동일하게 생성

---

## Task 1: main 머지

**Files:** (git operation only)

### 왜 머지가 필요한가?

`feat/karaoke-subtitles`는 구 main(`f3c83ab`) 위에 `91b4bb3` 1개만 쌓여 있다.
새 main(`a9a6e7d`)은 폴더 구조(`001-Java-Basic/`), `sync.ts` 개선, `sync:all`/`render`/`watch` 스크립트 등을 포함한다.
머지 후 충돌 파일을 해결하면 이 모든 개선사항이 karaoke 브랜치로 들어온다.

- [ ] **Step 1: main 머지 실행**

```bash
git merge main
```

충돌(conflict) 파일 목록이 출력된다. 아래 Step 2~7에서 각 파일을 해결한다.

- [ ] **Step 2: `scripts/sync.ts` 충돌 해결**

`sync.ts`는 아래 전략으로 해결한다:

- **main 버전을 베이스**로 채택 (`git checkout --theirs scripts/sync.ts`)
- Whisper 관련 코드(함수, 타입 필드, 메인 루프 Step 5)는 Task 3에서 새로 작성하므로 지금은 main 버전 그대로 둔다

```bash
git checkout --theirs scripts/sync.ts
git add scripts/sync.ts
```

- [ ] **Step 3: 컴포지션 파일 충돌 해결**

`001-JavaVariables.tsx`, `002-JavaDataTypes.tsx`는 karaoke 브랜치 버전(카라오케 Subtitle 포함)을 유지:

```bash
git checkout --ours src/compositions/001-Java-Basic/001-JavaVariables.tsx
git checkout --ours src/compositions/001-Java-Basic/002-JavaDataTypes.tsx
git add src/compositions/001-Java-Basic/001-JavaVariables.tsx
git add src/compositions/001-Java-Basic/002-JavaDataTypes.tsx
```

- [ ] **Step 4: audio.ts 충돌 해결**

audio config는 main 버전 사용 (wordStartFrames 없는 깨끗한 포맷; Task 5에서 재생성):

```bash
git checkout --theirs src/compositions/001-Java-Basic/001-audio.ts
git checkout --theirs src/compositions/001-Java-Basic/002-audio.ts
git add src/compositions/001-Java-Basic/001-audio.ts
git add src/compositions/001-Java-Basic/002-audio.ts
```

- [ ] **Step 5: 나머지 충돌 파일 처리**

`Root.tsx`, `global.config.ts`, `CLAUDE.md`, `package.json`, `scripts/render.ts`, `scripts/sync-all.ts`, `scripts/watch.ts` → main 버전 사용:

```bash
git checkout --theirs src/Root.tsx src/global.config.ts CLAUDE.md package.json
git checkout --theirs scripts/render.ts scripts/sync-all.ts scripts/watch.ts 2>/dev/null || true
git add src/Root.tsx src/global.config.ts CLAUDE.md package.json scripts/
```

`src/compositions/1/` 구 폴더 파일들은 main에 없으니 ours 그대로:

```bash
git add src/compositions/1/
```

`whisper_words.py`는 ours (karaoke만 있음):

```bash
git add scripts/whisper_words.py
```

`src/hooks/useTypingEffect.test.ts`는 ours:

```bash
git add src/hooks/
```

- [ ] **Step 6: 머지 커밋**

```bash
git merge --continue
# 에디터가 열리면 기본 메시지 저장 후 닫기
```

- [ ] **Step 7: `pnpm lint` 로 컴파일 오류 확인**

```bash
pnpm lint
```

오류 있으면 수정 후 진행.

---

## Task 2: whisper_words.py 수정

**Files:**

- Modify: `scripts/whisper_words.py`

### 변경 내용

- `"tiny"` → `"small"` (모델 교체: 한국어 정확도 향상 + 다운로드 안정성)
- 모델 로딩/다운로드 progress 출력이 stdout을 오염시키지 않도록: faster_whisper는 이미 stderr에 progress를 쓰므로 추가 처리 불필요. 단, 예외 발생 시 stderr로 출력하고 빈 배열을 stdout에 출력하도록 방어 처리 추가.

- [ ] **Step 1: `scripts/whisper_words.py` 교체**

```python
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
try:
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio_file, language="ko", word_timestamps=True)

    words = []
    for segment in segments:
        if segment.words:
            for word in segment.words:
                words.append({"start": word.start, "end": word.end, "word": word.word})

    print(json.dumps(words, ensure_ascii=False))
except Exception as e:
    print(f"whisper error: {e}", file=sys.stderr)
    print("[]")
    sys.exit(1)
```

- [ ] **Step 2: 동작 확인**

```bash
.venv/bin/python scripts/whisper_words.py public/intro.mp3
```

JSON 배열이 출력되는지 확인. 처음 실행 시 `small` 모델 다운로드(~500MB)가 발생할 수 있다 — 완료까지 기다린다.

- [ ] **Step 3: 커밋**

```bash
git add scripts/whisper_words.py
git commit -m "fix: whisper_words.py tiny → small 모델, 예외 처리 추가"
```

---

## Task 3: sync.ts Whisper 매핑 수정

**Files:**

- Modify: `scripts/sync.ts`

### 핵심 변경

**현재 (버그 있음):**

- `groupWordsBySentence()`: Whisper 단어 프레임을 문장별로 묶음 → 배열 길이 = Whisper 단어 수
- Subtitle은 이 배열을 display 단어 수로 ratio 변환 → PRONUNCIATION으로 단어 수 달라지면 틀림

**수정 후:**

- `groupWordsBySentence()` 제거
- Whisper 단어를 문장별로 분류 후, 각 문장 내에서 **display 단어 개수**에 맞게 위치 보간으로 프레임 생성
- 결과 `wordStartFrames[sentenceIdx]`의 길이 = `displayWords.length` (항상)

### 위치 보간 로직

```
displayWords = narration[sentenceIdx].split(" ")  // 화면 표시 단어들
whisperSentenceWords = [{ start, end, word }, ...]  // Whisper가 인식한 단어들

frames[displayIdx] = whisperSentenceWords[
  round(displayIdx / (displayWords.length - 1) * (whisperSentenceWords.length - 1))
].start * FPS
```

단어가 1개면 ratio = 0 → 첫 Whisper 단어 타임스탬프 사용.

- [ ] **Step 1: `sync.ts`에서 죽은 VTT 코드 제거**

다음 함수들 전체를 삭제:

- `parseVttWords()` (line ~215~226)
- `groupWordsBySentence()` (line ~228~249)
- `extractNestedArray()` (line ~251~263)

또한 imports에서 `unlinkSync` 제거:

```typescript
// Before
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "fs";
// After
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
```

- [ ] **Step 2: `SceneAudioData` 타입에 `wordStartFrames` 추가**

`SceneAudioData` 타입 정의(현재 main 버전에는 없음)에 `wordStartFrames` 필드 추가:

```typescript
type SceneAudioData = {
  durationInFrames: number;
  narrationSplits: number[];
  sentenceEndFrames: number[];
  speechStartFrame: number;
  speechEndFrame: number;
  wordStartFrames: number[][]; // display 단어별 시작 프레임 (문장별, 길이 = displayWords.length)
};
```

- [ ] **Step 3: `writeAudioConfig()` 함수 업데이트**

`wordStartFrames` 필드 출력 추가:

```typescript
function writeAudioConfig(config: Record<string, SceneAudioData>): void {
  const audioConfigFile = path.join(
    COMPOSITION_DIR,
    compositionId + "-audio.ts",
  );
  const lines = Object.entries(config)
    .map(([k, v]) => {
      const wfStr = (v.wordStartFrames ?? [])
        .map((s) => `[${s.join(",")}]`)
        .join(",");
      return `  ${k.padEnd(16)}: { durationInFrames: ${v.durationInFrames}, narrationSplits: [${v.narrationSplits.join(", ")}], sentenceEndFrames: [${v.sentenceEndFrames.join(", ")}], speechStartFrame: ${v.speechStartFrame}, speechEndFrame: ${v.speechEndFrame}, wordStartFrames: [${wfStr}] },`;
    })
    .join("\n");
  const content = `// AUTO-GENERATED by \`pnpm sync ${compositionId}\` — do not edit manually\n\nexport const AUDIO_CONFIG = {\n${lines}\n} as const;\n`;
  writeFileSync(audioConfigFile, content, "utf-8");
  console.log(`\n📝  ${audioConfigFile} 업데이트 완료`);
}
```

- [ ] **Step 4: `existingAudioConfig` 파서 업데이트**

기존 audio.ts 파일을 읽을 때 `wordStartFrames` 중첩 배열 파싱 추가. `extractNestedArray`를 제거했으므로 인라인으로 처리:

```typescript
// existingAudioConfig 파싱 루프 내, 현재 포맷 파싱 후:
const m = line.match(
  /^\s+(\w+)\s*:\s*\{ durationInFrames: (\d+), narrationSplits: \[([^\]]*)\], sentenceEndFrames: \[([^\]]*)\], speechStartFrame: (\d+), speechEndFrame: (\d+)/,
);
if (m) {
  const splits = m[3].trim()
    ? m[3].split(",").map((s) => parseInt(s.trim()))
    : [];
  const ends = m[4].trim()
    ? m[4].split(",").map((s) => parseInt(s.trim()))
    : [];
  existingAudioConfig[m[1]] = {
    durationInFrames: parseInt(m[2]),
    narrationSplits: splits,
    sentenceEndFrames: ends,
    speechStartFrame: parseInt(m[5]),
    speechEndFrame: parseInt(m[6]),
    wordStartFrames: [],
  };
  // wordStartFrames 중첩 배열 파싱
  const wfIdx = line.indexOf("wordStartFrames: ");
  if (wfIdx !== -1) {
    const start = line.indexOf("[", wfIdx);
    if (start !== -1) {
      let depth = 0,
        end = -1;
      for (let i = start; i < line.length; i++) {
        if (line[i] === "[") depth++;
        else if (line[i] === "]") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end !== -1) {
        try {
          existingAudioConfig[m[1]].wordStartFrames = JSON.parse(
            line.slice(start, end + 1),
          ) as number[][];
        } catch {
          /* ignore */
        }
      }
    }
  }
  continue;
}
```

- [ ] **Step 5: 메인 루프에 Whisper 호출 및 올바른 매핑 추가**

TTS 생성, ffprobe, speechBounds, narrationSplits 처리 이후 (Step 4 다음):

```typescript
// 5) Whisper 단어 타임스탬프 → wordStartFrames (display 단어 개수 길이)
audioConfig[key].wordStartFrames = narration.map(() => []); // 기본: 빈 배열

const venvPython = path.join(process.cwd(), ".venv", "bin", "python");
const whisperScript = path.join(process.cwd(), "scripts", "whisper_words.py");
const whisperRes = spawnSync(
  venvPython,
  [whisperScript, `${PUBLIC_DIR}/${audio}`],
  { encoding: "utf-8" },
);

if (whisperRes.status === 0 && whisperRes.stdout.trim()) {
  type WhisperWord = { start: number; end: number; word: string };
  let allWhisperWords: WhisperWord[] = [];
  try {
    allWhisperWords = JSON.parse(whisperRes.stdout.trim()) as WhisperWord[];
  } catch {
    /* ignore */
  }

  if (allWhisperWords.length > 0) {
    // 문장별 Whisper 단어 분류 (narrationSplits 기준)
    const sentenceStarts = [
      audioConfig[key].speechStartFrame,
      ...audioConfig[key].narrationSplits,
    ];
    const sentenceWhisperWords: WhisperWord[][] = narration.map(() => []);
    for (const w of allWhisperWords) {
      const wFrame = Math.round(w.start * FPS);
      for (let i = sentenceStarts.length - 1; i >= 0; i--) {
        if (wFrame >= sentenceStarts[i] - 3) {
          sentenceWhisperWords[i].push(w);
          break;
        }
      }
    }

    // 각 문장: display 단어 개수 길이 배열로 위치 보간
    audioConfig[key].wordStartFrames = narration.map((sentence, si) => {
      const displayWords = sentence.split(" ");
      const whisperSentenceWords = sentenceWhisperWords[si];
      if (whisperSentenceWords.length === 0)
        return displayWords.map(() => sentenceStarts[si]);
      return displayWords.map((_, displayIdx) => {
        const ratio =
          displayWords.length === 1
            ? 0
            : displayIdx / (displayWords.length - 1);
        const whisperIdx = Math.round(
          ratio * (whisperSentenceWords.length - 1),
        );
        return Math.round(whisperSentenceWords[whisperIdx].start * FPS);
      });
    });

    console.log(
      `       wordStartFrames   → ${audioConfig[key].wordStartFrames.map((s) => `[${s.join(",")}]`).join(" | ")}`,
    );
  }
} else {
  console.log(`       wordStartFrames   → Whisper 실패 (빈 배열)`);
  if (whisperRes.stderr) console.error(whisperRes.stderr.slice(0, 300));
}
```

또한 TTS 생성 명령에서 `--write-subtitles` 플래그 제거:

```typescript
// Before:
[
  "--voice",
  VOICE,
  "--rate",
  RATE,
  "--text",
  ttsText,
  "--write-media",
  `${PUBLIC_DIR}/${audio}`,
  "--write-subtitles",
  vttFile,
][
  // After:
  ("--voice",
  VOICE,
  "--rate",
  RATE,
  "--text",
  ttsText,
  "--write-media",
  `${PUBLIC_DIR}/${audio}`)
];
```

`vttFile` 변수 선언도 제거한다.

- [ ] **Step 6: `pnpm lint` 로 컴파일 오류 확인**

```bash
pnpm lint
```

TypeScript 오류 없어야 한다.

- [ ] **Step 7: 커밋**

```bash
git add scripts/sync.ts
git commit -m "fix: sync.ts Whisper 매핑 버그 수정 — display-word 길이 보간, VTT 코드 제거"
```

---

## Task 4: Subtitle 컴포넌트 ratio 버그 수정

**Files:**

- Modify: `src/compositions/001-Java-Basic/001-JavaVariables.tsx`
- Modify: `src/compositions/001-Java-Basic/002-JavaDataTypes.tsx`

### 핵심 변경

**현재 (버그 있음):**

```typescript
let ttsIdx = -1;
for (let j = 0; j < wFrames.length; j++) {
  if (frame >= wFrames[j]) ttsIdx = j;
  else break;
}
if (ttsIdx >= 0) {
  const ratio = ttsIdx / Math.max(1, wFrames.length - 1);
  activeDisplayIdx = Math.min(
    words.length - 1,
    Math.floor(ratio * words.length),
  );
}
```

**수정 후:**
`wordStartFrames[sentenceIdx]`의 길이가 항상 `displayWords.length`이므로 직접 인덱스 사용:

```typescript
let activeDisplayIdx = -1;
if (wFrames && wFrames.length === words.length) {
  for (let j = 0; j < wFrames.length; j++) {
    if (frame >= wFrames[j]) activeDisplayIdx = j;
  }
}
```

- [ ] **Step 1: `001-JavaVariables.tsx` Subtitle 카라오케 로직 수정**

`Subtitle` 컴포넌트 내 현재 display word 결정 부분(약 line 454~480)을 아래로 교체:

```typescript
// 현재 하이라이트할 display word 인덱스 결정
// wordStartFrames 길이 = words.length 보장 (sync.ts에서 display-word-길이로 생성)
let activeDisplayIdx = -1;
const wFrames = wordStartFrames?.[currentIdx];
if (wFrames && wFrames.length === words.length) {
  for (let j = 0; j < wFrames.length; j++) {
    if (frame >= wFrames[j]) activeDisplayIdx = j;
  }
} else {
  // fallback: 글자 수 비례 (wordStartFrames 없을 때)
  const sentenceActualEnd =
    sentenceEndFrames && currentIdx < sentenceEndFrames.length
      ? sentenceEndFrames[currentIdx]
      : currentIdx === sentences.length - 1 && speechEnd != null
        ? speechEnd
        : ranges[currentIdx].end;
  const progress = Math.min(
    1,
    Math.max(0, (frame - start) / Math.max(1, sentenceActualEnd - start)),
  );
  const totalChars = words.reduce((sum, w) => sum + w.length, 0);
  let cumChars = 0;
  for (let j = 0; j < words.length; j++) {
    const wStart = cumChars / totalChars;
    cumChars += words[j].length;
    if (progress >= wStart) activeDisplayIdx = j;
  }
}
```

- [ ] **Step 2: `002-JavaDataTypes.tsx` 동일하게 적용**

002 파일의 Subtitle 컴포넌트에서 동일한 ratio 버그 부분을 찾아 동일하게 교체.

- [ ] **Step 3: `pnpm lint` 확인**

```bash
pnpm lint
```

- [ ] **Step 4: 커밋**

```bash
git add src/compositions/001-Java-Basic/
git commit -m "fix: Subtitle 카라오케 ratio 매핑 제거 — display-word 직접 인덱스 사용"
```

---

## Task 5: 오디오 재생성 및 검증

**Files:**

- Regenerate: `src/compositions/001-Java-Basic/001-audio.ts`
- Regenerate: `src/compositions/001-Java-Basic/002-audio.ts`

- [ ] **Step 1: 해시 파일 삭제 (강제 전체 재생성)**

```bash
rm -f .001-Java-Basic-001-audio-hashes.json .001-Java-Basic-002-audio-hashes.json
```

구 경로 해시도 정리:

```bash
rm -f .1-001-audio-hashes.json .1-002-audio-hashes.json
```

- [ ] **Step 2: `pnpm sync:all` 실행**

```bash
pnpm sync:all
```

각 씬마다 `wordStartFrames → [[...],[...]]` 형태로 출력되는지 확인.
Whisper 첫 실행 시 `small` 모델 다운로드가 발생할 수 있다(~500MB) — 완료까지 기다린다.

- [ ] **Step 3: 생성된 audio.ts 내용 확인**

```bash
cat src/compositions/001-Java-Basic/001-audio.ts
```

`wordStartFrames: [[4,45,89,...],[105,134,...]]` 형태의 값이 있고 배열이 비어있지 않아야 한다.

- [ ] **Step 4: 커밋**

```bash
git add src/compositions/001-Java-Basic/001-audio.ts \
        src/compositions/001-Java-Basic/002-audio.ts \
        public/
git commit -m "chore: audio config 재생성 — wordStartFrames 포함 (Whisper small 모델)"
```

- [ ] **Step 5: Remotion Studio 에서 시각 확인**

```bash
pnpm dev
```

`http://localhost:3000` 접속 → `001-Java-Basic` 폴더 → `001-001` 선택 → 재생하며 단어 하이라이팅 타이밍 확인.
단어가 읽혀질 때 `#4ec9b0` 색상으로 바뀌고, 이미 지나간 단어는 `#ffffff`, 아직 안 읽힌 단어는 `rgba(255,255,255,0.45)`로 표시되는지 확인.

- [ ] **Step 6: 브랜치 push**

```bash
git push -u origin feat/karaoke-subtitles
```

---

## 완료 기준

- `pnpm sync:all` 실행 후 `001-audio.ts`, `002-audio.ts`의 `wordStartFrames`에 비어있지 않은 배열이 있다
- `pnpm dev`에서 단어별 하이라이팅이 음성 발화 타이밍과 일치한다
- `pnpm lint` 통과
