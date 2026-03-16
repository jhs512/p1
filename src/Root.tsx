import React from "react";
import { Composition, Folder } from "remotion";

// compositions/ 폴더의 모든 .tsx 파일을 자동으로 불러옵니다.
// 새 영상을 추가하려면 compositions/<series>/ 에 파일을 만들고 아래 exports 를 추가하면 됩니다:
//   export const compositionMeta = { fps, width, height }
//   export const VIDEO_CONFIG = { sceneA: { durationInFrames }, ... }
//   export const Component: React.FC = ...
//
// 파일 경로 → Remotion ID 규칙:
//   src/compositions/001-Java-Basic/001-JavaVariables.tsx  →  folder "001-Java-Basic", id "001"
//   render: remotion render 001

interface CompositionModule {
  compositionMeta: { fps: number; width: number; height: number; durationInFrames?: number };
  VIDEO_CONFIG: Record<string, { durationInFrames: number }>;
  Component: React.FC;
}

const ctx = require.context("./compositions", true, /\d+-.*\.tsx$/);
const entries = ctx
  .keys()
  .map((key: string) => {
    const mod = ctx(key) as CompositionModule;
    if (!mod.compositionMeta || !mod.VIDEO_CONFIG || !mod.Component) return null;
    // 경로 파싱: "./1/001-JavaVariables.tsx"
    const segments = key.replace(/^\.\//, "").split("/");
    const dir      = segments.slice(0, -1).join("/");              // "001-Java-Basic"  (시리즈 폴더)
    const epMatch  = segments[segments.length - 1].match(/^(\d+)-/);
    const epNum    = epMatch ? epMatch[1] : segments[segments.length - 1]; // "001"
    const dirPrefix = dir.match(/^(\d+)/)?.[1] ?? dir;             // "001" (폴더 앞 숫자)
    const ep       = dirPrefix ? `${dirPrefix}-${epNum}` : epNum;  // "001-001"
    const totalFrames = mod.compositionMeta.durationInFrames
      ?? Object.values(mod.VIDEO_CONFIG).reduce((sum, s) => sum + s.durationInFrames, 0);
    return { mod, dir, ep, totalFrames };
  })
  .filter(Boolean) as { mod: CompositionModule; dir: string; ep: string; totalFrames: number }[];

// 시리즈별로 그룹핑
const byFolder = entries.reduce<Record<string, typeof entries>>((acc, e) => {
  (acc[e.dir] ??= []).push(e);
  return acc;
}, {});

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(byFolder).map(([folder, items]) => (
      <Folder key={folder} name={folder}>
        {items.map(({ mod, ep, totalFrames }) => (
          <Composition
            key={ep}
            id={ep}
            component={mod.Component}
            durationInFrames={totalFrames}
            fps={mod.compositionMeta.fps}
            width={mod.compositionMeta.width}
            height={mod.compositionMeta.height}
            defaultProps={{}}
          />
        ))}
      </Folder>
    ))}
  </>
);
