# 0002 Java 자료형 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/compositions/0002-JavaDataTypes.tsx`를 구현해 Java 자료형(int, double, String, boolean) 쇼츠 영상을 완성한다.

**Architecture:** 0001과 동일하게 모든 컴포넌트를 단일 TSX 파일에 인라인 정의. `0002-audio.ts`는 `pnpm sync 0002`가 자동 생성. Root.tsx는 `require.context`로 0002를 자동 감지.

**Tech Stack:** Remotion 4.x, React 19, TypeScript, edge-tts, ffprobe

---

## Chunk 1: 골격(Skeleton) + 오디오 생성

### Task 1: 0002-JavaDataTypes.tsx 골격 생성

**Files:**

- Create: `src/compositions/0002-JavaDataTypes.tsx`

VIDEO_CONFIG와 빈 씬 컴포넌트를 갖춘 골격을 만든다. 이 단계에서 `0002-audio.ts`는 없지만 `pnpm sync 0002`가 다음 Task에서 스텁을 자동 생성한다.

- [ ] **Step 1: 파일 생성**

```tsx
// src/compositions/0002-JavaDataTypes.tsx
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";

import React from "react";

import {
  PRONUNCIATION,
  RATE,
  SCENE_TAIL_FRAMES,
  VOICE,
} from "../global.config";
import { AUDIO_CONFIG } from "./0002-audio";

// sync.ts 가 이 파일을 esbuild 로 로드할 때 사용
export { VOICE, RATE, PRONUNCIATION };

// ── 상수 ─────────────────────────────────────────────────────
const CROSS = 20; // 크로스페이드 프레임
const TYPING_START = 20; // 타이핑 시작 프레임 (씬 내 상대값)
const CHARS_PER_SEC = 10; // 타이핑 속도

/** 텍스트 길이 → 타이핑 완료 프레임 (씬 내 상대값) */
const typingDone = (chars: number) =>
  TYPING_START + Math.ceil((chars / CHARS_PER_SEC) * 30);

/** 타입별 상자 색상 */
const TYPE_COLORS: Record<string, string> = {
  int: "#4e9cd5",
  double: "#d4c04e",
  String: "#4ec970",
  boolean: "#d4834e",
};

// ── 폰트 ─────────────────────────────────────────────────────
let monoFont = "JetBrains Mono, monospace";
let uiFont = "Noto Sans KR, sans-serif";

if (typeof window !== "undefined") {
  const _jb = loadJetBrains();
  const _ns = loadNotoSans();
  monoFont = _jb.fontFamily;
  uiFont = _ns.fontFamily;
  const _h = delayRender("Loading Google Fonts");
  Promise.all([_jb.waitUntilDone(), _ns.waitUntilDone()]).then(() =>
    continueRender(_h),
  );
}

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: {
    durationInFrames: 30,
  },
  intro: {
    audio: "dt-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    narration: [
      "자료형이란 변수에 저장할 수 있는 데이터의 종류입니다.",
      "Java에는 네 가지 핵심 자료형이 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  intScene: {
    audio: "dt-int.mp3",
    durationInFrames: AUDIO_CONFIG.intScene.durationInFrames,
    narration: [
      "int는 정수를 저장하는 자료형입니다.",
      "나이나 개수처럼 소수점이 없는 숫자에 사용합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intScene.narrationSplits,
  },
  doubleScene: {
    audio: "dt-double.mp3",
    durationInFrames: AUDIO_CONFIG.doubleScene.durationInFrames,
    narration: [
      "double은 소수점이 있는 실수를 저장합니다.",
      "키나 무게처럼 정밀한 값이 필요할 때 사용합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.doubleScene.narrationSplits,
  },
  stringScene: {
    audio: "dt-string.mp3",
    durationInFrames: AUDIO_CONFIG.stringScene.durationInFrames,
    narration: [
      "String은 문자열을 저장합니다.",
      "이름이나 메시지처럼 텍스트를 담을 때 사용합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.stringScene.narrationSplits,
  },
  booleanScene: {
    audio: "dt-boolean.mp3",
    durationInFrames: AUDIO_CONFIG.booleanScene.durationInFrames,
    narration: [
      "boolean은 참 또는 거짓만 저장하는 자료형입니다.",
      "조건 검사 결과를 담을 때 사용합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.booleanScene.narrationSplits,
  },
  summaryScene: {
    audio: "dt-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    narration: [
      "네 가지 자료형을 코드로 정리해봤습니다.",
      "상황에 맞는 자료형을 선택하는 것이 중요합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 빈 씬 플레이스홀더 ─────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#050510",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 120,
        fontWeight: 900,
        color: "#fff",
        textAlign: "center",
      }}
    >
      Java
      <br />
      <span style={{ color: "#4ec9b0" }}>자료형</span>
    </div>
  </AbsoluteFill>
);

const PlaceholderScene: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      background: "#1e1e1e",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ fontFamily: uiFont, fontSize: 60, color: "#fff" }}>
      {label}
    </div>
  </AbsoluteFill>
);

// ── 씬 목록 + fromValues 계산 ─────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.intScene,
  VIDEO_CONFIG.doubleScene,
  VIDEO_CONFIG.stringScene,
  VIDEO_CONFIG.booleanScene,
  VIDEO_CONFIG.summaryScene,
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;

// ── Composition 메타 ──────────────────────────────────────────
export const compositionMeta = {
  id: "JavaDataTypes",
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaDataTypes: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.intro.durationInFrames}
    >
      <PlaceholderScene label="Intro" />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.intScene.durationInFrames}
    >
      <PlaceholderScene label="int" />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.doubleScene.durationInFrames}
    >
      <PlaceholderScene label="double" />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.stringScene.durationInFrames}
    >
      <PlaceholderScene label="String" />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.booleanScene.durationInFrames}
    >
      <PlaceholderScene label="boolean" />
    </Sequence>
    <Sequence
      from={fromValues[6]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <PlaceholderScene label="Summary" />
    </Sequence>
  </AbsoluteFill>
);

export { JavaDataTypes as Component };
```

