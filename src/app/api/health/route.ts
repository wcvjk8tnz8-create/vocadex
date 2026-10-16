import { NextResponse } from "next/server";
import { storageName, storageNote, teacherKeyConfigured } from "@/lib/server/db";
import { redisOptions, redisPing } from "@/lib/server/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health — a one-glance check for Railway / Vercel.
 * Shows which storage back-end is live and whether it actually answers.
 */
export async function GET() {
  const using = storageName();
  let ok = true;
  let detail = "";

  if (using === "redis") {
    try {
      ok = await redisPing();
      detail = ok ? "PONG" : "no reply";
    } catch (e) {
      ok = false;
      detail = e instanceof Error ? e.message : "connection failed";
    }
  } else if (using === "upstash-redis") {
    detail = "REST endpoint configured";
  } else if (using === "memory-serverless") {
    ok = false;
    detail = "no REDIS_URL / Upstash configured — data will be lost";
  } else {
    detail = "local JSON file";
  }

  return NextResponse.json(
    {
      ok,
      app: "Vocadex",
      host: process.env.RAILWAY_ENVIRONMENT
        ? "railway"
        : process.env.VERCEL
        ? "vercel"
        : "local",
      storage: using,
      storageNote: storageNote(),
      storageDetail: detail,
      redisUrl: Boolean(redisOptions()),
      teacherKeyConfigured: teacherKeyConfigured(),
      time: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
