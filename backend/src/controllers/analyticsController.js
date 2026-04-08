const User = require('../models/User');
const Gym = require('../models/Gym');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Trainer = require('../models/Trainer');

// Helper to get 6-month trend labels and merge real data
const getMonthlyTrend = async (matchQuery) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trend = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trend.push({
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            name: monthNames[d.getMonth()],
            revenue: 0
        });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlyData = await Payment.aggregate([
        { $match: { 
            ...matchQuery,
            status: 'Captured', 
            createdAt: { $gte: sixMonthsAgo } 
        } },
        { $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            revenue: { $sum: "$amount" }
        } }
    ]);

    return trend.map(t => {
        const match = monthlyData.find(m => m._id.month === t.month && m._id.year === t.year);
        return {
            name: t.name,
            revenue: match ? match.revenue : 0
        };
    });
};

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalGyms = await Gym.countDocuments();

        // Revenue Aggregation
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

        const stats = revenueStats[0] || { grossRevenue: 0, netRevenue: 0, totalRefunded: 0 };
        const monthlyData = await getMonthlyTrend({});

        res.json({
            totalUsers,
            totalGyms,
            totalRevenue: stats.grossRevenue,
            netRevenue: stats.netRevenue,
            totalRefunded: stats.totalRefunded,
            monthlyData
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getOwnerStats = async (req, res) => {
    try {
        const gyms = await Gym.find({ ownerId: req.user._id }).select('_id');
        const gymIds = gyms.map(g => g._id);

        const slots = await Slot.find({ gymId: { $in: gymIds } }).select('_id');
        const slotIds = slots.map(s => s._id);

        // Aggegate Owner Revenue
        // 1. Session Bookings (via slots)
        // 2. Membership Bookings (direct gymId reference)
        const bookings = await Booking.find({ 
            $or: [
                { slotId: { $in: slotIds } },
                { gymId: { $in: gymIds } }
            ], 
            status: 'Confirmed' 
        }).select('paymentId');
        
        const paymentIds = bookings.map(b => b.paymentId).filter(id => id);

        const revenueAgg = await Payment.aggregate([
            { $match: { _id: { $in: paymentIds }, status: 'Captured' } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        const ownerRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

        console.log('--- REVENUE CALCULATION DETAILS ---');
        console.log('User ID:', req.user._id);
        console.log('Gym IDs Found:', gymIds.length, gymIds);
        console.log('Slots Found:', slotIds.length);
        console.log('Confirmed Bookings Found:', bookings.length);
        console.log('Payment IDs to check:', paymentIds.length, paymentIds);
        console.log('Total Owner Revenue:', ownerRevenue);

        const monthlyData = await getMonthlyTrend({ _id: { $in: paymentIds } });
        const totalConfirmedBookings = await Booking.countDocuments({ 
            $or: [
                { slotId: { $in: slotIds } },
                { gymId: { $in: gymIds } }
            ], 
            status: 'Confirmed' 
        });

        res.json({
            totalGyms: gymIds.length,
            totalSlots: slotIds.length,
            totalConfirmedBookings,
            ownerRevenue,
            monthlyData
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTrainerStats = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ userId: req.user._id });
        if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

        const bookings = await Booking.find({ trainerId: trainer._id, status: 'Confirmed' }).select('paymentId');
        const paymentIds = bookings.map(b => b.paymentId).filter(id => id);

        const revenueAgg = await Payment.aggregate([
            { $match: { _id: { $in: paymentIds }, status: 'Captured' } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        const trainerRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

        const monthlyData = await getMonthlyTrend({ _id: { $in: paymentIds } });
        const totalBookings = await Booking.countDocuments({ trainerId: trainer._id, status: 'Confirmed' });

        res.json({
            totalBookings,
            trainerRevenue,
            monthlyData
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getUserStats = async (req, res) => {
    try {
        const bookings = await Booking.countDocuments({ userId: req.user._id, status: 'Confirmed' });
        res.json({ totalBookings: bookings });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAdminStats, getOwnerStats, getTrainerStats, getUserStats };
