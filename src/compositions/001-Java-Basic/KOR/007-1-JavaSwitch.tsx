// src/compositions/001-Java-Basic/007-JavaSwitch.tsx
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

import { FPS, SCENE_TAIL_FRAMES } from "../../../config";
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
import { AUDIO_CONFIG } from "./007-3-audio.gen";
import { CONTENT } from "./007-2-content";
import { HEIGHT, WIDTH } from "./config";

// ── 색상 상수 ─────────────────────────────────────────────────
const C_SWITCH = "#569cd6"; // switch 키워드 (파랑)
const C_CASE = "#c586c0"; // case/default 키워드 (보라)
const C_ARROW = "#4ec9b0"; // -> 화살표 (teal)
const C_STR = "#ce9178"; // 문자열 값 (주황)
const C_RESULT = "#b5cea8"; // 결과값 (연초록)
const C_DIM = "rgba(255,255,255,0.22)";

// ── SyntaxScene 타이핑 코드 라인 데이터 ──────────────────────
const SYNTAX_LINES = [
  // String day = "SATURDAY";  (24자)
  {
    parts: [
      { text: "String", color: C_SWITCH },
      { text: " day = ", color: "#d4d4d4" },
      { text: '"SATURDAY"', color: C_STR },
      { text: ";", color: "#d4d4d4" },
    ],
  },
  // 빈 줄 (0자)
  { parts: [{ text: "", color: "#d4d4d4" }] },
  // String msg = switch (day) {  (27자)
  {
    parts: [
      { text: "String", color: C_SWITCH },
      { text: " msg = ", color: "#d4d4d4" },
      { text: "switch", color: C_SWITCH, bold: true },
      { text: " (day) {", color: "#d4d4d4" },
    ],
  },
  // case "MON","TUE","WED","THU","FRI" -> "평일";
  {
    parts: [
      { text: "    ", color: "#d4d4d4" },
      { text: "case", color: C_CASE },
      { text: ' "MON", "TUE", "WED", "THU", "FRI"', color: C_STR },
      { text: " ->", color: C_ARROW },
      { text: ' "평일"', color: C_RESULT },
      { text: ";", color: "#d4d4d4" },
    ],
  },
  // case "SAT","SUN" -> "주말";
  {
    parts: [
      { text: "    ", color: "#d4d4d4" },
      { text: "case", color: C_CASE },
      { text: ' "SAT", "SUN"', color: C_STR },
      { text: " ->", color: C_ARROW },
      { text: ' "주말"', color: C_RESULT },
      { text: ";", color: "#d4d4d4" },
    ],
  },
  // default -> "?";
  {
    parts: [
      { text: "    ", color: "#d4d4d4" },
      { text: "default", color: C_CASE },
      { text: " ->", color: C_ARROW },
      { text: ' "?"', color: C_STR },
      { text: ";", color: "#d4d4d4" },
    ],
  },
  // };
  { parts: [{ text: "};", color: "#d4d4d4" }] },
] as const;

const SYNTAX_FULL_CODE = SYNTAX_LINES.map((l) =>
  l.parts.map((p) => p.text).join(""),
).join("\n");
const SYNTAX_CODE_CHARS = SYNTAX_FULL_CODE.length; // ~159

const SYNTAX_CHARS_PER_SEC = 20;

// 각 ' ->' part 의 누적 charIndex (glow 타이밍 계산용, 동적 계산)
const ARROW_CHAR_STARTS: number[] = (() => {
  let cum = 0;
  const starts: number[] = [];
  for (const line of SYNTAX_LINES) {
    for (const part of line.parts) {
      if (part.text === " ->") starts.push(cum);
      cum += part.text.length;
    }
  }
  return starts;
})();

// SyntaxScene duration 헌법 계산
const SYNTAX_TYPING_END =
  AUDIO_CONFIG.syntaxScene.speechStartFrame +
  Math.ceil((SYNTAX_CODE_CHARS / SYNTAX_CHARS_PER_SEC) * 30);
