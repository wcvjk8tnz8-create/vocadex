"use client";

import { useEffect } from "react";
import { BACKGROUNDS, THEMES, useApp } from "@/lib/store";

/** Injects the selected theme colour + background photo as CSS variables. */
export default function ThemeStyle() {
  const { state } = useApp();
  const theme = THEMES.find((t) => t.id === state.profile?.theme) ?? THEMES[0];
  const bg =
    BACKGROUNDS.find((b) => b.id === state.profile?.background) ?? BACKGROUNDS[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-deep", theme.deep);
    root.style.setProperty("--accent-soft", theme.soft);
    root.style.setProperty(
      "--bg-photo",
      bg.file ? `url(${bg.file})` : "none"
    );
    document.body.style.backgroundImage = bg.file ? `url(${bg.file})` : "none";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }, [theme, bg]);

  return null;
}
