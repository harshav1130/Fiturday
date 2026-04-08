const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: function() { return this.messageType === 'text'; },
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'voice'],
        default: 'text'
    },
    mediaUrl: {
        type: String
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, bookingId: 1 });

module.exports = mongoose.model('Message', messageSchema);
