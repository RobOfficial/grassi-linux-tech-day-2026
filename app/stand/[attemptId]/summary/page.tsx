import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SummaryPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      stand: true,
      submissions: { include: { question: true, selectedOption: true }, orderBy: { answeredAt: "asc" } },
    },
  });
  if (!attempt || attempt.userId !== session.user.id) notFound();

  const totalActive = await prisma.question.count({ where: { standId: attempt.standId, isActive: true } });
  // Usa attempt.maxScore se presente (incrementato server-side a ogni risposta corretta).
  // Fallback al calcolo dal pool domande quando 0 domande/0 punti registrati ma stand ha basePoints.
  const computed = await prisma.question.findMany({ where: { standId: attempt.standId, isActive: true }, select: { points: true } })
    .then((rows) => rows.reduce((s, r) => s + (r.points || attempt.stand.basePoints), 0));
  const maxTotal = attempt.maxScore > 0 ? attempt.maxScore : (computed || attempt.stand.basePoints);

  const newBadges = await prisma.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
    take: 5,
  });

  return (
    <>
      <SiteHeader />
      <main className="container py-6 flex-1">
        <div className="terminal-box max-w-2xl mx-auto">
          <p className="terminal-heading text-xs text-muted-foreground">stand completato</p>
          <h1 className="text-2xl text-primary glow">{attempt.stand.code} · {attempt.stand.title}</h1>
          <div className="mt-4 text-center">
            <p className="text-5xl text-primary glow">{attempt.score}<span className="text-base text-muted-foreground"> / {maxTotal}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{totalActive} domande</p>
          </div>

          {newBadges.length > 0 && (
            <div className="mt-6">
              <p className="terminal-prompt text-primary text-sm">badge attivi</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {newBadges.map((b) => <span key={b.id} className="badge-chip">★ {b.badge.name}</span>)}
              </div>
            </div>
          )}

          {attempt.submissions.length > 0 && (
            <details className="mt-6">
              <summary className="text-xs text-muted-foreground cursor-pointer">dettaglio risposte</summary>
              <ul className="mt-2 space-y-2 text-xs">
                {attempt.submissions.map((s) => (
                  <li key={s.id} className={s.isCorrect ? "text-primary" : "text-destructive"}>
                    {s.isCorrect ? "✔" : "✘"} {s.question.text} → {s.selectedOption.text} {s.isCorrect && `(+${s.scoreAwarded})`}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-6 flex gap-2 flex-wrap">
            <Link href="/app" className="btn">← dashboard</Link>
            <Link href="/leaderboard" className="btn-accent">› classifica</Link>
          </div>
        </div>
      </main>
    </>
  );
}
