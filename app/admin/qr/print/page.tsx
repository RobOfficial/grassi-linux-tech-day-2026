import { prisma } from "@/lib/prisma";
import { QrTile } from "@/components/qr-tile";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function PrintAllQrPage() {
  const stands = await prisma.stand.findMany({ orderBy: [{ area: "asc" }, { code: "asc" }] });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/quest";

  return (
    <main className="p-6 print:p-0 bg-white text-black min-h-screen">
      <div className="flex items-center justify-between mb-4 print:mb-2">
        <h1 className="text-xl font-bold">Grassi Tech Quest · QR stand</h1>
        <PrintButton />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stands.map((s) => (
          <div key={s.id} className="border border-black/30 rounded p-2 flex flex-col items-center break-inside-avoid">
            <p className="text-xs font-bold">{s.code} · {s.area} · {s.room}</p>
            <p className="text-[10px]">{s.title}</p>
            <div className="mt-1">
              <QrTile url={`${appUrl}/scan/${s.token}`} size={220} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
