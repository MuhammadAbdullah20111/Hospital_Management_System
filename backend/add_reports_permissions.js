import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const actions = ['view', 'create', 'edit', 'delete'];
  const entity = 'reports';

  for (const action of actions) {
    const name = `${action}-${entity}`;
    const perm = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Created/Verified permission: ${name}`);
    
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (adminRole) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      });
      console.log(`Assigned ${name} to ADMIN role.`);
    }
  }
  console.log('Reports permissions successfully added to live database.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
