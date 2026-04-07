import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import React, { useRef } from "react";

import { FPS } from "../../../config";
import { ElementArrow } from "../../../utils/Arrow";
import {
  CROSS,
  ContentArea,
  FONT,
  SceneAudio,
  SceneTitle,
  Subtitle,
  THUMB_CROSS,
  monoStyle,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { buildSrtData, computeFromValues } from "../../../utils/srt";
import type { SrtEntry, SrtTracks } from "../../../utils/srt";
import { CONTENT } from "./013-2-content";
import { AUDIO_CONFIG } from "./013-3-audio.gen";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_COMMENT,
  C_DIM,
  C_KEYWORD,
  C_NUMBER,
  C_PAIN,
  C_STRING,
  C_TEAL,
  C_TYPE,
  C_VAR,
  TEXT,
} from "./colors";
import { HEIGHT, WIDTH } from "./config";

/* ─── Audio helper ─── */

const AUDIO_SCENE_STUB = {
  durationInFrames: 30,
  speechStartFrame: 0,
  narrationSplits: [] as readonly number[],
  sentenceEndFrames: [] as readonly number[],
  wordStartFrames: [] as readonly number[][],
};

const getAudioScene = (key: string) => {
  const scene = (
    AUDIO_CONFIG as unknown as Record<string, typeof AUDIO_SCENE_STUB>
  )[key];
  return scene ?? AUDIO_SCENE_STUB;
};

/* ─── VIDEO_CONFIG ─── */

export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  misconceptionScene: {
    audio: "copy-misconceptionScene.mp3",
    durationInFrames: getAudioScene("misconceptionScene").durationInFrames,
    speechStartFrame: getAudioScene("misconceptionScene").speechStartFrame,
    narration: CONTENT.misconceptionScene.narration as string[],
    narrationSplits: getAudioScene("misconceptionScene").narrationSplits,
  },
  memoryScene: {
    audio: "copy-memoryScene.mp3",
    durationInFrames: getAudioScene("memoryScene").durationInFrames,
    speechStartFrame: getAudioScene("memoryScene").speechStartFrame,
    narration: CONTENT.memoryScene.narration as string[],
    narrationSplits: getAudioScene("memoryScene").narrationSplits,
  },
  proofScene: {
    audio: "copy-proofScene.mp3",
    durationInFrames: getAudioScene("proofScene").durationInFrames,
    speechStartFrame: getAudioScene("proofScene").speechStartFrame,
    narration: CONTENT.proofScene.narration as string[],
    narrationSplits: getAudioScene("proofScene").narrationSplits,
  },
  comparisonScene: {
    audio: "copy-comparisonScene.mp3",
    durationInFrames: getAudioScene("comparisonScene").durationInFrames,
    speechStartFrame: getAudioScene("comparisonScene").speechStartFrame,
    narration: CONTENT.comparisonScene.narration as string[],
    narrationSplits: getAudioScene("comparisonScene").narrationSplits,
  },
  summaryScene: {
    audio: "copy-summaryScene.mp3",
    durationInFrames: getAudioScene("summaryScene").durationInFrames,
    speechStartFrame: getAudioScene("summaryScene").speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: getAudioScene("summaryScene").narrationSplits,
  },
} as const;

/* ─── Shared styles ─── */

const panelStyle: React.CSSProperties = {
  background: `${BG_CODE}d8`,
  borderRadius: 22,
  padding: "28px 30px",
  position: "relative",
};

const codeBlock: React.CSSProperties = {
  ...monoStyle,
  fontSize: 24,
  lineHeight: 2,
};

