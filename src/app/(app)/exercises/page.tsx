"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PracticeSetup, { type Setup } from "@/components/PracticeSetup";
import { difficultyConfig, getUnit } from "@/lib/curriculum";
import { ENERGY_COST_PER_QUESTION, useApp } from "@/lib/store";

type Item = {
  slug: string;
  title: string;
  zh: string;
  desc: string;
  badge?: string;
};

const ITEMS: Item[] = [
  {
    slug: "daily",
    title: "Daily Exercises",
    zh: "每日練習",
    desc: "A random mix of every skill — vocabulary, pictures, reading and blanks.",
  },
  {
    slug: "new-words",
    title: "Daily New Words",
    zh: "每日新詞",
    desc: "Learn the unit vocabulary first, then answer a short quiz.",
  },
  {
    slug: "guess",
    title: "Guess The Words",
    zh: "看圖猜詞語",
    desc: "Look at the picture and choose the correct English word.",
  },
  {
    slug: "reorganize",
    title: "Reorganize Sentences",
    zh: "重組句子",
    desc: "Put the words back in the right order to make a sentence.",
  },
  {
    slug: "link",
    title: "Link The Words",
    zh: "中英文配對",
    desc: "Match the English word on the left with its Chinese meaning on the right.",
  },
  {
    slug: "read",
    title: "Read To Answer",
    zh: "閱讀理解",
    desc: "Read a short passage and answer the questions.",
  },
  {
    slug: "fill",
    title: "Fill In The Blank",
    zh: "填空題",
    desc: "Type or choose the missing word in the sentence.",
  },
  {
    slug: "unit",
    title: "Unit Exercises",
    zh: "單元評估",
    desc: "The full unit test. Score 90% or more to level up and win a mystery gift!",
    badge: "90% = Mystery Gift",
  },
];

export default function ExercisesPage() {
  const router = useRouter();
  const { state, updateProfile, energy } = useApp();
  const profile = state.profile!;
  const [setup, setSetup] = useState<Setup>({
    grade: profile.grade,
    term: profile.term,
    unitIndex: profile.unitIndex,
    difficulty: profile.difficulty,
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    updateProfile({
      grade: setup.grade,
      term: setup.term,
      unitIndex: setup.unitIndex,
      difficulty: setup.difficulty,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup]);

  const unit = getUnit(setup.grade, setup.term, setup.unitIndex);
  const cfg = difficultyConfig(setup.difficulty);

  function start(slug: string) {
    const count =
      slug === "unit"
        ? Math.max(cfg.count, 16)
        : slug === "reorganize"
        ? Math.max(4, Math.round(cfg.count * 0.7))
        : slug === "read"
        ? Math.max(3, Math.round(cfg.count * 0.6))
        : slug === "link"
        ? Math.max(2, Math.round(cfg.count / 5))
        : cfg.count;
    // Energy is spent one question at a time while playing — you only need
    // enough for the first question to begin.
    void count;
    if (energy < ENERGY_COST_PER_QUESTION) {
      setNotice(
        `Out of energy! You need ${ENERGY_COST_PER_QUESTION} energy to start. (+50 every 12 hours)`
      );
      return;
    }
    const q = `g=${setup.grade}&t=${setup.term}&u=${setup.unitIndex}&d=${encodeURIComponent(
      setup.difficulty
    )}`;
    router.push(`/play/${slug}?${q}`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <section className="glass rounded-[28px] p-6">
        <h1 className="text-3xl font-black">Exercises</h1>
        <p className="font-cn opacity-80">練習 · 全部題目均按教育局課程主題生成</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="chip px-3 py-1">{unit.title}</span>
          <span className="chip px-3 py-1 font-cn">{unit.titleZh}</span>
          <span className="chip px-3 py-1">{unit.textbook}</span>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ITEMS.map((item) => {
          const record = state.records[unit.id];
          return (
            <button
              key={item.slug}
              onClick={() => start(item.slug)}
              className="glass rounded-3xl p-5 text-left hover:brightness-[1.03] transition flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black text-lg leading-tight">{item.title}</div>
                  <div className="font-cn text-sm opacity-80">{item.zh}</div>
                </div>
              </div>
              <p className="text-xs opacity-80 mt-2 flex-1">{item.desc}</p>
              {item.badge && (
                <span
                  className="mt-3 inline-block self-start rounded-full px-3 py-1 text-[11px] font-black text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {item.badge}
                </span>
              )}
              {item.slug === "unit" && record?.done && (
                <span className="mt-2 text-[11px] font-black">✅ Passed · best {record.best}%</span>
              )}
              <span className="mt-3 text-[11px] font-black opacity-70">
                {energy} energy available
              </span>
            </button>
          );
        })}
      </div>

      {notice && (
        <p className="text-sm font-bold text-red-700 bg-white/70 rounded-2xl p-4">{notice}</p>
      )}

      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-4">
          Choose your level 選擇年級、學期與難度
        </h2>
        <PracticeSetup value={setup} onChange={setSetup} />
      </section>
    </div>
  );
}
