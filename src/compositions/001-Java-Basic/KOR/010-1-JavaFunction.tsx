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
  FONT,
  MONO_NO_LIGA,
  SceneTitle,
  Subtitle,
  THUMB_CROSS,
  monoFont,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { CONTENT } from "./010-2-content";
import { AUDIO_CONFIG } from "./010-3-audio.gen";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_FUNC,
  C_KEYWORD,
  C_NUMBER,
  C_PAIN,
  C_PURPLE,
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
  comparisonScene: {
    audio: "fn-compare.mp3",
    durationInFrames: AUDIO_CONFIG.comparisonScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.comparisonScene.speechStartFrame,
    narration: CONTENT.comparisonScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.comparisonScene.narrationSplits,
  },
  realExampleScene: {
    audio: "fn-real.mp3",
    durationInFrames: AUDIO_CONFIG.realExampleScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.realExampleScene.speechStartFrame,
    narration: CONTENT.realExampleScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.realExampleScene.narrationSplits,
  },
  outroScene: {
    audio: "fn-outro.mp3",
    durationInFrames: AUDIO_CONFIG.outroScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.outroScene.speechStartFrame,
    narration: CONTENT.outroScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.outroScene.narrationSplits,
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
          return (
            <span key={i} style={{ color: C_KEYWORD }}>
              {part}
            </span>
          );
        if (/^"/.test(part))
          return (
            <span key={i} style={{ color: C_STRING }}>
              {part}
            </span>
          );
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

// ── 컴포넌트: TypingGreetLine (첫 줄 전용 — greet 밑줄) ────────
const TypingGreetLine: React.FC<{
  text: string;
  startFrame: number;
  cps: number;
  underlineAppear: number;
}> = ({ text, startFrame, cps, underlineAppear }) => {
  const { visibleText } = useTypingEffect(text, startFrame, cps);
  const parts = visibleText.split("greet");
  return (
    <div style={{ lineHeight: "1.9", color: TEXT, whiteSpace: "pre" }}>
      <span style={{ color: C_KEYWORD }}>
        {parts[0]?.startsWith("void") ? "void" : ""}
      </span>
      {parts[0]?.replace("void", "")}
      {parts.length > 1 && (
        <span
          style={{
            color: C_FUNC,
            position: "relative",
            display: "inline",
          }}
        >
          greet
          <span
            style={{
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 3,
              background: C_PAIN,
              borderRadius: 2,
              opacity: underlineAppear,
              transform: `scaleX(${underlineAppear})`,
              transformOrigin: "left",
            }}
          />
        </span>
      )}
      {parts[1] ?? ""}
    </div>
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
const ThumbnailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [10, 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: BG_THUMB,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
        opacity: fadeOut,
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
};

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
// phase 0→0.5: 민준 → 공백, 0.5→1: 공백 → 철수
function getReplaceWord(progress: number): { text: string; blank: boolean } {
  if (progress <= 0) return { text: "민준", blank: false };
  if (progress >= 1) return { text: "철수", blank: false };
  if (progress < 0.5) return { text: "　　", blank: true }; // 전각 공백 2자 (폭 유지)
  return { text: "철수", blank: false };
}

const REPLACE_DUR = 30; // 교체 애니메이션 프레임 수
const REPLACE_GAP = 20; // 줄 간격 프레임 수

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
  const highlightOpacity =
    progress > 0 && progress < 1
      ? spring({
          frame: frame - replaceStart,
          fps,
          config: { damping: 14, stiffness: 120 },
          durationInFrames: 12,
        })
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
    <div
      style={{
        lineHeight: "1.9",
        color: TEXT,
        whiteSpace: "pre",
        position: "relative",
      }}
    >
      <span>System.out.println(</span>
      <span style={{ color: C_STRING }}>"안녕 </span>
      <span
        style={{
          color: blank ? "transparent" : C_STRING,
          position: "relative",
          display: "inline-block",
        }}
      >
        {word}
        {/* 하이라이트 사각형 */}
        <span
          style={{
            position: "absolute",
            inset: "-2px -4px",
            border: `2px solid ${C_PAIN}`,
            borderRadius: 4,
            background: `${C_PAIN}18`,
            opacity: highlightOpacity,
            pointerEvents: "none",
          }}
        />
      </span>
      <span style={{ color: C_STRING }}>"</span>
      <span>);</span>
    </div>
  );
};

const PainScene: React.FC = () => {
  const { painScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { in: true });
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

  // 교체는 5줄 타이핑 완료 후 시작 (split과 비교해 늦은 쪽 사용)
  const typingDone = cumFrame;
  const replaceBegin = Math.max(split, typingDone);
  const replaceStarts = [
    replaceBegin,
    replaceBegin + REPLACE_GAP,
    replaceBegin + REPLACE_GAP * 2,
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 반복의 고통" />
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
                  <TypingCodeLine
                    key={i}
                    text={line}
                    startFrame={lineStarts[i]}
                    cps={PAIN_CPS}
                  />
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
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="2. 함수란?" />
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
              <span style={{ color: C_FUNC, fontWeight: 700 }}>이름</span>을
              붙인 것
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineStarts: number[] = [];
  let cumFrame = s;
  for (const line of DECLARE_LINES) {
    lineStarts.push(cumFrame);
    cumFrame += Math.ceil((line.length / DECLARE_CPS) * fps);
  }

  // "이름에만" 발화 시점(frame 95)에 greet 함수명에 빨간 밑줄
  const nameWordFrame = AUDIO_CONFIG.declarationScene.wordStartFrames[1][2]; // "이름에만" = 95
  const underlineAppear = spring({
    frame: frame - nameWordFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 16,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. 함수 선언" />
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
            {DECLARE_LINES.map((line, i) =>
              i === 0 ? (
                <TypingGreetLine
                  key={i}
                  text={line}
                  startFrame={lineStarts[i]}
                  cps={DECLARE_CPS}
                  underlineAppear={underlineAppear}
                />
              ) : (
                <TypingCodeLine
                  key={i}
                  text={line}
                  startFrame={lineStarts[i]}
                  cps={DECLARE_CPS}
                />
              ),
            )}
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
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. 함수 호출" />
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
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1문장: 요약 타이틀 등장
  const titleAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 14, stiffness: 120 },
    durationInFrames: 24,
  });
  // 2문장 시작 시 타이틀 퇴장
  const titleExit = spring({
    frame: frame - split,
    fps,
    config: { damping: 14, stiffness: 200 },
    durationInFrames: 18,
  });
  const titleOpacity = titleAppear * (1 - titleExit);

  // "선언은" 발화(frame 106) → 카드0 등장
  const declareWordFrame = AUDIO_CONFIG.summaryScene.wordStartFrames[1][0]; // "선언은"
  const card0Appear = spring({
    frame: frame - declareWordFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  // "호출은" 발화(frame 141) → 카드1 등장
  const callWordFrame = AUDIO_CONFIG.summaryScene.wordStartFrames[1][3]; // "호출은"
  const card1Appear = spring({
    frame: frame - callWordFrame,
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
          <SceneTitle title="5. 함수 정리" />
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
            }}
          >
            {/* 1문장: 요약 타이틀 */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 52,
                fontWeight: 700,
                color: C_TEAL,
                textAlign: "center",
                opacity: titleOpacity,
                transform: `scale(${interpolate(
                  titleAppear,
                  [0, 1],
                  [0.85, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )})`,
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -30,
                marginLeft: -200,
                width: 400,
              }}
            >
              함수 = 이름 붙인{"\n"}코드 묶음
            </div>
            {/* 2문장: 카드 2장 */}
            <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
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
                    transform: `scale(${interpolate(
                      cardAppears[i],
                      [0, 1],
                      [0.8, 1],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    )})`,
                  }}
                >
                  {card}
                </div>
              ))}
            </div>
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
const AFTER_HIGHLIGHT_CALL = [4, 5, 6]; // greet(); x3

