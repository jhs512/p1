// src/compositions/0002-JavaDataTypes.tsx
import {
  AbsoluteFill,
  Easing,
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
import { AUDIO_CONFIG } from "./002-3-audio.gen";
import { CONTENT } from "./002-2-content";
import { HEIGHT, WIDTH } from "./config";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_NUMBER,
  C_OPERATOR,
  C_STRING,
  C_TEAL,
  C_TYPE,
  TEXT,
} from "./colors";

// ── 상수 ─────────────────────────────────────────────────────
const typingDone = (chars: number, speechStart: number) =>
  speechStart + Math.ceil((chars / CHARS_PER_SEC) * 30);

const TYPE_COLORS: Record<string, string> = {
  int: C_TYPE,
  double: "#d4c04e",
  String: "#4ec970",
  boolean: C_OPERATOR,
};

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: {
    durationInFrames: 30,
  },
  intro: {
    audio: "dt-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  valueVsVar: {
    audio: "dt-value-vs-var.mp3",
    durationInFrames: AUDIO_CONFIG.valueVsVar.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.valueVsVar.speechStartFrame,
    narration: CONTENT.valueVsVar.narration as string[],
    narrationSplits: AUDIO_CONFIG.valueVsVar.narrationSplits,
  },
  intScene: {
    audio: "dt-int.mp3",
    durationInFrames: AUDIO_CONFIG.intScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intScene.speechStartFrame,
    narration: CONTENT.intScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.intScene.narrationSplits,
  },
  doubleScene: {
    audio: "dt-double.mp3",
    durationInFrames: AUDIO_CONFIG.doubleScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.doubleScene.speechStartFrame,
    narration: CONTENT.doubleScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.doubleScene.narrationSplits,
  },
  stringScene: {
    audio: "dt-string.mp3",
    durationInFrames: AUDIO_CONFIG.stringScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.stringScene.speechStartFrame,
    narration: CONTENT.stringScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.stringScene.narrationSplits,
  },
  booleanScene: {
    audio: "dt-boolean.mp3",
    durationInFrames: AUDIO_CONFIG.booleanScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.booleanScene.speechStartFrame,
    narration: CONTENT.booleanScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.booleanScene.narrationSplits,
  },
  summaryScene: {
    audio: "dt-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 컴포넌트: ColorizedCode ───────────────────────────────────
// 타입 키워드마다 고유 색상 (int=파랑, double=노랑, String=초록, boolean=주황)
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
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
            <span key={i} style={{ color: C_STRING }}>
              {part}
            </span>
          );
        if (/^\d/.test(part))
          return (
            <span key={i} style={{ color: C_NUMBER }}>
              {part}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

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

// ── 컴포넌트: CodeBox ─────────────────────────────────────────
const StaticLine: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ color: TEXT, lineHeight: "1.8" }}>
    <ColorizedCode text={text} />
  </div>
);

