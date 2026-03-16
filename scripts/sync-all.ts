/**
 * scripts/sync-all.ts
 *
 * 사용법: pnpm sync:all
 *
 * src/compositions/ 하위 모든 시리즈 폴더를 스캔하여
 * 각 에피소드를 순서대로 sync 처리한다.
 */

import { readdirSync, statSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

const SRC_DIR = "src/compositions";

const seriesDirs = readdirSync(SRC_DIR)
  .filter((d) => statSync(path.join(SRC_DIR, d)).isDirectory())
  .sort();

let anyFailed = false;

for (const series of seriesDirs) {
  const seriesPath = path.join(SRC_DIR, series);
  const episodes = readdirSync(seriesPath)
    .filter((f) => /^\d+-.+\.tsx$/.test(f))
    .map((f) => f.match(/^(\d+)/)?.[1])
    .filter((ep): ep is string => !!ep)
    .sort();

  for (const ep of episodes) {
    const target = `${series}/${ep}`;
    console.log(`\n${"━".repeat(50)}`);
    console.log(`  sync ${target}`);
    console.log("━".repeat(50));
    const res = spawnSync("pnpm", ["sync", target], {
      stdio: "inherit",
      shell: true,
    });
    if (res.status !== 0) {
      console.error(`❌  Failed: ${target}`);
      anyFailed = true;
    }
  }
}

if (anyFailed) process.exit(1);
