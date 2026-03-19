# PRONUNCIATION Word Alignment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `sync.ts`의 Whisper wordStartFrames 매핑을 PRONUNCIATION 단어 정렬 테이블 기반으로 교체해 `System.out.println` 같은 치환 단어의 하이라이팅 타이밍을 정확하게 만든다.

**Architecture:** display 단어 → TTS 단어 정렬 테이블(`buildGlobalAlignment`)을 먼저 계산하고, Whisper 단어를 narrationSplits로 분류하는 대신 전역 TTS 인덱스 비율로 직접 매핑한다. `scripts/sync.ts`만 수정.

**Tech Stack:** TypeScript, tsx, faster-whisper, ffmpeg

---

## 변경 파일

| 파일              | 변경                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| `scripts/sync.ts` | `getPronunciationExpansion()` + `buildGlobalAlignment()` 추가, Step 5 교체 |

---

## Task 1: getPronunciationExpansion 함수 추가

**Files:**

- Modify: `scripts/sync.ts` (현재 `applyPronunciation` 함수 바로 아래)

**역할:** display 단어 1개를 TTS 단어 배열로 변환. PRONUNCIATION 맵에서 exact match 또는 trailing 구두점 제거 후 match.

- [ ] **Step 1: `applyPronunciation` 함수 뒤에 두 함수 삽입**

`scripts/sync.ts`에서 다음 위치를 찾는다:

```typescript
function applyPronunciation(text: string): string {
  let r = text;
  for (const [k, v] of Object.entries(PRONUNCIATION)) r = r.replaceAll(k, v);
  return r;
}
```

그 바로 아래에 다음 두 함수를 추가:

```typescript
// ── PRONUNCIATION 단어별 확장 ──────────────────────────────────
// display 단어 1개 → TTS 단어 배열 변환
//   "System.out.println" → ["print", "line"]
//   "(자료)"             → []               (빈 치환 = 발화 없음)
//   "int,"              → ["int,"]          (trailing 구두점 재부착)
//   "메서드를"           → ["메서드를"]     (치환 없음)
function getPronunciationExpansion(
  word: string,
  pronunciation: Record<string, string>,
): string[] {
  if (word in pronunciation) {
    const val = pronunciation[word].trim();
    return val === "" ? [] : val.split(/\s+/);
  }
  const stripped = word.replace(/[.,;:!?]+$/, "");
  const suffix = word.slice(stripped.length);
  if (stripped !== word && stripped in pronunciation) {
    const val = pronunciation[stripped].trim();
    if (val === "") return [];
    const parts = val.split(/\s+/);
    parts[parts.length - 1] += suffix; // 마지막 TTS 단어에 구두점 재부착
    return parts;
  }
  return [word];
}

// ── 전역 TTS 정렬 테이블 ───────────────────────────────────────
// narration 모든 문장의 display 단어 → 전역 TTS 인덱스 매핑
// 반환값:
//   globalTtsCount: 전체 TTS 단어 수 (Whisper 인덱스 계산 기준)
//   displayWords:   각 display 단어의 (sentenceIdx, displayIdx, firstTtsIdx, ttsCount)
type DisplayWordInfo = {
  sentenceIdx: number;
  displayIdx: number;
  firstTtsIdx: number; // 이 단어의 TTS 단어들이 시작하는 전역 인덱스
  ttsCount: number; // TTS 확장 단어 수 (0 = 발화 없음)
};

function buildGlobalAlignment(
  narration: string[],
  pronunciation: Record<string, string>,
): { globalTtsCount: number; displayWords: DisplayWordInfo[] } {
  const displayWords: DisplayWordInfo[] = [];
  let globalTtsIdx = 0;
  for (let si = 0; si < narration.length; si++) {
    const words = narration[si].split(" ");
    for (let di = 0; di < words.length; di++) {
      const expanded = getPronunciationExpansion(words[di], pronunciation);
      displayWords.push({
        sentenceIdx: si,
        displayIdx: di,
        firstTtsIdx: globalTtsIdx,
        ttsCount: expanded.length,
      });
      globalTtsIdx += expanded.length;
    }
  }
  return { globalTtsCount: globalTtsIdx, displayWords };
}
```

- [ ] **Step 2: `pnpm lint` 확인**

