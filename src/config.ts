// src/config.ts — 루트 전역 설정
// 모든 강좌/강의가 이 값을 상속한다

// ── 타이밍 ───────────────────────────────────────────────────
/** 렌더링 프레임레이트 */
export const FPS = 30;

/** 오디오 종료 후 씬이 유지되는 여유 프레임 */
export const SCENE_TAIL_FRAMES = 15;

/** 씬 간 크로스페이드 프레임 수 */
export const CROSS = 20;

/** 타이핑 이펙트 — 초당 글자 수 */
export const CHARS_PER_SEC = 10;

// ── 전역 발음맵 ──────────────────────────────────────────────
/** 우선순위: 인라인[X(발음:Y)] > 강좌 config > 이 맵 */
export const PRONUNCIATION: Record<string, string> = {
  true: "트루",
  false: "폴스",
  "!true": "낫 트루",
  "!false": "낫 폴스",
  "||": "OR",
  "&&": "AND",
  "!": "NOT",
  double: "더블",
  boolean: "불리언",
  "System.out.println": "print line",
  Java: "자바",
  개수: "개쑤",
  거짓이: "거지시",
  거짓일: "거지실",
};
