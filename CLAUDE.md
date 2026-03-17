# Remotion 영상 프로젝트 — Claude 작업 가이드

## 프로젝트 구조

```
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

## PRONUNCIATION (global.config.ts)

```ts
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

- 자막 표시용과 TTS 읽기용을 분리할 때 사용
- PRONUNCIATION 변경 시 해시가 달라져 영향받는 씬 자동 재생성됨

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

## 씬 타이밍 상수

```ts
TYPING_START = 20    // 씬 시작 후 타이핑 시작까지 프레임
CHARS_PER_SEC = 10   // 타이핑 속도 (초당 글자)
CROSS = 20           // 씬 간 크로스페이드 프레임
SCENE_TAIL_FRAMES = 15  // 오디오 종료 후 여유 프레임 (global.config.ts)
```

## 새 에피소드 추가 방법

1. `src/compositions/{시리즈폴더}/{id}-{이름}.tsx` 생성
2. `export const compositionMeta`, `export const VIDEO_CONFIG`, `export const Component` 포함
3. `{id}-audio.ts` 없으면 sync가 자동 스텁 생성
4. `pnpm sync {시리즈폴더}/{id}` 실행

## 주의사항

- CSS `transition` / `animation` 사용 금지 → 렌더링 시 무시됨. 반드시 `interpolate` / `spring` 사용
- `100dvw` 사용 금지 → `useVideoConfig().width` 사용
- 새 씬 추가 시 `mergedSceneList` / `sceneList` 배열도 업데이트 필요
- 해시 파일: `.{시리즈폴더}-{id}-audio-hashes.json` (루트에 숨김파일로 저장)
- 강제 전체 재생성: 해시 파일 삭제 후 `pnpm sync:all`

## 실험 브랜치

- `feat/karaoke-subtitles` — Whisper 기반 단어별 자막 하이라이팅 실험 (faster-whisper + wordStartFrames)
