const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // TrainerId or GymId
    targetModel: { type: String, enum: ['Trainer', 'Gym'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
