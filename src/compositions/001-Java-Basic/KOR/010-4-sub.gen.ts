/**
 * 010-srt.ts — 010-JavaFunction SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { CROSS } from "../../../config";
import { toDisplayText } from "../../../utils/narration";
import { AUDIO_CONFIG } from "./010-3-audio.gen";
import { FPS } from "./config";

export const fps = FPS;

const narrations = {
  painScene: [
    "같은 코드를 세 번 반복하고 있습니다.",
    "나중에 민준을 철수로 고칠 때 세 군데를 모두 바꿔야 합니다.",
  ],
  conceptScene: [
    "이럴 때 사용하는 것이 함수입니다.",
    "함수는 코드 묶음에 이름을 붙인 것입니다.",
  ],
  declarationScene: [
    "함수는 이렇게 선언합니다.",
    "지금은 함수 이름에만 집중하세요.",
  ],
  callScene: [
    "함수를 사용하려면 이름으로 호출합니다.",
    "선언 한 번으로 여러 번 호출할 수 있습니다.",
  ],
  summaryScene: [
    "함수는 반복되는 코드를 이름으로 묶는 방법입니다.",
    "선언은 한 번, 호출은 여러 번 할 수 있습니다.",
  ],
  comparisonScene: [
    "함수 없이는 같은 코드를 계속 반복해야 합니다.",
    "함수를 선언하면, 반복되는 코드를 줄일 수 있습니다.",
  ],
  realExampleScene: [
    "조금 더 실감나는 예시를 보겠습니다.",
    "삼만 원이 넘으면 할인하는 코드를 매번 직접 써야 합니다.",
    "함수가 없다면 할인 정책이 바뀔 때마다 여러 곳을 찾아서 고쳐야 합니다.",
    "함수로 만들면 이름 하나로 깔끔하게 해결됩니다.",
  ],
  outroScene: [
    "함수에서 사용된\n[return(발음:리턴)] 과 [void(발음:보이드)]도 알아두면 좋습니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.painScene.durationInFrames,
  AUDIO_CONFIG.conceptScene.durationInFrames,
  AUDIO_CONFIG.declarationScene.durationInFrames,
  AUDIO_CONFIG.callScene.durationInFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
  AUDIO_CONFIG.comparisonScene.durationInFrames,
  AUDIO_CONFIG.realExampleScene.durationInFrames,
  AUDIO_CONFIG.outroScene.durationInFrames,
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
  narrations.declarationScene,
  AUDIO_CONFIG.declarationScene.speechStartFrame,
  AUDIO_CONFIG.declarationScene.narrationSplits,
  AUDIO_CONFIG.declarationScene.sentenceEndFrames,
  AUDIO_CONFIG.declarationScene.durationInFrames,
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
  narrations.summaryScene,
  AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits,
  AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
);
addScene(
  froms[6],
  narrations.comparisonScene,
  AUDIO_CONFIG.comparisonScene.speechStartFrame,
  AUDIO_CONFIG.comparisonScene.narrationSplits,
  AUDIO_CONFIG.comparisonScene.sentenceEndFrames,
  AUDIO_CONFIG.comparisonScene.durationInFrames,
);
addScene(
  froms[7],
  narrations.realExampleScene,
  AUDIO_CONFIG.realExampleScene.speechStartFrame,
  AUDIO_CONFIG.realExampleScene.narrationSplits,
  AUDIO_CONFIG.realExampleScene.sentenceEndFrames,
  AUDIO_CONFIG.realExampleScene.durationInFrames,
);
addScene(
  froms[8],
  narrations.outroScene,
  AUDIO_CONFIG.outroScene.speechStartFrame,
  AUDIO_CONFIG.outroScene.narrationSplits,
  AUDIO_CONFIG.outroScene.sentenceEndFrames,
  AUDIO_CONFIG.outroScene.durationInFrames,
);

export const SRT_DATA = entries;
