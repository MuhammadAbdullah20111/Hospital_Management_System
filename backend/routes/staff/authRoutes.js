import express from 'express';
import { login, forgotPassword, resetPassword, getProfile, updateProfile, requestPasswordChangeOTP, uploadProfileImage, deleteProfileImage, verify2FA, toggle2FA } from '../../controllers/staff/authController.js';
import { loginStaffValidation, forgotPasswordValidation, resetPasswordValidation } from '../../validations/admin/staffValidation.js';
import upload from '../../middlewares/uploadMiddleware.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', validate(loginStaffValidation), login);
router.post('/verify-2fa', verify2FA);
router.post('/toggle-2fa', authenticate, toggle2FA);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

// Profile
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/image', authenticate, upload.single('profileImage'), uploadProfileImage);
router.delete('/profile/image', authenticate, deleteProfileImage);
router.post('/request-password-otp', authenticate, requestPasswordChangeOTP);

export default router;
