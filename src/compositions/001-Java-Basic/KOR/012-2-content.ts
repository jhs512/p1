// src/compositions/001-Java-Basic/KOR/012-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\nreturn",
    badge: "return",
  },
  painScene: {
    narration: [
      "이 함수는 합계를 화면에 출력만 합니다.",
      "계산 결과를 다른 곳에서 쓰고 싶어도 꺼낼 방법이 없습니다.",
    ],
  },
  conceptScene: {
    narration: [
      "[return(발음:리턴)]을 쓰면 함수가 결과를 돌려줍니다.",
      "돌려받은 값은 변수에 저장하거나 바로 사용할 수 있습니다.",
    ],
  },
  returnTypeScene: {
    narration: [
      "돌려줄 값이 없으면 [void(발음:보이드)]를 씁니다.",
      "정수를 돌려주려면 [int(발음:인트)]를 씁니다.",
    ],
  },
  returnFlowScene: {
    narration: [
      "[return(발음:리턴)]을 만나면 함수가 즉시 끝납니다.",
      "[return(발음:리턴)] 아래에 있는 코드는 실행되지 않습니다.",
    ],
  },
  useReturnScene: {
    narration: [
      "돌려받은 값을 변수에 저장할 수 있습니다.",
      "저장한 값은 이후 코드에서 자유롭게 사용할 수 있습니다.",
    ],
  },
  summaryScene: {
    narration: [
      "[return(발음:리턴)]은 함수가 결과를 돌려주는 방법입니다.",
      "리턴 타입은 돌려줄 값의 종류를 알려줍니다.",
    ],
    cards: ["return = 결과 돌려주기", "리턴 타입 = 값의 종류"],
  },
} satisfies EpisodeContent;
