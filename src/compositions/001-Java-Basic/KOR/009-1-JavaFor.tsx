// src/compositions/001-Java-Basic/009-JavaFor.tsx
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
import { SrtEntry, addSrtScene, computeFromValues } from "../../../utils/srt";
import { CONTENT } from "./009-2-content";
import { AUDIO_CONFIG } from "./009-3-audio.gen";
import { HEIGHT, WIDTH } from "./config";

// ── 색상 상수 ─────────────────────────────────────────────────
const C_FOR = "#4ec9b0"; // for 키워드 — teal
const C_INIT = "#4e9cd5"; // 초기식 (int i = 0) — blue
const C_COND = "#e5c07b"; // 조건식 — amber
const C_INC = "#c586c0"; // 증감식 — purple
const C_NUM = "#b5cea8"; // 숫자 리터럴
const C_DIM = "rgba(255,255,255,0.22)";
const C_RED = "#f47c7c"; // 거짓/경고

// ── ForScene: 순차 등장 애니메이션 (init→cond→body→inc) ──────
const FOR_SCENE_DURATION = AUDIO_CONFIG.forScene.durationInFrames;

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  overview: {
    audio: "for-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: CONTENT.overview.narration as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "for-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  forScene: {
    audio: "for-for.mp3",
    durationInFrames: FOR_SCENE_DURATION,
    speechStartFrame: AUDIO_CONFIG.forScene.speechStartFrame,
    narration: CONTENT.forScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.forScene.narrationSplits,
  },
  executionScene: {
    audio: "for-execution.mp3",
    durationInFrames: AUDIO_CONFIG.executionScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.executionScene.speechStartFrame,
    narration: CONTENT.executionScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.executionScene.narrationSplits,
  },
  summaryScene: {
    audio: "for-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── ThumbnailScene ────────────────────────────────────────────
const ThumbnailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [60 - THUMB_CROSS, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: "#050510",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 860,
          height: 860,
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
          fontSize: 26,
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
          fontSize: 108,
          fontWeight: 900,
          lineHeight: 1,
          textAlign: "center",
          color: "#fff",
          textShadow:
            "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
        }}
      >
        Java
        <br />
        <span style={{ color: "#4ec9b0" }}>반복문</span>
      </div>
      <div
        style={{
          fontFamily: monoFont,
          fontFeatureSettings: MONO_NO_LIGA,
          fontSize: 64,
          fontWeight: 900,
          color: "#4ec9b0",
          background: "#4ec9b018",
          border: "2px solid #4ec9b055",
          borderRadius: 18,
          padding: "18px 56px",
          marginTop: 8,
        }}
      >
        for
      </div>
    </AbsoluteFill>
  );
};

