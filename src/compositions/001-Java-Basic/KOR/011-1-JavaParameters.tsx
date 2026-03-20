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

type Snapshot = {
  badge: string;
  title: string;
  note: string;
  callLine: string;
  code: readonly string[];
  outputLine: string;
  accent: string;
  prepLineIndex?: number;
  printLineIndex: number;
  footer?: string;
};

type Trace = {
  call: number;
  enter: number;
  prep?: number;
  print: number;
  output: number;
};

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
  operators: ["(", ")", "{", "}", "+", ";", ":", ".", "=", ","],
  operatorColor: TEXT,
  numberColor: C_NUMBER,
  stringColor: C_STRING,
  commentColor: C_COMMENT,
} as const;

const CODE_STEPS = {
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

const SUMMARY_CARDS = CONTENT.summaryScene.cards as string[];

const getActiveIndex = (frame: number, starts: readonly number[]) => {
  let active = 0;
  starts.forEach((start, index) => {
    if (frame >= start) {
      active = index;
    }
  });
  return active;
};

const buildTrace = (
  words: readonly number[] | undefined,
  fallback: number,
  needsPrep: boolean,
): Trace => {
  const frames = words && words.length > 0 ? [...words] : [fallback];
  const lastIndex = frames.length - 1;
  const pick = (index: number) =>
    frames[Math.min(index, lastIndex)] ?? fallback;
  const enter = pick(Math.min(1, lastIndex));
  const prep = needsPrep ? pick(Math.min(3, lastIndex)) : undefined;
  const print = pick(Math.min(needsPrep ? 5 : 3, lastIndex));
  const output = pick(lastIndex);

  return {
    call: pick(0),
    enter,
    prep,
    print,
    output,
  };
};

const getLineStage = (frame: number, trace: Trace) => {
  if (frame >= trace.output) return "output";
  if (frame >= trace.print) return "print";
  if (trace.prep !== undefined && frame >= trace.prep) return "prep";
  if (frame >= trace.enter) return "enter";
  return "call";
};

const getLineHighlight = (
  frame: number,
  trace: Trace,
  snapshot: Snapshot,
  lineIndex: number,
) => {
  const stage = getLineStage(frame, trace);
  if (stage === "enter" && lineIndex === 0) return true;
  if (stage === "prep" && lineIndex === snapshot.prepLineIndex) return true;
  if (
    (stage === "print" || stage === "output") &&
    lineIndex === snapshot.printLineIndex
  )
    return true;
  return false;
};

const getStageLabels = (snapshot: Snapshot) => [
  "호출",
  "진입",
  snapshot.prepLineIndex === undefined ? "핵심 실행" : "값 준비",
  "출력",
  "결과",
];

const getActiveStageIndex = (frame: number, trace: Trace) => {
  if (frame >= trace.output) return 4;
  if (frame >= trace.print) return 3;
  if (trace.prep !== undefined && frame >= trace.prep) return 2;
  if (frame >= trace.enter) return 1;
  return 0;
};

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
        호출과 실행 흐름으로 이해하기
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

const ExecutionCard: React.FC<{
  sceneTitle: string;
  snapshot: Snapshot;
  trace: Trace;
  appear: number;
  bottomContent?: React.ReactNode;
}> = ({ sceneTitle, snapshot, trace, appear, bottomContent }) => {
  const frame = useCurrentFrame();
  const activeStageIndex = getActiveStageIndex(frame, trace);
  const stageLabels = getStageLabels(snapshot);
  const callOpacity = interpolate(frame, [trace.call, trace.enter], [1, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outputOpacity = interpolate(
    frame,
    [trace.print, trace.output],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "47%",
        left: "50%",
        transform: `translate(-50%, -50%) translateY(${interpolate(
          appear,
          [0, 1],
          [20, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )}px)`,
        width: 930,
        background: BG_CODE,
        borderRadius: 24,
        padding: "26px 28px 24px",
        border: `2px solid ${snapshot.accent}44`,
        boxShadow: "0 18px 60px rgba(0,0,0,0.34)",
        opacity: appear,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
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
              color: snapshot.accent,
              marginBottom: 8,
            }}
          >
            {sceneTitle}
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
            {snapshot.title}
          </div>
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            {snapshot.note}
          </div>
        </div>
        <div
          style={{
            ...monoStyle,
            fontSize: 22,
            fontWeight: 800,
            color: snapshot.accent,
            background: `${snapshot.accent}18`,
            border: `2px solid ${snapshot.accent}44`,
            borderRadius: 999,
            padding: "10px 18px",
            whiteSpace: "nowrap",
          }}
        >
          {snapshot.badge}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 18,
          alignItems: "stretch",
        }}
      >
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
              border:
                activeStageIndex === 0
                  ? `2px solid ${snapshot.accent}55`
                  : "2px solid rgba(255,255,255,0.08)",
              opacity: callOpacity,
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 20,
                fontWeight: 800,
                color: snapshot.accent,
                marginBottom: 8,
              }}
            >
              호출
            </div>
            <div
              style={{
                ...monoStyle,
                fontSize: 24,
                color: TEXT,
                lineHeight: 1.6,
              }}
            >
              <ColorizedCode text={snapshot.callLine} theme={CODE_THEME} />
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 18,
              padding: "16px 18px",
              border:
                activeStageIndex >= 3
                  ? `2px solid ${snapshot.accent}55`
                  : "2px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 20,
                fontWeight: 800,
                color: snapshot.accent,
                marginBottom: 10,
              }}
            >
              출력
            </div>
            <div
              style={{
                ...monoStyle,
                fontSize: 26,
                color: "#ffffff",
                background: "#1a1a1a",
                borderRadius: 14,
                minHeight: 64,
                padding: "16px 18px",
                opacity: outputOpacity,
                boxShadow:
                  outputOpacity > 0.2
                    ? `0 0 24px ${snapshot.accent}22`
                    : "none",
              }}
            >
              {snapshot.outputLine}
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
              color: snapshot.accent,
              marginBottom: 12,
            }}
          >
            실행 코드
          </div>
          <div
            style={{
              ...monoStyle,
              fontSize: 25,
              lineHeight: 1.82,
              color: TEXT,
            }}
          >
            {snapshot.code.map((line, index) => {
              const highlighted = getLineHighlight(
                frame,
                trace,
                snapshot,
                index,
              );
              return (
                <div
                  key={`${snapshot.badge}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px 1fr",
                    gap: 12,
                    alignItems: "center",
                    background: highlighted
                      ? `${snapshot.accent}1f`
                      : "transparent",
                    border: highlighted
                      ? `1px solid ${snapshot.accent}38`
                      : "1px solid transparent",
                    borderRadius: 12,
                    padding: "2px 8px",
                  }}
                >
                  <span style={{ color: C_DIM }}>{index + 1}</span>
                  <span>
                    <ColorizedCode text={line} theme={CODE_THEME} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
          marginTop: 18,
        }}
      >
        {stageLabels.map((label, index) => (
          <div
            key={label}
            style={{
              borderRadius: 999,
              padding: "10px 0",
              textAlign: "center",
              fontFamily: uiFont,
              fontSize: 18,
              fontWeight: 800,
              color: index <= activeStageIndex ? "#ffffff" : C_DIM,
              background:
                index === activeStageIndex
                  ? `${snapshot.accent}26`
                  : "rgba(255,255,255,0.04)",
              border:
                index === activeStageIndex
                  ? `1px solid ${snapshot.accent}50`
                  : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      {snapshot.footer ? (
        <div
          style={{
            marginTop: 16,
            fontFamily: uiFont,
            fontSize: 22,
            fontWeight: 800,
            color: snapshot.accent,
            background: `${snapshot.accent}14`,
            borderRadius: 16,
            padding: "14px 18px",
            border: `1px solid ${snapshot.accent}32`,
          }}
        >
          {snapshot.footer}
        </div>
      ) : null}

      {bottomContent ? (
        <div style={{ marginTop: 16 }}>{bottomContent}</div>
      ) : null}
    </div>
  );
};

const ConceptScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.conceptScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const cardAppear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const snapshots: Snapshot[] = [
    {
      badge: "시작 코드",
      title: "안쪽 지역변수만 사용",
      note: "호출이 들어오면 함수 안에서 숫자를 준비하고 그대로 출력합니다.",
      callLine: "introduce();",
      code: CODE_STEPS.localAge,
      outputLine: "나이 : 11",
      accent: C_TEAL,
      prepLineIndex: 1,
      printLineIndex: 2,
      footer: "아직은 함수 밖에서 바꾸는 입력 자리가 없습니다.",
    },
    {
      badge: "실행 확인",
      title: "바깥값 없이 같은 결과",
      note: "어떤 호출이 와도 함수 안에서 정한 값만 사용하므로 결과가 고정됩니다.",
      callLine: "introduce();",
      code: CODE_STEPS.localAge,
      outputLine: "나이 : 11",
      accent: C_TEAL,
      prepLineIndex: 1,
      printLineIndex: 2,
      footer: "입력 자리가 없으니 출력은 늘 같은 모습입니다.",
    },
    {
      badge: "다음 준비",
      title: "받을 자리를 만들 준비",
      note: "다음 단계에서는 괄호 안에 바깥값을 받을 자리를 추가하게 됩니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.twoUnused,
      outputLine: "나이 : 11",
      accent: C_VAR,
      prepLineIndex: 1,
      printLineIndex: 2,
      footer: "자리가 생겨도 아직 쓰지 않으면 출력은 그대로입니다.",
    },
  ];
  const starts = [cfg.speechStartFrame, ...cfg.narrationSplits];
  const snapshotIndex = getActiveIndex(frame, starts);
  const snapshot = snapshots[Math.min(snapshotIndex, snapshots.length - 1)];
  const trace = buildTrace(
    AUDIO_CONFIG.conceptScene.wordStartFrames[snapshotIndex],
    starts[snapshotIndex] ?? cfg.speechStartFrame,
    snapshot.prepLineIndex !== undefined,
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="1. 시작 코드를 실행해 보기" />
          <ExecutionCard
            sceneTitle="지역변수만 사용하는 함수"
            snapshot={snapshot}
            trace={trace}
            appear={cardAppear}
          />
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
  const cfg = VIDEO_CONFIG.declarationScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const cardAppear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const snapshots: Snapshot[] = [
    {
      badge: "자리 추가",
      title: "두 값을 받을 자리를 만든다",
      note: "괄호 안에 바깥값 두 개를 받을 자리가 생겼습니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.twoUnused,
      outputLine: "나이 : 11",
      accent: C_VAR,
      prepLineIndex: 1,
      printLineIndex: 2,
    },
    {
      badge: "아직 미사용",
      title: "받기만 하고 아직 쓰지 않는다",
      note: "받은 자리가 있어도 출력 줄에서 쓰지 않으면 결과는 그대로입니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.twoUnused,
      outputLine: "나이 : 11",
      accent: C_COMMENT,
      prepLineIndex: 1,
      printLineIndex: 2,
    },
    {
      badge: "계산 시작",
      title: "첫 번째 값부터 더한다",
      note: "이제 바깥에서 받은 첫 번째 값을 계산에 넣기 시작합니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.useFirst,
      outputLine: "나이 : 14",
      accent: C_TEAL,
      prepLineIndex: 1,
      printLineIndex: 2,
    },
    {
      badge: "두 값 사용",
      title: "두 번째 값까지 더한다",
      note: "두 자리를 만들었다면 호출할 때도 값 두 개를 맞춰 넣어야 합니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.useTwo,
      outputLine: "나이 : 16",
      accent: C_TEAL,
      prepLineIndex: 1,
      printLineIndex: 2,
      footer: "자리 2개를 선언했으면 호출도 값 2개가 필요합니다.",
    },
  ];
  const starts = [cfg.speechStartFrame, ...cfg.narrationSplits];
  const snapshotIndex = getActiveIndex(frame, starts);
  const snapshot = snapshots[Math.min(snapshotIndex, snapshots.length - 1)];
  const trace = buildTrace(
    AUDIO_CONFIG.declarationScene.wordStartFrames[snapshotIndex],
    starts[snapshotIndex] ?? cfg.speechStartFrame,
    snapshot.prepLineIndex !== undefined,
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="2. 받을 자리와 계산 연결" />
          <ExecutionCard
            sceneTitle="한 장의 카드로 단계 추적"
            snapshot={snapshot}
            trace={trace}
            appear={cardAppear}
          />
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
  const cfg = VIDEO_CONFIG.callScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const cardAppear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const snapshots: Snapshot[] = [
    {
      badge: "임시 이름",
      title: "기계적인 이름으로도 동작한다",
      note: "처음 붙인 이름이 다소 어색해도 받은 값은 정상적으로 실행됩니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.useTwo,
      outputLine: "나이 : 16",
      accent: C_COMMENT,
      prepLineIndex: 1,
      printLineIndex: 2,
    },
    {
      badge: "이름 개선",
      title: "읽기 쉬운 이름으로 바꾼다",
      note: "이름은 사람이 이해하기 좋게 바꿔도 기능 자체는 그대로입니다.",
      callLine: "introduce(3, 2);",
      code: CODE_STEPS.renameReadable,
      outputLine: "나이 : 16",
      accent: C_TEAL,
      prepLineIndex: 1,
      printLineIndex: 2,
    },
    {
      badge: "자리 정리",
      title: "하나만 필요하면 하나만 남긴다",
      note: "정말 필요한 값이 하나라면 매개변수 자리도 하나만 두면 됩니다.",
      callLine: "introduce(5);",
      code: CODE_STEPS.singleArg,
      outputLine: "나이 : 16",
      accent: C_VAR,
      prepLineIndex: 1,
      printLineIndex: 2,
      footer: "이름보다 중요한 것은 어떤 값을 받아서 실제 계산에 쓰는가입니다.",
    },
  ];
  const starts = [cfg.speechStartFrame, ...cfg.narrationSplits];
  const snapshotIndex = getActiveIndex(frame, starts);
  const snapshot = snapshots[Math.min(snapshotIndex, snapshots.length - 1)];
  const trace = buildTrace(
    AUDIO_CONFIG.callScene.wordStartFrames[snapshotIndex],
    starts[snapshotIndex] ?? cfg.speechStartFrame,
    snapshot.prepLineIndex !== undefined,
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="3. 이름과 자리 수 정리" />
          <ExecutionCard
            sceneTitle="같은 흐름, 더 읽기 쉬운 코드"
            snapshot={snapshot}
            trace={trace}
            appear={cardAppear}
          />
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
  const cfg = VIDEO_CONFIG.resultScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);
  const cardAppear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const snapshots: Snapshot[] = [
    {
      badge: "이름 충돌",
      title: "같은 이름은 헷갈린다",
      note: "받은 값 이름과 안쪽 지역변수 이름이 같으면 읽는 사람도 헷갈립니다.",
      callLine: "introduce(20);",
      code: CODE_STEPS.conflict,
      outputLine: "나이 : 31",
      accent: C_PAIN,
      prepLineIndex: 1,
      printLineIndex: 2,
      footer: "겹치는 이름은 피하는 편이 훨씬 읽기 쉽습니다.",
    },
    {
      badge: "임시 정리",
      title: "안쪽 이름을 잠깐 바꾼다",
      note: "안쪽 이름을 바꾸면 충돌은 사라지지만 구조는 아직 완전히 단순하지 않습니다.",
      callLine: "introduce(20);",
      code: CODE_STEPS.tempFix,
      outputLine: "나이 : 20",
      accent: C_COMMENT,
      prepLineIndex: 1,
      printLineIndex: 2,
    },
    {
      badge: "최종 형태",
      title: "받은 값을 바로 출력한다",
      note: "마지막에는 바깥에서 들어온 값이 그대로 출력까지 이어집니다.",
      callLine: "introduce(20);",
      code: CODE_STEPS.final,
      outputLine: "나이 : 20",
      accent: C_TEAL,
      printLineIndex: 1,
      footer: "이제 이 함수는 매개변수를 사용하는 가장 단순한 형태입니다.",
    },
  ];
  const starts = [cfg.speechStartFrame, ...cfg.narrationSplits];
  const snapshotIndex = getActiveIndex(frame, starts);
  const snapshot = snapshots[Math.min(snapshotIndex, snapshots.length - 1)];
  const trace = buildTrace(
    AUDIO_CONFIG.resultScene.wordStartFrames[snapshotIndex],
    starts[snapshotIndex] ?? cfg.speechStartFrame,
    snapshot.prepLineIndex !== undefined,
  );

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="4. 이름 충돌 없이 정리" />
          <ExecutionCard
            sceneTitle="마지막 다듬기"
            snapshot={snapshot}
            trace={trace}
            appear={cardAppear}
          />
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
  const cfg = VIDEO_CONFIG.summaryScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames, { out: false });
  const cardAppear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });
  const snapshot: Snapshot = {
    badge: "최종 정리",
    title: "매개변수 함수의 핵심",
    note: "호출에서 들어온 값이 함수 안으로 전달되고, 그 값이 그대로 출력에 사용됩니다.",
    callLine: "introduce(20);",
    code: CODE_STEPS.final,
    outputLine: "나이 : 20",
    accent: C_TEAL,
    printLineIndex: 1,
  };
  const trace = buildTrace(
    AUDIO_CONFIG.summaryScene.wordStartFrames[0],
    cfg.speechStartFrame,
    false,
  );
  const chipFrames = [
    cfg.speechStartFrame,
    AUDIO_CONFIG.summaryScene.narrationSplits[0] ?? cfg.speechStartFrame,
    AUDIO_CONFIG.summaryScene.narrationSplits[1] ??
      AUDIO_CONFIG.summaryScene.narrationSplits[0] ??
      cfg.speechStartFrame,
    (AUDIO_CONFIG.summaryScene.narrationSplits[1] ??
      AUDIO_CONFIG.summaryScene.narrationSplits[0] ??
      cfg.speechStartFrame) + 20,
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="5. 매개변수 한 번에 정리" />
          <ExecutionCard
            sceneTitle="디버깅 흐름으로 보는 정리"
            snapshot={snapshot}
            trace={trace}
            appear={cardAppear}
            bottomContent={
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {SUMMARY_CARDS.map((card, index) => {
                  const appear = spring({
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
                        opacity: appear,
                        transform: `scale(${interpolate(
                          appear,
                          [0, 1],
                          [0.94, 1],
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
            }
          />
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
