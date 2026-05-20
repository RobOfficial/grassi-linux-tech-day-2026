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
