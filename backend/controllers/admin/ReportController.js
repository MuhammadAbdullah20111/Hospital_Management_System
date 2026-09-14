import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getComprehensiveReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (startDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    }

    // 1. Fetch data
    const patients = await prisma.patient.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { createdBy: true }
    });

    const appointments = await prisma.appointment.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { doctor: true, createdBy: true, patient: true }
    });

    const labTests = await prisma.labTest.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { conductedBy: true, createdBy: true, patient: true }
    });

    const transactions = await prisma.transaction.findMany({
        where: { 
            createdAt: { gte: start, lte: end },
            status: 'PAID',
            type: 'INCOME'
        }
    });

    // 2. Aggregate Data

    // Doctor Stats
    const doctorStatsMap = {};
    appointments.forEach(appt => {
        if (appt.doctorId && appt.doctor) {
            const docId = appt.doctorId;
            if (!doctorStatsMap[docId]) {
                doctorStatsMap[docId] = {
                    id: docId,
                    name: appt.doctor.name,
                    appointmentsHandled: 0,
                    details: []
                };
            }
            doctorStatsMap[docId].appointmentsHandled++;
            doctorStatsMap[docId].details.push(appt);
        }
    });
    const doctorStats = Object.values(doctorStatsMap);

    // Receptionist Stats
    const receptionistStatsMap = {};
    patients.forEach(pt => {
        if (pt.createdById && pt.createdBy) {
            const recId = pt.createdById;
            if (!receptionistStatsMap[recId]) {
                receptionistStatsMap[recId] = {
                    id: recId,
                    name: pt.createdBy.name,
                    patientsRegistered: 0,
                    appointmentsBooked: 0,
                    registeredDetails: [],
                    bookedDetails: []
                };
            }
            receptionistStatsMap[recId].patientsRegistered++;
            receptionistStatsMap[recId].registeredDetails.push(pt);
        }
    });
    appointments.forEach(appt => {
        if (appt.createdById && appt.createdBy) {
            const recId = appt.createdById;
            if (!receptionistStatsMap[recId]) {
                receptionistStatsMap[recId] = {
                    id: recId,
                    name: appt.createdBy.name,
                    patientsRegistered: 0,
                    appointmentsBooked: 0,
                    registeredDetails: [],
                    bookedDetails: []
                };
            }
            receptionistStatsMap[recId].appointmentsBooked++;
            receptionistStatsMap[recId].bookedDetails.push(appt);
        }
    });
    const receptionistStats = Object.values(receptionistStatsMap);

    // Lab Tech Stats
    const labStatsMap = {};
    labTests.forEach(test => {
        if (test.conductedById && test.conductedBy) {
            const techId = test.conductedById;
            if (!labStatsMap[techId]) {
                labStatsMap[techId] = {
                    id: techId,
                    name: test.conductedBy.name,
                    testsConducted: 0,
                    details: []
                };
            }
            labStatsMap[techId].testsConducted++;
            labStatsMap[techId].details.push(test);
        }
    });
    const labStats = Object.values(labStatsMap);

    // Revenue Stats
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Daily Revenue Trend (for charts)
    const revenueTrendMap = {};
    transactions.forEach(tx => {
        const dateStr = tx.createdAt.toISOString().split('T')[0];
        if (!revenueTrendMap[dateStr]) revenueTrendMap[dateStr] = 0;
        revenueTrendMap[dateStr] += (tx.amount || 0);
    });
    const revenueTrend = Object.keys(revenueTrendMap).sort().map(date => ({
        date,
        revenue: revenueTrendMap[date]
    }));

    return ApiResponse.success(res, 'Comprehensive report fetched successfully', {
        summary: {
            totalRevenue,
            totalAppointments: appointments.length,
            totalPatientsRegistered: patients.length,
            totalLabTests: labTests.length
        },
        doctorStats,
        receptionistStats,
        labStats,
        revenueTrend
    });
});
