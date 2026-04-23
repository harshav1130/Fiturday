const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const dir = path.join(__dirname, '../../uploads/reviews');
            const fs = require('fs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        } catch (error) {
            console.error('Multer destination error:', error);
            cb(error, null);
        }
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
