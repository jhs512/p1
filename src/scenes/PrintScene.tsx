import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { ConsoleOutput } from "../components/ConsoleOutput";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "System.out.println(age);" = 24자 → Math.ceil(24/10*30) = 72프레임 후 완료 → frame 92
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(24 / CHARS_PER_SEC * 30);

export const PrintScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
      <Audio src={staticFile("scene3.mp3")} />
      <SceneTitle title="3. 변수 출력 (Print)" />
      <CodeBox
        lines={[
          { text: "int age;", isNew: false },
          { text: "age = 25;", isNew: false },
          { text: "System.out.println(age);", isNew: true },
        ]}
        startFrame={TYPING_START}
      />
      <ConsoleOutput text="> 25" startFrame={TYPING_DONE_FRAME} />
      <Caption
        text="println()으로 변수의 값을 출력할 수 있습니다"
        fadeInStartFrame={TYPING_DONE_FRAME}
      />
    </AbsoluteFill>
  );
};
