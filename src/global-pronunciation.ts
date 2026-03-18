// ─────────────────────────────────────────────────────────────
// global-pronunciation.ts  —  전역 TTS 발음 사전
//
// 형식: { "자막에 표시되는 텍스트": "TTS가 읽을 텍스트" }
//
// 우선순위 (낮은 순서):
//   3순위 (이 파일)       — 전역 기본값
//   2순위 (pronunciation.ts) — 강좌별 설정 (src/compositions/{시리즈}/pronunciation.ts)
//   1순위 (인라인 문법)    — [표시텍스트(발음:TTS텍스트)] — 최우선
//
// 예시:
//   "System.out.println": "print line"
//   "true": "트루"
//   "false": "폴스"
// ─────────────────────────────────────────────────────────────

export const PRONUNCIATION: Record<string, string> = {
  // 여기에 전역 발음 규칙을 추가하세요
};
