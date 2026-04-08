const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const Trainer = require('./src/models/Trainer');

async function check() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        console.log('Connecting to URI:', uri);
        await mongoose.connect(uri);
        console.log('Connected.');

        const user = await User.findOne({ name: 'Trainer Test' });
        console.log('User found:', JSON.stringify(user, null, 2));

        if (user) {
            const trainer = await Trainer.findOne({ userId: user._id });
            console.log('Trainer profile found:', JSON.stringify(trainer, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
