import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          surname: 'Admin',
          class: 'Admin Class',
          role: 'ADMIN',
        },
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }
  } else {
    console.error('ADMIN_EMAIL is not defined in the environment variables.');
  }

  // Seed initial badges
  const badges = [
    { name: 'Kernel Explorer', description: 'Completa 1 stand' },
    { name: 'Debugger', description: 'Completa 3 stand' },
    { name: 'Packet Hunter', description: 'Completa 5 stand' },
    { name: 'Root Master', description: 'Raggiungi una soglia punti configurabile' },
    { name: 'Tux Champion', description: 'Raggiungi una soglia alta o top ranking' },
  ];

  for (const badge of badges) {
    const existingBadge = await prisma.badge.findUnique({
      where: { name: badge.name },
    });

    if (!existingBadge) {
      await prisma.badge.create({
        data: badge,
      });
      console.log(`Badge created: ${badge.name}`);
    } else {
      console.log(`Badge already exists: ${badge.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });