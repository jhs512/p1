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
  C_DIM,
  C_FUNC,
  C_KEYWORD,
  C_STRING,
  C_TEAL,
  C_TYPE,
  C_VAR,
  TEXT,
} from "./colors";
import { HEIGHT, WIDTH } from "./config";

const STUB_AUDIO = {
  durationInFrames: 30,
  narrationSplits: [] as number[],
  speechStartFrame: 0,
  wordStartFrames: [] as number[][],
} as const;

const AUDIO = {
  fixedScene: AUDIO_CONFIG.fixedScene ?? STUB_AUDIO,
  slotScene: AUDIO_CONFIG.slotScene ?? STUB_AUDIO,
  callScene: AUDIO_CONFIG.callScene ?? STUB_AUDIO,
  renameScene: AUDIO_CONFIG.renameScene ?? STUB_AUDIO,
  summaryScene: AUDIO_CONFIG.summaryScene ?? STUB_AUDIO,
} as const;

export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  fixedScene: {
    audio: "prm-fixed.mp3",
    durationInFrames: AUDIO.fixedScene.durationInFrames,
    speechStartFrame: AUDIO.fixedScene.speechStartFrame,
    narration: CONTENT.fixedScene.narration as string[],
    narrationSplits: AUDIO.fixedScene.narrationSplits,
  },
  slotScene: {
    audio: "prm-slot.mp3",
    durationInFrames: AUDIO.slotScene.durationInFrames,
    speechStartFrame: AUDIO.slotScene.speechStartFrame,
    narration: CONTENT.slotScene.narration as string[],
    narrationSplits: AUDIO.slotScene.narrationSplits,
  },
  callScene: {
    audio: "prm-call.mp3",
    durationInFrames: AUDIO.callScene.durationInFrames,
    speechStartFrame: AUDIO.callScene.speechStartFrame,
    narration: CONTENT.callScene.narration as string[],
    narrationSplits: AUDIO.callScene.narrationSplits,
  },
  renameScene: {
    audio: "prm-rename.mp3",
    durationInFrames: AUDIO.renameScene.durationInFrames,
    speechStartFrame: AUDIO.renameScene.speechStartFrame,
    narration: CONTENT.renameScene.narration as string[],
    narrationSplits: AUDIO.renameScene.narrationSplits,
  },
  summaryScene: {
    audio: "prm-summary.mp3",
    durationInFrames: AUDIO.summaryScene.durationInFrames,
    speechStartFrame: AUDIO.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO.summaryScene.narrationSplits,
  },
} as const;

const CODE_THEME = {
  keywordColors: {
    void: C_KEYWORD,
    String: C_TYPE,
    introduce: C_FUNC,
    System: C_FUNC,
    out: C_FUNC,
    println: C_FUNC,
    name: C_VAR,
    userName: C_VAR,
  },
  operators: ["(", ")", "{", "}", "+", ";", ":", "."],
  operatorColor: TEXT,
  stringColor: C_STRING,
  commentColor: C_COMMENT,
} as const;

const FIXED_CODE = [
  "void introduce() {",
  '  System.out.println("민준님 안녕하세요");',
  "}",
] as const;

const SLOT_CODE = [
  "void introduce(String name) {",
  '  System.out.println(name + "님 안녕하세요");',
  "}",
] as const;

const RENAMED_CODE = [
  "void introduce(String userName) {",
  '  System.out.println(userName + "님 안녕하세요");',
  "}",
] as const;

const SUMMARY_CARDS = CONTENT.summaryScene.cards as string[];

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
        gap: 24,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C_TEAL}20 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 12,
          color: C_TEAL,
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
          lineHeight: 1.02,
          textAlign: "center",
          textShadow: `0 0 60px ${C_TEAL}55`,
        }}
      >
        Java
        <br />
        <span style={{ color: C_TEAL }}>매개변수</span>
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 30,
          fontWeight: 700,
          color: "rgba(255,255,255,0.72)",
        }}
      >
        함수의 빈칸으로 이해하기
      </div>
      <div
        style={{
          ...monoStyle,
          fontSize: 28,
          fontWeight: 800,
          color: C_TEAL,
          background: `${C_TEAL}18`,
          border: `2px solid ${C_TEAL}55`,
          borderRadius: 999,
          padding: "12px 28px",
        }}
      >
        {CONTENT.thumbnail.badge}
      </div>
    </AbsoluteFill>
  );
};

