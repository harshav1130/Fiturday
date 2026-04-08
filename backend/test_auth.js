const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: 'v:/FITURDAY/backend/.env' });
const User = require('v:/FITURDAY/backend/src/models/User');
const jwt = require('jsonwebtoken');

async function testAuth() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ name: 'Trainer Test' });
        
        if (!user) {
            console.log('User NOT FOUND');
            process.exit(1);
        }

        console.log('User in DB:', { id: user._id, role: user.role });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        try {
            const res = await axios.get('http://localhost:5000/api/trainers/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('SUCCESS:', res.data);
        } catch (err) {
            console.log('FAILED:', err.response?.status, err.response?.data);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testAuth();
