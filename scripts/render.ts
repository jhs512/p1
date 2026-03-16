/**
 * scripts/render.ts
 *
 * 사용법: pnpm render <series>/<id>
 *   예)  pnpm render 001-Java-Basic/001
 *        pnpm render 001-Java-Basic/002
 *
 * Remotion CLI는 "002"를 parseInt로 "2"로 바꾸는 버그가 있어서
 * 이 스크립트는 programmatic API로 렌더링한다.
 */

import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: pnpm render <series>/<id>   e.g.  pnpm render 001-Java-Basic/001");
  process.exit(1);
}

const parts = arg.split("/");
const seriesDir  = parts.slice(0, -1).join("/");  // "001-Java-Basic"
const episodeNum = parts[parts.length - 1];        // "001"
const dirPrefix  = seriesDir.match(/^(\d+)/)?.[1] ?? "";
const compositionId = dirPrefix ? `${dirPrefix}-${episodeNum}` : episodeNum; // "001-001"

const OUTPUT_DIR = "out/" + (seriesDir || episodeNum);
const OUTPUT_FILE = path.join(OUTPUT_DIR, episodeNum + ".mp4");

(async () => {
  console.log(`\n🎬  Rendering composition "${compositionId}" → ${OUTPUT_FILE}\n`);

  // 1) Bundle
  console.log("📦  Bundling...");
  const bundled = await bundle({
    entryPoint: path.resolve("src/index.ts"),
    webpackOverride: (config) => config,
  });

  // 2) Select composition
  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
  });

  // 3) Render
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: OUTPUT_FILE,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r⏳  ${(progress * 100).toFixed(1)}%`);
    },
  });

  console.log(`\n\n✅  Done: ${OUTPUT_FILE}`);
})().catch((err) => {
  console.error("\n❌ ", err.message ?? err);
  process.exit(1);
});
