import React from "react";
import { uiFont } from "../fonts";

interface SceneTitleProps {
  title: string;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({ title }) => (
  <div
    style={{
      position: "absolute",
      top: 40,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: uiFont,
      fontSize: 28,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: 1,
    }}
  >
    {title}
  </div>
);
