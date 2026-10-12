import {
  CURRICULUM,
  difficultyConfig,
  expandWords,
  wordsOfScope,
} from "./curriculum";
import { hasArt } from "@/components/WordArt";
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

/**
 * A shuffled bag that hands out every item once before repeating, so a
 * practice set never asks the same word (or sentence) twice in a row.
 */
function bag<T>(items: T[], rnd: () => number): () => T {
  const source = items.length > 0 ? items : [undefined as unknown as T];
  let pool = shuffle(source, rnd);
  return () => {
    if (pool.length === 0) pool = shuffle(source, rnd);
    return pool.pop() as T;
  };
}

/* ------------------------------------------------------------------ */
/*  Distractors                                                        */
/* ------------------------------------------------------------------ */

function distractorsFor(target: Word, unit: Unit, rnd: () => number, n: number) {
  const scope = wordsOfScope(unit.grade, unit.term).filter(
    (w) => w.en.toLowerCase() !== target.en.toLowerCase()
  );
  const nearby = scope.length >= n ? scope : CURRICULUM.flatMap(expandWords);
  const pool = nearby.filter((w) => w.en.toLowerCase() !== target.en.toLowerCase());
  // prefer distractors of similar length on harder difficulties
  const sorted = [...pool].sort(
    (a, b) =>
      Math.abs(a.en.length - target.en.length) -
      Math.abs(b.en.length - target.en.length)
  );
  const shortlist = sorted.slice(0, Math.max(n * 3, n + 3));
  const out = new Set<string>();
  for (const w of pick(shortlist, rnd, n)) out.add(w.en);
  return [...out];
}

function zhDistractors(target: Word, unit: Unit, rnd: () => number, n: number) {
  const scope = wordsOfScope(unit.grade, unit.term).filter(
    (w) => w.en.toLowerCase() !== target.en.toLowerCase()
  );
  const pool = (scope.length >= n ? scope : CURRICULUM.flatMap(expandWords))
    .filter((w) => w.en.toLowerCase() !== target.en.toLowerCase())
    .map((w) => w.zh);
  const out = new Set<string>();
  for (const z of pick(pool, rnd, n)) out.add(z);
  return [...out];
}

/* ------------------------------------------------------------------ */
/*  Builders — one per exercise type                                   */
/* ------------------------------------------------------------------ */

function vocabChoice(
  unit: Unit,
  rnd: () => number,
  opts: number,
  zhPrompt: boolean,
  hint: boolean,
  target: Word
): Question {
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
      hint: hint
        ? `${target.en.slice(0, 1).toUpperCase()}… (${target.en.length} letters)`
        : undefined,
      zh: target.en,
    };
  }
  const options = shuffle([target.zh, ...zhDistractors(target, unit, rnd, n)], rnd);
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
  hint: boolean,
  target: Word
): Question {
  const n = Math.max(2, Math.min(opts, 6)) - 1;
  const options = shuffle([target.en, ...distractorsFor(target, unit, rnd, n)], rnd);
  return {
    kind: "choice",
    art: target.en,
    prompt: "Look at the picture. What is it?",
    options,
    answer: options.indexOf(target.en),
    hint: hint ? target.zh : undefined,
  };
}

function sentencesOf(unit: Unit): string[] {
  return unit.sentences.length > 0
    ? unit.sentences
    : unit.passage.split(/(?<=[.!?])\s+/);
}

function reorderQuestion(sentence: string, unit: Unit, rnd: () => number): Question {
  const tokens = sentence.replace(/[.?!]$/, "").split(" ").filter(Boolean);
  return {
    kind: "reorder",
    prompt: "Put the words in the correct order.",
    tokens: shuffle(tokens, rnd),
    answer: sentence.replace(/[.?!]$/, ""),
    zh: unit.titleZh,
  };
}

function fillQuestion(
  unit: Unit,
  rnd: () => number,
  withOptions: boolean,
  sentence: string
): Question {
  const clean = sentence.replace(/[.?!]$/, "");
  const words = expandWords(unit)
    .map((w) => w.en)
    .filter((w) => {
      const lower = clean.toLowerCase();
      const bare = w.replace(/\(.*?\)/g, "").trim();
      return lower.includes(bare.toLowerCase());
    });
  const target =
    words.length > 0 ? pick(words, rnd, 1)[0] : pick(clean.split(" "), rnd, 1)[0];
  const bare = target.replace(/\(.*?\)/g, "").trim();
  const masked = clean.replace(
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
      Math.min(3, Math.max(1, expandWords(unit).length - 1))
    );
    const options = shuffle([bare, ...fake], rnd);
    return { ...base, options };
  }
  return base;
}

function linkQuestion(unit: Unit, rnd: () => number, n: number): Question {
  const words = pick(expandWords(unit), rnd, Math.min(n, 6));
  return {
    kind: "link",
    prompt: "Match the English word with its Chinese meaning.",
    pairs: shuffle(words, rnd).map((w) => ({ en: w.en, zh: w.zh })),
  };
}

