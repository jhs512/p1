// src/compositions/001-Java-Basic/KOR/011-1-JavaParameters.tsx
import {
  AbsoluteFill,
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
  monoStyle,
  uiFont,
  useFade,
} from "../../../utils/scene";
import { CONTENT } from "./011-2-content";
import { AUDIO_CONFIG } from "./011-3-audio.gen";
import {
  BG,
  BG_CODE,
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

const MAIN_AUDIO = AUDIO_CONFIG.mainScene ?? {
  durationInFrames: 30,
  narrationSplits: [] as number[],
  speechStartFrame: 0,
  wordStartFrames: [] as number[][],
};

export const VIDEO_CONFIG = {
  mainScene: {
    audio: "prm-main.mp3",
    durationInFrames: MAIN_AUDIO.durationInFrames,
    speechStartFrame: MAIN_AUDIO.speechStartFrame,
    narration: CONTENT.mainScene.narration as string[],
    narrationSplits: MAIN_AUDIO.narrationSplits,
  },
} as const;

type Snapshot = {
  title: string;
  note: string;
  callLine: string;
  code: readonly string[];
  outputLine: string;
  accent: string;
  prepLineIndex?: number;
  printLineIndex: number;
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

const SNAPSHOTS: Snapshot[] = [
  {
    title: "지역변수만 사용하는 시작 코드",
    note: "아직은 함수 안에서 만든 값만 사용합니다.",
    callLine: "introduce();",
    code: CODE_STEPS.localAge,
    outputLine: "나이 : 11",
    accent: C_TEAL,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "값을 받을 자리 두 개 만들기",
    note: "괄호 안에 받는 자리를 만들었지만 아직 출력에는 쓰지 않습니다.",
    callLine: "introduce(3, 2);",
    code: CODE_STEPS.twoUnused,
    outputLine: "나이 : 11",
    accent: C_VAR,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "첫 번째 받은 값 사용",
    note: "첫 번째 값이 계산에 들어가면서 결과가 달라집니다.",
    callLine: "introduce(3, 2);",
    code: CODE_STEPS.useFirst,
    outputLine: "나이 : 14",
    accent: C_TEAL,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "두 번째 받은 값까지 사용",
    note: "두 값을 모두 더하면 호출에서 보낸 두 입력이 반영됩니다.",
    callLine: "introduce(3, 2);",
    code: CODE_STEPS.useTwo,
    outputLine: "나이 : 16",
    accent: C_TEAL,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "읽기 쉬운 이름으로 바꾸기",
    note: "이름은 사람이 읽기 좋게 바꿔도 동작은 같습니다.",
    callLine: "introduce(3, 2);",
    code: CODE_STEPS.renameReadable,
    outputLine: "나이 : 16",
    accent: C_COMMENT,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "필요한 자리만 남기기",
    note: "정말 필요한 값이 하나라면 매개변수도 하나면 충분합니다.",
    callLine: "introduce(5);",
    code: CODE_STEPS.singleArg,
    outputLine: "나이 : 16",
    accent: C_VAR,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "같은 이름 충돌 살펴보기",
    note: "받은 값 이름과 안쪽 이름이 겹치면 읽는 흐름이 어색해집니다.",
    callLine: "introduce(20);",
    code: CODE_STEPS.conflict,
    outputLine: "나이 : 31",
    accent: C_PAIN,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "안쪽 이름을 잠깐 바꾸기",
    note: "충돌은 피했지만 아직은 조금 복잡한 상태입니다.",
    callLine: "introduce(20);",
    code: CODE_STEPS.tempFix,
    outputLine: "나이 : 20",
    accent: C_COMMENT,
    prepLineIndex: 1,
    printLineIndex: 2,
  },
  {
    title: "받은 값을 바로 쓰는 최종 코드",
    note: "가장 단순한 형태는 받은 값을 바로 출력에 쓰는 것입니다.",
    callLine: "introduce(20);",
    code: CODE_STEPS.final,
    outputLine: "나이 : 20",
    accent: C_TEAL,
    printLineIndex: 1,
  },
];

const SNAPSHOT_MAP = [
  0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8, 8,
  8, 8, 8,
] as const;

const getActiveIndex = (frame: number, starts: readonly number[]) => {
  let active = 0;
  starts.forEach((start, index) => {
    if (frame >= start) active = index;
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

  return {
    call: pick(0),
    enter: pick(Math.min(1, lastIndex)),
    prep: needsPrep ? pick(Math.min(3, lastIndex)) : undefined,
    print: pick(Math.min(needsPrep ? 5 : 3, lastIndex)),
    output: pick(lastIndex),
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
  ) {
    return true;
  }
  return false;
};

const MainScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.mainScene;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames, { out: false });
  const starts = [cfg.speechStartFrame, ...cfg.narrationSplits];
  const narrationIndex = getActiveIndex(frame, starts);
  const snapshotIndex =
    SNAPSHOT_MAP[Math.min(narrationIndex, SNAPSHOT_MAP.length - 1)] ?? 0;
  const snapshot = SNAPSHOTS[snapshotIndex];
  const trace = buildTrace(
    AUDIO_CONFIG.mainScene.wordStartFrames[narrationIndex],
    starts[narrationIndex] ?? cfg.speechStartFrame,
    snapshot.prepLineIndex !== undefined,
  );
  const activeStage =
    frame >= trace.output
      ? 4
      : frame >= trace.print
        ? 3
        : trace.prep !== undefined && frame >= trace.prep
          ? 2
          : frame >= trace.enter
            ? 1
            : 0;
  const appear = spring({
    frame: frame - cfg.speechStartFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 34,
  });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <SceneTitle title="11. 매개변수 한 장면 디버깅" />
          <div
            style={{
              position: "absolute",
              top: "47%",
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${interpolate(
                appear,
                [0, 1],
                [20, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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
                justifyContent: "space-between",
                gap: 20,
                alignItems: "flex-start",
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
                  한 장면에서 문장 순서대로 진행
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
                    maxWidth: 640,
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
                단계 {snapshotIndex + 1}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {["호출", "진입", "값 준비", "출력", "결과"].map(
                (label, index) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 999,
                      padding: "10px 0",
                      textAlign: "center",
                      fontFamily: uiFont,
                      fontSize: 18,
                      fontWeight: 800,
                      color: index <= activeStage ? "#ffffff" : C_DIM,
                      background:
                        index === activeStage
                          ? `${snapshot.accent}26`
                          : "rgba(255,255,255,0.04)",
                      border:
                        index === activeStage
                          ? `1px solid ${snapshot.accent}50`
                          : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {index + 1}. {label}
                  </div>
                ),
              )}
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
                  border:
                    activeStage === 0
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
                    marginBottom: 8,
                  }}
                >
                  호출 카드
                </div>
                <div
                  style={{
                    ...monoStyle,
                    fontSize: 24,
                    color: TEXT,
                    lineHeight: 1.6,
                    whiteSpace: "pre",
                  }}
                >
                  <ColorizedCode text={snapshot.callLine} theme={CODE_THEME} />
                </div>
              </div>

              <div
                style={{
                  background: "#252525",
                  borderRadius: 18,
                  padding: "18px 18px 16px",
                  border:
                    activeStage >= 1
                      ? `2px solid ${snapshot.accent}22`
                      : "2px solid rgba(255,255,255,0.06)",
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
                  {snapshot.code.map((line, index) => {
                    const highlighted = getLineHighlight(
                      frame,
                      trace,
                      snapshot,
                      index,
                    );
                    return (
                      <div
                        key={`${snapshot.title}-${index}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "34px 1fr",
                          gap: 12,
                          alignItems: "start",
                          background: highlighted
                            ? `${snapshot.accent}1f`
                            : "transparent",
                          border: highlighted
                            ? `1px solid ${snapshot.accent}38`
                            : "1px solid transparent",
                          borderRadius: 12,
                          padding: "3px 8px",
                        }}
                      >
                        <span style={{ color: C_DIM, paddingTop: 2 }}>
                          {index + 1}
                        </span>
                        <span style={{ whiteSpace: "pre" }}>
                          <ColorizedCode text={line} theme={CODE_THEME} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 18,
                  padding: "16px 18px",
                  border:
                    activeStage >= 3
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
                  출력 카드
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
                    opacity: interpolate(
                      frame,
                      [trace.print, trace.output],
                      [0, 1],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      },
                    ),
                    boxShadow:
                      frame >= trace.output
                        ? `0 0 24px ${snapshot.accent}22`
                        : "none",
                    whiteSpace: "pre",
                  }}
                >
                  {snapshot.outputLine}
                </div>
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.mainScene.wordStartFrames}
      />
    </>
  );
};

export const compositionMeta = {
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationInFrames: VIDEO_CONFIG.mainScene.durationInFrames,
};

export const Component: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <MainScene />
  </AbsoluteFill>
);
