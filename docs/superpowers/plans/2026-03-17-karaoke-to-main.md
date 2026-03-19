# feat/karaoke-subtitles → main 선택적 머지 플랜

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `feat/karaoke-subtitles` 브랜치에서 자막 카라오케 하이라이팅은 제외하고, 나머지 개선사항(폴더 구조, 발화 타이밍 분석, 편의 스크립트, Folder 그룹핑)을 main에 반영한다.

**Architecture:** 폴더 이름을 `1/` → `001-Java-Basic/`으로 변경, sync.ts에 speechStartFrame/speechEndFrame/sentenceEndFrames 기반 발화 타이밍 감지 추가, Subtitle 컴포넌트는 단어 레벨 카라오케 없이 발화 타이밍 기반 fade-in/out + 문장 전환만 유지. wordStartFrames와 Whisper 파이프라인은 feature 브랜치에만 유지.

**Tech Stack:** TypeScript, Remotion, edge-tts, ffmpeg/ffprobe, tsx

---

## 변경 파일 목록

| 파일 | 작업 |
|---|---|
| `src/compositions/1/` | 디렉토리 이름 → `001-Java-Basic/` |
| `src/Root.tsx` | karaoke 브랜치 버전으로 교체 (Folder 그룹핑, 001-xxx ID) |
| `scripts/sync.ts` | karaoke 브랜치 기반 — Whisper/VTT/wordStartFrames 제거 |
| `scripts/sync-all.ts` | karaoke 브랜치에서 추가 (신규) |
| `scripts/render.ts` | karaoke 브랜치에서 추가 (신규) |
| `scripts/watch.ts` | karaoke 브랜치에서 추가 (신규) |
| `scripts/sync-audio.ts` | 삭제 (구 스크립트, 경로 하드코딩됨) |
| `package.json` | sync:all, watch, render 스크립트 추가; sync-audio 제거 |
| `src/global.config.ts` | karaoke 브랜치 버전으로 교체 (PRONUNCIATION 보강) |
| `src/compositions/001-Java-Basic/001-JavaVariables.tsx` | karaoke 브랜치 기반 — wordStartFrames 제거, Subtitle 정리 |
| `src/compositions/001-Java-Basic/001-audio.ts` | pnpm sync 재생성 (새 포맷: speechStartFrame 등 포함) |
| `src/compositions/001-Java-Basic/002-JavaDataTypes.tsx` | karaoke 브랜치 기반 — wordStartFrames 제거, Subtitle 정리 |
| `src/compositions/001-Java-Basic/002-audio.ts` | pnpm sync 재생성 |
| `CLAUDE.md` | 새 구조 반영 업데이트 |

---

## Task 1: 폴더 이름 변경 및 Root.tsx 교체

**Files:**
- Rename: `src/compositions/1/` → `src/compositions/001-Java-Basic/`
- Replace: `src/Root.tsx`

- [ ] **Step 1: 폴더 이름 변경**

```bash
mv src/compositions/1 src/compositions/001-Java-Basic
```

- [ ] **Step 2: Root.tsx를 karaoke 브랜치 버전으로 교체**

`src/Root.tsx` 전체를 아래로 교체:

