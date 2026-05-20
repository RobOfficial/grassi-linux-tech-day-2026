import { SiteHeader } from "@/components/site-header";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  return (
    <>
      <SiteHeader />
      <main className="container py-6 flex-1">
        <div className="terminal-box">
          <p className="terminal-heading text-xs text-muted-foreground">cat leaderboard.tsv</p>
          <h1 className="text-2xl text-primary glow">classifica studenti</h1>
          <div className="mt-4 overflow-x-auto">
            <table className="table-tech">
              <thead><tr>
                <th>#</th><th>nome</th><th>cognome</th><th>classe</th><th>punti</th><th>stand</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className={r.position <= 3 ? "text-primary glow" : ""}>
                    <td className="font-bold">{r.position}</td>
                    <td>{r.name}</td>
                    <td>{r.surname}</td>
                    <td>{r.className}</td>
                    <td className="text-right">{r.totalScore}</td>
                    <td className="text-right">{r.standsCompleted}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-6">nessuno studente in classifica</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Tie-break: punti → stand completati → completamento più recente.</p>
        </div>
      </main>
    </>
  );
}
