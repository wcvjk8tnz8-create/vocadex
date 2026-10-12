"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { nameFromEmail, useApp } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { state, ready, login } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && state.profile) router.replace("/home");
  }, [ready, state.profile, router]);

  const preview = email.includes("@") ? nameFromEmail(email) : "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return setError("Please enter your school email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setError("That does not look like an email address.");
    login(value);
    router.replace("/home");
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

          <p className="font-semibold opacity-80 mb-4">
            Sign in with your school email to start learning English words.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block font-bold text-sm mb-2">School email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="saratan@plkshs.edu.hk"
                className="w-full rounded-2xl px-4 py-3 bg-white/60 border border-white/70 outline-none font-semibold placeholder:opacity-50 focus:bg-white/80"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {["@plkshs.edu.hk"].map((suffix) => (
                  <button
                    type="button"
                    key={suffix}
                    onClick={() => {
                      const name = email.split("@")[0] || "student";
                      setEmail(name + suffix);
                    }}
                    className="chip px-3 py-1 text-xs"
                  >
                    + {suffix}
                  </button>
                ))}
              </div>
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

            <button type="submit" className="btn-duo w-full py-3 text-lg">
              Let&apos;s Go!
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] opacity-70 font-cn">
            版權歸 PLKSHS 所屬 · © PLKSHS · P.L.K. Siu Hon Sum Primary School
          </p>
        </div>
      </div>
    </main>
  );
}
