"use client";

import { useEffect, useState } from "react";
import {
  ENERGY_COST_PER_QUESTION,
  ENERGY_MAX,
  ENERGY_REFILL,
  REFILL_PERIOD_MS,
  useApp,
} from "@/lib/store";

function countdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function EnergiesPage() {
  const { energy, state, nextRefillAt } = useApp();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const msToNext =
    energy >= ENERGY_MAX || !nextRefillAt ? 0 : Math.max(0, nextRefillAt - now);

  const pct = Math.round((energy / ENERGY_MAX) * 100);
  const R = 68;
  const C = 2 * Math.PI * R;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <section className="glass rounded-[28px] p-6">
        <h1 className="text-3xl font-black">Energies</h1>
        <p className="font-cn opacity-80">能量 · 每題扣 2 點，每 12 小時補充 50 點</p>

        <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center mt-6">
          <div className="relative grid place-items-center">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="18" />
              <circle
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - (C * pct) / 100}
                transform="rotate(-90 90 90)"
                style={{ transition: "stroke-dashoffset .6s ease" }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-4xl font-black leading-none">{energy}</div>
              <div className="text-xs font-bold opacity-70">/ {ENERGY_MAX}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-soft rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wide opacity-70">
                Next refill 下次補充
              </div>
              <div className="text-3xl font-black tabular-nums mt-1">
                {energy >= ENERGY_MAX ? "FULL 已滿" : countdown(msToNext)}
              </div>
              <div className="text-xs opacity-80 mt-1">
                {energy >= ENERGY_MAX
                  ? "Your energy tank is full. Keep learning!"
                  : `+${ENERGY_REFILL} energy every 12 hours`}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Rule label="Max energy 上限" value={`${ENERGY_MAX}`} />
              <Rule label="Per question 每題" value={`-${ENERGY_COST_PER_QUESTION}`} />
              <Rule label="Refill 補充" value={`+${ENERGY_REFILL} / 12h`} />
            </div>
          </div>
        </div>
      </section>

      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-3">Recent activity 最近記錄</h2>
        {state.history.length === 0 ? (
          <p className="opacity-80 text-sm">
            No practice yet. Go to <b>Home</b> and start a Daily Exercise!
          </p>
        ) : (
          <div className="space-y-2">
            {state.history.slice(0, 12).map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 glass-soft rounded-2xl px-4 py-2.5"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">
                    {h.kind.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} ·{" "}
                    {h.unitId}
                  </div>
                  <div className="text-[11px] opacity-70">
                    {new Date(h.at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black">
                    {h.score}/{h.total}
                  </div>
                  <div className="text-[11px] opacity-70">
                    {Math.round((h.score / h.total) * 100)}% · -
                    {h.total * ENERGY_COST_PER_QUESTION} energy
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-[11px] opacity-70 font-cn">
        版權歸 PLKSHS 所屬 · Vocadex · P.L.K. Siu Hon Sum Primary School
      </p>
    </div>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft rounded-2xl p-3 text-center">
      <div className="text-lg font-black">{value}</div>
      <div className="text-[10px] font-bold opacity-70 leading-tight">{label}</div>
    </div>
  );
}
