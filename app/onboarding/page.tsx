import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { OnboardingForm } from "./form";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === Role.ADMIN) redirect("/admin");

  const [user, classes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, surname: true, className: true, registrationCompletedAt: true },
    }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  if (user?.registrationCompletedAt) redirect("/app");

  // Tentativo di pre-fill da nome Google ("NOME COGNOME" o "COGNOME NOME")
  let defaultName = user?.name ?? "";
  let defaultSurname = user?.surname ?? "";
  if (!defaultSurname && defaultName.includes(" ")) {
    const parts = defaultName.trim().split(/\s+/);
    defaultName = parts[0];
    defaultSurname = parts.slice(1).join(" ");
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-10 flex-1">
        <div className="terminal-box max-w-lg mx-auto">
          <p className="terminal-heading text-xs text-muted-foreground">init --user</p>
          <h1 className="mt-1 text-2xl font-bold text-primary glow">benvenuto, completa il profilo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Controlla nome e cognome e seleziona la tua classe.
          </p>
          {classes.length === 0 && (
            <p className="mt-3 text-sm text-destructive border border-destructive/40 rounded p-2">
              Nessuna classe disponibile. Chiedi all'admin di importarle.
            </p>
          )}
          <div className="mt-6">
            <OnboardingForm
              defaultName={defaultName}
              defaultSurname={defaultSurname}
              defaultClassName={user?.className ?? ""}
              classes={classes.map((c) => c.name)}
            />
          </div>
        </div>
      </main>
    </>
  );
}
