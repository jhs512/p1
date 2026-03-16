# Java Variables Video Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remotion으로 Java 변수(선언·초기화·출력)를 설명하는 30초 교육용 애니메이션 영상을 제작한다.

**Architecture:** `npx create-video@latest`로 Remotion 프로젝트를 부트스트랩한 뒤, 공유 훅(`useTypingEffect`)과 공유 컴포넌트(`CodeBox`, `ConsoleOutput`, `SceneTitle`, `Caption`)를 만들고, 씬 5개를 각각 구현한다. 마지막으로 `JavaVariables` Composition에서 `<Sequence>`로 모든 씬을 조립한다.

**Tech Stack:** Remotion ≥4.0.180, TypeScript, React, `@remotion/google-fonts`, vitest

---

## File Map

| 파일 | 역할 |
|---|---|
| `src/Root.tsx` | Composition 등록 |
| `src/compositions/JavaVariables.tsx` | 씬 오케스트레이션 |
| `src/hooks/useTypingEffect.ts` | 프레임 기반 타이핑 훅 |
| `src/components/CodeBox.tsx` | 코드 표시 + 타이핑 |
| `src/components/ConsoleOutput.tsx` | 콘솔 출력 박스 |
| `src/components/SceneTitle.tsx` | 씬 상단 제목 |
| `src/components/Caption.tsx` | 씬 하단 설명 |
| `src/scenes/Intro.tsx` | 인트로 씬 |
| `src/scenes/DeclarationScene.tsx` | 씬 1 — 변수 선언 |
| `src/scenes/InitScene.tsx` | 씬 2 — 변수 초기화 |
| `src/scenes/PrintScene.tsx` | 씬 3 — 변수 출력 |
| `src/scenes/Outro.tsx` | 아웃트로 씬 |
| `src/hooks/useTypingEffect.test.ts` | 훅 유닛 테스트 |

---

## Chunk 1: 프로젝트 부트스트랩 + 폰트 설정

### Task 1: Remotion 프로젝트 생성

**Files:**
- Create: `src/` (전체 프로젝트 디렉토리)

- [ ] **Step 1: 프로젝트 생성**

```bash
cd /Users/jangka512/Custom/remotions/p1
npx create-video@latest .
```

예상 프롬프트 순서:
1. "The directory is not empty. Continue?" → `y`
2. 템플릿 선택 → `TypeScript` 선택
3. 나머지 기본값 유지 (Enter)

- [ ] **Step 2: 생성된 파일 확인**

```bash
ls src/
```

Expected: `Root.tsx`, `index.ts` (또는 유사한 진입점) 등이 보여야 함.

- [ ] **Step 3: 개발 서버 실행 확인**

```bash
npx remotion studio
```

브라우저에서 Remotion Studio가 열리면 성공. `Ctrl+C`로 종료.

- [ ] **Step 4: vitest 설치**

```bash
npm install -D vitest
```

- [ ] **Step 5: 커밋**

```bash
git init
git add .
git commit -m "chore: bootstrap Remotion project"
```

---

### Task 2: 폰트 패키지 설치 및 설정

**Files:**
- Modify: `src/Root.tsx`
- Create: `src/fonts.ts`

- [ ] **Step 1: 패키지 설치**

```bash
npm install @remotion/google-fonts
```

- [ ] **Step 2: `src/fonts.ts` 생성**

`delayRender`/`continueRender`로 폰트 로딩 완료 후에만 프레임이 렌더되도록 보장한다.

```ts
import { continueRender, delayRender } from "remotion";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";

const jetBrains = loadJetBrains();
const notoSans = loadNotoSans();

export const monoFont = jetBrains.fontFamily;
export const uiFont = notoSans.fontFamily;

const handle = delayRender("Loading Google Fonts");
Promise.all([
  jetBrains.waitUntilDone(),
  notoSans.waitUntilDone(),
]).then(() => continueRender(handle));
```

- [ ] **Step 3: `src/Root.tsx` 수정 — fonts import 추가**

`Root.tsx` 상단에 다음 줄 추가 (모듈 임포트 시 font loading + delayRender 실행):
```ts
import "./fonts";
```

- [ ] **Step 4: Studio에서 폰트 로딩 오류 없음 확인**

```bash
npx remotion studio
```

콘솔에 폰트 관련 에러가 없으면 성공. `Ctrl+C`로 종료.
(단일 프레임 렌더 확인은 Chunk 3에서 Composition 등록 후 수행한다.)

- [ ] **Step 5: 커밋**

```bash
git add src/fonts.ts src/Root.tsx package.json package-lock.json
git commit -m "chore: add JetBrains Mono and Noto Sans KR fonts with delayRender guard"
```

---

## Chunk 2: 공유 훅 + 공유 컴포넌트

