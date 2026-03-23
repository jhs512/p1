// src/compositions/003-RGB-Method/KOR/001-1-RGBMethod.tsx
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import React from "react";

import { CROSS, SceneAudio, Subtitle, THUMB_CROSS, uiFont, useFade } from "../../../utils/scene";
import { computeFromValues } from "../../../utils/srt";
import { CONTENT } from "./001-2-content";
import { AUDIO_CONFIG } from "./001-3-audio.gen";
import {
  BG,
  BG_CARD,
  BG_THUMB,
  C_BLUE,
  C_BORDER,
  C_GREEN,
  C_RED,
  TEXT,
  TEXT_ON_ACCENT,
  TEXT_SECONDARY,
} from "./colors";
import { FPS, HEIGHT, WIDTH } from "./config";

// ── 4K 폰트 스케일 ─────────────────────────────────────────
const F = {
  label: 52,
  heading: 64,
  title: 88,
  display: 112,
  body: 48,
  subtitle: 56,
} as const;

// ── 4K용 ContentArea ────────────────────────────────────────
const BOTTOM_MARGIN_4K = 250;
const SUBTITLE_DEAD_ZONE_4K = BOTTOM_MARGIN_4K + 120;

const ContentArea4K: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height - SUBTITLE_DEAD_ZONE_4K,
        overflow: "visible",
      }}
    >
      {children}
    </div>
  );
};

// ── 4K용 Subtitle ───────────────────────────────────────────
const Subtitle4K: React.FC<{
  sentences: string[];
  splits?: readonly number[];
  speechStart?: number;
  wordFrames?: readonly (readonly number[])[];
}> = (props) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: BOTTOM_MARGIN_4K + 120,
    }}
  >
    <Subtitle {...props} />
  </div>
);

// ── SceneTitle4K ────────────────────────────────────────────
const SceneTitle4K: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      position: "absolute",
      top: 80,
      left: 100,
      fontFamily: uiFont,
      fontSize: F.heading,
      fontWeight: 700,
      color: TEXT,
      letterSpacing: 1,
    }}
  >
    {title}
  </div>
);

// ── VIDEO_CONFIG ────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },

  openingQuote: {
    audio: "rgb-openingQuote.mp3",
    durationInFrames: AUDIO_CONFIG.openingQuote.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.openingQuote.speechStartFrame,
    narration: CONTENT.openingQuote.narration as string[],
    narrationSplits: AUDIO_CONFIG.openingQuote.narrationSplits,
  },

  coreTable: {
    audio: "rgb-coreTable.mp3",
    durationInFrames: AUDIO_CONFIG.coreTable.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.coreTable.speechStartFrame,
    narration: CONTENT.coreTable.narration as string[],
    narrationSplits: AUDIO_CONFIG.coreTable.narrationSplits,
  },

  summary: {
    audio: "rgb-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summary.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summary.speechStartFrame,
    narration: CONTENT.summary.narration as string[],
    narrationSplits: AUDIO_CONFIG.summary.narrationSplits,
  },

  motivation: {
    audio: "rgb-motivation.mp3",
    durationInFrames: AUDIO_CONFIG.motivation.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.motivation.speechStartFrame,
    narration: CONTENT.motivation.narration as string[],
    narrationSplits: AUDIO_CONFIG.motivation.narrationSplits,
  },

  everyoneKnows: {
    audio: "rgb-everyoneKnows.mp3",
    durationInFrames: AUDIO_CONFIG.everyoneKnows.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.everyoneKnows.speechStartFrame,
    narration: CONTENT.everyoneKnows.narration as string[],
    narrationSplits: AUDIO_CONFIG.everyoneKnows.narrationSplits,
  },

  structureVsSpec: {
    audio: "rgb-structureVsSpec.mp3",
    durationInFrames: AUDIO_CONFIG.structureVsSpec.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.structureVsSpec.speechStartFrame,
    narration: CONTENT.structureVsSpec.narration as string[],
    narrationSplits: AUDIO_CONFIG.structureVsSpec.narrationSplits,
  },

  structureDetail: {
    audio: "rgb-structureDetail.mp3",
    durationInFrames: AUDIO_CONFIG.structureDetail.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.structureDetail.speechStartFrame,
    narration: CONTENT.structureDetail.narration as string[],
    narrationSplits: AUDIO_CONFIG.structureDetail.narrationSplits,
  },

  specDetail: {
    audio: "rgb-specDetail.mp3",
    durationInFrames: AUDIO_CONFIG.specDetail.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.specDetail.speechStartFrame,
    narration: CONTENT.specDetail.narration as string[],
    narrationSplits: AUDIO_CONFIG.specDetail.narrationSplits,
  },

  guardScene: {
    audio: "rgb-guardScene.mp3",
    durationInFrames: AUDIO_CONFIG.guardScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.guardScene.speechStartFrame,
    narration: CONTENT.guardScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.guardScene.narrationSplits,
  },

  buildScene: {
    audio: "rgb-buildScene.mp3",
    durationInFrames: AUDIO_CONFIG.buildScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.buildScene.speechStartFrame,
    narration: CONTENT.buildScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.buildScene.narrationSplits,
  },

  rgbLoop: {
    audio: "rgb-rgbLoop.mp3",
    durationInFrames: AUDIO_CONFIG.rgbLoop.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.rgbLoop.speechStartFrame,
    narration: CONTENT.rgbLoop.narration as string[],
    narrationSplits: AUDIO_CONFIG.rgbLoop.narrationSplits,
  },

  aiRole: {
    audio: "rgb-aiRole.mp3",
    durationInFrames: AUDIO_CONFIG.aiRole.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.aiRole.speechStartFrame,
    narration: CONTENT.aiRole.narration as string[],
    narrationSplits: AUDIO_CONFIG.aiRole.narrationSplits,
  },

  conclusion: {
    audio: "rgb-conclusion.mp3",
    durationInFrames: AUDIO_CONFIG.conclusion.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.conclusion.speechStartFrame,
    narration: CONTENT.conclusion.narration as string[],
    narrationSplits: AUDIO_CONFIG.conclusion.narrationSplits,
  },

  closingQuote: {
    audio: "rgb-closingQuote.mp3",
    durationInFrames: AUDIO_CONFIG.closingQuote.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.closingQuote.speechStartFrame,
    narration: CONTENT.closingQuote.narration as string[],
    narrationSplits: AUDIO_CONFIG.closingQuote.narrationSplits,
  },
} as const;

