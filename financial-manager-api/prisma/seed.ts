import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Roles
  const admin_role = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      slug: 'admin',
    },
  });

  const user_role = await prisma.role.upsert({
    where: { slug: 'user' },
    update: {},
    create: {
      name: 'Usuário',
      slug: 'user',
    },
  });

  // User Statuses
  await prisma.userStatus.upsert({
    where: { slug: 'active' },
    update: {},
    create: {
      name: 'Ativo',
      slug: 'active',
    },
  });

  await prisma.userStatus.upsert({
    where: { slug: 'inactive' },
    update: {},
    create: {
      name: 'Inativo',
      slug: 'inactive',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