const ComparisonScene: React.FC = () => {
  const { comparisonScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d); // 마지막 씬 아님 → fadeOut 있음
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
    fontSize: FONT.label,
    fontWeight: 700,
    color,
    letterSpacing: 2,
    marginBottom: 10,
    opacity: 0.85,
  });

  // 줄 하이라이트 사각형 (absolute overlay) — 연속 블록 단위로 분리
  const HighlightRect: React.FC<{
    lineIndices: number[];
    color: string;
    appear: number;
  }> = ({ lineIndices, color, appear }) => {
    if (lineIndices.length === 0) return null;
    const lineH = 24 * 1.7; // fontSize * lineHeight
    // 연속 구간별 그룹핑
    const groups: number[][] = [];
    let cur: number[] = [];
    for (const idx of lineIndices) {
      if (cur.length > 0 && idx !== cur[cur.length - 1] + 1) {
        groups.push(cur);
        cur = [];
      }
      cur.push(idx);
    }
    if (cur.length > 0) groups.push(cur);
    return (
      <>
        {groups.map((g, gi) => (
          <div
            key={gi}
            style={{
              position: "absolute",
              left: 4,
              right: 4,
              top: 20 + g[0] * lineH, // padding offset
              height: g.length * lineH,
              border: `2px solid ${color}`,
              borderRadius: 6,
              background: `${color}12`,
              opacity: appear,
              pointerEvents: "none",
            }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="6. Before / After" />
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
                  <div
                    key={i}
                    style={{
                      lineHeight: "1.7",
                      color: TEXT,
                      whiteSpace: "pre",
                    }}
                  >
                    <CodeLine text={line} />
                  </div>
                ))}
                <HighlightRect
                  lineIndices={BEFORE_HIGHLIGHT}
                  color={C_PAIN}
                  appear={highlightAppear}
                />
              </div>
            </div>
            {/* 화살표 ▼ */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 48,
                color: C_TEAL,
                opacity: arrowAppear,
                transform: `translateY(${interpolate(
                  arrowAppear,
                  [0, 1],
                  [10, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )}px)`,
              }}
            >
              ▼
            </div>
            {/* 개선된 코드 — 아래 */}
            <div style={{ opacity: afterAppear, width: "100%" }}>
              <div style={labelStyle(C_FUNC)}>개선된 코드</div>
              <div style={codeBoxStyle}>
                {AFTER_LINES.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      lineHeight: "1.7",
                      color: TEXT,
                      whiteSpace: "pre",
                    }}
                  >
                    {line ? <CodeLine text={line} /> : "\u00A0"}
                  </div>
                ))}
                <HighlightRect
                  lineIndices={AFTER_HIGHLIGHT_DECLARE}
                  color={C_FUNC}
                  appear={highlightAppear}
                />
                <HighlightRect
                  lineIndices={AFTER_HIGHLIGHT_CALL}
                  color={C_TEAL}
                  appear={highlightAppear}
                />
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

