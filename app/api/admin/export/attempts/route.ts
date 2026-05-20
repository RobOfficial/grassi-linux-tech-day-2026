import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";
import { AttemptStatus } from "@/lib/constants";
import { toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAdmin())) return new NextResponse("forbidden", { status: 403 });
  const attempts = await prisma.attempt.findMany({
    where: { status: AttemptStatus.COMPLETED },
    include: { user: true, stand: true },
    orderBy: { completedAt: "asc" },
  });
  const rows = attempts.map((a) => ({
    email: a.user.email,
    name: a.user.name ?? "",
    surname: a.user.surname ?? "",
    className: a.user.className ?? "",
    standCode: a.stand.code,
    standTitle: a.stand.title,
    score: a.score,
    maxScore: a.maxScore,
    startedAt: a.startedAt.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? "",
  }));
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tentativi-${Date.now()}.csv"`,
    },
  });
}
