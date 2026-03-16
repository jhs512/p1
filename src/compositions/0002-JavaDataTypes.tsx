// src/compositions/0002-JavaDataTypes.tsx
import React from "react";
import {
  AbsoluteFill,
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
import { Audio } from "@remotion/media";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";
import { VOICE, RATE, PRONUNCIATION, SCENE_TAIL_FRAMES } from "../global.config";
import { AUDIO_CONFIG } from "./0002-audio";

// sync.ts 가 이 파일을 esbuild 로 로드할 때 사용
export { VOICE, RATE, PRONUNCIATION };

// ── 상수 ─────────────────────────────────────────────────────
const CROSS = 20;
const TYPING_START = 20;
const CHARS_PER_SEC = 10;

const typingDone = (chars: number) =>
  TYPING_START + Math.ceil((chars / CHARS_PER_SEC) * 30);

const TYPE_COLORS: Record<string, string> = {
  int:     "#4e9cd5",
  double:  "#d4c04e",
  String:  "#4ec970",
  boolean: "#d4834e",
};

// ── 폰트 ─────────────────────────────────────────────────────
let monoFont = "JetBrains Mono, monospace";
let uiFont   = "Noto Sans KR, sans-serif";

if (typeof window !== "undefined") {
  const _jb = loadJetBrains();
  const _ns = loadNotoSans();
  monoFont = _jb.fontFamily;
  uiFont   = _ns.fontFamily;
  const _h = delayRender("Loading Google Fonts");
  Promise.all([_jb.waitUntilDone(), _ns.waitUntilDone()]).then(() =>
    continueRender(_h)
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

// ── 컴포넌트: ColorizedCode ───────────────────────────────────
// 타입 키워드마다 고유 색상 (int=파랑, double=노랑, String=초록, boolean=주황)
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(
    /(\bdouble\b|\bint\b|\bString\b|\bboolean\b|"[^"]*"|\b\d+(?:\.\d+)?\b)/g
  );
  return (
    <>
      {parts.map((part, i) => {
        if (TYPE_COLORS[part])
          return <span key={i} style={{ color: TYPE_COLORS[part] }}>{part}</span>;
        if (/^"/.test(part))
          return <span key={i} style={{ color: "#ce9178" }}>{part}</span>;
        if (/^\d/.test(part))
          return <span key={i} style={{ color: "#b5cea8" }}>{part}</span>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// ── 훅: 타이핑 이펙트 ─────────────────────────────────────────
function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = 10
): { visibleText: string; isDone: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsVisible = Math.floor(
    (Math.max(0, frame - startFrame) / fps) * charsPerSecond
  );
  return {
    visibleText: text.slice(0, charsVisible),
    isDone: charsVisible >= text.length,
  };
}

// ── 컴포넌트: SceneTitle ──────────────────────────────────────
const SceneTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{
    position: "absolute", top: 160, left: 0, right: 0,
    textAlign: "center", fontFamily: uiFont, fontSize: 42,
    fontWeight: 700, color: "#ffffff", letterSpacing: 1,
  }}>
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
  <div style={{
    position: "absolute", top: "57%", left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#2d2d2d", borderRadius: 12,
    padding: "40px 56px", minWidth: 780,
    fontFamily: monoFont, fontSize: 36,
  }}>
    {lines.map((line, i) =>
      line.isNew ? (
        <TypingLine key={`new-${i}`} text={line.text} startFrame={startFrame} charsPerSecond={charsPerSecond} />
      ) : (
        <StaticLine key={`static-${i}`} text={line.text} />
      )
    )}
  </div>
);

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
      const end   = i < splits.length ? splits[i] : durationInFrames;
      return { start, end };
    }
    const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
    let cumulative = 0;
    sentences.slice(0, i).forEach((s) => { cumulative += s.length; });
    const start = Math.floor((cumulative / totalChars) * durationInFrames);
    cumulative += sentences[i].length;
    const end   = Math.floor((cumulative / totalChars) * durationInFrames);
    return { start, end };
  });
  const idx = ranges.findIndex(({ start, end }) => frame >= start && frame < end);
  const currentIdx = idx === -1 ? sentences.length - 1 : idx;
  const { start } = ranges[currentIdx];
  const opacity = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", bottom: 100, left: "50%",
      transform: "translateX(-50%)", textAlign: "center",
      fontFamily: uiFont, fontSize: 32, color: "#ffffff",
      opacity, background: "rgba(0,0,0,0.55)",
      borderRadius: 6, padding: "8px 16px", lineHeight: 1.6,
      width: "max-content", maxWidth: compositionWidth - 20,
      wordBreak: "keep-all", whiteSpace: "pre-line",
    }}>
      {sentences[currentIdx]}
    </div>
  );
};

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
    frame: boxE, fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 35,
  });
  const boxScale = interpolate(boxAppear, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const dropE = frame - dropStartFrame;
  const DROP_FRAMES = 30;
  const dropY = interpolate(dropE, [0, DROP_FRAMES], [-140, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const dropO = interpolate(dropE, [0, 4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const dropGlow = interpolate(
    dropE,
    [DROP_FRAMES - 2, DROP_FRAMES + 2, DROP_FRAMES + 14],
    [0, 1, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (boxE < 0) return null;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 12,
      transform: `scale(${boxScale})`, opacity: boxAppear,
    }}>
      {label && (
        <div style={{
          fontFamily: uiFont, fontSize: 38, fontWeight: 700,
          color, letterSpacing: 4,
        }}>
          {label}
        </div>
      )}
      <div style={{
        position: "relative",
        border: `4px solid ${color}`,
        borderRadius: 20, width: 260, height: 180,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}1a`,
        boxShadow: dropGlow > 0.05
          ? `0 0 ${Math.round(dropGlow * 50)}px ${color}`
          : "none",
      }}>
        {dropE >= 0 && (
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: `translateX(-50%) translateY(calc(-50% + ${dropY}px))`,
            fontFamily: monoFont, fontSize: 64, fontWeight: 700,
            color: "#d4d4d4", opacity: dropO,
          }}>
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
    frame: boxE, fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 35,
  });
  const boxScale = interpolate(boxAppear, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const PERIOD = 45;
  const elapsed = Math.max(0, frame - dropStartFrame);
  const cycleFrame = elapsed % (PERIOD * 2);
  const showTrue = cycleFrame < PERIOD;
  const toggleColor = showTrue ? "#4ec9b0" : "#f44747";
  const displayValue = showTrue ? "true" : "false";

  const valueOpacity = interpolate(frame - dropStartFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (boxE < 0) return null;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 12,
      transform: `scale(${boxScale})`, opacity: boxAppear,
    }}>
      <div style={{
        fontFamily: uiFont, fontSize: 38, fontWeight: 700,
        color: COLOR, letterSpacing: 4,
      }}>
        boolean
      </div>
      <div style={{
        position: "relative",
        border: `4px solid ${COLOR}`,
        borderRadius: 20, width: 260, height: 180,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${COLOR}1a`,
      }}>
        <span style={{
          fontFamily: monoFont, fontSize: 56, fontWeight: 700,
          color: toggleColor, opacity: valueOpacity,
        }}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};

// ── 씬: ThumbnailScene ───────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill style={{
    background: "#050510",
    alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: 24,
  }}>
    <div style={{
      position: "absolute", width: 900, height: 900, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(78,201,176,0.12) 0%, transparent 70%)",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }} />
    <div style={{
      fontFamily: uiFont, fontSize: 28, fontWeight: 700,
      color: "#4ec9b0", letterSpacing: 10, opacity: 0.8,
    }}>
      JAVA
    </div>
    <div style={{
      fontFamily: uiFont, fontSize: 140, fontWeight: 900,
      lineHeight: 1, textAlign: "center", color: "#ffffff",
      textShadow: "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
    }}>
      Java<br /><span style={{ color: "#4ec9b0" }}>자료형</span>
    </div>
    <div style={{
      fontFamily: uiFont, fontSize: 32, color: "#4ec9b0",
      letterSpacing: 4, opacity: 0.7,
    }}>
      int · double · String · boolean
    </div>
  </AbsoluteFill>
);

// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const d = intro.durationInFrames;
  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const boxes = [
    { label: "int",     color: TYPE_COLORS.int },
    { label: "double",  color: TYPE_COLORS.double },
    { label: "String",  color: TYPE_COLORS.String },
    { label: "boolean", color: TYPE_COLORS.boolean },
  ];

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(intro.audio)} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28,
      }}>
        {boxes.map(({ label, color }, i) => {
          const delay = i * 5;
          const appear = spring({
            frame: frame - delay, fps,
            config: { damping: 14, stiffness: 140 },
            durationInFrames: 35,
          });
          const boxScale = interpolate(appear, [0, 1], [0.2, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={label} style={{
              transform: `scale(${boxScale})`, opacity: appear,
              border: `4px solid ${color}`, borderRadius: 20,
              width: 220, height: 150,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${color}1a`,
            }}>
              <span style={{
                fontFamily: monoFont, fontSize: 38,
                fontWeight: 700, color,
              }}>
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
  config: { audio: string; durationInFrames: number; narration: string[]; narrationSplits: readonly number[] };
}> = ({ sceneKey, config }) => {
  const frame = useCurrentFrame();
  const d = config.durationInFrames;
  const { code, value, color, label } = TYPE_SCENE_DATA[sceneKey];

  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dropStart = typingDone(code.length);

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(config.audio)} />
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
      }}>
        <TypeBox
          color={color}
          value={value}
          label={label}
          startFrame={10}
          dropStartFrame={dropStart}
        />
      </div>
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

// ── 씬: BooleanScene ──────────────────────────────────────────
const BooleanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { booleanScene } = VIDEO_CONFIG;
  const d = booleanScene.durationInFrames;
  const code = "boolean isStudent = true;";
  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dropStart = typingDone(code.length);

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(booleanScene.audio)} />
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
      }}>
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
  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const quarter = Math.floor(d / 4);
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
  id: "1/0002",
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaDataTypes: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={fromValues[0]} durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.intScene.durationInFrames}>
      <TypeScene sceneKey="intScene" config={VIDEO_CONFIG.intScene} />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.doubleScene.durationInFrames}>
      <TypeScene sceneKey="doubleScene" config={VIDEO_CONFIG.doubleScene} />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.stringScene.durationInFrames}>
      <TypeScene sceneKey="stringScene" config={VIDEO_CONFIG.stringScene} />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={VIDEO_CONFIG.booleanScene.durationInFrames}>
      <BooleanScene />
    </Sequence>
    <Sequence from={fromValues[6]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export { JavaDataTypes as Component };
