"use client";

import type { ReactNode } from "react";

/**
 * Hand-drawn picture library for "Guess The Words".
 * Abstract words fall back to a colourful letter puzzle card.
 */

type Painter = () => ReactNode;

const s = (props: Record<string, string | number>) => props;

const ICONS: Record<string, Painter> = {
  /* ------------------------------- food -------------------------------- */
  apple: () => (
    <>
      <path d="M60 38c-14-8-26-2-26 14 0 22 14 40 26 40s26-18 26-40c0-16-12-22-26-14z" fill="#e8443f" />
      <path d="M60 38c0-8 6-16 14-16-2 8-6 14-14 16z" fill="#4c9a4c" />
      <path d="M60 34c-2-8 2-12 6-14" stroke="#7a5230" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),
  banana: () => (
    <>
      <path d="M30 46c0 30 24 46 48 40 10-3 14-10 12-16-2-6-8-8-14-6-8 3-14-4-16-14-3-14 4-26 14-30 6-2 10-8 6-12-6-4-14 0-20 6-12 12-30 14-30 32z" fill="#ffd23f" />
      <path d="M34 50c8 22 24 34 44 34" stroke="#e0a400" strokeWidth="4" fill="none" />
    </>
  ),
  cake: () => (
    <>
      <rect x="28" y="60" width="64" height="34" rx="6" fill="#f6d7a7" />
      <path d="M28 62c8 8 14-6 22 2 8 8 12-8 20 0 8 8 14-8 22 0v-6H28z" fill="#fff2f5" />
      <rect x="56" y="40" width="8" height="20" rx="4" fill="#7fd1f5" />
      <path d="M60 34l6 10-6 4-6-4z" fill="#ffb03b" />
    </>
  ),
  bread: () => (
    <>
      <path d="M26 62c0-14 14-24 34-24s34 10 34 24v20H26z" fill="#e0a75f" />
      <path d="M34 54c6-6 12-6 18 0M52 48c6-6 12-6 18 0" stroke="#f6d7a7" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  milk: () => (
    <>
      <path d="M46 34h28v14l8 12v40H38V60l8-12z" fill="#f7fbff" stroke="#9fb6c9" strokeWidth="3" />
      <rect x="42" y="72" width="36" height="16" fill="#7fd1f5" />
      <path d="M52 34l4-10h8l4 10z" fill="#cfd9e2" />
    </>
  ),
  egg: () => (
    <>
      <ellipse cx="60" cy="64" rx="22" ry="28" fill="#fff8ec" stroke="#e2cba6" strokeWidth="3" />
      <ellipse cx="54" cy="56" rx="8" ry="10" fill="#ffd23f" />
    </>
  ),
  rice: () => (
    <>
      <path d="M30 78c0-16 14-28 30-28s30 12 30 28z" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
      <g fill="#e8dcc4">
        <ellipse cx="48" cy="62" rx="4" ry="2.4" transform="rotate(-20 48 62)" />
        <ellipse cx="60" cy="58" rx="4" ry="2.4" transform="rotate(15 60 58)" />
        <ellipse cx="72" cy="64" rx="4" ry="2.4" transform="rotate(-10 72 64)" />
        <ellipse cx="54" cy="70" rx="4" ry="2.4" transform="rotate(25 54 70)" />
        <ellipse cx="68" cy="72" rx="4" ry="2.4" transform="rotate(-30 68 72)" />
      </g>
    </>
  ),
  water: () => (
    <>
      <path d="M60 28c14 18 22 30 22 40a22 22 0 1 1-44 0c0-10 8-22 22-40z" fill="#7fd1f5" />
      <path d="M52 68c0 8 4 12 8 16" stroke="#fff" strokeWidth="4" fill="none" opacity="0.7" />
    </>
  ),
  juice: () => (
    <>
      <path d="M44 40h32l-4 50H48z" fill="#ffb03b" />
      <rect x="42" y="34" width="36" height="8" rx="4" fill="#e8443f" />
      <path d="M76 56l10-4v20l-10-4z" fill="#ffd23f" />
    </>
  ),
  soup: () => (
    <>
      <path d="M28 58h64c0 20-14 32-32 32S28 78 28 58z" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
      <path d="M28 58c8 6 14-4 22 2 8 6 14-4 22 2 8 6 12-2 20 2" stroke="#e0a75f" strokeWidth="4" fill="none" />
      <path d="M50 44c0-6 6-6 6-12M64 44c0-6 6-6 6-12" stroke="#cfd9e2" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  noodles: () => (
    <>
      <path d="M28 62h64c0 18-14 28-32 28S28 80 28 62z" fill="#f6d7a7" />
      <path d="M36 58c6-8 10 4 16-2s10 6 16 0 10 4 16-2" stroke="#e0a75f" strokeWidth="4" fill="none" />
      <path d="M78 40l14-6M78 48l14-6" stroke="#cfd9e2" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  "ice cream": () => (
    <>
      <path d="M42 56a18 18 0 0 1 36 0z" fill="#ff9ec4" />
      <circle cx="52" cy="50" r="8" fill="#fff2f5" />
      <circle cx="68" cy="50" r="8" fill="#ffd23f" />
      <path d="M44 58h32l-14 34z" fill="#e0a75f" />
      <path d="M50 74l6 6 6-6" stroke="#c98a4b" strokeWidth="3" fill="none" />
    </>
  ),
  mooncake: () => (
    <>
      <circle cx="60" cy="62" r="30" fill="#c98a4b" />
      <circle cx="60" cy="62" r="20" fill="#e0a75f" />
      <path d="M48 54h24v16H48z" fill="#a86a34" />
      <path d="M54 62h12M60 56v12" stroke="#f6d7a7" strokeWidth="3" />
    </>
  ),
  vegetable: () => (
    <>
      <path d="M40 44c0-12 10-18 20-18s20 6 20 18c0 12-10 20-20 20s-20-8-20-20z" fill="#4c9a4c" />
      <path d="M60 26v50" stroke="#3b7a3b" strokeWidth="4" />
      <path d="M40 44h40" stroke="#3b7a3b" strokeWidth="3" />
    </>
  ),
  fruit: () => (
    <>
      <circle cx="42" cy="66" r="20" fill="#e8443f" />
      <circle cx="76" cy="60" r="16" fill="#ffd23f" />
      <circle cx="60" cy="44" r="14" fill="#7fc44c" />
      <path d="M60 30v-8" stroke="#3b7a3b" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  sugar: () => (
    <>
      <rect x="40" y="46" width="40" height="44" rx="6" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
      <path d="M44 62h32M44 72h32" stroke="#cfd9e2" strokeWidth="3" />
      <text x="60" y="40" fontSize="18" textAnchor="middle" fill="#9fb6c9">sugar</text>
    </>
  ),
  meat: () => (
    <>
      <path d="M36 50c16-10 36-8 46 6 10 14 2 32-14 32-14 0-20-8-20-16 0-6 6-8 6-14 0-6-6-6-18-8z" fill="#c05a5a" />
      <path d="M76 56c8 12 4 26-8 30" stroke="#f7c9cb" strokeWidth="6" fill="none" />
    </>
  ),

  /* ------------------------------ animals ------------------------------- */
  cat: () => (
    <>
      <path d="M34 40l-4-18 20 10zM86 40l4-18-20 10z" fill="#f0955c" />
      <circle cx="60" cy="62" r="30" fill="#f7ab72" />
      <circle cx="48" cy="56" r="5" fill="#2b2b2b" />
      <circle cx="72" cy="56" r="5" fill="#2b2b2b" />
      <path d="M60 68l-6 6h12z" fill="#e0705f" />
      <path d="M28 66h14M78 66h14" stroke="#7a4a2a" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  dog: () => (
    <>
      <ellipse cx="30" cy="60" rx="12" ry="22" fill="#8a5a32" />
      <ellipse cx="90" cy="60" rx="12" ry="22" fill="#8a5a32" />
      <circle cx="60" cy="58" r="30" fill="#c98a4b" />
      <ellipse cx="60" cy="72" rx="18" ry="14" fill="#f0d3ad" />
      <ellipse cx="60" cy="64" rx="7" ry="5.5" fill="#2f2a26" />
      <circle cx="48" cy="52" r="5" fill="#2b2b2b" />
      <circle cx="72" cy="52" r="5" fill="#2b2b2b" />
    </>
  ),
  bird: () => (
    <>
      <ellipse cx="56" cy="66" rx="26" ry="22" fill="#7fd1f5" />
      <circle cx="76" cy="46" r="14" fill="#7fd1f5" />
      <path d="M88 46l12 4-12 6z" fill="#ffb03b" />
      <circle cx="80" cy="42" r="3.4" fill="#2b2b2b" />
      <path d="M40 60c-10 6-14 18-6 24 6 4 12-2 12-10z" fill="#4fb3e0" />
    </>
  ),
  fish: () => (
    <>
      <path d="M28 62c12-18 40-18 52 0-12 18-40 18-52 0z" fill="#5bc0de" />
      <path d="M80 62l18-14v28z" fill="#4fb3e0" />
      <circle cx="44" cy="58" r="4" fill="#fff" />
      <circle cx="44" cy="58" r="2" fill="#2b2b2b" />
    </>
  ),
  rabbit: () => (
    <>
      <ellipse cx="48" cy="34" rx="8" ry="20" fill="#f7f7fb" />
      <ellipse cx="70" cy="34" rx="8" ry="20" fill="#f7f7fb" />
      <circle cx="60" cy="70" r="26" fill="#fdfdff" />
      <circle cx="50" cy="66" r="4.4" fill="#2b2b2b" />
      <circle cx="70" cy="66" r="4.4" fill="#2b2b2b" />
      <path d="M60 76l-5 5h10z" fill="#f0955c" />
    </>
  ),
  cow: () => (
    <>
      <path d="M34 34q-10-16 4-18 8 8 12 14zM86 34q10-16-4-18-8 8-12 14z" fill="#c9b79a" />
      <circle cx="60" cy="62" r="28" fill="#fdfcf8" />
      <path d="M38 50q10-10 18-2-8 10-18 6z" fill="#3b3b3b" />
      <path d="M82 72q10-10 4-18-10 2-8 12z" fill="#3b3b3b" />
      <ellipse cx="60" cy="74" rx="16" ry="11" fill="#f7c9cb" />
      <circle cx="48" cy="56" r="4" fill="#2b2b2b" />
      <circle cx="72" cy="56" r="4" fill="#2b2b2b" />
    </>
  ),
  pig: () => (
    <>
      <circle cx="60" cy="62" r="30" fill="#f7b8c8" />
      <path d="M36 40l-4-14 18 8zM84 40l4-14-18 8z" fill="#e88fa8" />
      <ellipse cx="60" cy="72" rx="16" ry="12" fill="#f2a0b8" />
      <circle cx="53" cy="70" r="3" fill="#b5717a" />
      <circle cx="67" cy="70" r="3" fill="#b5717a" />
      <circle cx="48" cy="56" r="4" fill="#2b2b2b" />
      <circle cx="72" cy="56" r="4" fill="#2b2b2b" />
    </>
  ),
  duck: () => (
    <>
      <ellipse cx="54" cy="72" rx="30" ry="20" fill="#ffd23f" />
      <circle cx="80" cy="46" r="16" fill="#ffd23f" />
      <path d="M94 46l14 6-14 8z" fill="#f39c12" />
      <circle cx="84" cy="42" r="3.4" fill="#2b2b2b" />
      <path d="M30 78c14 8 34 8 50 0" stroke="#e0a400" strokeWidth="4" fill="none" />
    </>
  ),
  horse: () => (
    <>
      <path d="M52 30c-8 0-14 6-14 14 0 10 4 18 10 24h24c8-8 12-16 12-26 0-8-6-12-14-12z" fill="#a9714b" />
      <path d="M40 34l-4-12 12 6z" fill="#a9714b" />
      <path d="M46 68c-4 14-2 24 4 30h20c-2-14-6-22-10-30z" fill="#8a5a32" />
      <circle cx="56" cy="48" r="4" fill="#2b2b2b" />
      <circle cx="72" cy="48" r="4" fill="#2b2b2b" />
      <path d="M58 66h14" stroke="#5c3a22" strokeWidth="3" />
    </>
  ),
  monkey: () => (
    <>
      <circle cx="38" cy="46" r="12" fill="#a9714b" />
      <circle cx="82" cy="46" r="12" fill="#a9714b" />
      <circle cx="60" cy="60" r="30" fill="#c98a4b" />
      <ellipse cx="60" cy="70" rx="20" ry="16" fill="#f0d3ad" />
      <circle cx="50" cy="54" r="4.4" fill="#2b2b2b" />
      <circle cx="70" cy="54" r="4.4" fill="#2b2b2b" />
      <path d="M52 70q8 8 16 0" stroke="#7a4a2a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  elephant: () => (
    <>
      <ellipse cx="30" cy="56" rx="16" ry="22" fill="#9fb6c9" />
      <ellipse cx="90" cy="56" rx="16" ry="22" fill="#9fb6c9" />
      <circle cx="60" cy="54" r="28" fill="#b0c4d6" />
      <path d="M60 66c0 16-4 26-10 30 10 4 20 4 30 0-8-4-10-14-10-30z" fill="#9fb6c9" />
      <circle cx="50" cy="50" r="4" fill="#2b2b2b" />
      <circle cx="70" cy="50" r="4" fill="#2b2b2b" />
    </>
  ),
  giraffe: () => (
    <>
      <path d="M74 88V56c0-8 6-10 10-16-8-6-18-2-24 4-6-6-16-10-24-4 4 6 10 8 10 16v32z" fill="#ffd23f" />
      <circle cx="80" cy="34" r="14" fill="#ffd23f" />
      <path d="M70 24l-4-10M90 24l4-10" stroke="#a86a34" strokeWidth="4" strokeLinecap="round" />
      <circle cx="76" cy="32" r="3.4" fill="#2b2b2b" />
      <g fill="#c98a4b">
        <circle cx="52" cy="62" r="5" />
        <circle cx="66" cy="72" r="5" />
        <circle cx="52" cy="80" r="5" />
      </g>
    </>
  ),
  dolphin: () => (
    <>
      <path d="M24 70c10-24 44-32 62-14 8 8 6 20-4 24-14 6-30 2-40-4-8-4-12 0-18 6z" fill="#7fb2d9" />
      <path d="M62 52l-8-16 18 10z" fill="#5b92bd" />
      <circle cx="38" cy="64" r="3.4" fill="#2b2b2b" />
      <path d="M86 80c-10 6-20 2-26-6" stroke="#5b92bd" strokeWidth="4" fill="none" />
    </>
  ),
  penguin: () => (
    <>
      <ellipse cx="60" cy="66" rx="26" ry="34" fill="#2f2f38" />
      <ellipse cx="60" cy="76" rx="16" ry="24" fill="#fdfdff" />
      <circle cx="52" cy="52" r="4" fill="#2b2b2b" />
      <circle cx="68" cy="52" r="4" fill="#2b2b2b" />
      <path d="M60 58l10 6-10 6z" fill="#ffb03b" />
      <path d="M34 74l-10 12M86 74l10 12" stroke="#ffb03b" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  kangaroo: () => (
    <>
      <path d="M46 90c-10-10-14-24-10-38 4-14 16-20 28-20 8 0 14 4 16 10 2-8 8-12 14-10-2 8-8 14-14 16-2 16-6 30-14 42z" fill="#c98a4b" />
      <circle cx="76" cy="34" r="10" fill="#c98a4b" />
      <path d="M68 26l-4-10M86 26l6-8" stroke="#8a5a32" strokeWidth="4" strokeLinecap="round" />
      <circle cx="78" cy="32" r="3" fill="#2b2b2b" />
      <path d="M52 58q10 12 22 8" stroke="#8a5a32" strokeWidth="4" fill="none" />
    </>
  ),
  whale: () => (
    <>
      <path d="M22 68c0-18 22-30 46-30s32 12 38 26c-8 12-26 18-48 16-20-2-36-4-36-12z" fill="#5b92bd" />
      <path d="M106 64l-2-18-14 22z" fill="#4a7fa8" />
      <circle cx="40" cy="62" r="4" fill="#2b2b2b" />
      <path d="M50 52c8 8 8 16 0 22" stroke="#fff" strokeWidth="5" fill="none" />
    </>
  ),
  crocodile: () => (
    <>
      <path d="M24 68c0-14 18-22 40-22s36 8 36 18c0 6-6 10-14 10H40c-10 0-16-2-16-6z" fill="#5b8f5b" />
      <path d="M100 64c8-4 14 0 14 6-6 4-12 4-16 2z" fill="#4c7a4c" />
      <g fill="#3b6b3b">
        <path d="M34 48l6-8 6 8zM48 44l6-8 6 8zM62 42l6-8 6 8z" />
      </g>
      <circle cx="36" cy="58" r="4" fill="#fff" />
      <circle cx="36" cy="58" r="2" fill="#2b2b2b" />
    </>
  ),
  tail: () => (
    <>
      <path d="M30 90c0-24 10-40 30-40 14 0 20 10 18 20-2 8-10 10-14 4-4-6 2-12 10-10" stroke="#8a5a32" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="82" cy="58" r="12" fill="#ffd23f" />
    </>
  ),

  /* ------------------------------- nature ------------------------------- */
  sun: () => (
    <>
      <circle cx="60" cy="60" r="22" fill="#ffd23f" />
      <g stroke="#ffb03b" strokeWidth="6" strokeLinecap="round">
        <path d="M60 24v-10M60 106V96M24 60H14M106 60H96M34 34l-7-7M93 93l-7-7M86 34l7-7M27 93l7-7" />
      </g>
    </>
  ),
  moon: () => (
    <>
      <path d="M72 22a38 38 0 1 0 0 76 30 30 0 1 1 0-76z" fill="#ffe27a" />
      <circle cx="58" cy="48" r="5" fill="#c9a227" />
      <circle cx="52" cy="72" r="4" fill="#c9a227" />
      <path d="M64 66q8 6 14 0" stroke="#c9a227" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  star: () => (
    <path d="M60 22l10 24 26 2-20 17 6 26-22-14-22 14 6-26-20-17 26-2z" fill="#ffd23f" />
  ),
  cloud: () => (
    <>
      <path d="M36 78c-10 0-16-8-12-16 2-8 10-12 18-10 2-12 14-20 26-16 12 4 16 16 10 26-2 10-12 16-24 16z" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
    </>
  ),
  tree: () => (
    <>
      <path d="M56 88h12V60H56z" fill="#a9714b" />
      <circle cx="60" cy="46" r="26" fill="#4c9a4c" />
      <circle cx="40" cy="56" r="16" fill="#5cae5c" />
      <circle cx="82" cy="56" r="16" fill="#5cae5c" />
    </>
  ),
  flower: () => (
    <>
      <path d="M60 96V64" stroke="#4c9a4c" strokeWidth="6" strokeLinecap="round" />
      <g fill="#f26d8a">
        <ellipse cx="60" cy="40" rx="10" ry="14" />
        <ellipse cx="60" cy="66" rx="10" ry="14" />
        <ellipse cx="46" cy="53" rx="14" ry="10" />
        <ellipse cx="74" cy="53" rx="14" ry="10" />
      </g>
      <circle cx="60" cy="53" r="10" fill="#ffd23f" />
    </>
  ),
  grass: () => (
    <>
      <path d="M20 92h84" stroke="#a9714b" strokeWidth="8" strokeLinecap="round" />
      <g stroke="#4c9a4c" strokeWidth="6" strokeLinecap="round">
        <path d="M32 92c0-16 4-24 10-30M48 92c-2-20 0-30 6-38M66 92c0-18 4-26 10-32M84 92c-2-14 0-22 4-28" />
      </g>
    </>
  ),
  mountain: () => (
    <>
      <path d="M14 90l30-46 20 26 16-22 30 42z" fill="#7f8c9b" />
      <path d="M44 44l-8 12h16z" fill="#f7fbff" />
      <path d="M78 52l-6 10h12z" fill="#f7fbff" />
    </>
  ),
  river: () => (
    <>
      <path d="M20 30c14 0 20 10 20 20s-6 20-20 20v34h24c14 0 22-14 22-30V30z" fill="#4c9a4c" />
      <path d="M60 30v74c0-16 8-30 22-30h24V70c-14 0-20-10-20-20s6-20 20-20z" fill="#4c9a4c" />
      <path d="M52 30h16v74H52z" fill="#7fd1f5" />
    </>
  ),
  ocean: () => (
    <>
      <rect x="16" y="56" width="92" height="40" fill="#5bc0de" />
      <path d="M16 56c10 6 18-4 28 2s18-6 28 0 18-4 26 2v-8H16z" fill="#7fd1f5" />
      <circle cx="96" cy="34" r="12" fill="#ffd23f" />
      <path d="M34 84c8-6 14 4 22 0s14 4 22 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.8" />
    </>
  ),
  waterfall: () => (
    <>
      <path d="M16 40h92v12H16z" fill="#7f8c9b" />
      <path d="M40 52h44v42H40z" fill="#7fd1f5" />
      <path d="M52 56v34M64 56v34M76 56v34" stroke="#fff" strokeWidth="4" opacity="0.8" />
      <path d="M28 94c8 6 16-6 24 0s16-6 24 0 16-4 20 0" stroke="#5bc0de" strokeWidth="6" fill="none" />
    </>
  ),
  desert: () => (
    <>
      <circle cx="90" cy="34" r="14" fill="#ffd23f" />
      <path d="M14 88c16-10 30-10 46 0s34 8 50-4v22H14z" fill="#f0d3ad" />
      <path d="M14 92c20-8 34-6 48 2s26 6 44-4" stroke="#e0a75f" strokeWidth="4" fill="none" />
      <path d="M40 62c0-10 6-16 14-16s14 6 14 16l-6 4H46z" fill="#4c9a4c" />
      <path d="M54 62v22" stroke="#a9714b" strokeWidth="5" />
    </>
  ),
  cave: () => (
    <>
      <path d="M12 92V56c0-14 14-24 32-24s36 10 44 24c4 6 6 14 6 36z" fill="#7f8c9b" />
      <path d="M46 92V74c0-14 10-24 24-24s22 10 22 24v18z" fill="#2f3350" />
      <path d="M34 62l8-10 10 8zM84 68l-8-10-8 8z" fill="#9fb6c9" />
    </>
  ),
  forest: () => (
    <>
      <path d="M20 94h84" stroke="#a9714b" strokeWidth="8" strokeLinecap="round" />
      <g>
        <path d="M30 94V66M30 66l-16 12h32z" fill="#4c9a4c" />
        <path d="M30 72l-12 10h24z" fill="#5cae5c" />
        <path d="M62 94V56M62 56l-20 16h40z" fill="#3b8a3b" />
        <path d="M62 66l-14 12h28z" fill="#4c9a4c" />
        <path d="M94 94V70M94 70l-14 10h28z" fill="#4c9a4c" />
      </g>
    </>
  ),
  island: () => (
    <>
      <path d="M16 90c14-8 26-8 40 0s30 4 52-6v22H16z" fill="#f0d3ad" />
      <path d="M60 90V60" stroke="#a9714b" strokeWidth="6" />
      <path d="M60 60c-12-4-16-14-14-22 10 0 16 8 18 16 4-10 12-18 22-16 2 10-6 20-18 22z" fill="#4c9a4c" />
      <path d="M16 96c16 6 30 6 44 0s26-6 44 2" stroke="#5bc0de" strokeWidth="6" fill="none" />
    </>
  ),
  sunset: () => (
    <>
      <circle cx="60" cy="66" r="22" fill="#ffb03b" />
      <path d="M16 92h92" stroke="#e8763f" strokeWidth="8" strokeLinecap="round" />
      <path d="M24 66h72M30 76h60" stroke="#ffd23f" strokeWidth="5" opacity="0.8" />
      <path d="M16 40c10-6 18 4 28 0s18 4 28 0 18 4 24 0v10H16z" fill="#f0955c" opacity="0.7" />
    </>
  ),

  /* ---------------------------- school things --------------------------- */
  book: () => (
    <>
      <path d="M24 30h32c6 0 8 4 8 8v56c0-4-2-6-8-6H24z" fill="#5b8fd9" />
      <path d="M100 30H68c-6 0-8 4-8 8v56c0-4 2-6 8-6h32z" fill="#7fb2d9" />
      <path d="M60 38v56" stroke="#3f5fd0" strokeWidth="4" />
    </>
  ),
  pencil: () => (
    <>
      <path d="M28 88l6-20 44-44 14 14-44 44z" fill="#ffd23f" />
      <path d="M28 88l6-20 8 8z" fill="#f7fbff" />
      <path d="M34 96l-6-8 14-14 8 8z" fill="#e0705f" />
      <path d="M78 24l14 14" stroke="#e0a400" strokeWidth="4" />
    </>
  ),
  pen: () => (
    <>
      <path d="M24 92l4-16 46-46 12 12-46 46z" fill="#5b8fd9" />
      <path d="M74 30l12 12 8-8-12-12z" fill="#3f5fd0" />
      <path d="M28 76l14 14-6 6-14-14z" fill="#2f2f38" />
    </>
  ),
  ruler: () => (
    <>
      <rect x="20" y="46" width="84" height="28" rx="4" fill="#ffd23f" transform="rotate(-12 62 60)" />
      <g stroke="#a3701c" strokeWidth="3">
        <path d="M34 52l-4 8M46 48l-4 8M58 44l-4 8M70 40l-4 8M82 36l-4 8" />
      </g>
    </>
  ),
  rubber: () => (
    <>
      <rect x="26" y="52" width="68" height="36" rx="8" fill="#f7b8c8" />
      <rect x="26" y="70" width="68" height="18" rx="8" fill="#fff2f5" />
    </>
  ),
  bag: () => (
    <>
      <path d="M34 48h56l8 46H26z" fill="#7fb2d9" />
      <path d="M48 48V38a14 14 0 0 1 28 0v12" stroke="#3f5fd0" strokeWidth="5" fill="none" />
      <rect x="52" y="64" width="20" height="14" rx="4" fill="#5b8fd9" />
    </>
  ),
  desk: () => (
    <>
      <path d="M20 44h84v10H20z" fill="#c98a4b" />
      <path d="M28 54v40M96 54v40" stroke="#8a5a32" strokeWidth="7" strokeLinecap="round" />
      <path d="M28 74h68" stroke="#8a5a32" strokeWidth="5" />
    </>
  ),
  chair: () => (
    <>
      <path d="M34 92V48h56v20" stroke="#8a5a32" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M34 62h56v10H34z" fill="#c98a4b" />
      <path d="M36 92h56" stroke="#8a5a32" strokeWidth="7" strokeLinecap="round" />
    </>
  ),
  school: () => (
    <>
      <path d="M60 24l48 24H12z" fill="#c05a5a" />
      <rect x="24" y="48" width="72" height="44" fill="#f7ecd8" />
      <g fill="#7fb2d9">
        <rect x="32" y="56" width="14" height="14" />
        <rect x="54" y="56" width="14" height="14" />
        <rect x="76" y="56" width="14" height="14" />
      </g>
      <rect x="52" y="74" width="20" height="18" fill="#8a5a32" />
    </>
  ),
  clock: () => (
    <>
      <circle cx="60" cy="62" r="30" fill="#f7fbff" stroke="#8a5a32" strokeWidth="5" />
      <path d="M60 62V44M60 62l14 8" stroke="#2f2f38" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 26l-4-8h24l-4 8z" fill="#8a5a32" />
    </>
  ),
  umbrella: () => (
    <>
      <path d="M20 62c0-22 18-38 40-38s40 16 40 38z" fill="#e8443f" />
      <path d="M20 62c8 8 14-4 20 0s12-4 20 0 14-4 20 0 12-4 20 0" stroke="#fff" strokeWidth="4" fill="none" />
      <path d="M60 62v30c0 8-8 8-8 0" stroke="#8a5a32" strokeWidth="5" fill="none" />
    </>
  ),
  kite: () => (
    <>
      <path d="M60 22l30 26-30 26-30-26z" fill="#7fb2d9" />
      <path d="M60 22v52M30 48h60" stroke="#fff" strokeWidth="3" />
      <path d="M60 74c0 12-14 14-20 22" stroke="#8a5a32" strokeWidth="3" fill="none" />
      <path d="M40 96c4-6 8-4 12-8" stroke="#e8443f" strokeWidth="4" fill="none" />
    </>
  ),
  football: () => (
    <>
      <circle cx="60" cy="62" r="30" fill="#f7fbff" stroke="#2f2f38" strokeWidth="4" />
      <path d="M60 40l14 10-5 17h-18l-5-17z" fill="#2f2f38" />
      <g stroke="#2f2f38" strokeWidth="4">
        <path d="M60 40v34M45 50l30 24M75 50L45 74" />
      </g>
    </>
  ),

  /* ------------------------------- clothes ------------------------------ */
  hat: () => (
    <>
      <ellipse cx="60" cy="80" rx="40" ry="12" fill="#8a5a32" />
      <path d="M34 78V52c0-16 12-26 26-26s26 10 26 26v26z" fill="#a9714b" />
      <path d="M32 66h56v10H32z" fill="#5b8fd9" />
    </>
  ),
  shirt: () => (
    <>
      <path d="M42 34l18 12 18-12 18 10-8 14-6-4v44H38V54l-6 4-8-14z" fill="#7fb2d9" />
      <path d="M60 46v14l-8 4 8 40 8-40-8-4z" fill="#5b8fd9" />
    </>
  ),
  shoes: () => (
    <>
      <path d="M22 84c0-10 10-16 20-16 10 0 12 8 22 8 12 0 16-10 30-10 8 0 12 6 12 14v8H22z" fill="#2f2f38" />
      <path d="M42 68c0 8 4 12 4 16M72 66c0 8 4 12 4 16" stroke="#f7fbff" strokeWidth="4" fill="none" />
    </>
  ),
  socks: () => (
    <>
      <path d="M46 34h24v34c0 12 10 14 16 20-8 6-26 4-32-4-6-8-8-16-8-24z" fill="#f7b8c8" />
      <path d="M46 34h24v10H46z" fill="#fff2f5" />
    </>
  ),
  coat: () => (
    <>
      <path d="M42 34l18 10 18-10 16 10-6 16-8-4v44H40V56l-8 4-6-16z" fill="#8a5a32" />
      <path d="M60 44v66" stroke="#5c3a22" strokeWidth="4" />
      <circle cx="52" cy="62" r="3" fill="#ffd23f" />
      <circle cx="52" cy="76" r="3" fill="#ffd23f" />
    </>
  ),
  dress: () => (
    <>
      <path d="M44 34h32l8 12-8 6v48H44V52l-8-6z" fill="#f26d8a" />
      <path d="M52 34q8 8 16 0" stroke="#fff" strokeWidth="4" fill="none" />
      <path d="M44 68h32" stroke="#fff2f5" strokeWidth="5" />
    </>
  ),

  /* ------------------------------ transport ----------------------------- */
  car: () => (
    <>
      <path d="M16 78v-12l10-4 12-18h48l12 18 12 4v12z" fill="#e8443f" />
      <path d="M44 44h36v18H44z" fill="#7fd1f5" />
      <circle cx="38" cy="80" r="10" fill="#2f2f38" />
      <circle cx="86" cy="80" r="10" fill="#2f2f38" />
    </>
  ),
  bus: () => (
    <>
      <rect x="18" y="34" width="88" height="50" rx="8" fill="#ffd23f" />
      <g fill="#7fd1f5">
        <rect x="26" y="44" width="30" height="18" rx="3" />
        <rect x="64" y="44" width="30" height="18" rx="3" />
      </g>
      <circle cx="38" cy="88" r="9" fill="#2f2f38" />
      <circle cx="86" cy="88" r="9" fill="#2f2f38" />
    </>
  ),
  train: () => (
    <>
      <rect x="24" y="30" width="72" height="50" rx="10" fill="#5b8fd9" />
      <rect x="34" y="40" width="24" height="18" rx="3" fill="#cfe6f7" />
      <rect x="66" y="40" width="20" height="18" rx="3" fill="#cfe6f7" />
      <path d="M24 80h72l8 12H16z" fill="#3f5fd0" />
      <circle cx="40" cy="96" r="7" fill="#2f2f38" />
      <circle cx="82" cy="96" r="7" fill="#2f2f38" />
    </>
  ),
  ferry: () => (
    <>
      <path d="M18 70h88l-10 22H28z" fill="#f7fbff" stroke="#5b8fd9" strokeWidth="4" />
      <rect x="40" y="48" width="44" height="22" rx="4" fill="#e8443f" />
      <path d="M60 48V30" stroke="#2f2f38" strokeWidth="4" />
      <path d="M60 32l18 6-18 6z" fill="#ffd23f" />
      <path d="M14 96c12 6 24 6 36 0s24-6 36 0 16 4 22 0" stroke="#5bc0de" strokeWidth="5" fill="none" />
    </>
  ),
  tram: () => (
    <>
      <rect x="22" y="28" width="80" height="56" rx="8" fill="#a9714b" />
      <g fill="#cfe6f7">
        <rect x="30" y="38" width="28" height="18" rx="3" />
        <rect x="66" y="38" width="28" height="18" rx="3" />
      </g>
      <path d="M22 62h80" stroke="#8a5a32" strokeWidth="5" />
      <path d="M60 28V14M40 20h40" stroke="#2f2f38" strokeWidth="4" />
      <path d="M24 84h76l-8 12H32z" fill="#8a5a32" />
    </>
  ),
  rocket: () => (
    <>
      <path d="M60 16c14 14 20 32 20 48H40c0-16 6-34 20-48z" fill="#f7fbff" stroke="#c05a5a" strokeWidth="4" />
      <circle cx="60" cy="52" r="10" fill="#7fd1f5" />
      <path d="M40 64l-16 22 16-6zM80 64l16 22-16-6z" fill="#c05a5a" />
      <path d="M52 86h16l-8 20z" fill="#ffb03b" />
    </>
  ),
  robot: () => (
    <>
      <rect x="34" y="32" width="52" height="40" rx="10" fill="#b0c4d6" />
      <circle cx="50" cy="50" r="6" fill="#2f3350" />
      <circle cx="70" cy="50" r="6" fill="#2f3350" />
      <path d="M48 62h24" stroke="#2f3350" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 32V20" stroke="#9fb6c9" strokeWidth="4" />
      <circle cx="60" cy="18" r="5" fill="#e8443f" />
      <rect x="40" y="72" width="40" height="26" rx="6" fill="#7f8c9b" />
    </>
  ),
  computer: () => (
    <>
      <rect x="22" y="30" width="80" height="50" rx="6" fill="#2f3350" />
      <rect x="30" y="38" width="64" height="34" rx="3" fill="#7fd1f5" />
      <path d="M50 80h24l8 14H42z" fill="#9fb6c9" />
      <path d="M34 94h56" stroke="#7f8c9b" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  passport: () => (
    <>
      <rect x="34" y="24" width="56" height="76" rx="8" fill="#3f5fd0" />
      <circle cx="62" cy="52" r="18" fill="#f7fbff" />
      <circle cx="62" cy="52" r="12" fill="#cfe6f7" />
      <path d="M46 80h32M46 90h22" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </>
  ),

  /* ------------------------------- objects ------------------------------ */
  money: () => (
    <>
      <rect x="24" y="40" width="76" height="44" rx="6" fill="#7fc44c" />
      <circle cx="62" cy="62" r="16" fill="#f7fbff" />
      <text x="62" y="70" fontSize="22" textAnchor="middle" fill="#4c9a4c" fontWeight="bold">$</text>
    </>
  ),
  present: () => (
    <>
      <rect x="26" y="52" width="72" height="48" rx="6" fill="#c05a5a" />
      <rect x="22" y="42" width="80" height="14" rx="4" fill="#e8443f" />
      <path d="M62 42v58" stroke="#ffd23f" strokeWidth="7" />
      <path d="M62 42c-10-14-24-12-22 0 10 2 16-2 22 0zM62 42c10-14 24-12 22 0-10 2-16-2-22 0z" fill="#ffd23f" />
    </>
  ),
  candle: () => (
    <>
      <rect x="50" y="46" width="24" height="46" rx="4" fill="#fff2f5" />
      <path d="M62 46c0-10 10-12 10-22-10 0-12 10-10 22z" fill="#ffb03b" />
      <path d="M62 40c0-8 6-10 6-16-6 0-8 8-6 16z" fill="#ffd23f" />
      <path d="M46 92h36" stroke="#cfd9e2" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  lantern: () => (
    <>
      <path d="M60 20v10" stroke="#8a5a32" strokeWidth="4" />
      <ellipse cx="60" cy="60" rx="30" ry="26" fill="#e8443f" />
      <path d="M60 34v52" stroke="#ffd23f" strokeWidth="4" />
      <path d="M42 44c8 6 8 26 0 32M78 44c-8 6-8 26 0 32" stroke="#ffd23f" strokeWidth="3" fill="none" />
      <path d="M46 86h28v8H46z" fill="#ffd23f" />
      <path d="M50 94l4 10M70 94l-4 10" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  flag: () => (
    <>
      <path d="M34 24v72" stroke="#8a5a32" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 30h56l-14 16 14 16H36z" fill="#e8443f" />
      <path d="M22 96h84" stroke="#7f8c9b" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  medal: () => (
    <>
      <path d="M40 24l-8 30M84 24l8 30" stroke="#c05a5a" strokeWidth="6" />
      <circle cx="62" cy="70" r="24" fill="#ffd23f" />
      <circle cx="62" cy="70" r="16" fill="#f7c93f" />
      <path d="M62 60l4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" fill="#fff" />
    </>
  ),
  magnet: () => (
    <>
      <path d="M32 84V56a30 30 0 0 1 60 0v28h-16V56a14 14 0 0 0-28 0v28z" fill="#c05a5a" />
      <rect x="32" y="70" width="16" height="20" fill="#f7fbff" />
      <rect x="76" y="70" width="16" height="20" fill="#f7fbff" />
    </>
  ),
  bulb: () => (
    <>
      <circle cx="60" cy="54" r="26" fill="#ffd23f" />
      <path d="M50 78h20v10H50z" fill="#cfd9e2" />
      <path d="M52 88h16v6H52z" fill="#9fb6c9" />
      <path d="M52 60c4 6 12 6 16 0" stroke="#a3701c" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g stroke="#ffb03b" strokeWidth="4" strokeLinecap="round">
        <path d="M60 18v-8M28 54h-8M100 54h-8M34 30l-6-6M86 30l6-6" />
      </g>
    </>
  ),
  battery: () => (
    <>
      <rect x="26" y="44" width="68" height="38" rx="6" fill="#4c9a4c" />
      <rect x="94" y="56" width="10" height="14" rx="3" fill="#7f8c9b" />
      <rect x="34" y="52" width="24" height="22" rx="3" fill="#ffd23f" />
      <path d="M70 52l10 22M78 52l-10 22" stroke="#fff" strokeWidth="5" />
    </>
  ),
  telescope: () => (
    <>
      <path d="M22 78l58-34 10 16-58 34z" fill="#3f5fd0" />
      <path d="M80 44l16-10 6 10-16 10z" fill="#5b8fd9" />
      <path d="M40 82l-6 20M30 100h28" stroke="#7f8c9b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="86" cy="34" r="6" fill="#7fd1f5" />
    </>
  ),
  satellite: () => (
    <>
      <rect x="48" y="48" width="28" height="28" rx="4" fill="#b0c4d6" />
      <path d="M48 62H20v-8h28zM76 62h24v-8H76z" fill="#7f8c9b" />
      <path d="M34 54v16h-8V54zM102 54v16h-8V54z" fill="#5b8fd9" />
      <path d="M62 48V28" stroke="#9fb6c9" strokeWidth="4" />
      <circle cx="62" cy="24" r="5" fill="#e8443f" />
    </>
  ),
  planet: () => (
    <>
      <circle cx="60" cy="58" r="26" fill="#c98a4b" />
      <ellipse cx="60" cy="58" rx="42" ry="12" fill="none" stroke="#7fb2d9" strokeWidth="6" transform="rotate(-18 60 58)" />
      <circle cx="48" cy="50" r="6" fill="#a86a34" />
      <circle cx="70" cy="66" r="5" fill="#a86a34" />
    </>
  ),
  bin: () => (
    <>
      <path d="M36 36h48l-6 56H42z" fill="#5b8fd9" />
      <path d="M30 30h60v8H30z" fill="#3f5fd0" />
      <path d="M52 24h16v6H52z" fill="#3f5fd0" />
      <path d="M50 50v28M62 50v28M74 50v28" stroke="#cfe6f7" strokeWidth="4" />
    </>
  ),
  fire: () => (
    <>
      <path d="M60 20c14 14 22 24 22 38a22 22 0 1 1-44 0c0-10 6-16 10-22 2 8 8 10 10 4 2-8-2-14 2-20z" fill="#ffb03b" />
      <path d="M60 46c8 8 10 14 10 20a10 10 0 1 1-20 0c0-6 4-14 10-20z" fill="#ffd23f" />
    </>
  ),

  /* ------------------------------- people ------------------------------- */
  doctor: () => (
    <>
      <circle cx="60" cy="40" r="18" fill="#ffe0c2" />
      <path d="M42 38c0-12 8-18 18-18s18 6 18 18v4H42z" fill="#f7fbff" />
      <path d="M60 28v-6M52 22h16" stroke="#5b8fd9" strokeWidth="4" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
      <path d="M52 72h16v10H52z" fill="#fff" stroke="#e8443f" strokeWidth="3" />
      <path d="M60 74v6M57 77h6" stroke="#e8443f" strokeWidth="3" />
    </>
  ),
  nurse: () => (
    <>
      <circle cx="60" cy="40" r="18" fill="#ffe0c2" />
      <path d="M42 40c0-14 8-20 18-20s18 6 18 20z" fill="#f7b8c8" />
      <path d="M52 26l8 6 8-6" stroke="#fff" strokeWidth="4" fill="none" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#fff2f5" stroke="#f7b8c8" strokeWidth="3" />
      <path d="M56 72h8v10h-8z" fill="#e8443f" />
      <path d="M52 76h16" stroke="#e8443f" strokeWidth="4" />
    </>
  ),
  teacher: () => (
    <>
      <circle cx="60" cy="38" r="17" fill="#ffe0c2" />
      <path d="M43 36c0-12 8-16 17-16s17 4 17 16v4H43z" fill="#6b4a2f" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#5b8fd9" />
      <rect x="72" y="72" width="18" height="24" rx="3" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
      <path d="M48 76l12 8" stroke="#fff" strokeWidth="4" />
    </>
  ),
  fireman: () => (
    <>
      <circle cx="60" cy="38" r="17" fill="#ffe0c2" />
      <path d="M40 40c0-14 10-20 20-20s20 6 20 20v6H40z" fill="#e8443f" />
      <path d="M40 52l20-8 20 8" stroke="#ffd23f" strokeWidth="5" fill="none" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#ffd23f" />
      <path d="M44 78h32v10H44z" fill="#f7fbff" />
    </>
  ),
  policeman: () => (
    <>
      <circle cx="60" cy="38" r="17" fill="#ffe0c2" />
      <path d="M42 38c0-12 8-18 18-18s18 6 18 18v4H42z" fill="#2f3350" />
      <path d="M50 24h20" stroke="#ffd23f" strokeWidth="4" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#3f5fd0" />
      <path d="M52 74l8 8 8-8-4-4h-8z" fill="#ffd23f" />
    </>
  ),
  driver: () => (
    <>
      <circle cx="60" cy="38" r="17" fill="#ffe0c2" />
      <path d="M42 36c0-12 8-18 18-18s18 6 18 18v6H42z" fill="#7f8c9b" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#5b8fd9" />
      <path d="M44 78c8-6 24-6 32 0" stroke="#cfe6f7" strokeWidth="5" fill="none" />
    </>
  ),
  cook: () => (
    <>
      <circle cx="60" cy="40" r="17" fill="#ffe0c2" />
      <path d="M40 34c6-14 34-14 40 0 0 4-4 4-4 8H44c0-4-4-4-4-8z" fill="#f7fbff" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#f7fbff" stroke="#cfd9e2" strokeWidth="3" />
      <path d="M78 66l14-6" stroke="#cfd9e2" strokeWidth="5" />
      <path d="M84 58c6-8 16-6 16 2 0 6-10 8-16 2z" fill="#ffd23f" />
    </>
  ),
  cleaner: () => (
    <>
      <circle cx="60" cy="38" r="17" fill="#ffe0c2" />
      <path d="M43 34c4-12 30-12 34 0 2 2 0 6-4 8H47c-4-2-6-6-4-8z" fill="#7fc44c" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#7fc44c" />
      <path d="M84 96l-8-44" stroke="#a9714b" strokeWidth="6" strokeLinecap="round" />
      <path d="M76 52l16 6-16 6z" fill="#cfd9e2" />
    </>
  ),
  postman: () => (
    <>
      <circle cx="60" cy="38" r="17" fill="#ffe0c2" />
      <path d="M42 36c0-12 8-18 18-18s18 6 18 18v4H42z" fill="#5b8fd9" />
      <path d="M40 40h40" stroke="#ffd23f" strokeWidth="5" />
      <path d="M34 96c0-18 12-32 26-32s26 14 26 32z" fill="#5b8fd9" />
      <rect x="74" y="70" width="20" height="16" rx="3" fill="#c98a4b" />
      <path d="M74 78h20" stroke="#8a5a32" strokeWidth="3" />
    </>
  ),
  eye: () => (
    <>
      <path d="M16 62c14-20 32-30 46-30s32 10 46 30c-14 20-32 30-46 30S30 82 16 62z" fill="#f7fbff" stroke="#8a5a32" strokeWidth="4" />
      <circle cx="62" cy="62" r="16" fill="#7fb2d9" />
      <circle cx="62" cy="62" r="8" fill="#2f2f38" />
      <circle cx="57" cy="57" r="3" fill="#fff" />
    </>
  ),
  ear: () => (
    <>
      <path d="M48 88c-14 0-22-10-22-24 0-16 12-28 26-28 12 0 20 8 20 18 0 8-6 12-12 12-6 0-10-4-10-8" stroke="#ffe0c2" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M62 58c8-4 12 2 10 10" stroke="#f0c9a8" strokeWidth="6" fill="none" strokeLinecap="round" />
    </>
  ),
  nose: () => (
    <>
      <path d="M62 26c-8 16-14 26-14 38 0 10 8 16 16 16 8 0 12-6 12-12 0-8-8-10-14-14" stroke="#ffe0c2" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="66" r="4" fill="#e0a78f" />
      <circle cx="74" cy="66" r="4" fill="#e0a78f" />
    </>
  ),
  mouth: () => (
    <>
      <path d="M28 54c8 18 20 30 34 30s26-12 34-30c-10 6-22 10-34 10S38 60 28 54z" fill="#c05a5a" />
      <path d="M40 68c8 6 14 8 22 8s14-2 22-8c-8 12-14 16-22 16s-14-4-22-16z" fill="#f7b8c8" />
    </>
  ),
  hand: () => (
    <>
      <path d="M40 96V60c0-8 6-14 12-14s10 6 10 12V44c0-6 4-10 8-10s8 4 8 10v14c0-6 4-10 8-10s8 4 8 10v34z" fill="#ffe0c2" stroke="#f0c9a8" strokeWidth="3" />
      <path d="M44 62v10M56 48v14M68 52v10" stroke="#f0c9a8" strokeWidth="3" />
    </>
  ),
  foot: () => (
    <>
      <path d="M40 30c14 0 22 12 22 26 0 10-4 18-10 24H34c-4-10-8-20-8-32 0-10 6-18 14-18z" fill="#ffe0c2" stroke="#f0c9a8" strokeWidth="3" />
      <g fill="#f0c9a8">
        <circle cx="36" cy="38" r="4" />
        <circle cx="48" cy="34" r="4" />
        <circle cx="60" cy="34" r="4" />
      </g>
    </>
  ),
  head: () => (
    <>
      <circle cx="60" cy="52" r="30" fill="#ffe0c2" />
      <circle cx="50" cy="48" r="4" fill="#2b2b2b" />
      <circle cx="70" cy="48" r="4" fill="#2b2b2b" />
      <path d="M52 66q8 7 16 0" stroke="#c05a5a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M30 82h60v14H30z" fill="#7fb2d9" />
    </>
  ),
  hair: () => (
    <>
      <path d="M30 84c0-30 14-48 30-48s30 18 30 48c0 6-2 8-6 8H36c-4 0-6-2-6-8z" fill="#6b4a2f" />
      <path d="M40 40c8-6 10-16 6-24 10 4 12 14 10 22" stroke="#8a5a32" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M74 44c8-6 12-14 10-22-10 2-14 10-14 18" stroke="#8a5a32" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),

  /* -------------------------- shapes and colours ------------------------ */
  circle: () => <circle cx="60" cy="60" r="32" fill="#ffd23f" stroke="#a3701c" strokeWidth="4" />,
  square: () => <rect x="28" y="28" width="64" height="64" rx="6" fill="#7fb2d9" stroke="#3f5fd0" strokeWidth="4" />,
  triangle: () => <path d="M60 24l34 62H26z" fill="#7fc44c" stroke="#4c9a4c" strokeWidth="4" />,
  red: () => <circle cx="60" cy="60" r="34" fill="#e8443f" stroke="#a32b28" strokeWidth="4" />,
  blue: () => <circle cx="60" cy="60" r="34" fill="#5b8fd9" stroke="#2f5fa8" strokeWidth="4" />,
  yellow: () => <circle cx="60" cy="60" r="34" fill="#ffd23f" stroke="#c9a227" strokeWidth="4" />,
  green: () => <circle cx="60" cy="60" r="34" fill="#4c9a4c" stroke="#2f6b2f" strokeWidth="4" />,
  orange: () => <circle cx="60" cy="60" r="34" fill="#ff9f43" stroke="#c97a1c" strokeWidth="4" />,
  black: () => <circle cx="60" cy="60" r="34" fill="#2f2f38" stroke="#111" strokeWidth="4" />,

  /* ------------------------------ actions ------------------------------- */
  run: () => (
    <>
      <circle cx="60" cy="26" r="12" fill="#ffe0c2" />
      <path d="M60 38l-14 22 12 18M60 38l16 18-6 22M46 60l-14 12M76 56l14 10" stroke="#3f5fd0" strokeWidth="8" fill="none" strokeLinecap="round" />
    </>
  ),
  swim: () => (
    <>
      <circle cx="42" cy="34" r="11" fill="#ffe0c2" />
      <path d="M53 40l34 12-12 10-34-12z" fill="#3f5fd0" />
      <path d="M40 46l-16 12M62 52l-16 16" stroke="#ffe0c2" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M14 74c10 6 18-4 28 2s18-6 28 0 18-4 26 2" stroke="#5bc0de" strokeWidth="6" fill="none" />
    </>
  ),
  sing: () => (
    <>
      <circle cx="46" cy="34" r="13" fill="#ffe0c2" />
      <path d="M46 47c0 14 8 22 10 26H32c2-6 14-12 14-26z" fill="#f26d8a" />
      <path d="M62 30l4-10h20v8h-8v22h-8V36h-8z" fill="#2f2f38" />
      <path d="M88 34c6 4 10 8 10 14" stroke="#ffd23f" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  read: () => (
    <>
      <path d="M18 40h34c6 0 8 4 8 8v44c0-4-2-6-8-6H18z" fill="#5b8fd9" />
      <path d="M102 40H68c-6 0-8 4-8 8v44c0-4 2-6 8-6h34z" fill="#7fb2d9" />
      <circle cx="44" cy="66" r="5" fill="#fff" />
      <circle cx="86" cy="66" r="5" fill="#fff" />
    </>
  ),
  write: () => (
    <>
      <path d="M30 90l4-14 40-40 12 12-40 40z" fill="#ffd23f" />
      <path d="M30 90l4-14 8 8z" fill="#f7fbff" />
      <path d="M74 36l12 12 8-8-12-12z" fill="#e8443f" />
      <path d="M20 96h84" stroke="#cfd9e2" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  jump: () => (
    <>
      <circle cx="58" cy="26" r="12" fill="#ffe0c2" />
      <path d="M58 38l-8 20 10 14M58 38l10 18-4 16M50 58l-12 6M68 56l12 8" stroke="#7fc44c" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M20 96c14-8 30-8 44 0s24 4 36-4" stroke="#a9714b" strokeWidth="6" fill="none" />
    </>
  ),
  paint: () => (
    <>
      <path d="M26 88l4-16 36-36 12 12-36 36z" fill="#f26d8a" />
      <path d="M74 36l12 12 8-8-12-12z" fill="#8a5a32" />
      <path d="M20 92c14 8 26-6 40 0s26 6 40-4v10H20z" fill="#ffd23f" />
    </>
  ),
  music: () => (
    <>
      <path d="M40 78V34l44-10v44" stroke="#2f2f38" strokeWidth="5" fill="none" />
      <ellipse cx="32" cy="80" rx="12" ry="10" fill="#2f2f38" />
      <ellipse cx="76" cy="70" rx="12" ry="10" fill="#2f2f38" />
      <path d="M40 46l44-10" stroke="#2f2f38" strokeWidth="5" />
    </>
  ),
};

const PALETTE = [
  ["#ffd9a8", "#e8a05c"],
  ["#cfe6f7", "#5b8fd9"],
  ["#d9f0d3", "#5cae5c"],
  ["#ffe1ec", "#f26d8a"],
  ["#e7e0f7", "#8a76c9"],
];

export function WordArt({
  word,
  size = 150,
  className = "",
}: {
  word: string;
  size?: number;
  className?: string;
}) {
  const key = word.toLowerCase().replace(/[^a-z ]/g, "").trim();
  const Icon = ICONS[key] ?? ICONS[key.split(" ")[0]] ?? null;
  const [c1, c2] = PALETTE[key.charCodeAt(0) % PALETTE.length];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={word}
    >
      <rect x="0" y="0" width="120" height="120" rx="26" fill={c1} />
      <circle cx="100" cy="20" r="42" fill={c2} opacity="0.35" />
      {Icon ? (
        <g>{Icon()}</g>
      ) : (
        <g>
          <text
            x="60"
            y="62"
            textAnchor="middle"
            fontSize="46"
            fontWeight="700"
            fill={c2}
            fontFamily="Momo Trust Sans, Comic Sans MS, cursive"
          >
            {word.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase()}
          </text>
          <g stroke={c2} strokeWidth="5" strokeLinecap="round">
            {Array.from({ length: Math.min(word.replace(/[^A-Za-z]/g, "").length, 9) }).map(
              (_, i) => (
                <path
                  key={i}
                  d={`M ${22 + i * 10} 88 h 6`}
                  opacity={i === 0 ? 1 : 0.65}
                />
              )
            )}
          </g>
        </g>
      )}
    </svg>
  );
}

export function hasArt(word: string) {
  const key = word.toLowerCase().replace(/[^a-z ]/g, "").trim();
  return Boolean(ICONS[key] ?? ICONS[key.split(" ")[0]]);
}
