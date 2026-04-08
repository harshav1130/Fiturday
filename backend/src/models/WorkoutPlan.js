const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance'], required: true },
    weeklySplit: { type: String },
    exercises: [{
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        restTime: { type: Number, default: 60 } // in seconds
    }]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
