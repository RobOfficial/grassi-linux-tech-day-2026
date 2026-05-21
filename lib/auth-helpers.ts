import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";
import { redirect } from "next/navigation";
import { appPath } from "@/lib/utils";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect(appPath("/login"));
  return session.user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (user.role === Role.ADMIN) redirect(appPath("/admin"));
  if (!user.registrationCompleted) redirect(appPath("/onboarding"));
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) redirect(appPath("/app"));
  return user;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === Role.ADMIN;
}
