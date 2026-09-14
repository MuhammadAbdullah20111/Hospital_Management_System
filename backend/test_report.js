import prisma from './config/prismaClient.js';

async function testReport() {
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    console.log("Checking for date range:", start, "to", end);

    const appointments = await prisma.appointment.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { doctor: true, createdBy: true }
    });
    console.log("Found Appointments:", appointments.length);

    const transactions = await prisma.transaction.findMany({
        where: { 
            createdAt: { gte: start, lte: end },
            status: 'PAID',
            type: 'INCOME'
        }
    });
    console.log("Found Paid Transactions:", transactions.length);
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    console.log("Total Revenue:", totalRevenue);

    // Receptionist Stats
    const receptionistStatsMap = {};
    appointments.forEach(appt => {
        if (appt.createdById && appt.createdBy) {
            const recId = appt.createdById;
            if (!receptionistStatsMap[recId]) {
                receptionistStatsMap[recId] = {
                    name: appt.createdBy.name,
                    appointmentsBooked: 0
                };
            }
            receptionistStatsMap[recId].appointmentsBooked++;
        }
    });
    console.log("Receptionist Stats:", receptionistStatsMap);
}

testReport().catch(console.error).finally(() => prisma.$disconnect());
