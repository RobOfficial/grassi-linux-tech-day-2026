import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createQuestion, deleteQuestion, toggleQuestion } from "./actions";

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ stand?: string }> }) {
  const sp = await searchParams;
  const stands = await prisma.stand.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, title: true } });
  const selectedId = sp.stand ?? stands[0]?.id;
  const stand = selectedId ? await prisma.stand.findUnique({
    where: { id: selectedId },
    include: { questions: { include: { options: { orderBy: { position: "asc" } } }, orderBy: { createdAt: "asc" } } },
  }) : null;

  return (
    <div className="space-y-6">
      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">seleziona stand</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {stands.map((s) => (
            <Link key={s.id} href={`/admin/questions?stand=${s.id}`} className={`px-3 py-1 rounded border text-xs ${s.id === selectedId ? "border-primary text-primary bg-primary/10" : "border-border text-foreground hover:text-primary"}`}>
              {s.code} · {s.title}
            </Link>
          ))}
          {stands.length === 0 && <p className="text-sm text-muted-foreground">Nessuno stand. Crealo prima da Stand o Import CSV.</p>}
        </div>
      </div>

      {stand && (
        <>
          <div className="terminal-box">
            <h2 className="text-lg terminal-prompt text-primary">nuova domanda · {stand.code}</h2>
            <form action={createQuestion} className="mt-3 space-y-2">
              <input type="hidden" name="standId" value={stand.id} />
              <input className="input" name="text" placeholder="testo domanda" required maxLength={500} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input className="input" name="opt1" placeholder="opzione 1" required maxLength={300} />
                <input className="input" name="opt2" placeholder="opzione 2" required maxLength={300} />
                <input className="input" name="opt3" placeholder="opzione 3" required maxLength={300} />
                <input className="input" name="opt4" placeholder="opzione 4" required maxLength={300} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs">corretta:
                  <select name="correct" className="input ml-2 inline-block w-24">
                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                  </select>
                </label>
                <label className="text-xs">punti (opz):
                  <input name="points" type="number" min="0" placeholder={String(stand.basePoints)} className="input ml-2 inline-block w-24" />
                </label>
                <button className="btn">▶ aggiungi</button>
              </div>
            </form>
          </div>

          <div className="terminal-box">
            <h3 className="terminal-prompt text-primary">domande ({stand.questions.length})</h3>
            {stand.questions.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nessuna domanda. Stand con 0 domande = completamento a 0 punti.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {stand.questions.map((q, i) => (
                  <li key={q.id} className="border border-border rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm"><span className="text-primary">[{i + 1}]</span> {q.text} <span className="text-muted-foreground">· {q.points ?? stand.basePoints} pti {q.isActive ? "" : "(off)"}</span></p>
                      <div className="flex gap-1">
                        <form action={toggleQuestion}><input type="hidden" name="id" value={q.id} /><button className="btn-accent text-xs px-2 py-1">{q.isActive ? "off" : "on"}</button></form>
                        <form action={deleteQuestion}><input type="hidden" name="id" value={q.id} /><button className="btn-danger text-xs px-2 py-1">×</button></form>
                      </div>
                    </div>
                    <ol className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                      {q.options.map((o) => (
                        <li key={o.id} className={o.isCorrect ? "text-primary" : "text-muted-foreground"}>
                          {o.position}. {o.text} {o.isCorrect ? "✔" : ""}
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
