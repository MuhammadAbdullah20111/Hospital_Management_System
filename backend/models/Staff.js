import prisma from '../config/prismaClient.js';

class Staff {
  static async create(data) {
    return prisma.staff.create({
      data,
    });
  }

  static async findAll(query = {}) {
    return prisma.staff.findMany({
      where: query,
      include: {
        role: true,
        staffShifts: {
          include: {
            shift: true
          }
        },
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByEmail(email) {
    return prisma.staff.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        },
        staffShifts: {
          include: {
            shift: true
          }
        },
        department: true,
      },
    });
  }

  static async findById(id) {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        },
        staffShifts: {
          include: {
            shift: true
          }
        },
        department: true,
        appointments: {
          take: 5,
          orderBy: { date: 'desc' },
          include: {
            patient: { select: { name: true } }
          }
        },
        labTests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: { select: { name: true } }
          }
        }
      },
    });
  }

  static async update(id, data) {
    return prisma.staff.update({
      where: { id },
      data,
      include: {
        role: true,
        staffShifts: {
          include: {
            shift: true
          }
        },
        department: true,
      }
    });
  }

  static async updatePassword(email, hashedPassword) {
    return prisma.staff.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  static async delete(id) {
    return prisma.staff.delete({
      where: { id }
    });
  }
}

export default Staff;
