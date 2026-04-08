require('dotenv').config();
const mongoose = require('mongoose');
const Gym = require('./src/models/Gym');
const Trainer = require('./src/models/Trainer');
const Review = require('./src/models/Review');

const fixFakeReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB. Starting fake review cleanup...\n');

        // ─── GYMS ────────────────────────────────────────────────────────────
        const gyms = await Gym.find({});
        console.log(`Found ${gyms.length} gym(s). Recalculating ratings...\n`);

        for (const gym of gyms) {
            const realReviews = await Review.find({ targetId: gym._id, targetModel: 'Gym' });
            const count = realReviews.length;
            const avg = count > 0
                ? (realReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
                : 0;

            console.log(`  Gym: "${gym.name}"`);
            console.log(`    Old → rating: ${gym.rating}, reviewsCount: ${gym.reviewsCount}`);
            console.log(`    New → rating: ${avg},  reviewsCount: ${count} (from ${count} real review docs)`);

            await Gym.findByIdAndUpdate(gym._id, { rating: avg, reviewsCount: count });
        }

        // ─── TRAINERS ─────────────────────────────────────────────────────────
        const trainers = await Trainer.find({});
        console.log(`\nFound ${trainers.length} trainer(s). Recalculating ratings...\n`);

        for (const trainer of trainers) {
            const realReviews = await Review.find({ targetId: trainer._id, targetModel: 'Trainer' });
            const count = realReviews.length;
            const avg = count > 0
                ? (realReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
                : 0;

            console.log(`  Trainer ID: ${trainer._id}`);
            console.log(`    Old → rating: ${trainer.rating}, reviewsCount: ${trainer.reviewsCount}`);
            console.log(`    New → rating: ${avg},  reviewsCount: ${count} (from ${count} real review docs)`);

            await Trainer.findByIdAndUpdate(trainer._id, { rating: avg, reviewsCount: count });
        }

        // ─── ORPHAN REVIEWS ───────────────────────────────────────────────────
        const totalReviews = await Review.countDocuments();
        console.log(`\nTotal Review documents in DB: ${totalReviews}`);

        console.log('\n✅ Done. All ratings now reflect real user reviews only.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixFakeReviews();
