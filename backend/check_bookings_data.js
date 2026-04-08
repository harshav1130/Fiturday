const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Booking = require('./src/models/Booking');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await Booking.find({})
            .populate('userId', 'name role')
            .populate('trainerId')
            .populate({ path: 'slotId', populate: { path: 'trainerId' } });
        
        bookings.forEach(b => {
            console.log(`Booking ID: ${b._id}`);
            console.log(`  User: ${b.userId?.name} (${b.userId?._id})`);
            console.log(`  Trainer of Booking: ${b.trainerId?._id}`);
            console.log(`  Slot Trainer: ${b.slotId?.trainerId?._id}`);
            console.log('---');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
