const express = require('express');
const router = express.Router();
const { getAdminStats, getOwnerStats, getTrainerStats, getUserStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/admin', protect, authorize('Admin'), getAdminStats);
router.get('/owner', protect, authorize('Gym Owner'), getOwnerStats);
router.get('/trainer', protect, authorize('Trainer'), getTrainerStats);
router.get('/user', protect, getUserStats);

module.exports = router;
