// ── src/utils/scene.tsx ───────────────────────────────────────
// 모든 씬 파일이 공유하는 상수 · 훅 · 컴포넌트
// ─────────────────────────────────────────────────────────────

import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansKR";
import React from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { toDisplayText } from "./narration";

// ── 폰트 ─────────────────────────────────────────────────────
export let monoFont = "JetBrains Mono, monospace";
export let uiFont   = "Noto Sans KR, sans-serif";

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

// ── 상수 ─────────────────────────────────────────────────────

/** JetBrains Mono 리가처 비활성화 — !=, ==, >= 가 합자로 변환되는 것을 막는다 */
export const MONO_NO_LIGA = '"calt" 0, "liga" 0' as const;

/** 씬 간 크로스페이드 프레임 수 */
export const CROSS = 20;

/** 타이핑 이펙트 — 초당 글자 수 */
export const CHARS_PER_SEC = 10;

// ── 훅: useFade ───────────────────────────────────────────────
/**
 * 씬 경계 크로스페이드 opacity 값을 반환한다.
 * @param d 씬의 durationInFrames
 * @param out false → fadeOut 없이 fadeIn만 (마지막 씬에 사용)
 */
export function useFade(d: number, { out = true }: { out?: boolean } = {}) {
  const frame = useCurrentFrame();
  const fadeIn  = interpolate(frame, [0, CROSS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = out
    ? interpolate(frame, [d - CROSS, d], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  return fadeIn * fadeOut;
}

// ── 상수: 자막 영역 ───────────────────────────────────────────
/** 자막(bottom:10) + 자막 높이(~65px). ContentArea의 하단 여백으로 사용. */
export const SUBTITLE_DEAD_ZONE = 75;

// ── 컴포넌트: ContentArea ─────────────────────────────────────
/**
 * 자막 영역을 제외한 콘텐츠 전용 컨테이너.
 * 이 안의 position:absolute 요소들은 자막 위 공간을 기준으로 배치된다.
 * → 화면 수직 중앙이 자막 위 공간의 중앙과 일치하게 된다.
 * Thumbnail/Overview 씬(flex centering 사용)에는 사용하지 않는다.
 */
export const ContentArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height - SUBTITLE_DEAD_ZONE,
      }}
    >
      {children}
    </div>
  );
};

// ── 컴포넌트: Subtitle ────────────────────────────────────────
/**
 * 씬 하단 자막.
 * - `speechStart` 프레임 전에는 숨김
 * - `splits` 기준으로 문장 전환
 * - `wordFrames` 전달 시 현재 발화 단어 노란색 하이라이팅
 */
export const Subtitle: React.FC<{
  sentences: string[];
  splits?: readonly number[];
  speechStart?: number;
  wordFrames?: readonly (readonly number[])[];
}> = ({ sentences, splits, speechStart = 0, wordFrames }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  if (frame < speechStart) return null;

  const starts = [speechStart, ...(splits ?? [])];
  const idx = starts.reduce((acc, s, i) => (frame >= s ? i : acc), 0);
  const displayText = toDisplayText(sentences[idx]);
  const currentWordFrames = wordFrames?.[idx];

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    fontFamily: uiFont,
    fontSize: 36,
    color: "#ffffff",
    background: "rgba(0,0,0,0.55)",
    borderRadius: 6,
    padding: "8px 16px",
    lineHeight: 1.6,
    width: "max-content",
    maxWidth: width - 20,
    wordBreak: "keep-all",
    whiteSpace: "pre-wrap",
  };

  // wordFrames 없으면 기존 방식
  if (!currentWordFrames || currentWordFrames.length === 0) {
    return <div style={containerStyle}>{displayText}</div>;
  }

  // 현재 발화 중인 단어 인덱스
  const currentWordIdx = currentWordFrames.reduce(
    (acc, f, i) => (frame >= f ? i : acc), -1
  );

  // 공백/줄바꿈 토큰 보존하며 분리
  const tokens = displayText.split(/(\s+)/);

  let wordIdx = 0;
  return (
    <div style={containerStyle}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        const thisWordIdx = wordIdx++;
        return (
          <span
            key={i}
            style={{ color: thisWordIdx === currentWordIdx ? "#fbbf24" : "#ffffff" }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
};
