/**
 * 001-srt.ts — 001-JavaVariables SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./001-audio";
import { toDisplayText } from "../../utils/narration";
import { FPS } from "./config";
import { SCENE_TAIL_FRAMES, CROSS } from "../../config";

export const fps = FPS;

// narration 텍스트 (001-JavaVariables.tsx의 VIDEO_CONFIG 에서 복사)
const narrations = {
  intro: [
    "변수는 데이터를 담는 상자입니다.",
    "상자에 이름을 붙이고, 값을 넣고,\n꺼내 쓸 수 있습니다.",
  ],
  declaration: [
    "변수를 사용하려면 먼저 선언이 필요합니다.",
    "int age 라고 쓰면\n정수형 변수 age가 만들어집니다.",
  ],
  initialization: [
    "선언한 변수에 처음으로 값을 넣는 것을\n초기화라고 합니다.",
    "age 변수에는 25가 저장되었습니다.",
  ],
  interpret: [
    "변수의 해석은 두 가지로 구분됩니다.",
    "선언하거나 값을 넣을 때만 공간으로 인식되고,\n그 외에는 값으로 인식됩니다.",
    "이 부분의 age는 25로 해석됩니다.",
  ],
  interpretQuiz: [
    "앞 부분의 age 변수는\n공간으로 해석해야할까요?\n아니면 값으로 해석해야 할까요?",
  ],
  interpretReveal: [
    "정답은 공간입니다.",
    "값을 대입받는 왼쪽 자리이기 때문이죠.",
  ],
  print: [
    "이제 변수의 값을 화면에 출력해보겠습니다.",
    "[System.out.println(발음:print line)] 메서드를 사용하면\n괄호 안에 있는 변수의 값이 콘솔에 출력됩니다.",
    "실행하면 25가 출력되는 것을 확인할 수 있습니다.",
  ],
};

// 씬 duration (VIDEO_CONFIG 구조와 동일하게)
const declarationDur = AUDIO_CONFIG.declaration.durationInFrames;
const initializationDur = AUDIO_CONFIG.initialization.durationInFrames;
const COMBINED_DURATION = declarationDur + initializationDur;
const QUIZ_THINKING_FRAMES = 150;
const QUIZ_TOTAL_DURATION =
  AUDIO_CONFIG.interpretQuiz.durationInFrames +
  QUIZ_THINKING_FRAMES +
  AUDIO_CONFIG.interpretReveal.durationInFrames;

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.intro.durationInFrames,
  COMBINED_DURATION,
  AUDIO_CONFIG.interpret.durationInFrames,
  QUIZ_TOTAL_DURATION,
  AUDIO_CONFIG.print.durationInFrames,
];

// fromValues 계산
const froms: number[] = [];
let _f = 0;
for (let i = 0; i < sceneDurations.length; i++) {
  froms.push(_f);
  _f += sceneDurations[i] - (i < sceneDurations.length - 1 ? CROSS : 0);
}

const entries: Array<{ startFrame: number; endFrame: number; text: string }> = [];

function addScene(
  offset: number,
  narration: string[],
  speechStartFrame: number,
  narrationSplits: readonly number[],
  sentenceEndFrames: readonly number[],
  sceneDuration: number,
) {
  const starts = [speechStartFrame, ...narrationSplits];
  const ends = [...sentenceEndFrames, sceneDuration];
  narration.forEach((text, i) => {
    const s = starts[i];
    const e = ends[i] ?? ends[ends.length - 1];
    if (s !== undefined && e !== undefined && e > s) {
      entries.push({
        startFrame: offset + s,
        endFrame: offset + e,
        text: toDisplayText(text).replace(/\n/g, " "),
      });
    }
  });
}

// [0] thumbnail: 나레이션 없음
// [1] intro
addScene(froms[1], narrations.intro, AUDIO_CONFIG.intro.speechStartFrame,
  AUDIO_CONFIG.intro.narrationSplits, AUDIO_CONFIG.intro.sentenceEndFrames,
  AUDIO_CONFIG.intro.durationInFrames);

// [2] CombinedDeclarationInit
addScene(froms[2], narrations.declaration, AUDIO_CONFIG.declaration.speechStartFrame,
  AUDIO_CONFIG.declaration.narrationSplits, AUDIO_CONFIG.declaration.sentenceEndFrames,
  declarationDur);
addScene(froms[2] + declarationDur - SCENE_TAIL_FRAMES, narrations.initialization, AUDIO_CONFIG.initialization.speechStartFrame,
  AUDIO_CONFIG.initialization.narrationSplits, AUDIO_CONFIG.initialization.sentenceEndFrames,
  initializationDur);

// [3] interpret
addScene(froms[3], narrations.interpret, AUDIO_CONFIG.interpret.speechStartFrame,
  AUDIO_CONFIG.interpret.narrationSplits, AUDIO_CONFIG.interpret.sentenceEndFrames,
  AUDIO_CONFIG.interpret.durationInFrames);

// [4] QuizScene (interpretQuiz + 150 + interpretReveal)
const qDur = AUDIO_CONFIG.interpretQuiz.durationInFrames;
addScene(froms[4], narrations.interpretQuiz, AUDIO_CONFIG.interpretQuiz.speechStartFrame,
  AUDIO_CONFIG.interpretQuiz.narrationSplits, AUDIO_CONFIG.interpretQuiz.sentenceEndFrames,
  qDur);
addScene(froms[4] + qDur + QUIZ_THINKING_FRAMES, narrations.interpretReveal, AUDIO_CONFIG.interpretReveal.speechStartFrame,
  AUDIO_CONFIG.interpretReveal.narrationSplits, AUDIO_CONFIG.interpretReveal.sentenceEndFrames,
  AUDIO_CONFIG.interpretReveal.durationInFrames);

// [5] print
addScene(froms[5], narrations.print, AUDIO_CONFIG.print.speechStartFrame,
  AUDIO_CONFIG.print.narrationSplits, AUDIO_CONFIG.print.sentenceEndFrames,
  AUDIO_CONFIG.print.durationInFrames);

export const SRT_DATA = entries;
