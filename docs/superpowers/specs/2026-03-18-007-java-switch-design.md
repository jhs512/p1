# 007-JavaSwitch 에피소드 설계 문서

## 개요

**에피소드 번호:** 007
**파일명:** `007-JavaSwitch.tsx` / `007-audio.ts`
**주제:** Java 모던 switch 표현식 (Java 14+)
**시리즈:** 001-Java-Basic

---

## 학습 목표

1. 화살표(`->`) 문법으로 switch 표현식 작성
2. fall-through 없음의 장점 이해
3. 여러 케이스 묶기 + 값 반환으로 변수에 대입

---

## 예제 코드

```java
String day = "SATURDAY";

String msg = switch (day) {
    case "MON", "TUE", "WED", "THU", "FRI" -> "평일";
    case "SAT", "SUN" -> "주말";
    default -> "?";
};
```

---

## 색상 팔레트

| 상수 | 값 | 역할 |
|---|---|---|
| `C_SWITCH` | `#569cd6` | `switch` 키워드 (파랑) |
| `C_CASE` | `#c586c0` | `case` 키워드 (보라) |
| `C_ARROW` | `#4ec9b0` | `->` 화살표 (teal) |
| `C_STR` | `#ce9178` | 문자열 값 (주황) |
| `C_RESULT` | `#b5cea8` | 결과값 (연초록) |
| `C_DIM` | `rgba(255,255,255,0.22)` | 흐린 요소 |
| `C_RED` | `#f47c7c` | 경고·오류 (fall-through 흘러내림 표시) |

---

## AUDIO_CONFIG 키 이름 (VIDEO_CONFIG와 1:1 매핑)

sync 스크립트가 VIDEO_CONFIG 키를 그대로 AUDIO_CONFIG 키로 사용한다. 구현 시 아래 키 이름을 정확히 사용해야 한다.

| VIDEO_CONFIG 키 | AUDIO_CONFIG 키 |
|---|---|
| `overview` | `AUDIO_CONFIG.overview` |
| `intro` | `AUDIO_CONFIG.intro` |
| `syntaxScene` | `AUDIO_CONFIG.syntaxScene` |
| `noFallthroughScene` | `AUDIO_CONFIG.noFallthroughScene` |
| `multiCaseScene` | `AUDIO_CONFIG.multiCaseScene` |
| `summaryScene` | `AUDIO_CONFIG.summaryScene` |

---

## 씬 구성 (7씬)

### 1. ThumbnailScene

- **duration:** 30 프레임 (정적)
- **비주얼:** 배경 `#1e1e1e`, `switch` 키워드 대형 텍스트 중앙 배치, C_SWITCH 색상, 하단에 "Java 표현식" 레이블
- **나레이션:** 없음 (오디오 파일 없음)

---

### 2. OverviewScene

- **비주얼:** 006-JavaIf와 동일한 트리 구조. 기존 노드(변수, 자료형, 연산자, 비교, 논리, if)에 `switch` 노드를 팝업으로 추가.
- **타이밍:** switch 노드 팝업 spring 시작 → `AUDIO_CONFIG.overview.speechStartFrame`
- **나레이션:**
  1. "다양한 조건을 처리할 때 [switch(발음:스위치)] 표현식을 사용할 수 있습니다."
  2. "[if(발음:이프)]문 대신 더 깔끔하게 조건을 분기할 수 있습니다."

---

### 3. IntroScene

- **비주얼:** 좌우 비교 카드
  - 좌측: if-else 체인 코드 블록 (7줄, C_DIM 색으로 "복잡함" 암시), `AUDIO_CONFIG.intro.speechStartFrame` 기준 opacity spring 등장
  - 우측: switch 표현식 코드 블록 (3줄, 밝은 색), `AUDIO_CONFIG.intro.narrationSplits[0]` 프레임에 spring으로 등장
