import { NextResponse } from "next/server";
import {
  isValidSession,
  openSession,
  storageName,
  teacherKeyConfigured,
} from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/teacher/session { key } — swap the key for a short-lived token. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { key?: string };
    const key = String(body?.key ?? "").trim();
    if (!key) {
      return NextResponse.json({ ok: false, error: "Enter the teacher key." }, { status: 400 });
    }
    const token = await openSession(key);
    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: teacherKeyConfigured()
            ? "Wrong teacher key."
            : "Wrong key — and TEACHER_KEY is not set on the server, so the default key is being used. Add TEACHER_KEY in Vercel → Settings → Environment Variables, then Redeploy.",
          configured: teacherKeyConfigured(),
        },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true, token, storage: storageName() });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** GET /api/teacher/session?token=… — is this session still alive? */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const ok = await isValidSession(token);
  return NextResponse.json({ ok, storage: storageName(), configured: teacherKeyConfigured() });
}
