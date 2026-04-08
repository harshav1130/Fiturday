const Trainer = require('../models/Trainer');

const getMyTrainerProfile = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ userId: req.user._id }).populate('userId', 'name email avatar');
        if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTrainerProfile = async (req, res) => {
    try {
        const existingProfile = await Trainer.findOne({ userId: req.user._id });
        if (existingProfile) return res.status(400).json({ message: 'Trainer profile already exists' });

        const { bio, certifications, expertise, monthlyPrice } = req.body;

        const trainer = await Trainer.create({
            userId: req.user._id,
            bio,
            certifications: (certifications && typeof certifications === 'string') ? JSON.parse(certifications) : (certifications || []),
            expertise: (expertise && typeof expertise === 'string') ? JSON.parse(expertise) : (expertise || []),
            monthlyPrice
        });

        res.status(201).json(trainer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrainers = async (req, res) => {
    try {
        const { expertise, maxPrice, search } = req.query;
        let query = {};

        if (expertise) {
            query.expertise = { $in: expertise.split(',') };
        }
        if (maxPrice) {
            query.monthlyPrice = { $lte: parseInt(maxPrice) };
        }

        const trainers = await Trainer.find(query).populate('userId', 'name email avatar');

        // Filter out orphaned records where userId is null
        const validTrainers = trainers.filter(t => t.userId !== null);

        if (search) {
            // Regex match on name which is in populated userId
            const regex = new RegExp(search, 'i');
            const filteredTrainers = validTrainers.filter(t => regex.test(t.userId.name));
            return res.json(filteredTrainers);
        }

        res.json(validTrainers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrainerById = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id)
            .populate('userId', 'name email avatar');
        if (!trainer || !trainer.userId) return res.status(404).json({ message: 'Trainer not found or in-active' });
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTrainerProfile = async (req, res) => {
    try {
        let trainer = await Trainer.findOne({ userId: req.user._id });
        if (!trainer && req.user.role !== 'Admin') {
            return res.status(404).json({ message: 'Trainer profile not found' });
        }

        const updatedData = { ...req.body };
        if (req.body.certifications && typeof req.body.certifications === 'string') {
            updatedData.certifications = JSON.parse(req.body.certifications);
        }
        if (req.body.expertise && typeof req.body.expertise === 'string') {
            updatedData.expertise = JSON.parse(req.body.expertise);
        }

        trainer = await Trainer.findOneAndUpdate({ userId: req.user._id }, updatedData, { new: true });
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTrainerEarnings = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ userId: req.user._id });
        if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });

        const mongoose = require('mongoose');
        const Booking = require('../models/Booking');

        const Slot = require('../models/Slot');
        const trainerSlots = await Slot.find({ trainerId: trainer._id }).select('_id');
        const slotIds = trainerSlots.map(s => s._id);

        // Fetch all confirmed bookings for this trainer
        const bookings = await Booking.find({
            $or: [
                { trainerId: trainer._id },
                { slotId: { $in: slotIds } }
            ],
            status: 'Confirmed'
        }).populate('userId', 'name').sort({ createdAt: -1 });

        // Calculate earnings (each confirmed monthly booking = monthlyPrice)
        const totalEarnings = bookings.reduce((acc, b) => acc + (trainer.monthlyPrice || 0), 0);

        // Map recent transactions
        const recentTransactions = bookings.slice(0, 10).map(b => ({
            id: `TXN-${b._id.toString().substring(18).toUpperCase()}`,
            client: b.userId?.name || 'Unknown Client',
            amount: `+₹${trainer.monthlyPrice.toFixed(2)}`,
            date: new Date(b.createdAt).toLocaleDateString(),
            isOut: false,
            timestamp: b.createdAt
        }));

        res.json({
            readyToWithdraw: totalEarnings, // Rebranded as "Pending Payout" in UI
            totalEarned: totalEarnings,
            totalSessions: bookings.length,
            recentTransactions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrainerClients = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ userId: req.user._id });
        if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });

        const Booking = require('../models/Booking');
        const User = require('../models/User');

        const Slot = require('../models/Slot');
        const trainerSlots = await Slot.find({ trainerId: trainer._id }).select('_id');
        const slotIds = trainerSlots.map(s => s._id);

        // Find all unique users who have a confirmed booking with this trainer
        const clientIds = await Booking.distinct('userId', {
            $or: [
                { trainerId: trainer._id },
                { slotId: { $in: slotIds } }
            ],
            status: 'Confirmed'
        });

        const clients = await User.find({ 
            _id: { $in: clientIds, $ne: req.user._id } 
        }).select('name email avatar');

        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createTrainerProfile, 
    getMyTrainerProfile, 
    getTrainers, 
    getTrainerById, 
    updateTrainerProfile, 
    getTrainerEarnings, 
    getTrainerClients
};
