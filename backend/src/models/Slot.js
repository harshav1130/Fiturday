const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }, // Made optional
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }, // Added target for trainer
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., '06:00 AM'
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true },
    bookedCount: { type: Number, default: 0 },
    lockedCount: { type: Number, default: 0 }, // For temporary locks during payment
    status: { type: String, enum: ['Available', 'Full', 'Cancelled'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
