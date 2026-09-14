import prisma from '../config/prismaClient.js';

class Patient {
    static async create(data) {
        return prisma.patient.create({
            data,
        });
    }

    static async findAll(query = {}) {
        return prisma.patient.findMany({
            where: query,
            orderBy: { createdAt: 'desc' },
        });
    }

    static async findById(id) {
        return prisma.patient.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: {
                        doctor: {
                            select: {
                                id: true,
                                name: true,
                                consultationFee: true
                            }
                        }
                    }
                },
                labTests: {
                    include: {
                        test: true
                    }
                },
                transactions: true,
                bedAssignments: {
                    include: {
                        bed: {
                            include: {
                                room: {
                                    include: {
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                },
                assetRents: true
            },
        });
    }

    static async findByEmail(email) {
        return prisma.patient.findFirst({ // findFirst because email is optional/not unique in schema
            where: { email },
        });
    }

    static async update(id, data) {
        return prisma.patient.update({
            where: { id },
            data,
        });
    }

    static async delete(id) {
        return prisma.patient.delete({
            where: { id },
        });
    }
}

export default Patient;
