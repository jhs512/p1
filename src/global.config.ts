// ─────────────────────────────────────────────────────────────
// global.config.ts  —  모든 영상에 공통으로 적용되는 전역 설정
// ─────────────────────────────────────────────────────────────

/** TTS 음성 */
export const VOICE = "ko-KR-HyunsuMultilingualNeural";

/** TTS 속도: +0% 기본, +20% 빠름, +40% 매우 빠름 */
export const RATE = "+30%";

/**
 * 음성이 끝난 후 장면이 추가로 유지되는 프레임 수 (fps=30 기준)
 * 30 = 1초 (페이드아웃 10프레임 + 자막 잔류 20프레임)
 */
export const SCENE_TAIL_FRAMES = 15;

/**
 * 자막 단어 하이라이팅 — 한 번에 최대 몇 단어까지 노란색으로 표시할지
 * 1 = 단어 1개씩, 2 = 최대 2개, 3 = 최대 3개
 */
export const HIGHLIGHT_MIN_WORDS = 3;
export const HIGHLIGHT_MAX_WORDS = 3;

/**
 * 자막 단어 하이라이팅 — 이 음절 수(유니코드 글자 수) 이하인 단어는
 * 다음 단어도 함께 하이라이팅 (그 단어도 임계값 이하면 한 번 더 확장)
 */
export const HIGHLIGHT_SYLLABLE_THRESHOLD = 5;

