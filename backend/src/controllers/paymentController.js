const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const PaymentMethod = require('../models/PaymentMethod');
const Slot = require('../models/Slot');

const createOrder = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });

        const options = {
            amount: amount * 100, // standard Razorpay uses paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        };

        let order;
        const isMockKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_id' || process.env.RAZORPAY_KEY_ID === 'placeholder_key_id';
        if (isMockKey) {
            order = {
                id: `order_dummy_${Date.now()}`,
                amount: options.amount,
                currency: options.currency,
                receipt: options.receipt
            };
        } else {
            order = await instance.orders.create(options);
        }

        if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

        const payment = await Payment.create({
            orderId: order.id,
            amount,
            userId: req.user._id,
            status: 'Created'
        });

        // Link payment to booking if passed
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, { paymentId: payment._id });
        }

        res.json(order);
    } catch (error) {
        console.error("PAYMENT CREATE ERROR:", error);
        res.status(500).json({ message: error.message || 'Unknown error', stack: error.stack, details: error });
    }
}

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(body.toString())
            .digest('hex');

        const isMockKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_id' || process.env.RAZORPAY_KEY_ID === 'placeholder_key_id';
        if (expectedSignature === razorpay_signature || isMockKey) {
            const payment = await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                {
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    status: 'Captured'
                },
                { new: true }
            );

            if (payment) {
                const pendingBooking = await Booking.findOne({ paymentId: payment._id, status: 'Pending' });
                if (pendingBooking) {
                    pendingBooking.status = 'Confirmed';
                    pendingBooking.expiresAt = undefined;

                    // Set subscription dates for Monthly/Yearly plans
                    if (pendingBooking.planType === 'Monthly' || pendingBooking.planType === 'Yearly') {
                        const now = new Date();
                        pendingBooking.startDate = now;
                        const duration = pendingBooking.planType === 'Monthly' ? 30 : 365;
                        const endDate = new Date();
                        endDate.setDate(now.getDate() + duration);
                        pendingBooking.endDate = endDate;
                    }

                    await pendingBooking.save();

                    // Notification Logic
                    try {
                        let recipientId = null;
                        let bookingType = pendingBooking.type;
                        
                        if (bookingType === 'Trainer') {
                            const Trainer = require('../models/Trainer');
                            const trainer = await Trainer.findById(pendingBooking.trainerId);
                            if (trainer) recipientId = trainer.userId;
                        } else if (bookingType === 'Gym') {
                            const Gym = require('../models/Gym');
                            const gym = await Gym.findById(pendingBooking.gymId);
                            if (gym) recipientId = gym.ownerId;
                        }

                        if (recipientId && global.io) {
                            const User = require('../models/User');
                            const buyer = await User.findById(pendingBooking.userId);
                            
                            global.io.to(recipientId.toString()).emit('new_notification', {
                                type: 'PURCHASE',
                                sender: { name: buyer?.name || 'A user' },
                                content: `Just purchased your ${pendingBooking.planType} ${bookingType} plan!`,
                                bookingId: pendingBooking._id
                            });
                        }
                    } catch (notifyError) {
                        console.error('Failed to send purchase notification:', notifyError);
                    }

                    if ((pendingBooking.type === 'Gym' || pendingBooking.type === 'Trainer') && pendingBooking.slotId) {
                        await Slot.findByIdAndUpdate(pendingBooking.slotId, {
                            $inc: { bookedCount: 1, lockedCount: -1 }
                        });
                    }
                }
            }

            res.json({ message: 'Payment verified successfully', payment });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const refundPayment = async (paymentId, amount) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });

        // Amount parameter to refund in paise (Stripe uses cents, Razorpay paise)
        const refundAmt = amount ? amount * 100 : undefined;

        console.log(`Processing refund for payment ID: ${paymentId}`);

        // In a real Razorpay flow without mock IDs, this calls the actual API
        // For local development with mock credentials, we simulate success if dummy_id is used
        let refundResponse;
        const isMockKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_id' || process.env.RAZORPAY_KEY_ID === 'placeholder_key_id';
        if (isMockKey) {
            console.log('Mocking Razorpay refund due to missing credentials');
            refundResponse = {
                id: `rfnd_${Date.now()}`,
                status: 'processed'
            };
        } else {
            refundResponse = await instance.payments.refund(paymentId, { amount: refundAmt });
        }

        return refundResponse;
    } catch (error) {
        console.error('Refund processing failed:', error);
        throw error;
    }
};

const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Enrich each payment with booking/gym/slot info
        const enriched = await Promise.all(payments.map(async (p) => {
            try {
                const booking = await Booking.findOne({ paymentId: p._id })
                    .populate({ path: 'slotId', populate: { path: 'gymId', select: 'name address' } })
                    .lean();

                return {
                    ...p,
                    orderId: p.orderId,
                    gym: booking?.slotId?.gymId?.name || null,
                    slot: booking?.slotId ? `${booking.slotId.startTime} – ${booking.slotId.endTime}` : null,
                    date: booking?.slotId?.date || null,
                    bookingId: booking?._id || null,
                    bookingStatus: booking?.status || null
                };
            } catch (_) {
                return p;
            }
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(methods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addPaymentMethod = async (req, res) => {
    try {
        const { brand, last4, expiryMonth, expiryYear } = req.body;
        
        // In a real app, you'd get this from Razorpay/Stripe tokenization
        const method = await PaymentMethod.create({
            userId: req.user._id,
            brand,
            last4,
            expiryMonth,
            expiryYear,
            isDefault: (await PaymentMethod.countDocuments({ userId: req.user._id })) === 0
        });

        res.status(201).json(method);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: { $in: ['Captured', 'Refunded'] } })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const enriched = await Promise.all(payments.map(async (p) => {
            try {
                const booking = await Booking.findOne({ paymentId: p._id })
                    .populate({ path: 'slotId', populate: { path: 'gymId', select: 'name' } })
                    .lean();

                return {
                    ...p,
                    userName: p.userId?.name || 'Unknown User',
                    userEmail: p.userId?.email || 'N/A',
                    gymName: booking?.slotId?.gymId?.name || null,
                    slotInfo: booking?.slotId ? `${booking.slotId.startTime} - ${booking.slotId.endTime}` : null,
                    bookingDate: booking?.slotId?.date || null,
                    bookingType: booking?.type || (p.amount > 1000 ? 'PT Session' : 'Gym Slot') // Fallback if no booking record
                };
            } catch (_) {
                return p;
            }
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePaymentMethod = async (req, res) => {
    try {
        await PaymentMethod.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'Payment method removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, verifyPayment, refundPayment, getMyPayments, getAllPayments, getPaymentMethods, addPaymentMethod, deletePaymentMethod };
