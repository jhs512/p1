/**
 * 005-srt.ts — 005-JavaLogical SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./005-3-audio.gen";
import { toDisplayText } from "../../../utils/narration";
import { FPS } from "./config";
import { CROSS } from "../../../config";

export const fps = FPS;

const narrations = {
  intro: [
    "논리 연산자는 조건들을 연결하거나 뒤집는 연산자입니다.",
    "[&&(발음:AND)], [||(발음:OR)], [!(발음:NOT)], 세 가지를 알아봅니다.",
  ],
  andScene: [
    "AND 연산자입니다.\nx가 [true(발음:트루)]여도 y가 [false(발음:폴스)]면\n결과는 [false(발음:폴스)]입니다.",
    "두 조건이 모두 [true(발음:트루)]여야\n비로소 [true(발음:트루)]가 됩니다.",
  ],
  orScene: [
    "OR 연산자입니다.\nx가 [true(발음:트루)]이므로 x || y는 [true(발음:트루)]입니다.",
    "하나라도 [true(발음:트루)]면 [true(발음:트루)],\n둘 다 [false(발음:폴스)]여야 [false(발음:폴스)]가 됩니다.",
  ],
  notScene: [
    "NOT 연산자는 참을 거짓으로,\n거짓을 참으로 뒤집습니다.",
    "[!true(발음:낫 트루)]는 [false(발음:폴스)], [!false(발음:낫 폴스)]는 [true(발음:트루)]입니다.",
  ],
  summaryScene: [
    "세 가지 논리 연산자를 정리했습니다.",
    "[&&(발음:AND)]는 모두 참이어야 결과가 참,\n[||(발음:OR)]는 하나라도 참이면 결과가 참,\n[!은(발음:나슨)] 반전입니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.intro.durationInFrames,
  AUDIO_CONFIG.andScene.durationInFrames,
  AUDIO_CONFIG.orScene.durationInFrames,
  AUDIO_CONFIG.notScene.durationInFrames,
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
addScene(froms[2], narrations.andScene, AUDIO_CONFIG.andScene.speechStartFrame,
  AUDIO_CONFIG.andScene.narrationSplits, AUDIO_CONFIG.andScene.sentenceEndFrames,
  AUDIO_CONFIG.andScene.durationInFrames);
addScene(froms[3], narrations.orScene, AUDIO_CONFIG.orScene.speechStartFrame,
  AUDIO_CONFIG.orScene.narrationSplits, AUDIO_CONFIG.orScene.sentenceEndFrames,
  AUDIO_CONFIG.orScene.durationInFrames);
addScene(froms[4], narrations.notScene, AUDIO_CONFIG.notScene.speechStartFrame,
  AUDIO_CONFIG.notScene.narrationSplits, AUDIO_CONFIG.notScene.sentenceEndFrames,
  AUDIO_CONFIG.notScene.durationInFrames);
addScene(froms[5], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
