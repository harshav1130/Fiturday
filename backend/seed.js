require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to seed data...');

        // Clear existing users
        await User.deleteMany();
        console.log('Cleared existing users');

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const ownerPassword = await bcrypt.hash('owner123', salt);
        const trainerPassword = await bcrypt.hash('trainer123', salt);
        const userPassword = await bcrypt.hash('user123', salt);

        const users = [
            {
                name: 'System Admin',
                email: 'admin@fiturday.com',
                password: adminPassword,
                role: 'Admin'
            },
            {
                name: 'Gym Owner Test',
                email: 'owner@fiturday.com',
                password: ownerPassword,
                role: 'Gym Owner'
            },
            {
                name: 'Trainer Test',
                email: 'trainer@fiturday.com',
                password: trainerPassword,
                role: 'Trainer'
            },
            {
                name: 'Regular User',
                email: 'user@fiturday.com',
                password: userPassword,
                role: 'User'
            }
        ];

        await User.insertMany(users);
        console.log('Seed: Inserted 4 test users successfully! (admin@fiturday.com, owner... trainer... user...)');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedUsers();
