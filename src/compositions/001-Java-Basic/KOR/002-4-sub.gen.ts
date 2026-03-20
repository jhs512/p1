/**
 * 002-srt.ts — 002-JavaDataTypes SRT 데이터
 * scripts/srt.ts 가 이 파일을 import해서 .srt 파일 생성
 * Remotion 의존성 없음
 */
import { CROSS } from "../../../config";
import { toDisplayText } from "../../../utils/narration";
import { AUDIO_CONFIG } from "./002-3-audio.gen";
import { FPS } from "./config";

export const fps = FPS;

const narrations = {
  intro: [
    "자료형이란 자료의 형태, 즉 데이터의 형태입니다.",
    "자료형은 변수에 어떤 종류의 데이터를\n넣을 수 있는지 결정합니다.",
    "[Java(발음:자바)]의 주요 자료형 4개를 알아보겠습니다.",
  ],
  valueVsVar: [
    "먼저 자료형 값과 자료형 변수의\n차이를 살펴보겠습니다.",
    "int형 값은 숫자 25처럼 데이터 자체입니다.",
    "int형 변수는\n그 값을 담는 이름 있는 공간입니다.",
  ],
  intScene: [
    "int는 정수를 표현하는 자료형입니다.",
    "int형 변수는 소수점 없는 정수만\n담을 수 있습니다.",
    "나이나 [개수(발음:개쑤)]처럼\n소수점이 없는 숫자에 사용합니다.",
  ],
  doubleScene: [
    "[double(발음:더블)]은 실수를 표현하는 자료형입니다.",
    "[double(발음:더블)]형 변수는 소수점이 있는 수를 담습니다.",
    "키나 무게처럼 정밀한 값이 필요할 때 사용합니다.",
  ],
  stringScene: [
    "String은 문자열을 표현하는 자료형입니다.",
    "String형 변수는 텍스트 데이터를 담습니다.",
    "정확히는 참조이지만, 지금은 넘어가겠습니다.",
    "이름이나 메시지처럼 텍스트를 다룰 때 사용합니다.",
  ],
  booleanScene: [
    "boolean은 참 또는 거짓을 표현하는 자료형입니다.",
    "boolean형 변수는\ntrue 또는 false 값만 가질 수 있습니다.",
    "조건 검사 결과를 담을 때 사용합니다.",
  ],
  summaryScene: [
    "네 가지 자료형을 코드로 정리하면 이렇습니다.",
    "상황에 맞는 자료형을 선택하는 것이 중요합니다.",
  ],
};

const sceneDurations = [
  30, // thumbnail
  AUDIO_CONFIG.intro.durationInFrames,
  AUDIO_CONFIG.valueVsVar.durationInFrames,
  AUDIO_CONFIG.intScene.durationInFrames,
  AUDIO_CONFIG.doubleScene.durationInFrames,
  AUDIO_CONFIG.stringScene.durationInFrames,
  AUDIO_CONFIG.booleanScene.durationInFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
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
  narrations.intro,
  AUDIO_CONFIG.intro.speechStartFrame,
  AUDIO_CONFIG.intro.narrationSplits,
  AUDIO_CONFIG.intro.sentenceEndFrames,
  AUDIO_CONFIG.intro.durationInFrames,
);
addScene(
  froms[2],
  narrations.valueVsVar,
  AUDIO_CONFIG.valueVsVar.speechStartFrame,
  AUDIO_CONFIG.valueVsVar.narrationSplits,
  AUDIO_CONFIG.valueVsVar.sentenceEndFrames,
  AUDIO_CONFIG.valueVsVar.durationInFrames,
);
addScene(
  froms[3],
  narrations.intScene,
  AUDIO_CONFIG.intScene.speechStartFrame,
  AUDIO_CONFIG.intScene.narrationSplits,
  AUDIO_CONFIG.intScene.sentenceEndFrames,
  AUDIO_CONFIG.intScene.durationInFrames,
);
addScene(
  froms[4],
  narrations.doubleScene,
  AUDIO_CONFIG.doubleScene.speechStartFrame,
  AUDIO_CONFIG.doubleScene.narrationSplits,
  AUDIO_CONFIG.doubleScene.sentenceEndFrames,
  AUDIO_CONFIG.doubleScene.durationInFrames,
);
addScene(
  froms[5],
  narrations.stringScene,
  AUDIO_CONFIG.stringScene.speechStartFrame,
  AUDIO_CONFIG.stringScene.narrationSplits,
  AUDIO_CONFIG.stringScene.sentenceEndFrames,
  AUDIO_CONFIG.stringScene.durationInFrames,
);
addScene(
  froms[6],
  narrations.booleanScene,
  AUDIO_CONFIG.booleanScene.speechStartFrame,
  AUDIO_CONFIG.booleanScene.narrationSplits,
  AUDIO_CONFIG.booleanScene.sentenceEndFrames,
  AUDIO_CONFIG.booleanScene.durationInFrames,
);
addScene(
  froms[7],
  narrations.summaryScene,
  AUDIO_CONFIG.summaryScene.speechStartFrame,
  AUDIO_CONFIG.summaryScene.narrationSplits,
  AUDIO_CONFIG.summaryScene.sentenceEndFrames,
  AUDIO_CONFIG.summaryScene.durationInFrames,
);

export const SRT_DATA = entries;
