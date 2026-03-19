/**
 * scripts/new.ts
 *
 * 사용법: pnpm new <series>/<lang>/<ep> --title <Title>
 * 예)    pnpm new 001-Java-Basic/KOR/010 --title "JavaArray"
 *
 * 생성 파일:
 *   src/compositions/{series}/{lang}/{ep}-1-{Title}.tsx
 *   src/compositions/{series}/{lang}/{ep}-2-content.ts
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

const SRC_DIR = "src/compositions";

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: pnpm new <series>/<lang>/<ep> --title <Title>");
  console.error("Example: pnpm new 001-Java-Basic/KOR/010 --title JavaArray");
  process.exit(1);
}

const titleIdx = process.argv.indexOf("--title");
const title = titleIdx !== -1 ? process.argv[titleIdx + 1] : "NewEpisode";
const titleCamel = title.replace(/\s+/g, "");

const parts = arg.split("/");
const episodeId = parts[parts.length - 1]; // "010"
const dirRelParts = parts.slice(0, -1); // ["001-Java-Basic", "KOR"]
const dirPath = path.join(SRC_DIR, ...dirRelParts);

mkdirSync(dirPath, { recursive: true });

const tsxPath = path.join(dirPath, `${episodeId}-1-${titleCamel}.tsx`);
const contentPath = path.join(dirPath, `${episodeId}-2-content.ts`);

if (existsSync(tsxPath) || existsSync(contentPath)) {
  console.error(`❌  파일이 이미 존재합니다.`);
  if (existsSync(tsxPath)) console.error(`   ${tsxPath}`);
  if (existsSync(contentPath)) console.error(`   ${contentPath}`);
  process.exit(1);
}

const depthUp = dirRelParts.length + 1; // tsx -> types/episode 상대 경로
const typesRelPath = Array(depthUp).fill("..").join("/");

// ── content.ts 스텁 ────────────────────────────────────────────
writeFileSync(
  contentPath,
  `// ${episodeId}-2-content.ts
import type { EpisodeContent } from "${typesRelPath}/types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\\n${title}",
    badge: "${title}",
  },
  overview: {
    narration: ["나레이션 첫 번째 문장.", "나레이션 두 번째 문장."],
  },
  // 씬을 추가하세요...
} satisfies EpisodeContent;
`,
  "utf-8",
);

// ── main tsx 스텁 ──────────────────────────────────────────────
const audioGenPath = `./${episodeId}-3-audio.gen`;
const contentImportPath = `./${episodeId}-2-content`;
const utilsRelPath = Array(depthUp).fill("..").join("/");

writeFileSync(
  tsxPath,
  `// ${episodeId}-1-${titleCamel}.tsx
import { AbsoluteFill, Sequence } from "remotion";
import { Audio } from "@remotion/media";
import React from "react";

import { CROSS, Subtitle, useFade } from "${utilsRelPath}/utils/scene";
import { ThumbnailScene } from "${utilsRelPath}/components/ThumbnailScene";
import { AUDIO_CONFIG } from "${audioGenPath}";
import { CONTENT } from "${contentImportPath}";

// ── compositionMeta ───────────────────────────────────────────
export const compositionMeta = {
  fps: 30,
  width: 1080,
  height: 1920,
} as const;

// ── VIDEO_CONFIG ───────────────────────────────────────────────
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  overview: {
    audio: "${title.toLowerCase()}-overview.mp3",
    durationInFrames: AUDIO_CONFIG.overview?.durationInFrames ?? 30,
    speechStartFrame: AUDIO_CONFIG.overview?.speechStartFrame ?? 0,
    narration: CONTENT.overview.narration as string[],
    narrationSplits: AUDIO_CONFIG.overview?.narrationSplits ?? [],
  },
  // 씬을 추가하세요...
} as const;

// ── Component ─────────────────────────────────────────────────
let _offset = 0;
function seq(key: keyof typeof VIDEO_CONFIG) {
  const cfg = VIDEO_CONFIG[key];
  const start = _offset;
  _offset += cfg.durationInFrames - CROSS;
  return { start, d: cfg.durationInFrames };
}

export const Component: React.FC = () => {
  _offset = 0;
  const thumb = seq("thumbnail");
  const overview = seq("overview");

  return (
    <AbsoluteFill style={{ background: "#050510" }}>
      <Sequence from={thumb.start} durationInFrames={thumb.d}>
        <ThumbnailScene
          seriesLabel={CONTENT.thumbnail?.seriesLabel ?? "JAVA"}
          title={CONTENT.thumbnail?.title ?? "${title}"}
          badge={CONTENT.thumbnail?.badge ?? "${title}"}
        />
      </Sequence>
      <Sequence from={overview.start} durationInFrames={overview.d}>
        {/* TODO: OverviewScene 구현 */}
        <AbsoluteFill style={{ background: "#050510" }} />
      </Sequence>
    </AbsoluteFill>
  );
};
`,
  "utf-8",
);

console.log(`✅  Created:`);
console.log(`   ${tsxPath}`);
console.log(`   ${contentPath}`);
console.log(`\n▶  Next steps:`);
console.log(`   1. 나레이션 작성: ${contentPath}`);
console.log(`   2. pnpm sync ${arg}`);
console.log(`   3. 씬 컴포넌트 구현: ${tsxPath}`);
