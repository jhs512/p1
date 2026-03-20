// src/compositions/001-Java-Basic/KOR/010-2-content.ts
export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\n함수",
    badge: "함수",
  },
  painScene: {
    narration: [
      "같은 코드를 세 번 반복하고 있습니다.",
      "나중에 민준을 철수로 고칠 때 세 군데를 모두 바꿔야 합니다.",
    ],
  },
  conceptScene: {
    narration: [
      "이럴 때 사용하는 것이 함수입니다.",
      "함수는 코드 묶음에 이름을 붙인 것입니다.",
    ],
  },
  declarationScene: {
    narration: [
      "함수는 이렇게 선언합니다.",
      "지금은 함수 이름에만 집중하세요.",
    ],
  },
  callScene: {
    narration: [
      "함수를 사용하려면 이름으로 호출합니다.",
      "선언 한 번으로 여러 번 호출할 수 있습니다.",
    ],
  },
  summaryScene: {
    narration: [
      "함수는 반복되는 코드를 이름으로 묶는 방법입니다.",
      "선언은 한 번, 호출은 여러 번 할 수 있습니다.",
    ],
    cards: ["선언은 한 번", "호출은 여러 번"],
  },
  comparisonScene: {
    narration: [
      "함수 없이는 같은 코드를 계속 반복해야 합니다.",
      "함수를 선언하면, 반복되는 코드를 줄일 수 있습니다.",
    ],
  },
} as const;
