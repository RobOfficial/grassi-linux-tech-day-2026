import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";
import { auth } from "@/auth";
import { promoteAdmin, demoteAdmin } from "./actions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const session = await auth();
  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
  });
  const envAdmin = (process.env.ADMIN_EMAIL || "").toLowerCase();

  return (
    <div className="space-y-6">
      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">aggiungi admin</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Inserisci l'email Google del nuovo admin. Se l'utente non esiste ancora viene pre-autorizzato:
          al primo login con quell'email avrà già ruolo ADMIN.
          Le email pre-autorizzate come admin possono accedere anche se <b>fuori dominio</b> {process.env.ALLOWED_EMAIL_DOMAIN ? `(@${process.env.ALLOWED_EMAIL_DOMAIN})` : ""}.
        </p>
        <form action={promoteAdmin} className="mt-3 flex flex-wrap gap-2">
          <input className="input flex-1 min-w-64" name="email" type="email" placeholder="nuovo.admin@example.com" required />
          <button className="btn">▶ promuovi a admin</button>
        </form>
      </div>

      <div className="terminal-box overflow-x-auto">
        <h2 className="text-lg terminal-prompt text-primary">admin attivi ({admins.length})</h2>
        <table className="table-tech mt-3">
          <thead><tr>
            <th>email</th><th>nome</th><th>creato</th><th>fonte</th><th>azioni</th>
          </tr></thead>
          <tbody>
            {admins.map((a) => {
              const isEnv = a.email.toLowerCase() === envAdmin;
              const isSelf = a.id === session?.user?.id;
              const canDemote = admins.length > 1 && !isSelf && !isEnv;
              return (
                <tr key={a.id}>
                  <td className="text-xs">{a.email}</td>
                  <td>{a.name ?? "—"} {a.surname ?? ""}</td>
                  <td className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</td>
                  <td className="text-xs">
                    {isEnv && <span className="text-accent">ENV</span>}
                    {!isEnv && <span className="text-muted-foreground">db</span>}
                    {isSelf && <span className="ml-1 text-primary">(tu)</span>}
                  </td>
                  <td>
                    {canDemote ? (
                      <form action={demoteAdmin}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="btn-danger text-xs px-2 py-1">↓ rendi studente</button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {isSelf ? "non puoi rimuovere te stesso" : isEnv ? "definito in ADMIN_EMAIL" : "ultimo admin"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
