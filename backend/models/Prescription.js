import prisma from '../config/prismaClient.js';

class Prescription {
    static async create(data) {
        return prisma.prescription.create({
            data,
            include: {
                appointment: true,
                patient: true,
                doctor: true
            }
        });
    }

    static async findAll(query = {}) {
        return prisma.prescription.findMany({
            where: query,
            include: {
                appointment: true,
                patient: true,
                doctor: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async findById(id) {
        return prisma.prescription.findUnique({
            where: { id },
            include: {
                appointment: true,
                patient: true,
                doctor: true
            }
        });
    }

    static async findByAppointmentId(appointmentId) {
        return prisma.prescription.findUnique({
            where: { appointmentId },
            include: {
                appointment: true,
                patient: true,
                doctor: true
            }
        });
    }

    static async findByPatientId(patientId) {
        return prisma.prescription.findMany({
            where: { patientId },
            include: {
                appointment: true,
                doctor: true
            },
            orderBy: { date: 'desc' }
        });
    }

    static async update(id, data) {
        return prisma.prescription.update({
            where: { id },
            data,
            include: {
                appointment: true,
                patient: true,
                doctor: true
            }
        });
    }

    static async delete(id) {
        return prisma.prescription.delete({
            where: { id }
        });
    }
}

export default Prescription;
