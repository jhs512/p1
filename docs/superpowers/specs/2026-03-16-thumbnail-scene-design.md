# Thumbnail Scene Design

**Date:** 2026-03-16
**File:** `src/compositions/0001-JavaVariables.tsx`

## Goal

Add a static 1-second thumbnail frame at the very start of the JavaVariables composition for YouTube auto-thumbnail capture.

## Requirements

- Static (no animation, no audio, no subtitles)
- Duration: 30 frames (1 second at 30fps)
- Style: minimal text-only (option C)
- Placed at `from={0}`, pushing all existing scenes back by 30 frames

## Visual Design

```
background: #1e1e1e

[center of screen]
"JAVA"                  — small, teal (#4ec9b0), wide letter-spacing, Noto Sans KR
"Java 변수"             — large (~120px), bold, "Java" white + "변수" teal
────────────────        — thin teal horizontal rule (width ~200px)
"선언 · 초기화 · 출력"  — small, muted (#888), Noto Sans KR
```

## Implementation

### 1. VIDEO_CONFIG — add `thumbnail` as first key

```ts
export const VIDEO_CONFIG = {
  thumbnail: {
    durationInFrames: 30,  // 1초. f() 미사용 — tail padding 불필요
  },
  declaration: { ... },
  // ...
};
```

Note: `f` is also used as a local variable name in `fromValues` computation (`const f = _from`). No conflict since `thumbnail` doesn't call the `f()` helper.

### 2. Destructuring update

Add `thumbnail` to the existing destructuring:

```ts
const { thumbnail, declaration, initialization, print } = VIDEO_CONFIG;
```

### 3. ThumbnailScene component

Inline component inside `0001-JavaVariables.tsx` (consistent with the file's single-file philosophy). Pure static JSX inside `AbsoluteFill`, no hooks, no audio.

```tsx
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#1e1e1e",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
    }}
  >
    {/* JAVA label */}
    {/* "Java 변수" large title */}
    {/* teal rule */}
    {/* subtitle */}
  </AbsoluteFill>
);
```

### 4. sceneList update

```ts
const sceneList = [thumbnail, declaration, initialization, print];
```

`fromValues` is computed as a cumulative sum of `durationInFrames` — adding `thumbnail` first automatically shifts `declaration` → `fromValues[1]`, `initialization` → `fromValues[2]`, `print` → `fromValues[3]`.

`Root.tsx` derives `totalFrames` dynamically from `VIDEO_CONFIG` values, so no change needed there.

### 5. JavaVariables composition update

```tsx
export const JavaVariables: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={declaration.durationInFrames}
    >
      <DeclarationScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={initialization.durationInFrames}
    >
      <InitScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={print.durationInFrames}>
      <PrintScene />
    </Sequence>
  </AbsoluteFill>
);
```

## Out of Scope

- No intro/outro audio
- No animation
- No per-composition config (thumbnail content is hardcoded for this video)
