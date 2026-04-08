const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, refundPayment, getMyPayments, getAllPayments, getPaymentMethods, addPaymentMethod, deletePaymentMethod } = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/orders', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-payments', protect, getMyPayments);

router.get('/all', protect, authorize('Admin'), getAllPayments);
router.post('/refund/:id', protect, authorize('Admin'), refundPayment);

// Management Routes
router.get('/methods', protect, getPaymentMethods);
router.post('/methods', protect, addPaymentMethod);
router.delete('/methods/:id', protect, deletePaymentMethod);

module.exports = router;
