// ─────────────────────────────────────────────────────────────
// 01-JavaVariables.tsx  —  Java 변수 설명 영상 (쇼츠 1080×1920)
//
// 이 파일 하나에 영상에 필요한 모든 것이 들어 있습니다:
//   씬 데이터(자막·코드), 폰트, 훅, UI 컴포넌트, 씬, 컴포지션
// TTS 설정·PRONUNCIATION 전역값은 global.config.ts 에서 관리합니다.
// ─────────────────────────────────────────────────────────────

import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RATE, SCENE_TAIL_FRAMES, VOICE } from "../../global.config";
import {
  CHARS_PER_SEC,
  CROSS,
  ContentArea,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../utils/scene";
import { AUDIO_CONFIG } from "./001-audio";

export { RATE, VOICE };

// ── 타입 ─────────────────────────────────────────────────────
export interface CodeLine {
  text: string;
  isNew: boolean;
}

/** 음성 길이(초) → 장면 프레임 수 (꼬리 여유 포함). 나중을 위해 유지. */
export const f = (secs: number) => Math.ceil(secs * 30) + SCENE_TAIL_FRAMES;

/** 코드 라인 — 한 곳에서만 정의 */
const ALL_CODE = ["int age;", "age = 25;", "System.out.println(age);"];
/** n줄까지 표시, 마지막 줄만 타이핑 */
const codeUpTo = (n: number): CodeLine[] =>
  ALL_CODE.slice(0, n).map((text, i) => ({ text, isNew: i === n - 1 }));

// ── 씬 데이터 ─────────────────────────────────────────────────
// durationInFrames / narrationSplits 는 AUDIO_CONFIG (0001-audio.ts) 에서 자동 관리됩니다.
export const VIDEO_CONFIG = {
  thumbnail: {
    durationInFrames: 30,
  },

  intro: {
    audio: "scene0.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    narration: [
      "변수는 데이터를 담는 상자입니다.",
      "상자에 이름을 붙이고, 값을 넣고,\n꺼내 쓸 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },

  declaration: {
    audio: "scene1.mp3",
    durationInFrames: AUDIO_CONFIG.declaration.durationInFrames,
    title: "1. 변수 선언 (Declaration)",
    code: codeUpTo(1),
    narration: [
      "변수를 사용하려면 먼저 선언이 필요합니다.",
      "int age 라고 쓰면\n정수형 변수 age가 만들어집니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.declaration.narrationSplits,
  },

  initialization: {
    audio: "scene2.mp3",
    durationInFrames: AUDIO_CONFIG.initialization.durationInFrames,
    title: "2. 변수 초기화 (Initialization)",
    code: codeUpTo(2),
    narration: [
      "선언한 변수에 처음으로 값을 넣는 것을\n초기화라고 합니다.",
      "age 변수에는 25가 저장되었습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.initialization.narrationSplits,
  },

  interpret: {
    audio: "interpret.mp3",
    durationInFrames: AUDIO_CONFIG.interpret.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.interpret.speechStartFrame,
    narration: [
      "변수의 해석은 두 가지로 구분됩니다.",
      "선언하거나 값을 넣을 때만 공간으로 인식되고,\n그 외에는 값으로 인식됩니다.",
      "이 부분의 age는 25로 해석됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.interpret.narrationSplits,
  },

  interpretQuiz: {
    audio: "interpret-quiz.mp3",
    durationInFrames: AUDIO_CONFIG.interpretQuiz.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.interpretQuiz.speechStartFrame,
    narration: ["앞 부분의 age 변수는\n공간으로 해석해야할까요?\n아니면 값으로 해석해야 할까요?"] as string[],
    narrationSplits: AUDIO_CONFIG.interpretQuiz.narrationSplits,
  },

  interpretReveal: {
    audio: "interpret-reveal.mp3",
    durationInFrames: AUDIO_CONFIG.interpretReveal.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.interpretReveal.speechStartFrame,
    narration: [
      "정답은 공간입니다.",
      "값을 대입받는 왼쪽 자리이기 때문이죠.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.interpretReveal.narrationSplits,
  },

  print: {
    audio: "scene3.mp3",
    durationInFrames: AUDIO_CONFIG.print.durationInFrames,
    title: "3. 변수 출력 (Print)",
    code: codeUpTo(3),
    consoleOutput: "> 25",
    narration: [
      "이제 변수의 값을 화면에 출력해보겠습니다.",
      "[System.out.println(발음:print line)] 메서드를 사용하면\n괄호 안에 있는 변수의 값이 콘솔에 출력됩니다.",
      "실행하면 25가 출력되는 것을 확인할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.print.narrationSplits,
  },
};

// ── 훅: 타이핑 이펙트 ─────────────────────────────────────────
function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = 10,
): { visibleText: string; isDone: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsVisible = Math.floor(
    (Math.max(0, frame - startFrame) / fps) * charsPerSecond,
  );
  return {
    visibleText: text.slice(0, charsVisible),
    isDone: charsVisible >= text.length,
  };
}

// ── 컴포넌트: SceneTitle ──────────────────────────────────────
const SceneTitle: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      position: "absolute",
      top: 160,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: uiFont,
      fontSize: 42,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: 1,
    }}
  >
    {title}
  </div>
);

// ── 컴포넌트: CodeBox ─────────────────────────────────────────
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\bint\b|\bString\b|\bboolean\b|\b\d+\b)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^(int|String|boolean)$/.test(part))
          return (
            <span key={i} style={{ color: "#4ec9b0" }}>
              {part}
            </span>
          );
        if (/^\d+$/.test(part))
          return (
            <span key={i} style={{ color: "#b5cea8" }}>
              {part}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const StaticLine: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ opacity: 0.5, color: "#d4d4d4", lineHeight: "1.8" }}>
    {text}
  </div>
);

