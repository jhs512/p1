// src/compositions/001-Java-Basic/006-JavaIf.tsx
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
import { RATE, VOICE } from "../../global.config";
import { AUDIO_CONFIG } from "./006-audio";
import { SERIES_WIDTH, SERIES_HEIGHT, SERIES_FPS } from "./series.config";
import { toDisplayText } from "../../utils/narration";
import {
  CROSS,
  ContentArea,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../utils/scene";

export { RATE, VOICE };

// ── 상수 ─────────────────────────────────────────────────────
const C_CTRL  = "#c586c0"; // 제어 키워드 — if/else
const C_INT   = "#4e9cd5";
const C_NUM   = "#b5cea8";
const C_STR   = "#ce9178";
const C_CMP   = "#c586c0";
const C_TRUE  = "#4ec9b0";
const C_FALSE = "#f47c7c";

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  overview: {
    audio: "if-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: [
      "제어문에는 조건문과 반복문이 있습니다.",
      "조건문 중에 기본인 if 문을 알아보겠습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "if-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "조건문은 조건이 참일 때만 코드를 실행합니다.",
      "조건이 거짓일 때도 처리하려면\nelse를 사용합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  ifScene: {
    audio: "if-if.mp3",
    durationInFrames: AUDIO_CONFIG.ifScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.ifScene.speechStartFrame,
    narration: [
      "score가 60 이상이면 합격 메시지를 출력합니다.",
      "75는 60 이상이므로 조건이 참,\n블록 안의 코드가 실행됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.ifScene.narrationSplits,
  },
  ifElseScene: {
    audio: "if-ifelse.mp3",
    durationInFrames: AUDIO_CONFIG.ifElseScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.ifElseScene.speechStartFrame,
    narration: [
      "else는 조건이 거짓일 때 실행되는 블록입니다.",
      "score가 45라면 조건이 거짓이므로\nelse 블록이 실행됩니다.",
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

// ── 씬: OverviewScene — 제어문 개요 ──────────────────────────
//   Sentence 1: 제어문 트리 (조건문 / 반복문)
//   Sentence 2: 조건문 하이라이트 + if 키워드 강조
const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { overview: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0 = Infinity] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  const phase2 = frame >= split0;

  // 등장 애니메이션
  const rootAppear  = spring({ frame: frame - s,      fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const leftAppear  = spring({ frame: frame - s - 10, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const rightAppear = spring({ frame: frame - s - 20, fps, config: { damping: 12, stiffness: 130 }, durationInFrames: 24 });
  const ifAppear    = spring({ frame: frame - split0,  fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 22 });

  const C_COND = "#c586c0"; // 조건문 색
  const C_LOOP = "#4ec9b0"; // 반복문 색
  const C_DIM  = "rgba(255,255,255,0.22)";

  const nodeStyle = (color: string, active: boolean, appear: number): React.CSSProperties => {
    const sc = interpolate(appear, [0, 1], [0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      fontFamily: uiFont, fontSize: 34, fontWeight: 700,
      color: active ? color : C_DIM,
      background: active ? `${color}18` : "rgba(255,255,255,0.04)",
      border: `2px solid ${active ? color + "66" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 16, padding: "16px 36px",
      opacity: appear, transform: `scale(${sc})`,
      textAlign: "center" as const,
    };
  };

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          {frame >= s && (
            <div style={{
              position: "absolute", top: "40%", left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              {/* 제어문 루트 */}
              <div style={nodeStyle("#9cdcfe", true, rootAppear)}>제어문</div>

              {/* 연결선 — 고정 높이로 겹침 방지 */}
              <div style={{ position: "relative", width: 440, height: 50, flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 0,  left: "50%", width: 2, height: 26, background: "rgba(255,255,255,0.18)", transform: "translateX(-50%)" }} />
                <div style={{ position: "absolute", top: 26, left: "20%", width: "60%", height: 2, background: "rgba(255,255,255,0.18)" }} />
                <div style={{ position: "absolute", top: 26, left: "20%", width: 2, height: 24, background: "rgba(255,255,255,0.18)" }} />
                <div style={{ position: "absolute", top: 26, right: "20%", width: 2, height: 24, background: "rgba(255,255,255,0.18)" }} />
              </div>

              {/* 조건문 / 반복문 */}
              <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
                {/* 조건문 + if */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={nodeStyle(C_COND, true, leftAppear)}>조건문</div>
                  {/* phase 2: if 키워드 */}
                  {phase2 && (
                    <>
                      <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.18)", opacity: ifAppear, flexShrink: 0 }} />
                      <div style={{
                        fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
                        fontSize: 52, fontWeight: 900, color: C_CTRL,
                        background: `${C_CTRL}18`, border: `2px solid ${C_CTRL}55`,
                        borderRadius: 18, padding: "14px 44px",
                        opacity: ifAppear,
                        transform: `scale(${interpolate(ifAppear, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                        boxShadow: `0 0 32px ${C_CTRL}33`,
                      }}>if</div>
                    </>
                  )}
                </div>
                {/* 반복문 */}
                <div style={nodeStyle(C_LOOP, !phase2, rightAppear)}>반복문</div>
              </div>
            </div>
          )}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} wordFrames={AUDIO_CONFIG.overview.wordStartFrames} />
    </>
  );
};

// ── 씬: ThumbnailScene ────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#050510", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
    <div style={{
      position: "absolute", width: 860, height: 860, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(78,201,176,0.12) 0%, transparent 70%)",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    }} />
    <div style={{ fontFamily: uiFont, fontSize: 26, fontWeight: 700, color: "#4ec9b0", letterSpacing: 10, opacity: 0.8 }}>JAVA</div>
    <div style={{
      fontFamily: uiFont, fontSize: 108, fontWeight: 900, lineHeight: 1,
      textAlign: "center", color: "#fff",
      textShadow: "0 0 60px rgba(78,201,176,0.6), 0 0 120px rgba(78,201,176,0.3)",
    }}>
      Java<br /><span style={{ color: "#4ec9b0" }}>조건문</span>
    </div>
    {/* if / else 키워드 */}
    <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
      {["if", "else"].map((kw) => (
        <div key={kw} style={{
          fontFamily: monoFont, fontFeatureSettings: MONO_NO_LIGA,
          fontSize: 56, fontWeight: 900, color: "#4ec9b0",
          background: "#4ec9b018", border: "2px solid #4ec9b055",
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
        <ContentArea>
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
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={intro.narration} splits={intro.narrationSplits} speechStart={intro.speechStartFrame} wordFrames={AUDIO_CONFIG.intro.wordStartFrames} />
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
        <ContentArea>
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
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} wordFrames={AUDIO_CONFIG.ifScene.wordStartFrames} />
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
        <ContentArea>
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
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={s} wordFrames={AUDIO_CONFIG.ifElseScene.wordStartFrames} />
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
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />

          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column", gap: 24, width: 860,
          }}>
            {SUMMARY_ROWS.map((row, i) => {
              // if(idx 0→frame 2), else(idx 4→frame 50) 발화 시점 기준
              const kwWordIndices = [0, 4] as const;
              const triggerFrame = AUDIO_CONFIG.summaryScene.wordStartFrames[0][kwWordIndices[i]] ?? i * 12;
              const appear = spring({ frame: frame - triggerFrame, fps, config: { damping: 13, stiffness: 140 }, durationInFrames: 26 });
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
        </ContentArea>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG.summaryScene.wordStartFrames} />
    </>
  );
};

// ── 씬 목록 + fromValues ──────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.overview,
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

// ── SRT 데이터 (scripts/srt.ts 에서 사용) ────────────────────
/** 절대 프레임 기준 자막 큐 목록 — srt.ts가 읽어서 .srt 파일 생성 */
export const SRT_DATA: Array<{ startFrame: number; endFrame: number; text: string }> = (() => {
  const CROSS_VAL = 20;
  const entries: Array<{ startFrame: number; endFrame: number; text: string }> = [];

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

  // fromValues 재계산
  const sceneDurations = sceneList.map((s) => s.durationInFrames);
  const froms: number[] = [];
  let _f = 0;
  for (let i = 0; i < sceneDurations.length; i++) {
    froms.push(_f);
    _f += sceneDurations[i] - (i < sceneDurations.length - 1 ? CROSS_VAL : 0);
  }

  // [0]=thumbnail: 나레이션 없음
  // [1]=overview
  addScene(froms[1], VIDEO_CONFIG.overview.narration, AUDIO_CONFIG.overview.speechStartFrame,
    AUDIO_CONFIG.overview.narrationSplits, AUDIO_CONFIG.overview.sentenceEndFrames,
    VIDEO_CONFIG.overview.durationInFrames);
  // [2]=intro
  addScene(froms[2], VIDEO_CONFIG.intro.narration, AUDIO_CONFIG.intro.speechStartFrame,
    AUDIO_CONFIG.intro.narrationSplits, AUDIO_CONFIG.intro.sentenceEndFrames,
    VIDEO_CONFIG.intro.durationInFrames);
  // [3]=ifScene
  addScene(froms[3], VIDEO_CONFIG.ifScene.narration, AUDIO_CONFIG.ifScene.speechStartFrame,
    AUDIO_CONFIG.ifScene.narrationSplits, AUDIO_CONFIG.ifScene.sentenceEndFrames,
    VIDEO_CONFIG.ifScene.durationInFrames);
  // [4]=ifElseScene
  addScene(froms[4], VIDEO_CONFIG.ifElseScene.narration, AUDIO_CONFIG.ifElseScene.speechStartFrame,
    AUDIO_CONFIG.ifElseScene.narrationSplits, AUDIO_CONFIG.ifElseScene.sentenceEndFrames,
    VIDEO_CONFIG.ifElseScene.durationInFrames);
  // [5]=summaryScene
  addScene(froms[5], VIDEO_CONFIG.summaryScene.narration, AUDIO_CONFIG.summaryScene.speechStartFrame,
    AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
    VIDEO_CONFIG.summaryScene.durationInFrames);

  return entries;
})();

// ── Composition 메타 ──────────────────────────────────────────
export const compositionMeta = {
  fps: SERIES_FPS,
  width: SERIES_WIDTH,
  height: SERIES_HEIGHT,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaIf: React.FC = () => (
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
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.ifScene.durationInFrames}>
      <IfScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.ifElseScene.durationInFrames}>
      <IfElseScene />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaIf;
