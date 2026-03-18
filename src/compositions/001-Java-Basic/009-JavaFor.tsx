// src/compositions/001-Java-Basic/009-JavaFor.tsx
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
import { AUDIO_CONFIG } from "./009-audio";
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
const C_FOR  = "#4ec9b0"; // for 키워드 — teal
const C_INIT = "#4e9cd5"; // 초기식 (int i = 0) — blue
const C_COND = "#e5c07b"; // 조건식 — amber
const C_INC  = "#c586c0"; // 증감식 — purple
const C_NUM  = "#b5cea8"; // 숫자 리터럴
const C_DIM  = "rgba(255,255,255,0.22)";
const C_RED  = "#f47c7c"; // 거짓/경고

// ── ForScene: 순차 등장 애니메이션 (init→cond→body→inc) ──────
const FOR_SCENE_DURATION = AUDIO_CONFIG.forScene.durationInFrames;

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  overview: {
    audio: "for-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: [
      "반복문에는 여러 종류가 있습니다.",
      "이번엔 [for(발음:포)] 문을 알아보겠습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "for-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "[for(발음:포)] 문은 초기식, 조건식, 증감식을 한 줄에 씁니다.",
      "조건이 참인 동안 블록을 반복 실행합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  forScene: {
    audio: "for-for.mp3",
    durationInFrames: FOR_SCENE_DURATION,
    speechStartFrame: AUDIO_CONFIG.forScene.speechStartFrame,
    narration: [
      "초기식에서 변수를 초기화하고 조건식을 확인합니다.",
      "블록 실행 후 증감식으로 변수를 변화시킵니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.forScene.narrationSplits,
  },
  executionScene: {
    audio: "for-execution.mp3",
    durationInFrames: AUDIO_CONFIG.executionScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.executionScene.speechStartFrame,
    narration: [
      "[i(발음:아이)]가 0일 때 조건이 참이므로 블록을 실행합니다.",
      "[i(발음:아이)]가 1일 때도 조건이 참입니다.",
      "[i(발음:아이)]가 2일 때도 조건이 참입니다.",
      "[i(발음:아이)]가 3일 때도 조건이 참입니다.",
      "[i(발음:아이)]가 4일 때, 조건이 참인 마지막 실행입니다.",
      "[i(발음:아이)]가 5가 되면 조건이 거짓이 되어 반복이 종료됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.executionScene.narrationSplits,
  },
  summaryScene: {
    audio: "for-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "[for(발음:포)] 문은 초기식, 조건식, 증감식으로 반복을 제어합니다.",
      "횟수가 정해진 반복에 적합합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── ThumbnailScene ────────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#050510", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
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
    <div style={{
      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
      fontSize: 64, fontWeight: 900, color: "#4ec9b0",
      background: "#4ec9b018", border: "2px solid #4ec9b055",
      borderRadius: 18, padding: "18px 56px",
      marginTop: 8,
    }}>for</div>
  </AbsoluteFill>
);

// ── OverviewScene ─────────────────────────────────────────────
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
  const forAppear   = spring({ frame: frame - split0,  fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 22 });

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
              <div style={nodeStyle("#c586c0", false, leftAppear)}>조건문</div>

              {/* 반복문 + for 팝업 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                <div style={nodeStyle(C_FOR, true, rightAppear)}>반복문</div>
                {phase2 && (
                  <>
                    <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.18)", opacity: forAppear, flexShrink: 0 }} />
                    <div style={{
                      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 52, fontWeight: 900, color: C_FOR,
                      background: `${C_FOR}18`, border: `2px solid ${C_FOR}55`,
                      borderRadius: 18, padding: "14px 44px",
                      opacity: forAppear,
                      transform: `scale(${interpolate(forAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                      boxShadow: `0 0 32px ${C_FOR}33`,
                    }}>for</div>
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

// ── IntroScene — for 구조 블록 ────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const blockAppear = spring({ frame: frame - s, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 28 });
  const sc = interpolate(blockAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // phase2: 조건 → 블록 반복 화살표
  const phase2 = frame >= split0;
  const loopAppear = spring({ frame: frame - split0, fps, config: { damping: 12, stiffness: 140 }, durationInFrames: 22 });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        <div style={{
          position: "absolute", top: "44%", left: "50%",
          transform: `translate(-50%, -50%) scale(${sc})`,
          display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0,
          opacity: blockAppear, width: 860,
        }}>
          {/* for (초기식; 조건식; 증감식) { */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 36, background: "#252525", borderRadius: "16px 16px 0 0",
            padding: "28px 44px 16px",
            border: "2px solid #3a3a3a", borderBottom: "none",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: C_FOR, fontWeight: 900 }}>for</span>
            <span style={{ color: "#d4d4d4" }}> (</span>
            <span style={{ color: C_INIT, fontWeight: 700 }}>초기식</span>
            <span style={{ color: "#d4d4d4" }}>; </span>
            <span style={{ color: C_COND, fontWeight: 700 }}>조건식</span>
            <span style={{ color: "#d4d4d4" }}>; </span>
            <span style={{ color: C_INC, fontWeight: 700 }}>증감식</span>
            <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
          </div>
          {/* 실행코드 */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 34, background: "#252525",
            padding: "16px 44px 16px 88px",
            border: "2px solid #3a3a3a", borderTop: "none", borderBottom: "none",
            color: "#888", fontStyle: "italic",
          }}>
            실행코드
          </div>
          {/* } */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 36, background: "#252525", borderRadius: "0 0 16px 16px",
            padding: "16px 44px 28px",
            border: "2px solid #3a3a3a", borderTop: "none",
            color: "#d4d4d4",
          }}>{"}"}</div>

          {/* phase2: "조건이 참인 동안 반복" 배지 */}
          {phase2 && (
            <div style={{
              marginTop: 28,
              display: "flex", alignItems: "center", gap: 14,
              background: `${C_FOR}14`, border: `2px solid ${C_FOR}44`,
              borderRadius: 14, padding: "14px 28px",
              opacity: loopAppear,
              transform: `scale(${interpolate(loopAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            }}>
              <span style={{ fontSize: 28 }}>🔁</span>
              <span style={{ fontFamily: uiFont, fontSize: 28, color: C_FOR, fontWeight: 700 }}>
                조건이 참인 동안 반복
              </span>
            </div>
          )}
        </div>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── ForScene — 초기식→조건식→블록→증감식 순차 등장 ────────────
const ForScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { forScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;                          // ≈ 7
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[]; // ≈ 107
  const opacity = useFade(d);

  const cfg_spring = { damping: 14, stiffness: 160 };
  const dur = 22;

  // 등장 순서: 초기식 → 조건식 → 블록(body) → 증감식
  const initAppear = spring({ frame: frame - s,           fps, config: cfg_spring, durationInFrames: dur });
  const condAppear = spring({ frame: frame - (s + 24),    fps, config: cfg_spring, durationInFrames: dur });
  const bodyAppear = spring({ frame: frame - split0,      fps, config: cfg_spring, durationInFrames: dur });
  const incAppear  = spring({ frame: frame - (split0+24), fps, config: cfg_spring, durationInFrames: dur });

  const slideY = (a: number) =>
    `translateY(${interpolate(a, [0,1], [10,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" })}px)`;

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        {frame >= s && (
          <div style={{
            position: "absolute", top: "46%", left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", gap: 20,
            width: 860,
          }}>
            {/* ── 코드 블록 ── */}
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 34, lineHeight: 2.1,
              background: "#252525", borderRadius: 20,
              padding: "36px 52px",
              boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
            }}>
              {/* Line 1 */}
              <div style={{ whiteSpace: "nowrap" }}>
                {/* 초기식 그룹 */}
                <span style={{ display: "inline-block", opacity: initAppear, transform: slideY(initAppear) }}>
                  <span style={{ color: C_FOR, fontWeight: 900 }}>for</span>
                  <span style={{ color: "#d4d4d4" }}>{" ("}</span>
                  <span style={{ color: C_INIT }}>int i</span>
                  <span style={{ color: "#d4d4d4" }}>{" = "}</span>
                  <span style={{ color: C_NUM }}>0</span>
                </span>
                {/* 조건식 그룹 */}
                <span style={{ display: "inline-block", opacity: condAppear, transform: slideY(condAppear) }}>
                  <span style={{ color: "#d4d4d4" }}>{"; "}</span>
                  <span style={{ color: C_COND }}>{"i < 5"}</span>
                </span>
                {/* 증감식 그룹 */}
                <span style={{ display: "inline-block", opacity: incAppear, transform: slideY(incAppear) }}>
                  <span style={{ color: "#d4d4d4" }}>{"; "}</span>
                  <span style={{ color: C_INC }}>i++</span>
                </span>
                {/* ) { */}
                <span style={{ display: "inline-block", opacity: bodyAppear }}>
                  <span style={{ color: "#d4d4d4" }}>{") {"}</span>
                </span>
              </div>
              {/* Line 2: body */}
              <div style={{ paddingLeft: 56, opacity: bodyAppear, transform: slideY(bodyAppear) }}>
                <span style={{ color: C_INIT }}>System</span>
                <span style={{ color: "#d4d4d4" }}>.out.</span>
                <span style={{ color: "#dcdcaa" }}>println</span>
                <span style={{ color: "#d4d4d4" }}>(i);</span>
              </div>
              {/* Line 3: } */}
              <div style={{ color: "#d4d4d4", opacity: bodyAppear }}>{"}"}</div>
            </div>

            {/* ── 단계 레이블 배지 행 ── */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {([
                { label: "① 초기식",  color: C_INIT, appear: initAppear },
                { label: "② 조건식",  color: C_COND, appear: condAppear },
                { label: "③ 블록",    color: C_FOR,  appear: bodyAppear },
                { label: "④ 증감식",  color: C_INC,  appear: incAppear  },
              ] as const).map(({ label, color, appear }) => (
                <div key={label} style={{
                  fontFamily: uiFont, fontSize: 24, fontWeight: 700,
                  color,
                  background: `${color}18`,
                  border: `2px solid ${color}55`,
                  borderRadius: 12, padding: "8px 20px",
                  opacity: appear,
                  transform: slideY(appear),
                  display: "inline-block",
                }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── ExecutionScene — 단계별 실행 ──────────────────────────────
const EXEC_STEPS = [
  { i: 0, condPass: true,  label: "첫 번째 실행",   output: ["0"] },
  { i: 1, condPass: true,  label: "두 번째 실행",   output: ["0", "1"] },
  { i: 2, condPass: true,  label: "세 번째 실행",   output: ["0", "1", "2"] },
  { i: 3, condPass: true,  label: "네 번째 실행",   output: ["0", "1", "2", "3"] },
  { i: 4, condPass: true,  label: "다섯 번째 실행", output: ["0", "1", "2", "3", "4"] },
  { i: 5, condPass: false, label: "반복 종료",       output: ["0", "1", "2", "3", "4"] },
] as const;

const ExecutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { executionScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const opacity = useFade(d);

  const splits = cfg.narrationSplits as readonly number[];
  let stepIdx = 0;
  if (frame >= s) {
    stepIdx = splits.length;
    for (let i = 0; i < splits.length; i++) {
      if (frame < splits[i]) { stepIdx = i; break; }
    }
  }

  const step = EXEC_STEPS[stepIdx];

  const stepStartFrame = stepIdx === 0 ? s : splits[stepIdx - 1];
  const iSpring = spring({
    frame: frame - stepStartFrame,
    fps,
    config: { damping: 14, stiffness: 180 },
    durationInFrames: 18,
  });

  const activeLineIsCondition = !step.condPass;

  // 레이블 spring — 단계 전환마다 튀어오름
  const labelSpring = spring({
    frame: frame - stepStartFrame,
    fps,
    config: { damping: 14, stiffness: 200 },
    durationInFrames: 16,
  });
  const labelSc = interpolate(labelSpring, [0, 1], [0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {frame >= s && (
          <div style={{
            position: "absolute", top: "46%", left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", gap: 20,
            width: 860,
          }}>
            {/* 단계 레이블 배지 */}
            <div style={{
              display: "flex", justifyContent: "center",
            }}>
              <div style={{
                fontFamily: uiFont, fontSize: 32, fontWeight: 900,
                color: step.condPass ? C_FOR : C_RED,
                background: step.condPass ? `${C_FOR}18` : `${C_RED}18`,
                border: `2px solid ${step.condPass ? C_FOR : C_RED}55`,
                borderRadius: 14, padding: "10px 36px",
                opacity: labelSpring,
                transform: `scale(${labelSc})`,
              }}>
                {step.label}
              </div>
            </div>

            {/* 위: 코드 패널 */}
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 26, lineHeight: 2.0,
              background: "#252525", borderRadius: 16,
              padding: "24px 32px",
            }}>
              {/* for 헤더 줄 */}
              <div style={{
                background: activeLineIsCondition ? `${C_COND}22` : "transparent",
                borderLeft: activeLineIsCondition ? `3px solid ${C_COND}` : "3px solid transparent",
                paddingLeft: 8, borderRadius: "0 6px 6px 0",
                whiteSpace: "nowrap",
              }}>
                <span style={{ color: C_FOR, fontWeight: 900 }}>for</span>
                <span style={{ color: "#d4d4d4" }}> (</span>
                <span style={{ color: C_INIT }}>int i = 0</span>
                <span style={{ color: "#d4d4d4" }}>; </span>
                <span style={{ color: C_COND }}>i {"<"} 5</span>
                <span style={{ color: "#d4d4d4" }}>; </span>
                <span style={{ color: C_INC }}>i++</span>
                <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
              </div>
              {/* println 줄 */}
              <div style={{
                background: !activeLineIsCondition && step.condPass ? `${C_FOR}18` : "transparent",
                borderLeft: !activeLineIsCondition && step.condPass ? `3px solid ${C_FOR}` : "3px solid transparent",
                paddingLeft: 52, borderRadius: "0 6px 6px 0",
              }}>
                <span style={{ color: C_INIT }}>System</span>
                <span style={{ color: "#d4d4d4" }}>.out.</span>
                <span style={{ color: "#dcdcaa" }}>println</span>
                <span style={{ color: "#d4d4d4" }}>(i);</span>
              </div>
              {/* } */}
              <div style={{ color: "#d4d4d4" }}>{"}"}</div>
            </div>

            {/* 아래: 상태 패널 (가로 배열) */}
            <div style={{ display: "flex", gap: 20 }}>
              {/* i 값 박스 */}
              <div style={{
                flex: "0 0 220px",
                background: "#2a2a2a", borderRadius: 16,
                padding: "20px 32px",
                border: `2px solid ${step.condPass ? C_FOR : C_RED}55`,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <span style={{ fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA, color: "#d4d4d4", fontSize: 28 }}>i =</span>
                <span style={{
                  fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                  color: step.condPass ? C_FOR : C_RED,
                  fontSize: 52, fontWeight: 900,
                  display: "inline-block",
                  transform: `scale(${interpolate(iSpring, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}>{step.i}</span>
              </div>

              {/* 조건 배지 */}
              <div style={{
                flex: 1,
                background: step.condPass ? `${C_FOR}18` : `${C_RED}18`,
                border: `2px solid ${step.condPass ? C_FOR : C_RED}66`,
                borderRadius: 14, padding: "14px 28px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA, color: C_COND, fontSize: 24 }}>i {"<"} 5</span>
                <span style={{ fontSize: 30 }}>{step.condPass ? "✓" : "✗"}</span>
                <span style={{ fontFamily: uiFont, fontSize: 24, color: step.condPass ? C_FOR : C_RED, fontWeight: 700 }}>
                  {step.condPass ? "참" : "거짓"}
                </span>
              </div>
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
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── SummaryScene ──────────────────────────────────────────────
const SUMMARY_ROWS = [
  { label: "초기식",  color: C_INIT, desc: "반복 변수 초기화" },
  { label: "조건식",  color: C_COND, desc: "참이면 블록 실행, 거짓이면 종료" },
  { label: "증감식",  color: C_INC,  desc: "매 반복 후 변수 변화" },
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
        <Audio src={staticFile(cfg.audio)} />

        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", flexDirection: "column", gap: 24, width: 880,
        }}>
          {/* for 코드 정적 표시 */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 28, lineHeight: 1.9,
            background: "#252525", borderRadius: 16,
            padding: "24px 40px",
            opacity: codeAppear, transform: `scale(${codeSc})`,
          }}>
            <div>
              <span style={{ color: C_FOR, fontWeight: 900 }}>for</span>
              <span style={{ color: "#d4d4d4" }}> (</span>
              <span style={{ color: C_INIT }}>int i = 0</span>
              <span style={{ color: "#d4d4d4" }}>; </span>
              <span style={{ color: C_COND }}>i {"<"} 5</span>
              <span style={{ color: "#d4d4d4" }}>; </span>
              <span style={{ color: C_INC }}>i++</span>
              <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
            </div>
            <div style={{ paddingLeft: 56 }}>
              <span style={{ color: C_INIT }}>System</span>
              <span style={{ color: "#d4d4d4" }}>.out.</span>
              <span style={{ color: "#dcdcaa" }}>println</span>
              <span style={{ color: "#d4d4d4" }}>(i);</span>
            </div>
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
                <span style={{ fontFamily: uiFont, fontSize: 30, fontWeight: 900, color: row.color, minWidth: 80 }}>
                  {row.label}
                </span>
                <span style={{ color: "#3a3a3a", fontSize: 26 }}>—</span>
                <span style={{ fontFamily: uiFont, fontSize: 26, color: "#d4d4d4" }}>{row.desc}</span>
              </div>
            );
          })}
        </div>
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
  VIDEO_CONFIG.forScene,
  VIDEO_CONFIG.executionScene,
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
export const JavaFor: React.FC = () => (
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
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.forScene.durationInFrames}>
      <ForScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.executionScene.durationInFrames}>
      <ExecutionScene />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaFor;
