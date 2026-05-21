import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

export function basePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || "/quest";
}

// NextAuth signIn/signOut redirectTo NON conosce il basePath di Next:
// va passato un path già prefissato altrimenti redirige a /app invece di /quest/app.
export function appPath(path: string): string {
  if (!path) return basePath() || "/";
  if (/^https?:\/\//i.test(path)) return path;
  const bp = basePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (bp && p.startsWith(`${bp}/`)) return p;
  if (bp && p === bp) return p;
  return `${bp}${p}`;
}