// ── 씬: RealExampleScene — 할인 가격 하드코딩 → 함수로 해결 ────
const REAL_PAIN_CARD1 = [
  "if (price > 30000) {",
  "    price = (int)(price * 0.9);",
  "}",
];
const REAL_PAIN_CARD2 = [
  "if (price > 30000) {",
  "    price = (int)(price * 0.9);",
  "}",
];
const REAL_CLEAN_FUNC = [
  "int discount(int price) {",
  "    if (price > 30000) {",
  "        return (int)(price * 0.9);",
  "    }",
  "    return price;",
  "}",
];
const REAL_CLEAN_CART = ["discount(50000);"];
const REAL_CLEAN_PAY = ["discount(80000);"];

const RealExampleScene: React.FC = () => {
  const { realExampleScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split1 = cfg.narrationSplits[0]; // 2번째 문장 시작
  const split2 = cfg.narrationSplits[1]; // 3번째 문장 시작
  const split3 = cfg.narrationSplits[2]; // 4번째 문장 시작
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1문장: "실감나는 예시" → 고통 카드 2개 등장
  const beforeAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  // 2문장: 밑줄 애니메이션 (반복 지점 강조)
  const underlineAppear = spring({
    frame: frame - (split1 + 15),
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 20,
  });
  // 3→4문장 사이: 화살표 등장
  const arrowAppear = spring({
    frame: frame - (split2 + Math.round((split3 - split2) * 0.7)),
    fps,
    config: { damping: 14, stiffness: 120 },
    durationInFrames: 20,
  });
  // 4문장: "함수로 만들면" → 개선 코드 등장
  const afterAppear = spring({
    frame: frame - split3,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  const codeBoxStyle: React.CSSProperties = {
    background: BG_CODE,
    borderRadius: 12,
    padding: "14px 20px",
    fontFamily: monoFont,
    fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 18,
  };

  const labelStyle = (color: string): React.CSSProperties => ({
    fontFamily: uiFont,
    fontSize: FONT.label,
    fontWeight: 700,
    color,
    letterSpacing: 2,
    marginBottom: 8,
    opacity: 0.85,
  });

  // 코드 컬러링 — 할인 계산 예시
  const colorCode = (text: string) => {
    const parts = text.split(
      /(0\.\d+|\d+|"[^"]*"|\*|>|return|if|double|int|void)/g,
    );
    return parts.map((p, i) => {
      if (p === "if")
        return (
          <span key={i} style={{ color: C_PURPLE }}>
            {p}
          </span>
        );
      if (["double", "int", "void"].includes(p))
        return (
          <span key={i} style={{ color: C_KEYWORD }}>
            {p}
          </span>
        );
      if (p === "return")
        return (
          <span key={i} style={{ color: C_KEYWORD }}>
            {p}
          </span>
        );
      if (/^[\d.]+$/.test(p))
        return (
          <span key={i} style={{ color: C_NUMBER }}>
            {p}
          </span>
        );
      if (/^"/.test(p))
        return (
          <span key={i} style={{ color: C_STRING }}>
            {p}
          </span>
        );
      if (p.includes("discount"))
        return (
          <span key={i}>
            {p.split("discount").map((seg, j, arr) => (
              <React.Fragment key={j}>
                {seg}
                {j < arr.length - 1 && (
                  <span style={{ color: C_FUNC }}>discount</span>
                )}
              </React.Fragment>
            ))}
          </span>
        );
      return <span key={i}>{p}</span>;
    });
  };

  // 반복 강조 밑줄이 필요한 줄 (> 30000, * 0.9 부분)
  const painLineWithUnderline = (text: string, ul: number) => {
    // > 30000 과 * 0.9 에 밑줄
    const highlighted = text
      .replace(/(> 30000)/, "{{UL1}}")
      .replace(/(\* 0\.9)/, "{{UL2}}");
    const segs = highlighted.split(/({{UL[12]}})/);
    return segs.map((seg, i) => {
      if (seg === "{{UL1}}") {
        return (
          <span key={i} style={{ position: "relative", display: "inline" }}>
            {colorCode("> 30000")}
            <span
              style={{
                position: "absolute",
                bottom: -2,
                left: 0,
                right: 0,
                height: 2,
                background: C_PAIN,
                transform: `scaleX(${ul})`,
                transformOrigin: "left",
              }}
            />
          </span>
        );
      }
      if (seg === "{{UL2}}") {
        return (
          <span key={i} style={{ position: "relative", display: "inline" }}>
            {colorCode("* 0.9")}
            <span
              style={{
                position: "absolute",
                bottom: -2,
                left: 0,
                right: 0,
                height: 2,
                background: C_PAIN,
                transform: `scaleX(${ul})`,
                transformOrigin: "left",
              }}
            />
          </span>
        );
      }
      return <React.Fragment key={i}>{colorCode(seg)}</React.Fragment>;
    });
  };

  // 고통 카드 렌더러
  const PainCard: React.FC<{ lines: string[]; label: string }> = ({
    lines,
    label,
  }) => (
    <div style={{ flex: 1 }}>
      <div style={labelStyle(C_PAIN)}>{label}</div>
      <div style={codeBoxStyle}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{ lineHeight: "1.7", color: TEXT, whiteSpace: "pre" }}
          >
            {line.includes("30000") || line.includes("0.9")
              ? painLineWithUnderline(line, underlineAppear)
              : colorCode(line)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="7. 실전 예시" />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              width: 920,
            }}
          >
            {/* 상단: 고통 카드 2개 위아래 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
                opacity: beforeAppear,
              }}
            >
              <PainCard
                lines={REAL_PAIN_CARD1}
                label="장바구니 관련 소스코드"
              />
              <PainCard lines={REAL_PAIN_CARD2} label="결제 관련 소스코드" />
            </div>
            {/* 화살표 ▼ */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 36,
                color: C_TEAL,
                opacity: arrowAppear,
                transform: `translateY(${interpolate(
                  arrowAppear,
                  [0, 1],
                  [10, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )}px)`,
              }}
            >
              ▼
            </div>
            {/* 하단: 3개 카드 — 함수 선언 + 장바구니 호출 + 결제 호출 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
                opacity: afterAppear,
              }}
            >
              {/* 함수 선언 */}
              <div>
                <div style={labelStyle(C_FUNC)}>함수 선언</div>
                <div style={codeBoxStyle}>
                  {REAL_CLEAN_FUNC.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        lineHeight: "1.7",
                        color: TEXT,
                        whiteSpace: "pre",
                      }}
                    >
                      {colorCode(line)}
                    </div>
                  ))}
                </div>
              </div>
              {/* 호출부 2개 나란히 */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle(C_TEAL)}>장바구니</div>
                  <div style={codeBoxStyle}>
                    {REAL_CLEAN_CART.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          lineHeight: "1.7",
                          color: TEXT,
                          whiteSpace: "pre",
                        }}
                      >
                        {colorCode(line)}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle(C_TEAL)}>결제</div>
                  <div style={codeBoxStyle}>
                    {REAL_CLEAN_PAY.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          lineHeight: "1.7",
                          color: TEXT,
                          whiteSpace: "pre",
                        }}
                      >
                        {colorCode(line)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.realExampleScene.wordStartFrames}
      />
    </>
  );
};

