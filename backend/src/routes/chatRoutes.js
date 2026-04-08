const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage, uploadChatFile } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(protect);

router.get('/:bookingId', getChatHistory);
router.post('/', sendMessage);
router.post('/upload', upload.single('media'), uploadChatFile);

module.exports = router;
