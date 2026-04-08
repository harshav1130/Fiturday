const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

async function check() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/fiturday');
        
        const stats = await Payment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
        ]);
        console.log('STATS:', JSON.stringify(stats, null, 2));

        const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(10);
        console.log('RECENT PAYMENTS:', JSON.stringify(recentPayments, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