// ── 씬 목록 & fromValues ────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.openingQuote,
  VIDEO_CONFIG.coreTable,
  VIDEO_CONFIG.summary,
  VIDEO_CONFIG.motivation,
  VIDEO_CONFIG.everyoneKnows,
  VIDEO_CONFIG.structureVsSpec,
  VIDEO_CONFIG.structureDetail,
  VIDEO_CONFIG.specDetail,
  VIDEO_CONFIG.guardScene,
  VIDEO_CONFIG.buildScene,
  VIDEO_CONFIG.rgbLoop,
  VIDEO_CONFIG.aiRole,
  VIDEO_CONFIG.conclusion,
  VIDEO_CONFIG.closingQuote,
];

const fromValues = computeFromValues(
  sceneList.map((s) => s.durationInFrames),
  { cross: CROSS, firstOverlap: THUMB_CROSS },
);
const totalDuration =
  fromValues[fromValues.length - 1] +
  sceneList[sceneList.length - 1].durationInFrames;

export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: totalDuration,
};

// ── 씬: ThumbnailScene ──────────────────────────────────────
const ThumbnailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [60 - THUMB_CROSS, 60], [1, 0], {
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
        gap: 40,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 12,
          display: "flex",
          gap: 24,
        }}
      >
        <span style={{ color: C_RED }}>R</span>
        <span style={{ color: C_GREEN }}>G</span>
        <span style={{ color: C_BLUE }}>B</span>
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 160,
          fontWeight: 900,
          lineHeight: 1.1,
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        RGB
        <br />
        <span style={{ fontSize: 100, fontWeight: 700 }}>개발 방법론</span>
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 48,
          fontWeight: 600,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        AI 시대의 삼권분립 코딩
      </div>
    </AbsoluteFill>
  );
};

