const express = require('express');
const router = express.Router();
const { createGym, getGyms, getGymById, updateGym } = require('../controllers/gymController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .get(getGyms)
    .post(protect, authorize('Gym Owner', 'Admin'), upload.array('photos', 5), createGym);

router.route('/:id')
    .get(getGymById)
    .put(protect, authorize('Gym Owner', 'Admin'), upload.array('photos', 5), updateGym);

module.exports = router;
