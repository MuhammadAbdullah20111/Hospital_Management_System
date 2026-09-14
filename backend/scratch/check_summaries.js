import prisma from '../config/prismaClient.js';

async function checkSummaries() {
  console.log('🔍 Querying daily attendance summaries for today (2026-06-06)...');
  const summaries = await prisma.dailyAttendanceSummary.findMany({
    where: {
      date: {
        gte: new Date('2026-06-06T00:00:00Z'),
        lte: new Date('2026-06-06T23:59:59Z')
      }
    },
    include: { staff: true }
  });

  console.log(`📊 Total summaries found for today: ${summaries.length}`);
  summaries.forEach((s, idx) => {
    console.log(`[${idx + 1}] Staff: ${s.staff.name} (PIN: ${s.staff.biometricPin}), Date: ${s.date.toISOString()}, CheckIn: ${s.checkIn ? s.checkIn.toISOString() : 'null'}, CheckOut: ${s.checkOut ? s.checkOut.toISOString() : 'null'}, Status: ${s.status}`);
  });

  console.log('\n🔍 Let\'s also query all summaries in the database (last 10 total):');
  const allSummaries = await prisma.dailyAttendanceSummary.findMany({
    orderBy: { date: 'desc' },
    take: 10,
    include: { staff: true }
  });
  allSummaries.forEach((s, idx) => {
    console.log(`- Staff: ${s.staff.name}, Date: ${s.date.toISOString()}, CheckIn: ${s.checkIn ? s.checkIn.toISOString() : 'null'}, Status: ${s.status}`);
  });

  process.exit(0);
}

checkSummaries();
