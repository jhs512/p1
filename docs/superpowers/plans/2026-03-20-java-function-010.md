# Java 10강 — 함수 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 10강 "함수 — 반복 코드를 줄이는 방법" Remotion 영상 컴포지션 구현

**Architecture:** 기존 에피소드 패턴(content.ts → sync → audio.gen.ts → tsx) 그대로 따름. 씬 6개(thumbnail/pain/concept/declare/call/summary). 고통→해결 구조로 함수의 필요성을 직관적으로 전달.

**Tech Stack:** Remotion 4.x, React, TypeScript, edge-tts(sync), ffprobe

---

## 파일 구조

| 파일 | 역할 | 생성 방법 |
|------|------|-----------|
| `src/compositions/001-Java-Basic/KOR/010-2-content.ts` | 나레이션 텍스트 + 코드 상수 | 수동 작성 |
| `src/compositions/001-Java-Basic/KOR/010-1-JavaFunction.tsx` | 씬 컴포넌트 + VIDEO_CONFIG + Component | 수동 작성 |
| `src/compositions/001-Java-Basic/KOR/010-3-audio.gen.ts` | durationInFrames, speechStartFrame 등 | `pnpm sync`로 자동 생성 |
| `public/fn-pain.mp3` 외 4개 | TTS 오디오 | `pnpm sync`로 자동 생성 |

---

## 씬 요약

| 씬 키 | mp3 파일 | 나레이션 문장 수 |
|-------|----------|-----------------|
| `painScene` | `fn-pain.mp3` | 2 |
| `conceptScene` | `fn-concept.mp3` | 2 |
| `declarationScene` | `fn-declare.mp3` | 2 |
| `callScene` | `fn-call.mp3` | 2 |
| `summaryScene` | `fn-summary.mp3` | 2 |

---

## Task 1: content.ts 작성

**Files:**
- Create: `src/compositions/001-Java-Basic/KOR/010-2-content.ts`

- [ ] **Step 1: 파일 생성**

```typescript
// src/compositions/001-Java-Basic/KOR/010-2-content.ts
export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n함수",
    badge: "함수",
  },
  painScene: {
    narration: [
      "인사 코드를 이름마다 따로 작성하고 있습니다.",
      "이름만 다를 뿐, 내용은 모두 같습니다.",
    ],
  },
  conceptScene: {
    narration: [
      "이럴 때 사용하는 것이 함수입니다.",
      "함수는 코드 묶음에 이름을 붙인 것입니다.",
    ],
  },
  declarationScene: {
    narration: [
      "함수는 이렇게 선언합니다.",
      "지금은 함수 이름과 전달받는 값에만 집중하세요.",
    ],
  },
  callScene: {
    narration: [
      "함수를 사용하려면 이름으로 호출합니다.",
      "같은 함수를 이름 하나로 여러 번 호출할 수 있습니다.",
    ],
  },
  summaryScene: {
    narration: [
      "함수는 반복되는 코드를 이름으로 묶는 방법입니다.",
      "선언은 한 번, 호출은 여러 번 할 수 있습니다.",
    ],
    cards: ["선언은 한 번", "호출은 여러 번"],
  },
} as const;
```

- [ ] **Step 2: TypeScript 오류 없는지 확인**

```bash
cd /Users/jangka512/Custom/remotions/p1
npx tsc --noEmit 2>&1 | grep "010-2"
```

Expected: 출력 없음 (오류 없음)

---

## Task 2: tsx 스켈레톤 작성 (sync 가능한 최소 구조)

**Files:**
- Create: `src/compositions/001-Java-Basic/KOR/010-1-JavaFunction.tsx`

sync를 실행하려면 VIDEO_CONFIG에 각 씬의 `audio` 필드가 있어야 한다.
audio.gen.ts가 없으므로 먼저 stub을 만들어야 한다.

- [ ] **Step 1: audio.gen.ts 스텁 생성**

