"use client";

import type { AvatarId } from "@/lib/store";

/**
 * Eleven hand-drawn avatar characters.
 * Everything is SVG geometry — no emoji fonts are used anywhere.
 * Style: flat vector, soft palette, big glossy eyes, rosy cheeks.
 */

type Props = {
  id: AvatarId;
  size?: number;
  className?: string;
  ring?: string;
};

const DARK = "#33291f";

/* ------------------------------ helpers ------------------------------ */

function Eyes({ y = 52, gap = 12, r = 5.4, colour = DARK }: {
  y?: number;
  gap?: number;
  r?: number;
  colour?: string;
}) {
  return (
    <>
      <ellipse cx={50 - gap} cy={y} rx={r} ry={r * 1.1} fill={colour} />
      <ellipse cx={50 + gap} cy={y} rx={r} ry={r * 1.1} fill={colour} />
      <circle cx={50 - gap + r * 0.32} cy={y - r * 0.4} r={r * 0.34} fill="#fff" opacity="0.95" />
      <circle cx={50 + gap + r * 0.32} cy={y - r * 0.4} r={r * 0.34} fill="#fff" opacity="0.95" />
    </>
  );
}

function Blush({ y = 62, gap = 18 }: { y?: number; gap?: number }) {
  return (
    <>
      <ellipse cx={50 - gap} cy={y} rx="6.4" ry="3.9" fill="#ff7f95" opacity="0.38" />
      <ellipse cx={50 + gap} cy={y} rx="6.4" ry="3.9" fill="#ff7f95" opacity="0.38" />
    </>
  );
}

function Smile({ y = 64, w = 9, colour = DARK, width = 3 }: {
  y?: number;
  w?: number;
  colour?: string;
  width?: number;
}) {
  return (
    <path
      d={`M ${50 - w} ${y} Q 50 ${y + w * 0.95} ${50 + w} ${y}`}
      stroke={colour}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Ear({ x, y, rx, ry, fill, inner, rotate }: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  fill: string;
  inner: string;
  rotate: number;
}) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={fill} />
      <ellipse cx={x} cy={y} rx={rx * 0.55} ry={ry * 0.55} fill={inner} />
    </g>
  );
}

function Bg({ fill }: { fill: string }) {
  return <circle cx="50" cy="50" r="48" fill={fill} />;
}

function Body({ fill }: { fill: string }) {
  return <path d="M16 90 q34 -18 68 0 v14 H16 z" fill={fill} />;
}

function Star({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(x + Math.cos(a) * rad).toFixed(2)},${(y + Math.sin(a) * rad).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} />;
}

/* ------------------------------ characters ---------------------------- */

