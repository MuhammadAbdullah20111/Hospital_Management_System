import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Roles:");
    const roles = await prisma.role.findMany();
    console.table(roles);

    console.log("Staff:");
    const staff = await prisma.staff.findMany({ include: { role: true } });
    console.table(staff.map(s => ({
        id: s.id,
        name: s.name,
        roleId: s.roleId,
        roleName: s.role?.name,
        isActive: s.isActive
    })));
}

main().finally(() => prisma.$disconnect());
