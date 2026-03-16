import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Intro } from "../scenes/Intro";
import { DeclarationScene } from "../scenes/DeclarationScene";
import { InitScene } from "../scenes/InitScene";
import { PrintScene } from "../scenes/PrintScene";
import { Outro } from "../scenes/Outro";

export const JavaVariables: React.FC = () => (
  <AbsoluteFill style={{ background: "#1e1e1e" }}>
    <Sequence from={0} durationInFrames={60}>
      <Intro />
    </Sequence>
    <Sequence from={60} durationInFrames={240}>
      <DeclarationScene />
    </Sequence>
    <Sequence from={300} durationInFrames={240}>
      <InitScene />
    </Sequence>
    <Sequence from={540} durationInFrames={240}>
      <PrintScene />
    </Sequence>
    <Sequence from={780} durationInFrames={120}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
