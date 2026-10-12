"use client";

import { DIFFICULTIES, DIFFICULTY_INFO, GRADES, TERM_LABEL, TERM_ZH, getUnit, gradeLabel } from "@/lib/curriculum";
import type { Difficulty } from "@/lib/types";

export type Setup = {
  grade: number;
  term: 1 | 2;
  unitIndex: number;
  difficulty: Difficulty;
};

export default function PracticeSetup({
  value,
  onChange,
  showUnit = true,
  compact = false,
}: {
  value: Setup;
  onChange: (next: Setup) => void;
  showUnit?: boolean;
  compact?: boolean;
}) {
  const unit = getUnit(value.grade, value.term, value.unitIndex);

  return (
    <div className="space-y-4">
      {/* grade */}
      <div>
        <div className="font-black text-sm mb-2 opacity-80">Grade 年級</div>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => onChange({ ...value, grade: g, unitIndex: 1 })}
              className={`chip px-3 py-1.5 text-sm ${value.grade === g ? "chip-active" : ""}`}
            >
              P{g}
            </button>
          ))}
        </div>
      </div>

      {/* term */}
      <div>
        <div className="font-black text-sm mb-2 opacity-80">Term 學期</div>
        <div className="flex flex-wrap gap-2">
          {([1, 2] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...value, term: t, unitIndex: 1 })}
              className={`chip px-3 py-1.5 text-sm ${value.term === t ? "chip-active" : ""}`}
            >
              <span>{TERM_LABEL[t].replace(" (Term " + t + ")", "")}</span>
              <span className="font-cn ml-1 text-xs opacity-80">{TERM_ZH[t]}</span>
            </button>
          ))}
        </div>
        {!compact && (
          <p className="text-[11px] opacity-70 mt-2">
            {gradeLabel(value.grade)} · {TERM_LABEL[value.term]} — {unit.textbook}
          </p>
        )}
      </div>

      {/* unit */}
      {showUnit && (
        <div>
          <div className="font-black text-sm mb-2 opacity-80">Unit 單元</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => onChange({ ...value, unitIndex: i })}
                className={`chip px-3 py-1.5 text-sm ${value.unitIndex === i ? "chip-active" : ""}`}
              >
                Unit {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* difficulty */}
      <div>
        <div className="font-black text-sm mb-2 opacity-80">Difficulty 難度</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => {
            const info = DIFFICULTY_INFO.find((x) => x.id === d)!;
            const active = value.difficulty === d;
            return (
              <button
                key={d}
                onClick={() => onChange({ ...value, difficulty: d })}
                className={`rounded-2xl px-3 py-2 text-left border transition ${
                  active
                    ? "text-white border-transparent"
                    : "border-white/50 bg-white/30 hover:bg-white/45"
                }`}
                style={active ? { background: "var(--accent)" } : undefined}
              >
                <div className="font-black text-sm capitalize">{d}</div>
                <div className="text-[10px] opacity-80 leading-tight">{info.blurb}</div>
                {!compact && (
                  <div className="text-[11px] mt-1">
                    {"★".repeat(info.stars)}
                    <span className="opacity-40">{"★".repeat(5 - info.stars)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
