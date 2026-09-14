import Admin from '../../models/Admin.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/jwtHelper.js';
import ApiResponse from '../../utils/ApiResponse.js';
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

  const admin = await Admin.findByEmail(email);

  if (!admin) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  if (admin.isTwoFactorEnabled) {
    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.deletePreviousOtps(admin.email, '2FA');
    await Otp.create({
      email: admin.email,
      otp,
      reason: '2FA',
      expiresAt,
    });

    // Trade-off: Non-blocking email failure so the user flow isn't interrupted
    send2FAMail(admin.email, otp).catch(err => console.error("2FA email failed (non-blocking)", err));

    return ApiResponse.success(res, '2FA required. OTP sent to your email.', {
      requires2FA: true,
      email: admin.email,
    });
  }

  const token = generateToken({ id: admin.id, role: 'ADMIN', userType: 'SYSTEM_ADMIN' });

  sendLoginNotificationMail(admin.email, admin.name, 'Administrator', req.ip, req.headers['user-agent'])
    .catch(err => console.error("Login notification failed (non-blocking)", err));

  return ApiResponse.success(res, 'Login successful', {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage,
      isTwoFactorEnabled: admin.isTwoFactorEnabled,
      role: 'ADMIN'
    },
  });
});

export const verify2FA = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await Otp.findValidOtp(otp, '2FA');
  if (!otpRecord || otpRecord.email !== email) {
    return ApiResponse.error(res, 'Invalid or expired OTP', 400);
  }

  const admin = await Admin.findByEmail(email);
  if (!admin) {
    return ApiResponse.error(res, 'Admin not found', 404);
  }

  await Otp.delete(otpRecord.id);

  const token = generateToken({ id: admin.id, role: 'ADMIN', userType: 'SYSTEM_ADMIN' });

  sendLoginNotificationMail(admin.email, admin.name, 'Administrator', req.ip, req.headers['user-agent'])
    .catch(err => console.error("Login notification failed (non-blocking)", err));

  return ApiResponse.success(res, 'Login successful', {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage,
      isTwoFactorEnabled: admin.isTwoFactorEnabled,
      role: 'ADMIN'
    },
  });
});

export const toggle2FA = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { enable } = req.body; // Boolean

  const updatedAdmin = await Admin.update(adminId, { isTwoFactorEnabled: enable });
  
  return ApiResponse.success(res, `Two-Factor Authentication ${enable ? 'enabled' : 'disabled'} successfully`, {
    isTwoFactorEnabled: updatedAdmin.isTwoFactorEnabled
  });
});

export const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'Logout successful');
});

export const getProfile = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const admin = await Admin.findById(adminId);

  if (!admin) {
    return ApiResponse.error(res, 'Admin not found', 404);
  }

  return ApiResponse.success(res, 'Profile fetched successfully', {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      profileImage: admin.profileImage,
      isTwoFactorEnabled: admin.isTwoFactorEnabled,
      role: 'ADMIN'
    },
  });
});

export const requestPasswordChangeOTP = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const admin = await Admin.findById(adminId);

  if (!admin) {
    return ApiResponse.error(res, 'Admin not found', 404);
  }

  const { generateOtp } = await import('../../utils/otpHelper.js');
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deletePreviousOtps(admin.email, 'CHANGE_PASSWORD');

  await Otp.create({
    email: admin.email,
    otp,
    reason: 'CHANGE_PASSWORD',
    expiresAt,
  });

  sendForgotPasswordMail(admin.email, otp).catch(err => console.error("Password change OTP mail failed (non-blocking)", err));

  return ApiResponse.success(res, 'OTP sent to your email');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, otp } = req.body || {};
  const adminId = req.user.id;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return ApiResponse.error(res, 'Admin not found', 404);
  }

  if (email) {
    const existingAdmin = await Admin.findByEmail(email);

    if (existingAdmin && existingAdmin.id !== adminId) {
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

    const otpRecord = await Otp.findValidOtp(otp, 'CHANGE_PASSWORD');
    if (!otpRecord || otpRecord.email !== admin.email) {
      return ApiResponse.error(res, 'Invalid or expired OTP', 400);
    }

    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);

    // Delete OTP after successful use
    await Otp.delete(otpRecord.id);
    passwordChanged = true;
  }

  const updatedAdmin = await Admin.update(adminId, updateData);

  if (Object.keys(updateData).some(k => k !== 'password')) {
    sendProfileUpdateMail(updatedAdmin.email, updatedAdmin.name, updateData)
      .catch(err => console.error("Profile update mail failed (non-blocking)", err));
  }

  if (passwordChanged) {
    sendPasswordChangedMail(updatedAdmin.email, updatedAdmin.name)
      .catch(err => console.error("Password changed mail failed (non-blocking)", err));
  }

  return ApiResponse.success(res, 'Profile updated successfully', {
    admin: {
      id: updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phoneNumber: updatedAdmin.phoneNumber,
      profileImage: updatedAdmin.profileImage,
      isTwoFactorEnabled: updatedAdmin.isTwoFactorEnabled,
      role: req.user.role
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findByEmail(email);

  if (!admin) {
    return ApiResponse.error(res, 'Admin not found with this email', 404);
  }

  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deletePreviousOtps(email, 'RESET_PASSWORD');

  await Otp.create({
    email,
    otp,
    reason: 'RESET_PASSWORD',
    expiresAt,
  });

  sendForgotPasswordMail(email, otp).catch(err => console.error("Forgot password mail failed (non-blocking)", err));

  return ApiResponse.success(res, 'OTP sent to your email');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { otp, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return ApiResponse.error(res, 'Passwords do not match', 400);
  }

  const otpRecord = await Otp.findValidOtp(otp, 'RESET_PASSWORD');

  if (!otpRecord) {
    return ApiResponse.error(res, 'Invalid or expired OTP', 400);
  }

  const { email } = otpRecord;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = await Admin.findByEmail(email);

  await Admin.updatePassword(email, hashedPassword);
  await Otp.delete(otpRecord.id);

  if (admin) {
    sendPasswordChangedMail(admin.email, admin.name)
      .catch(err => console.error("Password changed mail failed (non-blocking)", err));
  }

  return ApiResponse.success(res, 'Password reset successful. You can now login.');
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  
  if (!req.file) {
    return ApiResponse.error(res, 'No image file provided', 400);
  }
  
  // The path where the file is stored relative to the server root
  const imagePath = `/uploads/profiles/${req.file.filename}`;
  
  const updatedAdmin = await Admin.update(adminId, {
    profileImage: imagePath
  });
  
  return ApiResponse.success(res, 'Profile image uploaded successfully', {
    profileImage: updatedAdmin.profileImage
  });
});

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  
  await Admin.update(adminId, {
    profileImage: null
  });
  
  return ApiResponse.success(res, 'Profile image deleted successfully');
});
