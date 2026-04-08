const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    address: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    amenities: [{ type: String }],
    photos: [{ type: String }],
    pricePerMonth: { type: Number },
    pricePerYear: { type: Number },
    openTime: { type: String, default: '5:00 AM' },
    closeTime: { type: String, default: '11:00 PM' },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

gymSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Gym', gymSchema);