function readQuestion(unit: Unit, rnd: () => number, opts: number, base: Unit["questions"][number]): Question {
  const options = [...base.options];
  const answer = base.answer;
  if (opts >= options.length) {
    return {
      kind: "read",
      prompt: unit.title,
      passage: unit.passage,
      q: base.q,
      options,
      answer,
    };
  }
  const correct = options[answer];
  const others = options.filter((_, i) => i !== answer);
  const trimmed = shuffle([correct, ...pick(others, rnd, opts - 1)], rnd);
  return {
    kind: "read",
    prompt: unit.title,
    passage: unit.passage,
    q: base.q,
    options: trimmed,
    answer: trimmed.indexOf(correct),
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

/** Words that have a hand-drawn picture, used by "Guess The Words". */
function artWords(unit: Unit): Word[] {
  const words = expandWords(unit);
  const withArt = words.filter((w) => hasArt(w.en));
  return withArt.length >= 4 ? withArt : words;
}

export function buildNewWords({ unit, difficulty }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(hashString(unit.id + difficulty));
  const words = expandWords(unit);
  const learn = words.slice(0, Math.min(words.length, Math.max(6, cfg.count - 2)));
  const learnQuestions: Question[] = learn.map((w) => ({
    kind: "choice",
    prompt: w.en,
    options: shuffle(
      [w.zh, ...zhDistractors(w, unit, rnd, Math.max(2, Math.min(cfg.options, 4) - 1))],
      rnd
    ),
    answer: 0,
    zh: w.zh,
  }));
  // fix answers after shuffling
  const fixed = learnQuestions.map((q) => {
    if (q.kind !== "choice") return q;
    const options = shuffle(q.options, rnd);
    return { ...q, options, answer: options.indexOf(q.zh ?? q.options[0]) };
  });
  const rest = bag(words, rnd);
  const quiz = Array.from({ length: Math.max(4, cfg.count - learn.length) }, () =>
    vocabChoice(unit, rnd, cfg.options, false, cfg.hint, rest())
  );
  return [...fixed, ...quiz];
}

export function buildDaily({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? todaySeed(unit.id + difficulty));
  const words = expandWords(unit);
  const nextWord = bag(words, rnd);
  const nextArtWord = bag(artWords(unit), rnd);
  const nextSentence = bag(sentencesOf(unit), rnd);
  const nextRead = bag(unit.questions, rnd);
  const out: Question[] = [];
  for (let i = 0; i < cfg.count; i++) {
    const roll = rnd();
    if (roll < 0.34) out.push(vocabChoice(unit, rnd, cfg.options, false, cfg.hint, nextWord()));
    else if (roll < 0.5) out.push(guessChoice(unit, rnd, cfg.options, cfg.hint, nextArtWord()));
    else if (roll < 0.68)
      out.push(vocabChoice(unit, rnd, cfg.options, true, cfg.hint, nextWord()));
    else if (roll < 0.82) out.push(readQuestion(unit, rnd, cfg.options, nextRead()));
    else out.push(fillQuestion(unit, rnd, difficulty === "easy" || difficulty === "medium", nextSentence()));
  }
  return out;
}

export function buildGuess({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const next = bag(artWords(unit), rnd);
  return Array.from({ length: cfg.count }, () =>
    guessChoice(unit, rnd, cfg.options, cfg.hint, next())
  );
}

export function buildReorganize({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const next = bag(sentencesOf(unit), rnd);
  const count = Math.max(4, Math.round(cfg.count * 0.7));
  return Array.from({ length: count }, () => reorderQuestion(next(), unit, rnd));
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
  const qs = unit.questions ?? [];
  const count = Math.max(3, Math.round(cfg.count * 0.6));
  const next = bag(qs, rnd);
  return Array.from({ length: Math.min(count, Math.max(qs.length, 1)) }, () =>
    readQuestion(unit, rnd, cfg.options, next())
  );
}

export function buildFill({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const next = bag(sentencesOf(unit), rnd);
  return Array.from({ length: cfg.count }, () =>
    fillQuestion(unit, rnd, difficulty === "easy" || difficulty === "medium", next())
  );
}

/** Unit assessment — a mix of every skill, 20 questions by default. */
export function buildUnitTest({ unit, difficulty, seed }: BuildOptions): Question[] {
  const cfg = difficultyConfig(difficulty);
  const rnd = mulberry32(seed ?? Date.now());
  const total = Math.max(cfg.count, 16);
  const nextWord = bag(expandWords(unit), rnd);
  const nextArtWord = bag(artWords(unit), rnd);
  const nextSentence = bag(sentencesOf(unit), rnd);
  const nextRead = bag(unit.questions, rnd);
  const out: Question[] = [];
  for (let i = 0; i < total; i++) {
    switch (i % 7) {
      case 0:
        out.push(vocabChoice(unit, rnd, cfg.options, false, cfg.hint, nextWord()));
        break;
      case 1:
        out.push(vocabChoice(unit, rnd, cfg.options, true, cfg.hint, nextWord()));
        break;
      case 2:
        out.push(guessChoice(unit, rnd, cfg.options, cfg.hint, nextArtWord()));
        break;
      case 3:
        out.push(reorderQuestion(nextSentence(), unit, rnd));
        break;
      case 4:
        out.push(fillQuestion(unit, rnd, difficulty === "easy", nextSentence()));
        break;
      case 5:
        out.push(readQuestion(unit, rnd, cfg.options, nextRead()));
        break;
      default:
        out.push(linkQuestion(unit, rnd, 5));
        break;
    }
  }
  return out;
}

