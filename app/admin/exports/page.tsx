export default function ExportsPage() {
  return (
    <div className="terminal-box max-w-xl">
      <h2 className="text-lg terminal-prompt text-primary">esportazioni CSV</h2>
      <p className="mt-2 text-sm text-muted-foreground">Scarica i dati per archiviazione.</p>
      <ul className="mt-4 space-y-2">
        <li><a className="btn-accent" href="/api/admin/export/leaderboard">⇩ classifica studenti (CSV)</a></li>
        <li><a className="btn-accent" href="/api/admin/export/attempts">⇩ tentativi per stand (CSV)</a></li>
        <li><a className="btn-accent" href="/api/admin/export/answers">⇩ risposte dettagliate (CSV)</a></li>
      </ul>
    </div>
  );
}