/* ─── Scenes ─── */

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
          background: `radial-gradient(circle, ${C_TEAL}22 0%, transparent 72%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          fontFamily: uiFont,
          fontSize: FONT.label,
          fontWeight: 700,
          color: C_TEAL,
          letterSpacing: 10,
          opacity: 0.85,
        }}
      >
        JAVA
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 110,
          fontWeight: 900,
          lineHeight: 1,
          textAlign: "center",
          color: "#ffffff",
          textShadow: `0 0 60px ${C_TEAL}99, 0 0 120px ${C_TEAL}44`,
        }}
      >
        레퍼런스
        <br />
        <span style={{ color: C_KEYWORD }}>복사</span>
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 34,
          fontWeight: 700,
          color: TEXT,
          marginTop: 24,
          textAlign: "center",
          lineHeight: 1.35,
          width: 760,
        }}
      >
        Reference Copy
      </div>
    </AbsoluteFill>
  );
};

const MisconceptionScene: React.FC = () => {
  const { misconceptionScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  const wrongAppear = spring({
    frame: frame - s - 20,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  const answerAppear = spring({
    frame: frame - (splits[0] ?? s + 40),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  /* Cross-out line on the wrong diagram */
  const crossOut = interpolate(
    frame,
    [(splits[0] ?? s + 40) + 6, (splits[0] ?? s + 40) + 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="1. 오해" />

          <div
            style={{
              position: "absolute",
              top: "14%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              width: 920,
            }}
          >
            {/* Code: Person p1 = new Person(...); Person p2 = p1; */}
            <div
              style={{
                ...panelStyle,
                width: 780,
                border: `2px solid ${C_VAR}44`,
                padding: "24px 40px",
                opacity: codeAppear,
                transform: `scale(${interpolate(codeAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              <div
                style={{
                  ...codeBlock,
                  fontSize: 26,
                  lineHeight: 2,
                  whiteSpace: "pre-wrap",
                }}
              >
                <span style={{ color: C_TEAL }}>Person</span>{" "}
                <span style={{ color: C_VAR }}>p1</span>
                <span style={{ color: TEXT }}> = </span>
                <span style={{ color: C_KEYWORD }}>new</span>{" "}
                <span style={{ color: C_TEAL }}>Person</span>
                <span style={{ color: TEXT }}>(</span>
                <span style={{ color: C_NUMBER }}>1</span>
                <span style={{ color: TEXT }}>, </span>
                <span style={{ color: C_NUMBER }}>24</span>
                <span style={{ color: TEXT }}>, </span>
                <span style={{ color: C_STRING }}>&quot;홍길동&quot;</span>
                <span style={{ color: TEXT }}>, </span>
                <span style={{ color: C_NUMBER }}>180</span>
                <span style={{ color: TEXT }}>);{"\n"}</span>
                <span style={{ color: C_TEAL }}>Person</span>{" "}
                <span style={{ color: C_VAR }}>p2</span>
                <span style={{ color: TEXT }}> = </span>
                <span style={{ color: C_VAR }}>p1</span>
                <span style={{ color: TEXT }}>;</span>
              </div>
            </div>

            {/* Wrong mental model: two separate objects */}
            <div
              style={{
                position: "relative",
                display: "flex",
                gap: 40,
                alignItems: "center",
                opacity: wrongAppear,
                transform: `scale(${interpolate(wrongAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              {[
                { name: "p1", vals: "id=1, age=20" },
                { name: "p2", vals: "id=1, age=20" },
              ].map((obj, i) => (
                <div
                  key={`obj-${i}`}
                  style={{
                    background: BG_CODE,
                    borderRadius: 16,
                    padding: "22px 32px",
                    border: `2px solid ${C_PAIN}44`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 24,
                      color: C_VAR,
                      fontWeight: 700,
                    }}
                  >
                    {obj.name}
                  </div>
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 20,
                      color: TEXT,
                    }}
                  >
                    Person 객체
                  </div>
                  <div style={{ ...monoStyle, fontSize: 18, color: C_DIM }}>
                    {obj.vals}
                  </div>
                </div>
              ))}

              {/* Cross-out red line */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "5%",
                  width: `${crossOut * 90}%`,
                  height: 4,
                  background: C_PAIN,
                  borderRadius: 2,
                  opacity: crossOut,
                }}
              />
            </div>

            {/* Question mark → Answer */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: FONT.heading,
                fontWeight: 800,
                color: C_PAIN,
                textAlign: "center",
                lineHeight: 1.5,
                opacity: wrongAppear,
              }}
            >
              객체가 복사된다?
            </div>

            {/* Answer: NO */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 48,
                fontWeight: 900,
                color: C_PAIN,
                textAlign: "center",
                opacity: answerAppear,
                transform: `scale(${interpolate(answerAppear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              NO!
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("misconceptionScene").wordStartFrames}
      />
    </>
  );
};

const MemoryScene: React.FC = () => {
  const { memoryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const p1CellRef = useRef<HTMLDivElement>(null);
  const p2CellRef = useRef<HTMLDivElement>(null);
  const heapObjectRef = useRef<HTMLDivElement>(null);

  /* Step 1: p1 has a remote control (address), not the object */
  const step1 = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  /* Step 2: p2 = p1 copies the remote control */
  const step2 = spring({
    frame: frame - (splits[0] ?? s + 50),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  /* Step 3: Both point to same object */
  const step3 = spring({
    frame: frame - (splits[1] ?? s + 100),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  const remoteGlow =
    step3 > 0.5 ? 0.3 + 0.4 * Math.abs(Math.sin(frame * 0.06)) : 0;

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="2. 메모리 구조" />

          <div
            ref={containerRef}
            style={{
              position: "absolute",
              top: "14%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 920,
              height: 700,
            }}
          >
            {/* Stack area */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 340,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                opacity: step1,
                transform: `translateY(${interpolate(step1, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 22,
                  fontWeight: 800,
                  color: C_VAR,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                STACK (변수)
              </div>

              {/* p1 cell */}
              <div
                ref={p1CellRef}
                style={{
                  background: BG_CODE,
                  borderRadius: 14,
                  padding: "18px 28px",
                  border: `2px solid ${C_VAR}55`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 26,
                    color: C_VAR,
                    fontWeight: 700,
                  }}
                >
                  p1
                </span>
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 20,
                    color: C_TEAL,
                    opacity: 0.8,
                  }}
                >
                  0x7f
                </span>
              </div>

              {/* p2 cell */}
              <div
                ref={p2CellRef}
                style={{
                  background: BG_CODE,
                  borderRadius: 14,
                  padding: "18px 28px",
                  border: `2px solid ${C_VAR}55`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: step2,
                  transform: `translateX(${interpolate(step2, [0, 1], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}
              >
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 26,
                    color: C_VAR,
                    fontWeight: 700,
                  }}
                >
                  p2
                </span>
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 20,
                    color: C_TEAL,
                    opacity: 0.8,
                  }}
                >
                  0x7f
                </span>
              </div>

              {/* Remote control label */}
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  color: C_TEAL,
                  textAlign: "center",
                  marginTop: 8,
                  opacity: step1,
                }}
              >
                리모콘 (주소)
              </div>
            </div>

            {/* Heap area */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 460,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                opacity: step1,
                transform: `translateY(${interpolate(step1, [0, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 22,
                  fontWeight: 800,
                  color: C_TEAL,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                HEAP (객체)
              </div>

              {/* Person object */}
              <div
                ref={heapObjectRef}
                style={{
                  background: BG_CODE,
                  borderRadius: 18,
                  padding: "24px 32px",
                  border: `2px solid ${C_TEAL}66`,
                  boxShadow: remoteGlow
                    ? `0 0 20px ${C_TEAL}${Math.round(remoteGlow * 60)
                        .toString(16)
                        .padStart(2, "0")}`
                    : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 22,
                    fontWeight: 800,
                    color: C_TEAL,
                    marginBottom: 16,
                  }}
                >
                  Person 객체
                </div>
                {[
                  { field: "id", value: "1" },
                  { field: "age", value: "20" },
                  { field: "height", value: "170" },
                ].map((item, i) => (
                  <div
                    key={`field-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: i < 2 ? `1px solid ${C_DIM}` : "none",
                    }}
                  >
                    <span
                      style={{
                        ...monoStyle,
                        fontSize: 24,
                        color: C_VAR,
                      }}
                    >
                      {item.field}
                    </span>
                    <span
                      style={{
                        ...monoStyle,
                        fontSize: 24,
                        color: C_NUMBER,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows: p1 → object */}
            <ElementArrow
              containerRef={containerRef}
              from={{
                ref: p1CellRef,
                anchor: "right-center",
                padding: 10,
              }}
              to={{
                ref: heapObjectRef,
                anchor: "left-center",
                padding: 10,
              }}
              color={C_TEAL}
              strokeWidth={3}
              opacity={step1}
              curve={-30}
            />

            {/* Arrows: p2 → object */}
            <ElementArrow
              containerRef={containerRef}
              from={{
                ref: p2CellRef,
                anchor: "right-center",
                padding: 10,
              }}
              to={{
                ref: heapObjectRef,
                anchor: "left-center",
                padding: 10,
                offsetY: 40,
              }}
              color={C_TEAL}
              strokeWidth={3}
              opacity={step2}
              curve={20}
            />

            {/* Explanation text */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: uiFont,
                fontSize: FONT.label,
                fontWeight: 800,
                color: C_TEAL,
                textAlign: "center",
                lineHeight: 1.6,
                opacity: step3,
              }}
            >
              같은 객체, 리모콘만 2개!
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("memoryScene").wordStartFrames}
      />
    </>
  );
};

const ProofScene: React.FC = () => {
  const { proofScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const p1CellRef = useRef<HTMLDivElement>(null);
  const p2CellRef = useRef<HTMLDivElement>(null);
  const heapRef = useRef<HTMLDivElement>(null);

  const diagramAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  const changeAppear = spring({
    frame: frame - s - 20,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  const revealAppear = spring({
    frame: frame - (splits[0] ?? s + 50),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  const surpriseGlow =
    revealAppear > 0.5 ? 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.08)) : 0;

  /* age transitions from 20 to 99 */
  const ageChanged = changeAppear > 0.5;

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="3. 증명" />

          <div
            ref={containerRef}
            style={{
              position: "absolute",
              top: "12%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 920,
              height: 740,
            }}
          >
            {/* Code: p2.age = 99 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...panelStyle,
                width: 640,
                border: `2px solid ${C_VAR}44`,
                padding: "18px 36px",
                opacity: diagramAppear,
              }}
            >
              <div style={{ ...codeBlock, fontSize: 28 }}>
                <span style={{ color: C_VAR }}>p2</span>
                <span style={{ color: TEXT }}>.</span>
                <span style={{ color: C_VAR }}>age</span>
                <span style={{ color: TEXT }}> = </span>
                <span style={{ color: C_NUMBER }}>99</span>
                <span style={{ color: TEXT }}>;</span>
              </div>
            </div>

            {/* Stack */}
            <div
              style={{
                position: "absolute",
                top: 120,
                left: 0,
                width: 300,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                opacity: diagramAppear,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  fontWeight: 800,
                  color: C_VAR,
                  textAlign: "center",
                }}
              >
                STACK
              </div>
              <div
                ref={p1CellRef}
                style={{
                  background: BG_CODE,
                  borderRadius: 14,
                  padding: "14px 24px",
                  border: `2px solid ${C_VAR}55`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: surpriseGlow
                    ? `0 0 16px ${C_TEAL}${Math.round(surpriseGlow * 50)
                        .toString(16)
                        .padStart(2, "0")}`
                    : "none",
                }}
              >
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 24,
                    color: C_VAR,
                    fontWeight: 700,
                  }}
                >
                  p1
                </span>
                <span style={{ ...monoStyle, fontSize: 18, color: C_TEAL }}>
                  0x7f
                </span>
              </div>
              <div
                ref={p2CellRef}
                style={{
                  background: BG_CODE,
                  borderRadius: 14,
                  padding: "14px 24px",
                  border: `2px solid ${C_VAR}55`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 24,
                    color: C_VAR,
                    fontWeight: 700,
                  }}
                >
                  p2
                </span>
                <span style={{ ...monoStyle, fontSize: 18, color: C_TEAL }}>
                  0x7f
                </span>
              </div>
            </div>

            {/* Heap */}
            <div
              style={{
                position: "absolute",
                top: 120,
                right: 0,
                width: 440,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                opacity: diagramAppear,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  fontWeight: 800,
                  color: C_TEAL,
                  textAlign: "center",
                }}
              >
                HEAP
              </div>
              <div
                ref={heapRef}
                style={{
                  background: BG_CODE,
                  borderRadius: 18,
                  padding: "22px 30px",
                  border: `2px solid ${C_TEAL}66`,
                }}
              >
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 20,
                    fontWeight: 800,
                    color: C_TEAL,
                    marginBottom: 14,
                  }}
                >
                  Person 객체
                </div>
                {[
                  { field: "id", value: "1", highlight: false },
                  {
                    field: "age",
                    value: ageChanged ? "99" : "20",
                    highlight: ageChanged,
                  },
                  { field: "height", value: "170", highlight: false },
                ].map((item, i) => (
                  <div
                    key={`pf-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: i < 2 ? `1px solid ${C_DIM}` : "none",
                    }}
                  >
                    <span
                      style={{
                        ...monoStyle,
                        fontSize: 22,
                        color: item.highlight ? C_PAIN : C_VAR,
                        fontWeight: item.highlight ? 800 : 400,
                      }}
                    >
                      {item.field}
                    </span>
                    <span
                      style={{
                        ...monoStyle,
                        fontSize: 22,
                        color: item.highlight ? C_PAIN : C_NUMBER,
                        fontWeight: item.highlight ? 800 : 400,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows */}
            <ElementArrow
              containerRef={containerRef}
              from={{ ref: p1CellRef, anchor: "right-center", padding: 10 }}
              to={{ ref: heapRef, anchor: "left-center", padding: 10 }}
              color={C_TEAL}
              strokeWidth={3}
              opacity={diagramAppear}
              curve={-25}
            />
            <ElementArrow
              containerRef={containerRef}
              from={{ ref: p2CellRef, anchor: "right-center", padding: 10 }}
              to={{
                ref: heapRef,
                anchor: "left-center",
                padding: 10,
                offsetY: 36,
              }}
              color={C_TEAL}
              strokeWidth={3}
              opacity={diagramAppear}
              curve={18}
            />

            {/* Reveal: p1.age is also 99! */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity: revealAppear,
              }}
            >
              <div
                style={{
                  ...panelStyle,
                  width: 640,
                  border: `2px solid ${C_PAIN}55`,
                  padding: "18px 36px",
                  boxShadow: surpriseGlow ? `0 0 20px ${C_PAIN}44` : "none",
                }}
              >
                <div
                  style={{ ...codeBlock, fontSize: 26, textAlign: "center" }}
                >
                  <span style={{ color: C_VAR }}>p1</span>
                  <span style={{ color: TEXT }}>.</span>
                  <span style={{ color: C_VAR }}>age</span>
                  <span style={{ color: TEXT }}> → </span>
                  <span style={{ color: C_PAIN, fontWeight: 800 }}>99</span>
                  <span style={{ color: C_PAIN, fontWeight: 800 }}> !</span>
                </div>
              </div>
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 22,
                  fontWeight: 700,
                  color: C_TEAL,
                  textAlign: "center",
                }}
              >
                같은 객체니까 당연합니다
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("proofScene").wordStartFrames}
      />
    </>
  );
};

const ComparisonScene: React.FC = () => {
  const { comparisonScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const topAppear = spring({
    frame: frame - (splits[0] ?? s + 30),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });
  const bottomAppear = spring({
    frame: frame - (splits[1] ?? s + 60),
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  const halfStyle: React.CSSProperties = {
    ...panelStyle,
    width: 880,
    padding: "24px 36px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="4. 비교" />

          <div
            style={{
              position: "absolute",
              top: "14%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              width: 920,
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: FONT.heading,
                fontWeight: 800,
                color: TEXT,
                opacity: titleAppear,
              }}
            >
              기본형 복사 vs 참조형 복사
            </div>

            {/* Primitive copy */}
            <div
              style={{
                ...halfStyle,
                border: `2px solid ${C_VAR}55`,
                opacity: topAppear,
                transform: `scale(${interpolate(topAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 22,
                  fontWeight: 800,
                  color: C_VAR,
                  marginBottom: 4,
                }}
              >
                기본형 — 값 자체를 복사
              </div>
              <div style={{ ...monoStyle, fontSize: 24, lineHeight: 1.8 }}>
                <div>
                  <span style={{ color: C_TYPE }}>int</span>{" "}
                  <span style={{ color: C_VAR }}>a</span>
                  <span style={{ color: TEXT }}> = </span>
                  <span style={{ color: C_NUMBER }}>10</span>
                  <span style={{ color: TEXT }}>;</span>
                </div>
                <div>
                  <span style={{ color: C_TYPE }}>int</span>{" "}
                  <span style={{ color: C_VAR }}>b</span>
                  <span style={{ color: TEXT }}> = </span>
                  <span style={{ color: C_VAR }}>a</span>
                  <span style={{ color: TEXT }}>;</span>
                  <span style={{ color: C_COMMENT }}> // b = 10 (독립)</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 36,
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {[
                  { name: "a", val: "10" },
                  { name: "b", val: "10" },
                ].map((v, i) => (
                  <div
                    key={`prim-${i}`}
                    style={{
                      background: `${BG}88`,
                      borderRadius: 12,
                      padding: "12px 28px",
                      border: `2px solid ${C_VAR}44`,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        ...monoStyle,
                        fontSize: 22,
                        color: C_VAR,
                        fontWeight: 700,
                      }}
                    >
                      {v.name}
                    </div>
                    <div
                      style={{ ...monoStyle, fontSize: 28, color: C_NUMBER }}
                    >
                      {v.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                fontFamily: uiFont,
                fontSize: 36,
                fontWeight: 900,
                color: C_DIM,
                opacity: bottomAppear,
              }}
            >
              VS
            </div>

            {/* Reference copy */}
            <div
              style={{
                ...halfStyle,
                border: `2px solid ${C_TEAL}55`,
                opacity: bottomAppear,
                transform: `scale(${interpolate(bottomAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 22,
                  fontWeight: 800,
                  color: C_TEAL,
                  marginBottom: 4,
                }}
              >
                참조형 — 리모콘만 복사
              </div>
              <div style={{ ...monoStyle, fontSize: 24, lineHeight: 1.8 }}>
                <div>
                  <span style={{ color: C_TEAL }}>Person</span>{" "}
                  <span style={{ color: C_VAR }}>p2</span>
                  <span style={{ color: TEXT }}> = </span>
                  <span style={{ color: C_VAR }}>p1</span>
                  <span style={{ color: TEXT }}>;</span>
                  <span style={{ color: C_COMMENT }}> // 리모콘 복사</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                {["p1", "p2"].map((name, i) => (
                  <div
                    key={`ref-${i}`}
                    style={{
                      background: `${BG}88`,
                      borderRadius: 12,
                      padding: "10px 22px",
                      border: `2px solid ${C_TEAL}44`,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        ...monoStyle,
                        fontSize: 22,
                        color: C_VAR,
                        fontWeight: 700,
                      }}
                    >
                      {name}
                    </div>
                    <div style={{ ...monoStyle, fontSize: 18, color: C_TEAL }}>
                      0x7f
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 28,
                    color: C_TEAL,
                    fontWeight: 700,
                  }}
                >
                  →
                </div>
                <div
                  style={{
                    background: `${BG}88`,
                    borderRadius: 14,
                    padding: "14px 24px",
                    border: `2px solid ${C_TEAL}55`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 20,
                      fontWeight: 800,
                      color: C_TEAL,
                    }}
                  >
                    Person
                  </div>
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 18,
                      color: TEXT,
                      opacity: 0.7,
                    }}
                  >
                    객체 1개
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("comparisonScene").wordStartFrames}
      />
    </>
  );
};

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const points = [
    {
      text: "참조형 변수에는\n객체가 아니라 리모콘이 들어있다",
      color: C_TEAL,
    },
    {
      text: "변수를 복사하면\n리모콘만 복사된다",
      color: C_KEYWORD,
    },
    {
      text: "객체는 복사되지 않는다",
      color: C_PAIN,
    },
  ];

  const lineAppears = points.map((_, i) =>
    spring({
      frame: frame - (splits[i] ?? s),
      fps,
      config: { damping: 12, stiffness: 130 },
      durationInFrames: 24,
    }),
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="5. 정리" />

          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 36,
              alignItems: "center",
            }}
          >
            {points.map((point, i) => {
              const appear = lineAppears[i];
              return (
                <div
                  key={`summary-${i}`}
                  style={{
                    background: BG_CODE,
                    padding: "28px 44px",
                    border: `2px solid ${point.color}44`,
                    borderRadius: 16,
                    fontFamily: uiFont,
                    fontSize: FONT.heading,
                    fontWeight: 800,
                    color: TEXT,
                    textAlign: "center",
                    lineHeight: 1.5,
                    opacity: appear,
                    transform: `scale(${interpolate(appear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                    whiteSpace: "pre-line",
                  }}
                >
                  {point.text}
                </div>
              );
            })}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("summaryScene").wordStartFrames}
      />
    </>
  );
};

/* ─── Composition ─── */

const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.misconceptionScene,
  VIDEO_CONFIG.memoryScene,
  VIDEO_CONFIG.proofScene,
  VIDEO_CONFIG.comparisonScene,
  VIDEO_CONFIG.summaryScene,
];
const sceneDurations = sceneList.map((s) => s.durationInFrames);
const fromValues = computeFromValues(sceneDurations, {
  cross: CROSS,
  firstOverlap: THUMB_CROSS,
});
const totalDuration =
  fromValues[fromValues.length - 1] + sceneDurations[sceneDurations.length - 1];

export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: totalDuration,
};

export const SRT_DATA: SrtEntry[] = buildSrtData([
  {
    offset: fromValues[1],
    narration: CONTENT.misconceptionScene.narration as string[],
    speechStartFrame: getAudioScene("misconceptionScene").speechStartFrame,
    narrationSplits: getAudioScene("misconceptionScene").narrationSplits,
    sentenceEndFrames: getAudioScene("misconceptionScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.misconceptionScene.durationInFrames,
  },
  {
    offset: fromValues[2],
    narration: CONTENT.memoryScene.narration as string[],
    speechStartFrame: getAudioScene("memoryScene").speechStartFrame,
    narrationSplits: getAudioScene("memoryScene").narrationSplits,
    sentenceEndFrames: getAudioScene("memoryScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.memoryScene.durationInFrames,
  },
  {
    offset: fromValues[3],
    narration: CONTENT.proofScene.narration as string[],
    speechStartFrame: getAudioScene("proofScene").speechStartFrame,
    narrationSplits: getAudioScene("proofScene").narrationSplits,
    sentenceEndFrames: getAudioScene("proofScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.proofScene.durationInFrames,
  },
  {
    offset: fromValues[4],
    narration: CONTENT.comparisonScene.narration as string[],
    speechStartFrame: getAudioScene("comparisonScene").speechStartFrame,
    narrationSplits: getAudioScene("comparisonScene").narrationSplits,
    sentenceEndFrames: getAudioScene("comparisonScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.comparisonScene.durationInFrames,
  },
  {
    offset: fromValues[5],
    narration: CONTENT.summaryScene.narration as string[],
    speechStartFrame: getAudioScene("summaryScene").speechStartFrame,
    narrationSplits: getAudioScene("summaryScene").narrationSplits,
    sentenceEndFrames: getAudioScene("summaryScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.summaryScene.durationInFrames,
  },
]);

export const SRT_TRACKS: SrtTracks = { "ko-KR": SRT_DATA };

const JavaReferenceCopy: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.misconceptionScene.durationInFrames}
    >
      <MisconceptionScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.memoryScene.durationInFrames}
    >
      <MemoryScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.proofScene.durationInFrames}
    >
      <ProofScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.comparisonScene.durationInFrames}
    >
      <ComparisonScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaReferenceCopy;
