import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AttemptStatus, Role } from "@/lib/constants";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { appPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();
  if (!session?.user) redirect(appPath(`/login?from=/scan/${encodeURIComponent(token)}`));
  if (session.user.role === Role.ADMIN) {
    return (
      <ScanShell title="Sei admin">
        <p>Admin non possono giocare. Usa un account studente per testare.</p>
        <Link href="/admin" className="btn mt-3">→ pannello admin</Link>
      </ScanShell>
    );
  }
  if (!session.user.registrationCompleted) {
    redirect(appPath(`/onboarding?from=/scan/${encodeURIComponent(token)}`));
  }

  const stand = await prisma.stand.findUnique({
    where: { token },
    include: { questions: { where: { isActive: true } } },
  });

  if (!stand) return (
    <ScanShell title="QR non valido">
      <p>Il QR non corrisponde a nessuno stand. Verifica con l'organizzazione.</p>
      <Link href="/app" className="btn mt-3">← dashboard</Link>
    </ScanShell>
  );
  if (!stand.isActive) return (
    <ScanShell title="Stand disattivato">
      <p>Lo stand <b>{stand.code}</b> non è attivo.</p>
      <Link href="/app" className="btn mt-3">← dashboard</Link>
    </ScanShell>
  );

  const event = await prisma.eventSettings.findUnique({ where: { id: 1 } });
  if (event?.isClosed) return (
    <ScanShell title="Evento chiuso">
      <p>La Tech Quest è terminata. La classifica resta disponibile.</p>
      <Link href="/leaderboard" className="btn mt-3">→ classifica</Link>
    </ScanShell>
  );

  const existing = await prisma.attempt.findUnique({
    where: { userId_standId: { userId: session.user.id, standId: stand.id } },
    include: { stand: true },
  });

  // Stand già completato
  if (existing?.status === AttemptStatus.COMPLETED) {
    return (
      <ScanShell title={`✔ già completato: ${stand.code}`}>
        <p>Hai già completato <b>{stand.title}</b>.</p>
        <p className="mt-1 text-primary">Punteggio: {existing.score}/{existing.maxScore}</p>
        <Link href="/app" className="btn mt-3">← dashboard</Link>
      </ScanShell>
    );
  }

  // Stand con 0 domande: completamento immediato con basePoints dello stand
  if (stand.questions.length === 0) {
    const pts = stand.basePoints;
    const attempt = await prisma.attempt.upsert({
      where: { userId_standId: { userId: session.user.id, standId: stand.id } },
      update: { status: AttemptStatus.COMPLETED, score: pts, maxScore: pts, completedAt: new Date() },
      create: {
        userId: session.user.id, standId: stand.id,
        status: AttemptStatus.COMPLETED, score: pts, maxScore: pts, completedAt: new Date(),
      },
    });
    const { evaluateBadges } = await import("@/lib/badges");
    await evaluateBadges(session.user.id);
    redirect(appPath(`/stand/${attempt.id}/summary`));
  }

  // Crea o riusa attempt IN_PROGRESS e vai al quiz
  const attempt = await prisma.attempt.upsert({
    where: { userId_standId: { userId: session.user.id, standId: stand.id } },
    update: {},
    create: { userId: session.user.id, standId: stand.id, status: AttemptStatus.IN_PROGRESS, maxScore: 0 },
  });
  redirect(appPath(`/stand/${attempt.id}`));
}

function ScanShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container py-10 flex-1">
        <div className="terminal-box max-w-md mx-auto">
          <h1 className="text-xl text-primary glow terminal-prompt">{title}</h1>
          <div className="mt-3 text-sm">{children}</div>
        </div>
      </main>
    </>
  );
}
