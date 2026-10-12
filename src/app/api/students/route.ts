import { NextResponse } from "next/server";
import {
  checkTeacher,
  generatePassword,
  mutate,
  read,
  type StudentSnapshot,
} from "@/lib/server/db";
import { nameFromEmail } from "@/lib/names";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Row = {
  email: string;
  name: string;
  grade: number;
  password: string;
  energy: number;
  updatedAt: number;
};

function rowsOf(db: { students: Record<string, StudentSnapshot> }): Row[] {
  return Object.values(db.students)
    .map((s) => ({
      email: s.email,
      name: s.name || nameFromEmail(s.email),
      grade: s.grade,
      password: s.password ?? "",
      energy: s.energy,
      updatedAt: s.updatedAt ?? 0,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

/** GET /api/students — class list with passwords (teacher only). */
export async function GET(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await read();
  return NextResponse.json({ ok: true, students: rowsOf(db) });
}

/**
 * POST /api/students { emails?: string[], reset?: string }
 *  · emails  — add students (created on the fly) and give each a password
 *  · reset   — give one student a brand-new password
 */
export async function POST(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      emails?: string[];
      reset?: string;
      resetAllEnergy?: boolean;
      resetEnergy?: string;
    };
    const result = await mutate((db) => {
      const now = Date.now();
      /* teacher pressed "Reset everyone's energy to 100" */
      if (body?.resetAllEnergy) {
        for (const s of Object.values(db.students)) {
          s.energy = 100;
          s.energyLast = now;
          s.updatedAt = now;
        }
        return rowsOf(db);
      }
      if (body?.resetEnergy) {
        const email = body.resetEnergy.trim().toLowerCase();
        const s = db.students[email];
        if (s) {
          s.energy = 100;
          s.energyLast = now;
          s.updatedAt = now;
        }
        return rowsOf(db);
      }
      if (body?.reset) {
        const email = body.reset.trim().toLowerCase();
        const s = db.students[email];
        if (s) s.password = generatePassword();
        return rowsOf(db);
      }
      const list = (body?.emails ?? [])
        .map((e) => String(e).trim().toLowerCase())
        .filter((e) => e.includes("@"));
      for (const email of list) {
        const existing = db.students[email];
        if (existing) {
          if (!existing.password) existing.password = generatePassword();
        } else {
          db.students[email] = {
            email,
            name: nameFromEmail(email),
            grade: 0,
            term: 1,
            unitIndex: 1,
            difficulty: "medium",
            energy: 100,
            energyLast: now,
            unitId: "",
            records: {},
            password: generatePassword(),
            updatedAt: now,
          };
        }
      }
      return rowsOf(db);
    });
    return NextResponse.json({ ok: true, students: result });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

/** PATCH /api/students { email, password } — set a password by hand. */
export async function PATCH(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    await mutate((db) => {
      const s = db.students[email];
      if (s) {
        s.password = password.toUpperCase();
        s.updatedAt = Date.now();
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

/** DELETE /api/students { email } — remove the password / the student. */
export async function DELETE(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { email?: string };
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
    const rows = await mutate((db) => {
      delete db.students[email];
      return rowsOf(db);
    });
    return NextResponse.json({ ok: true, students: rows });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