- [ ] **Step 2: 파일 저장 확인**

파일이 생성되었는지 확인한다. `0002-audio.ts`는 아직 없어도 된다 (다음 Task에서 생성).

---

### Task 2: 오디오 생성 및 0002-audio.ts 자동 생성

**Files:**

- Auto-create: `src/compositions/0002-audio.ts`
- Auto-create: `public/dt-intro.mp3`, `public/dt-int.mp3`, `public/dt-double.mp3`, `public/dt-string.mp3`, `public/dt-boolean.mp3`, `public/dt-summary.mp3`

- [ ] **Step 1: sync 실행**

```bash
pnpm sync 0002
```

Expected output:

```
📄  src/compositions/0002-JavaDataTypes.tsx

[gen]  dt-intro.mp3
       실측 X.XXs
       narrationSplits → [XX] ✅
[gen]  dt-int.mp3
...
📝  src/compositions/0002-audio.ts 업데이트 완료
✅  Done. Hashes updated.
```

오류 시: `edge-tts` 설치 확인 (`pip install edge-tts`), `ffprobe`/`ffmpeg` 설치 확인.

- [ ] **Step 2: 생성 파일 확인**

```bash
ls public/dt-*.mp3
cat src/compositions/0002-audio.ts
```

Expected `0002-audio.ts`:

```ts
// AUTO-GENERATED by `pnpm sync 0002` — do not edit manually

export const AUDIO_CONFIG = {
  intro: { durationInFrames: NNN, narrationSplits: [NN] },
  intScene: { durationInFrames: NNN, narrationSplits: [NN] },
  doubleScene: { durationInFrames: NNN, narrationSplits: [NN] },
  stringScene: { durationInFrames: NNN, narrationSplits: [NN] },
  booleanScene: { durationInFrames: NNN, narrationSplits: [NN] },
  summaryScene: { durationInFrames: NNN, narrationSplits: [NN] },
} as const;
```

- [ ] **Step 3: Remotion Studio에서 골격 확인**

