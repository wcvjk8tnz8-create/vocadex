"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WordArt } from "@/components/WordArt";
import {
  difficultyConfig,
  getUnit,
  gradeLabel,
  nextUnit,
  TERM_LABEL,
} from "@/lib/curriculum";
import {
  buildDaily,
  buildFill,
  buildGuess,
  buildLink,
  buildNewWords,
  buildRead,
  buildReorganize,
  buildUnitTest,
} from "@/lib/exercises";
import { ENERGY_COST_PER_QUESTION, useApp } from "@/lib/store";
import type { Difficulty, Question } from "@/lib/types";

const TITLES: Record<string, { en: string; zh: string }> = {
  daily: { en: "Daily Exercises", zh: "每日練習" },
  "new-words": { en: "Daily New Words", zh: "每日新詞" },
  guess: { en: "Guess The Words", zh: "看圖猜詞語" },
  reorganize: { en: "Reorganize Sentences", zh: "重組句子" },
  link: { en: "Link The Words", zh: "中英文配對" },
  read: { en: "Read To Answer", zh: "閱讀理解" },
  fill: { en: "Fill In The Blank", zh: "填空題" },
  unit: { en: "Unit Exercises", zh: "單元評估" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black">Loading…</div>}>
      <PlayInner />
    </Suspense>
  );
}

