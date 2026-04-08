require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true })); // origin: true reflects the request origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Logging Middleware
const fs = require('fs');
app.use((req, res, next) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.headers.authorization ? 'AuthHeaderPresent' : 'NoAuthHeader'}\n`;
    fs.appendFileSync('global_trace.txt', log);
    next();
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
const gymRoutes = require('./src/routes/gymRoutes');
const trainerRoutes = require('./src/routes/trainerRoutes');
const slotRoutes = require('./src/routes/slotRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const userRoutes = require('./src/routes/userRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/api', (req, res) => {
    res.json({ message: 'Fit ur Day API is running...', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// Serve frontend SPA fallback
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.use((req, res) => {
    if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
        res.sendFile(path.join(frontendDist, 'index.html'));
    } else {
        res.status(404).json({ message: 'Frontend build not found' });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        const startCronJobs = require('./src/cronJobs');
        startCronJobs();

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Socket.io Setup
        const io = require('socket.io')(server, {
            cors: {
                origin: ["http://localhost:5173", "http://localhost:5000"],
                methods: ["GET", "POST"]
            }
        });

        app.set('socketio', io);
        global.io = io;

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join_chat', (bookingId) => {
                socket.join(bookingId);
                console.log(`User joined chat: ${bookingId}`);
            });

            socket.on('join_user', (userId) => {
                socket.join(userId);
                console.log(`User joined private room: ${userId}`);
            });

            socket.on('send_message', (data) => {
                socket.to(data.bookingId).emit('receive_message', data);
                if (data.receiverId) {
                    socket.to(data.receiverId).emit('new_notification', data);
                }
            });

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
