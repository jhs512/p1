/**
 * 003-srt.ts — 003-JavaOperators SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./003-2-audio.gen";
import { toDisplayText } from "../../../utils/narration";
import { FPS } from "./config";
import { CROSS } from "../../../config";

export const fps = FPS;

const narrations = {
  intro: [
    "산술 연산자는 수학적 계산을 수행하는 연산자입니다.",
    "더하기, 빼기, 곱하기, 나누기, 나머지,\n총 다섯 가지를 알아봅니다.",
  ],
  addSubScene: [
    "더하기 연산자는 두 값을 더합니다.",
    "빼기 연산자는 첫 번째 값에서\n두 번째 값을 뺍니다.",
  ],
  mulDivScene: [
    "곱하기 연산자는 두 값을 곱합니다.",
    "나누기 연산자는 첫 번째 값을\n두 번째 값으로 나눕니다.",
    "정수끼리 나누면 소수점은 버려집니다.",
  ],
  remScene: [
    "나머지 연산자는 나눗셈에서\n몫이 아닌 나머지를 구합니다.",
    "11을 3으로 나누면\n몫은 3이고 나머지는 2입니다.",
    "짝수 홀수 판별처럼 다양한 계산에 활용됩니다.",
  ],
  summaryScene: [
    "다섯 가지 산술 연산자를 코드로 정리하면 이렇습니다.",
    "각 연산의 결과를 변수에 저장해 활용할 수 있습니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.intro.durationInFrames,
  AUDIO_CONFIG.addSubScene.durationInFrames,
  AUDIO_CONFIG.mulDivScene.durationInFrames,
  AUDIO_CONFIG.remScene.durationInFrames,
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

addScene(froms[1], narrations.intro, AUDIO_CONFIG.intro.speechStartFrame,
  AUDIO_CONFIG.intro.narrationSplits, AUDIO_CONFIG.intro.sentenceEndFrames,
  AUDIO_CONFIG.intro.durationInFrames);
addScene(froms[2], narrations.addSubScene, AUDIO_CONFIG.addSubScene.speechStartFrame,
  AUDIO_CONFIG.addSubScene.narrationSplits, AUDIO_CONFIG.addSubScene.sentenceEndFrames,
  AUDIO_CONFIG.addSubScene.durationInFrames);
addScene(froms[3], narrations.mulDivScene, AUDIO_CONFIG.mulDivScene.speechStartFrame,
  AUDIO_CONFIG.mulDivScene.narrationSplits, AUDIO_CONFIG.mulDivScene.sentenceEndFrames,
  AUDIO_CONFIG.mulDivScene.durationInFrames);
addScene(froms[4], narrations.remScene, AUDIO_CONFIG.remScene.speechStartFrame,
  AUDIO_CONFIG.remScene.narrationSplits, AUDIO_CONFIG.remScene.sentenceEndFrames,
  AUDIO_CONFIG.remScene.durationInFrames);
addScene(froms[5], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
