import { NextResponse } from "next/server";
import { checkTeacher, mutate, read, type StudentSnapshot } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/progress?email=… — student sync down. Teacher key lists everyone. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").toLowerCase();
  const db = await read();
  if (email) {
    return NextResponse.json({ ok: true, student: db.students[email] ?? null });
  }
  if (!checkTeacher(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, students: db.students });
}

/** POST /api/progress — student sync up (profile, energy, unit records). */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<StudentSnapshot> & { email?: string };
    if (!body?.email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const email = body.email.toLowerCase();
    await mutate((db) => {
      const prev = db.students[email];
      db.students[email] = {
        ...prev,
        ...(body as StudentSnapshot),
        email,
        updatedAt: Date.now(),
      };
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
