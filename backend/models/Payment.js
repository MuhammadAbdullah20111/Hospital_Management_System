import prisma from '../config/prismaClient.js';

class Payment {
    static async create(data) {
        // Map legacy payment to transaction
        return prisma.transaction.create({
            data: {
                type: 'INCOME',
                amount: data.amount,
                method: data.method || 'CASH',
                patientId: data.patientId,
                appointmentId: data.appointmentId,
                categoryId: 6, // Fallback to 'Other Income' or similar
                notes: 'Legacy payment migration'
            },
        });
    }

    static async findAll(query = {}) {
        const where = { type: 'INCOME' };
        if (query.appointmentId) where.appointmentId = parseInt(query.appointmentId);
        if (query.patientId) where.patientId = parseInt(query.patientId);
        if (query.labTestId) where.labTestId = parseInt(query.labTestId);
        if (query.bedAssignmentId) where.bedAssignmentId = parseInt(query.bedAssignmentId);

        return prisma.transaction.findMany({
            where,
            include: {
                patient: true,
                category: true,
                appointment: {
                    include: {
                        doctor: {
                            select: { name: true }
                        },
                        queueToken: true
                    }
                },
                labTest: {
                    include: { queueToken: true }
                },
                bedAssignment: {
                    include: {
                        bed: {
                            select: { bedNumber: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async findById(id) {
        return prisma.transaction.findUnique({
            where: { id },
            include: {
                patient: true,
                category: true
            },
        });
    }

    static async update(id, data) {
        return prisma.transaction.update({
            where: { id },
            data: {
                amount: data.amount,
                method: data.method,
                patientId: data.patientId,
                appointmentId: data.appointmentId
            },
        });
    }

    static async delete(id) {
        return prisma.transaction.delete({
            where: { id },
        });
    }
}

export default Payment;
