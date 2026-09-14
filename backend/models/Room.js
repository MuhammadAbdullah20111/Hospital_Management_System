import prisma from '../config/prismaClient.js';

class Room {
  static async findAll(filters = {}) {
    return prisma.room.findMany({
      where: filters,
      include: {
        ward: {
          select: { name: true }
        },
        category: {
          select: { name: true, pricePerDay: true }
        },
        _count: {
          select: { 
            beds: true
          }
        },
        beds: {
          where: { status: 'OCCUPIED' },
          select: { id: true }
        }
      },
      orderBy: { roomNumber: 'asc' }
    });
  }

  static async findById(id) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        ward: true,
        beds: true,
        category: true
      }
    });
  }

  static async create(data) {
    return prisma.room.create({
      data
    });
  }

  static async update(id, data) {
    return prisma.room.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    return prisma.room.delete({
      where: { id }
    });
  }
}

export default Room;
