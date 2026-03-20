// src/compositions/001-Java-Basic/004-JavaComparison.tsx
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
import { toDisplayText } from "../../../utils/narration";
import {
  CROSS,
  ContentArea,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { AUDIO_CONFIG } from "./004-3-audio.gen";
import { CONTENT } from "./004-2-content";
import { HEIGHT, WIDTH } from "./config";
import {
  BG,
  C_NUMBER,
  C_PAIN,
  C_PURPLE,
  C_TEAL,
  C_TYPE,
  TEXT,
} from "./colors";

// ── 상수 ─────────────────────────────────────────────────────
const BEAT_CROSS = 12; // 연산자 비트 간 크로스페이드

// ── 비트 데이터 ───────────────────────────────────────────────
const BEATS = [
  { op: "==", result: false },
  { op: "!=", result: true },
  { op: ">", result: true },
  { op: "<", result: false },
  { op: ">=", result: true },
  { op: "<=", result: false },
] as const;

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  intro: {
    audio: "cmp-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  compareScene: {
    audio: "cmp-compare.mp3",
    durationInFrames: AUDIO_CONFIG.compareScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.compareScene.speechStartFrame,
    narration: CONTENT.compareScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.compareScene.narrationSplits,
  },
  summaryScene: {
    audio: "cmp-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 컴포넌트: ColorizedCode (헤더용) ─────────────────────────
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(
    /(\bint\b|\bdouble\b|\bString\b|\bboolean\b|==|!=|>=|<=|[+\-*\/%><]|=|\b\d+(?:\.\d+)?\b|"[^"]*")/g,
  );
  const KEYWORDS = ["int", "double", "String", "boolean"];
  const OPERATORS = ["==", "!=", ">=", "<=", ">", "<", "="];
  const TYPE_COLORS: Record<string, string> = {
    int: C_TYPE,
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
            <span key={i} style={{ color: C_PURPLE }}>
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

// ── 컴포넌트: BeatCard (연산자 1개 평가 화면) ─────────────────
const BeatCard: React.FC<{
  op: string;
  result: boolean;
  totalDur: number;
  isLast: boolean;
}> = ({ op, result, totalDur, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, BEAT_CROSS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = isLast
    ? 1
    : interpolate(frame, [totalDur - BEAT_CROSS, totalDur], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const opacity = fadeIn * fadeOut;

  // 수식 spring — 비트 시작 시 튀어오름
  const exprSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 130 },
    durationInFrames: 22,
  });
  const exprScale = interpolate(exprSpring, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 결과 배지 — 20프레임 후 위에서 내려옴
  const resultSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 110 },
    durationInFrames: 22,
  });
  const resultY = interpolate(resultSpring, [0, 1], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resultOp = interpolate(resultSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const resultColor = result ? C_TEAL : C_PAIN;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* 수식: 10  OP  3 */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${exprScale})`,
          display: "flex",
          alignItems: "center",
          gap: 32,
          fontFamily: monoFont,
          fontFeatureSettings: MONO_NO_LIGA,
        }}
      >
        <span style={{ color: C_NUMBER, fontSize: 92, fontWeight: 700 }}>10</span>
        <span
          style={{
            color: C_PURPLE,
            fontSize: 100,
            fontWeight: 900,
            textShadow: `0 0 40px ${C_PURPLE}88`,
          }}
        >
          {op}
        </span>
        <span style={{ color: C_NUMBER, fontSize: 92, fontWeight: 700 }}>3</span>
      </div>

      {/* 결과 배지 */}
      {frame >= 20 && (
        <div
          style={{
            position: "absolute",
            top: "64%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${resultY}px)`,
            opacity: resultOp,
            background: `${resultColor}20`,
            border: `3px solid ${resultColor}`,
            borderRadius: 22,
            padding: "18px 88px",
          }}
        >
          <span
            style={{
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 72,
              fontWeight: 900,
              color: resultColor,
              textShadow: `0 0 24px ${resultColor}66`,
            }}
          >
            {result ? "true" : "false"}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── 씬: ThumbnailScene ────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#0d0d1a",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 28,
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
        color: "#fff",
        textShadow:
          "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
      }}
    >
      Java
      <br />
      <span style={{ color: C_TEAL }}>비교 연산자</span>
    </div>
    {/* 예시: 10 == 3 → false */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginTop: 8,
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
      }}
    >
      <span style={{ fontSize: 56, fontWeight: 700, color: C_NUMBER }}>10</span>
      <span style={{ fontSize: 64, fontWeight: 900, color: C_TEAL }}>
        ==
      </span>
      <span style={{ fontSize: 56, fontWeight: 700, color: C_NUMBER }}>3</span>
      <span style={{ fontSize: 44, color: "#444", marginLeft: 4 }}>→</span>
      <span style={{ fontSize: 56, fontWeight: 900, color: C_PAIN }}>
        false
      </span>
    </div>
    {/* 6개 나열 */}
    <div
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 30,
        color: C_PURPLE,
        opacity: 0.5,
        letterSpacing: 6,
        whiteSpace: "pre",
      }}
    >
      {"==  !=  >  <  >=  <="}
    </div>
  </AbsoluteFill>
);

