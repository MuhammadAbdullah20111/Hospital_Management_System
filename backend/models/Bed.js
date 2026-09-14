import prisma from '../config/prismaClient.js';

class Bed {
  static async findAll(filters = {}) {
    return prisma.bed.findMany({
      where: filters,
      include: {
        ward: { select: { name: true } },
        room: { include: { category: true } },
        assignments: {
          where: { actualDischargeAt: null },
          include: {
            patient: { select: { name: true, mrNumber: true } }
          }
        }
      },
      orderBy: { bedNumber: 'asc' }
    });
  }

  static async findById(id) {
    return prisma.bed.findUnique({
      where: { id },
      include: {
        ward: true,
        room: { include: { category: true } },
        assignments: {
          where: { actualDischargeAt: null },
          include: { patient: true }
        }
      }
    });
  }

  static async create(data) {
    return prisma.bed.create({
      data
    });
  }

  static async update(id, data) {
    return prisma.bed.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    return prisma.bed.delete({
      where: { id }
    });
  }

  static async updateStatus(id, status) {
    return prisma.bed.update({
      where: { id },
      data: { status }
    });
  }
}

export default Bed;
