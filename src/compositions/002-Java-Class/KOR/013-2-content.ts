import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\nclass",
    badge: "레퍼런스 복사",
  },
  misconceptionScene: {
    narration: ["레퍼런스 복사의 오해 지점을 짚어봅니다."],
  },
  memoryScene: {
    narration: ["메모리 안에서 값이 복사되는 모습을 설명합니다."],
  },
  proofScene: {
    narration: ["실제로 어떻게 복사가 일어나는지 확인합니다."],
  },
  comparisonScene: {
    narration: ["얕은 복사와 깊은 복사의 차이를 비교합니다."],
  },
  summaryScene: {
    narration: ["레퍼런스 복사의 핵심 포인트를 정리합니다."],
  },
} satisfies EpisodeContent;
