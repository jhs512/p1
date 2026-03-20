# Remotion 영상 프로젝트 — Claude 작업 가이드

---

## ⚠️ 절대 원칙 — 나레이션 작성 시 반드시 지킨다

### 1. 자막에 코드를 쓰지 않는다

`int`, `score += 10`, `count++`, `String` 같은 코드는 **자막(narration 텍스트)에 절대 넣지 않는다**.
코드는 화면 디자인(씬 비주얼)으로 보여준다.

### 2. TTS가 잘못 읽을 단어는 인라인 발음 문법을 쓴다

```
[표시텍스트(발음:TTS읽기)]
```

- `[System.out.println(발음:print line)]` → 자막: System.out.println / TTS: print line
- `[double(발음:더블)]` → 자막: double / TTS: 더블
- `[(자료)(발음:)]` → 자막: (자료) / TTS: 묵음

**나레이션을 쓸 때마다 이 두 가지를 반드시 확인한다.**

### 3. 마지막 씬은 fadeOut 없이 끝낸다

영상의 마지막 씬은 `fadeOut`을 적용하지 않는다. fadeIn만 적용하고 그대로 끝낸다.

- `useFade(d)` 대신 `useFade(d, { out: false })` 사용
- 인라인인 경우 `fadeOut` 계산 제거, `opacity: fadeIn` 만 사용

### 4. JetBrains Mono 리가처는 항상 끈다

모노스페이스 폰트를 사용하는 모든 요소에 반드시 `fontFeatureSettings: MONO_NO_LIGA` 를 추가한다.
이를 적용하지 않으면 `!=` → `≠`, `==` → `≡`, `>=` → `≥` 같은 리가처 변환이 발생한다.

- `MONO_NO_LIGA`는 `src/utils/scene.tsx`에서 import한다 — 각 파일에 직접 정의하지 않는다.
- 모든 `fontFamily: monoFont` 사용처에 `fontFeatureSettings: MONO_NO_LIGA` 를 함께 쓴다.

### 5. 중간 작업마다 커밋/푸시한다

기능 단위 또는 씬 단위로 작업이 완료되면 즉시 커밋하고 push한다.

- 자동으로 판단해 커밋 타이밍을 챙긴다. 사용자가 요청하지 않아도 된다.
- 커밋 메시지는 한국어로 작성해도 된다.

### 6. 씬 전환은 오디오와 애니메이션 둘 다 끝난 후에 한다

씬의 `durationInFrames`는 **오디오 길이와 애니메이션 완료 프레임 중 더 긴 쪽**을 기준으로 설정한다.

```ts
// 씬에 긴 애니메이션이 있을 경우 duration을 직접 계산해 override한다
const ANIM_END_FRAME =
  speechStartFrame + Math.ceil((totalChars / charsPerSec) * fps);
const sceneDuration = Math.max(
  AUDIO_CONFIG.xxx.durationInFrames,
  ANIM_END_FRAME + CROSS + SCENE_TAIL_FRAMES,
);
```

- `CROSS`는 crossfade 시작 시점이므로 애니메이션이 **페이드 시작 전에** 완료되려면 `+ CROSS` 를 더한다.
- `SCENE_TAIL_FRAMES`는 애니메이션 완료 후 여유 구간.
- 타이핑 애니메이션, 복잡한 spring 체인 등 오디오보다 오래 걸릴 수 있는 씬에서 반드시 체크한다.
- **오디오만 끝났다고 씬을 전환하면 안 된다 — 헌법.**

### 7. 애니메이션은 반드시 발화 시작 프레임에 맞춘다

씬 안의 시각 애니메이션은 관련 단어/문장의 **발화 시작 프레임**과 동기화해야 한다.

- `AUDIO_CONFIG.{씬}.wordStartFrames` 또는 `speechStartFrame` / `narrationSplits`를 직접 참조한다.
- **`durationInFrames / 2 + offset` 같은 하드코딩 오프셋은 절대 금지.**
- 예: "꺼내" 단어 시점에 꺼내기 애니메이션 → `AUDIO_CONFIG.intro.wordStartFrames[1][5]`
- sync 후 wordStartFrames가 자동 갱신되므로 코드 수정 없이 타이밍이 유지된다.

