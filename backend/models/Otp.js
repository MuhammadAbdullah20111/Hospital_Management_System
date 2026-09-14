import prisma from '../config/prismaClient.js';

class Otp {
  static async create(data) {
    return prisma.otp.create({
      data,
    });
  }

  static async deletePreviousOtps(email, reason) {
    return prisma.otp.deleteMany({
      where: {
        email,
        reason,
      },
    });
  }

  static async findValidOtp(otp, reason) {
    return prisma.otp.findFirst({
      where: {
        otp,
        reason,
        expiresAt: { gt: new Date() },
      },
    });
  }

  static async delete(id) {
    return prisma.otp.delete({
      where: { id },
    });
  }
}

export default Otp;
