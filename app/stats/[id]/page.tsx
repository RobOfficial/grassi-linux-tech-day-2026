import { SiteHeader } from "@/components/site-header";
import { getStandStats } from "@/lib/leaderboard";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StandStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getStandStats(id);
  if (!data) notFound();
  const { stand, completions, avg, hardest } = data;
  return (
    <>
      <SiteHeader />
      <main className="container py-6 flex-1 space-y-6">
        <div className="terminal-box">
          <Link href="/stats" className="text-xs text-accent">← tutte le stats</Link>
          <h1 className="mt-2 text-2xl text-primary glow">{stand.code} · {stand.title}</h1>
          <p className="text-xs text-muted-foreground">{stand.area} / {stand.room}</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="completamenti" value={completions} />
            <Stat label="punteggio medio" value={avg} />
            <Stat label="punti base" value={stand.basePoints} />
          </div>
        </div>
        <div className="terminal-box">
          <h2 className="terminal-prompt text-primary">domande più sbagliate</h2>
          {hardest.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Ancora nessun dato.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {hardest.map((q) => (
                <li key={q.id} className="border border-border rounded p-2">
                  <p className="text-sm">{q.text}</p>
                  <p className="text-xs text-muted-foreground">errori: {q.wrong}/{q.total} ({Math.round(q.ratio * 100)}%)</p>
                </li>
              ))}
            </ul>
          )}
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
