"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { parseCsv, boolish } from "@/lib/csv";
import { newStandToken } from "@/lib/tokens";
import { revalidatePath } from "next/cache";

type Result = { ok?: boolean; created?: number; updated?: number; skipped?: number; errors?: string[]; error?: string };

async function readCsv(fd: FormData): Promise<string> {
  const file = fd.get("file");
  if (file instanceof File && file.size > 0) return await file.text();
  return String(fd.get("csv") ?? "");
}

const standRow = z.object({
  code: z.string().min(1),
  area: z.string().min(1),
  room: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  basePoints: z.coerce.number().int().min(0).max(10000).optional().default(10),
  isActive: z.string().optional().default("true"),
});

export async function importStands(formData: FormData): Promise<Result> {
  await requireAdmin();
  try {
    const text = await readCsv(formData);
    if (!text.trim()) return { error: "CSV vuoto" };
    const rows = parseCsv(text);
    if (rows.length === 0) return { error: "Nessuna riga" };

    let created = 0, updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] as Record<string, string>;
      const parsed = standRow.safeParse(r);
      if (!parsed.success) {
        errors.push(`riga ${i + 2}: ${parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        continue;
      }
      const d = parsed.data;
      const code = d.code.toUpperCase();
      const existing = await prisma.stand.findUnique({ where: { code } });
      try {
        if (existing) {
          await prisma.stand.update({
            where: { code },
            data: {
              title: d.title, area: d.area, room: d.room,
              description: d.description || null,
              basePoints: d.basePoints,
              isActive: boolish(d.isActive),
            },
          });
          updated++;
        } else {
          await prisma.stand.create({
            data: {
              code, title: d.title, area: d.area, room: d.room,
              description: d.description || null,
              basePoints: d.basePoints,
              isActive: boolish(d.isActive),
              token: newStandToken(),
            },
          });
          created++;
        }
      } catch (e) {
        errors.push(`riga ${i + 2} (${code}): ${(e as Error).message}`);
      }
    }
    revalidatePath("/admin/stands");
    return { ok: true, created, updated, skipped: errors.length, errors };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

const questionRow = z.object({
  standCode: z.string().min(1),
  question: z.string().min(1),
  option1: z.string().min(1),
  option2: z.string().min(1),
  option3: z.string().min(1),
  option4: z.string().min(1),
  correctOption: z.coerce.number().int().min(1).max(4),
  points: z.coerce.number().int().min(0).max(10000).optional(),
  isActive: z.string().optional().default("true"),
});

export async function importQuestions(formData: FormData): Promise<Result> {
  await requireAdmin();
  try {
    const text = await readCsv(formData);
    if (!text.trim()) return { error: "CSV vuoto" };
    const rows = parseCsv(text);
    let created = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] as Record<string, string>;
      const parsed = questionRow.safeParse(r);
      if (!parsed.success) {
        errors.push(`riga ${i + 2}: ${parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        continue;
      }
      const d = parsed.data;
      const stand = await prisma.stand.findUnique({ where: { code: d.standCode.toUpperCase() } });
      if (!stand) {
        errors.push(`riga ${i + 2}: stand ${d.standCode} non trovato`);
        continue;
      }
      try {
        await prisma.question.create({
          data: {
            standId: stand.id,
            text: d.question,
            points: d.points ?? null,
            isActive: boolish(d.isActive),
            options: {
              create: [d.option1, d.option2, d.option3, d.option4].map((text, idx) => ({
                text, position: idx + 1, isCorrect: idx + 1 === d.correctOption,
              })),
            },
          },
        });
        created++;
      } catch (e) {
        errors.push(`riga ${i + 2}: ${(e as Error).message}`);
      }
    }
    revalidatePath("/admin/questions");
    return { ok: true, created, skipped: errors.length, errors };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
