const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const staff = await prisma.staff.findMany({
      include: { role: true }
    });
    console.log(JSON.stringify(staff.map(s => ({
      name: s.name,
      role: s.role.name,
      isActive: s.isActive
    })), null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
