"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import StudentQrCard from "@/components/StudentQrCard";
import { gradeLabel } from "@/lib/curriculum";
import { downloadDataUrl, drawStudentSheet } from "@/lib/qrCard";

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

type StudentRow = {
  email: string;
  name: string;
  grade: number;
  password: string;
  energy: number;
  updatedAt: number;
};

const TOKEN_KEY = "vocadex.teacherToken";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", "x-teacher-token": token };
}

export default function TeacherPage() {
  const [token, setToken] = useState("");
  const [key, setKey] = useState("");
  const [phase, setPhase] = useState<"login" | "dash">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"gifts" | "students" | "qr">("gifts");
  const [filter, setFilter] = useState<"pending" | "given" | "all">("pending");
  const [gifts, setGifts] = useState<CloudGift[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [storage, setStorage] = useState("");
  const [bulk, setBulk] = useState("");
  const [query, setQuery] = useState("");
  const [qrLabel, setQrLabel] = useState("Class 6A");
  const [qrMinutes, setQrMinutes] = useState(30);
  const [qrSvg, setQrSvg] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrExpiry, setQrExpiry] = useState(0);
  const [qrUses, setQrUses] = useState(0);
  const [openQr, setOpenQr] = useState<string>("");
  const [nowTick, setNowTick] = useState(() => Date.now());

  /* --------------------------- session check --------------------------- */
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!saved) return;
    void (async () => {
      try {
        const res = await fetch(`/api/teacher/session?token=${encodeURIComponent(saved)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { ok?: boolean };
        if (res.ok && data.ok) {
          setToken(saved);
          setPhase("dash");
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        /* offline */
      }
    })();
  }, []);

  const load = useCallback(async (t: string) => {
    setBusy(true);
    setError("");
    try {
      const g = await fetch("/api/gifts", { headers: authHeaders(t), cache: "no-store" });
      if (!g.ok) throw new Error("Session expired. Please sign in again.");
      const gd = (await g.json()) as { gifts?: CloudGift[]; storage?: string };
      setGifts(gd.gifts ?? []);
      setStorage(gd.storage ?? "");

      const s = await fetch("/api/students", { headers: authHeaders(t), cache: "no-store" });
      if (s.ok) {
        const sd = (await s.json()) as { students?: StudentRow[] };
        setStudents(sd.students ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setPhase("login");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (phase === "dash" && token) void load(token);
  }, [phase, token, load]);

  useEffect(() => {
    if (!qrExpiry) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [qrExpiry]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = (await res.json()) as { ok?: boolean; token?: string; error?: string };
      if (!res.ok || !data.token) {
        setError(data.error ?? "Wrong teacher key.");
        return;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setKey("");
      setPhase("dash");
    } catch {
      setError("Cannot reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setPhase("login");
    setGifts([]);
    setStudents([]);
  }

  /* ------------------------------- gifts -------------------------------- */
  const shown = useMemo(() => {
    if (filter === "all") return gifts;
    return gifts.filter((g) => g.status === filter);
  }, [gifts, filter]);

  const pendingCount = gifts.filter((g) => g.status === "pending").length;
  const givenCount = gifts.filter((g) => g.status === "given").length;

  async function toggle(g: CloudGift) {
    const next = g.status === "pending" ? "given" : "pending";
    setGifts((prev) => prev.map((x) => (x.id === g.id ? { ...x, status: next } : x)));
    try {
      await fetch("/api/gifts", {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ id: g.id, status: next }),
      });
    } catch {
      /* offline */
    }
  }

  function exportCsv(rows: string[][], filename: string) {
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ------------------------------ QR sign-in ----------------------------- */
  async function makeQr() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login-token", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ label: qrLabel, minutes: qrMinutes }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: { code: string; expiresAt: number };
        qr?: string;
        error?: string;
      };
      if (!res.ok || !data.token) {
        setError(data.error ?? "Could not create the code.");
        return;
      }
      setQrCode(data.token.code);
      setQrExpiry(data.token.expiresAt);
      setQrUses(0);
      setQrSvg(data.qr ?? "");
      setTab("qr");
    } catch {
      setError("Cannot reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function resetAllEnergy() {
    if (!confirm("Give every student 100 energy? 確定要將所有學生的能量重設為 100 嗎？"))
      return;
    setBusy(true);
    try {
      await fetch("/api/students", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ resetAllEnergy: true }),
      });
      await load(token);
    } finally {
      setBusy(false);
    }
  }

  async function downloadAllCards() {
    const withPw = filteredStudents.filter((x) => x.password);
    if (withPw.length === 0) {
      alert("No student has a password yet. Press New on a row first.");
      return;
    }
    setBusy(true);
    try {
      const sheet = await drawStudentSheet(
        withPw.map((x) => ({
          name: x.name || x.email.split("@")[0],
          email: x.email,
          qrSrc: studentQrUrl(x.email),
        }))
      );
      if (sheet) downloadDataUrl(sheet, "vocadex-qr-cards.png");
    } finally {
      setBusy(false);
    }
  }

  async function resetOne(email: string) {
    setBusy(true);
    try {
      await fetch("/api/students", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ resetEnergy: email }),
      });
      await load(token);
    } finally {
      setBusy(false);
    }
  }

  function studentQrUrl(email: string, download = false) {
    return `/api/student-qr?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
      token
    )}${download ? "&download=1" : ""}`;
  }

  async function cancelQr() {
    if (!qrCode) return;
    try {
      await fetch("/api/login-token", {
        method: "DELETE",
        headers: authHeaders(token),
        body: JSON.stringify({ code: qrCode }),
      });
    } catch {
      /* ignore */
    }
    setQrCode("");
    setQrSvg("");
    setQrExpiry(0);
  }

  async function refreshUses() {
    try {
      const res = await fetch("/api/login-token", { headers: authHeaders(token), cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { tokens?: { code: string; uses: number }[] };
      const mine = (data.tokens ?? []).find((t) => t.code === qrCode);
      if (mine) setQrUses(mine.uses);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!qrCode || tab !== "qr") return;
    void refreshUses();
    const t = setInterval(() => void refreshUses(), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, tab]);

  const qrLeft = qrExpiry ? Math.max(0, qrExpiry - nowTick) : 0;

  /* ------------------------------ students ------------------------------ */
  async function addStudents() {
    const emails = bulk
      .split(/[\s,;\n]+/)
      .map((e) => e.trim())
      .filter(Boolean)
      .map((e) => (e.includes("@") ? e : `${e}@plkshs.edu.hk`));
    if (emails.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ emails }),
      });
      const data = (await res.json()) as { students?: StudentRow[] };
      if (data.students) setStudents(data.students);
      setBulk("");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(email: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ reset: email }),
      });
      const data = (await res.json()) as { students?: StudentRow[] };
      if (data.students) setStudents(data.students);
    } finally {
      setBusy(false);
    }
  }

  async function removeStudent(email: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/students", {
        method: "DELETE",
        headers: authHeaders(token),
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { students?: StudentRow[] };
      if (data.students) setStudents(data.students);
    } finally {
      setBusy(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [students, query]);

  /* -------------------------------- view -------------------------------- */
  if (phase === "login") {
    return (
      <div className="min-h-screen bg-photo bg-wash grid place-items-center px-4">
        <div className="glass-strong rounded-[32px] p-7 w-full max-w-md">
          <div className="flex flex-col items-center gap-3 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Vocadex" className="h-16 w-16" />
            <h1 className="text-2xl font-black">Teacher Sign In</h1>
            <p className="font-cn text-sm opacity-80">教師登入 · Vocadex</p>
          </div>
          <form onSubmit={signIn} className="space-y-4">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Teacher key"
              type="password"
              className="w-full rounded-2xl px-4 py-3 bg-white/60 border border-white/70 outline-none font-semibold"
            />
            {error && (
              <p className="text-sm font-bold text-red-700 bg-white/70 rounded-xl p-3">{error}</p>
            )}
            <button className="btn-duo w-full py-3 text-lg" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs opacity-70">
            <Link href="/" className="underline">
              ← Back to student login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-photo bg-wash px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <section className="glass rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Teacher Dashboard</h1>
              <p className="font-cn opacity-80">
                教師後台 · 神秘禮物名單與學生密碼
                {storage ? ` · storage: ${storage}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void load(token)} className="btn-ghost px-4 py-2.5 text-sm">
                Refresh
              </button>
              <button onClick={signOut} className="btn-ghost px-4 py-2.5 text-sm">
                Sign out
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setTab("gifts")}
              className={`chip px-4 py-1.5 text-sm ${tab === "gifts" ? "chip-active" : ""}`}
            >
              Gifts 禮物 ({pendingCount})
            </button>
            <button
              onClick={() => setTab("students")}
              className={`chip px-4 py-1.5 text-sm ${tab === "students" ? "chip-active" : ""}`}
            >
              Students 學生密碼 ({students.length})
            </button>
            <button
              onClick={() => setTab("qr")}
              className={`chip px-4 py-1.5 text-sm ${tab === "qr" ? "chip-active" : ""}`}
            >
              QR sign-in 課堂登入
            </button>
          </div>
        </section>

        {tab === "gifts" && (
          <>
            <section className="glass rounded-[28px] p-6">
              <div className="grid sm:grid-cols-3 gap-3">
                <Stat label="Waiting 待派發" value={pendingCount} />
                <Stat label="Given 已派發" value={givenCount} />
                <Stat label="Total 總數" value={gifts.length} />
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
                <button
                  onClick={() =>
                    exportCsv(
                      [
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
                      ],
                      "vocadex-gifts.csv"
                    )
                  }
                  className="btn-duo px-4 py-1.5 text-sm ml-auto"
                >
                  Export CSV
                </button>
              </div>
            </section>

            <section className="glass rounded-[28px] p-6">
              {shown.length === 0 ? (
                <p className="opacity-80">
                  No records. When a student scores 90% or above in a Unit Exercise, the
                  request is uploaded here automatically.
                </p>
              ) : (
                <div className="space-y-3">
                  {shown.map((g) => (
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
                      <button onClick={() => void toggle(g)} className="btn-duo px-4 py-2 text-sm">
                        {g.status === "pending" ? "Mark as given" : "Undo"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {tab === "qr" && (
          <section className="glass rounded-[28px] p-6">
            <h2 className="text-xl font-black mb-1">Class QR sign-in 課堂 QR 登入</h2>
            <p className="text-sm opacity-80 mb-4 font-cn">
              生成一個令牌並以 QR 碼顯示。學生掃描後即可登入，不需輸入密碼。
              QR 碼內容只是令牌文字（例如 SUN-4821），不是網址。
            </p>

            <div className="flex flex-wrap items-end gap-3 mb-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide opacity-70 mb-1">
                  Label 標籤
                </label>
                <input
                  value={qrLabel}
                  onChange={(e) => setQrLabel(e.target.value)}
                  placeholder="Class 6A"
                  className="rounded-2xl px-4 py-2.5 bg-white/60 border border-white/70 outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wide opacity-70 mb-1">
                  Valid for 有效時間
                </label>
                <select
                  value={qrMinutes}
                  onChange={(e) => setQrMinutes(Number(e.target.value))}
                  className="rounded-2xl px-4 py-2.5 bg-white/60 border border-white/70 outline-none font-semibold"
                >
                  {[15, 30, 45, 60, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={() => void makeQr()} className="btn-duo px-5 py-2.5" disabled={busy}>
                {qrCode ? "New code 重新生成" : "Generate 生成 QR"}
              </button>
              {qrCode && (
                <button onClick={() => void cancelQr()} className="btn-ghost px-5 py-2.5">
                  Cancel code
                </button>
              )}
            </div>

            {qrSvg && qrCode ? (
              <div className="grid md:grid-cols-[320px_1fr] gap-6 items-center animate-rise">
                <div
                  className="bg-white rounded-3xl p-3 shadow-lg mx-auto w-[320px] h-[320px] grid place-items-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className="space-y-3">
                  <div className="glass-soft rounded-2xl p-4 text-center">
                    <div className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                      Code 令牌
                    </div>
                    <div className="text-4xl font-black tracking-widest mt-1">{qrCode}</div>
                  </div>
                  <div className="glass-soft rounded-2xl p-4 text-center">
                    <div className="text-xs font-black uppercase tracking-wide opacity-60">
                      Expires in 剩餘時間
                    </div>
                    <div className="text-3xl font-black tabular-nums mt-1">
                      {qrLeft > 0
                        ? `${String(Math.floor(qrLeft / 60000)).padStart(2, "0")}:${String(
                            Math.floor((qrLeft % 60000) / 1000)
                          ).padStart(2, "0")}`
                        : "EXPIRED"}
                    </div>
                  </div>
                  <div className="glass-soft rounded-2xl p-4 text-center">
                    <div className="text-xs font-black uppercase tracking-wide opacity-60">
                      Signed in 已登入
                    </div>
                    <div className="text-3xl font-black mt-1">{qrUses}</div>
                  </div>
                  <p className="text-xs opacity-70 font-cn">
                    學生用法：打開 Vocadex → 輸入學號 → 按 Scan QR 掃描此碼 → 自動登入。
                  </p>
                </div>
              </div>
            ) : (
              <p className="opacity-80 text-sm">
                No code yet. Press <b>Generate</b> to show a QR code on the board.
              </p>
            )}
          </section>
        )}

        {tab === "students" && (
          <>
            <section className="glass rounded-[28px] p-6">
              <h2 className="text-xl font-black mb-2">Add students 新增學生</h2>
              <p className="text-sm opacity-80 mb-3">
                Paste school emails (one per line, or separated by commas). A password is
                generated automatically for each new student.
              </p>
              <textarea
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                rows={4}
                placeholder={"saratan@plkshs.edu.hk\n211B0000@plkshs.edu.hk"}
                className="w-full rounded-2xl px-4 py-3 bg-white/60 border border-white/70 outline-none font-semibold"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={addStudents} className="btn-duo px-5 py-2.5" disabled={busy}>
                  Add & generate passwords
                </button>
                <button
                  onClick={() =>
                    exportCsv(
                      [
                        ["Name", "Email", "Password"],
                        ...students.map((s) => [s.name, s.email, s.password || "(none)"]),
                      ],
                      "vocadex-passwords.csv"
                    )
                  }
                  className="btn-ghost px-5 py-2.5"
                >
                  Export passwords (CSV)
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-ghost px-5 py-2.5"
                >
                  Print list
                </button>
              </div>
            </section>

            <section className="glass rounded-[28px] p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-xl font-black">Class list 學生名單</h2>
              <button
                onClick={() => void resetAllEnergy()}
                className="btn-duo px-4 py-2 text-sm"
                disabled={busy}
              >
                ⚡ Reset all to 100
              </button>
              <button
                onClick={() => void downloadAllCards()}
                className="btn-ghost px-4 py-2 text-sm"
                disabled={busy}
              >
                🖼 All QR cards
              </button>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or email"
                  className="ml-auto rounded-2xl px-4 py-2 bg-white/60 border border-white/70 outline-none text-sm"
                />
              </div>
              {filteredStudents.length === 0 ? (
                <p className="opacity-80 text-sm">
                  No students yet. Add emails above, or students will appear here
                  automatically after their first sign-in.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((s) => (
                    <div
                      key={s.email}
                      className="glass-soft rounded-2xl p-3 flex flex-wrap items-center gap-3"
                    >
                      <Avatar id="cat" size={40} />
                      <div className="flex-1 min-w-[180px]">
                        <div className="font-black">{s.name}</div>
                        <div className="text-xs opacity-75">{s.email}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-black opacity-60">
                          Password
                        </div>
                        <div className="font-black tracking-[0.25em]">
                          {s.password || "— none —"}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() =>
                            setOpenQr((cur) => (cur === s.email ? "" : s.email))
                          }
                          className="btn-duo px-3 py-1.5 text-xs"
                        >
                          {openQr === s.email ? "Hide QR" : "QR"}
                        </button>
                        <button
                          onClick={() => void resetOne(s.email)}
                          className="btn-ghost px-3 py-1.5 text-xs"
                        >
                          ⚡100
                        </button>
                        <button
                          onClick={() => void resetPassword(s.email)}
                          className="btn-ghost px-3 py-1.5 text-xs"
                        >
                          New
                        </button>
                        <button
                          onClick={() => void removeStudent(s.email)}
                          className="btn-ghost px-3 py-1.5 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      {openQr === s.email &&
                        (s.password ? (
                          <div className="w-full mt-3 grid sm:grid-cols-[auto_1fr] gap-5 items-start animate-rise">
                            <StudentQrCard
                              name={s.name}
                              email={s.email}
                              qrSrc={studentQrUrl(s.email)}
                            />
                            <div className="space-y-2 text-xs opacity-80 font-cn">
                              <p>
                                卡片下方印有學生姓名，不會拿錯。掃描後自動帶入帳號與密碼，
                                不用輸入任何資料。
                              </p>
                              <p className="font-mono break-all opacity-70">
                                QR content: VDX|{s.email}|{s.password}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="w-full mt-3 text-xs opacity-80 font-cn">
                            這位學生還沒有密碼，請先按 New 產生密碼。
                          </p>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

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
