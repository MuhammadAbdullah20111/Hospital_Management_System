import prisma from '../config/prismaClient.js';

class Role {
  static async create(data) {
    // data.permissions is expected to be array of IDs (Int) or undefined
    const { name, permissions } = data;
    
    // Construct prisma create input
    const createData = {
        name,
    };

    if (permissions && permissions.length > 0) {
        createData.rolePermissions = {
            create: permissions.map(id => ({
                permission: { connect: { id: Number(id) } }
            }))
        };
    }

    return prisma.role.create({
      data: createData,
      include: {
          rolePermissions: {
              include: {
                  permission: true
              }
          }
      }
    });
  }

  static async findAll() {
    return prisma.role.findMany({
        include: {
            rolePermissions: {
                include: {
                    permission: true
                }
            }
        }
    });
  }

  static async findById(id) {
    return prisma.role.findUnique({
      where: { id },
      include: {
          rolePermissions: {
              include: {
                  permission: true
              }
          }
      }
    });
  }

  static async update(id, data) {
      const { name, permissions } = data;
      const updateData = {};
      
      if (name) updateData.name = name;
      
      if (permissions) {
          // Replace all permissions
          updateData.rolePermissions = {
              deleteMany: {},
              create: permissions.map(id => ({
                  permission: { connect: { id: Number(id) } }
              }))
          };
      }

    return prisma.role.update({
      where: { id },
      data: updateData,
       include: {
          rolePermissions: {
              include: {
                  permission: true
              }
          }
      }
    });
  }

  static async getDependencies(id) {
    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            staff: true,
            rolePermissions: true
          }
        }
      }
    });
    return role ? role._count : null;
  }

  static async delete(id, replacementRoleId = null) {
    if (replacementRoleId) {
      return prisma.$transaction([
        prisma.staff.updateMany({
          where: { roleId: id },
          data: { roleId: replacementRoleId }
        }),
        prisma.role.delete({ where: { id } })
      ]);
    }

    return prisma.role.delete({
      where: { id },
    });
  }
}

export default Role;