// ── 씬: OpeningQuoteScene ───────────────────────────────────
const OpeningQuoteScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.openingQuote;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 40,
  });

  const scale = interpolate(appear, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${scale})`,
              textAlign: "center",
              opacity: appear,
              maxWidth: 2800,
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 200,
                color: TEXT_SECONDARY,
                lineHeight: 0.5,
                marginBottom: 40,
              }}
            >
              "
            </div>
            <div
              style={{
                fontFamily: uiFont,
                fontSize: F.title,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.6,
              }}
            >
              좋은 질서를 바라지 말고,
              <br />
              좋은 질서를 가져라.
            </div>
            <div
              style={{
                fontFamily: uiFont,
                fontSize: F.body,
                fontWeight: 400,
                color: TEXT_SECONDARY,
                marginTop: 60,
              }}
            >
              그 질서 위에서 코드와 구조는 스스로 정렬된다.
            </div>
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.openingQuote.wordStartFrames}
      />
    </>
  );
};

// ── 씬: CoreTableScene ──────────────────────────────────────
const TABLE_ROWS = [
  { gov: "입법부", rgb: "Rules", actual: "구조 룰, 스펙 룰", color: C_RED },
  { gov: "사법부", rgb: "Guard", actual: "Test Cases", color: C_GREEN },
  { gov: "행정부", rgb: "Build", actual: "Application Code", color: C_BLUE },
];

const CoreTableScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.coreTable;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title="핵심 구조" />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 2800,
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 24,
                opacity: interpolate(frame, [s, s + 15], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {["현실의 삼권분립", "RGB 방법론", "실제 형태"].map((h) => (
                <div
                  key={h}
                  style={{
                    flex: 1,
                    fontFamily: uiFont,
                    fontSize: F.label,
                    fontWeight: 700,
                    color: TEXT_SECONDARY,
                    padding: "20px 32px",
                    background: "rgba(0,0,0,0.04)",
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* 행 */}
            {TABLE_ROWS.map((row, i) => {
              const rowStart = i === 0 ? s : splits[Math.min(i, splits.length - 1)];
              const appear = spring({
                frame: frame - rowStart,
                fps,
                config: { damping: 13, stiffness: 130 },
                durationInFrames: 26,
              });
              const rowScale = interpolate(appear, [0, 1], [0.9, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={row.rgb}
                  style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 16,
                    opacity: appear,
                    transform: `scale(${rowScale})`,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      fontFamily: uiFont,
                      fontSize: F.body,
                      fontWeight: 600,
                      color: TEXT,
                      padding: "28px 32px",
                      background: BG_CARD,
                      borderRadius: 16,
                      textAlign: "center",
                      border: `1px solid ${C_BORDER}`,
                    }}
                  >
                    {row.gov}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontFamily: uiFont,
                      fontSize: F.body,
                      fontWeight: 800,
                      color: TEXT_ON_ACCENT,
                      padding: "28px 32px",
                      background: row.color,
                      borderRadius: 16,
                      textAlign: "center",
                    }}
                  >
                    {row.rgb}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontFamily: uiFont,
                      fontSize: F.body,
                      fontWeight: 500,
                      color: TEXT,
                      padding: "28px 32px",
                      background: BG_CARD,
                      borderRadius: 16,
                      textAlign: "center",
                      border: `1px solid ${C_BORDER}`,
                    }}
                  >
                    {row.actual}
                  </div>
                </div>
              );
            })}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.coreTable.wordStartFrames}
      />
    </>
  );
};

// ── 공통: BulletListScene ───────────────────────────────────
const BulletListScene: React.FC<{
  sceneKey: keyof typeof VIDEO_CONFIG;
  title: string;
}> = ({ sceneKey, title }) => {
  const cfg = VIDEO_CONFIG[sceneKey];
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits ?? [];
  const narration = cfg.narration;
  const starts = [s, ...splits];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title={title} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 2800,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {narration.map((sentence, i) => {
              const appear = spring({
                frame: frame - starts[i],
                fps,
                config: { damping: 13, stiffness: 130 },
                durationInFrames: 26,
              });
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: uiFont,
                    fontSize: F.body,
                    fontWeight: 500,
                    color: TEXT,
                    lineHeight: 1.7,
                    padding: "28px 48px",
                    background: BG_CARD,
                    borderRadius: 16,
                    border: `1px solid ${C_BORDER}`,
                    opacity: appear,
                    transform: `translateY(${interpolate(appear, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })  }px)`,
                  }}
                >
                  {sentence.replace(/\[([^\]]*?)\(발음:[^\)]*\)\]/g, "$1").replace(/\n/g, " ")}
                </div>
              );
            })}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG[sceneKey as keyof typeof AUDIO_CONFIG]?.wordStartFrames}
      />
    </>
  );
};

// ── 씬: StructureVsSpecScene ────────────────────────────────
const StructureVsSpecScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.structureVsSpec;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;

  const appear1 = spring({
    frame: frame - s,
    fps,
    config: { damping: 13, stiffness: 130 },
    durationInFrames: 26,
  });
  const appear2 = spring({
    frame: frame - (splits[0] ?? s + 60),
    fps,
    config: { damping: 13, stiffness: 130 },
    durationInFrames: 26,
  });
  const appear3 = spring({
    frame: frame - (splits[1] ?? s + 120),
    fps,
    config: { damping: 13, stiffness: 130 },
    durationInFrames: 26,
  });

  const cardStyle = (color: string, appear: number): React.CSSProperties => ({
    flex: 1,
    padding: "60px 48px",
    background: BG_CARD,
    borderRadius: 20,
    borderLeft: `8px solid ${color}`,
    border: `1px solid ${C_BORDER}`,
    borderLeftWidth: 8,
    borderLeftColor: color,
    opacity: appear,
    transform: `scale(${interpolate(appear, [0, 1], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title="Rules의 두 영역" />
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: uiFont,
              fontSize: F.heading,
              fontWeight: 700,
              color: C_RED,
              opacity: appear1,
              textAlign: "center",
            }}
          >
            Rules = 구조 Rule + 스펙 Rule
          </div>
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 2800,
              display: "flex",
              gap: 40,
            }}
          >
            <div style={cardStyle(C_RED, appear2)}>
              <div
                style={{
                  fontSize: F.heading,
                  fontWeight: 800,
                  color: C_RED,
                  marginBottom: 20,
                }}
              >
                구조 Rule
              </div>
              <div
                style={{
                  fontSize: F.body,
                  fontWeight: 500,
                  color: TEXT,
                  lineHeight: 1.7,
                }}
              >
                코드를 어떻게 만들어야 하는지
              </div>
            </div>
            <div style={cardStyle(C_RED, appear3)}>
              <div
                style={{
                  fontSize: F.heading,
                  fontWeight: 800,
                  color: C_RED,
                  marginBottom: 20,
                }}
              >
                스펙 Rule
              </div>
              <div
                style={{
                  fontSize: F.body,
                  fontWeight: 500,
                  color: TEXT,
                  lineHeight: 1.7,
                }}
              >
                무엇을 만들어야 하는지
              </div>
            </div>
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.structureVsSpec.wordStartFrames}
      />
    </>
  );
};

