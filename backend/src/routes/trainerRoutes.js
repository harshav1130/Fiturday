const express = require('express');
const router = express.Router();
const { 
    createTrainerProfile, 
    getMyTrainerProfile, 
    getTrainers, 
    getTrainerById, 
    updateTrainerProfile, 
    getTrainerEarnings, 
    getTrainerClients
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getTrainers)
    .post(protect, authorize('Trainer'), createTrainerProfile);

router.route('/profile') // specific route for trainer managing their own profile
    .get(protect, /* authorize('Trainer'), */ getMyTrainerProfile)
    .put(protect, authorize('Trainer'), updateTrainerProfile);

router.route('/earnings')
    .get(protect, authorize('Trainer'), getTrainerEarnings);

router.route('/clients')
    .get(protect, authorize('Trainer'), getTrainerClients);

router.route('/:id')
    .get(getTrainerById);

module.exports = router;
