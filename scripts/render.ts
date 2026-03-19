/**
 * scripts/render.ts
 *
 *   단일 에피소드:  pnpm render 001-Java-Basic/001
 *   시리즈 전체:   pnpm render 001          (001-* 폴더 안의 모든 에피소드)
 *   전체:          pnpm render              (모든 시리즈)
 */
import path from "path";
import { readdirSync, statSync, mkdirSync } from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const SRC_DIR = "src/compositions";
const arg = process.argv[2] ?? "";

// ── 렌더링 대상 목록 수집 ─────────────────────────────────────
// 반환 형식: [{ seriesDir, episodeNum }]
function collectTargets(): { seriesDir: string; episodeNum: string }[] {
  const allSeries = readdirSync(SRC_DIR)
    .filter((d) => statSync(path.join(SRC_DIR, d)).isDirectory())
    .sort();

  if (!arg) {
    // 전체 시리즈
    return allSeries.flatMap((s) => episodesOf(s));
  }

  if (arg.includes("/")) {
    // 단일 에피소드: 001-Java-Basic/001  또는  001/001 (prefix 축약)
    const parts      = arg.split("/");
    const seriesArg  = parts.slice(0, -1).join("/");
    const episodeNum = parts[parts.length - 1];
    // 정확히 일치하는 폴더 없으면 prefix로 검색
    const seriesDir  = allSeries.find((d) => d === seriesArg)
                    ?? allSeries.find((d) => d.startsWith(seriesArg));
    if (!seriesDir) {
      console.error(`❌  No series folder matching "${seriesArg}" found.`);
      process.exit(1);
    }
    return [{ seriesDir, episodeNum }];
  }

  // 시리즈 prefix: "001" → 001-* 폴더
  const matched = allSeries.filter((d) => d.startsWith(arg));
  if (matched.length === 0) {
    console.error(`❌  No series folder matching "${arg}" found.`);
    process.exit(1);
  }
  return matched.flatMap((s) => episodesOf(s));
}

function episodesOf(seriesDir: string) {
  return readdirSync(path.join(SRC_DIR, seriesDir))
    .filter((f) => /^\d+-.+\.tsx$/.test(f))
    .map((f) => f.match(/^(\d+)/)?.[1])
    .filter((ep): ep is string => !!ep)
    .sort()
    .map((episodeNum) => ({ seriesDir, episodeNum }));
}

// ── 메인 ─────────────────────────────────────────────────────
(async () => {
  const targets = collectTargets();
  if (targets.length === 0) { console.error("❌  No targets found."); process.exit(1); }

  console.log(`\n🎬  Bundling…`);
  const bundled = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });

  for (const { seriesDir, episodeNum } of targets) {
    const dirPrefix     = seriesDir.match(/^(\d+)/)?.[1] ?? "";
    const compositionId = dirPrefix ? `${dirPrefix}-${episodeNum}` : episodeNum;
    const outputDir     = path.join("out", seriesDir);
    const outputFile    = path.join(outputDir, episodeNum + ".mp4");

    mkdirSync(outputDir, { recursive: true });
    console.log(`\n▶  "${compositionId}" → ${outputFile}`);

    const composition = await selectComposition({ serveUrl: bundled, id: compositionId });
    await renderMedia({
      composition, serveUrl: bundled, codec: "h264", outputLocation: outputFile,
      onProgress: ({ progress }) => process.stdout.write(`\r   ⏳  ${(progress * 100).toFixed(1)}%`),
    });
    console.log(`\n   ✅  Done (${composition.width}×${composition.height})`);
  }

  console.log(`\n🎉  All ${targets.length} video(s) rendered.\n`);
})().catch((err) => { console.error("\n❌ ", err.message ?? err); process.exit(1); });
