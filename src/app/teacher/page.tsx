"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import { gradeLabel } from "@/lib/curriculum";
import { useApp } from "@/lib/store";

type CloudGift = {
  id: string;
  name: string;
  email: string;
  grade: number;
  unitId: string;
  unitTitle: string;
  score: number;
  difficulty: string;
  at: number;
  status: "pending" | "given";
};

export default function TeacherPage() {
  const { state, markGift } = useApp();
  const [filter, setFilter] = useState<"pending" | "given" | "all">("pending");
  const [key, setKey] = useState("");
  const [cloud, setCloud] = useState<CloudGift[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setKey(window.localStorage.getItem("vocadex.teacherKey") || "");
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/gifts?key=${encodeURIComponent(key)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Wrong teacher key" : "Request failed");
      const data = (await res.json()) as { gifts?: CloudGift[] };
      setCloud(data.gifts ?? []);
      if (key) window.localStorage.setItem("vocadex.teacherKey", key);
    } catch (e) {
      setCloud(null);
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (key) void load();
  }, [key, load]);

  /* cloud list is merged with the local offline list so nothing is lost */
  const gifts = useMemo(() => {
    const cloudList: CloudGift[] = cloud ?? [];
    const known = new Set(cloudList.map((g) => g.id));
    const localList: CloudGift[] = state.gifts
      .filter((g) => !known.has(g.id))
      .map((g) => ({
        id: g.id,
        name: g.name,
        email: g.email,
        grade: g.grade,
        unitId: g.unitId,
        unitTitle: g.unitTitle,
        score: g.score,
        difficulty: g.difficulty,
        at: g.at,
        status: g.status,
      }));
    const all = [...cloudList, ...localList].sort((a, b) => b.at - a.at);
    if (filter === "all") return all;
    return all.filter((g) => g.status === filter);
  }, [cloud, state.gifts, filter]);

  const pendingCount = (cloud ?? state.gifts).filter((g) => g.status === "pending").length;
  const givenCount = (cloud ?? state.gifts).filter((g) => g.status === "given").length;

  async function toggle(g: CloudGift) {
    const next = g.status === "pending" ? "given" : "pending";
    markGift(g.id, next);
    try {
      await fetch("/api/gifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id, status: next, key }),
      });
    } catch {
      /* offline — the local change still applies */
    }
    setCloud((c) => (c ? c.map((x) => (x.id === g.id ? { ...x, status: next } : x)) : c));
  }

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Grade", "Unit", "Score", "Difficulty", "Date", "Status"],
      ...gifts.map((g) => [
        g.name,
        g.email,
        gradeLabel(g.grade),
        g.unitTitle,
        `${g.score}%`,
        g.difficulty,
        new Date(g.at).toLocaleString(),
        g.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vocadex-gifts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-photo bg-wash px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <section className="glass rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Teacher Dashboard</h1>
              <p className="font-cn opacity-80">
                教師後台 · 神秘禮物名單（單元評估達 90 分或以上）
              </p>
            </div>
            <Link href="/" className="btn-ghost px-5 py-2.5 text-sm">
              ← Student login
            </Link>
          </div>

          <div className="glass-soft rounded-2xl p-4 mt-5 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-black uppercase tracking-wide opacity-70 mb-1">
                Teacher key 教師密碼
              </label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="teacher key"
                className="w-full rounded-2xl px-4 py-2.5 bg-white/60 border border-white/70 outline-none font-bold"
              />
            </div>
            <button onClick={load} className="btn-duo px-5 py-2.5" disabled={loading}>
              {loading ? "Loading…" : "Load from cloud"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm font-bold text-red-700 bg-white/70 rounded-xl p-3">
              {error} — showing the records saved on this device instead.
            </p>
          )}

          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            <Stat label="Waiting 待派發" value={pendingCount} />
            <Stat label="Given 已派發" value={givenCount} />
            <Stat label="Total 總數" value={pendingCount + givenCount} />
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {(["pending", "given", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`chip px-4 py-1.5 text-sm capitalize ${filter === f ? "chip-active" : ""}`}
              >
                {f}
              </button>
            ))}
            <button onClick={exportCsv} className="btn-duo px-4 py-1.5 text-sm ml-auto">
              Export CSV
            </button>
          </div>
        </section>

        <section className="glass rounded-[28px] p-6">
          {gifts.length === 0 ? (
            <p className="opacity-80">
              No records yet. When a student scores 90% or above in a Unit Exercise, the
              request is uploaded to the cloud and appears here automatically.
            </p>
          ) : (
            <div className="space-y-3">
              {gifts.map((g) => (
                <div
                  key={g.id}
                  className="glass-soft rounded-2xl p-4 flex flex-wrap items-center gap-4"
                >
                  <Avatar id="hero" size={52} />
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-black">{g.name}</div>
                    <div className="text-xs opacity-75">{g.email}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {gradeLabel(g.grade)} · {g.unitTitle} ·{" "}
                      <span className="capitalize">{g.difficulty}</span>
                    </div>
                    <div className="text-[11px] opacity-60 mt-1">
                      {new Date(g.at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{g.score}%</div>
                    <div
                      className={`text-xs font-black uppercase ${
                        g.status === "pending" ? "text-red-700" : "text-green-800"
                      }`}
                    >
                      {g.status}
                    </div>
                  </div>
                  <button onClick={() => toggle(g)} className="btn-duo px-4 py-2 text-sm">
                    {g.status === "pending" ? "Mark as given" : "Undo"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-[11px] opacity-70 font-cn pb-6">
          版權歸 PLKSHS 所屬 · © PLKSHS · Vocadex · P.L.K. Siu Hon Sum Primary School
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-soft rounded-2xl p-4 text-center">
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs font-bold opacity-70">{label}</div>
    </div>
  );
}
