import prisma from '../../config/prismaClient.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getHomeData = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // 1. Basic Counts
        const totalPatients = await prisma.patient.count();
        const appointmentsToday = await prisma.appointment.count({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        const totalRevenueResult = await prisma.transaction.aggregate({
            where: { type: 'INCOME' },
            _sum: { amount: true }
        });
        const totalRevenue = totalRevenueResult._sum.amount || 0;

        const activeSurgeries = await prisma.appointment.count({
            where: {
                reason: { contains: 'Surgery', mode: 'insensitive' },
                status: 'COMPLETED' // or 'ONGOING' if status exists
            }
        });

        // 2. Patient Flow (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const sevenDaysAgo = last7Days[0];
        const recentPatients = await prisma.patient.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        });

        const patientFlow = last7Days.map(day => {
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            return recentPatients.filter(p => p.createdAt >= day && p.createdAt < nextDay).length;
        });

        // 3. Revenue Distribution by Department
        const departments = await prisma.department.findMany();
        
        // Fetch all relevant income transactions
        const allIncome = await prisma.transaction.findMany({
            where: { type: 'INCOME', staffId: { not: null } },
            select: { amount: true, staff: { select: { departmentId: true } } }
        });

        const revenueByDept = departments.map(dept => {
            const deptIncome = allIncome.filter(t => t.staff && t.staff.departmentId === dept.id);
            const total = deptIncome.reduce((sum, t) => sum + (t.amount || 0), 0);
            return { name: dept.name, value: total };
        });

        const finalRevenueDist = revenueByDept.filter(d => d.value > 0);

        // 4. Department Workload
        // Fetch all relevant appointments
        const allAppointments = await prisma.appointment.findMany({
            where: {
                status: { in: ['PENDING', 'COMPLETED'] },
                doctor: { departmentId: { not: null } }
            },
            select: { status: true, doctor: { select: { departmentId: true } } }
        });

        const departmentWorkload = {
            categories: departments.map(d => d.name),
            ongoing: departments.map(dept => {
                return allAppointments.filter(a => a.status === 'PENDING' && a.doctor && a.doctor.departmentId === dept.id).length;
            }),
            completed: departments.map(dept => {
                return allAppointments.filter(a => a.status === 'COMPLETED' && a.doctor && a.doctor.departmentId === dept.id).length;
            })
        };

        // 5. Recent Cases
        const recentAppointments = await prisma.appointment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                patient: true,
                doctor: true
            }
        });

        const recentCases = recentAppointments.map(app => {
            const statusColors = {
                'PENDING': 'text-amber-600 bg-amber-50',
                'COMPLETED': 'text-emerald-600 bg-emerald-50',
                'CONFIRMED': 'text-blue-600 bg-blue-50',
                'CANCELLED': 'text-red-600 bg-red-50'
            };

            // Format time ago (Simplified)
            const diff = Math.floor((new Date() - app.createdAt) / 60000);
            const timeAgo = diff < 60 ? `${diff} mins ago` : `${Math.floor(diff / 60)} hours ago`;

            return {
                name: app.patient.name,
                type: app.reason || 'General',
                time: timeAgo,
                status: app.status,
                color: statusColors[app.status] || 'text-slate-600 bg-slate-50'
            };
        });

        const stats = {
            totalPatients,
            appointmentsToday,
            totalRevenue,
            activeSurgeries,
            patientFlow,
            revenueDistribution: finalRevenueDist.length > 0 ? finalRevenueDist : [
                { value: 0, name: 'OPD' },
                { value: 0, name: 'ER' }
            ],
            departmentWorkload,
            recentCases
        };

        return ApiResponse.success(res, 'Admin home data fetched successfully', { stats });
    } catch (error) {
        next(error);
    }
};
