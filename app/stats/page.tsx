import { SiteHeader } from "@/components/site-header";
import { getGlobalStats } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getGlobalStats();
  const stands = await prisma.stand.findMany({ orderBy: [{ area: "asc" }, { code: "asc" }] });

  return (
    <>
      <SiteHeader />
      <main className="container py-6 flex-1 space-y-6">
        <div className="terminal-box">
          <p className="terminal-heading text-xs text-muted-foreground">stat --global</p>
          <h1 className="text-2xl text-primary glow">statistiche globali</h1>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="studenti" value={stats.totalStudents} />
            <Stat label="completamenti" value={stats.totalCompletions} />
            <Stat label="punti totali" value={stats.totalPoints} />
            <Stat label="media studente" value={stats.averagePoints} />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded border border-border p-3">
              <p className="label">classe top</p>
              <p className="mt-1 text-xl text-accent glow-accent">{stats.topClass ? `${stats.topClass.className} · ${stats.topClass.totalPoints} pti` : "—"}</p>
            </div>
            <div className="rounded border border-border p-3">
              <p className="label">stand più completato</p>
              <p className="mt-1 text-xl text-accent glow-accent">{stats.mostCompletedStand ? `${stats.mostCompletedStand.code} · ${stats.mostCompletedStand.title}` : "—"}</p>
            </div>
          </div>
        </div>

        <div className="terminal-box">
          <h2 className="terminal-prompt text-primary">stand</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {stands.map((s) => (
              <Link key={s.id} href={`/stats/${s.id}`} className="border border-border rounded p-2 text-xs hover:border-primary hover:text-primary">
                {s.code} · {s.title}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border bg-background/40 p-3">
      <p className="label">{label}</p>
      <p className="mt-1 text-3xl text-primary glow">{value}</p>
    </div>
  );
}
