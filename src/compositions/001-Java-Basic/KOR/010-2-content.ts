// src/compositions/001-Java-Basic/KOR/010-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

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
      "먼저 아무 값도 받지 않는 함수로 시작해 보겠습니다.",
      "이제 괄호 안에 이름을 받을 자리를 추가해 보겠습니다.",
      "이렇게 함수 쪽에 만들어 둔 받는 자리가 매개변수입니다.",
    ],
  },
  callScene: {
    narration: [
      "함수를 부를 때는 괄호 안에 실제 값을 넣어줍니다.",
      "넣는 값이 바뀌면 같은 함수로도 다른 결과를 만들 수 있습니다.",
    ],
  },
  summaryScene: {
    narration: [
      "함수는 코드를 이름으로 묶고, 필요하면 값을 받아서 다시 사용할 수 있습니다.",
      "마지막으로 중요한 용어 하나만 더 정리하겠습니다.",
    ],
    cards: ["이름으로 묶기", "값을 받아 재사용"],
  },
  comparisonScene: {
    narration: [
      "함수 없이는 같은 코드를 계속 반복해야 합니다.",
      "함수를 선언하면, 반복되는 코드를 줄일 수 있습니다.",
    ],
  },
  realExampleScene: {
    narration: [
      "조금 더 실감나는 예시를 보겠습니다.",
      "삼만 원이 넘으면 할인하는 코드를 매번 직접 써야 합니다.",
      "함수가 없다면 할인 정책이 바뀔 때마다 여러 곳을 찾아서 고쳐야 합니다.",
      "함수로 만들면 이름 하나로 깔끔하게 해결됩니다.",
    ],
  },
  argumentParameterScene: {
    narration: [
      "함수 쪽 괄호 안의 받는 자리는 매개변수입니다.",
      "호출 쪽 괄호 안에 넣는 실제 값은 인자입니다.",
      "둘은 연결되지만, 보는 위치가 다릅니다.",
    ],
  },
  outroScene: {
    narration: [
      "함수에서 사용된\n[return(발음:리턴)] 과 [void(발음:보이드)]도 알아두면 좋습니다.",
    ],
  },
} satisfies EpisodeContent;
