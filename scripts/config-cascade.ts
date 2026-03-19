/**
 * config-cascade.ts — 4단계 config cascade 로딩
 *
 * 우선순위 (낮은 순서 → 높은 순서):
 *   1. 루트  src/config.ts
 *   2. 강좌  {seriesDir}/config.ts
 *   3. 강의  {seriesDir}/{episodeId}.config.ts  (optional)
 *
 * 주의: config 파일은 remotion 심볼을 import하면 안 됨 (esbuild로 번들링됨)
 */

import { buildSync } from "esbuild";
import { existsSync } from "fs";
import path from "path";

/** TypeScript config 파일을 esbuild로 번들하여 exports 객체로 반환 */
export function loadTsExports(filePath: string): Record<string, unknown> {
  if (!existsSync(filePath)) return {};
  const result = buildSync({
    entryPoints: [filePath],
    bundle: true,
    format: "cjs",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  const mod = { exports: {} as Record<string, unknown> };
  // eslint-disable-next-line no-new-func
  new Function("module", "exports", "require", code)(mod, mod.exports, require);
  return mod.exports as Record<string, unknown>;
}

/**
 * 루트 → 강좌 → 강의 순으로 merge (오른쪽이 이긴다)
 * @param seriesDir  강좌 폴더 경로 (config.ts 포함)
 * @param episodeId  강의 ID (예: "001") — {episodeId}.config.ts 탐색
 * @param rootConfigPath  루트 config 경로 (기본: "src/config.ts")
 */
export function loadMergedConfig(
  seriesDir: string,
  episodeId: string,
  rootConfigPath = "src/config.ts",
): Record<string, unknown> {
  const root    = loadTsExports(rootConfigPath);
  const course  = loadTsExports(path.join(seriesDir, "config.ts"));
  const episode = loadTsExports(path.join(seriesDir, `${episodeId}.config.ts`));
  return { ...root, ...course, ...episode };
}
