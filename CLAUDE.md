# Remotion 영상 프로젝트 — Claude 작업 가이드

## 프로젝트 구조

- `src/compositions/0001-JavaVariables.tsx` — 영상 컴포지션 (씬 데이터 + 컴포넌트 + 타이밍 전부 이 파일)
- `src/global.config.ts` — 전역 설정 (VOICE, RATE, SCENE_TAIL_FRAMES 등)
- `scripts/sync-audio.ts` — TTS 오디오 생성 + durationInFrames 자동 업데이트 스크립트
- `public/` — 생성된 mp3 파일 위치
- `out/` — 렌더링 출력 위치 (기본: `out/0001.mp4`)

## 나레이션 수정 워크플로우

나레이션 텍스트를 바꾸면 **반드시** 아래 명령 하나만 실행한다:

```bash
pnpm sync 0001
```

`sync`가 자동으로 처리하는 것:
- 씬별 해시값으로 변경 여부를 감지 — 바뀐 씬만 재생성
- edge-tts로 mp3 생성
- ffprobe로 실측 duration 측정 → `durationInFrames: f(X.XX)` 자동 반영
- ffmpeg silencedetect로 문장 분기 프레임 감지 → `narrationSplits: [...]` 자동 반영

**수동으로 durationInFrames나 narrationSplits를 건드릴 필요 없다.**

**narration이 바뀌었다고 사용자가 말하면 무엇이 바뀌었는지 묻지 말고 바로 `pnpm sync 0001`을 실행한다.**
스크립트가 해시로 변경된 씬을 감지해서 알아서 처리한다.

## VIDEO_CONFIG 구조

```ts
declaration: {
  audio: "scene1.mp3",           // public/ 하위 파일명
  durationInFrames: f(12.48),    // sync-audio가 자동 관리 — 손대지 말 것
  title: "1. 변수 선언 ...",
  code: codeUpTo(1),             // ALL_CODE 배열에서 n번째까지 슬라이스
  narration: ["...", "..."],     // 자막 + TTS 스크립트 겸용
}
```

## 씬 구성

| 씬 | 컴포넌트 | 특이사항 |
|---|---|---|
| 썸네일 | `ThumbnailScene` | 30프레임 정지 화면, 유튜브 자동 썸네일용 |
| 선언+초기화 | `CombinedDeclarationInitScene` | 두 씬을 하나로 합침, 박스 애니메이션이 끊기지 않고 이어짐 |
| 출력 | `PrintScene` | 콘솔 출력 애니메이션 포함 |

## 애니메이션 컴포넌트

- `CombinedVariableBox` — 선언(빈 상자 + ? 깜빡임) → 초기화(25 낙하) 전 구간을 하나의 박스로 처리
- `ConsoleOutput` — 출력 씬의 콘솔 결과 표시

## 타이밍 상수

```ts
TYPING_START = 20        // 씬 시작 후 타이핑 시작까지 프레임
CHARS_PER_SEC = 10       // 타이핑 속도
CROSS = 20               // 씬 간 크로스페이드 프레임
SCENE_TAIL_FRAMES = 15   // 오디오 종료 후 여유 프레임 (global.config.ts)
```

## 코드 관리

```ts
const ALL_CODE = ["int age;", "age = 25;", "System.out.println(age);"];
const codeUpTo = (n) => ...  // n줄까지, 마지막 줄만 isNew:true (타이핑 효과)
```

새 코드 라인 추가 시 `ALL_CODE`에만 넣으면 된다. 각 씬에서 `codeUpTo(n)` 호출.

## 자막 관련

- `wordBreak: "keep-all"` — 한국어 단어 중간 줄바꿈 방지
- `whiteSpace: "pre-line"` — 나레이션 문자열에서 `\n` 사용 가능
- `maxWidth: compositionWidth - 20` — 화면 넘침 방지 (`100dvw` 아닌 `useVideoConfig().width` 사용)

## 렌더링

```bash
# Remotion Studio 미리보기
npm run dev   # http://localhost:3000

# 렌더링
npx remotion render src/index.ts 0001 out/0001.mp4
```

## 주의사항

- CSS `transition` / `animation` 사용 금지 → 렌더링 시 무시됨. 반드시 `interpolate` / `spring` 사용
- `100dvw` 사용 금지 → 브라우저 뷰포트 기준이라 Remotion 캔버스 크기와 다름. `useVideoConfig().width` 사용
- 새 씬 추가 시 `mergedSceneList` 배열도 업데이트 필요
