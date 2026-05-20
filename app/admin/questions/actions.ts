"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  standId: z.string().min(1),
  text: z.string().trim().min(1).max(500),
  opt1: z.string().trim().min(1).max(300),
  opt2: z.string().trim().min(1).max(300),
  opt3: z.string().trim().min(1).max(300),
  opt4: z.string().trim().min(1).max(300),
  correct: z.coerce.number().int().min(1).max(4),
  points: z.union([z.coerce.number().int().min(0).max(10000), z.literal("")]).optional(),
});

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const data = createSchema.parse({
    standId: formData.get("standId"),
    text: formData.get("text"),
    opt1: formData.get("opt1"),
    opt2: formData.get("opt2"),
    opt3: formData.get("opt3"),
    opt4: formData.get("opt4"),
    correct: formData.get("correct"),
    points: formData.get("points") || "",
  });
  await prisma.question.create({
    data: {
      standId: data.standId,
      text: data.text,
      points: typeof data.points === "number" ? data.points : null,
      options: {
        create: [data.opt1, data.opt2, data.opt3, data.opt4].map((text, idx) => ({
          text, position: idx + 1, isCorrect: idx + 1 === data.correct,
        })),
      },
    },
  });
  revalidatePath("/admin/questions");
}

export async function toggleQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const cur = await prisma.question.findUnique({ where: { id }, select: { isActive: true } });
  if (!cur) return;
  await prisma.question.update({ where: { id }, data: { isActive: !cur.isActive } });
  revalidatePath("/admin/questions");
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
}
