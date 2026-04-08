const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const Message = require('./src/models/Message');
const Booking = require('./src/models/Booking');

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const msgs = await Message.find({}).sort({ createdAt: -1 }).limit(10).populate('sender', 'email name');
        console.log('--- RECENT MESSAGES ---');
        for (const m of msgs) {
            const b = await Booking.findById(m.bookingId);
            console.log(`Msg: ${m.message}`);
            console.log(`Sender: ${m.sender?.email} (${m.sender?._id})`);
            console.log(`Booking: ${m.bookingId} | Status: ${b?.status} | Type: ${b?.type}`);
            console.log('---');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
inspect();
