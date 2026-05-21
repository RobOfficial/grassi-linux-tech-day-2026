"use client";
import { useEffect, useState } from "react";
import { appPath } from "@/lib/utils";

type MonitorData = {
  leaderboard: { position: number; userId: string; name: string; surname: string; className: string; totalScore: number; standsCompleted: number }[];
  stats: { totalStudents: number; totalCompletions: number; totalPoints: number; averagePoints: number; topClass: { className: string; totalPoints: number } | null; mostCompletedStand: { code: string; title: string; completions: number } | null };
  ts: string;
};

export function MonitorBoard() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(appPath("/api/monitor"), { cache: "no-store" });
        const j = (await res.json()) as MonitorData;
        if (!cancelled) setData(j);
      } catch {}
    }
    load();
    const t = setInterval(() => { load(); setTick((x) => x + 1); }, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 terminal-box">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-5xl text-primary glow">classifica live</h1>
          <span className="text-xs text-muted-foreground">refresh ogni 30s · t={tick}</span>
        </div>
        <table className="table-tech mt-4 text-base sm:text-lg">
          <thead><tr>
            <th>#</th><th>studente</th><th>classe</th><th>punti</th><th>stand</th>
          </tr></thead>
          <tbody>
            {(data?.leaderboard ?? []).slice(0, 20).map((r) => (
              <tr key={r.userId} className={r.position === 1 ? "text-primary glow text-2xl" : r.position <= 3 ? "text-primary" : ""}>
                <td className="font-bold">{r.position}</td>
                <td>{r.name} {r.surname}</td>
                <td>{r.className}</td>
                <td className="text-right">{r.totalScore}</td>
                <td className="text-right">{r.standsCompleted}</td>
              </tr>
            ))}
            {!data && <tr><td colSpan={5} className="text-center text-muted-foreground py-6">caricamento...</td></tr>}
            {data && data.leaderboard.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-6">in attesa di completamenti</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <div className="terminal-box">
          <p className="terminal-heading text-xs text-muted-foreground">global stats</p>
          <ul className="mt-2 space-y-2 text-lg">
            <li>studenti <span className="text-primary float-right glow">{data?.stats.totalStudents ?? "—"}</span></li>
            <li>completamenti <span className="text-primary float-right glow">{data?.stats.totalCompletions ?? "—"}</span></li>
            <li>punti totali <span className="text-primary float-right glow">{data?.stats.totalPoints ?? "—"}</span></li>
            <li>media/studente <span className="text-primary float-right glow">{data?.stats.averagePoints ?? "—"}</span></li>
          </ul>
        </div>
        <div className="terminal-box">
          <p className="terminal-heading text-xs text-muted-foreground">classe top</p>
          <p className="text-2xl text-accent glow-accent">{data?.stats.topClass ? `${data.stats.topClass.className}` : "—"}</p>
          <p className="text-xs text-muted-foreground">{data?.stats.topClass ? `${data.stats.topClass.totalPoints} pti` : ""}</p>
        </div>
        <div className="terminal-box">
          <p className="terminal-heading text-xs text-muted-foreground">stand più completato</p>
          <p className="text-xl text-accent glow-accent">{data?.stats.mostCompletedStand ? `${data.stats.mostCompletedStand.code}` : "—"}</p>
          <p className="text-xs">{data?.stats.mostCompletedStand?.title}</p>
        </div>
      </div>
    </div>
  );
}
