import { NextResponse } from "next/server";
import { checkTeacher, mutate, read, storageName, type GiftRequest } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/gifts — teacher dashboard listing (needs the teacher key). */
export async function GET(req: Request) {
  if (!checkTeacher(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await read();
  const gifts = [...db.gifts].sort((a, b) => b.at - a.at);
  return NextResponse.json({ ok: true, storage: storageName(), gifts, students: db.students });
}

/** POST /api/gifts — a student scored 90%+ in a Unit Exercise. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<GiftRequest>;
    if (!body?.email || !body?.unitId) {
      return NextResponse.json({ error: "Missing email or unitId" }, { status: 400 });
    }
    const gift: GiftRequest = {
      id: body.id || `${body.unitId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: body.name || body.email.split("@")[0],
      email: String(body.email).toLowerCase(),
      grade: Number(body.grade ?? 0),
      unitId: String(body.unitId),
      unitTitle: body.unitTitle || String(body.unitId),
      score: Number(body.score ?? 0),
      difficulty: (body.difficulty ?? "medium") as GiftRequest["difficulty"],
      at: Date.now(),
      status: "pending",
    };
    await mutate((db) => {
      const exists = db.gifts.some(
        (g) => g.email === gift.email && g.unitId === gift.unitId && g.status === "pending"
      );
      if (!exists) db.gifts.push(gift);
    });
    return NextResponse.json({ ok: true, gift });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

/** PATCH /api/gifts — teacher marks a gift as given (or undoes it). */
export async function PATCH(req: Request) {
  if (!checkTeacher(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { id: string; status?: GiftRequest["status"] };
    if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const status: GiftRequest["status"] = body.status === "given" ? "given" : "pending";
    await mutate((db) => {
      const g = db.gifts.find((x) => x.id === body.id);
      if (g) {
        g.status = status;
        g.givenAt = status === "given" ? Date.now() : undefined;
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
