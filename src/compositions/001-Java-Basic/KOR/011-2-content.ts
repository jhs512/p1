// src/compositions/001-Java-Basic/KOR/011-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n매개변수",
    badge: "빈칸",
  },
  fixedScene: {
    narration: [
      "매개변수를 가장 쉽게 이해하는 방법은, 함수를 빈칸이 있는 틀로 보는 것입니다.",
      "지금 이 함수는 아직 빈칸이 없어서, 늘 같은 말만 출력하는 고정 틀입니다.",
    ],
  },
  slotScene: {
    narration: [
      "이제 고정된 이름을 지우고, 대신 값을 받을 빈칸 하나를 만들겠습니다.",
      "괄호 안에 적힌 이름은, 그 빈칸에 붙인 라벨이라고 생각하면 됩니다.",
    ],
  },
  callScene: {
    narration: [
      "함수를 호출할 때 값을 넣으면, 그 값이 방금 만든 빈칸으로 들어갑니다.",
      "그래서 같은 함수라도, 어떤 값을 넣느냐에 따라 결과가 달라집니다.",
    ],
  },
  renameScene: {
    narration: [
      "이 빈칸의 이름은 설명용이기 때문에, 읽기 좋게 바꿔도 괜찮습니다.",
      "중요한 것은 이름 자체보다, 호출할 때 들어온 값을 그 자리에서 사용한다는 점입니다.",
    ],
  },
  summaryScene: {
    narration: [
      "정리하면 매개변수는 함수 안으로 값을 받아오는 빈칸입니다.",
      "호출할 때 값을 넣고, 함수 안에서는 그 값을 꺼내 써서 같은 함수를 여러 번 재사용할 수 있습니다.",
    ],
    cards: ["함수의 빈칸", "호출할 때 값이 들어감", "같은 함수 재사용"],
  },
} satisfies EpisodeContent;
