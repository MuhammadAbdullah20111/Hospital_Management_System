import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class InpatientFinanceRepository {
  // Room Categories
  async createRoomCategory(data) {
    return await prisma.roomCategory.create({ data });
  }

  async getAllRoomCategories() {
    return await prisma.roomCategory.findMany({
      include: {
        _count: {
          select: { rooms: true }
        }
      }
    });
  }

  async updateRoomCategory(id, data) {
    return await prisma.roomCategory.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  // Hospital Asset Rent
  async createAssetRent(data) {
    return await prisma.hospitalAssetRent.create({
      data,
      include: {
        patient: true,
      }
    });
  }

  async findAssetRentById(id) {
    return await prisma.hospitalAssetRent.findUnique({
      where: { id },
      include: {
        patient: true,
        transaction: true,
      }
    });
  }

  async getActiveAssetRents(patientId = null) {
    const where = { status: 'ACTIVE' };
    if (patientId) where.patientId = parseInt(patientId);
    
    return await prisma.hospitalAssetRent.findMany({
      where,
      include: {
        patient: {
          select: { name: true, mrNumber: true }
        }
      }
    });
  }

  async closeAssetRent(id, endDate, totalAmount) {
    return await prisma.hospitalAssetRent.update({
      where: { id: parseInt(id) },
      data: {
        endDate: new Date(endDate),
        totalAmount,
        status: 'COMPLETED',
      },
    });
  }
}

export default new InpatientFinanceRepository();
