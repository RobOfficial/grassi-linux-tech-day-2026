import { SiteHeader } from "@/components/site-header";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { appPath } from "@/lib/utils";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string; error?: string }> }) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) redirect("/app");

  const from = sp.from || "/app";
  const error = sp.error;

  return (
    <>
      <SiteHeader />
      <main className="container py-12 flex-1 flex items-center justify-center">
        <div className="terminal-box w-full max-w-md">
          <p className="terminal-heading text-xs text-muted-foreground">login --provider=google</p>
          <h1 className="mt-1 text-2xl font-bold text-primary glow">accedi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo email <span className="text-accent">@{process.env.ALLOWED_EMAIL_DOMAIN || "itisgrassi.edu.it"}</span>.
          </p>
          {error && (
            <p className="mt-3 text-sm text-destructive border border-destructive/40 rounded p-2">
              {error === "AccessDenied"
                ? "Accesso negato: usa il tuo account scolastico."
                : `Errore: ${error}`}
            </p>
          )}
          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: appPath(from) });
            }}
          >
            <button type="submit" className="btn w-full">▶ continua con google</button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Effettuando l'accesso accetti che salviamo: email, nome, cognome, classe, punteggi e tentativi. Nessun IP o user-agent.
          </p>
        </div>
      </main>
    </>
  );
}