const FunctionCard: React.FC<{
  code: readonly string[];
  title: string;
  note: string;
  accent: string;
  slotLabel: string;
  slotValue: string;
  outputText: string;
  highlightLine: number;
  slotFilled: boolean;
}> = ({
  code,
  title,
  note,
  accent,
  slotLabel,
  slotValue,
  outputText,
  highlightLine,
  slotFilled,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "47%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 930,
        background: BG_CODE,
        borderRadius: 24,
        padding: "26px 28px 24px",
        border: `2px solid ${accent}44`,
        boxShadow: "0 18px 60px rgba(0,0,0,0.34)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 20,
              fontWeight: 800,
              color: accent,
              marginBottom: 8,
            }}
          >
            함수는 틀, 매개변수는 빈칸
          </div>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 34,
              fontWeight: 900,
              color: "#ffffff",
              marginBottom: 10,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.5,
              maxWidth: 620,
            }}
          >
            {note}
          </div>
        </div>
        <div
          style={{
            ...monoStyle,
            fontSize: 22,
            fontWeight: 800,
            color: accent,
            background: `${accent}18`,
            border: `2px solid ${accent}44`,
            borderRadius: 999,
            padding: "10px 18px",
          }}
        >
          parameter slot
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 20,
              fontWeight: 800,
              color: accent,
              marginBottom: 10,
            }}
          >
            함수 틀 카드
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#222",
                borderRadius: 16,
                padding: "18px 22px",
                border: `2px solid ${accent}28`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  fontWeight: 800,
                  color: C_DIM,
                  marginBottom: 12,
                }}
              >
                입력 슬롯
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    ...monoStyle,
                    fontSize: 22,
                    color: accent,
                    background: `${accent}16`,
                    borderRadius: 999,
                    padding: "8px 14px",
                    minWidth: 92,
                    textAlign: "center",
                  }}
                >
                  {slotLabel}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 14,
                    border: `2px dashed ${slotFilled ? `${accent}55` : "rgba(255,255,255,0.18)"}`,
                    background: slotFilled
                      ? `${accent}14`
                      : "rgba(255,255,255,0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 24,
                      color: slotFilled ? "#ffffff" : C_DIM,
                    }}
                  >
                    {slotFilled ? slotValue : "값 대기 중"}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 42,
                color: C_DIM,
              }}
            >
              →
            </div>

            <div
              style={{
                flex: 1,
                background: "#222",
                borderRadius: 16,
                padding: "18px 22px",
                border: `2px solid ${accent}28`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  fontWeight: 800,
                  color: C_DIM,
                  marginBottom: 12,
                }}
              >
                출력 화면
              </div>
              <div
                style={{
                  ...monoStyle,
                  fontSize: 28,
                  color: "#ffffff",
                  background: "#171717",
                  borderRadius: 14,
                  padding: "14px 18px",
                  minHeight: 64,
                }}
              >
                {outputText}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#252525",
            borderRadius: 18,
            padding: "18px 18px 16px",
          }}
        >
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 20,
              fontWeight: 800,
              color: accent,
              marginBottom: 12,
            }}
          >
            코드 카드
          </div>
          <div
            style={{
              ...monoStyle,
              fontSize: 25,
              lineHeight: 1.82,
              color: TEXT,
            }}
          >
            {code.map((line, index) => (
              <div
                key={`${title}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "34px 1fr",
                  gap: 12,
                  alignItems: "start",
                  background:
                    index === highlightLine ? `${accent}1f` : "transparent",
                  border:
                    index === highlightLine
                      ? `1px solid ${accent}38`
                      : "1px solid transparent",
                  borderRadius: 12,
                  padding: "3px 8px",
                }}
              >
                <span style={{ color: C_DIM, paddingTop: 2 }}>{index + 1}</span>
                <span style={{ whiteSpace: "pre" }}>
                  <ColorizedCode text={line} theme={CODE_THEME} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FixedScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.fixedScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const appear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 36,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 빈칸이 없는 고정 함수" />
          <div style={{ opacity: appear }}>
            <FunctionCard
              code={FIXED_CODE}
              title="늘 같은 말만 출력하는 틀"
              note="아직은 값이 들어올 빈칸이 없어서, 결과도 늘 같은 문장입니다."
              accent={C_COMMENT}
              slotLabel="고정"
              slotValue="민준"
              outputText="민준님 안녕하세요"
              highlightLine={1}
              slotFilled={false}
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO.fixedScene.wordStartFrames}
      />
    </>
  );
};

const SlotScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.slotScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const appear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 36,
  });
  const labelAppear = spring({
    frame: frame - (cfg.narrationSplits[0] ?? cfg.speechStartFrame),
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 28,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="2. 괄호 안에 빈칸 만들기" />
          <div style={{ opacity: appear }}>
            <FunctionCard
              code={SLOT_CODE}
              title="이제 값을 받을 슬롯이 생김"
              note="괄호 안의 이름은, 나중에 들어올 값을 붙잡아 둘 빈칸의 라벨입니다."
              accent={C_VAR}
              slotLabel={labelAppear > 0.2 ? "name" : "빈칸"}
              slotValue=""
              outputText="값을 기다리는 중"
              highlightLine={0}
              slotFilled={false}
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO.slotScene.wordStartFrames}
      />
    </>
  );
};

const CallScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.callScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const appear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 36,
  });
  const split0 = cfg.narrationSplits[0] ?? cfg.speechStartFrame;
  const firstFill = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 28,
  });
  const secondFill = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 150 },
    durationInFrames: 28,
  });
  const usingSecond = frame >= split0;

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. 호출할 때 값이 들어간다" />
          <div style={{ opacity: appear }}>
            <FunctionCard
              code={SLOT_CODE}
              title="같은 함수, 다른 값, 다른 결과"
              note="호출할 때 넣은 값이 슬롯에 들어가고, 출력 문장은 그 값에 맞춰 바뀝니다."
              accent={C_TEAL}
              slotLabel="name"
              slotValue={usingSecond ? "서연" : "민준"}
              outputText={
                usingSecond ? "서연님 안녕하세요" : "민준님 안녕하세요"
              }
              highlightLine={1}
              slotFilled={firstFill > 0.15 || secondFill > 0.15}
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO.callScene.wordStartFrames}
      />
    </>
  );
};

const RenameScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.renameScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const appear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 36,
  });
  const split0 = cfg.narrationSplits[0] ?? cfg.speechStartFrame;
  const usingRenamed = frame >= split0;

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. 이름은 설명용이다" />
          <div style={{ opacity: appear }}>
            <FunctionCard
              code={usingRenamed ? RENAMED_CODE : SLOT_CODE}
              title="빈칸 이름은 읽기 좋게 바꿔도 됨"
              note="중요한 것은 이름 자체보다, 호출에서 들어온 값을 그 자리에서 사용한다는 점입니다."
              accent={C_COMMENT}
              slotLabel={usingRenamed ? "userName" : "name"}
              slotValue="지우"
              outputText="지우님 안녕하세요"
              highlightLine={1}
              slotFilled
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO.renameScene.wordStartFrames}
      />
    </>
  );
};

const SummaryScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.summaryScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames, { out: false });
  const appear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 36,
  });
  const chipFrames = [
    cfg.speechStartFrame,
    AUDIO.summaryScene.wordStartFrames[0]?.[3] ?? cfg.speechStartFrame + 24,
    AUDIO.summaryScene.wordStartFrames[1]?.[6] ??
      (cfg.narrationSplits[0] ?? cfg.speechStartFrame) + 24,
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="5. 매개변수 한 번에 정리" />
          <div style={{ opacity: appear }}>
            <FunctionCard
              code={RENAMED_CODE}
              title="매개변수는 함수의 빈칸"
              note="같은 함수 틀에 다른 값을 넣을 수 있게 해 주는 자리라고 보면 가장 직관적입니다."
              accent={C_TEAL}
              slotLabel="userName"
              slotValue="민준 / 서연 / 지우"
              outputText="같은 틀로 여러 번 사용"
              highlightLine={1}
              slotFilled
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "77%",
              transform: "translateX(-50%)",
              width: 930,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            {SUMMARY_CARDS.map((card, index) => {
              const cardAppear = spring({
                frame: frame - chipFrames[index],
                fps,
                config: { damping: 12, stiffness: 140 },
                durationInFrames: 28,
              });
              return (
                <div
                  key={card}
                  style={{
                    borderRadius: 16,
                    padding: "16px 18px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C_TEAL}34`,
                    opacity: cardAppear,
                  }}
                >
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 18,
                      fontWeight: 800,
                      color: C_DIM,
                      marginBottom: 8,
                    }}
                  >
                    핵심 {index + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 24,
                      fontWeight: 900,
                      color: "#ffffff",
                      lineHeight: 1.45,
                    }}
                  >
                    {card}
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
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO.summaryScene.wordStartFrames}
      />
    </>
  );
};

const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.fixedScene,
  VIDEO_CONFIG.slotScene,
  VIDEO_CONFIG.callScene,
  VIDEO_CONFIG.renameScene,
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

export const Component: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.fixedScene.durationInFrames}
    >
      <FixedScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.slotScene.durationInFrames}
    >
      <SlotScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.callScene.durationInFrames}
    >
      <CallScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.renameScene.durationInFrames}
    >
      <RenameScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);
