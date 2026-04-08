const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now, required: true },
    weight: { type: Number },
    bmi: { type: Number },
    bodyFatPercentage: { type: Number },
    muscleMass: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('ProgressLog', progressLogSchema);
