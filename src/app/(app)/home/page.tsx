"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import PracticeSetup, { type Setup } from "@/components/PracticeSetup";
import { difficultyConfig, getUnit, gradeLabel, TERM_LABEL } from "@/lib/curriculum";
import { ENERGY_COST_PER_QUESTION, useApp, ENERGY_MAX } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const { state, updateProfile, spendEnergy, energy } = useApp();
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
  const cost = cfg.count * ENERGY_COST_PER_QUESTION;

  function start(kind: "daily" | "new-words") {
    // Energy is spent one question at a time while playing — you only need
    // enough for the first question to begin.
    if (energy < ENERGY_COST_PER_QUESTION) {
      setNotice(
        `Out of energy! You need ${ENERGY_COST_PER_QUESTION} energy to start. Energy refills +50 every 12 hours — visit Energies.`
      );
      return;
    }
    void cost;
    const q = `g=${setup.grade}&t=${setup.term}&u=${setup.unitIndex}&d=${encodeURIComponent(
      setup.difficulty
    )}`;
    spendEnergy(cfg.count);
    if (kind === "daily") router.push(`/play/daily?${q}`);
    else router.push(`/play/new-words?${q}`);
  }

  const record = state.records[unit.id];
  const pendingGifts = state.gifts.filter((g) => g.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ----------------------------- top row ----------------------------- */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* account */}
        <section className="glass rounded-[28px] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar id={profile.avatar} size={76} ring="rgba(255,255,255,.9)" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight break-words">
                Hello, {profile.name}!
              </h1>
              <p className="font-semibold opacity-80 break-all">{profile.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="chip px-3 py-1 text-xs">{gradeLabel(setup.grade)}</span>
            <span className="chip px-3 py-1 text-xs">{TERM_LABEL[setup.term]}</span>
            <span className="chip px-3 py-1 text-xs">Unit {unit.index}</span>
            <span className="chip px-3 py-1 text-xs capitalize">{setup.difficulty}</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Energy 能量</span>
              <span>
                {energy} / {ENERGY_MAX}
              </span>
            </div>
            <div className="duo-bar h-3">
              <span style={{ width: `${(energy / ENERGY_MAX) * 100}%` }} />
            </div>
          </div>

          <div className="glass-soft rounded-2xl p-4">
            <div className="text-xs font-black opacity-70 uppercase tracking-wide">
              Current unit 當前單元
            </div>
            <div className="font-black text-lg leading-tight mt-1">
              Unit {unit.index} — {unit.title}
            </div>
            <div className="font-cn text-sm opacity-80">{unit.titleZh}</div>
            <div className="text-xs opacity-75 mt-1">{unit.topic} · {unit.grammar}</div>
            {record && (
              <div className="text-xs font-bold mt-2">
                Best score：{record.best}% {record.done && "✅ Passed"}
              </div>
            )}
          </div>

          {pendingGifts > 0 && (
            <div className="rounded-2xl p-4 text-white font-bold" style={{ background: "var(--accent)" }}>
              🎁 You have {pendingGifts} mystery gift{pendingGifts > 1 ? "s" : ""} waiting!
              <span className="block text-xs opacity-90 font-cn">
                老師將會派發神秘禮物，請留意班主任通知。
              </span>
            </div>
          )}
        </section>

        {/* choose exercises */}
        <section className="glass rounded-[28px] p-6">
          <h2 className="text-2xl font-black mb-1">Choose Exercises</h2>
          <p className="text-sm opacity-80 mb-4">
            Pick a quick practice. Questions are generated randomly from the unit
            you selected below.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <ExerciseCard
              title="Daily Exercises"
              zh="每日練習"
              desc="A random mix of vocabulary, pictures, reading and fill-in-the-blanks."
              cost={cost}
              accent
              onClick={() => start("daily")}
            />
            <ExerciseCard
              title="Daily New Words"
              zh="每日新詞"
              desc="Learn the new words of the unit first, then take a short quiz."
              cost={cost}
              onClick={() => start("new-words")}
            />
          </div>

          {notice && (
            <p className="mt-4 text-sm font-bold text-red-700 bg-white/60 rounded-xl p-3">
              {notice}
            </p>
          )}

          <div className="mt-5 glass-soft rounded-2xl p-4">
            <div className="text-xs font-black opacity-70 uppercase tracking-wide mb-2">
              New words in this unit 本單元新詞
            </div>
            <div className="flex flex-wrap gap-2">
              {unit.words.slice(0, 10).map((w) => {
                const [en, zh] = w.split("|");
                return (
                  <span
                    key={en}
                    className="rounded-xl bg-white/60 px-2.5 py-1 text-sm font-bold flex items-center gap-1.5"
                  >
                    {en}
                    <span className="font-cn text-xs opacity-70">{zh}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* --------------------------- setup panel --------------------------- */}
      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-4">
          Before you start — choose your level 選擇程度
        </h2>
        <PracticeSetup value={setup} onChange={setSetup} showUnit={false} />
      </section>
    </div>
  );
}

function ExerciseCard({
  title,
  zh,
  desc,
  cost,
  onClick,
  accent,
}: {
  title: string;
  zh: string;
  desc: string;
  cost: number;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <div className="glass-strong rounded-3xl p-5 flex flex-col">
      <div className="font-black text-lg leading-tight">{title}</div>
      <div className="font-cn text-sm opacity-80">{zh}</div>
      <p className="text-xs opacity-80 mt-2 flex-1">{desc}</p>
      <div className="text-[11px] font-bold opacity-70 mt-3">
        Cost：{cost} energy ({cost / ENERGY_COST_PER_QUESTION} questions × 2)
      </div>
      <button
        onClick={onClick}
        className={`mt-3 py-2.5 rounded-2xl font-black ${
          accent ? "btn-duo" : "btn-ghost"
        }`}
      >
        Start
      </button>
    </div>
  );
}