const SYNTAX_SCENE_DURATION = Math.max(
  AUDIO_CONFIG.syntaxScene.durationInFrames,
  SYNTAX_TYPING_END + CROSS + SCENE_TAIL_FRAMES,
);

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  overview: {
    audio: "switch-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: CONTENT.overview.narration as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "switch-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  syntaxScene: {
    audio: "switch-syntax.mp3",
    durationInFrames: SYNTAX_SCENE_DURATION,
    speechStartFrame: AUDIO_CONFIG.syntaxScene.speechStartFrame,
    narration: CONTENT.syntaxScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.syntaxScene.narrationSplits,
  },
  multiCaseScene: {
    audio: "switch-multicase.mp3",
    durationInFrames: AUDIO_CONFIG.multiCaseScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.multiCaseScene.speechStartFrame,
    narration: CONTENT.multiCaseScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.multiCaseScene.narrationSplits,
  },
  summaryScene: {
    audio: "switch-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: CONTENT.summaryScene.narration as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 씬 목록 (총 duration 계산용) ──────────────────────────────
// [0]=thumbnail [1]=overview [2]=intro [3]=syntax [4]=multiCase [5]=summary
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  { durationInFrames: VIDEO_CONFIG.overview.durationInFrames },
  { durationInFrames: VIDEO_CONFIG.intro.durationInFrames },
  { durationInFrames: SYNTAX_SCENE_DURATION },
  { durationInFrames: VIDEO_CONFIG.multiCaseScene.durationInFrames },
  { durationInFrames: VIDEO_CONFIG.summaryScene.durationInFrames },
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;

// ── ThumbnailScene ────────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#050510",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 28,
    }}
  >
    {/* 배경 글로우 */}
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
      <span style={{ color: "#4ec9b0" }}>switch</span>
    </div>
    {/* switch 키워드 배지 */}
    <div
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 64,
        fontWeight: 900,
        color: "#4ec9b0",
        background: "#4ec9b018",
        border: "2px solid #4ec9b055",
        borderRadius: 18,
        padding: "18px 56px",
        marginTop: 8,
      }}
    >
      switch
    </div>
  </AbsoluteFill>
);

