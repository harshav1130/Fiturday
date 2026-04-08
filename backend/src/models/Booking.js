const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
    type: { type: String, enum: ['Gym', 'Trainer'], required: true },
    planType: { type: String, enum: ['Session', 'Monthly', 'Yearly'], default: 'Session' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    expiresAt: { type: Date }, // Expiration time for pending locks
    startDate: { type: Date },
    endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