```typescript
// src/compositions/001-Java-Basic/KOR/010-3-audio.gen.ts
// AUTO-GENERATED — pnpm sync 001-Java-Basic/010 으로 덮어씌워진다
export const AUDIO_CONFIG = {
  painScene:        { durationInFrames: 150, narrationSplits: [75] as readonly number[], sentenceEndFrames: [70] as readonly number[], speechStartFrame: 2, speechEndFrame: 140, wordStartFrames: [] as readonly (readonly number[])[], wordEndFrames: [] as readonly (readonly number[])[], wordStartMs: [] as readonly (readonly number[])[], wordTiming: {} as Record<string, readonly number[]> },
  conceptScene:     { durationInFrames: 150, narrationSplits: [75] as readonly number[], sentenceEndFrames: [70] as readonly number[], speechStartFrame: 2, speechEndFrame: 140, wordStartFrames: [] as readonly (readonly number[])[], wordEndFrames: [] as readonly (readonly number[])[], wordStartMs: [] as readonly (readonly number[])[], wordTiming: {} as Record<string, readonly number[]> },
  declarationScene: { durationInFrames: 150, narrationSplits: [75] as readonly number[], sentenceEndFrames: [70] as readonly number[], speechStartFrame: 2, speechEndFrame: 140, wordStartFrames: [] as readonly (readonly number[])[], wordEndFrames: [] as readonly (readonly number[])[], wordStartMs: [] as readonly (readonly number[])[], wordTiming: {} as Record<string, readonly number[]> },
  callScene:        { durationInFrames: 150, narrationSplits: [75] as readonly number[], sentenceEndFrames: [70] as readonly number[], speechStartFrame: 2, speechEndFrame: 140, wordStartFrames: [] as readonly (readonly number[])[], wordEndFrames: [] as readonly (readonly number[])[], wordStartMs: [] as readonly (readonly number[])[], wordTiming: {} as Record<string, readonly number[]> },
  summaryScene:     { durationInFrames: 150, narrationSplits: [75] as readonly number[], sentenceEndFrames: [70] as readonly number[], speechStartFrame: 2, speechEndFrame: 140, wordStartFrames: [] as readonly (readonly number[])[], wordEndFrames: [] as readonly (readonly number[])[], wordStartMs: [] as readonly (readonly number[])[], wordTiming: {} as Record<string, readonly number[]> },
} as const;
```

- [ ] **Step 2: tsx 스켈레톤 생성**

