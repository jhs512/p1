# Config Cascade 체질개선 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4단계 config cascade(루트→강좌→언어→강의) 도입 + sync.ts가 mergedConfig를 읽어 hash 계산, config 변경 시 자동 재생성.

**Architecture:** `src/config.ts`(루트) → `001-Java-Basic/config.ts`(강좌+언어) → `001.config.ts`(강의 optional). sync.ts가 esbuild로 3단계 merge → hash(VOICE+RATE+ttsText). TSX 파일은 course `config.ts`에서 import.

**Tech Stack:** TypeScript, esbuild(buildSync), Remotion 4.x, pnpm

**Spec:** `docs/superpowers/specs/2026-03-19-config-cascade-design.md`

---

## File Map

| 파일                                                  | 작업       | 설명                                                                                              |
| ----------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `src/config.ts`                                       | **Create** | 루트: FPS, CROSS, CHARS_PER_SEC, SCENE_TAIL_FRAMES, 전역 PRONUNCIATION                            |
| `src/compositions/001-Java-Basic/config.ts`           | **Create** | 강좌+언어: VOICE, RATE, WIDTH, HEIGHT, 강좌 PRONUNCIATION                                         |
| `src/utils/scene.tsx`                                 | **Modify** | CROSS/CHARS_PER_SEC를 src/config에서 re-export                                                    |
| `scripts/sync.ts`                                     | **Modify** | loadMergedConfig(esbuild) 추가, VOICE/RATE/FPS/SCENE_TAIL 하드코딩 제거, loadConfig 반환타입 수정 |
| `src/compositions/001-Java-Basic/001~009-JavaXxx.tsx` | **Modify** | import 경로 교체 (global.config/series.config → ./config), SERIES_FPS→FPS 심볼 교체               |
| `src/compositions/001-Java-Basic/001~009-srt.ts`      | **Modify** | SERIES_FPS → FPS import 경로 교체                                                                 |
| `src/global.config.ts`                                | **Delete** | src/config.ts로 통합                                                                              |
| `src/global-pronunciation.ts`                         | **Delete** | src/config.ts로 통합                                                                              |
| `src/compositions/001-Java-Basic/series.config.ts`    | **Delete** | 001-Java-Basic/config.ts로 통합                                                                   |

> **Task 순서 의존성:** Task 2 완료 후 Task 4 실행 (mergedConfig가 course config.ts를 읽으므로)

---

## Chunk 1: 새 config 파일 생성

### Task 1: `src/config.ts` 생성

**Files:**

- Create: `src/config.ts`

- [ ] **Step 1: 파일 생성**

```ts
// src/config.ts — 루트 전역 설정
// 모든 강좌/강의가 이 값을 상속한다

// ── 타이밍 ───────────────────────────────────────────────────
/** 렌더링 프레임레이트 */
export const FPS = 30;

/** 오디오 종료 후 씬이 유지되는 여유 프레임 */
export const SCENE_TAIL_FRAMES = 15;

/** 씬 간 크로스페이드 프레임 수 */
export const CROSS = 20;

/** 타이핑 이펙트 — 초당 글자 수 */
export const CHARS_PER_SEC = 10;

// ── 전역 발음맵 ──────────────────────────────────────────────
/** 우선순위: 인라인[X(발음:Y)] > 강좌 config > 이 맵 */
export const PRONUNCIATION: Record<string, string> = {
  true: "트루",
  false: "폴스",
  "!true": "낫 트루",
  "!false": "낫 폴스",
  "||": "OR",
  "&&": "AND",
  "!": "NOT",
  double: "더블",
  boolean: "불리언",
  "System.out.println": "print line",
  Java: "자바",
  개수: "개쑤",
  거짓이: "거지시",
  거짓일: "거지실",
};
```

- [ ] **Step 2: 전체 프로젝트 타입 체크**

```bash
cd /Users/jangka512/Custom/remotions/p1
npx tsc --noEmit 2>&1 | head -30
```

Expected: 오류 없음 (새 파일 추가이므로 기존 오류 없어야 함)

