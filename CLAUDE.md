# Remotion 영상 프로젝트 — Claude 작업 가이드

## 프로젝트 구조

```
src/
  global.config.ts              — 전역 설정 (VOICE, RATE, SCENE_TAIL_FRAMES, PRONUNCIATION)
  index.ts                      — Remotion 엔트리포인트 (Root.tsx 연결)
  Root.tsx                      — 모든 컴포지션 자동 등록 (require.context)
  compositions/
    001-Java-Basic/
      001-JavaVariables.tsx     — 001 영상 컴포지션
      001-audio.ts              — AUTO-GENERATED: durationInFrames, narrationSplits, speechStartFrame
      002-JavaDataTypes.tsx     — 002 영상 컴포지션
      002-audio.ts              — AUTO-GENERATED: durationInFrames, narrationSplits, speechStartFrame
scripts/
  sync.ts                       — TTS 생성 + audio config 자동 업데이트 (단일 에피소드)
  sync-all.ts                   — 모든 에피소드 일괄 싱크
  render.ts                     — 헤드리스 렌더링 (programmatic API)
public/                         — 생성된 mp3 파일
out/                            — 렌더링 출력
```

## 나레이션 수정 워크플로우

나레이션 텍스트 또는 PRONUNCIATION을 바꾸면 **반드시** 아래 명령을 실행한다:

```bash
# 특정 에피소드만
pnpm sync 001-Java-Basic/001
pnpm sync 001-Java-Basic/002

# 전체 일괄 (권장)
pnpm sync:all
```

`sync`가 자동으로 처리하는 것:
- 씬별 해시(VOICE + RATE + ttsText)로 변경 여부 감지 — 바뀐 씬만 재생성
- edge-tts로 mp3 생성
- ffprobe로 실측 duration 측정 → `durationInFrames` 자동 반영
- ffmpeg silencedetect(-40dB)로 음성 시작 프레임 감지 → `speechStartFrame` 자동 반영
- ffmpeg silencedetect(-25dB)로 문장 분기 프레임 감지 → `narrationSplits` 자동 반영
- 결과를 `{id}-audio.ts`에 저장

**수동으로 durationInFrames, narrationSplits, sentenceEndFrames, speechStartFrame, speechEndFrame을 건드릴 필요 없다.**

**narration이나 PRONUNCIATION이 바뀌었다고 하면 즉시 `pnpm sync:all`을 실행한다. 무엇이 바뀌었는지 묻지 않는다.**

### 자동 감시 모드 (권장)

```bash
pnpm watch   # 파일 변경 감지 → 해당 에피소드 자동 sync
```

- 컴포지션 `*.tsx` 저장 → 해당 에피소드만 sync
- `global.config.ts` 저장 → 전체 sync:all
- 800ms 디바운스로 연속 저장 시 중복 실행 방지

## AUDIO_CONFIG 구조 (auto-generated)

```ts
export const AUDIO_CONFIG = {
  intro: {
    durationInFrames: 198,      // 실측 오디오 길이 + SCENE_TAIL_FRAMES
    narrationSplits: [77],      // 각 문장 시작 프레임 (silence_end, 2번째 문장부터)
    sentenceEndFrames: [58],    // 각 문장 종료 프레임 (silence_start)
    speechStartFrame: 4,        // 첫 발화 시작 프레임 (leading silence 제거)
    speechEndFrame: 169,        // 마지막 발화 종료 프레임 (trailing silence 시작)
  },
  ...
} as const;
```

### ffmpeg 분석 항목 요약

| 필드 | ffmpeg 파라미터 | 의미 |
|---|---|---|
| `speechStartFrame` | silencedetect -40dB d=0.03 | leading silence 끝 = 첫 발화 시작 |
| `speechEndFrame` | silencedetect -40dB d=0.03 | trailing silence 시작 = 마지막 발화 종료 |
| `narrationSplits` | silencedetect -25dB d=0.2 | 문장 간 무음의 끝 = 다음 문장 시작 |
| `sentenceEndFrames` | silencedetect -25dB d=0.2 | 문장 간 무음의 시작 = 이전 문장 종료 |
| `durationInFrames` | ffprobe format=duration | 전체 오디오 길이 + SCENE_TAIL_FRAMES |

## VIDEO_CONFIG 구조

```ts
intro: {
  audio: "scene0.mp3",                          // public/ 하위 파일명
  durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
  speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
  narration: ["첫 번째 문장.", "두 번째 문장."],  // 자막 + TTS 스크립트 겸용
  narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
}
```

## speechStartFrame 사용법

각 씬에서 타이핑·애니메이션 시작을 실제 발화 시점에 맞춤:

```ts
// typingDone: 타이핑이 끝나는 프레임 계산
const typingDone = (chars: number, speechStart: number) =>
  speechStart + Math.ceil((chars / CHARS_PER_SEC) * 30);

// CodeBox startFrame
<CodeBox lines={scene.code} startFrame={AUDIO_CONFIG.intro.speechStartFrame} />

// 드롭 트리거: narrationSplits[0] (두 번째 문장 시작) 또는 타이핑 완료
const dropStart = config.narrationSplits[0] ?? typingDone(code.length, s);
```

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
  "(자료)": "",  // 자막엔 표시, TTS에선 제거 — 괄호 안 내용 음성 제외 패턴
};
```

- 자막 표시용과 TTS 읽기용을 분리할 때 사용
- 괄호 내용 제거: `"(텍스트)": ""` 패턴 사용
- PRONUNCIATION 변경 시 해시가 달라져 영향받는 씬 자동 재생성됨

## 컴포지션 ID 규칙

- Root.tsx가 `require.context`로 자동 발견
- ID 형식: `{seriesPrefix}-{episodeNum}` (예: `001-001`, `001-002`)
- Remotion Studio URL: `localhost:3000` → 폴더명은 `<Folder>` 컴포넌트로 UI 그룹핑
- Remotion CLI leading-zero 버그 → `pnpm render`로 programmatic API 사용

## 렌더링

```bash
# Remotion Studio 미리보기
pnpm dev   # http://localhost:3000

# 헤드리스 렌더링 (브라우저 불필요)
pnpm render 001-Java-Basic/001   # → out/001-Java-Basic/001.mp4
pnpm render 001-Java-Basic/002   # → out/001-Java-Basic/002.mp4
```

## 씬 타이밍 상수

```ts
CHARS_PER_SEC = 10       // 타이핑 속도 (초당 글자)
CROSS = 20               // 씬 간 크로스페이드 프레임
SCENE_TAIL_FRAMES = 15   // 오디오 종료 후 여유 프레임 (global.config.ts)
```

## 새 에피소드 추가 방법

1. `src/compositions/{시리즈폴더}/{id}-{이름}.tsx` 생성
2. `export const compositionMeta`, `export const Component` 포함
3. `{id}-audio.ts` 없으면 sync가 자동 스텁 생성
4. `pnpm sync {시리즈폴더}/{id}` 실행

## 주의사항

- CSS `transition` / `animation` 사용 금지 → 렌더링 시 무시됨. 반드시 `interpolate` / `spring` 사용
- `100dvw` 사용 금지 → `useVideoConfig().width` 사용
- 새 씬 추가 시 `mergedSceneList` 배열도 업데이트 필요
- 해시 파일: `.{시리즈}-{id}-audio-hashes.json` (루트에 숨김파일로 저장)
- 강제 전체 재생성: 해시 파일 삭제 후 sync 실행
