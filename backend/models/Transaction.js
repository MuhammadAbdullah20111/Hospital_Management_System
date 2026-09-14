import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class TransactionRepository {
  async create(data) {
    return await prisma.transaction.create({
      data,
      include: {
        category: true,
        patient: true,
        staff: true,
        appointment: {
          include: {
            doctor: {
              select: { name: true }
            },
            queueToken: true
          }
        },
        labTest: {
          include: {
            queueToken: true
          }
        },
        bedAssignment: {
          include: {
            bed: {
              select: { bedNumber: true }
            }
          }
        },
        assetRent: true,
      },
    });
  }

  async findById(id) {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        patient: true,
        staff: true,
        appointment: {
          include: {
            doctor: {
              select: { name: true }
            },
            queueToken: true
          }
        },
        labTest: {
          include: {
            queueToken: true
          }
        },
        bedAssignment: {
          include: {
            bed: {
              select: { bedNumber: true }
            }
          }
        },
        assetRent: true,
      },
    });
  }

  async findAll(filters = {}) {
    const { type, categoryId, startDate, endDate, patientId, staffId, appointmentId, labTestId, bedAssignmentId } = filters;
    
    const where = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (patientId) where.patientId = parseInt(patientId);
    if (staffId) where.staffId = parseInt(staffId);
    if (appointmentId) where.appointmentId = parseInt(appointmentId);
    if (labTestId) where.labTestId = parseInt(labTestId);
    if (bedAssignmentId) where.bedAssignmentId = parseInt(bedAssignmentId);
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        patient: {
          select: { name: true, mrNumber: true }
        },
        staff: {
          select: { name: true }
        },
        appointment: {
          include: {
            doctor: {
              select: { name: true }
            },
            queueToken: true
          }
        },
        labTest: {
          include: {
            queueToken: true
          }
        },
        bedAssignment: {
          include: {
            bed: {
              select: { bedNumber: true }
            }
          }
        },
        assetRent: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return await prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await prisma.transaction.delete({
      where: { id },
    });
  }

  // Categories CRUD
  async createCategory(data) {
    return await prisma.transactionCategory.create({ data });
  }

  async getCategories(type = null) {
    const where = { isActive: true };
    if (type) where.type = type;
    return await prisma.transactionCategory.findMany({ where });
  }

  async updateCategory(id, data) {
    return await prisma.transactionCategory.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  // Reports
  async getSummary(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({ where });
    
    // Realized Income (PAID)
    const income = transactions
      .filter(t => t.type === 'INCOME' && t.status === 'PAID')
      .reduce((sum, t) => sum + t.amount, 0);
      
    // Outstanding Income (PENDING)
    const outstanding = transactions
      .filter(t => t.type === 'INCOME' && t.status === 'PENDING')
      .reduce((sum, t) => sum + t.amount, 0);
      
    // Realized Expenses (PAID)
    const expense = transactions
      .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalOutstanding: outstanding,
      netProfit: income - expense,
      transactionCount: transactions.filter(t => t.status === 'PAID').length,
      pendingCount: transactions.filter(t => t.status === 'PENDING').length,
    };
  }
}

export default new TransactionRepository();
