"use client";

import type { AvatarId } from "@/lib/store";

/**
 * Ten-plus hand-drawn avatar characters.
 * Every character is drawn with SVG shapes — no emoji fonts are used.
 */

type Props = {
  id: AvatarId;
  size?: number;
  className?: string;
  ring?: string;
};

export default function Avatar({ id, size = 64, className = "", ring }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={id}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill={bgFor(id)} />
      <g clipPath={`url(#clip-${id})`}>{face(id)}</g>
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke={ring ?? "rgba(255,255,255,0.75)"}
        strokeWidth="3"
      />
    </svg>
  );
}

function bgFor(id: AvatarId) {
  switch (id) {
    case "chicken":
      return "#fff3d0";
    case "cow":
      return "#f6f1e6";
    case "dog":
      return "#f3e2cd";
    case "cat":
      return "#ffe6cf";
    case "sheep":
      return "#eaf1f6";
    case "boy":
      return "#ffe9d6";
    case "girl":
      return "#ffe1ec";
    case "heroine":
      return "#e7ecff";
    case "hero":
      return "#dceaf8";
    case "moon":
      return "#2f3350";
    case "snowman":
      return "#e6f2fb";
    default:
      return "#f2ead9";
  }
}

function eyes(x1: number, x2: number, y: number, r = 4.2, colour = "#2b2b2b") {
  return (
    <>
      <circle cx={x1} cy={y} r={r} fill={colour} />
      <circle cx={x2} cy={y} r={r} fill={colour} />
      <circle cx={x1 + 1.4} cy={y - 1.4} r={1.3} fill="#fff" opacity="0.9" />
      <circle cx={x2 + 1.4} cy={y - 1.4} r={1.3} fill="#fff" opacity="0.9" />
    </>
  );
}

