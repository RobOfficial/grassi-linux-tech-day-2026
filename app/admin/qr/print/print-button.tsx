"use client";
export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="print:hidden border border-black px-3 py-1 rounded text-sm">
      ▶ stampa
    </button>
  );
}
