const Slot = require('../models/Slot');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');

const createSlot = async (req, res) => {
    try {
        const { gymId, trainerId, date, startTime, endTime, capacity } = req.body;

        if (!gymId && !trainerId) {
            return res.status(400).json({ message: 'Must provide either gymId or trainerId' });
        }

        if (gymId) {
            const gym = await Gym.findById(gymId);
            if (!gym) return res.status(404).json({ message: 'Gym not found' });

            if (gym.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to create slots for this gym' });
            }
        }

        if (trainerId) {
            // Normally capacity for a trainer is 1
            const trainer = await Trainer.findById(trainerId);
            if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

            if (trainer.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to create slots for this trainer' });
            }
        }

        const slot = await Slot.create({
            gymId, trainerId, date, startTime, endTime, capacity
        });

        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSlotsByGym = async (req, res) => {
    try {
        const { gymId } = req.params;
        const { date } = req.query; // optional filter by YYYY-MM-DD
        let query = { gymId };

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const slots = await Slot.find(query).sort({ date: 1, startTime: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSlotsByTrainer = async (req, res) => {
    try {
        const { trainerId } = req.params;
        const { date } = req.query;
        let query = { trainerId };

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const slots = await Slot.find(query).sort({ date: 1, startTime: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await Slot.findById(id).populate('gymId trainerId');
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.gymId && slot.gymId.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (slot.trainerId && slot.trainerId.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedSlot = await Slot.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedSlot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSlot, getSlotsByGym, getSlotsByTrainer, updateSlot };
