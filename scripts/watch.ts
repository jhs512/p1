/**
 * scripts/watch.ts
 *
 * 사용법: pnpm watch
 *
 * src/compositions/ 와 src/global.config.ts 를 감시하여
 * 파일이 변경되면 해당 에피소드(또는 전체)를 자동으로 sync 처리한다.
 *
 * - 컴포지션 파일 변경 → 해당 에피소드만 sync
 * - global.config.ts 변경 (PRONUNCIATION 등) → 전체 sync
 */

import { watch } from "fs";
import { readdirSync, statSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

const SRC_DIR = "src/compositions";
const GLOBAL_CONFIG = "src/global.config.ts";
const DEBOUNCE_MS = 800;

// 에피소드 파일 → "시리즈/에피소드ID" 맵 구성
const episodeMap = new Map<string, string>(); // 절대경로 → "001-Java-Basic/001"

function buildEpisodeMap() {
  episodeMap.clear();
  const seriesDirs = readdirSync(SRC_DIR).filter((d) =>
    statSync(path.join(SRC_DIR, d)).isDirectory()
  );
  for (const series of seriesDirs) {
    const seriesPath = path.join(SRC_DIR, series);
    for (const f of readdirSync(seriesPath)) {
      const m = f.match(/^(\d+)-.+\.tsx$/);
      if (m) {
        const absPath = path.resolve(seriesPath, f);
        episodeMap.set(absPath, `${series}/${m[1]}`);
      }
    }
  }
}

buildEpisodeMap();

function runSync(target: string) {
  console.log(`\n🔄  [watch] sync ${target}`);
  spawnSync("pnpm", ["sync", target], { stdio: "inherit", shell: true });
}

function runSyncAll() {
  console.log("\n🔄  [watch] sync:all (global.config.ts 변경 감지)");
  spawnSync("pnpm", ["sync:all"], { stdio: "inherit", shell: true });
}

// 디바운스 타이머
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function debounced(key: string, fn: () => void) {
  const prev = timers.get(key);
  if (prev) clearTimeout(prev);
  timers.set(key, setTimeout(() => { timers.delete(key); fn(); }, DEBOUNCE_MS));
}

// global.config.ts 감시
watch(GLOBAL_CONFIG, () => {
  debounced("global", runSyncAll);
});

// compositions/ 하위 전체 감시
watch(SRC_DIR, { recursive: true }, (_, filename) => {
  if (!filename) return;
  const absPath = path.resolve(SRC_DIR, filename);
  const target = episodeMap.get(absPath);
  if (!target) return;                    // audio.ts 등 non-tsx 변경은 무시
  debounced(target, () => runSync(target));
});

console.log("👀  Watching for changes...");
console.log(`    - ${SRC_DIR}/**/*.tsx`);
console.log(`    - ${GLOBAL_CONFIG}`);
console.log("    (Ctrl+C to stop)\n");