- **나레이션:**
  1. "요일에 따라 다른 메시지를 출력하려면 [if(발음:이프)]문을 여러 번 반복해야 합니다."
  2. "[switch(발음:스위치)] 표현식을 쓰면 훨씬 간결하게 작성할 수 있습니다."

---

### 4. SyntaxScene

- **비주얼:** 타이핑 애니메이션 (008-JavaWhile.tsx WhileScene 패턴 동일)
  - 전체 switch 표현식 코드 타이핑 시작 → `AUDIO_CONFIG.syntaxScene.speechStartFrame`, `CHARS_PER_SEC = 10`
  - `->` 화살표가 타이핑되는 순간 glow 효과: 코드 문자열에서 `SYNTAX_CODE.indexOf('->')` 로 동적으로 charIndex를 계산하고, `AUDIO_CONFIG.syntaxScene.speechStartFrame + Math.ceil(charIndex / CHARS_PER_SEC * fps)` 프레임에서 `interpolate`로 `boxShadow` 강도 증가 → 감소 (하드코딩 금지, 동적 계산 필수)
  - `whiteSpace: "pre"` 적용 (들여쓰기 보존), 모든 `fontFamily: monoFont`에 `fontFeatureSettings: MONO_NO_LIGA`
  - **duration 계산 (헌법 원칙):**
    ```ts
    const SYNTAX_TYPING_END =
      AUDIO_CONFIG.syntaxScene.speechStartFrame +
      Math.ceil((SYNTAX_CODE_CHARS / CHARS_PER_SEC) * fps);
    const SYNTAX_SCENE_DURATION = Math.max(
      AUDIO_CONFIG.syntaxScene.durationInFrames,
      SYNTAX_TYPING_END + CROSS + SCENE_TAIL_FRAMES,
    );
    ```
    `SYNTAX_CODE_CHARS` = 예제 코드 전체 글자 수 (개행 포함)
- **나레이션:**
  1. "[switch(발음:스위치)] 뒤에 조건값을 쓰고, 각 케이스에 화살표로 결과를 연결합니다."
  2. "화살표 문법을 사용하면 코드가 훨씬 간결해집니다."

---

### 5. NoFallthroughScene

- **비주얼:** 좌우 패널 비교. 좌측 패널은 `AUDIO_CONFIG.noFallthroughScene.speechStartFrame` 기준 등장, 우측 패널은 `AUDIO_CONFIG.noFallthroughScene.narrationSplits[0]` 기준 등장.
  - **좌측 (전통 switch):**
    - 케이스 2개만 표시 — `case "MON":` (본문만 있고 break 미포함)와 `case "TUE": ... break;` (break 포함)
    - `AUDIO_CONFIG.noFallthroughScene.speechStartFrame` 기준으로 첫 번째 케이스 아래에서 C_RED 색 화살표가 아래로 흘러내리는 애니메이션 (`interpolate`로 height `0 → 40px`)
    - 화살표 옆에 "다음 케이스 실행!" 경고 레이블 (C_RED)
  - **우측 (모던 switch):**
    - 동일한 케이스 2개를 화살표 문법으로 표시 — `case "MON" ->`, `case "TUE" ->`
    - 각 케이스가 독립 박스(border C_ARROW)로 표시, 사이에 "차단" 시각 표시 없음
- **나레이션:**
  1. "기존 [switch(발음:스위치)]는 각 케이스 종료를 명시하지 않으면 다음 케이스로 흘러내립니다."
  2. "화살표 문법은 각 케이스가 독립 실행되어 이런 실수가 없습니다."

---

### 6. MultiCaseScene

- **비주얼:** 두 단계로 분리
  - **Phase 1** (`AUDIO_CONFIG.multiCaseScene.speechStartFrame` ~ `AUDIO_CONFIG.multiCaseScene.narrationSplits[0]`): `case "SAT", "SUN" ->` 코드 표시. "SAT"와 "SUN" 두 값이 C_STR 색으로 glow 강조되며 하나의 `->` 화살표로 연결되는 애니메이션 (opacity spring)
  - **Phase 2** (`AUDIO_CONFIG.multiCaseScene.narrationSplits[0]` ~): 전체 `String msg = switch (day) { ... }` 표현식으로 확장. `msg =` 부분을 C_RESULT 색상으로 강조, 결과값이 `msg` 변수로 흘러들어가는 효과 (opacity spring)
