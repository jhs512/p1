// src/compositions/001-Java-Basic/006-JavaIf.tsx
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
import { CONTENT } from "./006-2-content";
import { AUDIO_CONFIG } from "./006-3-audio.gen";
import { BG } from "./colors";
import { HEIGHT, WIDTH } from "./config";

// ── 상수 ─────────────────────────────────────────────────────
const C_CTRL = "#c586c0"; // 제어 키워드 — if/else
const C_INT = "#4e9cd5";
const C_NUM = "#b5cea8";
const C_STR = "#ce9178";
const C_CMP = "#c586c0";
const C_TRUE = "#4ec9b0";
const C_FALSE = "#f47c7c";

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  overview: {
    audio: "if-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: CONTENT.overview.narration as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "if-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  ifScene: {
    audio: "if-if.mp3",
    durationInFrames: AUDIO_CONFIG.ifScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.ifScene.speechStartFrame,
    narration: CONTENT.ifScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.ifScene.narrationSplits,
  },
  ifElseScene: {
    audio: "if-ifelse.mp3",
    durationInFrames: AUDIO_CONFIG.ifElseScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.ifElseScene.speechStartFrame,
    narration: CONTENT.ifElseScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.ifElseScene.narrationSplits,
  },
  summaryScene: {
    audio: "if-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 컴포넌트: CodeBlock — 실제 if-else 소스코드 시각화 ────────
//   activeBlock: "if"|"else" → 해당 분기 왼쪽 바 + 배경 하이라이트
//   showElse: false → if 블록만, true → if-else 전체
const CodeBlock: React.FC<{
  score: number;
  showElse: boolean;
  activeBlock: "if" | "else" | null;
  startFrame: number;
}> = ({ score, showElse, activeBlock, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 120 },
    durationInFrames: 48,
  });
  const sc = interpolate(appear, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isTrue = score >= 60;
  const condColor = isTrue ? C_TRUE : C_FALSE;

  const bodyStyle = (block: "if" | "else"): React.CSSProperties => {
    const isActive = activeBlock === block;
    const isDimmed = activeBlock !== null && !isActive;
    const barColor = block === "if" ? C_TRUE : C_FALSE;
    return {
      paddingLeft: 40,
      paddingTop: 6,
      paddingBottom: 6,
      borderLeft: isActive ? `4px solid ${barColor}` : "4px solid transparent",
      background: isActive ? `${barColor}18` : "transparent",
      borderRadius: isActive ? "0 8px 8px 0" : 0,
      opacity: isDimmed ? 0.28 : 1,
    };
  };

  return (
    <div
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 32,
        lineHeight: 1.95,
        background: "#252525",
        borderRadius: 20,
        padding: "32px 44px",
        opacity: appear,
        transform: `scale(${sc})`,
        width: 880,
        boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
      }}
    >
      {/* int score = 75; */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ color: C_INT }}>int</span>
        <span style={{ color: "#d4d4d4" }}> score = </span>
        <span style={{ color: isTrue ? C_NUM : C_FALSE }}>{score}</span>
        <span style={{ color: "#d4d4d4" }}>;</span>
      </div>

      {/* if (score >= 60) { */}
      <div>
        <span style={{ color: C_CTRL }}>if</span>
        <span style={{ color: "#d4d4d4" }}> (score </span>
        <span style={{ color: C_CMP }}>{">="}</span>
        <span style={{ color: "#d4d4d4" }}> </span>
        <span style={{ color: C_NUM }}>60</span>
        <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
        {activeBlock !== null && (
          <span
            style={{
              color: condColor,
              fontSize: 24,
              marginLeft: 16,
              opacity: 0.75,
            }}
          >
            {"// "}
            {isTrue ? "true ✓" : "false ✗"}
          </span>
        )}
      </div>

      {/* System.out.println("합격"); */}
      <div style={bodyStyle("if")}>
        <span style={{ color: C_INT }}>System</span>
        <span style={{ color: "#d4d4d4" }}>.out.</span>
        <span style={{ color: "#dcdcaa" }}>println</span>
        <span style={{ color: "#d4d4d4" }}>(</span>
        <span style={{ color: C_STR }}>"합격"</span>
        <span style={{ color: "#d4d4d4" }}>);</span>
      </div>

      {!showElse ? (
        <div>
          <span style={{ color: "#d4d4d4" }}>{"}"}</span>
        </div>
      ) : (
        <>
          {/* } else { */}
          <div>
            <span style={{ color: "#d4d4d4" }}>{"} "}</span>
            <span style={{ color: C_CTRL }}>else</span>
            <span style={{ color: "#d4d4d4" }}> {"{"}</span>
          </div>

          {/* System.out.println("불합격"); */}
          <div style={bodyStyle("else")}>
            <span style={{ color: C_INT }}>System</span>
            <span style={{ color: "#d4d4d4" }}>.out.</span>
            <span style={{ color: "#dcdcaa" }}>println</span>
            <span style={{ color: "#d4d4d4" }}>(</span>
            <span style={{ color: C_STR }}>"불합격"</span>
            <span style={{ color: "#d4d4d4" }}>);</span>
          </div>

          {/* } */}
          <div>
            <span style={{ color: "#d4d4d4" }}>{"}"}</span>
          </div>
        </>
      )}
    </div>
  );
};

