const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Message = require('./src/models/Message');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const messages = await Message.find({}).sort({ createdAt: -1 }).limit(5);
        console.log('RECENT_MESSAGES:', JSON.stringify(messages, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
