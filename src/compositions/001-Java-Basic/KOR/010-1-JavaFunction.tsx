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
import { Audio } from "@remotion/media";
import React from "react";
import { FPS } from "../../../config";
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
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_FUNC,
  C_KEYWORD,
  C_PAIN,
  C_STRING,
  C_TEAL,
  TEXT,
} from "./colors";
import { HEIGHT, WIDTH } from "./config";

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  painScene: {
    audio: "fn-pain.mp3",
    durationInFrames: AUDIO_CONFIG.painScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.painScene.speechStartFrame,
    narration: CONTENT.painScene.narration as unknown as string[],
    narrationSplits: AUDIO_CONFIG.painScene.narrationSplits,
  },
  conceptScene: {
    audio: "fn-concept.mp3",
    durationInFrames: AUDIO_CONFIG.conceptScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.conceptScene.speechStartFrame,
    narration: CONTENT.conceptScene.narration as unknown as string[],
    narrationSplits: AUDIO_CONFIG.conceptScene.narrationSplits,
  },
  declarationScene: {
    audio: "fn-declare.mp3",
    durationInFrames: AUDIO_CONFIG.declarationScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.declarationScene.speechStartFrame,
    narration: CONTENT.declarationScene.narration as unknown as string[],
    narrationSplits: AUDIO_CONFIG.declarationScene.narrationSplits,
  },
  callScene: {
    audio: "fn-call.mp3",
    durationInFrames: AUDIO_CONFIG.callScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.callScene.speechStartFrame,
    narration: CONTENT.callScene.narration as unknown as string[],
    narrationSplits: AUDIO_CONFIG.callScene.narrationSplits,
  },
  summaryScene: {
    audio: "fn-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as unknown as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
  comparisonScene: {
    audio: "fn-compare.mp3",
    durationInFrames: AUDIO_CONFIG.comparisonScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.comparisonScene.speechStartFrame,
    narration: CONTENT.comparisonScene.narration as unknown as string[],
    narrationSplits: AUDIO_CONFIG.comparisonScene.narrationSplits,
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
const CodeLine: React.FC<{ text: string }> = ({ text }) => {
  if (text.startsWith("//")) {
    return <span style={{ color: "#6a9955" }}>{text}</span>; // C_COMMENT
  }
  const parts = text.split(/(void|return|if|else|"[^"]*")/g);
  return (
    <>
      {parts.map((part, i) => {
        if (["void", "return", "if", "else"].includes(part))
          return <span key={i} style={{ color: C_KEYWORD }}>{part}</span>;
        if (/^"/.test(part))
          return <span key={i} style={{ color: C_STRING }}>{part}</span>;
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
    <div style={{ lineHeight: "1.9", color: TEXT, whiteSpace: "pre" }}>
      <CodeLine text={visibleText} />
    </div>
  );
};

// ── 씬: ThumbnailScene — 006 스타일 통일 ─────────────────────
// 색상 통일: "Java" = C_FUNC(노란색), "함수" = 흰색, JAVA 라벨 = 흰색(저채도)
// 배지 = 선언 void greet() / 사용 greet();
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: BG_THUMB,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 28,
    }}
  >
    {/* 배경 글로우 원 */}
    <div
      style={{
        position: "absolute",
        width: 860,
        height: 860,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C_TEAL}1e 0%, transparent 70%)`,
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
    {/* 메인 타이틀: Java(흰색) + 함수(teal) — 다른 에피소드와 통일 */}
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 108,
        fontWeight: 900,
        lineHeight: 1,
        textAlign: "center",
        color: "#ffffff",
        textShadow: `0 0 60px ${C_TEAL}99, 0 0 120px ${C_TEAL}44`,
      }}
    >
      Java
      <br />
      <span style={{ color: C_TEAL }}>함수</span>
    </div>
    {/* 배지 2개: 함수 선언 / 함수 사용 */}
    <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
      {["함수 선언", "함수 사용"].map((label) => (
        <div
          key={label}
          style={{
            fontFamily: uiFont,
            fontSize: 44,
            fontWeight: 900,
            color: C_TEAL,
            background: `${C_TEAL}18`,
            border: `2px solid ${C_TEAL}55`,
            borderRadius: 18,
            padding: "18px 44px",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── 씬: PainScene ─────────────────────────────────────────────
const PAIN_LINES = [
  'System.out.println("안녕 민준");',
  "// ...",
  'System.out.println("안녕 민준");',
  "// ...",
  'System.out.println("안녕 민준");',
];
const PAIN_CPS = 28;

// "민준" → 공백 → "철수" 교체 애니메이션
// phase 0→0.5: 민준 → "　　" (공백), 0.5→1: "　　" → 철수
function getReplaceWord(progress: number): { text: string; blank: boolean } {
  if (progress <= 0) return { text: "민준", blank: false };
  if (progress >= 1) return { text: "철수", blank: false };
  if (progress < 0.5) return { text: "　　", blank: true };  // 전각 공백 2자 (폭 유지)
  return { text: "철수", blank: false };
}

const REPLACE_DUR = 30;  // 교체 애니메이션 프레임 수
const REPLACE_GAP = 20;  // 줄 간격 프레임 수

// println 줄: 타이핑 후 민준→공백→철수 교체 + 하이라이트 사각형
const PainPrintlnLine: React.FC<{
  startFrame: number;
  replaceStart: number;
}> = ({ startFrame, replaceStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(
    frame,
    [replaceStart, replaceStart + REPLACE_DUR],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const { text: word, blank } = getReplaceWord(progress);

  // 하이라이트 사각형: 교체 진행 중일 때 표시
  const highlightOpacity = progress > 0 && progress < 1
    ? spring({ frame: frame - replaceStart, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 12 })
    : 0;

  if (frame < replaceStart) {
    return (
      <TypingCodeLine
        text={'System.out.println("안녕 민준");'}
        startFrame={startFrame}
        cps={PAIN_CPS}
      />
    );
  }
  return (
    <div style={{ lineHeight: "1.9", color: TEXT, whiteSpace: "pre", position: "relative" }}>
      <span>System.out.println(</span>
      <span style={{ color: C_STRING }}>"안녕 </span>
      <span style={{
        color: blank ? "transparent" : C_STRING,
        position: "relative",
        display: "inline-block",
      }}>
        {word}
        {/* 하이라이트 사각형 */}
        <span style={{
          position: "absolute",
          inset: "-2px -4px",
          border: `2px solid ${C_PAIN}`,
          borderRadius: 4,
          background: `${C_PAIN}18`,
          opacity: highlightOpacity,
          pointerEvents: "none",
        }} />
      </span>
      <span style={{ color: C_STRING }}>"</span>
      <span>);</span>
    </div>
  );
};

const PainScene: React.FC = () => {
  const { painScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const { fps } = useVideoConfig();

  // 순차 타이핑 — 5줄 lineStarts 계산
  const lineStarts: number[] = [];
  let cumFrame = s;
  for (const line of PAIN_LINES) {
    lineStarts.push(cumFrame);
    cumFrame += Math.ceil((line.length / PAIN_CPS) * fps);
  }

  // println 줄(0, 2, 4)별 교체 시작 프레임
  // 줄 0: split, 줄 2: split+GAP, 줄 4: split+GAP*2
  const replaceStarts = [
    split,
    split + REPLACE_GAP,
    split + REPLACE_GAP * 2,
  ];

  return (
    <>
      <AbsoluteFill style={{ opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: BG_CODE,
              borderRadius: 12,
              padding: "40px 56px",
              minWidth: 760,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 32,
            }}
          >
            {PAIN_LINES.map((line, i) => {
              if (line.startsWith("//")) {
                return (
                  <TypingCodeLine key={i} text={line} startFrame={lineStarts[i]} cps={PAIN_CPS} />
                );
              }
              // println 줄: 교체 애니메이션
              const rIdx = [0, 2, 4].indexOf(i);
              return (
                <PainPrintlnLine
                  key={i}
                  startFrame={lineStarts[i]}
                  replaceStart={replaceStarts[rIdx]}
                />
              );
            })}
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
      <AbsoluteFill style={{ opacity }}>
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
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 40,
                color: TEXT,
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
  "void greet() {",
  '    System.out.println("안녕 민준");',
  "}",
];
const DECLARE_CPS = 18;

const DeclarationScene: React.FC = () => {
  const { declarationScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const { fps } = useVideoConfig();

  const lineStarts: number[] = [];
  let cumFrame = s;
  for (const line of DECLARE_LINES) {
    lineStarts.push(cumFrame);
    cumFrame += Math.ceil((line.length / DECLARE_CPS) * fps);
  }

  return (
    <>
      <AbsoluteFill style={{ opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: BG_CODE,
              borderRadius: 12,
              padding: "40px 56px",
              minWidth: 760,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 32,
            }}
          >
            {DECLARE_LINES.map((line, i) => (
              <TypingCodeLine key={i} text={line} startFrame={lineStarts[i]} cps={DECLARE_CPS} />
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
const CALL_LINES = ["greet();", "greet();", "greet();"];
const CALL_CPS = 20;

const CallScene: React.FC = () => {
  const { callScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];

  const lineStarts = CALL_LINES.map((_, i) => {
    const lineDuration = (split - s) / CALL_LINES.length;
    return Math.round(s + i * lineDuration);
  });

  return (
    <>
      <AbsoluteFill style={{ opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: BG_CODE,
              borderRadius: 12,
              padding: "40px 56px",
              minWidth: 400,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 40,
            }}
          >
            {CALL_LINES.map((line, i) => (
              <TypingCodeLine key={i} text={line} startFrame={lineStarts[i]} cps={CALL_CPS} />
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
const SUMMARY_CARDS = CONTENT.summaryScene.cards as unknown as string[];

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d); // 마지막 씬 아님 → fadeOut 있음
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
      <AbsoluteFill style={{ opacity }}>
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

// ── 씬: ComparisonScene — 고통코드 → 화살표 → 개선코드 ───────
const BEFORE_LINES = PAIN_LINES; // 함수 없이: 3줄 반복
const AFTER_LINES = [
  "void greet() {",
  '    System.out.println("안녕 민준");',
  "}",
  "",
  "greet();",
  "greet();",
  "greet();",
];

// 하이라이트할 줄 인덱스 (반복되는 println 줄)
const BEFORE_HIGHLIGHT = [0, 2, 4]; // println 3줄
// 함수 선언 블록 + 간결한 호출부
const AFTER_HIGHLIGHT_DECLARE = [0, 1, 2]; // void greet() { ... }
const AFTER_HIGHLIGHT_CALL = [4, 5, 6];    // greet(); x3

const ComparisonScene: React.FC = () => {
  const { comparisonScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false }); // 마지막 씬 → fadeOut 없음
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const beforeAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const arrowAppear = spring({
    frame: frame - (s + Math.round((split - s) / 2)),
    fps,
    config: { damping: 14, stiffness: 120 },
    durationInFrames: 20,
  });
  const afterAppear = spring({
    frame: frame - split,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  // 하이라이트 사각형은 after 등장 후 살짝 뒤에
  const highlightAppear = spring({
    frame: frame - (split + 12),
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 20,
  });

  const codeBoxStyle: React.CSSProperties = {
    background: BG_CODE,
    borderRadius: 12,
    padding: "20px 32px",
    fontFamily: monoFont,
    fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 24,
    position: "relative",
  };

  const labelStyle = (color: string): React.CSSProperties => ({
    fontFamily: uiFont,
    fontSize: 22,
    fontWeight: 700,
    color,
    letterSpacing: 2,
    marginBottom: 10,
    opacity: 0.85,
  });

  // 줄 하이라이트 사각형 (absolute overlay)
  const HighlightRect: React.FC<{
    lineIndices: number[];
    color: string;
    appear: number;
  }> = ({ lineIndices, color, appear }) => {
    if (lineIndices.length === 0) return null;
    const lineH = 24 * 1.8; // fontSize * lineHeight
    const top = lineIndices[0] * lineH;
    const height = lineIndices.length * lineH;
    return (
      <div
        style={{
          position: "absolute",
          left: 4,
          right: 4,
          top: 20 + top, // padding offset
          height,
          border: `2px solid ${color}`,
          borderRadius: 6,
          background: `${color}12`,
          opacity: appear,
          pointerEvents: "none",
        }}
      />
    );
  };

  return (
    <>
      <AbsoluteFill style={{ opacity }}>
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
              gap: 24,
              width: 900,
            }}
          >
            {/* 고통스러운 코드 — 위 */}
            <div style={{ opacity: beforeAppear, width: "100%" }}>
              <div style={labelStyle(C_PAIN)}>고통스러운 코드</div>
              <div style={codeBoxStyle}>
                {BEFORE_LINES.map((line, i) => (
                  <div key={i} style={{ lineHeight: "1.8", color: TEXT, whiteSpace: "pre" }}>
                    <CodeLine text={line} />
                  </div>
                ))}
                <HighlightRect lineIndices={BEFORE_HIGHLIGHT} color={C_PAIN} appear={highlightAppear} />
              </div>
            </div>
            {/* 화살표 ▼ */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 48,
                color: C_TEAL,
                opacity: arrowAppear,
                transform: `translateY(${interpolate(arrowAppear, [0, 1], [10, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}px)`,
              }}
            >
              ▼
            </div>
            {/* 개선된 코드 — 아래 */}
            <div style={{ opacity: afterAppear, width: "100%" }}>
              <div style={labelStyle(C_FUNC)}>개선된 코드</div>
              <div style={codeBoxStyle}>
                {AFTER_LINES.map((line, i) => (
                  <div key={i} style={{ lineHeight: "1.8", color: TEXT, whiteSpace: "pre" }}>
                    {line ? <CodeLine text={line} /> : "\u00A0"}
                  </div>
                ))}
                <HighlightRect lineIndices={AFTER_HIGHLIGHT_DECLARE} color={C_FUNC} appear={highlightAppear} />
                <HighlightRect lineIndices={AFTER_HIGHLIGHT_CALL} color={C_TEAL} appear={highlightAppear} />
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.comparisonScene.wordStartFrames}
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
  VIDEO_CONFIG.comparisonScene,
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
  <AbsoluteFill style={{ background: BG }}>
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
    <Sequence from={fromValues[6]} durationInFrames={VIDEO_CONFIG.comparisonScene.durationInFrames}>
      <ComparisonScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaFunction;