// ── 씬: OverviewScene — 제어문 개요 ──────────────────────────
//   Sentence 1: 제어문 트리 (조건문 / 반복문)
//   Sentence 2: 조건문 하이라이트 + if 키워드 강조
const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { overview: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d, { in: true });

  const phase2 = frame >= split0;

  // 등장 애니메이션
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
  const ifAppear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 44,
  });

  const C_COND = "#c586c0"; // 조건문 색
  const C_LOOP = "#4ec9b0"; // 반복문 색
  const C_DIM = "rgba(255,255,255,0.22)";

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
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 제어문 개요" />

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

              {/* 연결선 — 고정 높이로 겹침 방지 */}
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

              {/* 조건문 / 반복문 */}
              <div
                style={{ display: "flex", gap: 56, alignItems: "flex-start" }}
              >
                {/* 조건문 + if */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0,
                  }}
                >
                  <div style={nodeStyle(C_COND, true, leftAppear)}>조건문</div>
                  {/* phase 2: if 키워드 — opacity로 제어해 레이아웃 밀림 방지 */}
                  <div
                    style={{
                      width: 2,
                      height: 20,
                      background: "rgba(255,255,255,0.18)",
                      opacity: ifAppear,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 52,
                      fontWeight: 900,
                      color: C_CTRL,
                      background: `${C_CTRL}18`,
                      border: `2px solid ${C_CTRL}55`,
                      borderRadius: 18,
                      padding: "14px 44px",
                      opacity: ifAppear,
                      transform: `scale(${interpolate(ifAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                      boxShadow: `0 0 32px ${C_CTRL}33`,
                    }}
                  >
                    if
                  </div>
                </div>
                {/* 반복문 */}
                <div style={nodeStyle(C_LOOP, !phase2, rightAppear)}>
                  반복문
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

// ── 씬: ThumbnailScene ────────────────────────────────────────
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
        <span style={{ color: "#4ec9b0" }}>조건문</span>
      </div>
      {/* if / else 키워드 */}
      <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
        {["if", "else"].map((kw) => (
          <div
            key={kw}
            style={{
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 56,
              fontWeight: 900,
              color: "#4ec9b0",
              background: "#4ec9b018",
              border: "2px solid #4ec9b055",
              borderRadius: 18,
              padding: "18px 44px",
            }}
          >
            {kw}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);
  const ifTriggerFrame =
    AUDIO_CONFIG.intro.wordTiming["참일"]?.[0] ?? intro.speechStartFrame;
  const elseTriggerFrame =
    AUDIO_CONFIG.intro.wordTiming["else를"]?.[0] ??
    intro.narrationSplits[0] ??
    intro.speechStartFrame;

  const ifAppear = spring({
    frame: frame - ifTriggerFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 56,
  });
  const elseAppear = spring({
    frame: frame - elseTriggerFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 56,
  });

  const keyword = (text: string, appear: number) => {
    const sc = interpolate(appear, [0, 1], [0.7, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          fontFamily: monoFont,
          fontFeatureSettings: MONO_NO_LIGA,
          fontSize: 64,
          fontWeight: 900,
          color: C_CTRL,
          background: `${C_CTRL}18`,
          border: `2px solid ${C_CTRL}55`,
          borderRadius: 20,
          padding: "20px 52px",
          opacity: appear,
          transform: `scale(${sc})`,
          boxShadow: `0 0 40px ${C_CTRL}22`,
        }}
      >
        {text}
      </div>
    );
  };

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(intro.audio)} />
          <SceneTitle title="2. if 문이란?" />
          {/* 조건 다이어그램 미리보기 */}
          <div
            style={{
              position: "absolute",
              top: "44%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* 조건 박스 */}
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 32,
                color: "#888",
                background: "#2d2d2d",
                borderRadius: 12,
                padding: "14px 36px",
                border: "2px solid #333",
              }}
            >
              <span style={{ color: "#d4d4d4" }}>조건 </span>
              <span style={{ color: C_CMP }}>?</span>
            </div>
            {/* 두 갈래 */}
            <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: FONT.label,
                    color: C_TRUE,
                    opacity: 0.8,
                  }}
                >
                  참
                </div>
                {keyword("if", ifAppear)}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: FONT.label,
                    color: C_FALSE,
                    opacity: 0.8,
                  }}
                >
                  거짓
                </div>
                {keyword("else", elseAppear)}
              </div>
            </div>
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

// ── 씬: IfScene ───────────────────────────────────────────────
const IfScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { ifScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. if 문 실행" />

          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "46%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CodeBlock
                score={75}
                showElse={false}
                activeBlock={frame >= split0 ? "if" : null}
                startFrame={s}
              />
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.ifScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: IfElseScene ───────────────────────────────────────────
const IfElseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { ifElseScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  // split0 이후: score 45, else 분기 활성
  const showFalse = frame >= split0;

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. if-else 문" />

          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CodeBlock
                score={showFalse ? 45 : 75}
                showElse={true}
                activeBlock={showFalse ? "else" : "if"}
                startFrame={s}
              />
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.ifElseScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: SummaryScene ─────────────────────────────────────────
const SUMMARY_ROWS = [
  { kw: "if", color: C_TRUE, desc: "조건이 참일 때 실행" },
  { kw: "else", color: C_FALSE, desc: "조건이 거짓일 때 실행" },
] as const;

const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="5. 조건문 정리" />

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 24,
              width: 860,
            }}
          >
            {SUMMARY_ROWS.map((row, i) => {
              const triggerFrame =
                i === 0
                  ? (AUDIO_CONFIG.summaryScene.wordTiming["if는"]?.[0] ??
                    cfg.speechStartFrame)
                  : (AUDIO_CONFIG.summaryScene.wordTiming["else는"]?.[0] ??
                    cfg.speechStartFrame);
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
                    gap: 28,
                    background: "#2a2a2a",
                    border: `2px solid ${row.color}55`,
                    borderRadius: 20,
                    padding: "26px 40px",
                    opacity: appear,
                    transform: `scale(${sc})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: C_CTRL,
                      fontSize: 46,
                      fontWeight: 900,
                      minWidth: 100,
                    }}
                  >
                    {row.kw}
                  </span>
                  <span style={{ color: "#3a3a3a", fontSize: 28 }}>—</span>
                  <span
                    style={{
                      fontFamily: uiFont,
                      fontSize: 32,
                      color: "#d4d4d4",
                    }}
                  >
                    {row.desc}
                  </span>
                </div>
              );
            })}

            {/* 코드 미리보기 */}
            {(() => {
              const codePreviewTrigger =
                AUDIO_CONFIG.summaryScene.wordTiming["코드를"]?.[0] ??
                cfg.narrationSplits[0] ??
                cfg.speechStartFrame;
              const appear = spring({
                frame: frame - codePreviewTrigger,
                fps,
                config: { damping: 13, stiffness: 130 },
                durationInFrames: 52,
              });
              const sc = interpolate(appear, [0, 1], [0.85, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  style={{
                    background: "#252525",
                    borderRadius: 16,
                    padding: "24px 36px",
                    marginTop: 8,
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 26,
                    lineHeight: 1.85,
                    opacity: appear,
                    transform: `scale(${sc})`,
                  }}
                >
                  <div>
                    <span style={{ color: C_CTRL }}>if</span>
                    <span style={{ color: "#d4d4d4" }}> (score </span>
                    <span style={{ color: C_CMP }}>{">="} </span>
                    <span style={{ color: C_NUM }}>60</span>
                    <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
                  </div>
                  <div style={{ paddingLeft: 32 }}>
                    <span style={{ color: "#dcdcaa" }}>println</span>
                    <span style={{ color: "#d4d4d4" }}>(</span>
                    <span style={{ color: C_STR }}>"합격"</span>
                    <span style={{ color: "#d4d4d4" }}>);</span>
                  </div>
                  <div>
                    <span style={{ color: "#d4d4d4" }}>{"}"} </span>
                    <span style={{ color: C_CTRL }}>else</span>
                    <span style={{ color: "#d4d4d4" }}> {"{"}</span>
                  </div>
                  <div style={{ paddingLeft: 32 }}>
                    <span style={{ color: "#dcdcaa" }}>println</span>
                    <span style={{ color: "#d4d4d4" }}>(</span>
                    <span style={{ color: C_STR }}>"불합격"</span>
                    <span style={{ color: "#d4d4d4" }}>);</span>
                  </div>
                  <div>
                    <span style={{ color: "#d4d4d4" }}>{"}"}</span>
                  </div>
                </div>
              );
            })()}
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

// ── 씬 목록 + fromValues ──────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.overview,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.ifScene,
  VIDEO_CONFIG.ifElseScene,
  VIDEO_CONFIG.summaryScene,
];
const sceneDurations = sceneList.map((s) => s.durationInFrames);
const fromValues = computeFromValues(sceneDurations, {
  cross: CROSS,
  firstOverlap: THUMB_CROSS,
});
const totalDuration =
  fromValues[fromValues.length - 1] + sceneDurations[sceneDurations.length - 1];

// ── SRT 데이터 (scripts/srt.ts 에서 사용) ────────────────────
/** 절대 프레임 기준 자막 큐 목록 — srt.ts가 읽어서 .srt 파일 생성 */
export const SRT_DATA: SrtEntry[] = (() => {
  const entries: SrtEntry[] = [];
  const froms = computeFromValues(sceneDurations, {
    cross: CROSS,
    firstOverlap: THUMB_CROSS,
  });

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
  // [3]=ifScene
  addSrtScene(
    entries,
    froms[3],
    VIDEO_CONFIG.ifScene.narration,
    AUDIO_CONFIG.ifScene.speechStartFrame,
    AUDIO_CONFIG.ifScene.narrationSplits,
    AUDIO_CONFIG.ifScene.sentenceEndFrames,
    VIDEO_CONFIG.ifScene.durationInFrames,
  );
  // [4]=ifElseScene
  addSrtScene(
    entries,
    froms[4],
    VIDEO_CONFIG.ifElseScene.narration,
    AUDIO_CONFIG.ifElseScene.speechStartFrame,
    AUDIO_CONFIG.ifElseScene.narrationSplits,
    AUDIO_CONFIG.ifElseScene.sentenceEndFrames,
    VIDEO_CONFIG.ifElseScene.durationInFrames,
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
export const JavaIf: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
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
      durationInFrames={VIDEO_CONFIG.ifScene.durationInFrames}
    >
      <IfScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.ifElseScene.durationInFrames}
    >
      <IfElseScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaIf;
