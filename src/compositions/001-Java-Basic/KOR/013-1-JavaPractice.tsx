// src/compositions/001-Java-Basic/KOR/013-1-JavaPractice.tsx
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
import { JavaLine } from "../../../utils/code";
import {
  CODE,
  CROSS,
  ContentArea,
  FONT,
  SceneTitle,
  Subtitle,
  THUMB_CROSS,
  monoStyle,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { computeFromValues } from "../../../utils/srt";
import { CONTENT } from "./013-2-content";
import { AUDIO_CONFIG } from "./013-3-audio.gen";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_DIM,
  C_FUNC,
  C_NUMBER,
  C_TEAL,
  TEXT,
} from "./colors";
import { HEIGHT, WIDTH } from "./config";

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  printScene: {
    audio: "prac-print.mp3",
    durationInFrames: AUDIO_CONFIG.printScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.printScene.speechStartFrame,
    narration: CONTENT.printScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.printScene.narrationSplits,
  },
  sumScene: {
    audio: "prac-sum.mp3",
    durationInFrames: AUDIO_CONFIG.sumScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.sumScene.speechStartFrame,
    narration: CONTENT.sumScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.sumScene.narrationSplits,
  },
  sumEvenScene: {
    audio: "prac-sumEven.mp3",
    durationInFrames: AUDIO_CONFIG.sumEvenScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.sumEvenScene.speechStartFrame,
    narration: CONTENT.sumEvenScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.sumEvenScene.narrationSplits,
  },
  comparisonScene: {
    audio: "prac-comparison.mp3",
    durationInFrames: AUDIO_CONFIG.comparisonScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.comparisonScene.speechStartFrame,
    narration: CONTENT.comparisonScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.comparisonScene.narrationSplits,
  },
  callScene: {
    audio: "prac-call.mp3",
    durationInFrames: AUDIO_CONFIG.callScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.callScene.speechStartFrame,
    narration: CONTENT.callScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.callScene.narrationSplits,
  },
  summaryScene: {
    audio: "prac-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
} as const;

// ── 코드 데이터 ────────────────────────────────────────────────
const PRINT_CODE = [
  "void printRange(int start, int end) {",
  "    for (int i = start; i <= end; i++) {",
  "        System.out.println(i);",
  "    }",
  "}",
];

const SUM_CODE = [
  "int sumRange(int start, int end) {",
  "    int total = 0;",
  "    for (int i = start; i <= end; i++) {",
  "        total += i;",
  "    }",
  "    return total;",
  "}",
];

const SUM_EVEN_CODE = [
  "int sumEven(int start, int end) {",
  "    int total = 0;",
  "    for (int i = start; i <= end; i++) {",
  "        if (i % 2 == 0) {",
  "            total += i;",
  "        }",
  "    }",
  "    return total;",
  "}",
];

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
          background: `radial-gradient(circle, ${C_TEAL}1e 0%, transparent 70%)`,
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
          fontSize: 108,
          fontWeight: 900,
          lineHeight: 1,
          textAlign: "center",
          color: "#ffffff",
          textShadow: `0 0 60px ${C_TEAL}99, 0 0 120px ${C_TEAL}44`,
        }}
      >
        Java
        <br />
        <span style={{ color: C_TEAL }}>함수 실전</span>
      </div>
      <div
        style={{
          ...monoStyle,
          fontSize: 64,
          fontWeight: 900,
          color: C_TEAL,
          background: "#4ec9b018",
          border: "2px solid #4ec9b055",
          borderRadius: 18,
          padding: "18px 56px",
          marginTop: 8,
        }}
      >
        {CONTENT.thumbnail.badge}
      </div>
    </AbsoluteFill>
  );
};

