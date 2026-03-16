import "./fonts";
import React from "react";
import { Composition } from "remotion";
import { JavaVariables } from "./compositions/JavaVariables";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="JavaVariables"
      component={JavaVariables}
      durationInFrames={900}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{}}
    />
  </>
);
