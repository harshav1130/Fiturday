const mongoose = require('mongoose');
require('dotenv').config({ path: 'v:/FITURDAY/backend/.env' });
const User = require('v:/FITURDAY/backend/src/models/User');

async function checkUser() {
    console.log('Connecting to check user...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', mongoose.connection.name);

        const adminEmail = 'admin@fiturday.com';
        const user = await User.findOne({ email: adminEmail });
        
        if (user) {
            console.log('User Found:', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                passwordHashPrefix: user.password.substring(0, 10)
            });
        } else {
            console.log('User NOT FOUND in database:', mongoose.connection.name);
            const users = await User.find({});
            console.log('Total users in DB:', users.length);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}

checkUser();
