// src/compositions/001-Java-Basic/KOR/011-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n매개변수",
    badge: "입력값",
  },
  conceptScene: {
    narration: [
      "매개변수가 없는 함수는 버튼이 하나뿐인 자판기와 비슷합니다.",
      "버튼을 누를 때마다 같은 음료만 나오는 것처럼 결과가 늘 고정됩니다.",
      "매개변수는 원하는 음료를 고를 수 있는 주문 칸처럼 함수에 넣을 값을 바꿔 주는 자리입니다.",
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
