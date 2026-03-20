# Java 기초 강좌 — 에피소드 제작 가이드

이 문서는 1~10강의 패턴을 분석하여 추출한 **에피소드 제작 헌법**이다.
새 에피소드를 만들 때 기존 에피소드 코드를 읽을 필요 없이, 이 문서만으로 동일한 품질을 재현한다.

---

## 1. 파일 구조

```
{id}-1-{ComponentName}.tsx   — 메인 컴포지션 (씬 컴포넌트 + VIDEO_CONFIG + compositionMeta)
{id}-2-content.ts            — 나레이션/콘텐츠 데이터 (satisfies EpisodeContent)
{id}-3-audio.gen.ts          — AUTO-GENERATED (pnpm sync가 생성)
{id}-4-sub.gen.ts            — AUTO-GENERATED (SRT 자막)
```

**id 규칙**: `011`, `012` 등 3자리 숫자.
**ComponentName 규칙**: `JavaArray`, `JavaString` 등 PascalCase.

---

## 2. 에피소드 골격 (씬 순서)

모든 에피소드는 아래 순서를 **기본 템플릿**으로 사용한다.
주제에 따라 Detail 씬을 늘리거나 Pain/Comparison을 생략할 수 있다.

```
1. ThumbnailScene     — 30프레임, 정지 화면, 오디오 없음
2. [PainScene]        — (선택) 기존 방식의 고통을 보여줌
3. IntroScene         — 주제 소개 + 핵심 키워드 등장
4. DetailScene ×N     — 개념 설명 씬들 (주제에 따라 2~5개)
5. SummaryScene       — 핵심 정리 카드
6. [ComparisonScene]  — (선택) Before/After 비교
7. [RealExampleScene] — (선택) 실감나는 실전 예시
```

- **마지막 씬**: `useFade(d, { out: false })` — fadeOut 없음.
- **나머지 씬**: `useFade(d)` — fadeIn + fadeOut 모두 적용.

---

## 3. content.ts 작성법

```ts
export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n배열", // 줄바꿈으로 2줄
    badge: "배열", // 키워드 뱃지 (없으면 생략)
  },
  intro: {
    narration: ["첫 번째 문장.", "두 번째 문장."],
  },
  // ... 각 씬별 narration
} satisfies EpisodeContent;
```

- `satisfies EpisodeContent`으로 타입 검증한다 (`as const` 사용 금지).
- `import type { EpisodeContent } from "../../../types/episode";` 필요.

### 나레이션 규칙

- **자막에 코드 금지**: `int`, `score += 10` 같은 코드는 화면 비주얼로 보여준다.
- **문장 수**: 씬당 2~4문장. 짧고 명확하게.
- **톤**: 교육적, 설명 중심. "~입니다", "~합니다" 체.
- **인라인 발음**: TTS가 잘못 읽을 단어에 사용.
  ```
  [표시텍스트(발음:TTS읽기)]
  ```
  예: `[System.out.println(발음:print line)]`, `[int(발음:인트)]`, `[for(발음:포)]`
- **빈 발음(묵음)**: `[(자료)(발음:)]`
- **줄바꿈**: 나레이션 문자열 안에서 `\n`으로 자막 줄 분리.

---

## 4. 메인 컴포지션 파일 구조

### 4-1. import 블록

```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import React from "react";

import {
  CHARS_PER_SEC,
  CROSS,
  ContentArea,
  FONT,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  monoStyle,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { SrtEntry, addSrtScene, computeFromValues } from "../../../utils/srt";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_AMBER,
  C_COMMENT,
  C_DIM,
  C_FUNC,
  C_KEYWORD,
  C_NUMBER,
  C_OPERATOR,
  C_PAIN,
  C_PURPLE,
  C_STRING,
  C_TEAL,
  C_TYPE,
  C_VAR,
  TEXT,
} from "./colors";
import { FPS, HEIGHT, WIDTH } from "./config";
import { CONTENT } from "./{id}-2-content";
import { AUDIO_CONFIG } from "./{id}-3-audio.gen";
```

### 4-2. VIDEO_CONFIG

```tsx
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  intro: {
    audio: "prefix-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  // ... 각 씬 동일 패턴
};
```

- `audio` 파일명 prefix: sync가 자동 생성. 에피소드별 prefix 결정.
  - 예: `fn-intro.mp3`, `arr-intro.mp3`, `for-intro.mp3`

### 4-3. sceneList → fromValues → totalDuration

