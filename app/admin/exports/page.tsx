import { appPath } from "@/lib/utils";

export default function ExportsPage() {
  return (
    <div className="terminal-box max-w-xl">
      <h2 className="text-lg terminal-prompt text-primary">esportazioni</h2>
      <p className="mt-2 text-sm text-muted-foreground">Scarica i dati per archiviazione.</p>
      <ul className="mt-4 space-y-2">
        <li><a className="btn-accent" href={appPath("/api/admin/export/leaderboard")}>⇩ classifica studenti (CSV)</a></li>
        <li><a className="btn-accent" href={appPath("/api/admin/export/attempts")}>⇩ tentativi per stand (CSV)</a></li>
        <li><a className="btn-accent" href={appPath("/api/admin/export/answers")}>⇩ risposte dettagliate (CSV)</a></li>
        <li><a className="btn" href={appPath("/api/admin/export/qr-pdf")}>⇩ QR stand (PDF, 1 pagina per stand)</a></li>
      </ul>
    </div>
  );
}