### Task 3: `useTypingEffect` 훅 + 유닛 테스트

**Files:**
- Create: `src/hooks/useTypingEffect.ts`
- Create: `src/hooks/useTypingEffect.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

`src/hooks/useTypingEffect.test.ts`:
```ts
import { describe, it, expect } from "vitest";

// 훅 내부 로직을 순수 함수로 분리해 테스트
function computeVisibleText(
  text: string,
  frame: number,
  startFrame: number,
  fps: number,
  charsPerSecond: number
): { visibleText: string; isDone: boolean } {
  const charsVisible = Math.floor(
    Math.max(0, frame - startFrame) / fps * charsPerSecond
  );
  return {
    visibleText: text.slice(0, charsVisible),
    isDone: charsVisible >= text.length,
  };
}

describe("computeVisibleText", () => {
  it("타이핑 시작 전(startFrame 이전)에는 빈 문자열 반환", () => {
    const { visibleText, isDone } = computeVisibleText("int age;", 10, 20, 30, 10);
    expect(visibleText).toBe("");
    expect(isDone).toBe(false);
  });

  it("startFrame 시점에는 빈 문자열 반환", () => {
    const { visibleText } = computeVisibleText("int age;", 20, 20, 30, 10);
    expect(visibleText).toBe("");
  });

  it("1초 후(fps=30, startFrame=20 → frame=50)에 10자 표시", () => {
    const { visibleText } = computeVisibleText("0123456789AB", 50, 20, 30, 10);
    expect(visibleText).toBe("0123456789");
  });

  it("모든 글자가 나오면 isDone=true", () => {
    const { visibleText, isDone } = computeVisibleText("hi", 200, 0, 30, 10);
    expect(visibleText).toBe("hi");
    expect(isDone).toBe(true);
  });

  it("텍스트 길이를 초과해도 잘리지 않음", () => {
    const { visibleText } = computeVisibleText("ab", 9999, 0, 30, 10);
    expect(visibleText).toBe("ab");
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run src/hooks/useTypingEffect.test.ts
```

Expected: `computeVisibleText is not defined` 또는 유사한 오류.

- [ ] **Step 3: 훅 구현**

`src/hooks/useTypingEffect.ts`:
```ts
import { useCurrentFrame, useVideoConfig } from "remotion";

export function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = 10
): { visibleText: string; isDone: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsVisible = Math.floor(
    Math.max(0, frame - startFrame) / fps * charsPerSecond
  );
  return {
    visibleText: text.slice(0, charsVisible),
    isDone: charsVisible >= text.length,
  };
}
```

> **Note:** 테스트 파일의 `computeVisibleText`는 훅 내부 로직의 순수 함수 복사본임. 훅은 Remotion 컨텍스트가 필요하므로 분리해서 테스트함. 훅 구현을 변경할 경우 테스트 파일의 `computeVisibleText`도 동일하게 수정해야 함.

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx vitest run src/hooks/useTypingEffect.test.ts
```

Expected: 5개 테스트 모두 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/hooks/
git commit -m "feat: add useTypingEffect hook with unit tests"
```

---

### Task 4: `SceneTitle` + `Caption` 컴포넌트

**Files:**
- Create: `src/components/SceneTitle.tsx`
- Create: `src/components/Caption.tsx`

- [ ] **Step 1: `SceneTitle.tsx` 작성**

```tsx
import React from "react";
import { uiFont } from "../fonts";

interface SceneTitleProps {
  title: string;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({ title }) => (
  <div
    style={{
      position: "absolute",
      top: 40,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: uiFont,
      fontSize: 28,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: 1,
    }}
  >
    {title}
  </div>
);
```

- [ ] **Step 2: `Caption.tsx` 작성**

```tsx
import { interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";

interface CaptionProps {
  text: string;
  fadeInStartFrame: number;
}

export const Caption: React.FC<CaptionProps> = ({ text, fadeInStartFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInStartFrame, fadeInStartFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: uiFont,
        fontSize: 22,
        color: "#cccccc",
        opacity,
      }}
    >
      {text}
    </div>
  );
};
```

- [ ] **Step 3: Studio에서 시각 확인**

`Root.tsx`에 임시로 테스트용 Composition 추가하거나 기존 Composition에 `<SceneTitle>`을 렌더해서 폰트/레이아웃 확인. 확인 후 임시 코드 제거.

- [ ] **Step 4: 커밋**

```bash
git add src/components/SceneTitle.tsx src/components/Caption.tsx
git commit -m "feat: add SceneTitle and Caption components"
```

---

### Task 5: `CodeBox` 컴포넌트

**Files:**
- Create: `src/components/CodeBox.tsx`

`CodeBox`는 `lines` 배열을 받아 `isNew: true`인 줄만 타이핑 애니메이션, `isNew: false`인 줄은 dimmed로 표시한다.

- [ ] **Step 1: `CodeBox.tsx` 작성**

```tsx
import React from "react";
import { monoFont } from "../fonts";
import { useTypingEffect } from "../hooks/useTypingEffect";

export interface CodeLine {
  text: string;
  isNew: boolean;
}

interface CodeBoxProps {
  lines: CodeLine[];
  startFrame: number;
  charsPerSecond?: number;
}

// isNew: false 줄 — 완성된 상태, dimmed
const StaticLine: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ opacity: 0.5, color: "#d4d4d4", lineHeight: "1.8" }}>
    {text}
  </div>
);

