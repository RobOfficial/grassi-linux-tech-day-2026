"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const allowedFields = ["name", "surname", "className"] as const;

export async function updateUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const field = String(formData.get("field"));
  const value = String(formData.get("value") ?? "").trim();
  if (!allowedFields.includes(field as (typeof allowedFields)[number])) return;
  const parsed = z.string().max(64).parse(value);
  const data: Record<string, string> = {};
  data[field] = field === "className" ? parsed.toUpperCase() : parsed;
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/users");
}

export async function resetOnboarding(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.user.update({ where: { id }, data: { registrationCompletedAt: null } });
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
