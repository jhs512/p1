// src/compositions/003-RGB-Method/KOR/config.ts — KOR 언어 레벨 설정
import { FPS as ROOT_FPS, PRONUNCIATION as ROOT_PRON } from "../../../config";

// ── 프레임레이트 (루트에서 상속) ─────────────────────────────
export const FPS = ROOT_FPS;

// ── 영상 크기 (4K 가로형) ──────────────────────────────────
export const WIDTH = 3840;
export const HEIGHT = 2160;

// ── TTS 언어 설정 ─────────────────────────────────────────────
export const VOICE = "ko-KR-HyunsuMultilingualNeural";
export const RATE = "+30%";

// ── 발음맵 (루트 상속 + RGB 전용 override) ───────────────────
export const PRONUNCIATION: Record<string, string> = {
  ...ROOT_PRON,
  RGB: "알지비",
  Guard: "가드",
  Build: "빌드",
  Rules: "룰즈",
  Rule: "룰",
  Red: "레드",
  Green: "그린",
  Blue: "블루",
  LLM: "엘엘엠",
  AI: "에이아이",
};
