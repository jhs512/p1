import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { ConsoleOutput } from "../components/ConsoleOutput";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "System.out.println(age);" = 26자 → Math.ceil(26/10*30) = 78프레임 후 완료
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(26 / CHARS_PER_SEC * 30);

export const PrintScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
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
