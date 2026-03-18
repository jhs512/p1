// src/compositions/001-Java-Basic/005-JavaLogical.tsx
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
import { AUDIO_CONFIG } from "./005-audio";
import {
  CROSS,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  uiFont,
  useFade,
} from "../../utils/scene";

export { RATE, VOICE };

// ── 상수 ─────────────────────────────────────────────────────
const C_LOG = "#e5c07b"; // 논리 연산자 — 골든
const C_TRUE = "#4ec9b0"; // true  → 틸
const C_FALSE = "#f47c7c"; // false → 붉은
const C_BOOL = "#d4834e"; // boolean 키워드

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  intro: {
    audio: "lgc-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "논리 연산자는 조건들을 연결하거나 뒤집는 연산자입니다.",
      "[&&(발음:AND)], [||(발음:OR)], [!(발음:NOT)], 세 가지를 알아봅니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  andScene: {
    audio: "lgc-and.mp3",
    durationInFrames: AUDIO_CONFIG.andScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.andScene.speechStartFrame,
    narration: [
      "AND 연산자입니다. x가 [true(발음:트루)]여도 y가 [false(발음:폴스)]면 결과는 [false(발음:폴스)]입니다.",
      "두 조건이 모두 [true(발음:트루)]여야 비로소 [true(발음:트루)]가 됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.andScene.narrationSplits,
  },
  orScene: {
    audio: "lgc-or.mp3",
    durationInFrames: AUDIO_CONFIG.orScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.orScene.speechStartFrame,
    narration: [
      "OR 연산자입니다. x가 [true(발음:트루)]이므로 x || y는 [true(발음:트루)]입니다.",
      "하나라도 [true(발음:트루)]면 [true(발음:트루)], 둘 다 [false(발음:폴스)]여야 [false(발음:폴스)]가 됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.orScene.narrationSplits,
  },
  notScene: {
    audio: "lgc-not.mp3",
    durationInFrames: AUDIO_CONFIG.notScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.notScene.speechStartFrame,
    narration: [
      "NOT 연산자는 참을 거짓으로, 거짓을 참으로 뒤집습니다.",
      "[!true(발음:낫 트루)]는 [false(발음:폴스)], [!false(발음:낫 폴스)]는 [true(발음:트루)]입니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.notScene.narrationSplits,
  },
  summaryScene: {
    audio: "lgc-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "세 가지 논리 연산자를 정리했습니다.",
      "[&&(발음:AND)]는 모두 참, [||(발음:OR)]는 하나라도 참, [!(발음:NOT)]은 반전입니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 컴포넌트: BoolPill ────────────────────────────────────────
const BoolPill: React.FC<{ value: boolean; size?: number }> = ({
  value,
  size = 52,
}) => {
  const color = value ? C_TRUE : C_FALSE;
  return (
    <span
      style={{
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
        fontSize: size,
        fontWeight: 700,
        color,
        background: `${color}22`,
        border: `2px solid ${color}88`,
        borderRadius: 12,
        padding: "6px 22px",
        display: "inline-block",
      }}
    >
      {value ? "true" : "false"}
    </span>
  );
};

// ── 컴포넌트: EvalRow (A OP B = result) ──────────────────────
//   AND/OR 용: [left] [op] [right] → [result]
//   NOT 용:   prefixOp="!" → [!left] → [result]
const EvalRow: React.FC<{
  left: boolean;
  op: string;
  right?: boolean;
  result: boolean;
  startFrame: number;
  dim?: boolean;
  prefixOp?: string; // NOT 연산자용: op를 left pill 앞에 붙임
}> = ({ left, op, right, result, startFrame, dim = false, prefixOp }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 22,
  });
  const sc = interpolate(appear, [0, 1], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resultApp = spring({
    frame: frame - startFrame - 15,
    fps,
    config: { damping: 11, stiffness: 120 },
    durationInFrames: 20,
  });
  const resultSc = interpolate(resultApp, [0, 1], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rowOpacity = dim
    ? 0.38
    : interpolate(appear, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const opStyle: React.CSSProperties = {
    fontFamily: monoFont,
    fontFeatureSettings: MONO_NO_LIGA,
    fontSize: 56,
    fontWeight: 900,
    color: C_LOG,
    textShadow: `0 0 24px ${C_LOG}66`,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        opacity: rowOpacity,
        transform: `scale(${sc})`,
      }}
    >
      {prefixOp ? (
        /* NOT: !를 pill 앞에 붙여서 하나처럼 표시 */
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={opStyle}>{prefixOp}</span>
          <BoolPill value={left} />
        </div>
      ) : (
        /* AND / OR */
        <>
          <BoolPill value={left} />
          <span style={opStyle}>{op}</span>
          {right !== undefined && <BoolPill value={right} />}
        </>
      )}

      {/* 화살표 + 결과 */}
      {frame >= startFrame + 15 && (
        <>
          <span
            style={{
              fontSize: 40,
              color: "#444",
              transform: `scale(${resultSc})`,
            }}
          >
            →
          </span>
          <div style={{ transform: `scale(${resultSc})` }}>
            <BoolPill value={result} size={56} />
          </div>
        </>
      )}
    </div>
  );
};

// ── 씬: ThumbnailScene ────────────────────────────────────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#0d0d1a",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 28,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 860,
        height: 860,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(229,192,123,0.10) 0%, transparent 70%)",
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
        color: C_LOG,
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
        textShadow: `0 0 60px rgba(229,192,123,0.6), 0 0 120px rgba(229,192,123,0.25)`,
      }}
    >
      Java
      <br />
      <span style={{ color: C_LOG }}>논리 연산자</span>
    </div>
    {/* 세 연산자 */}
    <div
      style={{
        display: "flex",
        gap: 32,
        marginTop: 12,
        fontFamily: monoFont,
        fontFeatureSettings: MONO_NO_LIGA,
      }}
    >
      {[
        ["&&", "AND"],
        ["||", "OR"],
        ["!", "NOT"],
      ].map(([op, label]) => (
        <div
          key={op}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            background: `${C_LOG}18`,
            border: `2px solid ${C_LOG}55`,
            borderRadius: 20,
            padding: "22px 36px",
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 900, color: C_LOG }}>
            {op}
          </span>
          <span
            style={{
              fontFamily: uiFont,
              fontSize: 22,
              color: C_LOG,
              opacity: 0.7,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── 씬: IntroScene ────────────────────────────────────────────
const INTRO_OPS = ["&&", "||", "!"];

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro } = VIDEO_CONFIG;
  const opacity = useFade(intro.durationInFrames);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(intro.audio)} />
        <div
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          {INTRO_OPS.map((op, i) => {
            const appear = spring({
              frame: frame - i * 8,
              fps,
              config: { damping: 13, stiffness: 140 },
              durationInFrames: 30,
            });
            const sc = interpolate(appear, [0, 1], [0.3, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={op}
                style={{
                  width: i === 2 ? 140 : 200,
                  height: 200,
                  borderRadius: 28,
                  border: `3px solid ${C_LOG}88`,
                  background: `${C_LOG}18`,
                  boxShadow: `0 0 36px ${C_LOG}22`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transform: `scale(${sc})`,
                  opacity: appear,
                }}
              >
                <span
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    fontSize: 64,
                    fontWeight: 700,
                    color: C_LOG,
                  }}
                >
                  {op}
                </span>
                <span
                  style={{
                    fontFamily: uiFont,
                    fontSize: 22,
                    color: C_LOG,
                    opacity: 0.7,
                  }}
                >
                  {op === "&&" ? "AND" : op === "||" ? "OR" : "NOT"}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Subtitle
        sentences={intro.narration}
        splits={intro.narrationSplits}
        speechStart={intro.speechStartFrame}
      />
    </>
  );
};

// ── 씬: AndScene ─────────────────────────────────────────────
const AndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { andScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {/* 헤더 */}
        {frame >= s && (
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 36,
              opacity: 0.5,
              color: "#d4d4d4",
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            <div>
              <span style={{ color: C_BOOL }}>boolean</span>
              <span style={{ color: "#d4d4d4" }}> x = </span>
              <span style={{ color: C_TRUE }}>true</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
            <div>
              <span style={{ color: C_BOOL }}>boolean</span>
              <span style={{ color: "#d4d4d4" }}> y = </span>
              <span style={{ color: C_FALSE }}>false</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
          </div>
        )}

        {/* 케이스 1: true && false → false */}
        {frame >= s && (
          <div
            style={{
              position: "absolute",
              top: "44%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <EvalRow
              left={true}
              op="&&"
              right={false}
              result={false}
              startFrame={s}
              dim={frame >= split0}
            />
          </div>
        )}

        {/* 케이스 2: true && true → true */}
        {frame >= split0 && (
          <div
            style={{
              position: "absolute",
              top: "64%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <EvalRow
              left={true}
              op="&&"
              right={true}
              result={true}
              startFrame={split0}
            />
          </div>
        )}
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── 씬: OrScene ──────────────────────────────────────────────
const OrScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { orScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {/* 헤더: 변수 선언 (두 줄) */}
        {frame >= s && (
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 36,
              opacity: 0.5,
              color: "#d4d4d4",
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            <div>
              <span style={{ color: C_BOOL }}>boolean</span>
              <span style={{ color: "#d4d4d4" }}> x = </span>
              <span style={{ color: C_TRUE }}>true</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
            <div>
              <span style={{ color: C_BOOL }}>boolean</span>
              <span style={{ color: "#d4d4d4" }}> y = </span>
              <span style={{ color: C_FALSE }}>false</span>
              <span style={{ color: "#d4d4d4" }}>;</span>
            </div>
          </div>
        )}

        {/* 식 레이블: x || y → true */}
        {frame >= s && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: monoFont,
              fontFeatureSettings: MONO_NO_LIGA,
              fontSize: 34,
              color: "#aaaaaa",
            }}
          >
            <span style={{ color: "#d4d4d4" }}>x </span>
            <span style={{ color: C_LOG }}>||</span>
            <span style={{ color: "#d4d4d4" }}> y</span>
            <span style={{ color: "#555" }}> → </span>
            <span style={{ color: C_TRUE }}>true</span>
          </div>
        )}

        {/* 케이스 1: true || false → true */}
        {frame >= s && (
          <div
            style={{
              position: "absolute",
              top: "54%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <EvalRow
              left={true}
              op="||"
              right={false}
              result={true}
              startFrame={s}
              dim={frame >= split0}
            />
          </div>
        )}

        {/* 케이스 2: false || false → false */}
        {frame >= split0 && (
          <div
            style={{
              position: "absolute",
              top: "72%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <EvalRow
              left={false}
              op="||"
              right={false}
              result={false}
              startFrame={split0}
            />
          </div>
        )}
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── 씬: NotScene ─────────────────────────────────────────────
const NotScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { notScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const s = cfg.speechStartFrame;
  const [split0] = cfg.narrationSplits as readonly number[];
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#1e1e1e", opacity }}>
        <Audio src={staticFile(cfg.audio)} />

        {/* !true → false */}
        {frame >= s && (
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <EvalRow
              left={true}
              op="!"
              result={false}
              startFrame={s}
              dim={frame >= split0}
              prefixOp="!"
            />
          </div>
        )}

        {/* !false → true */}
        {frame >= split0 && (
          <div
            style={{
              position: "absolute",
              top: "62%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <EvalRow
              left={false}
              op="!"
              result={true}
              startFrame={split0}
              prefixOp="!"
            />
          </div>
        )}
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={s}
      />
    </>
  );
};

// ── 씬: SummaryScene ─────────────────────────────────────────
const SUMMARY_ROWS = [
  { op: "&&", label: "AND", desc: "모두 true여야 true" },
  { op: "||", label: "OR", desc: "하나라도 true면 true" },
  { op: "!", label: "NOT", desc: "true ↔ false 반전" },
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
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            width: 900,
          }}
        >
          {SUMMARY_ROWS.map((row, i) => {
            const appear = spring({
              frame: frame - i * 10,
              fps,
              config: { damping: 13, stiffness: 140 },
              durationInFrames: 26,
            });
            const sc = interpolate(appear, [0, 1], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  background: "#2a2a2a",
                  border: `2px solid ${C_LOG}44`,
                  borderRadius: 20,
                  padding: "24px 36px",
                  opacity: appear,
                  transform: `scale(${sc})`,
                }}
              >
                <span
                  style={{
                    fontFamily: monoFont,
                    fontFeatureSettings: MONO_NO_LIGA,
                    color: C_LOG,
                    fontSize: 44,
                    fontWeight: 900,
                    minWidth: 72,
                    textAlign: "center",
                  }}
                >
                  {row.op}
                </span>
                <span
                  style={{
                    fontFamily: uiFont,
                    fontSize: 22,
                    color: C_LOG,
                    opacity: 0.65,
                    minWidth: 54,
                  }}
                >
                  {row.label}
                </span>
                <span style={{ color: "#555", fontSize: 28 }}>—</span>
                <span
                  style={{
                    fontFamily: uiFont,
                    fontSize: 30,
                    color: "#d4d4d4",
                  }}
                >
                  {row.desc}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
      />
    </>
  );
};

// ── 씬 목록 + fromValues ──────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.andScene,
  VIDEO_CONFIG.orScene,
  VIDEO_CONFIG.notScene,
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
export const JavaLogical: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence
      from={fromValues[0]}
      durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}
    >
      <ThumbnailScene />
    </Sequence>
    <Sequence
      from={fromValues[1]}
      durationInFrames={VIDEO_CONFIG.intro.durationInFrames}
    >
      <IntroScene />
    </Sequence>
    <Sequence
      from={fromValues[2]}
      durationInFrames={VIDEO_CONFIG.andScene.durationInFrames}
    >
      <AndScene />
    </Sequence>
    <Sequence
      from={fromValues[3]}
      durationInFrames={VIDEO_CONFIG.orScene.durationInFrames}
    >
      <OrScene />
    </Sequence>
    <Sequence
      from={fromValues[4]}
      durationInFrames={VIDEO_CONFIG.notScene.durationInFrames}
    >
      <NotScene />
    </Sequence>
    <Sequence
      from={fromValues[5]}
      durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}
    >
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaLogical;
