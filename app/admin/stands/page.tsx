import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createStand, deleteStand, regenerateToken, toggleStand } from "./actions";

export default async function StandsPage() {
  const stands = await prisma.stand.findMany({
    orderBy: [{ area: "asc" }, { code: "asc" }],
    include: { _count: { select: { questions: true, attempts: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">nuovo stand</h2>
        <form action={createStand} className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input" name="code" placeholder="code (A01)" required maxLength={16} />
          <input className="input" name="area" placeholder="area" required maxLength={32} />
          <input className="input" name="room" placeholder="stanza" required maxLength={32} />
          <input className="input md:col-span-2" name="title" placeholder="titolo" required maxLength={120} />
          <input className="input" name="basePoints" type="number" min="0" defaultValue={10} />
          <input className="input md:col-span-6" name="description" placeholder="descrizione (opz)" maxLength={500} />
          <button className="btn md:col-span-1">▶ crea</button>
        </form>
      </div>

      <div className="terminal-box overflow-x-auto">
        <h2 className="text-lg terminal-prompt text-primary">stand ({stands.length})</h2>
        <table className="table-tech mt-3">
          <thead>
            <tr>
              <th>code</th><th>titolo</th><th>area</th><th>aula</th><th>pti</th><th>dom</th><th>compl</th><th>stato</th><th>azioni</th>
            </tr>
          </thead>
          <tbody>
            {stands.map((s) => (
              <tr key={s.id}>
                <td className="font-bold text-primary">{s.code}</td>
                <td>{s.title}</td>
                <td>{s.area}</td>
                <td>{s.room}</td>
                <td>{s.basePoints}</td>
                <td>{s._count.questions}</td>
                <td>{s._count.attempts}</td>
                <td>{s.isActive ? <span className="text-primary">attivo</span> : <span className="text-destructive">off</span>}</td>
                <td className="flex flex-wrap gap-1">
                  <Link className="btn-accent px-2 py-1 text-xs" href={`/admin/stands/${s.id}`}>edit</Link>
                  <Link className="btn-accent px-2 py-1 text-xs" href={`/admin/questions?stand=${s.id}`}>quiz</Link>
                  <Link className="btn-accent px-2 py-1 text-xs" href={`/admin/qr/${s.id}`}>qr</Link>
                  <form action={toggleStand}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-accent px-2 py-1 text-xs">{s.isActive ? "off" : "on"}</button>
                  </form>
                  <form action={regenerateToken}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-accent px-2 py-1 text-xs">↻ tkn</button>
                  </form>
                  <form action={deleteStand}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-danger px-2 py-1 text-xs">×</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
