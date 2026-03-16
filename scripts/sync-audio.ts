import { buildSync } from "esbuild";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";

const HASH_FILE = ".audio-hashes.json";
const PUBLIC_DIR = "public";
const COMPOSITION_FILE = "src/compositions/0001-JavaVariables.tsx";

/**
 * 오디오 생성 후 실측된 duration(초)을 컴포지션 파일의 durationInFrames: f(X.XX) 에 자동 반영
 * audio: "scene1.mp3" 바로 다음에 오는 f(...) 값을 대상으로 교체
 */
function autoUpdateDuration(audioFile: string, secs: string): void {
  let source = readFileSync(COMPOSITION_FILE, "utf-8");
  const escaped = audioFile.replace(/\./g, "\\.");
  // audio: "scene1.mp3" 이후 가장 가까운 f(X.XX) 를 새 값으로 교체
  const re = new RegExp(
    `(audio:\\s*"${escaped}"[\\s\\S]{1,200}?durationInFrames:\\s*f\\()([\\d.]+)(\\))`,
    "m"
  );
  const updated = source.replace(re, `$1${secs}$3`);
  if (updated !== source) {
    writeFileSync(COMPOSITION_FILE, updated, "utf-8");
    console.log(`       → durationInFrames 자동 업데이트: f(${secs})`);
  }
}

type Hashes = Record<string, string>;

// ── 01-JavaVariables.tsx 에서 설정값 추출 ─────────────────────
// esbuild 로 번들링 후 React/Remotion 을 빈 mock 으로 대체해 Node 에서 실행
function loadConfig(): {
  VOICE: string;
  RATE: string;
  PRONUNCIATION: Record<string, string>;
  VIDEO_CONFIG: Record<string, { narration?: string[]; audio: string }>;
} {
  const result = buildSync({
    entryPoints: ["src/compositions/0001-JavaVariables.tsx"],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
    packages: "external",
    logLevel: "silent",
  });

  const code = result.outputFiles[0].text;
  const mod = { exports: {} as Record<string, unknown> };

  // React/Remotion 패키지를 빈 stub 으로 대체 (Node 에서 로드 불가)
  const stub = new Proxy(
    {},
    {
      get(_: object, prop: string | symbol) {
        if (prop === "then") return undefined; // Promise-like 방지
        return (...args: unknown[]) => { void args; return stub; };
      },
    }
  );

   
  const realRequire = require;
  const mockRequire = (id: string): unknown => {
    if (id === "react" || id === "remotion" || id.startsWith("@remotion/")) {
      return stub;
    }
    return realRequire(id);
  };

   
  new Function("module", "exports", "require", code)(
    mod,
    mod.exports,
    mockRequire
  );

  return mod.exports as ReturnType<typeof loadConfig>;
}

const { VOICE, RATE, PRONUNCIATION, VIDEO_CONFIG } = loadConfig();

// ─────────────────────────────────────────────────────────────

function applyPronunciation(text: string): string {
  let result = text;
  for (const [display, spoken] of Object.entries(PRONUNCIATION)) {
    result = result.replaceAll(display, spoken);
  }
  return result;
}

function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function loadHashes(): Hashes {
  if (!existsSync(HASH_FILE)) return {};
  return JSON.parse(readFileSync(HASH_FILE, "utf-8")) as Hashes;
}

const hashes = loadHashes();
let changed = false;

for (const [key, scene] of Object.entries(VIDEO_CONFIG)) {
  const narration = scene.narration;
  if (!narration) continue;

  const ttsText = applyPronunciation(narration.join(" "));
  const audio = scene.audio;
  const newHash = hash(VOICE + RATE + ttsText);

  if (hashes[key] === newHash) {
    console.log(`[skip] ${audio}`);
    continue;
  }

  console.log(`[gen]  ${audio}`);
  const result = spawnSync(
    "edge-tts",
    ["--voice", VOICE, "--rate", RATE, "--text", ttsText, "--write-media", `${PUBLIC_DIR}/${audio}`],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    console.error(`Failed to generate ${audio}`);
    process.exit(1);
  }

  // 생성된 음성 길이 측정 → durationInFrames 자동 업데이트
  const probe = spawnSync(
    "ffprobe",
    ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", `${PUBLIC_DIR}/${audio}`],
    { encoding: "utf-8" }
  );
  if (probe.status === 0) {
    const secs = parseFloat(probe.stdout.trim()).toFixed(2);
    console.log(`       → 실측 ${secs}s`);
    autoUpdateDuration(audio, secs);
  }

  hashes[key] = newHash;
  changed = true;
}

if (changed) {
  writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
  console.log("\nDone. Hashes updated.");
} else {
  console.log("\nAll audio up to date.");
}