// isNew: true 줄 — 타이핑 애니메이션 + 토큰 컬러링
const TypingLine: React.FC<{ text: string; startFrame: number; charsPerSecond: number }> = ({
  text,
  startFrame,
  charsPerSecond,
}) => {
  const { visibleText } = useTypingEffect(text, startFrame, charsPerSecond);
  return (
    <div style={{ color: "#d4d4d4", lineHeight: "1.8" }}>
      <ColorizedCode text={visibleText} />
    </div>
  );
};

// 간단한 Java 토큰 컬러링 (int, String, boolean → #4ec9b0 / 숫자 → #b5cea8 / 변수 → #9cdcfe)
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\bint\b|\bString\b|\bboolean\b|\b\d+\b)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^(int|String|boolean)$/.test(part)) {
          return <span key={i} style={{ color: "#4ec9b0" }}>{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} style={{ color: "#b5cea8" }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const CodeBox: React.FC<CodeBoxProps> = ({
  lines,
  startFrame,
  charsPerSecond = 10,
}) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#2d2d2d",
      borderRadius: 12,
      padding: "32px 48px",
      minWidth: 600,
      fontFamily: monoFont,
      fontSize: 26,
    }}
  >
    {lines.map((line, i) =>
      line.isNew ? (
        <TypingLine key={i} text={line.text} startFrame={startFrame} charsPerSecond={charsPerSecond} />
      ) : (
        <StaticLine key={i} text={line.text} />
      )
    )}
  </div>
);
```

- [ ] **Step 2: Studio에서 시각 확인**

임시 Composition에 `<CodeBox lines={[{text:"int age;", isNew:true}]} startFrame={0} />` 추가해 타이핑 애니메이션과 토큰 색상 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/components/CodeBox.tsx
git commit -m "feat: add CodeBox component with typing animation and token coloring"
```

---

### Task 6: `ConsoleOutput` 컴포넌트

**Files:**
- Create: `src/components/ConsoleOutput.tsx`

- [ ] **Step 1: `ConsoleOutput.tsx` 작성**

```tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { monoFont } from "../fonts";

interface ConsoleOutputProps {
  text: string;
  startFrame: number;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(50% + 120px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0a0a0a",
        borderRadius: 8,
        padding: "12px 32px",
        fontFamily: monoFont,
        fontSize: 22,
        color: "#89d185",
        opacity,
        minWidth: 300,
        textAlign: "left",
      }}
    >
      {text}
    </div>
  );
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/ConsoleOutput.tsx
git commit -m "feat: add ConsoleOutput component"
```

---

## Chunk 3: 씬 구현 + Composition 조립

### Task 7: `Intro` 씬

**Files:**
- Create: `src/scenes/Intro.tsx`

- [ ] **Step 1: `Intro.tsx` 작성**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 24 }}>
      <div style={{ fontFamily: uiFont, fontSize: 52, fontWeight: 700, color: "#ffffff", opacity: titleOpacity }}>
        Java 변수란?
      </div>
      <div style={{ fontFamily: uiFont, fontSize: 26, color: "#aaaaaa", opacity: subtitleOpacity }}>
        변수는 값을 담는 그릇입니다
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/scenes/Intro.tsx
git commit -m "feat: add Intro scene"
```

---

### Task 8: `DeclarationScene` (씬 1)

**Files:**
- Create: `src/scenes/DeclarationScene.tsx`

- [ ] **Step 1: `DeclarationScene.tsx` 작성**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "int age;" = 8자 → 8/10*30 = 24프레임 후 완료 → frame 44
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(8 / CHARS_PER_SEC * 30);

export const DeclarationScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
      <SceneTitle title="1. 변수 선언 (Declaration)" />
      <CodeBox
        lines={[{ text: "int age;", isNew: true }]}
        startFrame={TYPING_START}
      />
      <Caption
        text="변수를 사용하기 전에 반드시 선언해야 합니다"
        fadeInStartFrame={TYPING_DONE_FRAME}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/scenes/DeclarationScene.tsx
git commit -m "feat: add DeclarationScene (scene 1)"
```

---

