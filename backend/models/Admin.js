import prisma from '../config/prismaClient.js';

class Admin {
  static async findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email },
    });
  }

  static async findById(id) {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  static async create(data) {
    return prisma.admin.create({
      data,
    });
  }

  static async update(id, data) {
    return prisma.admin.update({
      where: { id },
      data,
    });
  }

  static async updatePassword(email, hashedPassword) {
    return prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}

export default Admin;
