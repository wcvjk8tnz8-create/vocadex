"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { nameFromEmail, useApp } from "@/lib/store";

const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

const SCHOOL_DOMAIN = "plkshs.edu.hk";

/** 211B0000 -> 211B0000@plkshs.edu.hk ; already an email -> as-is */
function toEmail(raw: string) {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  if (v.includes("@")) return v;
  return `${v}@${SCHOOL_DOMAIN}`;
}

export default function LoginPage() {
  const router = useRouter();
  const { state, ready, login } = useApp();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Already signed in on this device? Go straight in — no retyping.
  useEffect(() => {
    if (ready && state.profile) router.replace("/home");
  }, [ready, state.profile, router]);

  const email = toEmail(id);
  const preview = email.includes("@") ? nameFromEmail(email) : "";

  function enter() {
    login(email);
    router.replace("/home");
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email) {
      setError("Please enter your class number or school email.");
      return;
    }
    setBusy(true);
    setError("");

    /* 1. a scanned class code signs you straight in — no password needed */
    if (code.trim()) {
      try {
        const res = await fetch("/api/login-token", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim() }),
        });
        if (res.ok) {
          enter();
          return;
        }
        setBusy(false);
        setError("That class code has expired. Ask your teacher for a new one.");
        return;
      } catch {
        /* fall through to the password check */
      }
    }

    /* 2. otherwise check the personal password */
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; reason?: string };
        if (data.ok === false && data.reason === "wrong-password") {
          setBusy(false);
          setError("Wrong password. Ask your English teacher, or scan the class QR code.");
          return;
        }
      }
    } catch {
      /* server unreachable — keep the app usable offline */
    }
    enter();
  }

  return (
    <main className="min-h-screen bg-photo bg-wash grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-[32px] p-7 animate-pop">
          <div className="flex flex-col items-center gap-3 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Vocadex" className="h-24 w-24" />
            <div className="text-center">
              <h1 className="text-3xl font-black leading-none">Vocadex</h1>
              <p className="font-cn text-sm opacity-80 mt-1">
                保良局蕭漢森小學 · 英文詞彙練習平台
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block font-bold text-sm mb-2">
                Class number 學號
              </label>
              <input
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError("");
                }}
                placeholder="211B0000"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="text"
                className="w-full rounded-2xl px-4 py-3.5 bg-white/60 border border-white/70 outline-none font-black text-lg tracking-wide placeholder:font-semibold placeholder:tracking-normal placeholder:opacity-50 focus:bg-white/80 transition"
              />
              <p className="text-xs opacity-70 mt-2 font-cn">
                只需輸入學號（例如 211B0000），我們會自動加上 @{SCHOOL_DOMAIN}
              </p>
              {email && (
                <div className="text-xs font-bold mt-1 opacity-80 break-all">
                  → {email}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-sm mb-2">Password 密碼</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="6 letters from your teacher"
                autoCapitalize="characters"
                className="w-full rounded-2xl px-4 py-3 bg-white/60 border border-white/70 outline-none font-semibold tracking-[0.35em] placeholder:tracking-normal placeholder:opacity-50 focus:bg-white/80 transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/50" />
              <span className="text-xs font-black opacity-60">OR 或</span>
              <div className="h-px flex-1 bg-white/50" />
            </div>

            <div>
              <label className="block font-bold text-sm mb-2">
                Class code 課堂碼（掃描 QR）
              </label>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="SUN-4821"
                  className="flex-1 rounded-2xl px-4 py-3 bg-white/60 border border-white/70 outline-none font-black tracking-[0.2em] placeholder:tracking-normal placeholder:opacity-50 focus:bg-white/80 transition"
                />
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  className="btn-duo px-4 py-3 shrink-0"
                >
                  Scan QR
                </button>
              </div>
              <p className="text-xs opacity-70 mt-2 font-cn">
                老師在課堂上顯示 QR 碼，一掃描即可登入，不用輸入密碼。
              </p>
            </div>

            {preview && (
              <div className="glass-soft rounded-2xl p-3 flex items-center gap-3">
                <Avatar id="cat" size={40} />
                <div className="text-sm">
                  <div className="font-black">{preview}</div>
                  <div className="opacity-70 text-xs">your display name</div>
                </div>
              </div>
            )}

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}

            <button type="submit" className="btn-duo w-full py-3.5 text-lg" disabled={busy}>
              {busy ? "Checking…" : "Let's Go!"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] opacity-70 font-cn">
            版權歸 PLKSHS 所屬 · © PLKSHS · P.L.K. Siu Hon Sum Primary School
          </p>
        </div>
      </div>

      {scanning && (
        <QrScanner
          onClose={() => setScanning(false)}
          onResult={(text) => {
            setScanning(false);
            setCode(text);
            setError("");
            if (!id.trim()) setId("");
            // sign in straight away if the class number is already filled in
            const emailNow = toEmail(id);
            if (emailNow.includes("@")) {
              setBusy(true);
              void (async () => {
                try {
                  const res = await fetch("/api/login-token", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: text }),
                  });
                  if (res.ok) {
                    login(emailNow);
                    router.replace("/home");
                    return;
                  }
                  setError("That class code has expired. Ask your teacher for a new one.");
                } catch {
                  setError("Cannot reach the server. Check your connection.");
                } finally {
                  setBusy(false);
                }
              })();
            }
          }}
        />
      )}
    </main>
  );
}