```typescript
// src/compositions/001-Java-Basic/KOR/010-1-JavaFunction.tsx
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media"; // ← remotion이 아니라 @remotion/media
import React from "react";
import { FPS } from "../../../config";
import { toDisplayText } from "../../../utils/narration";
import {
  CHARS_PER_SEC,
  CROSS,
  ContentArea,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { AUDIO_CONFIG } from "./010-3-audio.gen";
import { CONTENT } from "./010-2-content";
import { HEIGHT, WIDTH } from "./config";

// ── 색상 상수 ─────────────────────────────────────────────────
const C_FUNC    = "#dcdcaa"; // 함수 이름 (노란색)
const C_KEYWORD = "#569cd6"; // void 키워드 (파란색)
const C_TYPE    = "#4ec9b0"; // String 타입 (청록색)
const C_PARAM   = "#9cdcfe"; // 매개변수 name (연파랑)
const C_STRING  = "#ce9178"; // 문자열 리터럴 (주황색)
const C_PAIN    = "#f47c7c"; // 고통 씬 강조 (빨간색)
const BG        = "#1e1e1e"; // VS Code 다크 배경

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  painScene: {
    audio: "fn-pain.mp3",
    durationInFrames: AUDIO_CONFIG.painScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.painScene.speechStartFrame,
    narration: CONTENT.painScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.painScene.narrationSplits,
  },
  conceptScene: {
    audio: "fn-concept.mp3",
    durationInFrames: AUDIO_CONFIG.conceptScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.conceptScene.speechStartFrame,
    narration: CONTENT.conceptScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.conceptScene.narrationSplits,
  },
  declarationScene: {
    audio: "fn-declare.mp3",
    durationInFrames: AUDIO_CONFIG.declarationScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.declarationScene.speechStartFrame,
    narration: CONTENT.declarationScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.declarationScene.narrationSplits,
  },
  callScene: {
    audio: "fn-call.mp3",
    durationInFrames: AUDIO_CONFIG.callScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.callScene.speechStartFrame,
    narration: CONTENT.callScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.callScene.narrationSplits,
  },
  summaryScene: {
    audio: "fn-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
} as const;

// ── 훅: 타이핑 이펙트 ─────────────────────────────────────────
function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = CHARS_PER_SEC,
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

// ── 컴포넌트: CodeLine ─────────────────────────────────────────
// 자바 코드 한 줄을 구문 색상으로 렌더링
const CodeLine: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(
    /(void|String|return|if|else|"[^"]*"|\b\d+(?:\.\d+)?\b)/g,
  );
  return (
    <>
      {parts.map((part, i) => {
        if (part === "void" || part === "return" || part === "if" || part === "else")
          return <span key={i} style={{ color: C_KEYWORD }}>{part}</span>;
        if (part === "String")
          return <span key={i} style={{ color: C_TYPE }}>{part}</span>;
        if (/^"/.test(part))
          return <span key={i} style={{ color: C_STRING }}>{part}</span>;
        if (/^\d/.test(part))
          return <span key={i} style={{ color: "#b5cea8" }}>{part}</span>;
        // 함수 이름 greet 강조
        if (part.includes("greet"))
          return (
            <span key={i}>
              {part.split("greet").map((seg, j, arr) => (
                <React.Fragment key={j}>
                  {seg}
                  {j < arr.length - 1 && (
                    <span style={{ color: C_FUNC }}>greet</span>
                  )}
                </React.Fragment>
              ))}
            </span>
          );
        // 매개변수 name 강조
        if (part.includes("name"))
          return (
            <span key={i}>
              {part.split("name").map((seg, j, arr) => (
                <React.Fragment key={j}>
                  {seg}
                  {j < arr.length - 1 && (
                    <span style={{ color: C_PARAM }}>name</span>
                  )}
                </React.Fragment>
              ))}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// ── 컴포넌트: TypingCodeLine ───────────────────────────────────
const TypingCodeLine: React.FC<{
  text: string;
  startFrame: number;
  cps?: number;
}> = ({ text, startFrame, cps = CHARS_PER_SEC }) => {
  const { visibleText } = useTypingEffect(text, startFrame, cps);
  return (
    <div style={{ lineHeight: "1.9", color: "#d4d4d4" }}>
      <CodeLine text={visibleText} />
    </div>
  );
};

// ── 씬: ThumbnailScene ────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#050510",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
    }}
  >
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 28,
        letterSpacing: 12,
        color: C_TYPE,
        textTransform: "uppercase",
        opacity: 0.8,
      }}
    >
      JAVA
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 96,
        fontWeight: 900,
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 1.15,
      }}
    >
      Java{"\n"}함수
    </div>
    <div
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 36,
        color: C_FUNC,
        background: `${C_FUNC}18`,
        border: `2px solid ${C_FUNC}55`,
        borderRadius: 12,
        padding: "8px 28px",
        marginTop: 8,
      }}
    >
      greet()
    </div>
  </AbsoluteFill>
);

// ── 씬: PainScene ─────────────────────────────────────────────
const PAIN_LINES = [
  'System.out.println("안녕하세요, 민준님!");',
  'System.out.println("안녕하세요, 지아님!");',
  'System.out.println("안녕하세요, 서준님!");',
];
const PAIN_CPS = 30; // 고통 씬은 빠르게 타이핑

const PainScene: React.FC = () => {
  const { painScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const { fps } = useVideoConfig();

  // 각 줄의 타이핑 시작 프레임: 발화 시작 ~ 첫 문장 끝까지 균등 분배
  const lineStarts = PAIN_LINES.map((_, i) => {
    const lineDuration = (split - s) / PAIN_LINES.length;
    return Math.round(s + i * lineDuration);
  });

  // 두 번째 문장(split)부터 중복 강조 (이름 부분 빨간색 테두리 박스)
  const highlightAppear = spring({
    frame: useCurrentFrame() - split,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 20,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#2d2d2d",
              borderRadius: 12,
              padding: "40px 56px",
              minWidth: 820,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 32,
            }}
          >
            {PAIN_LINES.map((line, i) => (
              <div key={i} style={{ position: "relative" }}>
                <TypingCodeLine
                  text={line}
                  startFrame={lineStarts[i]}
                  cps={PAIN_CPS}
                />
                {/* 두 번째 문장부터: 이름 부분 빨간 밑줄 강조 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: C_PAIN,
                    opacity: highlightAppear,
                    borderRadius: 2,
                  }}
                />
              </div>
            ))}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.painScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: ConceptScene ──────────────────────────────────────────
const ConceptScene: React.FC = () => {
  const { conceptScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const descAppear = spring({
    frame: frame - split,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 48,
              textAlign: "center",
            }}
          >
            {/* 함수 키워드 큰 글씨 */}
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 96,
                fontWeight: 900,
                color: C_FUNC,
                opacity: titleAppear,
                transform: `scale(${interpolate(titleAppear, [0, 1], [0.7, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              함수
            </div>
            {/* 설명 텍스트 */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 40,
                color: "#d4d4d4",
                opacity: descAppear,
                lineHeight: 1.6,
              }}
            >
              코드 묶음에{" "}
              <span style={{ color: C_FUNC, fontWeight: 700 }}>이름</span>을 붙인 것
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.conceptScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: DeclarationScene ──────────────────────────────────────
const DECLARE_LINES = [
  "void greet(String name) {",
  '    System.out.println("안녕하세요, " + name + "님!");',
  "}",
];
const DECLARE_CPS = 18;

const DeclarationScene: React.FC = () => {
  const { declarationScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const { fps } = useVideoConfig();

  // 각 줄 시작 프레임: speechStartFrame ~ narrationSplits[0] 구간에 균등 분배
  // (CLAUDE.md 규칙 #7: d * 0.6 같은 duration 비례 오프셋 금지)
  const split = cfg.narrationSplits[0];
  const typingWindow = split - s; // 발화 시작 ~ 두 번째 문장 사이 구간
  const totalChars = DECLARE_LINES.reduce((sum, l) => sum + l.length, 0);
  let cumChars = 0;
  const lineStarts = DECLARE_LINES.map((line) => {
    const start = s + Math.floor((cumChars / totalChars) * typingWindow);
    cumChars += line.length;
    return start;
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#2d2d2d",
              borderRadius: 12,
              padding: "40px 56px",
              minWidth: 820,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 32,
            }}
          >
            {DECLARE_LINES.map((line, i) => (
              <TypingCodeLine
                key={i}
                text={line}
                startFrame={lineStarts[i]}
                cps={DECLARE_CPS}
              />
            ))}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.declarationScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: CallScene ─────────────────────────────────────────────
const CALL_LINES = [
  'greet("민준");',
  'greet("지아");',
  'greet("서준");',
];
const CALL_CPS = 25;

const CallScene: React.FC = () => {
  const { callScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const { fps } = useVideoConfig();

  const lineStarts = CALL_LINES.map((_, i) => {
    const lineDuration = (split - s) / CALL_LINES.length;
    return Math.round(s + i * lineDuration);
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#2d2d2d",
              borderRadius: 12,
              padding: "40px 56px",
              minWidth: 600,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 36,
            }}
          >
            {CALL_LINES.map((line, i) => (
              <TypingCodeLine
                key={i}
                text={line}
                startFrame={lineStarts[i]}
                cps={CALL_CPS}
              />
            ))}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.callScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: SummaryScene ──────────────────────────────────────────
const SUMMARY_CARDS = CONTENT.summaryScene.cards as string[];

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false }); // 마지막 씬: fadeOut 없음
  const s = cfg.speechStartFrame;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card0Appear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const card1Appear = spring({
    frame: frame - (cfg.narrationSplits[0] ?? s + 30),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const cardAppears = [card0Appear, card1Appear];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: 48,
              alignItems: "center",
            }}
          >
            {SUMMARY_CARDS.map((card, i) => (
              <div
                key={i}
                style={{
                  fontFamily: uiFont,
                  fontSize: 44,
                  fontWeight: 700,
                  color: "#ffffff",
                  background: `${C_FUNC}18`,
                  border: `3px solid ${C_FUNC}66`,
                  borderRadius: 16,
                  padding: "32px 48px",
                  textAlign: "center",
                  opacity: cardAppears[i],
                  transform: `scale(${interpolate(cardAppears[i], [0, 1], [0.8, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })})`,
                }}
              >
                {card}
              </div>
            ))}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.summaryScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬 목록 + fromValues 계산 ─────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.painScene,
  VIDEO_CONFIG.conceptScene,
  VIDEO_CONFIG.declarationScene,
  VIDEO_CONFIG.callScene,
  VIDEO_CONFIG.summaryScene,
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;

// ── compositionMeta ───────────────────────────────────────────
export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: totalDuration,
};

// ── Root Component ────────────────────────────────────────────
const JavaFunction: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={fromValues[0]} durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.painScene.durationInFrames}>
      <PainScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.conceptScene.durationInFrames}>
      <ConceptScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.declarationScene.durationInFrames}>
      <DeclarationScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.callScene.durationInFrames}>
      <CallScene />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaFunction;
