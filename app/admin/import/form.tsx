"use client";
import { useState, useTransition } from "react";

type ImportResult = { ok?: boolean; created?: number; updated?: number; skipped?: number; errors?: string[]; error?: string };

export function ImportForm({ action }: { action: (fd: FormData) => Promise<ImportResult> }) {
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
      <textarea className="input font-mono h-40" name="csv" placeholder="incolla qui il CSV..." required />
      <div className="flex items-center gap-3">
        <input type="file" name="file" accept=".csv,text/csv" className="text-xs" />
        <button className="btn" disabled={pending}>{pending ? "› import..." : "▶ import"}</button>
      </div>
      {result && (
        <div className="mt-2 text-sm border border-border rounded p-2">
          {result.error ? (
            <p className="text-destructive">{result.error}</p>
          ) : (
            <>
              <p className="text-primary">✔ creati: {result.created ?? 0} · aggiornati: {result.updated ?? 0} · scartati: {result.skipped ?? 0}</p>
              {result.errors && result.errors.length > 0 && (
                <details className="mt-1">
                  <summary className="text-destructive cursor-pointer">errori ({result.errors.length})</summary>
                  <ul className="mt-1 list-disc pl-5 text-xs text-destructive">
                    {result.errors.slice(0, 50).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
