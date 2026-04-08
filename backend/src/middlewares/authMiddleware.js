const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                console.log(`[AUTH FAILED] User not found for ID: ${decoded.id} on ${req.method} ${req.originalUrl || req.url}`);
                return res.status(401).json({ message: 'User not found' });
            }
            console.log(`[AUTH PASSED] ${req.method} ${req.originalUrl || req.url} - User: ${req.user.email} (${req.user.role})`);
            next();
        } catch (error) {
            console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl || req.url}:`, error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log(`[AUTH MISSING] ${req.method} ${req.originalUrl || req.url} - No token found in headers`);
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('AUTHORIZE CHECK:', { user: req.user ? req.user._id : 'N/A', role: req.user ? req.user.role : 'N/A', required: roles });
        if (!req.user || !roles.includes(req.user.role)) {
            console.log('AUTHORIZE FAILED');
            return res.status(403).json({ message: 'Forbidden, insufficient permissions' });
        }
        console.log('AUTHORIZE PASSED');
        next();
    };
};

module.exports = { protect, authorize };
