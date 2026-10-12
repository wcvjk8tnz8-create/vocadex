import { NextResponse } from "next/server";
import { checkTeacher, read } from "@/lib/server/db";
import { studentQrPng } from "@/lib/server/qr";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/student-qr?email=…&token=…[&download=1]
 * Returns a PNG of the student's sign-in QR (email + password) with the
 * Vocadex logo in the middle. Teacher key or session token required.
 */
export async function GET(req: Request) {
  if (!(await checkTeacher(req))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return new NextResponse("Missing email", { status: 400 });

  const db = await read();
  const student = db.students[email];
  if (!student?.password) {
    return new NextResponse("This student has no password yet — generate one first.", {
      status: 404,
    });
  }

  try {
    const png = await studentQrPng(email, student.password);
    const filename = `vocadex-${email.split("@")[0]}.png`;
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Disposition": url.searchParams.get("download")
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
      },
    });
  } catch (e) {
    return new NextResponse(e instanceof Error ? e.message : "QR generation failed", {
      status: 500,
    });
  }
}
