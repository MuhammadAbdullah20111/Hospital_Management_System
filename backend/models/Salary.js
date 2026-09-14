import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class SalaryRepository {
  async getStaffSalaryConfig(staffId) {
    return await prisma.staffSalary.findUnique({
      where: { staffId: parseInt(staffId) },
    });
  }

  async upsertSalaryConfig(staffId, data) {
    return await prisma.staffSalary.upsert({
      where: { staffId: parseInt(staffId) },
      update: data,
      create: {
        staffId: parseInt(staffId),
        ...data,
      },
    });
  }

  async getAllSalaryConfigs() {
    return await prisma.staffSalary.findMany({
      include: {
        staff: {
          select: { name: true, email: true, role: true }
        }
      }
    });
  }

  async generatePayroll(month, year) {
    const configs = await this.getAllSalaryConfigs();
    const transactions = [];

    // Find the 'Salary' category ID
    const category = await prisma.transactionCategory.findUnique({
      where: { name: 'Salary' }
    });

    if (!category) {
      throw new Error("Transaction category 'Salary' not found. Please seed categories.");
    }

    for (const config of configs) {
      // Create an EXPENSE transaction for each staff member
      const transaction = await prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          categoryId: category.id,
          amount: config.netSalary,
          method: 'BANK_TRANSFER',
          staffId: config.staffId,
          notes: `Salary for ${month}/${year}`,
          referenceNumber: `SAL-${config.staffId}-${month}-${year}`,
        }
      });
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default new SalaryRepository();
