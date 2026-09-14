import prisma from '../config/prismaClient.js';

class DailyAttendanceSummary {
  static async upsert(staffId, date, data) {
    const parsedDate = new Date(date);
    // Normalize date to remove time component for compound uniqueness
    parsedDate.setUTCHours(0, 0, 0, 0);

    return prisma.dailyAttendanceSummary.upsert({
      where: {
        staffId_date: {
          staffId: parseInt(staffId),
          date: parsedDate
        }
      },
      update: data,
      create: {
        staffId: parseInt(staffId),
        date: parsedDate,
        ...data
      },
      include: {
        staff: {
          include: {
            role: true,
            department: true
          }
        }
      }
    });
  }

  static async findAll(filters = {}) {
    const where = {};
    if (filters.staffId) where.staffId = parseInt(filters.staffId);
    if (filters.departmentId) {
      where.staff = {
        departmentId: parseInt(filters.departmentId)
      };
    }
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setUTCHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setUTCHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    return prisma.dailyAttendanceSummary.findMany({
      where,
      include: {
        staff: {
          include: {
            role: true,
            department: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { staff: { name: 'asc' } }
      ]
    });
  }

  static async findById(id) {
    return prisma.dailyAttendanceSummary.findUnique({
      where: { id: parseInt(id) },
      include: {
        staff: {
          include: {
            role: true,
            department: true
          }
        }
      }
    });
  }

  static async update(id, data) {
    return prisma.dailyAttendanceSummary.update({
      where: { id: parseInt(id) },
      data,
      include: {
        staff: {
          include: {
            role: true,
            department: true
          }
        }
      }
    });
  }
}

export default DailyAttendanceSummary;
