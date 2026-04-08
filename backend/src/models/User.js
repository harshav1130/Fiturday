const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Gym Owner', 'Trainer', 'User'], default: 'User' },
    status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Active' },
    avatar: { type: String, default: '' },
    refreshToken: { type: String },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    twoFactorCode: { type: String },
    twoFactorExpire: { type: Date },
    is2FAEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
