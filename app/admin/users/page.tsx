import { prisma } from "@/lib/prisma";
import { updateUser, resetOnboarding, deleteUser } from "./actions";
import { Role, AttemptStatus } from "@/lib/constants";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ class?: string; q?: string }> }) {
  const sp = await searchParams;
  const where: Record<string, unknown> = { role: Role.STUDENT };
  if (sp.class) where.className = sp.class.toUpperCase();
  if (sp.q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: sp.q } },
      { surname: { contains: sp.q } },
      { email: { contains: sp.q } },
    ];
  }
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ className: "asc" }, { surname: "asc" }, { name: "asc" }],
    include: { _count: { select: { attempts: { where: { status: AttemptStatus.COMPLETED } } } } },
  });
  const classes = Array.from(new Set((await prisma.user.findMany({ where: { role: Role.STUDENT }, select: { className: true } })).map((u) => u.className).filter(Boolean) as string[])).sort();

  return (
    <div className="space-y-4">
      <form className="terminal-box flex flex-wrap gap-2" action="/admin/users" method="get">
        <input className="input flex-1" name="q" placeholder="cerca per nome/email" defaultValue={sp.q ?? ""} />
        <select className="input w-32" name="class" defaultValue={sp.class ?? ""}>
          <option value="">tutte le classi</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn">filtra</button>
      </form>

      <div className="terminal-box overflow-x-auto">
        <table className="table-tech">
          <thead><tr>
            <th>email</th><th>nome</th><th>cognome</th><th>classe</th><th>completati</th><th>azioni</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="text-xs">{u.email}</td>
                <td>
                  <form action={updateUser} className="flex gap-1 items-center">
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="field" value="name" />
                    <input className="input w-32 text-xs" name="value" defaultValue={u.name ?? ""} />
                    <button className="btn-accent text-xs px-2 py-0.5">✓</button>
                  </form>
                </td>
                <td>
                  <form action={updateUser} className="flex gap-1 items-center">
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="field" value="surname" />
                    <input className="input w-32 text-xs" name="value" defaultValue={u.surname ?? ""} />
                    <button className="btn-accent text-xs px-2 py-0.5">✓</button>
                  </form>
                </td>
                <td>
                  <form action={updateUser} className="flex gap-1 items-center">
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="field" value="className" />
                    <input className="input w-16 text-xs" name="value" defaultValue={u.className ?? ""} />
                    <button className="btn-accent text-xs px-2 py-0.5">✓</button>
                  </form>
                </td>
                <td>{u._count.attempts}</td>
                <td className="flex gap-1">
                  <form action={resetOnboarding}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="btn-accent text-xs px-2 py-0.5">↻ onboarding</button>
                  </form>
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="btn-danger text-xs px-2 py-0.5">×</button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-4">nessun utente</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
