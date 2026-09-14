import prisma from '../config/prismaClient.js';

class Appointment {
    static async create(data) {
        return prisma.appointment.create({
            data,
        });
    }

    static async findAll(query = {}) {
        return prisma.appointment.findMany({
            where: query,
            include: {
                patient: true,
                doctor: true,
                transaction: true,
                queueToken: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async findById(id) {
        return prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true,
                transaction: true,
                queueToken: true,
            },
        });
    }

    static async update(id, data) {
        return prisma.appointment.update({
            where: { id },
            data,
        });
    }

    static async delete(id) {
        return prisma.appointment.delete({
            where: { id },
        });
    }
}

export default Appointment;
