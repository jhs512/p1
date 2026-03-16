import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { uiFont } from "../fonts";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#1e1e1e", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 24 }}>
      <Audio src={staticFile("intro.mp3")} />
      <div style={{ fontFamily: uiFont, fontSize: 52, fontWeight: 700, color: "#ffffff", opacity: titleOpacity }}>
        Java 변수란?
      </div>
      <div style={{ fontFamily: uiFont, fontSize: 26, color: "#aaaaaa", opacity: subtitleOpacity }}>
        변수는 값을 담는 그릇입니다
      </div>
    </AbsoluteFill>
  );
};