```

- [ ] **Step 3: TypeScript 오류 확인**

```bash
npx tsc --noEmit 2>&1 | grep "010-1\|010-3"
```

Expected: 출력 없음

---

## Task 3: pnpm sync 실행 — 오디오 생성 + AUDIO_CONFIG 갱신

- [ ] **Step 1: sync 실행**

```bash
pnpm sync 001-Java-Basic/010
```

Expected:
```
✅ fn-pain.mp3 생성
✅ fn-concept.mp3 생성
✅ fn-declare.mp3 생성
✅ fn-call.mp3 생성
✅ fn-summary.mp3 생성
✅ 010-3-audio.gen.ts 업데이트
```

오류 시: `public/` 폴더 권한 확인, edge-tts 설치 확인

- [ ] **Step 2: audio.gen.ts 정상 생성 확인**

```bash
cat src/compositions/001-Java-Basic/KOR/010-3-audio.gen.ts
```

Expected: 각 씬에 실제 `durationInFrames`, `speechStartFrame`, `narrationSplits` 값이 채워짐

- [ ] **Step 3: Remotion Studio에서 렌더 확인**

`http://localhost:3000` → `001-KOR-010` 선택 → 재생
Expected: 5개 씬이 순서대로 재생, 자막 표시

---

## Task 4: PainScene 비주얼 검토 및 타이밍 조정

