import prisma from '../config/prismaClient.js';

class Shift {
  static async create(data) {
    return prisma.shift.create({
      data,
      include: { slots: true }
    });
  }

  static async findAll() {
    return prisma.shift.findMany({
      include: { slots: true, department: true }
    });
  }

  static async findById(id) {
    return prisma.shift.findUnique({
      where: { id: parseInt(id) },
      include: { slots: true, department: true }
    });
  }

  static async update(id, data) {
    return prisma.shift.update({
      where: { id: parseInt(id) },
      data,
      include: { slots: true }
    });
  }

  static async delete(id) {
    return prisma.shift.delete({
      where: { id: parseInt(id) },
    });
  }
}

export default Shift;
