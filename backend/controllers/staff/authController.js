import Staff from '../../models/Staff.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/jwtHelper.js';
import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import Otp from '../../models/Otp.js';
import { 
  sendLoginNotificationMail, 
  send2FAMail, 
  sendForgotPasswordMail, 
  sendProfileUpdateMail, 
  sendPasswordChangedMail 
} from '../../services/mailService.js';
import { generateOtp } from '../../utils/otpHelper.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findByEmail(email);

  if (!staff) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  if (!staff.isActive) {
    return ApiResponse.error(res, 'Account is inactive. Please contact admin.', 403);
  }

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  const token = generateToken({ id: staff.id, role: staff.role.name });
  const permissions = staff.role.rolePermissions.map(rp => rp.permission.name);

  if (staff.isTwoFactorEnabled) {
    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.deleteMany({
      where: { email: staff.email, reason: '2FA_STAFF' },
    });
    await prisma.otp.create({
      data: {
        email: staff.email,
        otp,
        reason: '2FA_STAFF',
        expiresAt,
      },
    });

    send2FAMail(staff.email, otp).catch(err => console.error("2FA email failed (non-blocking)", err));

    return ApiResponse.success(res, '2FA required. OTP sent to your email.', {
      requires2FA: true,
      email: staff.email,
    });
  }

  sendLoginNotificationMail(staff.email, staff.name, `Staff (${staff.role.name})`, req.ip, req.headers['user-agent'])
    .catch(err => console.error("Login notification failed (non-blocking)", err));

  return ApiResponse.success(res, 'Login successful', {
    token,
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      profileImage: staff.profileImage,
      isTwoFactorEnabled: staff.isTwoFactorEnabled,
      role: staff.role.name,
      shift: staff.staffShifts?.[0]?.shift?.name || null,
      permissions
    },
  });
});

export const verify2FA = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      reason: '2FA_STAFF',
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    return ApiResponse.error(res, 'Invalid or expired OTP', 400);
  }

  const staff = await Staff.findByEmail(email);
  if (!staff || !staff.isActive) {
    return ApiResponse.error(res, 'Staff not found or inactive', 404);
  }

  await prisma.otp.delete({
    where: { id: otpRecord.id },
  });

  const token = generateToken({ id: staff.id, role: staff.role.name });
  const permissions = staff.role.rolePermissions.map(rp => rp.permission.name);

  sendLoginNotificationMail(staff.email, staff.name, `Staff (${staff.role.name})`, req.ip, req.headers['user-agent'])
    .catch(err => console.error("Login notification failed (non-blocking)", err));

  return ApiResponse.success(res, 'Login successful', {
    token,
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      profileImage: staff.profileImage,
      isTwoFactorEnabled: staff.isTwoFactorEnabled,
      role: staff.role.name,
      shift: staff.staffShifts?.[0]?.shift?.name || null,
      permissions
    },
  });
});

