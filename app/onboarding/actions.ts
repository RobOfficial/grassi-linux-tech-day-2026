"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(1).max(64),
  surname: z.string().trim().min(1).max(64),
  className: z.string().trim().min(1).max(16),
});

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Sessione assente." };
  if (session.user.role === Role.ADMIN) return { error: "L'admin non deve compilare profilo." };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    surname: formData.get("surname"),
    className: formData.get("className"),
  });
  if (!parsed.success) return { error: "Dati non validi." };

  const className = parsed.data.className.toUpperCase();
  // Validazione: la classe deve esistere nell'elenco dell'admin.
  const exists = await prisma.schoolClass.findUnique({ where: { name: className } });
  if (!exists) return { error: "Classe non valida. Selezionane una dall'elenco." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      surname: parsed.data.surname,
      className,
      registrationCompletedAt: new Date(),
    },
  });

  return { ok: true };
}