// ── OutroScene — return/void 예고 ────────────────────────────
const OutroScene: React.FC = () => {
  const { outroScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false }); // 마지막 씬 → fadeOut 없음
  const s = cfg.speechStartFrame;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "return" 발화 시점 → frame 2
  const returnFrame = AUDIO_CONFIG.outroScene.wordStartFrames[0][0];
  // "void는" 발화 시점 → frame 18
  const voidFrame = AUDIO_CONFIG.outroScene.wordStartFrames[0][2];

  const returnAppear = spring({
    frame: frame - returnFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const voidAppear = spring({
    frame: frame - voidFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  // 밑줄 애니메이션 — 발화 시점 + 8프레임 후 시작
  const returnUnderline = spring({
    frame: frame - returnFrame - 8,
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 20,
  });
  const voidUnderline = spring({
    frame: frame - voidFrame - 8,
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 20,
  });

  const keywordStyle = (appear: number): React.CSSProperties => ({
    fontFamily: monoFont,
    fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 52,
    fontWeight: 900,
    color: C_KEYWORD,
    opacity: appear,
    display: "inline-block",
    position: "relative" as const,
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="8. 다음 시간에" />

          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: 28,
              alignItems: "center",
            }}
          >
            {/* return */}
            <div style={keywordStyle(returnAppear)}>
              return
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  left: 0,
                  height: 3,
                  background: C_TEAL,
                  borderRadius: 2,
                  width: `${returnUnderline * 100}%`,
                }}
              />
            </div>

            {/* 과 */}
            <span
              style={{
                fontFamily: uiFont,
                fontSize: 36,
                fontWeight: 700,
                color: TEXT,
                opacity: returnAppear,
              }}
            >
              과
            </span>

            {/* void */}
            <div style={keywordStyle(voidAppear)}>
              void
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  left: 0,
                  height: 3,
                  background: C_TEAL,
                  borderRadius: 2,
                  width: `${voidUnderline * 100}%`,
                }}
              />
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.outroScene.wordStartFrames}
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
  VIDEO_CONFIG.realExampleScene,
  VIDEO_CONFIG.outroScene,
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from +=
    s.durationInFrames -
    (i === 0 ? THUMB_CROSS : i < sceneList.length - 1 ? CROSS : 0);
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
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.painScene.durationInFrames}
    >
      <PainScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.conceptScene.durationInFrames}
    >
      <ConceptScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.declarationScene.durationInFrames}
    >
      <DeclarationScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.callScene.durationInFrames}
    >
      <CallScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
    <Sequence
      from={fromValues[6]}
      durationInFrames={VIDEO_CONFIG.comparisonScene.durationInFrames}
    >
      <ComparisonScene />
    </Sequence>
    <Sequence
      from={fromValues[7]}
      durationInFrames={VIDEO_CONFIG.realExampleScene.durationInFrames}
    >
      <RealExampleScene />
    </Sequence>
    <Sequence
      from={fromValues[8]}
      durationInFrames={VIDEO_CONFIG.outroScene.durationInFrames}
    >
      <OutroScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaFunction;
