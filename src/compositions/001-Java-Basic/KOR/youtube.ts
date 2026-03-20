// src/compositions/001-Java-Basic/KOR/youtube.ts
// YouTube 메타데이터 설정 — 001-Java-Basic 시리즈 (KOR)

export const YOUTUBE_CONFIG = {
  playlist: {
    title: "자바 기초 프로그래밍",
    description: "자바 기초 문법을 처음부터 배우는 시리즈입니다.",
  },
  defaults: {
    tags: ["java", "자바", "프로그래밍", "코딩", "기초", "자바기초"],
    categoryId: "27", // Education
    privacyStatus: "private" as const,
    language: "ko",
  },
  episodes: {
    "001": {
      title: "Java 변수 — 선언, 초기화, 출력 #Java #자바기초",
      description:
        "자바에서 변수를 선언하고 초기화하는 방법, 그리고 화면에 출력하는 방법을 배웁니다.",
    },
    "002": {
      title: "Java 자료형 — 기본 타입 완전 정복 #Java #자바기초",
      description:
        "자바의 기본 자료형(int, double, boolean, char 등)을 종류별로 알아봅니다.",
    },
    "003": {
      title: "Java 산술 연산자 — 더하기, 빼기, 곱하기, 나누기 #Java #자바기초",
      description:
        "자바에서 사용하는 산술 연산자의 종류와 사용법을 예제와 함께 배웁니다.",
    },
    "004": {
      title: "Java 비교 연산자 — 크다, 작다, 같다 #Java #자바기초",
      description:
        "자바의 비교 연산자를 활용해 두 값을 비교하는 방법을 배웁니다.",
    },
    "005": {
      title: "Java 논리 연산자 — AND, OR, NOT #Java #자바기초",
      description:
        "자바에서 조건을 결합하는 논리 연산자(&&, ||, !)의 개념과 사용법을 배웁니다.",
    },
    "006": {
      title: "Java 조건문 — if / else if / else #Java #자바기초",
      description:
        "자바의 if 조건문으로 상황에 따라 다른 코드를 실행하는 방법을 배웁니다.",
    },
    "007": {
      title: "Java switch 문 — 다중 분기 처리 #Java #자바기초",
      description:
        "자바의 switch 문을 활용해 여러 경우의 수를 깔끔하게 처리하는 방법을 배웁니다.",
    },
    "008": {
      title: "Java 반복문 — while 문 완전 정복 #Java #자바기초",
      description:
        "자바의 while 반복문으로 조건이 참인 동안 코드를 반복 실행하는 방법을 배웁니다.",
    },
    "009": {
      title: "Java 반복문 — for 문 완전 정복 #Java #자바기초",
      description:
        "자바의 for 반복문으로 초기식, 조건식, 증감식을 한 줄에 작성하는 방법을 배웁니다.",
    },
    "010": {
      title: "Java 함수 — 선언과 호출 #Java #자바기초",
      description:
        "자바에서 함수를 선언하고 호출하는 방법, 코드 반복을 줄이는 방법을 배웁니다.",
    },
  },
} as const;

export type EpisodeKey = keyof typeof YOUTUBE_CONFIG.episodes;