// ── 씬: RGBCardScene (Guard / Build) ────────────────────────
const RGBCardScene: React.FC<{
  sceneKey: "guardScene" | "buildScene";
  title: string;
  label: string;
  color: string;
  description: string;
}> = ({ sceneKey, title, label, color, description }) => {
  const cfg = VIDEO_CONFIG[sceneKey];
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = cfg.speechStartFrame;

  const appear = spring({
    frame: frame - s,
    fps,
    config: { damping: 13, stiffness: 130 },
    durationInFrames: 30,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title={title} />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${interpolate(appear, [0, 1], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              width: 2000,
              padding: "80px 80px",
              background: BG_CARD,
              borderRadius: 24,
              borderLeft: `12px solid ${color}`,
              border: `1px solid ${C_BORDER}`,
              borderLeftWidth: 12,
              borderLeftColor: color,
              opacity: appear,
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: F.display,
                fontWeight: 900,
                color,
                marginBottom: 32,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: uiFont,
                fontSize: F.body,
                fontWeight: 500,
                color: TEXT,
                lineHeight: 1.7,
              }}
            >
              {description}
            </div>
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG[sceneKey].wordStartFrames}
      />
    </>
  );
};

// ── 씬: RGBLoopScene ────────────────────────────────────────
const LOOP_NODES = [
  { label: "Rules", color: C_RED, x: 1920, y: 500 },
  { label: "Guard", color: C_GREEN, x: 2600, y: 1100 },
  { label: "Build", color: C_BLUE, x: 1240, y: 1100 },
];

const RGBLoopScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.rgbLoop;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const starts = [s, ...splits];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title="반복 루프" />
          {LOOP_NODES.map((node, i) => {
            const appear = spring({
              frame: frame - starts[Math.min(i + 1, starts.length - 1)],
              fps,
              config: { damping: 12, stiffness: 130 },
              durationInFrames: 26,
            });
            return (
              <div
                key={node.label}
                style={{
                  position: "absolute",
                  left: node.x,
                  top: node.y,
                  transform: `translate(-50%, -50%) scale(${interpolate(appear, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  width: 360,
                  height: 360,
                  borderRadius: "50%",
                  background: node.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: uiFont,
                  fontSize: F.heading,
                  fontWeight: 800,
                  color: TEXT_ON_ACCENT,
                  opacity: appear,
                }}
              >
                {node.label}
              </div>
            );
          })}
          {/* 화살표 (간단한 → 텍스트) */}
          {[
            { x: 2340, y: 740, rotate: 45 },
            { x: 1920, y: 1200, rotate: 180 },
            { x: 1500, y: 740, rotate: -45 },
          ].map((arrow, i) => {
            const appear = spring({
              frame: frame - starts[Math.min(i + 2, starts.length - 1)],
              fps,
              config: { damping: 14, stiffness: 140 },
              durationInFrames: 24,
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: arrow.x,
                  top: arrow.y,
                  transform: `translate(-50%, -50%) rotate(${arrow.rotate}deg)`,
                  fontSize: 80,
                  color: TEXT_SECONDARY,
                  opacity: appear,
                }}
              >
                →
              </div>
            );
          })}
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.rgbLoop.wordStartFrames}
      />
    </>
  );
};

// ── 씬: ClosingQuoteScene (마지막 — fadeOut 없음) ───────────
const ClosingQuoteScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.closingQuote;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 40,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              opacity: appear,
              maxWidth: 2800,
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 200,
                color: TEXT_SECONDARY,
                lineHeight: 0.5,
                marginBottom: 40,
              }}
            >
              "
            </div>
            <div
              style={{
                fontFamily: uiFont,
                fontSize: F.title,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.6,
              }}
            >
              좋은 질서를 바라지 말고,
              <br />
              좋은 질서를 가져라.
            </div>
            <div
              style={{
                fontFamily: uiFont,
                fontSize: F.body,
                fontWeight: 400,
                color: TEXT_SECONDARY,
                marginTop: 60,
              }}
            >
              그 질서 안에서 코드는 스스로 정렬됩니다.
            </div>
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle4K
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.closingQuote.wordStartFrames}
      />
    </>
  );
};

// ── 메인 컴포지션 ───────────────────────────────────────────
const RGBMethod: React.FC = () => (
  <>
    <Sequence from={fromValues[0]} durationInFrames={sceneList[0].durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={sceneList[1].durationInFrames}>
      <OpeningQuoteScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={sceneList[2].durationInFrames}>
      <CoreTableScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={sceneList[3].durationInFrames}>
      <BulletListScene sceneKey="summary" title="RGB 요약" />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={sceneList[4].durationInFrames}>
      <BulletListScene sceneKey="motivation" title="왜 이런 생각을 하게 됐나" />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={sceneList[5].durationInFrames}>
      <BulletListScene sceneKey="everyoneKnows" title="다들 아는 이야기" />
    </Sequence>
    <Sequence from={fromValues[6]} durationInFrames={sceneList[6].durationInFrames}>
      <StructureVsSpecScene />
    </Sequence>
    <Sequence from={fromValues[7]} durationInFrames={sceneList[7].durationInFrames}>
      <BulletListScene sceneKey="structureDetail" title="구조 Rule — 헌법 & 법률" />
    </Sequence>
    <Sequence from={fromValues[8]} durationInFrames={sceneList[8].durationInFrames}>
      <BulletListScene sceneKey="specDetail" title="스펙 Rule — 헌법 & 법률" />
    </Sequence>
    <Sequence from={fromValues[9]} durationInFrames={sceneList[9].durationInFrames}>
      <RGBCardScene
        sceneKey="guardScene"
        title="사법부"
        label="Guard"
        color={C_GREEN}
        description="규칙을 어기면 테스트는 실패합니다. 프로젝트의 질서를 강제합니다."
      />
    </Sequence>
    <Sequence from={fromValues[10]} durationInFrames={sceneList[10].durationInFrames}>
      <RGBCardScene
        sceneKey="buildScene"
        title="행정부"
        label="Build"
        color={C_BLUE}
        description="Rules와 Guard가 정한 범위 안에서만 동작하는 실제 구현입니다."
      />
    </Sequence>
    <Sequence from={fromValues[11]} durationInFrames={sceneList[11].durationInFrames}>
      <RGBLoopScene />
    </Sequence>
    <Sequence from={fromValues[12]} durationInFrames={sceneList[12].durationInFrames}>
      <BulletListScene sceneKey="aiRole" title="AI가 수행한다" />
    </Sequence>
    <Sequence from={fromValues[13]} durationInFrames={sceneList[13].durationInFrames}>
      <BulletListScene sceneKey="conclusion" title="결론" />
    </Sequence>
    <Sequence from={fromValues[14]} durationInFrames={sceneList[14].durationInFrames}>
      <ClosingQuoteScene />
    </Sequence>
  </>
);

export { RGBMethod as Component };
