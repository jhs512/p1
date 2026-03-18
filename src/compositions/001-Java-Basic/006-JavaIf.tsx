// src/compositions/001-Java-Basic/006-JavaIf.tsx
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RATE, VOICE } from "../../global.config";
import { AUDIO_CONFIG } from "./006-audio";
import { toDisplayText } from "../../utils/narration";

export { RATE, VOICE };

// ── 상수 ─────────────────────────────────────────────────────
const CROSS        = 20;
const MONO_NO_LIGA = '"calt" 0, "liga" 0' as const;

const C_CTRL  = "#c586c0"; // 제어 키워드 — if/else
const C_INT   = "#4e9cd5";
const C_NUM   = "#b5cea8";
const C_STR   = "#ce9178";
const C_CMP   = "#c586c0";
const C_TRUE  = "#4ec9b0";
const C_FALSE = "#f47c7c";

// ── 폰트 ─────────────────────────────────────────────────────
let monoFont = "JetBrains Mono, monospace";
let uiFont   = "Noto Sans KR, sans-serif";

if (typeof window !== "undefined") {
  const _jb = loadJetBrains("normal", { ignoreTooManyRequestsWarning: true });
  const _ns = loadNotoSans("normal", { ignoreTooManyRequestsWarning: true });
  monoFont = _jb.fontFamily;
  uiFont   = _ns.fontFamily;
  const _h = delayRender("Loading Google Fonts");
  Promise.all([_jb.waitUntilDone(), _ns.waitUntilDone()]).then(() =>
    continueRender(_h),
  );
}

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  intro: {
    audio: "if-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "조건문은 조건이 참일 때만 코드를 실행합니다.",
      "조건이 거짓일 때도 처리하려면 else를 사용합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  ifScene: {
    audio: "if-if.mp3",
    durationInFrames: AUDIO_CONFIG.ifScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.ifScene.speechStartFrame,
    narration: [
      "score가 60 이상이면 합격 메시지를 출력합니다.",
      "75는 60 이상이므로 조건이 참, 블록 안의 코드가 실행됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.ifScene.narrationSplits,
  },
  ifElseScene: {
    audio: "if-ifelse.mp3",
    durationInFrames: AUDIO_CONFIG.ifElseScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.ifElseScene.speechStartFrame,
    narration: [
      "else는 조건이 거짓일 때 실행되는 블록입니다.",
      "score가 45라면 조건이 거짓이므로 else 블록이 실행됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.ifElseScene.narrationSplits,
  },
  summaryScene: {
    audio: "if-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "if는 조건이 참일 때, else는 거짓일 때 실행됩니다.",
      "조건에 따라 서로 다른 코드를 실행할 수 있습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 컴포넌트: Subtitle ────────────────────────────────────────
const Subtitle: React.FC<{
  sentences: string[];
  splits?: readonly number[];
  speechStart?: number;
}> = ({ sentences, splits, speechStart = 0 }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  if (frame < speechStart) return null;
  const starts = [speechStart, ...(splits ?? [])];
  const idx = starts.reduce((acc, s, i) => (frame >= s ? i : acc), 0);
  return (
    <div style={{
      position: "absolute", bottom: 100, left: "50%",
      transform: "translateX(-50%)", textAlign: "center",
      fontFamily: uiFont, fontSize: 32, color: "#ffffff",
      background: "rgba(0,0,0,0.55)", borderRadius: 6,
      padding: "8px 16px", lineHeight: 1.6,
      width: "max-content", maxWidth: width - 20,
      wordBreak: "keep-all", whiteSpace: "pre-wrap",
    }}>
      {toDisplayText(sentences[idx])}
    </div>
  );
};

// ── 헬퍼: useFade ─────────────────────────────────────────────
function useFade(d: number, { out = true }: { out?: boolean } = {}) {
  const frame = useCurrentFrame();
  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = out ? interpolate(frame, [d - CROSS, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return fadeIn * fadeOut;
}

// ── 컴포넌트: CodeBlock — 실제 if-else 소스코드 시각화 ────────
//   activeBlock: "if"|"else" → 해당 분기 왼쪽 바 + 배경 하이라이트
//   showElse: false → if 블록만, true → if-else 전체
const CodeBlock: React.FC<{
  score: number;
  showElse: boolean;
  activeBlock: "if" | "else" | null;
  startFrame: number;
}> = ({ score, showElse, activeBlock, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: frame - startFrame, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 24 });
  const sc     = interpolate(appear, [0, 1], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const isTrue   = score >= 60;
  const condColor = isTrue ? C_TRUE : C_FALSE;

  const bodyStyle = (block: "if" | "else"): React.CSSProperties => {
    const isActive  = activeBlock === block;
    const isDimmed  = activeBlock !== null && !isActive;
    const barColor  = block === "if" ? C_TRUE : C_FALSE;
    return {
      paddingLeft: 40, paddingTop: 6, paddingBottom: 6,
      borderLeft: isActive ? `4px solid ${barColor}` : "4px solid transparent",
      background:  isActive ? `${barColor}18` : "transparent",
      borderRadius: isActive ? "0 8px 8px 0" : 0,
      opacity: isDimmed ? 0.28 : 1,
    };
  };

  return (
    <div style={{
      fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
      fontSize: 32, lineHeight: 1.95,
      background: "#252525", borderRadius: 20,
      padding: "32px 44px",
      opacity: appear, transform: `scale(${sc})`,
      width: 880, boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
    }}>
      {/* int score = 75; */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ color: C_INT }}>int</span>
        <span style={{ color: "#d4d4d4" }}> score = </span>
        <span style={{ color: isTrue ? C_NUM : C_FALSE }}>{score}</span>
        <span style={{ color: "#d4d4d4" }}>;</span>
      </div>

      {/* if (score >= 60) { */}
      <div>
        <span style={{ color: C_CTRL }}>if</span>
        <span style={{ color: "#d4d4d4" }}> (score </span>
        <span style={{ color: C_CMP }}>{">="}</span>
        <span style={{ color: "#d4d4d4" }}> </span>
        <span style={{ color: C_NUM }}>60</span>
        <span style={{ color: "#d4d4d4" }}>) {"{"}</span>
        {activeBlock !== null && (
          <span style={{ color: condColor, fontSize: 24, marginLeft: 16, opacity: 0.75 }}>
            {"// "}{isTrue ? "true ✓" : "false ✗"}
          </span>
        )}
      </div>

      {/* System.out.println("합격"); */}
      <div style={bodyStyle("if")}>
        <span style={{ color: C_INT }}>System</span>
        <span style={{ color: "#d4d4d4" }}>.out.</span>
        <span style={{ color: "#dcdcaa" }}>println</span>
        <span style={{ color: "#d4d4d4" }}>(</span>
        <span style={{ color: C_STR }}>"합격"</span>
        <span style={{ color: "#d4d4d4" }}>);</span>
      </div>

      {!showElse ? (
        <div><span style={{ color: "#d4d4d4" }}>{"}"}</span></div>
      ) : (
        <>
          {/* } else { */}
          <div>
            <span style={{ color: "#d4d4d4" }}>{"} "}</span>
            <span style={{ color: C_CTRL }}>else</span>
            <span style={{ color: "#d4d4d4" }}> {"{"}</span>
          </div>

          {/* System.out.println("불합격"); */}
          <div style={bodyStyle("else")}>
            <span style={{ color: C_INT }}>System</span>
            <span style={{ color: "#d4d4d4" }}>.out.</span>
            <span style={{ color: "#dcdcaa" }}>println</span>
            <span style={{ color: "#d4d4d4" }}>(</span>
            <span style={{ color: C_STR }}>"불합격"</span>
            <span style={{ color: "#d4d4d4" }}>);</span>
          </div>

          {/* } */}
          <div><span style={{ color: "#d4d4d4" }}>{"}"}</span></div>
        </>
      )}
    </div>
  );
};

// ── 씬: ThumbnailScene ────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0d1a", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
    <div style={{
      position: "absolute", width: 860, height: 860, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(197,134,192,0.10) 0%, transparent 70%)",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }} />
    <div style={{ fontFamily: uiFont, fontSize: 26, fontWeight: 700, color: C_CTRL, letterSpacing: 10, opacity: 0.8 }}>JAVA</div>
    <div style={{
      fontFamily: uiFont, fontSize: 108, fontWeight: 900, lineHeight: 1,
      textAlign: "center", color: "#fff",
      textShadow: `0 0 60px rgba(197,134,192,0.6), 0 0 120px rgba(197,134,192,0.25)`,
    }}>
      Java<br /><span style={{ color: C_CTRL }}>조건문</span>
    </div>
    {/* if / else 키워드 */}
    <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
      {["if", "else"].map((kw) => (
        <div key={kw} style={{
          fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
          fontSize: 56, fontWeight: 900, color: C_CTRL,
          background: `${C_CTRL}18`, border: `2px solid ${C_CTRL}55`,
          borderRadius: 18, padding: "18px 44px",
        }}>{kw}</div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── 씬: IntroScene ────────────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);

  const ifAppear = spring({ frame: frame - 0, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 28 });
  const elseAppear = spring({ frame: frame - 12, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 28 });

  const keyword = (text: string, appear: number) => {
    const sc = interpolate(appear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{
        fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
        fontSize: 64, fontWeight: 900, color: C_CTRL,
        background: `${C_CTRL}18`, border: `2px solid ${C_CTRL}55`,
        borderRadius: 20, padding: "20px 52px",
        opacity: appear, transform: `scale(${sc})`,
        boxShadow: `0 0 40px ${C_CTRL}22`,
      }}>{text}</div>
    );
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(intro.audio)} />
        {/* 조건 다이어그램 미리보기 */}
        <div style={{
          position: "absolute", top: "44%", left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          {/* 조건 박스 */}
          <div style={{
            fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
            fontSize: 32, color: "#888",
            background: "#2d2d2d", borderRadius: 12,
            padding: "14px 36px", border: "2px solid #333",
          }}>
            <span style={{ color: "#d4d4d4" }}>조건 </span>
            <span style={{ color: C_CMP }}>?</span>
          </div>
          {/* 두 갈래 */}
          <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: uiFont, fontSize: 20, color: C_TRUE, opacity: 0.8 }}>참</div>
              {keyword("if", ifAppear)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: uiFont, fontSize: 20, color: C_FALSE, opacity: 0.8 }}>거짓</div>
              {keyword("else", elseAppear)}
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Subtitle sentences={intro.narration} splits={intro.narrationSplits} speechStart={intro.speechStartFrame} />
    </>
  );
};

// ── 씬: IfScene ───────────────────────────────────────────────
const IfScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { ifScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {frame >= s && (
          <div style={{ position: "absolute", top: "46%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <CodeBlock
              score={75}
              showElse={false}
              activeBlock={frame >= split0 ? "if" : null}
              startFrame={s}
            />
          </div>
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── 씬: IfElseScene ───────────────────────────────────────────
const IfElseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { ifElseScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  // split0 이후: score 45, else 분기 활성
  const showFalse = frame >= split0;

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {frame >= s && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <CodeBlock
              score={showFalse ? 45 : 75}
              showElse={true}
              activeBlock={showFalse ? "else" : "if"}
              startFrame={s}
            />
          </div>
        )}
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} />
    </>
  );
};

// ── 씬: SummaryScene ─────────────────────────────────────────
const SUMMARY_ROWS = [
  { kw: "if",   color: C_TRUE,  desc: "조건이 참일 때 실행" },
  { kw: "else", color: C_FALSE, desc: "조건이 거짓일 때 실행" },
] as const;

const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { summaryScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", flexDirection: "column", gap: 24, width: 860,
        }}>
          {SUMMARY_ROWS.map((row, i) => {
            const appear = spring({ frame: frame - i * 12, fps, config: { damping: 13, stiffness: 140 }, durationInFrames: 26 });
            const sc     = interpolate(appear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 28,
                background: "#2a2a2a", border: `2px solid ${row.color}55`,
                borderRadius: 20, padding: "26px 40px",
                opacity: appear, transform: `scale(${sc})`,
              }}>
                <span style={{
                  fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                  color: C_CTRL, fontSize: 46, fontWeight: 900, minWidth: 100,
                }}>{row.kw}</span>
                <span style={{ color: "#3a3a3a", fontSize: 28 }}>—</span>
                <span style={{ fontFamily: uiFont, fontSize: 32, color: "#d4d4d4" }}>{row.desc}</span>
              </div>
            );
          })}

          {/* 코드 미리보기 */}
          {(() => {
            const appear = spring({ frame: frame - 24, fps, config: { damping: 13, stiffness: 130 }, durationInFrames: 26 });
            const sc = interpolate(appear, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div style={{
                background: "#252525", borderRadius: 16,
                padding: "24px 36px", marginTop: 8,
                fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                fontSize: 26, lineHeight: 1.85,
                opacity: appear, transform: `scale(${sc})`,
              }}>
                <div><span style={{ color: C_CTRL }}>if</span><span style={{ color: "#d4d4d4" }}> (score </span><span style={{ color: C_CMP }}>{'>='}  </span><span style={{ color: C_NUM }}>60</span><span style={{ color: "#d4d4d4" }}>) {"{"}</span></div>
                <div style={{ paddingLeft: 32 }}><span style={{ color: "#dcdcaa" }}>println</span><span style={{ color: "#d4d4d4" }}>(</span><span style={{ color: C_STR }}>"합격"</span><span style={{ color: "#d4d4d4" }}>);</span></div>
                <div><span style={{ color: "#d4d4d4" }}>{"}"} </span><span style={{ color: C_CTRL }}>else</span><span style={{ color: "#d4d4d4" }}> {"{"}</span></div>
                <div style={{ paddingLeft: 32 }}><span style={{ color: "#dcdcaa" }}>println</span><span style={{ color: "#d4d4d4" }}>(</span><span style={{ color: C_STR }}>"불합격"</span><span style={{ color: "#d4d4d4" }}>);</span></div>
                <div><span style={{ color: "#d4d4d4" }}>{"}"}</span></div>
              </div>
            );
          })()}
        </div>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} />
    </>
  );
};

// ── 씬 목록 + fromValues ──────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.ifScene,
  VIDEO_CONFIG.ifElseScene,
  VIDEO_CONFIG.summaryScene,
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;

// ── Composition 메타 ──────────────────────────────────────────
export const compositionMeta = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaIf: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={fromValues[0]} durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.ifScene.durationInFrames}>
      <IfScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.ifElseScene.durationInFrames}>
      <IfElseScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaIf;
