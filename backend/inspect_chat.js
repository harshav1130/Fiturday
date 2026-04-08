const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Message = require('./src/models/Message');
const User = require('./src/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bookingId = '69b6bc8ef570efe77f2ce2a'; // From previous check_messages
        const messages = await Message.find({ bookingId })
            .populate('sender', 'name avatar role email');
        
        console.log('POPULATED_MESSAGES:', JSON.stringify(messages, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
