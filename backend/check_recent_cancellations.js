const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const u = await User.findOne({ email: 'user@fiturday.com' });
        if (!u) {
            console.log('USER_NOT_FOUND');
            process.exit(0);
        }
        
        console.log(`Checking RECENT cancellations for User: ${u.email}`);
        const bookings = await Booking.find({ userId: u._id, status: 'Cancelled' }).sort({ updatedAt: -1 }).limit(5);
        
        for (const b of bookings) {
            console.log(`B_ID: ${b._id} | Status: ${b.status} | DATA: ${JSON.stringify(b, null, 2)}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
