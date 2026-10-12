import { LOWER_UNITS } from "./data/lower-primary";
import { UPPER_UNITS } from "./data/upper-primary";
import type { Difficulty, Unit, Word } from "./types";

export const CURRICULUM: Unit[] = [...LOWER_UNITS, ...UPPER_UNITS];

export const GRADES = [1, 2, 3, 4, 5, 6] as const;

export const DIFFICULTIES: Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "extremely hard",
  "impossible",
];

export const TERM_LABEL: Record<1 | 2, string> = {
  1: "First Term (Term 1)",
  2: "Second Term (Term 2)",
};

export const TERM_ZH: Record<1 | 2, string> = {
  1: "上學期",
  2: "下學期",
};

export function gradeLabel(grade: number) {
  return `Primary ${grade}`;
}

export function gradeLabelZh(grade: number) {
  return `小學${["一", "二", "三", "四", "五", "六"][grade - 1]}年級`;
}

export function unitsOf(grade: number, term: 1 | 2): Unit[] {
  return CURRICULUM.filter((u) => u.grade === grade && u.term === term).sort(
    (a, b) => a.index - b.index
  );
}

export function unitById(id: string): Unit | undefined {
  return CURRICULUM.find((u) => u.id === id);
}

export function getUnit(grade: number, term: 1 | 2, index: number): Unit {
  const found = CURRICULUM.find(
    (u) => u.grade === grade && u.term === term && u.index === index
  );
  return found ?? CURRICULUM[0];
}

/** The unit that follows the given one (rolls into the next term / grade). */
export function nextUnit(unit: Unit): Unit | null {
  const sameTerm = unitsOf(unit.grade, unit.term);
  if (unit.index < sameTerm.length) {
    return getUnit(unit.grade, unit.term, unit.index + 1);
  }
  if (unit.term === 1) {
    const next = unitsOf(unit.grade, 2);
    return next[0] ?? null;
  }
  if (unit.grade < 6) {
    const next = unitsOf(unit.grade + 1, 1);
    return next[0] ?? null;
  }
  return null;
}

export function unitLabel(unit: Unit) {
  return `Unit ${unit.index} — ${unit.title}`;
}

export function expandWords(unit: Unit): Word[] {
  return unit.words.map((raw) => {
    const [en, zh] = raw.split("|");
    return { en, zh: zh ?? "" };
  });
}

/** Every word of a grade/term, used to build distractors. */
export function wordsOfScope(grade: number, term: 1 | 2): Word[] {
  return unitsOf(grade, term).flatMap(expandWords);
}

export function difficultyConfig(d: Difficulty) {
  switch (d) {
    case "easy":
      return { count: 8, options: 3, hint: true, zhPrompt: false, time: 0 };
    case "medium":
      return { count: 10, options: 4, hint: true, zhPrompt: false, time: 0 };
    case "hard":
      return { count: 12, options: 4, hint: false, zhPrompt: true, time: 0 };
    case "extremely hard":
      return { count: 15, options: 5, hint: false, zhPrompt: true, time: 25 };
    default:
      return { count: 20, options: 6, hint: false, zhPrompt: true, time: 15 };
  }
}

export const DIFFICULTY_INFO: {
  id: Difficulty;
  blurb: string;
  stars: number;
}[] = [
  { id: "easy", blurb: "Warm up. Pictures, hints and short questions.", stars: 1 },
  { id: "medium", blurb: "A little harder. Four choices per question.", stars: 2 },
  { id: "hard", blurb: "Chinese prompts, no hints. Think carefully.", stars: 3 },
  {
    id: "extremely hard",
    blurb: "Five choices, 25 seconds per question. Stay sharp!",
    stars: 4,
  },
  {
    id: "impossible",
    blurb: "Six tricky choices, 15 seconds. Only for champions.",
    stars: 5,
  },
];
