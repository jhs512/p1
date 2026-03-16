// ─────────────────────────────────────────────────────────────
// 01-JavaVariables.tsx  —  Java 변수 설명 영상 (쇼츠 1080×1920)
//
// 이 파일 하나에 영상에 필요한 모든 것이 들어 있습니다:
//   씬 데이터(자막·코드), 폰트, 훅, UI 컴포넌트, 씬, 컴포지션
// TTS 설정·PRONUNCIATION 전역값은 global.config.ts 에서 관리합니다.
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";
import { VOICE, RATE, PRONUNCIATION, SCENE_TAIL_FRAMES } from "../../global.config";
import { AUDIO_CONFIG } from "./001-audio";

// 전역 설정 re-export (sync-audio.ts 가 esbuild 로 이 파일을 로드할 때 사용)
export { VOICE, RATE, PRONUNCIATION };

// ── 타입 ─────────────────────────────────────────────────────
export interface CodeLine {
  text: string;
  isNew: boolean;
}

/** 음성 길이(초) → 장면 프레임 수 (꼬리 여유 포함). 나중을 위해 유지. */
export const f = (secs: number) => Math.ceil(secs * 30) + SCENE_TAIL_FRAMES;

/** 코드 라인 — 한 곳에서만 정의 */
const ALL_CODE = [
  "int age;",
  "age = 25;",
  "System.out.println(age);",
];
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
      "상자에 이름을 붙이고, 값을 넣고, 꺼내 쓸 수 있습니다.",
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
      "int age 라고 쓰면 정수형 변수 age가 만들어집니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.declaration.narrationSplits,
  },

  initialization: {
    audio: "scene2.mp3",
    durationInFrames: AUDIO_CONFIG.initialization.durationInFrames,
    title: "2. 변수 초기화 (Initialization)",
    code: codeUpTo(2),
    narration: [
      "선언한 변수에 처음으로 값을 넣는 것을 초기화라고 합니다.",
      "age 변수에는 25가 저장되었습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.initialization.narrationSplits,
  },

  print: {
    audio: "scene3.mp3",
    durationInFrames: AUDIO_CONFIG.print.durationInFrames,
    title: "3. 변수 출력 (Print)",
    code: codeUpTo(3),
    consoleOutput: "> 25",
    narration: [
      "이제 변수의 값을 화면에 출력해보겠습니다.",
      "System.out.println 메서드를 사용하면 괄호 안에 있는 변수의 값이 콘솔에 출력됩니다.",
      "실행하면 25가 출력되는 것을 확인할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.print.narrationSplits,
  },

};

// ── 폰트 (렌더러/브라우저 환경에서만 로드) ───────────────────
let monoFont = "JetBrains Mono, monospace";
let uiFont = "Noto Sans KR, sans-serif";

if (typeof window !== "undefined") {
  const _jb = loadJetBrains();
  const _ns = loadNotoSans();
  monoFont = _jb.fontFamily;
  uiFont = _ns.fontFamily;
  const _fontHandle = delayRender("Loading Google Fonts");
  Promise.all([_jb.waitUntilDone(), _ns.waitUntilDone()]).then(() =>
    continueRender(_fontHandle)
  );
}

// ── 훅: 타이핑 이펙트 ─────────────────────────────────────────
function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = 10
): { visibleText: string; isDone: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsVisible = Math.floor(
    (Math.max(0, frame - startFrame) / fps) * charsPerSecond
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
          return <span key={i} style={{ color: "#4ec9b0" }}>{part}</span>;
        if (/^\d+$/.test(part))
          return <span key={i} style={{ color: "#b5cea8" }}>{part}</span>;
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
      fontFamily: monoFont,
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
      )
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
        fontFamily: monoFont,
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
  const { fps, durationInFrames } = useVideoConfig();

  const S2 = Math.floor(durationInFrames / 2); // 두 번째 자막 시작
  const DROP_START    = S2 + 20;  // "값을 넣고" 시점
  const EXTRACT_START = S2 + 60;  // "꺼내 쓸 수 있습니다" 시점

  // 1) 상자 + 라벨 동시 등장
  const boxAppear   = spring({ frame: frame - 15, fps, config: { damping: 10, stiffness: 90 }, durationInFrames: 45 });
  const boxScale    = interpolate(boxAppear, [0, 1], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelAppear = boxAppear; // 상자와 같은 타이밍

  // 3) "변수 : age" 이름 태그
  const nameTag      = spring({ frame: frame - S2, fps, config: { damping: 12, stiffness: 180 }, durationInFrames: 25 });
  const nameTagScale = interpolate(nameTag, [0, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 4) 값(25) 낙하 — 단일 엘리먼트, Y만 이동하고 opacity 유지 (두 애니메이션 분리 → 깜빡임 제거)
  const dropE     = frame - DROP_START;
  const DROP_FRAMES = 30;
  // Y: -160(박스 위) → 0(중앙) easeOut
  const dropY  = interpolate(dropE, [0, DROP_FRAMES], [-160, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // opacity: 처음 4프레임에만 0→1, 이후 계속 1 (절대 0으로 돌아가지 않음)
  const dropO  = interpolate(dropE, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 착지 글로우
  const dropGlow = interpolate(dropE, [DROP_FRAMES - 2, DROP_FRAMES + 2, DROP_FRAMES + 14], [0, 1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 5) 값(25) 꺼내기
  const extE   = frame - EXTRACT_START;
  const ext    = spring({ frame: extE, fps, config: { damping: 200 }, durationInFrames: 30 });
  // 꺼내진 값 + 화살표: 박스 오른쪽에서 fade-in
  const extractO = interpolate(extE, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrowO   = extractO;
  // 꺼낼 때 박스 테두리 강조
  const extGlow  = interpolate(ext, [0, 0.3, 1], [0, 0.8, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const totalGlow = Math.max(dropGlow, extGlow);

  return (
    <div style={{
      position: "absolute",
      top: "28%",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
    }}>
      {/* "변수" 라벨 */}
      <div style={{ fontFamily: uiFont, fontSize: 42, fontWeight: 700, color: "#4ec9b0", letterSpacing: 6, opacity: labelAppear }}>
        변수
      </div>

      {/* 상자 + 꺼내기 레이어 */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* 상자 */}
        <div style={{
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
        }}>
          {/* 25 단일 엘리먼트: 위에서 Y 이동 후 중앙 고정 (깜빡임 없음) */}
          {dropE >= 0 && (
            <div style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translateX(-50%) translateY(calc(-50% + ${dropY}px))`,
              fontFamily: monoFont, fontSize: 90, color: "#b5cea8", fontWeight: 700,
              opacity: dropO, pointerEvents: "none",
            }}>
              25
            </div>
          )}
        </div>

        {/* 화살표 + 꺼낸 값 — 박스 오른쪽에 절대 위치 */}
        {extE >= 0 && (
          <>
            <div style={{
              position: "absolute",
              left: 300,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: arrowO,
              pointerEvents: "none",
            }}>
              {/* 화살표 */}
              <span style={{ fontFamily: uiFont, fontSize: 52, color: "#4ec9b0", lineHeight: 1 }}>→</span>
              {/* 꺼낸 값 */}
              <span style={{
                fontFamily: monoFont,
                fontSize: 80,
                color: "#b5cea8",
                fontWeight: 700,
                opacity: extractO,
                display: "inline-block",
              }}>
                25
              </span>
            </div>
          </>
        )}
      </div>

      {/* "변수 : age" 이름 태그 */}
      <div style={{
        transform: `scale(${nameTagScale})`,
        opacity: nameTag,
        fontFamily: monoFont,
        fontSize: 38,
      }}>
        <span style={{ color: "#4ec9b0" }}>변수</span>
        <span style={{ color: "#808080", margin: "0 10px" }}>:</span>
        <span style={{ color: "#9cdcfe" }}>age</span>
      </div>
    </div>
  );
};

// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { intro } = VIDEO_CONFIG;
  const d = intro.durationInFrames;
  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(intro.audio)} />
      <BoxMetaphorAnim />
      <Subtitle sentences={intro.narration} durationInFrames={d} splits={intro.narrationSplits} />
    </AbsoluteFill>
  );
};


// ── 컴포넌트: Subtitle ────────────────────────────────────────
const Subtitle: React.FC<{
  sentences: string[];
  durationInFrames: number;
  splits?: readonly number[]; // 각 문장(2번째~)이 시작하는 프레임. ffprobe 무음 감지 실측값.
}> = ({ sentences, durationInFrames, splits }) => {
  const frame = useCurrentFrame();
  const { width: compositionWidth } = useVideoConfig();
  const ranges = sentences.map((_, i) => {
    if (splits && splits.length >= sentences.length - 1) {
      // 실측 splits 사용
      const start = i === 0 ? 0 : splits[i - 1];
      const end   = i < splits.length ? splits[i] : durationInFrames;
      return { start, end };
    }
    // fallback: 글자 수 비례
    const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
    let cumulative = 0;
    sentences.slice(0, i).forEach((s) => { cumulative += s.length; });
    const start = Math.floor((cumulative / totalChars) * durationInFrames);
    cumulative += sentences[i].length;
    const end   = Math.floor((cumulative / totalChars) * durationInFrames);
    return { start, end };
  });
  const idx = ranges.findIndex(({ start, end }) => frame >= start && frame < end);
  const currentIdx = idx === -1 ? sentences.length - 1 : idx;
  const { start } = ranges[currentIdx];
  const opacity = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        fontFamily: uiFont,
        fontSize: 32,
        color: "#ffffff",
        opacity,
        background: "rgba(0,0,0,0.55)",
        borderRadius: 6,
        padding: "8px 16px",
        lineHeight: 1.6,
        width: "max-content",
        maxWidth: compositionWidth - 20,
        wordBreak: "keep-all",
        whiteSpace: "pre-line",
      }}
    >
      {sentences[currentIdx]}
    </div>
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
        background: "radial-gradient(circle, rgba(78,201,176,0.12) 0%, transparent 70%)",
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
        textShadow: "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
      }}
    >
      Java<br /><span style={{ color: "#4ec9b0" }}>변수</span>
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

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
const CROSS = 20; // 크로스페이드 프레임 수
const typingDone = (chars: number) =>
  TYPING_START + Math.ceil((chars / CHARS_PER_SEC) * 30);

const { thumbnail, intro, declaration, initialization, print } = VIDEO_CONFIG;

// ── 컴포넌트: CombinedVariableBox ────────────────────────────
// 선언(빈 박스) → 초기화(값 낙하) 전 구간을 하나의 박스로 이어서 표현
const CombinedVariableBox: React.FC<{ emptyStart: number; fillStart: number }> = ({
  emptyStart,
  fillStart,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = frame - emptyStart;
  const fillElapsed = frame - fillStart;

  // 박스 등장 (아래서 올라옴)
  const appear = spring({ frame: elapsed, fps, config: { damping: 14, stiffness: 140 }, durationInFrames: 35 });
  const translateY = interpolate(appear, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 값 낙하 스프링
  const dropProgress = spring({ frame: fillElapsed, fps, config: { damping: 10, stiffness: 120 }, durationInFrames: 40 });
  const valueY = interpolate(dropProgress, [0, 1], [-110, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fallingOpacity = interpolate(dropProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const insideOpacity = interpolate(dropProgress, [0.85, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const borderGlow = interpolate(dropProgress, [0.8, 0.9, 1], [0, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
      <div style={{ fontFamily: uiFont, fontSize: 26, color: "#4ec9b0", opacity: 0.85, letterSpacing: 2 }}>age</div>
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
        <span style={{ position: "absolute", fontFamily: monoFont, fontSize: 44, color: "#b5cea8", opacity: insideOpacity }}>25</span>
        {/* 낙하 중인 숫자 */}
        <div style={{ position: "absolute", top: valueY, left: "50%", transform: "translateX(-50%)", fontFamily: monoFont, fontSize: 44, color: "#b5cea8", opacity: fallingOpacity, pointerEvents: "none" }}>25</div>
      </div>
    </div>
  );
};

// ── 씬: CombinedDeclarationInitScene ─────────────────────────
// 선언 + 초기화를 하나의 연속 씬으로 처리 (박스 애니메이션이 끊기지 않음)
const SPLIT = declaration.durationInFrames; // 선언 끝 = 초기화 시작 지점
const COMBINED_DURATION = declaration.durationInFrames + initialization.durationInFrames;

const CombinedDeclarationInitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const d = COMBINED_DURATION;
  const fadeIn = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const emptyBoxStart = typingDone("int age;".length);
  const fillBoxStart = SPLIT + typingDone("age = 25;".length);

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
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
        <CodeBox lines={declaration.code} startFrame={TYPING_START} />
      </Sequence>
      <Sequence from={SPLIT}>
        <CodeBox lines={initialization.code} startFrame={TYPING_START} />
      </Sequence>

      {/* 박스: 전 구간에 걸쳐 살아있는 단일 박스 */}
      <CombinedVariableBox emptyStart={emptyBoxStart} fillStart={fillBoxStart} />

      {/* 자막 */}
      <Sequence durationInFrames={SPLIT}>
        <Subtitle sentences={declaration.narration} durationInFrames={SPLIT} splits={declaration.narrationSplits} />
      </Sequence>
      <Sequence from={SPLIT}>
        <Subtitle sentences={initialization.narration} durationInFrames={initialization.durationInFrames} splits={initialization.narrationSplits} />
      </Sequence>
    </AbsoluteFill>
  );
};

const PrintScene: React.FC = () => {
  const frame = useCurrentFrame();
  const d = print.durationInFrames;
  const fadeIn = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [d - CROSS, d], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const newLine = print.code.find((l) => l.isNew)!;
  const consoleStart = typingDone(newLine.text.length);
  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeIn * fadeOut }}>
      <Audio src={staticFile(print.audio)} />
      <SceneTitle title={print.title} />
      <CodeBox lines={print.code} startFrame={TYPING_START} />
      <ConsoleOutput text={print.consoleOutput} startFrame={consoleStart} />
      <Subtitle sentences={print.narration} durationInFrames={d} splits={print.narrationSplits} />
    </AbsoluteFill>
  );
};

// ── Composition ───────────────────────────────────────────────
const mergedSceneList = [
  { durationInFrames: thumbnail.durationInFrames },
  { durationInFrames: intro.durationInFrames },
  { durationInFrames: COMBINED_DURATION },
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
    <Sequence from={fromValues[0]} durationInFrames={thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={COMBINED_DURATION}>
      <CombinedDeclarationInitScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={print.durationInFrames}>
      <PrintScene />
    </Sequence>
  </AbsoluteFill>
);

// Root.tsx 가 require.context 로 동적 로드할 때 사용하는 표준 export
export { JavaVariables as Component };
