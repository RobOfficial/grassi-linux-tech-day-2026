import Papa from "papaparse";

export function parseCsv<T = Record<string, string>>(text: string): T[] {
  const res = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === "string" ? v.trim() : v),
  });
  return res.data as T[];
}

export function toCsv(rows: Record<string, unknown>[]): string {
  return Papa.unparse(rows, { quotes: false });
}

export function boolish(v: unknown, def = true): boolean {
  if (v === undefined || v === null || v === "") return def;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "si" || s === "sì";
}