- [ ] **Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: 루트 config.ts 생성 (global.config + global-pronunciation 통합)"
```

---

### Task 2: `001-Java-Basic/config.ts` 생성

> **이 Task는 Task 4보다 먼저 완료되어야 한다** — sync.ts의 mergedConfig가 이 파일을 읽음

**Files:**

- Create: `src/compositions/001-Java-Basic/config.ts`

- [ ] **Step 1: 파일 생성**

```ts
// src/compositions/001-Java-Basic/config.ts — 001 강좌 + 언어(KOR) 설정
import { PRONUNCIATION as ROOT_PRON } from "../../config";

// ── 영상 크기 ────────────────────────────────────────────────
export const WIDTH = 1080;
export const HEIGHT = 1680;

// ── TTS 언어 설정 (KOR) ──────────────────────────────────────
export const VOICE = "ko-KR-HyunsuMultilingualNeural";
export const RATE = "+30%";

// ── 강좌 발음맵 (루트 상속 + Java 전용 override) ─────────────
export const PRONUNCIATION: Record<string, string> = {
  ...ROOT_PRON,
  // Java 전용 추가 발음이 생기면 여기에
};
```

- [ ] **Step 2: 전체 타입 체크**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```bash
git add src/compositions/001-Java-Basic/config.ts
git commit -m "feat: 001-Java-Basic course config.ts 생성 (VOICE, RATE, 발음맵)"
```

---

## Chunk 2: scene.tsx + sync.ts 업데이트

### Task 3: `scene.tsx` — CROSS/CHARS_PER_SEC re-export로 교체

**Files:**

- Modify: `src/utils/scene.tsx`

- [ ] **Step 1: 현재 상수 위치 확인**

```bash
grep -n "^export const CROSS\|^export const CHARS_PER_SEC" src/utils/scene.tsx
```

Expected: 두 줄이 직접 정의되어 있음

- [ ] **Step 2: 직접 정의 → re-export로 교체**

`export const CROSS = 20;`와 `export const CHARS_PER_SEC = 10;` 두 줄을:

```ts
export { CROSS, CHARS_PER_SEC } from "../config";
```

한 줄로 교체

- [ ] **Step 3: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 오류 없음

- [ ] **Step 4: Commit**

```bash
git add src/utils/scene.tsx
git commit -m "refactor: scene.tsx CROSS/CHARS_PER_SEC를 src/config에서 re-export"
```

---

### Task 4: `sync.ts` — mergedConfig 기반 config cascade

> **전제조건:** Task 1, Task 2 완료 후 실행

**Files:**

- Modify: `scripts/sync.ts`

- [ ] **Step 1: loadTsExports + loadMergedConfig 함수 추가**

`scripts/sync.ts` 상단 imports 블록 바로 아래 (`const FPS = 30` 위)에 삽입:

```ts
// ── Config cascade (esbuild) ────────────────────────────────
// 주의: config 파일은 remotion 심볼을 import하면 안 됨
function loadTsExports(filePath: string): Record<string, unknown> {
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

function loadMergedConfig(
  seriesDir: string,
  episodeId: string,
): Record<string, unknown> {
  const root = loadTsExports("src/config.ts");
  const course = loadTsExports(path.join(seriesDir, "config.ts"));
  const episode = loadTsExports(path.join(seriesDir, `${episodeId}.config.ts`));
  return { ...root, ...course, ...episode };
}
```

- [ ] **Step 2: 하드코딩 상수 제거 + mergedConfig 사용**

기존 두 줄:

```ts
const FPS = 30;
const SCENE_TAIL_FRAMES = 15;
```

를 삭제하고, `SERIES_DIR`과 `compositionId` 확정 이후 위치에 추가:

```ts
const mergedConfig = loadMergedConfig(SERIES_DIR, compositionId);
const FPS = (mergedConfig.FPS as number) ?? 30;
const SCENE_TAIL_FRAMES = (mergedConfig.SCENE_TAIL_FRAMES as number) ?? 15;
const VOICE = mergedConfig.VOICE as string;
const RATE = mergedConfig.RATE as string;
```

- [ ] **Step 3: loadConfig 반환타입에서 VOICE/RATE 제거 + 구조분해 수정**

`loadConfig()` 함수 반환타입 변경:

```ts
// 변경 전
function loadConfig(): {
  VOICE: string;
  RATE: string;
  VIDEO_CONFIG: Record<string, SceneEntry>;
};
// 변경 후
function loadConfig(): { VIDEO_CONFIG: Record<string, SceneEntry> };
```

호출부:

```ts
// 변경 전
const { VOICE, RATE, VIDEO_CONFIG } = loadConfig();
// 변경 후
const { VIDEO_CONFIG } = loadConfig();
```

- [ ] **Step 4: 발음맵 로딩을 mergedConfig로 교체**

기존:

```ts
const globalPronMap = loadPronunciationMap(
  path.join("src", "global-pronunciation.ts"),
);
const seriesPronMap = loadPronunciationMap(
  path.join(SERIES_DIR, "pronunciation.ts"),
);
```

및 이 두 맵을 합치는 로직 전부 삭제하고:

```ts
const pronMap = (mergedConfig.PRONUNCIATION as Record<string, string>) ?? {};
```

`toTTSText(text, pronMap)` 호출부에서 기존 merge map 인자를 `pronMap`으로 교체.

- [ ] **Step 5: sync 단일 실행 테스트**

```bash
pnpm sync 001-Java-Basic/001 2>&1
```

Expected: 오류 없이 `[skip]` 또는 `[gen]` 출력

- [ ] **Step 6: Commit**

```bash
git add scripts/sync.ts
git commit -m "refactor: sync.ts mergedConfig cascade + FPS/VOICE/RATE 하드코딩 제거"
```

---

## Chunk 3: TSX + SRT 파일 import 교체

### Task 5: 001~009 TSX + SRT 파일 import 일괄 교체

**Files (TSX):**

- Modify: `src/compositions/001-Java-Basic/001-JavaVariables.tsx`
- Modify: `src/compositions/001-Java-Basic/002-JavaDataTypes.tsx`
- Modify: `src/compositions/001-Java-Basic/003-JavaOperators.tsx`
- Modify: `src/compositions/001-Java-Basic/004-JavaComparison.tsx`
- Modify: `src/compositions/001-Java-Basic/005-JavaLogical.tsx`
- Modify: `src/compositions/001-Java-Basic/006-JavaIf.tsx`
- Modify: `src/compositions/001-Java-Basic/007-JavaSwitch.tsx`
- Modify: `src/compositions/001-Java-Basic/008-JavaWhile.tsx`
- Modify: `src/compositions/001-Java-Basic/009-JavaFor.tsx`

**Files (SRT):**

- Modify: `src/compositions/001-Java-Basic/001-srt.ts` ~ `009-srt.ts` (9개)

**TSX 파일 각각에 적용할 변경:**

```ts
// ── 삭제 ──────────────────────────────────────────────────────
import { RATE, VOICE } from "../../global.config";           // SCENE_TAIL_FRAMES 포함 여부 무관
import { SERIES_WIDTH, SERIES_HEIGHT, SERIES_FPS } from "./series.config";
export { RATE, VOICE };                                       // sync.ts가 더 이상 읽지 않음

// ── 추가 ──────────────────────────────────────────────────────
import { VOICE, RATE, WIDTH, HEIGHT, FPS } from "./config";
// SCENE_TAIL_FRAMES 사용하는 파일(001, 007, 008)만 추가:
import { SCENE_TAIL_FRAMES } from "../../config";
```

심볼 전체 치환 (파일 내 모든 위치):

- `SERIES_WIDTH` → `WIDTH`
- `SERIES_HEIGHT` → `HEIGHT`
- `SERIES_FPS` → `FPS`

**SRT 파일 각각에 적용할 변경:**

```ts
// ── 삭제 ──────────────────────────────────────────────────────
import { SERIES_FPS } from "./series.config";
const SCENE_TAIL_FRAMES = 15;   // 하드코딩된 경우 삭제
const CROSS = 20;               // 하드코딩된 경우 삭제

// ── 추가 ──────────────────────────────────────────────────────
import { FPS } from "./config";
import { SCENE_TAIL_FRAMES, CROSS } from "../../config";   // 필요한 것만
```

심볼 치환:

- `SERIES_FPS` → `FPS`

- [ ] **Step 1: 변경 전 현황 확인**

```bash
grep -rn "global\.config\|series\.config\|SERIES_WIDTH\|SERIES_HEIGHT\|SERIES_FPS\|export.*RATE.*VOICE" \
  src/compositions/001-Java-Basic/ --include="*.tsx" --include="*.ts"
```

- [ ] **Step 2: 001-JavaVariables.tsx 수정 + 확인**

편집 후:

```bash
npx tsc --noEmit 2>&1 | grep "001-Java" | head -10
```

Expected: 001 관련 오류 없음

- [ ] **Step 3: 002~009 TSX 파일 수정**

각 파일 동일 패턴 적용

- [ ] **Step 4: 001~009 SRT 파일 수정**

```bash
# 대상 확인
grep -n "SERIES_FPS\|series\.config" src/compositions/001-Java-Basic/*-srt.ts
```

각 파일: `import { SERIES_FPS } from "./series.config"` → `import { FPS } from "./config"`
심볼: `SERIES_FPS` → `FPS`

SCENE_TAIL_FRAMES/CROSS 하드코딩 발견 시 삭제 후 `../../config`에서 import

- [ ] **Step 5: 전체 빌드 확인**

```bash
npx tsc --noEmit 2>&1
```

Expected: 오류 0개

- [ ] **Step 6: Remotion Studio 확인**

```bash
pnpm dev
# localhost:3000 → 영상 목록 정상 표시
```

- [ ] **Step 7: Commit**

```bash
git add src/compositions/001-Java-Basic/
git commit -m "refactor: 001 전체 TSX/SRT — global.config/series.config → ./config import 교체"
```

---

## Chunk 4: 구파일 삭제 + 최종 검증

### Task 6: 구파일 삭제

**Files:**

- Delete: `src/global.config.ts`
- Delete: `src/global-pronunciation.ts`
- Delete: `src/compositions/001-Java-Basic/series.config.ts`

- [ ] **Step 1: 잔여 참조 0개 확인**

```bash
grep -r "global\.config\|global-pronunciation\|series\.config" \
  src/ scripts/ --include="*.ts" --include="*.tsx"
```

Expected: 결과 없음 (0건). 있으면 먼저 수정 후 진행.

- [ ] **Step 2: 파일 삭제**

```bash
rm src/global.config.ts src/global-pronunciation.ts
rm src/compositions/001-Java-Basic/series.config.ts
```

- [ ] **Step 3: 빌드 재확인**

```bash
npx tsc --noEmit 2>&1
```

Expected: 오류 0개

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: global.config/global-pronunciation/series.config 구파일 삭제"
```

---

### Task 7: 전체 sync 검증 + push

- [ ] **Step 1: sync:all 실행**

```bash
pnpm sync:all 2>&1
```

Expected: 모든 씬 `[skip]` (hash 동일 → 재사용)
`[gen]` 발생 시: config hash 변경이 감지된 것 — 새 mp3 정상 생성, 허용

- [ ] **Step 2: config 변경 자동 재생성 검증**

```bash
# 001-Java-Basic/config.ts RATE를 "+31%"로 임시 변경 후:
pnpm sync 001-Java-Basic/001 2>&1
# → [gen] 출력 확인 (hash 불일치 정상 동작)
# RATE "+30%"로 원복 후 재실행 → [skip]
```

- [ ] **Step 3: push**

```bash
git push
```

---

## 완료 기준

- [ ] `src/config.ts` — FPS, SCENE_TAIL_FRAMES, CROSS, CHARS_PER_SEC, PRONUNCIATION
- [ ] `001-Java-Basic/config.ts` — VOICE, RATE, WIDTH, HEIGHT, PRONUNCIATION
- [ ] 구파일 3개 삭제 완료
- [ ] `npx tsc --noEmit` 오류 0개
- [ ] `pnpm sync:all` 오류 없이 완료
- [ ] `pnpm dev` 정상 기동
- [ ] RATE 변경 시 `[gen]` → 원복 시 `[skip]` 확인
