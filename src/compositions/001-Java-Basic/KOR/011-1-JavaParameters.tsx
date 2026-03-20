// src/compositions/001-Java-Basic/KOR/011-1-JavaParameters.tsx
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
  ColorizedCode,
  ContentArea,
  SceneTitle,
  Subtitle,
  THUMB_CROSS,
  monoStyle,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { computeFromValues } from "../../../utils/srt";
import { CONTENT } from "./011-2-content";
import { AUDIO_CONFIG } from "./011-3-audio.gen";
import {
  BG,
  BG_CODE,
  BG_THUMB,
  C_COMMENT,
  C_FUNC,
  C_KEYWORD,
  C_STRING,
  C_TEAL,
  C_TYPE,
  C_VAR,
  TEXT,
} from "./colors";
import { HEIGHT, WIDTH } from "./config";

export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  conceptScene: {
    audio: "prm-concept.mp3",
    durationInFrames: AUDIO_CONFIG.conceptScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.conceptScene.speechStartFrame,
    narration: CONTENT.conceptScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.conceptScene.narrationSplits,
  },
  declarationScene: {
    audio: "prm-declare.mp3",
    durationInFrames: AUDIO_CONFIG.declarationScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.declarationScene.speechStartFrame,
    narration: CONTENT.declarationScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.declarationScene.narrationSplits,
  },
  callScene: {
    audio: "prm-call.mp3",
    durationInFrames: AUDIO_CONFIG.callScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.callScene.speechStartFrame,
    narration: CONTENT.callScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.callScene.narrationSplits,
  },
  resultScene: {
    audio: "prm-result.mp3",
    durationInFrames: AUDIO_CONFIG.resultScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.resultScene.speechStartFrame,
    narration: CONTENT.resultScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.resultScene.narrationSplits,
  },
  summaryScene: {
    audio: "prm-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
} as const;

const FUNCTION_LINES = [
  { left: "void", color: C_KEYWORD },
  { left: " greet", color: C_FUNC },
  { left: "(", color: TEXT },
  { left: "String", color: C_TYPE },
  { left: " name", color: C_VAR },
  { left: ")", color: TEXT },
  { left: " {", color: TEXT },
] as const;

const CALL_VALUES = [
  { label: '"민준"', result: '"민준님 안녕하세요"' },
  { label: '"서연"', result: '"서연님 안녕하세요"' },
] as const;

