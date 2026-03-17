/**
 * narration.ts — 인라인 발음 문법 파서
 *
 * 문법: [표시(발음:읽기)]
 *   예) [유튜브(발음:유튭)]  →  자막: 유튜브 / TTS: 유튭
 *       [System.out.println(발음:print line)]  →  자막: System.out.println / TTS: print line
 *       [(자료)(발음:)]  →  자막: (자료) / TTS: (없음, 묵음)
 */

const INLINE_RE = /\[([^(]+)\(발음:([^)]*)\)\]/g;

/** 자막 표시용: [X(발음:Y)] → X */
export function toDisplayText(text: string): string {
  return text.replace(INLINE_RE, "$1");
}

/** TTS 읽기용: [X(발음:Y)] → Y */
export function toTTSText(text: string): string {
  return text.replace(INLINE_RE, (_, _display, pron) => pron.trim());
}
