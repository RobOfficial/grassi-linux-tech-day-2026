import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QrTile } from "@/components/qr-tile";
import Link from "next/link";

export default async function StandQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.stand.findUnique({ where: { id } });
  if (!s) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/quest";
  const url = `${appUrl}/scan/${s.token}`;

  return (
    <div className="terminal-box max-w-xl">
      <h2 className="text-lg terminal-prompt text-primary">QR · {s.code} · {s.title}</h2>
      <p className="mt-1 text-xs text-muted-foreground break-all">{url}</p>
      <div className="mt-4 flex justify-center">
        <QrTile url={url} size={360} />
      </div>
      <div className="mt-4 flex gap-2">
        <a className="btn" href={`/api/qr/${s.id}?download=1`} target="_blank" rel="noreferrer">▶ download PNG</a>
        <Link className="btn-accent" href="/admin/qr">indietro</Link>
      </div>
    </div>
  );
}
