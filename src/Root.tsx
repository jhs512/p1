import React from "react";
import { Composition } from "remotion";

// compositions/ 폴더의 모든 .tsx 파일을 자동으로 불러옵니다.
// 새 영상을 추가하려면 compositions/ 에 파일을 만들고 아래 exports 를 추가하면 됩니다:
//   export const compositionMeta = { id, fps, width, height }
//   export const VIDEO_CONFIG = { sceneA: { durationInFrames }, ... }
//   export const Component: React.FC = ...

interface CompositionModule {
  compositionMeta: { fps: number; width: number; height: number; durationInFrames?: number };
  VIDEO_CONFIG: Record<string, { durationInFrames: number }>;
  Component: React.FC;
}

const ctx = require.context("./compositions", true, /\d+-.*\.tsx$/);
const modules = ctx
  .keys()
  .map((key: string) => {
    const mod = ctx(key) as CompositionModule;
    // 경로에서 ID 직접 추출: "./1/001-JavaVariables.tsx" → "1/001"
    // dir: "1",  episode prefix: "001"
    const segments = key.replace(/^\.\//, "").split("/");
    const dir      = segments.slice(0, -1).join("/");           // "1"
    const epMatch  = segments[segments.length - 1].match(/^(\d+)-/);
    const ep       = epMatch ? epMatch[1] : segments[segments.length - 1];
    const compositionId = dir ? `${dir}/${ep}` : ep;
    return { mod, numericId: compositionId };
  })
  .filter(({ mod }) => mod.compositionMeta && mod.VIDEO_CONFIG && mod.Component);

export const RemotionRoot: React.FC = () => (
  <>
    {modules.map(({ mod, numericId }) => {
      const totalFrames = mod.compositionMeta.durationInFrames
        ?? Object.values(mod.VIDEO_CONFIG).reduce((sum, s) => sum + s.durationInFrames, 0);
      return (
        <Composition
          key={numericId}
          id={numericId!}
          component={mod.Component}
          durationInFrames={totalFrames}
          fps={mod.compositionMeta.fps}
          width={mod.compositionMeta.width}
          height={mod.compositionMeta.height}
          defaultProps={{}}
        />
      );
    })}
  </>
);
