import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { AttemptStatus } from "@/lib/constants";
import { SiteHeader } from "@/components/site-header";
import { QuizRunner } from "./quiz";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      stand: { include: { questions: { where: { isActive: true }, include: { options: { orderBy: { position: "asc" } } } } } },
      submissions: true,
    },
  });
  if (!attempt) notFound();
  if (attempt.userId !== session.user.id) redirect("/app");
  if (attempt.status === AttemptStatus.COMPLETED) redirect(`/stand/${attempt.id}/summary`);

  // Ordine deterministico per attempt (seeded sull'id): shuffle stabile
  const shuffled = stableShuffle(attempt.stand.questions, attempt.id).map((q) => ({
    id: q.id,
    text: q.text,
    points: q.points ?? attempt.stand.basePoints,
    options: stableShuffle(q.options, attempt.id + q.id).map((o) => ({ id: o.id, text: o.text, position: o.position })),
  }));

  // Domande già completamente risolte (correct submission registrata)
  const correctByQuestion = new Map<string, { attemptNumber: number; scoreAwarded: number }>();
  const errorsByQuestion = new Map<string, number>();
  for (const s of attempt.submissions) {
    if (s.isCorrect) {
      const prev = correctByQuestion.get(s.questionId);
      if (!prev || s.answeredAt < new Date(prev.attemptNumber)) correctByQuestion.set(s.questionId, { attemptNumber: s.attemptNumber, scoreAwarded: s.scoreAwarded });
    } else {
      errorsByQuestion.set(s.questionId, (errorsByQuestion.get(s.questionId) ?? 0) + 1);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-4 flex-1">
        <div className="terminal-box max-w-2xl mx-auto">
          <p className="terminal-heading text-xs text-muted-foreground">stand · {attempt.stand.code}</p>
          <h1 className="text-xl text-primary glow">{attempt.stand.title}</h1>
          <p className="text-xs text-muted-foreground">{attempt.stand.description}</p>
          <div className="mt-4">
            <QuizRunner
              attemptId={attempt.id}
              questions={shuffled}
              initialAnswered={Array.from(correctByQuestion.entries()).map(([qid, v]) => ({
                questionId: qid, score: v.scoreAwarded, attemptNumber: v.attemptNumber,
              }))}
              initialErrors={Array.from(errorsByQuestion.entries()).map(([qid, count]) => ({ questionId: qid, count }))}
            />
          </div>
        </div>
      </main>
    </>
  );
}

// Mulberry32 PRNG seeded da stringa
function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = r + Math.imul(r ^ (r >>> 7), 61 | r) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function stableShuffle<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  const r = rng(seedFromString(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
