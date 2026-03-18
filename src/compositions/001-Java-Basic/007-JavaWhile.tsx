// src/compositions/001-Java-Basic/007-JavaWhile.tsx
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
} from "remotion";
import { RATE, VOICE } from "../../global.config";
import { AUDIO_CONFIG } from "./007-audio";
import {
  CROSS,
} from "../../utils/scene";

export { RATE, VOICE };

// ── 색상 상수 ─────────────────────────────────────────────────
const C_WHILE  = "#c586c0"; // while 키워드 — 보라
const C_COND   = "#e5c07b"; // 조건식 — amber
const C_TEAL   = "#4ec9b0"; // 카운터/증감/참 — teal
const C_RED    = "#f47c7c"; // 거짓/경고
const C_NUM    = "#b5cea8"; // 숫자 리터럴
const C_INT    = "#4e9cd5"; // int 키워드
const C_DIM    = "rgba(255,255,255,0.22)";

// 색상 상수는 이후 씬 구현에서 사용됨 — 미사용 경고 억제
void [C_WHILE, C_COND, C_TEAL, C_RED, C_NUM, C_INT, C_DIM];

// ── VIDEO_CONFIG ──────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  overview: {
    audio: "while-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.overview.speechStartFrame,
    narration: [
      "반복문에는 여러 종류가 있습니다.",
      "그 중 기본인 [while(발음:와일)] 문을 알아보겠습니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.overview.narrationSplits,
  },
  intro: {
    audio: "while-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: [
      "[while(발음:와일)] 문은 조건이 참인 동안 코드 블록을 반복 실행합니다.",
      "조건이 거짓이 되는 순간 반복을 멈춥니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
  whileScene: {
    audio: "while-while.mp3",
    durationInFrames: AUDIO_CONFIG.whileScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.whileScene.speechStartFrame,
    narration: [
      "괄호 안 조건이 참이면 블록을 실행하고 다시 조건을 확인합니다.",
      "카운터를 증가시켜 조건을 변화시키고 반복이 끝나게 합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.whileScene.narrationSplits,
  },
  executionScene: {
    audio: "while-execution.mp3",
    durationInFrames: AUDIO_CONFIG.executionScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.executionScene.speechStartFrame,
    narration: [
      "count가 1일 때 조건이 참이므로 블록을 실행합니다.",
      "count가 6이 되면 조건이 거짓이 되어 반복이 종료됩니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.executionScene.narrationSplits,
  },
  infiniteScene: {
    audio: "while-infinite.mp3",
    durationInFrames: AUDIO_CONFIG.infiniteScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.infiniteScene.speechStartFrame,
    narration: [
      "탈출 조건이 없으면 무한루프가 됩니다.",
      "반드시 조건을 거짓으로 만드는 코드가 필요합니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.infiniteScene.narrationSplits,
  },
  summaryScene: {
    audio: "while-summary.mp3",
    durationInFrames: AUDIO_CONFIG.summaryScene.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.summaryScene.speechStartFrame,
    narration: [
      "[while(발음:와일)]은 조건이 참인 동안 반복합니다.",
      "조건이 거짓이 되면 멈춥니다.",
    ] as string[],
    narrationSplits: AUDIO_CONFIG.summaryScene.narrationSplits,
  },
};

// ── 스텁 씬 컴포넌트 — 다음 태스크에서 완전히 구현 ───────────
const ThumbnailScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#050510" }} />
);

const OverviewScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.overview.audio)} />
  </AbsoluteFill>
);

const IntroScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.intro.audio)} />
  </AbsoluteFill>
);

const WhileScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.whileScene.audio)} />
  </AbsoluteFill>
);

const ExecutionScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.executionScene.audio)} />
  </AbsoluteFill>
);

const InfiniteScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.infiniteScene.audio)} />
  </AbsoluteFill>
);

const SummaryScene: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Audio src={staticFile(VIDEO_CONFIG.summaryScene.audio)} />
  </AbsoluteFill>
);

// ── sceneList + fromValues ────────────────────────────────────
const sceneList = [
  VIDEO_CONFIG.thumbnail,
  VIDEO_CONFIG.overview,
  VIDEO_CONFIG.intro,
  VIDEO_CONFIG.whileScene,
  VIDEO_CONFIG.executionScene,
  VIDEO_CONFIG.infiniteScene,
  VIDEO_CONFIG.summaryScene,
];

let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;

// ── Composition 메타 ──────────────────────────────────────────
export const compositionMeta = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: totalDuration,
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export const JavaWhile: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={fromValues[0]} durationInFrames={VIDEO_CONFIG.thumbnail.durationInFrames}>
      <ThumbnailScene />
    </Sequence>
    <Sequence from={fromValues[1]} durationInFrames={VIDEO_CONFIG.overview.durationInFrames}>
      <OverviewScene />
    </Sequence>
    <Sequence from={fromValues[2]} durationInFrames={VIDEO_CONFIG.intro.durationInFrames}>
      <IntroScene />
    </Sequence>
    <Sequence from={fromValues[3]} durationInFrames={VIDEO_CONFIG.whileScene.durationInFrames}>
      <WhileScene />
    </Sequence>
    <Sequence from={fromValues[4]} durationInFrames={VIDEO_CONFIG.executionScene.durationInFrames}>
      <ExecutionScene />
    </Sequence>
    <Sequence from={fromValues[5]} durationInFrames={VIDEO_CONFIG.infiniteScene.durationInFrames}>
      <InfiniteScene />
    </Sequence>
    <Sequence from={fromValues[6]} durationInFrames={VIDEO_CONFIG.summaryScene.durationInFrames}>
      <SummaryScene />
    </Sequence>
  </AbsoluteFill>
);

export const Component = JavaWhile;
