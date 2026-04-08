const express = require('express');
const router = express.Router();
const { registerUser, verifyRegistration, loginUser, verify2FA, getProfile, updateProfile, refreshTokenHandler, googleAuth, forgotPassword, resetPassword, deleteMyAccount } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/register', registerUser);
router.post('/verify-registration', verifyRegistration);
router.post('/login', loginUser);
router.post('/verify-2fa', verify2FA);
router.post('/google', googleAuth);
router.post('/refresh', refreshTokenHandler);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, upload.single('avatar'), updateProfile)
    .delete(protect, deleteMyAccount);

module.exports = router;
