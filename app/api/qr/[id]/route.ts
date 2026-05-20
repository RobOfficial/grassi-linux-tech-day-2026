import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse("forbidden", { status: 403 });
  const { id } = await params;
  const stand = await prisma.stand.findUnique({ where: { id } });
  if (!stand) return new NextResponse("not found", { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/quest";
  const url = `${appUrl}/scan/${stand.token}`;
  const png = await QRCode.toBuffer(url, { margin: 1, width: 640, errorCorrectionLevel: "M" });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${stand.code}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
