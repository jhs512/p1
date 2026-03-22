// src/compositions/001-Java-Basic/ENG/009-2-content.ts
import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\nLoops",
    badge: "for",
  },
  overview: {
    narration: [
      "There are several kinds of loops.",
      "This time, let's look at the for loop.",
    ],
  },
  intro: {
    narration: [
      "A for loop puts the initializer,\ncondition, and update in one line.",
      "It keeps running the block\nwhile the condition is true.",
    ],
  },
  forScene: {
    narration: [
      "The initializer sets up the loop variable,\nand then the condition is checked.",
      "After the block runs,\nthe update changes the variable.",
    ],
  },
  executionScene: {
    narration: [
      "When i is zero, the condition is true,\nso the block runs.",
      "When i is one, the condition is still true.",
      "When i is two, the condition is still true.",
      "When i is three, the condition is still true.",
      "When i is four,\nthis is the last time the condition is true.",
      "When i becomes five, the condition is false,\nso the loop ends.",
    ],
  },
  summaryScene: {
    narration: [
      "A for loop controls repetition with\nan initializer, a condition, and an update.",
      "It is a good fit when the number of repetitions is known.",
    ],
    cards: ["Initializer", "Condition", "Update"],
  },
} satisfies EpisodeContent;
