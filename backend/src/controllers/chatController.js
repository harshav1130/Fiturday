const Message = require('../models/Message');
const Booking = require('../models/Booking');

// @desc    Get chat history for a specific booking
// @route   GET /api/chat/:bookingId
// @access  Private
exports.getChatHistory = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('trainerId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is part of the booking
        // Robust check: check booking.userId OR booking.trainerId OR slot.trainerId
        const isClient = booking.userId.toString() === req.user._id.toString();
        
        let isTrainer = booking.trainerId?.userId?.toString() === req.user._id.toString();
        if (!isTrainer && booking.slotId) {
            // Need to populate slot to check its trainerId
            const Slot = require('../models/Slot');
            const slot = await Slot.findById(booking.slotId).populate('trainerId');
            if (slot?.trainerId?.userId?.toString() === req.user._id.toString()) {
                isTrainer = true;
            }
        }

        if (!isClient && !isTrainer) {
            return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ bookingId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar role email');

        res.status(200).json({
            messages,
            endDate: booking.endDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { bookingId, receiverId, content, messageType, mediaUrl } = req.body;
        console.log('SEND MESSAGE REQUEST:', { user: req.user._id, bookingId, receiverId, contentLength: content?.length, type: messageType });

        const booking = await Booking.findById(bookingId).populate('trainerId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Authorization check for sending
        const isClient = booking.userId.toString() === req.user._id.toString();
        
        let isTrainer = booking.trainerId?.userId?.toString() === req.user._id.toString();
        if (!isTrainer && booking.slotId) {
            const Slot = require('../models/Slot');
            const slot = await Slot.findById(booking.slotId).populate('trainerId');
            if (slot?.trainerId?.userId?.toString() === req.user._id.toString()) {
                isTrainer = true;
            }
        }

        if (!isClient && !isTrainer) {
            console.log('SEND MESSAGE FORBIDDEN:', { isClient, isTrainer, bookingUser: booking.userId, currentUser: req.user._id });
            return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
        }
        console.log('SEND MESSAGE AUTHORIZED');

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content,
            messageType: messageType || 'text',
            mediaUrl,
            bookingId
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar role email');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a chat file (image, video, voice)
// @route   POST /api/chat/upload
// @access  Private
exports.uploadChatFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const fileUrl = `${backendUrl}/uploads/${req.file.filename}`;

        res.status(200).json({ 
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
