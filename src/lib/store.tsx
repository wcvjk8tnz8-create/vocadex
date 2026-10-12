"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getUnit, nextUnit, unitById, CURRICULUM } from "./curriculum";
import type { Difficulty } from "./types";

/* ---------------------------- energy rules ---------------------------- */
export const ENERGY_MAX = 100;
export const ENERGY_COST_PER_QUESTION = 2;
export const ENERGY_REFILL = 50;
export const REFILL_PERIOD_MS = 12 * 60 * 60 * 1000; // every 12 hours

/* ------------------------------- themes ------------------------------- */
export type ThemeId = "beige" | "brown" | "lavender" | "sky";

export const THEMES: {
  id: ThemeId;
  label: string;
  accent: string;
  deep: string;
  soft: string;
}[] = [
  { id: "beige", label: "Beige 米色", accent: "#d9a441", deep: "#a3701c", soft: "#f7ecd8" },
  { id: "brown", label: "Brown 棕色", accent: "#8b5e3c", deep: "#5c3a22", soft: "#efe0cf" },
  { id: "lavender", label: "Light Purple 淺紫色", accent: "#a58bd4", deep: "#6f56a6", soft: "#eee8fa" },
  { id: "sky", label: "Sky Blue 天空藍", accent: "#4f9dd9", deep: "#2a6ea3", soft: "#e2eef8" },
];

export const BACKGROUNDS: {
  id: string;
  label: string;
  file: string | null;
}[] = [
  { id: "sunset", label: "Sunset Valley 日落山谷", file: "/backgrounds/sunset.jpg" },
  { id: "sea-of-clouds", label: "Sea of Clouds 雲海羣山", file: "/backgrounds/sea-of-clouds.jpg" },
  { id: "plain", label: "Soft Paper 素雅紙感", file: null },
];

/* ------------------------------- avatars ------------------------------ */
export const AVATARS = [
  "chicken",
  "cow",
  "dog",
  "cat",
  "sheep",
  "boy",
  "girl",
  "heroine",
  "hero",
  "moon",
  "snowman",
] as const;
export type AvatarId = (typeof AVATARS)[number];

export const AVATAR_LABEL: Record<AvatarId, string> = {
  chicken: "Chicken 小雞",
  cow: "Cow 小牛",
  dog: "Dog 小狗",
  cat: "Cat 小貓",
  sheep: "Sheep 小羊",
  boy: "Boy 男孩",
  girl: "Girl 女孩",
  heroine: "Heroine 女超人",
  hero: "Hero 超人",
  moon: "Moon 月亮",
  snowman: "Snowman 雪人",
};

/* ------------------------------- profile ------------------------------ */
export type Profile = {
  email: string;
  name: string;
  avatar: AvatarId;
  theme: ThemeId;
  background: string;
  grade: number;
  term: 1 | 2;
  unitIndex: number;
  difficulty: Difficulty;
};

/** Shape returned by GET /api/progress (mirrors src/lib/server/db.ts). */
type StudentSnapshot = {
  email: string;
  name: string;
  avatar?: string;
  grade: number;
  term: 1 | 2;
  unitIndex: number;
  difficulty: Difficulty;
  energy: number;
  energyLast: number;
  unitId: string;
  records: Record<string, UnitRecord>;
  updatedAt?: number;
};

export type UnitRecord = {
  best: number;
  done: boolean;
  attempts: number;
  updatedAt: number;
};

export type GiftRequest = {
  id: string;
  name: string;
  email: string;
  grade: number;
  unitId: string;
  unitTitle: string;
  score: number;
  difficulty: Difficulty;
  at: number;
  status: "pending" | "given";
};

type State = {
  profile: Profile | null;
  energy: { value: number; last: number };
  records: Record<string, UnitRecord>;
  gifts: GiftRequest[];
  history: { at: number; kind: string; score: number; total: number; unitId: string }[];
};

const STORAGE_KEY = "vocadex.v1";

const FIRST_NAMES = [
  "sara", "sarah", "sam", "samuel", "simon", "sophia", "sharon", "stephen", "steven",
  "jack", "jackie", "james", "jane", "jason", "jenny", "joey", "john", "jordan", "joyce",
  "mary", "mark", "matthew", "may", "michael", "michelle", "mandy", "ming",
  "peter", "paul", "patrick", "phoebe", "david", "danny", "kelly", "kevin", "karen",
  "kate", "ken", "kitty", "amy", "alice", "anna", "ben", "billy", "candy", "chloe",
  "cindy", "emily", "eric", "eva", "fiona", "gary", "grace", "hannah", "helen", "ivan",
  "linda", "laura", "leo", "lucas", "nancy", "nathan", "nicole", "oscar", "raymond",
  "rebecca", "ryan", "sandy", "sue", "tammy", "tiffany", "tim", "toby", "tony", "tracy",
  "victor", "vivian", "wendy", "william", "wilson", "yan", "yuki", "wing", "wai", "chi",
  "ho", "ka", "chun", "kit", "lam", "lee", "chan", "cheung", "wong", "hoi", "hei", "yiu",
];

