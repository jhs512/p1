/**
 * 011-srt.ts — 011-JavaParameter SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { CROSS } from "../../../config";
import { toDisplayText } from "../../../utils/narration";
import { AUDIO_CONFIG } from "./011-3-audio.gen";
import { FPS } from "./config";

export const fps = FPS;

const narrations = {
  painScene: [
    "이 인사 함수는 민준에게만 인사할 수 있습니다.",
    "다른 사람에게 인사하려면 함수를 더 만들어야 합니다.",
  ],
  conceptScene: [
    "매개변수를 사용하면 하나의 함수로 해결됩니다.",
    "매개변수는 함수에 값을 전달하는 통로입니다.",
  ],
  paramScene: [
    "괄호 안에 자료형과 이름을 쓰면 매개변수가 됩니다.",
    "이 함수는 문자열을 하나 전달받습니다.",
  ],
  callScene: [
    "호출할 때 괄호 안에 넣는 값을 인자라고 합니다.",
    "인자가 매개변수로 전달되어 결과가 출력됩니다.",
  ],
  multiParamScene: [
    "매개변수는 여러 개 선언할 수 있습니다.",
    "쉼표로 구분하며 순서대로 전달됩니다.",
    "첫 번째 인자는 첫 번째 매개변수로, 두 번째 인자는 두 번째 매개변수로 전달됩니다.",
  ],
  summaryScene: [
    "매개변수는 선언할 때 만드는 전달 통로입니다.",
    "인자는 호출할 때 넣는 실제 값입니다.",
  ],
  argParamScene: [
    "선언할 때 괄호 안에 만드는 자리가 매개변수입니다.",
    "호출할 때 괄호 안에 넣는 실제 값이 인자입니다.",
  ],
};

const sceneDurations = [
  60, // thumbnail
  AUDIO_CONFIG.painScene.durationInFrames,
  AUDIO_CONFIG.conceptScene.durationInFrames,
  AUDIO_CONFIG.paramScene.durationInFrames,
  AUDIO_CONFIG.callScene.durationInFrames,
  AUDIO_CONFIG.multiParamScene.durationInFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
  AUDIO_CONFIG.argParamScene.durationInFrames,
];

const froms: number[] = [];
let _f = 0;
for (let i = 0; i < sceneDurations.length; i++) {
  froms.push(_f);
  _f += sceneDurations[i] - (i < sceneDurations.length - 1 ? CROSS : 0);
}

const entries: Array<{ startFrame: number; endFrame: number; text: string }> =
  [];

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

addScene(
  froms[1],
  narrations.painScene,
  AUDIO_CONFIG.painScene.speechStartFrame,
  AUDIO_CONFIG.painScene.narrationSplits,
  AUDIO_CONFIG.painScene.sentenceEndFrames,
  AUDIO_CONFIG.painScene.durationInFrames,
);
addScene(
  froms[2],
  narrations.conceptScene,
  AUDIO_CONFIG.conceptScene.speechStartFrame,
  AUDIO_CONFIG.conceptScene.narrationSplits,
  AUDIO_CONFIG.conceptScene.sentenceEndFrames,
  AUDIO_CONFIG.conceptScene.durationInFrames,
);
addScene(
  froms[3],
  narrations.paramScene,
  AUDIO_CONFIG.paramScene.speechStartFrame,
  AUDIO_CONFIG.paramScene.narrationSplits,
  AUDIO_CONFIG.paramScene.sentenceEndFrames,
  AUDIO_CONFIG.paramScene.durationInFrames,
);
addScene(
  froms[4],
  narrations.callScene,
  AUDIO_CONFIG.callScene.speechStartFrame,
  AUDIO_CONFIG.callScene.narrationSplits,
  AUDIO_CONFIG.callScene.sentenceEndFrames,
  AUDIO_CONFIG.callScene.durationInFrames,
);
addScene(
  froms[5],
  narrations.multiParamScene,
  AUDIO_CONFIG.multiParamScene.speechStartFrame,
  AUDIO_CONFIG.multiParamScene.narrationSplits,
  AUDIO_CONFIG.multiParamScene.sentenceEndFrames,
  AUDIO_CONFIG.multiParamScene.durationInFrames,
);
addScene(
  froms[6],
  narrations.summaryScene,
  AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits,
  AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
);
addScene(
  froms[7],
  narrations.outroScene,
  AUDIO_CONFIG.argParamScene.speechStartFrame,
  AUDIO_CONFIG.argParamScene.narrationSplits,
  AUDIO_CONFIG.argParamScene.sentenceEndFrames,
  AUDIO_CONFIG.argParamScene.durationInFrames,
);

export const SRT_DATA = entries;
