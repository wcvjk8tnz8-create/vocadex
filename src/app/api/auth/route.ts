import { NextResponse } from "next/server";
import { mutate, read } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth { email, password }
 *
 *  ok            — password correct (or no password set yet)
 *  no-password   — the student is not on the class list yet; the client may
 *                  still let them in, but the teacher will see the sign-in
 *  wrong-password— blocked
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim().toUpperCase();
    if (!email) return NextResponse.json({ ok: false, reason: "wrong-password" }, { status: 400 });

    const db = await read();
    const student = db.students[email];

    if (!student || !student.password) {
      return NextResponse.json({ ok: false, reason: "no-password" });
    }
    if (student.password.toUpperCase() !== password) {
      return NextResponse.json({ ok: false, reason: "wrong-password" });
    }

    await mutate((d) => {
      const s = d.students[email];
      if (s) s.updatedAt = Date.now();
    });
    return NextResponse.json({ ok: true, name: student.name });
  } catch {
    return NextResponse.json({ ok: false, reason: "wrong-password" }, { status: 400 });
  }
}