const CODE_THEME = {
  keywordColors: {
    void: C_KEYWORD,
    String: C_TYPE,
    greet: C_FUNC,
    println: C_FUNC,
    name: C_VAR,
  },
  operators: ["(", ")", "{", "}", ";", "+"],
  operatorColor: TEXT,
  stringColor: C_STRING,
  commentColor: C_COMMENT,
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
          background: `radial-gradient(circle, ${C_TEAL}1f 0%, transparent 70%)`,
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
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1,
          textShadow: `0 0 60px ${C_TEAL}66, 0 0 120px ${C_TEAL}22`,
        }}
      >
        Java
        <br />
        <span style={{ color: C_TEAL }}>매개변수</span>
      </div>
      <div
        style={{
          ...monoStyle,
          fontSize: 62,
          fontWeight: 900,
          color: C_TEAL,
          background: `${C_TEAL}18`,
          border: `2px solid ${C_TEAL}55`,
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

const ConceptScene: React.FC = () => {
  const { conceptScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const s = cfg.speechStartFrame;
  const [split0 = Infinity, split1 = split0] =
    cfg.narrationSplits as readonly number[];

  const fixedCardAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 42,
  });
  const parameterCardAppear = spring({
    frame: frame - split1,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 42,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 왜 매개변수가 필요할까?" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 26,
              width: 940,
            }}
          >
            {[
              {
                title: "버튼이 하나뿐인 자판기",
                code: [
                  "void greet() {",
                  '  println("민준님 안녕하세요");',
                  "}",
                ],
                note: "누를 때마다 같은 음료만 나오는 것처럼 결과가 고정됨",
                color: C_COMMENT,
                appear: fixedCardAppear,
              },
              {
                title: "주문 칸이 있는 자판기",
                code: [
                  "void greet(String name) {",
                  '  println(name + "님 안녕하세요");',
                  "}",
                ],
                note: "원하는 값을 넣으면 그 값에 맞춰 결과가 달라짐",
                color: C_TEAL,
                appear: parameterCardAppear,
              },
            ].map((card, index) => (
              <div
                key={card.title}
                style={{
                  width: "100%",
                  background: BG_CODE,
                  borderRadius: 20,
                  padding: "28px 30px",
                  border: `2px solid ${card.color}44`,
                  opacity: card.appear,
                  transform: `translateY(${interpolate(card.appear, [0, 1], [index === 0 ? 18 : 28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: uiFont,
                    fontSize: 28,
                    fontWeight: 800,
                    color: card.color,
                    marginBottom: 18,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.15fr 0.85fr",
                    gap: 28,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 25,
                      lineHeight: 1.9,
                      color: TEXT,
                      whiteSpace: "pre",
                    }}
                  >
                    {card.code.map((line) => (
                      <div key={line}>
                        <ColorizedCode text={line} theme={CODE_THEME} />
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      background:
                        index === 0
                          ? "rgba(255,255,255,0.05)"
                          : `${C_TEAL}14`,
                      border:
                        index === 0
                          ? "1px solid rgba(255,255,255,0.08)"
                          : `1px solid ${C_TEAL}40`,
                      borderRadius: 18,
                      padding: "20px 22px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: uiFont,
                        fontSize: 22,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.72)",
                        marginBottom: 10,
                      }}
                    >
                      중학생 비유
                    </div>
                    <div
                      style={{
                        fontFamily: uiFont,
                        fontSize: 26,
                        fontWeight: 800,
                        color: "#ffffff",
                        lineHeight: 1.5,
                      }}
                    >
                      {card.note}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                opacity: spring({
                  frame: frame - split0,
                  fps,
                  config: { damping: 12, stiffness: 140 },
                  durationInFrames: 30,
                }),
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 28,
                  fontWeight: 800,
                  color: C_TEAL,
                  background: `${C_TEAL}16`,
                  border: `2px solid ${C_TEAL}40`,
                  borderRadius: 999,
                  padding: "12px 24px",
                }}
              >
                매개변수 = 원하는 값을 고르는 주문 칸
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.conceptScene.wordStartFrames}
      />
    </>
  );
};

const DeclarationScene: React.FC = () => {
  const { declarationScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const s = cfg.speechStartFrame;
  const split0 = cfg.narrationSplits[0] ?? Infinity;
  const blockAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 48,
  });
  const paramHighlight = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="2. 매개변수 선언 위치" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 900,
              opacity: blockAppear,
            }}
          >
            <div
              style={{
                background: BG_CODE,
                borderRadius: 22,
                padding: "34px 42px",
                boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              }}
            >
              <div
                style={{
                  ...monoStyle,
                  fontSize: 34,
                  lineHeight: 2,
                  whiteSpace: "pre",
                }}
              >
                <div>
                  {FUNCTION_LINES.map((part, idx) => {
                    const isParam = part.left === " name";
                    return (
                      <span
                        key={idx}
                        style={{
                          color: part.color,
                          background: isParam
                            ? `rgba(156,220,254,${paramHighlight * 0.22})`
                            : "transparent",
                          borderRadius: isParam ? 8 : undefined,
                          padding: isParam ? "2px 6px" : undefined,
                          boxShadow:
                            isParam && paramHighlight > 0.01
                              ? `0 0 ${paramHighlight * 18}px rgba(156,220,254,0.35)`
                              : "none",
                        }}
                      >
                        {part.left}
                      </span>
                    );
                  })}
                </div>
                <div style={{ paddingLeft: 42 }}>
                  <span style={{ color: C_FUNC }}>println</span>
                  <span style={{ color: TEXT }}>(</span>
                  <span style={{ color: C_VAR }}>name</span>
                  <span style={{ color: TEXT }}> + </span>
                  <span style={{ color: C_STRING }}>"님 안녕하세요"</span>
                  <span style={{ color: TEXT }}>);</span>
                </div>
                <div style={{ color: TEXT }}>{"}"}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                justifyContent: "center",
                opacity: paramHighlight,
                transform: `translateY(${interpolate(paramHighlight, [0, 1], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 28,
                  fontWeight: 800,
                  color: C_VAR,
                  background: "rgba(156,220,254,0.12)",
                  border: "2px solid rgba(156,220,254,0.38)",
                  borderRadius: 14,
                  padding: "10px 22px",
                }}
              >
                name = 함수가 받을 값의 이름표
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.declarationScene.wordStartFrames}
      />
    </>
  );
};

const CallScene: React.FC = () => {
  const { callScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const s = cfg.speechStartFrame;
  const split0 = cfg.narrationSplits[0] ?? Infinity;
  const call1Appear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 34,
  });
  const call2Appear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. 호출할 때 값을 넣는다" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 920,
              display: "flex",
              flexDirection: "column",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div
              style={{
                ...monoStyle,
                fontSize: 34,
                background: BG_CODE,
                borderRadius: 20,
                padding: "28px 34px",
                width: "100%",
              }}
            >
              {CALL_VALUES.map((call, i) => {
                const appear = i === 0 ? call1Appear : call2Appear;
                return (
                  <div
                    key={call.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: appear,
                      transform: `translateY(${interpolate(appear, [0, 1], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                      marginBottom: i === 0 ? 16 : 0,
                    }}
                  >
                    <div>
                      <span style={{ color: C_FUNC }}>greet</span>
                      <span style={{ color: TEXT }}>(</span>
                      <span style={{ color: C_STRING }}>{call.label}</span>
                      <span style={{ color: TEXT }}>);</span>
                    </div>
                    <div
                      style={{
                        fontFamily: uiFont,
                        fontSize: 24,
                        fontWeight: 700,
                        color: C_TEAL,
                      }}
                    >
                      실제 값 전달
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                gap: 34,
                alignItems: "center",
              }}
            >
              {CALL_VALUES.map((call, i) => {
                const appear = i === 0 ? call1Appear : call2Appear;
                return (
                  <React.Fragment key={call.label}>
                    <div
                      style={{
                        fontFamily: uiFont,
                        fontSize: 28,
                        fontWeight: 800,
                        color: C_STRING,
                        background: `${C_STRING}18`,
                        border: `2px solid ${C_STRING}55`,
                        borderRadius: 16,
                        padding: "14px 26px",
                        opacity: appear,
                      }}
                    >
                      {call.label}
                    </div>
                    {i === 0 ? (
                      <div
                        style={{
                          fontSize: 40,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        →
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>

            <div
              style={{
                fontFamily: uiFont,
                fontSize: 32,
                fontWeight: 800,
                color: C_VAR,
                background: "rgba(156,220,254,0.12)",
                border: "2px solid rgba(156,220,254,0.38)",
                borderRadius: 16,
                padding: "16px 30px",
                opacity: Math.max(call1Appear, call2Appear),
              }}
            >
              매개변수 자리에 값이 들어감
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

const ResultScene: React.FC = () => {
  const { resultScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const s = cfg.speechStartFrame;
  const split0 = cfg.narrationSplits[0] ?? Infinity;

  const firstAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 36,
  });
  const secondAppear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 36,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. 값이 바뀌면 결과도 바뀐다" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 930,
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            {CALL_VALUES.map((call, i) => {
              const appear = i === 0 ? firstAppear : secondAppear;
              return (
                <div
                  key={call.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "250px 110px 1fr",
                    alignItems: "center",
                    gap: 22,
                    opacity: appear,
                    transform: `translateY(${interpolate(appear, [0, 1], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                  }}
                >
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 28,
                      color: C_FUNC,
                      background: BG_CODE,
                      borderRadius: 16,
                      padding: "18px 22px",
                    }}
                  >
                    greet({call.label});
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 42,
                      color: "rgba(255,255,255,0.28)",
                    }}
                  >
                    →
                  </div>
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 28,
                      color: C_STRING,
                      background: `${C_TEAL}12`,
                      border: `2px solid ${C_TEAL}38`,
                      borderRadius: 16,
                      padding: "18px 22px",
                    }}
                  >
                    println({call.result});
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: 4,
                display: "flex",
                justifyContent: "center",
                opacity: secondAppear,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 28,
                  fontWeight: 800,
                  color: C_TEAL,
                  background: `${C_TEAL}18`,
                  border: `2px solid ${C_TEAL}55`,
                  borderRadius: 14,
                  padding: "12px 22px",
                }}
              >
                같은 함수, 다른 값, 다른 결과
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.resultScene.wordStartFrames}
      />
    </>
  );
};

