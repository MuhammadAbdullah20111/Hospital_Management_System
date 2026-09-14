import prisma from './config/prismaClient.js';

async function test() {
  try {
    console.log("Testing Prisma connection...");
    const wardCount = await prisma.ward.count();
    console.log("Ward count:", wardCount);
    
    const roomCount = await prisma.room.count();
    console.log("Room count:", roomCount);
    
    const bedCount = await prisma.bed.count();
    console.log("Bed count:", bedCount);
    
    const summary = await prisma.bed.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    console.log("Bed Summary:", summary);
    
    console.log("Prisma is working correctly!");
  } catch (error) {
    console.error("Prisma test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