// ── 씬: IntroScene ────────────────────────────────────────────
const INTRO_OPS = ["==", "!=", ">", "<", ">=", "<="];

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(intro.audio)} />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              alignItems: "center",
            }}
          >
            {[INTRO_OPS.slice(0, 2), INTRO_OPS.slice(2, 4), INTRO_OPS.slice(4)].map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 20 }}>
                {row.map((op, i) => {
                  const idx = ri * 2 + i;
                  const startFrame = Math.round(
                    interpolate(idx, [0, 5], [AUDIO_CONFIG.intro.wordTiming["비교"][0], AUDIO_CONFIG.intro.wordTiming["반환합니다"][0]]),
                  );
                  const appear = spring({
                    frame: frame - startFrame,
                    fps,
                    config: { damping: 13, stiffness: 145 },
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
                        width: 160,
                        height: 160,
                        borderRadius: 24,
                        border: `3px solid ${C_PURPLE}88`,
                        background: `${C_PURPLE}18`,
                        boxShadow: `0 0 30px ${C_PURPLE}22`,
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
                          fontSize: 52,
                          fontWeight: 700,
                          color: C_PURPLE,
                        }}
                      >
                        {op}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
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

// ── 씬: CompareScene (비트 기반 평가) ────────────────────────
const CompareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { compareScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  // 비트 경계: [s, split0, split1, split2, split3, split4]
  const beatStarts = [s, ...splits];

  // 헤더 등장
  const headerOpacity = interpolate(frame, [s, s + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          {/* 상단 고정 헤더 */}
          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "26%",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 28,
                opacity: headerOpacity * 0.55,
                color: TEXT,
              }}
            >
              <ColorizedCode text="int a = 10, b = 3;" />
            </div>
          )}

          {/* 비트별 BeatCard */}
          {BEATS.map((beat, i) => {
            const from = beatStarts[i];
            const isLast = i === BEATS.length - 1;
            const nextFrom = isLast ? d : beatStarts[i + 1];
            const dur = nextFrom - from + (isLast ? 0 : BEAT_CROSS);
            return (
              <Sequence key={i} from={from} durationInFrames={dur}>
                <BeatCard
                  op={beat.op}
                  result={beat.result}
                  totalDur={dur}
                  isLast={isLast}
                />
              </Sequence>
            );
          })}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.compareScene.wordStartFrames}
      />
    </>
  );
};

// ── 씬: SummaryScene (2×3 그리드) ────────────────────────────
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

          {/* 헤더 */}
          <div
            style={{
              position: "absolute",
              top: "24%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 28,
              color: TEXT,
              opacity: 0.5,
            }}
          >
            <ColorizedCode text="int a = 10, b = 3;" />
          </div>

          {/* 2×3 그리드 */}
          <div
            style={{
              position: "absolute",
              top: "55%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              width: 920,
            }}
          >
            {BEATS.map((beat, i) => {
              const appear = spring({
                frame: frame - i * 9,
                fps,
                config: { damping: 13, stiffness: 140 },
                durationInFrames: 26,
              });
              const sc = interpolate(appear, [0, 1], [0.82, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const resColor = beat.result ? C_TEAL : C_PAIN;
              return (
                <div
                  key={i}
                  style={{
                    background: "#2a2a2a",
                    border: `2px solid ${resColor}44`,
                    borderRadius: 18,
                    padding: "20px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    opacity: appear,
                    transform: `scale(${sc})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: C_PURPLE,
                      fontSize: 40,
                      fontWeight: 700,
                      minWidth: 76,
                      textAlign: "center",
                    }}
                  >
                    {beat.op}
                  </span>
                  <span style={{ color: "#3a3a3a", fontSize: 28 }}>→</span>
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: resColor,
                      fontSize: 34,
                      fontWeight: 700,
                    }}
                  >
                    {beat.result ? "true" : "false"}
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

// ── 씬 목록 + fromValues ──────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.compareScene,
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
  // [2]=compareScene
  addScene(
    froms[2],
    VIDEO_CONFIG.compareScene.narration,
    AUDIO_CONFIG.compareScene.speechStartFrame,
    AUDIO_CONFIG.compareScene.narrationSplits,
    AUDIO_CONFIG.compareScene.sentenceEndFrames,
    VIDEO_CONFIG.compareScene.durationInFrames,
  );
  // [3]=summaryScene
  addScene(
    froms[3],
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
export const JavaComparison: React.FC = () => (
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
      durationInFrames={VIDEO_CONFIG.compareScene.durationInFrames}
    >
      <CompareScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaComparison;
