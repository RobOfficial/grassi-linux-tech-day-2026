"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { Role } from "@/lib/constants";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const promoteSchema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function promoteAdmin(formData: FormData) {
  await requireAdmin();
  const { email } = promoteSchema.parse({ email: formData.get("email") });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN, registrationCompletedAt: existing.registrationCompletedAt ?? new Date() },
      });
    }
  } else {
    // Pre-autorizzazione: l'utente non esiste, lo creiamo come ADMIN.
    // Al primo login Google con questa email, l'Auth.js Prisma adapter collegherà
    // l'Account a questo User esistente (allowDangerousEmailAccountLinking=true).
    await prisma.user.create({
      data: { email, role: Role.ADMIN, registrationCompletedAt: new Date() },
    });
  }
  revalidatePath("/admin/admins");
}

export async function demoteAdmin(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const session = await auth();
  if (session?.user?.id === id) throw new Error("Non puoi rimuovere te stesso.");

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });
  if (!target || target.role !== Role.ADMIN) return;

  const envAdmin = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (target.email.toLowerCase() === envAdmin) {
    throw new Error("L'admin definito in ADMIN_EMAIL non può essere rimosso.");
  }

  const totalAdmins = await prisma.user.count({ where: { role: Role.ADMIN } });
  if (totalAdmins <= 1) throw new Error("Deve restare almeno un admin.");

  await prisma.user.update({ where: { id }, data: { role: Role.STUDENT } });
  revalidatePath("/admin/admins");
}
