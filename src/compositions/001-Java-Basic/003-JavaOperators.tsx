// src/compositions/001-Java-Basic/003-JavaOperators.tsx
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RATE, VOICE } from "../../global.config";
import {
  CROSS,
  ContentArea,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../utils/scene";
import { AUDIO_CONFIG } from "./003-audio";

export { RATE, VOICE };

// ── 상수 ─────────────────────────────────────────────────────
const C_INT = "#4e9cd5";
const C_OP = "#d4834e";
const C_NUM = "#b5cea8";
const C_COMMENT = "#6a9955";
const C_REM = "#4ec9b0"; // 나머지 연산자 강조색

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  intro: {
    audio: "op-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "산술 연산자는 수학적 계산을 수행하는 연산자입니다.",
      "더하기, 빼기, 곱하기, 나누기, 나머지, 총 다섯 가지를 알아봅니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  addSubScene: {
    audio: "op-addsub.mp3",
    durationInFrames: AUDIO_CONFIG.addSubScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.addSubScene.speechStartFrame,
    narration: [
      "더하기 연산자는 두 값을 더합니다.",
      "빼기 연산자는 첫 번째 값에서 두 번째 값을 뺍니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.addSubScene.narrationSplits,
  },
  mulDivScene: {
    audio: "op-muldiv.mp3",
    durationInFrames: AUDIO_CONFIG.mulDivScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.mulDivScene.speechStartFrame,
    narration: [
      "곱하기 연산자는 두 값을 곱합니다.",
      "나누기 연산자는 첫 번째 값을 두 번째 값으로 나눕니다.",
      "정수끼리 나누면 소수점은 버려집니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.mulDivScene.narrationSplits,
  },
  remScene: {
    audio: "op-rem.mp3",
    durationInFrames: AUDIO_CONFIG.remScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.remScene.speechStartFrame,
    narration: [
      "나머지 연산자는 나눗셈에서 몫이 아닌 나머지를 구합니다.",
      "11을 3으로 나누면 몫은 3이고 나머지는 2입니다.",
      "짝수 홀수 판별처럼 다양한 계산에 활용됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.remScene.narrationSplits,
  },
  summaryScene: {
    audio: "op-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "다섯 가지 산술 연산자를 코드로 정리하면 이렇습니다.",
      "각 연산의 결과를 변수에 저장해 활용할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 컴포넌트: ColorizedCode ───────────────────────────────────
const KEYWORDS = ["int", "double", "String", "boolean"];
const OPERATORS = ["==", "+", "-", "*", "/", "%", "="];

const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  const commentIdx = text.indexOf("//");
  const codePart = commentIdx >= 0 ? text.slice(0, commentIdx) : text;
  const commentPart = commentIdx >= 0 ? text.slice(commentIdx) : "";

  const parts = codePart.split(
    /(\bint\b|\bdouble\b|\bString\b|\bboolean\b|[+\-*\/%=]|\b\d+(?:\.\d+)?\b|"[^"]*")/g,
  );

  const TYPE_COLORS: Record<string, string> = {
    int: C_INT,
    double: "#d4c04e",
    String: "#4ec970",
    boolean: "#d4834e",
  };

  return (
    <>
      {parts.map((part, i) => {
        if (KEYWORDS.includes(part))
          return (
            <span key={i} style={{ color: TYPE_COLORS[part] }}>
              {part}
            </span>
          );
        if (OPERATORS.includes(part))
          return (
            <span key={i} style={{ color: C_OP }}>
              {part}
            </span>
          );
        if (/^\d/.test(part))
          return (
            <span key={i} style={{ color: C_NUM }}>
              {part}
            </span>
          );
        if (/^"/.test(part))
          return (
            <span key={i} style={{ color: "#ce9178" }}>
              {part}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
      {commentPart && <span style={{ color: C_COMMENT }}>{commentPart}</span>}
    </>
  );
};

// ── 공통: TypingLine (SummaryScene과 공유) ───────────────────
const TypingLine: React.FC<{
  text: string;
  startFrame: number;
  cps: number;
}> = ({ text, startFrame, cps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const visible = Math.floor((Math.max(0, frame - startFrame) / fps) * cps);
  return (
    <div style={{ color: "#d4d4d4" }}>
      <ColorizedCode text={text.slice(0, visible)} />
    </div>
  );
};

// ── 공통: 코드 라인 점진적 등장 블록 ─────────────────────────
const CodeLines: React.FC<{
  lines: { text: string; startFrame: number }[];
  cps?: number;
}> = ({ lines, cps = 40 }) => {
  const frame = useCurrentFrame();
  const visibleLines = lines.filter((l) => frame >= l.startFrame);
  if (visibleLines.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#2d2d2d",
        borderRadius: 14,
        padding: "36px 56px",
        minWidth: 820,
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 32,
        lineHeight: 1.9,
      }}
    >
      {visibleLines.map((l, i) => {
        const isLast = i === visibleLines.length - 1;
        if (!isLast) {
          return (
            <div key={i} style={{ color: "#d4d4d4", opacity: 0.55 }}>
              <ColorizedCode text={l.text} />
            </div>
          );
        }
        return (
          <TypingLine
            key={i}
            text={l.text}
            startFrame={l.startFrame}
            cps={cps}
          />
        );
      })}
    </div>
  );
};

// ── 씬: ThumbnailScene ────────────────────────────────────────
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
        fontSize: 120,
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
      <span style={{ color: "#4ec9b0" }}>산술 연산자</span>
    </div>
    <div
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 44,
        color: "#4ec9b0",
        letterSpacing: 12,
        opacity: 0.7,
      }}
    >
      + &nbsp; - &nbsp; * &nbsp; / &nbsp; %
    </div>
  </AbsoluteFill>
);

// ── 씬: IntroScene ────────────────────────────────────────────
const INTRO_OPS = ["+", "-", "*", "/", "%"];

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(intro.audio)} />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: 24,
            }}
          >
            {INTRO_OPS.map((op, i) => {
              const appear = spring({
                frame: frame - i * 6,
                fps,
                config: { damping: 14, stiffness: 140 },
                durationInFrames: 30,
              });
              const sc = interpolate(appear, [0, 1], [0.3, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={op}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 24,
                    border: `3px solid ${C_OP}88`,
                    background: `${C_OP}1a`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${sc})`,
                    opacity: appear,
                  }}
                >
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 72,
                      fontWeight: 700,
                      color: C_OP,
                    }}
                  >
                    {op}
                  </span>
                </div>
              );
            })}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={intro.narration}
        splits={intro.narrationSplits}
        speechStart={intro.speechStartFrame}
      />
    </>
  );
};

// ── 씬: AddSubScene ───────────────────────────────────────────
const AddSubScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { addSubScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {frame >= s && (
            <CodeLines
              lines={[
                { text: "int a = 10, b = 3;", startFrame: s },
                { text: "int sum  = a + b;   // 13", startFrame: s + 5 },
                { text: "int diff = a - b;   //  7", startFrame: split0 },
              ]}
            />
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── 씬: MulDivScene ───────────────────────────────────────────
const MulDivScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { mulDivScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0, split1] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {frame >= s && (
            <CodeLines
              lines={[
                { text: "int a = 10, b = 3;", startFrame: s },
                { text: "int prod = a * b;   // 30", startFrame: s + 5 },
                { text: "int quot = a / b;   //  3", startFrame: split0 },
                {
                  text: "// 정수끼리 나누면 소수점은 버려집니다.",
                  startFrame: split1,
                },
              ]}
            />
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── 씬: RemScene (나머지 연산자) ──────────────────────────────
const RemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { remScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0, split1] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  // 나눗셈 시각화 등장
  const divAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 30,
  });

  // split0: 몫/나머지 강조 등장
  const detailAppear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 25,
  });

  // split1: 활용 예시 등장
  const usageAppear = spring({
    frame: frame - split1,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 25,
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          {/* 메인: 11 % 3 == 2 */}
          <div
            style={{
              position: "absolute",
              top: "36%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${interpolate(divAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              opacity: divAppear,
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 80,
              fontWeight: 900,
            }}
          >
            <span style={{ color: C_INT }}>11</span>
            <span style={{ color: C_REM }}>%</span>
            <span style={{ color: C_INT }}>3</span>
            <span style={{ color: C_OP }}>==</span>
            <span style={{ color: C_REM, textShadow: `0 0 30px ${C_REM}88` }}>
              2
            </span>
          </div>

          {/* split0: 몫 3, 나머지 2 분리 설명 */}
          {frame >= split0 && (
            <div
              style={{
                position: "absolute",
                top: "58%",
                left: "50%",
                transform: `translate(-50%, -50%)`,
                opacity: detailAppear,
                display: "flex",
                gap: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  background: "#2d2d2d",
                  borderRadius: 16,
                  padding: "20px 40px",
                }}
              >
                <div style={{ fontFamily: uiFont, fontSize: 24, color: "#888" }}>
                  몫
                </div>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 64,
                    fontWeight: 900,
                    color: C_NUM,
                  }}
                >
                  3
                </div>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 22,
                    color: "#555",
                  }}
                >
                  11 / 3
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  background: `${C_REM}1a`,
                  border: `2px solid ${C_REM}66`,
                  borderRadius: 16,
                  padding: "20px 40px",
                }}
              >
                <div style={{ fontFamily: uiFont, fontSize: 24, color: C_REM }}>
                  나머지
                </div>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 64,
                    fontWeight: 900,
                    color: C_REM,
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 22,
                    color: C_REM,
                    opacity: 0.6,
                  }}
                >
                  11 % 3
                </div>
              </div>
            </div>
          )}

          {/* split1: 활용 예시 */}
          {frame >= split1 && (
            <div
              style={{
                position: "absolute",
                bottom: 230,
                left: "50%",
                transform: "translateX(-50%)",
                opacity: usageAppear,
                display: "flex",
                gap: 20,
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 28,
                background: "#2d2d2d",
                borderRadius: 12,
                padding: "14px 32px",
              }}
            >
              <span style={{ color: "#d4d4d4" }}>n</span>
              <span style={{ color: C_OP }}>%</span>
              <span style={{ color: C_INT }}>2</span>
              <span style={{ color: C_OP }}>==</span>
              <span style={{ color: C_INT }}>0</span>
              <span
                style={{
                  fontFamily: uiFont,
                  fontSize: 24,
                  color: "#666",
                  marginLeft: 4,
                }}
              >
                → 짝수
              </span>
              <span style={{ color: "#444", margin: "0 8px" }}>/</span>
              <span style={{ color: "#d4d4d4" }}>n</span>
              <span style={{ color: C_OP }}>%</span>
              <span style={{ color: C_INT }}>2</span>
              <span style={{ color: C_OP }}>==</span>
              <span style={{ color: C_INT }}>1</span>
              <span
                style={{
                  fontFamily: uiFont,
                  fontSize: 24,
                  color: "#666",
                  marginLeft: 4,
                }}
              >
                → 홀수
              </span>
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── 씬: SummaryScene ─────────────────────────────────────────
const SUMMARY_LINES = [
  "int a = 10, b = 3;",
  "int sum  = a + b;   // 13",
  "int diff = a - b;   //  7",
  "int prod = a * b;   // 30",
  "int quot = a / b;   //  3",
  "int rem  = a % b;   //  1",
];
const SUMMARY_CPS = 22;

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });

  const totalChars = SUMMARY_LINES.reduce((sum, l) => sum + l.length, 0);
  let cum = 0;
  const starts = SUMMARY_LINES.map((line) => {
    const start = Math.floor((cum / totalChars) * (d - CROSS));
    cum += line.length;
    return start;
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {starts.map((startFrom, i) => (
            <Sequence key={i} from={startFrom} durationInFrames={d - startFrom}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#2d2d2d",
                  borderRadius: 12,
                  padding: "36px 56px",
                  minWidth: 820,
                  fontFamily: monoFont,
                  fontFeatureSettings: MONO_NO_LIGA,
                  fontSize: 30,
                  lineHeight: 1.85,
                }}
              >
                {SUMMARY_LINES.slice(0, i + 1).map((text, j) =>
                  j < i ? (
                    <div key={j} style={{ opacity: 0.5, color: "#d4d4d4" }}>
                      <ColorizedCode text={text} />
                    </div>
                  ) : (
                    <TypingLine
                      key={j}
                      text={text}
                      startFrame={0}
                      cps={SUMMARY_CPS}
                    />
                  ),
                )}
              </div>
            </Sequence>
          ))}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
      />
    </>
  );
};

// ── 씬 목록 + fromValues ──────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.addSubScene,
  VIDEO_CONFIG.mulDivScene,
  VIDEO_CONFIG.remScene,
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
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaOperators: React.FC = () => (
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
      <IntroScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.addSubScene.durationInFrames}
    >
      <AddSubScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.mulDivScene.durationInFrames}
    >
      <MulDivScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.remScene.durationInFrames}
    >
      <RemScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaOperators;
