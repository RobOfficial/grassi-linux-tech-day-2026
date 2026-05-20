"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="container py-12 flex-1">
      <div className="terminal-box max-w-md mx-auto">
        <p className="terminal-heading text-xs text-muted-foreground">kernel panic</p>
        <h1 className="mt-1 text-2xl text-destructive">qualcosa è andato storto</h1>
        <p className="mt-2 text-sm text-muted-foreground">Riprova oppure torna alla dashboard.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={reset} className="btn">↻ riprova</button>
          <Link href="/app" className="btn-accent">← dashboard</Link>
        </div>
      </div>
    </main>
  );
}