/** saratan@plkshs.edu.hk -> "Sara Tan" | 211B0000@plkshs.edu.hk -> "211B0000" */
export function nameFromEmail(email: string): string {
  const prefix = (email.split("@")[0] || "").trim();
  if (!prefix) return "Student";
  if (/[._\-+]/.test(prefix)) {
    return prefix
      .split(/[._\-+]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  }
  if (/\d/.test(prefix)) return prefix.toUpperCase();
  const lower = prefix.toLowerCase();
  const match = FIRST_NAMES.filter((n) => lower.startsWith(n) && lower.length > n.length).sort(
    (a, b) => b.length - a.length
  )[0];
  if (match) {
    const first = match.charAt(0).toUpperCase() + match.slice(1);
    const rest = lower.slice(match.length);
    return `${first} ${rest.charAt(0).toUpperCase() + rest.slice(1)}`;
  }
  const cut = Math.ceil(lower.length / 2);
  const a = lower.slice(0, cut);
  const b = lower.slice(cut);
  return b
    ? `${a.charAt(0).toUpperCase() + a.slice(1)} ${b.charAt(0).toUpperCase() + b.slice(1)}`
    : a.charAt(0).toUpperCase() + a.slice(1);
}

const DEFAULT_STATE: State = {
  profile: null,
  energy: { value: ENERGY_MAX, last: Date.now() },
  records: {},
  gifts: [],
  history: [],
};

type Ctx = {
  ready: boolean;
  state: State;
  energy: number;
  msToNextRefill: number;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  spendEnergy: (questions: number) => boolean;
  saveResult: (args: {
    unitId: string;
    kind: string;
    score: number;
    total: number;
    difficulty: Difficulty;
    isUnitTest: boolean;
  }) => { passed: boolean; promotedTo: string | null };
  gifts: GiftRequest[];
  markGift: (id: string, status: "pending" | "given") => void;
};

const AppContext = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

function readStorage(): State {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      profile: parsed.profile ?? null,
      energy: parsed.energy ?? { value: ENERGY_MAX, last: Date.now() },
      records: parsed.records ?? {},
      gifts: parsed.gifts ?? [],
      history: parsed.history ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(readStorage());
    setReady(true);
    const t = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  /* ---------- energy maths: +50 every full 12 hours, capped at 100 ---------- */
  const energyView = useMemo(() => {
    const { value, last } = state.energy;
    const elapsed = Math.max(0, now - last);
    const periods = Math.floor(elapsed / REFILL_PERIOD_MS);
    const gained = periods * ENERGY_REFILL;
    const nextValue = Math.min(ENERGY_MAX, value + gained);
    const nextBase = last + periods * REFILL_PERIOD_MS;
    const msToNext = nextValue >= ENERGY_MAX ? 0 : REFILL_PERIOD_MS - (now - nextBase);
    return { value: nextValue, last: nextBase, msToNext };
  }, [state.energy, now]);

  // commit the regenerated energy once per tick
  useEffect(() => {
    if (!ready) return;
    if (energyView.last !== state.energy.last || energyView.value !== state.energy.value) {
      setState((s) => ({
        ...s,
        energy: { value: energyView.value, last: energyView.last },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyView.value, energyView.last, ready]);

  /* ---- cloud sync: push the student snapshot to the server (debounced) ---- */
  useEffect(() => {
    if (!ready || !state.profile) return;
    const p = state.profile;
    const t = setTimeout(() => {
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: p.email,
          name: p.name,
          avatar: p.avatar,
          grade: p.grade,
          term: p.term,
          unitIndex: p.unitIndex,
          difficulty: p.difficulty,
          energy: energyView.value,
          energyLast: energyView.last,
          unitId: getUnit(p.grade, p.term, p.unitIndex).id,
          records: state.records,
        }),
      }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.profile, state.records, energyView.value, energyView.last]);

  const login = useCallback((email: string) => {
    const clean = email.trim().toLowerCase();
    setState((s) => ({
      ...s,
      profile: {
        email: clean,
        name: nameFromEmail(clean),
        avatar: "cat",
        theme: "beige",
        background: "sunset",
        grade: 4,
        term: 1,
        unitIndex: 1,
        difficulty: "medium",
      },
      energy: { value: ENERGY_MAX, last: Date.now() },
    }));

    /* Pull the cloud snapshot so a student keeps their energy and unit level
       when signing in on another device. New accounts simply keep 100 energy. */
    void (async () => {
      try {
        const res = await fetch(
          `/api/progress?email=${encodeURIComponent(clean)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { student?: StudentSnapshot | null };
        const st = data.student;
        if (!st) return;
        setState((s) => {
          if (!s.profile) return s;
          const profile: Profile = {
            ...s.profile,
            name: st.name || s.profile.name,
            avatar: ((st.avatar as AvatarId) ?? s.profile.avatar) as AvatarId,
            grade: st.grade || s.profile.grade,
            term: (st.term === 2 ? 2 : 1) as 1 | 2,
            unitIndex: st.unitIndex || s.profile.unitIndex,
            difficulty: (st.difficulty ?? s.profile.difficulty) as Profile["difficulty"],
          };
          const records = { ...s.records };
          for (const [key, v] of Object.entries(st.records ?? {})) {
            const prev = records[key];
            records[key] = {
              best: Math.max(prev?.best ?? 0, v?.best ?? 0),
              done: (prev?.done ?? false) || Boolean(v?.done),
              attempts: (prev?.attempts ?? 0) + (v?.attempts ?? 0),
              updatedAt: Math.max(prev?.updatedAt ?? 0, v?.updatedAt ?? 0),
            };
          }
          const value = Math.max(
            0,
            Math.min(ENERGY_MAX, Number(st.energy ?? ENERGY_MAX))
          );
          const last = Number(st.energyLast ?? Date.now());
          return { ...s, profile, records, energy: { value, last } };
        });
      } catch {
        /* offline — keep the local profile */
      }
    })();
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, profile: null }));
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s));
  }, []);

  const spendEnergy = useCallback(
    (questions: number) => {
      const cost = questions * ENERGY_COST_PER_QUESTION;
      const current = stateRef.current.energy;
      const liveNow = Date.now();
      const periods = Math.floor(
        Math.max(0, liveNow - current.last) / REFILL_PERIOD_MS
      );
      const live = Math.min(ENERGY_MAX, current.value + periods * ENERGY_REFILL);
      if (live < cost) return false;
      setState((s) => ({
        ...s,
        energy: {
          value: live - cost,
          last: current.last + periods * REFILL_PERIOD_MS,
        },
      }));
      return true;
    },
    []
  );

  const saveResult = useCallback<Ctx["saveResult"]>(
    ({ unitId, kind, score, total, difficulty, isUnitTest }) => {
      const percent = total > 0 ? Math.round((score / total) * 100) : 0;
      const passed = isUnitTest && percent >= 90;
      let promotedTo: string | null = null;
      const profileNow = stateRef.current.profile;

      /* --- cloud: tell the teacher when a mystery gift is earned --- */
      if (passed && profileNow && typeof window !== "undefined") {
        const unitNow = unitById(unitId);
        void fetch("/api/gifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profileNow.name,
            email: profileNow.email,
            grade: profileNow.grade,
            unitId,
            unitTitle: unitNow ? `Unit ${unitNow.index} — ${unitNow.title}` : unitId,
            score: percent,
            difficulty,
          }),
        }).catch(() => undefined);
      }

      setState((s) => {
        const profile = s.profile;
        const prev = s.records[unitId];
        const records = {
          ...s.records,
          [unitId]: {
            best: Math.max(prev?.best ?? 0, percent),
            done: (prev?.done ?? false) || passed,
            attempts: (prev?.attempts ?? 0) + 1,
            updatedAt: Date.now(),
          },
        };
        let history = [
          { at: Date.now(), kind, score, total, unitId },
          ...s.history,
        ].slice(0, 200);

        let gifts = s.gifts;
        let nextProfile = profile;
        if (passed && profile) {
          const unit = unitById(unitId);
          gifts = [
            {
              id: `${unitId}-${Date.now()}`,
              name: profile.name,
              email: profile.email,
              grade: profile.grade,
              unitId,
              unitTitle: unit ? `Unit ${unit.index} — ${unit.title}` : unitId,
              score: percent,
              difficulty,
              at: Date.now(),
              status: "pending" as const,
            },
            ...s.gifts,
          ];
          if (unit) {
            const nxt = nextUnit(unit);
            if (nxt) {
              promotedTo = nxt.id;
              nextProfile = {
                ...profile,
                grade: nxt.grade,
                term: nxt.term,
                unitIndex: nxt.index,
              };
            }
          }
        }
        return { ...s, profile: nextProfile, records, history, gifts };
      });
      return { passed, promotedTo };
    },
    []
  );

  const markGift = useCallback((id: string, status: "pending" | "given") => {
    setState((s) => ({
      ...s,
      gifts: s.gifts.map((g) => (g.id === id ? { ...g, status } : g)),
    }));
  }, []);

  const value: Ctx = {
    ready,
    state,
    energy: energyView.value,
    msToNextRefill: energyView.msToNext,
    login,
    logout,
    updateProfile,
    spendEnergy,
    saveResult,
    gifts: state.gifts,
    markGift,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* --------------------------- derived helpers --------------------------- */
export function useCurrentUnit() {
  const { state } = useApp();
  const p = state.profile;
  if (!p) return CURRICULUM[0];
  return getUnit(p.grade, p.term, p.unitIndex);
}
