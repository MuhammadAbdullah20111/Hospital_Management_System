import prisma from '../config/prismaClient.js';

class Department {
  static async create(data) {
    return prisma.department.create({
      data,
    });
  }

  static async findAll(where = {}) {
    return prisma.department.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id) {
    return prisma.department.findUnique({
      where: { id: parseInt(id) },
    });
  }

  static async update(id, data) {
    return prisma.department.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async delete(id) {
    return prisma.department.delete({
      where: { id: parseInt(id) },
    });
  }
}

export default Department;
