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
      "That creates a named space\nthat can hold an integer value.",
      "We will talk about the exact type name later.",
      "For now, think of a variable as\na named space for data.",
    ],
  },
  initialization: {
    title: "2. Variable Initialization",
    narration: [
      "Initialization means giving a declared variable\nits first value.",
      "In this example, the variable now stores twenty-five.",
    ],
  },
  interpret: {
    narration: [
      "A variable can be interpreted in two ways.",
      "When you declare it or assign into it,\nit is treated like storage space.",
      "In other places, it is treated like the value it holds.",
    ],
  },
  interpretQuiz: {
    narration: [
      "In the first position,\nshould this variable be read as space,\nor as a value?",
    ],
  },
  interpretReveal: {
    narration: [
      "The answer is space.",
      "That position is on the left side,\nwhere a value is being assigned.",
      "The variable on the right side means the stored value.\nHere, that value is four.",
    ],
  },
  print: {
    title: "3. Printing a Variable",
    narration: [
      "Now let's print the value on the screen.",
      "When you use the print method,\nthe value inside the variable appears in the console.",
      "When you run it, you can see twenty-five in the output.",
    ],
  },
} satisfies EpisodeContent;
