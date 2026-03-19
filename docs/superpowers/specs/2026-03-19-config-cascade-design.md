# Config Cascade & 체질개선 설계

작성일: 2026-03-19

---

## 목표

- AI 개입 없이 `pnpm sync` 한 번으로 관련 파일 전체가 자동 갱신
- 설정 변경이 단방향(위→아래)으로 자연 전파
- 설정 4단계 계층 (루트 → 강좌 → 언어 → 강의)
- 토큰 절약: 파일 작고 단일 책임, 중복 없음

---

## 데이터 흐름 (단방향)

```
src/config.ts                ← 루트 설정
  ↓ import / merge
compositions/001/config.ts   ← 강좌+언어 설정
  ↓ merge
compositions/001/001.config.ts ← 강의별 override (선택)
  ↓ sync.ts가 mergedConfig 읽음
public/*.mp3 + *-audio.ts    ← AUTO-GENERATED (순수 데이터)
  ↓ TypeScript import
씬 TSX                       ← AUDIO_CONFIG 읽어 렌더링
```

역방향 수동 편집 없음. 위에서 아래로만 흐른다.

---

## 파일 구조 (변경 후)

```
src/
  config.ts                          ← 루트 (기존 global.config.ts + global-pronunciation.ts + scene.tsx 상수 통합)
  utils/
    scene.tsx                        ← import 경로만 변경 (로직 유지)
    narration.ts                     ← 유지
  compositions/
    001-Java-Basic/
      config.ts                      ← 강좌+언어 (기존 series.config.ts + VOICE/RATE + 강좌 발음맵)
      001.config.ts                  ← 강의 override (대부분 최소 내용)
      001-JavaVariables.tsx          ← 유지 (narration 텍스트 포함)
      001-audio.ts                   ← AUTO-GENERATED
      ...
    002-React-Basic/
      config.ts
      001.config.ts
      ...
```

### 삭제되는 파일

| 기존 파일 | 이동 대상 |
|---|---|
| `src/global.config.ts` | `src/config.ts` |
| `src/global-pronunciation.ts` | `src/config.ts` |
| `001-Java-Basic/series.config.ts` | `001-Java-Basic/config.ts` |

---

## 각 config 파일 내용

### `src/config.ts` (루트)

```ts
// ── 타이밍 ────────────────────────────────────────────────────
export const FPS               = 30;
export const SCENE_TAIL_FRAMES = 15;
export const CROSS             = 20;   // 씬 간 크로스페이드 프레임
export const CHARS_PER_SEC     = 10;   // 타이핑 속도

// ── 전역 발음맵 ────────────────────────────────────────────────
export const PRONUNCIATION: Record<string, string> = {
  "true": "트루", "false": "폴스", ...
};
```

### `compositions/001-Java-Basic/config.ts` (강좌+언어)

```ts
import { PRONUNCIATION as ROOT_PRON } from "../../config";

export const WIDTH  = 1080;
export const HEIGHT = 1680;

// 언어 설정 (KOR 기준, 추후 ENG 추가 시 lang 필드 확장)
export const VOICE  = "ko-KR-HyunsuMultilingualNeural";
export const RATE   = "+30%";

// 강좌별 발음맵 (루트 발음맵 상속 + override)
export const PRONUNCIATION: Record<string, string> = {
  ...ROOT_PRON,
  // Java 전용
  "System.out.println": "print line",
  "double": "더블",
};
```

### `compositions/001-Java-Basic/001.config.ts` (강의)

```ts
// 강의별 특별 override만 기재. 없으면 course config 그대로.
export const EPISODE_TITLE = "변수란 무엇인가?";
// export const RATE = "+20%";  // 이 강의만 다른 속도 쓸 경우
```

---

## sync.ts 변경 사항

### 핵심: hash에 config 포함

```ts
// 현재
hash(VOICE + RATE + ttsText)

// 변경 후
const cfg = loadMergedConfig(seriesDir, episodeId);
hash(cfg.VOICE + cfg.RATE + ttsText)
```

`config.ts`가 어느 레벨이든 변경되면 hash 불일치 → 해당 범위 자동 재생성.