// ── OverviewScene ─────────────────────────────────────────────
const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { overview: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const opacity = useFade(d);

  // frame 0부터 순차 등장 (speechStartFrame 기준 아님)
  const rootAppear = spring({
    frame: frame,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const leftAppear = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const rightAppear = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 24,
  });
  const ifAppear = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 22,
  });
  // switch 노드: if 직후 등장 (frame 0부터 트리 완성)
  const switchAppear = spring({
    frame: frame - AUDIO_CONFIG.overview.wordTiming["switch"][0],
    fps,
    config: { damping: 12, stiffness: 160 },
    durationInFrames: 22,
  });

  const C_COND = C_CASE;
  const C_LOOP = "#4ec9b0";

  const nodeStyle = (color: string, appear: number): React.CSSProperties => {
    const sc = interpolate(appear, [0, 1], [0.75, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return {
      fontFamily: uiFont,
      fontSize: 34,
      fontWeight: 700,
      color,
      background: `${color}18`,
      border: `2px solid ${color}66`,
      borderRadius: 16,
      padding: "16px 40px",
      opacity: appear,
      transform: `scale(${sc})`,
      textAlign: "center" as const,
      whiteSpace: "nowrap" as const,
    };
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {/* 항상 보임 — frame 0부터 트리 등장 */}
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 800,
            }}
          >
            {/* 루트: 제어문 */}
            <div style={nodeStyle("#9cdcfe", rootAppear)}>제어문</div>

            {/* 연결선: 제어문 → 조건문 / 반복문 */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 52,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  width: 2,
                  height: 26,
                  background: "rgba(255,255,255,0.18)",
                  transform: "translateX(-50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 26,
                  left: "25%",
                  width: "50%",
                  height: 2,
                  background: "rgba(255,255,255,0.18)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 26,
                  left: "25%",
                  width: 2,
                  height: 26,
                  background: "rgba(255,255,255,0.18)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 26,
                  right: "25%",
                  width: 2,
                  height: 26,
                  background: "rgba(255,255,255,0.18)",
                }}
              />
            </div>

            {/* 조건문 / 반복문 */}
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
                alignItems: "flex-start",
              }}
            >
              {/* 왼쪽: 조건문 + if/switch */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={nodeStyle(C_COND, leftAppear)}>조건문</div>

                {/* 연결선: 조건문 → if / switch */}
                <div
                  style={{
                    position: "relative",
                    width: 280,
                    height: 42,
                    flexShrink: 0,
                    opacity: ifAppear,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      width: 2,
                      height: 20,
                      background: "rgba(255,255,255,0.18)",
                      transform: "translateX(-50%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      left: "18%",
                      width: "64%",
                      height: 2,
                      background: "rgba(255,255,255,0.18)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      left: "18%",
                      width: 2,
                      height: 22,
                      background: "rgba(255,255,255,0.18)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: "18%",
                      width: 2,
                      height: 22,
                      background: "rgba(255,255,255,0.18)",
                    }}
                  />
                </div>

                {/* if + switch */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 44,
                      fontWeight: 900,
                      color: C_COND,
                      background: `${C_COND}18`,
                      border: `2px solid ${C_COND}55`,
                      borderRadius: 16,
                      padding: "12px 32px",
                      opacity: ifAppear * 0.38,
                      transform: `scale(${interpolate(ifAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    if
                  </div>

                  {/* switch — narrationSplits[0] 기준 팝업 */}
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 44,
                      fontWeight: 900,
                      color: C_SWITCH,
                      background: `${C_SWITCH}18`,
                      border: `2px solid ${C_SWITCH}55`,
                      borderRadius: 16,
                      padding: "12px 32px",
                      opacity: switchAppear,
                      transform: `scale(${interpolate(switchAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                      boxShadow: `0 0 28px ${C_SWITCH}44`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    switch
                  </div>
                </div>
              </div>

              {/* 오른쪽: 반복문 */}
              <div style={{ flexShrink: 0 }}>
                <div style={nodeStyle(C_LOOP, rightAppear)}>반복문</div>
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.overview.wordStartFrames}
      />
    </>
  );
};

// ── IntroScene ────────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Math.floor(d / 2)] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const leftAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 120 },
    durationInFrames: 26,
  });
  const rightAppear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 24,
  });

  const cardBase: React.CSSProperties = {
    fontFamily: monoFont,
    fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 24,
    lineHeight: 1.85,
    background: "#252525",
    borderRadius: 16,
    padding: "24px 32px",
    whiteSpace: "nowrap",
  };

  const dimSpan = (text: string) => (
    <span style={{ color: C_DIM }}>{text}</span>
  );

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: 920,
            }}
          >
            {/* 상단: if-else 체인 (복잡, 흐리게) */}
            <div
              style={{
                ...cardBase,
                opacity: leftAppear,
                transform: `scale(${interpolate(leftAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                border: "2px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  color: C_DIM,
                  marginBottom: 12,
                }}
              >
                if-else 체인
              </div>
              <div>{dimSpan('if (day.equals("MON")) {')}</div>
              <div style={{ paddingLeft: 32 }}>
                {dimSpan('msg = "월요일";')}
              </div>
              <div>{dimSpan('} else if (day.equals("TUE")) {')}</div>
              <div style={{ paddingLeft: 32 }}>
                {dimSpan('msg = "화요일";')}
              </div>
              <div>{dimSpan('} else if (day.equals("SAT")) {')}</div>
              <div style={{ paddingLeft: 32 }}>
                {dimSpan('msg = "토요일";')}
              </div>
              <div>{dimSpan("} // ...")}</div>
            </div>

            {/* 하단: switch 표현식 (간결, 밝은 색) — split0 기준 등장 */}
            <div
              style={{
                ...cardBase,
                opacity: rightAppear,
                transform: `scale(${interpolate(rightAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                border: `2px solid ${C_SWITCH}44`,
                boxShadow: `0 0 24px ${C_SWITCH}22`,
              }}
            >
              <div
                style={{
                  fontFamily: uiFont,
                  fontSize: 20,
                  color: C_SWITCH,
                  marginBottom: 12,
                  fontWeight: 700,
                }}
              >
                switch 표현식
              </div>
              <div>
                <span style={{ color: C_SWITCH, fontWeight: 900 }}>switch</span>
                <span style={{ color: "#d4d4d4" }}> (day) {"{"}</span>
              </div>
              <div style={{ paddingLeft: 32 }}>
                <span style={{ color: C_CASE }}>case</span>
                <span style={{ color: C_STR }}> "MON"</span>
                <span style={{ color: C_ARROW }}> {"->"}</span>
                <span style={{ color: C_RESULT }}> "월요일"</span>
                <span style={{ color: "#d4d4d4" }}>;</span>
              </div>
              <div style={{ paddingLeft: 32 }}>
                <span style={{ color: C_CASE }}>case</span>
                <span style={{ color: C_STR }}> "SAT"</span>
                <span style={{ color: C_ARROW }}> {"->"}</span>
                <span style={{ color: C_RESULT }}> "토요일"</span>
                <span style={{ color: "#d4d4d4" }}>;</span>
              </div>
              <div style={{ paddingLeft: 32 }}>
                <span style={{ color: C_DIM }}>// ...</span>
              </div>
              <div>
                <span style={{ color: "#d4d4d4" }}>{"}"}</span>
              </div>
            </div>
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.intro.wordStartFrames}
      />
    </>
  );
};

