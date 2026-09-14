import prisma from '../config/prismaClient.js';

async function inspectStaff() {
  console.log('🔍 Querying active staff members and their biometric PINs...');
  const staffList = await prisma.staff.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      biometricPin: true,
      role: { select: { name: true } }
    }
  });

  console.log(`📊 Total Active Staff: ${staffList.length}`);
  staffList.forEach(s => {
    console.log(`- ID: ${s.id}, Name: ${s.name}, Role: ${s.role?.name || 'N/A'}, PIN: "${s.biometricPin || 'NOT SET'}"`);
  });

  console.log('\n🔍 Querying recent attendance records from the database...');
  const recentRecords = await prisma.attendanceRecord.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10,
    include: { staff: true }
  });

  console.log(`📊 Last 10 records stored in DB:`);
  recentRecords.forEach((r, idx) => {
    console.log(`[${idx + 1}] PIN: ${r.deviceUserPin}, Staff: ${r.staff ? r.staff.name : 'UNMAPPED (null)'}, Time: ${r.timestamp.toISOString()}, Status: ${r.status}`);
  });
  
  process.exit(0);
}

inspectStaff();
