"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { useApp } from "@/lib/store";

const NAV = [
  { href: "/home", label: "Home", Icon: IconHome },
  { href: "/energies", label: "Energies", Icon: IconBolt },
  { href: "/exercises", label: "Exercises", Icon: IconBook },
  { href: "/settings", label: "Settings", Icon: IconGear },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout, energy } = useApp();
  const profile = state.profile;

  return (
    <>
      {/* ---------------- desktop sidebar ---------------- */}
      <aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-[248px] flex-col glass rounded-[28px] p-4 z-30">
        <div className="flex items-center gap-3 px-2 pb-4">
          <div
            className="h-11 w-11 rounded-2xl grid place-items-center text-white font-black text-xl"
            style={{ background: "var(--accent)" }}
          >
            V
          </div>
          <div className="leading-tight">
            <div className="text-xl font-black">Vocadex</div>
            <div className="font-cn text-[11px] opacity-70">保良局蕭漢森小學</div>
          </div>
        </div>

        {profile && (
          <div className="flex items-center gap-3 glass-soft rounded-2xl p-3 mb-4">
            <Avatar id={profile.avatar} size={44} />
            <div className="min-w-0 leading-tight">
              <div className="font-black truncate">{profile.name}</div>
              <div className="text-[11px] opacity-70 truncate">{profile.email}</div>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-2 flex-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 font-extrabold transition ${
                  active
                    ? "text-white shadow-lg"
                    : "hover:bg-white/30 opacity-90"
                }`}
                style={
                  active
                    ? { background: "var(--accent)", boxShadow: "0 8px 18px rgba(60,45,20,.25)" }
                    : undefined
                }
              >
                <Icon />
                <span>{label}</span>
                {href === "/energies" && (
                  <span className="ml-auto text-xs font-black opacity-80">{energy}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex items-center gap-3 rounded-2xl px-3 py-3 font-extrabold hover:bg-white/30 transition"
        >
          <IconLogout />
          <span>Log Out</span>
        </button>

        <div className="mt-3 pt-3 border-t border-white/40 text-[10px] leading-snug opacity-80">
          <div className="font-black">© PLKSHS</div>
          <div className="font-cn">版權歸 PLKSHS 所屬</div>
          <div>P.L.K. Siu Hon Sum Primary School</div>
        </div>
      </aside>

      {/* ---------------- mobile top bar ---------------- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass px-4 py-3 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-xl grid place-items-center text-white font-black"
          style={{ background: "var(--accent)" }}
        >
          V
        </div>
        <div className="leading-tight flex-1">
          <div className="font-black">Vocadex</div>
          <div className="font-cn text-[10px] opacity-70">保良局蕭漢森小學</div>
        </div>
        {profile && <Avatar id={profile.avatar} size={34} />}
      </div>

      {/* ---------------- mobile bottom nav ---------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass px-2 py-2 flex justify-around">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-extrabold ${
                active ? "text-white" : "opacity-80"
              }`}
              style={active ? { background: "var(--accent)" } : undefined}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/* ------------------------------ icons ------------------------------ */
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
      <path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  );
}
