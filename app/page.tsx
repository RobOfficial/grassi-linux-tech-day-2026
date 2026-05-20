import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  return (
    <>
      <SiteHeader />
      <main className="container py-12 flex-1">
        <div className="terminal-box max-w-3xl mx-auto">
          <p className="terminal-heading text-sm text-muted-foreground">whoami</p>
          <h1 className="mt-1 text-3xl sm:text-5xl font-bold text-primary glow">
            Grassi Tech Quest <span className="cursor-blink" />
          </h1>
          <p className="mt-4 text-foreground/90">
            Benvenuto al <span className="text-accent">Grassi Linux Tech Day 2026</span>.
            Visita gli stand, scansiona i QR code, rispondi ai quiz e scala la classifica.
          </p>
          <pre className="mt-6 text-xs sm:text-sm text-primary/80 bg-black/40 rounded p-3 overflow-x-auto">
{`> sudo grassi-quest start
[ ok ] login con account scolastico
[ ok ] scansione QR stand
[ ok ] quiz 4 risposte, 1 sola corretta
[ ok ] retry penalizzato 20%
[ ok ] classifica live ogni 30s`}
          </pre>
          <div className="mt-6 flex flex-wrap gap-3">
            {session?.user ? (
              <Link href="/app" className="btn">▶ dashboard</Link>
            ) : (
              <Link href="/login" className="btn">▶ login@grassi</Link>
            )}
            <Link href="/leaderboard" className="btn-accent">› classifica</Link>
            <Link href="/monitor" className="btn-accent">› monitor</Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-primary/20 py-3 text-center text-xs text-muted-foreground">
        Grassi Tech Quest · ITIS Grassi · Linux Tech Day 2026
      </footer>
    </>
  );
}
