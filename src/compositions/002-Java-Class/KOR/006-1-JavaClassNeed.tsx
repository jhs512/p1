import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import React from "react";

import { FPS } from "../../../config";
import {
  CROSS,
  CodeBlock,
  ContentArea,
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
import { CONTENT } from "./006-2-content";
import { AUDIO_CONFIG } from "./006-3-audio.gen";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_COMMENT,
  C_DIM,
  C_KEYWORD,
  C_NUMBER,
  C_PAIN,
  C_TEAL,
  C_TYPE,
  C_VAR,
  TEXT,
} from "./colors";
import { HEIGHT, WIDTH } from "./config";

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

export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  analogyManualScene: {
    audio: "cls-analogyManualScene.mp3",
    durationInFrames: getAudioScene("analogyManualScene").durationInFrames,
    speechStartFrame: getAudioScene("analogyManualScene").speechStartFrame,
    narration: CONTENT.analogyManualScene.narration as string[],
    narrationSplits: getAudioScene("analogyManualScene").narrationSplits,
  },
  analogyMoldScene: {
    audio: "cls-analogyMoldScene.mp3",
    durationInFrames: getAudioScene("analogyMoldScene").durationInFrames,
    speechStartFrame: getAudioScene("analogyMoldScene").speechStartFrame,
    narration: CONTENT.analogyMoldScene.narration as string[],
    narrationSplits: getAudioScene("analogyMoldScene").narrationSplits,
  },
  analogyClassScene: {
    audio: "cls-analogyClassScene.mp3",
    durationInFrames: getAudioScene("analogyClassScene").durationInFrames,
    speechStartFrame: getAudioScene("analogyClassScene").speechStartFrame,
    narration: CONTENT.analogyClassScene.narration as string[],
    narrationSplits: getAudioScene("analogyClassScene").narrationSplits,
  },
  repeatScene: {
    audio: "cls-repeatScene.mp3",
    durationInFrames: getAudioScene("repeatScene").durationInFrames,
    speechStartFrame: getAudioScene("repeatScene").speechStartFrame,
    narration: CONTENT.repeatScene.narration as string[],
    narrationSplits: getAudioScene("repeatScene").narrationSplits,
  },
  moldScene: {
    audio: "cls-moldScene.mp3",
    durationInFrames: getAudioScene("moldScene").durationInFrames,
    speechStartFrame: getAudioScene("moldScene").speechStartFrame,
    narration: CONTENT.moldScene.narration as string[],
    narrationSplits: getAudioScene("moldScene").narrationSplits,
  },
  classScene: {
    audio: "cls-classScene.mp3",
    durationInFrames: getAudioScene("classScene").durationInFrames,
    speechStartFrame: getAudioScene("classScene").speechStartFrame,
    narration: CONTENT.classScene.narration as string[],
    narrationSplits: getAudioScene("classScene").narrationSplits,
  },
  summaryScene: {
    audio: "cls-summaryScene.mp3",
    durationInFrames: getAudioScene("summaryScene").durationInFrames,
    speechStartFrame: getAudioScene("summaryScene").speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: getAudioScene("summaryScene").narrationSplits,
  },
} as const;

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
          fontSize: 26,
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
        <span style={{ color: C_TEAL }}>클래스</span>
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 36,
          fontWeight: 700,
          color: TEXT,
          marginTop: 24,
        }}
      >
        <span style={{ color: C_TEAL, fontWeight: 900 }}>템플릿</span>
        {" 으로 만든다"}
      </div>
    </AbsoluteFill>
  );
};

const panelStyle: React.CSSProperties = {
  background: `${BG_CODE}d8`,
  borderRadius: 22,
  padding: "28px 30px",
  position: "relative",
};