```tsx
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  // ...나머지 씬들 순서대로
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;
```

### 4-4. compositionMeta

```tsx
export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: totalDuration,
};
```

### 4-5. 메인 Component

```tsx
export const Component: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence from={fromValues[0]} durationInFrames={30}>
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.intro.durationInFrames}
    >
      <IntroScene />
    </Sequence>
    {/* ... 나머지 씬들 */}
  </AbsoluteFill>
);
```

---

## 5. 씬 타입별 레시피

### 5-1. ThumbnailScene (30프레임, 오디오 없음)

```tsx
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: BG_THUMB,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 28,
    }}
  >
    {/* 배경 글로우 */}
    <div
      style={{
        position: "absolute",
        width: 860,
        height: 860,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(78,201,176,0.12) 0%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
    {/* JAVA 라벨 */}
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 26,
        fontWeight: 700,
        color: C_TEAL,
        letterSpacing: 10,
        opacity: 0.8,
      }}
    >
      JAVA
    </div>
    {/* 타이틀 */}
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 108,
        fontWeight: 900,
        color: "#fff",
        textAlign: "center",
        lineHeight: 1,
        textShadow:
          "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
      }}
    >
      Java
      <br />
      <span style={{ color: C_TEAL }}>{/* 에피소드 제목 */}</span>
    </div>
    {/* 키워드 뱃지 (선택) */}
    <div
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 64,
        fontWeight: 900,
        color: C_TEAL,
        background: "#4ec9b018",
        border: "2px solid #4ec9b055",
        borderRadius: 18,
        padding: "18px 56px",
        marginTop: 8,
      }}
    >
      {/* 키워드 */}
    </div>
  </AbsoluteFill>
);
```

### 5-2. 일반 씬 골격

```tsx
const SomeScene: React.FC = () => {
  const { someScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d); // 마지막 씬이면 useFade(d, { out: false })
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 애니메이션들...

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {/* 비주얼 콘텐츠 */}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.someScene.wordStartFrames}
      />
    </>
  );
};
```

**핵심 규칙:**

- `AbsoluteFill`에 **반드시** `background: BG` — 크로스페이드 시 뒤가 비침 방지.
- `Subtitle`은 **반드시** `AbsoluteFill` 바깥 (opacity wrapper 밖) — 자막에 페이드 트랜지션이 걸리면 안 됨.
- `ContentArea`로 자막 영역 제외한 공간에 콘텐츠 배치.

### 5-3. IntroScene — 핵심 타이틀 + 키워드 카드 패턴

**1문장**: 큰 타이틀 텍스트 (개념 설명)
**2문장~**: 키워드 카드/박스 등장

```tsx
// 1문장: 타이틀 등장 + 2문장 시작 시 퇴장
const titleAppear = spring({
  frame: frame - s,
  fps,
  config: { damping: 14, stiffness: 120 },
  durationInFrames: 24,
});
const titleExit = spring({
  frame: frame - split0,
  fps,
  config: { damping: 14, stiffness: 200 },
  durationInFrames: 18,
});
const titleOpacity = titleAppear * (1 - titleExit);

// 2문장: 키워드 카드 등장
const cardAppear = spring({
  frame: frame - split0,
  fps,
  config: { damping: 14, stiffness: 140 },
  durationInFrames: 30,
});
```

### 5-4. ComparisonScene — Before/After 비교

```
[라벨: 고통스러운 코드]
┌─ 코드 블록 (C_PAIN 하이라이트) ─┐
└──────────────────────────────────┘
              ▼ (C_TEAL)
[라벨: 개선된 코드]
┌─ 코드 블록 (C_FUNC 하이라이트) ─┐
└──────────────────────────────────┘
```

- 1문장: Before 블록 등장 (spring, `frame - s`)
- 중간: 화살표 등장
- 2문장: After 블록 등장 (spring, `frame - split`)
- 하이라이트: After 등장 + 12프레임 후

### 5-5. SummaryScene — 정리 카드

- 카드 데이터: `CONTENT.summaryScene.cards` 배열
- 각 카드: `wordStartFrames`의 특정 단어 시점에 spring 등장
- 카드 스타일: `border: 3px solid ${C_FUNC}66`, `background: ${C_FUNC}18`, `borderRadius: 16`
- 카드 등장: `scale(0.8→1)` + `opacity(0→1)`
- **정리/요약 씬에서 기존 코드 줄을 비활성화(opacity 낮추기)하지 않는다** — 헌법.
  정리 씬은 전체를 한눈에 보여주는 것이 목적이므로, 새 줄이 추가되더라도 이전 줄은 동일한 opacity를 유지한다.
  (상세 설명 씬에서 포커싱 목적으로 이전 줄을 흐리게 하는 것은 허용)

