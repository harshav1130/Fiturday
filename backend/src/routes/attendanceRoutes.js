const express = require('express');
const router = express.Router();
const { checkIn, getMonthlyReport, ownerGetAttendance, ownerMarkAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/checkin', protect, checkIn);
router.get('/report', protect, getMonthlyReport);

// Gym Owner routes
router.get('/gym/:gymId', protect, authorize('Gym Owner', 'Admin'), ownerGetAttendance);
router.post('/gym/mark', protect, authorize('Gym Owner', 'Admin'), ownerMarkAttendance);

module.exports = router;