function PlayInner() {
  const params = useParams<{ kind: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { state, saveResult, energy, spendEnergy } = useApp();

  const kind = params.kind ?? "daily";
  const grade = Number(search.get("g") ?? state.profile?.grade ?? 4);
  const term = (Number(search.get("t") ?? 1) === 2 ? 2 : 1) as 1 | 2;
  const unitIndex = Number(search.get("u") ?? 1);
  const difficulty = (search.get("d") ?? "medium") as Difficulty;

  const unit = useMemo(() => getUnit(grade, term, unitIndex), [grade, term, unitIndex]);
  const cfg = difficultyConfig(difficulty);

  const questions = useMemo<Question[]>(() => {
    const opts = { unit, difficulty };
    switch (kind) {
      case "new-words":
        return buildNewWords(opts);
      case "guess":
        return buildGuess(opts);
      case "reorganize":
        return buildReorganize(opts);
      case "link":
        return buildLink(opts);
      case "read":
        return buildRead(opts);
      case "fill":
        return buildFill(opts);
      case "unit":
        return buildUnitTest(opts);
      default:
        return buildDaily(opts);
    }
  }, [kind, unit, difficulty]);

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(cfg.time);
  const savedRef = useRef(false);

  const q = questions[index];

  /* per-question timer for the two hardest levels */
  useEffect(() => {
    if (cfg.time <= 0 || done) return;
    setTimeLeft(cfg.time);
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [index, cfg.time, done]);

  useEffect(() => {
    if (cfg.time > 0 && timeLeft === 0 && !checked && !done) {
      setCorrect(false);
      setChecked(true);
      setResults((r) => [...r, false]);
      spendEnergy(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, cfg.time, checked, done]);

  const finish = useCallback(() => {
    setDone(true);
  }, []);

  const next = () => {
    if (index + 1 >= questions.length) {
      finish();
      return;
    }
    setIndex(index + 1);
    setChecked(false);
    setCorrect(null);
  };

  /* ------------------------------------------------------------------ */
  /*  per-type answer state                                              */
  /* ------------------------------------------------------------------ */
  const [choice, setChoice] = useState<number | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [fillText, setFillText] = useState("");

  useEffect(() => {
    setChoice(null);
    setFillText("");
    setLinks({});
    setLeftPick(null);
    if (q?.kind === "reorder") {
      setPool(q.tokens);
      setOrder([]);
    }
  }, [index, q]);

  const score = results.filter(Boolean).length;
  const total = questions.length;
  const percent = total ? Math.round((score / total) * 100) : 0;

  /* save once when finished */
  useEffect(() => {
    if (!done || savedRef.current) return;
    savedRef.current = true;
    saveResult({
      unitId: unit.id,
      kind,
      score,
      total,
      difficulty,
      isUnitTest: kind === "unit",
    });
  }, [done, saveResult, unit.id, kind, score, total, difficulty]);

  if (done) {
    const passed = kind === "unit" && percent >= 90;
    const nxt = nextUnit(unit);
    return (
      <ResultScreen
        percent={percent}
        score={score}
        total={total}
        passed={passed}
        kind={kind}
        unitTitle={`Unit ${unit.index} — ${unit.title}`}
        nextUnitTitle={nxt ? `Unit ${nxt.index} — ${nxt.title} (P${nxt.grade} ${TERM_LABEL[nxt.term].split(" ")[0]})` : null}
        onRetry={() => router.push(`/play/${kind}?g=${grade}&t=${term}&u=${unitIndex}&d=${difficulty}`)}
        onHome={() => router.push("/home")}
        onExercises={() => router.push("/exercises")}
      />
    );
  }

  if (!q) {
    return (
      <div className="max-w-2xl mx-auto glass rounded-3xl p-8 text-center">
        <p className="font-black text-xl mb-4">No questions available.</p>
        <button className="btn-duo px-6 py-3" onClick={() => router.push("/exercises")}>
          Back to Exercises
        </button>
      </div>
    );
  }

  /* ------------------------------ checking ------------------------------ */
  function check() {
    let ok = false;
    if (q.kind === "choice" || q.kind === "read") ok = choice === q.answer;
    else if (q.kind === "reorder")
      ok = order.join(" ").toLowerCase().replace(/\s+/g, " ") === q.answer.toLowerCase();
    else if (q.kind === "fill")
      ok = fillText.trim().toLowerCase() === q.answer.trim().toLowerCase();
    else if (q.kind === "link")
      ok = q.pairs.every((p) => links[p.en] === p.zh);
    setCorrect(ok);
    setChecked(true);
    setResults((r) => [...r, ok]);
    // energy is taken one question at a time, right here
    spendEnergy(1);
  }

  const canCheck =
    q.kind === "choice" || q.kind === "read"
      ? choice !== null
      : q.kind === "reorder"
      ? order.length > 0
      : q.kind === "fill"
      ? fillText.trim().length > 0
      : Object.keys(links).length === q.pairs.length;

  const progress = ((index + (checked ? 1 : 0)) / total) * 100;
  const info = TITLES[kind] ?? TITLES.daily;

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* header */}
      <div className="glass rounded-[28px] p-4 mb-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/exercises")}
          className="glass-soft rounded-2xl h-11 w-11 grid place-items-center font-black"
          aria-label="Leave"
        >
          ✕
        </button>
        <div className="flex-1">
          <div className="duo-bar h-4">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-sm font-black whitespace-nowrap">
          {index + 1}/{total}
        </div>
        <div className="text-sm font-black whitespace-nowrap">⚡ {energy}</div>
        {cfg.time > 0 && (
          <div
            className={`text-sm font-black tabular-nums ${timeLeft <= 5 ? "text-red-600" : ""}`}
          >
            ⏱ {timeLeft}s
          </div>
        )}
      </div>

      <div className="text-center mb-3">
        <div className="font-black text-lg leading-tight">{info.en}</div>
        <div className="font-cn text-xs opacity-80">
          {info.zh} · {gradeLabel(grade)} · {TERM_LABEL[term]} · Unit {unit.index} ·{" "}
          <span className="capitalize">{difficulty}</span>
        </div>
      </div>

      {/* ------------------------------ body ------------------------------ */}
      <div className="glass rounded-[28px] p-6">
        {q.kind === "choice" && (
          <div className="text-center">
            {q.art && (
              <div className="flex justify-center mb-4">
                <WordArt word={q.art} size={160} className="rounded-3xl" />
              </div>
            )}
            <div className="text-3xl sm:text-4xl font-black mb-1 break-words">{q.prompt}</div>
            {q.hint && <div className="font-cn text-sm opacity-70 mb-4">{q.hint}</div>}
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {q.options.map((opt, i) => {
                const isAnswer = checked && i === q.answer;
                const isWrong = checked && i === choice && i !== q.answer;
                return (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setChoice(i)}
                    className={`rounded-2xl px-4 py-3 font-bold border-2 transition ${
                      isAnswer
                        ? "bg-[#7fc44c] text-white border-[#5c9c3c]"
                        : isWrong
                        ? "bg-[#e8443f] text-white border-[#b8332f]"
                        : choice === i
                        ? "border-[color:var(--accent)] bg-white/60"
                        : "border-white/60 bg-white/35 hover:bg-white/55"
                    }`}
                  >
                    <span className={/[\u4e00-\u9fa5]/.test(opt) ? "font-cn text-lg" : ""}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {q.kind === "read" && (
          <div>
            <div className="glass-soft rounded-2xl p-4 mb-4 max-h-56 overflow-auto">
              <div className="text-xs font-black opacity-70 mb-1">Read the passage</div>
              <p className="leading-relaxed font-semibold">{q.passage}</p>
            </div>
            <div className="font-black text-xl mb-3">{q.q}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isAnswer = checked && i === q.answer;
                const isWrong = checked && i === choice && i !== q.answer;
                return (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setChoice(i)}
                    className={`rounded-2xl px-4 py-3 font-bold border-2 transition ${
                      isAnswer
                        ? "bg-[#7fc44c] text-white border-[#5c9c3c]"
                        : isWrong
                        ? "bg-[#e8443f] text-white border-[#b8332f]"
                        : choice === i
                        ? "border-[color:var(--accent)] bg-white/60"
                        : "border-white/60 bg-white/35 hover:bg-white/55"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {q.kind === "reorder" && (
          <div>
            <div className="font-black text-xl mb-3">{q.prompt}</div>
            <div className="min-h-[88px] rounded-2xl border-2 border-dashed border-white/70 bg-white/25 p-3 mb-4 flex flex-wrap gap-2">
              {order.length === 0 && (
                <span className="opacity-60 text-sm font-semibold">
                  Tap the words below to build the sentence.
                </span>
              )}
              {order.map((w, i) => (
                <button
                  key={`${w}-${i}`}
                  disabled={checked}
                  onClick={() => {
                    setOrder(order.filter((_, j) => j !== i));
                    setPool([...pool, w]);
                  }}
                  className="rounded-xl px-3 py-2 font-bold"
                  style={{ background: "var(--accent-soft)", border: "2px solid var(--accent)" }}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {pool.map((w, i) => (
                <button
                  key={`${w}-p-${i}`}
                  disabled={checked}
                  onClick={() => {
                    setOrder([...order, w]);
                    setPool(pool.filter((_, j) => j !== i));
                  }}
                  className="rounded-xl px-3 py-2 font-bold bg-white/45 border-2 border-white/70 hover:bg-white/70"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.kind === "fill" && (
          <div>
            <div className="text-2xl font-black mb-4 leading-relaxed">
              {q.prompt.split("________").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span
                      className="inline-block min-w-[92px] border-b-4 mx-1 text-center"
                      style={{ borderColor: "var(--accent)" }}
                    >
                      {fillText || " "}
                    </span>
                  )}
                </span>
              ))}
            </div>
            {q.options ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setFillText(opt)}
                    className={`rounded-2xl px-4 py-3 font-bold border-2 ${
                      fillText === opt
                        ? "border-[color:var(--accent)] bg-white/60"
                        : "border-white/60 bg-white/35"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={fillText}
                disabled={checked}
                onChange={(e) => setFillText(e.target.value)}
                placeholder="Type the missing word"
                className="w-full rounded-2xl px-4 py-3 bg-white/60 border-2 border-white/70 outline-none font-bold text-lg"
              />
            )}
            {q.hint && <p className="mt-3 text-xs font-bold opacity-70">Hint: {q.hint}</p>}
          </div>
        )}

        {q.kind === "link" && (
          <div>
            <div className="font-black text-xl mb-4">{q.prompt}</div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-2">
                {q.pairs.map((p) => {
                  const matched = links[p.en];
                  const selected = leftPick === p.en;
                  return (
                    <button
                      key={p.en}
                      disabled={checked || Boolean(matched)}
                      onClick={() => setLeftPick(p.en)}
                      className={`w-full rounded-2xl px-3 py-2.5 font-black border-2 text-sm ${
                        matched
                          ? "bg-[#7fc44c]/80 text-white border-[#5c9c3c]"
                          : selected
                          ? "border-[color:var(--accent)] bg-white/70"
                          : "border-white/60 bg-white/35"
                      }`}
                    >
                      {p.en}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2">
                {[...q.pairs]
                  .sort((a, b) => a.zh.localeCompare(b.zh))
                  .map((p) => {
                    const used = Object.values(links).includes(p.zh);
                    return (
                      <button
                        key={p.zh}
                        disabled={checked || used}
                        onClick={() => {
                          if (!leftPick) return;
                          setLinks({ ...links, [leftPick]: p.zh });
                          setLeftPick(null);
                        }}
                        className={`w-full rounded-2xl px-3 py-2.5 font-cn font-bold border-2 text-sm ${
                          used
                            ? "bg-[#7fc44c]/80 text-white border-[#5c9c3c]"
                            : leftPick
                            ? "border-[color:var(--accent)] bg-white/60"
                            : "border-white/60 bg-white/35"
                        }`}
                      >
                        {p.zh}
                      </button>
                    );
                  })}
              </div>
            </div>
            {Object.keys(links).length > 0 && (
              <button
                onClick={() => {
                  setLinks({});
                  setLeftPick(null);
                }}
                className="mt-4 text-xs font-black opacity-70 underline"
              >
                Reset pairs
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------- footer bar ---------------------------- */}
      <div className="fixed left-0 right-0 bottom-0 z-40 md:left-[284px]">
        <div
          className={`px-4 py-4 border-t-2 ${
            checked
              ? correct
                ? "bg-[#7fc44c]/95 border-[#5c9c3c]"
                : "bg-[#e8443f]/95 border-[#b8332f]"
              : "bg-white/70 border-white/60"
          }`}
          style={{ backdropFilter: "blur(14px)" }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {checked && (
              <div className="text-white">
                <div className="text-xl font-black">
                  {correct ? "Nice! 做得好！" : "Not quite…"}
                </div>
                {!correct && (
                  <div className="text-sm font-bold opacity-95">
                    Answer:{" "}
                    {q.kind === "choice" || q.kind === "read"
                      ? q.options[q.answer]
                      : q.kind === "reorder"
                      ? q.answer
                      : q.kind === "fill"
                      ? q.answer
                      : q.pairs.map((p) => `${p.en} = ${p.zh}`).join("， ")}
                  </div>
                )}
              </div>
            )}
            {!checked && (
              <div className="text-xs font-bold opacity-70">
                This question costs {ENERGY_COST_PER_QUESTION} energy · you have ⚡ {energy}
              </div>
            )}
            <button
              onClick={checked ? next : check}
              disabled={!checked && !canCheck}
              className={checked ? "btn-duo px-8 py-3" : "btn-duo px-8 py-3"}
            >
              {checked ? (index + 1 >= questions.length ? "See Result" : "Continue") : "Check"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ result screen ------------------------------ */
function ResultScreen({
  percent,
  score,
  total,
  passed,
  kind,
  unitTitle,
  nextUnitTitle,
  onRetry,
  onHome,
  onExercises,
}: {
  percent: number;
  score: number;
  total: number;
  passed: boolean;
  kind: string;
  unitTitle: string;
  nextUnitTitle: string | null;
  onRetry: () => void;
  onHome: () => void;
  onExercises: () => void;
}) {
  const stars = percent >= 90 ? 3 : percent >= 70 ? 2 : percent >= 50 ? 1 : 0;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-[28px] p-8 text-center animate-pop">
        <div className="text-6xl mb-2">{percent >= 90 ? "🏆" : percent >= 50 ? "🌟" : "💪"}</div>
        <h1 className="text-3xl font-black">
          {percent >= 90 ? "Excellent!" : percent >= 50 ? "Good job!" : "Keep trying!"}
        </h1>
        <p className="font-cn opacity-80 mt-1">{unitTitle}</p>

        <div className="text-6xl font-black my-4">{percent}%</div>
        <div className="text-lg font-bold opacity-80 mb-3">
          {score} / {total} correct
        </div>
        <div className="text-3xl mb-5">
          {"★".repeat(stars)}
          <span className="opacity-30">{"★".repeat(3 - stars)}</span>
        </div>

        {kind === "unit" && (
          <div
            className="rounded-3xl p-5 text-white font-bold mb-5"
            style={{ background: passed ? "var(--accent)" : "rgba(90,80,60,.55)" }}
          >
            {passed ? (
              <>
                <div className="text-2xl font-black">🎁 Mystery Gift Unlocked!</div>
                <p className="text-sm mt-2">
                  You scored {percent}% — 90% or above! Your teacher has been notified
                  through the Vocadex dashboard and will give you a real gift.
                </p>
                <p className="font-cn text-sm mt-1">
                  老師已收到通知，神秘禮物將由老師親自派出。
                </p>
                {nextUnitTitle && (
                  <p className="text-sm mt-2">Next unit unlocked：{nextUnitTitle}</p>
                )}
              </>
            ) : (
              <>
                <div className="text-xl font-black">So close!</div>
                <p className="text-sm mt-1">
                  Score 90% or above to level up to the next unit and unlock the mystery
                  gift. Try again!
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-duo px-6 py-3" onClick={onRetry}>
            Try Again
          </button>
          <button className="btn-ghost px-6 py-3" onClick={onExercises}>
            More Exercises
          </button>
          <button className="btn-ghost px-6 py-3" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] opacity-70 mt-4 font-cn">
        版權歸 PLKSHS 所屬 · Vocadex · P.L.K. Siu Hon Sum Primary School
      </p>
    </div>
  );
}
