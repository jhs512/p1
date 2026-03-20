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
  C_NUMBER,
  C_PAIN,
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

const CODE_THEME = {
  keywordColors: {
    void: C_KEYWORD,
    int: C_TYPE,
    introduce: C_FUNC,
    System: C_FUNC,
    out: C_FUNC,
    println: C_FUNC,
    age: C_VAR,
    _age: C_VAR,
    arg: C_VAR,
    arg0: C_VAR,
    arg1: C_VAR,
    argFirst: C_VAR,
    argSecond: C_VAR,
  },
  operators: ["(", ")", "{", "}", "+", ";", ":", "."],
  operatorColor: TEXT,
  numberColor: C_NUMBER,
  stringColor: C_STRING,
  commentColor: C_COMMENT,
} as const;

const CODE_STEPS = {
  direct: ["void introduce() {", '  System.out.println("나이 : " + 11);', "}"],
  localAge: [
    "void introduce() {",
    "  int age = 11;",
    '  System.out.println("나이 : " + age);',
    "}",
  ],
  twoUnused: [
    "void introduce(int arg0, int arg1) {",
    "  int age = 11;",
    '  System.out.println("나이 : " + age);',
    "}",
  ],
  useFirst: [
    "void introduce(int arg0, int arg1) {",
    "  int age = 11;",
    '  System.out.println("나이 : " + (age + arg0));',
    "}",
  ],
  useTwo: [
    "void introduce(int arg0, int arg1) {",
    "  int age = 11;",
    '  System.out.println("나이 : " + (age + arg0 + arg1));',
    "}",
  ],
  renameReadable: [
    "void introduce(int argFirst, int argSecond) {",
    "  int age = 11;",
    '  System.out.println("나이 : " + (age + argFirst + argSecond));',
    "}",
  ],
  singleArg: [
    "void introduce(int arg) {",
    "  int age = 11;",
    '  System.out.println("나이 : " + (age + arg));',
    "}",
  ],
  conflict: [
    "void introduce(int age) {",
    "  int _age = 11;",
    '  System.out.println("나이 : " + (_age + age));',
    "}",
  ],
  tempFix: [
    "void introduce(int age) {",
    "  int _age = 11;",
    '  System.out.println("나이 : " + age);',
    "}",
  ],
  final: [
    "void introduce(int age) {",
    '  System.out.println("나이 : " + age);',
    "}",
  ],
} as const;

const CALL_EXAMPLES = [
  { text: "introduce(3, 2)", status: "개수 맞음", ok: true },
  { text: "introduce(3)", status: "하나 부족함", ok: false },
  { text: "introduce(3, 2, 1)", status: "하나 많음", ok: false },
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
        gap: 26,
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
          fontWeight: 700,
          letterSpacing: 12,
          color: C_TEAL,
        }}
      >
        JAVA
      </div>
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 104,
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
        코드를 조금씩 바꾸며 이해하기
      </div>
      <div
        style={{
          ...monoStyle,
          fontSize: 30,
          fontWeight: 800,
          color: C_TEAL,
          background: `${C_TEAL}18`,
          border: `2px solid ${C_TEAL}55`,
          borderRadius: 999,
          padding: "12px 30px",
          marginTop: 6,
        }}
      >
        {CONTENT.thumbnail.badge}
      </div>
    </AbsoluteFill>
  );
};

