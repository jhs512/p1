import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\nVariables",
    badge: "Declare · Initialize · Print",
  },
  intro: {
    narration: [
      "Variables are boxes that hold data.",
      "You can give the box a name,\nput a value inside, and use that value later.",
    ],
  },
  declaration: {
    title: "1. Variable Declaration",
    narration: [
      "Before you can use a variable, you need to declare it.",
      "If you write int age,\nan integer variable called age is created.",
      "We'll learn exactly what int means later.",
      "For now, think of a variable as\na space that can hold data.",
    ],
  },
  initialization: {
    title: "2. Variable Initialization",
    narration: [
      "Initialization means giving a declared variable\nits first value.",
      "The variable age now stores twenty-five.",
    ],
  },
  interpret: {
    narration: [
      "A variable can be read in two different ways.",
      "Only when you declare it or assign a value,\nit is treated as storage space.\nOtherwise, it is treated as its value.",
      "The age here is read as twenty-five.",
    ],
  },
  interpretQuiz: {
    narration: [
      "Should the age on the left\nbe read as storage space, or as a value?",
    ],
  },
  interpretReveal: {
    narration: [
      "The answer is storage space.",
      "Because it's on the left side,\nreceiving a value.",
      "The age on the right should be read as its value.\nThat means four.",
    ],
  },
  print: {
    title: "3. Printing a Variable",
    narration: [
      "Now let's print the value of a variable to the screen.",
      "Using [System.out.println(발음:print line)],\nthe value inside the parentheses is printed to the console.",
      "When you run it, twenty-five is printed.",
    ],
  },
} satisfies EpisodeContent;
