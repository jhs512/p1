/**
 * 006-srt.ts — 006-JavaIf SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./006-audio";
import { toDisplayText } from "../../../utils/narration";
import { FPS } from "./config";
import { CROSS } from "../../../config";

export const fps = FPS;

const narrations = {
  overview: [
    "제어문에는 조건문과 반복문이 있습니다.",
    "조건문 중에 기본인 if 문을 알아보겠습니다.",
  ],
  intro: [
    "조건문은 조건이 참일 때만 코드를 실행합니다.",
    "조건이 거짓일 때도 처리하려면\nelse를 사용합니다.",
  ],
  ifScene: [
    "score가 60 이상이면 합격 메시지를 출력합니다.",
    "75는 60 이상이므로 조건이 참,\n블록 안의 코드가 실행됩니다.",
  ],
  ifElseScene: [
    "else는 조건이 거짓일 때 실행되는 블록입니다.",
    "score가 45라면 조건이 거짓이므로\nelse 블록이 실행됩니다.",
  ],
  summaryScene: [
    "if는 조건이 참일 때, else는 거짓일 때 실행됩니다.",
    "조건에 따라 서로 다른 코드를 실행할 수 있습니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.overview.durationInFrames,
  AUDIO_CONFIG.intro.durationInFrames,
  AUDIO_CONFIG.ifScene.durationInFrames,
  AUDIO_CONFIG.ifElseScene.durationInFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
];

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

addScene(froms[1], narrations.overview, AUDIO_CONFIG.overview.speechStartFrame,
  AUDIO_CONFIG.overview.narrationSplits, AUDIO_CONFIG.overview.sentenceEndFrames,
  AUDIO_CONFIG.overview.durationInFrames);
addScene(froms[2], narrations.intro, AUDIO_CONFIG.intro.speechStartFrame,
  AUDIO_CONFIG.intro.narrationSplits, AUDIO_CONFIG.intro.sentenceEndFrames,
  AUDIO_CONFIG.intro.durationInFrames);
addScene(froms[3], narrations.ifScene, AUDIO_CONFIG.ifScene.speechStartFrame,
  AUDIO_CONFIG.ifScene.narrationSplits, AUDIO_CONFIG.ifScene.sentenceEndFrames,
  AUDIO_CONFIG.ifScene.durationInFrames);
addScene(froms[4], narrations.ifElseScene, AUDIO_CONFIG.ifElseScene.speechStartFrame,
  AUDIO_CONFIG.ifElseScene.narrationSplits, AUDIO_CONFIG.ifElseScene.sentenceEndFrames,
  AUDIO_CONFIG.ifElseScene.durationInFrames);
addScene(froms[5], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
