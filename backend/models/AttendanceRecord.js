import prisma from '../config/prismaClient.js';

class AttendanceRecord {
  static async create(data) {
    return prisma.attendanceRecord.create({
      data,
      include: { staff: true, biometricDevice: true }
    });
  }

  static async createMany(records) {
    return prisma.attendanceRecord.createMany({
      data: records,
      skipDuplicates: true
    });
  }

  static async findAll(filters = {}) {
    const where = {};
    if (filters.staffId) where.staffId = parseInt(filters.staffId);
    if (filters.biometricDeviceId) where.biometricDeviceId = parseInt(filters.biometricDeviceId);
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
    }
    if (filters.deviceUserPin) where.deviceUserPin = filters.deviceUserPin;

    return prisma.attendanceRecord.findMany({
      where,
      include: {
        staff: {
          include: {
            role: true,
            department: true
          }
        },
        biometricDevice: true
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.attendanceRecord.findUnique({
      where: { id: parseInt(id) },
      include: { staff: true, biometricDevice: true }
    });
  }

  static async delete(id) {
    return prisma.attendanceRecord.delete({
      where: { id: parseInt(id) }
    });
  }
}

export default AttendanceRecord;