```bash
pnpm dev
```

브라우저에서 `JavaDataTypes` 컴포지션이 나타나는지 확인. 씬별 PlaceholderScene 텍스트가 보이면 OK.

---

## Chunk 2: 공통 컴포넌트

### Task 3: 공통 헬퍼 컴포넌트 추가 (useTypingEffect, SceneTitle, CodeBox, Subtitle)

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

0001과 동일한 패턴을 0002 파일 내에 인라인으로 추가한다.

- [ ] **Step 1: `useTypingEffect` 훅 추가** (VIDEO_CONFIG 선언 이전, 폰트 로드 코드 바로 다음)

```tsx
// ── 훅: 타이핑 이펙트 ─────────────────────────────────────────
function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = 10,
): { visibleText: string; isDone: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsVisible = Math.floor(
    (Math.max(0, frame - startFrame) / fps) * charsPerSecond,
  );
  return {
    visibleText: text.slice(0, charsVisible),
    isDone: charsVisible >= text.length,
  };
}
```

- [ ] **Step 2: `SceneTitle`, `StaticLine`, `TypingLine`, `CodeBox` 추가**

`useTypingEffect` 바로 다음에 추가:

```tsx
// ── 컴포넌트: SceneTitle ──────────────────────────────────────
const SceneTitle: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      position: "absolute",
      top: 160,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: uiFont,
      fontSize: 42,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: 1,
    }}
  >
    {title}
  </div>
);

// ── 컴포넌트: CodeBox ─────────────────────────────────────────
const StaticLine: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ opacity: 0.5, color: "#d4d4d4", lineHeight: "1.8" }}>
    {text}
  </div>
);

const TypingLine: React.FC<{
  text: string;
  startFrame: number;
  charsPerSecond: number;
}> = ({ text, startFrame, charsPerSecond }) => {
  const { visibleText } = useTypingEffect(text, startFrame, charsPerSecond);
  return (
    <div style={{ color: "#d4d4d4", lineHeight: "1.8" }}>
      <ColorizedCode text={visibleText} />
    </div>
  );
};

const CodeBox: React.FC<{
  lines: { text: string; isNew: boolean }[];
  startFrame: number;
  charsPerSecond?: number;
}> = ({ lines, startFrame, charsPerSecond = CHARS_PER_SEC }) => (
  <div
    style={{
      position: "absolute",
      top: "57%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#2d2d2d",
      borderRadius: 12,
      padding: "40px 56px",
      minWidth: 780,
      fontFamily: monoFont,
      fontSize: 36,
    }}
  >
    {lines.map((line, i) =>
      line.isNew ? (
        <TypingLine
          key={`new-${i}`}
          text={line.text}
          startFrame={startFrame}
          charsPerSecond={charsPerSecond}
        />
      ) : (
        <StaticLine key={`static-${i}`} text={line.text} />
      ),
    )}
  </div>
);
```

> **주의:** `TypingLine` 안에서 `ColorizedCode`를 사용하므로, `ColorizedCode`가 먼저 선언되어야 한다. Task 4에서 `ColorizedCode`를 추가한 후 `TypingLine`을 이 위치에 배치한다.

- [ ] **Step 3: `Subtitle` 컴포넌트 추가** (CodeBox 다음)