### 5-6. RealExampleScene — 실전 예시

- 상단: 고통 카드 N개 (같은 코드가 여러 곳에 반복)
- ▼ 화살표
- 하단: 함수 선언 + 호출 카드들
- 반복 부분에 밑줄 애니메이션 (빨간색)

---

## 6. 애니메이션 패턴

### 6-1. Spring 설정 표준

| 용도        | damping | stiffness | durationInFrames |
| ----------- | ------- | --------- | ---------------- |
| 일반 등장   | 12~14   | 130~140   | 24~30            |
| 빠른 등장   | 14      | 200       | 18               |
| 느슨한 등장 | 10~11   | 90~120    | 30~35            |
| 결과 표시   | 11~13   | 120       | 20~22            |
| 카드 등장   | 12~13   | 130~140   | 24~26            |

### 6-2. Scale 보간 표준

```tsx
const scale = interpolate(appear, [0, 1], [0.8, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

- 일반 요소: `[0.8, 1]` 또는 `[0.85, 1]`
- 큰 등장 효과: `[0.2, 1]` 또는 `[0.3, 1]` (Intro 박스 등)
- 미세 등장: `[0.92, 1]` (코드 블록 등)

### 6-3. 타이핑 애니메이션

```tsx
const charsVisible = Math.floor(
  (Math.max(0, frame - startFrame) / fps) * charsPerSec,
);
const visibleText = fullText.slice(0, charsVisible);
```

- 기본 속도: `CHARS_PER_SEC = 10`
- 빠른 코드 타이핑: 18~22
- Summary 정리 코드: 20~22
- **씬 duration 계산 시 타이핑 완료 프레임 반영 필수** (헌법 6조)

### 6-4. 발화 동기화

```tsx
// 특정 단어 시점에 애니메이션
const triggerFrame = AUDIO_CONFIG.someScene.wordStartFrames[sentenceIdx][wordIdx];
const appear = spring({ frame: frame - triggerFrame, fps, ... });
```

- **하드코딩 오프셋 절대 금지** — 반드시 `wordStartFrames` 또는 `narrationSplits` 참조.
- sync 후 wordStartFrames가 자동 갱신되므로 코드 수정 없이 타이밍 유지.

### 6-5. 등장 요소는 opacity로 제어 (조건부 렌더링 금지)

```tsx
// ❌ 금지 — 등장 시 레이아웃 변경
{
  phase2 && <div>요소</div>;
}

// ✅ 올바름 — 항상 공간 확보
<div style={{ opacity: appear }}>요소</div>;
```

### 6-6. 퇴장에는 spring을 쓰지 않는다 — interpolate를 쓴다

spring은 오버슈트(1.0 초과 후 진동)가 발생하므로 `(1 - spring)` 패턴이 음수 또는 재양수가 되어
사라진 요소가 깜빡이며 다시 나타난다. **퇴장은 반드시 `interpolate`로 선형 보간한다.**

```tsx
// ❌ 금지 — spring 오버슈트 → 퇴장 후 깜빡이며 재출현
const exit = spring({ frame: frame - split, fps, ... });
const opacity = appear * (1 - exit);

