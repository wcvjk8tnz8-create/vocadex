export type Word = {
  en: string;
  zh: string;
};

export type ReadingQuestion = {
  q: string;
  options: string[];
  answer: number;
};

export type Unit = {
  id: string;
  grade: number;
  term: 1 | 2;
  index: number;
  title: string;
  titleZh: string;
  topic: string;
  grammar: string;
  textbook: string;
  /** stored as "english|中文" */
  words: string[];
  sentences: string[];
  passage: string;
  questions: ReadingQuestion[];
};

export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "extremely hard"
  | "impossible";

export type ExerciseKind =
  | "daily"
  | "new-words"
  | "guess"
  | "reorganize"
  | "link"
  | "read"
  | "fill"
  | "unit";

export type Question =
  | {
      kind: "choice";
      prompt: string;
      hint?: string;
      /** for guess-the-word: illustration key */
      art?: string;
      options: string[];
      answer: number;
      zh?: string;
    }
  | {
      kind: "reorder";
      prompt: string;
      hint?: string;
      tokens: string[];
      answer: string;
      zh?: string;
    }
  | {
      kind: "link";
      prompt: string;
      pairs: { en: string; zh: string }[];
    }
  | {
      kind: "fill";
      prompt: string;
      hint?: string;
      answer: string;
      options?: string[];
      zh?: string;
    }
  | {
      kind: "read";
      prompt: string;
      passage: string;
      q: string;
      options: string[];
      answer: number;
    };