### mergedConfig 로딩 — esbuild 방식 (raw require 금지)

`sync.ts`는 `.ts` 파일을 런타임에 직접 읽어야 한다. 기존 `loadConfig()`처럼
`buildSync` (esbuild) + `new Function` 패턴으로 각 레벨 config를 번들 후 실행.

```ts
function loadTsExports(filePath: string): Record<string, unknown> {
  if (!existsSync(filePath)) return {};
  const result = buildSync({ entryPoints: [filePath], bundle: true,
    format: "cjs", platform: "node", write: false });
  const code = result.outputFiles[0].text;
  const m: Record<string, unknown> = {};
  new Function("exports", "require", code)(m, require);
  return m;
}

function loadMergedConfig(seriesDir: string, episodeId: string) {
  const root    = loadTsExports("src/config.ts");
  const course  = loadTsExports(`${seriesDir}/config.ts`);
  const episode = loadTsExports(`${seriesDir}/${episodeId}.config.ts`);
  return { ...root, ...course, ...episode };
}
```

### 발음맵 cascade

```ts
// 현재: globalPronMap + seriesPronMap 두 파일 별도 로드
// 변경 후: courseConfig.PRONUNCIATION이 이미 root spread된 상태
// toTTSText에 mergedConfig.PRONUNCIATION을 그대로 전달
const pronMap = mergedConfig.PRONUNCIATION as Record<string, string>;
// toTTSText(text, pronMap) — 함수 시그니처 유지
```

### FPS / SCENE_TAIL_FRAMES 하드코딩 제거

```ts
// 현재: sync.ts 상단 const FPS = 30; const SCENE_TAIL_FRAMES = 15;
// 변경 후: mergedConfig에서 읽기
const FPS              = (mergedConfig.FPS              as number) ?? 30;
const SCENE_TAIL_FRAMES = (mergedConfig.SCENE_TAIL_FRAMES as number) ?? 15;
```

---

## scene.tsx 변경 사항

```ts
// 현재: 직접 정의
export const CROSS = 20;
export const CHARS_PER_SEC = 10;

// 변경 후: src/config.ts에서 re-export
export { CROSS, CHARS_PER_SEC } from "../config";
```

씬 TSX 파일의 import 경로는 유지. scene.tsx가 중간 re-export 담당.

---

## 전파 보장 원칙

1. **AUTO-GENERATED 파일은 절대 수동 편집 금지** (`*-audio.ts`)
2. **씬 TSX는 항상 AUDIO_CONFIG 참조** — 타이밍 하드코딩 금지
3. **VOICE/RATE 변경 시**: course `config.ts`만 수정 → `pnpm sync:all` → 전체 재생성
4. **강의별 override 필요 시**: `001.config.ts`에만 기재

---

## 마이그레이션 순서

1. `src/config.ts` 생성 (global.config + global-pronunciation + CROSS/CHARS_PER_SEC 통합)
2. `001-Java-Basic/config.ts` 생성 (series.config + VOICE/RATE + 강좌 발음맵)
   - 심볼명 변경: `SERIES_WIDTH` → `WIDTH`, `SERIES_HEIGHT` → `HEIGHT`, `SERIES_FPS` 제거 (FPS는 root)
3. `001-Java-Basic/001.config.ts` 생성 (에피소드 override가 있는 것만; 없으면 파일 생성 불필요)
4. `sync.ts` — `loadMergedConfig` (esbuild 방식) + hash에 VOICE/RATE/FPS 포함
5. `scene.tsx` — CROSS/CHARS_PER_SEC를 `../config`에서 re-export
6. 모든 TSX 파일 import 경로 업데이트
   - `series.config.ts` → `./config.ts` (심볼명 변경 포함: `SERIES_WIDTH` → `WIDTH`)
   - `../../global.config.ts` → import 경로는 scene.tsx를 통해 유지
7. 빌드 확인 (`pnpm dev` 오류 없음)
8. 기존 파일 삭제 (`global.config.ts`, `global-pronunciation.ts`, `series.config.ts`)
9. `pnpm sync:all` 실행하여 전체 검증