// ✅ 올바름 — interpolate는 오버슈트 없이 깔끔하게 0으로
const exit = interpolate(frame, [split - 20, split], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
const opacity = appear * (1 - exit);
```

- split 20프레임 전에 시작하여 split 도달 시 완전히 사라지게 한다.
- **퇴장과 다음 요소 등장이 같은 프레임에 겹치면 안 된다.**

---

## 7. 비주얼 스타일 규칙

### 7-1. 코드 블록

```tsx
{
  background: BG_CODE,    // #2d2d2d
  borderRadius: 12,
  padding: "20px 32px",   // 작은 블록: "14px 20px"
  ...monoStyle,           // fontFamily + fontFeatureSettings 한번에 적용
  fontSize: 24~30,        // 콘텐츠 크기에 따라 조절
}
```

### 7-2. 폰트 스케일 시스템 (FONT 상수)

`src/utils/scene.tsx`에 정의된 글로벌 폰트 스케일을 사용한다.
매번 하드코딩하지 않는다.

```ts
import { FONT } from "../../../utils/scene";

FONT.label; // 26px — 라벨, 뱃지, 코드 블록 위 설명 텍스트
FONT.heading; // 32px — 씬 소제목, 섹션 헤더
FONT.title; // 44px — 큰 제목, 카드 텍스트
FONT.display; // 56px — 강조 텍스트, 핵심 키워드
```

### 7-3. 라벨 스타일

```tsx
const labelStyle = (color: string): React.CSSProperties => ({
  fontFamily: uiFont,
  fontSize: FONT.label, // ← 하드코딩 금지, FONT.label 사용
  fontWeight: 700,
  color,
  letterSpacing: 2,
  marginBottom: 10,
  opacity: 0.85,
});
```

### 7-4. 코드 구문 색상 (colors.ts 기준)

| 요소                                                | 상수         | 색상                   |
| --------------------------------------------------- | ------------ | ---------------------- |
| 키워드 (void, for, if, else, while, switch, return) | `C_KEYWORD`  | #569cd6                |
| 자료형 (int, double, boolean, String)               | `C_TYPE`     | #4e9cd5                |
| 문자열 리터럴                                       | `C_STRING`   | #ce9178                |
| 숫자 리터럴                                         | `C_NUMBER`   | #b5cea8                |
| 함수 이름                                           | `C_FUNC`     | #dcdcaa                |
| 변수 이름                                           | `C_VAR`      | #9cdcfe                |
| 주석                                                | `C_COMMENT`  | #6a9955                |
| 비교/조건 연산자                                    | `C_PURPLE`   | #c586c0                |
| 논리 연산자                                         | `C_AMBER`    | #e5c07b                |
| 산술 연산자                                         | `C_OPERATOR` | #d4834e                |
| 강조 (teal 계열)                                    | `C_TEAL`     | #4ec9b0                |
| 고통/경고                                           | `C_PAIN`     | #f47c7c                |
| 흐릿한 텍스트                                       | `C_DIM`      | rgba(255,255,255,0.22) |
| 기본 텍스트                                         | `TEXT`       | #d4d4d4                |

### 7-5. 코드 연산자 공백 규칙

연산자 양옆에 **반드시** 공백을 넣는다.

```
✅ age = age + 2;
❌ age=age+2;
```

### 7-6. 콘텐츠 배치

```tsx
<ContentArea>
  <div style={{
    position: "absolute",
    top: "45%",          // 또는 "42%", "50%" — 내용량에 따라 조절
    left: "50%",
    transform: "translate(-50%, -50%)",
    // 콘텐츠...
  }}>
</ContentArea>
```

- `ContentArea`는 자막 영역을 제외한 상단 공간.
- `top: "45%"` 기준으로 수직 중앙 배치 (자막 공간 고려).

---

## 8. 크로스페이드 전환

- **CROSS = 20프레임** — 씬 간 겹치는 구간.
- 각 씬의 `AbsoluteFill`에 `background: BG` 필수 → 겹침 시 뒤가 비치지 않음.
- `useFade(d)`가 처음 20프레임 fadeIn, 마지막 20프레임 fadeOut 자동 처리.
- `Subtitle`은 `AbsoluteFill` **바깥**에 넣어야 함 — 전환 시 자막에 페이드가 걸리면 안 됨.
- **CROSS 만큼 콘텐츠 시작을 딜레이하지 않는다** — 기존 1~10강은 딜레이 없음.

---

## 9. 씬 duration 규칙 (헌법 6조)

```tsx
// 오디오만으로 충분한 경우
durationInFrames: AUDIO_CONFIG.someScene.durationInFrames;

// 타이핑 애니메이션이 오디오보다 긴 경우
const TYPING_END = startFrame + Math.ceil((totalChars / charsPerSec) * fps);
durationInFrames: calcDuration(
  AUDIO_CONFIG.someScene.durationInFrames,
  TYPING_END,
);
```

- `calcDuration(audioDuration, animEndFrame)`: `Math.max(audio, anim + CROSS + SCENE_TAIL_FRAMES)`
- **오디오만 끝났다고 씬을 전환하면 안 된다.**

---

## 10. 워크플로우

### 새 에피소드 추가

**0단계: 스캐폴딩**

```bash
pnpm new 001-Java-Basic/KOR/011 --title "JavaArray" --prefix arr
```

- `011-1-JavaArray.tsx` + `011-2-content.ts` 스텁 자동 생성
- `--prefix arr` → 오디오 파일명이 `arr-intro.mp3`, `arr-summary.mp3` 등으로 생성
- 스텁에 ThumbnailScene, IntroScene, SummaryScene 골격 포함

**이후 단계:**

1. `{id}-2-content.ts` 수정 (나레이션 작성)
2. `{id}-1-{Name}.tsx` 수정 (씬 컴포넌트 구현)
3. `pnpm sync 001-Java-Basic/KOR/{id}` 실행 → audio.gen.ts 자동 생성
4. Remotion Studio에서 확인: `pnpm dev` → `localhost:3000`
5. 씬 단위로 커밋 + 푸시

### 나레이션 수정 시

나레이션이나 인라인 발음이 바뀌면 **즉시** sync 실행:

```bash
pnpm sync 001-Java-Basic/KOR/{id}
```

### 렌더링

```bash
pnpm render 001-Java-Basic/KOR/{id}
```

---

## 11. 금지 사항 체크리스트

- [ ] CSS `transition` / `animation` 사용 → `spring` / `interpolate` 사용
- [ ] `100dvw` 사용 → `useVideoConfig().width` 사용
- [ ] `fontFamily: monoFont`에 `fontFeatureSettings: MONO_NO_LIGA` 누락 → `...monoStyle` 사용 권장
- [ ] content.ts에서 `as const` 사용 → `satisfies EpisodeContent` 사용
- [ ] 자막에 코드 포함 (`int`, `score += 10` 등)
- [ ] 하드코딩 타이밍 오프셋 (`durationInFrames / 2 + 30` 등)
- [ ] 조건부 렌더링으로 요소 등장 (`{show && <div>}`) → opacity 사용
- [ ] 마지막 씬에 fadeOut 적용 → `useFade(d, { out: false })`
- [ ] `AbsoluteFill`에 `background: BG` 누락
- [ ] `Subtitle`이 opacity wrapper 안쪽에 있음 (바깥이어야 함)
- [ ] 코드에서 연산자 양옆 공백 누락 (`age=age+2;`)
- [ ] 라벨/뱃지 fontSize 하드코딩 → `FONT.label` 사용
- [ ] 정리/요약 씬에서 기존 코드 줄 비활성화(opacity 낮춤) → 전체 동일 opacity 유지
- [ ] 씬에 자막만 있고 화면이 비어 있음 → 핵심 키워드를 중앙에 크게 표시
- [ ] 퇴장에 `spring` 사용 → `interpolate`로 교체 (오버슈트 재출현 방지)
- [ ] 퇴장이 `split` 시점에 시작 → `[split - 20, split]` 으로 앞당겨야 함

---

## 12. 오디오 파일 prefix 컨벤션

sync가 content의 씬 키를 기반으로 mp3 파일명을 생성한다.
VIDEO_CONFIG의 `audio` 필드에 사용할 파일명 prefix를 정한다.

| 에피소드           | prefix 예시 |
| ------------------ | ----------- |
| 001-JavaVariables  | `var-`      |
| 002-JavaDataTypes  | `dt-`       |
| 003-JavaOperators  | `op-`       |
| 004-JavaComparison | `cmp-`      |
| 005-JavaLogical    | `log-`      |
| 006-JavaIf         | `if-`       |
| 007-JavaSwitch     | `sw-`       |
| 008-JavaWhile      | `while-`    |
| 009-JavaFor        | `for-`      |
| 010-JavaFunction   | `fn-`       |

새 에피소드도 2~4글자 약어로 prefix를 정한다. (예: `arr-` for Array)

---

## 13. AUDIO_CONFIG 참조 가이드

```ts
AUDIO_CONFIG.{sceneKey} = {
  durationInFrames: number,           // 실측 오디오 길이 + SCENE_TAIL_FRAMES
  narrationSplits: number[],          // 2번째 문장부터의 시작 프레임
  sentenceEndFrames: number[],        // 각 문장 발화 종료 프레임
  speechStartFrame: number,           // 발화 시작 프레임 (leading silence 끝)
  speechEndFrame: number,             // 발화 종료 프레임 (trailing silence 시작)
  wordStartFrames: number[][],        // 문장별 단어 시작 프레임
  wordEndFrames: number[][],          // 문장별 단어 종료 프레임
  wordTiming: Record<string, number[]>, // 단어→프레임 매핑
}
```

- `wordStartFrames[0]` = 첫 문장의 단어들
- `wordStartFrames[1][0]` = 두 번째 문장 첫 단어의 시작 프레임
- `wordTiming["함수"]` = "함수"라는 단어가 등장하는 모든 프레임 배열
