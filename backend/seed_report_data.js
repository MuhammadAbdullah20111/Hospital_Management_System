import prisma from './config/prismaClient.js';

async function seedData() {
    console.log("Seeding report data...");

    const patients = await prisma.patient.findMany({ take: 5 });
    if (patients.length === 0) {
        console.log("No patients found. Please create at least one patient first.");
        return;
    }

    const doctors = await prisma.staff.findMany({
        where: { role: { name: { contains: 'DOCTOR' } } }
    });

    const receptionists = await prisma.staff.findMany({
        where: { role: { name: { contains: 'RECEPTIONIST' } } }
    });

    const categories = await prisma.transactionCategory.findMany();

    if (doctors.length === 0 || receptionists.length === 0 || categories.length === 0) {
        console.log("Missing doctors, receptionists, or transaction categories. Cannot seed properly.");
        return;
    }

    const today = new Date();
    let seededAppts = 0;

    // Create data for the past 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Add 1-4 appointments per day
        const numAppts = Math.floor(Math.random() * 4) + 1;
        for (let j = 0; j < numAppts; j++) {
            const doc = doctors[Math.floor(Math.random() * doctors.length)];
            const rec = receptionists[Math.floor(Math.random() * receptionists.length)];
            const pat = patients[Math.floor(Math.random() * patients.length)];
            const cat = categories[Math.floor(Math.random() * categories.length)];

            const appt = await prisma.appointment.create({
                data: {
                    patientId: pat.id,
                    doctorId: doc.id,
                    createdById: rec.id,
                    date: date,
                    time: "10:00 AM",
                    reason: "Follow-up consultation",
                    status: "COMPLETED",
                    createdAt: date,
                    updatedAt: date
                }
            });

            await prisma.transaction.create({
                data: {
                    categoryId: cat.id,
                    patientId: pat.id,
                    appointmentId: appt.id,
                    amount: Math.floor(Math.random() * 1500) + 500,
                    type: "INCOME",
                    status: "PAID",
                    method: "CASH",
                    referenceNumber: `REF-${Date.now()}-${j}`,
                    notes: "Seeded transaction for testing",
                    staffId: rec.id,
                    createdAt: date,
                    updatedAt: date
                }
            });

            seededAppts++;
        }
    }

    // Seed some new patients registered in the last 30 days
    let seededPatients = 0;
    for(let i=0; i<5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const rec = receptionists[Math.floor(Math.random() * receptionists.length)];
        await prisma.patient.create({
            data: {
                mrNumber: `MR-${Date.now()}-${i}`,
                name: `Seeded Patient ${i+1}`,
                age: 30 + i,
                gender: "MALE",
                phoneNumber: `+92300000000${i}`,
                address: "Seeded Address",
                createdById: rec.id,
                createdAt: date,
                updatedAt: date
            }
        });
        seededPatients++;
    }

    console.log(`Successfully seeded ${seededAppts} appointments/transactions and ${seededPatients} new patients over the past 30 days!`);
}

seedData().catch(console.error).finally(() => prisma.$disconnect());
