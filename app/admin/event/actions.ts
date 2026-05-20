"use server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function toggleEventClosed() {
  await requireAdmin();
  const cur = await prisma.eventSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, isClosed: false } });
  await prisma.eventSettings.update({ where: { id: 1 }, data: { isClosed: !cur.isClosed } });
  revalidatePath("/admin/event");
}