const SUMMARY_CARDS = CONTENT.summaryScene.cards as string[];

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames, { out: false });
  const s = cfg.speechStartFrame;

  const cardFrames = [
    AUDIO_CONFIG.summaryScene.wordTiming["매개변수는"]?.[0] ?? s,
    AUDIO_CONFIG.summaryScene.wordTiming["호출할"]?.[0] ??
      cfg.narrationSplits[0] ??
      s,
    AUDIO_CONFIG.summaryScene.wordTiming["같은"]?.[0] ??
      cfg.narrationSplits[0] ??
      s + 24,
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="5. 매개변수 정리" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 920,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {SUMMARY_CARDS.map((card, i) => {
              const appear = spring({
                frame: frame - cardFrames[i],
                fps,
                config: { damping: 12, stiffness: 140 },
                durationInFrames: 36,
              });
              return (
                <div
                  key={card}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    background: "#2a2a2a",
                    border: `2px solid ${C_TEAL}44`,
                    borderRadius: 18,
                    padding: "20px 28px",
                    opacity: appear,
                    transform: `scale(${interpolate(appear, [0, 1], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 28,
                      fontWeight: 900,
                      color: C_TEAL,
                      minWidth: 40,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 30,
                      fontWeight: 800,
                      color: "#ffffff",
                    }}
                  >
                    {card}
                  </div>
                </div>
              );
            })}

            <div
              style={{
                ...monoStyle,
                marginTop: 8,
                fontSize: 28,
                lineHeight: 1.9,
                background: BG_CODE,
                borderRadius: 18,
                padding: "24px 30px",
                opacity: spring({
                  frame:
                    frame -
                    (AUDIO_CONFIG.summaryScene.wordTiming["다양하게"]?.[0] ??
                      cfg.narrationSplits[0] ??
                      s),
                  fps,
                  config: { damping: 12, stiffness: 140 },
                  durationInFrames: 36,
                }),
              }}
            >
              <div>
                <span style={{ color: C_KEYWORD }}>void</span>
                <span style={{ color: C_FUNC }}> greet</span>
                <span style={{ color: TEXT }}>(</span>
                <span style={{ color: C_TYPE }}>String</span>
                <span style={{ color: C_VAR }}> name</span>
                <span style={{ color: TEXT }}>) {"{"}</span>
              </div>
              <div style={{ paddingLeft: 36 }}>
                <span style={{ color: C_FUNC }}>println</span>
                <span style={{ color: TEXT }}>(</span>
                <span style={{ color: C_VAR }}>name</span>
                <span style={{ color: TEXT }}>);</span>
              </div>
              <div style={{ color: TEXT }}>{"}"}</div>
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

const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.conceptScene,
  VIDEO_CONFIG.declarationScene,
  VIDEO_CONFIG.callScene,
  VIDEO_CONFIG.resultScene,
  VIDEO_CONFIG.summaryScene,
];
const sceneDurations = sceneList.map((scene) => scene.durationInFrames);
const fromValues = computeFromValues(sceneDurations, {
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

const JavaParameters: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.conceptScene.durationInFrames}
    >
      <ConceptScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.declarationScene.durationInFrames}
    >
      <DeclarationScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.callScene.durationInFrames}
    >
      <CallScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.resultScene.durationInFrames}
    >
      <ResultScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaParameters;
