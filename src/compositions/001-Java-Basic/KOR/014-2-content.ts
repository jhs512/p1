// src/compositions/001-Java-Basic/KOR/014-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n클래스",
    badge: "class",
  },
  painScene: {
    narration: [
      "미국에 있는 친구에게 상자 네 개를 보내야 합니다.",
      "따로 보내면 배에 네 번 싣고, 네 번 내리고, 트레일러에 네 번 실어야 합니다.",
    ],
  },
  packageScene: {
    narration: [
      "하나로 묶어서 보내면 한 번이면 됩니다.",
      "싣고, 내리고, 옮기는 과정이 전부 한 번으로 줄어듭니다.",
    ],
  },
  codeAnalogy: {
    narration: [
      "프로그래밍에서도 마찬가지입니다.",
      "한 사람의 이름, 나이, 점수, 학년을 따로 관리하면 불편합니다.",
    ],
  },
  bundleScene: {
    narration: [
      "관련된 데이터끼리 하나로 묶으면 훨씬 편합니다.",
      "필요할 때 묶음째로 전달하면 됩니다.",
    ],
  },
  classPreview: {
    narration: [
      "이렇게 데이터를 묶는 틀을 클래스라고 합니다.",
      "클래스로 만든 실체를 객체라고 합니다.",
    ],
  },
  outroScene: {
    narration: [
      "클래스에 대해서는 다음에 본격적으로 알아보겠습니다.",
    ],
  },
} satisfies EpisodeContent;