```tsx
// ── 컴포넌트: Subtitle ────────────────────────────────────────
const Subtitle: React.FC<{
  sentences: string[];
  durationInFrames: number;
  splits?: readonly number[];
}> = ({ sentences, durationInFrames, splits }) => {
  const frame = useCurrentFrame();
  const { width: compositionWidth } = useVideoConfig();
  const ranges = sentences.map((_, i) => {
    if (splits && splits.length >= sentences.length - 1) {
      const start = i === 0 ? 0 : splits[i - 1];
      const end = i < splits.length ? splits[i] : durationInFrames;
      return { start, end };
    }
    const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
    let cumulative = 0;
    sentences.slice(0, i).forEach((s) => {
      cumulative += s.length;
    });
    const start = Math.floor((cumulative / totalChars) * durationInFrames);
    cumulative += sentences[i].length;
    const end = Math.floor((cumulative / totalChars) * durationInFrames);
    return { start, end };
  });
  const idx = ranges.findIndex(
    ({ start, end }) => frame >= start && frame < end,
  );
  const currentIdx = idx === -1 ? sentences.length - 1 : idx;
  const { start } = ranges[currentIdx];
  const opacity = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        fontFamily: uiFont,
        fontSize: 32,
        color: "#ffffff",
        opacity,
        background: "rgba(0,0,0,0.55)",
        borderRadius: 6,
        padding: "8px 16px",
        lineHeight: 1.6,
        width: "max-content",
        maxWidth: compositionWidth - 20,
        wordBreak: "keep-all",
        whiteSpace: "pre-line",
      }}
    >
      {sentences[currentIdx]}
    </div>
  );
};
```

---

### Task 4: ColorizedCode 구현 (per-keyword 색상)

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

- [ ] **Step 1: `ColorizedCode` 컴포넌트 추가** (상수 선언 바로 다음, `useTypingEffect` 이전)

```tsx
// ── 컴포넌트: ColorizedCode ───────────────────────────────────
// 타입 키워드마다 고유 색상 적용 (0001과 달리 per-keyword 색상 맵 사용)
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  // 순서 중요: double → int 순으로 매칭 (더 긴 것 먼저)
  const parts = text.split(
    /(\bdouble\b|\bint\b|\bString\b|\bboolean\b|"[^"]*"|\b\d+(?:\.\d+)?\b)/g,
  );
  return (
    <>
      {parts.map((part, i) => {
        if (TYPE_COLORS[part])
          return (
            <span key={i} style={{ color: TYPE_COLORS[part] }}>
              {part}
            </span>
          );
        if (/^"/.test(part))
          return (
            <span key={i} style={{ color: "#ce9178" }}>
              {part}
            </span>
          );
        if (/^\d/.test(part))
          return (
            <span key={i} style={{ color: "#b5cea8" }}>
              {part}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};
```

- [ ] **Step 2: 결과 확인**

`pnpm dev` 후 Studio에서 CodeBox가 있는 씬(나중에 구현)에서 키워드 색상 확인. 또는 Task 6 이후 확인.

---

### Task 5: TypeBox 컴포넌트

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

- [ ] **Step 1: `TypeBox` 추가** (Subtitle 컴포넌트 다음, 씬 컴포넌트 이전)

