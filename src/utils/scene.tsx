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

// ── 컴포넌트: Subtitle ────────────────────────────────────────
/**
 * 씬 하단 자막.
 * - `speechStart` 프레임 전에는 숨김
 * - `splits` 기준으로 문장 전환
 */
export const Subtitle: React.FC<{
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
    <div
      style={{
        position: "absolute",
        bottom: 220,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        fontFamily: uiFont,
        fontSize: 32,
        color: "#ffffff",
        background: "rgba(0,0,0,0.55)",
        borderRadius: 6,
        padding: "8px 16px",
        lineHeight: 1.6,
        width: "max-content",
        maxWidth: width - 20,
        wordBreak: "keep-all",
        whiteSpace: "pre-wrap",
      }}
    >
      {toDisplayText(sentences[idx])}
    </div>
  );
};
