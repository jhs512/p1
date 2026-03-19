# Thumbnail Scene Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static 1-second thumbnail frame at frame 0 of the JavaVariables composition for YouTube auto-thumbnail.

**Architecture:** Single file modification (`0001-JavaVariables.tsx`). Add `thumbnail` entry to `VIDEO_CONFIG`, a `ThumbnailScene` component (static JSX), update `sceneList` and the `JavaVariables` composition's `Sequence` list.

**Tech Stack:** Remotion 4.x, React 19, TypeScript

---

## Chunk 1: Implement ThumbnailScene

### Task 1: Add thumbnail to VIDEO_CONFIG and destructuring

**Files:**
- Modify: `src/compositions/0001-JavaVariables.tsx`

- [ ] **Step 1: Add `thumbnail` as first key in VIDEO_CONFIG**

In `src/compositions/0001-JavaVariables.tsx`, find `export const VIDEO_CONFIG = {` and add at the very top:

```ts
export const VIDEO_CONFIG = {
  thumbnail: {
    durationInFrames: 30,
  },
  declaration: {
    // ...existing
  },
  // ...
};
```

- [ ] **Step 2: Update destructuring**

Find:
```ts
const { declaration, initialization, print } = VIDEO_CONFIG;
```
Replace with:
```ts
const { thumbnail, declaration, initialization, print } = VIDEO_CONFIG;
```

- [ ] **Step 3: Add ThumbnailScene component**

Add the following component just before `const DeclarationScene`:

```tsx
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#1e1e1e",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 20,
    }}
  >
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 28,
        fontWeight: 700,
        color: "#4ec9b0",
        letterSpacing: 8,
      }}
    >
      JAVA
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 120,
        fontWeight: 900,
        lineHeight: 1.1,
        textAlign: "center",
      }}
    >
      <span style={{ color: "#ffffff" }}>Java </span>
      <span style={{ color: "#4ec9b0" }}>변수</span>
    </div>
    <div
      style={{
        width: 200,
        height: 3,
        background: "#4ec9b0",
        borderRadius: 2,
      }}
    />
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 32,
        color: "#888888",
        letterSpacing: 2,
      }}
    >
      선언 · 초기화 · 출력
    </div>
  </AbsoluteFill>
);
```

- [ ] **Step 4: Update sceneList**

Find:
```ts
const sceneList = [declaration, initialization, print];
```
Replace with:
```ts
const sceneList = [thumbnail, declaration, initialization, print];
```

- [ ] **Step 5: Update JavaVariables composition**

Find the `JavaVariables` component and update to:

```tsx
export const JavaVariables: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={fromValues[0]} durationInFrames={thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={declaration.durationInFrames}>
      <DeclarationScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={initialization.durationInFrames}>
      <InitScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={print.durationInFrames}>
      <PrintScene />
    </Sequence>
  </AbsoluteFill>
);
```

- [ ] **Step 6: Verify in Remotion Studio**

Open http://localhost:3000/0001 — frame 0 should show the thumbnail scene. Total duration should have increased by 30 frames.

- [ ] **Step 7: Commit**

```bash
git add src/compositions/0001-JavaVariables.tsx
git commit -m "feat: add static thumbnail scene at frame 0 for YouTube auto-thumbnail"
```
