// src/compositions/001-Java-Basic/config.ts — 001 강좌 + 언어(KOR) 설정
import { PRONUNCIATION as ROOT_PRON } from "../../config";

// ── 영상 크기 ────────────────────────────────────────────────
export const WIDTH  = 1080;
export const HEIGHT = 1680;

// ── TTS 언어 설정 (KOR) ──────────────────────────────────────
export const VOICE = "ko-KR-HyunsuMultilingualNeural";
export const RATE  = "+30%";

// ── 강좌 발음맵 (루트 상속 + Java 전용 override) ─────────────
export const PRONUNCIATION: Record<string, string> = {
  ...ROOT_PRON,
  // Java 전용 추가 발음이 생기면 여기에
};