const TypingLine: React.FC<{
  text: string;
  startFrame: number;
  charsPerSecond: number;
}> = ({ text, startFrame, charsPerSecond }) => {
  const { visibleText } = useTypingEffect(text, startFrame, charsPerSecond);
  return (
    <div style={{ color: "#d4d4d4", lineHeight: "1.8" }}>
      <ColorizedCode text={visibleText} />
    </div>
  );
};

const CodeBox: React.FC<{
  lines: CodeLine[];
  startFrame: number;
  charsPerSecond?: number;
}> = ({ lines, startFrame, charsPerSecond = 10 }) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#2d2d2d",
      borderRadius: 12,
      padding: "48px 64px",
      minWidth: 800,
      fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
      fontSize: 36,
    }}
  >
    {lines.map((line, i) =>
      line.isNew ? (
        <TypingLine
          key={`new-${i}-${line.text}`}
          text={line.text}
          startFrame={startFrame}
          charsPerSecond={charsPerSecond}
        />
      ) : (
        <StaticLine key={`static-${i}-${line.text}`} text={line.text} />
      ),
    )}
  </div>
);

// ── 컴포넌트: ConsoleOutput ───────────────────────────────────
const ConsoleOutput: React.FC<{ text: string; startFrame: number }> = ({
  text,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(50% + 180px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0a0a0a",
        borderRadius: 8,
        padding: "12px 32px",
        fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
        fontSize: 32,
        color: "#89d185",
        opacity,
        minWidth: 300,
        textAlign: "left",
      }}
    >
      {text}
    </div>
  );
};