### 8. 나중에 등장하는 요소는 조건부 렌더링 대신 opacity로 제어한다

`{condition && <Element />}` 패턴은 요소가 추가될 때 레이아웃이 변한다.
부모가 `translate(-50%, -50%)` 수직 중앙정렬이면 높이 변화 시 전체가 위로 밀린다.

```tsx
// ❌ 금지 — 등장 시 컨테이너 높이가 늘어나 레이아웃이 밀림
{phase2 && <div style={{ height: 100 }}>키워드</div>}

// ✅ 올바름 — 항상 공간 확보, opacity로만 표시/숨김
<div style={{ opacity: phase2 ? appear : 0 }}>키워드</div>
```

- **공간을 차지하는 모든 애니메이션 등장 요소에 적용 — 헌법.**
- `visibility: hidden`도 동일 효과지만 `opacity`가 페이드 인 애니메이션과 조합하기 쉬움.
- spring 값이 이미 0에서 시작하면 `phase2 ? appear : 0` 대신 `appear`만 써도 된다 — spring이 `frame - split` 기준이면 phase 이전엔 자동으로 0.

트리 노드 패턴 (006-JavaIf OverviewScene 실제 사례):
```tsx
// ❌ 금지 — if 노드 등장 시 조건문 컬럼 높이가 늘어나 전체 트리가 위로 밀림
{phase2 && (
  <>
    <div style={{ height: 20 }} /> {/* 연결선 */}
    <div>if</div>
  </>
)}

// ✅ 올바름 — 항상 공간 확보, ifAppear(spring)이 0이면 보이지 않음
<div style={{ height: 20, opacity: ifAppear }} /> {/* 연결선 */}
<div style={{ opacity: ifAppear }}>if</div>
```

---

## 프로젝트 구조

```
src/
  global.config.ts              — 전역 설정 (VOICE, RATE, SCENE_TAIL_FRAMES)
  index.ts                      — Remotion 엔트리포인트 (Root.tsx 연결)
  Root.tsx                      — 모든 컴포지션 자동 등록 (require.context) + Folder 그룹핑
  utils/
    narration.ts                — toDisplayText / toTTSText (인라인 발음 문법 파싱)
    scene.tsx                   — 공유 상수·훅·컴포넌트 (모든 씬 파일이 import)
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
```

## 나레이션 수정 워크플로우

나레이션 텍스트 또는 PRONUNCIATION을 바꾸면 **반드시** 아래 명령을 실행한다:

```bash
pnpm sync 001-Java-Basic/001
pnpm sync 001-Java-Basic/002
# 또는 전체 한번에:
pnpm sync:all
```

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

```ts
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
```

## VIDEO_CONFIG 구조

```ts
intro: {
  audio: "scene0.mp3",
  durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
  narration: ["첫 번째 문장.", "두 번째 문장."],
  narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,  // Subtitle 타이밍용
}
```

## Subtitle 컴포넌트

- `speechStart` 프레임부터 fade-in (12프레임) — 실제 발화 시작과 동기화
- `narrationSplits` 기준으로 문장 전환
- 단일 흰색 텍스트 (`#ffffff`) — 카라오케 하이라이팅 없음
- 카라오케 실험 코드는 `feat/karaoke-subtitles` 브랜치에 보존

## 인라인 발음 문법

나레이션 텍스트 안에서 자막 표시와 TTS 읽기를 분리할 때 사용:

```
[표시텍스트(발음:TTS텍스트)]
```

예시:

```ts
"[유튜브(발음:유튭)]에서 확인할 수 있습니다.";
// 자막: 유튜브에서 확인할 수 있습니다.
// TTS: 유튭에서 확인할 수 있습니다.

"[System.out.println(발음:print line)]으로 출력합니다.";
// 자막: System.out.println으로 출력합니다.
// TTS: print line으로 출력합니다.

"[(자료)(발음:)]형이란";
// 자막: (자료)형이란
// TTS: 형이란  ← 빈 발음 = 묵음
```

