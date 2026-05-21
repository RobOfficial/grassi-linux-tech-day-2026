"use client";
import { useState, useTransition } from "react";

type ImportResult = { ok?: boolean; created?: number; skipped?: number; errors?: string[]; error?: string };

export function ImportClassesForm({ action }: { action: (fd: FormData) => Promise<ImportResult> }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => setResult(await action(fd)));
      }}
    >
      <textarea className="input font-mono h-32" name="csv" placeholder="name&#10;1AI&#10;1BI&#10;5AI" required />
      <div className="flex items-center gap-3">
        <input type="file" name="file" accept=".csv,text/csv" className="text-xs" />
        <button className="btn" disabled={pending}>{pending ? "› import..." : "▶ import"}</button>
      </div>
      {result && (
        <div className="mt-2 text-sm border border-border rounded p-2">
          {result.error ? (
            <p className="text-destructive">{result.error}</p>
          ) : (
            <p className="text-primary">✔ create: {result.created ?? 0} · scartate: {result.skipped ?? 0}</p>
          )}
        </div>
      )}
    </form>
  );
}