const TypingLine: React.FC<{
  text: string;
  startFrame: number;
  charsPerSecond: number;
}> = ({ text, startFrame, charsPerSecond }) => {
  const { visibleText } = useTypingEffect(text, startFrame, charsPerSecond);
  return (
    <div style={{ color: TEXT, lineHeight: "1.8" }}>
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
      background: BG_CODE,
      borderRadius: 12,
      padding: "40px 56px",
      minWidth: 780,
      fontFamily: monoFont,
      fontFeatureSettings: MONO_NO_LIGA,
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

// ── 컴포넌트: TypeBox ─────────────────────────────────────────
// 색상 상자 spring 등장 + 값 낙하 애니메이션 (단일 엘리먼트, 깜빡임 없음)
const TypeBox: React.FC<{
  color: string;
  value: string;
  label?: string;
  startFrame?: number;
  dropStartFrame?: number;
}> = ({ color, value, label, startFrame = 0, dropStartFrame = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 64,
              fontWeight: 700,
              color: TEXT,
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

// ── 컴포넌트: BooleanToggleAnim ───────────────────────────────
// boolean 씬 전용: true↔false 토글 (45프레임 = 1.5초 주기)
const BooleanToggleAnim: React.FC<{
  startFrame?: number;
  dropStartFrame?: number;
}> = ({ startFrame = 0, dropStartFrame = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const COLOR = TYPE_COLORS.boolean; // "#d4834e"

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

  const PERIOD = 45;
  const elapsed = Math.max(0, frame - dropStartFrame);
  const cycleFrame = elapsed % (PERIOD * 2);
  const showTrue = cycleFrame < PERIOD;
  const toggleColor = showTrue ? C_TEAL : "#f44747";
  const displayValue = showTrue ? "true" : "false";

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
            fontFeatureSettings: MONO_NO_LIGA,
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

// ── 씬: ThumbnailScene ───────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: BG_THUMB,
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
        color: C_TEAL,
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
      <span style={{ color: C_TEAL }}>자료형</span>
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 32,
        color: C_TEAL,
        letterSpacing: 4,
        opacity: 0.7,
      }}
    >
      int · double · String · boolean
    </div>
  </AbsoluteFill>
);

// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);
  const boxes = [
    { label: "int", color: TYPE_COLORS.int },
    { label: "double", color: TYPE_COLORS.double },
    { label: "String", color: TYPE_COLORS.String },
    { label: "boolean", color: TYPE_COLORS.boolean },
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(intro.audio)} />
          {/* 자료형 박스 4개 */}
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
              const wordTriggers = AUDIO_CONFIG.intro
                .wordStartFrames[1] as readonly number[];
              const triggerFrame = wordTriggers[i * 2] ?? i * 5;
              const appear = spring({
                frame: frame - triggerFrame,
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
                      fontFeatureSettings: MONO_NO_LIGA,
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
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={intro.narration}
        splits={intro.narrationSplits}
        speechStart={intro.speechStartFrame}
        wordFrames={AUDIO_CONFIG.intro.wordStartFrames}
      />
    </>
  );
};

// ── 씬: ValueVsVarScene ──────────────────────────────────────
const ValueVsVarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { valueVsVar } = VIDEO_CONFIG;
  const d = valueVsVar.durationInFrames;
  const s = valueVsVar.speechStartFrame;
  const splits = valueVsVar.narrationSplits;
  const split0 = splits[0] ?? 90;
  const split1 = splits[1] ?? 180;
  const COLOR = TYPE_COLORS.int;
  const opacity = useFade(d);

  // "int형 값" → 문장 2 첫 단어, "int형 변수" → 문장 3 첫 단어
  const valueWordFrame =
    AUDIO_CONFIG.valueVsVar.wordTiming["int형"][0] ?? split0;
  const varWordFrame = AUDIO_CONFIG.valueVsVar.wordTiming["int형"][1] ?? split1;

  const valueAppear = spring({
    frame: frame - valueWordFrame,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 30,
  });
  const valueScale = interpolate(valueAppear, [0, 1], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const varAppear = spring({
    frame: frame - varWordFrame,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 30,
  });
  const varScale = interpolate(varAppear, [0, 1], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowOp = interpolate(
    frame,
    [varWordFrame, varWordFrame + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(valueVsVar.audio)} />

          {/* 제목 */}
          <div
            style={{
              position: "absolute",
              top: 160,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: uiFont,
              fontSize: 34,
              color: "#666",
              letterSpacing: 4,
              whiteSpace: "nowrap",
            }}
          >
            값 (Value) vs 변수 (Variable)
          </div>

          {/* 두 패널 */}
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              gap: 60,
              alignItems: "center",
            }}
          >
            {/* 왼쪽: int형 값 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                opacity: valueAppear,
                transform: `scale(${valueScale})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#aaa",
                  letterSpacing: 2,
                }}
              >
                int형 값
              </div>
              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  border: `3px dashed ${COLOR}88`,
                  background: `${COLOR}0d`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 80,
                    fontWeight: 700,
                    color: COLOR,
                  }}
                >
                  25
                </span>
              </div>
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 24,
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                데이터 자체
              </div>
            </div>

            {/* 화살표 */}
            <div style={{ fontSize: 56, color: "#555", opacity: arrowOp }}>
              →
            </div>

            {/* 오른쪽: int형 변수 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                opacity: varAppear,
                transform: `scale(${varScale})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#aaa",
                  letterSpacing: 2,
                }}
              >
                int형 변수
              </div>
              <div
                style={{
                  width: 240,
                  height: 200,
                  borderRadius: 20,
                  border: `4px solid ${COLOR}`,
                  background: `${COLOR}1a`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  position: "relative",
                }}
              >
                {/* 타입 태그 */}
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    background: COLOR,
                    borderRadius: 6,
                    padding: "4px 16px",
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 22,
                    fontWeight: 700,
                    color: BG,
                  }}
                >
                  int
                </div>
                {/* 변수명 */}
                <div
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 28,
                    color: "#888",
                  }}
                >
                  age
                </div>
              </div>
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 24,
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                값을 담는 공간
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={valueVsVar.narration}
        splits={splits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.valueVsVar.wordStartFrames}
      />
    </>
  );
};

