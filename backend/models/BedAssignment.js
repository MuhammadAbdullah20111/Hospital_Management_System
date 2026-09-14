import prisma from '../config/prismaClient.js';

class BedAssignment {
  static async findAll(filters = {}) {
    return prisma.bedAssignment.findMany({
      where: filters,
      include: {
        patient: { select: { name: true, mrNumber: true } },
        bed: { 
          include: {
            ward: { select: { name: true } },
            room: { select: { roomNumber: true } }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.bedAssignment.findUnique({
      where: { id },
      include: {
        patient: true,
        bed: {
          include: { ward: true, room: true }
        }
      }
    });
  }

  static async findActiveByPatient(patientId) {
    return prisma.bedAssignment.findFirst({
      where: {
        patientId,
        actualDischargeAt: null
      }
    });
  }

  static async create(data) {
    return prisma.bedAssignment.create({
      data
    });
  }

  static async update(id, data) {
    return prisma.bedAssignment.update({
      where: { id },
      data
    });
  }
}

export default BedAssignment;
