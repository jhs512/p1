/**
 * 009-srt.ts — 009-JavaFor SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./009-audio";
import { toDisplayText } from "../../utils/narration";
import { SERIES_FPS } from "./series.config";

export const fps = SERIES_FPS;

const CROSS = 20;

const narrations = {
  overview: [
    "반복문에는 여러 종류가 있습니다.",
    "이번엔 [for(발음:포)] 문을 알아보겠습니다.",
  ],
  intro: [
    "[for(발음:포)] 문은 초기식, 조건식, 증감식을\n한 줄에 씁니다.",
    "조건이 참인 동안 블록을 반복 실행합니다.",
  ],
  forScene: [
    "초기식에서 변수를 초기화하고 조건식을 확인합니다.",
    "블록 실행 후 증감식으로 변수를 변화시킵니다.",
  ],
  executionScene: [
    "[i(발음:아이)]가 0일 때 조건이 참이므로 블록을 실행합니다.",
    "[i(발음:아이)]가 1일 때도 조건이 참입니다.",
    "[i(발음:아이)]가 2일 때도 조건이 참입니다.",
    "[i(발음:아이)]가 3일 때도 조건이 참입니다.",
    "[i(발음:아이)]가 4일 때, 조건이 참인 마지막 실행입니다.",
    "[i(발음:아이)]가 5가 되면 조건이 거짓이 되어\n반복이 종료됩니다.",
  ],
  summaryScene: [
    "[for(발음:포)] 문은 초기식, 조건식, 증감식으로\n반복을 제어합니다.",
    "횟수가 정해진 반복에 적합합니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.overview.durationInFrames,
  AUDIO_CONFIG.intro.durationInFrames,
  AUDIO_CONFIG.forScene.durationInFrames,
  AUDIO_CONFIG.executionScene.durationInFrames,
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
addScene(froms[3], narrations.forScene, AUDIO_CONFIG.forScene.speechStartFrame,
  AUDIO_CONFIG.forScene.narrationSplits, AUDIO_CONFIG.forScene.sentenceEndFrames,
  AUDIO_CONFIG.forScene.durationInFrames);
addScene(froms[4], narrations.executionScene, AUDIO_CONFIG.executionScene.speechStartFrame,
  AUDIO_CONFIG.executionScene.narrationSplits, AUDIO_CONFIG.executionScene.sentenceEndFrames,
  AUDIO_CONFIG.executionScene.durationInFrames);
addScene(froms[5], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