// ── OverviewScene ─────────────────────────────────────────────
const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { overview: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d, { in: true });

  const phase2 = frame >= split0;

  const rootAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 48,
  });
  const leftAppear = spring({
    frame: frame - s - 20,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 48,
  });
  const rightAppear = spring({
    frame: frame - s - 40,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 48,
  });
  const forAppear = spring({
    frame: frame - AUDIO_CONFIG.overview.wordTiming["문을"][0],
    fps,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 44,
  });

  const nodeStyle = (
    color: string,
    active: boolean,
    appear: number,
  ): React.CSSProperties => {
    const sc = interpolate(appear, [0, 1], [0.75, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return {
      fontFamily: uiFont,
      fontSize: 34,
      fontWeight: 700,
      color: active ? color : C_DIM,
      background: active ? `${color}18` : "rgba(255,255,255,0.04)",
      border: `2px solid ${active ? color + "66" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 16,
      padding: "16px 36px",
      opacity: appear,
      transform: `scale(${sc})`,
      textAlign: "center" as const,
    };
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <SceneTitle title="1. 반복문 개요" />
          <Audio src={staticFile(cfg.audio)} />

          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* 제어문 루트 */}
              <div style={nodeStyle("#9cdcfe", true, rootAppear)}>제어문</div>

              {/* 연결선 */}
              <div
                style={{
                  position: "relative",
                  width: 440,
                  height: 50,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: 2,
                    height: 26,
                    background: "rgba(255,255,255,0.18)",
                    transform: "translateX(-50%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 26,
                    left: "20%",
                    width: "60%",
                    height: 2,
                    background: "rgba(255,255,255,0.18)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 26,
                    left: "20%",
                    width: 2,
                    height: 24,
                    background: "rgba(255,255,255,0.18)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 26,
                    right: "20%",
                    width: 2,
                    height: 24,
                    background: "rgba(255,255,255,0.18)",
                  }}
                />
              </div>

              {/* 조건문(dim) / 반복문(하이라이트) */}
              <div
                style={{ display: "flex", gap: 56, alignItems: "flex-start" }}
              >
                {/* 조건문 — dim */}
                <div style={nodeStyle("#c586c0", false, leftAppear)}>
                  조건문
                </div>

                {/* 반복문 + for 팝업 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0,
                  }}
                >
                  <div style={nodeStyle(C_FOR, true, rightAppear)}>반복문</div>
                  {/* 공간을 항상 확보해 컨테이너 높이 고정 — phase2 전엔 투명 */}
                  <div
                    style={{
                      width: 2,
                      height: 20,
                      background: "rgba(255,255,255,0.18)",
                      opacity: phase2 ? forAppear : 0,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    {/* while — 흐릿하게 */}
                    <div
                      style={{
                        fontFamily: monoFont,
                        fontFeatureSettings: MONO_NO_LIGA,
                        fontSize: 34,
                        fontWeight: 900,
                        color: C_FOR,
                        background: `${C_FOR}18`,
                        border: `2px solid ${C_FOR}55`,
                        borderRadius: 14,
                        padding: "10px 22px",
                        opacity: (phase2 ? forAppear : 0) * 0.38,
                        transform: `scale(${interpolate(phase2 ? forAppear : 0, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      while
                    </div>
                    {/* for — 하이라이트 */}
                    <div
                      style={{
                        fontFamily: monoFont,
                        fontFeatureSettings: MONO_NO_LIGA,
                        fontSize: 44,
                        fontWeight: 900,
                        color: C_FOR,
                        background: `${C_FOR}18`,
                        border: `2px solid ${C_FOR}55`,
                        borderRadius: 16,
                        padding: "12px 32px",
                        opacity: phase2 ? forAppear : 0,
                        transform: `scale(${interpolate(phase2 ? forAppear : 0, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                        boxShadow: `0 0 32px ${C_FOR}33`,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      for
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.overview.wordStartFrames}
      />
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

  const blockAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 56,
  });
  const sc = interpolate(blockAppear, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // phase2: 조건 → 블록 반복 화살표
  const phase2 = frame >= split0;
  const loopAppear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 44,
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <SceneTitle title="2. for 문이란?" />
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "44%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${sc})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 0,
              opacity: blockAppear,
              width: 860,
            }}
          >
            {/* for (초기식; 조건식; 증감식) { */}
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 36,
                background: "#252525",
                borderRadius: "16px 16px 0 0",
                padding: "28px 44px 16px",
                border: "2px solid #3a3a3a",
                borderBottom: "none",
                whiteSpace: "nowrap",
              }}
            >
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
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 34,
                background: "#252525",
                padding: "16px 44px 16px 88px",
                border: "2px solid #3a3a3a",
                borderTop: "none",
                borderBottom: "none",
                color: "#888",
                fontStyle: "italic",
              }}
            >
              실행코드
            </div>
            {/* } */}
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 36,
                background: "#252525",
                borderRadius: "0 0 16px 16px",
                padding: "16px 44px 28px",
                border: "2px solid #3a3a3a",
                borderTop: "none",
                color: "#d4d4d4",
              }}
            >
              {"}"}
            </div>

            {/* phase2: "조건이 참인 동안 반복" 배지 */}
            {phase2 && (
              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: `${C_FOR}14`,
                  border: `2px solid ${C_FOR}44`,
                  borderRadius: 14,
                  padding: "14px 28px",
                  opacity: loopAppear,
                  transform: `scale(${interpolate(loopAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}
              >
                <span style={{ fontSize: 28 }}>🔁</span>
                <span
                  style={{
                    fontFamily: uiFont,
                    fontSize: 28,
                    color: C_FOR,
                    fontWeight: 700,
                  }}
                >
                  조건이 참인 동안 반복
                </span>
              </div>
            )}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.intro.wordStartFrames}
      />
    </>
  );
};

// ── ForScene — 초기식→조건식→블록→증감식 순차 등장 ────────────
const ForScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { forScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame; // ≈ 7
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[]; // ≈ 107
  const opacity = useFade(d);

  const cfg_spring = { damping: 14, stiffness: 160 };
  const dur = 44;

  // 등장 순서: 초기식 → 조건식 → 블록(body) → 증감식
  const initAppear = spring({
    frame: frame - s,
    fps,
    config: cfg_spring,
    durationInFrames: dur,
  });
  const condAppear = spring({
    frame: frame - AUDIO_CONFIG.forScene.wordTiming["확인합니다"][0],
    fps,
    config: cfg_spring,
    durationInFrames: dur,
  });
  const bodyAppear = spring({
    frame: frame - split0,
    fps,
    config: cfg_spring,
    durationInFrames: dur,
  });
  const incAppear = spring({
    frame: frame - AUDIO_CONFIG.forScene.wordTiming["증감식으로"][0],
    fps,
    config: cfg_spring,
    durationInFrames: dur,
  });

  const slideY = (a: number) =>
    `translateY(${interpolate(a, [0, 1], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`;

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <SceneTitle title="3. for 문법" />
          <Audio src={staticFile(cfg.audio)} />
          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "46%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                width: 860,
              }}
            >
              {/* ── 코드 블록 ── */}
              <div
                style={{
                  fontFamily: monoFont,
                  fontFeatureSettings: MONO_NO_LIGA,
                  fontSize: 34,
                  lineHeight: 2.1,
                  background: "#252525",
                  borderRadius: 20,
                  padding: "36px 52px",
                  boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
                }}
              >
                {/* Line 1 */}
                <div style={{ whiteSpace: "nowrap" }}>
                  {/* 초기식 그룹 */}
                  <span
                    style={{
                      display: "inline-block",
                      opacity: initAppear,
                      transform: slideY(initAppear),
                    }}
                  >
                    <span style={{ color: C_FOR, fontWeight: 900 }}>for</span>
                    <span style={{ color: "#d4d4d4" }}>{" ("}</span>
                    <span style={{ color: C_INIT }}>int i</span>
                    <span style={{ color: "#d4d4d4" }}>{" = "}</span>
                    <span style={{ color: C_NUM }}>0</span>
                  </span>
                  {/* 조건식 그룹 */}
                  <span
                    style={{
                      display: "inline-block",
                      opacity: condAppear,
                      transform: slideY(condAppear),
                    }}
                  >
                    <span style={{ color: "#d4d4d4" }}>{"; "}</span>
                    <span style={{ color: C_COND }}>{"i < 5"}</span>
                  </span>
                  {/* 증감식 그룹 */}
                  <span
                    style={{
                      display: "inline-block",
                      opacity: incAppear,
                      transform: slideY(incAppear),
                    }}
                  >
                    <span style={{ color: "#d4d4d4" }}>{"; "}</span>
                    <span style={{ color: C_INC }}>i++</span>
                  </span>
                  {/* ) { */}
                  <span
                    style={{ display: "inline-block", opacity: bodyAppear }}
                  >
                    <span style={{ color: "#d4d4d4" }}>{") {"}</span>
                  </span>
                </div>
                {/* Line 2: body */}
                <div
                  style={{
                    paddingLeft: 56,
                    opacity: bodyAppear,
                    transform: slideY(bodyAppear),
                  }}
                >
                  <span style={{ color: C_INIT }}>System</span>
                  <span style={{ color: "#d4d4d4" }}>.out.</span>
                  <span style={{ color: "#dcdcaa" }}>println</span>
                  <span style={{ color: "#d4d4d4" }}>(i);</span>
                </div>
                {/* Line 3: } */}
                <div style={{ color: "#d4d4d4", opacity: bodyAppear }}>
                  {"}"}
                </div>
              </div>

              {/* ── 단계 레이블 배지 행 ── */}
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                {(
                  [
                    { label: "① 초기식", color: C_INIT, appear: initAppear },
                    { label: "② 조건식", color: C_COND, appear: condAppear },
                    { label: "③ 블록", color: C_FOR, appear: bodyAppear },
                    { label: "④ 증감식", color: C_INC, appear: incAppear },
                  ] as const
                ).map(({ label, color, appear }) => (
                  <div
                    key={label}
                    style={{
                      fontFamily: uiFont,
                      fontSize: 24,
                      fontWeight: 700,
                      color,
                      background: `${color}18`,
                      border: `2px solid ${color}55`,
                      borderRadius: 12,
                      padding: "8px 20px",
                      opacity: appear,
                      transform: slideY(appear),
                      display: "inline-block",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.forScene.wordStartFrames}
      />
    </>
  );
};

// ── ExecutionScene — 단계별 실행 ──────────────────────────────
const EXEC_STEPS = [
  { i: 0, condPass: true, label: "첫 번째 실행", output: ["0"] },
  { i: 1, condPass: true, label: "두 번째 실행", output: ["0", "1"] },
  { i: 2, condPass: true, label: "세 번째 실행", output: ["0", "1", "2"] },
  { i: 3, condPass: true, label: "네 번째 실행", output: ["0", "1", "2", "3"] },
  {
    i: 4,
    condPass: true,
    label: "다섯 번째 실행",
    output: ["0", "1", "2", "3", "4"],
  },
  {
    i: 5,
    condPass: false,
    label: "반복 종료",
    output: ["0", "1", "2", "3", "4"],
  },
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
      if (frame < splits[i]) {
        stepIdx = i;
        break;
      }
    }
  }

  const step = EXEC_STEPS[stepIdx];

  const stepStartFrame = stepIdx === 0 ? s : splits[stepIdx - 1];
  const iSpring = spring({
    frame: frame - stepStartFrame,
    fps,
    config: { damping: 14, stiffness: 180 },
    durationInFrames: 36,
  });

  const activeLineIsCondition = !step.condPass;

  // 조건 하이라이트 — "참" 발화 시 i < 5 span에 amber glow
  const COND_TRUE_FRAMES: Record<number, number> = {
    0: AUDIO_CONFIG.executionScene.wordTiming["참이므로"][0], // 47
    1: AUDIO_CONFIG.executionScene.wordTiming["참입니다"][0], // 151
    2: AUDIO_CONFIG.executionScene.wordTiming["참입니다"][1], // 228
    3: AUDIO_CONFIG.executionScene.wordTiming["참입니다"][2], // 305
    4: AUDIO_CONFIG.executionScene.wordTiming["참인"][0], // 387
  };
  const condHLStart = step.condPass
    ? (COND_TRUE_FRAMES[stepIdx] ?? Infinity)
    : Infinity;
  const condHL = interpolate(
    frame - condHLStart,
    [0, 12, 44, 76],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // 출력 로그 — "실행" 발화 시점 이후에만 표시
  const EXEC_FRAMES: Record<number, number> = {
    0: AUDIO_CONFIG.executionScene.wordTiming["실행합니다"][0],
    1: AUDIO_CONFIG.executionScene.wordTiming["참입니다"][0],
    2: AUDIO_CONFIG.executionScene.wordTiming["참입니다"][1],
    3: AUDIO_CONFIG.executionScene.wordTiming["참입니다"][2],
    4: AUDIO_CONFIG.executionScene.wordTiming["실행입니다"][0],
  };
  const OUTPUT_DELAY = 20;
  const showOutput =
    step.condPass && frame >= (EXEC_FRAMES[stepIdx] ?? Infinity) + OUTPUT_DELAY;

  // 레이블 spring — 단계 전환마다 튀어오름
  const labelSpring = spring({
    frame: frame - stepStartFrame,
    fps,
    config: { damping: 14, stiffness: 200 },
    durationInFrames: 32,
  });
  const labelSc = interpolate(labelSpring, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <SceneTitle title="4. for 실행 흐름" />
          <Audio src={staticFile(cfg.audio)} />

          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "46%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                width: 860,
              }}
            >
              {/* 단계 레이블 배지 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 32,
                    fontWeight: 900,
                    color: step.condPass ? C_FOR : C_RED,
                    background: step.condPass ? `${C_FOR}18` : `${C_RED}18`,
                    border: `2px solid ${step.condPass ? C_FOR : C_RED}55`,
                    borderRadius: 14,
                    padding: "10px 36px",
                    opacity: labelSpring,
                    transform: `scale(${labelSc})`,
                  }}
                >
                  {step.label}
                </div>
              </div>

              {/* 위: 코드 패널 */}
              <div
                style={{
                  fontFamily: monoFont,
                  fontFeatureSettings: MONO_NO_LIGA,
                  fontSize: 26,
                  lineHeight: 2.0,
                  background: "#252525",
                  borderRadius: 16,
                  padding: "24px 32px",
                }}
              >
                {/* for 헤더 줄 */}
                <div
                  style={{
                    background: activeLineIsCondition
                      ? `${C_COND}22`
                      : "transparent",
                    borderLeft: activeLineIsCondition
                      ? `3px solid ${C_COND}`
                      : "3px solid transparent",
                    paddingLeft: 8,
                    borderRadius: "0 6px 6px 0",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: C_FOR, fontWeight: 900 }}>for</span>
                  <span style={{ color: "#d4d4d4" }}> (</span>
                  <span style={{ color: C_INIT }}>int i = 0</span>
                  <span style={{ color: "#d4d4d4" }}>; </span>
                  <span
                    style={{
                      color: C_COND,
                      background: `rgba(229,192,123,${condHL * 0.38})`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      margin: "0 -5px",
                    }}
                  >
                    i {"<"} 5
                  </span>
                  <span style={{ color: "#d4d4d4" }}>; </span>
                  <span style={{ color: C_INC }}>i++</span>
                  <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
                </div>
                {/* println 줄 */}
                <div
                  style={{
                    background:
                      !activeLineIsCondition && step.condPass
                        ? `${C_FOR}18`
                        : "transparent",
                    borderLeft:
                      !activeLineIsCondition && step.condPass
                        ? `3px solid ${C_FOR}`
                        : "3px solid transparent",
                    paddingLeft: 52,
                    borderRadius: "0 6px 6px 0",
                  }}
                >
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
                <div
                  style={{
                    flex: "0 0 220px",
                    background: "#2a2a2a",
                    borderRadius: 16,
                    padding: "20px 32px",
                    border: `2px solid ${step.condPass ? C_FOR : C_RED}55`,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: "#d4d4d4",
                      fontSize: 28,
                    }}
                  >
                    i =
                  </span>
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: step.condPass ? C_FOR : C_RED,
                      fontSize: 52,
                      fontWeight: 900,
                      display: "inline-block",
                      transform: `scale(${interpolate(iSpring, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                    }}
                  >
                    {step.i}
                  </span>
                </div>

                {/* 조건 배지 */}
                <div
                  style={{
                    flex: 1,
                    background: step.condPass ? `${C_FOR}18` : `${C_RED}18`,
                    border: `2px solid ${step.condPass ? C_FOR : C_RED}66`,
                    borderRadius: 14,
                    padding: "14px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: C_COND,
                      fontSize: 24,
                    }}
                  >
                    i {"<"} 5
                  </span>
                  <span style={{ fontSize: 30 }}>
                    {step.condPass ? "✓" : "✗"}
                  </span>
                  <span
                    style={{
                      fontFamily: uiFont,
                      fontSize: 24,
                      color: step.condPass ? C_FOR : C_RED,
                      fontWeight: 700,
                    }}
                  >
                    {step.condPass ? "참" : "거짓"}
                  </span>
                </div>
              </div>

              {/* 출력 로그 — 이전 출력은 유지, 현재 숫자는 "실행" 발화 시 추가 */}
              <div
                style={{
                  background: "#252525",
                  borderRadius: 14,
                  padding: "16px 28px",
                  fontFamily: monoFont,
                  fontFeatureSettings: MONO_NO_LIGA,
                  fontSize: 26,
                  opacity: stepIdx > 0 || showOutput ? 1 : 0,
                }}
              >
                <div
                  style={{
                    color: "#888",
                    fontSize: FONT.label,
                    marginBottom: 8,
                    fontFamily: uiFont,
                  }}
                >
                  출력
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {(step.output as readonly string[]).map((n, i) => {
                    const isNew =
                      step.condPass &&
                      i === (step.output as readonly string[]).length - 1;
                    const execFrame =
                      (EXEC_FRAMES[stepIdx] ?? Infinity) + OUTPUT_DELAY;
                    const highlight =
                      isNew && showOutput
                        ? interpolate(frame - execFrame, [0, 60], [1, 0], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                          })
                        : 0;
                    return (
                      <span
                        key={i}
                        style={{
                          color: isNew && highlight > 0 ? C_FOR : C_NUM,
                          opacity: isNew && !showOutput ? 0 : 1,
                          textShadow:
                            highlight > 0
                              ? `0 0 ${highlight * 12}px ${C_FOR}aa`
                              : "none",
                          fontWeight: highlight > 0 ? 900 : 400,
                        }}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.executionScene.wordStartFrames}
      />
    </>
  );
};

// ── SummaryScene ──────────────────────────────────────────────
const SUMMARY_ROWS = [
  { label: "초기식", color: C_INIT, desc: "반복 변수 초기화" },
  { label: "조건식", color: C_COND, desc: "참이면 블록 실행, 거짓이면 종료" },
  { label: "증감식", color: C_INC, desc: "매 반복 후 변수 변화" },
] as const;

const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false }); // 마지막 씬 — fadeOut 없음

  const codeAppear = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 130 },
    durationInFrames: 52,
  });
  const codeSc = interpolate(codeAppear, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <SceneTitle title="5. for 정리" />
          <Audio src={staticFile(cfg.audio)} />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 24,
              width: 880,
            }}
          >
            {/* for 코드 정적 표시 */}
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 28,
                lineHeight: 1.9,
                background: "#252525",
                borderRadius: 16,
                padding: "24px 40px",
                opacity: codeAppear,
                transform: `scale(${codeSc})`,
              }}
            >
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
              <div>
                <span style={{ color: "#d4d4d4" }}>{"}"}</span>
              </div>
            </div>

            {/* 요약 카드 — 각 단어 발화 시작 프레임에 맞춰 등장 */}
            {SUMMARY_ROWS.map((row, i) => {
              // 초기식=wordStartFrames[0][2], 조건식=[0][3], 증감식=[0][4]
              // TODO: wordTiming 미지원 — 동적 인덱스
              const triggerFrame =
                AUDIO_CONFIG.summaryScene.wordStartFrames[0][i + 2];
              const appear = spring({
                frame: frame - triggerFrame,
                fps,
                config: { damping: 13, stiffness: 140 },
                durationInFrames: 52,
              });
              const sc = interpolate(appear, [0, 1], [0.85, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    background: "#2a2a2a",
                    border: `2px solid ${row.color}55`,
                    borderRadius: 18,
                    padding: "22px 36px",
                    opacity: appear,
                    transform: `scale(${sc})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: uiFont,
                      fontSize: 30,
                      fontWeight: 900,
                      color: row.color,
                      minWidth: 80,
                    }}
                  >
                    {row.label}
                  </span>
                  <span style={{ color: "#3a3a3a", fontSize: 26 }}>—</span>
                  <span
                    style={{
                      fontFamily: uiFont,
                      fontSize: 26,
                      color: "#d4d4d4",
                    }}
                  >
                    {row.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.summaryScene.wordStartFrames}
      />
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
  _from +=
    s.durationInFrames -
    (i < sceneList.length - 1 ? (i === 0 ? THUMB_CROSS : CROSS) : 0);
  return f;
});
const totalDuration = _from;

// ── SRT 데이터 (scripts/srt.ts 에서 사용) ────────────────────
/** 절대 프레임 기준 자막 큐 목록 — srt.ts가 읽어서 .srt 파일 생성 */
export const SRT_DATA: SrtEntry[] = (() => {
  const entries: SrtEntry[] = [];
  const froms = computeFromValues(sceneList.map((s) => s.durationInFrames));

  // [0]=thumbnail: 나레이션 없음
  // [1]=overview
  addSrtScene(
    entries,
    froms[1],
    VIDEO_CONFIG.overview.narration,
    AUDIO_CONFIG.overview.speechStartFrame,
    AUDIO_CONFIG.overview.narrationSplits,
    AUDIO_CONFIG.overview.sentenceEndFrames,
    VIDEO_CONFIG.overview.durationInFrames,
  );
  // [2]=intro
  addSrtScene(
    entries,
    froms[2],
    VIDEO_CONFIG.intro.narration,
    AUDIO_CONFIG.intro.speechStartFrame,
    AUDIO_CONFIG.intro.narrationSplits,
    AUDIO_CONFIG.intro.sentenceEndFrames,
    VIDEO_CONFIG.intro.durationInFrames,
  );
  // [3]=forScene
  addSrtScene(
    entries,
    froms[3],
    VIDEO_CONFIG.forScene.narration,
    AUDIO_CONFIG.forScene.speechStartFrame,
    AUDIO_CONFIG.forScene.narrationSplits,
    AUDIO_CONFIG.forScene.sentenceEndFrames,
    VIDEO_CONFIG.forScene.durationInFrames,
  );
  // [4]=executionScene
  addSrtScene(
    entries,
    froms[4],
    VIDEO_CONFIG.executionScene.narration,
    AUDIO_CONFIG.executionScene.speechStartFrame,
    AUDIO_CONFIG.executionScene.narrationSplits,
    AUDIO_CONFIG.executionScene.sentenceEndFrames,
    VIDEO_CONFIG.executionScene.durationInFrames,
  );
  // [5]=summaryScene
  addSrtScene(
    entries,
    froms[5],
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
export const JavaFor: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.overview.durationInFrames}
    >
      <OverviewScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.intro.durationInFrames}
    >
      <IntroScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.forScene.durationInFrames}
    >
      <ForScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.executionScene.durationInFrames}
    >
      <ExecutionScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaFor;
