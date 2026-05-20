import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";
import { AttemptStatus, Role } from "@/lib/constants";
import { toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAdmin())) return new NextResponse("forbidden", { status: 403 });
  const students = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    include: { attempts: { where: { status: AttemptStatus.COMPLETED } } },
  });
  const rows = students.map((u) => {
    const score = u.attempts.reduce((s, a) => s + a.score, 0);
    return {
      email: u.email,
      name: u.name ?? "",
      surname: u.surname ?? "",
      className: u.className ?? "",
      totalScore: score,
      standsCompleted: u.attempts.length,
      registeredAt: u.registrationCompletedAt?.toISOString() ?? "",
    };
  }).sort((a, b) => b.totalScore - a.totalScore || b.standsCompleted - a.standsCompleted);

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="classifica-${Date.now()}.csv"`,
    },
  });
}
