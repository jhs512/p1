/**
 * scripts/watch.ts — 사용법: pnpm watch
 * 컴포지션 파일 변경 시 자동 sync
 */
import { watch } from "fs";
import { readdirSync, statSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

const SRC_DIR = "src/compositions";
const GLOBAL_CONFIG = "src/global.config.ts";
const DEBOUNCE_MS = 800;

const episodeMap = new Map<string, string>();
function buildEpisodeMap() {
  episodeMap.clear();
  for (const series of readdirSync(SRC_DIR).filter((d) => statSync(path.join(SRC_DIR, d)).isDirectory())) {
    for (const f of readdirSync(path.join(SRC_DIR, series))) {
      const m = f.match(/^(\d+)-.+\.tsx$/);
      if (m) episodeMap.set(path.resolve(SRC_DIR, series, f), `${series}/${m[1]}`);
    }
  }
}
buildEpisodeMap();

const timers = new Map<string, ReturnType<typeof setTimeout>>();
function debounced(key: string, fn: () => void) {
  const prev = timers.get(key);
  if (prev) clearTimeout(prev);
  timers.set(key, setTimeout(() => { timers.delete(key); fn(); }, DEBOUNCE_MS));
}

watch(GLOBAL_CONFIG, () => debounced("global", () => {
  console.log("\n🔄  [watch] sync:all (global.config.ts 변경)");
  spawnSync("pnpm", ["sync:all"], { stdio: "inherit", shell: true });
}));

watch(SRC_DIR, { recursive: true }, (_, filename) => {
  if (!filename) return;
  const absPath = path.resolve(SRC_DIR, filename);
  const target = episodeMap.get(absPath);
  if (!target) return;
  debounced(target, () => {
    console.log(`\n🔄  [watch] sync ${target}`);
    spawnSync("pnpm", ["sync", target], { stdio: "inherit", shell: true });
  });
});

console.log("👀  Watching...\n    - src/compositions/**/*.tsx\n    - src/global.config.ts\n    (Ctrl+C to stop)\n");
