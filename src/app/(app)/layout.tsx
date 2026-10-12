"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ThemeStyle from "@/components/ThemeStyle";
import { useApp } from "@/lib/store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { state, ready } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !state.profile) router.replace("/");
  }, [ready, state.profile, router]);

  return (
    <div className="min-h-screen bg-photo bg-wash">
      <ThemeStyle />
      <Sidebar />
      <main className="md:pl-[284px] px-4 pt-20 pb-24 md:pt-6 md:pb-6 md:pr-6">
        {ready && state.profile ? children : null}
      </main>
    </div>
  );
}
