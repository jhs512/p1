// src/compositions/001-Java-Basic/007-JavaSwitch.tsx
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RATE, SCENE_TAIL_FRAMES, VOICE } from "../../global.config";
import { AUDIO_CONFIG } from "./007-audio";
import {
  CROSS,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../utils/scene";

export { RATE, VOICE };

// ── 색상 상수 ─────────────────────────────────────────────────
const C_SWITCH = "#569cd6"; // switch 키워드 (파랑)
const C_CASE   = "#c586c0"; // case/default 키워드 (보라)
const C_ARROW  = "#4ec9b0"; // -> 화살표 (teal)
const C_STR    = "#ce9178"; // 문자열 값 (주황)
const C_RESULT = "#b5cea8"; // 결과값 (연초록)
export const C_DIM    = "rgba(255,255,255,0.22)";
export const C_RED    = "#f47c7c"; // 경고·오류

// ── SyntaxScene 타이핑 코드 라인 데이터 ──────────────────────
const SYNTAX_LINES = [
  // String day = "SATURDAY";  (24자)
  { parts: [
    { text: "String",      color: C_SWITCH },
    { text: " day = ",     color: "#d4d4d4" },
    { text: '"SATURDAY"',  color: C_STR },
    { text: ";",           color: "#d4d4d4" },
  ]},
  // 빈 줄 (0자)
  { parts: [{ text: "", color: "#d4d4d4" }] },
  // String msg = switch (day) {  (27자)
  { parts: [
    { text: "String",      color: C_SWITCH },
    { text: " msg = ",     color: "#d4d4d4" },
    { text: "switch",      color: C_SWITCH, bold: true },
    { text: " (day) {",    color: "#d4d4d4" },
  ]},
  // case "MON","TUE","WED","THU","FRI" -> "평일";
  { parts: [
    { text: "    ",                                    color: "#d4d4d4" },
    { text: "case",                                    color: C_CASE },
    { text: ' "MON", "TUE", "WED", "THU", "FRI"',    color: C_STR },
    { text: " ->",                                     color: C_ARROW },
    { text: ' "평일"',                                 color: C_RESULT },
    { text: ";",                                       color: "#d4d4d4" },
  ]},
  // case "SAT","SUN" -> "주말";
  { parts: [
    { text: "    ",          color: "#d4d4d4" },
    { text: "case",          color: C_CASE },
    { text: ' "SAT", "SUN"', color: C_STR },
    { text: " ->",           color: C_ARROW },
    { text: ' "주말"',       color: C_RESULT },
    { text: ";",             color: "#d4d4d4" },
  ]},
  // default -> "?";
  { parts: [
    { text: "    ",    color: "#d4d4d4" },
    { text: "default", color: C_CASE },
    { text: " ->",     color: C_ARROW },
    { text: ' "?"',    color: C_STR },
    { text: ";",       color: "#d4d4d4" },
  ]},
  // };
  { parts: [{ text: "};", color: "#d4d4d4" }] },
] as const;

const SYNTAX_FULL_CODE = SYNTAX_LINES.map(l => l.parts.map(p => p.text).join("")).join("\n");
const SYNTAX_CODE_CHARS = SYNTAX_FULL_CODE.length; // ~159

const SYNTAX_CHARS_PER_SEC = 20;

// 각 ' ->' part 의 누적 charIndex (glow 타이밍 계산용, 동적 계산)
export const ARROW_CHAR_STARTS: number[] = (() => {
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
    narration: [
      "다양한 조건을 처리할 때 [switch(발음:스위치)] 표현식을 사용할 수 있습니다.",
      "[if(발음:이프)]문 대신 더 깔끔하게 조건을 분기할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "switch-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "요일에 따라 다른 메시지를 출력하려면 [if(발음:이프)]문을 여러 번 반복해야 합니다.",
      "[switch(발음:스위치)] 표현식을 쓰면 훨씬 간결하게 작성할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  syntaxScene: {
    audio: "switch-syntax.mp3",
    durationInFrames: SYNTAX_SCENE_DURATION,
    speechStartFrame: AUDIO_CONFIG.syntaxScene.speechStartFrame,
    narration: [
      "[switch(발음:스위치)] 뒤에 조건값을 쓰고, 각 케이스에 화살표로 결과를 연결합니다.",
      "화살표 문법을 사용하면 코드가 훨씬 간결해집니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.syntaxScene.narrationSplits,
  },
  noFallthroughScene: {
    audio: "switch-nofallthrough.mp3",
    durationInFrames: AUDIO_CONFIG.noFallthroughScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.noFallthroughScene.speechStartFrame,
    narration: [
      "기존 [switch(발음:스위치)]는 각 케이스 종료를 명시하지 않으면 다음 케이스로 흘러내립니다.",
      "화살표 문법은 각 케이스가 독립 실행되어 이런 실수가 없습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.noFallthroughScene.narrationSplits,
  },
  multiCaseScene: {
    audio: "switch-multicase.mp3",
    durationInFrames: AUDIO_CONFIG.multiCaseScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.multiCaseScene.speechStartFrame,
    narration: [
      "여러 값을 하나의 케이스로 묶어 중복 없이 처리할 수 있습니다.",
      "[switch(발음:스위치)] 표현식은 값을 반환하므로 변수에 바로 대입할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.multiCaseScene.narrationSplits,
  },
  summaryScene: {
    audio: "switch-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "화살표 문법으로 각 케이스를 간결하게 작성할 수 있습니다.",
      "[fall-through(발음:폴스루)] 없이 각 케이스가 독립 실행됩니다.",
      "값 반환과 케이스 묶기로 더욱 강력하게 사용할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 씬 목록 (총 duration 계산용) ──────────────────────────────
const sceneList = [
  { durationInFrames: VIDEO_CONFIG.thumbnail.durationInFrames },
  { durationInFrames: VIDEO_CONFIG.overview.durationInFrames },
  { durationInFrames: VIDEO_CONFIG.intro.durationInFrames },
  { durationInFrames: SYNTAX_SCENE_DURATION },
  { durationInFrames: VIDEO_CONFIG.noFallthroughScene.durationInFrames },
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
  <AbsoluteFill style={{ background: "#0d0d1a", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
    <div style={{
      position: "absolute", width: 860, height: 860, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(86,156,214,0.12) 0%, transparent 70%)",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }} />
    <div style={{ fontFamily: uiFont, fontSize: 26, fontWeight: 700, color: C_SWITCH, letterSpacing: 10, opacity: 0.8 }}>JAVA</div>
    <div style={{
      fontFamily: uiFont, fontSize: 96, fontWeight: 900, lineHeight: 1,
      textAlign: "center", color: "#fff",
      textShadow: `0 0 60px rgba(86,156,214,0.6), 0 0 120px rgba(86,156,214,0.25)`,
    }}>
      Java<br /><span style={{ color: C_SWITCH }}>표현식</span>
    </div>
    <div style={{
      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
      fontSize: 56, fontWeight: 900, color: C_SWITCH,
      background: `${C_SWITCH}18`, border: `2px solid ${C_SWITCH}55`,
      borderRadius: 18, padding: "18px 56px", marginTop: 8,
    }}>switch</div>
  </AbsoluteFill>
);

// ── OverviewScene ─────────────────────────────────────────────
const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { overview: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const rootAppear   = spring({ frame: frame - s,       fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const leftAppear   = spring({ frame: frame - s - 10,  fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const rightAppear  = spring({ frame: frame - s - 20,  fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const ifAppear     = spring({ frame: frame - s - 24,  fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 22 });
  const switchAppear = spring({ frame: frame - split0,  fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 22 });

  const C_COND = C_CASE;
  const C_LOOP = "#4ec9b0";

  const nodeStyle = (color: string, appear: number): React.CSSProperties => {
    const sc = interpolate(appear, [0, 1], [0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      fontFamily: uiFont, fontSize: 32, fontWeight: 700,
      color, background: `${color}18`,
      border: `2px solid ${color}66`,
      borderRadius: 16, padding: "14px 32px",
      opacity: appear, transform: `scale(${sc})`,
      textAlign: "center" as const,
    };
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        {frame >= s && (
          <div style={{
            position: "absolute", top: "40%", left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={nodeStyle("#9cdcfe", rootAppear)}>제어문</div>

            <div style={{ position: "relative", width: 480, height: 50, flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 0,  left: "50%", width: 2, height: 26, background: "rgba(255,255,255,0.18)", transform: "translateX(-50%)" }} />
              <div style={{ position: "absolute", top: 26, left: "20%", width: "60%", height: 2, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", top: 26, left: "20%", width: 2, height: 24, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", top: 26, right: "20%", width: 2, height: 24, background: "rgba(255,255,255,0.18)" }} />
            </div>

            <div style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                <div style={nodeStyle(C_COND, leftAppear)}>조건문</div>
                <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.18)", opacity: ifAppear, flexShrink: 0 }} />
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{
                    fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 44, fontWeight: 900, color: C_COND,
                    background: `${C_COND}18`, border: `2px solid ${C_COND}55`,
                    borderRadius: 16, padding: "12px 36px",
                    opacity: ifAppear,
                    transform: `scale(${interpolate(ifAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}>if</div>
                  {frame >= split0 && (
                    <div style={{
                      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                      fontSize: 44, fontWeight: 900, color: C_SWITCH,
                      background: `${C_SWITCH}18`, border: `2px solid ${C_SWITCH}55`,
                      borderRadius: 16, padding: "12px 36px",
                      opacity: switchAppear,
                      transform: `scale(${interpolate(switchAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                      boxShadow: `0 0 28px ${C_SWITCH}44`,
                    }}>switch</div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 0 }}>
                <div style={nodeStyle(C_LOOP, rightAppear)}>반복문</div>
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
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

  const leftAppear  = spring({ frame: frame - s,      fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 26 });
  const rightAppear = spring({ frame: frame - split0, fps, config: { damping: 12, stiffness: 140 }, durationInFrames: 24 });

  const cardBase: React.CSSProperties = {
    fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 26, lineHeight: 1.9,
    background: "#252525", borderRadius: 16,
    padding: "28px 36px",
    flex: "1 1 0", minWidth: 0,
  };

  const dimSpan = (text: string) => (
    <span style={{ color: C_DIM }}>{text}</span>
  );

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", gap: 32, width: 980,
        }}>
          {/* 좌측: if-else 체인 (복잡, C_DIM 색) */}
          <div style={{ ...cardBase, opacity: leftAppear,
            transform: `scale(${interpolate(leftAppear, [0,1],[0.92,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})})`,
            border: "2px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontFamily: uiFont, fontSize: 20, color: C_DIM, marginBottom: 12 }}>if-else 체인</div>
            <div>{dimSpan('if (day.equals("MON")) {')}</div>
            <div style={{ paddingLeft: 28 }}>{dimSpan('msg = "월요일";')}</div>
            <div>{dimSpan('} else if (day.equals("TUE")) {')}</div>
            <div style={{ paddingLeft: 28 }}>{dimSpan('msg = "화요일";')}</div>
            <div>{dimSpan('} else if (day.equals("SAT")) {')}</div>
            <div style={{ paddingLeft: 28 }}>{dimSpan('msg = "토요일";')}</div>
            <div>{dimSpan('} // ...')}</div>
          </div>

          {/* 우측: switch 표현식 (간결, 밝은 색) — split0 기준 등장 */}
          <div style={{ ...cardBase, opacity: rightAppear,
            transform: `scale(${interpolate(rightAppear, [0,1],[0.92,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})})`,
            border: `2px solid ${C_SWITCH}44`,
            boxShadow: `0 0 24px ${C_SWITCH}22`,
          }}>
            <div style={{ fontFamily: uiFont, fontSize: 20, color: C_SWITCH, marginBottom: 12, fontWeight: 700 }}>switch 표현식</div>
            <div>
              <span style={{ color: C_SWITCH, fontWeight: 900 }}>switch</span>
              <span style={{ color: "#d4d4d4" }}> (day) {"{"}</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C_CASE }}>case</span>
              <span style={{ color: C_STR }}> "MON"</span>
              <span style={{ color: C_ARROW }}> {"->"}</span>
              <span style={{ color: C_RESULT }}> "월요일"</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C_CASE }}>case</span>
              <span style={{ color: C_STR }}> "SAT"</span>
              <span style={{ color: C_ARROW }}> {"->"}</span>
              <span style={{ color: C_RESULT }}> "토요일"</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C_DIM }}>// ...</span>
            </div>
            <div><span style={{ color: "#d4d4d4" }}>{"}"}</span></div>
          </div>
        </div>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
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
  const lineVisibility = SYNTAX_LINES.map(line => {
    const lineLen = line.parts.reduce((acc, p) => acc + p.text.length, 0);
    const show = Math.min(lineLen, remaining);
    remaining = Math.max(0, remaining - lineLen);
    return show;
  });

  const blockAppear = spring({ frame: frame - s, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 24 });
  const sc = interpolate(blockAppear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const arrowGlows = ARROW_CHAR_STARTS.map(charStart => {
    const glowFrame = s + Math.ceil(charStart / SYNTAX_CHARS_PER_SEC * fps);
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
        <Audio src={staticFile(cfg.audio)} />
        {frame >= s && (
          <div style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(-50%, -50%) scale(${sc})`,
          }}>
            <div style={{
              fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 32, lineHeight: 1.95,
              background: "#252525", borderRadius: 20,
              padding: "32px 48px",
              opacity: blockAppear,
              width: 900, boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              whiteSpace: "pre",
            }}>
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
                      const glow = isArrow && curArrowIdx < arrowGlows.length
                        ? arrowGlows[curArrowIdx]
                        : 0;
                      return (
                        <span key={pi} style={{
                          color: part.color,
                          fontWeight: (part as { bold?: boolean }).bold ? 900 : undefined,
                          textShadow: glow > 0.01
                            ? `0 0 ${interpolate(glow, [0,1], [0,16])}px ${C_ARROW}`
                            : undefined,
                        }}>
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
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── NoFallthroughScene ────────────────────────────────────────
const NoFallthroughScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { noFallthroughScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Math.floor(d / 2)] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const leftAppear  = spring({ frame: frame - s,      fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 26 });
  const rightAppear = spring({ frame: frame - split0, fps, config: { damping: 12, stiffness: 140 }, durationInFrames: 24 });

  const fallHeight = interpolate(frame, [s + 10, s + 30], [0, 40], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fallOpacity = interpolate(frame, [s + 10, s + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const panelBase: React.CSSProperties = {
    fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 26, lineHeight: 2.0,
    background: "#252525", borderRadius: 16,
    padding: "24px 32px",
    flex: "1 1 0", minWidth: 0,
  };

  const scLeft  = interpolate(leftAppear,  [0,1],[0.92,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const scRight = interpolate(rightAppear, [0,1],[0.92,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", gap: 32, width: 980, alignItems: "flex-start",
        }}>
          {/* 좌측: 전통 switch (break 미포함 케이스 → fall-through) */}
          <div style={{ ...panelBase, opacity: leftAppear, transform: `scale(${scLeft})`,
            border: `2px solid ${C_RED}44`,
          }}>
            <div style={{ fontFamily: uiFont, fontSize: 20, color: C_RED, marginBottom: 12, fontWeight: 700 }}>기존 switch</div>
            <div>
              <span style={{ color: C_CASE }}>case</span>
              <span style={{ color: C_STR }}> "MON"</span>
              <span style={{ color: "#d4d4d4" }}>:</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: "#dcdcaa" }}>println</span>
              <span style={{ color: "#d4d4d4" }}>("월요일");</span>
            </div>
            <div style={{
              height: fallHeight, opacity: fallOpacity,
              overflow: "hidden",
              display: "flex", alignItems: "center", paddingLeft: 28, gap: 8,
            }}>
              <span style={{ color: C_RED, fontSize: 20 }}>↓</span>
              <span style={{ fontFamily: uiFont, fontSize: 18, color: C_RED, fontWeight: 700 }}>다음 케이스 실행!</span>
            </div>
            <div>
              <span style={{ color: C_CASE }}>case</span>
              <span style={{ color: C_STR }}> "TUE"</span>
              <span style={{ color: "#d4d4d4" }}>:</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: "#dcdcaa" }}>println</span>
              <span style={{ color: "#d4d4d4" }}>("화요일");</span>
            </div>
            <div style={{ paddingLeft: 28 }}>
              <span style={{ color: C_CASE }}>break</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
          </div>

          {/* 우측: 모던 switch (독립 박스) — split0 기준 등장 */}
          <div style={{ ...panelBase, opacity: rightAppear, transform: `scale(${scRight})`,
            border: `2px solid ${C_ARROW}44`,
          }}>
            <div style={{ fontFamily: uiFont, fontSize: 20, color: C_ARROW, marginBottom: 12, fontWeight: 700 }}>모던 switch</div>
            <div style={{
              background: `${C_ARROW}10`, border: `1px solid ${C_ARROW}33`,
              borderRadius: 8, padding: "8px 16px", marginBottom: 8,
            }}>
              <span style={{ color: C_CASE }}>case</span>
              <span style={{ color: C_STR }}> "MON"</span>
              <span style={{ color: C_ARROW }}> {"->"}</span>
              <span style={{ color: C_RESULT }}> "월요일"</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
            <div style={{
              background: `${C_ARROW}10`, border: `1px solid ${C_ARROW}33`,
              borderRadius: 8, padding: "8px 16px",
            }}>
              <span style={{ color: C_CASE }}>case</span>
              <span style={{ color: C_STR }}> "TUE"</span>
              <span style={{ color: C_ARROW }}> {"->"}</span>
              <span style={{ color: C_RESULT }}> "화요일"</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── Composition 메타 ──────────────────────────────────────────
export const compositionMeta = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 (WIP: 씬 추가 중) ─────────────────────────
export const JavaSwitch: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={fromValues[0]} durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.overview.durationInFrames}>
      <OverviewScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.syntaxScene.durationInFrames}>
      <SyntaxScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.noFallthroughScene.durationInFrames}>
      <NoFallthroughScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaSwitch;
