const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Payment = require('../models/Payment');
const { refundPayment } = require('./paymentController');

const mongoose = require('mongoose');

const createBooking = async (req, res) => {
    try {
        console.log('CREATE BOOKING BODY:', req.body);
        const { slotId, trainerId, gymId, type, planType } = req.body; // type: 'Gym' or 'Trainer', planType: 'Session', 'Monthly', 'Yearly'

        if (type === 'Gym' || type === 'Trainer') { 
            // Handle Subscription-based Booking (Monthly/Yearly)
            if (planType === 'Monthly' || planType === 'Yearly') {
                if (type === 'Gym' && !gymId) return res.status(400).json({ message: 'Gym ID is required for gym subscription' });

                const booking = await Booking.create({
                    userId: req.user._id,
                    gymId: type === 'Gym' ? gymId : (req.body.gymId || null),
                    trainerId: type === 'Trainer' ? trainerId : null,
                    type,
                    planType, 
                    status: 'Pending'
                });

                return res.status(201).json(booking);
            } 
            
            // Default to Session-based Booking (requires slot)
            else {
                if (!slotId) return res.status(400).json({ 
                    message: `Slot ID is required for session booking. Received planType: [${planType}]`,
                    receivedBody: req.body 
                });

                // Atomic update: only increment lockedCount IF total booked+locked is less than capacity
                const slot = await Slot.findOneAndUpdate(
                    {
                        _id: slotId,
                        $expr: { $lt: [{ $add: ["$bookedCount", "$lockedCount"] }, "$capacity"] }
                    },
                    { $inc: { lockedCount: 1 } },
                    { new: true }
                );

                if (!slot) {
                    const existingSlot = await Slot.findById(slotId);
                    if (!existingSlot) return res.status(404).json({ 
                        message: `Slot does not exist. Received planType: [${planType}], slotId: [${slotId}]` 
                    });
                    return res.status(409).json({ message: 'Slot is full or temporarily locked' });
                }

                if (slot.bookedCount + slot.lockedCount >= slot.capacity) {
                    slot.status = 'Full';
                    await slot.save();
                }

                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                const booking = await Booking.create({
                    userId: req.user._id,
                    slotId,
                    gymId: slot.gymId,
                    trainerId: slot.trainerId,
                    type,
                    planType: 'Session',
                    status: 'Pending',
                    expiresAt
                });

                return res.status(201).json(booking);
            }
        } 
else {
            return res.status(400).json({ message: 'Invalid booking type' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate({ path: 'slotId', populate: { path: 'gymId', select: 'name location' } })
            .populate({ path: 'paymentId' })
            .populate({ path: 'gymId', select: 'name address' })
            .populate({ path: 'trainerId', populate: { path: 'userId', select: 'name avatar email' } })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        const oldStatus = booking.status;

        // Initiate Refund if Confirmed and within 24 hours
        if (oldStatus === 'Confirmed' && booking.paymentId) {
            const isWithin24Hours = (new Date() - new Date(booking.createdAt)) <= (24 * 60 * 60 * 1000);
            
            if (isWithin24Hours) {
                const payment = await Payment.findById(booking.paymentId);
                if (payment && payment.status === 'Captured') {
                    try {
                        const refundRes = await refundPayment(payment.paymentId, payment.amount);
                        payment.status = 'Refunded';
                        payment.refundId = refundRes.id;
                        payment.refundStatus = 'Processed';
                        await payment.save();
                    } catch (err) {
                        console.error('Refund failed during cancellation:', err);
                        return res.status(500).json({ message: 'Cancellation failed due to refund error.' });
                    }
                }
            } else {
                console.log(`Booking ${booking._id} cancelled after 24h window. No refund initiated.`);
                // We still cancel the booking, but payment remains 'Captured'
            }
        }

        booking.status = 'Cancelled';
        booking.expiresAt = undefined;
        await booking.save();

        if ((booking.type === 'Gym' || booking.type === 'Trainer') && booking.slotId) {
            const updateField = oldStatus === 'Pending' ? { lockedCount: -1 } : { bookedCount: -1 };
            await Slot.findByIdAndUpdate(booking.slotId, {
                $inc: updateField,
                status: 'Available'
            });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrainerBookings = async (req, res) => {
    try {
        const Trainer = require('../models/Trainer');
        const trainer = await Trainer.findOne({ userId: req.user._id });
        if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });

        const Slot = require('../models/Slot');
        const trainerSlots = await Slot.find({ trainerId: trainer._id }).select('_id');
        const slotIds = trainerSlots.map(s => s._id);

        const bookings = await Booking.find({
            $or: [
                { trainerId: trainer._id },
                { slotId: { $in: slotIds } }
            ]
        })
            .populate('userId', 'name email avatar')
            .populate('slotId')
            .sort({ createdAt: -1 })
            .lean();

        // Virtual backfill for missing dates
        const enrichedBookings = bookings.map(b => {
            if ((b.planType === 'Monthly' || b.planType === 'Yearly') && !b.endDate) {
                const start = b.startDate || b.createdAt;
                const duration = b.planType === 'Monthly' ? 30 : 365;
                const end = new Date(start);
                end.setDate(end.getDate() + duration);
                return { ...b, startDate: start, endDate: end };
            }
            return b;
        });

        res.json(enrichedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If booking is not cancelled, we should clean up slot counts if applicable
        if (booking.status !== 'Cancelled' && booking.slotId) {
            const updateField = booking.status === 'Pending' ? { lockedCount: -1 } : { bookedCount: -1 };
            await Slot.findByIdAndUpdate(booking.slotId, {
                $inc: updateField,
                status: 'Available'
            });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getUserBookings, cancelBooking, getTrainerBookings, deleteBooking };
