import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { 
      roleId: 3,
      permission: {
        name: { in: ['create-patient', 'view-patient', 'edit-patient', 'delete-patient'] }
      }
    },
    include: { permission: true }
  });
  console.log(JSON.stringify(rolePermissions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
