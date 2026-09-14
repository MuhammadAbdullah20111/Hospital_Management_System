import prisma from '../config/prismaClient.js';

class LabTest {
    static async create(data) {
        return prisma.labTest.create({
            data,
        });
    }

    static async findAll(query = {}) {
        return prisma.labTest.findMany({
            where: query,
            include: {
                patient: true,
                conductedBy: true,
                test: true,
                queueToken: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async findById(id) {
        return prisma.labTest.findUnique({
            where: { id },
            include: {
                patient: true,
                conductedBy: true,
                test: true,
                queueToken: true,
            },
        });
    }

    static async update(id, data) {
        return prisma.labTest.update({
            where: { id },
            data,
        });
    }

    static async delete(id) {
        return prisma.labTest.delete({
            where: { id },
        });
    }
}

export default LabTest;
