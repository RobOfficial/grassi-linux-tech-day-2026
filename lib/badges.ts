import { prisma } from "@/lib/prisma";
import { AttemptStatus, BadgeCondition } from "@/lib/constants";

export async function evaluateBadges(userId: string): Promise<string[]> {
  const [completedStands, totals] = await Promise.all([
    prisma.attempt.count({ where: { userId, status: AttemptStatus.COMPLETED } }),
    prisma.attempt.aggregate({
      where: { userId, status: AttemptStatus.COMPLETED },
      _sum: { score: true },
    }),
  ]);
  const totalPoints = totals._sum.score ?? 0;

  const badges = await prisma.badge.findMany();
  const owned = new Set(
    (await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map((b) => b.badgeId)
  );

  const newlyAwarded: string[] = [];
  for (const b of badges) {
    if (owned.has(b.id)) continue;
    let earned = false;
    if (b.conditionType === BadgeCondition.STANDS_COMPLETED && completedStands >= b.threshold) earned = true;
    if (b.conditionType === BadgeCondition.TOTAL_POINTS && totalPoints >= b.threshold) earned = true;
    if (earned) {
      try {
        await prisma.userBadge.create({ data: { userId, badgeId: b.id } });
        newlyAwarded.push(b.slug);
      } catch {
        // unique race
      }
    }
  }
  return newlyAwarded;
}
