import Staff from '../../models/Staff.js';
import Role from '../../models/Role.js';
import Shift from '../../models/Shift.js';
import Department from '../../models/Department.js';
import bcrypt from 'bcryptjs';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import prisma from '../../config/prismaClient.js';
import BiometricService from '../../services/biometricService.js';

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, roleId, shiftId, departmentId, isActive, consultationFee, consultationDuration, biometricPin } = req.body;

  const existingStaff = await Staff.findByEmail(email);
  if (existingStaff) {
    return ApiResponse.error(res, 'Staff with this email already exists', 400);
  }

  const role = await Role.findById(roleId);
  if (!role) {
    return ApiResponse.error(res, 'Invalid role selected', 400);
  }

  if (shiftId) {
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return ApiResponse.error(res, 'Invalid shift selected', 400);
    }
  }

  if (departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      return ApiResponse.error(res, 'Invalid department selected', 400);
    }
  }

  const cleanBiometricPin = (biometricPin === '' || biometricPin === undefined) ? null : biometricPin;
  if (cleanBiometricPin) {
    const existingPinStaff = await prisma.staff.findFirst({
      where: { biometricPin: cleanBiometricPin }
    });
    if (existingPinStaff) {
      return ApiResponse.error(res, `Biometric PIN ${cleanBiometricPin} is already assigned to another staff member (${existingPinStaff.name})`, 400);
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newStaff = await Staff.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
    roleId,
    departmentId: departmentId || null,
    isActive: typeof isActive === 'boolean' ? isActive : true,
    consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
    consultationDuration: consultationDuration ? parseInt(consultationDuration) : 15,
    biometricPin: cleanBiometricPin,
    ...(shiftId && {
      staffShifts: {
        create: {
          shiftId,
          status: 'ACTIVE'
        }
      }
    })
  });

  // Sync historical logs if a PIN was assigned
  if (cleanBiometricPin) {
    await BiometricService.handleStaffPinMappingUpdate(newStaff.id, null, cleanBiometricPin);
  }

  // Auto-sync staff profile directly to the biometric terminal devices
  let deviceSyncResults = [];
  if (cleanBiometricPin) {
    deviceSyncResults = await BiometricService.syncStaffToDevices(newStaff);
  }

  return ApiResponse.success(res, 'Staff created successfully', {
    staff: {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      roleId: newStaff.roleId,
      departmentId: newStaff.departmentId,
      isActive: newStaff.isActive,
      biometricPin: newStaff.biometricPin,
    },
    deviceSync: deviceSyncResults
  }, 201);
});

export const getAllStaff = asyncHandler(async (req, res) => {
  const staffList = await Staff.findAll();
  return ApiResponse.success(res, 'Staff list fetched successfully', {
    staff: staffList.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phoneNumber: s.phoneNumber,
      isActive: s.isActive,
      role: s.role ? s.role.name : null,
      shift: (s.staffShifts && s.staffShifts.length > 0 && s.staffShifts[0].shift) ? `${s.staffShifts[0].shift.name}` : null,
      department: s.department ? s.department.name : null,
      biometricPin: s.biometricPin,
      consultationFee: s.consultationFee,
    })),
  });
});

export const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await Staff.findById(Number(id));

  if (!staff) {
    return ApiResponse.error(res, 'Staff not found', 404);
  }

  return ApiResponse.success(res, 'Staff details fetched successfully', {
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      isActive: staff.isActive,
      roleId: staff.roleId,
      roleName: staff.role ? staff.role.name : null,
      shiftId: (staff.staffShifts && staff.staffShifts.length > 0) ? staff.staffShifts[0].shiftId : null,
      shiftName: (staff.staffShifts && staff.staffShifts.length > 0 && staff.staffShifts[0].shift) ? `${staff.staffShifts[0].shift.name}` : null,
      departmentId: staff.departmentId,
      departmentName: staff.department ? staff.department.name : null,
      consultationFee: staff.consultationFee,
      consultationDuration: staff.consultationDuration,
      biometricPin: staff.biometricPin,
      appointments: staff.appointments || [],
      labTests: staff.labTests || []
    }
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, roleId, shiftId, isActive, departmentId, consultationFee, consultationDuration, biometricPin } = req.body;

  const staff = await Staff.findById(Number(id));
  if (!staff) {
    return ApiResponse.error(res, 'Staff not found', 404);
  }

  if (email && email !== staff.email) {
    const existingStaff = await Staff.findByEmail(email);
    if (existingStaff) {
      return ApiResponse.error(res, 'Email already in use', 400);
    }
  }

  if (roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      return ApiResponse.error(res, 'Invalid role selected', 400);
    }
  }

  if (shiftId) {
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return ApiResponse.error(res, 'Invalid shift selected', 400);
    }
  }

  if (departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      return ApiResponse.error(res, 'Invalid department selected', 400);
    }
  }

  const cleanBiometricPin = (biometricPin === '' || biometricPin === undefined) ? null : biometricPin;
  if (cleanBiometricPin) {
    const existingPinStaff = await prisma.staff.findFirst({
      where: {
        biometricPin: cleanBiometricPin,
        id: { not: Number(id) }
      }
    });
    if (existingPinStaff) {
      return ApiResponse.error(res, `Biometric PIN ${cleanBiometricPin} is already assigned to another staff member (${existingPinStaff.name})`, 400);
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (roleId) updateData.roleId = roleId;
  if (departmentId) updateData.departmentId = departmentId;
  if (typeof isActive === 'boolean') updateData.isActive = isActive;
  if (consultationFee !== undefined) updateData.consultationFee = parseFloat(consultationFee);
  if (consultationDuration !== undefined) updateData.consultationDuration = parseInt(consultationDuration);
  updateData.biometricPin = cleanBiometricPin;

  if (shiftId) {
    updateData.staffShifts = {
      create: {
        shiftId,
        status: 'ACTIVE'
      }
    };
  }

  const oldPin = staff.biometricPin;
  const oldName = staff.name;
  const updatedStaff = await Staff.update(Number(id), updateData);

  // Sync historical records if PIN mapping changed
  if (oldPin !== cleanBiometricPin) {
    await BiometricService.handleStaffPinMappingUpdate(updatedStaff.id, oldPin, cleanBiometricPin);
  }

  // Push updated name/PIN directly to physical devices
  let deviceSyncResults = [];
  if (cleanBiometricPin && (oldPin !== cleanBiometricPin || oldName !== name)) {
    deviceSyncResults = await BiometricService.syncStaffToDevices(updatedStaff);
  }

  return ApiResponse.success(res, 'Staff updated successfully', {
    staff: {
      id: updatedStaff.id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      role: updatedStaff.role ? updatedStaff.role.name : null,
      shift: (updatedStaff.staffShifts && updatedStaff.staffShifts.length > 0 && updatedStaff.staffShifts[updatedStaff.staffShifts.length - 1].shift) ? `${updatedStaff.staffShifts[updatedStaff.staffShifts.length - 1].shift.name}` : null,
      department: updatedStaff.department ? updatedStaff.department.name : null,
      isActive: updatedStaff.isActive,
      biometricPin: updatedStaff.biometricPin
    },
    deviceSync: deviceSyncResults
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await Staff.findById(Number(id));
  if (!staff) {
    return ApiResponse.error(res, 'Staff not found', 404);
  }

  await Staff.delete(Number(id));

  return ApiResponse.success(res, 'Staff deleted successfully');
});
