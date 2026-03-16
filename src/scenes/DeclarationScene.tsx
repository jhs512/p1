import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "int age;" = 8자 → 8/10*30 = 24프레임 후 완료 → frame 44
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(8 / CHARS_PER_SEC * 30);

export const DeclarationScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
      <Audio src={staticFile("scene1.mp3")} />
      <SceneTitle title="1. 변수 선언 (Declaration)" />
      <CodeBox
        lines={[{ text: "int age;", isNew: true }]}
        startFrame={TYPING_START}
      />
      <Caption
        text="변수를 사용하기 전에 반드시 선언해야 합니다"
        fadeInStartFrame={TYPING_DONE_FRAME}
      />
    </AbsoluteFill>
  );
};
