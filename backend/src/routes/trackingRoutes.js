const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/workout', protect, assignWorkoutPlan);
router.get('/workout', protect, getMyWorkoutPlan);
router.get('/client/:userId/workout', protect, authorize('Trainer', 'Admin'), getClientWorkoutPlan);
router.delete('/workout/:id', protect, authorize('Trainer', 'Admin'), deleteWorkoutPlan);

router.post('/diet', protect, assignDietPlan);
router.get('/diet', protect, getMyDietPlan);
router.get('/client/:userId/diet', protect, authorize('Trainer', 'Admin'), getClientDietPlan);
router.delete('/diet/:id', protect, authorize('Trainer', 'Admin'), deleteDietPlan);
router.post('/progress', protect, logProgress);
router.get('/progress', protect, getProgress);
router.get('/client/:userId', protect, authorize('Trainer', 'Admin'), getClientProgress);

module.exports = router;
