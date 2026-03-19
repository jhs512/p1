import { Composition, Folder } from "remotion";

import React from "react";

// compositions/ 폴더의 모든 .tsx 파일을 자동으로 불러옵니다.
// 새 영상을 추가하려면 compositions/<series>/ 에 파일을 만들고 아래 exports 를 추가하면 됩니다:
//   export const compositionMeta = { fps, width, height }
//   export const VIDEO_CONFIG = { sceneA: { durationInFrames }, ... }
//   export const Component: React.FC = ...
//
// 파일 경로 → Remotion ID 규칙:
//   src/compositions/001-Java-Basic/KOR/001-1-JavaVariables.tsx  →  folder "001-Java-Basic > KOR", id "001"
//   render: pnpm render 001-Java-Basic/KOR/001

interface CompositionModule {
  compositionMeta: {
    fps: number;
    width: number;
    height: number;
    durationInFrames?: number;
  };
  VIDEO_CONFIG: Record<string, { durationInFrames: number }>;
  Component: React.FC;
}

const ctx = require.context("./compositions", true, /\d+-.*\.tsx$/);
const entries = ctx
  .keys()
  .map((key: string) => {
    const mod = ctx(key) as CompositionModule;
    if (!mod.compositionMeta || !mod.VIDEO_CONFIG || !mod.Component)
      return null;
    // 경로 파싱: "./001-Java-Basic/KOR/001-JavaVariables.tsx"
    const segments = key.replace(/^\.\//, "").split("/");
    const seriesFolder = segments[0]; // "001-Java-Basic" — Folder 그룹핑용
    // 파일 직전 세그먼트가 대문자 2~3자이면 언어 폴더로 간주
    const langFolder =
      segments.length >= 3 && /^[A-Z]{2,3}$/.test(segments[segments.length - 2])
        ? segments[segments.length - 2]
        : null; // "KOR"
    // 파일명 패턴: "001-1-JavaVariables.tsx" (에피소드번호-타입-이름)
    // 첫 번째 숫자 그룹이 에피소드 번호, 두 번째가 파일 타입 (1=tsx, 2=audio.gen, 3=sub.gen)
    const filename = segments[segments.length - 1];
    const epMatch = filename.match(/^(\d+)-\d+-/);
    const epMatchLegacy = filename.match(/^(\d+)-/);
    const epNum = epMatch ? epMatch[1] : (epMatchLegacy ? epMatchLegacy[1] : filename); // "001"
    const dirPrefix = seriesFolder.match(/^(\d+)/)?.[1] ?? seriesFolder; // "001"
    // 언어 폴더가 있으면 "001/KOR/001" 형태로 URL이 계층을 표현.
    // 언어 폴더가 없으면 기존 방식(001-001)으로 fallback.
    const ep = langFolder
      ? [dirPrefix, langFolder, epNum].join("/")
      : [dirPrefix, epNum].filter(Boolean).join("-");
    const totalFrames =
      mod.compositionMeta.durationInFrames ??
      Object.values(mod.VIDEO_CONFIG).reduce(
        (sum, s) => sum + s.durationInFrames,
        0,
      );
    return { mod, dir: seriesFolder, lang: langFolder, ep, totalFrames };
  })
  .filter(Boolean) as {
  mod: CompositionModule;
  dir: string;
  lang: string | null;
  ep: string;
  totalFrames: number;
}[];

// 시리즈 → 언어 2단계 그룹핑
type Entry = (typeof entries)[number];
const byFolder = entries.reduce<Record<string, Record<string, Entry[]>>>(
  (acc, e) => {
    const langKey = e.lang ?? "__none__";
    ((acc[e.dir] ??= {})[langKey] ??= []).push(e);
    return acc;
  },
  {},
);

const CompItem: React.FC<{ entry: Entry }> = ({ entry: { mod, ep, totalFrames } }) => (
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
);

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(byFolder).map(([series, byLang]) => (
      <Folder key={series} name={series}>
        {Object.entries(byLang).map(([lang, items]) =>
          lang === "__none__" ? (
            items.map((e) => <CompItem key={e.ep} entry={e} />)
          ) : (
            <Folder key={lang} name={lang}>
              {items.map((e) => <CompItem key={e.ep} entry={e} />)}
            </Folder>
          ),
        )}
      </Folder>
    ))}
  </>
);
