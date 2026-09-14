import prisma from '../config/prismaClient.js';

class Permission {
  static async create(data) {
    return prisma.permission.create({
      data,
    });
  }

  static async findAll() {
    return prisma.permission.findMany();
  }

  static async findById(id) {
    return prisma.permission.findUnique({
      where: { id },
    });
  }

  static get list() {
    return [
      'view-staff', 'create-staff', 'edit-staff', 'delete-staff',
      'view-roles', 'create-role', 'edit-role', 'delete-role',
      'view-patient', 'create-patient', 'edit-patient', 'delete-patient',
      'view-appointment', 'create-appointment', 'edit-appointment', 'delete-appointment',
      'view-labtest', 'create-labtest', 'edit-labtest', 'delete-labtest',
      'view-test', 'create-test', 'edit-test', 'delete-test',
      'view-department', 'create-department', 'edit-department', 'delete-department',
      'view-service', 'create-service', 'edit-service', 'delete-service',
      'view-shift', 'create-shift', 'edit-shift', 'delete-shift',
      'view-finance', 'create-finance', 'edit-finance', 'delete-finance',
      'view-dashboard',
    ];
  }
}

export default Permission;