function smile(y = 66, w = 16, colour = "#3b2f26") {
  return (
    <path
      d={`M ${50 - w} ${y} Q 50 ${y + 11} ${50 + w} ${y}`}
      stroke={colour}
      strokeWidth="3.4"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function face(id: AvatarId) {
  switch (id) {
    /* ------------------------------ chicken ------------------------------ */
    case "chicken":
      return (
        <>
          <path d="M32 30 l6 -14 l12 8 z" fill="#e2584d" />
          <path d="M50 30 l4 -12 l10 10 z" fill="#e2584d" />
          <circle cx="50" cy="56" r="28" fill="#ffd23f" />
          <path d="M50 44 l16 8 l-16 8 z" fill="#f39c12" />
          <circle cx="41" cy="52" r="4" fill="#2b2b2b" />
          <circle cx="59" cy="52" r="4" fill="#2b2b2b" />
          <path d="M34 74 q16 10 32 0" stroke="#e0a400" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    /* -------------------------------- cow -------------------------------- */
    case "cow":
      return (
        <>
          <path d="M28 34 q-8 -14 4 -16 q6 6 10 12 z" fill="#c9b79a" />
          <path d="M72 34 q8 -14 -4 -16 q-6 6 -10 12 z" fill="#c9b79a" />
          <circle cx="50" cy="56" r="27" fill="#fdfcf8" />
          <path d="M26 46 q10 -10 18 -2 q-8 10 -18 6 z" fill="#3b3b3b" />
          <path d="M72 66 q10 -8 4 -16 q-10 2 -8 12 z" fill="#3b3b3b" />
          <ellipse cx="50" cy="66" rx="15" ry="11" fill="#f7c9cb" />
          <circle cx="45" cy="65" r="2.4" fill="#b5717a" />
          <circle cx="55" cy="65" r="2.4" fill="#b5717a" />
          <circle cx="41" cy="50" r="3.6" fill="#2b2b2b" />
          <circle cx="59" cy="50" r="3.6" fill="#2b2b2b" />
        </>
      );
    /* -------------------------------- dog -------------------------------- */
    case "dog":
      return (
        <>
          <ellipse cx="26" cy="52" rx="11" ry="20" fill="#8a5a32" />
          <ellipse cx="74" cy="52" rx="11" ry="20" fill="#8a5a32" />
          <circle cx="50" cy="54" r="27" fill="#c98a4b" />
          <ellipse cx="50" cy="66" rx="17" ry="13" fill="#f0d3ad" />
          <ellipse cx="50" cy="60" rx="6.5" ry="5" fill="#2f2a26" />
          <path d="M50 65 v6" stroke="#2f2a26" strokeWidth="2.6" />
          <path d="M44 72 q6 6 12 0" stroke="#2f2a26" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M50 72 q-3 8 1 10 q5 -1 4 -8 z" fill="#e8727f" />
          {eyes(40, 60, 48)}
        </>
      );
    /* -------------------------------- cat -------------------------------- */
    case "cat":
      return (
        <>
          <path d="M26 34 l-2 -18 l18 10 z" fill="#f0955c" />
          <path d="M74 34 l2 -18 l-18 10 z" fill="#f0955c" />
          <circle cx="50" cy="56" r="27" fill="#f7ab72" />
          <path d="M50 40 l4 6 l-8 0 z" fill="#e08b56" />
          {eyes(40, 60, 52, 4.6)}
          <path d="M50 62 l-4 4 h8 z" fill="#e0705f" />
          <path d="M50 66 q-5 6 -11 3" stroke="#7a4a2a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M50 66 q5 6 11 3" stroke="#7a4a2a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M28 58 h12" stroke="#7a4a2a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M60 58 h12" stroke="#7a4a2a" strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    /* ------------------------------- sheep ------------------------------- */
    case "sheep":
      return (
        <>
          <circle cx="28" cy="44" r="14" fill="#fbfdff" />
          <circle cx="72" cy="44" r="14" fill="#fbfdff" />
          <circle cx="34" cy="66" r="14" fill="#fbfdff" />
          <circle cx="66" cy="66" r="14" fill="#fbfdff" />
          <circle cx="50" cy="40" r="12" fill="#fbfdff" />
          <ellipse cx="50" cy="60" rx="18" ry="18" fill="#4a4a55" />
          <path d="M32 44 q6 -12 12 -3 q-8 8 -12 3 z" fill="#5b5b68" />
          <path d="M68 44 q-6 -12 -12 -3 q8 8 12 3 z" fill="#5b5b68" />
          {eyes(43, 57, 58, 3.6, "#fff")}
          <path d="M46 68 q4 4 8 0" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      );
    /* -------------------------------- boy -------------------------------- */
    case "boy":
      return (
        <>
          <path d="M50 18 c16 0 22 12 22 22 c0 8 -4 10 -4 10 h-36 s-4 -2 -4 -10 c0 -10 6 -22 22 -22 z" fill="#6b4a2f" />
          <circle cx="50" cy="56" r="27" fill="#ffd9b3" />
          <path d="M24 46 q10 -8 18 -2" stroke="#6b4a2f" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M76 46 q-10 -8 -18 -2" stroke="#6b4a2f" strokeWidth="4" fill="none" strokeLinecap="round" />
          {eyes(40, 60, 54)}
          {smile(68, 13)}
          <path d="M32 84 q18 12 36 0 l0 16 h-36 z" fill="#7fb2d9" />
        </>
      );
    /* -------------------------------- girl ------------------------------- */
    case "girl":
      return (
        <>
          <path d="M28 60 q-8 -40 22 -40 q30 0 22 40 q-4 8 -8 8 h-28 q-4 0 -8 -8 z" fill="#a9714b" />
          <path d="M28 56 q-8 22 2 30 q4 -22 8 -26 z" fill="#a9714b" />
          <path d="M72 56 q8 22 -2 30 q-4 -22 -8 -26 z" fill="#a9714b" />
          <circle cx="50" cy="58" r="25" fill="#ffe0c2" />
          {eyes(41, 59, 56, 4.4)}
          <path d="M44 68 q6 7 12 0" stroke="#c05a5a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="26" cy="34" r="8" fill="#f26d8a" />
          <circle cx="74" cy="34" r="8" fill="#f26d8a" />
          <path d="M32 84 q18 12 36 0 l0 16 h-36 z" fill="#f7a8c4" />
        </>
      );
    /* ------------------------------ heroine ------------------------------ */
    case "heroine":
      return (
        <>
          <path d="M50 14 c18 0 26 12 26 24 q0 8 -3 10 h-46 q-3 -2 -3 -10 c0 -12 8 -24 26 -24 z" fill="#ffd75e" />
          <circle cx="50" cy="56" r="26" fill="#ffe1c4" />
          <path d="M26 50 q24 -12 48 0 l0 -8 q-24 -12 -48 0 z" fill="#3f5fd0" />
          {eyes(41, 59, 54, 4.4, "#1f2a5a")}
          <path d="M44 68 q6 6 12 0" stroke="#c05a5a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M22 82 q28 14 56 0 l0 18 h-56 z" fill="#5b74e0" />
          <path d="M50 78 l4 8 l8 -2 l-6 6 l2 8 l-8 -5 l-8 5 l2 -8 l-6 -6 l8 2 z" fill="#ffd75e" />
        </>
      );
    /* -------------------------------- hero ------------------------------- */
    case "hero":
      return (
        <>
          <path d="M50 16 c16 0 22 12 22 22 c0 8 -4 10 -4 10 h-36 s-4 -2 -4 -10 c0 -10 6 -22 22 -22 z" fill="#2f2f38" />
          <path d="M46 24 q6 -8 12 0 q-6 6 -12 0 z" fill="#2f2f38" />
          <circle cx="50" cy="56" r="26" fill="#ffd9b3" />
          {eyes(40, 60, 54)}
          <path d="M44 68 q6 6 12 0" stroke="#3b2f26" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M22 82 q28 14 56 0 l0 18 h-56 z" fill="#2f6fd0" />
          <path d="M50 80 l3 7 l7 -1 l-5 5 l1 7 l-6 -4 l-6 4 l1 -7 l-5 -5 l7 1 z" fill="#f4d35e" />
          <path d="M24 84 q-6 12 2 16 q6 -10 -2 -16 z" fill="#d94b4b" />
          <path d="M76 84 q6 12 -2 16 q-6 -10 2 -16 z" fill="#d94b4b" />
        </>
      );
    /* -------------------------------- moon ------------------------------- */
    case "moon":
      return (
        <>
          <path
            d="M62 18 a34 34 0 1 0 0 64 a26 26 0 1 1 0 -64 z"
            fill="#ffe27a"
          />
          <circle cx="52" cy="46" r="4" fill="#c9a227" />
          <path d="M46 60 q8 8 16 0" stroke="#c9a227" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M30 22 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#fff" />
          <path d="M78 68 l1.6 5 l5 1.6 l-5 1.6 l-1.6 5 l-1.6 -5 l-5 -1.6 l5 -1.6 z" fill="#fff" />
          <circle cx="22" cy="72" r="2.6" fill="#fff" opacity="0.8" />
        </>
      );
    /* ------------------------------ snowman ------------------------------ */
    default:
      return (
        <>
          <circle cx="50" cy="70" r="24" fill="#fdfeff" />
          <circle cx="50" cy="40" r="17" fill="#fdfeff" />
          <path d="M28 32 h44 l-6 -12 h-32 z" fill="#4c5b78" />
          <path d="M24 32 h52 v6 h-52 z" fill="#333f57" />
          {eyes(44, 56, 38, 3.2)}
          <path d="M50 44 l14 4 l-14 4 z" fill="#f0913c" />
          <circle cx="44" cy="66" r="2.6" fill="#3c3c3c" />
          <circle cx="56" cy="66" r="2.6" fill="#3c3c3c" />
          <circle cx="50" cy="74" r="2.2" fill="#3c3c3c" />
          <path d="M44 80 q6 5 12 0" stroke="#3c3c3c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M24 62 l-8 -4 M76 62 l8 -4" stroke="#8a6a4a" strokeWidth="3" strokeLinecap="round" />
        </>
      );
  }
}
