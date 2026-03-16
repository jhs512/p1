import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";

interface CaptionProps {
  text: string;
  fadeInStartFrame: number;
}

export const Caption: React.FC<CaptionProps> = ({ text, fadeInStartFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInStartFrame, fadeInStartFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: uiFont,
        fontSize: 22,
        color: "#cccccc",
        opacity,
      }}
    >
      {text}
    </div>
  );
};
