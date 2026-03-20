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
        whiteSpace: "pre-line",
      }}
    >
      {"Java\n함수"}
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
const PAIN_CPS = 30;

const PainScene: React.FC = () => {
  const { painScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineStarts = PAIN_LINES.map((_, i) => {
    const lineDuration = (split - s) / PAIN_LINES.length;
    return Math.round(s + i * lineDuration);
  });

  const highlightAppear = spring({
    frame: frame - split,
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

  const split = cfg.narrationSplits[0];
  const typingWindow = split - s;
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
const SUMMARY_CARDS = CONTENT.summaryScene.cards as unknown as string[];

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });
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
