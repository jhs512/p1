import { useCurrentFrame, useVideoConfig } from "remotion";

export function useTypingEffect(
  text: string,
  startFrame: number,
  charsPerSecond = 10
): { visibleText: string; isDone: boolean } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsVisible = Math.floor(
    Math.max(0, frame - startFrame) / fps * charsPerSecond
  );
  return {
    visibleText: text.slice(0, charsVisible),
    isDone: charsVisible >= text.length,
  };
}
