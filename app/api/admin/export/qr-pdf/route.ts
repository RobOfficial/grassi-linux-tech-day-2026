import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return new NextResponse("forbidden", { status: 403 });

  const stands = await prisma.stand.findMany({ orderBy: [{ area: "asc" }, { code: "asc" }] });
  if (stands.length === 0) return new NextResponse("Nessuno stand", { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/quest";

  const pdf = await PDFDocument.create();
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  // A4 portrait in points: 595.28 x 841.89
  const W = 595.28;
  const H = 841.89;

  for (const s of stands) {
    const page = pdf.addPage([W, H]);

    // Header: code grande in alto
    const codeSize = 64;
    const codeWidth = fontBold.widthOfTextAtSize(s.code, codeSize);
    page.drawText(s.code, {
      x: (W - codeWidth) / 2,
      y: H - 110,
      size: codeSize,
      font: fontBold,
      color: rgb(0.05, 0.5, 0.25),
    });

    // Titolo
    const titleSize = 24;
    const title = s.title.length > 50 ? s.title.slice(0, 47) + "..." : s.title;
    const titleWidth = font.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (W - titleWidth) / 2,
      y: H - 160,
      size: titleSize,
      font,
      color: rgb(0, 0, 0),
    });

    // Sotto-titolo: area / stanza
    const subtitle = `${s.area} · ${s.room}`;
    const subSize = 14;
    const subWidth = font.widthOfTextAtSize(subtitle, subSize);
    page.drawText(subtitle, {
      x: (W - subWidth) / 2,
      y: H - 190,
      size: subSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // QR code centrato
    const url = `${appUrl}/scan/${s.token}`;
    const qrPng = await QRCode.toBuffer(url, {
      margin: 1,
      width: 800,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const qrImage = await pdf.embedPng(qrPng);
    const qrSize = 400;
    page.drawImage(qrImage, {
      x: (W - qrSize) / 2,
      y: (H - qrSize) / 2 - 60,
      width: qrSize,
      height: qrSize,
    });

    // URL in fondo
    const urlSize = 9;
    const urlWidth = font.widthOfTextAtSize(url, urlSize);
    page.drawText(url, {
      x: (W - urlWidth) / 2,
      y: 80,
      size: urlSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Footer Grassi Tech Quest
    const footer = "Grassi Tech Quest · Linux Tech Day 2026";
    const footerSize = 10;
    const footerWidth = font.widthOfTextAtSize(footer, footerSize);
    page.drawText(footer, {
      x: (W - footerWidth) / 2,
      y: 50,
      size: footerSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="qr-stand-${Date.now()}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
