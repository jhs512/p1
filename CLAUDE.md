# Remotion 영상 프로젝트 — Claude 작업 가이드

## 관련 문서

- `src/compositions/001-Java-Basic/CLAUDE.md` — Java 기초 시리즈 콘텐츠 스펙 (나레이션 톤, 문장 규칙 등)
- `src/compositions/001-Java-Basic/TRANSLATION_NOTES.md` — ENG 번역 시 초월번역 기록

---

# 아키텍처

## 헌법

### 씬 전환은 오디오와 애니메이션 둘 다 끝난 후에 한다

씬의 `durationInFrames`는 **오디오 길이와 애니메이션 완료 프레임 중 더 긴 쪽** 기준.

```ts
const sceneDuration = Math.max(
  AUDIO_CONFIG.xxx.durationInFrames,
  ANIM_END_FRAME + CROSS + SCENE_TAIL_FRAMES,
);
```

### 애니메이션은 반드시 발화 시작 프레임에 맞춘다

- `wordStartFrames` / `speechStartFrame` / `narrationSplits` 직접 참조.
- **`durationInFrames / 2 + offset` 같은 하드코딩 오프셋 절대 금지.**

### 등장 요소는 조건부 렌더링 대신 opacity로 제어한다

```tsx
// ❌ { phase2 && <div>키워드</div> }
// ✅ <div style={{ opacity: appear }}>키워드</div>
```

### 퇴장에는 spring을 쓰지 않는다 — interpolate를 쓴다

spring 오버슈트로 사라진 요소가 깜빡인다. 퇴장과 다음 등장이 같은 프레임에 겹쳐서도 안 된다.