```tsx
// ── 컴포넌트: TypeBox ─────────────────────────────────────────
// 색상 상자 spring 등장 + 값 낙하 애니메이션
const TypeBox: React.FC<{
  color: string;
  value: string;
  label?: string;
  startFrame?: number;
  dropStartFrame?: number;
}> = ({ color, value, label, startFrame = 0, dropStartFrame = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 상자 등장 (spring)
  const boxE = frame - startFrame;
  const boxAppear = spring({
    frame: boxE,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 35,
  });
  const boxScale = interpolate(boxAppear, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 값 낙하 (단일 엘리먼트, Y 이동 + opacity 0→1, 깜빡임 없음)
  const dropE = frame - dropStartFrame;
  const DROP_FRAMES = 30;
  const dropY = interpolate(dropE, [0, DROP_FRAMES], [-140, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const dropO = interpolate(dropE, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dropGlow = interpolate(
    dropE,
    [DROP_FRAMES - 2, DROP_FRAMES + 2, DROP_FRAMES + 14],
    [0, 1, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (boxE < 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `scale(${boxScale})`,
        opacity: boxAppear,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 38,
            fontWeight: 700,
            color,
            letterSpacing: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          position: "relative",
          border: `4px solid ${color}`,
          borderRadius: 20,
          width: 260,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}1a`,
          boxShadow:
            dropGlow > 0.05
              ? `0 0 ${Math.round(dropGlow * 50)}px ${color}`
              : "none",
        }}
      >
        {dropE >= 0 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translateX(-50%) translateY(calc(-50% + ${dropY}px))`,
              fontFamily: monoFont,
              fontSize: 64,
              fontWeight: 700,
              color: "#d4d4d4",
              opacity: dropO,
            }}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Task 6: BooleanToggleAnim 컴포넌트

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

- [ ] **Step 1: `BooleanToggleAnim` 추가** (TypeBox 바로 다음)

```tsx
// ── 컴포넌트: BooleanToggleAnim ───────────────────────────────
// boolean 씬 전용: true↔false 토글 (45프레임 = 1.5초 주기)
const BooleanToggleAnim: React.FC<{
  startFrame?: number;
  dropStartFrame?: number;
}> = ({ startFrame = 0, dropStartFrame = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const COLOR = TYPE_COLORS.boolean; // "#d4834e"

  // 상자 등장
  const boxE = frame - startFrame;
  const boxAppear = spring({
    frame: boxE,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 35,
  });
  const boxScale = interpolate(boxAppear, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // true/false 토글 (frame-based, CSS transition 없음)
  const PERIOD = 45; // 1.5s at 30fps
  const elapsed = Math.max(0, frame - dropStartFrame);
  const cycleFrame = elapsed % (PERIOD * 2);
  const showTrue = cycleFrame < PERIOD;
  const toggleColor = showTrue ? "#4ec9b0" : "#f44747";
  const displayValue = showTrue ? "true" : "false";

  // 값 페이드인 (drop 시작 시)
  const valueOpacity = interpolate(frame - dropStartFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (boxE < 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `scale(${boxScale})`,
        opacity: boxAppear,
      }}
    >
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 38,
          fontWeight: 700,
          color: COLOR,
          letterSpacing: 4,
        }}
      >
        boolean
      </div>
      <div
        style={{
          position: "relative",
          border: `4px solid ${COLOR}`,
          borderRadius: 20,
          width: 260,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${COLOR}1a`,
        }}
      >
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 56,
            fontWeight: 700,
            color: toggleColor,
            opacity: valueOpacity,
          }}
        >
          {displayValue}
        </span>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Chunk 2 커밋**

```bash
git add src/compositions/0002-JavaDataTypes.tsx src/compositions/0002-audio.ts public/dt-*.mp3
git commit -m "feat: 0002 skeleton + audio + core components (ColorizedCode, TypeBox, BooleanToggleAnim)"
```

---

## Chunk 3: 씬 구현

### Task 7: ThumbnailScene 완성

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

- [ ] **Step 1: `ThumbnailScene` 교체** (기존 플레이스홀더를 실제 구현으로 교체)

```tsx
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#050510",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 24,
    }}
  >
    {/* 글로우 배경 */}
    <div
      style={{
        position: "absolute",
        width: 900,
        height: 900,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(78,201,176,0.12) 0%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 28,
        fontWeight: 700,
        color: "#4ec9b0",
        letterSpacing: 10,
        opacity: 0.8,
      }}
    >
      JAVA
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 140,
        fontWeight: 900,
        lineHeight: 1,
        textAlign: "center",
        color: "#ffffff",
        textShadow:
          "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
      }}
    >
      Java
      <br />
      <span style={{ color: "#4ec9b0" }}>자료형</span>
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 32,
        color: "#4ec9b0",
        letterSpacing: 4,
        opacity: 0.7,
      }}
    >
      int · double · String · boolean
    </div>
  </AbsoluteFill>
);
```

---

### Task 8: IntroScene 구현

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

- [ ] **Step 1: `IntroScene` 구현 및 메인 컴포넌트에서 PlaceholderScene 교체**

씬 컴포넌트 섹션(ThumbnailScene 다음)에 추가:

```tsx
// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const d = intro.durationInFrames;
  const fadeIn = interpolate(frame, [0, CROSS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boxes = [
    { label: "int", color: TYPE_COLORS.int },
    { label: "double", color: TYPE_COLORS.double },
    { label: "String", color: TYPE_COLORS.String },
    { label: "boolean", color: TYPE_COLORS.boolean },
  ];

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(intro.audio)} />
      {/* 2×2 그리드, stagger spring 등장 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
        }}
      >
        {boxes.map(({ label, color }, i) => {
          const delay = i * 5;
          const appear = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 140 },
            durationInFrames: 35,
          });
          const boxScale = interpolate(appear, [0, 1], [0.2, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={label}
              style={{
                transform: `scale(${boxScale})`,
                opacity: appear,
                border: `4px solid ${color}`,
                borderRadius: 20,
                width: 220,
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${color}1a`,
              }}
            >
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: 38,
                  fontWeight: 700,
                  color,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <Subtitle
        sentences={intro.narration}
        durationInFrames={d}
        splits={intro.narrationSplits}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 메인 컴포넌트에서 IntroScene PlaceholderScene 교체**

```tsx
// 기존:
<Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
  <PlaceholderScene label="Intro" />
</Sequence>

// 변경 후:
<Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
  <IntroScene />
</Sequence>
```

---

### Task 9: intScene / doubleScene / stringScene 구현

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

세 씬은 동일한 패턴 (`TypeBox` + `CodeBox` + `Subtitle`). 코드·색상·값만 다르다.

- [ ] **Step 1: 씬별 데이터 상수 추가** (씬 컴포넌트 섹션 앞)

```tsx
const TYPE_SCENE_DATA = {
  intScene: {
    code: "int age = 25;",
    value: "25",
    color: TYPE_COLORS.int,
    label: "int",
  },
  doubleScene: {
    code: "double height = 175.5;",
    value: "175.5",
    color: TYPE_COLORS.double,
    label: "double",
  },
  stringScene: {
    code: 'String name = "Java";',
    value: '"Java"',
    color: TYPE_COLORS.String,
    label: "String",
  },
} as const;
```

- [ ] **Step 2: `TypeScene` 범용 씬 컴포넌트 추가**

```tsx
// ── 씬: TypeScene (int / double / String 공통) ─────────────────
const TypeScene: React.FC<{
  sceneKey: keyof typeof TYPE_SCENE_DATA;
  config: typeof VIDEO_CONFIG.intScene;
}> = ({ sceneKey, config }) => {
  const frame = useCurrentFrame();
  const d = config.durationInFrames;
  const { code, value, color, label } = TYPE_SCENE_DATA[sceneKey];

  const fadeIn = interpolate(frame, [0, CROSS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dropStart = typingDone(code.length);

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(config.audio)} />
      {/* TypeBox: 화면 상단 1/3 중앙 */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <TypeBox
          color={color}
          value={value}
          label={label}
          startFrame={10}
          dropStartFrame={dropStart}
        />
      </div>
      {/* CodeBox: 화면 하단 중앙 (top 57% 기본값) */}
      <CodeBox
        lines={[{ text: code, isNew: true }]}
        startFrame={TYPING_START}
      />
      <Subtitle
        sentences={config.narration}
        durationInFrames={d}
        splits={config.narrationSplits}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: 메인 컴포넌트에서 PlaceholderScene 교체**

```tsx
// 기존 3개 Sequence 교체:
<Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.intScene.durationInFrames}>
  <TypeScene sceneKey="intScene" config={VIDEO_CONFIG.intScene} />
</Sequence>
<Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.doubleScene.durationInFrames}>
  <TypeScene sceneKey="doubleScene" config={VIDEO_CONFIG.doubleScene} />
</Sequence>
<Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.stringScene.durationInFrames}>
  <TypeScene sceneKey="stringScene" config={VIDEO_CONFIG.stringScene} />
</Sequence>
```

---

### Task 10: booleanScene 구현

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

- [ ] **Step 1: `BooleanScene` 추가**

```tsx
// ── 씬: BooleanScene ──────────────────────────────────────────
const BooleanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { booleanScene } = VIDEO_CONFIG;
  const d = booleanScene.durationInFrames;
  const code = "boolean isStudent = true;";
  const fadeIn = interpolate(frame, [0, CROSS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dropStart = typingDone(code.length);

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(booleanScene.audio)} />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <BooleanToggleAnim startFrame={10} dropStartFrame={dropStart} />
      </div>
      <CodeBox
        lines={[{ text: code, isNew: true }]}
        startFrame={TYPING_START}
      />
      <Subtitle
        sentences={booleanScene.narration}
        durationInFrames={d}
        splits={booleanScene.narrationSplits}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 메인 컴포넌트에서 교체**

```tsx
<Sequence
  from={fromValues[5]}
  durationInFrames={VIDEO_CONFIG.booleanScene.durationInFrames}
>
  <BooleanScene />
</Sequence>
```

---

### Task 11: summaryScene 구현

**Files:**

- Modify: `src/compositions/0002-JavaDataTypes.tsx`

4줄을 4개 Sequence로 순차 타이핑 (이전 줄은 static, 현재 줄은 isNew:true).

- [ ] **Step 1: `SummaryScene` 추가**

```tsx
// ── 씬: SummaryScene ─────────────────────────────────────────
const SUMMARY_LINES = [
  "int age = 25;",
  "double height = 175.5;",
  'String name = "Java";',
  "boolean isStudent = true;",
];

const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { summaryScene } = VIDEO_CONFIG;
  const d = summaryScene.durationInFrames;
  const fadeIn = interpolate(frame, [0, CROSS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const quarter = Math.floor(d / 4);
  // 마지막 구간은 나머지 전부
  const segDuration = (i: number) => (i < 3 ? quarter : d - 3 * quarter);

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(summaryScene.audio)} />
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={i} from={i * quarter} durationInFrames={segDuration(i)}>
          <CodeBox
            lines={SUMMARY_LINES.slice(0, i + 1).map((text, j) => ({
              text,
              isNew: j === i,
            }))}
            startFrame={0}
          />
        </Sequence>
      ))}
      <Subtitle
        sentences={summaryScene.narration}
        durationInFrames={d}
        splits={summaryScene.narrationSplits}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 메인 컴포넌트에서 교체**

