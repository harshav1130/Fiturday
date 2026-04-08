const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, getTrainerBookings, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, getUserBookings);

router.route('/my-bookings')
    .get(protect, getUserBookings);

router.route('/trainer')
    .get(protect, getTrainerBookings);

router.route('/:id')
    .delete(protect, deleteBooking);

router.route('/:id/cancel')
    .put(protect, cancelBooking);

module.exports = router;
