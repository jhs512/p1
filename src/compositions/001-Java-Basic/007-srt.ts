/**
 * 007-srt.ts — 007-JavaSwitch SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { AUDIO_CONFIG } from "./007-audio";
import { toDisplayText } from "../../utils/narration";
import { SERIES_FPS } from "./series.config";

export const fps = SERIES_FPS;

const CROSS = 20;
const SCENE_TAIL_FRAMES = 15;

const narrations = {
  overview: [
    "다양한 조건을 처리할 때\n[switch(발음:스위치)] 표현식을 사용할 수 있습니다.",
    "[if(발음:이프)]문 대신 더 깔끔하게\n조건을 분기할 수 있습니다.",
  ],
  intro: [
    "요일에 따라 다른 메시지를 출력하려면\n[if(발음:이프)]문을 여러 번 반복해야 합니다.",
    "[switch(발음:스위치)] 표현식을 쓰면\n훨씬 간결하게 작성할 수 있습니다.",
  ],
  syntaxScene: [
    "[switch(발음:스위치)] 뒤에 조건값을 쓰고,\n각 케이스에 화살표로 결과를 연결합니다.",
    "화살표 문법을 사용하면 코드가 훨씬 간결해집니다.",
  ],
  multiCaseScene: [
    "여러 값을 하나의 케이스로 묶어\n중복 없이 처리할 수 있습니다.",
    "[switch(발음:스위치)] 표현식은 값을 반환하므로\n변수에 바로 대입할 수 있습니다.",
  ],
  summaryScene: [
    "정리하겠습니다.",
    "화살표 문법으로 각 케이스를\n간결하게 작성할 수 있습니다.",
    "화살표 문법에서는 각 케이스가 끝나면\n자동으로 종료됩니다.",
    "값 반환과 케이스 묶기로\n더욱 강력하게 사용할 수 있습니다.",
  ],
};

// SyntaxScene duration 헌법 계산 (007-JavaSwitch.tsx 동일 로직)
const SYNTAX_CODE_CHARS = 159; // SYNTAX_FULL_CODE.length
const SYNTAX_CHARS_PER_SEC = 20;
const SYNTAX_TYPING_END =
  AUDIO_CONFIG.syntaxScene.speechStartFrame +
  Math.ceil((SYNTAX_CODE_CHARS / SYNTAX_CHARS_PER_SEC) * 30);
const SYNTAX_SCENE_DURATION = Math.max(
  AUDIO_CONFIG.syntaxScene.durationInFrames,
  SYNTAX_TYPING_END + CROSS + SCENE_TAIL_FRAMES,
);

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.overview.durationInFrames,
  AUDIO_CONFIG.intro.durationInFrames,
  SYNTAX_SCENE_DURATION,
  AUDIO_CONFIG.multiCaseScene.durationInFrames,
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
addScene(froms[3], narrations.syntaxScene, AUDIO_CONFIG.syntaxScene.speechStartFrame,
  AUDIO_CONFIG.syntaxScene.narrationSplits, AUDIO_CONFIG.syntaxScene.sentenceEndFrames,
  SYNTAX_SCENE_DURATION);
addScene(froms[4], narrations.multiCaseScene, AUDIO_CONFIG.multiCaseScene.speechStartFrame,
  AUDIO_CONFIG.multiCaseScene.narrationSplits, AUDIO_CONFIG.multiCaseScene.sentenceEndFrames,
  AUDIO_CONFIG.multiCaseScene.durationInFrames);
addScene(froms[5], narrations.summaryScene, AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits, AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames);

export const SRT_DATA = entries;
