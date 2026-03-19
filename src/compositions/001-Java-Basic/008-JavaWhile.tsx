// src/compositions/001-Java-Basic/008-JavaWhile.tsx
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
import { RATE, SCENE_TAIL_FRAMES, VOICE } from "../../global.config";
import { AUDIO_CONFIG } from "./008-audio";
import { SERIES_WIDTH, SERIES_HEIGHT, SERIES_FPS } from "./series.config";
import {
  CROSS,
  ContentArea,
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


// ── WhileScene 타이핑 애니메이션 완료 프레임 ─────────────────────
// CODE_LINES 전체 글자(77자) + 줄바꿈(4자) = 81자, 10자/초, 30fps
// durationInFrames = max(오디오, 타이핑완료 + CROSS + SCENE_TAIL_FRAMES)
const WHILE_TYPING_CHARS = 81; // FULL_CODE.length
const WHILE_CHARS_PER_SEC_CONST = 10;
const WHILE_TYPING_END =
  AUDIO_CONFIG.whileScene.speechStartFrame +
  Math.ceil((WHILE_TYPING_CHARS / WHILE_CHARS_PER_SEC_CONST) * 30);
const WHILE_SCENE_DURATION = Math.max(
  AUDIO_CONFIG.whileScene.durationInFrames,
  WHILE_TYPING_END + CROSS + SCENE_TAIL_FRAMES,
);

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
      "[while(발음:와일)] 문은 조건이 참인 동안\n코드 블록을 반복 실행합니다.",
      "조건이 거짓이 되는 순간 반복을 멈춥니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  whileScene: {
    audio: "while-while.mp3",
    durationInFrames: WHILE_SCENE_DURATION,
    speechStartFrame: AUDIO_CONFIG.whileScene.speechStartFrame,
    narration: [
      "괄호 안 조건이 참이면 블록을 실행하고\n다시 조건을 확인합니다.",
      "카운터를 증가시켜 조건을 변화시키고\n반복이 끝나게 합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.whileScene.narrationSplits,
  },
  executionScene: {
    audio: "while-execution.mp3",
    durationInFrames: AUDIO_CONFIG.executionScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.executionScene.speechStartFrame,
    narration: [
      "카운트가 1일 때, 조건이 참이므로\n블록을 실행하고 1을 출력합니다.",
      "카운트가 2일 때도 조건이 참이므로\n다시 실행합니다.",
      "카운트가 3일 때도 조건은 여전히 참입니다.",
      "카운트가 4일 때도 마찬가지입니다.",
      "카운트가 5일 때,\n조건이 참인 마지막 실행입니다.",
      "카운트가 6이 되면 조건이 거짓이 되어\n반복이 종료됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.executionScene.narrationSplits,
  },
  infiniteScene: {
    audio: "while-infinite.mp3",
    durationInFrames: AUDIO_CONFIG.infiniteScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.infiniteScene.speechStartFrame,
    narration: [
      "탈출 조건이 없으면 무한루프가 됩니다.",
      "반드시 조건을 거짓으로 만드는\n코드가 필요합니다.",
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
      background: "radial-gradient(circle, rgba(78,201,176,0.12) 0%, transparent 70%)",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }} />
    <div style={{ fontFamily: uiFont, fontSize: 26, fontWeight: 700, color: "#4ec9b0", letterSpacing: 10, opacity: 0.8 }}>JAVA</div>
    <div style={{
      fontFamily: uiFont, fontSize: 108, fontWeight: 900, lineHeight: 1,
      textAlign: "center", color: "#fff",
      textShadow: "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
    }}>
      Java<br /><span style={{ color: "#4ec9b0" }}>반복문</span>
    </div>
    {/* while 키워드 */}
    <div style={{
      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
      fontSize: 64, fontWeight: 900, color: "#4ec9b0",
      background: "#4ec9b018", border: "2px solid #4ec9b055",
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
        <ContentArea>
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
        </ContentArea>
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
        <ContentArea>
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
              <span style={{ color: C_COND, fontWeight: 900 }}>조건</span>
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
              color: "#d4d4d4",
            }}>{"}"}</div>
          </div>
        </ContentArea>
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
const TOTAL_CHARS = FULL_CODE.length; // = WHILE_TYPING_CHARS (81)

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
    Math.max(0, ((frame - s) / fps) * WHILE_CHARS_PER_SEC_CONST),
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
        <ContentArea>
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
                whiteSpace: "pre",
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
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

const EXEC_STEPS = [
  { count: 1, condPass: true,  output: ["1"] },
  { count: 2, condPass: true,  output: ["1", "2"] },
  { count: 3, condPass: true,  output: ["1", "2", "3"] },
  { count: 4, condPass: true,  output: ["1", "2", "3", "4"] },
  { count: 5, condPass: true,  output: ["1", "2", "3", "4", "5"] },
  { count: 6, condPass: false, output: ["1", "2", "3", "4", "5"] },
] as const;

const ExecutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { executionScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const opacity = useFade(d);

  // Step timing: 각 narration 문장 = 각 반복 1단계 (0~5)
  const splits = cfg.narrationSplits as readonly number[];
  let stepIdx = 0;
  if (frame >= s) {
    stepIdx = splits.length; // 기본: 마지막 단계
    for (let i = 0; i < splits.length; i++) {
      if (frame < splits[i]) { stepIdx = i; break; }
    }
  }

  const step = EXEC_STEPS[stepIdx];

  // count 숫자 spring — 단계 전환마다 bounce
  const stepStartFrame = stepIdx === 0 ? s : splits[stepIdx - 1];
  const countSpring = spring({
    frame: frame - stepStartFrame,
    fps,
    config: { damping: 14, stiffness: 180 },
    durationInFrames: 18,
  });

  // condPass=false(count=6)일 때만 조건 줄 강조
  const activeLineIsCondition = !step.condPass;

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          {frame >= s && (
            <div style={{
              position: "absolute", top: "48%", left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", gap: 24,
              width: 920,
            }}>
              {/* 상단: 코드 패널 */}
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 28, lineHeight: 2.0,
              background: "#252525", borderRadius: 16,
              padding: "20px 8px",
            }}>
              {/* int count = 1; — 모든 줄에 동일한 borderLeft(transparent) + paddingLeft 적용으로 인덴트 통일 */}
              <div style={{ borderLeft: "3px solid transparent", paddingLeft: 16, color: "#d4d4d4" }}>
                <span style={{ color: C_INT }}>int</span>
                <span> count = </span>
                <span style={{ color: C_NUM }}>1</span>
                <span>;</span>
              </div>
              {/* while 조건 줄 */}
              <div style={{
                borderLeft: activeLineIsCondition ? `3px solid ${C_COND}` : "3px solid transparent",
                paddingLeft: 16,
                background: activeLineIsCondition ? `${C_COND}22` : "transparent",
                borderRadius: "0 6px 6px 0",
              }}>
                <span style={{ color: C_WHILE, fontWeight: 900 }}>while</span>
                <span style={{ color: "#d4d4d4" }}> (</span>
                <span style={{ color: C_COND }}>count {"<="} 5</span>
                <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
              </div>
              {/* println 줄 — 인덴트: 16(base) + 40(indent) = 56 */}
              <div style={{
                borderLeft: !activeLineIsCondition && step.condPass ? `3px solid ${C_TEAL}` : "3px solid transparent",
                paddingLeft: 56,
                background: !activeLineIsCondition && step.condPass ? `${C_TEAL}18` : "transparent",
                borderRadius: "0 6px 6px 0",
              }}>
                <span style={{ color: C_INT }}>System</span>
                <span style={{ color: "#d4d4d4" }}>.out.</span>
                <span style={{ color: "#dcdcaa" }}>println</span>
                <span style={{ color: "#d4d4d4" }}>(count);</span>
              </div>
              {/* count++ */}
              <div style={{ borderLeft: "3px solid transparent", paddingLeft: 56, color: C_TEAL }}>count++;</div>
              {/* } */}
              <div style={{ borderLeft: "3px solid transparent", paddingLeft: 16, color: "#d4d4d4" }}>{"}"}</div>
            </div>

            {/* 하단: 상태 패널 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* count 박스 */}
              <div style={{
                background: "#2a2a2a", borderRadius: 16,
                padding: "20px 32px",
                border: `2px solid ${step.condPass ? C_TEAL : C_RED}55`,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <span style={{ fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA, color: "#d4d4d4", fontSize: 28 }}>count =</span>
                <span style={{
                  fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                  color: step.condPass ? C_TEAL : C_RED,
                  fontSize: 52, fontWeight: 900,
                  display: "inline-block",
                  transform: `scale(${interpolate(countSpring, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}>{step.count}</span>
              </div>

              {/* 조건 배지 */}
              <div style={{
                background: step.condPass ? `${C_TEAL}18` : `${C_RED}18`,
                border: `2px solid ${step.condPass ? C_TEAL : C_RED}66`,
                borderRadius: 14, padding: "14px 28px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA, color: C_COND, fontSize: 24 }}>count {"<="} 5</span>
                <span style={{ fontSize: 30 }}>{step.condPass ? "✓" : "✗"}</span>
                <span style={{ fontFamily: uiFont, fontSize: 24, color: step.condPass ? C_TEAL : C_RED, fontWeight: 700 }}>
                  {step.condPass ? "참" : "거짓"}
                </span>
              </div>

              {/* 출력 로그 */}
              <div style={{
                background: "#252525", borderRadius: 14,
                padding: "16px 28px",
                fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 26,
              }}>
                <div style={{ color: "#888", fontSize: 18, marginBottom: 8, fontFamily: uiFont }}>출력</div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {(step.output as readonly string[]).map((n, i) => (
                    <span key={i} style={{ color: C_NUM }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

const InfiniteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { infiniteScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Math.floor(d / 2)] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const blockAppear = spring({ frame: frame - s, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 24 });
  const warnAppear  = spring({ frame: frame - split0, fps, config: { damping: 10, stiffness: 160 }, durationInFrames: 20 });
  const infAppear   = spring({ frame: frame - split0 - 10, fps, config: { damping: 12, stiffness: 140 }, durationInFrames: 22 });

  // 펄싱 — interpolate 패턴 (CSS animation 금지)
  const pulse = Math.abs(Math.sin(frame * 0.1));
  const borderOpacity = interpolate(pulse, [0, 1], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowSize = interpolate(pulse, [0, 1], [8, 28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const phase2 = frame >= split0;

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          {frame >= s && (
            <div style={{
              position: "absolute", top: "45%", left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
            }}>
              {/* 코드 블록 — 펄싱 빨간 테두리 */}
              <div style={{
                fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 32, lineHeight: 1.95,
                background: "#252525", borderRadius: 20,
                padding: "32px 48px",
                opacity: blockAppear,
                border: `2px solid rgba(244, 124, 124, ${borderOpacity})`,
                boxShadow: `0 0 ${glowSize}px rgba(244,124,124,0.35)`,
                width: 820,
              }}>
                <div>
                  <span style={{ color: C_INT }}>int</span>
                  <span style={{ color: "#d4d4d4" }}> count = </span>
                  <span style={{ color: C_NUM }}>1</span>
                  <span style={{ color: "#d4d4d4" }}>;</span>
                </div>
                <div>
                  <span style={{ color: C_WHILE, fontWeight: 900 }}>while</span>
                  <span style={{ color: "#d4d4d4" }}> (</span>
                  <span style={{ color: C_COND }}>count {"<="} 5</span>
                  <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
                </div>
                <div style={{ paddingLeft: 40 }}>
                  <span style={{ color: C_INT }}>System</span>
                  <span style={{ color: "#d4d4d4" }}>.out.</span>
                  <span style={{ color: "#dcdcaa" }}>println</span>
                  <span style={{ color: "#d4d4d4" }}>(count);</span>
                </div>
                {/* count++ 없는 자리 — 빨간 취소선 강조 */}
                <div style={{ paddingLeft: 40 }}>
                  <span style={{ color: C_RED, fontSize: 26, opacity: 0.75, textDecoration: "line-through" }}>
                    {"// count++ 없음!"}
                  </span>
                </div>
                <div><span style={{ color: "#d4d4d4" }}>{"}"}</span></div>
              </div>

              {/* phase2: ⚠️ + ∞ 무한루프 */}
              {phase2 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  opacity: warnAppear,
                  transform: `scale(${interpolate(warnAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}>
                  <span style={{ fontSize: 48 }}>⚠️</span>
                  <span style={{
                    fontFamily: uiFont, fontSize: 40, fontWeight: 900,
                    color: C_RED,
                    opacity: infAppear,
                  }}>∞ 무한루프</span>
                </div>
              )}
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

const SUMMARY_ROWS = [
  { label: "조건 참",  color: C_TEAL, desc: "블록 실행 후 조건 재확인" },
  { label: "조건 거짓", color: C_RED,  desc: "반복 종료" },
] as const;

const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false }); // 마지막 씬 — fadeOut 없음

  const codeAppear = spring({ frame, fps, config: { damping: 13, stiffness: 130 }, durationInFrames: 26 });
  const codeSc = interpolate(codeAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", gap: 24, width: 880,
          }}>
            {/* while 코드 정적 표시 */}
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 28, lineHeight: 1.9,
              background: "#252525", borderRadius: 16,
              padding: "24px 40px",
              opacity: codeAppear, transform: `scale(${codeSc})`,
            }}>
              <div><span style={{ color: C_INT }}>int</span><span style={{ color: "#d4d4d4" }}> count = </span><span style={{ color: C_NUM }}>1</span><span style={{ color: "#d4d4d4" }}>;</span></div>
              <div><span style={{ color: C_WHILE, fontWeight: 900 }}>while</span><span style={{ color: "#d4d4d4" }}> (</span><span style={{ color: C_COND }}>count {"<="} 5</span><span style={{ color: "#d4d4d4" }}>) {"{"}</span></div>
              <div style={{ paddingLeft: 56 }}><span style={{ color: C_INT }}>System</span><span style={{ color: "#d4d4d4" }}>.out.</span><span style={{ color: "#dcdcaa" }}>println</span><span style={{ color: "#d4d4d4" }}>(count);</span></div>
              <div style={{ paddingLeft: 56 }}><span style={{ color: C_TEAL }}>count++</span><span style={{ color: "#d4d4d4" }}>;</span></div>
              <div><span style={{ color: "#d4d4d4" }}>{"}"}</span></div>
            </div>

            {/* 요약 카드 */}
            {SUMMARY_ROWS.map((row, i) => {
              const appear = spring({ frame: frame - (i + 1) * 14, fps, config: { damping: 13, stiffness: 140 }, durationInFrames: 26 });
              const sc = interpolate(appear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 24,
                  background: "#2a2a2a", border: `2px solid ${row.color}55`,
                  borderRadius: 18, padding: "22px 36px",
                  opacity: appear, transform: `scale(${sc})`,
                }}>
                  <span style={{ fontFamily: uiFont, fontSize: 30, fontWeight: 900, color: row.color, minWidth: 110 }}>
                    {row.label}
                  </span>
                  <span style={{ color: "#3a3a3a", fontSize: 26 }}>—</span>
                  <span style={{ fontFamily: uiFont, fontSize: 28, color: "#d4d4d4" }}>{row.desc}</span>
                </div>
              );
            })}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} />
    </>
  );
};

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
  fps: SERIES_FPS,
  width: SERIES_WIDTH,
  height: SERIES_HEIGHT,
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
