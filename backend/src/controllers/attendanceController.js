const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

const checkIn = async (req, res) => {
    try {
        const { gymId } = req.body;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingCheckIn = await Attendance.findOne({
            userId: req.user._id,
            date: { $gte: startOfDay }
        });

        if (existingCheckIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const attendance = await Attendance.create({
            userId: req.user._id,
            gymId,
            date: new Date(),
            checkInTime: new Date()
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthlyReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const d = new Date();
        d.setDate(1); d.setHours(0, 0, 0, 0);

        // Fetch user's attendance this month
        const attendances = await Attendance.find({
            userId,
            date: { $gte: d },
            status: 'Present'
        });

        // Calculate theoretical gym working days so far this month (naive approach: days elapsed)
        const today = new Date();
        const daysElapsed = today.getDate();

        const attendancePercentage = daysElapsed > 0 ? (attendances.length / daysElapsed) * 100 : 0;

        res.json({
            attendances,
            count: attendances.length,
            percentage: attendancePercentage.toFixed(1)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const ownerGetAttendance = async (req, res) => {
    try {
        const { gymId } = req.params;

        // Optional date filter
        const queryDateStr = req.query.date;
        let queryDate = new Date();
        if (queryDateStr) queryDate = new Date(queryDateStr);

        queryDate.setHours(0, 0, 0, 0);

        const attendances = await Attendance.find({
            gymId,
            date: queryDate
        }).populate('userId', 'name email');

        // Build stats for charts (mock logic for weekly/monthly for now - can optimize later)
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const last7DaysEvents = await Attendance.aggregate([
            { $match: { gymId: new mongoose.Types.ObjectId(gymId), date: { $gte: d }, status: 'Present' } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            today: attendances,
            weeklyTrend: last7DaysEvents
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const ownerMarkAttendance = async (req, res) => {
    try {
        const { gymId, targetUserId, status } = req.body;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Check if record exists
        let attendance = await Attendance.findOne({
            userId: targetUserId,
            gymId,
            date: startOfDay
        });

        if (attendance) {
            attendance.status = status;
            if (status === 'Present' && !attendance.checkInTime) attendance.checkInTime = new Date();
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                userId: targetUserId,
                gymId,
                date: startOfDay,
                checkInTime: status === 'Present' ? new Date() : null,
                status
            });
        }

        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkIn, getMonthlyReport, ownerGetAttendance, ownerMarkAttendance };
