const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['Created', 'Authorized', 'Captured', 'Failed', 'Refunded'], default: 'Created' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refundId: { type: String },
    refundStatus: { type: String, enum: ['Pending', 'Processed', 'Failed'] }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
