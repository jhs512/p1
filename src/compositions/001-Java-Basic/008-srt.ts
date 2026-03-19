/**
 * 008-srt.ts — 008-JavaWhile SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./008-audio";
import { toDisplayText } from "../../utils/narration";
import { SERIES_FPS } from "./series.config";

export const fps = SERIES_FPS;

const CROSS = 20;
const SCENE_TAIL_FRAMES = 15;

const narrations = {
  overview: [
    "반복문에는 여러 종류가 있습니다.",
    "그 중 기본인 [while(발음:와일)] 문을 알아보겠습니다.",
  ],
  intro: [
    "[while(발음:와일)] 문은 조건이 참인 동안\n코드 블록을 반복 실행합니다.",
    "조건이 거짓이 되는 순간 반복을 멈춥니다.",
  ],
  whileScene: [
    "괄호 안 조건이 참이면 블록을 실행하고\n다시 조건을 확인합니다.",
    "카운터를 증가시켜 조건을 변화시키고\n반복이 끝나게 합니다.",
  ],
  executionScene: [
    "카운트가 1일 때, 조건이 참이므로\n블록을 실행하고 1을 출력합니다.",
    "카운트가 2일 때도 조건이 참이므로\n다시 실행합니다.",
    "카운트가 3일 때도 조건은 여전히 참입니다.",
    "카운트가 4일 때도 마찬가지입니다.",
    "카운트가 5일 때,\n조건이 참인 마지막 실행입니다.",
    "카운트가 6이 되면 조건이 거짓이 되어\n반복이 종료됩니다.",
  ],
  infiniteScene: [
    "탈출 조건이 없으면 무한루프가 됩니다.",
    "반드시 조건을 거짓으로 만드는\n코드가 필요합니다.",
  ],
  summaryScene: [
    "[while(발음:와일)]은 조건이 참인 동안 반복합니다.",
    "조건이 거짓이 되면 멈춥니다.",
  ],
};

// WhileScene duration 헌법 계산 (008-JavaWhile.tsx 동일 로직)
const WHILE_TYPING_CHARS = 81;
const WHILE_CHARS_PER_SEC_CONST = 10;
const WHILE_TYPING_END =
  AUDIO_CONFIG.whileScene.speechStartFrame +
  Math.ceil((WHILE_TYPING_CHARS / WHILE_CHARS_PER_SEC_CONST) * 30);
const WHILE_SCENE_DURATION = Math.max(
  AUDIO_CONFIG.whileScene.durationInFrames,
  WHILE_TYPING_END + CROSS + SCENE_TAIL_FRAMES,
);

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.overview.durationInFrames,
  AUDIO_CONFIG.intro.durationInFrames,
  WHILE_SCENE_DURATION,
  AUDIO_CONFIG.executionScene.durationInFrames,
  AUDIO_CONFIG.infiniteScene.durationInFrames,
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
addScene(froms[3], narrations.whileScene, AUDIO_CONFIG.whileScene.speechStartFrame,
  AUDIO_CONFIG.whileScene.narrationSplits, AUDIO_CONFIG.whileScene.sentenceEndFrames,
  WHILE_SCENE_DURATION);
addScene(froms[4], narrations.executionScene, AUDIO_CONFIG.executionScene.speechStartFrame,
  AUDIO_CONFIG.executionScene.narrationSplits, AUDIO_CONFIG.executionScene.sentenceEndFrames,
  AUDIO_CONFIG.executionScene.durationInFrames);
addScene(froms[5], narrations.infiniteScene, AUDIO_CONFIG.infiniteScene.speechStartFrame,
  AUDIO_CONFIG.infiniteScene.narrationSplits, AUDIO_CONFIG.infiniteScene.sentenceEndFrames,
  AUDIO_CONFIG.infiniteScene.durationInFrames);
addScene(froms[6], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
