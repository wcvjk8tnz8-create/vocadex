import {
  CURRICULUM,
  difficultyConfig,
  expandWords,
  wordsOfScope,
} from "./curriculum";
import type { Difficulty, Question, Unit, Word } from "./types";

/* ------------------------------------------------------------------ */
/*  Random helpers                                                     */
/* ------------------------------------------------------------------ */

/** Deterministic 32-bit hash so "Daily" sets stay stable for a whole day. */
export function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todaySeed(salt = "") {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${salt}`;
  return hashString(key);
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], rnd: () => number, n: number): T[] {
  return shuffle(arr, rnd).slice(0, n);
}

/* ------------------------------------------------------------------ */
/*  Distractors                                                        */
/* ------------------------------------------------------------------ */

function distractorsFor(target: Word, unit: Unit, rnd: () => number, n: number) {
  const scope = wordsOfScope(unit.grade, unit.term).filter(
    (w) => w.en.toLowerCase() !== target.en.toLowerCase()
  );
  const nearby = scope.length >= n ? scope : CURRICULUM.flatMap(expandWords);
  const pool = nearby.filter(
    (w) => w.en.toLowerCase() !== target.en.toLowerCase()
  );
  // prefer distractors of similar length on harder difficulties
  const sorted = [...pool].sort(
    (a, b) =>
      Math.abs(a.en.length - target.en.length) -
      Math.abs(b.en.length - target.en.length)
  );
  const shortlist = sorted.slice(0, Math.max(n * 3, n + 3));
  return pick(shortlist, rnd, n).map((w) => w.en);
}

function zhDistractors(target: Word, unit: Unit, rnd: () => number, n: number) {
  const scope = wordsOfScope(unit.grade, unit.term).filter(
    (w) => w.en.toLowerCase() !== target.en.toLowerCase()
  );
  const pool = (scope.length >= n ? scope : CURRICULUM.flatMap(expandWords))
    .filter((w) => w.en.toLowerCase() !== target.en.toLowerCase())
    .map((w) => w.zh);
  return pick(pool, rnd, n);
}

/* ------------------------------------------------------------------ */
/*  Builders — one per exercise type                                   */
/* ------------------------------------------------------------------ */

function vocabChoice(
  unit: Unit,
  rnd: () => number,
  opts: number,
  zhPrompt: boolean,
  hint: boolean
): Question {
  const words = expandWords(unit);
  const target = pick(words, rnd, 1)[0];
  const n = Math.max(2, Math.min(opts, 6)) - 1;
  if (zhPrompt) {
    const options = shuffle(
      [target.en, ...distractorsFor(target, unit, rnd, n)],
      rnd
    );
    return {
      kind: "choice",
      prompt: target.zh,
      options,
      answer: options.indexOf(target.en),
      hint: hint ? `${target.en.slice(0, 1).toUpperCase()}… (${target.en.length} letters)` : undefined,
      zh: target.en,
    };
  }
  const options = shuffle(
    [target.zh, ...zhDistractors(target, unit, rnd, n)],
    rnd
  );
  return {
    kind: "choice",
    prompt: target.en,
    options,
    answer: options.indexOf(target.zh),
    hint: hint ? `${target.en.length} letters: ${target.en.slice(0, 1)}…` : undefined,
    zh: target.zh,
  };
}

function guessChoice(
  unit: Unit,
  rnd: () => number,
  opts: number,
  hint: boolean
): Question {
  const words = expandWords(unit);
  const target = pick(words, rnd, 1)[0];
  const n = Math.max(2, Math.min(opts, 6)) - 1;
  const options = shuffle(
    [target.en, ...distractorsFor(target, unit, rnd, n)],
    rnd
  );
  return {
    kind: "choice",
    art: target.en,
    prompt: "Look at the picture. What is it?",
    options,
    answer: options.indexOf(target.en),
    hint: hint ? target.zh : undefined,
  };
}

function sentenceOf(unit: Unit, rnd: () => number) {
  const source =
    unit.sentences.length > 0
      ? unit.sentences
      : unit.passage.split(/(?<=[.!?])\s+/);
  return pick(source, rnd, 1)[0].replace(/[.?!]$/, "");
}

function reorderQuestion(unit: Unit, rnd: () => number): Question {
  const sentence = sentenceOf(unit, rnd);
  const tokens = sentence.split(" ").filter(Boolean);
  return {
    kind: "reorder",
    prompt: "Put the words in the correct order.",
    tokens: shuffle(tokens, rnd),
    answer: sentence,
    zh: unit.titleZh,
  };
}

function fillQuestion(
  unit: Unit,
  rnd: () => number,
  withOptions: boolean
): Question {
  const sentence = sentenceOf(unit, rnd);
  const words = expandWords(unit)
    .map((w) => w.en)
    .filter((w) => {
      const lower = sentence.toLowerCase();
      const bare = w.replace(/\(.*?\)/g, "").trim();
      return lower.includes(bare.toLowerCase());
    });
  const target =
    words.length > 0 ? pick(words, rnd, 1)[0] : pick(sentence.split(" "), rnd, 1)[0];
  const bare = target.replace(/\(.*?\)/g, "").trim();
  const masked = sentence.replace(
    new RegExp(bare.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    "________"
  );
  const base: Question = {
    kind: "fill",
    prompt: masked,
    answer: bare,
    hint: `${bare.length} letters, starts with "${bare.slice(0, 1).toUpperCase()}"`,
  };
  if (withOptions) {
    const fake = distractorsFor(
      { en: bare, zh: "" },
      unit,
      rnd,
      Math.min(3, expandWords(unit).length - 1)
    );
    const options = shuffle([bare, ...fake], rnd);
    return { ...base, options };
  }
  return base;
}

function linkQuestion(unit: Unit, rnd: () => number, n: number): Question {
  const words = pick(expandWords(unit), rnd, Math.min(n, 6));
  const left = shuffle(words, rnd).map((w) => w.en);
  const right = shuffle(words, rnd).map((w) => w.zh);
  return {
    kind: "link",
    prompt: "Match the English word with its Chinese meaning.",
    pairs: left.map((en, i) => ({
      en,
      zh: expandWords(unit).find((w) => w.en === en)?.zh ?? right[i],
    })),
  };
}

function readQuestion(unit: Unit, rnd: () => number, opts: number): Question {
  const q = pick(unit.questions, rnd, 1)[0];
  const options = [...q.options];
  const answer = q.answer;
  if (opts < options.length) {
    // keep the correct answer, trim the rest
    const correct = options[answer];
    const others = options.filter((_, i) => i !== answer);
    const trimmed = shuffle([correct, ...pick(others, rnd, opts - 1)], rnd);
    return {
      kind: "read",
      prompt: unit.title,
      passage: unit.passage,
      q: q.q,
      options: trimmed,
      answer: trimmed.indexOf(correct),
    };
  }
  return {
    kind: "read",
    prompt: unit.title,
    passage: unit.passage,
    q: q.q,
    options,
    answer,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export type BuildOptions = {
  unit: Unit;
  difficulty: Difficulty;
  seed?: number;
};

export function buildNewWords({ unit, difficulty }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(hashString(unit.id + difficulty));
  const words = expandWords(unit);
  const learn = words.slice(0, Math.min(words.length, Math.max(6, cfg.count - 2)));
  const learnQuestions: Question[] = learn.map((w) => ({
    kind: "choice",
    prompt: w.en,
    options: shuffle(
      [
        w.zh,
        ...zhDistractors(w, unit, rnd, Math.max(2, Math.min(cfg.options, 4) - 1)),
      ],
      rnd
    ).map((x) => x),
    answer: 0,
    zh: w.zh,
  }));
  // fix answers after shuffling
  const fixed = learnQuestions.map((q) => {
    if (q.kind !== "choice") return q;
    const options = shuffle(q.options, rnd);
    return { ...q, options, answer: options.indexOf(q.zh ?? q.options[0]) };
  });
  const quiz = Array.from({ length: Math.max(4, cfg.count - learn.length) }, () =>
    vocabChoice(unit, rnd, cfg.options, false, cfg.hint)
  );
  return [...fixed, ...quiz];
}

export function buildDaily({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? todaySeed(unit.id + difficulty));
  const out: Question[] = [];
  for (let i = 0; i < cfg.count; i++) {
    const roll = rnd();
    if (roll < 0.34) out.push(vocabChoice(unit, rnd, cfg.options, false, cfg.hint));
    else if (roll < 0.5) out.push(guessChoice(unit, rnd, cfg.options, cfg.hint));
    else if (roll < 0.68)
      out.push(vocabChoice(unit, rnd, cfg.options, true, cfg.hint));
    else if (roll < 0.82) out.push(readQuestion(unit, rnd, cfg.options));
    else out.push(fillQuestion(unit, rnd, difficulty === "easy" || difficulty === "medium"));
  }
  return out;
}

export function buildGuess({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  return Array.from({ length: cfg.count }, () =>
    guessChoice(unit, rnd, cfg.options, cfg.hint)
  );
}

export function buildReorganize({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const count = Math.max(4, Math.round(cfg.count * 0.7));
  return Array.from({ length: count }, () => reorderQuestion(unit, rnd));
}

export function buildLink({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const rounds = Math.max(2, Math.round(cfg.count / 5));
  return Array.from({ length: rounds }, () =>
    linkQuestion(unit, rnd, difficulty === "easy" ? 4 : 6)
  );
}

export function buildRead({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const count = Math.max(3, Math.round(cfg.count * 0.6));
  const qs = unit.questions ?? [];
  return Array.from({ length: count }, (_, i) => {
    const base = qs[i % qs.length];
    const options = [...base.options];
    const answer = base.answer;
    return {
      kind: "read",
      prompt: unit.title,
      passage: unit.passage,
      q: base.q,
      options,
      answer,
    } as Question;
  });
}

export function buildFill({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  return Array.from({ length: cfg.count }, () =>
    fillQuestion(unit, rnd, difficulty === "easy" || difficulty === "medium")
  );
}

/** Unit assessment — a mix of every skill, 20 questions by default. */
export function buildUnitTest({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const total = Math.max(cfg.count, 16);
  const out: Question[] = [];
  for (let i = 0; i < total; i++) {
    switch (i % 7) {
      case 0:
        out.push(vocabChoice(unit, rnd, cfg.options, false, cfg.hint));
        break;
      case 1:
        out.push(vocabChoice(unit, rnd, cfg.options, true, cfg.hint));
        break;
      case 2:
        out.push(guessChoice(unit, rnd, cfg.options, cfg.hint));
        break;
      case 3:
        out.push(reorderQuestion(unit, rnd));
        break;
      case 4:
        out.push(fillQuestion(unit, rnd, difficulty === "easy"));
        break;
      case 5:
        out.push(readQuestion(unit, rnd, cfg.options));
        break;
      default:
        out.push(linkQuestion(unit, rnd, 5));
        break;
    }
  }
  return out;
}
