/**
 * scripts/render.ts — 사용법: pnpm render <series>/<id>
 *   예) pnpm render 001-Java-Basic/001
 */
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const arg = process.argv[2];
if (!arg) { console.error("Usage: pnpm render <series>/<id>"); process.exit(1); }

const parts = arg.split("/");
const seriesDir  = parts.slice(0, -1).join("/");
const episodeNum = parts[parts.length - 1];
const dirPrefix  = seriesDir.match(/^(\d+)/)?.[1] ?? "";
const compositionId = dirPrefix ? `${dirPrefix}-${episodeNum}` : episodeNum;

const OUTPUT_DIR  = "out/" + (seriesDir || episodeNum);
const OUTPUT_FILE = path.join(OUTPUT_DIR, episodeNum + ".mp4");

(async () => {
  console.log(`\n🎬  Rendering "${compositionId}" → ${OUTPUT_FILE}\n`);
  const bundled = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });
  const composition = await selectComposition({ serveUrl: bundled, id: compositionId });
  await renderMedia({
    composition, serveUrl: bundled, codec: "h264", outputLocation: OUTPUT_FILE,
    onProgress: ({ progress }) => process.stdout.write(`\r⏳  ${(progress * 100).toFixed(1)}%`),
  });
  console.log(`\n\n✅  Done: ${OUTPUT_FILE}`);
})().catch((err) => { console.error("\n❌ ", err.message ?? err); process.exit(1); });
