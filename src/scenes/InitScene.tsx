import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CodeBox } from "../components/CodeBox";
import { SceneTitle } from "../components/SceneTitle";
import { Caption } from "../components/Caption";

const TYPING_START = 20;
const CHARS_PER_SEC = 10;
// "age = 25;" = 9자 → Math.ceil(9/10*30) = 27프레임 후 완료
const TYPING_DONE_FRAME = TYPING_START + Math.ceil(9 / CHARS_PER_SEC * 30);

export const InitScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [231, 239], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", opacity: fadeOut }}>
      <Audio src={staticFile("scene2.mp3")} />
      <SceneTitle title="2. 변수 초기화 (Initialization)" />
      <CodeBox
        lines={[
          { text: "int age;", isNew: false },
          { text: "age = 25;", isNew: true },
        ]}
        startFrame={TYPING_START}
      />
      <Caption
        text="변수에 처음으로 값을 넣는 것을 초기화라고 합니다"
        fadeInStartFrame={TYPING_DONE_FRAME}
      />
    </AbsoluteFill>
  );
};
