// src/compositions/001-Java-Basic/KOR/011-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n매개변수",
    badge: "매개변수",
  },
  conceptScene: {
    narration: [
      "함수 이름만 있으면 항상 같은 동작만 하게 됩니다.",
      "함수마다 다른 값을 넣고 싶을 때 사용하는 것이 매개변수입니다.",
    ],
  },
  declarationScene: {
    narration: [
      "매개변수는 함수가 받을 값을 위한 이름표입니다.",
      "함수 이름 옆 괄호 안에 적어 둡니다.",
    ],
  },
  callScene: {
    narration: [
      "함수를 호출할 때는 실제 값을 함께 넣습니다.",
      "이 값이 매개변수 자리에 들어갑니다.",
    ],
  },
  resultScene: {
    narration: [
      "같은 함수라도 넣는 값이 다르면 결과도 달라집니다.",
      "그래서 한 번 만든 함수를 여러 상황에 재사용할 수 있습니다.",
    ],
  },
  summaryScene: {
    narration: [
      "매개변수는 함수가 받는 입력값 이름입니다.",
      "호출할 때 값을 넣으면 같은 함수를 다양하게 사용할 수 있습니다.",
    ],
    cards: ["입력값 이름", "호출 때 값 전달", "같은 함수 재사용"],
  },
} satisfies EpisodeContent;
