import fs from "node:fs/promises";
import path from "node:path";
import { randomInt } from "node:crypto";
import type { Difficulty } from "@/lib/types";

/**
 * Vocadex server storage.
 *
 * Two back-ends, chosen automatically:
 *  1. Upstash Redis REST  — set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     (works on Vercel / Netlify / any serverless host, free tier is enough)
 *  2. Local JSON file      — `.data/vocadex.json` on any normal Node server
 *
 * Everything else in the app talks to this module, so swapping in Supabase,
 * Postgres or Firestore later means editing this file only.
 */

export type GiftStatus = "pending" | "given";

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
  status: GiftStatus;
  givenAt?: number;
};

export type UnitRecord = {
  best: number;
  done: boolean;
  attempts: number;
  updatedAt: number;
};

export type StudentSnapshot = {
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
  /** Login password. Set by the teacher from the dashboard. */
  password?: string;
  updatedAt: number;
};

export type LoginToken = {
  code: string;
  label: string;
  createdAt: number;
  expiresAt: number;
  uses: number;
};

type DB = {
  gifts: GiftRequest[];
  students: Record<string, StudentSnapshot>;
  /** teacher session token -> expiry timestamp */
  sessions: Record<string, number>;
  /** class sign-in tokens shown as a QR code */
  loginTokens: Record<string, LoginToken>;
};

const EMPTY: DB = { gifts: [], students: {}, sessions: {}, loginTokens: {} };
const REDIS_KEY = "vocadex:db";

/**
 * Fallback store. On Vercel / Netlify the file system is read-only, so when no
 * Redis is configured we keep the database in module memory instead of throwing.
 * Writes still work for the lifetime of the warm instance; configure Upstash for
 * persistence across instances.
 */
let memory: DB | null = null;
let warned = false;

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const FILE = path.join(process.cwd(), ".data", "vocadex.json");

let queue: Promise<unknown> = Promise.resolve();
function lock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readRaw(): Promise<DB> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const res = await fetch(`${UPSTASH_URL}/get/${REDIS_KEY}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as { result?: string | null };
        if (json.result) return { ...EMPTY, ...(JSON.parse(json.result) as DB) };
      }
      return { ...EMPTY, ...(memory ?? EMPTY) };
    } catch {
      return { ...EMPTY, ...(memory ?? EMPTY) };
    }
  }
  try {
    const txt = await fs.readFile(FILE, "utf8");
    return { ...EMPTY, ...(JSON.parse(txt) as DB) };
  } catch {
    return { ...EMPTY, ...(memory ?? EMPTY) };
  }
}

async function writeRaw(db: DB): Promise<void> {
  const value = JSON.stringify(db);
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      await fetch(UPSTASH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["SET", REDIS_KEY, value]),
        cache: "no-store",
      });
      return;
    } catch {
      memory = db;
      return;
    }
  }
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, value, "utf8");
    return;
  } catch {
    // read-only file system (Vercel / Netlify serverless)
    memory = db;
    if (!warned) {
      warned = true;
      console.warn(
        "[vocadex] File system is read-only — using in-memory storage. " +
          "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for persistence."
      );
    }
  }
}

export function storageName() {
  if (UPSTASH_URL && UPSTASH_TOKEN) return "upstash-redis";
  return process.env.VERCEL ? "memory-serverless" : "local-json";
}

export function read(): Promise<DB> {
  return lock(readRaw);
}

export async function mutate<T>(fn: (db: DB) => Promise<T> | T): Promise<T> {
  return lock(async () => {
    const db = await readRaw();
    const out = await fn(db);
    await writeRaw(db);
    return out;
  });
}

/* ------------------------------ passwords ---------------------------- */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion

/** Kid-friendly 6-character password such as "K7M2Q9". */
export function generatePassword() {
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/**
 * Short class sign-in code shown as a QR code, e.g. "SUN-4821".
 * Students scan it (or type it) instead of typing a password.
 */
export function generateLoginCode() {
  const words = ["SUN", "MOON", "STAR", "LEAF", "WAVE", "GOLD", "RAIN", "BLUE"];
  const word = words[randomInt(words.length)];
  let num = "";
  for (let i = 0; i < 4; i++) num += String(randomInt(10));
  return `${word}-${num}`;
}

export async function issueLoginToken(label: string, minutes = 30) {
  const code = generateLoginCode();
  const now = Date.now();
  const token: LoginToken = {
    code,
    label: label || "Class",
    createdAt: now,
    expiresAt: now + minutes * 60 * 1000,
    uses: 0,
  };
  await mutate((db) => {
    for (const [k, v] of Object.entries(db.loginTokens)) {
      if (v.expiresAt < now) delete db.loginTokens[k];
    }
    db.loginTokens[code] = token;
  });
  return token;
}

export async function consumeLoginToken(code: string) {
  const clean = String(code ?? "").trim().toUpperCase();
  if (!clean) return null;
  return mutate((db) => {
    const t = db.loginTokens[clean];
    if (!t) return null;
    if (t.expiresAt < Date.now()) {
      delete db.loginTokens[clean];
      return null;
    }
    t.uses += 1;
    return t;
  });
}

export async function revokeLoginToken(code: string) {
  const clean = String(code ?? "").trim().toUpperCase();
  await mutate((db) => {
    delete db.loginTokens[clean];
  });
}

/* --------------------------- teacher access -------------------------- */

export function teacherKey() {
  return process.env.TEACHER_KEY || process.env.VOCATEX_TEACHER_KEY || "plkshs";
}

/** True when the school has actually set TEACHER_KEY in the environment. */
export function teacherKeyConfigured() {
  return Boolean(process.env.TEACHER_KEY || process.env.VOCATEX_TEACHER_KEY);
}

const SESSION_MS = 12 * 60 * 60 * 1000;

export async function openSession(key: string) {
  if (key !== teacherKey()) return null;
  const token = Array.from({ length: 4 }, () =>
    randomInt(0xffffffff).toString(36)
  ).join("");
  await mutate((db) => {
    const now = Date.now();
    for (const [t, exp] of Object.entries(db.sessions)) {
      if (exp < now) delete db.sessions[t];
    }
    db.sessions[token] = now + SESSION_MS;
  });
  return token;
}

export async function isValidSession(token: string | null | undefined) {
  if (!token) return false;
  const db = await read();
  const exp = db.sessions[token];
  return typeof exp === "number" && exp > Date.now();
}

/** Accepts either the raw teacher key or a session token. */
export async function checkTeacher(req: Request) {
  const header =
    req.headers.get("x-teacher-key") ||
    req.headers.get("x-teacher-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const url = new URL(req.url);
  const value = header || url.searchParams.get("key") || url.searchParams.get("token") || "";
  if (!value) return false;
  if (value === teacherKey()) return true;
  return isValidSession(value);
}
