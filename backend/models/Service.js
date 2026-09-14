import prisma from '../config/prismaClient.js';

class Service {
  static async create(data) {
    return prisma.service.create({
      data,
    });
  }

  static async findAll(where = {}) {
    return prisma.service.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id) {
    return prisma.service.findUnique({
      where: { id: parseInt(id) },
    });
  }

  static async update(id, data) {
    return prisma.service.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async delete(id) {
    return prisma.service.delete({
      where: { id: parseInt(id) },
    });
  }
}

export default Service;