// ── 컴포넌트: BoxMetaphorAnim ─────────────────────────────────
// 인트로 씬용: 상자 등장 → 이름 태그 → 값 투입 → 값 꺼내기
const BoxMetaphorAnim: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 발화 프레임 직접 참조 (CLAUDE.md 6번 원칙: 애니메이션은 발화 시작에 맞춘다)
  const NAME_TAG_START  = AUDIO_CONFIG.intro.wordStartFrames[1][1]; // "이름을"
  const DROP_START      = AUDIO_CONFIG.intro.wordStartFrames[1][3]; // "값을"
  const EXTRACT_START   = AUDIO_CONFIG.intro.wordStartFrames[1][5]; // "꺼내"

  // 1) 상자 + 라벨 동시 등장
  const boxAppear = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, stiffness: 90 },
    durationInFrames: 45,
  });
  const boxScale = interpolate(boxAppear, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelAppear = boxAppear; // 상자와 같은 타이밍

  // 3) "변수 : age" 이름 태그 — "이름을" 발화 시점에 등장
  const nameTag = spring({
    frame: frame - NAME_TAG_START,
    fps,
    config: { damping: 12, stiffness: 180 },
    durationInFrames: 25,
  });
  const nameTagScale = interpolate(nameTag, [0, 1], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4) 값(25) 낙하 — 단일 엘리먼트, Y만 이동하고 opacity 유지 (두 애니메이션 분리 → 깜빡임 제거)
  const dropE = frame - DROP_START;
  const DROP_FRAMES = 30;
  // Y: -160(박스 위) → 0(중앙) easeOut
  const dropY = interpolate(dropE, [0, DROP_FRAMES], [-160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // opacity: 처음 4프레임에만 0→1, 이후 계속 1 (절대 0으로 돌아가지 않음)
  const dropO = interpolate(dropE, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 착지 글로우
  const dropGlow = interpolate(
    dropE,
    [DROP_FRAMES - 2, DROP_FRAMES + 2, DROP_FRAMES + 14],
    [0, 1, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 5) 값(25) 꺼내기
  const extE = frame - EXTRACT_START;
  const ext = spring({
    frame: extE,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  // 꺼내진 값 + 화살표: 박스 오른쪽에서 fade-in
  const extractO = interpolate(extE, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowO = extractO;
  // 꺼낼 때 박스 테두리 강조
  const extGlow = interpolate(ext, [0, 0.3, 1], [0, 0.8, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const totalGlow = Math.max(dropGlow, extGlow);

  return (
    <div
      style={{
        position: "absolute",
        top: "28%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* "변수" 라벨 */}
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 42,
          fontWeight: 700,
          color: "#4ec9b0",
          letterSpacing: 6,
          opacity: labelAppear,
        }}
      >
        변수
      </div>

      {/* 상자 + 꺼내기 레이어 */}
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {/* 상자 */}
        <div
          style={{
            transform: `scale(${boxScale})`,
            position: "relative",
            border: `4px solid rgba(78,201,176,${0.45 + totalGlow * 0.55})`,
            borderRadius: 24,
            width: 300,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(78,201,176,0.05)",
            boxShadow: `0 0 ${totalGlow * 50}px rgba(78,201,176,${totalGlow * 0.55})`,
          }}
        >
          {/* 25 단일 엘리먼트: 위에서 Y 이동 후 중앙 고정 (깜빡임 없음) */}
          {dropE >= 0 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translateX(-50%) translateY(calc(-50% + ${dropY}px))`,
                fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
                fontSize: 90,
                color: "#b5cea8",
                fontWeight: 700,
                opacity: dropO,
                pointerEvents: "none",
              }}
            >
              25
            </div>
          )}
        </div>

        {/* 화살표 + 꺼낸 값 — 박스 오른쪽에 절대 위치 */}
        {extE >= 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: 300,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: arrowO,
                pointerEvents: "none",
              }}
            >
              {/* 화살표 */}
              <span
                style={{
                  fontFamily: uiFont,
                  fontSize: 52,
                  color: "#4ec9b0",
                  lineHeight: 1,
                }}
              >
                →
              </span>
              {/* 꺼낸 값 */}
              <span
                style={{
                  fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
                  fontSize: 80,
                  color: "#b5cea8",
                  fontWeight: 700,
                  opacity: extractO,
                  display: "inline-block",
                }}
              >
                25
              </span>
            </div>
          </>
        )}
      </div>

      {/* "변수 : age" 이름 태그 */}
      <div
        style={{
          transform: `scale(${nameTagScale})`,
          opacity: nameTag,
          fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
          fontSize: 38,
        }}
      >
        <span style={{ color: "#4ec9b0" }}>변수</span>
        <span style={{ color: "#808080", margin: "0 10px" }}>:</span>
        <span style={{ color: "#9cdcfe" }}>age</span>
      </div>
    </div>
  );
};

// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);
  return (
    <>
      <AbsoluteFill
        style={{ background: "#1e1e1e", opacity }}
      >
        <ContentArea>
          <Audio src={staticFile(intro.audio)} />
          <BoxMetaphorAnim />
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={intro.narration}
        splits={intro.narrationSplits}
        speechStart={AUDIO_CONFIG.intro.speechStartFrame}
      />
    </>
  );
};

// ── 씬 컴포넌트 ───────────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#050510",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 24,
    }}
  >
    {/* 글로우 원형 배경 */}
    <div
      style={{
        position: "absolute",
        width: 900,
        height: 900,
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
        fontSize: 28,
        fontWeight: 700,
        color: "#4ec9b0",
        letterSpacing: 10,
        opacity: 0.8,
      }}
    >
      JAVA
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 160,
        fontWeight: 900,
        lineHeight: 1,
        textAlign: "center",
        color: "#ffffff",
        textShadow:
          "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
      }}
    >
      Java
      <br />
      <span style={{ color: "#4ec9b0" }}>변수</span>
    </div>
    <div
      style={{
        fontFamily: uiFont,
        fontSize: 32,
        color: "#4ec9b0",
        letterSpacing: 4,
        opacity: 0.7,
      }}
    >
      선언 · 초기화 · 출력
    </div>
  </AbsoluteFill>
);

const QUIZ_THINKING_FRAMES = 150; // 퀴즈 대기 시간 (5초)
const typingDone = (chars: number, speechStart: number) =>
  speechStart + Math.ceil((chars / CHARS_PER_SEC) * 30);

const { thumbnail, intro, declaration, initialization, interpret, interpretQuiz, interpretReveal, print } = VIDEO_CONFIG;
const QUIZ_TOTAL_DURATION = interpretQuiz.durationInFrames + QUIZ_THINKING_FRAMES + interpretReveal.durationInFrames;

// ── 컴포넌트: CombinedVariableBox ────────────────────────────
// 선언(빈 박스) → 초기화(값 낙하) 전 구간을 하나의 박스로 이어서 표현
const CombinedVariableBox: React.FC<{
  emptyStart: number;
  fillStart: number;
}> = ({ emptyStart, fillStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = frame - emptyStart;
  const fillElapsed = frame - fillStart;

  // 박스 등장 (아래서 올라옴)
  const appear = spring({
    frame: elapsed,
    fps,
    config: { damping: 14, stiffness: 140 },
    durationInFrames: 35,
  });
  const translateY = interpolate(appear, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 값 낙하 스프링
  const dropProgress = spring({
    frame: fillElapsed,
    fps,
    config: { damping: 10, stiffness: 120 },
    durationInFrames: 40,
  });
  const valueY = interpolate(dropProgress, [0, 1], [-110, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fallingOpacity = interpolate(
    dropProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const insideOpacity = interpolate(dropProgress, [0.85, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const borderGlow = interpolate(dropProgress, [0.8, 0.9, 1], [0, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (elapsed < 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "64%",
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity: appear,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 26,
          color: "#4ec9b0",
          opacity: 0.85,
          letterSpacing: 2,
        }}
      >
        age
      </div>
      <div
        style={{
          position: "relative",
          border: `3px solid rgba(78,201,176,${0.45 + borderGlow * 0.55})`,
          borderRadius: 10,
          width: 160,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(78,201,176,0.04)",
          boxShadow: `0 0 ${borderGlow * 24}px rgba(78,201,176,${borderGlow * 0.6})`,
        }}
      >
        {/* 착지 후 숫자 */}
        <span
          style={{
            position: "absolute",
            fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
            fontSize: 44,
            color: "#b5cea8",
            opacity: insideOpacity,
          }}
        >
          25
        </span>
        {/* 낙하 중인 숫자 */}
        <div
          style={{
            position: "absolute",
            top: valueY,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: monoFont, fontFeatureSettings: '"calt" 0, "liga" 0',
            fontSize: 44,
            color: "#b5cea8",
            opacity: fallingOpacity,
            pointerEvents: "none",
          }}
        >
          25
        </div>
      </div>
    </div>
  );
};

// ── 씬: CombinedDeclarationInitScene ─────────────────────────
// 선언 + 초기화를 하나의 연속 씬으로 처리 (박스 애니메이션이 끊기지 않음)
const SPLIT = declaration.durationInFrames; // 선언 끝 = 초기화 시작 지점
const COMBINED_DURATION =
  declaration.durationInFrames + initialization.durationInFrames;

const CombinedDeclarationInitScene: React.FC = () => {
  const opacity = useFade(COMBINED_DURATION);

  const emptyBoxStart = typingDone(
    "int age;".length,
    AUDIO_CONFIG.declaration.speechStartFrame,
  );
  const fillBoxStart =
    SPLIT +
    typingDone(
      "age = 25;".length,
      AUDIO_CONFIG.initialization.speechStartFrame,
    );

  return (
    <>
      <AbsoluteFill
        style={{ background: "#1e1e1e", opacity }}
      >
        <ContentArea>
          {/* 오디오: 선언 오디오 끝나는 즉시 초기화 오디오 시작 (SCENE_TAIL_FRAMES 공백 제거) */}
          <Sequence durationInFrames={SPLIT}>
            <Audio src={staticFile(declaration.audio)} />
          </Sequence>
          <Sequence from={SPLIT - SCENE_TAIL_FRAMES}>
            <Audio src={staticFile(initialization.audio)} />
          </Sequence>

          {/* 제목: 씬 전환 시 교체 */}
          <Sequence durationInFrames={SPLIT}>
            <SceneTitle title={declaration.title} />
          </Sequence>
          <Sequence from={SPLIT}>
            <SceneTitle title={initialization.title} />
          </Sequence>

          {/* 코드: 선언 코드 → 초기화 코드 (int age;는 isNew:false로 이미 표시됨) */}
          <Sequence durationInFrames={SPLIT}>
            <CodeBox
              lines={declaration.code}
              startFrame={AUDIO_CONFIG.declaration.speechStartFrame}
            />
          </Sequence>
          <Sequence from={SPLIT}>
            <CodeBox
              lines={initialization.code}
              startFrame={AUDIO_CONFIG.initialization.speechStartFrame}
            />
          </Sequence>

          {/* 박스: 전 구간에 걸쳐 살아있는 단일 박스 */}
          <CombinedVariableBox
            emptyStart={emptyBoxStart}
            fillStart={fillBoxStart}
          />
        </ContentArea>
      </AbsoluteFill>

      {/* 자막: opacity 영향 없이 항상 선명하게
          initialization 오디오가 SPLIT-SCENE_TAIL_FRAMES 부터 시작하므로
          자막 Sequence도 같은 시점에서 시작해야 speechStartFrame 기준이 맞음 */}
      <Sequence durationInFrames={SPLIT - SCENE_TAIL_FRAMES}>
        <Subtitle
          sentences={declaration.narration}
          splits={declaration.narrationSplits}
          speechStart={AUDIO_CONFIG.declaration.speechStartFrame}
        />
      </Sequence>
      <Sequence from={SPLIT - SCENE_TAIL_FRAMES}>
        <Subtitle
          sentences={initialization.narration}
          splits={initialization.narrationSplits}
          speechStart={AUDIO_CONFIG.initialization.speechStartFrame}
        />
      </Sequence>
    </>
  );
};

// ── 씬: InterpretScene — 변수 해석 (공간 vs 값) ──────────────
//   Phase 0: 3줄 코드 모두 표시
//   Phase 1 (split0~): int age; / age = 25; 의 age → "공간" 배지
//   Phase 2 (split1~): println(age) 의 age → "값 (= 25)" 배지
const InterpretScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { interpret: cfg } = VIDEO_CONFIG;
  const s   = cfg.speechStartFrame;
  const [split0 = Infinity, split1 = Infinity] = cfg.narrationSplits as readonly number[];
  const { fps } = useVideoConfig();
  const opacity = useFade(cfg.durationInFrames);

  const phase = frame >= split1 ? 2 : frame >= split0 ? 1 : 0;

  const ann1 = spring({ frame: frame - split0, fps, config: { damping: 13, stiffness: 140 }, durationInFrames: 24 });
  const ann2 = spring({ frame: frame - split1, fps, config: { damping: 13, stiffness: 140 }, durationInFrames: 24 });

  const C_SPACE = "#e5c07b"; // 공간: amber
  const C_VAL   = "#4ec9b0"; // 값: teal
  const C_AGE   = "#9cdcfe"; // 변수명: light blue

  const badge = (label: string, color: string, anim: number) => (
    <span style={{
      opacity: anim, color, fontSize: 22, fontFamily: uiFont,
      background: `${color}1a`, borderRadius: 6, padding: "2px 10px",
      border: `1px solid ${color}55`,
    }}>{label}</span>
  );

  const ageSpan = (active: boolean, color: string) => (
    <span style={{
      color: active ? color : C_AGE,
      fontWeight: active ? 700 : 400,
      background: active ? `${color}28` : "transparent",
      borderRadius: 4, padding: "1px 5px",
      outline: active ? `1.5px solid ${color}66` : "none",
    }}>age</span>
  );

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          {frame >= s && (
            <div style={{
              position: "absolute", top: "46%", left: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 34, lineHeight: 2.1,
              background: "#252525", borderRadius: 20,
              padding: "36px 48px",
              width: 900, boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
            }}>

              {/* Line 1: int age; */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: phase === 2 ? 0.2 : 1 }}>
                <div>
                  <span style={{ color: "#4ec9b0" }}>int</span>
                  {" "}{ageSpan(phase === 1, C_SPACE)}
                  <span style={{ color: "#d4d4d4" }}>;</span>
                </div>
                {phase >= 1 && badge("← 공간", C_SPACE, ann1)}
              </div>

              {/* Line 2: age = 25; */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: phase === 2 ? 0.2 : 1 }}>
                <div>
                  {ageSpan(phase === 1, C_SPACE)}
                  <span style={{ color: "#d4d4d4" }}> = </span>
                  <span style={{ color: "#b5cea8" }}>25</span>
                  <span style={{ color: "#d4d4d4" }}>;</span>
                </div>
                {phase >= 1 && badge("← 공간", C_SPACE, ann1)}
              </div>

              {/* Line 3: System.out.println(age); */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: phase < 2 ? 0.28 : 1 }}>
                <div>
                  <span style={{ color: "#569cd6" }}>System</span>
                  <span style={{ color: "#d4d4d4" }}>.out.</span>
                  <span style={{ color: "#dcdcaa" }}>println</span>
                  <span style={{ color: "#d4d4d4" }}>(</span>
                  {ageSpan(phase === 2, C_VAL)}
                  <span style={{ color: "#d4d4d4" }}>);</span>
                </div>
                {phase >= 2 && (
                  <div style={{ opacity: ann2, display: "flex", alignItems: "center", gap: 8 }}>
                    {badge("← 값", C_VAL, ann2)}
                    <span style={{
                      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 26, color: "#b5cea8",
                      background: "#2d2d2d", borderRadius: 8,
                      padding: "4px 14px", border: "1px solid #444",
                    }}>= 25</span>
                  </div>
                )}
              </div>

            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── 씬: QuizScene — 변수 해석 퀴즈 (age = age + 2;) ──────────
//   Phase A (0..qDur): 문제 제시 + 오디오
//   Phase B (qDur..qDur+150): 카운트다운 대기 (5초)
//   Phase C (qDur+150..): 정답 공개 + 오디오
const QuizScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qCfg = interpretQuiz;
  const rCfg = interpretReveal;

  const qDur = qCfg.durationInFrames;
  const REVEAL_START = qDur + QUIZ_THINKING_FRAMES;
  const totalDur = QUIZ_TOTAL_DURATION;

  const opacity = useFade(totalDur);

  const isCountdown = frame >= qDur && frame < REVEAL_START;
  const isReveal    = frame >= REVEAL_START;

  // 카운트다운
  const cdFrame    = frame - qDur;
  const cdProgress = isCountdown
    ? interpolate(cdFrame, [0, QUIZ_THINKING_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const secondsLeft = isCountdown ? Math.ceil((QUIZ_THINKING_FRAMES - cdFrame) / 30) : 0;

  // 정답 공개 애니메이션
  const revealAnim = spring({ frame: frame - REVEAL_START, fps, config: { damping: 13, stiffness: 140 }, durationInFrames: 24 });

  const C_SPACE = "#e5c07b"; // 공간: amber
  const C_VAL   = "#4ec9b0"; // 값: teal
  const C_AGE   = "#9cdcfe"; // 변수명: light blue

  // 질문 단계에서 왼쪽 age 펄싱 (발화 시작 후)
  const pulseAlpha = 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.13));
  const showPulse  = !isReveal && frame >= qCfg.speechStartFrame;

  // age 스팬: 질문=왼쪽 펄싱, 공개 후=역할별 색
  const ageSpan = (role: "space" | "value") => {
    const color = role === "space" ? C_SPACE : C_VAL;

    if (isReveal) {
      // 정답 공개: 역할별 색 + 하이라이트
      return (
        <span style={{
          color, fontWeight: 700,
          background: `${color}28`,
          borderRadius: 4, padding: "1px 5px",
          outline: `1.5px solid ${color}66`,
        }}>age</span>
      );
    }

    if (role === "space" && showPulse) {
      // 질문 단계: 왼쪽 age 펄싱 흰색 하이라이트 (정답 색 노출 없이)
      return (
        <span style={{
          color: "#ffffff", fontWeight: 700,
          background: `rgba(255,255,255,0.10)`,
          borderRadius: 4, padding: "1px 5px",
          outline: `2px solid rgba(255,255,255,${pulseAlpha.toFixed(2)})`,
        }}>age</span>
      );
    }

    // 중립 (오른쪽 age, 발화 전)
    return (
      <span style={{ color: C_AGE, borderRadius: 4, padding: "1px 5px" }}>age</span>
    );
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>

          {/* 오디오: 문제 */}
          <Sequence durationInFrames={qDur}>
            <Audio src={staticFile(qCfg.audio)} />
          </Sequence>
          {/* 오디오: 정답 */}
          <Sequence from={REVEAL_START}>
            <Audio src={staticFile(rCfg.audio)} />
          </Sequence>

          {/* Quiz 라벨 */}
          {frame >= qCfg.speechStartFrame && !isReveal && (
            <div style={{
              position: "absolute", top: 180, left: 0, right: 0,
              textAlign: "center", fontFamily: uiFont,
              fontSize: 48, fontWeight: 900, color: "#f5c842",
              letterSpacing: 6,
            }}>
              QUIZ
            </div>
          )}

          {/* 정답 라벨 */}
          {isReveal && (
            <div style={{
              position: "absolute", top: 180, left: 0, right: 0,
              textAlign: "center", fontFamily: uiFont,
              fontSize: 48, fontWeight: 900, color: "#4ec9b0",
              letterSpacing: 6, opacity: revealAnim,
            }}>
              정답
            </div>
          )}

          {/* 코드 블록: age = age + 2; */}
          <div style={{
            position: "absolute", top: "42%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#252525", borderRadius: 20,
            padding: "36px 56px",
            boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
          }}>
            {/* 코드 + 어노테이션: 각 age를 column으로 묶어 중심 자동 정렬 */}
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 38, color: "#d4d4d4",
              display: "flex", alignItems: "flex-start",
            }}>
              {/* 왼쪽 age + ↑공간 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {ageSpan("space")}
                <div style={{
                  fontFamily: uiFont, fontSize: 20, color: C_SPACE, lineHeight: 1.3,
                  textAlign: "center", marginTop: 6,
                  opacity: isReveal ? revealAnim : 0,
                }}>↑<br/>공간</div>
              </div>

              {/* = */}
              <span style={{ alignSelf: "flex-start" }}> = </span>

              {/* 오른쪽 age + ↑값 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {ageSpan("value")}
                <div style={{
                  fontFamily: uiFont, fontSize: 20, color: C_VAL, lineHeight: 1.3,
                  textAlign: "center", marginTop: 6,
                  opacity: isReveal ? revealAnim : 0,
                }}>↑<br/>값</div>
              </div>

              {/* + 2; */}
              <span style={{ alignSelf: "flex-start", color: "#d4d4d4" }}> + </span>
              <span style={{ alignSelf: "flex-start", color: "#b5cea8" }}>2</span>
              <span style={{ alignSelf: "flex-start" }}>;</span>
            </div>
          </div>

          {/* 카운트다운 */}
          {isCountdown && (
            <div style={{
              position: "absolute", top: "60%", left: "50%",
              transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
            }}>
              <div style={{
                fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 120, fontWeight: 700, color: "#f5c842", opacity: 0.9,
              }}>
                {secondsLeft}
              </div>
              <div style={{ width: 500, height: 8, background: "#333", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${cdProgress * 100}%`, height: "100%",
                  background: "#f5c842", borderRadius: 4,
                }} />
              </div>
            </div>
          )}

        </ContentArea>
      </AbsoluteFill>

      {/* 자막: 문제 */}
      <Sequence durationInFrames={qDur}>
        <Subtitle
          sentences={qCfg.narration}
          splits={[]}
          speechStart={qCfg.speechStartFrame}
        />
      </Sequence>
      {/* 자막: 정답 */}
      <Sequence from={REVEAL_START}>
        <Subtitle
          sentences={rCfg.narration}
          splits={rCfg.narrationSplits as unknown as number[]}
          speechStart={rCfg.speechStartFrame}
        />
      </Sequence>
    </>
  );
};

const PrintScene: React.FC = () => {
  const opacity = useFade(print.durationInFrames, { out: false });
  const newLine = print.code.find((l) => l.isNew)!;
  const s = AUDIO_CONFIG.print.speechStartFrame;
  const consoleStart = typingDone(newLine.text.length, s);
  return (
    <>
      <AbsoluteFill
        style={{ background: "#1e1e1e", opacity }}
      >
        <ContentArea>
          <Audio src={staticFile(print.audio)} />
          <SceneTitle title={print.title} />
          <CodeBox lines={print.code} startFrame={s} />
          <ConsoleOutput text={print.consoleOutput} startFrame={consoleStart} />
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={print.narration}
        splits={print.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── Composition ───────────────────────────────────────────────
const mergedSceneList = [
  { durationInFrames: thumbnail.durationInFrames },
  { durationInFrames: intro.durationInFrames },
  { durationInFrames: COMBINED_DURATION },
  { durationInFrames: interpret.durationInFrames },
  { durationInFrames: QUIZ_TOTAL_DURATION },
  { durationInFrames: print.durationInFrames },
];
let _from = 0;
const fromValues = mergedSceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < mergedSceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;

// ── 자동 등록용 메타 (Root.tsx 가 이 값을 읽어 Composition 을 생성) ─
export const compositionMeta = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

export const JavaVariables: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={COMBINED_DURATION}>
      <CombinedDeclarationInitScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={interpret.durationInFrames}>
      <InterpretScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={QUIZ_TOTAL_DURATION}>
      <QuizScene />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={print.durationInFrames}>
      <PrintScene />
    </Sequence>
  </AbsoluteFill>
);

// Root.tsx 가 require.context 로 동적 로드할 때 사용하는 표준 export
export { JavaVariables as Component };
