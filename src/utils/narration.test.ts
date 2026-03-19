import { describe, expect, it } from "vitest";

import { toDisplayText, toTTSText } from "./narration";

// ── toDisplayText ────────────────────────────────────────────

describe("toDisplayText", () => {
  it("인라인 문법 없는 일반 텍스트는 그대로 반환", () => {
    expect(toDisplayText("안녕하세요.")).toBe("안녕하세요.");
  });

  it("[X(발음:Y)] → 자막에는 X만 표시", () => {
    expect(toDisplayText("[유튜브(발음:유튭)]에서 확인")).toBe(
      "유튜브에서 확인",
    );
  });

  it("[X(발음:)] 묵음 — 자막에는 X 표시", () => {
    expect(toDisplayText("[(자료)(발음:)]형이란")).toBe("(자료)형이란");
  });

  it("코드 발음 — 자막에는 코드 표시", () => {
    expect(
      toDisplayText("[System.out.println(발음:print line)]으로 출력"),
    ).toBe("System.out.println으로 출력");
  });

  it("여러 개의 인라인 문법 동시 처리", () => {
    expect(toDisplayText("[int(발음:인트)]형과 [double(발음:더블)]형")).toBe(
      "int형과 double형",
    );
  });

  it("인라인 문법 없는 부분은 그대로 유지", () => {
    expect(toDisplayText("변수를 [age(발음:에이지)]라고 합니다.")).toBe(
      "변수를 age라고 합니다.",
    );
  });
});

// ── toTTSText ────────────────────────────────────────────────

describe("toTTSText", () => {
  it("인라인 문법 없는 일반 텍스트는 그대로 반환", () => {
    expect(toTTSText("안녕하세요.")).toBe("안녕하세요.");
  });

  it("[X(발음:Y)] → TTS에는 Y만 읽힘", () => {
    expect(toTTSText("[유튜브(발음:유튭)]에서 확인")).toBe("유튭에서 확인");
  });

  it("[X(발음:)] 묵음 — TTS에는 빈 문자열 (앞뒤 공백 정규화)", () => {
    // [(자료)(발음:)]형이란 → 형이란 (묵음 처리 후 공백 정리)
    expect(toTTSText("[(자료)(발음:)]형이란")).toBe("형이란");
  });

  it("발음 값 앞뒤 공백 trim", () => {
    expect(toTTSText("[int(발음: 인트 )]형")).toBe("인트형");
  });

  it("코드 발음 — TTS에는 발음 텍스트 읽힘", () => {
    expect(toTTSText("[System.out.println(발음:print line)]으로 출력")).toBe(
      "print line으로 출력",
    );
  });

  it("여러 개의 인라인 문법 동시 처리", () => {
    expect(toTTSText("[int(발음:인트)]형과 [double(발음:더블)]형")).toBe(
      "인트형과 더블형",
    );
  });

  it("\\n은 공백으로 변환 (TTS 쉼 방지)", () => {
    expect(toTTSText("첫 번째 문장.\n두 번째 문장.")).toBe(
      "첫 번째 문장. 두 번째 문장.",
    );
  });

  it("\\n 연속 → 공백 하나로 정규화", () => {
    expect(toTTSText("첫 줄\n\n두 줄")).toBe("첫 줄 두 줄");
  });

  it("연속 공백은 하나로 정규화", () => {
    expect(toTTSText("단어  두  개")).toBe("단어 두 개");
  });

  it("인라인 문법 + \\n 조합", () => {
    expect(toTTSText("[int(발음:인트)]형은\n변수 선언에 사용합니다.")).toBe(
      "인트형은 변수 선언에 사용합니다.",
    );
  });
});
