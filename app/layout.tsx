import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grassi Tech Quest",
  description: "Tech Quest del Grassi Linux Tech Day 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