const MoldCard: React.FC<{
  title: string;
  color: string;
  width?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, color, width, children, style }) => (
  <div
    style={{
      ...panelStyle,
      width,
      border: `2px solid ${color}55`,
      boxShadow: `0 0 28px ${color}20`,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -26,
        left: 18,
        padding: "6px 14px",
        borderRadius: 999,
        background: BG,
        border: `1px solid ${color}44`,
        fontFamily: uiFont,
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: 2,
        color,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const SlotRow: React.FC<{ labels: string[] }> = ({ labels }) => (
  <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
    {labels.map((label) => (
      <div
        key={label}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 110,
            height: 78,
            borderRadius: 14,
            background: BG_CODE,
            border: `2px solid ${C_TEAL}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: uiFont,
            fontSize: 22,
            fontWeight: 800,
            color: C_TEAL,
          }}
        >
          {label}
        </div>
      </div>
    ))}
  </div>
);

const ObjectCard: React.FC<{
  name: string;
  values: string[];
  opacity: number;
}> = ({ name, values, opacity }) => (
  <div
    style={{
      ...panelStyle,
      width: 290,
      border: `2px solid ${C_VAR}44`,
      opacity,
      transform: `scale(${interpolate(opacity, [0, 1], [0.88, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })})`,
    }}
  >
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 24,
        fontWeight: 900,
        color: C_VAR,
        marginBottom: 18,
      }}
    >
      {name}
    </div>
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {values.map((value, index) => (
        <div
          key={`${name}-${index}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 18,
              color: C_DIM,
            }}
          >
            [{index}]
          </div>
          <div
            style={{
              width: 72,
              height: 64,
              borderRadius: 12,
              background: BG_CODE,
              border: `2px solid ${C_VAR}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...monoStyle,
              fontSize: 26,
              color: C_NUMBER,
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SketchPicture: React.FC<{
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  filled?: boolean;
  fillColor?: string;
}> = ({
  size = 72,
  stroke = TEXT,
  strokeWidth = 6,
  filled = false,
  fillColor,
}) => (
  <svg
    width={size}
    height={size * 0.76}
    viewBox="0 0 200 152"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: "visible" }}
  >
    <rect
      x="18"
      y="18"
      width="164"
      height="116"
      rx="14"
      fill={filled ? `${fillColor ?? stroke}22` : "none"}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
    <path
      d="M42 110L82 72L105 93L131 58L159 110V110H42Z"
      fill={filled ? `${fillColor ?? stroke}55` : "none"}
    />
    <path
      d="M42 110L82 72L105 93L131 58L159 110"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M42 110H160"
      stroke={stroke}
      strokeWidth={strokeWidth - 2}
      strokeLinecap="round"
    />
    <circle
      cx="70"
      cy="52"
      r="10"
      fill={filled ? (fillColor ?? stroke) : "none"}
      stroke={stroke}
      strokeWidth={strokeWidth - 1}
    />
  </svg>
);

const AnalogyManualScene: React.FC = () => {
  const { analogyManualScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="1. 비유로 먼저 보기" />

          <div
            style={{
              position: "absolute",
              top: "calc(20% + 20px)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 28,
            }}
          >
            {[
              { label: "한 장 손그림", color: "#ff6b6b" },
              { label: "또 한 장 손그림", color: "#4ecdc4" },
              { label: "계속 손그림", color: "#ffd166" },
            ].map(({ label, color }, index) => {
              const appear = spring({
                frame: frame - s - index * 10,
                fps,
                config: { damping: 13, stiffness: 140 },
                durationInFrames: 22,
              });
              return (
                <div
                  key={label}
                  style={{
                    ...panelStyle,
                    width: 270,
                    border: `2px solid ${C_PAIN}44`,
                    opacity: appear,
                    transform: `translateY(${interpolate(
                      appear,
                      [0, 1],
                      [26, 0],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    )}px) rotate(${index === 1 ? "-2deg" : index === 2 ? "2deg" : "0deg"})`,
                    padding: "28px 22px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 26,
                      fontWeight: 900,
                      color: C_PAIN,
                      textAlign: "center",
                      marginBottom: 22,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 196,
                        minHeight: 154,
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.04)",
                        border: `2px dashed ${C_PAIN}55`,
                        padding: "20px 16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                      }}
                    >
                      <div style={{ fontSize: 58, lineHeight: 1 }}>✏️</div>
                      <SketchPicture
                        size={100}
                        stroke={TEXT}
                        strokeWidth={7}
                        filled
                        fillColor={color}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: uiFont,
                        fontSize: 18,
                        fontWeight: 800,
                        color: C_DIM,
                        textAlign: "center",
                        lineHeight: 1.35,
                      }}
                    >
                      연필로 하나씩
                      <br />
                      다시 그려야 함
                    </div>
                  </div>
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
        wordFrames={getAudioScene("analogyManualScene").wordStartFrames}
      />
    </>
  );
};

const AnalogyMoldScene: React.FC = () => {
  const { analogyMoldScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const moldAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="2. 템플릿 하나를 만든다" />

          <div
            style={{
              position: "absolute",
              top: "28%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 34,
            }}
          >
            <div
              style={{
                ...panelStyle,
                width: 320,
                height: 230,
                opacity: moldAppear,
                transform: `scale(${interpolate(moldAppear, [0, 1], [0.9, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                border: `2px solid ${C_TEAL}66`,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  left: 18,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: BG,
                  border: `2px solid ${C_TEAL}55`,
                  fontFamily: uiFont,
                  fontSize: 18,
                  fontWeight: 900,
                  color: C_TEAL,
                }}
              >
                템플릿
              </div>
              <SketchPicture size={132} stroke={C_TEAL} strokeWidth={7} />
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 24,
                  fontWeight: 900,
                  color: C_TEAL,
                }}
              >
                템플릿(틀)
              </div>
            </div>

            <div
              style={{
                fontFamily: uiFont,
                fontSize: 50,
                fontWeight: 700,
                lineHeight: 1,
                color: C_TEAL,
                opacity: moldAppear,
              }}
            >
              →
            </div>

            <div
              style={{
                ...panelStyle,
                width: 220,
                height: 220,
                opacity: moldAppear,
                transform: `scale(${interpolate(moldAppear, [0, 1], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 34,
                  fontWeight: 900,
                  color: TEXT,
                }}
              >
                작품
              </div>
              <SketchPicture size={132} stroke={C_VAR} strokeWidth={7} filled />
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 24,
                  fontWeight: 900,
                  color: C_VAR,
                }}
              >
                객체
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "66%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: uiFont,
              fontSize: 34,
              fontWeight: 900,
              color: C_TEAL,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            템플릿만 있으면
            <br />
            같은 작품을 바로 만들 수 있습니다.
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("analogyMoldScene").wordStartFrames}
      />
    </>
  );
};

const AnalogyClassScene: React.FC = () => {
  const { analogyClassScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card1 = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 28,
  });
  const card2 = spring({
    frame: frame - splits[0],
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="3. class가 필요한 이유" />

          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translate(-50%, 0)",
              display: "flex",
              flexDirection: "column",
              gap: 72,
              alignItems: "center",
              width: 900,
            }}
          >
            <MoldCard
              title="배열도 일종의 틀"
              color={C_TEAL}
              width={900}
              style={{
                opacity: card1,
                transform: `scale(${interpolate(card1, [0, 1], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    lineHeight: 1,
                  }}
                >
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 40,
                      fontWeight: 900,
                      color: TEXT,
                      background: BG_CODE,
                      border: `2px solid ${C_TEAL}55`,
                      borderRadius: 16,
                      padding: "14px 22px",
                    }}
                  >
                    int[3]
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["int", "int", "int"].map((typeLabel, index) => (
                      <div
                        key={`${typeLabel}-${index}`}
                        style={{
                          width: 112,
                          height: 88,
                          borderRadius: 18,
                          border: `2px solid ${C_TEAL}66`,
                          background: `${C_TEAL}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...monoStyle,
                          fontSize: 28,
                          color: C_NUMBER,
                        }}
                      >
                        {typeLabel}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 38,
                    fontWeight: 900,
                    color: TEXT,
                    textAlign: "center",
                    lineHeight: 1.35,
                  }}
                >
                  int[3]도 일종의
                  <br />
                  틀이라고 볼 수 있습니다.
                </div>
              </div>
            </MoldCard>

            <MoldCard
              title="하지만 한계가 있다"
              color={C_PAIN}
              width={900}
              style={{
                opacity: card2,
                transform: `scale(${interpolate(card2, [0, 1], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {["int", "int", "int"].map((typeLabel, index) => (
                    <div
                      key={`${typeLabel}-limit-${index}`}
                      style={{
                        width: 112,
                        height: 88,
                        borderRadius: 18,
                        border: `2px solid ${C_PAIN}55`,
                        background: `${C_PAIN}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...monoStyle,
                        fontSize: 28,
                        color: C_NUMBER,
                      }}
                    >
                      {typeLabel}
                    </div>
                  ))}
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 36,
                      fontWeight: 700,
                      color: C_PAIN,
                    }}
                  >
                    ≠
                  </div>
                  <div
                    style={{
                      padding: "18px 24px",
                      borderRadius: 18,
                      border: `2px dashed ${C_PAIN}55`,
                      background: `${C_PAIN}10`,
                      ...monoStyle,
                      fontSize: 28,
                      color: C_COMMENT,
                    }}
                  >
                    String
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 36,
                    fontWeight: 900,
                    color: TEXT,
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  int[3]는 획일적으로 int만 담을 수밖에 없습니다.
                  <br />
                  <span style={{ color: C_PAIN }}>
                    이 문제를 해결하려면 class가 필요합니다.
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 28,
                    fontWeight: 800,
                    color: C_TEAL,
                    textAlign: "center",
                    lineHeight: 1.45,
                  }}
                >
                  class를 이용하면
                  <br />
                  객체의 구성을 우리가 마음대로 정할 수 있습니다.
                </div>
              </div>
            </MoldCard>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("analogyClassScene").wordStartFrames}
      />
    </>
  );
};

const RepeatScene: React.FC = () => {
  const { repeatScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    "int[] person1 = {1, 20, 170};",
    "int[] person2 = {2, 30, 180};",
    "int[] person3 = {3, 25, 165};",
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="4. 학생 예시로 보기" />

          <div
            style={{
              position: "absolute",
              top: "16%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              width: 820,
            }}
          >
            {lines.map((line, index) => {
              const appear = spring({
                frame: frame - s - index * 10,
                fps,
                config: { damping: 13, stiffness: 140 },
                durationInFrames: 20,
              });
              return (
                <CodeBlock
                  key={line}
                  style={{
                    padding: "18px 26px",
                    opacity: appear,
                    transform: `translateY(${interpolate(
                      appear,
                      [0, 1],
                      [22, 0],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    )}px)`,
                  }}
                >
                  <div style={{ ...monoStyle, fontSize: 28, color: TEXT }}>
                    <span style={{ color: C_TYPE }}>int</span>
                    <span style={{ color: TEXT }}>[] </span>
                    <span style={{ color: C_VAR }}>{`person${index + 1}`}</span>
                    <span style={{ color: TEXT }}> = {"{"}</span>
                    <span style={{ color: C_NUMBER }}>
                      {index + 1}, {index === 0 ? 20 : index === 1 ? 30 : 25},{" "}
                      {index === 0 ? 170 : index === 1 ? 180 : 165}
                    </span>
                    <span style={{ color: TEXT }}>{"};"}</span>
                  </div>
                </CodeBlock>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              top: "66%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 18,
              alignItems: "center",
            }}
          >
            {["사람 수 증가", "코드 반복 증가", "관리 피로 증가"].map(
              (label, index) => {
                const appear = spring({
                  frame: frame - s - 30 - index * 8,
                  fps,
                  config: { damping: 13, stiffness: 140 },
                  durationInFrames: 22,
                });
                return (
                  <div
                    key={label}
                    style={{
                      background: `${C_PAIN}14`,
                      border: `2px solid ${C_PAIN}55`,
                      borderRadius: 999,
                      padding: "14px 22px",
                      fontFamily: uiFont,
                      fontSize: 24,
                      fontWeight: 800,
                      color: C_PAIN,
                      opacity: appear,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </div>
                );
              },
            )}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("repeatScene").wordStartFrames}
      />
    </>
  );
};

const MoldScene: React.FC = () => {
  const { moldScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const moldAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });
  const objectAppear = spring({
    frame: frame - splits[0],
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="5. 학생 정보 틀" />

          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 760,
            }}
          >
            <MoldCard
              title="학생 1명 정보 틀"
              color={C_TEAL}
              width={760}
              style={{
                opacity: moldAppear,
                transform: `scale(${interpolate(moldAppear, [0, 1], [0.9, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 30,
                  fontWeight: 900,
                  color: C_TEAL,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                번호, 나이, 키 칸을 미리 만든다
              </div>
              <SlotRow labels={["번호", "나이", "키"]} />
            </MoldCard>
          </div>

          <div
            style={{
              position: "absolute",
              top: "58%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 28,
            }}
          >
            <ObjectCard
              name="찍어낸 person1"
              values={["1", "20", "170"]}
              opacity={objectAppear}
            />
            <ObjectCard
              name="찍어낸 person2"
              values={["2", "30", "180"]}
              opacity={objectAppear}
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("moldScene").wordStartFrames}
      />
    </>
  );
};

const ClassScene: React.FC = () => {
  const { classScene: cfg } = VIDEO_CONFIG;
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
    durationInFrames: 28,
  });
  const previewAppear = spring({
    frame: frame - splits[0],
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="6. Person 클래스로 적기" />

          <div
            style={{
              position: "absolute",
              top: "16%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 30,
              alignItems: "flex-start",
            }}
          >
            <CodeBlock
              style={{
                width: 500,
                maxWidth: 500,
                padding: "22px 28px",
                opacity: codeAppear,
              }}
            >
              <div
                style={{
                  ...monoStyle,
                  fontSize: 28,
                  lineHeight: 1.8,
                  color: TEXT,
                }}
              >
                <span style={{ color: C_KEYWORD }}>class</span>
                <span style={{ color: TEXT }}> </span>
                <span style={{ color: C_TYPE }}>Person</span>
                <span style={{ color: TEXT }}> {"{"}</span>
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: 26,
                  lineHeight: 1.8,
                  color: TEXT,
                  paddingLeft: 22,
                }}
              >
                <span style={{ color: C_TYPE }}>int</span>
                <span style={{ color: TEXT }}> </span>
                <span style={{ color: C_VAR }}>number</span>
                <span style={{ color: TEXT }}>;</span>
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: 26,
                  lineHeight: 1.8,
                  color: TEXT,
                  paddingLeft: 22,
                }}
              >
                <span style={{ color: C_TYPE }}>int</span>
                <span style={{ color: TEXT }}> </span>
                <span style={{ color: C_VAR }}>age</span>
                <span style={{ color: TEXT }}>;</span>
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: 26,
                  lineHeight: 1.8,
                  color: TEXT,
                  paddingLeft: 22,
                }}
              >
                <span style={{ color: C_TYPE }}>int</span>
                <span style={{ color: TEXT }}> </span>
                <span style={{ color: C_VAR }}>height</span>
                <span style={{ color: TEXT }}>;</span>
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: 28,
                  lineHeight: 1.8,
                  color: TEXT,
                }}
              >
                {"}"}
                <span style={{ color: C_COMMENT }}>
                  {" // 공통 구조를 적어 둔 틀"}
                </span>
              </div>
            </CodeBlock>

            <MoldCard
              title="학생 정보 클래스"
              color={C_VAR}
              width={320}
              style={{
                opacity: previewAppear,
                transform: `scale(${interpolate(
                  previewAppear,
                  [0, 1],
                  [0.9, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 26,
                  fontWeight: 900,
                  color: C_VAR,
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                학생 1명 분량의 공통 칸
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {["number", "age", "height"].map((field) => (
                  <div
                    key={field}
                    style={{
                      background: BG_CODE,
                      border: `2px solid ${C_VAR}44`,
                      borderRadius: 12,
                      padding: "14px 18px",
                      ...monoStyle,
                      fontSize: 24,
                      color: C_VAR,
                      textAlign: "center",
                    }}
                  >
                    {field}
                  </div>
                ))}
              </div>
            </MoldCard>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={getAudioScene("classScene").wordStartFrames}
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

  const card1 = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 28,
  });
  const card2 = spring({
    frame: frame - splits[0],
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <SceneAudio src={cfg.audio} />
          <SceneTitle title="7. 정리" />

          <div
            style={{
              position: "absolute",
              top: "44%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              width: 820,
              alignItems: "center",
            }}
          >
            <MoldCard
              title="예시 정리"
              color={C_TEAL}
              width={820}
              style={{
                opacity: card1,
                transform: `scale(${interpolate(card1, [0, 1], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 44,
                  fontWeight: 900,
                  color: TEXT,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                학생 정보처럼
                <br />
                <span style={{ color: C_TEAL }}>같은 구조</span>를 여러 번 만들
                때
                <br />
                클래스라는 <span style={{ color: C_VAR }}>틀</span>이
                필요합니다.
              </div>
            </MoldCard>

            <MoldCard
              title="핵심"
              color={C_VAR}
              width={760}
              style={{
                opacity: card2,
                transform: `scale(${interpolate(card2, [0, 1], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })})`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 34,
                  fontWeight: 800,
                  color: TEXT,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                클래스는 <span style={{ color: C_PAIN }}>객체가 아니라</span>,
                <br />
                객체를 만들기 위한 틀입니다.
                <br />
                <br />
                다음에는 배열 방식의 한계를 보고,
                <br />
                클래스로 어떻게 개선되는지 보겠습니다.
              </div>
            </MoldCard>
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

void [RepeatScene, MoldScene, ClassScene, SummaryScene];

const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.analogyManualScene,
  VIDEO_CONFIG.analogyMoldScene,
  VIDEO_CONFIG.analogyClassScene,
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
    narration: CONTENT.analogyManualScene.narration as string[],
    speechStartFrame: getAudioScene("analogyManualScene").speechStartFrame,
    narrationSplits: getAudioScene("analogyManualScene").narrationSplits,
    sentenceEndFrames: getAudioScene("analogyManualScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.analogyManualScene.durationInFrames,
  },
  {
    offset: fromValues[2],
    narration: CONTENT.analogyMoldScene.narration as string[],
    speechStartFrame: getAudioScene("analogyMoldScene").speechStartFrame,
    narrationSplits: getAudioScene("analogyMoldScene").narrationSplits,
    sentenceEndFrames: getAudioScene("analogyMoldScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.analogyMoldScene.durationInFrames,
  },
  {
    offset: fromValues[3],
    narration: CONTENT.analogyClassScene.narration as string[],
    speechStartFrame: getAudioScene("analogyClassScene").speechStartFrame,
    narrationSplits: getAudioScene("analogyClassScene").narrationSplits,
    sentenceEndFrames: getAudioScene("analogyClassScene").sentenceEndFrames,
    sceneDuration: VIDEO_CONFIG.analogyClassScene.durationInFrames,
  },
]);

export const SRT_TRACKS: SrtTracks = { "ko-KR": SRT_DATA };

const JavaClassTemplate: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.analogyManualScene.durationInFrames}
    >
      <AnalogyManualScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.analogyMoldScene.durationInFrames}
    >
      <AnalogyMoldScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.analogyClassScene.durationInFrames}
    >
      <AnalogyClassScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaClassTemplate;