- `src/utils/narration.ts`의 `toDisplayText` / `toTTSText` 함수로 파싱
- 전역 PRONUNCIATION 맵 제거됨 — 인라인 문법으로 대체

## 컴포지션 ID 규칙

- Root.tsx가 `require.context`로 자동 발견 + `Folder`로 시리즈 그룹핑
- ID 형식: `{시리즈앞숫자}-{episodeNum}` (예: `001-001`, `001-002`)
- Remotion Studio URL: `localhost:3000`

## 렌더링

```bash
# Remotion Studio 미리보기
pnpm dev   # http://localhost:3000

# 헤드리스 렌더링 (CLI 직접)
npx remotion render src/index.ts 001-001 out/001.mp4
npx remotion render src/index.ts 001-002 out/002.mp4

# 프로그래매틱 렌더링 (권장)
pnpm render 001-Java-Basic/001
pnpm render 001-Java-Basic/002
```

## 공유 유틸 — `src/utils/scene.tsx`

모든 씬 파일이 공통으로 사용하는 것들은 `src/utils/scene.tsx`에 정의되어 있다.
각 파일에 직접 정의하지 말고 반드시 import해서 사용한다.

```ts
import {
  // 씬 간 크로스페이드 프레임 (= 20)
  CHARS_PER_SEC,
  // JetBrains Mono 리가처 비활성화
  CROSS,
  // 폰트 패밀리 문자열 (폰트 로딩도 scene.tsx 가 처리)
  MONO_NO_LIGA,
  // 씬 fadeIn/fadeOut opacity 훅
  Subtitle,
  // 하단 자막 컴포넌트
  monoFont,
  uiFont,
  // 타이핑 속도 초당 글자 (= 10)
  useFade,
} from "../../utils/scene";
```

- 폰트 import (`loadJetBrains`, `loadNotoSans`)와 `delayRender`/`continueRender`는 씬 파일에 쓰지 않는다.
- 새 씬 파일에서 위 목록이 필요하면 scene.tsx에서 import한다.

## 씬 타이밍 상수

```ts
CHARS_PER_SEC = 10; // 타이핑 속도 (초당 글자) — src/utils/scene.tsx
CROSS = 20; // 씬 간 크로스페이드 프레임 — src/utils/scene.tsx
SCENE_TAIL_FRAMES = 15; // 오디오 종료 후 여유 프레임 — global.config.ts
```

## 새 에피소드 추가 방법

1. `src/compositions/{시리즈폴더}/{id}-{이름}.tsx` 생성
2. `export const compositionMeta`, `export const VIDEO_CONFIG`, `export const Component` 포함
3. `{id}-audio.ts` 없으면 sync가 자동 스텁 생성
4. `pnpm sync {시리즈폴더}/{id}` 실행

## 자막(Subtitle) 원칙

- **자막에 코드를 쓰지 않는다.** `int`, `score += 10`, `count++` 같은 코드는 자막이 아니라 화면 디자인(씬 비주얼)으로 표현한다.
- 자막은 순수 한국어 설명 문장만 사용한다.
- 코드 설명이 필요한 경우 나레이션으로 말하고, 화면에 코드 블록/애니메이션으로 시각적으로 보여준다.

## 주의사항

- CSS `transition` / `animation` 사용 금지 → 렌더링 시 무시됨. 반드시 `interpolate` / `spring` 사용
- `100dvw` 사용 금지 → `useVideoConfig().width` 사용
- 새 씬 추가 시 `mergedSceneList` / `sceneList` 배열도 업데이트 필요
- 해시 파일: `.{시리즈폴더}-{id}-audio-hashes.json` (루트에 숨김파일로 저장)
- 강제 전체 재생성: 해시 파일 삭제 후 `pnpm sync:all`

## 실험 브랜치

- `feat/karaoke-subtitles` — Whisper 기반 단어별 자막 하이라이팅 실험 (faster-whisper + wordStartFrames)
