const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance'], required: true },
    meals: [{
        type: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Pre-Workout', 'Post-Workout'], required: true },
        items: [{ type: String, required: true }],
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fats: { type: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