```tsx
<Sequence
  from={fromValues[6]}
  durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
>
  <SummaryScene />
</Sequence>
```

- [ ] **Step 3: Chunk 3 커밋**

```bash
git add src/compositions/0002-JavaDataTypes.tsx
git commit -m "feat: 0002 all scenes implemented (intro, type scenes, boolean, summary)"
```

---

## Chunk 4: 검증 및 마무리

### Task 12: TypeScript 타입 체크

**Files:** 읽기 전용

- [ ] **Step 1: tsc 실행**

```bash
npx tsc --noEmit
```

Expected: 오류 없음. 오류 발생 시 오류 메시지에 따라 수정.

자주 발생하는 오류:

- `0002-audio.ts` AUDIO_CONFIG 키 누락: `pnpm sync 0002` 재실행
- `TYPE_SCENE_DATA` 인덱스 오류: `sceneKey` 타입 확인

---

### Task 13: Remotion Studio 시각 확인

- [ ] **Step 1: Studio 실행**

```bash
pnpm dev
```

- [ ] **Step 2: 각 씬 확인 체크리스트**

| 씬           | 확인 항목                                                        |
| ------------ | ---------------------------------------------------------------- |
| thumbnail    | "Java 자료형" 텍스트 + teal 글로우                               |
| intro        | 4개 colored 상자 stagger 등장 (파/노/초/주황)                    |
| intScene     | 파란 상자 spring 등장 → `int age = 25;` 타이핑 → `25` 낙하       |
| doubleScene  | 노란 상자 → `double height = 175.5;` 타이핑 → `175.5` 낙하       |
| stringScene  | 초록 상자 → `String name = "Java";` 타이핑 → `"Java"` 낙하       |
| booleanScene | 주황 상자 → `boolean isStudent = true;` 타이핑 → true↔false 토글 |
| summaryScene | 4줄 코드 순차 타이핑, 타입 키워드 색상 구분                      |

- [ ] **Step 3: 최종 커밋**

```bash
git add src/compositions/0002-JavaDataTypes.tsx
git commit -m "feat: 0002 Java 자료형 영상 완성"
```
