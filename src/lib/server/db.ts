import fs from "node:fs/promises";
import path from "node:path";
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
  updatedAt: number;
};

type DB = {
  gifts: GiftRequest[];
  students: Record<string, StudentSnapshot>;
};

const EMPTY: DB = { gifts: [], students: {} };
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
      return EMPTY;
    } catch {
      return memory ?? EMPTY;
    }
  }
  try {
    const txt = await fs.readFile(FILE, "utf8");
    return { ...EMPTY, ...(JSON.parse(txt) as DB) };
  } catch {
    return memory ?? EMPTY;
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

/* ------------------------------ helpers ------------------------------ */

export function teacherKey() {
  return process.env.VOCATEX_TEACHER_KEY || process.env.TEACHER_KEY || "plkshs";
}

export function checkTeacher(req: Request) {
  const header =
    req.headers.get("x-teacher-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const url = new URL(req.url);
  const key = header || url.searchParams.get("key") || "";
  return key === teacherKey();
}