// ── 씬: TypeScene (int / double / String 공통) ─────────────────
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

const TypeScene: React.FC<{
  sceneKey: keyof typeof TYPE_SCENE_DATA;
  config: {
    audio: string;
    durationInFrames: number;
    speechStartFrame: number;
    narration: string[];
    narrationSplits: readonly number[];
  };
}> = ({ sceneKey, config }) => {
  const d = config.durationInFrames;
  const s = config.speechStartFrame;
  const { code, value, color, label } = TYPE_SCENE_DATA[sceneKey];

  const opacity = useFade(d);
  // TypeBox는 두 번째 문장 시작(narrationSplits[0]) 또는 타이핑 완료 시점에 드롭
  const dropStart = config.narrationSplits[0] ?? typingDone(code.length, s);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(config.audio)} />
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
              startFrame={s}
              dropStartFrame={dropStart}
            />
          </div>
          <CodeBox lines={[{ text: code, isNew: true }]} startFrame={s} />
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={config.narration}
        splits={config.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG[sceneKey].wordStartFrames}
      />
    </>
  );
};

// ── 씬: BooleanScene ──────────────────────────────────────────
const BooleanScene: React.FC = () => {
  const { booleanScene } = VIDEO_CONFIG;
  const d = booleanScene.durationInFrames;
  const s = booleanScene.speechStartFrame;
  const code = "boolean isStudent = true;";
  const opacity = useFade(d);
  const dropStart =
    booleanScene.narrationSplits[0] ?? typingDone(code.length, s);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(booleanScene.audio)} />
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <BooleanToggleAnim startFrame={s} dropStartFrame={dropStart} />
          </div>
          <CodeBox lines={[{ text: code, isNew: true }]} startFrame={s} />
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={booleanScene.narration}
        splits={booleanScene.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.booleanScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: SummaryScene ─────────────────────────────────────────
const SUMMARY_LINES = [
  "int age = 25;",
  "double height = 175.5;",
  'String name = "Java";',
  "boolean isStudent = true;",
];
const SUMMARY_CPS = 20; // 요약 씬은 빠르게 타이핑

const SummaryScene: React.FC = () => {
  const { summaryScene } = VIDEO_CONFIG;
  const d = summaryScene.durationInFrames;
  const opacity = useFade(d, { out: false });

  // 캐릭터 수 비례로 각 라인 시작 타이밍 계산
  const totalChars = SUMMARY_LINES.reduce((sum, l) => sum + l.length, 0);
  let cumChars = 0;
  const starts = SUMMARY_LINES.map((line) => {
    const start = Math.floor((cumChars / totalChars) * (d - CROSS));
    cumChars += line.length;
    return start;
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(summaryScene.audio)} />
          {starts.map((startFrom, i) => (
            <Sequence key={i} from={startFrom} durationInFrames={d - startFrom}>
              <CodeBox
                lines={SUMMARY_LINES.slice(0, i + 1).map((text, j) => ({
                  text,
                  isNew: j === i,
                }))}
                startFrame={0}
                charsPerSecond={SUMMARY_CPS}
              />
            </Sequence>
          ))}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={summaryScene.narration}
        splits={summaryScene.narrationSplits}
        speechStart={summaryScene.speechStartFrame}
        wordFrames={AUDIO_CONFIG.summaryScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬 목록 + fromValues 계산 ─────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.valueVsVar,
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

// ── SRT 데이터 (scripts/srt.ts 에서 사용) ────────────────────
/** 절대 프레임 기준 자막 큐 목록 — srt.ts가 읽어서 .srt 파일 생성 */
export const SRT_DATA: Array<{
  startFrame: number;
  endFrame: number;
  text: string;
}> = (() => {
  const CROSS_VAL = 20;
  const entries: Array<{ startFrame: number; endFrame: number; text: string }> =
    [];

  const addScene = (
    offset: number,
    narration: string[],
    speechStartFrame: number,
    narrationSplits: readonly number[],
    sentenceEndFrames: readonly number[],
    sceneDuration: number,
  ) => {
    const starts = [speechStartFrame, ...narrationSplits];
    const ends = [...sentenceEndFrames, sceneDuration];
    narration.forEach((text, i) => {
      const s = starts[i];
      const e = ends[i] ?? ends[ends.length - 1];
      if (s !== undefined && e !== undefined && e > s) {
        entries.push({
          startFrame: offset + s,
          endFrame: offset + e,
          text: toDisplayText(text).replace(/\n/g, " "),
        });
      }
    });
  };

  // fromValues 재계산
  const sceneDurations = sceneList.map((s) => s.durationInFrames);
  const froms: number[] = [];
  let _f = 0;
  for (let i = 0; i < sceneDurations.length; i++) {
    froms.push(_f);
    _f += sceneDurations[i] - (i < sceneDurations.length - 1 ? CROSS_VAL : 0);
  }

  // [0]=thumbnail: 나레이션 없음
  // [1]=intro
  addScene(
    froms[1],
    VIDEO_CONFIG.intro.narration,
    AUDIO_CONFIG.intro.speechStartFrame,
    AUDIO_CONFIG.intro.narrationSplits,
    AUDIO_CONFIG.intro.sentenceEndFrames,
    VIDEO_CONFIG.intro.durationInFrames,
  );
  // [2]=valueVsVar
  addScene(
    froms[2],
    VIDEO_CONFIG.valueVsVar.narration,
    AUDIO_CONFIG.valueVsVar.speechStartFrame,
    AUDIO_CONFIG.valueVsVar.narrationSplits,
    AUDIO_CONFIG.valueVsVar.sentenceEndFrames,
    VIDEO_CONFIG.valueVsVar.durationInFrames,
  );
  // [3]=intScene
  addScene(
    froms[3],
    VIDEO_CONFIG.intScene.narration,
    AUDIO_CONFIG.intScene.speechStartFrame,
    AUDIO_CONFIG.intScene.narrationSplits,
    AUDIO_CONFIG.intScene.sentenceEndFrames,
    VIDEO_CONFIG.intScene.durationInFrames,
  );
  // [4]=doubleScene
  addScene(
    froms[4],
    VIDEO_CONFIG.doubleScene.narration,
    AUDIO_CONFIG.doubleScene.speechStartFrame,
    AUDIO_CONFIG.doubleScene.narrationSplits,
    AUDIO_CONFIG.doubleScene.sentenceEndFrames,
    VIDEO_CONFIG.doubleScene.durationInFrames,
  );
  // [5]=stringScene
  addScene(
    froms[5],
    VIDEO_CONFIG.stringScene.narration,
    AUDIO_CONFIG.stringScene.speechStartFrame,
    AUDIO_CONFIG.stringScene.narrationSplits,
    AUDIO_CONFIG.stringScene.sentenceEndFrames,
    VIDEO_CONFIG.stringScene.durationInFrames,
  );
  // [6]=booleanScene
  addScene(
    froms[6],
    VIDEO_CONFIG.booleanScene.narration,
    AUDIO_CONFIG.booleanScene.speechStartFrame,
    AUDIO_CONFIG.booleanScene.narrationSplits,
    AUDIO_CONFIG.booleanScene.sentenceEndFrames,
    VIDEO_CONFIG.booleanScene.durationInFrames,
  );
  // [7]=summaryScene
  addScene(
    froms[7],
    VIDEO_CONFIG.summaryScene.narration,
    AUDIO_CONFIG.summaryScene.speechStartFrame,
    AUDIO_CONFIG.summaryScene.narrationSplits,
    AUDIO_CONFIG.summaryScene.sentenceEndFrames,
    VIDEO_CONFIG.summaryScene.durationInFrames,
  );

  return entries;
})();

// ── Composition 메타 ──────────────────────────────────────────
export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaDataTypes: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
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
      durationInFrames={VIDEO_CONFIG.valueVsVar.durationInFrames}
    >
      <ValueVsVarScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.intScene.durationInFrames}
    >
      <TypeScene sceneKey="intScene" config={VIDEO_CONFIG.intScene} />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.doubleScene.durationInFrames}
    >
      <TypeScene sceneKey="doubleScene" config={VIDEO_CONFIG.doubleScene} />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.stringScene.durationInFrames}
    >
      <TypeScene sceneKey="stringScene" config={VIDEO_CONFIG.stringScene} />
    </Sequence>
    <Sequence
      from={fromValues[6]}
      durationInFrames={VIDEO_CONFIG.booleanScene.durationInFrames}
    >
      <BooleanScene />
    </Sequence>
    <Sequence
      from={fromValues[7]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export { JavaDataTypes as Component };