- **나레이션:**
  1. "여러 값을 하나의 케이스로 묶어 중복 없이 처리할 수 있습니다."
  2. "[switch(발음:스위치)] 표현식은 값을 반환하므로 변수에 바로 대입할 수 있습니다."

---

### 7. SummaryScene (마지막 씬)

- **비주얼:** 코드 블록 + 요약 카드 3개
  - 코드: 완성된 switch 표현식 전체, `AUDIO_CONFIG.summaryScene.speechStartFrame` 기준 opacity spring 등장
  - 카드 1: 🏹 화살표 문법 (`->`) — C_ARROW, `AUDIO_CONFIG.summaryScene.speechStartFrame` 기준 spring
  - 카드 2: ✅ fall-through 없음 — C_ARROW, `AUDIO_CONFIG.summaryScene.narrationSplits[0]` 기준 spring
  - 카드 3: 📦 값 반환 · 케이스 묶기 — C_RESULT, `AUDIO_CONFIG.summaryScene.narrationSplits[1]` 기준 spring
- **`useFade(d, { out: false })`** — 마지막 씬, fadeOut 없음
- **나레이션 (3문장 — 카드와 1:1 매핑):**
  1. "화살표 문법으로 각 케이스를 간결하게 작성할 수 있습니다."
  2. "[fall-through(발음:폴스루)] 없이 각 케이스가 독립 실행됩니다."
  3. "값 반환과 케이스 묶기로 더욱 강력하게 사용할 수 있습니다."

---

## 전역 원칙 준수 체크리스트

- [ ] 자막에 코드 없음 (나레이션은 순수 한국어 설명)
- [ ] TTS 오독 단어 인라인 발음 문법 처리 (`switch`, `if`, `fall-through`) — `break`는 나레이션에 사용하지 않음
- [ ] 마지막 씬(SummaryScene) `useFade(d, { out: false })`
- [ ] 모든 `fontFamily: monoFont` 에 `fontFeatureSettings: MONO_NO_LIGA`
- [ ] SyntaxScene duration = `SYNTAX_TYPING_END + CROSS + SCENE_TAIL_FRAMES` vs 오디오 중 max (헌법)
- [ ] 모든 애니메이션 트리거는 `AUDIO_CONFIG.xxx.speechStartFrame` 또는 `narrationSplits` 기준 (완전 경로 사용)

---

## 오디오 파일명 규칙

**ThumbnailScene: 나레이션 없음 — 오디오 파일 없음**

| VIDEO_CONFIG 키 | 오디오 파일명 |
|---|---|
| `overview` | `switch-overview.mp3` |
| `intro` | `switch-intro.mp3` |
| `syntaxScene` | `switch-syntax.mp3` |
| `noFallthroughScene` | `switch-nofallthrough.mp3` |
| `multiCaseScene` | `switch-multicase.mp3` |
| `summaryScene` | `switch-summary.mp3` |

---

## 구현 참고

- 타이핑 애니메이션: `src/compositions/001-Java-Basic/008-JavaWhile.tsx` WhileScene 패턴 참고
  (참고: while 에피소드는 이 세션에서 007→008로 리네이밍됨. 현재 저장소에 `008-JavaWhile.tsx`로 존재)
- Overview 트리: `src/compositions/001-Java-Basic/006-JavaIf.tsx` OverviewScene 패턴 참고
- Summary 카드: `src/compositions/001-Java-Basic/008-JavaWhile.tsx` SummaryScene 패턴 참고
- 좌우 비교 카드: `display: flex, gap: 32` 레이아웃 (IntroScene, NoFallthroughScene 공통)
