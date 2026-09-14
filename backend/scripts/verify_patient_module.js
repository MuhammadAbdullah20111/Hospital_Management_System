import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Patient Module Verification...');

    // 1. Create a mock Department and Role for the Doctor (if not exist)
    let role = await prisma.role.findFirst({ where: { name: 'Doctor' } });
    if (!role) {
        role = await prisma.role.create({ data: { name: 'Doctor' } });
    }

    let department = await prisma.department.findFirst({ where: { name: 'General Medicine' } });
    if (!department) {
        department = await prisma.department.create({ data: { name: 'General Medicine' } });
    }

    // 2. Create a mock Staff (Doctor)
    const doctorEmail = 'testdoctor@example.com';
    let doctor = await prisma.staff.findUnique({ where: { email: doctorEmail } });
    if (!doctor) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        doctor = await prisma.staff.create({
            data: {
                name: 'Test Doctor',
                email: doctorEmail,
                password: hashedPassword,
                roleId: role.id,
                departmentId: department.id,
            },
        });
        console.log('Created Test Doctor:', doctor.id);
    } else {
        console.log('Using existing Test Doctor:', doctor.id);
    }

    // 3. Create a Patient
    const patientEmail = 'testpatient@example.com';
    // Cleanup previous runs
    await prisma.transaction.deleteMany({ where: { patient: { email: patientEmail } } });
    await prisma.appointment.deleteMany({ where: { patient: { email: patientEmail } } });
    await prisma.labTest.deleteMany({ where: { patient: { email: patientEmail } } });
    await prisma.patient.deleteMany({ where: { email: patientEmail } });

    const patient = await prisma.patient.create({
        data: {
            mrNumber: 'MR-' + Date.now(),
            name: 'Test Patient',
            email: patientEmail,
            age: 30,
            gender: 'Male',
            phoneNumber: '1234567890',
        },
    });
    console.log('Created Patient:', patient.id);

    // 4. Create an Appointment linked to Patient and Doctor
    const appointment = await prisma.appointment.create({
        data: {
            date: new Date(),
            time: '10:00 AM',
            reason: 'Regular startup checkup',
            status: 'PENDING',
            patientId: patient.id,
            doctorId: doctor.id,
        },
    });
    console.log('Created Appointment:', appointment.id);

    // 5. Create a Lab Test linked to Patient
    const labTest = await prisma.labTest.create({
        data: {
            testName: 'Blood Test',
            status: 'PENDING',
            patientId: patient.id,
            conductedById: doctor.id, // Doctor conducting it for test purposes
        },
    });
    console.log('Created LabTest:', labTest.id);

    // 6. Create a Payment linked to Patient and Appointment
    const payment = await prisma.transaction.create({
        data: {
            type: 'INCOME',
            amount: 50.0,
            method: 'CASH',
            patientId: patient.id,
            appointmentId: appointment.id,
            categoryId: 1
        },
    });
    console.log('Created Payment:', payment.id);

    // 7. Verify Retrieval
    const fetchedPatient = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: {
            appointments: true,
            labTests: true,
            transactions: true
        }
    });

    console.log('\n--- Verification Results ---');
    console.log('Patient Name:', fetchedPatient.name);
    console.log('Appointments:', fetchedPatient.appointments.length);
    console.log('LabTests:', fetchedPatient.labTests.length);
    console.log('Transactions:', fetchedPatient.transactions.length);

    if (
        fetchedPatient.appointments.length === 1 &&
        fetchedPatient.labTests.length === 1 &&
        fetchedPatient.transactions.length === 1
    ) {
        console.log('SUCCESS: All modules linked correctly.');
    } else {
        console.error('FAILURE: Linking mismatch.');
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