```tsx
import React from "react";
import { Composition, Folder } from "remotion";

// compositions/ 폴더의 모든 .tsx 파일을 자동으로 불러옵니다.
// 새 영상을 추가하려면 compositions/<series>/ 에 파일을 만들고 아래 exports 를 추가하면 됩니다:
//   export const compositionMeta = { fps, width, height }
//   export const VIDEO_CONFIG = { sceneA: { durationInFrames }, ... }
//   export const Component: React.FC = ...
//
// 파일 경로 → Remotion ID 규칙:
//   src/compositions/001-Java-Basic/001-JavaVariables.tsx  →  folder "001-Java-Basic", id "001-001"
//   render: pnpm render 001-Java-Basic/001

interface CompositionModule {
  compositionMeta: { fps: number; width: number; height: number; durationInFrames?: number };
  VIDEO_CONFIG: Record<string, { durationInFrames: number }>;
  Component: React.FC;
}

const ctx = require.context("./compositions", true, /\d+-.*\.tsx$/);
const entries = ctx
  .keys()
  .map((key: string) => {
    const mod = ctx(key) as CompositionModule;
    if (!mod.compositionMeta || !mod.VIDEO_CONFIG || !mod.Component) return null;
    // 경로 파싱: "./001-Java-Basic/001-JavaVariables.tsx"
    const segments = key.replace(/^\.\//, "").split("/");
    const dir       = segments.slice(0, -1).join("/");              // "001-Java-Basic"
    const epMatch   = segments[segments.length - 1].match(/^(\d+)-/);
    const epNum     = epMatch ? epMatch[1] : segments[segments.length - 1]; // "001"
    const dirPrefix = dir.match(/^(\d+)/)?.[1] ?? dir;              // "001"
    const ep        = dirPrefix ? `${dirPrefix}-${epNum}` : epNum;  // "001-001"
    const totalFrames = mod.compositionMeta.durationInFrames
      ?? Object.values(mod.VIDEO_CONFIG).reduce((sum, s) => sum + s.durationInFrames, 0);
    return { mod, dir, ep, totalFrames };
  })
  .filter(Boolean) as { mod: CompositionModule; dir: string; ep: string; totalFrames: number }[];

// 시리즈별로 그룹핑
const byFolder = entries.reduce<Record<string, typeof entries>>((acc, e) => {
  (acc[e.dir] ??= []).push(e);
  return acc;
}, {});

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(byFolder).map(([folder, items]) => (
      <Folder key={folder} name={folder}>
        {items.map(({ mod, ep, totalFrames }) => (
          <Composition
            key={ep}
            id={ep}
            component={mod.Component}
            durationInFrames={totalFrames}
            fps={mod.compositionMeta.fps}
            width={mod.compositionMeta.width}
            height={mod.compositionMeta.height}
            defaultProps={{}}
          />
        ))}
      </Folder>
    ))}
  </>
);
```

- [ ] **Step 3: 커밋**

```bash
git add src/Root.tsx src/compositions/
git commit -m "refactor: compositions 폴더 구조 001-Java-Basic으로 변경, Root Folder 그룹핑 추가"
```

---

## Task 2: sync.ts 업데이트 (발화 타이밍 추가, Whisper 제거)

**Files:**
- Replace: `scripts/sync.ts`

**변경 원칙:**
- `detectSpeechBounds()` 추가 — 발화 앞뒤 무음 감지 (speechStartFrame, speechEndFrame)
- `detectSplits()`에 `sentenceEndFrames` 반환 추가
- `SceneAudioData`에 `sentenceEndFrames`, `speechStartFrame`, `speechEndFrame` 추가
- `writeAudioConfig()` 새 필드 출력
- 파서도 새 포맷 인식
- **제거**: Whisper 호출, `parseVttWords()`, `groupWordsBySentence()`, `extractNestedArray()`, `wordStartFrames`, `--write-subtitles` VTT 출력, `unlinkSync`

- [ ] **Step 1: `scripts/sync.ts` 전체 교체**

