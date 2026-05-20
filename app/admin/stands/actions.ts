"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { newStandToken } from "@/lib/tokens";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  code: z.string().trim().min(1).max(16),
  area: z.string().trim().min(1).max(32),
  room: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  basePoints: z.coerce.number().int().min(0).max(10000).default(10),
});

export async function createStand(formData: FormData) {
  await requireAdmin();
  const data = createSchema.parse({
    code: formData.get("code"),
    area: formData.get("area"),
    room: formData.get("room"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    basePoints: formData.get("basePoints") ?? 10,
  });
  await prisma.stand.create({
    data: {
      code: data.code.toUpperCase(),
      area: data.area,
      room: data.room,
      title: data.title,
      description: data.description || null,
      basePoints: data.basePoints,
      token: newStandToken(),
    },
  });
  revalidatePath("/admin/stands");
}

const updateSchema = createSchema.extend({
  id: z.string(),
  isActive: z.coerce.boolean().optional(),
});

export async function updateStand(formData: FormData) {
  await requireAdmin();
  const data = updateSchema.parse({
    id: formData.get("id"),
    code: formData.get("code"),
    area: formData.get("area"),
    room: formData.get("room"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    basePoints: formData.get("basePoints") ?? 10,
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
  await prisma.stand.update({
    where: { id: data.id },
    data: {
      code: data.code.toUpperCase(),
      area: data.area,
      room: data.room,
      title: data.title,
      description: data.description || null,
      basePoints: data.basePoints,
      isActive: data.isActive ?? true,
    },
  });
  revalidatePath("/admin/stands");
  revalidatePath(`/admin/stands/${data.id}`);
}

export async function toggleStand(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const cur = await prisma.stand.findUnique({ where: { id }, select: { isActive: true } });
  if (!cur) return;
  await prisma.stand.update({ where: { id }, data: { isActive: !cur.isActive } });
  revalidatePath("/admin/stands");
}

export async function regenerateToken(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.stand.update({ where: { id }, data: { token: newStandToken() } });
  revalidatePath("/admin/stands");
  revalidatePath(`/admin/qr/${id}`);
}

export async function deleteStand(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.stand.delete({ where: { id } });
  revalidatePath("/admin/stands");
}
