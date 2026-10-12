import { NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  checkTeacher,
  consumeLoginToken,
  issueLoginToken,
  read,
  revokeLoginToken,
} from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/login-token { label?, minutes? }
 * Teacher only. Returns a short code plus an SVG QR of that plain code —
 * the QR contains just the text (e.g. "SUN-4821"), not a URL.
 */
export async function POST(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as {
      label?: string;
      minutes?: number;
    };
    const minutes = Math.max(5, Math.min(240, Number(body?.minutes ?? 30)));
    const token = await issueLoginToken(body?.label ?? "", minutes);
    const qr = await QRCode.toString(token.code, {
      type: "svg",
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M",
    });
    return NextResponse.json({ ok: true, token, qr });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create the token" },
      { status: 500 }
    );
  }
}

/** GET /api/login-token — list live tokens (teacher only). */
export async function GET(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await read();
  const now = Date.now();
  const tokens = Object.values(db.loginTokens)
    .filter((t) => t.expiresAt > now)
    .sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ ok: true, tokens });
}

/**
 * PUT /api/login-token { code } — a student redeems a scanned code.
 * No teacher rights needed; the code itself is the credential.
 */
export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as { code?: string };
    const token = await consumeLoginToken(body?.code ?? "");
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "This code has expired or is not correct." },
        { status: 410 }
      );
    }
    return NextResponse.json({ ok: true, code: token.code, label: token.label });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** DELETE /api/login-token { code } — teacher cancels a code. */
export async function DELETE(req: Request) {
  if (!(await checkTeacher(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { code?: string };
    await revokeLoginToken(body?.code ?? "");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
