import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { OnboardingForm } from "./form";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";
import { appPath } from "@/lib/utils";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect(appPath("/login"));
  if (session.user.role === Role.ADMIN) redirect(appPath("/admin"));

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, surname: true, className: true, registrationCompletedAt: true },
  });
  if (user?.registrationCompletedAt) redirect(appPath("/app"));

  return (
    <>
      <SiteHeader />
      <main className="container py-10 flex-1">
        <div className="terminal-box max-w-lg mx-auto">
          <p className="terminal-heading text-xs text-muted-foreground">init --user</p>
          <h1 className="mt-1 text-2xl font-bold text-primary glow">benvenuto, completa il profilo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inserisci nome, cognome e classe. Useremo questi dati nella classifica.
          </p>
          <div className="mt-6">
            <OnboardingForm
              defaultName={user?.name ?? ""}
              defaultSurname={user?.surname ?? ""}
              defaultClassName={user?.className ?? ""}
            />
          </div>
        </div>
      </main>
    </>
  );
}
