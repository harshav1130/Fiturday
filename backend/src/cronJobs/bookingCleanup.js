const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

const startBookingCleanupTask = () => {
    console.log('Booking cleanup task started.');
    // Run every minute
    setInterval(async () => {
        try {
            const expiredBookings = await Booking.find({
                status: 'Pending',
                expiresAt: { $lt: new Date() }
            });

            if (expiredBookings.length > 0) {
                console.log(`Found ${expiredBookings.length} expired pending bookings to clean up.`);
            }

            for (const booking of expiredBookings) {
                booking.status = 'Cancelled';
                booking.expiresAt = undefined;
                await booking.save();

                if (booking.type === 'Gym' && booking.slotId) {
                    await Slot.findByIdAndUpdate(booking.slotId, {
                        $inc: { lockedCount: -1 },
                        status: 'Available' // Ensure it's available again if it was full
                    });
                }
            }
        } catch (error) {
            console.error('Error in booking cleanup task:', error.message);
        }
    }, 60 * 1000);
};

module.exports = startBookingCleanupTask;
