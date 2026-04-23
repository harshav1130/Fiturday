const Review = require('../models/Review');
const Trainer = require('../models/Trainer');
const Gym = require('../models/Gym');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');

const addReview = async (req, res) => {
    try {
        const { targetId, targetModel, rating, comment } = req.body;
        
        // Log to a file to be absolutely sure what's going on
        const logData = {
            timestamp: new Date().toISOString(),
            user: { id: req.user._id, email: req.user.email, role: req.user.role },
            body: req.body,
            files: req.files ? req.files.length : 0
        };
        fs.appendFileSync('review_trace.txt', JSON.stringify(logData) + '\n');

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // 1. Verify that the user has a confirmed booking for this target
        console.log('--- REVIEW SUBMISSION ATTEMPT ---');
        console.log('USER_ID_TYPE:', typeof req.user._id);
        console.log('USER_RAW:', JSON.stringify({ id: req.user._id, email: req.user.email, role: req.user.role }));
        console.log('TARGET:', { targetId, targetModel });

        const query = {
            userId: req.user._id,
            status: 'Confirmed'
        };
        if (targetModel === 'Gym') query.gymId = targetId;
        if (targetModel === 'Trainer') query.trainerId = targetId;

        console.log('BOOKING_QUERY:', JSON.stringify(query));
        const confirmedBooking = await Booking.findOne(query);
        console.log('BOOKING_FOUND:', !!confirmedBooking);

        // EXTRA ROBUST ADMIN BYPASS
        const userRole = String(req.user.role || '').trim().toLowerCase();
        const isAdmin = userRole === 'admin' || userRole === 'super' || userRole === 'superadmin'
            || req.user.email === 'admin@fiturday.com' || req.user.email === 'superadmin@fiturday.com';
        
        console.log('VERIFICATION_CHECK:', { 
            hasBooking: !!confirmedBooking, 
            isAdmin, 
            detectedRole: userRole,
            detectedEmail: req.user.email 
        });
        if (!confirmedBooking && !isAdmin) {
            console.log('VERIFICATION_REJECTED: Unauthorized attempt');
            fs.appendFileSync('review_trace.txt', `[REJECTED] User: ${req.user.email}, isAdmin: ${isAdmin}, hasBooking: ${!!confirmedBooking}\n`);
            return res.status(418).json({ // Using 418 for diagnostic purposes
                message: `Verification failed: You must have a confirmed booking to review this ${targetModel.toLowerCase()}`,
                debug: {
                    user: { id: req.user._id, email: req.user.email, role: req.user.role },
                    targetId,
                    targetModel,
                    isAdmin,
                    hasBooking: !!confirmedBooking
                }
            });
        }

        console.log('VERIFICATION_PASSED');

        const existingReview = await Review.findOne({
            userId: req.user._id,
            targetId,
            targetModel
        });

        if (existingReview) {
            return res.status(400).json({ message: `You have already reviewed this ${targetModel}` });
        }

        // Handle Images
        const images = req.files ? req.files.map(file => `/api/uploads/reviews/${file.filename}`) : [];

        const review = await Review.create({
            userId: req.user._id,
            targetId,
            targetModel,
            rating,
            comment,
            images
        });

        // Recalculate average rating
        const allReviews = await Review.find({ targetId, targetModel });
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

        if (targetModel === 'Trainer') {
            await Trainer.findByIdAndUpdate(targetId, {
                rating: avgRating.toFixed(1),
                reviewsCount: allReviews.length
            });
        } else if (targetModel === 'Gym') {
            await Gym.findByIdAndUpdate(targetId, {
                rating: avgRating.toFixed(1),
                reviewsCount: allReviews.length
            });
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReviews = async (req, res) => {
    try {
        const { targetId } = req.params;
        const reviews = await Review.find({ targetId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addReview, getReviews };
