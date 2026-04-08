const express = require('express');
const router = express.Router();
const { createSlot, getSlotsByGym, getSlotsByTrainer, updateSlot } = require('../controllers/slotController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Gym Owner', 'Admin', 'Trainer'), createSlot);

router.route('/gym/:gymId')
    .get(getSlotsByGym);

router.route('/trainer/:trainerId')
    .get(getSlotsByTrainer);

router.route('/:id')
    .put(protect, authorize('Gym Owner', 'Admin', 'Trainer'), updateSlot);

module.exports = router;
