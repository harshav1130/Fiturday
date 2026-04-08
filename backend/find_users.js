const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const u1 = await User.findOne({ name: /Trainer Test/i });
        const u2 = await User.findOne({ name: /Harsha/i });
        
        console.log('Trainer:', u1 ? {id: u1._id, name: u1.name, role: u1.role} : 'NOT_FOUND');
        console.log('Member:', u2 ? {id: u2._id, name: u2.name, role: u2.role} : 'NOT_FOUND');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
