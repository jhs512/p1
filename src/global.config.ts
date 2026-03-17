// ─────────────────────────────────────────────────────────────
// global.config.ts  —  모든 영상에 공통으로 적용되는 전역 설정
// ─────────────────────────────────────────────────────────────

/** TTS 음성 */
export const VOICE = "ko-KR-HyunsuMultilingualNeural";

/** TTS 속도: +0% 기본, +20% 빠름, +40% 매우 빠름 */
export const RATE = "+40%";

/**
 * 음성이 끝난 후 장면이 추가로 유지되는 프레임 수 (fps=30 기준)
 * 30 = 1초 (페이드아웃 10프레임 + 자막 잔류 20프레임)
 */
export const SCENE_TAIL_FRAMES = 15;

/**
 * 자막 표시 단어 → TTS 읽기 단어 (전역)
 * 예: "System.out.println" 은 자막엔 그대로, 음성은 "print line" 으로 읽음
 */
export const PRONUNCIATION: Record<string, string> = {
  "System.out.println": "print line",
  "int": "int",
  "String": "String",
  "boolean": "boolean",
  "double": "더블",
  "Double": "더블",
  "Java": "자바",
  "(자료)": "",
  "개수": "개쑤",
};
