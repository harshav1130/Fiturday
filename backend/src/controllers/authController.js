const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Check if there's already a pending registration
        await PendingUser.deleteMany({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 15 * 60 * 1000; // 15 mins

        await PendingUser.create({
            name, email, password: hashedPassword, role, otp, otpExpire
        });

        // Send OTP via Email
        try {
            await sendEmail({
                email,
                subject: 'Verify your FitUrDay Account',
                message: `<h1>Welcome to FitUrDay!</h1><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`
            });
            res.status(200).json({ message: 'Verification OTP sent to email', email });
        } catch (mailErr) {
            console.error('Mail Error:', mailErr);
            res.status(500).json({ message: 'Error sending verification email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const pending = await PendingUser.findOne({ 
            email, 
            otp, 
            otpExpire: { $gt: Date.now() } 
        });

        if (!pending) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.create({
            name: pending.name,
            email: pending.email,
            password: pending.password,
            role: pending.role
        });

        await PendingUser.deleteOne({ _id: pending._id });

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[AUTH] Login attempt for: ${email}`);
        
        if (mongoose.connection.readyState !== 1) {
            console.error('[AUTH] Database not connected. State:', mongoose.connection.readyState);
            return res.status(503).json({ message: 'Database connection is still initializing. Please try again in a few seconds.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[AUTH] User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log(`[AUTH] User found. Matching password for: ${email}`);
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            console.log(`[AUTH] Password match successful for: ${email}. Role: ${user.role}`);
            const { accessToken, refreshToken } = generateTokens(user._id);
            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                goalWeight: user.goalWeight,
                accessToken,
                refreshToken
            });
        } else {
            console.warn(`[AUTH] Password mismatch for: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[AUTH] Login Exception:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const verify2FA = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ 
            email,
            twoFactorCode: otp,
            twoFactorExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP fields
        user.twoFactorCode = undefined;
        user.twoFactorExpire = undefined;

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            goalWeight: user.goalWeight,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.goalWeight = req.body.goalWeight || user.goalWeight;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            if (req.file) {
                user.avatar = `/${req.file.path.replace(/\\/g, '/')}`;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                goalWeight: updatedUser.goalWeight
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshTokenHandler = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: 'Refresh token required' });

        const user = await User.findOne({ refreshToken: token });
        if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

        jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Refresh token expired' });

            const tokens = generateTokens(user._id);
            user.refreshToken = tokens.refreshToken;
            await user.save();
            res.json(tokens);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const googleAuth = async (req, res) => {
    try {
        const { email, name, avatar } = req.body;

        let user = await User.findOne({ email });

        // If user doesn't exist, create a new User account
        if (!user) {
            // Generate a random secure password for Google users since they don't use passwords
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'User', // default role for Google signups
                avatar: avatar || ''
            });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            goalWeight: user.goalWeight,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Google Authentication Failed on Server' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.resetPasswordToken = otp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        try {
            await sendEmail({
                email,
                subject: 'Password Reset Code - FitUrDay',
                message: `<h1>Password Reset Request</h1><p>Your 6-digit verification code is: <strong>${otp}</strong></p><p>If you did not request this, please ignore this email.</p>`
            });
            res.json({ message: 'Password reset OTP sent to email' });
        } catch (mailErr) {
            console.error('Mail Error:', mailErr);
            res.status(500).json({ message: 'Error sending reset email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email,
            resetPasswordToken: otp,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. Please login with your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMyAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Clean up Gyms if owner
        const Gym = require('../models/Gym');
        await Gym.deleteMany({ ownerId: userId });

        // 2. Clean up Bookings
        const Booking = require('../models/Booking');
        await Booking.deleteMany({ userId: userId });

        // 3. Clean up Trainer profile if trainer
        const Trainer = require('../models/Trainer');
        await Trainer.deleteMany({ userId: userId });

        // 4. Delete the User
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account and associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, verifyRegistration, loginUser, verify2FA, getProfile, updateProfile, refreshTokenHandler, googleAuth, forgotPassword, resetPassword, deleteMyAccount };
