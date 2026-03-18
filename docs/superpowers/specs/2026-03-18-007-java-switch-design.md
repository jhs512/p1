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

---

## 씬 구성 (7씬)

### 1. ThumbnailScene

- **duration:** 30 프레임 (정적)
- **비주얼:** 배경 `#1e1e1e`, `switch` 키워드 대형 텍스트 중앙 배치, C_SWITCH 색상, 하단에 "Java 표현식" 레이블
- **나레이션:** 없음

---

### 2. OverviewScene

- **비주얼:** 006-JavaIf와 동일한 트리 구조. 기존 노드(변수, 자료형, 연산자, 비교, 논리, if)에 `switch` 노드를 팝업으로 추가. 팝업 애니메이션은 `speechStartFrame` 기준 spring 등장.
- **나레이션:**
  1. "다양한 조건을 처리할 때 [switch(발음:스위치)] 표현식을 사용할 수 있습니다."
  2. "[if(발음:이프)]문 대신 더 깔끔하게 조건을 분기할 수 있습니다."
- **타이밍:** switch 노드 팝업 → `AUDIO_CONFIG.overview.speechStartFrame` 기준

---

### 3. IntroScene

- **비주얼:** 좌우 비교 카드
  - 좌측: if-else 체인 코드 블록 (7줄, 흐린 색으로 "복잡함" 암시)
  - 우측: switch 표현식 코드 블록 (3줄, 밝은 색)
  - 우측 카드는 `AUDIO_CONFIG.intro.narrationSplits[0]` 프레임에 spring으로 등장
- **나레이션:**
  1. "요일에 따라 다른 메시지를 출력하려면 [if(발음:이프)]문을 여러 번 반복해야 합니다."
  2. "[switch(발음:스위치)] 표현식을 쓰면 훨씬 간결하게 작성할 수 있습니다."

---

### 4. SyntaxScene

- **비주얼:** 타이핑 애니메이션 (WhileScene 방식 동일)
  - 전체 switch 표현식 코드 타이핑 (`CHARS_PER_SEC = 10`)
  - `->` 화살표 등장 시 C_ARROW 색상 + 짧은 glow 효과 (`boxShadow` interpolate)
  - `whiteSpace: "pre"` 적용 (들여쓰기 보존)
  - **duration:** `max(AUDIO_CONFIG.syntaxScene.durationInFrames, speechStartFrame + ceil(TOTAL_CHARS/10*30) + CROSS + SCENE_TAIL_FRAMES)` — 헌법 원칙 적용
- **나레이션:**
  1. "[switch(발음:스위치)] 뒤에 조건값을 쓰고, 각 케이스에 화살표로 결과를 연결합니다."
  2. "화살표 문법을 사용하면 코드가 훨씬 간결해집니다."

---

### 5. NoFallthroughScene

- **비주얼:** 좌우 패널 비교
  - 좌측 (전통 switch): `case "MON": ... break;` 형태. break 없는 케이스에서 화살표가 아래로 흘러내리는 애니메이션 (`interpolate`로 height 증가). C_RED 색상으로 경고 표시
  - 우측 (모던 switch): `case "MON" -> ...` 형태. 각 케이스가 독립 박스로 표시, C_ARROW 색상
  - 우측 패널은 `AUDIO_CONFIG.noFallthroughScene.narrationSplits[0]` 프레임에 등장
- **나레이션:**
  1. "기존 [switch(발음:스위치)]는 [break(발음:브레이크)]를 빠뜨리면 다음 케이스로 흘러내립니다."
  2. "화살표 문법은 각 케이스가 독립 실행되어 이런 실수가 없습니다."

---

### 6. MultiCaseScene

- **비주얼:** 두 단계로 분리
  - **Phase 1** (`speechStartFrame` ~ `narrationSplits[0]`): `case "SAT", "SUN" ->` 코드 표시. 두 값이 하나의 화살표로 연결되는 애니메이션 (두 값 → glow → 화살표)
  - **Phase 2** (`narrationSplits[0]` ~): `String msg = switch (day) { ... }` 전체 표현식. `msg =` 부분을 C_RESULT 색상으로 강조, 값이 변수로 흘러들어가는 효과 (opacity spring)
- **나레이션:**
  1. "여러 값을 하나의 케이스로 묶어 중복 없이 처리할 수 있습니다."
  2. "[switch(발음:스위치)] 표현식은 값을 반환하므로 변수에 바로 대입할 수 있습니다."

---

### 7. SummaryScene (마지막 씬)

- **비주얼:** 코드 블록 + 요약 카드 3개 (stagger 등장)
  - 코드: 완성된 switch 표현식 전체 (`speechStartFrame` 기준 opacity spring)
  - 카드 1: 🏹 화살표 문법 (`->`) — C_ARROW
  - 카드 2: ✅ fall-through 없음 — `#4ec9b0`
  - 카드 3: 📦 값 반환 · 케이스 묶기 — C_RESULT
  - 카드 등장: `speechStartFrame + i * 14` 프레임마다 spring (008-JavaWhile 패턴 동일)
- **`useFade(d, { out: false })`** — 마지막 씬, fadeOut 없음
- **나레이션:**
  1. "화살표 문법, [fall-through(발음:폴스루)] 없음, 값 반환까지 세 가지 특징을 기억하세요."
  2. "모던 [switch(발음:스위치)]로 조건 분기를 더 안전하고 간결하게 작성할 수 있습니다."

---

## 전역 원칙 준수 체크리스트

- [ ] 자막에 코드 없음 (나레이션은 순수 한국어 설명)
- [ ] TTS 오독 단어 인라인 발음 문법 처리 (`switch`, `if`, `break`, `fall-through`)
- [ ] 마지막 씬(SummaryScene) `useFade(d, { out: false })`
- [ ] 모든 `fontFamily: monoFont` 에 `fontFeatureSettings: MONO_NO_LIGA`
- [ ] SyntaxScene duration = `max(오디오, 타이핑완료 + CROSS + SCENE_TAIL_FRAMES)` (헌법)
- [ ] 모든 애니메이션 트리거는 `AUDIO_CONFIG.xxx.speechStartFrame` 또는 `narrationSplits` 기준

---

## 오디오 파일명 규칙

| 씬 | 파일명 |
|---|---|
| overview | `switch-overview.mp3` |
| intro | `switch-intro.mp3` |
| syntaxScene | `switch-syntax.mp3` |
| noFallthroughScene | `switch-nofallthrough.mp3` |
| multiCaseScene | `switch-multicase.mp3` |
| summaryScene | `switch-summary.mp3` |

---

## 구현 참고

- 타이핑 애니메이션: `008-JavaWhile.tsx`의 WhileScene 패턴 참고
- Overview 트리: `006-JavaIf.tsx`의 OverviewScene 패턴 참고
- Summary 카드: `008-JavaWhile.tsx`의 SummaryScene 패턴 참고
- 좌우 비교 카드: IntroScene, NoFallthroughScene 에서 사용 — `display: flex, gap: 32` 레이아웃