const CodeCard: React.FC<{
  stepLabel: string;
  title: string;
  note: string;
  code: readonly string[];
  accent: string;
  appear: number;
  warning?: boolean;
}> = ({ stepLabel, title, note, code, accent, appear, warning = false }) => {
  return (
    <div
      style={{
        width: "100%",
        background: BG_CODE,
        borderRadius: 22,
        padding: "24px 28px",
        border: `2px solid ${warning ? `${C_PAIN}55` : `${accent}44`}`,
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px)`,
        boxShadow: warning
          ? `0 12px 40px ${C_PAIN}18`
          : `0 12px 40px rgba(0,0,0,0.28)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 22,
              fontWeight: 800,
              color: accent,
              marginBottom: 6,
            }}
          >
            {stepLabel}
          </div>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 30,
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 22,
            fontWeight: 700,
            color: warning ? C_PAIN : "rgba(255,255,255,0.7)",
            textAlign: "right",
            maxWidth: 320,
            lineHeight: 1.4,
          }}
        >
          {note}
        </div>
      </div>

      <div
        style={{
          ...monoStyle,
          fontSize: 24,
          lineHeight: 1.8,
          color: TEXT,
        }}
      >
        {code.map((line, i) => (
          <div key={`${stepLabel}-${i}`}>
            <ColorizedCode text={line} theme={CODE_THEME} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ConceptScene: React.FC = () => {
  const { conceptScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const [split0 = Infinity, split1 = Infinity] =
    cfg.narrationSplits as readonly number[];

  const appear0 = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear1 = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear2 = spring({
    frame: frame - split1,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 고정값에서 출발" />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 940,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <CodeCard
              stepLabel="1단계"
              title="숫자를 직접 적는다"
              note="함수 안에서 결과가 이미 고정됨"
              code={CODE_STEPS.direct}
              accent={C_COMMENT}
              appear={appear0}
            />
            <CodeCard
              stepLabel="2단계"
              title="지역변수로 한 번 뺀다"
              note="보기는 좋아졌지만 값은 아직 안쪽에서만 정해짐"
              code={CODE_STEPS.localAge}
              accent={C_TEAL}
              appear={appear1}
            />
            <CodeCard
              stepLabel="3단계"
              title="받을 자리를 먼저 만든다"
              note="매개변수는 선언만 해 두고 아직 안 써도 됨"
              code={CODE_STEPS.twoUnused}
              accent={C_VAR}
              appear={appear2}
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
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
  const [split0 = Infinity, split1 = Infinity] =
    cfg.narrationSplits as readonly number[];

  const appear0 = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear1 = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear2 = spring({
    frame: frame - split1,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="2. 받은 값을 계산에 넣기" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 940,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 22,
            }}
          >
            <CodeCard
              stepLabel="4단계"
              title="첫 번째 값만 더한다"
              note="매개변수를 쓰기 시작하면 결과가 달라질 수 있음"
              code={CODE_STEPS.useFirst}
              accent={C_VAR}
              appear={appear0}
            />
            <CodeCard
              stepLabel="5단계"
              title="두 번째 값까지 더한다"
              note="받은 두 값이 순서대로 계산에 들어감"
              code={CODE_STEPS.useTwo}
              accent={C_TEAL}
              appear={appear1}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "77%",
              transform: "translateX(-50%)",
              width: 940,
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${C_TEAL}30`,
              borderRadius: 20,
              padding: "18px 22px",
              opacity: appear2,
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 24,
                fontWeight: 800,
                color: C_TEAL,
                marginBottom: 14,
              }}
            >
              호출할 때 개수 맞추기
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
              }}
            >
              {CALL_EXAMPLES.map((item) => (
                <div
                  key={item.text}
                  style={{
                    background: BG_CODE,
                    borderRadius: 16,
                    padding: "16px 18px",
                    border: `2px solid ${item.ok ? `${C_TEAL}44` : `${C_PAIN}44`}`,
                  }}
                >
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 24,
                      color: TEXT,
                      marginBottom: 8,
                    }}
                  >
                    <ColorizedCode text={item.text} theme={CODE_THEME} />
                  </div>
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 22,
                      fontWeight: 800,
                      color: item.ok ? C_TEAL : C_PAIN,
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
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
  const [split0 = Infinity, split1 = Infinity] =
    cfg.narrationSplits as readonly number[];

  const appear0 = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear1 = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear2 = spring({
    frame: frame - split1,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. 이름과 개수 정리" />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 940,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 22,
            }}
          >
            <CodeCard
              stepLabel="6단계"
              title="읽기 좋은 이름으로 바꾼다"
              note="arg0, arg1 대신 뜻이 보이는 이름으로 바꿔도 됨"
              code={CODE_STEPS.renameReadable}
              accent={C_TEAL}
              appear={appear0}
            />
            <CodeCard
              stepLabel="7단계"
              title="필요한 자리만 남긴다"
              note="값이 하나만 필요하면 매개변수도 하나면 충분함"
              code={CODE_STEPS.singleArg}
              accent={C_VAR}
              appear={appear1}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "77%",
              transform: "translateX(-50%)",
              width: 940,
              display: "flex",
              gap: 18,
              opacity: appear2,
            }}
          >
            {[
              "이름은 설명용이라 읽기 좋게 바꿔도 된다",
              "필요한 개수만 선언하면 된다",
              "기능은 이름보다 실제로 쓰는 값이 결정한다",
            ].map((item) => (
              <div
                key={item}
                style={{
                  flex: 1,
                  background: BG_CODE,
                  borderRadius: 16,
                  padding: "18px 20px",
                  border: `2px solid ${C_TEAL}33`,
                  fontFamily: uiFont,
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.5,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
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
  const [split0 = Infinity, split1 = Infinity] =
    cfg.narrationSplits as readonly number[];

  const appear0 = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear1 = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const appear2 = spring({
    frame: frame - split1,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. 이름 충돌을 피하기" />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 940,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <CodeCard
              stepLabel="8단계"
              title="겹치는 이름은 피한다"
              note="같은 범위에서 같은 이름을 둘 다 쓰면 헷갈리고 충돌이 남"
              code={CODE_STEPS.conflict}
              accent={C_PAIN}
              appear={appear0}
              warning
            />
            <CodeCard
              stepLabel="9단계"
              title="안쪽 이름을 잠깐 바꾼다"
              note="지역변수 이름을 바꾸면 충돌은 사라지지만 조금 어색함"
              code={CODE_STEPS.tempFix}
              accent={C_COMMENT}
              appear={appear1}
            />
            <CodeCard
              stepLabel="10단계"
              title="필요한 이름만 남긴다"
              note="마지막에는 매개변수만 바로 쓰는 형태가 가장 깔끔함"
              code={CODE_STEPS.final}
              accent={C_TEAL}
              appear={appear2}
            />
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.resultScene.wordStartFrames}
      />
    </>
  );
};

const SummaryScene: React.FC = () => {
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames, { out: false });
  const [split0 = Infinity, split1 = Infinity] =
    cfg.narrationSplits as readonly number[];

  const triggerFrames = [cfg.speechStartFrame, split0, split1, split1 + 24];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="5. 매개변수 정리" />
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 940,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            {SUMMARY_CARDS.map((card, i) => {
              const appear = spring({
                frame: frame - triggerFrames[i],
                fps,
                config: { damping: 12, stiffness: 140 },
                durationInFrames: 30,
              });
              return (
                <div
                  key={card}
                  style={{
                    background: BG_CODE,
                    borderRadius: 18,
                    padding: "20px 24px",
                    border: `2px solid ${C_TEAL}3a`,
                    opacity: appear,
                    transform: `scale(${interpolate(appear, [0, 1], [0.92, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })})`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 22,
                      fontWeight: 800,
                      color: C_DIM,
                      marginBottom: 10,
                    }}
                  >
                    핵심 {i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: uiFont,
                      fontSize: 30,
                      fontWeight: 900,
                      color: "#ffffff",
                      lineHeight: 1.4,
                    }}
                  >
                    {card}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "75%",
              transform: "translateX(-50%)",
              width: 940,
              background: "rgba(78,201,176,0.08)",
              border: `2px solid ${C_TEAL}44`,
              borderRadius: 22,
              padding: "24px 28px",
              opacity: spring({
                frame: frame - (split1 + 30),
                fps,
                config: { damping: 12, stiffness: 140 },
                durationInFrames: 34,
              }),
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 24,
                fontWeight: 800,
                color: C_TEAL,
                marginBottom: 12,
              }}
            >
              최종 코드 모습
            </div>
            <div
              style={{
                ...monoStyle,
                fontSize: 26,
                lineHeight: 1.85,
                color: TEXT,
              }}
            >
              {CODE_STEPS.final.map((line, i) => (
                <div key={`final-${i}`}>
                  <ColorizedCode text={line} theme={CODE_THEME} />
                </div>
              ))}
            </div>
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