```bash
pnpm lint
```

Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add scripts/sync.ts
git commit -m "feat: sync.ts — getPronunciationExpansion + buildGlobalAlignment 추가"
```

---

## Task 2: Step 5 Whisper 매핑 교체

**Files:**

- Modify: `scripts/sync.ts` (메인 루프 Step 5, 약 line 305~352)

**현재 코드 (교체 대상):**

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

- [ ] **Step 1: Step 5 전체를 아래 코드로 교체**

```typescript
// 5) Whisper 단어 타임스탬프 → wordStartFrames (PRONUNCIATION 정렬 기반)
//    - narrationSplits 기반 분류 제거 → 전역 TTS 인덱스 비율로 직접 매핑
//    - display 단어 수 비례 → TTS 단어 수 비례 (PRONUNCIATION 불일치 해소)
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
    const { globalTtsCount, displayWords: dwInfos } = buildGlobalAlignment(
      narration,
      PRONUNCIATION,
    );
    const W = allWhisperWords.length;
    const T = globalTtsCount;

    const result: number[][] = narration.map(() => []);
    for (let si = 0; si < narration.length; si++) {
      const sentenceDws = dwInfos.filter((dw) => dw.sentenceIdx === si);

      // Pass 1: 비-zero TTS 단어의 프레임 계산
      const rawFrames: (number | null)[] = sentenceDws.map((dw) => {
        if (dw.ttsCount === 0) return null;
        const ratio = T <= 1 ? 0 : dw.firstTtsIdx / (T - 1);
        const whisperIdx = Math.min(W - 1, Math.round(ratio * (W - 1)));
        return Math.round(allWhisperWords[whisperIdx].start * FPS);
      });

      // Pass 2: zero-TTS 단어 채우기
      // - 문장 내 첫 번째 non-null frame (없으면 speechStartFrame)을 forward fallback으로
      // - 이미 non-null을 지났으면 backward (직전 non-null) 사용
      const firstNonNull =
        rawFrames.find((f) => f !== null) ?? audioConfig[key].speechStartFrame;
      let lastNonNull = firstNonNull;
      let seenNonNull = false;

      for (let i = 0; i < sentenceDws.length; i++) {
        const dw = sentenceDws[i];
        if (rawFrames[i] !== null) {
          lastNonNull = rawFrames[i]!;
          seenNonNull = true;
          result[si][dw.displayIdx] = rawFrames[i]!;
        } else {
          // zero-TTS: 앞에 non-null 없으면 forward(firstNonNull), 있으면 backward(lastNonNull)
          result[si][dw.displayIdx] = seenNonNull ? lastNonNull : firstNonNull;
        }
      }
    }

    audioConfig[key].wordStartFrames = result;
    console.log(
      `       wordStartFrames   → ${result.map((s) => `[${s.join(",")}]`).join(" | ")}`,
    );
  }
} else {
  console.log(`       wordStartFrames   → Whisper 실패 (빈 배열)`);
  if (whisperRes.stderr) console.error(whisperRes.stderr.slice(0, 300));
}
```

- [ ] **Step 2: `pnpm lint` 확인**

```bash
pnpm lint
```

Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add scripts/sync.ts
git commit -m "fix: sync.ts Step 5 — PRONUNCIATION 정렬 기반 wordStartFrames 매핑"
```

---

## Task 3: 검증 및 재생성

**Files:**

- Regenerate: `src/compositions/001-Java-Basic/001-audio.ts`

- [ ] **Step 1: 해시 삭제 (001 에피소드만)**

```bash
rm -f .001-Java-Basic-001-audio-hashes.json
```

- [ ] **Step 2: sync 실행 및 출력 확인**

```bash
pnpm sync 001-Java-Basic/001
```

`print` 씬 출력에서 확인할 것:

```
wordStartFrames   → [10,27,36,46,59] | [98,X,Y,Z,...] | [147,...]
```

**핵심 체크:** 두 번째 배열(`[98,X,Y,Z,...]`)의 값들이 **모두 다른지** 확인.
이전에는 `[98,98,105,105,110,110,...]` 처럼 쌍으로 중복됐었음.
수정 후에는 `"System.out.println"`(firstTtsIdx=0)과 `"메서드를"`(firstTtsIdx=2)가 다른 프레임을 가져야 함.

- [ ] **Step 3: 001-audio.ts 내용 확인**

```bash
grep "print" src/compositions/001-Java-Basic/001-audio.ts
```

`wordStartFrames` 두 번째 배열이 중복 없이 증가하는 패턴인지 확인.

- [ ] **Step 4: 002 에피소드도 재생성**

```bash
rm -f .001-Java-Basic-002-audio-hashes.json
pnpm sync 001-Java-Basic/002
```

- [ ] **Step 5: 커밋**

```bash
git add src/compositions/001-Java-Basic/001-audio.ts \
        src/compositions/001-Java-Basic/002-audio.ts \
        public/
git commit -m "chore: audio config 재생성 — PRONUNCIATION 정렬 기반 wordStartFrames"
```

- [ ] **Step 6: push**

```bash
git push origin main
```
