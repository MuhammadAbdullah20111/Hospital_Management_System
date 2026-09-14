import prisma from './config/prismaClient.js';

async function main() {
    const staff = await prisma.staff.findFirst({
        where: { name: { contains: 'Nasir', mode: 'insensitive' } }
    });
    
    if (staff) {
        console.log("NASIR KHAN FOUND IN DATABASE:");
        console.log(JSON.stringify(staff, null, 2));
    } else {
        console.log("NASIR KHAN NOT FOUND IN DATABASE.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
