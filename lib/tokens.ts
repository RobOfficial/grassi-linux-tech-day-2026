import { randomBytes } from "crypto";

// Token URL-safe, ~22 caratteri base64url, sufficiente per ~128 bit di entropia.
export function newStandToken(): string {
  return randomBytes(16).toString("base64url");
}
