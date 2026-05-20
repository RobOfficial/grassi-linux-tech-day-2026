import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12 flex-1">
        <div className="terminal-box max-w-md mx-auto">
          <p className="terminal-heading text-xs text-muted-foreground">404 not found</p>
          <h1 className="mt-1 text-2xl text-destructive">segment fault: pagina non trovata</h1>
          <p className="mt-2 text-sm text-muted-foreground">L'URL richiesto non esiste o non sei autorizzato a vederlo.</p>
          <Link href="/" className="btn mt-4">← home</Link>
        </div>
      </main>
    </>
  );
}