function face(id: AvatarId) {
  switch (id) {
    /* ------------------------------ chicken ---------------------------- */
    case "chicken":
      return (
        <>
          <g fill="#ff6b5b">
            <circle cx="42" cy="30" r="5.4" />
            <circle cx="50" cy="26" r="6" />
            <circle cx="58" cy="30" r="5.4" />
          </g>
          <circle cx="50" cy="57" r="27" fill="#ffd84d" />
          <path d="M50 43 q7 4 0 8" stroke="#f0b400" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M56 55 l16 5 l-16 6 z" fill="#ff9f1c" />
          <path d="M56 61 l16 5 l-11 3 z" fill="#f5820c" />
          {Eyes({ y: 51, gap: 11, r: 5.2 })}
          {Blush({ y: 60, gap: 17 })}
        </>
      );

    /* -------------------------------- cow ------------------------------ */
    case "cow":
      return (
        <>
          <path d="M31 30 q-3 -9 3 -9 q4 3 5 9 z" fill="#f2d3ae" />
          <path d="M69 30 q3 -9 -3 -9 q-4 3 -5 9 z" fill="#f2d3ae" />
          <Ear x={26} y={52} rx={9} ry={6.5} fill="#fffdf8" inner="#f7bcc4" rotate={-18} />
          <Ear x={74} y={52} rx={9} ry={6.5} fill="#fffdf8" inner="#f7bcc4" rotate={18} />
          <circle cx="50" cy="55" r="27" fill="#fffdf8" />
          <path d="M26 44 q11 -9 17 1 q-3 12 -12 12 q-9 -1 -5 -13 z" fill="#3f3a3a" />
          <path d="M74 68 q10 -10 3 -19 q-9 2 -11 13 q-1 8 8 6 z" fill="#3f3a3a" />
          <ellipse cx="50" cy="68" rx="15" ry="10.5" fill="#ffc9d2" />
          <ellipse cx="45" cy="67" rx="2.6" ry="3.2" fill="#c9707c" />
          <ellipse cx="55" cy="67" rx="2.6" ry="3.2" fill="#c9707c" />
          {Eyes({ y: 50, gap: 12, r: 5 })}
          {Blush({ y: 60, gap: 20 })}
        </>
      );

    /* -------------------------------- dog ------------------------------ */
    case "dog":
      return (
        <>
          <ellipse cx="25" cy="56" rx="10" ry="18" fill="#a9713b" transform="rotate(-10 25 56)" />
          <ellipse cx="75" cy="56" rx="10" ry="18" fill="#a9713b" transform="rotate(10 75 56)" />
          <circle cx="50" cy="55" r="27" fill="#dda15e" />
          <path d="M27 42 q10 -8 20 -3" stroke="#b97b45" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
          <ellipse cx="50" cy="67" rx="16" ry="11" fill="#fff3e0" />
          <ellipse cx="50" cy="60" rx="6.4" ry="4.6" fill="#3b2f28" />
          <path d="M50 64 v5" stroke="#3b2f28" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M43 68 q7 7 14 0" stroke="#3b2f28" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M50 71 q6 4 0 10 q-6 -5 0 -10 z" fill="#ff7b8a" />
          {Eyes({ y: 50, gap: 12, r: 5.4 })}
          {Blush({ y: 60, gap: 20 })}
        </>
      );

    /* -------------------------------- cat ------------------------------ */
    case "cat":
      return (
        <>
          <path d="M29 38 L27 17 L47 29 Z" fill="#f6a15c" />
          <path d="M31 34 L30 23 L42 30 Z" fill="#ffb9a0" />
          <path d="M71 38 L73 17 L53 29 Z" fill="#f6a15c" />
          <path d="M69 34 L70 23 L58 30 Z" fill="#ffb9a0" />
          <circle cx="50" cy="56" r="26" fill="#ffb877" />
          <path d="M50 60 l-4.5 4.5 h9 z" fill="#e8746a" />
          <path d="M50 65 q-5 6 -10 3" stroke="#a8642f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M50 65 q5 6 10 3" stroke="#a8642f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <g stroke="#a8642f" strokeWidth="1.9" strokeLinecap="round" opacity="0.85">
            <path d="M27 56 h12" />
            <path d="M26 63 h11" />
            <path d="M73 56 h-12" />
            <path d="M74 63 h-11" />
          </g>
          {Eyes({ y: 51, gap: 11.5, r: 5.6 })}
          {Blush({ y: 61, gap: 19 })}
        </>
      );

    /* ------------------------------- sheep ------------------------------ */
    case "sheep":
      return (
        <>
          <g fill="#ffffff">
            <circle cx="28" cy="46" r="14" />
            <circle cx="72" cy="46" r="14" />
            <circle cx="38" cy="70" r="13" />
            <circle cx="62" cy="70" r="13" />
            <circle cx="50" cy="36" r="15" />
            <circle cx="32" cy="28" r="9" />
            <circle cx="68" cy="28" r="9" />
          </g>
          <ellipse cx="50" cy="62" rx="17" ry="19" fill="#4e4a58" />
          <Ear x={31} y={62} rx={7} ry={5} fill="#5b5768" inner="#3f3b4a" rotate={-24} />
          <Ear x={69} y={62} rx={7} ry={5} fill="#5b5768" inner="#3f3b4a" rotate={24} />
          <path d="M35 48 q15 -10 30 0 q-4 -8 -15 -8 q-11 0 -15 8 z" fill="#ffffff" />
          <>
            <circle cx="44" cy="60" r="4.6" fill="#fff" />
            <circle cx="56" cy="60" r="4.6" fill="#fff" />
            <circle cx="44.6" cy="60.4" r="2.6" fill="#33291f" />
            <circle cx="56.6" cy="60.4" r="2.6" fill="#33291f" />
          </>
          <path d="M45 71 q5 4 10 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <ellipse cx="40" cy="68" rx="4.4" ry="2.8" fill="#ff7f95" opacity="0.35" />
          <ellipse cx="60" cy="68" rx="4.4" ry="2.8" fill="#ff7f95" opacity="0.35" />
        </>
      );

    /* -------------------------------- boy ------------------------------- */
    case "boy":
      return (
        <>
          <Body fill="#6fb3e0" />
          <path d="M23 54 q0 -32 27 -32 q27 0 27 32 q0 4 -3 4 q-7 -15 -24 -15 q-17 0 -24 15 q-3 0 -3 -4 z" fill="#6b4a2f" />
          <circle cx="50" cy="56" r="26" fill="#ffd7b0" />
          <path d="M27 46 q9 -11 22 -8 q5 -6 12 0 q-6 6 -6 12 q-9 -6 -17 -1 q-7 -2 -11 -3 z" fill="#6b4a2f" />
          <g stroke="#5a3c25" strokeWidth="2.6" strokeLinecap="round">
            <path d="M37 45 q5 -3 9 0" />
            <path d="M54 45 q5 -3 9 0" />
          </g>
          {Eyes({ y: 54, gap: 12, r: 5.2 })}
          {Blush({ y: 63, gap: 18 })}
          {Smile({ y: 66, w: 9 })}
        </>
      );

    /* -------------------------------- girl ------------------------------ */
    case "girl":
      return (
        <>
          <Body fill="#ff9fbf" />
          <ellipse cx="50" cy="56" rx="30" ry="30" fill="#a9714b" />
          <circle cx="50" cy="56" r="25" fill="#ffdcc0" />
          <path d="M25 48 q6 -18 25 -16 q19 -2 25 16 q-9 -6 -14 -8 q-14 5 -24 -2 q-7 3 -12 10 z" fill="#a9714b" />
          <circle cx="24" cy="37" r="7.5" fill="#ff7ba0" />
          <circle cx="76" cy="37" r="7.5" fill="#ff7ba0" />
          <circle cx="24" cy="37" r="3" fill="#ffd1de" />
          <circle cx="76" cy="37" r="3" fill="#ffd1de" />
          <g stroke="#8f5b39" strokeWidth="2.4" strokeLinecap="round">
            <path d="M38 46 q4 -3 8 0" />
            <path d="M54 46 q4 -3 8 0" />
          </g>
          {Eyes({ y: 55, gap: 11.5, r: 5.2 })}
          {Blush({ y: 64, gap: 17 })}
          <path d="M45 67 q5 5 10 0" stroke="#d2566e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </>
      );

    /* ------------------------------ heroine ----------------------------- */
    case "heroine":
      return (
        <>
          <Body fill="#5b74e0" />
          <Star x={50} y={82} r={8} fill="#ffd75e" />
          <ellipse cx="50" cy="53" rx="30" ry="30" fill="#ffd75e" />
          <circle cx="50" cy="56" r="25" fill="#ffdcc0" />
          <path d="M24 47 q26 -13 52 0 v13 q-26 -13 -52 0 z" fill="#3f5fd0" />
          <path d="M28 40 q10 -12 22 -10 q12 -2 22 10 q-10 -5 -22 -5 q-12 0 -22 5 z" fill="#ffd75e" />
          <>
            <ellipse cx="40" cy="53" rx="5.4" ry="5.8" fill="#fff" />
            <ellipse cx="60" cy="53" rx="5.4" ry="5.8" fill="#fff" />
            <circle cx="41" cy="53.5" r="2.6" fill="#20305f" />
            <circle cx="61" cy="53.5" r="2.6" fill="#20305f" />
          </>
          <path d="M45 66 q5 5 10 0" stroke="#d2566e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </>
      );

    /* -------------------------------- hero ------------------------------ */
    case "hero":
      return (
        <>
          <path d="M14 88 q-8 12 1 17 q8 -9 3 -17 z" fill="#e04b4b" />
          <path d="M86 88 q8 12 -1 17 q-8 -9 -3 -17 z" fill="#e04b4b" />
          <Body fill="#2f6fd0" />
          <Star x={50} y={82} r={8} fill="#f4d35e" />
          <ellipse cx="50" cy="53" rx="30" ry="30" fill="#33333d" />
          <circle cx="50" cy="56" r="25" fill="#ffd7b0" />
          <path d="M24 47 q26 -13 52 0 v13 q-26 -13 -52 0 z" fill="#20305f" />
          <path d="M30 39 q9 -11 20 -9 q11 -2 20 9 q-9 -6 -20 -6 q-11 0 -20 6 z" fill="#33333d" />
          <>
            <ellipse cx="40" cy="53" rx="5.4" ry="5.8" fill="#fff" />
            <ellipse cx="60" cy="53" rx="5.4" ry="5.8" fill="#fff" />
            <circle cx="41" cy="53.5" r="2.6" fill="#20305f" />
            <circle cx="61" cy="53.5" r="2.6" fill="#20305f" />
          </>
          <path d="M45 66 q5 5 10 0" stroke="#3b2f26" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </>
      );

    /* -------------------------------- moon ------------------------------ */
    case "moon":
      return (
        <>
          <circle cx="48" cy="52" r="33" fill="#ffe27a" />
          <circle cx="76" cy="28" r="28" fill="#2f3350" />
          <circle cx="38" cy="52" r="3.9" fill="#c9a227" />
          <circle cx="54" cy="54" r="3.9" fill="#c9a227" />
          <path d="M40 63 q6 5 12 0" stroke="#c9a227" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="33" cy="60" rx="4.4" ry="2.8" fill="#e8a33d" opacity="0.5" />
          <ellipse cx="59" cy="62" rx="4.4" ry="2.8" fill="#e8a33d" opacity="0.5" />
          <path d="M80 24 l1.8 5.4 l5.4 1.8 l-5.4 1.8 l-1.8 5.4 l-1.8 -5.4 l-5.4 -1.8 l5.4 -1.8 z" fill="#fff" />
          <path d="M76 68 l1.4 4.2 l4.2 1.4 l-4.2 1.4 l-1.4 4.2 l-1.4 -4.2 l-4.2 -1.4 l4.2 -1.4 z" fill="#fff" opacity="0.9" />
          <circle cx="22" cy="34" r="2.4" fill="#fff" opacity="0.85" />
          <circle cx="30" cy="78" r="2" fill="#fff" opacity="0.7" />
          <circle cx="86" cy="52" r="1.8" fill="#fff" opacity="0.6" />
        </>
      );

    /* ------------------------------ snowman ----------------------------- */
    default:
      return (
        <>
          <circle cx="50" cy="72" r="23" fill="#ffffff" />
          <circle cx="50" cy="43" r="17" fill="#ffffff" />
          <ellipse cx="50" cy="72" rx="23" ry="23" fill="none" stroke="#dbe9f3" strokeWidth="1.6" />
          <path d="M30 31 h40 l-5 -11 h-30 z" fill="#4c5b78" />
          <path d="M24 31 h52 v6.5 h-52 z" fill="#333f57" />
          <path d="M32 20 q18 -6 36 0 q-18 -3 -36 0 z" fill="#5f7091" />
          <circle cx="44" cy="42" r="2.7" fill="#33333d" />
          <circle cx="56" cy="42" r="2.7" fill="#33333d" />
          <path d="M50 47 l15 4.4 l-15 4.4 z" fill="#f0913c" />
          <path d="M34 60 q16 9 32 0 l-1 8 q-15 9 -30 0 z" fill="#e0555f" />
          <path d="M60 62 l7 14 l-5 2 l-6 -12 z" fill="#e0555f" />
          <circle cx="44" cy="68" r="2.5" fill="#3f4a63" />
          <circle cx="56" cy="68" r="2.5" fill="#3f4a63" />
          <circle cx="50" cy="78" r="2.3" fill="#3f4a63" />
          <path d="M45 84 q5 4 10 0" stroke="#3f4a63" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <g stroke="#8a6a4a" strokeWidth="3" strokeLinecap="round">
            <path d="M28 66 L14 58" />
            <path d="M14 58 l-5 -4 M14 58 l-4 -6" />
            <path d="M72 66 L86 58" />
            <path d="M86 58 l5 -4 M86 58 l4 -6" />
          </g>
          <ellipse cx="37" cy="50" rx="4" ry="2.6" fill="#ff7f95" opacity="0.3" />
          <ellipse cx="63" cy="50" rx="4" ry="2.6" fill="#ff7f95" opacity="0.3" />
        </>
      );
  }
}

function bgFor(id: AvatarId) {
  switch (id) {
    case "chicken":
      return "#fff3d2";
    case "cow":
      return "#f3efe4";
    case "dog":
      return "#f7e4cd";
    case "cat":
      return "#ffe7d2";
    case "sheep":
      return "#e9f1f8";
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
      <Bg fill={bgFor(id)} />
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
