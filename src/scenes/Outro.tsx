import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const screenFade = interpolate(frame, [90, 119], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#1e1e1e",
        justifyContent: "center",
        alignItems: "center",
        opacity: screenFade,
      }}
    >
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 30,
          color: "#ffffff",
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        다음 시간: 자료형 (int, String, boolean)
      </div>
    </AbsoluteFill>
  );
};
