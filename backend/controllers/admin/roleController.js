import Role from '../../models/Role.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// Helper to flatten role permissions
const formatRole = (role) => {
  if (!role) return null;
  const { rolePermissions, ...rest } = role;
  const permissions = rolePermissions ? rolePermissions.map(rp => rp.permission) : [];
  return { ...rest, permissions };
};

export const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;

  try {
    const newRole = await Role.create({
      name,
      permissions: permissions || [],
    });

    const formattedRole = formatRole(newRole);

    return ApiResponse.success(res, 'Role created successfully', { role: formattedRole }, 201);
  } catch (error) {
    if (error.code === 'P2002') {
        return ApiResponse.error(res, 'Role with this name already exists', 400);
    }
    if (error.code === 'P2025') {
        return ApiResponse.error(res, 'One or more permission IDs are invalid', 400);
    }
    throw error;
  }
});

export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll();
  const formattedRoles = roles.map(formatRole);
  return ApiResponse.success(res, 'Roles fetched successfully', { roles: formattedRoles });
});

export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findById(Number(id));

  if (!role) {
    return ApiResponse.error(res, 'Role not found', 404);
  }

  const formattedRole = formatRole(role);

  return ApiResponse.success(res, 'Role fetched successfully', { role: formattedRole });
});

export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  const role = await Role.findById(Number(id));
  if (!role) {
    return ApiResponse.error(res, 'Role not found', 404);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (permissions) updateData.permissions = permissions;

  try {
    const updatedRole = await Role.update(Number(id), updateData);
    const formattedRole = formatRole(updatedRole);

    return ApiResponse.success(res, 'Role updated successfully', { role: formattedRole });
  } catch (error) {
    if (error.code === 'P2002') {
        return ApiResponse.error(res, 'Role with this name already exists', 400);
    }
    if (error.code === 'P2025') {
        return ApiResponse.error(res, 'One or more permission IDs are invalid', 400);
    }
    throw error;
  }
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replacementRoleId } = req.body || {};
  
  const role = await Role.findById(Number(id));
  if (!role) {
    return ApiResponse.error(res, 'Role not found', 404);
  }

  try {
      await Role.delete(Number(id), replacementRoleId ? Number(replacementRoleId) : null);
  } catch(e) {
      if (e.code === 'P2003') {
          return ApiResponse.error(res, 'Cannot delete role assigned to staff members without reassignment', 400);
      }
      throw e;
  }

  return ApiResponse.success(res, 'Role deleted successfully');
});

export const getRoleDependencies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dependencies = await Role.getDependencies(Number(id));
  
  if (!dependencies) {
    return ApiResponse.error(res, 'Role not found', 404);
  }

  return ApiResponse.success(res, 'Role dependencies fetched successfully', { dependencies });
});