export const toggle2FA = asyncHandler(async (req, res) => {
  const staffId = req.user.id;
  const { enable } = req.body; // Boolean

  const updatedStaff = await Staff.update(staffId, { isTwoFactorEnabled: enable });
  
  return ApiResponse.success(res, `Two-Factor Authentication ${enable ? 'enabled' : 'disabled'} successfully`, {
    isTwoFactorEnabled: updatedStaff.isTwoFactorEnabled
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const staff = await Staff.findByEmail(email);

  if (!staff) {
    return ApiResponse.error(res, 'Staff not found with this email', 404);
  }

  const { generateOtp } = await import('../../utils/otpHelper.js');
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.otp.deleteMany({
    where: {
      email,
      reason: 'RESET_PASSWORD_STAFF',
    },
  });

  await prisma.otp.create({
    data: {
      email,
      otp,
      reason: 'RESET_PASSWORD_STAFF',
      expiresAt,
    },
  });

  sendForgotPasswordMail(email, otp).catch(err => console.error("Forgot password mail failed (non-blocking)", err));

  return ApiResponse.success(res, 'OTP sent to your email');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { otp, password } = req.body;

  const otpRecord = await prisma.otp.findFirst({
    where: {
      otp,
      reason: 'RESET_PASSWORD_STAFF',
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    return ApiResponse.error(res, 'Invalid or expired OTP', 400);
  }

  const { email } = otpRecord;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const staff = await Staff.findByEmail(email);

  await Staff.updatePassword(email, hashedPassword);

  await prisma.otp.delete({
    where: { id: otpRecord.id },
  });

  if (staff) {
    sendPasswordChangedMail(staff.email, staff.name)
      .catch(err => console.error("Password changed mail failed (non-blocking)", err));
  }

  return ApiResponse.success(res, 'Password reset successful. You can now login.');
});

export const getProfile = asyncHandler(async (req, res) => {
  const staffId = req.user.id;
  const staff = await Staff.findById(staffId);

  if (!staff) {
    return ApiResponse.error(res, 'Staff not found', 404);
  }

  return ApiResponse.success(res, 'Profile fetched successfully', {
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      profileImage: staff.profileImage,
      isTwoFactorEnabled: staff.isTwoFactorEnabled,
      role: staff.role.name,
      department: staff.department ? staff.department.name : null,
      shift: staff.staffShifts?.[0]?.shift?.name || null,
      permissions: staff.role.rolePermissions.map(rp => rp.permission.name)
    },
  });
});

export const requestPasswordChangeOTP = asyncHandler(async (req, res) => {
  const staffId = req.user.id;
  const staff = await Staff.findById(staffId);

  if (!staff) {
    return ApiResponse.error(res, 'Staff member not found', 404);
  }

  const { generateOtp } = await import('../../utils/otpHelper.js');
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deletePreviousOtps(staff.email, 'CHANGE_PASSWORD_STAFF');

  await Otp.create({
    email: staff.email,
    otp,
    reason: 'CHANGE_PASSWORD_STAFF',
    expiresAt,
  });

  sendForgotPasswordMail(staff.email, otp).catch(err => console.error("Password change OTP mail failed (non-blocking)", err));

  return ApiResponse.success(res, 'OTP sent to your email');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, otp } = req.body || {};
  const staffId = req.user.id;

  const staff = await Staff.findById(staffId);
  if (!staff) {
    return ApiResponse.error(res, 'Staff member not found', 404);
  }

  if (email) {
    const existingStaff = await Staff.findByEmail(email);
    if (existingStaff && existingStaff.id !== staffId) {
      return ApiResponse.error(res, 'Email already in use', 400);
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;

  let passwordChanged = false;

  if (password) {
    if (!otp) {
      return ApiResponse.error(res, 'OTP is required to change password', 400);
    }

    const otpRecord = await Otp.findValidOtp(otp, 'CHANGE_PASSWORD_STAFF');
    if (!otpRecord || otpRecord.email !== staff.email) {
      return ApiResponse.error(res, 'Invalid or expired OTP', 400);
    }

    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);

    // Delete OTP after successful use
    await Otp.delete(otpRecord.id);
    passwordChanged = true;
  }

  const updatedStaff = await Staff.update(staffId, updateData);

  if (Object.keys(updateData).some(k => k !== 'password')) {
    sendProfileUpdateMail(updatedStaff.email, updatedStaff.name, updateData)
      .catch(err => console.error("Profile update mail failed (non-blocking)", err));
  }

  if (passwordChanged) {
    sendPasswordChangedMail(updatedStaff.email, updatedStaff.name)
      .catch(err => console.error("Password changed mail failed (non-blocking)", err));
  }

  return ApiResponse.success(res, 'Profile updated successfully', {
    staff: {
      id: updatedStaff.id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      phoneNumber: updatedStaff.phoneNumber,
      profileImage: updatedStaff.profileImage,
      isTwoFactorEnabled: updatedStaff.isTwoFactorEnabled,
      role: updatedStaff.role.name
    },
  });
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  const staffId = req.user.id;
  
  if (!req.file) {
    return ApiResponse.error(res, 'No image file provided', 400);
  }
  
  // The path where the file is stored relative to the server root
  const imagePath = `/uploads/profiles/${req.file.filename}`;
  
  const updatedStaff = await Staff.update(staffId, {
    profileImage: imagePath
  });
  
  return ApiResponse.success(res, 'Profile image uploaded successfully', {
    profileImage: updatedStaff.profileImage
  });
});

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const staffId = req.user.id;
  
  await Staff.update(staffId, {
    profileImage: null
  });
  
  return ApiResponse.success(res, 'Profile image deleted successfully');
});
