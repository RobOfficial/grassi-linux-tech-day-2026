import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@/lib/constants";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboard() {
  const recent = await prisma.attempt.findMany({
    where: { status: AttemptStatus.COMPLETED },
    orderBy: { completedAt: "desc" },
    take: 10,
    include: { user: true, stand: true },
  });

  return (
    <div className="space-y-6">
      <div className="terminal-box">
        <h2 className="text-lg text-primary terminal-prompt">benvenuto admin</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Da qui gestisci stand, domande, QR e visualizzi i risultati.
          Usa <Link className="text-accent" href="/admin/import">import CSV</Link> per caricare gli stand della mappa.
        </p>
      </div>
      <div className="terminal-box">
        <h3 className="text-sm terminal-prompt text-primary">ultimi completamenti</h3>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nessun completamento ancora.</p>
        ) : (
          <table className="table-tech mt-3">
            <thead><tr><th>quando</th><th>studente</th><th>classe</th><th>stand</th><th>punti</th></tr></thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.completedAt)}</td>
                  <td>{a.user.name} {a.user.surname}</td>
                  <td>{a.user.className ?? "—"}</td>
                  <td>{a.stand.code} · {a.stand.title}</td>
                  <td>{a.score}/{a.maxScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
