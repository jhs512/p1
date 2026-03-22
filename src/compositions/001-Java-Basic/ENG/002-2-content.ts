import type { EpisodeContent } from "../../../types/episode";

export const CONTENT = {
  thumbnail: {
    seriesLabel: "JAVA",
    title: "Java\nData Types",
    badge: "int · double · String · boolean",
  },
  intro: {
    narration: [
      "A data type means the shape of data.",
      "It decides what kind of value\na variable is allowed to store.",
      "Let's look at four common Java data types.",
    ],
  },
  valueVsVar: {
    narration: [
      "First, let's separate a value from a variable.",
      "An integer value is the data itself,\nlike the number twenty-five.",
      "An integer variable is the named space\nthat stores that value.",
    ],
  },
  intScene: {
    narration: [
      "The integer type represents whole numbers.",
      "An integer variable can store only numbers\nwithout a decimal point.",
      "Use it for things like age or count.",
    ],
  },
  doubleScene: {
    narration: [
      "The double type represents decimal numbers.",
      "A double variable stores values\nthat include a fractional part.",
      "Use it when you need precise values,\nlike height or weight.",
    ],
  },
  stringScene: {
    narration: [
      "String represents text.",
      "A String variable stores text data.",
      "Technically it is a reference type,\nbut we can skip that for now.",
      "Use it for things like names or messages.",
    ],
  },
  booleanScene: {
    narration: [
      "Boolean represents true or false.",
      "A boolean variable can hold\nonly true or false.",
      "Use it for the result of a condition check.",
    ],
  },
  summaryScene: {
    narration: [
      "Here is a code summary of the four data types.",
      "Choosing the right data type for the situation matters.",
    ],
  },
} satisfies EpisodeContent;
