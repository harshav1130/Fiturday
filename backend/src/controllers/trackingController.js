const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const ProgressLog = require('../models/ProgressLog');

const assignWorkoutPlan = async (req, res) => {
    try {
        const targetUserId = (req.user.role === 'Trainer' || req.user.role === 'Admin') ? (req.body.userId || req.user._id) : req.user._id;
        const plan = await WorkoutPlan.create({ ...req.body, userId: targetUserId });
        res.status(201).json(plan);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const assignDietPlan = async (req, res) => {
    try {
        const targetUserId = (req.user.role === 'Trainer' || req.user.role === 'Admin') ? (req.body.userId || req.user._id) : req.user._id;
        const plan = await DietPlan.create({ ...req.body, userId: targetUserId });
        res.status(201).json(plan);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const logProgress = async (req, res) => {
    try {
        const log = await ProgressLog.create({ ...req.body, userId: req.user._id, date: new Date() });
        res.status(201).json(log);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProgress = async (req, res) => {
    try {
        const logs = await ProgressLog.find({ userId: req.user._id }).sort({ date: 1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getClientProgress = async (req, res) => {
    try {
        const logs = await ProgressLog.find({ userId: req.params.userId }).sort({ date: 1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(plan);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyDietPlan = async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(plan);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getClientWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(plan);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getClientDietPlan = async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(plan);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteWorkoutPlan = async (req, res) => {
    try {
        await WorkoutPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Workout plan deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteDietPlan = async (req, res) => {
    try {
        await DietPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Diet plan deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { 
    assignWorkoutPlan, 
    assignDietPlan, 
    logProgress, 
    getProgress, 
    getClientProgress, 
    getMyWorkoutPlan, 
    getMyDietPlan, 
    getClientWorkoutPlan, 
    getClientDietPlan,
    deleteWorkoutPlan,
    deleteDietPlan
};