```tsx
const exit = interpolate(frame, [split - 20, split], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### 마지막 씬은 fadeOut 없이 끝낸다

`useFade(d, { out: false })` 사용.

### CSS transition / animation 사용 금지

렌더링 시 무시된다. `interpolate` / `spring`만 사용.

### AbsoluteFill에 반드시 background: BG

크로스페이드 시 뒤가 비침 방지. Subtitle은 AbsoluteFill **바깥**(opacity wrapper 밖)에 둔다.

---

## 법률

### JetBrains Mono 리가처는 항상 끈다

`...monoStyle` 스프레드로 `fontFamily` + `fontFeatureSettings` 동시 적용.

### 중간 작업마다 커밋/푸시한다

기능·씬 단위 완료 시 즉시. 사용자 요청 없이 자동 판단.

### 하이라이트(glow/boxShadow)는 영구 유지하지 않는다

- **반복(펄싱)**: `Math.sin(frame * speed)`
- **1회성**: 등장(spring) → 소멸(interpolate)
- **예외**: 밑줄은 영구 유지 허용.

### `100dvw` 사용 금지

`useVideoConfig().width` 사용.

---

# 스펙 (교육 콘텐츠)

## 헌법

### 자막에 긴 코드를 쓰지 않는다

`score += 10`, `count++` 같은 **긴 코드 구문**은 자막에 넣지 않는다.
단, **짧고 읽기 쉬운 코드**(`int`, `String`, `System.out.println`, `age`, `for`, `if`)는 허용.

### TTS가 잘못 읽을 단어는 인라인 발음 문법을 쓴다

```
[표시텍스트(발음:TTS읽기)]
```

- `[System.out.println(발음:print line)]` → 자막: System.out.println / TTS: print line
- `[(자료)(발음:)]` → 자막: (자료) / TTS: 묵음

**나레이션을 쓸 때마다 반드시 확인한다.**

### 빈 화면을 만들지 않는다

나레이션이 시작되면 반드시 관련 비주얼이 함께 표시되어야 한다.

### 정리/요약 씬에서 기존 코드 줄을 비활성화하지 않는다

새 줄이 타이핑되더라도 이전 줄의 opacity를 낮추지 않는다.
(상세 설명 씬에서 포커싱 목적으로 흐리게 하는 것은 허용)

### 코드 연산자 양옆에 반드시 공백을 넣는다

`✅ age = age + 2;` / `❌ age=age+2;`

### 나레이션 문장 규칙

- **문장 수**: 씬당 2~4문장. 짧고 명확하게.
- **톤**: 교육적, 설명 중심. "~입니다", "~합니다" 체.
- **줄바꿈**: 나레이션 문자열 안에서 `\n`으로 자막 줄 분리.

---

## 법률

### 인라인 발음 문법 상세

```ts
"[유튜브(발음:유튭)]에서 확인할 수 있습니다.";
// 자막: 유튜브  /  TTS: 유튭
```

- `src/utils/narration.ts`의 `toDisplayText` / `toTTSText`로 파싱

### ENG 번역 시 한국 이름은 영어권 이름으로 변경한다

철수→Chris, 영희→Emma 등. 한국어 고유명사가 영어판에 그대로 남으면 안 된다.

---

# edge-tts

## 사용 모델

| 언어         | 모델 ID                          | 약칭   |
| ------------ | -------------------------------- | ------ |
| 한국어 (KOR) | `ko-KR-HyunsuMultilingualNeural` | Hyunsu |
| 영어 (ENG)   | `en-US-EmmaMultilingualNeural`   | Emma   |

각 언어 폴더의 `config.ts`에서 `VOICE`로 설정한다.

## Word Boundary (Hyunsu / Emma 공통)

구두점에 따라 단어가 합쳐지거나 분리된다.

| TTS 텍스트       | 결과       | 비고                      |
| ---------------- | ---------- | ------------------------- |
| `AND, OR, NOT`   | 3개 분리   | ✅ 쉼표 1개               |
| `AND. OR. NOT`   | 3개 분리   | ✅ 마침표 — 자연스러운 쉼 |
| `AND,, OR,, NOT` | 1개 합쳐짐 | ❌ 쉼표 2개 이상          |
| `AND.. OR.. NOT` | 1개 합쳐짐 | ❌ 마침표 2개             |

**쉼을 넣고 싶을 때**: 마침표(`.`) 1개 사용.

```
[AND,(발음:AND.)] [OR,(발음:OR.)] and NOT.
→ 자막: AND, OR, and NOT.  /  TTS: AND. OR. and NOT.
```

## Emma (영어) — 코드 기호 발음

| 텍스트               | Emma 발음             | 해결                                    |
| -------------------- | --------------------- | --------------------------------------- |
| `!true`              | "true" (! 무시)       | `[!true(발음:not true)]`                |
| `!false`             | "false" (! 무시)      | `[!false(발음:not false)]`              |
| `!=`                 | 불안정                | `[!=(발음:not equal)]`                  |
| `&&`                 | "and and" 또는 무시   | `[&&(발음:and)]`                        |
| `\|\|`               | 무시 또는 이상한 발음 | `[\|\|(발음:or)]`                       |
| `System.out.println` | 부자연스러운 분절     | `[System.out.println(발음:print line)]` |

## Hyunsu (한국어) — 고유 버그

Hyunsu는 영어 단어/기호를 한국어식으로 잘못 읽는다.

| 텍스트   | Hyunsu 발음      | 해결                         |
| -------- | ---------------- | ---------------------------- |
| `OR`                 | "오얼"                | `[OR(발음:오어)]`                             |
| `!은`                | "나슨"                | `[!(발음:느낌표)]` 또는 우회                  |
| `!true`              | "true" (! 무시)       | `[!true(발음:낫 트루)]`                       |
| `!false`             | "false" (! 무시)      | `[!false(발음:낫 폴스)]`                      |
| `!=`                 | 불안정                | `[!=(발음:낫 이퀄)]`                          |
| `&&`                 | 무시 또는 이상한 발음 | `[&&(발음:앤드)]`                             |
| `\|\|`               | 무시 또는 이상한 발음 | `[\|\|(발음:오어)]`                           |
| `System.out.println` | 부자연스러운 분절     | `[System.out.println(발음:프린트 라인)]`      |

**원칙: 코드 기호가 나레이션에 포함되면 반드시 인라인 발음을 확인한다.**

---

# 에피소드 제작 레시피

## 파일 구조

```
{id}-1-{ComponentName}.tsx   — 메인 컴포지션
{id}-2-content.ts            — 나레이션/콘텐츠 데이터 (satisfies EpisodeContent)
{id}-3-audio.gen.ts          — AUTO-GENERATED (pnpm sync)
{id}-4-sub.gen.ts            — AUTO-GENERATED (SRT)
```

## 에피소드 골격 (씬 순서)

```
1. ThumbnailScene     — 30프레임, 정지 화면, 오디오 없음
2. [PainScene]        — (선택) 기존 방식의 고통
3. IntroScene         — 주제 소개 + 핵심 키워드
4. DetailScene ×N     — 개념 설명 (2~5개)
5. SummaryScene       — 핵심 정리 카드
6. [ComparisonScene]  — (선택) Before/After 비교
7. [RealExampleScene] — (선택) 실전 예시
```

## content.ts 작성법

```ts
export const CONTENT = {
  thumbnail: { seriesLabel: "JAVA", title: "Java\n배열", badge: "배열" },
  intro: { narration: ["첫 번째 문장.", "두 번째 문장."] },
} satisfies EpisodeContent;
```

- `satisfies EpisodeContent` 사용 (`as const` 금지).

## 메인 컴포지션 파일 구조

### VIDEO_CONFIG

```tsx
export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 30 },
  intro: {
    audio: "prefix-intro.mp3",
    durationInFrames: AUDIO_CONFIG.intro.durationInFrames,
    speechStartFrame: AUDIO_CONFIG.intro.speechStartFrame,
    narration: CONTENT.intro.narration as string[],
    narrationSplits: AUDIO_CONFIG.intro.narrationSplits,
  },
};
```

### sceneList → fromValues → totalDuration

```tsx
const sceneList = [VIDEO_CONFIG.thumbnail, VIDEO_CONFIG.intro, ...];
let _from = 0;
const fromValues = sceneList.map((s, i) => {
  const f = _from;
  _from += s.durationInFrames - (i < sceneList.length - 1 ? CROSS : 0);
  return f;
});
const totalDuration = _from;
```

### 일반 씬 골격

```tsx
const SomeScene: React.FC = () => {
  const { someScene: cfg } = VIDEO_CONFIG;
  const d = cfg.durationInFrames;
  const opacity = useFade(d);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea>
          <Audio src={staticFile(cfg.audio)} />
          {/* 비주얼 */}
        </ContentArea>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG.someScene.wordStartFrames}
      />
    </>
  );
};
```

## 애니메이션 패턴

### Spring 설정 표준

| 용도        | damping | stiffness | durationInFrames |
| ----------- | ------- | --------- | ---------------- |
| 일반 등장   | 12~14   | 130~140   | 24~30            |
| 빠른 등장   | 14      | 200       | 18               |
| 느슨한 등장 | 10~11   | 90~120    | 30~35            |
| 카드 등장   | 12~13   | 130~140   | 24~26            |

### Scale 보간

```tsx
const scale = interpolate(appear, [0, 1], [0.8, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### 타이핑 애니메이션

```tsx
const charsVisible = Math.floor(
  (Math.max(0, frame - startFrame) / fps) * charsPerSec,
);
const visibleText = fullText.slice(0, charsVisible);
```

## 비주얼 스타일

### 코드 블록

```tsx
{ background: BG_CODE, borderRadius: 12, padding: "20px 32px", ...monoStyle }
```

### 폰트 스케일 (FONT 상수)

```ts
FONT.label; // 26px — 라벨, 뱃지
FONT.heading; // 32px — 소제목
FONT.title; // 44px — 큰 제목
FONT.display; // 56px — 핵심 키워드
```

### 코드 구문 색상 (colors.ts)

| 요소                           | 상수         | 색상                   |
| ------------------------------ | ------------ | ---------------------- |
| 키워드 (void, for, if, return) | `C_KEYWORD`  | #569cd6                |
| 자료형 (int, double, String)   | `C_TYPE`     | #4e9cd5                |
| 문자열                         | `C_STRING`   | #ce9178                |
| 숫자                           | `C_NUMBER`   | #b5cea8                |
| 함수 이름                      | `C_FUNC`     | #dcdcaa                |
| 변수 이름                      | `C_VAR`      | #9cdcfe                |
| 주석                           | `C_COMMENT`  | #6a9955                |
| 비교/조건 연산자               | `C_PURPLE`   | #c586c0                |
| 논리 연산자                    | `C_AMBER`    | #e5c07b                |
| 산술 연산자                    | `C_OPERATOR` | #d4834e                |
| 강조 (teal)                    | `C_TEAL`     | #4ec9b0                |
| 고통/경고                      | `C_PAIN`     | #f47c7c                |
| 흐릿한 텍스트                  | `C_DIM`      | rgba(255,255,255,0.22) |
| 기본 텍스트                    | `TEXT`       | #d4d4d4                |

### 콘텐츠 배치

`ContentArea` 안에서 `position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%)`.

## 크로스페이드 전환

- CROSS = 20프레임.
- CROSS 만큼 콘텐츠 시작을 딜레이하지 않는다.

## 오디오 파일 prefix 컨벤션

| 에피소드           | prefix   |
| ------------------ | -------- |
| 001-JavaVariables  | `var-`   |
| 002-JavaDataTypes  | `dt-`    |
| 003-JavaOperators  | `op-`    |
| 004-JavaComparison | `cmp-`   |
| 005-JavaLogical    | `log-`   |
| 006-JavaIf         | `if-`    |
| 007-JavaSwitch     | `sw-`    |
| 008-JavaWhile      | `while-` |
| 009-JavaFor        | `for-`   |
| 010-JavaFunction   | `fn-`    |
| 011-JavaParameter  | `param-` |

## AUDIO_CONFIG 참조

```ts
AUDIO_CONFIG.{sceneKey} = {
  durationInFrames, narrationSplits, sentenceEndFrames,
  speechStartFrame, speechEndFrame,
  wordStartFrames: number[][],  // [문장][단어]
  wordEndFrames: number[][],
  wordTiming: Record<string, number[]>,  // 단어→프레임 매핑
}
```

---

# 프로젝트 구조 & 워크플로우

## 디렉토리

```
src/
  global.config.ts              — 전역 설정 (VOICE, RATE, SCENE_TAIL_FRAMES)
  index.ts                      — Remotion 엔트리포인트
  Root.tsx                      — 컴포지션 자동 등록 + Folder 그룹핑
  utils/
    narration.ts                — toDisplayText / toTTSText
    scene.tsx                   — monoStyle, FONT, useFade, Subtitle 등
    srt.ts                      — SRT_DATA 생성 유틸
  types/episode.ts              — EpisodeContent 타입
  compositions/
    001-Java-Basic/{KOR,ENG}/
      {id}-1-{Name}.tsx         — 메인 컴포지션
      {id}-2-content.ts         — 나레이션/콘텐츠 데이터
      {id}-3-audio.gen.ts       — AUTO-GENERATED
      {id}-4-sub.gen.ts         — AUTO-GENERATED (SRT)
      colors.ts / config.ts     — 시리즈 공유 설정
scripts/
  sync.ts / sync-all.ts        — TTS 생성 + audio config
  render.ts                     — 렌더링
  new.ts                        — 에피소드 스캐폴딩
```

## 워크플로우

나레이션·발음 변경 시 **즉시** sync. 묻지 않는다.

```bash
pnpm sync 001-Java-Basic/KOR/001
pnpm sync:all
```

## 핵심 상수

```ts
CHARS_PER_SEC = 10; // 타이핑 속도 — scene.tsx
CROSS = 20; // 크로스페이드 — scene.tsx
SCENE_TAIL_FRAMES = 15; // 오디오 후 여유 — global.config.ts
```

## 공유 유틸 import

```ts
import {
  CHARS_PER_SEC,
  CROSS,
  ContentArea,
  FONT,
  MONO_NO_LIGA,
  Subtitle,
  monoFont,
  monoStyle,
  uiFont,
  useFade,
} from "../../utils/scene";
```

## 렌더링

```bash
pnpm dev                           # Studio 미리보기
pnpm render 001-Java-Basic/KOR/001 # 렌더링
```

## 새 에피소드 추가

```bash
pnpm new 001-Java-Basic/KOR/011 --title "JavaArray" --prefix arr
```

## 주의

- 새 씬 추가 시 `sceneList` 배열도 업데이트
- 해시 파일: `.{시리즈}-{lang}-{id}-audio-hashes.json`
- 강제 재생성: 해시 파일 삭제 후 `pnpm sync:all`
- 실험 브랜치: `feat/karaoke-subtitles`

## 금지 사항 체크리스트

- [ ] CSS `transition` / `animation` 사용
- [ ] `100dvw` 사용
- [ ] `monoFont`에 `MONO_NO_LIGA` 누락
- [ ] `as const` 사용 (→ `satisfies EpisodeContent`)
- [ ] 자막에 긴 코드 구문
- [ ] 하드코딩 타이밍 오프셋
- [ ] 조건부 렌더링으로 요소 등장
- [ ] 마지막 씬에 fadeOut
- [ ] `AbsoluteFill`에 `background: BG` 누락
- [ ] `Subtitle`이 opacity wrapper 안쪽
- [ ] 연산자 양옆 공백 누락
- [ ] FONT 하드코딩
- [ ] 요약 씬에서 기존 줄 비활성화
- [ ] 빈 화면
- [ ] 퇴장에 spring 사용
