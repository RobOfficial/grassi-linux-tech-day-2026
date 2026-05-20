import { requireStudent } from "@/lib/auth-helpers";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const user = await requireStudent();
  const [attempts, allStands, badges] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId: user.id, status: AttemptStatus.COMPLETED },
      include: { stand: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.stand.findMany({ where: { isActive: true }, orderBy: [{ area: "asc" }, { code: "asc" }] }),
    prisma.userBadge.findMany({ where: { userId: user.id }, include: { badge: true }, orderBy: { awardedAt: "desc" } }),
  ]);

  const completedIds = new Set(attempts.map((a) => a.standId));
  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const available = allStands.filter((s) => !completedIds.has(s.id));

  return (
    <>
      <SiteHeader />
      <main className="container py-6 flex-1 space-y-6">
        <div className="terminal-box">
          <p className="terminal-heading text-xs text-muted-foreground">whoami</p>
          <h1 className="mt-1 text-xl text-primary glow">{user.name || user.email}</h1>
          <p className="text-xs text-muted-foreground">{user.className ?? ""}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Box label="punti" value={totalScore} />
            <Box label="stand fatti" value={attempts.length} />
            <Box label="disponibili" value={available.length} />
          </div>
          <div className="mt-4 flex gap-2 flex-wrap text-xs">
            <Link href="/leaderboard" className="btn-accent">› classifica</Link>
            <Link href="/stats" className="btn-accent">› stats</Link>
          </div>
        </div>

        <div className="terminal-box">
          <h2 className="terminal-prompt text-primary">badge ({badges.length})</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.length === 0 && <p className="text-sm text-muted-foreground">Nessun badge ancora. Completa stand per sbloccarli.</p>}
            {badges.map((b) => (
              <span key={b.id} className="badge-chip">★ {b.badge.name}</span>
            ))}
          </div>
        </div>

        <div className="terminal-box">
          <h2 className="terminal-prompt text-primary">stand</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            {allStands.map((s) => {
              const done = completedIds.has(s.id);
              const attempt = attempts.find((a) => a.standId === s.id);
              return (
                <div key={s.id} className={`border rounded p-3 ${done ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                  <p className="text-sm">
                    <span className="font-bold text-primary">{s.code}</span> · {s.title}
                    <span className="text-xs text-muted-foreground"> · {s.area}/{s.room}</span>
                  </p>
                  {done && attempt ? (
                    <p className="mt-1 text-xs text-primary">✔ completato · {attempt.score}/{attempt.maxScore} pti</p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">scansiona il QR allo stand</p>
                  )}
                </div>
              );
            })}
            {allStands.length === 0 && <p className="text-sm text-muted-foreground">Nessuno stand disponibile.</p>}
          </div>
        </div>
      </main>
    </>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border bg-background/40 p-3">
      <p className="label">{label}</p>
      <p className="text-3xl text-primary glow">{value}</p>
    </div>
  );
}
