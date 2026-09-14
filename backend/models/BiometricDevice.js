import prisma from '../config/prismaClient.js';

class BiometricDevice {
  static async create(data) {
    return prisma.biometricDevice.create({
      data
    });
  }

  static async findAll() {
    return prisma.biometricDevice.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.biometricDevice.findUnique({
      where: { id: parseInt(id) }
    });
  }

  static async findBySerialNumber(serialNumber) {
    return prisma.biometricDevice.findUnique({
      where: { serialNumber }
    });
  }

  static async findByIp(ipAddress) {
    return prisma.biometricDevice.findUnique({
      where: { ipAddress }
    });
  }

  static async update(id, data) {
    return prisma.biometricDevice.update({
      where: { id: parseInt(id) },
      data
    });
  }

  static async delete(id) {
    return prisma.biometricDevice.delete({
      where: { id: parseInt(id) }
    });
  }
}

export default BiometricDevice;
