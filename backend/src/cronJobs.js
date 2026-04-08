const Booking = require('./models/Booking');
const Slot = require('./models/Slot');

const startCronJobs = () => {
    // Run every 60 seconds to release expired locks
    setInterval(async () => {
        try {
            const now = new Date();
            // Find bookings that are Pending and their expiresAt timestamp has passed
            const expiredBookings = await Booking.find({
                status: 'Pending',
                expiresAt: { $lt: now }
            });

            if (expiredBookings.length > 0) {
                console.log(`Found ${expiredBookings.length} expired booking locks. Releasing...`);

                for (let booking of expiredBookings) {
                    // Update Booking status to Cancelled
                    booking.status = 'Cancelled';
                    booking.expiresAt = undefined;
                    await booking.save();

                     // Decrement the lockedCount in the Slot, ensuring it doesn't drop below 0
                    if (booking.slotId) {
                        await Slot.findByIdAndUpdate(booking.slotId, {
                            $inc: { lockedCount: -1 }
                        });
                        
                        // we also need to be careful if it was 'Full', maybe it's 'Available' now
                        const updatedSlot = await Slot.findById(booking.slotId);
                        if(updatedSlot && updatedSlot.status === 'Full' && (updatedSlot.bookedCount + updatedSlot.lockedCount) < updatedSlot.capacity) {
                            updatedSlot.status = 'Available';
                            await updatedSlot.save();
                        }
                    }
                }
                console.log(`Successfully released ${expiredBookings.length} slots.`);
            }

        } catch (error) {
            console.error('Error in lock release background job:', error);
        }
    }, 60 * 1000); // 60,000 ms = 1 minute
};

module.exports = startCronJobs;
