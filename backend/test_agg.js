const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

async function test() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/fiturday');
        
        const revenueStats = await Payment.aggregate([
            { $match: { status: { $in: ['Captured', 'Refunded'] } } },
            { $group: { 
                _id: null, 
                grossRevenue: { $sum: "$amount" },
                netRevenue: { 
                    $sum: { $cond: [{ $eq: ["$status", "Captured"] }, "$amount", 0] } 
                },
                totalRefunded: { 
                    $sum: { $cond: [{ $eq: ["$status", "Refunded"] }, "$amount", 0] } 
                }
            } }
        ]);
        console.log('REVENUE STATS:', JSON.stringify(revenueStats, null, 2));

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyData = await Payment.aggregate([
            { $match: { 
                status: 'Captured', 
                createdAt: { $gte: sixMonthsAgo } 
            } },
            { $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$amount" }
            } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        console.log('MONTHLY DATA:', JSON.stringify(monthlyData, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
