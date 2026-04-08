const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: 'v:/FITURDAY/backend/.env' });
const User = require('v:/FITURDAY/backend/src/models/User');

async function verifyLogin() {
    console.log('Testing manual login verification...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const email = 'admin@fiturday.com';
        const passwordPlain = 'admin123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('USER NOT FOUND');
            process.exit(1);
        }

        const isMatch = await bcrypt.compare(passwordPlain, user.password);
        console.log('Email:', email);
        console.log('Password Try:', passwordPlain);
        console.log('Is Password Match:', isMatch);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err.message);
        process.exit(1);
    }
}

verifyLogin();
