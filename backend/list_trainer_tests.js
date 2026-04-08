const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');

async function list() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ name: /Trainer Test/i });
        console.log('TRAINER_TEST_USERS:', JSON.stringify(users.map(u => ({
            id: u._id,
            email: u.email,
            name: u.name,
            role: u.role
        })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
list();
