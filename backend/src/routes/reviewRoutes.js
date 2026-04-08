const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/reviews/');
    },
    filename: (req, file, cb) => {
        cb(null, `review-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.route('/')
    .post(protect, upload.array('images', 5), addReview);

router.route('/:targetId')
    .get(getReviews);

module.exports = router;