sync 후 실제 durationInFrames와 narrationSplits 값을 알 수 있다.
이 태스크에서 타이밍을 실제 오디오에 맞게 조정한다.

- [ ] **Step 1: painScene 타이밍 확인**

```bash
grep -A5 "painScene" src/compositions/001-Java-Basic/KOR/010-3-audio.gen.ts
```

`narrationSplits[0]` 값을 확인. 이 프레임이 "이름만 다를 뿐" 발화 시작.

- [ ] **Step 2: Remotion Studio에서 PainScene 프레임별 확인**

`localhost:3000` → `001-KOR-010` → 타임라인에서 painScene 구간 탐색
- `speechStartFrame` 에서 첫 줄 타이핑 시작 확인
- `narrationSplits[0]` 에서 두 번째 문장 시작 확인
- 빨간 밑줄이 `narrationSplits[0]` 타이밍에 등장하는지 확인

- [ ] **Step 3: 문제 있으면 PainScene lineStarts 수식 조정**

타이핑이 너무 빠르거나 느리면 `PAIN_CPS` 값 조정:
```typescript
const PAIN_CPS = 30; // 빠르게 → 느리게: 20~25로 낮춤
```

---

## Task 5: DeclarationScene 타이밍 조정

- [ ] **Step 1: declarationScene 타이밍 확인**

