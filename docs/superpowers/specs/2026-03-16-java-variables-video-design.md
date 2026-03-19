# Java 변수 설명 영상 — 디자인 스펙

## 개요

Remotion을 사용해 Java 변수 개념을 설명하는 교육용 애니메이션 영상을 제작한다.
대상: 완전 입문자 (프로그래밍 자체가 처음인 사람)
스타일: 코드 타이핑 애니메이션 + 설명 텍스트
오디오: 없음 (텍스트 기반 영상)

---

## 영상 스펙

| 항목      | 값                                                                 |
| --------- | ------------------------------------------------------------------ |
| 해상도    | 1280×720 (HD)                                                      |
| FPS       | 30                                                                 |
| 총 길이   | 30초 (900프레임)                                                   |
| 배경      | 다크 테마 (#1e1e1e)                                                |
| 코드 폰트 | JetBrains Mono (`@remotion/google-fonts` 로딩)                     |
| UI 폰트   | Noto Sans KR (`@remotion/google-fonts` 로딩)                       |
| 코드 색상 | 타입: `#4ec9b0`, 변수: `#9cdcfe`, 숫자: `#b5cea8`, 기타: `#d4d4d4` |
| 출력 형식 | mp4, H.264                                                         |

폰트 로딩은 Remotion의 `delayRender` / `continueRender` 패턴 사용.

---

## Composition 등록 (`Root.tsx`)

```tsx
<Composition
  id="JavaVariables"
  component={JavaVariables}
  durationInFrames={900}
  fps={30}
  width={1280}
  height={720}
  defaultProps={{}}
/>
```

`JavaVariables`는 외부 props 없음 (`defaultProps={{}}`).

---

## 씬 구성

| 씬                 | `<Sequence from>` | `durationInFrames` | 길이 |
| ------------------ | ----------------- | ------------------ | ---- |
| 인트로             | 0                 | 60                 | 2초  |
| 씬 1 — 변수 선언   | 60                | 240                | 8초  |
| 씬 2 — 변수 초기화 | 300               | 240                | 8초  |
| 씬 3 — 변수 출력   | 540               | 240                | 8초  |
| 아웃트로           | 780               | 120                | 4초  |

씬 전환은 `<Sequence>` 사용. 씬 전환 페이드(9프레임)는 이전 씬 마지막 9프레임과 다음 씬 처음 9프레임을 `interpolate`로 opacity 처리하며 오버랩. `JavaVariables.tsx`에서 `<AbsoluteFill>` 위에 각 씬을 `<Sequence>`로 배치.

---

## 씬별 상세

### 인트로 (0~60프레임)

- "Java 변수란?" 타이틀 페이드인 (프레임 0~15)
- "변수는 값을 담는 그릇입니다" 부제목 페이드인 (프레임 15~30)
- 나머지 프레임은 정지 유지

### 씬 1 — 변수 선언 (씬 내부 프레임 0~239)

- 상단 제목: "1. 변수 선언 (Declaration)"
- `CodeBox`에 전달되는 lines:
  ```
  [{ text: "int age;", isNew: true }]
  ```
- 타이핑 시작: 씬 내부 프레임 20 (`startFrame=20`)
- 타이핑 완료 후 (`int` 토큰) `#4ec9b0` 색상 즉시 적용
- 하단 설명: "변수를 사용하기 전에 반드시 선언해야 합니다" (타이핑 완료 후 페이드인)
- 타이핑 완료 이후 남은 프레임: 코드+설명 정지 유지 후 씬 종료 전 9프레임 페이드아웃

### 씬 2 — 변수 초기화 (씬 내부 프레임 0~239)

- 상단 제목: "2. 변수 초기화 (Initialization)"
- `CodeBox`에 전달되는 lines:
  ```
  [
    { text: "int age;",   isNew: false },
    { text: "age = 25;",  isNew: true  }
  ]
  ```
- `isNew: false`인 줄은 이미 완성된 상태로 dimmed opacity(0.5)로 표시
- `isNew: true`인 줄만 타이핑 애니메이션 (startFrame=20)
- `25` 토큰: `#b5cea8` 색상 즉시 적용
- 하단 설명: "변수에 처음으로 값을 넣는 것을 초기화라고 합니다"

### 씬 3 — 변수 출력 (씬 내부 프레임 0~239)

- 상단 제목: "3. 변수 출력 (Print)"
- `CodeBox`에 전달되는 lines:
  ```
  [
    { text: "int age;",                    isNew: false },
    { text: "age = 25;",                   isNew: false },
    { text: "System.out.println(age);",    isNew: true  }
  ]
  ```
- 타이핑 완료 후 (`System.out.println(age);` 26자, 10자/초 → 약 78프레임 = 2.6초)
- 타이핑 완료 후 코드 박스 아래에 콘솔 출력 박스 페이드인: `> 25`
  - 콘솔 박스: 별도 `ConsoleOutput` 컴포넌트, 배경 `#0a0a0a`, 텍스트 `#89d185`
- 하단 설명: "println()으로 변수의 값을 출력할 수 있습니다"

### 아웃트로 (씬 내부 프레임 0~119)

- "다음 시간: 자료형 (int, String, boolean)" 페이드인 (프레임 0~20)
- 전체 화면 페이드아웃 (프레임 90~119)

---

## 컴포넌트 구조

```
src/
  Root.tsx
  compositions/
    JavaVariables.tsx      # Composition 루트, <Sequence>로 씬 오케스트레이션
  scenes/
    Intro.tsx
    DeclarationScene.tsx
    InitScene.tsx
    PrintScene.tsx
    Outro.tsx
  components/
    CodeBox.tsx            # 코드 표시 + 타이핑 애니메이션
    ConsoleOutput.tsx      # 콘솔 출력 결과 박스
    SceneTitle.tsx         # 씬 상단 제목
    Caption.tsx            # 씬 하단 설명 텍스트
  hooks/
    useTypingEffect.ts
```

---

## `CodeBox` props 인터페이스

```ts
interface CodeLine {
  text: string;
  isNew: boolean; // true면 타이핑 애니메이션, false면 dimmed 완성 상태
}

interface CodeBoxProps {
  lines: CodeLine[];
  startFrame: number; // 타이핑 시작 프레임 (Sequence 내부 로컬 프레임)
  charsPerSecond?: number; // 기본값 10
}
```

---

## `ConsoleOutput` props 인터페이스

```ts
interface ConsoleOutputProps {
  text: string; // 출력할 텍스트 (예: "> 25")
  startFrame: number; // 페이드인 시작 프레임 (Sequence 로컬 기준)
}
// 배경색 #0a0a0a, 텍스트 색상 #89d185 는 컴포넌트 내부에 고정값으로 정의
```

---

## `useTypingEffect` 훅

```ts
function useTypingEffect(
  text: string,
  startFrame: number, // Sequence 로컬 프레임 기준
  charsPerSecond: number,
): { visibleText: string; isDone: boolean };
```

- `useCurrentFrame()`은 `<Sequence>` 내부에서 자동으로 로컬 프레임 반환
- `startFrame`은 항상 씬 내부 로컬 프레임 기준 (예: `20`)
- **순수 함수**: `useState`/`useEffect` 사용 금지. 프레임 값만으로 결과를 계산
- 구현:
  ```ts
  const frame = useCurrentFrame();
  const charsVisible = Math.floor(
    (Math.max(0, frame - startFrame) / fps) * charsPerSecond,
  );
  const visibleText = text.slice(0, charsVisible);
  const isDone = charsVisible >= text.length;
  ```
- `fps`는 `useVideoConfig().fps`로 가져옴

---

## 기술 스택

- Remotion `>=4.0.180` (`npx create-video@latest` 기본 템플릿)
- TypeScript
- React
- `@remotion/google-fonts` (폰트 로딩)
- `@remotion/eslint-plugin` (비결정적 코드 방지)
