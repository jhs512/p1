/**
 * scripts/srt.ts
 *
 *   단일 에피소드:  pnpm srt 001-Java-Basic/KOR/001
 *   시리즈 전체:   pnpm srt 001
 *   전체:          pnpm srt
 */
import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";

const SRC_DIR = "src/compositions";
const arg = process.argv[2] ?? "";

// ── 대상 목록 수집 (render.ts 동일 로직) ─────────────────────
function collectTargets(): { seriesDir: string; episodeNum: string }[] {
  const allSeries = readdirSync(SRC_DIR)
    .filter((d) => statSync(path.join(SRC_DIR, d)).isDirectory())
    .sort();

  if (!arg) {
    return allSeries.flatMap((s) => episodesOf(s));
  }

  if (arg.includes("/")) {
    const parts = arg.split("/");
    const episodeNum = parts[parts.length - 1];
    const seriesArg = parts[0];
    const seriesDir =
      allSeries.find((d) => d === seriesArg) ??
      allSeries.find((d) => d.startsWith(seriesArg));
    if (!seriesDir) {
      console.error(`No series folder matching "${seriesArg}" found.`);
      process.exit(1);
    }
    return [{ seriesDir, episodeNum }];
  }

  const matched = allSeries.filter((d) => d.startsWith(arg));
  if (matched.length === 0) {
    console.error(`No series folder matching "${arg}" found.`);
    process.exit(1);
  }
  return matched.flatMap((s) => episodesOf(s));
}

function episodesOf(seriesDir: string) {
  const seriesPath = path.join(SRC_DIR, seriesDir);
  const entries = readdirSync(seriesPath, { withFileTypes: true });
  const langDirs = entries
    .filter((e) => e.isDirectory() && /^[A-Z]{2,3}$/.test(e.name))
    .map((e) => e.name);
  const scanDirs = langDirs.length > 0 ? langDirs.map((l) => path.join(seriesPath, l)) : [seriesPath];

  return scanDirs
    .flatMap((dir) =>
      readdirSync(dir)
        .filter((f) => /^\d+-4-sub\.gen\.ts$/.test(f))
        .map((f) => f.match(/^(\d+)-4-/)?.[1])
        .filter((ep): ep is string => !!ep)
        .map((episodeNum) => ({ seriesDir, episodeNum })),
    )
    .sort((a, b) => a.episodeNum.localeCompare(b.episodeNum));
}

// ── 프레임 → SRT 타임스탬프 변환 ────────────────────────────
function frameToTimestamp(frame: number, fps: number): string {
  const ms = Math.round((frame / fps) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msPart = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(msPart).padStart(3, "0")}`;
}

// ── SRT 문자열 생성 ───────────────────────────────────────────
function buildSRT(
  entries: Array<{ startFrame: number; endFrame: number; text: string }>,
  fps: number,
): string {
  if (entries.length === 0) return "";
  return (
    entries
      .map((entry, i) => {
        const start = frameToTimestamp(entry.startFrame, fps);
        const end = frameToTimestamp(entry.endFrame, fps);
        return `${i + 1}\n${start} --> ${end}\n${entry.text}`;
      })
      .join("\n\n") + "\n"
  );
}

// ── 메인 ─────────────────────────────────────────────────────
(async () => {
  const targets = collectTargets();
  if (targets.length === 0) {
    console.error("No targets found.");
    process.exit(1);
  }

  for (const { seriesDir, episodeNum } of targets) {
    // {id}-srt.ts 파일 경로 탐색 — 언어 서브폴더(KOR 등) 안도 확인
    const seriesPath = path.join(SRC_DIR, seriesDir);
    const srtFile = `${episodeNum}-4-sub.gen.ts`;

    const seriesEntries = readdirSync(seriesPath, { withFileTypes: true });
    const langDirs = seriesEntries
      .filter((e) => e.isDirectory() && /^[A-Z]{2,3}$/.test(e.name))
      .map((e) => path.join(seriesPath, e.name));
    const searchDirs = langDirs.length > 0 ? langDirs : [seriesPath];

    const foundDir = searchDirs.find((d) => readdirSync(d).includes(srtFile));
    if (!foundDir) {
      console.error(`  No srt file for episode ${episodeNum} in ${seriesDir}`);
      continue;
    }
    const srtFilePath = path.join(foundDir, srtFile);
    const compFile = path.resolve(srtFilePath);

    // 동적 import
    let mod: { SRT_DATA?: unknown; fps?: number };
    try {
      mod = await import(compFile);
    } catch (err) {
      console.error(`  Failed to import ${compFile}:`, (err as Error).message);
      continue;
    }

    const srtData = mod.SRT_DATA;
    const fps = mod.fps ?? 30;

    if (!Array.isArray(srtData)) {
      console.warn(
        `  ${srtFilePath}: SRT_DATA not found or not an array — skipping`,
      );
      continue;
    }

    const srtContent = buildSRT(
      srtData as Array<{ startFrame: number; endFrame: number; text: string }>,
      fps,
    );

    const outputDir = path.join("out", seriesDir);
    mkdirSync(outputDir, { recursive: true });
    const outputFile = path.join(outputDir, `${episodeNum}.srt`);
    writeFileSync(outputFile, srtContent, "utf-8");

    console.log(
      `  ${srtFile} -> ${outputFile} (${(srtData as unknown[]).length} cues)`,
    );
  }

  console.log(`\nDone. ${targets.length} episode(s) processed.`);
})().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
