import React from "react";
import { monoFont } from "../fonts";
import { useTypingEffect } from "../hooks/useTypingEffect";

export interface CodeLine {
  text: string;
  isNew: boolean;
}

interface CodeBoxProps {
  lines: CodeLine[];
  startFrame: number;
  charsPerSecond?: number;
}

// isNew: false 줄 — 완성된 상태, dimmed
const StaticLine: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ opacity: 0.5, color: "#d4d4d4", lineHeight: "1.8" }}>
    {text}
  </div>
);

// isNew: true 줄 — 타이핑 애니메이션 + 토큰 컬러링
const TypingLine: React.FC<{ text: string; startFrame: number; charsPerSecond: number }> = ({
  text,
  startFrame,
  charsPerSecond,
}) => {
  const { visibleText } = useTypingEffect(text, startFrame, charsPerSecond);
  return (
    <div style={{ color: "#d4d4d4", lineHeight: "1.8" }}>
      <ColorizedCode text={visibleText} />
    </div>
  );
};

// 간단한 Java 토큰 컬러링 (int, String, boolean → #4ec9b0 / 숫자 → #b5cea8)
const ColorizedCode: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\bint\b|\bString\b|\bboolean\b|\b\d+\b)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^(int|String|boolean)$/.test(part)) {
          return <span key={i} style={{ color: "#4ec9b0" }}>{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} style={{ color: "#b5cea8" }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const CodeBox: React.FC<CodeBoxProps> = ({
  lines,
  startFrame,
  charsPerSecond = 10,
}) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#2d2d2d",
      borderRadius: 12,
      padding: "32px 48px",
      minWidth: 600,
      fontFamily: monoFont,
      fontSize: 26,
    }}
  >
    {lines.map((line, i) =>
      line.isNew ? (
        <TypingLine key={`new-${i}-${line.text}`} text={line.text} startFrame={startFrame} charsPerSecond={charsPerSecond} />
      ) : (
        <StaticLine key={`static-${i}-${line.text}`} text={line.text} />
      )
    )}
  </div>
);
