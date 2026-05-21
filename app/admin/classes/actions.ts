"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { parseCsv } from "@/lib/csv";
import { revalidatePath } from "next/cache";

const nameSchema = z.string().trim().min(1).max(16);

export async function createClass(formData: FormData) {
  await requireAdmin();
  const name = nameSchema.parse(formData.get("name")).toUpperCase();
  await prisma.schoolClass.upsert({ where: { name }, update: {}, create: { name } });
  revalidatePath("/admin/classes");
  revalidatePath("/onboarding");
}

export async function deleteClass(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.schoolClass.delete({ where: { id } });
  revalidatePath("/admin/classes");
  revalidatePath("/onboarding");
}

async function readCsv(fd: FormData): Promise<string> {
  const file = fd.get("file");
  if (file instanceof File && file.size > 0) return await file.text();
  return String(fd.get("csv") ?? "");
}

export async function importClasses(formData: FormData) {
  await requireAdmin();
  try {
    const text = await readCsv(formData);
    if (!text.trim()) return { error: "CSV vuoto" };

    // Supporta sia "name\n5AI" sia semplicemente "5AI" per riga.
    const rows = parseCsv(text);
    const names: string[] = [];
    if (rows.length > 0 && typeof (rows[0] as Record<string, string>).name === "string") {
      for (const r of rows as Record<string, string>[]) if (r.name?.trim()) names.push(r.name.trim().toUpperCase());
    } else {
      // Nessun header riconoscibile: parse riga per riga.
      for (const line of text.split(/\r?\n/)) {
        const v = line.trim();
        if (v && v.toLowerCase() !== "name") names.push(v.toUpperCase());
      }
    }

    let created = 0;
    const errors: string[] = [];
    for (const name of names) {
      try {
        const res = await prisma.schoolClass.upsert({ where: { name }, update: {}, create: { name } });
        if (res.createdAt.getTime() > Date.now() - 5000) created++;
      } catch (e) {
        errors.push(`${name}: ${(e as Error).message}`);
      }
    }
    revalidatePath("/admin/classes");
    revalidatePath("/onboarding");
    return { ok: true, created, skipped: errors.length, errors };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
