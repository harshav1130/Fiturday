const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Booking = require('./src/models/Booking');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await Booking.find({
            $or: [
                { userId: { $exists: false } },
                { userId: null },
                { trainerId: { $exists: false }, slotId: { $exists: false } }
            ]
        });
        console.log('INCONSISTENT_BOOKINGS:', bookings.length);
        if (bookings.length > 0) {
            console.log('SAMPLE:', JSON.stringify(bookings[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
