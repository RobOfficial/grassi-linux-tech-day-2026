import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";
import { redirect } from "next/navigation";

// Nota: next/navigation redirect() prepende automaticamente il basePath di Next,
// quindi NON usare appPath() qui (causerebbe /quest/quest/...).

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (user.role === Role.ADMIN) redirect("/admin");
  if (!user.registrationCompleted) redirect("/onboarding");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) redirect("/app");
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
