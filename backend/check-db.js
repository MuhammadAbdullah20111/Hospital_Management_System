import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const wards = await prisma.ward.count();
  const rooms = await prisma.room.count();
  const beds = await prisma.bed.count();
  const assignments = await prisma.bedAssignment.count();
  const activeAssignments = await prisma.bedAssignment.count({ where: { actualDischargeAt: null } });
  
  console.log({ wards, rooms, beds, assignments, activeAssignments });
  process.exit(0);
}

check();
