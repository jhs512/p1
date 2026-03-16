import React from "react";
import { Composition } from "remotion";

// compositions/ 폴더의 모든 .tsx 파일을 자동으로 불러옵니다.
// 새 영상을 추가하려면 compositions/ 에 파일을 만들고 아래 exports 를 추가하면 됩니다:
//   export const compositionMeta = { id, fps, width, height }
//   export const VIDEO_CONFIG = { sceneA: { durationInFrames }, ... }
//   export const Component: React.FC = ...

interface CompositionModule {
  compositionMeta: { id: string; fps: number; width: number; height: number; durationInFrames?: number };
  VIDEO_CONFIG: Record<string, { durationInFrames: number }>;
  Component: React.FC;
}

const ctx = require.context("./compositions", false, /\d+-.*\.tsx$/);
const modules = ctx
  .keys()
  .map((key: string) => {
    const mod = ctx(key) as CompositionModule;
    const match = key.match(/(\d+)-/);
    // compositionMeta.id 를 우선 사용. 없으면 파일명에서 추출한 숫자 ID 사용.
    const compositionId = mod.compositionMeta?.id ?? (match ? match[1] : undefined);
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
