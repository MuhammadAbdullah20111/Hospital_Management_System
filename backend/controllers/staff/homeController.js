import prisma from '../../config/prismaClient.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getHomeData = asyncHandler(async (req, res) => {
    const staffId = parseInt(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Fetch staff and their role
    const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        include: { role: true }
    });

    if (!staff) {
        return ApiResponse.error(res, 'Staff member not found', 404);
    }

    const roleName = staff.role.name.toUpperCase();
    console.log(`Staff ${staff.name} has role: ${roleName}`);
    let stats = {};

    if (roleName.includes('LAB') || roleName.includes('TECHNICIAN')) {
        // Lab Technician specific stats
        const [
            testsPending,
            completedToday,
            totalPatients,
            activePatients,
            upcomingRequests,
            recentUpdates
        ] = await Promise.all([
            prisma.labTest.count({ where: { status: 'PENDING' } }),
            prisma.labTest.count({
                where: { status: 'COMPLETED', updatedAt: { gte: today, lt: tomorrow } }
            }),
            prisma.patient.count({ where: { labTests: { some: {} } } }),
            prisma.patient.count({ where: { labTests: { some: { status: 'PENDING' } } } }),
            prisma.labTest.findMany({
                where: { status: 'PENDING' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { patient: true }
            }),
            prisma.labTest.findMany({
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: { patient: true }
            })
        ]);

        const formattedUpcoming = upcomingRequests.map(test => ({
            id: test.id,
            patientId: test.patientId,
            patientName: test.patient.name,
            time: test.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason: test.testName,
            status: test.status
        }));

        const formattedUpdates = recentUpdates.map(test => {
            const diff = Math.floor((new Date() - test.updatedAt) / 60000);
            const timeAgo = diff < 60 ? `${diff} mins ago` : `${Math.floor(diff / 60)} hours ago`;

            let action = "test was updated";
            if (test.status === 'COMPLETED') action = `marked ${test.testName} as completed`;
            if (test.status === 'PENDING') action = `requested ${test.testName}`;

            return {
                id: test.id,
                patientId: test.patientId,
                patientName: test.patient.name,
                action: action,
                time: timeAgo
            };
        });

        stats = {
            appointmentsToday: testsPending, // Reusing key for UI compatibility
            pendingTasks: testsPending,
            completedTasks: completedToday,
            activePatients: activePatients,
            upcomingAppointments: formattedUpcoming,
            recentUpdates: formattedUpdates,
            isLabRole: true // Flag for frontend
        };
    } else {
        // Stats for Doctor (Personal) vs Receptionist (Global)
        const isReceptionist = roleName === 'RECEPTIONIST';
        const appointmentFilter = isReceptionist ? {} : { doctorId: staffId };

        const [
            appointmentsToday,
            pendingTasks,
            completedTasks,
            activePatients,
            upcomingAppointments,
            recentUpdates,
            recentPayments
        ] = await Promise.all([
            prisma.appointment.count({
                where: { ...appointmentFilter, date: { gte: today, lt: tomorrow } }
            }),
            prisma.appointment.count({
                where: { ...appointmentFilter, status: 'PENDING' }
            }),
            prisma.appointment.count({
                where: { ...appointmentFilter, status: 'COMPLETED', updatedAt: { gte: today, lt: tomorrow } }
            }),
            prisma.patient.count({
                where: isReceptionist ? {} : { appointments: { some: { doctorId: staffId, status: { not: 'CANCELLED' } } } }
            }),
            prisma.appointment.findMany({
                where: { ...appointmentFilter, date: { gte: today }, status: { in: ['PENDING', 'CONFIRMED'] } },
                take: 5,
                orderBy: { date: 'asc' },
                include: { patient: true }
            }),
            prisma.appointment.findMany({
                where: appointmentFilter,
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: { patient: true }
            }),
            isReceptionist ? prisma.transaction.findMany({
                where: { type: 'INCOME' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { 
                    patient: { select: { name: true, mrNumber: true } },
                    category: { select: { name: true } }
                }
            }) : Promise.resolve([])
        ]);

        const formattedUpcoming = upcomingAppointments.map(app => ({
            id: app.id,
            patientId: app.patientId,
            patientName: app.patient.name,
            time: app.time,
            reason: app.reason || 'General Consultation',
            status: app.status
        }));

        const formattedUpdates = recentUpdates.map(app => {
            const diff = Math.floor((new Date() - app.updatedAt) / 60000);
            const timeAgo = diff < 60 ? `${diff} mins ago` : `${Math.floor(diff / 60)} hours ago`;

            let action = "was updated";
            if (app.status === 'COMPLETED') action = "was marked as completed";
            if (app.status === 'CONFIRMED') action = "was confirmed";
            if (app.status === 'CANCELLED') action = "was cancelled";

            return {
                id: app.id,
                patientId: app.patientId,
                patientName: app.patient.name,
                action: action,
                time: timeAgo
            };
        });

        stats = {
            appointmentsToday,
            pendingTasks,
            completedTasks,
            activePatients,
            upcomingAppointments: formattedUpcoming,
            recentUpdates: formattedUpdates,
            isLabRole: false
        };

        if (isReceptionist && recentPayments) {
            stats.recentPayments = recentPayments;
        }
    }

    return ApiResponse.success(res, 'Staff home data fetched successfully', { stats });
});
