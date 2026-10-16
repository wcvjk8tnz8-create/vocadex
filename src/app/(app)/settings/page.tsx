"use client";

import { COPYRIGHT, COPYRIGHT_ZH, SCHOOL_DOMAIN } from "@/lib/school";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import PracticeSetup, { type Setup } from "@/components/PracticeSetup";
import { AVATARS, AVATAR_LABEL, BACKGROUNDS, THEMES, nameFromEmail, useApp } from "@/lib/store";
import type { AvatarId } from "@/lib/store";

export default function SettingsPage() {
  const { state, updateProfile } = useApp();
  const profile = state.profile!;
  const [nameDraft, setNameDraft] = useState(profile.name);

  const setup: Setup = {
    grade: profile.grade,
    term: profile.term,
    unitIndex: profile.unitIndex,
    difficulty: profile.difficulty,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <section className="glass rounded-[28px] p-6">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="font-cn opacity-80">設定 · 個人檔案與外觀</p>

        <div className="flex flex-col sm:flex-row items-center gap-5 mt-5">
          <Avatar id={profile.avatar} size={96} ring="rgba(255,255,255,.95)" />
          <div className="flex-1 w-full">
            <label className="block font-black text-sm mb-2">Display name 名稱</label>
            <div className="flex gap-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="flex-1 rounded-2xl px-4 py-3 bg-white/60 border border-white/70 outline-none font-bold"
              />
              <button
                className="btn-ghost px-4 py-2 whitespace-nowrap"
                onClick={() => setNameDraft(nameFromEmail(profile.email))}
              >
                Use email name
              </button>
              <button
                className="btn-duo px-4 py-2"
                onClick={() => updateProfile({ name: nameDraft.trim() || profile.email.split("@")[0] })}
              >
                Save
              </button>
            </div>
            <p className="text-xs opacity-75 mt-2">
              Your name comes from your email: <b>{profile.email}</b> →{" "}
              <b>{nameFromEmail(profile.email)}</b>
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------ avatars ------------------------------ */}
      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-1">Avatar 頭像</h2>
        <p className="text-xs opacity-80 mb-4">11 hand-drawn characters — pick your favourite.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {AVATARS.map((id) => {
            const active = profile.avatar === id;
            return (
              <button
                key={id}
                onClick={() => updateProfile({ avatar: id as AvatarId })}
                className={`rounded-3xl p-3 flex flex-col items-center gap-2 border-2 transition ${
                  active
                    ? "border-[color:var(--accent)] bg-white/60"
                    : "border-white/40 bg-white/25 hover:bg-white/45"
                }`}
              >
                <Avatar id={id as AvatarId} size={62} />
                <span className="text-[10px] font-bold text-center leading-tight">
                  {AVATAR_LABEL[id as AvatarId]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------- theme ------------------------------- */}
      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-1">Theme colour 主題顏色</h2>
        <p className="text-xs opacity-80 mb-4">Beige 米色 · Brown 棕色 · Light Purple 淺紫色 · Sky Blue 天空藍</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEMES.map((t) => {
            const active = profile.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updateProfile({ theme: t.id })}
                className={`rounded-3xl p-4 flex flex-col items-center gap-2 border-2 ${
                  active ? "border-[color:var(--accent)] bg-white/60" : "border-white/40 bg-white/25"
                }`}
              >
                <span
                  className="h-12 w-12 rounded-2xl"
                  style={{ background: t.accent, boxShadow: `0 5px 0 ${t.deep}` }}
                />
                <span className="text-xs font-black">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------- background ---------------------------- */}
      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-1">Background 背景圖</h2>
        <p className="text-xs opacity-80 mb-4">Choose the picture behind the glass panels.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BACKGROUNDS.map((b) => {
            const active = profile.background === b.id;
            return (
              <button
                key={b.id}
                onClick={() => updateProfile({ background: b.id })}
                className={`rounded-3xl overflow-hidden border-2 ${
                  active ? "border-[color:var(--accent)]" : "border-white/40"
                }`}
              >
                <div
                  className="h-24 w-full"
                  style={{
                    backgroundImage: b.file ? `url(${b.file})` : "linear-gradient(160deg,#f9f1e3,#efe3cf)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div
                  className={`px-3 py-2 text-xs font-black ${
                    active ? "bg-white/70" : "bg-white/40"
                  }`}
                >
                  {b.label}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* --------------------------- default level --------------------------- */}
      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-1">Default level 預設程度</h2>
        <p className="text-xs opacity-80 mb-4">Used when you open Home or Exercises.</p>
        <PracticeSetup
          value={setup}
          onChange={(next) =>
            updateProfile({
              grade: next.grade,
              term: next.term,
              unitIndex: next.unitIndex,
              difficulty: next.difficulty,
            })
          }
        />
      </section>

      {/* ------------------------------ account ------------------------------ */}
      <section className="glass rounded-[28px] p-6">
        <h2 className="text-xl font-black mb-3">Account 帳戶</h2>
        <div className="glass-soft rounded-2xl p-4 text-sm space-y-1">
          <div>
            <b>Email：</b>
            {profile.email}
          </div>
          <div>
            <b>Sign-in domain 登入網域：</b>
            {SCHOOL_DOMAIN}
          </div>
        </div>
        <Link
          href="/teacher"
          className="mt-4 inline-block btn-ghost px-5 py-2.5 text-sm"
        >
          Teacher Dashboard 教師後台 →
        </Link>
      </section>

      <p className="text-center text-[11px] opacity-70 font-cn pb-4">
        {COPYRIGHT_ZH} · {COPYRIGHT}
      </p>
    </div>
  );
}