```bash
grep -A5 "declarationScene" src/compositions/001-Java-Basic/KOR/010-3-audio.gen.ts
```

- [ ] **Step 2: 코드 타이핑이 오디오보다 늦게 끝나지 않는지 확인**

CLAUDE.md 규칙 #6: durationInFrames는 오디오 + 애니메이션 중 긴 쪽 기준.

총 문자 수:
```
"void greet(String name) {" = 26자
'    System.out.println("안녕하세요, " + name + "님!");' = 52자
"}" = 1자
합계: 79자
```

DECLARE_CPS=18 기준 소요 프레임: `(79 / 18) * 30 ≈ 132프레임`
`speechStartFrame + 132 + CROSS + SCENE_TAIL_FRAMES` 가 `durationInFrames` 이하인지 확인.

초과 시 CLAUDE.md 규칙 #6에 따라 `declarationScene`의 durationInFrames를 직접 override:

```typescript
// 010-1-JavaFunction.tsx VIDEO_CONFIG.declarationScene 수정
const DECLARE_TOTAL_CHARS = DECLARE_LINES.reduce((s, l) => s + l.length, 0);
const DECLARE_ANIM_END =
  AUDIO_CONFIG.declarationScene.speechStartFrame +
  Math.ceil((DECLARE_TOTAL_CHARS / DECLARE_CPS) * FPS);
const declarationDuration = Math.max(
  AUDIO_CONFIG.declarationScene.durationInFrames,
  DECLARE_ANIM_END + CROSS + SCENE_TAIL_FRAMES,
);

// VIDEO_CONFIG.declarationScene.durationInFrames 를 declarationDuration으로 교체
declarationScene: {
  ...
  durationInFrames: declarationDuration,
  ...
}
```

`SCENE_TAIL_FRAMES`는 `src/global.config.ts`에서 import.

---

## Task 6: 최종 확인 + 커밋

- [ ] **Step 1: TypeScript 오류 없음 확인**

```bash
npx tsc --noEmit 2>&1 | grep "010"
```

Expected: 출력 없음

- [ ] **Step 2: Remotion Studio 전체 씬 재생 확인**

`localhost:3000` → `001-KOR-010` → 처음부터 끝까지 재생
체크리스트:
- [ ] thumbnail 30프레임
- [ ] painScene: 코드 3줄 타이핑 → 자막 "인사 코드를..." → 빨간 밑줄 등장
- [ ] conceptScene: "함수" 큰 글씨 등장 → 설명 텍스트
- [ ] declarationScene: void greet(...) 타이핑
- [ ] callScene: greet("민준") 3줄 타이핑
- [ ] summaryScene: 카드 2개 등장, fadeOut 없음

- [ ] **Step 3: 커밋**

```bash
git add src/compositions/001-Java-Basic/KOR/010-1-JavaFunction.tsx \
        src/compositions/001-Java-Basic/KOR/010-2-content.ts \
        src/compositions/001-Java-Basic/KOR/010-3-audio.gen.ts \
        .010-Java-Basic-010-audio-hashes.json
git commit -m "feat: 10강 Java 함수 영상 추가 — 고통→해결 구조"
git push
```

---

## 주의사항

- `useTypingEffect`, `CodeLine`, `TypingCodeLine`은 이 파일에 로컬 정의. scene.tsx에 없음.
- `Audio` import는 `remotion`이 아니라 `@remotion/media`에서.
- 마지막 씬 `SummaryScene`만 `useFade(d, { out: false })` 사용.
- `painScene`의 빨간 밑줄은 `{phase2 && ...}` 금지 → `opacity: highlightAppear` 사용 (CLAUDE.md 규칙 #8).
- 해시 파일명: `.001-Java-Basic-010-audio-hashes.json` (루트 숨김파일).
