// src/compositions/002-Java-Class/KOR/youtube.ts
// YouTube 메타데이터 설정 — 002-Java-Class 시리즈 (KOR)

export const YOUTUBE_CONFIG = {
  playlist: {
    title: "자바 클래스와 객체",
    description: "자바의 클래스와 객체를 처음부터 배우는 시리즈입니다.",
  },
  defaults: {
    tags: ["java", "자바", "프로그래밍", "코딩", "클래스", "객체", "자바기초"],
    categoryId: "27", // Education
    privacyStatus: "public" as const,
    language: "ko",
  },
  episodes: {
    "001": {
      title: "Java 객체 — 데이터를 묶는 이유 #Java #자바기초",
      description:
        "관련 데이터를 묶어서 관리하는 이유를 알아보고, 객체 개념을 소개합니다.",
    },
    "002": {
      title: "Java 프로세스와 메모리 — 힙과 스택 #Java #자바기초",
      description:
        "프로그램이 실행되면 프로세스가 생성되고, 변수는 메모리의 힙과 스택에 저장됩니다.",
    },
    "003": {
      title: "Java 배열 객체 — 개별 변수 vs 배열 #Java #자바기초",
      description:
        "개별 변수로 데이터를 관리하는 불편함을 배열 객체로 해결하는 방법을 알아봅니다.",
    },
  },
} as const;

export type EpisodeKey = keyof typeof YOUTUBE_CONFIG.episodes;
