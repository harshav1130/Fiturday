const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: 'v:/FITURDAY/backend/.env' });
const User = require('v:/FITURDAY/backend/src/models/User');

async function seedAdmin() {
    console.log('Connecting to MongoDB Atlas to seed Admin...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const adminEmail = 'admin@fiturday.com';
        const adminPassword = 'admin123';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'Admin'
            });
            console.log('******************************************');
            console.log('ADMIN CREATED SUCCESSFULLY!');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
            console.log('******************************************');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
}

seedAdmin();
