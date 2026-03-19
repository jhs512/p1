/**
 * 004-srt.ts — 004-JavaComparison SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./004-audio";
import { toDisplayText } from "../../utils/narration";
import { SERIES_FPS } from "./series.config";

export const fps = SERIES_FPS;

const CROSS = 20;

const narrations = {
  intro: [
    "비교 연산자는 두 값을 비교해 참 또는 거짓을 반환합니다.",
    "결과는 [boolean(발음:불리언)] 타입으로,\n조건문과 함께 자주 사용됩니다.",
  ],
  compareScene: [
    "같음 연산자입니다,\n10과 3은 같지 않아 [false(발음:폴스)]입니다.",
    "다름 연산자입니다,\n10과 3은 서로 다르므로 [true(발음:트루)]입니다.",
    "초과 연산자입니다,\n10이 3보다 크므로 [true(발음:트루)]입니다.",
    "미만 연산자입니다,\n10이 3보다 작지 않아 [false(발음:폴스)]입니다.",
    "이상 연산자입니다,\n10이 3 이상이므로 [true(발음:트루)]입니다.",
    "이하 연산자입니다,\n10이 3 이하가 아니므로 [false(발음:폴스)]입니다.",
  ],
  summaryScene: [
    "여섯 가지 비교 연산자를 정리하면 이렇습니다.",
    "결과가 참이면 [true(발음:트루)], [거짓이면(발음:거지시면)] [false(발음:폴스)]가 됩니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.intro.durationInFrames,
  AUDIO_CONFIG.compareScene.durationInFrames,
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
addScene(froms[2], narrations.compareScene, AUDIO_CONFIG.compareScene.speechStartFrame,
  AUDIO_CONFIG.compareScene.narrationSplits, AUDIO_CONFIG.compareScene.sentenceEndFrames,
  AUDIO_CONFIG.compareScene.durationInFrames);
addScene(froms[3], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
