const Gym = require('../models/Gym');

const createGym = async (req, res) => {
    try {
        const { name, description, address, location, amenities, pricePerMonth, pricePerYear, openTime, closeTime } = req.body;
        console.log('[GYM CREATE] Received data:', { name, location: !!location });

        let photos = [];
        if (req.files) {
            photos = req.files.map(file => `/api/uploads/${file.filename}`);
        }

        const parsedLocation = location ? JSON.parse(location) : null;
        
        const gym = await Gym.create({
            name,
            ownerId: req.user._id,
            description,
            address,
            location: parsedLocation ? {
                type: 'Point',
                coordinates: [parsedLocation.lng, parsedLocation.lat]
            } : undefined,
            amenities: amenities ? JSON.parse(amenities) : [],
            photos,
            pricePerMonth: Number(pricePerMonth),
            pricePerYear: Number(pricePerYear),
            openTime,
            closeTime
        });

        res.status(201).json(gym);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGyms = async (req, res) => {
    try {
        const { lng, lat, distance, search, minPrice, maxPrice, rating, amenities } = req.query;
        let query = {};

        // Geospatial search (only if provided)
        if (lng && lat && lng !== 'undefined' && lat !== 'undefined') {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }
                }
            };
            if (distance) {
                query.location.$near.$maxDistance = parseInt(distance);
            }
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.pricePerMonth = {};
            if (minPrice) query.pricePerMonth.$gte = parseInt(minPrice);
            if (maxPrice) query.pricePerMonth.$lte = parseInt(maxPrice);
        }

        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        if (amenities) {
            const amenitiesList = amenities.split(',').map(a => a.trim()).filter(a => a);
            if (amenitiesList.length > 0) {
                query.amenities = { $all: amenitiesList };
            }
        }

        const gyms = await Gym.find(query).populate('ownerId', 'name email');
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGymById = async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id)
            .populate('ownerId', 'name email avatar');
        if (!gym) return res.status(404).json({ message: 'Gym not found' });
        res.json(gym);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGym = async (req, res) => {
    try {
        let gym = await Gym.findById(req.params.id);
        if (!gym) return res.status(404).json({ message: 'Gym not found' });

        console.log('[GYM UPDATE] Request for:', req.params.id, 'User:', req.user._id);

        if (gym.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to update this gym' });
        }

        let newPhotos = [];
        if (req.body.existingPhotos) {
            // If the frontend sends existingPhotos, use them (this allows deletion)
            newPhotos = JSON.parse(req.body.existingPhotos);
        } else {
            // Fallback to current photos if not specified
            newPhotos = gym.photos;
        }

        if (req.files && req.files.length > 0) {
            const uploadedPhotos = req.files.map(file => `/api/uploads/${file.filename}`);
            newPhotos = [...newPhotos, ...uploadedPhotos];
        }

        const updatedData = {
            ...req.body,
            photos: newPhotos
        };

        if (req.body.location) {
            const loc = JSON.parse(req.body.location);
            updatedData.location = {
                type: 'Point',
                coordinates: [loc.lng, loc.lat]
            };
        }
        if (req.body.amenities) {
            updatedData.amenities = JSON.parse(req.body.amenities);
        }

        gym = await Gym.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json(gym);
    } catch (error) {
        console.error('[GYM UPDATE ERROR]:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createGym, getGyms, getGymById, updateGym };
