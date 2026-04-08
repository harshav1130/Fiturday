const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');
const Trainer = require('./src/models/Trainer');
const Slot = require('./src/models/Slot');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookings = await Booking.find({})
            .populate('userId', 'name role')
            .populate({ path: 'trainerId', populate: { path: 'userId', select: 'name' } })
            .populate({ path: 'slotId', populate: { path: 'trainerId', populate: { path: 'userId', select: 'name' } } });
        
        bookings.forEach(b => {
            console.log(`Booking ID: ${b._id}`);
            console.log(`  User: ${b.userId?.name} (${b.userId?._id})`);
            
            const trainerName = b.trainerId?.userId?.name || b.slotId?.trainerId?.userId?.name || 'Unknown';
            console.log(`  Trainer Name (Calculated): ${trainerName}`);
            console.log('---');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
