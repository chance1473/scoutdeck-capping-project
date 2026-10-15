import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("[health] database check failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, service: "scoutdeck", database: "unreachable" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    service: "scoutdeck",
    database: "ok",
  });
}
