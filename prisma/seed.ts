import { PrismaClient } from "@prisma/client";
import { BadgeCondition, Role } from "../lib/constants";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[seed] ADMIN_EMAIL non impostato: nessun admin creato.");
  } else {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: Role.ADMIN, registrationCompletedAt: new Date() },
      create: {
        email: adminEmail,
        role: Role.ADMIN,
        name: "Admin",
        surname: "Tech Quest",
        registrationCompletedAt: new Date(),
      },
    });
    console.log(`[seed] admin ok: ${adminEmail}`);
  }

  const badges = [
    { slug: "kernel-explorer", name: "Kernel Explorer", description: "Completa 1 stand", icon: "kernel", conditionType: BadgeCondition.STANDS_COMPLETED, threshold: 1 },
    { slug: "debugger", name: "Debugger", description: "Completa 3 stand", icon: "bug", conditionType: BadgeCondition.STANDS_COMPLETED, threshold: 3 },
    { slug: "packet-hunter", name: "Packet Hunter", description: "Completa 5 stand", icon: "network", conditionType: BadgeCondition.STANDS_COMPLETED, threshold: 5 },
    { slug: "root-master", name: "Root Master", description: "Raggiungi 100 punti", icon: "shield", conditionType: BadgeCondition.TOTAL_POINTS, threshold: 100 },
    { slug: "tux-champion", name: "Tux Champion", description: "Raggiungi 250 punti", icon: "crown", conditionType: BadgeCondition.TOTAL_POINTS, threshold: 250 },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description, icon: b.icon, conditionType: b.conditionType, threshold: b.threshold },
      create: b,
    });
  }
  console.log(`[seed] ${badges.length} badge ok.`);

  await prisma.eventSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, isClosed: false },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
