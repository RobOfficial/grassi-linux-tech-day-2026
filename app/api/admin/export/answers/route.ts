import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";
import { toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAdmin())) return new NextResponse("forbidden", { status: 403 });
  const subs = await prisma.answerSubmission.findMany({
    include: {
      attempt: { include: { user: true, stand: true } },
      question: true,
      selectedOption: true,
    },
    orderBy: { answeredAt: "asc" },
  });
  const rows = subs.map((s) => ({
    email: s.attempt.user.email,
    name: s.attempt.user.name ?? "",
    surname: s.attempt.user.surname ?? "",
    className: s.attempt.user.className ?? "",
    standCode: s.attempt.stand.code,
    question: s.question.text,
    selectedOption: s.selectedOption.text,
    isCorrect: s.isCorrect ? "1" : "0",
    scoreAwarded: s.scoreAwarded,
    attemptNumber: s.attemptNumber,
    answeredAt: s.answeredAt.toISOString(),
  }));
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="risposte-${Date.now()}.csv"`,
    },
  });
}
