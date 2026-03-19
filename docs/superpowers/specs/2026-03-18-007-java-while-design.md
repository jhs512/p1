# 007 — Java While 루프 영상 설계 스펙

**날짜**: 2026-03-18
**파일**: `src/compositions/001-Java-Basic/007-JavaWhile.tsx`
**오디오 설정**: `src/compositions/001-Java-Basic/007-audio.ts` (auto-generated)
**시리즈**: 001-Java-Basic / 에피소드 7

---

## 개요

`while` 반복문을 소개하는 쇼츠 영상(1080×1920). 제어문 오버뷰에서 시작해 while 구조 소개 → 실행 추적 애니메이션 → 무한루프 경고 → 요약 순으로 진행한다.

---

## 씬 목록

총 7씬: `thumbnail`, `overview`, `intro`, `whileScene`, `executionScene`, `infiniteScene`, `summaryScene`

---

## 씬별 상세

### 1. ThumbnailScene

- 정지 썸네일 (`durationInFrames: 30`)
- 배경 `#050510`, 중앙에 `while` 키워드(보라 계열) + 시리즈 라벨

### 2. OverviewScene

006 OverviewScene과 동일한 트리 구조를 재사용한다.

**트리 구조**:

```
       제어문
      /      \
   조건문    반복문   ← 하이라이트
    (dim)       |
              while  ← spring 팝업
```

- Phase 1 (0 ~ split0): 제어문 루트 + 조건문(dim) + 반복문 노드 등장
- Phase 2 (split0 ~): 반복문 노드 글로우, 아래에 `while` 키워드 spring 팝업 + 하이라이트

**나레이션**:

```
["반복문에는 여러 종류가 있습니다.", "그 중 기본인 [while(발음:와일)] 문을 알아보겠습니다."]
```

### 3. IntroScene

- `while (조건) { 실행코드 }` 구조를 텍스트로 소개
- 배경: `#1e1e1e`, 중앙에 구조 다이어그램 (키워드 보라, 조건 amber, 블록 dim)

**나레이션**:

```
["[while(발음:와일)] 문은 조건이 참인 동안 코드 블록을 반복 실행합니다.", "조건이 거짓이 되는 순간 반복을 멈춥니다."]
```

### 4. WhileScene

전체 예제 코드를 타이핑 등장시키며 각 부분을 설명한다.

**코드**:

```java
int count = 1;
while (count <= 5) {
    System.out.println(count);
    count++;
}
```

- `while` 키워드: 보라(`#c586c0`)
- `count <= 5` 조건: amber(`#e5c07b`) 하이라이트
- `count++`: teal(`#4ec9b0`) 하이라이트
- 코드 전체 타이핑 애니메이션 (speechStartFrame 기준)

**나레이션**:

```
["괄호 안 조건이 참이면 블록을 실행하고 다시 조건을 확인합니다.", "카운터를 증가시켜 조건을 변화시키고 반복이 끝나게 합니다."]
```

### 5. ExecutionScene

while 루프의 실제 실행을 단계별로 시각화한다.

**레이아웃**:

- 좌측(40%): 코드 고정 표시. 현재 실행 중인 줄 하이라이트 (조건 확인 줄 / 본문 줄 교대)
- 우측(60%):
  - `count = N` 박스 (spring 숫자 전환, 1→2→3→4→5→6)
  - 조건 배지: `count <= 5` → ✓(teal) 또는 ✗(red)
  - 출력 로그: `1`, `2`, `3`, `4`, `5` 누적 표시

**이터레이션 타이밍**: 단계 트리거는 `AUDIO_CONFIG.executionScene.narrationSplits` 기준. 총 5회 반복 + 종료 확인. 하드코딩 프레임 오프셋 금지.

**나레이션**:

```
["count가 1일 때 조건이 참이므로 블록을 실행합니다.", "count가 6이 되면 조건이 거짓이 되어 반복이 종료됩니다."]
```

### 6. InfiniteScene

무한루프 경고 씬.

**코드** (잘못된 예, `count++` 없음):

```java
int count = 1;
while (count <= 5) {
    System.out.println(count);
    // count++ 없음!
}
```

**시각화**:

- `count++` 줄 자리에 빨간 취소선 또는 빈 자리 강조
- ⚠️ 아이콘 (amber) spring 등장
- 코드 블록 테두리 빨간 펄싱: `interpolate(frame, [0, 30], [0.3, 1], { extrapolateRight: "extend" })` + `Math.abs(Math.sin(frame * 0.1))` 패턴 사용 — CSS `animation` 금지
- "∞ 무한루프" 텍스트 fade-in

**나레이션**:

```
["탈출 조건이 없으면 무한루프가 됩니다.", "반드시 조건을 거짓으로 만드는 코드가 필요합니다."]
```

### 7. SummaryScene (마지막 씬)

- `useFade(d, { out: false })` 적용 (fadeOut 없음)
- 전체 while 코드 정적 표시
- 하단에 핵심 요약 텍스트 2줄 순차 등장

**나레이션**:

```
["[while(발음:와일)]은 조건이 참인 동안 반복합니다.", "조건이 거짓이 되면 멈춥니다."]
```

---

## 기술 규칙

- 폰트/상수/훅: 모두 `../../utils/scene`에서 import (`monoFont`, `uiFont`, `MONO_NO_LIGA`, `CROSS`, `useFade`, `Subtitle`)
- 폰트 로딩 코드(`loadJetBrains`, `delayRender` 등)를 파일에 직접 쓰지 않는다
- 모든 `fontFamily: monoFont` 사용처에 `fontFeatureSettings: MONO_NO_LIGA` 필수
- CSS `transition`/`animation` 금지 → `interpolate`/`spring` 사용
- `durationInFrames`/`narrationSplits` 등은 auto-generated `007-audio.ts`에서 참조
- 애니메이션 타이밍은 `AUDIO_CONFIG.{씬}.narrationSplits` / `speechStartFrame` / `sentenceEndFrames` 직접 참조 (하드코딩 오프셋 금지)

---

## 색상 팔레트

| 역할           | 색상              |
| -------------- | ----------------- |
| `while` 키워드 | `#c586c0` (보라)  |
| 조건식         | `#e5c07b` (amber) |
| 카운터/증감    | `#4ec9b0` (teal)  |
| 숫자 리터럴    | `#b5cea8`         |
| 참(true)       | `#4ec9b0`         |
| 거짓/경고      | `#f47c7c` (red)   |

---

## 파일 목록

- `src/compositions/001-Java-Basic/007-JavaWhile.tsx` — 신규 생성
- `src/compositions/001-Java-Basic/007-audio.ts` — sync 후 자동 생성