### Task 9: `InitScene` (씬 2)

**Files:**
- Create: `src/scenes/InitScene.tsx`

- [ ] **Step 1: `InitScene.tsx` 작성**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "age = 25;" = 9자 → Math.ceil(9/10*30) = 27프레임 후 완료
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(9 / CHARS_PER_SEC * 30);

export const InitScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
      <SceneTitle title="2. 변수 초기화 (Initialization)" />
      <CodeBox
        lines={[
          { text: "int age;", isNew: false },
          { text: "age = 25;", isNew: true },
        ]}
        startFrame={TYPING_START}
      />
      <Caption
        text="변수에 처음으로 값을 넣는 것을 초기화라고 합니다"
        fadeInStartFrame={TYPING_DONE_FRAME}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/scenes/InitScene.tsx
git commit -m "feat: add InitScene (scene 2)"
```

---

### Task 10: `PrintScene` (씬 3)

**Files:**
- Create: `src/scenes/PrintScene.tsx`

- [ ] **Step 1: `PrintScene.tsx` 작성**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { ConsoleOutput } from "../components/ConsoleOutput";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "System.out.println(age);" = 26자 → Math.ceil(26/10*30) = 78프레임 후 완료
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(26 / CHARS_PER_SEC * 30);

export const PrintScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
      <SceneTitle title="3. 변수 출력 (Print)" />
      <CodeBox
        lines={[
          { text: "int age;", isNew: false },
          { text: "age = 25;", isNew: false },
          { text: "System.out.println(age);", isNew: true },
        ]}
        startFrame={TYPING_START}
      />
      <ConsoleOutput text="> 25" startFrame={TYPING_DONE_FRAME} />
      <Caption
        text="println()으로 변수의 값을 출력할 수 있습니다"
        fadeInStartFrame={TYPING_DONE_FRAME}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/scenes/PrintScene.tsx
git commit -m "feat: add PrintScene (scene 3)"
```

---

### Task 11: `Outro` 씬

**Files:**
- Create: `src/scenes/Outro.tsx`

- [ ] **Step 1: `Outro.tsx` 작성**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const screenFade = interpolate(frame, [90, 119], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#1e1e1e",
        justifyContent: "center",
        alignItems: "center",
        opacity: screenFade,
      }}
    >
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 30,
          color: "#ffffff",
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        다음 시간: 자료형 (int, String, boolean)
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/scenes/Outro.tsx
git commit -m "feat: add Outro scene"
```

---

### Task 12: `JavaVariables` Composition + `Root.tsx` 완성

**Files:**
- Create: `src/compositions/JavaVariables.tsx`
- Modify: `src/Root.tsx`

- [ ] **Step 1: `JavaVariables.tsx` 작성**

```tsx
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Intro } from "../scenes/Intro";
import { DeclarationScene } from "../scenes/DeclarationScene";
import { InitScene } from "../scenes/InitScene";
import { PrintScene } from "../scenes/PrintScene";
import { Outro } from "../scenes/Outro";

export const JavaVariables: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={0} durationInFrames={60}>
      <Intro />
    </Sequence>
    <Sequence from={60} durationInFrames={240}>
      <DeclarationScene />
    </Sequence>
    <Sequence from={300} durationInFrames={240}>
      <InitScene />
    </Sequence>
    <Sequence from={540} durationInFrames={240}>
      <PrintScene />
    </Sequence>
    <Sequence from={780} durationInFrames={120}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
```

- [ ] **Step 2: `Root.tsx` 수정**

기존 `Root.tsx`의 Composition 등록 부분을 다음으로 교체:

```tsx
import "./fonts";
import { Composition } from "remotion";
import { JavaVariables } from "./compositions/JavaVariables";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="JavaVariables"
      component={JavaVariables}
      durationInFrames={900}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{}}
    />
  </>
);
```

- [ ] **Step 3: Studio에서 전체 영상 확인**

```bash
npx remotion studio
```

- [ ] 30초 영상 전체 재생 확인
- [ ] 각 씬 전환이 부드럽게 작동하는지 확인
- [ ] 타이핑 애니메이션 속도 확인
- [ ] 폰트 렌더링 확인 (특히 한국어)

- [ ] **Step 4: 최종 커밋**

```bash
git add src/compositions/ src/Root.tsx
git commit -m "feat: assemble JavaVariables composition in Root"
```

---

### Task 13: 영상 렌더링 (선택)

- [ ] **Step 1: 렌더링 실행**

```bash
npx remotion render JavaVariables out/java-variables.mp4
```

Expected: `out/java-variables.mp4` 파일 생성, 약 30초 분량.

- [ ] **Step 2: 파일 확인**

```bash
ls -lh out/
```

Expected: mp4 파일이 존재하고 적당한 크기(수 MB 이상).