```typescript
/**
 * scripts/sync.ts
 *
 * 사용법: pnpm sync <series>/<id>
 *   예)  pnpm sync 001-Java-Basic/001
 *
 * 자동 처리:
 *  1. narration 텍스트 해시로 변경된 씬만 감지
 *  2. edge-tts 로 mp3 재생성
 *  3. ffprobe 로 실측 duration → durationInFrames 계산
 *  4. ffmpeg silencedetect(-40dB) 로 발화 시작/종료 프레임 감지 → speechStartFrame / speechEndFrame
 *  5. ffmpeg silencedetect(-25dB) 로 문장 분기 프레임 감지 → narrationSplits / sentenceEndFrames
 *  6. 결과를 <id>-audio.ts 파일로 자동 저장
 */

import { buildSync } from "esbuild";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

const FPS = 30;
const SCENE_TAIL_FRAMES = 15;
const PUBLIC_DIR = "public";
const SRC_DIR = "src/compositions";

// ── CLI 인수 ───────────────────────────────────────────────────
const arg = process.argv[2];
if (!arg) {
  console.error("Usage: pnpm sync <series>/<id>   e.g.  pnpm sync 001-Java-Basic/001");
  process.exit(1);
}
const argParts   = arg.split("/");
const episodeId  = argParts[argParts.length - 1];
const SERIES_DIR = path.join(SRC_DIR, ...argParts.slice(0, -1));
const compositionId = episodeId;

const matchEntry = readdirSync(SERIES_DIR).find(
  (f) => f.startsWith(episodeId + "-") && f.endsWith(".tsx")
);
if (!matchEntry) {
  console.error(`❌  ${SERIES_DIR}/${episodeId}-*.tsx 파일을 찾을 수 없습니다.`);
  process.exit(1);
}
const COMPOSITION_FILE = path.join(SERIES_DIR, matchEntry);
const COMPOSITION_DIR  = SERIES_DIR;
const HASH_FILE = `.${arg.replace(/\//g, "-")}-audio-hashes.json`;
console.log(`📄  ${COMPOSITION_FILE}\n`);

// ── AUDIO_CONFIG 스텁 생성 ─────────────────────────────────────
const _audioConfigBootstrap = path.join(COMPOSITION_DIR, compositionId + "-audio.ts");
if (!existsSync(_audioConfigBootstrap)) {
  writeFileSync(
    _audioConfigBootstrap,
    `// AUTO-GENERATED by \`pnpm sync ${compositionId}\` — do not edit manually\n\nconst _stub = { durationInFrames: 30, narrationSplits: [] as number[] };\nexport const AUDIO_CONFIG: Record<string, { durationInFrames: number; narrationSplits: number[] }> = new Proxy({}, { get: () => _stub });\n`,
    "utf-8"
  );
  if (existsSync(HASH_FILE)) writeFileSync(HASH_FILE, "{}", "utf-8");
}

// ── VIDEO_CONFIG 로드 ──────────────────────────────────────────
type SceneEntry = { narration?: string[]; audio: string; };

function loadConfig(): {
  VOICE: string; RATE: string;
  PRONUNCIATION: Record<string, string>;
  VIDEO_CONFIG: Record<string, SceneEntry>;
} {
  const result = buildSync({
    entryPoints: [COMPOSITION_FILE], bundle: true,
    platform: "node", format: "cjs", write: false,
    packages: "external", logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  const mod = { exports: {} as Record<string, unknown> };
  const stub = new Proxy({}, {
    get(_: object, prop: string | symbol) {
      if (prop === "then") return undefined;
      return (...args: unknown[]) => { void args; return stub; };
    },
  });
  const realRequire = require;
  const mockRequire = (id: string): unknown => {
    if (id === "react" || id === "remotion" || id.startsWith("@remotion/")) return stub;
    return realRequire(id);
  };
  new Function("module", "exports", "require", code)(mod, mod.exports, mockRequire);
  return mod.exports as ReturnType<typeof loadConfig>;
}

const { VOICE, RATE, PRONUNCIATION, VIDEO_CONFIG } = loadConfig();

// ── 유틸 ──────────────────────────────────────────────────────
type Hashes = Record<string, string>;

function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}
function loadHashes(): Hashes {
  if (!existsSync(HASH_FILE)) return {};
  return JSON.parse(readFileSync(HASH_FILE, "utf-8")) as Hashes;
}
function applyPronunciation(text: string): string {
  let r = text;
  for (const [k, v] of Object.entries(PRONUNCIATION)) r = r.replaceAll(k, v);
  return r;
}

// ── 발화 시작/종료 프레임 감지 (speechStartFrame / speechEndFrame) ─
function detectSpeechBounds(audioFile: string, totalSecs: number): { speechStartFrame: number; speechEndFrame: number } {
  const ffRes = spawnSync(
    "ffmpeg",
    ["-i", audioFile, "-af", "silencedetect=n=-40dB:d=0.03", "-f", "null", "-"],
    { encoding: "utf-8" }
  );
  const output = (ffRes.stderr ?? "") + (ffRes.stdout ?? "");
  const silences: { start: number; end: number | null }[] = [];
  let pendingStart: number | null = null;
  for (const line of output.split("\n")) {
    const startM = line.match(/silence_start:\s*([\d.]+)/);
    if (startM) pendingStart = parseFloat(startM[1]);
    const endM = line.match(/silence_end:\s*([\d.]+)/);
    if (endM) {
      silences.push({ start: pendingStart ?? 0, end: parseFloat(endM[1]) });
      pendingStart = null;
    }
  }
  if (pendingStart !== null) silences.push({ start: pendingStart, end: null });

  let speechStartFrame = 0;
  const leading = silences.find((s) => s.start < 0.5 && s.end !== null);
  if (leading) speechStartFrame = Math.round(leading.end! * FPS);

  let speechEndFrame = Math.ceil(totalSecs * FPS);
  const trailing = [...silences].reverse().find((s) => s.end === null || s.end >= totalSecs - 0.1);
  if (trailing) speechEndFrame = Math.round(trailing.start * FPS);

  return { speechStartFrame, speechEndFrame };
}

// ── 문장 분기 프레임 감지 (narrationSplits / sentenceEndFrames) ─
function detectSplits(audioFile: string, sentenceCount: number): { splits: number[]; sentenceEndFrames: number[] } {
  if (sentenceCount <= 1) return { splits: [], sentenceEndFrames: [] };

  const probeRes = spawnSync(
    "ffprobe",
    ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", audioFile],
    { encoding: "utf-8" }
  );
  const totalSecs = parseFloat(probeRes.stdout.trim());

  const ffRes = spawnSync(
    "ffmpeg",
    ["-i", audioFile, "-af", "silencedetect=n=-25dB:d=0.2", "-f", "null", "-"],
    { encoding: "utf-8" }
  );
  const output = (ffRes.stderr ?? "") + (ffRes.stdout ?? "");

  const entries: { start: number; end: number; duration: number }[] = [];
  let pendingStart: number | null = null;
  for (const line of output.split("\n")) {
    const startM = line.match(/silence_start:\s*([\d.]+)/);
    if (startM) pendingStart = parseFloat(startM[1]);
    const m = line.match(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
    if (m && pendingStart !== null) {
      entries.push({ start: pendingStart, end: parseFloat(m[1]), duration: parseFloat(m[2]) });
      pendingStart = null;
    }
  }

  const breaks = entries
    .filter((e) => e.end > 0.4 && e.end < totalSecs - 0.3 && e.duration > 0.25)
    .slice(0, sentenceCount - 1);

  return {
    splits:            breaks.map((b) => Math.round(b.end   * FPS)),
    sentenceEndFrames: breaks.map((b) => Math.round(b.start * FPS)),
  };
}

// ── AUDIO_CONFIG 파일 쓰기 ────────────────────────────────────
type SceneAudioData = {
  durationInFrames: number;
  narrationSplits: number[];
  sentenceEndFrames: number[];
  speechStartFrame: number;
  speechEndFrame: number;
};

function writeAudioConfig(config: Record<string, SceneAudioData>): void {
  const audioConfigFile = path.join(COMPOSITION_DIR, compositionId + "-audio.ts");
  const lines = Object.entries(config)
    .map(([k, v]) =>
      `  ${k.padEnd(16)}: { durationInFrames: ${v.durationInFrames}, narrationSplits: [${v.narrationSplits.join(", ")}], sentenceEndFrames: [${v.sentenceEndFrames.join(", ")}], speechStartFrame: ${v.speechStartFrame}, speechEndFrame: ${v.speechEndFrame} },`
    )
    .join("\n");
  const content = `// AUTO-GENERATED by \`pnpm sync ${compositionId}\` — do not edit manually\n\nexport const AUDIO_CONFIG = {\n${lines}\n} as const;\n`;
  writeFileSync(audioConfigFile, content, "utf-8");
  console.log(`\n📝  ${audioConfigFile} 업데이트 완료`);
}

// ── 메인 루프 ─────────────────────────────────────────────────
const hashes = loadHashes();
let changed = false;

const audioConfigFile = path.join(COMPOSITION_DIR, compositionId + "-audio.ts");
let existingAudioConfig: Record<string, SceneAudioData> = {};
if (existsSync(audioConfigFile)) {
  try {
    const raw = readFileSync(audioConfigFile, "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s+(\w+)\s*:\s*\{ durationInFrames: (\d+), narrationSplits: \[([^\]]*)\], sentenceEndFrames: \[([^\]]*)\], speechStartFrame: (\d+), speechEndFrame: (\d+)/);
      if (m) {
        const splits = m[3].trim() ? m[3].split(",").map(s => parseInt(s.trim())) : [];
        const ends   = m[4].trim() ? m[4].split(",").map(s => parseInt(s.trim())) : [];
        existingAudioConfig[m[1]] = { durationInFrames: parseInt(m[2]), narrationSplits: splits, sentenceEndFrames: ends, speechStartFrame: parseInt(m[5]), speechEndFrame: parseInt(m[6]) };
        continue;
      }
      // 구버전 호환
      const m2 = line.match(/^\s+(\w+)\s*:\s*\{ durationInFrames: (\d+), narrationSplits: \[([^\]]*)\]/);
      if (m2) {
        const splits = m2[3].trim() ? m2[3].split(",").map(s => parseInt(s.trim())) : [];
        existingAudioConfig[m2[1]] = { durationInFrames: parseInt(m2[2]), narrationSplits: splits, sentenceEndFrames: [], speechStartFrame: 0, speechEndFrame: 0 };
      }
    }
  } catch { /* ignore */ }
}

const audioConfig: Record<string, SceneAudioData> = {};

for (const [key, scene] of Object.entries(VIDEO_CONFIG)) {
  const narration = scene.narration;
  if (!narration) continue;

  const ttsText = applyPronunciation(narration.join(" "));
  const audio = scene.audio;
  const newHash = hash(VOICE + RATE + ttsText);

  if (hashes[key] === newHash) {
    if (existingAudioConfig[key]) {
      audioConfig[key] = existingAudioConfig[key];
      if (audioConfig[key].speechStartFrame === 0 || audioConfig[key].speechEndFrame === 0) {
        const probeR = spawnSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", `${PUBLIC_DIR}/${audio}`], { encoding: "utf-8" });
        const totalSecs = parseFloat(probeR.stdout.trim());
        const bounds = detectSpeechBounds(`${PUBLIC_DIR}/${audio}`, totalSecs);
        audioConfig[key] = { ...audioConfig[key], ...bounds };
        changed = true;
        console.log(`[skip] ${audio}  speechStartFrame → ${bounds.speechStartFrame}, speechEndFrame → ${bounds.speechEndFrame} (재측정)`);
      } else {
        console.log(`[skip] ${audio}`);
      }
    }
    continue;
  }

  console.log(`[gen]  ${audio}`);

  // 1) TTS 생성
  const ttsRes = spawnSync(
    "edge-tts",
    ["--voice", VOICE, "--rate", RATE, "--text", ttsText, "--write-media", `${PUBLIC_DIR}/${audio}`],
    { stdio: "inherit" }
  );
  if (ttsRes.status !== 0) { console.error(`❌  Failed: ${audio}`); process.exit(1); }

  // 2) durationInFrames
  const probeRes = spawnSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", `${PUBLIC_DIR}/${audio}`], { encoding: "utf-8" });
  const totalSecs = parseFloat(probeRes.stdout.trim());
  console.log(`       실측 ${totalSecs.toFixed(2)}s`);
  audioConfig[key] = { durationInFrames: Math.ceil(totalSecs * FPS) + SCENE_TAIL_FRAMES, narrationSplits: [], sentenceEndFrames: [], speechStartFrame: 0, speechEndFrame: 0 };

  // 3) speechStartFrame / speechEndFrame
  const bounds = detectSpeechBounds(`${PUBLIC_DIR}/${audio}`, totalSecs);
  audioConfig[key].speechStartFrame = bounds.speechStartFrame;
  audioConfig[key].speechEndFrame   = bounds.speechEndFrame;
  console.log(`       speechStartFrame → ${bounds.speechStartFrame} (${(bounds.speechStartFrame / FPS).toFixed(2)}s)`);
  console.log(`       speechEndFrame   → ${bounds.speechEndFrame} (${(bounds.speechEndFrame / FPS).toFixed(2)}s)`);

  // 4) narrationSplits / sentenceEndFrames
  const { splits, sentenceEndFrames } = detectSplits(`${PUBLIC_DIR}/${audio}`, narration.length);
  if (splits.length > 0) {
    audioConfig[key].narrationSplits   = splits;
    audioConfig[key].sentenceEndFrames = sentenceEndFrames;
    console.log(`       narrationSplits    → [${splits.join(", ")}] ✅`);
    console.log(`       sentenceEndFrames  → [${sentenceEndFrames.join(", ")}]`);
  }

  hashes[key] = newHash;
  changed = true;
}

if (changed) {
  writeAudioConfig(audioConfig);
  writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
  console.log("\n✅  Done. Hashes updated.");
} else {
  console.log("\n✅  All audio up to date.");
}
```

- [ ] **Step 2: 커밋**

```bash
git add scripts/sync.ts
git commit -m "feat: sync.ts에 발화 타이밍 감지 추가 (speechStartFrame/speechEndFrame/sentenceEndFrames)"
```

---

## Task 3: 편의 스크립트 추가 및 정리

**Files:**
- Create: `scripts/sync-all.ts`
- Create: `scripts/render.ts`
- Create: `scripts/watch.ts`
- Delete: `scripts/sync-audio.ts`
- Modify: `package.json`

- [ ] **Step 1: `scripts/sync-all.ts` 생성**

```typescript
/**
 * scripts/sync-all.ts — 사용법: pnpm sync:all
 * src/compositions/ 하위 모든 에피소드를 순서대로 sync 처리
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
    console.log(`\n${"━".repeat(50)}\n  sync ${target}\n${"━".repeat(50)}`);
    const res = spawnSync("pnpm", ["sync", target], { stdio: "inherit", shell: true });
    if (res.status !== 0) { console.error(`❌  Failed: ${target}`); anyFailed = true; }
  }
}
if (anyFailed) process.exit(1);
```

- [ ] **Step 2: `scripts/render.ts` 생성**

```typescript
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
```

- [ ] **Step 3: `scripts/watch.ts` 생성**

```typescript
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
```

- [ ] **Step 4: `scripts/sync-audio.ts` 삭제**

```bash
rm scripts/sync-audio.ts
```

- [ ] **Step 5: `package.json` scripts 업데이트**

`"scripts"` 섹션을 아래로 교체:

```json
"scripts": {
  "dev": "remotion studio",
  "build": "remotion bundle",
  "upgrade": "remotion upgrade",
  "lint": "eslint src && tsc",
  "sync": "tsx scripts/sync.ts",
  "sync:all": "tsx scripts/sync-all.ts",
  "watch": "tsx scripts/watch.ts",
  "render": "tsx scripts/render.ts"
}
```

- [ ] **Step 6: 커밋**

```bash
git add scripts/ package.json
git commit -m "feat: sync:all, render, watch 스크립트 추가; sync-audio.ts 제거"
```

---

## Task 4: global.config.ts 업데이트

**Files:**
- Modify: `src/global.config.ts`

- [ ] **Step 1: PRONUNCIATION 보강**

`src/global.config.ts` 의 `PRONUNCIATION`을 아래로 교체:

```typescript
export const PRONUNCIATION: Record<string, string> = {
  "System.out.println": "print line",
  "int": "int",
  "String": "String",
  "boolean": "boolean",
  "double": "더블",
  "Double": "더블",
  "Java": "자바",
  "(자료)": "",
};
```

- [ ] **Step 2: 커밋**

```bash
git add src/global.config.ts
git commit -m "feat: PRONUNCIATION 항목 보강 (int, String, boolean, (자료) 추가)"
```

---

## Task 5: Subtitle 컴포넌트 업데이트 (001 & 002)

**Files:**
- Modify: `src/compositions/001-Java-Basic/001-JavaVariables.tsx`
- Modify: `src/compositions/001-Java-Basic/002-JavaDataTypes.tsx`

**Subtitle 컴포넌트 변경 사항:**
- 추가 props: `sentenceEndFrames`, `speechStart`, `speechEnd` (타이밍 정확도)
- 제거 props: `wordStartFrames` (카라오케)
- 자막 렌더: 단어별 span 제거 → 문장 전체를 흰색(`#ffffff`) 텍스트로 단순 출력
- 문장 전환 로직: `narrationSplits` 기준 (기존 유지)
- fade-in: `speechStart` 기준 12프레임 (기존 유지)
- 모든 `<Subtitle>` 호출부에서 `wordStartFrames` 제거, `sentenceEndFrames`/`speechStart`/`speechEnd` 추가

**Subtitle 컴포넌트 최종 형태:**

```tsx
const Subtitle: React.FC<{
  sentences: string[];
  durationInFrames: number;
  splits?: readonly number[];
  sentenceEndFrames?: readonly number[];
  speechStart?: number;
  speechEnd?: number;
}> = ({ sentences, durationInFrames, splits, speechStart = 0 }) => {
  const frame = useCurrentFrame();
  const { width: compositionWidth } = useVideoConfig();

  const ranges = sentences.map((_, i) => {
    if (splits && splits.length >= sentences.length - 1) {
      const start = i === 0 ? speechStart : splits[i - 1];
      const end   = i < splits.length ? splits[i] : durationInFrames;
      return { start, end };
    }
    const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
    let cumulative = 0;
    sentences.slice(0, i).forEach((s) => { cumulative += s.length; });
    const start = Math.floor((cumulative / totalChars) * durationInFrames);
    cumulative += sentences[i].length;
    const end   = Math.floor((cumulative / totalChars) * durationInFrames);
    return { start, end };
  });

  const idx = ranges.findIndex(({ start, end }) => frame >= start && frame < end);
  const currentIdx = idx === -1 ? sentences.length - 1 : idx;
  const { start } = ranges[currentIdx];
  const opacity = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        fontFamily: uiFont,
        fontSize: 32,
        color: "#ffffff",
        opacity,
        background: "rgba(0,0,0,0.55)",
        borderRadius: 6,
        padding: "8px 16px",
        lineHeight: 1.6,
        width: "max-content",
        maxWidth: compositionWidth - 20,
        wordBreak: "keep-all",
        whiteSpace: "pre-wrap",
      }}
    >
      {sentences[currentIdx]}
    </div>
  );
};
```

- [ ] **Step 1: 001-JavaVariables.tsx Subtitle 컴포넌트 교체**

위 Subtitle 정의로 기존 Subtitle 컴포넌트 전체 교체.

- [ ] **Step 2: 001-JavaVariables.tsx 모든 Subtitle 호출부 업데이트**

`wordStartFrames={...}` prop 제거. `sentenceEndFrames`, `speechStart`, `speechEnd`는 유지.

예시:
```tsx
// Before
<Subtitle ... wordStartFrames={AUDIO_CONFIG.intro.wordStartFrames} />
// After
<Subtitle ... />
```

- [ ] **Step 3: 002-JavaDataTypes.tsx 동일하게 적용**

- [ ] **Step 4: TypeScript 컴파일 확인**

```bash
pnpm lint
```

- [ ] **Step 5: 커밋**

```bash
git add src/compositions/001-Java-Basic/
git commit -m "refactor: Subtitle에서 카라오케 하이라이팅 제거, speechStart 기반 fade-in 유지"
```

---

## Task 6: sync 실행 및 audio config 재생성

- [ ] **Step 1: 해시 파일 삭제 (강제 전체 재생성)**

```bash
rm -f .001-Java-Basic-001-audio-hashes.json .001-Java-Basic-002-audio-hashes.json
```

- [ ] **Step 2: sync:all 실행**

```bash
pnpm sync:all
```

새 포맷 (`speechStartFrame`, `speechEndFrame`, `sentenceEndFrames` 포함)으로 audio config 재생성.

- [ ] **Step 3: 생성된 audio.ts 확인**

```bash
cat src/compositions/001-Java-Basic/001-audio.ts
cat src/compositions/001-Java-Basic/002-audio.ts
```

`speechStartFrame`, `speechEndFrame`, `sentenceEndFrames` 필드가 포함되어 있는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/compositions/001-Java-Basic/001-audio.ts src/compositions/001-Java-Basic/002-audio.ts public/
git commit -m "chore: audio config 재생성 (speechStartFrame/speechEndFrame/sentenceEndFrames 포함)"
```

---

## Task 7: CLAUDE.md 업데이트

- [ ] **Step 1: CLAUDE.md 업데이트**

아래 내용으로 CLAUDE.md 전체 교체:

```markdown
# Remotion 영상 프로젝트 — Claude 작업 가이드

## 프로젝트 구조

\`\`\`
src/
  global.config.ts              — 전역 설정 (VOICE, RATE, SCENE_TAIL_FRAMES, PRONUNCIATION)
  index.ts                      — Remotion 엔트리포인트 (Root.tsx 연결)
  Root.tsx                      — 모든 컴포지션 자동 등록 (require.context) + Folder 그룹핑
  compositions/
    001-Java-Basic/
      001-JavaVariables.tsx     — 001 영상 컴포지션
      001-audio.ts              — AUTO-GENERATED: durationInFrames, narrationSplits, speechStartFrame 등
      002-JavaDataTypes.tsx     — 002 영상 컴포지션
      002-audio.ts              — AUTO-GENERATED
scripts/
  sync.ts                       — TTS 생성 + audio config 자동 업데이트 (단일 에피소드)
  sync-all.ts                   — 전체 에피소드 일괄 sync
  render.ts                     — 프로그래매틱 렌더링 (pnpm render)
  watch.ts                      — 파일 변경 감시 → 자동 sync
public/                         — 생성된 mp3 파일
out/                            — 렌더링 출력
\`\`\`

## 나레이션 수정 워크플로우

나레이션 텍스트 또는 PRONUNCIATION을 바꾸면 **반드시** 아래 명령을 실행한다:

\`\`\`bash
pnpm sync 001-Java-Basic/001
pnpm sync 001-Java-Basic/002
# 또는 전체 한번에:
pnpm sync:all
\`\`\`

`sync`가 자동으로 처리하는 것:
- 씬별 해시(VOICE + RATE + ttsText)로 변경 여부 감지 — 바뀐 씬만 재생성
- edge-tts로 mp3 생성
- ffprobe로 실측 duration 측정 → `durationInFrames` 자동 반영
- ffmpeg silencedetect(-40dB)로 발화 앞뒤 무음 감지 → `speechStartFrame` / `speechEndFrame` 자동 반영
- ffmpeg silencedetect(-25dB)로 문장 분기 프레임 감지 → `narrationSplits` / `sentenceEndFrames` 자동 반영
- 결과를 `{id}-audio.ts`에 저장

**수동으로 audio config를 건드릴 필요 없다.**

**narration이나 PRONUNCIATION이 바뀌었다고 하면 즉시 해당 에피소드 sync를 실행한다. 무엇이 바뀌었는지 묻지 않는다.**

## AUDIO_CONFIG 구조 (auto-generated)

\`\`\`ts
export const AUDIO_CONFIG = {
  intro: {
    durationInFrames: 198,    // 실측 오디오 길이 + SCENE_TAIL_FRAMES
    narrationSplits: [77],    // 각 문장 시작 프레임 (2번째 문장부터)
    sentenceEndFrames: [58],  // 각 문장 발화 종료 프레임
    speechStartFrame: 4,      // 발화 시작 프레임 (leading silence 끝)
    speechEndFrame: 169,      // 발화 종료 프레임 (trailing silence 시작)
  },
  ...
} as const;
\`\`\`

## VIDEO_CONFIG 구조

\`\`\`ts
intro: {
  audio: "scene0.mp3",
  durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
  narration: ["첫 번째 문장.", "두 번째 문장."],
  narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
}
\`\`\`

## Subtitle 컴포넌트

- `speechStart` 프레임부터 fade-in (12프레임)
- `narrationSplits` 기준으로 문장 전환
- 단일 흰색 텍스트 (`#ffffff`) — 카라오케 하이라이팅 없음
- 카라오케 실험 코드는 `feat/karaoke-subtitles` 브랜치에 보존

## PRONUNCIATION (global.config.ts)

\`\`\`ts
export const PRONUNCIATION: Record<string, string> = {
  "System.out.println": "print line",
  "int": "int",
  "String": "String",
  "boolean": "boolean",
  "double": "더블",
  "Double": "더블",
  "Java": "자바",
  "(자료)": "",
};
\`\`\`

- 자막 표시용과 TTS 읽기용을 분리할 때 사용
- PRONUNCIATION 변경 시 해시가 달라져 영향받는 씬 자동 재생성됨

## 컴포지션 ID 규칙

- Root.tsx가 `require.context`로 자동 발견 + Folder로 시리즈 그룹핑
- ID 형식: `{시리즈앞숫자}-{episodeNum}` (예: `001-001`, `001-002`)
- Remotion Studio URL: `localhost:3000`

## 렌더링

\`\`\`bash
# Remotion Studio 미리보기
pnpm dev   # http://localhost:3000

# 헤드리스 렌더링 (CLI)
npx remotion render src/index.ts 001-001 out/001.mp4
npx remotion render src/index.ts 001-002 out/002.mp4

# 프로그래매틱 렌더링 (권장)
pnpm render 001-Java-Basic/001
pnpm render 001-Java-Basic/002
\`\`\`

## 씬 타이밍 상수

\`\`\`ts
TYPING_START = 20    // 씬 시작 후 타이핑 시작까지 프레임
CHARS_PER_SEC = 10   // 타이핑 속도 (초당 글자)
CROSS = 20           // 씬 간 크로스페이드 프레임
SCENE_TAIL_FRAMES = 15  // 오디오 종료 후 여유 프레임 (global.config.ts)
\`\`\`

## 새 에피소드 추가 방법

1. `src/compositions/{시리즈폴더}/{id}-{이름}.tsx` 생성
2. `export const compositionMeta`, `export const VIDEO_CONFIG`, `export const Component` 포함
3. `{id}-audio.ts` 없으면 sync가 자동 스텁 생성
4. `pnpm sync {시리즈폴더}/{id}` 실행

## 주의사항

- CSS `transition` / `animation` 사용 금지 → 렌더링 시 무시됨. 반드시 `interpolate` / `spring` 사용
- `100dvw` 사용 금지 → `useVideoConfig().width` 사용
- 새 씬 추가 시 `mergedSceneList` / `sceneList` 배열도 업데이트 필요
- 해시 파일: `.{시리즈}-{id}-audio-hashes.json` (루트에 숨김파일로 저장)
- 강제 전체 재생성: 해시 파일 삭제 후 `pnpm sync:all`

## 실험 브랜치

- `feat/karaoke-subtitles` — Whisper 기반 단어별 자막 하이라이팅 실험 (faster-whisper + wordStartFrames)
```

- [ ] **Step 2: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md — 새 구조(001-Java-Basic, speechStartFrame, sync:all) 반영"
```

---

## Task 8: 최종 검증 및 렌더링

- [ ] **Step 1: Remotion Studio 정상 실행 확인**

```bash
pnpm dev
```

`001-Java-Basic` 폴더 아래 `001-001`, `001-002` 컴포지션이 보이는지 확인.

- [ ] **Step 2: 두 영상 렌더링**

```bash
npx remotion render src/index.ts 001-001 out/001.mp4
npx remotion render src/index.ts 001-002 out/002.mp4
```

- [ ] **Step 3: main 최종 push**

```bash
git push origin main
```
