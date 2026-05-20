import { importStands, importQuestions } from "./actions";
import { ImportForm } from "./form";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">import stand · CSV</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Colonne richieste: <code>code,area,room,title</code>. Opzionali: <code>description,basePoints,isActive</code>.
          Su code duplicato viene fatto <span className="text-accent">upsert</span> (i token esistenti restano validi).
        </p>
        <ImportForm action={importStands} />
      </div>

      <div className="terminal-box">
        <h2 className="text-lg terminal-prompt text-primary">import domande · CSV</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Colonne richieste: <code>standCode,question,option1,option2,option3,option4,correctOption</code>. Opzionali: <code>points,isActive</code>.
          correctOption deve essere 1..4.
        </p>
        <ImportForm action={importQuestions} />
      </div>
    </div>
  );
}
