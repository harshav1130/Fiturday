const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String },
    certifications: [{ type: String }],
    expertise: [{ type: String, enum: ['Weight Loss', 'Muscle Gain', 'Rehab', 'HIIT', 'Yoga', 'Strength', 'Cardio', 'Nutrition', 'Pilates', 'CrossFit'] }],
    monthlyPrice: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);
