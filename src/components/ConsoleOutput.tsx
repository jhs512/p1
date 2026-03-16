import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { monoFont } from "../fonts";

interface ConsoleOutputProps {
  text: string;
  startFrame: number;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(50% + 120px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0a0a0a",
        borderRadius: 8,
        padding: "12px 32px",
        fontFamily: monoFont,
        fontSize: 22,
        color: "#89d185",
        opacity,
        minWidth: 300,
        textAlign: "left",
      }}
    >
      {text}
    </div>
  );
};
