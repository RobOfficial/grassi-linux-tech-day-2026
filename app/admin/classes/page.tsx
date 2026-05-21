import { prisma } from "@/lib/prisma";
import { createClass, deleteClass, importClasses } from "./actions";
import { ImportClassesForm } from "./form";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await prisma.schoolClass.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">aggiungi classe</h2>
        <form action={createClass} className="mt-3 flex flex-wrap gap-2">
          <input className="input flex-1 min-w-48" name="name" placeholder="es. 5AI" required maxLength={16} />
          <button className="btn">▶ aggiungi</button>
        </form>
      </div>

      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">import classi · CSV</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Una sola colonna <code>name</code>, una classe per riga. Duplicati ignorati.
          <br />Esempio: <code>name\n1AI\n1BI\n5AI</code>
        </p>
        <ImportClassesForm action={importClasses} />
      </div>

      <div className="terminal-box overflow-x-auto">
        <h2 className="text-lg terminal-prompt text-primary">classi ({classes.length})</h2>
        {classes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nessuna classe inserita. Aggiungine qualcuna o importa il CSV.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {classes.map((c) => (
              <li key={c.id} className="flex items-center justify-between border border-border rounded px-2 py-1 text-sm">
                <span className="text-primary">{c.name}</span>
                <form action={deleteClass}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-destructive hover:text-destructive/80 text-xs" title="elimina">×</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
