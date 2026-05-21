import { requireAdmin } from "@/lib/auth-helpers";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@/lib/constants";

const tabs = [
  { href: "/admin", label: "dashboard" },
  { href: "/admin/stands", label: "stand" },
  { href: "/admin/import", label: "import csv" },
  { href: "/admin/questions", label: "domande" },
  { href: "/admin/qr", label: "qr code" },
  { href: "/admin/users", label: "utenti" },
  { href: "/admin/classes", label: "classi" },
  { href: "/admin/admins", label: "admin" },
  { href: "/admin/exports", label: "export" },
  { href: "/admin/event", label: "evento" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [students, stands, completions, totalScore] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.stand.count(),
    prisma.attempt.count({ where: { status: AttemptStatus.COMPLETED } }),
    prisma.attempt.aggregate({ where: { status: AttemptStatus.COMPLETED }, _sum: { score: true } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="container py-6 flex-1">
        <div className="terminal-box mb-6">
          <p className="terminal-heading text-xs text-muted-foreground">admin@grassi-tech-quest</p>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="studenti" value={students} />
            <Stat label="stand" value={stands} />
            <Stat label="completamenti" value={completions} />
            <Stat label="punti tot." value={totalScore._sum.score ?? 0} />
          </div>
        </div>
        <nav className="mb-4 flex flex-wrap gap-2 text-xs">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className="btn-accent px-3 py-1">{t.label}</Link>
          ))}
        </nav>
        <div>{children}</div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border bg-background/40 p-3">
      <p className="label">{label}</p>
      <p className="mt-1 text-2xl text-primary glow">{value}</p>
    </div>
  );
}
