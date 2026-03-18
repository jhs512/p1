// src/compositions/001-Java-Basic/007-JavaWhile.tsx
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
import { AUDIO_CONFIG } from "./007-audio";
import {
  CROSS,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../utils/scene";

export { RATE, VOICE };

// ── 색상 상수 ─────────────────────────────────────────────────
const C_WHILE  = "#c586c0"; // while 키워드 — 보라
const C_COND   = "#e5c07b"; // 조건식 — amber
const C_TEAL   = "#4ec9b0"; // 카운터/증감/참 — teal
const C_RED    = "#f47c7c"; // 거짓/경고
const C_NUM    = "#b5cea8"; // 숫자 리터럴
const C_INT    = "#4e9cd5"; // int 키워드
const C_DIM    = "rgba(255,255,255,0.22)";

// C_RED는 이후 씬에서 사용됨 — 미사용 경고 억제
void [C_RED];

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  overview: {
    audio: "while-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: [
      "반복문에는 여러 종류가 있습니다.",
      "그 중 기본인 [while(발음:와일)] 문을 알아보겠습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "while-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "[while(발음:와일)] 문은 조건이 참인 동안 코드 블록을 반복 실행합니다.",
      "조건이 거짓이 되는 순간 반복을 멈춥니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  whileScene: {
    audio: "while-while.mp3",
    durationInFrames: AUDIO_CONFIG.whileScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.whileScene.speechStartFrame,
    narration: [
      "괄호 안 조건이 참이면 블록을 실행하고 다시 조건을 확인합니다.",
      "카운터를 증가시켜 조건을 변화시키고 반복이 끝나게 합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.whileScene.narrationSplits,
  },
  executionScene: {
    audio: "while-execution.mp3",
    durationInFrames: AUDIO_CONFIG.executionScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.executionScene.speechStartFrame,
    narration: [
      "count가 1일 때 조건이 참이므로 블록을 실행합니다.",
      "count가 6이 되면 조건이 거짓이 되어 반복이 종료됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.executionScene.narrationSplits,
  },
  infiniteScene: {
    audio: "while-infinite.mp3",
    durationInFrames: AUDIO_CONFIG.infiniteScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.infiniteScene.speechStartFrame,
    narration: [
      "탈출 조건이 없으면 무한루프가 됩니다.",
      "반드시 조건을 거짓으로 만드는 코드가 필요합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.infiniteScene.narrationSplits,
  },
  summaryScene: {
    audio: "while-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "[while(발음:와일)]은 조건이 참인 동안 반복합니다.",
      "조건이 거짓이 되면 멈춥니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 스텁 씬 컴포넌트 — 다음 태스크에서 완전히 구현 ───────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#050510", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
    {/* 배경 글로우 */}
    <div style={{
      position: "absolute", width: 860, height: 860, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(197,134,192,0.10) 0%, transparent 70%)",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }} />
    <div style={{ fontFamily: uiFont, fontSize: 26, fontWeight: 700, color: C_WHILE, letterSpacing: 10, opacity: 0.8 }}>JAVA</div>
    <div style={{
      fontFamily: uiFont, fontSize: 108, fontWeight: 900, lineHeight: 1,
      textAlign: "center", color: "#fff",
      textShadow: `0 0 60px rgba(197,134,192,0.6), 0 0 120px rgba(197,134,192,0.25)`,
    }}>
      Java<br /><span style={{ color: C_WHILE }}>반복문</span>
    </div>
    {/* while 키워드 */}
    <div style={{
      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
      fontSize: 64, fontWeight: 900, color: C_WHILE,
      background: `${C_WHILE}18`, border: `2px solid ${C_WHILE}55`,
      borderRadius: 18, padding: "18px 56px",
      marginTop: 8,
    }}>while</div>
  </AbsoluteFill>
);

const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { overview: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const phase2 = frame >= split0;

  const rootAppear  = spring({ frame: frame - s,      fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const leftAppear  = spring({ frame: frame - s - 10, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const rightAppear = spring({ frame: frame - s - 20, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const whileAppear = spring({ frame: frame - split0,  fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 22 });

  const C_LOOP_NODE = "#4ec9b0";
  const C_COND_NODE = "#c586c0";

  const nodeStyle = (color: string, active: boolean, appear: number): React.CSSProperties => {
    const sc = interpolate(appear, [0, 1], [0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      fontFamily: uiFont, fontSize: 34, fontWeight: 700,
      color: active ? color : C_DIM,
      background: active ? `${color}18` : "rgba(255,255,255,0.04)",
      border: `2px solid ${active ? color + "66" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 16, padding: "16px 36px",
      opacity: appear, transform: `scale(${sc})`,
      textAlign: "center" as const,
      ...(active && phase2 && color === C_LOOP_NODE ? { boxShadow: `0 0 28px ${color}44` } : {}),
    };
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {frame >= s && (
          <div style={{
            position: "absolute", top: "40%", left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            {/* 제어문 루트 */}
            <div style={nodeStyle("#9cdcfe", true, rootAppear)}>제어문</div>

            {/* 연결선 */}
            <div style={{ position: "relative", width: 440, height: 50, flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: 26, background: "rgba(255,255,255,0.18)", transform: "translateX(-50%)" }} />
              <div style={{ position: "absolute", top: 26, left: "20%", width: "60%", height: 2, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", top: 26, left: "20%", width: 2, height: 24, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", top: 26, right: "20%", width: 2, height: 24, background: "rgba(255,255,255,0.18)" }} />
            </div>

            {/* 조건문(dim) / 반복문(하이라이트) */}
            <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
              {/* 조건문 — dim */}
              <div style={nodeStyle(C_COND_NODE, false, leftAppear)}>조건문</div>

              {/* 반복문 + while 팝업 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                <div style={nodeStyle(C_LOOP_NODE, true, rightAppear)}>반복문</div>
                {phase2 && (
                  <>
                    <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.18)", opacity: whileAppear, flexShrink: 0 }} />
                    <div style={{
                      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 52, fontWeight: 900, color: C_WHILE,
                      background: `${C_WHILE}18`, border: `2px solid ${C_WHILE}55`,
                      borderRadius: 18, padding: "14px 44px",
                      opacity: whileAppear,
                      transform: `scale(${interpolate(whileAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                      boxShadow: `0 0 32px ${C_WHILE}33`,
                    }}>while</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro: cfg } = VIDEO_CONFIG;
  const opacity = useFade(cfg.durationInFrames);

  const blockAppear = spring({ frame, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 28 });
  const sc = interpolate(blockAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        <div style={{
          position: "absolute", top: "44%", left: "50%",
          transform: `translate(-50%, -50%) scale(${sc})`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          opacity: blockAppear,
        }}>
          {/* while (조건) { */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 42, background: "#252525", borderRadius: "16px 16px 0 0",
            padding: "28px 52px 16px",
            border: "2px solid #3a3a3a", borderBottom: "none",
          }}>
            <span style={{ color: C_WHILE, fontWeight: 900 }}>while</span>
            <span style={{ color: "#d4d4d4" }}> (</span>
            <span style={{ color: C_COND }}>조건</span>
            <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
          </div>
          {/* 실행코드 */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 38, background: "#252525",
            padding: "16px 52px 16px 88px",
            border: "2px solid #3a3a3a", borderTop: "none", borderBottom: "none",
            color: "#888", fontStyle: "italic",
          }}>
            실행코드
          </div>
          {/* } */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 42, background: "#252525", borderRadius: "0 0 16px 16px",
            padding: "16px 52px 28px",
            border: "2px solid #3a3a3a", borderTop: "none",
            color: C_DIM,
          }}>{"}"}</div>
        </div>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} />
    </>
  );
};

// ── 코드 라인 데이터 ──────────────────────────────────────────
const CODE_LINES = [
  { parts: [
    { text: "int",      color: C_INT },
    { text: " count = ", color: "#d4d4d4" },
    { text: "1",        color: C_NUM },
    { text: ";",        color: "#d4d4d4" },
  ]},
  { parts: [
    { text: "while",    color: C_WHILE, bold: true },
    { text: " (",       color: "#d4d4d4" },
    { text: "count <= 5", color: C_COND },
    { text: ") {",      color: "#d4d4d4" },
  ]},
  { parts: [
    { text: "    System", color: C_INT },
    { text: ".out.",    color: "#d4d4d4" },
    { text: "println",  color: "#dcdcaa" },
    { text: "(",        color: "#d4d4d4" },
    { text: "count",    color: "#d4d4d4" },
    { text: ");",       color: "#d4d4d4" },
  ]},
  { parts: [
    { text: "    count++", color: C_TEAL },
    { text: ";",        color: "#d4d4d4" },
  ]},
  { parts: [
    { text: "}",        color: "#d4d4d4" },
  ]},
] as const;

const FULL_CODE = CODE_LINES.map(l => l.parts.map(p => p.text).join("")).join("\n");
const TOTAL_CHARS = FULL_CODE.length;
const WHILE_CHARS_PER_SEC = 10;

const WhileScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { whileScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  // 타이핑 애니메이션
  const charsVisible = Math.min(
    TOTAL_CHARS,
    Math.max(0, ((frame - s) / fps) * WHILE_CHARS_PER_SEC),
  );

  let remaining = Math.floor(charsVisible);
  const lineVisibility = CODE_LINES.map(line => {
    const lineLen = line.parts.reduce((acc, p) => acc + p.text.length, 0);
    const show = Math.min(lineLen, remaining);
    remaining = Math.max(0, remaining - lineLen);
    return show;
  });

  const blockAppear = spring({ frame: frame - s, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 24 });
  const sc = interpolate(blockAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        {frame >= s && (
          <div style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(-50%, -50%) scale(${sc})`,
          }}>
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 34, lineHeight: 1.95,
              background: "#252525", borderRadius: 20,
              padding: "32px 48px",
              opacity: blockAppear,
              width: 860, boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
            }}>
              {CODE_LINES.map((line, lineIdx) => {
                const showChars = lineVisibility[lineIdx];
                const isCountPlusPlus = lineIdx === 3 && frame >= split0;
                let rem = showChars;
                return (
                  <div key={lineIdx} style={{ lineHeight: 1.95 }}>
                    {line.parts.map((part, pi) => {
                      const show = Math.min(part.text.length, rem);
                      rem = Math.max(0, rem - part.text.length);
                      if (show <= 0) return null;
                      const highlighted = isCountPlusPlus && pi === 0;
                      return (
                        <span key={pi} style={{
                          color: highlighted ? C_TEAL : part.color,
                          fontWeight: (part as { bold?: boolean }).bold ? 900 : undefined,
                          background: highlighted ? `${C_TEAL}18` : undefined,
                          borderRadius: highlighted ? 4 : undefined,
                          padding: highlighted ? "0 4px" : undefined,
                        }}>
                          {part.text.slice(0, show)}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

const ExecutionScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.executionScene.audio)} />
  </AbsoluteFill>
);

const InfiniteScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.infiniteScene.audio)} />
  </AbsoluteFill>
);

const SummaryScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.summaryScene.audio)} />
  </AbsoluteFill>
);

// ── sceneList + fromValues ────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.overview,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.whileScene,
  VIDEO_CONFIG.executionScene,
  VIDEO_CONFIG.infiniteScene,
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
export const JavaWhile: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={fromValues[0]} durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.overview.durationInFrames}>
      <OverviewScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.whileScene.durationInFrames}>
      <WhileScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.executionScene.durationInFrames}>
      <ExecutionScene />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={VIDEO_CONFIG.infiniteScene.durationInFrames}>
      <InfiniteScene />
    </Sequence>
    <Sequence from={fromValues[6]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaWhile;
