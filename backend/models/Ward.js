import prisma from '../config/prismaClient.js';

class Ward {
  static async findAll() {
    return prisma.ward.findMany({
      include: {
        _count: {
          select: { rooms: true, beds: true }
        },
        beds: {
          where: { status: 'OCCUPIED' },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async findById(id) {
    return prisma.ward.findUnique({
      where: { id },
      include: {
        rooms: true,
        beds: true
      }
    });
  }

  static async findByCode(code) {
    return prisma.ward.findUnique({
      where: { code }
    });
  }

  static async create(data) {
    return prisma.ward.create({
      data
    });
  }

  static async update(id, data) {
    return prisma.ward.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    return prisma.ward.delete({
      where: { id }
    });
  }
}

export default Ward;
