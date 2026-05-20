"use server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@/lib/constants";
import { scoreForAnswer, questionPoints } from "@/lib/scoring";
import { evaluateBadges } from "@/lib/badges";

const submitSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export async function submitAnswer(input: z.infer<typeof submitSchema>) {
  const session = await auth();
  if (!session?.user) return { error: "non autenticato" } as const;
  const data = submitSchema.parse(input);

  const attempt = await prisma.attempt.findUnique({
    where: { id: data.attemptId },
    include: { stand: true },
  });
  if (!attempt || attempt.userId !== session.user.id) return { error: "tentativo non trovato" } as const;
  if (attempt.status === AttemptStatus.COMPLETED) return { error: "stand già completato" } as const;

  const question = await prisma.question.findUnique({
    where: { id: data.questionId },
    include: { options: true },
  });
  if (!question || question.standId !== attempt.standId || !question.isActive) {
    return { error: "domanda non valida" } as const;
  }
  const option = question.options.find((o) => o.id === data.optionId);
  if (!option) return { error: "opzione non valida" } as const;

  // Se la domanda ha già una risposta corretta, non assegnare nulla.
  const alreadyCorrect = await prisma.answerSubmission.findFirst({
    where: { attemptId: attempt.id, questionId: question.id, isCorrect: true },
  });
  if (alreadyCorrect) return { error: "domanda già risposta" } as const;

  // Conta sottomissioni precedenti per questa domanda
  const previous = await prisma.answerSubmission.count({
    where: { attemptId: attempt.id, questionId: question.id },
  });
  const attemptNumber = previous + 1;

  // Calcolo punti server-side (mai dal client)
  const basePoints = questionPoints(question.points, attempt.stand.basePoints);
  const scoreAwarded = scoreForAnswer({ isCorrect: option.isCorrect, attemptNumber, basePoints });

  await prisma.answerSubmission.create({
    data: {
      attemptId: attempt.id,
      questionId: question.id,
      selectedOptionId: option.id,
      isCorrect: option.isCorrect,
      scoreAwarded,
      attemptNumber,
    },
  });

  if (option.isCorrect) {
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: { increment: scoreAwarded },
        maxScore: { increment: basePoints },
      },
    });
  }

  return {
    isCorrect: option.isCorrect,
    scoreAwarded,
    attemptNumber,
    basePoints,
  };
}

export async function completeAttempt({ attemptId }: { attemptId: string }) {
  const session = await auth();
  if (!session?.user) return { error: "non autenticato" } as const;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { stand: { include: { questions: { where: { isActive: true } } } }, submissions: true },
  });
  if (!attempt || attempt.userId !== session.user.id) return { error: "non valido" } as const;
  if (attempt.status === AttemptStatus.COMPLETED) return { ok: true };

  const activeQs = attempt.stand.questions;
  const answeredCorrect = new Set(attempt.submissions.filter((s) => s.isCorrect).map((s) => s.questionId));
  const allAnswered = activeQs.every((q) => answeredCorrect.has(q.id));
  if (!allAnswered && activeQs.length > 0) {
    return { error: "ci sono ancora domande senza risposta corretta" } as const;
  }

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: { status: AttemptStatus.COMPLETED, completedAt: new Date() },
  });

  await evaluateBadges(session.user.id);
  return { ok: true };
}
