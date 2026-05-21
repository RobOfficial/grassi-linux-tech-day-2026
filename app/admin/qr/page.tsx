import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QrTile } from "@/components/qr-tile";
import { appPath } from "@/lib/utils";

export default async function QrIndexPage() {
  const stands = await prisma.stand.findMany({ orderBy: [{ area: "asc" }, { code: "asc" }] });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/quest";

  return (
    <div className="space-y-4">
      <div className="terminal-box flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">QR per ogni stand. URL base: <code className="text-primary">{appUrl}/scan/&lt;token&gt;</code></p>
        <div className="flex flex-wrap gap-2">
          <a href={appPath("/api/admin/export/qr-pdf")} className="btn text-xs">⇩ PDF (1 pagina per stand)</a>
          <Link href="/admin/qr/print" className="btn-accent text-xs">▶ pagina stampa</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stands.map((s) => (
          <Link key={s.id} href={`/admin/qr/${s.id}`} className="terminal-box hover:border-primary block">
            <QrTile url={`${appUrl}/scan/${s.token}`} label={`${s.code} · ${s.title}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
