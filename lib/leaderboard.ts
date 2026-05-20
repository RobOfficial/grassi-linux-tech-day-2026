import { prisma } from "@/lib/prisma";
import { AttemptStatus, Role } from "@/lib/constants";

export type LeaderboardRow = {
  position: number;
  userId: string;
  name: string;
  surname: string;
  className: string;
  totalScore: number;
  standsCompleted: number;
  lastCompletedAt: Date | null;
};

export async function getLeaderboard(limit?: number): Promise<LeaderboardRow[]> {
  const users = await prisma.user.findMany({
    where: { role: Role.STUDENT, registrationCompletedAt: { not: null } },
    include: { attempts: { where: { status: AttemptStatus.COMPLETED } } },
  });
  const rows = users.map((u) => {
    const last = u.attempts.reduce<Date | null>((acc, a) => {
      if (!a.completedAt) return acc;
      if (!acc || a.completedAt > acc) return a.completedAt;
      return acc;
    }, null);
    return {
      userId: u.id,
      name: u.name ?? "",
      surname: u.surname ?? "",
      className: u.className ?? "—",
      totalScore: u.attempts.reduce((s, a) => s + a.score, 0),
      standsCompleted: u.attempts.length,
      lastCompletedAt: last,
    };
  });
  rows.sort((a, b) =>
    b.totalScore - a.totalScore ||
    b.standsCompleted - a.standsCompleted ||
    (a.lastCompletedAt && b.lastCompletedAt ? b.lastCompletedAt.getTime() - a.lastCompletedAt.getTime() : 0)
  );
  const ranked = rows.map((r, i) => ({ position: i + 1, ...r }));
  return limit ? ranked.slice(0, limit) : ranked;
}

export type GlobalStats = {
  totalStudents: number;
  totalCompletions: number;
  totalPoints: number;
  averagePoints: number;
  mostCompletedStand: { code: string; title: string; completions: number } | null;
  topClass: { className: string; totalPoints: number } | null;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  const [totalStudents, completions, points, perStand] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.attempt.count({ where: { status: AttemptStatus.COMPLETED } }),
    prisma.attempt.aggregate({ where: { status: AttemptStatus.COMPLETED }, _sum: { score: true } }),
    prisma.attempt.groupBy({
      by: ["standId"],
      where: { status: AttemptStatus.COMPLETED },
      _count: true,
      orderBy: { _count: { standId: "desc" } },
      take: 1,
    }),
  ]);

  let mostCompletedStand: GlobalStats["mostCompletedStand"] = null;
  if (perStand[0]) {
    const s = await prisma.stand.findUnique({ where: { id: perStand[0].standId } });
    if (s) mostCompletedStand = { code: s.code, title: s.title, completions: perStand[0]._count as unknown as number };
  }

  const lb = await getLeaderboard();
  const classMap = new Map<string, number>();
  for (const r of lb) {
    if (r.className && r.className !== "—") classMap.set(r.className, (classMap.get(r.className) ?? 0) + r.totalScore);
  }
  let topClass: GlobalStats["topClass"] = null;
  for (const [className, totalPoints] of classMap) {
    if (!topClass || totalPoints > topClass.totalPoints) topClass = { className, totalPoints };
  }

  const totalPoints = points._sum.score ?? 0;
  return {
    totalStudents,
    totalCompletions: completions,
    totalPoints,
    averagePoints: totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0,
    mostCompletedStand,
    topClass,
  };
}

export async function getStandStats(standId: string) {
  const stand = await prisma.stand.findUnique({
    where: { id: standId },
    include: {
      questions: { include: { submissions: true, options: { orderBy: { position: "asc" } } } },
      attempts: { where: { status: AttemptStatus.COMPLETED } },
    },
  });
  if (!stand) return null;
  const completions = stand.attempts.length;
  const avg = completions === 0 ? 0 : Math.round(stand.attempts.reduce((s, a) => s + a.score, 0) / completions);

  const hardest = stand.questions
    .map((q) => {
      const total = q.submissions.length;
      const wrong = q.submissions.filter((s) => !s.isCorrect).length;
      return { id: q.id, text: q.text, total, wrong, ratio: total > 0 ? wrong / total : 0 };
    })
    .filter((q) => q.total > 0)
    .sort((a, b) => b.ratio - a.ratio || b.wrong - a.wrong)
    .slice(0, 5);

  return { stand, completions, avg, hardest };
}
