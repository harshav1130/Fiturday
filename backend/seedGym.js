const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./src/models/User');
const Gym = require('./src/models/Gym');
const Trainer = require('./src/models/Trainer');
const Slot = require('./src/models/Slot');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fiturday';

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Database. Beginning seeding...');

        // 1. Create a Mock Gym Owner
        const ownerPassword = await bcrypt.hash('owner123', 10);
        let owner = await User.findOne({ email: 'owner@fiturday.com' });
        if (!owner) {
            owner = new User({
                name: 'Test Gym Owner',
                email: 'owner@fiturday.com',
                password: ownerPassword,
                role: 'Gym Owner'
            });
            await owner.save();
            console.log('Created Mock Gym Owner');
        }

        // 2. Create a Mock Gym (Central location for testing map - eg. New York)
        let gym = await Gym.findOne({ name: 'Iron Paradise Fitness' });
        if (!gym) {
            gym = new Gym({
                name: 'Iron Paradise Fitness',
                ownerId: owner._id,
                description: 'A premium fitness facility with state of the art equipment and expert trainers.',
                location: {
                    type: 'Point',
                    coordinates: [-73.9851, 40.7589] // Times Square NY long, lat mapping
                },
                amenities: ['Showers', 'Sauna', 'Locker Room', 'Free Weights'],
                pricePerMonth: 89.99
                // rating and reviewsCount default to 0 — set by real user reviews
            });
            await gym.save();
            console.log('Created Mock Gym: Iron Paradise Fitness');
        }

        // 3. Create a Mock Trainer
        const trainerPassword = await bcrypt.hash('trainer123', 10);
        let trainerUser = await User.findOne({ email: 'trainer@fiturday.com' });
        if (!trainerUser) {
            trainerUser = new User({
                name: 'Jack The Ripper (Abs)',
                email: 'trainer@fiturday.com',
                password: trainerPassword,
                role: 'Trainer'
            });
            await trainerUser.save();
        }

        let trainerProfile = await Trainer.findOne({ userId: trainerUser._id });
        if (!trainerProfile) {
            trainerProfile = new Trainer({
                userId: trainerUser._id,
                bio: 'Specializing in high intensity interval training and core sculpting.',
                expertise: ['HIIT', 'Weight Loss'],
                certifications: ['ACE Certified', 'CrossFit Level 1'],
                pricePerSession: 50,
                monthlyPrice: 1500
                // rating and reviewsCount default to 0 — set by real user reviews
            });
            await trainerProfile.save();
            console.log('Created Mock Trainer Profile');
        }

        // 4. Create Availability Slots for the Gym (Today + Tomorrow)
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const slotsToCreate = [
            { gymId: gym._id, date: today, startTime: '08:00', endTime: '10:00', capacity: 20 },
            { gymId: gym._id, date: today, startTime: '17:00', endTime: '19:00', capacity: 30 },
            { gymId: gym._id, date: tomorrow, startTime: '06:00', endTime: '08:00', capacity: 15 }
        ];

        for (const slotData of slotsToCreate) {
            const exists = await Slot.findOne({ gymId: gym._id, date: slotData.date, startTime: slotData.startTime });
            if (!exists) {
                await new Slot(slotData).save();
            }
        }
        console.log('Created Mock Slots');

        console.log('Database Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDatabase();