// ── 씬: PrintScene — 1. 범위 출력 ──────────────────────────────
const PrintScene: React.FC = () => {
  const { printScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 30,
  });

  // 2문장: 실행 결과 등장
  const resultAppear = spring({
    frame: frame - split,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 30,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 범위 출력" />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            {/* 코드 블록 */}
            <div
              style={{
                background: BG_CODE,
                borderRadius: 12,
                padding: "24px 36px",
                ...monoStyle,
                fontSize: CODE.lg,
                opacity: codeAppear,
                transform: `scale(${interpolate(codeAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              {PRINT_CODE.map((line, i) => (
                <div
                  key={i}
                  style={{ lineHeight: "1.9", color: TEXT, whiteSpace: "pre" }}
                >
                  <JavaLine text={line} />
                </div>
              ))}
            </div>

            {/* 2문장: 실행 결과 */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: resultAppear,
                transform: `scale(${interpolate(resultAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              {[1, 2, 3, 4, 5].map((n, i) => {
                const stagger = spring({
                  frame: frame - split - i * 4,
                  fps,
                  config: { damping: 13, stiffness: 140 },
                  durationInFrames: 20,
                });
                return (
                  <div
                    key={n}
                    style={{
                      ...monoStyle,
                      fontSize: FONT.title,
                      fontWeight: 700,
                      color: C_NUMBER,
                      background: `${C_TEAL}16`,
                      border: `2px solid ${C_TEAL}44`,
                      borderRadius: 12,
                      padding: "12px 22px",
                      opacity: stagger,
                      transform: `translateY(${interpolate(stagger, [0, 1], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                    }}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.printScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: SumScene — 2. 범위 합산 ────────────────────────────────
const SumScene: React.FC = () => {
  const { sumScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 30,
  });

  // 2문장: 누적 합산 시각화
  const accumAppear = spring({
    frame: frame - split,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 30,
  });

  const accumValues = [0, 1, 3, 6, 10, 15];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="2. 범위 합산" />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            {/* 코드 블록 */}
            <div
              style={{
                background: BG_CODE,
                borderRadius: 12,
                padding: "20px 32px",
                ...monoStyle,
                fontSize: CODE.md,
                opacity: codeAppear,
                transform: `scale(${interpolate(codeAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              {SUM_CODE.map((line, i) => (
                <div
                  key={i}
                  style={{ lineHeight: "1.9", color: TEXT, whiteSpace: "pre" }}
                >
                  <JavaLine text={line} />
                </div>
              ))}
            </div>

            {/* 2문장: 누적 합산 시각화 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: accumAppear,
              }}
            >
              {accumValues.map((v, i) => {
                const stagger = spring({
                  frame: frame - split - i * 5,
                  fps,
                  config: { damping: 13, stiffness: 140 },
                  durationInFrames: 20,
                });
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <div
                        style={{
                          ...monoStyle,
                          fontSize: FONT.label,
                          color: C_DIM,
                          opacity: stagger,
                        }}
                      >
                        →
                      </div>
                    )}
                    <div
                      style={{
                        ...monoStyle,
                        fontSize: FONT.heading,
                        fontWeight: 700,
                        color: i === accumValues.length - 1 ? C_TEAL : C_NUMBER,
                        opacity: stagger,
                      }}
                    >
                      {v}
                    </div>
                  </React.Fragment>
                );
              })}
              {/* 결과 뱃지 */}
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: FONT.heading,
                  fontWeight: 800,
                  color: C_TEAL,
                  background: `${C_TEAL}16`,
                  border: `2px solid ${C_TEAL}55`,
                  borderRadius: 12,
                  padding: "8px 20px",
                  marginLeft: 12,
                  opacity: spring({
                    frame: frame - split - accumValues.length * 5,
                    fps,
                    config: { damping: 11, stiffness: 120 },
                    durationInFrames: 22,
                  }),
                }}
              >
                → 15
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.sumScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: SumEvenScene — 3. 짝수만 합산 ──────────────────────────
const SumEvenScene: React.FC = () => {
  const { sumEvenScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 30,
  });

  // 2문장: 필터 애니메이션
  const filterAppear = spring({
    frame: frame - split,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 30,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. 짝수만 합산" />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            {/* 코드 블록 */}
            <div
              style={{
                background: BG_CODE,
                borderRadius: 12,
                padding: "18px 28px",
                ...monoStyle,
                fontSize: CODE.sm,
                opacity: codeAppear,
                transform: `scale(${interpolate(codeAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              {SUM_EVEN_CODE.map((line, i) => (
                <div
                  key={i}
                  style={{ lineHeight: "1.9", color: TEXT, whiteSpace: "pre" }}
                >
                  <JavaLine text={line} />
                </div>
              ))}
            </div>

            {/* 2문장: 필터 애니메이션 — 1~10 */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                opacity: filterAppear,
              }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n, i) => {
                const isEven = n % 2 === 0;
                const stagger = spring({
                  frame: frame - split - i * 3,
                  fps,
                  config: { damping: 13, stiffness: 140 },
                  durationInFrames: 20,
                });
                return (
                  <div
                    key={n}
                    style={{
                      ...monoStyle,
                      fontSize: FONT.label,
                      fontWeight: 700,
                      color: isEven ? C_TEAL : C_DIM,
                      opacity: stagger,
                      transform: `scale(${interpolate(stagger, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                    }}
                  >
                    {n}
                  </div>
                );
              })}
              {/* 결과 뱃지 */}
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: FONT.heading,
                  fontWeight: 800,
                  color: C_TEAL,
                  background: `${C_TEAL}16`,
                  border: `2px solid ${C_TEAL}55`,
                  borderRadius: 12,
                  padding: "8px 20px",
                  marginLeft: 8,
                  opacity: spring({
                    frame: frame - split - 35,
                    fps,
                    config: { damping: 11, stiffness: 120 },
                    durationInFrames: 22,
                  }),
                }}
              >
                → 30
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.sumEvenScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: ComparisonScene — 4. 비교 ──────────────────────────────
const SIGNATURES = [
  { sig: "void printRange(int start, int end)", label: "출력" },
  { sig: "int sumRange(int start, int end)", label: "합산" },
  { sig: "int sumEven(int start, int end)", label: "짝수 합산" },
];

const ComparisonScene: React.FC = () => {
  const { comparisonScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. 비교" />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {SIGNATURES.map(({ sig, label }, i) => {
              const cardAppear = spring({
                frame: frame - s - i * 8,
                fps,
                config: { damping: 12, stiffness: 130 },
                durationInFrames: 26,
              });
              const labelAppear = spring({
                frame: frame - split - i * 8,
                fps,
                config: { damping: 12, stiffness: 130 },
                durationInFrames: 24,
              });

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    opacity: cardAppear,
                    transform: `translateX(${interpolate(cardAppear, [0, 1], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                  }}
                >
                  {/* 함수 시그니처 카드 */}
                  <div
                    style={{
                      background: BG_CODE,
                      borderRadius: 12,
                      padding: "14px 24px",
                      ...monoStyle,
                      fontSize: CODE.md,
                      color: TEXT,
                      whiteSpace: "pre",
                    }}
                  >
                    <JavaLine text={sig} />
                  </div>
                  {/* 라벨 */}
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: FONT.label,
                      fontWeight: 700,
                      color: C_TEAL,
                      opacity: labelAppear,
                    }}
                  >
                    {label}
                  </div>
                </div>
              );
            })}

            {/* 공통 매개변수 밑줄 표시 */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: FONT.label,
                fontWeight: 700,
                color: C_FUNC,
                marginTop: 12,
                opacity: spring({
                  frame: frame - split - 30,
                  fps,
                  config: { damping: 12, stiffness: 130 },
                  durationInFrames: 24,
                }),
                textDecoration: "underline",
                textDecorationColor: `${C_FUNC}88`,
                textUnderlineOffset: 6,
              }}
            >
              공통: (int start, int end)
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.comparisonScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: CallScene — 5. 실행 ────────────────────────────────────
const CallScene: React.FC = () => {
  const { callScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1문장: printRange(1, 5)
  const call1Appear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 30,
  });

  const outputAppear = spring({
    frame: frame - s - 18,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  // 2문장: sumRange + sumEven
  const call2Appear = spring({
    frame: frame - split,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 30,
  });

  const call3Appear = spring({
    frame: frame - split - 20,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 30,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="5. 실행" />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
            }}
          >
            {/* 1문장: printRange(1, 5) → 결과 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: call1Appear,
              }}
            >
              <div
                style={{
                  background: BG_CODE,
                  borderRadius: 12,
                  padding: "14px 24px",
                  ...monoStyle,
                  fontSize: CODE.lg,
                  color: TEXT,
                }}
              >
                <JavaLine text="printRange(1, 5)" />
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: FONT.label,
                  color: C_TEAL,
                  opacity: outputAppear,
                }}
              >
                →
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  opacity: outputAppear,
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    style={{
                      ...monoStyle,
                      fontSize: FONT.heading,
                      fontWeight: 700,
                      color: C_NUMBER,
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* 2문장: sumRange(1, 5) → 15 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: call2Appear,
              }}
            >
              <div
                style={{
                  background: BG_CODE,
                  borderRadius: 12,
                  padding: "14px 24px",
                  ...monoStyle,
                  fontSize: CODE.lg,
                  color: TEXT,
                }}
              >
                <JavaLine text="sumRange(1, 5)" />
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: FONT.label,
                  color: C_TEAL,
                }}
              >
                →
              </div>
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: FONT.heading,
                  fontWeight: 800,
                  color: C_TEAL,
                  background: `${C_TEAL}16`,
                  border: `2px solid ${C_TEAL}55`,
                  borderRadius: 12,
                  padding: "8px 20px",
                }}
              >
                15
              </div>
            </div>

            {/* sumEven(1, 10) → 30 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: call3Appear,
              }}
            >
              <div
                style={{
                  background: BG_CODE,
                  borderRadius: 12,
                  padding: "14px 24px",
                  ...monoStyle,
                  fontSize: CODE.lg,
                  color: TEXT,
                }}
              >
                <JavaLine text="sumEven(1, 10)" />
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: FONT.label,
                  color: C_TEAL,
                }}
              >
                →
              </div>
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: FONT.heading,
                  fontWeight: 800,
                  color: C_TEAL,
                  background: `${C_TEAL}16`,
                  border: `2px solid ${C_TEAL}55`,
                  borderRadius: 12,
                  padding: "8px 20px",
                }}
              >
                30
              </div>
            </div>
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

// ── 씬: SummaryScene — 6. 정리 (마지막 씬) ─────────────────────
const SUMMARY_CARDS = CONTENT.summaryScene.cards as unknown as string[];

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false }); // 마지막 씬 → fadeOut 없음
  const s = cfg.speechStartFrame;
  const split = cfg.narrationSplits[0];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1문장: 타이틀 등장 → 2문장 시작 시 퇴장
  const titleAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 14, stiffness: 120 },
    durationInFrames: 24,
  });
  const titleExit = interpolate(frame, [split - 20, split], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = titleAppear * (1 - titleExit);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="6. 정리" />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 36,
            }}
          >
            {/* 1문장: 타이틀 */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: FONT.display,
                fontWeight: 900,
                color: C_TEAL,
                textAlign: "center",
                opacity: titleOpacity,
              }}
            >
              함수의 구성 요소
            </div>

            {/* 2문장: 카드 2장 */}
            <div
              style={{
                display: "flex",
                gap: 48,
                alignItems: "center",
              }}
            >
              {SUMMARY_CARDS.map((card, i) => {
                const cardAppear = spring({
                  frame: frame - split - i * 12,
                  fps,
                  config: { damping: 12, stiffness: 130 },
                  durationInFrames: 24,
                });
                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: uiFont,
                      fontSize: FONT.title,
                      fontWeight: 700,
                      color: "#ffffff",
                      background: `${C_FUNC}18`,
                      border: `3px solid ${C_FUNC}66`,
                      borderRadius: 16,
                      padding: "32px 48px",
                      textAlign: "center",
                      lineHeight: 1.5,
                      whiteSpace: "pre-line",
                      opacity: cardAppear,
                      transform: `scale(${interpolate(cardAppear, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                    }}
                  >
                    {card}
                  </div>
                );
              })}
            </div>
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
  VIDEO_CONFIG.printScene,
  VIDEO_CONFIG.sumScene,
  VIDEO_CONFIG.sumEvenScene,
  VIDEO_CONFIG.comparisonScene,
  VIDEO_CONFIG.callScene,
  VIDEO_CONFIG.summaryScene,
];
const sceneDurations = sceneList.map((s) => s.durationInFrames);
const fromValues = computeFromValues(sceneDurations, {
  cross: CROSS,
  firstOverlap: THUMB_CROSS,
});
const totalDuration =
  fromValues[fromValues.length - 1] + sceneDurations[sceneDurations.length - 1];

// ── compositionMeta ───────────────────────────────────────────
export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: totalDuration,
};

// ── Root Component ────────────────────────────────────────────
const JavaPractice: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.printScene.durationInFrames}
    >
      <PrintScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.sumScene.durationInFrames}
    >
      <SumScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.sumEvenScene.durationInFrames}
    >
      <SumEvenScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.comparisonScene.durationInFrames}
    >
      <ComparisonScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.callScene.durationInFrames}
    >
      <CallScene />
    </Sequence>
    <Sequence
      from={fromValues[6]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaPractice;