// ── SyntaxScene ───────────────────────────────────────────────
const SyntaxScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { syntaxScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const opacity = useFade(d);

  const charsVisible = Math.min(
    SYNTAX_CODE_CHARS,
    Math.max(0, ((frame - s) / fps) * SYNTAX_CHARS_PER_SEC),
  );

  let remaining = Math.floor(charsVisible);
  const lineVisibility = SYNTAX_LINES.map((line) => {
    const lineLen = line.parts.reduce((acc, p) => acc + p.text.length, 0);
    const show = Math.min(lineLen, remaining);
    remaining = Math.max(0, remaining - lineLen);
    return show;
  });

  const blockAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 120 },
    durationInFrames: 24,
  });
  const sc = interpolate(blockAppear, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arrowGlows = ARROW_CHAR_STARTS.map((charStart) => {
    const glowFrame = s + Math.ceil((charStart / SYNTAX_CHARS_PER_SEC) * fps);
    return interpolate(
      frame,
      [glowFrame, glowFrame + 6, glowFrame + 18],
      [0, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  });

  let arrowIdx = 0;

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {frame >= s && (
            <div
              style={{
                position: "absolute",
                top: "46%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${sc})`,
              }}
            >
              <div
                style={{
                  fontFamily: monoFont,
                  fontFeatureSettings: MONO_NO_LIGA,
                  fontSize: 25,
                  lineHeight: 1.95,
                  background: "#252525",
                  borderRadius: 20,
                  padding: "28px 40px",
                  opacity: blockAppear,
                  width: 980,
                  boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
                  whiteSpace: "pre",
                }}
              >
                {SYNTAX_LINES.map((line, lineIdx) => {
                  const showChars = lineVisibility[lineIdx];
                  let rem = showChars;
                  return (
                    <div key={lineIdx} style={{ lineHeight: 1.95 }}>
                      {line.parts.map((part, pi) => {
                        const show = Math.min(part.text.length, rem);
                        rem = Math.max(0, rem - part.text.length);
                        if (show <= 0) return null;
                        const isArrow = part.text === " ->";
                        const curArrowIdx = isArrow ? arrowIdx++ : -1;
                        const glow =
                          isArrow && curArrowIdx < arrowGlows.length
                            ? arrowGlows[curArrowIdx]
                            : 0;
                        return (
                          <span
                            key={pi}
                            style={{
                              color: part.color,
                              fontWeight: (part as { bold?: boolean }).bold
                                ? 900
                                : undefined,
                              textShadow:
                                glow > 0.01
                                  ? `0 0 ${interpolate(glow, [0, 1], [0, 16])}px ${C_ARROW}`
                                  : undefined,
                            }}
                          >
                            {part.text.slice(0, show)}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.syntaxScene.wordStartFrames}
      />
    </>
  );
};

// ── MultiCaseScene ────────────────────────────────────────────
const MultiCaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { multiCaseScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Math.floor(d / 2)] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const phase2 = frame >= split0;

  const p1Appear = spring({
    frame: frame - s,
    fps,
    config: { damping: 12, stiffness: 120 },
    durationInFrames: 26,
  });
  const p2Appear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 12, stiffness: 130 },
    durationInFrames: 26,
  });

  const strGlow = interpolate(frame, [s + 10, s + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scP1 = interpolate(p1Appear, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scP2 = interpolate(p2Appear, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "46%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 32,
              width: 900,
              alignItems: "center",
            }}
          >
            {/* Phase 1: 케이스 묶기 강조 */}
            <div
              style={{
                fontFamily: monoFont,
                fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 34,
                lineHeight: 2.0,
                background: "#252525",
                borderRadius: 16,
                padding: "28px 48px",
                width: "100%",
                opacity: p1Appear,
                transform: `scale(${scP1})`,
                border: `2px solid ${C_ARROW}44`,
              }}
            >
              <div>
                <span style={{ color: C_CASE }}>case</span>
                <span
                  style={{
                    color: C_STR,
                    textShadow: `0 0 ${interpolate(strGlow, [0, 1], [0, 12])}px ${C_STR}`,
                  }}
                >
                  {" "}
                  "SAT"
                </span>
                <span style={{ color: "#d4d4d4" }}>,</span>
                <span
                  style={{
                    color: C_STR,
                    textShadow: `0 0 ${interpolate(strGlow, [0, 1], [0, 12])}px ${C_STR}`,
                  }}
                >
                  {" "}
                  "SUN"
                </span>
                <span style={{ color: C_ARROW }}> {"->"}</span>
                <span style={{ color: C_RESULT }}> "주말"</span>
                <span style={{ color: "#d4d4d4" }}>;</span>
              </div>
            </div>

            {/* Phase 2: 값 반환 전체 표현식 — split0 기준 등장 */}
            {phase2 && (
              <div
                style={{
                  fontFamily: monoFont,
                  fontFeatureSettings: MONO_NO_LIGA,
                  fontSize: 28,
                  lineHeight: 1.9,
                  background: "#252525",
                  borderRadius: 16,
                  padding: "28px 48px",
                  width: "100%",
                  opacity: p2Appear,
                  transform: `scale(${scP2})`,
                  border: `2px solid ${C_RESULT}55`,
                }}
              >
                <div>
                  <span style={{ color: C_SWITCH }}>String</span>
                  <span
                    style={{
                      color: C_RESULT,
                      fontWeight: 900,
                      textShadow: `0 0 12px ${C_RESULT}66`,
                    }}
                  >
                    {" "}
                    msg
                  </span>
                  <span style={{ color: "#d4d4d4" }}> = </span>
                  <span style={{ color: C_SWITCH, fontWeight: 900 }}>
                    switch
                  </span>
                  <span style={{ color: "#d4d4d4" }}> (day) {"{"}</span>
                </div>
                <div style={{ paddingLeft: 40 }}>
                  <span style={{ color: C_CASE }}>case</span>
                  <span style={{ color: C_STR }}> "SAT"</span>
                  <span style={{ color: "#d4d4d4" }}>,</span>
                  <span style={{ color: C_STR }}> "SUN"</span>
                  <span style={{ color: C_ARROW }}> {"->"}</span>
                  <span style={{ color: C_RESULT }}> "주말"</span>
                  <span style={{ color: "#d4d4d4" }}>;</span>
                </div>
                <div style={{ paddingLeft: 40 }}>
                  <span style={{ color: C_DIM }}>// ...</span>
                </div>
                <div>
                  <span style={{ color: "#d4d4d4" }}>{"}"}</span>
                  <span style={{ color: "#d4d4d4" }}>;</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 16,
                    opacity: p2Appear,
                  }}
                >
                  <span
                    style={{
                      fontFamily: uiFont,
                      color: C_RESULT,
                      fontSize: 22,
                    }}
                  >
                    반환값
                  </span>
                  <span style={{ color: C_ARROW, fontSize: 22 }}>→</span>
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontFeatureSettings: MONO_NO_LIGA,
                      color: C_RESULT,
                      fontSize: 22,
                      fontWeight: 900,
                    }}
                  >
                    msg
                  </span>
                  <span
                    style={{ fontFamily: uiFont, color: "#888", fontSize: 20 }}
                  >
                    변수에 저장
                  </span>
                </div>
              </div>
            )}
          </div>
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
        wordFrames={AUDIO_CONFIG.multiCaseScene.wordStartFrames}
      />
    </>
  );
};

// ── SummaryScene ──────────────────────────────────────────────
const SUMMARY_CARDS = [
  {
    emoji: "🏹",
    label: "화살표 문법",
    desc: "각 케이스를 간결하게 작성",
    color: C_ARROW,
  },
  {
    emoji: "✅",
    label: "케이스 자동 종료",
    desc: "다음 케이스로 이어지지 않음",
    color: C_ARROW,
  },
  {
    emoji: "📦",
    label: "값 반환 · 케이스 묶기",
    desc: "변수에 직접 대입 가능",
    color: C_RESULT,
  },
] as const;

const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity, split1 = Infinity, split2 = Infinity] =
    cfg.narrationSplits as readonly number[];
  const opacity = useFade(d, { out: false }); // 마지막 씬 — fadeOut 없음

  // 문장 1("정리하겠습니다.") → 타이틀
  // 문장 2(split0~) → 카드1 / 문장 3(split1~) → 카드2 / 문장 4(split2~) → 카드3
  const titleAppear = spring({
    frame: frame - s,
    fps,
    config: { damping: 13, stiffness: 130 },
    durationInFrames: 26,
  });
  const card1Appear = spring({
    frame: frame - split0,
    fps,
    config: { damping: 13, stiffness: 140 },
    durationInFrames: 26,
  });
  const card2Appear = spring({
    frame: frame - split1,
    fps,
    config: { damping: 13, stiffness: 140 },
    durationInFrames: 26,
  });
  const card3Appear = spring({
    frame: frame - split2,
    fps,
    config: { damping: 13, stiffness: 140 },
    durationInFrames: 26,
  });

  const cardSprings = [card1Appear, card2Appear, card3Appear];

  const sc = (a: number) =>
    interpolate(a, [0, 1], [0.88, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              width: 920,
            }}
          >
            {/* 정리 헤더 */}
            <div
              style={{
                fontFamily: uiFont,
                fontSize: 28,
                fontWeight: 900,
                color: C_ARROW,
                letterSpacing: 4,
                opacity: titleAppear,
                transform: `scale(${sc(titleAppear)})`,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              ── 정리 ──
            </div>

            {/* 요약 카드 3개 */}
            {SUMMARY_CARDS.map((card, i) => {
              const appear = cardSprings[i];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    background: "#2a2a2a",
                    border: `2px solid ${card.color}55`,
                    borderRadius: 18,
                    padding: "18px 32px",
                    opacity: appear,
                    transform: `scale(${sc(appear)})`,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{card.emoji}</span>
                  <span
                    style={{
                      fontFamily: uiFont,
                      fontSize: 28,
                      fontWeight: 900,
                      color: card.color,
                      minWidth: 210,
                    }}
                  >
                    {card.label}
                  </span>
                  <span style={{ color: "#3a3a3a", fontSize: 24 }}>—</span>
                  <span
                    style={{
                      fontFamily: uiFont,
                      fontSize: 26,
                      color: "#d4d4d4",
                    }}
                  >
                    {card.desc}
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
        speechStart={s}
        wordFrames={AUDIO_CONFIG.summaryScene.wordStartFrames}
      />
    </>
  );
};

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

  // fromValues 재계산 (sceneList 기반)
  const sceneDurations = sceneList.map((s) => s.durationInFrames);
  const froms: number[] = [];
  let _f = 0;
  for (let i = 0; i < sceneDurations.length; i++) {
    froms.push(_f);
    _f += sceneDurations[i] - (i < sceneDurations.length - 1 ? CROSS_VAL : 0);
  }

  // [0]=thumbnail: 나레이션 없음
  // [1]=overview
  addScene(
    froms[1],
    VIDEO_CONFIG.overview.narration,
    AUDIO_CONFIG.overview.speechStartFrame,
    AUDIO_CONFIG.overview.narrationSplits,
    AUDIO_CONFIG.overview.sentenceEndFrames,
    VIDEO_CONFIG.overview.durationInFrames,
  );
  // [2]=intro
  addScene(
    froms[2],
    VIDEO_CONFIG.intro.narration,
    AUDIO_CONFIG.intro.speechStartFrame,
    AUDIO_CONFIG.intro.narrationSplits,
    AUDIO_CONFIG.intro.sentenceEndFrames,
    VIDEO_CONFIG.intro.durationInFrames,
  );
  // [3]=syntaxScene (SYNTAX_SCENE_DURATION 사용)
  addScene(
    froms[3],
    VIDEO_CONFIG.syntaxScene.narration,
    AUDIO_CONFIG.syntaxScene.speechStartFrame,
    AUDIO_CONFIG.syntaxScene.narrationSplits,
    AUDIO_CONFIG.syntaxScene.sentenceEndFrames,
    SYNTAX_SCENE_DURATION,
  );
  // [4]=multiCaseScene
  addScene(
    froms[4],
    VIDEO_CONFIG.multiCaseScene.narration,
    AUDIO_CONFIG.multiCaseScene.speechStartFrame,
    AUDIO_CONFIG.multiCaseScene.narrationSplits,
    AUDIO_CONFIG.multiCaseScene.sentenceEndFrames,
    VIDEO_CONFIG.multiCaseScene.durationInFrames,
  );
  // [5]=summaryScene
  addScene(
    froms[5],
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
// sceneList: [0]=thumbnail [1]=overview [2]=intro [3]=syntax [4]=multiCase [5]=summary
export const JavaSwitch: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.overview.durationInFrames}
    >
      <OverviewScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.intro.durationInFrames}
    >
      <IntroScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.syntaxScene.durationInFrames}
    >
      <SyntaxScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.multiCaseScene.durationInFrames}
    >
      <MultiCaseScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaSwitch;
