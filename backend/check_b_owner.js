const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const b = await Booking.findById('69b6bb18f570efe77f2ce1de').populate('userId', 'email');
        console.log('BOOKING_OWNER:', b?.userId?.email || 'NOT_FOUND');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
