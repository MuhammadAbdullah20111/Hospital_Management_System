import express from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorizeRole } from '../../middlewares/roleMiddleware.js';
import { login, logout, getProfile, updateProfile, requestPasswordChangeOTP, forgotPassword, resetPassword, uploadProfileImage, deleteProfileImage, verify2FA, toggle2FA } from '../../controllers/admin/authController.js';
import { loginValidation, updateProfileValidation, forgotPasswordValidation, resetPasswordValidation } from '../../validations/admin/authValidation.js';
import upload from '../../middlewares/uploadMiddleware.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

router.post('/login', validate(loginValidation), login);
router.post('/verify-2fa', verify2FA);
router.post('/toggle-2fa', authenticate, authorizeRole('ADMIN'), toggle2FA);
router.post('/logout', logout);
router.get('/profile', authenticate, authorizeRole('ADMIN'), getProfile);
router.post('/request-password-otp', authenticate, authorizeRole('ADMIN'), requestPasswordChangeOTP);
router.put('/profile', authenticate, authorizeRole('ADMIN'), validate(updateProfileValidation), updateProfile);
router.post('/profile/image', authenticate, authorizeRole('ADMIN'), upload.single('profileImage'), uploadProfileImage);
router.delete('/profile/image', authenticate, authorizeRole('ADMIN'), deleteProfileImage);

export default router;
