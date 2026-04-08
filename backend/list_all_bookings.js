const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const Trainer = require('./src/models/Trainer');
const Booking = require('./src/models/Booking');

async function listAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await Booking.find({ type: 'Trainer', status: 'Confirmed' })
            .populate('userId', 'email name')
            .populate({ path: 'trainerId', populate: { path: 'userId', select: 'email name' } });
            
        console.log('--- ALL CONFIRMED TRAINER BOOKINGS ---');
        for (const b of bookings) {
            console.log(`Booking ID: ${b._id}`);
            console.log(`User: ${b.userId?.email} (${b.userId?._id})`);
            console.log(`Trainer: ${b.trainerId?.userId?.email} (${b.trainerId?.userId?._id})`);
            console.log(`Status: ${b.status}`);
            console.log('---');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listAll();
