const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Gym Owner', 'Trainer', 'User'], default: 'User' },
    otp: { type: String, required: true },
    otpExpire: { type: Date, required: true }
}, { timestamps: true });

// Delete after 15 minutes automatically
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);
