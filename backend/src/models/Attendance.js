const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
    date: { type: Date, required: true },
    checkInTime: { type: Date },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
