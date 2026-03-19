# PRONUNCIATION Word Alignment — Design Spec

**Goal:** `wordStartFrames` 생성 시 PRONUNCIATION 치환으로 인한 display-word ↔ TTS-word 개수 불일치를 정확하게 처리한다.

**Problem:** 현재 position interpolation은 display 단어 수 기준으로 Whisper 인덱스를 계산한다. `"System.out.println"`(display 1개) → `"print line"`(TTS 2개)처럼 단어 수가 달라지면 매핑이 틀린다. 또한 narrationSplits로 Whisper 단어를 문장별로 분류하는데, narrationSplits 경계가 틀리면 Whisper 단어들이 엉뚱한 문장에 배정된다.

---

## 설계

### 핵심 원칙

- Whisper를 전체 오디오에 한 번 실행 → 단어 타임스탬프 목록 획득
- narrationSplits로 Whisper 단어 분류하지 않음 (경계 오류 제거)
- display 단어 → TTS 단어 정렬 테이블을 먼저 계산 → 이걸로 Whisper 인덱스 결정

### 새 함수: `getPronunciationExpansion(word, pronunciation)`

```typescript
// display 단어 1개 → TTS 단어 배열 변환
// "System.out.println" → ["print", "line"]
// "(자료)"             → []              (빈 문자열 치환)
// "메서드를"           → ["메서드를"]    (치환 없음)
// "age;"              → ["age;"]        (치환 없음)
// stripped match:
//   "int," (trailing comma) → ["int,"]  (int→int, 쉼표 재부착)
```

구현:

1. 단어 전체로 exact match 시도
2. 없으면 trailing 구두점(`.,;:!?`) 제거 후 match 시도 → 매치되면 결과의 **마지막 TTS 단어**에 구두점 재부착 (multi-word 확장 시에도 항상 마지막에 붙임)
3. 없으면 원본 단어 그대로 반환 (1개)

### 새 함수: `buildGlobalAlignment(narration, pronunciation)`

모든 문장을 flatten해서 전역 TTS 단어 시퀀스와 정렬 테이블 생성:

```typescript
type DisplayWordInfo = {
  sentenceIdx: number;
  displayIdx: number;
  firstTtsIdx: number; // 이 display 단어의 TTS 단어들이 시작하는 전역 인덱스
  ttsCount: number; // 이 display 단어가 TTS로 몇 개 단어로 확장되는지
};

// 반환값: { globalTtsCount: number, displayWords: DisplayWordInfo[] }
```

예시 — print 씬 narration 2번째 문장:

```
display: ["System.out.println", "메서드를", "사용하면", ...]
TTS:     ["print", "line",       "메서드를", "사용하면", ...]
                   ↑ ttsIdx=0    ↑ ttsIdx=2  ↑ ttsIdx=3
firstTtsIdx:         0             2            3
```

### Whisper 매핑 수정 (`sync.ts` 메인 루프 Step 5)

```
전역 TTS 단어 수: T (= buildGlobalAlignment 결과)
Whisper 단어 수: W

display 단어 (si, di) with firstTtsIdx = k:
  ratio      = k / max(1, T - 1)
  whisperIdx = clamp(round(ratio * (W - 1)), 0, W - 1)
  wordStartFrames[si][di] = whisperWords[whisperIdx].start * FPS
```

**ttsCount = 0인 경우** (e.g., `"(자료)"` → `""`):

- 같은 문장 내 앞선 display 단어 중 ttsCount > 0인 것의 frame 사용
- 문장 내 앞선 non-zero 단어가 없으면 (= 문장 첫 단어가 zero-TTS): 그 문장에서 첫 번째 ttsCount > 0인 display 단어의 frame 사용
- 문장 전체가 모두 zero-TTS이면 (극단적 케이스): `speechStartFrame` 사용

**모든 단어가 zero-TTS인 문장**: 위 fallback으로 모든 단어가 `speechStartFrame`을 가리키게 됨 (하이라이팅이 작동 안 하는 것과 동일, 이 케이스는 실제 콘텐츠에서 발생하지 않음)

### 변경 파일

- `scripts/sync.ts` 만 수정
  - `getPronunciationExpansion()` 추가
  - `buildGlobalAlignment()` 추가
  - Whisper Step 5 교체 (groupWordsBySentence 방식 → global 방식)
  - `groupWordsBySentence`, `detectSplits` 의존성 없음 (narrationSplits는 자막 전환에만 사용, Whisper 분류에는 사용 안 함)

### 검증

`pnpm sync 001-Java-Basic/001` 후 `001-audio.ts`의 print 씬:

- `wordStartFrames[1]` 길이 = 10 (display 단어 수)
- `wordStartFrames[1][0]` ("System.out.println") ≠ `wordStartFrames[1][1]` ("메서드를") (더 이상 중복 없음)
- `wordStartFrames[1][0]` frame이 "print"가 말해지는 타이밍에 위치

### 한계 (명시적 범위)

이 설계는 **PRONUNCIATION 단어 수 불일치**로 인한 매핑 오류를 수정한다. Whisper가 오디오에서 인식하는 단어 수(`W`)가 실제 TTS 단어 수(`T`)와 다를 경우(인식 누락·합치기 등) 여전히 오차가 생길 수 있다. 이는 Whisper 음성 인식 품질의 문제이며 이 spec의 해결 범위 밖이다.

---

## 변경 범위 요약

| 파일              | 변경                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| `scripts/sync.ts` | `getPronunciationExpansion()` + `buildGlobalAlignment()` 추가, Whisper Step 5 교체 |
| 나머지 모든 파일  | 변경 없음                                                                          |
